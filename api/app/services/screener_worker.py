"""
Screener Worker for background scoring and caching.
Periodically fetches coins from CoinGecko, computes composite scores, and caches results.
"""
import os
import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from .coingecko_client import CoinGeckoClient
from .composite_scorer import CompositeScorer
from .liquidity_engine import LiquidityEngine
from .redis_cache import RedisCache

logger = logging.getLogger(__name__)


class ScreenerWorker:
    """
    Background worker that:
    1. Fetches coins from CoinGecko in batches
    2. Computes composite scores with all features
    3. Caches results in Redis for fast API responses
    4. Computes cross-exchange counts (rate-limited)
    """
    
    def __init__(self):
        self.coingecko = CoinGeckoClient()
        self.scorer = CompositeScorer()
        self.liquidity = LiquidityEngine()
        self.cache = RedisCache()
        
        self.use_mock_data = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
        self.fast_refresh_seconds = int(os.getenv("MOMENTUM_FAST_REFRESH_SECONDS", 30))
        self.full_refresh_seconds = int(os.getenv("MOMENTUM_FULL_REFRESH_SECONDS", 300))
        self.top_n_fast = int(os.getenv("MOMENTUM_TOP_N_FAST", 100))
        
        self.running = False
        self.last_full_refresh = None
        
        logger.info(f"ScreenerWorker initialized: fast_refresh={self.fast_refresh_seconds}s, "
                   f"full_refresh={self.full_refresh_seconds}s, use_mock={self.use_mock_data}")
    
    async def start(self):
        """Start the background worker."""
        if self.running:
            logger.warning("ScreenerWorker already running")
            return
        
        self.running = True
        logger.info("ScreenerWorker started")
        
        await self.full_refresh()
        
        asyncio.create_task(self._fast_refresh_loop())
        asyncio.create_task(self._full_refresh_loop())
    
    async def stop(self):
        """Stop the background worker."""
        self.running = False
        logger.info("ScreenerWorker stopped")
    
    async def _fast_refresh_loop(self):
        """Fast refresh loop for top coins."""
        while self.running:
            try:
                await asyncio.sleep(self.fast_refresh_seconds)
                await self.fast_refresh()
            except Exception as e:
                logger.error(f"Error in fast refresh loop: {e}", exc_info=True)
                await asyncio.sleep(10)
    
    async def _full_refresh_loop(self):
        """Full refresh loop for all coins."""
        while self.running:
            try:
                await asyncio.sleep(self.full_refresh_seconds)
                await self.full_refresh()
            except Exception as e:
                logger.error(f"Error in full refresh loop: {e}", exc_info=True)
                await asyncio.sleep(30)
    
    async def fast_refresh(self):
        """
        Fast refresh: Update top N coins only.
        """
        try:
            logger.info(f"Fast refresh: updating top {self.top_n_fast} coins")
            
            coins = await self.coingecko.get_coins_markets(page=1, per_page=self.top_n_fast, sparkline=True)
            
            scored_coins = []
            for coin in coins:
                try:
                    scored_coin = await self._score_coin(coin, db=None)
                    scored_coins.append(scored_coin)
                except Exception as e:
                    logger.error(f"Error scoring {coin.get('symbol')}: {e}")
            
            await self.cache.set_scored_coins(scored_coins)
            
            logger.info(f"Fast refresh complete: {len(scored_coins)} coins updated")
            
        except Exception as e:
            logger.error(f"Error in fast refresh: {e}", exc_info=True)
    
    async def full_refresh(self):
        """
        Full refresh: Update entire universe in batches.
        """
        try:
            logger.info("Full refresh: updating entire coin universe")
            start_time = datetime.utcnow()
            
            all_scored_coins = []
            page = 1
            max_pages = 10  # Limit to top 2500 coins (250 per page)
            
            while page <= max_pages:
                try:
                    coins = await self.coingecko.get_coins_markets(page=page, per_page=250, sparkline=True)
                    
                    if not coins:
                        break
                    
                    for coin in coins:
                        try:
                            scored_coin = await self._score_coin(coin, db=None)
                            all_scored_coins.append(scored_coin)
                        except Exception as e:
                            logger.error(f"Error scoring {coin.get('symbol')}: {e}")
                    
                    logger.info(f"Full refresh: page {page} complete ({len(all_scored_coins)} total)")
                    page += 1
                    
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error fetching page {page}: {e}")
                    break
            
            await self.cache.set_scored_coins(all_scored_coins)
            
            self.last_full_refresh = datetime.utcnow()
            duration = (self.last_full_refresh - start_time).total_seconds()
            
            logger.info(f"Full refresh complete: {len(all_scored_coins)} coins updated in {duration:.1f}s")
            
        except Exception as e:
            logger.error(f"Error in full refresh: {e}", exc_info=True)
    
    async def _score_coin(self, coin: Dict[str, Any], db: Optional[Any]) -> Dict[str, Any]:
        """
        Score a single coin with all features.
        
        Args:
            coin: Coin data from CoinGecko
            db: Database connection (optional, for orderbook data)
            
        Returns:
            Scored coin dictionary
        """
        try:
            symbol = coin.get("symbol", "").upper()
            coin_id = coin.get("id", "")
            
            market_cap = coin.get("market_cap", 0) or 0
            total_volume = coin.get("total_volume", 0) or 0
            price_change_1h = coin.get("price_change_percentage_1h", 0) or 0
            price_change_24h = coin.get("price_change_percentage_24h", 0) or 0
            price_change_7d = coin.get("price_change_percentage_7d", 0) or 0
            
            if self.use_mock_data:
                features = self.scorer.generate_mock_features(symbol, coin)
                liquidity_data = self.liquidity.generate_mock_liquidity(symbol, market_cap, total_volume)
            else:
                
                price_change_4h = (price_change_1h + price_change_24h) / 2  # Rough estimate
                
                vol_ratio = 1.0  # Default, would need historical volume data
                
                liquidity_data = self.liquidity.generate_mock_liquidity(symbol, market_cap, total_volume)
                
                cross_exchange_count = await self._get_cross_exchange_count(coin_id)
                
                onchain_inflow = 0.0
                
                pretrend_prob = 0.0
                
                features = {
                    "symbol": symbol,
                    "short_return_1h": price_change_1h,
                    "med_return_4h": price_change_4h,
                    "long_return_24h": price_change_24h,
                    "vol_ratio_30m_vs_24h": vol_ratio,
                    "orderbook_imbalance": liquidity_data["orderbook_imbalance"],
                    "liquidity_depth_at_1pct": liquidity_data["liquidity_depth_at_1pct"],
                    "onchain_inflow_30m_usd": onchain_inflow,
                    "cross_exchange_confirmation_count": cross_exchange_count,
                    "pretrend_prob": pretrend_prob,
                    "market_cap": market_cap,
                    "total_volume": total_volume,
                    "liquidity_score": liquidity_data["liquidity_score"]
                }
            
            score_result = self.scorer.compute_score(features, explain=False)
            
            result = {
                "id": coin_id,
                "symbol": symbol,
                "name": coin.get("name", ""),
                "image": coin.get("image", ""),
                "current_price": coin.get("current_price", 0),
                "market_cap": market_cap,
                "market_cap_rank": coin.get("market_cap_rank"),
                "total_volume": total_volume,
                "price_change_percentage_1h": price_change_1h,
                "price_change_percentage_24h": price_change_24h,
                "price_change_percentage_7d": price_change_7d,
                "score": score_result["score"],
                "confidence": score_result["confidence"],
                "top_features": score_result["top_features"],
                "risk_flags": score_result["risk_flags"],
                "why": score_result["why"],
                "liquidity_score": score_result["liquidity_score"],
                "cross_exchange_count": score_result["cross_exchange_count"],
                "sparkline_7d": coin.get("sparkline_in_7d", {}).get("price", [])[-24:] if coin.get("sparkline_in_7d") else [],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error scoring coin {coin.get('symbol', 'unknown')}: {e}", exc_info=True)
            raise
    
    async def _get_cross_exchange_count(self, coin_id: str) -> int:
        """
        Get cross-exchange confirmation count (cached).
        
        Args:
            coin_id: CoinGecko coin ID
            
        Returns:
            Number of exchanges listing the coin
        """
        try:
            cache_key = f"exchange_count:{coin_id}"
            cached = await self.cache.get(cache_key)
            
            if cached:
                return int(cached)
            
            tickers = await self.coingecko.get_tickers(coin_id)
            
            exchanges = set()
            for ticker in tickers:
                target = ticker.get("target", "").upper()
                trust_score = ticker.get("trust_score", "")
                
                if target in ["USD", "USDT", "USDC"] and trust_score in ["green", "yellow"]:
                    exchange_name = ticker.get("market", {}).get("name", "")
                    if exchange_name:
                        exchanges.add(exchange_name)
            
            count = len(exchanges)
            
            await self.cache.set(cache_key, str(count), ttl=900)
            
            return count
            
        except Exception as e:
            logger.error(f"Error getting cross-exchange count for {coin_id}: {e}")
            return 1  # Default fallback

"""
Liquidity Engine for orderbook analysis and slippage estimation.
Computes orderbook_imbalance, liquidity_depth_at_1pct, and estimates slippage.
"""
import os
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np

logger = logging.getLogger(__name__)


class LiquidityEngine:
    """
    Analyze orderbook data to compute liquidity metrics.
    """
    
    def __init__(self):
        self.primary_exchange = os.getenv("PRIMARY_EXCHANGE", "coinbasepro")
        logger.info(f"LiquidityEngine initialized with primary_exchange={self.primary_exchange}")
    
    async def compute_orderbook_imbalance(
        self,
        asset_id: int,
        db
    ) -> float:
        """
        Compute orderbook imbalance from books table.
        
        Imbalance = (sum_bids - sum_asks) / (sum_bids + sum_asks)
        Range: -1 (all asks) to +1 (all bids)
        
        Args:
            asset_id: Asset ID
            db: Database connection
            
        Returns:
            Imbalance value between -1 and 1
        """
        try:
            await db.execute(
                """
                SELECT bid_px, ask_px, bid_sz, ask_sz
                FROM books
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
                """,
                (asset_id,)
            )
            
            book = await db.fetchone()
            
            if not book:
                return 0.0
            
            bid_value = float(book["bid_px"] or 0) * float(book["bid_sz"] or 0)
            ask_value = float(book["ask_px"] or 0) * float(book["ask_sz"] or 0)
            
            total = bid_value + ask_value
            
            if total == 0:
                return 0.0
            
            imbalance = (bid_value - ask_value) / total
            
            return float(np.clip(imbalance, -1, 1))
            
        except Exception as e:
            logger.error(f"Error computing orderbook imbalance for asset {asset_id}: {e}")
            return 0.0
    
    async def compute_liquidity_depth_at_1pct(
        self,
        asset_id: int,
        db
    ) -> float:
        """
        Compute liquidity depth at 1% price impact.
        
        Estimates how much USD can be traded with ≤1% price impact.
        
        Args:
            asset_id: Asset ID
            db: Database connection
            
        Returns:
            Liquidity depth in USD
        """
        try:
            await db.execute(
                """
                SELECT bid_px, ask_px, bid_sz, ask_sz, spread_bps
                FROM books
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
                """,
                (asset_id,)
            )
            
            book = await db.fetchone()
            
            if not book:
                return 0.0
            
            bid_px = float(book["bid_px"] or 0)
            ask_px = float(book["ask_px"] or 0)
            bid_sz = float(book["bid_sz"] or 0)
            ask_sz = float(book["ask_sz"] or 0)
            
            if bid_px == 0 or ask_px == 0:
                return 0.0
            
            
            mid_price = (bid_px + ask_px) / 2
            
            bid_depth = bid_px * bid_sz
            ask_depth = ask_px * ask_sz
            
            depth = (bid_depth + ask_depth) / 2
            
            return float(depth)
            
        except Exception as e:
            logger.error(f"Error computing liquidity depth for asset {asset_id}: {e}")
            return 0.0
    
    def estimate_liquidity_from_volume(
        self,
        market_cap: float,
        volume_24h: float,
        spread_bps: Optional[float] = None
    ) -> Tuple[float, float]:
        """
        Estimate liquidity metrics from market cap and volume when orderbook data is unavailable.
        
        Args:
            market_cap: Market cap in USD
            volume_24h: 24h volume in USD
            spread_bps: Spread in basis points (optional)
            
        Returns:
            Tuple of (liquidity_score, estimated_depth)
        """
        try:
            if market_cap == 0:
                return 0.0, 0.0
            
            volume_ratio = volume_24h / market_cap
            
            
            if volume_ratio > 0.5:
                liquidity_score = 90.0
            elif volume_ratio > 0.3:
                liquidity_score = 80.0
            elif volume_ratio > 0.1:
                liquidity_score = 70.0
            elif volume_ratio > 0.05:
                liquidity_score = 60.0
            else:
                liquidity_score = 50.0
            
            if spread_bps and spread_bps > 100:  # > 1%
                liquidity_score = max(0, liquidity_score - 20)
            elif spread_bps and spread_bps > 50:  # > 0.5%
                liquidity_score = max(0, liquidity_score - 10)
            
            estimated_depth = market_cap * min(volume_ratio, 0.05)
            
            return float(liquidity_score), float(estimated_depth)
            
        except Exception as e:
            logger.error(f"Error estimating liquidity: {e}")
            return 50.0, 0.0
    
    async def estimate_slippage(
        self,
        asset_id: int,
        size_usd: float,
        db
    ) -> float:
        """
        Estimate slippage for a given trade size.
        
        Args:
            asset_id: Asset ID
            size_usd: Trade size in USD
            db: Database connection
            
        Returns:
            Estimated slippage in percentage
        """
        try:
            await db.execute(
                """
                SELECT bid_px, ask_px, bid_sz, ask_sz, spread_bps
                FROM books
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
                """,
                (asset_id,)
            )
            
            book = await db.fetchone()
            
            if not book:
                return 0.5  # Default 0.5%
            
            spread_bps = float(book["spread_bps"] or 50)
            bid_px = float(book["bid_px"] or 0)
            ask_px = float(book["ask_px"] or 0)
            bid_sz = float(book["bid_sz"] or 0)
            ask_sz = float(book["ask_sz"] or 0)
            
            if bid_px == 0 or ask_px == 0:
                return 0.5
            
            bid_liquidity = bid_px * bid_sz
            ask_liquidity = ask_px * ask_sz
            avg_liquidity = (bid_liquidity + ask_liquidity) / 2
            
            base_slippage = spread_bps / 10000  # Convert bps to percentage
            
            if avg_liquidity > 0:
                impact_ratio = size_usd / avg_liquidity
                impact_slippage = impact_ratio * 0.5  # 0.5% per 1x of liquidity
            else:
                impact_slippage = 1.0  # High slippage if no liquidity data
            
            total_slippage = base_slippage + impact_slippage
            
            return float(min(total_slippage, 10.0))  # Cap at 10%
            
        except Exception as e:
            logger.error(f"Error estimating slippage for asset {asset_id}: {e}")
            return 0.5
    
    async def suggest_best_pair(
        self,
        symbol: str,
        size_usd: float,
        db
    ) -> Dict[str, Any]:
        """
        Suggest best exchange and pair for minimal slippage.
        
        For MVP, returns primary exchange. Phase 2 will compare across exchanges.
        
        Args:
            symbol: Coin symbol
            size_usd: Trade size in USD
            db: Database connection
            
        Returns:
            Dict with exchange, pair, and estimated_slippage_pct
        """
        try:
            
            return {
                "exchange": self.primary_exchange,
                "pair": f"{symbol}-USD",
                "estimated_slippage_pct": 0.5  # Default estimate
            }
            
        except Exception as e:
            logger.error(f"Error suggesting pair for {symbol}: {e}")
            return {
                "exchange": self.primary_exchange,
                "pair": f"{symbol}-USD",
                "estimated_slippage_pct": 1.0
            }
    
    def generate_mock_liquidity(self, symbol: str, market_cap: float, volume_24h: float) -> Dict[str, Any]:
        """
        Generate mock liquidity metrics for testing.
        
        Args:
            symbol: Coin symbol
            market_cap: Market cap in USD
            volume_24h: 24h volume in USD
            
        Returns:
            Dict with liquidity metrics
        """
        seed = sum(ord(c) for c in symbol)
        np.random.seed(seed)
        
        liquidity_score, estimated_depth = self.estimate_liquidity_from_volume(
            market_cap, volume_24h, spread_bps=np.random.uniform(10, 100)
        )
        
        return {
            "orderbook_imbalance": float(np.random.normal(0, 0.3)),
            "liquidity_depth_at_1pct": float(estimated_depth),
            "liquidity_score": float(liquidity_score),
            "estimated_slippage_pct": float(np.random.uniform(0.1, 2.0)),
            "suggested_pair": {
                "exchange": self.primary_exchange,
                "pair": f"{symbol}-USD"
            }
        }

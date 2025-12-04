"""
Market Data Engine for GhostQuant

Enterprise-grade market data aggregation with priority-based provider selection:
1. CoinAPI (primary)
2. CoinGecko (secondary/fallback)
3. Static fallback data (emergency only)

Features:
- Automatic failover between providers
- Data normalization across providers
- Caching and rate limiting
- Comprehensive error handling
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass, field

from .coinapi_client import CoinAPIClient, get_coinapi_client
from .coingecko_client import CoinGeckoClient, get_coingecko_client

logger = logging.getLogger(__name__)


# Static fallback data for emergency situations
STATIC_FALLBACK_DATA = {
    "top_movers": {
        "gainers": [
            {"id": "bitcoin", "symbol": "BTC", "name": "Bitcoin", "price": 95000, "change_24h": 2.5, "market_cap": 1800000000000, "volume_24h": 45000000000},
            {"id": "ethereum", "symbol": "ETH", "name": "Ethereum", "price": 3500, "change_24h": 3.2, "market_cap": 420000000000, "volume_24h": 18000000000},
            {"id": "solana", "symbol": "SOL", "name": "Solana", "price": 180, "change_24h": 5.1, "market_cap": 78000000000, "volume_24h": 3500000000},
            {"id": "cardano", "symbol": "ADA", "name": "Cardano", "price": 0.95, "change_24h": 4.2, "market_cap": 33000000000, "volume_24h": 800000000},
            {"id": "avalanche", "symbol": "AVAX", "name": "Avalanche", "price": 42, "change_24h": 6.8, "market_cap": 17000000000, "volume_24h": 650000000},
        ],
        "losers": [
            {"id": "dogecoin", "symbol": "DOGE", "name": "Dogecoin", "price": 0.38, "change_24h": -2.1, "market_cap": 55000000000, "volume_24h": 2100000000},
            {"id": "shiba-inu", "symbol": "SHIB", "name": "Shiba Inu", "price": 0.000024, "change_24h": -3.5, "market_cap": 14000000000, "volume_24h": 450000000},
            {"id": "polkadot", "symbol": "DOT", "name": "Polkadot", "price": 7.5, "change_24h": -1.8, "market_cap": 10500000000, "volume_24h": 320000000},
            {"id": "chainlink", "symbol": "LINK", "name": "Chainlink", "price": 18, "change_24h": -2.3, "market_cap": 10800000000, "volume_24h": 480000000},
            {"id": "uniswap", "symbol": "UNI", "name": "Uniswap", "price": 12, "change_24h": -1.5, "market_cap": 9200000000, "volume_24h": 280000000},
        ]
    },
    "global_metrics": {
        "total_market_cap": 3200000000000,
        "total_volume_24h": 125000000000,
        "btc_dominance": 52.5,
        "eth_dominance": 17.2,
        "active_cryptocurrencies": 12500,
        "markets": 850,
        "market_cap_change_24h": 1.8
    },
    "chains": [
        {"id": "ethereum", "name": "Ethereum", "tvl": 58000000000, "protocols": 850, "change_24h": 2.1},
        {"id": "bsc", "name": "BNB Chain", "tvl": 5200000000, "protocols": 620, "change_24h": 1.5},
        {"id": "solana", "name": "Solana", "tvl": 4800000000, "protocols": 180, "change_24h": 3.2},
        {"id": "arbitrum", "name": "Arbitrum", "tvl": 3200000000, "protocols": 280, "change_24h": 2.8},
        {"id": "polygon", "name": "Polygon", "tvl": 1100000000, "protocols": 420, "change_24h": 1.2},
        {"id": "avalanche", "name": "Avalanche", "tvl": 950000000, "protocols": 210, "change_24h": 4.1},
        {"id": "optimism", "name": "Optimism", "tvl": 850000000, "protocols": 120, "change_24h": 2.5},
        {"id": "base", "name": "Base", "tvl": 720000000, "protocols": 95, "change_24h": 5.2},
    ],
    "assets": [
        {"id": "bitcoin", "symbol": "BTC", "name": "Bitcoin", "price": 95000, "market_cap": 1800000000000, "volume_24h": 45000000000, "change_24h": 2.5, "rank": 1},
        {"id": "ethereum", "symbol": "ETH", "name": "Ethereum", "price": 3500, "market_cap": 420000000000, "volume_24h": 18000000000, "change_24h": 3.2, "rank": 2},
        {"id": "tether", "symbol": "USDT", "name": "Tether", "price": 1.0, "market_cap": 95000000000, "volume_24h": 85000000000, "change_24h": 0.01, "rank": 3},
        {"id": "binancecoin", "symbol": "BNB", "name": "BNB", "price": 620, "market_cap": 95000000000, "volume_24h": 1800000000, "change_24h": 1.8, "rank": 4},
        {"id": "solana", "symbol": "SOL", "name": "Solana", "price": 180, "market_cap": 78000000000, "volume_24h": 3500000000, "change_24h": 5.1, "rank": 5},
        {"id": "xrp", "symbol": "XRP", "name": "XRP", "price": 2.35, "market_cap": 135000000000, "volume_24h": 12000000000, "change_24h": 4.2, "rank": 6},
        {"id": "usd-coin", "symbol": "USDC", "name": "USD Coin", "price": 1.0, "market_cap": 42000000000, "volume_24h": 8500000000, "change_24h": 0.0, "rank": 7},
        {"id": "cardano", "symbol": "ADA", "name": "Cardano", "price": 0.95, "market_cap": 33000000000, "volume_24h": 800000000, "change_24h": 4.2, "rank": 8},
        {"id": "dogecoin", "symbol": "DOGE", "name": "Dogecoin", "price": 0.38, "market_cap": 55000000000, "volume_24h": 2100000000, "change_24h": -2.1, "rank": 9},
        {"id": "avalanche", "symbol": "AVAX", "name": "Avalanche", "price": 42, "market_cap": 17000000000, "volume_24h": 650000000, "change_24h": 6.8, "rank": 10},
    ]
}


@dataclass
class ProviderStatus:
    """Track provider health status."""
    name: str
    is_healthy: bool = True
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    consecutive_failures: int = 0
    
    def record_success(self):
        self.is_healthy = True
        self.last_success = datetime.utcnow()
        self.consecutive_failures = 0
    
    def record_failure(self):
        self.last_failure = datetime.utcnow()
        self.consecutive_failures += 1
        if self.consecutive_failures >= 3:
            self.is_healthy = False


class MarketDataEngine:
    """
    Enterprise market data engine with priority-based provider selection.
    
    Priority order:
    1. CoinAPI (primary) - comprehensive market data
    2. CoinGecko (secondary) - fallback with good coverage
    3. Static fallback (emergency) - hardcoded data for demo/offline
    """
    
    def __init__(
        self,
        coinapi_client: Optional[CoinAPIClient] = None,
        coingecko_client: Optional[CoinGeckoClient] = None
    ):
        """Initialize market data engine with provider clients."""
        self.coinapi = coinapi_client or get_coinapi_client()
        self.coingecko = coingecko_client or get_coingecko_client()
        
        self.coinapi_status = ProviderStatus(name="CoinAPI")
        self.coingecko_status = ProviderStatus(name="CoinGecko")
    
    def _normalize_coin_data(self, data: Dict[str, Any], source: str) -> Dict[str, Any]:
        """Normalize coin data from different providers to a common format."""
        if source == "coingecko":
            return {
                "id": data.get("id", ""),
                "symbol": data.get("symbol", "").upper(),
                "name": data.get("name", ""),
                "price": data.get("current_price", 0),
                "market_cap": data.get("market_cap", 0),
                "volume_24h": data.get("total_volume", 0),
                "change_24h": data.get("price_change_percentage_24h", 0),
                "change_7d": data.get("price_change_percentage_7d_in_currency", 0),
                "rank": data.get("market_cap_rank", 0),
                "high_24h": data.get("high_24h", 0),
                "low_24h": data.get("low_24h", 0),
                "ath": data.get("ath", 0),
                "ath_change_percentage": data.get("ath_change_percentage", 0),
                "circulating_supply": data.get("circulating_supply", 0),
                "total_supply": data.get("total_supply", 0),
                "image": data.get("image", ""),
                "last_updated": data.get("last_updated", ""),
                "source": "coingecko"
            }
        elif source == "coinapi":
            return {
                "id": data.get("asset_id", "").lower(),
                "symbol": data.get("asset_id", ""),
                "name": data.get("name", ""),
                "price": data.get("price_usd", 0),
                "market_cap": data.get("volume_1day_usd", 0) * 100,  # Estimate
                "volume_24h": data.get("volume_1day_usd", 0),
                "change_24h": 0,  # CoinAPI doesn't provide this directly
                "rank": 0,
                "type_is_crypto": data.get("type_is_crypto", 1),
                "source": "coinapi"
            }
        else:
            return data
    
    async def get_top_movers(self, limit: int = 50) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get top gainers and losers.
        
        Priority: CoinGecko > CoinAPI > Static fallback
        (CoinGecko is better for this specific use case)
        
        Args:
            limit: Number of coins to return in each category
            
        Returns:
            Dictionary with 'gainers' and 'losers' lists
        """
        # Try CoinGecko first (better for top movers)
        try:
            result = await self.coingecko.get_top_movers(limit=limit)
            if result and (result.get("gainers") or result.get("losers")):
                self.coingecko_status.record_success()
                # Normalize the data
                return {
                    "gainers": [self._normalize_coin_data(c, "coingecko") for c in result.get("gainers", [])],
                    "losers": [self._normalize_coin_data(c, "coingecko") for c in result.get("losers", [])]
                }
        except Exception as e:
            logger.warning(f"CoinGecko top_movers failed: {e}")
            self.coingecko_status.record_failure()
        
        # Try CoinAPI as fallback
        try:
            assets = await self.coinapi.get_assets()
            if assets:
                self.coinapi_status.record_success()
                # CoinAPI doesn't have direct top movers, return assets sorted by volume
                normalized = [self._normalize_coin_data(a, "coinapi") for a in assets[:limit*2] if a.get("type_is_crypto")]
                return {
                    "gainers": normalized[:limit//2],
                    "losers": normalized[limit//2:limit]
                }
        except Exception as e:
            logger.warning(f"CoinAPI assets failed: {e}")
            self.coinapi_status.record_failure()
        
        # Return static fallback
        logger.warning("Using static fallback for top_movers")
        return STATIC_FALLBACK_DATA["top_movers"]
    
    async def get_heatmap_data(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get market heatmap data (coins with price changes for visualization).
        
        Args:
            limit: Number of coins to return
            
        Returns:
            List of coins with market data for heatmap
        """
        # Try CoinGecko first
        try:
            coins = await self.coingecko.get_market_cap(per_page=limit)
            if coins:
                self.coingecko_status.record_success()
                return [
                    {
                        "id": c.get("id"),
                        "symbol": c.get("symbol", "").upper(),
                        "name": c.get("name"),
                        "price": c.get("current_price", 0),
                        "market_cap": c.get("market_cap", 0),
                        "volume": c.get("total_volume", 0),
                        "change_24h": c.get("price_change_percentage_24h", 0),
                        "change_7d": c.get("price_change_percentage_7d_in_currency", 0),
                        "rank": c.get("market_cap_rank", 0),
                        "image": c.get("image", "")
                    }
                    for c in coins
                ]
        except Exception as e:
            logger.warning(f"CoinGecko heatmap failed: {e}")
            self.coingecko_status.record_failure()
        
        # Try CoinAPI
        try:
            assets = await self.coinapi.get_assets()
            if assets:
                self.coinapi_status.record_success()
                crypto_assets = [a for a in assets if a.get("type_is_crypto")][:limit]
                return [
                    {
                        "id": a.get("asset_id", "").lower(),
                        "symbol": a.get("asset_id", ""),
                        "name": a.get("name", ""),
                        "price": a.get("price_usd", 0),
                        "market_cap": a.get("volume_1day_usd", 0) * 100,
                        "volume": a.get("volume_1day_usd", 0),
                        "change_24h": 0,
                        "rank": 0
                    }
                    for a in crypto_assets
                ]
        except Exception as e:
            logger.warning(f"CoinAPI heatmap failed: {e}")
            self.coinapi_status.record_failure()
        
        # Static fallback
        logger.warning("Using static fallback for heatmap")
        return STATIC_FALLBACK_DATA["assets"]
    
    async def get_token_screener(
        self,
        sort_by: str = "market_cap",
        order: str = "desc",
        page: int = 1,
        per_page: int = 50,
        min_market_cap: Optional[float] = None,
        min_volume: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Get token screener data with filtering and sorting.
        
        Args:
            sort_by: Field to sort by (market_cap, volume, change_24h)
            order: Sort order (asc, desc)
            page: Page number
            per_page: Results per page
            min_market_cap: Minimum market cap filter
            min_volume: Minimum 24h volume filter
            
        Returns:
            Paginated screener results
        """
        # Try CoinGecko first
        try:
            order_param = f"{sort_by}_{'desc' if order == 'desc' else 'asc'}"
            coins = await self.coingecko.get_market_cap(
                order=order_param,
                per_page=per_page,
                page=page
            )
            if coins:
                self.coingecko_status.record_success()
                
                # Apply filters
                filtered = coins
                if min_market_cap:
                    filtered = [c for c in filtered if (c.get("market_cap") or 0) >= min_market_cap]
                if min_volume:
                    filtered = [c for c in filtered if (c.get("total_volume") or 0) >= min_volume]
                
                return {
                    "results": [self._normalize_coin_data(c, "coingecko") for c in filtered],
                    "page": page,
                    "per_page": per_page,
                    "total": len(filtered),
                    "source": "coingecko"
                }
        except Exception as e:
            logger.warning(f"CoinGecko screener failed: {e}")
            self.coingecko_status.record_failure()
        
        # Try CoinAPI
        try:
            assets = await self.coinapi.get_assets()
            if assets:
                self.coinapi_status.record_success()
                crypto_assets = [a for a in assets if a.get("type_is_crypto")]
                
                # Paginate
                start = (page - 1) * per_page
                end = start + per_page
                paginated = crypto_assets[start:end]
                
                return {
                    "results": [self._normalize_coin_data(a, "coinapi") for a in paginated],
                    "page": page,
                    "per_page": per_page,
                    "total": len(crypto_assets),
                    "source": "coinapi"
                }
        except Exception as e:
            logger.warning(f"CoinAPI screener failed: {e}")
            self.coinapi_status.record_failure()
        
        # Static fallback
        logger.warning("Using static fallback for screener")
        return {
            "results": STATIC_FALLBACK_DATA["assets"],
            "page": 1,
            "per_page": len(STATIC_FALLBACK_DATA["assets"]),
            "total": len(STATIC_FALLBACK_DATA["assets"]),
            "source": "static"
        }
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """
        Get comprehensive market overview.
        
        Returns:
            Market overview with top coins, trending, and statistics
        """
        overview = {
            "top_coins": [],
            "trending": [],
            "global_stats": {},
            "last_updated": datetime.utcnow().isoformat()
        }
        
        # Get top coins
        try:
            coins = await self.coingecko.get_market_cap(per_page=10)
            if coins:
                overview["top_coins"] = [self._normalize_coin_data(c, "coingecko") for c in coins]
                self.coingecko_status.record_success()
        except Exception as e:
            logger.warning(f"Failed to get top coins: {e}")
            overview["top_coins"] = STATIC_FALLBACK_DATA["assets"][:10]
        
        # Get trending
        try:
            trending = await self.coingecko.get_trending()
            if trending:
                overview["trending"] = trending[:10]
        except Exception as e:
            logger.warning(f"Failed to get trending: {e}")
        
        # Get global stats
        try:
            global_data = await self.coingecko.get_global_data()
            if global_data:
                overview["global_stats"] = {
                    "total_market_cap": global_data.get("total_market_cap", {}).get("usd", 0),
                    "total_volume_24h": global_data.get("total_volume", {}).get("usd", 0),
                    "btc_dominance": global_data.get("market_cap_percentage", {}).get("btc", 0),
                    "eth_dominance": global_data.get("market_cap_percentage", {}).get("eth", 0),
                    "active_cryptocurrencies": global_data.get("active_cryptocurrencies", 0),
                    "markets": global_data.get("markets", 0),
                    "market_cap_change_24h": global_data.get("market_cap_change_percentage_24h_usd", 0)
                }
        except Exception as e:
            logger.warning(f"Failed to get global stats: {e}")
            overview["global_stats"] = STATIC_FALLBACK_DATA["global_metrics"]
        
        return overview
    
    async def get_chain_stats(self) -> List[Dict[str, Any]]:
        """
        Get blockchain/chain statistics.
        
        Returns:
            List of chains with TVL and protocol counts
        """
        # CoinGecko doesn't have direct chain TVL data
        # We'll use categories as a proxy or return static data
        try:
            categories = await self.coingecko.get_categories()
            if categories:
                self.coingecko_status.record_success()
                # Filter for chain-related categories
                chain_categories = [
                    c for c in categories 
                    if any(term in c.get("name", "").lower() for term in ["ethereum", "solana", "polygon", "arbitrum", "optimism", "avalanche", "bnb", "base"])
                ]
                if chain_categories:
                    return [
                        {
                            "id": c.get("id", ""),
                            "name": c.get("name", ""),
                            "market_cap": c.get("market_cap", 0),
                            "volume_24h": c.get("volume_24h", 0),
                            "change_24h": c.get("market_cap_change_24h", 0),
                            "top_coins": c.get("top_3_coins", [])
                        }
                        for c in chain_categories[:10]
                    ]
        except Exception as e:
            logger.warning(f"Failed to get chain stats: {e}")
            self.coingecko_status.record_failure()
        
        # Return static fallback
        logger.warning("Using static fallback for chain_stats")
        return STATIC_FALLBACK_DATA["chains"]
    
    async def get_global_metrics(self) -> Dict[str, Any]:
        """
        Get global cryptocurrency market metrics.
        
        Returns:
            Global market statistics
        """
        # Try CoinGecko
        try:
            global_data = await self.coingecko.get_global_data()
            if global_data:
                self.coingecko_status.record_success()
                return {
                    "total_market_cap": global_data.get("total_market_cap", {}).get("usd", 0),
                    "total_volume_24h": global_data.get("total_volume", {}).get("usd", 0),
                    "btc_dominance": global_data.get("market_cap_percentage", {}).get("btc", 0),
                    "eth_dominance": global_data.get("market_cap_percentage", {}).get("eth", 0),
                    "active_cryptocurrencies": global_data.get("active_cryptocurrencies", 0),
                    "markets": global_data.get("markets", 0),
                    "market_cap_change_24h": global_data.get("market_cap_change_percentage_24h_usd", 0),
                    "defi_market_cap": global_data.get("total_market_cap", {}).get("usd", 0) * 0.05,  # Estimate
                    "defi_volume_24h": global_data.get("total_volume", {}).get("usd", 0) * 0.08,
                    "last_updated": datetime.utcnow().isoformat(),
                    "source": "coingecko"
                }
        except Exception as e:
            logger.warning(f"CoinGecko global metrics failed: {e}")
            self.coingecko_status.record_failure()
        
        # Return static fallback
        logger.warning("Using static fallback for global_metrics")
        return {**STATIC_FALLBACK_DATA["global_metrics"], "source": "static"}
    
    async def get_asset_detail(self, asset_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a specific asset.
        
        Args:
            asset_id: Asset identifier (e.g., "bitcoin", "BTC")
            
        Returns:
            Detailed asset information
        """
        # Try CoinGecko first (better metadata)
        try:
            # CoinGecko uses lowercase IDs like "bitcoin"
            coin_id = asset_id.lower()
            metadata = await self.coingecko.get_token_metadata(coin_id)
            if metadata:
                self.coingecko_status.record_success()
                market_data = metadata.get("market_data", {})
                return {
                    "id": metadata.get("id"),
                    "symbol": metadata.get("symbol", "").upper(),
                    "name": metadata.get("name"),
                    "description": metadata.get("description", {}).get("en", ""),
                    "image": metadata.get("image", {}).get("large", ""),
                    "price": market_data.get("current_price", {}).get("usd", 0),
                    "market_cap": market_data.get("market_cap", {}).get("usd", 0),
                    "volume_24h": market_data.get("total_volume", {}).get("usd", 0),
                    "change_24h": market_data.get("price_change_percentage_24h", 0),
                    "change_7d": market_data.get("price_change_percentage_7d", 0),
                    "change_30d": market_data.get("price_change_percentage_30d", 0),
                    "high_24h": market_data.get("high_24h", {}).get("usd", 0),
                    "low_24h": market_data.get("low_24h", {}).get("usd", 0),
                    "ath": market_data.get("ath", {}).get("usd", 0),
                    "ath_date": market_data.get("ath_date", {}).get("usd", ""),
                    "atl": market_data.get("atl", {}).get("usd", 0),
                    "atl_date": market_data.get("atl_date", {}).get("usd", ""),
                    "circulating_supply": market_data.get("circulating_supply", 0),
                    "total_supply": market_data.get("total_supply", 0),
                    "max_supply": market_data.get("max_supply", 0),
                    "rank": market_data.get("market_cap_rank", 0),
                    "categories": metadata.get("categories", []),
                    "links": {
                        "homepage": metadata.get("links", {}).get("homepage", []),
                        "blockchain_site": metadata.get("links", {}).get("blockchain_site", []),
                        "twitter": metadata.get("links", {}).get("twitter_screen_name", ""),
                        "telegram": metadata.get("links", {}).get("telegram_channel_identifier", ""),
                        "reddit": metadata.get("links", {}).get("subreddit_url", ""),
                        "github": metadata.get("links", {}).get("repos_url", {}).get("github", [])
                    },
                    "source": "coingecko"
                }
        except Exception as e:
            logger.warning(f"CoinGecko asset detail failed: {e}")
            self.coingecko_status.record_failure()
        
        # Try CoinAPI
        try:
            # CoinAPI uses uppercase symbols like "BTC"
            symbol = asset_id.upper()
            asset = await self.coinapi.get_asset_detail(symbol)
            if asset:
                self.coinapi_status.record_success()
                return {
                    "id": asset.get("asset_id", "").lower(),
                    "symbol": asset.get("asset_id", ""),
                    "name": asset.get("name", ""),
                    "price": asset.get("price_usd", 0),
                    "volume_24h": asset.get("volume_1day_usd", 0),
                    "type_is_crypto": asset.get("type_is_crypto", 1),
                    "source": "coinapi"
                }
        except Exception as e:
            logger.warning(f"CoinAPI asset detail failed: {e}")
            self.coinapi_status.record_failure()
        
        # Check static fallback
        for asset in STATIC_FALLBACK_DATA["assets"]:
            if asset["id"] == asset_id.lower() or asset["symbol"] == asset_id.upper():
                return {**asset, "source": "static"}
        
        return None
    
    async def get_ohlcv(
        self,
        asset_id: str,
        period: str = "1DAY",
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get OHLCV (candlestick) data for an asset.
        
        Args:
            asset_id: Asset identifier
            period: Time period (1MIN, 5MIN, 15MIN, 1HRS, 1DAY)
            limit: Number of candles
            
        Returns:
            List of OHLCV data points
        """
        # Try CoinAPI first (better OHLCV data)
        try:
            symbol = asset_id.upper()
            ohlcv = await self.coinapi.get_ohlcv(symbol, period_id=period, limit=limit)
            if ohlcv:
                self.coinapi_status.record_success()
                return [
                    {
                        "time": c.get("time_period_start"),
                        "open": c.get("price_open"),
                        "high": c.get("price_high"),
                        "low": c.get("price_low"),
                        "close": c.get("price_close"),
                        "volume": c.get("volume_traded")
                    }
                    for c in ohlcv
                ]
        except Exception as e:
            logger.warning(f"CoinAPI OHLCV failed: {e}")
            self.coinapi_status.record_failure()
        
        # Try CoinGecko market chart
        try:
            coin_id = asset_id.lower()
            days = 7 if period == "1DAY" else 1
            chart = await self.coingecko.get_coin_market_chart(coin_id, days=days)
            if chart and "prices" in chart:
                self.coingecko_status.record_success()
                prices = chart["prices"]
                return [
                    {
                        "time": datetime.fromtimestamp(p[0] / 1000).isoformat(),
                        "close": p[1],
                        "open": p[1],
                        "high": p[1],
                        "low": p[1],
                        "volume": 0
                    }
                    for p in prices[-limit:]
                ]
        except Exception as e:
            logger.warning(f"CoinGecko OHLCV failed: {e}")
            self.coingecko_status.record_failure()
        
        return []
    
    async def get_orderbook(self, asset_id: str) -> Optional[Dict[str, Any]]:
        """
        Get orderbook data for an asset.
        
        Args:
            asset_id: Asset identifier
            
        Returns:
            Orderbook with bids and asks
        """
        # Only CoinAPI has orderbook data
        try:
            symbol = asset_id.upper()
            orderbook = await self.coinapi.get_orderbook(symbol)
            if orderbook:
                self.coinapi_status.record_success()
                return {
                    "symbol": symbol,
                    "bids": orderbook.get("bids", [])[:20],
                    "asks": orderbook.get("asks", [])[:20],
                    "timestamp": orderbook.get("time_exchange", datetime.utcnow().isoformat())
                }
        except Exception as e:
            logger.warning(f"CoinAPI orderbook failed: {e}")
            self.coinapi_status.record_failure()
        
        # Return mock orderbook for demo
        return {
            "symbol": asset_id.upper(),
            "bids": [{"price": 95000 - i * 10, "size": 0.5 + i * 0.1} for i in range(10)],
            "asks": [{"price": 95000 + i * 10, "size": 0.5 + i * 0.1} for i in range(10)],
            "timestamp": datetime.utcnow().isoformat(),
            "source": "mock"
        }
    
    async def get_trades(self, asset_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get recent trades for an asset.
        
        Args:
            asset_id: Asset identifier
            limit: Number of trades
            
        Returns:
            List of recent trades
        """
        # Only CoinAPI has trade data
        try:
            symbol = asset_id.upper()
            trades = await self.coinapi.get_trades(symbol, limit=limit)
            if trades:
                self.coinapi_status.record_success()
                return [
                    {
                        "time": t.get("time_exchange"),
                        "price": t.get("price"),
                        "size": t.get("size"),
                        "side": t.get("taker_side", "unknown")
                    }
                    for t in trades
                ]
        except Exception as e:
            logger.warning(f"CoinAPI trades failed: {e}")
            self.coinapi_status.record_failure()
        
        return []
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Get current status of all providers."""
        return {
            "coinapi": {
                "name": self.coinapi_status.name,
                "is_healthy": self.coinapi_status.is_healthy,
                "last_success": self.coinapi_status.last_success.isoformat() if self.coinapi_status.last_success else None,
                "last_failure": self.coinapi_status.last_failure.isoformat() if self.coinapi_status.last_failure else None,
                "consecutive_failures": self.coinapi_status.consecutive_failures
            },
            "coingecko": {
                "name": self.coingecko_status.name,
                "is_healthy": self.coingecko_status.is_healthy,
                "last_success": self.coingecko_status.last_success.isoformat() if self.coingecko_status.last_success else None,
                "last_failure": self.coingecko_status.last_failure.isoformat() if self.coingecko_status.last_failure else None,
                "consecutive_failures": self.coingecko_status.consecutive_failures
            }
        }


# Singleton instance
_engine: Optional[MarketDataEngine] = None


def get_market_data_engine() -> MarketDataEngine:
    """Get singleton MarketDataEngine instance."""
    global _engine
    if _engine is None:
        _engine = MarketDataEngine()
    return _engine

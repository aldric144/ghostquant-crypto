"""
CoinGecko Client for GhostQuant Market Data Integration

Secondary/backup data provider with:
- Automatic retries with exponential backoff
- Rate-limit handling (free tier: 10-30 calls/min)
- Response caching
- Comprehensive error handling
"""

import os
import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class CacheEntry:
    """Cache entry with TTL support."""
    data: Any
    expires_at: datetime
    
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class CoinGeckoClient:
    """
    Enterprise-grade CoinGecko client as secondary/backup provider.
    Used when CoinAPI fails or for supplementary data.
    """
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    PRO_BASE_URL = "https://pro-api.coingecko.com/api/v3"
    
    # Cache TTLs in seconds
    CACHE_TTL_PRICES = 60  # 1 minute
    CACHE_TTL_MARKET_CAP = 300  # 5 minutes
    CACHE_TTL_TOP_MOVERS = 60  # 1 minute
    CACHE_TTL_METADATA = 3600  # 1 hour
    
    # Rate limiting (conservative for free tier)
    MAX_REQUESTS_PER_MINUTE = 25
    MAX_RETRIES = 3
    RETRY_DELAY_BASE = 2.0  # seconds
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize CoinGecko client with optional API key."""
        self.api_key = api_key or os.getenv("COINGECKO_API_KEY", "")
        self._cache: Dict[str, CacheEntry] = {}
        self._session: Optional[aiohttp.ClientSession] = None
        self._request_times: List[datetime] = []
        self._lock = asyncio.Lock()
        
        # Use pro API if key is provided
        self.base_url = self.PRO_BASE_URL if self.api_key else self.BASE_URL
        
        if not self.api_key:
            logger.info("CoinGecko using free tier (rate limited)")
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None or self._session.closed:
            headers = {"Accept": "application/json"}
            if self.api_key:
                headers["x-cg-pro-api-key"] = self.api_key
            
            self._session = aiohttp.ClientSession(
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            )
        return self._session
    
    async def close(self):
        """Close the aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()
    
    def _get_cache(self, key: str) -> Optional[Any]:
        """Get cached data if not expired."""
        entry = self._cache.get(key)
        if entry and not entry.is_expired():
            logger.debug(f"Cache hit for {key}")
            return entry.data
        return None
    
    def _set_cache(self, key: str, data: Any, ttl_seconds: int):
        """Set cache with TTL."""
        self._cache[key] = CacheEntry(
            data=data,
            expires_at=datetime.utcnow() + timedelta(seconds=ttl_seconds)
        )
    
    async def _rate_limit(self):
        """Implement rate limiting for free tier."""
        async with self._lock:
            now = datetime.utcnow()
            # Remove old request times (older than 1 minute)
            self._request_times = [
                t for t in self._request_times 
                if (now - t).total_seconds() < 60.0
            ]
            
            if len(self._request_times) >= self.MAX_REQUESTS_PER_MINUTE:
                # Wait until we can make another request
                oldest = min(self._request_times)
                wait_time = 60.0 - (now - oldest).total_seconds()
                if wait_time > 0:
                    logger.debug(f"Rate limiting: waiting {wait_time:.2f}s")
                    await asyncio.sleep(wait_time)
            
            self._request_times.append(datetime.utcnow())
    
    async def _request(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        cache_key: Optional[str] = None,
        cache_ttl: int = 60
    ) -> Optional[Any]:
        """
        Make API request with retries and caching.
        
        Args:
            endpoint: API endpoint path
            params: Query parameters
            cache_key: Key for caching (if None, no caching)
            cache_ttl: Cache TTL in seconds
            
        Returns:
            JSON response data or None on failure
        """
        # Check cache first
        if cache_key:
            cached = self._get_cache(cache_key)
            if cached is not None:
                return cached
        
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.MAX_RETRIES):
            try:
                await self._rate_limit()
                session = await self._get_session()
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if cache_key:
                            self._set_cache(cache_key, data, cache_ttl)
                        return data
                    
                    elif response.status == 429:
                        # Rate limited - wait and retry
                        retry_after = int(response.headers.get("Retry-After", 60))
                        logger.warning(f"CoinGecko rate limited, waiting {retry_after}s")
                        await asyncio.sleep(retry_after)
                        continue
                    
                    elif response.status == 401:
                        logger.error("CoinGecko authentication failed")
                        return None
                    
                    else:
                        error_text = await response.text()
                        logger.warning(f"CoinGecko error {response.status}: {error_text[:200]}")
                        
            except asyncio.TimeoutError:
                logger.warning(f"CoinGecko timeout on attempt {attempt + 1}")
            except aiohttp.ClientError as e:
                logger.warning(f"CoinGecko client error on attempt {attempt + 1}: {e}")
            except Exception as e:
                logger.error(f"CoinGecko unexpected error: {e}")
                return None
            
            # Exponential backoff
            if attempt < self.MAX_RETRIES - 1:
                delay = self.RETRY_DELAY_BASE * (2 ** attempt)
                logger.debug(f"Retrying in {delay}s...")
                await asyncio.sleep(delay)
        
        logger.error(f"CoinGecko request failed after {self.MAX_RETRIES} attempts: {endpoint}")
        return None
    
    async def get_prices(
        self, 
        ids: Optional[List[str]] = None,
        vs_currencies: str = "usd",
        include_market_cap: bool = True,
        include_24hr_vol: bool = True,
        include_24hr_change: bool = True
    ) -> Dict[str, Any]:
        """
        Get current prices for multiple coins.
        
        Args:
            ids: List of coin IDs (e.g., ["bitcoin", "ethereum"])
            vs_currencies: Quote currency (default: usd)
            include_market_cap: Include market cap data
            include_24hr_vol: Include 24h volume
            include_24hr_change: Include 24h price change
            
        Returns:
            Dictionary of coin prices and metadata
        """
        if ids is None:
            ids = ["bitcoin", "ethereum", "binancecoin", "solana", "cardano"]
        
        cache_key = f"prices_{','.join(sorted(ids))}_{vs_currencies}"
        
        params = {
            "ids": ",".join(ids),
            "vs_currencies": vs_currencies,
            "include_market_cap": str(include_market_cap).lower(),
            "include_24hr_vol": str(include_24hr_vol).lower(),
            "include_24hr_change": str(include_24hr_change).lower()
        }
        
        result = await self._request(
            "/simple/price",
            params=params,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_PRICES
        )
        
        return result or {}
    
    async def get_market_cap(
        self, 
        vs_currency: str = "usd",
        order: str = "market_cap_desc",
        per_page: int = 100,
        page: int = 1,
        sparkline: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get coins by market cap with detailed data.
        
        Args:
            vs_currency: Quote currency
            order: Sort order (market_cap_desc, volume_desc, etc.)
            per_page: Results per page (max 250)
            page: Page number
            sparkline: Include 7d sparkline data
            
        Returns:
            List of coins with market data
        """
        cache_key = f"market_cap_{vs_currency}_{order}_{per_page}_{page}"
        
        params = {
            "vs_currency": vs_currency,
            "order": order,
            "per_page": per_page,
            "page": page,
            "sparkline": str(sparkline).lower()
        }
        
        result = await self._request(
            "/coins/markets",
            params=params,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_MARKET_CAP
        )
        
        return result or []
    
    async def get_top_movers(
        self, 
        vs_currency: str = "usd",
        limit: int = 50
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get top gainers and losers.
        
        Args:
            vs_currency: Quote currency
            limit: Number of coins to analyze
            
        Returns:
            Dictionary with 'gainers' and 'losers' lists
        """
        cache_key = f"top_movers_{vs_currency}_{limit}"
        
        # Check cache
        cached = self._get_cache(cache_key)
        if cached:
            return cached
        
        # Get market data sorted by market cap
        coins = await self.get_market_cap(
            vs_currency=vs_currency,
            per_page=min(limit * 2, 250),
            page=1
        )
        
        if not coins:
            return {"gainers": [], "losers": []}
        
        # Sort by 24h change
        sorted_by_change = sorted(
            [c for c in coins if c.get("price_change_percentage_24h") is not None],
            key=lambda x: x.get("price_change_percentage_24h", 0),
            reverse=True
        )
        
        result = {
            "gainers": sorted_by_change[:limit // 2],
            "losers": sorted_by_change[-(limit // 2):][::-1]
        }
        
        self._set_cache(cache_key, result, self.CACHE_TTL_TOP_MOVERS)
        return result
    
    async def get_token_metadata(self, coin_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed metadata for a specific token.
        
        Args:
            coin_id: CoinGecko coin ID (e.g., "bitcoin")
            
        Returns:
            Detailed coin metadata including description, links, etc.
        """
        cache_key = f"metadata_{coin_id}"
        
        params = {
            "localization": "false",
            "tickers": "true",
            "market_data": "true",
            "community_data": "true",
            "developer_data": "false",
            "sparkline": "false"
        }
        
        result = await self._request(
            f"/coins/{coin_id}",
            params=params,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_METADATA
        )
        
        return result
    
    async def get_global_data(self) -> Optional[Dict[str, Any]]:
        """
        Get global cryptocurrency market data.
        
        Returns:
            Global market statistics
        """
        cache_key = "global_data"
        
        result = await self._request(
            "/global",
            cache_key=cache_key,
            cache_ttl=300
        )
        
        if result and "data" in result:
            return result["data"]
        return result
    
    async def get_trending(self) -> List[Dict[str, Any]]:
        """
        Get trending coins (searched in last 24h).
        
        Returns:
            List of trending coins
        """
        cache_key = "trending"
        
        result = await self._request(
            "/search/trending",
            cache_key=cache_key,
            cache_ttl=300
        )
        
        if result and "coins" in result:
            return [c.get("item", c) for c in result["coins"]]
        return []
    
    async def get_coin_history(
        self, 
        coin_id: str,
        date: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get historical data for a coin on a specific date.
        
        Args:
            coin_id: CoinGecko coin ID
            date: Date in dd-mm-yyyy format
            
        Returns:
            Historical coin data
        """
        cache_key = f"history_{coin_id}_{date}"
        
        params = {"date": date}
        
        result = await self._request(
            f"/coins/{coin_id}/history",
            params=params,
            cache_key=cache_key,
            cache_ttl=86400  # 24 hours
        )
        
        return result
    
    async def get_coin_market_chart(
        self, 
        coin_id: str,
        vs_currency: str = "usd",
        days: int = 7
    ) -> Optional[Dict[str, Any]]:
        """
        Get historical market data (price, market cap, volume).
        
        Args:
            coin_id: CoinGecko coin ID
            vs_currency: Quote currency
            days: Number of days (1, 7, 14, 30, 90, 180, 365, max)
            
        Returns:
            Historical market chart data
        """
        cache_key = f"chart_{coin_id}_{vs_currency}_{days}"
        
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        
        result = await self._request(
            f"/coins/{coin_id}/market_chart",
            params=params,
            cache_key=cache_key,
            cache_ttl=300
        )
        
        return result
    
    async def search_coins(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for coins by name or symbol.
        
        Args:
            query: Search query
            
        Returns:
            List of matching coins
        """
        cache_key = f"search_{query.lower()}"
        
        params = {"query": query}
        
        result = await self._request(
            "/search",
            params=params,
            cache_key=cache_key,
            cache_ttl=300
        )
        
        if result and "coins" in result:
            return result["coins"]
        return []
    
    async def get_exchanges(self, per_page: int = 100, page: int = 1) -> List[Dict[str, Any]]:
        """
        Get list of exchanges.
        
        Args:
            per_page: Results per page
            page: Page number
            
        Returns:
            List of exchanges
        """
        cache_key = f"exchanges_{per_page}_{page}"
        
        params = {
            "per_page": per_page,
            "page": page
        }
        
        result = await self._request(
            "/exchanges",
            params=params,
            cache_key=cache_key,
            cache_ttl=600
        )
        
        return result or []
    
    async def get_categories(self) -> List[Dict[str, Any]]:
        """
        Get list of coin categories.
        
        Returns:
            List of categories with market data
        """
        cache_key = "categories"
        
        result = await self._request(
            "/coins/categories",
            cache_key=cache_key,
            cache_ttl=600
        )
        
        return result or []


# Singleton instance
_client: Optional[CoinGeckoClient] = None


def get_coingecko_client() -> CoinGeckoClient:
    """Get singleton CoinGecko client instance."""
    global _client
    if _client is None:
        _client = CoinGeckoClient()
    return _client

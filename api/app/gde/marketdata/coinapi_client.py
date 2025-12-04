"""
CoinAPI Client for GhostQuant Market Data Integration

Primary data provider with:
- Automatic retries with exponential backoff
- Rate-limit handling
- Response caching
- Comprehensive error handling
"""

import os
import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import aiohttp
from functools import lru_cache

logger = logging.getLogger(__name__)


@dataclass
class CacheEntry:
    """Cache entry with TTL support."""
    data: Any
    expires_at: datetime
    
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class CoinAPIClient:
    """
    Enterprise-grade CoinAPI client with automatic retries,
    rate-limit handling, and response caching.
    """
    
    BASE_URL = "https://rest.coinapi.io/v1"
    
    # Cache TTLs in seconds
    CACHE_TTL_ASSETS = 300  # 5 minutes
    CACHE_TTL_EXCHANGES = 600  # 10 minutes
    CACHE_TTL_OHLCV = 60  # 1 minute
    CACHE_TTL_ORDERBOOK = 10  # 10 seconds
    CACHE_TTL_TRADES = 30  # 30 seconds
    CACHE_TTL_MARKETS = 300  # 5 minutes
    
    # Rate limiting
    MAX_REQUESTS_PER_SECOND = 100
    MAX_RETRIES = 3
    RETRY_DELAY_BASE = 1.0  # seconds
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize CoinAPI client with API key."""
        self.api_key = api_key or os.getenv("COINAPI_KEY", "")
        self._cache: Dict[str, CacheEntry] = {}
        self._session: Optional[aiohttp.ClientSession] = None
        self._request_times: List[datetime] = []
        self._lock = asyncio.Lock()
        
        if not self.api_key:
            logger.warning("CoinAPI key not configured - client will return empty results")
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={
                    "X-CoinAPI-Key": self.api_key,
                    "Accept": "application/json"
                },
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
        """Implement rate limiting."""
        async with self._lock:
            now = datetime.utcnow()
            # Remove old request times
            self._request_times = [
                t for t in self._request_times 
                if (now - t).total_seconds() < 1.0
            ]
            
            if len(self._request_times) >= self.MAX_REQUESTS_PER_SECOND:
                # Wait until we can make another request
                oldest = min(self._request_times)
                wait_time = 1.0 - (now - oldest).total_seconds()
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
        if not self.api_key:
            logger.warning("CoinAPI key not configured")
            return None
        
        # Check cache first
        if cache_key:
            cached = self._get_cache(cache_key)
            if cached is not None:
                return cached
        
        url = f"{self.BASE_URL}{endpoint}"
        
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
                        retry_after = int(response.headers.get("Retry-After", 5))
                        logger.warning(f"CoinAPI rate limited, waiting {retry_after}s")
                        await asyncio.sleep(retry_after)
                        continue
                    
                    elif response.status == 401:
                        logger.error("CoinAPI authentication failed - invalid API key")
                        return None
                    
                    elif response.status == 403:
                        logger.error("CoinAPI access forbidden - check API key permissions")
                        return None
                    
                    else:
                        error_text = await response.text()
                        logger.warning(f"CoinAPI error {response.status}: {error_text[:200]}")
                        
            except asyncio.TimeoutError:
                logger.warning(f"CoinAPI timeout on attempt {attempt + 1}")
            except aiohttp.ClientError as e:
                logger.warning(f"CoinAPI client error on attempt {attempt + 1}: {e}")
            except Exception as e:
                logger.error(f"CoinAPI unexpected error: {e}")
                return None
            
            # Exponential backoff
            if attempt < self.MAX_RETRIES - 1:
                delay = self.RETRY_DELAY_BASE * (2 ** attempt)
                logger.debug(f"Retrying in {delay}s...")
                await asyncio.sleep(delay)
        
        logger.error(f"CoinAPI request failed after {self.MAX_RETRIES} attempts: {endpoint}")
        return None
    
    async def get_assets(self, filter_asset_id: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Get list of all assets.
        
        Args:
            filter_asset_id: Optional list of asset IDs to filter
            
        Returns:
            List of asset objects with id, name, type_is_crypto, etc.
        """
        cache_key = "assets"
        if filter_asset_id:
            cache_key = f"assets_{','.join(sorted(filter_asset_id))}"
        
        params = {}
        if filter_asset_id:
            params["filter_asset_id"] = ",".join(filter_asset_id)
        
        result = await self._request(
            "/assets",
            params=params if params else None,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_ASSETS
        )
        
        return result or []
    
    async def get_asset_detail(self, asset_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a specific asset.
        
        Args:
            asset_id: Asset identifier (e.g., "BTC", "ETH")
            
        Returns:
            Asset detail object or None
        """
        cache_key = f"asset_{asset_id}"
        
        result = await self._request(
            f"/assets/{asset_id}",
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_ASSETS
        )
        
        if result and isinstance(result, list) and len(result) > 0:
            return result[0]
        return result
    
    async def get_exchanges(self) -> List[Dict[str, Any]]:
        """
        Get list of all exchanges.
        
        Returns:
            List of exchange objects with exchange_id, name, website, etc.
        """
        result = await self._request(
            "/exchanges",
            cache_key="exchanges",
            cache_ttl=self.CACHE_TTL_EXCHANGES
        )
        
        return result or []
    
    async def get_ohlcv(
        self, 
        asset_id: str,
        period_id: str = "1DAY",
        time_start: Optional[str] = None,
        time_end: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get OHLCV (candlestick) data for an asset.
        
        Args:
            asset_id: Asset identifier (e.g., "BTC")
            period_id: Time period (1MIN, 5MIN, 15MIN, 1HRS, 1DAY, etc.)
            time_start: Start time in ISO 8601 format
            time_end: End time in ISO 8601 format
            limit: Maximum number of results
            
        Returns:
            List of OHLCV data points
        """
        # Use exchange rate endpoint for OHLCV
        symbol_id = f"BITSTAMP_SPOT_{asset_id}_USD"
        cache_key = f"ohlcv_{symbol_id}_{period_id}_{limit}"
        
        params = {
            "period_id": period_id,
            "limit": limit
        }
        if time_start:
            params["time_start"] = time_start
        if time_end:
            params["time_end"] = time_end
        
        result = await self._request(
            f"/ohlcv/{symbol_id}/history",
            params=params,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_OHLCV
        )
        
        return result or []
    
    async def get_orderbook(
        self, 
        asset_id: str,
        exchange_id: str = "BINANCE",
        limit_levels: int = 50
    ) -> Optional[Dict[str, Any]]:
        """
        Get current orderbook for an asset.
        
        Args:
            asset_id: Asset identifier (e.g., "BTC")
            exchange_id: Exchange identifier
            limit_levels: Number of price levels to return
            
        Returns:
            Orderbook with bids and asks
        """
        symbol_id = f"{exchange_id}_SPOT_{asset_id}_USDT"
        cache_key = f"orderbook_{symbol_id}"
        
        params = {"limit_levels": limit_levels}
        
        result = await self._request(
            f"/orderbooks/{symbol_id}/current",
            params=params,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_ORDERBOOK
        )
        
        return result
    
    async def get_trades(
        self, 
        asset_id: str,
        exchange_id: str = "BINANCE",
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get recent trades for an asset.
        
        Args:
            asset_id: Asset identifier (e.g., "BTC")
            exchange_id: Exchange identifier
            limit: Maximum number of trades to return
            
        Returns:
            List of recent trades
        """
        symbol_id = f"{exchange_id}_SPOT_{asset_id}_USDT"
        cache_key = f"trades_{symbol_id}_{limit}"
        
        params = {"limit": limit}
        
        result = await self._request(
            f"/trades/{symbol_id}/latest",
            params=params,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_TRADES
        )
        
        return result or []
    
    async def get_markets(
        self, 
        filter_symbol_id: Optional[str] = None,
        filter_exchange_id: Optional[str] = None,
        filter_asset_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get list of all markets/symbols.
        
        Args:
            filter_symbol_id: Filter by symbol ID pattern
            filter_exchange_id: Filter by exchange
            filter_asset_id: Filter by asset
            
        Returns:
            List of market/symbol objects
        """
        cache_key = f"markets_{filter_exchange_id}_{filter_asset_id}"
        
        params = {}
        if filter_symbol_id:
            params["filter_symbol_id"] = filter_symbol_id
        if filter_exchange_id:
            params["filter_exchange_id"] = filter_exchange_id
        if filter_asset_id:
            params["filter_asset_id"] = filter_asset_id
        
        result = await self._request(
            "/symbols",
            params=params if params else None,
            cache_key=cache_key,
            cache_ttl=self.CACHE_TTL_MARKETS
        )
        
        return result or []
    
    async def get_exchange_rates(
        self, 
        asset_id_base: str = "BTC",
        asset_id_quote: str = "USD"
    ) -> Optional[Dict[str, Any]]:
        """
        Get current exchange rate between two assets.
        
        Args:
            asset_id_base: Base asset (e.g., "BTC")
            asset_id_quote: Quote asset (e.g., "USD")
            
        Returns:
            Exchange rate data
        """
        cache_key = f"rate_{asset_id_base}_{asset_id_quote}"
        
        result = await self._request(
            f"/exchangerate/{asset_id_base}/{asset_id_quote}",
            cache_key=cache_key,
            cache_ttl=60
        )
        
        return result
    
    async def get_all_exchange_rates(
        self, 
        asset_id_base: str = "USD"
    ) -> List[Dict[str, Any]]:
        """
        Get all exchange rates for a base asset.
        
        Args:
            asset_id_base: Base asset (e.g., "USD")
            
        Returns:
            List of exchange rates
        """
        cache_key = f"rates_all_{asset_id_base}"
        
        result = await self._request(
            f"/exchangerate/{asset_id_base}",
            cache_key=cache_key,
            cache_ttl=60
        )
        
        if result and "rates" in result:
            return result["rates"]
        return []


# Singleton instance
_client: Optional[CoinAPIClient] = None


def get_coinapi_client() -> CoinAPIClient:
    """Get singleton CoinAPI client instance."""
    global _client
    if _client is None:
        _client = CoinAPIClient()
    return _client

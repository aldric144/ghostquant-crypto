"""CoinGecko API client with rate limiting and exponential backoff."""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import aiohttp

from .config import config
from .rate_limiter import RateLimiter

logger = logging.getLogger(__name__)


class CoinGeckoClient:
    """
    Async CoinGecko API client with:
    - Rate limiting
    - Exponential backoff on failures
    - Retry logic
    """
    
    def __init__(self):
        self.base_url = config.coingecko_api_base
        self.api_key = config.coingecko_api_key
        self.rate_limiter = RateLimiter(config.ingester_rate_limit_per_min)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close the aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Make a request with rate limiting and exponential backoff.
        
        Args:
            endpoint: API endpoint (e.g., "coins/bitcoin/market_chart")
            params: Query parameters
            
        Returns:
            JSON response data
            
        Raises:
            Exception: If all retry attempts fail
        """
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        
        if self.api_key:
            headers["x-cg-pro-api-key"] = self.api_key
        
        for attempt in range(config.retry_max_attempts):
            try:
                await self.rate_limiter.acquire()
                
                session = await self._get_session()
                
                async with session.get(url, params=params, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        return await response.json()
                    
                    elif response.status == 429:
                        delay = config.retry_initial_delay * (config.retry_backoff_base ** attempt)
                        logger.warning(
                            f"Rate limited (429) on {endpoint}, "
                            f"attempt {attempt + 1}/{config.retry_max_attempts}, "
                            f"waiting {delay:.1f}s"
                        )
                        await asyncio.sleep(delay)
                    
                    else:
                        error_text = await response.text()
                        logger.error(f"CoinGecko API error {response.status}: {error_text}")
                        
                        if attempt == config.retry_max_attempts - 1:
                            raise Exception(f"CoinGecko API error {response.status}: {error_text}")
                        
                        delay = config.retry_initial_delay * (config.retry_backoff_base ** attempt)
                        await asyncio.sleep(delay)
            
            except asyncio.TimeoutError:
                logger.error(f"Timeout on {endpoint}, attempt {attempt + 1}/{config.retry_max_attempts}")
                
                if attempt == config.retry_max_attempts - 1:
                    raise
                
                delay = config.retry_initial_delay * (config.retry_backoff_base ** attempt)
                await asyncio.sleep(delay)
            
            except Exception as e:
                logger.error(f"Request error on {endpoint}: {e}, attempt {attempt + 1}/{config.retry_max_attempts}")
                
                if attempt == config.retry_max_attempts - 1:
                    raise
                
                delay = config.retry_initial_delay * (config.retry_backoff_base ** attempt)
                await asyncio.sleep(delay)
        
        raise Exception(f"Max retries exceeded for {endpoint}")
    
    async def get_ohlc(
        self,
        coin_id: str,
        days: int,
        vs_currency: str = "usd"
    ) -> List[List[float]]:
        """
        Get OHLC data for a coin.
        
        Args:
            coin_id: CoinGecko coin ID (e.g., "bitcoin")
            days: Number of days of data (1, 7, 14, 30, 90, 180, 365, max)
            vs_currency: Currency to get prices in
            
        Returns:
            List of [timestamp_ms, open, high, low, close]
        """
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        
        data = await self._request(f"coins/{coin_id}/ohlc", params)
        return data
    
    async def get_market_chart(
        self,
        coin_id: str,
        days: int,
        vs_currency: str = "usd",
        interval: Optional[str] = None
    ) -> Dict[str, List[List[float]]]:
        """
        Get market chart data (prices, market_caps, total_volumes).
        
        Args:
            coin_id: CoinGecko coin ID
            days: Number of days (1-90 = hourly, 90+ = daily)
            vs_currency: Currency
            interval: Optional interval ('daily', 'hourly')
            
        Returns:
            Dict with 'prices', 'market_caps', 'total_volumes' arrays
        """
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        
        if interval:
            params["interval"] = interval
        
        data = await self._request(f"coins/{coin_id}/market_chart", params)
        return data
    
    async def get_market_chart_range(
        self,
        coin_id: str,
        from_timestamp: int,
        to_timestamp: int,
        vs_currency: str = "usd"
    ) -> Dict[str, List[List[float]]]:
        """
        Get market chart data for a specific date range.
        
        Args:
            coin_id: CoinGecko coin ID
            from_timestamp: Start timestamp (Unix seconds)
            to_timestamp: End timestamp (Unix seconds)
            vs_currency: Currency
            
        Returns:
            Dict with 'prices', 'market_caps', 'total_volumes' arrays
        """
        params = {
            "vs_currency": vs_currency,
            "from": from_timestamp,
            "to": to_timestamp
        }
        
        data = await self._request(f"coins/{coin_id}/market_chart/range", params)
        return data
    
    async def get_coin_info(self, coin_id: str) -> Dict[str, Any]:
        """
        Get detailed coin information including supply data.
        
        Args:
            coin_id: CoinGecko coin ID
            
        Returns:
            Coin info dict with market_data, etc.
        """
        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "false"
        }
        
        data = await self._request(f"coins/{coin_id}", params)
        return data
    
    async def get_coins_list(self) -> List[Dict[str, str]]:
        """
        Get list of all coins with id, symbol, name.
        
        Returns:
            List of coin dicts
        """
        data = await self._request("coins/list")
        return data

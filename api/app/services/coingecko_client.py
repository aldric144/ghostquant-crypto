"""
CoinGecko API client with rate limiting and retry logic.
"""
import os
import logging
import asyncio
from typing import List, Dict, Any, Optional
import aiohttp
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CoinGeckoClient:
    """
    Async CoinGecko API client with rate limiting, exponential backoff, and caching.
    """
    
    def __init__(self):
        self.base_url = os.getenv("COINGECKO_API_BASE", "https://api.coingecko.com/api/v3")
        self.api_key = os.getenv("COINGECKO_PRO_API_KEY", "")
        self.rate_limit_per_minute = int(os.getenv("COINGECKO_RATE_LIMIT_PER_MINUTE", 50))
        self.retry_max_attempts = int(os.getenv("COINGECKO_RETRY_MAX_ATTEMPTS", 3))
        self.retry_backoff_seconds = int(os.getenv("COINGECKO_RETRY_BACKOFF_SECONDS", 5))
        self.use_mock = os.getenv("USE_MOCK_MARKET_DATA", "false").lower() == "true"
        
        self.request_times = []
        self.lock = asyncio.Lock()
    
    async def _wait_for_rate_limit(self):
        """Wait if we've hit the rate limit."""
        async with self.lock:
            now = datetime.utcnow()
            self.request_times = [t for t in self.request_times if now - t < timedelta(minutes=1)]
            
            if len(self.request_times) >= self.rate_limit_per_minute:
                oldest = self.request_times[0]
                wait_seconds = 60 - (now - oldest).total_seconds()
                if wait_seconds > 0:
                    logger.warning(f"Rate limit reached, waiting {wait_seconds:.1f}s")
                    await asyncio.sleep(wait_seconds)
                    now = datetime.utcnow()
                    self.request_times = [t for t in self.request_times if now - t < timedelta(minutes=1)]
            
            self.request_times.append(now)
    
    async def _request(self, endpoint: str, params: Dict[str, Any] = None) -> Any:
        """Make a request with retry logic."""
        if self.use_mock:
            return await self._mock_response(endpoint, params)
        
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        if self.api_key:
            headers["x-cg-pro-api-key"] = self.api_key
        
        for attempt in range(self.retry_max_attempts):
            try:
                await self._wait_for_rate_limit()
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, params=params, headers=headers, timeout=30) as response:
                        if response.status == 200:
                            return await response.json()
                        elif response.status == 429:
                            wait = self.retry_backoff_seconds * (2 ** attempt)
                            logger.warning(f"Rate limited (429), waiting {wait}s before retry {attempt+1}/{self.retry_max_attempts}")
                            await asyncio.sleep(wait)
                        else:
                            logger.error(f"CoinGecko API error: {response.status} - {await response.text()}")
                            if attempt == self.retry_max_attempts - 1:
                                raise Exception(f"CoinGecko API error: {response.status}")
                            await asyncio.sleep(self.retry_backoff_seconds)
            
            except asyncio.TimeoutError:
                logger.error(f"Timeout on attempt {attempt+1}/{self.retry_max_attempts}")
                if attempt == self.retry_max_attempts - 1:
                    raise
                await asyncio.sleep(self.retry_backoff_seconds)
            
            except Exception as e:
                logger.error(f"Request error on attempt {attempt+1}/{self.retry_max_attempts}: {e}")
                if attempt == self.retry_max_attempts - 1:
                    raise
                await asyncio.sleep(self.retry_backoff_seconds)
        
        raise Exception("Max retries exceeded")
    
    async def _mock_response(self, endpoint: str, params: Dict[str, Any] = None) -> Any:
        """Return mock data for testing."""
        if "coins/markets" in endpoint:
            page = params.get("page", 1) if params else 1
            per_page = params.get("per_page", 100) if params else 100
            
            mock_coins = []
            for i in range(per_page):
                rank = (page - 1) * per_page + i + 1
                mock_coins.append({
                    "id": f"coin-{rank}",
                    "symbol": f"coin{rank}",
                    "name": f"Coin {rank}",
                    "image": f"https://example.com/coin{rank}.png",
                    "current_price": 1000 + rank * 10,
                    "market_cap": 1000000000 - rank * 1000000,
                    "market_cap_rank": rank,
                    "total_volume": 50000000 - rank * 10000,
                    "price_change_percentage_1h": (rank % 10) - 5,
                    "price_change_percentage_24h": (rank % 20) - 10,
                    "price_change_percentage_7d": (rank % 30) - 15,
                    "sparkline_in_7d": {"price": [1000 + i for i in range(168)]} if params and params.get("sparkline") else None
                })
            return mock_coins
        
        elif "coins/" in endpoint:
            coin_id = endpoint.split("/")[-1]
            return {
                "id": coin_id,
                "symbol": coin_id[:3],
                "name": coin_id.title(),
                "image": {"large": f"https://example.com/{coin_id}.png"},
                "market_data": {
                    "current_price": {"usd": 1000},
                    "market_cap": {"usd": 1000000000},
                    "market_cap_rank": 1,
                    "total_volume": {"usd": 50000000},
                    "price_change_percentage_1h": 2.5,
                    "price_change_percentage_24h": 5.0,
                    "price_change_percentage_7d": 10.0,
                    "sparkline_7d": {"price": [1000 + i for i in range(168)]}
                }
            }
        
        return {}
    
    async def get_coins_markets(
        self,
        page: int = 1,
        per_page: int = 250,
        sparkline: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get paginated list of coins with market data.
        """
        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": per_page,
            "page": page,
            "sparkline": str(sparkline).lower(),
            "price_change_percentage": "1h,24h,7d"
        }
        
        return await self._request("coins/markets", params)
    
    async def get_coin_by_id(self, coin_id: str) -> Dict[str, Any]:
        """
        Get detailed data for a specific coin.
        """
        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "true"
        }
        
        data = await self._request(f"coins/{coin_id}", params)
        
        market_data = data.get("market_data", {})
        return {
            "id": data.get("id"),
            "symbol": data.get("symbol"),
            "name": data.get("name"),
            "image": data.get("image", {}).get("large"),
            "current_price": market_data.get("current_price", {}).get("usd"),
            "market_cap": market_data.get("market_cap", {}).get("usd"),
            "market_cap_rank": market_data.get("market_cap_rank"),
            "total_volume": market_data.get("total_volume", {}).get("usd"),
            "price_change_percentage_1h": market_data.get("price_change_percentage_1h"),
            "price_change_percentage_24h": market_data.get("price_change_percentage_24h"),
            "price_change_percentage_7d": market_data.get("price_change_percentage_7d"),
            "sparkline_in_7d": market_data.get("sparkline_7d", {})
        }
    
    async def get_historical_data(
        self,
        coin_id: str,
        days: int = 30
    ) -> List[List[float]]:
        """
        Get historical price data for backtesting.
        """
        params = {
            "vs_currency": "usd",
            "days": days,
            "interval": "hourly" if days <= 90 else "daily"
        }
        
        data = await self._request(f"coins/{coin_id}/market_chart", params)
        return data.get("prices", [])
    
    async def get_tickers(self, coin_id: str) -> List[Dict[str, Any]]:
        """
        Get ticker data for a coin across exchanges.
        Used to compute cross_exchange_confirmation_count.
        
        Args:
            coin_id: CoinGecko coin ID
            
        Returns:
            List of ticker dictionaries
        """
        if self.use_mock:
            import random
            random.seed(sum(ord(c) for c in coin_id))
            num_exchanges = random.randint(2, 5)
            return [
                {
                    "market": {"name": f"Exchange{i}"},
                    "base": coin_id[:3].upper(),
                    "target": "USD",
                    "trust_score": "green" if i < 3 else "yellow"
                }
                for i in range(num_exchanges)
            ]
        
        params = {
            "include_exchange_logo": "false",
            "page": 1,
            "order": "trust_score_desc"
        }
        
        data = await self._request(f"coins/{coin_id}/tickers", params)
        return data.get("tickers", [])

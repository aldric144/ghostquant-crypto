"""
Pair discovery using CoinGecko top N + Binance exchangeInfo mapping.
"""
import asyncio
import logging
import aiohttp
from typing import List, Set
import os

logger = logging.getLogger(__name__)

COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "")
PAIRS_LIMIT = int(os.getenv("PAIRS_LIMIT", "200"))
FALLBACK_PAIRS = os.getenv("FALLBACK_PAIRS", "BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,ADAUSDT,DOGEUSDT,XRPUSDT,DOTUSDT,UNIUSDT,LINKUSDT").split(",")


class PairDiscovery:
    """
    Discovers tradable pairs by combining CoinGecko top coins with Binance exchange info.
    Refreshes periodically to adapt to market changes.
    """
    
    def __init__(self, refresh_interval: int = 3600):
        self.refresh_interval = refresh_interval
        self.pairs: Set[str] = set(FALLBACK_PAIRS)
        self.coingecko_base = "https://pro-api.coingecko.com/api/v3" if COINGECKO_API_KEY else "https://api.coingecko.com/api/v3"
        self.binance_base = "https://api.binance.com/api/v3"
        self.last_refresh = 0
    
    async def get_pairs(self) -> List[str]:
        """Get current list of pairs."""
        return sorted(list(self.pairs))
    
    async def refresh_pairs(self):
        """Refresh pair list from CoinGecko + Binance."""
        try:
            logger.info("Refreshing pair list...")
            
            top_symbols = await self._get_coingecko_top_coins()
            
            binance_pairs = await self._get_binance_usdt_pairs()
            
            new_pairs = set()
            for symbol in top_symbols:
                pair = f"{symbol}USDT"
                if pair in binance_pairs:
                    new_pairs.add(pair)
            
            new_pairs.update(FALLBACK_PAIRS)
            
            new_pairs = set(sorted(list(new_pairs))[:PAIRS_LIMIT])
            
            self.pairs = new_pairs
            logger.info(f"Discovered {len(self.pairs)} tradable pairs")
            
        except Exception as e:
            logger.error(f"Failed to refresh pairs: {e}")
            logger.info(f"Using {len(self.pairs)} existing pairs")
    
    async def _get_coingecko_top_coins(self) -> List[str]:
        """Get top N coins by market cap from CoinGecko."""
        try:
            url = f"{self.coingecko_base}/coins/markets"
            params = {
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": min(PAIRS_LIMIT * 2, 250),  # Get extra to account for mapping failures
                "page": 1,
                "sparkline": "false"
            }
            
            headers = {}
            if COINGECKO_API_KEY:
                headers["x-cg-pro-api-key"] = COINGECKO_API_KEY
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        symbols = [coin["symbol"].upper() for coin in data]
                        logger.info(f"Retrieved {len(symbols)} symbols from CoinGecko")
                        return symbols
                    elif response.status == 429:
                        logger.warning("CoinGecko rate limit hit")
                        return []
                    else:
                        logger.error(f"CoinGecko API error: {response.status}")
                        return []
        
        except Exception as e:
            logger.error(f"Failed to fetch CoinGecko data: {e}")
            return []
    
    async def _get_binance_usdt_pairs(self) -> Set[str]:
        """Get all tradable USDT pairs from Binance exchangeInfo."""
        try:
            url = f"{self.binance_base}/exchangeInfo"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        pairs = set()
                        
                        for symbol_info in data.get("symbols", []):
                            symbol = symbol_info.get("symbol", "")
                            status = symbol_info.get("status", "")
                            quote = symbol_info.get("quoteAsset", "")
                            
                            if status == "TRADING" and quote == "USDT":
                                pairs.add(symbol)
                        
                        logger.info(f"Retrieved {len(pairs)} USDT pairs from Binance")
                        return pairs
                    else:
                        logger.error(f"Binance API error: {response.status}")
                        return set()
        
        except Exception as e:
            logger.error(f"Failed to fetch Binance exchangeInfo: {e}")
            return set()
    
    async def start_refresh_loop(self):
        """Start periodic refresh loop."""
        await self.refresh_pairs()
        
        while True:
            await asyncio.sleep(self.refresh_interval)
            await self.refresh_pairs()

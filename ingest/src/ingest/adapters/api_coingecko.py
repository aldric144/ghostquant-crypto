import asyncio
import aiohttp
import logging
from datetime import datetime
from typing import List, Dict, Any
import os

logger = logging.getLogger(__name__)

USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'
COINGECKO_API_KEY = os.getenv('COINGECKO_API_KEY', '')

class CoinGeckoAdapter:
    """
    CoinGecko REST API adapter for real-time price data.
    US-friendly alternative to Binance/Bybit.
    
    Free tier: 10-15 requests/minute
    Updates every 30-60 seconds (good for signals/portfolio tracking)
    """
    
    def __init__(self, symbols: List[str], on_tick_callback, on_book_callback):
        self.symbols = symbols  # e.g., ['BTC', 'ETH', 'SOL']
        self.on_tick = on_tick_callback
        self.on_book = on_book_callback
        
        self.symbol_map = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana',
            'AVAX': 'avalanche-2',
            'MATIC': 'matic-network',
            'LINK': 'chainlink',
            'UNI': 'uniswap',
            'AAVE': 'aave',
            'CRV': 'curve-dao-token',
            'MKR': 'maker'
        }
        
        self.base_url = "https://api.coingecko.com/api/v3"
        self.update_interval = 30  # seconds (respect rate limits)
        self.last_prices = {}  # cache for comparison
        
    async def start(self):
        if USE_MOCK_DATA:
            logger.info("Using mock data for CoinGecko")
            await self._mock_data_generator()
        else:
            logger.info("Using real data from CoinGecko API")
            await self._fetch_prices_loop()
    
    async def _mock_data_generator(self):
        """Mock data generator for testing without API key"""
        import random
        base_prices = {'BTC': 45000, 'ETH': 2500, 'SOL': 100, 'AVAX': 35, 'MATIC': 0.8}
        
        while True:
            for symbol in self.symbols:
                base = base_prices.get(symbol, 1000)
                price = base * (1 + random.uniform(-0.002, 0.002))
                qty = random.uniform(0.1, 2.0)
                
                await self.on_tick({
                    'symbol': f"{symbol}USDT",
                    'price': price,
                    'qty': qty,
                    'side': random.choice(['buy', 'sell']),
                    'ts': datetime.utcnow(),
                    'venue': 'coingecko'
                })
                
                spread = price * 0.0002
                await self.on_book({
                    'symbol': f"{symbol}USDT",
                    'bid_px': price - spread/2,
                    'ask_px': price + spread/2,
                    'bid_sz': random.uniform(5, 20),
                    'ask_sz': random.uniform(5, 20),
                    'spread_bps': 2.0,
                    'ts': datetime.utcnow()
                })
            
            await asyncio.sleep(30)
    
    async def _fetch_prices_loop(self):
        """Main loop to fetch prices from CoinGecko API"""
        while True:
            try:
                await self._fetch_and_emit_prices()
                await asyncio.sleep(self.update_interval)
            except Exception as e:
                logger.error(f"CoinGecko fetch error: {e}")
                await asyncio.sleep(60)  # longer backoff on error
    
    async def _fetch_and_emit_prices(self):
        """Fetch prices for all symbols in a single batched request"""
        coin_ids = [self.symbol_map.get(s, s.lower()) for s in self.symbols]
        ids_param = ','.join(coin_ids)
        
        url = f"{self.base_url}/simple/price"
        params = {
            'ids': ids_param,
            'vs_currencies': 'usd',
            'include_24hr_vol': 'true',
            'include_24hr_change': 'true',
            'include_last_updated_at': 'true'
        }
        
        headers = {}
        if COINGECKO_API_KEY:
            headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        await self._process_price_data(data)
                    elif response.status == 429:
                        logger.warning("CoinGecko rate limit hit, backing off")
                        await asyncio.sleep(60)
                    else:
                        logger.error(f"CoinGecko API error: {response.status}")
        except asyncio.TimeoutError:
            logger.error("CoinGecko API timeout")
        except Exception as e:
            logger.error(f"CoinGecko request error: {e}")
    
    async def _process_price_data(self, data: Dict[str, Any]):
        """Process CoinGecko API response and emit ticks/books"""
        ts = datetime.utcnow()
        
        for symbol in self.symbols:
            coin_id = self.symbol_map.get(symbol, symbol.lower())
            
            if coin_id not in data:
                logger.warning(f"No data for {symbol} ({coin_id})")
                continue
            
            coin_data = data[coin_id]
            price = coin_data.get('usd', 0)
            volume_24h = coin_data.get('usd_24h_vol', 0)
            change_24h = coin_data.get('usd_24h_change', 0)
            
            if price <= 0:
                continue
            
            estimated_qty = (volume_24h / 86400) / price if volume_24h > 0 else 1.0
            
            await self.on_tick({
                'symbol': f"{symbol}USDT",
                'price': price,
                'qty': estimated_qty,
                'side': 'buy' if change_24h >= 0 else 'sell',
                'ts': ts,
                'venue': 'coingecko'
            })
            
            spread_bps = 2.0 if symbol in ['BTC', 'ETH'] else 5.0
            spread = price * (spread_bps / 10000)
            
            await self.on_book({
                'symbol': f"{symbol}USDT",
                'bid_px': price - spread/2,
                'ask_px': price + spread/2,
                'bid_sz': estimated_qty * 10,
                'ask_sz': estimated_qty * 10,
                'spread_bps': spread_bps,
                'ts': ts
            })
            
            if symbol in self.last_prices:
                old_price = self.last_prices[symbol]
                change = ((price - old_price) / old_price) * 100
                logger.info(f"{symbol}: ${price:.2f} ({change:+.2f}%)")
            else:
                logger.info(f"{symbol}: ${price:.2f}")
            
            self.last_prices[symbol] = price

import asyncio
import json
import websockets
import logging
from datetime import datetime
from typing import List, Dict, Any
import os

logger = logging.getLogger(__name__)

USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'

class BinanceAdapter:
    def __init__(self, symbols: List[str], on_tick_callback, on_book_callback):
        self.symbols = [s.lower() for s in symbols]
        self.on_tick = on_tick_callback
        self.on_book = on_book_callback
        self.ws_url = "wss://stream.binance.com:9443/ws"
        
    async def start(self):
        if USE_MOCK_DATA:
            logger.info("Using mock data for Binance")
            await self._mock_data_generator()
        else:
            await self._connect_websocket()
    
    async def _mock_data_generator(self):
        import random
        base_prices = {'btc': 45000, 'eth': 2500, 'sol': 100}
        
        while True:
            for symbol in self.symbols:
                base = base_prices.get(symbol.replace('usdt', ''), 1000)
                price = base * (1 + random.uniform(-0.001, 0.001))
                qty = random.uniform(0.01, 1.0)
                
                await self.on_tick({
                    'symbol': symbol.upper(),
                    'price': price,
                    'qty': qty,
                    'side': random.choice(['buy', 'sell']),
                    'ts': datetime.utcnow(),
                    'venue': 'binance'
                })
                
                spread = price * 0.0001
                await self.on_book({
                    'symbol': symbol.upper(),
                    'bid_px': price - spread/2,
                    'ask_px': price + spread/2,
                    'bid_sz': random.uniform(1, 10),
                    'ask_sz': random.uniform(1, 10),
                    'spread_bps': 1.0,
                    'ts': datetime.utcnow()
                })
            
            await asyncio.sleep(5)
    
    async def _connect_websocket(self):
        streams = [f"{s}@trade" for s in self.symbols] + [f"{s}@bookTicker" for s in self.symbols]
        url = f"{self.ws_url}/{'/'.join(streams)}"
        
        while True:
            try:
                async with websockets.connect(url) as ws:
                    logger.info(f"Connected to Binance WebSocket for {self.symbols}")
                    async for message in ws:
                        data = json.loads(message)
                        await self._handle_message(data)
            except Exception as e:
                logger.error(f"Binance WebSocket error: {e}")
                await asyncio.sleep(5)
    
    async def _handle_message(self, data: Dict[str, Any]):
        if 'e' not in data:
            return
        
        if data['e'] == 'trade':
            await self.on_tick({
                'symbol': data['s'],
                'price': float(data['p']),
                'qty': float(data['q']),
                'side': 'buy' if data['m'] else 'sell',
                'ts': datetime.fromtimestamp(data['T'] / 1000),
                'venue': 'binance'
            })
        elif data['e'] == 'bookTicker':
            bid = float(data['b'])
            ask = float(data['a'])
            spread_bps = ((ask - bid) / bid) * 10000 if bid > 0 else 0
            
            await self.on_book({
                'symbol': data['s'],
                'bid_px': bid,
                'ask_px': ask,
                'bid_sz': float(data['B']),
                'ask_sz': float(data['A']),
                'spread_bps': spread_bps,
                'ts': datetime.utcnow()
            })

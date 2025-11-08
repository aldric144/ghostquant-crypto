import asyncio
import json
import websockets
import logging
from datetime import datetime
from typing import List, Dict, Any
import os
import random

logger = logging.getLogger(__name__)

USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'

class BybitAdapter:
    def __init__(self, symbols: List[str], on_derivative_callback):
        self.symbols = symbols
        self.on_derivative = on_derivative_callback
        self.ws_url = "wss://stream.bybit.com/v5/public/linear"
        
    async def start(self):
        if USE_MOCK_DATA:
            logger.info("Using mock data for Bybit derivatives")
            await self._mock_data_generator()
        else:
            await self._connect_websocket()
    
    async def _mock_data_generator(self):
        while True:
            for symbol in self.symbols:
                await self.on_derivative({
                    'symbol': symbol,
                    'funding_8h': random.uniform(-0.01, 0.01),
                    'oi': random.uniform(100000000, 500000000),
                    'basis_bps': random.uniform(-10, 10),
                    'liq_1h': random.uniform(1000000, 10000000),
                    'ts': datetime.utcnow()
                })
            
            await asyncio.sleep(60)
    
    async def _connect_websocket(self):
        while True:
            try:
                async with websockets.connect(self.ws_url) as ws:
                    logger.info(f"Connected to Bybit WebSocket for {self.symbols}")
                    
                    subscribe_msg = {
                        "op": "subscribe",
                        "args": [f"tickers.{s}" for s in self.symbols]
                    }
                    await ws.send(json.dumps(subscribe_msg))
                    
                    async for message in ws:
                        data = json.loads(message)
                        await self._handle_message(data)
            except Exception as e:
                logger.error(f"Bybit WebSocket error: {e}")
                await asyncio.sleep(5)
    
    async def _handle_message(self, data: Dict[str, Any]):
        if 'topic' not in data or 'data' not in data:
            return
        
        if 'tickers' in data['topic']:
            ticker = data['data']
            await self.on_derivative({
                'symbol': ticker.get('symbol'),
                'funding_8h': float(ticker.get('fundingRate', 0)),
                'oi': float(ticker.get('openInterest', 0)),
                'basis_bps': 0,
                'liq_1h': 0,
                'ts': datetime.utcnow()
            })

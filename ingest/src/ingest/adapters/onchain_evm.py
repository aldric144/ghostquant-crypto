import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any
import os
import random

logger = logging.getLogger(__name__)

USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'

class EVMAdapter:
    def __init__(self, assets: List[Dict[str, Any]], on_flow_callback):
        self.assets = assets
        self.on_flow = on_flow_callback
        self.rpc_url = os.getenv('RPC_ETH_MAINNET', '')
        
    async def start(self):
        if USE_MOCK_DATA or not self.rpc_url:
            logger.info("Using mock data for EVM on-chain flows")
            await self._mock_data_generator()
        else:
            await self._subscribe_transfers()
    
    async def _mock_data_generator(self):
        tags = ['exchange', 'whale', 'defi', 'bridge', 'unknown']
        
        while True:
            for asset in self.assets:
                if random.random() < 0.3:
                    await self.on_flow({
                        'asset_id': asset['asset_id'],
                        'from_tag': random.choice(tags),
                        'to_tag': random.choice(tags),
                        'amount': random.uniform(1, 1000),
                        'usd': random.uniform(1000, 1000000),
                        'ts': datetime.utcnow()
                    })
            
            await asyncio.sleep(30)
    
    async def _subscribe_transfers(self):
        try:
            from web3 import Web3
            w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            
            while True:
                try:
                    latest_block = w3.eth.block_number
                    logger.info(f"Monitoring EVM transfers at block {latest_block}")
                    await asyncio.sleep(60)
                except Exception as e:
                    logger.error(f"EVM subscription error: {e}")
                    await asyncio.sleep(30)
        except ImportError:
            logger.warning("web3 not available, using mock data")
            await self._mock_data_generator()

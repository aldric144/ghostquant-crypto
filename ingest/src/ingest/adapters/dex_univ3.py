import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any
import os
import random
import aiohttp

logger = logging.getLogger(__name__)

USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'

class UniswapV3Adapter:
    def __init__(self, pools: List[Dict[str, Any]], on_dex_metrics_callback):
        self.pools = pools
        self.on_dex_metrics = on_dex_metrics_callback
        
    async def start(self):
        if USE_MOCK_DATA:
            logger.info("Using mock data for Uniswap V3")
            await self._mock_data_generator()
        else:
            await self._poll_pools()
    
    async def _mock_data_generator(self):
        while True:
            for pool in self.pools:
                await self.on_dex_metrics({
                    'pool_id': pool['pool_id'],
                    'tvl_usd': random.uniform(10000000, 100000000),
                    'vol_24h': random.uniform(1000000, 50000000),
                    'depth_1pct': random.uniform(500000, 5000000),
                    'ts': datetime.utcnow()
                })
            
            await asyncio.sleep(300)
    
    async def _poll_pools(self):
        while True:
            try:
                async with aiohttp.ClientSession() as session:
                    for pool in self.pools:
                        metrics = await self._fetch_pool_metrics(session, pool)
                        if metrics:
                            await self.on_dex_metrics(metrics)
                
                await asyncio.sleep(300)
            except Exception as e:
                logger.error(f"Uniswap V3 polling error: {e}")
                await asyncio.sleep(60)
    
    async def _fetch_pool_metrics(self, session, pool: Dict[str, Any]) -> Dict[str, Any]:
        query = """
        {
          pool(id: "%s") {
            totalValueLockedUSD
            volumeUSD
            liquidity
          }
        }
        """ % pool['address'].lower()
        
        try:
            async with session.post(
                'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
                json={'query': query}
            ) as resp:
                data = await resp.json()
                pool_data = data.get('data', {}).get('pool', {})
                
                return {
                    'pool_id': pool['pool_id'],
                    'tvl_usd': float(pool_data.get('totalValueLockedUSD', 0)),
                    'vol_24h': float(pool_data.get('volumeUSD', 0)),
                    'depth_1pct': float(pool_data.get('liquidity', 0)) * 0.01,
                    'ts': datetime.utcnow()
                }
        except Exception as e:
            logger.error(f"Error fetching pool {pool['address']}: {e}")
            return None

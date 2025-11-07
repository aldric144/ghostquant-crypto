import asyncio
import logging
import psycopg
from psycopg.rows import dict_row
import os
from datetime import datetime
from signals.factors import compute_factors_for_asset
from signals.trendscore import generate_signal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

class SignalsScheduler:
    def __init__(self):
        self.conn = None
        self.interval = 60
        
    async def initialize(self):
        self.conn = await psycopg.AsyncConnection.connect(DATABASE_URL)
        logger.info("Signals scheduler initialized")
        
    async def get_active_assets(self):
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT asset_id, symbol FROM assets ORDER BY asset_id")
            return await cur.fetchall()
    
    async def save_factors(self, factors):
        query = """
            INSERT INTO factors (
                asset_id, ts, mom_1h, mom_24h, accel_1h, vol_regime,
                depth_delta, volume_z, funding_flip, oi_shift, tvl_accel, flow_score
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        async with self.conn.cursor() as cur:
            await cur.execute(query, (
                factors['asset_id'],
                factors['ts'],
                factors['mom_1h'],
                factors['mom_24h'],
                factors['accel_1h'],
                factors['vol_regime'],
                factors['depth_delta'],
                factors['volume_z'],
                factors['funding_flip'],
                factors['oi_shift'],
                factors['tvl_accel'],
                factors['flow_score']
            ))
            await self.conn.commit()
    
    async def save_signal(self, signal):
        import json
        query = """
            INSERT INTO signals (
                asset_id, ts, trend_score, pretrend_prob, action, confidence, rationale
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        async with self.conn.cursor() as cur:
            await cur.execute(query, (
                signal['asset_id'],
                signal['ts'],
                signal['trend_score'],
                signal['pretrend_prob'],
                signal['action'],
                signal['confidence'],
                json.dumps(signal['rationale'])
            ))
            await self.conn.commit()
    
    async def process_asset(self, asset):
        try:
            async with self.conn.cursor(row_factory=dict_row) as cur:
                factors = await compute_factors_for_asset(cur, asset['asset_id'])
                
                await self.save_factors(factors)
                logger.info(f"Computed factors for {asset['symbol']}")
                
                signal = generate_signal(factors)
                
                await self.save_signal(signal)
                logger.info(f"Generated signal for {asset['symbol']}: {signal['action']} (score={signal['trend_score']:.1f})")
                
        except Exception as e:
            logger.error(f"Error processing asset {asset['symbol']}: {e}")
    
    async def run_cycle(self):
        assets = await self.get_active_assets()
        logger.info(f"Processing {len(assets)} assets")
        
        for asset in assets:
            await self.process_asset(asset)
    
    async def start(self):
        await self.initialize()
        
        logger.info(f"Starting signals scheduler (interval={self.interval}s)")
        
        while True:
            try:
                await self.run_cycle()
            except Exception as e:
                logger.error(f"Error in scheduler cycle: {e}")
            
            await asyncio.sleep(self.interval)

async def main():
    scheduler = SignalsScheduler()
    await scheduler.start()

if __name__ == "__main__":
    asyncio.run(main())

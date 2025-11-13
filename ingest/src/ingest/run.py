import asyncio
import logging
import psycopg
from psycopg.rows import dict_row
import os
from datetime import datetime
from ingest.adapters.cex_binance import BinanceAdapter
from ingest.adapters.cex_bybit import BybitAdapter
from ingest.adapters.dex_univ3 import UniswapV3Adapter
from ingest.adapters.onchain_evm import EVMAdapter
from ingest.adapters.api_coingecko import CoinGeckoAdapter
from ingest.utils.timeseries import (
    batch_insert_ticks, batch_insert_books, 
    batch_insert_derivatives, batch_insert_dex_metrics,
    batch_insert_onchain_flows
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

class IngestionOrchestrator:
    def __init__(self):
        self.conn = None
        self.assets = {}
        self.pools = {}
        self.tick_buffer = []
        self.book_buffer = []
        self.derivative_buffer = []
        self.dex_metrics_buffer = []
        self.flow_buffer = []
        self.buffer_size = 100
        
    async def initialize(self):
        self.conn = await psycopg.AsyncConnection.connect(DATABASE_URL)
        await self._load_assets()
        await self._load_pools()
        logger.info(f"Loaded {len(self.assets)} assets and {len(self.pools)} pools")
        
    async def _load_assets(self):
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM assets")
            rows = await cur.fetchall()
            for row in rows:
                self.assets[row['symbol']] = row
                
    async def _load_pools(self):
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM dex_pools")
            rows = await cur.fetchall()
            for row in rows:
                self.pools[row['pool_id']] = row
    
    async def on_tick(self, tick_data):
        symbol = tick_data['symbol'].replace('USDT', '')
        if symbol not in self.assets:
            return
            
        self.tick_buffer.append({
            'asset_id': self.assets[symbol]['asset_id'],
            'ts': tick_data['ts'],
            'price': tick_data['price'],
            'qty': tick_data['qty'],
            'side': tick_data.get('side'),
            'venue': tick_data.get('venue')
        })
        
        if len(self.tick_buffer) >= self.buffer_size:
            await self._flush_ticks()
    
    async def on_book(self, book_data):
        symbol = book_data['symbol'].replace('USDT', '')
        if symbol not in self.assets:
            return
            
        self.book_buffer.append({
            'asset_id': self.assets[symbol]['asset_id'],
            'ts': book_data['ts'],
            'bid_px': book_data['bid_px'],
            'ask_px': book_data['ask_px'],
            'bid_sz': book_data['bid_sz'],
            'ask_sz': book_data['ask_sz'],
            'spread_bps': book_data.get('spread_bps')
        })
        
        if len(self.book_buffer) >= self.buffer_size:
            await self._flush_books()
    
    async def on_derivative(self, deriv_data):
        symbol = deriv_data['symbol'].replace('USDT', '')
        if symbol not in self.assets:
            return
            
        self.derivative_buffer.append({
            'asset_id': self.assets[symbol]['asset_id'],
            'ts': deriv_data['ts'],
            'funding_8h': deriv_data.get('funding_8h'),
            'oi': deriv_data.get('oi'),
            'basis_bps': deriv_data.get('basis_bps'),
            'liq_1h': deriv_data.get('liq_1h')
        })
        
        if len(self.derivative_buffer) >= 10:
            await self._flush_derivatives()
    
    async def on_dex_metrics(self, metrics_data):
        self.dex_metrics_buffer.append(metrics_data)
        
        if len(self.dex_metrics_buffer) >= 10:
            await self._flush_dex_metrics()
    
    async def on_flow(self, flow_data):
        self.flow_buffer.append(flow_data)
        
        if len(self.flow_buffer) >= 50:
            await self._flush_flows()
    
    async def _flush_ticks(self):
        if self.tick_buffer:
            await batch_insert_ticks(self.conn, self.tick_buffer)
            logger.info(f"Flushed {len(self.tick_buffer)} ticks")
            self.tick_buffer = []
    
    async def _flush_books(self):
        if self.book_buffer:
            await batch_insert_books(self.conn, self.book_buffer)
            logger.info(f"Flushed {len(self.book_buffer)} books")
            self.book_buffer = []
    
    async def _flush_derivatives(self):
        if self.derivative_buffer:
            await batch_insert_derivatives(self.conn, self.derivative_buffer)
            logger.info(f"Flushed {len(self.derivative_buffer)} derivatives")
            self.derivative_buffer = []
    
    async def _flush_dex_metrics(self):
        if self.dex_metrics_buffer:
            await batch_insert_dex_metrics(self.conn, self.dex_metrics_buffer)
            logger.info(f"Flushed {len(self.dex_metrics_buffer)} dex metrics")
            self.dex_metrics_buffer = []
    
    async def _flush_flows(self):
        if self.flow_buffer:
            await batch_insert_onchain_flows(self.conn, self.flow_buffer)
            logger.info(f"Flushed {len(self.flow_buffer)} flows")
            self.flow_buffer = []
    
    async def periodic_flush(self):
        while True:
            await asyncio.sleep(30)
            await self._flush_ticks()
            await self._flush_books()
            await self._flush_derivatives()
            await self._flush_dex_metrics()
            await self._flush_flows()
    
    async def start(self):
        await self.initialize()
        
        symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
        spot_symbols = ['BTC', 'ETH', 'SOL']  # CoinGecko format
        
        coingecko_api_key = os.getenv('COINGECKO_API_KEY', '')
        use_coingecko = coingecko_api_key or os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'
        
        if use_coingecko:
            logger.info("Using CoinGecko adapter for spot prices (US-friendly)")
            spot_adapter = CoinGeckoAdapter(spot_symbols, self.on_tick, self.on_book)
        else:
            logger.info("Using Binance adapter for spot prices")
            spot_adapter = BinanceAdapter(symbols, self.on_tick, self.on_book)
        
        bybit = BybitAdapter(symbols, self.on_derivative)
        
        pools_list = [{'pool_id': p['pool_id'], 'address': p['address']} for p in self.pools.values()]
        uniswap = UniswapV3Adapter(pools_list, self.on_dex_metrics)
        
        assets_list = [{'asset_id': a['asset_id'], 'symbol': a['symbol']} for a in self.assets.values()]
        evm = EVMAdapter(assets_list, self.on_flow)
        
        await asyncio.gather(
            spot_adapter.start(),
            bybit.start(),
            uniswap.start(),
            evm.start(),
            self.periodic_flush()
        )

async def main():
    orchestrator = IngestionOrchestrator()
    await orchestrator.start()

if __name__ == "__main__":
    asyncio.run(main())

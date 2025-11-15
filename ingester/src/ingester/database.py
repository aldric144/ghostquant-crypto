"""Database operations for ingester."""
import asyncpg
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from .config import config

logger = logging.getLogger(__name__)


class Database:
    """Database connection and operations."""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create database connection pool."""
        if self.pool is None:
            self.pool = await asyncpg.create_pool(
                config.postgres_url,
                min_size=2,
                max_size=10
            )
            logger.info("Database connection pool created")
    
    async def close(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def upsert_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        data: List[Dict[str, Any]],
        source: str = "coingecko"
    ) -> int:
        """
        Upsert OHLCV data into database.
        
        Args:
            symbol: Coin symbol
            timeframe: Timeframe (e.g., '1d', '1h')
            data: List of OHLCV dicts with keys: ts, open, high, low, close, volume
            source: Data source
            
        Returns:
            Number of rows inserted/updated
        """
        if not self.pool:
            await self.connect()
        
        if not data:
            return 0
        
        records = [
            (
                symbol,
                row['ts'],
                row['open'],
                row['high'],
                row['low'],
                row['close'],
                row['volume'],
                timeframe,
                source
            )
            for row in data
        ]
        
        query = """
            INSERT INTO ohlcv (symbol, ts, open, high, low, close, volume, timeframe, source)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (symbol, ts, timeframe) DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                source = EXCLUDED.source
        """
        
        async with self.pool.acquire() as conn:
            await conn.executemany(query, records)
        
        logger.info(f"Upserted {len(records)} OHLCV records for {symbol} ({timeframe})")
        return len(records)
    
    async def upsert_supply(
        self,
        symbol: str,
        data: List[Dict[str, Any]],
        source: str = "coingecko"
    ) -> int:
        """
        Upsert supply data into database.
        
        Args:
            symbol: Coin symbol
            data: List of supply dicts with keys: ts, circulating_supply, total_supply, max_supply
            source: Data source
            
        Returns:
            Number of rows inserted/updated
        """
        if not self.pool:
            await self.connect()
        
        if not data:
            return 0
        
        records = [
            (
                symbol,
                row['ts'],
                row.get('circulating_supply'),
                row.get('total_supply'),
                row.get('max_supply'),
                source
            )
            for row in data
        ]
        
        query = """
            INSERT INTO supply (symbol, ts, circulating_supply, total_supply, max_supply, source)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (symbol, ts) DO UPDATE SET
                circulating_supply = EXCLUDED.circulating_supply,
                total_supply = EXCLUDED.total_supply,
                max_supply = EXCLUDED.max_supply,
                source = EXCLUDED.source
        """
        
        async with self.pool.acquire() as conn:
            await conn.executemany(query, records)
        
        logger.info(f"Upserted {len(records)} supply records for {symbol}")
        return len(records)
    
    async def get_latest_ohlcv_timestamp(
        self,
        symbol: str,
        timeframe: str
    ) -> Optional[datetime]:
        """
        Get the latest timestamp for OHLCV data.
        
        Args:
            symbol: Coin symbol
            timeframe: Timeframe
            
        Returns:
            Latest timestamp or None if no data exists
        """
        if not self.pool:
            await self.connect()
        
        query = """
            SELECT MAX(ts) as latest_ts
            FROM ohlcv
            WHERE symbol = $1 AND timeframe = $2
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, symbol, timeframe)
            return row['latest_ts'] if row else None
    
    async def get_ohlcv_count(
        self,
        symbol: str,
        timeframe: str
    ) -> int:
        """
        Get count of OHLCV records.
        
        Args:
            symbol: Coin symbol
            timeframe: Timeframe
            
        Returns:
            Number of records
        """
        if not self.pool:
            await self.connect()
        
        query = """
            SELECT COUNT(*) as count
            FROM ohlcv
            WHERE symbol = $1 AND timeframe = $2
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, symbol, timeframe)
            return row['count'] if row else 0

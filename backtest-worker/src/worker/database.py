"""Database operations for backtest worker."""
import asyncpg
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

from .config import config

logger = logging.getLogger(__name__)


class Database:
    """Database connection and operations for backtest worker."""
    
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
    
    async def get_ohlcv_data(
        self,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Get OHLCV data for backtesting.
        
        Args:
            symbol: Coin symbol
            timeframe: Timeframe
            start_date: Start date
            end_date: End date
            
        Returns:
            List of OHLCV records
        """
        if not self.pool:
            await self.connect()
        
        query = """
            SELECT ts, open, high, low, close, volume
            FROM ohlcv
            WHERE symbol = $1 AND timeframe = $2 AND ts >= $3 AND ts <= $4
            ORDER BY ts ASC
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, symbol, timeframe, start_date, end_date)
            
            return [
                {
                    'ts': row['ts'],
                    'open': row['open'],
                    'high': row['high'],
                    'low': row['low'],
                    'close': row['close'],
                    'volume': row['volume']
                }
                for row in rows
            ]
    
    async def update_backtest_status(
        self,
        run_id: str,
        status: str,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        error_message: Optional[str] = None,
        metrics: Optional[Dict[str, Any]] = None
    ):
        """
        Update backtest run status.
        
        Args:
            run_id: Run ID
            status: New status
            started_at: Start timestamp
            completed_at: Completion timestamp
            error_message: Error message if failed
            metrics: Performance metrics if completed
        """
        if not self.pool:
            await self.connect()
        
        updates = ['status = $2']
        params = [run_id, status]
        param_idx = 3
        
        if started_at:
            updates.append(f'started_at = ${param_idx}')
            params.append(started_at)
            param_idx += 1
        
        if completed_at:
            updates.append(f'completed_at = ${param_idx}')
            params.append(completed_at)
            param_idx += 1
        
        if error_message:
            updates.append(f'error_message = ${param_idx}')
            params.append(error_message)
            param_idx += 1
        
        if metrics:
            for key, value in metrics.items():
                updates.append(f'{key} = ${param_idx}')
                params.append(value)
                param_idx += 1
        
        query = f"""
            UPDATE backtest_runs
            SET {', '.join(updates)}
            WHERE run_id = $1
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(query, *params)
        
        logger.info(f"Updated backtest {run_id} status to {status}")
    
    async def insert_backtest_trade(
        self,
        run_id: str,
        trade_data: Dict[str, Any]
    ):
        """
        Insert a backtest trade record.
        
        Args:
            run_id: Run ID
            trade_data: Trade data dict
        """
        if not self.pool:
            await self.connect()
        
        query = """
            INSERT INTO backtest_trades (
                run_id, ts, symbol, side, quantity, price,
                slippage_bps, commission, pnl, cumulative_pnl, reason, signal_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(
                query,
                run_id,
                trade_data['ts'],
                trade_data['symbol'],
                trade_data['side'],
                trade_data['quantity'],
                trade_data['price'],
                trade_data.get('slippage_bps', 0),
                trade_data.get('commission', 0),
                trade_data.get('pnl', 0),
                trade_data.get('cumulative_pnl', 0),
                trade_data.get('reason', ''),
                json.dumps(trade_data.get('signal_data', {}))
            )
    
    async def insert_equity_snapshot(
        self,
        run_id: str,
        ts: datetime,
        equity: float,
        cash: float,
        position_value: float,
        drawdown_pct: float
    ):
        """
        Insert an equity curve snapshot.
        
        Args:
            run_id: Run ID
            ts: Timestamp
            equity: Total equity
            cash: Cash balance
            position_value: Position value
            drawdown_pct: Drawdown percentage
        """
        if not self.pool:
            await self.connect()
        
        query = """
            INSERT INTO backtest_equity (run_id, ts, equity, cash, position_value, drawdown_pct)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (run_id, ts) DO UPDATE SET
                equity = EXCLUDED.equity,
                cash = EXCLUDED.cash,
                position_value = EXCLUDED.position_value,
                drawdown_pct = EXCLUDED.drawdown_pct
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(query, run_id, ts, equity, cash, position_value, drawdown_pct)
    
    async def update_csv_path(self, run_id: str, csv_path: str):
        """Update CSV file path for a backtest run."""
        if not self.pool:
            await self.connect()
        
        query = "UPDATE backtest_runs SET csv_path = $2 WHERE run_id = $1"
        
        async with self.pool.acquire() as conn:
            await conn.execute(query, run_id, csv_path)

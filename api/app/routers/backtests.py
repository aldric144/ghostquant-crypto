"""Backtest API routes."""
import logging
import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
import redis
from rq import Queue
from rq.job import Job

from ..db import get_db_pool

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/backtests", tags=["backtests"])


class BacktestCreate(BaseModel):
    """Request model for creating a backtest."""
    strategy: str = Field(..., description="Strategy name (e.g., 'trend_v1')")
    symbol: str = Field(..., description="Coin symbol (e.g., 'BTC')")
    timeframe: str = Field(default="1d", description="Timeframe (e.g., '1d', '1h')")
    start_date: str = Field(..., description="Start date (ISO format: 2024-01-01)")
    end_date: str = Field(..., description="End date (ISO format: 2024-06-01)")
    initial_capital: float = Field(default=10000, description="Initial capital")
    params: dict = Field(default_factory=dict, description="Strategy parameters")


class BacktestResponse(BaseModel):
    """Response model for backtest."""
    run_id: str
    strategy: str
    symbol: str
    timeframe: str
    start_date: str
    end_date: str
    initial_capital: float
    params_json: Optional[dict] = None
    status: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None
    sharpe: Optional[float] = None
    sortino: Optional[float] = None
    max_dd: Optional[float] = None
    cagr: Optional[float] = None
    total_return: Optional[float] = None
    win_rate: Optional[float] = None
    profit_factor: Optional[float] = None
    trade_count: Optional[int] = None
    final_capital: Optional[float] = None
    csv_path: Optional[str] = None


class BacktestListResponse(BaseModel):
    """Response model for backtest list."""
    total: int
    page: int
    limit: int
    results: List[BacktestResponse]


class BacktestTradeResponse(BaseModel):
    """Response model for backtest trade."""
    trade_id: int
    ts: str
    symbol: str
    side: str
    quantity: float
    price: float
    slippage_bps: float
    commission: float
    pnl: float
    cumulative_pnl: float
    reason: str


class BacktestResultsResponse(BaseModel):
    """Response model for backtest results."""
    run_id: str
    trades: List[BacktestTradeResponse]
    equity_curve: List[dict]


@router.post("", response_model=BacktestResponse)
async def create_backtest(request: BacktestCreate):
    """
    Create a new backtest job.
    
    Queues the backtest for execution by a worker.
    """
    try:
        run_id = str(uuid.uuid4())
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO backtest_runs (
                    run_id, strategy, symbol, timeframe, start_date, end_date,
                    initial_capital, params_json, status, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
                """,
                run_id,
                request.strategy,
                request.symbol.upper(),
                request.timeframe,
                datetime.fromisoformat(request.start_date),
                datetime.fromisoformat(request.end_date),
                request.initial_capital,
                json.dumps(request.params),
                'pending',
                datetime.utcnow()
            )
        
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        queue_name = os.getenv("BACKTEST_QUEUE_NAME", "backtests")
        
        redis_conn = redis.from_url(redis_url)
        queue = Queue(queue_name, connection=redis_conn)
        
        job_data = {
            'run_id': run_id,
            'strategy': request.strategy,
            'symbol': request.symbol.upper(),
            'timeframe': request.timeframe,
            'start_date': request.start_date,
            'end_date': request.end_date,
            'initial_capital': request.initial_capital,
            'params': request.params
        }
        
        job = queue.enqueue(
            'worker.tasks.run_backtest',
            job_data,
            job_timeout=os.getenv("BACKTEST_MAX_RUNTIME_SECONDS", "7200")
        )
        
        logger.info(f"Created backtest {run_id}, queued as job {job.id}")
        
        return BacktestResponse(
            run_id=run_id,
            strategy=request.strategy,
            symbol=request.symbol.upper(),
            timeframe=request.timeframe,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_capital,
            params_json=request.params,
            status='pending',
            created_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error creating backtest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=BacktestListResponse)
async def list_backtests(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    symbol: Optional[str] = Query(None)
):
    """
    List all backtests with pagination and filtering.
    """
    try:
        pool = await get_db_pool()
        
        where_clauses = []
        params = []
        param_idx = 1
        
        if status:
            where_clauses.append(f"status = ${param_idx}")
            params.append(status)
            param_idx += 1
        
        if symbol:
            where_clauses.append(f"symbol = ${param_idx}")
            params.append(symbol.upper())
            param_idx += 1
        
        where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        
        async with pool.acquire() as conn:
            count_row = await conn.fetchrow(
                f"SELECT COUNT(*) as total FROM backtest_runs {where_sql}",
                *params
            )
            total = count_row['total']
            
            offset = (page - 1) * limit
            rows = await conn.fetch(
                f"""
                SELECT * FROM backtest_runs
                {where_sql}
                ORDER BY created_at DESC
                LIMIT ${param_idx} OFFSET ${param_idx + 1}
                """,
                *params, limit, offset
            )
        
        results = [
            BacktestResponse(
                run_id=str(row['run_id']),
                strategy=row['strategy'],
                symbol=row['symbol'],
                timeframe=row['timeframe'],
                start_date=row['start_date'].isoformat(),
                end_date=row['end_date'].isoformat(),
                initial_capital=row['initial_capital'],
                params_json=row['params_json'],
                status=row['status'],
                created_at=row['created_at'].isoformat(),
                started_at=row['started_at'].isoformat() if row['started_at'] else None,
                completed_at=row['completed_at'].isoformat() if row['completed_at'] else None,
                error_message=row['error_message'],
                sharpe=row['sharpe'],
                sortino=row['sortino'],
                max_dd=row['max_dd'],
                cagr=row['cagr'],
                total_return=row['total_return'],
                win_rate=row['win_rate'],
                profit_factor=row['profit_factor'],
                trade_count=row['trade_count'],
                final_capital=row['final_capital'],
                csv_path=row['csv_path']
            )
            for row in rows
        ]
        
        return BacktestListResponse(
            total=total,
            page=page,
            limit=limit,
            results=results
        )
        
    except Exception as e:
        logger.error(f"Error listing backtests: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{run_id}", response_model=BacktestResponse)
async def get_backtest(run_id: str):
    """
    Get a specific backtest by ID.
    """
    try:
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM backtest_runs WHERE run_id = $1",
                uuid.UUID(run_id)
            )
        
        if not row:
            raise HTTPException(status_code=404, detail="Backtest not found")
        
        return BacktestResponse(
            run_id=str(row['run_id']),
            strategy=row['strategy'],
            symbol=row['symbol'],
            timeframe=row['timeframe'],
            start_date=row['start_date'].isoformat(),
            end_date=row['end_date'].isoformat(),
            initial_capital=row['initial_capital'],
            params_json=row['params_json'],
            status=row['status'],
            created_at=row['created_at'].isoformat(),
            started_at=row['started_at'].isoformat() if row['started_at'] else None,
            completed_at=row['completed_at'].isoformat() if row['completed_at'] else None,
            error_message=row['error_message'],
            sharpe=row['sharpe'],
            sortino=row['sortino'],
            max_dd=row['max_dd'],
            cagr=row['cagr'],
            total_return=row['total_return'],
            win_rate=row['win_rate'],
            profit_factor=row['profit_factor'],
            trade_count=row['trade_count'],
            final_capital=row['final_capital'],
            csv_path=row['csv_path']
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid run_id format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting backtest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{run_id}/results", response_model=BacktestResultsResponse)
async def get_backtest_results(run_id: str):
    """
    Get detailed results for a backtest including trades and equity curve.
    """
    try:
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            trade_rows = await conn.fetch(
                """
                SELECT * FROM backtest_trades
                WHERE run_id = $1
                ORDER BY ts ASC
                """,
                uuid.UUID(run_id)
            )
            
            equity_rows = await conn.fetch(
                """
                SELECT * FROM backtest_equity
                WHERE run_id = $1
                ORDER BY ts ASC
                """,
                uuid.UUID(run_id)
            )
        
        trades = [
            BacktestTradeResponse(
                trade_id=row['trade_id'],
                ts=row['ts'].isoformat(),
                symbol=row['symbol'],
                side=row['side'],
                quantity=row['quantity'],
                price=row['price'],
                slippage_bps=row['slippage_bps'],
                commission=row['commission'],
                pnl=row['pnl'],
                cumulative_pnl=row['cumulative_pnl'],
                reason=row['reason']
            )
            for row in trade_rows
        ]
        
        equity_curve = [
            {
                'ts': row['ts'].isoformat(),
                'equity': row['equity'],
                'cash': row['cash'],
                'position_value': row['position_value'],
                'drawdown_pct': row['drawdown_pct']
            }
            for row in equity_rows
        ]
        
        return BacktestResultsResponse(
            run_id=run_id,
            trades=trades,
            equity_curve=equity_curve
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid run_id format")
    except Exception as e:
        logger.error(f"Error getting backtest results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{run_id}/cancel")
async def cancel_backtest(run_id: str):
    """
    Cancel a running backtest.
    """
    try:
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT status FROM backtest_runs WHERE run_id = $1",
                uuid.UUID(run_id)
            )
        
        if not row:
            raise HTTPException(status_code=404, detail="Backtest not found")
        
        if row['status'] not in ['pending', 'running']:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel backtest with status: {row['status']}"
            )
        
        async with pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE backtest_runs
                SET status = 'cancelled', completed_at = $2
                WHERE run_id = $1
                """,
                uuid.UUID(run_id),
                datetime.utcnow()
            )
        
        
        logger.info(f"Cancelled backtest {run_id}")
        
        return {"message": "Backtest cancelled", "run_id": run_id}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid run_id format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling backtest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Health check endpoint for backtest service.
    """
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        import os
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        redis_conn = redis.from_url(redis_url)
        redis_conn.ping()
        
        return {
            "status": "ok",
            "database": "connected",
            "redis": "connected"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


import os

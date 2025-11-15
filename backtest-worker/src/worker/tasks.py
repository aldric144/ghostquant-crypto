"""Backtest worker tasks."""
import asyncio
import logging
import traceback
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import uuid

from .config import config
from .database import Database
from .backtest_runner import BacktestRunner

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_backtest(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run a backtest job.
    
    This is the main worker task that gets executed by RQ.
    
    Args:
        job_data: Dict with keys:
            - run_id: UUID of the backtest run
            - strategy: Strategy name
            - symbol: Coin symbol
            - timeframe: Timeframe (e.g., '1d')
            - start_date: Start date (ISO string)
            - end_date: End date (ISO string)
            - initial_capital: Initial capital
            - params: Strategy parameters
    
    Returns:
        Dict with results
    """
    run_id = job_data.get('run_id')
    
    try:
        logger.info(f"Starting backtest job {run_id}")
        
        result = asyncio.run(_run_backtest_async(job_data))
        
        logger.info(f"Backtest job {run_id} completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Backtest job {run_id} failed: {e}")
        logger.error(traceback.format_exc())
        
        try:
            asyncio.run(_mark_backtest_failed(run_id, str(e)))
        except Exception as update_error:
            logger.error(f"Failed to update backtest status: {update_error}")
        
        raise


async def _run_backtest_async(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Async implementation of backtest execution.
    
    Args:
        job_data: Job data dict
        
    Returns:
        Results dict
    """
    run_id = job_data.get('run_id')
    strategy = job_data.get('strategy')
    symbol = job_data.get('symbol')
    timeframe = job_data.get('timeframe', '1d')
    start_date = datetime.fromisoformat(job_data.get('start_date'))
    end_date = datetime.fromisoformat(job_data.get('end_date'))
    initial_capital = job_data.get('initial_capital', 10000)
    params = job_data.get('params', {})
    
    db = Database()
    runner = BacktestRunner(db)
    
    try:
        await db.update_backtest_status(run_id, 'running', started_at=datetime.utcnow())
        
        result = await runner.run_backtest(
            run_id=run_id,
            strategy=strategy,
            symbol=symbol,
            timeframe=timeframe,
            start_date=start_date,
            end_date=end_date,
            initial_capital=initial_capital,
            params=params
        )
        
        await db.update_backtest_status(
            run_id,
            'success',
            completed_at=datetime.utcnow(),
            metrics=result['metrics']
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error running backtest {run_id}: {e}")
        await db.update_backtest_status(
            run_id,
            'failed',
            completed_at=datetime.utcnow(),
            error_message=str(e)
        )
        raise
        
    finally:
        await db.close()


async def _mark_backtest_failed(run_id: str, error_message: str):
    """Mark a backtest as failed."""
    db = Database()
    try:
        await db.update_backtest_status(
            run_id,
            'failed',
            completed_at=datetime.utcnow(),
            error_message=error_message
        )
    finally:
        await db.close()

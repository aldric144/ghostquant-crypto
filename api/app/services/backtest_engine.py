"""
Backtest engine - runs historical backtests of momentum strategy.
"""
import os
import logging
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import numpy as np
from .coingecko_client import CoinGeckoClient
from .momentum_scorer import MomentumScorer

logger = logging.getLogger(__name__)


class BacktestEngine:
    """
    Backtest momentum strategy on historical data.
    Simulates entries/exits based on momentum thresholds and computes performance metrics.
    """
    
    def __init__(self):
        self.coingecko_client = CoinGeckoClient()
        self.momentum_scorer = MomentumScorer()
        self.default_threshold = float(os.getenv("BACKTEST_DEFAULT_THRESHOLD", 70))
        self.default_hold_hours = int(os.getenv("BACKTEST_HOLD_HOURS", 24))
        
        self.jobs = {}
    
    async def create_job(
        self,
        strategy: str,
        symbol: Optional[str],
        start_date: str,
        end_date: str,
        threshold: float,
        hold_hours: int,
        db
    ) -> str:
        """
        Create a backtest job and queue it for execution.
        Returns job_id immediately; results computed asynchronously.
        """
        try:
            job_id = str(uuid.uuid4())
            
            self.jobs[job_id] = {
                "job_id": job_id,
                "strategy": strategy,
                "symbol": symbol,
                "start_date": start_date,
                "end_date": end_date,
                "threshold": threshold,
                "hold_hours": hold_hours,
                "status": "queued",
                "created_at": datetime.utcnow().isoformat()
            }
            
            await self._run_backtest(job_id)
            
            return job_id
        
        except Exception as e:
            logger.error(f"Error creating backtest job: {e}")
            raise
    
    async def _run_backtest(self, job_id: str):
        """
        Execute the backtest computation.
        """
        try:
            job = self.jobs[job_id]
            job["status"] = "running"
            
            symbol = job["symbol"]
            start_date = datetime.fromisoformat(job["start_date"])
            end_date = datetime.fromisoformat(job["end_date"])
            threshold = job["threshold"]
            hold_hours = job["hold_hours"]
            
            days = (end_date - start_date).days
            
            if symbol:
                historical_data = await self.coingecko_client.get_historical_data(symbol, days=days)
                results = await self._backtest_symbol(symbol, historical_data, threshold, hold_hours)
            else:
                results = await self._backtest_portfolio(days, threshold, hold_hours)
            
            job["status"] = "completed"
            job["metrics"] = results["metrics"]
            job["trades"] = results["trades"]
            job["completed_at"] = datetime.utcnow().isoformat()
            
        except Exception as e:
            logger.error(f"Error running backtest {job_id}: {e}", exc_info=True)
            job["status"] = "failed"
            job["error"] = str(e)
    
    async def _backtest_symbol(
        self,
        symbol: str,
        historical_data: List[List[float]],
        threshold: float,
        hold_hours: int
    ) -> Dict[str, Any]:
        """
        Backtest a single symbol.
        """
        if not historical_data or len(historical_data) < 2:
            return {
                "metrics": {
                    "total_return": 0,
                    "sharpe": 0,
                    "max_drawdown": 0,
                    "win_rate": 0,
                    "trade_count": 0
                },
                "trades": []
            }
        
        timestamps = np.array([d[0] for d in historical_data])
        prices = np.array([d[1] for d in historical_data])
        
        returns = np.diff(prices) / prices[:-1]
        momentum_scores = []
        
        for i in range(len(returns)):
            if i < 24:
                momentum_scores.append(50)  # Neutral
            else:
                recent_return = np.mean(returns[i-24:i])
                score = min(100, max(0, (recent_return * 100) + 50))
                momentum_scores.append(score)
        
        momentum_scores.append(momentum_scores[-1] if momentum_scores else 50)
        
        trades = []
        position = None
        equity = 1.0  # Start with $1
        equity_curve = [equity]
        
        for i in range(len(prices) - 1):
            current_score = momentum_scores[i]
            current_price = prices[i]
            
            if position is None and current_score >= threshold:
                position = {
                    "entry_time": timestamps[i],
                    "entry_price": current_price,
                    "entry_score": current_score,
                    "hold_until": timestamps[i] + (hold_hours * 3600 * 1000)
                }
            
            elif position is not None:
                should_exit = False
                exit_reason = ""
                
                if timestamps[i] >= position["hold_until"]:
                    should_exit = True
                    exit_reason = "time_limit"
                
                elif current_price < position["entry_price"] * 0.9:
                    should_exit = True
                    exit_reason = "stop_loss"
                
                elif current_price > position["entry_price"] * 1.2:
                    should_exit = True
                    exit_reason = "take_profit"
                
                if should_exit:
                    pnl_pct = (current_price - position["entry_price"]) / position["entry_price"]
                    equity *= (1 + pnl_pct)
                    
                    trades.append({
                        "entry_time": datetime.fromtimestamp(position["entry_time"] / 1000).isoformat(),
                        "exit_time": datetime.fromtimestamp(timestamps[i] / 1000).isoformat(),
                        "entry_price": position["entry_price"],
                        "exit_price": current_price,
                        "pnl_pct": pnl_pct * 100,
                        "reason": exit_reason
                    })
                    
                    position = None
            
            equity_curve.append(equity)
        
        total_return = (equity - 1) * 100
        
        if len(trades) > 0:
            returns_array = np.array([t["pnl_pct"] for t in trades])
            sharpe = (np.mean(returns_array) / np.std(returns_array)) * np.sqrt(252) if np.std(returns_array) > 0 else 0
            win_rate = len([t for t in trades if t["pnl_pct"] > 0]) / len(trades) * 100
        else:
            sharpe = 0
            win_rate = 0
        
        equity_curve = np.array(equity_curve)
        running_max = np.maximum.accumulate(equity_curve)
        drawdown = (equity_curve - running_max) / running_max
        max_drawdown = abs(np.min(drawdown)) * 100
        
        return {
            "metrics": {
                "total_return": round(total_return, 2),
                "sharpe": round(sharpe, 2),
                "max_drawdown": round(max_drawdown, 2),
                "win_rate": round(win_rate, 2),
                "trade_count": len(trades),
                "final_equity": round(equity, 4)
            },
            "trades": trades[:50]  # Return first 50 trades
        }
    
    async def _backtest_portfolio(
        self,
        days: int,
        threshold: float,
        hold_hours: int
    ) -> Dict[str, Any]:
        """
        Backtest a portfolio strategy (simplified mock for now).
        """
        return {
            "metrics": {
                "total_return": 15.5,
                "sharpe": 1.2,
                "max_drawdown": 8.3,
                "win_rate": 62.5,
                "trade_count": 24,
                "final_equity": 1.155
            },
            "trades": [
                {
                    "entry_time": datetime.utcnow().isoformat(),
                    "exit_time": datetime.utcnow().isoformat(),
                    "symbol": "BTC",
                    "entry_price": 50000,
                    "exit_price": 52000,
                    "pnl_pct": 4.0,
                    "reason": "take_profit"
                }
            ]
        }
    
    async def get_result(self, job_id: str, db) -> Optional[Dict[str, Any]]:
        """
        Get backtest results by job ID.
        """
        return self.jobs.get(job_id)

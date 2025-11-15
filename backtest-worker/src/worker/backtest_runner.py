"""Backtest execution engine."""
import logging
import csv
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from .config import config
from .database import Database

logger = logging.getLogger(__name__)


class BacktestRunner:
    """
    Executes backtests using historical OHLCV data.
    
    Supports multiple strategies and generates performance metrics.
    """
    
    def __init__(self, db: Database):
        self.db = db
    
    async def run_backtest(
        self,
        run_id: str,
        strategy: str,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime,
        initial_capital: float,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run a backtest.
        
        Args:
            run_id: Unique run ID
            strategy: Strategy name
            symbol: Coin symbol
            timeframe: Timeframe
            start_date: Start date
            end_date: End date
            initial_capital: Initial capital
            params: Strategy parameters
            
        Returns:
            Dict with metrics and results
        """
        logger.info(f"Running backtest {run_id}: {strategy} on {symbol} from {start_date} to {end_date}")
        
        ohlcv_data = await self.db.get_ohlcv_data(symbol, timeframe, start_date, end_date)
        
        if not ohlcv_data:
            raise ValueError(f"No OHLCV data found for {symbol} ({timeframe}) in date range")
        
        logger.info(f"Loaded {len(ohlcv_data)} OHLCV records")
        
        df = pd.DataFrame(ohlcv_data)
        df['ts'] = pd.to_datetime(df['ts'])
        df = df.set_index('ts')
        
        if strategy == 'trend_v1':
            trades, equity_curve = await self._run_trend_v1_strategy(
                df, symbol, initial_capital, params
            )
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        metrics = self._calculate_metrics(equity_curve, trades, initial_capital)
        
        cumulative_pnl = 0
        for trade in trades:
            cumulative_pnl += trade.get('pnl', 0)
            trade['cumulative_pnl'] = cumulative_pnl
            await self.db.insert_backtest_trade(run_id, trade)
        
        peak_equity = initial_capital
        for idx, row in equity_curve.iterrows():
            equity = row['equity']
            peak_equity = max(peak_equity, equity)
            drawdown_pct = ((peak_equity - equity) / peak_equity) * 100 if peak_equity > 0 else 0
            
            await self.db.insert_equity_snapshot(
                run_id,
                idx,
                equity,
                row['cash'],
                row['position_value'],
                drawdown_pct
            )
        
        csv_path = await self._save_results_to_csv(run_id, trades, equity_curve, metrics)
        await self.db.update_csv_path(run_id, csv_path)
        
        return {
            'metrics': metrics,
            'trade_count': len(trades),
            'csv_path': csv_path
        }
    
    async def _run_trend_v1_strategy(
        self,
        df: pd.DataFrame,
        symbol: str,
        initial_capital: float,
        params: Dict[str, Any]
    ) -> tuple[List[Dict[str, Any]], pd.DataFrame]:
        """
        Run trend-following strategy v1.
        
        Simple moving average crossover strategy.
        
        Args:
            df: OHLCV DataFrame
            symbol: Coin symbol
            initial_capital: Initial capital
            params: Strategy parameters (fast_ma, slow_ma, position_size)
            
        Returns:
            Tuple of (trades list, equity curve DataFrame)
        """
        fast_ma = params.get('fast_ma', 20)
        slow_ma = params.get('slow_ma', 50)
        position_size = params.get('position_size', 0.95)  # Use 95% of capital
        slippage_bps = params.get('slippage_bps', 10)  # 0.1% slippage
        commission_bps = params.get('commission_bps', 10)  # 0.1% commission
        
        df['fast_ma'] = df['close'].rolling(window=fast_ma).mean()
        df['slow_ma'] = df['close'].rolling(window=slow_ma).mean()
        
        df['signal'] = 0
        df.loc[df['fast_ma'] > df['slow_ma'], 'signal'] = 1  # Buy signal
        df.loc[df['fast_ma'] < df['slow_ma'], 'signal'] = -1  # Sell signal
        
        trades = []
        equity_curve = []
        
        cash = initial_capital
        position = 0  # Number of coins held
        position_entry_price = 0
        
        for idx, row in df.iterrows():
            if pd.isna(row['fast_ma']) or pd.isna(row['slow_ma']):
                equity_curve.append({
                    'ts': idx,
                    'equity': cash,
                    'cash': cash,
                    'position_value': 0
                })
                continue
            
            price = row['close']
            signal = row['signal']
            
            if position == 0 and signal == 1:
                trade_amount = cash * position_size
                slippage = trade_amount * (slippage_bps / 10000)
                commission = trade_amount * (commission_bps / 10000)
                
                position = (trade_amount - slippage - commission) / price
                position_entry_price = price
                cash -= trade_amount
                
                trades.append({
                    'ts': idx,
                    'symbol': symbol,
                    'side': 'buy',
                    'quantity': position,
                    'price': price,
                    'slippage_bps': slippage_bps,
                    'commission': commission,
                    'pnl': 0,
                    'reason': f'MA crossover: fast_ma={row["fast_ma"]:.2f} > slow_ma={row["slow_ma"]:.2f}'
                })
            
            elif position > 0 and signal == -1:
                trade_amount = position * price
                slippage = trade_amount * (slippage_bps / 10000)
                commission = trade_amount * (commission_bps / 10000)
                
                cash += trade_amount - slippage - commission
                pnl = (price - position_entry_price) * position - slippage - commission
                
                trades.append({
                    'ts': idx,
                    'symbol': symbol,
                    'side': 'sell',
                    'quantity': position,
                    'price': price,
                    'slippage_bps': slippage_bps,
                    'commission': commission,
                    'pnl': pnl,
                    'reason': f'MA crossover: fast_ma={row["fast_ma"]:.2f} < slow_ma={row["slow_ma"]:.2f}'
                })
                
                position = 0
                position_entry_price = 0
            
            position_value = position * price if position > 0 else 0
            equity = cash + position_value
            
            equity_curve.append({
                'ts': idx,
                'equity': equity,
                'cash': cash,
                'position_value': position_value
            })
        
        if position > 0:
            final_price = df.iloc[-1]['close']
            trade_amount = position * final_price
            slippage = trade_amount * (slippage_bps / 10000)
            commission = trade_amount * (commission_bps / 10000)
            
            cash += trade_amount - slippage - commission
            pnl = (final_price - position_entry_price) * position - slippage - commission
            
            trades.append({
                'ts': df.index[-1],
                'symbol': symbol,
                'side': 'sell',
                'quantity': position,
                'price': final_price,
                'slippage_bps': slippage_bps,
                'commission': commission,
                'pnl': pnl,
                'reason': 'End of backtest period'
            })
        
        equity_df = pd.DataFrame(equity_curve)
        equity_df = equity_df.set_index('ts')
        
        return trades, equity_df
    
    def _calculate_metrics(
        self,
        equity_curve: pd.DataFrame,
        trades: List[Dict[str, Any]],
        initial_capital: float
    ) -> Dict[str, float]:
        """
        Calculate performance metrics.
        
        Args:
            equity_curve: Equity curve DataFrame
            trades: List of trades
            initial_capital: Initial capital
            
        Returns:
            Dict of metrics
        """
        if equity_curve.empty:
            return {}
        
        final_equity = equity_curve.iloc[-1]['equity']
        total_return = ((final_equity - initial_capital) / initial_capital) * 100
        
        equity_curve['returns'] = equity_curve['equity'].pct_change()
        
        returns = equity_curve['returns'].dropna()
        if len(returns) > 0 and returns.std() > 0:
            sharpe = (returns.mean() / returns.std()) * np.sqrt(252)
        else:
            sharpe = 0
        
        downside_returns = returns[returns < 0]
        if len(downside_returns) > 0 and downside_returns.std() > 0:
            sortino = (returns.mean() / downside_returns.std()) * np.sqrt(252)
        else:
            sortino = 0
        
        peak = equity_curve['equity'].expanding(min_periods=1).max()
        drawdown = (equity_curve['equity'] - peak) / peak
        max_dd = drawdown.min() * 100
        
        is_drawdown = drawdown < 0
        drawdown_periods = is_drawdown.astype(int).groupby((is_drawdown != is_drawdown.shift()).cumsum()).sum()
        max_dd_duration_days = drawdown_periods.max() if len(drawdown_periods) > 0 else 0
        
        days = (equity_curve.index[-1] - equity_curve.index[0]).days
        years = days / 365.25
        if years > 0:
            cagr = (((final_equity / initial_capital) ** (1 / years)) - 1) * 100
        else:
            cagr = 0
        
        winning_trades = [t for t in trades if t.get('pnl', 0) > 0]
        losing_trades = [t for t in trades if t.get('pnl', 0) < 0]
        
        win_rate = (len(winning_trades) / len(trades)) * 100 if trades else 0
        
        total_wins = sum(t.get('pnl', 0) for t in winning_trades)
        total_losses = abs(sum(t.get('pnl', 0) for t in losing_trades))
        profit_factor = total_wins / total_losses if total_losses > 0 else 0
        
        if len(trades) >= 2:
            durations = []
            for i in range(0, len(trades) - 1, 2):
                if i + 1 < len(trades):
                    entry = trades[i]['ts']
                    exit_trade = trades[i + 1]['ts']
                    duration = (exit_trade - entry).total_seconds() / 3600  # hours
                    durations.append(duration)
            avg_trade_duration_hours = np.mean(durations) if durations else 0
        else:
            avg_trade_duration_hours = 0
        
        return {
            'sharpe': round(sharpe, 2),
            'sortino': round(sortino, 2),
            'max_dd': round(max_dd, 2),
            'max_dd_duration_days': int(max_dd_duration_days),
            'cagr': round(cagr, 2),
            'total_return': round(total_return, 2),
            'win_rate': round(win_rate, 2),
            'profit_factor': round(profit_factor, 2),
            'trade_count': len(trades),
            'avg_trade_duration_hours': round(avg_trade_duration_hours, 2),
            'final_capital': round(final_equity, 2)
        }
    
    async def _save_results_to_csv(
        self,
        run_id: str,
        trades: List[Dict[str, Any]],
        equity_curve: pd.DataFrame,
        metrics: Dict[str, float]
    ) -> str:
        """
        Save backtest results to CSV file.
        
        Args:
            run_id: Run ID
            trades: List of trades
            equity_curve: Equity curve DataFrame
            metrics: Performance metrics
            
        Returns:
            Path to CSV file
        """
        results_dir = Path(config.backtest_results_path)
        results_dir.mkdir(parents=True, exist_ok=True)
        
        csv_path = results_dir / f"{run_id}.csv"
        
        with open(csv_path, 'w', newline='') as f:
            writer = csv.writer(f)
            
            writer.writerow(['# Backtest Metrics'])
            for key, value in metrics.items():
                writer.writerow([key, value])
            writer.writerow([])
            
            writer.writerow(['# Trades'])
            writer.writerow(['timestamp', 'symbol', 'side', 'quantity', 'price', 'pnl', 'cumulative_pnl', 'reason'])
            
            cumulative_pnl = 0
            for trade in trades:
                cumulative_pnl += trade.get('pnl', 0)
                writer.writerow([
                    trade['ts'].isoformat(),
                    trade['symbol'],
                    trade['side'],
                    trade['quantity'],
                    trade['price'],
                    trade.get('pnl', 0),
                    cumulative_pnl,
                    trade.get('reason', '')
                ])
        
        logger.info(f"Saved results to {csv_path}")
        return str(csv_path)

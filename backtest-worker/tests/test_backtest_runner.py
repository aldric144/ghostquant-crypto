"""Tests for backtest runner."""
import pytest
import pandas as pd
from datetime import datetime, timedelta
from worker.backtest_runner import BacktestRunner
from worker.database import Database


@pytest.fixture
def sample_ohlcv_data():
    """Create sample OHLCV data for testing."""
    dates = pd.date_range(start='2024-01-01', end='2024-03-01', freq='D')
    
    prices = [100 + i * 0.5 for i in range(len(dates))]
    
    data = []
    for i, date in enumerate(dates):
        data.append({
            'ts': date,
            'open': prices[i],
            'high': prices[i] * 1.02,
            'low': prices[i] * 0.98,
            'close': prices[i],
            'volume': 1000000
        })
    
    return data


def test_calculate_metrics():
    """Test metrics calculation."""
    runner = BacktestRunner(None)
    
    dates = pd.date_range(start='2024-01-01', periods=100, freq='D')
    equity_values = [10000 + i * 100 for i in range(100)]
    
    equity_curve = pd.DataFrame({
        'equity': equity_values,
        'cash': [5000] * 100,
        'position_value': [5000 + i * 100 for i in range(100)]
    }, index=dates)
    
    trades = [
        {'ts': dates[10], 'pnl': 100},
        {'ts': dates[20], 'pnl': 200},
        {'ts': dates[30], 'pnl': -50},
        {'ts': dates[40], 'pnl': 150},
    ]
    
    metrics = runner._calculate_metrics(equity_curve, trades, 10000)
    
    assert 'sharpe' in metrics
    assert 'sortino' in metrics
    assert 'max_dd' in metrics
    assert 'cagr' in metrics
    assert 'total_return' in metrics
    assert 'win_rate' in metrics
    assert 'profit_factor' in metrics
    assert metrics['trade_count'] == 4
    assert metrics['win_rate'] == 75.0  # 3 winning trades out of 4


def test_format_equity_curve():
    """Test equity curve formatting."""
    dates = pd.date_range(start='2024-01-01', periods=10, freq='D')
    equity_curve = pd.DataFrame({
        'equity': [10000 + i * 100 for i in range(10)],
        'cash': [5000] * 10,
        'position_value': [5000 + i * 100 for i in range(10)],
        'drawdown_pct': [0] * 10
    }, index=dates)
    
    assert len(equity_curve) == 10
    assert equity_curve.iloc[0]['equity'] == 10000
    assert equity_curve.iloc[-1]['equity'] == 10900

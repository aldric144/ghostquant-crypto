import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta

def build_bars_from_ticks(ticks: List[Dict[str, Any]], interval: str = '1m') -> pd.DataFrame:
    if not ticks:
        return pd.DataFrame()
    
    df = pd.DataFrame(ticks)
    df['ts'] = pd.to_datetime(df['ts'])
    df.set_index('ts', inplace=True)
    
    interval_map = {
        '1m': '1T',
        '5m': '5T',
        '1h': '1H',
        '1d': '1D'
    }
    
    freq = interval_map.get(interval, '1T')
    
    bars = df['price'].resample(freq).agg({
        'open': 'first',
        'high': 'max',
        'low': 'min',
        'close': 'last'
    })
    
    volume = df['qty'].resample(freq).sum()
    bars['volume'] = volume
    
    bars = bars.dropna()
    
    return bars

def generate_synthetic_bars(symbol: str, start: datetime, end: datetime, interval: str = '1m', base_price: float = 100) -> pd.DataFrame:
    import numpy as np
    
    interval_map = {
        '1m': timedelta(minutes=1),
        '5m': timedelta(minutes=5),
        '1h': timedelta(hours=1),
        '1d': timedelta(days=1)
    }
    
    delta = interval_map.get(interval, timedelta(minutes=1))
    
    timestamps = []
    current = start
    while current <= end:
        timestamps.append(current)
        current += delta
    
    n = len(timestamps)
    
    np.random.seed(hash(symbol) % 2**32)
    
    returns = np.random.normal(0.0001, 0.01, n)
    prices = base_price * np.exp(np.cumsum(returns))
    
    bars = pd.DataFrame({
        'open': prices,
        'high': prices * (1 + np.abs(np.random.normal(0, 0.005, n))),
        'low': prices * (1 - np.abs(np.random.normal(0, 0.005, n))),
        'close': prices * (1 + np.random.normal(0, 0.002, n)),
        'volume': np.random.uniform(10, 100, n)
    }, index=timestamps)
    
    return bars

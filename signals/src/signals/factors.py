import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta

def calculate_ema(values: List[float], period: int) -> float:
    if not values or len(values) < period:
        return None
    
    multiplier = 2 / (period + 1)
    ema = values[0]
    
    for value in values[1:]:
        ema = (value - ema) * multiplier + ema
    
    return ema

def calculate_momentum(prices: List[float], lookback: int) -> float:
    if not prices or len(prices) < lookback + 1:
        return 0.0
    
    current = prices[-1]
    past = prices[-lookback-1]
    
    if past == 0:
        return 0.0
    
    return ((current - past) / past) * 100

def calculate_acceleration(momentum_values: List[float]) -> float:
    if not momentum_values or len(momentum_values) < 2:
        return 0.0
    
    return momentum_values[-1] - momentum_values[-2]

def calculate_atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> float:
    if not highs or len(highs) < period:
        return 0.0
    
    true_ranges = []
    for i in range(1, len(highs)):
        high_low = highs[i] - lows[i]
        high_close = abs(highs[i] - closes[i-1])
        low_close = abs(lows[i] - closes[i-1])
        true_ranges.append(max(high_low, high_close, low_close))
    
    if not true_ranges:
        return 0.0
    
    return np.mean(true_ranges[-period:])

def calculate_vol_regime(prices: List[float], period: int = 14) -> float:
    if not prices or len(prices) < period:
        return 0.0
    
    highs = prices
    lows = prices
    closes = prices
    
    atr = calculate_atr(highs, lows, closes, period)
    current_price = prices[-1]
    
    if current_price == 0:
        return 0.0
    
    return atr / current_price

def calculate_volume_z(volumes: List[float], lookback: int = 30) -> float:
    if not volumes or len(volumes) < lookback:
        return 0.0
    
    recent_volumes = volumes[-lookback:]
    mean_vol = np.mean(recent_volumes)
    std_vol = np.std(recent_volumes)
    
    if std_vol == 0:
        return 0.0
    
    current_vol = volumes[-1]
    return (current_vol - mean_vol) / std_vol

def calculate_depth_delta(bid_sizes: List[float], ask_sizes: List[float]) -> float:
    if not bid_sizes or not ask_sizes:
        return 0.0
    
    bid_depth = np.mean(bid_sizes[-10:]) if len(bid_sizes) >= 10 else np.mean(bid_sizes)
    ask_depth = np.mean(ask_sizes[-10:]) if len(ask_sizes) >= 10 else np.mean(ask_sizes)
    
    total = bid_depth + ask_depth
    if total == 0:
        return 0.0
    
    return (bid_depth - ask_depth) / total

def calculate_funding_flip(funding_rates: List[float]) -> bool:
    if not funding_rates or len(funding_rates) < 2:
        return False
    
    prev = funding_rates[-2]
    curr = funding_rates[-1]
    
    return (prev >= 0 and curr < 0) or (prev < 0 and curr >= 0)

def calculate_oi_shift(oi_values: List[float]) -> float:
    if not oi_values or len(oi_values) < 2:
        return 0.0
    
    prev = oi_values[-2]
    curr = oi_values[-1]
    
    if prev == 0:
        return 0.0
    
    return ((curr - prev) / prev) * 100

def calculate_tvl_accel(tvl_values: List[float]) -> float:
    if not tvl_values or len(tvl_values) < 3:
        return 0.0
    
    prev_change = tvl_values[-2] - tvl_values[-3] if tvl_values[-3] != 0 else 0
    curr_change = tvl_values[-1] - tvl_values[-2] if tvl_values[-2] != 0 else 0
    
    return curr_change - prev_change

def calculate_flow_score(flows: List[Dict[str, Any]]) -> float:
    if not flows:
        return 0.0
    
    score = 0.0
    weights = {
        'exchange': -1.0,
        'whale': 0.5,
        'defi': 0.3,
        'bridge': 0.2,
        'unknown': 0.0
    }
    
    for flow in flows:
        from_tag = flow.get('from_tag', 'unknown')
        to_tag = flow.get('to_tag', 'unknown')
        amount = flow.get('usd', 0)
        
        if from_tag == 'exchange':
            score += amount * abs(weights.get(from_tag, 0))
        elif to_tag == 'exchange':
            score -= amount * abs(weights.get(to_tag, 0))
    
    return score / 1000000 if score != 0 else 0.0

async def compute_factors_for_asset(db_cursor, asset_id: int) -> Dict[str, Any]:
    now = datetime.utcnow()
    lookback_1h = now - timedelta(hours=1)
    lookback_24h = now - timedelta(hours=24)
    lookback_30d = now - timedelta(days=30)
    
    await db_cursor.execute(
        "SELECT price FROM ticks WHERE asset_id = %s AND ts >= %s ORDER BY ts",
        (asset_id, lookback_24h)
    )
    price_rows = await db_cursor.fetchall()
    prices = [row['price'] for row in price_rows] if price_rows else []
    
    await db_cursor.execute(
        "SELECT qty FROM ticks WHERE asset_id = %s AND ts >= %s ORDER BY ts",
        (asset_id, lookback_30d)
    )
    volume_rows = await db_cursor.fetchall()
    volumes = [row['qty'] for row in volume_rows] if volume_rows else []
    
    await db_cursor.execute(
        "SELECT bid_sz, ask_sz FROM books WHERE asset_id = %s AND ts >= %s ORDER BY ts",
        (asset_id, lookback_1h)
    )
    book_rows = await db_cursor.fetchall()
    bid_sizes = [row['bid_sz'] for row in book_rows] if book_rows else []
    ask_sizes = [row['ask_sz'] for row in book_rows] if book_rows else []
    
    await db_cursor.execute(
        "SELECT funding_8h, oi FROM derivatives WHERE asset_id = %s AND ts >= %s ORDER BY ts",
        (asset_id, lookback_24h)
    )
    deriv_rows = await db_cursor.fetchall()
    funding_rates = [row['funding_8h'] for row in deriv_rows if row['funding_8h'] is not None] if deriv_rows else []
    oi_values = [row['oi'] for row in deriv_rows if row['oi'] is not None] if deriv_rows else []
    
    await db_cursor.execute(
        "SELECT from_tag, to_tag, usd FROM onchain_flows WHERE asset_id = %s AND ts >= %s ORDER BY ts",
        (asset_id, lookback_24h)
    )
    flow_rows = await db_cursor.fetchall()
    
    mom_1h = calculate_momentum(prices, 60) if len(prices) >= 61 else 0.0
    mom_24h = calculate_momentum(prices, 1440) if len(prices) >= 1441 else 0.0
    
    momentum_values = [mom_1h, mom_24h]
    accel_1h = calculate_acceleration(momentum_values)
    
    vol_regime = calculate_vol_regime(prices)
    depth_delta = calculate_depth_delta(bid_sizes, ask_sizes)
    volume_z = calculate_volume_z(volumes)
    funding_flip = calculate_funding_flip(funding_rates)
    oi_shift = calculate_oi_shift(oi_values)
    
    tvl_accel = 0.0
    flow_score = calculate_flow_score(flow_rows) if flow_rows else 0.0
    
    return {
        'asset_id': asset_id,
        'ts': now,
        'mom_1h': mom_1h,
        'mom_24h': mom_24h,
        'accel_1h': accel_1h,
        'vol_regime': vol_regime,
        'depth_delta': depth_delta,
        'volume_z': volume_z,
        'funding_flip': funding_flip,
        'oi_shift': oi_shift,
        'tvl_accel': tvl_accel,
        'flow_score': flow_score
    }

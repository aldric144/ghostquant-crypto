"""
Shared scoring utilities for momentum and composite scoring.
Provides common mathematical functions to avoid duplication.
"""
import numpy as np
from typing import List, Optional


def normalize(value: float, min_val: float = -100, max_val: float = 100) -> float:
    """
    Normalize value to 0-1 range.
    
    Args:
        value: Value to normalize
        min_val: Minimum expected value
        max_val: Maximum expected value
        
    Returns:
        Normalized value between 0 and 1
    """
    if max_val == min_val:
        return 0.5
    normalized = (value - min_val) / (max_val - min_val)
    return max(0, min(1, normalized))


def clamp(value: float, min_val: float = 0, max_val: float = 100) -> float:
    """
    Clamp value to specified range.
    
    Args:
        value: Value to clamp
        min_val: Minimum allowed value
        max_val: Maximum allowed value
        
    Returns:
        Clamped value
    """
    return max(min_val, min(max_val, value))


def compute_rsi(prices: List[float], period: int = 14) -> float:
    """
    Compute Relative Strength Index (RSI) from price series.
    
    Args:
        prices: List of prices
        period: RSI period (default 14)
        
    Returns:
        RSI value between 0 and 100
    """
    if len(prices) < period + 1:
        return 50.0  # Neutral
    
    prices_arr = np.array(prices)
    deltas = np.diff(prices_arr)
    
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return float(rsi)


def compute_ema(prices: List[float], period: int) -> float:
    """
    Compute Exponential Moving Average (EMA) from price series.
    
    Args:
        prices: List of prices
        period: EMA period
        
    Returns:
        EMA value
    """
    if len(prices) < period:
        return float(np.mean(prices)) if prices else 0.0
    
    prices_arr = np.array(prices)
    multiplier = 2 / (period + 1)
    ema = prices_arr[0]
    
    for price in prices_arr[1:]:
        ema = (price * multiplier) + (ema * (1 - multiplier))
    
    return float(ema)


def check_ma_cross(prices: List[float], fast_period: int = 5, slow_period: int = 20) -> bool:
    """
    Check if fast EMA crossed above slow EMA recently.
    
    Args:
        prices: List of prices
        fast_period: Fast EMA period (default 5)
        slow_period: Slow EMA period (default 20)
        
    Returns:
        True if fast EMA is above slow EMA
    """
    if len(prices) < slow_period:
        return False
    
    ema_fast = compute_ema(prices[-fast_period:], fast_period)
    ema_slow = compute_ema(prices[-slow_period:], slow_period)
    
    return ema_fast > ema_slow


def compute_volatility(prices: List[float]) -> float:
    """
    Compute volatility as coefficient of variation.
    
    Args:
        prices: List of prices
        
    Returns:
        Volatility as percentage
    """
    if not prices or len(prices) < 2:
        return 0.0
    
    prices_arr = np.array(prices)
    mean_price = np.mean(prices_arr)
    
    if mean_price == 0:
        return 0.0
    
    std_dev = np.std(prices_arr)
    volatility = (std_dev / mean_price) * 100
    
    return float(volatility)


def compute_returns(prices: List[float], periods: Optional[List[int]] = None) -> dict:
    """
    Compute returns over multiple periods.
    
    Args:
        prices: List of prices (most recent last)
        periods: List of periods to compute returns for (default [1, 4, 24])
        
    Returns:
        Dictionary of period -> return percentage
    """
    if periods is None:
        periods = [1, 4, 24]
    
    returns = {}
    
    for period in periods:
        if len(prices) > period:
            start_price = prices[-period - 1]
            end_price = prices[-1]
            
            if start_price > 0:
                ret = ((end_price - start_price) / start_price) * 100
                returns[f"{period}h"] = float(ret)
            else:
                returns[f"{period}h"] = 0.0
        else:
            returns[f"{period}h"] = 0.0
    
    return returns


def compute_volume_ratio(current_volume: float, historical_volumes: List[float]) -> float:
    """
    Compute volume ratio vs historical median.
    
    Args:
        current_volume: Current volume
        historical_volumes: List of historical volumes
        
    Returns:
        Volume ratio (1.0 = median, 2.0 = 2x median)
    """
    if not historical_volumes:
        return 1.0
    
    median_volume = float(np.median(historical_volumes))
    
    if median_volume == 0:
        return 1.0
    
    ratio = current_volume / median_volume
    return float(ratio)


def percentile_normalize(value: float, values: List[float], lower: float = 5, upper: float = 95) -> float:
    """
    Normalize value using percentile bounds from a distribution.
    More robust to outliers than min/max normalization.
    
    Args:
        value: Value to normalize
        values: Distribution of values
        lower: Lower percentile (default 5th)
        upper: Upper percentile (default 95th)
        
    Returns:
        Normalized value between 0 and 1
    """
    if not values:
        return 0.5
    
    values_arr = np.array(values)
    p_lower = np.percentile(values_arr, lower)
    p_upper = np.percentile(values_arr, upper)
    
    if p_upper == p_lower:
        return 0.5
    
    normalized = (value - p_lower) / (p_upper - p_lower)
    return float(clamp(normalized, 0, 1))

"""
Pattern detection service for technical analysis signals.

Implements:
- Candlestick patterns (Engulfing, Harami, Doji)
- Technical formations (Volume Spike, MA Crossover)
- ATR-based volatility regime detection
"""
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


def detect_bull_engulfing(bars: List[List[float]]) -> Tuple[bool, float]:
    """
    Detect bullish engulfing pattern.
    
    Pattern: Current candle body completely engulfs previous candle body.
    Current candle is bullish (close > open), previous is bearish (close < open).
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        
    Returns:
        Tuple of (detected, confidence_score)
    """
    if len(bars) < 2:
        return False, 0.0
    
    prev_bar = bars[-2]
    curr_bar = bars[-1]
    
    prev_open, prev_close = prev_bar[1], prev_bar[4]
    curr_open, curr_close = curr_bar[1], curr_bar[4]
    
    if prev_close >= prev_open or curr_close <= curr_open:
        return False, 0.0
    
    if curr_open <= prev_close and curr_close >= prev_open:
        confidence = 0.6  # Base confidence
        
        if len(bars) >= 20:
            avg_volume = sum(b[5] for b in bars[-20:]) / 20
            if curr_bar[5] > 1.5 * avg_volume:
                confidence += 0.2
        
        if len(bars) >= 5:
            prior_trend_down = all(bars[i][4] > bars[i+1][4] for i in range(-5, -1))
            if prior_trend_down:
                confidence += 0.1
        
        return True, min(1.0, round(confidence, 2))
    
    return False, 0.0


def detect_bear_engulfing(bars: List[List[float]]) -> Tuple[bool, float]:
    """
    Detect bearish engulfing pattern.
    
    Pattern: Current candle body completely engulfs previous candle body.
    Current candle is bearish (close < open), previous is bullish (close > open).
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        
    Returns:
        Tuple of (detected, confidence_score)
    """
    if len(bars) < 2:
        return False, 0.0
    
    prev_bar = bars[-2]
    curr_bar = bars[-1]
    
    prev_open, prev_close = prev_bar[1], prev_bar[4]
    curr_open, curr_close = curr_bar[1], curr_bar[4]
    
    if prev_close <= prev_open or curr_close >= curr_open:
        return False, 0.0
    
    if curr_open >= prev_close and curr_close <= prev_open:
        confidence = 0.6  # Base confidence
        
        if len(bars) >= 20:
            avg_volume = sum(b[5] for b in bars[-20:]) / 20
            if curr_bar[5] > 1.5 * avg_volume:
                confidence += 0.2
        
        if len(bars) >= 5:
            prior_trend_up = all(bars[i][4] < bars[i+1][4] for i in range(-5, -1))
            if prior_trend_up:
                confidence += 0.1
        
        return True, min(1.0, round(confidence, 2))
    
    return False, 0.0


def detect_doji(bars: List[List[float]]) -> Tuple[bool, float]:
    """
    Detect Doji pattern.
    
    Pattern: Open and close are very close (small body), indicating indecision.
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        
    Returns:
        Tuple of (detected, confidence_score)
    """
    if len(bars) < 1:
        return False, 0.0
    
    curr_bar = bars[-1]
    open_price, high, low, close = curr_bar[1], curr_bar[2], curr_bar[3], curr_bar[4]
    
    body = abs(close - open_price)
    range_size = high - low
    
    if range_size == 0:
        return False, 0.0
    
    if body / range_size <= 0.1:
        confidence = 0.4  # Base confidence
        
        atr_n = calculate_atr_normalized(bars, period=14)
        if atr_n > 0.03:
            confidence += 0.2
        
        if len(bars) >= 20:
            recent_high = max(b[2] for b in bars[-20:])
            recent_low = min(b[3] for b in bars[-20:])
            if abs(close - recent_high) / recent_high < 0.02 or abs(close - recent_low) / recent_low < 0.02:
                confidence += 0.1
        
        return True, min(1.0, round(confidence, 2))
    
    return False, 0.0


def detect_harami(bars: List[List[float]]) -> Tuple[bool, float]:
    """
    Detect Harami pattern (bullish or bearish).
    
    Pattern: Current candle body is contained within previous candle body.
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        
    Returns:
        Tuple of (detected, confidence_score)
    """
    if len(bars) < 2:
        return False, 0.0
    
    prev_bar = bars[-2]
    curr_bar = bars[-1]
    
    prev_open, prev_close = prev_bar[1], prev_bar[4]
    curr_open, curr_close = curr_bar[1], curr_bar[4]
    
    prev_body_top = max(prev_open, prev_close)
    prev_body_bottom = min(prev_open, prev_close)
    curr_body_top = max(curr_open, curr_close)
    curr_body_bottom = min(curr_open, curr_close)
    
    if curr_body_top <= prev_body_top and curr_body_bottom >= prev_body_bottom:
        confidence = 0.5  # Base confidence
        
        if curr_bar[5] < prev_bar[5]:
            confidence += 0.1
        
        if len(bars) >= 5:
            prior_trend = bars[-5][4] < bars[-2][4]  # Uptrend before harami
            if prior_trend and curr_close < curr_open:  # Bearish harami after uptrend
                confidence += 0.15
            elif not prior_trend and curr_close > curr_open:  # Bullish harami after downtrend
                confidence += 0.15
        
        return True, min(1.0, round(confidence, 2))
    
    return False, 0.0


def detect_volume_spike(bars: List[List[float]], threshold: float = 2.0) -> Tuple[bool, float]:
    """
    Detect volume spike.
    
    Pattern: Current volume significantly exceeds average volume.
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        threshold: Multiplier for average volume (default: 2.0)
        
    Returns:
        Tuple of (detected, confidence_score)
    """
    if len(bars) < 20:
        return False, 0.0
    
    curr_bar = bars[-1]
    avg_volume = sum(b[5] for b in bars[-20:-1]) / 19  # Exclude current bar from average
    
    if avg_volume == 0:
        return False, 0.0
    
    volume_ratio = curr_bar[5] / avg_volume
    
    if volume_ratio >= threshold:
        confidence = 0.5 + min(0.4, (volume_ratio - threshold) * 0.1)
        
        price_change = abs(curr_bar[4] - curr_bar[1]) / curr_bar[1]
        if price_change > 0.02:  # 2% move
            confidence += 0.1
        
        return True, min(1.0, round(confidence, 2))
    
    return False, 0.0


def calculate_ma(bars: List[List[float]], period: int) -> Optional[float]:
    """
    Calculate simple moving average.
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        period: MA period
        
    Returns:
        MA value or None if insufficient data
    """
    if len(bars) < period:
        return None
    
    closes = [b[4] for b in bars[-period:]]
    return sum(closes) / period


def detect_ma_crossover(bars: List[List[float]], fast_period: int = 50, slow_period: int = 200) -> Tuple[Optional[str], float]:
    """
    Detect moving average crossover (Golden Cross / Death Cross).
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        fast_period: Fast MA period (default: 50)
        slow_period: Slow MA period (default: 200)
        
    Returns:
        Tuple of (signal_type, confidence_score)
        signal_type: "GOLDEN_CROSS", "DEATH_CROSS", or None
    """
    if len(bars) < slow_period + 1:
        return None, 0.0
    
    fast_ma_curr = calculate_ma(bars, fast_period)
    slow_ma_curr = calculate_ma(bars, slow_period)
    
    fast_ma_prev = calculate_ma(bars[:-1], fast_period)
    slow_ma_prev = calculate_ma(bars[:-1], slow_period)
    
    if None in [fast_ma_curr, slow_ma_curr, fast_ma_prev, slow_ma_prev]:
        return None, 0.0
    
    if fast_ma_prev <= slow_ma_prev and fast_ma_curr > slow_ma_curr:
        confidence = 0.7  # Base confidence
        
        if len(bars) >= fast_period + 5:
            fast_ma_older = calculate_ma(bars[:-5], fast_period)
            if fast_ma_older and fast_ma_curr > fast_ma_older:
                confidence += 0.1
        
        if bars[-1][4] > slow_ma_curr:
            confidence += 0.1
        
        return "GOLDEN_CROSS", min(1.0, round(confidence, 2))
    
    if fast_ma_prev >= slow_ma_prev and fast_ma_curr < slow_ma_curr:
        confidence = 0.7  # Base confidence
        
        if len(bars) >= fast_period + 5:
            fast_ma_older = calculate_ma(bars[:-5], fast_period)
            if fast_ma_older and fast_ma_curr < fast_ma_older:
                confidence += 0.1
        
        if bars[-1][4] < slow_ma_curr:
            confidence += 0.1
        
        return "DEATH_CROSS", min(1.0, round(confidence, 2))
    
    return None, 0.0


def calculate_atr(bars: List[List[float]], period: int = 14) -> Optional[float]:
    """
    Calculate Average True Range.
    
    ATR measures volatility using the true range:
    TR = max(H-L, |H-C_prev|, |L-C_prev|)
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        period: ATR period (default: 14)
        
    Returns:
        ATR value or None if insufficient data
    """
    if len(bars) < period + 1:
        return None
    
    true_ranges = []
    
    for i in range(-period, 0):
        high = bars[i][2]
        low = bars[i][3]
        prev_close = bars[i-1][4]
        
        tr = max(
            high - low,
            abs(high - prev_close),
            abs(low - prev_close)
        )
        true_ranges.append(tr)
    
    return sum(true_ranges) / period


def calculate_atr_normalized(bars: List[List[float]], period: int = 14) -> float:
    """
    Calculate normalized ATR (ATR / price).
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        period: ATR period (default: 14)
        
    Returns:
        Normalized ATR (0.0 if insufficient data)
    """
    atr = calculate_atr(bars, period)
    if atr is None or bars[-1][4] == 0:
        return 0.0
    
    return atr / bars[-1][4]


def detect_volatility_regime(bars: List[List[float]], low_threshold: float = 0.015, high_threshold: float = 0.04) -> Tuple[Optional[str], float]:
    """
    Detect volatility regime based on normalized ATR.
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        low_threshold: Threshold for low volatility (default: 0.015 = 1.5%)
        high_threshold: Threshold for high volatility (default: 0.04 = 4%)
        
    Returns:
        Tuple of (regime, confidence_score)
        regime: "LOW_VOLATILITY", "HIGH_VOLATILITY", or None
    """
    atr_n = calculate_atr_normalized(bars, period=14)
    
    if atr_n == 0.0:
        return None, 0.0
    
    if atr_n < low_threshold:
        confidence = 0.6 + min(0.3, (low_threshold - atr_n) / low_threshold * 0.3)
        return "LOW_VOLATILITY", round(confidence, 2)
    
    if atr_n > high_threshold:
        confidence = 0.6 + min(0.3, (atr_n - high_threshold) / high_threshold * 0.3)
        return "HIGH_VOLATILITY", round(confidence, 2)
    
    return None, 0.0


def detect_all_patterns(bars: List[List[float]], symbol: str, timeframe: str) -> List[Dict[str, Any]]:
    """
    Detect all patterns for a symbol and timeframe.
    
    Args:
        bars: List of [timestamp, open, high, low, close, volume]
        symbol: Trading symbol
        timeframe: Timeframe (4H, 1D)
        
    Returns:
        List of detected patterns with confidence scores
    """
    patterns = []
    
    bull_eng, bull_conf = detect_bull_engulfing(bars)
    if bull_eng:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': 'BULL_ENGULFING',
            'confidence_score': bull_conf
        })
    
    bear_eng, bear_conf = detect_bear_engulfing(bars)
    if bear_eng:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': 'BEAR_ENGULFING',
            'confidence_score': bear_conf
        })
    
    doji, doji_conf = detect_doji(bars)
    if doji:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': 'DOJI',
            'confidence_score': doji_conf
        })
    
    harami, harami_conf = detect_harami(bars)
    if harami:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': 'HARAMI',
            'confidence_score': harami_conf
        })
    
    vol_spike, vol_conf = detect_volume_spike(bars)
    if vol_spike:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': 'VOLUME_SPIKE',
            'confidence_score': vol_conf
        })
    
    ma_cross, ma_conf = detect_ma_crossover(bars)
    if ma_cross:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': ma_cross,
            'confidence_score': ma_conf
        })
    
    vol_regime, vol_regime_conf = detect_volatility_regime(bars)
    if vol_regime:
        patterns.append({
            'symbol': symbol,
            'timeframe': timeframe,
            'signal_type': vol_regime,
            'confidence_score': vol_regime_conf
        })
    
    return patterns

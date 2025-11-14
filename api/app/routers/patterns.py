"""
Pattern detection API endpoints for Feature 5.
"""
import json
import logging
import os
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pathlib import Path

from app.utils.feature_flags import is_feature_enabled
from app.utils.cache_helper import get_cached, set_cached

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/signals", tags=["signals", "patterns"])


@router.get("/patterns")
async def get_pattern_signals(
    timeframe: str = Query("4H", description="Timeframe (4H or 1D)"),
    symbols: Optional[str] = Query(None, description="Comma-separated symbols (e.g., 'BTC,ETH')")
) -> Dict[str, Any]:
    """
    Get AI pattern and volatility signals for technical analysis.
    
    Detects:
    - Candlestick patterns: BULL_ENGULFING, BEAR_ENGULFING, DOJI, HARAMI
    - Technical formations: VOLUME_SPIKE, GOLDEN_CROSS, DEATH_CROSS
    - Volatility regimes: LOW_VOLATILITY, HIGH_VOLATILITY
    
    Args:
        timeframe: Timeframe for analysis (4H or 1D)
        symbols: Optional comma-separated list of symbols to filter
        
    Returns:
        Dictionary with pattern signals and metadata
    """
    if not is_feature_enabled('signals'):
        raise HTTPException(status_code=501, detail="Pattern signals feature is not enabled")
    
    timeframe_normalized = timeframe.upper().strip()
    if timeframe_normalized not in ['4H', '1D']:
        raise HTTPException(status_code=400, detail="Timeframe must be '4H' or '1D'")
    
    symbol_filter = None
    if symbols:
        symbol_filter = [s.strip().upper() for s in symbols.split(',')]
        symbol_filter.sort()  # Sort for stable cache keys
    
    cache_key = f"signals:patterns:tf={timeframe_normalized.lower()}"
    if symbol_filter:
        cache_key += f":symbols={','.join(symbol_filter)}"
    
    cached = get_cached(cache_key)
    if cached:
        logger.info(f"Returning cached pattern signals (timeframe={timeframe_normalized}, symbols={symbols})")
        return cached
    
    try:
        use_mock = os.getenv('SIGNAL_MOCK', 'true').lower() == 'true'
        
        if use_mock:
            signals = _get_mock_signals(timeframe_normalized, symbol_filter)
        else:
            signals = _compute_signals(timeframe_normalized, symbol_filter)
        
        result = {
            'signals': signals,
            'count': len(signals),
            'timeframe': timeframe_normalized,
            'symbols': symbol_filter,
            'data_source': 'mock' if use_mock else 'computed'
        }
        
        set_cached(cache_key, result, ttl=1800)
        
        logger.info(f"Fetched {len(signals)} pattern signals")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching pattern signals: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch pattern signals: {str(e)}")


def _get_mock_signals(timeframe: str, symbol_filter: Optional[List[str]]) -> List[Dict[str, Any]]:
    """Get mock pattern signals from file."""
    try:
        mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample_refined.json'
        if not mock_file.exists():
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample.json'
        
        with open(mock_file, 'r') as f:
            data = json.load(f)
            all_signals = data.get('pattern_signals', [])
        
        signals = [s for s in all_signals if s.get('timeframe') == timeframe]
        
        if symbol_filter:
            signals = [s for s in signals if s.get('symbol') in symbol_filter]
        
        return signals
        
    except Exception as e:
        logger.error(f"Failed to load mock pattern signals: {e}")
        return []


def _compute_signals(timeframe: str, symbol_filter: Optional[List[str]]) -> List[Dict[str, Any]]:
    """Compute pattern signals from OHLCV data."""
    from app.services.pattern_detector import detect_all_patterns
    
    try:
        mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample_refined.json'
        if not mock_file.exists():
            logger.warning("No OHLCV data available for pattern computation, using mock signals")
            return _get_mock_signals(timeframe, symbol_filter)
        
        with open(mock_file, 'r') as f:
            data = json.load(f)
            ohlcv_data = data.get('ohlcv', {})
        
        if not ohlcv_data:
            logger.warning("No OHLCV data in mock file, using mock signals")
            return _get_mock_signals(timeframe, symbol_filter)
        
        all_signals = []
        
        symbols_to_process = symbol_filter if symbol_filter else list(ohlcv_data.keys())
        
        for symbol in symbols_to_process:
            if symbol not in ohlcv_data:
                continue
            
            symbol_data = ohlcv_data[symbol]
            if timeframe not in symbol_data:
                continue
            
            bars = symbol_data[timeframe]
            if not bars or len(bars) < 2:
                continue
            
            patterns = detect_all_patterns(bars, symbol, timeframe)
            all_signals.extend(patterns)
        
        return all_signals
        
    except Exception as e:
        logger.error(f"Failed to compute pattern signals: {e}")
        logger.warning("Falling back to mock signals")
        return _get_mock_signals(timeframe, symbol_filter)

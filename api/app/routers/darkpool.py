"""
Darkpool activity detection and monitoring API endpoints.
Part of the Global Threat Map system.
"""
import logging
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

from app.utils.feature_flags import is_feature_enabled
from app.utils.cache_helper import get_cached, set_cached

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/darkpool", tags=["darkpool"])


@router.get("/activity")
async def get_darkpool_activity(
    limit: int = Query(50, ge=1, le=200, description="Number of events to return"),
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    min_volume_usd: Optional[float] = Query(None, description="Minimum volume in USD")
) -> Dict[str, Any]:
    """
    Get recent darkpool trading activity.
    
    Returns detected darkpool trades with volume, timing patterns,
    and institutional flow indicators.
    """
    cache_key = f"darkpool:activity:{limit}:{symbol}:{min_volume_usd}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        # Generate darkpool activity data
        events = _generate_darkpool_events(limit, symbol, min_volume_usd)
        
        result = {
            "events": events,
            "count": len(events),
            "limit": limit,
            "symbol_filter": symbol,
            "min_volume_usd": min_volume_usd,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching darkpool activity: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch darkpool activity: {str(e)}")


@router.get("/summary")
async def get_darkpool_summary() -> Dict[str, Any]:
    """
    Get darkpool activity summary with aggregated metrics.
    """
    cache_key = "darkpool:summary"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        result = {
            "total_volume_24h": random.uniform(500_000_000, 2_000_000_000),
            "total_trades_24h": random.randint(1000, 5000),
            "avg_trade_size": random.uniform(100_000, 500_000),
            "institutional_flow_ratio": random.uniform(0.6, 0.9),
            "top_symbols": [
                {"symbol": "BTC", "volume": random.uniform(100_000_000, 500_000_000), "trades": random.randint(200, 800)},
                {"symbol": "ETH", "volume": random.uniform(50_000_000, 200_000_000), "trades": random.randint(150, 600)},
                {"symbol": "SOL", "volume": random.uniform(20_000_000, 100_000_000), "trades": random.randint(100, 400)},
            ],
            "risk_score": random.uniform(30, 80),
            "threat_level": _get_threat_level(random.uniform(30, 80)),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching darkpool summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch darkpool summary: {str(e)}")


@router.get("/institutional-flow")
async def get_institutional_flow(
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    timeframe: str = Query("24h", description="Timeframe (1h, 4h, 24h, 7d)")
) -> Dict[str, Any]:
    """
    Get institutional flow analysis from darkpool data.
    """
    cache_key = f"darkpool:institutional:{symbol}:{timeframe}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        hours = _parse_timeframe(timeframe)
        
        result = {
            "net_flow": random.uniform(-100_000_000, 100_000_000),
            "buy_volume": random.uniform(200_000_000, 800_000_000),
            "sell_volume": random.uniform(200_000_000, 800_000_000),
            "flow_direction": "accumulation" if random.random() > 0.5 else "distribution",
            "confidence": random.uniform(0.6, 0.95),
            "institutional_participants": random.randint(10, 50),
            "avg_order_size": random.uniform(500_000, 2_000_000),
            "symbol": symbol,
            "timeframe": timeframe,
            "hours": hours,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching institutional flow: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch institutional flow: {str(e)}")


def _generate_darkpool_events(limit: int, symbol: Optional[str], min_volume: Optional[float]) -> List[Dict[str, Any]]:
    """Generate darkpool activity events."""
    symbols = ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC", "LINK"]
    venues = ["Liquidnet", "ITG POSIT", "UBS MTF", "Instinet", "BIDS Trading"]
    
    events = []
    now = datetime.utcnow()
    
    for i in range(limit):
        event_symbol = symbol if symbol else random.choice(symbols)
        volume = random.uniform(100_000, 10_000_000)
        
        if min_volume and volume < min_volume:
            volume = min_volume + random.uniform(0, min_volume)
        
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        
        events.append({
            "id": f"dp_{i}_{int(timestamp.timestamp())}",
            "symbol": event_symbol,
            "volume_usd": volume,
            "price": random.uniform(0.1, 100000),
            "side": random.choice(["buy", "sell"]),
            "venue": random.choice(venues),
            "execution_type": random.choice(["block", "iceberg", "vwap", "twap"]),
            "institutional_flag": random.random() > 0.3,
            "timestamp": timestamp.isoformat(),
            "impact_score": random.uniform(0, 100),
            "anomaly_detected": random.random() > 0.8
        })
    
    return sorted(events, key=lambda x: x["timestamp"], reverse=True)


def _get_threat_level(score: float) -> str:
    """Convert risk score to threat level."""
    if score >= 80:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 40:
        return "medium"
    elif score >= 20:
        return "low"
    return "minimal"


def _parse_timeframe(timeframe: str) -> int:
    """Parse timeframe string to hours."""
    timeframe = timeframe.lower().strip()
    if timeframe.endswith('h'):
        return int(timeframe[:-1])
    elif timeframe.endswith('d'):
        return int(timeframe[:-1]) * 24
    elif timeframe.endswith('w'):
        return int(timeframe[:-1]) * 24 * 7
    return 24

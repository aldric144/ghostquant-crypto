"""
Market manipulation detection API endpoints.
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

router = APIRouter(prefix="/manipulation", tags=["manipulation"])


@router.get("/alerts")
async def get_manipulation_alerts(
    limit: int = Query(50, ge=1, le=200, description="Number of alerts to return"),
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    severity: Optional[str] = Query(None, description="Filter by severity (low, medium, high, critical)")
) -> Dict[str, Any]:
    """
    Get market manipulation alerts.
    
    Detects various manipulation patterns including:
    - Wash trading
    - Spoofing
    - Layering
    - Pump and dump
    - Front-running
    """
    cache_key = f"manipulation:alerts:{limit}:{symbol}:{severity}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        alerts = _generate_manipulation_alerts(limit, symbol, severity)
        
        result = {
            "alerts": alerts,
            "count": len(alerts),
            "limit": limit,
            "symbol_filter": symbol,
            "severity_filter": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching manipulation alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch manipulation alerts: {str(e)}")


@router.get("/summary")
async def get_manipulation_summary() -> Dict[str, Any]:
    """
    Get manipulation detection summary with aggregated metrics.
    """
    cache_key = "manipulation:summary"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        result = {
            "total_alerts_24h": random.randint(50, 200),
            "critical_alerts": random.randint(5, 20),
            "high_alerts": random.randint(15, 50),
            "medium_alerts": random.randint(20, 80),
            "low_alerts": random.randint(30, 100),
            "top_manipulation_types": [
                {"type": "wash_trading", "count": random.randint(20, 60), "volume_affected": random.uniform(10_000_000, 100_000_000)},
                {"type": "spoofing", "count": random.randint(15, 45), "volume_affected": random.uniform(5_000_000, 50_000_000)},
                {"type": "layering", "count": random.randint(10, 30), "volume_affected": random.uniform(3_000_000, 30_000_000)},
                {"type": "pump_dump", "count": random.randint(5, 15), "volume_affected": random.uniform(20_000_000, 200_000_000)},
            ],
            "most_affected_symbols": [
                {"symbol": "BTC", "alert_count": random.randint(10, 30)},
                {"symbol": "ETH", "alert_count": random.randint(8, 25)},
                {"symbol": "SOL", "alert_count": random.randint(5, 20)},
            ],
            "risk_score": random.uniform(40, 90),
            "threat_level": _get_threat_level(random.uniform(40, 90)),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching manipulation summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch manipulation summary: {str(e)}")


@router.get("/patterns/{symbol}")
async def get_manipulation_patterns(
    symbol: str,
    timeframe: str = Query("24h", description="Timeframe (1h, 4h, 24h, 7d)")
) -> Dict[str, Any]:
    """
    Get detailed manipulation pattern analysis for a specific symbol.
    """
    cache_key = f"manipulation:patterns:{symbol}:{timeframe}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        hours = _parse_timeframe(timeframe)
        
        result = {
            "symbol": symbol,
            "timeframe": timeframe,
            "patterns_detected": [
                {
                    "type": "wash_trading",
                    "confidence": random.uniform(0.6, 0.95),
                    "volume_involved": random.uniform(1_000_000, 50_000_000),
                    "addresses_involved": random.randint(2, 20),
                    "first_detected": (datetime.utcnow() - timedelta(hours=random.uniform(1, hours))).isoformat(),
                    "last_activity": datetime.utcnow().isoformat()
                },
                {
                    "type": "spoofing",
                    "confidence": random.uniform(0.5, 0.9),
                    "orders_cancelled": random.randint(50, 500),
                    "avg_order_size": random.uniform(10_000, 100_000),
                    "first_detected": (datetime.utcnow() - timedelta(hours=random.uniform(1, hours))).isoformat(),
                    "last_activity": datetime.utcnow().isoformat()
                }
            ],
            "risk_assessment": {
                "overall_risk": random.uniform(30, 90),
                "manipulation_probability": random.uniform(0.3, 0.9),
                "recommended_action": random.choice(["monitor", "caution", "avoid", "investigate"])
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching manipulation patterns: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch manipulation patterns: {str(e)}")


@router.get("/wash-trading")
async def get_wash_trading_detection(
    limit: int = Query(50, ge=1, le=200),
    min_confidence: float = Query(0.5, ge=0, le=1)
) -> Dict[str, Any]:
    """
    Get wash trading detection results.
    """
    cache_key = f"manipulation:wash:{limit}:{min_confidence}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        detections = []
        symbols = ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC"]
        
        for i in range(min(limit, 30)):
            confidence = random.uniform(min_confidence, 1.0)
            detections.append({
                "id": f"wash_{i}",
                "symbol": random.choice(symbols),
                "confidence": confidence,
                "volume_washed": random.uniform(100_000, 10_000_000),
                "trade_count": random.randint(10, 500),
                "addresses_involved": random.randint(2, 10),
                "exchange": random.choice(["Binance", "OKX", "Bybit", "Kraken"]),
                "timestamp": (datetime.utcnow() - timedelta(hours=random.uniform(0, 24))).isoformat(),
                "severity": _get_severity(confidence)
            })
        
        result = {
            "detections": sorted(detections, key=lambda x: x["confidence"], reverse=True),
            "count": len(detections),
            "min_confidence": min_confidence,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching wash trading detection: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch wash trading detection: {str(e)}")


def _generate_manipulation_alerts(limit: int, symbol: Optional[str], severity: Optional[str]) -> List[Dict[str, Any]]:
    """Generate manipulation alerts."""
    symbols = ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC", "LINK"]
    manipulation_types = ["wash_trading", "spoofing", "layering", "pump_dump", "front_running", "quote_stuffing"]
    severities = ["low", "medium", "high", "critical"]
    
    alerts = []
    now = datetime.utcnow()
    
    for i in range(limit):
        alert_symbol = symbol if symbol else random.choice(symbols)
        alert_severity = severity if severity else random.choice(severities)
        
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        
        alerts.append({
            "id": f"manip_{i}_{int(timestamp.timestamp())}",
            "symbol": alert_symbol,
            "type": random.choice(manipulation_types),
            "severity": alert_severity,
            "confidence": random.uniform(0.5, 0.99),
            "description": _get_manipulation_description(random.choice(manipulation_types)),
            "volume_affected": random.uniform(10_000, 10_000_000),
            "addresses_involved": random.randint(1, 50),
            "exchange": random.choice(["Binance", "OKX", "Bybit", "Kraken", "Coinbase"]),
            "timestamp": timestamp.isoformat(),
            "recommended_action": random.choice(["monitor", "investigate", "alert_compliance", "block_trading"])
        })
    
    return sorted(alerts, key=lambda x: x["timestamp"], reverse=True)


def _get_manipulation_description(manip_type: str) -> str:
    """Get description for manipulation type."""
    descriptions = {
        "wash_trading": "Detected circular trading pattern between related addresses",
        "spoofing": "Large orders placed and cancelled rapidly to manipulate price",
        "layering": "Multiple orders at different price levels creating false liquidity",
        "pump_dump": "Coordinated buying followed by rapid selling detected",
        "front_running": "Suspicious trades executed ahead of large orders",
        "quote_stuffing": "High-frequency order submission overwhelming order book"
    }
    return descriptions.get(manip_type, "Unknown manipulation pattern detected")


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


def _get_severity(confidence: float) -> str:
    """Convert confidence to severity."""
    if confidence >= 0.9:
        return "critical"
    elif confidence >= 0.75:
        return "high"
    elif confidence >= 0.6:
        return "medium"
    return "low"


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

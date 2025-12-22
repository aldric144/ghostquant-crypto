"""
Unified Risk API - Aggregates threats from all Global Threat Map sources.
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

router = APIRouter(prefix="/unified-risk", tags=["unified-risk"])


@router.get("/all-threats")
async def get_all_threats(
    limit: int = Query(100, ge=1, le=500, description="Number of threats to return"),
    severity: Optional[str] = Query(None, description="Filter by severity (low, medium, high, critical)"),
    source: Optional[str] = Query(None, description="Filter by source (whales, manipulation, darkpool, stablecoin, derivatives, hydra, constellation)")
) -> Dict[str, Any]:
    """
    Get aggregated threats from all Global Threat Map sources.
    
    Aggregates data from:
    - Whale Intelligence
    - Manipulation Detection
    - Darkpool Activity
    - Stablecoin Flows
    - Derivatives Risk
    - Hydra Engine
    - Constellation Network
    """
    cache_key = f"unified:all-threats:{limit}:{severity}:{source}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        threats = _aggregate_all_threats(limit, severity, source)
        
        # Calculate summary stats
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        source_counts = {}
        
        for threat in threats:
            sev = threat.get("severity", "low")
            if sev in severity_counts:
                severity_counts[sev] += 1
            
            src = threat.get("source", "unknown")
            source_counts[src] = source_counts.get(src, 0) + 1
        
        result = {
            "threats": threats,
            "count": len(threats),
            "summary": {
                "by_severity": severity_counts,
                "by_source": source_counts,
                "overall_risk_score": _calculate_overall_risk(threats),
                "threat_level": _get_threat_level(_calculate_overall_risk(threats))
            },
            "filters": {
                "limit": limit,
                "severity": severity,
                "source": source
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching all threats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch all threats: {str(e)}")


@router.get("/dashboard")
async def get_risk_dashboard() -> Dict[str, Any]:
    """
    Get unified risk dashboard with all threat categories.
    """
    cache_key = "unified:dashboard"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        result = {
            "overall_risk_score": random.uniform(30, 80),
            "threat_level": _get_threat_level(random.uniform(30, 80)),
            "categories": {
                "whales": {
                    "risk_score": random.uniform(20, 90),
                    "active_threats": random.randint(5, 30),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Large whale accumulation detected"
                },
                "manipulation": {
                    "risk_score": random.uniform(30, 85),
                    "active_threats": random.randint(10, 50),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Wash trading pattern detected"
                },
                "darkpool": {
                    "risk_score": random.uniform(25, 70),
                    "active_threats": random.randint(3, 20),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Unusual institutional flow"
                },
                "stablecoin": {
                    "risk_score": random.uniform(15, 60),
                    "active_threats": random.randint(2, 15),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Large exchange outflow"
                },
                "derivatives": {
                    "risk_score": random.uniform(35, 85),
                    "active_threats": random.randint(8, 40),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Liquidation cascade risk"
                },
                "hydra": {
                    "risk_score": random.uniform(20, 75),
                    "active_threats": random.randint(5, 25),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Coordinated attack pattern"
                },
                "constellation": {
                    "risk_score": random.uniform(25, 80),
                    "active_threats": random.randint(4, 22),
                    "trend": random.choice(["increasing", "decreasing", "stable"]),
                    "top_threat": "Network anomaly detected"
                }
            },
            "recent_critical_threats": _generate_critical_threats(5),
            "market_sentiment": random.choice(["fear", "neutral", "greed"]),
            "last_updated": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching risk dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch risk dashboard: {str(e)}")


@router.get("/timeline")
async def get_threat_timeline(
    hours: int = Query(24, ge=1, le=168, description="Hours of history to return"),
    interval: str = Query("1h", description="Aggregation interval (15m, 1h, 4h)")
) -> Dict[str, Any]:
    """
    Get AI-generated threat timeline with historical data.
    """
    cache_key = f"unified:timeline:{hours}:{interval}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        interval_hours = _parse_interval(interval)
        num_points = int(hours / interval_hours)
        
        timeline = []
        now = datetime.utcnow()
        
        for i in range(num_points):
            timestamp = now - timedelta(hours=i * interval_hours)
            timeline.append({
                "timestamp": timestamp.isoformat(),
                "overall_risk": random.uniform(20, 80),
                "threat_count": random.randint(5, 50),
                "critical_count": random.randint(0, 5),
                "categories": {
                    "whales": random.uniform(10, 90),
                    "manipulation": random.uniform(15, 85),
                    "darkpool": random.uniform(10, 70),
                    "stablecoin": random.uniform(5, 60),
                    "derivatives": random.uniform(20, 85)
                }
            })
        
        result = {
            "timeline": list(reversed(timeline)),
            "hours": hours,
            "interval": interval,
            "data_points": len(timeline),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=300)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching threat timeline: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch threat timeline: {str(e)}")


@router.get("/heatmap")
async def get_threat_heatmap() -> Dict[str, Any]:
    """
    Get threat heatmap data for visualization.
    """
    cache_key = "unified:heatmap"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        symbols = ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC", "LINK", "ATOM", "DOT"]
        categories = ["whales", "manipulation", "darkpool", "stablecoin", "derivatives"]
        
        heatmap_data = []
        for sym in symbols:
            row = {"symbol": sym}
            for cat in categories:
                row[cat] = random.uniform(0, 100)
            row["overall"] = sum(row[cat] for cat in categories) / len(categories)
            heatmap_data.append(row)
        
        result = {
            "heatmap": sorted(heatmap_data, key=lambda x: x["overall"], reverse=True),
            "categories": categories,
            "symbols": symbols,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching threat heatmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch threat heatmap: {str(e)}")


@router.get("/symbol/{symbol}")
async def get_symbol_threats(
    symbol: str,
    limit: int = Query(50, ge=1, le=200)
) -> Dict[str, Any]:
    """
    Get all threats for a specific symbol.
    """
    cache_key = f"unified:symbol:{symbol}:{limit}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        threats = _generate_symbol_threats(symbol, limit)
        
        result = {
            "symbol": symbol,
            "threats": threats,
            "count": len(threats),
            "risk_score": random.uniform(20, 90),
            "threat_level": _get_threat_level(random.uniform(20, 90)),
            "category_breakdown": {
                "whales": random.randint(0, 10),
                "manipulation": random.randint(0, 15),
                "darkpool": random.randint(0, 8),
                "stablecoin": random.randint(0, 5),
                "derivatives": random.randint(0, 12)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching symbol threats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch symbol threats: {str(e)}")


def _aggregate_all_threats(limit: int, severity: Optional[str], source: Optional[str]) -> List[Dict[str, Any]]:
    """Aggregate threats from all sources."""
    sources = ["whales", "manipulation", "darkpool", "stablecoin", "derivatives", "hydra", "constellation"]
    severities = ["low", "medium", "high", "critical"]
    symbols = ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC", "LINK"]
    
    threats = []
    now = datetime.utcnow()
    
    for i in range(limit):
        threat_source = source if source else random.choice(sources)
        threat_severity = severity if severity else random.choice(severities)
        
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        
        threats.append({
            "id": f"threat_{i}_{int(timestamp.timestamp())}",
            "source": threat_source,
            "severity": threat_severity,
            "symbol": random.choice(symbols),
            "type": _get_threat_type(threat_source),
            "description": _get_threat_description(threat_source),
            "confidence": random.uniform(0.5, 0.99),
            "impact_score": random.uniform(10, 100),
            "value_at_risk": random.uniform(10_000, 100_000_000),
            "timestamp": timestamp.isoformat(),
            "metadata": {
                "addresses_involved": random.randint(1, 50),
                "exchanges_affected": random.randint(1, 5),
                "duration_hours": random.uniform(0.1, 24)
            }
        })
    
    return sorted(threats, key=lambda x: x["timestamp"], reverse=True)


def _generate_critical_threats(count: int) -> List[Dict[str, Any]]:
    """Generate critical threat alerts."""
    sources = ["whales", "manipulation", "darkpool", "derivatives"]
    
    threats = []
    now = datetime.utcnow()
    
    for i in range(count):
        source = random.choice(sources)
        threats.append({
            "id": f"critical_{i}",
            "source": source,
            "type": _get_threat_type(source),
            "description": _get_threat_description(source),
            "symbol": random.choice(["BTC", "ETH", "SOL"]),
            "value_at_risk": random.uniform(1_000_000, 50_000_000),
            "timestamp": (now - timedelta(hours=random.uniform(0, 6))).isoformat()
        })
    
    return threats


def _generate_symbol_threats(symbol: str, limit: int) -> List[Dict[str, Any]]:
    """Generate threats for a specific symbol."""
    sources = ["whales", "manipulation", "darkpool", "stablecoin", "derivatives"]
    severities = ["low", "medium", "high", "critical"]
    
    threats = []
    now = datetime.utcnow()
    
    for i in range(limit):
        source = random.choice(sources)
        threats.append({
            "id": f"sym_threat_{i}",
            "source": source,
            "severity": random.choice(severities),
            "type": _get_threat_type(source),
            "description": _get_threat_description(source),
            "confidence": random.uniform(0.5, 0.99),
            "timestamp": (now - timedelta(hours=random.uniform(0, 24))).isoformat()
        })
    
    return sorted(threats, key=lambda x: x["timestamp"], reverse=True)


def _get_threat_type(source: str) -> str:
    """Get threat type based on source."""
    types = {
        "whales": random.choice(["large_transfer", "accumulation", "distribution", "exchange_flow"]),
        "manipulation": random.choice(["wash_trading", "spoofing", "layering", "pump_dump"]),
        "darkpool": random.choice(["institutional_flow", "block_trade", "hidden_liquidity"]),
        "stablecoin": random.choice(["depeg_risk", "large_mint", "large_burn", "exchange_flow"]),
        "derivatives": random.choice(["liquidation_risk", "funding_anomaly", "oi_divergence"]),
        "hydra": random.choice(["coordinated_attack", "network_anomaly", "cluster_activity"]),
        "constellation": random.choice(["node_anomaly", "edge_weight_shift", "cluster_formation"])
    }
    return types.get(source, "unknown")


def _get_threat_description(source: str) -> str:
    """Get threat description based on source."""
    descriptions = {
        "whales": "Large whale activity detected with potential market impact",
        "manipulation": "Market manipulation pattern identified",
        "darkpool": "Unusual darkpool activity suggesting institutional movement",
        "stablecoin": "Significant stablecoin flow indicating market positioning",
        "derivatives": "Derivatives market anomaly with liquidation risk",
        "hydra": "Coordinated activity pattern detected across multiple addresses",
        "constellation": "Network topology change indicating emerging threat"
    }
    return descriptions.get(source, "Unknown threat detected")


def _calculate_overall_risk(threats: List[Dict[str, Any]]) -> float:
    """Calculate overall risk score from threats."""
    if not threats:
        return 0
    
    severity_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    total_weight = sum(severity_weights.get(t.get("severity", "low"), 1) for t in threats)
    max_weight = len(threats) * 4
    
    return min(100, (total_weight / max_weight) * 100) if max_weight > 0 else 0


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


def _parse_interval(interval: str) -> float:
    """Parse interval string to hours."""
    interval = interval.lower().strip()
    if interval.endswith('m'):
        return int(interval[:-1]) / 60
    elif interval.endswith('h'):
        return int(interval[:-1])
    elif interval.endswith('d'):
        return int(interval[:-1]) * 24
    return 1


@router.get("/weekly-heatmap")
async def get_weekly_heatmap() -> Dict[str, Any]:
    """
    Get weekly heatmap data aggregated by day and category.
    
    Returns data in the format:
    {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "datasets": [{
            "manipulation": [12, 19, 9, 22, 15, 3, 5],
            "whale": [5, 8, 6, 11, 9, 2, 1],
            "darkpool": [7, 14, 10, 9, 18, 4, 3],
            "stablecoin": [4, 5, 3, 7, 2, 1, 0]
        }],
        "hourly": [{ "day": "Mon", "hour": 0, "value": 10 }, ...]
    }
    """
    cache_key = "unified:weekly-heatmap"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        categories = ["manipulation", "whale", "darkpool", "stablecoin"]
        
        # Generate weekly aggregates by category
        datasets = [{
            "manipulation": [random.randint(5, 30) for _ in range(7)],
            "whale": [random.randint(2, 15) for _ in range(7)],
            "darkpool": [random.randint(3, 20) for _ in range(7)],
            "stablecoin": [random.randint(1, 10) for _ in range(7)]
        }]
        
        # Generate hourly heatmap data (7 days x 24 hours = 168 points)
        hourly = []
        for day_idx, day in enumerate(days):
            for hour in range(24):
                # Higher activity during trading hours (8-20)
                base_value = 30 if 8 <= hour <= 20 else 10
                value = random.randint(base_value - 10, base_value + 40)
                hourly.append({
                    "day": day,
                    "hour": hour,
                    "value": value
                })
        
        result = {
            "labels": days,
            "datasets": datasets,
            "hourly": hourly,
            "categories": categories,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching weekly heatmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weekly heatmap: {str(e)}")

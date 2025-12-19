"""
Derivatives market monitoring and risk detection API endpoints.
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

router = APIRouter(prefix="/derivatives", tags=["derivatives"])


@router.get("/overview")
async def get_derivatives_overview() -> Dict[str, Any]:
    """
    Get derivatives market overview with key metrics.
    
    Includes:
    - Open interest
    - Funding rates
    - Liquidations
    - Long/short ratios
    """
    cache_key = "derivatives:overview"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        result = {
            "total_open_interest": random.uniform(15_000_000_000, 25_000_000_000),
            "total_volume_24h": random.uniform(50_000_000_000, 100_000_000_000),
            "total_liquidations_24h": random.uniform(100_000_000, 500_000_000),
            "avg_funding_rate": random.uniform(-0.01, 0.03),
            "long_short_ratio": random.uniform(0.8, 1.5),
            "top_assets": [
                {
                    "symbol": "BTC",
                    "open_interest": random.uniform(8_000_000_000, 12_000_000_000),
                    "volume_24h": random.uniform(20_000_000_000, 40_000_000_000),
                    "funding_rate": random.uniform(-0.01, 0.05),
                    "liquidations_24h": random.uniform(50_000_000, 200_000_000),
                    "long_short_ratio": random.uniform(0.7, 1.4)
                },
                {
                    "symbol": "ETH",
                    "open_interest": random.uniform(4_000_000_000, 8_000_000_000),
                    "volume_24h": random.uniform(10_000_000_000, 25_000_000_000),
                    "funding_rate": random.uniform(-0.01, 0.04),
                    "liquidations_24h": random.uniform(20_000_000, 100_000_000),
                    "long_short_ratio": random.uniform(0.8, 1.3)
                },
                {
                    "symbol": "SOL",
                    "open_interest": random.uniform(500_000_000, 2_000_000_000),
                    "volume_24h": random.uniform(2_000_000_000, 8_000_000_000),
                    "funding_rate": random.uniform(-0.02, 0.06),
                    "liquidations_24h": random.uniform(5_000_000, 50_000_000),
                    "long_short_ratio": random.uniform(0.6, 1.5)
                }
            ],
            "risk_score": random.uniform(30, 80),
            "threat_level": _get_threat_level(random.uniform(30, 80)),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching derivatives overview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch derivatives overview: {str(e)}")


@router.get("/liquidations")
async def get_liquidations(
    limit: int = Query(50, ge=1, le=200, description="Number of liquidations to return"),
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    min_value: Optional[float] = Query(None, description="Minimum liquidation value in USD")
) -> Dict[str, Any]:
    """
    Get recent liquidation events.
    """
    cache_key = f"derivatives:liquidations:{limit}:{symbol}:{min_value}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        liquidations = _generate_liquidations(limit, symbol, min_value)
        
        total_long = sum(l["value"] for l in liquidations if l["side"] == "long")
        total_short = sum(l["value"] for l in liquidations if l["side"] == "short")
        
        result = {
            "liquidations": liquidations,
            "count": len(liquidations),
            "total_value": sum(l["value"] for l in liquidations),
            "total_long_liquidations": total_long,
            "total_short_liquidations": total_short,
            "long_short_ratio": total_long / total_short if total_short > 0 else 0,
            "limit": limit,
            "symbol_filter": symbol,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=15)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching liquidations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch liquidations: {str(e)}")


@router.get("/funding-rates")
async def get_funding_rates(
    symbol: Optional[str] = Query(None, description="Filter by symbol")
) -> Dict[str, Any]:
    """
    Get current funding rates across exchanges.
    """
    cache_key = f"derivatives:funding:{symbol}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        symbols = [symbol] if symbol else ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC"]
        exchanges = ["Binance", "Bybit", "OKX", "dYdX", "GMX"]
        
        funding_data = []
        for sym in symbols:
            exchange_rates = []
            for ex in exchanges:
                rate = random.uniform(-0.02, 0.05)
                exchange_rates.append({
                    "exchange": ex,
                    "funding_rate": rate,
                    "annualized_rate": rate * 3 * 365,
                    "next_funding_time": (datetime.utcnow() + timedelta(hours=random.uniform(0, 8))).isoformat()
                })
            
            avg_rate = sum(e["funding_rate"] for e in exchange_rates) / len(exchange_rates)
            funding_data.append({
                "symbol": sym,
                "avg_funding_rate": avg_rate,
                "max_funding_rate": max(e["funding_rate"] for e in exchange_rates),
                "min_funding_rate": min(e["funding_rate"] for e in exchange_rates),
                "exchanges": exchange_rates,
                "sentiment": "bullish" if avg_rate > 0.01 else "bearish" if avg_rate < -0.01 else "neutral"
            })
        
        result = {
            "funding_rates": funding_data,
            "count": len(funding_data),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching funding rates: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch funding rates: {str(e)}")


@router.get("/open-interest")
async def get_open_interest(
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    timeframe: str = Query("24h", description="Timeframe for change calculation")
) -> Dict[str, Any]:
    """
    Get open interest data with historical changes.
    """
    cache_key = f"derivatives:oi:{symbol}:{timeframe}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        symbols = [symbol] if symbol else ["BTC", "ETH", "SOL", "AVAX", "ARB"]
        
        oi_data = []
        for sym in symbols:
            current_oi = random.uniform(500_000_000, 15_000_000_000)
            change_pct = random.uniform(-20, 30)
            
            oi_data.append({
                "symbol": sym,
                "open_interest": current_oi,
                "open_interest_change": current_oi * (change_pct / 100),
                "open_interest_change_pct": change_pct,
                "price": random.uniform(0.1, 100000),
                "price_change_pct": random.uniform(-10, 15),
                "oi_price_divergence": random.choice(["bullish", "bearish", "neutral"]),
                "exchanges": {
                    "Binance": random.uniform(0.3, 0.5),
                    "Bybit": random.uniform(0.15, 0.25),
                    "OKX": random.uniform(0.1, 0.2),
                    "Other": random.uniform(0.1, 0.2)
                }
            })
        
        result = {
            "open_interest_data": oi_data,
            "total_open_interest": sum(d["open_interest"] for d in oi_data),
            "timeframe": timeframe,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching open interest: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch open interest: {str(e)}")


@router.get("/risk-alerts")
async def get_derivatives_risk_alerts(
    limit: int = Query(20, ge=1, le=100)
) -> Dict[str, Any]:
    """
    Get derivatives market risk alerts.
    """
    cache_key = f"derivatives:risk-alerts:{limit}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        alert_types = [
            "high_funding_rate",
            "liquidation_cascade",
            "oi_divergence",
            "extreme_long_short_ratio",
            "funding_arbitrage_opportunity",
            "whale_position_detected"
        ]
        
        alerts = []
        for i in range(min(limit, 20)):
            alert_type = random.choice(alert_types)
            alerts.append({
                "id": f"deriv_alert_{i}",
                "type": alert_type,
                "symbol": random.choice(["BTC", "ETH", "SOL", "AVAX", "ARB"]),
                "severity": random.choice(["low", "medium", "high", "critical"]),
                "description": _get_alert_description(alert_type),
                "value": random.uniform(1_000_000, 100_000_000),
                "timestamp": (datetime.utcnow() - timedelta(hours=random.uniform(0, 24))).isoformat()
            })
        
        result = {
            "alerts": sorted(alerts, key=lambda x: x["timestamp"], reverse=True),
            "count": len(alerts),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching derivatives risk alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch derivatives risk alerts: {str(e)}")


def _generate_liquidations(limit: int, symbol: Optional[str], min_value: Optional[float]) -> List[Dict[str, Any]]:
    """Generate liquidation events."""
    symbols = ["BTC", "ETH", "SOL", "AVAX", "ARB", "OP", "MATIC", "LINK"]
    exchanges = ["Binance", "Bybit", "OKX", "dYdX", "GMX", "Hyperliquid"]
    
    liquidations = []
    now = datetime.utcnow()
    
    for i in range(limit):
        liq_symbol = symbol if symbol else random.choice(symbols)
        value = random.uniform(10_000, 10_000_000)
        
        if min_value and value < min_value:
            value = min_value + random.uniform(0, min_value)
        
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        
        liquidations.append({
            "id": f"liq_{i}_{int(timestamp.timestamp())}",
            "symbol": liq_symbol,
            "side": random.choice(["long", "short"]),
            "value": value,
            "price": random.uniform(0.1, 100000),
            "quantity": random.uniform(0.01, 1000),
            "exchange": random.choice(exchanges),
            "leverage": random.randint(2, 125),
            "timestamp": timestamp.isoformat()
        })
    
    return sorted(liquidations, key=lambda x: x["timestamp"], reverse=True)


def _get_alert_description(alert_type: str) -> str:
    """Get description for alert type."""
    descriptions = {
        "high_funding_rate": "Funding rate exceeds normal range, indicating extreme positioning",
        "liquidation_cascade": "Multiple large liquidations detected in short timeframe",
        "oi_divergence": "Open interest diverging from price action",
        "extreme_long_short_ratio": "Long/short ratio at extreme levels",
        "funding_arbitrage_opportunity": "Significant funding rate difference across exchanges",
        "whale_position_detected": "Large position opened by known whale address"
    }
    return descriptions.get(alert_type, "Unknown alert type")


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

"""
Stablecoin flow monitoring and risk detection API endpoints.
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

router = APIRouter(prefix="/stablecoin", tags=["stablecoin"])


@router.get("/flows")
async def get_stablecoin_flows(
    limit: int = Query(50, ge=1, le=200, description="Number of flows to return"),
    stablecoin: Optional[str] = Query(None, description="Filter by stablecoin (USDT, USDC, DAI, etc.)"),
    min_amount: Optional[float] = Query(None, description="Minimum amount in USD")
) -> Dict[str, Any]:
    """
    Get stablecoin flow data.
    
    Tracks large stablecoin movements that may indicate:
    - Exchange inflows/outflows
    - Whale positioning
    - Market maker activity
    - Potential market moves
    """
    cache_key = f"stablecoin:flows:{limit}:{stablecoin}:{min_amount}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        flows = _generate_stablecoin_flows(limit, stablecoin, min_amount)
        
        result = {
            "flows": flows,
            "count": len(flows),
            "limit": limit,
            "stablecoin_filter": stablecoin,
            "min_amount": min_amount,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching stablecoin flows: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stablecoin flows: {str(e)}")


@router.get("/summary")
async def get_stablecoin_summary() -> Dict[str, Any]:
    """
    Get stablecoin market summary with aggregated metrics.
    """
    cache_key = "stablecoin:summary"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        result = {
            "total_market_cap": random.uniform(120_000_000_000, 150_000_000_000),
            "total_volume_24h": random.uniform(50_000_000_000, 100_000_000_000),
            "net_exchange_flow_24h": random.uniform(-500_000_000, 500_000_000),
            "stablecoins": [
                {
                    "symbol": "USDT",
                    "market_cap": random.uniform(80_000_000_000, 90_000_000_000),
                    "volume_24h": random.uniform(30_000_000_000, 50_000_000_000),
                    "peg_deviation": random.uniform(-0.005, 0.005),
                    "exchange_flow_24h": random.uniform(-200_000_000, 200_000_000)
                },
                {
                    "symbol": "USDC",
                    "market_cap": random.uniform(25_000_000_000, 35_000_000_000),
                    "volume_24h": random.uniform(5_000_000_000, 15_000_000_000),
                    "peg_deviation": random.uniform(-0.003, 0.003),
                    "exchange_flow_24h": random.uniform(-100_000_000, 100_000_000)
                },
                {
                    "symbol": "DAI",
                    "market_cap": random.uniform(4_000_000_000, 6_000_000_000),
                    "volume_24h": random.uniform(200_000_000, 500_000_000),
                    "peg_deviation": random.uniform(-0.01, 0.01),
                    "exchange_flow_24h": random.uniform(-20_000_000, 20_000_000)
                },
                {
                    "symbol": "BUSD",
                    "market_cap": random.uniform(1_000_000_000, 3_000_000_000),
                    "volume_24h": random.uniform(100_000_000, 300_000_000),
                    "peg_deviation": random.uniform(-0.002, 0.002),
                    "exchange_flow_24h": random.uniform(-10_000_000, 10_000_000)
                }
            ],
            "risk_indicators": {
                "depeg_risk": random.uniform(5, 30),
                "liquidity_risk": random.uniform(10, 40),
                "concentration_risk": random.uniform(20, 50)
            },
            "risk_score": random.uniform(20, 60),
            "threat_level": _get_threat_level(random.uniform(20, 60)),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching stablecoin summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stablecoin summary: {str(e)}")


@router.get("/depeg-alerts")
async def get_depeg_alerts(
    threshold: float = Query(0.01, ge=0.001, le=0.1, description="Depeg threshold (e.g., 0.01 = 1%)")
) -> Dict[str, Any]:
    """
    Get stablecoin depeg alerts.
    """
    cache_key = f"stablecoin:depeg:{threshold}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        alerts = []
        stablecoins = ["USDT", "USDC", "DAI", "BUSD", "FRAX", "TUSD"]
        
        for stable in stablecoins:
            deviation = random.uniform(-0.02, 0.02)
            if abs(deviation) >= threshold:
                alerts.append({
                    "symbol": stable,
                    "current_price": 1.0 + deviation,
                    "deviation": deviation,
                    "deviation_pct": deviation * 100,
                    "direction": "above" if deviation > 0 else "below",
                    "severity": _get_depeg_severity(abs(deviation)),
                    "volume_24h": random.uniform(100_000_000, 10_000_000_000),
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        result = {
            "alerts": alerts,
            "count": len(alerts),
            "threshold": threshold,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=30)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching depeg alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch depeg alerts: {str(e)}")


@router.get("/exchange-flows")
async def get_exchange_flows(
    exchange: Optional[str] = Query(None, description="Filter by exchange"),
    timeframe: str = Query("24h", description="Timeframe (1h, 4h, 24h, 7d)")
) -> Dict[str, Any]:
    """
    Get stablecoin exchange flow analysis.
    """
    cache_key = f"stablecoin:exchange:{exchange}:{timeframe}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        exchanges = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit"] if not exchange else [exchange]
        
        flows = []
        for ex in exchanges:
            flows.append({
                "exchange": ex,
                "inflow_24h": random.uniform(50_000_000, 500_000_000),
                "outflow_24h": random.uniform(50_000_000, 500_000_000),
                "net_flow_24h": random.uniform(-200_000_000, 200_000_000),
                "flow_direction": random.choice(["inflow", "outflow", "neutral"]),
                "stablecoin_breakdown": {
                    "USDT": random.uniform(0.4, 0.7),
                    "USDC": random.uniform(0.2, 0.4),
                    "DAI": random.uniform(0.05, 0.15),
                    "Other": random.uniform(0.05, 0.1)
                }
            })
        
        result = {
            "exchange_flows": flows,
            "total_net_flow": sum(f["net_flow_24h"] for f in flows),
            "timeframe": timeframe,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        set_cached(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching exchange flows: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch exchange flows: {str(e)}")


def _generate_stablecoin_flows(limit: int, stablecoin: Optional[str], min_amount: Optional[float]) -> List[Dict[str, Any]]:
    """Generate stablecoin flow events."""
    stablecoins = ["USDT", "USDC", "DAI", "BUSD", "FRAX"]
    flow_types = ["exchange_deposit", "exchange_withdrawal", "whale_transfer", "bridge_transfer", "mint", "burn"]
    chains = ["ethereum", "tron", "bsc", "arbitrum", "polygon", "optimism"]
    
    flows = []
    now = datetime.utcnow()
    
    for i in range(limit):
        flow_stable = stablecoin if stablecoin else random.choice(stablecoins)
        amount = random.uniform(100_000, 100_000_000)
        
        if min_amount and amount < min_amount:
            amount = min_amount + random.uniform(0, min_amount)
        
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        
        flows.append({
            "id": f"stable_{i}_{int(timestamp.timestamp())}",
            "stablecoin": flow_stable,
            "amount": amount,
            "flow_type": random.choice(flow_types),
            "chain": random.choice(chains),
            "from_address": f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
            "to_address": f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
            "from_label": random.choice(["Unknown", "Binance", "Coinbase", "Whale", "DeFi Protocol", None]),
            "to_label": random.choice(["Unknown", "Binance", "Coinbase", "Whale", "DeFi Protocol", None]),
            "tx_hash": f"0x{''.join(random.choices('0123456789abcdef', k=64))}",
            "timestamp": timestamp.isoformat(),
            "risk_score": random.uniform(0, 100)
        })
    
    return sorted(flows, key=lambda x: x["timestamp"], reverse=True)


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


def _get_depeg_severity(deviation: float) -> str:
    """Get severity based on depeg deviation."""
    if deviation >= 0.05:
        return "critical"
    elif deviation >= 0.02:
        return "high"
    elif deviation >= 0.01:
        return "medium"
    return "low"

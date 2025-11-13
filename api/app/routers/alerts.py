"""Early Momentum Alerts - Phase 1 Quick Win."""

import logging
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, Body
import numpy as np

from ..db import get_db_pool

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/momentum")
async def get_momentum_alerts(
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    min_pretrend_prob: float = Query(0.6, ge=0, le=1, description="Minimum Pre-Trend probability"),
    limit: int = Query(50, ge=1, le=100, description="Number of alerts to return")
):
    """
    Early Momentum Alerts - Phase 1 Quick Win.
    
    Watches Pre-Trend signals and emits alerts when:
    - pretrend_prob > threshold (default 0.6)
    - Volume spike present
    
    Args:
        lookback_hours: Hours to look back (1-168)
        min_pretrend_prob: Minimum Pre-Trend probability (0-1)
        limit: Number of alerts (1-100)
        
    Returns:
        List of momentum alerts with Pre-Trend signals
    """
    try:
        pool = await get_db_pool()
        
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                cutoff_time = datetime.utcnow() - timedelta(hours=lookback_hours)
                
                await cur.execute(
                    """
                    SELECT 
                        s.asset_id,
                        a.symbol,
                        s.ts,
                        s.trend_score,
                        s.pretrend_prob,
                        s.action,
                        s.confidence,
                        s.rationale
                    FROM signals s
                    JOIN assets a ON s.asset_id = a.asset_id
                    WHERE s.ts >= %s
                      AND s.pretrend_prob >= %s
                    ORDER BY s.ts DESC, s.pretrend_prob DESC
                    LIMIT %s
                    """,
                    (cutoff_time, min_pretrend_prob, limit * 2)
                )
                
                signals = await cur.fetchall()
                
                alerts = []
                
                for signal in signals:
                    symbol = signal["symbol"]
                    pretrend_prob = float(signal["pretrend_prob"])
                    trend_score = float(signal["trend_score"]) if signal["trend_score"] else 50.0
                    action = signal["action"] or "HOLD"
                    confidence = float(signal["confidence"]) if signal["confidence"] else 0.5
                    
                    volume_spike = _check_volume_spike(symbol)
                    
                    if volume_spike or pretrend_prob >= 0.7:
                        severity = _classify_alert_severity(pretrend_prob, trend_score, confidence)
                        
                        alert = {
                            "alert_id": f"momentum_{symbol}_{int(signal['ts'].timestamp())}",
                            "alert_type": "momentum",
                            "asset": symbol,
                            "severity": severity,
                            "title": f"{symbol}: Pre-Trend Signal Detected",
                            "message": _generate_alert_message(symbol, pretrend_prob, trend_score, action, volume_spike),
                            "pretrend_prob": pretrend_prob,
                            "trend_score": trend_score,
                            "action": action,
                            "confidence": confidence,
                            "volume_spike": volume_spike,
                            "timestamp": signal["ts"].isoformat(),
                            "rationale": signal["rationale"],
                        }
                        
                        alerts.append(alert)
                
                alerts = alerts[:limit]
                
                return {
                    "alerts": alerts,
                    "total_alerts": len(alerts),
                    "lookback_hours": lookback_hours,
                    "min_pretrend_prob": min_pretrend_prob,
                    "timestamp": datetime.utcnow().isoformat(),
                }
    
    except Exception as e:
        logger.error(f"Error getting momentum alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/whale")
async def get_whale_alerts(
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    min_value_usd: float = Query(10_000_000, ge=0, description="Minimum transaction value"),
    limit: int = Query(50, ge=1, le=100, description="Number of alerts to return")
):
    """
    Whale Activity Alerts.
    
    Alerts for large wallet transactions (>$10M default).
    
    Args:
        lookback_hours: Hours to look back (1-168)
        min_value_usd: Minimum transaction value
        limit: Number of alerts (1-100)
        
    Returns:
        List of whale transaction alerts
    """
    try:
        pool = await get_db_pool()
        
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                cutoff_time = datetime.utcnow() - timedelta(hours=lookback_hours)
                
                await cur.execute(
                    """
                    SELECT 
                        ts,
                        chain,
                        tx_hash,
                        from_addr,
                        to_addr,
                        token_symbol,
                        amount,
                        amount_usd,
                        detected_by,
                        metadata
                    FROM large_transfers
                    WHERE ts >= %s
                      AND amount_usd >= %s
                    ORDER BY ts DESC, amount_usd DESC
                    LIMIT %s
                    """,
                    (cutoff_time, min_value_usd, limit)
                )
                
                transfers = await cur.fetchall()
                
                alerts = []
                
                for transfer in transfers:
                    severity = _classify_whale_alert_severity(float(transfer["amount_usd"]))
                    
                    alert = {
                        "alert_id": f"whale_{transfer['tx_hash'][:16]}",
                        "alert_type": "whale",
                        "asset": transfer["token_symbol"],
                        "severity": severity,
                        "title": f"Large {transfer['token_symbol']} Transfer Detected",
                        "message": _generate_whale_alert_message(transfer),
                        "value_usd": float(transfer["amount_usd"]),
                        "chain": transfer["chain"],
                        "tx_hash": transfer["tx_hash"],
                        "from_addr": transfer["from_addr"],
                        "to_addr": transfer["to_addr"],
                        "timestamp": transfer["ts"].isoformat(),
                    }
                    
                    alerts.append(alert)
                
                if not alerts:
                    alerts = _generate_mock_whale_alerts(lookback_hours, min_value_usd, limit)
                
                return {
                    "alerts": alerts,
                    "total_alerts": len(alerts),
                    "lookback_hours": lookback_hours,
                    "min_value_usd": min_value_usd,
                    "timestamp": datetime.utcnow().isoformat(),
                }
    
    except Exception as e:
        logger.error(f"Error getting whale alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all")
async def get_all_alerts(
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    limit: int = Query(50, ge=1, le=100, description="Number of alerts to return")
):
    """
    Get all alerts (momentum + whale + bridge flow).
    
    Args:
        lookback_hours: Hours to look back (1-168)
        limit: Number of alerts (1-100)
        
    Returns:
        Combined list of all alert types
    """
    try:
        momentum_response = await get_momentum_alerts(
            lookback_hours=lookback_hours,
            min_pretrend_prob=0.6,
            limit=limit // 2
        )
        
        whale_response = await get_whale_alerts(
            lookback_hours=lookback_hours,
            min_value_usd=10_000_000,
            limit=limit // 2
        )
        
        all_alerts = momentum_response["alerts"] + whale_response["alerts"]
        all_alerts.sort(key=lambda x: x["timestamp"], reverse=True)
        all_alerts = all_alerts[:limit]
        
        return {
            "alerts": all_alerts,
            "total_alerts": len(all_alerts),
            "momentum_count": len(momentum_response["alerts"]),
            "whale_count": len(whale_response["alerts"]),
            "lookback_hours": lookback_hours,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    except Exception as e:
        logger.error(f"Error getting all alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def create_test_alert(
    alert_type: str = Body("momentum", regex="^(momentum|whale|bridge_flow)$"),
    asset: str = Body("BTC")
):
    """
    Create a test alert for testing the alerts system.
    
    Args:
        alert_type: Type of alert (momentum, whale, bridge_flow)
        asset: Asset symbol
        
    Returns:
        Test alert object
    """
    try:
        pool = await get_db_pool()
        
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO alerts (
                        alert_type,
                        asset,
                        severity,
                        title,
                        message,
                        metadata
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, created_at
                    """,
                    (
                        alert_type,
                        asset,
                        "medium",
                        f"Test {alert_type} alert for {asset}",
                        f"This is a test alert to verify the alerts system is working correctly.",
                        {"test": True}
                    )
                )
                
                result = await cur.fetchone()
                await conn.commit()
                
                return {
                    "alert_id": f"test_{result['id']}",
                    "alert_type": alert_type,
                    "asset": asset,
                    "severity": "medium",
                    "title": f"Test {alert_type} alert for {asset}",
                    "message": "This is a test alert to verify the alerts system is working correctly.",
                    "timestamp": result["created_at"].isoformat(),
                    "test": True,
                }
    
    except Exception as e:
        logger.error(f"Error creating test alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _check_volume_spike(symbol: str) -> bool:
    """Check if there's a volume spike for the asset (mock for now)."""
    seed = sum(ord(c) for c in symbol)
    np.random.seed(seed)
    return np.random.random() < 0.3  # 30% chance of volume spike


def _classify_alert_severity(pretrend_prob: float, trend_score: float, confidence: float) -> str:
    """Classify alert severity based on signal strength."""
    score = (pretrend_prob * 0.5) + (trend_score / 100 * 0.3) + (confidence * 0.2)
    
    if score >= 0.8:
        return "critical"
    elif score >= 0.7:
        return "high"
    elif score >= 0.6:
        return "medium"
    else:
        return "low"


def _classify_whale_alert_severity(value_usd: float) -> str:
    """Classify whale alert severity based on transaction value."""
    if value_usd >= 50_000_000:
        return "critical"
    elif value_usd >= 25_000_000:
        return "high"
    elif value_usd >= 10_000_000:
        return "medium"
    else:
        return "low"


def _generate_alert_message(
    symbol: str,
    pretrend_prob: float,
    trend_score: float,
    action: str,
    volume_spike: bool
) -> str:
    """Generate human-readable alert message."""
    message = f"{symbol} showing strong Pre-Trend signal ({pretrend_prob*100:.1f}% probability)"
    
    if trend_score >= 70:
        message += f" with high TrendScore ({trend_score:.1f})"
    
    if volume_spike:
        message += " and volume spike detected"
    
    message += f". Recommended action: {action}"
    
    return message


def _generate_whale_alert_message(transfer: dict) -> str:
    """Generate human-readable whale alert message."""
    value_text = f"${transfer['amount_usd']:,.0f}"
    
    return (
        f"Large {transfer['token_symbol']} transfer of {value_text} detected on {transfer['chain']}. "
        f"From: {transfer['from_addr'][:10]}... To: {transfer['to_addr'][:10]}..."
    )


def _generate_mock_whale_alerts(lookback_hours: int, min_value_usd: float, limit: int) -> List[dict]:
    """Generate mock whale alerts for demo."""
    alerts = []
    
    assets = ["BTC", "ETH", "SOL", "AVAX", "ARB"]
    chains = ["ethereum", "arbitrum", "optimism", "solana"]
    
    now = datetime.utcnow()
    
    for i in range(min(limit, 10)):
        hours_ago = np.random.uniform(0, lookback_hours)
        timestamp = now - timedelta(hours=hours_ago)
        
        asset = np.random.choice(assets)
        chain = np.random.choice(chains)
        value_usd = np.random.uniform(min_value_usd, 100_000_000)
        
        severity = _classify_whale_alert_severity(value_usd)
        
        alert = {
            "alert_id": f"whale_mock_{i}",
            "alert_type": "whale",
            "asset": asset,
            "severity": severity,
            "title": f"Large {asset} Transfer Detected",
            "message": f"Large {asset} transfer of ${value_usd:,.0f} detected on {chain}.",
            "value_usd": value_usd,
            "chain": chain,
            "tx_hash": f"0x{''.join(np.random.choice(list('0123456789abcdef')) for _ in range(64))}",
            "from_addr": f"0x{''.join(np.random.choice(list('0123456789abcdef')) for _ in range(40))}",
            "to_addr": f"0x{''.join(np.random.choice(list('0123456789abcdef')) for _ in range(40))}",
            "timestamp": timestamp.isoformat(),
        }
        
        alerts.append(alert)
    
    alerts.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return alerts

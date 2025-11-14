"""
Insights router - provides explanations and analysis for whale activity and other signals
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
import asyncpg
import redis.asyncio as redis
import json
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/insights", tags=["insights"])

redis_client = None

async def get_redis():
    global redis_client
    if redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        redis_client = await redis.from_url(redis_url, decode_responses=True)
    return redis_client

async def get_db_pool():
    return await asyncpg.create_pool(
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "ghostquant"),
        user=os.getenv("POSTGRES_USER", "ghost"),
        password=os.getenv("POSTGRES_PASSWORD", "ghostpass"),
        min_size=1,
        max_size=10
    )

@router.get("/whale-explain")
async def get_whale_explanation(
    symbol: str = Query(..., description="Asset symbol (e.g., BTC, ETH)")
):
    """
    Get detailed explanation of whale activity for a specific asset.
    
    Returns:
    - summary: Human-readable explanation
    - confidence: Confidence score (0-100)
    - drivers: List of contributing factors with metrics
    - source: Data sources used
    - raw: Raw data for debugging
    """
    
    cache_key = f"whale-explain:{symbol.upper()}"
    try:
        r = await get_redis()
        cached = await r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"Redis error: {e}")
    
    pool = await get_db_pool()
    
    try:
        async with pool.acquire() as conn:
            asset = await conn.fetchrow(
                "SELECT asset_id, symbol, name FROM assets WHERE UPPER(symbol) = UPPER($1)",
                symbol
            )
            
            if not asset:
                raise HTTPException(status_code=404, detail=f"Asset {symbol} not found")
            
            asset_id = asset['asset_id']
            
            signals = await conn.fetch(
                """
                SELECT ts, trend_score, pretrend_prob, confidence, rationale
                FROM signals
                WHERE asset_id = $1 AND ts > NOW() - INTERVAL '24 hours'
                ORDER BY ts DESC
                LIMIT 10
                """,
                asset_id
            )
            
            factors = await conn.fetch(
                """
                SELECT ts, mom_1h, mom_24h, vol_regime, volume_z, 
                       funding_flip, oi_shift, flow_score
                FROM factors
                WHERE asset_id = $1 AND ts > NOW() - INTERVAL '24 hours'
                ORDER BY ts DESC
                LIMIT 10
                """,
                asset_id
            )
            
            flows = await conn.fetch(
                """
                SELECT ts, from_tag, to_tag, amount, usd
                FROM onchain_flows
                WHERE asset_id = $1 AND ts > NOW() - INTERVAL '24 hours'
                ORDER BY ts DESC
                LIMIT 10
                """,
                asset_id
            )
            
            derivatives = await conn.fetch(
                """
                SELECT ts, funding_8h, oi, liq_1h
                FROM derivatives
                WHERE asset_id = $1 AND ts > NOW() - INTERVAL '24 hours'
                ORDER BY ts DESC
                LIMIT 10
                """,
                asset_id
            )
            
            drivers = []
            confidence_factors = []
            
            if flows:
                total_flow_usd = sum(f['usd'] for f in flows if f['usd'])
                if total_flow_usd > 1000000:  # $1M+ in flows
                    largest_flow = max(flows, key=lambda f: f['usd'] if f['usd'] else 0)
                    drivers.append({
                        "type": "onchain_transfer",
                        "desc": f"Large transfer of {largest_flow['amount']:,.0f} {symbol} to {largest_flow['to_tag']}",
                        "value": f"{largest_flow['amount']:,.0f}",
                        "unit": symbol,
                        "time": largest_flow['ts'].isoformat()
                    })
                    confidence_factors.append(50)  # High weight for on-chain activity
            
            if factors and factors[0]['volume_z']:
                volume_z = factors[0]['volume_z']
                if volume_z > 2.0:  # 2+ standard deviations above normal
                    drivers.append({
                        "type": "volume_spike",
                        "desc": f"Exchange volume {volume_z:.1f}x above normal (1h)",
                        "value": volume_z,
                        "unit": "x",
                        "time": factors[0]['ts'].isoformat()
                    })
                    confidence_factors.append(30)  # Medium weight for volume
            
            if factors and factors[0]['mom_1h']:
                mom_1h = factors[0]['mom_1h']
                if abs(mom_1h) > 5.0:  # Significant momentum
                    direction = "Buy-side" if mom_1h > 0 else "Sell-side"
                    drivers.append({
                        "type": "orderbook_imbalance",
                        "desc": f"{direction} pressure detected ({abs(mom_1h):.1f}% momentum)",
                        "value": abs(mom_1h),
                        "unit": "%",
                        "time": factors[0]['ts'].isoformat()
                    })
                    confidence_factors.append(20)  # Lower weight for momentum
            
            if derivatives and derivatives[0]['funding_8h']:
                funding = derivatives[0]['funding_8h']
                if abs(funding) > 0.1:  # 0.1% funding rate
                    drivers.append({
                        "type": "funding_rate",
                        "desc": f"Funding rate at {funding:.3f}% (8h) - {'long' if funding > 0 else 'short'} bias",
                        "value": funding,
                        "unit": "%",
                        "time": derivatives[0]['ts'].isoformat()
                    })
                    confidence_factors.append(15)  # Lower weight for funding
            
            if confidence_factors:
                confidence = min(sum(confidence_factors), 100)
            else:
                confidence = 0
            
            if not drivers:
                summary = f"No significant whale activity detected for {symbol} in the last 24 hours."
            else:
                driver_descriptions = []
                for d in drivers[:3]:  # Top 3 drivers
                    driver_descriptions.append(d['desc'])
                
                summary = " + ".join(driver_descriptions) + f" → Whale activity likely. Confidence: {confidence}%"
            
            response = {
                "symbol": symbol.upper(),
                "summary": summary,
                "confidence": confidence,
                "drivers": drivers,
                "source": ["signals", "factors", "onchain_flows", "derivatives"],
                "raw": {
                    "signals_count": len(signals),
                    "factors_count": len(factors),
                    "flows_count": len(flows),
                    "derivatives_count": len(derivatives),
                    "latest_signal": dict(signals[0]) if signals else None,
                    "latest_factor": dict(factors[0]) if factors else None
                }
            }
            
            try:
                r = await get_redis()
                await r.setex(cache_key, 30, json.dumps(response, default=str))
            except Exception as e:
                print(f"Redis cache error: {e}")
            
            return response
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        await pool.close()

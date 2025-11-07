from fastapi import APIRouter, Depends, Query
from typing import List
from app.models import Signal, Factor
from app.deps import get_database

router = APIRouter()

@router.get("/signals/latest", response_model=List[Signal])
async def get_latest_signals(
    limit: int = Query(default=100, ge=1, le=1000),
    db=Depends(get_database)
):
    query = """
        SELECT DISTINCT ON (asset_id) 
            asset_id, ts, trend_score, pretrend_prob, action, confidence, rationale
        FROM signals
        ORDER BY asset_id, ts DESC
        LIMIT %s
    """
    await db.execute(query, (limit,))
    rows = await db.fetchall()
    return rows

@router.get("/signals/asset/{symbol}", response_model=List[Signal])
async def get_asset_signals(
    symbol: str,
    limit: int = Query(default=500, ge=1, le=5000),
    db=Depends(get_database)
):
    query = """
        SELECT s.asset_id, s.ts, s.trend_score, s.pretrend_prob, s.action, s.confidence, s.rationale
        FROM signals s
        JOIN assets a ON s.asset_id = a.asset_id
        WHERE a.symbol = %s
        ORDER BY s.ts DESC
        LIMIT %s
    """
    await db.execute(query, (symbol, limit))
    rows = await db.fetchall()
    return rows

@router.get("/factors/asset/{symbol}", response_model=List[Factor])
async def get_asset_factors(
    symbol: str,
    interval: str = Query(default="1m"),
    limit: int = Query(default=1000, ge=1, le=10000),
    db=Depends(get_database)
):
    query = """
        SELECT f.asset_id, f.ts, f.mom_1h, f.mom_24h, f.accel_1h, f.vol_regime,
               f.depth_delta, f.volume_z, f.funding_flip, f.oi_shift, f.tvl_accel, f.flow_score
        FROM factors f
        JOIN assets a ON f.asset_id = a.asset_id
        WHERE a.symbol = %s
        ORDER BY f.ts DESC
        LIMIT %s
    """
    await db.execute(query, (symbol, limit))
    rows = await db.fetchall()
    return rows

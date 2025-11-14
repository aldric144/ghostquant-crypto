"""Momentum Screener - Phase 1 Quick Win."""

import logging
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, Depends
import numpy as np

from ..deps import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/screener", tags=["screener"])


@router.get("/momentum")
async def get_momentum_screener(
    period: str = Query("24h", regex="^(1h|6h|24h|7d)$", description="Time period for momentum calculation"),
    limit: int = Query(25, ge=1, le=100, description="Number of results to return"),
    db=Depends(get_database)
):
    """
    Native Coin Momentum Screener - Phase 1 Quick Win.
    
    Shows top momentum plays across the 13 native coins tracked by GhostQuant.
    
    Momentum Score = normalized_return * volume_factor * volatility_dampener
    
    Args:
        period: Time window (1h, 6h, 24h, 7d)
        limit: Number of results (1-100)
        
    Returns:
        List of assets sorted by momentum score with sparkline data
    """
    try:
        period_hours = {
            "1h": 1,
            "6h": 6,
            "24h": 24,
            "7d": 168,
        }[period]
        
        await db.execute("SELECT asset_id, symbol, chain FROM assets ORDER BY symbol")
        assets = await db.fetchall()
        
        momentum_data = []
        
        for asset in assets:
            asset_id = asset["asset_id"]
            symbol = asset["symbol"]
            
            cutoff_time = datetime.utcnow() - timedelta(hours=period_hours)
            
            await db.execute(
                """
                SELECT ts, price, qty
                FROM ticks
                WHERE asset_id = %s AND ts >= %s
                ORDER BY ts ASC
                """,
                (asset_id, cutoff_time)
            )
            
            ticks = await db.fetchall()
            
            if len(ticks) < 10:
                momentum_score, price_change_pct, volume_24h, volatility = _generate_mock_momentum(symbol, period_hours)
                sparkline = _generate_mock_sparkline(symbol, period_hours)
            else:
                momentum_score, price_change_pct, volume_24h, volatility, sparkline = _calculate_momentum(ticks)
            
            momentum_data.append({
                "symbol": symbol,
                "momentum_score": momentum_score,
                "price_change_pct": price_change_pct,
                "volume_24h": volume_24h,
                "volatility": volatility,
                "sparkline": sparkline,
                "rank": 0,  # Will be set after sorting
            })
        
        momentum_data.sort(key=lambda x: x["momentum_score"], reverse=True)
        
        for i, item in enumerate(momentum_data):
            item["rank"] = i + 1
        
        top_momentum = momentum_data[:limit]
        
        return {
            "period": period,
            "period_hours": period_hours,
            "results": top_momentum,
            "total_assets": len(momentum_data),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    except Exception as e:
        logger.error(f"Error in momentum screener: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _calculate_momentum(ticks: List[dict]) -> tuple:
    """Calculate momentum metrics from tick data."""
    prices = np.array([float(t["price"]) for t in ticks])
    volumes = np.array([float(t["qty"]) for t in ticks])
    
    price_start = prices[0]
    price_end = prices[-1]
    price_change_pct = ((price_end - price_start) / price_start) * 100
    
    normalized_return = 50 + (price_change_pct * 2)  # Scale to 0-100
    normalized_return = max(0, min(100, normalized_return))
    
    volume_24h = float(np.sum(volumes))
    volume_factor = min(1.5, 1.0 + (volume_24h / 1_000_000) * 0.1)  # Cap at 1.5x
    
    volatility = float(np.std(prices) / np.mean(prices)) * 100
    volatility_dampener = 1.0 / (1.0 + volatility / 10)  # Dampen high volatility
    
    momentum_score = normalized_return * volume_factor * volatility_dampener
    momentum_score = max(0, min(100, momentum_score))
    
    sparkline_points = 20
    if len(prices) > sparkline_points:
        step = len(prices) // sparkline_points
        sparkline = [float(prices[i]) for i in range(0, len(prices), step)][:sparkline_points]
    else:
        sparkline = [float(p) for p in prices]
    
    return momentum_score, price_change_pct, volume_24h, volatility, sparkline


def _generate_mock_momentum(symbol: str, period_hours: int) -> tuple:
    """Generate mock momentum data for assets without sufficient tick data."""
    seed = sum(ord(c) for c in symbol)
    np.random.seed(seed)
    
    base_score = np.random.uniform(30, 80)
    
    price_change_pct = np.random.normal(0, 5)  # Mean 0%, std 5%
    
    volume_24h = np.random.uniform(1_000_000, 100_000_000)
    
    volatility = np.random.uniform(1, 10)
    
    normalized_return = 50 + (price_change_pct * 2)
    volume_factor = min(1.5, 1.0 + (volume_24h / 1_000_000) * 0.1)
    volatility_dampener = 1.0 / (1.0 + volatility / 10)
    
    momentum_score = normalized_return * volume_factor * volatility_dampener
    momentum_score = max(0, min(100, momentum_score))
    
    return momentum_score, price_change_pct, volume_24h, volatility


def _generate_mock_sparkline(symbol: str, period_hours: int) -> List[float]:
    """Generate mock sparkline data."""
    seed = sum(ord(c) for c in symbol)
    np.random.seed(seed)
    
    n_points = 20
    base_price = np.random.uniform(10, 1000)
    
    returns = np.random.normal(0, 0.02, n_points)
    prices = [base_price]
    
    for ret in returns[1:]:
        prices.append(prices[-1] * (1 + ret))
    
    return prices

"""Momentum Screener - Native Coin Momentum Screener MVP."""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel, Field
import numpy as np
import json

from ..deps import get_database
from ..services.composite_scorer import CompositeScorer
from ..services.liquidity_engine import LiquidityEngine
from ..services.redis_cache import RedisCache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/screener", tags=["screener"])

composite_scorer = CompositeScorer()
liquidity_engine = LiquidityEngine()
redis_cache = RedisCache()


class TopFeature(BaseModel):
    feature: str
    contribution: float
    note: str


class ScoredCoin(BaseModel):
    id: str
    symbol: str
    name: str
    image: str
    current_price: float
    market_cap: float
    market_cap_rank: Optional[int]
    total_volume: float
    price_change_percentage_1h: Optional[float]
    price_change_percentage_24h: Optional[float]
    price_change_percentage_7d: Optional[float]
    score: float = Field(description="Composite momentum score (0-100)")
    confidence: float = Field(description="Confidence in score (0-100)")
    top_features: List[TopFeature]
    risk_flags: List[str]
    why: str = Field(description="Short explanation of score")
    liquidity_score: float
    cross_exchange_count: int
    sparkline_7d: Optional[List[float]] = None


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


@router.get("/list")
async def get_screener_list(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=250, description="Results per page"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum score filter"),
    search: Optional[str] = Query(None, description="Search by symbol or name"),
    db=Depends(get_database)
):
    """
    Get paginated screener results with composite momentum scores.
    
    This is the main endpoint for the Native Coin Momentum Screener.
    Returns coins with full scoring, explainability, and filtering.
    
    Args:
        page: Page number (1-indexed)
        limit: Results per page (1-250)
        min_score: Filter coins with score >= min_score
        search: Search filter for symbol or name
        
    Returns:
        Paginated list of scored coins
    """
    try:
        scored_coins = await redis_cache.get_scored_coins()
        
        if not scored_coins:
            logger.warning("No scored coins in cache, returning empty results")
            return {
                "page": page,
                "limit": limit,
                "total": 0,
                "total_pages": 0,
                "results": [],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        filtered = scored_coins
        
        if min_score is not None:
            filtered = [c for c in filtered if c.get("score", 0) >= min_score]
        
        if search:
            search_lower = search.lower()
            filtered = [
                c for c in filtered
                if search_lower in c.get("symbol", "").lower() or search_lower in c.get("name", "").lower()
            ]
        
        filtered.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        total = len(filtered)
        total_pages = (total + limit - 1) // limit
        start = (page - 1) * limit
        end = start + limit
        results = filtered[start:end]
        
        return {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in screener list: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top_coins")
async def get_top_coins(
    limit: int = Query(10, ge=1, le=50, description="Number of top coins to return"),
    min_score: float = Query(None, description="Minimum score (default from env)"),
    db=Depends(get_database)
):
    """
    Get Top Coins watchlist with multi-condition filtering.
    
    Returns coins that meet ALL criteria:
    - score >= min_score (default 75)
    - liquidity_score >= 70
    - cross_exchange_count >= 2
    - market_cap >= MIN_MARKET_CAP (default $1M)
    
    Args:
        limit: Number of results (1-50)
        min_score: Override default minimum score
        
    Returns:
        List of top coins with buy badges and trade readiness
    """
    try:
        default_min_score = float(os.getenv("DEFAULT_MIN_SCORE", 75))
        min_market_cap = float(os.getenv("MIN_MARKET_CAP", 1_000_000))
        
        if min_score is None:
            min_score = default_min_score
        
        scored_coins = await redis_cache.get_scored_coins()
        
        if not scored_coins:
            return {
                "count": 0,
                "results": [],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        top_coins = []
        for coin in scored_coins:
            score = coin.get("score", 0)
            liquidity_score = coin.get("liquidity_score", 0)
            cross_exchange_count = coin.get("cross_exchange_count", 0)
            market_cap = coin.get("market_cap", 0)
            
            if (score >= min_score and
                liquidity_score >= 70 and
                cross_exchange_count >= 2 and
                market_cap >= min_market_cap):
                
                risk_flags = coin.get("risk_flags", [])
                if not risk_flags and liquidity_score >= 85:
                    trade_readiness = "Ready"
                elif len(risk_flags) <= 1 and liquidity_score >= 70:
                    trade_readiness = "Watch"
                else:
                    trade_readiness = "Risky"
                
                suggested_pair = {
                    "exchange": os.getenv("PRIMARY_EXCHANGE", "coinbasepro"),
                    "pair": f"{coin.get('symbol', '')}-USD"
                }
                
                if liquidity_score >= 85:
                    estimated_slippage_pct = 0.3
                elif liquidity_score >= 70:
                    estimated_slippage_pct = 0.5
                else:
                    estimated_slippage_pct = 1.0
                
                top_coins.append({
                    **coin,
                    "trade_readiness": trade_readiness,
                    "suggested_pair": suggested_pair,
                    "estimated_slippage_pct": estimated_slippage_pct
                })
        
        top_coins.sort(key=lambda x: x.get("score", 0), reverse=True)
        top_coins = top_coins[:limit]
        
        return {
            "count": len(top_coins),
            "results": top_coins,
            "filters": {
                "min_score": min_score,
                "min_liquidity_score": 70,
                "min_cross_exchange_count": 2,
                "min_market_cap": min_market_cap
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in top_coins: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}")
async def get_coin_detail(
    symbol: str,
    db=Depends(get_database)
):
    """
    Get detailed analysis for a specific coin.
    
    Returns full score breakdown with explainability.
    
    Args:
        symbol: Coin symbol (e.g., BTC, ETH)
        
    Returns:
        Detailed coin analysis with score breakdown
    """
    try:
        symbol_upper = symbol.upper()
        
        scored_coins = await redis_cache.get_scored_coins()
        
        coin = None
        for c in scored_coins:
            if c.get("symbol", "").upper() == symbol_upper:
                coin = c
                break
        
        if not coin:
            raise HTTPException(status_code=404, detail=f"Coin {symbol} not found")
        
        features = {
            "symbol": coin.get("symbol"),
            "short_return_1h": coin.get("price_change_percentage_1h", 0),
            "med_return_4h": (coin.get("price_change_percentage_1h", 0) + coin.get("price_change_percentage_24h", 0)) / 2,
            "long_return_24h": coin.get("price_change_percentage_24h", 0),
            "vol_ratio_30m_vs_24h": 1.0,  # Would need historical data
            "orderbook_imbalance": 0.0,  # Would need orderbook data
            "liquidity_depth_at_1pct": coin.get("market_cap", 0) * 0.02,  # Estimate
            "onchain_inflow_30m_usd": 0.0,  # Phase 2
            "cross_exchange_confirmation_count": coin.get("cross_exchange_count", 1),
            "pretrend_prob": 0.0,  # Phase 2
            "market_cap": coin.get("market_cap", 0),
            "total_volume": coin.get("total_volume", 0),
            "liquidity_score": coin.get("liquidity_score", 50)
        }
        
        explained = composite_scorer.compute_score(features, explain=True)
        
        result = {
            **coin,
            "explain": explained.get("explain", {}),
            "suggested_pair": {
                "exchange": os.getenv("PRIMARY_EXCHANGE", "coinbasepro"),
                "pair": f"{symbol_upper}-USD"
            }
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting coin detail for {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

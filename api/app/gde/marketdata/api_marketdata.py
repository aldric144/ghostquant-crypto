"""
Market Data API Endpoints for GhostQuant

Enterprise-grade market data API with:
- Real-time data from CoinAPI (primary)
- Fallback to CoinGecko (secondary)
- Static fallback for demo/offline mode

All endpoints return JSON responses.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging

from .marketdata_engine import get_market_data_engine, MarketDataEngine

logger = logging.getLogger(__name__)

router = APIRouter()


def get_engine() -> MarketDataEngine:
    """Get market data engine instance."""
    return get_market_data_engine()


@router.get("/top-movers")
async def get_top_movers(
    limit: int = Query(default=50, ge=1, le=200, description="Number of coins per category")
):
    """
    Get top gainers and losers in the market.
    
    Returns:
        Dictionary with 'gainers' and 'losers' lists
    """
    try:
        engine = get_engine()
        result = await engine.get_top_movers(limit=limit)
        return {
            "success": True,
            "data": result,
            "message": "Top movers retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting top movers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/screener")
async def get_screener(
    sort_by: str = Query(default="market_cap", description="Sort field"),
    order: str = Query(default="desc", description="Sort order (asc/desc)"),
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=50, ge=1, le=250, description="Results per page"),
    min_market_cap: Optional[float] = Query(default=None, description="Minimum market cap"),
    min_volume: Optional[float] = Query(default=None, description="Minimum 24h volume")
):
    """
    Get token screener data with filtering and sorting.
    
    Returns:
        Paginated list of tokens with market data
    """
    try:
        engine = get_engine()
        result = await engine.get_token_screener(
            sort_by=sort_by,
            order=order,
            page=page,
            per_page=per_page,
            min_market_cap=min_market_cap,
            min_volume=min_volume
        )
        return {
            "success": True,
            "data": result,
            "message": "Screener data retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting screener data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assets")
async def get_assets(
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=100, ge=1, le=250, description="Results per page"),
    sort_by: str = Query(default="market_cap", description="Sort field")
):
    """
    Get list of all cryptocurrency assets.
    
    Returns:
        Paginated list of assets with market data
    """
    try:
        engine = get_engine()
        result = await engine.get_token_screener(
            sort_by=sort_by,
            order="desc",
            page=page,
            per_page=per_page
        )
        return {
            "success": True,
            "data": result.get("results", []),
            "page": result.get("page", page),
            "per_page": result.get("per_page", per_page),
            "total": result.get("total", 0),
            "message": "Assets retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting assets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tokens/{token_id}")
async def get_token_detail(token_id: str):
    """
    Get detailed information for a specific token.
    
    Args:
        token_id: Token identifier (e.g., "bitcoin", "BTC")
        
    Returns:
        Detailed token information including price, market cap, links, etc.
    """
    try:
        engine = get_engine()
        result = await engine.get_asset_detail(token_id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Token '{token_id}' not found")
        
        return {
            "success": True,
            "data": result,
            "message": "Token detail retrieved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting token detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tokens/{token_id}/ohlcv")
async def get_token_ohlcv(
    token_id: str,
    period: str = Query(default="1DAY", description="Time period (1MIN, 5MIN, 15MIN, 1HRS, 1DAY)"),
    limit: int = Query(default=100, ge=1, le=1000, description="Number of candles")
):
    """
    Get OHLCV (candlestick) data for a token.
    
    Args:
        token_id: Token identifier
        period: Time period
        limit: Number of candles
        
    Returns:
        List of OHLCV data points
    """
    try:
        engine = get_engine()
        result = await engine.get_ohlcv(token_id, period=period, limit=limit)
        
        return {
            "success": True,
            "data": result,
            "token_id": token_id,
            "period": period,
            "message": "OHLCV data retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting OHLCV data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tokens/{token_id}/orderbook")
async def get_token_orderbook(token_id: str):
    """
    Get orderbook data for a token.
    
    Args:
        token_id: Token identifier
        
    Returns:
        Orderbook with bids and asks
    """
    try:
        engine = get_engine()
        result = await engine.get_orderbook(token_id)
        
        return {
            "success": True,
            "data": result,
            "message": "Orderbook retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting orderbook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tokens/{token_id}/trades")
async def get_token_trades(
    token_id: str,
    limit: int = Query(default=50, ge=1, le=500, description="Number of trades")
):
    """
    Get recent trades for a token.
    
    Args:
        token_id: Token identifier
        limit: Number of trades
        
    Returns:
        List of recent trades
    """
    try:
        engine = get_engine()
        result = await engine.get_trades(token_id, limit=limit)
        
        return {
            "success": True,
            "data": result,
            "token_id": token_id,
            "message": "Trades retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting trades: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chains")
async def get_chains():
    """
    Get blockchain/chain statistics.
    
    Returns:
        List of chains with TVL and protocol counts
    """
    try:
        engine = get_engine()
        result = await engine.get_chain_stats()
        
        return {
            "success": True,
            "data": result,
            "message": "Chain stats retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting chain stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/global")
async def get_global_metrics():
    """
    Get global cryptocurrency market metrics.
    
    Returns:
        Global market statistics including total market cap, volume, dominance
    """
    try:
        engine = get_engine()
        result = await engine.get_global_metrics()
        
        return {
            "success": True,
            "data": result,
            "message": "Global metrics retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting global metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap")
async def get_heatmap(
    limit: int = Query(default=100, ge=1, le=250, description="Number of coins")
):
    """
    Get market heatmap data.
    
    Returns:
        List of coins with price changes for heatmap visualization
    """
    try:
        engine = get_engine()
        result = await engine.get_heatmap_data(limit=limit)
        
        return {
            "success": True,
            "data": result,
            "message": "Heatmap data retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting heatmap data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/overview")
async def get_market_overview():
    """
    Get comprehensive market overview.
    
    Returns:
        Market overview with top coins, trending, and global statistics
    """
    try:
        engine = get_engine()
        result = await engine.get_market_overview()
        
        return {
            "success": True,
            "data": result,
            "message": "Market overview retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting market overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/momentum")
async def get_momentum(
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=50, ge=1, le=250, description="Results per page"),
    sort: str = Query(default="change_24h", description="Sort field"),
    whale_only: bool = Query(default=False, description="Filter for whale activity"),
    min_marketcap: Optional[float] = Query(default=None, description="Minimum market cap")
):
    """
    Get momentum data for tokens (gainers/losers with volume analysis).
    
    Returns:
        Paginated list of tokens with momentum indicators
    """
    try:
        engine = get_engine()
        
        # Get top movers data
        movers = await engine.get_top_movers(limit=per_page * 2)
        
        # Combine gainers and losers
        all_coins = movers.get("gainers", []) + movers.get("losers", [])
        
        # Apply filters
        if min_marketcap:
            all_coins = [c for c in all_coins if (c.get("market_cap") or 0) >= min_marketcap]
        
        # Sort
        if sort == "change_24h":
            all_coins.sort(key=lambda x: abs(x.get("change_24h", 0)), reverse=True)
        elif sort == "volume":
            all_coins.sort(key=lambda x: x.get("volume_24h", 0), reverse=True)
        elif sort == "market_cap":
            all_coins.sort(key=lambda x: x.get("market_cap", 0), reverse=True)
        
        # Paginate
        start = (page - 1) * per_page
        end = start + per_page
        paginated = all_coins[start:end]
        
        return {
            "success": True,
            "results": paginated,
            "page": page,
            "per_page": per_page,
            "total_pages": (len(all_coins) + per_page - 1) // per_page,
            "total": len(all_coins),
            "message": "Momentum data retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting momentum data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_provider_status():
    """
    Get status of market data providers.
    
    Returns:
        Health status of CoinAPI and CoinGecko providers
    """
    try:
        engine = get_engine()
        result = engine.get_provider_status()
        
        return {
            "success": True,
            "data": result,
            "message": "Provider status retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting provider status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Legacy endpoint aliases for backward compatibility
@router.get("/dashboard/top-movers")
async def legacy_top_movers(limit: int = Query(default=50)):
    """Legacy endpoint - redirects to /market/top-movers"""
    return await get_top_movers(limit=limit)


@router.get("/dashboard/assets")
async def legacy_assets(page: int = 1, per_page: int = 100):
    """Legacy endpoint - redirects to /market/assets"""
    return await get_assets(page=page, per_page=per_page)

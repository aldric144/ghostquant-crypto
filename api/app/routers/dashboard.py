"""
Dashboard API endpoints for top movers and aggregated data.
"""
from fastapi import APIRouter, Query
from typing import List, Dict, Any
import logging

from ..services.redis_cache import RedisCache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

redis_cache = RedisCache()


@router.get("/top-movers")
async def get_top_movers(
    limit: int = Query(50, ge=1, le=500, description="Number of coins to return"),
    sort: str = Query("momentum", description="Sort by: momentum, whale_confidence, pretrend, market_cap")
) -> List[Dict[str, Any]]:
    """
    Get top movers with momentum scores, whale confidence, and PreTrend probability.
    
    This endpoint provides a single, cached API that returns:
    - Assets with momentum scores
    - Whale confidence from Ecoscan
    - PreTrend probability from AlphaBrain
    - Buy/Sell/Hold signal recommendations
    
    Cached for 30s to reduce load.
    """
    try:
        cache_key = f"dashboard:top-movers:{limit}:{sort}"
        cached_data = await redis_cache.get(cache_key)
        
        if cached_data:
            logger.info(f"Returning cached top-movers (limit={limit}, sort={sort})")
            return cached_data
        
        scored_coins = await redis_cache.get_scored_coins()
        
        if not scored_coins:
            logger.warning("No scored coins available")
            return []
        
        sort_key_map = {
            "momentum": "momentum_score",
            "whale_confidence": "whale_confidence",
            "pretrend": "pretrend_prob",
            "market_cap": "market_cap"
        }
        
        sort_key = sort_key_map.get(sort, "momentum_score")
        
        sorted_coins = sorted(
            scored_coins,
            key=lambda x: x.get(sort_key, 0) if x.get(sort_key) is not None else 0,
            reverse=True
        )
        
        top_coins = sorted_coins[:limit]
        
        result = []
        for coin in top_coins:
            result.append({
                "coin_id": coin.get("coin_id"),
                "symbol": coin.get("symbol", "").upper(),
                "name": coin.get("name"),
                "image": coin.get("image"),
                "price": coin.get("current_price"),
                "market_cap": coin.get("market_cap"),
                "market_cap_rank": coin.get("market_cap_rank"),
                "total_volume": coin.get("total_volume"),
                "momentum_score": coin.get("momentum_score"),
                "trend_score": coin.get("momentum_score"),  # Alias for compatibility
                "pretrend": coin.get("pretrend_prob"),
                "whale_confidence": coin.get("whale_confidence"),
                "signal": coin.get("action", "HOLD"),
                "price_change_percentage_1h": coin.get("price_change_percentage_1h"),
                "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
                "price_change_percentage_7d": coin.get("price_change_percentage_7d"),
                "sparkline_7d": coin.get("sparkline_7d"),
                "last_updated": coin.get("last_updated")
            })
        
        await redis_cache.set(cache_key, result, ttl=30)
        
        logger.info(f"Returning {len(result)} top-movers (limit={limit}, sort={sort})")
        return result
    
    except Exception as e:
        logger.error(f"Error getting top-movers: {e}", exc_info=True)
        return []

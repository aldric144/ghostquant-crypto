"""
Whale events and leaderboard API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any

from app.utils.feature_flags import is_feature_enabled
from app.utils.cache_helper import get_cached, set_cached
from app.services.whale_provider import get_whale_provider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/whales", tags=["whales"])


@router.get("/recent")
async def get_recent_whale_events(
    limit: int = Query(50, ge=1, le=200, description="Number of events to return")
) -> Dict[str, Any]:
    """
    Get recent whale transaction events.
    
    Returns whale transactions above the configured threshold with
    transaction details, amounts, and explorer links.
    
    Args:
        limit: Maximum number of events to return (1-200)
        
    Returns:
        Dictionary with events list and metadata
    """
    if not is_feature_enabled('whales'):
        raise HTTPException(status_code=501, detail="Whale intelligence feature is not enabled")
    
    cache_key = f"whales:recent:{limit}"
    cached = get_cached(cache_key)
    if cached:
        logger.info(f"Returning cached whale events (limit={limit})")
        return cached
    
    try:
        provider = get_whale_provider()
        events = provider.get_recent_events(limit=limit)
        
        result = {
            'events': [event.to_dict() for event in events],
            'count': len(events),
            'limit': limit
        }
        
        set_cached(cache_key, result, ttl=60)
        
        logger.info(f"Fetched {len(events)} whale events")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching whale events: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch whale events: {str(e)}")


@router.get("/leaderboard")
async def get_whale_leaderboard(
    since: str = Query("24h", description="Time period (e.g., 24h, 7d, 30d)")
) -> Dict[str, Any]:
    """
    Get whale leaderboard ranked by impact score.
    
    Impact score formula:
    - normalized(usd_volume) * recency_decay * address_recurrence_weight
    
    Args:
        since: Time period to analyze (24h, 7d, 30d)
        
    Returns:
        Dictionary with leaderboard entries and metadata
    """
    if not is_feature_enabled('whales'):
        raise HTTPException(status_code=501, detail="Whale intelligence feature is not enabled")
    
    since_hours = _parse_time_period(since)
    
    cache_key = f"whales:leaderboard:{since}"
    cached = get_cached(cache_key)
    if cached:
        logger.info(f"Returning cached whale leaderboard (since={since})")
        return cached
    
    try:
        provider = get_whale_provider()
        entries = provider.get_leaderboard(since_hours=since_hours)
        
        result = {
            'leaderboard': [entry.to_dict() for entry in entries],
            'count': len(entries),
            'since': since,
            'since_hours': since_hours
        }
        
        set_cached(cache_key, result, ttl=60)
        
        logger.info(f"Fetched {len(entries)} whale leaderboard entries")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching whale leaderboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch whale leaderboard: {str(e)}")


def _parse_time_period(period: str) -> int:
    """
    Parse time period string to hours.
    
    Args:
        period: Time period string (e.g., "24h", "7d", "30d")
        
    Returns:
        Number of hours
    """
    period = period.lower().strip()
    
    if period.endswith('h'):
        return int(period[:-1])
    elif period.endswith('d'):
        return int(period[:-1]) * 24
    elif period.endswith('w'):
        return int(period[:-1]) * 24 * 7
    else:
        return 24

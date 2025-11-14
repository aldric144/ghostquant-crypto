"""
Sector heatmap API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any

from app.utils.feature_flags import is_feature_enabled
from app.utils.cache_helper import get_cached, set_cached
from app.services.sector_mapper import get_sector_mapper
from app.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/heatmap", tags=["heatmap"])


@router.get("/sector")
async def get_sector_heatmap(
    period: str = Query("24h", description="Time period (24h, 7d, 30d)")
) -> Dict[str, Any]:
    """
    Get sector momentum heatmap.
    
    Aggregates momentum scores by sector and returns color-coded heatmap data.
    Sectors include: L1, L2, DeFi, Oracles, Stablecoins, CeFi, NFT, Tokens.
    
    Args:
        period: Time period for momentum calculation
        
    Returns:
        Dictionary with sector momentum data and metadata
    """
    if not is_feature_enabled('heatmap'):
        raise HTTPException(status_code=501, detail="Sector heatmap feature is not enabled")
    
    cache_key = f"heatmap:sector:{period}"
    cached = get_cached(cache_key)
    if cached:
        logger.info(f"Returning cached sector heatmap (period={period})")
        return cached
    
    try:
        mapper = get_sector_mapper()
        
        use_mock = True
        
        if use_mock:
            sectors = mapper.get_mock_sector_momentum()
        else:
            async with get_db() as cur:
                sectors = mapper.get_mock_sector_momentum()
        
        result = {
            'sectors': sectors,
            'period': period,
            'count': len(sectors),
            'timestamp': None  # TODO: Add timestamp
        }
        
        set_cached(cache_key, result, ttl=60)
        
        logger.info(f"Fetched sector heatmap with {len(sectors)} sectors")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching sector heatmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sector heatmap: {str(e)}")


@router.get("/sectors")
async def get_all_sectors() -> Dict[str, Any]:
    """
    Get list of all available sectors.
    
    Returns:
        Dictionary with sector list and mapping information
    """
    if not is_feature_enabled('heatmap'):
        raise HTTPException(status_code=501, detail="Sector heatmap feature is not enabled")
    
    try:
        mapper = get_sector_mapper()
        sectors = mapper.get_all_sectors()
        
        return {
            'sectors': sectors,
            'count': len(sectors),
            'mapping_source': mapper.mapping_source
        }
        
    except Exception as e:
        logger.error(f"Error fetching sectors: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sectors: {str(e)}")


@router.get("/sector/{sector_name}/coins")
async def get_sector_coins(
    sector_name: str
) -> Dict[str, Any]:
    """
    Get all coins in a specific sector.
    
    Args:
        sector_name: Name of the sector (e.g., L1, DeFi, Oracles)
        
    Returns:
        Dictionary with coin list for the sector
    """
    if not is_feature_enabled('heatmap'):
        raise HTTPException(status_code=501, detail="Sector heatmap feature is not enabled")
    
    try:
        mapper = get_sector_mapper()
        coins = mapper.get_coins_by_sector(sector_name)
        
        return {
            'sector': sector_name,
            'coins': coins,
            'count': len(coins)
        }
        
    except Exception as e:
        logger.error(f"Error fetching coins for sector {sector_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sector coins: {str(e)}")

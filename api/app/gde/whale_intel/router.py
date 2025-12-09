"""
Whale Intelligence Database API Router

API endpoints for whale intelligence data.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from .models import WhaleAddress, WhaleMovement, WhaleProfile, TagRequest
from .services import whale_intel_service

router = APIRouter(prefix="/whales", tags=["Whale Intelligence"])


@router.get("/top", response_model=List[WhaleAddress])
async def get_top_whales(
    limit: int = Query(default=50, ge=1, le=100, description="Number of whales to return")
):
    """
    Get top whales by influence score.
    
    Returns the most influential whale addresses based on volume,
    movement count, and network connections.
    """
    return whale_intel_service.get_top_whales(limit=limit)


@router.get("/search", response_model=List[WhaleAddress])
async def search_whales(
    q: str = Query(..., min_length=1, description="Search query (address or tag)")
):
    """
    Search whales by address or tag.
    
    Returns whale addresses matching the search query.
    """
    results = whale_intel_service.search_whales(q)
    return results


@router.get("/movements", response_model=List[WhaleMovement])
async def get_all_movements(
    limit: int = Query(default=100, ge=1, le=500, description="Number of movements to return")
):
    """
    Get recent whale movements across all whales.
    
    Returns the most recent whale movements globally.
    """
    return whale_intel_service.get_all_recent_movements(limit=limit)


@router.get("/{address}", response_model=WhaleProfile)
async def get_whale_profile(address: str):
    """
    Get detailed whale profile.
    
    Returns comprehensive information about a whale including
    recent movements, counterparties, and behavior analysis.
    """
    profile = whale_intel_service.get_whale_profile(address)
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Whale address {address} not found"
        )
    
    return profile


@router.get("/{address}/movements", response_model=List[WhaleMovement])
async def get_whale_movements(
    address: str,
    limit: int = Query(default=50, ge=1, le=200, description="Number of movements to return")
):
    """
    Get recent movements for a specific whale.
    
    Returns the most recent movements involving the specified whale address.
    """
    movements = whale_intel_service.get_recent_movements(address, limit=limit)
    return movements


@router.post("/tag", response_model=WhaleAddress)
async def tag_whale(request: TagRequest):
    """
    Add a tag to a whale address.
    
    Tags help categorize and identify whales (e.g., "exchange", "defi", "nft").
    """
    whale = whale_intel_service.add_tag(request.address, request.tag)
    
    if not whale:
        # Create the whale if it doesn't exist
        whale = whale_intel_service.add_or_update_whale(request.address)
        whale = whale_intel_service.add_tag(request.address, request.tag)
    
    return whale


@router.get("/stats/summary")
async def get_whale_stats():
    """
    Get summary statistics for the whale intelligence database.
    """
    top_whales = whale_intel_service.get_top_whales(limit=10)
    all_movements = whale_intel_service.get_all_recent_movements(limit=1000)
    
    total_volume = sum(w.total_volume_usd for w in top_whales)
    
    return {
        "total_whales_tracked": len(whale_intel_service._whales),
        "total_movements_recorded": len(whale_intel_service._movements),
        "top_10_volume_usd": total_volume,
        "recent_movement_count": len(all_movements)
    }

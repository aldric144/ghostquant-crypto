"""
Cached wrapper for screener endpoints.
Adds Redis caching with 30s TTL for expensive screener queries.
"""
from fastapi import APIRouter, Query, Depends
from typing import Optional
from ..cache import cache_response
from ..deps import get_database
from . import screener

router = APIRouter(prefix="/screener", tags=["screener"])

@router.get("/list")
@cache_response('screener:list', ttl=30)
async def get_screener_list_cached(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=250, description="Results per page"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum score filter"),
    search: Optional[str] = Query(None, description="Search by symbol or name"),
    db=Depends(get_database)
):
    """Cached version of screener list endpoint (30s TTL)."""
    return await screener.get_screener_list(page, limit, min_score, search, db)

@router.get("/top_coins")
@cache_response('screener:top_coins', ttl=30)
async def get_top_coins_cached(
    limit: int = Query(10, ge=1, le=50, description="Number of top coins to return"),
    min_score: float = Query(None, description="Minimum score (default from env)"),
    db=Depends(get_database)
):
    """Cached version of top coins endpoint (30s TTL)."""
    return await screener.get_top_coins(limit, min_score, db)

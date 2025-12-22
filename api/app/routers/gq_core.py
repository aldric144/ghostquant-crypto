"""
GQ-Core Router

Unified GhostQuant Hybrid Intelligence Engine API endpoints.
All endpoints return data with source ("real" or "synthetic") and timestamp.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.gde.gq_core.service import get_gq_core_service

router = APIRouter(prefix="/gq-core", tags=["GQ-Core"])


@router.get("/overview")
async def get_overview() -> Dict[str, Any]:
    """
    Get unified overview data combining risk, whales, rings, anomalies, and system status.
    
    Returns:
        Overview data with source and timestamp
    """
    service = get_gq_core_service()
    return await service.get_overview()


@router.get("/risk")
async def get_risk() -> Dict[str, Any]:
    """
    Get risk assessment data.
    
    Returns:
        Risk data with overall score, threat level, distribution, and top risks
    """
    service = get_gq_core_service()
    return await service.get_risk()


@router.get("/whales")
async def get_whales() -> Dict[str, Any]:
    """
    Get whale intelligence data.
    
    Returns:
        Whale data with top whales and recent movements
    """
    service = get_gq_core_service()
    return await service.get_whales()


@router.get("/trends")
async def get_trends() -> Dict[str, Any]:
    """
    Get trend analytics data including weekly heatmap.
    
    Returns:
        Trend data with hourly activity, heatmap, and events
    """
    service = get_gq_core_service()
    return await service.get_trends()


@router.get("/map")
async def get_map() -> Dict[str, Any]:
    """
    Get threat map data.
    
    Returns:
        Map data with hot zones and connections
    """
    service = get_gq_core_service()
    return await service.get_map()


@router.get("/anomalies")
async def get_anomalies() -> Dict[str, Any]:
    """
    Get anomaly detection data.
    
    Returns:
        Anomaly data with outliers and patterns
    """
    service = get_gq_core_service()
    return await service.get_anomalies()


@router.get("/entities")
async def get_entities() -> Dict[str, Any]:
    """
    Get entity intelligence data.
    
    Returns:
        Entity data with entities and categories
    """
    service = get_gq_core_service()
    return await service.get_entities()


@router.get("/narratives")
async def get_narratives() -> Dict[str, Any]:
    """
    Get narrative intelligence data.
    
    Returns:
        Narrative data with summary, top threats, and topics
    """
    service = get_gq_core_service()
    return await service.get_narratives()


@router.get("/rings")
async def get_rings() -> Dict[str, Any]:
    """
    Get ring detection data.
    
    Returns:
        Ring data with detected manipulation rings and severity distribution
    """
    service = get_gq_core_service()
    return await service.get_rings()


@router.get("/system-status")
async def get_system_status() -> Dict[str, Any]:
    """
    Get system status data.
    
    Returns:
        System status with WebSocket, worker, Redis, and engine statuses
    """
    service = get_gq_core_service()
    return await service.get_system_status()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for GQ-Core.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "gq-core",
        "version": "1.0.0"
    }

"""
Constellation Fusion Pipeline - REST API Router

Exposes endpoints for the Global Threat Constellation fusion system.
"""

from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from .fusion_service import constellation_fusion_service
from .fusion_registry import fusion_registry, emit_event
from .fusion_models import NodeCategory, RelationType, RiskLevel


# Pydantic models for API requests/responses
class RegisterEventRequest(BaseModel):
    """Request model for registering an event."""
    event_type: str = Field(..., description="Type of event (hydra_detection, whale_movement, ecoscan_transfer, entity_lookup)")
    payload: Dict[str, Any] = Field(..., description="Event payload data")
    source_engine: str = Field(default="api", description="Source engine name")
    priority: int = Field(default=5, ge=1, le=10, description="Event priority (1-10)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "hydra_detection",
                "payload": {
                    "origin": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                    "participants": ["0x1234567890abcdef1234567890abcdef12345678"],
                    "confidence": 0.92,
                    "threat_level": "high"
                },
                "source_engine": "hydra",
                "priority": 8
            }
        }


class EventResponse(BaseModel):
    """Response model for event registration."""
    success: bool
    message: str
    timestamp: str


class GraphResponse(BaseModel):
    """Response model for constellation graph."""
    success: bool
    map: Dict[str, Any]
    timestamp: str


class MetricsResponse(BaseModel):
    """Response model for constellation metrics."""
    success: bool
    summary: Dict[str, Any]
    timestamp: str


class RegistryStatsResponse(BaseModel):
    """Response model for registry statistics."""
    success: bool
    stats: Dict[str, Any]
    timestamp: str


# Create router
router = APIRouter(
    prefix="/gde/constellation",
    tags=["Constellation Fusion"],
    responses={404: {"description": "Not found"}},
)


@router.get("/graph", response_model=GraphResponse)
async def get_constellation_graph():
    """
    Get the full constellation graph with nodes, edges, and clusters.
    
    Returns the complete 3D visualization data for the Global Threat Constellation.
    """
    try:
        result = constellation_fusion_service.serialize_constellation()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics", response_model=MetricsResponse)
async def get_constellation_metrics():
    """
    Get constellation metrics and summary statistics.
    
    Returns counts, risk scores, and high-risk entity lists.
    """
    try:
        result = constellation_fusion_service.get_metrics()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register_event", response_model=EventResponse)
async def register_event(request: RegisterEventRequest):
    """
    Register a new event into the Constellation fusion system.
    
    This endpoint allows any intelligence engine to push events into the
    Constellation for processing and visualization.
    
    Supported event types:
    - hydra_detection: Coordinated network detection from Hydra engine
    - whale_movement: Whale wallet activity from Whale Intelligence
    - ecoscan_transfer: Transfer events from EcoScan
    - entity_lookup: Entity investigation from Entity Explorer
    """
    try:
        success = emit_event(
            event_type=request.event_type,
            payload=request.payload,
            source_engine=request.source_engine,
            priority=request.priority,
        )
        
        if success:
            return EventResponse(
                success=True,
                message=f"Event '{request.event_type}' registered successfully",
                timestamp=datetime.utcnow().isoformat(),
            )
        else:
            return EventResponse(
                success=False,
                message=f"Failed to process event '{request.event_type}'",
                timestamp=datetime.utcnow().isoformat(),
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/registry/stats", response_model=RegistryStatsResponse)
async def get_registry_stats():
    """
    Get statistics about the fusion registry.
    
    Returns information about registered engines and event processing.
    """
    try:
        stats = fusion_registry.get_stats()
        return RegistryStatsResponse(
            success=True,
            stats=stats,
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/registry/engines")
async def get_registered_engines():
    """
    Get list of all registered intelligence engines.
    """
    try:
        engines = fusion_registry.get_registered_engines()
        return {
            "success": True,
            "engines": engines,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events/log")
async def get_event_log(
    limit: int = Query(default=100, ge=1, le=1000, description="Number of events to return"),
    event_type: Optional[str] = Query(default=None, description="Filter by event type"),
):
    """
    Get recent events from the fusion log.
    """
    try:
        events = fusion_registry.get_event_log(limit=limit, event_type=event_type)
        return {
            "success": True,
            "events": events,
            "count": len(events),
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Health check endpoint for the Constellation Fusion system.
    """
    metrics = constellation_fusion_service.get_metrics()
    stats = fusion_registry.get_stats()
    
    return {
        "status": "healthy",
        "engine": "Constellation Fusion Pipeline",
        "version": "1.0.0",
        "total_nodes": metrics.get("summary", {}).get("total_nodes", 0),
        "total_edges": metrics.get("summary", {}).get("total_edges", 0),
        "registered_engines": stats.get("registered_engines", 0),
        "events_processed": stats.get("total_events_processed", 0),
        "timestamp": datetime.utcnow().isoformat(),
    }


# Legacy compatibility endpoints (for existing frontend)
@router.get("/constellation/map")
async def get_constellation_map_legacy():
    """
    Legacy endpoint for constellation map (for existing frontend compatibility).
    """
    return await get_constellation_graph()


@router.get("/constellation/summary")
async def get_constellation_summary_legacy():
    """
    Legacy endpoint for constellation summary (for existing frontend compatibility).
    """
    return await get_constellation_metrics()


@router.get("/constellation/nodes")
async def get_constellation_nodes():
    """
    Get only the nodes from the constellation.
    """
    try:
        result = constellation_fusion_service.serialize_constellation()
        nodes = result.get("map", {}).get("nodes", [])
        return {
            "success": True,
            "nodes": nodes,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/constellation/edges")
async def get_constellation_edges():
    """
    Get only the edges from the constellation.
    """
    try:
        result = constellation_fusion_service.serialize_constellation()
        edges = result.get("map", {}).get("edges", [])
        return {
            "success": True,
            "edges": edges,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/constellation/health")
async def constellation_health_legacy():
    """
    Legacy health check endpoint.
    """
    return await health_check()


@router.post("/constellation/ingest")
async def ingest_intelligence(intelligence: Dict[str, Any]):
    """
    Legacy ingest endpoint for backward compatibility.
    """
    # Convert legacy format to new event format
    event_type = intelligence.get("type", "unknown")
    
    # Map legacy types to new event types
    type_mapping = {
        "hydra": "hydra_detection",
        "whale": "whale_movement",
        "transfer": "ecoscan_transfer",
        "entity": "entity_lookup",
    }
    
    mapped_type = type_mapping.get(event_type, event_type)
    
    success = emit_event(
        event_type=mapped_type,
        payload=intelligence,
        source_engine="legacy_ingest",
    )
    
    return {
        "success": success,
        "timestamp": datetime.utcnow().isoformat(),
    }

"""
Global Threat Constellation Map™ - FastAPI Router
6 endpoints for 3D intelligence visualization
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from .constellation_engine import GlobalConstellationEngine
from .constellation_schema import ConstellationMap, ConstellationSummary

logger = logging.getLogger(__name__)

engine = GlobalConstellationEngine(retention_hours=72)

router = APIRouter(prefix="/constellation", tags=["Constellation"])


class IngestRequest(BaseModel):
    """Request model for intelligence ingestion"""
    intelligence: Dict[str, Any]


class IngestResponse(BaseModel):
    """Response model for intelligence ingestion"""
    success: bool
    error: Optional[str] = None
    timestamp: str


class MapResponse(BaseModel):
    """Response model for constellation map"""
    success: bool
    map: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class SummaryResponse(BaseModel):
    """Response model for constellation summary"""
    success: bool
    summary: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class NodesResponse(BaseModel):
    """Response model for nodes only"""
    success: bool
    nodes: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    timestamp: str


class EdgesResponse(BaseModel):
    """Response model for edges only"""
    success: bool
    edges: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    version: str
    retention_hours: int
    total_intelligence: int
    latest_map_nodes: int
    latest_map_edges: int
    timestamp: str


@router.post("/constellation/ingest")
async def ingest_intelligence(request: IngestRequest) -> IngestResponse:
    """
    Ingest multi-domain intelligence
    
    POST /constellation/ingest
    
    Request body:
    {
        "intelligence": {
            "source": "fusion|hydra|actor|correlation|radar|dna",
            "entity": "0x123...",
            "risk_score": 0.75,
            ...
        }
    }
    
    Returns:
    - success: bool
    - timestamp: ingestion timestamp
    """
    try:
        logger.info("[ConstellationAPI] Ingesting intelligence")
        
        success = engine.ingest_global_intelligence(request.intelligence)
        
        return IngestResponse(
            success=success,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error ingesting intelligence: {e}")
        return IngestResponse(
            success=False,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/constellation/map")
async def get_constellation_map() -> MapResponse:
    """
    Get full constellation map
    
    GET /constellation/map
    
    Returns:
    - success: bool
    - map: ConstellationMap with nodes, edges, global_risk_score
    - timestamp: generation timestamp
    """
    try:
        logger.info("[ConstellationAPI] Generating constellation map")
        
        constellation_map = engine.generate_constellation_map()
        
        return MapResponse(
            success=True,
            map=constellation_map.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error generating map: {e}")
        return MapResponse(
            success=False,
            map=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/constellation/summary")
async def get_constellation_summary() -> SummaryResponse:
    """
    Get constellation summary
    
    GET /constellation/summary
    
    Returns:
    - success: bool
    - summary: ConstellationSummary with statistics and notes
    - timestamp: generation timestamp
    """
    try:
        logger.info("[ConstellationAPI] Generating constellation summary")
        
        summary = engine.generate_summary()
        
        return SummaryResponse(
            success=True,
            summary=summary.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error generating summary: {e}")
        return SummaryResponse(
            success=False,
            summary=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/constellation/nodes")
async def get_constellation_nodes() -> NodesResponse:
    """
    Get constellation nodes only
    
    GET /constellation/nodes
    
    Returns:
    - success: bool
    - nodes: List of ConstellationNode objects
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[ConstellationAPI] Retrieving constellation nodes")
        
        nodes = engine.build_nodes()
        
        return NodesResponse(
            success=True,
            nodes=[node.to_dict() for node in nodes],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error retrieving nodes: {e}")
        return NodesResponse(
            success=False,
            nodes=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/constellation/edges")
async def get_constellation_edges() -> EdgesResponse:
    """
    Get constellation edges only
    
    GET /constellation/edges
    
    Returns:
    - success: bool
    - edges: List of ConstellationEdge objects
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[ConstellationAPI] Retrieving constellation edges")
        
        edges = engine.build_edges()
        
        return EdgesResponse(
            success=True,
            edges=[edge.to_dict() for edge in edges],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error retrieving edges: {e}")
        return EdgesResponse(
            success=False,
            edges=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/constellation/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /constellation/health
    
    Returns:
    - status: Engine status
    - engine: Engine name
    - version: Engine version
    - retention_hours: Data retention window
    - total_intelligence: Total intelligence records
    - latest_map_nodes: Nodes in latest map
    - latest_map_edges: Edges in latest map
    - timestamp: Health check timestamp
    """
    try:
        health = engine.get_health()
        
        return HealthResponse(
            status=health.get('status', 'operational'),
            engine=health.get('engine', 'Global Threat Constellation Map™'),
            version=health.get('version', '1.0.0'),
            retention_hours=health.get('retention_hours', 72),
            total_intelligence=health.get('total_intelligence', 0),
            latest_map_nodes=health.get('latest_map_nodes', 0),
            latest_map_edges=health.get('latest_map_edges', 0),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error in health check: {e}")
        return HealthResponse(
            status="error",
            engine="Global Threat Constellation Map™",
            version="1.0.0",
            retention_hours=72,
            total_intelligence=0,
            latest_map_nodes=0,
            latest_map_edges=0,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/constellation/info")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /constellation/info
    
    Returns:
    - API description
    - Available endpoints
    - Node types
    - Edge types
    - Features
    """
    try:
        return {
            "engine": "Global Threat Constellation Map™",
            "description": "3D visual intelligence constellation mapping multi-domain threat data",
            "version": "1.0.0",
            "retention_hours": 72,
            "endpoints": [
                {
                    "path": "/constellation/ingest",
                    "method": "POST",
                    "description": "Ingest multi-domain intelligence"
                },
                {
                    "path": "/constellation/map",
                    "method": "GET",
                    "description": "Get full constellation map with nodes and edges"
                },
                {
                    "path": "/constellation/summary",
                    "method": "GET",
                    "description": "Get constellation summary with statistics"
                },
                {
                    "path": "/constellation/nodes",
                    "method": "GET",
                    "description": "Get constellation nodes only"
                },
                {
                    "path": "/constellation/edges",
                    "method": "GET",
                    "description": "Get constellation edges only"
                },
                {
                    "path": "/constellation/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/constellation/info",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "intelligence_sources": [
                "Fusion Engine",
                "Hydra Engine",
                "Actor Profiler",
                "Correlation Engine",
                "Radar Engine",
                "Behavioral DNA"
            ],
            "node_types": [
                "entity - Individual addresses/wallets",
                "token - Token symbols",
                "chain - Blockchain networks",
                "cluster - Coordinated groups",
                "hydra_head - Multi-head network leaders"
            ],
            "edge_types": [
                "correlation - Statistical correlation",
                "hydra_link - Hydra relay connections",
                "cluster_connection - Cluster membership",
                "manipulation_flow - Manipulation patterns"
            ],
            "visualization": {
                "coordinate_system": "3D Cartesian (x, y, z) in range [-100, 100]",
                "node_colors": "Risk-based gradient (red=high, yellow=medium, green=low)",
                "node_sizes": "Type and risk-based scaling",
                "edge_colors": "Strength-based gradient (red=strong, blue=weak)"
            },
            "risk_scoring": {
                "global_risk": "Weighted fusion: Hydra 30%, Fusion 25%, Radar 20%, Correlation 15%, Actor 10%",
                "node_risk": "Source-specific risk scores (0-1)",
                "edge_strength": "Connection strength (0-1)"
            },
            "features": {
                "pure_python": "Zero external dependencies",
                "crash_proof": "100% error handling",
                "deterministic": "Consistent 3D coordinates from node IDs",
                "retention": "72h automatic data purging",
                "real_time": "Optimized for real-time visualization",
                "multi_source": "Integrates 6+ intelligence engines",
                "3d_mapping": "Deterministic 3D coordinate generation",
                "risk_visualization": "Color-coded risk levels"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[ConstellationAPI] Error getting API info: {e}")
        return {
            "engine": "Global Threat Constellation Map™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

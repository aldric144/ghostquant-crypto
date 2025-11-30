"""
Operation Hydra™ - FastAPI Router
5 endpoints for multi-head coordinated network detection
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from .hydra_engine import OperationHydraEngine
from .hydra_schema import HydraCluster, HydraReport

logger = logging.getLogger(__name__)

engine = OperationHydraEngine(window_hours=48)

router = APIRouter(prefix="/hydra", tags=["OperationHydra"])


class IngestRequest(BaseModel):
    """Request model for event ingestion"""
    events: List[Dict[str, Any]]


class IngestResponse(BaseModel):
    """Response model for event ingestion"""
    success: bool
    count: int
    error: Optional[str] = None
    timestamp: str


class DetectResponse(BaseModel):
    """Response model for detection"""
    success: bool
    report: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class ClusterResponse(BaseModel):
    """Response model for cluster retrieval"""
    success: bool
    cluster: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class IndicatorsResponse(BaseModel):
    """Response model for indicators retrieval"""
    success: bool
    indicators: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    version: str
    window_hours: int
    total_events: int
    total_entities: int
    latest_cluster: Optional[str]
    timestamp: str


@router.post("/hydra/ingest")
async def ingest_events(request: IngestRequest) -> IngestResponse:
    """
    Ingest events into the Hydra engine
    
    POST /hydra/ingest
    
    Request body:
    {
        "events": [
            {
                "entity": "0x123...",
                "timestamp": "2025-11-30T00:00:00Z",
                "amount": 1000,
                "chain": "ethereum",
                ...
            },
            ...
        ]
    }
    
    Returns:
    - success: bool
    - count: number of events ingested
    - timestamp: ingestion timestamp
    """
    try:
        logger.info(f"[HydraAPI] Ingesting {len(request.events)} events")
        
        count = engine.ingest_events(request.events)
        
        return IngestResponse(
            success=True,
            count=count,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[HydraAPI] Error ingesting events: {e}")
        return IngestResponse(
            success=False,
            count=0,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.post("/hydra/detect")
async def detect_hydra() -> DetectResponse:
    """
    Run complete Hydra detection
    
    POST /hydra/detect
    
    Runs:
    1. detect_heads - Identify Hydra head candidates
    2. detect_relays - Find relay addresses
    3. detect_proxies - Detect proxy actors
    4. build_cluster - Build HydraCluster
    5. compute_indicators - Compute 15+ indicators
    6. generate_narrative - Generate intelligence narrative
    7. build_report - Build complete HydraReport
    
    Returns:
    - success: bool
    - report: HydraReport dictionary
    - timestamp: detection timestamp
    """
    try:
        logger.info("[HydraAPI] Running Hydra detection")
        
        heads = engine.detect_heads()
        
        if len(heads) < 2:
            return DetectResponse(
                success=False,
                report=None,
                error=f"Insufficient Hydra heads detected (found {len(heads)}, need ≥2)",
                timestamp=datetime.utcnow().isoformat()
            )
        
        relays = engine.detect_relays()
        
        proxies = engine.detect_proxies()
        
        cluster = engine.build_cluster(heads, relays, proxies)
        
        indicators = engine.compute_indicators(cluster)
        
        report = engine.build_hydra_report(cluster, indicators)
        
        return DetectResponse(
            success=True,
            report=report.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[HydraAPI] Error in detection: {e}")
        return DetectResponse(
            success=False,
            report=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/hydra/cluster")
async def get_cluster() -> ClusterResponse:
    """
    Get latest HydraCluster
    
    GET /hydra/cluster
    
    Returns:
    - success: bool
    - cluster: HydraCluster dictionary
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[HydraAPI] Retrieving latest cluster")
        
        if engine.latest_cluster is None:
            return ClusterResponse(
                success=False,
                cluster=None,
                error="No cluster detected yet. Run /hydra/detect first.",
                timestamp=datetime.utcnow().isoformat()
            )
        
        return ClusterResponse(
            success=True,
            cluster=engine.latest_cluster.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[HydraAPI] Error retrieving cluster: {e}")
        return ClusterResponse(
            success=False,
            cluster=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/hydra/indicators")
async def get_indicators() -> IndicatorsResponse:
    """
    Get latest indicator table
    
    GET /hydra/indicators
    
    Returns:
    - success: bool
    - indicators: Dictionary of 15+ indicators
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[HydraAPI] Retrieving latest indicators")
        
        if not engine.latest_indicators:
            return IndicatorsResponse(
                success=False,
                indicators=None,
                error="No indicators computed yet. Run /hydra/detect first.",
                timestamp=datetime.utcnow().isoformat()
            )
        
        return IndicatorsResponse(
            success=True,
            indicators=engine.latest_indicators,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[HydraAPI] Error retrieving indicators: {e}")
        return IndicatorsResponse(
            success=False,
            indicators=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/hydra/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /hydra/health
    
    Returns:
    - status: Engine status
    - engine: Engine name
    - version: Engine version
    - window_hours: Sliding window size
    - total_events: Total events in memory
    - total_entities: Total entities tracked
    - latest_cluster: Latest cluster ID (if any)
    - timestamp: Health check timestamp
    """
    try:
        health = engine.get_health()
        
        return HealthResponse(
            status=health.get('status', 'operational'),
            engine=health.get('engine', 'Operation Hydra™'),
            version=health.get('version', '1.0.0'),
            window_hours=health.get('window_hours', 48),
            total_events=health.get('total_events', 0),
            total_entities=health.get('total_entities', 0),
            latest_cluster=health.get('latest_cluster'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[HydraAPI] Error in health check: {e}")
        return HealthResponse(
            status="error",
            engine="Operation Hydra™",
            version="1.0.0",
            window_hours=48,
            total_events=0,
            total_entities=0,
            latest_cluster=None,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/hydra/info")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /hydra/info
    
    Returns:
    - API description
    - Available endpoints
    - Detection capabilities
    - Indicators
    """
    try:
        return {
            "engine": "Operation Hydra™",
            "description": "Multi-Head Coordinated Network Detection Engine",
            "version": "1.0.0",
            "window_hours": 48,
            "endpoints": [
                {
                    "path": "/hydra/ingest",
                    "method": "POST",
                    "description": "Ingest events into the engine"
                },
                {
                    "path": "/hydra/detect",
                    "method": "POST",
                    "description": "Run complete Hydra detection"
                },
                {
                    "path": "/hydra/cluster",
                    "method": "GET",
                    "description": "Get latest HydraCluster"
                },
                {
                    "path": "/hydra/indicators",
                    "method": "GET",
                    "description": "Get latest indicator table"
                },
                {
                    "path": "/hydra/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/hydra/info",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "detection_capabilities": {
                "hydra_heads": "Leaders with burst patterns, synchronized timing, mirrored transfers, triangular loops, multi-chain hops, ring overlap",
                "relays": "Bridges between 2+ heads with ≤5 min coincidence windows",
                "proxies": "Low-volume actors with dusting, micro-pivots, wash signals",
                "minimum_heads": 2,
                "sliding_window": "48 hours"
            },
            "indicators": [
                "sync_index",
                "burst_index",
                "chain_hop_index",
                "cross_ratio",
                "deception_index",
                "manipulation_intent_score",
                "volatility_tension_score",
                "anomaly_density",
                "ring_overlap_rate",
                "relay_dependency",
                "proxy_density",
                "temporal_escalation",
                "structural_cohesion",
                "fragmentation_score",
                "operational_depth"
            ],
            "risk_levels": [
                "critical (≥0.80)",
                "high (≥0.65)",
                "elevated (≥0.50)",
                "moderate (≥0.35)",
                "low (≥0.20)",
                "minimal (<0.20)"
            ],
            "features": {
                "pure_python": "Zero external dependencies",
                "crash_proof": "100% error handling",
                "deterministic": "Reproducible results",
                "sliding_window": "48h automatic pruning",
                "real_time": "Optimized for real-time detection",
                "multi_head": "Detects clusters with ≥2 Hydra heads",
                "narrative_generation": "300-800 word intelligence narratives",
                "government_grade": "Intelligence-style reporting"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[HydraAPI] Error getting API info: {e}")
        return {
            "engine": "Operation Hydra™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

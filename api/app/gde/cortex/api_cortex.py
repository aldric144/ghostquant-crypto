"""
Cortex Memory Engine™ - FastAPI Router
6 endpoints for historical memory store and pattern detection
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from .cortex_memory_engine import CortexMemoryEngine
from .cortex_schema import (
    CortexMemoryRecord,
    CortexSequencePattern,
    CortexLongHorizonPattern,
    CortexGlobalMemorySummary
)

logger = logging.getLogger(__name__)

engine = CortexMemoryEngine(max_hours=720)

router = APIRouter(prefix="/cortex", tags=["Cortex"])


class IngestRequest(BaseModel):
    """Request model for ingesting a memory record"""
    source: str
    entity: Optional[str] = None
    token: Optional[str] = None
    chain: Optional[str] = None
    risk_score: float
    classification: str
    metadata: Dict[str, Any] = {}


class IngestResponse(BaseModel):
    """Response model for ingest"""
    success: bool
    record_id: Optional[str] = None
    total_records: Optional[int] = None
    error: Optional[str] = None
    timestamp: str


class TimelineResponse(BaseModel):
    """Response model for timeline"""
    success: bool
    entity: str
    timeline: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    timestamp: str


class PatternsResponse(BaseModel):
    """Response model for long-horizon patterns"""
    success: bool
    entity: str
    patterns: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class SequencesResponse(BaseModel):
    """Response model for sequence patterns"""
    success: bool
    entity: str
    sequences: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    timestamp: str


class SummaryResponse(BaseModel):
    """Response model for global summary"""
    success: bool
    summary: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    success: bool
    records: Optional[int] = None
    entities: Optional[int] = None
    status: str
    max_hours: Optional[int] = None
    error: Optional[str] = None
    timestamp: str


@router.post("/ingest")
async def ingest_record(request: IngestRequest) -> IngestResponse:
    """
    Ingest a new memory record
    
    POST /cortex/ingest
    
    Input:
    - source: Intelligence source (prediction, fusion, hydra, etc.)
    - entity: Entity address (optional)
    - token: Token address (optional)
    - chain: Chain name (optional)
    - risk_score: Risk score (0-1)
    - classification: Classification label
    - metadata: Additional metadata
    
    Returns:
    - success: bool
    - record_id: UUID of ingested record
    - total_records: Total records in memory
    - timestamp: Ingestion timestamp
    """
    try:
        logger.info("[CortexAPI] Ingesting record")
        
        record_dict = {
            'source': request.source,
            'entity': request.entity,
            'token': request.token,
            'chain': request.chain,
            'risk_score': request.risk_score,
            'classification': request.classification,
            'metadata': request.metadata
        }
        
        result = engine.ingest_record(record_dict)
        
        return IngestResponse(
            success=result.get('success', False),
            record_id=result.get('record_id'),
            total_records=result.get('total_records'),
            error=result.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error ingesting record: {e}")
        return IngestResponse(
            success=False,
            record_id=None,
            total_records=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/timeline/{entity}")
async def get_timeline(entity: str) -> TimelineResponse:
    """
    Get entity timeline
    
    GET /cortex/timeline/{entity}
    
    Returns:
    - success: bool
    - entity: Entity address
    - timeline: Ordered list of compressed record summaries (old → new)
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info(f"[CortexAPI] Getting timeline for entity: {entity}")
        
        timeline = engine.build_entity_timeline(entity)
        
        return TimelineResponse(
            success=True,
            entity=entity,
            timeline=timeline,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error getting timeline: {e}")
        return TimelineResponse(
            success=False,
            entity=entity,
            timeline=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/patterns/{entity}")
async def get_patterns(entity: str) -> PatternsResponse:
    """
    Get long-horizon patterns for entity
    
    GET /cortex/patterns/{entity}
    
    Returns:
    - success: bool
    - entity: Entity address
    - patterns: CortexLongHorizonPattern with detected patterns and summary
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info(f"[CortexAPI] Getting patterns for entity: {entity}")
        
        long_horizon = engine.compute_long_horizon_pattern(entity)
        
        return PatternsResponse(
            success=True,
            entity=entity,
            patterns=long_horizon.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error getting patterns: {e}")
        return PatternsResponse(
            success=False,
            entity=entity,
            patterns=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/sequences/{entity}")
async def get_sequences(entity: str) -> SequencesResponse:
    """
    Get raw sequence patterns for entity
    
    GET /cortex/sequences/{entity}
    
    Returns:
    - success: bool
    - entity: Entity address
    - sequences: List of CortexSequencePattern objects
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info(f"[CortexAPI] Getting sequences for entity: {entity}")
        
        sequences = engine.detect_sequences(entity)
        
        return SequencesResponse(
            success=True,
            entity=entity,
            sequences=[s.to_dict() for s in sequences],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error getting sequences: {e}")
        return SequencesResponse(
            success=False,
            entity=entity,
            sequences=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/summary")
async def get_summary() -> SummaryResponse:
    """
    Get global memory summary
    
    GET /cortex/summary
    
    Returns:
    - success: bool
    - summary: CortexGlobalMemorySummary with global statistics
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info("[CortexAPI] Getting global summary")
        
        summary = engine.get_global_summary()
        
        return SummaryResponse(
            success=True,
            summary=summary.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error getting summary: {e}")
        return SummaryResponse(
            success=False,
            summary=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /cortex/health
    
    Returns:
    - success: bool
    - records: Total records in memory
    - entities: Total unique entities tracked
    - status: Engine status
    - max_hours: Retention window in hours
    - timestamp: Health check timestamp
    """
    try:
        health = engine.health()
        
        return HealthResponse(
            success=health.get('success', True),
            records=health.get('records'),
            entities=health.get('entities'),
            status=health.get('status', 'operational'),
            max_hours=health.get('max_hours'),
            error=health.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error in health check: {e}")
        return HealthResponse(
            success=False,
            records=None,
            entities=None,
            status="error",
            max_hours=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /cortex/
    
    Returns:
    - API description
    - Available endpoints
    - Pattern types
    - Features
    """
    try:
        return {
            "engine": "Cortex Memory Engine™",
            "description": "Historical memory store with long-horizon pattern detection",
            "version": "1.0.0",
            "retention_window": "30 days (720 hours)",
            "endpoints": [
                {
                    "path": "/cortex/ingest",
                    "method": "POST",
                    "description": "Ingest a new memory record"
                },
                {
                    "path": "/cortex/timeline/{entity}",
                    "method": "GET",
                    "description": "Get entity timeline (ordered old → new)"
                },
                {
                    "path": "/cortex/patterns/{entity}",
                    "method": "GET",
                    "description": "Get long-horizon patterns for entity"
                },
                {
                    "path": "/cortex/sequences/{entity}",
                    "method": "GET",
                    "description": "Get raw sequence patterns for entity"
                },
                {
                    "path": "/cortex/summary",
                    "method": "GET",
                    "description": "Get global memory summary"
                },
                {
                    "path": "/cortex/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/cortex/",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "pattern_types": [
                {
                    "type": "escalation",
                    "description": "Risk increasing ≥ 3 steps",
                    "trigger": "Consecutive risk increases"
                },
                {
                    "type": "accumulation",
                    "description": "Clustered activity (≥3 events in 10 min)",
                    "trigger": "High-frequency event bursts"
                },
                {
                    "type": "volatility",
                    "description": "Risk oscillates high→low→high",
                    "trigger": "Risk score oscillations"
                },
                {
                    "type": "coordination",
                    "description": "Entity intersects same clusters/rings",
                    "trigger": "Repeated cluster associations"
                }
            ],
            "features": {
                "pure_python": "Zero external dependencies",
                "crash_proof": "100% error handling",
                "retention": "30-day rolling window",
                "pattern_detection": "4 temporal pattern types",
                "long_horizon": "Multi-pattern aggregate analysis",
                "global_summary": "Cross-entity statistics",
                "auto_purge": "Automatic old data cleanup"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[CortexAPI] Error getting API info: {e}")
        return {
            "engine": "Cortex Memory Engine™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

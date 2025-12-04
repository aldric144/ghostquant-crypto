"""
Ultra-Fusion AI Supervisor™ - FastAPI Router
6 endpoints for meta-intelligence supervision
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from .ultrafusion_engine import UltraFusionSupervisor
from .ultrafusion_schema import SupervisorInput

logger = logging.getLogger(__name__)

supervisor = UltraFusionSupervisor()

router = APIRouter()


class AnalyzeRequest(BaseModel):
    """Request model for complete analysis"""
    entity: Optional[str] = ""
    token: Optional[str] = ""
    chain: Optional[str] = ""
    image_metadata: Optional[Dict[str, Any]] = None
    events: Optional[List[Dict[str, Any]]] = None


class AnalyzeResponse(BaseModel):
    """Response model for complete analysis"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class EntityRequest(BaseModel):
    """Request model for entity analysis"""
    entity: str
    events: Optional[List[Dict[str, Any]]] = None


class EntityResponse(BaseModel):
    """Response model for entity analysis"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class TokenRequest(BaseModel):
    """Request model for token analysis"""
    token: str
    chain: Optional[str] = ""
    events: Optional[List[Dict[str, Any]]] = None


class TokenResponse(BaseModel):
    """Response model for token analysis"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class ChainRequest(BaseModel):
    """Request model for chain analysis"""
    chain: str
    events: Optional[List[Dict[str, Any]]] = None


class ChainResponse(BaseModel):
    """Response model for chain analysis"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class ImageRequest(BaseModel):
    """Request model for image analysis with Oracle Eye"""
    image_metadata: Dict[str, Any]
    entity: Optional[str] = ""
    token: Optional[str] = ""


class ImageResponse(BaseModel):
    """Response model for image analysis"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    version: str
    timestamp: str


@router.post("/ultrafusion/analyze")
async def analyze_complete(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Complete meta-intelligence analysis
    
    POST /ultrafusion/analyze
    
    Request body:
    {
        "entity": "0x123...",
        "token": "BTC",
        "chain": "ethereum",
        "image_metadata": {...},
        "events": [...]
    }
    
    Returns:
    - Complete supervisor output
    - Meta-fusion risk score
    - Cross-engine signals
    - Contradictions and blindspots
    - Recommendations
    - Executive summary
    - Meta-narrative
    """
    try:
        logger.info("[UltraFusionAPI] Analyzing complete intelligence")
        
        supervisor_input = SupervisorInput(
            entity=request.entity or "",
            token=request.token or "",
            chain=request.chain or "",
            image_metadata=request.image_metadata or {},
            events=request.events or []
        )
        
        result = supervisor.generate_final_supervisor_output(supervisor_input)
        
        return AnalyzeResponse(
            success=True,
            result=result,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error analyzing: {e}")
        return AnalyzeResponse(
            success=False,
            result=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.post("/ultrafusion/entity")
async def analyze_entity(request: EntityRequest) -> EntityResponse:
    """
    Entity-focused meta-intelligence analysis
    
    POST /ultrafusion/entity
    
    Request body:
    {
        "entity": "0x123...",
        "events": [...]
    }
    
    Returns:
    - Entity-focused supervisor output
    - Behavioral DNA analysis
    - Entity history
    - Threat actor profile
    - Cluster analysis
    """
    try:
        logger.info(f"[UltraFusionAPI] Analyzing entity: {request.entity}")
        
        supervisor_input = SupervisorInput(
            entity=request.entity,
            events=request.events or []
        )
        
        result = supervisor.generate_final_supervisor_output(supervisor_input)
        
        return EntityResponse(
            success=True,
            result=result,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error analyzing entity: {e}")
        return EntityResponse(
            success=False,
            result=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.post("/ultrafusion/token")
async def analyze_token(request: TokenRequest) -> TokenResponse:
    """
    Token-focused meta-intelligence analysis
    
    POST /ultrafusion/token
    
    Request body:
    {
        "token": "BTC",
        "chain": "ethereum",
        "events": [...]
    }
    
    Returns:
    - Token-focused supervisor output
    - Prediction analysis
    - Fusion analysis
    - Radar analysis
    """
    try:
        logger.info(f"[UltraFusionAPI] Analyzing token: {request.token}")
        
        supervisor_input = SupervisorInput(
            token=request.token,
            chain=request.chain or "",
            events=request.events or []
        )
        
        result = supervisor.generate_final_supervisor_output(supervisor_input)
        
        return TokenResponse(
            success=True,
            result=result,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error analyzing token: {e}")
        return TokenResponse(
            success=False,
            result=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.post("/ultrafusion/chain")
async def analyze_chain(request: ChainRequest) -> ChainResponse:
    """
    Chain-focused meta-intelligence analysis
    
    POST /ultrafusion/chain
    
    Request body:
    {
        "chain": "ethereum",
        "events": [...]
    }
    
    Returns:
    - Chain-focused supervisor output
    - Multi-chain pressure analysis
    - Radar analysis
    """
    try:
        logger.info(f"[UltraFusionAPI] Analyzing chain: {request.chain}")
        
        supervisor_input = SupervisorInput(
            chain=request.chain,
            events=request.events or []
        )
        
        result = supervisor.generate_final_supervisor_output(supervisor_input)
        
        return ChainResponse(
            success=True,
            result=result,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error analyzing chain: {e}")
        return ChainResponse(
            success=False,
            result=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.post("/ultrafusion/image")
async def analyze_image(request: ImageRequest) -> ImageResponse:
    """
    Image-focused meta-intelligence analysis with Oracle Eye
    
    POST /ultrafusion/image
    
    Request body:
    {
        "image_metadata": {
            "filename": "chart.png",
            "size_kb": 150,
            "description": "Bitcoin chart"
        },
        "entity": "0x123...",
        "token": "BTC"
    }
    
    Returns:
    - Image-focused supervisor output
    - Oracle Eye visual fraud detection
    - Cross-engine validation
    """
    try:
        logger.info("[UltraFusionAPI] Analyzing image with Oracle Eye")
        
        supervisor_input = SupervisorInput(
            entity=request.entity or "",
            token=request.token or "",
            image_metadata=request.image_metadata
        )
        
        result = supervisor.generate_final_supervisor_output(supervisor_input)
        
        return ImageResponse(
            success=True,
            result=result,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error analyzing image: {e}")
        return ImageResponse(
            success=False,
            result=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/ultrafusion/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /ultrafusion/health
    
    Returns:
    - Supervisor status
    - Engine information
    """
    try:
        health = supervisor.get_health()
        
        return HealthResponse(
            status=health.get('status', 'operational'),
            engine=health.get('engine', 'Ultra-Fusion AI Supervisor™'),
            version=health.get('version', '1.0.0'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error in health check: {e}")
        return HealthResponse(
            status="error",
            engine="Ultra-Fusion AI Supervisor™",
            version="1.0.0",
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/ultrafusion/info")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /ultrafusion/info
    
    Returns:
    - API description
    - Available endpoints
    - Intelligence sources
    - Features
    """
    try:
        return {
            "engine": "Ultra-Fusion AI Supervisor™",
            "description": "Global Meta-Intelligence Engine orchestrating all intelligence sources",
            "version": "1.0.0",
            "endpoints": [
                {
                    "path": "/ultrafusion/analyze",
                    "method": "POST",
                    "description": "Complete meta-intelligence analysis"
                },
                {
                    "path": "/ultrafusion/entity",
                    "method": "POST",
                    "description": "Entity-focused analysis"
                },
                {
                    "path": "/ultrafusion/token",
                    "method": "POST",
                    "description": "Token-focused analysis"
                },
                {
                    "path": "/ultrafusion/chain",
                    "method": "POST",
                    "description": "Chain-focused analysis"
                },
                {
                    "path": "/ultrafusion/image",
                    "method": "POST",
                    "description": "Image analysis with Oracle Eye"
                },
                {
                    "path": "/ultrafusion/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/ultrafusion/info",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "intelligence_sources": [
                "Predictor (ML predictions)",
                "DNA Engine (behavioral patterns)",
                "Entity History (historical analysis)",
                "Correlation Engine (cross-entity patterns)",
                "Fusion Engine (multi-domain fusion)",
                "Radar Engine (global manipulation)",
                "Cluster Engine (coordination detection)",
                "Threat Actor Profiler (actor classification)",
                "Oracle Eye (visual fraud detection)",
                "GhostWriter (narrative summaries)"
            ],
            "risk_classifications": [
                "CRITICAL (≥0.85)",
                "HIGH (≥0.70)",
                "ELEVATED (≥0.55)",
                "MODERATE (≥0.40)",
                "LOW (≥0.25)",
                "MINIMAL (<0.25)"
            ],
            "meta_signals": [
                "contradiction_score",
                "agreement_score",
                "anomaly_amplification",
                "threat_amplification",
                "cross_ratio",
                "multi_chain_pressure",
                "temporal_escalation",
                "blind_spot_score",
                "data_completeness"
            ],
            "fusion_weights": {
                "prediction": "20%",
                "fusion": "20%",
                "radar": "20%",
                "dna": "10%",
                "actor_profile": "10%",
                "cluster": "10%",
                "image": "5%",
                "contradiction_penalty": "-5% to -20%",
                "blindspot_penalty": "-5% to -15%"
            },
            "features": {
                "meta_fusion": "Weighted fusion across all intelligence engines",
                "cross_engine_signals": "Contradiction detection, agreement scoring, anomaly amplification",
                "risk_classification": "6-level risk classification system",
                "recommendations": "8-15 actionable recommendations per analysis",
                "executive_summary": "5-10 line analyst-grade summary",
                "meta_narrative": "500-1,500 word comprehensive narrative",
                "confidence_scoring": "Data completeness and confidence assessment",
                "blind_spot_detection": "Missing data and gap identification"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[UltraFusionAPI] Error getting API info: {e}")
        return {
            "engine": "Ultra-Fusion AI Supervisor™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

"""
Phantom Deception Engine™ - FastAPI Router
5 endpoints for deception detection and fraud analysis
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

from .phantom_engine import PhantomEngine
from .phantom_schema import PhantomInput

logger = logging.getLogger(__name__)

phantom_engine = PhantomEngine()

router = APIRouter()


class AnalyzeRequest(BaseModel):
    """Request model for single analysis"""
    transcript: str
    metadata: Optional[Dict[str, Any]] = None


class AnalyzeResponse(BaseModel):
    """Response model for single analysis"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class BatchRequest(BaseModel):
    """Request model for batch analysis"""
    items: List[Dict[str, Any]]


class BatchResponse(BaseModel):
    """Response model for batch analysis"""
    success: bool
    results: List[Dict[str, Any]]
    count: int
    errors: int
    timestamp: str


class SignatureTypesResponse(BaseModel):
    """Response model for signature types"""
    success: bool
    signature_types: List[Dict[str, Any]]
    count: int
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    signature_types: int
    timestamp: str


@router.post("/phantom/analyze")
async def analyze_deception(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze transcript for deception indicators
    
    POST /phantom/analyze
    
    Request body:
    {
        "transcript": "text to analyze",
        "metadata": {
            "wallet": "0x...",
            "ip_risk": 0.5,
            "device_anomaly": 0.3,
            ...
        }
    }
    
    Returns:
    - Complete deception analysis
    - Deception score (0-1)
    - Intent score (0-1)
    - Synthetic probability (0-1)
    - Signature classification
    - Flags and recommendations
    """
    try:
        logger.info("[PhantomAPI] Analyzing deception")
        
        phantom_input = PhantomInput(
            transcript=request.transcript,
            metadata=request.metadata or {},
            features={}
        )
        
        result = phantom_engine.analyze(phantom_input)
        
        return AnalyzeResponse(
            success=True,
            result=result.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[PhantomAPI] Error analyzing: {e}")
        return AnalyzeResponse(
            success=False,
            result=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.post("/phantom/batch")
async def batch_analyze(request: BatchRequest) -> BatchResponse:
    """
    Batch analyze multiple transcripts
    
    POST /phantom/batch
    
    Request body:
    {
        "items": [
            {
                "transcript": "text 1",
                "metadata": {...}
            },
            {
                "transcript": "text 2",
                "metadata": {...}
            }
        ]
    }
    
    Returns:
    - List of analysis results
    - Success count
    - Error count
    """
    try:
        logger.info(f"[PhantomAPI] Batch analyzing {len(request.items)} items")
        
        results = []
        errors = 0
        
        for item in request.items:
            try:
                phantom_input = PhantomInput(
                    transcript=item.get('transcript', ''),
                    metadata=item.get('metadata', {}),
                    features={}
                )
                
                result = phantom_engine.analyze(phantom_input)
                results.append(result.to_dict())
                
            except Exception as e:
                logger.error(f"[PhantomAPI] Error in batch item: {e}")
                errors += 1
                results.append({
                    "error": str(e),
                    "transcript": item.get('transcript', '')[:50]
                })
        
        return BatchResponse(
            success=True,
            results=results,
            count=len(results),
            errors=errors,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[PhantomAPI] Error in batch analysis: {e}")
        return BatchResponse(
            success=False,
            results=[],
            count=0,
            errors=len(request.items),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/phantom/signature-types")
async def get_signature_types() -> SignatureTypesResponse:
    """
    Get all signature types with descriptions
    
    GET /phantom/signature-types
    
    Returns:
    - List of 10 signature types
    - Descriptions and risk levels
    """
    try:
        signature_types = [
            {
                "label": "THE MANIPULATOR",
                "description": "Emotional manipulation with guilt tactics and sympathy appeals",
                "risk_level": "HIGH",
                "characteristics": [
                    "Emotional manipulation",
                    "Guilt tactics",
                    "Sympathy appeals",
                    "Psychological pressure"
                ]
            },
            {
                "label": "THE PREDATOR",
                "description": "Aggressive high-pressure tactics with urgency and threats",
                "risk_level": "CRITICAL",
                "characteristics": [
                    "Aggressive tactics",
                    "High-pressure urgency",
                    "Threatening language",
                    "Intimidation strategies"
                ]
            },
            {
                "label": "THE IMPOSTOR",
                "description": "Identity theft and impersonation with false credentials",
                "risk_level": "CRITICAL",
                "characteristics": [
                    "Identity theft",
                    "Impersonation",
                    "False credentials",
                    "Authority fraud"
                ]
            },
            {
                "label": "THE FANTOM",
                "description": "Silent synthetic actor with minimal interaction patterns",
                "risk_level": "MODERATE",
                "characteristics": [
                    "Synthetic identity",
                    "Minimal interaction",
                    "Dormant patterns",
                    "Bot-like behavior"
                ]
            },
            {
                "label": "THE HUSTLER",
                "description": "Fast-talking overpromising with urgency manipulation",
                "risk_level": "HIGH",
                "characteristics": [
                    "Overpromising",
                    "Urgency tactics",
                    "Exaggerated claims",
                    "False scarcity"
                ]
            },
            {
                "label": "THE SOCIAL ENGINEER",
                "description": "Trust-building rapport with information extraction",
                "risk_level": "MODERATE",
                "characteristics": [
                    "Trust building",
                    "Information extraction",
                    "Rapport tactics",
                    "Social manipulation"
                ]
            },
            {
                "label": "THE INSIDER",
                "description": "Claims privileged information with exclusivity tactics",
                "risk_level": "MODERATE",
                "characteristics": [
                    "Privileged information claims",
                    "Exclusivity tactics",
                    "Secretive language",
                    "Insider terminology"
                ]
            },
            {
                "label": "THE PSYCH-MODEL",
                "description": "Emotional mimic exploiting empathy and psychology",
                "risk_level": "HIGH",
                "characteristics": [
                    "Emotional mimicry",
                    "Empathy exploitation",
                    "Psychological tactics",
                    "Vulnerability targeting"
                ]
            },
            {
                "label": "THE MIMIC",
                "description": "AI-generated persona with synthetic behavioral patterns",
                "risk_level": "MODERATE",
                "characteristics": [
                    "AI-generated patterns",
                    "Synthetic persona",
                    "Bot-like consistency",
                    "Automated responses"
                ]
            },
            {
                "label": "UNKNOWN",
                "description": "Mixed or insufficient signals for classification",
                "risk_level": "UNKNOWN",
                "characteristics": [
                    "Mixed signals",
                    "Insufficient data",
                    "Novel tactics",
                    "Unclear patterns"
                ]
            }
        ]
        
        return SignatureTypesResponse(
            success=True,
            signature_types=signature_types,
            count=len(signature_types),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[PhantomAPI] Error getting signature types: {e}")
        return SignatureTypesResponse(
            success=False,
            signature_types=[],
            count=0,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/phantom/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /phantom/health
    
    Returns:
    - Engine status
    - Signature types count
    """
    try:
        return HealthResponse(
            status="operational",
            engine="Phantom Deception Engine™",
            signature_types=10,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[PhantomAPI] Error in health check: {e}")
        return HealthResponse(
            status="error",
            engine="Phantom Deception Engine™",
            signature_types=0,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/phantom/")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /phantom/
    
    Returns:
    - API description
    - Available endpoints
    - Signature types
    - Features
    """
    try:
        return {
            "engine": "Phantom Deception Engine™",
            "description": "Real-time fraud detection and deception scoring system",
            "version": "1.0.0",
            "endpoints": [
                {
                    "path": "/phantom/analyze",
                    "method": "POST",
                    "description": "Analyze transcript for deception indicators"
                },
                {
                    "path": "/phantom/batch",
                    "method": "POST",
                    "description": "Batch analyze multiple transcripts"
                },
                {
                    "path": "/phantom/signature-types",
                    "method": "GET",
                    "description": "Get all signature types with descriptions"
                },
                {
                    "path": "/phantom/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/phantom/",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "signature_types": [
                "THE MANIPULATOR",
                "THE PREDATOR",
                "THE IMPOSTOR",
                "THE FANTOM",
                "THE HUSTLER",
                "THE SOCIAL ENGINEER",
                "THE INSIDER",
                "THE PSYCH-MODEL",
                "THE MIMIC",
                "UNKNOWN"
            ],
            "features": {
                "deception_scoring": "0-1 composite deception score",
                "intent_scoring": "0-1 malicious intent score",
                "synthetic_detection": "AI/bot identity probability",
                "signature_classification": "10 fraudster archetypes",
                "feature_extraction": "50-80 features across 6 domains",
                "narrative_generation": "Detailed analysis narratives",
                "flag_generation": "Automated warning flags",
                "batch_processing": "Multiple transcript analysis"
            },
            "domains": [
                "Linguistic deception cues",
                "Behavioral patterns",
                "Synthetic identity indicators",
                "Emotional instability",
                "Metadata risk flags",
                "Risk-weighted composite"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[PhantomAPI] Error getting API info: {e}")
        return {
            "engine": "Phantom Deception Engine™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

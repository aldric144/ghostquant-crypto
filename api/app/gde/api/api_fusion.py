"""
Fusion API - FastAPI endpoints for Multi-Domain Intelligence Fusion Engine.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from datetime import datetime

from ..intel.fusion_engine import FusionEngine
from ..intel.fusion_schema import FusionInput, FusionOutput


router = APIRouter()

fusion_engine = FusionEngine()



class EntityFusionRequest(BaseModel):
    """Request model for entity fusion analysis."""
    entity: Dict[str, Any] = Field(..., description="Entity data dictionary")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Entity event history")
    neighbors: Optional[List[str]] = Field(None, description="Correlated entity addresses")
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity": {
                    "address": "0xABC123...",
                    "event_risk": 0.75,
                    "manipulation_risk": 0.68,
                    "dna": {
                        "archetype_score": 0.82,
                        "features": {
                            "manipulation_bias": 0.71,
                            "stealth_factor": 0.45
                        }
                    }
                },
                "history": [
                    {"timestamp": 1700000000, "value": 1000, "chain": "ethereum"},
                    {"timestamp": 1700003600, "value": 2000, "chain": "ethereum"}
                ],
                "neighbors": ["0xDEF456...", "0xGHI789..."]
            }
        }


class TokenFusionRequest(BaseModel):
    """Request model for token fusion analysis."""
    token: Dict[str, Any] = Field(..., description="Token data dictionary")
    chain: Optional[str] = Field(None, description="Chain name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": {
                    "symbol": "ETH",
                    "direction_score": 0.65,
                    "volatility_score": 0.72
                },
                "chain": "ethereum"
            }
        }


class MultiFusionRequest(BaseModel):
    """Request model for multi-domain fusion analysis."""
    entity: Optional[Dict[str, Any]] = Field(None, description="Entity data")
    token: Optional[Dict[str, Any]] = Field(None, description="Token data")
    chain: Optional[str] = Field(None, description="Chain name")
    events: Optional[List[Dict[str, Any]]] = Field(None, description="Event list")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Entity history")
    neighbors: Optional[List[str]] = Field(None, description="Correlated entities")
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity": {
                    "address": "0xABC123...",
                    "event_risk": 0.75
                },
                "token": {
                    "symbol": "ETH",
                    "volatility_score": 0.72
                },
                "chain": "ethereum",
                "history": [
                    {"timestamp": 1700000000, "value": 1000}
                ]
            }
        }



@router.post("/entity", tags=["FusionEngine"])
async def fuse_entity_intelligence(request: EntityFusionRequest = Body(...)):
    """
    Fuse intelligence for an entity across all domains.
    
    Analyzes entity across:
    - Prediction Engine (event risk, manipulation risk, ring probability)
    - Behavioral DNA Engine (archetype, manipulation bias, stealth factor)
    - Entity History Engine (activity density, burstiness, anomalies)
    - Correlation Engine (network correlation, coordinated behavior)
    - Ring Detector (ring membership, cluster analysis)
    - Chain Pressure Models (network congestion, pressure scores)
    
    **Returns:**
    - fused_score: Unified intelligence score (0.0-1.0)
    - classification: Intelligence level (critical/high/moderate/low/minimal)
    - components: Individual component scores from each domain
    - narrative: Comprehensive intelligence narrative
    - flags: Risk and behavior flags
    - recommendations: Actionable recommendations
    """
    try:
        print(f"[FusionAPI] Received entity fusion request")
        
        if not request.entity:
            raise HTTPException(
                status_code=400,
                detail="Entity data is required"
            )
        
        result = fusion_engine.fuse(
            entity=request.entity,
            history=request.history,
            neighbors=request.neighbors
        )
        
        if not result.success:
            error_msg = result.error or "Fusion analysis failed"
            print(f"[FusionAPI] Entity fusion failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        print(f"[FusionAPI] Entity fusion successful: score={result.fused_score:.3f}")
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FusionAPI] Error in entity fusion endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.post("/token", tags=["FusionEngine"])
async def fuse_token_intelligence(request: TokenFusionRequest = Body(...)):
    """
    Fuse intelligence for a token across all domains.
    
    Analyzes token across:
    - Prediction Engine (direction score, volatility score)
    - Chain Pressure Models (network congestion, pressure)
    - Market Intelligence (volume, liquidity, momentum)
    
    **Returns:**
    - fused_score: Unified intelligence score (0.0-1.0)
    - classification: Intelligence level (critical/high/moderate/low/minimal)
    - components: Individual component scores
    - narrative: Comprehensive intelligence narrative
    - flags: Risk and behavior flags
    - recommendations: Actionable recommendations
    """
    try:
        print(f"[FusionAPI] Received token fusion request")
        
        if not request.token:
            raise HTTPException(
                status_code=400,
                detail="Token data is required"
            )
        
        result = fusion_engine.fuse(
            token=request.token,
            chain=request.chain
        )
        
        if not result.success:
            error_msg = result.error or "Fusion analysis failed"
            print(f"[FusionAPI] Token fusion failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        print(f"[FusionAPI] Token fusion successful: score={result.fused_score:.3f}")
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FusionAPI] Error in token fusion endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.post("/multi", tags=["FusionEngine"])
async def fuse_multi_domain_intelligence(request: MultiFusionRequest = Body(...)):
    """
    Fuse intelligence across multiple domains with flexible input.
    
    Accepts any combination of:
    - entity: Entity data
    - token: Token data
    - chain: Chain name
    - events: Event list
    - history: Entity history
    - neighbors: Correlated entities
    
    Automatically analyzes all provided data across relevant intelligence domains:
    - Prediction Engine
    - Behavioral DNA Engine
    - Entity History Engine
    - Correlation Engine
    - Ring Detector
    - Chain Pressure Models
    
    **Returns:**
    - fused_score: Unified intelligence score (0.0-1.0)
    - classification: Intelligence level (critical/high/moderate/low/minimal)
    - components: Individual component scores from each domain
    - narrative: Comprehensive intelligence narrative
    - flags: Risk and behavior flags (high_risk, coordinated_actor, manipulation, ring_member)
    - recommendations: Actionable recommendations
    """
    try:
        print(f"[FusionAPI] Received multi-domain fusion request")
        
        if not any([request.entity, request.token, request.chain, request.events, request.history]):
            raise HTTPException(
                status_code=400,
                detail="At least one input (entity, token, chain, events, or history) is required"
            )
        
        result = fusion_engine.fuse(
            entity=request.entity,
            token=request.token,
            chain=request.chain,
            events=request.events,
            history=request.history,
            neighbors=request.neighbors
        )
        
        if not result.success:
            error_msg = result.error or "Fusion analysis failed"
            print(f"[FusionAPI] Multi-domain fusion failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        print(f"[FusionAPI] Multi-domain fusion successful: score={result.fused_score:.3f}")
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FusionAPI] Error in multi-domain fusion endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/health", tags=["FusionEngine"])
async def health_check():
    """
    Health check endpoint for Fusion API.
    
    **Returns:**
    - status: API status
    - engine_version: Fusion engine version
    - component_weights: Configured component weights
    """
    try:
        return {
            'success': True,
            'status': 'healthy',
            'engine_version': '1.0.0',
            'component_weights': fusion_engine.weights,
            'classification_thresholds': fusion_engine.thresholds,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[FusionAPI] Error in health check: {e}")
        return {
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/", tags=["FusionEngine"])
async def fusion_api_info():
    """
    Get Fusion API information.
    
    **Returns:**
    - API overview and available endpoints
    """
    return {
        'success': True,
        'name': 'Multi-Domain Intelligence Fusion Engine (MIFE)',
        'version': '1.0.0',
        'description': 'The brain of GhostQuant - fuses all intelligence signals into unified scores and narratives',
        'endpoints': {
            'POST /fusion/entity': 'Fuse intelligence for an entity',
            'POST /fusion/token': 'Fuse intelligence for a token',
            'POST /fusion/multi': 'Fuse intelligence across multiple domains',
            'GET /fusion/health': 'Health check',
            'GET /fusion/': 'API information'
        },
        'intelligence_domains': [
            'Prediction Engine (event risk, manipulation risk, ring probability)',
            'Behavioral DNA Engine (archetype, manipulation bias, stealth factor)',
            'Entity History Engine (activity density, burstiness, anomalies)',
            'Correlation Engine (network correlation, coordinated behavior)',
            'Ring Detector (ring membership, cluster analysis)',
            'Chain Pressure Models (network congestion, pressure scores)'
        ],
        'component_weights': fusion_engine.weights,
        'classification_levels': ['critical', 'high', 'moderate', 'low', 'minimal'],
        'timestamp': datetime.utcnow().isoformat()
    }

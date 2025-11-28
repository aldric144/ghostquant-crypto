"""
Behavioral DNA™ API - FastAPI router for DNA analysis endpoints.
Provides REST API access to behavioral DNA analysis capabilities.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from datetime import datetime

from .dna_analyzer import DNAAnalyzer


router = APIRouter()

dna_analyzer = DNAAnalyzer()



class EntityEvent(BaseModel):
    """Single entity event/transaction."""
    timestamp: Optional[int] = Field(None, description="Unix timestamp")
    value: Optional[float] = Field(None, description="Transaction value")
    chain: Optional[str] = Field(None, description="Blockchain name")
    token: Optional[str] = Field(None, description="Token symbol")
    type: Optional[str] = Field(None, description="Event type")
    wallet: Optional[str] = Field(None, description="Wallet address")
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": 1700000000,
                "value": 1000.0,
                "chain": "ethereum",
                "token": "ETH",
                "type": "transfer",
                "wallet": "0x123..."
            }
        }


class AnalyzeRequest(BaseModel):
    """Request model for DNA analysis."""
    entity_history: List[Dict[str, Any]] = Field(
        ..., 
        description="List of entity events/transactions",
        min_length=1
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity_history": [
                    {
                        "timestamp": 1700000000,
                        "value": 1000.0,
                        "chain": "ethereum",
                        "token": "ETH"
                    },
                    {
                        "timestamp": 1700003600,
                        "value": 2000.0,
                        "chain": "ethereum",
                        "token": "ETH"
                    }
                ]
            }
        }


class BatchAnalyzeRequest(BaseModel):
    """Request model for batch DNA analysis."""
    entities: List[List[Dict[str, Any]]] = Field(
        ...,
        description="List of entity histories (each is a list of events)",
        min_length=1
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "entities": [
                    [
                        {"timestamp": 1700000000, "value": 1000.0, "chain": "ethereum"},
                        {"timestamp": 1700003600, "value": 2000.0, "chain": "ethereum"}
                    ],
                    [
                        {"timestamp": 1700000000, "value": 500.0, "chain": "bitcoin"},
                        {"timestamp": 1700007200, "value": 1500.0, "chain": "bitcoin"}
                    ]
                ]
            }
        }


class AnalyzeResponse(BaseModel):
    """Response model for DNA analysis."""
    success: bool
    archetype: str
    archetype_score: float
    dna_code: str
    scores: Dict[str, float]
    top_signals: List[str]
    supporting_features: Dict[str, float]
    features: Dict[str, float]
    metadata: Dict[str, Any]
    error: Optional[str] = None


class ArchetypeDefinition(BaseModel):
    """Archetype definition model."""
    name: str
    description: str
    characteristics: List[str]
    risk_level: str
    typical_features: Dict[str, str]


class ModelsResponse(BaseModel):
    """Response model for available models/archetypes."""
    success: bool
    archetypes: Dict[str, ArchetypeDefinition]
    total_archetypes: int
    analyzer_version: str


class FeatureDescriptionsResponse(BaseModel):
    """Response model for feature descriptions."""
    success: bool
    features: Dict[str, str]
    total_features: int
    analyzer_version: str



@router.post("/analyze", response_model=AnalyzeResponse, tags=["Behavioral DNA"])
async def analyze_entity_dna(request: AnalyzeRequest = Body(...)):
    """
    Analyze entity behavioral DNA from transaction history.
    
    Extracts 50+ behavioral features, classifies archetype, and generates DNA code.
    
    **Archetypes:**
    - PREDATOR: Aggressive, manipulation-prone
    - OPPORTUNIST: Reactive, profit-chasing
    - COORDINATED_ACTOR: Ring-linked, pattern-aligned
    - GHOST: Stealthy, minimal footprint
    - AGENT: AI-like or bot-like
    - MANIPULATOR: Market-moving abnormality
    
    **Returns:**
    - archetype: Classified behavioral archetype
    - dna_code: Unique DNA code (format: Q7-AX4-ARCHETYPE)
    - scores: All archetype scores
    - top_signals: Top 3-5 behavioral signals
    - supporting_features: Key features for classification
    - features: All 50+ extracted features
    - metadata: Analysis metadata
    """
    try:
        print(f"[BehavioralDNA API] Received analyze request with {len(request.entity_history)} events")
        
        if not request.entity_history:
            raise HTTPException(
                status_code=400,
                detail="entity_history cannot be empty"
            )
        
        result = dna_analyzer.analyze(request.entity_history)
        
        if not result.get('success', False):
            print(f"[BehavioralDNA API] Analysis failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=500,
                detail=result.get('error', 'Analysis failed')
            )
        
        print(f"[BehavioralDNA API] Analysis successful: {result['archetype']} ({result['dna_code']})")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[BehavioralDNA API] Error in analyze endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/analyze/batch", tags=["Behavioral DNA"])
async def analyze_batch_dna(request: BatchAnalyzeRequest = Body(...)):
    """
    Analyze multiple entities in batch.
    
    Processes multiple entity histories and returns DNA analysis for each.
    
    **Returns:**
    - List of analysis results (one per entity)
    """
    try:
        print(f"[BehavioralDNA API] Received batch analyze request with {len(request.entities)} entities")
        
        if not request.entities:
            raise HTTPException(
                status_code=400,
                detail="entities cannot be empty"
            )
        
        results = dna_analyzer.analyze_batch(request.entities)
        
        print(f"[BehavioralDNA API] Batch analysis complete: {len(results)} results")
        return {
            "success": True,
            "results": results,
            "total_entities": len(request.entities),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[BehavioralDNA API] Error in batch analyze endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/models", response_model=ModelsResponse, tags=["Behavioral DNA"])
async def get_archetype_models():
    """
    Get available behavioral archetypes and their definitions.
    
    Returns detailed information about all 6 behavioral archetypes:
    - PREDATOR
    - OPPORTUNIST
    - COORDINATED_ACTOR
    - GHOST
    - AGENT
    - MANIPULATOR
    
    **Returns:**
    - archetypes: Dictionary of archetype definitions
    - total_archetypes: Number of available archetypes
    - analyzer_version: DNA analyzer version
    """
    try:
        print("[BehavioralDNA API] Fetching archetype models")
        
        archetypes = dna_analyzer.get_archetype_definitions()
        
        return {
            "success": True,
            "archetypes": archetypes,
            "total_archetypes": len(archetypes),
            "analyzer_version": dna_analyzer.version
        }
        
    except Exception as e:
        print(f"[BehavioralDNA API] Error in models endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/features", response_model=FeatureDescriptionsResponse, tags=["Behavioral DNA"])
async def get_feature_descriptions():
    """
    Get descriptions of all behavioral features.
    
    Returns detailed descriptions of all 50+ behavioral features used in DNA analysis.
    
    **Feature Categories:**
    - Time Patterns: activity_velocity, burstiness_index, circadian_offset, etc.
    - Cross-Chain Patterns: chain_hopping_rate, cross_chain_entropy, etc.
    - Motivation/Intent: profit_seeking_score, manipulation_bias, etc.
    - Risk Dynamics: risk_trend_slope, anomaly_frequency, etc.
    - Consistency/Stability: behavioral_consistency, identity_stability, etc.
    
    **Returns:**
    - features: Dictionary mapping feature names to descriptions
    - total_features: Number of available features
    - analyzer_version: DNA analyzer version
    """
    try:
        print("[BehavioralDNA API] Fetching feature descriptions")
        
        features = dna_analyzer.get_feature_descriptions()
        
        return {
            "success": True,
            "features": features,
            "total_features": len(features),
            "analyzer_version": dna_analyzer.version
        }
        
    except Exception as e:
        print(f"[BehavioralDNA API] Error in features endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/health", tags=["Behavioral DNA"])
async def health_check():
    """
    Health check endpoint for Behavioral DNA™ API.
    
    **Returns:**
    - status: API status
    - analyzer_version: DNA analyzer version
    - archetypes_available: Number of available archetypes
    - features_available: Number of available features
    """
    try:
        archetypes = dna_analyzer.get_archetype_definitions()
        features = dna_analyzer.get_feature_descriptions()
        
        return {
            "success": True,
            "status": "healthy",
            "analyzer_version": dna_analyzer.version,
            "archetypes_available": len(archetypes),
            "features_available": len(features),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[BehavioralDNA API] Error in health check: {e}")
        return {
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/", tags=["Behavioral DNA"])
async def dna_api_info():
    """
    Get Behavioral DNA™ API information.
    
    **Returns:**
    - API overview and available endpoints
    """
    return {
        "success": True,
        "name": "Behavioral DNA™ API",
        "version": dna_analyzer.version,
        "description": "Ultra-futuristic intelligence module for behavioral analysis",
        "endpoints": {
            "POST /dna/analyze": "Analyze entity behavioral DNA",
            "POST /dna/analyze/batch": "Batch analyze multiple entities",
            "GET /dna/models": "Get archetype definitions",
            "GET /dna/features": "Get feature descriptions",
            "GET /dna/health": "Health check",
            "GET /dna/": "API information"
        },
        "archetypes": dna_analyzer.archetypes,
        "features_count": len(dna_analyzer.get_feature_descriptions()),
        "timestamp": datetime.utcnow().isoformat()
    }

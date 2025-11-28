"""
Behavioral DNA™ API - FastAPI router for DNA analysis endpoints.
Provides REST API access to behavioral DNA analysis capabilities.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body, Path
from pydantic import BaseModel, Field
from datetime import datetime

from .dna_analyzer import DNAAnalyzer
from .entity_history_builder import EntityHistoryBuilder


router = APIRouter()

dna_analyzer = DNAAnalyzer()

entity_history_builder = EntityHistoryBuilder(window_minutes=1440)



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


class AnalyzeAddressRequest(BaseModel):
    """Request model for entity address DNA analysis."""
    entity_address: str = Field(
        ...,
        description="Entity address to analyze",
        min_length=1
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity_address": "0xABC123..."
            }
        }



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


@router.post("/analyze/address", tags=["Behavioral DNA"])
async def analyze_entity_address(request: AnalyzeAddressRequest = Body(...)):
    """
    Analyze entity behavioral DNA from EntityHistoryBuilder.
    
    Uses the singleton EntityHistoryBuilder to retrieve and analyze entity history.
    The history builder maintains a rolling 24-hour window of events.
    
    **Args:**
    - entity_address: Entity address to analyze
    
    **Returns:**
    - Full DNA analysis including archetype, DNA code, features, and signals
    - Returns error if no history found for the entity
    
    **Note:**
    Events must be added to the EntityHistoryBuilder via the add_event() method
    before this endpoint can analyze them. This is typically done by the
    intelligence alert system.
    """
    try:
        print(f"[BehavioralDNA API] Received analyze address request for {request.entity_address[:10]}...")
        
        if not request.entity_address:
            raise HTTPException(
                status_code=400,
                detail="entity_address cannot be empty"
            )
        
        result = dna_analyzer.analyze_entity_address(
            request.entity_address,
            entity_history_builder
        )
        
        if not result.get('success', False):
            print(f"[BehavioralDNA API] Address analysis failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=404,
                detail=result.get('error', 'No history found for entity')
            )
        
        print(f"[BehavioralDNA API] Address analysis successful: {result['archetype']} ({result['dna_code']})")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[BehavioralDNA API] Error in analyze address endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/history/{entity_address}", tags=["Behavioral DNA"])
async def get_entity_history(
    entity_address: str = Path(..., description="Entity address to retrieve history for")
):
    """
    Get entity history and statistics from EntityHistoryBuilder.
    
    Returns the complete event history and computed statistics for an entity
    from the singleton EntityHistoryBuilder's rolling 24-hour window.
    
    **Args:**
    - entity_address: Entity address to retrieve history for
    
    **Returns:**
    - address: Entity address
    - events: List of enriched events with flags and metadata
    - stats: Computed statistics (total_events, burstiness, anomaly_rate, etc.)
    - timestamp: Current timestamp
    
    **Event Enrichments:**
    - age_minutes: Age of event in minutes
    - delta_from_last_event: Time since previous event (minutes)
    - severity_score: Numeric severity (0.0-1.0)
    - cross_chain_flag: Boolean indicating chain switch
    - token_switch_flag: Boolean indicating token switch
    - burst_activity_flag: Boolean indicating burst activity
    - anomaly_flag: Boolean indicating anomalous behavior
    
    **Statistics:**
    - total_events: Total number of events
    - avg_delta: Average time between events (minutes)
    - max_delta: Maximum time between events (minutes)
    - burstiness_index: Coefficient of variation in event timing
    - cross_chain_frequency: Frequency of chain switches
    - token_diversity: Number of unique tokens
    - avg_severity: Average severity score
    - anomaly_rate: Proportion of anomalous events
    - active_period_score: Events per hour over time span
    """
    try:
        print(f"[BehavioralDNA API] Fetching history for {entity_address[:10]}...")
        
        if not entity_address:
            raise HTTPException(
                status_code=400,
                detail="entity_address cannot be empty"
            )
        
        summary = entity_history_builder.summarize_entity(entity_address)
        
        if not summary.get('success', False):
            print(f"[BehavioralDNA API] History retrieval failed: {summary.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=404,
                detail=summary.get('error', 'No history found for entity')
            )
        
        print(f"[BehavioralDNA API] History retrieved: {len(summary['events'])} events")
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[BehavioralDNA API] Error in history endpoint: {e}")
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
            "POST /dna/analyze/address": "Analyze entity by address (from history builder)",
            "GET /dna/history/{entity_address}": "Get entity history and statistics",
            "GET /dna/models": "Get archetype definitions",
            "GET /dna/features": "Get feature descriptions",
            "GET /dna/health": "Health check",
            "GET /dna/": "API information"
        },
        "archetypes": dna_analyzer.archetypes,
        "features_count": len(dna_analyzer.get_feature_descriptions()),
        "timestamp": datetime.utcnow().isoformat()
    }

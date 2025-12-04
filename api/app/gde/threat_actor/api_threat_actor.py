"""
Threat Actor API - FastAPI router for threat actor profiling
3 endpoints for actor profiling, health check, and API info
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .threat_actor_profiler import ThreatActorProfiler
from .threat_actor_schema import ThreatActorInput, ThreatActorProfile

logger = logging.getLogger(__name__)

router = APIRouter()

profiler = ThreatActorProfiler()


class ProfileRequest(BaseModel):
    """Request model for threat actor profiling"""
    event: Optional[Dict[str, Any]] = Field(None, description="Event data")
    entity: Optional[Dict[str, Any]] = Field(None, description="Entity data")
    chain: Optional[Dict[str, Any]] = Field(None, description="Chain data")
    token: Optional[Dict[str, Any]] = Field(None, description="Token data")
    history: Optional[Dict[str, Any]] = Field(None, description="Entity history data")
    dna: Optional[Dict[str, Any]] = Field(None, description="Behavioral DNA data")
    correlation: Optional[Dict[str, Any]] = Field(None, description="Correlation data")
    fusion: Optional[Dict[str, Any]] = Field(None, description="Fusion intelligence data")
    radar: Optional[Dict[str, Any]] = Field(None, description="Global radar data")
    prediction: Optional[Dict[str, Any]] = Field(None, description="Prediction data")

class ProfileResponse(BaseModel):
    """Response model for threat actor profile"""
    success: bool
    actor_type: Optional[str] = None
    risk_level: Optional[str] = None
    confidence: Optional[float] = None
    indicators: Optional[List[str]] = None
    behavioral_traits: Optional[List[str]] = None
    coordination_traits: Optional[List[str]] = None
    chain_traits: Optional[List[str]] = None
    manipulation_traits: Optional[List[str]] = None
    summary: Optional[str] = None
    recommendations: Optional[List[str]] = None
    scores: Optional[Dict[str, float]] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Response model for health check"""
    success: bool
    status: str
    engine: str
    timestamp: str
    actor_types: int


@router.post("/profile", response_model=ProfileResponse, tags=["Threat Actor"])
async def profile_threat_actor(request: ProfileRequest):
    """
    Generate comprehensive threat actor profile
    
    **Threat Actor Profiler™**
    
    Classifies entities into 9 threat actor types based on multi-domain intelligence:
    
    **9 Actor Types:**
    
    1. **WHALE** 🟪
       - Large-value, slow-moving, high-impact
       - Characteristics: High transaction values, low frequency, significant holdings
       - Risk: Moderate (market impact potential)
    
    2. **PREDATOR** 🔴
       - Aggressive manipulation, high DNA risk, rapid bursts
       - Characteristics: High aggressiveness, burst patterns, manipulation tactics
       - Risk: Critical (active manipulation)
    
    3. **SYNDICATE** 🟦
       - Multi-entity cluster with high correlation
       - Characteristics: Coordinated operations, cluster membership, synchronized timing
       - Risk: Critical (coordinated manipulation)
    
    4. **INSIDER** 🟨
       - Low activity but high timing accuracy
       - Characteristics: Information asymmetry, pre-event positioning, timing advantage
       - Risk: High (regulatory concerns)
    
    5. **COORDINATED ACTOR** 🟧
       - Moderate correlation + moderate manipulation
       - Characteristics: Balanced coordination, moderate risk indicators
       - Risk: Moderate (potential escalation)
    
    6. **GHOST** 🟩
       - Dormant → sudden high-level burst
       - Characteristics: Extended dormancy, sudden activation, unpredictable
       - Risk: High (unpredictability)
    
    7. **MANIPULATOR** 🔶
       - Pump/dump patterns, volatility forcing
       - Characteristics: Manipulation flags, price distortion, market impact
       - Risk: Critical (market integrity)
    
    8. **ARBITRAGE BOT** 🔷
       - Precision, fast timing, narrow volatility bands
       - Characteristics: High frequency, multi-chain, automated strategies
       - Risk: Low (market efficiency)
    
    9. **UNKNOWN ACTOR** ⚫
       - Default fallback for insufficient data
       - Characteristics: Insufficient intelligence for classification
       - Risk: Unknown
    
    **Intelligence Domains Analyzed:**
    - Behavioral DNA (archetype, flags, aggressiveness, burstiness)
    - Entity History (spikes, anomalies, timing advantage)
    - Correlation Engine (cluster size, coordination score)
    - Fusion Engine (risk score, manipulation mode)
    - Global Radar (heatmap risk, chain pressure)
    - Prediction Engine (risk score, manipulation probability)
    
    **Output:**
    - Actor type classification with confidence score
    - Risk level assessment (CRITICAL/HIGH/MODERATE/LOW/MINIMAL)
    - Key indicators and behavioral traits
    - Coordination, chain, and manipulation traits
    - Narrative summary (5-10 sentences)
    - Actionable recommendations (3-6 items)
    - Individual actor type scores
    
    **Input Requirements:**
    All fields are optional. The profiler will analyze available intelligence domains
    and classify based on the strongest signals. Minimum recommended: DNA or History data.
    """
    try:
        logger.info("[ThreatActorAPI] Profile request received")
        
        input_data = ThreatActorInput(
            event=request.event,
            entity=request.entity,
            chain=request.chain,
            token=request.token,
            history=request.history,
            dna=request.dna,
            correlation=request.correlation,
            fusion=request.fusion,
            radar=request.radar,
            prediction=request.prediction
        )
        
        profile = profiler.profile_actor(input_data)
        
        logger.info(f"[ThreatActorAPI] Profile generated: {profile.actor_type}")
        
        return ProfileResponse(
            success=True,
            actor_type=profile.actor_type,
            risk_level=profile.risk_level,
            confidence=profile.confidence,
            indicators=profile.indicators,
            behavioral_traits=profile.behavioral_traits,
            coordination_traits=profile.coordination_traits,
            chain_traits=profile.chain_traits,
            manipulation_traits=profile.manipulation_traits,
            summary=profile.summary,
            recommendations=profile.recommendations,
            scores=profile.scores,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        
    except Exception as e:
        logger.error(f"[ThreatActorAPI] Error profiling actor: {e}")
        return ProfileResponse(
            success=False,
            error=str(e),
            timestamp=datetime.utcnow().isoformat() + "Z"
        )

@router.get("/health", response_model=HealthResponse, tags=["Threat Actor"])
async def health_check():
    """
    Threat Actor Profiler™ health check
    
    **Returns:**
    - System status
    - Engine name
    - Timestamp
    - Number of supported actor types
    """
    try:
        logger.info("[ThreatActorAPI] Health check")
        
        return HealthResponse(
            success=True,
            status="operational",
            engine="Threat Actor Profiler™",
            timestamp=datetime.utcnow().isoformat() + "Z",
            actor_types=9
        )
        
    except Exception as e:
        logger.error(f"[ThreatActorAPI] Health check error: {e}")
        return HealthResponse(
            success=False,
            status="error",
            engine="Threat Actor Profiler™",
            timestamp=datetime.utcnow().isoformat() + "Z",
            actor_types=9
        )

@router.get("/", tags=["Threat Actor"])
async def api_info():
    """
    Threat Actor Profiler™ API information
    
    **Available Endpoints:**
    - POST /actor/profile - Generate comprehensive threat actor profile
    - GET /actor/health - Health check
    - GET /actor/ - API information
    
    **Supported Actor Types:**
    1. WHALE - Large-value, slow-moving, high-impact
    2. PREDATOR - Aggressive manipulation, rapid bursts
    3. SYNDICATE - Multi-entity cluster coordination
    4. INSIDER - Low activity, high timing accuracy
    5. COORDINATED ACTOR - Moderate coordination + manipulation
    6. GHOST - Dormant → sudden burst
    7. MANIPULATOR - Pump/dump, volatility forcing
    8. ARBITRAGE BOT - Precision, fast timing
    9. UNKNOWN ACTOR - Default fallback
    """
    try:
        logger.info("[ThreatActorAPI] API info request")
        
        return {
            "success": True,
            "api": "Threat Actor Profiler™",
            "version": "1.0.0",
            "description": "Intelligence-driven threat actor classification and profiling",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/actor/profile",
                    "description": "Generate comprehensive threat actor profile",
                    "input_domains": [
                        "event", "entity", "chain", "token", "history",
                        "dna", "correlation", "fusion", "radar", "prediction"
                    ]
                },
                {
                    "method": "GET",
                    "path": "/actor/health",
                    "description": "Health check endpoint"
                },
                {
                    "method": "GET",
                    "path": "/actor/",
                    "description": "API information endpoint"
                }
            ],
            "actor_types": [
                {
                    "type": "WHALE",
                    "emoji": "🟪",
                    "description": "Large-value, slow-moving, high-impact",
                    "risk": "MODERATE"
                },
                {
                    "type": "PREDATOR",
                    "emoji": "🔴",
                    "description": "Aggressive manipulation, rapid bursts",
                    "risk": "CRITICAL"
                },
                {
                    "type": "SYNDICATE",
                    "emoji": "🟦",
                    "description": "Multi-entity cluster coordination",
                    "risk": "CRITICAL"
                },
                {
                    "type": "INSIDER",
                    "emoji": "🟨",
                    "description": "Low activity, high timing accuracy",
                    "risk": "HIGH"
                },
                {
                    "type": "COORDINATED ACTOR",
                    "emoji": "🟧",
                    "description": "Moderate coordination + manipulation",
                    "risk": "MODERATE"
                },
                {
                    "type": "GHOST",
                    "emoji": "🟩",
                    "description": "Dormant → sudden burst",
                    "risk": "HIGH"
                },
                {
                    "type": "MANIPULATOR",
                    "emoji": "🔶",
                    "description": "Pump/dump, volatility forcing",
                    "risk": "CRITICAL"
                },
                {
                    "type": "ARBITRAGE BOT",
                    "emoji": "🔷",
                    "description": "Precision, fast timing",
                    "risk": "LOW"
                },
                {
                    "type": "UNKNOWN ACTOR",
                    "emoji": "⚫",
                    "description": "Default fallback",
                    "risk": "UNKNOWN"
                }
            ],
            "intelligence_domains": [
                "Behavioral DNA",
                "Entity History",
                "Correlation Analysis",
                "Fusion Intelligence",
                "Global Radar",
                "Prediction Models"
            ],
            "features": [
                "9 distinct actor types",
                "Multi-domain intelligence integration",
                "Risk level assessment",
                "Confidence scoring",
                "Behavioral trait extraction",
                "Coordination analysis",
                "Chain-specific traits",
                "Manipulation detection",
                "Narrative summary generation",
                "Actionable recommendations",
                "100% crash-proof operation",
                "Pure Python implementation",
                "Zero external dependencies"
            ],
            "total_endpoints": 3,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"[ThreatActorAPI] API info error: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


@router.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for Threat Actor API"""
    logger.error(f"[ThreatActorAPI] Unhandled exception: {exc}")
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

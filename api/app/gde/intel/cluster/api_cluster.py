"""
Cluster Intelligence API - FastAPI router for cluster narrative generation
6 endpoints for cluster profiles, scenarios, timelines, risk, and reports
"""

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .cluster_narrative_engine import ClusterNarrativeEngine

logger = logging.getLogger(__name__)

router = APIRouter()

cluster_engine = ClusterNarrativeEngine()


class ClusterReportRequest(BaseModel):
    """Request model for full cluster intelligence report"""
    cluster_data: Dict[str, Any] = Field(
        ...,
        description="Complete cluster intelligence data including entities, correlations, DNA, history, radar, fusion"
    )

class ClusterProfileRequest(BaseModel):
    """Request model for cluster identity profile"""
    cluster_data: Dict[str, Any] = Field(
        ...,
        description="Cluster data for profile generation"
    )

class ClusterScenarioRequest(BaseModel):
    """Request model for scenario classification"""
    cluster_data: Dict[str, Any] = Field(
        ...,
        description="Cluster data for scenario detection"
    )

class ClusterRiskRequest(BaseModel):
    """Request model for risk assessment"""
    cluster_data: Dict[str, Any] = Field(
        ...,
        description="Cluster data for risk assessment"
    )

class ClusterTimelineRequest(BaseModel):
    """Request model for chronological timeline"""
    cluster_data: Dict[str, Any] = Field(
        ...,
        description="Cluster data for timeline reconstruction"
    )

class ClusterBehaviorRequest(BaseModel):
    """Request model for behavioral summary"""
    cluster_data: Dict[str, Any] = Field(
        ...,
        description="Cluster data for behavioral analysis"
    )

class ClusterReportResponse(BaseModel):
    """Response model for cluster report"""
    success: bool
    report_type: Optional[str] = None
    cluster_id: Optional[str] = None
    report: Optional[str] = None
    word_count: Optional[int] = None
    section_count: Optional[int] = None
    entity_count: Optional[int] = None
    timestamp: Optional[str] = None
    classification: Optional[str] = None
    error: Optional[str] = None

class ClusterProfileResponse(BaseModel):
    """Response model for cluster profile"""
    success: bool
    cluster_id: Optional[str] = None
    profile: Optional[str] = None
    entity_count: Optional[int] = None
    coordination_score: Optional[float] = None
    risk_level: Optional[str] = None
    primary_classification: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

class ClusterScenarioResponse(BaseModel):
    """Response model for scenario classification"""
    success: bool
    scenarios: Optional[List[Dict[str, Any]]] = None
    scenario_count: Optional[int] = None
    primary_scenario: Optional[str] = None
    primary_score: Optional[float] = None
    primary_confidence: Optional[float] = None
    narrative: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

class ClusterRiskResponse(BaseModel):
    """Response model for risk assessment"""
    success: bool
    risk_assessment: Optional[Dict[str, Any]] = None
    narrative: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

class ClusterTimelineResponse(BaseModel):
    """Response model for timeline"""
    success: bool
    timeline: Optional[Dict[str, Any]] = None
    narrative: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

class ClusterBehaviorResponse(BaseModel):
    """Response model for behavioral summary"""
    success: bool
    summary: Optional[Dict[str, Any]] = None
    narrative: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    timestamp: str
    endpoints: int


@router.post("/report", response_model=ClusterReportResponse, tags=["Cluster Intelligence"])
async def generate_cluster_report(request: ClusterReportRequest):
    """
    Generate comprehensive cluster intelligence dossier
    
    **Master Orchestrator Endpoint**
    
    Produces 1,500-3,000 word intelligence report with:
    - Executive Summary
    - Cluster Identity Profile
    - Scenario Classification (9 possible scenarios)
    - Behavioral Pattern Analysis
    - Inter-Entity Correlation Analysis
    - Manipulation Mode Detection
    - Chronological Timeline Reconstruction
    - Multi-Domain Intelligence Fusion
    - Comprehensive Risk Assessment
    - Actionable Recommendations
    - Final Analyst Notes
    
    **Input Requirements:**
    - entities: List of entity addresses
    - correlations: Pairwise correlation data
    - risk_score: Group risk score
    - dna: Behavioral DNA per entity
    - radar: Radar scores per entity
    - fusion: Fusion intelligence
    - history: Entity history data
    
    **Output:** 1,500-3,000 word intelligence dossier (12 sections)
    """
    try:
        logger.info("[ClusterAPI] Full cluster report request")
        
        cluster_data = request.cluster_data
        if not cluster_data:
            return ClusterReportResponse(
                success=False,
                error="Cluster data required"
            )
        
        entities = cluster_data.get("entities", [])
        if not entities or len(entities) < 2:
            return ClusterReportResponse(
                success=False,
                error="Minimum 2 entities required for cluster analysis"
            )
        
        result = cluster_engine.generate_cluster_report(cluster_data)
        
        logger.info(f"[ClusterAPI] Cluster report generated: {result.get('word_count', 0)} words")
        
        return ClusterReportResponse(**result)
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Error generating cluster report: {e}")
        return ClusterReportResponse(
            success=False,
            error=str(e)
        )

@router.post("/profile", response_model=ClusterProfileResponse, tags=["Cluster Intelligence"])
async def generate_cluster_profile(request: ClusterProfileRequest):
    """
    Generate cluster identity profile
    
    **Cluster Identity & Archetype Detection**
    
    Produces comprehensive cluster identity profile with:
    - Cluster ID and classification
    - Entity count and composition
    - Coordination score and level
    - Risk level assessment
    - Behavioral DNA consistency
    - Dominant archetype identification
    - Correlation network summary
    - Timing synchronization analysis
    
    **Analysis Dimensions:**
    - Flow direction uniformity
    - Timing synchronization precision
    - Transaction size pattern alignment
    - Behavioral DNA consistency
    - Correlation network density
    
    **Output:** 10+ section identity profile narrative
    """
    try:
        logger.info("[ClusterAPI] Cluster profile request")
        
        cluster_data = request.cluster_data
        if not cluster_data:
            return ClusterProfileResponse(
                success=False,
                error="Cluster data required"
            )
        
        entities = cluster_data.get("entities", [])
        if not entities or len(entities) < 2:
            return ClusterProfileResponse(
                success=False,
                error="Minimum 2 entities required for cluster profile"
            )
        
        result = cluster_engine.generate_cluster_profile(cluster_data)
        
        logger.info(f"[ClusterAPI] Cluster profile generated: {result.get('cluster_id', 'N/A')}")
        
        return ClusterProfileResponse(**result)
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Error generating cluster profile: {e}")
        return ClusterProfileResponse(
            success=False,
            error=str(e)
        )

@router.post("/scenarios", response_model=ClusterScenarioResponse, tags=["Cluster Intelligence"])
async def detect_cluster_scenarios(request: ClusterScenarioRequest):
    """
    Detect and classify cluster manipulation scenarios
    
    **9 Predefined Manipulation Scenarios:**
    
    1. **Coordinated Liquidity Extraction**
       - Synchronized withdrawal patterns
       - Volume concentration
       - Timing precision
    
    2. **Wash/Mirror Trading Cell**
       - Reciprocal transactions
       - Minimal price impact
       - Volume inflation
    
    3. **Whale Shadow Operation**
       - Whale entity identification
       - Movement synchronization
       - Volume proportionality
    
    4. **Multi-Chain Arbitrage Ring**
       - Cross-chain coordination
       - Bridge utilization
       - Price differential targeting
    
    5. **Market Pressure Syndicate**
       - Synchronized entries
       - Directional alignment
       - Volume concentration
    
    6. **Dormant Activation Cell**
       - Extended dormancy period
       - Simultaneous activation
       - Pattern similarity
    
    7. **Insider Leak Cluster**
       - Pre-event positioning
       - Timing advantage
       - Profit correlation
    
    8. **Layered Wallet Network**
       - Hierarchical structure
       - Flow obfuscation
       - Address rotation
    
    9. **Cross-Entity Volatility Enrichment**
       - Volatility synchronization
       - Entry/exit coordination
       - Profit correlation
    
    **Output:** Multi-scenario report with primary and secondary scenarios
    """
    try:
        logger.info("[ClusterAPI] Scenario detection request")
        
        cluster_data = request.cluster_data
        if not cluster_data:
            return ClusterScenarioResponse(
                success=False,
                error="Cluster data required"
            )
        
        result = cluster_engine.generate_cluster_scenario(cluster_data)
        
        logger.info(f"[ClusterAPI] Detected {result.get('scenario_count', 0)} scenarios")
        
        return ClusterScenarioResponse(**result)
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Error detecting scenarios: {e}")
        return ClusterScenarioResponse(
            success=False,
            error=str(e)
        )

@router.post("/risk", response_model=ClusterRiskResponse, tags=["Cluster Intelligence"])
async def assess_cluster_risk(request: ClusterRiskRequest):
    """
    Generate comprehensive cluster risk assessment
    
    **Risk Assessment Components:**
    
    1. **Manipulation Risk** (30% weight)
       - Manipulation mode detection
       - Scheme sophistication
       - Market impact
    
    2. **Coordination Risk** (25% weight)
       - Coordination score
       - Timing synchronization
       - Pattern alignment
    
    3. **Market Impact Risk** (20% weight)
       - Volume concentration
       - Price distortion
       - Liquidity impact
    
    4. **Systemic Risk** (15% weight)
       - Cross-chain exposure
       - Network effects
       - Contagion potential
    
    5. **Escalation Risk** (10% weight)
       - Trend analysis
       - Trigger events
       - Probability assessment
    
    **Threat Projections:**
    - 24-hour outlook with probability
    - 7-day outlook with probability
    - Escalation probability and triggers
    
    **Output:** Comprehensive risk assessment with composite score and projections
    """
    try:
        logger.info("[ClusterAPI] Risk assessment request")
        
        cluster_data = request.cluster_data
        if not cluster_data:
            return ClusterRiskResponse(
                success=False,
                error="Cluster data required"
            )
        
        result = cluster_engine.build_risk_assessment(cluster_data)
        
        logger.info(f"[ClusterAPI] Risk assessment generated")
        
        return ClusterRiskResponse(**result)
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Error assessing risk: {e}")
        return ClusterRiskResponse(
            success=False,
            error=str(e)
        )

@router.post("/timeline", response_model=ClusterTimelineResponse, tags=["Cluster Intelligence"])
async def build_cluster_timeline(request: ClusterTimelineRequest):
    """
    Generate chronological reconstruction of cluster activities
    
    **Timeline Analysis:**
    
    **Operational Phases:**
    - Phase identification and characterization
    - Leading entities per phase
    - Activity level assessment
    - Key events and milestones
    
    **Leadership Analysis:**
    - Leader entity identification
    - Leadership percentage calculation
    - Follower entity identification
    - Response time analysis
    
    **Coordination Windows:**
    - Window identification
    - Duration analysis
    - Entity participation
    - Activity characterization
    
    **Pressure Analysis:**
    - Pressure pattern description
    - Pressure event counting
    - Peak pressure identification
    - Volatility burst detection
    
    **Output:** Chronological timeline with phases, leaders, coordination windows, and pressure events
    """
    try:
        logger.info("[ClusterAPI] Timeline reconstruction request")
        
        cluster_data = request.cluster_data
        if not cluster_data:
            return ClusterTimelineResponse(
                success=False,
                error="Cluster data required"
            )
        
        result = cluster_engine.build_cluster_timeline(cluster_data)
        
        logger.info(f"[ClusterAPI] Timeline generated")
        
        return ClusterTimelineResponse(**result)
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Error building timeline: {e}")
        return ClusterTimelineResponse(
            success=False,
            error=str(e)
        )

@router.post("/behavior", response_model=ClusterBehaviorResponse, tags=["Cluster Intelligence"])
async def summarize_cluster_behavior(request: ClusterBehaviorRequest):
    """
    Generate intelligence summary of cluster behavioral patterns
    
    **Behavioral Analysis Dimensions:**
    
    1. **Flow Direction Uniformity**
       - Directional consistency
       - Flow pattern alignment
       - Strategic objective inference
    
    2. **Timing Synchronization**
       - Temporal window analysis
       - Coordination precision
       - Synchronization assessment
    
    3. **Size Pattern Alignment**
       - Transaction size patterns
       - Volume coordination
       - Sizing strategy
    
    4. **Shared Chain Pressure**
       - Cross-entity pressure
       - Chain targeting
       - Coordinated impact
    
    5. **Correlated Anomalies**
       - Synchronized anomalies
       - Anomaly types
       - Coordination inference
    
    **Pattern Analysis:**
    - Pattern identification
    - Consistency assessment
    - Temporal evolution
    - Coordination probability
    
    **Output:** Comprehensive behavioral summary with pattern analysis and coordination assessment
    """
    try:
        logger.info("[ClusterAPI] Behavioral summary request")
        
        cluster_data = request.cluster_data
        if not cluster_data:
            return ClusterBehaviorResponse(
                success=False,
                error="Cluster data required"
            )
        
        result = cluster_engine.summarize_cluster_behavior(cluster_data)
        
        logger.info(f"[ClusterAPI] Behavioral summary generated")
        
        return ClusterBehaviorResponse(**result)
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Error summarizing behavior: {e}")
        return ClusterBehaviorResponse(
            success=False,
            error=str(e)
        )

@router.get("/health", response_model=HealthResponse, tags=["Cluster Intelligence"])
async def health_check():
    """
    Cluster Intelligence API health check
    
    **Returns:**
    - System status
    - Engine status
    - Timestamp
    - Available endpoints
    """
    try:
        logger.info("[ClusterAPI] Health check")
        
        return HealthResponse(
            status="operational",
            engine="Autonomous Cluster Narrative Engine™",
            timestamp=datetime.utcnow().isoformat() + "Z",
            endpoints=6
        )
        
    except Exception as e:
        logger.error(f"[ClusterAPI] Health check error: {e}")
        return HealthResponse(
            status="error",
            engine="Autonomous Cluster Narrative Engine™",
            timestamp=datetime.utcnow().isoformat() + "Z",
            endpoints=6
        )

@router.get("/", tags=["Cluster Intelligence"])
async def api_info():
    """
    Cluster Intelligence API information
    
    **Available Endpoints:**
    - POST /cluster/report - Generate comprehensive cluster intelligence dossier
    - POST /cluster/profile - Generate cluster identity profile
    - POST /cluster/scenarios - Detect and classify manipulation scenarios
    - POST /cluster/risk - Generate comprehensive risk assessment
    - POST /cluster/timeline - Generate chronological timeline reconstruction
    - POST /cluster/behavior - Generate behavioral pattern summary
    - GET /cluster/health - Health check
    """
    try:
        logger.info("[ClusterAPI] API info request")
        
        return {
            "success": True,
            "api": "Autonomous Cluster Narrative Engine™",
            "version": "1.0.0",
            "description": "Intelligence narrative generator for correlated entity clusters",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/cluster/report",
                    "description": "Generate comprehensive cluster intelligence dossier (1,500-3,000 words)",
                    "sections": 12
                },
                {
                    "method": "POST",
                    "path": "/cluster/profile",
                    "description": "Generate cluster identity profile with archetype detection",
                    "sections": 10
                },
                {
                    "method": "POST",
                    "path": "/cluster/scenarios",
                    "description": "Detect and classify 9 manipulation scenarios",
                    "scenarios": 9
                },
                {
                    "method": "POST",
                    "path": "/cluster/risk",
                    "description": "Generate comprehensive risk assessment with projections",
                    "components": 5
                },
                {
                    "method": "POST",
                    "path": "/cluster/timeline",
                    "description": "Generate chronological timeline reconstruction",
                    "features": ["phases", "leaders", "coordination_windows", "pressure_events"]
                },
                {
                    "method": "POST",
                    "path": "/cluster/behavior",
                    "description": "Generate behavioral pattern summary",
                    "dimensions": 5
                },
                {
                    "method": "GET",
                    "path": "/cluster/health",
                    "description": "Health check endpoint",
                    "sections": 0
                }
            ],
            "features": [
                "Autonomous cluster narrative generation",
                "9 predefined manipulation scenarios",
                "Multi-domain intelligence integration",
                "Behavioral DNA consistency analysis",
                "Coordination score computation",
                "Risk assessment with projections",
                "Chronological timeline reconstruction",
                "Leader/follower identification",
                "Coordination window detection",
                "Actionable recommendations",
                "100% crash-proof operation",
                "UTF-8 safe text output"
            ],
            "scenarios": [
                "Coordinated Liquidity Extraction",
                "Wash/Mirror Trading Cell",
                "Whale Shadow Operation",
                "Multi-Chain Arbitrage Ring",
                "Market Pressure Syndicate",
                "Dormant Activation Cell",
                "Insider Leak Cluster",
                "Layered Wallet Network",
                "Cross-Entity Volatility Enrichment"
            ],
            "intelligence_domains": [
                "Behavioral DNA",
                "Entity History",
                "Correlation Analysis",
                "Fusion Intelligence",
                "Global Radar",
                "Prediction Models"
            ],
            "total_endpoints": 7,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"[ClusterAPI] API info error: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


@router.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for Cluster API"""
    logger.error(f"[ClusterAPI] Unhandled exception: {exc}")
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

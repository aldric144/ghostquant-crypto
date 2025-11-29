"""
GhostWriter API - FastAPI router for intelligence narrative generation
7 endpoints for entity/token/chain/global reports and briefing packets
"""

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .ghostwriter_engine import GhostWriterEngine

logger = logging.getLogger(__name__)

router = APIRouter()

ghostwriter_engine = GhostWriterEngine()


class EntityReportRequest(BaseModel):
    """Request model for entity report generation"""
    entity_address: str = Field(..., description="Entity address to analyze")
    components: Dict[str, Any] = Field(
        default_factory=dict,
        description="Intelligence components (prediction, dna, history, correlation, fusion, radar)"
    )

class TokenReportRequest(BaseModel):
    """Request model for token report generation"""
    token_symbol: str = Field(..., description="Token symbol to analyze")
    components: Dict[str, Any] = Field(
        default_factory=dict,
        description="Token analysis components"
    )

class ChainReportRequest(BaseModel):
    """Request model for chain report generation"""
    chain_name: str = Field(..., description="Chain name to analyze")
    components: Dict[str, Any] = Field(
        default_factory=dict,
        description="Chain analysis components"
    )

class GlobalReportRequest(BaseModel):
    """Request model for global risk report generation"""
    global_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Global intelligence data (radar, fusion, correlation)"
    )

class EventSummaryRequest(BaseModel):
    """Request model for event summary generation"""
    event: Dict[str, Any] = Field(..., description="Event data")
    intelligence: Dict[str, Any] = Field(
        default_factory=dict,
        description="Related intelligence data"
    )

class BriefingPacketRequest(BaseModel):
    """Request model for briefing packet generation"""
    input_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="All intelligence data for briefing"
    )

class ReportResponse(BaseModel):
    """Response model for report generation"""
    success: bool
    report_type: Optional[str] = None
    report: Optional[str] = None
    word_count: Optional[int] = None
    section_count: Optional[int] = None
    timestamp: Optional[str] = None
    classification: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    timestamp: str
    endpoints: int


@router.post("/entity", response_model=ReportResponse, tags=["GhostWriter"])
async def generate_entity_report(request: EntityReportRequest):
    """
    Generate comprehensive entity intelligence report
    
    **Report Sections:**
    - Executive Summary
    - Entity Identity Profile
    - Behavioral DNA Analysis
    - Risk Elevation Pathway
    - Recent Activity Timeline
    - Manipulation Mode Reconstruction
    - Correlation Network Mapping
    - Prediction Analysis
    - Fusion Intelligence
    - Global Radar Positioning
    - Threat Projection
    - Confidence Assessment
    - Analyst Recommendations
    - Final Risk Classification
    
    **Output:** 1,500-3,000 word intelligence report
    """
    try:
        logger.info(f"[GhostWriterAPI] Entity report request: {request.entity_address}")
        
        if not request.entity_address or len(request.entity_address) < 10:
            return ReportResponse(
                success=False,
                report_type="entity",
                error="Invalid entity address"
            )
        
        result = ghostwriter_engine.build_entity_report(
            entity_address=request.entity_address,
            components=request.components
        )
        
        logger.info(f"[GhostWriterAPI] Entity report generated: {result.get('word_count', 0)} words")
        
        return ReportResponse(**result)
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Error generating entity report: {e}")
        return ReportResponse(
            success=False,
            report_type="entity",
            error=str(e)
        )

@router.post("/token", response_model=ReportResponse, tags=["GhostWriter"])
async def generate_token_report(request: TokenReportRequest):
    """
    Generate comprehensive token intelligence report
    
    **Report Sections:**
    - Token Overview
    - Volatility Analysis
    - Manipulation Indicators
    - Holder Analysis
    - Trading Pattern Analysis
    - Risk Assessment
    - Recommendations
    
    **Output:** 800-1,500 word intelligence report
    """
    try:
        logger.info(f"[GhostWriterAPI] Token report request: {request.token_symbol}")
        
        if not request.token_symbol or len(request.token_symbol) < 2:
            return ReportResponse(
                success=False,
                report_type="token",
                error="Invalid token symbol"
            )
        
        result = ghostwriter_engine.build_token_report(
            token_symbol=request.token_symbol,
            components=request.components
        )
        
        logger.info(f"[GhostWriterAPI] Token report generated: {result.get('word_count', 0)} words")
        
        return ReportResponse(**result)
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Error generating token report: {e}")
        return ReportResponse(
            success=False,
            report_type="token",
            error=str(e)
        )

@router.post("/chain", response_model=ReportResponse, tags=["GhostWriter"])
async def generate_chain_report(request: ChainReportRequest):
    """
    Generate comprehensive chain intelligence report
    
    **Report Sections:**
    - Chain Overview
    - Manipulation Landscape
    - Network Health Assessment
    - Threat Landscape
    - Activity Analysis
    - Recommendations
    
    **Output:** 1,000-2,000 word intelligence report
    """
    try:
        logger.info(f"[GhostWriterAPI] Chain report request: {request.chain_name}")
        
        if not request.chain_name or len(request.chain_name) < 2:
            return ReportResponse(
                success=False,
                report_type="chain",
                error="Invalid chain name"
            )
        
        result = ghostwriter_engine.build_chain_report(
            chain_name=request.chain_name,
            components=request.components
        )
        
        logger.info(f"[GhostWriterAPI] Chain report generated: {result.get('word_count', 0)} words")
        
        return ReportResponse(**result)
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Error generating chain report: {e}")
        return ReportResponse(
            success=False,
            report_type="chain",
            error=str(e)
        )

@router.post("/global", response_model=ReportResponse, tags=["GhostWriter"])
async def generate_global_risk_report(request: GlobalReportRequest):
    """
    Generate comprehensive global risk intelligence report
    
    **Report Sections:**
    - Executive Summary
    - Global Risk Overview
    - Cross-Chain Analysis
    - Threat Actor Landscape
    - Systemic Risk Assessment
    - Manipulation Network Analysis
    - Global Trend Analysis
    - Strategic Recommendations
    
    **Output:** 2,000-3,000 word intelligence report
    """
    try:
        logger.info("[GhostWriterAPI] Global risk report request")
        
        if not request.global_data:
            logger.warning("[GhostWriterAPI] Empty global data, using defaults")
        
        result = ghostwriter_engine.build_global_risk_report(
            global_data=request.global_data
        )
        
        logger.info(f"[GhostWriterAPI] Global report generated: {result.get('word_count', 0)} words")
        
        return ReportResponse(**result)
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Error generating global report: {e}")
        return ReportResponse(
            success=False,
            report_type="global",
            error=str(e)
        )

@router.post("/event", response_model=ReportResponse, tags=["GhostWriter"])
async def generate_event_summary(request: EventSummaryRequest):
    """
    Generate short tactical event summary
    
    **Output:** 5-10 line tactical summary
    
    **Includes:**
    - Event classification
    - Situation overview
    - Entities involved
    - Impact assessment
    - Immediate actions
    - Follow-up required
    """
    try:
        logger.info("[GhostWriterAPI] Event summary request")
        
        if not request.event:
            return ReportResponse(
                success=False,
                error="Event data required"
            )
        
        result = ghostwriter_engine.summarize_event(
            event=request.event,
            intelligence=request.intelligence
        )
        
        logger.info("[GhostWriterAPI] Event summary generated")
        
        if result.get("success"):
            return ReportResponse(
                success=True,
                report_type="event",
                report=result.get("summary", ""),
                word_count=result.get("word_count", 0),
                timestamp=result.get("timestamp", "")
            )
        else:
            return ReportResponse(
                success=False,
                report_type="event",
                error=result.get("error", "Unknown error")
            )
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Error generating event summary: {e}")
        return ReportResponse(
            success=False,
            report_type="event",
            error=str(e)
        )

@router.post("/briefing", response_model=ReportResponse, tags=["GhostWriter"])
async def generate_briefing_packet(request: BriefingPacketRequest):
    """
    Generate comprehensive intelligence briefing packet
    
    **Briefing Sections:**
    - Executive Summary
    - Key Findings
    - Intelligence Sections (10+)
    - Risk Tables
    - Entity Correlation Notes
    - Volatility Outlook
    - Final Recommendations
    - Action Points
    
    **Output:** 3,000+ word strategic briefing
    """
    try:
        logger.info("[GhostWriterAPI] Briefing packet request")
        
        if not request.input_data:
            logger.warning("[GhostWriterAPI] Empty input data, using defaults")
        
        result = ghostwriter_engine.generate_briefing_packet(
            input_data=request.input_data
        )
        
        logger.info(f"[GhostWriterAPI] Briefing packet generated: {result.get('word_count', 0)} words")
        
        if result.get("success"):
            return ReportResponse(
                success=True,
                report_type="briefing",
                report=result.get("briefing", ""),
                word_count=result.get("word_count", 0),
                timestamp=result.get("timestamp", ""),
                classification=result.get("classification", "")
            )
        else:
            return ReportResponse(
                success=False,
                report_type="briefing",
                error=result.get("error", "Unknown error")
            )
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Error generating briefing packet: {e}")
        return ReportResponse(
            success=False,
            report_type="briefing",
            error=str(e)
        )

@router.get("/health", response_model=HealthResponse, tags=["GhostWriter"])
async def health_check():
    """
    GhostWriter API health check
    
    **Returns:**
    - System status
    - Engine status
    - Timestamp
    - Available endpoints
    """
    try:
        logger.info("[GhostWriterAPI] Health check")
        
        return HealthResponse(
            status="operational",
            engine="GhostWriter AI Narrative Engine™",
            timestamp=datetime.utcnow().isoformat() + "Z",
            endpoints=7
        )
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] Health check error: {e}")
        return HealthResponse(
            status="error",
            engine="GhostWriter AI Narrative Engine™",
            timestamp=datetime.utcnow().isoformat() + "Z",
            endpoints=7
        )

@router.get("/", tags=["GhostWriter"])
async def api_info():
    """
    GhostWriter API information
    
    **Available Endpoints:**
    - POST /gw/entity - Generate entity intelligence report
    - POST /gw/token - Generate token intelligence report
    - POST /gw/chain - Generate chain intelligence report
    - POST /gw/global - Generate global risk report
    - POST /gw/event - Generate tactical event summary
    - POST /gw/briefing - Generate intelligence briefing packet
    - GET /gw/health - Health check
    """
    try:
        logger.info("[GhostWriterAPI] API info request")
        
        return {
            "success": True,
            "api": "GhostWriter AI Narrative Engine™",
            "version": "1.0.0",
            "description": "Government-grade intelligence narrative generator",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/gw/entity",
                    "description": "Generate entity intelligence report (1,500-3,000 words)",
                    "sections": 15
                },
                {
                    "method": "POST",
                    "path": "/gw/token",
                    "description": "Generate token intelligence report (800-1,500 words)",
                    "sections": 7
                },
                {
                    "method": "POST",
                    "path": "/gw/chain",
                    "description": "Generate chain intelligence report (1,000-2,000 words)",
                    "sections": 6
                },
                {
                    "method": "POST",
                    "path": "/gw/global",
                    "description": "Generate global risk report (2,000-3,000 words)",
                    "sections": 8
                },
                {
                    "method": "POST",
                    "path": "/gw/event",
                    "description": "Generate tactical event summary (5-10 lines)",
                    "sections": 1
                },
                {
                    "method": "POST",
                    "path": "/gw/briefing",
                    "description": "Generate intelligence briefing packet (3,000+ words)",
                    "sections": 10
                },
                {
                    "method": "GET",
                    "path": "/gw/health",
                    "description": "Health check endpoint",
                    "sections": 0
                }
            ],
            "features": [
                "Government-grade intelligence reports",
                "Multi-domain intelligence fusion",
                "Behavioral DNA analysis integration",
                "Predictive intelligence assessment",
                "Cross-entity correlation analysis",
                "Global radar positioning",
                "Threat projection timelines",
                "Analyst recommendations",
                "100% crash-proof operation",
                "UTF-8 safe text output"
            ],
            "report_types": [
                "entity",
                "token",
                "chain",
                "global",
                "event",
                "briefing"
            ],
            "total_endpoints": 7,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"[GhostWriterAPI] API info error: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


@router.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for GhostWriter API"""
    logger.error(f"[GhostWriterAPI] Unhandled exception: {exc}")
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

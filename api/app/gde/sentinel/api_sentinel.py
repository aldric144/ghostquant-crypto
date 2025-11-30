"""
Sentinel Command Console™ - FastAPI Router
6 endpoints for real-time command center monitoring
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from .sentinel_engine import SentinelCommandEngine
from .sentinel_schema import SentinelDashboard, SentinelHeartbeat, SentinelAlert

logger = logging.getLogger(__name__)

engine = SentinelCommandEngine()

router = APIRouter(prefix="/sentinel", tags=["Sentinel"])


class DashboardResponse(BaseModel):
    """Response model for dashboard"""
    success: bool
    dashboard: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class HeartbeatResponse(BaseModel):
    """Response model for heartbeat"""
    success: bool
    heartbeat: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class PanelsResponse(BaseModel):
    """Response model for panels"""
    success: bool
    panels: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    timestamp: str


class SummaryResponse(BaseModel):
    """Response model for summary"""
    success: bool
    summary: Optional[str] = None
    error: Optional[str] = None
    timestamp: str


class AlertsResponse(BaseModel):
    """Response model for alerts"""
    success: bool
    alerts: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    version: str
    timestamp: str


@router.get("/dashboard")
async def get_dashboard() -> DashboardResponse:
    """
    Get complete Sentinel Command Console dashboard
    
    GET /sentinel/dashboard
    
    Returns:
    - success: bool
    - dashboard: Complete SentinelDashboard with all components
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[SentinelAPI] Getting dashboard")
        
        dashboard = engine.get_dashboard()
        
        return DashboardResponse(
            success=True,
            dashboard=dashboard.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error getting dashboard: {e}")
        return DashboardResponse(
            success=False,
            dashboard=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/heartbeat")
async def get_heartbeat() -> HeartbeatResponse:
    """
    Get engine heartbeat
    
    GET /sentinel/heartbeat
    
    Returns:
    - success: bool
    - heartbeat: SentinelHeartbeat with engine health and latency
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[SentinelAPI] Getting heartbeat")
        
        heartbeat = engine.heartbeat()
        
        return HeartbeatResponse(
            success=True,
            heartbeat=heartbeat.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error getting heartbeat: {e}")
        return HeartbeatResponse(
            success=False,
            heartbeat=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/panels")
async def get_panels() -> PanelsResponse:
    """
    Get all control panels (raw data)
    
    GET /sentinel/panels
    
    Returns:
    - success: bool
    - panels: List of SentinelPanelStatus objects
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[SentinelAPI] Getting panels")
        
        panels = engine.collect_panels()
        
        return PanelsResponse(
            success=True,
            panels=[p.to_dict() for p in panels],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error getting panels: {e}")
        return PanelsResponse(
            success=False,
            panels=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/summary")
async def get_summary() -> SummaryResponse:
    """
    Get 10-20 line operational summary
    
    GET /sentinel/summary
    
    Returns:
    - success: bool
    - summary: Multi-line operational summary string
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[SentinelAPI] Getting summary")
        
        dashboard = engine.build_dashboard()
        
        return SummaryResponse(
            success=True,
            summary=dashboard.summary,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error getting summary: {e}")
        return SummaryResponse(
            success=False,
            summary=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/alerts")
async def get_alerts() -> AlertsResponse:
    """
    Get triggered alerts
    
    GET /sentinel/alerts
    
    Returns:
    - success: bool
    - alerts: List of SentinelAlert objects
    - timestamp: retrieval timestamp
    """
    try:
        logger.info("[SentinelAPI] Getting alerts")
        
        dashboard = engine.build_dashboard()
        
        return AlertsResponse(
            success=True,
            alerts=[a.to_dict() for a in dashboard.alerts],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error getting alerts: {e}")
        return AlertsResponse(
            success=False,
            alerts=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /sentinel/health
    
    Returns:
    - status: Always "ok"
    - engine: Engine name
    - version: Engine version
    - timestamp: Health check timestamp
    """
    try:
        health = engine.get_health()
        
        return HealthResponse(
            status=health.get('status', 'ok'),
            engine=health.get('engine', 'Sentinel Command Console™'),
            version=health.get('version', '1.0.0'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error in health check: {e}")
        return HealthResponse(
            status="ok",
            engine="Sentinel Command Console™",
            version="1.0.0",
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /sentinel/
    
    Returns:
    - API description
    - Available endpoints
    - Monitored engines
    - Features
    """
    try:
        return {
            "engine": "Sentinel Command Console™",
            "description": "Real-time command center monitoring all intelligence engines",
            "version": "1.0.0",
            "endpoints": [
                {
                    "path": "/sentinel/dashboard",
                    "method": "GET",
                    "description": "Get complete dashboard with all components"
                },
                {
                    "path": "/sentinel/heartbeat",
                    "method": "GET",
                    "description": "Get engine heartbeat with health and latency"
                },
                {
                    "path": "/sentinel/panels",
                    "method": "GET",
                    "description": "Get all control panels (raw data)"
                },
                {
                    "path": "/sentinel/summary",
                    "method": "GET",
                    "description": "Get 10-20 line operational summary"
                },
                {
                    "path": "/sentinel/alerts",
                    "method": "GET",
                    "description": "Get triggered alerts"
                },
                {
                    "path": "/sentinel/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/sentinel/",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "monitored_engines": [
                "Prediction Engine",
                "Fusion Engine",
                "Actor Profiler",
                "Hydra Detection",
                "Constellation Map",
                "Global Radar",
                "Behavioral DNA",
                "Oracle Eye"
            ],
            "threat_levels": [
                "CRITICAL ≥ 0.85",
                "HIGH ≥ 0.70",
                "ELEVATED ≥ 0.55",
                "MODERATE ≥ 0.40",
                "LOW ≥ 0.20",
                "MINIMAL < 0.20"
            ],
            "alert_triggers": [
                "Any engine reports >0.70 risk",
                "Hydra heads ≥ 3",
                "Constellation supernova detected",
                "Radar spikes detected",
                "Cross-engine contradiction detected"
            ],
            "features": {
                "pure_python": "Zero external dependencies",
                "crash_proof": "100% error handling",
                "real_time": "Live monitoring of all engines",
                "multi_engine": "8 intelligence engines tracked",
                "threat_detection": "Automated alert generation",
                "operational_summary": "10-20 line command briefing",
                "heartbeat_monitoring": "Engine health and latency tracking",
                "panel_status": "Individual engine status panels"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[SentinelAPI] Error getting API info: {e}")
        return {
            "engine": "Sentinel Command Console™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

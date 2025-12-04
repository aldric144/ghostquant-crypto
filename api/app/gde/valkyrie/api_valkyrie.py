"""
Valkyrie Threat Warning System™ - FastAPI Router
6 endpoints for autonomous threat alert system
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

from .valkyrie_engine import ValkyrieEngine
from .alert_classifier import AlertClassifier
from .escalation_protocol import EscalationProtocol
from .alert_feed_manager import AlertFeedManager

logger = logging.getLogger(__name__)

valkyrie_engine = ValkyrieEngine()
alert_classifier = AlertClassifier()
escalation_protocol = EscalationProtocol()
alert_feed = AlertFeedManager()

router = APIRouter()


class IngestRequest(BaseModel):
    """Request model for alert ingestion"""
    event: Dict[str, Any]


class IngestResponse(BaseModel):
    """Response model for alert ingestion"""
    success: bool
    alert: Optional[Dict[str, Any]] = None
    message: str
    timestamp: str


class AlertsResponse(BaseModel):
    """Response model for alerts feed"""
    success: bool
    alerts: List[Dict[str, Any]]
    count: int
    escalation: Optional[Dict[str, Any]] = None
    timestamp: str


class EscalationResponse(BaseModel):
    """Response model for escalation status"""
    success: bool
    escalation: Dict[str, Any]
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    engine: str
    alert_count: int
    escalation_level: int
    trigger_types: int
    timestamp: str


@router.post("/valkyrie/ingest")
async def ingest_event(request: IngestRequest) -> IngestResponse:
    """
    Ingest event and generate threat alert if needed
    
    POST /valkyrie/ingest
    
    Request body:
    {
        "event": {
            "entity": {...},
            "prediction": {...},
            "dna": {...},
            "correlation": {...},
            "fusion": {...},
            "radar": {...},
            "actor": {...}
        }
    }
    
    Returns:
    - Alert object if threat detected
    - Success status and message
    """
    try:
        logger.info("[ValkyrieAPI] Ingesting event")
        
        event = request.event
        
        alert = valkyrie_engine.ingest_event(event)
        
        if alert:
            escalation_level = escalation_protocol.evaluate(alert)
            alert.escalation_level = escalation_level
            
            alert_feed.push(alert)
            
            from .valkyrie_schema import ValkyrieTrigger
            trigger = ValkyrieTrigger(
                trigger_type=alert.trigger_type,
                source_domain="multi",
                score=alert.risk_score,
                reason=alert.reason,
                metadata=alert.metadata,
                timestamp=alert.timestamp
            )
            
            classified_type = alert_classifier.classify(trigger)
            alert.trigger_type = classified_type
            
            return IngestResponse(
                success=True,
                alert=alert.to_dict(),
                message=f"Alert generated: {alert.severity_level} severity",
                timestamp=datetime.utcnow().isoformat()
            )
        else:
            return IngestResponse(
                success=True,
                alert=None,
                message="Event processed, no alert generated (below threshold)",
                timestamp=datetime.utcnow().isoformat()
            )
        
    except Exception as e:
        logger.error(f"[ValkyrieAPI] Error ingesting event: {e}")
        return IngestResponse(
            success=False,
            alert=None,
            message=f"Error: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/valkyrie/alerts")
async def get_alerts(limit: Optional[int] = 100) -> AlertsResponse:
    """
    Get recent alerts from feed
    
    GET /valkyrie/alerts?limit=100
    
    Query params:
    - limit: Maximum number of alerts to return (default: 100)
    
    Returns:
    - List of recent alerts
    - Current escalation status
    - Alert count
    """
    try:
        logger.info(f"[ValkyrieAPI] Getting alerts (limit={limit})")
        
        alerts = alert_feed.latest(limit=limit)
        
        escalation = escalation_protocol.get_escalation_summary()
        
        return AlertsResponse(
            success=True,
            alerts=alerts,
            count=len(alerts),
            escalation=escalation.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ValkyrieAPI] Error getting alerts: {e}")
        return AlertsResponse(
            success=False,
            alerts=[],
            count=0,
            escalation=None,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/valkyrie/latest")
async def get_latest_alerts(limit: Optional[int] = 50) -> AlertsResponse:
    """
    Get latest N alerts
    
    GET /valkyrie/latest?limit=50
    
    Query params:
    - limit: Number of latest alerts (default: 50)
    
    Returns:
    - Latest alerts
    - Current escalation status
    """
    try:
        logger.info(f"[ValkyrieAPI] Getting latest alerts (limit={limit})")
        
        alerts = alert_feed.latest(limit=limit)
        escalation = escalation_protocol.get_escalation_summary()
        
        return AlertsResponse(
            success=True,
            alerts=alerts,
            count=len(alerts),
            escalation=escalation.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ValkyrieAPI] Error getting latest alerts: {e}")
        return AlertsResponse(
            success=False,
            alerts=[],
            count=0,
            escalation=None,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/valkyrie/escalation")
async def get_escalation() -> EscalationResponse:
    """
    Get current escalation status
    
    GET /valkyrie/escalation
    
    Returns:
    - Current escalation level (0-4)
    - Level name
    - Summary
    - Alert counts
    """
    try:
        logger.info("[ValkyrieAPI] Getting escalation status")
        
        escalation = escalation_protocol.get_escalation_summary()
        
        return EscalationResponse(
            success=True,
            escalation=escalation.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ValkyrieAPI] Error getting escalation: {e}")
        return EscalationResponse(
            success=False,
            escalation={
                "level": 0,
                "level_name": "Unknown",
                "summary": f"Error: {str(e)}",
                "alert_count_5m": 0,
                "alert_count_15m": 0,
                "critical_alerts": 0,
                "timestamp": datetime.utcnow().isoformat()
            },
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/valkyrie/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /valkyrie/health
    
    Returns:
    - Engine status
    - Alert count
    - Escalation level
    - Trigger types count
    """
    try:
        return HealthResponse(
            status="operational",
            engine="Valkyrie Threat Warning System™",
            alert_count=alert_feed.count(),
            escalation_level=escalation_protocol.get_current_level(),
            trigger_types=len(alert_classifier.get_all_trigger_types()),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[ValkyrieAPI] Error in health check: {e}")
        return HealthResponse(
            status="error",
            engine="Valkyrie Threat Warning System™",
            alert_count=0,
            escalation_level=0,
            trigger_types=0,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/valkyrie/")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /valkyrie/
    
    Returns:
    - API description
    - Available endpoints
    - Trigger types
    - Escalation levels
    """
    try:
        return {
            "engine": "Valkyrie Threat Warning System™",
            "description": "Autonomous real-time threat alert engine with 5-level escalation protocol",
            "version": "1.0.0",
            "endpoints": [
                {
                    "path": "/valkyrie/ingest",
                    "method": "POST",
                    "description": "Ingest event and generate threat alert"
                },
                {
                    "path": "/valkyrie/alerts",
                    "method": "GET",
                    "description": "Get recent alerts from feed"
                },
                {
                    "path": "/valkyrie/latest",
                    "method": "GET",
                    "description": "Get latest N alerts"
                },
                {
                    "path": "/valkyrie/escalation",
                    "method": "GET",
                    "description": "Get current escalation status"
                },
                {
                    "path": "/valkyrie/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/valkyrie/",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "trigger_types": alert_classifier.get_all_trigger_types(),
            "escalation_levels": [
                {"level": 0, "name": "No Threat", "color": "green"},
                {"level": 1, "name": "Elevated", "color": "yellow"},
                {"level": 2, "name": "Serious", "color": "orange"},
                {"level": 3, "name": "Critical", "color": "red"},
                {"level": 4, "name": "Crisis Mode", "color": "purple"}
            ],
            "severity_levels": ["green", "yellow", "orange", "red", "purple"],
            "intelligence_domains": [
                "prediction",
                "dna",
                "correlation",
                "fusion",
                "radar",
                "actor"
            ],
            "features": [
                "Multi-domain intelligence integration",
                "Real-time threat scoring",
                "Autonomous alert generation",
                "5-level escalation protocol",
                "18 trigger type classifications",
                "Rolling 1000-alert FIFO feed",
                "Crash-proof operation"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[ValkyrieAPI] Error getting API info: {e}")
        return {
            "engine": "Valkyrie Threat Warning System™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

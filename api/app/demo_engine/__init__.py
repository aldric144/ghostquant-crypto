"""
Demo Engine Package
Provides demo mode functionality for GhostQuant subscribers.

This package creates thin wrappers around the existing demo infrastructure
to provide dedicated endpoints for the subscriber demo experience.

Endpoints:
- GET /demo/predict - Behavioral prediction demo
- GET /demo/scan - Entity scan demo
- GET /demo/riskmap - Global risk map demo
"""

from .demo_router import demo_engine_router
from .demo_prediction import get_demo_prediction, PredictionDemoResponse
from .demo_entity_scan import get_demo_entity_scan, EntityScanDemoResponse
from .demo_risk_map import get_demo_risk_map, RiskMapDemoResponse

__all__ = [
    "demo_engine_router",
    "get_demo_prediction",
    "get_demo_entity_scan",
    "get_demo_risk_map",
    "PredictionDemoResponse",
    "EntityScanDemoResponse",
    "RiskMapDemoResponse",
]

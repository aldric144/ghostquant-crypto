"""
Constellation Fusion Pipeline Module

A standalone subsystem for wiring all detection engines into the
Global Threat Constellation system.

This module provides:
- fusion_models: Data models for nodes, edges, clusters
- fusion_service: Core business logic for constellation management
- fusion_registry: Event-driven plug-in system for engine integration
- fusion_router: REST API endpoints

Usage:
    from app.gde.constellation_fusion import fusion_router
    from app.gde.constellation_fusion.fusion_registry import emit_event
    
    # Emit an event from any engine
    emit_event(
        event_type="hydra_detection",
        payload={"origin": "0x...", "participants": [...], "confidence": 0.92},
        source_engine="hydra"
    )
"""

from .fusion_router import router as fusion_router
from .fusion_service import constellation_fusion_service
from .fusion_registry import fusion_registry, emit_event
from .fusion_models import (
    ConstellationNode,
    ConstellationEdge,
    ConstellationCluster,
    ConstellationMetrics,
    FusionEvent,
    NodeCategory,
    RelationType,
    RiskLevel,
)

__all__ = [
    "fusion_router",
    "constellation_fusion_service",
    "fusion_registry",
    "emit_event",
    "ConstellationNode",
    "ConstellationEdge",
    "ConstellationCluster",
    "ConstellationMetrics",
    "FusionEvent",
    "NodeCategory",
    "RelationType",
    "RiskLevel",
]

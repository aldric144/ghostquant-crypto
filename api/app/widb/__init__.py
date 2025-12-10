"""
WIDB - Whale Intelligence Database

A persistent, intelligence-grade system for tracking wallets, clusters,
and entity metadata in the GhostQuant platform.

This is a NEW isolated module - does NOT modify any existing code.

Components:
- widb_models: Data models (WalletProfile, ClusterHistory, Association)
- widb_repository: In-memory data storage layer
- widb_service: Business logic layer
- widb_router: FastAPI REST endpoints
- widb_events: Event bus for pub/sub pattern
- intel_ingest: Write-through intelligence pipeline

Usage:
    from app.widb import widb_router
    app.include_router(widb_router)
"""

from .widb_router import widb_router
from .widb_service import get_widb_service, WidbService
from .widb_repository import get_widb_repository, InMemoryWidbRepository
from .widb_events import intel_event_bus, IntelEvents
from .intel_ingest import (
    get_intel_pipeline,
    initialize_intel_pipeline,
    publish_hydra_detection,
    publish_whale_intel_wallet,
    publish_ecoscan_cluster,
    publish_entity_classification,
)
from .widb_models import (
    WalletProfile,
    WalletProfileCreate,
    WalletProfileUpdate,
    WalletAnnotation,
    ClusterHistory,
    ClusterHistoryCreate,
    Association,
    AssociationCreate,
    EntityType,
    RiskLevel,
    RelationshipType,
)

__all__ = [
    # Router
    "widb_router",
    
    # Service
    "get_widb_service",
    "WidbService",
    
    # Repository
    "get_widb_repository",
    "InMemoryWidbRepository",
    
    # Events
    "intel_event_bus",
    "IntelEvents",
    
    # Intel Pipeline
    "get_intel_pipeline",
    "initialize_intel_pipeline",
    "publish_hydra_detection",
    "publish_whale_intel_wallet",
    "publish_ecoscan_cluster",
    "publish_entity_classification",
    
    # Models
    "WalletProfile",
    "WalletProfileCreate",
    "WalletProfileUpdate",
    "WalletAnnotation",
    "ClusterHistory",
    "ClusterHistoryCreate",
    "Association",
    "AssociationCreate",
    "EntityType",
    "RiskLevel",
    "RelationshipType",
]

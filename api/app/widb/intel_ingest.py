"""
WIDB Intel Ingest - Write-Through Intelligence Pipeline

Listens for events from Hydra, Whale Intel, EcoScan, and Entity Explorer.
Normalizes incoming wallet intelligence and automatically updates WIDB.

This is a NEW isolated module - does NOT modify any existing code.
Uses a pub/sub pattern to remain isolated from source modules.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
import hashlib

from .widb_events import intel_event_bus, IntelEvents
from .widb_service import get_widb_service, WidbService
from .widb_models import EntityType, RiskLevel, RelationshipType

logger = logging.getLogger(__name__)


class IntelIngestPipeline:
    """
    Write-through intelligence pipeline for WIDB.
    
    Subscribes to intelligence events from various sources and
    automatically updates WIDB with normalized wallet data.
    
    Sources:
    - Hydra: Multi-head detection results
    - Whale Intel: Whale wallet discoveries
    - EcoScan: Cluster identification
    - Entity Explorer: Entity classification
    """
    
    def __init__(self, service: Optional[WidbService] = None):
        self._service = service or get_widb_service()
        self._initialized = False
    
    def initialize(self) -> None:
        """
        Initialize the pipeline by subscribing to all intelligence events.
        Should be called once at application startup.
        """
        if self._initialized:
            logger.warning("IntelIngestPipeline already initialized")
            return
        
        # Subscribe to Hydra events
        intel_event_bus.subscribe(IntelEvents.HYDRA_DETECTED, self._on_hydra_detected)
        intel_event_bus.subscribe(IntelEvents.HYDRA_CLUSTER_FORMED, self._on_hydra_cluster_formed)
        
        # Subscribe to Whale Intel events
        intel_event_bus.subscribe(IntelEvents.WHALE_INTEL_WALLET_FOUND, self._on_whale_intel_wallet)
        intel_event_bus.subscribe(IntelEvents.WHALE_INTEL_MOVEMENT, self._on_whale_intel_movement)
        
        # Subscribe to EcoScan events
        intel_event_bus.subscribe(IntelEvents.ECOSCAN_CLUSTER_IDENTIFIED, self._on_ecoscan_cluster)
        intel_event_bus.subscribe(IntelEvents.ECOSCAN_RISK_UPDATED, self._on_ecoscan_risk)
        
        # Subscribe to Entity Explorer events
        intel_event_bus.subscribe(IntelEvents.ENTITY_CLASSIFIED, self._on_entity_classified)
        intel_event_bus.subscribe(IntelEvents.ENTITY_ASSOCIATION_FOUND, self._on_entity_association)
        
        self._initialized = True
        logger.info("IntelIngestPipeline initialized with all event subscriptions")
    
    def shutdown(self) -> None:
        """Shutdown the pipeline and unsubscribe from all events"""
        intel_event_bus.clear_subscribers()
        self._initialized = False
        logger.info("IntelIngestPipeline shutdown complete")
    
    # Hydra Event Handlers
    
    def _on_hydra_detected(self, payload: Dict[str, Any]) -> None:
        """
        Handle Hydra detection events.
        
        Expected payload:
        {
            "heads": ["0x...", "0x..."],
            "cluster_id": "hydra-xxx",
            "risk_level": "high",
            "risk_score": 0.85,
            "source": "hydra"
        }
        """
        try:
            heads = payload.get("heads", [])
            if not heads or len(heads) < 2:
                logger.debug("Hydra detection with insufficient heads, skipping")
                return
            
            result = self._service.ingest_hydra_detection(
                heads=heads,
                cluster_id=payload.get("cluster_id"),
                risk_level=payload.get("risk_level", "medium"),
                risk_score=payload.get("risk_score", 0.5),
                source=payload.get("source", "hydra")
            )
            
            logger.info(f"Ingested Hydra detection: {result}")
            
            # Publish internal WIDB events
            if result.get("success"):
                intel_event_bus.publish(IntelEvents.WIDB_CLUSTER_RECORDED, {
                    "cluster_id": result.get("cluster_id"),
                    "profiles_created": result.get("profiles_created"),
                    "associations_created": result.get("associations_created")
                })
                
        except Exception as e:
            logger.error(f"Error processing Hydra detection: {e}")
    
    def _on_hydra_cluster_formed(self, payload: Dict[str, Any]) -> None:
        """Handle Hydra cluster formation events"""
        # Delegate to detection handler with cluster-specific processing
        self._on_hydra_detected(payload)
    
    # Whale Intel Event Handlers
    
    def _on_whale_intel_wallet(self, payload: Dict[str, Any]) -> None:
        """
        Handle Whale Intel wallet discovery events.
        
        Expected payload:
        {
            "address": "0x...",
            "entity_type": "whale",
            "risk_score": 0.7,
            "tags": ["large-holder", "active"],
            "metadata": {...}
        }
        """
        try:
            address = payload.get("address")
            if not address:
                return
            
            entity_type = self._map_entity_type(payload.get("entity_type", "whale"))
            
            profile = self._service.upsert_wallet_profile(
                address=address,
                entity_type=entity_type,
                risk_score=payload.get("risk_score", 0.5),
                tags=payload.get("tags", ["whale-intel"]),
                metadata=payload.get("metadata", {})
            )
            
            logger.info(f"Ingested Whale Intel wallet: {address}")
            
            intel_event_bus.publish(IntelEvents.WIDB_PROFILE_CREATED, {
                "address": address,
                "source": "whale_intel"
            })
            
        except Exception as e:
            logger.error(f"Error processing Whale Intel wallet: {e}")
    
    def _on_whale_intel_movement(self, payload: Dict[str, Any]) -> None:
        """Handle Whale Intel movement events"""
        try:
            address = payload.get("address")
            if not address:
                return
            
            # Update profile with movement metadata
            profile = self._service.upsert_wallet_profile(
                address=address,
                tags=["active-movement"],
                metadata={
                    "last_movement": datetime.utcnow().isoformat(),
                    "movement_type": payload.get("type"),
                    "amount": payload.get("amount")
                }
            )
            
            logger.debug(f"Updated wallet with movement: {address}")
            
        except Exception as e:
            logger.error(f"Error processing Whale Intel movement: {e}")
    
    # EcoScan Event Handlers
    
    def _on_ecoscan_cluster(self, payload: Dict[str, Any]) -> None:
        """
        Handle EcoScan cluster identification events.
        
        Expected payload:
        {
            "cluster_id": "eco-xxx",
            "addresses": ["0x...", "0x..."],
            "risk_level": "medium",
            "label": "Exchange cluster"
        }
        """
        try:
            addresses = payload.get("addresses", [])
            if not addresses:
                return
            
            cluster_id = payload.get("cluster_id") or self._generate_cluster_id(addresses)
            risk_level = self._map_risk_level(payload.get("risk_level", "medium"))
            
            # Create profiles for all addresses
            for address in addresses:
                self._service.upsert_wallet_profile(
                    address=address,
                    tags=["ecoscan-cluster"],
                    metadata={"cluster_id": cluster_id}
                )
            
            # Create associations
            for i in range(len(addresses)):
                for j in range(i + 1, len(addresses)):
                    self._service.create_association(
                        address=addresses[i],
                        linked_address=addresses[j],
                        confidence=0.7,
                        relationship_type=RelationshipType.CLUSTER_MEMBER,
                        metadata={"source": "ecoscan", "cluster_id": cluster_id}
                    )
            
            # Record cluster
            self._service.record_cluster_event(
                cluster_id=cluster_id,
                related_addresses=addresses,
                risk_level=risk_level,
                label=payload.get("label"),
                source="ecoscan"
            )
            
            logger.info(f"Ingested EcoScan cluster: {cluster_id}")
            
        except Exception as e:
            logger.error(f"Error processing EcoScan cluster: {e}")
    
    def _on_ecoscan_risk(self, payload: Dict[str, Any]) -> None:
        """Handle EcoScan risk update events"""
        try:
            address = payload.get("address")
            if not address:
                return
            
            risk_score = payload.get("risk_score", 0.5)
            
            self._service.upsert_wallet_profile(
                address=address,
                risk_score=risk_score,
                tags=["ecoscan-risk-updated"],
                metadata={"risk_source": "ecoscan"}
            )
            
            logger.debug(f"Updated risk for wallet: {address}")
            
        except Exception as e:
            logger.error(f"Error processing EcoScan risk update: {e}")
    
    # Entity Explorer Event Handlers
    
    def _on_entity_classified(self, payload: Dict[str, Any]) -> None:
        """
        Handle Entity Explorer classification events.
        
        Expected payload:
        {
            "address": "0x...",
            "entity_type": "exchange",
            "entity_name": "Binance",
            "confidence": 0.95
        }
        """
        try:
            address = payload.get("address")
            if not address:
                return
            
            entity_type = self._map_entity_type(payload.get("entity_type", "unknown"))
            
            self._service.upsert_wallet_profile(
                address=address,
                entity_type=entity_type,
                tags=[f"entity:{payload.get('entity_name', 'unknown')}"],
                metadata={
                    "entity_name": payload.get("entity_name"),
                    "classification_confidence": payload.get("confidence", 0.5),
                    "classified_by": "entity_explorer"
                }
            )
            
            logger.info(f"Ingested entity classification: {address} -> {entity_type}")
            
        except Exception as e:
            logger.error(f"Error processing entity classification: {e}")
    
    def _on_entity_association(self, payload: Dict[str, Any]) -> None:
        """Handle Entity Explorer association events"""
        try:
            address = payload.get("address")
            linked_address = payload.get("linked_address")
            
            if not address or not linked_address:
                return
            
            relationship = self._map_relationship_type(payload.get("relationship_type", "unknown"))
            
            self._service.create_association(
                address=address,
                linked_address=linked_address,
                confidence=payload.get("confidence", 0.5),
                relationship_type=relationship,
                metadata={"source": "entity_explorer"}
            )
            
            logger.debug(f"Created association: {address} -> {linked_address}")
            
        except Exception as e:
            logger.error(f"Error processing entity association: {e}")
    
    # Helper Methods
    
    def _map_entity_type(self, entity_type: str) -> EntityType:
        """Map entity type string to enum"""
        mapping = {
            "whale": EntityType.WHALE,
            "exchange": EntityType.EXCHANGE,
            "mixer": EntityType.MIXER,
            "exploit": EntityType.EXPLOIT,
            "normal": EntityType.NORMAL,
        }
        return mapping.get(entity_type.lower(), EntityType.UNKNOWN)
    
    def _map_risk_level(self, risk_level: str) -> RiskLevel:
        """Map risk level string to enum"""
        mapping = {
            "critical": RiskLevel.CRITICAL,
            "high": RiskLevel.HIGH,
            "medium": RiskLevel.MEDIUM,
            "low": RiskLevel.LOW,
        }
        return mapping.get(risk_level.lower(), RiskLevel.UNKNOWN)
    
    def _map_relationship_type(self, rel_type: str) -> RelationshipType:
        """Map relationship type string to enum"""
        mapping = {
            "funding": RelationshipType.FUNDING,
            "withdrawal": RelationshipType.WITHDRAWAL,
            "coordination": RelationshipType.COORDINATION,
            "cluster_member": RelationshipType.CLUSTER_MEMBER,
            "mixer_link": RelationshipType.MIXER_LINK,
            "exchange_deposit": RelationshipType.EXCHANGE_DEPOSIT,
            "exchange_withdrawal": RelationshipType.EXCHANGE_WITHDRAWAL,
        }
        return mapping.get(rel_type.lower(), RelationshipType.UNKNOWN)
    
    def _generate_cluster_id(self, addresses: List[str]) -> str:
        """Generate a cluster ID from addresses"""
        sorted_addresses = sorted([a.lower() for a in addresses])
        hash_input = "".join(sorted_addresses).encode()
        return "cluster-" + hashlib.md5(hash_input).hexdigest()[:16]


# Singleton pipeline instance
_pipeline_instance: Optional[IntelIngestPipeline] = None


def get_intel_pipeline() -> IntelIngestPipeline:
    """Get the singleton intel pipeline instance"""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = IntelIngestPipeline()
    return _pipeline_instance


def initialize_intel_pipeline() -> None:
    """Initialize the intel pipeline (call at app startup)"""
    pipeline = get_intel_pipeline()
    pipeline.initialize()


# Convenience functions for publishing events from other modules

def publish_hydra_detection(
    heads: List[str],
    cluster_id: Optional[str] = None,
    risk_level: str = "medium",
    risk_score: float = 0.5
) -> None:
    """
    Publish a Hydra detection event to WIDB.
    
    Call this from Hydra adapter after detection completes.
    """
    intel_event_bus.publish(IntelEvents.HYDRA_DETECTED, {
        "heads": heads,
        "cluster_id": cluster_id,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "source": "hydra",
        "timestamp": datetime.utcnow().isoformat()
    })


def publish_whale_intel_wallet(
    address: str,
    entity_type: str = "whale",
    risk_score: float = 0.5,
    tags: Optional[List[str]] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """
    Publish a Whale Intel wallet discovery event to WIDB.
    
    Call this from Whale Intel module when a wallet is discovered.
    """
    intel_event_bus.publish(IntelEvents.WHALE_INTEL_WALLET_FOUND, {
        "address": address,
        "entity_type": entity_type,
        "risk_score": risk_score,
        "tags": tags or [],
        "metadata": metadata or {},
        "timestamp": datetime.utcnow().isoformat()
    })


def publish_ecoscan_cluster(
    addresses: List[str],
    cluster_id: Optional[str] = None,
    risk_level: str = "medium",
    label: Optional[str] = None
) -> None:
    """
    Publish an EcoScan cluster identification event to WIDB.
    
    Call this from EcoScan module when a cluster is identified.
    """
    intel_event_bus.publish(IntelEvents.ECOSCAN_CLUSTER_IDENTIFIED, {
        "addresses": addresses,
        "cluster_id": cluster_id,
        "risk_level": risk_level,
        "label": label,
        "timestamp": datetime.utcnow().isoformat()
    })


def publish_entity_classification(
    address: str,
    entity_type: str,
    entity_name: Optional[str] = None,
    confidence: float = 0.5
) -> None:
    """
    Publish an Entity Explorer classification event to WIDB.
    
    Call this from Entity Explorer when an entity is classified.
    """
    intel_event_bus.publish(IntelEvents.ENTITY_CLASSIFIED, {
        "address": address,
        "entity_type": entity_type,
        "entity_name": entity_name,
        "confidence": confidence,
        "timestamp": datetime.utcnow().isoformat()
    })

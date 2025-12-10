"""
WIDB Repository - Whale Intelligence Database Repository

Provides the data access layer for WIDB using in-memory storage.
This is a proof-of-concept implementation - data is ephemeral.

This is a NEW isolated module - does NOT modify any existing code.
"""

from datetime import datetime
from typing import Dict, List, Optional, Protocol
from uuid import uuid4
import threading

from .widb_models import (
    WalletProfile,
    WalletProfileCreate,
    WalletProfileUpdate,
    ClusterHistory,
    ClusterHistoryCreate,
    Association,
    AssociationCreate,
    EntityType,
    RiskLevel,
    RelationshipType,
)


class WidbRepositoryProtocol(Protocol):
    """Protocol defining the WIDB repository interface"""
    
    def upsert_wallet_profile(self, profile: WalletProfileCreate) -> WalletProfile: ...
    def get_wallet_profile(self, address: str) -> Optional[WalletProfile]: ...
    def update_wallet_profile(self, address: str, update: WalletProfileUpdate) -> Optional[WalletProfile]: ...
    def list_wallet_profiles(self, limit: int = 100, offset: int = 0) -> List[WalletProfile]: ...
    
    def create_association(self, assoc: AssociationCreate) -> Association: ...
    def get_associations(self, address: str) -> List[Association]: ...
    def get_association_by_id(self, assoc_id: str) -> Optional[Association]: ...
    
    def record_cluster_event(self, event: ClusterHistoryCreate) -> ClusterHistory: ...
    def get_cluster_history(self, limit: int = 100, offset: int = 0) -> List[ClusterHistory]: ...
    def get_clusters_for_address(self, address: str) -> List[ClusterHistory]: ...


class InMemoryWidbRepository:
    """
    In-memory implementation of the WIDB repository.
    
    Thread-safe storage for wallet profiles, associations, and cluster history.
    Data is ephemeral and will be lost on restart.
    """
    
    def __init__(self):
        self._lock = threading.RLock()
        self._wallet_profiles: Dict[str, WalletProfile] = {}
        self._associations: Dict[str, Association] = {}
        self._cluster_history: Dict[str, ClusterHistory] = {}
        
        # Index for faster lookups
        self._associations_by_address: Dict[str, List[str]] = {}
        self._clusters_by_address: Dict[str, List[str]] = {}
    
    def _normalize_address(self, address: str) -> str:
        """Normalize address to lowercase"""
        return address.lower().strip()
    
    # Wallet Profile Methods
    
    def upsert_wallet_profile(self, profile: WalletProfileCreate) -> WalletProfile:
        """
        Create or update a wallet profile.
        If the profile exists, updates last_seen and merges tags.
        """
        address = self._normalize_address(profile.address)
        
        with self._lock:
            existing = self._wallet_profiles.get(address)
            
            if existing:
                # Update existing profile
                existing.last_seen = datetime.utcnow()
                
                # Merge tags
                if profile.tags:
                    existing_tags = set(existing.tags)
                    existing_tags.update(profile.tags)
                    existing.tags = list(existing_tags)
                
                # Update other fields if provided
                if profile.entity_type and profile.entity_type != EntityType.UNKNOWN:
                    existing.entity_type = profile.entity_type
                if profile.risk_score and profile.risk_score > 0:
                    existing.risk_score = max(existing.risk_score, profile.risk_score)
                if profile.notes:
                    existing.notes = profile.notes
                if profile.metadata:
                    existing.metadata.update(profile.metadata)
                
                return existing
            else:
                # Create new profile
                new_profile = WalletProfile(
                    address=address,
                    entity_type=profile.entity_type or EntityType.UNKNOWN,
                    risk_score=profile.risk_score or 0.0,
                    tags=profile.tags or [],
                    first_seen=datetime.utcnow(),
                    last_seen=datetime.utcnow(),
                    total_clusters=0,
                    notes=profile.notes,
                    metadata=profile.metadata or {}
                )
                self._wallet_profiles[address] = new_profile
                return new_profile
    
    def get_wallet_profile(self, address: str) -> Optional[WalletProfile]:
        """Get a wallet profile by address"""
        address = self._normalize_address(address)
        with self._lock:
            return self._wallet_profiles.get(address)
    
    def update_wallet_profile(self, address: str, update: WalletProfileUpdate) -> Optional[WalletProfile]:
        """Update an existing wallet profile"""
        address = self._normalize_address(address)
        
        with self._lock:
            profile = self._wallet_profiles.get(address)
            if not profile:
                return None
            
            if update.entity_type is not None:
                profile.entity_type = update.entity_type
            if update.risk_score is not None:
                profile.risk_score = update.risk_score
            if update.tags is not None:
                profile.tags = update.tags
            if update.notes is not None:
                profile.notes = update.notes
            if update.metadata is not None:
                profile.metadata.update(update.metadata)
            
            profile.last_seen = datetime.utcnow()
            return profile
    
    def list_wallet_profiles(self, limit: int = 100, offset: int = 0) -> List[WalletProfile]:
        """List all wallet profiles with pagination"""
        with self._lock:
            profiles = list(self._wallet_profiles.values())
            # Sort by last_seen descending
            profiles.sort(key=lambda p: p.last_seen, reverse=True)
            return profiles[offset:offset + limit]
    
    # Association Methods
    
    def create_association(self, assoc: AssociationCreate) -> Association:
        """
        Create a new association between two wallets.
        If association already exists, updates confidence and last_seen.
        """
        address = self._normalize_address(assoc.address)
        linked_address = self._normalize_address(assoc.linked_address)
        
        with self._lock:
            # Check for existing association
            existing_key = None
            for key, existing in self._associations.items():
                if (existing.address == address and existing.linked_address == linked_address) or \
                   (existing.address == linked_address and existing.linked_address == address):
                    existing_key = key
                    break
            
            if existing_key:
                # Update existing association
                existing = self._associations[existing_key]
                existing.confidence = max(existing.confidence, assoc.confidence or 0.5)
                existing.last_seen = datetime.utcnow()
                if assoc.relationship_type and assoc.relationship_type != RelationshipType.UNKNOWN:
                    existing.relationship_type = assoc.relationship_type
                if assoc.metadata:
                    existing.metadata.update(assoc.metadata)
                return existing
            
            # Create new association
            assoc_id = str(uuid4())[:16]
            new_assoc = Association(
                id=assoc_id,
                address=address,
                linked_address=linked_address,
                confidence=assoc.confidence or 0.5,
                relationship_type=assoc.relationship_type or RelationshipType.UNKNOWN,
                first_seen=datetime.utcnow(),
                last_seen=datetime.utcnow(),
                metadata=assoc.metadata or {}
            )
            
            self._associations[assoc_id] = new_assoc
            
            # Update index
            if address not in self._associations_by_address:
                self._associations_by_address[address] = []
            self._associations_by_address[address].append(assoc_id)
            
            if linked_address not in self._associations_by_address:
                self._associations_by_address[linked_address] = []
            self._associations_by_address[linked_address].append(assoc_id)
            
            return new_assoc
    
    def get_associations(self, address: str) -> List[Association]:
        """Get all associations for an address"""
        address = self._normalize_address(address)
        
        with self._lock:
            assoc_ids = self._associations_by_address.get(address, [])
            return [self._associations[aid] for aid in assoc_ids if aid in self._associations]
    
    def get_association_by_id(self, assoc_id: str) -> Optional[Association]:
        """Get an association by ID"""
        with self._lock:
            return self._associations.get(assoc_id)
    
    # Cluster History Methods
    
    def record_cluster_event(self, event: ClusterHistoryCreate) -> ClusterHistory:
        """Record a new cluster detection event"""
        with self._lock:
            record_id = str(uuid4())[:16]
            
            cluster = ClusterHistory(
                id=record_id,
                cluster_id=event.cluster_id,
                timestamp=datetime.utcnow(),
                related_addresses=[self._normalize_address(a) for a in event.related_addresses],
                risk_level=event.risk_level or RiskLevel.UNKNOWN,
                label=event.label,
                source=event.source or "unknown",
                metadata=event.metadata or {}
            )
            
            self._cluster_history[record_id] = cluster
            
            # Update index and wallet profiles
            for address in cluster.related_addresses:
                if address not in self._clusters_by_address:
                    self._clusters_by_address[address] = []
                self._clusters_by_address[address].append(record_id)
                
                # Update wallet profile cluster count
                if address in self._wallet_profiles:
                    self._wallet_profiles[address].total_clusters += 1
            
            return cluster
    
    def get_cluster_history(self, limit: int = 100, offset: int = 0) -> List[ClusterHistory]:
        """Get cluster history with pagination"""
        with self._lock:
            clusters = list(self._cluster_history.values())
            # Sort by timestamp descending
            clusters.sort(key=lambda c: c.timestamp, reverse=True)
            return clusters[offset:offset + limit]
    
    def get_clusters_for_address(self, address: str) -> List[ClusterHistory]:
        """Get all clusters that include a specific address"""
        address = self._normalize_address(address)
        
        with self._lock:
            cluster_ids = self._clusters_by_address.get(address, [])
            return [self._cluster_history[cid] for cid in cluster_ids if cid in self._cluster_history]
    
    # Utility Methods
    
    def get_stats(self) -> Dict:
        """Get repository statistics"""
        with self._lock:
            return {
                "total_wallets": len(self._wallet_profiles),
                "total_associations": len(self._associations),
                "total_clusters": len(self._cluster_history),
                "wallets_by_type": self._count_by_entity_type(),
                "clusters_by_risk": self._count_by_risk_level(),
            }
    
    def _count_by_entity_type(self) -> Dict[str, int]:
        """Count wallets by entity type"""
        counts = {}
        for profile in self._wallet_profiles.values():
            entity_type = profile.entity_type
            counts[entity_type] = counts.get(entity_type, 0) + 1
        return counts
    
    def _count_by_risk_level(self) -> Dict[str, int]:
        """Count clusters by risk level"""
        counts = {}
        for cluster in self._cluster_history.values():
            risk_level = cluster.risk_level
            counts[risk_level] = counts.get(risk_level, 0) + 1
        return counts
    
    def clear(self):
        """Clear all data (for testing)"""
        with self._lock:
            self._wallet_profiles.clear()
            self._associations.clear()
            self._cluster_history.clear()
            self._associations_by_address.clear()
            self._clusters_by_address.clear()


# Singleton instance
_repository_instance: Optional[InMemoryWidbRepository] = None
_repository_lock = threading.Lock()


def get_widb_repository() -> InMemoryWidbRepository:
    """
    Get the singleton WIDB repository instance.
    
    Returns:
        InMemoryWidbRepository instance
    """
    global _repository_instance
    
    if _repository_instance is None:
        with _repository_lock:
            if _repository_instance is None:
                _repository_instance = InMemoryWidbRepository()
    
    return _repository_instance

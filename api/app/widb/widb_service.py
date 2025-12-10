"""
WIDB Service - Whale Intelligence Database Business Logic

Provides the business logic layer for WIDB operations.
Coordinates between the repository and external callers.

This is a NEW isolated module - does NOT modify any existing code.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
import hashlib

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
    WalletProfileResponse,
    AssociationListResponse,
    ClusterHistoryListResponse,
)
from .widb_repository import get_widb_repository, InMemoryWidbRepository


class WidbService:
    """
    Service layer for Whale Intelligence Database operations.
    
    Provides business logic for:
    - Wallet profile management
    - Association tracking
    - Cluster history recording
    - Intelligence ingestion
    """
    
    def __init__(self, repository: Optional[InMemoryWidbRepository] = None):
        self._repo = repository or get_widb_repository()
    
    # Wallet Profile Operations
    
    def get_wallet_profile(self, address: str) -> Optional[WalletProfileResponse]:
        """
        Get a wallet profile with association and cluster counts.
        
        Args:
            address: Wallet address to look up
            
        Returns:
            WalletProfileResponse or None if not found
        """
        profile = self._repo.get_wallet_profile(address)
        if not profile:
            return None
        
        associations = self._repo.get_associations(address)
        clusters = self._repo.get_clusters_for_address(address)
        
        return WalletProfileResponse(
            profile=profile,
            associations_count=len(associations),
            clusters_count=len(clusters)
        )
    
    def upsert_wallet_profile(
        self,
        address: str,
        entity_type: Optional[EntityType] = None,
        risk_score: Optional[float] = None,
        tags: Optional[List[str]] = None,
        notes: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> WalletProfile:
        """
        Create or update a wallet profile.
        
        Args:
            address: Wallet address
            entity_type: Entity classification
            risk_score: Risk score 0-1
            tags: Tags/labels
            notes: Analyst notes
            metadata: Additional metadata
            
        Returns:
            Created or updated WalletProfile
        """
        create_data = WalletProfileCreate(
            address=address,
            entity_type=entity_type,
            risk_score=risk_score,
            tags=tags,
            notes=notes,
            metadata=metadata
        )
        return self._repo.upsert_wallet_profile(create_data)
    
    def annotate_wallet(self, annotation: WalletAnnotation) -> Optional[WalletProfile]:
        """
        Add analyst annotations to a wallet profile.
        Creates the profile if it doesn't exist.
        
        Args:
            annotation: Annotation data
            
        Returns:
            Updated WalletProfile
        """
        # Ensure profile exists
        profile = self._repo.get_wallet_profile(annotation.address)
        if not profile:
            # Create new profile with annotation
            create_data = WalletProfileCreate(
                address=annotation.address,
                entity_type=annotation.entity_type,
                risk_score=annotation.risk_score,
                tags=annotation.tags,
                notes=annotation.notes
            )
            return self._repo.upsert_wallet_profile(create_data)
        
        # Update existing profile
        update_data = WalletProfileUpdate(
            entity_type=annotation.entity_type,
            risk_score=annotation.risk_score,
            notes=annotation.notes
        )
        
        # Merge tags
        if annotation.tags:
            existing_tags = set(profile.tags)
            existing_tags.update(annotation.tags)
            update_data.tags = list(existing_tags)
        
        return self._repo.update_wallet_profile(annotation.address, update_data)
    
    def list_wallet_profiles(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> List[WalletProfile]:
        """List wallet profiles with pagination"""
        return self._repo.list_wallet_profiles(limit=limit, offset=offset)
    
    # Association Operations
    
    def get_associations(self, address: str) -> AssociationListResponse:
        """
        Get all associations for a wallet address.
        
        Args:
            address: Wallet address
            
        Returns:
            AssociationListResponse with associations list
        """
        associations = self._repo.get_associations(address)
        return AssociationListResponse(
            address=address.lower(),
            associations=associations,
            total=len(associations)
        )
    
    def create_association(
        self,
        address: str,
        linked_address: str,
        confidence: float = 0.5,
        relationship_type: RelationshipType = RelationshipType.UNKNOWN,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Association:
        """
        Create an association between two wallets.
        
        Args:
            address: Source wallet
            linked_address: Target wallet
            confidence: Confidence score 0-1
            relationship_type: Type of relationship
            metadata: Additional metadata
            
        Returns:
            Created Association
        """
        create_data = AssociationCreate(
            address=address,
            linked_address=linked_address,
            confidence=confidence,
            relationship_type=relationship_type,
            metadata=metadata
        )
        return self._repo.create_association(create_data)
    
    # Cluster History Operations
    
    def get_cluster_history(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> ClusterHistoryListResponse:
        """
        Get cluster history with pagination.
        
        Args:
            limit: Maximum records to return
            offset: Offset for pagination
            
        Returns:
            ClusterHistoryListResponse with clusters list
        """
        clusters = self._repo.get_cluster_history(limit=limit, offset=offset)
        return ClusterHistoryListResponse(
            clusters=clusters,
            total=len(clusters)
        )
    
    def record_cluster_event(
        self,
        cluster_id: str,
        related_addresses: List[str],
        risk_level: RiskLevel = RiskLevel.UNKNOWN,
        label: Optional[str] = None,
        source: str = "unknown",
        metadata: Optional[Dict[str, Any]] = None
    ) -> ClusterHistory:
        """
        Record a cluster detection event.
        
        Args:
            cluster_id: Cluster identifier
            related_addresses: Addresses in the cluster
            risk_level: Risk classification
            label: Human-readable label
            source: Detection source
            metadata: Additional metadata
            
        Returns:
            Created ClusterHistory record
        """
        create_data = ClusterHistoryCreate(
            cluster_id=cluster_id,
            related_addresses=related_addresses,
            risk_level=risk_level,
            label=label,
            source=source,
            metadata=metadata
        )
        return self._repo.record_cluster_event(create_data)
    
    def get_clusters_for_address(self, address: str) -> List[ClusterHistory]:
        """Get all clusters that include a specific address"""
        return self._repo.get_clusters_for_address(address)
    
    # Intelligence Ingestion
    
    def ingest_hydra_detection(
        self,
        heads: List[str],
        cluster_id: Optional[str] = None,
        risk_level: str = "medium",
        risk_score: float = 0.5,
        source: str = "hydra"
    ) -> Dict[str, Any]:
        """
        Ingest a Hydra detection result into WIDB.
        
        Creates/updates wallet profiles for each head,
        creates associations between heads,
        and records the cluster event.
        
        Args:
            heads: List of detected head addresses
            cluster_id: Cluster identifier (generated if not provided)
            risk_level: Risk level string
            risk_score: Risk score 0-1
            source: Detection source
            
        Returns:
            Summary of ingested data
        """
        if not heads or len(heads) < 2:
            return {
                "success": False,
                "error": "Need at least 2 heads for ingestion",
                "profiles_created": 0,
                "associations_created": 0,
                "cluster_recorded": False
            }
        
        # Normalize addresses
        heads = [h.lower().strip() for h in heads]
        
        # Generate cluster ID if not provided
        if not cluster_id:
            cluster_id = "hydra-" + hashlib.md5(
                "".join(sorted(heads)).encode()
            ).hexdigest()[:16]
        
        # Map risk level string to enum
        risk_level_enum = self._map_risk_level(risk_level)
        
        # Create/update wallet profiles
        profiles_created = 0
        for head in heads:
            profile = self.upsert_wallet_profile(
                address=head,
                entity_type=EntityType.WHALE,
                risk_score=risk_score,
                tags=["hydra-detected", source],
                metadata={
                    "cluster_id": cluster_id,
                    "detection_source": source,
                    "detection_time": datetime.utcnow().isoformat()
                }
            )
            profiles_created += 1
        
        # Create associations between heads
        associations_created = 0
        for i in range(len(heads)):
            for j in range(i + 1, len(heads)):
                self.create_association(
                    address=heads[i],
                    linked_address=heads[j],
                    confidence=0.8,
                    relationship_type=RelationshipType.CLUSTER_MEMBER,
                    metadata={
                        "cluster_id": cluster_id,
                        "source": source
                    }
                )
                associations_created += 1
        
        # Record cluster event
        cluster = self.record_cluster_event(
            cluster_id=cluster_id,
            related_addresses=heads,
            risk_level=risk_level_enum,
            label=f"Hydra Detection - {len(heads)} heads",
            source=source,
            metadata={
                "risk_score": risk_score,
                "head_count": len(heads)
            }
        )
        
        return {
            "success": True,
            "profiles_created": profiles_created,
            "associations_created": associations_created,
            "cluster_recorded": True,
            "cluster_id": cluster_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _map_risk_level(self, risk_level: str) -> RiskLevel:
        """Map risk level string to enum"""
        mapping = {
            "critical": RiskLevel.CRITICAL,
            "high": RiskLevel.HIGH,
            "medium": RiskLevel.MEDIUM,
            "low": RiskLevel.LOW,
        }
        return mapping.get(risk_level.lower(), RiskLevel.UNKNOWN)
    
    # Statistics
    
    def get_stats(self) -> Dict[str, Any]:
        """Get WIDB statistics"""
        return self._repo.get_stats()


# Singleton service instance
_service_instance: Optional[WidbService] = None


def get_widb_service() -> WidbService:
    """Get the singleton WIDB service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = WidbService()
    return _service_instance

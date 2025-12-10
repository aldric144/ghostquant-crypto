"""
WIDB Models - Whale Intelligence Database Models

Defines the data structures for:
- WalletProfile: Wallet profiles with entity classification
- ClusterHistory: Historical cluster participation records
- Association: Known wallet associations and relationships

This is a NEW isolated module - does NOT modify any existing code.
Uses Pydantic models for in-memory storage (no SQLAlchemy dependency).
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class EntityType(str, Enum):
    """Entity classification types"""
    WHALE = "whale"
    EXCHANGE = "exchange"
    MIXER = "mixer"
    EXPLOIT = "exploit"
    NORMAL = "normal"
    UNKNOWN = "unknown"


class RiskLevel(str, Enum):
    """Risk level classifications"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNKNOWN = "unknown"


class RelationshipType(str, Enum):
    """Types of wallet relationships"""
    FUNDING = "funding"
    WITHDRAWAL = "withdrawal"
    COORDINATION = "coordination"
    CLUSTER_MEMBER = "cluster_member"
    MIXER_LINK = "mixer_link"
    EXCHANGE_DEPOSIT = "exchange_deposit"
    EXCHANGE_WITHDRAWAL = "exchange_withdrawal"
    UNKNOWN = "unknown"


class WalletProfile(BaseModel):
    """
    Wallet profile with entity classification and intelligence metadata.
    
    Attributes:
        address: Primary key - wallet address (lowercase)
        entity_type: Classification (whale, exchange, mixer, exploit, normal)
        risk_score: Risk score from 0.0 to 1.0
        tags: JSON array of tags/labels
        first_seen: First observation timestamp
        last_seen: Most recent observation timestamp
        total_clusters: Number of clusters this wallet has appeared in
        notes: Analyst notes and annotations
        metadata: Additional metadata (chain info, volume, etc.)
    """
    address: str = Field(..., description="Wallet address (primary key)")
    entity_type: EntityType = Field(default=EntityType.UNKNOWN, description="Entity classification")
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Risk score 0-1")
    tags: List[str] = Field(default_factory=list, description="Tags/labels")
    first_seen: datetime = Field(default_factory=datetime.utcnow, description="First observation")
    last_seen: datetime = Field(default_factory=datetime.utcnow, description="Last observation")
    total_clusters: int = Field(default=0, ge=0, description="Cluster participation count")
    notes: Optional[str] = Field(default=None, description="Analyst notes")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    class Config:
        use_enum_values = True


class WalletProfileCreate(BaseModel):
    """Schema for creating a new wallet profile"""
    address: str
    entity_type: Optional[EntityType] = EntityType.UNKNOWN
    risk_score: Optional[float] = 0.0
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class WalletProfileUpdate(BaseModel):
    """Schema for updating a wallet profile"""
    entity_type: Optional[EntityType] = None
    risk_score: Optional[float] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ClusterHistory(BaseModel):
    """
    Historical record of cluster detection events.
    
    Attributes:
        id: Unique identifier for this record
        cluster_id: Identifier for the cluster
        timestamp: When the cluster was detected
        related_addresses: JSON array of addresses in the cluster
        risk_level: Risk classification
        label: Human-readable label for the cluster
        source: Source of detection (hydra, whale_intel, ecoscan, etc.)
        metadata: Additional cluster metadata
    """
    id: str = Field(..., description="Unique record ID")
    cluster_id: str = Field(..., description="Cluster identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Detection timestamp")
    related_addresses: List[str] = Field(default_factory=list, description="Addresses in cluster")
    risk_level: RiskLevel = Field(default=RiskLevel.UNKNOWN, description="Risk classification")
    label: Optional[str] = Field(default=None, description="Cluster label")
    source: str = Field(default="unknown", description="Detection source")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    class Config:
        use_enum_values = True


class ClusterHistoryCreate(BaseModel):
    """Schema for creating a cluster history record"""
    cluster_id: str
    related_addresses: List[str]
    risk_level: Optional[RiskLevel] = RiskLevel.UNKNOWN
    label: Optional[str] = None
    source: Optional[str] = "unknown"
    metadata: Optional[Dict[str, Any]] = None


class Association(BaseModel):
    """
    Association between two wallets.
    
    Attributes:
        id: Unique identifier for this association
        address: Source wallet address
        linked_address: Target wallet address
        confidence: Confidence score 0-1
        relationship_type: Type of relationship
        first_seen: When association was first detected
        last_seen: Most recent observation
        metadata: Additional association metadata
    """
    id: str = Field(..., description="Unique association ID")
    address: str = Field(..., description="Source wallet address")
    linked_address: str = Field(..., description="Target wallet address")
    confidence: float = Field(default=0.5, ge=0.0, le=1.0, description="Confidence score")
    relationship_type: RelationshipType = Field(
        default=RelationshipType.UNKNOWN, 
        description="Relationship type"
    )
    first_seen: datetime = Field(default_factory=datetime.utcnow, description="First observation")
    last_seen: datetime = Field(default_factory=datetime.utcnow, description="Last observation")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    class Config:
        use_enum_values = True


class AssociationCreate(BaseModel):
    """Schema for creating an association"""
    address: str
    linked_address: str
    confidence: Optional[float] = 0.5
    relationship_type: Optional[RelationshipType] = RelationshipType.UNKNOWN
    metadata: Optional[Dict[str, Any]] = None


class WalletAnnotation(BaseModel):
    """Schema for adding analyst annotations to a wallet"""
    address: str
    notes: str
    tags: Optional[List[str]] = None
    entity_type: Optional[EntityType] = None
    risk_score: Optional[float] = None


class WalletProfileResponse(BaseModel):
    """Response schema for wallet profile queries"""
    profile: WalletProfile
    associations_count: int = 0
    clusters_count: int = 0


class AssociationListResponse(BaseModel):
    """Response schema for association list queries"""
    address: str
    associations: List[Association]
    total: int


class ClusterHistoryListResponse(BaseModel):
    """Response schema for cluster history queries"""
    clusters: List[ClusterHistory]
    total: int

"""
Constellation Fusion Pipeline - Data Models

Models for nodes, edges, and clusters in the Global Threat Constellation.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum


class NodeCategory(str, Enum):
    """Categories for constellation nodes."""
    WALLET = "wallet"
    EXCHANGE = "exchange"
    CONTRACT = "contract"
    WHALE = "whale"
    HYDRA_HEAD = "hydra_head"
    ENTITY = "entity"
    UNKNOWN = "unknown"


class RelationType(str, Enum):
    """Types of relationships between nodes."""
    TRANSFER = "transfer"
    COORDINATION = "coordination"
    WHALE_MOVEMENT = "whale_movement"
    HYDRA_LINK = "hydra_link"
    ENTITY_RELATION = "entity_relation"
    ECOSCAN_FLOW = "ecoscan_flow"
    USER_OBSERVED = "user_observed"


class RiskLevel(str, Enum):
    """Risk levels for clusters and nodes."""
    CRITICAL = "critical"
    HIGH = "high"
    ELEVATED = "elevated"
    MODERATE = "moderate"
    LOW = "low"
    MINIMAL = "minimal"


@dataclass
class ConstellationNode:
    """
    A node in the constellation representing an entity (wallet, contract, etc.)
    """
    id: str  # Unique identifier (usually address)
    label: str = ""
    category: NodeCategory = NodeCategory.UNKNOWN
    risk_score: float = 0.0  # 0-1 scale
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    color: str = "#ffffff"
    size: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)
    first_seen: datetime = field(default_factory=datetime.utcnow)
    last_updated: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        if not self.label:
            self.label = self.id[:10] + "..." if len(self.id) > 10 else self.id
        if not isinstance(self.metadata, dict):
            self.metadata = {}
        if not isinstance(self.tags, list):
            self.tags = []
        self._compute_color()
    
    def _compute_color(self):
        """Compute node color based on risk score."""
        if self.risk_score >= 0.8:
            self.color = "#ff0000"  # Red - critical
        elif self.risk_score >= 0.6:
            self.color = "#ff6600"  # Orange - high
        elif self.risk_score >= 0.4:
            self.color = "#ffcc00"  # Yellow - elevated
        elif self.risk_score >= 0.2:
            self.color = "#00ff00"  # Green - moderate
        else:
            self.color = "#00ccff"  # Cyan - low
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "type": self.category.value,
            "x": self.x,
            "y": self.y,
            "z": self.z,
            "risk_level": self.risk_score,
            "color": self.color,
            "size": self.size,
            "metadata": self.metadata,
            "tags": self.tags,
        }


@dataclass
class ConstellationEdge:
    """
    An edge connecting two nodes in the constellation.
    """
    source_id: str
    target_id: str
    relation_type: RelationType = RelationType.TRANSFER
    strength: float = 0.5  # 0-1 scale
    confidence: float = 0.5  # 0-1 scale
    correlation: float = 0.0
    color: str = "#666666"
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        if not isinstance(self.metadata, dict):
            self.metadata = {}
        self._compute_color()
    
    def _compute_color(self):
        """Compute edge color based on relation type and strength."""
        type_colors = {
            RelationType.TRANSFER: "#4488ff",
            RelationType.COORDINATION: "#ff4444",
            RelationType.WHALE_MOVEMENT: "#44ff44",
            RelationType.HYDRA_LINK: "#ff00ff",
            RelationType.ENTITY_RELATION: "#ffaa00",
            RelationType.ECOSCAN_FLOW: "#00ffff",
            RelationType.USER_OBSERVED: "#888888",
        }
        self.color = type_colors.get(self.relation_type, "#666666")
    
    @property
    def edge_id(self) -> str:
        return f"{self.source_id}_{self.target_id}_{self.relation_type.value}"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "relation_type": self.relation_type.value,
            "strength": self.strength,
            "confidence": self.confidence,
            "correlation": self.correlation,
            "color": self.color,
            "metadata": self.metadata,
        }


@dataclass
class ConstellationCluster:
    """
    A cluster of related nodes in the constellation.
    """
    cluster_id: str
    name: str = ""
    risk_level: RiskLevel = RiskLevel.MINIMAL
    risk_score: float = 0.0  # 0-1 scale
    node_ids: List[str] = field(default_factory=list)
    center_x: float = 0.0
    center_y: float = 0.0
    center_z: float = 0.0
    radius: float = 10.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_updated: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        if not self.name:
            self.name = f"Cluster-{self.cluster_id[:8]}"
        if not isinstance(self.node_ids, list):
            self.node_ids = []
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "cluster_id": self.cluster_id,
            "name": self.name,
            "risk_level": self.risk_level.value,
            "risk_score": self.risk_score,
            "node_ids": self.node_ids,
            "center": {"x": self.center_x, "y": self.center_y, "z": self.center_z},
            "radius": self.radius,
            "metadata": self.metadata,
        }


@dataclass
class FusionEvent:
    """
    An event from any intelligence engine to be fused into the constellation.
    """
    event_type: str  # hydra_detection, whale_movement, ecoscan_transfer, entity_lookup
    source_engine: str  # hydra, whale_intel, ecoscan, entity_explorer
    payload: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    priority: int = 5  # 1-10, higher = more important
    
    def __post_init__(self):
        if not isinstance(self.payload, dict):
            self.payload = {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_type": self.event_type,
            "source_engine": self.source_engine,
            "payload": self.payload,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority,
        }


@dataclass
class ConstellationMetrics:
    """
    Metrics and summary statistics for the constellation.
    """
    total_nodes: int = 0
    total_edges: int = 0
    total_clusters: int = 0
    hydra_heads_detected: int = 0
    whale_nodes: int = 0
    global_risk_score: float = 0.0
    dominant_risk: RiskLevel = RiskLevel.MINIMAL
    high_risk_entities: List[str] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_nodes": self.total_nodes,
            "total_edges": self.total_edges,
            "clusters_detected": self.total_clusters,
            "hydra_heads_detected": self.hydra_heads_detected,
            "whale_nodes": self.whale_nodes,
            "global_risk_score": self.global_risk_score,
            "dominant_risk": self.dominant_risk.value,
            "high_risk_entities": self.high_risk_entities,
            "notes": f"Last updated: {self.last_updated.isoformat()}",
        }

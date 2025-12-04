"""
Global Threat Constellation Map™ - Schema Definitions
Pure Python dataclasses for 3D intelligence visualization
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List
from datetime import datetime


@dataclass
class ConstellationNode:
    """
    3D node in the threat constellation
    Represents entities, tokens, chains, clusters, or Hydra heads
    """
    id: str = ""
    label: str = ""
    type: str = "entity"  # entity | token | chain | cluster | hydra_head
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    risk_level: float = 0.0  # 0-1
    color: str = "#ffffff"
    size: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure metadata is properly initialized"""
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "label": self.label,
            "type": self.type,
            "x": self.x,
            "y": self.y,
            "z": self.z,
            "risk_level": self.risk_level,
            "color": self.color,
            "size": self.size,
            "metadata": self.metadata
        }


@dataclass
class ConstellationEdge:
    """
    Connection between nodes in the constellation
    Represents correlations, Hydra links, cluster connections, manipulation flows
    """
    source_id: str = ""
    target_id: str = ""
    strength: float = 0.0  # 0-1
    correlation: float = 0.0  # 0-1
    color: str = "#ffffff"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure metadata is properly initialized"""
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "strength": self.strength,
            "correlation": self.correlation,
            "color": self.color,
            "metadata": self.metadata
        }


@dataclass
class ConstellationMap:
    """
    Complete 3D threat constellation map
    """
    nodes: List[ConstellationNode] = field(default_factory=list)
    edges: List[ConstellationEdge] = field(default_factory=list)
    global_risk_score: float = 0.0
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not isinstance(self.nodes, list):
            self.nodes = []
        if not isinstance(self.edges, list):
            self.edges = []
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "nodes": [n.to_dict() for n in self.nodes],
            "edges": [e.to_dict() for e in self.edges],
            "global_risk_score": self.global_risk_score,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


@dataclass
class ConstellationSummary:
    """
    Summary statistics for the constellation
    """
    total_nodes: int = 0
    total_edges: int = 0
    dominant_risk: str = "minimal"
    high_risk_entities: List[str] = field(default_factory=list)
    clusters_detected: int = 0
    hydra_heads_detected: int = 0
    notes: str = ""
    
    def __post_init__(self):
        """Ensure lists are properly initialized"""
        if not isinstance(self.high_risk_entities, list):
            self.high_risk_entities = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "total_nodes": self.total_nodes,
            "total_edges": self.total_edges,
            "dominant_risk": self.dominant_risk,
            "high_risk_entities": self.high_risk_entities,
            "clusters_detected": self.clusters_detected,
            "hydra_heads_detected": self.hydra_heads_detected,
            "notes": self.notes
        }

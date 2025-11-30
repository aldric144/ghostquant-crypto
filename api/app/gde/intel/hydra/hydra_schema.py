"""
Operation Hydra™ - Schema Definitions
Pure Python dataclasses for multi-head coordinated network detection
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List
from datetime import datetime


@dataclass
class HydraEntity:
    """
    Individual entity in a Hydra network
    """
    address: str = ""
    role: str = "node"  # leader, node, relay, proxy
    score: float = 0.0  # 0-1 risk score
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure metadata is properly initialized"""
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "address": self.address,
            "role": self.role,
            "score": self.score,
            "metadata": self.metadata
        }


@dataclass
class HydraCluster:
    """
    Multi-head coordinated network cluster
    """
    cluster_id: str = ""
    entities: List[HydraEntity] = field(default_factory=list)
    correlation_score: float = 0.0
    manipulation_score: float = 0.0
    volatility_score: float = 0.0
    coordination_strength: float = 0.0
    hydra_heads: int = 0  # ≥2
    risk_level: str = "minimal"
    summary: str = ""
    
    def __post_init__(self):
        """Ensure lists are properly initialized"""
        if not isinstance(self.entities, list):
            self.entities = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "cluster_id": self.cluster_id,
            "entities": [e.to_dict() for e in self.entities],
            "correlation_score": self.correlation_score,
            "manipulation_score": self.manipulation_score,
            "volatility_score": self.volatility_score,
            "coordination_strength": self.coordination_strength,
            "hydra_heads": self.hydra_heads,
            "risk_level": self.risk_level,
            "summary": self.summary
        }


@dataclass
class HydraReport:
    """
    Complete Hydra detection report
    """
    cluster: HydraCluster = field(default_factory=HydraCluster)
    narrative: str = ""
    indicators: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = ""
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not isinstance(self.indicators, dict):
            self.indicators = {}
        if not isinstance(self.cluster, HydraCluster):
            self.cluster = HydraCluster()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "cluster": self.cluster.to_dict(),
            "narrative": self.narrative,
            "indicators": self.indicators,
            "timestamp": self.timestamp
        }

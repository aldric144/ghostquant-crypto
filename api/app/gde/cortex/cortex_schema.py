"""
Cortex Memory Engine™ - Schema Definitions
Pure Python dataclasses for historical memory store
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid


@dataclass
class CortexMemoryRecord:
    """
    Individual memory record in Cortex historical store
    """
    id: str = ""
    timestamp: int = 0  # unix timestamp
    source: str = ""  # prediction, fusion, hydra, constellation, radar, dna, actor, oracle
    entity: Optional[str] = None
    token: Optional[str] = None
    chain: Optional[str] = None
    risk_score: float = 0.0
    classification: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.id:
            self.id = uuid.uuid4().hex
        if not self.timestamp:
            self.timestamp = int(datetime.utcnow().timestamp())
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "source": self.source,
            "entity": self.entity,
            "token": self.token,
            "chain": self.chain,
            "risk_score": self.risk_score,
            "classification": self.classification,
            "metadata": self.metadata
        }


@dataclass
class CortexSequencePattern:
    """
    Detected temporal sequence pattern for an entity
    """
    entity: str = ""
    sequence: List[Dict[str, Any]] = field(default_factory=list)  # ordered compressed summary of events
    confidence: float = 0.0  # 0-1
    pattern_type: str = ""  # escalation, accumulation, volatility, coordination
    strength: float = 0.0  # 0-1
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not isinstance(self.sequence, list):
            self.sequence = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "entity": self.entity,
            "sequence": self.sequence,
            "confidence": self.confidence,
            "pattern_type": self.pattern_type,
            "strength": self.strength
        }


@dataclass
class CortexLongHorizonPattern:
    """
    Long-horizon pattern analysis for an entity
    """
    entity: str = ""
    patterns: List[CortexSequencePattern] = field(default_factory=list)
    aggregate_risk: float = 0.0
    summary: str = ""  # 5-15 line narrative
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not isinstance(self.patterns, list):
            self.patterns = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "entity": self.entity,
            "patterns": [p.to_dict() for p in self.patterns],
            "aggregate_risk": self.aggregate_risk,
            "summary": self.summary
        }


@dataclass
class CortexGlobalMemorySummary:
    """
    Global summary of Cortex memory store
    """
    total_records: int = 0
    entities_tracked: int = 0
    tokens_tracked: int = 0
    chains_tracked: int = 0
    high_risk_entities: List[str] = field(default_factory=list)
    dominant_patterns: List[str] = field(default_factory=list)
    time_window_hours: int = 720  # 30 days default
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not isinstance(self.high_risk_entities, list):
            self.high_risk_entities = []
        if not isinstance(self.dominant_patterns, list):
            self.dominant_patterns = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "total_records": self.total_records,
            "entities_tracked": self.entities_tracked,
            "tokens_tracked": self.tokens_tracked,
            "chains_tracked": self.chains_tracked,
            "high_risk_entities": self.high_risk_entities,
            "dominant_patterns": self.dominant_patterns,
            "time_window_hours": self.time_window_hours
        }

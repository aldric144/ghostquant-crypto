"""
Threat Actor Schema - Pure Python dataclasses
Input/output models for threat actor profiling
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional


@dataclass
class ThreatActorInput:
    """
    Input data from all intelligence domains
    All fields are optional and default-safe
    """
    event: Optional[Dict[str, Any]] = None
    entity: Optional[Dict[str, Any]] = None
    chain: Optional[Dict[str, Any]] = None
    token: Optional[Dict[str, Any]] = None
    history: Optional[Dict[str, Any]] = None
    dna: Optional[Dict[str, Any]] = None
    correlation: Optional[Dict[str, Any]] = None
    fusion: Optional[Dict[str, Any]] = None
    radar: Optional[Dict[str, Any]] = None
    prediction: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        """Ensure all fields are dictionaries if None"""
        if self.event is None:
            self.event = {}
        if self.entity is None:
            self.entity = {}
        if self.chain is None:
            self.chain = {}
        if self.token is None:
            self.token = {}
        if self.history is None:
            self.history = {}
        if self.dna is None:
            self.dna = {}
        if self.correlation is None:
            self.correlation = {}
        if self.fusion is None:
            self.fusion = {}
        if self.radar is None:
            self.radar = {}
        if self.prediction is None:
            self.prediction = {}


@dataclass
class ThreatActorProfile:
    """
    Output threat actor profile
    All fields are default-safe
    """
    actor_type: str = "UNKNOWN ACTOR"
    risk_level: str = "UNKNOWN"
    confidence: float = 0.0
    indicators: List[str] = field(default_factory=list)
    behavioral_traits: List[str] = field(default_factory=list)
    coordination_traits: List[str] = field(default_factory=list)
    chain_traits: List[str] = field(default_factory=list)
    manipulation_traits: List[str] = field(default_factory=list)
    summary: str = ""
    recommendations: List[str] = field(default_factory=list)
    scores: Dict[str, float] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "actor_type": self.actor_type,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "indicators": self.indicators,
            "behavioral_traits": self.behavioral_traits,
            "coordination_traits": self.coordination_traits,
            "chain_traits": self.chain_traits,
            "manipulation_traits": self.manipulation_traits,
            "summary": self.summary,
            "recommendations": self.recommendations,
            "scores": self.scores
        }

"""
Phantom Deception Engine™ - Schema Definitions
Pure Python dataclasses for deception detection system
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime


@dataclass
class PhantomInput:
    """
    Input data for deception analysis
    """
    transcript: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    features: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not isinstance(self.metadata, dict):
            self.metadata = {}
        if not isinstance(self.features, dict):
            self.features = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "transcript": self.transcript,
            "metadata": self.metadata,
            "features": self.features
        }


@dataclass
class PhantomSignature:
    """
    Scammer signature classification
    """
    label: str = "UNKNOWN"
    score: float = 0.0
    pattern: str = ""
    risk_level: str = "UNKNOWN"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "label": self.label,
            "score": self.score,
            "pattern": self.pattern,
            "risk_level": self.risk_level
        }


@dataclass
class PhantomResult:
    """
    Complete deception analysis result
    """
    id: str = ""
    timestamp: str = ""
    deception_score: float = 0.0
    intent_score: float = 0.0
    synthetic_probability: float = 0.0
    actor_type: str = "UNKNOWN"
    classification: str = "UNKNOWN"
    flags: List[str] = field(default_factory=list)
    summary: str = ""
    narrative: str = ""
    features_used: Dict[str, Any] = field(default_factory=dict)
    signature: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not self.id:
            import random
            self.id = f"PHN-{int(datetime.utcnow().timestamp() * 1000)}-{random.randint(1000, 9999)}"
        if not isinstance(self.flags, list):
            self.flags = []
        if not isinstance(self.features_used, dict):
            self.features_used = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "deception_score": self.deception_score,
            "intent_score": self.intent_score,
            "synthetic_probability": self.synthetic_probability,
            "actor_type": self.actor_type,
            "classification": self.classification,
            "flags": self.flags,
            "summary": self.summary,
            "narrative": self.narrative,
            "features_used": self.features_used,
            "signature": self.signature
        }

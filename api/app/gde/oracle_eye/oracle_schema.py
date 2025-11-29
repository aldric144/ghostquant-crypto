"""
Oracle Eye™ - Schema Definitions
Pure Python dataclasses for visual deception detection
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List
from datetime import datetime


@dataclass
class OracleInput:
    """
    Input data for visual analysis
    """
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure metadata is properly initialized"""
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "metadata": self.metadata
        }


@dataclass
class OracleVisualSignals:
    """
    Visual fraud signals detected from metadata analysis
    """
    filename_anomaly: float = 0.0
    size_anomaly: float = 0.0
    extension_risk: float = 0.0
    metadata_inconsistency: float = 0.0
    hash_collision: float = 0.0
    source_risk: float = 0.0
    phishing_pattern: float = 0.0
    ui_mimicry: float = 0.0
    compression_artifact: float = 0.0
    timestamp_anomaly: float = 0.0
    description_mismatch: float = 0.0
    tag_suspicion: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "filename_anomaly": self.filename_anomaly,
            "size_anomaly": self.size_anomaly,
            "extension_risk": self.extension_risk,
            "metadata_inconsistency": self.metadata_inconsistency,
            "hash_collision": self.hash_collision,
            "source_risk": self.source_risk,
            "phishing_pattern": self.phishing_pattern,
            "ui_mimicry": self.ui_mimicry,
            "compression_artifact": self.compression_artifact,
            "timestamp_anomaly": self.timestamp_anomaly,
            "description_mismatch": self.description_mismatch,
            "tag_suspicion": self.tag_suspicion
        }


@dataclass
class OracleDeceptionScores:
    """
    Composite risk scores for visual deception
    """
    deception_risk: float = 0.0
    manipulation_signal: float = 0.0
    scam_likelihood: float = 0.0
    synthetic_artifact_score: float = 0.0
    trust_factor: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "deception_risk": self.deception_risk,
            "manipulation_signal": self.manipulation_signal,
            "scam_likelihood": self.scam_likelihood,
            "synthetic_artifact_score": self.synthetic_artifact_score,
            "trust_factor": self.trust_factor
        }


@dataclass
class OracleNarrative:
    """
    Intelligence narrative for visual analysis
    """
    assessment: str = ""
    indicators: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    likelihood: str = ""
    recommendations: List[str] = field(default_factory=list)
    full_narrative: str = ""
    
    def __post_init__(self):
        """Ensure lists are properly initialized"""
        if not isinstance(self.indicators, list):
            self.indicators = []
        if not isinstance(self.warnings, list):
            self.warnings = []
        if not isinstance(self.recommendations, list):
            self.recommendations = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "assessment": self.assessment,
            "indicators": self.indicators,
            "warnings": self.warnings,
            "likelihood": self.likelihood,
            "recommendations": self.recommendations,
            "full_narrative": self.full_narrative
        }


@dataclass
class OracleOutput:
    """
    Complete visual analysis output
    """
    id: str = ""
    timestamp: str = ""
    classification: str = "other"
    severity: str = "minimal"
    signals: Dict[str, Any] = field(default_factory=dict)
    scores: Dict[str, Any] = field(default_factory=dict)
    narrative: Dict[str, Any] = field(default_factory=dict)
    key_indicators: List[str] = field(default_factory=list)
    fraud_detected: bool = False
    fraud_types: List[str] = field(default_factory=list)
    metadata_analyzed: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not self.id:
            import random
            self.id = f"ORC-{int(datetime.utcnow().timestamp() * 1000)}-{random.randint(1000, 9999)}"
        if not isinstance(self.signals, dict):
            self.signals = {}
        if not isinstance(self.scores, dict):
            self.scores = {}
        if not isinstance(self.narrative, dict):
            self.narrative = {}
        if not isinstance(self.key_indicators, list):
            self.key_indicators = []
        if not isinstance(self.fraud_types, list):
            self.fraud_types = []
        if not isinstance(self.metadata_analyzed, dict):
            self.metadata_analyzed = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "classification": self.classification,
            "severity": self.severity,
            "signals": self.signals,
            "scores": self.scores,
            "narrative": self.narrative,
            "key_indicators": self.key_indicators,
            "fraud_detected": self.fraud_detected,
            "fraud_types": self.fraud_types,
            "metadata_analyzed": self.metadata_analyzed
        }

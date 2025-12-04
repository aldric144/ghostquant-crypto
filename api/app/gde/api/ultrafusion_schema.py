"""
Ultra-Fusion AI Supervisor™ - Schema Definitions
Pure Python dataclasses for meta-intelligence fusion
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List
from datetime import datetime


@dataclass
class SupervisorInput:
    """
    Input data for meta-intelligence supervision
    """
    entity: str = ""
    token: str = ""
    chain: str = ""
    image_metadata: Dict[str, Any] = field(default_factory=dict)
    events: List[Dict[str, Any]] = field(default_factory=list)
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not isinstance(self.image_metadata, dict):
            self.image_metadata = {}
        if not isinstance(self.events, list):
            self.events = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "entity": self.entity,
            "token": self.token,
            "chain": self.chain,
            "image_metadata": self.image_metadata,
            "events": self.events
        }


@dataclass
class SupervisorSignals:
    """
    Cross-engine meta-signals
    """
    contradiction_score: float = 0.0
    agreement_score: float = 0.0
    anomaly_amplification: float = 0.0
    threat_amplification: float = 0.0
    cross_ratio: float = 0.0
    multi_chain_pressure: float = 0.0
    temporal_escalation: float = 0.0
    blind_spot_score: float = 0.0
    data_completeness: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "contradiction_score": self.contradiction_score,
            "agreement_score": self.agreement_score,
            "anomaly_amplification": self.anomaly_amplification,
            "threat_amplification": self.threat_amplification,
            "cross_ratio": self.cross_ratio,
            "multi_chain_pressure": self.multi_chain_pressure,
            "temporal_escalation": self.temporal_escalation,
            "blind_spot_score": self.blind_spot_score,
            "data_completeness": self.data_completeness
        }


@dataclass
class SupervisorFusion:
    """
    Meta-fusion risk scoring
    """
    meta_score: float = 0.0
    prediction_score: float = 0.0
    fusion_score: float = 0.0
    radar_score: float = 0.0
    dna_score: float = 0.0
    actor_profile_score: float = 0.0
    cluster_score: float = 0.0
    image_score: float = 0.0
    contradiction_penalty: float = 0.0
    blindspot_penalty: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "meta_score": self.meta_score,
            "prediction_score": self.prediction_score,
            "fusion_score": self.fusion_score,
            "radar_score": self.radar_score,
            "dna_score": self.dna_score,
            "actor_profile_score": self.actor_profile_score,
            "cluster_score": self.cluster_score,
            "image_score": self.image_score,
            "contradiction_penalty": self.contradiction_penalty,
            "blindspot_penalty": self.blindspot_penalty
        }


@dataclass
class SupervisorDecision:
    """
    Supervisor decision and classification
    """
    classification: str = "MINIMAL"
    meta_score: float = 0.0
    confidence: float = 0.0
    recommendations: List[str] = field(default_factory=list)
    contradictions: List[str] = field(default_factory=list)
    blindspots: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        """Ensure lists are properly initialized"""
        if not isinstance(self.recommendations, list):
            self.recommendations = []
        if not isinstance(self.contradictions, list):
            self.contradictions = []
        if not isinstance(self.blindspots, list):
            self.blindspots = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "classification": self.classification,
            "meta_score": self.meta_score,
            "confidence": self.confidence,
            "recommendations": self.recommendations,
            "contradictions": self.contradictions,
            "blindspots": self.blindspots
        }


@dataclass
class SupervisorNarrative:
    """
    Meta-intelligence narrative
    """
    identity_view: str = ""
    behavioral_interpretation: str = ""
    fusion_analysis: str = ""
    timeline_synthesis: str = ""
    pattern_justification: str = ""
    threat_projection: str = ""
    contradictions_analysis: str = ""
    blindspots_analysis: str = ""
    analyst_verdict: str = ""
    full_narrative: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "identity_view": self.identity_view,
            "behavioral_interpretation": self.behavioral_interpretation,
            "fusion_analysis": self.fusion_analysis,
            "timeline_synthesis": self.timeline_synthesis,
            "pattern_justification": self.pattern_justification,
            "threat_projection": self.threat_projection,
            "contradictions_analysis": self.contradictions_analysis,
            "blindspots_analysis": self.blindspots_analysis,
            "analyst_verdict": self.analyst_verdict,
            "full_narrative": self.full_narrative
        }


@dataclass
class SupervisorSummary:
    """
    Executive summary
    """
    id: str = ""
    timestamp: str = ""
    entity: str = ""
    classification: str = "MINIMAL"
    meta_score: float = 0.0
    confidence: float = 0.0
    executive_summary: str = ""
    key_findings: List[str] = field(default_factory=list)
    critical_alerts: List[str] = field(default_factory=list)
    data_sources: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not self.id:
            import random
            self.id = f"UFS-{int(datetime.utcnow().timestamp() * 1000)}-{random.randint(1000, 9999)}"
        if not isinstance(self.key_findings, list):
            self.key_findings = []
        if not isinstance(self.critical_alerts, list):
            self.critical_alerts = []
        if not isinstance(self.data_sources, list):
            self.data_sources = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "entity": self.entity,
            "classification": self.classification,
            "meta_score": self.meta_score,
            "confidence": self.confidence,
            "executive_summary": self.executive_summary,
            "key_findings": self.key_findings,
            "critical_alerts": self.critical_alerts,
            "data_sources": self.data_sources
        }

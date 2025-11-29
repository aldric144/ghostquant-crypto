"""
Fusion Schema - Type-safe dataclasses for Multi-Domain Intelligence Fusion Engine.
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, List, Any
from datetime import datetime


@dataclass
class FusionInput:
    """
    Input data for fusion engine.
    All fields are optional to support partial fusion.
    """
    entity: Optional[Dict[str, Any]] = None
    token: Optional[Dict[str, Any]] = None
    chain: Optional[str] = None
    events: Optional[List[Dict[str, Any]]] = None
    history: Optional[List[Dict[str, Any]]] = None
    neighbors: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)


@dataclass
class FusionComponentScores:
    """
    Individual component scores from different intelligence sources.
    All scores normalized to 0-1 range.
    """
    prediction: float = 0.0
    dna: float = 0.0
    history: float = 0.0
    correlation: float = 0.0
    ring: float = 0.0
    chain: float = 0.0
    
    prediction_event_risk: float = 0.0
    prediction_manipulation_risk: float = 0.0
    prediction_token_direction: float = 0.0
    prediction_token_volatility: float = 0.0
    prediction_ring_probability: float = 0.0
    prediction_chain_pressure: float = 0.0
    
    dna_archetype_score: float = 0.0
    dna_manipulation_bias: float = 0.0
    dna_stealth_factor: float = 0.0
    dna_coordination_signal: float = 0.0
    
    history_activity_density: float = 0.0
    history_burstiness: float = 0.0
    history_anomaly_rate: float = 0.0
    history_cross_chain_frequency: float = 0.0
    
    correlation_avg_score: float = 0.0
    correlation_max_score: float = 0.0
    correlation_coordinated_flag: bool = False
    
    ring_membership_probability: float = 0.0
    ring_cluster_size: int = 0
    
    chain_pressure_score: float = 0.0
    chain_congestion: float = 0.0


@dataclass
class FusionOutput:
    """
    Output from fusion engine with unified intelligence score and narrative.
    """
    success: bool = True
    fused_score: float = 0.0
    classification: str = "minimal"
    components: Optional[FusionComponentScores] = None
    narrative: str = ""
    
    entity_address: Optional[str] = None
    token_symbol: Optional[str] = None
    chain_name: Optional[str] = None
    
    high_risk_flag: bool = False
    coordinated_actor_flag: bool = False
    manipulation_flag: bool = False
    ring_member_flag: bool = False
    
    recommendations: List[str] = field(default_factory=list)
    
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'success': self.success,
            'fused_score': self.fused_score,
            'classification': self.classification,
            'components': self.components.__dict__ if self.components else {},
            'narrative': self.narrative,
            'entity_address': self.entity_address,
            'token_symbol': self.token_symbol,
            'chain_name': self.chain_name,
            'high_risk_flag': self.high_risk_flag,
            'coordinated_actor_flag': self.coordinated_actor_flag,
            'manipulation_flag': self.manipulation_flag,
            'ring_member_flag': self.ring_member_flag,
            'recommendations': self.recommendations,
            'timestamp': self.timestamp,
            'error': self.error
        }

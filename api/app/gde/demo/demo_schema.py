"""
Demo Schema Definitions
Data structures for synthetic demo intelligence.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DemoEvent(BaseModel):
    """Synthetic event for demo purposes."""
    event_id: str
    timestamp: datetime
    event_type: str
    severity: str
    source_address: str
    target_address: Optional[str] = None
    amount: float
    token: str
    chain: str
    risk_score: int
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoEntity(BaseModel):
    """Synthetic entity for demo purposes."""
    address: str
    entity_type: str
    risk_score: int
    confidence: float
    first_seen: datetime
    last_seen: datetime
    transaction_count: int
    total_volume: float
    flags: List[str]
    connections: int
    cluster_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoToken(BaseModel):
    """Synthetic token for demo purposes."""
    token_address: str
    symbol: str
    name: str
    chain: str
    risk_score: int
    manipulation_probability: float
    holder_count: int
    liquidity: float
    volume_24h: float
    price_change_24h: float
    flags: List[str]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoChain(BaseModel):
    """Synthetic chain metrics for demo purposes."""
    chain_name: str
    threat_level: int
    active_threats: int
    monitored_entities: int
    suspicious_transactions: int
    network_health: float
    congestion_level: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoPrediction(BaseModel):
    """Synthetic prediction for demo purposes."""
    prediction_id: str
    timestamp: datetime
    entity: str
    prediction_type: str
    risk_level: str
    confidence: float
    timeframe: str
    indicators: List[Dict[str, Any]]
    recommendation: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoFusion(BaseModel):
    """Synthetic UltraFusion analysis for demo purposes."""
    fusion_id: str
    timestamp: datetime
    entity: str
    meta_signals: Dict[str, float]
    engine_contributions: Dict[str, Dict[str, Any]]
    unified_risk_score: int
    confidence: float
    recommendation: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoSentinel(BaseModel):
    """Synthetic Sentinel status for demo purposes."""
    timestamp: datetime
    engine_status: Dict[str, Dict[str, Any]]
    active_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    system_health: float
    uptime: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoConstellation(BaseModel):
    """Synthetic Constellation map data for demo purposes."""
    timestamp: datetime
    total_entities: int
    threat_clusters: List[Dict[str, Any]]
    supernovas: int
    wormholes: int
    nebulas: int
    global_risk_level: int
    regions: Dict[str, Dict[str, Any]]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoHydra(BaseModel):
    """Synthetic Hydra detection for demo purposes."""
    detection_id: str
    timestamp: datetime
    attack_type: str
    severity: str
    confidence: float
    relay_chain: List[str]
    coordination_score: float
    entities_involved: int
    attack_signature: str
    recommendation: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoUltraFusion(BaseModel):
    """Synthetic UltraFusion meta-analysis for demo purposes."""
    analysis_id: str
    timestamp: datetime
    entity: str
    behavioral_anomaly_score: int
    network_threat_level: int
    predictive_risk_index: int
    manipulation_probability: int
    entity_confidence_score: int
    systemic_pressure_gauge: int
    overall_assessment: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoDNA(BaseModel):
    """Synthetic Behavioral DNA for demo purposes."""
    dna_id: str
    timestamp: datetime
    entity: str
    behavioral_signature: str
    pattern_consistency: float
    anomaly_detection: List[Dict[str, Any]]
    risk_evolution: List[Dict[str, float]]
    classification: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoActorProfile(BaseModel):
    """Synthetic Actor Profile for demo purposes."""
    profile_id: str
    timestamp: datetime
    entity: str
    actor_type: str
    risk_category: str
    threat_level: int
    behavioral_traits: List[str]
    known_associations: List[str]
    activity_timeline: List[Dict[str, Any]]
    recommendation: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoCortexPattern(BaseModel):
    """Synthetic Cortex memory pattern for demo purposes."""
    pattern_id: str
    timestamp: datetime
    pattern_name: str
    frequency: str
    confidence: float
    first_detected: datetime
    last_detected: datetime
    occurrences: int
    entities_involved: List[str]
    pattern_description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoAccessRequest(BaseModel):
    """Enterprise access request from demo."""
    name: str
    organization: str
    email: str
    phone: Optional[str] = None
    use_case: str
    questions: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

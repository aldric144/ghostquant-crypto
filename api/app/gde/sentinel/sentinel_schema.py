"""
Sentinel Command Console™ - Schema Definitions
Pure Python dataclasses for real-time command center
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List
from datetime import datetime


@dataclass
class SentinelHeartbeat:
    """
    System heartbeat with engine health and latency
    """
    active_engines: List[str] = field(default_factory=list)
    engine_health: Dict[str, str] = field(default_factory=dict)  # engine -> status
    latency_map: Dict[str, float] = field(default_factory=dict)  # engine -> latency_ms
    system_load: float = 0.0
    timestamp: str = ""
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not isinstance(self.active_engines, list):
            self.active_engines = []
        if not isinstance(self.engine_health, dict):
            self.engine_health = {}
        if not isinstance(self.latency_map, dict):
            self.latency_map = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "active_engines": self.active_engines,
            "engine_health": self.engine_health,
            "latency_map": self.latency_map,
            "system_load": self.system_load,
            "timestamp": self.timestamp
        }


@dataclass
class SentinelPanelStatus:
    """
    Status for individual intelligence panel
    """
    panel_name: str = ""
    status: str = "unknown"  # operational | degraded | offline
    risk_score: float = 0.0
    data: Dict[str, Any] = field(default_factory=dict)
    last_updated: str = ""
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.last_updated:
            self.last_updated = datetime.utcnow().isoformat()
        if not isinstance(self.data, dict):
            self.data = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "panel_name": self.panel_name,
            "status": self.status,
            "risk_score": self.risk_score,
            "data": self.data,
            "last_updated": self.last_updated
        }


@dataclass
class SentinelGlobalStatus:
    """
    Unified global status across all engines
    """
    global_risk_level: float = 0.0
    threat_level: str = "minimal"  # critical | high | elevated | moderate | low | minimal
    hydra_heads: int = 0
    constellation_clusters: int = 0
    fusion_score: float = 0.0
    active_threats: int = 0
    system_health: str = "operational"
    timestamp: str = ""
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "global_risk_level": self.global_risk_level,
            "threat_level": self.threat_level,
            "hydra_heads": self.hydra_heads,
            "constellation_clusters": self.constellation_clusters,
            "fusion_score": self.fusion_score,
            "active_threats": self.active_threats,
            "system_health": self.system_health,
            "timestamp": self.timestamp
        }


@dataclass
class SentinelAlert:
    """
    Alert triggered by Sentinel monitoring
    """
    alert_id: str = ""
    severity: str = "low"  # critical | high | medium | low
    source_engine: str = ""
    message: str = ""
    risk_score: float = 0.0
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not self.alert_id:
            self.alert_id = f"ALERT-{int(datetime.utcnow().timestamp() * 1000)}"
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "alert_id": self.alert_id,
            "severity": self.severity,
            "source_engine": self.source_engine,
            "message": self.message,
            "risk_score": self.risk_score,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


@dataclass
class SentinelDashboard:
    """
    Complete Sentinel Command Console dashboard
    """
    heartbeat: SentinelHeartbeat = field(default_factory=SentinelHeartbeat)
    global_status: SentinelGlobalStatus = field(default_factory=SentinelGlobalStatus)
    panels: List[SentinelPanelStatus] = field(default_factory=list)
    alerts: List[SentinelAlert] = field(default_factory=list)
    top_threat_entities: List[str] = field(default_factory=list)
    heatmap_snapshot: Dict[str, Any] = field(default_factory=dict)
    summary: str = ""
    timestamp: str = ""
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not isinstance(self.panels, list):
            self.panels = []
        if not isinstance(self.alerts, list):
            self.alerts = []
        if not isinstance(self.top_threat_entities, list):
            self.top_threat_entities = []
        if not isinstance(self.heatmap_snapshot, dict):
            self.heatmap_snapshot = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "heartbeat": self.heartbeat.to_dict(),
            "global_status": self.global_status.to_dict(),
            "panels": [p.to_dict() for p in self.panels],
            "alerts": [a.to_dict() for a in self.alerts],
            "top_threat_entities": self.top_threat_entities,
            "heatmap_snapshot": self.heatmap_snapshot,
            "summary": self.summary,
            "timestamp": self.timestamp
        }

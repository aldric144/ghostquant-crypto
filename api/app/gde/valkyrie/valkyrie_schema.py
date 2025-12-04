"""
Valkyrie Threat Warning System™ - Schema Definitions
Pure Python dataclasses for alert system
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime


@dataclass
class ValkyrieTrigger:
    """
    Trigger event that may generate an alert
    """
    trigger_type: str = ""
    source_domain: str = ""  # prediction/dna/correlation/fusion/radar/actor
    score: float = 0.0
    reason: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = ""
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "trigger_type": self.trigger_type,
            "source_domain": self.source_domain,
            "score": self.score,
            "reason": self.reason,
            "metadata": self.metadata,
            "timestamp": self.timestamp
        }


@dataclass
class ValkyrieAlert:
    """
    Complete threat alert with severity and escalation
    """
    id: str = ""
    timestamp: str = ""
    entity: str = ""
    actor_type: str = ""
    risk_score: float = 0.0
    severity_level: str = "green"  # green/yellow/orange/red/purple
    trigger_type: str = ""
    reason: str = ""
    summary: str = ""
    escalation_level: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure all fields are properly initialized"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not self.id:
            import random
            self.id = f"VAL-{int(datetime.utcnow().timestamp() * 1000)}-{random.randint(1000, 9999)}"
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "entity": self.entity,
            "actor_type": self.actor_type,
            "risk_score": self.risk_score,
            "severity_level": self.severity_level,
            "trigger_type": self.trigger_type,
            "reason": self.reason,
            "summary": self.summary,
            "escalation_level": self.escalation_level,
            "metadata": self.metadata
        }


@dataclass
class ValkyrieEscalation:
    """
    Current escalation status
    """
    level: int = 0  # 0-4
    level_name: str = "No Threat"
    summary: str = ""
    alert_count_5m: int = 0
    alert_count_15m: int = 0
    critical_alerts: int = 0
    timestamp: str = ""
    
    def __post_init__(self):
        """Ensure timestamp is set"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "level": self.level,
            "level_name": self.level_name,
            "summary": self.summary,
            "alert_count_5m": self.alert_count_5m,
            "alert_count_15m": self.alert_count_15m,
            "critical_alerts": self.critical_alerts,
            "timestamp": self.timestamp
        }


@dataclass
class ValkyrieFeedResponse:
    """
    Response containing alert feed
    """
    success: bool = True
    alerts: List[Dict[str, Any]] = field(default_factory=list)
    count: int = 0
    escalation: Optional[Dict[str, Any]] = None
    timestamp: str = ""
    error: str = ""
    
    def __post_init__(self):
        """Ensure timestamp is set"""
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()
        if not isinstance(self.alerts, list):
            self.alerts = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "success": self.success,
            "alerts": self.alerts,
            "count": self.count,
            "escalation": self.escalation,
            "timestamp": self.timestamp,
            "error": self.error
        }

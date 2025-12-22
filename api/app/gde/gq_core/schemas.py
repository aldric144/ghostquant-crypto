"""
GQ-Core Response Schemas

All GQ-Core responses include:
- source: "real" or "synthetic" 
- timestamp: ISO format timestamp
- data: The actual payload
"""

from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel
from datetime import datetime


class GQCoreResponse(BaseModel):
    """Base response schema for all GQ-Core endpoints."""
    source: Literal["real", "synthetic"]
    timestamp: str
    data: Any
    fallback_reason: Optional[str] = None


class RiskData(BaseModel):
    overall_score: float
    threat_level: str
    distribution: Dict[str, int]
    top_risks: List[Dict[str, Any]]
    trend: str


class WhaleData(BaseModel):
    total_whales: int
    active_24h: int
    total_volume: float
    top_whales: List[Dict[str, Any]]
    recent_movements: List[Dict[str, Any]]


class TrendData(BaseModel):
    hourly_activity: List[Dict[str, Any]]
    heatmap: List[Dict[str, Any]]
    events: List[Dict[str, Any]]
    categories: List[str]


class MapData(BaseModel):
    hot_zones: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]
    total_events: int


class AnomalyData(BaseModel):
    total_anomalies: int
    critical_count: int
    outliers: List[Dict[str, Any]]
    patterns: List[Dict[str, Any]]


class EntityData(BaseModel):
    total_entities: int
    entities: List[Dict[str, Any]]
    categories: Dict[str, int]


class NarrativeData(BaseModel):
    summary: str
    top_threats: List[Dict[str, Any]]
    topics: List[Dict[str, Any]]
    sentiment: str


class RingData(BaseModel):
    total_rings: int
    active_rings: int
    rings: List[Dict[str, Any]]
    severity_distribution: Dict[str, int]


class SystemStatusData(BaseModel):
    websocket: Dict[str, Any]
    worker: Dict[str, Any]
    redis: Dict[str, Any]
    engines: Dict[str, Any]
    uptime_seconds: int
    mode: str  # "real-time" or "fallback"


class OverviewData(BaseModel):
    risk: RiskData
    whales: WhaleData
    rings: RingData
    anomalies: AnomalyData
    system: SystemStatusData

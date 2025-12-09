"""
Animated Threat Timeline Engine - Phase 10

Records all constellation events chronologically and builds a time-ordered
threat narrative for the 60-120 minute rolling window.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from collections import deque
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ThreatSeverity(str, Enum):
    """Severity levels for threat events."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class TimelineEventType(str, Enum):
    """Types of events in the threat timeline."""
    HYDRA_DETECTION = "hydra_detection"
    WHALE_MOVEMENT = "whale_movement"
    LARGE_TRANSFER = "large_transfer"
    CLUSTER_FORMATION = "cluster_formation"
    RISK_SPIKE = "risk_spike"
    ENTITY_FLAGGED = "entity_flagged"
    MIXER_ACTIVITY = "mixer_activity"
    EXPLOIT_DETECTED = "exploit_detected"
    COORDINATION_DETECTED = "coordination_detected"
    ANOMALY_DETECTED = "anomaly_detected"
    LABEL_ASSIGNED = "label_assigned"
    SYSTEM_ALERT = "system_alert"


@dataclass
class TimelineEvent:
    """A single event in the threat timeline."""
    event_id: str
    event_type: TimelineEventType
    severity: ThreatSeverity
    title: str
    description: str
    timestamp: str
    entities_involved: List[str] = field(default_factory=list)
    clusters_involved: List[str] = field(default_factory=list)
    risk_impact: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    narrative_text: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type.value,
            "severity": self.severity.value,
            "title": self.title,
            "description": self.description,
            "timestamp": self.timestamp,
            "entities_involved": self.entities_involved,
            "clusters_involved": self.clusters_involved,
            "risk_impact": self.risk_impact,
            "metadata": self.metadata,
            "narrative_text": self.narrative_text,
        }


@dataclass
class ThreatNarrative:
    """A compiled threat narrative for a time window."""
    window_start: str
    window_end: str
    total_events: int
    critical_events: int
    high_events: int
    dominant_threat_type: str
    risk_trend: str  # increasing, decreasing, stable
    key_entities: List[str]
    key_clusters: List[str]
    summary: str
    detailed_narrative: str
    events: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "window_start": self.window_start,
            "window_end": self.window_end,
            "total_events": self.total_events,
            "critical_events": self.critical_events,
            "high_events": self.high_events,
            "dominant_threat_type": self.dominant_threat_type,
            "risk_trend": self.risk_trend,
            "key_entities": self.key_entities,
            "key_clusters": self.key_clusters,
            "summary": self.summary,
            "detailed_narrative": self.detailed_narrative,
            "events": self.events,
        }


class ConstellationTimelineEngine:
    """
    Animated Threat Timeline Engine.
    
    Records all constellation events chronologically and builds
    a time-ordered threat narrative for visualization.
    
    Features:
    - 60-120 minute rolling window
    - Real-time event recording
    - Automatic narrative generation
    - WebSocket streaming for live updates
    """
    
    # Default window sizes
    DEFAULT_WINDOW_MINUTES = 60
    MAX_WINDOW_MINUTES = 120
    MAX_EVENTS = 10000
    
    # Narrative templates
    NARRATIVE_TEMPLATES = {
        TimelineEventType.HYDRA_DETECTION: "Hydra coordination detected involving {count} entities with {confidence:.0%} confidence.",
        TimelineEventType.WHALE_MOVEMENT: "Whale movement of ${amount:,.0f} detected from {source}.",
        TimelineEventType.LARGE_TRANSFER: "Large transfer of ${amount:,.0f} between {source} and {target}.",
        TimelineEventType.CLUSTER_FORMATION: "New cluster '{cluster_id}' formed with {node_count} nodes.",
        TimelineEventType.RISK_SPIKE: "Risk spike detected: global risk increased to {risk:.1%}.",
        TimelineEventType.ENTITY_FLAGGED: "Entity {entity_id} flagged as {flag_type}.",
        TimelineEventType.MIXER_ACTIVITY: "Mixer activity detected involving {entity_id}.",
        TimelineEventType.EXPLOIT_DETECTED: "Potential exploit detected: {description}.",
        TimelineEventType.COORDINATION_DETECTED: "Coordinated activity detected among {count} entities.",
        TimelineEventType.ANOMALY_DETECTED: "Anomaly detected: {description}.",
        TimelineEventType.LABEL_ASSIGNED: "Entity {entity_id} classified as {label}.",
        TimelineEventType.SYSTEM_ALERT: "System alert: {message}.",
    }
    
    def __init__(self, window_minutes: int = DEFAULT_WINDOW_MINUTES):
        self.window_minutes = min(window_minutes, self.MAX_WINDOW_MINUTES)
        self.events: deque = deque(maxlen=self.MAX_EVENTS)
        self._event_counter = 0
        self._stream_clients: List[WebSocket] = []
        self._lock = asyncio.Lock()
        
    def _generate_event_id(self) -> str:
        """Generate a unique event ID."""
        self._event_counter += 1
        return f"tl_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{self._event_counter}"
    
    def _determine_severity(
        self,
        event_type: TimelineEventType,
        metadata: Dict[str, Any],
    ) -> ThreatSeverity:
        """Determine severity based on event type and metadata."""
        # Critical events
        if event_type in [TimelineEventType.EXPLOIT_DETECTED]:
            return ThreatSeverity.CRITICAL
        
        # High severity based on risk impact
        risk_impact = metadata.get("risk_impact", 0)
        if risk_impact > 0.7:
            return ThreatSeverity.CRITICAL
        elif risk_impact > 0.5:
            return ThreatSeverity.HIGH
        
        # Event type based severity
        severity_map = {
            TimelineEventType.HYDRA_DETECTION: ThreatSeverity.HIGH,
            TimelineEventType.MIXER_ACTIVITY: ThreatSeverity.HIGH,
            TimelineEventType.RISK_SPIKE: ThreatSeverity.HIGH,
            TimelineEventType.WHALE_MOVEMENT: ThreatSeverity.MEDIUM,
            TimelineEventType.LARGE_TRANSFER: ThreatSeverity.MEDIUM,
            TimelineEventType.CLUSTER_FORMATION: ThreatSeverity.MEDIUM,
            TimelineEventType.COORDINATION_DETECTED: ThreatSeverity.MEDIUM,
            TimelineEventType.ANOMALY_DETECTED: ThreatSeverity.MEDIUM,
            TimelineEventType.ENTITY_FLAGGED: ThreatSeverity.LOW,
            TimelineEventType.LABEL_ASSIGNED: ThreatSeverity.INFO,
            TimelineEventType.SYSTEM_ALERT: ThreatSeverity.INFO,
        }
        
        return severity_map.get(event_type, ThreatSeverity.INFO)
    
    def _generate_narrative_text(
        self,
        event_type: TimelineEventType,
        metadata: Dict[str, Any],
    ) -> str:
        """Generate narrative text for an event."""
        template = self.NARRATIVE_TEMPLATES.get(event_type, "{description}")
        
        try:
            # Prepare template variables
            variables = {
                "count": metadata.get("count", 0),
                "confidence": metadata.get("confidence", 0),
                "amount": metadata.get("amount_usd", metadata.get("amount", 0)),
                "source": metadata.get("source", metadata.get("from_address", "unknown")),
                "target": metadata.get("target", metadata.get("to_address", "unknown")),
                "cluster_id": metadata.get("cluster_id", "unknown"),
                "node_count": metadata.get("node_count", 0),
                "risk": metadata.get("risk", metadata.get("risk_score", 0)),
                "entity_id": metadata.get("entity_id", metadata.get("node_id", "unknown")),
                "flag_type": metadata.get("flag_type", "suspicious"),
                "label": metadata.get("label", metadata.get("predicted_type", "unknown")),
                "description": metadata.get("description", "No details available"),
                "message": metadata.get("message", "No message"),
            }
            
            return template.format(**variables)
        except Exception as e:
            logger.warning(f"Failed to generate narrative: {e}")
            return metadata.get("description", "Event occurred")
    
    async def record_event(
        self,
        event_type: TimelineEventType,
        title: str,
        description: str,
        entities_involved: List[str] = None,
        clusters_involved: List[str] = None,
        metadata: Dict[str, Any] = None,
    ) -> TimelineEvent:
        """
        Record a new event in the timeline.
        
        Args:
            event_type: Type of the event
            title: Short title for the event
            description: Detailed description
            entities_involved: List of entity IDs involved
            clusters_involved: List of cluster IDs involved
            metadata: Additional event metadata
        
        Returns:
            The recorded TimelineEvent
        """
        metadata = metadata or {}
        entities_involved = entities_involved or []
        clusters_involved = clusters_involved or []
        
        # Determine severity
        severity = self._determine_severity(event_type, metadata)
        
        # Generate narrative text
        narrative_text = self._generate_narrative_text(event_type, metadata)
        
        # Calculate risk impact
        risk_impact = metadata.get("risk_impact", 0.0)
        if not risk_impact:
            # Estimate risk impact based on severity
            risk_map = {
                ThreatSeverity.CRITICAL: 0.8,
                ThreatSeverity.HIGH: 0.5,
                ThreatSeverity.MEDIUM: 0.3,
                ThreatSeverity.LOW: 0.1,
                ThreatSeverity.INFO: 0.0,
            }
            risk_impact = risk_map.get(severity, 0.0)
        
        # Create event
        event = TimelineEvent(
            event_id=self._generate_event_id(),
            event_type=event_type,
            severity=severity,
            title=title,
            description=description,
            timestamp=datetime.utcnow().isoformat(),
            entities_involved=entities_involved,
            clusters_involved=clusters_involved,
            risk_impact=risk_impact,
            metadata=metadata,
            narrative_text=narrative_text,
        )
        
        # Add to timeline
        async with self._lock:
            self.events.append(event)
        
        # Broadcast to WebSocket clients
        await self._broadcast_event(event)
        
        # Also emit to main stream server
        await self._emit_to_stream_server(event)
        
        return event
    
    async def _broadcast_event(self, event: TimelineEvent) -> None:
        """Broadcast event to all connected WebSocket clients."""
        if not self._stream_clients:
            return
        
        message = {
            "type": "timeline_event",
            "event": event.to_dict(),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        disconnected = []
        for client in self._stream_clients:
            try:
                await client.send_json(message)
            except Exception:
                disconnected.append(client)
        
        # Remove disconnected clients
        for client in disconnected:
            self._stream_clients.remove(client)
    
    async def _emit_to_stream_server(self, event: TimelineEvent) -> None:
        """Emit event to the main constellation stream server."""
        try:
            from app.gde.constellation_fusion_stream.stream_server import (
                constellation_stream_server,
                StreamEventType,
            )
            
            await constellation_stream_server.emit_stream_event(
                event_type=StreamEventType.TIMELINE_EVENT,
                payload=event.to_dict(),
                source_engine="timeline_engine",
            )
        except ImportError:
            pass  # Stream server not available
        except Exception as e:
            logger.warning(f"Failed to emit to stream server: {e}")
    
    def get_events(
        self,
        window_minutes: Optional[int] = None,
        severity_filter: Optional[List[ThreatSeverity]] = None,
        event_type_filter: Optional[List[TimelineEventType]] = None,
        limit: int = 100,
    ) -> List[TimelineEvent]:
        """
        Get events from the timeline.
        
        Args:
            window_minutes: Time window in minutes (default: configured window)
            severity_filter: Filter by severity levels
            event_type_filter: Filter by event types
            limit: Maximum number of events to return
        
        Returns:
            List of TimelineEvent objects
        """
        window = window_minutes or self.window_minutes
        cutoff = datetime.utcnow() - timedelta(minutes=window)
        cutoff_str = cutoff.isoformat()
        
        # Filter events
        filtered = []
        for event in reversed(self.events):  # Most recent first
            # Time filter
            if event.timestamp < cutoff_str:
                continue
            
            # Severity filter
            if severity_filter and event.severity not in severity_filter:
                continue
            
            # Event type filter
            if event_type_filter and event.event_type not in event_type_filter:
                continue
            
            filtered.append(event)
            
            if len(filtered) >= limit:
                break
        
        return filtered
    
    def build_narrative(
        self,
        window_minutes: Optional[int] = None,
    ) -> ThreatNarrative:
        """
        Build a threat narrative for the specified time window.
        
        Args:
            window_minutes: Time window in minutes
        
        Returns:
            ThreatNarrative with summary and detailed narrative
        """
        window = window_minutes or self.window_minutes
        events = self.get_events(window_minutes=window, limit=1000)
        
        if not events:
            return ThreatNarrative(
                window_start=(datetime.utcnow() - timedelta(minutes=window)).isoformat(),
                window_end=datetime.utcnow().isoformat(),
                total_events=0,
                critical_events=0,
                high_events=0,
                dominant_threat_type="none",
                risk_trend="stable",
                key_entities=[],
                key_clusters=[],
                summary="No significant threat activity detected in the monitoring window.",
                detailed_narrative="The constellation remains stable with no notable events.",
                events=[],
            )
        
        # Count by severity
        critical_count = sum(1 for e in events if e.severity == ThreatSeverity.CRITICAL)
        high_count = sum(1 for e in events if e.severity == ThreatSeverity.HIGH)
        
        # Find dominant threat type
        type_counts = {}
        for e in events:
            type_counts[e.event_type.value] = type_counts.get(e.event_type.value, 0) + 1
        dominant_type = max(type_counts.items(), key=lambda x: x[1])[0] if type_counts else "none"
        
        # Collect key entities and clusters
        entity_counts = {}
        cluster_counts = {}
        for e in events:
            for entity in e.entities_involved:
                entity_counts[entity] = entity_counts.get(entity, 0) + 1
            for cluster in e.clusters_involved:
                cluster_counts[cluster] = cluster_counts.get(cluster, 0) + 1
        
        key_entities = sorted(entity_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        key_clusters = sorted(cluster_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Determine risk trend
        if len(events) >= 2:
            recent_risk = sum(e.risk_impact for e in events[:len(events)//2])
            older_risk = sum(e.risk_impact for e in events[len(events)//2:])
            if recent_risk > older_risk * 1.2:
                risk_trend = "increasing"
            elif recent_risk < older_risk * 0.8:
                risk_trend = "decreasing"
            else:
                risk_trend = "stable"
        else:
            risk_trend = "stable"
        
        # Generate summary
        summary_parts = []
        if critical_count > 0:
            summary_parts.append(f"{critical_count} critical threat(s) detected")
        if high_count > 0:
            summary_parts.append(f"{high_count} high-severity event(s)")
        summary_parts.append(f"dominant activity: {dominant_type.replace('_', ' ')}")
        summary_parts.append(f"risk trend: {risk_trend}")
        summary = ". ".join(summary_parts).capitalize() + "."
        
        # Generate detailed narrative
        narrative_parts = []
        narrative_parts.append(f"Over the past {window} minutes, the constellation recorded {len(events)} events.")
        
        if critical_count > 0:
            narrative_parts.append(f"CRITICAL: {critical_count} critical threat(s) require immediate attention.")
        
        if key_entities:
            entity_list = ", ".join(f"{e[0][:10]}... ({e[1]} events)" for e in key_entities[:3])
            narrative_parts.append(f"Key entities involved: {entity_list}.")
        
        if key_clusters:
            cluster_list = ", ".join(f"{c[0]} ({c[1]} events)" for c in key_clusters)
            narrative_parts.append(f"Active clusters: {cluster_list}.")
        
        # Add recent critical/high events to narrative
        important_events = [e for e in events if e.severity in [ThreatSeverity.CRITICAL, ThreatSeverity.HIGH]][:5]
        if important_events:
            narrative_parts.append("Recent important events:")
            for e in important_events:
                narrative_parts.append(f"  - [{e.severity.value.upper()}] {e.narrative_text}")
        
        detailed_narrative = " ".join(narrative_parts)
        
        return ThreatNarrative(
            window_start=(datetime.utcnow() - timedelta(minutes=window)).isoformat(),
            window_end=datetime.utcnow().isoformat(),
            total_events=len(events),
            critical_events=critical_count,
            high_events=high_count,
            dominant_threat_type=dominant_type,
            risk_trend=risk_trend,
            key_entities=[e[0] for e in key_entities],
            key_clusters=[c[0] for c in key_clusters],
            summary=summary,
            detailed_narrative=detailed_narrative,
            events=[e.to_dict() for e in events[:50]],  # Include top 50 events
        )
    
    async def connect_client(self, websocket: WebSocket) -> None:
        """Connect a WebSocket client for timeline streaming."""
        await websocket.accept()
        self._stream_clients.append(websocket)
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to threat timeline stream",
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # Send recent events
        recent_events = self.get_events(limit=20)
        await websocket.send_json({
            "type": "initial_events",
            "events": [e.to_dict() for e in recent_events],
            "timestamp": datetime.utcnow().isoformat(),
        })
    
    def disconnect_client(self, websocket: WebSocket) -> None:
        """Disconnect a WebSocket client."""
        if websocket in self._stream_clients:
            self._stream_clients.remove(websocket)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get timeline statistics."""
        events = list(self.events)
        
        severity_counts = {}
        type_counts = {}
        for e in events:
            severity_counts[e.severity.value] = severity_counts.get(e.severity.value, 0) + 1
            type_counts[e.event_type.value] = type_counts.get(e.event_type.value, 0) + 1
        
        return {
            "total_events": len(events),
            "window_minutes": self.window_minutes,
            "connected_clients": len(self._stream_clients),
            "severity_distribution": severity_counts,
            "event_type_distribution": type_counts,
            "oldest_event": events[0].timestamp if events else None,
            "newest_event": events[-1].timestamp if events else None,
        }


# Global timeline engine instance
timeline_engine = ConstellationTimelineEngine()


# FastAPI Router
router = APIRouter(
    prefix="/gde/constellation",
    tags=["Constellation Timeline"],
)


@router.get("/timeline")
async def get_timeline(
    window_minutes: int = 60,
    limit: int = 100,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
):
    """
    Get threat timeline events.
    
    Args:
        window_minutes: Time window in minutes (max 120)
        limit: Maximum number of events to return
        severity: Filter by severity (critical, high, medium, low, info)
        event_type: Filter by event type
    
    Returns:
        List of timeline events with narrative
    """
    # Parse filters
    severity_filter = None
    if severity:
        try:
            severity_filter = [ThreatSeverity(severity)]
        except ValueError:
            pass
    
    event_type_filter = None
    if event_type:
        try:
            event_type_filter = [TimelineEventType(event_type)]
        except ValueError:
            pass
    
    events = timeline_engine.get_events(
        window_minutes=min(window_minutes, 120),
        severity_filter=severity_filter,
        event_type_filter=event_type_filter,
        limit=limit,
    )
    
    narrative = timeline_engine.build_narrative(window_minutes=min(window_minutes, 120))
    
    return {
        "success": True,
        "timeline": {
            "events": [e.to_dict() for e in events],
            "narrative": narrative.to_dict(),
            "stats": timeline_engine.get_stats(),
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/timeline/narrative")
async def get_timeline_narrative(window_minutes: int = 60):
    """Get the threat narrative for the specified time window."""
    narrative = timeline_engine.build_narrative(window_minutes=min(window_minutes, 120))
    
    return {
        "success": True,
        "narrative": narrative.to_dict(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/timeline/stats")
async def get_timeline_stats():
    """Get timeline statistics."""
    return {
        "success": True,
        "stats": timeline_engine.get_stats(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/timeline/record")
async def record_timeline_event(data: Dict[str, Any]):
    """
    Record a new event in the timeline.
    
    Request body:
        - event_type: str (hydra_detection, whale_movement, etc.)
        - title: str
        - description: str
        - entities_involved: optional list of entity IDs
        - clusters_involved: optional list of cluster IDs
        - metadata: optional dict with additional data
    """
    event_type_str = data.get("event_type", "system_alert")
    try:
        event_type = TimelineEventType(event_type_str)
    except ValueError:
        event_type = TimelineEventType.SYSTEM_ALERT
    
    event = await timeline_engine.record_event(
        event_type=event_type,
        title=data.get("title", "Event"),
        description=data.get("description", ""),
        entities_involved=data.get("entities_involved", []),
        clusters_involved=data.get("clusters_involved", []),
        metadata=data.get("metadata", {}),
    )
    
    return {
        "success": True,
        "event": event.to_dict(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.websocket("/timeline/stream")
async def websocket_timeline_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time threat timeline streaming.
    
    Connection flow:
    1. Client connects
    2. Receives connection confirmation
    3. Receives initial batch of recent events
    4. Receives real-time events as they occur
    
    Client messages:
    - {"action": "get_narrative"} - Request current narrative
    - {"action": "ping"} - Heartbeat
    """
    await timeline_engine.connect_client(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            
            if action == "get_narrative":
                window = data.get("window_minutes", 60)
                narrative = timeline_engine.build_narrative(window_minutes=window)
                await websocket.send_json({
                    "type": "narrative",
                    "narrative": narrative.to_dict(),
                    "timestamp": datetime.utcnow().isoformat(),
                })
            
            elif action == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            
            elif action == "get_stats":
                await websocket.send_json({
                    "type": "stats",
                    "stats": timeline_engine.get_stats(),
                    "timestamp": datetime.utcnow().isoformat(),
                })
    
    except WebSocketDisconnect:
        timeline_engine.disconnect_client(websocket)
    except Exception as e:
        logger.error(f"Timeline WebSocket error: {e}")
        timeline_engine.disconnect_client(websocket)


@router.get("/timeline/types")
async def get_timeline_types():
    """Get list of all possible event types and severities."""
    return {
        "success": True,
        "event_types": [et.value for et in TimelineEventType],
        "severities": [s.value for s in ThreatSeverity],
        "timestamp": datetime.utcnow().isoformat(),
    }

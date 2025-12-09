"""
Constellation Fusion Stream Server - Phase 10

Real-time WebSocket streaming engine for the Constellation Fusion Pipeline.
Broadcasts fusion events to connected clients without modifying existing code.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Set, Optional, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class StreamEventType(str, Enum):
    """Types of events that can be streamed."""
    FUSION_EVENT = "fusion_event"
    NODE_UPDATE = "node_update"
    EDGE_UPDATE = "edge_update"
    CLUSTER_UPDATE = "cluster_update"
    RISK_UPDATE = "risk_update"
    LABEL_UPDATE = "label_update"
    TIMELINE_EVENT = "timeline_event"
    HEARTBEAT = "heartbeat"
    CONNECTION = "connection"
    ERROR = "error"


@dataclass
class StreamEvent:
    """A streamable event."""
    event_type: StreamEventType
    payload: Dict[str, Any]
    source_engine: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    event_id: str = field(default_factory=lambda: f"evt_{datetime.utcnow().timestamp()}")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_type": self.event_type.value if isinstance(self.event_type, StreamEventType) else self.event_type,
            "payload": self.payload,
            "source_engine": self.source_engine,
            "timestamp": self.timestamp,
            "event_id": self.event_id,
        }


class ConnectionManager:
    """Manages WebSocket connections for constellation streaming."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._event_queue: asyncio.Queue = asyncio.Queue()
        self._broadcast_task: Optional[asyncio.Task] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._running = False
        
    async def connect(self, websocket: WebSocket, client_id: Optional[str] = None) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)
            self.subscriptions[websocket] = {"all"}  # Default subscription
            self.connection_metadata[websocket] = {
                "client_id": client_id or f"client_{len(self.active_connections)}",
                "connected_at": datetime.utcnow().isoformat(),
                "events_received": 0,
            }
        
        # Send connection confirmation
        await self._send_to_client(websocket, StreamEvent(
            event_type=StreamEventType.CONNECTION,
            payload={
                "status": "connected",
                "client_id": self.connection_metadata[websocket]["client_id"],
                "subscriptions": list(self.subscriptions[websocket]),
            },
            source_engine="stream_server",
        ))
        
        logger.info(f"Client connected: {self.connection_metadata[websocket]['client_id']}")
    
    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        self.subscriptions.pop(websocket, None)
        metadata = self.connection_metadata.pop(websocket, {})
        logger.info(f"Client disconnected: {metadata.get('client_id', 'unknown')}")
    
    async def subscribe(self, websocket: WebSocket, event_types: List[str]) -> None:
        """Subscribe a client to specific event types."""
        async with self._lock:
            if websocket in self.subscriptions:
                self.subscriptions[websocket].update(event_types)
    
    async def unsubscribe(self, websocket: WebSocket, event_types: List[str]) -> None:
        """Unsubscribe a client from specific event types."""
        async with self._lock:
            if websocket in self.subscriptions:
                self.subscriptions[websocket] -= set(event_types)
    
    async def broadcast(self, event: StreamEvent) -> None:
        """Broadcast an event to all subscribed clients."""
        await self._event_queue.put(event)
    
    async def _send_to_client(self, websocket: WebSocket, event: StreamEvent) -> bool:
        """Send an event to a specific client."""
        try:
            await websocket.send_json(event.to_dict())
            if websocket in self.connection_metadata:
                self.connection_metadata[websocket]["events_received"] += 1
            return True
        except Exception as e:
            logger.warning(f"Failed to send to client: {e}")
            return False
    
    async def _broadcast_worker(self) -> None:
        """Worker that processes the broadcast queue."""
        while self._running:
            try:
                event = await asyncio.wait_for(self._event_queue.get(), timeout=1.0)
                
                # Get list of connections to broadcast to
                async with self._lock:
                    connections = list(self.active_connections)
                
                # Broadcast to all subscribed clients
                disconnected = []
                for websocket in connections:
                    subs = self.subscriptions.get(websocket, set())
                    event_type_str = event.event_type.value if isinstance(event.event_type, StreamEventType) else event.event_type
                    
                    if "all" in subs or event_type_str in subs or event.source_engine in subs:
                        success = await self._send_to_client(websocket, event)
                        if not success:
                            disconnected.append(websocket)
                
                # Clean up disconnected clients
                for ws in disconnected:
                    self.disconnect(ws)
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Broadcast worker error: {e}")
    
    async def _heartbeat_worker(self) -> None:
        """Send periodic heartbeats to all connected clients."""
        while self._running:
            try:
                await asyncio.sleep(30)  # Heartbeat every 30 seconds
                
                heartbeat = StreamEvent(
                    event_type=StreamEventType.HEARTBEAT,
                    payload={
                        "active_connections": len(self.active_connections),
                        "server_time": datetime.utcnow().isoformat(),
                    },
                    source_engine="stream_server",
                )
                
                await self.broadcast(heartbeat)
                
            except Exception as e:
                logger.error(f"Heartbeat worker error: {e}")
    
    async def start(self) -> None:
        """Start the broadcast and heartbeat workers."""
        if not self._running:
            self._running = True
            self._broadcast_task = asyncio.create_task(self._broadcast_worker())
            self._heartbeat_task = asyncio.create_task(self._heartbeat_worker())
            logger.info("Stream server workers started")
    
    async def stop(self) -> None:
        """Stop the broadcast and heartbeat workers."""
        self._running = False
        if self._broadcast_task:
            self._broadcast_task.cancel()
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        logger.info("Stream server workers stopped")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get connection statistics."""
        return {
            "active_connections": len(self.active_connections),
            "total_subscriptions": sum(len(s) for s in self.subscriptions.values()),
            "queue_size": self._event_queue.qsize(),
            "running": self._running,
        }


# Global connection manager instance
stream_manager = ConnectionManager()


class ConstellationStreamServer:
    """
    WebSocket streaming server for Constellation Fusion events.
    
    Subscribes to the fusion_registry event bus WITHOUT altering it,
    and broadcasts events to connected WebSocket clients.
    """
    
    def __init__(self):
        self.manager = stream_manager
        self._event_handlers: Dict[str, List[Callable]] = {}
        self._fusion_listener_active = False
        
    def register_event_handler(self, event_type: str, handler: Callable) -> None:
        """Register a handler for a specific event type."""
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        self._event_handlers[event_type].append(handler)
    
    async def emit_stream_event(
        self,
        event_type: StreamEventType,
        payload: Dict[str, Any],
        source_engine: str = "constellation_fusion",
    ) -> None:
        """Emit an event to all connected WebSocket clients."""
        event = StreamEvent(
            event_type=event_type,
            payload=payload,
            source_engine=source_engine,
        )
        await self.manager.broadcast(event)
        
        # Call registered handlers
        event_type_str = event_type.value if isinstance(event_type, StreamEventType) else event_type
        for handler in self._event_handlers.get(event_type_str, []):
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Event handler error: {e}")
    
    async def start_fusion_listener(self) -> None:
        """
        Start listening to the fusion_registry event bus.
        This subscribes to events WITHOUT modifying the registry.
        """
        if self._fusion_listener_active:
            return
            
        self._fusion_listener_active = True
        
        try:
            # Import fusion registry to subscribe to events
            from app.gde.constellation_fusion.fusion_registry import fusion_registry
            
            # Register a callback that forwards events to WebSocket clients
            async def forward_to_websocket(event_type: str, payload: Dict[str, Any], source_engine: str):
                await self.emit_stream_event(
                    event_type=StreamEventType.FUSION_EVENT,
                    payload={
                        "fusion_event_type": event_type,
                        "data": payload,
                    },
                    source_engine=source_engine,
                )
            
            # Add event handler to registry (this is additive, not modifying)
            fusion_registry.add_event_handler("*", lambda e: asyncio.create_task(
                forward_to_websocket(e.event_type, e.payload, e.source_engine)
            ))
            
            logger.info("Fusion listener started - forwarding events to WebSocket clients")
            
        except ImportError:
            logger.warning("Fusion registry not available - running in standalone mode")
        except Exception as e:
            logger.error(f"Failed to start fusion listener: {e}")
    
    async def start(self) -> None:
        """Start the stream server."""
        await self.manager.start()
        await self.start_fusion_listener()
    
    async def stop(self) -> None:
        """Stop the stream server."""
        await self.manager.stop()
        self._fusion_listener_active = False


# Global stream server instance
constellation_stream_server = ConstellationStreamServer()


# FastAPI Router
router = APIRouter(
    prefix="/gde/constellation",
    tags=["Constellation Stream"],
)


@router.websocket("/stream")
async def websocket_constellation_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time constellation fusion events.
    
    Connection flow:
    1. Client connects
    2. Receives connection confirmation with client_id
    3. Can send subscription messages to filter events
    4. Receives real-time fusion events as they occur
    5. Receives periodic heartbeats (every 30s)
    
    Client messages:
    - {"action": "subscribe", "event_types": ["fusion_event", "risk_update"]}
    - {"action": "unsubscribe", "event_types": ["fusion_event"]}
    - {"action": "ping"}
    """
    await stream_manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            
            if action == "subscribe":
                event_types = data.get("event_types", [])
                await stream_manager.subscribe(websocket, event_types)
                await websocket.send_json({
                    "type": "subscribed",
                    "event_types": event_types,
                    "timestamp": datetime.utcnow().isoformat(),
                })
            
            elif action == "unsubscribe":
                event_types = data.get("event_types", [])
                await stream_manager.unsubscribe(websocket, event_types)
                await websocket.send_json({
                    "type": "unsubscribed",
                    "event_types": event_types,
                    "timestamp": datetime.utcnow().isoformat(),
                })
            
            elif action == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            
            elif action == "stats":
                stats = stream_manager.get_stats()
                await websocket.send_json({
                    "type": "stats",
                    "data": stats,
                    "timestamp": datetime.utcnow().isoformat(),
                })
    
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        stream_manager.disconnect(websocket)


@router.get("/stream/stats")
async def get_stream_stats():
    """Get WebSocket stream statistics."""
    return {
        "success": True,
        "stats": stream_manager.get_stats(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/stream/broadcast")
async def broadcast_event(event_type: str, payload: Dict[str, Any], source_engine: str = "api"):
    """
    Manually broadcast an event to all connected WebSocket clients.
    Useful for testing and external integrations.
    """
    try:
        event_type_enum = StreamEventType(event_type)
    except ValueError:
        event_type_enum = StreamEventType.FUSION_EVENT
    
    await constellation_stream_server.emit_stream_event(
        event_type=event_type_enum,
        payload=payload,
        source_engine=source_engine,
    )
    
    return {
        "success": True,
        "message": f"Event '{event_type}' broadcast to {len(stream_manager.active_connections)} clients",
        "timestamp": datetime.utcnow().isoformat(),
    }

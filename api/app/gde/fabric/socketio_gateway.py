import asyncio
import json
import time
import os
from typing import Dict, Any, Set
from datetime import datetime
import socketio

from app.gde.fabric.redis_bus import RedisBus


class SocketIOGateway:
    """
    Socket.IO gateway for GhostQuant 4.7.3.
    Provides real-time alert distribution across multiple channels.
    
    Features:
    - Multiple alert rooms (alerts, signals, intelligence, manipulation, events)
    - Redis integration for alert distribution
    - Client event handling (connect, disconnect, subscribe, unsubscribe)
    - Connection statistics and monitoring
    """
    
    def __init__(self):
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins='*',
            logger=True,
            engineio_logger=False
        )
        
        self.redis_bus = RedisBus()
        self.running = False
        self._poll_tasks = []
        
        self.rooms = [
            "alerts",
            "signals", 
            "intelligence",
            "manipulation",
            "events",
            "system",  # System status room for Settings V2
            "analytics"  # Analytics room for weekly heatmap updates
        ]
        
        # Track worker start time for uptime calculation
        self._started_at = datetime.utcnow()
        
        self.client_rooms: Dict[str, Set[str]] = {}
        
        self._register_handlers()
    
    def _register_handlers(self):
        """Register Socket.IO event handlers."""
        
        @self.sio.event
        async def connect(sid, environ):
            """Handle client connection."""
            print(f"[SocketIO] Client connected: {sid}")
            self.client_rooms[sid] = set()
            
            await self.sio.emit('connection', {
                'status': 'connected',
                'timestamp': datetime.utcnow().isoformat(),
                'message': 'Connected to GhostQuant Socket.IO Gateway',
                'available_rooms': self.rooms
            }, room=sid)
        
        @self.sio.event
        async def disconnect(sid):
            """Handle client disconnection."""
            print(f"[SocketIO] Client disconnected: {sid}")
            if sid in self.client_rooms:
                del self.client_rooms[sid]
        
        @self.sio.event
        async def subscribe(sid, data):
            """Handle room subscription."""
            room = data.get('room')
            
            if not room:
                await self.sio.emit('error', {
                    'message': 'Room name required'
                }, room=sid)
                return
            
            if room not in self.rooms:
                await self.sio.emit('error', {
                    'message': f'Invalid room: {room}',
                    'available_rooms': self.rooms
                }, room=sid)
                return
            
            await self.sio.enter_room(sid, room)
            
            if sid in self.client_rooms:
                self.client_rooms[sid].add(room)
            
            print(f"[SocketIO] Client {sid} subscribed to {room}")
            
            await self.sio.emit('subscribed', {
                'room': room,
                'timestamp': datetime.utcnow().isoformat()
            }, room=sid)
        
        @self.sio.event
        async def unsubscribe(sid, data):
            """Handle room unsubscription."""
            room = data.get('room')
            
            if not room:
                await self.sio.emit('error', {
                    'message': 'Room name required'
                }, room=sid)
                return
            
            await self.sio.leave_room(sid, room)
            
            if sid in self.client_rooms and room in self.client_rooms[sid]:
                self.client_rooms[sid].discard(room)
            
            print(f"[SocketIO] Client {sid} unsubscribed from {room}")
            
            await self.sio.emit('unsubscribed', {
                'room': room,
                'timestamp': datetime.utcnow().isoformat()
            }, room=sid)
        
        @self.sio.event
        async def ping(sid):
            """Handle ping request."""
            await self.sio.emit('pong', {
                'timestamp': datetime.utcnow().isoformat()
            }, room=sid)
        
        @self.sio.event
        async def stats(sid):
            """Handle stats request."""
            stats = self.get_stats()
            await self.sio.emit('stats', stats, room=sid)
    
    async def start_polling(self):
        """Start polling Redis channels and broadcasting to rooms."""
        self.running = True
        print("[SocketIO] Started polling Redis channels")
        
        self._poll_tasks = [
            asyncio.create_task(self._poll_channel("intel.alerts", "alerts")),
            asyncio.create_task(self._poll_channel("intel.signals", "signals")),
            asyncio.create_task(self._poll_channel("intel.intelligence", "intelligence")),
            asyncio.create_task(self._poll_channel("intel.manipulation", "manipulation")),
            asyncio.create_task(self._poll_channel("intel.events", "events")),
            asyncio.create_task(self._broadcast_system_status()),  # System status for Settings V2
            asyncio.create_task(self._broadcast_analytics_updates())  # Analytics updates for heatmap
        ]
    
    async def stop_polling(self):
        """Stop polling Redis channels."""
        self.running = False
        
        for task in self._poll_tasks:
            task.cancel()
        
        await asyncio.gather(*self._poll_tasks, return_exceptions=True)
        
        print("[SocketIO] Stopped polling Redis channels")
    
    async def _poll_channel(self, redis_channel: str, room: str):
        """Poll a Redis channel and broadcast messages to a Socket.IO room."""
        while self.running:
            try:
                messages = await self.redis_bus.get_latest(redis_channel, count=10)
                
                for message_data in messages:
                    if isinstance(message_data, str):
                        try:
                            message = json.loads(message_data)
                            await self.broadcast_to_room(room, {
                                'type': room,
                                'data': message,
                                'timestamp': datetime.utcnow().isoformat()
                            })
                        except json.JSONDecodeError:
                            pass
                
                await asyncio.sleep(1.0)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[SocketIO] Error polling {redis_channel}: {str(e)}")
                await asyncio.sleep(5.0)
    
    async def _broadcast_system_status(self):
        """Broadcast system status to the 'system' room every 2 seconds."""
        while self.running:
            try:
                # Import here to avoid circular imports
                from app.cache import get_redis
                from app.routers.system import system_metrics
                
                # Get Redis connection status
                redis = get_redis()
                redis_connected = redis and redis.enabled
                
                # Measure Redis latency
                latency = 0
                if redis_connected:
                    try:
                        start = time.time()
                        redis._execute("PING")
                        latency = int((time.time() - start) * 1000)
                    except Exception:
                        latency = -1
                
                # Get worker status
                try:
                    from app.main import background_worker
                    worker_running = background_worker.is_running
                except Exception:
                    worker_running = system_metrics.get("worker_running", False)
                
                # Calculate uptime
                uptime_seconds = int((datetime.utcnow() - self._started_at).total_seconds())
                
                # Get Redis event count
                total_events = system_metrics.get("total_events", 0)
                if redis_connected:
                    try:
                        keys = redis.keys("intel:*")
                        total_events = len(keys) if keys else total_events
                    except Exception:
                        pass
                
                # Broadcast system_status
                await self.broadcast_to_room("system", {
                    "type": "system_status",
                    "data": {
                        "connection": "connected" if redis_connected else "disconnected",
                        "reconnectCount": system_metrics.get("reconnect_count", 0),
                        "latency": latency,
                        "lastAlert": system_metrics.get("last_alert"),
                        "wsClientCount": len(self.client_rooms)
                    },
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Broadcast worker_status
                await self.broadcast_to_room("system", {
                    "type": "worker_status",
                    "data": {
                        "running": worker_running,
                        "pid": os.getpid(),
                        "uptime": uptime_seconds,
                        "simulationMode": system_metrics.get("simulation_mode", False),
                        "loopSpeed": 50,
                        "queueSize": system_metrics.get("queue_size", 0),
                        "processingErrors": system_metrics.get("processing_errors", 0)
                    },
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Broadcast redis_feed
                await self.broadcast_to_room("system", {
                    "type": "redis_feed",
                    "data": {
                        "connected": redis_connected,
                        "totalEvents": total_events,
                        "feedVelocity": system_metrics.get("feed_velocity", 0),
                        "lastMessage": system_metrics.get("last_alert"),
                        "severity": {
                            "high": system_metrics.get("high_severity", 0),
                            "medium": system_metrics.get("medium_severity", 0),
                            "low": system_metrics.get("low_severity", 0)
                        }
                    },
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Broadcast engine_metrics
                await self.broadcast_to_room("system", {
                    "type": "engine_metrics",
                    "data": {
                        "timelineEvents": system_metrics.get("timeline_events", 0),
                        "graphNodes": system_metrics.get("graph_nodes", 0),
                        "graphEdges": system_metrics.get("graph_edges", 0),
                        "ringSystems": system_metrics.get("ring_systems", 0),
                        "ghostmindInsights": system_metrics.get("ghostmind_insights", 0),
                        "entityCacheSize": system_metrics.get("entity_cache_size", 0)
                    },
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                await asyncio.sleep(2.0)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[SocketIO] Error broadcasting system status: {str(e)}")
                await asyncio.sleep(5.0)

    async def _broadcast_analytics_updates(self):
        """Broadcast analytics updates to the 'analytics' room every 30 seconds."""
        import random
        
        while self.running:
            try:
                days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                
                # Generate weekly heatmap data
                datasets = [{
                    "manipulation": [random.randint(5, 30) for _ in range(7)],
                    "whale": [random.randint(2, 15) for _ in range(7)],
                    "darkpool": [random.randint(3, 20) for _ in range(7)],
                    "stablecoin": [random.randint(1, 10) for _ in range(7)]
                }]
                
                # Generate hourly heatmap data (7 days x 24 hours = 168 points)
                hourly = []
                for day in days:
                    for hour in range(24):
                        base_value = 30 if 8 <= hour <= 20 else 10
                        value = random.randint(base_value - 10, base_value + 40)
                        hourly.append({
                            "day": day,
                            "hour": hour,
                            "value": value
                        })
                
                # Broadcast weekly_heatmap_update
                await self.broadcast_to_room("analytics", {
                    "type": "weekly_heatmap_update",
                    "data": {
                        "labels": days,
                        "datasets": datasets,
                        "hourly": hourly,
                        "categories": ["manipulation", "whale", "darkpool", "stablecoin"]
                    },
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                await asyncio.sleep(30.0)  # Update every 30 seconds
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[SocketIO] Error broadcasting analytics updates: {str(e)}")
                await asyncio.sleep(60.0)

    async def broadcast_to_room(self, room: str, message: Dict[str, Any]):
        """Broadcast a message to all clients in a room."""
        try:
            await self.sio.emit('message', message, room=room)
        except Exception as e:
            print(f"[SocketIO] Error broadcasting to {room}: {str(e)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current gateway statistics."""
        return {
            'active_clients': len(self.client_rooms),
            'rooms': self.rooms,
            'polling_active': self.running,
            'client_subscriptions': {
                sid: list(rooms) for sid, rooms in self.client_rooms.items()
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_asgi_app(self):
        """Get the ASGI app for mounting in FastAPI."""
        return socketio.ASGIApp(self.sio)

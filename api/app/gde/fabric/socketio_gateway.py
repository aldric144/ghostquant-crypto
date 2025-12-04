import asyncio
import json
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
            "events"
        ]
        
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
            asyncio.create_task(self._poll_channel("intel.events", "events"))
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

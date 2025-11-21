import asyncio
import json
from typing import Set, Dict, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect

from app.gde.fabric.redis_bus import RedisBus


class WebSocketAlertEngine:
    """
    WebSocket alert engine for GhostQuant 4.7.
    Streams real-time intelligence alerts to connected clients.
    
    Features:
    - Multiple concurrent client connections
    - Automatic reconnect handling
    - Graceful slow client handling (non-blocking)
    - Redis integration for alert distribution
    """
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.redis_bus = RedisBus()
        self.running = False
        self._poll_task = None
    
    async def connect(self, websocket: WebSocket):
        """
        Accept and register a new WebSocket client.
        """
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"[WebSocketAlertEngine] Client connected. Total clients: {len(self.active_connections)}")
        
        await self._send_to_client(websocket, {
            "type": "connection",
            "status": "connected",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Connected to GhostQuant Alert Stream"
        })
    
    def disconnect(self, websocket: WebSocket):
        """
        Unregister a WebSocket client.
        """
        self.active_connections.discard(websocket)
        print(f"[WebSocketAlertEngine] Client disconnected. Total clients: {len(self.active_connections)}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcast a message to all connected clients.
        Handles slow clients gracefully by using non-blocking sends.
        """
        if not self.active_connections:
            return
        
        disconnected_clients = set()
        
        for connection in self.active_connections:
            try:
                await asyncio.wait_for(
                    self._send_to_client(connection, message),
                    timeout=2.0
                )
            except asyncio.TimeoutError:
                print(f"[WebSocketAlertEngine] Client timeout - slow client detected")
                disconnected_clients.add(connection)
            except Exception as e:
                print(f"[WebSocketAlertEngine] Error sending to client: {str(e)}")
                disconnected_clients.add(connection)
        
        for client in disconnected_clients:
            self.disconnect(client)
    
    async def _send_to_client(self, websocket: WebSocket, message: Dict[str, Any]):
        """
        Send a message to a specific client.
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            raise e
    
    async def start_polling(self):
        """
        Start polling Redis for new alerts and broadcast them to clients.
        This is a workaround until we implement native Redis pub/sub.
        """
        self.running = True
        print("[WebSocketAlertEngine] Started polling for alerts")
        
        while self.running:
            try:
                alerts = await self.redis_bus.get_latest("intel.alerts", count=10)
                
                for alert_data in alerts:
                    if isinstance(alert_data, str):
                        try:
                            alert = json.loads(alert_data)
                            await self.broadcast({
                                "type": "alert",
                                "data": alert,
                                "timestamp": datetime.utcnow().isoformat()
                            })
                        except json.JSONDecodeError:
                            pass
                
                await asyncio.sleep(1.0)
                
            except Exception as e:
                print(f"[WebSocketAlertEngine] Error polling alerts: {str(e)}")
                await asyncio.sleep(5.0)
    
    async def stop_polling(self):
        """
        Stop polling for alerts.
        """
        self.running = False
        print("[WebSocketAlertEngine] Stopped polling for alerts")
    
    async def send_heartbeat(self, websocket: WebSocket):
        """
        Send periodic heartbeat to keep connection alive.
        """
        try:
            while websocket in self.active_connections:
                await self._send_to_client(websocket, {
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                })
                await asyncio.sleep(30)
        except Exception:
            pass
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get current engine statistics.
        """
        return {
            "active_connections": len(self.active_connections),
            "polling_active": self.running,
            "timestamp": datetime.utcnow().isoformat()
        }

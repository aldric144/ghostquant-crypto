"""
WebSocket server for real-time momentum updates.
Broadcasts top N momentum changes to subscribed clients.
"""
import os
import logging
import json
import asyncio
from typing import Set, Dict, Any, List
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from .redis_cache import RedisCache

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manage WebSocket connections and broadcast momentum updates.
    Supports subscriptions to:
    - "top50": Top 50 coins by momentum
    - "symbol:BTC": Specific symbol updates
    - "all": All updates
    """
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        self.redis_cache = RedisCache()
        self.heartbeat_seconds = int(os.getenv("WEBSOCKET_HEARTBEAT_SECONDS", 30))
        self.last_snapshot = {}
        self.broadcast_task = None
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        self.subscriptions[websocket] = {"top50"}  # Default subscription
        logger.info(f"WebSocket connected: {websocket.client}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        self.subscriptions.pop(websocket, None)
        logger.info(f"WebSocket disconnected: {websocket.client}")
    
    async def subscribe(self, websocket: WebSocket, channels: List[str]):
        """Subscribe to specific channels."""
        if websocket not in self.subscriptions:
            self.subscriptions[websocket] = set()
        
        for channel in channels:
            self.subscriptions[websocket].add(channel)
        
        logger.info(f"WebSocket {websocket.client} subscribed to {channels}")
    
    async def unsubscribe(self, websocket: WebSocket, channels: List[str]):
        """Unsubscribe from specific channels."""
        if websocket not in self.subscriptions:
            return
        
        for channel in channels:
            self.subscriptions[websocket].discard(channel)
        
        logger.info(f"WebSocket {websocket.client} unsubscribed from {channels}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message to {websocket.client}: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any], channel: str = "all"):
        """
        Broadcast a message to all subscribed clients.
        
        Args:
            message: Message to broadcast
            channel: Channel to broadcast on (e.g., "top50", "symbol:BTC", "all")
        """
        disconnected = []
        
        for websocket in self.active_connections:
            try:
                subs = self.subscriptions.get(websocket, set())
                
                if "all" in subs or channel in subs:
                    await websocket.send_json(message)
            
            except WebSocketDisconnect:
                disconnected.append(websocket)
            except Exception as e:
                logger.error(f"Error broadcasting to {websocket.client}: {e}")
                disconnected.append(websocket)
        
        for ws in disconnected:
            self.disconnect(ws)
    
    async def broadcast_top_updates(self):
        """
        Broadcast top N momentum updates.
        Called periodically by the background task.
        """
        try:
            scored_coins = await self.redis_cache.get_scored_coins()
            
            if not scored_coins:
                return
            
            scored_coins.sort(key=lambda x: x.get("momentum_score", 0), reverse=True)
            top_50 = scored_coins[:50]
            
            updates = []
            for coin in top_50:
                coin_id = coin.get("id")
                current_score = coin.get("momentum_score", 0)
                
                previous_score = self.last_snapshot.get(coin_id, current_score)
                delta = current_score - previous_score
                
                if abs(delta) > 0.1:  # Only include if changed
                    updates.append({
                        "id": coin_id,
                        "symbol": coin.get("symbol"),
                        "name": coin.get("name"),
                        "momentum_score": round(current_score, 2),
                        "delta": round(delta, 2),
                        "action": coin.get("action"),
                        "whale_confidence": coin.get("whale_confidence", 0),
                        "pretrend_prob": coin.get("pretrend_prob", 0)
                    })
                
                self.last_snapshot[coin_id] = current_score
            
            if updates:
                message = {
                    "type": "top_update",
                    "timestamp": datetime.utcnow().isoformat(),
                    "data": updates
                }
                
                await self.broadcast(message, channel="top50")
                logger.info(f"Broadcasted {len(updates)} momentum updates")
        
        except Exception as e:
            logger.error(f"Error broadcasting top updates: {e}", exc_info=True)
    
    async def broadcast_symbol_update(self, symbol: str, coin_data: Dict[str, Any]):
        """
        Broadcast update for a specific symbol.
        """
        try:
            message = {
                "type": "symbol_update",
                "timestamp": datetime.utcnow().isoformat(),
                "symbol": symbol,
                "data": coin_data
            }
            
            await self.broadcast(message, channel=f"symbol:{symbol.upper()}")
        
        except Exception as e:
            logger.error(f"Error broadcasting symbol update for {symbol}: {e}")
    
    async def send_heartbeat(self):
        """Send heartbeat to all connected clients."""
        message = {
            "type": "heartbeat",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.broadcast(message, channel="all")
    
    async def start_broadcast_loop(self):
        """
        Start the background broadcast loop.
        Periodically broadcasts top updates and heartbeats.
        """
        logger.info("Starting WebSocket broadcast loop...")
        
        while True:
            try:
                await self.broadcast_top_updates()
                
                await self.send_heartbeat()
                
                await asyncio.sleep(self.heartbeat_seconds)
            
            except Exception as e:
                logger.error(f"Error in broadcast loop: {e}", exc_info=True)
                await asyncio.sleep(5)
    
    def start(self):
        """Start the broadcast loop as a background task."""
        if self.broadcast_task is None or self.broadcast_task.done():
            self.broadcast_task = asyncio.create_task(self.start_broadcast_loop())
            logger.info("WebSocket broadcast task started")
    
    def stop(self):
        """Stop the broadcast loop."""
        if self.broadcast_task and not self.broadcast_task.done():
            self.broadcast_task.cancel()
            logger.info("WebSocket broadcast task stopped")


_ws_manager = None


def get_ws_manager() -> WebSocketManager:
    """Get or create the global WebSocket manager."""
    global _ws_manager
    if _ws_manager is None:
        _ws_manager = WebSocketManager()
    return _ws_manager

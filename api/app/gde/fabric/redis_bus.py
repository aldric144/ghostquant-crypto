import os
import json
import httpx
from typing import Dict, Any, Optional, Callable
from datetime import datetime


class RedisBus:
    """
    Redis message bus for GhostQuant intelligence distribution.
    Uses Upstash Redis REST API for pub/sub messaging.
    
    Channels:
    - intel.events: Raw market events
    - intel.intelligence: Processed intelligence
    - intel.signals: AI-generated signals
    - intel.alerts: High-priority alerts
    - intel.manipulation: Manipulation detection results
    - intel.timeline: Behavioral timeline updates
    """
    
    def __init__(self):
        self.rest_url = os.getenv("REDIS_REST_URL")
        self.rest_token = os.getenv("REDIS_REST_TOKEN")
        self.enabled = bool(self.rest_url and self.rest_token)
        
        if not self.enabled:
            print("[RedisBus] REDIS_REST_URL and REDIS_REST_TOKEN not set - RedisBus disabled")
        
        self.headers = {
            "Authorization": f"Bearer {self.rest_token}",
            "Content-Type": "application/json"
        }
        
        self.channels = [
            "intel.events",
            "intel.intelligence",
            "intel.signals",
            "intel.alerts",
            "intel.manipulation",
            "intel.timeline"
        ]
    
    async def publish(self, channel: str, message: Dict[str, Any]) -> bool:
        """
        Publish a message to a Redis channel via REST API.
        Uses list-based pub/sub simulation since Upstash REST doesn't support native pub/sub.
        
        Args:
            channel: Channel name (e.g., "intel.signals")
            message: Message payload (will be JSON-serialized)
        
        Returns:
            bool: True if published successfully
        """
        if not self.enabled:
            return False
        
        try:
            if "timestamp" not in message:
                message["timestamp"] = datetime.utcnow().isoformat()
            
            payload = json.dumps(message)
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Use LPUSH to add message to list (simulating pub/sub)
                response = await client.post(
                    self.rest_url,
                    headers=self.headers,
                    json=["LPUSH", channel, payload]
                )
                
                if response.status_code == 200:
                    # Trim list to keep only last 100 messages
                    await client.post(
                        self.rest_url,
                        headers=self.headers,
                        json=["LTRIM", channel, 0, 99]
                    )
                    print(f"[RedisBus] Published to {channel}")
                    return True
                else:
                    print(f"[RedisBus] Failed to publish to {channel}: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"[RedisBus] Error publishing to {channel}: {str(e)}")
            return False
    
    async def subscribe(self, channel: str, callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        Subscribe to a Redis channel (placeholder for future implementation).
        
        Note: Upstash REST API doesn't support long-polling subscriptions.
        For real-time subscriptions, we'll need to use Redis native protocol
        or implement polling-based subscription.
        
        Args:
            channel: Channel name
            callback: Function to call when message received
        """
        print(f"[RedisBus] Subscribe to {channel} - not yet implemented (requires Redis native protocol)")
        pass
    
    async def get_latest(self, channel: str, count: int = 10) -> list:
        """
        Get latest messages from a channel (using Redis LIST operations).
        This is a workaround for subscription until we implement native Redis protocol.
        
        Args:
            channel: Channel name
            count: Number of messages to retrieve
        
        Returns:
            list: Latest messages
        """
        if not self.enabled:
            return []
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.rest_url,
                    headers=self.headers,
                    json=["LRANGE", channel, 0, count - 1]
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("result", [])
                else:
                    return []
                    
        except Exception as e:
            print(f"[RedisBus] Error getting latest from {channel}: {str(e)}")
            return []
    
    def get_channels(self) -> list:
        """Get list of available channels."""
        return self.channels

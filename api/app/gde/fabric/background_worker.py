import asyncio
import json
from typing import Dict, Any, Callable, Optional
from datetime import datetime

from app.gde.fabric.redis_bus import RedisBus


class BackgroundIntelWorker:
    """
    Background intelligence worker for GhostQuant 4.7.4.
    Subscribes to all Redis intelligence channels and provides
    post-processing hooks for database integration and analytics.
    
    Runs independently of WebSocket and Socket.IO gateways.
    
    Channels:
    - intel.events: Raw market events
    - intel.intelligence: Processed intelligence
    - intel.signals: AI-generated signals
    - intel.alerts: High-priority alerts
    - intel.manipulation: Manipulation detection
    - intel.timeline: Behavioral timeline updates
    """
    
    def __init__(self):
        self.redis_bus = RedisBus()
        self.running = False
        self._poll_tasks = []
        
        self.channels = {
            "intel.events": self.on_event,
            "intel.intelligence": self.on_intelligence,
            "intel.signals": self.on_signal,
            "intel.alerts": self.on_alert,
            "intel.manipulation": self.on_manipulation,
            "intel.timeline": self.on_timeline
        }
        
        self.stats = {
            "events_processed": 0,
            "intelligence_processed": 0,
            "signals_processed": 0,
            "alerts_processed": 0,
            "manipulation_processed": 0,
            "timeline_processed": 0,
            "errors": 0,
            "started_at": None
        }
    
    async def start(self):
        """Start the background worker and begin polling Redis channels."""
        self.running = True
        self.stats["started_at"] = datetime.utcnow().isoformat()
        
        print("[BackgroundIntelWorker] Starting background intelligence worker...")
        
        for channel, handler in self.channels.items():
            task = asyncio.create_task(self._poll_channel(channel, handler))
            self._poll_tasks.append(task)
        
        print(f"[BackgroundIntelWorker] Polling {len(self.channels)} Redis channels")
    
    async def stop(self):
        """Stop the background worker and cancel all polling tasks."""
        self.running = False
        
        print("[BackgroundIntelWorker] Stopping background intelligence worker...")
        
        for task in self._poll_tasks:
            task.cancel()
        
        await asyncio.gather(*self._poll_tasks, return_exceptions=True)
        
        print("[BackgroundIntelWorker] Background intelligence worker stopped")
    
    async def _poll_channel(self, channel: str, handler: Callable):
        """
        Poll a Redis channel and process messages with the provided handler.
        
        Args:
            channel: Redis channel name
            handler: Async function to process messages
        """
        while self.running:
            try:
                messages = await self.redis_bus.get_latest(channel, count=10)
                
                for message_data in messages:
                    if isinstance(message_data, str):
                        try:
                            message = json.loads(message_data)
                            await handler(message)
                        except json.JSONDecodeError as e:
                            print(f"[BackgroundIntelWorker] JSON decode error on {channel}: {str(e)}")
                            self.stats["errors"] += 1
                        except Exception as e:
                            print(f"[BackgroundIntelWorker] Handler error on {channel}: {str(e)}")
                            self.stats["errors"] += 1
                
                await asyncio.sleep(1.0)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[BackgroundIntelWorker] Error polling {channel}: {str(e)}")
                self.stats["errors"] += 1
                await asyncio.sleep(5.0)
    
    async def on_event(self, event: Dict[str, Any]):
        """
        Process raw market events.
        Future: Store in TimescaleDB events table.
        """
        self.stats["events_processed"] += 1
        
        event_type = event.get("event_type", "unknown")
        chain = event.get("chain", "unknown")
        value = event.get("value", 0)
        
        print(f"[BackgroundIntelWorker][EVENT] {event_type} on {chain} - ${value:,.2f}")
    
    async def on_intelligence(self, intelligence: Dict[str, Any]):
        """
        Process intelligence payloads.
        Future: Store in TimescaleDB intelligence table.
        """
        self.stats["intelligence_processed"] += 1
        
        event = intelligence.get("event", {})
        entity = intelligence.get("entity", {})
        
        print(f"[BackgroundIntelWorker][INTELLIGENCE] Entity: {entity.get('entity_id', 'unknown')}")
    
    async def on_signal(self, signal: Dict[str, Any]):
        """
        Process AI-generated signals.
        Future: Store in TimescaleDB signals table.
        """
        self.stats["signals_processed"] += 1
        
        score = signal.get("score", 0)
        alert = signal.get("alert", False)
        
        print(f"[BackgroundIntelWorker][SIGNAL] Score: {score:.3f} | Alert: {alert}")
    
    async def on_alert(self, alert: Dict[str, Any]):
        """
        Process high-priority alerts.
        Future: Store in TimescaleDB alerts table, trigger notifications.
        """
        self.stats["alerts_processed"] += 1
        
        score = alert.get("score", 0)
        intelligence = alert.get("intelligence", {})
        
        print(f"[BackgroundIntelWorker][ALERT] High-priority alert - Score: {score:.3f}")
    
    async def on_manipulation(self, manipulation: Dict[str, Any]):
        """
        Process manipulation detection results.
        Future: Store in TimescaleDB manipulation table.
        """
        self.stats["manipulation_processed"] += 1
        
        print(f"[BackgroundIntelWorker][MANIPULATION] Detection result received")
    
    async def on_timeline(self, timeline: Dict[str, Any]):
        """
        Process behavioral timeline updates.
        Future: Store in TimescaleDB timeline table.
        """
        self.stats["timeline_processed"] += 1
        
        entity_id = timeline.get("entity_id", "unknown")
        
        print(f"[BackgroundIntelWorker][TIMELINE] Timeline update for {entity_id}")
    
    @property
    def is_running(self) -> bool:
        """Check if the worker is currently running."""
        return self.running
    
    def get_stats(self) -> Dict[str, Any]:
        """Get worker statistics."""
        return {
            **self.stats,
            "running": self.running,
            "channels": list(self.channels.keys()),
            "timestamp": datetime.utcnow().isoformat()
        }

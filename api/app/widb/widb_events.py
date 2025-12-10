"""
WIDB Events - Whale Intelligence Database Event Bus

Provides a simple in-process event bus for WIDB intelligence ingestion.
Uses a pub/sub pattern to decouple intelligence sources from WIDB storage.

This is a NEW isolated module - does NOT modify any existing code.
"""

from collections import defaultdict
from typing import Callable, Any, Dict, List, Optional
from datetime import datetime
import threading
import logging

logger = logging.getLogger(__name__)

# Type alias for event handlers
IntelHandler = Callable[[Dict[str, Any]], None]


class IntelEventBus:
    """
    Simple in-process event bus for intelligence events.
    
    Supports:
    - Event subscription by event name
    - Event publishing with payload
    - Thread-safe operations
    - Event history for debugging
    
    Event names follow the pattern: source.action
    Examples:
    - hydra.detected
    - whale_intel.wallet_found
    - ecoscan.cluster_identified
    - entity.classified
    """
    
    def __init__(self, max_history: int = 100):
        self._lock = threading.RLock()
        self._subscribers: Dict[str, List[IntelHandler]] = defaultdict(list)
        self._event_history: List[Dict[str, Any]] = []
        self._max_history = max_history
    
    def subscribe(self, event_name: str, handler: IntelHandler) -> None:
        """
        Subscribe a handler to an event.
        
        Args:
            event_name: Name of the event to subscribe to
            handler: Callback function to invoke when event is published
        """
        with self._lock:
            if handler not in self._subscribers[event_name]:
                self._subscribers[event_name].append(handler)
                logger.debug(f"Subscribed handler to event: {event_name}")
    
    def unsubscribe(self, event_name: str, handler: IntelHandler) -> bool:
        """
        Unsubscribe a handler from an event.
        
        Args:
            event_name: Name of the event
            handler: Handler to remove
            
        Returns:
            True if handler was removed, False if not found
        """
        with self._lock:
            if handler in self._subscribers[event_name]:
                self._subscribers[event_name].remove(handler)
                logger.debug(f"Unsubscribed handler from event: {event_name}")
                return True
            return False
    
    def publish(self, event_name: str, payload: Dict[str, Any]) -> int:
        """
        Publish an event to all subscribers.
        
        Args:
            event_name: Name of the event
            payload: Event data
            
        Returns:
            Number of handlers that were invoked
        """
        with self._lock:
            handlers = list(self._subscribers.get(event_name, []))
            
            # Record event in history
            event_record = {
                "event_name": event_name,
                "payload": payload,
                "timestamp": datetime.utcnow().isoformat(),
                "handlers_count": len(handlers)
            }
            self._event_history.append(event_record)
            
            # Trim history if needed
            if len(self._event_history) > self._max_history:
                self._event_history = self._event_history[-self._max_history:]
        
        # Invoke handlers outside the lock
        invoked = 0
        for handler in handlers:
            try:
                handler(payload)
                invoked += 1
            except Exception as e:
                logger.error(f"Error in event handler for {event_name}: {e}")
        
        logger.debug(f"Published event {event_name} to {invoked} handlers")
        return invoked
    
    def get_subscribers(self, event_name: str) -> int:
        """Get the number of subscribers for an event"""
        with self._lock:
            return len(self._subscribers.get(event_name, []))
    
    def get_all_events(self) -> List[str]:
        """Get all event names that have subscribers"""
        with self._lock:
            return list(self._subscribers.keys())
    
    def get_event_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent event history"""
        with self._lock:
            return list(self._event_history[-limit:])
    
    def clear_subscribers(self, event_name: Optional[str] = None) -> None:
        """
        Clear subscribers for an event or all events.
        
        Args:
            event_name: Event to clear, or None to clear all
        """
        with self._lock:
            if event_name:
                self._subscribers[event_name] = []
            else:
                self._subscribers.clear()


# Singleton event bus instance
intel_event_bus = IntelEventBus()


# Event name constants
class IntelEvents:
    """Constants for intelligence event names"""
    
    # Hydra events
    HYDRA_DETECTED = "hydra.detected"
    HYDRA_CLUSTER_FORMED = "hydra.cluster_formed"
    
    # Whale Intel events
    WHALE_INTEL_WALLET_FOUND = "whale_intel.wallet_found"
    WHALE_INTEL_MOVEMENT = "whale_intel.movement"
    
    # EcoScan events
    ECOSCAN_CLUSTER_IDENTIFIED = "ecoscan.cluster_identified"
    ECOSCAN_RISK_UPDATED = "ecoscan.risk_updated"
    
    # Entity Explorer events
    ENTITY_CLASSIFIED = "entity.classified"
    ENTITY_ASSOCIATION_FOUND = "entity.association_found"
    
    # WIDB internal events
    WIDB_PROFILE_CREATED = "widb.profile_created"
    WIDB_PROFILE_UPDATED = "widb.profile_updated"
    WIDB_CLUSTER_RECORDED = "widb.cluster_recorded"
    WIDB_ASSOCIATION_CREATED = "widb.association_created"

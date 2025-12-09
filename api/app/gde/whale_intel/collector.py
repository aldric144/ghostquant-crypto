"""
Whale Intelligence Database Collector

Listens to EcoScan whale activity feed and records data.
"""

from datetime import datetime
from typing import Dict, Any, Optional

from .models import WhaleMovement
from .services import whale_intel_service


class WhaleIntelCollector:
    """
    Collector class that consumes EcoScan whale activity feed.
    
    This class provides a callback interface to receive whale movement
    events from EcoScan without modifying EcoScan's core logic.
    """
    
    def __init__(self):
        self._enabled = True
        self._events_processed = 0
    
    def consume_ecoscan_feed(self, event: Dict[str, Any]) -> Optional[WhaleMovement]:
        """
        Consume a whale movement event from EcoScan feed.
        
        Args:
            event: Dictionary containing whale movement data with keys:
                - from: Source address
                - to: Destination address
                - symbol: Token symbol
                - usd_value: USD value of the movement
                - timestamp: Time of the movement (optional, defaults to now)
        
        Returns:
            WhaleMovement if successfully recorded, None otherwise.
        """
        if not self._enabled:
            return None
        
        try:
            # Extract event data
            from_address = event.get("from", event.get("from_address", ""))
            to_address = event.get("to", event.get("to_address", ""))
            symbol = event.get("symbol", "UNKNOWN")
            usd_value = float(event.get("usd_value", 0))
            
            # Parse timestamp
            timestamp_raw = event.get("timestamp")
            if timestamp_raw:
                if isinstance(timestamp_raw, datetime):
                    timestamp = timestamp_raw
                elif isinstance(timestamp_raw, str):
                    timestamp = datetime.fromisoformat(timestamp_raw.replace("Z", "+00:00"))
                else:
                    timestamp = datetime.utcnow()
            else:
                timestamp = datetime.utcnow()
            
            # Validate required fields
            if not from_address or not to_address:
                return None
            
            # Create movement record
            movement = WhaleMovement(
                from_address=from_address,
                to_address=to_address,
                symbol=symbol,
                usd_value=usd_value,
                timestamp=timestamp
            )
            
            # Record the movement (this also updates whale profiles)
            whale_intel_service.record_movement(movement)
            
            self._events_processed += 1
            
            return movement
            
        except Exception as e:
            # Log error but don't crash the feed
            print(f"[WhaleIntelCollector] Error processing event: {e}")
            return None
    
    def enable(self):
        """Enable the collector."""
        self._enabled = True
    
    def disable(self):
        """Disable the collector."""
        self._enabled = False
    
    @property
    def is_enabled(self) -> bool:
        """Check if collector is enabled."""
        return self._enabled
    
    @property
    def events_processed(self) -> int:
        """Get count of events processed."""
        return self._events_processed


# Global collector instance
whale_intel_collector = WhaleIntelCollector()


def consume_ecoscan_feed(event: Dict[str, Any]) -> Optional[WhaleMovement]:
    """
    Convenience function to consume EcoScan feed events.
    
    This function can be attached as a callback to EcoScan's whale activity
    timeline without modifying EcoScan's core logic.
    
    Usage:
        # In EcoScan router (as a listener callback):
        from app.gde.whale_intel.collector import consume_ecoscan_feed
        
        # After formatting whale activity:
        consume_ecoscan_feed(whale_event)
    """
    return whale_intel_collector.consume_ecoscan_feed(event)

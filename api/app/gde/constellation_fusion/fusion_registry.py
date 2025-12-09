"""
Constellation Fusion Pipeline - Event Registry

Event-driven plug-in system for intelligence engine integration.
Allows any engine to register callbacks and emit events into the Constellation.
"""

from datetime import datetime
from typing import Callable, Dict, List, Optional, Any
from dataclasses import dataclass, field
import logging

from .fusion_models import FusionEvent
from .fusion_service import constellation_fusion_service

logger = logging.getLogger(__name__)


@dataclass
class EngineRegistration:
    """
    Registration record for an intelligence engine.
    """
    engine_name: str
    event_types: List[str] = field(default_factory=list)
    callback: Optional[Callable] = None
    registered_at: datetime = field(default_factory=datetime.utcnow)
    active: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


class ConstellationFusionRegistry:
    """
    Central registry for intelligence engine integration.
    Manages engine registrations and event routing.
    """
    
    def __init__(self):
        self._engines: Dict[str, EngineRegistration] = {}
        self._event_handlers: Dict[str, List[Callable]] = {}
        self._event_log: List[FusionEvent] = []
        self._max_log_size = 10000
    
    def register_engine(
        self,
        engine_name: str,
        event_types: List[str],
        callback: Optional[Callable] = None,
        metadata: Optional[Dict] = None,
    ) -> bool:
        """
        Register an intelligence engine with the fusion system.
        
        Args:
            engine_name: Unique name for the engine (e.g., "hydra", "whale_intel")
            event_types: List of event types this engine will emit
            callback: Optional callback function for bidirectional communication
            metadata: Optional metadata about the engine
        
        Returns:
            True if registration successful, False otherwise
        """
        if engine_name in self._engines:
            logger.warning(f"Engine '{engine_name}' already registered, updating registration")
        
        registration = EngineRegistration(
            engine_name=engine_name,
            event_types=event_types,
            callback=callback,
            metadata=metadata or {},
        )
        
        self._engines[engine_name] = registration
        
        # Register event types
        for event_type in event_types:
            if event_type not in self._event_handlers:
                self._event_handlers[event_type] = []
        
        logger.info(f"Registered engine '{engine_name}' for events: {event_types}")
        return True
    
    def unregister_engine(self, engine_name: str) -> bool:
        """
        Unregister an intelligence engine.
        """
        if engine_name not in self._engines:
            return False
        
        del self._engines[engine_name]
        logger.info(f"Unregistered engine '{engine_name}'")
        return True
    
    def add_event_handler(self, event_type: str, handler: Callable) -> bool:
        """
        Add a custom event handler for a specific event type.
        """
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        
        self._event_handlers[event_type].append(handler)
        return True
    
    def emit_event(
        self,
        event_type: str,
        payload: Dict[str, Any],
        source_engine: str = "unknown",
        priority: int = 5,
    ) -> bool:
        """
        Emit an event into the Constellation fusion system.
        
        This is the main entry point for all intelligence engines to push
        data into the Constellation.
        
        Args:
            event_type: Type of event (hydra_detection, whale_movement, etc.)
            payload: Event data payload
            source_engine: Name of the source engine
            priority: Event priority (1-10, higher = more important)
        
        Returns:
            True if event was processed successfully
        
        Example:
            from app.gde.constellation_fusion.fusion_registry import emit_event
            emit_event(
                event_type="hydra_detection",
                payload={
                    "origin": "0x...",
                    "participants": ["0x...", "0x..."],
                    "confidence": 0.92,
                    "threat_level": "high"
                },
                source_engine="hydra"
            )
        """
        # Create fusion event
        event = FusionEvent(
            event_type=event_type,
            source_engine=source_engine,
            payload=payload,
            priority=priority,
        )
        
        # Log the event
        self._event_log.append(event)
        if len(self._event_log) > self._max_log_size:
            self._event_log = self._event_log[-self._max_log_size:]
        
        # Process through fusion service
        try:
            result = constellation_fusion_service.process_event(event)
            
            # Call any registered handlers
            if event_type in self._event_handlers:
                for handler in self._event_handlers[event_type]:
                    try:
                        handler(event)
                    except Exception as e:
                        logger.error(f"Event handler error for {event_type}: {e}")
            
            logger.debug(f"Processed event: {event_type} from {source_engine}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing event {event_type}: {e}")
            return False
    
    def get_registered_engines(self) -> List[Dict]:
        """
        Get list of all registered engines.
        """
        return [
            {
                "engine_name": reg.engine_name,
                "event_types": reg.event_types,
                "registered_at": reg.registered_at.isoformat(),
                "active": reg.active,
                "metadata": reg.metadata,
            }
            for reg in self._engines.values()
        ]
    
    def get_event_log(self, limit: int = 100, event_type: Optional[str] = None) -> List[Dict]:
        """
        Get recent events from the log.
        """
        events = self._event_log
        
        if event_type:
            events = [e for e in events if e.event_type == event_type]
        
        # Return most recent first
        return [e.to_dict() for e in reversed(events[-limit:])]
    
    def get_stats(self) -> Dict:
        """
        Get registry statistics.
        """
        event_counts: Dict[str, int] = {}
        for event in self._event_log:
            event_counts[event.event_type] = event_counts.get(event.event_type, 0) + 1
        
        return {
            "registered_engines": len(self._engines),
            "event_types_registered": len(self._event_handlers),
            "total_events_processed": len(self._event_log),
            "events_by_type": event_counts,
            "engines": list(self._engines.keys()),
        }


# Global registry instance
fusion_registry = ConstellationFusionRegistry()


# Convenience function for emitting events
def emit_event(
    event_type: str,
    payload: Dict[str, Any],
    source_engine: str = "unknown",
    priority: int = 5,
) -> bool:
    """
    Convenience function to emit an event into the Constellation.
    
    Usage:
        from app.gde.constellation_fusion.fusion_registry import emit_event
        emit_event(event_type="hydra_detection", payload={...})
    """
    return fusion_registry.emit_event(event_type, payload, source_engine, priority)


# Pre-register known engines
def _initialize_default_engines():
    """
    Pre-register the known intelligence engines.
    """
    fusion_registry.register_engine(
        engine_name="hydra",
        event_types=["hydra_detection"],
        metadata={"description": "Operation Hydra - Multi-Head Coordinated Network Detection"},
    )
    
    fusion_registry.register_engine(
        engine_name="whale_intel",
        event_types=["whale_movement"],
        metadata={"description": "Whale Intelligence Database - Whale Activity Tracking"},
    )
    
    fusion_registry.register_engine(
        engine_name="ecoscan",
        event_types=["ecoscan_transfer"],
        metadata={"description": "EcoScan - Blockchain Transfer Monitoring"},
    )
    
    fusion_registry.register_engine(
        engine_name="entity_explorer",
        event_types=["entity_lookup"],
        metadata={"description": "Entity Explorer - Address Investigation"},
    )


# Initialize default engines on module load
_initialize_default_engines()

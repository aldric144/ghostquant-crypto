from typing import Dict, List, Any
from datetime import datetime
from app.gde.events.base_event import MarketEvent
from app.gde.entities.base_entity import FinancialEntity


class BehavioralTimeline:
    """
    Tracks wallet/entity behavior over time.
    This is the long-term memory module of GhostQuant 3.0.

    Powers:
    - manipulation pre-build detection
    - behavioral fingerprinting
    - entity evolution tracking
    - cycle pattern recognition
    """

    def __init__(self):
        self.timelines: Dict[str, List[MarketEvent]] = {}

    def record(self, entity: FinancialEntity, event: MarketEvent):
        """
        Store the event in the entity's timeline.
        """
        if not entity or not entity.entity_id:
            return

        self.timelines.setdefault(entity.entity_id, [])
        self.timelines[entity.entity_id].append(event)

        self.timelines[entity.entity_id].sort(
            key=lambda e: e.timestamp
        )

    def summarize(self, entity_id: str) -> Dict[str, Any]:
        """
        Simple summary of an entity's behavior timeline.
        """
        events = self.timelines.get(entity_id, [])

        return {
            "entity_id": entity_id,
            "event_count": len(events),
            "first_seen": events[0].timestamp if events else None,
            "last_seen": events[-1].timestamp if events else None,
        }

    def global_summary(self) -> Dict[str, Any]:
        """
        Overview of the entire timeline memory.
        """
        return {
            "total_entities": len(self.timelines),
            "total_events": sum(len(v) for v in self.timelines.values()),
            "entities": list(self.timelines.keys()),
        }

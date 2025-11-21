from typing import Dict, Any
from app.gde.ingestion.event_router import EventRouter
from app.gde.ingestion.entity_linker import EntityLinker
from app.gde.ingestion.manipulation_detector import ManipulationRingDetector
from app.gde.ingestion.behavioral_timeline import BehavioralTimeline
from app.gde.ingestion.cross_event_correlator import CrossEventCorrelator
from app.gde.fabric.redis_bus import RedisBus


class IntelligenceFabric:
    """
    The unified orchestration engine of GhostQuant 4.0.
    Connects all ingestion → intelligence modules.
    """

    def __init__(self):
        self.router = EventRouter()
        self.linker = EntityLinker()
        self.ring_detector = ManipulationRingDetector()
        self.timeline = BehavioralTimeline()
        self.correlator = CrossEventCorrelator()
        self.redis_bus = RedisBus()

    async def process_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full pipeline:
        1. Route raw payload → MarketEvent
        2. Link to entity
        3. Update timelines
        4. Detect manipulation patterns
        5. Cross-chain event correlation
        6. Return unified intelligence payload
        """

        routed = await self.router.route(payload)
        event = routed.get("event")

        entity = self.linker.link(event)
        if entity:
            event.entity_id = entity.entity_id

        self.timeline.record(entity, event)

        self.ring_detector.record_event(event)

        self.correlator.record(event)

        intelligence = {
            "event": event,
            "entity": entity,
            "manipulation": self.ring_detector.detect_synchrony(),
            "timeline": self.timeline.summarize(entity.entity_id) if entity else None,
            "correlation": self.correlator.correlate(),
        }

        await self.redis_bus.publish("intel.intelligence", intelligence)

        return intelligence

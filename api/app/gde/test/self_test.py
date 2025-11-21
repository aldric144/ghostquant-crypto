"""
Internal Self-Test for the Global Data Engine (GDE)
This does NOT test ingestion, APIs, or database.
It only confirms that the Phase 2 foundation loads
and all base classes behave as expected.
"""

from datetime import datetime
from app.gde.entities.base_entity import FinancialEntity
from app.gde.events.base_event import MarketEvent
from app.gde.models.base_model import GDEModel
from app.gde.schemas.base_schema import GDESchema
from app.gde.services.base_service import GDEService
from app.gde.utils import normalize_timestamp, normalize_number, normalize_chain


def run_self_test():
    results = {}

    try:
        entity = FinancialEntity(
            entity_id="test123",
            entity_type="whale",
            name="Test Whale",
            address="0xABC",
            chain="eth",
            tags=["smart money"],
        )
        results["entity"] = "ok"
    except Exception as e:
        results["entity"] = str(e)

    try:
        event = MarketEvent(
            event_id="evt123",
            event_type="whale_move",
            entity_id="test123",
            chain="eth",
            value=1000000,
            token="ETH",
        )
        results["event"] = "ok"
    except Exception as e:
        results["event"] = str(e)

    try:
        model = GDEModel()
        d = model.to_dict()
        if "model_type" in d and "serialized_at" in d:
            results["model"] = "ok"
        else:
            results["model"] = "bad serialization"
    except Exception as e:
        results["model"] = str(e)

    try:
        schema = GDESchema(metadata={"test": True})
        results["schema"] = "ok"
    except Exception as e:
        results["schema"] = str(e)

    try:
        service = GDEService()
        if service.validate({"x": 1}):
            p = service.process({"x": 1})
            if p.get("status") == "processed":
                results["service"] = "ok"
            else:
                results["service"] = "bad process output"
        else:
            results["service"] = "validation failed"
    except Exception as e:
        results["service"] = str(e)

    try:
        t = normalize_timestamp(datetime.utcnow())
        n = normalize_number("123.45")
        c = normalize_chain("eth")
        if t and n == 123.45 and c == "ETH":
            results["utils"] = "ok"
        else:
            results["utils"] = "bad utils output"
    except Exception as e:
        results["utils"] = str(e)

    return results


if __name__ == "__main__":
    print(run_self_test())

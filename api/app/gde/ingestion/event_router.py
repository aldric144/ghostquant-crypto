from typing import Dict, Any
from app.gde.events.base_event import MarketEvent
from app.gde.utils import normalize_timestamp, normalize_number, normalize_chain


class EventRouter:
    """
    Central routing engine for the GhostQuant GDE (Global Data Engine).
    Converts raw connector payloads → standardized MarketEvent → routes to processors.

    This is the heart of:
    - whale tracking
    - billionaire tracking
    - manipulation ring detection
    - liquidity anomaly detection
    - stablecoin mints/burns
    - derivatives pressure signals
    """

    def __init__(self):
        self.handlers = {
            "BTC": self._route_bitcoin,
            "ETH": self._route_ethereum,
            "SOL": self._route_solana,
            "CEX": self._route_exchange,
            "DERIVATIVES": self._route_derivatives,
            "STABLECOIN": self._route_stablecoin,
        }

    def convert_to_event(self, payload: Dict[str, Any]) -> MarketEvent:
        """
        Convert raw connector payload into a standardized MarketEvent.
        """
        return MarketEvent(
            event_id="evt_" + str(normalize_timestamp(payload.get("timestamp", None))),
            event_type="raw_ingestion",
            entity_id=None,
            chain=normalize_chain(payload.get("chain")),
            value=normalize_number(payload.get("value")),
            token=payload.get("token"),
            metadata=payload,
        )

    async def route(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main routing function.
        - Converts payload → MarketEvent
        - Dispatches to appropriate chain/exchange handler
        """
        event = self.convert_to_event(payload)
        handler = self.handlers.get(event.chain, self._route_unknown)
        return await handler(event)


    async def _route_bitcoin(self, event: MarketEvent):
        return {"status": "ok", "routed_to": "bitcoin_pipeline", "event": event}

    async def _route_ethereum(self, event: MarketEvent):
        return {"status": "ok", "routed_to": "ethereum_pipeline", "event": event}

    async def _route_solana(self, event: MarketEvent):
        return {"status": "ok", "routed_to": "solana_pipeline", "event": event}

    async def _route_exchange(self, event: MarketEvent):
        return {"status": "ok", "routed_to": "exchange_pipeline", "event": event}

    async def _route_derivatives(self, event: MarketEvent):
        return {"status": "ok", "routed_to": "derivatives_pipeline", "event": event}

    async def _route_stablecoin(self, event: MarketEvent):
        return {"status": "ok", "routed_to": "stablecoin_pipeline", "event": event}

    async def _route_unknown(self, event: MarketEvent):
        return {"status": "unknown_chain", "event": event}

import asyncio
import time
from typing import Any, Dict, Optional, Callable
from datetime import datetime

from app.gde.utils import (
    normalize_timestamp,
    normalize_number,
    normalize_chain
)
from app.gde.events.base_event import MarketEvent


class IngestionEngine:
    """
    Enterprise-grade base ingestion engine for GhostQuant.
    
    Responsibilities:
    - Connect to external data sources (RPC, REST, WS)
    - Poll or stream external data
    - Normalize incoming raw data
    - Convert inputs into MarketEvents
    - Forward events to the EventRouter
    - Handle async loops, backpressure, and safe shutdown
    """

    POLL_INTERVAL = 1  

    def __init__(self, name: str, router: Optional[Callable] = None):
        self.name = name
        self.router = router
        self.running = False

    async def start(self):
        """Start the ingestion loop."""
        self.running = True
        print(f"[{self.name}] Ingestion engine starting...")

        while self.running:
            try:
                raw = await self.fetch()
                if raw:
                    event = self.convert(raw)
                    if event and self.router:
                        await self.router(event)
            except Exception as e:
                print(f"[{self.name}] Error during ingestion: {e}")

            await asyncio.sleep(self.POLL_INTERVAL)

    async def stop(self):
        """Stop ingestion gracefully."""
        print(f"[{self.name}] Ingestion engine stopping...")
        self.running = False

    async def fetch(self) -> Any:
        """
        Fetch raw data from external source.
        Must be implemented by subclasses.
        """
        raise NotImplementedError(
            f"{self.__class__.__name__}.fetch() must be implemented."
        )

    def convert(self, raw: Dict[str, Any]) -> Optional[MarketEvent]:
        """
        Convert raw external data into a standardized MarketEvent.
        Subclasses will override this with domain-specific logic.
        """
        try:
            return MarketEvent(
                event_id=f"{self.name}-{int(time.time() * 1000)}",
                event_type="generic_event",
                chain=raw.get("chain"),
                value=normalize_number(raw.get("value")),
                token=raw.get("token"),
                timestamp=normalize_timestamp(raw.get("timestamp")),
                metadata=raw,
            )
        except Exception as e:
            print(f"[{self.name}] Error converting raw data to MarketEvent: {e}")
            return None

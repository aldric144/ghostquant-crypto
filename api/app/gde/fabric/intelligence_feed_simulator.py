import asyncio
import random
from datetime import datetime
from typing import Dict, Any

from app.gde.fabric.intelligence_queue_worker import IntelligenceQueueWorker
from app.gde.fabric.redis_bus import RedisBus


class IntelligenceFeedSimulator:
    """
    Generates artificial intelligence events to test the full
    GhostQuant intelligence pipeline before real data sources
    (Solana RPC, EVM RPC, CEX APIs, derivatives feeds) are connected.
    """

    def __init__(self, worker: IntelligenceQueueWorker):
        self.worker = worker
        self.running = False
        self.redis_bus = RedisBus()

    async def start(self, interval: float = 1.0):
        """
        Start generating simulated events every X seconds.
        """
        self.running = True
        print("[SIMULATOR] Starting feed...")

        while self.running:
            event = self._generate_event()
            await self.worker.enqueue(event)
            await self.redis_bus.publish("intel.events", event)
            print(f"[SIMULATOR] Emitted event: {event}")
            await asyncio.sleep(interval)

    async def stop(self):
        """Stop the simulator."""
        self.running = False
        print("[SIMULATOR] Stopped.")

    def _generate_event(self) -> Dict[str, Any]:
        """
        Creates a fake but realistic cross-chain event.
        These mimic whale moves, stablecoin flows, and derivatives spikes.
        """
        chains = ["ETH", "SOL", "BTC", "BNB", "AVAX"]
        event_types = ["transfer", "swap", "mint", "burn", "position_open", "position_close"]

        return {
            "event_id": f"sim-{random.randint(100000, 999999)}",
            "event_type": random.choice(event_types),
            "entity_id": f"wallet-{random.randint(1000, 9999)}",
            "chain": random.choice(chains),
            "value": round(random.uniform(10000, 5000000), 2),
            "token": random.choice(["ETH", "SOL", "USDT", "BTC", "BNB"]),
            "metadata": {"simulated": True},
            "timestamp": datetime.utcnow().isoformat(),
        }

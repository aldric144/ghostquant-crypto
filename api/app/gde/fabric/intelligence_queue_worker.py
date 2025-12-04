import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

from app.gde.fabric.intelligence_fabric import IntelligenceFabric
from app.gde.fabric.ai_signal_generator import AISignalGenerator


class IntelligenceQueueWorker:
    """
    Real-time intelligence worker.
    Continuously consumes events, processes them through the full
    GhostQuant 4.0 intelligence stack, and outputs AI signals.

    This becomes the real-time 'brain loop' of GhostQuant.
    """

    def __init__(self):
        self.fabric = IntelligenceFabric()
        self.signal_generator = AISignalGenerator()
        self.queue: asyncio.Queue = asyncio.Queue()
        self.running = False

    async def start(self):
        """Start the worker."""
        self.running = True
        print("[GDE] IntelligenceQueueWorker started.")
        asyncio.create_task(self._run())

    async def stop(self):
        """Stop the worker."""
        self.running = False
        print("[GDE] IntelligenceQueueWorker stopped.")

    async def enqueue(self, event: Dict[str, Any]):
        """Add a new raw event to the queue."""
        await self.queue.put(event)

    async def _run(self):
        """Main loop processing events."""
        while self.running:
            try:
                event = await self.queue.get()

                intelligence = await self.fabric.process_event(event)

                signal = await self.signal_generator.generate(intelligence)

                print("[GDE][INTEL SIGNAL]", signal)

            except Exception as e:
                print("[GDE][ERROR] IntelligenceQueueWorker:", str(e))

            await asyncio.sleep(0)  # yield control

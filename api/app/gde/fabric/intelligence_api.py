from fastapi import APIRouter
from typing import Dict, Any

from app.gde.fabric.intelligence_queue_worker import IntelligenceQueueWorker
from app.gde.fabric.intelligence_fabric import IntelligenceFabric
from app.gde.fabric.ai_signal_generator import AISignalGenerator

router = APIRouter(prefix="/intel", tags=["Intelligence"])

worker = IntelligenceQueueWorker()
fabric = IntelligenceFabric()
signal_engine = AISignalGenerator()


@router.get("/ping")
async def ping():
    """Simple health check."""
    return {"status": "intel-api-online"}


@router.post("/signal")
async def generate_signal(event: Dict[str, Any]):
    """
    Take a raw event → return AI intelligence signal.
    Perfect for UI dashboards & SEC/CFTC integrations.
    """
    intelligence = await fabric.process_event(event)
    signal = signal_engine.generate(intelligence)
    return signal


@router.post("/enqueue")
async def enqueue_event(event: Dict[str, Any]):
    """
    Send an event into the real-time intelligence worker.
    """
    await worker.enqueue(event)
    return {"status": "queued"}


@router.post("/intelligence")
async def full_intelligence(event: Dict[str, Any]):
    """
    Returns the entire intelligence object:
      - entity
      - manipulation detection
      - timeline behavior
      - cross-chain correlations
      - confidence score
    """
    intelligence = await fabric.process_event(event)
    return intelligence


@router.post("/start")
async def start_worker():
    """
    Start the real-time intelligence worker.
    """
    await worker.start()
    return {"status": "worker-started"}


@router.post("/stop")
async def stop_worker():
    """
    Stop the real-time intelligence worker.
    """
    await worker.stop()
    return {"status": "worker-stopped"}

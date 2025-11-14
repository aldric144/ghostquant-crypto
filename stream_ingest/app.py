"""
Main application: WebSocket ingestion + HTTP health server.
"""
import asyncio
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

from publisher import RedisStreamPublisher
from discovery import PairDiscovery
from binance_ingest import BinanceIngestClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
BINANCE_WS_URL = os.getenv("BINANCE_WS_URL", "wss://stream.binance.com:9443")
STREAM_MAXLEN = int(os.getenv("STREAM_MAXLEN", "10000"))
DISCOVERY_REFRESH_SEC = int(os.getenv("DISCOVERY_REFRESH_SEC", "3600"))
PAIRS_PER_CONNECTION = int(os.getenv("PAIRS_PER_CONNECTION", "50"))
HEALTH_PORT = int(os.getenv("HEALTH_PORT", "8099"))

publisher = None
discovery = None
ingest_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    global publisher, discovery, ingest_client
    
    logger.info("Starting stream_ingest service...")
    
    publisher = RedisStreamPublisher(REDIS_URL, maxlen=STREAM_MAXLEN)
    await publisher.connect()
    
    discovery = PairDiscovery(refresh_interval=DISCOVERY_REFRESH_SEC)
    
    ingest_client = BinanceIngestClient(
        publisher,
        ws_url=BINANCE_WS_URL,
        pairs_per_connection=PAIRS_PER_CONNECTION
    )
    
    asyncio.create_task(discovery.start_refresh_loop())
    
    await asyncio.sleep(2)
    pairs = await discovery.get_pairs()
    
    asyncio.create_task(ingest_client.start(pairs))
    
    logger.info(f"Service started with {len(pairs)} pairs")
    
    yield
    
    logger.info("Shutting down...")
    if publisher:
        await publisher.disconnect()


app = FastAPI(
    title="GhostQuant Stream Ingest",
    description="Lightweight WebSocket ingestion service publishing to Redis Streams",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/health")
async def health():
    """
    Health check endpoint.
    Returns 200 if Redis is connected and at least one WS connection is active.
    """
    if not publisher:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "reason": "publisher not initialized"}
        )
    
    redis_healthy = await publisher.is_healthy()
    
    if not redis_healthy:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "reason": "redis not connected"}
        )
    
    stats = ingest_client.get_stats() if ingest_client else {}
    active_connections = stats.get("active_connections", 0)
    
    if active_connections == 0:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "reason": "no active websocket connections",
                "stats": stats
            }
        )
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "redis": "connected",
            "websocket_connections": active_connections
        }
    )


@app.get("/stats")
async def stats():
    """Get service statistics."""
    publisher_stats = publisher.get_stats() if publisher else {}
    ingest_stats = ingest_client.get_stats() if ingest_client else {}
    pairs = await discovery.get_pairs() if discovery else []
    
    return {
        "publisher": publisher_stats,
        "ingest": ingest_stats,
        "pairs_count": len(pairs),
        "pairs_sample": pairs[:10]
    }


@app.get("/pairs")
async def get_pairs():
    """Get current list of monitored pairs."""
    if not discovery:
        return {"pairs": []}
    
    pairs = await discovery.get_pairs()
    return {
        "count": len(pairs),
        "pairs": pairs
    }


def main():
    """Run the service."""
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=HEALTH_PORT,
        log_level="info"
    )


if __name__ == "__main__":
    main()

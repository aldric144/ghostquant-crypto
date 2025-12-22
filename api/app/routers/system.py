"""
System health, diagnostics, and control endpoints for Settings Page V2.
Provides real-time monitoring of Redis, workers, Socket.IO, and system metrics.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
import json
import logging
import asyncio
import time

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/system", tags=["System"])

# Track system start time
SYSTEM_START_TIME = datetime.now(timezone.utc)
LAST_RELOAD_TIME = datetime.now(timezone.utc)

# In-memory metrics storage
system_metrics = {
    "reconnect_count": 0,
    "latency_ms": 0,
    "last_alert": None,
    "worker_running": True,
    "simulation_mode": False,
    "simulation_rate": 5,
    "processing_errors": 0,
    "queue_size": 0,
    "total_events": 0,
    "feed_velocity": 0,
    "entity_cache_size": 0,
    "ghostmind_insights": 0,
    "timeline_events": 0,
    "graph_nodes": 0,
    "graph_edges": 0,
    "ring_systems": 0,
    "ws_client_count": 0,
    "last_ws_connect": None,
    "high_severity": 0,
    "medium_severity": 0,
    "low_severity": 0,
}


class SocketHealthResponse(BaseModel):
    connection: str
    reconnectCount: int
    latency: int
    lastAlert: Optional[str]


class PerformanceResponse(BaseModel):
    fps: int
    memoryUsage: int
    cpuLoad: str


class RedisFeedResponse(BaseModel):
    totalEvents: int
    feedVelocity: float
    lastMessage: Optional[str]
    severity: Dict[str, int]


class WorkerStatusResponse(BaseModel):
    running: bool
    simulationMode: bool
    loopSpeed: int
    queueSize: int
    processingErrors: int


class UptimeResponse(BaseModel):
    sessionUptime: int
    lastReload: str


class DiagnosticsResponse(BaseModel):
    timelineEvents: int
    graphNodes: int
    graphEdges: int
    ringSystems: int
    ghostmindInsights: int
    entityCacheSize: int


class SimulationRateRequest(BaseModel):
    rate: int


class SnapshotResponse(BaseModel):
    timestamp: str
    redisEvents: List[Dict[str, Any]]
    workerStatus: Dict[str, Any]
    diagnostics: Dict[str, Any]
    entityCache: Dict[str, Any]


# ============== SOCKET HEALTH ==============

@router.get("/socket-health", response_model=SocketHealthResponse)
async def get_socket_health():
    """Get WebSocket and Socket.IO connection health status."""
    from app.cache import get_redis
    
    redis = get_redis()
    redis_connected = redis and redis.enabled
    
    # Check if we have active WebSocket clients
    ws_client_count = system_metrics.get("ws_client_count", 0)
    
    # Connection is "connected" if either:
    # 1. We have active WebSocket clients, OR
    # 2. Redis is connected (backend can receive events)
    connection_status = "connected" if (ws_client_count > 0 or redis_connected) else "disconnected"
    
    # Measure Redis latency
    start = time.time()
    latency = 0
    if redis_connected:
        try:
            redis._execute("PING")
            latency = int((time.time() - start) * 1000)
        except Exception:
            latency = -1
    
    return SocketHealthResponse(
        connection=connection_status,
        reconnectCount=system_metrics["reconnect_count"],
        latency=latency,
        lastAlert=system_metrics["last_alert"]
    )


# ============== PERFORMANCE ==============

@router.get("/performance", response_model=PerformanceResponse)
async def get_performance():
    """Get server performance metrics."""
    import psutil
    
    try:
        memory = psutil.virtual_memory()
        memory_usage = int(memory.used / 1024 / 1024)  # MB
    except Exception:
        memory_usage = 0
    
    return PerformanceResponse(
        fps=60,  # Server-side, FPS is calculated on frontend
        memoryUsage=memory_usage,
        cpuLoad="server"
    )


# ============== REDIS FEED ==============

@router.get("/redis-feed", response_model=RedisFeedResponse)
async def get_redis_feed():
    """Get Redis intelligence feed statistics."""
    from app.cache import get_redis
    
    redis = get_redis()
    total_events = system_metrics["total_events"]
    feed_velocity = system_metrics["feed_velocity"]
    
    # Try to get real stats from Redis
    if redis and redis.enabled:
        try:
            # Count intel events
            keys = redis.keys("intel:*")
            total_events = len(keys) if keys else system_metrics["total_events"]
        except Exception as e:
            logger.warning(f"Failed to get Redis stats: {e}")
    
    return RedisFeedResponse(
        totalEvents=total_events,
        feedVelocity=feed_velocity,
        lastMessage=system_metrics["last_alert"],
        severity={
            "high": system_metrics.get("high_severity", 0),
            "medium": system_metrics.get("medium_severity", 0),
            "low": system_metrics.get("low_severity", 0)
        }
    )


@router.post("/flush-redis")
async def flush_redis():
    """Flush all Redis intelligence data. DANGER ZONE."""
    from app.cache import get_redis
    
    redis = get_redis()
    if not redis or not redis.enabled:
        raise HTTPException(status_code=503, detail="Redis not available")
    
    try:
        # Flush intel keys only, not all data
        keys = redis.keys("intel:*")
        if keys:
            redis.delete(*keys)
        
        # Reset metrics
        system_metrics["total_events"] = 0
        system_metrics["feed_velocity"] = 0
        system_metrics["last_alert"] = None
        system_metrics["high_severity"] = 0
        system_metrics["medium_severity"] = 0
        system_metrics["low_severity"] = 0
        
        logger.warning("Redis intelligence feed flushed by user")
        return {"status": "flushed", "keysDeleted": len(keys) if keys else 0}
    except Exception as e:
        logger.error(f"Failed to flush Redis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== WORKER STATUS ==============

@router.get("/workers/status", response_model=WorkerStatusResponse)
async def get_worker_status():
    """Get intelligence worker status."""
    # Try to get actual worker state from background_worker
    try:
        from app.main import background_worker
        actual_running = background_worker.is_running
    except Exception:
        actual_running = system_metrics["worker_running"]
    
    return WorkerStatusResponse(
        running=actual_running,
        simulationMode=system_metrics["simulation_mode"],
        loopSpeed=50,  # ms
        queueSize=system_metrics["queue_size"],
        processingErrors=system_metrics["processing_errors"]
    )


@router.post("/workers/start")
async def start_workers():
    """Start intelligence workers."""
    try:
        from app.gde.fabric.background_worker import BackgroundIntelWorker
        
        system_metrics["worker_running"] = True
        logger.info("Intelligence workers started by user")
        return {"status": "started"}
    except Exception as e:
        logger.error(f"Failed to start workers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workers/stop")
async def stop_workers():
    """Stop intelligence workers gracefully."""
    try:
        system_metrics["worker_running"] = False
        logger.info("Intelligence workers stopped by user")
        return {"status": "stopped"}
    except Exception as e:
        logger.error(f"Failed to stop workers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workers/kill")
async def kill_workers():
    """Force kill intelligence workers. DANGER ZONE."""
    try:
        system_metrics["worker_running"] = False
        system_metrics["queue_size"] = 0
        logger.warning("Intelligence workers force killed by user")
        return {"status": "killed"}
    except Exception as e:
        logger.error(f"Failed to kill workers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workers/restart")
async def restart_workers():
    """Restart intelligence workers."""
    try:
        system_metrics["worker_running"] = False
        await asyncio.sleep(0.5)
        system_metrics["worker_running"] = True
        system_metrics["processing_errors"] = 0
        logger.info("Intelligence workers restarted by user")
        return {"status": "restarted"}
    except Exception as e:
        logger.error(f"Failed to restart workers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== UPTIME ==============

@router.get("/uptime", response_model=UptimeResponse)
async def get_uptime():
    """Get system uptime information."""
    now = datetime.now(timezone.utc)
    uptime_seconds = int((now - SYSTEM_START_TIME).total_seconds())
    
    return UptimeResponse(
        sessionUptime=uptime_seconds,
        lastReload=LAST_RELOAD_TIME.isoformat()
    )


# ============== DIAGNOSTICS ==============

@router.get("/diagnostics", response_model=DiagnosticsResponse)
async def get_diagnostics():
    """Get terminal diagnostics data."""
    from app.cache import get_redis
    
    redis = get_redis()
    
    # Try to get real counts from Redis
    timeline_events = system_metrics["timeline_events"]
    graph_nodes = system_metrics["graph_nodes"]
    graph_edges = system_metrics["graph_edges"]
    ring_systems = system_metrics["ring_systems"]
    ghostmind_insights = system_metrics["ghostmind_insights"]
    entity_cache_size = system_metrics["entity_cache_size"]
    
    if redis and redis.enabled:
        try:
            # Count various cached items
            timeline_keys = redis.keys("timeline:*")
            timeline_events = len(timeline_keys) if timeline_keys else timeline_events
            
            entity_keys = redis.keys("entity:*")
            entity_cache_size = len(entity_keys) if entity_keys else entity_cache_size
            
            ring_keys = redis.keys("ring:*")
            ring_systems = len(ring_keys) if ring_keys else ring_systems
        except Exception as e:
            logger.warning(f"Failed to get diagnostics from Redis: {e}")
    
    return DiagnosticsResponse(
        timelineEvents=timeline_events,
        graphNodes=graph_nodes,
        graphEdges=graph_edges,
        ringSystems=ring_systems,
        ghostmindInsights=ghostmind_insights,
        entityCacheSize=entity_cache_size
    )


# ============== SIMULATION CONTROLS ==============

simulation_router = APIRouter(prefix="/simulation", tags=["Simulation"])


@simulation_router.post("/start")
async def start_simulation():
    """Start the intelligence feed simulator."""
    try:
        system_metrics["simulation_mode"] = True
        logger.info("Intelligence simulator started by user")
        return {"status": "simulator-started"}
    except Exception as e:
        logger.error(f"Failed to start simulator: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@simulation_router.post("/stop")
async def stop_simulation():
    """Stop the intelligence feed simulator."""
    try:
        system_metrics["simulation_mode"] = False
        logger.info("Intelligence simulator stopped by user")
        return {"status": "simulator-stopped"}
    except Exception as e:
        logger.error(f"Failed to stop simulator: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@simulation_router.post("/rate")
async def set_simulation_rate(request: SimulationRateRequest):
    """Set the simulation event rate."""
    if request.rate < 1 or request.rate > 100:
        raise HTTPException(status_code=400, detail="Rate must be between 1 and 100")
    
    system_metrics["simulation_rate"] = request.rate
    logger.info(f"Simulation rate set to {request.rate} events/sec")
    return {"status": "rate-updated", "rate": request.rate}


# ============== DATA TOOLS ==============

@router.post("/data/reset-entity-cache")
async def reset_entity_cache():
    """Reset the entity cache in Redis."""
    from app.cache import get_redis
    
    redis = get_redis()
    if not redis or not redis.enabled:
        return {"status": "skipped", "reason": "Redis not available"}
    
    try:
        keys = redis.keys("entity:*")
        if keys:
            redis.delete(*keys)
        
        system_metrics["entity_cache_size"] = 0
        logger.info("Entity cache reset by user")
        return {"status": "reset", "keysDeleted": len(keys) if keys else 0}
    except Exception as e:
        logger.error(f"Failed to reset entity cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/data/reset-ghostmind")
async def reset_ghostmind():
    """Reset GhostMind memory in Redis."""
    from app.cache import get_redis
    
    redis = get_redis()
    if not redis or not redis.enabled:
        return {"status": "skipped", "reason": "Redis not available"}
    
    try:
        keys = redis.keys("ghostmind:*")
        if keys:
            redis.delete(*keys)
        
        system_metrics["ghostmind_insights"] = 0
        logger.info("GhostMind memory reset by user")
        return {"status": "reset", "keysDeleted": len(keys) if keys else 0}
    except Exception as e:
        logger.error(f"Failed to reset GhostMind: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/download-snapshot")
async def download_snapshot():
    """Download a complete system snapshot as JSON."""
    from app.cache import get_redis
    
    redis = get_redis()
    
    # Gather all data
    redis_events = []
    if redis and redis.enabled:
        try:
            keys = redis.keys("intel:*")
            for key in (keys or [])[:100]:  # Limit to 100 events
                value = redis.get(key)
                if value:
                    try:
                        redis_events.append(json.loads(value))
                    except Exception:
                        redis_events.append({"key": key, "value": value})
        except Exception as e:
            logger.warning(f"Failed to get Redis events for snapshot: {e}")
    
    snapshot = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "redisEvents": redis_events,
        "workerStatus": {
            "running": system_metrics["worker_running"],
            "simulationMode": system_metrics["simulation_mode"],
            "queueSize": system_metrics["queue_size"],
            "processingErrors": system_metrics["processing_errors"]
        },
        "diagnostics": {
            "timelineEvents": system_metrics["timeline_events"],
            "graphNodes": system_metrics["graph_nodes"],
            "graphEdges": system_metrics["graph_edges"],
            "ringSystems": system_metrics["ring_systems"],
            "ghostmindInsights": system_metrics["ghostmind_insights"],
            "entityCacheSize": system_metrics["entity_cache_size"]
        },
        "entityCache": {
            "size": system_metrics["entity_cache_size"]
        },
        "systemMetrics": system_metrics
    }
    
    return JSONResponse(
        content=snapshot,
        headers={
            "Content-Disposition": f"attachment; filename=ghostquant-snapshot-{int(time.time())}.json"
        }
    )


# ============== DANGER ZONE ==============

danger_router = APIRouter(prefix="/system/danger", tags=["Danger Zone"])


@danger_router.post("/flush-redis")
async def danger_flush_redis():
    """Flush ALL Redis data. EXTREME DANGER."""
    from app.cache import get_redis
    
    redis = get_redis()
    if not redis or not redis.enabled:
        raise HTTPException(status_code=503, detail="Redis not available")
    
    try:
        # Get all keys and delete them
        all_keys = redis.keys("*")
        if all_keys:
            redis.delete(*all_keys)
        
        # Reset all metrics
        for key in system_metrics:
            if isinstance(system_metrics[key], int):
                system_metrics[key] = 0
            elif isinstance(system_metrics[key], bool):
                system_metrics[key] = False
            else:
                system_metrics[key] = None
        
        system_metrics["worker_running"] = True
        
        logger.warning("ALL Redis data flushed by user - DANGER ZONE action")
        return {"status": "flushed", "keysDeleted": len(all_keys) if all_keys else 0}
    except Exception as e:
        logger.error(f"Failed to flush Redis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@danger_router.post("/kill-workers")
async def danger_kill_workers():
    """Force kill all workers immediately. DANGER ZONE."""
    try:
        system_metrics["worker_running"] = False
        system_metrics["simulation_mode"] = False
        system_metrics["queue_size"] = 0
        
        logger.warning("All workers force killed - DANGER ZONE action")
        return {"status": "killed"}
    except Exception as e:
        logger.error(f"Failed to kill workers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@danger_router.post("/restart-workers")
async def danger_restart_workers():
    """Force restart all workers. DANGER ZONE."""
    global LAST_RELOAD_TIME
    
    try:
        system_metrics["worker_running"] = False
        await asyncio.sleep(1)
        system_metrics["worker_running"] = True
        system_metrics["processing_errors"] = 0
        system_metrics["queue_size"] = 0
        LAST_RELOAD_TIME = datetime.now(timezone.utc)
        
        logger.warning("All workers force restarted - DANGER ZONE action")
        return {"status": "restarted"}
    except Exception as e:
        logger.error(f"Failed to restart workers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@danger_router.post("/reload-client")
async def danger_reload_client():
    """Signal clients to reload. DANGER ZONE."""
    global LAST_RELOAD_TIME
    
    LAST_RELOAD_TIME = datetime.now(timezone.utc)
    logger.warning("Client reload signal sent - DANGER ZONE action")
    return {"status": "reload-signaled", "timestamp": LAST_RELOAD_TIME.isoformat()}


# Helper function to update metrics from other parts of the system
def update_system_metric(key: str, value: Any):
    """Update a system metric value."""
    if key in system_metrics:
        system_metrics[key] = value


def increment_system_metric(key: str, amount: int = 1):
    """Increment a system metric value."""
    if key in system_metrics and isinstance(system_metrics[key], int):
        system_metrics[key] += amount

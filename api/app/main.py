from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import logging
from app.db import init_db_pool, close_db_pool
from app.cache import init_redis
from app.routers import health, assets, signals, metrics, screener, alerts, market, dashboard, insights, liquidity, whales, heatmap, notes, patterns, backtests, stt_proxy
from app.gde.fabric import intelligence_api
from app.gde.predictor import predictor_api
from app.gde.api import predict_api
from app.gde.predictor.behavioral_dna import api_dna
from app.gde.api import api_correlation
from app.gde.api import api_fusion
from app.gde.api import api_radar
from app.gde.intel.gw import api_ghostwriter
from app.gde.intel.cluster import api_cluster
from app.gde.intel.hydra import api_hydra
from app.gde.intelligence.constellation import api_constellation
from app.gde.sentinel import api_sentinel
from app.gde.cortex import api_cortex
from app.gde.genesis import api_genesis
from app.gde.threat_actor import api_threat_actor
from app.gde.valkyrie import api_valkyrie
from app.gde.phantom import api_phantom
from app.gde.oracle_eye import api_oracle
from app.gde.api import api_ultrafusion
from app.gde.security.keys import api_secrets
from app.gde.security.config import api_config
from app.gde.compliance.exporter import api_exporter
from app.gde.compliance.binder import api_binder
from app.gde.compliance import api_executive_report
from app.gde.rfp import api_rfp
from app.gde.licensing import api_license
from app.gde.pricing import api_pricing
from app.gde.billing import api_billing
from app.gde.pitchdeck import api_pitchdeck
from app.gde.pitchdeck.api_pitchdeck import deck_router
from app.gde.dataroom.api_dataroom import router as dataroom_router
from app.gde.proposals.api_proposals import router as proposals_router
from app.gde.partners import router as partners_router
from app.gde.contracts import router as contracts_router
from app.gde.demo.demo_routes import demo_router
from app.gde.sales.api_sales import router as sales_router
from app.gde.apidocs.api_apidocs import router as apidocs_router
from app.gde.marketdata.api_marketdata import router as marketdata_router
from app.gde.fabric.intelligence_feed_simulator import IntelligenceFeedSimulator
from app.gde.fabric.intelligence_queue_worker import IntelligenceQueueWorker
from app.gde.fabric.websocket_alert_engine import WebSocketAlertEngine
from app.gde.fabric.socketio_gateway import SocketIOGateway
from app.gde.fabric.background_worker import BackgroundIntelWorker
from app.services.momentum_worker import start_worker, stop_worker
from app.services.screener_worker import ScreenerWorker
from app.services.websocket_server import get_ws_manager

screener_worker = ScreenerWorker()

gde_worker = IntelligenceQueueWorker()
gde_simulator = IntelligenceFeedSimulator(gde_worker)
alert_engine = WebSocketAlertEngine()
socketio_gateway = SocketIOGateway()
background_worker = BackgroundIntelWorker()

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    import os
    logger.info("Starting GhostQuant API...")
    
    # Check if we're in serverless/demo mode (no DB required)
    serverless_mode = os.getenv("SERVERLESS_MODE", "false").lower() == "true"
    
    db_initialized = False
    workers_started = False
    
    # Initialize Redis cache (Upstash REST API)
    try:
        init_redis()
        logger.info("Redis cache initialized")
    except Exception as e:
        logger.warning(f"Redis cache initialization failed: {e}")
    
    if not serverless_mode:
        try:
            await init_db_pool()
            db_initialized = True
            logger.info("Database pool initialized")
        except Exception as e:
            logger.warning(f"Database initialization failed (running in limited mode): {e}")
        
        try:
            asyncio.create_task(start_worker())
            asyncio.create_task(screener_worker.start())
            asyncio.create_task(alert_engine.start_polling())
            asyncio.create_task(socketio_gateway.start_polling())
            await background_worker.start()
            
            ws_manager = get_ws_manager()
            ws_manager.start()
            workers_started = True
            logger.info("Background workers started")
        except Exception as e:
            logger.warning(f"Worker initialization failed (running in limited mode): {e}")
    else:
        logger.info("Running in serverless mode - skipping DB and workers")
    
    logger.info("GhostQuant API started successfully")
    
    yield
    
    logger.info("Shutting down GhostQuant API...")
    
    if workers_started:
        try:
            await stop_worker()
            await screener_worker.stop()
            await alert_engine.stop_polling()
            await socketio_gateway.stop_polling()
            await background_worker.stop()
            ws_manager = get_ws_manager()
            ws_manager.stop()
        except Exception as e:
            logger.warning(f"Worker shutdown error: {e}")
    
    if db_initialized:
        try:
            await close_db_pool()
        except Exception as e:
            logger.warning(f"Database shutdown error: {e}")
    
    logger.info("GhostQuant API shut down successfully")

app = FastAPI(
    title="GhostQuant API",
    description="Private crypto-native research & signal platform",
    version="0.1.0",
    lifespan=lifespan
)

app.mount("/socket.io", socketio_gateway.get_asgi_app())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(health.router, tags=["health"])
app.include_router(assets.router, tags=["assets"])
app.include_router(signals.router, tags=["signals"])
app.include_router(metrics.router, tags=["metrics"])
app.include_router(screener.router, tags=["screener"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(market.router, tags=["market"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(insights.router, tags=["insights"])
app.include_router(liquidity.router, tags=["liquidity"])
app.include_router(whales.router, tags=["whales"])
app.include_router(heatmap.router, tags=["heatmap"])
app.include_router(notes.router, tags=["notes"])
app.include_router(patterns.router, tags=["patterns"])
app.include_router(backtests.router, tags=["backtests"])
app.include_router(intelligence_api.router)
app.include_router(predictor_api.router)
app.include_router(predict_api.router, prefix="/predict", tags=["Prediction"])
app.include_router(api_dna.router, prefix="/dna", tags=["Behavioral DNA"])
app.include_router(api_correlation.router, prefix="/correlation", tags=["Correlation"])
app.include_router(api_fusion.router, prefix="/fusion", tags=["FusionEngine"])
app.include_router(api_radar.router, prefix="/radar", tags=["GlobalRadar"])
app.include_router(api_ghostwriter.router, prefix="/gw", tags=["GhostWriter"])
app.include_router(api_cluster.router, prefix="/cluster", tags=["Cluster Intelligence"])
app.include_router(api_hydra.router, tags=["OperationHydra"])
app.include_router(api_constellation.router, tags=["Constellation"])
app.include_router(api_sentinel.router, tags=["Sentinel"])
app.include_router(api_cortex.router, tags=["Cortex"])
app.include_router(api_genesis.router, tags=["Genesis"])
app.include_router(api_threat_actor.router, prefix="/actor", tags=["Threat Actor"])
app.include_router(api_valkyrie.router, tags=["Valkyrie"])
app.include_router(api_phantom.router, tags=["Phantom"])
app.include_router(api_oracle.router, prefix="/oracle", tags=["OracleEye"])
app.include_router(api_ultrafusion.router, prefix="/ultrafusion", tags=["UltraFusion"])
app.include_router(api_secrets.router, prefix="/secrets", tags=["Keys & Secrets"])
app.include_router(api_config.router, prefix="/config", tags=["Configuration"])
app.include_router(api_exporter.router, prefix="/exporter", tags=["Compliance Export"])
app.include_router(api_binder.router, prefix="/binder", tags=["Audit Binder"])
app.include_router(api_executive_report.router, prefix="/compliance", tags=["Executive Report"])
app.include_router(api_rfp.router, tags=["RFP Generator"])
app.include_router(api_license.router, tags=["API Licensing"])
app.include_router(api_pricing.router, tags=["Pricing Engine"])
app.include_router(api_billing.router, tags=["Billing System"])
app.include_router(api_pitchdeck.router, tags=["Pitch Deck Generator"])
app.include_router(deck_router, tags=["Deck Builder"])
app.include_router(dataroom_router, tags=["Data Room"])
app.include_router(proposals_router, tags=["Proposal Auto-Writer"])
app.include_router(partners_router, tags=["Partner Program"])
app.include_router(contracts_router, tags=["Channel Partner Contracts"])
app.include_router(demo_router)
app.include_router(sales_router)
app.include_router(apidocs_router)
app.include_router(marketdata_router, prefix="/market", tags=["Market Data"])

from app.gde.whale_intel import router as whale_intel_router
app.include_router(whale_intel_router)

from app.gde.constellation_fusion import fusion_router
app.include_router(fusion_router)

# Phase 10: Constellation Advanced Features (additive only)
from app.gde.constellation_fusion_stream import router as stream_router
from app.gde.constellation_risk import router as risk_router
from app.gde.constellation_ai import router as ai_router
from app.gde.constellation_timeline import router as timeline_router
app.include_router(stream_router)
app.include_router(risk_router)
app.include_router(ai_router)
app.include_router(timeline_router)

# Hydra Input Adapter - routes all Hydra console requests through normalization
from app.gde.constellation_hydra.hydra_input_adapter import hydra_adapter_router
app.include_router(hydra_adapter_router)

# WIDB - Whale Intelligence Database (Phase 11)
from app.widb import widb_router
app.include_router(widb_router)

# Demo Engine - Subscriber demo mode endpoints
# REMOVED: demo_engine_router import causes ModuleNotFoundError on DigitalOcean
# from app.demo_engine import demo_engine_router
# app.include_router(demo_engine_router)

# STT Proxy - Server-side ElevenLabs STT proxy (eliminates domain restrictions)
app.include_router(stt_proxy.router)

# Global Threat Map - Unified threat detection and monitoring
from app.routers import darkpool, manipulation, stablecoin, derivatives, unified_risk
app.include_router(darkpool.router, tags=["Global Threat Map"])
app.include_router(manipulation.router, tags=["Global Threat Map"])
app.include_router(stablecoin.router, tags=["Global Threat Map"])
app.include_router(derivatives.router, tags=["Global Threat Map"])
app.include_router(unified_risk.router, tags=["Global Threat Map"])

# System Health & Settings V2 - Real-time monitoring and control
from app.routers.system import router as system_router, simulation_router, danger_router
app.include_router(system_router)
app.include_router(simulation_router)
app.include_router(danger_router)


@app.post("/intel/sim/start")
async def start_sim():
    """Start the intelligence feed simulator."""
    import asyncio
    await gde_worker.start()
    asyncio.create_task(gde_simulator.start(interval=1.0))
    return {"status": "simulator-started"}

@app.post("/intel/sim/stop")
async def stop_sim():
    """Stop the intelligence feed simulator."""
    await gde_simulator.stop()
    await gde_worker.stop()
    return {"status": "simulator-stopped"}

async def _handle_intel_websocket(websocket: WebSocket):
    """
    Shared WebSocket handler for real-time intelligence alerts.
    Used by both /ws/alerts and /ws/intel endpoints.
    
    Features:
    - Real-time alert streaming from Redis
    - Automatic reconnect handling
    - Multiple concurrent clients
    - Graceful slow client handling
    - Auto-starts workers on first connection
    
    Connection flow:
    1. Client connects
    2. Workers auto-start if not running
    3. Receives connection confirmation
    4. Receives real-time alerts as they are generated
    5. Receives periodic heartbeats (every 30s)
    """
    import asyncio
    
    # Auto-start workers on WebSocket connection (idempotent)
    if not background_worker.is_running:
        try:
            await background_worker.start()
            logger.info("Background worker auto-started on WebSocket connection")
        except Exception as e:
            logger.warning(f"Failed to auto-start background worker: {e}")
    
    # Update system metrics for connected clients
    from app.routers.system import update_system_metric, increment_system_metric
    increment_system_metric("ws_client_count", 1)
    update_system_metric("last_ws_connect", datetime.utcnow().isoformat())
    
    await alert_engine.connect(websocket)
    
    heartbeat_task = asyncio.create_task(alert_engine.send_heartbeat(websocket))
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("action") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
            elif data.get("action") == "stats":
                stats = alert_engine.get_stats()
                await websocket.send_json({
                    "type": "stats",
                    "data": stats
                })
    
    except WebSocketDisconnect:
        heartbeat_task.cancel()
        alert_engine.disconnect(websocket)
        increment_system_metric("ws_client_count", -1)
    except Exception as e:
        logger.error(f"WebSocket alert error: {e}")
        heartbeat_task.cancel()
        alert_engine.disconnect(websocket)
        increment_system_metric("ws_client_count", -1)

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """WebSocket endpoint for real-time intelligence alerts (legacy route)."""
    await _handle_intel_websocket(websocket)

@app.websocket("/ws/intel")
async def websocket_intel(websocket: WebSocket):
    """WebSocket endpoint for real-time intelligence alerts (new unified route)."""
    await _handle_intel_websocket(websocket)

@app.websocket("/ws/system")
async def websocket_system(websocket: WebSocket):
    """
    WebSocket endpoint for real-time system status updates.
    Used by Settings V2 page for live monitoring.
    
    Streams:
    - system_status: Overall system health
    - worker_status: Background worker state
    - redis_feed: Redis event counts
    - engine_metrics: Processing metrics
    
    Updates are sent every 2 seconds automatically.
    """
    import asyncio
    import time
    from app.routers.system import system_metrics, update_system_metric, increment_system_metric
    from app.cache import get_redis
    
    await websocket.accept()
    
    # Track this connection
    increment_system_metric("ws_client_count", 1)
    update_system_metric("last_ws_connect", datetime.utcnow().isoformat())
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Connected to GhostQuant System WebSocket"
        })
        
        # Start streaming system status
        while True:
            redis = get_redis()
            redis_connected = redis and redis.enabled
            
            # Measure Redis latency
            latency = 0
            if redis_connected:
                try:
                    start = time.time()
                    redis._execute("PING")
                    latency = int((time.time() - start) * 1000)
                except Exception:
                    latency = -1
            
            # Get actual worker state
            try:
                actual_running = background_worker.is_running
            except Exception:
                actual_running = system_metrics.get("worker_running", False)
            
            # Get Redis event count
            total_events = system_metrics.get("total_events", 0)
            if redis_connected:
                try:
                    keys = redis.keys("intel:*")
                    total_events = len(keys) if keys else total_events
                except Exception:
                    pass
            
            # Send system_status
            await websocket.send_json({
                "type": "system_status",
                "data": {
                    "connection": "connected" if redis_connected else "disconnected",
                    "reconnectCount": system_metrics.get("reconnect_count", 0),
                    "latency": latency,
                    "lastAlert": system_metrics.get("last_alert"),
                    "wsClientCount": system_metrics.get("ws_client_count", 0)
                },
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Send worker_status
            await websocket.send_json({
                "type": "worker_status",
                "data": {
                    "running": actual_running,
                    "simulationMode": system_metrics.get("simulation_mode", False),
                    "loopSpeed": 50,
                    "queueSize": system_metrics.get("queue_size", 0),
                    "processingErrors": system_metrics.get("processing_errors", 0)
                },
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Send redis_feed
            await websocket.send_json({
                "type": "redis_feed",
                "data": {
                    "totalEvents": total_events,
                    "feedVelocity": system_metrics.get("feed_velocity", 0),
                    "lastMessage": system_metrics.get("last_alert"),
                    "severity": {
                        "high": system_metrics.get("high_severity", 0),
                        "medium": system_metrics.get("medium_severity", 0),
                        "low": system_metrics.get("low_severity", 0)
                    }
                },
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Send engine_metrics
            await websocket.send_json({
                "type": "engine_metrics",
                "data": {
                    "timelineEvents": system_metrics.get("timeline_events", 0),
                    "graphNodes": system_metrics.get("graph_nodes", 0),
                    "graphEdges": system_metrics.get("graph_edges", 0),
                    "ringSystems": system_metrics.get("ring_systems", 0),
                    "ghostmindInsights": system_metrics.get("ghostmind_insights", 0),
                    "entityCacheSize": system_metrics.get("entity_cache_size", 0)
                },
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Wait 2 seconds before next update
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        increment_system_metric("ws_client_count", -1)
        logger.info("System WebSocket client disconnected")
    except Exception as e:
        increment_system_metric("ws_client_count", -1)
        logger.error(f"System WebSocket error: {e}")

@app.websocket("/ws/momentum")
async def websocket_momentum(websocket: WebSocket):
    """
    WebSocket endpoint for real-time momentum updates.
    
    Clients can subscribe to:
    - "top50": Top 50 coins by momentum
    - "symbol:BTC": Specific symbol updates
    - "all": All updates
    
    Send subscription message: {"action": "subscribe", "channels": ["top50", "symbol:BTC"]}
    """
    ws_manager = get_ws_manager()
    await ws_manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            action = data.get("action")
            
            if action == "subscribe":
                channels = data.get("channels", [])
                await ws_manager.subscribe(websocket, channels)
                await ws_manager.send_personal_message(
                    {"type": "subscribed", "channels": channels},
                    websocket
                )
            
            elif action == "unsubscribe":
                channels = data.get("channels", [])
                await ws_manager.unsubscribe(websocket, channels)
                await ws_manager.send_personal_message(
                    {"type": "unsubscribed", "channels": channels},
                    websocket
                )
            
            elif action == "ping":
                await ws_manager.send_personal_message(
                    {"type": "pong"},
                    websocket
                )
    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

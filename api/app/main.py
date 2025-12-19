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

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """
    WebSocket endpoint for real-time intelligence alerts.
    
    Features:
    - Real-time alert streaming from Redis
    - Automatic reconnect handling
    - Multiple concurrent clients
    - Graceful slow client handling
    
    Connection flow:
    1. Client connects
    2. Receives connection confirmation
    3. Receives real-time alerts as they are generated
    4. Receives periodic heartbeats (every 30s)
    """
    await alert_engine.connect(websocket)
    
    import asyncio
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
    except Exception as e:
        logger.error(f"WebSocket alert error: {e}")
        heartbeat_task.cancel()
        alert_engine.disconnect(websocket)

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

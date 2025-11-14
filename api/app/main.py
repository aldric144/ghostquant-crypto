from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.db import init_db_pool, close_db_pool
from app.routers import health, assets, signals, metrics, screener, alerts, market
from app.services.momentum_worker import start_worker, stop_worker
from app.services.websocket_server import get_ws_manager

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting GhostQuant API...")
    await init_db_pool()
    
    await start_worker()
    
    ws_manager = get_ws_manager()
    ws_manager.start()
    
    logger.info("GhostQuant API started successfully")
    
    yield
    
    logger.info("Shutting down GhostQuant API...")
    await stop_worker()
    ws_manager.stop()
    await close_db_pool()
    logger.info("GhostQuant API shut down successfully")

app = FastAPI(
    title="GhostQuant API",
    description="Private crypto-native research & signal platform",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(assets.router, tags=["assets"])
app.include_router(signals.router, tags=["signals"])
app.include_router(metrics.router, tags=["metrics"])
app.include_router(screener.router, tags=["screener"])
app.include_router(alerts.router, tags=["alerts"])
app.include_router(market.router, tags=["market"])

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

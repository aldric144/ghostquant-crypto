from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging
from app.db import init_db_pool, close_db_pool
from app.routers import health, assets, signals, metrics, screener, alerts, market, dashboard, insights, liquidity, whales, heatmap, notes, patterns, backtests
from app.services.momentum_worker import start_worker, stop_worker
from app.services.screener_worker import ScreenerWorker
from app.services.websocket_server import get_ws_manager

screener_worker = ScreenerWorker()

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    logger.info("Starting GhostQuant API...")
    await init_db_pool()
    
    asyncio.create_task(start_worker())
    asyncio.create_task(screener_worker.start())
    
    ws_manager = get_ws_manager()
    ws_manager.start()
    
    logger.info("GhostQuant API started successfully")
    
    yield
    
    logger.info("Shutting down GhostQuant API...")
    await stop_worker()
    await screener_worker.stop()
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
    allow_origins=["http://159.89.178.196:3000", "http://localhost:3000", "https://ghostquantpreview.loca.lt", "http://ghostquantpreview.loca.lt", "https://ghostquant.ai", "https://www.ghostquant.ai"],
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

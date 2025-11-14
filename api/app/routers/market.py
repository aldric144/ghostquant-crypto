"""
Market data and momentum screener endpoints.
Provides full CoinGecko universe with momentum scoring, whale fusion, and PreTrend integration.
"""
import logging
import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Depends, Body
from pydantic import BaseModel, Field
import json

from ..deps import get_database
from ..services.momentum_scorer import MomentumScorer
from ..services.coingecko_client import CoinGeckoClient
from ..services.redis_cache import RedisCache
from ..services.whale_fusion import WhaleFusion
from ..services.pretrend_fusion import PreTrendFusion
from ..services.rank_tracker import RankTracker
from ..services.clustering_engine import ClusteringEngine
from ..services.backtest_engine import BacktestEngine
from ..services.alert_manager import AlertManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/market", tags=["market"])

coingecko_client = CoinGeckoClient()
redis_cache = RedisCache()
momentum_scorer = MomentumScorer()
whale_fusion = WhaleFusion()
pretrend_fusion = PreTrendFusion()
rank_tracker = RankTracker()
clustering_engine = ClusteringEngine()
backtest_engine = BacktestEngine()
alert_manager = AlertManager()


class CoinBasic(BaseModel):
    id: str
    symbol: str
    name: str
    image: str
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    market_cap_rank: Optional[int] = None


class SubScores(BaseModel):
    price_momentum: float = Field(description="Price momentum score (0-30)")
    volume_spike: float = Field(description="Volume spike score (0-25)")
    rsi_signal: float = Field(description="RSI signal score (0-20)")
    ma_cross: float = Field(description="MA crossover score (0-15)")
    pretrend_bonus: float = Field(description="PreTrend bonus (0-3)")
    whale_bonus: float = Field(description="Whale bonus (0-2.5)")


class MomentumCoin(BaseModel):
    id: str
    symbol: str
    name: str
    image: str
    current_price: float
    market_cap: float
    market_cap_rank: Optional[int]
    total_volume: float
    price_change_percentage_1h: Optional[float]
    price_change_percentage_24h: Optional[float]
    price_change_percentage_7d: Optional[float]
    momentum_score: float = Field(description="Final momentum score (0-100)")
    sub_scores: SubScores
    whale_confidence: float = Field(description="Whale confidence (0-1)")
    pretrend_prob: float = Field(description="PreTrend probability (0-1)")
    sparkline_7d: Optional[List[float]] = None
    action: str = Field(description="BUY, TRIM, EXIT, or HOLD")
    confidence: float = Field(description="Action confidence (0-1)")
    cluster_id: Optional[int] = None
    cluster_label: Optional[str] = None


class CoinDetail(MomentumCoin):
    explain: Dict[str, Any] = Field(description="Explainability breakdown")
    whale_details: Optional[Dict[str, Any]] = None
    pretrend_details: Optional[Dict[str, Any]] = None
    rank_history: Optional[List[Dict[str, Any]]] = None


class RankChange(BaseModel):
    id: str
    symbol: str
    name: str
    current_rank: int
    previous_rank: int
    rank_delta: int
    momentum_score: float
    timestamp: str


class AlertRequest(BaseModel):
    user_contact: str = Field(description="Email or Telegram ID")
    symbol: str
    alert_type: str = Field(description="score_above, score_below, price_above, price_below, whale_seen, pretrend_above")
    threshold: float
    channels: List[str] = Field(description="List of channels: email, telegram, push")


class AlertResponse(BaseModel):
    alert_id: str
    status: str
    message: str


class Cluster(BaseModel):
    cluster_id: int
    label: str
    coin_count: int
    avg_momentum: float
    top_coins: List[str]


class BacktestRequest(BaseModel):
    strategy: str = Field(default="momentum", description="Strategy name")
    symbol: Optional[str] = None
    start_date: str
    end_date: str
    threshold: float = Field(default=70.0, description="Entry threshold")
    hold_hours: int = Field(default=24, description="Hold period in hours")


class BacktestResult(BaseModel):
    job_id: str
    status: str
    metrics: Optional[Dict[str, Any]] = None
    trades: Optional[List[Dict[str, Any]]] = None



@router.get("/coins", response_model=Dict[str, Any])
async def get_coins(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(250, ge=1, le=250, description="Results per page"),
    db=Depends(get_database)
):
    """
    Get paginated list of all coins from CoinGecko.
    Returns basic coin info (id, symbol, name, image, price, market_cap).
    """
    try:
        cache_key = f"coins:page:{page}:per_page:{per_page}"
        cached = await redis_cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {cache_key}")
            return json.loads(cached)
        
        coins = await coingecko_client.get_coins_markets(
            page=page,
            per_page=per_page,
            sparkline=False
        )
        
        result = {
            "page": page,
            "per_page": per_page,
            "total": len(coins),
            "coins": [
                CoinBasic(
                    id=coin["id"],
                    symbol=coin["symbol"],
                    name=coin["name"],
                    image=coin["image"],
                    current_price=coin.get("current_price"),
                    market_cap=coin.get("market_cap"),
                    market_cap_rank=coin.get("market_cap_rank")
                ).dict()
                for coin in coins
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await redis_cache.set(cache_key, json.dumps(result), ttl=int(os.getenv("MOMENTUM_CACHE_TTL", 60)))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching coins: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch coins: {str(e)}")


@router.get("/momentum", response_model=Dict[str, Any])
async def get_momentum(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Results per page"),
    sort: str = Query("momentum_score", description="Sort field"),
    min_marketcap: Optional[float] = Query(None, description="Minimum market cap filter"),
    whale_only: bool = Query(False, description="Show only whale movers"),
    cluster_id: Optional[int] = Query(None, description="Filter by cluster ID"),
    db=Depends(get_database)
):
    """
    Get paginated momentum screener results with full scoring.
    Returns coins with momentum_score, sub_scores, whale_confidence, pretrend_prob, action.
    """
    try:
        cache_key = f"momentum:page:{page}:per_page:{per_page}:sort:{sort}:whale:{whale_only}:cluster:{cluster_id}"
        cached = await redis_cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {cache_key}")
            return json.loads(cached)
        
        scored_coins = await redis_cache.get_scored_coins()
        
        if not scored_coins:
            logger.warning("No scored coins in cache, triggering refresh")
            coins = await coingecko_client.get_coins_markets(page=1, per_page=100, sparkline=True)
            scored_coins = []
            for coin in coins:
                score_data = await momentum_scorer.compute_score(coin)
                scored_coins.append(score_data)
        
        filtered = scored_coins
        
        if min_marketcap:
            filtered = [c for c in filtered if c.get("market_cap", 0) >= min_marketcap]
        
        if whale_only:
            whale_threshold = float(os.getenv("WHALE_CONFIDENCE_THRESHOLD", 0.6))
            filtered = [c for c in filtered if c.get("whale_confidence", 0) >= whale_threshold]
        
        if cluster_id is not None:
            filtered = [c for c in filtered if c.get("cluster_id") == cluster_id]
        
        reverse = True
        if sort.startswith("-"):
            sort = sort[1:]
            reverse = False
        
        filtered.sort(key=lambda x: x.get(sort, 0), reverse=reverse)
        
        start = (page - 1) * per_page
        end = start + per_page
        paginated = filtered[start:end]
        
        result = {
            "page": page,
            "per_page": per_page,
            "total": len(filtered),
            "total_pages": (len(filtered) + per_page - 1) // per_page,
            "results": paginated,
            "timestamp": datetime.utcnow().isoformat(),
            "stale": False
        }
        
        await redis_cache.set(cache_key, json.dumps(result), ttl=30)
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching momentum: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch momentum: {str(e)}")


@router.get("/coin/{coin_id}", response_model=CoinDetail)
async def get_coin_detail(
    coin_id: str,
    db=Depends(get_database)
):
    """
    Get detailed momentum analysis for a specific coin.
    Includes explainability, whale details, pretrend details, rank history.
    """
    try:
        cache_key = f"coin:{coin_id}:detail"
        cached = await redis_cache.get(cache_key)
        if cached:
            return json.loads(cached)
        
        coin_data = await coingecko_client.get_coin_by_id(coin_id)
        
        score_data = await momentum_scorer.compute_score(coin_data, explain=True)
        
        whale_details = await whale_fusion.get_whale_details(coin_data["symbol"])
        
        pretrend_details = await pretrend_fusion.get_pretrend_details(coin_data["symbol"])
        
        rank_history = await rank_tracker.get_rank_history(coin_id, hours=24)
        
        result = CoinDetail(
            **score_data,
            whale_details=whale_details,
            pretrend_details=pretrend_details,
            rank_history=rank_history
        )
        
        await redis_cache.set(cache_key, result.json(), ttl=60)
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching coin detail for {coin_id}: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=f"Coin not found: {coin_id}")


@router.get("/rank-changes", response_model=Dict[str, Any])
async def get_rank_changes(
    since: str = Query("15m", description="Time window: 15m, 1h, 24h"),
    limit: int = Query(25, ge=1, le=100, description="Number of results"),
    db=Depends(get_database)
):
    """
    Get coins with biggest rank changes in the specified time window.
    """
    try:
        time_map = {"15m": 15, "1h": 60, "24h": 1440}
        minutes = time_map.get(since, 15)
        
        changes = await rank_tracker.get_rank_changes(minutes=minutes, limit=limit)
        
        result = {
            "since": since,
            "minutes": minutes,
            "total": len(changes),
            "changes": changes,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching rank changes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch rank changes: {str(e)}")


@router.post("/alerts", response_model=AlertResponse)
async def create_alert(
    alert: AlertRequest,
    db=Depends(get_database)
):
    """
    Create a new alert for a coin based on score, price, whale activity, or pretrend.
    Supports email, Telegram, and push notifications.
    """
    try:
        valid_types = ["score_above", "score_below", "price_above", "price_below", "whale_seen", "pretrend_above"]
        if alert.alert_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid alert_type. Must be one of: {valid_types}")
        
        valid_channels = ["email", "telegram", "push"]
        for channel in alert.channels:
            if channel not in valid_channels:
                raise HTTPException(status_code=400, detail=f"Invalid channel: {channel}. Must be one of: {valid_channels}")
        
        alert_id = await alert_manager.create_alert(
            user_contact=alert.user_contact,
            symbol=alert.symbol,
            alert_type=alert.alert_type,
            threshold=alert.threshold,
            channels=alert.channels,
            db=db
        )
        
        return AlertResponse(
            alert_id=alert_id,
            status="created",
            message=f"Alert created for {alert.symbol} ({alert.alert_type} {alert.threshold})"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating alert: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")


@router.get("/clusters", response_model=Dict[str, Any])
async def get_clusters(
    db=Depends(get_database)
):
    """
    Get auto-generated coin clusters grouped by chain/sector/behavior.
    """
    try:
        cache_key = "clusters:latest"
        cached = await redis_cache.get(cache_key)
        if cached:
            return json.loads(cached)
        
        clusters = await clustering_engine.get_clusters()
        
        result = {
            "total_clusters": len(clusters),
            "clusters": clusters,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await redis_cache.set(cache_key, json.dumps(result), ttl=3600)
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching clusters: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch clusters: {str(e)}")


@router.post("/backtest", response_model=BacktestResult)
async def run_backtest(
    request: BacktestRequest,
    db=Depends(get_database)
):
    """
    Run a backtest for the momentum strategy on historical data.
    Returns job_id immediately; results available via GET /backtest/{job_id}.
    """
    try:
        if not os.getenv("ENABLE_BACKTEST_HOOK", "true").lower() == "true":
            raise HTTPException(status_code=403, detail="Backtesting is disabled")
        
        job_id = await backtest_engine.create_job(
            strategy=request.strategy,
            symbol=request.symbol,
            start_date=request.start_date,
            end_date=request.end_date,
            threshold=request.threshold,
            hold_hours=request.hold_hours,
            db=db
        )
        
        return BacktestResult(
            job_id=job_id,
            status="queued",
            metrics=None,
            trades=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating backtest: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create backtest: {str(e)}")


@router.get("/backtest/{job_id}", response_model=BacktestResult)
async def get_backtest_result(
    job_id: str,
    db=Depends(get_database)
):
    """
    Get backtest results by job ID.
    """
    try:
        result = await backtest_engine.get_result(job_id, db=db)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Backtest job not found: {job_id}")
        
        return BacktestResult(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching backtest result: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch backtest result: {str(e)}")

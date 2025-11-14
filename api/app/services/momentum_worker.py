"""
Background worker for momentum screener.
Orchestrates periodic refresh of coin data, scoring, clustering, and alerts.
"""
import os
import logging
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .coingecko_client import CoinGeckoClient
from .redis_cache import RedisCache
from .momentum_scorer import MomentumScorer
from .whale_fusion import WhaleFusion
from .pretrend_fusion import PreTrendFusion
from .rank_tracker import RankTracker
from .clustering_engine import ClusteringEngine
from .alert_manager import AlertManager

logger = logging.getLogger(__name__)


class MomentumWorker:
    """
    Background worker that:
    1. Fast refresh (30s): Updates top N coins with momentum scores
    2. Full refresh (5min): Updates entire CoinGecko universe
    3. Clustering (hourly): Recomputes coin clusters
    4. Alert checking: Evaluates alerts after each refresh
    """
    
    def __init__(self):
        self.coingecko_client = CoinGeckoClient()
        self.redis_cache = RedisCache()
        self.momentum_scorer = MomentumScorer()
        self.whale_fusion = WhaleFusion()
        self.pretrend_fusion = PreTrendFusion()
        self.rank_tracker = RankTracker()
        self.clustering_engine = ClusteringEngine()
        self.alert_manager = AlertManager()
        
        self.fast_refresh_seconds = int(os.getenv("MOMENTUM_FAST_REFRESH_SECONDS", 30))
        self.full_refresh_seconds = int(os.getenv("MOMENTUM_FULL_REFRESH_SECONDS", 300))
        self.clustering_interval = int(os.getenv("CLUSTERING_UPDATE_INTERVAL", 3600))
        self.top_n_fast = int(os.getenv("MOMENTUM_TOP_N_FAST", 100))
        
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    def start(self):
        """Start the background worker."""
        if self.is_running:
            logger.warning("Worker already running")
            return
        
        logger.info("Starting momentum worker...")
        
        self.scheduler.add_job(
            self._fast_refresh,
            trigger=IntervalTrigger(seconds=self.fast_refresh_seconds),
            id="fast_refresh",
            name="Fast Refresh (Top N coins)",
            replace_existing=True
        )
        
        self.scheduler.add_job(
            self._full_refresh,
            trigger=IntervalTrigger(seconds=self.full_refresh_seconds),
            id="full_refresh",
            name="Full Refresh (All coins)",
            replace_existing=True
        )
        
        self.scheduler.add_job(
            self._clustering_job,
            trigger=IntervalTrigger(seconds=self.clustering_interval),
            id="clustering",
            name="Clustering Job",
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        
        logger.info(f"Worker started: fast_refresh={self.fast_refresh_seconds}s, full_refresh={self.full_refresh_seconds}s")
    
    def stop(self):
        """Stop the background worker."""
        if not self.is_running:
            return
        
        logger.info("Stopping momentum worker...")
        self.scheduler.shutdown()
        self.is_running = False
        logger.info("Worker stopped")
    
    async def _fast_refresh(self):
        """
        Fast refresh: Update top N coins with momentum scores.
        Called every 30 seconds.
        """
        try:
            start_time = datetime.utcnow()
            logger.info(f"Starting fast refresh (top {self.top_n_fast} coins)...")
            
            coins = await self.coingecko_client.get_coins_markets(
                page=1,
                per_page=self.top_n_fast,
                sparkline=True
            )
            
            logger.info(f"Fetched {len(coins)} coins from CoinGecko")
            
            scored_coins = []
            for coin in coins:
                try:
                    symbol = coin.get("symbol", "").upper()
                    whale_confidence = await self.whale_fusion.get_whale_confidence(symbol)
                    
                    pretrend_prob = await self.pretrend_fusion.get_pretrend_prob(symbol)
                    
                    score_data = await self.momentum_scorer.compute_score(
                        coin,
                        whale_confidence=whale_confidence,
                        pretrend_prob=pretrend_prob,
                        explain=False
                    )
                    
                    scored_coins.append(score_data)
                    
                    await self.redis_cache.set_scored_coin(coin["id"], score_data)
                
                except Exception as e:
                    logger.error(f"Error scoring coin {coin.get('id', 'unknown')}: {e}")
            
            logger.info(f"Scored {len(scored_coins)} coins")
            
            await self.rank_tracker.record_ranks(scored_coins)
            
            await self.alert_manager.check_alerts(scored_coins)
            
            await self.redis_cache.increment_metric("fast_refresh_count")
            
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"Fast refresh completed in {duration:.2f}s")
        
        except Exception as e:
            logger.error(f"Error in fast refresh: {e}", exc_info=True)
            await self.redis_cache.increment_metric("fast_refresh_errors")
    
    async def _full_refresh(self):
        """
        Full refresh: Update entire CoinGecko universe.
        Called every 5 minutes.
        Paginates through ALL coins until empty response.
        """
        try:
            start_time = datetime.utcnow()
            logger.info("Starting full refresh (all coins)...")
            
            all_scored_coins = []
            page = 1
            
            while True:
                try:
                    coins = await self.coingecko_client.get_coins_markets(
                        page=page,
                        per_page=250,
                        sparkline=True
                    )
                    
                    if not coins:
                        break
                    
                    logger.info(f"Processing page {page}: {len(coins)} coins")
                    
                    for coin in coins:
                        try:
                            symbol = coin.get("symbol", "").upper()
                            
                            whale_confidence = await self.whale_fusion.get_whale_confidence(symbol)
                            
                            pretrend_prob = await self.pretrend_fusion.get_pretrend_prob(symbol)
                            
                            score_data = await self.momentum_scorer.compute_score(
                                coin,
                                whale_confidence=whale_confidence,
                                pretrend_prob=pretrend_prob,
                                explain=False
                            )
                            
                            all_scored_coins.append(score_data)
                            
                            await self.redis_cache.set_scored_coin(coin["id"], score_data)
                        
                        except Exception as e:
                            logger.error(f"Error scoring coin {coin.get('id', 'unknown')}: {e}")
                    
                    page += 1
                    
                    await asyncio.sleep(1)
                
                except Exception as e:
                    logger.error(f"Error processing page {page}: {e}")
                    break
            
            logger.info(f"Full refresh: scored {len(all_scored_coins)} coins")
            
            await self.rank_tracker.record_ranks(all_scored_coins)
            
            await self.alert_manager.check_alerts(all_scored_coins)
            
            await self.redis_cache.increment_metric("full_refresh_count")
            
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"Full refresh completed in {duration:.2f}s")
        
        except Exception as e:
            logger.error(f"Error in full refresh: {e}", exc_info=True)
            await self.redis_cache.increment_metric("full_refresh_errors")
    
    async def _clustering_job(self):
        """
        Clustering job: Recompute coin clusters.
        Called every hour.
        """
        try:
            start_time = datetime.utcnow()
            logger.info("Starting clustering job...")
            
            scored_coins = await self.redis_cache.get_scored_coins()
            
            if not scored_coins:
                logger.warning("No scored coins available for clustering")
                return
            
            success = await self.clustering_engine.compute_clusters(scored_coins)
            
            if success:
                logger.info(f"Clustering completed for {len(scored_coins)} coins")
                await self.redis_cache.increment_metric("clustering_count")
            else:
                logger.warning("Clustering failed or disabled")
            
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"Clustering job completed in {duration:.2f}s")
        
        except Exception as e:
            logger.error(f"Error in clustering job: {e}", exc_info=True)
            await self.redis_cache.increment_metric("clustering_errors")


_worker_instance = None


def get_worker() -> MomentumWorker:
    """Get or create the global worker instance."""
    global _worker_instance
    if _worker_instance is None:
        _worker_instance = MomentumWorker()
    return _worker_instance


async def start_worker():
    """Start the background worker."""
    worker = get_worker()
    worker.start()


async def stop_worker():
    """Stop the background worker."""
    worker = get_worker()
    worker.stop()

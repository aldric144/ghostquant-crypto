"""
Clustering engine - auto-groups coins by chain/sector/behavior using k-means.
"""
import os
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from .redis_cache import RedisCache

logger = logging.getLogger(__name__)


class ClusteringEngine:
    """
    Auto-cluster coins using k-means based on momentum features.
    Groups coins by similar behavior patterns (momentum, volume, market cap, etc.).
    """
    
    def __init__(self):
        self.redis_cache = RedisCache()
        self.n_clusters = int(os.getenv("CLUSTERING_N_CLUSTERS", 8))
        self.method = os.getenv("CLUSTERING_METHOD", "kmeans")
        self.enabled = os.getenv("CLUSTERING_ENABLED", "true").lower() == "true"
        
        self.cluster_labels = [
            "High Momentum Leaders",
            "Large Cap Stable",
            "Mid Cap Movers",
            "Small Cap Volatile",
            "Volume Spike Group",
            "Whale Activity Group",
            "PreTrend Signals",
            "Low Activity Group"
        ]
    
    async def compute_clusters(self, scored_coins: List[Dict[str, Any]]) -> bool:
        """
        Compute clusters for all coins and store in Redis.
        Called by background worker periodically.
        """
        try:
            if not self.enabled or len(scored_coins) < self.n_clusters:
                logger.warning(f"Clustering disabled or insufficient coins ({len(scored_coins)} < {self.n_clusters})")
                return False
            
            features = []
            coin_ids = []
            
            for coin in scored_coins:
                momentum_score = coin.get("momentum_score", 50)
                market_cap = coin.get("market_cap", 0)
                total_volume = coin.get("total_volume", 0)
                whale_confidence = coin.get("whale_confidence", 0)
                pretrend_prob = coin.get("pretrend_prob", 0.5)
                
                market_cap_log = np.log10(market_cap + 1)
                
                volume_ratio = (total_volume / market_cap) if market_cap > 0 else 0
                
                features.append([
                    momentum_score,
                    volume_ratio * 100,  # Scale up
                    market_cap_log,
                    whale_confidence * 100,  # Scale up
                    pretrend_prob * 100  # Scale up
                ])
                coin_ids.append(coin.get("id"))
            
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            
            kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
            cluster_ids = kmeans.fit_predict(features_scaled)
            
            for coin, cluster_id in zip(scored_coins, cluster_ids):
                coin["cluster_id"] = int(cluster_id)
                coin["cluster_label"] = self.cluster_labels[cluster_id % len(self.cluster_labels)]
                
                await self.redis_cache.set_scored_coin(coin["id"], coin)
            
            logger.info(f"Computed {self.n_clusters} clusters for {len(scored_coins)} coins")
            return True
        
        except Exception as e:
            logger.error(f"Error computing clusters: {e}", exc_info=True)
            return False
    
    async def get_clusters(self) -> List[Dict[str, Any]]:
        """
        Get cluster summary with coin counts and top coins per cluster.
        """
        try:
            scored_coins = await self.redis_cache.get_scored_coins()
            
            if not scored_coins:
                return []
            
            clusters_map = {}
            for coin in scored_coins:
                cluster_id = coin.get("cluster_id")
                if cluster_id is not None:
                    if cluster_id not in clusters_map:
                        clusters_map[cluster_id] = []
                    clusters_map[cluster_id].append(coin)
            
            clusters = []
            for cluster_id, coins in clusters_map.items():
                coins.sort(key=lambda x: x.get("momentum_score", 0), reverse=True)
                
                avg_momentum = np.mean([c.get("momentum_score", 0) for c in coins])
                
                top_coins = [c.get("symbol") for c in coins[:5]]
                
                clusters.append({
                    "cluster_id": cluster_id,
                    "label": self.cluster_labels[cluster_id % len(self.cluster_labels)],
                    "coin_count": len(coins),
                    "avg_momentum": round(avg_momentum, 2),
                    "top_coins": top_coins
                })
            
            clusters.sort(key=lambda x: x["avg_momentum"], reverse=True)
            
            return clusters
        
        except Exception as e:
            logger.error(f"Error getting clusters: {e}")
            return []

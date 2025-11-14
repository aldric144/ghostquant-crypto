"""
Rank tracker service - tracks momentum rank changes over time.
"""
import os
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from .redis_cache import RedisCache

logger = logging.getLogger(__name__)


class RankTracker:
    """
    Track momentum rank changes over time.
    Records rank snapshots and computes deltas for rank-change feed.
    """
    
    def __init__(self):
        self.redis_cache = RedisCache()
    
    async def record_ranks(self, scored_coins: List[Dict[str, Any]]) -> bool:
        """
        Record current ranks for all coins.
        Called by the background worker after each refresh.
        """
        try:
            sorted_coins = sorted(scored_coins, key=lambda x: x.get("momentum_score", 0), reverse=True)
            
            for rank, coin in enumerate(sorted_coins, start=1):
                coin_id = coin.get("id")
                momentum_score = coin.get("momentum_score", 0)
                
                if coin_id:
                    await self.redis_cache.record_rank(coin_id, rank, momentum_score)
            
            logger.info(f"Recorded ranks for {len(sorted_coins)} coins")
            return True
        
        except Exception as e:
            logger.error(f"Error recording ranks: {e}")
            return False
    
    async def get_rank_history(self, coin_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get rank history for a specific coin.
        """
        try:
            minutes = hours * 60
            history = await self.redis_cache.get_rank_history(coin_id, minutes=minutes)
            return history
        
        except Exception as e:
            logger.error(f"Error getting rank history for {coin_id}: {e}")
            return []
    
    async def get_rank_changes(self, minutes: int = 15, limit: int = 25) -> List[Dict[str, Any]]:
        """
        Get coins with biggest rank changes in the specified time window.
        Returns list sorted by absolute rank change (biggest movers first).
        """
        try:
            scored_coins = await self.redis_cache.get_scored_coins()
            
            if not scored_coins:
                return []
            
            sorted_coins = sorted(scored_coins, key=lambda x: x.get("momentum_score", 0), reverse=True)
            current_ranks = {coin["id"]: (idx + 1, coin) for idx, coin in enumerate(sorted_coins)}
            
            changes = []
            for coin_id, (current_rank, coin) in current_ranks.items():
                history = await self.redis_cache.get_rank_history(coin_id, minutes=minutes)
                
                if history:
                    oldest = history[0]
                    previous_rank = oldest["rank"]
                    
                    rank_delta = current_rank - previous_rank
                    
                    if rank_delta != 0:
                        changes.append({
                            "id": coin_id,
                            "symbol": coin.get("symbol"),
                            "name": coin.get("name"),
                            "current_rank": current_rank,
                            "previous_rank": previous_rank,
                            "rank_delta": rank_delta,
                            "momentum_score": coin.get("momentum_score"),
                            "timestamp": datetime.utcnow().isoformat()
                        })
            
            changes.sort(key=lambda x: abs(x["rank_delta"]), reverse=True)
            
            return changes[:limit]
        
        except Exception as e:
            logger.error(f"Error getting rank changes: {e}")
            return []

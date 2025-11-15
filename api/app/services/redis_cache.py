"""
Redis caching layer for momentum scores and coin data.
"""
import os
import logging
import json
from typing import Optional, List, Dict, Any, Union
import redis.asyncio as redis

logger = logging.getLogger(__name__)


class RedisCache:
    """
    Async Redis cache for momentum scores, coin data, and rank history.
    """
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        self.client: Optional[redis.Redis] = None
        self.default_ttl = int(os.getenv("MOMENTUM_CACHE_TTL", 60))
    
    async def _get_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.client is None:
            self.client = await redis.from_url(self.redis_url, decode_responses=True)
        return self.client
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache, automatically deserializing JSON."""
        try:
            client = await self._get_client()
            value = await client.get(key)
            if value is None:
                return None
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with TTL, automatically serializing to JSON."""
        try:
            client = await self._get_client()
            ttl = ttl or self.default_ttl
            
            if not isinstance(value, str):
                value = json.dumps(value)
            
            await client.setex(key, ttl, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            client = await self._get_client()
            await client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error for key {key}: {e}")
            return False
    
    async def get_scored_coins(self) -> List[Dict[str, Any]]:
        """Get all scored coins from sorted set."""
        try:
            client = await self._get_client()
            coin_ids = await client.zrevrange("ghostquant:momentum:latest", 0, -1)
            
            if not coin_ids:
                return []
            
            coins = []
            for coin_id in coin_ids:
                data = await client.hgetall(f"ghostquant:coin:{coin_id}")
                if data:
                    coin = {}
                    for k, v in data.items():
                        try:
                            coin[k] = json.loads(v)
                        except:
                            coin[k] = v
                    coins.append(coin)
            
            return coins
        
        except Exception as e:
            logger.error(f"Error getting scored coins: {e}")
            return []
    
    async def set_scored_coin(self, coin_id: str, score_data: Dict[str, Any]) -> bool:
        """Store scored coin data."""
        try:
            client = await self._get_client()
            
            momentum_score = score_data.get("momentum_score", 0)
            await client.zadd("ghostquant:momentum:latest", {coin_id: momentum_score})
            
            hash_data = {}
            for k, v in score_data.items():
                if isinstance(v, (dict, list)):
                    hash_data[k] = json.dumps(v)
                else:
                    hash_data[k] = str(v)
            
            await client.hset(f"ghostquant:coin:{coin_id}", mapping=hash_data)
            
            await client.expire(f"ghostquant:coin:{coin_id}", self.default_ttl * 2)
            
            return True
        
        except Exception as e:
            logger.error(f"Error setting scored coin {coin_id}: {e}")
            return False
    
    async def set_scored_coins(self, coins: List[Dict[str, Any]]) -> bool:
        """Store multiple scored coins at once."""
        try:
            client = await self._get_client()
            
            if not coins:
                return True
            
            await client.delete("ghostquant:momentum:latest")
            
            scores = {}
            for coin in coins:
                coin_id = coin.get("id", "")
                if not coin_id:
                    continue
                
                score = coin.get("score", 0)
                scores[coin_id] = score
                
                hash_data = {}
                for k, v in coin.items():
                    if isinstance(v, (dict, list)):
                        hash_data[k] = json.dumps(v)
                    else:
                        hash_data[k] = str(v)
                
                await client.hset(f"ghostquant:coin:{coin_id}", mapping=hash_data)
                await client.expire(f"ghostquant:coin:{coin_id}", self.default_ttl * 2)
            
            if scores:
                await client.zadd("ghostquant:momentum:latest", scores)
            
            logger.info(f"Stored {len(coins)} scored coins in Redis")
            return True
        
        except Exception as e:
            logger.error(f"Error setting scored coins: {e}")
            return False
    
    async def record_rank(self, coin_id: str, rank: int, momentum_score: float) -> bool:
        """Record rank for rank-change tracking."""
        try:
            client = await self._get_client()
            timestamp = int(datetime.utcnow().timestamp())
            
            key = f"ghostquant:rank_history:{coin_id}"
            await client.zadd(key, {f"{timestamp}:{rank}:{momentum_score}": timestamp})
            
            cutoff = timestamp - (24 * 3600)
            await client.zremrangebyscore(key, 0, cutoff)
            
            await client.expire(key, 86400 * 2)
            
            return True
        
        except Exception as e:
            logger.error(f"Error recording rank for {coin_id}: {e}")
            return False
    
    async def get_rank_history(self, coin_id: str, minutes: int = 60) -> List[Dict[str, Any]]:
        """Get rank history for a coin."""
        try:
            client = await self._get_client()
            timestamp = int(datetime.utcnow().timestamp())
            cutoff = timestamp - (minutes * 60)
            
            key = f"ghostquant:rank_history:{coin_id}"
            entries = await client.zrangebyscore(key, cutoff, timestamp, withscores=True)
            
            history = []
            for entry, ts in entries:
                parts = entry.split(":")
                if len(parts) == 3:
                    history.append({
                        "timestamp": int(ts),
                        "rank": int(parts[1]),
                        "momentum_score": float(parts[2])
                    })
            
            return history
        
        except Exception as e:
            logger.error(f"Error getting rank history for {coin_id}: {e}")
            return []
    
    async def increment_metric(self, metric_name: str, value: int = 1) -> bool:
        """Increment a metric counter (for monitoring)."""
        try:
            client = await self._get_client()
            await client.incrby(f"ghostquant:metrics:{metric_name}", value)
            return True
        except Exception as e:
            logger.error(f"Error incrementing metric {metric_name}: {e}")
            return False
    
    async def get_metric(self, metric_name: str) -> int:
        """Get a metric counter value."""
        try:
            client = await self._get_client()
            value = await client.get(f"ghostquant:metrics:{metric_name}")
            return int(value) if value else 0
        except Exception as e:
            logger.error(f"Error getting metric {metric_name}: {e}")
            return 0
    
    async def close(self):
        """Close Redis connection."""
        if self.client:
            await self.client.close()


from datetime import datetime

"""
Upstash Redis REST API cache layer for momentum scores and coin data.
Replaces TCP-based redis client with REST API calls.
"""
import os
import logging
import json
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class UpstashCache:
    """
    Async Upstash Redis REST API cache for momentum scores, coin data, and rank history.
    Uses REDIS_REST_URL and REDIS_REST_TOKEN environment variables.
    """
    
    def __init__(self):
        self.rest_url = os.getenv("REDIS_REST_URL")
        self.rest_token = os.getenv("REDIS_REST_TOKEN")
        self.enabled = bool(self.rest_url and self.rest_token)
        self.default_ttl = int(os.getenv("MOMENTUM_CACHE_TTL", 60))
        
        if not self.enabled:
            logger.warning("REDIS_REST_URL and REDIS_REST_TOKEN not set - UpstashCache disabled")
        
        self.headers = {
            "Authorization": f"Bearer {self.rest_token}",
            "Content-Type": "application/json"
        } if self.enabled else {}
    
    async def _execute(self, *args) -> Optional[Any]:
        """Execute a Redis command via REST API."""
        if not self.enabled:
            return None
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Upstash REST API accepts commands as path segments or POST body
                response = await client.post(
                    self.rest_url,
                    headers=self.headers,
                    json=list(args)
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("result")
                else:
                    logger.error(f"Upstash error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Upstash request error: {e}")
            return None
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache, automatically deserializing JSON."""
        try:
            value = await self._execute("GET", key)
            if value is None:
                return None
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception as e:
            logger.error(f"Upstash GET error for key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with TTL, automatically serializing to JSON."""
        try:
            ttl = ttl or self.default_ttl
            
            if not isinstance(value, str):
                value = json.dumps(value)
            
            result = await self._execute("SETEX", key, ttl, value)
            return result == "OK"
        except Exception as e:
            logger.error(f"Upstash SET error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            await self._execute("DEL", key)
            return True
        except Exception as e:
            logger.error(f"Upstash DELETE error for key {key}: {e}")
            return False
    
    async def zadd(self, key: str, mapping: Dict[str, float]) -> bool:
        """Add members to a sorted set."""
        try:
            args = ["ZADD", key]
            for member, score in mapping.items():
                args.extend([score, member])
            await self._execute(*args)
            return True
        except Exception as e:
            logger.error(f"Upstash ZADD error for key {key}: {e}")
            return False
    
    async def zrevrange(self, key: str, start: int, stop: int) -> List[str]:
        """Get members from sorted set in reverse order."""
        try:
            result = await self._execute("ZREVRANGE", key, start, stop)
            return result if result else []
        except Exception as e:
            logger.error(f"Upstash ZREVRANGE error for key {key}: {e}")
            return []
    
    async def zrangebyscore(self, key: str, min_score: float, max_score: float) -> List[str]:
        """Get members from sorted set by score range."""
        try:
            result = await self._execute("ZRANGEBYSCORE", key, min_score, max_score, "WITHSCORES")
            if not result:
                return []
            # Parse result into list of (member, score) tuples
            pairs = []
            for i in range(0, len(result), 2):
                pairs.append((result[i], float(result[i+1])))
            return pairs
        except Exception as e:
            logger.error(f"Upstash ZRANGEBYSCORE error for key {key}: {e}")
            return []
    
    async def zremrangebyscore(self, key: str, min_score: float, max_score: float) -> bool:
        """Remove members from sorted set by score range."""
        try:
            await self._execute("ZREMRANGEBYSCORE", key, min_score, max_score)
            return True
        except Exception as e:
            logger.error(f"Upstash ZREMRANGEBYSCORE error for key {key}: {e}")
            return False
    
    async def hset(self, key: str, mapping: Dict[str, str]) -> bool:
        """Set hash fields."""
        try:
            args = ["HSET", key]
            for field, value in mapping.items():
                args.extend([field, value])
            await self._execute(*args)
            return True
        except Exception as e:
            logger.error(f"Upstash HSET error for key {key}: {e}")
            return False
    
    async def hgetall(self, key: str) -> Dict[str, str]:
        """Get all hash fields."""
        try:
            result = await self._execute("HGETALL", key)
            if not result:
                return {}
            # Parse result into dict (alternating key/value)
            data = {}
            for i in range(0, len(result), 2):
                data[result[i]] = result[i+1]
            return data
        except Exception as e:
            logger.error(f"Upstash HGETALL error for key {key}: {e}")
            return {}
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set key expiration."""
        try:
            await self._execute("EXPIRE", key, seconds)
            return True
        except Exception as e:
            logger.error(f"Upstash EXPIRE error for key {key}: {e}")
            return False
    
    async def incrby(self, key: str, amount: int = 1) -> int:
        """Increment a key by amount."""
        try:
            result = await self._execute("INCRBY", key, amount)
            return int(result) if result else 0
        except Exception as e:
            logger.error(f"Upstash INCRBY error for key {key}: {e}")
            return 0
    
    async def lpush(self, key: str, *values) -> bool:
        """Push values to the left of a list."""
        try:
            await self._execute("LPUSH", key, *values)
            return True
        except Exception as e:
            logger.error(f"Upstash LPUSH error for key {key}: {e}")
            return False
    
    async def lrange(self, key: str, start: int, stop: int) -> List[str]:
        """Get range of list elements."""
        try:
            result = await self._execute("LRANGE", key, start, stop)
            return result if result else []
        except Exception as e:
            logger.error(f"Upstash LRANGE error for key {key}: {e}")
            return []
    
    async def ltrim(self, key: str, start: int, stop: int) -> bool:
        """Trim list to specified range."""
        try:
            await self._execute("LTRIM", key, start, stop)
            return True
        except Exception as e:
            logger.error(f"Upstash LTRIM error for key {key}: {e}")
            return False
    
    async def publish(self, channel: str, message: str) -> bool:
        """Publish message to channel (for pub/sub simulation via lists)."""
        try:
            # Use list-based pub/sub simulation since REST API doesn't support native pub/sub
            await self.lpush(channel, message)
            # Keep only last 100 messages
            await self.ltrim(channel, 0, 99)
            return True
        except Exception as e:
            logger.error(f"Upstash PUBLISH error for channel {channel}: {e}")
            return False
    
    async def get_scored_coins(self) -> List[Dict[str, Any]]:
        """Get all scored coins from sorted set."""
        try:
            coin_ids = await self.zrevrange("ghostquant:momentum:latest", 0, -1)
            
            if not coin_ids:
                return []
            
            coins = []
            for coin_id in coin_ids:
                data = await self.hgetall(f"ghostquant:coin:{coin_id}")
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
            momentum_score = score_data.get("momentum_score", 0)
            await self.zadd("ghostquant:momentum:latest", {coin_id: momentum_score})
            
            hash_data = {}
            for k, v in score_data.items():
                if isinstance(v, (dict, list)):
                    hash_data[k] = json.dumps(v)
                else:
                    hash_data[k] = str(v)
            
            await self.hset(f"ghostquant:coin:{coin_id}", hash_data)
            await self.expire(f"ghostquant:coin:{coin_id}", self.default_ttl * 2)
            
            return True
        
        except Exception as e:
            logger.error(f"Error setting scored coin {coin_id}: {e}")
            return False
    
    async def set_scored_coins(self, coins: List[Dict[str, Any]]) -> bool:
        """Store multiple scored coins at once."""
        try:
            if not coins:
                return True
            
            await self.delete("ghostquant:momentum:latest")
            
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
                
                await self.hset(f"ghostquant:coin:{coin_id}", hash_data)
                await self.expire(f"ghostquant:coin:{coin_id}", self.default_ttl * 2)
            
            if scores:
                await self.zadd("ghostquant:momentum:latest", scores)
            
            logger.info(f"Stored {len(coins)} scored coins in Upstash")
            return True
        
        except Exception as e:
            logger.error(f"Error setting scored coins: {e}")
            return False
    
    async def record_rank(self, coin_id: str, rank: int, momentum_score: float) -> bool:
        """Record rank for rank-change tracking."""
        try:
            timestamp = int(datetime.utcnow().timestamp())
            
            key = f"ghostquant:rank_history:{coin_id}"
            await self.zadd(key, {f"{timestamp}:{rank}:{momentum_score}": timestamp})
            
            cutoff = timestamp - (24 * 3600)
            await self.zremrangebyscore(key, 0, cutoff)
            
            await self.expire(key, 86400 * 2)
            
            return True
        
        except Exception as e:
            logger.error(f"Error recording rank for {coin_id}: {e}")
            return False
    
    async def get_rank_history(self, coin_id: str, minutes: int = 60) -> List[Dict[str, Any]]:
        """Get rank history for a coin."""
        try:
            timestamp = int(datetime.utcnow().timestamp())
            cutoff = timestamp - (minutes * 60)
            
            key = f"ghostquant:rank_history:{coin_id}"
            entries = await self.zrangebyscore(key, cutoff, timestamp)
            
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
            await self.incrby(f"ghostquant:metrics:{metric_name}", value)
            return True
        except Exception as e:
            logger.error(f"Error incrementing metric {metric_name}: {e}")
            return False
    
    async def get_metric(self, metric_name: str) -> int:
        """Get a metric counter value."""
        try:
            value = await self.get(f"ghostquant:metrics:{metric_name}")
            return int(value) if value else 0
        except Exception as e:
            logger.error(f"Error getting metric {metric_name}: {e}")
            return 0
    
    async def close(self):
        """Close connection (no-op for REST API)."""
        pass


# Global instance
_upstash_cache: Optional[UpstashCache] = None


def get_upstash_cache() -> UpstashCache:
    """Get or create global UpstashCache instance."""
    global _upstash_cache
    if _upstash_cache is None:
        _upstash_cache = UpstashCache()
    return _upstash_cache

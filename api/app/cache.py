"""
Redis caching utilities for expensive endpoints.
Transparent caching with configurable TTL.

Uses Upstash Redis REST API for serverless-compatible caching.
"""
import json
import os
import httpx
from typing import Optional, Any, Callable
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class UpstashSyncCache:
    """
    Synchronous Upstash Redis REST API cache wrapper.
    Used for the cache_response decorator which needs sync operations.
    """
    
    def __init__(self):
        self.rest_url = os.getenv("REDIS_REST_URL")
        self.rest_token = os.getenv("REDIS_REST_TOKEN")
        self.enabled = bool(self.rest_url and self.rest_token)
        
        if not self.enabled:
            logger.warning("REDIS_REST_URL and REDIS_REST_TOKEN not set - cache disabled")
        
        self.headers = {
            "Authorization": f"Bearer {self.rest_token}",
            "Content-Type": "application/json"
        } if self.enabled else {}
    
    def _execute(self, *args) -> Optional[Any]:
        """Execute a Redis command via REST API (sync)."""
        if not self.enabled:
            return None
        
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.post(
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
    
    def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        return self._execute("GET", key)
    
    def setex(self, key: str, ttl: int, value: str) -> bool:
        """Set value with expiration."""
        result = self._execute("SETEX", key, ttl, value)
        return result == "OK"
    
    def keys(self, pattern: str) -> list:
        """Get keys matching pattern."""
        result = self._execute("KEYS", pattern)
        return result if result else []
    
    def delete(self, *keys) -> bool:
        """Delete keys."""
        if not keys:
            return True
        self._execute("DEL", *keys)
        return True


# Cache client - initialized lazily
redis_client: Optional[UpstashSyncCache] = None

def _is_serverless_mode():
    """Check if running in serverless mode (no Redis required)."""
    return os.getenv("SERVERLESS_MODE", "false").lower() == "true"

def init_redis():
    """Initialize Upstash Redis REST connection. No-op in serverless mode."""
    global redis_client
    
    if _is_serverless_mode():
        logger.info("Running in serverless mode - Redis cache disabled")
        return
    
    rest_url = os.getenv("REDIS_REST_URL")
    rest_token = os.getenv("REDIS_REST_TOKEN")
    
    if not rest_url or not rest_token:
        logger.warning("REDIS_REST_URL and REDIS_REST_TOKEN not set. Caching disabled.")
        redis_client = None
        return
    
    try:
        redis_client = UpstashSyncCache()
        # Test connection
        redis_client._execute("PING")
        logger.info("Upstash Redis cache initialized successfully")
    except Exception as e:
        logger.warning(f"Upstash Redis cache initialization failed: {e}. Caching disabled.")
        redis_client = None

def get_redis() -> Optional[UpstashSyncCache]:
    """Get Redis client instance."""
    return redis_client

def cache_response(key_prefix: str, ttl: int = 30):
    """
    Decorator to cache endpoint responses in Redis.
    
    Args:
        key_prefix: Prefix for cache key (e.g., 'screener', 'alphabrain')
        ttl: Time to live in seconds (default: 30s)
    
    Usage:
        @cache_response('screener', ttl=60)
        async def get_screener_data():
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if redis_client is None:
                return await func(*args, **kwargs)
            
            try:
                cache_key = f"{key_prefix}:{json.dumps(kwargs, sort_keys=True)}"
                
                cached = redis_client.get(cache_key)
                if cached:
                    logger.debug(f"Cache hit: {cache_key}")
                    return json.loads(cached)
                
                result = await func(*args, **kwargs)
                
                redis_client.setex(
                    cache_key,
                    ttl,
                    json.dumps(result, default=str)
                )
                logger.debug(f"Cache set: {cache_key} (TTL: {ttl}s)")
                
                return result
                
            except Exception as e:
                logger.warning(f"Cache error: {e}. Falling back to direct call.")
                return await func(*args, **kwargs)
        
        return wrapper
    return decorator

def invalidate_cache(key_pattern: str):
    """
    Invalidate cache entries matching pattern.
    
    Args:
        key_pattern: Pattern to match (e.g., 'screener:*')
    """
    if redis_client is None:
        return
    
    try:
        keys = redis_client.keys(key_pattern)
        if keys:
            redis_client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} cache entries matching {key_pattern}")
    except Exception as e:
        logger.warning(f"Cache invalidation error: {e}")

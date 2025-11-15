"""
Redis caching utilities for expensive endpoints.
Transparent caching with configurable TTL.
"""
import json
import redis
import os
from typing import Optional, Any, Callable
from functools import wraps
import logging

logger = logging.getLogger(__name__)

redis_client: Optional[redis.Redis] = None

def init_redis():
    """Initialize Redis connection."""
    global redis_client
    try:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        redis_client = redis.from_url(redis_url, decode_responses=True)
        redis_client.ping()
        logger.info("Redis cache initialized successfully")
    except Exception as e:
        logger.warning(f"Redis cache initialization failed: {e}. Caching disabled.")
        redis_client = None

def get_redis() -> Optional[redis.Redis]:
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

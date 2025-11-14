"""
Redis caching helper for Phase 2 features.
"""
import json
import logging
from typing import Any, Optional
import redis
import os

logger = logging.getLogger(__name__)


class CacheHelper:
    """Redis caching helper with TTL support."""
    
    _client: Optional[redis.Redis] = None
    
    @classmethod
    def _get_client(cls) -> redis.Redis:
        """Get or create Redis client."""
        if cls._client is None:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            cls._client = redis.from_url(redis_url, decode_responses=True)
        return cls._client
    
    @classmethod
    def get_json(cls, key: str) -> Optional[Any]:
        """
        Get JSON value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Deserialized JSON value or None if not found
        """
        try:
            client = cls._get_client()
            value = client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
            return None
    
    @classmethod
    def set_json(cls, key: str, value: Any, ttl: int = 60) -> bool:
        """
        Set JSON value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 60)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            client = cls._get_client()
            serialized = json.dumps(value)
            client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return False
    
    @classmethod
    def delete(cls, key: str) -> bool:
        """
        Delete key from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            client = cls._get_client()
            client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False
    
    @classmethod
    def clear_pattern(cls, pattern: str) -> int:
        """
        Clear all keys matching a pattern.
        
        Args:
            pattern: Key pattern (e.g., "whales:*")
            
        Returns:
            Number of keys deleted
        """
        try:
            client = cls._get_client()
            keys = client.keys(pattern)
            if keys:
                return client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache clear pattern error for {pattern}: {e}")
            return 0


def get_cached(key: str) -> Optional[Any]:
    """Get value from cache."""
    return CacheHelper.get_json(key)


def set_cached(key: str, value: Any, ttl: int = 60) -> bool:
    """Set value in cache with TTL."""
    return CacheHelper.set_json(key, value, ttl)


def clear_cache(pattern: str) -> int:
    """Clear cache keys matching pattern."""
    return CacheHelper.clear_pattern(pattern)

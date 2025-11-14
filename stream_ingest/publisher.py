"""
Redis Streams publisher with MAXLEN trimming and error handling.
"""
import logging
import redis.asyncio as redis
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class RedisStreamPublisher:
    """
    Publishes normalized trade messages to Redis Streams.
    Stream key format: trades:<pair>
    """
    
    def __init__(self, redis_url: str, maxlen: int = 10000):
        self.redis_url = redis_url
        self.maxlen = maxlen
        self.client = None
        self.publish_count = 0
        self.error_count = 0
    
    async def connect(self):
        """Connect to Redis."""
        try:
            self.client = await redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            await self.client.ping()
            logger.info(f"Connected to Redis at {self.redis_url}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis."""
        if self.client:
            await self.client.close()
            logger.info("Disconnected from Redis")
    
    async def publish(self, pair: str, message: Dict[str, Any]) -> bool:
        """
        Publish a message to Redis Stream.
        
        Args:
            pair: Trading pair (e.g., "BTCUSDT")
            message: Message dict with fields (all values converted to strings)
        
        Returns:
            True if published successfully, False otherwise
        """
        if not self.client:
            logger.error("Redis client not connected")
            return False
        
        stream_key = f"trades:{pair}"
        
        try:
            string_message = {
                k: str(v) if v is not None else ""
                for k, v in message.items()
            }
            
            if "ts" not in string_message:
                string_message["ts"] = datetime.utcnow().isoformat()
            
            await self.client.xadd(
                stream_key,
                string_message,
                maxlen=self.maxlen,
                approximate=True
            )
            
            self.publish_count += 1
            
            if self.publish_count % 1000 == 0:
                logger.info(f"Published {self.publish_count} messages (errors: {self.error_count})")
            
            return True
        
        except Exception as e:
            self.error_count += 1
            logger.error(f"Failed to publish to {stream_key}: {e}")
            return False
    
    async def is_healthy(self) -> bool:
        """Check if Redis connection is healthy."""
        try:
            if not self.client:
                return False
            await self.client.ping()
            return True
        except Exception:
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get publisher statistics."""
        return {
            "publish_count": self.publish_count,
            "error_count": self.error_count,
            "error_rate": self.error_count / max(self.publish_count, 1)
        }

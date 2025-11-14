"""
Binance WebSocket client for trade streams with Redis Streams publishing.
Uses combined streams for efficiency (50-100 pairs per connection).
"""
import asyncio
import json
import logging
import random
import websockets
from typing import List, Set
from datetime import datetime
from publisher import RedisStreamPublisher

logger = logging.getLogger(__name__)


class BinanceIngestClient:
    """
    Connects to Binance public WebSocket and publishes trades to Redis Streams.
    Supports combined streams with automatic reconnection and exponential backoff.
    """
    
    def __init__(
        self,
        publisher: RedisStreamPublisher,
        ws_url: str = "wss://stream.binance.com:9443",
        pairs_per_connection: int = 50
    ):
        self.publisher = publisher
        self.ws_url = ws_url
        self.pairs_per_connection = pairs_per_connection
        self.active_connections = 0
        self.total_messages = 0
        self.error_messages = 0
        self.connection_errors = 0
    
    async def start(self, pairs: List[str]):
        """
        Start ingesting trades for given pairs.
        Splits pairs into chunks and creates multiple connections.
        """
        if not pairs:
            logger.warning("No pairs to subscribe to")
            return
        
        chunks = [
            pairs[i:i + self.pairs_per_connection]
            for i in range(0, len(pairs), self.pairs_per_connection)
        ]
        
        logger.info(f"Starting {len(chunks)} WebSocket connections for {len(pairs)} pairs")
        
        tasks = [
            self._connect_and_stream(chunk, idx)
            for idx, chunk in enumerate(chunks)
        ]
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _connect_and_stream(self, pairs: List[str], connection_id: int):
        """
        Connect to Binance WebSocket and stream trades for given pairs.
        Implements exponential backoff with jitter on reconnection.
        """
        retry_count = 0
        max_retries = 10
        base_delay = 1
        max_delay = 60
        
        while retry_count < max_retries:
            try:
                streams = [f"{pair.lower()}@trade" for pair in pairs]
                url = f"{self.ws_url}/stream?streams={'/'.join(streams)}"
                
                logger.info(f"Connection {connection_id}: Connecting to Binance with {len(pairs)} pairs")
                
                async with websockets.connect(url) as ws:
                    self.active_connections += 1
                    retry_count = 0  # Reset on successful connection
                    
                    logger.info(f"Connection {connection_id}: Connected successfully")
                    
                    async for message in ws:
                        try:
                            await self._handle_message(message)
                        except Exception as e:
                            self.error_messages += 1
                            logger.error(f"Connection {connection_id}: Error handling message: {e}")
            
            except websockets.exceptions.WebSocketException as e:
                self.connection_errors += 1
                self.active_connections = max(0, self.active_connections - 1)
                
                delay = min(base_delay * (2 ** retry_count), max_delay)
                jitter = random.uniform(0, delay * 0.1)
                total_delay = delay + jitter
                
                retry_count += 1
                logger.error(
                    f"Connection {connection_id}: WebSocket error (attempt {retry_count}/{max_retries}): {e}. "
                    f"Reconnecting in {total_delay:.1f}s..."
                )
                
                await asyncio.sleep(total_delay)
            
            except Exception as e:
                self.connection_errors += 1
                self.active_connections = max(0, self.active_connections - 1)
                logger.error(f"Connection {connection_id}: Unexpected error: {e}")
                await asyncio.sleep(5)
        
        logger.error(f"Connection {connection_id}: Max retries reached, giving up")
    
    async def _handle_message(self, message: str):
        """
        Handle incoming WebSocket message and publish to Redis Streams.
        """
        try:
            data = json.loads(message)
            
            if "stream" in data and "data" in data:
                stream_name = data["stream"]
                trade_data = data["data"]
            else:
                trade_data = data
            
            if trade_data.get("e") == "trade":
                pair = trade_data["s"]
                
                normalized = {
                    "exchange": "binance",
                    "pair": pair,
                    "price": str(trade_data["p"]),
                    "qty": str(trade_data["q"]),
                    "ts": datetime.fromtimestamp(trade_data["T"] / 1000).isoformat(),
                    "side": "buy" if not trade_data.get("m", False) else "sell",
                    "trade_id": str(trade_data.get("t", "")),
                    "raw_json": json.dumps(trade_data)[:500]  # Truncate to avoid huge messages
                }
                
                success = await self.publisher.publish(pair, normalized)
                
                if success:
                    self.total_messages += 1
                    
                    if self.total_messages % 1000 == 0:
                        logger.info(
                            f"Processed {self.total_messages} trades "
                            f"(errors: {self.error_messages}, conn_errors: {self.connection_errors})"
                        )
        
        except json.JSONDecodeError as e:
            self.error_messages += 1
            logger.error(f"Failed to parse JSON: {e}")
        except Exception as e:
            self.error_messages += 1
            logger.error(f"Failed to handle message: {e}")
    
    def get_stats(self):
        """Get client statistics."""
        return {
            "active_connections": self.active_connections,
            "total_messages": self.total_messages,
            "error_messages": self.error_messages,
            "connection_errors": self.connection_errors
        }

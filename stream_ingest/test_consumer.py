"""
Test consumer for Redis Streams.
Reads from trades:<pair> and prints incoming messages.
"""
import asyncio
import redis.asyncio as redis
import sys
import os
from datetime import datetime

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


async def consume_stream(pair: str, count: int = 10):
    """
    Consume messages from a Redis Stream.
    
    Args:
        pair: Trading pair (e.g., "BTCUSDT")
        count: Number of messages to read (0 for infinite)
    """
    stream_key = f"trades:{pair}"
    
    print(f"Connecting to Redis at {REDIS_URL}...")
    client = await redis.from_url(REDIS_URL, decode_responses=True)
    
    try:
        await client.ping()
        print(f"Connected to Redis successfully")
        print(f"Reading from stream: {stream_key}")
        print(f"Waiting for messages... (Ctrl+C to stop)\n")
        
        last_id = "$"
        messages_read = 0
        
        while True:
            result = await client.xread(
                {stream_key: last_id},
                count=10,
                block=5000
            )
            
            if result:
                for stream, messages in result:
                    for message_id, fields in messages:
                        messages_read += 1
                        
                        print(f"[{messages_read}] Message ID: {message_id}")
                        print(f"  Timestamp: {datetime.now().isoformat()}")
                        
                        for key, value in fields.items():
                            if key != "raw_json":  # Skip raw JSON for readability
                                print(f"  {key}: {value}")
                        
                        print()
                        
                        last_id = message_id
                        
                        if count > 0 and messages_read >= count:
                            print(f"Read {messages_read} messages, exiting.")
                            return
    
    except KeyboardInterrupt:
        print(f"\nStopped. Read {messages_read} messages total.")
    
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        await client.close()


async def list_streams():
    """List all trade streams in Redis."""
    print(f"Connecting to Redis at {REDIS_URL}...")
    client = await redis.from_url(REDIS_URL, decode_responses=True)
    
    try:
        await client.ping()
        print("Connected to Redis successfully\n")
        
        cursor = 0
        streams = []
        
        while True:
            cursor, keys = await client.scan(cursor, match="trades:*", count=100)
            streams.extend(keys)
            
            if cursor == 0:
                break
        
        if not streams:
            print("No trade streams found.")
            return
        
        print(f"Found {len(streams)} trade streams:\n")
        
        for stream in sorted(streams):
            length = await client.xlen(stream)
            pair = stream.replace("trades:", "")
            print(f"  {pair}: {length} messages")
    
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        await client.close()


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python test_consumer.py <pair> [count]  - Read messages from trades:<pair>")
        print("  python test_consumer.py list            - List all trade streams")
        print()
        print("Examples:")
        print("  python test_consumer.py BTCUSDT         - Read 10 messages from BTCUSDT")
        print("  python test_consumer.py BTCUSDT 0       - Read continuously from BTCUSDT")
        print("  python test_consumer.py list            - List all streams")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "list":
        asyncio.run(list_streams())
    else:
        pair = command
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        asyncio.run(consume_stream(pair, count))


if __name__ == "__main__":
    main()

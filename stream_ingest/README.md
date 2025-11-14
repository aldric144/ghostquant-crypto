# GhostQuant Stream Ingest

Lightweight WebSocket ingestion microservice that subscribes to Binance public trade streams and publishes normalized messages to Redis Streams.

## Features

- **Binance WebSocket Integration**: Connects to public trade streams
- **Pair Discovery**: Automatically discovers top N coins from CoinGecko and maps to Binance USDT pairs
- **Redis Streams**: Publishes to `trades:<pair>` streams with MAXLEN trimming
- **Combined Streams**: Efficient connection pooling (50-100 pairs per connection)
- **Reconnection**: Exponential backoff with jitter
- **Health Endpoint**: HTTP `/health` endpoint for Docker healthchecks
- **Metrics**: `/stats` endpoint with counters and statistics

## Architecture

```
┌─────────────────┐
│   CoinGecko     │  (Pair Discovery)
│   REST API      │
└────────┬────────┘
         │
         v
┌─────────────────┐     ┌──────────────────┐
│  Binance WS     │────>│  Normalization   │
│  (Combined)     │     │  & Publishing    │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 v
                        ┌────────────────┐
                        │ Redis Streams  │
                        │ trades:<pair>  │
                        └────────────────┘
```

## Environment Variables

```bash
# Redis
REDIS_URL=redis://redis:6379/0

# CoinGecko (optional - uses free tier if not provided)
COINGECKO_API_KEY=

# Pair Discovery
PAIRS_LIMIT=200                          # Max number of pairs to monitor
FALLBACK_PAIRS=BTCUSDT,ETHUSDT,SOLUSDT  # Always included pairs

# Binance WebSocket
BINANCE_WS_URL=wss://stream.binance.com:9443
PAIRS_PER_CONNECTION=50                  # Pairs per WebSocket connection

# Redis Streams
STREAM_MAXLEN=10000                      # Max messages per stream (MAXLEN ~)
DISCOVERY_REFRESH_SEC=3600               # Pair list refresh interval

# Health Server
HEALTH_PORT=8099
```

## Quick Start

### Using Docker Compose

```bash
# Start the service
docker compose up -d ingest_ws

# Check logs
docker compose logs -f ingest_ws

# Check health
curl http://localhost:8099/health

# View stats
curl http://localhost:8099/stats

# List monitored pairs
curl http://localhost:8099/pairs
```

### Standalone (Development)

```bash
cd stream_ingest

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export REDIS_URL=redis://localhost:6379/0

# Run the service
python app.py
```

## Testing

### Test Consumer

Read messages from a specific pair:

```bash
# Read 10 messages from BTCUSDT
python test_consumer.py BTCUSDT

# Read continuously (Ctrl+C to stop)
python test_consumer.py BTCUSDT 0

# List all trade streams
python test_consumer.py list
```

### Manual Testing with Redis CLI

```bash
# Connect to Redis
redis-cli

# List all trade streams
KEYS trades:*

# Get stream length
XLEN trades:BTCUSDT

# Read latest 10 messages
XREVRANGE trades:BTCUSDT + - COUNT 10

# Read new messages (blocking)
XREAD BLOCK 5000 STREAMS trades:BTCUSDT $
```

## Message Format

Each message in `trades:<pair>` contains:

```json
{
  "exchange": "binance",
  "pair": "BTCUSDT",
  "price": "45123.50",
  "qty": "0.123",
  "ts": "2024-11-14T17:30:00.123456",
  "side": "buy",
  "trade_id": "12345678",
  "raw_json": "{...}"
}
```

All values are strings (Redis Streams requirement).

## Integration with Backend Services

### Consuming with Consumer Groups

```python
import redis.asyncio as redis

# Create consumer group (one-time setup)
client = await redis.from_url("redis://redis:6379/0", decode_responses=True)
await client.xgroup_create("trades:BTCUSDT", "signals", id="0", mkstream=True)

# Read messages
while True:
    messages = await client.xreadgroup(
        groupname="signals",
        consumername="signals-1",
        streams={"trades:BTCUSDT": ">"},
        count=10,
        block=5000
    )
    
    for stream, msgs in messages:
        for msg_id, fields in msgs:
            # Process message
            print(f"Price: {fields['price']}, Qty: {fields['qty']}")
            
            # Acknowledge message
            await client.xack("trades:BTCUSDT", "signals", msg_id)
```

### Simple Consumer (No Groups)

```python
import redis.asyncio as redis

client = await redis.from_url("redis://redis:6379/0", decode_responses=True)
last_id = "$"  # Start from latest

while True:
    result = await client.xread(
        {"trades:BTCUSDT": last_id},
        count=10,
        block=5000
    )
    
    if result:
        for stream, messages in result:
            for message_id, fields in messages:
                # Process message
                print(f"Price: {fields['price']}")
                last_id = message_id
```

## Monitoring

### Health Check

```bash
curl http://localhost:8099/health
```

Returns:
- `200 OK` if Redis connected and WebSocket connections active
- `503 Service Unavailable` if unhealthy

### Statistics

```bash
curl http://localhost:8099/stats
```

Returns:
```json
{
  "publisher": {
    "publish_count": 12345,
    "error_count": 5,
    "error_rate": 0.0004
  },
  "ingest": {
    "active_connections": 4,
    "total_messages": 12345,
    "error_messages": 5,
    "connection_errors": 2
  },
  "pairs_count": 200,
  "pairs_sample": ["BTCUSDT", "ETHUSDT", ...]
}
```

## Troubleshooting

### No messages appearing in streams

1. Check service is running: `docker compose ps ingest_ws`
2. Check logs: `docker compose logs ingest_ws`
3. Verify Redis connection: `docker compose exec redis redis-cli ping`
4. Check health: `curl http://localhost:8099/health`
5. List streams: `python test_consumer.py list`

### WebSocket connection failures

- Check internet connectivity
- Verify Binance API is accessible
- Check logs for rate limiting or IP blocks
- Reduce `PAIRS_PER_CONNECTION` if hitting limits

### High memory usage

- Reduce `STREAM_MAXLEN` (default 10000)
- Reduce `PAIRS_LIMIT` (default 200)
- Reduce `PAIRS_PER_CONNECTION` (default 50)

### CoinGecko rate limits

- Add `COINGECKO_API_KEY` for higher limits
- Increase `DISCOVERY_REFRESH_SEC` (default 3600)
- Service will use fallback pairs if discovery fails

## Production Recommendations

1. **Rate Limiting**: Monitor Binance and CoinGecko rate limits
2. **Stream Retention**: Adjust `STREAM_MAXLEN` based on consumption rate
3. **Connection Pooling**: Tune `PAIRS_PER_CONNECTION` for optimal throughput
4. **Consumer Groups**: Use Redis consumer groups for reliable processing
5. **Monitoring**: Set up alerts for health endpoint failures
6. **Scaling**: Run multiple instances with different pair subsets if needed

## API Endpoints

- `GET /health` - Health check (returns 200 if healthy)
- `GET /stats` - Service statistics and metrics
- `GET /pairs` - List of currently monitored pairs

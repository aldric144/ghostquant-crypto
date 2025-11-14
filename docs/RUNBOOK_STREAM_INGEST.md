# Stream Ingest Service Runbook

## Overview

The Stream Ingest service is a lightweight WebSocket ingestion microservice that subscribes to Binance public trade streams and publishes normalized messages to Redis Streams for consumption by other services.

## Service Details

- **Service Name**: `ingest_ws`
- **Container**: `ghostquant-ingest-ws`
- **Port**: 8099 (health endpoint)
- **Dependencies**: Redis
- **Data Flow**: Binance WebSocket → Normalization → Redis Streams (`trades:<pair>`)

## Starting the Service

### Using Docker Compose

```bash
# Start just the stream ingest service
docker compose up -d ingest_ws

# Start with dependencies
docker compose up -d redis ingest_ws

# View logs
docker compose logs -f ingest_ws
```

### Standalone (Development)

```bash
cd stream_ingest
pip install -r requirements.txt
export REDIS_URL=redis://localhost:6379/0
python app.py
```

## Monitoring

### Health Check

```bash
# Check if service is healthy
curl http://localhost:8099/health

# Expected response (healthy):
{
  "status": "healthy",
  "redis": "connected",
  "websocket_connections": 4
}

# Expected response (unhealthy):
{
  "status": "unhealthy",
  "reason": "no active websocket connections",
  "stats": {...}
}
```

### Statistics

```bash
# Get detailed statistics
curl http://localhost:8099/stats

# Response includes:
# - publish_count: Total messages published
# - error_count: Failed publishes
# - active_connections: Active WebSocket connections
# - total_messages: Total messages received
# - pairs_count: Number of monitored pairs
```

### List Monitored Pairs

```bash
# Get current list of pairs
curl http://localhost:8099/pairs

# Response:
{
  "count": 200,
  "pairs": ["BTCUSDT", "ETHUSDT", "SOLUSDT", ...]
}
```

### View Logs

```bash
# Docker logs
docker compose logs -f ingest_ws

# Look for:
# - "Connected to Redis at redis://..."
# - "Discovered X tradable pairs"
# - "Connection X: Connected successfully"
# - "Processed X trades"
```

## Data Verification

### Using Test Consumer

```bash
# Read 10 messages from BTCUSDT
docker compose exec ingest_ws python test_consumer.py BTCUSDT

# Read continuously
docker compose exec ingest_ws python test_consumer.py BTCUSDT 0

# List all streams
docker compose exec ingest_ws python test_consumer.py list
```

### Using Redis CLI

```bash
# Connect to Redis
docker compose exec redis redis-cli

# List all trade streams
KEYS trades:*

# Get stream info
XINFO STREAM trades:BTCUSDT

# Get stream length
XLEN trades:BTCUSDT

# Read latest 10 messages
XREVRANGE trades:BTCUSDT + - COUNT 10

# Read new messages (blocking, 5 second timeout)
XREAD BLOCK 5000 STREAMS trades:BTCUSDT $

# Read from specific ID
XREAD STREAMS trades:BTCUSDT 1699999999999-0
```

## Configuration

### Environment Variables

Edit `.env` or set in `docker-compose.yml`:

```bash
# Redis connection
REDIS_URL=redis://redis:6379/0

# CoinGecko API (optional, uses free tier if not set)
COINGECKO_API_KEY=your_api_key_here

# Pair discovery
PAIRS_LIMIT=200                          # Max pairs to monitor
FALLBACK_PAIRS=BTCUSDT,ETHUSDT,SOLUSDT  # Always included
DISCOVERY_REFRESH_SEC=3600               # Refresh interval (1 hour)

# WebSocket configuration
BINANCE_WS_URL=wss://stream.binance.com:9443
PAIRS_PER_CONNECTION=50                  # Pairs per WS connection

# Redis Streams
STREAM_MAXLEN=10000                      # Max messages per stream

# Health server
HEALTH_PORT=8099
```

### Adjusting Pair List

To monitor specific pairs:

```bash
# Set in .env
FALLBACK_PAIRS=BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,ADAUSDT

# Restart service
docker compose restart ingest_ws
```

To change the number of pairs:

```bash
# Set in .env
PAIRS_LIMIT=100  # Monitor top 100 instead of 200

# Restart service
docker compose restart ingest_ws
```

## Troubleshooting

### Service Won't Start

**Symptom**: Container exits immediately

**Solution**:
1. Check logs: `docker compose logs ingest_ws`
2. Verify Redis is running: `docker compose ps redis`
3. Test Redis connection: `docker compose exec redis redis-cli ping`
4. Check environment variables: `docker compose config`

### No WebSocket Connections

**Symptom**: Health check shows 0 active connections

**Solution**:
1. Check logs for connection errors
2. Verify internet connectivity
3. Check if Binance API is accessible: `curl https://api.binance.com/api/v3/ping`
4. Reduce `PAIRS_PER_CONNECTION` if hitting limits
5. Check for IP blocking or rate limiting

### No Messages in Streams

**Symptom**: Streams are empty or not updating

**Solution**:
1. Check health: `curl http://localhost:8099/health`
2. Verify WebSocket connections are active
3. Check Redis: `docker compose exec redis redis-cli KEYS trades:*`
4. View stats: `curl http://localhost:8099/stats`
5. Check logs for publish errors
6. Verify pairs exist: `curl http://localhost:8099/pairs`

### High Memory Usage

**Symptom**: Container using excessive memory

**Solution**:
1. Reduce `STREAM_MAXLEN` (default 10000):
   ```bash
   STREAM_MAXLEN=5000
   ```
2. Reduce `PAIRS_LIMIT` (default 200):
   ```bash
   PAIRS_LIMIT=100
   ```
3. Reduce `PAIRS_PER_CONNECTION` (default 50):
   ```bash
   PAIRS_PER_CONNECTION=25
   ```
4. Restart service: `docker compose restart ingest_ws`

### CoinGecko Rate Limiting

**Symptom**: Logs show "CoinGecko rate limit hit"

**Solution**:
1. Add API key for higher limits:
   ```bash
   COINGECKO_API_KEY=your_api_key
   ```
2. Increase refresh interval:
   ```bash
   DISCOVERY_REFRESH_SEC=7200  # 2 hours
   ```
3. Service will use fallback pairs if discovery fails

### WebSocket Reconnection Issues

**Symptom**: Frequent reconnections in logs

**Solution**:
1. Check network stability
2. Verify Binance API status
3. Reduce pairs per connection:
   ```bash
   PAIRS_PER_CONNECTION=25
   ```
4. Check for IP rate limiting
5. Monitor connection errors in stats

## Integration with Other Services

### Signals Service

The signals service can consume trade streams using consumer groups:

```python
import redis.asyncio as redis

# Create consumer group (one-time)
client = await redis.from_url("redis://redis:6379/0", decode_responses=True)
await client.xgroup_create("trades:BTCUSDT", "signals", id="0", mkstream=True)

# Consume messages
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
            # Process trade
            price = float(fields["price"])
            qty = float(fields["qty"])
            
            # Acknowledge
            await client.xack("trades:BTCUSDT", "signals", msg_id)
```

### AlphaBrain Service

AlphaBrain can subscribe to multiple pairs:

```python
import redis.asyncio as redis

client = await redis.from_url("redis://redis:6379/0", decode_responses=True)

# Subscribe to multiple pairs
pairs = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
streams = {f"trades:{pair}": "$" for pair in pairs}

while True:
    result = await client.xread(streams, count=10, block=5000)
    
    for stream, messages in result:
        pair = stream.replace("trades:", "")
        for msg_id, fields in messages:
            # Process trade for this pair
            process_trade(pair, fields)
            
            # Update last ID for this stream
            streams[stream] = msg_id
```

## Performance Tuning

### Optimize Connection Count

```bash
# For high-volume pairs (BTC, ETH)
PAIRS_PER_CONNECTION=25

# For low-volume pairs
PAIRS_PER_CONNECTION=100
```

### Optimize Stream Retention

```bash
# High-frequency consumption (short retention)
STREAM_MAXLEN=5000

# Low-frequency consumption (longer retention)
STREAM_MAXLEN=20000

# Very high throughput (aggressive trimming)
STREAM_MAXLEN=1000
```

### Optimize Pair Discovery

```bash
# Frequent updates (more API calls)
DISCOVERY_REFRESH_SEC=1800  # 30 minutes

# Infrequent updates (fewer API calls)
DISCOVERY_REFRESH_SEC=7200  # 2 hours
```

## Maintenance

### Restart Service

```bash
docker compose restart ingest_ws
```

### Update Pair List

```bash
# Edit .env
nano .env

# Update FALLBACK_PAIRS or PAIRS_LIMIT

# Restart
docker compose restart ingest_ws
```

### Clear Streams

```bash
# Connect to Redis
docker compose exec redis redis-cli

# Delete specific stream
DEL trades:BTCUSDT

# Delete all trade streams
EVAL "return redis.call('del', unpack(redis.call('keys', 'trades:*')))" 0
```

### View Stream Memory Usage

```bash
docker compose exec redis redis-cli

# Get memory usage for a stream
MEMORY USAGE trades:BTCUSDT

# Get total Redis memory
INFO memory
```

## Alerts

Set up monitoring alerts for:

- Health endpoint returning 503 for > 2 minutes
- No active WebSocket connections for > 5 minutes
- Error rate > 1% (from /stats)
- Memory usage > 80%
- Redis connection failures

## Scaling

### Horizontal Scaling

To scale across multiple instances:

1. Split pairs into subsets
2. Run multiple instances with different `FALLBACK_PAIRS`
3. Use different container names

Example:

```yaml
# Instance 1: Top 100 pairs
ingest_ws_1:
  environment:
    PAIRS_LIMIT: 100
    FALLBACK_PAIRS: BTCUSDT,ETHUSDT,BNBUSDT

# Instance 2: Next 100 pairs
ingest_ws_2:
  environment:
    PAIRS_LIMIT: 100
    FALLBACK_PAIRS: ADAUSDT,DOGEUSDT,XRPUSDT
```

### Vertical Scaling

Increase container resources:

```yaml
ingest_ws:
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '1.0'
```

## Security

- Uses public WebSocket streams (no API keys required)
- No trading or order execution
- Read-only access to market data
- Redis Streams are internal (not exposed externally)

## Backup and Recovery

### Backup Stream Data

```bash
# Dump specific stream
docker compose exec redis redis-cli --rdb /data/backup.rdb

# Copy backup
docker compose cp redis:/data/backup.rdb ./backup.rdb
```

### Recovery

Service is stateless and will automatically:
- Reconnect to WebSocket on failure
- Rediscover pairs on restart
- Resume publishing to streams

No manual recovery needed.

# Ingestion Service Runbook

## Overview

The Ingestion service collects real-time market data from multiple sources and writes it to TimescaleDB. It supports CEX (Binance, Bybit), DEX (Uniswap V3), and on-chain (EVM) data sources.

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Binance WS │  │  Bybit WS   │  │ Uniswap API │  │   EVM RPC   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Orchestrator     │
                    │  (run.py)         │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Batch Buffers    │
                    │  (timeseries.py)  │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   TimescaleDB     │
                    └───────────────────┘
```

## Configuration

### Environment Variables

```bash
# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ghostquant
POSTGRES_USER=ghost
POSTGRES_PASSWORD=ghostpass

# CEX Keys (optional - uses mock data if not provided)
BINANCE_API_KEY=
BINANCE_API_SECRET=
BYBIT_API_KEY=
BYBIT_API_SECRET=

# RPC (optional - uses mock data if not provided)
RPC_ETH_MAINNET=

# Feature Flags
USE_MOCK_DATA=true  # Set to false for live data
```

### Asset Whitelist

Edit `ingest/src/ingest/run.py` to modify the asset whitelist:

```python
symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']  # Add more symbols here
```

## Starting the Service

### Using Docker Compose

```bash
docker compose up ingest
```

### Standalone (for development)

```bash
cd ingest
poetry install
poetry run python -m ingest.run
```

## Monitoring

### View Logs

```bash
# Docker
docker compose logs -f ingest

# Look for these log messages:
# - "Loaded X assets and Y pools"
# - "Connected to Binance WebSocket"
# - "Flushed X ticks"
# - "Flushed X books"
```

### Check Data Flow

```bash
# Connect to database
docker compose exec postgres psql -U ghost -d ghostquant

# Check recent ticks
SELECT COUNT(*), MAX(ts) FROM ticks;

# Check recent books
SELECT COUNT(*), MAX(ts) FROM books;

# Check recent derivatives
SELECT COUNT(*), MAX(ts) FROM derivatives;

# Check recent DEX metrics
SELECT COUNT(*), MAX(ts) FROM dex_metrics;

# Check recent on-chain flows
SELECT COUNT(*), MAX(ts) FROM onchain_flows;
```

### Performance Metrics

```sql
-- Ticks per asset in last hour
SELECT a.symbol, COUNT(*) as tick_count
FROM ticks t
JOIN assets a ON t.asset_id = a.asset_id
WHERE t.ts >= NOW() - INTERVAL '1 hour'
GROUP BY a.symbol
ORDER BY tick_count DESC;

-- Average spread by venue
SELECT venue, AVG(spread_bps) as avg_spread
FROM books
WHERE ts >= NOW() - INTERVAL '1 hour'
GROUP BY venue;
```

## Adapters

### Binance Adapter

**Purpose**: Collects trades and order book data from Binance public WebSocket

**Data Written**:
- `ticks`: Trade data (price, quantity, side)
- `books`: Order book snapshots (bid/ask prices and sizes)

**Reconnection**: Automatic with 5-second backoff

**Mock Mode**: Generates synthetic trades every 5 seconds

### Bybit Adapter

**Purpose**: Collects derivatives data (funding, OI) from Bybit

**Data Written**:
- `derivatives`: Funding rates, open interest, basis

**Reconnection**: Automatic with 5-second backoff

**Mock Mode**: Generates synthetic derivatives data every 60 seconds

### Uniswap V3 Adapter

**Purpose**: Polls Uniswap V3 pool metrics via TheGraph API

**Data Written**:
- `dex_metrics`: TVL, 24h volume, depth

**Polling Interval**: 300 seconds (5 minutes)

**Mock Mode**: Generates synthetic DEX metrics every 5 minutes

### EVM Adapter

**Purpose**: Monitors ERC-20 transfers on Ethereum mainnet

**Data Written**:
- `onchain_flows`: Transfer events with from/to tags

**Mock Mode**: Generates synthetic flow events every 30 seconds

## Troubleshooting

### WebSocket Connection Failures

**Symptom**: Logs show repeated connection errors

**Solution**:
1. Check internet connectivity
2. Verify API keys are valid (if using live data)
3. Check if exchange is blocking your IP
4. Enable mock data mode: `USE_MOCK_DATA=true`

### Database Write Errors

**Symptom**: "Failed to insert" errors in logs

**Solution**:
1. Check database is running: `docker compose ps postgres`
2. Verify database credentials in `.env`
3. Check disk space: `df -h`
4. Restart database: `docker compose restart postgres`

### No Data Being Written

**Symptom**: Database tables remain empty

**Solution**:
1. Check service is running: `docker compose ps ingest`
2. View logs: `docker compose logs ingest`
3. Verify assets exist: `SELECT * FROM assets;`
4. Check buffer sizes aren't too large
5. Restart service: `docker compose restart ingest`

### High Memory Usage

**Symptom**: Service consuming excessive memory

**Solution**:
1. Reduce buffer sizes in `run.py`:
   ```python
   self.buffer_size = 50  # Reduce from 100
   ```
2. Reduce asset whitelist
3. Increase flush frequency

### Rate Limiting

**Symptom**: 429 errors from exchanges

**Solution**:
1. Add delays between requests
2. Use public endpoints only
3. Switch to mock data mode
4. Implement request throttling

## Data Quality Checks

### Check for Gaps

```sql
-- Find time gaps in tick data
SELECT 
    asset_id,
    ts,
    LEAD(ts) OVER (PARTITION BY asset_id ORDER BY ts) - ts as gap
FROM ticks
WHERE ts >= NOW() - INTERVAL '1 hour'
ORDER BY gap DESC
LIMIT 10;
```

### Check for Outliers

```sql
-- Find unusual prices
SELECT asset_id, ts, price
FROM ticks
WHERE ts >= NOW() - INTERVAL '1 hour'
  AND (price > LAG(price, 1) OVER (PARTITION BY asset_id ORDER BY ts) * 1.1
   OR price < LAG(price, 1) OVER (PARTITION BY asset_id ORDER BY ts) * 0.9)
ORDER BY ts DESC;
```

## Maintenance

### Adding New Assets

1. Insert into database:
```sql
INSERT INTO assets (symbol, chain, address, sector, risk_tags)
VALUES ('MATIC', 'polygon', NULL, 'Layer1', ARRAY['mid-cap']);
```

2. Update whitelist in `run.py`:
```python
symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'MATICUSDT']
```

3. Restart service:
```bash
docker compose restart ingest
```

### Adding New DEX Pools

1. Insert pool:
```sql
INSERT INTO dex_pools (chain, address, token0, token1, fee_bps)
VALUES ('ethereum', '0x...', 'USDC', 'MATIC', 30);
```

2. Service will automatically pick up new pools on restart

### Clearing Old Data

```sql
-- Delete data older than 30 days
DELETE FROM ticks WHERE ts < NOW() - INTERVAL '30 days';
DELETE FROM books WHERE ts < NOW() - INTERVAL '30 days';
DELETE FROM derivatives WHERE ts < NOW() - INTERVAL '30 days';
```

## Performance Tuning

### Batch Size Optimization

Adjust buffer sizes based on data volume:

```python
# High volume (>1000 ticks/min)
self.buffer_size = 200

# Medium volume (100-1000 ticks/min)
self.buffer_size = 100

# Low volume (<100 ticks/min)
self.buffer_size = 50
```

### Flush Frequency

Adjust periodic flush interval:

```python
# More frequent (lower latency, higher DB load)
await asyncio.sleep(15)

# Less frequent (higher latency, lower DB load)
await asyncio.sleep(60)
```

## Alerts

Set up monitoring alerts for:

- WebSocket disconnections lasting > 1 minute
- No data written for > 5 minutes
- Database write errors
- Memory usage > 80%
- CPU usage > 90%

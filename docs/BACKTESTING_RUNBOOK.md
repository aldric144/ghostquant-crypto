# GhostQuant Backtesting Pipeline - Operations Runbook

## Overview

The GhostQuant Backtesting Pipeline provides a complete system for:
- **OHLCV Data Ingestion** from CoinGecko with rate limiting
- **Async Job Queue** using Redis/RQ for backtest execution
- **Strategy Backtesting** with slippage and commission modeling
- **Performance Metrics** (Sharpe, Sortino, Max DD, CAGR, Win Rate, etc.)
- **Web UI** for creating, viewing, and downloading backtest results

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  CoinGecko  │────▶│   Ingester   │────▶│  PostgreSQL │
│     API     │     │   Service    │     │ (TimescaleDB│
└─────────────┘     └──────────────┘     └─────────────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Web UI    │────▶│  FastAPI     │────▶│    Redis    │
│  (Next.js)  │     │     API      │     │    Queue    │
└─────────────┘     └──────────────┘     └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  Backtest   │
                                          │   Worker    │
                                          └─────────────┘
```

## Services

### 1. Ingester Service

**Purpose**: Fetches OHLCV and supply data from CoinGecko

**Container**: `ghostquant-ingester`

**Key Features**:
- Rate limiting (50 requests/min by default)
- Exponential backoff on failures
- Chunked backfilling (30-day chunks)
- Stores data in TimescaleDB hypertables

**CLI Commands**:

```bash
# List available coins
docker compose exec ingester python -m ingester list_coins --search bitcoin

# Fetch OHLCV for a single coin
docker compose exec ingester python -m ingester fetch_ohlcv \
  --source bitcoin \
  --symbol BTC \
  --timeframe 1d \
  --start 2024-01-01 \
  --end 2024-06-01

# Backfill multiple coins from JSON file
docker compose exec ingester python -m ingester backfill \
  --target-file /path/to/tokens.json \
  --timeframe 1d \
  --start 2024-01-01 \
  --end 2024-06-01
```

**Tokens JSON Format**:
```json
[
  {"symbol": "BTC", "id": "bitcoin"},
  {"symbol": "ETH", "id": "ethereum"},
  {"symbol": "SOL", "id": "solana"}
]
```

### 2. Backtest Worker Service

**Purpose**: Executes backtest jobs from Redis queue

**Container**: `ghostquant-backtest-worker`

**Key Features**:
- Async job execution using RQ
- Timeout protection (2 hours default)
- Automatic retry on transient errors (2 retries)
- CSV result generation
- Equity curve and trade history storage

**Monitoring**:

```bash
# View worker logs
docker compose logs -f backtest-worker

# Check Redis queue status
docker compose exec redis redis-cli
> LLEN backtests  # Number of pending jobs
> KEYS rq:job:*   # List all jobs
```

### 3. API Service

**Purpose**: REST API for backtest management

**Container**: `ghostquant-api`

**Endpoints**:

- `POST /backtests` - Create new backtest
- `GET /backtests` - List all backtests (with pagination)
- `GET /backtests/{run_id}` - Get specific backtest
- `GET /backtests/{run_id}/results` - Get detailed results
- `POST /backtests/{run_id}/cancel` - Cancel running backtest
- `GET /backtests/health` - Health check

## Database Schema

### Tables

**ohlcv** (TimescaleDB hypertable):
- `symbol` - Coin symbol (e.g., "BTC")
- `ts` - Timestamp
- `open`, `high`, `low`, `close`, `volume` - OHLCV data
- `timeframe` - Timeframe (e.g., "1d", "1h")
- `source` - Data source (e.g., "coingecko")

**supply** (TimescaleDB hypertable):
- `symbol` - Coin symbol
- `ts` - Timestamp
- `circulating_supply`, `total_supply`, `max_supply` - Supply metrics
- `source` - Data source

**backtest_runs**:
- `run_id` - UUID primary key
- `strategy`, `symbol`, `timeframe` - Backtest parameters
- `start_date`, `end_date` - Date range
- `initial_capital` - Starting capital
- `status` - pending, running, success, failed, cancelled
- `sharpe`, `sortino`, `max_dd`, `cagr`, etc. - Performance metrics
- `csv_path` - Path to CSV results file

**backtest_trades**:
- `trade_id` - Auto-increment primary key
- `run_id` - Foreign key to backtest_runs
- `ts` - Trade timestamp
- `side` - buy or sell
- `quantity`, `price` - Trade details
- `pnl`, `cumulative_pnl` - Profit/loss
- `reason` - Trade reason (signal description)

**backtest_equity**:
- `run_id`, `ts` - Composite primary key
- `equity`, `cash`, `position_value` - Portfolio state
- `drawdown_pct` - Drawdown percentage

## Usage Guide

### Step 1: Ingest Historical Data

Before running backtests, you need historical OHLCV data:

```bash
# Create a tokens list file
cat > tokens.json << EOF
[
  {"symbol": "BTC", "id": "bitcoin"},
  {"symbol": "ETH", "id": "ethereum"}
]
EOF

# Backfill data
docker compose exec ingester python -m ingester backfill \
  --target-file tokens.json \
  --timeframe 1d \
  --start 2024-01-01 \
  --end 2024-06-01
```

**Note**: This will take time due to rate limiting. For 2 coins over 6 months, expect ~5-10 minutes.

### Step 2: Create a Backtest via API

```bash
curl -X POST http://localhost:8080/backtests \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "trend_v1",
    "symbol": "BTC",
    "timeframe": "1d",
    "start_date": "2024-01-01",
    "end_date": "2024-06-01",
    "initial_capital": 10000,
    "params": {
      "fast_ma": 20,
      "slow_ma": 50,
      "position_size": 0.95,
      "slippage_bps": 10,
      "commission_bps": 10
    }
  }'
```

Response:
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "strategy": "trend_v1",
  "symbol": "BTC",
  "status": "pending",
  "created_at": "2024-06-01T12:00:00"
}
```

### Step 3: Monitor Backtest Progress

```bash
# Check status
curl http://localhost:8080/backtests/550e8400-e29b-41d4-a716-446655440000

# List all backtests
curl http://localhost:8080/backtests?page=1&limit=10

# Filter by status
curl http://localhost:8080/backtests?status=success

# Filter by symbol
curl http://localhost:8080/backtests?symbol=BTC
```

### Step 4: View Results

```bash
# Get detailed results
curl http://localhost:8080/backtests/550e8400-e29b-41d4-a716-446655440000/results
```

Response includes:
- **trades**: Array of all trades with timestamps, prices, P&L
- **equity_curve**: Time series of portfolio equity

### Step 5: Download CSV

CSV files are stored in `/data/backtests/results/` and contain:
- Performance metrics summary
- Complete trade history with cumulative P&L

## Strategies

### trend_v1 (Moving Average Crossover)

**Description**: Simple trend-following strategy using fast and slow moving averages.

**Parameters**:
- `fast_ma` (default: 20) - Fast MA period
- `slow_ma` (default: 50) - Slow MA period
- `position_size` (default: 0.95) - Fraction of capital to use (0-1)
- `slippage_bps` (default: 10) - Slippage in basis points (0.1%)
- `commission_bps` (default: 10) - Commission in basis points (0.1%)

**Logic**:
- **Buy Signal**: Fast MA crosses above Slow MA
- **Sell Signal**: Fast MA crosses below Slow MA
- Uses 95% of capital per trade
- Applies slippage and commission to all trades

**Example**:
```json
{
  "strategy": "trend_v1",
  "params": {
    "fast_ma": 10,
    "slow_ma": 30,
    "position_size": 0.90,
    "slippage_bps": 15,
    "commission_bps": 15
  }
}
```

## Performance Metrics

### Sharpe Ratio
Risk-adjusted return metric. Higher is better.
- **> 1.0**: Good
- **> 2.0**: Very good
- **> 3.0**: Excellent

### Sortino Ratio
Like Sharpe but only penalizes downside volatility. Higher is better.

### Maximum Drawdown (Max DD)
Largest peak-to-trough decline. Lower is better.
- **< 10%**: Excellent
- **10-20%**: Good
- **20-30%**: Acceptable
- **> 30%**: High risk

### CAGR (Compound Annual Growth Rate)
Annualized return. Higher is better.

### Win Rate
Percentage of profitable trades. Higher is better.
- **> 50%**: Positive edge
- **> 60%**: Strong edge

### Profit Factor
Gross profit / Gross loss. Higher is better.
- **> 1.0**: Profitable
- **> 1.5**: Good
- **> 2.0**: Excellent

## Environment Variables

### Ingester Configuration

```bash
# CoinGecko API
COINGECKO_API_KEY=          # Optional Pro API key
COINGECKO_BASE=https://api.coingecko.com/api/v3
COINGECKO_PRO_BASE=https://pro-api.coingecko.com/api/v3

# Rate Limiting
INGESTER_RATE_LIMIT_PER_MIN=50
INGESTER_RETRY_MAX_ATTEMPTS=3
INGESTER_RETRY_BACKOFF_BASE=2.0
INGESTER_RETRY_INITIAL_DELAY=1.0

# Backfill Settings
BACKFILL_CHUNK_DAYS=30
BACKFILL_DELAY_SECONDS=1.0
```

### Worker Configuration

```bash
# Redis Queue
REDIS_URL=redis://redis:6379/0
BACKTEST_QUEUE_NAME=backtests

# Execution Limits
BACKTEST_MAX_RUNTIME_SECONDS=7200  # 2 hours
BACKTEST_RESULTS_PATH=/data/backtests/results

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ghostquant
POSTGRES_USER=ghost
POSTGRES_PASSWORD=ghostpass
```

## Troubleshooting

### Issue: "No OHLCV data found"

**Cause**: Data hasn't been ingested for the requested symbol/timeframe/date range.

**Solution**:
```bash
# Check what data exists
docker compose exec postgres psql -U ghost -d ghostquant -c \
  "SELECT symbol, timeframe, MIN(ts), MAX(ts), COUNT(*) 
   FROM ohlcv 
   GROUP BY symbol, timeframe;"

# Backfill missing data
docker compose exec ingester python -m ingester fetch_ohlcv \
  --source bitcoin --symbol BTC --timeframe 1d \
  --start 2024-01-01 --end 2024-06-01
```

### Issue: Backtest stuck in "pending" status

**Cause**: Worker not running or Redis connection issue.

**Solution**:
```bash
# Check worker logs
docker compose logs -f backtest-worker

# Check Redis connection
docker compose exec redis redis-cli ping

# Restart worker
docker compose restart backtest-worker
```

### Issue: Rate limit errors (429)

**Cause**: Hitting CoinGecko API rate limits.

**Solution**:
- Reduce `INGESTER_RATE_LIMIT_PER_MIN`
- Add CoinGecko Pro API key for higher limits
- Increase `BACKFILL_DELAY_SECONDS`

### Issue: Worker timeout

**Cause**: Backtest taking longer than `BACKTEST_MAX_RUNTIME_SECONDS`.

**Solution**:
- Increase timeout: `BACKTEST_MAX_RUNTIME_SECONDS=14400` (4 hours)
- Reduce date range
- Use larger timeframe (1d instead of 1h)

## Testing

### Run Tests

```bash
# Ingester tests
cd ingester
poetry install
poetry run pytest tests/ -v

# Worker tests
cd backtest-worker
poetry install
poetry run pytest tests/ -v

# API tests
cd api
poetry install
poetry run pytest tests/test_backtests_api.py -v
```

### Manual Testing

```bash
# 1. Start services
docker compose up -d

# 2. Ingest test data
docker compose exec ingester python -m ingester fetch_ohlcv \
  --source bitcoin --symbol BTC --timeframe 1d \
  --start 2024-01-01 --end 2024-03-01

# 3. Create backtest
curl -X POST http://localhost:8080/backtests \
  -H "Content-Type: application/json" \
  -d '{"strategy":"trend_v1","symbol":"BTC","timeframe":"1d","start_date":"2024-01-01","end_date":"2024-03-01","initial_capital":10000}'

# 4. Check results (use run_id from step 3)
curl http://localhost:8080/backtests/{run_id}
```

## Best Practices

1. **Data Quality**: Always verify OHLCV data exists before running backtests
2. **Rate Limiting**: Respect CoinGecko API limits to avoid bans
3. **Chunking**: Use backfill for large date ranges (>90 days)
4. **Monitoring**: Check worker logs regularly for errors
5. **Timeouts**: Set appropriate timeouts based on data size
6. **Testing**: Test strategies on small date ranges first
7. **CSV Backup**: Keep CSV files for audit trail

## API Examples

### Create Backtest with Custom Parameters

```python
import requests

backtest = {
    "strategy": "trend_v1",
    "symbol": "ETH",
    "timeframe": "1d",
    "start_date": "2024-01-01",
    "end_date": "2024-06-01",
    "initial_capital": 50000,
    "params": {
        "fast_ma": 10,
        "slow_ma": 30,
        "position_size": 0.80,
        "slippage_bps": 20,
        "commission_bps": 15
    }
}

response = requests.post("http://localhost:8080/backtests", json=backtest)
run_id = response.json()["run_id"]
print(f"Backtest created: {run_id}")
```

### Poll for Completion

```python
import time

while True:
    response = requests.get(f"http://localhost:8080/backtests/{run_id}")
    status = response.json()["status"]
    
    if status == "success":
        print("Backtest completed!")
        break
    elif status == "failed":
        print("Backtest failed!")
        break
    
    print(f"Status: {status}")
    time.sleep(5)
```

### Download Results

```python
response = requests.get(f"http://localhost:8080/backtests/{run_id}/results")
results = response.json()

print(f"Trades: {len(results['trades'])}")
print(f"Equity curve points: {len(results['equity_curve'])}")
```

## Maintenance

### Clear Old Results

```bash
# Delete backtests older than 30 days
docker compose exec postgres psql -U ghost -d ghostquant -c \
  "DELETE FROM backtest_runs WHERE created_at < NOW() - INTERVAL '30 days';"

# Clean up CSV files
docker compose exec backtest-worker find /data/backtests/results -mtime +30 -delete
```

### Database Maintenance

```bash
# Vacuum tables
docker compose exec postgres psql -U ghost -d ghostquant -c "VACUUM ANALYZE ohlcv;"
docker compose exec postgres psql -U ghost -d ghostquant -c "VACUUM ANALYZE backtest_runs;"

# Check table sizes
docker compose exec postgres psql -U ghost -d ghostquant -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## Support

For issues or questions:
1. Check logs: `docker compose logs -f [service-name]`
2. Review this runbook
3. Check database for data availability
4. Verify environment variables
5. Test with small date ranges first

## Future Enhancements

- Additional strategies (mean reversion, momentum, etc.)
- Multi-asset portfolio backtesting
- Walk-forward optimization
- Monte Carlo simulation
- Custom strategy upload
- Real-time paper trading

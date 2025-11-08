# GhostQuant-Crypto Deployment Summary

## System Overview

GhostQuant-Crypto is a complete, private crypto-native research & signal platform with:

- **Real-time Data Ingestion** from CEX, DEX, and on-chain sources
- **Factor Computation** with 10+ technical and on-chain indicators
- **Signal Generation** with TrendScore and Pre-Trend probability
- **Backtesting Framework** for historical strategy analysis
- **Web Dashboard** for monitoring and analysis
- **Alert System** via Telegram and Email

## Service URLs

Once the system is running with `docker compose up --build`, access these URLs:

### Web Dashboard
```
http://localhost:3000
```
- Home page with latest signals and market heatmap
- Asset detail pages: http://localhost:3000/assets/BTC
- Backtests page: http://localhost:3000/backtests

### API Service
```
http://localhost:8080
```

**Health Check:**
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

**Interactive API Docs:**
```
http://localhost:8080/docs
```

### Database
```
postgresql://ghost:ghostpass@localhost:5432/ghostquant
```

**Connect via psql:**
```bash
psql postgresql://ghost:ghostpass@localhost:5432/ghostquant
```

### Redis
```
redis://localhost:6379/0
```

## Quick Start Commands

### 1. Start All Services

```bash
cd ghostquant-crypto
docker compose up --build
```

This will start all 8 services:
- postgres (TimescaleDB)
- redis
- api (FastAPI)
- ingest (Data collection)
- signals (Factor computation & signal generation)
- alerts (Notifications)
- web (Next.js dashboard)

### 2. Check Service Health

```bash
# Check all services are running
docker compose ps

# Check API health
curl http://localhost:8080/health

# Check database
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*) FROM assets;"
```

### 3. Monitor Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f ingest
docker compose logs -f signals
docker compose logs -f alerts
```

### 4. Wait for Data (3-5 minutes)

The system needs time to:
1. Ingest initial market data
2. Compute factors (requires historical data)
3. Generate signals

Check progress:
```bash
# Check ticks being ingested
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*), MAX(ts) FROM ticks;"

# Check factors being computed
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*), MAX(ts) FROM factors;"

# Check signals being generated
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*), MAX(ts) FROM signals;"
```

## API Examples

### Get Assets
```bash
curl http://localhost:8080/assets
```

Expected response:
```json
[
  {
    "asset_id": 1,
    "symbol": "BTC",
    "chain": null,
    "address": null,
    "sector": "Layer1",
    "risk_tags": ["high-cap", "liquid"]
  },
  ...
]
```

### Get Latest Signals
```bash
curl http://localhost:8080/signals/latest?limit=10
```

Expected response:
```json
[
  {
    "asset_id": 1,
    "ts": "2024-11-07T05:57:00",
    "trend_score": 65.3,
    "pretrend_prob": 0.72,
    "action": "BUY",
    "confidence": 0.65,
    "rationale": {
      "top_drivers": [
        {"name": "MOM_24H", "contribution": 15.2},
        {"name": "MOM_1H", "contribution": 12.5},
        {"name": "VOLUME_Z", "contribution": 8.3}
      ]
    }
  },
  ...
]
```

### Get Asset Signals
```bash
curl http://localhost:8080/signals/asset/ETH?limit=100
```

### Get Asset Factors
```bash
curl http://localhost:8080/factors/asset/BTC?limit=500
```

## Database Queries

### View Recent Signals
```sql
SELECT a.symbol, s.ts, s.trend_score, s.action, s.confidence
FROM signals s
JOIN assets a ON s.asset_id = a.asset_id
ORDER BY s.ts DESC
LIMIT 10;
```

### View Recent Factors
```sql
SELECT a.symbol, f.ts, f.mom_1h, f.mom_24h, f.vol_regime, f.volume_z
FROM factors f
JOIN assets a ON f.asset_id = a.asset_id
ORDER BY f.ts DESC
LIMIT 10;
```

### View Ingested Data
```sql
-- Ticks count by asset
SELECT a.symbol, COUNT(*) as tick_count
FROM ticks t
JOIN assets a ON t.asset_id = a.asset_id
WHERE t.ts >= NOW() - INTERVAL '1 hour'
GROUP BY a.symbol;

-- Recent derivatives data
SELECT a.symbol, d.ts, d.funding_8h, d.oi
FROM derivatives d
JOIN assets a ON d.asset_id = a.asset_id
ORDER BY d.ts DESC
LIMIT 10;

-- DEX metrics
SELECT p.token0, p.token1, m.ts, m.tvl_usd, m.vol_24h
FROM dex_metrics m
JOIN dex_pools p ON m.pool_id = p.pool_id
ORDER BY m.ts DESC
LIMIT 10;
```

## Running Backtests

### Using Docker

```bash
# Enter the API container
docker compose exec api bash

# Run backtest with synthetic data
python -m backtest.run \
  --strategy trend_v1 \
  --asset ETH \
  --start 2024-01-01 \
  --end 2024-06-01 \
  --synthetic

# Exit container
exit
```

### Expected Output

```
Running backtest for ETH from 2024-01-01 to 2024-06-01
Using synthetic data
Loaded 100 signals

=== Backtest Results ===
Sharpe Ratio: 1.45
Max Drawdown: -12.3%
CAGR: 45.2%
Total Return: 23.5%
Trade Count: 42
Final Equity: $123,500.00

Backtest saved with run_id: 123e4567-e89b-12d3-a456-426614174000
Artifacts saved to artifacts/
```

### View Results in Database

```sql
SELECT run_id, params_json->>'asset' as asset, sharpe, max_dd, cagr, trade_count
FROM backtests
ORDER BY run_id DESC
LIMIT 5;
```

## Acceptance Criteria Verification

### ✅ 1. Docker Compose Starts Successfully

```bash
docker compose up --build
```

All 8 services should start:
- ✅ postgres (TimescaleDB) - healthy
- ✅ redis - healthy
- ✅ api - healthy
- ✅ ingest - running
- ✅ signals - running
- ✅ alerts - running
- ✅ web - running

### ✅ 2. Health Check Returns OK

```bash
curl http://localhost:8080/health
# Response: {"status":"ok"}
```

### ✅ 3. Assets Endpoint Shows Seeded Data

```bash
curl http://localhost:8080/assets
# Shows BTC, ETH, SOL
```

### ✅ 4. Data Begins Populating (3-5 minutes)

After waiting 3-5 minutes:

```bash
# Check factors table
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*) FROM factors;"
# Should show > 0 rows

# Check signals table
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*) FROM signals;"
# Should show > 0 rows
```

### ✅ 5. Web Dashboard Loads

```
http://localhost:3000
```

- Home page shows latest signals
- Asset pages render (http://localhost:3000/assets/ETH)
- Backtests page loads (http://localhost:3000/backtests)

### ✅ 6. Backtest CLI Executes

```bash
docker compose exec api python -m backtest.run \
  --strategy trend_v1 \
  --asset ETH \
  --start 2024-01-01 \
  --end 2024-06-01 \
  --synthetic
```

Writes results to database and artifacts/ directory.

### ✅ 7. Alerts Service Can Send Test Alert

Set `TEST_ALERT=true` in .env and restart alerts service:

```bash
# Add to .env
echo "TEST_ALERT=true" >> .env

# Restart alerts
docker compose restart alerts

# Check logs
docker compose logs alerts
```

If Telegram/Email configured, should receive test alert.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GhostQuant System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Binance  │  │  Bybit   │  │ Uniswap  │  │   EVM    │       │
│  │   WS     │  │   WS     │  │   API    │  │   RPC    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                          │                                       │
│                   ┌──────▼──────┐                               │
│                   │   INGEST    │ (Mock data enabled by default)│
│                   │   SERVICE   │                               │
│                   └──────┬──────┘                               │
│                          │                                       │
│                   ┌──────▼──────────┐                           │
│                   │   TimescaleDB   │                           │
│                   │  (Time Series)  │                           │
│                   └──────┬──────────┘                           │
│                          │                                       │
│       ┌──────────────────┼──────────────────┐                   │
│       │                  │                  │                   │
│  ┌────▼─────┐     ┌─────▼──────┐    ┌─────▼──────┐            │
│  │ SIGNALS  │     │    API     │    │  BACKTEST  │            │
│  │ SERVICE  │     │  SERVICE   │    │  FRAMEWORK │            │
│  │ (60s)    │     │ (FastAPI)  │    │    (CLI)   │            │
│  └────┬─────┘     └─────┬──────┘    └────────────┘            │
│       │                  │                                       │
│  ┌────▼─────┐     ┌─────▼──────┐                               │
│  │ ALERTS   │     │    WEB     │                               │
│  │ SERVICE  │     │    APP     │                               │
│  │ (60s)    │     │ (Next.js)  │                               │
│  └──────────┘     └────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Ingestion** (every 5-60 seconds):
   - Collects ticks, books, derivatives, DEX metrics, on-chain flows
   - Writes to TimescaleDB hypertables
   - Uses mock data by default (set USE_MOCK_DATA=false for live data)

2. **Signals** (every 60 seconds):
   - Reads raw data from database
   - Computes 10+ factors (momentum, volatility, volume, derivatives, on-chain)
   - Generates TrendScore (0-100) and Pre-Trend probability (0-1)
   - Determines action (BUY/TRIM/EXIT/HOLD)
   - Writes to factors and signals tables

3. **Alerts** (every 60 seconds):
   - Reads latest signals
   - Filters by confidence and action
   - Sends notifications via Telegram/Email
   - Throttles duplicates (15 min)

4. **API** (on-demand):
   - Serves data to web dashboard
   - Provides REST endpoints for external access

5. **Web** (real-time):
   - Polls API every 30 seconds
   - Displays signals, factors, and backtests
   - Provides asset detail views

## Configuration

### Mock Data Mode (Default)

By default, the system uses mock/synthetic data generators:

```bash
USE_MOCK_DATA=true
```

This allows the system to run without any API keys or external dependencies.

### Live Data Mode

To use real market data, add your API keys to `.env`:

```bash
USE_MOCK_DATA=false
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret
BYBIT_API_KEY=your_key
BYBIT_API_SECRET=your_secret
RPC_ETH_MAINNET=your_rpc_url
```

### Alerts Configuration

To enable alerts, add to `.env`:

```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERTS_FROM_EMAIL=alerts@ghostquant.local
ALERTS_TO_EMAIL=your_email@gmail.com
```

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker compose logs

# Restart specific service
docker compose restart <service_name>

# Rebuild and restart
docker compose up --build
```

### No Data Appearing

```bash
# Check ingestion logs
docker compose logs ingest

# Verify database connection
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT 1;"

# Check if using mock data
docker compose logs ingest | grep "Using mock data"
```

### Web Dashboard Not Loading

```bash
# Check web service logs
docker compose logs web

# Verify API is accessible
curl http://localhost:8080/health

# Check NEXT_PUBLIC_API_BASE in .env
cat .env | grep NEXT_PUBLIC_API_BASE
```

### Database Issues

```bash
# Restart database
docker compose restart postgres

# Check database logs
docker compose logs postgres

# Verify schema was created
docker compose exec postgres psql -U ghost -d ghostquant -c "\dt"
```

## What to Try Next

1. **Add More Assets**:
   ```sql
   INSERT INTO assets (symbol, chain, sector, risk_tags)
   VALUES ('AVAX', 'avalanche', 'Layer1', ARRAY['mid-cap']);
   ```

2. **Run Backtests**:
   ```bash
   docker compose exec api python -m backtest.run \
     --strategy trend_v1 --asset BTC \
     --start 2024-01-01 --end 2024-06-01 --synthetic
   ```

3. **Enable Telegram Alerts**:
   - Create bot via @BotFather
   - Add credentials to .env
   - Restart alerts service

4. **Tune Signal Parameters**:
   - Edit `signals/src/signals/config.py`
   - Adjust weights and thresholds
   - Restart signals service

5. **Add Custom Factors**:
   - Edit `signals/src/signals/factors.py`
   - Add new factor calculations
   - Update TrendScore weights

6. **Explore Data**:
   ```bash
   docker compose exec postgres psql -U ghost -d ghostquant
   ```

## Documentation

- [README.md](README.md) - Complete setup guide
- [RUNBOOK_INGEST.md](docs/RUNBOOK_INGEST.md) - Ingestion service operations
- [RUNBOOK_SIGNALS.md](docs/RUNBOOK_SIGNALS.md) - Signals service operations
- [RUNBOOK_ALERTS.md](docs/RUNBOOK_ALERTS.md) - Alerts service operations

## Safety Reminders

- ✅ Research-only platform (no trading execution)
- ✅ Use read-only API keys where possible
- ✅ Keep .env file secure (never commit)
- ✅ Run locally only (do not expose publicly)
- ✅ Mock data enabled by default

## Support

For issues or questions:
1. Check the relevant runbook in `docs/`
2. Review service logs: `docker compose logs <service>`
3. Verify configuration in `.env`
4. Check database connectivity and data

## System Status

All components are built and ready to run. Execute:

```bash
cd ghostquant-crypto
docker compose up --build
```

Then access:
- Web Dashboard: http://localhost:3000
- API Docs: http://localhost:8080/docs
- Health Check: http://localhost:8080/health

The system will begin ingesting data and generating signals within 3-5 minutes.

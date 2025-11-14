# GhostQuant™ — Institutional-grade AI-driven quant intelligence platform

Private, crypto-native research & signal platform with real-time data ingestion, factor computation, TrendScore/Pre-Trend signals, backtesting, dashboards, and alerts.

## Overview

GhostQuant is a research-only platform (no trading or order execution) that provides:

- **Real-time Data Ingestion**: CEX trades/books (Binance, Bybit), derivatives data, DEX metrics (Uniswap V3), and on-chain flows (EVM)
- **Factor Computation**: Momentum, acceleration, volatility regime, volume z-score, funding flips, OI shifts, TVL acceleration, and flow scores
- **Signal Generation**: TrendScore and Pre-Trend probability with actionable signals (BUY/TRIM/EXIT/HOLD)
- **AlphaBrain Intelligence**: Institutional-grade quant module with macro regime detection, multi-factor Smart Beta, Kelly sizing, hedge fund playbooks, reinforcement learning, and Harvard-style analytics
- **Ecoscan Discovery Engine**: Cross-chain ecosystem mapping with EMI scoring, whale transaction tracking (>$250k), smart money clustering, and unified Ecoscore rankings
- **AI Insight Panel**: Natural language market interpretation combining AlphaBrain + Ecoscan signals with slide-in panel UI
- **IQ Meter Dashboard**: Real-time visualization of GhostQuant's learning confidence, signal accuracy, and reward metrics with Institutional IQ Mode
- **Backtesting Framework**: Historical strategy simulation with slippage modeling and performance metrics
- **Web Dashboard**: Real-time signal monitoring, asset analysis, and backtest results
- **Alerts**: Telegram and Email notifications for significant signals

## Architecture

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
│                   │   INGEST    │                               │
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
│  └────┬─────┘     └─────┬──────┘    └────────────┘            │
│       │                  │                                       │
│  ┌────▼─────┐     ┌─────▼──────┐                               │
│  │ ALERTS   │     │    WEB     │                               │
│  │ SERVICE  │     │    APP     │                               │
│  └──────────┘     └────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Services

1. **API** (FastAPI): REST endpoints for assets, signals, and factors
2. **Ingest**: Real-time data collection from CEX, DEX, and on-chain sources
3. **Signals**: Factor computation and TrendScore/Pre-Trend generation
4. **AlphaBrain**: Institutional-grade quant intelligence with macro regime detection, Smart Beta, Kelly sizing, and hedge fund playbooks
5. **Ecoscan**: Cross-chain ecosystem mapper with whale intelligence and Ecoscore rankings
6. **Alerts**: Telegram and Email notifications
7. **Backtest**: Historical strategy simulation framework
8. **Web**: Next.js dashboard for monitoring and analysis

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) API keys for live data sources

### Step 1: Clone and Configure

```bash
cd ghostquant-crypto
cp .env.example .env
```

Edit `.env` and fill in any API keys you have (optional - system works with mock data):

```bash
# Optional: Add your keys for live data
BINANCE_API_KEY=your_key_here
BYBIT_API_KEY=your_key_here
RPC_ETH_MAINNET=your_rpc_url_here
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

**Note**: If you leave keys blank, the system will use mock/synthetic data generators to demonstrate functionality.

### Step 2: Start All Services

```bash
docker compose up --build
```

This will start:
- TimescaleDB (port 5432)
- Redis (port 6379)
- API (port 8080)
- AlphaBrain (port 8081)
- Ecoscan (port 8082)
- Web (port 3000)
- Ingest, Signals, and Alerts services

### Step 3: Access the Platform

- **Web Dashboard**: http://localhost:3000
- **AlphaBrain Dashboard**: http://localhost:3000/alphabrain
- **Ecoscan Dashboard**: http://localhost:3000/ecoscan
- **IQ Meter Dashboard**: http://localhost:3000/iqmeter
- **API Health**: http://localhost:8080/health
- **API Docs**: http://localhost:8080/docs
- **AlphaBrain API**: http://localhost:8081/alphabrain/summary
- **Ecoscan API**: http://localhost:8082/ecoscan/summary
- **Learning Metrics API**: http://localhost:8080/metrics/learning

### Step 4: Wait for Data

The system needs 3-5 minutes to:
1. Ingest initial market data
2. Compute factors
3. Generate signals

Refresh the dashboard to see signals appear.

## API Endpoints

### Health Check
```bash
curl http://localhost:8080/health
```

### Get Assets
```bash
curl http://localhost:8080/assets
```

### Get Latest Signals
```bash
curl http://localhost:8080/signals/latest?limit=100
```

### Get Asset Signals
```bash
curl http://localhost:8080/signals/asset/ETH?limit=200
```

### Get Asset Factors
```bash
curl http://localhost:8080/factors/asset/BTC?limit=1000
```

### Get Learning Metrics
```bash
curl http://localhost:8080/metrics/learning
```

Returns GhostQuant's learning confidence, signal accuracy, reward rate, and training iterations.

### AlphaBrain Endpoints

```bash
# Get comprehensive AlphaBrain summary
curl http://localhost:8081/alphabrain/summary

# Get macro regime analysis
curl http://localhost:8081/alphabrain/regime

# Get portfolio recommendation
curl http://localhost:8081/alphabrain/portfolio

# Get actionable suggestions
curl http://localhost:8081/alphabrain/suggestions

# Get institutional playbook analysis
curl http://localhost:8081/alphabrain/playbooks

# Get factor analysis
curl http://localhost:8081/alphabrain/factors

# Get narrative analysis
curl http://localhost:8081/alphabrain/narrative
```

### Ecoscan Endpoints

```bash
# Get comprehensive Ecoscan summary
curl http://localhost:8082/ecoscan/summary

# Get top ecosystems by EMI
curl http://localhost:8082/ecoscan/ecosystems?limit=10

# Get whale activity heatmap
curl http://localhost:8082/ecoscan/whales?lookback_hours=24

# Get Ecoscore rankings
curl http://localhost:8082/ecoscan/ecoscore?limit=10&min_ecoscore=50

# Get whale transaction alerts
curl http://localhost:8082/ecoscan/alerts?lookback_hours=24&min_value_usd=10000000

# Get smart money clusters
curl http://localhost:8082/ecoscan/smartmoney

# Get ecosystem detail
curl http://localhost:8082/ecoscan/ecosystem/arbitrum

# Get whale detail for asset
curl http://localhost:8082/ecoscan/whale/ETH?lookback_hours=24
```

## Running Backtests

### Using Docker

```bash
docker compose exec api bash
cd /app
python -m backtest.run --strategy trend_v1 --asset ETH --start 2024-01-01 --end 2024-06-01 --synthetic
```

### Locally (if you have the environment set up)

```bash
cd backtest
poetry install
poetry run python -m backtest.run --strategy trend_v1 --asset ETH --start 2024-01-01 --end 2024-06-01 --synthetic
```

Results will be saved to `artifacts/` directory.

## Database Access

Connect to the TimescaleDB instance:

```bash
psql postgresql://ghost:ghostpass@localhost:5432/ghostquant
```

Example queries:

```sql
-- View recent signals
SELECT a.symbol, s.ts, s.trend_score, s.action 
FROM signals s 
JOIN assets a ON s.asset_id = a.asset_id 
ORDER BY s.ts DESC 
LIMIT 10;

-- View recent factors
SELECT a.symbol, f.ts, f.mom_1h, f.mom_24h, f.vol_regime 
FROM factors f 
JOIN assets a ON f.asset_id = a.asset_id 
ORDER BY f.ts DESC 
LIMIT 10;
```

## Adding New Assets

1. Connect to the database:
```bash
docker compose exec postgres psql -U ghost -d ghostquant
```

2. Insert new asset:
```sql
INSERT INTO assets (symbol, chain, address, sector, risk_tags) 
VALUES ('AVAX', 'avalanche', NULL, 'Layer1', ARRAY['mid-cap', 'liquid']);
```

3. Update ingestion configuration to include the new symbol in `ingest/src/ingest/run.py`

## Adding New Venues

To add a new exchange or data source:

1. Create a new adapter in `ingest/src/ingest/adapters/`
2. Implement the adapter interface with `start()` method
3. Add the adapter to the orchestrator in `ingest/src/ingest/run.py`
4. Update environment variables in `.env.example`

## Configuration

### TrendScore Weights

Edit `signals/src/signals/config.py` to adjust factor weights:

```python
TREND_SCORE_WEIGHTS = {
    'mom_1h': 0.15,
    'mom_24h': 0.20,
    'accel_1h': 0.10,
    # ... etc
}
```

### Action Thresholds

Adjust signal action thresholds in `signals/src/signals/config.py`:

```python
ACTION_THRESHOLDS = {
    'buy_trend_score': 70,
    'buy_pretrend_prob': 0.6,
    'trim_trend_score': 60,
    'exit_trend_score': 40
}
```

## Troubleshooting

### Database Connection Issues

If services can't connect to the database:

```bash
# Check database is running
docker compose ps postgres

# View database logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### WebSocket Reconnection Issues

Ingestion service automatically reconnects with exponential backoff. Check logs:

```bash
docker compose logs ingest
```

### No Signals Appearing

1. Check that ingestion is running: `docker compose logs ingest`
2. Verify data is being written: `docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*) FROM ticks;"`
3. Check signals service: `docker compose logs signals`

### Web App Not Loading

1. Check API is accessible: `curl http://localhost:8080/health`
2. Check web service logs: `docker compose logs web`
3. Verify NEXT_PUBLIC_API_BASE is set correctly in `.env`

## Safety & Compliance

- **Research Only**: This platform does NOT execute trades or place orders
- **No Trading Permissions**: Use read-only API keys where possible
- **Local Deployment**: Do not expose ports publicly without proper security
- **Secrets Management**: Never commit `.env` files or hard-code credentials

## Testing

### Smoke Tests

Run the smoke test script to verify all critical endpoints:

```bash
# Test locally (services must be running)
./scripts/smoke_test.sh

# Test on droplet
API_BASE=http://159.89.178.196:8080 \
ALPHABRAIN_BASE=http://159.89.178.196:8081 \
ECOSCAN_BASE=http://159.89.178.196:8082 \
WEB_BASE=http://159.89.178.196:3000 \
./scripts/smoke_test.sh
```

The smoke test verifies:
- Health endpoints for all services
- Core API endpoints (assets, signals, market data)
- Dashboard endpoints (top-movers with various limits)
- AlphaBrain endpoints (summary, regime, portfolio)
- Ecoscan endpoints (summary, whale alerts, bridge flows)

### Manual Testing

```bash
# Verify assets DB has many coins
docker exec -it ghostquant-db psql -U ghost -d ghostquant -c "SELECT COUNT(*) FROM assets;"

# Test top-movers endpoint
curl http://localhost:8080/dashboard/top-movers?limit=100 | jq '.[0:5]'

# Test AlphaBrain summary
curl http://localhost:8081/alphabrain/summary | jq .

# Test Ecoscan summary
curl http://localhost:8082/ecoscan/summary | jq .

# Check all services are healthy
docker compose ps
```

### Unit Tests

```bash
# API tests
cd api
poetry run pytest

# Signals tests
cd signals
poetry run pytest

# AlphaBrain tests
cd alphabrain
poetry run pytest

# Ecoscan tests
cd ecoscan
poetry run pytest
```

## Roadmap

Future enhancements:

- [x] **Phase 7**: AlphaBrain institutional quant intelligence (COMPLETED)
- [x] **Phase 8**: Ecoscan ecosystem mapper + whale intelligence (COMPLETED)
- [x] **Phase 10**: AI Insight Panel + IQ Meter Dashboard (COMPLETED)
- [ ] Sentiment analysis from social media and news
- [ ] Portfolio optimizer with risk constraints
- [ ] Multi-timeframe signal aggregation
- [ ] Advanced slippage models
- [ ] Real-time strategy parameter optimization
- [ ] Mobile app for alerts
- [ ] GeoJSON smart money mapping (country-level)

## Documentation

- [Ingestion Runbook](docs/RUNBOOK_INGEST.md)
- [Signals Runbook](docs/RUNBOOK_SIGNALS.md)
- [AlphaBrain Runbook](docs/RUNBOOK_ALPHABRAIN.md)
- [Ecoscan Runbook](docs/RUNBOOK_ECOSCAN.md)
- [Alerts Runbook](docs/RUNBOOK_ALERTS.md)

## License

Private research platform - not for redistribution.

## Support

For issues or questions, refer to the runbooks in the `docs/` directory.

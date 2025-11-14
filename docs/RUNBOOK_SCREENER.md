# Native Coin Momentum Screener - Operations Runbook

## Overview

The Native Coin Momentum Screener is a comprehensive momentum analysis system that provides real-time scoring and filtering of cryptocurrency assets using a 9-feature composite momentum score.

**Version**: MVP (Phase 1)  
**Last Updated**: 2025-11-14

## Architecture

### Components

1. **CompositeScorer** (`api/app/services/composite_scorer.py`)
   - Computes 9-feature composite momentum scores
   - Provides explainability with top features and risk flags
   - Supports mock data mode for testing

2. **ScreenerWorker** (`api/app/services/screener_worker.py`)
   - Background worker that fetches coins from CoinGecko
   - Computes scores in batches
   - Caches results in Redis for fast API responses
   - Runs fast refresh (30s) and full refresh (5min) loops

3. **LiquidityEngine** (`api/app/services/liquidity_engine.py`)
   - Analyzes orderbook data for liquidity metrics
   - Estimates slippage for trade sizing
   - Provides fallback heuristics when orderbook data unavailable

4. **API Endpoints** (`api/app/routers/screener.py`)
   - `GET /screener/list` - Paginated screener results
   - `GET /screener/top_coins` - Filtered watchlist
   - `GET /screener/:symbol` - Detailed coin analysis
   - `GET /screener/momentum` - Legacy endpoint (backward compatible)

5. **Web UI** (`web/src/app/screener/page.tsx`)
   - Responsive design (mobile cards, desktop table)
   - Top Coins watchlist widget
   - Detail panel with score breakdown
   - Search and pagination

## Configuration

### Environment Variables

```bash
# CoinGecko API
COINGECKO_BASE=https://pro-api.coingecko.com/api/v3
COINGECKO_PRO_API_KEY=your_api_key_here
PRIMARY_EXCHANGE=coinbasepro

# Screener Configuration
MIN_MARKET_CAP=1000000
DEFAULT_MIN_SCORE=75
USE_MOCK_DATA=false

# Refresh Intervals
MOMENTUM_FAST_REFRESH_SECONDS=30
MOMENTUM_FULL_REFRESH_SECONDS=300
MOMENTUM_TOP_N_FAST=100

# Composite Scorer Weights (optional)
COMPOSITE_W_SHORT_RETURN=0.15
COMPOSITE_W_MED_RETURN=0.15
COMPOSITE_W_LONG_RETURN=0.10
COMPOSITE_W_VOL_RATIO=0.10
COMPOSITE_W_ORDERBOOK=0.10
COMPOSITE_W_LIQUIDITY=0.15
COMPOSITE_W_ONCHAIN=0.10
COMPOSITE_W_CROSS_EXCHANGE=0.10
COMPOSITE_W_PRETREND=0.05
```

### Feature Flags

- `USE_MOCK_DATA=true` - Enable mock data generation (no API keys required)
- `USE_MOCK_MARKET_DATA=true` - Use mock CoinGecko data

## Operations

### Starting the Service

```bash
cd /home/ubuntu/ghostquant-crypto

# Start all services
docker compose up -d

# Check logs
docker compose logs -f api

# Verify screener worker started
docker compose logs api | grep "ScreenerWorker"
```

### Monitoring

#### Check Worker Status

```bash
# View worker logs
docker compose logs -f api | grep -E "(ScreenerWorker|Fast refresh|Full refresh)"

# Expected output:
# ScreenerWorker initialized: fast_refresh=30s, full_refresh=300s
# Fast refresh: updating top 100 coins
# Fast refresh complete: 100 coins updated
# Full refresh: updating entire coin universe
# Full refresh complete: 2500 coins updated in 45.2s
```

#### Check Redis Cache

```bash
# Connect to Redis
docker compose exec redis redis-cli

# Check scored coins cache
KEYS scored:*

# Get sample coin data
GET scored:coin:bitcoin

# Check exchange count cache
KEYS exchange_count:*
```

#### API Health Checks

```bash
# Test screener list endpoint
curl http://localhost:8080/screener/list?limit=10 | jq .

# Test top coins endpoint
curl http://localhost:8080/screener/top_coins?limit=5 | jq .

# Test coin detail endpoint
curl http://localhost:8080/screener/BTC | jq .
```

### Testing

#### Unit Tests

```bash
cd /home/ubuntu/ghostquant-crypto/api

# Run composite scorer tests
pytest tests/test_composite_scorer.py -v

# Run all tests
pytest tests/ -v
```

#### Manual Testing Checklist

1. **API Smoke Tests**:
   ```bash
   # Top coins
   curl "http://localhost:8080/screener/top_coins?limit=5" | jq .
   
   # List with filters
   curl "http://localhost:8080/screener/list?limit=20&min_score=70" | jq .
   
   # Single symbol
   curl "http://localhost:8080/screener/BTC" | jq .
   ```

2. **UI Checks**:
   - Open http://localhost:3000/screener
   - Verify Top Coins widget displays
   - Test search functionality
   - Test pagination
   - Click coin to open detail panel
   - Test responsive layout (resize browser)
   - Export CSV from Top Coins widget

3. **Mobile Testing**:
   - Open in mobile viewport (≤768px)
   - Verify card layout renders
   - Test touch interactions
   - Verify buttons are thumb-sized (≥44px)

### Troubleshooting

#### No Coins Showing

**Symptom**: Empty results from `/screener/list`

**Diagnosis**:
```bash
# Check if worker is running
docker compose logs api | grep ScreenerWorker

# Check Redis cache
docker compose exec redis redis-cli
KEYS scored:*
```

**Solutions**:
1. Restart API service: `docker compose restart api`
2. Wait for initial refresh (30-60 seconds)
3. Check CoinGecko API key is valid
4. Enable mock data: `USE_MOCK_DATA=true`

#### Rate Limit Errors

**Symptom**: `429 Too Many Requests` in logs

**Diagnosis**:
```bash
docker compose logs api | grep "429"
```

**Solutions**:
1. Increase `COINGECKO_RETRY_BACKOFF_SECONDS`
2. Reduce `MOMENTUM_TOP_N_FAST`
3. Increase `MOMENTUM_FULL_REFRESH_SECONDS`
4. Upgrade to CoinGecko Pro API

#### Low Confidence Scores

**Symptom**: All coins have confidence < 50%

**Diagnosis**:
- Check for missing features in logs
- Verify orderbook data availability
- Check on-chain data sources

**Solutions**:
1. This is expected in MVP (Phase 2 will add more data sources)
2. Risk flags indicate which features are missing
3. Liquidity estimates are heuristic-based

#### Worker Not Refreshing

**Symptom**: Timestamp not updating

**Diagnosis**:
```bash
# Check worker is running
docker compose ps api

# Check for errors
docker compose logs api | grep -E "(error|Error|ERROR)"
```

**Solutions**:
1. Restart API: `docker compose restart api`
2. Check database connectivity
3. Check Redis connectivity
4. Review worker logs for exceptions

### Performance Tuning

#### Optimize Refresh Intervals

For high-traffic scenarios:
```bash
# Faster updates, more API calls
MOMENTUM_FAST_REFRESH_SECONDS=15
MOMENTUM_FULL_REFRESH_SECONDS=180

# Slower updates, fewer API calls
MOMENTUM_FAST_REFRESH_SECONDS=60
MOMENTUM_FULL_REFRESH_SECONDS=600
```

#### Limit Coin Universe

To reduce API calls and improve performance:
```bash
# Only track top 500 coins
MOMENTUM_TOP_N_FAST=500

# Reduce full refresh scope (edit screener_worker.py)
max_pages = 2  # 500 coins instead of 2500
```

#### Redis Memory Management

```bash
# Check Redis memory usage
docker compose exec redis redis-cli INFO memory

# Set TTL on cached data (already configured)
# scored:list:* → 60s
# scored:coin:* → 300s
# exchange_count:* → 900s
```

## Phase 2 Features (Planned)

The following features are planned for Phase 2:

1. **Whale Events Tracking**
   - Real-time whale transaction detection
   - TX links to blockchain explorers
   - Whale leaderboard with impact scores

2. **Slippage & Pair Suggestions**
   - Cross-exchange orderbook comparison
   - Real-time slippage estimation
   - Best execution venue recommendation

3. **Sector Momentum Heatmap**
   - Sector-level aggregation
   - Click-to-filter by sector
   - Sector rotation analysis

4. **Trader Notes**
   - Per-symbol notes and tags
   - Mobile sync
   - Collaborative annotations

## API Reference

### GET /screener/list

Paginated screener results with composite momentum scores.

**Parameters**:
- `page` (int, default=1): Page number
- `limit` (int, default=50, max=250): Results per page
- `min_score` (float, optional): Filter by minimum score
- `search` (string, optional): Search by symbol or name

**Response**:
```json
{
  "page": 1,
  "limit": 50,
  "total": 2500,
  "total_pages": 50,
  "results": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "score": 85.5,
      "confidence": 92.0,
      "top_features": [...],
      "risk_flags": [],
      "why": "Strong 24h return: +5.2%; High liquidity: $500M; Listed on 8 exchanges",
      ...
    }
  ],
  "timestamp": "2025-11-14T19:28:00Z"
}
```

### GET /screener/top_coins

Top coins watchlist with multi-condition filtering.

**Parameters**:
- `limit` (int, default=10, max=50): Number of results
- `min_score` (float, optional): Override default minimum score

**Filters Applied**:
- score >= DEFAULT_MIN_SCORE (default 75)
- liquidity_score >= 70
- cross_exchange_count >= 2
- market_cap >= MIN_MARKET_CAP (default $1M)

**Response**:
```json
{
  "count": 10,
  "results": [...],
  "filters": {
    "min_score": 75,
    "min_liquidity_score": 70,
    "min_cross_exchange_count": 2,
    "min_market_cap": 1000000
  },
  "timestamp": "2025-11-14T19:28:00Z"
}
```

### GET /screener/:symbol

Detailed analysis for a specific coin.

**Response**:
```json
{
  "symbol": "BTC",
  "score": 85.5,
  "confidence": 92.0,
  "top_features": [...],
  "explain": {
    "formula": "weighted_sum(normalized_features)",
    "score_raw": 0.855,
    "all_contributions": [...]
  },
  "suggested_pair": {
    "exchange": "coinbasepro",
    "pair": "BTC-USD"
  }
}
```

## Support

For issues or questions:
1. Check logs: `docker compose logs -f api`
2. Review this runbook
3. Check GitHub issues
4. Contact: klove144@bellsouth.net

## Changelog

### 2025-11-14 - MVP Release
- Initial release with 9-feature composite scoring
- CoinGecko integration for full coin universe
- Top Coins watchlist with filtering
- Responsive UI with mobile support
- Background worker with Redis caching
- Mock data mode for testing

# GhostQuant Momentum Screener - Operations Runbook

## Overview

The Momentum Screener is a production-grade, real-time cryptocurrency momentum analysis system that provides comprehensive scoring, whale intelligence fusion, PreTrend integration, clustering, backtesting, and alerts for the full CoinGecko universe (2500+ coins).

## Architecture

### Backend Services (FastAPI)

1. **Market Router** (`api/app/routers/market.py`)
   - 7 REST endpoints for momentum data, coin details, rank changes, alerts, clusters, and backtesting
   - Integrated with all core services

2. **Core Services** (`api/app/services/`)
   - `coingecko_client.py` - CoinGecko API wrapper with rate limiting and retry logic
   - `redis_cache.py` - Redis caching layer for momentum scores and coin data
   - `momentum_scorer.py` - Scoring engine with 6 sub-scores (price_momentum, volume_spike, rsi_signal, ma_cross, pretrend_bonus, whale_bonus)
   - `whale_fusion.py` - Ecoscan whale intelligence integration
   - `pretrend_fusion.py` - AlphaBrain PreTrend probability integration
   - `rank_tracker.py` - Rank change tracking over time
   - `clustering_engine.py` - K-means clustering for coin grouping
   - `backtest_engine.py` - Historical backtesting framework
   - `alert_manager.py` - Email/Telegram/Push notification system

3. **Background Worker** (`api/app/services/momentum_worker.py`)
   - Fast refresh: Every 30s for top 100 coins
   - Full refresh: Every 5 minutes for entire universe (2500+ coins)
   - Clustering: Every hour
   - Alert checking: After each refresh

4. **WebSocket Server** (`api/app/services/websocket_server.py`)
   - Real-time momentum updates broadcast to connected clients
   - Subscription channels: "top50", "symbol:BTC", "all"
   - Heartbeat every 30 seconds

### Frontend (Next.js)

1. **Momentum Page** (`web/src/app/momentum/page.tsx`)
   - Full-featured momentum screener with search, filters, pagination
   - Real-time WebSocket updates
   - Whale-only filter, market cap filter, sorting options
   - Clusters view toggle

2. **Components** (`web/src/components/`)
   - `MomentumCard.tsx` - Individual coin card with momentum score, sub-scores, sparkline
   - `BuyModal.tsx` - Detailed coin analysis and alert creation modal
   - `RankChangeFeed.tsx` - Side widget showing biggest rank movers
   - `ClustersPanel.tsx` - Coin clusters grouped by behavior
   - `WhaleBadge` - Integrated into MomentumCard for whale indicators

3. **Hooks** (`web/src/hooks/`)
   - `useWebSocket.ts` - WebSocket connection management with auto-reconnect

## Configuration

### Environment Variables

All configuration is in `.env.example`. Key variables:

#### CoinGecko
```bash
COINGECKO_API_BASE=https://api.coingecko.com/api/v3
COINGECKO_PRO_API_KEY=  # Optional, for higher rate limits
```

#### Momentum Screener
```bash
MOMENTUM_CACHE_TTL=60  # Cache TTL in seconds
MOMENTUM_PAGE_SIZE=50  # Results per page
MOMENTUM_FAST_REFRESH_SECONDS=30  # Fast refresh interval
MOMENTUM_FULL_REFRESH_SECONDS=300  # Full refresh interval
MOMENTUM_TOP_N_FAST=100  # Number of coins in fast refresh
```

#### Scoring Weights
```bash
PRICE_MOMENTUM_WEIGHT=0.30  # 30 points max
VOLUME_SPIKE_WEIGHT=0.25    # 25 points max
RSI_SIGNAL_WEIGHT=0.20      # 20 points max
MA_CROSS_WEIGHT=0.15        # 15 points max
PRETREND_WEIGHT=0.30        # 3 points max bonus
WHALER_WEIGHT=0.25          # 2.5 points max bonus
```

#### Whale Detection
```bash
WHALE_CONFIDENCE_THRESHOLD=0.6  # Minimum confidence for whale badge
WHALE_MIN_USD=100000  # Minimum transfer size for whale detection
```

#### Alerts
```bash
ALERT_EMAIL_FROM=no-reply@ghostquant.local
ALERT_RATE_LIMIT_MINUTES=15  # Prevent alert spam
ENABLE_EMAIL_ALERTS=true
ENABLE_TELEGRAM_ALERTS=true
ENABLE_PUSH_ALERTS=false

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Telegram Configuration
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

#### Real-time Streaming
```bash
USE_WEBSOCKETS=true
WEBSOCKET_PORT=8083  # Not used (WebSocket on same port as API)
WEBSOCKET_HEARTBEAT_SECONDS=30
ENABLE_REALTIME=true
```

#### Clustering
```bash
CLUSTERING_ENABLED=true
CLUSTERING_METHOD=kmeans
CLUSTERING_N_CLUSTERS=8
CLUSTERING_UPDATE_INTERVAL=3600  # Seconds
```

#### Backtesting
```bash
ENABLE_BACKTEST_HOOK=true
BACKTEST_DEFAULT_THRESHOLD=70  # Entry threshold
BACKTEST_HOLD_HOURS=24  # Hold period
```

#### Rate Limiting & Safety
```bash
COINGECKO_RATE_LIMIT_PER_MINUTE=50
COINGECKO_RETRY_MAX_ATTEMPTS=3
COINGECKO_RETRY_BACKOFF_SECONDS=5
```

#### Feature Flags
```bash
USE_MOCK_MARKET_DATA=false  # Use mock data for testing
ENABLE_RANK_CHANGE_FEED=true
ENABLE_AUTO_CLUSTERING=true
```

## API Endpoints

### Market Data

#### GET /market/coins
Get paginated list of all coins from CoinGecko.

**Query Parameters:**
- `page` (int, default=1): Page number
- `per_page` (int, default=250, max=250): Results per page

**Response:**
```json
{
  "page": 1,
  "per_page": 250,
  "total": 250,
  "coins": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://...",
      "current_price": 50000,
      "market_cap": 1000000000000,
      "market_cap_rank": 1
    }
  ],
  "timestamp": "2025-11-14T00:00:00Z"
}
```

#### GET /market/momentum
Get paginated momentum screener results with full scoring.

**Query Parameters:**
- `page` (int, default=1): Page number
- `per_page` (int, default=50, max=100): Results per page
- `sort` (string, default="momentum_score"): Sort field
- `min_marketcap` (float, optional): Minimum market cap filter
- `whale_only` (bool, default=false): Show only whale movers
- `cluster_id` (int, optional): Filter by cluster ID

**Response:**
```json
{
  "page": 1,
  "per_page": 50,
  "total": 2500,
  "total_pages": 50,
  "results": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://...",
      "current_price": 50000,
      "market_cap": 1000000000000,
      "market_cap_rank": 1,
      "total_volume": 50000000000,
      "price_change_percentage_1h": 2.5,
      "price_change_percentage_24h": 5.0,
      "price_change_percentage_7d": 10.0,
      "momentum_score": 85.3,
      "sub_scores": {
        "price_momentum": 28.5,
        "volume_spike": 22.0,
        "rsi_signal": 18.0,
        "ma_cross": 12.0,
        "pretrend_bonus": 2.5,
        "whale_bonus": 2.3
      },
      "whale_confidence": 0.92,
      "pretrend_prob": 0.83,
      "sparkline_7d": [50000, 50100, ...],
      "action": "BUY",
      "confidence": 0.9,
      "cluster_id": 0,
      "cluster_label": "High Momentum Leaders"
    }
  ],
  "timestamp": "2025-11-14T00:00:00Z",
  "stale": false
}
```

#### GET /market/coin/{coin_id}
Get detailed momentum analysis for a specific coin.

**Response:**
```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "momentum_score": 85.3,
  "sub_scores": {...},
  "whale_confidence": 0.92,
  "pretrend_prob": 0.83,
  "action": "BUY",
  "confidence": 0.9,
  "explain": {
    "formula": "base_score + pretrend_bonus + whale_bonus",
    "base_score": 80.5,
    "components": {
      "price_momentum": {
        "score": 28.5,
        "weight": 0.30,
        "max_points": 30,
        "raw_value": 5.2,
        "description": "1h: 2.5%, 24h: 5.0%, 7d: 10.0%"
      },
      ...
    },
    "top_drivers": [
      {"name": "Price Momentum", "score": 28.5, "max": 30},
      {"name": "Volume Spike", "score": 22.0, "max": 25},
      {"name": "RSI Signal", "score": 18.0, "max": 20}
    ]
  },
  "whale_details": {
    "total_transfers": 15,
    "total_usd": 5000000,
    "unique_wallets": 8,
    "top_transfers": [...],
    "flow_pattern": "accumulation"
  },
  "pretrend_details": {
    "pretrend_prob": 0.83,
    "confidence": 0.75,
    "factors": {...},
    "rationale": "..."
  },
  "rank_history": [
    {"timestamp": 1699920000, "rank": 1, "momentum_score": 85.3},
    ...
  ]
}
```

#### GET /market/rank-changes
Get coins with biggest rank changes in specified time window.

**Query Parameters:**
- `since` (string, default="15m"): Time window ("15m", "1h", "24h")
- `limit` (int, default=25, max=100): Number of results

**Response:**
```json
{
  "since": "15m",
  "minutes": 15,
  "total": 25,
  "changes": [
    {
      "id": "ethereum",
      "symbol": "eth",
      "name": "Ethereum",
      "current_rank": 2,
      "previous_rank": 5,
      "rank_delta": -3,
      "momentum_score": 82.5,
      "timestamp": "2025-11-14T00:00:00Z"
    }
  ],
  "timestamp": "2025-11-14T00:00:00Z"
}
```

### Alerts

#### POST /market/alerts
Create a new alert for a coin.

**Request Body:**
```json
{
  "user_contact": "user@example.com",
  "symbol": "BTC",
  "alert_type": "score_above",
  "threshold": 80.0,
  "channels": ["email", "telegram"]
}
```

**Alert Types:**
- `score_above` - Momentum score reaches threshold
- `score_below` - Momentum score drops below threshold
- `price_above` - Price reaches threshold
- `price_below` - Price drops below threshold
- `whale_seen` - Whale confidence reaches threshold
- `pretrend_above` - PreTrend probability reaches threshold

**Response:**
```json
{
  "alert_id": "uuid",
  "status": "created",
  "message": "Alert created for BTC (score_above 80.0)"
}
```

### Clustering

#### GET /market/clusters
Get auto-generated coin clusters.

**Response:**
```json
{
  "total_clusters": 8,
  "clusters": [
    {
      "cluster_id": 0,
      "label": "High Momentum Leaders",
      "coin_count": 125,
      "avg_momentum": 78.5,
      "top_coins": ["BTC", "ETH", "SOL", "BNB", "ADA"]
    }
  ],
  "timestamp": "2025-11-14T00:00:00Z"
}
```

### Backtesting

#### POST /market/backtest
Run a backtest for the momentum strategy.

**Request Body:**
```json
{
  "strategy": "momentum",
  "symbol": "BTC",
  "start_date": "2024-01-01",
  "end_date": "2024-06-01",
  "threshold": 70.0,
  "hold_hours": 24
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "queued",
  "metrics": null,
  "trades": null
}
```

#### GET /market/backtest/{job_id}
Get backtest results by job ID.

**Response:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "metrics": {
    "total_return": 15.5,
    "sharpe": 1.2,
    "max_drawdown": 8.3,
    "win_rate": 62.5,
    "trade_count": 24,
    "final_equity": 1.155
  },
  "trades": [
    {
      "entry_time": "2024-01-15T10:00:00Z",
      "exit_time": "2024-01-16T10:00:00Z",
      "entry_price": 50000,
      "exit_price": 52000,
      "pnl_pct": 4.0,
      "reason": "take_profit"
    }
  ]
}
```

## WebSocket Protocol

### Connection
Connect to: `ws://localhost:8080/ws/momentum`

### Subscription
Send subscription message:
```json
{
  "action": "subscribe",
  "channels": ["top50", "symbol:BTC"]
}
```

### Messages

#### Top Update
```json
{
  "type": "top_update",
  "timestamp": "2025-11-14T00:00:00Z",
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "momentum_score": 85.3,
      "delta": 2.1,
      "action": "BUY",
      "whale_confidence": 0.92,
      "pretrend_prob": 0.83
    }
  ]
}
```

#### Heartbeat
```json
{
  "type": "heartbeat",
  "timestamp": "2025-11-14T00:00:00Z"
}
```

## Monitoring

### Metrics (Redis)
The system tracks metrics in Redis:
- `ghostquant:metrics:fast_refresh_count` - Number of fast refreshes
- `ghostquant:metrics:full_refresh_count` - Number of full refreshes
- `ghostquant:metrics:clustering_count` - Number of clustering runs
- `ghostquant:metrics:fast_refresh_errors` - Fast refresh errors
- `ghostquant:metrics:full_refresh_errors` - Full refresh errors
- `ghostquant:metrics:clustering_errors` - Clustering errors

### Logs
All services log to stdout with structured logging:
- `INFO` - Normal operations
- `WARNING` - Rate limits, cache misses, retries
- `ERROR` - Failures, exceptions

## Troubleshooting

### Issue: No coins showing in momentum screener
**Cause:** Background worker not running or Redis cache empty
**Solution:**
1. Check API logs for worker startup messages
2. Verify Redis is running: `docker compose ps redis`
3. Check Redis for scored coins: `redis-cli ZCARD ghostquant:momentum:latest`
4. Manually trigger refresh by restarting API service

### Issue: WebSocket not connecting
**Cause:** WebSocket endpoint not accessible or CORS issues
**Solution:**
1. Verify API is running: `curl http://localhost:8080/health`
2. Check browser console for WebSocket errors
3. Verify CORS middleware is configured in `api/app/main.py`
4. Test WebSocket with: `wscat -c ws://localhost:8080/ws/momentum`

### Issue: Alerts not sending
**Cause:** SMTP/Telegram not configured or rate limited
**Solution:**
1. Verify alert configuration in `.env`
2. Check API logs for alert trigger messages
3. Test SMTP connection manually
4. Verify Telegram bot token and chat ID
5. Check alert rate limit (default 15 minutes)

### Issue: Momentum scores all neutral (50)
**Cause:** CoinGecko API rate limited or mock data enabled
**Solution:**
1. Check `USE_MOCK_MARKET_DATA` flag in `.env`
2. Verify CoinGecko API key if using Pro tier
3. Check API logs for rate limit warnings
4. Reduce refresh frequency if hitting rate limits

### Issue: Clustering not working
**Cause:** Insufficient coins or clustering disabled
**Solution:**
1. Verify `CLUSTERING_ENABLED=true` in `.env`
2. Check minimum coins requirement (8 coins for 8 clusters)
3. Verify scikit-learn is installed: `poetry show scikit-learn`
4. Check API logs for clustering errors

## Performance Tuning

### Rate Limiting
Adjust CoinGecko rate limits based on your tier:
- Free tier: 50 calls/minute
- Pro tier: 500 calls/minute

```bash
COINGECKO_RATE_LIMIT_PER_MINUTE=50  # Adjust based on tier
```

### Refresh Intervals
Balance freshness vs API usage:
```bash
MOMENTUM_FAST_REFRESH_SECONDS=30  # Increase to reduce API calls
MOMENTUM_FULL_REFRESH_SECONDS=300  # Increase for larger universes
MOMENTUM_TOP_N_FAST=100  # Reduce to decrease API calls
```

### Caching
Adjust cache TTL based on refresh frequency:
```bash
MOMENTUM_CACHE_TTL=60  # Should be >= fast refresh interval
```

### Clustering
Reduce clustering frequency for better performance:
```bash
CLUSTERING_UPDATE_INTERVAL=3600  # Increase to reduce CPU usage
CLUSTERING_N_CLUSTERS=8  # Reduce for faster clustering
```

## Deployment

### Docker Compose
The momentum screener is integrated into the existing GhostQuant docker-compose setup:

```bash
# Build with new dependencies
docker compose build --no-cache api

# Start all services
docker compose up -d

# Check logs
docker compose logs -f api

# Verify worker is running
docker compose logs api | grep "Starting momentum worker"
```

### Production Checklist
- [ ] Set `USE_MOCK_MARKET_DATA=false`
- [ ] Configure CoinGecko API key for higher rate limits
- [ ] Set up SMTP for email alerts
- [ ] Configure Telegram bot for alerts
- [ ] Set appropriate refresh intervals
- [ ] Enable Prometheus metrics (if available)
- [ ] Set up Sentry for error tracking (if available)
- [ ] Configure Redis persistence
- [ ] Set up monitoring for worker health
- [ ] Test WebSocket connectivity
- [ ] Verify alert delivery

## Future Enhancements

1. **Prometheus Metrics** - Add detailed metrics for monitoring
2. **Sentry Integration** - Error tracking and alerting
3. **Database Persistence** - Store historical momentum scores in TimescaleDB
4. **Advanced Backtesting** - Multi-asset portfolio backtesting
5. **Machine Learning** - Train models on historical momentum data
6. **Mobile App** - Native mobile app with push notifications
7. **API Rate Limiting** - Implement rate limiting for public API
8. **User Accounts** - Multi-user support with personalized alerts
9. **Advanced Clustering** - HDBSCAN for density-based clustering
10. **Sentiment Analysis** - Integrate social media sentiment

## Support

For issues or questions:
- Check logs: `docker compose logs -f api`
- Review this runbook
- Check GitHub issues: https://github.com/aldric144/ghostquant-crypto/issues
- Contact: klove144@bellsouth.net

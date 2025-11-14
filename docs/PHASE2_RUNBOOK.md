# Phase 2 Runbook: Whale Intelligence, Slippage, Heatmap & Notes

## Overview

Phase 2 adds advanced intelligence features to the GhostQuant screener:

1. **Whale Events + Leaderboard** - Track large transactions and whale activity
2. **Liquidity & Slippage Estimator** - Estimate trading costs and suggest best pairs
3. **Sector/Momentum Heatmap** - Visualize momentum by sector
4. **Trader Notes** - Persistent notes and watchlists

All features are behind feature flags and have mock fallbacks for QA testing.

## Feature Flags

Enable features via environment variables in `.env`:

```bash
# Phase 2 Feature Flags
FEATURE_WHALES=true
FEATURE_LIQ_ESTIMATOR=true
FEATURE_HEATMAP=true
FEATURE_NOTES=true
```

**Default**: All features are `false` in production until explicitly enabled.

## Feature 1: Whale Events + Leaderboard

### Configuration

```bash
# Whale Intelligence
WHALE_PROVIDER=alchemy              # Options: alchemy, quicknode, etherscan
WHALE_PROVIDER_KEY=your_api_key    # Provider API key
WHALER_MOCK=true                    # Use mock data (true/false)
WHALE_MIN_USD=100000                # Minimum transaction size to track
```

### API Endpoints

#### Get Recent Whale Events

```bash
GET /whales/recent?limit=50
```

**Response:**
```json
{
  "events": [
    {
      "tx_hash": "0x1234...",
      "chain": "ethereum",
      "symbol": "ETH",
      "amount_usd": 5420000,
      "from": "0xabcd...1234",
      "to": "0xef12...5678",
      "time": "2025-11-14T20:30:00Z",
      "type": "transfer",
      "explorer_url": "https://etherscan.io/tx/0x1234..."
    }
  ],
  "count": 5,
  "limit": 50
}
```

#### Get Whale Leaderboard

```bash
GET /whales/leaderboard?since=24h
```

**Parameters:**
- `since`: Time period (24h, 7d, 30d)

**Response:**
```json
{
  "leaderboard": [
    {
      "address": "0xabcd...1234",
      "impact_score": 95.4,
      "usd_volume": 45200000,
      "events": 12,
      "last_seen": "2025-11-14T20:30:00Z"
    }
  ],
  "count": 4,
  "since": "24h",
  "since_hours": 24
}
```

**Impact Score Formula:**
```
impact_score = normalized(usd_volume) * recency_decay * address_recurrence_weight
```

### Caching

- **TTL**: 60 seconds
- **Cache Keys**: `whales:recent:{limit}`, `whales:leaderboard:{since}`

### Testing

```bash
# Enable feature
export FEATURE_WHALES=true
export WHALER_MOCK=true

# Test recent events
curl http://localhost:8080/whales/recent?limit=10

# Test leaderboard
curl http://localhost:8080/whales/leaderboard?since=24h
```

### Provider Integration

**Mock Provider** (default):
- Loads data from `mock_data/phase2_sample.json`
- Returns 5 sample whale events
- No API key required

**Etherscan Provider**:
- Set `WHALE_PROVIDER=etherscan`
- Requires `WHALE_PROVIDER_KEY`
- TODO: Full implementation pending

**Alchemy Provider**:
- Set `WHALE_PROVIDER=alchemy`
- Requires `WHALE_PROVIDER_KEY`
- TODO: Full implementation pending

## Feature 2: Liquidity & Slippage Estimator

### Configuration

```bash
# Liquidity & Slippage
LIQ_MOCK=true                       # Use mock data (true/false)
EXCHANGE_API_KEYS_JSON=             # Optional encrypted JSON for exchanges
```

### API Endpoints

#### Get Market Liquidity

```bash
GET /liquidity/market?symbol=BTC&size_usd=10000
```

**Parameters:**
- `symbol`: Trading symbol (BTC, ETH, SOL, etc.)
- `size_usd`: Trade size in USD (optional, default: 10000)

**Response:**
```json
{
  "symbol": "BTC",
  "depth_at_0_5": 12500000,
  "depth_at_1_0": 28000000,
  "est_slippage_pct": 0.08,
  "best_pair": {
    "exchange": "Coinbase",
    "pair": "BTC/USD"
  },
  "size_usd": 10000,
  "data_source": "mock"
}
```

### Slippage Calculation

The estimator calculates slippage based on:
- Trade size relative to market depth
- Orderbook spread
- Historical volatility

**Formula:**
```
slippage = base_spread + (size_usd / depth) * impact_factor
```

### Caching

- **TTL**: 30 seconds
- **Cache Keys**: `market:liquidity:{symbol}:{size_usd}`

### Testing

```bash
# Enable feature
export FEATURE_LIQ_ESTIMATOR=true
export LIQ_MOCK=true

# Test BTC liquidity
curl "http://localhost:8080/liquidity/market?symbol=BTC&size_usd=10000"

# Test ETH with larger size
curl "http://localhost:8080/liquidity/market?symbol=ETH&size_usd=100000"

# Test SOL
curl "http://localhost:8080/liquidity/market?symbol=SOL&size_usd=5000"
```

### Mock Data

Mock liquidity data includes:
- **BTC**: Deep liquidity, low slippage (0.08% for $10k)
- **ETH**: Good liquidity, moderate slippage (0.12% for $10k)
- **SOL**: Lower liquidity, higher slippage (0.25% for $10k)

## Feature 3: Sector/Momentum Heatmap

### Configuration

```bash
# Sector Heatmap
SECTOR_MAPPING_SOURCE=local         # Options: local, coingecko
```

### Sectors

8 sectors are tracked:
- **L1**: Layer 1 blockchains (Bitcoin, Ethereum, Solana)
- **L2**: Layer 2 scaling solutions (Polygon, Arbitrum, Optimism)
- **DeFi**: Decentralized finance (Uniswap, Aave, Compound)
- **Oracles**: Data oracles (Chainlink, Band Protocol)
- **Stablecoins**: Stable assets (USDT, USDC, DAI)
- **CeFi**: Centralized finance (BNB, CRO)
- **NFT**: NFT platforms
- **Tokens**: Other tokens

### API Endpoints

#### Get Sector Heatmap

```bash
GET /heatmap/sector?period=24h
```

**Parameters:**
- `period`: Time period (24h, 7d, 30d)

**Response:**
```json
{
  "sectors": [
    {
      "sector": "DeFi",
      "momentum_avg": 72.3,
      "n_assets": 24,
      "color": "#3b82f6"
    },
    {
      "sector": "L1",
      "momentum_avg": 68.5,
      "n_assets": 12,
      "color": "#10b981"
    }
  ],
  "period": "24h",
  "count": 8
}
```

#### Get All Sectors

```bash
GET /heatmap/sectors
```

**Response:**
```json
{
  "sectors": ["L1", "L2", "DeFi", "Oracles", "Stablecoins", "CeFi", "NFT", "Tokens"],
  "count": 8,
  "mapping_source": "local"
}
```

#### Get Coins by Sector

```bash
GET /heatmap/sector/DeFi/coins
```

**Response:**
```json
{
  "sector": "DeFi",
  "coins": ["uniswap", "aave", "compound"],
  "count": 3
}
```

### Caching

- **TTL**: 60 seconds
- **Cache Keys**: `heatmap:sector:{period}`

### Testing

```bash
# Enable feature
export FEATURE_HEATMAP=true
export SECTOR_MAPPING_SOURCE=local

# Test sector heatmap
curl http://localhost:8080/heatmap/sector?period=24h

# Test sector list
curl http://localhost:8080/heatmap/sectors

# Test coins in DeFi sector
curl http://localhost:8080/heatmap/sector/DeFi/coins
```

### Sector Mapping

**Local Mapping** (default):
- Loads from `mock_data/phase2_sample.json`
- Manually curated sector assignments
- Fast and reliable

**CoinGecko Mapping**:
- Set `SECTOR_MAPPING_SOURCE=coingecko`
- Uses CoinGecko category API
- Requires API key
- TODO: Full implementation pending

## Feature 4: Trader Notes

### Configuration

```bash
# Trader Notes
FEATURE_NOTES=true
```

### Database Schema

```sql
CREATE TABLE trader_notes (
    note_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    note TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);
```

### API Endpoints

#### Create/Update Note

```bash
POST /notes
Content-Type: application/json
X-Device-Id: device_abc123

{
  "symbol": "BTC",
  "note": "Strong momentum, watching for breakout above $95k",
  "tags": ["bullish", "breakout"]
}
```

**Response:**
```json
{
  "note_id": 1,
  "user_id": "device_abc123",
  "symbol": "BTC",
  "note": "Strong momentum, watching for breakout above $95k",
  "tags": ["bullish", "breakout"],
  "created_at": "2025-11-14T15:30:00Z",
  "updated_at": "2025-11-14T15:30:00Z"
}
```

#### Get Notes

```bash
GET /notes?user=me&symbol=BTC
X-Device-Id: device_abc123
```

**Parameters:**
- `user`: User ID or "me" for current user
- `symbol`: Optional symbol filter

**Response:**
```json
[
  {
    "note_id": 1,
    "user_id": "device_abc123",
    "symbol": "BTC",
    "note": "Strong momentum, watching for breakout above $95k",
    "tags": ["bullish", "breakout"],
    "created_at": "2025-11-14T15:30:00Z",
    "updated_at": "2025-11-14T15:30:00Z"
  }
]
```

#### Delete Note

```bash
DELETE /notes/1
X-Device-Id: device_abc123
```

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### User Identity

Notes use device-based identity:
- Client sends `X-Device-Id` header
- Server uses this as `user_id`
- Same device ID = same notes across sessions
- No authentication required for MVP

### Testing

```bash
# Enable feature
export FEATURE_NOTES=true

# Create note
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: test_device_123" \
  -d '{"symbol": "BTC", "note": "Test note", "tags": ["test"]}'

# Get notes
curl http://localhost:8080/notes?user=me \
  -H "X-Device-Id: test_device_123"

# Get notes for specific symbol
curl "http://localhost:8080/notes?user=me&symbol=BTC" \
  -H "X-Device-Id: test_device_123"

# Delete note
curl -X DELETE http://localhost:8080/notes/1 \
  -H "X-Device-Id: test_device_123"
```

## Troubleshooting

### Feature Not Available (501 Error)

**Problem:** API returns `501 Not Implemented`

**Solution:** Enable the feature flag:
```bash
# In .env
FEATURE_WHALES=true
FEATURE_LIQ_ESTIMATOR=true
FEATURE_HEATMAP=true
FEATURE_NOTES=true
```

### Cache Issues

**Problem:** Stale data being returned

**Solution:** Clear Redis cache:
```bash
# Clear all whale caches
redis-cli KEYS "whales:*" | xargs redis-cli DEL

# Clear all liquidity caches
redis-cli KEYS "market:liquidity:*" | xargs redis-cli DEL

# Clear all heatmap caches
redis-cli KEYS "heatmap:*" | xargs redis-cli DEL
```

### Database Connection Errors

**Problem:** Notes endpoints fail with database errors

**Solution:** Run Phase 2 schema migration:
```bash
docker compose exec postgres psql -U ghost -d ghostquant -f /docker-entrypoint-initdb.d/02_phase2_schema.sql
```

### Mock Data Not Loading

**Problem:** Endpoints return empty data

**Solution:** Verify mock data file exists:
```bash
ls -la mock_data/phase2_sample.json
```

If missing, the file should be in the repository at `mock_data/phase2_sample.json`.

## Performance Considerations

### Caching Strategy

- **Whale Events**: 60s TTL (balance between freshness and load)
- **Liquidity Data**: 30s TTL (more frequent updates for trading)
- **Sector Heatmap**: 60s TTL (aggregated data changes slowly)
- **Notes**: No caching (always fresh from database)

### Rate Limiting

When using live providers:
- Respect provider rate limits
- Implement exponential backoff
- Fall back to mock data on errors

### Database Indexes

Notes table has indexes on:
- `user_id` - Fast user lookups
- `symbol` - Fast symbol filtering
- `created_at DESC` - Efficient sorting

## Security

### API Keys

- **Never** expose provider API keys to frontend
- Store in environment variables
- Use encrypted JSON for multiple exchange keys

### User Identity

- Device IDs are not authenticated
- Suitable for MVP/demo
- TODO: Integrate with proper auth system

### Input Validation

- All endpoints validate input parameters
- SQL injection protection via parameterized queries
- XSS protection via JSON responses

## Monitoring

### Health Checks

Check feature availability:
```bash
curl http://localhost:8080/health
```

### Logs

Monitor feature usage:
```bash
# Whale events
docker compose logs api | grep "whale"

# Liquidity
docker compose logs api | grep "liquidity"

# Heatmap
docker compose logs api | grep "heatmap"

# Notes
docker compose logs api | grep "notes"
```

### Metrics

Key metrics to track:
- Cache hit rate
- API response times
- Feature flag usage
- Error rates by feature

## Rollback

To disable a feature:

1. Set feature flag to `false` in `.env`
2. Restart API service:
   ```bash
   docker compose restart api
   ```

3. Feature endpoints will return 501 immediately

No data loss - all data remains in database/cache.

## Next Steps

### Production Deployment

1. Enable features one at a time
2. Monitor error rates and performance
3. Gradually increase traffic
4. Collect user feedback

### Future Enhancements

- **Whale Events**: Integrate live Alchemy/Etherscan providers
- **Liquidity**: Add CCXT for multi-exchange support
- **Heatmap**: Integrate CoinGecko categories
- **Notes**: Add proper authentication and sharing

## Support

For issues or questions:
- Check logs: `docker compose logs api`
- Review this runbook
- Check API docs: http://localhost:8080/docs

# Signals Service Runbook

## Overview

The Signals service computes factors from raw market data and generates TrendScore/Pre-Trend signals with actionable recommendations (BUY/TRIM/EXIT/HOLD).

## Architecture

```
┌─────────────────┐
│  TimescaleDB    │
│  (Raw Data)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Scheduler      │
│  (60s cycle)    │
└────────┬────────┘
         │
┌────────▼────────┐
│  Factors        │
│  Computation    │
└────────┬────────┘
         │
┌────────▼────────┐
│  TrendScore &   │
│  Pre-Trend      │
└────────┬────────┘
         │
┌────────▼────────┐
│  Action         │
│  Determination  │
└────────┬────────┘
         │
┌────────▼────────┐
│  Write to DB    │
│  (signals table)│
└─────────────────┘
```

## Configuration

### Environment Variables

```bash
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ghostquant
POSTGRES_USER=ghost
POSTGRES_PASSWORD=ghostpass
REDIS_URL=redis://redis:6379/0
```

### Factor Weights

Edit `signals/src/signals/config.py`:

```python
TREND_SCORE_WEIGHTS = {
    'mom_1h': 0.15,      # 1-hour momentum
    'mom_24h': 0.20,     # 24-hour momentum
    'accel_1h': 0.10,    # Momentum acceleration
    'vol_regime': 0.05,  # Volatility regime
    'volume_z': 0.10,    # Volume z-score
    'funding_flip': 0.10,# Funding rate flip
    'oi_shift': 0.10,    # Open interest shift
    'tvl_accel': 0.10,   # TVL acceleration
    'flow_score': 0.10   # On-chain flow score
}
```

### Action Thresholds

```python
ACTION_THRESHOLDS = {
    'buy_trend_score': 70,        # TrendScore >= 70 for BUY
    'buy_pretrend_prob': 0.6,     # Pre-Trend >= 60% for BUY
    'trim_trend_score': 60,       # TrendScore < 60 for TRIM
    'exit_trend_score': 40        # TrendScore <= 40 for EXIT
}
```

### Pre-Trend Coefficients

```python
PRETREND_COEFFICIENTS = {
    'intercept': 0.5,
    'mom_1h': 0.3,
    'mom_24h': 0.2,
    'accel_1h': 0.15,
    'volume_z': 0.1,
    'funding_flip': 0.05,
    'oi_shift': 0.1,
    'tvl_accel': 0.05,
    'flow_score': 0.05
}
```

## Starting the Service

### Using Docker Compose

```bash
docker compose up signals
```

### Standalone (for development)

```bash
cd signals
poetry install
poetry run python -m signals.scheduler
```

## Monitoring

### View Logs

```bash
# Docker
docker compose logs -f signals

# Look for these log messages:
# - "Processing X assets"
# - "Computed factors for BTC"
# - "Generated signal for ETH: BUY (score=75.3)"
```

### Check Signal Generation

```bash
# Connect to database
docker compose exec postgres psql -U ghost -d ghostquant

# Check recent signals
SELECT a.symbol, s.ts, s.trend_score, s.pretrend_prob, s.action, s.confidence
FROM signals s
JOIN assets a ON s.asset_id = a.asset_id
ORDER BY s.ts DESC
LIMIT 10;

# Check recent factors
SELECT a.symbol, f.ts, f.mom_1h, f.mom_24h, f.vol_regime
FROM factors f
JOIN assets a ON f.asset_id = a.asset_id
ORDER BY f.ts DESC
LIMIT 10;
```

### Performance Metrics

```sql
-- Signal distribution
SELECT action, COUNT(*) as count
FROM signals
WHERE ts >= NOW() - INTERVAL '24 hours'
GROUP BY action
ORDER BY count DESC;

-- Average TrendScore by asset
SELECT a.symbol, AVG(s.trend_score) as avg_score
FROM signals s
JOIN assets a ON s.asset_id = a.asset_id
WHERE s.ts >= NOW() - INTERVAL '24 hours'
GROUP BY a.symbol
ORDER BY avg_score DESC;

-- High confidence signals
SELECT a.symbol, s.ts, s.action, s.trend_score, s.confidence
FROM signals s
JOIN assets a ON s.asset_id = a.asset_id
WHERE s.confidence > 0.7
  AND s.ts >= NOW() - INTERVAL '24 hours'
ORDER BY s.ts DESC;
```

## Factors Explained

### Momentum Factors

**MOM_1H**: 1-hour price momentum
- Calculation: (current_price - price_1h_ago) / price_1h_ago * 100
- Range: -10% to +10% (normalized)
- Interpretation: Positive = uptrend, Negative = downtrend

**MOM_24H**: 24-hour price momentum
- Calculation: (current_price - price_24h_ago) / price_24h_ago * 100
- Range: -50% to +50% (normalized)
- Interpretation: Longer-term trend direction

**ACCEL_1H**: Momentum acceleration
- Calculation: d(MOM_1H)/dt
- Range: -5% to +5% (normalized)
- Interpretation: Positive = accelerating uptrend

### Volatility Factors

**VOL_REGIME**: Volatility regime indicator
- Calculation: ATR(14) / current_price
- Range: 0 to 0.1 (normalized, inverted)
- Interpretation: Higher = more stable (inverted for scoring)

### Volume Factors

**VOLUME_Z**: Volume z-score
- Calculation: (current_volume - mean_30d) / std_30d
- Range: -3 to +3 (normalized)
- Interpretation: Positive = above-average volume

**DEPTH_DELTA**: Order book depth imbalance
- Calculation: (bid_depth - ask_depth) / total_depth
- Range: -1 to +1
- Interpretation: Positive = more bid support

### Derivatives Factors

**FUNDING_FLIP**: Funding rate direction change
- Calculation: Boolean (prev_funding * curr_funding < 0)
- Interpretation: True = potential trend reversal

**OI_SHIFT**: Open interest change
- Calculation: (current_oi - prev_oi) / prev_oi * 100
- Range: -20% to +20% (normalized)
- Interpretation: Positive = increasing leverage

### On-Chain Factors

**TVL_ACCEL**: TVL acceleration (DEX pools)
- Calculation: d²(TVL)/dt²
- Interpretation: Positive = increasing liquidity

**FLOW_SCORE**: On-chain flow sentiment
- Calculation: Weighted sum of exchange/whale/defi flows
- Interpretation: Positive = accumulation, Negative = distribution

## Signal Actions

### BUY

**Conditions**:
- TrendScore >= 70
- Pre-Trend >= 60%

**Interpretation**: Strong uptrend with high probability of continuation

**Recommended Action**: Consider adding to position

### TRIM

**Conditions**:
- TrendScore < 60
- Funding flip OR OI shift < -10%

**Interpretation**: Weakening trend with hostile derivatives

**Recommended Action**: Consider reducing position size

### EXIT

**Conditions**:
- TrendScore <= 40

**Interpretation**: Trend has reversed or entered mean-revert regime

**Recommended Action**: Consider closing position

### HOLD

**Conditions**: None of the above

**Interpretation**: No strong signal

**Recommended Action**: Maintain current position

## Troubleshooting

### No Signals Being Generated

**Symptom**: `signals` table remains empty

**Solution**:
1. Check service is running: `docker compose ps signals`
2. View logs: `docker compose logs signals`
3. Verify factors are being computed: `SELECT COUNT(*) FROM factors;`
4. Check for errors in factor computation
5. Verify sufficient historical data exists (need at least 24h of ticks)

### All Signals Show HOLD

**Symptom**: No actionable signals

**Solution**:
1. Check TrendScore distribution: `SELECT AVG(trend_score) FROM signals;`
2. Adjust thresholds in `config.py` if needed
3. Verify factors are being computed correctly
4. Check if using mock data (may have low variance)

### Factors Show NULL Values

**Symptom**: Many NULL values in factors table

**Solution**:
1. Check sufficient historical data exists
2. Verify ingestion service is running
3. Check lookback periods in `factors.py`
4. Increase data collection time before expecting valid factors

### High CPU Usage

**Symptom**: Service consuming excessive CPU

**Solution**:
1. Increase scheduler interval in `scheduler.py`:
   ```python
   self.interval = 120  # Increase from 60
   ```
2. Reduce number of assets being processed
3. Optimize factor calculations

### Inconsistent Signals

**Symptom**: Signals flip frequently between actions

**Solution**:
1. Add signal smoothing/filtering
2. Increase confidence threshold
3. Adjust factor weights to reduce noise
4. Implement signal persistence (require N consecutive signals)

## Tuning Guide

### Increasing Sensitivity

To generate more BUY/EXIT signals:

```python
ACTION_THRESHOLDS = {
    'buy_trend_score': 60,   # Lower from 70
    'buy_pretrend_prob': 0.5, # Lower from 0.6
    'exit_trend_score': 50    # Raise from 40
}
```

### Decreasing Sensitivity

To generate fewer signals (higher quality):

```python
ACTION_THRESHOLDS = {
    'buy_trend_score': 80,   # Raise from 70
    'buy_pretrend_prob': 0.7, # Raise from 0.6
    'exit_trend_score': 30    # Lower from 40
}
```

### Emphasizing Momentum

```python
TREND_SCORE_WEIGHTS = {
    'mom_1h': 0.25,      # Increase from 0.15
    'mom_24h': 0.30,     # Increase from 0.20
    'accel_1h': 0.15,    # Increase from 0.10
    # ... reduce others proportionally
}
```

### Emphasizing Derivatives

```python
TREND_SCORE_WEIGHTS = {
    'funding_flip': 0.20, # Increase from 0.10
    'oi_shift': 0.20,     # Increase from 0.10
    # ... reduce others proportionally
}
```

## Data Quality Checks

### Check Factor Coverage

```sql
-- Factors with NULL values
SELECT 
    COUNT(*) FILTER (WHERE mom_1h IS NULL) as null_mom_1h,
    COUNT(*) FILTER (WHERE mom_24h IS NULL) as null_mom_24h,
    COUNT(*) FILTER (WHERE vol_regime IS NULL) as null_vol_regime
FROM factors
WHERE ts >= NOW() - INTERVAL '1 hour';
```

### Check Signal Quality

```sql
-- Signals with low confidence
SELECT a.symbol, s.ts, s.action, s.confidence
FROM signals s
JOIN assets a ON s.asset_id = a.asset_id
WHERE s.confidence < 0.3
  AND s.ts >= NOW() - INTERVAL '24 hours'
ORDER BY s.confidence ASC;
```

## Maintenance

### Clearing Old Data

```sql
-- Keep only last 30 days
DELETE FROM factors WHERE ts < NOW() - INTERVAL '30 days';
DELETE FROM signals WHERE ts < NOW() - INTERVAL '30 days';
```

### Recomputing Signals

To recompute signals for a specific period:

1. Delete existing signals:
```sql
DELETE FROM signals WHERE ts >= '2024-01-01' AND ts < '2024-02-01';
DELETE FROM factors WHERE ts >= '2024-01-01' AND ts < '2024-02-01';
```

2. Restart signals service (will recompute from available data)

## Alerts

Set up monitoring alerts for:

- No signals generated for > 10 minutes
- All signals showing HOLD for > 1 hour
- High percentage of NULL factors (> 20%)
- Service not running
- Database connection errors

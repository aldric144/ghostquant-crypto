# AlphaBrain Quant Intelligence - Operations Runbook

## Overview

AlphaBrain is GhostQuant's institutional-grade quant intelligence module that transforms the platform from a data scientist's lab into a mini-hedge-fund brain. It provides:

- **Macro & Regime Sentiment Engine**: Classifies global risk regime using DXY, yields, VIX
- **Factor Model Layer**: Multi-asset Smart Beta with momentum, value, carry, size, volatility
- **Adaptive Risk & Kelly Sizing**: Correlation-aware position sizing with volatility targeting
- **Institutional Playbook Simulator**: Tiger Global, Bridgewater, Renaissance, Citadel strategies
- **Alpha Fusion Layer**: Reinforcement learning-based signal weighting
- **Narrative & News Context**: LLM embeddings for macro sentiment analysis
- **Harvard Finance Analytics**: Sharpe, Sortino, Beta, alpha, investor letters

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AlphaBrain Service                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐           │
│  │ MacroRegimeDetector│    │  FactorModel     │           │
│  │ - VIX, DXY, Yields│    │  - Momentum      │           │
│  │ - Risk On/Off     │    │  - Value, Carry  │           │
│  └────────┬─────────┘      └────────┬─────────┘           │
│           │                         │                       │
│           └─────────┬───────────────┘                       │
│                     │                                       │
│           ┌─────────▼──────────┐                           │
│           │   RiskAllocator    │                           │
│           │   - Kelly Sizing   │                           │
│           │   - Correlation    │                           │
│           └─────────┬──────────┘                           │
│                     │                                       │
│     ┌───────────────┼───────────────┐                      │
│     │               │               │                      │
│  ┌──▼───────┐  ┌───▼────────┐  ┌──▼─────────┐           │
│  │Playbooks │  │AlphaFusion │  │ Narrative  │           │
│  │Simulator │  │   Agent    │  │ Analyzer   │           │
│  └──────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────┐             │
│  │      Harvard Analytics Suite              │             │
│  │  - Sharpe, Sortino, Calmar               │             │
│  │  - Beta, Alpha, Information Ratio        │             │
│  │  - PDF Report Generator                  │             │
│  └──────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Service Configuration

### Environment Variables

```bash
# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ghostquant
POSTGRES_USER=ghost
POSTGRES_PASSWORD=ghostpass

# Redis
REDIS_URL=redis://redis:6379/0

# Macro Data
USE_MOCK_MACRO_DATA=true  # Set to false for real macro data

# Factor Model
FACTOR_LOOKBACK_DAYS=90
FACTOR_REBALANCE_HOURS=24

# Risk Parameters
VOLATILITY_TARGET=0.15      # 15% annual volatility target
KELLY_FRACTION=0.25         # Conservative Kelly (25%)
MAX_POSITION_SIZE=0.20      # 20% max per asset
MAX_CORRELATION_THRESHOLD=0.80

# Alpha Fusion
ALPHA_LEARNING_RATE=0.01
ALPHA_DISCOUNT_FACTOR=0.95
ALPHA_EXPLORATION_RATE=0.10

# Regime Thresholds
VIX_RISK_ON_THRESHOLD=20.0
VIX_RISK_OFF_THRESHOLD=30.0
DXY_STRONG_THRESHOLD=105.0
YIELD_CURVE_INVERSION_THRESHOLD=-0.5

# Reports
REPORT_OUTPUT_DIR=/app/reports
GENERATE_WEEKLY_REPORTS=true

# Narrative Analysis (optional)
ENABLE_NARRATIVE_ANALYSIS=false
NARRATIVE_API_KEY=
```

### Starting the Service

```bash
# Via Docker Compose (recommended)
docker compose up alphabrain

# Standalone (for development)
cd alphabrain
poetry install
poetry run python -m uvicorn alphabrain.api:app --host 0.0.0.0 --port 8081
```

## API Endpoints

### Health Check

```bash
curl http://localhost:8081/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "alphabrain",
  "timestamp": "2024-11-07T06:00:00"
}
```

### Get Summary

Complete AlphaBrain summary with all components.

```bash
curl http://localhost:8081/alphabrain/summary
```

**Response:**
```json
{
  "service": "AlphaBrain",
  "version": "0.1.0",
  "timestamp": "2024-11-07T06:00:00",
  "regime": {
    "regime": "risk_on",
    "confidence": 0.75,
    "exposure_multiplier": 1.2,
    "macro_data": {
      "vix": 18.5,
      "dxy": 103.2,
      "yield_spread": 0.6,
      "spy_momentum": 0.03
    },
    "interpretation": "Risk-on environment..."
  },
  "portfolio": {
    "weights": {"BTC": 0.25, "ETH": 0.20, "SOL": 0.15},
    "metrics": {
      "expected_return": 0.35,
      "volatility": 0.45,
      "sharpe": 0.78
    },
    "top_picks": [...]
  },
  "playbook_recommendation": {...},
  "narrative": {...}
}
```

### Get Macro Regime

Current macro regime analysis.

```bash
curl http://localhost:8081/alphabrain/regime
```

### Get Portfolio Recommendation

Portfolio weights and metrics.

```bash
curl http://localhost:8081/alphabrain/portfolio
```

### Get Actionable Suggestions

Investment suggestions with buy/sell recommendations.

```bash
curl http://localhost:8081/alphabrain/suggestions
```

**Response:**
```json
{
  "timestamp": "2024-11-07T06:00:00",
  "regime_context": {
    "regime": "risk_on",
    "confidence": 0.75,
    "interpretation": "..."
  },
  "recommended_strategy": "citadel_multistrat",
  "top_picks": [...],
  "actions": [
    {
      "symbol": "BTC",
      "action": "BUY",
      "target_weight": 0.25,
      "rationale": "Strong factor scores...",
      "confidence": "HIGH"
    }
  ],
  "warnings": []
}
```

### Get Institutional Playbooks

Results from all playbook strategies.

```bash
curl http://localhost:8081/alphabrain/playbooks
```

### Get Factor Analysis

Factor exposures and Smart Beta scores.

```bash
curl http://localhost:8081/alphabrain/factors
```

### Get Narrative Analysis

Market narrative and sentiment analysis.

```bash
curl http://localhost:8081/alphabrain/narrative
```

## Components Deep Dive

### 1. Macro Regime Detector

**Purpose**: Classify global risk environment to inform exposure levels.

**Indicators**:
- **VIX**: Volatility index (fear gauge)
  - < 20: Risk-on
  - 20-30: Elevated
  - > 30: Risk-off
  - > 40: Crisis
- **DXY**: US Dollar Index (safe haven)
  - > 105: Strong dollar = risk-off
- **Yield Curve**: 10Y-2Y spread
  - < -0.5%: Inversion = recession warning
- **SPY Momentum**: S&P 500 trend

**Regime Classifications**:
- **Risk-On**: VIX < 20, positive equity momentum → 1.2x exposure
- **Neutral**: Mixed signals → 1.0x exposure
- **Risk-Off**: VIX > 30, strong dollar → 0.5x exposure
- **Crisis**: VIX > 40, extreme fear → 0.2x exposure

**Tuning**:
Edit `alphabrain/src/alphabrain/models/macro_regime.py`:
```python
self.vix_risk_on = 20.0  # Adjust thresholds
self.vix_risk_off = 30.0
self.dxy_strong = 105.0
```

### 2. Factor Model

**Purpose**: Compute multi-factor scores for Smart Beta portfolio construction.

**Factors**:
1. **Momentum (1M, 3M, 6M)**: Price trends with recency bias
2. **Value**: Price vs MA, funding rates (mean reversion)
3. **Carry**: Funding rates + staking yields
4. **Size**: Market cap (small-cap premium with liquidity filter)
5. **Volatility**: Realized vol (low-vol anomaly)
6. **Liquidity**: Volume/MCap ratio, spreads

**Smart Beta Score**:
```
Score = w1*MOM + w2*VALUE + w3*CARRY + w4*SIZE + w5*VOL + w6*LIQ
```

Weights optimized via ridge regression on historical returns.

**Tuning**:
Edit `alphabrain/src/alphabrain/config.py`:
```python
FACTOR_LOOKBACK_DAYS = 90  # Historical data window
FACTOR_REBALANCE_HOURS = 24  # Rebalance frequency
```

### 3. Risk Allocator

**Purpose**: Size positions using Kelly criterion with correlation adjustments.

**Kelly Formula**:
```
w = Σ^(-1) * μ
```
Where:
- Σ = Covariance matrix
- μ = Expected returns
- w = Optimal weights

**Adjustments**:
1. **Kelly Fraction**: Use 25% of full Kelly (conservative)
2. **Volatility Targeting**: Scale to 15% annual vol
3. **Correlation Adjustment**: Reduce exposure when correlation > 0.80
4. **Position Limits**: Max 20% per asset

**Tuning**:
```python
VOLATILITY_TARGET = 0.15  # 15% annual vol
KELLY_FRACTION = 0.25  # Conservative Kelly
MAX_POSITION_SIZE = 0.20  # 20% max
MAX_CORRELATION_THRESHOLD = 0.80
```

### 4. Institutional Playbooks

**Purpose**: Simulate elite hedge fund strategies.

**Strategies**:

**Tiger Global (Momentum)**:
- 70% momentum, 30% size (growth)
- Top 5 assets, concentrated
- High conviction, high turnover

**Bridgewater (Balance)**:
- Risk parity: equal risk contribution
- 60% inverse vol, 40% carry
- Top 10 assets, diversified

**Renaissance (Mean Reversion)**:
- Value + negative momentum (contrarian)
- Top 15 assets, many small bets
- Statistical edge over conviction

**Citadel (Multi-Strategy)**:
- 35% momentum, 25% value, 25% carry, 15% liquidity
- Top 8 assets, balanced
- Dynamic factor allocation

**Usage**:
Playbooks run automatically and recommend strategy based on regime:
- Risk-on + aggressive → Tiger Momentum
- Risk-on + moderate → Citadel Multi-Strat
- Risk-off → Bridgewater Balance

### 5. Alpha Fusion

**Purpose**: Learn optimal signal weighting using reinforcement learning.

**Q-Learning**:
- **State**: (regime, signal_cluster, volatility_regime)
- **Action**: Signal weighting strategy
- **Reward**: Risk-adjusted return - drawdown penalty - tail risk

**Signal Sources**:
1. GhostQuant TrendScore
2. Factor Momentum
3. Factor Value
4. Factor Carry
5. Macro Regime
6. Institutional Playbook

**Actions**:
- Equal weight
- Momentum heavy (35%)
- Value heavy (35%)
- Macro heavy (35%)
- Playbook heavy (40%)
- Adaptive blend (performance-based)

**Learning**:
Agent learns which signal combinations work best in different regimes.

### 6. Narrative Analyzer

**Purpose**: Analyze market narratives and sentiment.

**Categories**:
- Macro Policy (Fed, regulations)
- Institutional (ETF approvals, adoption)
- DeFi Innovation (protocol launches)
- Security Events (hacks, exploits)
- Market Structure (derivatives, ETFs)
- Technology (upgrades, forks)
- Sentiment Shifts

**Sentiment Scoring**:
- Bullish keywords: adoption, institutional, ETF, upgrade
- Bearish keywords: hack, exploit, regulation, ban
- Impact score: 0-1 based on content and source

**Correlation with On-Chain**:
Detects alignment/divergence between narrative and on-chain metrics.

### 7. Harvard Analytics

**Purpose**: Institutional-grade performance metrics.

**Metrics**:
- **Sharpe Ratio**: (Return - Rf) / Volatility
- **Sortino Ratio**: (Return - Rf) / Downside Deviation
- **Calmar Ratio**: CAGR / Max Drawdown
- **Beta**: Covariance with benchmark / Benchmark variance
- **Alpha**: Excess return vs benchmark (Jensen's Alpha)
- **Information Ratio**: Active return / Tracking error
- **CVaR**: Conditional Value at Risk (tail risk)
- **Win Rate**: % of positive returns
- **Profit Factor**: Gross profit / Gross loss

**Investor Letters**:
Generate PDF reports with:
- Performance summary
- Market commentary
- Portfolio positioning
- Risk management
- Outlook

## Database Tables

### regime_history

Stores historical regime classifications.

```sql
SELECT * FROM regime_history
ORDER BY ts DESC
LIMIT 10;
```

### factor_scores

Stores factor exposures for each asset.

```sql
SELECT a.symbol, f.*
FROM factor_scores f
JOIN assets a ON f.asset_id = a.asset_id
WHERE f.ts >= NOW() - INTERVAL '1 day'
ORDER BY f.ts DESC;
```

### portfolio_allocations

Stores recommended portfolio weights.

```sql
SELECT a.symbol, p.weight, p.rationale
FROM portfolio_allocations p
JOIN assets a ON p.asset_id = a.asset_id
WHERE p.ts >= NOW() - INTERVAL '1 hour'
ORDER BY p.weight DESC;
```

### alphabrain_reports

Stores generated PDF reports.

```sql
SELECT report_id, report_type, ts, pdf_path
FROM alphabrain_reports
ORDER BY ts DESC
LIMIT 5;
```

## Monitoring

### Service Health

```bash
# Check service status
docker compose ps alphabrain

# View logs
docker compose logs -f alphabrain

# Check API health
curl http://localhost:8081/health
```

### Key Metrics to Monitor

1. **Regime Confidence**: Should be > 0.5 for reliable signals
2. **Portfolio Sharpe**: Target > 1.0 for good risk-adjusted returns
3. **Correlation**: Watch for spikes > 0.80 (flight to safety)
4. **Exposure Multiplier**: Tracks regime-based risk scaling

### Log Patterns

**Normal Operation**:
```
INFO - Regime classified: risk_on (confidence: 0.75)
INFO - Computed factor exposures for 3 assets
INFO - Portfolio allocation: BTC=0.25, ETH=0.20, SOL=0.15
```

**Warnings**:
```
WARNING - High correlation detected (0.85), reducing exposure to 70%
WARNING - Insufficient data for optimization, using equal weights
```

**Errors**:
```
ERROR - Error getting regime: Connection refused
ERROR - Failed to compute factor exposures: No price data
```

## Troubleshooting

### Issue: AlphaBrain service won't start

**Symptoms**: Container exits immediately

**Solutions**:
```bash
# Check logs
docker compose logs alphabrain

# Verify database connection
docker compose exec alphabrain python -c "import psycopg; psycopg.connect('postgresql://ghost:ghostpass@postgres:5432/ghostquant')"

# Rebuild container
docker compose build alphabrain
docker compose up alphabrain
```

### Issue: No factor exposures computed

**Symptoms**: Empty factor scores, API returns empty data

**Solutions**:
```bash
# Check if ticks data exists
docker compose exec postgres psql -U ghost -d ghostquant -c "SELECT COUNT(*) FROM ticks;"

# Verify ingest service is running
docker compose ps ingest

# Check factor lookback period
# Reduce FACTOR_LOOKBACK_DAYS if insufficient data
```

### Issue: Regime confidence always low

**Symptoms**: Confidence < 0.3, neutral regime

**Solutions**:
- Mock data may have low variance
- Adjust regime thresholds in config
- Check macro data fetching (if using real data)

### Issue: Portfolio weights all equal

**Symptoms**: All assets have same weight

**Solutions**:
- Insufficient historical data for optimization
- Check factor scores are being computed
- Verify signals service is running

## Best Practices

### 1. Regime-Based Trading

- **Risk-On**: Increase exposure, favor momentum
- **Risk-Off**: Reduce exposure, favor quality
- **Crisis**: Minimize exposure, preserve capital
- **Neutral**: Balanced approach, wait for clarity

### 2. Factor Diversification

- Don't rely on single factor
- Combine momentum + value + carry
- Monitor factor performance over time
- Rebalance when factors diverge

### 3. Risk Management

- Respect position limits (20% max)
- Monitor correlation spikes
- Use Kelly fraction (don't over-leverage)
- Target consistent volatility (15%)

### 4. Playbook Selection

- Match strategy to regime
- Consider risk tolerance
- Blend strategies for diversification
- Review playbook performance monthly

### 5. Narrative Integration

- Use narrative as confirmation, not primary signal
- Watch for narrative-onchain divergence
- Track funding catalysts
- Monitor sentiment shifts

## Advanced Configuration

### Custom Factor Weights

Edit `alphabrain/src/alphabrain/models/factor_model.py`:

```python
# In compute_smart_beta_scores()
weights = {
    'momentum_1m': 0.30,  # Increase momentum weight
    'value_score': 0.20,
    'carry_score': 0.15,
    'size_score': 0.10,
    'volatility_score': 0.15,
    'liquidity_score': 0.10
}
```

### Custom Playbook

Add to `alphabrain/src/alphabrain/playbooks/institutional.py`:

```python
def _custom_strategy(self, factor_scores, market_data):
    # Your custom logic
    weights = {}
    # ... compute weights ...
    return weights

# Register in __init__
self.strategies[PlaybookStrategy.CUSTOM] = self._custom_strategy
```

### Custom Regime Thresholds

Edit `alphabrain/src/alphabrain/config.py`:

```python
VIX_RISK_ON_THRESHOLD = 18.0  # More aggressive
VIX_RISK_OFF_THRESHOLD = 25.0  # Earlier risk-off
```

## Performance Optimization

### 1. Reduce Computation Frequency

```python
# In config.py
FACTOR_REBALANCE_HOURS = 24  # Recompute daily instead of hourly
```

### 2. Limit Asset Universe

```sql
-- Focus on top assets only
UPDATE assets SET active = false WHERE market_cap < 1e9;
```

### 3. Cache Results

Use Redis for caching:
```python
# Cache regime for 5 minutes
redis.setex('regime', 300, json.dumps(regime_data))
```

## Roadmap

### Phase 8 (Future)

- Real-time macro data integration (FRED, Yahoo Finance)
- LLM-based narrative analysis (GPT-4, Claude)
- Options Greeks and volatility surface
- Cross-asset correlations (crypto vs equities/FX)
- Automated report distribution (email, Slack)
- Portfolio optimization with constraints
- Transaction cost modeling
- Multi-period optimization

## Support

For issues or questions:
1. Check logs: `docker compose logs alphabrain`
2. Review this runbook
3. Check GitHub issues
4. Contact: support@ghostquant.local

## Summary

AlphaBrain transforms GhostQuant into an institutional-grade quant platform with:
- Systematic regime detection
- Multi-factor Smart Beta
- Adaptive risk management
- Elite hedge fund strategies
- Reinforcement learning
- Harvard-style analytics

Use it to make data-driven, risk-managed investment decisions with institutional-quality tools.

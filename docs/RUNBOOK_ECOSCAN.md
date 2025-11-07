# Ecoscan Runbook

**Phase 8: Ecosystem Mapper + Whale Intelligence**

Ecoscan transforms GhostQuant-Crypto into a Decentralized Discovery Engine that maps emerging ecosystems, tracks smart-money whale flows, and quantifies early opportunities across chains.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [API Endpoints](#api-endpoints)
5. [Core Metrics](#core-metrics)
6. [Dashboard Usage](#dashboard-usage)
7. [AlphaBrain Integration](#alphabrain-integration)
8. [Troubleshooting](#troubleshooting)
9. [Safety & Privacy](#safety--privacy)

---

## Overview

### What is Ecoscan?

Ecoscan is a cross-chain intelligence layer that:

- **Maps Emerging Ecosystems**: Tracks TVL, active wallets, volume, and bridge flows across 10+ chains
- **Monitors Whale Activity**: Identifies large transactions (>$250k) and computes whale confidence metrics
- **Clusters Smart Money**: Uses ML to identify accumulation, distribution, and dormant activation patterns
- **Ranks Opportunities**: Fuses ecosystem momentum, whale flows, and AlphaBrain signals into unified Ecoscores

### Key Components

1. **EcosystemMapper** - Cross-chain ecosystem metrics and EMI computation
2. **WhaleTracker** - Large wallet transaction monitoring and WCF computation
3. **SmartMoneyCluster** - K-Means clustering of wallet behavior patterns
4. **EcoscoreAggregator** - Signal fusion and opportunity ranking

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Ecoscan Service                      │
│                         (Port 8082)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Ecosystem   │  │    Whale     │  │  SmartMoney  │     │
│  │    Mapper    │  │   Tracker    │  │   Cluster    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                          │                                  │
│                  ┌───────▼────────┐                        │
│                  │   Ecoscore     │                        │
│                  │  Aggregator    │                        │
│                  └───────┬────────┘                        │
│                          │                                  │
│                  ┌───────▼────────┐                        │
│                  │   FastAPI      │                        │
│                  │   Endpoints    │                        │
│                  └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
   │   Web   │      │ AlphaBrain  │   │  Database   │
   │Dashboard│      │   Fusion    │   │ (TimescaleDB)│
   └─────────┘      └─────────────┘   └─────────────┘
```

### Supported Chains

- **EVM**: Ethereum, Arbitrum, Optimism, Polygon, Avalanche, BSC, Base
- **Non-EVM**: Solana, Cosmos, Osmosis

---

## Setup & Configuration

### Environment Variables

Add to `.env`:

```bash
# Ecoscan Configuration
USE_MOCK_ECOSCAN_DATA=true          # Use mock data (no external APIs)
ECOSCAN_UPDATE_INTERVAL=300         # Update interval in seconds (5 min)
MIN_WHALE_TX_USD=250000            # Minimum whale transaction threshold

# Optional: External API Keys (if not using mock data)
DEFILLAMA_API_KEY=                 # DeFiLlama API key
COINGECKO_API_KEY=                 # CoinGecko API key
```

### Database Tables

Ecoscan uses 3 TimescaleDB hypertables:

1. **ecosystems** - Ecosystem metrics and EMI scores
2. **whale_flows** - Large wallet transactions
3. **ecoscore_rankings** - Unified Ecoscore rankings

Tables are automatically created via `infra/initdb/02_ecoscan.sql`.

### Starting the Service

```bash
# Start all services including Ecoscan
docker compose up -d

# Check Ecoscan health
curl http://localhost:8082/health

# View Ecoscan logs
docker compose logs -f ecoscan
```

---

## API Endpoints

### Base URL

`http://localhost:8082`

### Endpoints

#### 1. Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "ecoscan",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 2. Comprehensive Summary

```bash
GET /ecoscan/summary
```

**Description:** Get complete Ecoscan overview with top ecosystems, whale activity, opportunities, and smart money clusters.

**Response:**
```json
{
  "service": "Ecoscan",
  "version": "0.1.0",
  "timestamp": "2024-01-15T12:00:00Z",
  "ecosystems": {
    "top_10": [
      {
        "chain": "arbitrum",
        "emi_score": 78.5,
        "stage": "explosive_growth",
        "tvl_usd": 2500000000,
        "wallets_24h": 45000,
        "volume_24h": 850000000
      }
    ],
    "total_tracked": 10
  },
  "whale_activity": {
    "heatmap": [
      {
        "asset": "ETH",
        "flow_in_usd": 125000000,
        "flow_out_usd": 85000000,
        "net_flow_usd": 40000000,
        "wcf": 72.3,
        "sentiment": "bullish"
      }
    ],
    "total_assets_tracked": 20
  },
  "opportunities": {
    "top_10": [
      {
        "asset": "ARB",
        "ecoscore": 82.5,
        "signal": "STRONG_BUY",
        "emi": 78.5,
        "wcf": 72.3,
        "pretrend": 0.85
      }
    ]
  },
  "smart_money": {
    "accumulation": {"count": 18, "percentage": 36.0},
    "distribution": {"count": 12, "percentage": 24.0},
    "dormant_activation": {"count": 20, "percentage": 40.0}
  }
}
```

---

#### 3. Top Ecosystems

```bash
GET /ecoscan/ecosystems?limit=10
```

**Parameters:**
- `limit` (int, 1-50): Number of ecosystems to return

**Response:**
```json
{
  "ecosystems": [
    {
      "chain": "arbitrum",
      "emi_score": 78.5,
      "stage": "explosive_growth",
      "tvl_usd": 2500000000,
      "wallets_24h": 45000,
      "volume_24h": 850000000,
      "bridge_flows": 120000000,
      "protocols": ["GMX", "Camelot", "Radiant"]
    }
  ],
  "total_tracked": 10,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 4. Whale Activity

```bash
GET /ecoscan/whales?lookback_hours=24
```

**Parameters:**
- `lookback_hours` (int, 1-168): Hours to look back

**Response:**
```json
{
  "heatmap": [
    {
      "asset": "ETH",
      "flow_in_usd": 125000000,
      "flow_out_usd": 85000000,
      "net_flow_usd": 40000000,
      "wcf": 72.3,
      "sentiment": "bullish",
      "transaction_count": 45
    }
  ],
  "detailed_summaries": [
    {
      "asset": "ETH",
      "flow_in_usd": 125000000,
      "flow_out_usd": 85000000,
      "net_flow_usd": 40000000,
      "wcf": 72.3,
      "sentiment": "bullish",
      "interpretation": "Strong accumulation by large wallets"
    }
  ],
  "lookback_hours": 24,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 5. Ecoscore Rankings

```bash
GET /ecoscan/ecoscore?limit=10&min_ecoscore=50
```

**Parameters:**
- `limit` (int, 1-50): Number of opportunities to return
- `min_ecoscore` (float, 0-100): Minimum Ecoscore threshold

**Response:**
```json
{
  "opportunities": [
    {
      "asset": "ARB",
      "ecoscore": 82.5,
      "signal": "STRONG_BUY",
      "emi": 78.5,
      "wcf": 72.3,
      "pretrend": 0.85,
      "rank": 1
    }
  ],
  "summary": {
    "avg_ecoscore": 65.2,
    "total_opportunities": 15,
    "strong_buy_count": 3,
    "buy_count": 5
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 6. Whale Alerts

```bash
GET /ecoscan/alerts?lookback_hours=24&min_value_usd=10000000
```

**Parameters:**
- `lookback_hours` (int, 1-168): Hours to look back
- `min_value_usd` (float): Minimum transaction value for alerts

**Response:**
```json
{
  "alerts": [
    {
      "asset": "ETH",
      "wallet_tag": "Binance Hot Wallet",
      "direction": "inflow",
      "value_usd": 45000000,
      "timestamp": "2024-01-15T11:30:00Z",
      "significance": "Large exchange inflow - potential selling pressure"
    }
  ],
  "total_alerts": 8,
  "lookback_hours": 24,
  "min_value_usd": 10000000,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 7. Smart Money Clusters

```bash
GET /ecoscan/smartmoney
```

**Response:**
```json
{
  "cluster_summary": {
    "accumulation": {
      "count": 18,
      "percentage": 36.0,
      "avg_net_flow": 2500000,
      "description": "Consistent buying, low selling"
    },
    "distribution": {
      "count": 12,
      "percentage": 24.0,
      "avg_net_flow": -1800000,
      "description": "High selling activity"
    },
    "dormant_activation": {
      "count": 20,
      "percentage": 40.0,
      "avg_dormancy_days": 180,
      "description": "Recently reactivated wallets"
    }
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 8. Ecosystem Detail

```bash
GET /ecoscan/ecosystem/{chain}
```

**Example:**
```bash
GET /ecoscan/ecosystem/arbitrum
```

**Response:**
```json
{
  "ecosystem": {
    "chain": "arbitrum",
    "emi_score": 78.5,
    "stage": "explosive_growth",
    "tvl_usd": 2500000000,
    "wallets_24h": 45000,
    "volume_24h": 850000000,
    "bridge_flows": 120000000,
    "protocols": ["GMX", "Camelot", "Radiant"]
  },
  "raw_data": {
    "tvl_usd": 2500000000,
    "tvl_delta_24h": 0.15,
    "active_wallets": 45000,
    "wallets_delta_24h": 0.12,
    "volume_24h": 850000000,
    "volume_delta_24h": 0.08,
    "bridge_flows": 120000000
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

#### 9. Whale Detail

```bash
GET /ecoscan/whale/{asset}?lookback_hours=24
```

**Example:**
```bash
GET /ecoscan/whale/ETH?lookback_hours=24
```

**Response:**
```json
{
  "asset": "ETH",
  "transactions": [
    {
      "wallet_tag": "Binance Hot Wallet",
      "direction": "inflow",
      "value_usd": 45000000,
      "timestamp": "2024-01-15T11:30:00Z"
    }
  ],
  "summary": {
    "flow_in_usd": 125000000,
    "flow_out_usd": 85000000,
    "net_flow_usd": 40000000,
    "wcf": 72.3,
    "sentiment": "bullish",
    "interpretation": "Strong accumulation by large wallets"
  },
  "lookback_hours": 24,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## Core Metrics

### 1. Ecosystem Momentum Index (EMI)

**Formula:**
```
EMI = w₁ × TVL_Δ + w₂ × ActiveWallets_Δ + w₃ × Volume_Δ + w₄ × BridgeFlows
```

**Default Weights:**
- TVL Delta: 30%
- Active Wallets Delta: 25%
- Volume Delta: 25%
- Bridge Flows: 20%

**Score Range:** 0-100

**Interpretation:**
- **80-100**: Explosive growth - New ecosystem with rapid adoption
- **65-80**: Rapid growth - Strong momentum, increasing activity
- **50-65**: Steady growth - Healthy expansion
- **35-50**: Emerging - Early stage, watch for acceleration
- **0-35**: Mature or declining - Established or losing momentum

---

### 2. Whale Confidence Factor (WCF)

**Formula:**
```
WCF = log_base(net_flow + offset) × scale
Normalized to 0-100
```

Where:
- `net_flow = flow_in - flow_out`
- `offset = 1e9` (prevents log of negative/zero)
- `scale = 10`

**Score Range:** 0-100

**Interpretation:**
- **70-100**: Very bullish - Strong whale accumulation
- **60-70**: Bullish - Moderate whale accumulation
- **40-60**: Neutral - Balanced flows
- **30-40**: Bearish - Moderate whale distribution
- **0-30**: Very bearish - Strong whale distribution

**Whale Transaction Threshold:** $250,000 USD

---

### 3. Ecoscore

**Formula:**
```
Ecoscore = 0.40 × EMI + 0.35 × WCF + 0.25 × PreTrend_scaled
```

**Score Range:** 0-100

**Signal Mapping:**
- **75-100**: STRONG_BUY
- **65-75**: BUY
- **55-65**: ACCUMULATE
- **45-55**: HOLD
- **35-45**: REDUCE
- **0-35**: SELL

---

### 4. Smart Money Clusters

**Features Extracted (8 total):**
1. Transaction frequency (txs per day)
2. Average transaction size (log-scaled)
3. Net flow ratio (inflow - outflow) / total
4. Days since last activity
5. Wallet age (days)
6. Transaction size volatility
7. Recent activity ratio (last 7 days / total)
8. Inflow/outflow ratio

**Clustering Method:** K-Means (3 clusters)

**Cluster Labels:**
1. **Accumulation** - Consistent buying, low selling
2. **Distribution** - High selling activity
3. **Dormant Activation** - Recently reactivated wallets

---

## Dashboard Usage

### Accessing the Dashboard

Navigate to: `http://localhost:3000/ecoscan`

### Dashboard Panels

#### 1. Emerging Ecosystems Heatmap

- **Visual**: Color-coded grid of chains by EMI score
- **Colors**: Green (high EMI) → Red (low EMI)
- **Hover**: Shows TVL, wallets, volume details
- **Click**: Navigate to ecosystem detail page

#### 2. Whale Flow Tracker

- **Visual**: Horizontal bar charts showing inflows/outflows
- **Green bars**: Inflows (accumulation)
- **Red bars**: Outflows (distribution)
- **WCF score**: Displayed on right side
- **Sentiment**: Textual interpretation (bullish/bearish)

#### 3. Smart Money Clusters

- **Visual**: Three cards showing cluster distribution
- **Accumulation**: Green card with count and percentage
- **Distribution**: Red card with count and percentage
- **Dormant Activation**: Yellow card with count and percentage

#### 4. Top 10 Ecoscore Opportunities

- **Visual**: Sortable table with rankings
- **Columns**: Rank, Asset, Ecoscore, EMI, WCF, Pre-Trend, Signal
- **Sorting**: Click column headers to sort
- **Signal badges**: Color-coded by action (STRONG_BUY, BUY, etc.)

### Cross-Analysis with AlphaBrain

Click "View in AlphaBrain" link to see how Ecoscan signals integrate with:
- Macro regime analysis
- Factor models
- Institutional playbooks
- Risk allocation

---

## AlphaBrain Integration

### Signal Sources

Ecoscan adds 2 new signal sources to AlphaBrain fusion:

1. **ecosystem_momentum** - EMI scores from EcosystemMapper
2. **whale_flow_bias** - WCF scores from WhaleTracker

### Fusion Strategies

New action strategy: **ecoscan_heavy**

**Weight Distribution:**
- GhostQuant TrendScore: 10%
- Factor Momentum: 10%
- Factor Value: 10%
- Factor Carry: 5%
- Macro Regime: 10%
- Institutional Playbook: 10%
- **Ecosystem Momentum: 25%**
- **Whale Flow Bias: 20%**

### Usage in AlphaBrain

```python
# AlphaBrain automatically receives Ecoscan signals
signal_scores = {
    'ghostquant_trendscore': {'BTC': 0.75, 'ETH': 0.68},
    'ecosystem_momentum': {'BTC': 0.65, 'ETH': 0.82},  # From Ecoscan EMI
    'whale_flow_bias': {'BTC': 0.58, 'ETH': 0.73},     # From Ecoscan WCF
    # ... other signals
}

# Fusion agent selects optimal weights
fused_scores = fusion_agent.fuse_signals(signal_scores, state_features)
```

---

## Troubleshooting

### Service Won't Start

**Symptom:** Ecoscan container fails to start

**Solutions:**
1. Check database is healthy: `docker compose ps postgres`
2. Verify environment variables in `.env`
3. Check logs: `docker compose logs ecoscan`
4. Ensure port 8082 is not in use: `lsof -i :8082`

---

### API Returns Empty Data

**Symptom:** Endpoints return empty arrays or null values

**Solutions:**
1. Verify `USE_MOCK_ECOSCAN_DATA=true` in `.env`
2. Check database tables exist: `psql -U ghost -d ghostquant -c "\dt"`
3. Manually trigger update: `curl -X POST http://localhost:8082/ecoscan/update`
4. Check service logs for errors

---

### EMI Scores Seem Incorrect

**Symptom:** EMI scores don't match expected ecosystem momentum

**Solutions:**
1. Verify EMI weights in `ecoscan/src/ecoscan/config.py`
2. Check historical data availability in database
3. Ensure sufficient data points for delta calculations
4. Review mock data generation if using mock mode

---

### Whale Transactions Not Appearing

**Symptom:** No whale transactions in whale flow tracker

**Solutions:**
1. Verify `MIN_WHALE_TX_USD` threshold in `.env` (default: $250,000)
2. Check if mock data is enabled: `USE_MOCK_ECOSCAN_DATA=true`
3. Ensure sufficient lookback period (default: 24 hours)
4. Review whale tracker logs for API errors

---

### Dashboard Not Loading

**Symptom:** Ecoscan dashboard shows loading spinner indefinitely

**Solutions:**
1. Check Ecoscan API is accessible: `curl http://localhost:8082/health`
2. Verify CORS settings in `ecoscan/src/ecoscan/api.py`
3. Check browser console for errors (F12)
4. Ensure web service has correct `NEXT_PUBLIC_ECOSCAN_API` env var

---

### AlphaBrain Not Receiving Ecoscan Signals

**Symptom:** AlphaBrain fusion doesn't include ecosystem/whale signals

**Solutions:**
1. Verify AlphaBrain service is running: `docker compose ps alphabrain`
2. Check signal sources in `alphabrain/src/alphabrain/fusion/alpha_fusion.py`
3. Ensure Ecoscan API is accessible from AlphaBrain container
4. Review AlphaBrain logs for integration errors

---

## Safety & Privacy

### Data Privacy

**What We Store:**
- ✅ Aggregated ecosystem metrics (TVL, volume, wallets)
- ✅ Whale transaction amounts and directions
- ✅ Wallet tags (exchange names, known entities)
- ❌ Individual wallet addresses
- ❌ Personal identifying information
- ❌ Private transaction details

**Anonymization:**
- Wallet addresses are tagged with generic labels ("Unknown", "Exchange", "DAO")
- Only transactions >$250k are tracked (reduces noise, protects small holders)
- Geographic data (if implemented) is country-level only

---

### Research-Only Disclaimer

**⚠️ IMPORTANT:**

Ecoscan is a **research and analysis tool only**. It does NOT:
- Execute trades or orders
- Provide financial advice
- Guarantee accuracy of predictions
- Connect to trading accounts

**Use Responsibly:**
- Verify all signals independently
- Consider multiple data sources
- Understand risks before trading
- Comply with local regulations

---

### Security Best Practices

1. **API Keys**: Store in `.env`, never commit to git
2. **Database**: Use strong passwords, restrict network access
3. **Ports**: Don't expose 8082 publicly without authentication
4. **Updates**: Keep dependencies updated for security patches
5. **Monitoring**: Review logs regularly for suspicious activity

---

## Advanced Configuration

### Tuning EMI Weights

Edit `ecoscan/src/ecoscan/config.py`:

```python
EMI_WEIGHTS = {
    'tvl_delta': 0.30,           # Increase for TVL-focused analysis
    'active_wallets_delta': 0.25, # Increase for user growth focus
    'volume_delta': 0.25,         # Increase for trading activity focus
    'bridge_flows': 0.20          # Increase for cross-chain momentum
}
```

### Adjusting Whale Threshold

Edit `.env`:

```bash
# Lower threshold for more whale transactions
MIN_WHALE_TX_USD=100000

# Higher threshold for only mega-whales
MIN_WHALE_TX_USD=1000000
```

### Changing Update Frequency

Edit `.env`:

```bash
# Update every 1 minute (aggressive)
ECOSCAN_UPDATE_INTERVAL=60

# Update every 10 minutes (conservative)
ECOSCAN_UPDATE_INTERVAL=600
```

---

## Support & Feedback

For issues, questions, or feature requests:

1. Check this runbook first
2. Review logs: `docker compose logs ecoscan`
3. Check GitHub issues
4. Contact the GhostQuant team

---

**Last Updated:** Phase 8 Implementation (January 2024)

**Version:** 0.1.0

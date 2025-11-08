
CREATE TABLE IF NOT EXISTS ecosystems (
    id SERIAL,
    chain TEXT NOT NULL,
    protocols TEXT[] DEFAULT '{}',
    tvl_usd DOUBLE PRECISION DEFAULT 0,
    wallets_24h INTEGER DEFAULT 0,
    volume_24h DOUBLE PRECISION DEFAULT 0,
    bridge_flows DOUBLE PRECISION DEFAULT 0,
    emi_score DOUBLE PRECISION DEFAULT 50.0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, updated_at)
);

SELECT create_hypertable('ecosystems', 'updated_at', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_ecosystems_chain ON ecosystems(chain);
CREATE INDEX IF NOT EXISTS idx_ecosystems_emi_score ON ecosystems(emi_score DESC);
CREATE INDEX IF NOT EXISTS idx_ecosystems_updated_at ON ecosystems(updated_at DESC);

CREATE TABLE IF NOT EXISTS whale_flows (
    id SERIAL,
    asset TEXT NOT NULL,
    wallet_tag TEXT DEFAULT 'Unknown',
    direction TEXT NOT NULL CHECK (direction IN ('inflow', 'outflow')),
    value_usd DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
);

SELECT create_hypertable('whale_flows', 'timestamp', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_whale_flows_asset ON whale_flows(asset);
CREATE INDEX IF NOT EXISTS idx_whale_flows_direction ON whale_flows(direction);
CREATE INDEX IF NOT EXISTS idx_whale_flows_value ON whale_flows(value_usd DESC);
CREATE INDEX IF NOT EXISTS idx_whale_flows_timestamp ON whale_flows(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_flows_wallet_tag ON whale_flows(wallet_tag);

CREATE TABLE IF NOT EXISTS ecoscore_rankings (
    id SERIAL,
    asset TEXT NOT NULL,
    emi DOUBLE PRECISION DEFAULT 50.0,
    wcf DOUBLE PRECISION DEFAULT 50.0,
    ecoscore DOUBLE PRECISION NOT NULL,
    signal_time TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, signal_time)
);

SELECT create_hypertable('ecoscore_rankings', 'signal_time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_ecoscore_rankings_asset ON ecoscore_rankings(asset);
CREATE INDEX IF NOT EXISTS idx_ecoscore_rankings_ecoscore ON ecoscore_rankings(ecoscore DESC);
CREATE INDEX IF NOT EXISTS idx_ecoscore_rankings_signal_time ON ecoscore_rankings(signal_time DESC);

COMMENT ON TABLE ecosystems IS 'Ecosystem metrics and EMI scores across chains';
COMMENT ON TABLE whale_flows IS 'Large wallet transactions (>$250k) for whale tracking';
COMMENT ON TABLE ecoscore_rankings IS 'Unified Ecoscore rankings combining EMI, WCF, and Pre-Trend';

COMMENT ON COLUMN ecosystems.emi_score IS 'Ecosystem Momentum Index (0-100)';
COMMENT ON COLUMN whale_flows.value_usd IS 'Transaction value in USD';
COMMENT ON COLUMN ecoscore_rankings.ecoscore IS 'Unified Ecoscore (0-100) = w1*EMI + w2*WCF + w3*PreTrend';

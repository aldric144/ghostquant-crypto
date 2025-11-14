
CREATE TABLE IF NOT EXISTS bridge_flows (
  id BIGSERIAL,
  ts TIMESTAMPTZ NOT NULL,
  chain_from TEXT,
  chain_to TEXT,
  bridge TEXT,
  token_symbol TEXT,
  token_address TEXT,
  amount NUMERIC, -- raw token amount
  amount_usd NUMERIC,
  tx_hash TEXT,
  metadata JSONB,
  PRIMARY KEY (id, ts)
);

SELECT create_hypertable('bridge_flows', 'ts', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_bridge_flows_chain_from ON bridge_flows(chain_from);
CREATE INDEX IF NOT EXISTS idx_bridge_flows_chain_to ON bridge_flows(chain_to);
CREATE INDEX IF NOT EXISTS idx_bridge_flows_bridge ON bridge_flows(bridge);
CREATE INDEX IF NOT EXISTS idx_bridge_flows_token_symbol ON bridge_flows(token_symbol);
CREATE INDEX IF NOT EXISTS idx_bridge_flows_ts ON bridge_flows(ts DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_flows_amount_usd ON bridge_flows(amount_usd DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_flows_metadata ON bridge_flows USING GIN(metadata);

CREATE TABLE IF NOT EXISTS large_transfers (
  id BIGSERIAL,
  ts TIMESTAMPTZ NOT NULL,
  chain TEXT,
  tx_hash TEXT,
  from_addr TEXT,
  to_addr TEXT,
  token_symbol TEXT,
  amount NUMERIC,
  amount_usd NUMERIC,
  detected_by TEXT, -- e.g., 'onchain', 'exchange-webhook'
  metadata JSONB,
  PRIMARY KEY (id, ts)
);

SELECT create_hypertable('large_transfers', 'ts', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_large_transfers_chain ON large_transfers(chain);
CREATE INDEX IF NOT EXISTS idx_large_transfers_from_addr ON large_transfers(from_addr);
CREATE INDEX IF NOT EXISTS idx_large_transfers_to_addr ON large_transfers(to_addr);
CREATE INDEX IF NOT EXISTS idx_large_transfers_token_symbol ON large_transfers(token_symbol);
CREATE INDEX IF NOT EXISTS idx_large_transfers_ts ON large_transfers(ts DESC);
CREATE INDEX IF NOT EXISTS idx_large_transfers_amount_usd ON large_transfers(amount_usd DESC);
CREATE INDEX IF NOT EXISTS idx_large_transfers_metadata ON large_transfers USING GIN(metadata);

CREATE TABLE IF NOT EXISTS wallet_clusters (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cluster_id TEXT NOT NULL,
  members JSONB NOT NULL,
  score NUMERIC, -- suspiciousness score (0-100)
  metadata JSONB,
  UNIQUE(cluster_id)
);

CREATE INDEX IF NOT EXISTS idx_wallet_clusters_cluster_id ON wallet_clusters(cluster_id);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_score ON wallet_clusters(score DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_created_at ON wallet_clusters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_members ON wallet_clusters USING GIN(members);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_metadata ON wallet_clusters USING GIN(metadata);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  alert_type TEXT NOT NULL, -- 'momentum', 'whale', 'pretrend', 'bridge_flow'
  asset TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_asset ON alerts(asset);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_metadata ON alerts USING GIN(metadata);

COMMENT ON TABLE bridge_flows IS 'Cross-chain bridge flow tracking for ecosystem mapping';
COMMENT ON TABLE large_transfers IS 'Large wallet transactions (>$250k USD) for whale detection';
COMMENT ON TABLE wallet_clusters IS 'Coordinated wallet clusters detected by co-spend patterns';
COMMENT ON TABLE alerts IS 'System alerts for momentum, whale activity, and Pre-Trend signals';

COMMENT ON COLUMN bridge_flows.amount_usd IS 'Bridge flow value in USD';
COMMENT ON COLUMN large_transfers.amount_usd IS 'Transfer value in USD';
COMMENT ON COLUMN wallet_clusters.score IS 'Suspiciousness score (0-100, higher = more suspicious)';
COMMENT ON COLUMN alerts.severity IS 'Alert severity level (low, medium, high, critical)';

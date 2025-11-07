CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    chain TEXT,
    address TEXT,
    sector TEXT,
    risk_tags TEXT[]
);

CREATE TABLE ticks (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    qty DOUBLE PRECISION NOT NULL,
    side TEXT,
    venue TEXT
);

CREATE TABLE books (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    bid_px DOUBLE PRECISION,
    ask_px DOUBLE PRECISION,
    bid_sz DOUBLE PRECISION,
    ask_sz DOUBLE PRECISION,
    spread_bps DOUBLE PRECISION
);

CREATE TABLE derivatives (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    funding_8h DOUBLE PRECISION,
    oi DOUBLE PRECISION,
    basis_bps DOUBLE PRECISION,
    liq_1h DOUBLE PRECISION
);

CREATE TABLE dex_pools (
    pool_id SERIAL PRIMARY KEY,
    chain TEXT NOT NULL,
    address TEXT NOT NULL,
    token0 TEXT NOT NULL,
    token1 TEXT NOT NULL,
    fee_bps INT NOT NULL
);

CREATE TABLE dex_metrics (
    pool_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    tvl_usd DOUBLE PRECISION,
    vol_24h DOUBLE PRECISION,
    depth_1pct DOUBLE PRECISION
);

CREATE TABLE onchain_flows (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    from_tag TEXT,
    to_tag TEXT,
    amount DOUBLE PRECISION,
    usd DOUBLE PRECISION
);

CREATE TABLE factors (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    mom_1h DOUBLE PRECISION,
    mom_24h DOUBLE PRECISION,
    accel_1h DOUBLE PRECISION,
    vol_regime DOUBLE PRECISION,
    depth_delta DOUBLE PRECISION,
    volume_z DOUBLE PRECISION,
    funding_flip BOOLEAN,
    oi_shift DOUBLE PRECISION,
    tvl_accel DOUBLE PRECISION,
    flow_score DOUBLE PRECISION
);

CREATE TABLE signals (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    trend_score DOUBLE PRECISION,
    pretrend_prob DOUBLE PRECISION,
    action TEXT,
    confidence DOUBLE PRECISION,
    rationale JSONB
);

CREATE TABLE backtests (
    run_id UUID PRIMARY KEY,
    params_json JSONB,
    start TIMESTAMPTZ,
    "end" TIMESTAMPTZ,
    sharpe DOUBLE PRECISION,
    max_dd DOUBLE PRECISION,
    cagr DOUBLE PRECISION,
    trade_count INT
);

CREATE TABLE trades (
    run_id UUID NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    asset_id INT NOT NULL,
    side TEXT,
    size DOUBLE PRECISION,
    px DOUBLE PRECISION,
    slippage_bps DOUBLE PRECISION,
    pnl DOUBLE PRECISION,
    reason TEXT
);

SELECT create_hypertable('ticks', 'ts');
SELECT create_hypertable('books', 'ts');
SELECT create_hypertable('derivatives', 'ts');
SELECT create_hypertable('dex_metrics', 'ts');
SELECT create_hypertable('onchain_flows', 'ts');
SELECT create_hypertable('factors', 'ts');
SELECT create_hypertable('signals', 'ts');

CREATE INDEX idx_ticks_asset_ts ON ticks (asset_id, ts DESC);
CREATE INDEX idx_books_asset_ts ON books (asset_id, ts DESC);
CREATE INDEX idx_derivatives_asset_ts ON derivatives (asset_id, ts DESC);
CREATE INDEX idx_dex_metrics_pool_ts ON dex_metrics (pool_id, ts DESC);
CREATE INDEX idx_onchain_flows_asset_ts ON onchain_flows (asset_id, ts DESC);
CREATE INDEX idx_factors_asset_ts ON factors (asset_id, ts DESC);
CREATE INDEX idx_signals_asset_ts ON signals (asset_id, ts DESC);
CREATE INDEX idx_trades_run_ts ON trades (run_id, ts);

INSERT INTO assets (symbol, chain, address, sector, risk_tags) VALUES
    ('BTC', NULL, NULL, 'Layer1', ARRAY['high-cap', 'liquid']),
    ('ETH', 'ethereum', NULL, 'Layer1', ARRAY['high-cap', 'liquid', 'defi']),
    ('SOL', 'solana', NULL, 'Layer1', ARRAY['high-cap', 'liquid']);

CREATE TABLE regime_history (
    ts TIMESTAMPTZ NOT NULL,
    regime TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    vix DOUBLE PRECISION,
    dxy DOUBLE PRECISION,
    yield_spread DOUBLE PRECISION,
    spy_momentum DOUBLE PRECISION,
    exposure_multiplier DOUBLE PRECISION,
    interpretation TEXT
);

CREATE TABLE factor_scores (
    asset_id INT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    momentum_1m DOUBLE PRECISION,
    value_score DOUBLE PRECISION,
    carry_score DOUBLE PRECISION,
    size_score DOUBLE PRECISION,
    volatility_score DOUBLE PRECISION,
    liquidity_score DOUBLE PRECISION,
    smart_beta_score DOUBLE PRECISION
);

CREATE TABLE portfolio_allocations (
    ts TIMESTAMPTZ NOT NULL,
    asset_id INT NOT NULL,
    weight DOUBLE PRECISION,
    expected_return DOUBLE PRECISION,
    volatility DOUBLE PRECISION,
    rationale TEXT
);

CREATE TABLE alphabrain_reports (
    report_id UUID PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    report_type TEXT,
    content JSONB,
    pdf_path TEXT
);

SELECT create_hypertable('regime_history', 'ts');
SELECT create_hypertable('factor_scores', 'ts');
SELECT create_hypertable('portfolio_allocations', 'ts');

CREATE INDEX idx_regime_history_ts ON regime_history (ts DESC);
CREATE INDEX idx_factor_scores_asset_ts ON factor_scores (asset_id, ts DESC);
CREATE INDEX idx_portfolio_allocations_ts ON portfolio_allocations (ts DESC, asset_id);
CREATE INDEX idx_alphabrain_reports_ts ON alphabrain_reports (ts DESC);

INSERT INTO dex_pools (chain, address, token0, token1, fee_bps) VALUES
    ('ethereum', '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', 'USDC', 'WETH', 30),
    ('ethereum', '0x9db9e0e53058c89e5b94e29621a205198648425b', 'USDC', 'WBTC', 30);

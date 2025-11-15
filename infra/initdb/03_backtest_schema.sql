CREATE TABLE IF NOT EXISTS ohlcv (
    symbol TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    open DOUBLE PRECISION NOT NULL,
    high DOUBLE PRECISION NOT NULL,
    low DOUBLE PRECISION NOT NULL,
    close DOUBLE PRECISION NOT NULL,
    volume DOUBLE PRECISION NOT NULL,
    timeframe TEXT NOT NULL,  -- '1m', '5m', '1h', '1d', etc.
    source TEXT DEFAULT 'coingecko'
);

CREATE TABLE IF NOT EXISTS supply (
    symbol TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    circulating_supply DOUBLE PRECISION,
    total_supply DOUBLE PRECISION,
    max_supply DOUBLE PRECISION,
    source TEXT DEFAULT 'coingecko'
);

CREATE TABLE IF NOT EXISTS backtest_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy TEXT NOT NULL,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    initial_capital DOUBLE PRECISION DEFAULT 10000,
    params_json JSONB,
    status TEXT DEFAULT 'pending',  -- pending, running, success, failed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    sharpe DOUBLE PRECISION,
    sortino DOUBLE PRECISION,
    max_dd DOUBLE PRECISION,
    max_dd_duration_days INT,
    cagr DOUBLE PRECISION,
    total_return DOUBLE PRECISION,
    win_rate DOUBLE PRECISION,
    profit_factor DOUBLE PRECISION,
    trade_count INT,
    avg_trade_duration_hours DOUBLE PRECISION,
    final_capital DOUBLE PRECISION,
    csv_path TEXT,
    equity_curve_path TEXT
);

CREATE TABLE IF NOT EXISTS backtest_trades (
    trade_id SERIAL PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES backtest_runs(run_id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,  -- 'buy' or 'sell'
    quantity DOUBLE PRECISION NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    slippage_bps DOUBLE PRECISION DEFAULT 0,
    commission DOUBLE PRECISION DEFAULT 0,
    pnl DOUBLE PRECISION,
    cumulative_pnl DOUBLE PRECISION,
    reason TEXT,
    signal_data JSONB
);

CREATE TABLE IF NOT EXISTS backtest_equity (
    run_id UUID NOT NULL REFERENCES backtest_runs(run_id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL,
    equity DOUBLE PRECISION NOT NULL,
    cash DOUBLE PRECISION NOT NULL,
    position_value DOUBLE PRECISION NOT NULL,
    drawdown_pct DOUBLE PRECISION,
    PRIMARY KEY (run_id, ts)
);

SELECT create_hypertable('ohlcv', 'ts', if_not_exists => TRUE);
SELECT create_hypertable('supply', 'ts', if_not_exists => TRUE);
SELECT create_hypertable('backtest_equity', 'ts', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_ts ON ohlcv (symbol, ts DESC);
CREATE INDEX IF NOT EXISTS idx_ohlcv_timeframe ON ohlcv (timeframe, symbol, ts DESC);
CREATE INDEX IF NOT EXISTS idx_supply_symbol_ts ON supply (symbol, ts DESC);
CREATE INDEX IF NOT EXISTS idx_backtest_runs_status ON backtest_runs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backtest_runs_symbol ON backtest_runs (symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backtest_trades_run_ts ON backtest_trades (run_id, ts);
CREATE INDEX IF NOT EXISTS idx_backtest_equity_run_ts ON backtest_equity (run_id, ts);

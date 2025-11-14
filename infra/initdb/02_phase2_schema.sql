
CREATE TABLE IF NOT EXISTS trader_notes (
    note_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    note TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_trader_notes_user_id ON trader_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_trader_notes_symbol ON trader_notes(symbol);
CREATE INDEX IF NOT EXISTS idx_trader_notes_created_at ON trader_notes(created_at DESC);

CREATE OR REPLACE FUNCTION update_trader_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trader_notes_updated_at
    BEFORE UPDATE ON trader_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_trader_notes_updated_at();

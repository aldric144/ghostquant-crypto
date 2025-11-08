import argparse
import asyncio
import psycopg
from psycopg.rows import dict_row
import os
import json
import uuid
from datetime import datetime
import pandas as pd
from backtest.bars import build_bars_from_ticks, generate_synthetic_bars
from backtest.engine import BacktestEngine, run_trend_strategy

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

async def load_asset(conn, symbol: str):
    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute("SELECT * FROM assets WHERE symbol = %s", (symbol,))
        return await cur.fetchone()

async def load_ticks(conn, asset_id: int, start: datetime, end: datetime):
    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute(
            "SELECT ts, price, qty FROM ticks WHERE asset_id = %s AND ts >= %s AND ts <= %s ORDER BY ts",
            (asset_id, start, end)
        )
        return await cur.fetchall()

async def load_signals(conn, asset_id: int, start: datetime, end: datetime):
    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute(
            "SELECT ts, trend_score, pretrend_prob, action, confidence FROM signals WHERE asset_id = %s AND ts >= %s AND ts <= %s ORDER BY ts",
            (asset_id, start, end)
        )
        return await cur.fetchall()

async def save_backtest_results(conn, run_id: uuid.UUID, params: dict, start: datetime, end: datetime, metrics: dict, trades: list):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO backtests (run_id, params_json, start, "end", sharpe, max_dd, cagr, trade_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                run_id,
                json.dumps(params),
                start,
                end,
                metrics.get('sharpe'),
                metrics.get('max_dd'),
                metrics.get('cagr'),
                metrics.get('trade_count')
            )
        )
        
        for trade in trades:
            await cur.execute(
                """
                INSERT INTO trades (run_id, ts, asset_id, side, size, px, slippage_bps, pnl, reason)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    run_id,
                    trade['ts'],
                    trade['asset_id'],
                    trade['side'],
                    trade['size'],
                    trade['px'],
                    trade['slippage_bps'],
                    trade['pnl'],
                    trade['reason']
                )
            )
        
        await conn.commit()

async def run_backtest(strategy: str, asset: str, start: datetime, end: datetime, use_synthetic: bool = False):
    conn = await psycopg.AsyncConnection.connect(DATABASE_URL)
    
    try:
        asset_data = await load_asset(conn, asset)
        if not asset_data:
            print(f"Asset {asset} not found")
            return
        
        asset_id = asset_data['asset_id']
        
        print(f"Running backtest for {asset} from {start} to {end}")
        
        if use_synthetic:
            print("Using synthetic data")
            base_prices = {'BTC': 45000, 'ETH': 2500, 'SOL': 100}
            bars = generate_synthetic_bars(asset, start, end, '1m', base_prices.get(asset, 1000))
        else:
            ticks = await load_ticks(conn, asset_id, start, end)
            
            if not ticks:
                print(f"No tick data found, using synthetic data")
                base_prices = {'BTC': 45000, 'ETH': 2500, 'SOL': 100}
                bars = generate_synthetic_bars(asset, start, end, '1m', base_prices.get(asset, 1000))
            else:
                print(f"Loaded {len(ticks)} ticks")
                bars = build_bars_from_ticks(ticks, '1m')
        
        signals_data = await load_signals(conn, asset_id, start, end)
        
        if not signals_data:
            print("No signals found, cannot run backtest")
            return
        
        print(f"Loaded {len(signals_data)} signals")
        
        signals_df = pd.DataFrame(signals_data)
        signals_df.set_index('ts', inplace=True)
        
        engine = BacktestEngine(initial_capital=100000, fee_rate=0.001)
        
        run_trend_strategy(bars, signals_df, asset_id, engine, position_size=1.0)
        
        metrics = engine.calculate_metrics()
        
        print("\n=== Backtest Results ===")
        print(f"Sharpe Ratio: {metrics.get('sharpe', 0):.2f}")
        print(f"Max Drawdown: {metrics.get('max_dd', 0):.2%}")
        print(f"CAGR: {metrics.get('cagr', 0):.2%}")
        print(f"Total Return: {metrics.get('total_return', 0):.2%}")
        print(f"Trade Count: {metrics.get('trade_count', 0)}")
        print(f"Final Equity: ${metrics.get('final_equity', 0):,.2f}")
        
        run_id = uuid.uuid4()
        params = {
            'strategy': strategy,
            'asset': asset,
            'start': start.isoformat(),
            'end': end.isoformat()
        }
        
        await save_backtest_results(conn, run_id, params, start, end, metrics, engine.trades)
        
        print(f"\nBacktest saved with run_id: {run_id}")
        
        os.makedirs('artifacts', exist_ok=True)
        
        with open(f'artifacts/backtest_{run_id}.json', 'w') as f:
            json.dump({
                'run_id': str(run_id),
                'params': params,
                'metrics': metrics,
                'trades': [
                    {**t, 'ts': t['ts'].isoformat()} for t in engine.trades
                ]
            }, f, indent=2)
        
        if engine.equity_curve:
            equity_df = pd.DataFrame(engine.equity_curve)
            equity_df.to_csv(f'artifacts/equity_{run_id}.csv', index=False)
        
        print(f"Artifacts saved to artifacts/")
        
    finally:
        await conn.close()

def main():
    parser = argparse.ArgumentParser(description='Run backtest')
    parser.add_argument('--strategy', default='trend_v1', help='Strategy name')
    parser.add_argument('--asset', required=True, help='Asset symbol (e.g., ETH)')
    parser.add_argument('--start', required=True, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end', required=True, help='End date (YYYY-MM-DD)')
    parser.add_argument('--synthetic', action='store_true', help='Use synthetic data')
    
    args = parser.parse_args()
    
    start = datetime.fromisoformat(args.start)
    end = datetime.fromisoformat(args.end)
    
    asyncio.run(run_backtest(args.strategy, args.asset, start, end, args.synthetic))

if __name__ == "__main__":
    main()

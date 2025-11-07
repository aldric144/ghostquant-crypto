import psycopg
from psycopg.rows import dict_row
from typing import List, Dict, Any
import os

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

async def batch_insert_ticks(conn, ticks: List[Dict[str, Any]]):
    if not ticks:
        return
    
    query = """
        INSERT INTO ticks (asset_id, ts, price, qty, side, venue)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """
    async with conn.cursor() as cur:
        await cur.executemany(query, [
            (t['asset_id'], t['ts'], t['price'], t['qty'], t.get('side'), t.get('venue'))
            for t in ticks
        ])
        await conn.commit()

async def batch_insert_books(conn, books: List[Dict[str, Any]]):
    if not books:
        return
    
    query = """
        INSERT INTO books (asset_id, ts, bid_px, ask_px, bid_sz, ask_sz, spread_bps)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """
    async with conn.cursor() as cur:
        await cur.executemany(query, [
            (b['asset_id'], b['ts'], b['bid_px'], b['ask_px'], b['bid_sz'], b['ask_sz'], b.get('spread_bps'))
            for b in books
        ])
        await conn.commit()

async def batch_insert_derivatives(conn, derivatives: List[Dict[str, Any]]):
    if not derivatives:
        return
    
    query = """
        INSERT INTO derivatives (asset_id, ts, funding_8h, oi, basis_bps, liq_1h)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """
    async with conn.cursor() as cur:
        await cur.executemany(query, [
            (d['asset_id'], d['ts'], d.get('funding_8h'), d.get('oi'), d.get('basis_bps'), d.get('liq_1h'))
            for d in derivatives
        ])
        await conn.commit()

async def batch_insert_dex_metrics(conn, metrics: List[Dict[str, Any]]):
    if not metrics:
        return
    
    query = """
        INSERT INTO dex_metrics (pool_id, ts, tvl_usd, vol_24h, depth_1pct)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """
    async with conn.cursor() as cur:
        await cur.executemany(query, [
            (m['pool_id'], m['ts'], m.get('tvl_usd'), m.get('vol_24h'), m.get('depth_1pct'))
            for m in metrics
        ])
        await conn.commit()

async def batch_insert_onchain_flows(conn, flows: List[Dict[str, Any]]):
    if not flows:
        return
    
    query = """
        INSERT INTO onchain_flows (asset_id, ts, from_tag, to_tag, amount, usd)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """
    async with conn.cursor() as cur:
        await cur.executemany(query, [
            (f['asset_id'], f['ts'], f.get('from_tag'), f.get('to_tag'), f.get('amount'), f.get('usd'))
            for f in flows
        ])
        await conn.commit()

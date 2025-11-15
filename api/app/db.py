import os
from contextlib import asynccontextmanager
import psycopg
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool
import asyncpg

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

pool = None

async def init_db_pool():
    global pool
    pool = AsyncConnectionPool(
        conninfo=DATABASE_URL,
        min_size=2,
        max_size=10,
        open=True
    )
    return pool

async def close_db_pool():
    global pool
    if pool:
        await pool.close()

@asynccontextmanager
async def get_db():
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            yield cur

async def get_db_pool():
    """Create an asyncpg connection pool for backtesting and other services."""
    return await asyncpg.create_pool(
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "ghostquant"),
        user=os.getenv("POSTGRES_USER", "ghost"),
        password=os.getenv("POSTGRES_PASSWORD", "ghostpass"),
        min_size=1,
        max_size=10
    )

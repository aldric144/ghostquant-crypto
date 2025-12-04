import os
from contextlib import asynccontextmanager

# Lazy imports - only import database drivers when actually needed
# This allows the app to start in serverless mode without psycopg installed

pool = None

def _is_serverless_mode():
    """Check if running in serverless mode (no DB required)."""
    return os.getenv("SERVERLESS_MODE", "false").lower() == "true"

def _get_database_url():
    """Build database URL from environment variables."""
    return f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

async def init_db_pool():
    """Initialize the database connection pool. No-op in serverless mode."""
    global pool
    
    if _is_serverless_mode():
        return None
    
    # Lazy import - only import when actually needed
    try:
        from psycopg_pool import AsyncConnectionPool
    except ImportError:
        raise ImportError("psycopg_pool is required for database connections. Install with: pip install psycopg[binary] psycopg-pool")
    
    pool = AsyncConnectionPool(
        conninfo=_get_database_url(),
        min_size=2,
        max_size=10,
        open=True
    )
    return pool

async def close_db_pool():
    """Close the database connection pool. No-op in serverless mode."""
    global pool
    if pool:
        await pool.close()

@asynccontextmanager
async def get_db():
    """Get a database cursor. Raises error in serverless mode."""
    if _is_serverless_mode() or pool is None:
        raise RuntimeError("Database not available in serverless mode")
    
    # Lazy import
    try:
        from psycopg.rows import dict_row
    except ImportError:
        raise ImportError("psycopg is required for database connections. Install with: pip install psycopg[binary]")
    
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            yield cur

async def get_db_pool():
    """Create an asyncpg connection pool for backtesting and other services.
    Returns None in serverless mode."""
    if _is_serverless_mode():
        return None
    
    # Lazy import
    try:
        import asyncpg
    except ImportError:
        raise ImportError("asyncpg is required for database connections. Install with: pip install asyncpg")
    
    return await asyncpg.create_pool(
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "ghostquant"),
        user=os.getenv("POSTGRES_USER", "ghost"),
        password=os.getenv("POSTGRES_PASSWORD", "ghostpass"),
        min_size=1,
        max_size=10
    )

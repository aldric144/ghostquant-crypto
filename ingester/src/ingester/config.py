"""Configuration for the ingester service."""
import os
from pydantic_settings import BaseSettings


class IngesterConfig(BaseSettings):
    """Ingester configuration from environment variables."""
    
    coingecko_api_key: str = os.getenv("COINGECKO_API_KEY", "")
    coingecko_base: str = os.getenv("COINGECKO_BASE", "https://api.coingecko.com/api/v3")
    coingecko_pro_base: str = os.getenv("COINGECKO_PRO_BASE", "https://pro-api.coingecko.com/api/v3")
    
    ingester_rate_limit_per_min: int = int(os.getenv("INGESTER_RATE_LIMIT_PER_MIN", "50"))
    
    retry_max_attempts: int = int(os.getenv("INGESTER_RETRY_MAX_ATTEMPTS", "3"))
    retry_backoff_base: float = float(os.getenv("INGESTER_RETRY_BACKOFF_BASE", "2.0"))
    retry_initial_delay: float = float(os.getenv("INGESTER_RETRY_INITIAL_DELAY", "1.0"))
    
    postgres_host: str = os.getenv("POSTGRES_HOST", "postgres")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    postgres_db: str = os.getenv("POSTGRES_DB", "ghostquant")
    postgres_user: str = os.getenv("POSTGRES_USER", "ghost")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "ghostpass")
    
    backfill_chunk_days: int = int(os.getenv("BACKFILL_CHUNK_DAYS", "30"))
    backfill_delay_seconds: float = float(os.getenv("BACKFILL_DELAY_SECONDS", "1.0"))
    
    @property
    def postgres_url(self) -> str:
        """Get PostgreSQL connection URL."""
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    @property
    def coingecko_api_base(self) -> str:
        """Get the appropriate CoinGecko API base URL."""
        if self.coingecko_api_key:
            return self.coingecko_pro_base
        return self.coingecko_base
    
    class Config:
        env_file = ".env"
        case_sensitive = False


config = IngesterConfig()

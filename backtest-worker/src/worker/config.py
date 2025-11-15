"""Configuration for backtest worker."""
import os
from pydantic_settings import BaseSettings


class WorkerConfig(BaseSettings):
    """Worker configuration from environment variables."""
    
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    backtest_queue_name: str = os.getenv("BACKTEST_QUEUE_NAME", "backtests")
    
    postgres_host: str = os.getenv("POSTGRES_HOST", "postgres")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    postgres_db: str = os.getenv("POSTGRES_DB", "ghostquant")
    postgres_user: str = os.getenv("POSTGRES_USER", "ghost")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "ghostpass")
    
    backtest_max_runtime_seconds: int = int(os.getenv("BACKTEST_MAX_RUNTIME_SECONDS", "7200"))
    backtest_results_path: str = os.getenv("BACKTEST_RESULTS_PATH", "/data/backtests/results")
    
    @property
    def postgres_url(self) -> str:
        """Get PostgreSQL connection URL."""
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


config = WorkerConfig()

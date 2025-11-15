"""Worker entry point."""
import logging
from rq import Worker, Queue, Connection
import redis

from .config import config
from .tasks import run_backtest

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Start the RQ worker."""
    logger.info("Starting backtest worker...")
    logger.info(f"Redis URL: {config.redis_url}")
    logger.info(f"Queue name: {config.backtest_queue_name}")
    
    redis_conn = redis.from_url(config.redis_url)
    
    queue = Queue(config.backtest_queue_name, connection=redis_conn)
    
    with Connection(redis_conn):
        worker = Worker([queue], connection=redis_conn)
        logger.info("Worker started, waiting for jobs...")
        worker.work()


if __name__ == '__main__':
    main()

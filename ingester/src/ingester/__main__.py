"""CLI entry point for ingester."""
import asyncio
import argparse
import logging
import json
from datetime import datetime
from pathlib import Path

from .fetcher import OHLCVFetcher
from .coingecko_client import CoinGeckoClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def fetch_ohlcv_command(args):
    """Fetch OHLCV data for a single coin."""
    fetcher = OHLCVFetcher()
    
    try:
        start_date = datetime.fromisoformat(args.start)
        end_date = datetime.fromisoformat(args.end) if args.end else datetime.utcnow()
        
        records = await fetcher.fetch_ohlcv(
            symbol=args.symbol.upper(),
            coin_id=args.source,
            timeframe=args.timeframe,
            start_date=start_date,
            end_date=end_date
        )
        
        logger.info(f"Successfully fetched {records} OHLCV records")
        
    finally:
        await fetcher.close()


async def backfill_command(args):
    """Backfill OHLCV data for multiple coins."""
    fetcher = OHLCVFetcher()
    
    try:
        tokens_file = Path(args.target_file)
        if not tokens_file.exists():
            logger.error(f"Tokens file not found: {args.target_file}")
            return
        
        with open(tokens_file, 'r') as f:
            tokens = json.load(f)
        
        logger.info(f"Loaded {len(tokens)} tokens from {args.target_file}")
        
        start_date = datetime.fromisoformat(args.start) if args.start else datetime(2022, 1, 1)
        end_date = datetime.fromisoformat(args.end) if args.end else datetime.utcnow()
        
        for token in tokens:
            symbol = token.get('symbol', '').upper()
            coin_id = token.get('id', token.get('coingecko_id', ''))
            
            if not symbol or not coin_id:
                logger.warning(f"Skipping token with missing symbol or id: {token}")
                continue
            
            try:
                logger.info(f"Backfilling {symbol} ({coin_id})...")
                await fetcher.backfill_ohlcv(
                    symbol=symbol,
                    coin_id=coin_id,
                    timeframe=args.timeframe,
                    start_date=start_date,
                    end_date=end_date
                )
            except Exception as e:
                logger.error(f"Error backfilling {symbol}: {e}")
                continue
        
        logger.info("Backfill complete")
        
    finally:
        await fetcher.close()


async def run_daemon_command(args):
    """Run ingester as a daemon (continuous fetching)."""
    logger.info("Starting ingester daemon...")
    logger.info("Daemon mode not yet implemented - use backfill for now")


async def list_coins_command(args):
    """List available coins from CoinGecko."""
    client = CoinGeckoClient()
    
    try:
        coins = await client.get_coins_list()
        
        if args.search:
            search_term = args.search.lower()
            coins = [
                c for c in coins
                if search_term in c['id'].lower() or
                   search_term in c['symbol'].lower() or
                   search_term in c['name'].lower()
            ]
        
        logger.info(f"Found {len(coins)} coins")
        
        for coin in coins[:args.limit]:
            print(f"{coin['id']:30} {coin['symbol']:10} {coin['name']}")
        
        if len(coins) > args.limit:
            print(f"\n... and {len(coins) - args.limit} more")
    
    finally:
        await client.close()


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description='GhostQuant Ingester CLI')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    fetch_parser = subparsers.add_parser('fetch_ohlcv', help='Fetch OHLCV data for a coin')
    fetch_parser.add_argument('--source', required=True, help='CoinGecko coin ID (e.g., bitcoin)')
    fetch_parser.add_argument('--symbol', required=True, help='Coin symbol (e.g., BTC)')
    fetch_parser.add_argument('--timeframe', default='1d', help='Timeframe (default: 1d)')
    fetch_parser.add_argument('--start', required=True, help='Start date (ISO format: 2022-01-01)')
    fetch_parser.add_argument('--end', help='End date (ISO format, default: now)')
    
    backfill_parser = subparsers.add_parser('backfill', help='Backfill OHLCV data for multiple coins')
    backfill_parser.add_argument('--target-file', required=True, help='JSON file with tokens list')
    backfill_parser.add_argument('--timeframe', default='1d', help='Timeframe (default: 1d)')
    backfill_parser.add_argument('--start', help='Start date (ISO format, default: 2022-01-01)')
    backfill_parser.add_argument('--end', help='End date (ISO format, default: now)')
    
    run_parser = subparsers.add_parser('run', help='Run ingester as daemon')
    
    list_parser = subparsers.add_parser('list_coins', help='List available coins')
    list_parser.add_argument('--search', help='Search term to filter coins')
    list_parser.add_argument('--limit', type=int, default=50, help='Max results to show (default: 50)')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'fetch_ohlcv':
        asyncio.run(fetch_ohlcv_command(args))
    elif args.command == 'backfill':
        asyncio.run(backfill_command(args))
    elif args.command == 'run':
        asyncio.run(run_daemon_command(args))
    elif args.command == 'list_coins':
        asyncio.run(list_coins_command(args))


if __name__ == '__main__':
    main()

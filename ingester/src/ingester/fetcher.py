"""OHLCV and supply data fetcher."""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from .coingecko_client import CoinGeckoClient
from .database import Database
from .config import config

logger = logging.getLogger(__name__)


class OHLCVFetcher:
    """Fetches OHLCV data from CoinGecko and stores in database."""
    
    def __init__(self):
        self.client = CoinGeckoClient()
        self.db = Database()
    
    async def fetch_ohlcv(
        self,
        symbol: str,
        coin_id: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> int:
        """
        Fetch OHLCV data for a coin and date range.
        
        Args:
            symbol: Coin symbol (e.g., "BTC")
            coin_id: CoinGecko coin ID (e.g., "bitcoin")
            timeframe: Timeframe (e.g., "1d", "1h")
            start_date: Start date
            end_date: End date
            
        Returns:
            Number of records fetched
        """
        logger.info(f"Fetching OHLCV for {symbol} ({coin_id}) from {start_date} to {end_date}")
        
        days = (end_date - start_date).days
        
        
        if days <= 90:
            ohlc_data = await self.client.get_ohlc(coin_id, days)
            
            records = []
            for row in ohlc_data:
                timestamp_ms, open_price, high, low, close = row
                ts = datetime.fromtimestamp(timestamp_ms / 1000)
                
                records.append({
                    'ts': ts,
                    'open': open_price,
                    'high': high,
                    'low': low,
                    'close': close,
                    'volume': 0  # OHLC endpoint doesn't provide volume
                })
            
            await self.db.upsert_ohlcv(symbol, timeframe, records)
            return len(records)
        
        else:
            from_ts = int(start_date.timestamp())
            to_ts = int(end_date.timestamp())
            
            chart_data = await self.client.get_market_chart_range(
                coin_id,
                from_ts,
                to_ts
            )
            
            prices = chart_data.get('prices', [])
            volumes = chart_data.get('total_volumes', [])
            
            volume_dict = {int(ts): vol for ts, vol in volumes}
            
            records = []
            current_day = None
            day_data = {'open': None, 'high': None, 'low': None, 'close': None, 'volume': 0}
            
            for timestamp_ms, price in prices:
                ts = datetime.fromtimestamp(timestamp_ms / 1000)
                day = ts.date()
                
                if current_day != day:
                    if current_day is not None and day_data['open'] is not None:
                        records.append({
                            'ts': datetime.combine(current_day, datetime.min.time()),
                            'open': day_data['open'],
                            'high': day_data['high'],
                            'low': day_data['low'],
                            'close': day_data['close'],
                            'volume': day_data['volume']
                        })
                    
                    current_day = day
                    day_data = {
                        'open': price,
                        'high': price,
                        'low': price,
                        'close': price,
                        'volume': volume_dict.get(int(timestamp_ms), 0)
                    }
                else:
                    day_data['high'] = max(day_data['high'], price)
                    day_data['low'] = min(day_data['low'], price)
                    day_data['close'] = price
                    day_data['volume'] += volume_dict.get(int(timestamp_ms), 0)
            
            if current_day is not None and day_data['open'] is not None:
                records.append({
                    'ts': datetime.combine(current_day, datetime.min.time()),
                    'open': day_data['open'],
                    'high': day_data['high'],
                    'low': day_data['low'],
                    'close': day_data['close'],
                    'volume': day_data['volume']
                })
            
            await self.db.upsert_ohlcv(symbol, timeframe, records)
            return len(records)
    
    async def backfill_ohlcv(
        self,
        symbol: str,
        coin_id: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> int:
        """
        Backfill OHLCV data in chunks.
        
        Args:
            symbol: Coin symbol
            coin_id: CoinGecko coin ID
            timeframe: Timeframe
            start_date: Start date
            end_date: End date
            
        Returns:
            Total number of records fetched
        """
        logger.info(f"Starting backfill for {symbol} ({coin_id}) from {start_date} to {end_date}")
        
        total_records = 0
        current_start = start_date
        chunk_days = config.backfill_chunk_days
        
        while current_start < end_date:
            current_end = min(current_start + timedelta(days=chunk_days), end_date)
            
            try:
                records = await self.fetch_ohlcv(
                    symbol,
                    coin_id,
                    timeframe,
                    current_start,
                    current_end
                )
                
                total_records += records
                logger.info(
                    f"Backfilled {records} records for {symbol} "
                    f"({current_start.date()} to {current_end.date()})"
                )
                
                await asyncio.sleep(config.backfill_delay_seconds)
                
            except Exception as e:
                logger.error(f"Error backfilling {symbol} chunk: {e}")
            
            current_start = current_end
        
        logger.info(f"Backfill complete for {symbol}: {total_records} total records")
        return total_records
    
    async def fetch_supply(
        self,
        symbol: str,
        coin_id: str
    ) -> int:
        """
        Fetch current supply data for a coin.
        
        Args:
            symbol: Coin symbol
            coin_id: CoinGecko coin ID
            
        Returns:
            Number of records stored (1 if successful)
        """
        logger.info(f"Fetching supply data for {symbol} ({coin_id})")
        
        coin_info = await self.client.get_coin_info(coin_id)
        market_data = coin_info.get('market_data', {})
        
        record = {
            'ts': datetime.utcnow(),
            'circulating_supply': market_data.get('circulating_supply'),
            'total_supply': market_data.get('total_supply'),
            'max_supply': market_data.get('max_supply')
        }
        
        await self.db.upsert_supply(symbol, [record])
        return 1
    
    async def close(self):
        """Close connections."""
        await self.client.close()
        await self.db.close()

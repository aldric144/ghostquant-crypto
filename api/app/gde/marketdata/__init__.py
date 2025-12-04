"""
GhostQuant Market Data Integration Module

Enterprise-grade market data integration with:
- CoinAPI (primary provider)
- CoinGecko (secondary/fallback provider)
- Static fallback data (emergency only)
"""

from .coinapi_client import CoinAPIClient
from .coingecko_client import CoinGeckoClient
from .marketdata_engine import MarketDataEngine
from .api_marketdata import router as marketdata_router

__all__ = [
    "CoinAPIClient",
    "CoinGeckoClient", 
    "MarketDataEngine",
    "marketdata_router"
]

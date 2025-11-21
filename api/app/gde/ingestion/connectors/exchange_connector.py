class ExchangeConnector:
    """
    Placeholder for exchange REST/WebSocket ingestion.
    Will be expanded to support:
    - Binance
    - Coinbase
    - Kraken
    - Bybit
    - OKX
    - Order book, trades, spreads, liquidity walls
    """
    async def fetch(self):
        return {
            "chain": "CEX",
            "value": None,
            "token": None,
            "timestamp": None,
            "source": "exchange_placeholder"
        }

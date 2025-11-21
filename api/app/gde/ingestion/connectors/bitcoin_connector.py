class BitcoinConnector:
    """
    Placeholder for Bitcoin RPC/mempool ingestion.
    Enterprise version will support:
    - mempool reading
    - block polling
    - address tracking
    - whale movement detection
    """
    async def fetch(self):
        return {
            "chain": "BTC",
            "value": 0.5,
            "token": "BTC",
            "timestamp": None,
            "source": "bitcoin_rpc_placeholder"
        }

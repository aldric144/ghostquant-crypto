"""Ecoscan configuration."""

import os
from typing import Dict

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
POSTGRES_DB = os.getenv("POSTGRES_DB", "ghostquant")
POSTGRES_USER = os.getenv("POSTGRES_USER", "ghost")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "ghostpass")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

USE_MOCK_ECOSCAN_DATA = os.getenv("USE_MOCK_ECOSCAN_DATA", "true").lower() == "true"
ECOSCAN_UPDATE_INTERVAL = int(os.getenv("ECOSCAN_UPDATE_INTERVAL", "300"))  # 5 minutes
MIN_WHALE_TX_USD = float(os.getenv("MIN_WHALE_TX_USD", "250000"))  # $250k minimum

EMI_WEIGHTS: Dict[str, float] = {
    "tvl_delta": 0.30,
    "active_wallets_delta": 0.25,
    "volume_delta": 0.25,
    "bridge_flows": 0.20,
}

WCF_FLOW_WEIGHT = 1.0
WCF_LOG_BASE = 10.0

CLUSTER_N_CLUSTERS = 3  # Accumulation, Distribution, Dormant
CLUSTER_LOOKBACK_DAYS = 30
CLUSTER_MIN_TX_COUNT = 5

ECOSCORE_WEIGHTS: Dict[str, float] = {
    "emi": 0.40,
    "wcf": 0.35,
    "pretrend": 0.25,
}

API_PORT = 8082
API_HOST = "0.0.0.0"

KNOWN_WHALE_TAGS = {
    "0x0000000000000000000000000000000000000001": "Binance Hot Wallet",
    "0x0000000000000000000000000000000000000002": "a16z Crypto",
    "0x0000000000000000000000000000000000000003": "Paradigm",
    "0x0000000000000000000000000000000000000004": "Jump Trading",
    "0x0000000000000000000000000000000000000005": "Alameda Research",
}

SUPPORTED_CHAINS = [
    "ethereum",
    "arbitrum",
    "optimism",
    "polygon",
    "avalanche",
    "bsc",
    "solana",
    "cosmos",
    "osmosis",
    "base",
]

PROTOCOL_CATEGORIES = [
    "dex",
    "lending",
    "bridge",
    "derivatives",
    "yield",
    "staking",
    "liquid-staking",
    "cdp",
]

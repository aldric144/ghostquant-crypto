from datetime import datetime
from typing import Any, Optional


def normalize_timestamp(value: Any) -> Optional[datetime]:
    """
    Normalize input timestamps from various formats:
    - int (UNIX)
    - float
    - ISO strings
    - datetime objects
    """
    try:
        if isinstance(value, datetime):
            return value
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value)
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace("Z", ""))
    except Exception:
        return None
    return None


def normalize_number(value: Any) -> Optional[float]:
    """
    Convert numeric strings, ints, or floats to float.
    """
    try:
        return float(value)
    except Exception:
        return None


def normalize_chain(value: Any) -> Optional[str]:
    """
    Normalize blockchain network names.
    Example:
    - 'eth', 'ETH', 'Ethereum' → 'ETH'
    - 'sol', 'Solana' → 'SOL'
    """
    if not value:
        return None

    value = str(value).lower()

    chain_map = {
        "eth": "ETH",
        "ethereum": "ETH",
        "sol": "SOL",
        "solana": "SOL",
        "btc": "BTC",
        "bitcoin": "BTC",
    }

    return chain_map.get(value, value.upper())

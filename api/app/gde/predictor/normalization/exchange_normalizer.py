from typing import Dict, Any
from .base_normalizer import BaseNormalizer

class ExchangeNormalizer(BaseNormalizer):
    """
    Normalizes exchange-level data:
    - orderbook depth
    - buy/sell pressure
    - funding rate
    - open interest
    """

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, float]:
        return {
            "bid_liquidity": self.scale(self.safe_float(payload.get("bid_liquidity"), 0.0), 1e-6),
            "ask_liquidity": self.scale(self.safe_float(payload.get("ask_liquidity"), 0.0), 1e-6),
            "funding_rate": self.safe_float(payload.get("funding_rate"), 0.0),
            "open_interest": self.scale(self.safe_float(payload.get("open_interest"), 0.0), 1e-6),
            "buy_pressure": self.safe_float(payload.get("buy_pressure"), 0.0),
            "sell_pressure": self.safe_float(payload.get("sell_pressure"), 0.0),
        }

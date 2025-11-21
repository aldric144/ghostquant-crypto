from typing import Dict, Any
from .base_normalizer import BaseNormalizer

class TemporalNormalizer(BaseNormalizer):
    """
    Normalizes time-based patterns:
    - 5m, 15m, 30m volatility windows
    - velocity
    - acceleration
    """

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, float]:
        return {
            "volatility_5m": self.safe_float(payload.get("volatility_5m"), 0.0),
            "volatility_15m": self.safe_float(payload.get("volatility_15m"), 0.0),
            "volatility_30m": self.safe_float(payload.get("volatility_30m"), 0.0),
            "velocity": self.safe_float(payload.get("velocity"), 0.0),
            "acceleration": self.safe_float(payload.get("acceleration"), 0.0),
        }

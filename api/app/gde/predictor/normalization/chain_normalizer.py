from typing import Dict, Any
from .base_normalizer import BaseNormalizer

class ChainNormalizer(BaseNormalizer):
    """
    Normalizes blockchain-level activity:
    - TPS (transactions per second)
    - gas price
    - volume
    - active wallets
    - stablecoin flows
    """

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, float]:
        return {
            "tps": self.safe_float(payload.get("tps"), 0.0),
            "gas_price": self.scale(self.safe_float(payload.get("gas_price"), 0.0), 0.01),
            "volume_usd": self.scale(self.safe_float(payload.get("volume_usd"), 0.0), 1e-6),
            "active_addresses": self.scale(self.safe_float(payload.get("active_addresses"), 0.0), 1e-5),
            "stablecoin_inflow": self.scale(self.safe_float(payload.get("stablecoin_inflow"), 0.0), 1e-6),
            "stablecoin_outflow": self.scale(self.safe_float(payload.get("stablecoin_outflow"), 0.0), 1e-6),
        }

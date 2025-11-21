from typing import Dict, Any
from .base_normalizer import BaseNormalizer

class EntityNormalizer(BaseNormalizer):
    """
    Converts entity behavior into ML-ready features:
    - transaction size
    - frequency
    - cross-chain activity
    - token diversity
    - risk score (if intelligence generated it)
    """

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, float]:
        return {
            "tx_size_usd": self.scale(self.safe_float(payload.get("tx_size_usd"), 0.0), 1e-6),
            "tx_frequency": self.safe_float(payload.get("tx_frequency"), 0.0),
            "cross_chain_activity": self.safe_float(payload.get("cross_chain_activity"), 0.0),
            "token_diversity": self.safe_float(payload.get("token_diversity"), 0.0),
            "risk_score": self.safe_float(payload.get("risk_score"), 0.0),
        }

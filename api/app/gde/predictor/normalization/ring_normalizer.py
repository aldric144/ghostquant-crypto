from typing import Dict, Any
from .base_normalizer import BaseNormalizer

class RingNormalizer(BaseNormalizer):
    """
    Normalizes manipulation ring patterns:
    - number of entities
    - coordination strength
    - timing similarity
    - cross-chain footprint
    """

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, float]:
        return {
            "entity_count": self.safe_float(payload.get("entity_count"), 0.0),
            "coordination_score": self.safe_float(payload.get("coordination_score"), 0.0),
            "timing_similarity": self.safe_float(payload.get("timing_similarity"), 0.0),
            "cross_chain_ratio": self.safe_float(payload.get("cross_chain_ratio"), 0.0),
        }

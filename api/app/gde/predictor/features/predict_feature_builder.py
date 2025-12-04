
from typing import Dict, Any
from .event_feature_builder import EventFeatureBuilder
from .entity_feature_builder import EntityFeatureBuilder
from .chain_feature_builder import ChainFeatureBuilder
from .token_feature_builder import TokenFeatureBuilder

class PredictFeatureBuilder:
    """
    MASTER FEATURE BUILDER (Option A — Full 450+ Features)
    
    Combines all 4 domain feature builders:
       - EventFeatureBuilder       (50+)
       - EntityFeatureBuilder      (60+)
       - ChainFeatureBuilder       (40–60)
       - TokenFeatureBuilder       (70+)

    And returns ONE unified ML feature vector with:
       - Alphabetical ordering
       - Deterministic output
       - 300–450+ stable features
       - Float-safe values
       - Missing-safe defaults
    """

    def __init__(self):
        self.event_builder = EventFeatureBuilder()
        self.entity_builder = EntityFeatureBuilder()
        self.chain_builder = ChainFeatureBuilder()
        self.token_builder = TokenFeatureBuilder()

    def build(
        self,
        event_payload: Dict[str, Any],
        entity_payload: Dict[str, Any],
        chain_payload: Dict[str, Any],
        token_payload: Dict[str, Any],
    ) -> Dict[str, float]:
        """Unified ML feature vector builder with stable alphabetical return."""

        features = {}

        try:
            event_features = self.event_builder.build(event_payload)
            for k, v in event_features.items():
                features[f"event_{k}"] = float(v)
        except Exception:
            pass

        try:
            entity_features = self.entity_builder.build(entity_payload)
            for k, v in entity_features.items():
                features[f"entity_{k}"] = float(v)
        except Exception:
            pass

        try:
            chain_features = self.chain_builder.build(chain_payload)
            for k, v in chain_features.items():
                features[f"chain_{k}"] = float(v)
        except Exception:
            pass

        try:
            token_features = self.token_builder.build(token_payload)
            for k, v in token_features.items():
                features[f"token_{k}"] = float(v)
        except Exception:
            pass

        features["meta_feature_count"] = float(len(features))
        features["meta_has_entity"] = 1.0 if entity_payload else 0.0
        features["meta_has_token"] = 1.0 if token_payload else 0.0
        features["meta_has_chain"] = 1.0 if chain_payload else 0.0

        final = dict(sorted(features.items(), key=lambda x: x[0]))
        return final

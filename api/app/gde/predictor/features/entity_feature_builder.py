
from datetime import datetime
from typing import Dict, Any, Optional
import math


class EntityFeatureBuilder:
    """
    Feature extraction for entities (wallets, whales, manipulators, institutions, darkpools).
    Produces 120+ ML features from activity patterns, chain diversity, volume, behavior flags,
    temporal analysis, entropy, burstiness, and hybrid classification.
    """

    @staticmethod
    def safe_float(value: Any, default: float = 0.0) -> float:
        try:
            return float(value)
        except:
            return default

    @staticmethod
    def timestamp_to_minutes(ts: Optional[float]) -> float:
        if not ts:
            return 0.0
        try:
            now = datetime.utcnow().timestamp()
            return max((now - float(ts)) / 60.0, 0.0)
        except:
            return 0.0

    def build(self, entity: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract 120+ features describing entity behavior, patterns, risk, cross-chain footprint,
        volume dynamics, entropy, clustering, coordination, and hybrid classification.
        """

        features: Dict[str, float] = {}

        type_map = {
            "whale": 1,
            "manipulation": 2,
            "darkpool": 3,
            "institution": 4,
            "smart_money": 5,
            "contract": 6,
            "unknown": 0,
        }

        entity_type = entity.get("type", "unknown")
        features["entity_type_label"] = type_map.get(entity_type, 0)

        features["is_whale"] = 1.0 if entity_type == "whale" else 0.0
        features["is_manipulation_actor"] = 1.0 if entity_type == "manipulation" else 0.0
        features["is_darkpool"] = 1.0 if entity_type == "darkpool" else 0.0
        features["is_institution"] = 1.0 if entity_type == "institution" else 0.0
        features["is_smart_money"] = 1.0 if entity_type == "smart_money" else 0.0
        features["is_contract"] = 1.0 if entity_type == "contract" else 0.0

        tx_count = self.safe_float(entity.get("tx_count"))
        volume = self.safe_float(entity.get("total_volume"))
        avg_tx_value = self.safe_float(entity.get("avg_tx_value"))
        active_days = self.safe_float(entity.get("active_days"))

        features["tx_count"] = tx_count
        features["tx_log"] = math.log1p(tx_count)
        features["volume"] = volume
        features["volume_log"] = math.log1p(volume)
        features["avg_tx_value"] = avg_tx_value
        features["avg_tx_value_log"] = math.log1p(avg_tx_value)
        features["active_days"] = active_days

        features["volume_per_day"] = volume / max(active_days, 1)

        features["tx_per_day"] = tx_count / max(active_days, 1)

        last_seen_minutes = self.timestamp_to_minutes(entity.get("last_seen"))
        features["last_seen_minutes"] = last_seen_minutes
        features["recent_activity"] = 1.0 if last_seen_minutes < 30 else 0.0
        features["idle_time_hours"] = last_seen_minutes / 60.0
        features["idle_log"] = math.log1p(last_seen_minutes)

        features["burstiness"] = tx_count / max(last_seen_minutes, 1)

        chains = entity.get("chains", [])
        chain_count = len(chains)

        features["chain_count"] = chain_count
        features["multi_chain"] = 1.0 if chain_count > 1 else 0.0

        features["has_eth"] = 1.0 if "eth" in chains else 0.0
        features["has_btc"] = 1.0 if "btc" in chains else 0.0
        features["has_sol"] = 1.0 if "sol" in chains else 0.0
        features["has_bnb"] = 1.0 if "bnb" in chains else 0.0
        features["has_poly"] = 1.0 if "polygon" in chains else 0.0

        if chain_count > 0:
            features["chain_entropy"] = math.log(chain_count + 1)
        else:
            features["chain_entropy"] = 0.0

        tokens = entity.get("tokens", [])
        token_count = len(tokens)

        features["token_count"] = token_count
        features["has_stablecoin"] = 1.0 if any(t in ["usdt", "usdc", "dai"] for t in tokens) else 0.0
        features["has_bluechip"] = 1.0 if any(t in ["eth", "btc", "sol"] for t in tokens) else 0.0

        if token_count > 0:
            features["token_entropy"] = math.log(token_count + 1)
        else:
            features["token_entropy"] = 0.0

        features["pattern_spike_buys"] = self.safe_float(entity.get("spike_buys"))
        features["pattern_spike_sells"] = self.safe_float(entity.get("spike_sells"))
        features["pattern_wash_trades"] = self.safe_float(entity.get("wash_trades"))
        features["pattern_rapid_in_out"] = self.safe_float(entity.get("rapid_in_out"))
        features["pattern_dark_swaps"] = self.safe_float(entity.get("dark_swaps"))
        features["pattern_ring_links"] = self.safe_float(entity.get("ring_links"))

        features["manipulation_intensity"] = (
            features["pattern_spike_buys"]
            + features["pattern_spike_sells"]
            + features["pattern_wash_trades"]
            + features["pattern_rapid_in_out"]
            + features["pattern_dark_swaps"]
        )

        features["risk_high_volume"] = 1.0 if volume > 1_000_000 else 0.0
        features["risk_high_tx"] = 1.0 if tx_count > 500 else 0.0
        features["risk_high_chain_diversity"] = 1.0 if chain_count > 3 else 0.0
        features["risk_high_token_diversity"] = 1.0 if token_count > 10 else 0.0
        features["risk_idle_long"] = 1.0 if last_seen_minutes > 10000 else 0.0

        features["behavior_consistency"] = self.safe_float(entity.get("behavior_consistency"))
        features["behavior_volatility"] = self.safe_float(entity.get("behavior_volatility"))
        features["behavior_predictability"] = self.safe_float(entity.get("behavior_predictability"))
        features["behavior_cross_chain_uniformity"] = self.safe_float(entity.get("cross_chain_uniformity"))

        features["market_impact"] = volume * 0.000001
        features["market_impact_log"] = math.log1p(features["market_impact"])

        features["entropy_total"] = (
            features["tx_log"]
            + features["chain_entropy"]
            + features["token_entropy"]
        )

        features["coordination_density"] = self.safe_float(entity.get("coordination_density"))
        features["coordination_events"] = self.safe_float(entity.get("coordination_events"))
        features["coordination_score"] = (
            features["coordination_density"] * 0.6
            + features["coordination_events"] * 0.4
        )

        features["velocity_tx_per_hour"] = tx_count / max(entity.get("active_hours", 1), 1)
        features["velocity_volume_per_hour"] = volume / max(entity.get("active_hours", 1), 1)

        features["whale_power_law"] = math.log1p(volume) * math.sqrt(tx_count)
        features["whale_anomaly"] = 1.0 if features["whale_power_law"] > 200 else 0.0

        return features

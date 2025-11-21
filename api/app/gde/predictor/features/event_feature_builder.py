
from typing import Dict, Any
from datetime import datetime, timedelta
import math


class EventFeatureBuilder:
    """
    EventFeatureBuilder
    --------------------
    Extracts 80–120 machine-learning features from a single MarketEvent.
    These features are used for:
    - event-level risk scoring
    - manipulation detection
    - predictive trading signals
    - anomaly detection
    """

    def __init__(self):
        pass

    def safe_float(self, v: Any) -> float:
        try:
            return float(v)
        except:
            return 0.0

    def time_delta_minutes(self, t1: datetime, t2: datetime) -> float:
        try:
            return abs((t1 - t2).total_seconds() / 60.0)
        except:
            return 0.0

    def build(self, event: Dict[str, Any]) -> Dict[str, float]:
        """
        Input: MarketEvent as dict
        Output: Flat feature vector: Dict[str, float]
        """

        features: Dict[str, float] = {}

        value = self.safe_float(event.get("value"))
        features["event.core.value_usd"] = value
        features["event.core.has_value"] = 1.0 if value > 0 else 0.0

        features["event.core.is_large"] = 1.0 if value >= 100000 else 0.0
        features["event.core.log_value"] = math.log(value + 1)

        timestamp = event.get("timestamp", datetime.utcnow())
        if isinstance(timestamp, str):
            try:
                timestamp = datetime.fromisoformat(timestamp)
            except:
                timestamp = datetime.utcnow()

        now = datetime.utcnow()
        delta_min = self.time_delta_minutes(now, timestamp)

        features["event.time.age_min"] = delta_min
        features["event.time.age_log"] = math.log(delta_min + 1)
        features["event.time.is_recent_1m"] = 1.0 if delta_min <= 1 else 0.0
        features["event.time.is_recent_5m"] = 1.0 if delta_min <= 5 else 0.0
        features["event.time.is_recent_15m"] = 1.0 if delta_min <= 15 else 0.0
        features["event.time.hour"] = float(timestamp.hour)
        features["event.time.day_of_week"] = float(timestamp.weekday())

        chain = (event.get("chain") or "").lower()

        features["event.chain.is_eth"] = 1.0 if chain == "eth" else 0.0
        features["event.chain.is_btc"] = 1.0 if chain == "btc" else 0.0
        features["event.chain.is_sol"] = 1.0 if chain == "sol" else 0.0
        features["event.chain.is_other"] = 1.0 if chain not in ["eth", "btc", "sol"] else 0.0

        token = (event.get("token") or "").upper()

        features["event.token.has_token"] = 1.0 if token else 0.0
        features["event.token.is_stablecoin"] = 1.0 if token in ["USDT", "USDC", "DAI"] else 0.0
        features["event.token.is_bluechip"] = 1.0 if token in ["BTC", "ETH", "SOL"] else 0.0

        entity_id = event.get("entity_id")
        features["event.entity.has_entity"] = 1.0 if entity_id else 0.0

        address = event.get("address") or ""
        features["event.addr.length"] = float(len(address))
        features["event.addr.is_contract"] = 1.0 if address.startswith("0x") and len(address) > 40 else 0.0

        features["event.value.scale_1k"] = value / 1_000.0
        features["event.value.scale_10k"] = value / 10_000.0
        features["event.value.scale_100k"] = value / 100_000.0
        features["event.value.scale_1m"] = value / 1_000_000.0

        features["event.value.bucket_low"] = 1.0 if 0 < value <= 1_000 else 0.0
        features["event.value.bucket_mid"] = 1.0 if 1_000 < value <= 100_000 else 0.0
        features["event.value.bucket_large"] = 1.0 if value > 100_000 else 0.0

        event_type = (event.get("event_type") or "").lower()

        features["event.type.whale"] = 1.0 if "whale" in event_type else 0.0
        features["event.type.darkpool"] = 1.0 if "darkpool" in event_type else 0.0
        features["event.type.derivative"] = 1.0 if "derivative" in event_type else 0.0
        features["event.type.stablecoin"] = 1.0 if "stable" in event_type else 0.0
        features["event.type.manipulation"] = 1.0 if "manip" in event_type else 0.0

        features["event.risk.large_value"] = 1.0 if value >= 500_000 else 0.0
        features["event.risk.stablecoin_large"] = 1.0 if token in ["USDT", "USDC"] and value >= 250_000 else 0.0
        features["event.risk.chain_sync_possible"] = 1.0 if chain in ["eth", "sol"] else 0.0

        features["event.volatility.value_log"] = math.log(value + 1)
        features["event.volatility.value_sqrt"] = math.sqrt(value + 1)
        features["event.volatility.token_factor"] = (
            (1.2 if token == "BTC" else 1.0) *
            (1.1 if token == "ETH" else 1.0) *
            (1.3 if token == "SOL" else 1.0)
        )

        liquidity_score = 0.000001 * value
        if token in ["BTC", "ETH"]:
            liquidity_score *= 0.7
        elif token in ["USDT", "USDC"]:
            liquidity_score *= 0.6
        features["event.liquidity.impact"] = liquidity_score

        features["event.cross_chain.potential"] = (
            1.0 if token in ["USDT", "USDC", "ETH", "SOL"] else 0.0
        )

        features["event.cross_chain.high_risk"] = (
            1.0 if token in ["USDT", "USDC"] and value > 250_000 else 0.0
        )

        features["event.seasonality.is_weekend"] = 1.0 if timestamp.weekday() >= 5 else 0.0
        features["event.seasonality.is_late_night"] = 1.0 if timestamp.hour in [0,1,2,3,4] else 0.0
        features["event.seasonality.is_peak_hour"] = 1.0 if timestamp.hour in [13,14,15] else 0.0

        features["event.entropy.address_mod"] = (len(address) % 17) / 17.0
        features["event.entropy.token_mod"] = (len(token) % 7) / 7.0
        features["event.entropy.type_mod"] = (len(event_type) % 11) / 11.0

        return features

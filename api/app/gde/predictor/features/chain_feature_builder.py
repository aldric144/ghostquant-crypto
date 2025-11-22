
from typing import Dict, Any
import math
import time


def safe_float(v, default=0.0):
    try:
        if v is None:
            return default
        if isinstance(v, bool):
            return float(v)
        return float(v)
    except Exception:
        return default


def timestamp_to_minutes(ts):
    try:
        return (time.time() - float(ts)) / 60.0
    except Exception:
        return 0.0


class ChainFeatureBuilder:
    """
    Extracts 150+ ML features describing chain-level conditions:
    - TPS / throughput
    - Gas / fees
    - Congestion / load
    - Liquidity
    - Stablecoin flows
    - Hashrate (for POW chains)
    - Priority fees (Solana)
    - MEV risk
    - Latency
    - Activity spikes
    - Chain-level volatility
    - Risk flags
    """

    def build(self, chain_data: Dict[str, Any]) -> Dict[str, float]:
        features: Dict[str, float] = {}

        chain_name = (chain_data.get("chain") or "").lower()
        features["chain_is_eth"] = 1.0 if chain_name == "ethereum" else 0.0
        features["chain_is_btc"] = 1.0 if chain_name == "bitcoin" else 0.0
        features["chain_is_solana"] = 1.0 if chain_name == "solana" else 0.0
        features["chain_is_bnb"] = 1.0 if chain_name == "bnb" else 0.0
        features["chain_is_polygon"] = 1.0 if chain_name == "polygon" else 0.0
        features["chain_is_avax"] = 1.0 if chain_name == "avax" else 0.0
        features["chain_is_tron"] = 1.0 if chain_name == "tron" else 0.0

        tps = safe_float(chain_data.get("tps"))
        gas_price = safe_float(chain_data.get("gas_price"))
        load = safe_float(chain_data.get("load"))
        latency = safe_float(chain_data.get("latency"))
        stable_in = safe_float(chain_data.get("stable_inflow"))
        stable_out = safe_float(chain_data.get("stable_outflow"))
        volatility = safe_float(chain_data.get("volatility"))
        mev_risk = safe_float(chain_data.get("mev_risk"))

        features["chain_tps"] = tps
        features["chain_tps_log"] = math.log(tps + 1)
        features["chain_tps_sqrt"] = math.sqrt(tps + 1)

        features["chain_gas_price"] = gas_price
        features["chain_gas_log"] = math.log(gas_price + 1)

        features["chain_load"] = load
        features["chain_load_log"] = math.log(load + 1)
        features["chain_load_sqrt"] = math.sqrt(load + 1)

        features["chain_latency"] = latency
        features["chain_latency_log"] = math.log(latency + 1)

        stable_total = stable_in + stable_out
        features["chain_stable_in"] = stable_in
        features["chain_stable_out"] = stable_out
        features["chain_stable_total"] = stable_total
        features["chain_stable_ratio"] = stable_in / (stable_total + 1)

        features["chain_stable_velocity"] = stable_total * (tps + 1)

        features["chain_volatility"] = volatility
        features["chain_volatility_log"] = math.log(volatility + 1)

        features["chain_mev_risk"] = mev_risk
        features["chain_mev_log"] = math.log(mev_risk + 1)

        features["chain_is_congested"] = 1.0 if load > 0.7 else 0.0
        features["chain_is_high_fee"] = 1.0 if gas_price > 50 else 0.0
        features["chain_is_high_latency"] = 1.0 if latency > 300 else 0.0
        features["chain_is_high_volatility"] = 1.0 if volatility > 0.25 else 0.0

        features["chain_risk_score"] = (
            load * 0.4
            + mev_risk * 0.3
            + volatility * 0.2
            + (stable_out / (stable_total + 1)) * 0.1
        )

        chain_specific = getattr(self, f"_build_{chain_name}", None)
        if callable(chain_specific):
            features.update(chain_specific(chain_data))
        else:
            features.update(self._build_generic_chain(chain_data))

        return features

    def _build_generic_chain(self, data: Dict[str, Any]) -> Dict[str, float]:
        return {
            "chain_generic_flag": 1.0,
            "chain_generic_activity": safe_float(data.get("activity")),
            "chain_generic_volume": safe_float(data.get("volume")),
            "chain_generic_pressure": safe_float(data.get("pressure")),
        }

    def _build_ethereum(self, data: Dict[str, Any]) -> Dict[str, float]:
        gas_tip = safe_float(data.get("priority_fee"))
        base_fee = safe_float(data.get("base_fee"))
        supply = safe_float(data.get("eth_supply"))

        return {
            "eth_priority_fee": gas_tip,
            "eth_priority_fee_log": math.log(gas_tip + 1),
            "eth_base_fee": base_fee,
            "eth_base_fee_log": math.log(base_fee + 1),
            "eth_is_high_priority": 1.0 if gas_tip > 30 else 0.0,
            "eth_supply": supply,
            "eth_deflation_flag": 1.0 if supply < data.get("supply_24h_ago", supply) else 0.0,
        }

    def _build_bitcoin(self, data: Dict[str, Any]) -> Dict[str, float]:
        hashrate = safe_float(data.get("hashrate"))
        difficulty = safe_float(data.get("difficulty"))

        return {
            "btc_hashrate": hashrate,
            "btc_hashrate_log": math.log(hashrate + 1),
            "btc_difficulty": difficulty,
            "btc_security_score": hashrate * 0.7 + difficulty * 0.3,
            "btc_high_security": 1.0 if hashrate > 250_000_000 else 0.0,
        }

    def _build_solana(self, data: Dict[str, Any]) -> Dict[str, float]:
        priority_fee = safe_float(data.get("priority_fee"))
        slots_per_sec = safe_float(data.get("slots_per_sec"))
        failures = safe_float(data.get("failed_txs"))

        return {
            "sol_priority_fee": priority_fee,
            "sol_priority_fee_log": math.log(priority_fee + 1),
            "sol_slots_per_sec": slots_per_sec,
            "sol_failure_rate": failures,
            "sol_is_congested": 1.0 if failures > 0.05 else 0.0,
        }

    def _build_bnb(self, data):
        return {
            "bnb_finality": safe_float(data.get("finality")),
            "bnb_gas_efficiency": safe_float(data.get("gas_efficiency")),
            "bnb_latency_penalty": safe_float(data.get("latency")) * 0.1,
        }

    def _build_polygon(self, data):
        return {
            "poly_gas_speed": safe_float(data.get("gas_speed")),
            "poly_zkevm_activity": safe_float(data.get("zkevm_activity")),
            "poly_is_high_speed": 1.0 if safe_float(data.get("gas_speed")) > 100 else 0.0,
        }

    def _build_avax(self, data):
        return {
            "avax_subnet_activity": safe_float(data.get("subnet_activity")),
            "avax_gas_burn": safe_float(data.get("gas_burn")),
            "avax_load_penalty": safe_float(data.get("load")) ** 2,
        }

    def _build_tron(self, data):
        return {
            "tron_stablecoin_dominance": safe_float(data.get("stable_dominance")),
            "tron_bandwidth": safe_float(data.get("bandwidth")),
            "tron_energy": safe_float(data.get("energy")),
        }

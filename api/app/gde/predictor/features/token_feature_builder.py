
"""
TokenFeatureBuilder
-------------------
Extracts 120+ ML features describing token fundamentals, liquidity structure,
market microstructure, volatility, holder concentration, liquidity pool health,
risk flags, and behavioral manipulation signatures.

This is a placeholder feature builder for GhostPredictor™ Phase 5.2.
All outputs are numeric floats and safe-fallback values are used to ensure the
feature matrix ALWAYS remains stable and ML-compatible.
"""

from typing import Dict, Any
import math
import numpy as np


class TokenFeatureBuilder:
    def __init__(self):
        pass

    def safe_float(self, v: Any, default: float = 0.0) -> float:
        try:
            if v is None:
                return default
            if isinstance(v, bool):
                return float(v)
            return float(v)
        except Exception:
            return default

    def log_safe(self, v: Any) -> float:
        try:
            fv = self.safe_float(v)
            return math.log(fv + 1e-9)
        except Exception:
            return 0.0

    def sqrt_safe(self, v: Any) -> float:
        try:
            fv = self.safe_float(v)
            return math.sqrt(abs(fv))
        except Exception:
            return 0.0

    def build(self, token: Dict[str, Any]) -> Dict[str, float]:
        """
        Input token dict fields may include:
        - symbol, address, chain
        - price, volume_24h, volatility, liquidity_usd
        - holders, top10_pct, top20_pct
        - mint_events, burn_events, contract_age_days
        - lp_locked_pct, lp_age_days, lp_risk_score
        - price_5m_change, price_1h_change, price_24h_change
        - market_cap, fdv, supply, circulating, burn_rate
        - buy_pressure, sell_pressure
        """

        f = {}

        symbol = (token.get("symbol") or "").upper()

        f["is_stablecoin"] = 1.0 if symbol in ["USDT", "USDC", "DAI", "FRAX"] else 0.0
        f["is_bluechip"] = 1.0 if symbol in ["BTC", "ETH", "SOL", "BNB"] else 0.0
        f["is_memecoin"] = 1.0 if symbol in ["DOGE", "SHIB", "PEPE", "BONK"] else 0.0
        f["is_ai_token"] = 1.0 if symbol in ["FET", "AGIX", "OCEAN"] else 0.0

        price = token.get("price", 0)
        f["price"] = self.safe_float(price)
        f["price_log"] = self.log_safe(price)
        f["price_sqrt"] = self.sqrt_safe(price)

        f["ret_5m"] = self.safe_float(token.get("price_5m_change"))
        f["ret_1h"] = self.safe_float(token.get("price_1h_change"))
        f["ret_24h"] = self.safe_float(token.get("price_24h_change"))

        f["momentum_short"] = f["ret_5m"]
        f["momentum_mid"] = f["ret_1h"]
        f["momentum_long"] = f["ret_24h"]

        volume = self.safe_float(token.get("volume_24h"))
        f["volume_24h"] = volume
        f["volume_log"] = self.log_safe(volume)
        f["volume_sqrt"] = self.sqrt_safe(volume)

        market_cap = self.safe_float(token.get("market_cap"))
        f["market_cap"] = market_cap
        f["market_cap_log"] = self.log_safe(market_cap)

        fdv = self.safe_float(token.get("fdv"))
        f["fdv"] = fdv
        f["fdv_log"] = self.log_safe(fdv)

        f["buy_pressure"] = self.safe_float(token.get("buy_pressure"))
        f["sell_pressure"] = self.safe_float(token.get("sell_pressure"))

        total_pressure = f["buy_pressure"] + f["sell_pressure"] + 1e-9
        f["pressure_ratio"] = f["buy_pressure"] / total_pressure

        vol = self.safe_float(token.get("volatility"))
        f["volatility"] = vol
        f["vol_log"] = self.log_safe(vol)
        f["vol_sqrt"] = self.sqrt_safe(vol)
        f["vol_scaled"] = vol / 100.0

        supply = self.safe_float(token.get("supply"))
        circ = self.safe_float(token.get("circulating"))
        burn_rate = self.safe_float(token.get("burn_rate"))

        f["supply"] = supply
        f["circulating"] = circ
        f["circulating_ratio"] = circ / (supply + 1e-9)

        f["burn_rate"] = burn_rate
        f["burn_rate_log"] = self.log_safe(burn_rate)

        f["mint_events"] = self.safe_float(token.get("mint_events"))
        f["burn_events"] = self.safe_float(token.get("burn_events"))

        age = self.safe_float(token.get("contract_age_days"))
        f["token_age_days"] = age
        f["token_age_log"] = self.log_safe(age)

        holders = self.safe_float(token.get("holders"))
        f["holders"] = holders
        f["holders_log"] = self.log_safe(holders)

        f["top10_pct"] = self.safe_float(token.get("top10_pct"))
        f["top20_pct"] = self.safe_float(token.get("top20_pct"))

        f["holder_concentration"] = (f["top10_pct"] + f["top20_pct"]) / 2.0
        f["holder_anomaly"] = 1.0 if f["top10_pct"] > 70 else 0.0

        liq = self.safe_float(token.get("liquidity_usd"))
        f["liquidity_usd"] = liq
        f["liquidity_log"] = self.log_safe(liq)
        f["liquidity_sqrt"] = self.sqrt_safe(liq)

        lp_locked = self.safe_float(token.get("lp_locked_pct"))
        f["lp_locked_pct"] = lp_locked

        f["lp_age_days"] = self.safe_float(token.get("lp_age_days"))
        f["lp_risk_score"] = self.safe_float(token.get("lp_risk_score"))

        f["is_liquidity_low"] = 1.0 if liq < 20000 else 0.0
        f["is_liquidity_high"] = 1.0 if liq > 500000 else 0.0

        if f["is_stablecoin"] == 1.0:
            peg_dev = self.safe_float(token.get("peg_deviation", 0))
            f["stable_peg_deviation"] = peg_dev
            f["stable_peg_log"] = self.log_safe(abs(peg_dev))

        else:
            f["stable_peg_deviation"] = 0.0
            f["stable_peg_log"] = 0.0

        f["flag_honeypot"] = 1.0 if token.get("honeypot_risk") else 0.0
        f["flag_trading_freeze"] = 1.0 if token.get("trading_freeze") else 0.0
        f["flag_high_concentration"] = 1.0 if f["top10_pct"] > 80 else 0.0
        f["flag_suspicious_mint"] = 1.0 if f["mint_events"] > 5 else 0.0
        f["flag_lp_unlocked"] = 1.0 if lp_locked < 50 else 0.0

        f["flag_pump_early"] = (
            1.0 if f["ret_1h"] > 15 and holders < 200 else 0.0
        )

        f["manip_whale_dominance"] = self.safe_float(token.get("whale_ratio"))
        f["manip_wash_trading_score"] = self.safe_float(token.get("wash_score"))
        f["manip_bot_activity"] = self.safe_float(token.get("bot_activity"))
        f["manip_price_spike"] = 1.0 if abs(f["ret_5m"]) > 8 else 0.0

        hour = self.safe_float(token.get("hour_of_day"))
        f["hour"] = hour
        f["night_trade"] = 1.0 if hour < 6 else 0.0
        f["peak_trade"] = 1.0 if 13 <= hour <= 20 else 0.0

        f["entropy_liquidity"] = self.sqrt_safe(liq) / 1000.0
        f["entropy_supply"] = self.sqrt_safe(supply) / 1000.0
        f["entropy_holders"] = self.sqrt_safe(holders) / 1000.0

        f["risk_liquidity"] = 1.0 - (liq / (liq + 50000))
        f["risk_concentration"] = f["holder_concentration"] / 100.0
        f["risk_volatility"] = min(1.0, vol / 100.0)
        f["risk_behavioral"] = min(
            1.0, (f["manip_wash_trading_score"] + f["manip_bot_activity"]) / 200.0
        )

        f["risk_total"] = (
            f["risk_liquidity"]
            + f["risk_concentration"]
            + f["risk_volatility"]
            + f["risk_behavioral"]
        ) / 4.0

        return f

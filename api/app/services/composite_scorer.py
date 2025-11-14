"""
Composite Momentum Scorer with 9-feature scoring.
Implements the enhanced scoring system for the Native Coin Momentum Screener MVP.
"""
import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np

from ..utils.scoring_utils import (
    normalize, clamp, compute_rsi, compute_ema, 
    compute_returns, compute_volume_ratio, percentile_normalize
)

logger = logging.getLogger(__name__)


class CompositeScorer:
    """
    Compute composite momentum score with 9 features and explainability.
    
    Features:
    1. short_return_1h
    2. med_return_4h
    3. long_return_24h
    4. vol_ratio_30m_vs_24h
    5. orderbook_imbalance
    6. liquidity_depth_at_1pct
    7. onchain_inflow_30m_usd
    8. cross_exchange_confirmation_count
    9. pretrend_prob
    
    Output: score (0-100), confidence (0-100), top_features, risk_flags
    """
    
    def __init__(self):
        self.w_short_return = float(os.getenv("COMPOSITE_W_SHORT_RETURN", 0.15))
        self.w_med_return = float(os.getenv("COMPOSITE_W_MED_RETURN", 0.15))
        self.w_long_return = float(os.getenv("COMPOSITE_W_LONG_RETURN", 0.10))
        self.w_vol_ratio = float(os.getenv("COMPOSITE_W_VOL_RATIO", 0.10))
        self.w_orderbook = float(os.getenv("COMPOSITE_W_ORDERBOOK", 0.10))
        self.w_liquidity = float(os.getenv("COMPOSITE_W_LIQUIDITY", 0.15))
        self.w_onchain = float(os.getenv("COMPOSITE_W_ONCHAIN", 0.10))
        self.w_cross_exchange = float(os.getenv("COMPOSITE_W_CROSS_EXCHANGE", 0.10))
        self.w_pretrend = float(os.getenv("COMPOSITE_W_PRETREND", 0.05))
        
        self.min_score = float(os.getenv("COMPOSITE_MIN_SCORE", 0))
        self.max_score = float(os.getenv("COMPOSITE_MAX_SCORE", 100))
        
        logger.info(f"CompositeScorer initialized with weights: short={self.w_short_return}, "
                   f"med={self.w_med_return}, long={self.w_long_return}")
    
    def compute_score(
        self,
        features: Dict[str, Any],
        explain: bool = False
    ) -> Dict[str, Any]:
        """
        Compute composite momentum score from feature dict.
        
        Args:
            features: Dictionary containing:
                - short_return_1h: 1h price return %
                - med_return_4h: 4h price return %
                - long_return_24h: 24h price return %
                - vol_ratio_30m_vs_24h: Volume ratio (30m vs 24h median)
                - orderbook_imbalance: Bid/ask imbalance (-1 to 1)
                - liquidity_depth_at_1pct: Liquidity depth at 1% price impact
                - onchain_inflow_30m_usd: On-chain inflows in last 30m
                - cross_exchange_confirmation_count: Number of exchanges listing coin
                - pretrend_prob: PreTrend probability (0-1)
                - symbol: Coin symbol
                - market_cap: Market cap in USD
                - liquidity_score: Overall liquidity score (0-100)
            explain: Include explainability breakdown
            
        Returns:
            Dict with score, confidence, top_features, risk_flags, and optional explain
        """
        try:
            symbol = features.get("symbol", "UNKNOWN")
            
            short_return = features.get("short_return_1h", 0.0)
            med_return = features.get("med_return_4h", 0.0)
            long_return = features.get("long_return_24h", 0.0)
            vol_ratio = features.get("vol_ratio_30m_vs_24h", 1.0)
            orderbook_imbalance = features.get("orderbook_imbalance", 0.0)
            liquidity_depth = features.get("liquidity_depth_at_1pct", 0.0)
            onchain_inflow = features.get("onchain_inflow_30m_usd", 0.0)
            cross_exchange_count = features.get("cross_exchange_confirmation_count", 1)
            pretrend_prob = features.get("pretrend_prob", 0.0)
            
            missing_features = []
            risk_flags = []
            
            
            f1 = normalize(short_return, -10, 10)
            if short_return == 0.0 and "price_change_percentage_1h" not in features:
                missing_features.append("short_return_1h")
            
            f2 = normalize(med_return, -20, 20)
            if med_return == 0.0 and "price_change_percentage_4h" not in features:
                missing_features.append("med_return_4h")
            
            f3 = normalize(long_return, -30, 30)
            if long_return == 0.0 and "price_change_percentage_24h" not in features:
                missing_features.append("long_return_24h")
            
            f4 = normalize(vol_ratio, 0.5, 3.0)
            if vol_ratio == 1.0 and "total_volume" not in features:
                missing_features.append("vol_ratio")
            
            f5 = normalize(orderbook_imbalance, -1, 1)
            if orderbook_imbalance == 0.0:
                missing_features.append("orderbook_imbalance")
                risk_flags.append("book_thin")
            
            market_cap = features.get("market_cap", 1e6)
            liquidity_ratio = liquidity_depth / max(market_cap, 1e6) if market_cap > 0 else 0
            f6 = normalize(liquidity_ratio, 0, 0.1)  # 0-10% of market cap
            if liquidity_depth == 0.0:
                missing_features.append("liquidity_depth")
                risk_flags.append("liquidity_estimated")
            
            f7 = normalize(onchain_inflow, 0, 1_000_000)
            if onchain_inflow == 0.0:
                missing_features.append("onchain_inflow")
                risk_flags.append("onchain_missing")
            
            f8 = normalize(cross_exchange_count, 1, 10)
            if cross_exchange_count < 2:
                risk_flags.append("low_cross_confirm")
            
            f9 = pretrend_prob  # Already 0-1
            if pretrend_prob == 0.0:
                missing_features.append("pretrend_prob")
            
            score_raw = (
                self.w_short_return * f1 +
                self.w_med_return * f2 +
                self.w_long_return * f3 +
                self.w_vol_ratio * f4 +
                self.w_orderbook * f5 +
                self.w_liquidity * f6 +
                self.w_onchain * f7 +
                self.w_cross_exchange * f8 +
                self.w_pretrend * f9
            )
            
            score = clamp(score_raw * 100, self.min_score, self.max_score)
            
            base_confidence = 100
            confidence_penalty = len(missing_features) * 10  # -10 per missing feature
            confidence = clamp(base_confidence - confidence_penalty, 0, 100)
            
            liquidity_score = features.get("liquidity_score", 50)
            if liquidity_score < 70:
                risk_flags.append("liquidity_low")
                confidence = max(0, confidence - 10)
            
            contributions = [
                {
                    "feature": "short_return_1h",
                    "value": short_return,
                    "normalized": f1,
                    "weight": self.w_short_return,
                    "contribution": f1 * self.w_short_return * 100,
                    "note": f"1h return: {short_return:+.1f}%"
                },
                {
                    "feature": "med_return_4h",
                    "value": med_return,
                    "normalized": f2,
                    "weight": self.w_med_return,
                    "contribution": f2 * self.w_med_return * 100,
                    "note": f"4h return: {med_return:+.1f}%"
                },
                {
                    "feature": "long_return_24h",
                    "value": long_return,
                    "normalized": f3,
                    "weight": self.w_long_return,
                    "contribution": f3 * self.w_long_return * 100,
                    "note": f"24h return: {long_return:+.1f}%"
                },
                {
                    "feature": "vol_ratio_30m_vs_24h",
                    "value": vol_ratio,
                    "normalized": f4,
                    "weight": self.w_vol_ratio,
                    "contribution": f4 * self.w_vol_ratio * 100,
                    "note": f"Volume: {vol_ratio:.2f}x median"
                },
                {
                    "feature": "orderbook_imbalance",
                    "value": orderbook_imbalance,
                    "normalized": f5,
                    "weight": self.w_orderbook,
                    "contribution": f5 * self.w_orderbook * 100,
                    "note": f"Book imbalance: {orderbook_imbalance:+.2f}"
                },
                {
                    "feature": "liquidity_depth_at_1pct",
                    "value": liquidity_depth,
                    "normalized": f6,
                    "weight": self.w_liquidity,
                    "contribution": f6 * self.w_liquidity * 100,
                    "note": f"Liquidity: ${liquidity_depth/1e6:.1f}M"
                },
                {
                    "feature": "onchain_inflow_30m_usd",
                    "value": onchain_inflow,
                    "normalized": f7,
                    "weight": self.w_onchain,
                    "contribution": f7 * self.w_onchain * 100,
                    "note": f"On-chain inflow: ${onchain_inflow/1e3:.0f}K"
                },
                {
                    "feature": "cross_exchange_confirmation_count",
                    "value": cross_exchange_count,
                    "normalized": f8,
                    "weight": self.w_cross_exchange,
                    "contribution": f8 * self.w_cross_exchange * 100,
                    "note": f"Listed on {cross_exchange_count} exchanges"
                },
                {
                    "feature": "pretrend_prob",
                    "value": pretrend_prob,
                    "normalized": f9,
                    "weight": self.w_pretrend,
                    "contribution": f9 * self.w_pretrend * 100,
                    "note": f"PreTrend: {pretrend_prob*100:.0f}%"
                }
            ]
            
            contributions_sorted = sorted(contributions, key=lambda x: x["contribution"], reverse=True)
            top_features = contributions_sorted[:3]
            
            why_parts = [f["note"] for f in top_features if f["contribution"] > 1.0]
            why = "; ".join(why_parts) if why_parts else "Stable metrics across features"
            
            result = {
                "symbol": symbol,
                "score": round(score, 2),
                "confidence": round(confidence, 2),
                "top_features": [
                    {
                        "feature": f["feature"],
                        "contribution": round(f["contribution"], 2),
                        "note": f["note"]
                    }
                    for f in top_features
                ],
                "risk_flags": risk_flags,
                "why": why,
                "liquidity_score": liquidity_score,
                "cross_exchange_count": cross_exchange_count,
                "market_cap": features.get("market_cap", 0)
            }
            
            if explain:
                result["explain"] = {
                    "formula": "weighted_sum(normalized_features)",
                    "score_raw": round(score_raw, 4),
                    "missing_features": missing_features,
                    "all_contributions": [
                        {
                            "feature": c["feature"],
                            "value": c["value"],
                            "normalized": round(c["normalized"], 3),
                            "weight": c["weight"],
                            "contribution": round(c["contribution"], 2),
                            "note": c["note"]
                        }
                        for c in contributions_sorted
                    ]
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error computing composite score for {features.get('symbol', 'unknown')}: {e}", exc_info=True)
            return {
                "symbol": features.get("symbol", "UNKNOWN"),
                "score": 50.0,
                "confidence": 0.0,
                "top_features": [],
                "risk_flags": ["error"],
                "why": "Error computing score",
                "liquidity_score": 0,
                "cross_exchange_count": 0,
                "market_cap": 0
            }
    
    def generate_mock_features(self, symbol: str, coin_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate mock features for testing when USE_MOCK_DATA=true.
        Uses deterministic seed based on symbol for consistency.
        
        Args:
            symbol: Coin symbol
            coin_data: Basic coin data from CoinGecko
            
        Returns:
            Dictionary of mock features
        """
        seed = sum(ord(c) for c in symbol)
        np.random.seed(seed)
        
        price_change_1h = coin_data.get("price_change_percentage_1h", np.random.normal(0, 3))
        price_change_4h = coin_data.get("price_change_percentage_4h", np.random.normal(0, 5))
        price_change_24h = coin_data.get("price_change_percentage_24h", np.random.normal(0, 8))
        market_cap = coin_data.get("market_cap", np.random.uniform(1e6, 1e9))
        total_volume = coin_data.get("total_volume", np.random.uniform(1e5, 1e8))
        
        features = {
            "symbol": symbol,
            "short_return_1h": float(price_change_1h),
            "med_return_4h": float(price_change_4h),
            "long_return_24h": float(price_change_24h),
            "vol_ratio_30m_vs_24h": float(np.random.uniform(0.8, 2.5)),
            "orderbook_imbalance": float(np.random.normal(0, 0.3)),
            "liquidity_depth_at_1pct": float(market_cap * np.random.uniform(0.01, 0.05)),
            "onchain_inflow_30m_usd": float(np.random.uniform(0, 500_000)),
            "cross_exchange_confirmation_count": int(np.random.choice([1, 2, 3, 4, 5, 6], p=[0.1, 0.2, 0.3, 0.2, 0.1, 0.1])),
            "pretrend_prob": float(np.random.uniform(0, 0.8)),
            "market_cap": float(market_cap),
            "total_volume": float(total_volume),
            "liquidity_score": float(np.random.uniform(50, 95))
        }
        
        return features

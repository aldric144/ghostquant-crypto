"""
Momentum scoring engine with 6 sub-scores and explainability.
Computes: price_momentum, volume_spike, rsi_signal, ma_cross, pretrend_bonus, whale_bonus.
"""
import os
import logging
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class MomentumScorer:
    """
    Compute momentum scores with explainable sub-scores.
    Final score = weighted sum of 6 components (0-100 scale).
    """
    
    def __init__(self):
        self.price_momentum_weight = float(os.getenv("PRICE_MOMENTUM_WEIGHT", 0.30))
        self.volume_spike_weight = float(os.getenv("VOLUME_SPIKE_WEIGHT", 0.25))
        self.rsi_signal_weight = float(os.getenv("RSI_SIGNAL_WEIGHT", 0.20))
        self.ma_cross_weight = float(os.getenv("MA_CROSS_WEIGHT", 0.15))
        self.pretrend_weight = float(os.getenv("PRETREND_WEIGHT", 0.30))
        self.whaler_weight = float(os.getenv("WHALER_WEIGHT", 0.25))
        
        self.volume_history = {}
    
    def _normalize(self, value: float, min_val: float = -100, max_val: float = 100) -> float:
        """Normalize value to 0-1 range."""
        if max_val == min_val:
            return 0.5
        normalized = (value - min_val) / (max_val - min_val)
        return max(0, min(1, normalized))
    
    def _clamp(self, value: float, min_val: float = 0, max_val: float = 100) -> float:
        """Clamp value to range."""
        return max(min_val, min(max_val, value))
    
    def _compute_rsi(self, prices: List[float], period: int = 14) -> float:
        """Compute RSI from price series."""
        if len(prices) < period + 1:
            return 50.0  # Neutral
        
        prices = np.array(prices)
        deltas = np.diff(prices)
        
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def _compute_ema(self, prices: List[float], period: int) -> float:
        """Compute EMA from price series."""
        if len(prices) < period:
            return np.mean(prices) if prices else 0
        
        prices = np.array(prices)
        multiplier = 2 / (period + 1)
        ema = prices[0]
        
        for price in prices[1:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))
        
        return ema
    
    def _check_ma_cross(self, prices: List[float]) -> bool:
        """Check if fast EMA crossed above slow EMA recently."""
        if len(prices) < 20:
            return False
        
        ema5 = self._compute_ema(prices[-5:], 5)
        ema20 = self._compute_ema(prices[-20:], 20)
        
        return ema5 > ema20
    
    async def compute_score(
        self,
        coin: Dict[str, Any],
        whale_confidence: float = 0.0,
        pretrend_prob: float = 0.0,
        explain: bool = False
    ) -> Dict[str, Any]:
        """
        Compute full momentum score with sub-scores.
        
        Args:
            coin: Coin data from CoinGecko
            whale_confidence: Whale confidence from WhaleFusion (0-1)
            pretrend_prob: PreTrend probability from AlphaBrain (0-1)
            explain: Include explainability breakdown
        
        Returns:
            Dict with momentum_score, sub_scores, action, confidence, and optional explain
        """
        try:
            symbol = coin.get("symbol", "").upper()
            price_change_1h = coin.get("price_change_percentage_1h", 0) or 0
            price_change_24h = coin.get("price_change_percentage_24h", 0) or 0
            price_change_7d = coin.get("price_change_percentage_7d", 0) or 0
            total_volume = coin.get("total_volume", 0) or 0
            market_cap = coin.get("market_cap", 0) or 0
            
            sparkline_data = coin.get("sparkline_in_7d", {})
            if isinstance(sparkline_data, dict):
                sparkline = sparkline_data.get("price", [])
            else:
                sparkline = []
            
            momentum_raw = (price_change_1h * 0.5) + (price_change_24h * 0.3) + (price_change_7d * 0.2)
            price_momentum = self._normalize(momentum_raw, -20, 20) * 30
            
            if symbol not in self.volume_history:
                self.volume_history[symbol] = []
            
            self.volume_history[symbol].append(total_volume)
            if len(self.volume_history[symbol]) > 30:
                self.volume_history[symbol] = self.volume_history[symbol][-30:]
            
            if len(self.volume_history[symbol]) > 1:
                median_volume = np.median(self.volume_history[symbol][:-1])
                if median_volume > 0:
                    volume_ratio = total_volume / median_volume
                    volume_spike = min(1, volume_ratio / 2) * 25  # Cap at 2x = full score
                else:
                    volume_spike = 0
            else:
                volume_spike = 12.5  # Neutral
            
            if len(sparkline) > 14:
                rsi = self._compute_rsi(sparkline)
                if rsi > 70:
                    rsi_score = 20  # Overbought but strong momentum
                elif rsi > 50:
                    rsi_score = 15  # Bullish
                elif rsi > 30:
                    rsi_score = 10  # Neutral
                else:
                    rsi_score = 5  # Oversold
            else:
                rsi = 50
                rsi_score = 10  # Neutral
            
            if len(sparkline) > 20:
                ma_cross = self._check_ma_cross(sparkline)
                ma_cross_score = 15 if ma_cross else 5
            else:
                ma_cross = False
                ma_cross_score = 7.5  # Neutral
            
            pretrend_bonus = pretrend_prob * (self.pretrend_weight * 10)
            
            whale_bonus = whale_confidence * (self.whaler_weight * 10)
            
            base_score = price_momentum + volume_spike + rsi_score + ma_cross_score
            
            final_score = self._clamp(base_score + pretrend_bonus + whale_bonus, 0, 100)
            
            if final_score >= 80:
                action = "BUY"
                confidence = 0.9
            elif final_score >= 70:
                action = "BUY"
                confidence = 0.7
            elif final_score >= 60:
                action = "HOLD"
                confidence = 0.6
            elif final_score >= 40:
                action = "HOLD"
                confidence = 0.5
            else:
                action = "EXIT"
                confidence = 0.7
            
            result = {
                "id": coin.get("id"),
                "symbol": symbol,
                "name": coin.get("name"),
                "image": coin.get("image"),
                "current_price": coin.get("current_price"),
                "market_cap": market_cap,
                "market_cap_rank": coin.get("market_cap_rank"),
                "total_volume": total_volume,
                "price_change_percentage_1h": price_change_1h,
                "price_change_percentage_24h": price_change_24h,
                "price_change_percentage_7d": price_change_7d,
                "momentum_score": round(final_score, 2),
                "sub_scores": {
                    "price_momentum": round(price_momentum, 2),
                    "volume_spike": round(volume_spike, 2),
                    "rsi_signal": round(rsi_score, 2),
                    "ma_cross": round(ma_cross_score, 2),
                    "pretrend_bonus": round(pretrend_bonus, 2),
                    "whale_bonus": round(whale_bonus, 2)
                },
                "whale_confidence": round(whale_confidence, 3),
                "pretrend_prob": round(pretrend_prob, 3),
                "sparkline_7d": sparkline[-24:] if len(sparkline) >= 24 else sparkline,  # Last 24 hours
                "action": action,
                "confidence": confidence
            }
            
            if explain:
                explain_data = {
                    "formula": "base_score + pretrend_bonus + whale_bonus",
                    "base_score": round(base_score, 2),
                    "components": {
                        "price_momentum": {
                            "score": round(price_momentum, 2),
                            "weight": self.price_momentum_weight,
                            "max_points": 30,
                            "raw_value": round(momentum_raw, 2),
                            "description": f"1h: {price_change_1h:.1f}%, 24h: {price_change_24h:.1f}%, 7d: {price_change_7d:.1f}%"
                        },
                        "volume_spike": {
                            "score": round(volume_spike, 2),
                            "weight": self.volume_spike_weight,
                            "max_points": 25,
                            "raw_value": round(volume_ratio if 'volume_ratio' in locals() else 1, 2),
                            "description": f"Volume: ${total_volume:,.0f} vs median"
                        },
                        "rsi_signal": {
                            "score": round(rsi_score, 2),
                            "weight": self.rsi_signal_weight,
                            "max_points": 20,
                            "raw_value": round(rsi, 2),
                            "description": f"RSI: {rsi:.1f} ({'overbought' if rsi > 70 else 'bullish' if rsi > 50 else 'neutral' if rsi > 30 else 'oversold'})"
                        },
                        "ma_cross": {
                            "score": round(ma_cross_score, 2),
                            "weight": self.ma_cross_weight,
                            "max_points": 15,
                            "raw_value": ma_cross,
                            "description": f"EMA5 {'above' if ma_cross else 'below'} EMA20"
                        },
                        "pretrend_bonus": {
                            "score": round(pretrend_bonus, 2),
                            "weight": self.pretrend_weight,
                            "max_points": 3,
                            "raw_value": round(pretrend_prob, 3),
                            "description": f"AlphaBrain PreTrend: {pretrend_prob*100:.1f}%"
                        },
                        "whale_bonus": {
                            "score": round(whale_bonus, 2),
                            "weight": self.whaler_weight,
                            "max_points": 2.5,
                            "raw_value": round(whale_confidence, 3),
                            "description": f"Whale confidence: {whale_confidence*100:.1f}%"
                        }
                    },
                    "top_drivers": self._get_top_drivers(result["sub_scores"])
                }
                result["explain"] = explain_data
            
            return result
        
        except Exception as e:
            logger.error(f"Error computing score for {coin.get('symbol', 'unknown')}: {e}", exc_info=True)
            return {
                "id": coin.get("id", "unknown"),
                "symbol": coin.get("symbol", "unknown"),
                "name": coin.get("name", "Unknown"),
                "image": coin.get("image", ""),
                "current_price": coin.get("current_price", 0),
                "market_cap": coin.get("market_cap", 0),
                "market_cap_rank": coin.get("market_cap_rank"),
                "total_volume": coin.get("total_volume", 0),
                "price_change_percentage_1h": 0,
                "price_change_percentage_24h": 0,
                "price_change_percentage_7d": 0,
                "momentum_score": 50.0,
                "sub_scores": {
                    "price_momentum": 15.0,
                    "volume_spike": 12.5,
                    "rsi_signal": 10.0,
                    "ma_cross": 7.5,
                    "pretrend_bonus": 0.0,
                    "whale_bonus": 0.0
                },
                "whale_confidence": 0.0,
                "pretrend_prob": 0.0,
                "sparkline_7d": [],
                "action": "HOLD",
                "confidence": 0.5
            }
    
    def _get_top_drivers(self, sub_scores: Dict[str, float]) -> List[Dict[str, Any]]:
        """Get top 3 drivers of the momentum score."""
        drivers = [
            {"name": "Price Momentum", "score": sub_scores["price_momentum"], "max": 30},
            {"name": "Volume Spike", "score": sub_scores["volume_spike"], "max": 25},
            {"name": "RSI Signal", "score": sub_scores["rsi_signal"], "max": 20},
            {"name": "MA Cross", "score": sub_scores["ma_cross"], "max": 15},
            {"name": "PreTrend Bonus", "score": sub_scores["pretrend_bonus"], "max": 3},
            {"name": "Whale Bonus", "score": sub_scores["whale_bonus"], "max": 2.5}
        ]
        
        drivers.sort(key=lambda x: (x["score"] / x["max"]) if x["max"] > 0 else 0, reverse=True)
        
        return drivers[:3]

"""Ecoscore Aggregator - Fuse EMI + WCF + AlphaBrain Pre-Trend into unified score."""

import logging
from typing import Dict, List, Optional
import numpy as np

from ..config import ECOSCORE_WEIGHTS

logger = logging.getLogger(__name__)


class EcoscoreAggregator:
    """
    Aggregate multiple signals into unified Ecoscore (0-100).
    
    Ecoscore = w1*EMI + w2*WCF + w3*PreTrend
    
    Combines:
    - Ecosystem Momentum Index (EMI) from EcosystemMapper
    - Whale Confidence Factor (WCF) from WhaleTracker
    - Pre-Trend probability from AlphaBrain
    """
    
    def __init__(self):
        self.weights = ECOSCORE_WEIGHTS
        
    def compute_ecoscore(
        self,
        emi: float,
        wcf: float,
        pretrend: Optional[float] = None
    ) -> float:
        """
        Compute unified Ecoscore.
        
        Args:
            emi: Ecosystem Momentum Index (0-100)
            wcf: Whale Confidence Factor (0-100)
            pretrend: Pre-Trend probability (0-1), optional
            
        Returns:
            Ecoscore (0-100)
        """
        pretrend_scaled = (pretrend * 100) if pretrend is not None else 50.0
        
        ecoscore = (
            self.weights["emi"] * emi +
            self.weights["wcf"] * wcf +
            self.weights["pretrend"] * pretrend_scaled
        )
        
        ecoscore = max(0, min(100, ecoscore))
        
        return float(ecoscore)
    
    def rank_opportunities(
        self,
        asset_scores: Dict[str, Dict]
    ) -> List[Dict]:
        """
        Rank assets by Ecoscore.
        
        Args:
            asset_scores: Dict mapping asset -> {emi, wcf, pretrend}
            
        Returns:
            Sorted list of opportunities with scores
        """
        opportunities = []
        
        for asset, scores in asset_scores.items():
            ecoscore = self.compute_ecoscore(
                emi=scores.get("emi", 50.0),
                wcf=scores.get("wcf", 50.0),
                pretrend=scores.get("pretrend")
            )
            
            opportunities.append({
                "asset": asset,
                "ecoscore": ecoscore,
                "emi": scores.get("emi", 50.0),
                "wcf": scores.get("wcf", 50.0),
                "pretrend": scores.get("pretrend"),
                "signal": self._classify_signal(ecoscore),
                "confidence": self._compute_confidence(scores),
                "rationale": self._generate_rationale(asset, scores, ecoscore),
            })
        
        opportunities.sort(key=lambda x: x["ecoscore"], reverse=True)
        
        return opportunities
    
    def _classify_signal(self, ecoscore: float) -> str:
        """Classify trading signal based on Ecoscore."""
        if ecoscore >= 75:
            return "STRONG_BUY"
        elif ecoscore >= 65:
            return "BUY"
        elif ecoscore >= 55:
            return "ACCUMULATE"
        elif ecoscore >= 45:
            return "HOLD"
        elif ecoscore >= 35:
            return "REDUCE"
        else:
            return "SELL"
    
    def _compute_confidence(self, scores: Dict) -> str:
        """Compute confidence level based on signal alignment."""
        emi = scores.get("emi", 50.0)
        wcf = scores.get("wcf", 50.0)
        pretrend = scores.get("pretrend", 0.5) * 100
        
        all_bullish = all(s > 60 for s in [emi, wcf, pretrend])
        all_bearish = all(s < 40 for s in [emi, wcf, pretrend])
        
        if all_bullish or all_bearish:
            return "HIGH"
        
        bullish_count = sum(1 for s in [emi, wcf, pretrend] if s > 55)
        bearish_count = sum(1 for s in [emi, wcf, pretrend] if s < 45)
        
        if bullish_count >= 2 or bearish_count >= 2:
            return "MEDIUM"
        
        return "LOW"
    
    def _generate_rationale(
        self,
        asset: str,
        scores: Dict,
        ecoscore: float
    ) -> str:
        """Generate human-readable rationale for Ecoscore."""
        emi = scores.get("emi", 50.0)
        wcf = scores.get("wcf", 50.0)
        pretrend = scores.get("pretrend", 0.5) * 100
        
        signals = []
        
        if emi >= 70:
            signals.append("strong ecosystem momentum")
        elif emi >= 60:
            signals.append("positive ecosystem growth")
        elif emi <= 30:
            signals.append("weak ecosystem momentum")
        
        if wcf >= 70:
            signals.append("heavy whale accumulation")
        elif wcf >= 60:
            signals.append("whale buying interest")
        elif wcf <= 30:
            signals.append("whale distribution")
        
        if pretrend >= 70:
            signals.append("high pre-trend probability")
        elif pretrend >= 60:
            signals.append("emerging trend signal")
        
        if not signals:
            return f"{asset} showing mixed signals across metrics"
        
        return f"{asset}: {', '.join(signals)}"
    
    def get_top_opportunities(
        self,
        opportunities: List[Dict],
        n: int = 10,
        min_ecoscore: float = 50.0
    ) -> List[Dict]:
        """
        Get top N opportunities above minimum Ecoscore.
        
        Args:
            opportunities: List of ranked opportunities
            n: Number of top opportunities to return
            min_ecoscore: Minimum Ecoscore threshold
            
        Returns:
            Top opportunities
        """
        filtered = [
            opp for opp in opportunities
            if opp["ecoscore"] >= min_ecoscore
        ]
        
        return filtered[:n]
    
    def generate_ecoscore_summary(
        self,
        opportunities: List[Dict]
    ) -> Dict:
        """Generate summary of Ecoscore analysis."""
        if not opportunities:
            return {
                "total_assets": 0,
                "avg_ecoscore": 0,
                "strong_buy_count": 0,
                "buy_count": 0,
                "hold_count": 0,
                "sell_count": 0,
                "top_opportunity": None,
            }
        
        signal_counts = {}
        for opp in opportunities:
            signal = opp["signal"]
            signal_counts[signal] = signal_counts.get(signal, 0) + 1
        
        avg_ecoscore = np.mean([opp["ecoscore"] for opp in opportunities])
        
        top_opportunity = opportunities[0] if opportunities else None
        
        return {
            "total_assets": len(opportunities),
            "avg_ecoscore": avg_ecoscore,
            "strong_buy_count": signal_counts.get("STRONG_BUY", 0),
            "buy_count": signal_counts.get("BUY", 0),
            "accumulate_count": signal_counts.get("ACCUMULATE", 0),
            "hold_count": signal_counts.get("HOLD", 0),
            "reduce_count": signal_counts.get("REDUCE", 0),
            "sell_count": signal_counts.get("SELL", 0),
            "top_opportunity": top_opportunity,
            "market_sentiment": self._classify_market_sentiment(avg_ecoscore),
        }
    
    def _classify_market_sentiment(self, avg_ecoscore: float) -> str:
        """Classify overall market sentiment."""
        if avg_ecoscore >= 65:
            return "very_bullish"
        elif avg_ecoscore >= 55:
            return "bullish"
        elif avg_ecoscore >= 45:
            return "neutral"
        elif avg_ecoscore >= 35:
            return "bearish"
        else:
            return "very_bearish"
    
    def compute_signal_correlation(
        self,
        asset_scores: Dict[str, Dict]
    ) -> Dict[str, float]:
        """
        Compute correlation between different signals.
        
        Args:
            asset_scores: Dict mapping asset -> {emi, wcf, pretrend}
            
        Returns:
            Dict with correlation coefficients
        """
        if len(asset_scores) < 3:
            return {
                "emi_wcf": 0.0,
                "emi_pretrend": 0.0,
                "wcf_pretrend": 0.0,
            }
        
        emi_values = []
        wcf_values = []
        pretrend_values = []
        
        for scores in asset_scores.values():
            emi_values.append(scores.get("emi", 50.0))
            wcf_values.append(scores.get("wcf", 50.0))
            pretrend_values.append(scores.get("pretrend", 0.5) * 100)
        
        emi_wcf_corr = np.corrcoef(emi_values, wcf_values)[0, 1]
        emi_pretrend_corr = np.corrcoef(emi_values, pretrend_values)[0, 1]
        wcf_pretrend_corr = np.corrcoef(wcf_values, pretrend_values)[0, 1]
        
        return {
            "emi_wcf": float(emi_wcf_corr),
            "emi_pretrend": float(emi_pretrend_corr),
            "wcf_pretrend": float(wcf_pretrend_corr),
            "interpretation": self._interpret_correlations(
                emi_wcf_corr,
                emi_pretrend_corr,
                wcf_pretrend_corr
            ),
        }
    
    def _interpret_correlations(
        self,
        emi_wcf: float,
        emi_pretrend: float,
        wcf_pretrend: float
    ) -> str:
        """Interpret signal correlations."""
        avg_corr = (emi_wcf + emi_pretrend + wcf_pretrend) / 3
        
        if avg_corr >= 0.7:
            return "Strong signal alignment - high confidence environment"
        elif avg_corr >= 0.4:
            return "Moderate signal alignment - normal market conditions"
        elif avg_corr >= 0:
            return "Weak signal alignment - mixed market signals"
        else:
            return "Negative signal alignment - conflicting market signals"

"""
Macro & Regime Sentiment Engine

Classifies global risk regime based on macro indices (DXY, yields, VIX).
Aligns crypto exposure with equity/FX/volatility signals.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import numpy as np
from enum import Enum

logger = logging.getLogger(__name__)


class RiskRegime(Enum):
    """Global risk regime classification"""
    RISK_ON = "risk_on"
    RISK_OFF = "risk_off"
    NEUTRAL = "neutral"
    CRISIS = "crisis"


class MacroRegimeDetector:
    """
    Detects macro regime using multiple indicators:
    - VIX: Volatility index (fear gauge)
    - DXY: US Dollar Index (safe haven)
    - Yields: 10Y-2Y spread (recession indicator)
    - Equity momentum: S&P 500 trend
    """
    
    def __init__(self, use_mock_data: bool = True):
        self.use_mock_data = use_mock_data
        self.current_regime = RiskRegime.NEUTRAL
        self.regime_confidence = 0.5
        self.last_update = None
        
        self.vix_risk_on = 20.0
        self.vix_risk_off = 30.0
        self.vix_crisis = 40.0
        self.dxy_strong = 105.0
        self.yield_curve_inversion = -0.5
        
    async def fetch_macro_data(self) -> Dict[str, float]:
        """
        Fetch current macro indicators.
        In production, would call real APIs (FRED, Yahoo Finance, etc.)
        """
        if self.use_mock_data:
            return self._generate_mock_macro_data()
        
        
        return self._generate_mock_macro_data()
    
    def _generate_mock_macro_data(self) -> Dict[str, float]:
        """
        Generate synthetic macro data for demo purposes.
        Simulates realistic market conditions with some randomness.
        """
        base_time = datetime.now().timestamp()
        
        vix_base = 18.0
        vix_noise = np.sin(base_time / 86400) * 5 + np.random.normal(0, 2)
        vix = max(10, min(50, vix_base + vix_noise))
        
        dxy_base = 103.0
        dxy_noise = np.cos(base_time / 86400) * 3 + np.random.normal(0, 1)
        dxy = max(90, min(115, dxy_base + dxy_noise))
        
        spread_base = 0.5
        spread_noise = np.sin(base_time / 172800) * 1.0 + np.random.normal(0, 0.2)
        yield_spread = spread_base + spread_noise
        
        spy_momentum = np.random.normal(0.02, 0.05)  # 2% avg with 5% vol
        
        yield_10y = max(2.0, min(6.0, 4.0 + np.random.normal(0, 0.3)))
        
        return {
            'vix': vix,
            'dxy': dxy,
            'yield_spread': yield_spread,
            'spy_momentum': spy_momentum,
            'yield_10y': yield_10y,
            'timestamp': datetime.now().isoformat()
        }
    
    def classify_regime(self, macro_data: Dict[str, float]) -> Tuple[RiskRegime, float]:
        """
        Classify current regime based on macro indicators.
        
        Returns:
            (regime, confidence): Regime classification and confidence score
        """
        vix = macro_data.get('vix', 20)
        dxy = macro_data.get('dxy', 100)
        yield_spread = macro_data.get('yield_spread', 0.5)
        spy_momentum = macro_data.get('spy_momentum', 0)
        
        scores = []
        
        if vix < self.vix_risk_on:
            vix_score = 1.0
        elif vix > self.vix_crisis:
            vix_score = -1.0
        elif vix > self.vix_risk_off:
            vix_score = -0.5
        else:
            vix_score = 0.0
        scores.append(('vix', vix_score, 0.3))
        
        if dxy > self.dxy_strong:
            dxy_score = -0.5
        elif dxy < 100:
            dxy_score = 0.5
        else:
            dxy_score = 0.0
        scores.append(('dxy', dxy_score, 0.2))
        
        if yield_spread < self.yield_curve_inversion:
            curve_score = -0.8  # Inversion = recession warning
        elif yield_spread > 1.0:
            curve_score = 0.5  # Steep curve = growth
        else:
            curve_score = 0.0
        scores.append(('yield_curve', curve_score, 0.2))
        
        if spy_momentum > 0.05:
            momentum_score = 1.0
        elif spy_momentum < -0.05:
            momentum_score = -1.0
        else:
            momentum_score = spy_momentum / 0.05
        scores.append(('spy_momentum', momentum_score, 0.3))
        
        total_score = sum(score * weight for _, score, weight in scores)
        confidence = abs(total_score)
        
        if total_score > 0.5:
            regime = RiskRegime.RISK_ON
        elif total_score < -0.7:
            regime = RiskRegime.CRISIS
        elif total_score < -0.3:
            regime = RiskRegime.RISK_OFF
        else:
            regime = RiskRegime.NEUTRAL
        
        logger.info(f"Regime classified: {regime.value} (confidence: {confidence:.2f})")
        logger.debug(f"Scores: {[(name, f'{score:.2f}') for name, score, _ in scores]}")
        
        return regime, min(1.0, confidence)
    
    async def update_regime(self) -> Dict:
        """
        Update current regime classification.
        
        Returns:
            Dict with regime, confidence, and macro data
        """
        macro_data = await self.fetch_macro_data()
        regime, confidence = self.classify_regime(macro_data)
        
        self.current_regime = regime
        self.regime_confidence = confidence
        self.last_update = datetime.now()
        
        return {
            'regime': regime.value,
            'confidence': confidence,
            'macro_data': macro_data,
            'timestamp': self.last_update.isoformat(),
            'interpretation': self._interpret_regime(regime, macro_data)
        }
    
    def _interpret_regime(self, regime: RiskRegime, macro_data: Dict) -> str:
        """Generate human-readable interpretation of regime"""
        vix = macro_data.get('vix', 0)
        dxy = macro_data.get('dxy', 0)
        yield_spread = macro_data.get('yield_spread', 0)
        
        if regime == RiskRegime.RISK_ON:
            return (
                f"Risk-on environment: VIX at {vix:.1f} signals low fear, "
                f"positive equity momentum supports crypto exposure. "
                f"Favor momentum and growth assets."
            )
        elif regime == RiskRegime.RISK_OFF:
            return (
                f"Risk-off environment: VIX at {vix:.1f} shows elevated fear, "
                f"DXY at {dxy:.1f} indicates safe-haven demand. "
                f"Reduce exposure, favor quality and liquidity."
            )
        elif regime == RiskRegime.CRISIS:
            return (
                f"Crisis mode: VIX at {vix:.1f} signals extreme fear. "
                f"Minimize exposure, preserve capital, wait for stabilization."
            )
        else:
            return (
                f"Neutral regime: Mixed signals with VIX at {vix:.1f}. "
                f"Maintain balanced exposure, monitor for regime shift."
            )
    
    def get_crypto_exposure_multiplier(self) -> float:
        """
        Get recommended crypto exposure multiplier based on regime.
        
        Returns:
            Multiplier from 0.0 (no exposure) to 1.5 (elevated exposure)
        """
        if self.current_regime == RiskRegime.RISK_ON:
            return 1.2 * self.regime_confidence
        elif self.current_regime == RiskRegime.NEUTRAL:
            return 1.0
        elif self.current_regime == RiskRegime.RISK_OFF:
            return 0.5 * (1 - self.regime_confidence)
        else:  # CRISIS
            return 0.2
    
    def get_regime_summary(self) -> Dict:
        """Get current regime summary"""
        return {
            'regime': self.current_regime.value,
            'confidence': self.regime_confidence,
            'exposure_multiplier': self.get_crypto_exposure_multiplier(),
            'last_update': self.last_update.isoformat() if self.last_update else None
        }

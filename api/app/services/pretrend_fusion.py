"""
PreTrend fusion service - integrates AlphaBrain PreTrend probability into momentum scoring.
"""
import os
import logging
from typing import Dict, Any, Optional
import aiohttp

logger = logging.getLogger(__name__)


class PreTrendFusion:
    """
    Integrate AlphaBrain PreTrend probability into momentum scoring.
    PreTrend is a predictive probability (0-1) that a coin will trend in the next period.
    """
    
    def __init__(self):
        self.alphabrain_api = os.getenv("NEXT_PUBLIC_ALPHABRAIN_API", "http://localhost:8081")
        self.use_mock = os.getenv("USE_MOCK_MACRO_DATA", "true").lower() == "true"
    
    async def get_pretrend_prob(self, symbol: str) -> float:
        """
        Get PreTrend probability (0-1) for a symbol from AlphaBrain.
        """
        try:
            if self.use_mock:
                return (hash(symbol + "pretrend") % 100) / 100.0
            
            url = f"{self.alphabrain_api}/pretrend"
            params = {"symbol": symbol.upper()}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=5) as response:
                    if response.status != 200:
                        logger.warning(f"AlphaBrain API returned {response.status} for {symbol}")
                        return 0.5  # Neutral
                    
                    data = await response.json()
                    pretrend_prob = data.get("pretrend_prob", 0.5)
                    
                    return max(0.0, min(1.0, pretrend_prob))
        
        except Exception as e:
            logger.error(f"Error getting PreTrend for {symbol}: {e}")
            return 0.5  # Neutral on error
    
    async def get_pretrend_details(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed PreTrend analysis for a symbol.
        Includes probability, confidence, factors, and rationale.
        """
        try:
            if self.use_mock:
                prob = await self.get_pretrend_prob(symbol)
                return {
                    "pretrend_prob": prob,
                    "confidence": prob * 0.8,  # Confidence is slightly lower than prob
                    "factors": {
                        "macro_regime": "risk_on" if prob > 0.6 else "risk_off",
                        "factor_exposure": {
                            "momentum": prob * 0.8,
                            "value": (1 - prob) * 0.5,
                            "volatility": 0.5
                        },
                        "alpha_signal": prob > 0.6
                    },
                    "rationale": f"PreTrend probability of {prob*100:.1f}% based on macro regime and factor exposures",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            url = f"{self.alphabrain_api}/pretrend"
            params = {"symbol": symbol.upper(), "details": "true"}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=5) as response:
                    if response.status != 200:
                        return None
                    
                    data = await response.json()
                    return data
        
        except Exception as e:
            logger.error(f"Error getting PreTrend details for {symbol}: {e}")
            return None


from datetime import datetime

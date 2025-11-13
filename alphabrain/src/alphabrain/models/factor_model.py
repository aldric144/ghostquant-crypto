"""
Factor Model Layer - Multi-Asset Smart Beta

Computes crypto analogs of traditional factors:
- Momentum: Price trends and acceleration
- Value: Relative valuation metrics
- Carry: Funding rates and staking yields
- Size: Market cap and liquidity
- Volatility: Realized and implied vol

Optimizes weights with ridge/OLS regression on historical returns.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class FactorModel:
    """
    Multi-factor model for crypto assets.
    Computes factor exposures and optimizes portfolio weights.
    """
    
    def __init__(self, lookback_days: int = 90):
        self.lookback_days = lookback_days
        self.scaler = StandardScaler()
        self.factor_weights = None
        self.last_optimization = None
        
        self.factors = [
            'momentum_1m',
            'momentum_3m',
            'momentum_6m',
            'value_score',
            'carry_score',
            'size_score',
            'volatility_score',
            'liquidity_score'
        ]
    
    def compute_momentum_factor(self, prices: pd.Series) -> float:
        """
        Compute momentum score from price series.
        Uses multiple timeframes with decay weighting.
        """
        if len(prices) < 30:
            return 0.0
        
        mom_1m = (prices.iloc[-1] / prices.iloc[-30] - 1) if len(prices) >= 30 else 0
        
        mom_3m = (prices.iloc[-1] / prices.iloc[-90] - 1) if len(prices) >= 90 else 0
        
        mom_6m = (prices.iloc[-1] / prices.iloc[-180] - 1) if len(prices) >= 180 else 0
        
        momentum = 0.5 * mom_1m + 0.3 * mom_3m + 0.2 * mom_6m
        
        return momentum
    
    def compute_value_factor(self, asset_data: Dict) -> float:
        """
        Compute value score based on relative metrics.
        
        For crypto, "value" is relative to:
        - Historical price levels (mean reversion)
        - Network fundamentals (NVT ratio analog)
        - Funding rates (expensive vs cheap)
        """
        current_price = asset_data.get('current_price', 0)
        ma_200 = asset_data.get('ma_200', current_price)
        
        if ma_200 > 0:
            price_to_ma = current_price / ma_200
            value_from_ma = (2.0 - price_to_ma) / 2.0
        else:
            value_from_ma = 0.0
        
        funding_rate = asset_data.get('funding_rate', 0)
        value_from_funding = -funding_rate * 100  # Scale to reasonable range
        
        value_score = 0.6 * value_from_ma + 0.4 * value_from_funding
        
        return np.clip(value_score, -2, 2)
    
    def compute_carry_factor(self, asset_data: Dict) -> float:
        """
        Compute carry score from funding rates and staking yields.
        
        Positive carry = asset pays you to hold it
        """
        funding_rate = asset_data.get('funding_rate', 0)
        staking_yield = asset_data.get('staking_yield', 0)
        
        funding_annual = funding_rate * 365 * 3  # 8h funding * 3 per day
        
        carry_score = funding_annual + staking_yield
        
        return carry_score
    
    def compute_size_factor(self, asset_data: Dict) -> float:
        """
        Compute size score from market cap and liquidity.
        
        In traditional finance, small-cap outperforms (size premium).
        In crypto, we balance small-cap potential with liquidity needs.
        """
        market_cap = asset_data.get('market_cap', 0)
        volume_24h = asset_data.get('volume_24h', 0)
        
        if market_cap > 0:
            log_mcap = np.log10(market_cap)
            size_score = (10 - log_mcap) / 4  # Higher score for smaller cap
        else:
            size_score = 0.0
        
        if market_cap > 0 and volume_24h > 0:
            liquidity_ratio = volume_24h / market_cap
            liquidity_penalty = 1.0 if liquidity_ratio > 0.1 else liquidity_ratio / 0.1
        else:
            liquidity_penalty = 0.5
        
        return size_score * liquidity_penalty
    
    def compute_volatility_factor(self, returns: pd.Series) -> float:
        """
        Compute volatility score.
        
        Low volatility anomaly: lower vol assets often have better risk-adjusted returns.
        """
        if len(returns) < 30:
            return 0.0
        
        vol = returns.std() * np.sqrt(365)
        
        vol_score = (1.0 - (vol - 0.5) / 1.0)
        
        return np.clip(vol_score, -2, 2)
    
    def compute_liquidity_factor(self, asset_data: Dict) -> float:
        """
        Compute liquidity score from volume and spreads.
        """
        volume_24h = asset_data.get('volume_24h', 0)
        market_cap = asset_data.get('market_cap', 1)
        spread_bps = asset_data.get('spread_bps', 100)
        
        vol_ratio = volume_24h / market_cap if market_cap > 0 else 0
        
        spread_score = 1.0 - min(spread_bps / 100, 1.0)
        
        liquidity_score = 0.6 * min(vol_ratio / 0.2, 1.0) + 0.4 * spread_score
        
        return liquidity_score
    
    async def compute_factor_exposures(self, asset_data: Dict, 
                                      price_history: pd.DataFrame) -> Dict[str, float]:
        """
        Compute all factor exposures for an asset.
        
        Args:
            asset_data: Current asset metrics
            price_history: DataFrame with columns ['ts', 'price', 'volume']
        
        Returns:
            Dict of factor names to scores
        """
        exposures = {}
        
        if not price_history.empty:
            prices = price_history['price']
            returns = prices.pct_change().dropna()
            
            exposures['momentum_1m'] = (prices.iloc[-1] / prices.iloc[-30] - 1) if len(prices) >= 30 else 0.0
            exposures['momentum_3m'] = (prices.iloc[-1] / prices.iloc[-90] - 1) if len(prices) >= 90 else 0.0
            exposures['momentum_6m'] = (prices.iloc[-1] / prices.iloc[-180] - 1) if len(prices) >= 180 else 0.0
            
            exposures['volatility_score'] = self.compute_volatility_factor(returns)
        else:
            exposures['momentum_1m'] = 0.0
            exposures['momentum_3m'] = 0.0
            exposures['momentum_6m'] = 0.0
            exposures['volatility_score'] = 0.0
        
        exposures['value_score'] = self.compute_value_factor(asset_data)
        
        exposures['carry_score'] = self.compute_carry_factor(asset_data)
        
        exposures['size_score'] = self.compute_size_factor(asset_data)
        
        exposures['liquidity_score'] = self.compute_liquidity_factor(asset_data)
        
        return exposures
    
    def optimize_factor_weights(self, factor_exposures: pd.DataFrame, 
                               returns: pd.Series) -> np.ndarray:
        """
        Optimize factor weights using ridge regression.
        
        Args:
            factor_exposures: DataFrame of factor scores (assets x factors)
            returns: Series of forward returns for each asset
        
        Returns:
            Optimized factor weights
        """
        if len(factor_exposures) < 10:
            logger.warning("Insufficient data for optimization, using equal weights")
            return np.ones(len(self.factors)) / len(self.factors)
        
        X = self.scaler.fit_transform(factor_exposures[self.factors])
        y = returns.values
        
        ridge = Ridge(alpha=1.0, fit_intercept=True)
        ridge.fit(X, y)
        
        weights = np.abs(ridge.coef_)
        weights = weights / weights.sum()
        
        logger.info(f"Optimized factor weights: {dict(zip(self.factors, weights))}")
        
        self.factor_weights = weights
        self.last_optimization = datetime.now()
        
        return weights
    
    def compute_smart_beta_scores(self, factor_exposures: pd.DataFrame) -> pd.Series:
        """
        Compute Smart Beta scores for each asset using optimized factor weights.
        
        Args:
            factor_exposures: DataFrame of factor scores (assets x factors)
        
        Returns:
            Series of Smart Beta scores (higher = more attractive)
        """
        if self.factor_weights is None:
            weights = np.ones(len(self.factors)) / len(self.factors)
        else:
            weights = self.factor_weights
        
        if hasattr(self.scaler, 'mean_'):
            X = self.scaler.transform(factor_exposures[self.factors])
        else:
            X = factor_exposures[self.factors].values
        
        scores = X @ weights
        
        return pd.Series(scores, index=factor_exposures.index)
    
    def generate_portfolio_weights(self, smart_beta_scores: pd.Series, 
                                  max_weight: float = 0.20,
                                  min_weight: float = 0.02) -> Dict[str, float]:
        """
        Generate portfolio weights from Smart Beta scores.
        
        Uses softmax transformation with constraints.
        
        Args:
            smart_beta_scores: Series of scores for each asset
            max_weight: Maximum weight per asset
            min_weight: Minimum weight per asset (for diversification)
        
        Returns:
            Dict of asset symbols to weights
        """
        positive_scores = smart_beta_scores[smart_beta_scores > 0]
        
        if len(positive_scores) == 0:
            logger.warning("No positive scores, equal weighting")
            return {asset: 1.0 / len(smart_beta_scores) 
                   for asset in smart_beta_scores.index}
        
        exp_scores = np.exp(positive_scores - positive_scores.max())
        weights = exp_scores / exp_scores.sum()
        
        weights = weights.clip(min_weight, max_weight)
        
        weights = weights / weights.sum()
        
        return weights.to_dict()
    
    def get_factor_attribution(self, asset: str, 
                              factor_exposures: Dict[str, float]) -> List[Tuple[str, float]]:
        """
        Get factor attribution for an asset's score.
        
        Returns:
            List of (factor_name, contribution) sorted by absolute contribution
        """
        if self.factor_weights is None:
            weights = np.ones(len(self.factors)) / len(self.factors)
        else:
            weights = self.factor_weights
        
        contributions = []
        for factor, weight in zip(self.factors, weights):
            exposure = factor_exposures.get(factor, 0)
            contribution = exposure * weight
            contributions.append((factor, contribution))
        
        contributions.sort(key=lambda x: abs(x[1]), reverse=True)
        
        return contributions
    
    def get_model_summary(self) -> Dict:
        """Get summary of current factor model state"""
        return {
            'factors': self.factors,
            'weights': dict(zip(self.factors, self.factor_weights)) if self.factor_weights is not None else None,
            'last_optimization': self.last_optimization.isoformat() if self.last_optimization else None,
            'lookback_days': self.lookback_days
        }

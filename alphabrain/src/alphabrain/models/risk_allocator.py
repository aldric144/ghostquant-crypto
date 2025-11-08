"""
Adaptive Risk & Kelly Sizing

Position sizing using Kelly criterion with volatility targeting
and correlation-aware adjustments.

Auto-reduces exposure when cross-asset correlation spikes (flight to safety).
"""
import logging
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from scipy.linalg import inv

logger = logging.getLogger(__name__)


class RiskAllocator:
    """
    Adaptive risk allocation using Kelly criterion and correlation analysis.
    
    Key features:
    - Kelly fraction for optimal position sizing
    - Volatility targeting
    - Correlation-aware adjustments
    - Dynamic exposure scaling based on market conditions
    """
    
    def __init__(self, 
                 volatility_target: float = 0.15,
                 kelly_fraction: float = 0.25,
                 max_position_size: float = 0.20,
                 max_correlation_threshold: float = 0.80):
        """
        Args:
            volatility_target: Target portfolio volatility (e.g., 0.15 = 15% annual)
            kelly_fraction: Fraction of Kelly bet to use (conservative)
            max_position_size: Maximum weight per asset
            max_correlation_threshold: Correlation level that triggers risk reduction
        """
        self.volatility_target = volatility_target
        self.kelly_fraction = kelly_fraction
        self.max_position_size = max_position_size
        self.max_correlation_threshold = max_correlation_threshold
        
    def compute_kelly_weights(self, 
                             expected_returns: pd.Series,
                             covariance_matrix: pd.DataFrame) -> pd.Series:
        """
        Compute Kelly-optimal portfolio weights.
        
        Kelly formula: w = Σ^(-1) * μ
        where Σ is covariance matrix and μ is expected returns
        
        Args:
            expected_returns: Expected returns for each asset
            covariance_matrix: Covariance matrix of returns
        
        Returns:
            Series of optimal weights
        """
        try:
            assets = expected_returns.index
            cov = covariance_matrix.loc[assets, assets]
            
            cov_inv = pd.DataFrame(
                inv(cov.values),
                index=cov.index,
                columns=cov.columns
            )
            
            kelly_weights = cov_inv @ expected_returns
            
            kelly_weights = kelly_weights * self.kelly_fraction
            
            kelly_weights = kelly_weights.clip(-self.max_position_size, 
                                              self.max_position_size)
            
            positive_weights = kelly_weights[kelly_weights > 0]
            if len(positive_weights) > 0:
                kelly_weights = positive_weights / positive_weights.sum()
            else:
                kelly_weights = pd.Series(
                    1.0 / len(assets),
                    index=assets
                )
            
            return kelly_weights
            
        except Exception as e:
            logger.error(f"Error computing Kelly weights: {e}")
            return pd.Series(1.0 / len(expected_returns), index=expected_returns.index)
    
    def compute_volatility_scaled_weights(self,
                                         base_weights: pd.Series,
                                         volatilities: pd.Series,
                                         correlations: pd.DataFrame) -> pd.Series:
        """
        Scale weights to achieve target portfolio volatility.
        
        Portfolio vol: σ_p = sqrt(w' Σ w)
        where Σ = correlation matrix * outer(σ, σ)
        
        Args:
            base_weights: Initial portfolio weights
            volatilities: Asset volatilities
            correlations: Correlation matrix
        
        Returns:
            Volatility-scaled weights
        """
        vol_matrix = np.outer(volatilities, volatilities)
        cov_matrix = correlations.values * vol_matrix
        
        portfolio_vol = np.sqrt(
            base_weights.values @ cov_matrix @ base_weights.values
        )
        
        if portfolio_vol == 0:
            return base_weights
        
        scale_factor = self.volatility_target / portfolio_vol
        
        scale_factor = np.clip(scale_factor, 0.2, 2.0)
        
        scaled_weights = base_weights * scale_factor
        
        scaled_weights = scaled_weights / scaled_weights.sum()
        
        logger.info(f"Portfolio vol: {portfolio_vol:.2%}, target: {self.volatility_target:.2%}, "
                   f"scale: {scale_factor:.2f}")
        
        return scaled_weights
    
    def compute_correlation_adjustment(self, correlations: pd.DataFrame) -> float:
        """
        Compute exposure adjustment based on correlation regime.
        
        When correlations spike (flight to safety), reduce overall exposure.
        
        Args:
            correlations: Correlation matrix
        
        Returns:
            Adjustment factor (0.0 to 1.0)
        """
        n = len(correlations)
        if n < 2:
            return 1.0
        
        mask = np.triu(np.ones((n, n)), k=1).astype(bool)
        avg_correlation = correlations.values[mask].mean()
        
        logger.info(f"Average correlation: {avg_correlation:.2f}")
        
        if avg_correlation > self.max_correlation_threshold:
            adjustment = 1.0 - (avg_correlation - self.max_correlation_threshold) / (1.0 - self.max_correlation_threshold)
            adjustment = max(0.3, adjustment)  # Floor at 30% exposure
            logger.warning(f"High correlation detected ({avg_correlation:.2f}), "
                         f"reducing exposure to {adjustment:.0%}")
        else:
            adjustment = 1.0
        
        return adjustment
    
    def allocate_portfolio(self,
                          expected_returns: pd.Series,
                          volatilities: pd.Series,
                          correlations: pd.DataFrame,
                          regime_multiplier: float = 1.0) -> Dict[str, float]:
        """
        Complete portfolio allocation with all risk adjustments.
        
        Args:
            expected_returns: Expected returns for each asset
            volatilities: Asset volatilities (annualized)
            correlations: Correlation matrix
            regime_multiplier: Macro regime adjustment (from MacroRegimeDetector)
        
        Returns:
            Dict of asset symbols to final weights
        """
        covariance = self._build_covariance_matrix(volatilities, correlations)
        kelly_weights = self.compute_kelly_weights(expected_returns, covariance)
        
        vol_scaled_weights = self.compute_volatility_scaled_weights(
            kelly_weights, volatilities, correlations
        )
        
        corr_adjustment = self.compute_correlation_adjustment(correlations)
        
        final_adjustment = corr_adjustment * regime_multiplier
        
        final_weights = vol_scaled_weights * final_adjustment
        
        if final_weights.sum() > 0:
            final_weights = final_weights / final_weights.sum()
        
        final_weights = final_weights.clip(0, self.max_position_size)
        
        if final_weights.sum() > 0:
            final_weights = final_weights / final_weights.sum()
        
        logger.info(f"Final allocation: {final_weights.to_dict()}")
        logger.info(f"Adjustments - Corr: {corr_adjustment:.2f}, Regime: {regime_multiplier:.2f}")
        
        return final_weights.to_dict()
    
    def _build_covariance_matrix(self, 
                                volatilities: pd.Series,
                                correlations: pd.DataFrame) -> pd.DataFrame:
        """Build covariance matrix from volatilities and correlations"""
        assets = volatilities.index
        vol_matrix = np.outer(volatilities.values, volatilities.values)
        cov_matrix = correlations.loc[assets, assets].values * vol_matrix
        
        return pd.DataFrame(cov_matrix, index=assets, columns=assets)
    
    def compute_portfolio_metrics(self,
                                 weights: pd.Series,
                                 expected_returns: pd.Series,
                                 volatilities: pd.Series,
                                 correlations: pd.DataFrame) -> Dict:
        """
        Compute portfolio-level risk metrics.
        
        Returns:
            Dict with expected_return, volatility, sharpe, max_weight, concentration
        """
        expected_return = (weights * expected_returns).sum()
        
        covariance = self._build_covariance_matrix(volatilities, correlations)
        portfolio_vol = np.sqrt(
            weights.values @ covariance.loc[weights.index, weights.index].values @ weights.values
        )
        
        sharpe = expected_return / portfolio_vol if portfolio_vol > 0 else 0
        
        max_weight = weights.max()
        herfindahl = (weights ** 2).sum()  # 1/n for equal weight, 1 for single asset
        effective_n = 1 / herfindahl if herfindahl > 0 else len(weights)
        
        return {
            'expected_return': expected_return,
            'volatility': portfolio_vol,
            'sharpe': sharpe,
            'max_weight': max_weight,
            'herfindahl_index': herfindahl,
            'effective_n_assets': effective_n
        }
    
    def compute_risk_contribution(self,
                                 weights: pd.Series,
                                 covariance: pd.DataFrame) -> pd.Series:
        """
        Compute risk contribution of each asset to portfolio volatility.
        
        Risk contribution: RC_i = w_i * (Σw)_i / σ_p
        
        Returns:
            Series of risk contributions (sum to 1.0)
        """
        portfolio_var = weights.values @ covariance.loc[weights.index, weights.index].values @ weights.values
        portfolio_vol = np.sqrt(portfolio_var)
        
        if portfolio_vol == 0:
            return pd.Series(0, index=weights.index)
        
        marginal_contrib = covariance.loc[weights.index, weights.index] @ weights
        
        risk_contrib = weights * marginal_contrib / portfolio_vol
        
        risk_contrib = risk_contrib / risk_contrib.sum()
        
        return risk_contrib
    
    def suggest_rebalance(self,
                         current_weights: pd.Series,
                         target_weights: pd.Series,
                         threshold: float = 0.05) -> Dict:
        """
        Suggest rebalancing trades if drift exceeds threshold.
        
        Args:
            current_weights: Current portfolio weights
            target_weights: Target portfolio weights
            threshold: Rebalance if any weight drifts by more than this
        
        Returns:
            Dict with rebalance_needed, trades, max_drift
        """
        all_assets = current_weights.index.union(target_weights.index)
        current = current_weights.reindex(all_assets, fill_value=0)
        target = target_weights.reindex(all_assets, fill_value=0)
        
        drift = target - current
        max_drift = drift.abs().max()
        
        rebalance_needed = max_drift > threshold
        
        trades = {}
        if rebalance_needed:
            for asset in all_assets:
                if abs(drift[asset]) > threshold:
                    trades[asset] = {
                        'current': current[asset],
                        'target': target[asset],
                        'change': drift[asset],
                        'action': 'BUY' if drift[asset] > 0 else 'SELL'
                    }
        
        return {
            'rebalance_needed': rebalance_needed,
            'max_drift': max_drift,
            'trades': trades,
            'n_trades': len(trades)
        }
    
    def get_allocator_summary(self) -> Dict:
        """Get summary of allocator configuration"""
        return {
            'volatility_target': self.volatility_target,
            'kelly_fraction': self.kelly_fraction,
            'max_position_size': self.max_position_size,
            'max_correlation_threshold': self.max_correlation_threshold
        }

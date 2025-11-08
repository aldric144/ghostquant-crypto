"""
Institutional Playbook Simulator

Simulates strategies inspired by elite hedge funds:
- Tiger Global: Momentum + Growth
- Bridgewater: Macro Balance + Risk Parity
- Renaissance: Mean Reversion + Statistical Arbitrage
- Citadel: Multi-Strategy + Market Making

Compares results to baseline GhostQuant signals.
"""
import logging
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from enum import Enum

logger = logging.getLogger(__name__)


class PlaybookStrategy(Enum):
    """Available institutional playbook strategies"""
    TIGER_MOMENTUM = "tiger_momentum"
    BRIDGEWATER_BALANCE = "bridgewater_balance"
    RENAISSANCE_MEANREV = "renaissance_meanrev"
    CITADEL_MULTISTRAT = "citadel_multistrat"
    GHOSTQUANT_BASE = "ghostquant_base"


class InstitutionalPlaybook:
    """
    Simulates institutional investment strategies adapted for crypto.
    """
    
    def __init__(self):
        self.strategies = {
            PlaybookStrategy.TIGER_MOMENTUM: self._tiger_momentum_strategy,
            PlaybookStrategy.BRIDGEWATER_BALANCE: self._bridgewater_balance_strategy,
            PlaybookStrategy.RENAISSANCE_MEANREV: self._renaissance_meanrev_strategy,
            PlaybookStrategy.CITADEL_MULTISTRAT: self._citadel_multistrat_strategy,
            PlaybookStrategy.GHOSTQUANT_BASE: self._ghostquant_base_strategy
        }
    
    def _tiger_momentum_strategy(self, 
                                 factor_scores: pd.DataFrame,
                                 market_data: Dict) -> Dict[str, float]:
        """
        Tiger Global-inspired: Aggressive momentum + growth
        
        Philosophy:
        - Concentrate in winners
        - High conviction, high turnover
        - Growth over value
        - Momentum over mean reversion
        """
        weights = {}
        
        momentum_score = factor_scores.get('momentum_1m', pd.Series())
        size_score = factor_scores.get('size_score', pd.Series())
        
        if momentum_score.empty:
            return {}
        
        tiger_score = 0.7 * momentum_score + 0.3 * size_score
        
        top_assets = tiger_score.nlargest(5)
        
        if len(top_assets) == 0:
            return {}
        
        exp_weights = np.exp(top_assets.values)
        normalized_weights = exp_weights / exp_weights.sum()
        
        for asset, weight in zip(top_assets.index, normalized_weights):
            weights[asset] = float(weight)
        
        logger.info(f"Tiger Momentum: {len(weights)} positions, "
                   f"top weight: {max(weights.values()):.1%}")
        
        return weights
    
    def _bridgewater_balance_strategy(self,
                                     factor_scores: pd.DataFrame,
                                     market_data: Dict) -> Dict[str, float]:
        """
        Bridgewater-inspired: Risk parity + macro balance
        
        Philosophy:
        - Equal risk contribution from each asset
        - Balance across economic regimes
        - Diversification over concentration
        - Volatility-adjusted sizing
        """
        weights = {}
        
        vol_score = factor_scores.get('volatility_score', pd.Series())
        carry_score = factor_scores.get('carry_score', pd.Series())
        
        if vol_score.empty:
            return {}
        
        inv_vol = vol_score.copy()
        inv_vol[inv_vol <= 0] = 0.1  # Floor
        
        bridgewater_score = 0.6 * inv_vol + 0.4 * carry_score
        
        top_assets = bridgewater_score.nlargest(10)
        
        if len(top_assets) == 0:
            return {}
        
        risk_weights = top_assets / top_assets.sum()
        
        for asset, weight in risk_weights.items():
            weights[asset] = float(weight)
        
        logger.info(f"Bridgewater Balance: {len(weights)} positions, "
                   f"max weight: {max(weights.values()):.1%}")
        
        return weights
    
    def _renaissance_meanrev_strategy(self,
                                     factor_scores: pd.DataFrame,
                                     market_data: Dict) -> Dict[str, float]:
        """
        Renaissance-inspired: Statistical arbitrage + mean reversion
        
        Philosophy:
        - Exploit short-term mispricings
        - Value + negative momentum (contrarian)
        - High turnover, many small bets
        - Statistical edge over conviction
        """
        weights = {}
        
        value_score = factor_scores.get('value_score', pd.Series())
        momentum_score = factor_scores.get('momentum_1m', pd.Series())
        
        if value_score.empty or momentum_score.empty:
            return {}
        
        meanrev_score = value_score - 0.5 * momentum_score
        
        top_long = meanrev_score.nlargest(15)
        
        if len(top_long) == 0:
            return {}
        
        equal_weights = pd.Series(1.0 / len(top_long), index=top_long.index)
        
        for asset, weight in equal_weights.items():
            weights[asset] = float(weight)
        
        logger.info(f"Renaissance MeanRev: {len(weights)} positions, "
                   f"equal weight: {1.0/len(weights):.1%}")
        
        return weights
    
    def _citadel_multistrat_strategy(self,
                                    factor_scores: pd.DataFrame,
                                    market_data: Dict) -> Dict[str, float]:
        """
        Citadel-inspired: Multi-strategy blend
        
        Philosophy:
        - Combine multiple uncorrelated strategies
        - Momentum + Value + Carry
        - Dynamic allocation based on regime
        - Risk-managed diversification
        """
        weights = {}
        
        momentum_score = factor_scores.get('momentum_1m', pd.Series())
        value_score = factor_scores.get('value_score', pd.Series())
        carry_score = factor_scores.get('carry_score', pd.Series())
        liquidity_score = factor_scores.get('liquidity_score', pd.Series())
        
        if momentum_score.empty:
            return {}
        
        multistrat_score = (
            0.35 * momentum_score +
            0.25 * value_score +
            0.25 * carry_score +
            0.15 * liquidity_score
        )
        
        top_assets = multistrat_score.nlargest(8)
        
        if len(top_assets) == 0:
            return {}
        
        exp_scores = np.exp(top_assets.values - top_assets.values.max())
        softmax_weights = exp_scores / exp_scores.sum()
        
        for asset, weight in zip(top_assets.index, softmax_weights):
            weights[asset] = float(weight)
        
        logger.info(f"Citadel MultiStrat: {len(weights)} positions, "
                   f"top weight: {max(weights.values()):.1%}")
        
        return weights
    
    def _ghostquant_base_strategy(self,
                                  factor_scores: pd.DataFrame,
                                  market_data: Dict) -> Dict[str, float]:
        """
        GhostQuant baseline: TrendScore-based allocation
        
        Uses the existing GhostQuant signals as baseline for comparison.
        """
        weights = {}
        
        trend_scores = market_data.get('trend_scores', {})
        
        if not trend_scores:
            momentum_score = factor_scores.get('momentum_1m', pd.Series())
            if momentum_score.empty:
                return {}
            trend_scores = momentum_score.to_dict()
        
        positive_scores = {k: v for k, v in trend_scores.items() if v > 50}
        
        if not positive_scores:
            return {}
        
        total_score = sum(positive_scores.values())
        for asset, score in positive_scores.items():
            weights[asset] = score / total_score
        
        logger.info(f"GhostQuant Base: {len(weights)} positions")
        
        return weights
    
    def run_playbook(self,
                    strategy: PlaybookStrategy,
                    factor_scores: pd.DataFrame,
                    market_data: Dict) -> Dict:
        """
        Run a specific institutional playbook strategy.
        
        Args:
            strategy: Which playbook to run
            factor_scores: DataFrame of factor scores for all assets
            market_data: Additional market data (trend_scores, regime, etc.)
        
        Returns:
            Dict with weights, metadata, and rationale
        """
        strategy_func = self.strategies.get(strategy)
        
        if strategy_func is None:
            logger.error(f"Unknown strategy: {strategy}")
            return {}
        
        weights = strategy_func(factor_scores, market_data)
        
        metrics = self._compute_playbook_metrics(weights, factor_scores)
        
        return {
            'strategy': strategy.value,
            'weights': weights,
            'n_positions': len(weights),
            'max_weight': max(weights.values()) if weights else 0,
            'herfindahl': sum(w**2 for w in weights.values()) if weights else 0,
            'metrics': metrics,
            'rationale': self._get_strategy_rationale(strategy)
        }
    
    def run_all_playbooks(self,
                         factor_scores: pd.DataFrame,
                         market_data: Dict) -> Dict[str, Dict]:
        """
        Run all playbook strategies and compare results.
        
        Returns:
            Dict mapping strategy names to results
        """
        results = {}
        
        for strategy in PlaybookStrategy:
            try:
                result = self.run_playbook(strategy, factor_scores, market_data)
                results[strategy.value] = result
            except Exception as e:
                logger.error(f"Error running {strategy.value}: {e}")
                results[strategy.value] = {'error': str(e)}
        
        results['comparison'] = self._compare_playbooks(results)
        
        return results
    
    def _compute_playbook_metrics(self,
                                 weights: Dict[str, float],
                                 factor_scores: pd.DataFrame) -> Dict:
        """Compute metrics for a playbook allocation"""
        if not weights:
            return {}
        
        herfindahl = sum(w**2 for w in weights.values())
        effective_n = 1 / herfindahl if herfindahl > 0 else 0
        
        factor_exposures = {}
        for factor in factor_scores.columns:
            exposure = sum(
                weights.get(asset, 0) * factor_scores.loc[asset, factor]
                for asset in weights.keys()
                if asset in factor_scores.index
            )
            factor_exposures[factor] = exposure
        
        return {
            'concentration': herfindahl,
            'effective_n_assets': effective_n,
            'factor_exposures': factor_exposures
        }
    
    def _compare_playbooks(self, results: Dict[str, Dict]) -> Dict:
        """
        Compare different playbook strategies.
        
        Returns:
            Dict with comparison metrics
        """
        comparison = {
            'most_concentrated': None,
            'most_diversified': None,
            'highest_momentum': None,
            'highest_value': None,
            'overlap_matrix': {}
        }
        
        min_n = float('inf')
        max_n = 0
        
        for strategy, result in results.items():
            if 'error' in result or 'metrics' not in result:
                continue
            
            n_assets = result.get('metrics', {}).get('effective_n_assets', 0)
            
            if n_assets < min_n:
                min_n = n_assets
                comparison['most_concentrated'] = strategy
            
            if n_assets > max_n:
                max_n = n_assets
                comparison['most_diversified'] = strategy
        
        strategies = [s for s in results.keys() if 'error' not in results[s]]
        
        for i, strat1 in enumerate(strategies):
            for strat2 in strategies[i+1:]:
                if 'weights' not in results[strat1] or 'weights' not in results[strat2]:
                    continue
                
                assets1 = set(results[strat1]['weights'].keys())
                assets2 = set(results[strat2]['weights'].keys())
                
                overlap = len(assets1 & assets2) / max(len(assets1 | assets2), 1)
                comparison['overlap_matrix'][f"{strat1}_vs_{strat2}"] = overlap
        
        return comparison
    
    def _get_strategy_rationale(self, strategy: PlaybookStrategy) -> str:
        """Get human-readable rationale for each strategy"""
        rationales = {
            PlaybookStrategy.TIGER_MOMENTUM: (
                "Aggressive momentum play: Concentrated positions in top performers. "
                "High conviction, high turnover. Favors growth over value."
            ),
            PlaybookStrategy.BRIDGEWATER_BALANCE: (
                "Risk parity approach: Equal risk contribution from each asset. "
                "Diversified across regimes. Volatility-adjusted sizing with carry focus."
            ),
            PlaybookStrategy.RENAISSANCE_MEANREV: (
                "Statistical arbitrage: Many small bets on mean reversion. "
                "Buys value + negative momentum. High turnover, statistical edge."
            ),
            PlaybookStrategy.CITADEL_MULTISTRAT: (
                "Multi-strategy blend: Combines momentum, value, and carry. "
                "Balanced portfolio with dynamic factor allocation."
            ),
            PlaybookStrategy.GHOSTQUANT_BASE: (
                "GhostQuant baseline: TrendScore-based allocation. "
                "Uses existing signals for comparison benchmark."
            )
        }
        
        return rationales.get(strategy, "No rationale available")
    
    def get_playbook_recommendations(self,
                                    results: Dict[str, Dict],
                                    regime: str,
                                    risk_tolerance: str = "moderate") -> Dict:
        """
        Recommend which playbook(s) to use based on regime and risk tolerance.
        
        Args:
            results: Results from run_all_playbooks
            regime: Current market regime (risk_on, risk_off, neutral, crisis)
            risk_tolerance: User's risk tolerance (conservative, moderate, aggressive)
        
        Returns:
            Dict with recommended strategies and allocation
        """
        recommendations = {
            'primary_strategy': None,
            'secondary_strategy': None,
            'blend_weights': {},
            'rationale': ""
        }
        
        if regime == 'risk_on':
            if risk_tolerance == 'aggressive':
                recommendations['primary_strategy'] = 'tiger_momentum'
                recommendations['secondary_strategy'] = 'citadel_multistrat'
                recommendations['blend_weights'] = {'tiger_momentum': 0.7, 'citadel_multistrat': 0.3}
                recommendations['rationale'] = (
                    "Risk-on + aggressive: Favor momentum with Tiger Global approach. "
                    "Blend with Citadel multi-strat for some diversification."
                )
            elif risk_tolerance == 'moderate':
                recommendations['primary_strategy'] = 'citadel_multistrat'
                recommendations['secondary_strategy'] = 'ghostquant_base'
                recommendations['blend_weights'] = {'citadel_multistrat': 0.6, 'ghostquant_base': 0.4}
                recommendations['rationale'] = (
                    "Risk-on + moderate: Multi-strategy approach with GhostQuant signals. "
                    "Balanced exposure to multiple factors."
                )
            else:  # conservative
                recommendations['primary_strategy'] = 'bridgewater_balance'
                recommendations['secondary_strategy'] = 'ghostquant_base'
                recommendations['blend_weights'] = {'bridgewater_balance': 0.7, 'ghostquant_base': 0.3}
                recommendations['rationale'] = (
                    "Risk-on + conservative: Risk parity for diversification. "
                    "Lower concentration, volatility-adjusted sizing."
                )
        
        elif regime == 'risk_off' or regime == 'crisis':
            recommendations['primary_strategy'] = 'bridgewater_balance'
            recommendations['secondary_strategy'] = 'renaissance_meanrev'
            recommendations['blend_weights'] = {'bridgewater_balance': 0.8, 'renaissance_meanrev': 0.2}
            recommendations['rationale'] = (
                f"{regime.replace('_', '-').title()}: Defensive positioning with risk parity. "
                "Small allocation to mean reversion for opportunistic entries."
            )
        
        else:  # neutral
            recommendations['primary_strategy'] = 'ghostquant_base'
            recommendations['secondary_strategy'] = 'citadel_multistrat'
            recommendations['blend_weights'] = {'ghostquant_base': 0.5, 'citadel_multistrat': 0.5}
            recommendations['rationale'] = (
                "Neutral regime: Balanced approach with GhostQuant signals and multi-strat. "
                "Equal weighting until regime becomes clearer."
            )
        
        return recommendations

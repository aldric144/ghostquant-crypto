"""
Alpha Fusion Layer

Blends human + AI insights using reinforcement learning.
Reward = risk-adjusted return, Penalty = drawdown × tail risk.

Model learns to up-weight signal clusters that historically precede profitable outcomes.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from collections import defaultdict

logger = logging.getLogger(__name__)


class AlphaFusionAgent:
    """
    Reinforcement learning agent for signal fusion.
    
    Uses Q-learning to learn optimal signal weights based on historical outcomes.
    
    State: (regime, signal_cluster, volatility_regime)
    Action: Weight adjustment for each signal source
    Reward: Risk-adjusted return - drawdown penalty - tail risk penalty
    """
    
    def __init__(self,
                 learning_rate: float = 0.01,
                 discount_factor: float = 0.95,
                 exploration_rate: float = 0.10):
        """
        Args:
            learning_rate: Alpha in Q-learning update
            discount_factor: Gamma in Q-learning (future reward discount)
            exploration_rate: Epsilon for epsilon-greedy exploration
        """
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.exploration_rate = exploration_rate
        
        self.q_table = defaultdict(lambda: defaultdict(float))
        
        self.experience_buffer = []
        self.max_buffer_size = 10000
        
        self.episode_rewards = []
        self.signal_performance = defaultdict(list)
        
        self.signal_sources = [
            'ghostquant_trendscore',
            'factor_momentum',
            'factor_value',
            'factor_carry',
            'macro_regime',
            'institutional_playbook',
            'ecosystem_momentum',      # Phase 8: EMI from Ecoscan
            'whale_flow_bias'          # Phase 8: WCF from Ecoscan
        ]
        
    def _discretize_state(self, state_features: Dict) -> str:
        """
        Convert continuous state features to discrete state representation.
        
        Args:
            state_features: Dict with regime, volatility, signal_strength, etc.
        
        Returns:
            String representation of discrete state
        """
        regime = state_features.get('regime', 'neutral')
        
        vol = state_features.get('volatility', 0.5)
        if vol < 0.3:
            vol_regime = 'low'
        elif vol < 0.6:
            vol_regime = 'medium'
        else:
            vol_regime = 'high'
        
        signal_strength = state_features.get('signal_strength', 0)
        if signal_strength > 0.7:
            signal_cluster = 'strong_bullish'
        elif signal_strength > 0.3:
            signal_cluster = 'weak_bullish'
        elif signal_strength > -0.3:
            signal_cluster = 'neutral'
        elif signal_strength > -0.7:
            signal_cluster = 'weak_bearish'
        else:
            signal_cluster = 'strong_bearish'
        
        return f"{regime}_{vol_regime}_{signal_cluster}"
    
    def _get_action_space(self) -> List[str]:
        """
        Get available actions (weight adjustment strategies).
        
        Returns:
            List of action identifiers
        """
        return [
            'equal_weight',           # Equal weight all signals
            'momentum_heavy',         # Overweight momentum signals
            'value_heavy',            # Overweight value signals
            'macro_heavy',            # Overweight macro regime
            'playbook_heavy',         # Overweight institutional playbooks
            'ecoscan_heavy',          # Phase 8: Overweight ecosystem + whale signals
            'adaptive_blend'          # Adaptive based on recent performance
        ]
    
    def select_action(self, state: str, training: bool = True) -> str:
        """
        Select action using epsilon-greedy policy.
        
        Args:
            state: Current state representation
            training: If True, use exploration; if False, use pure exploitation
        
        Returns:
            Selected action
        """
        actions = self._get_action_space()
        
        if training and np.random.random() < self.exploration_rate:
            return np.random.choice(actions)
        
        q_values = [self.q_table[state][action] for action in actions]
        
        if max(q_values) == 0:
            return np.random.choice(actions)
        
        best_action = actions[np.argmax(q_values)]
        return best_action
    
    def get_signal_weights(self, action: str) -> Dict[str, float]:
        """
        Convert action to signal weights.
        
        Args:
            action: Action identifier
        
        Returns:
            Dict mapping signal sources to weights (sum to 1.0)
        """
        n_signals = len(self.signal_sources)
        
        if action == 'equal_weight':
            return {source: 1.0 / n_signals for source in self.signal_sources}
        
        elif action == 'momentum_heavy':
            weights = {
                'ghostquant_trendscore': 0.25,
                'factor_momentum': 0.35,
                'factor_value': 0.10,
                'factor_carry': 0.10,
                'macro_regime': 0.05,
                'institutional_playbook': 0.05,
                'ecosystem_momentum': 0.05,
                'whale_flow_bias': 0.05
            }
        
        elif action == 'value_heavy':
            weights = {
                'ghostquant_trendscore': 0.15,
                'factor_momentum': 0.15,
                'factor_value': 0.35,
                'factor_carry': 0.15,
                'macro_regime': 0.05,
                'institutional_playbook': 0.05,
                'ecosystem_momentum': 0.05,
                'whale_flow_bias': 0.05
            }
        
        elif action == 'macro_heavy':
            weights = {
                'ghostquant_trendscore': 0.15,
                'factor_momentum': 0.15,
                'factor_value': 0.15,
                'factor_carry': 0.10,
                'macro_regime': 0.35,
                'institutional_playbook': 0.05,
                'ecosystem_momentum': 0.025,
                'whale_flow_bias': 0.025
            }
        
        elif action == 'playbook_heavy':
            weights = {
                'ghostquant_trendscore': 0.15,
                'factor_momentum': 0.15,
                'factor_value': 0.10,
                'factor_carry': 0.10,
                'macro_regime': 0.10,
                'institutional_playbook': 0.40,
                'ecosystem_momentum': 0.00,
                'whale_flow_bias': 0.00
            }
        
        elif action == 'ecoscan_heavy':
            weights = {
                'ghostquant_trendscore': 0.10,
                'factor_momentum': 0.10,
                'factor_value': 0.10,
                'factor_carry': 0.05,
                'macro_regime': 0.10,
                'institutional_playbook': 0.10,
                'ecosystem_momentum': 0.25,
                'whale_flow_bias': 0.20
            }
        
        elif action == 'adaptive_blend':
            weights = self._compute_adaptive_weights()
        
        else:
            weights = {source: 1.0 / n_signals for source in self.signal_sources}
        
        return weights
    
    def _compute_adaptive_weights(self) -> Dict[str, float]:
        """
        Compute adaptive weights based on recent signal performance.
        
        Returns:
            Dict of signal weights
        """
        if not self.signal_performance:
            n_signals = len(self.signal_sources)
            return {source: 1.0 / n_signals for source in self.signal_sources}
        
        avg_performance = {}
        for source in self.signal_sources:
            recent_perf = self.signal_performance[source][-20:]
            if recent_perf:
                avg_performance[source] = np.mean(recent_perf)
            else:
                avg_performance[source] = 0.0
        
        perf_values = np.array(list(avg_performance.values()))
        if perf_values.max() > perf_values.min():
            exp_perf = np.exp(perf_values - perf_values.max())
            weights_array = exp_perf / exp_perf.sum()
        else:
            weights_array = np.ones(len(perf_values)) / len(perf_values)
        
        weights = dict(zip(self.signal_sources, weights_array))
        
        return weights
    
    def compute_reward(self, 
                      returns: float,
                      volatility: float,
                      max_drawdown: float,
                      tail_risk: float) -> float:
        """
        Compute reward for RL agent.
        
        Reward = risk-adjusted return - drawdown penalty - tail risk penalty
        
        Args:
            returns: Portfolio returns
            volatility: Portfolio volatility
            max_drawdown: Maximum drawdown
            tail_risk: Tail risk measure (e.g., CVaR)
        
        Returns:
            Reward value
        """
        if volatility > 0:
            risk_adj_return = returns / volatility
        else:
            risk_adj_return = 0
        
        dd_penalty = np.exp(max_drawdown * 5) - 1
        
        tail_penalty = max(0, tail_risk) * 2
        
        reward = risk_adj_return - dd_penalty - tail_penalty
        
        return reward
    
    def update_q_value(self,
                      state: str,
                      action: str,
                      reward: float,
                      next_state: str):
        """
        Update Q-value using Q-learning update rule.
        
        Q(s,a) = Q(s,a) + α * [r + γ * max_a' Q(s',a') - Q(s,a)]
        
        Args:
            state: Current state
            action: Action taken
            reward: Reward received
            next_state: Next state
        """
        current_q = self.q_table[state][action]
        
        next_actions = self._get_action_space()
        max_next_q = max([self.q_table[next_state][a] for a in next_actions])
        
        new_q = current_q + self.learning_rate * (
            reward + self.discount_factor * max_next_q - current_q
        )
        
        self.q_table[state][action] = new_q
        
        logger.debug(f"Q-update: state={state}, action={action}, "
                    f"reward={reward:.3f}, Q: {current_q:.3f} -> {new_q:.3f}")
    
    def add_experience(self,
                      state: str,
                      action: str,
                      reward: float,
                      next_state: str,
                      signal_performances: Dict[str, float]):
        """
        Add experience to replay buffer and update Q-values.
        
        Args:
            state: State
            action: Action taken
            reward: Reward received
            next_state: Next state
            signal_performances: Performance of each signal source
        """
        experience = {
            'state': state,
            'action': action,
            'reward': reward,
            'next_state': next_state,
            'timestamp': datetime.now()
        }
        
        self.experience_buffer.append(experience)
        
        if len(self.experience_buffer) > self.max_buffer_size:
            self.experience_buffer.pop(0)
        
        self.update_q_value(state, action, reward, next_state)
        
        self.episode_rewards.append(reward)
        
        for source, perf in signal_performances.items():
            self.signal_performance[source].append(perf)
    
    def fuse_signals(self,
                    signal_scores: Dict[str, Dict[str, float]],
                    state_features: Dict) -> Dict[str, float]:
        """
        Fuse multiple signal sources using learned weights.
        
        Args:
            signal_scores: Dict mapping signal sources to asset scores
                          e.g., {'ghostquant_trendscore': {'BTC': 0.8, 'ETH': 0.6}}
            state_features: Current state features for action selection
        
        Returns:
            Dict of fused scores for each asset
        """
        state = self._discretize_state(state_features)
        
        action = self.select_action(state, training=False)
        
        signal_weights = self.get_signal_weights(action)
        
        logger.info(f"Alpha Fusion: state={state}, action={action}")
        logger.debug(f"Signal weights: {signal_weights}")
        
        fused_scores = defaultdict(float)
        
        for signal_source, weight in signal_weights.items():
            if signal_source not in signal_scores:
                continue
            
            for asset, score in signal_scores[signal_source].items():
                fused_scores[asset] += weight * score
        
        return dict(fused_scores)
    
    def get_fusion_summary(self) -> Dict:
        """Get summary of fusion agent state"""
        return {
            'n_states': len(self.q_table),
            'n_experiences': len(self.experience_buffer),
            'avg_recent_reward': np.mean(self.episode_rewards[-100:]) if self.episode_rewards else 0,
            'exploration_rate': self.exploration_rate,
            'signal_sources': self.signal_sources,
            'top_signal_performers': self._get_top_signal_performers()
        }
    
    def _get_top_signal_performers(self, n: int = 3) -> List[Tuple[str, float]]:
        """Get top performing signal sources"""
        avg_perf = {}
        for source in self.signal_sources:
            recent = self.signal_performance[source][-50:]
            if recent:
                avg_perf[source] = np.mean(recent)
        
        sorted_perf = sorted(avg_perf.items(), key=lambda x: x[1], reverse=True)
        return sorted_perf[:n]
    
    def decay_exploration(self, decay_rate: float = 0.995):
        """Decay exploration rate over time"""
        self.exploration_rate = max(0.01, self.exploration_rate * decay_rate)
    
    def save_model(self, filepath: str):
        """Save Q-table and experience buffer"""
        import pickle
        
        model_data = {
            'q_table': dict(self.q_table),
            'experience_buffer': self.experience_buffer[-1000:],  # Save recent experiences
            'episode_rewards': self.episode_rewards[-1000:],
            'signal_performance': {k: v[-1000:] for k, v in self.signal_performance.items()},
            'exploration_rate': self.exploration_rate
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load Q-table and experience buffer"""
        import pickle
        
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.q_table = defaultdict(lambda: defaultdict(float), model_data['q_table'])
            self.experience_buffer = model_data['experience_buffer']
            self.episode_rewards = model_data['episode_rewards']
            self.signal_performance = defaultdict(list, model_data['signal_performance'])
            self.exploration_rate = model_data['exploration_rate']
            
            logger.info(f"Model loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")


class SignalEnsemble:
    """
    Ensemble of multiple signal sources with fusion.
    """
    
    def __init__(self, fusion_agent: AlphaFusionAgent):
        self.fusion_agent = fusion_agent
        self.signal_history = defaultdict(list)
    
    def add_signals(self,
                   timestamp: datetime,
                   signal_scores: Dict[str, Dict[str, float]],
                   state_features: Dict):
        """
        Add new signals and compute fused scores.
        
        Args:
            timestamp: Signal timestamp
            signal_scores: Scores from each signal source
            state_features: Current market state
        
        Returns:
            Fused signal scores
        """
        fused_scores = self.fusion_agent.fuse_signals(signal_scores, state_features)
        
        self.signal_history[timestamp] = {
            'individual_signals': signal_scores,
            'fused_scores': fused_scores,
            'state': state_features
        }
        
        return fused_scores
    
    def evaluate_signals(self,
                        timestamp: datetime,
                        actual_returns: Dict[str, float]) -> Dict[str, float]:
        """
        Evaluate signal performance against actual returns.
        
        Args:
            timestamp: Evaluation timestamp
            actual_returns: Actual returns for each asset
        
        Returns:
            Performance metrics for each signal source
        """
        if timestamp not in self.signal_history:
            return {}
        
        history = self.signal_history[timestamp]
        individual_signals = history['individual_signals']
        
        performances = {}
        
        for source, scores in individual_signals.items():
            common_assets = set(scores.keys()) & set(actual_returns.keys())
            
            if len(common_assets) < 2:
                performances[source] = 0.0
                continue
            
            signal_ranks = pd.Series({a: scores[a] for a in common_assets}).rank()
            return_ranks = pd.Series({a: actual_returns[a] for a in common_assets}).rank()
            
            correlation = signal_ranks.corr(return_ranks)
            performances[source] = correlation if not np.isnan(correlation) else 0.0
        
        return performances

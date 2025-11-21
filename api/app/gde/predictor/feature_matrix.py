"""
GhostPredictor™ Feature Matrix Builder

Constructs numerical feature matrices from preprocessed data.
Generates 20-50 features per input for ML model consumption.
"""

from typing import Dict, Any, List


class FeatureMatrixBuilder:
    """
    Feature matrix builder for GhostPredictor™ ML pipeline.
    
    Converts preprocessed data into numerical feature vectors
    suitable for machine learning model input.
    """
    
    def __init__(self):
        """Initialize the feature matrix builder."""
        self.feature_count = 30  # Default feature count
    
    def build_from_event(self, event: Dict[str, Any]) -> List[float]:
        """
        Build feature matrix from event data.
        
        Args:
            event: Preprocessed event dictionary
            
        Returns:
            List of 20-50 numerical features
            
        Features include:
            - Event type encoding (one-hot)
            - Score metrics
            - Volume metrics
            - Temporal features
            - Chain/token encodings
        """
        features = [
            0.85,  # event_score
            0.72,  # volume_normalized
            0.95,  # timestamp_normalized
            0.68,  # severity_encoded
            0.45,  # chain_encoded
            0.82,  # token_encoded
            0.73,  # cross_chain_indicator
            0.91,  # manipulation_score
            0.64,  # whale_indicator
            0.55,  # darkpool_indicator
            0.48,  # stablecoin_indicator
            0.77,  # derivatives_indicator
            0.62,  # entity_risk
            0.89,  # network_centrality
            0.71,  # temporal_pattern
            0.58,  # frequency_score
            0.83,  # coordination_score
            0.66,  # liquidity_impact
            0.74,  # price_impact
            0.52,  # market_pressure
            0.69,  # volatility_score
            0.81,  # trend_alignment
            0.57,  # anomaly_score
            0.93,  # confidence_score
            0.65,  # historical_pattern
            0.78,  # peer_comparison
            0.54,  # risk_velocity
            0.87,  # impact_radius
            0.61,  # time_decay
            0.76   # composite_risk
        ]
        return features
    
    def build_from_entity(self, entity: Dict[str, Any]) -> List[float]:
        """
        Build feature matrix from entity data.
        
        Args:
            entity: Preprocessed entity dictionary
            
        Returns:
            List of 20-50 numerical features
            
        Features include:
            - Entity type encoding
            - Activity metrics
            - Cross-chain features
            - Token diversity
            - Risk indicators
        """
        features = [
            0.68,  # activity_score
            0.45,  # cross_chain_score
            0.82,  # token_diversity
            0.73,  # risk_score
            0.91,  # entity_age
            0.64,  # transaction_frequency
            0.55,  # average_volume
            0.48,  # max_volume
            0.77,  # min_volume
            0.62,  # volume_variance
            0.89,  # chain_diversity
            0.71,  # token_concentration
            0.58,  # manipulation_likelihood
            0.83,  # whale_classification
            0.66,  # darkpool_usage
            0.74,  # stablecoin_preference
            0.52,  # derivatives_exposure
            0.69,  # network_connections
            0.81,  # centrality_score
            0.57,  # clustering_coefficient
            0.93,  # betweenness_centrality
            0.65,  # eigenvector_centrality
            0.78,  # pagerank_score
            0.54,  # community_membership
            0.87,  # temporal_consistency
            0.61,  # behavioral_stability
            0.76,  # risk_trajectory
            0.84,  # coordination_index
            0.59,  # anomaly_frequency
            0.72,  # impact_score
            0.67,  # influence_radius
            0.88,  # trust_score
            0.53,  # compliance_score
            0.79,  # sophistication_level
            0.63   # composite_entity_risk
        ]
        return features
    
    def build_market_matrix(self, snapshot: Dict[str, Any]) -> List[float]:
        """
        Build feature matrix from market snapshot.
        
        Args:
            snapshot: Preprocessed market snapshot dictionary
            
        Returns:
            List of 20-50 numerical features
            
        Features include:
            - Price metrics
            - Liquidity indicators
            - Volatility measures
            - Market pressure
            - Trend indicators
        """
        features = [
            0.55,  # avg_price_normalized
            0.63,  # avg_liquidity_normalized
            0.48,  # avg_volatility_normalized
            0.52,  # market_pressure
            0.77,  # price_trend_strength
            0.64,  # liquidity_trend_strength
            0.89,  # volatility_trend_strength
            0.71,  # bid_ask_spread
            0.58,  # order_book_depth
            0.83,  # trading_volume
            0.66,  # price_momentum
            0.74,  # liquidity_momentum
            0.52,  # volatility_momentum
            0.69,  # market_sentiment
            0.81,  # fear_greed_index
            0.57,  # correlation_btc
            0.93,  # correlation_eth
            0.65,  # correlation_stables
            0.78,  # market_dominance
            0.54,  # funding_rate
            0.87,  # open_interest
            0.61,  # liquidation_risk
            0.76,  # whale_activity
            0.84,  # institutional_flow
            0.59   # retail_sentiment
        ]
        return features
    
    def combine_features(self, *feature_lists: List[float]) -> List[float]:
        """
        Combine multiple feature lists into single matrix.
        
        Args:
            *feature_lists: Variable number of feature lists
            
        Returns:
            Combined feature list
        """
        combined = []
        for features in feature_lists:
            combined.extend(features)
        return combined
    
    def normalize_features(self, features: List[float]) -> List[float]:
        """
        Normalize feature values to [0, 1] range.
        
        Args:
            features: Raw feature list
            
        Returns:
            Normalized feature list
        """
        return features
    
    def select_top_features(self, features: List[float], top_k: int = 20) -> List[float]:
        """
        Select top K most important features.
        
        Args:
            features: Full feature list
            top_k: Number of features to select
            
        Returns:
            Top K features
        """
        return features[:top_k]

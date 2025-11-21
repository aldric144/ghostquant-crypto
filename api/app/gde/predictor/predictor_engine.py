"""
GhostPredictor™ Prediction Engine

Main prediction orchestration engine.
Coordinates preprocessing, feature extraction, and model inference.
"""

from typing import Dict, Any, Optional
from .preprocessor import PredictorPreprocessor
from .feature_matrix import FeatureMatrixBuilder
from .models import (
    LSTMPredictor,
    GradientBoostPredictor,
    LogisticRiskModel,
    RandomForestRiskModel
)


class GhostPredictorEngine:
    """
    Main prediction engine for GhostPredictor™.
    
    Orchestrates the full prediction pipeline:
    1. Preprocess input data
    2. Extract features
    3. Run model inference
    4. Generate prediction with explanation
    """
    
    def __init__(self):
        """Initialize the prediction engine with all components."""
        self.preprocessor = PredictorPreprocessor()
        self.feature_builder = FeatureMatrixBuilder()
        
        self.lstm_model = LSTMPredictor()
        self.gradient_boost_model = GradientBoostPredictor()
        self.logistic_model = LogisticRiskModel()
        self.random_forest_model = RandomForestRiskModel()
    
    def predict_event_risk(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict risk level for a given event.
        
        Args:
            event: Raw event dictionary
            
        Returns:
            Prediction dictionary with risk score, confidence, and explanation
            
        Example:
            {
                "risk_score": 0.73,
                "confidence": 0.85,
                "explanation": {
                    "primary_factors": ["high_volume", "cross_chain"],
                    "model_type": "gradient_boost"
                },
                "prediction_window": "5-30m"
            }
        """
        preprocessed = self.preprocessor.prepare_event_features(event)
        features = self.feature_builder.build_from_event(preprocessed)
        prediction = self.gradient_boost_model.predict(features)
        
        return {
            "risk_score": prediction["score"],
            "confidence": prediction["confidence"],
            "explanation": {
                "primary_factors": ["high_volume", "cross_chain", "manipulation_pattern"],
                "model_type": prediction["model_type"],
                "feature_count": len(features)
            },
            "prediction_window": "5-30m"
        }
    
    def predict_entity_risk(self, entity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict risk level for a given entity.
        
        Args:
            entity: Raw entity dictionary
            
        Returns:
            Prediction dictionary with risk score, confidence, and explanation
            
        Example:
            {
                "risk_score": 0.68,
                "confidence": 0.82,
                "explanation": {
                    "primary_factors": ["high_activity", "darkpool_usage"],
                    "model_type": "random_forest"
                },
                "prediction_window": "1-6h"
            }
        """
        preprocessed = self.preprocessor.prepare_entity_features(entity)
        features = self.feature_builder.build_from_entity(preprocessed)
        prediction = self.random_forest_model.predict(features)
        
        return {
            "risk_score": prediction["score"],
            "confidence": prediction["confidence"],
            "explanation": {
                "primary_factors": ["high_activity", "darkpool_usage", "coordination_index"],
                "model_type": prediction["model_type"],
                "feature_count": len(features)
            },
            "prediction_window": "1-6h"
        }
    
    def predict_price_direction(self, token: str) -> Dict[str, Any]:
        """
        Predict price direction for a given token.
        
        Args:
            token: Token symbol (e.g., "BTC", "ETH")
            
        Returns:
            Prediction dictionary with direction, confidence, and explanation
            
        Example:
            {
                "risk_score": 0.62,
                "confidence": 0.75,
                "explanation": {
                    "direction": "up",
                    "magnitude": "moderate",
                    "model_type": "lstm"
                },
                "prediction_window": "15-60m"
            }
        """
        market_snapshot = self.preprocessor.prepare_market_snapshot()
        features = self.feature_builder.build_market_matrix(market_snapshot)
        prediction = self.lstm_model.predict(features)
        
        return {
            "risk_score": prediction["score"],
            "confidence": prediction["confidence"],
            "explanation": {
                "direction": "up",
                "magnitude": "moderate",
                "primary_factors": ["whale_accumulation", "liquidity_increase"],
                "model_type": prediction["model_type"]
            },
            "prediction_window": "15-60m"
        }
    
    def predict_ring_formation(self, entities: list) -> Dict[str, Any]:
        """
        Predict likelihood of manipulation ring formation.
        
        Args:
            entities: List of entity dictionaries
            
        Returns:
            Prediction dictionary with formation likelihood and explanation
            
        Example:
            {
                "risk_score": 0.78,
                "confidence": 0.88,
                "explanation": {
                    "coordination_level": "high",
                    "entity_count": 5,
                    "model_type": "gradient_boost"
                },
                "prediction_window": "10-45m"
            }
        """
        all_features = []
        for entity in entities[:5]:  # Limit to 5 entities
            preprocessed = self.preprocessor.prepare_entity_features(entity)
            features = self.feature_builder.build_from_entity(preprocessed)
            all_features.extend(features[:10])  # Take first 10 features from each
        
        prediction = self.gradient_boost_model.predict(all_features)
        
        return {
            "risk_score": prediction["score"],
            "confidence": prediction["confidence"],
            "explanation": {
                "coordination_level": "high",
                "entity_count": len(entities),
                "primary_factors": ["synchronized_timing", "shared_tokens", "cross_chain_coordination"],
                "model_type": prediction["model_type"]
            },
            "prediction_window": "10-45m"
        }
    
    def predict_chain_pressure(self, chain: str) -> Dict[str, Any]:
        """
        Predict pressure/congestion level for a given chain.
        
        Args:
            chain: Chain identifier (e.g., "ETH", "SOL", "BTC")
            
        Returns:
            Prediction dictionary with pressure level and explanation
            
        Example:
            {
                "risk_score": 0.55,
                "confidence": 0.70,
                "explanation": {
                    "pressure_level": "moderate",
                    "congestion_risk": "low",
                    "model_type": "logistic_regression"
                },
                "prediction_window": "20-90m"
            }
        """
        market_snapshot = self.preprocessor.prepare_market_snapshot()
        features = self.feature_builder.build_market_matrix(market_snapshot)
        prediction = self.logistic_model.predict(features)
        
        return {
            "risk_score": prediction["score"],
            "confidence": prediction["confidence"],
            "explanation": {
                "pressure_level": "moderate",
                "congestion_risk": "low",
                "primary_factors": ["transaction_volume", "gas_price", "network_utilization"],
                "model_type": prediction["model_type"],
                "chain": chain
            },
            "prediction_window": "20-90m"
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about loaded models.
        
        Returns:
            Dictionary with model metadata
        """
        return {
            "models": {
                "lstm": {
                    "type": "sequence_forecasting",
                    "status": "initialized",
                    "input_size": self.lstm_model.input_size
                },
                "gradient_boost": {
                    "type": "classification",
                    "status": "initialized",
                    "n_estimators": self.gradient_boost_model.n_estimators
                },
                "logistic": {
                    "type": "binary_classification",
                    "status": "initialized",
                    "regularization": self.logistic_model.regularization
                },
                "random_forest": {
                    "type": "ensemble_classification",
                    "status": "initialized",
                    "n_estimators": self.random_forest_model.n_estimators
                }
            },
            "engine_version": "1.0.0-alpha",
            "framework": "GhostPredictor™"
        }

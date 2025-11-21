"""
GhostPredictor™ Prediction API

FastAPI router for ML prediction endpoints.
Provides REST API access to prediction engine.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from .predictor_engine import GhostPredictorEngine


predictor_engine = GhostPredictorEngine()

router = APIRouter(prefix="/predict", tags=["GhostPredictor"])


class EventPredictionRequest(BaseModel):
    """Request model for event risk prediction."""
    event: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": {
                    "type": "whale_movement",
                    "score": 0.85,
                    "chain": "ETH",
                    "token": "USDT",
                    "entity_id": "entity-123"
                }
            }
        }


class EntityPredictionRequest(BaseModel):
    """Request model for entity risk prediction."""
    entity: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity": {
                    "id": "entity-123",
                    "type": "whale",
                    "score": 0.73,
                    "chain_count": 4,
                    "token_count": 8
                }
            }
        }


class TokenPredictionRequest(BaseModel):
    """Request model for token price direction prediction."""
    token: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "BTC"
            }
        }


class RingPredictionRequest(BaseModel):
    """Request model for ring formation prediction."""
    entities: List[Dict[str, Any]]
    
    class Config:
        json_schema_extra = {
            "example": {
                "entities": [
                    {"id": "entity-1", "type": "manipulation"},
                    {"id": "entity-2", "type": "manipulation"},
                    {"id": "entity-3", "type": "whale"}
                ]
            }
        }


class ChainPredictionRequest(BaseModel):
    """Request model for chain pressure prediction."""
    chain: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "chain": "ETH"
            }
        }


class PredictionResponse(BaseModel):
    """Standard prediction response model."""
    risk_score: float
    confidence: float
    explanation: Dict[str, Any]
    prediction_window: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "risk_score": 0.73,
                "confidence": 0.85,
                "explanation": {
                    "primary_factors": ["high_volume", "cross_chain"],
                    "model_type": "gradient_boost"
                },
                "prediction_window": "5-30m"
            }
        }



@router.post("/event", response_model=PredictionResponse)
async def predict_event_risk(request: EventPredictionRequest) -> Dict[str, Any]:
    """
    Predict risk level for a given event.
    
    Uses Gradient Boost model to classify event risk based on:
    - Event type and severity
    - Volume and liquidity metrics
    - Cross-chain indicators
    - Temporal patterns
    
    Returns:
        Prediction with risk score, confidence, and explanation
    """
    try:
        prediction = predictor_engine.predict_event_risk(request.event)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/entity", response_model=PredictionResponse)
async def predict_entity_risk(request: EntityPredictionRequest) -> Dict[str, Any]:
    """
    Predict risk level for a given entity.
    
    Uses Random Forest model to assess entity risk based on:
    - Activity patterns and frequency
    - Cross-chain behavior
    - Token diversity
    - Network connections
    
    Returns:
        Prediction with risk score, confidence, and explanation
    """
    try:
        prediction = predictor_engine.predict_entity_risk(request.entity)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/token", response_model=PredictionResponse)
async def predict_token_direction(request: TokenPredictionRequest) -> Dict[str, Any]:
    """
    Predict price direction for a given token.
    
    Uses LSTM model to forecast price movement based on:
    - Historical price patterns
    - Liquidity trends
    - Whale activity
    - Market sentiment
    
    Returns:
        Prediction with direction, confidence, and explanation
    """
    try:
        prediction = predictor_engine.predict_price_direction(request.token)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/ring", response_model=PredictionResponse)
async def predict_ring_formation(request: RingPredictionRequest) -> Dict[str, Any]:
    """
    Predict likelihood of manipulation ring formation.
    
    Uses Gradient Boost model to detect coordination patterns:
    - Synchronized timing
    - Shared tokens and chains
    - Network clustering
    - Behavioral similarity
    
    Returns:
        Prediction with formation likelihood and explanation
    """
    try:
        prediction = predictor_engine.predict_ring_formation(request.entities)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/chain", response_model=PredictionResponse)
async def predict_chain_pressure(request: ChainPredictionRequest) -> Dict[str, Any]:
    """
    Predict pressure/congestion level for a given chain.
    
    Uses Logistic Regression to assess chain stress:
    - Transaction volume
    - Gas prices
    - Network utilization
    - Pending transactions
    
    Returns:
        Prediction with pressure level and explanation
    """
    try:
        prediction = predictor_engine.predict_chain_pressure(request.chain)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/models")
async def get_model_info() -> Dict[str, Any]:
    """
    Get information about loaded ML models.
    
    Returns metadata about all available models including:
    - Model types and architectures
    - Initialization status
    - Configuration parameters
    
    Returns:
        Dictionary with model information
    """
    try:
        return predictor_engine.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint for prediction service.
    
    Returns:
        Status message
    """
    return {
        "status": "healthy",
        "service": "GhostPredictor™",
        "version": "1.0.0-alpha"
    }

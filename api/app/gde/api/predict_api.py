"""
GhostPredictor™ Prediction API - Champion Model Integration

FastAPI router for ML prediction endpoints using trained champion models.
Integrates GhostTrainer champion models with real-time feature extraction.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import os


router = APIRouter()


_champion_model = None
_champion_metadata = None
_model_loaded = False


def load_champion_model():
    """
    Load champion model from registry with in-memory caching.
    
    Returns:
        Tuple of (model, metadata)
    """
    global _champion_model, _champion_metadata, _model_loaded
    
    try:
        if _model_loaded and _champion_model is not None:
            return _champion_model, _champion_metadata
        
        print("[PredictAPI] Loading champion model...")
        
        from app.gde.predictor.model_save_load_manager import ModelSaveLoadManager
        from app.gde.predictor.model_registry_manager import ModelRegistryManager
        
        models_dir = "models"
        registry_path = os.path.join(models_dir, "model_registry.json")
        
        if not os.path.exists(registry_path):
            print(f"[PredictAPI] Registry not found at {registry_path}")
            return None, None
        
        registry = ModelRegistryManager(registry_path)
        latest = registry.get_latest()
        
        if not latest:
            print("[PredictAPI] No champion model found in registry")
            return None, None
        
        model_path = latest.get("file_path")
        if not model_path or not os.path.exists(model_path):
            print(f"[PredictAPI] Model file not found: {model_path}")
            return None, None
        
        manager = ModelSaveLoadManager()
        model = manager.load_model(model_path)
        
        if model is None:
            print("[PredictAPI] Failed to load model")
            return None, None
        
        _champion_model = model
        _champion_metadata = latest
        _model_loaded = True
        
        print(f"[PredictAPI] Champion model loaded: {latest.get('model_name')} v{latest.get('version')}")
        
        return _champion_model, _champion_metadata
        
    except Exception as e:
        print(f"[PredictAPI] Error loading champion model: {e}")
        return None, None


def extract_features(event: Dict[str, Any] = None, entity: Dict[str, Any] = None, 
                    chain: Dict[str, Any] = None, token: Dict[str, Any] = None) -> List[float]:
    """
    Extract features from input data using PredictFeatureBuilder.
    
    Args:
        event: Event data dict (optional)
        entity: Entity data dict (optional)
        chain: Chain data dict (optional)
        token: Token data dict (optional)
    
    Returns:
        Feature vector (list of floats)
    """
    try:
        from app.gde.predictor.features.predict_feature_builder import PredictFeatureBuilder
        
        builder = PredictFeatureBuilder()
        
        event = event or {}
        entity = entity or {}
        chain = chain or {}
        token = token or {}
        
        features = builder.build(event, entity, chain, token)
        
        return features
        
    except Exception as e:
        print(f"[PredictAPI] Error extracting features: {e}")
        return []


def classify_risk(risk_score: float) -> str:
    """
    Classify risk score into categories.
    
    Args:
        risk_score: Risk score between 0 and 1
    
    Returns:
        Classification: "high", "medium", or "low"
    """
    if risk_score >= 0.7:
        return "high"
    elif risk_score >= 0.4:
        return "medium"
    else:
        return "low"


class EventPredictionRequest(BaseModel):
    """Request model for event risk prediction."""
    event: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": {
                    "value": 125000,
                    "chain": "ETH",
                    "timestamp": 1700000000,
                    "type": "swap"
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
                    "chain_count": 4,
                    "token_count": 8
                }
            }
        }


class TokenPredictionRequest(BaseModel):
    """Request model for token price direction prediction."""
    token: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": {
                    "symbol": "BTC",
                    "price": 45000,
                    "volume": 1000000000
                }
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
                    {"id": "entity-2", "type": "manipulation"}
                ]
            }
        }


class ChainPredictionRequest(BaseModel):
    """Request model for chain pressure prediction."""
    chain: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "chain": {
                    "name": "ETH",
                    "gas_price": 50,
                    "tps": 15
                }
            }
        }


class BatchPredictionRequest(BaseModel):
    """Request model for batch predictions."""
    events: List[Dict[str, Any]]
    
    class Config:
        json_schema_extra = {
            "example": {
                "events": [
                    {"value": 125000, "chain": "ETH"},
                    {"value": 250000, "chain": "BTC"}
                ]
            }
        }


@router.post("/event")
async def predict_event(request: EventPredictionRequest) -> Dict[str, Any]:
    """
    Predict risk level for a given event.
    
    Uses champion model to classify event risk based on:
    - Event type and severity
    - Volume and liquidity metrics
    - Cross-chain indicators
    - Temporal patterns
    
    Returns:
        Prediction with risk score, confidence, and classification
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        features = extract_features(event=request.event)
        
        if not features:
            return {
                "success": False,
                "error": "Failed to extract features"
            }
        
        prediction = model.predict([features])
        
        if not prediction or len(prediction) == 0:
            return {
                "success": False,
                "error": "Prediction failed"
            }
        
        risk_score = float(prediction[0])
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "risk_score": risk_score,
            "confidence": risk_score,
            "classification": classify_risk(risk_score)
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in predict_event: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/entity")
async def predict_entity(request: EntityPredictionRequest) -> Dict[str, Any]:
    """
    Predict manipulation probability and behavioral risk for an entity.
    
    Returns:
        Prediction with manipulation probability and behavioral risk
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        features = extract_features(entity=request.entity)
        
        if not features:
            return {
                "success": False,
                "error": "Failed to extract features"
            }
        
        prediction = model.predict([features])
        
        if not prediction or len(prediction) == 0:
            return {
                "success": False,
                "error": "Prediction failed"
            }
        
        risk_score = float(prediction[0])
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "manipulation_probability": risk_score,
            "behavioral_risk": classify_risk(risk_score),
            "confidence": risk_score
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in predict_entity: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/token")
async def predict_token(request: TokenPredictionRequest) -> Dict[str, Any]:
    """
    Predict price direction for a token.
    
    Returns:
        Prediction with price direction (up/down/flat) and confidence
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        features = extract_features(token=request.token)
        
        if not features:
            return {
                "success": False,
                "error": "Failed to extract features"
            }
        
        prediction = model.predict([features])
        
        if not prediction or len(prediction) == 0:
            return {
                "success": False,
                "error": "Prediction failed"
            }
        
        risk_score = float(prediction[0])
        
        if risk_score >= 0.6:
            direction = "up"
        elif risk_score <= 0.4:
            direction = "down"
        else:
            direction = "flat"
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "direction": direction,
            "confidence": abs(risk_score - 0.5) * 2,
            "risk_score": risk_score
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in predict_token: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/ring")
async def predict_ring(request: RingPredictionRequest) -> Dict[str, Any]:
    """
    Predict ring formation probability.
    
    Returns:
        Prediction with ring formation probability
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        if not request.entities or len(request.entities) == 0:
            return {
                "success": False,
                "error": "No entities provided"
            }
        
        entity_data = request.entities[0] if request.entities else {}
        features = extract_features(entity=entity_data)
        
        if not features:
            return {
                "success": False,
                "error": "Failed to extract features"
            }
        
        prediction = model.predict([features])
        
        if not prediction or len(prediction) == 0:
            return {
                "success": False,
                "error": "Prediction failed"
            }
        
        risk_score = float(prediction[0])
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "ring_probability": risk_score,
            "classification": classify_risk(risk_score),
            "confidence": risk_score
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in predict_ring: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/chain")
async def predict_chain(request: ChainPredictionRequest) -> Dict[str, Any]:
    """
    Predict chain pressure score.
    
    Returns:
        Prediction with chain pressure score
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        features = extract_features(chain=request.chain)
        
        if not features:
            return {
                "success": False,
                "error": "Failed to extract features"
            }
        
        prediction = model.predict([features])
        
        if not prediction or len(prediction) == 0:
            return {
                "success": False,
                "error": "Prediction failed"
            }
        
        risk_score = float(prediction[0])
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "pressure_score": risk_score,
            "classification": classify_risk(risk_score),
            "confidence": risk_score
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in predict_chain: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/batch")
async def predict_batch(request: BatchPredictionRequest) -> Dict[str, Any]:
    """
    Predict risk for multiple events in batch.
    
    Returns:
        List of predictions for each event
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        if not request.events or len(request.events) == 0:
            return {
                "success": False,
                "error": "No events provided"
            }
        
        predictions = []
        
        for event in request.events:
            try:
                features = extract_features(event=event)
                
                if not features:
                    predictions.append({
                        "success": False,
                        "error": "Failed to extract features"
                    })
                    continue
                
                prediction = model.predict([features])
                
                if not prediction or len(prediction) == 0:
                    predictions.append({
                        "success": False,
                        "error": "Prediction failed"
                    })
                    continue
                
                risk_score = float(prediction[0])
                
                predictions.append({
                    "success": True,
                    "risk_score": risk_score,
                    "confidence": risk_score,
                    "classification": classify_risk(risk_score)
                })
                
            except Exception as e:
                predictions.append({
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "predictions": predictions,
            "total": len(request.events),
            "successful": sum(1 for p in predictions if p.get("success"))
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in predict_batch: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/champion")
async def get_champion() -> Dict[str, Any]:
    """
    Get champion model metadata.
    
    Returns:
        Champion model name, version, F1 score, and timestamp
    """
    try:
        model, metadata = load_champion_model()
        
        if model is None or metadata is None:
            return {
                "success": False,
                "error": "Champion model not available"
            }
        
        return {
            "success": True,
            "model_name": metadata.get("model_name", "Unknown"),
            "version": metadata.get("version", 0),
            "f1_score": metadata.get("metrics", {}).get("mean_f1", 0.0),
            "accuracy": metadata.get("metrics", {}).get("mean_accuracy", 0.0),
            "precision": metadata.get("metrics", {}).get("mean_precision", 0.0),
            "recall": metadata.get("metrics", {}).get("mean_recall", 0.0),
            "timestamp": metadata.get("timestamp", ""),
            "file_path": metadata.get("file_path", "")
        }
        
    except Exception as e:
        print(f"[PredictAPI] Error in get_champion: {e}")
        return {
            "success": False,
            "error": str(e)
        }

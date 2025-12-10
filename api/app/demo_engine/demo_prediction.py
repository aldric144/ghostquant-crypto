"""
Demo Prediction Module
Thin wrapper around existing DemoEngine for behavioral forecasting demos.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from app.gde.demo.demo_engine import DemoEngine
from app.gde.demo.demo_schema import DemoPrediction, DemoDNA, DemoActorProfile


class PredictionDemoResponse(BaseModel):
    """Enhanced prediction response for demo mode."""
    prediction: DemoPrediction
    behavioral_dna: DemoDNA
    actor_profile: DemoActorProfile
    forecast_summary: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    demo_mode: bool = True


_demo_engine = DemoEngine(seed=42)


def get_demo_prediction(entity: Optional[str] = None) -> PredictionDemoResponse:
    """
    Generate a comprehensive demo prediction response.
    
    Combines prediction, behavioral DNA, and actor profile for a rich demo experience.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        PredictionDemoResponse: Complete prediction demo data
    """
    prediction = _demo_engine.run_demo_prediction(entity)
    dna = _demo_engine.run_demo_dna(entity)
    actor = _demo_engine.run_demo_actor_profile(entity)
    
    forecast_summary = {
        "risk_trajectory": prediction.risk_level,
        "confidence_score": prediction.confidence,
        "behavioral_classification": dna.classification,
        "threat_level": actor.threat_level,
        "recommended_action": prediction.recommendation,
        "timeframe": prediction.timeframe,
        "key_indicators": [
            {"name": ind["name"], "severity": "high" if ind["value"] > 70 else "medium" if ind["value"] > 40 else "low"}
            for ind in prediction.indicators
        ],
        "pattern_consistency": dna.pattern_consistency,
        "anomaly_count": len(dna.anomaly_detection)
    }
    
    return PredictionDemoResponse(
        prediction=prediction,
        behavioral_dna=dna,
        actor_profile=actor,
        forecast_summary=forecast_summary
    )

"""
Demo Engine Router
FastAPI endpoints for the subscriber demo mode.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from .demo_prediction import get_demo_prediction, PredictionDemoResponse
from .demo_entity_scan import get_demo_entity_scan, EntityScanDemoResponse
from .demo_risk_map import get_demo_risk_map, RiskMapDemoResponse


demo_engine_router = APIRouter(prefix="/demo", tags=["Demo Mode"])


@demo_engine_router.get("/health")
async def demo_health():
    """
    Health check for demo engine.
    
    Returns:
        dict: Health status
    """
    return {
        "status": "healthy",
        "service": "demo_engine",
        "mode": "demo",
        "endpoints": ["/demo/predict", "/demo/scan", "/demo/riskmap"]
    }


@demo_engine_router.get("/predict", response_model=PredictionDemoResponse)
async def demo_predict(
    entity: Optional[str] = Query(None, description="Optional entity address (uses synthetic data)")
):
    """
    Run behavioral prediction demo.
    
    Generates synthetic prediction data including:
    - Behavioral forecasting
    - DNA analysis
    - Actor profiling
    - Risk trajectory
    
    This endpoint returns realistic-looking but completely synthetic data
    for demonstration purposes.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        PredictionDemoResponse: Complete prediction demo data
    """
    try:
        return get_demo_prediction(entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo prediction failed: {str(e)}")


@demo_engine_router.get("/scan", response_model=EntityScanDemoResponse)
async def demo_scan(
    address: Optional[str] = Query(None, description="Optional entity address (uses synthetic data)")
):
    """
    Run entity scan demo.
    
    Generates synthetic entity analysis including:
    - Entity profile
    - Behavioral DNA
    - Actor classification
    - Fusion analysis
    - Risk factors
    
    This endpoint returns realistic-looking but completely synthetic data
    for demonstration purposes.
    
    Args:
        address: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        EntityScanDemoResponse: Complete entity scan demo data
    """
    try:
        return get_demo_entity_scan(address)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo entity scan failed: {str(e)}")


@demo_engine_router.get("/riskmap", response_model=RiskMapDemoResponse)
async def demo_riskmap():
    """
    View global risk map demo.
    
    Generates synthetic global threat visualization including:
    - Constellation map
    - Hydra detection
    - Sentinel status
    - Chain metrics
    - Regional threats
    
    This endpoint returns realistic-looking but completely synthetic data
    for demonstration purposes.
    
    Returns:
        RiskMapDemoResponse: Complete risk map demo data
    """
    try:
        return get_demo_risk_map()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo risk map failed: {str(e)}")

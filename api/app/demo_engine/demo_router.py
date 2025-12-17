"""
Demo Engine Router
FastAPI endpoints for the subscriber demo mode.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from .demo_prediction import get_demo_prediction, PredictionDemoResponse
from .demo_entity_scan import get_demo_entity_scan, EntityScanDemoResponse
from .demo_risk_map import get_demo_risk_map, RiskMapDemoResponse
from .demo_analytics import (
    get_market_analytics,
    get_whale_analytics,
    get_entity_analytics,
    get_anomaly_analytics,
    get_narrative_analytics,
    MarketAnalyticsResponse,
    WhaleAnalyticsResponse,
    EntityAnalyticsResponse,
    AnomalyAnalyticsResponse,
    NarrativeAnalyticsResponse,
)
from .demo_copilot import (
    get_demo_copilot_answer,
    CopilotAnswerResponse,
    CopilotQuestionRequest,
)


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



# Analytics Dashboard Endpoints

@demo_engine_router.get("/analytics/market", response_model=MarketAnalyticsResponse)
async def demo_analytics_market():
    """
    Get market analytics for the dashboard.
    
    Returns market risk index, volatility, regional data, and trend data.
    """
    try:
        return get_market_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market analytics failed: {str(e)}")


@demo_engine_router.get("/analytics/whales", response_model=WhaleAnalyticsResponse)
async def demo_analytics_whales():
    """
    Get whale analytics for the dashboard.
    
    Returns whale activity by class, top clusters, and activity sparkline.
    """
    try:
        return get_whale_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whale analytics failed: {str(e)}")


@demo_engine_router.get("/analytics/entities", response_model=EntityAnalyticsResponse)
async def demo_analytics_entities():
    """
    Get entity analytics for the dashboard.
    
    Returns entity classification distribution and risk buckets.
    """
    try:
        return get_entity_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity analytics failed: {str(e)}")


@demo_engine_router.get("/analytics/anomalies", response_model=AnomalyAnalyticsResponse)
async def demo_analytics_anomalies():
    """
    Get anomaly analytics for the dashboard.
    
    Returns recent flow anomalies with confidence scores.
    """
    try:
        return get_anomaly_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly analytics failed: {str(e)}")


@demo_engine_router.get("/analytics/narrative", response_model=NarrativeAnalyticsResponse)
async def demo_analytics_narrative():
    """
    Get AI-generated narrative analytics for the dashboard.
    
    Returns market summary, regime, outlook, and key highlights.
    """
    try:
        return get_narrative_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Narrative analytics failed: {str(e)}")


# Voice Copilot Endpoint

@demo_engine_router.post("/copilot/answer", response_model=CopilotAnswerResponse)
async def demo_copilot_answer(request: CopilotQuestionRequest):
    """
    Get a Voice Copilot answer for a user question.
    
    Generates synthetic but realistic GhostQuant responses based on:
    - Question content and intent
    - Current page context
    - Selected entities/addresses
    
    This endpoint returns intelligent responses about GhostQuant features
    for demonstration purposes.
    
    Args:
        request: CopilotQuestionRequest with question and context
    
    Returns:
        CopilotAnswerResponse: Copilot answer with category and suggestions
    """
    try:
        return get_demo_copilot_answer(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot answer failed: {str(e)}")

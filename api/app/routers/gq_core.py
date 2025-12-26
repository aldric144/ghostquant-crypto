"""
GQ-Core Router

Unified GhostQuant Hybrid Intelligence Engine API endpoints.
All endpoints return data with source ("real" or "synthetic") and timestamp.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib

from app.gde.gq_core.service import get_gq_core_service
from app.gde.gq_core.ecosystems import get_ecosystems_service

router = APIRouter(prefix="/gq-core", tags=["GQ-Core"])


# Prediction request/response models
class PredictionRequest(BaseModel):
    """Unified prediction request model."""
    entity: Optional[str] = None
    token: Optional[str] = None
    chain: Optional[str] = None
    timeframe: Optional[str] = "24h"
    context: Optional[str] = "risk"  # risk | price | manipulation | network
    event: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity": "0x1234...",
                "token": "ETH",
                "chain": "ethereum",
                "timeframe": "24h",
                "context": "risk"
            }
        }


def _generate_synthetic_prediction(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a deterministic synthetic prediction based on payload.
    Uses payload hash as seed for reproducible results.
    """
    # Create deterministic seed from payload
    seed_str = str(sorted(payload.items()))
    seed_hash = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    
    # Deterministic pseudo-random based on seed
    def seeded_random(seed: int, index: int = 0) -> float:
        h = (seed + index * 0x6D2B79F5) & 0xFFFFFFFF
        h = ((h ^ (h >> 15)) * (1 | h)) & 0xFFFFFFFF
        h = (h + ((h ^ (h >> 7)) * (61 | h))) & 0xFFFFFFFF
        return ((h ^ (h >> 14)) & 0xFFFFFFFF) / 4294967296
    
    # Generate risk score (0.2 - 0.85 range for plausibility)
    risk_score = 0.2 + seeded_random(seed_hash, 0) * 0.65
    
    # Determine confidence tier based on risk score variance
    confidence_value = 0.55 + seeded_random(seed_hash, 1) * 0.35
    if confidence_value >= 0.78:
        confidence_tier = "Confirmed"
    elif confidence_value >= 0.65:
        confidence_tier = "Emerging"
    else:
        confidence_tier = "Early"
    
    # Generate context-aware summary
    context = payload.get("context", "risk")
    entity = payload.get("entity", "Unknown Entity")
    token = payload.get("token", "Unknown Token")
    chain = payload.get("chain", "Unknown Chain")
    
    summaries = {
        "risk": f"Risk assessment for {entity or token} on {chain}: Moderate activity patterns detected with {int(risk_score * 100)}% risk probability.",
        "price": f"Price direction analysis for {token}: Market signals suggest {'bullish' if risk_score > 0.5 else 'bearish'} momentum with {int(confidence_value * 100)}% confidence.",
        "manipulation": f"Manipulation scan for {entity}: {'Elevated' if risk_score > 0.6 else 'Normal'} behavioral indicators detected across {chain} network.",
        "network": f"Network pressure analysis for {chain}: {'High' if risk_score > 0.7 else 'Moderate' if risk_score > 0.4 else 'Low'} congestion with {int(seeded_random(seed_hash, 2) * 100)} TPS."
    }
    
    # Generate signals array
    signal_templates = [
        {"type": "volume_spike", "severity": "medium", "description": "Unusual volume detected"},
        {"type": "whale_activity", "severity": "high", "description": "Large holder movement"},
        {"type": "liquidity_shift", "severity": "low", "description": "Pool rebalancing observed"},
        {"type": "cross_chain", "severity": "medium", "description": "Bridge activity detected"},
        {"type": "smart_contract", "severity": "high", "description": "Contract interaction pattern"},
        {"type": "mempool_anomaly", "severity": "medium", "description": "Pending transaction cluster"},
        {"type": "price_deviation", "severity": "low", "description": "Price divergence from index"}
    ]
    
    # Select 3-5 signals deterministically
    num_signals = 3 + int(seeded_random(seed_hash, 3) * 3)
    signals = []
    for i in range(num_signals):
        idx = int(seeded_random(seed_hash, 10 + i) * len(signal_templates))
        signals.append(signal_templates[idx])
    
    # Generate probability bands
    base_prob = risk_score
    probability_bands = {
        "very_low": max(0, 0.1 - base_prob * 0.1),
        "low": max(0, 0.25 - base_prob * 0.15),
        "medium": 0.3 + seeded_random(seed_hash, 4) * 0.2,
        "high": base_prob * 0.4,
        "critical": base_prob * 0.15
    }
    
    # Determine classification
    if risk_score >= 0.7:
        classification = "high"
    elif risk_score >= 0.4:
        classification = "medium"
    else:
        classification = "low"
    
    return {
        "predictionId": f"syn-{seed_hash:08x}",
        "predictionType": context,
        "confidenceTier": confidence_tier,
        "riskScore": round(risk_score, 4),
        "confidence": round(confidence_value, 4),
        "classification": classification,
        "summary": summaries.get(context, summaries["risk"]),
        "signals": signals,
        "probabilityBands": probability_bands,
        "explanation": f"This prediction is based on synthesized analysis patterns. The {confidence_tier.lower()} confidence level indicates {'strong' if confidence_tier == 'Confirmed' else 'developing'} signal correlation.",
        "synthetic": True,
        "success": True,
        "model_name": "GhostPredictor-Synthetic",
        "version": 1,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/predict")
async def gq_core_predict(request: PredictionRequest) -> Dict[str, Any]:
    """
    Unified prediction endpoint with automatic synthetic fallback.
    
    Attempts to use the live ML model first. If unavailable, returns
    a deterministic synthetic prediction marked as synthetic: true.
    
    Returns:
        Prediction with risk score, confidence tier, signals, and probability bands
    """
    payload = {
        "entity": request.entity,
        "token": request.token,
        "chain": request.chain,
        "timeframe": request.timeframe,
        "context": request.context,
        "event": request.event
    }
    
    # Try to use the live prediction model
    try:
        from app.gde.api.predict_api import load_champion_model, extract_features, classify_risk
        
        model, metadata = load_champion_model()
        
        if model is not None and metadata is not None:
            # Build features from payload
            event_data = request.event or {
                "value": 0,
                "chain": request.chain or "unknown",
                "timestamp": int(datetime.utcnow().timestamp()),
                "type": request.context or "risk",
                "token": request.token or "unknown"
            }
            
            features = extract_features(event=event_data)
            
            if features:
                prediction = model.predict([features])
                
                if prediction and len(prediction) > 0:
                    risk_score = float(prediction[0])
                    
                    # Determine confidence tier from model output
                    if risk_score >= 0.78:
                        confidence_tier = "Confirmed"
                    elif risk_score >= 0.65:
                        confidence_tier = "Emerging"
                    elif risk_score >= 0.55:
                        confidence_tier = "Early"
                    else:
                        confidence_tier = "Early"
                    
                    return {
                        "predictionId": f"live-{int(datetime.utcnow().timestamp())}",
                        "predictionType": request.context or "risk",
                        "confidenceTier": confidence_tier,
                        "riskScore": round(risk_score, 4),
                        "confidence": round(risk_score, 4),
                        "classification": classify_risk(risk_score),
                        "summary": f"Live prediction for {request.entity or request.token or 'target'}: Risk score {risk_score:.2%}",
                        "signals": [],
                        "probabilityBands": {
                            "low": max(0, 1 - risk_score),
                            "medium": 0.3,
                            "high": risk_score * 0.7
                        },
                        "explanation": "This prediction is based on live ML model inference.",
                        "synthetic": False,
                        "success": True,
                        "model_name": metadata.get("model_name", "GhostPredictor"),
                        "version": metadata.get("version", 1),
                        "timestamp": datetime.utcnow().isoformat()
                    }
    except Exception as e:
        # Log but don't fail - fall through to synthetic
        print(f"[GQ-Core] Live prediction failed, using synthetic: {e}")
    
    # Return synthetic prediction as fallback
    return _generate_synthetic_prediction(payload)


@router.get("/overview")
async def get_overview() -> Dict[str, Any]:
    """
    Get unified overview data combining risk, whales, rings, anomalies, and system status.
    
    Returns:
        Overview data with source and timestamp
    """
    service = get_gq_core_service()
    return await service.get_overview()


@router.get("/risk")
async def get_risk() -> Dict[str, Any]:
    """
    Get risk assessment data.
    
    Returns:
        Risk data with overall score, threat level, distribution, and top risks
    """
    service = get_gq_core_service()
    return await service.get_risk()


@router.get("/whales")
async def get_whales() -> Dict[str, Any]:
    """
    Get whale intelligence data.
    
    Returns:
        Whale data with top whales and recent movements
    """
    service = get_gq_core_service()
    return await service.get_whales()


@router.get("/trends")
async def get_trends() -> Dict[str, Any]:
    """
    Get trend analytics data including weekly heatmap.
    
    Returns:
        Trend data with hourly activity, heatmap, and events
    """
    service = get_gq_core_service()
    return await service.get_trends()


@router.get("/map")
async def get_map() -> Dict[str, Any]:
    """
    Get threat map data.
    
    Returns:
        Map data with hot zones and connections
    """
    service = get_gq_core_service()
    return await service.get_map()


@router.get("/anomalies")
async def get_anomalies() -> Dict[str, Any]:
    """
    Get anomaly detection data.
    
    Returns:
        Anomaly data with outliers and patterns
    """
    service = get_gq_core_service()
    return await service.get_anomalies()


@router.get("/entities")
async def get_entities() -> Dict[str, Any]:
    """
    Get entity intelligence data.
    
    Returns:
        Entity data with entities and categories
    """
    service = get_gq_core_service()
    return await service.get_entities()


@router.get("/narratives")
async def get_narratives() -> Dict[str, Any]:
    """
    Get narrative intelligence data.
    
    Returns:
        Narrative data with summary, top threats, and topics
    """
    service = get_gq_core_service()
    return await service.get_narratives()


@router.get("/rings")
async def get_rings() -> Dict[str, Any]:
    """
    Get ring detection data.
    
    Returns:
        Ring data with detected manipulation rings and severity distribution
    """
    service = get_gq_core_service()
    return await service.get_rings()


@router.get("/system-status")
async def get_system_status() -> Dict[str, Any]:
    """
    Get system status data.
    
    Returns:
        System status with WebSocket, worker, Redis, and engine statuses
    """
    service = get_gq_core_service()
    return await service.get_system_status()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for GQ-Core.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "gq-core",
        "version": "1.0.0"
    }


# Ecosystems endpoints
@router.get("/ecosystems")
async def get_ecosystems() -> Dict[str, Any]:
    """
    Get overview data for all supported blockchain ecosystems.
    
    Returns:
        All ecosystem summaries with TVL, volume, risk scores
    """
    service = get_ecosystems_service()
    return service.get_all_ecosystems()


@router.get("/ecosystems/{chain}")
async def get_ecosystem(chain: str) -> Dict[str, Any]:
    """
    Get detailed data for a specific blockchain ecosystem.
    
    Args:
        chain: Chain identifier (e.g., "ethereum", "solana", "arbitrum")
    
    Returns:
        Detailed ecosystem data including protocols, events, and risk breakdown
    """
    service = get_ecosystems_service()
    result = service.get_ecosystem(chain)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Ecosystem '{chain}' not found")
    return result


# Extended GQ-Core endpoints for all terminal modules

@router.get("/liquidity/pools")
async def get_liquidity_pools(chain: str = "ethereum", timeframe: str = "24h") -> Dict[str, Any]:
    """Get liquidity pool data for a specific chain."""
    service = get_gq_core_service()
    return await service.get_liquidity_pools(chain, timeframe)


@router.get("/smart-money/tracker")
async def get_smart_money_tracker() -> Dict[str, Any]:
    """Get smart money tracking data."""
    service = get_gq_core_service()
    return await service.get_smart_money_tracker()


@router.get("/volatility/monitor")
async def get_volatility_monitor(regime: str = "all", timeframe: str = "24h") -> Dict[str, Any]:
    """Get volatility monitoring data."""
    service = get_gq_core_service()
    return await service.get_volatility_monitor(regime, timeframe)


@router.get("/sentiment/market")
async def get_sentiment_market() -> Dict[str, Any]:
    """Get market sentiment data."""
    service = get_gq_core_service()
    return await service.get_sentiment_market()


@router.get("/correlation/matrix")
async def get_correlation_matrix() -> Dict[str, Any]:
    """Get correlation matrix data."""
    service = get_gq_core_service()
    return await service.get_correlation_matrix()


@router.get("/exposure/analysis")
async def get_exposure_analysis(chain: str = "ethereum") -> Dict[str, Any]:
    """Get exposure analysis data."""
    service = get_gq_core_service()
    return await service.get_exposure_analysis(chain)


@router.get("/orderbook/depth")
async def get_orderbook_depth(symbol: str = "BTC", exchange: str = "binance", levels: int = 20) -> Dict[str, Any]:
    """Get order book depth data."""
    service = get_gq_core_service()
    return await service.get_orderbook_depth(symbol, exchange, levels)


@router.get("/derivatives/watch")
async def get_derivatives_watch(type: str = "futures", exchange: str = "binance") -> Dict[str, Any]:
    """Get derivatives watch data."""
    service = get_gq_core_service()
    return await service.get_derivatives_watch(type, exchange)


@router.get("/manipulation/detect")
async def get_manipulation_detect() -> Dict[str, Any]:
    """Get manipulation detection data."""
    service = get_gq_core_service()
    return await service.get_manipulation_detect()


@router.get("/threats/timeline")
async def get_threats_timeline() -> Dict[str, Any]:
    """Get threat timeline data."""
    service = get_gq_core_service()
    return await service.get_threats_timeline()


@router.get("/signals/confidence")
async def get_signals_confidence() -> Dict[str, Any]:
    """Get signal confidence data."""
    service = get_gq_core_service()
    return await service.get_signals_confidence()


@router.get("/events/fusion")
async def get_events_fusion() -> Dict[str, Any]:
    """Get event fusion data."""
    service = get_gq_core_service()
    return await service.get_events_fusion()


@router.get("/network/anomalies")
async def get_network_anomalies() -> Dict[str, Any]:
    """Get network anomaly data."""
    service = get_gq_core_service()
    return await service.get_network_anomalies()


@router.get("/patterns/recognition")
async def get_patterns_recognition() -> Dict[str, Any]:
    """Get pattern recognition data."""
    service = get_gq_core_service()
    return await service.get_patterns_recognition()


@router.get("/risk/time-series")
async def get_risk_time_series() -> Dict[str, Any]:
    """Get time-series risk data."""
    service = get_gq_core_service()
    return await service.get_risk_time_series()


@router.get("/risk/predictive")
async def get_risk_predictive() -> Dict[str, Any]:
    """Get predictive risk data."""
    service = get_gq_core_service()
    return await service.get_risk_predictive()


@router.get("/ai/forecast")
async def get_ai_forecast() -> Dict[str, Any]:
    """Get AI forecast data."""
    service = get_gq_core_service()
    return await service.get_ai_forecast()


@router.get("/alerts/rules")
async def get_alerts_rules() -> Dict[str, Any]:
    """Get alert rules data."""
    service = get_gq_core_service()
    return await service.get_alerts_rules()


@router.get("/governance/decisions")
async def get_governance_decisions() -> Dict[str, Any]:
    """Get governance decisions data."""
    service = get_gq_core_service()
    return await service.get_governance_decisions()


@router.get("/scenarios/list")
async def get_scenarios_list() -> Dict[str, Any]:
    """Get scenario simulation data."""
    service = get_gq_core_service()
    return await service.get_scenarios_list()


@router.get("/strategy/backtests")
async def get_strategy_backtests() -> Dict[str, Any]:
    """Get strategy backtest data."""
    service = get_gq_core_service()
    return await service.get_strategy_backtests()


@router.get("/telemetry/status")
async def get_telemetry_status() -> Dict[str, Any]:
    """Get system telemetry data."""
    service = get_gq_core_service()
    return await service.get_telemetry_status()

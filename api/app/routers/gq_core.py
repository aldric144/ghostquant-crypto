"""
GQ-Core Router

Unified GhostQuant Hybrid Intelligence Engine API endpoints.
All endpoints return data with source ("real" or "synthetic") and timestamp.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional

from app.gde.gq_core.service import get_gq_core_service
from app.gde.gq_core.ecosystems import get_ecosystems_service

router = APIRouter(prefix="/gq-core", tags=["GQ-Core"])


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

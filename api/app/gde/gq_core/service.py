"""
GQ-Core Service Layer

Provides unified access to all GhostQuant intelligence data with
automatic fallback from real-time data to synthetic data.
"""

import asyncio
import json
from typing import Any, Callable, Dict, Optional, Tuple
from datetime import datetime
import logging

from app.gde.gq_core.synthetic import SyntheticDataGenerator
from app.gde.fabric.redis_bus import RedisBus

logger = logging.getLogger(__name__)


class GQCoreService:
    """
    Unified GhostQuant Hybrid Intelligence Engine.
    
    Always attempts real data first, falls back to synthetic data
    if real data is unavailable or empty.
    """
    
    def __init__(self, timeout_seconds: float = 5.0):
        """
        Initialize the GQ-Core service.
        
        Args:
            timeout_seconds: Timeout for real data fetches before fallback
        """
        self.timeout = timeout_seconds
        self.synthetic = SyntheticDataGenerator()
        self.redis_bus = RedisBus()
        self._cache: Dict[str, Tuple[Any, datetime]] = {}
        self._cache_ttl = 30  # seconds
    
    async def get_with_fallback(
        self,
        kind: str,
        real_fn: Callable[[], Any],
        synthetic_fn: Callable[[], Dict[str, Any]],
        validate_fn: Optional[Callable[[Any], bool]] = None
    ) -> Dict[str, Any]:
        """
        Get data with automatic fallback to synthetic.
        
        Args:
            kind: Data category (for logging/caching)
            real_fn: Async function to fetch real data
            synthetic_fn: Function to generate synthetic data
            validate_fn: Optional function to validate real data (returns True if valid)
        
        Returns:
            Dict with source, timestamp, data, and optional fallback_reason
        """
        timestamp = datetime.utcnow().isoformat()
        
        # Check cache first
        if kind in self._cache:
            cached_data, cached_time = self._cache[kind]
            if (datetime.utcnow() - cached_time).total_seconds() < self._cache_ttl:
                return {
                    "source": cached_data.get("source", "synthetic"),
                    "timestamp": timestamp,
                    "data": cached_data.get("data", cached_data),
                    "cached": True
                }
        
        # Try to get real data
        try:
            real_data = await asyncio.wait_for(
                real_fn() if asyncio.iscoroutinefunction(real_fn) else asyncio.to_thread(real_fn),
                timeout=self.timeout
            )
            
            # Validate the data
            is_valid = True
            if validate_fn:
                is_valid = validate_fn(real_data)
            elif real_data is None:
                is_valid = False
            elif isinstance(real_data, dict) and not real_data:
                is_valid = False
            elif isinstance(real_data, list) and len(real_data) == 0:
                is_valid = False
            
            if is_valid:
                result = {
                    "source": "real",
                    "timestamp": timestamp,
                    "data": real_data
                }
                self._cache[kind] = (result, datetime.utcnow())
                logger.info(f"[GQ-Core] {kind}: returned real data")
                return result
            else:
                fallback_reason = "Real data validation failed (empty or invalid)"
                logger.warning(f"[GQ-Core] {kind}: {fallback_reason}")
                
        except asyncio.TimeoutError:
            fallback_reason = f"Real data fetch timed out after {self.timeout}s"
            logger.warning(f"[GQ-Core] {kind}: {fallback_reason}")
            
        except Exception as e:
            fallback_reason = f"Real data fetch error: {str(e)}"
            logger.error(f"[GQ-Core] {kind}: {fallback_reason}")
        
        # Fall back to synthetic data
        synthetic_data = synthetic_fn()
        result = {
            "source": "synthetic",
            "timestamp": timestamp,
            "data": synthetic_data,
            "fallback_reason": fallback_reason
        }
        self._cache[kind] = (result, datetime.utcnow())
        logger.info(f"[GQ-Core] {kind}: returned synthetic data")
        return result
    
    async def _get_redis_data(self, channel: str, count: int = 10) -> list:
        """Get latest data from a Redis channel."""
        if not self.redis_bus.enabled:
            return []
        
        messages = await self.redis_bus.get_latest(channel, count=count)
        parsed = []
        for msg in messages:
            if isinstance(msg, str):
                try:
                    parsed.append(json.loads(msg))
                except json.JSONDecodeError:
                    pass
        return parsed
    
    async def get_overview(self) -> Dict[str, Any]:
        """Get unified overview data."""
        return await self.get_with_fallback(
            kind="overview",
            real_fn=self._fetch_real_overview,
            synthetic_fn=self.synthetic.generate_overview
        )
    
    async def _fetch_real_overview(self) -> Optional[Dict[str, Any]]:
        """Fetch real overview data from Redis channels."""
        alerts = await self._get_redis_data("intel.alerts", count=20)
        signals = await self._get_redis_data("intel.signals", count=20)
        manipulation = await self._get_redis_data("intel.manipulation", count=20)
        
        if not alerts and not signals and not manipulation:
            return None
        
        # Aggregate real data into overview format
        return {
            "risk": self._aggregate_risk(alerts, signals, manipulation),
            "whales": self._aggregate_whales(alerts),
            "rings": self._aggregate_rings(manipulation),
            "anomalies": self._aggregate_anomalies(alerts, signals),
            "system": {"mode": "real-time", "uptime_seconds": 0}
        }
    
    def _aggregate_risk(self, alerts: list, signals: list, manipulation: list) -> Dict[str, Any]:
        """Aggregate risk data from real events."""
        total_events = len(alerts) + len(signals) + len(manipulation)
        if total_events == 0:
            return self.synthetic.generate_risk()
        
        high_severity = sum(1 for a in alerts if a.get("score", 0) > 0.8)
        overall_score = min(1.0, (high_severity / max(total_events, 1)) + 0.3)
        
        return {
            "overall_score": round(overall_score, 3),
            "threat_level": "critical" if overall_score > 0.8 else "high" if overall_score > 0.6 else "medium",
            "distribution": {
                "manipulation": len(manipulation),
                "whale": sum(1 for a in alerts if "whale" in str(a.get("type", "")).lower()),
                "darkpool": sum(1 for a in alerts if "darkpool" in str(a.get("type", "")).lower()),
                "stablecoin": sum(1 for a in alerts if "stablecoin" in str(a.get("type", "")).lower())
            },
            "top_risks": alerts[:5],
            "trend": "increasing" if len(alerts) > 10 else "stable"
        }
    
    def _aggregate_whales(self, alerts: list) -> Dict[str, Any]:
        """Aggregate whale data from real events."""
        whale_alerts = [a for a in alerts if "whale" in str(a.get("type", "")).lower()]
        if not whale_alerts:
            return self.synthetic.generate_whales()
        
        return {
            "total_whales": len(set(a.get("entity_id", "") for a in whale_alerts)),
            "active_24h": len(whale_alerts),
            "total_volume": sum(a.get("value", 0) for a in whale_alerts),
            "top_whales": whale_alerts[:10],
            "recent_movements": whale_alerts[:5]
        }
    
    def _aggregate_rings(self, manipulation: list) -> Dict[str, Any]:
        """Aggregate ring data from manipulation events."""
        if not manipulation:
            return self.synthetic.generate_rings()
        
        rings = []
        for i, m in enumerate(manipulation[:10]):
            rings.append({
                "id": f"ring-{i+1}",
                "name": f"Ring {chr(65 + i)}",
                "nodes": [],
                "severity": "high" if m.get("score", 0) > 0.8 else "medium",
                "score": m.get("score", 0.5),
                "activity_count": 1,
                "timestamp": m.get("timestamp", datetime.utcnow().isoformat()),
                "chains": [m.get("chain", "ethereum")],
                "tokens": [m.get("token", "unknown")],
                "pattern_type": m.get("pattern_type", "unknown"),
                "confidence": m.get("confidence", 0.5),
                "volume": m.get("volume", 0)
            })
        
        return {
            "total_rings": len(rings),
            "active_rings": len(rings),
            "rings": rings,
            "severity_distribution": {
                "high": sum(1 for r in rings if r["severity"] == "high"),
                "medium": sum(1 for r in rings if r["severity"] == "medium"),
                "low": sum(1 for r in rings if r["severity"] == "low")
            }
        }
    
    def _aggregate_anomalies(self, alerts: list, signals: list) -> Dict[str, Any]:
        """Aggregate anomaly data from real events."""
        all_events = alerts + signals
        if not all_events:
            return self.synthetic.generate_anomalies()
        
        outliers = []
        for i, e in enumerate(all_events[:8]):
            outliers.append({
                "id": f"outlier-{i+1}",
                "symbol": e.get("symbol", "unknown"),
                "type": e.get("type", "unknown"),
                "deviation": e.get("score", 0.5) * 10,
                "severity": "critical" if e.get("score", 0) > 0.8 else "high",
                "chain": e.get("chain", "ethereum"),
                "timestamp": e.get("timestamp", datetime.utcnow().isoformat())
            })
        
        return {
            "total_anomalies": len(all_events),
            "critical_count": sum(1 for e in all_events if e.get("score", 0) > 0.8),
            "outliers": outliers,
            "patterns": []
        }
    
    async def get_risk(self) -> Dict[str, Any]:
        """Get risk data."""
        return await self.get_with_fallback(
            kind="risk",
            real_fn=self._fetch_real_risk,
            synthetic_fn=self.synthetic.generate_risk
        )
    
    async def _fetch_real_risk(self) -> Optional[Dict[str, Any]]:
        """Fetch real risk data."""
        alerts = await self._get_redis_data("intel.alerts", count=20)
        signals = await self._get_redis_data("intel.signals", count=20)
        manipulation = await self._get_redis_data("intel.manipulation", count=20)
        
        if not alerts and not signals and not manipulation:
            return None
        
        return self._aggregate_risk(alerts, signals, manipulation)
    
    async def get_whales(self) -> Dict[str, Any]:
        """Get whale data."""
        return await self.get_with_fallback(
            kind="whales",
            real_fn=self._fetch_real_whales,
            synthetic_fn=self.synthetic.generate_whales
        )
    
    async def _fetch_real_whales(self) -> Optional[Dict[str, Any]]:
        """Fetch real whale data."""
        alerts = await self._get_redis_data("intel.alerts", count=50)
        whale_alerts = [a for a in alerts if "whale" in str(a.get("type", "")).lower()]
        
        if not whale_alerts:
            return None
        
        return self._aggregate_whales(alerts)
    
    async def get_trends(self) -> Dict[str, Any]:
        """Get trend data including weekly heatmap."""
        return await self.get_with_fallback(
            kind="trends",
            real_fn=self._fetch_real_trends,
            synthetic_fn=self.synthetic.generate_trends
        )
    
    async def _fetch_real_trends(self) -> Optional[Dict[str, Any]]:
        """Fetch real trend data."""
        events = await self._get_redis_data("intel.events", count=100)
        timeline = await self._get_redis_data("intel.timeline", count=50)
        
        if not events and not timeline:
            return None
        
        # Aggregate into trend format
        hourly_activity = []
        for i in range(24):
            hour_events = [e for e in events if datetime.fromisoformat(e.get("timestamp", "")).hour == i]
            hourly_activity.append({
                "hour": f"{i}:00",
                "value": len(hour_events),
                "type": "mixed"
            })
        
        return {
            "hourly_activity": hourly_activity,
            "heatmap": self.synthetic.generate_trends()["heatmap"],  # Use synthetic for heatmap structure
            "events": events[:10],
            "categories": ["manipulation", "whale", "darkpool", "stablecoin"]
        }
    
    async def get_map(self) -> Dict[str, Any]:
        """Get map data."""
        return await self.get_with_fallback(
            kind="map",
            real_fn=self._fetch_real_map,
            synthetic_fn=self.synthetic.generate_map
        )
    
    async def _fetch_real_map(self) -> Optional[Dict[str, Any]]:
        """Fetch real map data."""
        events = await self._get_redis_data("intel.events", count=100)
        
        if not events:
            return None
        
        # Aggregate by chain
        chain_counts: Dict[str, int] = {}
        for e in events:
            chain = e.get("chain", "unknown")
            chain_counts[chain] = chain_counts.get(chain, 0) + 1
        
        hot_zones = []
        for chain, count in chain_counts.items():
            hot_zones.append({
                "id": f"zone-{chain}",
                "chain": chain,
                "intensity": min(1.0, count / 20),
                "event_count": count,
                "coordinates": {"lat": 0, "lng": 0}
            })
        
        return {
            "hot_zones": hot_zones,
            "connections": [],
            "total_events": len(events)
        }
    
    async def get_anomalies(self) -> Dict[str, Any]:
        """Get anomaly data."""
        return await self.get_with_fallback(
            kind="anomalies",
            real_fn=self._fetch_real_anomalies,
            synthetic_fn=self.synthetic.generate_anomalies
        )
    
    async def _fetch_real_anomalies(self) -> Optional[Dict[str, Any]]:
        """Fetch real anomaly data."""
        alerts = await self._get_redis_data("intel.alerts", count=50)
        signals = await self._get_redis_data("intel.signals", count=50)
        
        if not alerts and not signals:
            return None
        
        return self._aggregate_anomalies(alerts, signals)
    
    async def get_entities(self) -> Dict[str, Any]:
        """Get entity data."""
        return await self.get_with_fallback(
            kind="entities",
            real_fn=self._fetch_real_entities,
            synthetic_fn=self.synthetic.generate_entities
        )
    
    async def _fetch_real_entities(self) -> Optional[Dict[str, Any]]:
        """Fetch real entity data."""
        intelligence = await self._get_redis_data("intel.intelligence", count=50)
        
        if not intelligence:
            return None
        
        entities = []
        seen_ids = set()
        for i in intelligence:
            entity = i.get("entity", {})
            entity_id = entity.get("entity_id", "")
            if entity_id and entity_id not in seen_ids:
                seen_ids.add(entity_id)
                entities.append({
                    "id": entity_id,
                    "address": entity.get("address", ""),
                    "type": entity.get("type", "unknown"),
                    "label": entity.get("label", "Unknown"),
                    "risk_score": entity.get("risk_score", 0.5),
                    "activity_count": 1,
                    "chains": [entity.get("chain", "ethereum")],
                    "last_active": i.get("timestamp", datetime.utcnow().isoformat())
                })
        
        return {
            "total_entities": len(entities),
            "entities": entities,
            "categories": {}
        }
    
    async def get_narratives(self) -> Dict[str, Any]:
        """Get narrative data."""
        return await self.get_with_fallback(
            kind="narratives",
            real_fn=self._fetch_real_narratives,
            synthetic_fn=self.synthetic.generate_narratives
        )
    
    async def _fetch_real_narratives(self) -> Optional[Dict[str, Any]]:
        """Fetch real narrative data."""
        alerts = await self._get_redis_data("intel.alerts", count=20)
        
        if not alerts:
            return None
        
        # Generate narrative from real alerts
        top_threats = []
        for i, a in enumerate(alerts[:3]):
            top_threats.append({
                "id": f"threat-{i+1}",
                "title": a.get("type", "Unknown Threat"),
                "severity": "critical" if a.get("score", 0) > 0.8 else "high",
                "affected_symbols": [a.get("symbol", "unknown")],
                "timestamp": a.get("timestamp", datetime.utcnow().isoformat())
            })
        
        return {
            "summary": f"Detected {len(alerts)} alerts in the last hour",
            "top_threats": top_threats,
            "topics": [],
            "sentiment": "bearish" if len(alerts) > 10 else "neutral"
        }
    
    async def get_rings(self) -> Dict[str, Any]:
        """Get ring detection data."""
        return await self.get_with_fallback(
            kind="rings",
            real_fn=self._fetch_real_rings,
            synthetic_fn=self.synthetic.generate_rings
        )
    
    async def _fetch_real_rings(self) -> Optional[Dict[str, Any]]:
        """Fetch real ring data."""
        manipulation = await self._get_redis_data("intel.manipulation", count=50)
        
        if not manipulation:
            return None
        
        return self._aggregate_rings(manipulation)
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get system status data."""
        # System status is always "real" - it reflects actual system state
        is_redis_connected = self.redis_bus.enabled
        
        try:
            # Test Redis connection
            if is_redis_connected:
                await self._get_redis_data("intel.alerts", count=1)
        except Exception:
            is_redis_connected = False
        
        return {
            "source": "real",
            "timestamp": datetime.utcnow().isoformat(),
            "data": self.synthetic.generate_system_status(is_real_mode=is_redis_connected)
        }
    
    # Extended GQ-Core methods for all terminal modules
    
    async def get_liquidity_pools(self, chain: str = "ethereum", timeframe: str = "24h") -> Dict[str, Any]:
        """Get liquidity pool data."""
        return await self.get_with_fallback(
            kind=f"liquidity-{chain}-{timeframe}",
            real_fn=lambda: None,  # No real data source yet
            synthetic_fn=lambda: self.synthetic.generate_liquidity_pools(chain, timeframe)
        )
    
    async def get_smart_money_tracker(self) -> Dict[str, Any]:
        """Get smart money tracking data."""
        return await self.get_with_fallback(
            kind="smart-money",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_smart_money_tracker
        )
    
    async def get_volatility_monitor(self, regime: str = "all", timeframe: str = "24h") -> Dict[str, Any]:
        """Get volatility monitoring data."""
        return await self.get_with_fallback(
            kind=f"volatility-{regime}-{timeframe}",
            real_fn=lambda: None,
            synthetic_fn=lambda: self.synthetic.generate_volatility_monitor(regime, timeframe)
        )
    
    async def get_sentiment_market(self) -> Dict[str, Any]:
        """Get market sentiment data."""
        return await self.get_with_fallback(
            kind="sentiment",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_sentiment_market
        )
    
    async def get_correlation_matrix(self) -> Dict[str, Any]:
        """Get correlation matrix data."""
        return await self.get_with_fallback(
            kind="correlation",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_correlation_matrix
        )
    
    async def get_exposure_analysis(self, chain: str = "ethereum") -> Dict[str, Any]:
        """Get exposure analysis data."""
        return await self.get_with_fallback(
            kind=f"exposure-{chain}",
            real_fn=lambda: None,
            synthetic_fn=lambda: self.synthetic.generate_exposure_analysis(chain)
        )
    
    async def get_orderbook_depth(self, symbol: str = "BTC", exchange: str = "binance", levels: int = 20) -> Dict[str, Any]:
        """Get order book depth data."""
        return await self.get_with_fallback(
            kind=f"orderbook-{symbol}-{exchange}",
            real_fn=lambda: None,
            synthetic_fn=lambda: self.synthetic.generate_orderbook_depth(symbol, exchange, levels)
        )
    
    async def get_derivatives_watch(self, derivative_type: str = "futures", exchange: str = "binance") -> Dict[str, Any]:
        """Get derivatives watch data."""
        return await self.get_with_fallback(
            kind=f"derivatives-{derivative_type}-{exchange}",
            real_fn=lambda: None,
            synthetic_fn=lambda: self.synthetic.generate_derivatives_watch(derivative_type, exchange)
        )
    
    async def get_manipulation_detect(self) -> Dict[str, Any]:
        """Get manipulation detection data."""
        return await self.get_with_fallback(
            kind="manipulation",
            real_fn=self._fetch_real_manipulation,
            synthetic_fn=self.synthetic.generate_manipulation_detect
        )
    
    async def _fetch_real_manipulation(self) -> Optional[Dict[str, Any]]:
        """Fetch real manipulation data."""
        manipulation = await self._get_redis_data("intel.manipulation", count=50)
        if not manipulation:
            return None
        return {"detections": manipulation, "total_detections": len(manipulation)}
    
    async def get_threats_timeline(self) -> Dict[str, Any]:
        """Get threat timeline data."""
        return await self.get_with_fallback(
            kind="threats-timeline",
            real_fn=self._fetch_real_threats_timeline,
            synthetic_fn=self.synthetic.generate_threats_timeline
        )
    
    async def _fetch_real_threats_timeline(self) -> Optional[Dict[str, Any]]:
        """Fetch real threat timeline data."""
        alerts = await self._get_redis_data("intel.alerts", count=50)
        if not alerts:
            return None
        return {"events": alerts, "total_events": len(alerts)}
    
    async def get_signals_confidence(self) -> Dict[str, Any]:
        """Get signal confidence data."""
        return await self.get_with_fallback(
            kind="signals",
            real_fn=self._fetch_real_signals,
            synthetic_fn=self.synthetic.generate_signals_confidence
        )
    
    async def _fetch_real_signals(self) -> Optional[Dict[str, Any]]:
        """Fetch real signal data."""
        signals = await self._get_redis_data("intel.signals", count=50)
        if not signals:
            return None
        return {"signals": signals, "total_signals": len(signals)}
    
    async def get_events_fusion(self) -> Dict[str, Any]:
        """Get event fusion data."""
        return await self.get_with_fallback(
            kind="events-fusion",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_events_fusion
        )
    
    async def get_network_anomalies(self) -> Dict[str, Any]:
        """Get network anomaly data."""
        return await self.get_with_fallback(
            kind="network-anomalies",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_network_anomalies
        )
    
    async def get_patterns_recognition(self) -> Dict[str, Any]:
        """Get pattern recognition data."""
        return await self.get_with_fallback(
            kind="patterns",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_patterns_recognition
        )
    
    async def get_risk_time_series(self) -> Dict[str, Any]:
        """Get time-series risk data."""
        return await self.get_with_fallback(
            kind="risk-time-series",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_risk_time_series
        )
    
    async def get_risk_predictive(self) -> Dict[str, Any]:
        """Get predictive risk data."""
        return await self.get_with_fallback(
            kind="risk-predictive",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_risk_predictive
        )
    
    async def get_ai_forecast(self) -> Dict[str, Any]:
        """Get AI forecast data."""
        return await self.get_with_fallback(
            kind="ai-forecast",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_ai_forecast
        )
    
    async def get_alerts_rules(self) -> Dict[str, Any]:
        """Get alert rules data."""
        return await self.get_with_fallback(
            kind="alerts-rules",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_alerts_rules
        )
    
    async def get_governance_decisions(self) -> Dict[str, Any]:
        """Get governance decisions data."""
        return await self.get_with_fallback(
            kind="governance",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_governance_decisions
        )
    
    async def get_scenarios_list(self) -> Dict[str, Any]:
        """Get scenario simulation data."""
        return await self.get_with_fallback(
            kind="scenarios",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_scenarios_list
        )
    
    async def get_strategy_backtests(self) -> Dict[str, Any]:
        """Get strategy backtest data."""
        return await self.get_with_fallback(
            kind="backtests",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_strategy_backtests
        )
    
    async def get_telemetry_status(self) -> Dict[str, Any]:
        """Get system telemetry data."""
        return await self.get_with_fallback(
            kind="telemetry",
            real_fn=lambda: None,
            synthetic_fn=self.synthetic.generate_telemetry_status
        )


# Global service instance
_gq_core_service: Optional[GQCoreService] = None


def get_gq_core_service() -> GQCoreService:
    """Get or create the global GQ-Core service instance."""
    global _gq_core_service
    if _gq_core_service is None:
        _gq_core_service = GQCoreService()
    return _gq_core_service

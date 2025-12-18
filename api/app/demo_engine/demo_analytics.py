"""
Demo Analytics Module
Provides synthetic analytics data for the GhostQuant Analytics Dashboard.
"""

import random
import string
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.gde.demo.demo_engine import DemoEngine


class MarketTrendPoint(BaseModel):
    """Single point in market trend timeline."""
    timestamp: datetime
    risk_index: int


class RegionRisk(BaseModel):
    """Risk data for a geographic region."""
    region: str
    risk_level: int
    entities: int
    anomalies_24h: int


class HeatMapPoint(BaseModel):
    """Synthetic geospatial point for heatmap visualization."""
    id: str
    lat: float
    lon: float
    intensity: float
    region: str
    label: str


class MarketAnalyticsResponse(BaseModel):
    """Market analytics response for RiskIndexCard and MarketTrendsGraph."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    global_risk_index: int
    volatility_index: int
    liquidity_stress: int
    manipulation_pressure: int
    regions: List[RegionRisk]
    trend_24h: List[MarketTrendPoint]
    heatmap_points: List[HeatMapPoint]
    demo_mode: bool = True


class WhaleClassActivity(BaseModel):
    """Activity metrics for a whale class."""
    whale_class: str
    active_whales: int
    net_flow_usd_24h: float
    avg_risk_score: int
    dominant_direction: str


class WhaleClusterSummary(BaseModel):
    """Summary of a whale cluster."""
    cluster_id: str
    label: str
    whales: int
    entities: int
    risk_score: int


class WhaleAnalyticsResponse(BaseModel):
    """Whale analytics response for WhaleActivityCard."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_whales: int
    active_whales_24h: int
    by_class: List[WhaleClassActivity]
    top_clusters: List[WhaleClusterSummary]
    activity_sparkline_24h: List[Dict[str, Any]]
    demo_mode: bool = True


class EntityTypeBucket(BaseModel):
    """Entity count by type."""
    type: str
    count: int
    avg_risk_score: int


class RiskBucket(BaseModel):
    """Entity count by risk level."""
    bucket: str
    count: int


class EntityAnalyticsResponse(BaseModel):
    """Entity analytics response for EntitySummaryCard."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_entities: int
    new_entities_24h: int
    high_risk_entities: int
    sanctioned_entities: int
    by_type: List[EntityTypeBucket]
    by_risk_bucket: List[RiskBucket]
    demo_mode: bool = True


class FlowAnomaly(BaseModel):
    """Individual flow anomaly detection."""
    anomaly_id: str
    timestamp: datetime
    chain: str
    region: str
    type: str
    severity: str
    confidence: float
    description: str
    entities: List[str]
    related_cluster_id: Optional[str] = None


class AnomalyAnalyticsResponse(BaseModel):
    """Anomaly analytics response for AnomalyFeedCard."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_anomalies_24h: int
    critical_anomalies_24h: int
    recent: List[FlowAnomaly]
    demo_mode: bool = True


class NarrativeHighlight(BaseModel):
    """Individual narrative highlight."""
    title: str
    detail: str
    severity: str


class NarrativeAnalyticsResponse(BaseModel):
    """Narrative analytics response for NarrativeInsightPanel."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    summary: str
    market_regime: str
    risk_outlook_24h: str
    key_highlights: List[NarrativeHighlight]
    call_to_action: str
    demo_mode: bool = True


class DemoAnalyticsEngine:
    """Generates synthetic analytics data for the dashboard."""
    
    def __init__(self, seed: int = 42):
        self.demo_engine = DemoEngine(seed=seed)
        self.chains = ["Ethereum", "BSC", "Polygon", "Avalanche", "Arbitrum", "Optimism"]
        self.regions = ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East"]
        self.whale_classes = ["fund", "exchange", "mixer", "exploit", "retail_mega"]
        self.entity_types = ["exchange", "dex", "mixer", "bridge", "retail", "contract", "whale"]
        self.anomaly_types = [
            "wash_trading", "spoofing", "cross_chain_bridge", "layering",
            "pump_and_dump", "front_running", "sandwich_attack", "flash_loan"
        ]
        
    def _generate_id(self, prefix: str = "") -> str:
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
        return f"{prefix}{suffix}" if prefix else suffix
    
    def _generate_address(self) -> str:
        return "0x" + ''.join(random.choices(string.hexdigits.lower(), k=40))
    
    def get_market_analytics(self) -> MarketAnalyticsResponse:
        """Generate market analytics data."""
        now = datetime.utcnow()
        
        global_risk = random.randint(35, 85)
        
        regions = [
            RegionRisk(
                region=region,
                risk_level=random.randint(20, 90),
                entities=random.randint(500, 5000),
                anomalies_24h=random.randint(5, 50)
            )
            for region in self.regions
        ]
        
        trend_24h = []
        base_risk = global_risk
        for i in range(24):
            timestamp = now - timedelta(hours=23-i)
            variation = random.randint(-10, 10)
            risk = max(0, min(100, base_risk + variation))
            trend_24h.append(MarketTrendPoint(timestamp=timestamp, risk_index=risk))
            base_risk = risk
        
        region_coords = {
            "North America": (40.0, -100.0),
            "Europe": (50.0, 10.0),
            "Asia-Pacific": (35.0, 120.0),
            "Latin America": (-15.0, -60.0),
            "Middle East": (25.0, 45.0)
        }
        
        heatmap_points = []
        for region, (base_lat, base_lon) in region_coords.items():
            for i in range(random.randint(3, 8)):
                lat = base_lat + random.uniform(-15, 15)
                lon = base_lon + random.uniform(-20, 20)
                heatmap_points.append(HeatMapPoint(
                    id=self._generate_id("hp_"),
                    lat=lat,
                    lon=lon,
                    intensity=random.uniform(0.2, 1.0),
                    region=region,
                    label=f"Anomaly cluster {i+1}"
                ))
        
        return MarketAnalyticsResponse(
            global_risk_index=global_risk,
            volatility_index=random.randint(20, 80),
            liquidity_stress=random.randint(10, 70),
            manipulation_pressure=random.randint(15, 75),
            regions=regions,
            trend_24h=trend_24h,
            heatmap_points=heatmap_points
        )
    
    def get_whale_analytics(self) -> WhaleAnalyticsResponse:
        """Generate whale analytics data."""
        now = datetime.utcnow()
        
        by_class = [
            WhaleClassActivity(
                whale_class=whale_class,
                active_whales=random.randint(10, 200),
                net_flow_usd_24h=random.uniform(-50000000, 100000000),
                avg_risk_score=random.randint(20, 80),
                dominant_direction=random.choice(["inflow", "outflow", "mixed"])
            )
            for whale_class in self.whale_classes
        ]
        
        top_clusters = [
            WhaleClusterSummary(
                cluster_id=self._generate_id("cluster_"),
                label=f"{random.choice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'])} Cluster",
                whales=random.randint(5, 50),
                entities=random.randint(20, 200),
                risk_score=random.randint(30, 90)
            )
            for _ in range(5)
        ]
        
        activity_sparkline = []
        for i in range(24):
            timestamp = now - timedelta(hours=23-i)
            activity_sparkline.append({
                "timestamp": timestamp.isoformat(),
                "active_whales": random.randint(50, 300)
            })
        
        total_whales = sum(wc.active_whales for wc in by_class)
        
        return WhaleAnalyticsResponse(
            total_whales=total_whales + random.randint(100, 500),
            active_whales_24h=total_whales,
            by_class=by_class,
            top_clusters=top_clusters,
            activity_sparkline_24h=activity_sparkline
        )
    
    def get_entity_analytics(self) -> EntityAnalyticsResponse:
        """Generate entity analytics data."""
        by_type = [
            EntityTypeBucket(
                type=entity_type,
                count=random.randint(100, 5000),
                avg_risk_score=random.randint(15, 70)
            )
            for entity_type in self.entity_types
        ]
        
        by_risk_bucket = [
            RiskBucket(bucket="low", count=random.randint(5000, 15000)),
            RiskBucket(bucket="medium", count=random.randint(2000, 8000)),
            RiskBucket(bucket="high", count=random.randint(500, 2000)),
            RiskBucket(bucket="critical", count=random.randint(50, 500))
        ]
        
        total = sum(b.count for b in by_risk_bucket)
        high_risk = by_risk_bucket[2].count + by_risk_bucket[3].count
        
        return EntityAnalyticsResponse(
            total_entities=total,
            new_entities_24h=random.randint(100, 1000),
            high_risk_entities=high_risk,
            sanctioned_entities=random.randint(10, 100),
            by_type=by_type,
            by_risk_bucket=by_risk_bucket
        )
    
    def get_anomaly_analytics(self) -> AnomalyAnalyticsResponse:
        """Generate anomaly analytics data."""
        now = datetime.utcnow()
        
        recent = []
        for i in range(15):
            timestamp = now - timedelta(minutes=random.randint(1, 1440))
            severity = random.choice(["low", "medium", "high", "critical"])
            anomaly_type = random.choice(self.anomaly_types)
            
            descriptions = {
                "wash_trading": "Detected circular trading pattern between related addresses",
                "spoofing": "Large order placement and cancellation detected",
                "cross_chain_bridge": "Unusual cross-chain transfer pattern identified",
                "layering": "Multiple layered orders detected in order book",
                "pump_and_dump": "Coordinated price manipulation pattern detected",
                "front_running": "MEV front-running transaction detected",
                "sandwich_attack": "Sandwich attack on DEX swap detected",
                "flash_loan": "Suspicious flash loan activity detected"
            }
            
            recent.append(FlowAnomaly(
                anomaly_id=self._generate_id("anom_"),
                timestamp=timestamp,
                chain=random.choice(self.chains),
                region=random.choice(self.regions),
                type=anomaly_type,
                severity=severity,
                confidence=random.uniform(0.6, 0.99),
                description=descriptions.get(anomaly_type, "Anomalous activity detected"),
                entities=[self._generate_address() for _ in range(random.randint(2, 5))],
                related_cluster_id=self._generate_id("cluster_") if random.random() > 0.5 else None
            ))
        
        recent.sort(key=lambda x: x.timestamp, reverse=True)
        
        critical_count = sum(1 for a in recent if a.severity == "critical")
        
        return AnomalyAnalyticsResponse(
            total_anomalies_24h=random.randint(50, 200),
            critical_anomalies_24h=critical_count + random.randint(5, 20),
            recent=recent
        )
    
    def get_narrative_analytics(self) -> NarrativeAnalyticsResponse:
        """Generate AI-style narrative analytics."""
        market_regimes = ["RISK_ON", "RISK_OFF", "UNSTABLE", "NEUTRAL"]
        market_regime = random.choice(market_regimes)
        
        summaries = [
            "Market conditions show elevated manipulation pressure across major chains. Whale activity has increased 23% in the past 24 hours with significant outflows from centralized exchanges.",
            "Cross-chain bridge activity has spiked, with several high-risk clusters showing coordinated movement patterns. Recommend increased monitoring of DeFi protocols.",
            "Overall market risk remains moderate. However, emerging patterns suggest potential coordinated activity in the Asia-Pacific region requiring attention.",
            "Anomaly detection systems have flagged multiple wash trading patterns on DEX platforms. Entity classification shows 15% increase in mixer-associated addresses."
        ]
        
        outlooks = [
            "Risk levels expected to remain elevated over the next 24 hours. Key indicators suggest potential for increased volatility in ETH and BTC markets.",
            "Market stabilization anticipated as whale outflows slow. Continue monitoring cross-chain bridges for unusual activity patterns.",
            "Heightened vigilance recommended. Multiple threat actors showing increased coordination across monitored chains.",
            "Moderate risk outlook with potential for rapid escalation. Flash loan activity on Ethereum mainnet warrants close observation."
        ]
        
        highlights = [
            NarrativeHighlight(
                title="Whale Cluster Alert",
                detail="Large coordinated movement detected from top 5 whale clusters",
                severity="warning"
            ),
            NarrativeHighlight(
                title="Cross-Chain Activity",
                detail="Bridge volume up 45% with elevated risk signatures",
                severity="warning"
            ),
            NarrativeHighlight(
                title="DEX Manipulation",
                detail="Wash trading patterns detected on 3 major DEX platforms",
                severity="critical"
            ),
            NarrativeHighlight(
                title="New Entity Classification",
                detail="847 new entities classified in the past 24 hours",
                severity="info"
            ),
            NarrativeHighlight(
                title="Mixer Activity Spike",
                detail="Tornado Cash alternatives showing 200% volume increase",
                severity="critical"
            )
        ]
        
        calls_to_action = [
            "Monitor whale movements on Ethereum and Arbitrum closely",
            "Review cross-chain bridge transactions for the past 6 hours",
            "Investigate flagged mixer-associated addresses",
            "Enable enhanced monitoring for Asia-Pacific region",
            "Review DEX liquidity pool anomalies on BSC"
        ]
        
        selected_highlights = random.sample(highlights, k=random.randint(3, 5))
        
        return NarrativeAnalyticsResponse(
            summary=random.choice(summaries),
            market_regime=market_regime,
            risk_outlook_24h=random.choice(outlooks),
            key_highlights=selected_highlights,
            call_to_action=random.choice(calls_to_action)
        )


_analytics_engine = DemoAnalyticsEngine(seed=42)


def get_market_analytics() -> MarketAnalyticsResponse:
    """Get market analytics data."""
    return _analytics_engine.get_market_analytics()


def get_whale_analytics() -> WhaleAnalyticsResponse:
    """Get whale analytics data."""
    return _analytics_engine.get_whale_analytics()


def get_entity_analytics() -> EntityAnalyticsResponse:
    """Get entity analytics data."""
    return _analytics_engine.get_entity_analytics()


def get_anomaly_analytics() -> AnomalyAnalyticsResponse:
    """Get anomaly analytics data."""
    return _analytics_engine.get_anomaly_analytics()


def get_narrative_analytics() -> NarrativeAnalyticsResponse:
    """Get narrative analytics data."""
    return _analytics_engine.get_narrative_analytics()

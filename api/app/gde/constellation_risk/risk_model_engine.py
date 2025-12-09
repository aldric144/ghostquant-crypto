"""
AI Constellation Risk Model Engine - Phase 10

Derives node-level, cluster-level, and system-wide risk scores in real-time.
Emits risk updates through the WebSocket streaming engine.
"""

import asyncio
import math
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
from collections import defaultdict
from fastapi import APIRouter

logger = logging.getLogger(__name__)


class RiskCategory(str, Enum):
    """Risk categories for classification."""
    CRITICAL = "critical"
    HIGH = "high"
    ELEVATED = "elevated"
    MODERATE = "moderate"
    LOW = "low"
    MINIMAL = "minimal"


class RiskFactor(str, Enum):
    """Factors that contribute to risk scoring."""
    HYDRA_COORDINATION = "hydra_coordination"
    WHALE_ACTIVITY = "whale_activity"
    TRANSFER_VELOCITY = "transfer_velocity"
    CLUSTER_DENSITY = "cluster_density"
    ENTITY_REPUTATION = "entity_reputation"
    TEMPORAL_ANOMALY = "temporal_anomaly"
    NETWORK_CENTRALITY = "network_centrality"
    VOLATILITY_EXPOSURE = "volatility_exposure"
    MIXER_ASSOCIATION = "mixer_association"
    EXPLOIT_PROXIMITY = "exploit_proximity"


@dataclass
class NodeRiskProfile:
    """Risk profile for a single node."""
    node_id: str
    base_risk_score: float = 0.0
    adjusted_risk_score: float = 0.0
    risk_category: RiskCategory = RiskCategory.MINIMAL
    risk_factors: Dict[str, float] = field(default_factory=dict)
    risk_trend: str = "stable"  # increasing, decreasing, stable
    confidence: float = 0.5
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "base_risk_score": self.base_risk_score,
            "adjusted_risk_score": self.adjusted_risk_score,
            "risk_category": self.risk_category.value,
            "risk_factors": self.risk_factors,
            "risk_trend": self.risk_trend,
            "confidence": self.confidence,
            "last_updated": self.last_updated,
            "metadata": self.metadata,
        }


@dataclass
class ClusterRiskProfile:
    """Risk profile for a cluster of nodes."""
    cluster_id: str
    aggregate_risk_score: float = 0.0
    weighted_risk_score: float = 0.0
    risk_category: RiskCategory = RiskCategory.MINIMAL
    node_count: int = 0
    high_risk_node_count: int = 0
    risk_distribution: Dict[str, int] = field(default_factory=dict)
    dominant_risk_factors: List[str] = field(default_factory=list)
    cohesion_score: float = 0.0
    threat_potential: float = 0.0
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "cluster_id": self.cluster_id,
            "aggregate_risk_score": self.aggregate_risk_score,
            "weighted_risk_score": self.weighted_risk_score,
            "risk_category": self.risk_category.value,
            "node_count": self.node_count,
            "high_risk_node_count": self.high_risk_node_count,
            "risk_distribution": self.risk_distribution,
            "dominant_risk_factors": self.dominant_risk_factors,
            "cohesion_score": self.cohesion_score,
            "threat_potential": self.threat_potential,
            "last_updated": self.last_updated,
        }


@dataclass
class SystemicRiskProfile:
    """System-wide risk assessment."""
    global_risk_score: float = 0.0
    risk_category: RiskCategory = RiskCategory.MINIMAL
    total_nodes: int = 0
    total_clusters: int = 0
    high_risk_nodes: int = 0
    critical_clusters: int = 0
    risk_concentration: float = 0.0
    systemic_threat_level: float = 0.0
    risk_velocity: float = 0.0  # Rate of risk change
    risk_momentum: float = 0.0  # Acceleration of risk change
    top_risk_factors: List[Tuple[str, float]] = field(default_factory=list)
    risk_forecast: Dict[str, float] = field(default_factory=dict)
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "global_risk_score": self.global_risk_score,
            "risk_category": self.risk_category.value,
            "total_nodes": self.total_nodes,
            "total_clusters": self.total_clusters,
            "high_risk_nodes": self.high_risk_nodes,
            "critical_clusters": self.critical_clusters,
            "risk_concentration": self.risk_concentration,
            "systemic_threat_level": self.systemic_threat_level,
            "risk_velocity": self.risk_velocity,
            "risk_momentum": self.risk_momentum,
            "top_risk_factors": self.top_risk_factors,
            "risk_forecast": self.risk_forecast,
            "last_updated": self.last_updated,
        }


class ConstellationRiskModelEngine:
    """
    AI-powered risk model engine for the Constellation.
    
    Computes:
    - Node-level risk scores based on multiple factors
    - Cluster-level aggregate risk
    - System-wide systemic risk assessment
    - Risk trends and forecasts
    """
    
    # Risk factor weights (can be tuned)
    RISK_WEIGHTS = {
        RiskFactor.HYDRA_COORDINATION: 0.20,
        RiskFactor.WHALE_ACTIVITY: 0.15,
        RiskFactor.TRANSFER_VELOCITY: 0.12,
        RiskFactor.CLUSTER_DENSITY: 0.10,
        RiskFactor.ENTITY_REPUTATION: 0.10,
        RiskFactor.TEMPORAL_ANOMALY: 0.08,
        RiskFactor.NETWORK_CENTRALITY: 0.08,
        RiskFactor.VOLATILITY_EXPOSURE: 0.07,
        RiskFactor.MIXER_ASSOCIATION: 0.05,
        RiskFactor.EXPLOIT_PROXIMITY: 0.05,
    }
    
    # Risk category thresholds
    RISK_THRESHOLDS = {
        RiskCategory.CRITICAL: 0.85,
        RiskCategory.HIGH: 0.70,
        RiskCategory.ELEVATED: 0.50,
        RiskCategory.MODERATE: 0.30,
        RiskCategory.LOW: 0.15,
        RiskCategory.MINIMAL: 0.0,
    }
    
    def __init__(self):
        self.node_risks: Dict[str, NodeRiskProfile] = {}
        self.cluster_risks: Dict[str, ClusterRiskProfile] = {}
        self.systemic_risk = SystemicRiskProfile()
        self.risk_history: List[Dict[str, Any]] = []
        self._stream_server = None
        
    def _categorize_risk(self, score: float) -> RiskCategory:
        """Categorize a risk score into a risk category."""
        for category, threshold in sorted(
            self.RISK_THRESHOLDS.items(),
            key=lambda x: x[1],
            reverse=True
        ):
            if score >= threshold:
                return category
        return RiskCategory.MINIMAL
    
    def _compute_risk_trend(self, node_id: str, new_score: float) -> str:
        """Compute the risk trend for a node."""
        if node_id not in self.node_risks:
            return "stable"
        
        old_score = self.node_risks[node_id].adjusted_risk_score
        diff = new_score - old_score
        
        if diff > 0.05:
            return "increasing"
        elif diff < -0.05:
            return "decreasing"
        return "stable"
    
    def compute_node_risk(
        self,
        node_id: str,
        node_data: Dict[str, Any],
        edges: List[Dict[str, Any]] = None,
        cluster_data: Dict[str, Any] = None,
    ) -> NodeRiskProfile:
        """
        Compute risk score for a single node using multiple factors.
        
        Args:
            node_id: Unique identifier for the node
            node_data: Node attributes and metadata
            edges: Edges connected to this node
            cluster_data: Cluster information if node belongs to a cluster
        
        Returns:
            NodeRiskProfile with computed risk scores
        """
        edges = edges or []
        cluster_data = cluster_data or {}
        
        risk_factors = {}
        
        # Factor 1: Hydra Coordination
        hydra_score = node_data.get("hydra_score", 0.0)
        is_hydra_head = node_data.get("is_hydra_head", False)
        coordination_strength = node_data.get("coordination_strength", 0.0)
        risk_factors[RiskFactor.HYDRA_COORDINATION.value] = min(1.0, (
            hydra_score * 0.4 +
            (0.5 if is_hydra_head else 0.0) +
            coordination_strength * 0.3
        ))
        
        # Factor 2: Whale Activity
        is_whale = node_data.get("is_whale", False) or node_data.get("category") == "whale"
        whale_volume = node_data.get("total_volume_usd", 0.0)
        influence_score = node_data.get("influence_score", 0.0)
        whale_risk = 0.0
        if is_whale:
            # Large whales with high influence are higher risk
            volume_factor = min(1.0, whale_volume / 100_000_000)  # Normalize to $100M
            whale_risk = 0.3 + influence_score * 0.4 + volume_factor * 0.3
        risk_factors[RiskFactor.WHALE_ACTIVITY.value] = whale_risk
        
        # Factor 3: Transfer Velocity
        transfer_count = node_data.get("transfer_count", 0)
        time_window = node_data.get("time_window_hours", 24)
        velocity = transfer_count / max(1, time_window)
        risk_factors[RiskFactor.TRANSFER_VELOCITY.value] = min(1.0, velocity / 100)  # Normalize
        
        # Factor 4: Cluster Density
        cluster_size = cluster_data.get("node_count", 1)
        cluster_risk = cluster_data.get("risk_score", 0.0)
        density_risk = min(1.0, (cluster_size / 50) * 0.5 + cluster_risk * 0.5)
        risk_factors[RiskFactor.CLUSTER_DENSITY.value] = density_risk
        
        # Factor 5: Entity Reputation
        tags = node_data.get("tags", [])
        reputation_score = 0.0
        high_risk_tags = ["mixer", "darknet", "exploit", "scam", "hack", "sanctioned"]
        low_risk_tags = ["exchange", "institutional", "verified", "kyc"]
        for tag in tags:
            tag_lower = tag.lower()
            if any(hr in tag_lower for hr in high_risk_tags):
                reputation_score += 0.3
            elif any(lr in tag_lower for lr in low_risk_tags):
                reputation_score -= 0.1
        risk_factors[RiskFactor.ENTITY_REPUTATION.value] = max(0.0, min(1.0, 0.5 + reputation_score))
        
        # Factor 6: Temporal Anomaly
        temporal_anomaly = node_data.get("temporal_anomaly_score", 0.0)
        unusual_timing = node_data.get("unusual_timing", False)
        risk_factors[RiskFactor.TEMPORAL_ANOMALY.value] = min(1.0, temporal_anomaly + (0.3 if unusual_timing else 0.0))
        
        # Factor 7: Network Centrality
        edge_count = len(edges)
        centrality = node_data.get("centrality_score", edge_count / 100)
        risk_factors[RiskFactor.NETWORK_CENTRALITY.value] = min(1.0, centrality)
        
        # Factor 8: Volatility Exposure
        volatility = node_data.get("volatility_score", 0.0)
        risk_factors[RiskFactor.VOLATILITY_EXPOSURE.value] = volatility
        
        # Factor 9: Mixer Association
        mixer_hops = node_data.get("mixer_hops", -1)
        if mixer_hops >= 0:
            mixer_risk = max(0.0, 1.0 - (mixer_hops * 0.2))  # Closer = higher risk
        else:
            mixer_risk = 0.0
        risk_factors[RiskFactor.MIXER_ASSOCIATION.value] = mixer_risk
        
        # Factor 10: Exploit Proximity
        exploit_distance = node_data.get("exploit_distance", -1)
        if exploit_distance >= 0:
            exploit_risk = max(0.0, 1.0 - (exploit_distance * 0.15))
        else:
            exploit_risk = 0.0
        risk_factors[RiskFactor.EXPLOIT_PROXIMITY.value] = exploit_risk
        
        # Compute weighted risk score
        base_risk = sum(
            risk_factors.get(factor.value, 0.0) * weight
            for factor, weight in self.RISK_WEIGHTS.items()
        )
        
        # Apply adjustments based on node type
        category = node_data.get("category", "unknown")
        type_multipliers = {
            "hydra_head": 1.3,
            "whale": 1.1,
            "mixer": 1.4,
            "exploit": 1.5,
            "exchange": 0.8,
            "contract": 1.0,
            "wallet": 1.0,
        }
        multiplier = type_multipliers.get(category, 1.0)
        adjusted_risk = min(1.0, base_risk * multiplier)
        
        # Compute confidence based on data completeness
        data_fields = ["hydra_score", "tags", "transfer_count", "centrality_score"]
        available_fields = sum(1 for f in data_fields if f in node_data)
        confidence = 0.3 + (available_fields / len(data_fields)) * 0.7
        
        # Determine risk trend
        risk_trend = self._compute_risk_trend(node_id, adjusted_risk)
        
        # Create risk profile
        profile = NodeRiskProfile(
            node_id=node_id,
            base_risk_score=base_risk,
            adjusted_risk_score=adjusted_risk,
            risk_category=self._categorize_risk(adjusted_risk),
            risk_factors=risk_factors,
            risk_trend=risk_trend,
            confidence=confidence,
            metadata={
                "category": category,
                "edge_count": edge_count,
                "cluster_id": cluster_data.get("cluster_id"),
            },
        )
        
        # Store profile
        self.node_risks[node_id] = profile
        
        return profile
    
    def compute_cluster_risk(
        self,
        cluster_id: str,
        node_ids: List[str],
        cluster_metadata: Dict[str, Any] = None,
    ) -> ClusterRiskProfile:
        """
        Compute aggregate risk for a cluster of nodes.
        
        Args:
            cluster_id: Unique identifier for the cluster
            node_ids: List of node IDs in the cluster
            cluster_metadata: Additional cluster attributes
        
        Returns:
            ClusterRiskProfile with computed risk scores
        """
        cluster_metadata = cluster_metadata or {}
        
        # Get risk profiles for all nodes in cluster
        node_profiles = [
            self.node_risks.get(nid)
            for nid in node_ids
            if nid in self.node_risks
        ]
        
        if not node_profiles:
            return ClusterRiskProfile(cluster_id=cluster_id)
        
        # Compute aggregate risk
        risk_scores = [p.adjusted_risk_score for p in node_profiles]
        aggregate_risk = sum(risk_scores) / len(risk_scores)
        
        # Compute weighted risk (higher weight for high-risk nodes)
        weights = [1.0 + p.adjusted_risk_score for p in node_profiles]
        weighted_risk = sum(
            p.adjusted_risk_score * w
            for p, w in zip(node_profiles, weights)
        ) / sum(weights)
        
        # Count high-risk nodes
        high_risk_count = sum(
            1 for p in node_profiles
            if p.risk_category in [RiskCategory.HIGH, RiskCategory.CRITICAL]
        )
        
        # Risk distribution
        distribution = defaultdict(int)
        for p in node_profiles:
            distribution[p.risk_category.value] += 1
        
        # Dominant risk factors
        factor_totals = defaultdict(float)
        for p in node_profiles:
            for factor, score in p.risk_factors.items():
                factor_totals[factor] += score
        
        dominant_factors = sorted(
            factor_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        # Cohesion score (how tightly connected the cluster is)
        cohesion = cluster_metadata.get("cohesion_score", 0.5)
        
        # Threat potential (combination of size, risk, and cohesion)
        threat_potential = min(1.0, (
            weighted_risk * 0.4 +
            (len(node_ids) / 100) * 0.3 +
            cohesion * 0.3
        ))
        
        profile = ClusterRiskProfile(
            cluster_id=cluster_id,
            aggregate_risk_score=aggregate_risk,
            weighted_risk_score=weighted_risk,
            risk_category=self._categorize_risk(weighted_risk),
            node_count=len(node_ids),
            high_risk_node_count=high_risk_count,
            risk_distribution=dict(distribution),
            dominant_risk_factors=[f[0] for f in dominant_factors],
            cohesion_score=cohesion,
            threat_potential=threat_potential,
        )
        
        self.cluster_risks[cluster_id] = profile
        
        return profile
    
    def compute_systemic_risk(self) -> SystemicRiskProfile:
        """
        Compute system-wide risk assessment.
        
        Returns:
            SystemicRiskProfile with global risk metrics
        """
        # Get all node and cluster profiles
        node_profiles = list(self.node_risks.values())
        cluster_profiles = list(self.cluster_risks.values())
        
        if not node_profiles:
            self.systemic_risk = SystemicRiskProfile()
            return self.systemic_risk
        
        # Global risk score (weighted average with emphasis on high-risk nodes)
        total_weight = 0.0
        weighted_sum = 0.0
        for p in node_profiles:
            weight = 1.0 + p.adjusted_risk_score * 2  # Higher weight for risky nodes
            weighted_sum += p.adjusted_risk_score * weight
            total_weight += weight
        
        global_risk = weighted_sum / total_weight if total_weight > 0 else 0.0
        
        # Count high-risk entities
        high_risk_nodes = sum(
            1 for p in node_profiles
            if p.risk_category in [RiskCategory.HIGH, RiskCategory.CRITICAL]
        )
        
        critical_clusters = sum(
            1 for c in cluster_profiles
            if c.risk_category in [RiskCategory.HIGH, RiskCategory.CRITICAL]
        )
        
        # Risk concentration (Gini-like coefficient)
        if len(node_profiles) > 1:
            sorted_risks = sorted(p.adjusted_risk_score for p in node_profiles)
            n = len(sorted_risks)
            cumsum = sum((i + 1) * r for i, r in enumerate(sorted_risks))
            concentration = (2 * cumsum) / (n * sum(sorted_risks)) - (n + 1) / n if sum(sorted_risks) > 0 else 0
            concentration = max(0.0, min(1.0, concentration))
        else:
            concentration = 0.0
        
        # Systemic threat level
        systemic_threat = min(1.0, (
            global_risk * 0.3 +
            (high_risk_nodes / max(1, len(node_profiles))) * 0.3 +
            (critical_clusters / max(1, len(cluster_profiles))) * 0.2 if cluster_profiles else 0 +
            concentration * 0.2
        ))
        
        # Risk velocity and momentum (from history)
        risk_velocity = 0.0
        risk_momentum = 0.0
        if len(self.risk_history) >= 2:
            recent = self.risk_history[-1].get("global_risk", 0)
            previous = self.risk_history[-2].get("global_risk", 0)
            risk_velocity = recent - previous
            
            if len(self.risk_history) >= 3:
                older = self.risk_history[-3].get("global_risk", 0)
                prev_velocity = previous - older
                risk_momentum = risk_velocity - prev_velocity
        
        # Top risk factors across all nodes
        factor_totals = defaultdict(float)
        for p in node_profiles:
            for factor, score in p.risk_factors.items():
                factor_totals[factor] += score
        
        top_factors = sorted(
            factor_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Simple risk forecast (linear extrapolation)
        forecast = {
            "1h": min(1.0, max(0.0, global_risk + risk_velocity)),
            "6h": min(1.0, max(0.0, global_risk + risk_velocity * 6 + risk_momentum * 3)),
            "24h": min(1.0, max(0.0, global_risk + risk_velocity * 24 + risk_momentum * 12)),
        }
        
        self.systemic_risk = SystemicRiskProfile(
            global_risk_score=global_risk,
            risk_category=self._categorize_risk(global_risk),
            total_nodes=len(node_profiles),
            total_clusters=len(cluster_profiles),
            high_risk_nodes=high_risk_nodes,
            critical_clusters=critical_clusters,
            risk_concentration=concentration,
            systemic_threat_level=systemic_threat,
            risk_velocity=risk_velocity,
            risk_momentum=risk_momentum,
            top_risk_factors=top_factors,
            risk_forecast=forecast,
        )
        
        # Record in history
        self.risk_history.append({
            "global_risk": global_risk,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # Keep only last 100 history entries
        if len(self.risk_history) > 100:
            self.risk_history = self.risk_history[-100:]
        
        return self.systemic_risk
    
    async def emit_risk_update(self) -> None:
        """Emit risk updates through the WebSocket streaming engine."""
        try:
            from app.gde.constellation_fusion_stream.stream_server import (
                constellation_stream_server,
                StreamEventType,
            )
            
            await constellation_stream_server.emit_stream_event(
                event_type=StreamEventType.RISK_UPDATE,
                payload={
                    "systemic_risk": self.systemic_risk.to_dict(),
                    "high_risk_nodes": [
                        p.to_dict() for p in self.node_risks.values()
                        if p.risk_category in [RiskCategory.HIGH, RiskCategory.CRITICAL]
                    ][:10],  # Top 10 high-risk nodes
                    "cluster_risks": [
                        c.to_dict() for c in self.cluster_risks.values()
                    ],
                },
                source_engine="risk_model",
            )
        except ImportError:
            logger.warning("Stream server not available for risk updates")
        except Exception as e:
            logger.error(f"Failed to emit risk update: {e}")
    
    def get_node_risk(self, node_id: str) -> Optional[NodeRiskProfile]:
        """Get risk profile for a specific node."""
        return self.node_risks.get(node_id)
    
    def get_cluster_risk(self, cluster_id: str) -> Optional[ClusterRiskProfile]:
        """Get risk profile for a specific cluster."""
        return self.cluster_risks.get(cluster_id)
    
    def get_all_risks(self) -> Dict[str, Any]:
        """Get all risk data."""
        return {
            "systemic_risk": self.systemic_risk.to_dict(),
            "node_risks": {
                nid: p.to_dict() for nid, p in self.node_risks.items()
            },
            "cluster_risks": {
                cid: c.to_dict() for cid, c in self.cluster_risks.items()
            },
            "risk_history": self.risk_history[-20:],  # Last 20 entries
        }


# Global risk model engine instance
risk_model_engine = ConstellationRiskModelEngine()


# FastAPI Router
router = APIRouter(
    prefix="/gde/constellation",
    tags=["Constellation Risk"],
)


@router.get("/risk")
async def get_constellation_risk():
    """
    Get comprehensive risk assessment for the constellation.
    
    Returns:
        - Systemic risk profile
        - High-risk nodes
        - Cluster risk profiles
        - Risk trends and forecasts
    """
    # Recompute systemic risk
    risk_model_engine.compute_systemic_risk()
    
    return {
        "success": True,
        "risk": risk_model_engine.get_all_risks(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/risk/node/{node_id}")
async def get_node_risk(node_id: str):
    """Get risk profile for a specific node."""
    profile = risk_model_engine.get_node_risk(node_id)
    
    if profile:
        return {
            "success": True,
            "risk": profile.to_dict(),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    return {
        "success": False,
        "error": f"Node '{node_id}' not found",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/risk/cluster/{cluster_id}")
async def get_cluster_risk(cluster_id: str):
    """Get risk profile for a specific cluster."""
    profile = risk_model_engine.get_cluster_risk(cluster_id)
    
    if profile:
        return {
            "success": True,
            "risk": profile.to_dict(),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    return {
        "success": False,
        "error": f"Cluster '{cluster_id}' not found",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/risk/systemic")
async def get_systemic_risk():
    """Get system-wide risk assessment."""
    risk_model_engine.compute_systemic_risk()
    
    return {
        "success": True,
        "systemic_risk": risk_model_engine.systemic_risk.to_dict(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/risk/compute")
async def compute_risk(node_data: Dict[str, Any]):
    """
    Compute risk for a node with provided data.
    
    Request body:
        - node_id: str
        - node_data: dict with node attributes
        - edges: optional list of edges
        - cluster_data: optional cluster information
    """
    node_id = node_data.get("node_id")
    if not node_id:
        return {
            "success": False,
            "error": "node_id is required",
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    profile = risk_model_engine.compute_node_risk(
        node_id=node_id,
        node_data=node_data.get("node_data", {}),
        edges=node_data.get("edges", []),
        cluster_data=node_data.get("cluster_data", {}),
    )
    
    # Emit risk update
    await risk_model_engine.emit_risk_update()
    
    return {
        "success": True,
        "risk": profile.to_dict(),
        "timestamp": datetime.utcnow().isoformat(),
    }

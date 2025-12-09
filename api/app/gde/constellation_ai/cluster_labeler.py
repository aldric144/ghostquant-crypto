"""
Cluster Labeling + Entity Classification Engine - Phase 10

Performs unsupervised clustering label inference and entity type prediction.
Pushes label updates to the WebSocket streaming engine.
"""

import asyncio
import hashlib
import logging
import math
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict
from fastapi import APIRouter

logger = logging.getLogger(__name__)


class EntityType(str, Enum):
    """Predicted entity types for nodes."""
    WHALE = "whale"
    CEX_WALLET = "cex_wallet"
    DEX_WALLET = "dex_wallet"
    MEV_BOT = "mev_bot"
    DARKNET_MIXER = "darknet_mixer"
    TORNADO_MIXER = "tornado_mixer"
    EXPLOIT_VECTOR = "exploit_vector"
    SMART_CONTRACT = "smart_contract"
    RISK_AGENT = "risk_agent"
    INSTITUTIONAL = "institutional"
    RETAIL_WALLET = "retail_wallet"
    BRIDGE_CONTRACT = "bridge_contract"
    LIQUIDITY_POOL = "liquidity_pool"
    NFT_MARKETPLACE = "nft_marketplace"
    GOVERNANCE_CONTRACT = "governance_contract"
    UNKNOWN = "unknown"


class ClusterLabel(str, Enum):
    """Inferred cluster labels."""
    COORDINATED_TRADING = "coordinated_trading"
    WASH_TRADING_RING = "wash_trading_ring"
    WHALE_POD = "whale_pod"
    MEV_NETWORK = "mev_network"
    MIXER_CLUSTER = "mixer_cluster"
    EXPLOIT_NETWORK = "exploit_network"
    INSTITUTIONAL_GROUP = "institutional_group"
    EXCHANGE_ECOSYSTEM = "exchange_ecosystem"
    DEFI_PROTOCOL = "defi_protocol"
    NFT_COMMUNITY = "nft_community"
    AIRDROP_FARMERS = "airdrop_farmers"
    SYBIL_CLUSTER = "sybil_cluster"
    LEGITIMATE_ACTIVITY = "legitimate_activity"
    UNKNOWN = "unknown"


@dataclass
class EntityClassification:
    """Classification result for an entity/node."""
    node_id: str
    predicted_type: EntityType
    confidence: float
    alternative_types: List[Tuple[EntityType, float]] = field(default_factory=list)
    features_used: List[str] = field(default_factory=list)
    behavioral_signals: Dict[str, float] = field(default_factory=dict)
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "predicted_type": self.predicted_type.value,
            "confidence": self.confidence,
            "alternative_types": [
                {"type": t.value, "confidence": c}
                for t, c in self.alternative_types
            ],
            "features_used": self.features_used,
            "behavioral_signals": self.behavioral_signals,
            "last_updated": self.last_updated,
        }


@dataclass
class ClusterClassification:
    """Classification result for a cluster."""
    cluster_id: str
    predicted_label: ClusterLabel
    confidence: float
    alternative_labels: List[Tuple[ClusterLabel, float]] = field(default_factory=list)
    entity_composition: Dict[str, int] = field(default_factory=dict)
    behavioral_patterns: List[str] = field(default_factory=list)
    threat_indicators: List[str] = field(default_factory=list)
    cohesion_score: float = 0.0
    activity_pattern: str = "unknown"
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "cluster_id": self.cluster_id,
            "predicted_label": self.predicted_label.value,
            "confidence": self.confidence,
            "alternative_labels": [
                {"label": l.value, "confidence": c}
                for l, c in self.alternative_labels
            ],
            "entity_composition": self.entity_composition,
            "behavioral_patterns": self.behavioral_patterns,
            "threat_indicators": self.threat_indicators,
            "cohesion_score": self.cohesion_score,
            "activity_pattern": self.activity_pattern,
            "last_updated": self.last_updated,
        }


class ConstellationClusterLabeler:
    """
    AI-powered cluster labeling and entity classification engine.
    
    Uses behavioral analysis and pattern matching to:
    - Classify individual entities (whale, CEX, MEV bot, mixer, etc.)
    - Label clusters based on collective behavior
    - Detect threat patterns and suspicious activity
    """
    
    # Entity type detection patterns
    ENTITY_PATTERNS = {
        EntityType.WHALE: {
            "min_volume_usd": 1_000_000,
            "tags": ["whale", "large_holder", "institutional"],
            "behavior": ["large_transfers", "market_moving"],
        },
        EntityType.CEX_WALLET: {
            "tags": ["binance", "coinbase", "kraken", "ftx", "exchange", "cex"],
            "behavior": ["high_frequency", "many_counterparties"],
            "address_patterns": ["hot_wallet", "cold_wallet"],
        },
        EntityType.DEX_WALLET: {
            "tags": ["uniswap", "sushiswap", "curve", "dex", "amm"],
            "behavior": ["swap_activity", "liquidity_provision"],
        },
        EntityType.MEV_BOT: {
            "tags": ["mev", "flashbot", "arbitrage", "sandwich"],
            "behavior": ["frontrunning", "backrunning", "atomic_arb"],
            "timing": "sub_block",
        },
        EntityType.DARKNET_MIXER: {
            "tags": ["mixer", "tumbler", "darknet", "privacy"],
            "behavior": ["mixing", "obfuscation", "chain_hopping"],
        },
        EntityType.TORNADO_MIXER: {
            "tags": ["tornado", "tornado_cash", "sanctioned"],
            "behavior": ["fixed_denominations", "privacy_pool"],
        },
        EntityType.EXPLOIT_VECTOR: {
            "tags": ["exploit", "hack", "vulnerability", "attack"],
            "behavior": ["flash_loan", "reentrancy", "oracle_manipulation"],
        },
        EntityType.SMART_CONTRACT: {
            "tags": ["contract", "protocol", "defi"],
            "behavior": ["programmatic", "automated"],
        },
        EntityType.INSTITUTIONAL: {
            "tags": ["institutional", "fund", "treasury", "dao"],
            "behavior": ["large_positions", "long_term_holding"],
        },
    }
    
    # Cluster label detection patterns
    CLUSTER_PATTERNS = {
        ClusterLabel.COORDINATED_TRADING: {
            "min_nodes": 3,
            "behavior": ["synchronized_trades", "price_coordination"],
            "timing_correlation": 0.7,
        },
        ClusterLabel.WASH_TRADING_RING: {
            "min_nodes": 2,
            "behavior": ["circular_transfers", "self_trading"],
            "volume_inflation": True,
        },
        ClusterLabel.WHALE_POD: {
            "min_whales": 2,
            "behavior": ["coordinated_accumulation", "market_moving"],
        },
        ClusterLabel.MEV_NETWORK: {
            "min_mev_bots": 2,
            "behavior": ["shared_profits", "coordinated_extraction"],
        },
        ClusterLabel.MIXER_CLUSTER: {
            "has_mixer": True,
            "behavior": ["obfuscation_chain", "layered_mixing"],
        },
        ClusterLabel.EXPLOIT_NETWORK: {
            "has_exploit": True,
            "behavior": ["fund_extraction", "laundering_chain"],
        },
        ClusterLabel.SYBIL_CLUSTER: {
            "min_nodes": 5,
            "behavior": ["identical_patterns", "airdrop_farming"],
            "creation_timing": "clustered",
        },
    }
    
    def __init__(self):
        self.entity_classifications: Dict[str, EntityClassification] = {}
        self.cluster_classifications: Dict[str, ClusterClassification] = {}
        self._known_addresses: Dict[str, EntityType] = {}
        
    def _extract_features(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract features from node data for classification."""
        features = {
            "volume_usd": node_data.get("total_volume_usd", 0),
            "transfer_count": node_data.get("transfer_count", 0),
            "unique_counterparties": node_data.get("unique_counterparties", 0),
            "avg_transfer_size": node_data.get("avg_transfer_size", 0),
            "tags": set(t.lower() for t in node_data.get("tags", [])),
            "category": node_data.get("category", "unknown"),
            "is_contract": node_data.get("is_contract", False),
            "creation_time": node_data.get("creation_time"),
            "last_activity": node_data.get("last_activity"),
            "edge_count": node_data.get("edge_count", 0),
            "cluster_id": node_data.get("cluster_id"),
        }
        
        # Behavioral signals
        features["behavioral_signals"] = {
            "high_frequency": features["transfer_count"] > 1000,
            "large_volume": features["volume_usd"] > 1_000_000,
            "many_counterparties": features["unique_counterparties"] > 100,
            "contract_interaction": features["is_contract"],
        }
        
        return features
    
    def _compute_entity_scores(
        self,
        features: Dict[str, Any],
    ) -> Dict[EntityType, float]:
        """Compute classification scores for each entity type."""
        scores = {et: 0.0 for et in EntityType}
        
        tags = features.get("tags", set())
        volume = features.get("volume_usd", 0)
        signals = features.get("behavioral_signals", {})
        category = features.get("category", "")
        
        # Score each entity type
        for entity_type, patterns in self.ENTITY_PATTERNS.items():
            score = 0.0
            matches = 0
            total_checks = 0
            
            # Check tags
            pattern_tags = set(t.lower() for t in patterns.get("tags", []))
            if pattern_tags:
                total_checks += 1
                tag_overlap = len(tags & pattern_tags)
                if tag_overlap > 0:
                    score += 0.4 * (tag_overlap / len(pattern_tags))
                    matches += 1
            
            # Check volume threshold
            if "min_volume_usd" in patterns:
                total_checks += 1
                if volume >= patterns["min_volume_usd"]:
                    score += 0.3
                    matches += 1
            
            # Check behavioral patterns
            pattern_behaviors = patterns.get("behavior", [])
            if pattern_behaviors:
                total_checks += 1
                behavior_match = any(
                    b in str(signals).lower() or b in category.lower()
                    for b in pattern_behaviors
                )
                if behavior_match:
                    score += 0.3
                    matches += 1
            
            # Normalize score
            if total_checks > 0:
                scores[entity_type] = min(1.0, score * (matches / total_checks + 0.5))
        
        # Default to UNKNOWN if no strong matches
        if max(scores.values()) < 0.2:
            scores[EntityType.UNKNOWN] = 0.5
        
        return scores
    
    def classify_entity(
        self,
        node_id: str,
        node_data: Dict[str, Any],
    ) -> EntityClassification:
        """
        Classify an entity/node into a predicted type.
        
        Args:
            node_id: Unique identifier for the node
            node_data: Node attributes and metadata
        
        Returns:
            EntityClassification with predicted type and confidence
        """
        # Extract features
        features = self._extract_features(node_data)
        
        # Compute scores for each entity type
        scores = self._compute_entity_scores(features)
        
        # Sort by score
        sorted_scores = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get top prediction
        predicted_type, confidence = sorted_scores[0]
        
        # Get alternatives (top 3 excluding primary)
        alternatives = [
            (et, score) for et, score in sorted_scores[1:4]
            if score > 0.1
        ]
        
        # Create classification
        classification = EntityClassification(
            node_id=node_id,
            predicted_type=predicted_type,
            confidence=confidence,
            alternative_types=alternatives,
            features_used=list(features.keys()),
            behavioral_signals=features.get("behavioral_signals", {}),
        )
        
        # Store classification
        self.entity_classifications[node_id] = classification
        
        return classification
    
    def _compute_cluster_scores(
        self,
        node_ids: List[str],
        entity_compositions: Dict[str, int],
        cluster_metadata: Dict[str, Any],
    ) -> Dict[ClusterLabel, float]:
        """Compute classification scores for each cluster label."""
        scores = {cl: 0.0 for cl in ClusterLabel}
        
        node_count = len(node_ids)
        
        # Score each cluster label
        for label, patterns in self.CLUSTER_PATTERNS.items():
            score = 0.0
            
            # Check minimum nodes
            min_nodes = patterns.get("min_nodes", 0)
            if node_count >= min_nodes:
                score += 0.2
            
            # Check for specific entity types
            if "min_whales" in patterns:
                whale_count = entity_compositions.get(EntityType.WHALE.value, 0)
                if whale_count >= patterns["min_whales"]:
                    score += 0.4
            
            if "min_mev_bots" in patterns:
                mev_count = entity_compositions.get(EntityType.MEV_BOT.value, 0)
                if mev_count >= patterns["min_mev_bots"]:
                    score += 0.4
            
            if patterns.get("has_mixer"):
                mixer_count = (
                    entity_compositions.get(EntityType.DARKNET_MIXER.value, 0) +
                    entity_compositions.get(EntityType.TORNADO_MIXER.value, 0)
                )
                if mixer_count > 0:
                    score += 0.5
            
            if patterns.get("has_exploit"):
                exploit_count = entity_compositions.get(EntityType.EXPLOIT_VECTOR.value, 0)
                if exploit_count > 0:
                    score += 0.5
            
            # Check timing correlation
            if "timing_correlation" in patterns:
                correlation = cluster_metadata.get("timing_correlation", 0)
                if correlation >= patterns["timing_correlation"]:
                    score += 0.3
            
            scores[label] = min(1.0, score)
        
        # Default to UNKNOWN if no strong matches
        if max(scores.values()) < 0.2:
            scores[ClusterLabel.UNKNOWN] = 0.5
        
        return scores
    
    def classify_cluster(
        self,
        cluster_id: str,
        node_ids: List[str],
        cluster_metadata: Dict[str, Any] = None,
    ) -> ClusterClassification:
        """
        Classify a cluster and infer its label.
        
        Args:
            cluster_id: Unique identifier for the cluster
            node_ids: List of node IDs in the cluster
            cluster_metadata: Additional cluster attributes
        
        Returns:
            ClusterClassification with predicted label and confidence
        """
        cluster_metadata = cluster_metadata or {}
        
        # Get entity compositions
        entity_compositions = defaultdict(int)
        for node_id in node_ids:
            if node_id in self.entity_classifications:
                entity_type = self.entity_classifications[node_id].predicted_type
                entity_compositions[entity_type.value] += 1
            else:
                entity_compositions[EntityType.UNKNOWN.value] += 1
        
        # Compute scores for each cluster label
        scores = self._compute_cluster_scores(
            node_ids,
            dict(entity_compositions),
            cluster_metadata,
        )
        
        # Sort by score
        sorted_scores = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get top prediction
        predicted_label, confidence = sorted_scores[0]
        
        # Get alternatives
        alternatives = [
            (label, score) for label, score in sorted_scores[1:4]
            if score > 0.1
        ]
        
        # Detect behavioral patterns
        behavioral_patterns = []
        if entity_compositions.get(EntityType.WHALE.value, 0) > 1:
            behavioral_patterns.append("whale_coordination")
        if entity_compositions.get(EntityType.MEV_BOT.value, 0) > 0:
            behavioral_patterns.append("mev_activity")
        if cluster_metadata.get("circular_transfers"):
            behavioral_patterns.append("circular_flow")
        if cluster_metadata.get("timing_correlation", 0) > 0.5:
            behavioral_patterns.append("synchronized_activity")
        
        # Detect threat indicators
        threat_indicators = []
        if predicted_label in [ClusterLabel.WASH_TRADING_RING, ClusterLabel.SYBIL_CLUSTER]:
            threat_indicators.append("market_manipulation")
        if predicted_label == ClusterLabel.MIXER_CLUSTER:
            threat_indicators.append("money_laundering")
        if predicted_label == ClusterLabel.EXPLOIT_NETWORK:
            threat_indicators.append("exploit_funds")
        if entity_compositions.get(EntityType.TORNADO_MIXER.value, 0) > 0:
            threat_indicators.append("sanctioned_entity")
        
        # Determine activity pattern
        activity_pattern = "unknown"
        if cluster_metadata.get("activity_hours"):
            hours = cluster_metadata["activity_hours"]
            if all(6 <= h <= 18 for h in hours):
                activity_pattern = "business_hours"
            elif all(h < 6 or h > 22 for h in hours):
                activity_pattern = "off_hours"
            else:
                activity_pattern = "24_7"
        
        # Create classification
        classification = ClusterClassification(
            cluster_id=cluster_id,
            predicted_label=predicted_label,
            confidence=confidence,
            alternative_labels=alternatives,
            entity_composition=dict(entity_compositions),
            behavioral_patterns=behavioral_patterns,
            threat_indicators=threat_indicators,
            cohesion_score=cluster_metadata.get("cohesion_score", 0.5),
            activity_pattern=activity_pattern,
        )
        
        # Store classification
        self.cluster_classifications[cluster_id] = classification
        
        return classification
    
    async def emit_label_update(
        self,
        entity_id: Optional[str] = None,
        cluster_id: Optional[str] = None,
    ) -> None:
        """Emit label updates through the WebSocket streaming engine."""
        try:
            from app.gde.constellation_fusion_stream.stream_server import (
                constellation_stream_server,
                StreamEventType,
            )
            
            payload = {}
            
            if entity_id and entity_id in self.entity_classifications:
                payload["entity_classification"] = self.entity_classifications[entity_id].to_dict()
            
            if cluster_id and cluster_id in self.cluster_classifications:
                payload["cluster_classification"] = self.cluster_classifications[cluster_id].to_dict()
            
            if not entity_id and not cluster_id:
                # Send all classifications
                payload = {
                    "entity_classifications": {
                        eid: c.to_dict()
                        for eid, c in self.entity_classifications.items()
                    },
                    "cluster_classifications": {
                        cid: c.to_dict()
                        for cid, c in self.cluster_classifications.items()
                    },
                }
            
            await constellation_stream_server.emit_stream_event(
                event_type=StreamEventType.LABEL_UPDATE,
                payload=payload,
                source_engine="cluster_labeler",
            )
        except ImportError:
            logger.warning("Stream server not available for label updates")
        except Exception as e:
            logger.error(f"Failed to emit label update: {e}")
    
    def get_entity_classification(self, node_id: str) -> Optional[EntityClassification]:
        """Get classification for a specific entity."""
        return self.entity_classifications.get(node_id)
    
    def get_cluster_classification(self, cluster_id: str) -> Optional[ClusterClassification]:
        """Get classification for a specific cluster."""
        return self.cluster_classifications.get(cluster_id)
    
    def get_all_labels(self) -> Dict[str, Any]:
        """Get all classification data."""
        return {
            "entity_classifications": {
                eid: c.to_dict()
                for eid, c in self.entity_classifications.items()
            },
            "cluster_classifications": {
                cid: c.to_dict()
                for cid, c in self.cluster_classifications.items()
            },
            "entity_type_counts": self._count_entity_types(),
            "cluster_label_counts": self._count_cluster_labels(),
        }
    
    def _count_entity_types(self) -> Dict[str, int]:
        """Count entities by type."""
        counts = defaultdict(int)
        for c in self.entity_classifications.values():
            counts[c.predicted_type.value] += 1
        return dict(counts)
    
    def _count_cluster_labels(self) -> Dict[str, int]:
        """Count clusters by label."""
        counts = defaultdict(int)
        for c in self.cluster_classifications.values():
            counts[c.predicted_label.value] += 1
        return dict(counts)


# Global cluster labeler instance
cluster_labeler = ConstellationClusterLabeler()


# FastAPI Router
router = APIRouter(
    prefix="/gde/constellation",
    tags=["Constellation Labels"],
)


@router.get("/labels")
async def get_constellation_labels():
    """
    Get all entity and cluster classifications.
    
    Returns:
        - Entity classifications with predicted types
        - Cluster classifications with inferred labels
        - Type and label distribution counts
    """
    return {
        "success": True,
        "labels": cluster_labeler.get_all_labels(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/labels/entity/{node_id}")
async def get_entity_label(node_id: str):
    """Get classification for a specific entity."""
    classification = cluster_labeler.get_entity_classification(node_id)
    
    if classification:
        return {
            "success": True,
            "classification": classification.to_dict(),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    return {
        "success": False,
        "error": f"Entity '{node_id}' not classified",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/labels/cluster/{cluster_id}")
async def get_cluster_label(cluster_id: str):
    """Get classification for a specific cluster."""
    classification = cluster_labeler.get_cluster_classification(cluster_id)
    
    if classification:
        return {
            "success": True,
            "classification": classification.to_dict(),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    return {
        "success": False,
        "error": f"Cluster '{cluster_id}' not classified",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/labels/classify/entity")
async def classify_entity_endpoint(data: Dict[str, Any]):
    """
    Classify an entity with provided data.
    
    Request body:
        - node_id: str
        - node_data: dict with node attributes
    """
    node_id = data.get("node_id")
    if not node_id:
        return {
            "success": False,
            "error": "node_id is required",
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    classification = cluster_labeler.classify_entity(
        node_id=node_id,
        node_data=data.get("node_data", {}),
    )
    
    # Emit label update
    await cluster_labeler.emit_label_update(entity_id=node_id)
    
    return {
        "success": True,
        "classification": classification.to_dict(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/labels/classify/cluster")
async def classify_cluster_endpoint(data: Dict[str, Any]):
    """
    Classify a cluster with provided data.
    
    Request body:
        - cluster_id: str
        - node_ids: list of node IDs
        - cluster_metadata: optional dict with cluster attributes
    """
    cluster_id = data.get("cluster_id")
    node_ids = data.get("node_ids", [])
    
    if not cluster_id:
        return {
            "success": False,
            "error": "cluster_id is required",
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    classification = cluster_labeler.classify_cluster(
        cluster_id=cluster_id,
        node_ids=node_ids,
        cluster_metadata=data.get("cluster_metadata", {}),
    )
    
    # Emit label update
    await cluster_labeler.emit_label_update(cluster_id=cluster_id)
    
    return {
        "success": True,
        "classification": classification.to_dict(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/labels/types")
async def get_entity_types():
    """Get list of all possible entity types."""
    return {
        "success": True,
        "entity_types": [et.value for et in EntityType],
        "cluster_labels": [cl.value for cl in ClusterLabel],
        "timestamp": datetime.utcnow().isoformat(),
    }

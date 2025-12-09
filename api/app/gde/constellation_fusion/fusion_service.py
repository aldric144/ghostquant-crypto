"""
Constellation Fusion Pipeline - Service Layer

Core business logic for managing the constellation graph.
"""

import math
import random
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

from .fusion_models import (
    ConstellationNode,
    ConstellationEdge,
    ConstellationCluster,
    ConstellationMetrics,
    FusionEvent,
    NodeCategory,
    RelationType,
    RiskLevel,
)


class ConstellationFusionService:
    """
    Service class for managing the Global Threat Constellation.
    Handles nodes, edges, clusters, and risk computation.
    """
    
    def __init__(self):
        # In-memory storage
        self._nodes: Dict[str, ConstellationNode] = {}
        self._edges: Dict[str, ConstellationEdge] = {}
        self._clusters: Dict[str, ConstellationCluster] = {}
        self._events: List[FusionEvent] = []
        self._metrics = ConstellationMetrics()
        
        # Spatial layout parameters
        self._layout_radius = 100.0
        self._cluster_spacing = 50.0
    
    def add_node(
        self,
        entity_address: str,
        category: NodeCategory = NodeCategory.UNKNOWN,
        risk_score: float = 0.0,
        metadata: Optional[Dict] = None,
        tags: Optional[List[str]] = None,
    ) -> ConstellationNode:
        """
        Add a new node or update an existing node in the constellation.
        """
        entity_id = entity_address.lower()
        
        if entity_id in self._nodes:
            # Update existing node
            node = self._nodes[entity_id]
            node.risk_score = max(node.risk_score, risk_score)
            node.last_updated = datetime.utcnow()
            if metadata:
                node.metadata.update(metadata)
            if tags:
                for tag in tags:
                    if tag not in node.tags:
                        node.tags.append(tag)
            node._compute_color()
        else:
            # Create new node with random position
            x, y, z = self._compute_node_position(entity_id)
            node = ConstellationNode(
                id=entity_id,
                category=category,
                risk_score=risk_score,
                x=x,
                y=y,
                z=z,
                metadata=metadata or {},
                tags=tags or [],
            )
            self._nodes[entity_id] = node
        
        # Update metrics
        self._update_metrics()
        
        return node
    
    def add_edge(
        self,
        source: str,
        target: str,
        relation_type: RelationType = RelationType.TRANSFER,
        confidence: float = 0.5,
        metadata: Optional[Dict] = None,
    ) -> ConstellationEdge:
        """
        Add a new edge or update an existing edge between two nodes.
        """
        source_id = source.lower()
        target_id = target.lower()
        
        # Ensure both nodes exist
        if source_id not in self._nodes:
            self.add_node(source_id)
        if target_id not in self._nodes:
            self.add_node(target_id)
        
        # Create edge key
        edge_key = f"{source_id}_{target_id}_{relation_type.value}"
        
        if edge_key in self._edges:
            # Update existing edge
            edge = self._edges[edge_key]
            edge.strength = min(edge.strength + 0.1, 1.0)
            edge.confidence = max(edge.confidence, confidence)
            if metadata:
                edge.metadata.update(metadata)
        else:
            # Create new edge
            edge = ConstellationEdge(
                source_id=source_id,
                target_id=target_id,
                relation_type=relation_type,
                strength=0.5,
                confidence=confidence,
                metadata=metadata or {},
            )
            self._edges[edge_key] = edge
        
        # Compute correlation based on node risk scores
        source_node = self._nodes[source_id]
        target_node = self._nodes[target_id]
        edge.correlation = (source_node.risk_score + target_node.risk_score) / 2
        
        # Update metrics
        self._update_metrics()
        
        return edge
    
    def increment_cluster(
        self,
        cluster_id: str,
        risk_level: RiskLevel = RiskLevel.MODERATE,
        node_ids: Optional[List[str]] = None,
    ) -> ConstellationCluster:
        """
        Create or update a cluster with the given risk level.
        """
        if cluster_id in self._clusters:
            cluster = self._clusters[cluster_id]
            # Upgrade risk level if new level is higher
            risk_order = [RiskLevel.MINIMAL, RiskLevel.LOW, RiskLevel.MODERATE, 
                         RiskLevel.ELEVATED, RiskLevel.HIGH, RiskLevel.CRITICAL]
            if risk_order.index(risk_level) > risk_order.index(cluster.risk_level):
                cluster.risk_level = risk_level
            cluster.last_updated = datetime.utcnow()
            if node_ids:
                for node_id in node_ids:
                    if node_id.lower() not in cluster.node_ids:
                        cluster.node_ids.append(node_id.lower())
        else:
            # Create new cluster
            cx, cy, cz = self._compute_cluster_position(cluster_id)
            cluster = ConstellationCluster(
                cluster_id=cluster_id,
                risk_level=risk_level,
                node_ids=[n.lower() for n in (node_ids or [])],
                center_x=cx,
                center_y=cy,
                center_z=cz,
            )
            self._clusters[cluster_id] = cluster
        
        # Compute risk score from risk level
        risk_scores = {
            RiskLevel.MINIMAL: 0.1,
            RiskLevel.LOW: 0.25,
            RiskLevel.MODERATE: 0.4,
            RiskLevel.ELEVATED: 0.6,
            RiskLevel.HIGH: 0.8,
            RiskLevel.CRITICAL: 0.95,
        }
        cluster.risk_score = risk_scores.get(risk_level, 0.5)
        
        # Update metrics
        self._update_metrics()
        
        return cluster
    
    def recompute_global_risk(self) -> float:
        """
        Recompute the global risk score based on all nodes and clusters.
        """
        if not self._nodes:
            self._metrics.global_risk_score = 0.0
            return 0.0
        
        # Weighted average of node risks
        total_risk = sum(node.risk_score for node in self._nodes.values())
        avg_node_risk = total_risk / len(self._nodes)
        
        # Factor in cluster risks
        if self._clusters:
            cluster_risk = sum(c.risk_score for c in self._clusters.values()) / len(self._clusters)
            global_risk = (avg_node_risk * 0.6) + (cluster_risk * 0.4)
        else:
            global_risk = avg_node_risk
        
        # Factor in hydra heads (high-risk coordinated nodes)
        hydra_count = sum(1 for n in self._nodes.values() if n.category == NodeCategory.HYDRA_HEAD)
        if hydra_count > 0:
            hydra_factor = min(hydra_count * 0.05, 0.3)
            global_risk = min(global_risk + hydra_factor, 1.0)
        
        self._metrics.global_risk_score = round(global_risk, 4)
        self._metrics.last_updated = datetime.utcnow()
        
        # Determine dominant risk level
        if global_risk >= 0.8:
            self._metrics.dominant_risk = RiskLevel.CRITICAL
        elif global_risk >= 0.6:
            self._metrics.dominant_risk = RiskLevel.HIGH
        elif global_risk >= 0.4:
            self._metrics.dominant_risk = RiskLevel.ELEVATED
        elif global_risk >= 0.2:
            self._metrics.dominant_risk = RiskLevel.MODERATE
        else:
            self._metrics.dominant_risk = RiskLevel.LOW
        
        return self._metrics.global_risk_score
    
    def serialize_constellation(self) -> Dict:
        """
        Serialize the entire constellation to a dictionary for API response.
        Returns nodes, edges, clusters, and global metrics.
        """
        self.recompute_global_risk()
        
        return {
            "success": True,
            "map": {
                "nodes": [node.to_dict() for node in self._nodes.values()],
                "edges": [edge.to_dict() for edge in self._edges.values()],
                "global_risk_score": self._metrics.global_risk_score,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "total_clusters": len(self._clusters),
                    "clusters": [c.to_dict() for c in self._clusters.values()],
                },
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    def get_metrics(self) -> Dict:
        """
        Get current constellation metrics.
        """
        self._update_metrics()
        return {
            "success": True,
            "summary": self._metrics.to_dict(),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    def process_event(self, event: FusionEvent) -> bool:
        """
        Process a fusion event from any intelligence engine.
        """
        self._events.append(event)
        
        # Route to appropriate handler based on event type
        handlers = {
            "hydra_detection": self._handle_hydra_event,
            "whale_movement": self._handle_whale_event,
            "ecoscan_transfer": self._handle_ecoscan_event,
            "entity_lookup": self._handle_entity_event,
        }
        
        handler = handlers.get(event.event_type)
        if handler:
            return handler(event.payload)
        
        return False
    
    def _handle_hydra_event(self, payload: Dict) -> bool:
        """
        Handle a Hydra detection event.
        Creates nodes for involved wallets, edges for coordination, marks hydra heads.
        """
        origin = payload.get("origin", "")
        participants = payload.get("participants", [])
        confidence = payload.get("confidence", 0.5)
        threat_level = payload.get("threat_level", "moderate")
        
        # Map threat level to risk score
        threat_risk = {
            "critical": 0.95,
            "high": 0.8,
            "elevated": 0.6,
            "moderate": 0.4,
            "low": 0.2,
        }
        risk_score = threat_risk.get(threat_level, 0.5)
        
        # Add origin as hydra head
        if origin:
            self.add_node(
                origin,
                category=NodeCategory.HYDRA_HEAD,
                risk_score=risk_score,
                metadata={"hydra_origin": True, "threat_level": threat_level},
                tags=["hydra_head", "coordinated"],
            )
        
        # Add participants and create edges
        for participant in participants:
            self.add_node(
                participant,
                category=NodeCategory.WALLET,
                risk_score=risk_score * 0.8,
                metadata={"hydra_participant": True},
                tags=["hydra_participant"],
            )
            
            if origin:
                self.add_edge(
                    origin,
                    participant,
                    relation_type=RelationType.HYDRA_LINK,
                    confidence=confidence,
                    metadata={"threat_level": threat_level},
                )
        
        # Create cluster for this hydra network
        cluster_id = f"hydra_{origin[:8]}" if origin else f"hydra_{datetime.utcnow().timestamp()}"
        risk_level = RiskLevel.CRITICAL if threat_level == "critical" else RiskLevel.HIGH
        all_nodes = [origin] + participants if origin else participants
        self.increment_cluster(cluster_id, risk_level, all_nodes)
        
        self._metrics.hydra_heads_detected = sum(
            1 for n in self._nodes.values() if n.category == NodeCategory.HYDRA_HEAD
        )
        
        return True
    
    def _handle_whale_event(self, payload: Dict) -> bool:
        """
        Handle a whale movement event.
        Creates nodes for source/destination, edge for movement.
        """
        source = payload.get("source", "")
        destination = payload.get("destination", "")
        amount_usd = payload.get("amount_usd", 0)
        chain = payload.get("chain", "unknown")
        behavior = payload.get("behavior", "transfer")
        
        # Compute risk based on amount
        if amount_usd > 10000000:
            risk_score = 0.7
        elif amount_usd > 1000000:
            risk_score = 0.5
        elif amount_usd > 100000:
            risk_score = 0.3
        else:
            risk_score = 0.1
        
        # Determine whale tags
        tags = ["whale"]
        if amount_usd > 10000000:
            tags.append("superwhale")
        if behavior == "accumulation":
            tags.append("accumulator")
        elif behavior == "distribution":
            tags.append("distributor")
        
        # Add source whale
        if source:
            self.add_node(
                source,
                category=NodeCategory.WHALE,
                risk_score=risk_score,
                metadata={"chain": chain, "behavior": behavior, "volume_usd": amount_usd},
                tags=tags,
            )
        
        # Add destination
        if destination:
            self.add_node(
                destination,
                category=NodeCategory.WALLET,
                risk_score=risk_score * 0.5,
                metadata={"chain": chain},
                tags=["whale_counterparty"],
            )
        
        # Create edge
        if source and destination:
            self.add_edge(
                source,
                destination,
                relation_type=RelationType.WHALE_MOVEMENT,
                confidence=0.9,
                metadata={"amount_usd": amount_usd, "chain": chain, "direction": "outflow"},
            )
        
        self._metrics.whale_nodes = sum(
            1 for n in self._nodes.values() if n.category == NodeCategory.WHALE
        )
        
        return True
    
    def _handle_ecoscan_event(self, payload: Dict) -> bool:
        """
        Handle an EcoScan transfer event.
        Creates nodes for addresses, edge for transfer.
        """
        from_addr = payload.get("from", "")
        to_addr = payload.get("to", "")
        amount_usd = payload.get("amount_usd", 0)
        chain = payload.get("chain", "unknown")
        is_cross_chain = payload.get("cross_chain", False)
        
        # Compute risk based on transfer characteristics
        risk_score = 0.1
        if amount_usd > 1000000:
            risk_score += 0.3
        if is_cross_chain:
            risk_score += 0.2
        
        tags = ["ecoscan"]
        if is_cross_chain:
            tags.append("cross_chain")
        if amount_usd > 1000000:
            tags.append("large_transfer")
        
        # Add nodes
        if from_addr:
            self.add_node(
                from_addr,
                category=NodeCategory.WALLET,
                risk_score=risk_score,
                metadata={"chain": chain},
                tags=tags,
            )
        
        if to_addr:
            self.add_node(
                to_addr,
                category=NodeCategory.WALLET,
                risk_score=risk_score * 0.8,
                metadata={"chain": chain},
                tags=tags,
            )
        
        # Create edge
        if from_addr and to_addr:
            self.add_edge(
                from_addr,
                to_addr,
                relation_type=RelationType.ECOSCAN_FLOW,
                confidence=0.95,
                metadata={"amount_usd": amount_usd, "chain": chain, "cross_chain": is_cross_chain},
            )
        
        return True
    
    def _handle_entity_event(self, payload: Dict) -> bool:
        """
        Handle an Entity Explorer lookup event.
        Creates or updates node with user_observed tag.
        """
        address = payload.get("address", "")
        entity_type = payload.get("entity_type", "unknown")
        
        if not address:
            return False
        
        # Map entity type to category
        category_map = {
            "exchange": NodeCategory.EXCHANGE,
            "contract": NodeCategory.CONTRACT,
            "whale": NodeCategory.WHALE,
            "wallet": NodeCategory.WALLET,
        }
        category = category_map.get(entity_type, NodeCategory.ENTITY)
        
        # Add node with user_observed tag (does NOT increase risk by default)
        self.add_node(
            address,
            category=category,
            risk_score=0.0,  # Entity lookup doesn't increase risk
            metadata={"entity_type": entity_type, "user_observed": True},
            tags=["user_observed", "entity_lookup"],
        )
        
        return True
    
    def _compute_node_position(self, node_id: str) -> Tuple[float, float, float]:
        """
        Compute a position for a new node based on its ID hash.
        """
        # Use hash for deterministic but distributed positioning
        hash_val = hash(node_id)
        angle = (hash_val % 360) * (math.pi / 180)
        radius = self._layout_radius * (0.5 + (hash_val % 100) / 200)
        
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = (hash_val % 50) - 25  # Z between -25 and 25
        
        return round(x, 2), round(y, 2), round(z, 2)
    
    def _compute_cluster_position(self, cluster_id: str) -> Tuple[float, float, float]:
        """
        Compute a position for a new cluster.
        """
        hash_val = hash(cluster_id)
        angle = (hash_val % 360) * (math.pi / 180)
        radius = self._layout_radius * 0.7
        
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = 0
        
        return round(x, 2), round(y, 2), round(z, 2)
    
    def _update_metrics(self):
        """
        Update constellation metrics.
        """
        self._metrics.total_nodes = len(self._nodes)
        self._metrics.total_edges = len(self._edges)
        self._metrics.total_clusters = len(self._clusters)
        self._metrics.hydra_heads_detected = sum(
            1 for n in self._nodes.values() if n.category == NodeCategory.HYDRA_HEAD
        )
        self._metrics.whale_nodes = sum(
            1 for n in self._nodes.values() if n.category == NodeCategory.WHALE
        )
        
        # Get high risk entities
        high_risk = [
            n.id for n in self._nodes.values()
            if n.risk_score >= 0.7
        ]
        self._metrics.high_risk_entities = sorted(high_risk, key=lambda x: self._nodes[x].risk_score, reverse=True)[:10]
        
        self.recompute_global_risk()


# Global service instance
constellation_fusion_service = ConstellationFusionService()

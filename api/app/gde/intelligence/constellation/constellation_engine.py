"""
Global Threat Constellation Map™ - Engine
Converts multi-domain intelligence into 3D visual constellation
Pure Python, zero external dependencies
"""

import logging
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from .constellation_schema import (
    ConstellationNode,
    ConstellationEdge,
    ConstellationMap,
    ConstellationSummary
)

logger = logging.getLogger(__name__)


class GlobalConstellationEngine:
    """
    Global Threat Constellation Map™ Engine
    
    Converts multi-domain intelligence into 3D visual constellation:
    - Entities, tokens, chains, clusters, Hydra heads → 3D nodes
    - Correlations, links, flows → edges
    - Risk levels → colors and sizes
    - Global risk scoring
    
    Pure Python, 100% crash-proof, 72h data retention
    """
    
    def __init__(self, retention_hours: int = 72):
        """
        Initialize Global Constellation Engine
        
        Args:
            retention_hours: Data retention window in hours (default: 72)
        """
        self.retention_hours = retention_hours
        self.intelligence_data: List[Dict[str, Any]] = []
        self.latest_map: Optional[ConstellationMap] = None
        self.latest_summary: Optional[ConstellationSummary] = None
        logger.info(f"[Constellation] Engine initialized with {retention_hours}h retention")
    
    def ingest_global_intelligence(self, intel: Dict[str, Any]) -> bool:
        """
        Ingest intelligence from multiple sources
        
        Accepts output from:
        - Fusion Engine
        - Hydra Engine
        - Actor Profiler
        - Correlation Engine
        - Radar Engine
        - Behavioral DNA
        
        Args:
            intel: Intelligence dictionary with source metadata
            
        Returns:
            True if ingested successfully
        """
        try:
            logger.info(f"[Constellation] Ingesting intelligence from {intel.get('source', 'unknown')}")
            
            if 'timestamp' not in intel:
                intel['timestamp'] = datetime.utcnow().isoformat()
            
            self.intelligence_data.append(intel)
            
            self.purge_old_data()
            
            logger.info(f"[Constellation] Ingested intelligence, total: {len(self.intelligence_data)}")
            return True
            
        except Exception as e:
            logger.error(f"[Constellation] Error ingesting intelligence: {e}")
            return False
    
    def build_nodes(self) -> List[ConstellationNode]:
        """
        Build 3D nodes from intelligence data
        
        Converts entities, tokens, clusters, chains into 3D nodes:
        - x,y,z coordinates generated deterministically from ID hash
        - node color = risk level (red=high, yellow=medium, green=low)
        - node size = influence score
        
        Returns:
            List of ConstellationNode objects
        """
        try:
            logger.info("[Constellation] Building nodes")
            
            nodes = []
            seen_ids = set()
            
            for intel in self.intelligence_data:
                source = intel.get('source', '')
                
                if source == 'fusion':
                    nodes.extend(self._extract_fusion_nodes(intel, seen_ids))
                elif source == 'hydra':
                    nodes.extend(self._extract_hydra_nodes(intel, seen_ids))
                elif source == 'actor':
                    nodes.extend(self._extract_actor_nodes(intel, seen_ids))
                elif source == 'correlation':
                    nodes.extend(self._extract_correlation_nodes(intel, seen_ids))
                elif source == 'radar':
                    nodes.extend(self._extract_radar_nodes(intel, seen_ids))
                elif source == 'dna':
                    nodes.extend(self._extract_dna_nodes(intel, seen_ids))
                else:
                    nodes.extend(self._extract_generic_nodes(intel, seen_ids))
            
            logger.info(f"[Constellation] Built {len(nodes)} nodes")
            return nodes
            
        except Exception as e:
            logger.error(f"[Constellation] Error building nodes: {e}")
            return []
    
    def build_edges(self) -> List[ConstellationEdge]:
        """
        Build edges between nodes
        
        Edges represent:
        - Correlation strength
        - Hydra relay links
        - Cluster connections
        - Manipulation flows
        
        Returns:
            List of ConstellationEdge objects
        """
        try:
            logger.info("[Constellation] Building edges")
            
            edges = []
            
            for intel in self.intelligence_data:
                source = intel.get('source', '')
                
                if source == 'fusion':
                    edges.extend(self._extract_fusion_edges(intel))
                elif source == 'hydra':
                    edges.extend(self._extract_hydra_edges(intel))
                elif source == 'correlation':
                    edges.extend(self._extract_correlation_edges(intel))
                elif source == 'radar':
                    edges.extend(self._extract_radar_edges(intel))
                else:
                    edges.extend(self._extract_generic_edges(intel))
            
            logger.info(f"[Constellation] Built {len(edges)} edges")
            return edges
            
        except Exception as e:
            logger.error(f"[Constellation] Error building edges: {e}")
            return []
    
    def compute_global_risk(self) -> float:
        """
        Compute global risk score from all intelligence sources
        
        Weighted fusion:
        - 30% Hydra
        - 25% Fusion
        - 20% Radar
        - 15% Correlation
        - 10% Actor Profile
        
        Returns:
            Global risk score (0-1)
        """
        try:
            logger.info("[Constellation] Computing global risk")
            
            hydra_score = 0.0
            fusion_score = 0.0
            radar_score = 0.0
            correlation_score = 0.0
            actor_score = 0.0
            
            hydra_count = 0
            fusion_count = 0
            radar_count = 0
            correlation_count = 0
            actor_count = 0
            
            for intel in self.intelligence_data:
                source = intel.get('source', '')
                
                if source == 'hydra':
                    score = self._extract_hydra_risk(intel)
                    if score > 0:
                        hydra_score += score
                        hydra_count += 1
                elif source == 'fusion':
                    score = self._extract_fusion_risk(intel)
                    if score > 0:
                        fusion_score += score
                        fusion_count += 1
                elif source == 'radar':
                    score = self._extract_radar_risk(intel)
                    if score > 0:
                        radar_score += score
                        radar_count += 1
                elif source == 'correlation':
                    score = self._extract_correlation_risk(intel)
                    if score > 0:
                        correlation_score += score
                        correlation_count += 1
                elif source == 'actor':
                    score = self._extract_actor_risk(intel)
                    if score > 0:
                        actor_score += score
                        actor_count += 1
            
            hydra_avg = hydra_score / hydra_count if hydra_count > 0 else 0.0
            fusion_avg = fusion_score / fusion_count if fusion_count > 0 else 0.0
            radar_avg = radar_score / radar_count if radar_count > 0 else 0.0
            correlation_avg = correlation_score / correlation_count if correlation_count > 0 else 0.0
            actor_avg = actor_score / actor_count if actor_count > 0 else 0.0
            
            global_risk = (
                hydra_avg * 0.30 +
                fusion_avg * 0.25 +
                radar_avg * 0.20 +
                correlation_avg * 0.15 +
                actor_avg * 0.10
            )
            
            logger.info(f"[Constellation] Global risk: {global_risk:.3f}")
            return min(1.0, max(0.0, global_risk))
            
        except Exception as e:
            logger.error(f"[Constellation] Error computing global risk: {e}")
            return 0.0
    
    def generate_constellation_map(self) -> ConstellationMap:
        """
        Generate complete constellation map
        
        Returns:
            ConstellationMap object with nodes, edges, global risk
        """
        try:
            logger.info("[Constellation] Generating constellation map")
            
            nodes = self.build_nodes()
            edges = self.build_edges()
            
            global_risk = self.compute_global_risk()
            
            constellation_map = ConstellationMap(
                nodes=nodes,
                edges=edges,
                global_risk_score=global_risk,
                timestamp=datetime.utcnow().isoformat(),
                metadata={
                    'total_intelligence_sources': len(self.intelligence_data),
                    'retention_hours': self.retention_hours
                }
            )
            
            self.latest_map = constellation_map
            
            logger.info(f"[Constellation] Generated map: {len(nodes)} nodes, {len(edges)} edges, risk={global_risk:.3f}")
            return constellation_map
            
        except Exception as e:
            logger.error(f"[Constellation] Error generating map: {e}")
            return ConstellationMap()
    
    def generate_summary(self) -> ConstellationSummary:
        """
        Generate constellation summary
        
        Returns:
            ConstellationSummary with:
            - High-risk "supernova" nodes
            - Volatile "nebula" zones
            - Coordinated clusters "galaxies"
            - Relay networks "wormholes"
        """
        try:
            logger.info("[Constellation] Generating summary")
            
            if self.latest_map is None:
                self.generate_constellation_map()
            
            if self.latest_map is None:
                return ConstellationSummary()
            
            total_nodes = len(self.latest_map.nodes)
            total_edges = len(self.latest_map.edges)
            
            high_risk_entities = [
                node.id for node in self.latest_map.nodes
                if node.risk_level >= 0.70
            ]
            
            clusters_detected = sum(
                1 for node in self.latest_map.nodes
                if node.type == 'cluster'
            )
            
            hydra_heads_detected = sum(
                1 for node in self.latest_map.nodes
                if node.type == 'hydra_head'
            )
            
            global_risk = self.latest_map.global_risk_score
            if global_risk >= 0.80:
                dominant_risk = "critical"
            elif global_risk >= 0.65:
                dominant_risk = "high"
            elif global_risk >= 0.50:
                dominant_risk = "elevated"
            elif global_risk >= 0.35:
                dominant_risk = "moderate"
            elif global_risk >= 0.20:
                dominant_risk = "low"
            else:
                dominant_risk = "minimal"
            
            notes = self._generate_summary_notes(
                total_nodes,
                total_edges,
                len(high_risk_entities),
                clusters_detected,
                hydra_heads_detected,
                dominant_risk
            )
            
            summary = ConstellationSummary(
                total_nodes=total_nodes,
                total_edges=total_edges,
                dominant_risk=dominant_risk,
                high_risk_entities=high_risk_entities[:10],  # Top 10
                clusters_detected=clusters_detected,
                hydra_heads_detected=hydra_heads_detected,
                notes=notes
            )
            
            self.latest_summary = summary
            
            logger.info(f"[Constellation] Generated summary: {total_nodes} nodes, {len(high_risk_entities)} high-risk")
            return summary
            
        except Exception as e:
            logger.error(f"[Constellation] Error generating summary: {e}")
            return ConstellationSummary()
    
    def purge_old_data(self):
        """
        Drop intelligence older than retention window (72 hours default)
        """
        try:
            cutoff = datetime.utcnow() - timedelta(hours=self.retention_hours)
            
            original_count = len(self.intelligence_data)
            
            self.intelligence_data = [
                intel for intel in self.intelligence_data
                if self._parse_timestamp(intel.get('timestamp', '')) > cutoff
            ]
            
            purged = original_count - len(self.intelligence_data)
            
            if purged > 0:
                logger.info(f"[Constellation] Purged {purged} old intelligence records")
            
        except Exception as e:
            logger.error(f"[Constellation] Error purging old data: {e}")
    
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """Parse timestamp string to datetime"""
        try:
            return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except Exception:
            return datetime.utcnow()
    
    def _generate_3d_coordinates(self, node_id: str) -> Tuple[float, float, float]:
        """
        Generate deterministic 3D coordinates from node ID
        
        Uses hash of ID to generate consistent x,y,z in range [-100, 100]
        """
        try:
            hash_obj = hashlib.md5(node_id.encode('utf-8'))
            hash_bytes = hash_obj.digest()
            
            x_int = int.from_bytes(hash_bytes[0:4], 'big')
            y_int = int.from_bytes(hash_bytes[4:8], 'big')
            z_int = int.from_bytes(hash_bytes[8:12], 'big')
            
            x = (x_int % 200) - 100.0
            y = (y_int % 200) - 100.0
            z = (z_int % 200) - 100.0
            
            return (x, y, z)
            
        except Exception:
            return (0.0, 0.0, 0.0)
    
    def _compute_risk_color(self, risk_level: float) -> str:
        """
        Compute color based on risk level
        
        Red (high) → Yellow (medium) → Green (low)
        """
        try:
            if risk_level >= 0.80:
                return "#ff0000"  # Bright red (critical)
            elif risk_level >= 0.65:
                return "#ff4444"  # Red (high)
            elif risk_level >= 0.50:
                return "#ff8800"  # Orange (elevated)
            elif risk_level >= 0.35:
                return "#ffcc00"  # Yellow (moderate)
            elif risk_level >= 0.20:
                return "#88ff88"  # Light green (low)
            else:
                return "#00ff00"  # Green (minimal)
        except Exception:
            return "#ffffff"
    
    def _compute_node_size(self, node_type: str, risk_level: float) -> float:
        """
        Compute node size based on type and risk level
        """
        try:
            base_sizes = {
                'hydra_head': 3.0,
                'cluster': 2.5,
                'entity': 1.5,
                'token': 1.2,
                'chain': 1.0
            }
            
            base_size = base_sizes.get(node_type, 1.0)
            
            risk_multiplier = 1.0 + risk_level
            
            return base_size * risk_multiplier
            
        except Exception:
            return 1.0
    
    def _extract_fusion_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from Fusion Engine intelligence"""
        nodes = []
        try:
            entity = intel.get('entity', '')
            if entity and entity not in seen_ids:
                x, y, z = self._generate_3d_coordinates(entity)
                risk = intel.get('fusion_score', 0.0)
                
                node = ConstellationNode(
                    id=entity,
                    label=entity[:20] + '...' if len(entity) > 20 else entity,
                    type='entity',
                    x=x,
                    y=y,
                    z=z,
                    risk_level=risk,
                    color=self._compute_risk_color(risk),
                    size=self._compute_node_size('entity', risk),
                    metadata={'source': 'fusion', 'fusion_score': risk}
                )
                nodes.append(node)
                seen_ids.add(entity)
            
            token = intel.get('token', '')
            if token and token not in seen_ids:
                x, y, z = self._generate_3d_coordinates(token)
                risk = intel.get('fusion_score', 0.0)
                
                node = ConstellationNode(
                    id=token,
                    label=token,
                    type='token',
                    x=x,
                    y=y,
                    z=z,
                    risk_level=risk,
                    color=self._compute_risk_color(risk),
                    size=self._compute_node_size('token', risk),
                    metadata={'source': 'fusion', 'fusion_score': risk}
                )
                nodes.append(node)
                seen_ids.add(token)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting fusion nodes: {e}")
        
        return nodes
    
    def _extract_hydra_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from Hydra Engine intelligence"""
        nodes = []
        try:
            cluster_data = intel.get('cluster', {})
            if isinstance(cluster_data, dict):
                cluster_id = cluster_data.get('cluster_id', '')
                if cluster_id and cluster_id not in seen_ids:
                    x, y, z = self._generate_3d_coordinates(cluster_id)
                    risk = cluster_data.get('manipulation_score', 0.0)
                    
                    node = ConstellationNode(
                        id=cluster_id,
                        label=f"Cluster {cluster_id[:10]}",
                        type='cluster',
                        x=x,
                        y=y,
                        z=z,
                        risk_level=risk,
                        color=self._compute_risk_color(risk),
                        size=self._compute_node_size('cluster', risk),
                        metadata={'source': 'hydra', 'hydra_heads': cluster_data.get('hydra_heads', 0)}
                    )
                    nodes.append(node)
                    seen_ids.add(cluster_id)
                
                entities = cluster_data.get('entities', [])
                for entity_data in entities:
                    if isinstance(entity_data, dict):
                        entity_id = entity_data.get('address', '')
                        entity_role = entity_data.get('role', 'node')
                        
                        if entity_id and entity_id not in seen_ids:
                            x, y, z = self._generate_3d_coordinates(entity_id)
                            risk = entity_data.get('score', 0.0)
                            
                            node_type = 'hydra_head' if entity_role == 'leader' else 'entity'
                            
                            node = ConstellationNode(
                                id=entity_id,
                                label=entity_id[:20] + '...' if len(entity_id) > 20 else entity_id,
                                type=node_type,
                                x=x,
                                y=y,
                                z=z,
                                risk_level=risk,
                                color=self._compute_risk_color(risk),
                                size=self._compute_node_size(node_type, risk),
                                metadata={'source': 'hydra', 'role': entity_role}
                            )
                            nodes.append(node)
                            seen_ids.add(entity_id)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting hydra nodes: {e}")
        
        return nodes
    
    def _extract_actor_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from Actor Profiler intelligence"""
        nodes = []
        try:
            entity = intel.get('entity', '')
            if entity and entity not in seen_ids:
                x, y, z = self._generate_3d_coordinates(entity)
                risk = intel.get('threat_score', 0.0)
                
                node = ConstellationNode(
                    id=entity,
                    label=entity[:20] + '...' if len(entity) > 20 else entity,
                    type='entity',
                    x=x,
                    y=y,
                    z=z,
                    risk_level=risk,
                    color=self._compute_risk_color(risk),
                    size=self._compute_node_size('entity', risk),
                    metadata={'source': 'actor', 'actor_type': intel.get('actor_type', 'unknown')}
                )
                nodes.append(node)
                seen_ids.add(entity)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting actor nodes: {e}")
        
        return nodes
    
    def _extract_correlation_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from Correlation Engine intelligence"""
        nodes = []
        try:
            entity_a = intel.get('entity_a', '')
            entity_b = intel.get('entity_b', '')
            
            for entity in [entity_a, entity_b]:
                if entity and entity not in seen_ids:
                    x, y, z = self._generate_3d_coordinates(entity)
                    risk = intel.get('correlation_score', 0.0)
                    
                    node = ConstellationNode(
                        id=entity,
                        label=entity[:20] + '...' if len(entity) > 20 else entity,
                        type='entity',
                        x=x,
                        y=y,
                        z=z,
                        risk_level=risk,
                        color=self._compute_risk_color(risk),
                        size=self._compute_node_size('entity', risk),
                        metadata={'source': 'correlation'}
                    )
                    nodes.append(node)
                    seen_ids.add(entity)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting correlation nodes: {e}")
        
        return nodes
    
    def _extract_radar_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from Radar Engine intelligence"""
        nodes = []
        try:
            entity = intel.get('entity', '')
            if entity and entity not in seen_ids:
                x, y, z = self._generate_3d_coordinates(entity)
                risk = intel.get('manipulation_score', 0.0)
                
                node = ConstellationNode(
                    id=entity,
                    label=entity[:20] + '...' if len(entity) > 20 else entity,
                    type='entity',
                    x=x,
                    y=y,
                    z=z,
                    risk_level=risk,
                    color=self._compute_risk_color(risk),
                    size=self._compute_node_size('entity', risk),
                    metadata={'source': 'radar', 'manipulation_score': risk}
                )
                nodes.append(node)
                seen_ids.add(entity)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting radar nodes: {e}")
        
        return nodes
    
    def _extract_dna_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from Behavioral DNA intelligence"""
        nodes = []
        try:
            entity = intel.get('entity', '')
            if entity and entity not in seen_ids:
                x, y, z = self._generate_3d_coordinates(entity)
                risk = intel.get('risk_score', 0.0)
                
                node = ConstellationNode(
                    id=entity,
                    label=entity[:20] + '...' if len(entity) > 20 else entity,
                    type='entity',
                    x=x,
                    y=y,
                    z=z,
                    risk_level=risk,
                    color=self._compute_risk_color(risk),
                    size=self._compute_node_size('entity', risk),
                    metadata={'source': 'dna', 'archetype': intel.get('archetype', 'unknown')}
                )
                nodes.append(node)
                seen_ids.add(entity)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting dna nodes: {e}")
        
        return nodes
    
    def _extract_generic_nodes(self, intel: Dict[str, Any], seen_ids: set) -> List[ConstellationNode]:
        """Extract nodes from generic intelligence"""
        nodes = []
        try:
            entity = intel.get('entity', intel.get('address', ''))
            if entity and entity not in seen_ids:
                x, y, z = self._generate_3d_coordinates(entity)
                risk = intel.get('risk_score', intel.get('score', 0.0))
                
                node = ConstellationNode(
                    id=entity,
                    label=entity[:20] + '...' if len(entity) > 20 else entity,
                    type='entity',
                    x=x,
                    y=y,
                    z=z,
                    risk_level=risk,
                    color=self._compute_risk_color(risk),
                    size=self._compute_node_size('entity', risk),
                    metadata={'source': intel.get('source', 'unknown')}
                )
                nodes.append(node)
                seen_ids.add(entity)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting generic nodes: {e}")
        
        return nodes
    
    def _extract_fusion_edges(self, intel: Dict[str, Any]) -> List[ConstellationEdge]:
        """Extract edges from Fusion Engine intelligence"""
        edges = []
        try:
            entity = intel.get('entity', '')
            token = intel.get('token', '')
            
            if entity and token:
                correlation = intel.get('fusion_score', 0.0)
                
                edge = ConstellationEdge(
                    source_id=entity,
                    target_id=token,
                    strength=correlation,
                    correlation=correlation,
                    color=self._compute_edge_color(correlation),
                    metadata={'source': 'fusion', 'type': 'entity_token'}
                )
                edges.append(edge)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting fusion edges: {e}")
        
        return edges
    
    def _extract_hydra_edges(self, intel: Dict[str, Any]) -> List[ConstellationEdge]:
        """Extract edges from Hydra Engine intelligence"""
        edges = []
        try:
            cluster_data = intel.get('cluster', {})
            if isinstance(cluster_data, dict):
                cluster_id = cluster_data.get('cluster_id', '')
                entities = cluster_data.get('entities', [])
                
                for entity_data in entities:
                    if isinstance(entity_data, dict):
                        entity_id = entity_data.get('address', '')
                        if cluster_id and entity_id:
                            strength = entity_data.get('score', 0.5)
                            
                            edge = ConstellationEdge(
                                source_id=cluster_id,
                                target_id=entity_id,
                                strength=strength,
                                correlation=strength,
                                color=self._compute_edge_color(strength),
                                metadata={'source': 'hydra', 'type': 'cluster_entity'}
                            )
                            edges.append(edge)
                
                for i, entity_a in enumerate(entities):
                    if isinstance(entity_a, dict):
                        entity_a_id = entity_a.get('address', '')
                        entity_a_role = entity_a.get('role', '')
                        
                        if entity_a_role == 'relay':
                            for entity_b in entities[i+1:]:
                                if isinstance(entity_b, dict):
                                    entity_b_id = entity_b.get('address', '')
                                    if entity_a_id and entity_b_id:
                                        edge = ConstellationEdge(
                                            source_id=entity_a_id,
                                            target_id=entity_b_id,
                                            strength=0.7,
                                            correlation=0.7,
                                            color=self._compute_edge_color(0.7),
                                            metadata={'source': 'hydra', 'type': 'relay_link'}
                                        )
                                        edges.append(edge)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting hydra edges: {e}")
        
        return edges
    
    def _extract_correlation_edges(self, intel: Dict[str, Any]) -> List[ConstellationEdge]:
        """Extract edges from Correlation Engine intelligence"""
        edges = []
        try:
            entity_a = intel.get('entity_a', '')
            entity_b = intel.get('entity_b', '')
            
            if entity_a and entity_b:
                correlation = intel.get('correlation_score', 0.0)
                
                edge = ConstellationEdge(
                    source_id=entity_a,
                    target_id=entity_b,
                    strength=correlation,
                    correlation=correlation,
                    color=self._compute_edge_color(correlation),
                    metadata={'source': 'correlation', 'type': 'correlation'}
                )
                edges.append(edge)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting correlation edges: {e}")
        
        return edges
    
    def _extract_radar_edges(self, intel: Dict[str, Any]) -> List[ConstellationEdge]:
        """Extract edges from Radar Engine intelligence"""
        edges = []
        try:
            entity = intel.get('entity', '')
            related_entities = intel.get('related_entities', [])
            
            for related in related_entities:
                if entity and related:
                    strength = intel.get('manipulation_score', 0.5)
                    
                    edge = ConstellationEdge(
                        source_id=entity,
                        target_id=related,
                        strength=strength,
                        correlation=strength,
                        color=self._compute_edge_color(strength),
                        metadata={'source': 'radar', 'type': 'manipulation_flow'}
                    )
                    edges.append(edge)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting radar edges: {e}")
        
        return edges
    
    def _extract_generic_edges(self, intel: Dict[str, Any]) -> List[ConstellationEdge]:
        """Extract edges from generic intelligence"""
        edges = []
        try:
            source = intel.get('source_entity', intel.get('from', ''))
            target = intel.get('target_entity', intel.get('to', ''))
            
            if source and target:
                strength = intel.get('strength', intel.get('score', 0.5))
                
                edge = ConstellationEdge(
                    source_id=source,
                    target_id=target,
                    strength=strength,
                    correlation=strength,
                    color=self._compute_edge_color(strength),
                    metadata={'source': intel.get('source', 'unknown')}
                )
                edges.append(edge)
            
        except Exception as e:
            logger.error(f"[Constellation] Error extracting generic edges: {e}")
        
        return edges
    
    def _compute_edge_color(self, strength: float) -> str:
        """Compute edge color based on strength"""
        try:
            if strength >= 0.80:
                return "#ff0000"  # Red (strong)
            elif strength >= 0.60:
                return "#ff8800"  # Orange
            elif strength >= 0.40:
                return "#ffcc00"  # Yellow
            else:
                return "#88ccff"  # Light blue (weak)
        except Exception:
            return "#ffffff"
    
    def _extract_hydra_risk(self, intel: Dict[str, Any]) -> float:
        """Extract risk score from Hydra intelligence"""
        try:
            cluster_data = intel.get('cluster', {})
            if isinstance(cluster_data, dict):
                return cluster_data.get('manipulation_score', 0.0)
            return 0.0
        except Exception:
            return 0.0
    
    def _extract_fusion_risk(self, intel: Dict[str, Any]) -> float:
        """Extract risk score from Fusion intelligence"""
        try:
            return intel.get('fusion_score', 0.0)
        except Exception:
            return 0.0
    
    def _extract_radar_risk(self, intel: Dict[str, Any]) -> float:
        """Extract risk score from Radar intelligence"""
        try:
            return intel.get('manipulation_score', 0.0)
        except Exception:
            return 0.0
    
    def _extract_correlation_risk(self, intel: Dict[str, Any]) -> float:
        """Extract risk score from Correlation intelligence"""
        try:
            return intel.get('correlation_score', 0.0)
        except Exception:
            return 0.0
    
    def _extract_actor_risk(self, intel: Dict[str, Any]) -> float:
        """Extract risk score from Actor Profiler intelligence"""
        try:
            return intel.get('threat_score', 0.0)
        except Exception:
            return 0.0
    
    def _generate_summary_notes(
        self,
        total_nodes: int,
        total_edges: int,
        high_risk_count: int,
        clusters: int,
        hydra_heads: int,
        dominant_risk: str
    ) -> str:
        """Generate summary notes"""
        try:
            notes_parts = []
            
            notes_parts.append(
                f"Global Threat Constellation: {total_nodes} entities mapped across {total_edges} connections. "
                f"Dominant risk level: {dominant_risk.upper()}."
            )
            
            if high_risk_count > 0:
                notes_parts.append(
                    f" {high_risk_count} high-risk 'supernova' entities detected requiring immediate attention."
                )
            
            if clusters > 0:
                notes_parts.append(
                    f" {clusters} coordinated clusters ('galaxies') identified with structured manipulation patterns."
                )
            
            if hydra_heads > 0:
                notes_parts.append(
                    f" {hydra_heads} Hydra head entities detected leading multi-node coordination networks."
                )
            
            if dominant_risk in ['critical', 'high']:
                notes_parts.append(
                    " IMMEDIATE ACTION REQUIRED: Deploy emergency monitoring protocols, escalate to security operations."
                )
            elif dominant_risk == 'elevated':
                notes_parts.append(
                    " Enhanced monitoring recommended with additional verification procedures."
                )
            else:
                notes_parts.append(
                    " Standard monitoring protocols sufficient for current threat landscape."
                )
            
            return ''.join(notes_parts)
            
        except Exception:
            return "Constellation summary generated."
    
    def get_health(self) -> Dict[str, Any]:
        """Get engine health status"""
        try:
            return {
                "status": "operational",
                "engine": "Global Threat Constellation Map™",
                "version": "1.0.0",
                "retention_hours": self.retention_hours,
                "total_intelligence": len(self.intelligence_data),
                "latest_map_nodes": len(self.latest_map.nodes) if self.latest_map else 0,
                "latest_map_edges": len(self.latest_map.edges) if self.latest_map else 0,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"[Constellation] Error getting health: {e}")
            return {
                "status": "error",
                "engine": "Global Threat Constellation Map™",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

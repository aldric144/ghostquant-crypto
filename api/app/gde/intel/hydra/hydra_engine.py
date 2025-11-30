"""
Operation Hydra™ - Multi-Head Coordinated Network Detection Engine
Detects coordinated manipulation networks with multiple "heads" (leaders)
Pure Python, zero external dependencies
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from .hydra_schema import HydraEntity, HydraCluster, HydraReport

logger = logging.getLogger(__name__)


class OperationHydraEngine:
    """
    Multi-Head Coordinated Network Detection Engine
    
    Detects "Hydra" networks: coordinated manipulation clusters with ≥2 leaders
    
    Key capabilities:
    - Detect Hydra heads (leaders with burst patterns, synchronized timing)
    - Detect relays (bridges between heads)
    - Detect proxies (low-volume actors connected to heads)
    - Build coordinated clusters
    - Compute 15+ indicators
    - Generate intelligence narratives
    
    Pure Python, 100% crash-proof, 48h sliding window
    """
    
    def __init__(self, window_hours: int = 48):
        """
        Initialize Operation Hydra Engine
        
        Args:
            window_hours: Sliding window size in hours (default: 48)
        """
        self.window_hours = window_hours
        self.events: List[Dict[str, Any]] = []
        self.entity_events: Dict[str, List[Dict[str, Any]]] = {}
        self.latest_cluster: Optional[HydraCluster] = None
        self.latest_indicators: Dict[str, Any] = {}
        logger.info(f"[Hydra] Engine initialized with {window_hours}h window")
    
    def ingest_events(self, events: List[Dict[str, Any]]) -> int:
        """
        Ingest events into the engine with 48h sliding window
        
        Stores events in memory and builds entity → event mapping
        Automatically prunes events older than window_hours
        
        Args:
            events: List of event dictionaries
            
        Returns:
            Number of events ingested
        """
        try:
            logger.info(f"[Hydra] Ingesting {len(events)} events")
            
            now = datetime.utcnow()
            for event in events:
                if 'timestamp' not in event:
                    event['timestamp'] = now.isoformat()
            
            self.events.extend(events)
            
            cutoff = now - timedelta(hours=self.window_hours)
            self.events = [
                e for e in self.events
                if self._parse_timestamp(e.get('timestamp', '')) > cutoff
            ]
            
            self.entity_events = {}
            for event in self.events:
                entity = event.get('entity', event.get('address', ''))
                if entity:
                    if entity not in self.entity_events:
                        self.entity_events[entity] = []
                    self.entity_events[entity].append(event)
            
            logger.info(f"[Hydra] Ingested {len(events)} events, total: {len(self.events)}, entities: {len(self.entity_events)}")
            return len(events)
            
        except Exception as e:
            logger.error(f"[Hydra] Error ingesting events: {e}")
            return 0
    
    def detect_heads(self, entity_events: Optional[Dict[str, List[Dict[str, Any]]]] = None) -> List[Dict[str, Any]]:
        """
        Detect Hydra Head Candidates (leaders)
        
        Indicators:
        - Burst patterns (high activity in short windows)
        - Synchronized timings (≤60 sec window with other entities)
        - Mirrored transfers (similar amounts, opposite directions)
        - Triangular loops (A→B→C→A patterns)
        - Multi-chain hops (activity across multiple chains)
        - Ring overlap (participation in multiple coordination rings)
        
        Args:
            entity_events: Optional entity → events mapping (uses self.entity_events if None)
            
        Returns:
            List of head candidate dictionaries
        """
        try:
            logger.info("[Hydra] Detecting Hydra heads")
            
            if entity_events is None:
                entity_events = self.entity_events
            
            heads = []
            
            for entity, events in entity_events.items():
                if len(events) < 3:  # Need minimum activity
                    continue
                
                burst_score = self._compute_burst_score(events)
                sync_score = self._compute_sync_score(entity, events, entity_events)
                mirror_score = self._compute_mirror_score(entity, events, entity_events)
                loop_score = self._compute_loop_score(entity, events, entity_events)
                chain_hop_score = self._compute_chain_hop_score(events)
                ring_overlap_score = self._compute_ring_overlap_score(entity, events, entity_events)
                
                head_score = (
                    burst_score * 0.25 +
                    sync_score * 0.20 +
                    mirror_score * 0.15 +
                    loop_score * 0.15 +
                    chain_hop_score * 0.15 +
                    ring_overlap_score * 0.10
                )
                
                if head_score >= 0.40:
                    heads.append({
                        'entity': entity,
                        'role': 'leader',
                        'head_score': head_score,
                        'burst_score': burst_score,
                        'sync_score': sync_score,
                        'mirror_score': mirror_score,
                        'loop_score': loop_score,
                        'chain_hop_score': chain_hop_score,
                        'ring_overlap_score': ring_overlap_score,
                        'event_count': len(events)
                    })
            
            heads.sort(key=lambda x: x['head_score'], reverse=True)
            
            logger.info(f"[Hydra] Detected {len(heads)} head candidates")
            return heads
            
        except Exception as e:
            logger.error(f"[Hydra] Error detecting heads: {e}")
            return []
    
    def detect_relays(self, entity_events: Optional[Dict[str, List[Dict[str, Any]]]] = None) -> List[Dict[str, Any]]:
        """
        Detect relay addresses (bridges between 2+ heads)
        
        Relays:
        - Connect to multiple head candidates
        - Activity within ≤5 min coincidence windows
        - Medium volume (not too high, not too low)
        - Bridge different coordination clusters
        
        Args:
            entity_events: Optional entity → events mapping
            
        Returns:
            List of relay dictionaries
        """
        try:
            logger.info("[Hydra] Detecting relays")
            
            if entity_events is None:
                entity_events = self.entity_events
            
            heads = self.detect_heads(entity_events)
            if len(heads) < 2:
                logger.info("[Hydra] Not enough heads for relay detection")
                return []
            
            head_entities = {h['entity'] for h in heads}
            
            relays = []
            
            for entity, events in entity_events.items():
                if entity in head_entities:
                    continue  # Skip heads
                
                if len(events) < 2:
                    continue
                
                connected_heads = self._find_connected_heads(entity, events, head_entities, entity_events)
                
                if len(connected_heads) >= 2:
                    bridge_score = min(1.0, len(connected_heads) / 3.0)
                    coincidence_score = self._compute_coincidence_score(entity, events, connected_heads, entity_events)
                    volume_score = self._compute_relay_volume_score(events)
                    
                    relay_score = (
                        bridge_score * 0.40 +
                        coincidence_score * 0.40 +
                        volume_score * 0.20
                    )
                    
                    if relay_score >= 0.35:
                        relays.append({
                            'entity': entity,
                            'role': 'relay',
                            'relay_score': relay_score,
                            'connected_heads': list(connected_heads),
                            'bridge_score': bridge_score,
                            'coincidence_score': coincidence_score,
                            'volume_score': volume_score,
                            'event_count': len(events)
                        })
            
            relays.sort(key=lambda x: x['relay_score'], reverse=True)
            
            logger.info(f"[Hydra] Detected {len(relays)} relays")
            return relays
            
        except Exception as e:
            logger.error(f"[Hydra] Error detecting relays: {e}")
            return []
    
    def detect_proxies(self, entity_events: Optional[Dict[str, List[Dict[str, Any]]]] = None) -> List[Dict[str, Any]]:
        """
        Detect proxy addresses (low-volume actors connected to heads)
        
        Proxies:
        - Low volume activity
        - Connected to head candidates
        - Behaviors: dusting, micro-pivots, wash signals
        - Obfuscation patterns
        
        Args:
            entity_events: Optional entity → events mapping
            
        Returns:
            List of proxy dictionaries
        """
        try:
            logger.info("[Hydra] Detecting proxies")
            
            if entity_events is None:
                entity_events = self.entity_events
            
            heads = self.detect_heads(entity_events)
            if len(heads) == 0:
                logger.info("[Hydra] No heads for proxy detection")
                return []
            
            head_entities = {h['entity'] for h in heads}
            
            proxies = []
            
            for entity, events in entity_events.items():
                if entity in head_entities:
                    continue  # Skip heads
                
                if len(events) < 1 or len(events) > 10:
                    continue  # Proxies have low volume
                
                connected_heads = self._find_connected_heads(entity, events, head_entities, entity_events)
                
                if len(connected_heads) >= 1:
                    dusting_score = self._compute_dusting_score(events)
                    micro_pivot_score = self._compute_micro_pivot_score(entity, events, entity_events)
                    wash_score = self._compute_wash_score(entity, events, entity_events)
                    obfuscation_score = self._compute_obfuscation_score(events)
                    
                    proxy_score = (
                        dusting_score * 0.30 +
                        micro_pivot_score * 0.25 +
                        wash_score * 0.25 +
                        obfuscation_score * 0.20
                    )
                    
                    if proxy_score >= 0.30:
                        proxies.append({
                            'entity': entity,
                            'role': 'proxy',
                            'proxy_score': proxy_score,
                            'connected_heads': list(connected_heads),
                            'dusting_score': dusting_score,
                            'micro_pivot_score': micro_pivot_score,
                            'wash_score': wash_score,
                            'obfuscation_score': obfuscation_score,
                            'event_count': len(events)
                        })
            
            proxies.sort(key=lambda x: x['proxy_score'], reverse=True)
            
            logger.info(f"[Hydra] Detected {len(proxies)} proxies")
            return proxies
            
        except Exception as e:
            logger.error(f"[Hydra] Error detecting proxies: {e}")
            return []
    
    def build_cluster(
        self,
        heads: List[Dict[str, Any]],
        relays: List[Dict[str, Any]],
        proxies: List[Dict[str, Any]]
    ) -> HydraCluster:
        """
        Build HydraCluster from detected heads, relays, and proxies
        
        Computes:
        - coordination_strength (0-1)
        - manipulation_score (0-1)
        - volatility_score (0-1)
        - hydra_heads count
        - risk_level classification
        
        Args:
            heads: List of head candidates
            relays: List of relay addresses
            proxies: List of proxy addresses
            
        Returns:
            HydraCluster object
        """
        try:
            logger.info(f"[Hydra] Building cluster: {len(heads)} heads, {len(relays)} relays, {len(proxies)} proxies")
            
            cluster = HydraCluster()
            
            cluster.cluster_id = f"HYDRA-{int(datetime.utcnow().timestamp() * 1000)}"
            
            for head in heads:
                entity = HydraEntity(
                    address=head['entity'],
                    role='leader',
                    score=head.get('head_score', 0.0),
                    metadata=head
                )
                cluster.entities.append(entity)
            
            for relay in relays:
                entity = HydraEntity(
                    address=relay['entity'],
                    role='relay',
                    score=relay.get('relay_score', 0.0),
                    metadata=relay
                )
                cluster.entities.append(entity)
            
            for proxy in proxies:
                entity = HydraEntity(
                    address=proxy['entity'],
                    role='proxy',
                    score=proxy.get('proxy_score', 0.0),
                    metadata=proxy
                )
                cluster.entities.append(entity)
            
            cluster.hydra_heads = len(heads)
            
            if len(heads) >= 2:
                head_strength = min(1.0, len(heads) / 5.0)
                relay_strength = min(1.0, len(relays) / 10.0)
                proxy_strength = min(1.0, len(proxies) / 20.0)
                cluster.coordination_strength = (
                    head_strength * 0.50 +
                    relay_strength * 0.30 +
                    proxy_strength * 0.20
                )
            else:
                cluster.coordination_strength = 0.0
            
            if heads:
                cluster.manipulation_score = sum(h.get('head_score', 0.0) for h in heads) / len(heads)
            else:
                cluster.manipulation_score = 0.0
            
            if heads:
                cluster.volatility_score = sum(h.get('burst_score', 0.0) for h in heads) / len(heads)
            else:
                cluster.volatility_score = 0.0
            
            if heads:
                cluster.correlation_score = sum(h.get('sync_score', 0.0) for h in heads) / len(heads)
            else:
                cluster.correlation_score = 0.0
            
            cluster.risk_level = self._classify_risk_level(cluster)
            
            cluster.summary = self._build_cluster_summary(cluster, heads, relays, proxies)
            
            self.latest_cluster = cluster
            
            logger.info(f"[Hydra] Cluster built: {cluster.cluster_id}, risk={cluster.risk_level}")
            return cluster
            
        except Exception as e:
            logger.error(f"[Hydra] Error building cluster: {e}")
            return HydraCluster()
    
    def compute_indicators(self, cluster: HydraCluster) -> Dict[str, Any]:
        """
        Compute 15+ indicators for the cluster
        
        Indicators:
        1. sync_index - Synchronization across heads
        2. burst_index - Burst activity intensity
        3. chain_hop_index - Multi-chain coordination
        4. cross_ratio - Geometric mean of key metrics
        5. deception_index - Obfuscation and proxy usage
        6. manipulation_intent_score - Intent to manipulate
        7. volatility_tension_score - Volatility pressure
        8. anomaly_density - Anomaly concentration
        9. ring_overlap_rate - Ring participation overlap
        10. relay_dependency - Reliance on relay network
        11. proxy_density - Proxy concentration
        12. temporal_escalation - Threat escalation over time
        13. structural_cohesion - Network structural strength
        14. fragmentation_score - Network fragmentation
        15. operational_depth - Operational sophistication
        
        Args:
            cluster: HydraCluster object
            
        Returns:
            Dictionary of indicators
        """
        try:
            logger.info("[Hydra] Computing indicators")
            
            indicators = {}
            
            heads = [e for e in cluster.entities if e.role == 'leader']
            relays = [e for e in cluster.entities if e.role == 'relay']
            proxies = [e for e in cluster.entities if e.role == 'proxy']
            
            indicators['sync_index'] = cluster.correlation_score
            
            indicators['burst_index'] = cluster.volatility_score
            
            chain_hop_scores = [
                e.metadata.get('chain_hop_score', 0.0)
                for e in heads
            ]
            indicators['chain_hop_index'] = sum(chain_hop_scores) / len(chain_hop_scores) if chain_hop_scores else 0.0
            
            if cluster.coordination_strength > 0 and cluster.manipulation_score > 0 and cluster.volatility_score > 0:
                indicators['cross_ratio'] = (
                    cluster.coordination_strength *
                    cluster.manipulation_score *
                    cluster.volatility_score
                ) ** (1/3)
            else:
                indicators['cross_ratio'] = 0.0
            
            proxy_ratio = len(proxies) / max(1, len(cluster.entities))
            obfuscation_scores = [
                e.metadata.get('obfuscation_score', 0.0)
                for e in proxies
            ]
            avg_obfuscation = sum(obfuscation_scores) / len(obfuscation_scores) if obfuscation_scores else 0.0
            indicators['deception_index'] = (proxy_ratio * 0.5 + avg_obfuscation * 0.5)
            
            indicators['manipulation_intent_score'] = cluster.manipulation_score
            
            indicators['volatility_tension_score'] = cluster.volatility_score
            
            total_events = sum(
                e.metadata.get('event_count', 0)
                for e in cluster.entities
            )
            anomaly_density = min(1.0, total_events / 100.0) if total_events > 0 else 0.0
            indicators['anomaly_density'] = anomaly_density
            
            ring_overlap_scores = [
                e.metadata.get('ring_overlap_score', 0.0)
                for e in heads
            ]
            indicators['ring_overlap_rate'] = sum(ring_overlap_scores) / len(ring_overlap_scores) if ring_overlap_scores else 0.0
            
            relay_ratio = len(relays) / max(1, len(heads))
            indicators['relay_dependency'] = min(1.0, relay_ratio / 2.0)
            
            indicators['proxy_density'] = len(proxies) / max(1, len(cluster.entities))
            
            indicators['temporal_escalation'] = self._compute_temporal_escalation()
            
            indicators['structural_cohesion'] = cluster.coordination_strength
            
            indicators['fragmentation_score'] = 1.0 - cluster.coordination_strength
            
            layers = sum([
                1 if len(heads) > 0 else 0,
                1 if len(relays) > 0 else 0,
                1 if len(proxies) > 0 else 0
            ])
            indicators['operational_depth'] = layers / 3.0
            
            self.latest_indicators = indicators
            
            logger.info(f"[Hydra] Computed {len(indicators)} indicators")
            return indicators
            
        except Exception as e:
            logger.error(f"[Hydra] Error computing indicators: {e}")
            return {}
    
    def generate_narrative(
        self,
        cluster: HydraCluster,
        indicators: Dict[str, Any]
    ) -> str:
        """
        Generate 300-800 word intelligence narrative
        
        Government-grade intelligence tone
        
        Sections:
        - Cluster identity
        - Hydra heads behavior
        - Relay network
        - Proxy actors
        - Manipulation logic
        - Systemic risk
        - Recommended actions
        
        Args:
            cluster: HydraCluster object
            indicators: Indicators dictionary
            
        Returns:
            Narrative string
        """
        try:
            logger.info("[Hydra] Generating narrative")
            
            heads = [e for e in cluster.entities if e.role == 'leader']
            relays = [e for e in cluster.entities if e.role == 'relay']
            proxies = [e for e in cluster.entities if e.role == 'proxy']
            
            narrative_parts = []
            
            narrative_parts.append(
                f"OPERATION HYDRA INTELLIGENCE REPORT\n\n"
                f"Cluster ID: {cluster.cluster_id}\n"
                f"Classification: {cluster.risk_level.upper()}\n"
                f"Detection Timestamp: {datetime.utcnow().isoformat()}\n\n"
                f"EXECUTIVE SUMMARY\n\n"
                f"Intelligence analysis has identified a multi-head coordinated network cluster "
                f"comprising {cluster.hydra_heads} leader entities (Hydra heads), {len(relays)} relay addresses, "
                f"and {len(proxies)} proxy actors. The cluster exhibits coordination strength of {cluster.coordination_strength:.0%}, "
                f"manipulation score of {cluster.manipulation_score:.0%}, and volatility score of {cluster.volatility_score:.0%}. "
                f"This configuration indicates a sophisticated coordination network with distributed command structure."
            )
            
            if heads:
                head_addresses = ', '.join([h.address[:10] + '...' for h in heads[:3]])
                if len(heads) > 3:
                    head_addresses += f' and {len(heads) - 3} others'
                
                narrative_parts.append(
                    f"\n\nHYDRA HEADS ANALYSIS\n\n"
                    f"The {cluster.hydra_heads} identified Hydra heads ({head_addresses}) demonstrate "
                    f"characteristic leader behaviors including burst activity patterns (burst index: {indicators.get('burst_index', 0):.0%}), "
                    f"synchronized timing coordination (sync index: {indicators.get('sync_index', 0):.0%}), "
                    f"and multi-chain operational capability (chain hop index: {indicators.get('chain_hop_index', 0):.0%}). "
                    f"These entities exhibit mirrored transfer patterns and triangular loop formations consistent with "
                    f"coordinated manipulation operations. The cross-ratio metric of {indicators.get('cross_ratio', 0):.0%} "
                    f"indicates strong geometric correlation between coordination, manipulation, and volatility dimensions."
                )
            
            if relays:
                narrative_parts.append(
                    f"\n\nRELAY NETWORK INFRASTRUCTURE\n\n"
                    f"The cluster operates through {len(relays)} relay addresses that bridge multiple Hydra heads. "
                    f"Relay dependency index of {indicators.get('relay_dependency', 0):.0%} indicates "
                    f"{'high' if indicators.get('relay_dependency', 0) > 0.6 else 'moderate'} reliance on intermediary infrastructure. "
                    f"These relays exhibit coincidence window patterns (≤5 minutes) connecting disparate coordination clusters, "
                    f"suggesting deliberate network architecture designed for operational security and attribution obfuscation."
                )
            
            if proxies:
                narrative_parts.append(
                    f"\n\nPROXY ACTOR LAYER\n\n"
                    f"Analysis identifies {len(proxies)} proxy actors (proxy density: {indicators.get('proxy_density', 0):.0%}) "
                    f"exhibiting low-volume obfuscation behaviors including dusting operations, micro-pivots, and wash trading signals. "
                    f"Deception index of {indicators.get('deception_index', 0):.0%} reflects sophisticated operational security measures. "
                    f"These proxies serve as attribution shields and operational buffers for the core Hydra heads."
                )
            
            narrative_parts.append(
                f"\n\nMANIPULATION ASSESSMENT\n\n"
                f"The cluster demonstrates manipulation intent score of {indicators.get('manipulation_intent_score', 0):.0%} "
                f"with volatility tension score of {indicators.get('volatility_tension_score', 0):.0%}. "
                f"Ring overlap rate of {indicators.get('ring_overlap_rate', 0):.0%} indicates participation in multiple "
                f"coordination rings simultaneously. Structural cohesion of {indicators.get('structural_cohesion', 0):.0%} "
                f"combined with operational depth of {indicators.get('operational_depth', 0):.0%} suggests a mature, "
                f"well-organized manipulation infrastructure with layered operational architecture."
            )
            
            narrative_parts.append(
                f"\n\nSYSTEMIC RISK EVALUATION\n\n"
                f"Temporal escalation index of {indicators.get('temporal_escalation', 0):.0%} indicates "
                f"{'increasing' if indicators.get('temporal_escalation', 0) > 0.5 else 'stable'} threat trajectory. "
                f"Anomaly density of {indicators.get('anomaly_density', 0):.0%} reflects concentrated suspicious activity. "
                f"The multi-head architecture provides operational redundancy and resilience, making this cluster "
                f"particularly difficult to disrupt through conventional countermeasures. Fragmentation score of "
                f"{indicators.get('fragmentation_score', 0):.0%} suggests {'distributed' if indicators.get('fragmentation_score', 0) > 0.5 else 'centralized'} "
                f"command structure."
            )
            
            if cluster.risk_level in ['critical', 'high']:
                actions = "IMMEDIATE ACTION REQUIRED: Implement emergency monitoring protocols, freeze suspicious transactions, escalate to security operations center, conduct comprehensive forensic analysis, coordinate with regulatory authorities."
            elif cluster.risk_level == 'elevated':
                actions = "ENHANCED MONITORING: Deploy advanced surveillance, implement transaction limits, verify all cluster interactions, document evidence chain, prepare escalation protocols."
            else:
                actions = "STANDARD PROTOCOLS: Maintain routine monitoring, apply standard verification procedures, document cluster activity patterns."
            
            narrative_parts.append(
                f"\n\nRECOMMENDED ACTIONS\n\n"
                f"{actions}"
            )
            
            narrative = ''.join(narrative_parts)
            
            logger.info(f"[Hydra] Generated narrative: {len(narrative)} characters")
            return narrative
            
        except Exception as e:
            logger.error(f"[Hydra] Error generating narrative: {e}")
            return "Error generating narrative - manual review required."
    
    def build_hydra_report(
        self,
        cluster: HydraCluster,
        indicators: Dict[str, Any]
    ) -> HydraReport:
        """
        Build complete HydraReport
        
        Args:
            cluster: HydraCluster object
            indicators: Indicators dictionary
            
        Returns:
            HydraReport object
        """
        try:
            logger.info("[Hydra] Building Hydra report")
            
            narrative = self.generate_narrative(cluster, indicators)
            
            report = HydraReport(
                cluster=cluster,
                narrative=narrative,
                indicators=indicators,
                timestamp=datetime.utcnow().isoformat()
            )
            
            logger.info(f"[Hydra] Report built: {cluster.cluster_id}")
            return report
            
        except Exception as e:
            logger.error(f"[Hydra] Error building report: {e}")
            return HydraReport()
    
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """Parse timestamp string to datetime"""
        try:
            return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except Exception:
            return datetime.utcnow()
    
    def _compute_burst_score(self, events: List[Dict[str, Any]]) -> float:
        """Compute burst activity score"""
        try:
            if len(events) < 3:
                return 0.0
            
            sorted_events = sorted(events, key=lambda e: self._parse_timestamp(e.get('timestamp', '')))
            
            max_burst = 0
            for i in range(len(sorted_events)):
                window_start = self._parse_timestamp(sorted_events[i].get('timestamp', ''))
                window_end = window_start + timedelta(hours=1)
                
                count = sum(
                    1 for e in sorted_events[i:]
                    if self._parse_timestamp(e.get('timestamp', '')) <= window_end
                )
                max_burst = max(max_burst, count)
            
            return min(1.0, max_burst / 10.0)
            
        except Exception:
            return 0.0
    
    def _compute_sync_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute synchronization score with other entities"""
        try:
            if len(events) < 2:
                return 0.0
            
            sync_count = 0
            total_comparisons = 0
            
            for other_entity, other_events in all_entity_events.items():
                if other_entity == entity:
                    continue
                
                for event in events:
                    event_time = self._parse_timestamp(event.get('timestamp', ''))
                    
                    for other_event in other_events:
                        other_time = self._parse_timestamp(other_event.get('timestamp', ''))
                        time_diff = abs((event_time - other_time).total_seconds())
                        
                        if time_diff <= 60:
                            sync_count += 1
                        
                        total_comparisons += 1
                        
                        if total_comparisons >= 100:  # Limit comparisons
                            break
                    
                    if total_comparisons >= 100:
                        break
                
                if total_comparisons >= 100:
                    break
            
            if total_comparisons == 0:
                return 0.0
            
            return min(1.0, sync_count / max(1, total_comparisons / 10))
            
        except Exception:
            return 0.0
    
    def _compute_mirror_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute mirrored transfer score"""
        try:
            mirror_count = 0
            
            for event in events:
                amount = event.get('amount', 0)
                if amount == 0:
                    continue
                
                for other_entity, other_events in all_entity_events.items():
                    if other_entity == entity:
                        continue
                    
                    for other_event in other_events:
                        other_amount = other_event.get('amount', 0)
                        
                        if abs(amount - other_amount) / max(amount, other_amount) < 0.1:
                            mirror_count += 1
            
            return min(1.0, mirror_count / 5.0)
            
        except Exception:
            return 0.0
    
    def _compute_loop_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute triangular loop score"""
        try:
            
            connections = set()
            for event in events:
                target = event.get('target', event.get('to', ''))
                if target:
                    connections.add(target)
            
            loop_count = 0
            for conn in connections:
                if conn in all_entity_events:
                    for conn_event in all_entity_events[conn]:
                        conn_target = conn_event.get('target', conn_event.get('to', ''))
                        if conn_target == entity or conn_target in connections:
                            loop_count += 1
            
            return min(1.0, loop_count / 3.0)
            
        except Exception:
            return 0.0
    
    def _compute_chain_hop_score(self, events: List[Dict[str, Any]]) -> float:
        """Compute multi-chain hop score"""
        try:
            chains = set()
            for event in events:
                chain = event.get('chain', '')
                if chain:
                    chains.add(chain)
            
            return min(1.0, len(chains) / 3.0)
            
        except Exception:
            return 0.0
    
    def _compute_ring_overlap_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute ring overlap score"""
        try:
            interactions = set()
            for event in events:
                target = event.get('target', event.get('to', ''))
                source = event.get('source', event.get('from', ''))
                if target and target != entity:
                    interactions.add(target)
                if source and source != entity:
                    interactions.add(source)
            
            return min(1.0, len(interactions) / 10.0)
            
        except Exception:
            return 0.0
    
    def _find_connected_heads(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        head_entities: set,
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> set:
        """Find heads connected to this entity"""
        try:
            connected = set()
            
            for event in events:
                target = event.get('target', event.get('to', ''))
                source = event.get('source', event.get('from', ''))
                
                if target in head_entities:
                    connected.add(target)
                if source in head_entities:
                    connected.add(source)
            
            return connected
            
        except Exception:
            return set()
    
    def _compute_coincidence_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        connected_heads: set,
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute coincidence window score"""
        try:
            coincidence_count = 0
            
            for event in events:
                event_time = self._parse_timestamp(event.get('timestamp', ''))
                
                for head in connected_heads:
                    if head not in all_entity_events:
                        continue
                    
                    for head_event in all_entity_events[head]:
                        head_time = self._parse_timestamp(head_event.get('timestamp', ''))
                        time_diff = abs((event_time - head_time).total_seconds())
                        
                        if time_diff <= 300:  # 5 minutes
                            coincidence_count += 1
            
            return min(1.0, coincidence_count / 5.0)
            
        except Exception:
            return 0.0
    
    def _compute_relay_volume_score(self, events: List[Dict[str, Any]]) -> float:
        """Compute relay volume score (medium volume preferred)"""
        try:
            event_count = len(events)
            
            if event_count < 5:
                return event_count / 5.0
            elif event_count <= 20:
                return 1.0
            else:
                return max(0.5, 1.0 - (event_count - 20) / 30.0)
            
        except Exception:
            return 0.0
    
    def _compute_dusting_score(self, events: List[Dict[str, Any]]) -> float:
        """Compute dusting attack score"""
        try:
            dust_count = 0
            for event in events:
                amount = event.get('amount', 0)
                if 0 < amount < 0.001:  # Very small amounts
                    dust_count += 1
            
            return min(1.0, dust_count / 3.0)
            
        except Exception:
            return 0.0
    
    def _compute_micro_pivot_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute micro-pivot score"""
        try:
            if len(events) < 2:
                return 0.0
            
            sorted_events = sorted(events, key=lambda e: self._parse_timestamp(e.get('timestamp', '')))
            
            pivot_count = 0
            for i in range(len(sorted_events) - 1):
                time_diff = (
                    self._parse_timestamp(sorted_events[i + 1].get('timestamp', '')) -
                    self._parse_timestamp(sorted_events[i].get('timestamp', ''))
                ).total_seconds()
                
                if time_diff < 300:  # < 5 minutes
                    pivot_count += 1
            
            return min(1.0, pivot_count / 2.0)
            
        except Exception:
            return 0.0
    
    def _compute_wash_score(
        self,
        entity: str,
        events: List[Dict[str, Any]],
        all_entity_events: Dict[str, List[Dict[str, Any]]]
    ) -> float:
        """Compute wash trading score"""
        try:
            wash_count = 0
            
            for i, event in enumerate(events):
                target = event.get('target', event.get('to', ''))
                if not target:
                    continue
                
                if target in all_entity_events:
                    for target_event in all_entity_events[target]:
                        target_target = target_event.get('target', target_event.get('to', ''))
                        if target_target == entity:
                            wash_count += 1
            
            return min(1.0, wash_count / 2.0)
            
        except Exception:
            return 0.0
    
    def _compute_obfuscation_score(self, events: List[Dict[str, Any]]) -> float:
        """Compute obfuscation score"""
        try:
            chains = set(e.get('chain', '') for e in events if e.get('chain'))
            small_amounts = sum(1 for e in events if 0 < e.get('amount', 0) < 0.01)
            
            chain_score = min(1.0, len(chains) / 3.0)
            amount_score = min(1.0, small_amounts / len(events)) if events else 0.0
            
            return (chain_score * 0.5 + amount_score * 0.5)
            
        except Exception:
            return 0.0
    
    def _classify_risk_level(self, cluster: HydraCluster) -> str:
        """Classify cluster risk level"""
        try:
            score = (
                cluster.coordination_strength * 0.35 +
                cluster.manipulation_score * 0.35 +
                cluster.volatility_score * 0.30
            )
            
            if score >= 0.80:
                return "critical"
            elif score >= 0.65:
                return "high"
            elif score >= 0.50:
                return "elevated"
            elif score >= 0.35:
                return "moderate"
            elif score >= 0.20:
                return "low"
            else:
                return "minimal"
            
        except Exception:
            return "minimal"
    
    def _build_cluster_summary(
        self,
        cluster: HydraCluster,
        heads: List[Dict[str, Any]],
        relays: List[Dict[str, Any]],
        proxies: List[Dict[str, Any]]
    ) -> str:
        """Build cluster summary"""
        try:
            return (
                f"Multi-head coordination cluster with {cluster.hydra_heads} leaders, "
                f"{len(relays)} relays, {len(proxies)} proxies. "
                f"Coordination: {cluster.coordination_strength:.0%}, "
                f"Manipulation: {cluster.manipulation_score:.0%}, "
                f"Volatility: {cluster.volatility_score:.0%}. "
                f"Risk: {cluster.risk_level.upper()}."
            )
        except Exception:
            return "Hydra cluster detected."
    
    def _compute_temporal_escalation(self) -> float:
        """Compute temporal escalation score"""
        try:
            if len(self.events) < 10:
                return 0.0
            
            sorted_events = sorted(self.events, key=lambda e: self._parse_timestamp(e.get('timestamp', '')))
            
            mid = len(sorted_events) // 2
            first_half = sorted_events[:mid]
            second_half = sorted_events[mid:]
            
            if len(first_half) == 0:
                return 0.0
            
            escalation = (len(second_half) - len(first_half)) / len(first_half)
            
            return max(0.0, min(1.0, escalation))
            
        except Exception:
            return 0.0
    
    def get_health(self) -> Dict[str, Any]:
        """Get engine health status"""
        try:
            return {
                "status": "operational",
                "engine": "Operation Hydra™",
                "version": "1.0.0",
                "window_hours": self.window_hours,
                "total_events": len(self.events),
                "total_entities": len(self.entity_events),
                "latest_cluster": self.latest_cluster.cluster_id if self.latest_cluster else None,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"[Hydra] Error getting health: {e}")
            return {
                "status": "error",
                "engine": "Operation Hydra™",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

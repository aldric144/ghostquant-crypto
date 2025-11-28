"""
Cross-Entity Behavioral Correlation Engine (CEBCE)
Detects coordinated actors, swarms, and synchronized multi-entity behavior.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone, timedelta
from itertools import combinations


class CrossEntityCorrelationEngine:
    """
    Cross-Entity Behavioral Correlation Engine for detecting coordinated behavior.
    Analyzes timing, transaction patterns, and behavioral DNA to identify synchronized entities.
    """
    
    def __init__(self, time_window_hours: int = 24):
        """
        Initialize the Cross-Entity Correlation Engine.
        
        Args:
            time_window_hours: Time window for event retention (default: 24 hours)
        """
        try:
            print(f"[CEBCE] Initializing with {time_window_hours} hour time window")
            self.time_window_hours = time_window_hours
            self.event_buffer: Dict[str, List[Dict[str, Any]]] = {}
            self.last_purge_time = datetime.now(timezone.utc)
            print("[CEBCE] Initialized successfully")
        except Exception as e:
            print(f"[CEBCE] Error in __init__: {e}")
            self.time_window_hours = 24
            self.event_buffer = {}
            self.last_purge_time = datetime.now(timezone.utc)
    
    def add_event(self, event: Dict[str, Any]) -> bool:
        """
        Add an event to the entity buffer.
        
        Args:
            event: Event dictionary with entity address and event data
            
        Returns:
            True if event was added successfully, False otherwise
        """
        try:
            address = event.get('address') or event.get('entity_address') or event.get('wallet')
            
            if not address:
                print("[CEBCE] Warning: Event missing address")
                return False
            
            address = str(address).lower().strip()
            
            timestamp = event.get('timestamp')
            if isinstance(timestamp, str):
                try:
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                except Exception:
                    timestamp = datetime.now(timezone.utc)
            elif isinstance(timestamp, (int, float)):
                timestamp = datetime.fromtimestamp(timestamp, tz=timezone.utc)
            else:
                timestamp = datetime.now(timezone.utc)
            
            event_record = {
                'timestamp': timestamp,
                'timestamp_unix': int(timestamp.timestamp()),
                'address': address,
                'value': self._safe_float(event.get('value', 0)),
                'chain': str(event.get('chain', 'unknown')),
                'token': str(event.get('token', 'unknown')),
                'type': str(event.get('type', 'unknown')),
                'direction': str(event.get('direction', 'unknown')),
                'metadata': event.get('metadata', {})
            }
            
            if address not in self.event_buffer:
                self.event_buffer[address] = []
            
            self.event_buffer[address].append(event_record)
            
            self._auto_purge()
            
            return True
            
        except Exception as e:
            print(f"[CEBCE] Error adding event: {e}")
            return False
    
    def compute_pair_correlation(self, addrA: str, addrB: str) -> Dict[str, Any]:
        """
        Compute correlation score between two entities.
        
        Args:
            addrA: First entity address
            addrB: Second entity address
            
        Returns:
            Dictionary with correlation score and alignment metrics
        """
        try:
            print(f"[CEBCE] Computing pair correlation: {addrA[:10]}... vs {addrB[:10]}...")
            
            addrA = str(addrA).lower().strip()
            addrB = str(addrB).lower().strip()
            
            eventsA = self.event_buffer.get(addrA, [])
            eventsB = self.event_buffer.get(addrB, [])
            
            if not eventsA or not eventsB:
                return {
                    'success': False,
                    'correlation_score': 0.0,
                    'error': 'Insufficient events for correlation'
                }
            
            eventsA = sorted(eventsA, key=lambda e: e['timestamp'])
            eventsB = sorted(eventsB, key=lambda e: e['timestamp'])
            
            timing_similarity = self._compute_timing_similarity(eventsA, eventsB)
            size_similarity = self._compute_size_similarity(eventsA, eventsB)
            directional_similarity = self._compute_directional_similarity(eventsA, eventsB)
            chain_alignment = self._compute_chain_alignment(eventsA, eventsB)
            token_overlap = self._compute_token_overlap(eventsA, eventsB)
            burst_pattern_match = self._compute_burst_pattern_match(eventsA, eventsB)
            
            correlation_score = (
                timing_similarity * 0.25 +
                size_similarity * 0.15 +
                directional_similarity * 0.15 +
                chain_alignment * 0.15 +
                token_overlap * 0.15 +
                burst_pattern_match * 0.15
            )
            
            correlation_score = max(0.0, min(1.0, correlation_score))
            
            result = {
                'success': True,
                'addressA': addrA,
                'addressB': addrB,
                'correlation_score': correlation_score,
                'components': {
                    'timing_similarity': timing_similarity,
                    'size_similarity': size_similarity,
                    'directional_similarity': directional_similarity,
                    'chain_alignment': chain_alignment,
                    'token_overlap': token_overlap,
                    'burst_pattern_match': burst_pattern_match
                },
                'coordinated_flag': correlation_score >= 0.65,
                'events_analyzed': {
                    'addressA': len(eventsA),
                    'addressB': len(eventsB)
                }
            }
            
            print(f"[CEBCE] Pair correlation: {correlation_score:.3f}")
            return result
            
        except Exception as e:
            print(f"[CEBCE] Error computing pair correlation: {e}")
            return {
                'success': False,
                'correlation_score': 0.0,
                'error': str(e)
            }
    
    def compute_group_correlation(self, addresses: List[str]) -> Dict[str, Any]:
        """
        Compute correlation for a group of entities.
        
        Args:
            addresses: List of entity addresses
            
        Returns:
            Dictionary with group correlation metrics
        """
        try:
            print(f"[CEBCE] Computing group correlation for {len(addresses)} entities")
            
            if len(addresses) < 2:
                return {
                    'success': False,
                    'error': 'Need at least 2 addresses for group correlation'
                }
            
            addresses = [str(addr).lower().strip() for addr in addresses]
            
            pair_scores = []
            pair_details = []
            
            for addrA, addrB in combinations(addresses, 2):
                result = self.compute_pair_correlation(addrA, addrB)
                if result.get('success', False):
                    score = result['correlation_score']
                    pair_scores.append(score)
                    pair_details.append({
                        'addressA': addrA,
                        'addressB': addrB,
                        'score': score
                    })
            
            if not pair_scores:
                return {
                    'success': False,
                    'error': 'No valid pair correlations computed'
                }
            
            avg_score = sum(pair_scores) / len(pair_scores)
            max_score = max(pair_scores)
            min_score = min(pair_scores)
            
            coordinated_flag = avg_score >= 0.65
            
            if avg_score >= 0.80:
                risk_level = 'CRITICAL'
            elif avg_score >= 0.65:
                risk_level = 'HIGH'
            elif avg_score >= 0.50:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'
            
            summary = f"Group of {len(addresses)} entities with average correlation {avg_score:.3f}. "
            if coordinated_flag:
                summary += "COORDINATED ACTOR BEHAVIOR DETECTED. "
            summary += f"Risk level: {risk_level}."
            
            result = {
                'success': True,
                'group_size': len(addresses),
                'addresses': addresses,
                'avg_correlation': avg_score,
                'max_correlation': max_score,
                'min_correlation': min_score,
                'coordinated_actor_flag': coordinated_flag,
                'risk_level': risk_level,
                'summary': summary,
                'pair_count': len(pair_scores),
                'pair_details': pair_details
            }
            
            print(f"[CEBCE] Group correlation: {avg_score:.3f} (risk: {risk_level})")
            return result
            
        except Exception as e:
            print(f"[CEBCE] Error computing group correlation: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def find_synchronized_clusters(self) -> Dict[str, Any]:
        """
        Find synchronized clusters of entities with high correlation.
        
        Returns:
            Dictionary with detected clusters
        """
        try:
            print("[CEBCE] Finding synchronized clusters...")
            
            all_addresses = list(self.event_buffer.keys())
            
            if len(all_addresses) < 3:
                return {
                    'success': True,
                    'clusters': [],
                    'message': 'Insufficient entities for cluster detection (need >= 3)'
                }
            
            correlation_matrix = {}
            for addrA, addrB in combinations(all_addresses, 2):
                result = self.compute_pair_correlation(addrA, addrB)
                if result.get('success', False):
                    score = result['correlation_score']
                    if score >= 0.55:  # Threshold for cluster membership
                        key = tuple(sorted([addrA, addrB]))
                        correlation_matrix[key] = score
            
            clusters = self._build_clusters_from_correlations(correlation_matrix, all_addresses)
            
            valid_clusters = [c for c in clusters if len(c['members']) >= 3]
            
            enriched_clusters = []
            for cluster in valid_clusters:
                enriched = self._enrich_cluster(cluster)
                enriched_clusters.append(enriched)
            
            result = {
                'success': True,
                'cluster_count': len(enriched_clusters),
                'clusters': enriched_clusters,
                'total_entities_scanned': len(all_addresses),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            print(f"[CEBCE] Found {len(enriched_clusters)} synchronized clusters")
            return result
            
        except Exception as e:
            print(f"[CEBCE] Error finding synchronized clusters: {e}")
            return {
                'success': False,
                'error': str(e),
                'clusters': []
            }
    
    def summarize_entity(self, address: str) -> Dict[str, Any]:
        """
        Build comprehensive summary for an entity.
        
        Args:
            address: Entity address
            
        Returns:
            Dictionary with entity summary
        """
        try:
            print(f"[CEBCE] Summarizing entity {address[:10]}...")
            
            address = str(address).lower().strip()
            
            events = self.event_buffer.get(address, [])
            
            if not events:
                return {
                    'success': False,
                    'error': f'No events found for {address}'
                }
            
            events = sorted(events, key=lambda e: e['timestamp'])
            
            num_events = len(events)
            values = [e['value'] for e in events]
            avg_value = sum(values) / len(values) if values else 0
            
            chains = list(set(e['chain'] for e in events))
            tokens = list(set(e['token'] for e in events))
            
            first_seen = events[0]['timestamp']
            last_seen = events[-1]['timestamp']
            time_span = (last_seen - first_seen).total_seconds() / 3600.0  # hours
            
            activity_density = num_events / max(time_span, 0.1) if time_span > 0 else 0
            
            summary = {
                'success': True,
                'address': address,
                'num_events': num_events,
                'avg_event_value': avg_value,
                'chains_used': chains,
                'chain_count': len(chains),
                'token_footprint': tokens,
                'token_count': len(tokens),
                'first_seen': first_seen.isoformat(),
                'last_seen': last_seen.isoformat(),
                'time_span_hours': time_span,
                'activity_density': activity_density,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            print(f"[CEBCE] Entity summary: {num_events} events, {len(chains)} chains")
            return summary
            
        except Exception as e:
            print(f"[CEBCE] Error summarizing entity: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def purge_old_events(self) -> int:
        """
        Remove events older than the time window.
        
        Returns:
            Number of events purged
        """
        try:
            print("[CEBCE] Purging old events...")
            
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.time_window_hours)
            total_purged = 0
            
            for address in list(self.event_buffer.keys()):
                events = self.event_buffer[address]
                
                filtered_events = [
                    e for e in events
                    if e['timestamp'] >= cutoff_time
                ]
                
                purged_count = len(events) - len(filtered_events)
                total_purged += purged_count
                
                if filtered_events:
                    self.event_buffer[address] = filtered_events
                else:
                    del self.event_buffer[address]
            
            self.last_purge_time = datetime.now(timezone.utc)
            
            if total_purged > 0:
                print(f"[CEBCE] Purged {total_purged} old events")
            
            return total_purged
            
        except Exception as e:
            print(f"[CEBCE] Error purging events: {e}")
            return 0
    
    def export_state(self) -> Dict[str, Any]:
        """
        Export engine state as JSON-serializable snapshot.
        
        Returns:
            Dictionary with engine state
        """
        try:
            print("[CEBCE] Exporting state...")
            
            serializable_buffer = {}
            for address, events in self.event_buffer.items():
                serializable_events = []
                for event in events:
                    serializable_event = event.copy()
                    serializable_event['timestamp'] = event['timestamp'].isoformat()
                    serializable_events.append(serializable_event)
                serializable_buffer[address] = serializable_events
            
            state = {
                'time_window_hours': self.time_window_hours,
                'entity_count': len(self.event_buffer),
                'total_events': sum(len(events) for events in self.event_buffer.values()),
                'event_buffer': serializable_buffer,
                'last_purge_time': self.last_purge_time.isoformat(),
                'export_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            print(f"[CEBCE] State exported: {state['entity_count']} entities, {state['total_events']} events")
            return state
            
        except Exception as e:
            print(f"[CEBCE] Error exporting state: {e}")
            return {
                'error': str(e),
                'export_timestamp': datetime.now(timezone.utc).isoformat()
            }
    
    
    def _auto_purge(self) -> None:
        """Automatically purge old events if enough time has passed."""
        try:
            time_since_purge = datetime.now(timezone.utc) - self.last_purge_time
            if time_since_purge.total_seconds() > 600:  # 10 minutes
                self.purge_old_events()
        except Exception as e:
            print(f"[CEBCE] Error in auto-purge: {e}")
    
    def _safe_float(self, value: Any, default: float = 0.0) -> float:
        """Safely convert value to float."""
        try:
            return float(value) if value is not None else default
        except (ValueError, TypeError):
            return default
    
    def _compute_timing_similarity(self, eventsA: List[Dict], eventsB: List[Dict]) -> float:
        """Compute timing similarity between two event sequences."""
        try:
            timestampsA = [e['timestamp_unix'] for e in eventsA]
            timestampsB = [e['timestamp_unix'] for e in eventsB]
            
            overlap_count = 0
            window = 300  # 5 minutes in seconds
            
            for tsA in timestampsA:
                for tsB in timestampsB:
                    if abs(tsA - tsB) <= window:
                        overlap_count += 1
                        break
            
            min_events = min(len(eventsA), len(eventsB))
            similarity = overlap_count / max(min_events, 1)
            
            return min(1.0, similarity)
            
        except Exception as e:
            print(f"[CEBCE] Error computing timing similarity: {e}")
            return 0.0
    
    def _compute_size_similarity(self, eventsA: List[Dict], eventsB: List[Dict]) -> float:
        """Compute transaction size similarity."""
        try:
            valuesA = [e['value'] for e in eventsA if e['value'] > 0]
            valuesB = [e['value'] for e in eventsB if e['value'] > 0]
            
            if not valuesA or not valuesB:
                return 0.0
            
            avgA = sum(valuesA) / len(valuesA)
            avgB = sum(valuesB) / len(valuesB)
            
            max_avg = max(avgA, avgB)
            if max_avg == 0:
                return 1.0
            
            diff = abs(avgA - avgB) / max_avg
            similarity = 1.0 - diff
            
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            print(f"[CEBCE] Error computing size similarity: {e}")
            return 0.0
    
    def _compute_directional_similarity(self, eventsA: List[Dict], eventsB: List[Dict]) -> float:
        """Compute directional similarity."""
        try:
            directionsA = [e.get('direction', 'unknown') for e in eventsA]
            directionsB = [e.get('direction', 'unknown') for e in eventsB]
            
            matches = sum(1 for d in directionsA if d in directionsB and d != 'unknown')
            
            min_events = min(len(eventsA), len(eventsB))
            similarity = matches / max(min_events, 1)
            
            return min(1.0, similarity)
            
        except Exception as e:
            print(f"[CEBCE] Error computing directional similarity: {e}")
            return 0.0
    
    def _compute_chain_alignment(self, eventsA: List[Dict], eventsB: List[Dict]) -> float:
        """Compute chain alignment score."""
        try:
            chainsA = set(e['chain'] for e in eventsA)
            chainsB = set(e['chain'] for e in eventsB)
            
            intersection = len(chainsA & chainsB)
            union = len(chainsA | chainsB)
            
            if union == 0:
                return 0.0
            
            return intersection / union
            
        except Exception as e:
            print(f"[CEBCE] Error computing chain alignment: {e}")
            return 0.0
    
    def _compute_token_overlap(self, eventsA: List[Dict], eventsB: List[Dict]) -> float:
        """Compute token overlap score."""
        try:
            tokensA = set(e['token'] for e in eventsA)
            tokensB = set(e['token'] for e in eventsB)
            
            intersection = len(tokensA & tokensB)
            union = len(tokensA | tokensB)
            
            if union == 0:
                return 0.0
            
            return intersection / union
            
        except Exception as e:
            print(f"[CEBCE] Error computing token overlap: {e}")
            return 0.0
    
    def _compute_burst_pattern_match(self, eventsA: List[Dict], eventsB: List[Dict]) -> float:
        """Compute burst pattern matching score."""
        try:
            burstsA = self._detect_bursts(eventsA)
            burstsB = self._detect_bursts(eventsB)
            
            if not burstsA or not burstsB:
                return 0.0
            
            overlap_count = 0
            window = 600  # 10 minutes
            
            for burstA in burstsA:
                for burstB in burstsB:
                    if abs(burstA - burstB) <= window:
                        overlap_count += 1
                        break
            
            min_bursts = min(len(burstsA), len(burstsB))
            similarity = overlap_count / max(min_bursts, 1)
            
            return min(1.0, similarity)
            
        except Exception as e:
            print(f"[CEBCE] Error computing burst pattern match: {e}")
            return 0.0
    
    def _detect_bursts(self, events: List[Dict]) -> List[int]:
        """Detect burst periods in event sequence."""
        try:
            if len(events) < 3:
                return []
            
            bursts = []
            window = 600  # 10 minutes
            
            for i in range(len(events) - 2):
                ts1 = events[i]['timestamp_unix']
                ts2 = events[i + 1]['timestamp_unix']
                ts3 = events[i + 2]['timestamp_unix']
                
                if ts3 - ts1 <= window:
                    bursts.append(ts1)
            
            return bursts
            
        except Exception:
            return []
    
    def _build_clusters_from_correlations(self, correlation_matrix: Dict, all_addresses: List[str]) -> List[Dict]:
        """Build clusters using connected components algorithm."""
        try:
            adjacency = {addr: set() for addr in all_addresses}
            
            for (addrA, addrB), score in correlation_matrix.items():
                adjacency[addrA].add(addrB)
                adjacency[addrB].add(addrA)
            
            visited = set()
            clusters = []
            
            for address in all_addresses:
                if address not in visited:
                    cluster = self._dfs_cluster(address, adjacency, visited)
                    if len(cluster) >= 2:  # At least 2 members
                        clusters.append({
                            'members': list(cluster),
                            'size': len(cluster)
                        })
            
            return clusters
            
        except Exception as e:
            print(f"[CEBCE] Error building clusters: {e}")
            return []
    
    def _dfs_cluster(self, start: str, adjacency: Dict, visited: set) -> set:
        """Depth-first search to find connected component."""
        cluster = set()
        stack = [start]
        
        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                cluster.add(node)
                stack.extend(adjacency[node] - visited)
        
        return cluster
    
    def _enrich_cluster(self, cluster: Dict) -> Dict:
        """Enrich cluster with metadata."""
        try:
            members = cluster['members']
            
            pair_scores = []
            for addrA, addrB in combinations(members, 2):
                result = self.compute_pair_correlation(addrA, addrB)
                if result.get('success', False):
                    pair_scores.append(result['correlation_score'])
            
            avg_correlation = sum(pair_scores) / len(pair_scores) if pair_scores else 0.0
            
            if avg_correlation >= 0.80:
                risk_level = 'CRITICAL'
            elif avg_correlation >= 0.65:
                risk_level = 'HIGH'
            elif avg_correlation >= 0.55:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'
            
            enriched = {
                'cluster_id': f"cluster_{hash(tuple(sorted(members))) % 10000:04d}",
                'size': len(members),
                'members': members,
                'avg_correlation': avg_correlation,
                'risk_level': risk_level,
                'coordinated_flag': avg_correlation >= 0.65
            }
            
            return enriched
            
        except Exception as e:
            print(f"[CEBCE] Error enriching cluster: {e}")
            return cluster

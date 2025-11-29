"""
Global Manipulation Radar Heatmap (GMRH) - Real-time manipulation risk visualization.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
import time


class GlobalRadarEngine:
    """
    Global Manipulation Radar Engine.
    Provides real-time heatmap visualization of manipulation risk across chains, entities, tokens, and networks.
    """
    
    def __init__(self):
        """Initialize the Global Radar Engine."""
        try:
            print("[GlobalRadar] Initializing Global Manipulation Radar Engine")
            
            self.events = []  # List of all ingested events
            self.chain_scores = {}  # Chain -> risk score
            self.entity_scores = {}  # Entity -> risk score
            self.token_scores = {}  # Token -> risk score
            self.network_scores = {}  # Network -> risk score
            self.clusters = []  # List of detected clusters
            
            self.last_update = datetime.now(timezone.utc)
            self.total_events_ingested = 0
            
            self.thresholds = {
                "critical": 0.90,
                "high": 0.70,
                "moderate": 0.40,
                "low": 0.15
            }
            
            print("[GlobalRadar] Initialized successfully")
            
        except Exception as e:
            print(f"[GlobalRadar] Error in __init__: {e}")
            self.events = []
            self.chain_scores = {}
            self.entity_scores = {}
            self.token_scores = {}
            self.network_scores = {}
            self.clusters = []
            self.last_update = datetime.now(timezone.utc)
            self.total_events_ingested = 0
            self.thresholds = {
                "critical": 0.90,
                "high": 0.70,
                "moderate": 0.40,
                "low": 0.15
            }
    
    def ingest_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingest new event and update radar state.
        
        Updates:
        - Chain counts and risk scores
        - Entity manipulation risk
        - Token volatility indicators
        - Cluster involvement
        - Chain pressure predictions
        - Behavioral anomalies
        - Ring probabilities
        
        Args:
            event: Event dictionary with metadata
            
        Returns:
            Success status and updated scores
        """
        try:
            print(f"[GlobalRadar] Ingesting event")
            
            if 'timestamp' not in event:
                event['timestamp'] = datetime.now(timezone.utc).isoformat()
            
            self.events.append(event)
            self.total_events_ingested += 1
            self.last_update = datetime.now(timezone.utc)
            
            chain = event.get('chain', 'unknown')
            entity = event.get('entity', event.get('address', 'unknown'))
            token = event.get('token', event.get('symbol', 'unknown'))
            network = event.get('network', self._infer_network(chain))
            
            manipulation_risk = self._safe_float(event.get('manipulation_risk', 0.3))
            volatility = self._safe_float(event.get('volatility', 0.3))
            ring_probability = self._safe_float(event.get('ring_probability', 0.2))
            chain_pressure = self._safe_float(event.get('chain_pressure', 0.3))
            anomaly_score = self._safe_float(event.get('anomaly_score', 0.2))
            
            event_risk = (
                manipulation_risk * 0.35 +
                volatility * 0.25 +
                ring_probability * 0.20 +
                chain_pressure * 0.10 +
                anomaly_score * 0.10
            )
            
            if chain in self.chain_scores:
                self.chain_scores[chain] = (
                    self.chain_scores[chain] * 0.7 + event_risk * 0.3
                )
            else:
                self.chain_scores[chain] = event_risk
            
            if entity in self.entity_scores:
                self.entity_scores[entity] = (
                    self.entity_scores[entity] * 0.7 + event_risk * 0.3
                )
            else:
                self.entity_scores[entity] = event_risk
            
            if token in self.token_scores:
                self.token_scores[token] = (
                    self.token_scores[token] * 0.7 + event_risk * 0.3
                )
            else:
                self.token_scores[token] = event_risk
            
            if network in self.network_scores:
                self.network_scores[network] = (
                    self.network_scores[network] * 0.7 + event_risk * 0.3
                )
            else:
                self.network_scores[network] = event_risk
            
            cluster_id = event.get('cluster_id')
            if cluster_id:
                self._update_cluster(cluster_id, entity, event_risk)
            
            result = {
                'success': True,
                'event_risk': event_risk,
                'chain_score': self.chain_scores.get(chain, 0.0),
                'entity_score': self.entity_scores.get(entity, 0.0),
                'token_score': self.token_scores.get(token, 0.0),
                'network_score': self.network_scores.get(network, 0.0),
                'total_events': self.total_events_ingested
            }
            
            print(f"[GlobalRadar] Event ingested: risk={event_risk:.3f}")
            return result
            
        except Exception as e:
            print(f"[GlobalRadar] Error ingesting event: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def compute_heatmap(self, timeframe: str = "1h") -> Dict[str, Any]:
        """
        Compute global risk heatmap for specified timeframe.
        
        Args:
            timeframe: Time window (e.g., "1h", "6h", "24h")
            
        Returns:
            Heatmap with normalized 0-1 scores for chains, entities, tokens, networks, clusters
        """
        try:
            print(f"[GlobalRadar] Computing heatmap for timeframe: {timeframe}")
            
            hours = self._parse_timeframe(timeframe)
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
            
            recent_events = [
                e for e in self.events
                if self._parse_timestamp(e.get('timestamp')) >= cutoff_time
            ]
            
            print(f"[GlobalRadar] Found {len(recent_events)} events in timeframe")
            
            temp_chain_scores = {}
            temp_entity_scores = {}
            temp_token_scores = {}
            temp_network_scores = {}
            temp_clusters = {}
            
            for event in recent_events:
                chain = event.get('chain', 'unknown')
                entity = event.get('entity', event.get('address', 'unknown'))
                token = event.get('token', event.get('symbol', 'unknown'))
                network = event.get('network', self._infer_network(chain))
                
                manipulation_risk = self._safe_float(event.get('manipulation_risk', 0.3))
                volatility = self._safe_float(event.get('volatility', 0.3))
                ring_probability = self._safe_float(event.get('ring_probability', 0.2))
                chain_pressure = self._safe_float(event.get('chain_pressure', 0.3))
                anomaly_score = self._safe_float(event.get('anomaly_score', 0.2))
                
                event_risk = (
                    manipulation_risk * 0.35 +
                    volatility * 0.25 +
                    ring_probability * 0.20 +
                    chain_pressure * 0.10 +
                    anomaly_score * 0.10
                )
                
                temp_chain_scores[chain] = temp_chain_scores.get(chain, []) + [event_risk]
                temp_entity_scores[entity] = temp_entity_scores.get(entity, []) + [event_risk]
                temp_token_scores[token] = temp_token_scores.get(token, []) + [event_risk]
                temp_network_scores[network] = temp_network_scores.get(network, []) + [event_risk]
                
                cluster_id = event.get('cluster_id')
                if cluster_id:
                    if cluster_id not in temp_clusters:
                        temp_clusters[cluster_id] = {'entities': set(), 'scores': []}
                    temp_clusters[cluster_id]['entities'].add(entity)
                    temp_clusters[cluster_id]['scores'].append(event_risk)
            
            chains = {k: self._normalize(sum(v) / len(v)) for k, v in temp_chain_scores.items()}
            entities = {k: self._normalize(sum(v) / len(v)) for k, v in temp_entity_scores.items()}
            tokens = {k: self._normalize(sum(v) / len(v)) for k, v in temp_token_scores.items()}
            networks = {k: self._normalize(sum(v) / len(v)) for k, v in temp_network_scores.items()}
            
            clusters = []
            for cluster_id, data in temp_clusters.items():
                avg_score = sum(data['scores']) / len(data['scores']) if data['scores'] else 0.0
                clusters.append({
                    'cluster_id': cluster_id,
                    'score': self._normalize(avg_score),
                    'entities': list(data['entities']),
                    'size': len(data['entities']),
                    'risk_level': self.compute_risk_level(avg_score)
                })
            
            clusters.sort(key=lambda x: x['score'], reverse=True)
            
            heatmap = {
                'success': True,
                'timeframe': timeframe,
                'timeframe_hours': hours,
                'event_count': len(recent_events),
                'chains': chains,
                'entities': entities,
                'tokens': tokens,
                'networks': networks,
                'clusters': clusters,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            print(f"[GlobalRadar] Heatmap computed: {len(chains)} chains, {len(entities)} entities")
            return heatmap
            
        except Exception as e:
            print(f"[GlobalRadar] Error computing heatmap: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def compute_risk_level(self, score: float) -> str:
        """
        Compute risk level from score.
        
        Args:
            score: Risk score (0-1)
            
        Returns:
            Risk level string
        """
        try:
            if score >= self.thresholds["critical"]:
                return "critical"
            elif score >= self.thresholds["high"]:
                return "high"
            elif score >= self.thresholds["moderate"]:
                return "moderate"
            elif score >= self.thresholds["low"]:
                return "low"
            else:
                return "minimal"
        except Exception:
            return "unknown"
    
    def get_global_summary(self) -> Dict[str, Any]:
        """
        Get global intelligence snapshot.
        
        Returns:
            Summary with top entities, chain trends, network volatility, cluster activity, spikes
        """
        try:
            print("[GlobalRadar] Computing global summary")
            
            sorted_entities = sorted(
                self.entity_scores.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
            
            top_entities = [
                {
                    'address': addr,
                    'score': score,
                    'risk_level': self.compute_risk_level(score)
                }
                for addr, score in sorted_entities
            ]
            
            chain_trends = [
                {
                    'chain': chain,
                    'score': score,
                    'risk_level': self.compute_risk_level(score)
                }
                for chain, score in sorted(
                    self.chain_scores.items(),
                    key=lambda x: x[1],
                    reverse=True
                )
            ]
            
            network_volatility = [
                {
                    'network': network,
                    'score': score,
                    'risk_level': self.compute_risk_level(score)
                }
                for network, score in sorted(
                    self.network_scores.items(),
                    key=lambda x: x[1],
                    reverse=True
                )
            ]
            
            cluster_activity = [
                {
                    'cluster_id': c['cluster_id'],
                    'size': c['size'],
                    'score': c['score'],
                    'risk_level': c['risk_level']
                }
                for c in sorted(self.clusters, key=lambda x: x['score'], reverse=True)[:10]
            ]
            
            manipulation_spikes = [
                addr for addr, score in self.entity_scores.items()
                if score >= 0.80
            ]
            
            global_risk = (
                sum(self.entity_scores.values()) / len(self.entity_scores)
                if self.entity_scores else 0.0
            )
            
            summary = {
                'success': True,
                'global_risk_score': global_risk,
                'global_risk_level': self.compute_risk_level(global_risk),
                'top_entities': top_entities,
                'chain_trends': chain_trends,
                'network_volatility': network_volatility,
                'cluster_activity': cluster_activity,
                'manipulation_spikes': len(manipulation_spikes),
                'total_events': self.total_events_ingested,
                'last_update': self.last_update.isoformat(),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            print(f"[GlobalRadar] Global summary: risk={global_risk:.3f}, spikes={len(manipulation_spikes)}")
            return summary
            
        except Exception as e:
            print(f"[GlobalRadar] Error computing global summary: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def purge_old_events(self, max_age_secs: int = 86400) -> Dict[str, Any]:
        """
        Purge events older than max_age_secs.
        
        Args:
            max_age_secs: Maximum age in seconds (default: 24 hours)
            
        Returns:
            Purge result with count of removed events
        """
        try:
            print(f"[GlobalRadar] Purging events older than {max_age_secs} seconds")
            
            cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=max_age_secs)
            
            old_count = len(self.events)
            self.events = [
                e for e in self.events
                if self._parse_timestamp(e.get('timestamp')) >= cutoff_time
            ]
            new_count = len(self.events)
            purged_count = old_count - new_count
            
            print(f"[GlobalRadar] Purged {purged_count} events")
            
            return {
                'success': True,
                'purged_count': purged_count,
                'remaining_count': new_count
            }
            
        except Exception as e:
            print(f"[GlobalRadar] Error purging events: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    
    def _infer_network(self, chain: str) -> str:
        """Infer network type from chain name."""
        try:
            chain_lower = chain.lower()
            
            if any(x in chain_lower for x in ['ethereum', 'eth', 'mainnet']):
                return 'EVM'
            elif any(x in chain_lower for x in ['polygon', 'arbitrum', 'optimism', 'base']):
                return 'Layer2'
            elif any(x in chain_lower for x in ['bsc', 'binance']):
                return 'BSC'
            elif 'solana' in chain_lower:
                return 'Solana'
            elif 'avalanche' in chain_lower:
                return 'Avalanche'
            else:
                return 'Other'
        except Exception:
            return 'Unknown'
    
    def _update_cluster(self, cluster_id: Any, entity: str, score: float):
        """Update cluster information."""
        try:
            for cluster in self.clusters:
                if cluster['cluster_id'] == cluster_id:
                    if entity not in cluster['entities']:
                        cluster['entities'].append(entity)
                    cluster['score'] = (cluster['score'] * 0.7 + score * 0.3)
                    cluster['size'] = len(cluster['entities'])
                    cluster['risk_level'] = self.compute_risk_level(cluster['score'])
                    return
            
            self.clusters.append({
                'cluster_id': cluster_id,
                'entities': [entity],
                'score': score,
                'size': 1,
                'risk_level': self.compute_risk_level(score)
            })
            
        except Exception as e:
            print(f"[GlobalRadar] Error updating cluster: {e}")
    
    def _parse_timeframe(self, timeframe: str) -> float:
        """Parse timeframe string to hours."""
        try:
            timeframe = timeframe.lower().strip()
            
            if timeframe.endswith('h'):
                return float(timeframe[:-1])
            elif timeframe.endswith('d'):
                return float(timeframe[:-1]) * 24
            elif timeframe.endswith('m'):
                return float(timeframe[:-1]) / 60
            else:
                return 1.0
        except Exception:
            return 1.0
    
    def _parse_timestamp(self, timestamp: Any) -> datetime:
        """Parse timestamp to datetime object."""
        try:
            if isinstance(timestamp, datetime):
                return timestamp
            elif isinstance(timestamp, (int, float)):
                return datetime.fromtimestamp(timestamp, tz=timezone.utc)
            elif isinstance(timestamp, str):
                return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            else:
                return datetime.now(timezone.utc)
        except Exception:
            return datetime.now(timezone.utc)
    
    def _normalize(self, value: float) -> float:
        """Normalize value to 0-1 range."""
        return max(0.0, min(1.0, value))
    
    def _safe_float(self, value: Any, default: float = 0.0) -> float:
        """Safely convert value to float."""
        try:
            return float(value) if value is not None else default
        except (ValueError, TypeError):
            return default

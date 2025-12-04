"""
Entity History Builder - Reconstructs entity behavioral history from real-time alerts.
Transforms raw alerts into structured format for Behavioral DNA™ analysis.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
import statistics


class EntityHistoryBuilder:
    """
    Reconstructs entity behavioral history from GhostQuant's real-time alerts.
    Maintains a rolling window of events and provides structured history for DNA analysis.
    """
    
    def __init__(self, window_minutes: int = 1440):
        """
        Initialize the Entity History Builder.
        
        Args:
            window_minutes: Time window to keep events (default: 1440 = 24 hours)
        """
        try:
            print(f"[EntityHistoryBuilder] Initializing with {window_minutes} minute window")
            self.window_minutes = window_minutes
            self.events_by_entity: Dict[str, List[Dict[str, Any]]] = {}
            self.last_purge_time = datetime.now(timezone.utc)
            print("[EntityHistoryBuilder] Initialized successfully")
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error in __init__: {e}")
            self.window_minutes = 1440
            self.events_by_entity = {}
            self.last_purge_time = datetime.now(timezone.utc)
    
    def add_event(self, alert: Dict[str, Any]) -> bool:
        """
        Process and store an incoming alert event.
        
        Args:
            alert: Alert dictionary with event data
            
        Returns:
            True if event was added successfully, False otherwise
        """
        try:
            entity_address = alert.get('entity_address') or alert.get('address') or alert.get('wallet')
            
            if not entity_address:
                print("[EntityHistoryBuilder] Warning: Alert missing entity address")
                return False
            
            entity_address = str(entity_address).lower().strip()
            
            timestamp = alert.get('timestamp')
            if isinstance(timestamp, str):
                try:
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                except Exception:
                    timestamp = datetime.now(timezone.utc)
            elif isinstance(timestamp, (int, float)):
                timestamp = datetime.fromtimestamp(timestamp, tz=timezone.utc)
            else:
                timestamp = datetime.now(timezone.utc)
            
            event = {
                'timestamp': timestamp,
                'timestamp_unix': int(timestamp.timestamp()),
                'entity_address': entity_address,
                'chain': str(alert.get('chain', 'unknown')),
                'token': str(alert.get('token', 'unknown')),
                'type': str(alert.get('type', 'unknown')),
                'severity': str(alert.get('severity', 'medium')),
                'value': self._safe_float(alert.get('value', 0)),
                'metadata': alert.get('metadata', {})
            }
            
            if entity_address not in self.events_by_entity:
                self.events_by_entity[entity_address] = []
            
            self.events_by_entity[entity_address].append(event)
            
            self._auto_purge()
            
            print(f"[EntityHistoryBuilder] Added event for {entity_address[:10]}... (total: {len(self.events_by_entity[entity_address])})")
            return True
            
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error adding event: {e}")
            return False
    
    def build_history(self, entity_address: str) -> List[Dict[str, Any]]:
        """
        Build a sorted, enriched history for the given entity.
        
        Args:
            entity_address: Entity address to build history for
            
        Returns:
            List of enriched event dictionaries
        """
        try:
            print(f"[EntityHistoryBuilder] Building history for {entity_address[:10]}...")
            
            entity_address = str(entity_address).lower().strip()
            
            self.purge_old_events()
            
            events = self.events_by_entity.get(entity_address, [])
            
            if not events:
                print(f"[EntityHistoryBuilder] No events found for {entity_address[:10]}...")
                return []
            
            sorted_events = sorted(events, key=lambda e: e['timestamp'])
            
            enriched_events = []
            now = datetime.now(timezone.utc)
            
            for i, event in enumerate(sorted_events):
                try:
                    enriched = event.copy()
                    
                    age_delta = now - event['timestamp']
                    enriched['age_minutes'] = age_delta.total_seconds() / 60.0
                    
                    if i > 0:
                        prev_event = sorted_events[i - 1]
                        delta = event['timestamp'] - prev_event['timestamp']
                        enriched['delta_from_last_event'] = delta.total_seconds() / 60.0
                    else:
                        enriched['delta_from_last_event'] = 0.0
                    
                    severity_map = {
                        'critical': 1.0,
                        'high': 0.8,
                        'medium': 0.5,
                        'low': 0.3,
                        'info': 0.1
                    }
                    enriched['severity_score'] = severity_map.get(event['severity'].lower(), 0.5)
                    
                    if i > 0:
                        prev_chain = sorted_events[i - 1]['chain']
                        enriched['cross_chain_flag'] = event['chain'] != prev_chain
                    else:
                        enriched['cross_chain_flag'] = False
                    
                    if i > 0:
                        prev_token = sorted_events[i - 1]['token']
                        enriched['token_switch_flag'] = event['token'] != prev_token
                    else:
                        enriched['token_switch_flag'] = False
                    
                    if i > 0:
                        enriched['burst_activity_flag'] = enriched['delta_from_last_event'] < 5.0
                    else:
                        enriched['burst_activity_flag'] = False
                    
                    mean_value = sum(e['value'] for e in sorted_events) / len(sorted_events) if sorted_events else 0
                    enriched['anomaly_flag'] = (
                        enriched['severity_score'] >= 0.8 or 
                        event['value'] > mean_value * 3
                    )
                    
                    enriched_events.append(enriched)
                    
                except Exception as e:
                    print(f"[EntityHistoryBuilder] Error enriching event {i}: {e}")
                    enriched_events.append(event)
            
            print(f"[EntityHistoryBuilder] Built history with {len(enriched_events)} events")
            return enriched_events
            
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error building history: {e}")
            return []
    
    def compute_statistics(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute statistical metrics for an entity's history.
        
        Args:
            history: List of event dictionaries
            
        Returns:
            Dictionary of statistical metrics
        """
        try:
            print(f"[EntityHistoryBuilder] Computing statistics for {len(history)} events")
            
            if not history:
                return {
                    'total_events': 0,
                    'avg_delta': 0.0,
                    'max_delta': 0.0,
                    'burstiness_index': 0.0,
                    'cross_chain_frequency': 0.0,
                    'token_diversity': 0,
                    'avg_severity': 0.0,
                    'anomaly_rate': 0.0,
                    'active_period_score': 0.0
                }
            
            total_events = len(history)
            
            deltas = [e.get('delta_from_last_event', 0) for e in history if e.get('delta_from_last_event', 0) > 0]
            
            if deltas:
                avg_delta = statistics.mean(deltas)
                max_delta = max(deltas)
                
                if avg_delta > 0:
                    std_delta = statistics.stdev(deltas) if len(deltas) > 1 else 0
                    burstiness_index = std_delta / avg_delta
                else:
                    burstiness_index = 0.0
            else:
                avg_delta = 0.0
                max_delta = 0.0
                burstiness_index = 0.0
            
            cross_chain_count = sum(1 for e in history if e.get('cross_chain_flag', False))
            cross_chain_frequency = cross_chain_count / max(total_events - 1, 1)
            
            unique_tokens = len(set(e.get('token', 'unknown') for e in history))
            token_diversity = unique_tokens
            
            severity_scores = [e.get('severity_score', 0.5) for e in history]
            avg_severity = statistics.mean(severity_scores) if severity_scores else 0.5
            
            anomaly_count = sum(1 for e in history if e.get('anomaly_flag', False))
            anomaly_rate = anomaly_count / total_events
            
            if len(history) > 1:
                first_time = history[0]['timestamp']
                last_time = history[-1]['timestamp']
                time_span_hours = (last_time - first_time).total_seconds() / 3600.0
                active_period_score = total_events / max(time_span_hours, 0.1)
            else:
                active_period_score = 0.0
            
            stats = {
                'total_events': total_events,
                'avg_delta': avg_delta,
                'max_delta': max_delta,
                'burstiness_index': burstiness_index,
                'cross_chain_frequency': cross_chain_frequency,
                'token_diversity': token_diversity,
                'avg_severity': avg_severity,
                'anomaly_rate': anomaly_rate,
                'active_period_score': active_period_score
            }
            
            print(f"[EntityHistoryBuilder] Statistics computed: {total_events} events, {token_diversity} tokens")
            return stats
            
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error computing statistics: {e}")
            return {
                'total_events': 0,
                'avg_delta': 0.0,
                'max_delta': 0.0,
                'burstiness_index': 0.0,
                'cross_chain_frequency': 0.0,
                'token_diversity': 0,
                'avg_severity': 0.0,
                'anomaly_rate': 0.0,
                'active_period_score': 0.0,
                'error': str(e)
            }
    
    def summarize_entity(self, entity_address: str) -> Dict[str, Any]:
        """
        Generate a complete summary for an entity including history and statistics.
        
        Args:
            entity_address: Entity address to summarize
            
        Returns:
            Dictionary with address, events, stats, and timestamp
        """
        try:
            print(f"[EntityHistoryBuilder] Summarizing entity {entity_address[:10]}...")
            
            history = self.build_history(entity_address)
            
            stats = self.compute_statistics(history)
            
            summary = {
                'success': True,
                'address': entity_address,
                'events': history,
                'stats': stats,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            print(f"[EntityHistoryBuilder] Summary complete for {entity_address[:10]}...")
            return summary
            
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error summarizing entity: {e}")
            return {
                'success': False,
                'error': str(e),
                'address': entity_address,
                'events': [],
                'stats': {},
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
    
    def purge_old_events(self) -> int:
        """
        Remove events older than the configured time window.
        
        Returns:
            Number of events purged
        """
        try:
            print("[EntityHistoryBuilder] Purging old events...")
            
            cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=self.window_minutes)
            total_purged = 0
            
            for entity_address in list(self.events_by_entity.keys()):
                events = self.events_by_entity[entity_address]
                
                filtered_events = [
                    e for e in events 
                    if e['timestamp'] >= cutoff_time
                ]
                
                purged_count = len(events) - len(filtered_events)
                total_purged += purged_count
                
                if filtered_events:
                    self.events_by_entity[entity_address] = filtered_events
                else:
                    del self.events_by_entity[entity_address]
            
            self.last_purge_time = datetime.now(timezone.utc)
            
            if total_purged > 0:
                print(f"[EntityHistoryBuilder] Purged {total_purged} old events")
            
            return total_purged
            
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error purging events: {e}")
            return 0
    
    def _auto_purge(self) -> None:
        """Automatically purge old events if enough time has passed."""
        try:
            time_since_purge = datetime.now(timezone.utc) - self.last_purge_time
            if time_since_purge.total_seconds() > 600:  # 10 minutes
                self.purge_old_events()
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error in auto-purge: {e}")
    
    def _safe_float(self, value: Any, default: float = 0.0) -> float:
        """Safely convert value to float."""
        try:
            return float(value) if value is not None else default
        except (ValueError, TypeError):
            return default
    
    def get_entity_count(self) -> int:
        """Get the number of entities being tracked."""
        try:
            return len(self.events_by_entity)
        except Exception:
            return 0
    
    def get_total_event_count(self) -> int:
        """Get the total number of events across all entities."""
        try:
            return sum(len(events) for events in self.events_by_entity.values())
        except Exception:
            return 0
    
    def get_all_entities(self) -> List[str]:
        """Get list of all tracked entity addresses."""
        try:
            return list(self.events_by_entity.keys())
        except Exception:
            return []
    
    def clear_entity(self, entity_address: str) -> bool:
        """
        Clear all events for a specific entity.
        
        Args:
            entity_address: Entity address to clear
            
        Returns:
            True if cleared successfully, False otherwise
        """
        try:
            entity_address = str(entity_address).lower().strip()
            if entity_address in self.events_by_entity:
                del self.events_by_entity[entity_address]
                print(f"[EntityHistoryBuilder] Cleared events for {entity_address[:10]}...")
                return True
            return False
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error clearing entity: {e}")
            return False
    
    def clear_all(self) -> bool:
        """
        Clear all events for all entities.
        
        Returns:
            True if cleared successfully, False otherwise
        """
        try:
            self.events_by_entity.clear()
            print("[EntityHistoryBuilder] Cleared all events")
            return True
        except Exception as e:
            print(f"[EntityHistoryBuilder] Error clearing all: {e}")
            return False

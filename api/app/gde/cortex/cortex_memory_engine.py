"""
Cortex Memory Engine™ - Historical Memory Store
Long-horizon pattern detection across 30-day window
Pure Python, zero external dependencies
"""

import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from .cortex_schema import (
    CortexMemoryRecord,
    CortexSequencePattern,
    CortexLongHorizonPattern,
    CortexGlobalMemorySummary
)

logger = logging.getLogger(__name__)


class CortexMemoryEngine:
    """
    Cortex Memory Engine™
    
    Historical memory store with long-horizon pattern detection
    - 30-day rolling window (720 hours default)
    - Entity timeline tracking
    - Sequence pattern detection (escalation, accumulation, volatility, coordination)
    - Long-horizon pattern analysis
    - Global memory summary
    
    Pure Python, 100% crash-proof, deterministic
    """
    
    def __init__(self, max_hours: int = 720):
        """
        Initialize Cortex Memory Engine
        
        Args:
            max_hours: Maximum hours to retain in memory (default 720 = 30 days)
        """
        self.max_hours = max_hours
        self.records: List[CortexMemoryRecord] = []
        logger.info(f"[Cortex] Engine initialized with {max_hours}h retention window")
    
    def ingest_record(self, record_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingest a new memory record
        
        Args:
            record_dict: Dictionary with record fields
        
        Returns:
            Dictionary with success status and stats
        """
        try:
            logger.info("[Cortex] Ingesting memory record")
            
            record = CortexMemoryRecord(
                id=record_dict.get('id', ''),
                timestamp=record_dict.get('timestamp', int(datetime.utcnow().timestamp())),
                source=record_dict.get('source', ''),
                entity=record_dict.get('entity'),
                token=record_dict.get('token'),
                chain=record_dict.get('chain'),
                risk_score=float(record_dict.get('risk_score', 0.0)),
                classification=record_dict.get('classification', ''),
                metadata=record_dict.get('metadata', {})
            )
            
            self.records.append(record)
            
            self.purge_old_data()
            
            logger.info(f"[Cortex] Record ingested: {record.id}, total records: {len(self.records)}")
            
            return {
                "success": True,
                "record_id": record.id,
                "total_records": len(self.records),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Cortex] Error ingesting record: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def build_entity_timeline(self, entity_address: str) -> List[Dict[str, Any]]:
        """
        Build ordered timeline for an entity
        
        Args:
            entity_address: Entity address to query
        
        Returns:
            List of compressed record summaries (old → new)
        """
        try:
            logger.info(f"[Cortex] Building timeline for entity: {entity_address}")
            
            entity_records = [
                r for r in self.records
                if r.entity == entity_address
            ]
            
            entity_records.sort(key=lambda r: r.timestamp)
            
            timeline = []
            for record in entity_records:
                summary = {
                    "id": record.id,
                    "timestamp": record.timestamp,
                    "source": record.source,
                    "risk_score": record.risk_score,
                    "classification": record.classification,
                    "metadata_keys": list(record.metadata.keys())
                }
                timeline.append(summary)
            
            logger.info(f"[Cortex] Timeline built: {len(timeline)} records")
            return timeline
            
        except Exception as e:
            logger.error(f"[Cortex] Error building timeline: {e}")
            return []
    
    def detect_sequences(self, entity_address: str) -> List[CortexSequencePattern]:
        """
        Detect temporal sequence patterns for an entity
        
        Patterns:
        - Escalation: risk increasing ≥ 3 steps
        - Accumulation: clustered activity (≥3 events in 10 min)
        - Volatility: risk oscillates high→low→high
        - Coordination: entity intersects same clusters/rings
        
        Args:
            entity_address: Entity address to analyze
        
        Returns:
            List of CortexSequencePattern objects
        """
        try:
            logger.info(f"[Cortex] Detecting sequences for entity: {entity_address}")
            
            patterns = []
            
            timeline = self.build_entity_timeline(entity_address)
            
            if len(timeline) < 3:
                logger.info("[Cortex] Insufficient data for sequence detection")
                return patterns
            
            escalation = self._detect_escalation(entity_address, timeline)
            if escalation:
                patterns.append(escalation)
            
            accumulation = self._detect_accumulation(entity_address, timeline)
            if accumulation:
                patterns.append(accumulation)
            
            volatility = self._detect_volatility(entity_address, timeline)
            if volatility:
                patterns.append(volatility)
            
            coordination = self._detect_coordination(entity_address, timeline)
            if coordination:
                patterns.append(coordination)
            
            logger.info(f"[Cortex] Detected {len(patterns)} sequence patterns")
            return patterns
            
        except Exception as e:
            logger.error(f"[Cortex] Error detecting sequences: {e}")
            return []
    
    def compute_long_horizon_pattern(self, entity_address: str) -> CortexLongHorizonPattern:
        """
        Compute long-horizon pattern analysis for an entity
        
        Args:
            entity_address: Entity address to analyze
        
        Returns:
            CortexLongHorizonPattern object
        """
        try:
            logger.info(f"[Cortex] Computing long-horizon pattern for entity: {entity_address}")
            
            patterns = self.detect_sequences(entity_address)
            
            timeline = self.build_entity_timeline(entity_address)
            if timeline:
                avg_risk = sum(r['risk_score'] for r in timeline) / len(timeline)
            else:
                avg_risk = 0.0
            
            if patterns:
                pattern_weights = sum(p.strength for p in patterns) / len(patterns)
                aggregate_risk = (avg_risk * 0.6) + (pattern_weights * 0.4)
            else:
                aggregate_risk = avg_risk
            
            summary = self._generate_long_horizon_summary(
                entity_address,
                patterns,
                timeline,
                aggregate_risk
            )
            
            long_horizon = CortexLongHorizonPattern(
                entity=entity_address,
                patterns=patterns,
                aggregate_risk=aggregate_risk,
                summary=summary
            )
            
            logger.info(f"[Cortex] Long-horizon pattern computed: {len(patterns)} patterns, risk={aggregate_risk:.2f}")
            return long_horizon
            
        except Exception as e:
            logger.error(f"[Cortex] Error computing long-horizon pattern: {e}")
            return CortexLongHorizonPattern(entity=entity_address)
    
    def get_global_summary(self) -> CortexGlobalMemorySummary:
        """
        Get global memory summary
        
        Returns:
            CortexGlobalMemorySummary object
        """
        try:
            logger.info("[Cortex] Computing global summary")
            
            entities = set()
            tokens = set()
            chains = set()
            
            for record in self.records:
                if record.entity:
                    entities.add(record.entity)
                if record.token:
                    tokens.add(record.token)
                if record.chain:
                    chains.add(record.chain)
            
            high_risk_entities = []
            for entity in entities:
                entity_records = [r for r in self.records if r.entity == entity]
                if entity_records:
                    avg_risk = sum(r.risk_score for r in entity_records) / len(entity_records)
                    if avg_risk >= 0.65:
                        high_risk_entities.append(entity)
            
            dominant_patterns = self._identify_dominant_patterns()
            
            summary = CortexGlobalMemorySummary(
                total_records=len(self.records),
                entities_tracked=len(entities),
                tokens_tracked=len(tokens),
                chains_tracked=len(chains),
                high_risk_entities=high_risk_entities[:10],  # Top 10
                dominant_patterns=dominant_patterns,
                time_window_hours=self.max_hours
            )
            
            logger.info(f"[Cortex] Global summary: {summary.total_records} records, {summary.entities_tracked} entities")
            return summary
            
        except Exception as e:
            logger.error(f"[Cortex] Error computing global summary: {e}")
            return CortexGlobalMemorySummary()
    
    def purge_old_data(self) -> int:
        """
        Purge records older than max_hours
        
        Returns:
            Number of records purged
        """
        try:
            current_time = int(datetime.utcnow().timestamp())
            cutoff_time = current_time - (self.max_hours * 3600)
            
            initial_count = len(self.records)
            
            self.records = [
                r for r in self.records
                if r.timestamp >= cutoff_time
            ]
            
            purged_count = initial_count - len(self.records)
            
            if purged_count > 0:
                logger.info(f"[Cortex] Purged {purged_count} old records")
            
            return purged_count
            
        except Exception as e:
            logger.error(f"[Cortex] Error purging old data: {e}")
            return 0
    
    def health(self) -> Dict[str, Any]:
        """
        Get engine health status
        
        Returns:
            Dictionary with health information
        """
        try:
            entities = set(r.entity for r in self.records if r.entity)
            
            return {
                "success": True,
                "records": len(self.records),
                "entities": len(entities),
                "status": "operational",
                "max_hours": self.max_hours,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Cortex] Error getting health: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": "error",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    
    def _detect_escalation(
        self,
        entity: str,
        timeline: List[Dict[str, Any]]
    ) -> Optional[CortexSequencePattern]:
        """Detect escalation pattern (risk increasing ≥ 3 steps)"""
        try:
            if len(timeline) < 3:
                return None
            
            increases = 0
            sequence = []
            
            for i in range(1, len(timeline)):
                if timeline[i]['risk_score'] > timeline[i-1]['risk_score']:
                    increases += 1
                    sequence.append({
                        'timestamp': timeline[i]['timestamp'],
                        'risk_score': timeline[i]['risk_score'],
                        'source': timeline[i]['source']
                    })
            
            if increases >= 3:
                confidence = min(increases / len(timeline), 1.0)
                strength = min(increases / 5.0, 1.0)
                
                return CortexSequencePattern(
                    entity=entity,
                    sequence=sequence,
                    confidence=confidence,
                    pattern_type="escalation",
                    strength=strength
                )
            
            return None
            
        except Exception:
            return None
    
    def _detect_accumulation(
        self,
        entity: str,
        timeline: List[Dict[str, Any]]
    ) -> Optional[CortexSequencePattern]:
        """Detect accumulation pattern (≥3 events in 10 min)"""
        try:
            if len(timeline) < 3:
                return None
            
            window_seconds = 600  # 10 minutes
            max_cluster_size = 0
            best_cluster = []
            
            for i in range(len(timeline)):
                cluster = [timeline[i]]
                start_time = timeline[i]['timestamp']
                
                for j in range(i + 1, len(timeline)):
                    if timeline[j]['timestamp'] - start_time <= window_seconds:
                        cluster.append(timeline[j])
                    else:
                        break
                
                if len(cluster) > max_cluster_size:
                    max_cluster_size = len(cluster)
                    best_cluster = cluster
            
            if max_cluster_size >= 3:
                confidence = min(max_cluster_size / 10.0, 1.0)
                strength = min(max_cluster_size / 5.0, 1.0)
                
                sequence = [
                    {
                        'timestamp': r['timestamp'],
                        'risk_score': r['risk_score'],
                        'source': r['source']
                    }
                    for r in best_cluster
                ]
                
                return CortexSequencePattern(
                    entity=entity,
                    sequence=sequence,
                    confidence=confidence,
                    pattern_type="accumulation",
                    strength=strength
                )
            
            return None
            
        except Exception:
            return None
    
    def _detect_volatility(
        self,
        entity: str,
        timeline: List[Dict[str, Any]]
    ) -> Optional[CortexSequencePattern]:
        """Detect volatility pattern (risk oscillates high→low→high)"""
        try:
            if len(timeline) < 5:
                return None
            
            oscillations = 0
            sequence = []
            
            for i in range(2, len(timeline)):
                prev_prev = timeline[i-2]['risk_score']
                prev = timeline[i-1]['risk_score']
                curr = timeline[i]['risk_score']
                
                if (prev > prev_prev and prev > curr) or (prev < prev_prev and prev < curr):
                    oscillations += 1
                    sequence.append({
                        'timestamp': timeline[i]['timestamp'],
                        'risk_score': timeline[i]['risk_score'],
                        'source': timeline[i]['source']
                    })
            
            if oscillations >= 2:
                confidence = min(oscillations / 5.0, 1.0)
                strength = min(oscillations / 3.0, 1.0)
                
                return CortexSequencePattern(
                    entity=entity,
                    sequence=sequence,
                    confidence=confidence,
                    pattern_type="volatility",
                    strength=strength
                )
            
            return None
            
        except Exception:
            return None
    
    def _detect_coordination(
        self,
        entity: str,
        timeline: List[Dict[str, Any]]
    ) -> Optional[CortexSequencePattern]:
        """Detect coordination pattern (entity intersects same clusters/rings)"""
        try:
            if len(timeline) < 3:
                return None
            
            cluster_sources = [
                r for r in timeline
                if r['source'] in ['hydra', 'cluster', 'constellation']
            ]
            
            if len(cluster_sources) >= 3:
                confidence = min(len(cluster_sources) / len(timeline), 1.0)
                strength = min(len(cluster_sources) / 5.0, 1.0)
                
                sequence = [
                    {
                        'timestamp': r['timestamp'],
                        'risk_score': r['risk_score'],
                        'source': r['source']
                    }
                    for r in cluster_sources
                ]
                
                return CortexSequencePattern(
                    entity=entity,
                    sequence=sequence,
                    confidence=confidence,
                    pattern_type="coordination",
                    strength=strength
                )
            
            return None
            
        except Exception:
            return None
    
    def _generate_long_horizon_summary(
        self,
        entity: str,
        patterns: List[CortexSequencePattern],
        timeline: List[Dict[str, Any]],
        aggregate_risk: float
    ) -> str:
        """Generate 5-15 line natural-language summary"""
        try:
            lines = []
            
            lines.append(f"=== CORTEX LONG-HORIZON ANALYSIS: {entity} ===")
            lines.append("")
            
            if timeline:
                lines.append(f"TIMELINE: {len(timeline)} events tracked over {self.max_hours}h window")
                first_event = datetime.fromtimestamp(timeline[0]['timestamp']).strftime('%Y-%m-%d %H:%M')
                last_event = datetime.fromtimestamp(timeline[-1]['timestamp']).strftime('%Y-%m-%d %H:%M')
                lines.append(f"  First event: {first_event}")
                lines.append(f"  Last event: {last_event}")
            else:
                lines.append("TIMELINE: No events tracked")
            
            lines.append("")
            
            lines.append(f"AGGREGATE RISK: {aggregate_risk:.2f}")
            if aggregate_risk >= 0.70:
                lines.append("  Classification: HIGH RISK - immediate attention required")
            elif aggregate_risk >= 0.50:
                lines.append("  Classification: ELEVATED RISK - enhanced monitoring recommended")
            else:
                lines.append("  Classification: MODERATE RISK - standard monitoring")
            
            lines.append("")
            
            if patterns:
                lines.append(f"DETECTED PATTERNS: {len(patterns)}")
                for pattern in patterns:
                    lines.append(f"  • {pattern.pattern_type.upper()}: strength={pattern.strength:.2f}, confidence={pattern.confidence:.2f}")
            else:
                lines.append("DETECTED PATTERNS: None")
            
            lines.append("")
            
            lines.append("RECOMMENDATIONS:")
            if aggregate_risk >= 0.70:
                lines.append("  • Deploy enhanced surveillance protocols")
                lines.append("  • Cross-reference with Hydra and Constellation engines")
            elif patterns:
                lines.append("  • Continue monitoring for pattern evolution")
            else:
                lines.append("  • Standard monitoring protocols sufficient")
            
            return '\n'.join(lines)
            
        except Exception as e:
            logger.error(f"[Cortex] Error generating summary: {e}")
            return f"Error generating summary for {entity}"
    
    def _identify_dominant_patterns(self) -> List[str]:
        """Identify dominant global patterns"""
        try:
            pattern_counts = {
                'escalation': 0,
                'accumulation': 0,
                'volatility': 0,
                'coordination': 0
            }
            
            entities = set(r.entity for r in self.records if r.entity)
            sample_size = min(len(entities), 20)  # Sample up to 20 entities
            
            for entity in list(entities)[:sample_size]:
                patterns = self.detect_sequences(entity)
                for pattern in patterns:
                    if pattern.pattern_type in pattern_counts:
                        pattern_counts[pattern.pattern_type] += 1
            
            sorted_patterns = sorted(
                pattern_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            dominant = [
                f"{pattern}: {count} occurrences"
                for pattern, count in sorted_patterns
                if count > 0
            ]
            
            return dominant[:5]  # Top 5
            
        except Exception:
            return []

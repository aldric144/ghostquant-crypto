"""
Valkyrie Threat Warning System™ - Core Engine
Autonomous real-time threat alert generation with 6-domain intelligence integration
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from .valkyrie_schema import ValkyrieAlert, ValkyrieTrigger

logger = logging.getLogger(__name__)


class ValkyrieEngine:
    """
    Core threat alert engine with multi-domain intelligence integration
    
    Integrates:
    - GhostPredictor (prediction risk)
    - Behavioral DNA (entity archetypes)
    - Correlation Engine (cluster coordination)
    - Global Radar (manipulation detection)
    - Threat Actor Profiler (actor classification)
    - Fusion Engine (multi-domain fusion)
    """
    
    def __init__(self):
        """Initialize Valkyrie Engine"""
        self.alert_history: List[ValkyrieAlert] = []
        logger.info("[Valkyrie] Engine initialized")
    
    @staticmethod
    def safe_value(data: Any, default: float = 0.0) -> float:
        """Safely extract numeric value"""
        try:
            if isinstance(data, (int, float)):
                return float(data)
            if isinstance(data, str):
                return float(data)
            return default
        except (ValueError, TypeError):
            return default
    
    def ingest_event(self, event: Dict[str, Any]) -> Optional[ValkyrieAlert]:
        """
        Ingest event from any intelligence domain and generate alert if needed
        
        Args:
            event: Event data with intelligence signals
            
        Returns:
            ValkyrieAlert if threat detected, None otherwise
        """
        try:
            logger.info(f"[Valkyrie] Ingesting event: {event.get('entity', 'unknown')}")
            
            score = self.score_event(event)
            
            severity = self.classify_severity(score)
            
            if severity == "green":
                logger.info(f"[Valkyrie] Event below threshold (score={score:.3f})")
                return None
            
            trigger = self.build_trigger(event, score)
            
            alert = self.generate_alert(trigger)
            
            alert = self.check_escalation(alert)
            
            self.record_alert(alert)
            
            logger.info(f"[Valkyrie] Alert generated: {alert.id} ({severity})")
            return alert
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error ingesting event: {e}")
            return None
    
    def score_event(self, event: Dict[str, Any]) -> float:
        """
        Compute composite threat score from 6 intelligence domains
        
        Domains:
        1. Prediction risk
        2. DNA archetype risk
        3. Correlation cluster risk
        4. Fusion composite risk
        5. Radar manipulation risk
        6. Actor profiler risk
        
        Returns:
            Composite score 0.0-1.0
        """
        try:
            scores = []
            
            prediction = event.get("prediction", {})
            if prediction:
                pred_risk = self.safe_value(prediction.get("risk_score", 0))
                pred_manip = self.safe_value(prediction.get("manipulation_probability", 0))
                scores.append((pred_risk + pred_manip) / 2.0)
            
            dna = event.get("dna", {})
            if dna:
                archetype = dna.get("archetype", "")
                aggressiveness = self.safe_value(dna.get("aggressiveness", 0))
                
                archetype_risk = 0.0
                if archetype in ["PREDATOR", "MANIPULATOR", "SYNDICATE"]:
                    archetype_risk = 0.8
                elif archetype in ["INSIDER", "GHOST"]:
                    archetype_risk = 0.6
                elif archetype == "WHALE":
                    archetype_risk = 0.4
                
                scores.append((archetype_risk + aggressiveness) / 2.0)
            
            correlation = event.get("correlation", {})
            if correlation:
                cluster_size = self.safe_value(correlation.get("cluster_size", 0))
                coordination = self.safe_value(correlation.get("coordination_score", 0))
                
                cluster_risk = 0.0
                if cluster_size >= 10:
                    cluster_risk = 0.8
                elif cluster_size >= 5:
                    cluster_risk = 0.6
                elif cluster_size >= 3:
                    cluster_risk = 0.4
                
                scores.append((cluster_risk + coordination) / 2.0)
            
            fusion = event.get("fusion", {})
            if fusion:
                fusion_risk = self.safe_value(fusion.get("composite_risk_score", 0))
                manipulation_detected = fusion.get("manipulation_detected", False)
                
                if manipulation_detected:
                    fusion_risk = max(fusion_risk, 0.7)
                
                scores.append(fusion_risk)
            
            radar = event.get("radar", {})
            if radar:
                radar_risk = self.safe_value(radar.get("risk_score", 0))
                manipulation_score = self.safe_value(radar.get("manipulation_score", 0))
                
                scores.append((radar_risk + manipulation_score) / 2.0)
            
            actor = event.get("actor", {})
            if actor:
                actor_type = actor.get("actor_type", "")
                actor_risk = self.safe_value(actor.get("risk_level_numeric", 0))
                
                type_risk = 0.0
                if actor_type in ["PREDATOR", "SYNDICATE", "MANIPULATOR"]:
                    type_risk = 0.85
                elif actor_type in ["INSIDER", "GHOST"]:
                    type_risk = 0.65
                elif actor_type == "WHALE":
                    type_risk = 0.45
                
                scores.append((type_risk + actor_risk) / 2.0)
            
            if scores:
                composite = sum(scores) / len(scores)
                logger.info(f"[Valkyrie] Composite score: {composite:.3f} (from {len(scores)} domains)")
                return composite
            
            return 0.0
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error scoring event: {e}")
            return 0.0
    
    def classify_severity(self, score: float) -> str:
        """
        Classify severity level based on threat score
        
        Thresholds:
        - green: < 0.30 (minimal)
        - yellow: 0.30-0.49 (elevated)
        - orange: 0.50-0.69 (serious)
        - red: 0.70-0.84 (critical)
        - purple: >= 0.85 (crisis)
        
        Args:
            score: Threat score 0.0-1.0
            
        Returns:
            Severity level string
        """
        try:
            if score >= 0.85:
                return "purple"
            elif score >= 0.70:
                return "red"
            elif score >= 0.50:
                return "orange"
            elif score >= 0.30:
                return "yellow"
            else:
                return "green"
        except Exception as e:
            logger.error(f"[Valkyrie] Error classifying severity: {e}")
            return "green"
    
    def build_trigger(self, event: Dict[str, Any], score: float) -> ValkyrieTrigger:
        """
        Build trigger object from event and score
        
        Args:
            event: Event data
            score: Computed threat score
            
        Returns:
            ValkyrieTrigger object
        """
        try:
            trigger_type = "Unknown Threat"
            source_domain = "unknown"
            reason = "Threat detected across multiple intelligence domains"
            
            prediction = event.get("prediction", {})
            dna = event.get("dna", {})
            correlation = event.get("correlation", {})
            fusion = event.get("fusion", {})
            radar = event.get("radar", {})
            actor = event.get("actor", {})
            
            if actor:
                actor_type = actor.get("actor_type", "")
                if actor_type in ["PREDATOR", "SYNDICATE", "MANIPULATOR"]:
                    trigger_type = f"{actor_type.title()} Signature"
                    source_domain = "actor"
                    reason = f"High-risk {actor_type.lower()} actor detected with elevated threat indicators"
            
            if not source_domain or source_domain == "unknown":
                if fusion and fusion.get("manipulation_detected"):
                    trigger_type = "Manipulation Spike"
                    source_domain = "fusion"
                    reason = "Multi-domain manipulation pattern detected"
            
            if not source_domain or source_domain == "unknown":
                if correlation:
                    cluster_size = self.safe_value(correlation.get("cluster_size", 0))
                    if cluster_size >= 5:
                        trigger_type = "Coordinated Actor Signature"
                        source_domain = "correlation"
                        reason = f"Large coordinated cluster detected ({int(cluster_size)} entities)"
            
            if not source_domain or source_domain == "unknown":
                if radar:
                    manipulation_score = self.safe_value(radar.get("manipulation_score", 0))
                    if manipulation_score >= 0.7:
                        trigger_type = "Chain Pressure"
                        source_domain = "radar"
                        reason = "High manipulation pressure detected on chain"
            
            if not source_domain or source_domain == "unknown":
                if dna:
                    archetype = dna.get("archetype", "")
                    if archetype in ["PREDATOR", "MANIPULATOR"]:
                        trigger_type = "High-Entropy Behavior"
                        source_domain = "dna"
                        reason = f"Aggressive {archetype.lower()} behavior pattern detected"
            
            if not source_domain or source_domain == "unknown":
                if prediction:
                    pred_risk = self.safe_value(prediction.get("risk_score", 0))
                    if pred_risk >= 0.7:
                        trigger_type = "Volatility Surge"
                        source_domain = "prediction"
                        reason = "High-risk prediction signals detected"
            
            trigger = ValkyrieTrigger(
                trigger_type=trigger_type,
                source_domain=source_domain,
                score=score,
                reason=reason,
                metadata=event,
                timestamp=datetime.utcnow().isoformat()
            )
            
            return trigger
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error building trigger: {e}")
            return ValkyrieTrigger(
                trigger_type="Unknown Threat",
                source_domain="unknown",
                score=score,
                reason="Error processing threat data",
                metadata={},
                timestamp=datetime.utcnow().isoformat()
            )
    
    def generate_alert(self, trigger: ValkyrieTrigger) -> ValkyrieAlert:
        """
        Generate complete alert from trigger
        
        Args:
            trigger: ValkyrieTrigger object
            
        Returns:
            ValkyrieAlert object
        """
        try:
            metadata = trigger.metadata
            entity = metadata.get("entity", {})
            entity_id = entity.get("address", metadata.get("address", "unknown"))
            
            actor = metadata.get("actor", {})
            actor_type = actor.get("actor_type", "UNKNOWN")
            
            severity = self.classify_severity(trigger.score)
            
            summary = self._build_alert_summary(trigger, severity, actor_type)
            
            alert = ValkyrieAlert(
                timestamp=trigger.timestamp,
                entity=entity_id,
                actor_type=actor_type,
                risk_score=trigger.score,
                severity_level=severity,
                trigger_type=trigger.trigger_type,
                reason=trigger.reason,
                summary=summary,
                escalation_level=0,  # Will be set by check_escalation
                metadata=metadata
            )
            
            return alert
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error generating alert: {e}")
            return ValkyrieAlert(
                entity="unknown",
                actor_type="UNKNOWN",
                risk_score=trigger.score,
                severity_level="yellow",
                trigger_type=trigger.trigger_type,
                reason="Error generating alert details",
                summary="Threat detected but details unavailable",
                escalation_level=0,
                metadata={}
            )
    
    def _build_alert_summary(self, trigger: ValkyrieTrigger, severity: str, actor_type: str) -> str:
        """Build human-readable alert summary"""
        try:
            severity_desc = {
                "purple": "CRISIS-LEVEL",
                "red": "CRITICAL",
                "orange": "SERIOUS",
                "yellow": "ELEVATED",
                "green": "MINIMAL"
            }.get(severity, "UNKNOWN")
            
            summary = f"{severity_desc} threat detected: {trigger.trigger_type}. "
            summary += f"Actor type: {actor_type}. "
            summary += f"Risk score: {trigger.score:.2f}. "
            summary += trigger.reason
            
            return summary
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error building summary: {e}")
            return "Threat detected"
    
    def check_escalation(self, alert: ValkyrieAlert) -> ValkyrieAlert:
        """
        Check and set escalation level based on alert severity and history
        
        Escalation levels:
        0 - No Threat
        1 - Elevated
        2 - Serious
        3 - Critical
        4 - Crisis Mode
        
        Args:
            alert: ValkyrieAlert object
            
        Returns:
            Updated ValkyrieAlert with escalation level
        """
        try:
            severity_escalation = {
                "green": 0,
                "yellow": 1,
                "orange": 2,
                "red": 3,
                "purple": 4
            }
            
            escalation = severity_escalation.get(alert.severity_level, 0)
            
            recent_alerts = self.get_recent_alerts(limit=20)
            
            critical_count = 0
            for recent in recent_alerts:
                if recent.severity_level in ["red", "purple"]:
                    critical_count += 1
            
            if critical_count >= 5:
                escalation = max(escalation, 4)  # Crisis mode
            elif critical_count >= 3:
                escalation = max(escalation, 3)  # Critical
            
            alert.escalation_level = escalation
            return alert
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error checking escalation: {e}")
            alert.escalation_level = 0
            return alert
    
    def record_alert(self, alert: ValkyrieAlert) -> None:
        """
        Record alert in history
        
        Args:
            alert: ValkyrieAlert to record
        """
        try:
            self.alert_history.append(alert)
            
            if len(self.alert_history) > 1000:
                self.alert_history = self.alert_history[-1000:]
            
            logger.info(f"[Valkyrie] Alert recorded: {alert.id}")
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error recording alert: {e}")
    
    def get_recent_alerts(self, limit: int = 100) -> List[ValkyrieAlert]:
        """
        Get recent alerts from history
        
        Args:
            limit: Maximum number of alerts to return
            
        Returns:
            List of recent ValkyrieAlert objects
        """
        try:
            return self.alert_history[-limit:]
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting recent alerts: {e}")
            return []

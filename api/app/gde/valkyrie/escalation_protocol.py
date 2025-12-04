"""
Valkyrie Threat Warning System™ - Escalation Protocol
5-level threat escalation system with state tracking
"""

import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from .valkyrie_schema import ValkyrieAlert, ValkyrieEscalation

logger = logging.getLogger(__name__)


class EscalationProtocol:
    """
    Real-time threat escalation protocol with 5 levels
    
    Levels:
    0 - No Threat (green)
    1 - Elevated (yellow)
    2 - Serious (orange)
    3 - Critical (red)
    4 - Crisis Mode (purple)
    """
    
    LEVEL_NAMES = {
        0: "No Threat",
        1: "Elevated",
        2: "Serious",
        3: "Critical",
        4: "Crisis Mode"
    }
    
    def __init__(self):
        """Initialize escalation protocol"""
        self.current_level = 0
        self.alert_history: List[ValkyrieAlert] = []
        self.last_evaluation = datetime.utcnow()
        logger.info("[Valkyrie] EscalationProtocol initialized")
    
    def evaluate(self, alert: ValkyrieAlert) -> int:
        """
        Evaluate escalation level based on new alert and history
        
        Considers:
        - Alert severity
        - Number of alerts in last 5/10/15 minutes
        - Presence of high-risk actor types
        - Severity trend
        - Fusion/Radar risk spikes
        - Correlation cluster size
        
        Args:
            alert: New ValkyrieAlert
            
        Returns:
            Escalation level 0-4
        """
        try:
            self.alert_history.append(alert)
            
            if len(self.alert_history) > 100:
                self.alert_history = self.alert_history[-100:]
            
            now = datetime.utcnow()
            five_min_ago = now - timedelta(minutes=5)
            ten_min_ago = now - timedelta(minutes=10)
            fifteen_min_ago = now - timedelta(minutes=15)
            
            alerts_5m = 0
            alerts_10m = 0
            alerts_15m = 0
            critical_alerts = 0
            high_risk_actors = 0
            
            for hist_alert in self.alert_history:
                try:
                    alert_time = datetime.fromisoformat(hist_alert.timestamp.replace('Z', '+00:00'))
                except:
                    continue
                
                if alert_time >= five_min_ago:
                    alerts_5m += 1
                if alert_time >= ten_min_ago:
                    alerts_10m += 1
                if alert_time >= fifteen_min_ago:
                    alerts_15m += 1
                
                if hist_alert.severity_level in ["red", "purple"]:
                    critical_alerts += 1
                
                if hist_alert.actor_type in ["PREDATOR", "SYNDICATE", "MANIPULATOR"]:
                    high_risk_actors += 1
            
            escalation = 0
            
            severity_level = {
                "green": 0,
                "yellow": 1,
                "orange": 2,
                "red": 3,
                "purple": 4
            }.get(alert.severity_level, 0)
            
            escalation = max(escalation, severity_level)
            
            if alerts_5m >= 10:
                escalation = max(escalation, 4)  # Crisis: 10+ alerts in 5 minutes
            elif alerts_5m >= 7:
                escalation = max(escalation, 3)  # Critical: 7+ alerts in 5 minutes
            elif alerts_10m >= 12:
                escalation = max(escalation, 3)  # Critical: 12+ alerts in 10 minutes
            elif alerts_10m >= 8:
                escalation = max(escalation, 2)  # Serious: 8+ alerts in 10 minutes
            elif alerts_15m >= 15:
                escalation = max(escalation, 2)  # Serious: 15+ alerts in 15 minutes
            
            if critical_alerts >= 5:
                escalation = max(escalation, 4)  # Crisis: 5+ critical alerts
            elif critical_alerts >= 3:
                escalation = max(escalation, 3)  # Critical: 3+ critical alerts
            elif critical_alerts >= 2:
                escalation = max(escalation, 2)  # Serious: 2+ critical alerts
            
            if high_risk_actors >= 5:
                escalation = max(escalation, 3)  # Critical: 5+ high-risk actors
            elif high_risk_actors >= 3:
                escalation = max(escalation, 2)  # Serious: 3+ high-risk actors
            
            metadata = alert.metadata
            
            fusion = metadata.get("fusion", {})
            if fusion:
                fusion_risk = fusion.get("composite_risk_score", 0)
                if fusion_risk >= 0.85:
                    escalation = max(escalation, 3)
                elif fusion_risk >= 0.70:
                    escalation = max(escalation, 2)
            
            radar = metadata.get("radar", {})
            if radar:
                manipulation_score = radar.get("manipulation_score", 0)
                if manipulation_score >= 0.85:
                    escalation = max(escalation, 3)
            
            correlation = metadata.get("correlation", {})
            if correlation:
                cluster_size = correlation.get("cluster_size", 0)
                if cluster_size >= 10:
                    escalation = max(escalation, 3)  # Large cluster
                elif cluster_size >= 5:
                    escalation = max(escalation, 2)
            
            self.current_level = escalation
            self.last_evaluation = now
            
            logger.info(f"[Valkyrie] Escalation evaluated: Level {escalation} ({self.LEVEL_NAMES[escalation]})")
            logger.info(f"[Valkyrie] Alerts: 5m={alerts_5m}, 10m={alerts_10m}, 15m={alerts_15m}, critical={critical_alerts}")
            
            return escalation
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error evaluating escalation: {e}")
            return self.current_level
    
    def get_current_level(self) -> int:
        """
        Get current escalation level
        
        Returns:
            Current escalation level 0-4
        """
        return self.current_level
    
    def get_escalation_summary(self) -> ValkyrieEscalation:
        """
        Get detailed escalation summary
        
        Returns:
            ValkyrieEscalation object with current status
        """
        try:
            now = datetime.utcnow()
            five_min_ago = now - timedelta(minutes=5)
            fifteen_min_ago = now - timedelta(minutes=15)
            
            alerts_5m = 0
            alerts_15m = 0
            critical_alerts = 0
            
            for alert in self.alert_history:
                try:
                    alert_time = datetime.fromisoformat(alert.timestamp.replace('Z', '+00:00'))
                except:
                    continue
                
                if alert_time >= five_min_ago:
                    alerts_5m += 1
                if alert_time >= fifteen_min_ago:
                    alerts_15m += 1
                
                if alert.severity_level in ["red", "purple"]:
                    critical_alerts += 1
            
            level_name = self.LEVEL_NAMES.get(self.current_level, "Unknown")
            
            summaries = {
                0: "System operating normally. No significant threats detected. All intelligence domains reporting nominal activity.",
                1: "Elevated threat level. Monitoring increased activity across intelligence domains. Enhanced surveillance protocols active.",
                2: "Serious threat level. Multiple high-risk indicators detected. Coordinated activity patterns emerging. Immediate attention required.",
                3: "Critical threat level. Significant manipulation patterns detected. Multiple high-risk actors active. Emergency protocols engaged.",
                4: "CRISIS MODE. Severe threat detected across multiple domains. Large-scale coordinated manipulation in progress. Maximum alert status."
            }
            
            summary = summaries.get(self.current_level, "Threat level unknown")
            
            if alerts_5m > 0:
                summary += f" {alerts_5m} alerts in last 5 minutes."
            if critical_alerts > 0:
                summary += f" {critical_alerts} critical alerts detected."
            
            escalation = ValkyrieEscalation(
                level=self.current_level,
                level_name=level_name,
                summary=summary,
                alert_count_5m=alerts_5m,
                alert_count_15m=alerts_15m,
                critical_alerts=critical_alerts,
                timestamp=now.isoformat()
            )
            
            return escalation
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting escalation summary: {e}")
            return ValkyrieEscalation(
                level=self.current_level,
                level_name=self.LEVEL_NAMES.get(self.current_level, "Unknown"),
                summary="Error retrieving escalation details",
                alert_count_5m=0,
                alert_count_15m=0,
                critical_alerts=0,
                timestamp=datetime.utcnow().isoformat()
            )
    
    def reset(self) -> None:
        """Reset escalation protocol to level 0"""
        try:
            self.current_level = 0
            self.alert_history = []
            self.last_evaluation = datetime.utcnow()
            logger.info("[Valkyrie] Escalation protocol reset")
        except Exception as e:
            logger.error(f"[Valkyrie] Error resetting escalation: {e}")

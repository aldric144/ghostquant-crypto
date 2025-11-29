"""
Valkyrie Threat Warning System™ - Alert Feed Manager
Rolling FIFO queue for last 1000 alerts
"""

import logging
from typing import List, Dict, Any
from datetime import datetime
from .valkyrie_schema import ValkyrieAlert

logger = logging.getLogger(__name__)


class AlertFeedManager:
    """
    Manages rolling alert feed with FIFO queue
    Stores last 1000 alerts for real-time access
    """
    
    MAX_ALERTS = 1000
    
    def __init__(self):
        """Initialize alert feed manager"""
        self.alerts: List[ValkyrieAlert] = []
        logger.info("[Valkyrie] AlertFeedManager initialized")
    
    def push(self, alert: ValkyrieAlert) -> None:
        """
        Push new alert to feed (FIFO)
        
        Args:
            alert: ValkyrieAlert to add
        """
        try:
            self.alerts.append(alert)
            
            if len(self.alerts) > self.MAX_ALERTS:
                self.alerts = self.alerts[-self.MAX_ALERTS:]
            
            logger.info(f"[Valkyrie] Alert pushed to feed: {alert.id} (total: {len(self.alerts)})")
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error pushing alert to feed: {e}")
    
    def all(self) -> List[Dict[str, Any]]:
        """
        Get all alerts in feed
        
        Returns:
            List of alert dictionaries
        """
        try:
            return [alert.to_dict() for alert in self.alerts]
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting all alerts: {e}")
            return []
    
    def latest(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get latest N alerts
        
        Args:
            limit: Maximum number of alerts to return
            
        Returns:
            List of latest alert dictionaries
        """
        try:
            latest_alerts = self.alerts[-limit:] if limit > 0 else self.alerts
            return [alert.to_dict() for alert in latest_alerts]
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting latest alerts: {e}")
            return []
    
    def since(self, timestamp: str) -> List[Dict[str, Any]]:
        """
        Get alerts since specific timestamp
        
        Args:
            timestamp: ISO format timestamp string
            
        Returns:
            List of alert dictionaries since timestamp
        """
        try:
            target_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            filtered_alerts = []
            for alert in self.alerts:
                try:
                    alert_time = datetime.fromisoformat(alert.timestamp.replace('Z', '+00:00'))
                    if alert_time >= target_time:
                        filtered_alerts.append(alert.to_dict())
                except:
                    continue
            
            return filtered_alerts
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting alerts since timestamp: {e}")
            return []
    
    def count(self) -> int:
        """
        Get total number of alerts in feed
        
        Returns:
            Alert count
        """
        try:
            return len(self.alerts)
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting alert count: {e}")
            return 0
    
    def clear(self) -> None:
        """Clear all alerts from feed"""
        try:
            self.alerts = []
            logger.info("[Valkyrie] Alert feed cleared")
        except Exception as e:
            logger.error(f"[Valkyrie] Error clearing alert feed: {e}")
    
    def get_by_severity(self, severity: str) -> List[Dict[str, Any]]:
        """
        Get alerts filtered by severity level
        
        Args:
            severity: Severity level (green/yellow/orange/red/purple)
            
        Returns:
            List of filtered alert dictionaries
        """
        try:
            filtered = [
                alert.to_dict() 
                for alert in self.alerts 
                if alert.severity_level == severity
            ]
            return filtered
        except Exception as e:
            logger.error(f"[Valkyrie] Error filtering by severity: {e}")
            return []
    
    def get_by_actor_type(self, actor_type: str) -> List[Dict[str, Any]]:
        """
        Get alerts filtered by actor type
        
        Args:
            actor_type: Actor type string
            
        Returns:
            List of filtered alert dictionaries
        """
        try:
            filtered = [
                alert.to_dict() 
                for alert in self.alerts 
                if alert.actor_type == actor_type
            ]
            return filtered
        except Exception as e:
            logger.error(f"[Valkyrie] Error filtering by actor type: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get feed statistics
        
        Returns:
            Dictionary with statistics
        """
        try:
            stats = {
                "total_alerts": len(self.alerts),
                "by_severity": {
                    "purple": 0,
                    "red": 0,
                    "orange": 0,
                    "yellow": 0,
                    "green": 0
                },
                "by_actor_type": {},
                "by_trigger_type": {}
            }
            
            for alert in self.alerts:
                severity = alert.severity_level
                if severity in stats["by_severity"]:
                    stats["by_severity"][severity] += 1
                
                actor_type = alert.actor_type
                if actor_type not in stats["by_actor_type"]:
                    stats["by_actor_type"][actor_type] = 0
                stats["by_actor_type"][actor_type] += 1
                
                trigger_type = alert.trigger_type
                if trigger_type not in stats["by_trigger_type"]:
                    stats["by_trigger_type"][trigger_type] = 0
                stats["by_trigger_type"][trigger_type] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"[Valkyrie] Error getting statistics: {e}")
            return {
                "total_alerts": 0,
                "by_severity": {},
                "by_actor_type": {},
                "by_trigger_type": {}
            }

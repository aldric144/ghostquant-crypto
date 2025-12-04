"""
GhostQuant™ — System-Wide Configuration Security & Environment Isolation
Module: environment_isolation.py
Purpose: EnvironmentIsolationManager for enforcing environment boundaries

SECURITY NOTICE:
- Enforces strict environment isolation
- Prevents cross-environment data access
- Logs all isolation violations
- Never raises exceptions (returns safe defaults)
- Compliant with NIST 800-53 CM-7, AC-3, AC-4
"""

import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum

from .config_schema import ConfigEnvironment


class IsolationAction(str, Enum):
    """Actions that can be restricted by environment isolation"""
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    EXECUTE = "execute"
    DEPLOY = "deploy"
    CONFIGURE = "configure"
    ACCESS_SECRETS = "access_secrets"
    MODIFY_DATA = "modify_data"
    CALL_API = "call_api"


class IsolationViolationType(str, Enum):
    """Types of isolation violations"""
    CROSS_ENVIRONMENT_ACCESS = "cross_environment_access"
    UNAUTHORIZED_ACTION = "unauthorized_action"
    PRODUCTION_MUTATION = "production_mutation"
    DEV_TO_PROD_ACCESS = "dev_to_prod_access"
    STAGING_TO_PROD_MUTATION = "staging_to_prod_mutation"


class IsolationViolation:
    """Record of an environment isolation violation"""
    
    def __init__(
        self,
        violation_type: IsolationViolationType,
        source_environment: ConfigEnvironment,
        target_environment: ConfigEnvironment,
        action: IsolationAction,
        message: str,
        timestamp: Optional[datetime] = None
    ):
        self.violation_type = violation_type
        self.source_environment = source_environment
        self.target_environment = target_environment
        self.action = action
        self.message = message
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "violation_type": self.violation_type.value,
            "source_environment": self.source_environment.value,
            "target_environment": self.target_environment.value,
            "action": self.action.value,
            "message": self.message,
            "timestamp": self.timestamp.isoformat()
        }


class EnvironmentIsolationManager:
    """
    Environment isolation manager for GhostQuant™.
    
    Enforces strict boundaries between environments to prevent:
    - Dev accessing Prod data
    - Staging mutating Prod data
    - Cross-environment configuration leaks
    - Unauthorized environment transitions
    
    Isolation Rules:
    1. Dev can only access Dev resources
    2. Staging can read Prod but not write
    3. Prod is read-only from outside Prod
    4. All violations are logged (no exceptions raised)
    5. Fail securely (deny by default)
    """
    
    def __init__(self):
        """Initialize EnvironmentIsolationManager"""
        self.current_environment: ConfigEnvironment = ConfigEnvironment.DEV
        self.violations: List[IsolationViolation] = []
        self.isolation_rules: Dict[str, Any] = {}
        
        self._detect_environment()
        
        self._initialize_isolation_rules()
    
    def _detect_environment(self) -> None:
        """Detect current environment from environment variables"""
        try:
            env_name = os.environ.get("ENVIRONMENT", "dev").lower()
            
            if env_name in ["prod", "production"]:
                self.current_environment = ConfigEnvironment.PROD
            elif env_name in ["staging", "stage"]:
                self.current_environment = ConfigEnvironment.STAGING
            elif env_name in ["dev", "development"]:
                self.current_environment = ConfigEnvironment.DEV
            else:
                self.current_environment = ConfigEnvironment.DEV
        except Exception as e:
            print(f"Error: Failed to detect environment: {e}")
            self.current_environment = ConfigEnvironment.DEV
    
    def _initialize_isolation_rules(self) -> None:
        """Initialize environment isolation rules"""
        try:
            self.isolation_rules = {
                ConfigEnvironment.DEV: {
                    ConfigEnvironment.DEV: {
                        IsolationAction.READ: True,
                        IsolationAction.WRITE: True,
                        IsolationAction.DELETE: True,
                        IsolationAction.EXECUTE: True,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: True,
                        IsolationAction.ACCESS_SECRETS: True,
                        IsolationAction.MODIFY_DATA: True,
                        IsolationAction.CALL_API: True
                    },
                    ConfigEnvironment.STAGING: {
                        IsolationAction.READ: False,
                        IsolationAction.WRITE: False,
                        IsolationAction.DELETE: False,
                        IsolationAction.EXECUTE: False,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: False,
                        IsolationAction.ACCESS_SECRETS: False,
                        IsolationAction.MODIFY_DATA: False,
                        IsolationAction.CALL_API: False
                    },
                    ConfigEnvironment.PROD: {
                        IsolationAction.READ: False,
                        IsolationAction.WRITE: False,
                        IsolationAction.DELETE: False,
                        IsolationAction.EXECUTE: False,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: False,
                        IsolationAction.ACCESS_SECRETS: False,
                        IsolationAction.MODIFY_DATA: False,
                        IsolationAction.CALL_API: False
                    }
                },
                ConfigEnvironment.STAGING: {
                    ConfigEnvironment.DEV: {
                        IsolationAction.READ: False,
                        IsolationAction.WRITE: False,
                        IsolationAction.DELETE: False,
                        IsolationAction.EXECUTE: False,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: False,
                        IsolationAction.ACCESS_SECRETS: False,
                        IsolationAction.MODIFY_DATA: False,
                        IsolationAction.CALL_API: False
                    },
                    ConfigEnvironment.STAGING: {
                        IsolationAction.READ: True,
                        IsolationAction.WRITE: True,
                        IsolationAction.DELETE: True,
                        IsolationAction.EXECUTE: True,
                        IsolationAction.DEPLOY: True,
                        IsolationAction.CONFIGURE: True,
                        IsolationAction.ACCESS_SECRETS: True,
                        IsolationAction.MODIFY_DATA: True,
                        IsolationAction.CALL_API: True
                    },
                    ConfigEnvironment.PROD: {
                        IsolationAction.READ: True,  # Staging can read Prod
                        IsolationAction.WRITE: False,  # But cannot write
                        IsolationAction.DELETE: False,
                        IsolationAction.EXECUTE: False,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: False,
                        IsolationAction.ACCESS_SECRETS: False,
                        IsolationAction.MODIFY_DATA: False,
                        IsolationAction.CALL_API: True  # Can call Prod APIs
                    }
                },
                ConfigEnvironment.PROD: {
                    ConfigEnvironment.DEV: {
                        IsolationAction.READ: False,
                        IsolationAction.WRITE: False,
                        IsolationAction.DELETE: False,
                        IsolationAction.EXECUTE: False,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: False,
                        IsolationAction.ACCESS_SECRETS: False,
                        IsolationAction.MODIFY_DATA: False,
                        IsolationAction.CALL_API: False
                    },
                    ConfigEnvironment.STAGING: {
                        IsolationAction.READ: False,
                        IsolationAction.WRITE: False,
                        IsolationAction.DELETE: False,
                        IsolationAction.EXECUTE: False,
                        IsolationAction.DEPLOY: False,
                        IsolationAction.CONFIGURE: False,
                        IsolationAction.ACCESS_SECRETS: False,
                        IsolationAction.MODIFY_DATA: False,
                        IsolationAction.CALL_API: False
                    },
                    ConfigEnvironment.PROD: {
                        IsolationAction.READ: True,
                        IsolationAction.WRITE: True,
                        IsolationAction.DELETE: True,
                        IsolationAction.EXECUTE: True,
                        IsolationAction.DEPLOY: True,
                        IsolationAction.CONFIGURE: True,
                        IsolationAction.ACCESS_SECRETS: True,
                        IsolationAction.MODIFY_DATA: True,
                        IsolationAction.CALL_API: True
                    }
                }
            }
        except Exception as e:
            print(f"Error: Failed to initialize isolation rules: {e}")
            self.isolation_rules = {}
    
    def get_current_environment(self) -> ConfigEnvironment:
        """
        Get current environment.
        
        Returns:
            Current environment
        """
        return self.current_environment
    
    def is_allowed(
        self,
        action: IsolationAction,
        target_env: ConfigEnvironment,
        source_env: Optional[ConfigEnvironment] = None
    ) -> bool:
        """
        Check if an action is allowed from source to target environment.
        
        Args:
            action: Action to perform
            target_env: Target environment
            source_env: Source environment (uses current if None)
            
        Returns:
            True if allowed, False otherwise
        """
        try:
            source = source_env or self.current_environment
            
            if source not in self.isolation_rules:
                return False
            
            if target_env not in self.isolation_rules[source]:
                return False
            
            if action not in self.isolation_rules[source][target_env]:
                return False
            
            allowed = self.isolation_rules[source][target_env][action]
            
            if not allowed:
                self._log_violation(
                    violation_type=self._determine_violation_type(source, target_env, action),
                    source_environment=source,
                    target_environment=target_env,
                    action=action,
                    message=f"Action '{action.value}' from {source.value} to {target_env.value} is not allowed"
                )
            
            return allowed
        except Exception as e:
            print(f"Error: Failed to check if action is allowed: {e}")
            return False
    
    def _determine_violation_type(
        self,
        source: ConfigEnvironment,
        target: ConfigEnvironment,
        action: IsolationAction
    ) -> IsolationViolationType:
        """Determine the type of isolation violation"""
        try:
            if source == ConfigEnvironment.DEV and target == ConfigEnvironment.PROD:
                return IsolationViolationType.DEV_TO_PROD_ACCESS
            
            elif source == ConfigEnvironment.STAGING and target == ConfigEnvironment.PROD:
                if action in [IsolationAction.WRITE, IsolationAction.DELETE, IsolationAction.MODIFY_DATA]:
                    return IsolationViolationType.STAGING_TO_PROD_MUTATION
                else:
                    return IsolationViolationType.CROSS_ENVIRONMENT_ACCESS
            
            elif target == ConfigEnvironment.PROD and action in [IsolationAction.WRITE, IsolationAction.DELETE, IsolationAction.MODIFY_DATA]:
                return IsolationViolationType.PRODUCTION_MUTATION
            
            elif source != target:
                return IsolationViolationType.CROSS_ENVIRONMENT_ACCESS
            
            else:
                return IsolationViolationType.UNAUTHORIZED_ACTION
        except Exception:
            return IsolationViolationType.UNAUTHORIZED_ACTION
    
    def _log_violation(
        self,
        violation_type: IsolationViolationType,
        source_environment: ConfigEnvironment,
        target_environment: ConfigEnvironment,
        action: IsolationAction,
        message: str
    ) -> None:
        """Log an isolation violation"""
        try:
            violation = IsolationViolation(
                violation_type=violation_type,
                source_environment=source_environment,
                target_environment=target_environment,
                action=action,
                message=message
            )
            self.violations.append(violation)
            
            if len(self.violations) > 1000:
                self.violations = self.violations[-1000:]
        except Exception as e:
            print(f"Error: Failed to log violation: {e}")
    
    def enforce_isolation_rules(
        self,
        action: IsolationAction,
        target_env: ConfigEnvironment
    ) -> bool:
        """
        Enforce isolation rules for an action.
        
        Args:
            action: Action to enforce
            target_env: Target environment
            
        Returns:
            True if action is allowed, False otherwise
        """
        return self.is_allowed(action, target_env)
    
    def get_isolation_report(self) -> Dict[str, Any]:
        """
        Get comprehensive isolation report.
        
        Returns:
            Isolation report dictionary
        """
        try:
            violation_counts = {}
            for violation in self.violations:
                vtype = violation.violation_type.value
                violation_counts[vtype] = violation_counts.get(vtype, 0) + 1
            
            recent_violations = [v.to_dict() for v in self.violations[-50:]]
            
            allowed_actions = {}
            for target_env in [ConfigEnvironment.DEV, ConfigEnvironment.STAGING, ConfigEnvironment.PROD]:
                allowed_actions[target_env.value] = {}
                for action in IsolationAction:
                    allowed_actions[target_env.value][action.value] = self.is_allowed(
                        action,
                        target_env,
                        source_env=self.current_environment
                    )
            
            return {
                "current_environment": self.current_environment.value,
                "total_violations": len(self.violations),
                "violation_counts": violation_counts,
                "recent_violations": recent_violations,
                "allowed_actions": allowed_actions,
                "isolation_status": "ENFORCED",
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error: Failed to get isolation report: {e}")
            return {
                "error": str(e),
                "current_environment": self.current_environment.value,
                "isolation_status": "ERROR"
            }
    
    def get_violations(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get recent isolation violations.
        
        Args:
            limit: Maximum number of violations to return
            
        Returns:
            List of violation dictionaries
        """
        try:
            return [v.to_dict() for v in self.violations[-limit:]]
        except Exception as e:
            print(f"Error: Failed to get violations: {e}")
            return []
    
    def clear_violations(self) -> None:
        """Clear all recorded violations"""
        try:
            self.violations = []
        except Exception as e:
            print(f"Error: Failed to clear violations: {e}")
    
    def get_allowed_actions(
        self,
        target_env: ConfigEnvironment,
        source_env: Optional[ConfigEnvironment] = None
    ) -> List[str]:
        """
        Get list of allowed actions for target environment.
        
        Args:
            target_env: Target environment
            source_env: Source environment (uses current if None)
            
        Returns:
            List of allowed action names
        """
        try:
            allowed = []
            for action in IsolationAction:
                if self.is_allowed(action, target_env, source_env):
                    allowed.append(action.value)
            return allowed
        except Exception as e:
            print(f"Error: Failed to get allowed actions: {e}")
            return []
    
    def get_blocked_actions(
        self,
        target_env: ConfigEnvironment,
        source_env: Optional[ConfigEnvironment] = None
    ) -> List[str]:
        """
        Get list of blocked actions for target environment.
        
        Args:
            target_env: Target environment
            source_env: Source environment (uses current if None)
            
        Returns:
            List of blocked action names
        """
        try:
            blocked = []
            for action in IsolationAction:
                if not self.is_allowed(action, target_env, source_env):
                    blocked.append(action.value)
            return blocked
        except Exception as e:
            print(f"Error: Failed to get blocked actions: {e}")
            return []


_isolation_manager_instance: Optional[EnvironmentIsolationManager] = None


def get_isolation_manager() -> EnvironmentIsolationManager:
    """Get global EnvironmentIsolationManager instance (singleton pattern)"""
    global _isolation_manager_instance
    if _isolation_manager_instance is None:
        _isolation_manager_instance = EnvironmentIsolationManager()
    return _isolation_manager_instance

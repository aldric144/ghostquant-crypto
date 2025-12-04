"""
GhostQuant™ — System-Wide Configuration Security & Environment Isolation
Module: config_governance.py
Purpose: ConfigGovernanceRegistry for policy management and compliance

SECURITY NOTICE:
- Tracks required configuration keys
- Enforces classification and environment policies
- Detects policy violations
- Never exposes sensitive values
- Compliant with NIST 800-53 CM-2, CM-6, CM-7, AC-3
"""

from datetime import datetime
from typing import Dict, List, Optional, Any

from .config_schema import (
    ConfigMetadata,
    ConfigItem,
    ConfigClassification,
    ConfigEnvironment,
    ConfigValueType,
    DEFAULT_CONFIG_METADATA
)


class PolicyViolation:
    """Configuration policy violation"""
    
    def __init__(
        self,
        violation_id: str,
        config_key: str,
        policy_key: str,
        violation_type: str,
        severity: str,
        description: str,
        detected_at: Optional[datetime] = None
    ):
        self.violation_id = violation_id
        self.config_key = config_key
        self.policy_key = policy_key
        self.violation_type = violation_type
        self.severity = severity
        self.description = description
        self.detected_at = detected_at or datetime.utcnow()
        self.resolved = False
        self.resolved_at: Optional[datetime] = None
        self.resolved_by: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "violation_id": self.violation_id,
            "config_key": self.config_key,
            "policy_key": self.policy_key,
            "violation_type": self.violation_type,
            "severity": self.severity,
            "description": self.description,
            "detected_at": self.detected_at.isoformat(),
            "resolved": self.resolved,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by
        }
    
    def resolve(self, resolved_by: str) -> None:
        """Mark violation as resolved"""
        self.resolved = True
        self.resolved_at = datetime.utcnow()
        self.resolved_by = resolved_by


class ConfigGovernanceRegistry:
    """
    Configuration governance registry for GhostQuant™.
    
    Tracks:
    - Required configuration keys
    - Allowed value types
    - Classification levels (LOW → CRITICAL)
    - Allowed environments
    - Rotation/refresh rules
    - Policy violations
    
    Features:
    - Register configuration metadata
    - Update policies
    - Detect violations
    - Generate governance reports
    - Track compliance
    """
    
    def __init__(self):
        """Initialize ConfigGovernanceRegistry"""
        self.policies: Dict[str, ConfigMetadata] = {}
        self.violations: List[PolicyViolation] = []
        self.registered_configs: Dict[str, ConfigItem] = {}
        
        self._load_default_policies()
    
    def _load_default_policies(self) -> None:
        """Load default configuration policies"""
        try:
            for metadata in DEFAULT_CONFIG_METADATA:
                self.policies[metadata.key] = metadata
        except Exception as e:
            print(f"Error: Failed to load default policies: {e}")
    
    def register_config_item(
        self,
        config_item: ConfigItem,
        metadata: Optional[ConfigMetadata] = None
    ) -> bool:
        """
        Register a configuration item with governance metadata.
        
        Args:
            config_item: Configuration item to register
            metadata: Optional metadata (uses existing policy if None)
            
        Returns:
            True if registered successfully, False otherwise
        """
        try:
            self.registered_configs[config_item.key] = config_item
            
            if metadata:
                self.policies[config_item.key] = metadata
            
            self._check_config_violations(config_item)
            
            return True
        except Exception as e:
            print(f"Error: Failed to register config item: {e}")
            return False
    
    def update_metadata(
        self,
        key: str,
        metadata: ConfigMetadata
    ) -> bool:
        """
        Update configuration metadata/policy.
        
        Args:
            key: Configuration key
            metadata: New metadata
            
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            self.policies[key] = metadata
            
            if key in self.registered_configs:
                self._check_config_violations(self.registered_configs[key])
            
            return True
        except Exception as e:
            print(f"Error: Failed to update metadata: {e}")
            return False
    
    def get_metadata(self, key: str) -> Optional[ConfigMetadata]:
        """
        Get configuration metadata/policy.
        
        Args:
            key: Configuration key
            
        Returns:
            ConfigMetadata if found, None otherwise
        """
        try:
            return self.policies.get(key)
        except Exception as e:
            print(f"Error: Failed to get metadata: {e}")
            return None
    
    def list_policies(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """
        List all configuration policies.
        
        Args:
            active_only: Whether to include only active policies
            
        Returns:
            List of policy dictionaries
        """
        try:
            policies = []
            for metadata in self.policies.values():
                policies.append(metadata.to_dict())
            return policies
        except Exception as e:
            print(f"Error: Failed to list policies: {e}")
            return []
    
    def _check_config_violations(self, config_item: ConfigItem) -> None:
        """Check for policy violations in a configuration item"""
        try:
            policy = self.policies.get(config_item.key)
            if not policy:
                violation = PolicyViolation(
                    violation_id=f"no-policy-{config_item.key}-{datetime.utcnow().timestamp()}",
                    config_key=config_item.key,
                    policy_key="",
                    violation_type="missing_policy",
                    severity="WARNING",
                    description=f"No governance policy defined for '{config_item.key}'"
                )
                self.violations.append(violation)
                return
            
            if not policy.is_allowed_in_environment(config_item.environment):
                violation = PolicyViolation(
                    violation_id=f"env-not-allowed-{config_item.key}-{datetime.utcnow().timestamp()}",
                    config_key=config_item.key,
                    policy_key=config_item.key,
                    violation_type="environment_not_allowed",
                    severity="ERROR",
                    description=f"Configuration '{config_item.key}' is not allowed in {config_item.environment.value} environment"
                )
                self.violations.append(violation)
            
            if policy.is_required_in_environment(config_item.environment) and not config_item.is_set:
                violation = PolicyViolation(
                    violation_id=f"required-missing-{config_item.key}-{datetime.utcnow().timestamp()}",
                    config_key=config_item.key,
                    policy_key=config_item.key,
                    violation_type="required_missing",
                    severity="CRITICAL",
                    description=f"Required configuration '{config_item.key}' is not set in {config_item.environment.value} environment"
                )
                self.violations.append(violation)
            
            if config_item.classification != policy.classification:
                violation = PolicyViolation(
                    violation_id=f"classification-mismatch-{config_item.key}-{datetime.utcnow().timestamp()}",
                    config_key=config_item.key,
                    policy_key=config_item.key,
                    violation_type="classification_mismatch",
                    severity="WARNING",
                    description=f"Configuration '{config_item.key}' classification mismatch: expected {policy.classification.value}, got {config_item.classification.value}"
                )
                self.violations.append(violation)
            
            if config_item.value_type != policy.value_type:
                violation = PolicyViolation(
                    violation_id=f"type-mismatch-{config_item.key}-{datetime.utcnow().timestamp()}",
                    config_key=config_item.key,
                    policy_key=config_item.key,
                    violation_type="type_mismatch",
                    severity="ERROR",
                    description=f"Configuration '{config_item.key}' type mismatch: expected {policy.value_type.value}, got {config_item.value_type.value}"
                )
                self.violations.append(violation)
            
            if config_item.validation_errors:
                for error in config_item.validation_errors:
                    violation = PolicyViolation(
                        violation_id=f"validation-error-{config_item.key}-{datetime.utcnow().timestamp()}",
                        config_key=config_item.key,
                        policy_key=config_item.key,
                        violation_type="validation_error",
                        severity="ERROR" if config_item.classification in [ConfigClassification.CRITICAL, ConfigClassification.HIGH] else "WARNING",
                        description=f"Configuration '{config_item.key}' validation error: {error}"
                    )
                    self.violations.append(violation)
        
        except Exception as e:
            print(f"Error: Failed to check config violations: {e}")
    
    def detect_policy_violations(self) -> List[Dict[str, Any]]:
        """
        Detect all policy violations across registered configurations.
        
        Returns:
            List of violation dictionaries
        """
        try:
            self.violations = []
            
            for config_item in self.registered_configs.values():
                self._check_config_violations(config_item)
            
            return [v.to_dict() for v in self.violations]
        except Exception as e:
            print(f"Error: Failed to detect policy violations: {e}")
            return []
    
    def get_governance_report(self) -> Dict[str, Any]:
        """
        Get comprehensive governance report.
        
        Returns:
            Governance report dictionary
        """
        try:
            violation_counts = {
                "CRITICAL": 0,
                "ERROR": 0,
                "WARNING": 0,
                "INFO": 0
            }
            
            for violation in self.violations:
                severity = violation.severity
                if severity in violation_counts:
                    violation_counts[severity] += 1
            
            violation_types = {}
            for violation in self.violations:
                vtype = violation.violation_type
                violation_types[vtype] = violation_types.get(vtype, 0) + 1
            
            classification_counts = {
                "CRITICAL": 0,
                "HIGH": 0,
                "MODERATE": 0,
                "LOW": 0
            }
            
            for config in self.registered_configs.values():
                classification = config.classification.value
                if classification in classification_counts:
                    classification_counts[classification] += 1
            
            environment_counts = {
                "dev": 0,
                "staging": 0,
                "prod": 0
            }
            
            for config in self.registered_configs.values():
                env = config.environment.value
                if env in environment_counts:
                    environment_counts[env] += 1
            
            total_configs = len(self.registered_configs)
            total_policies = len(self.policies)
            total_violations = len(self.violations)
            critical_violations = violation_counts["CRITICAL"]
            
            compliance_percentage = 100.0
            if total_configs > 0:
                compliance_percentage = max(0, 100.0 - (total_violations / total_configs * 100))
            
            recent_violations = [v.to_dict() for v in self.violations[-50:]]
            
            return {
                "summary": {
                    "total_configs": total_configs,
                    "total_policies": total_policies,
                    "total_violations": total_violations,
                    "critical_violations": critical_violations,
                    "compliance_percentage": round(compliance_percentage, 2)
                },
                "violation_counts": violation_counts,
                "violation_types": violation_types,
                "classification_counts": classification_counts,
                "environment_counts": environment_counts,
                "recent_violations": recent_violations,
                "policies": self.list_policies(),
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error: Failed to get governance report: {e}")
            return {
                "error": str(e),
                "summary": {
                    "total_configs": 0,
                    "total_policies": 0,
                    "total_violations": 0,
                    "critical_violations": 0,
                    "compliance_percentage": 0
                }
            }
    
    def get_violations_by_severity(self, severity: str) -> List[Dict[str, Any]]:
        """
        Get violations filtered by severity.
        
        Args:
            severity: Severity level (CRITICAL, ERROR, WARNING, INFO)
            
        Returns:
            List of violation dictionaries
        """
        try:
            filtered = [v for v in self.violations if v.severity == severity.upper()]
            return [v.to_dict() for v in filtered]
        except Exception as e:
            print(f"Error: Failed to get violations by severity: {e}")
            return []
    
    def get_violations_by_type(self, violation_type: str) -> List[Dict[str, Any]]:
        """
        Get violations filtered by type.
        
        Args:
            violation_type: Violation type
            
        Returns:
            List of violation dictionaries
        """
        try:
            filtered = [v for v in self.violations if v.violation_type == violation_type]
            return [v.to_dict() for v in filtered]
        except Exception as e:
            print(f"Error: Failed to get violations by type: {e}")
            return []
    
    def get_configs_by_classification(
        self,
        classification: ConfigClassification
    ) -> List[Dict[str, Any]]:
        """
        Get configurations filtered by classification.
        
        Args:
            classification: Classification level
            
        Returns:
            List of configuration dictionaries
        """
        try:
            filtered = [
                c for c in self.registered_configs.values()
                if c.classification == classification
            ]
            return [c.to_dict() for c in filtered]
        except Exception as e:
            print(f"Error: Failed to get configs by classification: {e}")
            return []
    
    def get_configs_by_environment(
        self,
        environment: ConfigEnvironment
    ) -> List[Dict[str, Any]]:
        """
        Get configurations filtered by environment.
        
        Args:
            environment: Environment
            
        Returns:
            List of configuration dictionaries
        """
        try:
            filtered = [
                c for c in self.registered_configs.values()
                if c.environment == environment
            ]
            return [c.to_dict() for c in filtered]
        except Exception as e:
            print(f"Error: Failed to get configs by environment: {e}")
            return []
    
    def get_compliance_summary(self) -> Dict[str, Any]:
        """
        Get compliance summary.
        
        Returns:
            Compliance summary dictionary
        """
        try:
            total_configs = len(self.registered_configs)
            valid_configs = sum(1 for c in self.registered_configs.values() if c.is_valid)
            invalid_configs = total_configs - valid_configs
            
            total_violations = len(self.violations)
            critical_violations = sum(1 for v in self.violations if v.severity == "CRITICAL")
            error_violations = sum(1 for v in self.violations if v.severity == "ERROR")
            warning_violations = sum(1 for v in self.violations if v.severity == "WARNING")
            
            compliance_score = 100.0
            if total_configs > 0:
                compliance_score -= (critical_violations * 10)  # -10 points per critical
                compliance_score -= (error_violations * 5)      # -5 points per error
                compliance_score -= (warning_violations * 1)    # -1 point per warning
                compliance_score = max(0, min(100, compliance_score))
            
            return {
                "total_configs": total_configs,
                "valid_configs": valid_configs,
                "invalid_configs": invalid_configs,
                "total_violations": total_violations,
                "critical_violations": critical_violations,
                "error_violations": error_violations,
                "warning_violations": warning_violations,
                "compliance_score": round(compliance_score, 2),
                "status": "COMPLIANT" if compliance_score >= 90 else "NON_COMPLIANT" if compliance_score < 70 else "PARTIAL_COMPLIANCE",
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error: Failed to get compliance summary: {e}")
            return {
                "error": str(e),
                "compliance_score": 0,
                "status": "ERROR"
            }


_governance_registry_instance: Optional[ConfigGovernanceRegistry] = None


def get_governance_registry() -> ConfigGovernanceRegistry:
    """Get global ConfigGovernanceRegistry instance (singleton pattern)"""
    global _governance_registry_instance
    if _governance_registry_instance is None:
        _governance_registry_instance = ConfigGovernanceRegistry()
    return _governance_registry_instance

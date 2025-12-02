"""
GhostQuant™ — Secure Key Management & Secrets Governance
Module: governance_registry.py
Purpose: SecretsGovernanceRegistry for policy management and compliance

SECURITY NOTICE:
- Enforce governance policies on secrets
- Track policy violations
- Manage access control rules
- Classification enforcement
- Rotation frequency enforcement
- Compliant with NIST 800-53 AC-2, AC-3, CM-2, IA-5
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import re

from .secret_schema import (
    GovernancePolicy,
    SecretClassification,
    SecretEnvironment,
    DEFAULT_POLICIES
)
from .secret_manager import SecretManager


class PolicyViolation:
    """Represents a governance policy violation"""
    
    def __init__(
        self,
        violation_id: str,
        secret_name: str,
        policy_id: str,
        violation_type: str,
        severity: str,
        description: str,
        detected_at: datetime,
        resolved: bool = False
    ):
        self.violation_id = violation_id
        self.secret_name = secret_name
        self.policy_id = policy_id
        self.violation_type = violation_type
        self.severity = severity
        self.description = description
        self.detected_at = detected_at
        self.resolved = resolved
        self.resolved_at: Optional[datetime] = None
        self.resolved_by: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'violation_id': self.violation_id,
            'secret_name': self.secret_name,
            'policy_id': self.policy_id,
            'violation_type': self.violation_type,
            'severity': self.severity,
            'description': self.description,
            'detected_at': self.detected_at.isoformat(),
            'resolved': self.resolved,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by': self.resolved_by
        }


class SecretsGovernanceRegistry:
    """
    Governance registry for secrets management.
    
    Features:
    - Register and manage governance policies
    - Detect policy violations
    - Track compliance status
    - Generate governance reports
    - Enforce access control rules
    
    Compliance:
    - NIST 800-53 AC-2, AC-3, CM-2, IA-5
    - SOC 2 CC6.1, CC6.2, CC6.3
    - FedRAMP AC-2, AC-3, IA-5
    """
    
    def __init__(self, secret_manager: Optional[SecretManager] = None):
        """
        Initialize SecretsGovernanceRegistry.
        
        Args:
            secret_manager: SecretManager instance (creates new if None)
        """
        from .secret_manager import get_secret_manager
        self.secret_manager = secret_manager or get_secret_manager()
        self.policies: Dict[str, GovernancePolicy] = {}
        self.violations: List[PolicyViolation] = []
        
        self._load_default_policies()
    
    def _load_default_policies(self) -> None:
        """Load default governance policies"""
        try:
            for policy in DEFAULT_POLICIES:
                self.policies[policy.policy_id] = policy
        except Exception as e:
            print(f"Error: Failed to load default policies: {e}")
    
    def register_secret(self, name: str, metadata: Dict[str, Any]) -> bool:
        """
        Register a secret with governance metadata.
        
        Args:
            name: Name of the secret
            metadata: Metadata dictionary
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not metadata.get('owner'):
                print(f"Warning: Secret {name} has no owner")
                return False
            
            if not metadata.get('purpose'):
                print(f"Warning: Secret {name} has no purpose")
                return False
            
            matching_policies = self._find_matching_policies(name)
            
            if not matching_policies:
                print(f"Warning: Secret {name} does not match any governance policies")
            
            return True
        except Exception as e:
            print(f"Error: Failed to register secret: {e}")
            return False
    
    def update_policy(self, policy_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update an existing governance policy.
        
        Args:
            policy_id: ID of the policy to update
            updates: Dictionary of updates
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if policy_id not in self.policies:
                print(f"Error: Policy {policy_id} not found")
                return False
            
            policy = self.policies[policy_id]
            
            if 'secret_pattern' in updates:
                policy.secret_pattern = updates['secret_pattern']
            if 'classification' in updates:
                policy.classification = SecretClassification(updates['classification'])
            if 'allowed_roles' in updates:
                policy.allowed_roles = updates['allowed_roles']
            if 'rotation_frequency_days' in updates:
                policy.rotation_frequency_days = updates['rotation_frequency_days']
            if 'encryption_required' in updates:
                policy.encryption_required = updates['encryption_required']
            if 'approval_required' in updates:
                policy.approval_required = updates['approval_required']
            if 'compliance_frameworks' in updates:
                policy.compliance_frameworks = updates['compliance_frameworks']
            if 'is_active' in updates:
                policy.is_active = updates['is_active']
            
            policy.updated_at = datetime.utcnow()
            
            return True
        except Exception as e:
            print(f"Error: Failed to update policy: {e}")
            return False
    
    def get_policy(self, policy_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a governance policy by ID.
        
        Args:
            policy_id: ID of the policy
            
        Returns:
            Policy dictionary if found, None otherwise
        """
        try:
            if policy_id in self.policies:
                return self.policies[policy_id].to_dict()
            else:
                return None
        except Exception as e:
            print(f"Error: Failed to get policy: {e}")
            return None
    
    def list_policies(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """
        List all governance policies.
        
        Args:
            active_only: Whether to include only active policies
            
        Returns:
            List of policy dictionaries
        """
        try:
            policies_list = []
            for policy in self.policies.values():
                if active_only and not policy.is_active:
                    continue
                policies_list.append(policy.to_dict())
            return policies_list
        except Exception as e:
            print(f"Error: Failed to list policies: {e}")
            return []
    
    def _find_matching_policies(self, secret_name: str) -> List[GovernancePolicy]:
        """Find policies that match a secret name"""
        matching = []
        try:
            for policy in self.policies.values():
                if policy.is_active and policy.matches_secret(secret_name):
                    matching.append(policy)
        except Exception as e:
            print(f"Error: Failed to find matching policies: {e}")
        return matching
    
    def detect_policy_violations(self) -> List[Dict[str, Any]]:
        """
        Detect policy violations across all secrets.
        
        Returns:
            List of violation dictionaries
        """
        violations = []
        violation_counter = 0
        
        try:
            for secret in self.secret_manager.secrets.values():
                if not secret.is_active:
                    continue
                
                matching_policies = self._find_matching_policies(secret.name)
                
                for policy in matching_policies:
                    if secret.classification.value < policy.classification.value:
                        violation_counter += 1
                        violation = PolicyViolation(
                            violation_id=f"VIO-{violation_counter:06d}",
                            secret_name=secret.name,
                            policy_id=policy.policy_id,
                            violation_type="CLASSIFICATION_MISMATCH",
                            severity="HIGH",
                            description=f"Secret has classification {secret.classification.value} but policy requires {policy.classification.value}",
                            detected_at=datetime.utcnow()
                        )
                        violations.append(violation.to_dict())
                    
                    if secret.rotation_frequency_days > policy.rotation_frequency_days:
                        violation_counter += 1
                        violation = PolicyViolation(
                            violation_id=f"VIO-{violation_counter:06d}",
                            secret_name=secret.name,
                            policy_id=policy.policy_id,
                            violation_type="ROTATION_FREQUENCY_VIOLATION",
                            severity="MODERATE",
                            description=f"Secret rotation frequency is {secret.rotation_frequency_days} days but policy requires {policy.rotation_frequency_days} days",
                            detected_at=datetime.utcnow()
                        )
                        violations.append(violation.to_dict())
                    
                    if secret.is_stale():
                        violation_counter += 1
                        days_overdue = (datetime.utcnow() - secret.last_rotated).days - secret.rotation_frequency_days
                        violation = PolicyViolation(
                            violation_id=f"VIO-{violation_counter:06d}",
                            secret_name=secret.name,
                            policy_id=policy.policy_id,
                            violation_type="STALE_SECRET",
                            severity="CRITICAL" if secret.classification == SecretClassification.CRITICAL else "HIGH",
                            description=f"Secret is overdue for rotation by {days_overdue} days",
                            detected_at=datetime.utcnow()
                        )
                        violations.append(violation.to_dict())
                
                if not matching_policies:
                    violation_counter += 1
                    violation = PolicyViolation(
                        violation_id=f"VIO-{violation_counter:06d}",
                        secret_name=secret.name,
                        policy_id="NONE",
                        violation_type="NO_POLICY_MATCH",
                        severity="LOW",
                        description=f"Secret does not match any governance policies",
                        detected_at=datetime.utcnow()
                    )
                    violations.append(violation.to_dict())
        
        except Exception as e:
            print(f"Error: Failed to detect policy violations: {e}")
        
        return violations
    
    def get_governance_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive governance report.
        
        Returns:
            Governance report dictionary
        """
        report = {
            'generated_at': datetime.utcnow().isoformat(),
            'summary': {
                'total_secrets': 0,
                'active_secrets': 0,
                'total_policies': len(self.policies),
                'active_policies': 0,
                'secrets_with_policies': 0,
                'secrets_without_policies': 0,
                'total_violations': 0,
                'critical_violations': 0,
                'high_violations': 0,
                'moderate_violations': 0,
                'low_violations': 0
            },
            'policies': [],
            'violations': [],
            'compliance_by_classification': {
                'CRITICAL': {'total': 0, 'compliant': 0, 'violations': 0},
                'HIGH': {'total': 0, 'compliant': 0, 'violations': 0},
                'MODERATE': {'total': 0, 'compliant': 0, 'violations': 0},
                'LOW': {'total': 0, 'compliant': 0, 'violations': 0}
            },
            'compliance_by_environment': {
                'PRODUCTION': {'total': 0, 'compliant': 0, 'violations': 0},
                'STAGING': {'total': 0, 'compliant': 0, 'violations': 0},
                'DEVELOPMENT': {'total': 0, 'compliant': 0, 'violations': 0}
            },
            'recommendations': []
        }
        
        try:
            for secret in self.secret_manager.secrets.values():
                report['summary']['total_secrets'] += 1
                
                if secret.is_active:
                    report['summary']['active_secrets'] += 1
                    
                    report['compliance_by_classification'][secret.classification.value]['total'] += 1
                    
                    report['compliance_by_environment'][secret.environment.value]['total'] += 1
                    
                    matching_policies = self._find_matching_policies(secret.name)
                    if matching_policies:
                        report['summary']['secrets_with_policies'] += 1
                    else:
                        report['summary']['secrets_without_policies'] += 1
            
            for policy in self.policies.values():
                if policy.is_active:
                    report['summary']['active_policies'] += 1
            
            violations = self.detect_policy_violations()
            report['violations'] = violations
            report['summary']['total_violations'] = len(violations)
            
            for violation in violations:
                severity = violation['severity']
                if severity == 'CRITICAL':
                    report['summary']['critical_violations'] += 1
                elif severity == 'HIGH':
                    report['summary']['high_violations'] += 1
                elif severity == 'MODERATE':
                    report['summary']['moderate_violations'] += 1
                else:
                    report['summary']['low_violations'] += 1
                
                secret_name = violation['secret_name']
                secret = self.secret_manager.secrets.get(secret_name)
                if secret:
                    report['compliance_by_classification'][secret.classification.value]['violations'] += 1
                    report['compliance_by_environment'][secret.environment.value]['violations'] += 1
            
            for classification in report['compliance_by_classification']:
                total = report['compliance_by_classification'][classification]['total']
                violations = report['compliance_by_classification'][classification]['violations']
                report['compliance_by_classification'][classification]['compliant'] = max(0, total - violations)
            
            for environment in report['compliance_by_environment']:
                total = report['compliance_by_environment'][environment]['total']
                violations = report['compliance_by_environment'][environment]['violations']
                report['compliance_by_environment'][environment]['compliant'] = max(0, total - violations)
            
            report['policies'] = self.list_policies(active_only=True)
            
            if report['summary']['critical_violations'] > 0:
                report['recommendations'].append({
                    'priority': 'CRITICAL',
                    'message': f"{report['summary']['critical_violations']} critical violations require immediate attention",
                    'action': 'Review and remediate critical violations immediately'
                })
            
            if report['summary']['secrets_without_policies'] > 0:
                report['recommendations'].append({
                    'priority': 'MODERATE',
                    'message': f"{report['summary']['secrets_without_policies']} secrets have no matching governance policies",
                    'action': 'Create policies or update secret naming to match existing policies'
                })
            
            if report['summary']['total_violations'] == 0:
                report['recommendations'].append({
                    'priority': 'INFO',
                    'message': 'All secrets are compliant with governance policies',
                    'action': 'Continue monitoring'
                })
            
            if report['summary']['active_secrets'] > 0:
                compliant_secrets = report['summary']['active_secrets'] - len(set(v['secret_name'] for v in violations))
                compliance_percentage = (compliant_secrets / report['summary']['active_secrets']) * 100
                report['summary']['compliance_percentage'] = round(compliance_percentage, 2)
            else:
                report['summary']['compliance_percentage'] = 100.0
        
        except Exception as e:
            print(f"Error: Failed to generate governance report: {e}")
            report['error'] = str(e)
        
        return report
    
    def check_access_allowed(self, secret_name: str, role: str) -> bool:
        """
        Check if a role is allowed to access a secret.
        
        Args:
            secret_name: Name of the secret
            role: Role requesting access
            
        Returns:
            True if access is allowed, False otherwise
        """
        try:
            matching_policies = self._find_matching_policies(secret_name)
            
            if not matching_policies:
                return True
            
            for policy in matching_policies:
                if role in policy.allowed_roles:
                    return True
            
            return False
        except Exception as e:
            print(f"Error: Failed to check access: {e}")
            return False  # Fail closed on error
    
    def get_secrets_by_classification(self, classification: SecretClassification) -> List[Dict[str, Any]]:
        """
        Get all secrets with a specific classification.
        
        Args:
            classification: Classification level
            
        Returns:
            List of secret metadata dictionaries
        """
        try:
            secrets = []
            for secret in self.secret_manager.secrets.values():
                if secret.is_active and secret.classification == classification:
                    secrets.append(secret.to_dict())
            return secrets
        except Exception as e:
            print(f"Error: Failed to get secrets by classification: {e}")
            return []
    
    def get_secrets_by_environment(self, environment: SecretEnvironment) -> List[Dict[str, Any]]:
        """
        Get all secrets for a specific environment.
        
        Args:
            environment: Environment
            
        Returns:
            List of secret metadata dictionaries
        """
        try:
            secrets = []
            for secret in self.secret_manager.secrets.values():
                if secret.is_active and secret.environment == environment:
                    secrets.append(secret.to_dict())
            return secrets
        except Exception as e:
            print(f"Error: Failed to get secrets by environment: {e}")
            return []


_governance_registry_instance: Optional[SecretsGovernanceRegistry] = None


def get_governance_registry() -> SecretsGovernanceRegistry:
    """Get global SecretsGovernanceRegistry instance (singleton pattern)"""
    global _governance_registry_instance
    if _governance_registry_instance is None:
        _governance_registry_instance = SecretsGovernanceRegistry()
    return _governance_registry_instance

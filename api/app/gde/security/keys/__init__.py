"""
GhostQuant™ — Secure Key Management & Secrets Governance
Package: keys
Purpose: Secure secrets management, key rotation, and governance

SECURITY NOTICE:
- NO raw secret values are ever stored
- Only SHA-256 hashes are persisted
- All access is logged for audit compliance
- Crash-proof implementation with comprehensive error handling
- Compliant with NIST 800-53 SC-12, SC-13, AC-3, AU-2

Modules:
- secret_schema: Data classes for secrets, metadata, and logs
- secret_manager: SecretManager for secure secret storage and access
- key_rotation_engine: KeyRotationEngine for automated rotation
- governance_registry: SecretsGovernanceRegistry for policy management
- api_secrets: FastAPI router for secrets management API

Compliance:
- NIST 800-53 SC-12, SC-13, AC-3, AU-2, IA-5
- SOC 2 CC6.1, CC6.2, CC6.3, CC7.2
- FedRAMP AC-3, IA-5, AU-2, SC-12, SC-13
- ISO 27001 A.9.4, A.10.1, A.12.4
"""

from .secret_schema import (
    SecretRecord,
    SecretMetadata,
    SecretAccessLog,
    SecretRotationEvent,
    GovernancePolicy,
    SecretClassification,
    SecretEnvironment,
    SecretAction,
    DEFAULT_POLICIES
)

from .secret_manager import (
    SecretManager,
    get_secret_manager
)

from .key_rotation_engine import (
    KeyRotationEngine,
    get_rotation_engine
)

from .governance_registry import (
    SecretsGovernanceRegistry,
    PolicyViolation,
    get_governance_registry
)

from .api_secrets import router as secrets_router

__all__ = [
    'SecretRecord',
    'SecretMetadata',
    'SecretAccessLog',
    'SecretRotationEvent',
    'GovernancePolicy',
    'SecretClassification',
    'SecretEnvironment',
    'SecretAction',
    'DEFAULT_POLICIES',
    
    'SecretManager',
    'get_secret_manager',
    'KeyRotationEngine',
    'get_rotation_engine',
    'SecretsGovernanceRegistry',
    'PolicyViolation',
    'get_governance_registry',
    
    'secrets_router'
]

__version__ = '1.0.0'
__author__ = 'GhostQuant™ Security Team'
__compliance__ = [
    'NIST 800-53 SC-12, SC-13, AC-3, AU-2, IA-5',
    'SOC 2 CC6.1, CC6.2, CC6.3, CC7.2',
    'FedRAMP AC-3, IA-5, AU-2, SC-12, SC-13',
    'ISO 27001 A.9.4, A.10.1, A.12.4'
]

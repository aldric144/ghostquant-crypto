"""
GhostQuant™ — System-Wide Configuration Security & Environment Isolation
Package: config
Purpose: Secure configuration management, environment isolation, and governance

SECURITY NOTICE:
- NO raw configuration values are ever exposed
- Only metadata and validation status
- Environment isolation enforced
- 100% crash-proof implementation
- Compliant with NIST 800-53 CM-2, CM-6, CM-7, AC-3

Modules:
- config_schema: Data classes for configuration items and metadata
- config_loader: SecureConfigLoader for safe configuration loading
- environment_isolation: EnvironmentIsolationManager for environment boundaries
- config_governance: ConfigGovernanceRegistry for policy management
- api_config: FastAPI router for configuration management API

Compliance:
- NIST 800-53 CM-2, CM-6, CM-7, AC-3, AC-4
- SOC 2 CC6.1, CC7.2
- FedRAMP CM-2, CM-6, AC-3
- ISO 27001 A.12.1, A.12.5, A.12.6
"""

from .config_schema import (
    ConfigItem,
    ConfigSet,
    ConfigValidationIssue,
    ConfigMetadata,
    EnvironmentHealth,
    ConfigClassification,
    ConfigEnvironment,
    ConfigValueType,
    ValidationSeverity,
    DEFAULT_CONFIG_METADATA
)

from .config_loader import (
    SecureConfigLoader,
    get_config_loader
)

from .environment_isolation import (
    EnvironmentIsolationManager,
    IsolationAction,
    IsolationViolationType,
    IsolationViolation,
    get_isolation_manager
)

from .config_governance import (
    ConfigGovernanceRegistry,
    PolicyViolation,
    get_governance_registry
)

from .api_config import router as config_router

__all__ = [
    'ConfigItem',
    'ConfigSet',
    'ConfigValidationIssue',
    'ConfigMetadata',
    'EnvironmentHealth',
    'ConfigClassification',
    'ConfigEnvironment',
    'ConfigValueType',
    'ValidationSeverity',
    'DEFAULT_CONFIG_METADATA',
    
    'SecureConfigLoader',
    'get_config_loader',
    
    'EnvironmentIsolationManager',
    'IsolationAction',
    'IsolationViolationType',
    'IsolationViolation',
    'get_isolation_manager',
    
    'ConfigGovernanceRegistry',
    'PolicyViolation',
    'get_governance_registry',
    
    'config_router'
]

__version__ = '1.0.0'
__author__ = 'GhostQuant™ Security Team'
__compliance__ = [
    'NIST 800-53 CM-2, CM-6, CM-7, AC-3, AC-4',
    'SOC 2 CC6.1, CC7.2',
    'FedRAMP CM-2, CM-6, AC-3',
    'ISO 27001 A.12.1, A.12.5, A.12.6'
]

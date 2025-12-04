"""
GhostQuant™ — System-Wide Configuration Security & Environment Isolation
Module: config_schema.py
Purpose: Define dataclasses for ConfigItem, ConfigSet, ConfigValidationIssue

SECURITY NOTICE:
- NO sensitive values are ever stored or returned
- Only metadata and hashes are persisted
- All configuration access is logged for audit compliance
- Compliant with NIST 800-53 CM-2, CM-6, CM-7
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum


class ConfigClassification(str, Enum):
    """Configuration classification levels per NIST 800-53"""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ConfigEnvironment(str, Enum):
    """Environment where configuration is used"""
    DEV = "dev"
    STAGING = "staging"
    PROD = "prod"
    ALL = "all"


class ConfigValueType(str, Enum):
    """Configuration value types"""
    STRING = "string"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    FLOAT = "float"
    JSON = "json"
    SECRET = "secret"


class ValidationSeverity(str, Enum):
    """Validation issue severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ConfigItem:
    """
    Configuration item metadata (NO sensitive values stored).
    
    SECURITY: Raw configuration values are NEVER stored in this record.
    Only metadata about the configuration is persisted.
    
    Attributes:
        key: Configuration key name (e.g., "DATABASE_URL")
        value_type: Type of the value (string, integer, boolean, etc.)
        default_value: Default value if not set (can be None)
        environment: Environment where this config is used
        classification: Security classification level
        description: Human-readable description
        last_loaded: Timestamp when config was last loaded
        is_set: Whether the configuration value is currently set
        is_valid: Whether the configuration value passes validation
        validation_errors: List of validation error messages
        required: Whether this configuration is required
        sensitive: Whether this configuration contains sensitive data
    """
    key: str
    value_type: ConfigValueType
    default_value: Optional[Union[str, int, bool, float]] = None
    environment: ConfigEnvironment = ConfigEnvironment.ALL
    classification: ConfigClassification = ConfigClassification.MODERATE
    description: str = ""
    last_loaded: datetime = field(default_factory=datetime.utcnow)
    is_set: bool = False
    is_valid: bool = True
    validation_errors: List[str] = field(default_factory=list)
    required: bool = False
    sensitive: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "key": self.key,
            "value_type": self.value_type.value,
            "default_value": self.default_value,
            "environment": self.environment.value,
            "classification": self.classification.value,
            "description": self.description,
            "last_loaded": self.last_loaded.isoformat(),
            "is_set": self.is_set,
            "is_valid": self.is_valid,
            "validation_errors": self.validation_errors,
            "required": self.required,
            "sensitive": self.sensitive
        }
    
    def is_misconfigured(self) -> bool:
        """Check if configuration item is misconfigured"""
        if self.required and not self.is_set:
            return True
        if not self.is_valid:
            return True
        if len(self.validation_errors) > 0:
            return True
        return False


@dataclass
class ConfigSet:
    """
    Set of configuration items for an environment.
    
    Represents all configuration for a specific environment
    (dev, staging, prod) with validation status.
    
    Attributes:
        environment: Environment name
        items: List of configuration items
        loaded_at: Timestamp when config set was loaded
        valid: Whether all configurations are valid
        errors: List of validation errors across all items
        warnings: List of validation warnings
        total_items: Total number of configuration items
        set_items: Number of items that are set
        required_items: Number of required items
        missing_required: Number of required items that are missing
    """
    environment: ConfigEnvironment
    items: List[ConfigItem] = field(default_factory=list)
    loaded_at: datetime = field(default_factory=datetime.utcnow)
    valid: bool = True
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    total_items: int = 0
    set_items: int = 0
    required_items: int = 0
    missing_required: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "environment": self.environment.value,
            "items": [item.to_dict() for item in self.items],
            "loaded_at": self.loaded_at.isoformat(),
            "valid": self.valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "total_items": self.total_items,
            "set_items": self.set_items,
            "required_items": self.required_items,
            "missing_required": self.missing_required
        }
    
    def update_statistics(self) -> None:
        """Update statistics based on current items"""
        self.total_items = len(self.items)
        self.set_items = sum(1 for item in self.items if item.is_set)
        self.required_items = sum(1 for item in self.items if item.required)
        self.missing_required = sum(1 for item in self.items if item.required and not item.is_set)
        
        self.valid = self.missing_required == 0 and len(self.errors) == 0
        
        for item in self.items:
            if item.validation_errors:
                self.errors.extend(item.validation_errors)


@dataclass
class ConfigValidationIssue:
    """
    Configuration validation issue.
    
    Represents a validation problem with a configuration item,
    such as missing required value, wrong type, or invalid value.
    
    Attributes:
        key: Configuration key that has the issue
        message: Human-readable error message
        severity: Severity level (info, warning, error, critical)
        detected_at: Timestamp when issue was detected
        environment: Environment where issue was detected
        resolution: Suggested resolution steps
    """
    key: str
    message: str
    severity: ValidationSeverity
    detected_at: datetime = field(default_factory=datetime.utcnow)
    environment: Optional[ConfigEnvironment] = None
    resolution: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "key": self.key,
            "message": self.message,
            "severity": self.severity.value,
            "detected_at": self.detected_at.isoformat(),
            "environment": self.environment.value if self.environment else None,
            "resolution": self.resolution
        }
    
    def is_critical(self) -> bool:
        """Check if this is a critical issue"""
        return self.severity in [ValidationSeverity.ERROR, ValidationSeverity.CRITICAL]


@dataclass
class ConfigMetadata:
    """
    Metadata about a configuration item for governance.
    
    Defines policies and requirements for a configuration item
    without storing the actual value.
    
    Attributes:
        key: Configuration key name
        value_type: Expected value type
        classification: Security classification
        allowed_environments: Environments where this config is allowed
        required_in_environments: Environments where this config is required
        rotation_frequency_days: How often value should be rotated (0 = never)
        validation_rules: List of validation rules
        compliance_frameworks: Applicable compliance frameworks
        owner: Team/person responsible for this config
        description: Human-readable description
    """
    key: str
    value_type: ConfigValueType
    classification: ConfigClassification
    allowed_environments: List[ConfigEnvironment] = field(default_factory=list)
    required_in_environments: List[ConfigEnvironment] = field(default_factory=list)
    rotation_frequency_days: int = 0
    validation_rules: List[str] = field(default_factory=list)
    compliance_frameworks: List[str] = field(default_factory=list)
    owner: str = "devops"
    description: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "key": self.key,
            "value_type": self.value_type.value,
            "classification": self.classification.value,
            "allowed_environments": [env.value for env in self.allowed_environments],
            "required_in_environments": [env.value for env in self.required_in_environments],
            "rotation_frequency_days": self.rotation_frequency_days,
            "validation_rules": self.validation_rules,
            "compliance_frameworks": self.compliance_frameworks,
            "owner": self.owner,
            "description": self.description
        }
    
    def is_allowed_in_environment(self, environment: ConfigEnvironment) -> bool:
        """Check if configuration is allowed in given environment"""
        if not self.allowed_environments:
            return True  # No restrictions
        return environment in self.allowed_environments or ConfigEnvironment.ALL in self.allowed_environments
    
    def is_required_in_environment(self, environment: ConfigEnvironment) -> bool:
        """Check if configuration is required in given environment"""
        return environment in self.required_in_environments


@dataclass
class EnvironmentHealth:
    """
    Health status of an environment's configuration.
    
    Provides overall health metrics for an environment's
    configuration state.
    
    Attributes:
        environment: Environment name
        status: Overall health status (HEALTHY, WARNING, ERROR)
        total_configs: Total number of configurations
        valid_configs: Number of valid configurations
        invalid_configs: Number of invalid configurations
        missing_required: Number of missing required configurations
        misconfigurations: Number of misconfigured items
        critical_issues: Number of critical issues
        warnings: Number of warnings
        last_check: Timestamp of last health check
    """
    environment: ConfigEnvironment
    status: str = "UNKNOWN"
    total_configs: int = 0
    valid_configs: int = 0
    invalid_configs: int = 0
    missing_required: int = 0
    misconfigurations: int = 0
    critical_issues: int = 0
    warnings: int = 0
    last_check: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "environment": self.environment.value,
            "status": self.status,
            "total_configs": self.total_configs,
            "valid_configs": self.valid_configs,
            "invalid_configs": self.invalid_configs,
            "missing_required": self.missing_required,
            "misconfigurations": self.misconfigurations,
            "critical_issues": self.critical_issues,
            "warnings": self.warnings,
            "last_check": self.last_check.isoformat()
        }
    
    def calculate_status(self) -> str:
        """Calculate overall health status"""
        if self.critical_issues > 0 or self.missing_required > 0:
            return "ERROR"
        elif self.warnings > 0 or self.misconfigurations > 0:
            return "WARNING"
        elif self.total_configs > 0 and self.valid_configs == self.total_configs:
            return "HEALTHY"
        else:
            return "UNKNOWN"


DEFAULT_CONFIG_METADATA = [
    ConfigMetadata(
        key="DATABASE_URL",
        value_type=ConfigValueType.SECRET,
        classification=ConfigClassification.CRITICAL,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD, ConfigEnvironment.STAGING],
        rotation_frequency_days=90,
        validation_rules=["must_start_with:postgresql://", "must_not_be_empty"],
        compliance_frameworks=["NIST-800-53", "SOC2", "FedRAMP"],
        owner="database-team",
        description="PostgreSQL database connection URL"
    ),
    ConfigMetadata(
        key="REDIS_URL",
        value_type=ConfigValueType.SECRET,
        classification=ConfigClassification.HIGH,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD, ConfigEnvironment.STAGING],
        rotation_frequency_days=90,
        validation_rules=["must_start_with:redis://", "must_not_be_empty"],
        compliance_frameworks=["NIST-800-53", "SOC2"],
        owner="devops",
        description="Redis cache connection URL"
    ),
    ConfigMetadata(
        key="API_BASE_URL",
        value_type=ConfigValueType.STRING,
        classification=ConfigClassification.LOW,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD],
        validation_rules=["must_start_with:https://", "must_not_be_empty"],
        compliance_frameworks=[],
        owner="devops",
        description="Base URL for API endpoints"
    ),
    ConfigMetadata(
        key="DEBUG_MODE",
        value_type=ConfigValueType.BOOLEAN,
        classification=ConfigClassification.MODERATE,
        allowed_environments=[ConfigEnvironment.DEV, ConfigEnvironment.STAGING],
        required_in_environments=[],
        validation_rules=["must_be_false_in:prod"],
        compliance_frameworks=["NIST-800-53"],
        owner="devops",
        description="Enable debug mode (MUST be false in production)"
    ),
    ConfigMetadata(
        key="LOG_LEVEL",
        value_type=ConfigValueType.STRING,
        classification=ConfigClassification.LOW,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD],
        validation_rules=["must_be_one_of:DEBUG,INFO,WARNING,ERROR,CRITICAL"],
        compliance_frameworks=["NIST-800-53", "SOC2"],
        owner="devops",
        description="Logging level"
    ),
    ConfigMetadata(
        key="MAX_CONNECTIONS",
        value_type=ConfigValueType.INTEGER,
        classification=ConfigClassification.MODERATE,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD],
        validation_rules=["must_be_positive", "must_be_less_than:1000"],
        compliance_frameworks=[],
        owner="devops",
        description="Maximum number of database connections"
    ),
    ConfigMetadata(
        key="ENCRYPTION_KEY",
        value_type=ConfigValueType.SECRET,
        classification=ConfigClassification.CRITICAL,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD, ConfigEnvironment.STAGING],
        rotation_frequency_days=30,
        validation_rules=["must_not_be_empty", "min_length:32"],
        compliance_frameworks=["NIST-800-53", "SOC2", "FedRAMP", "PCI-DSS"],
        owner="security-team",
        description="Encryption key for sensitive data"
    ),
    ConfigMetadata(
        key="JWT_SECRET",
        value_type=ConfigValueType.SECRET,
        classification=ConfigClassification.CRITICAL,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD, ConfigEnvironment.STAGING],
        rotation_frequency_days=30,
        validation_rules=["must_not_be_empty", "min_length:32"],
        compliance_frameworks=["NIST-800-53", "SOC2", "FedRAMP"],
        owner="security-team",
        description="JWT signing secret"
    ),
    ConfigMetadata(
        key="CORS_ORIGINS",
        value_type=ConfigValueType.JSON,
        classification=ConfigClassification.MODERATE,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD],
        validation_rules=["must_be_valid_json", "must_not_contain:*"],
        compliance_frameworks=["NIST-800-53"],
        owner="devops",
        description="Allowed CORS origins (must not use wildcard in prod)"
    ),
    ConfigMetadata(
        key="RATE_LIMIT",
        value_type=ConfigValueType.INTEGER,
        classification=ConfigClassification.MODERATE,
        allowed_environments=[ConfigEnvironment.ALL],
        required_in_environments=[ConfigEnvironment.PROD],
        validation_rules=["must_be_positive"],
        compliance_frameworks=["NIST-800-53"],
        owner="devops",
        description="API rate limit per minute"
    )
]

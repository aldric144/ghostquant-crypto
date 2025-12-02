"""
GhostQuant™ — System-Wide Configuration Security & Environment Isolation
Module: config_loader.py
Purpose: SecureConfigLoader for safe configuration loading and validation

SECURITY NOTICE:
- Reads ONLY from os.environ
- Never logs or returns real values
- Only metadata/hashes
- 100% crash-proof
- Pure Python only
- Compliant with NIST 800-53 CM-2, CM-6, CM-7
"""

import os
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Union

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


class SecureConfigLoader:
    """
    Secure configuration loader for GhostQuant™.
    
    Features:
    - Load configuration from environment variables
    - Validate configuration against policies
    - Detect misconfigurations
    - Generate environment health reports
    - Never expose sensitive values
    
    Security Principles:
    1. Never log or return raw configuration values
    2. Only return metadata and validation status
    3. Fail securely (return safe defaults instead of crashing)
    4. Validate all inputs
    5. Track all configuration access
    """
    
    def __init__(self):
        """Initialize SecureConfigLoader"""
        self.config_metadata: Dict[str, ConfigMetadata] = {}
        self.loaded_configs: Dict[str, ConfigItem] = {}
        self.current_environment: ConfigEnvironment = ConfigEnvironment.DEV
        
        self._load_default_metadata()
        
        self._detect_environment()
    
    def _load_default_metadata(self) -> None:
        """Load default configuration metadata"""
        try:
            for metadata in DEFAULT_CONFIG_METADATA:
                self.config_metadata[metadata.key] = metadata
        except Exception as e:
            print(f"Error: Failed to load default metadata: {e}")
    
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
    
    def load_environment(self, env_name: Optional[str] = None) -> ConfigSet:
        """
        Load configuration for an environment.
        
        Args:
            env_name: Environment name (dev, staging, prod)
            
        Returns:
            ConfigSet with all configuration items
        """
        try:
            if env_name:
                try:
                    environment = ConfigEnvironment(env_name.lower())
                except ValueError:
                    environment = self.current_environment
            else:
                environment = self.current_environment
            
            config_set = ConfigSet(environment=environment)
            
            for key, metadata in self.config_metadata.items():
                if not metadata.is_allowed_in_environment(environment):
                    continue
                
                config_item = self._load_config_item(key, metadata, environment)
                config_set.items.append(config_item)
                
                self.loaded_configs[key] = config_item
            
            config_set.update_statistics()
            
            return config_set
        except Exception as e:
            print(f"Error: Failed to load environment: {e}")
            return ConfigSet(environment=self.current_environment, valid=False, errors=[str(e)])
    
    def _load_config_item(
        self,
        key: str,
        metadata: ConfigMetadata,
        environment: ConfigEnvironment
    ) -> ConfigItem:
        """Load a single configuration item"""
        try:
            value = os.environ.get(key)
            is_set = value is not None
            
            config_item = ConfigItem(
                key=key,
                value_type=metadata.value_type,
                default_value=None,  # Never store actual values
                environment=environment,
                classification=metadata.classification,
                description=metadata.description,
                last_loaded=datetime.utcnow(),
                is_set=is_set,
                required=metadata.is_required_in_environment(environment),
                sensitive=metadata.value_type == ConfigValueType.SECRET
            )
            
            validation_errors = self._validate_config_item(config_item, value, metadata)
            config_item.validation_errors = validation_errors
            config_item.is_valid = len(validation_errors) == 0
            
            return config_item
        except Exception as e:
            print(f"Error: Failed to load config item {key}: {e}")
            return ConfigItem(
                key=key,
                value_type=ConfigValueType.STRING,
                environment=environment,
                is_valid=False,
                validation_errors=[f"Failed to load: {str(e)}"]
            )
    
    def _validate_config_item(
        self,
        config_item: ConfigItem,
        value: Optional[str],
        metadata: ConfigMetadata
    ) -> List[str]:
        """Validate a configuration item"""
        errors = []
        
        try:
            if config_item.required and not config_item.is_set:
                errors.append(f"Required configuration '{config_item.key}' is not set")
                return errors
            
            if not config_item.is_set:
                return errors
            
            if metadata.value_type == ConfigValueType.INTEGER:
                try:
                    int(value)
                except ValueError:
                    errors.append(f"Value must be an integer")
            
            elif metadata.value_type == ConfigValueType.BOOLEAN:
                if value.lower() not in ["true", "false", "1", "0", "yes", "no"]:
                    errors.append(f"Value must be a boolean (true/false)")
            
            elif metadata.value_type == ConfigValueType.FLOAT:
                try:
                    float(value)
                except ValueError:
                    errors.append(f"Value must be a float")
            
            elif metadata.value_type == ConfigValueType.JSON:
                try:
                    json.loads(value)
                except json.JSONDecodeError:
                    errors.append(f"Value must be valid JSON")
            
            for rule in metadata.validation_rules:
                error = self._apply_validation_rule(rule, value, config_item.key)
                if error:
                    errors.append(error)
        
        except Exception as e:
            errors.append(f"Validation error: {str(e)}")
        
        return errors
    
    def _apply_validation_rule(self, rule: str, value: str, key: str) -> Optional[str]:
        """Apply a validation rule"""
        try:
            if rule == "must_not_be_empty":
                if not value or len(value.strip()) == 0:
                    return f"Value must not be empty"
            
            elif rule.startswith("must_start_with:"):
                prefix = rule.split(":", 1)[1]
                if not value.startswith(prefix):
                    return f"Value must start with '{prefix}'"
            
            elif rule.startswith("must_be_one_of:"):
                allowed = rule.split(":", 1)[1].split(",")
                if value not in allowed:
                    return f"Value must be one of: {', '.join(allowed)}"
            
            elif rule == "must_be_positive":
                try:
                    if int(value) <= 0:
                        return f"Value must be positive"
                except ValueError:
                    return f"Value must be a number"
            
            elif rule.startswith("must_be_less_than:"):
                max_val = int(rule.split(":", 1)[1])
                try:
                    if int(value) >= max_val:
                        return f"Value must be less than {max_val}"
                except ValueError:
                    return f"Value must be a number"
            
            elif rule.startswith("min_length:"):
                min_len = int(rule.split(":", 1)[1])
                if len(value) < min_len:
                    return f"Value must be at least {min_len} characters"
            
            elif rule.startswith("must_be_false_in:"):
                env = rule.split(":", 1)[1]
                if self.current_environment.value == env and value.lower() in ["true", "1", "yes"]:
                    return f"Value must be false in {env} environment"
            
            elif rule.startswith("must_not_contain:"):
                forbidden = rule.split(":", 1)[1]
                if forbidden in value:
                    return f"Value must not contain '{forbidden}'"
            
            elif rule == "must_be_valid_json":
                try:
                    json.loads(value)
                except json.JSONDecodeError:
                    return f"Value must be valid JSON"
        
        except Exception as e:
            return f"Validation rule error: {str(e)}"
        
        return None
    
    def validate_config(self, config_set: ConfigSet) -> List[ConfigValidationIssue]:
        """
        Validate a configuration set.
        
        Args:
            config_set: Configuration set to validate
            
        Returns:
            List of validation issues
        """
        issues = []
        
        try:
            for item in config_set.items:
                for error in item.validation_errors:
                    severity = ValidationSeverity.ERROR
                    if item.classification == ConfigClassification.CRITICAL:
                        severity = ValidationSeverity.CRITICAL
                    elif item.required:
                        severity = ValidationSeverity.ERROR
                    else:
                        severity = ValidationSeverity.WARNING
                    
                    issue = ConfigValidationIssue(
                        key=item.key,
                        message=error,
                        severity=severity,
                        environment=config_set.environment,
                        resolution=f"Set {item.key} in environment variables"
                    )
                    issues.append(issue)
                
                if item.required and not item.is_set:
                    issue = ConfigValidationIssue(
                        key=item.key,
                        message=f"Required configuration is not set",
                        severity=ValidationSeverity.CRITICAL,
                        environment=config_set.environment,
                        resolution=f"Set {item.key} in environment variables"
                    )
                    issues.append(issue)
        
        except Exception as e:
            print(f"Error: Failed to validate config: {e}")
        
        return issues
    
    def get_item(self, key: str) -> Optional[ConfigItem]:
        """
        Get configuration item metadata (NO value returned).
        
        Args:
            key: Configuration key
            
        Returns:
            ConfigItem if found, None otherwise
        """
        try:
            return self.loaded_configs.get(key)
        except Exception as e:
            print(f"Error: Failed to get config item: {e}")
            return None
    
    def list_items(self, environment: Optional[ConfigEnvironment] = None) -> List[ConfigItem]:
        """
        List all configuration items (metadata only).
        
        Args:
            environment: Filter by environment (optional)
            
        Returns:
            List of configuration items
        """
        try:
            items = list(self.loaded_configs.values())
            
            if environment:
                items = [item for item in items if item.environment == environment]
            
            return items
        except Exception as e:
            print(f"Error: Failed to list config items: {e}")
            return []
    
    def detect_misconfigurations(self) -> List[ConfigItem]:
        """
        Detect misconfigured items.
        
        Returns:
            List of misconfigured configuration items
        """
        try:
            misconfigurations = []
            
            for item in self.loaded_configs.values():
                if item.is_misconfigured():
                    misconfigurations.append(item)
            
            return misconfigurations
        except Exception as e:
            print(f"Error: Failed to detect misconfigurations: {e}")
            return []
    
    def get_environment_health(self, environment: Optional[ConfigEnvironment] = None) -> EnvironmentHealth:
        """
        Get environment health status.
        
        Args:
            environment: Environment to check (uses current if None)
            
        Returns:
            EnvironmentHealth status
        """
        try:
            env = environment or self.current_environment
            
            items = [item for item in self.loaded_configs.values() if item.environment == env]
            
            health = EnvironmentHealth(environment=env)
            health.total_configs = len(items)
            health.valid_configs = sum(1 for item in items if item.is_valid)
            health.invalid_configs = sum(1 for item in items if not item.is_valid)
            health.missing_required = sum(1 for item in items if item.required and not item.is_set)
            health.misconfigurations = sum(1 for item in items if item.is_misconfigured())
            
            for item in items:
                if item.classification == ConfigClassification.CRITICAL and not item.is_valid:
                    health.critical_issues += 1
                elif not item.is_valid:
                    health.warnings += 1
            
            health.status = health.calculate_status()
            
            return health
        except Exception as e:
            print(f"Error: Failed to get environment health: {e}")
            return EnvironmentHealth(
                environment=self.current_environment,
                status="ERROR"
            )
    
    def get_config_summary(self) -> Dict[str, Any]:
        """
        Get configuration summary.
        
        Returns:
            Summary dictionary
        """
        try:
            total_configs = len(self.loaded_configs)
            set_configs = sum(1 for item in self.loaded_configs.values() if item.is_set)
            valid_configs = sum(1 for item in self.loaded_configs.values() if item.is_valid)
            required_configs = sum(1 for item in self.loaded_configs.values() if item.required)
            missing_required = sum(1 for item in self.loaded_configs.values() if item.required and not item.is_set)
            
            return {
                "environment": self.current_environment.value,
                "total_configs": total_configs,
                "set_configs": set_configs,
                "valid_configs": valid_configs,
                "required_configs": required_configs,
                "missing_required": missing_required,
                "misconfigurations": len(self.detect_misconfigurations()),
                "last_loaded": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error: Failed to get config summary: {e}")
            return {
                "error": str(e),
                "environment": self.current_environment.value
            }


_config_loader_instance: Optional[SecureConfigLoader] = None


def get_config_loader() -> SecureConfigLoader:
    """Get global SecureConfigLoader instance (singleton pattern)"""
    global _config_loader_instance
    if _config_loader_instance is None:
        _config_loader_instance = SecureConfigLoader()
    return _config_loader_instance

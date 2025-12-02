"""
GhostQuant™ — System-Wide Configuration Security & Environment Isolation
Module: api_config.py
Purpose: FastAPI router for configuration management API endpoints

SECURITY NOTICE:
- All endpoints return JSON only (never raise exceptions)
- No raw configuration values are ever returned
- Only metadata and validation status
- 100% crash-proof implementation
- Compliant with NIST 800-53 CM-2, CM-6, CM-7
"""

from fastapi import APIRouter, Request
from typing import Dict, List, Optional, Any
from datetime import datetime

from .config_loader import get_config_loader
from .environment_isolation import get_isolation_manager, IsolationAction
from .config_governance import get_governance_registry
from .config_schema import ConfigEnvironment, ConfigClassification


router = APIRouter()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    try:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"
    except Exception:
        return "127.0.0.1"


@router.get("/")
async def config_root(request: Request) -> Dict[str, Any]:
    """
    Root endpoint for configuration API.
    
    Returns:
        API information dictionary
    """
    try:
        return {
            "service": "GhostQuant™ Configuration Security API",
            "version": "1.0.0",
            "status": "operational",
            "endpoints": [
                "GET /config - Get configuration summary",
                "GET /config/environment - Get current environment",
                "GET /config/items - List all configuration items",
                "GET /config/item/{key} - Get specific configuration metadata",
                "GET /config/validate - Validate configuration",
                "GET /config/isolation - Get environment isolation report",
                "GET /config/governance - Get governance report",
                "GET /config/health - Health check",
            ],
            "security": {
                "authentication": "Required",
                "metadata_only": "No raw values returned",
                "environment_isolation": "Enforced"
            },
            "compliance": [
                "NIST 800-53 CM-2, CM-6, CM-7, AC-3",
                "SOC 2 CC6.1, CC7.2",
                "FedRAMP CM-2, CM-6, AC-3"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "error": "Failed to get API information",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config")
async def get_config_summary(request: Request) -> Dict[str, Any]:
    """
    Get configuration summary.
    
    Returns:
        Configuration summary dictionary
    """
    try:
        config_loader = get_config_loader()
        summary = config_loader.get_config_summary()
        
        return {
            "success": True,
            "summary": summary,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get configuration summary",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/environment")
async def get_environment(request: Request) -> Dict[str, Any]:
    """
    Get current environment information.
    
    Returns:
        Environment information dictionary
    """
    try:
        config_loader = get_config_loader()
        isolation_manager = get_isolation_manager()
        
        current_env = isolation_manager.get_current_environment()
        health = config_loader.get_environment_health(current_env)
        
        return {
            "success": True,
            "environment": current_env.value,
            "health": health.to_dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get environment information",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/items")
async def list_config_items(
    request: Request,
    environment: Optional[str] = None
) -> Dict[str, Any]:
    """
    List all configuration items (metadata only).
    
    Args:
        environment: Filter by environment (optional)
        
    Returns:
        List of configuration items
    """
    try:
        config_loader = get_config_loader()
        
        env = None
        if environment:
            try:
                env = ConfigEnvironment(environment.lower())
            except ValueError:
                pass
        
        items = config_loader.list_items(environment=env)
        
        return {
            "success": True,
            "count": len(items),
            "items": [item.to_dict() for item in items],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to list configuration items",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/item/{key}")
async def get_config_item(
    key: str,
    request: Request
) -> Dict[str, Any]:
    """
    Get configuration item metadata (NO value returned).
    
    Args:
        key: Configuration key
        
    Returns:
        Configuration item metadata
    """
    try:
        config_loader = get_config_loader()
        item = config_loader.get_item(key)
        
        if item:
            return {
                "success": True,
                "item": item.to_dict(),
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Configuration item not found",
                "key": key,
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get configuration item",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/validate")
async def validate_configuration(
    request: Request,
    environment: Optional[str] = None
) -> Dict[str, Any]:
    """
    Validate configuration for an environment.
    
    Args:
        environment: Environment to validate (uses current if None)
        
    Returns:
        Validation results
    """
    try:
        config_loader = get_config_loader()
        
        config_set = config_loader.load_environment(environment)
        
        issues = config_loader.validate_config(config_set)
        
        misconfigurations = config_loader.detect_misconfigurations()
        
        return {
            "success": True,
            "environment": config_set.environment.value,
            "valid": config_set.valid,
            "total_items": config_set.total_items,
            "set_items": config_set.set_items,
            "missing_required": config_set.missing_required,
            "issues": [issue.to_dict() for issue in issues],
            "misconfigurations": [item.to_dict() for item in misconfigurations],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to validate configuration",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/isolation")
async def get_isolation_report(request: Request) -> Dict[str, Any]:
    """
    Get environment isolation report.
    
    Returns:
        Isolation report dictionary
    """
    try:
        isolation_manager = get_isolation_manager()
        report = isolation_manager.get_isolation_report()
        
        return {
            "success": True,
            "report": report,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get isolation report",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/isolation/violations")
async def get_isolation_violations(
    request: Request,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Get recent isolation violations.
    
    Args:
        limit: Maximum number of violations to return
        
    Returns:
        Violations list
    """
    try:
        isolation_manager = get_isolation_manager()
        violations = isolation_manager.get_violations(limit=limit)
        
        return {
            "success": True,
            "count": len(violations),
            "violations": violations,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get isolation violations",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/isolation/allowed")
async def get_allowed_actions(
    request: Request,
    target_environment: str
) -> Dict[str, Any]:
    """
    Get allowed actions for target environment.
    
    Args:
        target_environment: Target environment (dev, staging, prod)
        
    Returns:
        Allowed actions list
    """
    try:
        isolation_manager = get_isolation_manager()
        
        try:
            target_env = ConfigEnvironment(target_environment.lower())
        except ValueError:
            return {
                "success": False,
                "error": f"Invalid environment: {target_environment}",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        allowed = isolation_manager.get_allowed_actions(target_env)
        blocked = isolation_manager.get_blocked_actions(target_env)
        
        return {
            "success": True,
            "target_environment": target_env.value,
            "allowed_actions": allowed,
            "blocked_actions": blocked,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get allowed actions",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/governance")
async def get_governance_report(request: Request) -> Dict[str, Any]:
    """
    Get comprehensive governance report.
    
    Returns:
        Governance report dictionary
    """
    try:
        governance_registry = get_governance_registry()
        report = governance_registry.get_governance_report()
        
        return {
            "success": True,
            "report": report,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get governance report",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/governance/policies")
async def list_governance_policies(
    request: Request,
    active_only: bool = True
) -> Dict[str, Any]:
    """
    List all governance policies.
    
    Args:
        active_only: Whether to include only active policies
        
    Returns:
        Policies list
    """
    try:
        governance_registry = get_governance_registry()
        policies = governance_registry.list_policies(active_only=active_only)
        
        return {
            "success": True,
            "count": len(policies),
            "policies": policies,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to list governance policies",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/governance/violations")
async def detect_governance_violations(request: Request) -> Dict[str, Any]:
    """
    Detect governance policy violations.
    
    Returns:
        Violations list
    """
    try:
        governance_registry = get_governance_registry()
        violations = governance_registry.detect_policy_violations()
        
        return {
            "success": True,
            "count": len(violations),
            "violations": violations,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to detect governance violations",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/governance/compliance")
async def get_compliance_summary(request: Request) -> Dict[str, Any]:
    """
    Get compliance summary.
    
    Returns:
        Compliance summary dictionary
    """
    try:
        governance_registry = get_governance_registry()
        summary = governance_registry.get_compliance_summary()
        
        return {
            "success": True,
            "compliance": summary,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get compliance summary",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/misconfigurations")
async def detect_misconfigurations(request: Request) -> Dict[str, Any]:
    """
    Detect misconfigured items.
    
    Returns:
        Misconfigurations list
    """
    try:
        config_loader = get_config_loader()
        misconfigurations = config_loader.detect_misconfigurations()
        
        return {
            "success": True,
            "count": len(misconfigurations),
            "misconfigurations": [item.to_dict() for item in misconfigurations],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to detect misconfigurations",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/config/health")
async def health_check(request: Request) -> Dict[str, Any]:
    """
    Perform health check on configuration system.
    
    Returns:
        Health status dictionary
    """
    try:
        config_loader = get_config_loader()
        isolation_manager = get_isolation_manager()
        governance_registry = get_governance_registry()
        
        current_env = isolation_manager.get_current_environment()
        
        env_health = config_loader.get_environment_health(current_env)
        
        config_summary = config_loader.get_config_summary()
        
        governance_summary = governance_registry.get_compliance_summary()
        
        isolation_report = isolation_manager.get_isolation_report()
        
        return {
            "success": True,
            "health": {
                "status": env_health.status,
                "environment": {
                    "name": current_env.value,
                    "total_configs": env_health.total_configs,
                    "valid_configs": env_health.valid_configs,
                    "invalid_configs": env_health.invalid_configs,
                    "missing_required": env_health.missing_required,
                    "misconfigurations": env_health.misconfigurations,
                    "critical_issues": env_health.critical_issues,
                    "warnings": env_health.warnings
                },
                "configuration": {
                    "total_configs": config_summary.get("total_configs", 0),
                    "set_configs": config_summary.get("set_configs", 0),
                    "valid_configs": config_summary.get("valid_configs", 0),
                    "required_configs": config_summary.get("required_configs", 0),
                    "missing_required": config_summary.get("missing_required", 0),
                    "misconfigurations": config_summary.get("misconfigurations", 0)
                },
                "governance": {
                    "compliance_score": governance_summary.get("compliance_score", 0),
                    "status": governance_summary.get("status", "UNKNOWN"),
                    "total_violations": governance_summary.get("total_violations", 0),
                    "critical_violations": governance_summary.get("critical_violations", 0)
                },
                "isolation": {
                    "status": isolation_report.get("isolation_status", "UNKNOWN"),
                    "total_violations": isolation_report.get("total_violations", 0),
                    "current_environment": isolation_report.get("current_environment", "unknown")
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to perform health check",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

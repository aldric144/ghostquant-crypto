"""
GhostQuant™ — Secure Key Management & Secrets Governance
Module: api_secrets.py
Purpose: FastAPI router for secrets management API endpoints

SECURITY NOTICE:
- All endpoints return JSON only (never raise exceptions)
- No raw secret values are ever returned
- All access is logged for audit compliance
- Crash-proof implementation with comprehensive error handling
- Compliant with NIST 800-53 SC-12, SC-13, AC-3, AU-2
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Dict, List, Optional, Any
from datetime import datetime

from .secret_manager import get_secret_manager
from .key_rotation_engine import get_rotation_engine
from .governance_registry import get_governance_registry
from .secret_schema import SecretMetadata, SecretClassification, SecretEnvironment


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
async def secrets_root(request: Request) -> Dict[str, Any]:
    """
    Root endpoint for secrets API.
    
    Returns:
        API information dictionary
    """
    try:
        return {
            "service": "GhostQuant™ Secrets Management API",
            "version": "1.0.0",
            "status": "operational",
            "endpoints": [
                "GET /secrets - List all secrets (metadata only)",
                "GET /secrets/{name} - Get secret metadata",
                "POST /secrets/set - Set a secret value",
                "POST /secrets/rotate/{name} - Rotate a secret",
                "POST /secrets/delete/{name} - Delete a secret",
                "GET /secrets/metadata - Export all metadata",
                "GET /secrets/governance - Get governance report",
                "GET /secrets/logs - Get access logs",
                "GET /secrets/health - Health check"
            ],
            "security": {
                "authentication": "Required",
                "audit_logging": "Enabled",
                "encryption": "SHA-256 hashing"
            },
            "compliance": [
                "NIST 800-53 SC-12, SC-13, AC-3, AU-2",
                "SOC 2 CC6.1, CC6.2, CC7.2",
                "FedRAMP AC-3, IA-5, AU-2"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "error": "Failed to get API information",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets")
async def list_secrets(
    request: Request,
    include_inactive: bool = False,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    List all secrets (metadata only, no values).
    
    Args:
        include_inactive: Whether to include inactive secrets
        actor: User/service requesting the list
        
    Returns:
        Dictionary containing list of secrets
    """
    try:
        secret_manager = get_secret_manager()
        ip = get_client_ip(request)
        
        secrets = secret_manager.list_secrets(
            actor=actor,
            ip=ip,
            include_inactive=include_inactive
        )
        
        return {
            "success": True,
            "count": len(secrets),
            "secrets": secrets,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to list secrets",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/{name}")
async def get_secret_metadata(
    name: str,
    request: Request,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    Get metadata for a specific secret (no value returned).
    
    Args:
        name: Name of the secret
        actor: User/service requesting metadata
        
    Returns:
        Secret metadata dictionary
    """
    try:
        secret_manager = get_secret_manager()
        ip = get_client_ip(request)
        
        secret_manager.record_access(
            name=name,
            actor=actor,
            action="READ",
            ip=ip,
            success=True,
            reason="get_metadata"
        )
        
        metadata = secret_manager.get_secret_metadata(name)
        
        if metadata:
            return {
                "success": True,
                "secret": metadata,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Secret not found",
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get secret metadata",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/secrets/set")
async def set_secret(
    request: Request,
    name: str,
    value: str,
    actor: str = "api-user",
    owner: Optional[str] = None,
    purpose: Optional[str] = None,
    environment: Optional[str] = None,
    classification: Optional[str] = None
) -> Dict[str, Any]:
    """
    Set a secret value.
    
    Args:
        name: Name of the secret
        value: Secret value (will be hashed, not stored raw)
        actor: User/service setting the secret
        owner: Owner of the secret
        purpose: Purpose of the secret
        environment: Environment (PRODUCTION, STAGING, DEVELOPMENT)
        classification: Classification (CRITICAL, HIGH, MODERATE, LOW)
        
    Returns:
        Success/failure dictionary
    """
    try:
        secret_manager = get_secret_manager()
        ip = get_client_ip(request)
        
        metadata = None
        if owner or purpose or environment or classification:
            metadata = SecretMetadata(
                owner=owner or "system",
                purpose=purpose or f"Secret: {name}",
                environment=SecretEnvironment(environment) if environment else SecretEnvironment.PRODUCTION,
                classification=SecretClassification(classification) if classification else SecretClassification.MODERATE
            )
        
        success = secret_manager.set_secret(
            name=name,
            value=value,
            actor=actor,
            ip=ip,
            metadata=metadata
        )
        
        if success:
            return {
                "success": True,
                "message": "Secret set successfully",
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Failed to set secret",
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to set secret",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/secrets/rotate/{name}")
async def rotate_secret(
    name: str,
    request: Request,
    new_value: str,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    Rotate a secret to a new value.
    
    Args:
        name: Name of the secret to rotate
        new_value: New secret value
        actor: User/service rotating the secret
        
    Returns:
        Success/failure dictionary
    """
    try:
        secret_manager = get_secret_manager()
        ip = get_client_ip(request)
        
        success = secret_manager.rotate_secret(
            name=name,
            new_value=new_value,
            actor=actor,
            ip=ip
        )
        
        if success:
            metadata = secret_manager.get_secret_metadata(name)
            return {
                "success": True,
                "message": "Secret rotated successfully",
                "name": name,
                "rotations_count": metadata.get("rotations_count", 0) if metadata else 0,
                "last_rotated": metadata.get("last_rotated") if metadata else None,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Failed to rotate secret",
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to rotate secret",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/secrets/delete/{name}")
async def delete_secret(
    name: str,
    request: Request,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    Delete a secret (marks as inactive).
    
    Args:
        name: Name of the secret to delete
        actor: User/service deleting the secret
        
    Returns:
        Success/failure dictionary
    """
    try:
        secret_manager = get_secret_manager()
        ip = get_client_ip(request)
        
        success = secret_manager.delete_secret(
            name=name,
            actor=actor,
            ip=ip
        )
        
        if success:
            return {
                "success": True,
                "message": "Secret deleted successfully",
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Failed to delete secret",
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to delete secret",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/metadata")
async def export_metadata(
    request: Request,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    Export all secrets metadata for backup/audit.
    
    Args:
        actor: User/service exporting metadata
        
    Returns:
        Metadata export dictionary
    """
    try:
        secret_manager = get_secret_manager()
        ip = get_client_ip(request)
        
        metadata = secret_manager.export_metadata(
            actor=actor,
            ip=ip
        )
        
        return {
            "success": True,
            "metadata": metadata,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to export metadata",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/governance")
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


@router.get("/secrets/governance/policies")
async def list_governance_policies(
    request: Request,
    active_only: bool = True
) -> Dict[str, Any]:
    """
    List all governance policies.
    
    Args:
        active_only: Whether to include only active policies
        
    Returns:
        Policies list dictionary
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


@router.get("/secrets/governance/violations")
async def detect_policy_violations(request: Request) -> Dict[str, Any]:
    """
    Detect policy violations across all secrets.
    
    Returns:
        Violations list dictionary
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
            "error": "Failed to detect policy violations",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/rotation/report")
async def get_rotation_report(request: Request) -> Dict[str, Any]:
    """
    Get comprehensive rotation report.
    
    Returns:
        Rotation report dictionary
    """
    try:
        rotation_engine = get_rotation_engine()
        
        report = rotation_engine.generate_rotation_report()
        
        return {
            "success": True,
            "report": report,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get rotation report",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/rotation/stale")
async def detect_stale_keys(
    request: Request,
    threshold_days: Optional[int] = None
) -> Dict[str, Any]:
    """
    Detect secrets that need rotation.
    
    Args:
        threshold_days: Override threshold (uses secret's rotation_frequency_days if None)
        
    Returns:
        Stale secrets list dictionary
    """
    try:
        rotation_engine = get_rotation_engine()
        
        stale_secrets = rotation_engine.detect_stale_keys(threshold_days=threshold_days)
        
        return {
            "success": True,
            "count": len(stale_secrets),
            "stale_secrets": stale_secrets,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to detect stale keys",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/secrets/rotation/rotate-all")
async def rotate_all_secrets(
    request: Request,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    Rotate all active secrets.
    
    Args:
        actor: User/service performing rotation
        
    Returns:
        Rotation summary dictionary
    """
    try:
        rotation_engine = get_rotation_engine()
        ip = get_client_ip(request)
        
        results = rotation_engine.rotate_all(actor=actor, ip=ip)
        
        return {
            "success": True,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to rotate all secrets",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/secrets/rotation/rotate-critical")
async def rotate_critical_secrets(
    request: Request,
    actor: str = "api-user"
) -> Dict[str, Any]:
    """
    Rotate only CRITICAL and HIGH classification secrets.
    
    Args:
        actor: User/service performing rotation
        
    Returns:
        Rotation summary dictionary
    """
    try:
        rotation_engine = get_rotation_engine()
        ip = get_client_ip(request)
        
        results = rotation_engine.rotate_critical_only(actor=actor, ip=ip)
        
        return {
            "success": True,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to rotate critical secrets",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/secrets/rotation/auto-rotate")
async def auto_rotate_secrets(
    request: Request,
    actor: str = "auto-rotation"
) -> Dict[str, Any]:
    """
    Automatically rotate secrets that are past their rotation threshold.
    
    Args:
        actor: User/service performing rotation
        
    Returns:
        Auto-rotation summary dictionary
    """
    try:
        rotation_engine = get_rotation_engine()
        ip = get_client_ip(request)
        
        results = rotation_engine.auto_rotate_if_needed(actor=actor, ip=ip)
        
        return {
            "success": True,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to auto-rotate secrets",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/logs")
async def get_access_logs(
    request: Request,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Get recent access logs.
    
    Args:
        limit: Maximum number of logs to return
        
    Returns:
        Access logs dictionary
    """
    try:
        secret_manager = get_secret_manager()
        
        logs = secret_manager.get_access_logs(limit=limit)
        
        return {
            "success": True,
            "count": len(logs),
            "logs": logs,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Failed to get access logs",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/secrets/health")
async def health_check(request: Request) -> Dict[str, Any]:
    """
    Perform health check on secrets management system.
    
    Returns:
        Health status dictionary
    """
    try:
        secret_manager = get_secret_manager()
        rotation_engine = get_rotation_engine()
        governance_registry = get_governance_registry()
        
        health = secret_manager.health_check()
        
        rotation_stats = rotation_engine.get_rotation_statistics()
        
        governance_report = governance_registry.get_governance_report()
        
        return {
            "success": True,
            "health": {
                "status": health.get("status", "UNKNOWN"),
                "secrets": {
                    "total": health.get("total_secrets", 0),
                    "active": health.get("active_secrets", 0),
                    "stale": health.get("stale_secrets", 0),
                    "critical": health.get("critical_secrets", 0)
                },
                "rotation": {
                    "total_rotations": rotation_stats.get("total_rotations", 0),
                    "successful": rotation_stats.get("successful_rotations", 0),
                    "failed": rotation_stats.get("failed_rotations", 0),
                    "last_24h": rotation_stats.get("rotations_last_24h", 0)
                },
                "governance": {
                    "total_policies": governance_report.get("summary", {}).get("total_policies", 0),
                    "total_violations": governance_report.get("summary", {}).get("total_violations", 0),
                    "critical_violations": governance_report.get("summary", {}).get("critical_violations", 0),
                    "compliance_percentage": governance_report.get("summary", {}).get("compliance_percentage", 0)
                },
                "audit": {
                    "total_logs": health.get("total_access_logs", 0)
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

"""
License API Router

FastAPI router for Enterprise API Licensing Framework endpoints.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, Optional, List
from .license_engine import LicenseEngine

router = APIRouter(prefix="/license", tags=["API Licensing"])

license_engine = LicenseEngine()


@router.post("/create")
async def create_license(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new API license
    
    Request body:
    {
        "customer_name": "Acme Corp",
        "customer_email": "api@acme.com",
        "tier": "enterprise",
        "custom_permissions": {...},  // optional
        "expires_in_days": 365,  // optional
        "ip_whitelist": ["1.2.3.4"]  // optional
    }
    """
    try:
        customer_name = request_data.get('customer_name')
        customer_email = request_data.get('customer_email')
        tier = request_data.get('tier')
        
        if not customer_name or not customer_email or not tier:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: customer_name, customer_email, tier"
            )
        
        record = license_engine.create_license(
            customer_name=customer_name,
            customer_email=customer_email,
            tier=tier,
            custom_permissions=request_data.get('custom_permissions'),
            expires_in_days=request_data.get('expires_in_days'),
            ip_whitelist=request_data.get('ip_whitelist')
        )
        
        return {
            'success': True,
            'license': record.to_dict(),
            'message': f'License created successfully for {customer_name}'
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"License creation failed: {str(e)}")


@router.post("/validate")
async def validate_request(
    request: Request,
    validation_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Validate an API request
    
    Request body:
    {
        "api_key": "abc123...",
        "module_name": "fusion",
        "client_ip": "1.2.3.4"  // optional
    }
    """
    try:
        api_key = validation_data.get('api_key')
        module_name = validation_data.get('module_name')
        
        if not api_key or not module_name:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: api_key, module_name"
            )
        
        client_ip = validation_data.get('client_ip') or request.client.host
        
        result = license_engine.validate_request(
            api_key=api_key,
            module_name=module_name,
            client_ip=client_ip
        )
        
        if result.valid:
            license_engine.record_usage(
                api_key=api_key,
                module_name=module_name,
                client_ip=client_ip
            )
        
        return {
            'success': result.valid,
            'validation': result.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/usage/{api_key}")
async def get_usage(api_key: str) -> Dict[str, Any]:
    """Get usage statistics for a license"""
    try:
        usage = license_engine.get_usage(api_key)
        
        if usage is None:
            raise HTTPException(status_code=404, detail="License not found")
        
        return {
            'success': True,
            'usage': usage
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage: {str(e)}")


@router.get("/usage/{api_key}/history")
async def get_usage_history(api_key: str, limit: int = 100) -> Dict[str, Any]:
    """Get usage history for a license"""
    try:
        history = license_engine.get_usage_history(api_key=api_key, limit=limit)
        
        return {
            'success': True,
            'history': history,
            'count': len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage history: {str(e)}")


@router.get("/list")
async def list_licenses(
    status: Optional[str] = None,
    tier: Optional[str] = None
) -> Dict[str, Any]:
    """
    List all licenses
    
    Query parameters:
    - status: Filter by status (active, expired, revoked, suspended)
    - tier: Filter by tier (developer, business, enterprise, government)
    """
    try:
        licenses = license_engine.list_licenses(
            status_filter=status,
            tier_filter=tier
        )
        
        return {
            'success': True,
            'licenses': licenses,
            'count': len(licenses)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list licenses: {str(e)}")


@router.post("/revoke/{api_key}")
async def revoke_license(api_key: str, reason_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Revoke a license"""
    try:
        reason = reason_data.get('reason') if reason_data else None
        success = license_engine.revoke(api_key, reason)
        
        if not success:
            raise HTTPException(status_code=404, detail="License not found")
        
        return {
            'success': True,
            'message': f'License {api_key} revoked successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke license: {str(e)}")


@router.post("/suspend/{api_key}")
async def suspend_license(api_key: str) -> Dict[str, Any]:
    """Suspend a license"""
    try:
        success = license_engine.suspend(api_key)
        
        if not success:
            raise HTTPException(status_code=404, detail="License not found")
        
        return {
            'success': True,
            'message': f'License {api_key} suspended successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suspend license: {str(e)}")


@router.post("/reactivate/{api_key}")
async def reactivate_license(api_key: str) -> Dict[str, Any]:
    """Reactivate a suspended license"""
    try:
        success = license_engine.reactivate(api_key)
        
        if not success:
            raise HTTPException(status_code=404, detail="License not found or cannot be reactivated")
        
        return {
            'success': True,
            'message': f'License {api_key} reactivated successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reactivate license: {str(e)}")


@router.post("/update/{api_key}")
async def update_permissions(api_key: str, permissions_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update license permissions"""
    try:
        success = license_engine.update_permissions(api_key, permissions_data)
        
        if not success:
            raise HTTPException(status_code=404, detail="License not found")
        
        return {
            'success': True,
            'message': f'License {api_key} permissions updated successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update permissions: {str(e)}")


@router.post("/extend/{api_key}")
async def extend_expiration(api_key: str, extension_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extend license expiration"""
    try:
        additional_days = extension_data.get('additional_days')
        
        if not additional_days:
            raise HTTPException(status_code=400, detail="Missing required field: additional_days")
        
        success = license_engine.extend_expiration(api_key, additional_days)
        
        if not success:
            raise HTTPException(status_code=404, detail="License not found")
        
        return {
            'success': True,
            'message': f'License {api_key} extended by {additional_days} days'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extend license: {str(e)}")


@router.get("/export/{api_key}")
async def export_license(api_key: str) -> Dict[str, Any]:
    """Export license to JSON"""
    try:
        license_data = license_engine.export_license(api_key)
        
        if license_data is None:
            raise HTTPException(status_code=404, detail="License not found")
        
        return {
            'success': True,
            'license': license_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export license: {str(e)}")


@router.post("/import")
async def import_license(license_data: Dict[str, Any]) -> Dict[str, Any]:
    """Import license from JSON"""
    try:
        success = license_engine.import_license(license_data)
        
        if not success:
            raise HTTPException(status_code=400, detail="Invalid license data")
        
        return {
            'success': True,
            'message': 'License imported successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import license: {str(e)}")


@router.get("/analytics")
async def get_analytics() -> Dict[str, Any]:
    """Get platform-wide analytics"""
    try:
        analytics = license_engine.get_analytics()
        
        return {
            'success': True,
            'analytics': analytics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.get("/tiers")
async def get_tiers() -> Dict[str, Any]:
    """Get all tier definitions"""
    try:
        tiers = license_engine.get_all_tiers()
        
        return {
            'success': True,
            'tiers': tiers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tiers: {str(e)}")


@router.get("/tiers/{tier}")
async def get_tier_info(tier: str) -> Dict[str, Any]:
    """Get tier information"""
    try:
        tier_info = license_engine.get_tier_info(tier)
        
        if tier_info is None:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        return {
            'success': True,
            'tier': tier_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tier info: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check for license engine"""
    try:
        health = license_engine.health()
        
        return {
            'success': True,
            'health': health
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """Get license engine information"""
    try:
        info = license_engine.info()
        
        return {
            'success': True,
            'info': info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get info: {str(e)}")

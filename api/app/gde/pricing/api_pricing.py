"""
Pricing API Router

FastAPI router for Pricing Engine & Revenue Model Generator endpoints.
100% crash-proof with safe error handling.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from .pricing_engine import PricingEngine

router = APIRouter(prefix="/pricing", tags=["Pricing Engine"])

pricing_engine = PricingEngine()


@router.get("/tiers")
async def get_tiers() -> Dict[str, Any]:
    """Get all pricing tiers"""
    try:
        tiers = pricing_engine.get_all_tiers()
        
        return {
            'success': True,
            'tiers': tiers,
            'count': len(tiers)
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get tiers: {str(e)}"
        }


@router.get("/tier/{tier_name}")
async def get_tier(tier_name: str) -> Dict[str, Any]:
    """Get specific pricing tier"""
    try:
        tier = pricing_engine.get_tier(tier_name)
        
        if tier is None:
            return {
                'success': False,
                'error': f"Tier '{tier_name}' not found"
            }
        
        return {
            'success': True,
            'tier': tier
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get tier: {str(e)}"
        }


@router.post("/usage-cost")
async def calculate_usage_cost(usage_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate cost based on usage
    
    Request body:
    {
        "predictions": 50000,
        "ultrafusion_calls": 10000,
        "hydra_scans": 5000,
        "constellation_updates": 8000,
        "oracle_eye_analyses": 2000,
        "radar_queries": 15000,
        "cortex_queries": 12000,
        "genesis_lookups": 6000,
        "sentinel_commands": 3000
    }
    """
    try:
        result = pricing_engine.calculate_usage_cost(usage_data)
        
        return {
            'success': True,
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to calculate usage cost: {str(e)}"
        }


@router.post("/enterprise-contract")
async def calculate_enterprise_contract(contract_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate enterprise contract cost
    
    Request body:
    {
        "contract_type": "doj",
        "organization_name": "Acme Corp",
        "num_users": 50,
        "num_engines": 10,
        "is_government": true,
        "discount_rate": 0.10
    }
    """
    try:
        result = pricing_engine.calculate_enterprise_contract(contract_params)
        
        return {
            'success': True,
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to calculate enterprise contract: {str(e)}"
        }


@router.post("/revenue-projection")
async def project_revenue(projection_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Project revenue based on tier distribution and growth rate
    
    Request body:
    {
        "tier_distribution": {
            "starter": 1000,
            "pro_trader": 500,
            "elite_trader": 100,
            "business": 50,
            "institutional": 10,
            "government": 5,
            "sovereign": 1
        },
        "growth_rate": 0.15,
        "months": 36
    }
    """
    try:
        tier_distribution = projection_params.get('tier_distribution', {})
        growth_rate = projection_params.get('growth_rate', 0.15)
        months = projection_params.get('months', 36)
        
        result = pricing_engine.project_revenue(
            tier_distribution=tier_distribution,
            growth_rate=growth_rate,
            months=months
        )
        
        return {
            'success': True,
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to project revenue: {str(e)}"
        }


@router.post("/suggest-plan")
async def suggest_best_plan(customer_usage: Dict[str, Any]) -> Dict[str, Any]:
    """
    Suggest best pricing plan based on customer usage
    
    Request body:
    {
        "monthly_requests": 150000,
        "required_engines": ["fusion", "hydra", "radar"],
        "num_users": 5,
        "needs_api": true,
        "needs_export": true,
        "needs_webhooks": true,
        "needs_custom_integrations": false,
        "is_enterprise": false
    }
    """
    try:
        result = pricing_engine.suggest_best_plan(customer_usage)
        
        return {
            'success': True,
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to suggest plan: {str(e)}"
        }


@router.post("/compare-tiers")
async def compare_tiers(comparison_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare two pricing tiers
    
    Request body:
    {
        "tier_a": "pro_trader",
        "tier_b": "elite_trader"
    }
    """
    try:
        tier_a = comparison_data.get('tier_a')
        tier_b = comparison_data.get('tier_b')
        
        if not tier_a or not tier_b:
            return {
                'success': False,
                'error': 'Both tier_a and tier_b are required'
            }
        
        result = pricing_engine.compare_tiers(tier_a, tier_b)
        
        if 'error' in result:
            return {
                'success': False,
                'error': result['error']
            }
        
        return {
            'success': True,
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to compare tiers: {str(e)}"
        }


@router.post("/optimize-pricing")
async def optimize_pricing(customer_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Optimize pricing for specific customer profile
    
    Request body:
    {
        "organization_type": "bank",
        "annual_budget": 500000,
        "num_users": 50,
        "expected_usage": 5000000,
        "required_engines": ["fusion", "hydra", "sentinel"],
        "priority_features": ["sla", "support", "custom_integrations"]
    }
    """
    try:
        result = pricing_engine.optimize_pricing_for_customer(customer_profile)
        
        return {
            'success': True,
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to optimize pricing: {str(e)}"
        }


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check for pricing engine"""
    try:
        health = pricing_engine.health()
        
        return {
            'success': True,
            'health': health
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Health check failed: {str(e)}"
        }


@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """Get pricing engine information"""
    try:
        info = pricing_engine.info()
        
        return {
            'success': True,
            'info': info
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get info: {str(e)}"
        }

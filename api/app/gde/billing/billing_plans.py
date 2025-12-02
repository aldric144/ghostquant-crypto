"""
Billing Plans

GhostQuant pricing plans with limits, features, and overage costs.
"""

from .billing_schema import SubscriptionPlan, BillingPeriod
from typing import Dict, Optional


BILLING_PLANS: Dict[str, SubscriptionPlan] = {
    'free': SubscriptionPlan(
        id='free',
        name='FREE',
        price=0.00,
        currency='usd',
        billing_period=BillingPeriod.MONTHLY.value,
        
        api_calls_limit=1000,
        predictions_limit=100,
        users_limit=1,
        
        overage_per_1k=5.00,
        
        permitted_modules=[
            'fusion',
            'radar'
        ],
        sla_uptime=99.0,
        kyc_required=False,
        risk_scoring_access=False,
        
        support_level='community'
    ),
    
    'pro': SubscriptionPlan(
        id='pro',
        name='PRO',
        price=199.00,
        currency='usd',
        billing_period=BillingPeriod.MONTHLY.value,
        
        api_calls_limit=100000,
        predictions_limit=10000,
        users_limit=5,
        
        overage_per_1k=2.00,
        
        permitted_modules=[
            'fusion',
            'hydra',
            'radar',
            'profiler',
            'constellation',
            'oracle_eye'
        ],
        sla_uptime=99.5,
        kyc_required=False,
        risk_scoring_access=True,
        
        support_level='email'
    ),
    
    'institutional': SubscriptionPlan(
        id='institutional',
        name='INSTITUTIONAL',
        price=9999.00,
        currency='usd',
        billing_period=BillingPeriod.ANNUAL.value,
        
        api_calls_limit=10000000,
        predictions_limit=1000000,
        users_limit=100,
        
        overage_per_1k=0.50,
        
        permitted_modules=[
            'fusion',
            'hydra',
            'radar',
            'profiler',
            'constellation',
            'sentinel',
            'cortex',
            'genesis',
            'oracle_eye',
            'ultrafusion',
            'operation_hydra',
            'threat_actor',
            'valkyrie',
            'phantom'
        ],
        sla_uptime=99.95,
        kyc_required=True,
        risk_scoring_access=True,
        
        support_level='white_glove'
    ),
    
    'government': SubscriptionPlan(
        id='government',
        name='GOVERNMENT',
        price=24999.00,
        currency='usd',
        billing_period=BillingPeriod.ENTERPRISE.value,
        
        api_calls_limit=-1,
        predictions_limit=-1,
        users_limit=-1,
        
        overage_per_1k=0.00,
        
        permitted_modules=[
            'fusion',
            'hydra',
            'radar',
            'profiler',
            'constellation',
            'sentinel',
            'cortex',
            'genesis',
            'oracle_eye',
            'ultrafusion',
            'operation_hydra',
            'threat_actor',
            'valkyrie',
            'phantom'
        ],
        sla_uptime=99.99,
        kyc_required=True,
        risk_scoring_access=True,
        
        support_level='dedicated'
    )
}


def get_plan(plan_id: str) -> Optional[SubscriptionPlan]:
    """
    Get a billing plan by ID
    
    Args:
        plan_id: Plan identifier
    
    Returns:
        SubscriptionPlan or None if not found
    """
    return BILLING_PLANS.get(plan_id.lower())


def list_plans() -> Dict[str, SubscriptionPlan]:
    """
    Get all billing plans
    
    Returns:
        Dictionary of all plans
    """
    return BILLING_PLANS.copy()


def get_plan_features(plan_id: str) -> Dict[str, any]:
    """
    Get plan features summary
    
    Args:
        plan_id: Plan identifier
    
    Returns:
        Features dictionary
    """
    plan = get_plan(plan_id)
    if not plan:
        return {}
    
    return {
        'name': plan.name,
        'price': plan.price,
        'billing_period': plan.billing_period,
        'api_calls_limit': plan.api_calls_limit,
        'predictions_limit': plan.predictions_limit,
        'users_limit': plan.users_limit,
        'modules_count': len(plan.permitted_modules),
        'sla_uptime': plan.sla_uptime,
        'support_level': plan.support_level,
        'kyc_required': plan.kyc_required,
        'risk_scoring': plan.risk_scoring_access
    }

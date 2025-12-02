"""
Pricing Schema Definitions

Dataclasses for pricing tiers, usage pricing, enterprise contracts, and revenue projections.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum


class TierCategory(str, Enum):
    """Tier category"""
    CONSUMER = "consumer"
    ENTERPRISE = "enterprise"


class SupportLevel(str, Enum):
    """Support level"""
    COMMUNITY = "community"
    EMAIL = "email"
    PRIORITY = "priority"
    WHITE_GLOVE = "white_glove"
    DEDICATED = "dedicated"


@dataclass
class PricingTier:
    """Pricing tier definition"""
    name: str
    category: str
    monthly_price: float
    annual_price: float
    included_modules: List[str]
    rate_limit_per_month: int
    rate_limit_per_day: int
    overage_fee_per_1k: float
    support_level: str
    sla_uptime: float
    max_users: int = 1
    api_access: bool = True
    export_enabled: bool = True
    webhooks_enabled: bool = False
    custom_integrations: bool = False
    white_label: bool = False
    dedicated_instance: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'category': self.category,
            'monthly_price': self.monthly_price,
            'annual_price': self.annual_price,
            'included_modules': self.included_modules,
            'rate_limit_per_month': self.rate_limit_per_month,
            'rate_limit_per_day': self.rate_limit_per_day,
            'overage_fee_per_1k': self.overage_fee_per_1k,
            'support_level': self.support_level,
            'sla_uptime': self.sla_uptime,
            'max_users': self.max_users,
            'api_access': self.api_access,
            'export_enabled': self.export_enabled,
            'webhooks_enabled': self.webhooks_enabled,
            'custom_integrations': self.custom_integrations,
            'white_label': self.white_label,
            'dedicated_instance': self.dedicated_instance
        }
    
    def annual_savings(self) -> float:
        """Calculate annual savings vs monthly"""
        return (self.monthly_price * 12) - self.annual_price
    
    def annual_discount_percent(self) -> float:
        """Calculate annual discount percentage"""
        monthly_total = self.monthly_price * 12
        if monthly_total == 0:
            return 0.0
        return round(((monthly_total - self.annual_price) / monthly_total) * 100, 1)


@dataclass
class UsagePricing:
    """Usage-based pricing rates"""
    per_1k_predictions: float
    per_1k_ultrafusion_calls: float
    per_1k_hydra_scans: float
    per_1k_constellation_updates: float
    per_1k_oracle_eye_analyses: float
    per_1k_radar_queries: float = 0.50
    per_1k_cortex_queries: float = 0.75
    per_1k_genesis_lookups: float = 1.00
    per_1k_sentinel_commands: float = 2.00
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'per_1k_predictions': self.per_1k_predictions,
            'per_1k_ultrafusion_calls': self.per_1k_ultrafusion_calls,
            'per_1k_hydra_scans': self.per_1k_hydra_scans,
            'per_1k_constellation_updates': self.per_1k_constellation_updates,
            'per_1k_oracle_eye_analyses': self.per_1k_oracle_eye_analyses,
            'per_1k_radar_queries': self.per_1k_radar_queries,
            'per_1k_cortex_queries': self.per_1k_cortex_queries,
            'per_1k_genesis_lookups': self.per_1k_genesis_lookups,
            'per_1k_sentinel_commands': self.per_1k_sentinel_commands
        }


@dataclass
class EnterpriseContractTemplate:
    """Enterprise contract template"""
    contract_type: str
    organization_name: str
    annual_commit: float
    per_user_cost: float
    per_engine_cost: float
    government_multiplier: float
    discount_rate: float
    included_users: int
    included_engines: List[str]
    support_level: str
    sla_uptime: float
    onboarding_fee: float
    training_hours: int
    custom_integrations: bool
    white_label: bool
    dedicated_instance: bool
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'contract_type': self.contract_type,
            'organization_name': self.organization_name,
            'annual_commit': self.annual_commit,
            'per_user_cost': self.per_user_cost,
            'per_engine_cost': self.per_engine_cost,
            'government_multiplier': self.government_multiplier,
            'discount_rate': self.discount_rate,
            'included_users': self.included_users,
            'included_engines': self.included_engines,
            'support_level': self.support_level,
            'sla_uptime': self.sla_uptime,
            'onboarding_fee': self.onboarding_fee,
            'training_hours': self.training_hours,
            'custom_integrations': self.custom_integrations,
            'white_label': self.white_label,
            'dedicated_instance': self.dedicated_instance
        }
    
    def total_first_year_cost(self) -> float:
        """Calculate total first year cost including onboarding"""
        return self.annual_commit + self.onboarding_fee


@dataclass
class RevenueProjection:
    """Revenue projection"""
    monthly_revenue: float
    annual_revenue: float
    three_year_projection: float
    breakdown_by_tier: Dict[str, float]
    growth_rate: float
    total_users: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'monthly_revenue': self.monthly_revenue,
            'annual_revenue': self.annual_revenue,
            'three_year_projection': self.three_year_projection,
            'breakdown_by_tier': self.breakdown_by_tier,
            'growth_rate': self.growth_rate,
            'total_users': self.total_users,
            'summary': self.summary()
        }
    
    def summary(self) -> str:
        """Generate revenue summary"""
        return (
            f"Monthly: ${self.monthly_revenue:,.2f} | "
            f"Annual: ${self.annual_revenue:,.2f} | "
            f"3-Year: ${self.three_year_projection:,.2f} | "
            f"Growth: {self.growth_rate}% | "
            f"Users: {self.total_users:,}"
        )

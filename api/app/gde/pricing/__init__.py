"""
GhostQuant Pricing Engine & Revenue Model Generator™

Dynamic pricing system for enterprise licensing, subscriptions, government engagements,
and API usage revenue.

Features:
- Multi-tier pricing (Consumer: Starter, Pro, Elite; Enterprise: Business, Institutional, Government, Sovereign)
- Usage-based pricing with overage fees
- Enterprise contract templates (DOJ, SEC, DHS, FinCEN, Banks, Exchanges, Hedge Funds)
- Revenue projections and growth modeling
- Automatic discounts (annual, volume-based)
- Government uplift multipliers
- SLA upgrades and priority support
- Best plan suggestions based on usage patterns
"""

from .pricing_schema import (
    PricingTier,
    UsagePricing,
    EnterpriseContractTemplate,
    RevenueProjection
)
from .pricing_engine import PricingEngine

__all__ = [
    'PricingTier',
    'UsagePricing',
    'EnterpriseContractTemplate',
    'RevenueProjection',
    'PricingEngine'
]

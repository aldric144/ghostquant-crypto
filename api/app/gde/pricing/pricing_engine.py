"""
Pricing Engine

Complete dynamic pricing system with multi-tier pricing, usage-based costs,
enterprise contracts, and revenue projections.

Pure Python implementation with zero external dependencies.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from .pricing_schema import (
    PricingTier,
    UsagePricing,
    EnterpriseContractTemplate,
    RevenueProjection,
    TierCategory,
    SupportLevel
)


class PricingEngine:
    """
    Pricing Engine & Revenue Model Generator™
    
    Dynamic pricing system for enterprise licensing, subscriptions,
    government engagements, and API usage revenue.
    
    Features:
    - Multi-tier pricing (7 tiers from Starter to Sovereign Intelligence)
    - Usage-based pricing with overage fees
    - Enterprise contract templates
    - Revenue projections and growth modeling
    - Automatic discounts (annual, volume-based)
    - Government uplift multipliers
    - Best plan suggestions
    """
    
    VERSION = "1.0.0"
    
    ALL_ENGINES = [
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
    ]
    
    def __init__(self):
        self._initialize_tiers()
        self._initialize_usage_pricing()
        self._initialize_contract_templates()
    
    
    def _initialize_tiers(self):
        """Initialize all pricing tiers"""
        self.tiers: Dict[str, PricingTier] = {}
        
        
        self.tiers['starter'] = PricingTier(
            name='Starter',
            category=TierCategory.CONSUMER.value,
            monthly_price=49.00,
            annual_price=470.00,  # 20% discount
            included_modules=[
                'fusion',
                'radar',
                'profiler'
            ],
            rate_limit_per_month=10000,
            rate_limit_per_day=500,
            overage_fee_per_1k=2.00,
            support_level=SupportLevel.COMMUNITY.value,
            sla_uptime=99.0,
            max_users=1,
            api_access=True,
            export_enabled=False,
            webhooks_enabled=False,
            custom_integrations=False,
            white_label=False,
            dedicated_instance=False
        )
        
        self.tiers['pro_trader'] = PricingTier(
            name='Pro Trader',
            category=TierCategory.CONSUMER.value,
            monthly_price=199.00,
            annual_price=1990.00,  # 17% discount
            included_modules=[
                'fusion',
                'hydra',
                'radar',
                'profiler',
                'constellation',
                'oracle_eye'
            ],
            rate_limit_per_month=100000,
            rate_limit_per_day=5000,
            overage_fee_per_1k=1.50,
            support_level=SupportLevel.EMAIL.value,
            sla_uptime=99.5,
            max_users=1,
            api_access=True,
            export_enabled=True,
            webhooks_enabled=True,
            custom_integrations=False,
            white_label=False,
            dedicated_instance=False
        )
        
        self.tiers['elite_trader'] = PricingTier(
            name='Elite Trader',
            category=TierCategory.CONSUMER.value,
            monthly_price=499.00,
            annual_price=4990.00,  # 17% discount
            included_modules=[
                'fusion',
                'hydra',
                'radar',
                'profiler',
                'constellation',
                'sentinel',
                'cortex',
                'genesis',
                'oracle_eye',
                'ultrafusion'
            ],
            rate_limit_per_month=500000,
            rate_limit_per_day=25000,
            overage_fee_per_1k=1.00,
            support_level=SupportLevel.PRIORITY.value,
            sla_uptime=99.9,
            max_users=3,
            api_access=True,
            export_enabled=True,
            webhooks_enabled=True,
            custom_integrations=True,
            white_label=False,
            dedicated_instance=False
        )
        
        
        self.tiers['business'] = PricingTier(
            name='Business',
            category=TierCategory.ENTERPRISE.value,
            monthly_price=2499.00,
            annual_price=24990.00,  # 17% discount
            included_modules=[
                'fusion',
                'hydra',
                'radar',
                'profiler',
                'constellation',
                'sentinel',
                'cortex',
                'genesis',
                'oracle_eye',
                'ultrafusion'
            ],
            rate_limit_per_month=2000000,
            rate_limit_per_day=100000,
            overage_fee_per_1k=0.75,
            support_level=SupportLevel.PRIORITY.value,
            sla_uptime=99.9,
            max_users=25,
            api_access=True,
            export_enabled=True,
            webhooks_enabled=True,
            custom_integrations=True,
            white_label=True,
            dedicated_instance=False
        )
        
        self.tiers['institutional'] = PricingTier(
            name='Institutional',
            category=TierCategory.ENTERPRISE.value,
            monthly_price=9999.00,
            annual_price=99990.00,  # 17% discount
            included_modules=self.ALL_ENGINES.copy(),
            rate_limit_per_month=10000000,
            rate_limit_per_day=500000,
            overage_fee_per_1k=0.50,
            support_level=SupportLevel.WHITE_GLOVE.value,
            sla_uptime=99.95,
            max_users=100,
            api_access=True,
            export_enabled=True,
            webhooks_enabled=True,
            custom_integrations=True,
            white_label=True,
            dedicated_instance=True
        )
        
        self.tiers['government'] = PricingTier(
            name='Government',
            category=TierCategory.ENTERPRISE.value,
            monthly_price=24999.00,
            annual_price=249990.00,  # 17% discount
            included_modules=self.ALL_ENGINES.copy(),
            rate_limit_per_month=-1,  # Unlimited
            rate_limit_per_day=-1,  # Unlimited
            overage_fee_per_1k=0.00,  # No overage fees
            support_level=SupportLevel.DEDICATED.value,
            sla_uptime=99.99,
            max_users=500,
            api_access=True,
            export_enabled=True,
            webhooks_enabled=True,
            custom_integrations=True,
            white_label=True,
            dedicated_instance=True
        )
        
        self.tiers['sovereign'] = PricingTier(
            name='Sovereign Intelligence',
            category=TierCategory.ENTERPRISE.value,
            monthly_price=99999.00,
            annual_price=999990.00,  # 17% discount
            included_modules=self.ALL_ENGINES.copy(),
            rate_limit_per_month=-1,  # Unlimited
            rate_limit_per_day=-1,  # Unlimited
            overage_fee_per_1k=0.00,  # No overage fees
            support_level=SupportLevel.DEDICATED.value,
            sla_uptime=99.999,
            max_users=-1,  # Unlimited
            api_access=True,
            export_enabled=True,
            webhooks_enabled=True,
            custom_integrations=True,
            white_label=True,
            dedicated_instance=True
        )
    
    def _initialize_usage_pricing(self):
        """Initialize usage-based pricing rates"""
        self.usage_pricing = UsagePricing(
            per_1k_predictions=1.50,
            per_1k_ultrafusion_calls=3.00,
            per_1k_hydra_scans=2.50,
            per_1k_constellation_updates=2.00,
            per_1k_oracle_eye_analyses=4.00,
            per_1k_radar_queries=0.50,
            per_1k_cortex_queries=0.75,
            per_1k_genesis_lookups=1.00,
            per_1k_sentinel_commands=2.00
        )
    
    def _initialize_contract_templates(self):
        """Initialize enterprise contract templates"""
        self.contract_templates: Dict[str, Dict[str, Any]] = {
            'doj': {
                'name': 'Department of Justice',
                'government_multiplier': 1.5,
                'base_annual': 500000,
                'per_user': 2000,
                'per_engine': 50000,
                'support_level': SupportLevel.DEDICATED.value,
                'sla_uptime': 99.99,
                'onboarding_fee': 100000,
                'training_hours': 80,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'sec': {
                'name': 'Securities and Exchange Commission',
                'government_multiplier': 1.5,
                'base_annual': 450000,
                'per_user': 1800,
                'per_engine': 45000,
                'support_level': SupportLevel.DEDICATED.value,
                'sla_uptime': 99.99,
                'onboarding_fee': 90000,
                'training_hours': 60,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'dhs': {
                'name': 'Department of Homeland Security',
                'government_multiplier': 1.6,
                'base_annual': 600000,
                'per_user': 2500,
                'per_engine': 60000,
                'support_level': SupportLevel.DEDICATED.value,
                'sla_uptime': 99.99,
                'onboarding_fee': 120000,
                'training_hours': 100,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'fincen': {
                'name': 'Financial Crimes Enforcement Network',
                'government_multiplier': 1.5,
                'base_annual': 400000,
                'per_user': 1500,
                'per_engine': 40000,
                'support_level': SupportLevel.DEDICATED.value,
                'sla_uptime': 99.99,
                'onboarding_fee': 80000,
                'training_hours': 50,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'bank': {
                'name': 'Banking Institution',
                'government_multiplier': 1.0,
                'base_annual': 300000,
                'per_user': 1200,
                'per_engine': 30000,
                'support_level': SupportLevel.WHITE_GLOVE.value,
                'sla_uptime': 99.95,
                'onboarding_fee': 60000,
                'training_hours': 40,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'exchange': {
                'name': 'Crypto Exchange',
                'government_multiplier': 1.0,
                'base_annual': 350000,
                'per_user': 1500,
                'per_engine': 35000,
                'support_level': SupportLevel.WHITE_GLOVE.value,
                'sla_uptime': 99.95,
                'onboarding_fee': 70000,
                'training_hours': 50,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'hedge_fund': {
                'name': 'Hedge Fund / HFT Firm',
                'government_multiplier': 1.0,
                'base_annual': 400000,
                'per_user': 2000,
                'per_engine': 40000,
                'support_level': SupportLevel.WHITE_GLOVE.value,
                'sla_uptime': 99.95,
                'onboarding_fee': 80000,
                'training_hours': 60,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            },
            'cyber_threat': {
                'name': 'Cyber Threat Division',
                'government_multiplier': 1.5,
                'base_annual': 500000,
                'per_user': 2000,
                'per_engine': 50000,
                'support_level': SupportLevel.DEDICATED.value,
                'sla_uptime': 99.99,
                'onboarding_fee': 100000,
                'training_hours': 80,
                'custom_integrations': True,
                'white_label': True,
                'dedicated_instance': True
            }
        }
    
    
    def get_all_tiers(self) -> List[Dict[str, Any]]:
        """
        Get all pricing tiers
        
        Returns:
            List of tier dictionaries
        """
        return [tier.to_dict() for tier in self.tiers.values()]
    
    def get_tier(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Get specific pricing tier
        
        Args:
            name: Tier name
        
        Returns:
            Tier dictionary or None if not found
        """
        tier = self.tiers.get(name.lower().replace(' ', '_'))
        if tier:
            return tier.to_dict()
        return None
    
    def compare_tiers(self, tier_a: str, tier_b: str) -> Dict[str, Any]:
        """
        Compare two pricing tiers
        
        Args:
            tier_a: First tier name
            tier_b: Second tier name
        
        Returns:
            Comparison dictionary
        """
        tier_a_obj = self.tiers.get(tier_a.lower().replace(' ', '_'))
        tier_b_obj = self.tiers.get(tier_b.lower().replace(' ', '_'))
        
        if not tier_a_obj or not tier_b_obj:
            return {
                'error': 'One or both tiers not found'
            }
        
        return {
            'tier_a': tier_a_obj.to_dict(),
            'tier_b': tier_b_obj.to_dict(),
            'price_difference_monthly': tier_b_obj.monthly_price - tier_a_obj.monthly_price,
            'price_difference_annual': tier_b_obj.annual_price - tier_a_obj.annual_price,
            'rate_limit_difference': tier_b_obj.rate_limit_per_month - tier_a_obj.rate_limit_per_month,
            'additional_modules': list(set(tier_b_obj.included_modules) - set(tier_a_obj.included_modules)),
            'support_upgrade': f"{tier_a_obj.support_level} → {tier_b_obj.support_level}",
            'sla_improvement': tier_b_obj.sla_uptime - tier_a_obj.sla_uptime
        }
    
    
    def calculate_usage_cost(self, usage_dict: Dict[str, int]) -> Dict[str, Any]:
        """
        Calculate cost based on usage
        
        Args:
            usage_dict: Dictionary of usage counts
                {
                    'predictions': 50000,
                    'ultrafusion_calls': 10000,
                    'hydra_scans': 5000,
                    'constellation_updates': 8000,
                    'oracle_eye_analyses': 2000,
                    'radar_queries': 15000,
                    'cortex_queries': 12000,
                    'genesis_lookups': 6000,
                    'sentinel_commands': 3000
                }
        
        Returns:
            Cost breakdown dictionary
        """
        costs = {}
        total_cost = 0.0
        
        if 'predictions' in usage_dict:
            count = usage_dict['predictions']
            cost = (count / 1000) * self.usage_pricing.per_1k_predictions
            costs['predictions'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'ultrafusion_calls' in usage_dict:
            count = usage_dict['ultrafusion_calls']
            cost = (count / 1000) * self.usage_pricing.per_1k_ultrafusion_calls
            costs['ultrafusion_calls'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'hydra_scans' in usage_dict:
            count = usage_dict['hydra_scans']
            cost = (count / 1000) * self.usage_pricing.per_1k_hydra_scans
            costs['hydra_scans'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'constellation_updates' in usage_dict:
            count = usage_dict['constellation_updates']
            cost = (count / 1000) * self.usage_pricing.per_1k_constellation_updates
            costs['constellation_updates'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'oracle_eye_analyses' in usage_dict:
            count = usage_dict['oracle_eye_analyses']
            cost = (count / 1000) * self.usage_pricing.per_1k_oracle_eye_analyses
            costs['oracle_eye_analyses'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'radar_queries' in usage_dict:
            count = usage_dict['radar_queries']
            cost = (count / 1000) * self.usage_pricing.per_1k_radar_queries
            costs['radar_queries'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'cortex_queries' in usage_dict:
            count = usage_dict['cortex_queries']
            cost = (count / 1000) * self.usage_pricing.per_1k_cortex_queries
            costs['cortex_queries'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'genesis_lookups' in usage_dict:
            count = usage_dict['genesis_lookups']
            cost = (count / 1000) * self.usage_pricing.per_1k_genesis_lookups
            costs['genesis_lookups'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        if 'sentinel_commands' in usage_dict:
            count = usage_dict['sentinel_commands']
            cost = (count / 1000) * self.usage_pricing.per_1k_sentinel_commands
            costs['sentinel_commands'] = {
                'count': count,
                'cost': round(cost, 2)
            }
            total_cost += cost
        
        return {
            'breakdown': costs,
            'total_cost': round(total_cost, 2),
            'total_requests': sum(usage_dict.values()),
            'pricing_rates': self.usage_pricing.to_dict()
        }
    
    
    def calculate_enterprise_contract(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate enterprise contract cost
        
        Args:
            params: Contract parameters
                {
                    'contract_type': 'doj',  # or 'sec', 'bank', etc.
                    'organization_name': 'Acme Corp',
                    'num_users': 50,
                    'num_engines': 10,
                    'is_government': True,
                    'discount_rate': 0.10  # 10% volume discount
                }
        
        Returns:
            Contract details dictionary
        """
        contract_type = params.get('contract_type', 'bank')
        organization_name = params.get('organization_name', 'Organization')
        num_users = params.get('num_users', 10)
        num_engines = params.get('num_engines', len(self.ALL_ENGINES))
        is_government = params.get('is_government', False)
        discount_rate = params.get('discount_rate', 0.0)
        
        if contract_type not in self.contract_templates:
            contract_type = 'bank'  # Default fallback
        
        template = self.contract_templates[contract_type]
        
        base_annual = template['base_annual']
        user_cost = num_users * template['per_user']
        engine_cost = num_engines * template['per_engine']
        
        gov_multiplier = template['government_multiplier'] if is_government else 1.0
        
        subtotal = (base_annual + user_cost + engine_cost) * gov_multiplier
        
        discount_amount = subtotal * discount_rate
        annual_commit = subtotal - discount_amount
        
        onboarding_fee = template['onboarding_fee']
        
        total_first_year = annual_commit + onboarding_fee
        
        contract = EnterpriseContractTemplate(
            contract_type=contract_type,
            organization_name=organization_name,
            annual_commit=round(annual_commit, 2),
            per_user_cost=template['per_user'],
            per_engine_cost=template['per_engine'],
            government_multiplier=gov_multiplier,
            discount_rate=discount_rate,
            included_users=num_users,
            included_engines=self.ALL_ENGINES[:num_engines],
            support_level=template['support_level'],
            sla_uptime=template['sla_uptime'],
            onboarding_fee=onboarding_fee,
            training_hours=template['training_hours'],
            custom_integrations=template['custom_integrations'],
            white_label=template['white_label'],
            dedicated_instance=template['dedicated_instance']
        )
        
        return {
            'contract': contract.to_dict(),
            'cost_breakdown': {
                'base_annual': base_annual,
                'user_cost': user_cost,
                'engine_cost': engine_cost,
                'government_multiplier': gov_multiplier,
                'subtotal': round(subtotal, 2),
                'discount_amount': round(discount_amount, 2),
                'annual_commit': round(annual_commit, 2),
                'onboarding_fee': onboarding_fee,
                'total_first_year': round(total_first_year, 2)
            },
            'template_name': template['name']
        }
    
    
    def project_revenue(
        self,
        tier_distribution: Dict[str, int],
        growth_rate: float = 0.15,
        months: int = 36
    ) -> Dict[str, Any]:
        """
        Project revenue based on tier distribution and growth rate
        
        Args:
            tier_distribution: Number of users per tier
                {
                    'starter': 1000,
                    'pro_trader': 500,
                    'elite_trader': 100,
                    'business': 50,
                    'institutional': 10,
                    'government': 5,
                    'sovereign': 1
                }
            growth_rate: Monthly growth rate (0.15 = 15% per month)
            months: Number of months to project (default 36 for 3 years)
        
        Returns:
            Revenue projection dictionary
        """
        monthly_revenue = 0.0
        breakdown_by_tier = {}
        total_users = 0
        
        for tier_name, user_count in tier_distribution.items():
            tier = self.tiers.get(tier_name.lower().replace(' ', '_'))
            if tier:
                tier_revenue = tier.monthly_price * user_count
                monthly_revenue += tier_revenue
                breakdown_by_tier[tier_name] = round(tier_revenue, 2)
                total_users += user_count
        
        annual_revenue = monthly_revenue * 12
        
        three_year_revenue = 0.0
        monthly_projections = []
        
        for month in range(months):
            month_revenue = monthly_revenue * ((1 + growth_rate) ** month)
            three_year_revenue += month_revenue
            monthly_projections.append(round(month_revenue, 2))
        
        projection = RevenueProjection(
            monthly_revenue=round(monthly_revenue, 2),
            annual_revenue=round(annual_revenue, 2),
            three_year_projection=round(three_year_revenue, 2),
            breakdown_by_tier=breakdown_by_tier,
            growth_rate=growth_rate * 100,  # Convert to percentage
            total_users=total_users
        )
        
        return {
            'projection': projection.to_dict(),
            'monthly_projections': monthly_projections,
            'tier_distribution': tier_distribution
        }
    
    
    def suggest_best_plan(self, customer_usage: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest best pricing plan based on customer usage
        
        Args:
            customer_usage: Customer usage profile
                {
                    'monthly_requests': 150000,
                    'required_engines': ['fusion', 'hydra', 'radar'],
                    'num_users': 5,
                    'needs_api': True,
                    'needs_export': True,
                    'needs_webhooks': True,
                    'needs_custom_integrations': False,
                    'is_enterprise': False
                }
        
        Returns:
            Suggestion dictionary with recommended tier and alternatives
        """
        monthly_requests = customer_usage.get('monthly_requests', 0)
        required_engines = customer_usage.get('required_engines', [])
        num_users = customer_usage.get('num_users', 1)
        needs_api = customer_usage.get('needs_api', True)
        needs_export = customer_usage.get('needs_export', False)
        needs_webhooks = customer_usage.get('needs_webhooks', False)
        needs_custom_integrations = customer_usage.get('needs_custom_integrations', False)
        is_enterprise = customer_usage.get('is_enterprise', False)
        
        matching_tiers = []
        
        for tier_name, tier in self.tiers.items():
            if tier.rate_limit_per_month != -1 and tier.rate_limit_per_month < monthly_requests:
                continue
            
            if not all(engine in tier.included_modules for engine in required_engines):
                continue
            
            if tier.max_users != -1 and tier.max_users < num_users:
                continue
            
            if needs_api and not tier.api_access:
                continue
            
            if needs_export and not tier.export_enabled:
                continue
            
            if needs_webhooks and not tier.webhooks_enabled:
                continue
            
            if needs_custom_integrations and not tier.custom_integrations:
                continue
            
            if is_enterprise and tier.category != TierCategory.ENTERPRISE.value:
                continue
            
            value_score = tier.monthly_price / max(tier.rate_limit_per_month, 1)
            
            matching_tiers.append({
                'tier': tier.to_dict(),
                'value_score': value_score,
                'overage_risk': self._calculate_overage_risk(monthly_requests, tier)
            })
        
        matching_tiers.sort(key=lambda x: x['value_score'])
        
        if not matching_tiers:
            return {
                'recommended': None,
                'alternatives': [],
                'message': 'No tiers match your requirements. Consider Enterprise or Government tier.'
            }
        
        return {
            'recommended': matching_tiers[0],
            'alternatives': matching_tiers[1:3] if len(matching_tiers) > 1 else [],
            'total_matching': len(matching_tiers),
            'message': f'Found {len(matching_tiers)} matching tier(s)'
        }
    
    def _calculate_overage_risk(self, monthly_requests: int, tier: PricingTier) -> str:
        """Calculate overage risk level"""
        if tier.rate_limit_per_month == -1:
            return 'none'
        
        usage_percent = (monthly_requests / tier.rate_limit_per_month) * 100
        
        if usage_percent < 70:
            return 'low'
        elif usage_percent < 90:
            return 'medium'
        else:
            return 'high'
    
    def optimize_pricing_for_customer(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize pricing for specific customer profile
        
        Args:
            profile: Customer profile
                {
                    'organization_type': 'bank',
                    'annual_budget': 500000,
                    'num_users': 50,
                    'expected_usage': 5000000,
                    'required_engines': ['fusion', 'hydra', 'sentinel'],
                    'priority_features': ['sla', 'support', 'custom_integrations']
                }
        
        Returns:
            Optimization recommendations
        """
        org_type = profile.get('organization_type', 'business')
        annual_budget = profile.get('annual_budget', 0)
        num_users = profile.get('num_users', 1)
        expected_usage = profile.get('expected_usage', 0)
        required_engines = profile.get('required_engines', [])
        priority_features = profile.get('priority_features', [])
        
        recommendations = []
        
        if annual_budget >= 100000 or num_users >= 10:
            contract_params = {
                'contract_type': org_type,
                'organization_name': 'Customer',
                'num_users': num_users,
                'num_engines': len(required_engines),
                'is_government': org_type in ['doj', 'sec', 'dhs', 'fincen', 'cyber_threat'],
                'discount_rate': self._calculate_volume_discount(annual_budget)
            }
            
            contract = self.calculate_enterprise_contract(contract_params)
            
            recommendations.append({
                'type': 'enterprise_contract',
                'contract': contract,
                'fit_score': self._calculate_fit_score(profile, contract)
            })
        
        for tier_name, tier in self.tiers.items():
            if tier.category == TierCategory.ENTERPRISE.value:
                fits_budget = tier.annual_price <= annual_budget
                fits_users = tier.max_users == -1 or tier.max_users >= num_users
                fits_usage = tier.rate_limit_per_month == -1 or tier.rate_limit_per_month >= expected_usage
                has_engines = all(engine in tier.included_modules for engine in required_engines)
                
                if fits_budget and fits_users and fits_usage and has_engines:
                    recommendations.append({
                        'type': 'standard_tier',
                        'tier': tier.to_dict(),
                        'annual_cost': tier.annual_price,
                        'fit_score': self._calculate_tier_fit_score(profile, tier)
                    })
        
        recommendations.sort(key=lambda x: x.get('fit_score', 0), reverse=True)
        
        return {
            'recommendations': recommendations[:3],  # Top 3
            'total_options': len(recommendations),
            'optimization_notes': self._generate_optimization_notes(profile, recommendations)
        }
    
    def _calculate_volume_discount(self, annual_budget: float) -> float:
        """Calculate volume discount based on budget"""
        if annual_budget >= 1000000:
            return 0.25  # 25%
        elif annual_budget >= 500000:
            return 0.20  # 20%
        elif annual_budget >= 250000:
            return 0.15  # 15%
        elif annual_budget >= 100000:
            return 0.10  # 10%
        else:
            return 0.05  # 5%
    
    def _calculate_fit_score(self, profile: Dict[str, Any], contract: Dict[str, Any]) -> float:
        """Calculate how well a contract fits a profile"""
        score = 100.0
        
        annual_budget = profile.get('annual_budget', 0)
        contract_cost = contract['cost_breakdown']['total_first_year']
        
        if contract_cost > annual_budget:
            score -= 50.0
        else:
            budget_utilization = (contract_cost / annual_budget) * 100
            if budget_utilization > 80:
                score += 20.0
            elif budget_utilization > 60:
                score += 10.0
        
        return max(0.0, score)
    
    def _calculate_tier_fit_score(self, profile: Dict[str, Any], tier: PricingTier) -> float:
        """Calculate how well a tier fits a profile"""
        score = 100.0
        
        annual_budget = profile.get('annual_budget', 0)
        expected_usage = profile.get('expected_usage', 0)
        priority_features = profile.get('priority_features', [])
        
        if tier.annual_price > annual_budget:
            score -= 50.0
        else:
            budget_utilization = (tier.annual_price / annual_budget) * 100
            if budget_utilization > 80:
                score += 20.0
            elif budget_utilization > 60:
                score += 10.0
        
        if tier.rate_limit_per_month != -1:
            usage_percent = (expected_usage / tier.rate_limit_per_month) * 100
            if usage_percent < 70:
                score += 10.0
            elif usage_percent > 95:
                score -= 20.0
        
        if 'sla' in priority_features and tier.sla_uptime >= 99.9:
            score += 10.0
        if 'support' in priority_features and tier.support_level in [SupportLevel.WHITE_GLOVE.value, SupportLevel.DEDICATED.value]:
            score += 10.0
        if 'custom_integrations' in priority_features and tier.custom_integrations:
            score += 10.0
        
        return max(0.0, score)
    
    def _generate_optimization_notes(self, profile: Dict[str, Any], recommendations: List[Dict[str, Any]]) -> List[str]:
        """Generate optimization notes"""
        notes = []
        
        if not recommendations:
            notes.append("No suitable options found. Consider increasing budget or reducing requirements.")
        elif len(recommendations) == 1:
            notes.append("Only one option matches your requirements.")
        else:
            notes.append(f"Found {len(recommendations)} suitable options.")
        
        annual_budget = profile.get('annual_budget', 0)
        if annual_budget >= 500000:
            notes.append("Your budget qualifies for volume discounts up to 25%.")
        
        return notes
    
    
    def health(self) -> Dict[str, Any]:
        """
        Health check for pricing engine
        
        Returns:
            Health status dictionary
        """
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'total_tiers': len(self.tiers),
            'consumer_tiers': sum(1 for t in self.tiers.values() if t.category == TierCategory.CONSUMER.value),
            'enterprise_tiers': sum(1 for t in self.tiers.values() if t.category == TierCategory.ENTERPRISE.value),
            'contract_templates': len(self.contract_templates),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def info(self) -> Dict[str, Any]:
        """
        Get pricing engine information
        
        Returns:
            Information dictionary
        """
        return {
            'name': 'Pricing Engine & Revenue Model Generator™',
            'version': self.VERSION,
            'description': 'Dynamic pricing system for enterprise licensing and revenue modeling',
            'features': [
                'Multi-tier pricing (7 tiers)',
                'Usage-based pricing with overage fees',
                'Enterprise contract templates (8 types)',
                'Revenue projections and growth modeling',
                'Automatic discounts (annual, volume-based)',
                'Government uplift multipliers',
                'Best plan suggestions',
                'Pricing optimization'
            ],
            'available_tiers': list(self.tiers.keys()),
            'contract_templates': list(self.contract_templates.keys()),
            'usage_pricing': self.usage_pricing.to_dict()
        }

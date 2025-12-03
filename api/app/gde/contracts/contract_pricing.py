"""
Channel Partner Contract Pricing Engine
Global Distributor Edition (GDE)

Comprehensive pricing engine for distributor contracts including
volume discounts, rebate calculations, currency conversions, and deal pricing.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .contract_schema import (
    DistributorTier,
    RegionCode,
    CurrencyCode,
    PricingTier,
    RebateStructure,
    ProductAuthorization
)


class PricingEngine:
    """
    GhostQuant Contract Pricing Engine™
    
    Calculates pricing, discounts, rebates, and deal economics
    for global distributor contracts.
    """
    
    VERSION = "3.0.0"
    
    BASE_PRICES = {
        'ghostquant_enterprise': 50000.00,
        'ghostquant_professional': 15000.00,
        'alphabrain_module': 25000.00,
        'ecoscan_module': 20000.00,
        'sentinel_module': 30000.00,
        'constellation_module': 35000.00,
        'implementation_services': 15000.00,
        'training_package': 5000.00
    }
    
    TIER_BASE_DISCOUNTS = {
        DistributorTier.AUTHORIZED: 0.20,
        DistributorTier.PREFERRED: 0.30,
        DistributorTier.PREMIER: 0.40,
        DistributorTier.STRATEGIC: 0.50,
        DistributorTier.GLOBAL_ELITE: 0.60
    }
    
    VOLUME_DISCOUNT_TIERS = [
        {'min_units': 1, 'max_units': 10, 'additional_discount': 0.00},
        {'min_units': 11, 'max_units': 25, 'additional_discount': 0.05},
        {'min_units': 26, 'max_units': 50, 'additional_discount': 0.10},
        {'min_units': 51, 'max_units': 100, 'additional_discount': 0.15},
        {'min_units': 101, 'max_units': None, 'additional_discount': 0.20}
    ]
    
    MULTI_YEAR_DISCOUNTS = {
        1: 0.00,
        2: 0.05,
        3: 0.10,
        4: 0.12,
        5: 0.15
    }
    
    CURRENCY_EXCHANGE_RATES = {
        CurrencyCode.USD: 1.00,
        CurrencyCode.EUR: 0.92,
        CurrencyCode.GBP: 0.79,
        CurrencyCode.JPY: 149.50,
        CurrencyCode.CHF: 0.88,
        CurrencyCode.AUD: 1.53,
        CurrencyCode.CAD: 1.36,
        CurrencyCode.SGD: 1.34,
        CurrencyCode.HKD: 7.82,
        CurrencyCode.CNY: 7.24,
        CurrencyCode.INR: 83.12,
        CurrencyCode.AED: 3.67,
        CurrencyCode.BRL: 4.97,
        CurrencyCode.MXN: 17.15,
        CurrencyCode.ZAR: 18.65
    }
    
    REGION_PRICE_ADJUSTMENTS = {
        RegionCode.AMERICAS: 1.00,
        RegionCode.EMEA: 1.05,
        RegionCode.APAC: 0.95,
        RegionCode.LATAM: 0.85,
        RegionCode.MENA: 1.00,
        RegionCode.DACH: 1.10,
        RegionCode.NORDICS: 1.08,
        RegionCode.ANZ: 1.02,
        RegionCode.GREATER_CHINA: 0.90,
        RegionCode.INDIA_SUBCONTINENT: 0.75,
        RegionCode.JAPAN_KOREA: 1.05,
        RegionCode.ASEAN: 0.85,
        RegionCode.GLOBAL: 1.00
    }
    
    def __init__(self):
        self._price_cache: Dict[str, Dict[str, Any]] = {}
        self._quote_counter = 0
    
    def calculate_base_price(
        self,
        product_id: str,
        currency: CurrencyCode = CurrencyCode.USD,
        region: RegionCode = RegionCode.AMERICAS
    ) -> float:
        """Calculate base price for a product in specified currency"""
        
        base_usd = self.BASE_PRICES.get(product_id, 0)
        
        region_adjustment = self.REGION_PRICE_ADJUSTMENTS.get(region, 1.0)
        adjusted_usd = base_usd * region_adjustment
        
        exchange_rate = self.CURRENCY_EXCHANGE_RATES.get(currency, 1.0)
        local_price = adjusted_usd * exchange_rate
        
        return round(local_price, 2)
    
    def calculate_tier_discount(
        self,
        tier: DistributorTier,
        base_price: float
    ) -> Tuple[float, float]:
        """
        Calculate tier-based discount
        
        Returns:
            Tuple of (discount_amount, discounted_price)
        """
        discount_rate = self.TIER_BASE_DISCOUNTS.get(tier, 0)
        discount_amount = base_price * discount_rate
        discounted_price = base_price - discount_amount
        
        return round(discount_amount, 2), round(discounted_price, 2)
    
    def calculate_volume_discount(
        self,
        quantity: int,
        unit_price: float
    ) -> Tuple[float, float, float]:
        """
        Calculate volume-based discount
        
        Returns:
            Tuple of (additional_discount_rate, discount_amount, final_unit_price)
        """
        additional_discount = 0.0
        
        for tier in self.VOLUME_DISCOUNT_TIERS:
            if tier['max_units'] is None:
                if quantity >= tier['min_units']:
                    additional_discount = tier['additional_discount']
            elif tier['min_units'] <= quantity <= tier['max_units']:
                additional_discount = tier['additional_discount']
                break
        
        discount_amount = unit_price * additional_discount
        final_price = unit_price - discount_amount
        
        return additional_discount, round(discount_amount, 2), round(final_price, 2)
    
    def calculate_multi_year_discount(
        self,
        years: int,
        annual_value: float
    ) -> Tuple[float, float]:
        """
        Calculate multi-year commitment discount
        
        Returns:
            Tuple of (discount_rate, total_discount_amount)
        """
        years = min(years, 5)
        discount_rate = self.MULTI_YEAR_DISCOUNTS.get(years, 0)
        total_value = annual_value * years
        discount_amount = total_value * discount_rate
        
        return discount_rate, round(discount_amount, 2)
    
    def calculate_deal_price(
        self,
        product_id: str,
        quantity: int,
        tier: DistributorTier,
        currency: CurrencyCode = CurrencyCode.USD,
        region: RegionCode = RegionCode.AMERICAS,
        years: int = 1,
        special_discount: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculate complete deal pricing
        
        Args:
            product_id: Product identifier
            quantity: Number of units
            tier: Distributor tier
            currency: Target currency
            region: Geographic region
            years: Contract term in years
            special_discount: Additional special discount (0-1)
        
        Returns:
            Complete pricing breakdown
        """
        base_price = self.calculate_base_price(product_id, currency, region)
        
        tier_discount_amount, after_tier = self.calculate_tier_discount(tier, base_price)
        tier_discount_rate = self.TIER_BASE_DISCOUNTS.get(tier, 0)
        
        volume_rate, volume_discount, after_volume = self.calculate_volume_discount(
            quantity, after_tier
        )
        
        multi_year_rate, multi_year_discount = self.calculate_multi_year_discount(
            years, after_volume * quantity
        )
        
        special_discount_amount = 0.0
        if special_discount > 0:
            special_discount_amount = after_volume * special_discount
            after_volume = after_volume - special_discount_amount
        
        unit_price = round(after_volume, 2)
        subtotal = round(unit_price * quantity, 2)
        annual_total = subtotal
        
        if years > 1:
            annual_total = subtotal - (multi_year_discount / years)
        
        total_contract_value = round(annual_total * years, 2)
        
        total_discount_rate = 1 - (unit_price / base_price) if base_price > 0 else 0
        total_savings = round((base_price * quantity * years) - total_contract_value, 2)
        
        return {
            'quote_id': f"QT-{secrets.token_hex(6).upper()}",
            'product_id': product_id,
            'quantity': quantity,
            'currency': currency.value,
            'region': region.value,
            'tier': tier.value,
            'years': years,
            'pricing_breakdown': {
                'list_price': base_price,
                'tier_discount': {
                    'rate': tier_discount_rate,
                    'amount': tier_discount_amount,
                    'price_after': after_tier
                },
                'volume_discount': {
                    'rate': volume_rate,
                    'amount': volume_discount,
                    'price_after': after_volume + special_discount_amount
                },
                'special_discount': {
                    'rate': special_discount,
                    'amount': special_discount_amount
                },
                'multi_year_discount': {
                    'rate': multi_year_rate,
                    'amount': multi_year_discount
                }
            },
            'unit_price': unit_price,
            'subtotal': subtotal,
            'annual_value': annual_total,
            'total_contract_value': total_contract_value,
            'total_discount_rate': round(total_discount_rate, 4),
            'total_savings': total_savings,
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def calculate_rebate(
        self,
        rebate_structure: RebateStructure,
        actual_revenue: float,
        actual_growth: float = 0,
        new_customers: int = 0
    ) -> Dict[str, Any]:
        """
        Calculate rebate based on performance
        
        Args:
            rebate_structure: Rebate structure definition
            actual_revenue: Actual revenue achieved
            actual_growth: Actual growth percentage
            new_customers: Number of new customers acquired
        
        Returns:
            Rebate calculation details
        """
        rebate_amount = 0.0
        rebate_rate = 0.0
        threshold_achieved = None
        
        if rebate_structure.rebate_type == 'volume':
            for threshold in rebate_structure.thresholds:
                if actual_revenue >= threshold['threshold']:
                    rebate_rate = threshold['rebate_percentage']
                    threshold_achieved = threshold['threshold']
            
            rebate_amount = actual_revenue * rebate_rate
        
        elif rebate_structure.rebate_type == 'growth':
            for threshold in rebate_structure.thresholds:
                if actual_growth >= threshold['threshold']:
                    rebate_rate = threshold['rebate_percentage']
                    threshold_achieved = threshold['threshold']
            
            rebate_amount = actual_revenue * rebate_rate
        
        elif rebate_structure.rebate_type == 'acquisition':
            bonus_per_customer = 0
            for threshold in rebate_structure.thresholds:
                if new_customers >= threshold['threshold']:
                    bonus_per_customer = threshold['bonus_per_customer']
                    threshold_achieved = threshold['threshold']
            
            rebate_amount = new_customers * bonus_per_customer
        
        max_rebate = actual_revenue * rebate_structure.maximum_rebate_percentage
        rebate_amount = min(rebate_amount, max_rebate)
        
        return {
            'rebate_id': rebate_structure.rebate_id,
            'rebate_name': rebate_structure.rebate_name,
            'rebate_type': rebate_structure.rebate_type,
            'actual_revenue': actual_revenue,
            'actual_growth': actual_growth,
            'new_customers': new_customers,
            'threshold_achieved': threshold_achieved,
            'rebate_rate': rebate_rate,
            'calculated_rebate': round(rebate_amount, 2),
            'maximum_rebate': round(max_rebate, 2),
            'final_rebate': round(rebate_amount, 2),
            'calculation_date': datetime.utcnow().isoformat()
        }
    
    def calculate_total_rebates(
        self,
        rebate_structures: List[RebateStructure],
        actual_revenue: float,
        actual_growth: float = 0,
        new_customers: int = 0
    ) -> Dict[str, Any]:
        """Calculate total rebates from all rebate programs"""
        
        rebate_details = []
        total_rebate = 0.0
        
        for structure in rebate_structures:
            rebate = self.calculate_rebate(
                structure, actual_revenue, actual_growth, new_customers
            )
            rebate_details.append(rebate)
            total_rebate += rebate['final_rebate']
        
        return {
            'total_rebate': round(total_rebate, 2),
            'rebate_breakdown': rebate_details,
            'effective_rebate_rate': round(total_rebate / actual_revenue, 4) if actual_revenue > 0 else 0,
            'calculation_date': datetime.utcnow().isoformat()
        }
    
    def convert_currency(
        self,
        amount: float,
        from_currency: CurrencyCode,
        to_currency: CurrencyCode
    ) -> float:
        """Convert amount between currencies"""
        
        if from_currency == to_currency:
            return amount
        
        from_rate = self.CURRENCY_EXCHANGE_RATES.get(from_currency, 1.0)
        to_rate = self.CURRENCY_EXCHANGE_RATES.get(to_currency, 1.0)
        
        usd_amount = amount / from_rate
        converted = usd_amount * to_rate
        
        return round(converted, 2)
    
    def generate_price_list(
        self,
        tier: DistributorTier,
        currency: CurrencyCode = CurrencyCode.USD,
        region: RegionCode = RegionCode.AMERICAS
    ) -> Dict[str, Any]:
        """Generate complete price list for a distributor tier"""
        
        products = []
        
        for product_id, base_usd in self.BASE_PRICES.items():
            base_price = self.calculate_base_price(product_id, currency, region)
            _, discounted_price = self.calculate_tier_discount(tier, base_price)
            
            products.append({
                'product_id': product_id,
                'list_price': base_price,
                'distributor_price': discounted_price,
                'discount_rate': self.TIER_BASE_DISCOUNTS.get(tier, 0),
                'currency': currency.value
            })
        
        return {
            'price_list_id': f"PL-{secrets.token_hex(4).upper()}",
            'tier': tier.value,
            'region': region.value,
            'currency': currency.value,
            'effective_date': datetime.utcnow().strftime("%Y-%m-%d"),
            'products': products,
            'volume_discounts': self.VOLUME_DISCOUNT_TIERS,
            'multi_year_discounts': self.MULTI_YEAR_DISCOUNTS,
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def create_pricing_tiers(
        self,
        tier: DistributorTier,
        currency: CurrencyCode,
        base_product_price: float = 50000.0
    ) -> List[PricingTier]:
        """Create volume-based pricing tiers for a product"""
        
        base_discount = self.TIER_BASE_DISCOUNTS.get(tier, 0)
        effective_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        tiers = []
        for vol_tier in self.VOLUME_DISCOUNT_TIERS:
            total_discount = base_discount + vol_tier['additional_discount']
            total_discount = min(total_discount, 0.70)
            
            unit_price = base_product_price * (1 - total_discount)
            
            tier_name = f"Volume {vol_tier['min_units']}"
            if vol_tier['max_units']:
                tier_name += f"-{vol_tier['max_units']}"
            else:
                tier_name += "+"
            
            tiers.append(PricingTier(
                tier_name=tier_name,
                min_volume=vol_tier['min_units'],
                max_volume=vol_tier['max_units'],
                discount_percentage=total_discount,
                unit_price=round(unit_price, 2),
                currency=currency,
                effective_date=effective_date
            ))
        
        return tiers
    
    def calculate_margin_analysis(
        self,
        list_price: float,
        distributor_cost: float,
        end_user_price: float
    ) -> Dict[str, Any]:
        """Calculate margin analysis for a deal"""
        
        vendor_margin = list_price - distributor_cost
        vendor_margin_pct = vendor_margin / list_price if list_price > 0 else 0
        
        distributor_margin = end_user_price - distributor_cost
        distributor_margin_pct = distributor_margin / end_user_price if end_user_price > 0 else 0
        
        end_user_discount = list_price - end_user_price
        end_user_discount_pct = end_user_discount / list_price if list_price > 0 else 0
        
        return {
            'list_price': list_price,
            'distributor_cost': distributor_cost,
            'end_user_price': end_user_price,
            'vendor_margin': {
                'amount': round(vendor_margin, 2),
                'percentage': round(vendor_margin_pct, 4)
            },
            'distributor_margin': {
                'amount': round(distributor_margin, 2),
                'percentage': round(distributor_margin_pct, 4)
            },
            'end_user_discount': {
                'amount': round(end_user_discount, 2),
                'percentage': round(end_user_discount_pct, 4)
            },
            'analysis_date': datetime.utcnow().isoformat()
        }
    
    def calculate_deal_registration_price(
        self,
        product_id: str,
        tier: DistributorTier,
        currency: CurrencyCode,
        region: RegionCode,
        deal_size: str = 'standard'
    ) -> Dict[str, Any]:
        """
        Calculate special pricing for registered deals
        
        Args:
            product_id: Product identifier
            tier: Distributor tier
            currency: Target currency
            region: Geographic region
            deal_size: Deal size category (standard, large, strategic)
        
        Returns:
            Deal registration pricing
        """
        base_price = self.calculate_base_price(product_id, currency, region)
        _, tier_price = self.calculate_tier_discount(tier, base_price)
        
        deal_discounts = {
            'standard': 0.05,
            'large': 0.10,
            'strategic': 0.15
        }
        
        deal_discount = deal_discounts.get(deal_size, 0.05)
        deal_price = tier_price * (1 - deal_discount)
        
        protection_days = {
            'standard': 90,
            'large': 120,
            'strategic': 180
        }
        
        return {
            'product_id': product_id,
            'list_price': base_price,
            'tier_price': tier_price,
            'deal_registration_discount': deal_discount,
            'deal_registration_price': round(deal_price, 2),
            'total_discount': round(1 - (deal_price / base_price), 4),
            'deal_size': deal_size,
            'price_protection_days': protection_days.get(deal_size, 90),
            'currency': currency.value,
            'valid_until': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
    
    def simulate_revenue_scenario(
        self,
        tier: DistributorTier,
        products: List[Dict[str, Any]],
        currency: CurrencyCode,
        region: RegionCode,
        years: int = 3,
        growth_rate: float = 0.20
    ) -> Dict[str, Any]:
        """
        Simulate revenue scenario for planning
        
        Args:
            tier: Distributor tier
            products: List of products with quantities
            currency: Target currency
            region: Geographic region
            years: Projection years
            growth_rate: Annual growth rate
        
        Returns:
            Revenue projection
        """
        year_projections = []
        
        for year in range(1, years + 1):
            year_revenue = 0
            year_products = []
            
            for product in products:
                product_id = product.get('product_id')
                base_quantity = product.get('quantity', 1)
                
                quantity = int(base_quantity * ((1 + growth_rate) ** (year - 1)))
                
                deal = self.calculate_deal_price(
                    product_id=product_id,
                    quantity=quantity,
                    tier=tier,
                    currency=currency,
                    region=region,
                    years=1
                )
                
                year_products.append({
                    'product_id': product_id,
                    'quantity': quantity,
                    'revenue': deal['subtotal']
                })
                year_revenue += deal['subtotal']
            
            year_projections.append({
                'year': year,
                'products': year_products,
                'total_revenue': round(year_revenue, 2),
                'growth_from_prior': round(growth_rate * 100, 1) if year > 1 else 0
            })
        
        total_revenue = sum(y['total_revenue'] for y in year_projections)
        
        return {
            'scenario_id': f"SCN-{secrets.token_hex(4).upper()}",
            'tier': tier.value,
            'currency': currency.value,
            'region': region.value,
            'years': years,
            'growth_rate': growth_rate,
            'year_projections': year_projections,
            'total_projected_revenue': round(total_revenue, 2),
            'average_annual_revenue': round(total_revenue / years, 2),
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def get_exchange_rate(
        self,
        from_currency: CurrencyCode,
        to_currency: CurrencyCode
    ) -> float:
        """Get exchange rate between two currencies"""
        
        from_rate = self.CURRENCY_EXCHANGE_RATES.get(from_currency, 1.0)
        to_rate = self.CURRENCY_EXCHANGE_RATES.get(to_currency, 1.0)
        
        return round(to_rate / from_rate, 6)
    
    def update_exchange_rate(
        self,
        currency: CurrencyCode,
        rate: float
    ) -> None:
        """Update exchange rate for a currency"""
        self.CURRENCY_EXCHANGE_RATES[currency] = rate
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'products_configured': len(self.BASE_PRICES),
            'tiers_configured': len(self.TIER_BASE_DISCOUNTS),
            'currencies_supported': len(self.CURRENCY_EXCHANGE_RATES),
            'regions_configured': len(self.REGION_PRICE_ADJUSTMENTS),
            'volume_tiers': len(self.VOLUME_DISCOUNT_TIERS)
        }

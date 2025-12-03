"""
Channel Partner Contract Territory Engine
Global Distributor Edition (GDE)

Comprehensive territory management for distributor contracts including
region definitions, exclusivity management, and conflict resolution.
"""

import secrets
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple, Set
from .contract_schema import (
    RegionCode,
    DistributorTier,
    ContractType,
    TerritoryDefinition,
    DistributorContract
)


class TerritoryEngine:
    """
    GhostQuant Territory Management Engine™
    
    Manages geographic territories, exclusivity rights, and
    territory conflict resolution for global distributor contracts.
    """
    
    VERSION = "3.0.0"
    
    REGION_DEFINITIONS = {
        RegionCode.AMERICAS: {
            'name': 'Americas',
            'countries': [
                'United States', 'Canada', 'Mexico'
            ],
            'population': 500000000,
            'gdp_usd': 28000000000000,
            'market_maturity': 'mature',
            'primary_languages': ['English', 'Spanish', 'French'],
            'time_zones': ['UTC-10', 'UTC-5', 'UTC-3']
        },
        RegionCode.EMEA: {
            'name': 'Europe, Middle East & Africa',
            'countries': [
                'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
                'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden',
                'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal',
                'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Greece',
                'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco',
                'UAE', 'Saudi Arabia', 'Israel', 'Turkey'
            ],
            'population': 2500000000,
            'gdp_usd': 25000000000000,
            'market_maturity': 'mature',
            'primary_languages': ['English', 'German', 'French', 'Spanish', 'Arabic'],
            'time_zones': ['UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4']
        },
        RegionCode.APAC: {
            'name': 'Asia Pacific',
            'countries': [
                'Japan', 'South Korea', 'China', 'Hong Kong', 'Taiwan',
                'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines',
                'Vietnam', 'India', 'Australia', 'New Zealand'
            ],
            'population': 4500000000,
            'gdp_usd': 35000000000000,
            'market_maturity': 'growing',
            'primary_languages': ['English', 'Mandarin', 'Japanese', 'Korean', 'Hindi'],
            'time_zones': ['UTC+5:30', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10']
        },
        RegionCode.LATAM: {
            'name': 'Latin America',
            'countries': [
                'Brazil', 'Mexico', 'Argentina', 'Colombia', 'Chile',
                'Peru', 'Venezuela', 'Ecuador', 'Guatemala', 'Cuba',
                'Dominican Republic', 'Costa Rica', 'Panama', 'Uruguay', 'Paraguay'
            ],
            'population': 650000000,
            'gdp_usd': 5000000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['Spanish', 'Portuguese'],
            'time_zones': ['UTC-5', 'UTC-4', 'UTC-3']
        },
        RegionCode.MENA: {
            'name': 'Middle East & North Africa',
            'countries': [
                'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
                'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya',
                'Jordan', 'Lebanon', 'Iraq', 'Iran'
            ],
            'population': 500000000,
            'gdp_usd': 3500000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['Arabic', 'English', 'French'],
            'time_zones': ['UTC+2', 'UTC+3', 'UTC+4']
        },
        RegionCode.DACH: {
            'name': 'Germany, Austria, Switzerland',
            'countries': ['Germany', 'Austria', 'Switzerland'],
            'population': 100000000,
            'gdp_usd': 5500000000000,
            'market_maturity': 'mature',
            'primary_languages': ['German'],
            'time_zones': ['UTC+1']
        },
        RegionCode.NORDICS: {
            'name': 'Nordic Countries',
            'countries': ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],
            'population': 27000000,
            'gdp_usd': 1800000000000,
            'market_maturity': 'mature',
            'primary_languages': ['Swedish', 'Norwegian', 'Danish', 'Finnish', 'English'],
            'time_zones': ['UTC+0', 'UTC+1', 'UTC+2']
        },
        RegionCode.BENELUX: {
            'name': 'Belgium, Netherlands, Luxembourg',
            'countries': ['Belgium', 'Netherlands', 'Luxembourg'],
            'population': 30000000,
            'gdp_usd': 1500000000000,
            'market_maturity': 'mature',
            'primary_languages': ['Dutch', 'French', 'German', 'English'],
            'time_zones': ['UTC+1']
        },
        RegionCode.IBERIA: {
            'name': 'Iberian Peninsula',
            'countries': ['Spain', 'Portugal'],
            'population': 58000000,
            'gdp_usd': 1800000000000,
            'market_maturity': 'mature',
            'primary_languages': ['Spanish', 'Portuguese'],
            'time_zones': ['UTC+0', 'UTC+1']
        },
        RegionCode.CEE: {
            'name': 'Central & Eastern Europe',
            'countries': [
                'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
                'Slovakia', 'Slovenia', 'Croatia', 'Serbia', 'Ukraine'
            ],
            'population': 150000000,
            'gdp_usd': 2000000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['Polish', 'Czech', 'Hungarian', 'Romanian', 'English'],
            'time_zones': ['UTC+1', 'UTC+2', 'UTC+3']
        },
        RegionCode.CIS: {
            'name': 'Commonwealth of Independent States',
            'countries': [
                'Russia', 'Kazakhstan', 'Uzbekistan', 'Belarus', 'Azerbaijan',
                'Armenia', 'Georgia', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Moldova'
            ],
            'population': 280000000,
            'gdp_usd': 2500000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['Russian', 'Kazakh', 'Uzbek'],
            'time_zones': ['UTC+2', 'UTC+3', 'UTC+5', 'UTC+6']
        },
        RegionCode.ANZ: {
            'name': 'Australia & New Zealand',
            'countries': ['Australia', 'New Zealand'],
            'population': 30000000,
            'gdp_usd': 1800000000000,
            'market_maturity': 'mature',
            'primary_languages': ['English'],
            'time_zones': ['UTC+10', 'UTC+11', 'UTC+12']
        },
        RegionCode.GREATER_CHINA: {
            'name': 'Greater China',
            'countries': ['China', 'Hong Kong', 'Taiwan', 'Macau'],
            'population': 1400000000,
            'gdp_usd': 18000000000000,
            'market_maturity': 'growing',
            'primary_languages': ['Mandarin', 'Cantonese', 'English'],
            'time_zones': ['UTC+8']
        },
        RegionCode.INDIA_SUBCONTINENT: {
            'name': 'India & Subcontinent',
            'countries': ['India', 'Bangladesh', 'Sri Lanka', 'Pakistan', 'Nepal', 'Bhutan'],
            'population': 1900000000,
            'gdp_usd': 4000000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['Hindi', 'English', 'Bengali', 'Urdu'],
            'time_zones': ['UTC+5', 'UTC+5:30', 'UTC+6']
        },
        RegionCode.JAPAN_KOREA: {
            'name': 'Japan & Korea',
            'countries': ['Japan', 'South Korea'],
            'population': 200000000,
            'gdp_usd': 7000000000000,
            'market_maturity': 'mature',
            'primary_languages': ['Japanese', 'Korean'],
            'time_zones': ['UTC+9']
        },
        RegionCode.ASEAN: {
            'name': 'ASEAN',
            'countries': [
                'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines',
                'Vietnam', 'Myanmar', 'Cambodia', 'Laos', 'Brunei'
            ],
            'population': 700000000,
            'gdp_usd': 3500000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['English', 'Malay', 'Thai', 'Vietnamese', 'Indonesian'],
            'time_zones': ['UTC+7', 'UTC+8']
        },
        RegionCode.AFRICA: {
            'name': 'Africa',
            'countries': [
                'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco',
                'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda',
                'Senegal', 'Ivory Coast', 'Cameroon', 'Zimbabwe', 'Botswana'
            ],
            'population': 1400000000,
            'gdp_usd': 3000000000000,
            'market_maturity': 'emerging',
            'primary_languages': ['English', 'French', 'Arabic', 'Swahili', 'Portuguese'],
            'time_zones': ['UTC+0', 'UTC+1', 'UTC+2', 'UTC+3']
        },
        RegionCode.GLOBAL: {
            'name': 'Global (Worldwide)',
            'countries': ['All Countries'],
            'population': 8000000000,
            'gdp_usd': 100000000000000,
            'market_maturity': 'mixed',
            'primary_languages': ['English'],
            'time_zones': ['All']
        }
    }
    
    EXCLUSIVITY_RULES = {
        RegionCode.GLOBAL: {
            'exclusivity_allowed': False,
            'reason': 'Global exclusivity not permitted'
        },
        RegionCode.GREATER_CHINA: {
            'exclusivity_allowed': False,
            'reason': 'Regulatory restrictions prevent exclusivity'
        }
    }
    
    TIER_TERRITORY_LIMITS = {
        DistributorTier.AUTHORIZED: {
            'max_countries': 5,
            'max_regions': 1,
            'exclusivity_allowed': False
        },
        DistributorTier.PREFERRED: {
            'max_countries': 15,
            'max_regions': 2,
            'exclusivity_allowed': False
        },
        DistributorTier.PREMIER: {
            'max_countries': 30,
            'max_regions': 3,
            'exclusivity_allowed': True
        },
        DistributorTier.STRATEGIC: {
            'max_countries': 50,
            'max_regions': 5,
            'exclusivity_allowed': True
        },
        DistributorTier.GLOBAL_ELITE: {
            'max_countries': None,
            'max_regions': None,
            'exclusivity_allowed': True
        }
    }
    
    def __init__(self):
        self._territory_assignments: Dict[str, List[TerritoryDefinition]] = {}
        self._exclusivity_registry: Dict[str, Dict[str, Any]] = {}
    
    def get_region_info(self, region: RegionCode) -> Dict[str, Any]:
        """Get detailed information about a region"""
        return self.REGION_DEFINITIONS.get(region, {})
    
    def get_countries_for_region(self, region: RegionCode) -> List[str]:
        """Get list of countries in a region"""
        region_info = self.REGION_DEFINITIONS.get(region, {})
        return region_info.get('countries', [])
    
    def get_region_for_country(self, country: str) -> Optional[RegionCode]:
        """Find the region that contains a specific country"""
        for region, info in self.REGION_DEFINITIONS.items():
            if country in info.get('countries', []):
                return region
        return None
    
    def create_territory(
        self,
        territory_name: str,
        region: RegionCode,
        countries: List[str] = None,
        is_exclusive: bool = False,
        sub_regions: List[str] = None,
        excluded_countries: List[str] = None,
        local_requirements: List[str] = None
    ) -> TerritoryDefinition:
        """
        Create a new territory definition
        
        Args:
            territory_name: Name of the territory
            region: Primary region code
            countries: Specific countries (defaults to all in region)
            is_exclusive: Whether territory is exclusive
            sub_regions: Sub-region identifiers
            excluded_countries: Countries to exclude
            local_requirements: Local compliance requirements
        
        Returns:
            TerritoryDefinition instance
        """
        territory_id = f"TER-{secrets.token_hex(6).upper()}"
        
        if countries is None:
            countries = self.get_countries_for_region(region)
        
        if excluded_countries:
            countries = [c for c in countries if c not in excluded_countries]
        
        region_info = self.REGION_DEFINITIONS.get(region, {})
        
        country_ratio = len(countries) / len(region_info.get('countries', [1])) if region_info.get('countries') else 1
        population = int(region_info.get('population', 0) * country_ratio)
        gdp = region_info.get('gdp_usd', 0) * country_ratio
        
        market_potential = self._calculate_market_potential(region, countries)
        
        return TerritoryDefinition(
            territory_id=territory_id,
            territory_name=territory_name,
            region_code=region,
            countries=countries,
            sub_regions=sub_regions or [],
            excluded_countries=excluded_countries or [],
            is_exclusive=is_exclusive,
            population_coverage=population,
            gdp_coverage_usd=gdp,
            market_potential_score=market_potential,
            regulatory_complexity=self._get_regulatory_complexity(region),
            local_requirements=local_requirements or []
        )
    
    def _calculate_market_potential(
        self,
        region: RegionCode,
        countries: List[str]
    ) -> float:
        """Calculate market potential score (0-100)"""
        
        base_scores = {
            RegionCode.AMERICAS: 95,
            RegionCode.EMEA: 90,
            RegionCode.APAC: 92,
            RegionCode.LATAM: 75,
            RegionCode.MENA: 70,
            RegionCode.DACH: 88,
            RegionCode.NORDICS: 82,
            RegionCode.BENELUX: 80,
            RegionCode.IBERIA: 75,
            RegionCode.CEE: 70,
            RegionCode.CIS: 65,
            RegionCode.ANZ: 80,
            RegionCode.GREATER_CHINA: 85,
            RegionCode.INDIA_SUBCONTINENT: 78,
            RegionCode.JAPAN_KOREA: 88,
            RegionCode.ASEAN: 76,
            RegionCode.AFRICA: 60,
            RegionCode.GLOBAL: 100
        }
        
        base_score = base_scores.get(region, 50)
        
        region_countries = self.get_countries_for_region(region)
        coverage_ratio = len(countries) / len(region_countries) if region_countries else 1
        
        adjusted_score = base_score * (0.5 + 0.5 * coverage_ratio)
        
        return round(min(100, adjusted_score), 1)
    
    def _get_regulatory_complexity(self, region: RegionCode) -> str:
        """Get regulatory complexity level for a region"""
        complexity_map = {
            RegionCode.AMERICAS: 'moderate',
            RegionCode.EMEA: 'high',
            RegionCode.APAC: 'high',
            RegionCode.LATAM: 'moderate',
            RegionCode.MENA: 'high',
            RegionCode.DACH: 'very_high',
            RegionCode.NORDICS: 'moderate',
            RegionCode.BENELUX: 'moderate',
            RegionCode.IBERIA: 'moderate',
            RegionCode.CEE: 'moderate',
            RegionCode.CIS: 'high',
            RegionCode.ANZ: 'moderate',
            RegionCode.GREATER_CHINA: 'very_high',
            RegionCode.INDIA_SUBCONTINENT: 'high',
            RegionCode.JAPAN_KOREA: 'high',
            RegionCode.ASEAN: 'moderate',
            RegionCode.AFRICA: 'high',
            RegionCode.GLOBAL: 'very_high'
        }
        return complexity_map.get(region, 'standard')
    
    def validate_territory_for_tier(
        self,
        territory: TerritoryDefinition,
        tier: DistributorTier
    ) -> Tuple[bool, List[str]]:
        """
        Validate if territory is allowed for distributor tier
        
        Args:
            territory: Territory to validate
            tier: Distributor tier
        
        Returns:
            Tuple of (is_valid, list of issues)
        """
        issues = []
        tier_limits = self.TIER_TERRITORY_LIMITS[tier]
        
        if tier_limits['max_countries'] is not None:
            if len(territory.countries) > tier_limits['max_countries']:
                issues.append(
                    f"Territory has {len(territory.countries)} countries, "
                    f"but {tier.value} tier allows maximum {tier_limits['max_countries']}"
                )
        
        if territory.is_exclusive and not tier_limits['exclusivity_allowed']:
            issues.append(
                f"Exclusivity not allowed for {tier.value} tier"
            )
        
        exclusivity_rule = self.EXCLUSIVITY_RULES.get(territory.region_code)
        if territory.is_exclusive and exclusivity_rule:
            if not exclusivity_rule['exclusivity_allowed']:
                issues.append(
                    f"Exclusivity not allowed for {territory.region_code.value}: "
                    f"{exclusivity_rule['reason']}"
                )
        
        return len(issues) == 0, issues
    
    def check_territory_conflicts(
        self,
        new_territory: TerritoryDefinition,
        existing_contracts: List[DistributorContract]
    ) -> List[Dict[str, Any]]:
        """
        Check for territory conflicts with existing contracts
        
        Args:
            new_territory: New territory to check
            existing_contracts: List of existing contracts
        
        Returns:
            List of conflict details
        """
        conflicts = []
        
        for contract in existing_contracts:
            if contract.status.value not in ['active', 'approved']:
                continue
            
            for existing_territory in contract.terms.territories:
                overlapping = set(new_territory.countries) & set(existing_territory.countries)
                
                if overlapping:
                    conflict_type = 'overlap'
                    severity = 'warning'
                    
                    if existing_territory.is_exclusive or new_territory.is_exclusive:
                        conflict_type = 'exclusive_conflict'
                        severity = 'error'
                    
                    conflicts.append({
                        'conflict_id': f"CONF-{secrets.token_hex(4).upper()}",
                        'type': conflict_type,
                        'severity': severity,
                        'existing_contract_id': contract.contract_id,
                        'existing_distributor': contract.distributor.company_name,
                        'existing_territory': existing_territory.territory_name,
                        'existing_is_exclusive': existing_territory.is_exclusive,
                        'new_territory': new_territory.territory_name,
                        'new_is_exclusive': new_territory.is_exclusive,
                        'overlapping_countries': list(overlapping),
                        'overlap_count': len(overlapping),
                        'resolution_options': self._get_resolution_options(
                            conflict_type, existing_territory, new_territory
                        )
                    })
        
        return conflicts
    
    def _get_resolution_options(
        self,
        conflict_type: str,
        existing: TerritoryDefinition,
        new: TerritoryDefinition
    ) -> List[str]:
        """Get resolution options for a territory conflict"""
        
        options = []
        
        if conflict_type == 'exclusive_conflict':
            if existing.is_exclusive:
                options.append("Wait for existing exclusive agreement to expire")
                options.append("Negotiate territory carve-out with existing distributor")
                options.append("Request exclusivity waiver from existing distributor")
            if new.is_exclusive:
                options.append("Convert new territory to non-exclusive")
                options.append("Reduce new territory scope to avoid overlap")
        else:
            options.append("Proceed with non-exclusive overlap (standard practice)")
            options.append("Define sub-territory boundaries for clarity")
            options.append("Establish lead registration rules for overlapping areas")
        
        return options
    
    def register_territory_assignment(
        self,
        contract_id: str,
        territory: TerritoryDefinition
    ) -> Dict[str, Any]:
        """
        Register a territory assignment for tracking
        
        Args:
            contract_id: Contract identifier
            territory: Territory being assigned
        
        Returns:
            Assignment record
        """
        assignment = {
            'assignment_id': f"ASGN-{secrets.token_hex(6).upper()}",
            'contract_id': contract_id,
            'territory_id': territory.territory_id,
            'territory_name': territory.territory_name,
            'region': territory.region_code.value,
            'countries': territory.countries,
            'is_exclusive': territory.is_exclusive,
            'assigned_at': datetime.utcnow().isoformat(),
            'status': 'active'
        }
        
        if contract_id not in self._territory_assignments:
            self._territory_assignments[contract_id] = []
        
        self._territory_assignments[contract_id].append(territory)
        
        if territory.is_exclusive:
            for country in territory.countries:
                self._exclusivity_registry[country] = {
                    'contract_id': contract_id,
                    'territory_id': territory.territory_id,
                    'assigned_at': assignment['assigned_at']
                }
        
        return assignment
    
    def release_territory_assignment(
        self,
        contract_id: str,
        territory_id: str
    ) -> bool:
        """Release a territory assignment"""
        
        if contract_id in self._territory_assignments:
            territories = self._territory_assignments[contract_id]
            for territory in territories:
                if territory.territory_id == territory_id:
                    territories.remove(territory)
                    
                    if territory.is_exclusive:
                        for country in territory.countries:
                            if country in self._exclusivity_registry:
                                if self._exclusivity_registry[country]['contract_id'] == contract_id:
                                    del self._exclusivity_registry[country]
                    
                    return True
        
        return False
    
    def get_territory_assignments(
        self,
        contract_id: str = None,
        region: RegionCode = None,
        country: str = None
    ) -> List[Dict[str, Any]]:
        """Get territory assignments with optional filters"""
        
        results = []
        
        for cid, territories in self._territory_assignments.items():
            if contract_id and cid != contract_id:
                continue
            
            for territory in territories:
                if region and territory.region_code != region:
                    continue
                
                if country and country not in territory.countries:
                    continue
                
                results.append({
                    'contract_id': cid,
                    'territory': territory.to_dict()
                })
        
        return results
    
    def get_exclusive_territories(self) -> Dict[str, Dict[str, Any]]:
        """Get all exclusive territory assignments"""
        return self._exclusivity_registry.copy()
    
    def is_country_exclusive(self, country: str) -> Tuple[bool, Optional[str]]:
        """
        Check if a country has exclusive assignment
        
        Returns:
            Tuple of (is_exclusive, contract_id or None)
        """
        if country in self._exclusivity_registry:
            return True, self._exclusivity_registry[country]['contract_id']
        return False, None
    
    def calculate_territory_coverage(
        self,
        territories: List[TerritoryDefinition]
    ) -> Dict[str, Any]:
        """
        Calculate coverage statistics for territories
        
        Args:
            territories: List of territories
        
        Returns:
            Coverage statistics
        """
        all_countries: Set[str] = set()
        total_population = 0
        total_gdp = 0.0
        regions_covered: Set[str] = set()
        exclusive_count = 0
        
        for territory in territories:
            all_countries.update(territory.countries)
            total_population += territory.population_coverage
            total_gdp += territory.gdp_coverage_usd
            regions_covered.add(territory.region_code.value)
            if territory.is_exclusive:
                exclusive_count += 1
        
        global_info = self.REGION_DEFINITIONS[RegionCode.GLOBAL]
        global_population = global_info['population']
        global_gdp = global_info['gdp_usd']
        
        return {
            'total_countries': len(all_countries),
            'countries': list(all_countries),
            'total_population': total_population,
            'population_coverage_pct': round(total_population / global_population * 100, 2),
            'total_gdp_usd': total_gdp,
            'gdp_coverage_pct': round(total_gdp / global_gdp * 100, 2),
            'regions_covered': list(regions_covered),
            'region_count': len(regions_covered),
            'exclusive_territories': exclusive_count,
            'non_exclusive_territories': len(territories) - exclusive_count,
            'average_market_potential': round(
                sum(t.market_potential_score for t in territories) / len(territories), 1
            ) if territories else 0
        }
    
    def suggest_territory_expansion(
        self,
        current_territories: List[TerritoryDefinition],
        tier: DistributorTier,
        existing_contracts: List[DistributorContract] = None
    ) -> List[Dict[str, Any]]:
        """
        Suggest territory expansion opportunities
        
        Args:
            current_territories: Current territory assignments
            tier: Distributor tier
            existing_contracts: Existing contracts for conflict checking
        
        Returns:
            List of expansion suggestions
        """
        suggestions = []
        
        current_countries = set()
        current_regions = set()
        for territory in current_territories:
            current_countries.update(territory.countries)
            current_regions.add(territory.region_code)
        
        tier_limits = self.TIER_TERRITORY_LIMITS[tier]
        max_countries = tier_limits['max_countries']
        
        if max_countries is not None:
            available_slots = max_countries - len(current_countries)
            if available_slots <= 0:
                return [{
                    'type': 'limit_reached',
                    'message': f'{tier.value} tier country limit reached',
                    'current_count': len(current_countries),
                    'max_allowed': max_countries
                }]
        
        for region in current_regions:
            region_countries = set(self.get_countries_for_region(region))
            uncovered = region_countries - current_countries
            
            if uncovered:
                suggestions.append({
                    'type': 'region_completion',
                    'region': region.value,
                    'suggestion': f'Complete {region.value} coverage',
                    'countries_to_add': list(uncovered),
                    'count': len(uncovered),
                    'priority': 'high'
                })
        
        adjacent_regions = self._get_adjacent_regions(list(current_regions))
        for region in adjacent_regions:
            if region not in current_regions:
                region_info = self.REGION_DEFINITIONS.get(region, {})
                suggestions.append({
                    'type': 'adjacent_expansion',
                    'region': region.value,
                    'suggestion': f'Expand to adjacent region: {region_info.get("name", region.value)}',
                    'countries_to_add': region_info.get('countries', []),
                    'count': len(region_info.get('countries', [])),
                    'market_maturity': region_info.get('market_maturity', 'unknown'),
                    'priority': 'medium'
                })
        
        return suggestions
    
    def _get_adjacent_regions(self, current_regions: List[RegionCode]) -> List[RegionCode]:
        """Get regions adjacent to current regions"""
        
        adjacency_map = {
            RegionCode.AMERICAS: [RegionCode.LATAM],
            RegionCode.EMEA: [RegionCode.DACH, RegionCode.NORDICS, RegionCode.BENELUX, RegionCode.IBERIA, RegionCode.CEE, RegionCode.MENA],
            RegionCode.APAC: [RegionCode.GREATER_CHINA, RegionCode.JAPAN_KOREA, RegionCode.ASEAN, RegionCode.ANZ, RegionCode.INDIA_SUBCONTINENT],
            RegionCode.LATAM: [RegionCode.AMERICAS],
            RegionCode.MENA: [RegionCode.EMEA, RegionCode.AFRICA],
            RegionCode.DACH: [RegionCode.EMEA, RegionCode.NORDICS, RegionCode.BENELUX, RegionCode.CEE],
            RegionCode.NORDICS: [RegionCode.EMEA, RegionCode.DACH],
            RegionCode.BENELUX: [RegionCode.EMEA, RegionCode.DACH],
            RegionCode.IBERIA: [RegionCode.EMEA],
            RegionCode.CEE: [RegionCode.EMEA, RegionCode.DACH, RegionCode.CIS],
            RegionCode.CIS: [RegionCode.CEE],
            RegionCode.ANZ: [RegionCode.APAC, RegionCode.ASEAN],
            RegionCode.GREATER_CHINA: [RegionCode.APAC, RegionCode.JAPAN_KOREA, RegionCode.ASEAN],
            RegionCode.INDIA_SUBCONTINENT: [RegionCode.APAC, RegionCode.ASEAN, RegionCode.MENA],
            RegionCode.JAPAN_KOREA: [RegionCode.APAC, RegionCode.GREATER_CHINA],
            RegionCode.ASEAN: [RegionCode.APAC, RegionCode.GREATER_CHINA, RegionCode.ANZ, RegionCode.INDIA_SUBCONTINENT],
            RegionCode.AFRICA: [RegionCode.MENA, RegionCode.EMEA]
        }
        
        adjacent = set()
        for region in current_regions:
            adjacent.update(adjacency_map.get(region, []))
        
        return list(adjacent - set(current_regions))
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'regions_defined': len(self.REGION_DEFINITIONS),
            'active_assignments': sum(len(t) for t in self._territory_assignments.values()),
            'exclusive_countries': len(self._exclusivity_registry),
            'tier_limits_configured': len(self.TIER_TERRITORY_LIMITS)
        }

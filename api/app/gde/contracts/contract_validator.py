"""
Channel Partner Contract Validator
Global Distributor Edition (GDE)

Comprehensive validation engine for distributor contracts including
business rules, compliance checks, territory conflicts, and pricing validation.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .contract_schema import (
    ContractType,
    ContractStatus,
    DistributorTier,
    RegionCode,
    CurrencyCode,
    PaymentTerms,
    ComplianceLevel,
    DistributorContract,
    ContractTerms,
    DistributorProfile,
    TerritoryDefinition,
    ProductAuthorization,
    CommitmentSchedule,
    ContractValidationResult
)


class ContractValidator:
    """
    GhostQuant Contract Validation Engine™
    
    Validates distributor contracts against business rules, compliance
    requirements, territory restrictions, and pricing policies.
    """
    
    VERSION = "3.0.0"
    
    MINIMUM_CONTRACT_TERM_MONTHS = 12
    MAXIMUM_CONTRACT_TERM_MONTHS = 60
    MINIMUM_NOTICE_PERIOD_DAYS = 30
    MAXIMUM_DISCOUNT_PERCENTAGE = 0.70
    MINIMUM_COMMITMENT_AMOUNT = 50000
    MAXIMUM_CREDIT_LIMIT_MULTIPLIER = 3.0
    
    TIER_MINIMUM_REQUIREMENTS = {
        DistributorTier.AUTHORIZED: {
            'min_employees': 5,
            'min_revenue': 100000,
            'min_years_established': 1,
            'certifications_required': []
        },
        DistributorTier.PREFERRED: {
            'min_employees': 20,
            'min_revenue': 500000,
            'min_years_established': 3,
            'certifications_required': ['ISO 9001']
        },
        DistributorTier.PREMIER: {
            'min_employees': 50,
            'min_revenue': 2000000,
            'min_years_established': 5,
            'certifications_required': ['ISO 9001', 'ISO 27001']
        },
        DistributorTier.STRATEGIC: {
            'min_employees': 100,
            'min_revenue': 10000000,
            'min_years_established': 7,
            'certifications_required': ['ISO 9001', 'ISO 27001', 'SOC 2']
        },
        DistributorTier.GLOBAL_ELITE: {
            'min_employees': 500,
            'min_revenue': 50000000,
            'min_years_established': 10,
            'certifications_required': ['ISO 9001', 'ISO 27001', 'SOC 2', 'ISO 22301']
        }
    }
    
    REGION_REQUIRED_COMPLIANCE = {
        RegionCode.AMERICAS: ['SOC 2'],
        RegionCode.EMEA: ['GDPR', 'ISO 27001'],
        RegionCode.APAC: ['ISO 27001'],
        RegionCode.LATAM: ['ISO 27001'],
        RegionCode.MENA: ['ISO 27001'],
        RegionCode.DACH: ['GDPR', 'ISO 27001', 'BDSG'],
        RegionCode.NORDICS: ['GDPR', 'ISO 27001'],
        RegionCode.ANZ: ['Privacy Act', 'ISO 27001'],
        RegionCode.GREATER_CHINA: ['PIPL', 'CSL'],
        RegionCode.INDIA_SUBCONTINENT: ['DPDP', 'ISO 27001'],
        RegionCode.JAPAN_KOREA: ['APPI', 'PIPA'],
        RegionCode.ASEAN: ['PDPA', 'ISO 27001'],
        RegionCode.GLOBAL: ['SOC 2', 'ISO 27001', 'GDPR']
    }
    
    EXCLUSIVE_TERRITORY_RESTRICTIONS = {
        RegionCode.GLOBAL: False,
        RegionCode.AMERICAS: True,
        RegionCode.EMEA: True,
        RegionCode.APAC: True,
        RegionCode.LATAM: True,
        RegionCode.MENA: True,
        RegionCode.DACH: True,
        RegionCode.NORDICS: True,
        RegionCode.ANZ: True,
        RegionCode.GREATER_CHINA: False,
        RegionCode.INDIA_SUBCONTINENT: True,
        RegionCode.JAPAN_KOREA: True,
        RegionCode.ASEAN: True
    }
    
    def __init__(self):
        self._validation_cache: Dict[str, ContractValidationResult] = {}
        self._existing_territories: Dict[str, List[TerritoryDefinition]] = {}
    
    def validate_contract(
        self,
        contract: DistributorContract,
        existing_contracts: List[DistributorContract] = None
    ) -> ContractValidationResult:
        """
        Perform comprehensive contract validation
        
        Args:
            contract: Contract to validate
            existing_contracts: List of existing contracts for conflict checking
        
        Returns:
            ContractValidationResult with validation status and details
        """
        errors: List[Dict[str, str]] = []
        warnings: List[Dict[str, str]] = []
        compliance_checks: List[Dict[str, Any]] = []
        territory_conflicts: List[Dict[str, Any]] = []
        pricing_issues: List[Dict[str, str]] = []
        commitment_gaps: List[Dict[str, str]] = []
        recommendations: List[str] = []
        
        distributor_errors, distributor_warnings = self._validate_distributor_profile(
            contract.distributor,
            contract.terms.distributor_tier
        )
        errors.extend(distributor_errors)
        warnings.extend(distributor_warnings)
        
        term_errors, term_warnings = self._validate_contract_terms(contract.terms)
        errors.extend(term_errors)
        warnings.extend(term_warnings)
        
        territory_errors, territory_warnings, conflicts = self._validate_territories(
            contract.terms.territories,
            contract.terms.contract_type,
            existing_contracts or []
        )
        errors.extend(territory_errors)
        warnings.extend(territory_warnings)
        territory_conflicts.extend(conflicts)
        
        pricing_errors, pricing_warnings = self._validate_pricing(
            contract.terms.pricing_tiers,
            contract.terms.distributor_tier
        )
        errors.extend(pricing_errors)
        warnings.extend(pricing_warnings)
        pricing_issues.extend([{"issue": e["message"]} for e in pricing_errors])
        
        commitment_errors, commitment_warnings = self._validate_commitments(
            contract.terms.commitments,
            contract.terms.distributor_tier
        )
        errors.extend(commitment_errors)
        warnings.extend(commitment_warnings)
        commitment_gaps.extend([{"gap": e["message"]} for e in commitment_errors])
        
        compliance_results = self._validate_compliance(
            contract.terms.compliance_requirements,
            contract.terms.territories,
            contract.distributor
        )
        compliance_checks.extend(compliance_results)
        
        for check in compliance_results:
            if not check.get("passed", False):
                errors.append({
                    "field": "compliance",
                    "message": check.get("message", "Compliance check failed")
                })
        
        legal_errors, legal_warnings = self._validate_legal_terms(contract.terms)
        errors.extend(legal_errors)
        warnings.extend(legal_warnings)
        
        recommendations = self._generate_validation_recommendations(
            errors, warnings, contract.terms.distributor_tier
        )
        
        is_valid = len(errors) == 0
        
        return ContractValidationResult(
            is_valid=is_valid,
            contract_id=contract.contract_id,
            validation_timestamp=datetime.utcnow().isoformat(),
            errors=errors,
            warnings=warnings,
            compliance_checks=compliance_checks,
            territory_conflicts=territory_conflicts,
            pricing_issues=pricing_issues,
            commitment_gaps=commitment_gaps,
            recommendations=recommendations
        )
    
    def _validate_distributor_profile(
        self,
        distributor: DistributorProfile,
        tier: DistributorTier
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        """Validate distributor profile against tier requirements"""
        
        errors = []
        warnings = []
        
        requirements = self.TIER_MINIMUM_REQUIREMENTS[tier]
        
        if not distributor.company_name or len(distributor.company_name) < 2:
            errors.append({
                "field": "company_name",
                "message": "Company name is required and must be at least 2 characters"
            })
        
        if not distributor.legal_name:
            errors.append({
                "field": "legal_name",
                "message": "Legal entity name is required"
            })
        
        if not distributor.registration_number:
            errors.append({
                "field": "registration_number",
                "message": "Company registration number is required"
            })
        
        if not distributor.tax_id:
            warnings.append({
                "field": "tax_id",
                "message": "Tax ID is recommended for invoicing purposes"
            })
        
        if distributor.employee_count < requirements['min_employees']:
            errors.append({
                "field": "employee_count",
                "message": f"{tier.value} tier requires minimum {requirements['min_employees']} employees. Current: {distributor.employee_count}"
            })
        
        if distributor.annual_revenue < requirements['min_revenue']:
            errors.append({
                "field": "annual_revenue",
                "message": f"{tier.value} tier requires minimum ${requirements['min_revenue']:,.0f} annual revenue. Current: ${distributor.annual_revenue:,.0f}"
            })
        
        current_year = datetime.utcnow().year
        years_established = current_year - distributor.year_established
        if years_established < requirements['min_years_established']:
            errors.append({
                "field": "year_established",
                "message": f"{tier.value} tier requires minimum {requirements['min_years_established']} years in business. Current: {years_established} years"
            })
        
        missing_certs = []
        for required_cert in requirements['certifications_required']:
            if required_cert not in distributor.industry_certifications:
                missing_certs.append(required_cert)
        
        if missing_certs:
            errors.append({
                "field": "industry_certifications",
                "message": f"Missing required certifications for {tier.value} tier: {', '.join(missing_certs)}"
            })
        
        if not distributor.key_contacts or len(distributor.key_contacts) < 2:
            warnings.append({
                "field": "key_contacts",
                "message": "At least 2 key contacts are recommended (sales and technical)"
            })
        
        if not distributor.headquarters_address:
            errors.append({
                "field": "headquarters_address",
                "message": "Headquarters address is required"
            })
        
        return errors, warnings
    
    def _validate_contract_terms(
        self,
        terms: ContractTerms
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        """Validate contract terms"""
        
        errors = []
        warnings = []
        
        if terms.initial_term_months < self.MINIMUM_CONTRACT_TERM_MONTHS:
            errors.append({
                "field": "initial_term_months",
                "message": f"Minimum contract term is {self.MINIMUM_CONTRACT_TERM_MONTHS} months"
            })
        
        if terms.initial_term_months > self.MAXIMUM_CONTRACT_TERM_MONTHS:
            errors.append({
                "field": "initial_term_months",
                "message": f"Maximum contract term is {self.MAXIMUM_CONTRACT_TERM_MONTHS} months"
            })
        
        if terms.notice_period_days < self.MINIMUM_NOTICE_PERIOD_DAYS:
            errors.append({
                "field": "notice_period_days",
                "message": f"Minimum notice period is {self.MINIMUM_NOTICE_PERIOD_DAYS} days"
            })
        
        try:
            effective = datetime.fromisoformat(terms.effective_date)
            expiration = datetime.fromisoformat(terms.expiration_date)
            
            if expiration <= effective:
                errors.append({
                    "field": "expiration_date",
                    "message": "Expiration date must be after effective date"
                })
            
            if effective < datetime.utcnow() - timedelta(days=30):
                warnings.append({
                    "field": "effective_date",
                    "message": "Effective date is more than 30 days in the past"
                })
        except ValueError:
            errors.append({
                "field": "dates",
                "message": "Invalid date format for effective or expiration date"
            })
        
        if terms.credit_limit <= 0:
            errors.append({
                "field": "credit_limit",
                "message": "Credit limit must be greater than zero"
            })
        
        if not terms.territories:
            errors.append({
                "field": "territories",
                "message": "At least one territory must be defined"
            })
        
        if not terms.products:
            errors.append({
                "field": "products",
                "message": "At least one product must be authorized"
            })
        
        if not terms.termination_clauses:
            warnings.append({
                "field": "termination_clauses",
                "message": "Termination clauses should be defined"
            })
        
        if not terms.governing_law:
            errors.append({
                "field": "governing_law",
                "message": "Governing law must be specified"
            })
        
        return errors, warnings
    
    def _validate_territories(
        self,
        territories: List[TerritoryDefinition],
        contract_type: ContractType,
        existing_contracts: List[DistributorContract]
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]], List[Dict[str, Any]]]:
        """Validate territories and check for conflicts"""
        
        errors = []
        warnings = []
        conflicts = []
        
        for territory in territories:
            if not territory.countries:
                errors.append({
                    "field": f"territory_{territory.territory_id}",
                    "message": f"Territory '{territory.territory_name}' must include at least one country"
                })
            
            if territory.is_exclusive:
                if not self.EXCLUSIVE_TERRITORY_RESTRICTIONS.get(territory.region_code, True):
                    errors.append({
                        "field": f"territory_{territory.territory_id}",
                        "message": f"Exclusive distribution not available for {territory.region_code.value} region"
                    })
                
                if contract_type not in [ContractType.EXCLUSIVE_DISTRIBUTION, ContractType.MASTER_DISTRIBUTION]:
                    warnings.append({
                        "field": f"territory_{territory.territory_id}",
                        "message": f"Exclusive territory requested but contract type is {contract_type.value}"
                    })
        
        for contract in existing_contracts:
            if contract.status not in [ContractStatus.ACTIVE, ContractStatus.APPROVED]:
                continue
            
            for existing_territory in contract.terms.territories:
                for new_territory in territories:
                    overlapping_countries = set(existing_territory.countries) & set(new_territory.countries)
                    
                    if overlapping_countries:
                        if existing_territory.is_exclusive or new_territory.is_exclusive:
                            conflicts.append({
                                "type": "exclusive_conflict",
                                "existing_contract": contract.contract_id,
                                "existing_distributor": contract.distributor.company_name,
                                "territory": existing_territory.territory_name,
                                "countries": list(overlapping_countries),
                                "message": f"Exclusive territory conflict with {contract.distributor.company_name}"
                            })
                            errors.append({
                                "field": "territories",
                                "message": f"Territory conflict: {', '.join(overlapping_countries)} already assigned exclusively"
                            })
                        else:
                            conflicts.append({
                                "type": "overlap_warning",
                                "existing_contract": contract.contract_id,
                                "existing_distributor": contract.distributor.company_name,
                                "territory": existing_territory.territory_name,
                                "countries": list(overlapping_countries),
                                "message": f"Territory overlap with {contract.distributor.company_name}"
                            })
                            warnings.append({
                                "field": "territories",
                                "message": f"Territory overlap: {', '.join(overlapping_countries)} also assigned to {contract.distributor.company_name}"
                            })
        
        return errors, warnings, conflicts
    
    def _validate_pricing(
        self,
        pricing_tiers: List,
        distributor_tier: DistributorTier
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        """Validate pricing structure"""
        
        errors = []
        warnings = []
        
        if not pricing_tiers:
            errors.append({
                "field": "pricing_tiers",
                "message": "At least one pricing tier must be defined"
            })
            return errors, warnings
        
        for tier in pricing_tiers:
            if tier.discount_percentage > self.MAXIMUM_DISCOUNT_PERCENTAGE:
                errors.append({
                    "field": f"pricing_tier_{tier.tier_name}",
                    "message": f"Discount {tier.discount_percentage*100:.0f}% exceeds maximum allowed {self.MAXIMUM_DISCOUNT_PERCENTAGE*100:.0f}%"
                })
            
            if tier.discount_percentage < 0:
                errors.append({
                    "field": f"pricing_tier_{tier.tier_name}",
                    "message": "Discount percentage cannot be negative"
                })
            
            if tier.unit_price <= 0:
                errors.append({
                    "field": f"pricing_tier_{tier.tier_name}",
                    "message": "Unit price must be greater than zero"
                })
            
            if tier.min_volume < 0:
                errors.append({
                    "field": f"pricing_tier_{tier.tier_name}",
                    "message": "Minimum volume cannot be negative"
                })
            
            if tier.max_volume is not None and tier.max_volume <= tier.min_volume:
                errors.append({
                    "field": f"pricing_tier_{tier.tier_name}",
                    "message": "Maximum volume must be greater than minimum volume"
                })
        
        sorted_tiers = sorted(pricing_tiers, key=lambda t: t.min_volume)
        for i in range(len(sorted_tiers) - 1):
            current = sorted_tiers[i]
            next_tier = sorted_tiers[i + 1]
            
            if current.discount_percentage >= next_tier.discount_percentage:
                warnings.append({
                    "field": "pricing_tiers",
                    "message": f"Higher volume tier '{next_tier.tier_name}' should have better discount than '{current.tier_name}'"
                })
        
        return errors, warnings
    
    def _validate_commitments(
        self,
        commitments: List[CommitmentSchedule],
        distributor_tier: DistributorTier
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        """Validate commitment schedules"""
        
        errors = []
        warnings = []
        
        if not commitments:
            errors.append({
                "field": "commitments",
                "message": "At least one commitment schedule must be defined"
            })
            return errors, warnings
        
        for commitment in commitments:
            if commitment.minimum_revenue_commitment < self.MINIMUM_COMMITMENT_AMOUNT:
                errors.append({
                    "field": f"commitment_year_{commitment.year}",
                    "message": f"Minimum commitment ${commitment.minimum_revenue_commitment:,.0f} is below required ${self.MINIMUM_COMMITMENT_AMOUNT:,.0f}"
                })
            
            if len(commitment.quarterly_targets) != 4:
                errors.append({
                    "field": f"commitment_year_{commitment.year}",
                    "message": "Exactly 4 quarterly targets must be defined"
                })
            
            quarterly_sum = sum(commitment.quarterly_targets)
            if abs(quarterly_sum - commitment.minimum_revenue_commitment) > 1:
                warnings.append({
                    "field": f"commitment_year_{commitment.year}",
                    "message": f"Quarterly targets sum (${quarterly_sum:,.0f}) doesn't match annual commitment (${commitment.minimum_revenue_commitment:,.0f})"
                })
            
            if commitment.growth_target_percentage < 0:
                errors.append({
                    "field": f"commitment_year_{commitment.year}",
                    "message": "Growth target cannot be negative"
                })
            
            if commitment.growth_target_percentage > 100:
                warnings.append({
                    "field": f"commitment_year_{commitment.year}",
                    "message": f"Growth target of {commitment.growth_target_percentage}% may be unrealistic"
                })
        
        sorted_commitments = sorted(commitments, key=lambda c: c.year)
        for i in range(len(sorted_commitments) - 1):
            current = sorted_commitments[i]
            next_year = sorted_commitments[i + 1]
            
            if next_year.minimum_revenue_commitment < current.minimum_revenue_commitment:
                warnings.append({
                    "field": "commitments",
                    "message": f"Year {next_year.year} commitment is lower than year {current.year}"
                })
        
        return errors, warnings
    
    def _validate_compliance(
        self,
        compliance_requirements: List,
        territories: List[TerritoryDefinition],
        distributor: DistributorProfile
    ) -> List[Dict[str, Any]]:
        """Validate compliance requirements"""
        
        results = []
        
        for territory in territories:
            required_frameworks = self.REGION_REQUIRED_COMPLIANCE.get(
                territory.region_code, []
            )
            
            for framework in required_frameworks:
                has_requirement = any(
                    framework.lower() in req.requirement_name.lower()
                    for req in compliance_requirements
                )
                
                has_certification = framework in distributor.industry_certifications
                
                results.append({
                    "framework": framework,
                    "region": territory.region_code.value,
                    "required": True,
                    "in_contract": has_requirement,
                    "distributor_certified": has_certification,
                    "passed": has_requirement,
                    "message": f"{framework} compliance {'included' if has_requirement else 'missing'} for {territory.region_code.value}"
                })
        
        return results
    
    def _validate_legal_terms(
        self,
        terms: ContractTerms
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        """Validate legal terms"""
        
        errors = []
        warnings = []
        
        if terms.confidentiality_term_years < 2:
            warnings.append({
                "field": "confidentiality_term_years",
                "message": "Confidentiality term of less than 2 years may not adequately protect trade secrets"
            })
        
        if terms.confidentiality_term_years > 10:
            warnings.append({
                "field": "confidentiality_term_years",
                "message": "Confidentiality term exceeding 10 years may be unenforceable in some jurisdictions"
            })
        
        if terms.non_compete_term_months > 24:
            warnings.append({
                "field": "non_compete_term_months",
                "message": "Non-compete term exceeding 24 months may be unenforceable"
            })
        
        if terms.liability_cap <= 0:
            errors.append({
                "field": "liability_cap",
                "message": "Liability cap must be greater than zero"
            })
        
        if terms.indemnification_cap < terms.liability_cap:
            warnings.append({
                "field": "indemnification_cap",
                "message": "Indemnification cap is lower than liability cap"
            })
        
        if not terms.insurance_requirements:
            warnings.append({
                "field": "insurance_requirements",
                "message": "Insurance requirements should be specified"
            })
        else:
            if terms.insurance_requirements.get('general_liability', 0) < 1000000:
                warnings.append({
                    "field": "insurance_requirements",
                    "message": "General liability insurance should be at least $1,000,000"
                })
        
        if not terms.dispute_resolution:
            errors.append({
                "field": "dispute_resolution",
                "message": "Dispute resolution mechanism must be specified"
            })
        
        if not terms.arbitration_venue:
            warnings.append({
                "field": "arbitration_venue",
                "message": "Arbitration venue should be specified"
            })
        
        return errors, warnings
    
    def _generate_validation_recommendations(
        self,
        errors: List[Dict[str, str]],
        warnings: List[Dict[str, str]],
        tier: DistributorTier
    ) -> List[str]:
        """Generate recommendations based on validation results"""
        
        recommendations = []
        
        if errors:
            recommendations.append(
                f"Address {len(errors)} validation error(s) before contract can be approved."
            )
        
        if warnings:
            recommendations.append(
                f"Review {len(warnings)} warning(s) to ensure contract terms are optimal."
            )
        
        compliance_errors = [e for e in errors if 'compliance' in e.get('field', '').lower()]
        if compliance_errors:
            recommendations.append(
                "Ensure all regional compliance requirements are addressed before distribution begins."
            )
        
        territory_errors = [e for e in errors if 'territory' in e.get('field', '').lower()]
        if territory_errors:
            recommendations.append(
                "Resolve territory conflicts with existing distributors before finalizing contract."
            )
        
        if tier in [DistributorTier.STRATEGIC, DistributorTier.GLOBAL_ELITE]:
            recommendations.append(
                "Consider executive review for strategic-tier contracts."
            )
        
        if not errors and not warnings:
            recommendations.append(
                "Contract validation passed. Ready for approval workflow."
            )
        
        return recommendations
    
    def validate_amendment(
        self,
        original_contract: DistributorContract,
        proposed_changes: Dict[str, Any]
    ) -> ContractValidationResult:
        """Validate proposed contract amendment"""
        
        errors = []
        warnings = []
        
        restricted_fields = ['contract_id', 'contract_number', 'distributor_id', 'created_at']
        for field in restricted_fields:
            if field in proposed_changes:
                errors.append({
                    "field": field,
                    "message": f"Field '{field}' cannot be amended"
                })
        
        if 'distributor_tier' in proposed_changes:
            new_tier = proposed_changes['distributor_tier']
            current_tier = original_contract.terms.distributor_tier
            
            tier_order = list(DistributorTier)
            current_index = tier_order.index(current_tier)
            new_index = tier_order.index(new_tier)
            
            if new_index < current_index:
                warnings.append({
                    "field": "distributor_tier",
                    "message": f"Tier downgrade from {current_tier.value} to {new_tier.value} requires approval"
                })
        
        if 'credit_limit' in proposed_changes:
            new_limit = proposed_changes['credit_limit']
            current_limit = original_contract.terms.credit_limit
            
            if new_limit > current_limit * self.MAXIMUM_CREDIT_LIMIT_MULTIPLIER:
                errors.append({
                    "field": "credit_limit",
                    "message": f"Credit limit increase exceeds maximum allowed ({self.MAXIMUM_CREDIT_LIMIT_MULTIPLIER}x)"
                })
        
        return ContractValidationResult(
            is_valid=len(errors) == 0,
            contract_id=original_contract.contract_id,
            validation_timestamp=datetime.utcnow().isoformat(),
            errors=errors,
            warnings=warnings,
            compliance_checks=[],
            territory_conflicts=[],
            pricing_issues=[],
            commitment_gaps=[],
            recommendations=[]
        )
    
    def validate_renewal(
        self,
        contract: DistributorContract,
        renewal_terms: Dict[str, Any]
    ) -> ContractValidationResult:
        """Validate contract renewal"""
        
        errors = []
        warnings = []
        
        if contract.status != ContractStatus.ACTIVE:
            errors.append({
                "field": "status",
                "message": f"Only active contracts can be renewed. Current status: {contract.status.value}"
            })
        
        expiration = datetime.fromisoformat(contract.terms.expiration_date)
        days_until_expiration = (expiration - datetime.utcnow()).days
        
        if days_until_expiration > 180:
            warnings.append({
                "field": "expiration_date",
                "message": f"Contract expires in {days_until_expiration} days. Early renewal may not be necessary."
            })
        
        if days_until_expiration < 0:
            errors.append({
                "field": "expiration_date",
                "message": "Contract has already expired. Consider new contract instead of renewal."
            })
        
        if 'price_adjustment_percentage' in renewal_terms:
            adjustment = renewal_terms['price_adjustment_percentage']
            if adjustment > 0.10:
                warnings.append({
                    "field": "price_adjustment_percentage",
                    "message": f"Price increase of {adjustment*100:.0f}% may require negotiation"
                })
        
        return ContractValidationResult(
            is_valid=len(errors) == 0,
            contract_id=contract.contract_id,
            validation_timestamp=datetime.utcnow().isoformat(),
            errors=errors,
            warnings=warnings,
            compliance_checks=[],
            territory_conflicts=[],
            pricing_issues=[],
            commitment_gaps=[],
            recommendations=[]
        )
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'validation_rules': {
                'min_contract_term': self.MINIMUM_CONTRACT_TERM_MONTHS,
                'max_contract_term': self.MAXIMUM_CONTRACT_TERM_MONTHS,
                'max_discount': self.MAXIMUM_DISCOUNT_PERCENTAGE,
                'min_commitment': self.MINIMUM_COMMITMENT_AMOUNT
            },
            'tiers_configured': len(self.TIER_MINIMUM_REQUIREMENTS),
            'regions_configured': len(self.REGION_REQUIRED_COMPLIANCE)
        }

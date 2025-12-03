"""
Channel Partner Contract Pack Schema Definitions
Global Distributor Edition (GDE)

Comprehensive dataclasses for global distributor contracts, territory management,
pricing structures, compliance requirements, and negotiation workflows.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class ContractType(str, Enum):
    """Types of distributor contracts"""
    MASTER_DISTRIBUTION = "master_distribution"
    REGIONAL_DISTRIBUTION = "regional_distribution"
    EXCLUSIVE_DISTRIBUTION = "exclusive_distribution"
    NON_EXCLUSIVE_DISTRIBUTION = "non_exclusive_distribution"
    VALUE_ADDED_DISTRIBUTION = "value_added_distribution"
    OEM_DISTRIBUTION = "oem_distribution"
    WHITE_LABEL = "white_label"
    GOVERNMENT_DISTRIBUTION = "government_distribution"


class ContractStatus(str, Enum):
    """Contract lifecycle status"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    IN_NEGOTIATION = "in_negotiation"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    EXPIRED = "expired"
    TERMINATED = "terminated"
    RENEWED = "renewed"


class DistributorTier(str, Enum):
    """Distributor tier levels"""
    AUTHORIZED = "authorized"
    PREFERRED = "preferred"
    PREMIER = "premier"
    STRATEGIC = "strategic"
    GLOBAL_ELITE = "global_elite"


class RegionCode(str, Enum):
    """Global region codes"""
    AMERICAS = "americas"
    EMEA = "emea"
    APAC = "apac"
    LATAM = "latam"
    MENA = "mena"
    ANZ = "anz"
    NORDICS = "nordics"
    DACH = "dach"
    BENELUX = "benelux"
    IBERIA = "iberia"
    CEE = "cee"
    CIS = "cis"
    ASEAN = "asean"
    GREATER_CHINA = "greater_china"
    INDIA_SUBCONTINENT = "india_subcontinent"
    JAPAN_KOREA = "japan_korea"
    AFRICA = "africa"
    GLOBAL = "global"


class CurrencyCode(str, Enum):
    """Supported currencies"""
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    CHF = "CHF"
    AUD = "AUD"
    CAD = "CAD"
    SGD = "SGD"
    HKD = "HKD"
    CNY = "CNY"
    INR = "INR"
    AED = "AED"
    BRL = "BRL"
    MXN = "MXN"
    ZAR = "ZAR"


class PaymentTerms(str, Enum):
    """Payment terms"""
    NET_15 = "net_15"
    NET_30 = "net_30"
    NET_45 = "net_45"
    NET_60 = "net_60"
    NET_90 = "net_90"
    PREPAID = "prepaid"
    MILESTONE = "milestone"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"


class NegotiationStatus(str, Enum):
    """Negotiation workflow status"""
    NOT_STARTED = "not_started"
    INITIAL_PROPOSAL = "initial_proposal"
    COUNTER_PROPOSAL = "counter_proposal"
    UNDER_REVIEW = "under_review"
    LEGAL_REVIEW = "legal_review"
    FINANCE_REVIEW = "finance_review"
    EXECUTIVE_REVIEW = "executive_review"
    FINAL_TERMS = "final_terms"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ComplianceLevel(str, Enum):
    """Compliance requirement levels"""
    STANDARD = "standard"
    ENHANCED = "enhanced"
    STRICT = "strict"
    GOVERNMENT = "government"
    FINANCIAL_SERVICES = "financial_services"
    HEALTHCARE = "healthcare"
    DEFENSE = "defense"


@dataclass
class TerritoryDefinition:
    """Geographic territory definition"""
    territory_id: str
    territory_name: str
    region_code: RegionCode
    countries: List[str]
    sub_regions: List[str] = field(default_factory=list)
    excluded_countries: List[str] = field(default_factory=list)
    is_exclusive: bool = False
    population_coverage: int = 0
    gdp_coverage_usd: float = 0.0
    market_potential_score: float = 0.0
    regulatory_complexity: str = "standard"
    local_requirements: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'territory_id': self.territory_id,
            'territory_name': self.territory_name,
            'region_code': self.region_code.value,
            'countries': self.countries,
            'sub_regions': self.sub_regions,
            'excluded_countries': self.excluded_countries,
            'is_exclusive': self.is_exclusive,
            'population_coverage': self.population_coverage,
            'gdp_coverage_usd': self.gdp_coverage_usd,
            'market_potential_score': self.market_potential_score,
            'regulatory_complexity': self.regulatory_complexity,
            'local_requirements': self.local_requirements
        }


@dataclass
class PricingTier:
    """Volume-based pricing tier"""
    tier_name: str
    min_volume: int
    max_volume: Optional[int]
    discount_percentage: float
    unit_price: float
    currency: CurrencyCode
    effective_date: str
    expiration_date: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'tier_name': self.tier_name,
            'min_volume': self.min_volume,
            'max_volume': self.max_volume,
            'discount_percentage': self.discount_percentage,
            'unit_price': self.unit_price,
            'currency': self.currency.value,
            'effective_date': self.effective_date,
            'expiration_date': self.expiration_date
        }


@dataclass
class ProductAuthorization:
    """Product authorization for distribution"""
    product_id: str
    product_name: str
    product_category: str
    sku: str
    list_price: float
    currency: CurrencyCode
    distributor_discount: float
    minimum_order_quantity: int
    authorized_territories: List[str]
    restrictions: List[str] = field(default_factory=list)
    certifications_required: List[str] = field(default_factory=list)
    support_tier: str = "standard"
    warranty_terms: str = "standard"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_category': self.product_category,
            'sku': self.sku,
            'list_price': self.list_price,
            'currency': self.currency.value,
            'distributor_discount': self.distributor_discount,
            'minimum_order_quantity': self.minimum_order_quantity,
            'authorized_territories': self.authorized_territories,
            'restrictions': self.restrictions,
            'certifications_required': self.certifications_required,
            'support_tier': self.support_tier,
            'warranty_terms': self.warranty_terms
        }


@dataclass
class CommitmentSchedule:
    """Annual commitment and performance schedule"""
    year: int
    minimum_revenue_commitment: float
    minimum_unit_commitment: int
    quarterly_targets: List[float]
    growth_target_percentage: float
    currency: CurrencyCode
    penalty_for_shortfall: float
    bonus_for_overachievement: float
    review_dates: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'year': self.year,
            'minimum_revenue_commitment': self.minimum_revenue_commitment,
            'minimum_unit_commitment': self.minimum_unit_commitment,
            'quarterly_targets': self.quarterly_targets,
            'growth_target_percentage': self.growth_target_percentage,
            'currency': self.currency.value,
            'penalty_for_shortfall': self.penalty_for_shortfall,
            'bonus_for_overachievement': self.bonus_for_overachievement,
            'review_dates': self.review_dates
        }


@dataclass
class RebateStructure:
    """Rebate and incentive structure"""
    rebate_id: str
    rebate_name: str
    rebate_type: str
    threshold_type: str
    thresholds: List[Dict[str, Any]]
    calculation_period: str
    payment_frequency: str
    maximum_rebate_percentage: float
    eligibility_criteria: List[str]
    exclusions: List[str]
    documentation_required: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'rebate_id': self.rebate_id,
            'rebate_name': self.rebate_name,
            'rebate_type': self.rebate_type,
            'threshold_type': self.threshold_type,
            'thresholds': self.thresholds,
            'calculation_period': self.calculation_period,
            'payment_frequency': self.payment_frequency,
            'maximum_rebate_percentage': self.maximum_rebate_percentage,
            'eligibility_criteria': self.eligibility_criteria,
            'exclusions': self.exclusions,
            'documentation_required': self.documentation_required
        }


@dataclass
class MarketDevelopmentFund:
    """Market Development Fund (MDF) allocation"""
    mdf_id: str
    fiscal_year: str
    total_allocation: float
    currency: CurrencyCode
    quarterly_allocation: List[float]
    eligible_activities: List[Dict[str, Any]]
    approval_process: str
    claim_deadline_days: int
    reimbursement_percentage: float
    documentation_requirements: List[str]
    pre_approval_required: bool
    co_branding_requirements: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'mdf_id': self.mdf_id,
            'fiscal_year': self.fiscal_year,
            'total_allocation': self.total_allocation,
            'currency': self.currency.value,
            'quarterly_allocation': self.quarterly_allocation,
            'eligible_activities': self.eligible_activities,
            'approval_process': self.approval_process,
            'claim_deadline_days': self.claim_deadline_days,
            'reimbursement_percentage': self.reimbursement_percentage,
            'documentation_requirements': self.documentation_requirements,
            'pre_approval_required': self.pre_approval_required,
            'co_branding_requirements': self.co_branding_requirements
        }


@dataclass
class ComplianceRequirement:
    """Compliance and regulatory requirement"""
    requirement_id: str
    requirement_name: str
    compliance_level: ComplianceLevel
    applicable_regions: List[RegionCode]
    regulatory_framework: str
    certification_required: bool
    certification_name: Optional[str]
    audit_frequency: str
    documentation_requirements: List[str]
    penalties_for_non_compliance: str
    remediation_timeline_days: int
    reporting_requirements: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'requirement_id': self.requirement_id,
            'requirement_name': self.requirement_name,
            'compliance_level': self.compliance_level.value,
            'applicable_regions': [r.value for r in self.applicable_regions],
            'regulatory_framework': self.regulatory_framework,
            'certification_required': self.certification_required,
            'certification_name': self.certification_name,
            'audit_frequency': self.audit_frequency,
            'documentation_requirements': self.documentation_requirements,
            'penalties_for_non_compliance': self.penalties_for_non_compliance,
            'remediation_timeline_days': self.remediation_timeline_days,
            'reporting_requirements': self.reporting_requirements
        }


@dataclass
class NegotiationTerm:
    """Individual negotiation term"""
    term_id: str
    term_category: str
    term_name: str
    original_value: Any
    proposed_value: Any
    final_value: Optional[Any]
    is_negotiable: bool
    minimum_acceptable: Optional[Any]
    maximum_acceptable: Optional[Any]
    justification: str
    counter_proposals: List[Dict[str, Any]] = field(default_factory=list)
    status: str = "pending"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'term_id': self.term_id,
            'term_category': self.term_category,
            'term_name': self.term_name,
            'original_value': self.original_value,
            'proposed_value': self.proposed_value,
            'final_value': self.final_value,
            'is_negotiable': self.is_negotiable,
            'minimum_acceptable': self.minimum_acceptable,
            'maximum_acceptable': self.maximum_acceptable,
            'justification': self.justification,
            'counter_proposals': self.counter_proposals,
            'status': self.status
        }


@dataclass
class NegotiationSession:
    """Negotiation session record"""
    session_id: str
    contract_id: str
    session_date: str
    participants: List[Dict[str, str]]
    agenda_items: List[str]
    terms_discussed: List[str]
    decisions_made: List[Dict[str, Any]]
    action_items: List[Dict[str, Any]]
    next_steps: List[str]
    session_notes: str
    attachments: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'session_id': self.session_id,
            'contract_id': self.contract_id,
            'session_date': self.session_date,
            'participants': self.participants,
            'agenda_items': self.agenda_items,
            'terms_discussed': self.terms_discussed,
            'decisions_made': self.decisions_made,
            'action_items': self.action_items,
            'next_steps': self.next_steps,
            'session_notes': self.session_notes,
            'attachments': self.attachments
        }


@dataclass
class ContractAmendment:
    """Contract amendment record"""
    amendment_id: str
    contract_id: str
    amendment_number: int
    amendment_date: str
    effective_date: str
    amendment_type: str
    sections_modified: List[str]
    original_terms: Dict[str, Any]
    amended_terms: Dict[str, Any]
    reason_for_amendment: str
    approved_by: List[Dict[str, str]]
    approval_date: str
    amendment_text: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'amendment_id': self.amendment_id,
            'contract_id': self.contract_id,
            'amendment_number': self.amendment_number,
            'amendment_date': self.amendment_date,
            'effective_date': self.effective_date,
            'amendment_type': self.amendment_type,
            'sections_modified': self.sections_modified,
            'original_terms': self.original_terms,
            'amended_terms': self.amended_terms,
            'reason_for_amendment': self.reason_for_amendment,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date,
            'amendment_text': self.amendment_text
        }


@dataclass
class RenewalTerms:
    """Contract renewal terms"""
    renewal_id: str
    contract_id: str
    original_term_end: str
    renewal_term_start: str
    renewal_term_end: str
    renewal_type: str
    auto_renewal: bool
    notice_period_days: int
    price_adjustment_percentage: float
    commitment_changes: Dict[str, Any]
    territory_changes: List[str]
    product_changes: List[str]
    new_terms: List[Dict[str, Any]]
    renewal_conditions: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'renewal_id': self.renewal_id,
            'contract_id': self.contract_id,
            'original_term_end': self.original_term_end,
            'renewal_term_start': self.renewal_term_start,
            'renewal_term_end': self.renewal_term_end,
            'renewal_type': self.renewal_type,
            'auto_renewal': self.auto_renewal,
            'notice_period_days': self.notice_period_days,
            'price_adjustment_percentage': self.price_adjustment_percentage,
            'commitment_changes': self.commitment_changes,
            'territory_changes': self.territory_changes,
            'product_changes': self.product_changes,
            'new_terms': self.new_terms,
            'renewal_conditions': self.renewal_conditions
        }


@dataclass
class DistributorProfile:
    """Distributor company profile"""
    distributor_id: str
    company_name: str
    legal_name: str
    registration_number: str
    tax_id: str
    headquarters_country: str
    headquarters_address: Dict[str, str]
    regional_offices: List[Dict[str, Any]]
    year_established: int
    employee_count: int
    annual_revenue: float
    revenue_currency: CurrencyCode
    credit_rating: str
    duns_number: Optional[str]
    industry_certifications: List[str]
    key_contacts: List[Dict[str, str]]
    banking_details: Dict[str, str]
    insurance_coverage: Dict[str, Any]
    existing_vendor_relationships: List[str]
    target_markets: List[str]
    sales_channels: List[str]
    technical_capabilities: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'distributor_id': self.distributor_id,
            'company_name': self.company_name,
            'legal_name': self.legal_name,
            'registration_number': self.registration_number,
            'tax_id': self.tax_id,
            'headquarters_country': self.headquarters_country,
            'headquarters_address': self.headquarters_address,
            'regional_offices': self.regional_offices,
            'year_established': self.year_established,
            'employee_count': self.employee_count,
            'annual_revenue': self.annual_revenue,
            'revenue_currency': self.revenue_currency.value,
            'credit_rating': self.credit_rating,
            'duns_number': self.duns_number,
            'industry_certifications': self.industry_certifications,
            'key_contacts': self.key_contacts,
            'banking_details': self.banking_details,
            'insurance_coverage': self.insurance_coverage,
            'existing_vendor_relationships': self.existing_vendor_relationships,
            'target_markets': self.target_markets,
            'sales_channels': self.sales_channels,
            'technical_capabilities': self.technical_capabilities
        }


@dataclass
class ContractTerms:
    """Complete contract terms and conditions"""
    term_id: str
    contract_type: ContractType
    distributor_tier: DistributorTier
    effective_date: str
    expiration_date: str
    initial_term_months: int
    renewal_term_months: int
    auto_renewal: bool
    notice_period_days: int
    payment_terms: PaymentTerms
    currency: CurrencyCode
    credit_limit: float
    territories: List[TerritoryDefinition]
    products: List[ProductAuthorization]
    pricing_tiers: List[PricingTier]
    commitments: List[CommitmentSchedule]
    rebates: List[RebateStructure]
    mdf: Optional[MarketDevelopmentFund]
    compliance_requirements: List[ComplianceRequirement]
    termination_clauses: List[str]
    dispute_resolution: str
    governing_law: str
    arbitration_venue: str
    confidentiality_term_years: int
    non_compete_term_months: int
    indemnification_cap: float
    liability_cap: float
    insurance_requirements: Dict[str, float]
    audit_rights: str
    force_majeure_clause: str
    assignment_restrictions: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'term_id': self.term_id,
            'contract_type': self.contract_type.value,
            'distributor_tier': self.distributor_tier.value,
            'effective_date': self.effective_date,
            'expiration_date': self.expiration_date,
            'initial_term_months': self.initial_term_months,
            'renewal_term_months': self.renewal_term_months,
            'auto_renewal': self.auto_renewal,
            'notice_period_days': self.notice_period_days,
            'payment_terms': self.payment_terms.value,
            'currency': self.currency.value,
            'credit_limit': self.credit_limit,
            'territories': [t.to_dict() for t in self.territories],
            'products': [p.to_dict() for p in self.products],
            'pricing_tiers': [pt.to_dict() for pt in self.pricing_tiers],
            'commitments': [c.to_dict() for c in self.commitments],
            'rebates': [r.to_dict() for r in self.rebates],
            'mdf': self.mdf.to_dict() if self.mdf else None,
            'compliance_requirements': [cr.to_dict() for cr in self.compliance_requirements],
            'termination_clauses': self.termination_clauses,
            'dispute_resolution': self.dispute_resolution,
            'governing_law': self.governing_law,
            'arbitration_venue': self.arbitration_venue,
            'confidentiality_term_years': self.confidentiality_term_years,
            'non_compete_term_months': self.non_compete_term_months,
            'indemnification_cap': self.indemnification_cap,
            'liability_cap': self.liability_cap,
            'insurance_requirements': self.insurance_requirements,
            'audit_rights': self.audit_rights,
            'force_majeure_clause': self.force_majeure_clause,
            'assignment_restrictions': self.assignment_restrictions
        }


@dataclass
class NegotiationWorkflow:
    """Complete negotiation workflow"""
    workflow_id: str
    contract_id: str
    status: NegotiationStatus
    started_at: str
    last_updated: str
    current_round: int
    max_rounds: int
    negotiable_terms: List[NegotiationTerm]
    sessions: List[NegotiationSession]
    stakeholders: List[Dict[str, str]]
    approval_chain: List[Dict[str, Any]]
    deadlines: Dict[str, str]
    escalation_path: List[Dict[str, str]]
    notes: List[Dict[str, str]]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'workflow_id': self.workflow_id,
            'contract_id': self.contract_id,
            'status': self.status.value,
            'started_at': self.started_at,
            'last_updated': self.last_updated,
            'current_round': self.current_round,
            'max_rounds': self.max_rounds,
            'negotiable_terms': [t.to_dict() for t in self.negotiable_terms],
            'sessions': [s.to_dict() for s in self.sessions],
            'stakeholders': self.stakeholders,
            'approval_chain': self.approval_chain,
            'deadlines': self.deadlines,
            'escalation_path': self.escalation_path,
            'notes': self.notes
        }


@dataclass
class DistributorContract:
    """Complete distributor contract package"""
    contract_id: str
    contract_number: str
    version: str
    status: ContractStatus
    created_at: str
    updated_at: str
    distributor: DistributorProfile
    terms: ContractTerms
    negotiation: Optional[NegotiationWorkflow]
    amendments: List[ContractAmendment]
    renewal_history: List[RenewalTerms]
    contract_document: str
    exhibits: List[Dict[str, str]]
    signatures: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'contract_id': self.contract_id,
            'contract_number': self.contract_number,
            'version': self.version,
            'status': self.status.value,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'distributor': self.distributor.to_dict(),
            'terms': self.terms.to_dict(),
            'negotiation': self.negotiation.to_dict() if self.negotiation else None,
            'amendments': [a.to_dict() for a in self.amendments],
            'renewal_history': [r.to_dict() for r in self.renewal_history],
            'contract_document': self.contract_document,
            'exhibits': self.exhibits,
            'signatures': self.signatures,
            'metadata': self.metadata
        }


@dataclass
class ContractSummary:
    """Contract summary for listings"""
    contract_id: str
    contract_number: str
    distributor_name: str
    contract_type: ContractType
    distributor_tier: DistributorTier
    status: ContractStatus
    territories: List[str]
    total_commitment: float
    currency: CurrencyCode
    effective_date: str
    expiration_date: str
    days_until_expiration: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'contract_id': self.contract_id,
            'contract_number': self.contract_number,
            'distributor_name': self.distributor_name,
            'contract_type': self.contract_type.value,
            'distributor_tier': self.distributor_tier.value,
            'status': self.status.value,
            'territories': self.territories,
            'total_commitment': self.total_commitment,
            'currency': self.currency.value,
            'effective_date': self.effective_date,
            'expiration_date': self.expiration_date,
            'days_until_expiration': self.days_until_expiration
        }


@dataclass
class ContractValidationResult:
    """Contract validation result"""
    is_valid: bool
    contract_id: str
    validation_timestamp: str
    errors: List[Dict[str, str]]
    warnings: List[Dict[str, str]]
    compliance_checks: List[Dict[str, Any]]
    territory_conflicts: List[Dict[str, Any]]
    pricing_issues: List[Dict[str, str]]
    commitment_gaps: List[Dict[str, str]]
    recommendations: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'is_valid': self.is_valid,
            'contract_id': self.contract_id,
            'validation_timestamp': self.validation_timestamp,
            'errors': self.errors,
            'warnings': self.warnings,
            'compliance_checks': self.compliance_checks,
            'territory_conflicts': self.territory_conflicts,
            'pricing_issues': self.pricing_issues,
            'commitment_gaps': self.commitment_gaps,
            'recommendations': self.recommendations
        }


@dataclass
class ContractAnalytics:
    """Contract analytics and metrics"""
    contract_id: str
    analysis_date: str
    total_contract_value: float
    annual_recurring_value: float
    currency: CurrencyCode
    territory_coverage_score: float
    commitment_achievement_rate: float
    rebate_utilization_rate: float
    mdf_utilization_rate: float
    compliance_score: float
    risk_score: float
    renewal_probability: float
    performance_trend: str
    key_metrics: Dict[str, Any]
    benchmarks: Dict[str, Any]
    recommendations: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'contract_id': self.contract_id,
            'analysis_date': self.analysis_date,
            'total_contract_value': self.total_contract_value,
            'annual_recurring_value': self.annual_recurring_value,
            'currency': self.currency.value,
            'territory_coverage_score': self.territory_coverage_score,
            'commitment_achievement_rate': self.commitment_achievement_rate,
            'rebate_utilization_rate': self.rebate_utilization_rate,
            'mdf_utilization_rate': self.mdf_utilization_rate,
            'compliance_score': self.compliance_score,
            'risk_score': self.risk_score,
            'renewal_probability': self.renewal_probability,
            'performance_trend': self.performance_trend,
            'key_metrics': self.key_metrics,
            'benchmarks': self.benchmarks,
            'recommendations': self.recommendations
        }

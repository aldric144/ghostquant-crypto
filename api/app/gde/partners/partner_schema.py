"""
GhostQuant Partner Program Schema
Dataclasses for partner program generation system
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum


class PartnerTierLevel(str, Enum):
    """Partner tier levels"""
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    ELITE = "elite"


class PartnerType(str, Enum):
    """Types of partners"""
    RESELLER = "reseller"
    VAR = "var"  # Value-Added Reseller
    MSP = "msp"  # Managed Service Provider
    SI = "si"    # Systems Integrator
    DISTRIBUTOR = "distributor"
    OEM = "oem"  # Original Equipment Manufacturer
    REFERRAL = "referral"


class CommissionType(str, Enum):
    """Commission calculation types"""
    PERCENTAGE = "percentage"
    FLAT_FEE = "flat_fee"
    TIERED = "tiered"
    HYBRID = "hybrid"


@dataclass
class PartnerTier:
    """Partner tier definition with requirements and benefits"""
    tier_level: PartnerTierLevel
    tier_name: str
    annual_revenue_requirement: float
    deal_count_requirement: int
    certification_requirements: List[str]
    benefits: List[str]
    commission_rate: float
    mdf_allocation: float
    support_level: str
    training_included: List[str]
    co_marketing_enabled: bool
    deal_registration_priority: int
    nfr_licenses: int  # Not-For-Resale licenses
    description: str


@dataclass
class CommissionModel:
    """Commission structure for partner deals"""
    commission_type: CommissionType
    base_rate: float
    tier_rates: Dict[PartnerTierLevel, float]
    new_business_rate: float
    renewal_rate: float
    deal_registration_bonus: float
    volume_bonuses: List[Dict[str, float]]
    mdf_percentage: float
    payout_terms: str
    minimum_deal_size: float
    maximum_commission_cap: Optional[float]
    spiff_programs: List[Dict[str, any]]


@dataclass
class ResellerAgreement:
    """Legal reseller agreement document"""
    agreement_id: str
    partner_name: str
    partner_type: PartnerType
    effective_date: str
    term_length_months: int
    territory: List[str]
    authorized_products: List[str]
    pricing_model: str
    payment_terms: str
    responsibilities: List[str]
    obligations: List[str]
    performance_requirements: Dict[str, any]
    confidentiality_terms: str
    data_protection_terms: str
    indemnification_clause: str
    termination_conditions: List[str]
    dispute_resolution: str
    governing_law: str
    insurance_requirements: Dict[str, str]
    compliance_requirements: List[str]
    audit_rights: str
    full_agreement_text: str


@dataclass
class ChannelPlaybook:
    """Complete channel partner playbook"""
    playbook_id: str
    partner_tier: PartnerTierLevel
    gtm_strategy: str
    target_markets: List[str]
    ideal_customer_profile: Dict[str, any]
    sales_process: List[Dict[str, str]]
    pipeline_management: str
    deal_registration_process: str
    co_selling_guidelines: str
    account_mapping_strategy: str
    competitive_positioning: Dict[str, str]
    pricing_guidelines: str
    discount_authority: Dict[str, float]
    escalation_procedures: List[Dict[str, str]]
    reporting_requirements: Dict[str, str]
    marketing_support: List[str]
    technical_support: str
    compliance_checklist: List[str]
    success_metrics: Dict[str, str]
    full_playbook_content: str


@dataclass
class OnboardingPackage:
    """Partner onboarding package with timeline and materials"""
    package_id: str
    partner_tier: PartnerTierLevel
    onboarding_timeline: str  # 30, 60, or 90 days
    phase_1_tasks: List[Dict[str, str]]
    phase_2_tasks: List[Dict[str, str]]
    phase_3_tasks: List[Dict[str, str]]
    training_modules: List[Dict[str, str]]
    certification_path: List[str]
    enablement_materials: List[str]
    portal_setup_guide: str
    branding_guidelines: str
    technical_setup: List[str]
    sales_tools: List[str]
    marketing_assets: List[str]
    support_contacts: Dict[str, str]
    success_checklist: List[str]
    full_onboarding_manual: str


@dataclass
class IncentiveStructure:
    """Partner incentive and MDF program"""
    program_name: str
    fiscal_year: str
    total_mdf_budget: float
    tier_allocations: Dict[PartnerTierLevel, float]
    eligible_activities: List[Dict[str, any]]
    claim_process: str
    approval_workflow: List[str]
    reimbursement_terms: str
    spiff_programs: List[Dict[str, any]]
    quarterly_bonuses: Dict[str, float]
    annual_rewards: List[str]
    performance_accelerators: List[Dict[str, any]]
    co_marketing_funds: float
    event_sponsorship_budget: float


@dataclass
class PartnerCertificationTrack:
    """Partner certification and training program"""
    track_id: str
    track_name: str
    partner_tier_required: PartnerTierLevel
    technical_certifications: List[Dict[str, str]]
    sales_certifications: List[Dict[str, str]]
    specialization_tracks: List[str]
    required_courses: List[Dict[str, str]]
    optional_courses: List[Dict[str, str]]
    hands_on_labs: List[str]
    exam_requirements: List[Dict[str, str]]
    recertification_period: str
    continuing_education: List[str]
    certification_benefits: List[str]


@dataclass
class PartnerPackage:
    """Complete partner program package"""
    package_id: str
    generated_at: str
    partner_name: str
    partner_type: PartnerType
    tier: PartnerTier
    program_overview: str
    commission_model: CommissionModel
    reseller_agreement: ResellerAgreement
    channel_playbook: ChannelPlaybook
    onboarding_package: OnboardingPackage
    incentive_structure: IncentiveStructure
    certification_track: PartnerCertificationTrack
    marketing_materials: List[str]
    legal_documents: List[str]
    support_documentation: List[str]
    summary: str
    metadata: Dict[str, any]

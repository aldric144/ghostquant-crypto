"""
Partner Program API Endpoints
FastAPI router for partner program generation system
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

from .partner_schema import PartnerType, PartnerTierLevel
from .partner_program_engine import PartnerProgramEngine
from .partner_storage import PartnerStorage

router = APIRouter(prefix="/partners")

engine = PartnerProgramEngine()
storage = PartnerStorage()


class GeneratePartnerProgramRequest(BaseModel):
    partner_name: str = Field(..., description="Partner company name")
    partner_type: PartnerType = Field(..., description="Type of partner")
    target_tier: PartnerTierLevel = Field(..., description="Target partner tier")
    territory: List[str] = Field(..., description="Geographic territories")
    target_revenue: float = Field(..., description="Target annual revenue")


class PartnerProgramResponse(BaseModel):
    package_id: str
    partner_name: str
    partner_type: str
    tier: str
    generated_at: str
    summary: str
    metadata: Dict[str, Any]


class TierResponse(BaseModel):
    tier_level: str
    tier_name: str
    annual_revenue_requirement: float
    commission_rate: float
    mdf_allocation: float
    benefits: List[str]


class CommissionResponse(BaseModel):
    base_rate: float
    tier_rates: Dict[str, float]
    new_business_rate: float
    renewal_rate: float
    deal_registration_bonus: float
    payout_terms: str


class AgreementResponse(BaseModel):
    agreement_id: str
    partner_name: str
    partner_type: str
    effective_date: str
    territory: List[str]
    term_length_months: int


class PlaybookResponse(BaseModel):
    playbook_id: str
    partner_tier: str
    gtm_strategy: str
    target_markets: List[str]
    sales_process: List[Dict[str, str]]


class OnboardingResponse(BaseModel):
    package_id: str
    partner_tier: str
    onboarding_timeline: str
    phase_1_tasks: List[Dict[str, str]]
    phase_2_tasks: List[Dict[str, str]]
    phase_3_tasks: List[Dict[str, str]]


class SummaryResponse(BaseModel):
    package_id: str
    partner_name: str
    tier: str
    summary: str
    key_benefits: List[str]



@router.post("/generate", response_model=PartnerProgramResponse)
async def generate_partner_program(request: GeneratePartnerProgramRequest):
    """
    Generate complete partner program package
    
    Creates a comprehensive partner program including:
    - Tier structure and requirements
    - Commission model and incentives
    - Reseller agreement
    - Channel playbook
    - Onboarding package
    - Certification track
    - Marketing materials
    """
    try:
        package = engine.generate_partner_program(
            partner_name=request.partner_name,
            partner_type=request.partner_type,
            target_tier=request.target_tier,
            territory=request.territory,
            target_revenue=request.target_revenue
        )
        
        storage.save_package(package)
        
        return PartnerProgramResponse(
            package_id=package.package_id,
            partner_name=package.partner_name,
            partner_type=package.partner_type.value,
            tier=package.tier.tier_level.value,
            generated_at=package.generated_at,
            summary=package.summary,
            metadata=package.metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating partner program: {str(e)}")


@router.get("/program/{package_id}", response_model=PartnerProgramResponse)
async def get_partner_program(package_id: str):
    """Get partner program package by ID"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    return PartnerProgramResponse(
        package_id=package.package_id,
        partner_name=package.partner_name,
        partner_type=package.partner_type.value,
        tier=package.tier.tier_level.value,
        generated_at=package.generated_at,
        summary=package.summary,
        metadata=package.metadata
    )


@router.get("/tiers/{package_id}", response_model=TierResponse)
async def get_tier_structure(package_id: str):
    """Get tier structure for partner program"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    tier = package.tier
    return TierResponse(
        tier_level=tier.tier_level.value,
        tier_name=tier.tier_name,
        annual_revenue_requirement=tier.annual_revenue_requirement,
        commission_rate=tier.commission_rate,
        mdf_allocation=tier.mdf_allocation,
        benefits=tier.benefits
    )


@router.get("/commissions/{package_id}", response_model=CommissionResponse)
async def get_commission_model(package_id: str):
    """Get commission model for partner program"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    commission = package.commission_model
    tier_rates_str = {k.value: v for k, v in commission.tier_rates.items()}
    
    return CommissionResponse(
        base_rate=commission.base_rate,
        tier_rates=tier_rates_str,
        new_business_rate=commission.new_business_rate,
        renewal_rate=commission.renewal_rate,
        deal_registration_bonus=commission.deal_registration_bonus,
        payout_terms=commission.payout_terms
    )


@router.get("/agreement/{package_id}", response_model=AgreementResponse)
async def get_reseller_agreement(package_id: str):
    """Get reseller agreement for partner program"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    agreement = package.reseller_agreement
    return AgreementResponse(
        agreement_id=agreement.agreement_id,
        partner_name=agreement.partner_name,
        partner_type=agreement.partner_type.value,
        effective_date=agreement.effective_date,
        territory=agreement.territory,
        term_length_months=agreement.term_length_months
    )


@router.get("/playbook/{package_id}", response_model=PlaybookResponse)
async def get_channel_playbook(package_id: str):
    """Get channel playbook for partner program"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    playbook = package.channel_playbook
    return PlaybookResponse(
        playbook_id=playbook.playbook_id,
        partner_tier=playbook.partner_tier.value,
        gtm_strategy=playbook.gtm_strategy,
        target_markets=playbook.target_markets,
        sales_process=playbook.sales_process
    )


@router.get("/onboarding/{package_id}", response_model=OnboardingResponse)
async def get_onboarding_package(package_id: str):
    """Get onboarding package for partner program"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    onboarding = package.onboarding_package
    return OnboardingResponse(
        package_id=onboarding.package_id,
        partner_tier=onboarding.partner_tier.value,
        onboarding_timeline=onboarding.onboarding_timeline,
        phase_1_tasks=onboarding.phase_1_tasks,
        phase_2_tasks=onboarding.phase_2_tasks,
        phase_3_tasks=onboarding.phase_3_tasks
    )


@router.get("/summary/{package_id}", response_model=SummaryResponse)
async def get_program_summary(package_id: str):
    """Get executive summary of partner program"""
    package = storage.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Partner program not found")
    
    key_benefits = [
        f"Commission rate: {package.tier.commission_rate:.1%}",
        f"MDF allocation: ${package.tier.mdf_allocation:,.0f}",
        f"Support level: {package.tier.support_level}",
        f"NFR licenses: {package.tier.nfr_licenses}"
    ]
    
    return SummaryResponse(
        package_id=package.package_id,
        partner_name=package.partner_name,
        tier=package.tier.tier_level.value,
        summary=package.summary,
        key_benefits=key_benefits
    )


@router.get("/list", response_model=List[PartnerProgramResponse])
async def list_partner_programs(
    partner_name: Optional[str] = Query(None, description="Filter by partner name")
):
    """List all partner programs"""
    packages = storage.list_packages(partner_name=partner_name)
    
    return [
        PartnerProgramResponse(
            package_id=p.package_id,
            partner_name=p.partner_name,
            partner_type=p.partner_type.value,
            tier=p.tier.tier_level.value,
            generated_at=p.generated_at,
            summary=p.summary,
            metadata=p.metadata
        )
        for p in packages
    ]


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    engine_health = engine.health()
    storage_stats = storage.get_stats()
    
    return {
        "status": "healthy",
        "engine": engine_health,
        "storage": storage_stats,
        "timestamp": storage.history[-1]["timestamp"] if storage.history else None
    }

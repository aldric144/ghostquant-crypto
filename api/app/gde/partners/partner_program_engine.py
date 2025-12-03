"""
Partner Program Engine
Core engine for generating partner programs, agreements, and packages
"""

from dataclasses import asdict
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from .partner_schema import (
    PartnerTier, PartnerTierLevel, PartnerType, CommissionModel, CommissionType,
    ResellerAgreement, ChannelPlaybook, OnboardingPackage, IncentiveStructure,
    PartnerCertificationTrack, PartnerPackage
)
from .partner_templates import get_all_partner_templates
from .commission_engine import CommissionEngine


class PartnerProgramEngine:
    """Core engine for building and managing partner programs"""
    
    def __init__(self):
        self.templates = get_all_partner_templates()
        self.history: List[Dict[str, Any]] = []
    
    def generate_partner_program(self, 
                                 partner_name: str,
                                 partner_type: PartnerType,
                                 target_tier: PartnerTierLevel,
                                 territory: List[str],
                                 target_revenue: float) -> PartnerPackage:
        """Generate complete partner program package"""
        
        package_id = f"partner-{uuid.uuid4().hex[:12]}"
        generated_at = datetime.utcnow().isoformat()
        
        tier = self.generate_tier_structure(target_tier)
        
        commission_model = self.generate_commission_model(target_tier)
        
        reseller_agreement = self.generate_reseller_agreement(
            partner_name, partner_type, territory
        )
        
        channel_playbook = self.generate_channel_playbook(target_tier)
        
        onboarding_package = self.generate_onboarding_package(target_tier)
        
        incentive_structure = self._generate_incentive_structure(target_tier)
        
        certification_track = self.generate_certification_track(target_tier)
        
        program_overview = self.templates.get("partner_program_overview", "")
        
        summary = self.generate_summary(partner_name, target_tier, target_revenue)
        
        marketing_materials = self.generate_marketing_docs(target_tier)
        
        legal_documents = [
            "Reseller Agreement",
            "Partner Code of Conduct",
            "Data Protection Agreement",
            "Confidentiality Agreement"
        ]
        
        support_documentation = [
            "Partner Portal Guide",
            "Deal Registration Guide",
            "Support Escalation Procedures",
            "Technical Documentation"
        ]
        
        package = PartnerPackage(
            package_id=package_id,
            generated_at=generated_at,
            partner_name=partner_name,
            partner_type=partner_type,
            tier=tier,
            program_overview=program_overview,
            commission_model=commission_model,
            reseller_agreement=reseller_agreement,
            channel_playbook=channel_playbook,
            onboarding_package=onboarding_package,
            incentive_structure=incentive_structure,
            certification_track=certification_track,
            marketing_materials=marketing_materials,
            legal_documents=legal_documents,
            support_documentation=support_documentation,
            summary=summary,
            metadata={
                "target_revenue": target_revenue,
                "territory": territory,
                "generated_by": "PartnerProgramEngine",
                "version": "1.0"
            }
        )
        
        self._log_history("generate_partner_program", {
            "package_id": package_id,
            "partner_name": partner_name,
            "tier": target_tier.value
        })
        
        return package
    
    def generate_tier_structure(self, tier_level: PartnerTierLevel) -> PartnerTier:
        """Generate tier structure with requirements and benefits"""
        
        tier_configs = {
            PartnerTierLevel.BRONZE: {
                "tier_name": "Bronze Partner",
                "annual_revenue_requirement": 50_000.0,
                "deal_count_requirement": 2,
                "certification_requirements": ["Sales Fundamentals"],
                "benefits": [
                    "Standard partner margins (15-20%)",
                    "Partner portal access",
                    "Sales enablement toolkit",
                    "Technical documentation",
                    "Standard support (business hours)",
                    "Deal registration access",
                    "Co-brandable marketing collateral"
                ],
                "commission_rate": 0.175,
                "mdf_allocation": 0.0,
                "support_level": "Standard",
                "training_included": ["Sales Fundamentals", "Product Overview"],
                "co_marketing_enabled": False,
                "deal_registration_priority": 3,
                "nfr_licenses": 2,
                "description": "Entry-level tier for new partners building their GhostQuant practice"
            },
            PartnerTierLevel.SILVER: {
                "tier_name": "Silver Partner",
                "annual_revenue_requirement": 150_000.0,
                "deal_count_requirement": 5,
                "certification_requirements": ["Sales Fundamentals", "Technical Fundamentals"],
                "benefits": [
                    "Enhanced partner margins (20-25%)",
                    "Marketing Development Funds ($10K annually)",
                    "Priority support (extended hours)",
                    "Dedicated partner success manager (shared)",
                    "Advanced sales training",
                    "Technical enablement workshops",
                    "Co-marketing opportunities",
                    "Early access to product updates"
                ],
                "commission_rate": 0.225,
                "mdf_allocation": 10_000.0,
                "support_level": "Priority",
                "training_included": ["Sales Fundamentals", "Technical Fundamentals", "Advanced Sales"],
                "co_marketing_enabled": True,
                "deal_registration_priority": 2,
                "nfr_licenses": 5,
                "description": "Established partners with proven GhostQuant sales and delivery capabilities"
            },
            PartnerTierLevel.GOLD: {
                "tier_name": "Gold Partner",
                "annual_revenue_requirement": 500_000.0,
                "deal_count_requirement": 15,
                "certification_requirements": [
                    "Sales Fundamentals", "Technical Fundamentals",
                    "Advanced Technical", "Specialization Track"
                ],
                "benefits": [
                    "Premium partner margins (25-30%)",
                    "Marketing Development Funds ($50K annually)",
                    "Premium support (24/7 coverage)",
                    "Dedicated partner success manager (1:1)",
                    "Dedicated technical account manager (shared)",
                    "Advanced deal support",
                    "Joint go-to-market planning",
                    "Product roadmap input"
                ],
                "commission_rate": 0.275,
                "mdf_allocation": 50_000.0,
                "support_level": "Premium",
                "training_included": [
                    "All Silver training", "Advanced Technical",
                    "Specialization Tracks", "Executive Briefings"
                ],
                "co_marketing_enabled": True,
                "deal_registration_priority": 1,
                "nfr_licenses": 10,
                "description": "Advanced partners with significant GhostQuant revenue and market presence"
            },
            PartnerTierLevel.PLATINUM: {
                "tier_name": "Platinum Partner",
                "annual_revenue_requirement": 2_000_000.0,
                "deal_count_requirement": 40,
                "certification_requirements": [
                    "All certifications", "Multiple specialization tracks"
                ],
                "benefits": [
                    "Maximum partner margins (30-35%)",
                    "Marketing Development Funds ($200K annually)",
                    "White-glove support (24/7, 2-hour response)",
                    "Dedicated partner success manager (1:1)",
                    "Dedicated technical account manager (1:1)",
                    "Dedicated sales engineer support",
                    "Strategic business planning",
                    "Product roadmap collaboration"
                ],
                "commission_rate": 0.325,
                "mdf_allocation": 200_000.0,
                "support_level": "White-Glove",
                "training_included": [
                    "All Gold training", "Custom training programs",
                    "Executive enablement", "Strategic planning sessions"
                ],
                "co_marketing_enabled": True,
                "deal_registration_priority": 0,
                "nfr_licenses": 25,
                "description": "Elite partners serving as strategic market leaders"
            },
            PartnerTierLevel.ELITE: {
                "tier_name": "Elite Partner",
                "annual_revenue_requirement": 5_000_000.0,
                "deal_count_requirement": 100,
                "certification_requirements": ["Invitation only - exceptional performance"],
                "benefits": [
                    "Custom margin structures",
                    "Unlimited Marketing Development Funds",
                    "Custom support model with embedded resources",
                    "Dedicated executive sponsor (C-level)",
                    "Joint business planning and investment",
                    "Product roadmap influence and co-development",
                    "Strategic co-marketing and branding",
                    "Board-level engagement opportunities"
                ],
                "commission_rate": 0.35,
                "mdf_allocation": 0.0,  # Unlimited
                "support_level": "Custom",
                "training_included": ["Fully customized training and enablement programs"],
                "co_marketing_enabled": True,
                "deal_registration_priority": 0,
                "nfr_licenses": 0,  # Unlimited
                "description": "Strategic partners with global reach and transformational impact"
            }
        }
        
        config = tier_configs.get(tier_level, tier_configs[PartnerTierLevel.BRONZE])
        
        return PartnerTier(
            tier_level=tier_level,
            **config
        )
    
    def generate_commission_model(self, tier_level: PartnerTierLevel) -> CommissionModel:
        """Generate commission model for tier"""
        
        tier_rates = {
            PartnerTierLevel.BRONZE: 0.175,
            PartnerTierLevel.SILVER: 0.225,
            PartnerTierLevel.GOLD: 0.275,
            PartnerTierLevel.PLATINUM: 0.325,
            PartnerTierLevel.ELITE: 0.35
        }
        
        base_rate = tier_rates.get(tier_level, 0.175)
        
        volume_bonuses = [
            {"threshold": 250_000.0, "bonus": 0.01, "description": "$250K+ quarterly revenue"},
            {"threshold": 500_000.0, "bonus": 0.02, "description": "$500K+ quarterly revenue"},
            {"threshold": 1_000_000.0, "bonus": 0.03, "description": "$1M+ quarterly revenue"}
        ]
        
        spiff_programs = [
            {
                "name": "New Product Launch SPIFF",
                "reward": 5_000.0,
                "description": "Bonus for first 10 deals of new product"
            },
            {
                "name": "Competitive Displacement SPIFF",
                "reward": 10_000.0,
                "description": "Bonus for displacing competitor"
            },
            {
                "name": "Strategic Account SPIFF",
                "reward": 25_000.0,
                "description": "Bonus for Fortune-500 wins"
            }
        ]
        
        return CommissionModel(
            commission_type=CommissionType.TIERED,
            base_rate=base_rate,
            tier_rates=tier_rates,
            new_business_rate=0.03,
            renewal_rate=0.02,
            deal_registration_bonus=0.025,
            volume_bonuses=volume_bonuses,
            mdf_percentage=0.05,
            payout_terms="Net 30 days after customer payment receipt",
            minimum_deal_size=10_000.0,
            maximum_commission_cap=None,
            spiff_programs=spiff_programs
        )
    
    def generate_reseller_agreement(self,
                                   partner_name: str,
                                   partner_type: PartnerType,
                                   territory: List[str]) -> ResellerAgreement:
        """Generate reseller agreement"""
        
        agreement_id = f"RA-{uuid.uuid4().hex[:8].upper()}"
        
        full_agreement_text = self.templates.get("reseller_agreement", "")
        
        return ResellerAgreement(
            agreement_id=agreement_id,
            partner_name=partner_name,
            partner_type=partner_type,
            effective_date=datetime.utcnow().strftime("%Y-%m-%d"),
            term_length_months=12,
            territory=territory,
            authorized_products=["GhostQuant Platform", "Professional Services", "Training"],
            pricing_model="Tiered discount based on partner tier",
            payment_terms="Net 30 days",
            responsibilities=[
                "Market and promote Authorized Products",
                "Provide first-level customer support",
                "Maintain required certifications",
                "Comply with all applicable laws and regulations",
                "Protect GhostQuant intellectual property"
            ],
            obligations=[
                "Use commercially reasonable efforts to sell Products",
                "Maintain professional sales organization",
                "Complete required training and certification",
                "Provide quarterly sales reports",
                "Conduct business ethically"
            ],
            performance_requirements={
                "minimum_annual_revenue": 50_000.0,
                "minimum_certifications": 1,
                "customer_satisfaction_score": 4.0
            },
            confidentiality_terms="Standard confidentiality obligations for 5 years",
            data_protection_terms="Comply with GDPR, CCPA, and applicable data protection laws",
            indemnification_clause="Mutual indemnification for breaches and third-party claims",
            termination_conditions=[
                "Material breach with 30-day cure period",
                "Insolvency or bankruptcy",
                "Cessation of business operations",
                "90-day notice for convenience"
            ],
            dispute_resolution="Binding arbitration in Wilmington, Delaware under AAA rules",
            governing_law="State of Delaware",
            insurance_requirements={
                "general_liability": "$2,000,000",
                "professional_liability": "$1,000,000",
                "cyber_liability": "$1,000,000"
            },
            compliance_requirements=[
                "Export control compliance",
                "Anti-corruption compliance",
                "Sanctions compliance",
                "Data protection compliance"
            ],
            audit_rights="GhostQuant may audit compliance upon reasonable notice",
            full_agreement_text=full_agreement_text
        )
    
    def generate_channel_playbook(self, tier_level: PartnerTierLevel) -> ChannelPlaybook:
        """Generate channel playbook"""
        
        playbook_id = f"playbook-{uuid.uuid4().hex[:8]}"
        
        full_playbook_content = self.templates.get("channel_playbook", "")
        
        return ChannelPlaybook(
            playbook_id=playbook_id,
            partner_tier=tier_level,
            gtm_strategy="Target financial services, government, and enterprise customers with cryptocurrency exposure",
            target_markets=["Financial Services", "Government", "Law Enforcement", "Enterprise"],
            ideal_customer_profile={
                "verticals": ["Banking", "Exchanges", "Government", "Fortune-500"],
                "size": "Mid-market to Enterprise",
                "pain_points": ["Regulatory compliance", "Financial crime risk", "Cryptocurrency exposure"],
                "budget": "$100K-$5M+ annually"
            },
            sales_process=[
                {"stage": "Prospecting", "activities": "Identify and qualify opportunities", "duration": "1-2 weeks"},
                {"stage": "Discovery", "activities": "Understand requirements and pain points", "duration": "2-4 weeks"},
                {"stage": "Solution Design", "activities": "Design tailored solution and proposal", "duration": "2-3 weeks"},
                {"stage": "Demonstration", "activities": "Product demo and proof-of-concept", "duration": "2-4 weeks"},
                {"stage": "Negotiation", "activities": "Finalize terms and close deal", "duration": "2-6 weeks"},
                {"stage": "Implementation", "activities": "Deploy and enable customer", "duration": "4-12 weeks"}
            ],
            pipeline_management="Maintain 3x pipeline coverage, weekly pipeline reviews",
            deal_registration_process="Register opportunities before customer engagement through partner portal",
            co_selling_guidelines="Engage GhostQuant sales engineers for technical validation and executive engagement",
            account_mapping_strategy="Map customer stakeholders, identify champions, build consensus",
            competitive_positioning={
                "vs_blockchain_analytics": "Comprehensive intelligence fusion beyond blockchain data",
                "vs_traditional_aml": "Purpose-built for cryptocurrency, not adapted from legacy",
                "vs_point_solutions": "Complete platform vs. fragmented tools"
            },
            pricing_guidelines="Target 20-40% discount off list price based on deal size and strategic value",
            discount_authority={
                "bronze": 0.20,
                "silver": 0.30,
                "gold": 0.35,
                "platinum": 0.40
            },
            escalation_procedures=[
                {"level": "L1", "contact": "Partner Success Manager", "response_time": "4 hours"},
                {"level": "L2", "contact": "Technical Account Manager", "response_time": "2 hours"},
                {"level": "L3", "contact": "VP of Partners", "response_time": "1 hour"}
            ],
            reporting_requirements={
                "frequency": "Quarterly",
                "content": "Pipeline, closed deals, customer health, market intelligence"
            },
            marketing_support=[
                "Co-branded collateral",
                "Joint webinars",
                "Event sponsorships",
                "Lead generation campaigns",
                "Social media support"
            ],
            technical_support="24/7 technical support for Platinum/Elite, business hours for Bronze/Silver",
            compliance_checklist=[
                "Export control screening",
                "Anti-corruption compliance",
                "Data protection compliance",
                "Contract compliance"
            ],
            success_metrics={
                "pipeline_coverage": "3x",
                "win_rate": "30%+",
                "average_deal_size": "$250K+",
                "customer_satisfaction": "4.5+"
            },
            full_playbook_content=full_playbook_content
        )
    
    def generate_onboarding_package(self, tier_level: PartnerTierLevel) -> OnboardingPackage:
        """Generate onboarding package"""
        
        package_id = f"onboard-{uuid.uuid4().hex[:8]}"
        
        return OnboardingPackage(
            package_id=package_id,
            partner_tier=tier_level,
            onboarding_timeline="60 days",
            phase_1_tasks=[
                {"task": "Execute partner agreement", "owner": "Legal", "duration": "Week 1"},
                {"task": "Complete partner profile", "owner": "Partner", "duration": "Week 1"},
                {"task": "Portal access setup", "owner": "Partner Ops", "duration": "Week 1"},
                {"task": "Kickoff meeting", "owner": "Partner Success", "duration": "Week 2"}
            ],
            phase_2_tasks=[
                {"task": "Sales certification", "owner": "Partner", "duration": "Weeks 3-4"},
                {"task": "Technical certification", "owner": "Partner", "duration": "Weeks 3-4"},
                {"task": "Demo environment setup", "owner": "Partner Ops", "duration": "Week 3"},
                {"task": "First customer meeting", "owner": "Partner", "duration": "Week 4"}
            ],
            phase_3_tasks=[
                {"task": "First deal registration", "owner": "Partner", "duration": "Weeks 5-6"},
                {"task": "Co-marketing plan", "owner": "Marketing", "duration": "Weeks 5-6"},
                {"task": "Quarterly business review", "owner": "Partner Success", "duration": "Week 8"},
                {"task": "First deal close", "owner": "Partner", "duration": "Weeks 6-8"}
            ],
            training_modules=[
                {"module": "GhostQuant Platform Overview", "duration": "2 hours", "format": "Online"},
                {"module": "Sales Fundamentals", "duration": "4 hours", "format": "Virtual instructor-led"},
                {"module": "Technical Fundamentals", "duration": "8 hours", "format": "Hands-on lab"},
                {"module": "Competitive Positioning", "duration": "2 hours", "format": "Online"}
            ],
            certification_path=[
                "Sales Fundamentals Certification",
                "Technical Fundamentals Certification",
                "Advanced Technical Certification (optional)",
                "Specialization Track (optional)"
            ],
            enablement_materials=[
                "Sales playbook",
                "Pitch decks",
                "Demo scripts",
                "Competitive battle cards",
                "Case studies",
                "ROI calculator"
            ],
            portal_setup_guide="Complete partner portal setup guide with screenshots and videos",
            branding_guidelines="GhostQuant brand guidelines including logo usage, colors, and messaging",
            technical_setup=[
                "Demo environment provisioning",
                "API access and credentials",
                "Sandbox environment",
                "Technical documentation access"
            ],
            sales_tools=[
                "CRM integration",
                "Deal registration system",
                "Quote generation tool",
                "Proposal templates"
            ],
            marketing_assets=[
                "Co-brandable datasheets",
                "Email templates",
                "Social media content",
                "Webinar templates"
            ],
            support_contacts={
                "partner_success_manager": "assigned during onboarding",
                "technical_support": "support@ghostquant.com",
                "sales_engineering": "se@ghostquant.com",
                "partner_operations": "partnerops@ghostquant.com"
            },
            success_checklist=[
                "Partner agreement executed",
                "Portal access configured",
                "Sales certification completed",
                "Technical certification completed",
                "First deal registered",
                "First customer meeting conducted",
                "Co-marketing plan established"
            ],
            full_onboarding_manual="Complete 30-60 day onboarding manual with detailed tasks, timelines, and resources"
        )
    
    def _generate_incentive_structure(self, tier_level: PartnerTierLevel) -> IncentiveStructure:
        """Generate incentive structure"""
        
        tier_allocations = {
            PartnerTierLevel.BRONZE: 0.0,
            PartnerTierLevel.SILVER: 10_000.0,
            PartnerTierLevel.GOLD: 50_000.0,
            PartnerTierLevel.PLATINUM: 200_000.0,
            PartnerTierLevel.ELITE: 0.0  # Unlimited
        }
        
        return IncentiveStructure(
            program_name="GhostQuant Partner Incentive Program FY2025",
            fiscal_year="2025",
            total_mdf_budget=5_000_000.0,
            tier_allocations=tier_allocations,
            eligible_activities=[
                {"activity": "Events and trade shows", "reimbursement_rate": 0.50},
                {"activity": "Webinars", "reimbursement_rate": 0.75},
                {"activity": "Content creation", "reimbursement_rate": 0.75},
                {"activity": "Digital marketing", "reimbursement_rate": 0.50},
                {"activity": "Proof-of-concept", "reimbursement_rate": 1.00}
            ],
            claim_process="Submit MDF request through partner portal with activity details and budget",
            approval_workflow=["Partner Success Manager review", "Marketing approval", "Finance approval"],
            reimbursement_terms="Reimbursement within 30 days of proof of execution",
            spiff_programs=[
                {"name": "Q1 New Product SPIFF", "reward": 5_000.0, "criteria": "First 10 deals"},
                {"name": "Competitive Displacement", "reward": 10_000.0, "criteria": "Displace competitor"},
                {"name": "Strategic Account", "reward": 25_000.0, "criteria": "Fortune-500 win"}
            ],
            quarterly_bonuses={
                "Q1": 25_000.0,
                "Q2": 25_000.0,
                "Q3": 25_000.0,
                "Q4": 50_000.0
            },
            annual_rewards=[
                "President's Club trip for top performers",
                "Annual partner awards",
                "Executive recognition"
            ],
            performance_accelerators=[
                {"metric": "25% YoY growth", "reward": 10_000.0},
                {"metric": "50% YoY growth", "reward": 25_000.0},
                {"metric": "100% YoY growth", "reward": 75_000.0}
            ],
            co_marketing_funds=1_000_000.0,
            event_sponsorship_budget=500_000.0
        )
    
    def generate_certification_track(self, tier_level: PartnerTierLevel) -> PartnerCertificationTrack:
        """Generate certification track"""
        
        track_id = f"cert-{uuid.uuid4().hex[:8]}"
        
        return PartnerCertificationTrack(
            track_id=track_id,
            track_name=f"GhostQuant {tier_level.value.title()} Certification Track",
            partner_tier_required=tier_level,
            technical_certifications=[
                {"name": "Technical Fundamentals", "duration": "8 hours", "exam": "Yes"},
                {"name": "Advanced Technical", "duration": "16 hours", "exam": "Yes"},
                {"name": "Integration Specialist", "duration": "12 hours", "exam": "Yes"}
            ],
            sales_certifications=[
                {"name": "Sales Fundamentals", "duration": "4 hours", "exam": "Yes"},
                {"name": "Advanced Sales", "duration": "8 hours", "exam": "Yes"},
                {"name": "Executive Selling", "duration": "4 hours", "exam": "No"}
            ],
            specialization_tracks=[
                "Financial Services Specialization",
                "Government Specialization",
                "Enterprise Specialization"
            ],
            required_courses=[
                {"course": "GhostQuant Platform Overview", "duration": "2 hours", "format": "Online"},
                {"course": "Sales Fundamentals", "duration": "4 hours", "format": "VILT"},
                {"course": "Technical Fundamentals", "duration": "8 hours", "format": "Hands-on"}
            ],
            optional_courses=[
                {"course": "Advanced Technical", "duration": "16 hours", "format": "Hands-on"},
                {"course": "Specialization Tracks", "duration": "8 hours", "format": "VILT"}
            ],
            hands_on_labs=[
                "Platform deployment lab",
                "Integration lab",
                "Investigation workflow lab",
                "API development lab"
            ],
            exam_requirements=[
                {"exam": "Sales Fundamentals", "passing_score": 80, "duration": "60 minutes"},
                {"exam": "Technical Fundamentals", "passing_score": 85, "duration": "90 minutes"}
            ],
            recertification_period="Annual recertification required",
            continuing_education=[
                "Quarterly product update webinars",
                "Annual partner summit",
                "Monthly technical office hours"
            ],
            certification_benefits=[
                "Digital badge and certificate",
                "Listed in partner directory",
                "Access to advanced resources",
                "Certification bonuses"
            ]
        )
    
    def generate_marketing_docs(self, tier_level: PartnerTierLevel) -> List[str]:
        """Generate list of marketing materials"""
        
        base_materials = [
            "Partner pitch deck",
            "Solution overview datasheet",
            "Competitive comparison",
            "Customer case studies",
            "ROI calculator",
            "Email templates",
            "Social media content"
        ]
        
        if tier_level in [PartnerTierLevel.GOLD, PartnerTierLevel.PLATINUM, PartnerTierLevel.ELITE]:
            base_materials.extend([
                "Custom co-branded materials",
                "Executive briefing decks",
                "Industry-specific content",
                "Webinar templates"
            ])
        
        return base_materials
    
    def generate_partner_portal_brief(self) -> str:
        """Generate partner portal overview"""
        return """
        GhostQuant Partner Portal provides comprehensive access to:
        - Training and certification programs
        - Deal registration system
        - Marketing resources and MDF management
        - Technical documentation and sandbox environments
        - Support ticket system
        - Performance dashboards and reporting
        - Commission statements and payment history
        """
    
    def build_partner_package(self, package: PartnerPackage) -> Dict[str, Any]:
        """Build complete partner package for export"""
        return asdict(package)
    
    def generate_summary(self, partner_name: str, tier_level: PartnerTierLevel, target_revenue: float) -> str:
        """Generate executive summary"""
        return f"""
        Partner Program Summary for {partner_name}
        
        Tier: {tier_level.value.title()}
        Target Annual Revenue: ${target_revenue:,.0f}
        
        This comprehensive partner program package includes:
        - Complete tier structure with requirements and benefits
        - Tiered commission model with bonuses and incentives
        - Reseller agreement with legal terms and conditions
        - Channel playbook with go-to-market strategy
        - 60-day onboarding program with training and certification
        - Marketing development funds and co-marketing support
        - Dedicated partner success and technical resources
        
        The GhostQuant Partner Program provides partners with the tools, training,
        support, and economic incentives needed to build thriving practices around
        GhostQuant cryptocurrency threat intelligence solutions.
        """
    
    def compute_partner_score(self, revenue: float, deals: int, certifications: int) -> float:
        """Compute partner performance score"""
        revenue_score = min(revenue / 1_000_000.0, 1.0) * 40
        deals_score = min(deals / 50.0, 1.0) * 40
        cert_score = min(certifications / 5.0, 1.0) * 20
        return round(revenue_score + deals_score + cert_score, 2)
    
    def classify_partner_tier(self, revenue: float, deals: int, certifications: int) -> PartnerTierLevel:
        """Classify partner into appropriate tier"""
        if revenue >= 5_000_000 and deals >= 100:
            return PartnerTierLevel.ELITE
        elif revenue >= 2_000_000 and deals >= 40 and certifications >= 4:
            return PartnerTierLevel.PLATINUM
        elif revenue >= 500_000 and deals >= 15 and certifications >= 3:
            return PartnerTierLevel.GOLD
        elif revenue >= 150_000 and deals >= 5 and certifications >= 2:
            return PartnerTierLevel.SILVER
        else:
            return PartnerTierLevel.BRONZE
    
    def attach_legal_documents(self, package: PartnerPackage) -> PartnerPackage:
        """Attach additional legal documents to package"""
        package.legal_documents.extend([
            "Partner Code of Conduct",
            "Export Control Compliance",
            "Anti-Corruption Policy"
        ])
        return package
    
    def _log_history(self, operation: str, details: Dict[str, Any]):
        """Log operation to history"""
        self.history.append({
            "timestamp": datetime.utcnow().isoformat(),
            "operation": operation,
            "details": details
        })
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            "status": "healthy",
            "templates_loaded": len(self.templates),
            "operations_count": len(self.history)
        }

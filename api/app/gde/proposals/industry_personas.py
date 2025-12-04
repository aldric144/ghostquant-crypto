"""
Industry Personas

Writing personas for 7 major industry RFP styles.
"""

from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class IndustryPersona:
    """Industry writing persona"""
    industry_name: str
    tone: str
    structure_preference: str
    priority_themes: List[str]
    compliance_emphasis: List[str]
    language_style: str
    risk_tolerance: str
    decision_factors: List[str]
    typical_concerns: List[str]


def get_banking_persona() -> IndustryPersona:
    """Banking industry persona"""
    return IndustryPersona(
        industry_name="Banking",
        tone="Conservative, risk-averse, regulatory compliance focused",
        structure_preference="Risk assessment prominent, regulatory compliance emphasized",
        priority_themes=[
            "Financial stability",
            "Regulatory compliance",
            "Risk management",
            "Customer protection",
            "AML/KYC",
            "Fraud prevention",
            "Operational resilience"
        ],
        compliance_emphasis=[
            "Bank Secrecy Act",
            "AML regulations",
            "KYC requirements",
            "GLBA",
            "SOX",
            "PCI DSS",
            "Basel III"
        ],
        language_style="Financial terminology, regulatory language, risk management focus",
        risk_tolerance="Very low - regulatory compliance and financial stability paramount",
        decision_factors=[
            "Regulatory compliance",
            "Risk mitigation",
            "Cost efficiency",
            "Vendor stability",
            "Integration capability",
            "Scalability"
        ],
        typical_concerns=[
            "Regulatory penalties",
            "Reputational risk",
            "Operational risk",
            "Cybersecurity",
            "Data privacy",
            "Vendor risk"
        ]
    )


def get_insurance_persona() -> IndustryPersona:
    """Insurance industry persona"""
    return IndustryPersona(
        industry_name="Insurance",
        tone="Actuarial precision, risk quantification focus, regulatory awareness",
        structure_preference="Risk analysis prominent, actuarial data emphasized",
        priority_themes=[
            "Risk assessment",
            "Actuarial analysis",
            "Claims management",
            "Fraud detection",
            "Regulatory compliance",
            "Customer service",
            "Operational efficiency"
        ],
        compliance_emphasis=[
            "State insurance regulations",
            "NAIC standards",
            "Solvency requirements",
            "Privacy regulations",
            "Consumer protection"
        ],
        language_style="Actuarial terminology, risk quantification, statistical analysis",
        risk_tolerance="Low - financial solvency and regulatory compliance critical",
        decision_factors=[
            "Risk reduction",
            "Cost savings",
            "Fraud prevention",
            "Regulatory compliance",
            "Customer satisfaction",
            "ROI"
        ],
        typical_concerns=[
            "Fraud losses",
            "Regulatory compliance",
            "Claims accuracy",
            "Customer retention",
            "Operational costs",
            "Data security"
        ]
    )


def get_stock_exchange_persona() -> IndustryPersona:
    """Stock exchange industry persona"""
    return IndustryPersona(
        industry_name="Stock Exchanges",
        tone="Market integrity focus, regulatory precision, technology emphasis",
        structure_preference="Market surveillance prominent, regulatory framework emphasized",
        priority_themes=[
            "Market integrity",
            "Fair and orderly markets",
            "Market surveillance",
            "Regulatory compliance",
            "Trading technology",
            "Market manipulation detection",
            "Investor confidence"
        ],
        compliance_emphasis=[
            "SEC regulations",
            "Exchange rules",
            "Market surveillance requirements",
            "Reg NMS",
            "Reg SCI",
            "Market abuse regulations"
        ],
        language_style="Trading terminology, market microstructure, regulatory language",
        risk_tolerance="Very low - market integrity paramount",
        decision_factors=[
            "Detection accuracy",
            "Latency requirements",
            "Regulatory compliance",
            "Market coverage",
            "Technology reliability",
            "Vendor reputation"
        ],
        typical_concerns=[
            "Market manipulation",
            "Trading irregularities",
            "System reliability",
            "Regulatory scrutiny",
            "Reputational risk",
            "Technology failures"
        ]
    )


def get_fortune100_persona() -> IndustryPersona:
    """Fortune-100 corporate procurement persona"""
    return IndustryPersona(
        industry_name="Fortune-100 Corporate",
        tone="Business value focus, ROI emphasis, strategic alignment",
        structure_preference="Executive summary prominent, business case emphasized",
        priority_themes=[
            "Business value",
            "ROI",
            "Strategic alignment",
            "Competitive advantage",
            "Operational efficiency",
            "Innovation",
            "Risk management"
        ],
        compliance_emphasis=[
            "SOX",
            "Industry regulations",
            "Corporate governance",
            "Data privacy",
            "Cybersecurity standards",
            "Vendor management"
        ],
        language_style="Business terminology, ROI focus, strategic language",
        risk_tolerance="Medium - balanced approach to innovation and risk",
        decision_factors=[
            "Business value",
            "ROI",
            "Strategic fit",
            "Vendor capability",
            "Total cost of ownership",
            "Implementation risk"
        ],
        typical_concerns=[
            "Business disruption",
            "ROI realization",
            "Vendor lock-in",
            "Integration complexity",
            "Change management",
            "Competitive position"
        ]
    )


def get_technology_integrator_persona() -> IndustryPersona:
    """Technology integrators persona"""
    return IndustryPersona(
        industry_name="Technology Integrators",
        tone="Technical depth, architecture focus, integration emphasis",
        structure_preference="Technical architecture prominent, integration approach emphasized",
        priority_themes=[
            "Technical architecture",
            "Integration capability",
            "Interoperability",
            "Scalability",
            "Performance",
            "API design",
            "Technology stack"
        ],
        compliance_emphasis=[
            "Technical standards",
            "API specifications",
            "Security standards",
            "Data formats",
            "Integration protocols"
        ],
        language_style="Technical terminology, architecture language, integration focus",
        risk_tolerance="Medium - balanced approach to innovation and stability",
        decision_factors=[
            "Technical capability",
            "Integration ease",
            "API quality",
            "Documentation",
            "Support quality",
            "Technology alignment"
        ],
        typical_concerns=[
            "Integration complexity",
            "API limitations",
            "Performance bottlenecks",
            "Documentation quality",
            "Technical support",
            "Technology obsolescence"
        ]
    )


def get_energy_utilities_persona() -> IndustryPersona:
    """Energy & utilities persona"""
    return IndustryPersona(
        industry_name="Energy & Utilities",
        tone="Reliability focus, safety emphasis, regulatory awareness",
        structure_preference="Safety and reliability prominent, regulatory compliance emphasized",
        priority_themes=[
            "System reliability",
            "Safety",
            "Critical infrastructure protection",
            "Regulatory compliance",
            "Operational efficiency",
            "Grid security",
            "Environmental compliance"
        ],
        compliance_emphasis=[
            "NERC CIP",
            "FERC regulations",
            "EPA requirements",
            "State utility regulations",
            "Critical infrastructure protection"
        ],
        language_style="Utility terminology, reliability focus, safety language",
        risk_tolerance="Very low - critical infrastructure reliability paramount",
        decision_factors=[
            "Reliability",
            "Safety",
            "Regulatory compliance",
            "Cybersecurity",
            "Operational impact",
            "Cost effectiveness"
        ],
        typical_concerns=[
            "System reliability",
            "Safety incidents",
            "Cyber attacks",
            "Regulatory penalties",
            "Environmental impact",
            "Service disruption"
        ]
    )


def get_healthcare_persona() -> IndustryPersona:
    """Healthcare persona"""
    return IndustryPersona(
        industry_name="Healthcare",
        tone="Patient safety focus, privacy emphasis, regulatory precision",
        structure_preference="Patient safety prominent, HIPAA compliance emphasized",
        priority_themes=[
            "Patient safety",
            "Privacy protection",
            "HIPAA compliance",
            "Clinical quality",
            "Operational efficiency",
            "Regulatory compliance",
            "Data security"
        ],
        compliance_emphasis=[
            "HIPAA",
            "HITECH",
            "FDA regulations",
            "State health regulations",
            "Privacy rules",
            "Security rules"
        ],
        language_style="Healthcare terminology, clinical language, privacy focus",
        risk_tolerance="Very low - patient safety and privacy paramount",
        decision_factors=[
            "Patient safety",
            "Privacy protection",
            "HIPAA compliance",
            "Clinical effectiveness",
            "Integration capability",
            "Vendor reliability"
        ],
        typical_concerns=[
            "Patient safety",
            "Privacy breaches",
            "HIPAA violations",
            "Data security",
            "Clinical accuracy",
            "System reliability"
        ]
    )


def get_all_industry_personas() -> Dict[str, IndustryPersona]:
    """Get all 7 industry personas"""
    personas = {
        "banking": get_banking_persona(),
        "insurance": get_insurance_persona(),
        "stock_exchange": get_stock_exchange_persona(),
        "fortune100": get_fortune100_persona(),
        "tech_integrator": get_technology_integrator_persona(),
        "energy_utilities": get_energy_utilities_persona(),
        "healthcare": get_healthcare_persona(),
    }
    return personas


def get_persona_by_industry(industry_code: str) -> IndustryPersona:
    """Get persona by industry code"""
    personas = get_all_industry_personas()
    return personas.get(industry_code.lower(), get_fortune100_persona())

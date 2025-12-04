"""
Government Agency Personas

Writing personas for 10 major government agencies defining tone, structure, priority themes, and compliance style.
"""

from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class AgencyPersona:
    """Government agency writing persona"""
    agency_name: str
    tone: str
    structure_preference: str
    priority_themes: List[str]
    compliance_emphasis: List[str]
    language_style: str
    risk_tolerance: str
    decision_factors: List[str]
    typical_concerns: List[str]


def get_dod_persona() -> AgencyPersona:
    """Department of Defense persona"""
    return AgencyPersona(
        agency_name="Department of Defense",
        tone="Military precision, mission-focused, results-oriented",
        structure_preference="Hierarchical, clear chain of command, executive summary first",
        priority_themes=[
            "National security",
            "Operational readiness",
            "Mission assurance",
            "Force protection",
            "Strategic advantage",
            "Interoperability",
            "Resilience"
        ],
        compliance_emphasis=[
            "NIST 800-53",
            "DFARS",
            "CMMC",
            "FedRAMP High",
            "ITAR",
            "Classified information handling"
        ],
        language_style="Direct, action-oriented, military terminology acceptable",
        risk_tolerance="Low - mission-critical systems require highest assurance",
        decision_factors=[
            "Mission impact",
            "Security posture",
            "Operational capability",
            "Cost-effectiveness",
            "Vendor stability",
            "Past performance"
        ],
        typical_concerns=[
            "Supply chain security",
            "Adversary capabilities",
            "System availability",
            "Data protection",
            "Vendor reliability"
        ]
    )


def get_dhs_persona() -> AgencyPersona:
    """Department of Homeland Security persona"""
    return AgencyPersona(
        agency_name="Department of Homeland Security",
        tone="Security-focused, threat-aware, protective",
        structure_preference="Risk-based organization, threat assessment prominent",
        priority_themes=[
            "Homeland security",
            "Critical infrastructure protection",
            "Threat detection",
            "Border security",
            "Cybersecurity",
            "Emergency response",
            "Public safety"
        ],
        compliance_emphasis=[
            "CISA directives",
            "NIST Cybersecurity Framework",
            "Critical infrastructure protection",
            "Privacy Act",
            "FISMA"
        ],
        language_style="Security-centric, threat-focused, protective terminology",
        risk_tolerance="Low - critical infrastructure protection paramount",
        decision_factors=[
            "Threat mitigation",
            "Infrastructure protection",
            "Response capability",
            "Information sharing",
            "Interagency coordination"
        ],
        typical_concerns=[
            "Cyber threats",
            "Critical infrastructure vulnerabilities",
            "Information sharing",
            "Privacy protection",
            "Incident response"
        ]
    )


def get_fbi_persona() -> AgencyPersona:
    """Federal Bureau of Investigation persona"""
    return AgencyPersona(
        agency_name="Federal Bureau of Investigation",
        tone="Investigative, evidence-focused, law enforcement oriented",
        structure_preference="Case-based organization, evidentiary standards emphasized",
        priority_themes=[
            "Criminal investigation",
            "Evidence collection",
            "Chain of custody",
            "Prosecutorial support",
            "Intelligence gathering",
            "Counterterrorism",
            "Cyber crime"
        ],
        compliance_emphasis=[
            "CJIS Security Policy",
            "Federal Rules of Evidence",
            "Privacy Act",
            "FISA",
            "Criminal procedure"
        ],
        language_style="Law enforcement terminology, investigative focus, legal precision",
        risk_tolerance="Very low - evidentiary standards must be met",
        decision_factors=[
            "Evidentiary value",
            "Investigation support",
            "Legal admissibility",
            "Intelligence value",
            "Operational security"
        ],
        typical_concerns=[
            "Evidence integrity",
            "Chain of custody",
            "Legal admissibility",
            "Source protection",
            "Operational security"
        ]
    )


def get_doj_persona() -> AgencyPersona:
    """Department of Justice persona"""
    return AgencyPersona(
        agency_name="Department of Justice",
        tone="Legal precision, prosecutorial focus, justice-oriented",
        structure_preference="Legal framework organization, statutory basis prominent",
        priority_themes=[
            "Law enforcement",
            "Prosecution support",
            "Legal compliance",
            "Civil rights",
            "Asset forfeiture",
            "Organized crime",
            "White collar crime"
        ],
        compliance_emphasis=[
            "Federal statutes",
            "DOJ policies",
            "Privacy Act",
            "FOIA",
            "Legal standards"
        ],
        language_style="Legal terminology, precise definitions, statutory references",
        risk_tolerance="Very low - legal standards must be met",
        decision_factors=[
            "Legal sufficiency",
            "Prosecutorial value",
            "Statutory compliance",
            "Precedent alignment",
            "Resource efficiency"
        ],
        typical_concerns=[
            "Legal admissibility",
            "Constitutional compliance",
            "Privacy rights",
            "Due process",
            "Prosecutorial integrity"
        ]
    )


def get_treasury_persona() -> AgencyPersona:
    """Department of Treasury persona"""
    return AgencyPersona(
        agency_name="Department of Treasury",
        tone="Financial precision, regulatory focus, economic security oriented",
        structure_preference="Financial analysis prominent, regulatory compliance emphasized",
        priority_themes=[
            "Financial intelligence",
            "Anti-money laundering",
            "Sanctions enforcement",
            "Economic security",
            "Financial crimes",
            "Terrorist financing",
            "Tax enforcement"
        ],
        compliance_emphasis=[
            "Bank Secrecy Act",
            "AML regulations",
            "OFAC sanctions",
            "FinCEN requirements",
            "Tax regulations"
        ],
        language_style="Financial terminology, regulatory language, economic analysis",
        risk_tolerance="Low - financial system integrity critical",
        decision_factors=[
            "Financial intelligence value",
            "AML effectiveness",
            "Sanctions compliance",
            "Regulatory alignment",
            "Economic impact"
        ],
        typical_concerns=[
            "Money laundering",
            "Sanctions evasion",
            "Terrorist financing",
            "Financial system integrity",
            "Regulatory compliance"
        ]
    )


def get_sec_persona() -> AgencyPersona:
    """Securities and Exchange Commission persona"""
    return AgencyPersona(
        agency_name="Securities and Exchange Commission",
        tone="Regulatory precision, market integrity focus, investor protection oriented",
        structure_preference="Market analysis prominent, regulatory framework emphasized",
        priority_themes=[
            "Market integrity",
            "Investor protection",
            "Securities regulation",
            "Market manipulation",
            "Fraud detection",
            "Disclosure requirements",
            "Fair markets"
        ],
        compliance_emphasis=[
            "Securities Act",
            "Exchange Act",
            "Investment Advisers Act",
            "SEC regulations",
            "Market rules"
        ],
        language_style="Securities terminology, regulatory language, market analysis",
        risk_tolerance="Medium - balanced approach to innovation and protection",
        decision_factors=[
            "Market integrity",
            "Investor protection",
            "Regulatory compliance",
            "Detection capability",
            "Enforcement support"
        ],
        typical_concerns=[
            "Market manipulation",
            "Insider trading",
            "Fraud schemes",
            "Disclosure violations",
            "Investor harm"
        ]
    )


def get_cia_tone_persona() -> AgencyPersona:
    """CIA-tone persona (open content, no classified info)"""
    return AgencyPersona(
        agency_name="Intelligence Community (CIA-tone)",
        tone="Intelligence-focused, strategic analysis, national security oriented",
        structure_preference="Intelligence assessment format, strategic context emphasized",
        priority_themes=[
            "Strategic intelligence",
            "Threat assessment",
            "Foreign intelligence",
            "Counterintelligence",
            "National security",
            "Strategic warning",
            "Decision support"
        ],
        compliance_emphasis=[
            "Intelligence Community Directive",
            "Executive orders",
            "Classification guidance",
            "Compartmented information",
            "Need-to-know"
        ],
        language_style="Intelligence terminology, analytical language, strategic focus",
        risk_tolerance="Very low - national security paramount",
        decision_factors=[
            "Intelligence value",
            "Strategic impact",
            "Operational security",
            "Source protection",
            "Decision support"
        ],
        typical_concerns=[
            "Operational security",
            "Source protection",
            "Foreign intelligence threats",
            "Counterintelligence",
            "Strategic surprise"
        ]
    )


def get_nist_persona() -> AgencyPersona:
    """National Institute of Standards and Technology persona"""
    return AgencyPersona(
        agency_name="National Institute of Standards and Technology",
        tone="Technical precision, standards-focused, scientific rigor",
        structure_preference="Technical documentation format, standards compliance emphasized",
        priority_themes=[
            "Technical standards",
            "Cybersecurity framework",
            "Measurement science",
            "Technology advancement",
            "Best practices",
            "Interoperability",
            "Innovation"
        ],
        compliance_emphasis=[
            "NIST standards",
            "Cybersecurity Framework",
            "NIST SP 800 series",
            "Federal standards",
            "Technical specifications"
        ],
        language_style="Technical terminology, precise definitions, standards language",
        risk_tolerance="Medium - balanced approach to innovation and security",
        decision_factors=[
            "Technical merit",
            "Standards compliance",
            "Scientific rigor",
            "Interoperability",
            "Innovation potential"
        ],
        typical_concerns=[
            "Standards compliance",
            "Technical accuracy",
            "Measurement precision",
            "Interoperability",
            "Best practices"
        ]
    )


def get_fdic_persona() -> AgencyPersona:
    """Federal Deposit Insurance Corporation persona"""
    return AgencyPersona(
        agency_name="Federal Deposit Insurance Corporation",
        tone="Banking regulation focus, financial stability oriented, risk management emphasis",
        structure_preference="Risk assessment prominent, regulatory compliance emphasized",
        priority_themes=[
            "Banking supervision",
            "Financial stability",
            "Deposit insurance",
            "Risk management",
            "Consumer protection",
            "Bank safety",
            "Systemic risk"
        ],
        compliance_emphasis=[
            "Banking regulations",
            "FDIC rules",
            "Bank Secrecy Act",
            "Consumer protection laws",
            "Safety and soundness"
        ],
        language_style="Banking terminology, regulatory language, risk management focus",
        risk_tolerance="Low - financial system stability critical",
        decision_factors=[
            "Risk mitigation",
            "Financial stability",
            "Regulatory compliance",
            "Consumer protection",
            "Systemic impact"
        ],
        typical_concerns=[
            "Bank safety",
            "Systemic risk",
            "Consumer protection",
            "Financial stability",
            "Regulatory compliance"
        ]
    )


def get_state_dept_persona() -> AgencyPersona:
    """State Department persona"""
    return AgencyPersona(
        agency_name="Department of State",
        tone="Diplomatic language, international focus, policy-oriented",
        structure_preference="Policy framework prominent, international context emphasized",
        priority_themes=[
            "Foreign policy",
            "Diplomatic relations",
            "International cooperation",
            "Sanctions enforcement",
            "Export control",
            "Global security",
            "International law"
        ],
        compliance_emphasis=[
            "ITAR",
            "Export control",
            "Sanctions regulations",
            "International agreements",
            "Diplomatic protocols"
        ],
        language_style="Diplomatic terminology, policy language, international focus",
        risk_tolerance="Low - diplomatic relations and international law paramount",
        decision_factors=[
            "Policy alignment",
            "International cooperation",
            "Diplomatic impact",
            "Legal compliance",
            "Strategic relationships"
        ],
        typical_concerns=[
            "Export control",
            "Sanctions compliance",
            "International law",
            "Diplomatic relations",
            "Foreign policy impact"
        ]
    )


def get_all_agency_personas() -> Dict[str, AgencyPersona]:
    """Get all 10 government agency personas"""
    personas = {
        "dod": get_dod_persona(),
        "dhs": get_dhs_persona(),
        "fbi": get_fbi_persona(),
        "doj": get_doj_persona(),
        "treasury": get_treasury_persona(),
        "sec": get_sec_persona(),
        "cia": get_cia_tone_persona(),
        "nist": get_nist_persona(),
        "fdic": get_fdic_persona(),
        "state": get_state_dept_persona(),
    }
    return personas


def get_persona_by_agency(agency_code: str) -> AgencyPersona:
    """Get persona by agency code"""
    personas = get_all_agency_personas()
    return personas.get(agency_code.lower(), get_dod_persona())

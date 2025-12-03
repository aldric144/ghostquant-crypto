"""
Proposal Schema

Dataclasses for government and Fortune-100 proposal generation system.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime


@dataclass
class ProposalSection:
    """Individual section within a proposal volume"""
    section_id: str
    title: str
    content: str
    word_count: int
    subsections: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    compliance_tags: List[str] = field(default_factory=list)
    risk_level: str = "low"


@dataclass
class ProposalVolume:
    """Complete proposal volume (e.g., Technical Volume, Management Volume)"""
    volume_id: str
    volume_name: str
    volume_number: int
    sections: List[ProposalSection]
    total_words: int
    page_estimate: int
    compliance_frameworks: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProposalNarrative:
    """Narrative content with persona-specific tone"""
    narrative_id: str
    content: str
    persona: str
    tone: str
    word_count: int
    generated_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProposalDocument:
    """Complete proposal document"""
    document_id: str
    title: str
    agency: str
    rfp_number: str
    volumes: List[ProposalVolume]
    total_pages: int
    total_words: int
    generated_at: str
    persona: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProposalRiskTable:
    """Risk assessment table"""
    risk_id: str
    risks: List[Dict[str, Any]]
    overall_risk_level: str
    mitigation_strategies: List[Dict[str, Any]]
    generated_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProposalComplianceMatrix:
    """Compliance matrix"""
    matrix_id: str
    requirements: List[Dict[str, Any]]
    compliance_summary: Dict[str, Any]
    non_compliant_items: List[Dict[str, Any]]
    mitigation_plans: List[Dict[str, Any]]
    overall_score: float
    generated_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProposalCostBreakdown:
    """Detailed cost breakdown"""
    cost_id: str
    labor_costs: Dict[str, Any]
    odc_costs: Dict[str, Any]
    travel_costs: Dict[str, Any]
    data_costs: Dict[str, Any]
    security_costs: Dict[str, Any]
    total_cost: float
    cost_by_year: List[Dict[str, Any]]
    fte_breakdown: Dict[str, Any]
    cost_risk_level: str
    generated_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProposalPackage:
    """Complete proposal package with all components"""
    package_id: str
    document: ProposalDocument
    compliance_matrix: Optional[ProposalComplianceMatrix]
    risk_table: Optional[ProposalRiskTable]
    cost_breakdown: Optional[ProposalCostBreakdown]
    supporting_docs: List[Dict[str, Any]] = field(default_factory=list)
    export_formats: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    status: str = "draft"
    metadata: Dict[str, Any] = field(default_factory=dict)

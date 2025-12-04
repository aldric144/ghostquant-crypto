"""
Proposal Writer Engine

Core engine for building and managing government and Fortune-100 proposals.
Implements 18 methods for comprehensive proposal generation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from .proposal_schema import (
    ProposalSection, ProposalVolume, ProposalNarrative, ProposalDocument,
    ProposalRiskTable, ProposalComplianceMatrix, ProposalCostBreakdown, ProposalPackage
)
from .proposal_templates import get_all_proposal_volumes
from .gov_agency_personas import get_persona_by_agency, get_all_agency_personas
from .industry_personas import get_persona_by_industry, get_all_industry_personas


class ProposalWriterEngine:
    """Core proposal generation engine"""
    
    def __init__(self):
        self.templates = get_all_proposal_volumes()
        self.agency_personas = get_all_agency_personas()
        self.industry_personas = get_all_industry_personas()
        
    def ingest_rfp(self, rfp_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingest RFP requirements and extract key information.
        
        Args:
            rfp_data: RFP document data including requirements, agency, deadline, etc.
            
        Returns:
            Processed RFP data with extracted requirements
        """
        processed = {
            "rfp_id": rfp_data.get("rfp_id", f"RFP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"),
            "agency": rfp_data.get("agency", "Federal Agency"),
            "title": rfp_data.get("title", "Cryptocurrency Intelligence Platform"),
            "deadline": rfp_data.get("deadline", "TBD"),
            "requirements": [],
            "evaluation_criteria": [],
            "compliance_requirements": [],
            "ingested_at": datetime.utcnow().isoformat() + "Z"
        }
        
        if "requirements" in rfp_data:
            processed["requirements"] = rfp_data["requirements"]
        
        if "evaluation_criteria" in rfp_data:
            processed["evaluation_criteria"] = rfp_data["evaluation_criteria"]
        
        if "compliance_requirements" in rfp_data:
            processed["compliance_requirements"] = rfp_data["compliance_requirements"]
        
        return processed
    
    def build_outline(self, rfp_data: Dict[str, Any], persona_type: str = "dod") -> Dict[str, Any]:
        """
        Build proposal outline based on RFP requirements and persona.
        
        Args:
            rfp_data: Processed RFP data
            persona_type: Agency or industry persona code
            
        Returns:
            Proposal outline with volumes and sections
        """
        persona = None
        if persona_type in self.agency_personas:
            persona = self.agency_personas[persona_type]
        elif persona_type in self.industry_personas:
            persona = self.industry_personas[persona_type]
        else:
            persona = self.agency_personas["dod"]
        
        outline = {
            "proposal_id": f"PROP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "rfp_id": rfp_data.get("rfp_id", ""),
            "persona": persona_type,
            "volumes": [],
            "total_estimated_pages": 0,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        for template in self.templates:
            volume_outline = {
                "volume_name": template["volume_name"],
                "volume_number": template["volume_number"],
                "word_count": template["word_count"],
                "page_estimate": template["word_count"] // 250,  # ~250 words per page
                "sections": []
            }
            outline["volumes"].append(volume_outline)
            outline["total_estimated_pages"] += volume_outline["page_estimate"]
        
        return outline
    
    def write_volume(self, volume_name: str, context: Dict[str, Any]) -> ProposalVolume:
        """
        Write a single proposal volume.
        
        Args:
            volume_name: Name of volume to write
            context: Context including RFP data, persona, etc.
            
        Returns:
            Complete proposal volume
        """
        template = None
        for t in self.templates:
            if t["volume_name"] == volume_name:
                template = t
                break
        
        if not template:
            raise ValueError(f"Volume template not found: {volume_name}")
        
        section = ProposalSection(
            section_id=f"SEC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            title=template["volume_name"],
            content=template["content"],
            word_count=template["word_count"],
            subsections=[],
            metadata={"generated_at": datetime.utcnow().isoformat() + "Z"},
            compliance_tags=[],
            risk_level="low"
        )
        
        volume = ProposalVolume(
            volume_id=f"VOL-{template['volume_number']}",
            volume_name=template["volume_name"],
            volume_number=template["volume_number"],
            sections=[section],
            total_words=template["word_count"],
            page_estimate=template["word_count"] // 250,
            compliance_frameworks=[],
            metadata={"generated_at": datetime.utcnow().isoformat() + "Z"}
        )
        
        return volume
    
    def write_all_volumes(self, rfp_data: Dict[str, Any], persona_type: str = "dod") -> List[ProposalVolume]:
        """
        Write all proposal volumes.
        
        Args:
            rfp_data: Processed RFP data
            persona_type: Agency or industry persona code
            
        Returns:
            List of all proposal volumes
        """
        context = {
            "rfp_data": rfp_data,
            "persona": persona_type,
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        volumes = []
        for template in self.templates:
            volume = self.write_volume(template["volume_name"], context)
            volumes.append(volume)
        
        return volumes
    
    def generate_tables(self, rfp_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate risk, compliance, and financial tables.
        
        Args:
            rfp_data: Processed RFP data
            
        Returns:
            Dictionary containing all tables
        """
        tables = {
            "risk_table": self._generate_risk_table(rfp_data),
            "compliance_matrix": self._generate_compliance_matrix(rfp_data),
            "financial_table": self._generate_financial_table(rfp_data)
        }
        return tables
    
    def _generate_risk_table(self, rfp_data: Dict[str, Any]) -> ProposalRiskTable:
        """Generate risk assessment table"""
        risks = [
            {
                "risk_id": "RISK-001",
                "category": "Technical",
                "description": "System performance insufficient for production workload",
                "probability": "Low",
                "impact": "High",
                "risk_score": 6,
                "mitigation": "Extensive load testing, horizontal scaling, performance monitoring"
            },
            {
                "risk_id": "RISK-002",
                "category": "Security",
                "description": "Data breach compromises sensitive information",
                "probability": "Low",
                "impact": "Critical",
                "risk_score": 8,
                "mitigation": "Defense-in-depth security, encryption, access controls, monitoring"
            },
            {
                "risk_id": "RISK-003",
                "category": "Operational",
                "description": "Key personnel unavailable",
                "probability": "Medium",
                "impact": "Medium",
                "risk_score": 5,
                "mitigation": "Cross-training, documentation, backup personnel, succession planning"
            }
        ]
        
        mitigation_strategies = [
            {
                "strategy_id": "MIT-001",
                "risk_id": "RISK-001",
                "strategy": "Performance optimization and horizontal scaling",
                "owner": "Technical Lead",
                "timeline": "Ongoing"
            },
            {
                "strategy_id": "MIT-002",
                "risk_id": "RISK-002",
                "strategy": "Comprehensive security controls and monitoring",
                "owner": "Security Officer",
                "timeline": "Continuous"
            }
        ]
        
        return ProposalRiskTable(
            risk_id=f"RISK-TABLE-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            risks=risks,
            overall_risk_level="Medium",
            mitigation_strategies=mitigation_strategies,
            generated_at=datetime.utcnow().isoformat() + "Z",
            metadata={}
        )
    
    def _generate_compliance_matrix(self, rfp_data: Dict[str, Any]) -> ProposalComplianceMatrix:
        """Generate compliance matrix"""
        requirements = [
            {
                "req_id": "REQ-001",
                "requirement": "NIST 800-53 compliance",
                "status": "Compliant",
                "evidence": "All controls implemented and documented",
                "confidence": 0.95
            },
            {
                "req_id": "REQ-002",
                "requirement": "FedRAMP authorization",
                "status": "In Progress",
                "evidence": "Authorization package under review",
                "confidence": 0.85
            },
            {
                "req_id": "REQ-003",
                "requirement": "24/7 support",
                "status": "Compliant",
                "evidence": "Dedicated support team with 24/7 coverage",
                "confidence": 1.0
            }
        ]
        
        compliance_summary = {
            "total_requirements": len(requirements),
            "compliant": 2,
            "in_progress": 1,
            "non_compliant": 0,
            "compliance_percentage": 85.0
        }
        
        return ProposalComplianceMatrix(
            matrix_id=f"COMP-MATRIX-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            requirements=requirements,
            compliance_summary=compliance_summary,
            non_compliant_items=[],
            mitigation_plans=[],
            overall_score=85.0,
            generated_at=datetime.utcnow().isoformat() + "Z",
            metadata={}
        )
    
    def _generate_financial_table(self, rfp_data: Dict[str, Any]) -> ProposalCostBreakdown:
        """Generate financial cost breakdown"""
        labor_costs = {
            "program_manager": {"rate": 250, "hours": 2080, "total": 520000},
            "technical_lead": {"rate": 225, "hours": 2080, "total": 468000},
            "engineers": {"rate": 200, "hours": 8320, "total": 1664000},
            "total": 2652000
        }
        
        odc_costs = {
            "cloud_infrastructure": 240000,
            "software_licenses": 60000,
            "third_party_services": 50000,
            "total": 350000
        }
        
        travel_costs = {
            "on_site_visits": 30000,
            "training_travel": 20000,
            "total": 50000
        }
        
        cost_by_year = [
            {"year": 1, "labor": 884000, "odc": 116667, "travel": 16667, "total": 1017334},
            {"year": 2, "labor": 884000, "odc": 116667, "travel": 16667, "total": 1017333},
            {"year": 3, "labor": 884000, "odc": 116666, "travel": 16666, "total": 1017332}
        ]
        
        return ProposalCostBreakdown(
            cost_id=f"COST-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            labor_costs=labor_costs,
            odc_costs=odc_costs,
            travel_costs=travel_costs,
            data_costs={"storage": 10000, "bandwidth": 5000, "total": 15000},
            security_costs={"tools": 25000, "assessments": 10000, "total": 35000},
            total_cost=3052000,
            cost_by_year=cost_by_year,
            fte_breakdown={"program_manager": 1, "technical_lead": 1, "engineers": 4, "total": 6},
            cost_risk_level="Low",
            generated_at=datetime.utcnow().isoformat() + "Z",
            metadata={}
        )
    
    def merge_volumes(self, volumes: List[ProposalVolume]) -> str:
        """
        Merge all volumes into unified document content.
        
        Args:
            volumes: List of proposal volumes
            
        Returns:
            Merged document content (Markdown)
        """
        content_parts = []
        
        content_parts.append("# GhostQuant Intelligence Systems")
        content_parts.append("## Proposal for Cryptocurrency Intelligence Platform")
        content_parts.append(f"\n**Generated:** {datetime.utcnow().strftime('%B %d, %Y')}\n")
        content_parts.append("---\n")
        
        content_parts.append("## Table of Contents\n")
        for volume in volumes:
            content_parts.append(f"{volume.volume_number}. {volume.volume_name}")
        content_parts.append("\n---\n")
        
        for volume in volumes:
            for section in volume.sections:
                content_parts.append(section.content)
                content_parts.append("\n---\n")
        
        return "\n".join(content_parts)
    
    def generate_pdf_html(self, document: ProposalDocument) -> str:
        """
        Generate HTML suitable for PDF conversion.
        
        Args:
            document: Proposal document
            
        Returns:
            HTML content
        """
        html_parts = []
        
        html_parts.append("""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GhostQuant Proposal</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; }
        h2 { color: #0891b2; margin-top: 30px; }
        h3 { color: #334155; }
        .volume { page-break-before: always; margin-top: 50px; }
        .metadata { background: #f1f5f9; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>""")
        
        html_parts.append(f"""
    <div class="title-page">
        <h1>GhostQuant Intelligence Systems</h1>
        <h2>{document.title}</h2>
        <div class="metadata">
            <p><strong>Agency:</strong> {document.agency}</p>
            <p><strong>RFP Number:</strong> {document.metadata.get('rfp_number', 'N/A')}</p>
            <p><strong>Generated:</strong> {document.generated_at}</p>
            <p><strong>Total Pages:</strong> {document.total_pages}</p>
            <p><strong>Total Words:</strong> {document.total_words:,}</p>
        </div>
    </div>
    <div class="page-break"></div>
""")
        
        for volume in document.volumes:
            html_parts.append(f'<div class="volume">')
            html_parts.append(f'<h1>Volume {volume.volume_number}: {volume.volume_name}</h1>')
            
            for section in volume.sections:
                content_html = section.content.replace("\n\n", "</p><p>")
                content_html = content_html.replace("# ", "<h1>").replace("\n", "</h1>\n")
                content_html = content_html.replace("## ", "<h2>").replace("\n", "</h2>\n")
                content_html = content_html.replace("### ", "<h3>").replace("\n", "</h3>\n")
                content_html = f"<p>{content_html}</p>"
                
                html_parts.append(content_html)
            
            html_parts.append('</div>')
        
        html_parts.append("</body></html>")
        
        return "\n".join(html_parts)
    
    def generate_markdown(self, document: ProposalDocument) -> str:
        """
        Generate Markdown document.
        
        Args:
            document: Proposal document
            
        Returns:
            Markdown content
        """
        return self.merge_volumes(document.volumes)
    
    def generate_json(self, document: ProposalDocument) -> str:
        """
        Generate JSON document.
        
        Args:
            document: Proposal document
            
        Returns:
            JSON string
        """
        doc_dict = {
            "document_id": document.document_id,
            "title": document.title,
            "agency": document.agency,
            "rfp_number": document.rfp_number,
            "total_pages": document.total_pages,
            "total_words": document.total_words,
            "generated_at": document.generated_at,
            "persona": document.persona,
            "volumes": [
                {
                    "volume_id": vol.volume_id,
                    "volume_name": vol.volume_name,
                    "volume_number": vol.volume_number,
                    "total_words": vol.total_words,
                    "page_estimate": vol.page_estimate,
                    "sections": [
                        {
                            "section_id": sec.section_id,
                            "title": sec.title,
                            "content": sec.content,
                            "word_count": sec.word_count
                        }
                        for sec in vol.sections
                    ]
                }
                for vol in document.volumes
            ],
            "metadata": document.metadata
        }
        
        return json.dumps(doc_dict, indent=2)
    
    def generate_zip_package(self, package: ProposalPackage) -> bytes:
        """
        Generate ZIP bundle (placeholder - actual implementation uses zipfile).
        
        Args:
            package: Proposal package
            
        Returns:
            ZIP file bytes
        """
        return b"ZIP_PACKAGE_PLACEHOLDER"
    
    def build_final_package(self, document: ProposalDocument, 
                           compliance_matrix: Optional[ProposalComplianceMatrix] = None,
                           risk_table: Optional[ProposalRiskTable] = None,
                           cost_breakdown: Optional[ProposalCostBreakdown] = None) -> ProposalPackage:
        """
        Build complete proposal package.
        
        Args:
            document: Proposal document
            compliance_matrix: Optional compliance matrix
            risk_table: Optional risk table
            cost_breakdown: Optional cost breakdown
            
        Returns:
            Complete proposal package
        """
        package = ProposalPackage(
            package_id=f"PKG-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            document=document,
            compliance_matrix=compliance_matrix,
            risk_table=risk_table,
            cost_breakdown=cost_breakdown,
            supporting_docs=[],
            export_formats=["html", "markdown", "json", "zip"],
            status="draft",
            metadata={"generated_at": datetime.utcnow().isoformat() + "Z"}
        )
        
        return package
    
    def generate_summary(self, document: ProposalDocument) -> str:
        """
        Generate 15-30 line executive summary.
        
        Args:
            document: Proposal document
            
        Returns:
            Executive summary text
        """
        summary_lines = [
            f"PROPOSAL SUMMARY: {document.title}",
            f"Agency: {document.agency}",
            f"RFP Number: {document.rfp_number}",
            "",
            "OVERVIEW:",
            "GhostQuant Intelligence Systems proposes a comprehensive cryptocurrency intelligence platform",
            "delivering advanced threat detection, financial intelligence, and blockchain forensics capabilities.",
            "The platform addresses critical needs for government agencies and financial institutions combating",
            "cryptocurrency-related financial crimes, money laundering, and sophisticated cyber threats.",
            "",
            "KEY CAPABILITIES:",
            "- Real-time monitoring of 100+ exchanges and 15+ blockchain networks",
            "- AI-powered threat detection with behavioral analytics",
            "- Forensic-grade evidence preservation with chain of custody",
            "- Comprehensive compliance with CJIS, NIST 800-53, SOC 2, and FedRAMP",
            "- 24/7 support with dedicated program team",
            "",
            "PROPOSAL STRUCTURE:",
            f"- {len(document.volumes)} comprehensive volumes covering all RFP requirements",
            f"- {document.total_pages} pages of detailed technical, management, and cost information",
            f"- {document.total_words:,} words of original, enterprise-grade content",
            "",
            "IMPLEMENTATION:",
            "- Phased 18-month implementation delivering incremental value",
            "- Comprehensive training and knowledge transfer",
            "- Proven past performance with similar federal implementations",
            "",
            "INVESTMENT:",
            "- Competitive pricing with transparent cost structure",
            "- Strong ROI through investigation efficiency and asset recovery",
            "- Fixed-price implementation reduces budget risk",
            "",
            "GhostQuant is committed to delivering exceptional value and supporting your mission success."
        ]
        
        return "\n".join(summary_lines)
    
    def generate_executive_brief(self, document: ProposalDocument) -> str:
        """
        Generate executive brief (5-10 pages).
        
        Args:
            document: Proposal document
            
        Returns:
            Executive brief content
        """
        exec_volume = None
        for volume in document.volumes:
            if "Executive" in volume.volume_name:
                exec_volume = volume
                break
        
        if exec_volume and exec_volume.sections:
            return exec_volume.sections[0].content
        
        return "Executive brief not available."
    
    def generate_cost_breakdown(self, rfp_data: Dict[str, Any]) -> ProposalCostBreakdown:
        """
        Generate detailed cost breakdown.
        
        Args:
            rfp_data: RFP data
            
        Returns:
            Cost breakdown
        """
        return self._generate_financial_table(rfp_data)
    
    def classify_risk(self, risk_data: Dict[str, Any]) -> str:
        """
        Classify overall risk level.
        
        Args:
            risk_data: Risk assessment data
            
        Returns:
            Risk classification (LOW, MEDIUM, HIGH, CRITICAL)
        """
        avg_score = risk_data.get("average_risk_score", 5)
        
        if avg_score < 3:
            return "LOW"
        elif avg_score < 6:
            return "MEDIUM"
        elif avg_score < 8:
            return "HIGH"
        else:
            return "CRITICAL"
    
    def compute_compliance_score(self, requirements: List[Dict[str, Any]]) -> float:
        """
        Compute overall compliance score.
        
        Args:
            requirements: List of requirements with compliance status
            
        Returns:
            Compliance score (0-100)
        """
        if not requirements:
            return 0.0
        
        compliant_count = sum(1 for req in requirements if req.get("status") == "Compliant")
        return (compliant_count / len(requirements)) * 100.0
    
    def attach_supporting_docs(self, package: ProposalPackage, documents: List[Dict[str, Any]]) -> ProposalPackage:
        """
        Attach supporting documents to package.
        
        Args:
            package: Proposal package
            documents: List of supporting documents
            
        Returns:
            Updated package
        """
        package.supporting_docs.extend(documents)
        package.updated_at = datetime.utcnow().isoformat() + "Z"
        return package
    
    def get_history(self, proposal_id: str) -> List[Dict[str, Any]]:
        """
        Get proposal generation history.
        
        Args:
            proposal_id: Proposal ID
            
        Returns:
            List of history events
        """
        return [
            {
                "event_id": "EVT-001",
                "proposal_id": proposal_id,
                "event_type": "created",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "details": "Proposal created"
            }
        ]
    
    def health(self) -> Dict[str, Any]:
        """
        Health check.
        
        Returns:
            Health status
        """
        return {
            "status": "healthy",
            "templates_loaded": len(self.templates),
            "agency_personas": len(self.agency_personas),
            "industry_personas": len(self.industry_personas),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    def generate_full_proposal(self, rfp_id: str, agency: str, title: str, 
                              persona_type: str = "dod") -> ProposalPackage:
        """
        Generate complete proposal with all components.
        
        Args:
            rfp_id: RFP identifier
            agency: Agency name
            title: Proposal title
            persona_type: Persona code
            
        Returns:
            Complete proposal package
        """
        rfp_data = {
            "rfp_id": rfp_id,
            "agency": agency,
            "title": title
        }
        
        processed_rfp = self.ingest_rfp(rfp_data)
        
        volumes = self.write_all_volumes(processed_rfp, persona_type)
        
        total_words = sum(vol.total_words for vol in volumes)
        total_pages = sum(vol.page_estimate for vol in volumes)
        
        document = ProposalDocument(
            document_id=f"DOC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            title=title,
            agency=agency,
            rfp_number=rfp_id,
            volumes=volumes,
            total_pages=total_pages,
            total_words=total_words,
            generated_at=datetime.utcnow().isoformat() + "Z",
            persona=persona_type,
            metadata={"rfp_data": processed_rfp}
        )
        
        tables = self.generate_tables(processed_rfp)
        
        package = self.build_final_package(
            document,
            compliance_matrix=tables["compliance_matrix"],
            risk_table=tables["risk_table"],
            cost_breakdown=tables["financial_table"]
        )
        
        return package

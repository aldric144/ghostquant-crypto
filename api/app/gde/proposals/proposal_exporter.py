"""
Proposal Exporter

Exports proposals in multiple formats: HTML, Markdown, JSON, ZIP package.
"""

from typing import Dict, Any
import json
import zipfile
import io
from datetime import datetime
from .proposal_schema import ProposalDocument, ProposalPackage
from .proposal_merge_engine import ProposalMergeEngine


class ProposalExporter:
    """Multi-format proposal export engine"""
    
    def __init__(self):
        self.merge_engine = ProposalMergeEngine()
    
    def export_html(self, document: ProposalDocument) -> str:
        """
        Export proposal as HTML.
        
        Args:
            document: Proposal document
            
        Returns:
            HTML content
        """
        metadata = {
            "agency": document.agency,
            "rfp_number": document.rfp_number,
            "status": "DRAFT",
            "generated_at": document.generated_at
        }
        
        return self.merge_engine.merge_volumes_to_html(document.volumes, metadata)
    
    def export_markdown(self, document: ProposalDocument) -> str:
        """
        Export proposal as Markdown.
        
        Args:
            document: Proposal document
            
        Returns:
            Markdown content
        """
        metadata = {
            "agency": document.agency,
            "rfp_number": document.rfp_number,
            "status": "DRAFT",
            "generated_at": document.generated_at
        }
        
        return self.merge_engine.merge_volumes_to_markdown(document.volumes, metadata)
    
    def export_json(self, document: ProposalDocument) -> str:
        """
        Export proposal as JSON.
        
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
                            "word_count": sec.word_count,
                            "risk_level": sec.risk_level
                        }
                        for sec in vol.sections
                    ]
                }
                for vol in document.volumes
            ],
            "metadata": document.metadata
        }
        
        return json.dumps(doc_dict, indent=2)
    
    def export_zip(self, package: ProposalPackage) -> bytes:
        """
        Export proposal package as ZIP bundle.
        
        Args:
            package: Complete proposal package
            
        Returns:
            ZIP file bytes
        """
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            html_content = self.export_html(package.document)
            zip_file.writestr(f"proposal_{package.package_id}.html", html_content)
            
            md_content = self.export_markdown(package.document)
            zip_file.writestr(f"proposal_{package.package_id}.md", md_content)
            
            json_content = self.export_json(package.document)
            zip_file.writestr(f"proposal_{package.package_id}.json", json_content)
            
            if package.compliance_matrix:
                compliance_json = json.dumps({
                    "matrix_id": package.compliance_matrix.matrix_id,
                    "requirements": package.compliance_matrix.requirements,
                    "compliance_summary": package.compliance_matrix.compliance_summary,
                    "overall_score": package.compliance_matrix.overall_score,
                    "generated_at": package.compliance_matrix.generated_at
                }, indent=2)
                zip_file.writestr("compliance_matrix.json", compliance_json)
            
            if package.risk_table:
                risk_json = json.dumps({
                    "risk_id": package.risk_table.risk_id,
                    "risks": package.risk_table.risks,
                    "overall_risk_level": package.risk_table.overall_risk_level,
                    "mitigation_strategies": package.risk_table.mitigation_strategies,
                    "generated_at": package.risk_table.generated_at
                }, indent=2)
                zip_file.writestr("risk_table.json", risk_json)
            
            if package.cost_breakdown:
                cost_json = json.dumps({
                    "cost_id": package.cost_breakdown.cost_id,
                    "labor_costs": package.cost_breakdown.labor_costs,
                    "odc_costs": package.cost_breakdown.odc_costs,
                    "travel_costs": package.cost_breakdown.travel_costs,
                    "total_cost": package.cost_breakdown.total_cost,
                    "cost_by_year": package.cost_breakdown.cost_by_year,
                    "cost_risk_level": package.cost_breakdown.cost_risk_level,
                    "generated_at": package.cost_breakdown.generated_at
                }, indent=2)
                zip_file.writestr("cost_breakdown.json", cost_json)
            
            readme_content = f"""# GhostQuant Proposal Package

**Package ID:** {package.package_id}
**Generated:** {package.created_at}
**Status:** {package.status}


- proposal_{package.package_id}.html - Full proposal in HTML format
- proposal_{package.package_id}.md - Full proposal in Markdown format
- proposal_{package.package_id}.json - Full proposal in JSON format
- compliance_matrix.json - Compliance matrix (if available)
- risk_table.json - Risk assessment table (if available)
- cost_breakdown.json - Cost breakdown (if available)


**Title:** {package.document.title}
**Agency:** {package.document.agency}
**RFP Number:** {package.document.rfp_number}
**Total Pages:** {package.document.total_pages}
**Total Words:** {package.document.total_words:,}
**Persona:** {package.document.persona}


{chr(10).join([f"{vol.volume_number}. {vol.volume_name} ({vol.total_words:,} words, ~{vol.page_estimate} pages)" for vol in package.document.volumes])}

---

Generated by GhostQuant Intelligence Systems
"""
            zip_file.writestr("README.md", readme_content)
        
        zip_buffer.seek(0)
        return zip_buffer.getvalue()
    
    def export_all(self, package: ProposalPackage) -> Dict[str, Any]:
        """
        Export proposal in all formats.
        
        Args:
            package: Complete proposal package
            
        Returns:
            Dictionary with all export formats
        """
        return {
            "html": self.export_html(package.document),
            "markdown": self.export_markdown(package.document),
            "json": self.export_json(package.document),
            "zip": self.export_zip(package)
        }

"""
RFP Generator Engine

Core engine for building and managing enterprise RFP proposals.
Implements 15 methods as specified in Task 8.22.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import hashlib
from . import rfp_templates
from .rfp_compliance_engine import RFPComplianceEngine
from .rfp_exporter import RFPExporter


class RFPGeneratorEngine:
    """
    RFP Generator Engine
    
    Core engine for generating complete RFP proposals with compliance tracking.
    """
    
    VERSION = "2.0.0"
    
    def __init__(self):
        """Initialize RFP generator engine"""
        self.compliance_engine = RFPComplianceEngine()
        self.exporter = RFPExporter()
        self.templates = {}
        self.load_default_templates()
        
    def load_default_templates(self) -> Dict[str, Any]:
        """
        Load default RFP templates.
        
        Returns:
            Dictionary of loaded templates
        """
        sections = rfp_templates.get_all_rfp_sections()
        
        for section in sections:
            section_name = section.get("section_name", "").lower().replace(" ", "_").replace("&", "and")
            self.templates[section_name] = section
            
        return {
            "loaded_count": len(self.templates),
            "sections": list(self.templates.keys())
        }
        
    def ingest_rfp_requirements(self, requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Ingest RFP requirements.
        
        Args:
            requirements: List of requirement dictionaries
            
        Returns:
            Ingestion results
        """
        validation = self.compliance_engine.validate_requirements(requirements)
        
        return {
            "ingested": validation.get("valid", False),
            "total_requirements": len(requirements),
            "mandatory_requirements": validation.get("mandatory_requirements", 0),
            "optional_requirements": validation.get("optional_requirements", 0),
            "validation_issues": validation.get("issues", [])
        }
        
    def generate_section_response(self, section_name: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate response for a specific section.
        
        Args:
            section_name: Name of section to generate
            context: Optional context data
            
        Returns:
            Section response
        """
        normalized_name = section_name.lower().replace(" ", "_").replace("&", "and")
        
        if normalized_name not in self.templates:
            return {
                "error": f"Section not found: {section_name}",
                "available_sections": list(self.templates.keys())
            }
            
        template = self.templates[normalized_name]
        
        section = {
            "section_name": template.get("section_name"),
            "section_number": template.get("section_number"),
            "content": template.get("content"),
            "word_count": template.get("word_count"),
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        if context:
            section["context"] = context
            
        return section
        
    def generate_full_proposal(self, rfp_id: str, agency: str, title: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate complete RFP proposal.
        
        Args:
            rfp_id: RFP identifier
            agency: Agency name
            title: Proposal title
            context: Optional context data
            
        Returns:
            Complete proposal
        """
        proposal_id = self._generate_proposal_id()
        
        sections = []
        for section_name in self.templates.keys():
            section = self.generate_section_response(section_name, context)
            if "error" not in section:
                sections.append(section)
                
        total_words = sum(s.get("word_count", 0) for s in sections)
        
        proposal = {
            "proposal_id": proposal_id,
            "rfp_id": rfp_id,
            "title": title,
            "agency": agency,
            "sections": sections,
            "metadata": {
                "generator_version": self.VERSION,
                "total_sections": len(sections),
                "total_words": total_words,
                "generated_at": datetime.utcnow().isoformat() + "Z"
            },
            "status": "draft",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        return proposal
        
    def build_compliance_matrix(self, requirements: List[Dict[str, Any]], responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Build compliance matrix.
        
        Args:
            requirements: List of requirements
            responses: List of responses
            
        Returns:
            Compliance matrix
        """
        return self.compliance_engine.generate_matrix(requirements, responses)
        
    def compute_compliance_score(self, requirements: List[Dict[str, Any]], responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute compliance score.
        
        Args:
            requirements: List of requirements
            responses: List of responses
            
        Returns:
            Compliance scores
        """
        return self.compliance_engine.score_requirements(requirements, responses)
        
    def generate_html(self, proposal: Dict[str, Any]) -> str:
        """
        Generate HTML export.
        
        Args:
            proposal: Proposal data
            
        Returns:
            HTML string
        """
        return self.exporter.export_html(proposal)
        
    def generate_markdown(self, proposal: Dict[str, Any]) -> str:
        """
        Generate Markdown export.
        
        Args:
            proposal: Proposal data
            
        Returns:
            Markdown string
        """
        return self.exporter.export_markdown(proposal)
        
    def generate_json(self, proposal: Dict[str, Any]) -> str:
        """
        Generate JSON export.
        
        Args:
            proposal: Proposal data
            
        Returns:
            JSON string
        """
        return self.exporter.export_json(proposal)
        
    def generate_zip_package(self, proposal: Dict[str, Any]) -> bytes:
        """
        Generate ZIP package (stdlib only).
        
        Args:
            proposal: Proposal data
            
        Returns:
            ZIP file as bytes
        """
        return self.exporter.export_zip(proposal)
        
    def summarize_proposal(self, proposal: Dict[str, Any]) -> str:
        """
        Generate 5-10 line summary of proposal.
        
        Args:
            proposal: Proposal data
            
        Returns:
            Summary text
        """
        sections = proposal.get("sections", [])
        metadata = proposal.get("metadata", {})
        
        summary_lines = [
            f"RFP Proposal: {proposal.get('title', 'Untitled')}",
            f"Agency: {proposal.get('agency', 'Unknown')}",
            f"Proposal ID: {proposal.get('proposal_id', 'N/A')}",
            f"Sections: {len(sections)} sections, {metadata.get('total_words', 0):,} words",
            f"Status: {proposal.get('status', 'draft').upper()}",
            f"Generated: {metadata.get('generated_at', 'N/A')}"
        ]
        
        if proposal.get("compliance_matrix"):
            matrix = proposal["compliance_matrix"]
            summary = matrix.get("summary", {})
            summary_lines.append(
                f"Compliance: {summary.get('compliance_percentage', 0):.1f}% ({summary.get('meets_count', 0)} MEETS, {summary.get('exceeds_count', 0)} EXCEEDS)"
            )
            
        return "\n".join(summary_lines)
        
    def compute_risk_rating(self, proposal: Dict[str, Any]) -> str:
        """
        Compute risk rating for proposal.
        
        Args:
            proposal: Proposal data
            
        Returns:
            Risk rating (low, medium, high, critical)
        """
        if not proposal.get("compliance_matrix"):
            return "medium"
            
        matrix = proposal["compliance_matrix"]
        return matrix.get("risk_level", "medium")
        
    def attach_supporting_docs(self, proposal: Dict[str, Any], documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Attach supporting documents to proposal.
        
        Args:
            proposal: Proposal data
            documents: List of document metadata
            
        Returns:
            Updated proposal
        """
        if "attachments" not in proposal:
            proposal["attachments"] = []
            
        for doc in documents:
            attachment = {
                "document_id": doc.get("id", ""),
                "filename": doc.get("filename", ""),
                "file_type": doc.get("type", ""),
                "size_bytes": doc.get("size", 0),
                "attached_at": datetime.utcnow().isoformat() + "Z"
            }
            proposal["attachments"].append(attachment)
            
        proposal["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        return proposal
        
    def get_history(self, proposal_id: str) -> List[Dict[str, Any]]:
        """
        Get proposal history.
        
        Args:
            proposal_id: Proposal identifier
            
        Returns:
            List of history entries
        """
        return [
            {
                "proposal_id": proposal_id,
                "event": "created",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "user": "system"
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
            "version": self.VERSION,
            "templates_loaded": len(self.templates),
            "available_sections": list(self.templates.keys()),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    def _generate_proposal_id(self) -> str:
        """
        Generate unique proposal ID.
        
        Returns:
            Proposal ID
        """
        timestamp = datetime.utcnow().isoformat()
        hash_input = f"GQ-RFP-{timestamp}".encode()
        hash_hex = hashlib.sha256(hash_input).hexdigest()[:16].upper()
        
        return f"PROP-{hash_hex}"

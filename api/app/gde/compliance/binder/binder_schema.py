"""
GhostQuant™ — Regulatory Audit Binder Generator
Module: binder_schema.py
Purpose: Schema definitions for audit binder structure

SECURITY NOTICE:
- NO sensitive information in binders
- Only metadata, policies, architecture, controls
- All content is read-only documentation
- PDF-ready structure (no actual PDF generation)
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
import json


@dataclass
class BinderSection:
    """
    Represents a section in the audit binder.
    
    Attributes:
        id: Unique section identifier
        title: Section title
        content: Section content (Markdown format)
        order: Section order number (for sorting)
        generated_at: Timestamp when section was generated
        subsections: Optional nested subsections
        metadata: Additional section metadata
    """
    id: str
    title: str
    content: str
    order: int
    generated_at: datetime = field(default_factory=datetime.utcnow)
    subsections: List['BinderSection'] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert section to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "order": self.order,
            "generated_at": self.generated_at.isoformat(),
            "subsections": [sub.to_dict() for sub in self.subsections],
            "metadata": self.metadata
        }
    
    def to_markdown(self) -> str:
        """Convert section to Markdown format"""
        lines = []
        
        lines.append(f"# {self.title}\n")
        lines.append(f"**Section ID**: {self.id}\n")
        lines.append(f"**Order**: {self.order}\n")
        lines.append(f"**Generated**: {self.generated_at.isoformat()}\n")
        lines.append("\n---\n")
        
        lines.append(self.content)
        
        if self.subsections:
            lines.append("\n\n## Subsections\n")
            for subsection in self.subsections:
                lines.append(f"\n### {subsection.title}\n")
                lines.append(subsection.content)
        
        return "\n".join(lines)
    
    def get_filename(self) -> str:
        """Get filename for this section"""
        safe_title = self.title.lower().replace(" ", "_").replace("/", "_")
        safe_title = "".join(c for c in safe_title if c.isalnum() or c == "_")
        return f"{self.order:02d}_{safe_title}.md"


@dataclass
class BinderAttachment:
    """
    Represents an attachment in the audit binder.
    
    Attributes:
        filename: Attachment filename
        description: Attachment description
        content: Attachment content
        attachment_type: Type of attachment (json, md, txt)
        generated_at: Timestamp when attachment was generated
        metadata: Additional attachment metadata
    """
    filename: str
    description: str
    content: str
    attachment_type: str  # "json", "md", "txt"
    generated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert attachment to dictionary"""
        return {
            "filename": self.filename,
            "description": self.description,
            "attachment_type": self.attachment_type,
            "generated_at": self.generated_at.isoformat(),
            "metadata": self.metadata,
            "content_length": len(self.content)
        }
    
    def get_file_extension(self) -> str:
        """Get file extension based on attachment type"""
        extensions = {
            "json": ".json",
            "md": ".md",
            "txt": ".txt"
        }
        return extensions.get(self.attachment_type, ".txt")
    
    def get_full_filename(self) -> str:
        """Get full filename with extension"""
        if not self.filename.endswith(self.get_file_extension()):
            return f"{self.filename}{self.get_file_extension()}"
        return self.filename


@dataclass
class AuditBinder:
    """
    Represents a complete audit binder.
    
    Attributes:
        binder_id: Unique binder identifier
        name: Binder name
        sections: List of binder sections
        attachments: List of binder attachments
        generated_at: Timestamp when binder was generated
        metadata: Additional binder metadata
    """
    binder_id: str
    name: str
    sections: List[BinderSection] = field(default_factory=list)
    attachments: List[BinderAttachment] = field(default_factory=list)
    generated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert binder to dictionary"""
        return {
            "binder_id": self.binder_id,
            "name": self.name,
            "sections": [section.to_dict() for section in self.sections],
            "attachments": [attachment.to_dict() for attachment in self.attachments],
            "generated_at": self.generated_at.isoformat(),
            "metadata": self.metadata,
            "section_count": len(self.sections),
            "attachment_count": len(self.attachments)
        }
    
    def to_json(self) -> str:
        """Convert binder to JSON string"""
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False)
    
    def get_section_count(self) -> int:
        """Get total number of sections"""
        return len(self.sections)
    
    def get_attachment_count(self) -> int:
        """Get total number of attachments"""
        return len(self.attachments)
    
    def get_section_by_id(self, section_id: str) -> Optional[BinderSection]:
        """Get section by ID"""
        for section in self.sections:
            if section.id == section_id:
                return section
        return None
    
    def get_attachment_by_filename(self, filename: str) -> Optional[BinderAttachment]:
        """Get attachment by filename"""
        for attachment in self.attachments:
            if attachment.filename == filename or attachment.get_full_filename() == filename:
                return attachment
        return None
    
    def add_section(self, section: BinderSection) -> None:
        """Add a section to the binder"""
        self.sections.append(section)
        self.sections.sort(key=lambda s: s.order)
    
    def add_attachment(self, attachment: BinderAttachment) -> None:
        """Add an attachment to the binder"""
        self.attachments.append(attachment)


@dataclass
class BinderExportResult:
    """
    Represents the result of a binder export operation.
    
    Attributes:
        success: Whether export was successful
        directory: Export directory path
        files: List of exported file paths
        error: Error message if export failed
        binder_id: ID of exported binder
        exported_at: Timestamp when export completed
        metadata: Additional export metadata
    """
    success: bool
    directory: str
    files: List[str] = field(default_factory=list)
    error: Optional[str] = None
    binder_id: str = ""
    exported_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert export result to dictionary"""
        return {
            "success": self.success,
            "directory": self.directory,
            "files": self.files,
            "error": self.error,
            "binder_id": self.binder_id,
            "exported_at": self.exported_at.isoformat(),
            "file_count": len(self.files),
            "metadata": self.metadata
        }
    
    def get_file_count(self) -> int:
        """Get number of exported files"""
        return len(self.files)


BINDER_SECTION_TYPES = {
    "COVER_PAGE": {
        "id": "cover_page",
        "title": "Cover Page",
        "order": 1,
        "description": "Audit binder cover page with metadata"
    },
    "TABLE_OF_CONTENTS": {
        "id": "table_of_contents",
        "title": "Table of Contents",
        "order": 2,
        "description": "Complete table of contents for audit binder"
    },
    "CJIS": {
        "id": "cjis_compliance",
        "title": "CJIS Security Policy Compliance",
        "order": 3,
        "description": "Criminal Justice Information Services compliance documentation"
    },
    "NIST": {
        "id": "nist_controls",
        "title": "NIST 800-53 Security Controls",
        "order": 4,
        "description": "NIST 800-53 Rev 5 security controls implementation"
    },
    "SOC2": {
        "id": "soc2_compliance",
        "title": "SOC 2 Type II Compliance",
        "order": 5,
        "description": "Service Organization Control 2 compliance documentation"
    },
    "FEDRAMP": {
        "id": "fedramp_compliance",
        "title": "FedRAMP LITE Compliance",
        "order": 6,
        "description": "Federal Risk and Authorization Management Program compliance"
    },
    "AML_KYC": {
        "id": "aml_kyc_compliance",
        "title": "AML/KYC Compliance Framework",
        "order": 7,
        "description": "Anti-Money Laundering and Know Your Customer compliance"
    },
    "DATA_GOVERNANCE": {
        "id": "data_governance",
        "title": "Data Governance & Privacy",
        "order": 8,
        "description": "Data governance and privacy compliance framework"
    },
    "INCIDENT_RESPONSE": {
        "id": "incident_response",
        "title": "Incident Response Framework",
        "order": 9,
        "description": "Incident response and forensics procedures"
    },
    "AUDIT_LOGGING": {
        "id": "audit_logging",
        "title": "Audit Logging & Monitoring",
        "order": 10,
        "description": "Comprehensive audit logging and monitoring framework"
    },
    "ZERO_TRUST": {
        "id": "zero_trust",
        "title": "Zero-Trust Access Control",
        "order": 11,
        "description": "Zero-trust security architecture and access control"
    },
    "PRIVACY": {
        "id": "privacy_shield",
        "title": "Privacy Shield & Data Minimization",
        "order": 12,
        "description": "Privacy protection and data minimization framework"
    },
    "SSDLC": {
        "id": "ssdlc",
        "title": "Secure Software Development Lifecycle",
        "order": 13,
        "description": "Secure SDLC practices and compliance"
    },
    "KEY_MANAGEMENT": {
        "id": "key_management",
        "title": "Key Management & Secrets Governance",
        "order": 14,
        "description": "Cryptographic key management and secrets governance"
    },
    "ENVIRONMENT_ISOLATION": {
        "id": "environment_isolation",
        "title": "Environment Isolation & Boundaries",
        "order": 15,
        "description": "Environment isolation and boundary enforcement"
    }
}


ATTACHMENT_TYPES = {
    "COMPLIANCE_DOCUMENT": "compliance_document",
    "EVIDENCE": "evidence",
    "POLICY": "policy",
    "PROCEDURE": "procedure",
    "DIAGRAM": "diagram",
    "REPORT": "report",
    "METADATA": "metadata"
}

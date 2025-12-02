"""
GhostQuant™ — Full Compliance Documentation Exporter System
Module: exporter_schema.py
Purpose: Define dataclasses for compliance document structure

SECURITY NOTICE:
- NO sensitive information allowed in exports
- Only metadata, policies, architecture, controls
- All exports are read-only documentation
- Compliant with NIST 800-53, SOC 2, FedRAMP, CJIS, AML/KYC
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum


class DocumentType(str, Enum):
    """Compliance document types"""
    CJIS = "cjis"
    NIST = "nist"
    SOC2 = "soc2"
    FEDRAMP = "fedramp"
    AML_KYC = "aml"
    DATA_GOVERNANCE = "datagov"
    INCIDENT_RESPONSE = "ir"
    AUDIT_LOGGING = "audit"
    ZERO_TRUST = "zerotrust"
    PRIVACY = "privacy"
    SSDLC = "ssdlc"
    KEY_MANAGEMENT = "keymgmt"
    ENVIRONMENT_ISOLATION = "isolation"
    CONFIGURATION_MANAGEMENT = "configmgmt"


class ExportFormat(str, Enum):
    """Export format types"""
    JSON = "json"
    MARKDOWN = "markdown"
    TEXT = "text"


@dataclass
class ComplianceSection:
    """
    Single section within a compliance document.
    
    Represents a logical section of documentation such as:
    - Overview
    - Architecture
    - Controls
    - Policies
    - Procedures
    
    Attributes:
        id: Unique section identifier
        title: Section title
        content: Section content (markdown-formatted)
        generated_at: Timestamp when section was generated
        subsections: Optional nested subsections
        metadata: Additional metadata for the section
    """
    id: str
    title: str
    content: str
    generated_at: datetime = field(default_factory=datetime.utcnow)
    subsections: List['ComplianceSection'] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "generated_at": self.generated_at.isoformat(),
            "subsections": [sub.to_dict() for sub in self.subsections],
            "metadata": self.metadata
        }
    
    def to_markdown(self, level: int = 2) -> str:
        """Convert to markdown format"""
        md = f"{'#' * level} {self.title}\n\n"
        md += f"{self.content}\n\n"
        
        for subsection in self.subsections:
            md += subsection.to_markdown(level + 1)
        
        return md
    
    def to_text(self, level: int = 0) -> str:
        """Convert to plain text format"""
        indent = "  " * level
        text = f"{indent}{self.title}\n"
        text += f"{indent}{'=' * len(self.title)}\n\n"
        
        for line in self.content.split('\n'):
            if line.strip():
                text += f"{indent}{line}\n"
        text += "\n"
        
        for subsection in self.subsections:
            text += subsection.to_text(level + 1)
        
        return text


@dataclass
class ComplianceDocument:
    """
    Complete compliance document.
    
    Represents a full compliance document ready for export,
    containing multiple sections organized hierarchically.
    
    Attributes:
        doc_id: Unique document identifier
        name: Human-readable document name
        sections: List of document sections
        generated_at: Timestamp when document was generated
        doc_type: Type of compliance document
        version: Document version
        author: Document author/generator
        description: Document description
        compliance_frameworks: Applicable compliance frameworks
        metadata: Additional document metadata
    """
    doc_id: str
    name: str
    sections: List[ComplianceSection]
    generated_at: datetime
    doc_type: DocumentType
    version: str = "1.0.0"
    author: str = "GhostQuant™ Compliance System"
    description: str = ""
    compliance_frameworks: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "doc_id": self.doc_id,
            "name": self.name,
            "sections": [section.to_dict() for section in self.sections],
            "generated_at": self.generated_at.isoformat(),
            "doc_type": self.doc_type.value,
            "version": self.version,
            "author": self.author,
            "description": self.description,
            "compliance_frameworks": self.compliance_frameworks,
            "metadata": self.metadata
        }
    
    def to_markdown(self) -> str:
        """Convert to markdown format"""
        md = f"# {self.name}\n\n"
        md += f"**Document ID:** {self.doc_id}\n\n"
        md += f"**Type:** {self.doc_type.value}\n\n"
        md += f"**Version:** {self.version}\n\n"
        md += f"**Generated:** {self.generated_at.isoformat()}\n\n"
        md += f"**Author:** {self.author}\n\n"
        
        if self.description:
            md += f"## Description\n\n{self.description}\n\n"
        
        if self.compliance_frameworks:
            md += f"## Compliance Frameworks\n\n"
            for framework in self.compliance_frameworks:
                md += f"- {framework}\n"
            md += "\n"
        
        md += "---\n\n"
        
        for section in self.sections:
            md += section.to_markdown(level=2)
        
        return md
    
    def to_text(self) -> str:
        """Convert to plain text format"""
        text = f"{self.name}\n"
        text += f"{'=' * len(self.name)}\n\n"
        text += f"Document ID: {self.doc_id}\n"
        text += f"Type: {self.doc_type.value}\n"
        text += f"Version: {self.version}\n"
        text += f"Generated: {self.generated_at.isoformat()}\n"
        text += f"Author: {self.author}\n\n"
        
        if self.description:
            text += f"Description:\n{self.description}\n\n"
        
        if self.compliance_frameworks:
            text += f"Compliance Frameworks:\n"
            for framework in self.compliance_frameworks:
                text += f"  - {framework}\n"
            text += "\n"
        
        text += "-" * 80 + "\n\n"
        
        for section in self.sections:
            text += section.to_text(level=0)
        
        return text
    
    def get_section_count(self) -> int:
        """Get total number of sections (including subsections)"""
        count = len(self.sections)
        for section in self.sections:
            count += len(section.subsections)
        return count


@dataclass
class ComplianceExportResult:
    """
    Result of a compliance document export operation.
    
    Attributes:
        success: Whether export was successful
        file_path: Path to exported file
        format: Export format used
        error: Error message if export failed
        doc_id: Document ID that was exported
        doc_type: Document type that was exported
        file_size: Size of exported file in bytes
        exported_at: Timestamp when export completed
    """
    success: bool
    file_path: str
    format: ExportFormat
    error: Optional[str] = None
    doc_id: str = ""
    doc_type: str = ""
    file_size: int = 0
    exported_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "success": self.success,
            "file_path": self.file_path,
            "format": self.format.value,
            "error": self.error,
            "doc_id": self.doc_id,
            "doc_type": self.doc_type,
            "file_size": self.file_size,
            "exported_at": self.exported_at.isoformat()
        }


@dataclass
class ExportManifest:
    """
    Manifest of all exported documents.
    
    Tracks all exports for a given session or time period.
    
    Attributes:
        exports: List of export results
        created_at: Timestamp when manifest was created
        total_exports: Total number of exports
        successful_exports: Number of successful exports
        failed_exports: Number of failed exports
    """
    exports: List[ComplianceExportResult] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    total_exports: int = 0
    successful_exports: int = 0
    failed_exports: int = 0
    
    def add_export(self, result: ComplianceExportResult) -> None:
        """Add an export result to the manifest"""
        self.exports.append(result)
        self.total_exports += 1
        if result.success:
            self.successful_exports += 1
        else:
            self.failed_exports += 1
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "exports": [export.to_dict() for export in self.exports],
            "created_at": self.created_at.isoformat(),
            "total_exports": self.total_exports,
            "successful_exports": self.successful_exports,
            "failed_exports": self.failed_exports
        }


DOCUMENT_TYPE_METADATA = {
    DocumentType.CJIS: {
        "name": "CJIS Security Policy Compliance",
        "description": "Criminal Justice Information Services Security Policy compliance documentation",
        "frameworks": ["CJIS Security Policy v5.9"],
        "sections_count": 12
    },
    DocumentType.NIST: {
        "name": "NIST 800-53 Security Controls Matrix",
        "description": "National Institute of Standards and Technology security controls implementation",
        "frameworks": ["NIST 800-53 Rev 5"],
        "sections_count": 15
    },
    DocumentType.SOC2: {
        "name": "SOC 2 Type II Architecture",
        "description": "Service Organization Control 2 compliance architecture and controls",
        "frameworks": ["SOC 2 Type II"],
        "sections_count": 10
    },
    DocumentType.FEDRAMP: {
        "name": "FedRAMP LITE Roadmap",
        "description": "Federal Risk and Authorization Management Program compliance roadmap",
        "frameworks": ["FedRAMP LITE"],
        "sections_count": 12
    },
    DocumentType.AML_KYC: {
        "name": "AML/KYC Compliance Framework",
        "description": "Anti-Money Laundering and Know Your Customer compliance documentation",
        "frameworks": ["FinCEN", "Bank Secrecy Act", "FATF"],
        "sections_count": 14
    },
    DocumentType.DATA_GOVERNANCE: {
        "name": "Data Governance & Privacy Framework",
        "description": "Comprehensive data governance and privacy compliance documentation",
        "frameworks": ["GDPR", "CCPA", "NIST Privacy Framework"],
        "sections_count": 13
    },
    DocumentType.INCIDENT_RESPONSE: {
        "name": "Incident Response & Forensics Framework",
        "description": "Incident response, threat monitoring, and forensic evidence procedures",
        "frameworks": ["NIST 800-61", "ISO 27035"],
        "sections_count": 11
    },
    DocumentType.AUDIT_LOGGING: {
        "name": "Audit Logging & Monitoring Framework",
        "description": "Comprehensive audit logging and monitoring compliance documentation",
        "frameworks": ["NIST 800-53 AU", "SOC 2 CC7"],
        "sections_count": 10
    },
    DocumentType.ZERO_TRUST: {
        "name": "Zero-Trust Access Control Framework",
        "description": "Identity, access control, and zero-trust security architecture",
        "frameworks": ["NIST Zero Trust", "NIST 800-207"],
        "sections_count": 12
    },
    DocumentType.PRIVACY: {
        "name": "Privacy Shield & Data Minimization",
        "description": "Privacy protection and data minimization compliance framework",
        "frameworks": ["GDPR", "CCPA", "Privacy Shield"],
        "sections_count": 11
    },
    DocumentType.SSDLC: {
        "name": "Secure Software Development Lifecycle",
        "description": "Secure SDLC practices and compliance documentation",
        "frameworks": ["NIST 800-218", "OWASP SAMM", "ISO 27034"],
        "sections_count": 13
    },
    DocumentType.KEY_MANAGEMENT: {
        "name": "Key Management & Secrets Governance",
        "description": "Cryptographic key management and secrets governance framework",
        "frameworks": ["NIST 800-57", "FIPS 140-2"],
        "sections_count": 10
    },
    DocumentType.ENVIRONMENT_ISOLATION: {
        "name": "Environment Isolation & Boundaries",
        "description": "Environment isolation and boundary enforcement documentation",
        "frameworks": ["NIST 800-53 CM-7", "SOC 2 CC6"],
        "sections_count": 9
    },
    DocumentType.CONFIGURATION_MANAGEMENT: {
        "name": "Configuration Management & Hardening",
        "description": "Secure configuration management and system hardening standards",
        "frameworks": ["NIST 800-53 CM-2/CM-6", "CIS Benchmarks"],
        "sections_count": 11
    }
}

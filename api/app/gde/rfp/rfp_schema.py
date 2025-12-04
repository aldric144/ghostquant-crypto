"""
RFP Schema Definitions

Dataclasses for RFP document structure, sections, metadata, and exports.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime


@dataclass
class RFPSection:
    """Individual RFP section with content and metadata"""
    name: str
    title: str
    content: str
    word_count: int
    subsections: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'title': self.title,
            'content': self.content,
            'word_count': self.word_count,
            'subsections': self.subsections,
            'metadata': self.metadata
        }


@dataclass
class RFPMetadata:
    """RFP document metadata"""
    generated_at: str
    generator_version: str
    document_id: str
    agency: str
    solicitation_number: str
    response_deadline: str
    contractor: str
    total_sections: int
    total_words: int
    compliance_frameworks: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'generated_at': self.generated_at,
            'generator_version': self.generator_version,
            'document_id': self.document_id,
            'agency': self.agency,
            'solicitation_number': self.solicitation_number,
            'response_deadline': self.response_deadline,
            'contractor': self.contractor,
            'total_sections': self.total_sections,
            'total_words': self.total_words,
            'compliance_frameworks': self.compliance_frameworks
        }


@dataclass
class RFPDocument:
    """Complete RFP response document"""
    metadata: RFPMetadata
    sections: List[RFPSection]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'metadata': self.metadata.to_dict(),
            'sections': [section.to_dict() for section in self.sections]
        }
    
    def get_section(self, name: str) -> Optional[RFPSection]:
        """Get section by name"""
        for section in self.sections:
            if section.name == name:
                return section
        return None
    
    def total_word_count(self) -> int:
        """Calculate total word count across all sections"""
        return sum(section.word_count for section in self.sections)


@dataclass
class RFPExport:
    """RFP export in various formats"""
    json_content: str
    markdown_content: str
    html_content: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'json': self.json_content,
            'markdown': self.markdown_content,
            'html': self.html_content
        }

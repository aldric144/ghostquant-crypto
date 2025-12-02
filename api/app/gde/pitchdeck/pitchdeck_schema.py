"""
Pitch Deck Schema

Dataclass definitions for pitch deck generation.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime


@dataclass
class DeckSlide:
    """
    Individual slide in a pitch deck
    
    Attributes:
        title: Slide title
        subtitle: Slide subtitle
        bullets: List of bullet points
        narrative: Full narrative text (200-600 words)
        visuals: List of visual placeholder names
        risk_flags: List of risk flags for this slide
        confidence: Confidence score (0.0-1.0)
        metadata: Additional metadata
    """
    title: str
    subtitle: str
    bullets: List[str]
    narrative: str
    visuals: List[str]
    risk_flags: List[str] = field(default_factory=list)
    confidence: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'title': self.title,
            'subtitle': self.subtitle,
            'bullets': self.bullets,
            'narrative': self.narrative,
            'visuals': self.visuals,
            'risk_flags': self.risk_flags,
            'confidence': self.confidence,
            'metadata': self.metadata
        }


@dataclass
class DeckSection:
    """
    Section grouping multiple slides
    
    Attributes:
        name: Section name
        slides: List of slides in this section
        description: Section description
    """
    name: str
    slides: List[DeckSlide]
    description: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'description': self.description,
            'slides': [slide.to_dict() for slide in self.slides],
            'slide_count': len(self.slides)
        }


@dataclass
class DeckMetadata:
    """
    Metadata for a pitch deck
    
    Attributes:
        deck_type: Type of deck (investor, government, custom)
        company_name: Company/agency name
        generated_at: Generation timestamp
        slide_count: Total number of slides
        section_count: Total number of sections
        version: Deck version
        author: Deck author
        tags: List of tags
        compliance_badges: List of compliance badges
    """
    deck_type: str
    company_name: str
    generated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    slide_count: int = 0
    section_count: int = 0
    version: str = "1.0.0"
    author: str = "GhostQuant Pitch Deck Generator™"
    tags: List[str] = field(default_factory=list)
    compliance_badges: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'deck_type': self.deck_type,
            'company_name': self.company_name,
            'generated_at': self.generated_at,
            'slide_count': self.slide_count,
            'section_count': self.section_count,
            'version': self.version,
            'author': self.author,
            'tags': self.tags,
            'compliance_badges': self.compliance_badges
        }


@dataclass
class InvestorDeck:
    """
    Investor-grade pitch deck
    
    Attributes:
        metadata: Deck metadata
        sections: List of deck sections
        executive_summary: Executive summary
        table_of_contents: Table of contents
    """
    metadata: DeckMetadata
    sections: List[DeckSection]
    executive_summary: str = ""
    table_of_contents: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'metadata': self.metadata.to_dict(),
            'sections': [section.to_dict() for section in self.sections],
            'executive_summary': self.executive_summary,
            'table_of_contents': self.table_of_contents,
            'total_slides': sum(len(section.slides) for section in self.sections)
        }
    
    def get_all_slides(self) -> List[DeckSlide]:
        """Get all slides from all sections"""
        slides = []
        for section in self.sections:
            slides.extend(section.slides)
        return slides


@dataclass
class GovernmentDeck:
    """
    Government-grade pitch deck
    
    Attributes:
        metadata: Deck metadata
        sections: List of deck sections
        executive_summary: Executive summary
        table_of_contents: Table of contents
        classification: Classification level
        clearance_required: Required clearance level
    """
    metadata: DeckMetadata
    sections: List[DeckSection]
    executive_summary: str = ""
    table_of_contents: List[str] = field(default_factory=list)
    classification: str = "UNCLASSIFIED"
    clearance_required: str = "None"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'metadata': self.metadata.to_dict(),
            'sections': [section.to_dict() for section in self.sections],
            'executive_summary': self.executive_summary,
            'table_of_contents': self.table_of_contents,
            'classification': self.classification,
            'clearance_required': self.clearance_required,
            'total_slides': sum(len(section.slides) for section in self.sections)
        }
    
    def get_all_slides(self) -> List[DeckSlide]:
        """Get all slides from all sections"""
        slides = []
        for section in self.sections:
            slides.extend(section.slides)
        return slides


@dataclass
class DeckExportPackage:
    """
    Complete export package with multiple formats
    
    Attributes:
        deck_json: JSON representation
        deck_markdown: Markdown representation
        deck_html: HTML representation
        metadata: Deck metadata
        table_of_contents: Table of contents
        summary: Executive summary
    """
    deck_json: Dict[str, Any]
    deck_markdown: str
    deck_html: str
    metadata: DeckMetadata
    table_of_contents: List[str]
    summary: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'deck_json': self.deck_json,
            'deck_markdown': self.deck_markdown,
            'deck_html': self.deck_html,
            'metadata': self.metadata.to_dict(),
            'table_of_contents': self.table_of_contents,
            'summary': self.summary
        }

"""
GhostQuant Pitch Deck Generator™

Automatically generates investor-grade and government-grade pitch decks
in JSON, Markdown, and HTML formats.

Features:
- Investor deck generation (15-20 slides)
- Government deck generation (20-30 slides)
- Custom deck assembly
- JSON/Markdown/HTML export
- Visual placeholders
- Narrative generation
- Risk flag detection
- Compliance badges
"""

from .pitchdeck_schema import (
    DeckSlide,
    DeckSection,
    DeckMetadata,
    InvestorDeck,
    GovernmentDeck,
    DeckExportPackage
)
from .pitchdeck_templates import (
    INVESTOR_TEMPLATES,
    GOVERNMENT_TEMPLATES,
    get_investor_template,
    get_government_template
)
from .pitchdeck_engine import PitchDeckEngine

__all__ = [
    'DeckSlide',
    'DeckSection',
    'DeckMetadata',
    'InvestorDeck',
    'GovernmentDeck',
    'DeckExportPackage',
    'INVESTOR_TEMPLATES',
    'GOVERNMENT_TEMPLATES',
    'get_investor_template',
    'get_government_template',
    'PitchDeckEngine'
]

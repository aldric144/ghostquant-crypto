"""
GhostQuant Government RFP Pack Generator™

Automated system for generating complete Government RFP Response Packages
formatted for DHS, DOJ, FBI, Treasury, SEC, DoD, Interpol, and EU procurement.

Produces:
- Complete RFP response with 9 sections
- Executive summary
- Technical volume
- Management volume
- Past performance volume
- Compliance matrices (CJIS, NIST, SOC2, FedRAMP)
- Pricing volume
- Integration volume
- Appendices
- Required forms
- PDF-ready exports (JSON, Markdown, HTML)
"""

from .rfp_schema import RFPSection, RFPDocument, RFPMetadata, RFPExport
from .rfp_engine import RFPGenerator

__all__ = [
    'RFPSection',
    'RFPDocument',
    'RFPMetadata',
    'RFPExport',
    'RFPGenerator'
]

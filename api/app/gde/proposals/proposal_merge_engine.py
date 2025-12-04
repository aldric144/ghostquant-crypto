"""
Proposal Merge Engine

Assembles 40-120 page unified document (HTML + Markdown).
"""

from typing import List, Dict, Any
from datetime import datetime
from .proposal_schema import ProposalVolume, ProposalDocument


class ProposalMergeEngine:
    """Engine for merging proposal volumes into unified documents"""
    
    def __init__(self):
        self.page_break_marker = "\n\n---PAGE BREAK---\n\n"
    
    def merge_volumes_to_markdown(self, volumes: List[ProposalVolume], 
                                  metadata: Dict[str, Any] = None) -> str:
        """
        Merge all volumes into unified Markdown document.
        
        Args:
            volumes: List of proposal volumes
            metadata: Document metadata
            
        Returns:
            Complete Markdown document (40-120 pages)
        """
        parts = []
        
        parts.append(self._generate_title_page_markdown(metadata or {}))
        parts.append(self.page_break_marker)
        
        parts.append(self._generate_toc_markdown(volumes))
        parts.append(self.page_break_marker)
        
        for volume in volumes:
            parts.append(self._format_volume_markdown(volume))
            parts.append(self.page_break_marker)
        
        return "\n".join(parts)
    
    def merge_volumes_to_html(self, volumes: List[ProposalVolume], 
                             metadata: Dict[str, Any] = None) -> str:
        """
        Merge all volumes into unified HTML document.
        
        Args:
            volumes: List of proposal volumes
            metadata: Document metadata
            
        Returns:
            Complete HTML document (40-120 pages)
        """
        parts = []
        
        parts.append(self._generate_html_header(metadata or {}))
        
        parts.append(self._generate_title_page_html(metadata or {}))
        parts.append('<div class="page-break"></div>')
        
        parts.append(self._generate_toc_html(volumes))
        parts.append('<div class="page-break"></div>')
        
        for volume in volumes:
            parts.append(self._format_volume_html(volume))
            parts.append('<div class="page-break"></div>')
        
        parts.append(self._generate_html_footer())
        
        return "\n".join(parts)
    
    def _generate_title_page_markdown(self, metadata: Dict[str, Any]) -> str:
        """Generate title page in Markdown"""
        return f"""# GhostQuant Intelligence Systems


**Agency:** {metadata.get('agency', 'Federal Agency')}  
**RFP Number:** {metadata.get('rfp_number', 'N/A')}  
**Date:** {datetime.utcnow().strftime('%B %d, %Y')}  
**Status:** {metadata.get('status', 'DRAFT')}

---

**Submitted by:**  
GhostQuant Intelligence Systems  
1234 Intelligence Way  
Washington, DC 20001  
Phone: (202) 555-0100  
Email: proposals@ghostquant.com

**Point of Contact:**  
Sarah Chen, Program Manager  
Phone: (202) 555-0101  
Email: schen@ghostquant.com
"""
    
    def _generate_toc_markdown(self, volumes: List[ProposalVolume]) -> str:
        """Generate table of contents in Markdown"""
        toc_parts = ["# Table of Contents\n"]
        
        for volume in volumes:
            toc_parts.append(f"{volume.volume_number}. {volume.volume_name} (Page {volume.volume_number * 10})")
            toc_parts.append(f"   - {volume.total_words:,} words, ~{volume.page_estimate} pages\n")
        
        return "\n".join(toc_parts)
    
    def _format_volume_markdown(self, volume: ProposalVolume) -> str:
        """Format volume in Markdown"""
        parts = [f"# Volume {volume.volume_number}: {volume.volume_name}\n"]
        
        for section in volume.sections:
            parts.append(section.content)
            parts.append("\n")
        
        return "\n".join(parts)
    
    def _generate_html_header(self, metadata: Dict[str, Any]) -> str:
        """Generate HTML header with styles"""
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GhostQuant Proposal</title>
    <style>
        @page {
            size: letter;
            margin: 1in;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            color: #059669;
            font-size: 2.5em;
            border-bottom: 4px solid #059669;
            padding-bottom: 15px;
            margin-top: 40px;
        }
        
        h2 {
            color: #0891b2;
            font-size: 2em;
            margin-top: 30px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        
        h3 {
            color: #334155;
            font-size: 1.5em;
            margin-top: 25px;
        }
        
        .title-page {
            text-align: center;
            padding: 100px 0;
        }
        
        .metadata {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
            padding: 30px;
            border-left: 6px solid #059669;
            margin: 30px 0;
            border-radius: 8px;
        }
        
        .metadata p {
            margin: 10px 0;
            font-size: 1.1em;
        }
        
        .volume {
            margin-top: 60px;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .toc {
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .toc-item {
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        @media print {
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>"""
    
    def _generate_title_page_html(self, metadata: Dict[str, Any]) -> str:
        """Generate title page in HTML"""
        return f"""
<div class="title-page">
    <h1>GhostQuant Intelligence Systems</h1>
    <h2>Proposal for Cryptocurrency Intelligence Platform</h2>
    
    <div class="metadata">
        <p><strong>Agency:</strong> {metadata.get('agency', 'Federal Agency')}</p>
        <p><strong>RFP Number:</strong> {metadata.get('rfp_number', 'N/A')}</p>
        <p><strong>Date:</strong> {datetime.utcnow().strftime('%B %d, %Y')}</p>
        <p><strong>Status:</strong> {metadata.get('status', 'DRAFT')}</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p><strong>Submitted by:</strong></p>
        <p>GhostQuant Intelligence Systems<br>
        1234 Intelligence Way<br>
        Washington, DC 20001<br>
        Phone: (202) 555-0100<br>
        Email: proposals@ghostquant.com</p>
    </div>
    
    <div style="margin-top: 30px;">
        <p><strong>Point of Contact:</strong></p>
        <p>Sarah Chen, Program Manager<br>
        Phone: (202) 555-0101<br>
        Email: schen@ghostquant.com</p>
    </div>
</div>
"""
    
    def _generate_toc_html(self, volumes: List[ProposalVolume]) -> str:
        """Generate table of contents in HTML"""
        toc_items = []
        
        for volume in volumes:
            toc_items.append(f"""
<div class="toc-item">
    <strong>{volume.volume_number}. {volume.volume_name}</strong> (Page {volume.volume_number * 10})<br>
    <span style="color: #64748b;">{volume.total_words:,} words, ~{volume.page_estimate} pages</span>
</div>
""")
        
        return f"""
<div class="toc">
    <h1>Table of Contents</h1>
    {''.join(toc_items)}
</div>
"""
    
    def _format_volume_html(self, volume: ProposalVolume) -> str:
        """Format volume in HTML"""
        parts = [f'<div class="volume">']
        parts.append(f'<h1>Volume {volume.volume_number}: {volume.volume_name}</h1>')
        
        for section in volume.sections:
            content_html = self._markdown_to_html(section.content)
            parts.append(content_html)
        
        parts.append('</div>')
        
        return "\n".join(parts)
    
    def _markdown_to_html(self, markdown: str) -> str:
        """Convert Markdown to HTML (basic conversion)"""
        html = markdown
        
        html = html.replace("### ", "<h3>").replace("\n", "</h3>\n", 1)
        html = html.replace("## ", "<h2>").replace("\n", "</h2>\n", 1)
        html = html.replace("# ", "<h1>").replace("\n", "</h1>\n", 1)
        
        paragraphs = html.split("\n\n")
        html = "".join([f"<p>{p}</p>\n" if not p.startswith("<h") else p + "\n" for p in paragraphs if p.strip()])
        
        html = html.replace("**", "<strong>", 1).replace("**", "</strong>", 1)
        
        return html
    
    def _generate_html_footer(self) -> str:
        """Generate HTML footer"""
        return """
</body>
</html>"""
    
    def calculate_page_count(self, volumes: List[ProposalVolume]) -> int:
        """
        Calculate total page count.
        
        Args:
            volumes: List of volumes
            
        Returns:
            Total page count
        """
        return 2 + sum(vol.page_estimate for vol in volumes)
    
    def validate_page_range(self, page_count: int, min_pages: int = 40, max_pages: int = 120) -> bool:
        """
        Validate page count is within acceptable range.
        
        Args:
            page_count: Total page count
            min_pages: Minimum acceptable pages
            max_pages: Maximum acceptable pages
            
        Returns:
            True if within range
        """
        return min_pages <= page_count <= max_pages

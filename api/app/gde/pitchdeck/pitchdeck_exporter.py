"""
Pitch Deck Exporter
Export pitch decks to multiple formats (HTML, Markdown, JSON, PDF-ready HTML).
"""

import json
import io
import zipfile
import base64
from typing import Dict, Any, List
from datetime import datetime


class DeckExporter:
    """Export pitch decks to various formats."""
    
    def __init__(self):
        self.version = "1.0.0"
    
    def export_html(self, deck: Dict[str, Any], theme_css: str = "") -> str:
        """
        Export deck to HTML slideshow format.
        
        Args:
            deck: Deck dictionary with slides and metadata
            theme_css: CSS theme to apply
        
        Returns:
            Complete HTML document
        """
        slides_html = []
        
        for idx, slide in enumerate(deck.get('slides', [])):
            slide_html = self._render_slide_html(slide, idx + 1)
            slides_html.append(slide_html)
        
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{deck.get('title', 'Pitch Deck')}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        {theme_css}
        
        .slide {{
            opacity: 0;
            animation: fadeIn 0.5s ease-in forwards;
        }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        .slide-content {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        .slide-number {{
            position: absolute;
            top: 2rem;
            right: 2rem;
            font-size: 0.875rem;
            opacity: 0.6;
        }}
        
        .bullets {{
            margin: 2rem 0;
        }}
        
        .bullets li {{
            margin-bottom: 1rem;
        }}
        
        .charts {{
            margin: 2rem 0;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }}
        
        .footnote {{
            margin-top: 3rem;
            font-size: 0.875rem;
            opacity: 0.7;
        }}
        
        @media print {{
            .slide {{
                page-break-after: always;
                animation: none;
                opacity: 1;
            }}
            
            @page {{
                size: A4 landscape;
                margin: 0;
            }}
        }}
    </style>
</head>
<body>
    {''.join(slides_html)}
</body>
</html>"""
        
        return html
    
    def _render_slide_html(self, slide: Dict[str, Any], slide_number: int) -> str:
        """Render a single slide to HTML."""
        title = slide.get('title', '')
        subtitle = slide.get('subtitle', '')
        bullets = slide.get('bullets', [])
        charts = slide.get('charts', [])
        footnotes = slide.get('footnotes', '')
        
        bullets_html = ""
        if bullets:
            bullet_items = ''.join([f"<li>{bullet}</li>" for bullet in bullets])
            bullets_html = f'<ul class="bullets">{bullet_items}</ul>'
        
        charts_html = ""
        if charts:
            chart_items = ''.join([f"<div class='chart-placeholder'>{chart}</div>" for chart in charts])
            charts_html = f'<div class="charts">{chart_items}</div>'
        
        footnote_html = ""
        if footnotes:
            footnote_html = f'<div class="footnote">{footnotes}</div>'
        
        return f"""
    <div class="slide">
        <div class="slide-number">Slide {slide_number}</div>
        <div class="slide-content">
            <div class="slide-header">
                <h1>{title}</h1>
                {f'<h2>{subtitle}</h2>' if subtitle else ''}
            </div>
            {bullets_html}
            {charts_html}
            {footnote_html}
        </div>
    </div>
"""
    
    def export_markdown(self, deck: Dict[str, Any]) -> str:
        """
        Export deck to Markdown format.
        
        Args:
            deck: Deck dictionary with slides and metadata
        
        Returns:
            Markdown document
        """
        md_lines = []
        
        md_lines.append(f"# {deck.get('title', 'Pitch Deck')}\n")
        
        metadata = deck.get('metadata', {})
        if metadata:
            md_lines.append("## Metadata\n")
            md_lines.append(f"- **Company:** {metadata.get('company_name', 'N/A')}")
            md_lines.append(f"- **Type:** {metadata.get('deck_type', 'N/A')}")
            md_lines.append(f"- **Generated:** {metadata.get('generated_at', 'N/A')}")
            md_lines.append(f"- **Slides:** {metadata.get('slide_count', 0)}\n")
        
        md_lines.append("## Table of Contents\n")
        for idx, slide in enumerate(deck.get('slides', [])):
            md_lines.append(f"{idx + 1}. {slide.get('title', 'Untitled')}")
        md_lines.append("")
        
        for idx, slide in enumerate(deck.get('slides', [])):
            md_lines.append(f"---\n")
            md_lines.append(f"## Slide {idx + 1}: {slide.get('title', 'Untitled')}\n")
            
            if slide.get('subtitle'):
                md_lines.append(f"### {slide.get('subtitle')}\n")
            
            bullets = slide.get('bullets', [])
            if bullets:
                for bullet in bullets:
                    md_lines.append(f"- {bullet}")
                md_lines.append("")
            
            charts = slide.get('charts', [])
            if charts:
                md_lines.append("**Charts:**\n")
                for chart in charts:
                    md_lines.append(f"- {chart}")
                md_lines.append("")
            
            if slide.get('footnotes'):
                md_lines.append(f"*{slide.get('footnotes')}*\n")
        
        return '\n'.join(md_lines)
    
    def export_json(self, deck: Dict[str, Any]) -> str:
        """
        Export deck to JSON format.
        
        Args:
            deck: Deck dictionary with slides and metadata
        
        Returns:
            JSON string
        """
        return json.dumps(deck, indent=2, default=str)
    
    def export_pdf_html(self, deck: Dict[str, Any], theme_css: str = "") -> str:
        """
        Export deck to PDF-ready HTML with print optimization.
        
        Args:
            deck: Deck dictionary with slides and metadata
            theme_css: CSS theme to apply
        
        Returns:
            PDF-ready HTML document
        """
        slides_html = []
        
        for idx, slide in enumerate(deck.get('slides', [])):
            slide_html = self._render_slide_html(slide, idx + 1)
            slides_html.append(slide_html)
        
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{deck.get('title', 'Pitch Deck')} - PDF</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        {theme_css}
        
        .slide {{
            page-break-after: always;
            page-break-inside: avoid;
            min-height: 100vh;
            opacity: 1;
        }}
        
        .slide:last-child {{
            page-break-after: auto;
        }}
        
        .slide-content {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        .slide-number {{
            position: absolute;
            top: 2rem;
            right: 2rem;
            font-size: 0.875rem;
            opacity: 0.6;
        }}
        
        .bullets {{
            margin: 2rem 0;
        }}
        
        .bullets li {{
            margin-bottom: 1rem;
            page-break-inside: avoid;
        }}
        
        .charts {{
            margin: 2rem 0;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            page-break-inside: avoid;
        }}
        
        .footnote {{
            margin-top: 3rem;
            font-size: 0.875rem;
            opacity: 0.7;
        }}
        
        @page {{
            size: A4 landscape;
            margin: 0;
        }}
        
        @media print {{
            body {{
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }}
            
            .slide {{
                page-break-after: always;
                page-break-inside: avoid;
            }}
            
            .slide:last-child {{
                page-break-after: auto;
            }}
        }}
    </style>
</head>
<body>
    {''.join(slides_html)}
</body>
</html>"""
        
        return html
    
    def generate_export_package(
        self,
        deck: Dict[str, Any],
        theme_css: str = "",
        formats: List[str] = None
    ) -> bytes:
        """
        Generate a ZIP bundle with all export formats.
        
        Args:
            deck: Deck dictionary with slides and metadata
            theme_css: CSS theme to apply
            formats: List of formats to include (default: all)
        
        Returns:
            ZIP file bytes
        """
        if formats is None:
            formats = ['html', 'markdown', 'json', 'pdf']
        
        deck_name = deck.get('title', 'pitch_deck').replace(' ', '_').lower()
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            if 'html' in formats:
                html_content = self.export_html(deck, theme_css)
                zip_file.writestr(f"{deck_name}_{timestamp}.html", html_content)
            
            if 'markdown' in formats:
                md_content = self.export_markdown(deck)
                zip_file.writestr(f"{deck_name}_{timestamp}.md", md_content)
            
            if 'json' in formats:
                json_content = self.export_json(deck)
                zip_file.writestr(f"{deck_name}_{timestamp}.json", json_content)
            
            if 'pdf' in formats:
                pdf_html_content = self.export_pdf_html(deck, theme_css)
                zip_file.writestr(f"{deck_name}_{timestamp}_pdf.html", pdf_html_content)
            
            readme = f"""# {deck.get('title', 'Pitch Deck')} Export Package

Generated: {datetime.utcnow().isoformat()}


- {deck_name}_{timestamp}.html - Interactive HTML slideshow
- {deck_name}_{timestamp}.md - Markdown version
- {deck_name}_{timestamp}.json - JSON data
- {deck_name}_{timestamp}_pdf.html - PDF-ready HTML (open in browser and print to PDF)


1. Open the HTML file in a web browser for interactive viewing
2. Open the PDF HTML file and use browser's "Print to PDF" for PDF export
3. Use Markdown for documentation or editing
4. Use JSON for programmatic access

Version: {self.version}
"""
            zip_file.writestr("README.md", readme)
        
        zip_buffer.seek(0)
        return zip_buffer.read()
    
    def health(self) -> Dict[str, Any]:
        """Health check."""
        return {
            "status": "healthy",
            "version": self.version,
            "formats": ["html", "markdown", "json", "pdf"],
        }

"""
RFP Exporter

Export RFP proposals in multiple formats (HTML, JSON, Markdown, ZIP).
"""

from typing import Dict, Any, List
import json
from datetime import datetime


class RFPExporter:
    """
    RFP Exporter
    
    Exports RFP proposals in multiple formats.
    """
    
    def __init__(self):
        """Initialize exporter"""
        pass
        
    def export_html(self, proposal: Dict[str, Any]) -> str:
        """
        Export proposal as HTML.
        
        Args:
            proposal: Proposal dictionary
            
        Returns:
            HTML string
        """
        sections = proposal.get("sections", [])
        metadata = proposal.get("metadata", {})
        
        html_parts = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            f'    <title>{proposal.get("title", "RFP Proposal")}</title>',
            '    <style>',
            '        * { margin: 0; padding: 0; box-sizing: border-box; }',
            '        body {',
            '            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;',
            '            line-height: 1.6;',
            '            color: #333;',
            '            max-width: 1200px;',
            '            margin: 0 auto;',
            '            padding: 40px 20px;',
            '            background: #f5f5f5;',
            '        }',
            '        .header {',
            '            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
            '            color: white;',
            '            padding: 40px;',
            '            border-radius: 10px;',
            '            margin-bottom: 30px;',
            '            box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
            '        }',
            '        .header h1 { font-size: 32px; margin-bottom: 10px; }',
            '        .header p { font-size: 16px; opacity: 0.9; }',
            '        .metadata {',
            '            background: white;',
            '            padding: 20px;',
            '            border-radius: 8px;',
            '            margin-bottom: 30px;',
            '            box-shadow: 0 2px 4px rgba(0,0,0,0.05);',
            '        }',
            '        .metadata-grid {',
            '            display: grid;',
            '            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));',
            '            gap: 15px;',
            '        }',
            '        .metadata-item { padding: 10px 0; }',
            '        .metadata-label {',
            '            font-weight: 600;',
            '            color: #666;',
            '            font-size: 12px;',
            '            text-transform: uppercase;',
            '            letter-spacing: 0.5px;',
            '        }',
            '        .metadata-value {',
            '            font-size: 16px;',
            '            color: #333;',
            '            margin-top: 5px;',
            '        }',
            '        .section {',
            '            background: white;',
            '            padding: 40px;',
            '            border-radius: 8px;',
            '            margin-bottom: 30px;',
            '            box-shadow: 0 2px 4px rgba(0,0,0,0.05);',
            '        }',
            '        .section-number {',
            '            display: inline-block;',
            '            background: #667eea;',
            '            color: white;',
            '            width: 40px;',
            '            height: 40px;',
            '            border-radius: 50%;',
            '            text-align: center;',
            '            line-height: 40px;',
            '            font-weight: bold;',
            '            margin-right: 15px;',
            '        }',
            '        .section-title {',
            '            font-size: 28px;',
            '            color: #333;',
            '            margin-bottom: 20px;',
            '            display: flex;',
            '            align-items: center;',
            '        }',
            '        .section-content {',
            '            font-size: 16px;',
            '            line-height: 1.8;',
            '            color: #555;',
            '        }',
            '        .section-content h1 {',
            '            font-size: 24px;',
            '            color: #667eea;',
            '            margin: 30px 0 15px 0;',
            '        }',
            '        .section-content h2 {',
            '            font-size: 20px;',
            '            color: #764ba2;',
            '            margin: 25px 0 12px 0;',
            '        }',
            '        .section-content h3 {',
            '            font-size: 18px;',
            '            color: #555;',
            '            margin: 20px 0 10px 0;',
            '        }',
            '        .section-content p {',
            '            margin-bottom: 15px;',
            '        }',
            '        .section-content ul, .section-content ol {',
            '            margin: 15px 0 15px 30px;',
            '        }',
            '        .section-content li {',
            '            margin-bottom: 8px;',
            '        }',
            '        .footer {',
            '            text-align: center;',
            '            padding: 30px;',
            '            color: #999;',
            '            font-size: 14px;',
            '        }',
            '        @media print {',
            '            body { background: white; }',
            '            .section { page-break-inside: avoid; }',
            '        }',
            '    </style>',
            '</head>',
            '<body>',
            '    <div class="header">',
            f'        <h1>{proposal.get("title", "RFP Proposal")}</h1>',
            f'        <p>{proposal.get("agency", "")}</p>',
            '    </div>',
        ]
        
        if metadata:
            html_parts.extend([
                '    <div class="metadata">',
                '        <div class="metadata-grid">',
            ])
            
            for key, value in metadata.items():
                html_parts.extend([
                    '            <div class="metadata-item">',
                    f'                <div class="metadata-label">{key.replace("_", " ").title()}</div>',
                    f'                <div class="metadata-value">{value}</div>',
                    '            </div>',
                ])
                
            html_parts.extend([
                '        </div>',
                '    </div>',
            ])
            
        for section in sections:
            section_num = section.get("section_number", 0)
            section_name = section.get("section_name", "")
            content = section.get("content", "")
            
            html_parts.extend([
                '    <div class="section">',
                '        <div class="section-title">',
                f'            <span class="section-number">{section_num}</span>',
                f'            <span>{section_name}</span>',
                '        </div>',
                '        <div class="section-content">',
                f'            {self._markdown_to_html(content)}',
                '        </div>',
                '    </div>',
            ])
            
        html_parts.extend([
            '    <div class="footer">',
            '        <p>Generated by GhostQuant Enterprise RFP Generator™</p>',
            f'        <p>{datetime.utcnow().strftime("%B %d, %Y")}</p>',
            '    </div>',
            '</body>',
            '</html>',
        ])
        
        return '\n'.join(html_parts)
        
    def export_json(self, proposal: Dict[str, Any]) -> str:
        """
        Export proposal as JSON.
        
        Args:
            proposal: Proposal dictionary
            
        Returns:
            JSON string
        """
        return json.dumps(proposal, indent=2, ensure_ascii=False)
        
    def export_markdown(self, proposal: Dict[str, Any]) -> str:
        """
        Export proposal as Markdown.
        
        Args:
            proposal: Proposal dictionary
            
        Returns:
            Markdown string
        """
        sections = proposal.get("sections", [])
        metadata = proposal.get("metadata", {})
        
        md_parts = [
            f'# {proposal.get("title", "RFP Proposal")}',
            '',
            f'**Agency**: {proposal.get("agency", "")}',
            f'**Generated**: {datetime.utcnow().strftime("%B %d, %Y")}',
            '',
            '---',
            '',
        ]
        
        if metadata:
            md_parts.extend([
                '## Proposal Metadata',
                '',
            ])
            
            for key, value in metadata.items():
                md_parts.append(f'- **{key.replace("_", " ").title()}**: {value}')
                
            md_parts.extend(['', '---', ''])
            
        for section in sections:
            section_num = section.get("section_number", 0)
            section_name = section.get("section_name", "")
            content = section.get("content", "")
            
            md_parts.extend([
                f'## {section_num}. {section_name}',
                '',
                content,
                '',
                '---',
                '',
            ])
            
        md_parts.extend([
            '',
            '---',
            '',
            '*Generated by GhostQuant Enterprise RFP Generator™*',
        ])
        
        return '\n'.join(md_parts)
        
    def export_zip(self, proposal: Dict[str, Any]) -> bytes:
        """
        Export proposal as ZIP bundle.
        
        Uses Python stdlib zipfile module (no external dependencies).
        
        Args:
            proposal: Proposal dictionary
            
        Returns:
            ZIP file as bytes
        """
        import zipfile
        import io
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            html_content = self.export_html(proposal)
            zip_file.writestr('proposal.html', html_content)
            
            md_content = self.export_markdown(proposal)
            zip_file.writestr('proposal.md', md_content)
            
            json_content = self.export_json(proposal)
            zip_file.writestr('proposal.json', json_content)
            
            for section in proposal.get("sections", []):
                section_num = section.get("section_number", 0)
                section_name = section.get("section_name", "").replace(" ", "_").replace("&", "and")
                content = section.get("content", "")
                
                filename = f'sections/{section_num:02d}_{section_name}.md'
                zip_file.writestr(filename, content)
                
        zip_buffer.seek(0)
        return zip_buffer.read()
        
    def export_all(self, proposal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export proposal in all formats.
        
        Args:
            proposal: Proposal dictionary
            
        Returns:
            Dictionary containing all export formats
        """
        return {
            "html": self.export_html(proposal),
            "json": self.export_json(proposal),
            "markdown": self.export_markdown(proposal),
            "zip": self.export_zip(proposal),
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }
        
    def _markdown_to_html(self, markdown: str) -> str:
        """
        Convert Markdown to HTML (simple implementation).
        
        Args:
            markdown: Markdown text
            
        Returns:
            HTML text
        """
        lines = markdown.split('\n')
        html_lines = []
        in_paragraph = False
        
        for line in lines:
            line = line.strip()
            
            if not line:
                if in_paragraph:
                    html_lines.append('</p>')
                    in_paragraph = False
                continue
                
            if line.startswith('# '):
                if in_paragraph:
                    html_lines.append('</p>')
                    in_paragraph = False
                html_lines.append(f'<h1>{line[2:]}</h1>')
            elif line.startswith('## '):
                if in_paragraph:
                    html_lines.append('</p>')
                    in_paragraph = False
                html_lines.append(f'<h2>{line[3:]}</h2>')
            elif line.startswith('### '):
                if in_paragraph:
                    html_lines.append('</p>')
                    in_paragraph = False
                html_lines.append(f'<h3>{line[4:]}</h3>')
            elif line.startswith('**') and line.endswith('**'):
                if in_paragraph:
                    html_lines.append('</p>')
                    in_paragraph = False
                html_lines.append(f'<p><strong>{line[2:-2]}</strong></p>')
            elif line.startswith('- ') or line.startswith('* '):
                if in_paragraph:
                    html_lines.append('</p>')
                    in_paragraph = False
                html_lines.append(f'<li>{line[2:]}</li>')
            else:
                if not in_paragraph:
                    html_lines.append('<p>')
                    in_paragraph = True
                html_lines.append(line + ' ')
                
        if in_paragraph:
            html_lines.append('</p>')
            
        return '\n'.join(html_lines)

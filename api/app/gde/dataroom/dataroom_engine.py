"""
Data Room Engine

Core engine for building and managing investor data rooms.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from .dataroom_schema import (
    DataRoomSection,
    DataRoomFolder,
    DataRoomFile,
    DataRoomPackage,
    DataRoomSummary
)
from .dataroom_templates import get_all_sections


class DataRoomEngine:
    """
    Core engine for building and managing investor data rooms.
    
    Provides methods for:
    - Building individual sections and complete data rooms
    - Assembling HTML, Markdown, and JSON views
    - Managing folder structure and metadata
    - Applying access control and risk classification
    """
    
    def __init__(self):
        """Initialize the data room engine"""
        self.sections: List[DataRoomSection] = []
        self.built_at: Optional[str] = None
        
    def build_section(self, section_name: str) -> Optional[DataRoomSection]:
        """
        Build a specific data room section by name.
        
        Args:
            section_name: Name of section to build
            
        Returns:
            DataRoomSection if found, None otherwise
        """
        all_sections = get_all_sections()
        
        for section in all_sections:
            if section.name.lower() == section_name.lower():
                return section
                
        return None
        
    def build_all_sections(self) -> List[DataRoomSection]:
        """
        Build all data room sections.
        
        Returns:
            List of all DataRoomSection objects
        """
        self.sections = get_all_sections()
        self.built_at = datetime.utcnow().isoformat() + "Z"
        return self.sections
        
    def assemble_html_view(self, sections: Optional[List[DataRoomSection]] = None) -> str:
        """
        Assemble HTML view of data room.
        
        Args:
            sections: List of sections to include (defaults to all)
            
        Returns:
            HTML string
        """
        if sections is None:
            sections = self.sections if self.sections else self.build_all_sections()
            
        html_parts = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '    <title>GhostQuant Investor Data Room</title>',
            '    <style>',
            '        * { margin: 0; padding: 0; box-sizing: border-box; }',
            '        body {',
            '            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
            '            background: #000000;',
            '            color: #e5e7eb;',
            '            line-height: 1.6;',
            '        }',
            '        .container {',
            '            max-width: 1200px;',
            '            margin: 0 auto;',
            '            padding: 40px 20px;',
            '        }',
            '        .header {',
            '            border-bottom: 2px solid #10b981;',
            '            padding-bottom: 20px;',
            '            margin-bottom: 40px;',
            '        }',
            '        .header h1 {',
            '            font-size: 32px;',
            '            font-weight: 700;',
            '            color: #10b981;',
            '            margin-bottom: 8px;',
            '        }',
            '        .header p {',
            '            color: #9ca3af;',
            '            font-size: 14px;',
            '        }',
            '        .section {',
            '            background: #111827;',
            '            border: 1px solid #1f2937;',
            '            border-radius: 8px;',
            '            padding: 30px;',
            '            margin-bottom: 30px;',
            '        }',
            '        .section-header {',
            '            display: flex;',
            '            justify-content: space-between;',
            '            align-items: center;',
            '            margin-bottom: 20px;',
            '            padding-bottom: 15px;',
            '            border-bottom: 1px solid #374151;',
            '        }',
            '        .section-title {',
            '            font-size: 24px;',
            '            font-weight: 600;',
            '            color: #06b6d4;',
            '        }',
            '        .section-badge {',
            '            display: inline-block;',
            '            padding: 4px 12px;',
            '            border-radius: 12px;',
            '            font-size: 12px;',
            '            font-weight: 600;',
            '            text-transform: uppercase;',
            '        }',
            '        .badge-low { background: #065f46; color: #10b981; }',
            '        .badge-medium { background: #78350f; color: #f59e0b; }',
            '        .badge-high { background: #7f1d1d; color: #ef4444; }',
            '        .section-description {',
            '            color: #9ca3af;',
            '            margin-bottom: 20px;',
            '        }',
            '        .file {',
            '            background: #1f2937;',
            '            border: 1px solid #374151;',
            '            border-radius: 6px;',
            '            padding: 20px;',
            '            margin-bottom: 15px;',
            '        }',
            '        .file-name {',
            '            font-size: 16px;',
            '            font-weight: 600;',
            '            color: #10b981;',
            '            margin-bottom: 8px;',
            '        }',
            '        .file-description {',
            '            color: #9ca3af;',
            '            font-size: 14px;',
            '            margin-bottom: 15px;',
            '        }',
            '        .file-content {',
            '            color: #d1d5db;',
            '            font-size: 14px;',
            '            white-space: pre-wrap;',
            '            line-height: 1.8;',
            '        }',
            '        .file-content h1, .file-content h2, .file-content h3 {',
            '            color: #06b6d4;',
            '            margin-top: 20px;',
            '            margin-bottom: 10px;',
            '        }',
            '        .file-content h1 { font-size: 24px; }',
            '        .file-content h2 { font-size: 20px; }',
            '        .file-content h3 { font-size: 16px; }',
            '        .footer {',
            '            text-align: center;',
            '            padding: 40px 20px;',
            '            color: #6b7280;',
            '            font-size: 14px;',
            '            border-top: 1px solid #1f2937;',
            '            margin-top: 40px;',
            '        }',
            '    </style>',
            '</head>',
            '<body>',
            '    <div class="container">',
            '        <div class="header">',
            '            <h1>GhostQuant Investor Data Room</h1>',
            f'            <p>Generated: {datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")}</p>',
            '        </div>',
        ]
        
        for section in sorted(sections, key=lambda s: s.order):
            risk_class = f"badge-{section.risk_level}"
            
            html_parts.extend([
                '        <div class="section">',
                '            <div class="section-header">',
                f'                <div class="section-title">{section.name}</div>',
                f'                <div class="section-badge {risk_class}">{section.risk_level} risk</div>',
                '            </div>',
                f'            <div class="section-description">{section.description}</div>',
            ])
            
            for file in section.folder.files:
                html_parts.extend([
                    '            <div class="file">',
                    f'                <div class="file-name">{file.name}</div>',
                    f'                <div class="file-description">{file.description}</div>',
                    f'                <div class="file-content">{file.content}</div>',
                    '            </div>',
                ])
                
            html_parts.append('        </div>')
            
        html_parts.extend([
            '        <div class="footer">',
            '            <p>GhostQuant Technologies, Inc. | Confidential & Proprietary</p>',
            '            <p>This data room contains confidential information. Unauthorized distribution is prohibited.</p>',
            '        </div>',
            '    </div>',
            '</body>',
            '</html>',
        ])
        
        return '\n'.join(html_parts)
        
    def assemble_markdown_summary(self, sections: Optional[List[DataRoomSection]] = None) -> str:
        """
        Assemble Markdown summary of data room.
        
        Args:
            sections: List of sections to include (defaults to all)
            
        Returns:
            Markdown string
        """
        if sections is None:
            sections = self.sections if self.sections else self.build_all_sections()
            
        md_parts = [
            '# GhostQuant Investor Data Room',
            '',
            f'**Generated**: {datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")}',
            '',
            '---',
            '',
        ]
        
        for section in sorted(sections, key=lambda s: s.order):
            md_parts.extend([
                f'## {section.order}. {section.name}',
                '',
                f'**Description**: {section.description}',
                f'**Classification**: {section.classification}',
                f'**Risk Level**: {section.risk_level}',
                '',
            ])
            
            for file in section.folder.files:
                md_parts.extend([
                    f'### {file.name}',
                    '',
                    f'*{file.description}*',
                    '',
                    file.content,
                    '',
                    '---',
                    '',
                ])
                
        md_parts.extend([
            '',
            '---',
            '',
            '**GhostQuant Technologies, Inc.**',
            '',
            'Confidential & Proprietary',
            '',
            'This data room contains confidential information. Unauthorized distribution is prohibited.',
        ])
        
        return '\n'.join(md_parts)
        
    def assemble_json_schema(self, sections: Optional[List[DataRoomSection]] = None) -> Dict[str, Any]:
        """
        Assemble JSON schema of data room.
        
        Args:
            sections: List of sections to include (defaults to all)
            
        Returns:
            Dictionary representing data room structure
        """
        if sections is None:
            sections = self.sections if self.sections else self.build_all_sections()
            
        return {
            "data_room": {
                "name": "GhostQuant Investor Data Room",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "total_sections": len(sections),
                "sections": [section.to_dict() for section in sorted(sections, key=lambda s: s.order)]
            }
        }
        
    def generate_zip_package(self, sections: Optional[List[DataRoomSection]] = None) -> bytes:
        """
        Generate ZIP package containing all data room formats.
        
        Uses Python stdlib zipfile module (no external dependencies).
        
        Args:
            sections: List of sections to include (defaults to all)
            
        Returns:
            ZIP file as bytes
        """
        import zipfile
        import io
        
        if sections is None:
            sections = self.sections if self.sections else self.build_all_sections()
            
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            html_content = self.assemble_html_view(sections)
            zip_file.writestr('dataroom.html', html_content)
            
            md_content = self.assemble_markdown_summary(sections)
            zip_file.writestr('dataroom.md', md_content)
            
            json_content = json.dumps(self.assemble_json_schema(sections), indent=2)
            zip_file.writestr('dataroom.json', json_content)
            
            for section in sorted(sections, key=lambda s: s.order):
                section_dir = f"sections/{section.order:02d}_{section.name.replace(' ', '_').replace('&', 'and')}"
                
                for file in section.folder.files:
                    file_path = f"{section_dir}/{file.name}"
                    zip_file.writestr(file_path, file.content)
                    
        zip_buffer.seek(0)
        return zip_buffer.read()
        
    def list_sections(self) -> List[str]:
        """
        List all available section names.
        
        Returns:
            List of section names
        """
        if not self.sections:
            self.build_all_sections()
            
        return [section.name for section in sorted(self.sections, key=lambda s: s.order)]
        
    def get_section(self, name: str) -> Optional[DataRoomSection]:
        """
        Get a specific section by name.
        
        Args:
            name: Section name
            
        Returns:
            DataRoomSection if found, None otherwise
        """
        if not self.sections:
            self.build_all_sections()
            
        for section in self.sections:
            if section.name.lower() == name.lower():
                return section
                
        return None
        
    def get_folder_structure(self) -> Dict[str, Any]:
        """
        Get folder structure of data room.
        
        Returns:
            Dictionary representing folder hierarchy
        """
        if not self.sections:
            self.build_all_sections()
            
        structure = {
            "name": "GhostQuant Investor Data Room",
            "type": "root",
            "children": []
        }
        
        for section in sorted(self.sections, key=lambda s: s.order):
            section_node = {
                "name": section.name,
                "type": "section",
                "order": section.order,
                "classification": section.classification,
                "risk_level": section.risk_level,
                "children": []
            }
            
            folder_node = {
                "name": section.folder.name,
                "type": "folder",
                "classification": section.folder.classification,
                "risk_level": section.folder.risk_level,
                "children": []
            }
            
            for file in section.folder.files:
                file_node = {
                    "name": file.name,
                    "type": "file",
                    "file_type": file.file_type,
                    "classification": file.classification,
                    "size_bytes": file.size_bytes or len(file.content.encode('utf-8'))
                }
                folder_node["children"].append(file_node)
                
            section_node["children"].append(folder_node)
            structure["children"].append(section_node)
            
        return structure
        
    def classify_risk(self, section: DataRoomSection) -> str:
        """
        Classify risk level for a section.
        
        Args:
            section: DataRoomSection to classify
            
        Returns:
            Risk level (low, medium, high)
        """
        if section.classification == "restricted":
            return "high"
        elif section.classification == "confidential":
            return "medium"
        else:
            return "low"
            
    def apply_access_control(self, sections: List[DataRoomSection], level: str) -> List[DataRoomSection]:
        """
        Apply access control filtering to sections.
        
        Args:
            sections: List of sections to filter
            level: Access level (public, investor, nda, restricted)
            
        Returns:
            Filtered list of sections based on access level
        """
        access_hierarchy = {
            "public": ["public"],
            "investor": ["public", "confidential"],
            "nda": ["public", "confidential", "restricted"],
            "restricted": ["public", "confidential", "restricted", "nda_required"]
        }
        
        allowed_classifications = access_hierarchy.get(level, ["public"])
        
        filtered_sections = []
        for section in sections:
            if section.classification in allowed_classifications:
                filtered_sections.append(section)
                
        return filtered_sections
        
    def health(self) -> Dict[str, Any]:
        """
        Check health of data room engine.
        
        Returns:
            Health status dictionary
        """
        try:
            sections = get_all_sections()
            
            return {
                "status": "healthy",
                "sections_available": len(sections),
                "sections_built": len(self.sections),
                "last_built": self.built_at,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

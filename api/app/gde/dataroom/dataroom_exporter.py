"""
Data Room Exporter

Export data room in multiple formats (HTML, JSON, Markdown, ZIP).
"""

from typing import List, Optional
from datetime import datetime
import json

from .dataroom_schema import DataRoomSection
from .dataroom_engine import DataRoomEngine


class DataRoomExporter:
    """
    Export data room in multiple formats.
    
    Supports:
    - HTML: Full data room with GhostQuant styling
    - JSON: Structured data for API consumption
    - Markdown: Human-readable documentation
    - ZIP: Bundle containing all formats
    """
    
    def __init__(self, engine: Optional[DataRoomEngine] = None):
        """
        Initialize exporter.
        
        Args:
            engine: DataRoomEngine instance (creates new if not provided)
        """
        self.engine = engine or DataRoomEngine()
        
    def export_html(self, sections: Optional[List[DataRoomSection]] = None) -> str:
        """
        Export data room as HTML.
        
        Args:
            sections: List of sections to export (defaults to all)
            
        Returns:
            HTML string with GhostQuant styling
        """
        if sections is None:
            sections = self.engine.build_all_sections()
            
        return self.engine.assemble_html_view(sections)
        
    def export_json(self, sections: Optional[List[DataRoomSection]] = None) -> str:
        """
        Export data room as JSON.
        
        Args:
            sections: List of sections to export (defaults to all)
            
        Returns:
            JSON string
        """
        if sections is None:
            sections = self.engine.build_all_sections()
            
        schema = self.engine.assemble_json_schema(sections)
        return json.dumps(schema, indent=2)
        
    def export_markdown(self, sections: Optional[List[DataRoomSection]] = None) -> str:
        """
        Export data room as Markdown.
        
        Args:
            sections: List of sections to export (defaults to all)
            
        Returns:
            Markdown string
        """
        if sections is None:
            sections = self.engine.build_all_sections()
            
        return self.engine.assemble_markdown_summary(sections)
        
    def export_zip(self, sections: Optional[List[DataRoomSection]] = None) -> bytes:
        """
        Export data room as ZIP bundle.
        
        Uses Python stdlib zipfile module (no external dependencies).
        
        Args:
            sections: List of sections to export (defaults to all)
            
        Returns:
            ZIP file as bytes
        """
        if sections is None:
            sections = self.engine.build_all_sections()
            
        return self.engine.generate_zip_package(sections)
        
    def export_all(self, sections: Optional[List[DataRoomSection]] = None) -> dict:
        """
        Export data room in all formats.
        
        Args:
            sections: List of sections to export (defaults to all)
            
        Returns:
            Dictionary containing all export formats
        """
        if sections is None:
            sections = self.engine.build_all_sections()
            
        return {
            "html": self.export_html(sections),
            "json": self.export_json(sections),
            "markdown": self.export_markdown(sections),
            "zip": self.export_zip(sections),
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "total_sections": len(sections)
        }

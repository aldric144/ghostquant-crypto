"""
GhostQuant™ — Regulatory Audit Binder Generator
Module: binder_exporter.py
Purpose: Export audit binders to PDF-ready folder structure

SECURITY NOTICE:
- NO PDF generation (only folder structure)
- Only MD/JSON/TXT files written
- All exports are read-only documentation
- No sensitive information in exports
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from .binder_schema import (
    AuditBinder,
    BinderSection,
    BinderAttachment,
    BinderExportResult
)


class AuditBinderExporter:
    """
    Exporter for audit binders to PDF-ready folder structure.
    
    Creates organized directory structure with:
    - /sections/ - Markdown files for each section
    - /attachments/ - JSON/MD/TXT attachments
    - binder_metadata.json - Binder metadata
    
    NO PDF generation - only folder structure for PDF assembly.
    """
    
    def __init__(self, base_export_dir: str = "/tmp/binder_exports"):
        """
        Initialize binder exporter.
        
        Args:
            base_export_dir: Base directory for all binder exports
        """
        self.base_export_dir = base_export_dir
        self._ensure_base_directory()
    
    def _ensure_base_directory(self):
        """Ensure base export directory exists"""
        try:
            os.makedirs(self.base_export_dir, exist_ok=True)
        except Exception as e:
            print(f"Error creating base export directory: {e}")
    
    def export_binder(self, binder: AuditBinder, export_dir: Optional[str] = None) -> BinderExportResult:
        """
        Export audit binder to PDF-ready folder structure.
        
        Args:
            binder: AuditBinder to export
            export_dir: Optional custom export directory
        
        Returns:
            BinderExportResult with export status and file paths
        """
        try:
            if export_dir is None:
                export_dir = os.path.join(self.base_export_dir, binder.binder_id)
            
            directories = self._create_directory_tree(binder.binder_id, export_dir)
            
            section_files = self._write_section_files(binder, export_dir)
            
            attachment_files = self._write_attachment_files(binder, export_dir)
            
            metadata_file = self._write_binder_metadata(binder, export_dir)
            
            all_files = section_files + attachment_files + [metadata_file]
            
            return BinderExportResult(
                success=True,
                directory=export_dir,
                files=all_files,
                binder_id=binder.binder_id,
                metadata={
                    "section_count": len(section_files),
                    "attachment_count": len(attachment_files),
                    "total_files": len(all_files),
                    "directories": directories,
                    "exported_at": datetime.utcnow().isoformat()
                }
            )
        
        except Exception as e:
            print(f"Error exporting binder: {e}")
            return BinderExportResult(
                success=False,
                directory=export_dir or "",
                files=[],
                error=str(e),
                binder_id=binder.binder_id,
                metadata={"error": str(e)}
            )
    
    def _create_directory_tree(self, binder_id: str, export_dir: str) -> List[str]:
        """
        Create directory tree for binder export.
        
        Structure:
        /binder_exports/{binder_id}/
            /sections/
            /attachments/
            binder_metadata.json
        
        Args:
            binder_id: Binder ID
            export_dir: Export directory path
        
        Returns:
            List of created directories
        """
        try:
            directories = [
                export_dir,
                os.path.join(export_dir, "sections"),
                os.path.join(export_dir, "attachments")
            ]
            
            for directory in directories:
                os.makedirs(directory, exist_ok=True)
            
            return directories
        
        except Exception as e:
            print(f"Error creating directory tree: {e}")
            return []
    
    def _write_section_files(self, binder: AuditBinder, export_dir: str) -> List[str]:
        """
        Write section files to /sections/ directory.
        
        Files are named: {order:02d}_{section_id}.md
        Example: 01_cover_page.md, 02_table_of_contents.md
        
        Args:
            binder: AuditBinder
            export_dir: Export directory path
        
        Returns:
            List of written file paths
        """
        try:
            section_files = []
            sections_dir = os.path.join(export_dir, "sections")
            
            sorted_sections = sorted(binder.sections, key=lambda s: s.order)
            
            for section in sorted_sections:
                filename = f"{section.order:02d}_{section.id}.md"
                filepath = os.path.join(sections_dir, filename)
                
                try:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(section.content)
                    
                    section_files.append(filepath)
                
                except Exception as e:
                    print(f"Error writing section {section.id}: {e}")
            
            return section_files
        
        except Exception as e:
            print(f"Error writing section files: {e}")
            return []
    
    def _write_attachment_files(self, binder: AuditBinder, export_dir: str) -> List[str]:
        """
        Write attachment files to /attachments/ directory.
        
        Files are named: {filename}.{extension}
        Example: cjis_compliance.json, nist_controls.md
        
        Args:
            binder: AuditBinder
            export_dir: Export directory path
        
        Returns:
            List of written file paths
        """
        try:
            attachment_files = []
            attachments_dir = os.path.join(export_dir, "attachments")
            
            for attachment in binder.attachments:
                filename = attachment.get_full_filename()
                filepath = os.path.join(attachments_dir, filename)
                
                try:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(attachment.content)
                    
                    attachment_files.append(filepath)
                
                except Exception as e:
                    print(f"Error writing attachment {attachment.filename}: {e}")
            
            return attachment_files
        
        except Exception as e:
            print(f"Error writing attachment files: {e}")
            return []
    
    def _write_binder_metadata(self, binder: AuditBinder, export_dir: str) -> str:
        """
        Write binder metadata to binder_metadata.json.
        
        Args:
            binder: AuditBinder
            export_dir: Export directory path
        
        Returns:
            Metadata file path
        """
        try:
            metadata_file = os.path.join(export_dir, "binder_metadata.json")
            
            metadata = {
                "binder_id": binder.binder_id,
                "name": binder.name,
                "generated_at": binder.generated_at,
                "section_count": len(binder.sections),
                "attachment_count": len(binder.attachments),
                "sections": [
                    {
                        "id": section.id,
                        "title": section.title,
                        "order": section.order,
                        "filename": f"{section.order:02d}_{section.id}.md",
                        "generated_at": section.generated_at
                    }
                    for section in sorted(binder.sections, key=lambda s: s.order)
                ],
                "attachments": [
                    {
                        "filename": attachment.get_full_filename(),
                        "description": attachment.description,
                        "type": attachment.attachment_type,
                        "generated_at": attachment.generated_at
                    }
                    for attachment in binder.attachments
                ],
                "metadata": binder.metadata
            }
            
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            return metadata_file
        
        except Exception as e:
            print(f"Error writing binder metadata: {e}")
            return ""
    
    def list_binders(self, export_dir: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all exported binders.
        
        Args:
            export_dir: Optional custom export directory
        
        Returns:
            List of binder metadata dictionaries
        """
        try:
            if export_dir is None:
                export_dir = self.base_export_dir
            
            binders = []
            
            if not os.path.exists(export_dir):
                return []
            
            for item in os.listdir(export_dir):
                item_path = os.path.join(export_dir, item)
                
                if not os.path.isdir(item_path):
                    continue
                
                metadata_file = os.path.join(item_path, "binder_metadata.json")
                if not os.path.exists(metadata_file):
                    continue
                
                try:
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                    
                    binders.append({
                        "binder_id": metadata.get("binder_id", item),
                        "name": metadata.get("name", "Unknown"),
                        "generated_at": metadata.get("generated_at", "Unknown"),
                        "section_count": metadata.get("section_count", 0),
                        "attachment_count": metadata.get("attachment_count", 0),
                        "directory": item_path,
                        "metadata_file": metadata_file
                    })
                
                except Exception as e:
                    print(f"Error reading metadata for {item}: {e}")
            
            binders.sort(key=lambda b: b.get("generated_at", ""), reverse=True)
            
            return binders
        
        except Exception as e:
            print(f"Error listing binders: {e}")
            return []
    
    def get_binder_metadata(self, binder_id: str, export_dir: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a specific binder.
        
        Args:
            binder_id: Binder ID
            export_dir: Optional custom export directory
        
        Returns:
            Binder metadata dictionary or None
        """
        try:
            if export_dir is None:
                export_dir = self.base_export_dir
            
            binder_dir = os.path.join(export_dir, binder_id)
            metadata_file = os.path.join(binder_dir, "binder_metadata.json")
            
            if not os.path.exists(metadata_file):
                return None
            
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            return metadata
        
        except Exception as e:
            print(f"Error getting binder metadata: {e}")
            return None
    
    def get_binder_file(self, binder_id: str, file_path: str, export_dir: Optional[str] = None) -> Optional[str]:
        """
        Get content of a specific binder file.
        
        Args:
            binder_id: Binder ID
            file_path: Relative file path (e.g., "sections/01_cover_page.md")
            export_dir: Optional custom export directory
        
        Returns:
            File content or None
        """
        try:
            if export_dir is None:
                export_dir = self.base_export_dir
            
            binder_dir = os.path.join(export_dir, binder_id)
            full_path = os.path.join(binder_dir, file_path)
            
            if not os.path.abspath(full_path).startswith(os.path.abspath(binder_dir)):
                print(f"Security violation: file path outside binder directory")
                return None
            
            if not os.path.exists(full_path):
                return None
            
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return content
        
        except Exception as e:
            print(f"Error getting binder file: {e}")
            return None
    
    def delete_binder(self, binder_id: str, export_dir: Optional[str] = None) -> bool:
        """
        Delete a binder export.
        
        Args:
            binder_id: Binder ID
            export_dir: Optional custom export directory
        
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if export_dir is None:
                export_dir = self.base_export_dir
            
            binder_dir = os.path.join(export_dir, binder_id)
            
            if not os.path.exists(binder_dir):
                return False
            
            import shutil
            shutil.rmtree(binder_dir)
            
            return True
        
        except Exception as e:
            print(f"Error deleting binder: {e}")
            return False
    
    def get_health(self) -> Dict[str, Any]:
        """
        Get exporter health status.
        
        Returns:
            Health status dictionary
        """
        try:
            base_dir_exists = os.path.exists(self.base_export_dir)
            base_dir_writable = os.access(self.base_export_dir, os.W_OK) if base_dir_exists else False
            
            binder_count = len(self.list_binders())
            
            total_size = 0
            if base_dir_exists:
                for root, dirs, files in os.walk(self.base_export_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        try:
                            total_size += os.path.getsize(file_path)
                        except:
                            pass
            
            return {
                "status": "healthy" if base_dir_exists and base_dir_writable else "unhealthy",
                "base_export_dir": self.base_export_dir,
                "base_dir_exists": base_dir_exists,
                "base_dir_writable": base_dir_writable,
                "binder_count": binder_count,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def cleanup_old_binders(self, days: int = 30, export_dir: Optional[str] = None) -> int:
        """
        Clean up binders older than specified days.
        
        Args:
            days: Age threshold in days
            export_dir: Optional custom export directory
        
        Returns:
            Number of binders deleted
        """
        try:
            if export_dir is None:
                export_dir = self.base_export_dir
            
            deleted_count = 0
            cutoff_time = datetime.utcnow().timestamp() - (days * 24 * 60 * 60)
            
            binders = self.list_binders(export_dir)
            
            for binder in binders:
                try:
                    generated_at = datetime.fromisoformat(binder["generated_at"].replace('Z', '+00:00'))
                    
                    if generated_at.timestamp() < cutoff_time:
                        if self.delete_binder(binder["binder_id"], export_dir):
                            deleted_count += 1
                
                except Exception as e:
                    print(f"Error processing binder {binder.get('binder_id')}: {e}")
            
            return deleted_count
        
        except Exception as e:
            print(f"Error cleaning up old binders: {e}")
            return 0

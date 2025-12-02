"""
GhostQuant™ — Full Compliance Documentation Exporter System
Module: exporter_engine.py
Purpose: Export compliance documents to JSON, Markdown, and TXT formats

SECURITY NOTICE:
- NO sensitive information in exports
- Only metadata, policies, architecture, controls
- All exports are read-only documentation
- UTF-8 safe file writing
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from .exporter_schema import (
    ComplianceDocument,
    ComplianceExportResult,
    ExportFormat,
    ExportManifest
)


class ComplianceExporterEngine:
    """
    Engine for exporting compliance documents to multiple formats.
    
    Supports:
    - JSON export (structured data)
    - Markdown export (human-readable documentation)
    - TXT export (plain text documentation)
    
    Features:
    - UTF-8 safe file writing
    - Deterministic output
    - No external dependencies
    - Crash-proof error handling
    """
    
    def __init__(self, export_dir: str = "/tmp/compliance_exports"):
        """
        Initialize exporter engine.
        
        Args:
            export_dir: Directory for exported files
        """
        self.export_dir = export_dir
        self.manifest = ExportManifest()
        self._ensure_export_directory()
    
    def _ensure_export_directory(self) -> None:
        """Ensure export directory exists"""
        try:
            os.makedirs(self.export_dir, exist_ok=True)
        except Exception as e:
            print(f"Error creating export directory: {e}")
    
    def export_to_json(self, document: ComplianceDocument, export_dir: Optional[str] = None) -> ComplianceExportResult:
        """
        Export document to JSON format.
        
        Args:
            document: Compliance document to export
            export_dir: Optional custom export directory
            
        Returns:
            Export result with file path and status
        """
        try:
            target_dir = export_dir or self.export_dir
            self._ensure_directory_exists(target_dir)
            
            filename = f"{document.doc_id}_{document.doc_type.value}.json"
            file_path = os.path.join(target_dir, filename)
            
            doc_dict = document.to_dict()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(doc_dict, f, indent=2, ensure_ascii=False)
            
            file_size = os.path.getsize(file_path)
            
            result = ComplianceExportResult(
                success=True,
                file_path=file_path,
                format=ExportFormat.JSON,
                doc_id=document.doc_id,
                doc_type=document.doc_type.value,
                file_size=file_size,
                exported_at=datetime.utcnow()
            )
            
            self.manifest.add_export(result)
            return result
        
        except Exception as e:
            error_msg = f"JSON export failed: {str(e)}"
            print(error_msg)
            
            result = ComplianceExportResult(
                success=False,
                file_path="",
                format=ExportFormat.JSON,
                error=error_msg,
                doc_id=document.doc_id,
                doc_type=document.doc_type.value,
                exported_at=datetime.utcnow()
            )
            
            self.manifest.add_export(result)
            return result
    
    def export_to_markdown(self, document: ComplianceDocument, export_dir: Optional[str] = None) -> ComplianceExportResult:
        """
        Export document to Markdown format.
        
        Args:
            document: Compliance document to export
            export_dir: Optional custom export directory
            
        Returns:
            Export result with file path and status
        """
        try:
            target_dir = export_dir or self.export_dir
            self._ensure_directory_exists(target_dir)
            
            filename = f"{document.doc_id}_{document.doc_type.value}.md"
            file_path = os.path.join(target_dir, filename)
            
            markdown_content = document.to_markdown()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            file_size = os.path.getsize(file_path)
            
            result = ComplianceExportResult(
                success=True,
                file_path=file_path,
                format=ExportFormat.MARKDOWN,
                doc_id=document.doc_id,
                doc_type=document.doc_type.value,
                file_size=file_size,
                exported_at=datetime.utcnow()
            )
            
            self.manifest.add_export(result)
            return result
        
        except Exception as e:
            error_msg = f"Markdown export failed: {str(e)}"
            print(error_msg)
            
            result = ComplianceExportResult(
                success=False,
                file_path="",
                format=ExportFormat.MARKDOWN,
                error=error_msg,
                doc_id=document.doc_id,
                doc_type=document.doc_type.value,
                exported_at=datetime.utcnow()
            )
            
            self.manifest.add_export(result)
            return result
    
    def export_to_text(self, document: ComplianceDocument, export_dir: Optional[str] = None) -> ComplianceExportResult:
        """
        Export document to plain text format.
        
        Args:
            document: Compliance document to export
            export_dir: Optional custom export directory
            
        Returns:
            Export result with file path and status
        """
        try:
            target_dir = export_dir or self.export_dir
            self._ensure_directory_exists(target_dir)
            
            filename = f"{document.doc_id}_{document.doc_type.value}.txt"
            file_path = os.path.join(target_dir, filename)
            
            text_content = document.to_text()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(text_content)
            
            file_size = os.path.getsize(file_path)
            
            result = ComplianceExportResult(
                success=True,
                file_path=file_path,
                format=ExportFormat.TEXT,
                doc_id=document.doc_id,
                doc_type=document.doc_type.value,
                file_size=file_size,
                exported_at=datetime.utcnow()
            )
            
            self.manifest.add_export(result)
            return result
        
        except Exception as e:
            error_msg = f"Text export failed: {str(e)}"
            print(error_msg)
            
            result = ComplianceExportResult(
                success=False,
                file_path="",
                format=ExportFormat.TEXT,
                error=error_msg,
                doc_id=document.doc_id,
                doc_type=document.doc_type.value,
                exported_at=datetime.utcnow()
            )
            
            self.manifest.add_export(result)
            return result
    
    def export_all_formats(self, document: ComplianceDocument, export_dir: Optional[str] = None) -> List[ComplianceExportResult]:
        """
        Export document to all formats (JSON, Markdown, TXT).
        
        Args:
            document: Compliance document to export
            export_dir: Optional custom export directory
            
        Returns:
            List of export results for each format
        """
        results = []
        
        json_result = self.export_to_json(document, export_dir)
        results.append(json_result)
        
        md_result = self.export_to_markdown(document, export_dir)
        results.append(md_result)
        
        txt_result = self.export_to_text(document, export_dir)
        results.append(txt_result)
        
        return results
    
    def list_exports(self, export_dir: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all exported files in the export directory.
        
        Args:
            export_dir: Optional custom export directory
            
        Returns:
            List of export file information
        """
        try:
            target_dir = export_dir or self.export_dir
            
            if not os.path.exists(target_dir):
                return []
            
            exports = []
            
            for filename in os.listdir(target_dir):
                file_path = os.path.join(target_dir, filename)
                
                if not os.path.isfile(file_path):
                    continue
                
                file_stat = os.stat(file_path)
                file_size = file_stat.st_size
                modified_time = datetime.fromtimestamp(file_stat.st_mtime)
                
                if filename.endswith('.json'):
                    format_type = ExportFormat.JSON.value
                elif filename.endswith('.md'):
                    format_type = ExportFormat.MARKDOWN.value
                elif filename.endswith('.txt'):
                    format_type = ExportFormat.TEXT.value
                else:
                    format_type = "unknown"
                
                parts = filename.rsplit('.', 1)[0].split('_', 1)
                doc_id = parts[0] if len(parts) > 0 else "unknown"
                doc_type = parts[1] if len(parts) > 1 else "unknown"
                
                exports.append({
                    "filename": filename,
                    "file_path": file_path,
                    "file_size": file_size,
                    "format": format_type,
                    "doc_id": doc_id,
                    "doc_type": doc_type,
                    "modified_at": modified_time.isoformat()
                })
            
            exports.sort(key=lambda x: x["modified_at"], reverse=True)
            
            return exports
        
        except Exception as e:
            print(f"Error listing exports: {e}")
            return []
    
    def get_export_health(self) -> Dict[str, Any]:
        """
        Get health status of the export engine.
        
        Returns:
            Health status information
        """
        try:
            dir_exists = os.path.exists(self.export_dir)
            dir_writable = os.access(self.export_dir, os.W_OK) if dir_exists else False
            
            exports = self.list_exports()
            total_exports = len(exports)
            
            total_size = sum(export["file_size"] for export in exports)
            
            format_counts = {}
            for export in exports:
                format_type = export["format"]
                format_counts[format_type] = format_counts.get(format_type, 0) + 1
            
            if dir_exists and dir_writable:
                status = "HEALTHY"
            elif dir_exists and not dir_writable:
                status = "WARNING"
            else:
                status = "ERROR"
            
            return {
                "status": status,
                "export_directory": self.export_dir,
                "directory_exists": dir_exists,
                "directory_writable": dir_writable,
                "total_exports": total_exports,
                "total_size_bytes": total_size,
                "format_breakdown": format_counts,
                "manifest": {
                    "total_exports": self.manifest.total_exports,
                    "successful_exports": self.manifest.successful_exports,
                    "failed_exports": self.manifest.failed_exports
                },
                "checked_at": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {
                "status": "ERROR",
                "error": str(e),
                "export_directory": self.export_dir,
                "checked_at": datetime.utcnow().isoformat()
            }
    
    def delete_export(self, filename: str, export_dir: Optional[str] = None) -> bool:
        """
        Delete an exported file.
        
        Args:
            filename: Name of file to delete
            export_dir: Optional custom export directory
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            target_dir = export_dir or self.export_dir
            file_path = os.path.join(target_dir, filename)
            
            if os.path.exists(file_path) and os.path.isfile(file_path):
                os.remove(file_path)
                return True
            
            return False
        
        except Exception as e:
            print(f"Error deleting export: {e}")
            return False
    
    def clear_exports(self, export_dir: Optional[str] = None) -> int:
        """
        Clear all exported files.
        
        Args:
            export_dir: Optional custom export directory
            
        Returns:
            Number of files deleted
        """
        try:
            target_dir = export_dir or self.export_dir
            
            if not os.path.exists(target_dir):
                return 0
            
            deleted_count = 0
            
            for filename in os.listdir(target_dir):
                file_path = os.path.join(target_dir, filename)
                
                if os.path.isfile(file_path):
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                    except Exception as e:
                        print(f"Error deleting {filename}: {e}")
            
            return deleted_count
        
        except Exception as e:
            print(f"Error clearing exports: {e}")
            return 0
    
    def get_export_manifest(self) -> Dict[str, Any]:
        """
        Get the export manifest.
        
        Returns:
            Export manifest as dictionary
        """
        return self.manifest.to_dict()
    
    def _ensure_directory_exists(self, directory: str) -> None:
        """Ensure a directory exists"""
        try:
            os.makedirs(directory, exist_ok=True)
        except Exception as e:
            print(f"Error creating directory {directory}: {e}")
    
    def get_export_by_id(self, doc_id: str, export_dir: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all exports for a specific document ID.
        
        Args:
            doc_id: Document ID to search for
            export_dir: Optional custom export directory
            
        Returns:
            List of exports matching the document ID
        """
        all_exports = self.list_exports(export_dir)
        return [export for export in all_exports if export["doc_id"] == doc_id]
    
    def get_export_by_type(self, doc_type: str, export_dir: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all exports for a specific document type.
        
        Args:
            doc_type: Document type to search for
            export_dir: Optional custom export directory
            
        Returns:
            List of exports matching the document type
        """
        all_exports = self.list_exports(export_dir)
        return [export for export in all_exports if export["doc_type"] == doc_type]
    
    def get_export_statistics(self, export_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Get detailed export statistics.
        
        Args:
            export_dir: Optional custom export directory
            
        Returns:
            Export statistics
        """
        try:
            exports = self.list_exports(export_dir)
            
            if not exports:
                return {
                    "total_exports": 0,
                    "total_size_bytes": 0,
                    "by_format": {},
                    "by_doc_type": {},
                    "oldest_export": None,
                    "newest_export": None
                }
            
            total_size = sum(export["file_size"] for export in exports)
            
            by_format = {}
            for export in exports:
                format_type = export["format"]
                if format_type not in by_format:
                    by_format[format_type] = {
                        "count": 0,
                        "total_size": 0
                    }
                by_format[format_type]["count"] += 1
                by_format[format_type]["total_size"] += export["file_size"]
            
            by_doc_type = {}
            for export in exports:
                doc_type = export["doc_type"]
                if doc_type not in by_doc_type:
                    by_doc_type[doc_type] = {
                        "count": 0,
                        "total_size": 0
                    }
                by_doc_type[doc_type]["count"] += 1
                by_doc_type[doc_type]["total_size"] += export["file_size"]
            
            oldest_export = min(exports, key=lambda x: x["modified_at"])
            newest_export = max(exports, key=lambda x: x["modified_at"])
            
            return {
                "total_exports": len(exports),
                "total_size_bytes": total_size,
                "by_format": by_format,
                "by_doc_type": by_doc_type,
                "oldest_export": {
                    "filename": oldest_export["filename"],
                    "modified_at": oldest_export["modified_at"]
                },
                "newest_export": {
                    "filename": newest_export["filename"],
                    "modified_at": newest_export["modified_at"]
                }
            }
        
        except Exception as e:
            print(f"Error getting export statistics: {e}")
            return {
                "error": str(e)
            }


_exporter_engine: Optional[ComplianceExporterEngine] = None


def get_exporter_engine(export_dir: str = "/tmp/compliance_exports") -> ComplianceExporterEngine:
    """
    Get singleton exporter engine instance.
    
    Args:
        export_dir: Directory for exported files
        
    Returns:
        Exporter engine instance
    """
    global _exporter_engine
    
    if _exporter_engine is None:
        _exporter_engine = ComplianceExporterEngine(export_dir)
    
    return _exporter_engine

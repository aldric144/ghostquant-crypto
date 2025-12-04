"""
GhostQuant™ — Regulatory Audit Binder Generator
Module: api_binder.py
Purpose: FastAPI endpoints for audit binder generation

SECURITY NOTICE:
- NO sensitive information in responses
- Only metadata and file paths returned
- All responses are JSON
- Never raise exceptions (return JSON errors)
"""

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse, PlainTextResponse
from typing import Optional, Dict, Any
from datetime import datetime
import os

from .binder_engine import AuditBinderEngine
from .binder_schema import AuditBinder


router = APIRouter()

engine = AuditBinderEngine(export_dir="/tmp/binder_exports")


@router.get("/")
async def binder_info():
    """
    Get audit binder system information.
    
    Returns:
        System information and capabilities
    """
    try:
        return {
            "success": True,
            "system": "GhostQuant™ Regulatory Audit Binder Generator",
            "version": "1.0.0",
            "capabilities": [
                "Generate comprehensive audit binders",
                "Export to PDF-ready folder structure",
                "Support 14 compliance frameworks",
                "Automated section generation",
                "Attachment management",
                "Binder versioning"
            ],
            "frameworks": [
                "CJIS Security Policy v5.9",
                "NIST 800-53 Rev 5",
                "SOC 2 Type II",
                "FedRAMP LITE",
                "AML/KYC (BSA/FinCEN/FATF)",
                "Data Governance (GDPR/CCPA)",
                "Incident Response (NIST 800-61)",
                "Audit Logging (NIST 800-53 AU)",
                "Zero-Trust (NIST 800-207)",
                "Privacy Shield",
                "SSDLC (NIST 800-218)",
                "Key Management (NIST 800-57)",
                "Environment Isolation (NIST 800-53 CM-7)"
            ],
            "endpoints": [
                "POST /binder/generate - Generate new audit binder",
                "GET /binder/latest - Get latest binder metadata",
                "GET /binder/list - List all exported binders",
                "GET /binder/download/{binder_id}/{path:path} - Download binder file",
                "GET /binder/health - Get system health status",
                "GET /binder/ - This endpoint"
            ],
            "export_format": "PDF-ready folder structure (MD/JSON/TXT)",
            "pdf_generation": "Not included (folder structure only)",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.post("/generate")
async def generate_binder(name: Optional[str] = None):
    """
    Generate new audit binder and export to PDF-ready folder structure.
    
    Args:
        name: Optional custom binder name
    
    Returns:
        Binder generation and export result
    """
    try:
        result = engine.generate_and_export(name=name)
        
        if not result.get("success"):
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": result.get("error", "Unknown error"),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        return {
            "success": True,
            "message": "Audit binder generated and exported successfully",
            "binder_id": result["binder_id"],
            "binder_name": result["binder_name"],
            "section_count": result["section_count"],
            "attachment_count": result["attachment_count"],
            "export_directory": result["export_directory"],
            "files_exported": result["files_exported"],
            "generated_at": result["generated_at"],
            "exported_at": result["exported_at"],
            "download_url": f"/binder/download/{result['binder_id']}/binder_metadata.json"
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/latest")
async def get_latest_binder():
    """
    Get metadata for the most recently generated binder.
    
    Returns:
        Latest binder metadata
    """
    try:
        binder = engine.get_latest_binder()
        
        if binder is None:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "error": "No binder has been generated yet",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        return {
            "success": True,
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
                    "filename": f"{section.order:02d}_{section.id}.md"
                }
                for section in sorted(binder.sections, key=lambda s: s.order)
            ],
            "attachments": [
                {
                    "filename": attachment.get_full_filename(),
                    "description": attachment.description,
                    "type": attachment.attachment_type
                }
                for attachment in binder.attachments
            ],
            "metadata": binder.metadata
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/list")
async def list_binders():
    """
    List all exported audit binders.
    
    Returns:
        List of binder metadata
    """
    try:
        binders = engine.list_binders()
        
        return {
            "success": True,
            "count": len(binders),
            "binders": binders,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/download/{binder_id}/{file_path:path}")
async def download_binder_file(binder_id: str, file_path: str):
    """
    Download a specific file from a binder export.
    
    Args:
        binder_id: Binder ID
        file_path: Relative file path (e.g., "sections/01_cover_page.md")
    
    Returns:
        File content
    """
    try:
        content = engine.get_binder_file(binder_id, file_path)
        
        if content is None:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "error": f"File not found: {file_path}",
                    "binder_id": binder_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        if file_path.endswith('.json'):
            return Response(
                content=content,
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename={os.path.basename(file_path)}"
                }
            )
        elif file_path.endswith('.md'):
            return Response(
                content=content,
                media_type="text/markdown",
                headers={
                    "Content-Disposition": f"attachment; filename={os.path.basename(file_path)}"
                }
            )
        else:
            return PlainTextResponse(
                content=content,
                headers={
                    "Content-Disposition": f"attachment; filename={os.path.basename(file_path)}"
                }
            )
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/metadata/{binder_id}")
async def get_binder_metadata(binder_id: str):
    """
    Get metadata for a specific binder.
    
    Args:
        binder_id: Binder ID
    
    Returns:
        Binder metadata
    """
    try:
        metadata = engine.get_binder_metadata(binder_id)
        
        if metadata is None:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "error": f"Binder not found: {binder_id}",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        return {
            "success": True,
            "metadata": metadata,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.delete("/delete/{binder_id}")
async def delete_binder(binder_id: str):
    """
    Delete a binder export.
    
    Args:
        binder_id: Binder ID
    
    Returns:
        Deletion result
    """
    try:
        success = engine.delete_binder(binder_id)
        
        if not success:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "error": f"Binder not found or could not be deleted: {binder_id}",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        return {
            "success": True,
            "message": f"Binder {binder_id} deleted successfully",
            "binder_id": binder_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.post("/cleanup")
async def cleanup_old_binders(days: int = 30):
    """
    Clean up binders older than specified days.
    
    Args:
        days: Age threshold in days (default: 30)
    
    Returns:
        Cleanup result
    """
    try:
        deleted_count = engine.cleanup_old_binders(days=days)
        
        return {
            "success": True,
            "message": f"Cleaned up {deleted_count} binders older than {days} days",
            "deleted_count": deleted_count,
            "days_threshold": days,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/health")
async def get_health():
    """
    Get audit binder system health status.
    
    Returns:
        Health status
    """
    try:
        health = engine.get_health()
        
        return {
            "success": True,
            "health": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/statistics")
async def get_statistics():
    """
    Get binder generation statistics.
    
    Returns:
        Statistics
    """
    try:
        stats = engine.get_statistics()
        
        return {
            "success": True,
            "statistics": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

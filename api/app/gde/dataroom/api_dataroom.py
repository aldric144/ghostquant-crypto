"""
Data Room API Endpoints

FastAPI router for investor data room endpoints.
"""

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import HTMLResponse, JSONResponse
from typing import Optional
import json

from .dataroom_engine import DataRoomEngine
from .dataroom_exporter import DataRoomExporter
from .dataroom_access_control import DataRoomAccessControl, AccessLevel


router = APIRouter(prefix="/dataroom", tags=["Data Room"])

engine = DataRoomEngine()
exporter = DataRoomExporter(engine)


@router.get("/")
async def get_dataroom_root():
    """
    Get data room root information.
    
    Returns overview of available sections and access levels.
    """
    try:
        sections = engine.build_all_sections()
        
        return {
            "name": "GhostQuant Investor Data Room",
            "description": "Automated investor-grade due diligence data room",
            "total_sections": len(sections),
            "sections": engine.list_sections(),
            "access_levels": DataRoomAccessControl.list_levels(),
            "endpoints": {
                "summary": "/dataroom/summary",
                "sections": "/dataroom/sections",
                "section": "/dataroom/section/{name}",
                "schema": "/dataroom/schema",
                "html": "/dataroom/html",
                "markdown": "/dataroom/markdown",
                "json": "/dataroom/json",
                "export_all": "/dataroom/export/all",
                "access": "/dataroom/access/{level}",
                "health": "/dataroom/health",
                "info": "/dataroom/info"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_dataroom_summary():
    """
    Get data room summary with section metadata.
    
    Returns high-level overview without full content.
    """
    try:
        sections = engine.build_all_sections()
        
        summary = {
            "name": "GhostQuant Investor Data Room",
            "total_sections": len(sections),
            "sections": []
        }
        
        for section in sorted(sections, key=lambda s: s.order):
            summary["sections"].append({
                "order": section.order,
                "name": section.name,
                "description": section.description,
                "classification": section.classification,
                "risk_level": section.risk_level,
                "file_count": len(section.folder.files),
                "files": [
                    {
                        "name": f.name,
                        "description": f.description,
                        "file_type": f.file_type,
                        "classification": f.classification
                    }
                    for f in section.folder.files
                ]
            })
            
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sections")
async def list_sections():
    """
    List all available data room sections.
    
    Returns list of section names.
    """
    try:
        sections = engine.list_sections()
        return {
            "sections": sections,
            "count": len(sections)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/section/{name}")
async def get_section(name: str):
    """
    Get a specific data room section by name.
    
    Args:
        name: Section name
        
    Returns:
        Complete section with all files and content
    """
    try:
        section = engine.get_section(name)
        
        if not section:
            raise HTTPException(status_code=404, detail=f"Section '{name}' not found")
            
        return section.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schema")
async def get_schema():
    """
    Get complete data room schema in JSON format.
    
    Returns full structure with all sections and files.
    """
    try:
        sections = engine.build_all_sections()
        schema = engine.assemble_json_schema(sections)
        return schema
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/html", response_class=HTMLResponse)
async def get_html():
    """
    Get data room as HTML document.
    
    Returns fully-styled HTML with GhostQuant branding.
    """
    try:
        html = exporter.export_html()
        return HTMLResponse(content=html)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/markdown")
async def get_markdown():
    """
    Get data room as Markdown document.
    
    Returns plain text Markdown format.
    """
    try:
        markdown = exporter.export_markdown()
        return Response(content=markdown, media_type="text/markdown")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/json")
async def get_json():
    """
    Get data room as JSON document.
    
    Returns structured JSON with all content.
    """
    try:
        json_str = exporter.export_json()
        return Response(content=json_str, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/all")
async def export_all():
    """
    Export data room in all formats.
    
    Returns dictionary with HTML, JSON, Markdown, and ZIP.
    Note: ZIP is returned as base64-encoded string.
    """
    try:
        import base64
        
        exports = exporter.export_all()
        
        exports["zip"] = base64.b64encode(exports["zip"]).decode('utf-8')
        
        return exports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/zip")
async def export_zip():
    """
    Export data room as ZIP bundle.
    
    Returns ZIP file containing all formats.
    """
    try:
        zip_bytes = exporter.export_zip()
        
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=ghostquant_dataroom.zip"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/access/{level}")
async def set_access_level(level: str):
    """
    Filter data room by access level.
    
    Args:
        level: Access level (public, investor, nda, restricted)
        
    Returns:
        Filtered data room based on access level
    """
    try:
        try:
            access_level = AccessLevel(level.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid access level. Must be one of: {[l.value for l in AccessLevel]}"
            )
            
        sections = engine.build_all_sections()
        
        filtered_sections = DataRoomAccessControl.filter_sections(sections, access_level)
        
        return {
            "access_level": access_level.value,
            "description": DataRoomAccessControl.LEVEL_DESCRIPTIONS[access_level],
            "total_sections": len(sections),
            "accessible_sections": len(filtered_sections),
            "sections": [
                {
                    "order": s.order,
                    "name": s.name,
                    "description": s.description,
                    "classification": s.classification,
                    "risk_level": s.risk_level
                }
                for s in sorted(filtered_sections, key=lambda s: s.order)
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/access/summary")
async def get_access_summary():
    """
    Get summary of access levels and section counts.
    
    Returns breakdown of sections by access level.
    """
    try:
        sections = engine.build_all_sections()
        summary = DataRoomAccessControl.get_access_summary(sections)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Check health of data room system.
    
    Returns health status and metrics.
    """
    try:
        health = engine.health()
        return health
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get("/info")
async def get_info():
    """
    Get data room system information.
    
    Returns metadata about the data room system.
    """
    try:
        sections = engine.build_all_sections()
        folder_structure = engine.get_folder_structure()
        
        return {
            "name": "GhostQuant Investor Data Room Generator™",
            "version": "1.0.0",
            "description": "Automated investor-grade due diligence data room system",
            "total_sections": len(sections),
            "sections": engine.list_sections(),
            "folder_structure": folder_structure,
            "access_levels": DataRoomAccessControl.list_levels(),
            "export_formats": ["html", "json", "markdown", "zip"],
            "features": [
                "10 fully-written investor folders",
                "4 access control levels",
                "Multi-format export (HTML, JSON, Markdown, ZIP)",
                "Real-time section filtering",
                "Risk classification",
                "Folder structure visualization"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

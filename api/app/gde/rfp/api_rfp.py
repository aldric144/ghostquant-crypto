"""
RFP API Router

FastAPI router for Government RFP Pack Generator endpoints.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from .rfp_engine import RFPGenerator
from .rfp_schema import RFPDocument

router = APIRouter(prefix="/rfp", tags=["RFP Generator"])

rfp_generator = RFPGenerator()

_last_rfp: Optional[RFPDocument] = None


@router.post("/generate")
async def generate_full_rfp(context: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate complete RFP response with all 9 sections
    
    Request body (optional):
    {
        "agency": "Department of Homeland Security",
        "solicitation_number": "DHS-2025-001",
        "deadline": "2025-12-31"
    }
    """
    global _last_rfp
    
    try:
        if context is None:
            context = {}
        
        rfp = rfp_generator.generate_full_rfp(context)
        _last_rfp = rfp
        
        return {
            'status': 'success',
            'document_id': rfp.metadata.document_id,
            'metadata': rfp.metadata.to_dict(),
            'sections': [section.to_dict() for section in rfp.sections],
            'summary': rfp_generator.summary(rfp)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RFP generation failed: {str(e)}")


@router.post("/section/{section_name}")
async def generate_section(section_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate a single RFP section
    
    Available sections:
    - executive_summary
    - technical_volume
    - management_volume
    - past_performance
    - compliance_volume
    - pricing_volume
    - integration_volume
    - appendices
    - required_forms
    """
    try:
        if context is None:
            context = {}
        
        section = rfp_generator.generate_section(section_name, context)
        
        return {
            'status': 'success',
            'section': section.to_dict()
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Section generation failed: {str(e)}")


@router.get("/export/json")
async def export_json() -> Dict[str, Any]:
    """Export last generated RFP to JSON format"""
    global _last_rfp
    
    if _last_rfp is None:
        raise HTTPException(status_code=404, detail="No RFP generated yet. Call /rfp/generate first.")
    
    try:
        json_content = rfp_generator.export_json(_last_rfp)
        
        return {
            'status': 'success',
            'format': 'json',
            'content': json_content,
            'document_id': _last_rfp.metadata.document_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JSON export failed: {str(e)}")


@router.get("/export/markdown")
async def export_markdown() -> Dict[str, Any]:
    """Export last generated RFP to Markdown format"""
    global _last_rfp
    
    if _last_rfp is None:
        raise HTTPException(status_code=404, detail="No RFP generated yet. Call /rfp/generate first.")
    
    try:
        markdown_content = rfp_generator.export_markdown(_last_rfp)
        
        return {
            'status': 'success',
            'format': 'markdown',
            'content': markdown_content,
            'document_id': _last_rfp.metadata.document_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Markdown export failed: {str(e)}")


@router.get("/export/html")
async def export_html() -> Dict[str, Any]:
    """Export last generated RFP to HTML format"""
    global _last_rfp
    
    if _last_rfp is None:
        raise HTTPException(status_code=404, detail="No RFP generated yet. Call /rfp/generate first.")
    
    try:
        html_content = rfp_generator.export_html(_last_rfp)
        
        return {
            'status': 'success',
            'format': 'html',
            'content': html_content,
            'document_id': _last_rfp.metadata.document_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HTML export failed: {str(e)}")


@router.get("/summary")
async def get_summary() -> Dict[str, Any]:
    """Get summary of last generated RFP"""
    global _last_rfp
    
    if _last_rfp is None:
        raise HTTPException(status_code=404, detail="No RFP generated yet. Call /rfp/generate first.")
    
    try:
        summary = rfp_generator.summary(_last_rfp)
        
        return {
            'status': 'success',
            'summary': summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check for RFP generator"""
    try:
        health = rfp_generator.health()
        
        return {
            'status': 'success',
            'health': health
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """Get RFP generator information"""
    return {
        'status': 'success',
        'name': 'Government RFP Pack Generator™',
        'version': rfp_generator.VERSION,
        'description': 'Automated system for generating complete Government RFP Response Packages',
        'supported_agencies': [
            'DHS', 'DOJ', 'FBI', 'Treasury', 'SEC', 'DoD', 'Interpol', 'EU'
        ],
        'available_sections': list(rfp_generator.sections_registry.keys()),
        'export_formats': ['json', 'markdown', 'html'],
        'features': [
            'Complete 9-section RFP response',
            'Executive summary',
            'Technical volume',
            'Management volume',
            'Past performance volume',
            'Compliance matrices (CJIS, NIST, SOC2, FedRAMP)',
            'Pricing volume',
            'Integration volume',
            'Appendices',
            'Required forms',
            'PDF-ready exports'
        ]
    }

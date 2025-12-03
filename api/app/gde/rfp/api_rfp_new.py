"""
RFP API Endpoints

FastAPI router for enterprise RFP generation system.
Implements 12 API endpoints as specified in Task 8.22.
"""

from fastapi import APIRouter, HTTPException, Response
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from .rfp_engine_new import RFPGeneratorEngine
from .rfp_storage import RFPStorage
from .rfp_compliance_engine import ComplianceStatus, RiskLevel


router = APIRouter(prefix="/rfp", tags=["RFP Generator"])

engine = RFPGeneratorEngine()
storage = RFPStorage()



class GenerateProposalRequest(BaseModel):
    """Request model for generating proposal"""
    rfp_id: str
    agency: str
    title: str
    context: Optional[Dict[str, Any]] = None


class RequirementsRequest(BaseModel):
    """Request model for uploading requirements"""
    rfp_id: str
    requirements: List[Dict[str, Any]]


class AccessLevelRequest(BaseModel):
    """Request model for setting access level"""
    level: str



@router.post("/generate")
async def generate_proposal(request: GenerateProposalRequest) -> Dict[str, Any]:
    """
    Generate complete RFP proposal.
    
    POST /rfp/generate
    
    Request body:
    {
        "rfp_id": "RFP-2025-001",
        "agency": "Department of Justice",
        "title": "Cryptocurrency Intelligence Platform",
        "context": {}
    }
    
    Returns:
        Complete proposal with all sections
    """
    try:
        proposal = engine.generate_full_proposal(
            rfp_id=request.rfp_id,
            agency=request.agency,
            title=request.title,
            context=request.context
        )
        
        proposal_id = proposal.get("proposal_id")
        storage.create_proposal(proposal_id, proposal)
        
        return {
            "success": True,
            "proposal": proposal,
            "message": f"Proposal {proposal_id} generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/requirements")
async def upload_requirements(request: RequirementsRequest) -> Dict[str, Any]:
    """
    Upload RFP requirements.
    
    POST /rfp/requirements
    
    Request body:
    {
        "rfp_id": "RFP-2025-001",
        "requirements": [
            {
                "requirement_id": "REQ-001",
                "section": "Technical",
                "description": "System must support real-time monitoring",
                "mandatory": true,
                "weight": 1.0
            }
        ]
    }
    
    Returns:
        Ingestion results
    """
    try:
        result = engine.ingest_rfp_requirements(request.requirements)
        
        storage.create_requirements(request.rfp_id, request.requirements)
        
        return {
            "success": True,
            "rfp_id": request.rfp_id,
            "ingestion_result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/proposal/{proposal_id}")
async def get_proposal(proposal_id: str) -> Dict[str, Any]:
    """
    Get proposal by ID.
    
    GET /rfp/proposal/{proposal_id}
    
    Returns:
        Proposal data
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
    return {
        "success": True,
        "proposal": proposal
    }


@router.get("/compliance/{proposal_id}")
async def get_compliance(proposal_id: str) -> Dict[str, Any]:
    """
    Get compliance matrix for proposal.
    
    GET /rfp/compliance/{proposal_id}
    
    Returns:
        Compliance matrix
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
    compliance_matrix = proposal.get("compliance_matrix")
    
    if not compliance_matrix:
        return {
            "success": False,
            "message": "No compliance matrix available for this proposal"
        }
        
    return {
        "success": True,
        "compliance_matrix": compliance_matrix
    }


@router.get("/export/html/{proposal_id}")
async def export_html(proposal_id: str) -> Response:
    """
    Export proposal as HTML.
    
    GET /rfp/export/html/{proposal_id}
    
    Returns:
        HTML document
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
    html_content = engine.generate_html(proposal)
    
    return Response(
        content=html_content,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="proposal_{proposal_id}.html"'
        }
    )


@router.get("/export/markdown/{proposal_id}")
async def export_markdown(proposal_id: str) -> Response:
    """
    Export proposal as Markdown.
    
    GET /rfp/export/markdown/{proposal_id}
    
    Returns:
        Markdown document
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
    markdown_content = engine.generate_markdown(proposal)
    
    return Response(
        content=markdown_content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="proposal_{proposal_id}.md"'
        }
    )


@router.get("/export/json/{proposal_id}")
async def export_json(proposal_id: str) -> Response:
    """
    Export proposal as JSON.
    
    GET /rfp/export/json/{proposal_id}
    
    Returns:
        JSON document
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
    json_content = engine.generate_json(proposal)
    
    return Response(
        content=json_content,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="proposal_{proposal_id}.json"'
        }
    )


@router.get("/export/zip/{proposal_id}")
async def export_zip(proposal_id: str) -> Response:
    """
    Export proposal as ZIP bundle.
    
    GET /rfp/export/zip/{proposal_id}
    
    Returns:
        ZIP file containing HTML, Markdown, JSON, and individual sections
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        
    zip_content = engine.generate_zip_package(proposal)
    
    return Response(
        content=zip_content,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="proposal_{proposal_id}.zip"'
        }
    )


@router.get("/list")
async def list_proposals(limit: int = 100, offset: int = 0) -> Dict[str, Any]:
    """
    List all proposals.
    
    GET /rfp/list?limit=100&offset=0
    
    Returns:
        List of proposals
    """
    proposals = storage.list_proposals(limit=limit, offset=offset)
    
    return {
        "success": True,
        "count": len(proposals),
        "limit": limit,
        "offset": offset,
        "proposals": proposals
    }


@router.get("/history")
async def get_history(limit: int = 100) -> Dict[str, Any]:
    """
    Get operation history.
    
    GET /rfp/history?limit=100
    
    Returns:
        List of history entries
    """
    history = storage.get_history(limit=limit)
    
    return {
        "success": True,
        "count": len(history),
        "history": history
    }


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    
    GET /rfp/health
    
    Returns:
        Health status
    """
    engine_health = engine.health()
    storage_stats = storage.get_stats()
    
    return {
        "status": "healthy",
        "engine": engine_health,
        "storage": storage_stats,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.get("/")
async def rfp_root() -> Dict[str, Any]:
    """
    RFP API root endpoint.
    
    GET /rfp/
    
    Returns:
        API information
    """
    return {
        "name": "GhostQuant Enterprise RFP Generator™",
        "version": engine.VERSION,
        "description": "Automated government-grade RFP response generation system",
        "endpoints": {
            "POST /rfp/generate": "Generate complete RFP proposal",
            "POST /rfp/requirements": "Upload RFP requirements",
            "GET /rfp/proposal/{id}": "Get proposal by ID",
            "GET /rfp/compliance/{id}": "Get compliance matrix",
            "GET /rfp/export/html/{id}": "Export as HTML",
            "GET /rfp/export/markdown/{id}": "Export as Markdown",
            "GET /rfp/export/json/{id}": "Export as JSON",
            "GET /rfp/export/zip/{id}": "Export as ZIP bundle",
            "GET /rfp/list": "List all proposals",
            "GET /rfp/history": "Get operation history",
            "GET /rfp/health": "Health check",
            "GET /rfp/": "API information"
        },
        "features": [
            "12 fully-written RFP sections",
            "Compliance matrix generation",
            "Multi-format export (HTML, JSON, Markdown, ZIP)",
            "Government-ready content",
            "Zero external dependencies"
        ],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

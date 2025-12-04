"""
Proposal API Endpoints

FastAPI router with 12 endpoints for proposal generation system.
"""

from fastapi import APIRouter, HTTPException, Response
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from .proposal_writer_engine import ProposalWriterEngine
from .proposal_compliance_engine import ProposalComplianceEngine
from .proposal_cost_engine import ProposalCostEngine
from .proposal_exporter import ProposalExporter
from .proposal_storage import ProposalStorage


router = APIRouter(prefix="/proposals", tags=["proposals"])

writer_engine = ProposalWriterEngine()
compliance_engine = ProposalComplianceEngine()
cost_engine = ProposalCostEngine()
exporter = ProposalExporter()
storage = ProposalStorage()



class GenerateProposalRequest(BaseModel):
    rfp_id: str
    agency: str
    title: str
    persona_type: str = "dod"
    requirements: Optional[List[Dict[str, Any]]] = None


class UploadRFPRequest(BaseModel):
    rfp_id: str
    agency: str
    title: str
    deadline: Optional[str] = None
    requirements: Optional[List[Dict[str, Any]]] = None
    evaluation_criteria: Optional[List[Dict[str, Any]]] = None
    compliance_requirements: Optional[List[str]] = None



@router.post("/generate")
async def generate_proposal(request: GenerateProposalRequest) -> Dict[str, Any]:
    """
    Generate complete proposal package.
    
    POST /proposals/generate
    
    Request body:
    {
        "rfp_id": "RFP-2024-001",
        "agency": "Department of Defense",
        "title": "Cryptocurrency Intelligence Platform",
        "persona_type": "dod",
        "requirements": [...]
    }
    
    Returns:
        Complete proposal package with document, compliance matrix, risk table, cost breakdown
    """
    try:
        package = writer_engine.generate_full_proposal(
            rfp_id=request.rfp_id,
            agency=request.agency,
            title=request.title,
            persona_type=request.persona_type
        )
        
        package_dict = {
            "package_id": package.package_id,
            "document": {
                "document_id": package.document.document_id,
                "title": package.document.title,
                "agency": package.document.agency,
                "rfp_number": package.document.rfp_number,
                "total_pages": package.document.total_pages,
                "total_words": package.document.total_words,
                "persona": package.document.persona,
                "generated_at": package.document.generated_at,
                "volumes": [
                    {
                        "volume_id": vol.volume_id,
                        "volume_name": vol.volume_name,
                        "volume_number": vol.volume_number,
                        "total_words": vol.total_words,
                        "page_estimate": vol.page_estimate
                    }
                    for vol in package.document.volumes
                ]
            },
            "compliance_matrix": {
                "matrix_id": package.compliance_matrix.matrix_id,
                "overall_score": package.compliance_matrix.overall_score,
                "requirements_count": len(package.compliance_matrix.requirements)
            } if package.compliance_matrix else None,
            "risk_table": {
                "risk_id": package.risk_table.risk_id,
                "overall_risk_level": package.risk_table.overall_risk_level,
                "risks_count": len(package.risk_table.risks)
            } if package.risk_table else None,
            "cost_breakdown": {
                "cost_id": package.cost_breakdown.cost_id,
                "total_cost": package.cost_breakdown.total_cost,
                "cost_risk_level": package.cost_breakdown.cost_risk_level
            } if package.cost_breakdown else None,
            "status": package.status,
            "created_at": package.created_at
        }
        
        storage.create_proposal(package.package_id, package_dict)
        
        return {
            "success": True,
            "package_id": package.package_id,
            "document_id": package.document.document_id,
            "total_pages": package.document.total_pages,
            "total_words": package.document.total_words,
            "volumes_count": len(package.document.volumes),
            "generated_at": package.document.generated_at
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proposal generation failed: {str(e)}")


@router.post("/rfp")
async def upload_rfp(request: UploadRFPRequest) -> Dict[str, Any]:
    """
    Upload and store RFP requirements.
    
    POST /proposals/rfp
    
    Request body:
    {
        "rfp_id": "RFP-2024-001",
        "agency": "Department of Defense",
        "title": "Cryptocurrency Intelligence Platform",
        "deadline": "2024-12-31",
        "requirements": [...],
        "evaluation_criteria": [...],
        "compliance_requirements": [...]
    }
    
    Returns:
        Stored RFP data
    """
    try:
        rfp_data = {
            "rfp_id": request.rfp_id,
            "agency": request.agency,
            "title": request.title,
            "deadline": request.deadline,
            "requirements": request.requirements or [],
            "evaluation_criteria": request.evaluation_criteria or [],
            "compliance_requirements": request.compliance_requirements or []
        }
        
        stored_rfp = storage.create_rfp(request.rfp_id, rfp_data)
        
        return {
            "success": True,
            "rfp_id": stored_rfp["rfp_id"],
            "created_at": stored_rfp["created_at"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RFP upload failed: {str(e)}")


@router.get("/{proposal_id}")
async def get_proposal(proposal_id: str) -> Dict[str, Any]:
    """
    Get proposal by ID.
    
    GET /proposals/{proposal_id}
    
    Returns:
        Complete proposal data
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    return proposal


@router.get("/compliance/{proposal_id}")
async def get_compliance(proposal_id: str) -> Dict[str, Any]:
    """
    Get compliance matrix for proposal.
    
    GET /proposals/compliance/{proposal_id}
    
    Returns:
        Compliance matrix data
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    compliance_matrix = proposal.get("compliance_matrix")
    
    if not compliance_matrix:
        raise HTTPException(status_code=404, detail=f"Compliance matrix not found for proposal: {proposal_id}")
    
    return compliance_matrix


@router.get("/cost/{proposal_id}")
async def get_cost(proposal_id: str) -> Dict[str, Any]:
    """
    Get cost breakdown for proposal.
    
    GET /proposals/cost/{proposal_id}
    
    Returns:
        Cost breakdown data
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    cost_breakdown = proposal.get("cost_breakdown")
    
    if not cost_breakdown:
        raise HTTPException(status_code=404, detail=f"Cost breakdown not found for proposal: {proposal_id}")
    
    return cost_breakdown


@router.get("/export/html/{proposal_id}")
async def export_html(proposal_id: str) -> Response:
    """
    Export proposal as HTML.
    
    GET /proposals/export/html/{proposal_id}
    
    Returns:
        HTML document
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>GhostQuant Proposal - {proposal['document']['title']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
        h1 {{ color: #059669; border-bottom: 3px solid #059669; }}
        h2 {{ color: #0891b2; }}
        .metadata {{ background: #f0fdf4; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; }}
    </style>
</head>
<body>
    <h1>GhostQuant Intelligence Systems</h1>
    <h2>{proposal['document']['title']}</h2>
    
    <div class="metadata">
        <p><strong>Agency:</strong> {proposal['document']['agency']}</p>
        <p><strong>RFP Number:</strong> {proposal['document']['rfp_number']}</p>
        <p><strong>Total Pages:</strong> {proposal['document']['total_pages']}</p>
        <p><strong>Total Words:</strong> {proposal['document']['total_words']:,}</p>
        <p><strong>Generated:</strong> {proposal['document']['generated_at']}</p>
    </div>
    
    <h2>Volumes</h2>
    <ul>
        {''.join([f"<li>{vol['volume_number']}. {vol['volume_name']} ({vol['total_words']:,} words, ~{vol['page_estimate']} pages)</li>" for vol in proposal['document']['volumes']])}
    </ul>
    
    <p><em>Full proposal content available in complete export.</em></p>
</body>
</html>"""
    
    return Response(content=html_content, media_type="text/html")


@router.get("/export/md/{proposal_id}")
async def export_markdown(proposal_id: str) -> Response:
    """
    Export proposal as Markdown.
    
    GET /proposals/export/md/{proposal_id}
    
    Returns:
        Markdown document
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    md_content = f"""# GhostQuant Intelligence Systems


**Agency:** {proposal['document']['agency']}  
**RFP Number:** {proposal['document']['rfp_number']}  
**Total Pages:** {proposal['document']['total_pages']}  
**Total Words:** {proposal['document']['total_words']:,}  
**Generated:** {proposal['document']['generated_at']}


{chr(10).join([f"{vol['volume_number']}. {vol['volume_name']} ({vol['total_words']:,} words, ~{vol['page_estimate']} pages)" for vol in proposal['document']['volumes']])}

---

*Full proposal content available in complete export.*
"""
    
    return Response(content=md_content, media_type="text/markdown")


@router.get("/export/json/{proposal_id}")
async def export_json(proposal_id: str) -> Dict[str, Any]:
    """
    Export proposal as JSON.
    
    GET /proposals/export/json/{proposal_id}
    
    Returns:
        JSON document
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    return proposal


@router.get("/export/zip/{proposal_id}")
async def export_zip(proposal_id: str) -> Response:
    """
    Export proposal as ZIP package.
    
    GET /proposals/export/zip/{proposal_id}
    
    Returns:
        ZIP file with all formats
    """
    proposal = storage.get_proposal(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal not found: {proposal_id}")
    
    import zipfile
    import io
    import json
    
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        json_content = json.dumps(proposal, indent=2)
        zip_file.writestr(f"proposal_{proposal_id}.json", json_content)
        
        readme = f"""# GhostQuant Proposal Package

**Proposal ID:** {proposal_id}
**Title:** {proposal['document']['title']}
**Agency:** {proposal['document']['agency']}
**Generated:** {proposal['document']['generated_at']}


- proposal_{proposal_id}.json - Complete proposal data

---

Generated by GhostQuant Intelligence Systems
"""
        zip_file.writestr("README.md", readme)
    
    zip_buffer.seek(0)
    
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=proposal_{proposal_id}.zip"}
    )


@router.get("/list")
async def list_proposals(limit: int = 100, offset: int = 0) -> Dict[str, Any]:
    """
    List all proposals.
    
    GET /proposals/list?limit=100&offset=0
    
    Returns:
        List of proposals
    """
    proposals = storage.list_proposals(limit=limit, offset=offset)
    
    return {
        "proposals": proposals,
        "count": len(proposals),
        "limit": limit,
        "offset": offset
    }


@router.get("/history")
async def get_history(limit: int = 100) -> Dict[str, Any]:
    """
    Get proposal generation history.
    
    GET /proposals/history?limit=100
    
    Returns:
        History events
    """
    history = storage.get_history(limit=limit)
    
    return {
        "history": history,
        "count": len(history)
    }


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    
    GET /proposals/health
    
    Returns:
        System health status
    """
    writer_health = writer_engine.health()
    storage_stats = storage.get_stats()
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "writer_engine": writer_health,
        "storage": storage_stats,
        "endpoints": {
            "generate": "POST /proposals/generate",
            "upload_rfp": "POST /proposals/rfp",
            "get_proposal": "GET /proposals/{proposal_id}",
            "get_compliance": "GET /proposals/compliance/{proposal_id}",
            "get_cost": "GET /proposals/cost/{proposal_id}",
            "export_html": "GET /proposals/export/html/{proposal_id}",
            "export_markdown": "GET /proposals/export/md/{proposal_id}",
            "export_json": "GET /proposals/export/json/{proposal_id}",
            "export_zip": "GET /proposals/export/zip/{proposal_id}",
            "list": "GET /proposals/list",
            "history": "GET /proposals/history",
            "health": "GET /proposals/health"
        }
    }

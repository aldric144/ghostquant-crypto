"""
Sales API Endpoints
FastAPI routes for sales pipeline management.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from .sales_engine import SalesEngine
from .sales_schema import (
    SalesLead,
    SalesInteraction,
    SalesPipelineSummary,
    DemoAccessRequest,
    LeadCreateRequest,
    LeadUpdateRequest,
    StageUpdateRequest,
    InteractionCreateRequest,
    LeadSource,
    LeadCategory,
    LeadPriority,
)

router = APIRouter(prefix="/sales", tags=["Sales Pipeline"])

sales_engine = SalesEngine()


@router.post("/lead", response_model=SalesLead)
async def create_lead(request: LeadCreateRequest):
    """
    Create a new sales lead.
    
    Args:
        request: Lead creation request
    
    Returns:
        SalesLead: Created lead
    """
    try:
        lead = sales_engine.create_lead(
            name=request.name,
            organization=request.organization,
            email=request.email,
            phone=request.phone,
            title=request.title,
            source=request.source,
            category=request.category,
            use_case=request.use_case,
            requirements=request.requirements,
            estimated_value=request.estimated_value,
        )
        return lead
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lead/{lead_id}/stage", response_model=SalesLead)
async def update_lead_stage(lead_id: str, request: StageUpdateRequest):
    """
    Update lead stage in pipeline.
    
    Args:
        lead_id: Lead ID
        request: Stage update request
    
    Returns:
        SalesLead: Updated lead
    """
    try:
        lead = sales_engine.update_lead_stage(
            lead_id=lead_id,
            new_stage=request.new_stage,
            notes=request.notes,
        )
        return lead
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interaction", response_model=SalesInteraction)
async def create_interaction(request: InteractionCreateRequest, lead_id: str = Query(...)):
    """
    Record an interaction with a lead.
    
    Args:
        request: Interaction creation request
        lead_id: Lead ID
    
    Returns:
        SalesInteraction: Created interaction
    """
    try:
        interaction = sales_engine.record_interaction(
            lead_id=lead_id,
            interaction_type=request.interaction_type,
            subject=request.subject,
            notes=request.notes,
            rep_name=request.rep_name,
            outcome=request.outcome,
            next_steps=request.next_steps,
        )
        return interaction
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/demo-request", response_model=SalesLead)
async def ingest_demo_request(request: DemoAccessRequest):
    """
    Ingest a demo access request and convert to lead.
    
    Args:
        request: Demo access request
    
    Returns:
        SalesLead: Created lead
    """
    try:
        lead = sales_engine.ingest_demo_request(request)
        return lead
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leads", response_model=List[SalesLead])
async def list_leads(
    category: Optional[LeadCategory] = None,
    priority: Optional[LeadPriority] = None,
    stage: Optional[str] = None,
    assigned_rep: Optional[str] = None,
):
    """
    List leads with optional filters.
    
    Args:
        category: Filter by category
        priority: Filter by priority
        stage: Filter by stage
        assigned_rep: Filter by assigned rep
    
    Returns:
        List[SalesLead]: Filtered leads
    """
    try:
        leads = sales_engine.list_leads(
            category=category,
            priority=priority,
            stage=stage,
            assigned_rep=assigned_rep,
        )
        return leads
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}", response_model=dict)
async def get_lead_details(lead_id: str):
    """
    Get complete lead details including history.
    
    Args:
        lead_id: Lead ID
    
    Returns:
        dict: Lead details with history
    """
    try:
        history = sales_engine.generate_lead_history(lead_id)
        return history
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary", response_model=SalesPipelineSummary)
async def get_pipeline_summary():
    """
    Get comprehensive pipeline summary.
    
    Returns:
        SalesPipelineSummary: Pipeline summary
    """
    try:
        summary = sales_engine.generate_pipeline_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/investor")
async def get_investor_view():
    """
    Get investor-friendly pipeline view.
    
    Returns:
        dict: Investor metrics
    """
    try:
        view = sales_engine.generate_investor_view()
        return view
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_health():
    """
    Get sales engine health status.
    
    Returns:
        dict: Health status
    """
    try:
        health = sales_engine.get_health()
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def sales_info():
    """
    Get sales API information.
    
    Returns:
        dict: API information
    """
    return {
        "name": "GhostQuant Enterprise Sales Pipeline API",
        "version": "1.0.0",
        "description": "Complete enterprise acquisition workflow system",
        "endpoints": {
            "POST /sales/lead": "Create a new sales lead",
            "POST /sales/lead/{id}/stage": "Update lead stage",
            "POST /sales/interaction": "Record interaction",
            "POST /sales/demo-request": "Ingest demo request",
            "GET /sales/leads": "List leads with filters",
            "GET /sales/lead/{id}": "Get lead details",
            "GET /sales/summary": "Get pipeline summary",
            "GET /sales/investor": "Get investor view",
            "GET /sales/health": "Get health status",
            "GET /sales/": "Get API info",
        },
        "features": [
            "Complete CRUD operations",
            "AI-driven lead scoring",
            "Automated prioritization",
            "8-stage pipeline",
            "Interaction tracking",
            "Follow-up task generation",
            "Pipeline analytics",
            "Investor reporting",
        ],
    }

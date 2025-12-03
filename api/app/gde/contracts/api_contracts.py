"""
Channel Partner Contract API Router
Global Distributor Edition (GDE)

FastAPI router providing REST endpoints for contract management,
negotiation workflows, pricing, compliance, and territory operations.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from datetime import datetime

from .contract_schema import (
    ContractType,
    ContractStatus,
    DistributorTier,
    RegionCode,
    CurrencyCode,
    NegotiationStatus
)
from .contract_engine import ContractEngine
from .contract_validator import ContractValidator
from .contract_negotiation import NegotiationEngine
from .contract_pricing import PricingEngine
from .contract_compliance import ComplianceEngine
from .contract_territory import TerritoryEngine
from .contract_renewal import RenewalEngine
from .contract_storage import ContractStorage
from .contract_templates import ContractTemplates

router = APIRouter(prefix="/contracts", tags=["contracts"])

contract_engine = ContractEngine()
contract_validator = ContractValidator()
negotiation_engine = NegotiationEngine()
pricing_engine = PricingEngine()
compliance_engine = ComplianceEngine()
territory_engine = TerritoryEngine()
renewal_engine = RenewalEngine()
contract_storage = ContractStorage()
contract_templates = ContractTemplates()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check for contracts module"""
    return {
        "status": "healthy",
        "module": "contracts",
        "version": "3.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "engine": contract_engine.health(),
            "validator": contract_validator.health(),
            "negotiation": negotiation_engine.health(),
            "pricing": pricing_engine.health(),
            "compliance": compliance_engine.health(),
            "territory": territory_engine.health(),
            "renewal": renewal_engine.health(),
            "storage": contract_storage.health()
        }
    }


@router.post("/generate")
async def generate_contract(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a new distributor contract
    
    Request body:
    - distributor_data: Distributor profile information
    - contract_type: Type of contract (master, regional, exclusive, etc.)
    - tier: Distributor tier
    - region: Primary region
    - territories: List of territory definitions
    - term_months: Contract term in months
    - currency: Contract currency
    """
    try:
        distributor_data = request.get("distributor_data", {})
        contract_type_str = request.get("contract_type", "MASTER_DISTRIBUTION")
        tier_str = request.get("tier", "AUTHORIZED")
        region_str = request.get("region", "AMERICAS")
        territories_data = request.get("territories", [])
        term_months = request.get("term_months", 36)
        currency_str = request.get("currency", "USD")
        
        contract_type = ContractType[contract_type_str]
        tier = DistributorTier[tier_str]
        region = RegionCode[region_str]
        currency = CurrencyCode[currency_str]
        
        distributor = contract_engine.create_distributor_profile(
            company_name=distributor_data.get("company_name", "Unknown Company"),
            legal_name=distributor_data.get("legal_name", ""),
            registration_number=distributor_data.get("registration_number", ""),
            tax_id=distributor_data.get("tax_id", ""),
            headquarters_address=distributor_data.get("headquarters_address", {}),
            primary_region=region,
            year_established=distributor_data.get("year_established", 2020),
            employee_count=distributor_data.get("employee_count", 10),
            annual_revenue=distributor_data.get("annual_revenue", 100000),
            industry_certifications=distributor_data.get("industry_certifications", []),
            key_contacts=distributor_data.get("key_contacts", [])
        )
        
        territories = []
        if territories_data:
            for t_data in territories_data:
                territory = territory_engine.create_territory(
                    territory_name=t_data.get("name", f"{region.value} Territory"),
                    region=RegionCode[t_data.get("region", region_str)],
                    countries=t_data.get("countries"),
                    is_exclusive=t_data.get("is_exclusive", False)
                )
                territories.append(territory)
        else:
            territory = territory_engine.create_territory(
                territory_name=f"{region.value} Territory",
                region=region
            )
            territories.append(territory)
        
        contract = contract_engine.generate_contract(
            distributor=distributor,
            contract_type=contract_type,
            tier=tier,
            region=region,
            territories=territories,
            term_months=term_months,
            currency=currency
        )
        
        contract_storage.save_contract(contract)
        
        return {
            "success": True,
            "contract": contract.to_dict(),
            "message": f"Contract {contract.contract_number} generated successfully"
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid enum value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_contracts(
    status: Optional[str] = Query(None, description="Filter by status"),
    tier: Optional[str] = Query(None, description="Filter by tier"),
    region: Optional[str] = Query(None, description="Filter by region"),
    contract_type: Optional[str] = Query(None, description="Filter by contract type"),
    distributor_name: Optional[str] = Query(None, description="Filter by distributor name"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
) -> Dict[str, Any]:
    """List contracts with optional filters"""
    try:
        status_enum = ContractStatus[status] if status else None
        tier_enum = DistributorTier[tier] if tier else None
        region_enum = RegionCode[region] if region else None
        type_enum = ContractType[contract_type] if contract_type else None
        
        contracts = contract_storage.list_contracts(
            status=status_enum,
            contract_type=type_enum,
            tier=tier_enum,
            region=region_enum,
            distributor_name=distributor_name,
            limit=limit,
            offset=offset
        )
        
        return {
            "success": True,
            "contracts": [c.to_dict() for c in contracts],
            "count": len(contracts),
            "total": contract_storage.count_contracts(status_enum)
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid filter value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summaries")
async def get_contract_summaries(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500)
) -> Dict[str, Any]:
    """Get contract summaries for listing"""
    try:
        status_enum = ContractStatus[status] if status else None
        summaries = contract_storage.get_contract_summaries(status=status_enum, limit=limit)
        
        return {
            "success": True,
            "summaries": [s.to_dict() for s in summaries],
            "count": len(summaries)
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid status: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{contract_id}")
async def get_contract(contract_id: str) -> Dict[str, Any]:
    """Get a specific contract by ID"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    return {
        "success": True,
        "contract": contract.to_dict()
    }


@router.get("/number/{contract_number}")
async def get_contract_by_number(contract_number: str) -> Dict[str, Any]:
    """Get a contract by contract number"""
    contract = contract_storage.get_contract_by_number(contract_number)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_number} not found")
    
    return {
        "success": True,
        "contract": contract.to_dict()
    }


@router.put("/{contract_id}/status")
async def update_contract_status(
    contract_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Update contract status"""
    try:
        new_status = ContractStatus[request.get("status", "DRAFT")]
        reason = request.get("reason", "")
        
        contract = contract_storage.update_status(contract_id, new_status, reason)
        
        if not contract:
            raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
        
        return {
            "success": True,
            "contract": contract.to_dict(),
            "message": f"Status updated to {new_status.value}"
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid status: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{contract_id}/validate")
async def validate_contract(contract_id: str) -> Dict[str, Any]:
    """Validate a contract"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    existing_contracts = contract_storage.list_contracts(status=ContractStatus.ACTIVE)
    existing_contracts = [c for c in existing_contracts if c.contract_id != contract_id]
    
    result = contract_validator.validate_contract(contract, existing_contracts)
    
    return {
        "success": True,
        "validation_result": result.to_dict()
    }


@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    hard_delete: bool = Query(False, description="Permanently delete")
) -> Dict[str, Any]:
    """Delete a contract"""
    if hard_delete:
        success = contract_storage.hard_delete_contract(contract_id)
    else:
        success = contract_storage.delete_contract(contract_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    return {
        "success": True,
        "message": f"Contract {contract_id} {'permanently deleted' if hard_delete else 'terminated'}"
    }


@router.post("/{contract_id}/negotiation/start")
async def start_negotiation(
    contract_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Start a negotiation workflow for a contract"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    workflow = negotiation_engine.create_negotiation_workflow(
        contract=contract,
        initial_terms=request.get("initial_terms"),
        max_rounds=request.get("max_rounds", 5),
        deadline_days=request.get("deadline_days", 30),
        stakeholders=request.get("stakeholders")
    )
    
    workflow = negotiation_engine.start_negotiation(workflow.workflow_id)
    
    return {
        "success": True,
        "workflow": workflow.to_dict(),
        "message": "Negotiation workflow started"
    }


@router.get("/{contract_id}/negotiation")
async def get_negotiation_workflow(contract_id: str) -> Dict[str, Any]:
    """Get negotiation workflow for a contract"""
    workflows = negotiation_engine.list_workflows(contract_id=contract_id)
    
    if not workflows:
        raise HTTPException(
            status_code=404,
            detail=f"No negotiation workflow found for contract {contract_id}"
        )
    
    workflow = workflows[0]
    
    return {
        "success": True,
        "workflow": workflow.to_dict(),
        "summary": negotiation_engine.get_workflow_summary(workflow.workflow_id)
    }


@router.post("/negotiation/{workflow_id}/counter-proposal")
async def submit_counter_proposal(
    workflow_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Submit a counter-proposal in negotiation"""
    try:
        workflow = negotiation_engine.submit_counter_proposal(
            workflow_id=workflow_id,
            proposed_changes=request.get("proposed_changes", []),
            submitter=request.get("submitter", {}),
            justification=request.get("justification", "")
        )
        
        return {
            "success": True,
            "workflow": workflow.to_dict(),
            "message": "Counter-proposal submitted"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/negotiation/{workflow_id}/approve")
async def process_negotiation_approval(
    workflow_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Process approval in negotiation workflow"""
    try:
        workflow = negotiation_engine.process_approval(
            workflow_id=workflow_id,
            approver_role=request.get("approver_role", ""),
            approver=request.get("approver", {}),
            approved=request.get("approved", True),
            comments=request.get("comments", "")
        )
        
        return {
            "success": True,
            "workflow": workflow.to_dict(),
            "message": f"Approval {'granted' if request.get('approved') else 'denied'}"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/negotiation/{workflow_id}/finalize")
async def finalize_negotiation(
    workflow_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Finalize negotiation and prepare for contract execution"""
    try:
        workflow = negotiation_engine.finalize_negotiation(
            workflow_id=workflow_id,
            finalizer=request.get("finalizer", {})
        )
        
        return {
            "success": True,
            "workflow": workflow.to_dict(),
            "message": "Negotiation finalized"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pricing/calculate")
async def calculate_pricing(request: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate deal pricing"""
    try:
        product_id = request.get("product_id", "ghostquant_enterprise")
        quantity = request.get("quantity", 1)
        tier = DistributorTier[request.get("tier", "AUTHORIZED")]
        currency = CurrencyCode[request.get("currency", "USD")]
        region = RegionCode[request.get("region", "AMERICAS")]
        years = request.get("years", 1)
        special_discount = request.get("special_discount", 0.0)
        
        pricing = pricing_engine.calculate_deal_price(
            product_id=product_id,
            quantity=quantity,
            tier=tier,
            currency=currency,
            region=region,
            years=years,
            special_discount=special_discount
        )
        
        return {
            "success": True,
            "pricing": pricing
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pricing/price-list")
async def get_price_list(
    tier: str = Query("AUTHORIZED", description="Distributor tier"),
    currency: str = Query("USD", description="Currency"),
    region: str = Query("AMERICAS", description="Region")
) -> Dict[str, Any]:
    """Get price list for a tier"""
    try:
        tier_enum = DistributorTier[tier]
        currency_enum = CurrencyCode[currency]
        region_enum = RegionCode[region]
        
        price_list = pricing_engine.generate_price_list(
            tier=tier_enum,
            currency=currency_enum,
            region=region_enum
        )
        
        return {
            "success": True,
            "price_list": price_list
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pricing/rebate")
async def calculate_rebate(request: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate rebate based on performance"""
    try:
        contract_id = request.get("contract_id")
        actual_revenue = request.get("actual_revenue", 0)
        actual_growth = request.get("actual_growth", 0)
        new_customers = request.get("new_customers", 0)
        
        contract = contract_storage.get_contract(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
        
        rebates = pricing_engine.calculate_total_rebates(
            rebate_structures=contract.terms.rebates,
            actual_revenue=actual_revenue,
            actual_growth=actual_growth,
            new_customers=new_customers
        )
        
        return {
            "success": True,
            "rebates": rebates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compliance/assess")
async def assess_compliance(request: Dict[str, Any]) -> Dict[str, Any]:
    """Assess distributor compliance readiness"""
    try:
        contract_id = request.get("contract_id")
        
        contract = contract_storage.get_contract(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
        
        regions = [t.region_code for t in contract.terms.territories]
        
        assessment = compliance_engine.assess_distributor_compliance(
            distributor=contract.distributor,
            tier=contract.terms.distributor_tier,
            regions=regions
        )
        
        return {
            "success": True,
            "assessment": assessment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{contract_id}/compliance/status")
async def get_compliance_status(contract_id: str) -> Dict[str, Any]:
    """Get compliance status for a contract"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    status = compliance_engine.check_compliance_status(contract)
    
    return {
        "success": True,
        "compliance_status": status
    }


@router.post("/compliance/certification")
async def register_certification(request: Dict[str, Any]) -> Dict[str, Any]:
    """Register a compliance certification"""
    try:
        certification = compliance_engine.register_certification(
            distributor_id=request.get("distributor_id"),
            certification_name=request.get("certification_name"),
            certification_body=request.get("certification_body"),
            issue_date=request.get("issue_date"),
            expiry_date=request.get("expiry_date"),
            certificate_number=request.get("certificate_number"),
            scope=request.get("scope", "")
        )
        
        return {
            "success": True,
            "certification": certification
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compliance/audit")
async def schedule_audit(request: Dict[str, Any]) -> Dict[str, Any]:
    """Schedule a compliance audit"""
    try:
        audit = compliance_engine.schedule_audit(
            contract_id=request.get("contract_id"),
            distributor_id=request.get("distributor_id"),
            audit_type=request.get("audit_type", "internal"),
            scheduled_date=request.get("scheduled_date"),
            auditor=request.get("auditor", {}),
            scope=request.get("scope", [])
        )
        
        return {
            "success": True,
            "audit": audit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/territory/regions")
async def list_regions() -> Dict[str, Any]:
    """List all available regions"""
    regions = []
    for region in RegionCode:
        info = territory_engine.get_region_info(region)
        regions.append({
            "code": region.value,
            "name": info.get("name", region.value),
            "countries_count": len(info.get("countries", [])),
            "market_maturity": info.get("market_maturity", "unknown")
        })
    
    return {
        "success": True,
        "regions": regions
    }


@router.get("/territory/region/{region_code}")
async def get_region_details(region_code: str) -> Dict[str, Any]:
    """Get detailed information about a region"""
    try:
        region = RegionCode[region_code]
        info = territory_engine.get_region_info(region)
        
        return {
            "success": True,
            "region": {
                "code": region.value,
                **info
            }
        }
        
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Region {region_code} not found")


@router.post("/territory/check-conflicts")
async def check_territory_conflicts(request: Dict[str, Any]) -> Dict[str, Any]:
    """Check for territory conflicts"""
    try:
        territory_data = request.get("territory", {})
        region = RegionCode[territory_data.get("region", "AMERICAS")]
        
        territory = territory_engine.create_territory(
            territory_name=territory_data.get("name", "New Territory"),
            region=region,
            countries=territory_data.get("countries"),
            is_exclusive=territory_data.get("is_exclusive", False)
        )
        
        existing_contracts = contract_storage.list_contracts(status=ContractStatus.ACTIVE)
        
        conflicts = territory_engine.check_territory_conflicts(territory, existing_contracts)
        
        return {
            "success": True,
            "conflicts": conflicts,
            "has_conflicts": len(conflicts) > 0
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{contract_id}/renewal/eligibility")
async def check_renewal_eligibility(contract_id: str) -> Dict[str, Any]:
    """Check if contract is eligible for renewal"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    eligibility = renewal_engine.check_renewal_eligibility(contract)
    
    return {
        "success": True,
        "eligibility": eligibility
    }


@router.post("/{contract_id}/renewal/calculate")
async def calculate_renewal_terms(
    contract_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate proposed renewal terms"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    renewal_terms = renewal_engine.calculate_renewal_terms(
        contract=contract,
        performance_data=request.get("performance_data"),
        requested_changes=request.get("requested_changes")
    )
    
    return {
        "success": True,
        "renewal_terms": renewal_terms
    }


@router.post("/{contract_id}/renewal/create")
async def create_renewal(
    contract_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Create a contract renewal"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    try:
        renewal = renewal_engine.create_renewal(
            contract=contract,
            renewal_terms=request.get("renewal_terms", {}),
            approved_by=request.get("approved_by", {})
        )
        
        return {
            "success": True,
            "renewal": renewal.to_dict(),
            "message": "Renewal created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{contract_id}/amendment")
async def create_amendment(
    contract_id: str,
    request: Dict[str, Any]
) -> Dict[str, Any]:
    """Create a contract amendment"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    try:
        amendment = renewal_engine.create_amendment(
            contract=contract,
            amendment_type=request.get("amendment_type", "general_modification"),
            sections_modified=request.get("sections_modified", []),
            original_terms=request.get("original_terms", {}),
            amended_terms=request.get("amended_terms", {}),
            reason=request.get("reason", ""),
            approved_by=request.get("approved_by", [])
        )
        
        return {
            "success": True,
            "amendment": amendment.to_dict(),
            "message": f"Amendment {amendment.amendment_number} created"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{contract_id}/amendments")
async def get_amendment_history(contract_id: str) -> Dict[str, Any]:
    """Get amendment history for a contract"""
    amendments = renewal_engine.get_amendment_history(contract_id)
    
    return {
        "success": True,
        "amendments": [a.to_dict() for a in amendments],
        "count": len(amendments)
    }


@router.get("/{contract_id}/renewals")
async def get_renewal_history(contract_id: str) -> Dict[str, Any]:
    """Get renewal history for a contract"""
    renewals = renewal_engine.get_renewal_history(contract_id)
    
    return {
        "success": True,
        "renewals": [r.to_dict() for r in renewals],
        "count": len(renewals)
    }


@router.get("/renewal/queue")
async def get_renewal_queue(
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status: Optional[str] = Query(None, description="Filter by status")
) -> Dict[str, Any]:
    """Get renewal queue"""
    queue = renewal_engine.get_renewal_queue(priority=priority, status=status)
    
    return {
        "success": True,
        "queue": queue,
        "count": len(queue)
    }


@router.get("/renewal/expiring")
async def get_expiring_contracts(
    days: int = Query(90, ge=1, le=365, description="Days ahead to check")
) -> Dict[str, Any]:
    """Get contracts expiring within specified days"""
    expiring = contract_storage.get_expiring_contracts(days=days)
    
    return {
        "success": True,
        "expiring_contracts": [c.to_dict() for c in expiring],
        "count": len(expiring),
        "days_checked": days
    }


@router.get("/templates/list")
async def list_templates() -> Dict[str, Any]:
    """List available contract templates"""
    return {
        "success": True,
        "templates": [
            {"id": "master", "name": "Master Distribution Agreement"},
            {"id": "regional", "name": "Regional Distribution Agreement"},
            {"id": "exclusive", "name": "Exclusive Distribution Agreement"},
            {"id": "oem", "name": "OEM Distribution Agreement"},
            {"id": "government", "name": "Government Distribution Agreement"}
        ]
    }


@router.get("/templates/{template_id}")
async def get_template(
    template_id: str,
    region: str = Query("AMERICAS", description="Region for template")
) -> Dict[str, Any]:
    """Get a specific contract template"""
    try:
        region_enum = RegionCode[region]
        
        template_methods = {
            "master": contract_templates.get_master_distribution_template,
            "regional": lambda: contract_templates.get_regional_distribution_template(region_enum),
            "exclusive": contract_templates.get_exclusive_distribution_template,
            "oem": contract_templates.get_oem_distribution_template,
            "government": contract_templates.get_government_distribution_template
        }
        
        if template_id not in template_methods:
            raise HTTPException(status_code=404, detail=f"Template {template_id} not found")
        
        template = template_methods[template_id]()
        
        return {
            "success": True,
            "template": template
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid region: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates/exhibits/{exhibit_type}")
async def get_exhibit(
    exhibit_type: str,
    tier: str = Query("AUTHORIZED", description="Distributor tier"),
    region: str = Query("AMERICAS", description="Region")
) -> Dict[str, Any]:
    """Get contract exhibit"""
    try:
        tier_enum = DistributorTier[tier]
        region_enum = RegionCode[region]
        
        exhibit_methods = {
            "products": lambda: contract_templates.get_exhibit_a_products(tier_enum),
            "territory": lambda: contract_templates.get_exhibit_b_territory(region_enum),
            "benefits": lambda: contract_templates.get_exhibit_c_tier_benefits(tier_enum)
        }
        
        if exhibit_type not in exhibit_methods:
            raise HTTPException(status_code=404, detail=f"Exhibit {exhibit_type} not found")
        
        exhibit = exhibit_methods[exhibit_type]()
        
        return {
            "success": True,
            "exhibit": exhibit
        }
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid value: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics")
async def get_statistics() -> Dict[str, Any]:
    """Get contract statistics"""
    stats = contract_storage.get_statistics()
    
    return {
        "success": True,
        "statistics": stats
    }


@router.get("/analytics/{contract_id}")
async def get_contract_analytics(contract_id: str) -> Dict[str, Any]:
    """Get analytics for a specific contract"""
    contract = contract_storage.get_contract(contract_id)
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found")
    
    analytics = contract_engine.calculate_contract_analytics(contract)
    
    return {
        "success": True,
        "analytics": analytics.to_dict()
    }


@router.get("/distributor/{distributor_id}/contracts")
async def get_distributor_contracts(distributor_id: str) -> Dict[str, Any]:
    """Get all contracts for a distributor"""
    contracts = contract_storage.get_contracts_by_distributor(distributor_id)
    
    return {
        "success": True,
        "contracts": [c.to_dict() for c in contracts],
        "count": len(contracts)
    }


@router.get("/history")
async def get_contract_history(
    contract_id: Optional[str] = Query(None, description="Filter by contract ID"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    limit: int = Query(100, ge=1, le=1000)
) -> Dict[str, Any]:
    """Get contract action history"""
    history = contract_storage.get_history(
        contract_id=contract_id,
        action=action,
        limit=limit
    )
    
    return {
        "success": True,
        "history": history,
        "count": len(history)
    }


@router.post("/export")
async def export_contracts(request: Dict[str, Any]) -> Dict[str, Any]:
    """Export contracts"""
    format_type = request.get("format", "dict")
    
    data = contract_storage.export_contracts(format=format_type)
    
    return {
        "success": True,
        "data": data,
        "count": len(data),
        "format": format_type,
        "exported_at": datetime.utcnow().isoformat()
    }

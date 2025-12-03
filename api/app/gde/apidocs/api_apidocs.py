"""
API Documentation Endpoints
FastAPI routes for API documentation portal.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from .apidocs_engine import APIDocsEngine
from .apidocs_health import APIDocsHealthChecker
from .apidocs_tester import APIEndpointTester
from .apidocs_examples import CodeExampleGenerator
from .apidocs_registry import get_all_endpoints, get_all_sections, get_endpoint_by_id, get_endpoints_by_section

router = APIRouter(prefix="/apidocs", tags=["API Documentation"])

docs_engine = APIDocsEngine()
health_checker = APIDocsHealthChecker()
endpoint_tester = APIEndpointTester()
example_generator = CodeExampleGenerator()


@router.get("/")
async def get_api_docs_info():
    """
    Get API documentation portal information.
    
    Returns:
        dict: Portal information
    """
    return {
        "name": "GhostQuant API Documentation Portal",
        "version": "1.0.0",
        "description": "Complete enterprise-grade API documentation with interactive testing",
        "features": [
            "150+ documented endpoints",
            "Interactive API testing console",
            "Code examples in 5 languages",
            "Real-time endpoint testing",
            "Comprehensive API reference",
            "Developer quickstart guides",
        ],
        "endpoints": {
            "GET /apidocs/": "Get portal information",
            "GET /apidocs/summary": "Get documentation summary",
            "GET /apidocs/endpoints": "List all endpoints",
            "GET /apidocs/endpoint/{name}": "Get endpoint details",
            "POST /apidocs/test": "Test an endpoint",
            "GET /apidocs/examples/{lang}": "Get code examples",
            "GET /apidocs/health": "Get health status",
            "GET /apidocs/info": "Get API info",
        },
        "supported_languages": [
            "python",
            "javascript",
            "curl",
            "go",
            "java",
        ],
    }


@router.get("/summary")
async def get_documentation_summary():
    """
    Get comprehensive documentation summary.
    
    Returns:
        dict: Documentation summary with metrics
    """
    try:
        summary = docs_engine.generate_summary()
        return summary.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/endpoints")
async def list_all_endpoints(
    section: Optional[str] = None,
    method: Optional[str] = None,
    risk_level: Optional[str] = None,
):
    """
    List all API endpoints with optional filtering.
    
    Args:
        section: Filter by section
        method: Filter by HTTP method
        risk_level: Filter by risk level
    
    Returns:
        dict: List of endpoints
    """
    try:
        endpoints = get_all_endpoints()
        
        if section:
            endpoints = [e for e in endpoints if e.section == section]
        
        if method:
            endpoints = [e for e in endpoints if e.method.value == method.upper()]
        
        if risk_level:
            endpoints = [e for e in endpoints if e.risk_level.value == risk_level.lower()]
        
        return {
            "endpoints": [e.dict() for e in endpoints],
            "total_count": len(endpoints),
            "filters": {
                "section": section,
                "method": method,
                "risk_level": risk_level,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/endpoint/{endpoint_id}")
async def get_endpoint_details(endpoint_id: str):
    """
    Get detailed documentation for a specific endpoint.
    
    Args:
        endpoint_id: Endpoint identifier
    
    Returns:
        dict: Endpoint documentation
    """
    try:
        endpoint = get_endpoint_by_id(endpoint_id)
        
        if not endpoint.code_examples:
            endpoint.code_examples = example_generator.generate_all_examples(endpoint)
        
        return endpoint.dict()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def test_endpoint(
    endpoint_id: str = Query(...),
    params: Optional[dict] = None,
    body: Optional[dict] = None,
):
    """
    Test an API endpoint with provided parameters.
    
    Args:
        endpoint_id: Endpoint to test
        params: Query/path parameters
        body: Request body
    
    Returns:
        dict: Test result
    """
    try:
        endpoint = get_endpoint_by_id(endpoint_id)
        
        validation = endpoint_tester.validate_request(endpoint, params or {}, body)
        if not validation["valid"]:
            return {
                "test_status": "validation_failed",
                "validation": validation,
            }
        
        result = endpoint_tester.test_endpoint(endpoint, params, body)
        
        return {
            "test_status": "completed",
            "result": result.dict(),
            "validation": validation,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/examples/{language}")
async def get_code_examples(language: str):
    """
    Get code examples for a specific language.
    
    Args:
        language: Programming language (python, javascript, curl, go, java)
    
    Returns:
        dict: Code examples
    """
    try:
        supported_languages = ["python", "javascript", "curl", "go", "java"]
        
        if language.lower() not in supported_languages:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language. Supported: {', '.join(supported_languages)}"
            )
        
        examples = example_generator.get_language_examples(language.lower())
        
        return {
            "language": language,
            "examples": [e.dict() for e in examples],
            "total_count": len(examples),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_health_status():
    """
    Get API documentation health status.
    
    Returns:
        dict: Health status
    """
    try:
        health = health_checker.get_health_summary()
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info")
async def get_api_info():
    """
    Get comprehensive API information.
    
    Returns:
        dict: API information including sections, quickstart, top actions
    """
    try:
        sections = get_all_sections()
        quickstart = docs_engine.generate_quickstart()
        top_actions = docs_engine.generate_top_20_actions()
        console_config = docs_engine.generate_console_config()
        
        return {
            "sections": [s.dict() for s in sections],
            "quickstart": quickstart,
            "top_20_actions": top_actions,
            "console_config": console_config,
            "total_endpoints": len(get_all_endpoints()),
            "total_sections": len(sections),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

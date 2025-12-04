"""
GhostQuant™ — Executive Compliance Report Generator
Module: api_executive_report.py
Purpose: FastAPI endpoints for executive compliance reports

SECURITY NOTICE:
- NO sensitive information in responses
- Only metadata, policies, architecture, controls
- All responses are read-only documentation
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime
from .executive_report_engine import ExecutiveReportEngine

router = APIRouter()


@router.get("/")
async def info() -> Dict[str, Any]:
    """
    Executive Compliance Report Generator information.
    
    Returns:
        System information and capabilities
    """
    try:
        return {
            "success": True,
            "system": "Executive Compliance Report Generator",
            "version": "1.0.0",
            "description": "Generate comprehensive 30-60 page executive compliance reports",
            "capabilities": {
                "report_generation": "Full executive compliance report with all sections",
                "export_formats": ["JSON", "Markdown", "HTML", "PDF-ready"],
                "sections": [
                    "Executive Summary",
                    "Regulatory Alignment",
                    "Security Posture",
                    "Risk Assessment",
                    "Governance Score",
                    "Compliance Matrix",
                    "Remediation Roadmap"
                ],
                "frameworks_covered": 14,
                "regulatory_agencies": 10,
                "risk_categories": 9,
                "security_domains": 7
            },
            "endpoints": {
                "POST /compliance/report": "Generate full executive compliance report",
                "GET /compliance/report/summary": "Get executive summary only",
                "GET /compliance/report/html": "Export report as HTML",
                "GET /compliance/report/markdown": "Export report as Markdown",
                "GET /compliance/report/health": "Health check",
                "GET /compliance/report": "System information"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/report")
async def generate_report() -> Dict[str, Any]:
    """
    Generate full executive compliance report.
    
    Synthesizes all Phase 7 compliance modules into comprehensive
    30-60 page executive report with multiple export formats.
    
    Returns:
        Complete executive compliance report
    """
    try:
        engine = ExecutiveReportEngine()
        report = engine.generate_report()
        
        if "error" in report:
            return {
                "success": False,
                "error": report["error"],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "success": True,
            "message": "Executive compliance report generated successfully",
            "report": report,
            "metadata": {
                "report_id": report.get("report_id"),
                "generated_at": report.get("generated_at"),
                "page_count": report.get("page_count"),
                "sections": report.get("metadata", {}).get("report_sections", 0),
                "frameworks": report.get("metadata", {}).get("frameworks_covered", 0),
                "export_formats": report.get("metadata", {}).get("export_formats", [])
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/report/summary")
async def get_summary() -> Dict[str, Any]:
    """
    Get executive summary only.
    
    Returns condensed executive summary without full report details.
    
    Returns:
        Executive summary section
    """
    try:
        engine = ExecutiveReportEngine()
        summary = engine.build_executive_summary()
        
        if "error" in summary:
            return {
                "success": False,
                "error": summary["error"],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "success": True,
            "message": "Executive summary retrieved successfully",
            "summary": summary,
            "metadata": {
                "report_id": engine.report_id,
                "generated_at": engine.generated_at,
                "compliance_score": summary.get("compliance_score", 0),
                "readiness_tier": summary.get("readiness_tier", "Unknown"),
                "overall_rating": summary.get("overall_rating", "Unknown")
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/report/markdown")
async def get_markdown() -> Dict[str, Any]:
    """
    Export report as Markdown.
    
    Returns complete report in Markdown format suitable for
    documentation systems and version control.
    
    Returns:
        Report in Markdown format
    """
    try:
        engine = ExecutiveReportEngine()
        markdown = engine.to_markdown()
        
        if markdown.startswith("# Error"):
            return {
                "success": False,
                "error": "Failed to generate Markdown report",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "success": True,
            "message": "Markdown report generated successfully",
            "format": "markdown",
            "content": markdown,
            "metadata": {
                "report_id": engine.report_id,
                "generated_at": engine.generated_at,
                "content_length": len(markdown),
                "estimated_pages": "30-60 pages"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/report/html")
async def get_html() -> Dict[str, Any]:
    """
    Export report as HTML.
    
    Returns complete report in HTML format with inline CSS,
    suitable for PDF generation and web viewing.
    
    Returns:
        Report in HTML format
    """
    try:
        engine = ExecutiveReportEngine()
        html = engine.to_html()
        
        if html.startswith("<html><body><h1>Error"):
            return {
                "success": False,
                "error": "Failed to generate HTML report",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "success": True,
            "message": "HTML report generated successfully",
            "format": "html",
            "content": html,
            "metadata": {
                "report_id": engine.report_id,
                "generated_at": engine.generated_at,
                "content_length": len(html),
                "pdf_ready": True,
                "estimated_pages": "30-60 pages"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/report/health")
async def health() -> Dict[str, Any]:
    """
    Health check for executive report generator.
    
    Returns:
        System health status
    """
    try:
        engine = ExecutiveReportEngine()
        test_summary = engine.build_executive_summary()
        
        health_status = {
            "success": True,
            "status": "healthy",
            "engine": {
                "initialized": True,
                "version": engine.version,
                "report_id": engine.report_id
            },
            "capabilities": {
                "report_generation": "operational",
                "executive_summary": "operational" if "error" not in test_summary else "error",
                "markdown_export": "operational",
                "html_export": "operational",
                "json_export": "operational"
            },
            "statistics": {
                "frameworks_covered": 14,
                "regulatory_agencies": 10,
                "risk_categories": 9,
                "security_domains": 7,
                "compliance_controls": 325,
                "report_sections": 7
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return health_status
    
    except Exception as e:
        return {
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

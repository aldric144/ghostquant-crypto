"""
GhostQuant™ — Full Compliance Documentation Exporter System
Module: api_exporter.py
Purpose: FastAPI router for compliance documentation export

SECURITY NOTICE:
- NO sensitive information in exports
- Only metadata, policies, architecture, controls
- All exports are read-only documentation
- All endpoints return JSON only (never raise exceptions)
"""

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from typing import Dict, Any, List
import os

from .documentation_builder import ComplianceDocumentationBuilder
from .exporter_engine import get_exporter_engine
from .exporter_schema import DocumentType


router = APIRouter()


@router.get("/")
async def get_exporter_info() -> Dict[str, Any]:
    """
    Get compliance exporter system information.
    
    Returns:
        System information and available document types
    """
    try:
        return {
            "success": True,
            "system": "GhostQuant™ Compliance Documentation Exporter",
            "version": "1.0.0",
            "description": "Automated compliance documentation generator for regulator-grade documents",
            "supported_formats": ["json", "markdown", "text"],
            "document_types": [
                {
                    "type": "cjis",
                    "name": "CJIS Security Policy Compliance",
                    "description": "Criminal Justice Information Services Security Policy compliance documentation"
                },
                {
                    "type": "nist",
                    "name": "NIST 800-53 Security Controls Matrix",
                    "description": "National Institute of Standards and Technology security controls implementation"
                },
                {
                    "type": "soc2",
                    "name": "SOC 2 Type II Architecture",
                    "description": "Service Organization Control 2 compliance architecture and controls"
                },
                {
                    "type": "fedramp",
                    "name": "FedRAMP LITE Roadmap",
                    "description": "Federal Risk and Authorization Management Program compliance roadmap"
                },
                {
                    "type": "aml",
                    "name": "AML/KYC Compliance Framework",
                    "description": "Anti-Money Laundering and Know Your Customer compliance documentation"
                },
                {
                    "type": "datagov",
                    "name": "Data Governance & Privacy Framework",
                    "description": "Comprehensive data governance and privacy compliance documentation"
                },
                {
                    "type": "ir",
                    "name": "Incident Response & Forensics Framework",
                    "description": "Incident response, threat monitoring, and forensic evidence procedures"
                },
                {
                    "type": "audit",
                    "name": "Audit Logging & Monitoring Framework",
                    "description": "Comprehensive audit logging and monitoring compliance documentation"
                },
                {
                    "type": "zerotrust",
                    "name": "Zero-Trust Access Control Framework",
                    "description": "Identity, access control, and zero-trust security architecture"
                },
                {
                    "type": "privacy",
                    "name": "Privacy Shield & Data Minimization",
                    "description": "Privacy protection and data minimization compliance framework"
                },
                {
                    "type": "ssdlc",
                    "name": "Secure Software Development Lifecycle",
                    "description": "Secure SDLC practices and compliance documentation"
                },
                {
                    "type": "keymgmt",
                    "name": "Key Management & Secrets Governance",
                    "description": "Cryptographic key management and secrets governance framework"
                },
                {
                    "type": "isolation",
                    "name": "Environment Isolation & Boundaries",
                    "description": "Environment isolation and boundary enforcement documentation"
                },
                {
                    "type": "configmgmt",
                    "name": "Configuration Management & Hardening",
                    "description": "Secure configuration management and system hardening standards"
                }
            ],
            "compliance_frameworks": [
                "CJIS Security Policy v5.9",
                "NIST 800-53 Rev 5",
                "SOC 2 Type II",
                "FedRAMP LITE",
                "FinCEN / Bank Secrecy Act",
                "GDPR / CCPA",
                "NIST 800-61 / ISO 27035",
                "NIST 800-207 (Zero Trust)",
                "NIST Privacy Framework",
                "NIST 800-218 / OWASP SAMM",
                "NIST 800-57 / FIPS 140-2",
                "CIS Benchmarks"
            ]
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/docs")
async def list_document_types() -> Dict[str, Any]:
    """
    List all available document types.
    
    Returns:
        List of document types with metadata
    """
    try:
        from .exporter_schema import DOCUMENT_TYPE_METADATA
        
        doc_types = []
        
        for doc_type, metadata in DOCUMENT_TYPE_METADATA.items():
            doc_types.append({
                "type": doc_type.value,
                "name": metadata["name"],
                "description": metadata["description"],
                "frameworks": metadata["frameworks"],
                "sections_count": metadata["sections_count"]
            })
        
        return {
            "success": True,
            "document_types": doc_types,
            "total_types": len(doc_types)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/generate/{doc_type}")
async def generate_document(doc_type: str) -> Dict[str, Any]:
    """
    Generate a compliance document.
    
    Args:
        doc_type: Type of document to generate (cjis, nist, soc2, etc.)
        
    Returns:
        Generated document metadata and export results
    """
    try:
        valid_types = [dt.value for dt in DocumentType]
        if doc_type not in valid_types:
            return {
                "success": False,
                "error": f"Invalid document type: {doc_type}. Valid types: {', '.join(valid_types)}"
            }
        
        builder = ComplianceDocumentationBuilder()
        
        if doc_type == "cjis":
            document = builder.build_cjis_document()
        elif doc_type == "nist":
            document = builder.build_nist_document()
        elif doc_type == "soc2":
            document = builder.build_soc2_document()
        elif doc_type == "fedramp":
            document = builder.build_fedramp_document()
        elif doc_type == "aml":
            document = builder.build_aml_kyc_document()
        elif doc_type == "datagov":
            document = builder.build_data_governance_document()
        elif doc_type == "ir":
            document = builder.build_incident_response_document()
        elif doc_type == "audit":
            document = builder.build_audit_logging_document()
        elif doc_type == "zerotrust":
            document = builder.build_zero_trust_document()
        elif doc_type == "privacy":
            document = builder.build_privacy_document()
        elif doc_type == "ssdlc":
            document = builder.build_ssdlc_document()
        elif doc_type == "keymgmt":
            document = builder.build_key_management_document()
        elif doc_type == "isolation":
            document = builder.build_environment_isolation_document()
        elif doc_type == "configmgmt":
            document = builder.build_configuration_management_document()
        else:
            return {
                "success": False,
                "error": f"Document type not implemented: {doc_type}"
            }
        
        exporter = get_exporter_engine()
        export_results = exporter.export_all_formats(document)
        
        return {
            "success": True,
            "document": {
                "doc_id": document.doc_id,
                "name": document.name,
                "doc_type": document.doc_type.value,
                "version": document.version,
                "generated_at": document.generated_at.isoformat(),
                "sections_count": document.get_section_count(),
                "compliance_frameworks": document.compliance_frameworks
            },
            "exports": [result.to_dict() for result in export_results],
            "message": f"Document generated and exported to {len(export_results)} formats"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/download/{filename}")
async def download_export(filename: str) -> Response:
    """
    Download an exported file.
    
    Args:
        filename: Name of file to download
        
    Returns:
        File download response
    """
    try:
        exporter = get_exporter_engine()
        file_path = os.path.join(exporter.export_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if filename.endswith('.json'):
            media_type = "application/json"
        elif filename.endswith('.md'):
            media_type = "text/markdown"
        elif filename.endswith('.txt'):
            media_type = "text/plain"
        else:
            media_type = "application/octet-stream"
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type=media_type
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_exports() -> Dict[str, Any]:
    """
    List all exported files.
    
    Returns:
        List of exported files with metadata
    """
    try:
        exporter = get_exporter_engine()
        exports = exporter.list_exports()
        
        return {
            "success": True,
            "exports": exports,
            "total_exports": len(exports)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/health")
async def get_health() -> Dict[str, Any]:
    """
    Get exporter system health status.
    
    Returns:
        Health status information
    """
    try:
        exporter = get_exporter_engine()
        health = exporter.get_export_health()
        
        return {
            "success": True,
            "health": health
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/statistics")
async def get_statistics() -> Dict[str, Any]:
    """
    Get export statistics.
    
    Returns:
        Export statistics
    """
    try:
        exporter = get_exporter_engine()
        stats = exporter.get_export_statistics()
        
        return {
            "success": True,
            "statistics": stats
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/manifest")
async def get_manifest() -> Dict[str, Any]:
    """
    Get export manifest.
    
    Returns:
        Export manifest with all export records
    """
    try:
        exporter = get_exporter_engine()
        manifest = exporter.get_export_manifest()
        
        return {
            "success": True,
            "manifest": manifest
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.delete("/clear")
async def clear_exports() -> Dict[str, Any]:
    """
    Clear all exported files.
    
    Returns:
        Number of files deleted
    """
    try:
        exporter = get_exporter_engine()
        deleted_count = exporter.clear_exports()
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Deleted {deleted_count} export files"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/by-type/{doc_type}")
async def get_exports_by_type(doc_type: str) -> Dict[str, Any]:
    """
    Get all exports for a specific document type.
    
    Args:
        doc_type: Document type to filter by
        
    Returns:
        List of exports matching the document type
    """
    try:
        exporter = get_exporter_engine()
        exports = exporter.get_export_by_type(doc_type)
        
        return {
            "success": True,
            "doc_type": doc_type,
            "exports": exports,
            "total_exports": len(exports)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/by-id/{doc_id}")
async def get_exports_by_id(doc_id: str) -> Dict[str, Any]:
    """
    Get all exports for a specific document ID.
    
    Args:
        doc_id: Document ID to filter by
        
    Returns:
        List of exports matching the document ID
    """
    try:
        exporter = get_exporter_engine()
        exports = exporter.get_export_by_id(doc_id)
        
        return {
            "success": True,
            "doc_id": doc_id,
            "exports": exports,
            "total_exports": len(exports)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

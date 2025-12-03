"""
API Documentation Schema
Data structures for GhostQuant API documentation system.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class HTTPMethod(str, Enum):
    """HTTP methods."""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


class RiskLevel(str, Enum):
    """Risk classification levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


@dataclass
class APIEndpointDoc:
    """
    Complete documentation for a single API endpoint.
    """
    endpoint_id: str
    name: str
    method: HTTPMethod
    path: str
    section: str
    description: str
    summary: str
    
    params: List[Dict[str, Any]] = field(default_factory=list)
    query_params: List[Dict[str, Any]] = field(default_factory=list)
    body_schema: Optional[Dict[str, Any]] = None
    headers: List[Dict[str, str]] = field(default_factory=list)
    
    response_schema: Dict[str, Any] = field(default_factory=dict)
    response_examples: List[Dict[str, Any]] = field(default_factory=list)
    status_codes: Dict[int, str] = field(default_factory=dict)
    
    risk_level: RiskLevel = RiskLevel.INFO
    risk_notes: str = ""
    use_cases: List[str] = field(default_factory=list)
    
    code_examples: Dict[str, str] = field(default_factory=dict)
    
    tags: List[str] = field(default_factory=list)
    deprecated: bool = False
    requires_auth: bool = False
    rate_limit: Optional[str] = None
    
    notes: str = ""
    see_also: List[str] = field(default_factory=list)
    
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "endpoint_id": self.endpoint_id,
            "name": self.name,
            "method": self.method.value,
            "path": self.path,
            "section": self.section,
            "description": self.description,
            "summary": self.summary,
            "params": self.params,
            "query_params": self.query_params,
            "body_schema": self.body_schema,
            "headers": self.headers,
            "response_schema": self.response_schema,
            "response_examples": self.response_examples,
            "status_codes": self.status_codes,
            "risk_level": self.risk_level.value,
            "risk_notes": self.risk_notes,
            "use_cases": self.use_cases,
            "code_examples": self.code_examples,
            "tags": self.tags,
            "deprecated": self.deprecated,
            "requires_auth": self.requires_auth,
            "rate_limit": self.rate_limit,
            "notes": self.notes,
            "see_also": self.see_also,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class APISection:
    """
    Documentation section grouping related endpoints.
    """
    section_id: str
    name: str
    description: str
    icon: str
    order: int
    endpoints: List[str] = field(default_factory=list)
    subsections: List[str] = field(default_factory=list)
    
    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "section_id": self.section_id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "order": self.order,
            "endpoints": self.endpoints,
            "subsections": self.subsections,
        }


@dataclass
class APICodeExample:
    """
    Code example for an endpoint in a specific language.
    """
    example_id: str
    endpoint_id: str
    language: str
    title: str
    code: str
    description: str = ""
    notes: str = ""
    
    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "example_id": self.example_id,
            "endpoint_id": self.endpoint_id,
            "language": self.language,
            "title": self.title,
            "code": self.code,
            "description": self.description,
            "notes": self.notes,
        }


@dataclass
class APITestResult:
    """
    Result from testing an API endpoint.
    """
    test_id: str
    endpoint_id: str
    timestamp: datetime
    
    method: str
    url: str
    headers: Dict[str, str]
    params: Dict[str, Any]
    body: Optional[Dict[str, Any]]
    
    status_code: int
    response_time_ms: float
    response_body: Any
    response_headers: Dict[str, str]
    
    success: bool
    error: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    
    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "test_id": self.test_id,
            "endpoint_id": self.endpoint_id,
            "timestamp": self.timestamp.isoformat(),
            "method": self.method,
            "url": self.url,
            "headers": self.headers,
            "params": self.params,
            "body": self.body,
            "status_code": self.status_code,
            "response_time_ms": self.response_time_ms,
            "response_body": self.response_body,
            "response_headers": self.response_headers,
            "success": self.success,
            "error": self.error,
            "warnings": self.warnings,
        }


@dataclass
class APIDocsSummary:
    """
    Summary of API documentation coverage.
    """
    timestamp: datetime
    total_endpoints: int
    total_sections: int
    endpoints_by_section: Dict[str, int]
    endpoints_by_method: Dict[str, int]
    endpoints_by_risk: Dict[str, int]
    
    documented_endpoints: int
    endpoints_with_examples: int
    endpoints_with_tests: int
    
    top_endpoints: List[Dict[str, Any]] = field(default_factory=list)
    recommended_endpoints: List[Dict[str, Any]] = field(default_factory=list)
    
    sections: List[Dict[str, Any]] = field(default_factory=list)
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "total_endpoints": self.total_endpoints,
            "total_sections": self.total_sections,
            "endpoints_by_section": self.endpoints_by_section,
            "endpoints_by_method": self.endpoints_by_method,
            "endpoints_by_risk": self.endpoints_by_risk,
            "documented_endpoints": self.documented_endpoints,
            "endpoints_with_examples": self.endpoints_with_examples,
            "endpoints_with_tests": self.endpoints_with_tests,
            "top_endpoints": self.top_endpoints,
            "recommended_endpoints": self.recommended_endpoints,
            "sections": self.sections,
            "metadata": self.metadata,
        }

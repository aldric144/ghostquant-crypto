"""
GhostQuant™ — Regulatory Audit Binder Generator
Package: binder
Purpose: Automated audit binder generation and export

SECURITY NOTICE:
- NO sensitive information in binders
- Only metadata, policies, architecture, controls
- All content is read-only documentation
"""

from .binder_schema import (
    BinderSection,
    BinderAttachment,
    AuditBinder,
    BinderExportResult,
    BINDER_SECTION_TYPES,
    ATTACHMENT_TYPES
)

from .binder_builder import AuditBinderBuilder
from .binder_exporter import AuditBinderExporter
from .binder_engine import AuditBinderEngine
from .api_binder import router as binder_router


__all__ = [
    "BinderSection",
    "BinderAttachment",
    "AuditBinder",
    "BinderExportResult",
    "BINDER_SECTION_TYPES",
    "ATTACHMENT_TYPES",
    
    "AuditBinderBuilder",
    
    "AuditBinderExporter",
    
    "AuditBinderEngine",
    
    "binder_router"
]

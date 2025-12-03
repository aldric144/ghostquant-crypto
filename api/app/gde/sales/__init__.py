"""
GhostQuant Enterprise Sales Pipeline
Complete enterprise acquisition workflow system.
"""

from .sales_schema import (
    SalesLead,
    SalesStage,
    SalesInteraction,
    SalesPipelineSummary,
    DemoAccessRequest,
    FollowUpTask,
)
from .sales_engine import SalesEngine
from .sales_stages import PIPELINE_STAGES, get_stage_info
from .sales_automation import SalesAutomation

__all__ = [
    "SalesLead",
    "SalesStage",
    "SalesInteraction",
    "SalesPipelineSummary",
    "DemoAccessRequest",
    "FollowUpTask",
    "SalesEngine",
    "SalesAutomation",
    "PIPELINE_STAGES",
    "get_stage_info",
]

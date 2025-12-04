"""
GhostQuant Channel Partner Contract Pack
Global Distributor Edition (GDE) v3.0

Comprehensive contract management system for global distributor partnerships
including contract generation, validation, negotiation, pricing, compliance,
territory management, and renewal workflows.

Modules:
- contract_schema: Data models and enums for contracts
- contract_templates: Contract document templates
- contract_engine: Core contract generation engine
- contract_validator: Contract validation logic
- contract_negotiation: Negotiation workflow engine
- contract_pricing: Pricing and discount calculations
- contract_compliance: Compliance and regulatory checks
- contract_territory: Territory and region management
- contract_renewal: Renewal and amendment handling
- contract_storage: In-memory contract storage
- api_contracts: FastAPI router endpoints
"""

from .contract_schema import (
    ContractType,
    ContractStatus,
    DistributorTier,
    RegionCode,
    CurrencyCode,
    PaymentTerms,
    NegotiationStatus,
    ComplianceLevel,
    TerritoryDefinition,
    PricingTier,
    ProductAuthorization,
    CommitmentSchedule,
    RebateStructure,
    MarketDevelopmentFund,
    ComplianceRequirement,
    NegotiationTerm,
    NegotiationSession,
    ContractAmendment,
    RenewalTerms,
    DistributorProfile,
    ContractTerms,
    NegotiationWorkflow,
    DistributorContract,
    ContractSummary,
    ContractValidationResult,
    ContractAnalytics
)

from .contract_templates import ContractTemplates
from .contract_engine import ContractEngine
from .contract_validator import ContractValidator
from .contract_negotiation import NegotiationEngine
from .contract_pricing import PricingEngine
from .contract_compliance import ComplianceEngine
from .contract_territory import TerritoryEngine
from .contract_renewal import RenewalEngine
from .contract_storage import ContractStorage
from .api_contracts import router

__all__ = [
    "ContractType",
    "ContractStatus",
    "DistributorTier",
    "RegionCode",
    "CurrencyCode",
    "PaymentTerms",
    "NegotiationStatus",
    "ComplianceLevel",
    "TerritoryDefinition",
    "PricingTier",
    "ProductAuthorization",
    "CommitmentSchedule",
    "RebateStructure",
    "MarketDevelopmentFund",
    "ComplianceRequirement",
    "NegotiationTerm",
    "NegotiationSession",
    "ContractAmendment",
    "RenewalTerms",
    "DistributorProfile",
    "ContractTerms",
    "NegotiationWorkflow",
    "DistributorContract",
    "ContractSummary",
    "ContractValidationResult",
    "ContractAnalytics",
    "ContractTemplates",
    "ContractEngine",
    "ContractValidator",
    "NegotiationEngine",
    "PricingEngine",
    "ComplianceEngine",
    "TerritoryEngine",
    "RenewalEngine",
    "ContractStorage",
    "router"
]

__version__ = "3.0.0"
__author__ = "GhostQuant Technologies"

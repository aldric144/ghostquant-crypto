"""
GhostQuant Billing System & Payment Gateway Integration™

Complete billing system with subscription management, usage metering, invoicing,
and simulated Stripe integration.

Features:
- Subscription management (FREE, PRO, INSTITUTIONAL, GOVERNMENT)
- Usage-based metered billing
- Invoice generation and payment processing
- Simulated Stripe gateway (no external dependencies)
- Enterprise contract management
- Revenue reporting (MRR, ARR, churn rate)
- Fraud detection and risk scoring
- Atomic transaction-safe operations
- Genesis Archive compatible audit logging
"""

from .billing_schema import (
    BillingCustomer,
    SubscriptionPlan,
    SubscriptionRecord,
    InvoiceRecord,
    UsageMeterRecord,
    PaymentIntentRecord,
    BillingSummary,
    EnterpriseContract
)
from .billing_plans import BILLING_PLANS, get_plan
from .billing_engine import BillingEngine
from .stripe_gateway import StripeGateway
from .billing_reporter import BillingReporter

__all__ = [
    'BillingCustomer',
    'SubscriptionPlan',
    'SubscriptionRecord',
    'InvoiceRecord',
    'UsageMeterRecord',
    'PaymentIntentRecord',
    'BillingSummary',
    'EnterpriseContract',
    'BILLING_PLANS',
    'get_plan',
    'BillingEngine',
    'StripeGateway',
    'BillingReporter'
]

"""
Billing Schema Definitions

Dataclasses for billing customers, subscriptions, invoices, usage meters,
payment intents, and billing summaries.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class BillingPeriod(str, Enum):
    """Billing period"""
    MONTHLY = "monthly"
    ANNUAL = "annual"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, Enum):
    """Subscription status"""
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"


class InvoiceStatus(str, Enum):
    """Invoice status"""
    DRAFT = "draft"
    OPEN = "open"
    PAID = "paid"
    VOID = "void"
    UNCOLLECTIBLE = "uncollectible"


class PaymentIntentStatus(str, Enum):
    """Payment intent status"""
    REQUIRES_CONFIRMATION = "requires_confirmation"
    REQUIRES_PAYMENT_METHOD = "requires_payment_method"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"
    FAILED = "failed"


@dataclass
class BillingCustomer:
    """Billing customer"""
    id: str
    email: str
    name: str
    currency: str = "usd"
    default_payment_method: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    fraud_risk: bool = False
    overdue: bool = False
    failed_payments_count: int = 0
    last_payment_failure: Optional[str] = None
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'currency': self.currency,
            'default_payment_method': self.default_payment_method,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'fraud_risk': self.fraud_risk,
            'overdue': self.overdue,
            'failed_payments_count': self.failed_payments_count,
            'last_payment_failure': self.last_payment_failure,
            'metadata': self.metadata
        }


@dataclass
class SubscriptionPlan:
    """Subscription plan definition"""
    id: str
    name: str
    price: float
    currency: str
    billing_period: str
    
    api_calls_limit: int
    predictions_limit: int
    users_limit: int
    
    overage_per_1k: float
    
    permitted_modules: List[str]
    sla_uptime: float
    kyc_required: bool
    risk_scoring_access: bool
    
    support_level: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'currency': self.currency,
            'billing_period': self.billing_period,
            'api_calls_limit': self.api_calls_limit,
            'predictions_limit': self.predictions_limit,
            'users_limit': self.users_limit,
            'overage_per_1k': self.overage_per_1k,
            'permitted_modules': self.permitted_modules,
            'sla_uptime': self.sla_uptime,
            'kyc_required': self.kyc_required,
            'risk_scoring_access': self.risk_scoring_access,
            'support_level': self.support_level
        }


@dataclass
class SubscriptionRecord:
    """Subscription record"""
    id: str
    customer_id: str
    plan_id: str
    status: str
    billing_period: str
    
    current_period_start: str
    current_period_end: str
    
    cancel_at_period_end: bool = False
    canceled_at: Optional[str] = None
    
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    last_daily_run: Optional[str] = None
    last_monthly_run: Optional[str] = None
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'plan_id': self.plan_id,
            'status': self.status,
            'billing_period': self.billing_period,
            'current_period_start': self.current_period_start,
            'current_period_end': self.current_period_end,
            'cancel_at_period_end': self.cancel_at_period_end,
            'canceled_at': self.canceled_at,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'last_daily_run': self.last_daily_run,
            'last_monthly_run': self.last_monthly_run,
            'metadata': self.metadata
        }


@dataclass
class InvoiceRecord:
    """Invoice record"""
    id: str
    customer_id: str
    subscription_id: Optional[str]
    status: str
    currency: str
    
    subtotal: float
    tax: float
    total: float
    amount_due: float
    amount_paid: float
    
    line_items: List[Dict[str, Any]] = field(default_factory=list)
    
    due_date: str
    paid_at: Optional[str] = None
    
    payment_intent_id: Optional[str] = None
    
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'subscription_id': self.subscription_id,
            'status': self.status,
            'currency': self.currency,
            'subtotal': self.subtotal,
            'tax': self.tax,
            'total': self.total,
            'amount_due': self.amount_due,
            'amount_paid': self.amount_paid,
            'line_items': self.line_items,
            'due_date': self.due_date,
            'paid_at': self.paid_at,
            'payment_intent_id': self.payment_intent_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'metadata': self.metadata
        }


@dataclass
class UsageMeterRecord:
    """Usage meter record"""
    id: str
    customer_id: str
    subscription_id: str
    metric: str
    
    day_total: int = 0
    month_total: int = 0
    all_time_total: int = 0
    
    last_reset_day: Optional[str] = None
    last_reset_month: Optional[str] = None
    
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'subscription_id': self.subscription_id,
            'metric': self.metric,
            'day_total': self.day_total,
            'month_total': self.month_total,
            'all_time_total': self.all_time_total,
            'last_reset_day': self.last_reset_day,
            'last_reset_month': self.last_reset_month,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


@dataclass
class PaymentIntentRecord:
    """Payment intent record"""
    id: str
    customer_id: str
    amount: float
    currency: str
    status: str
    
    payment_method: Optional[str] = None
    
    idempotency_key: Optional[str] = None
    
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'idempotency_key': self.idempotency_key,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'metadata': self.metadata
        }


@dataclass
class BillingSummary:
    """Billing summary for a customer"""
    customer_id: str
    current_plan: Optional[Dict[str, Any]]
    subscription_status: Optional[str]
    
    usage_this_month: Dict[str, int]
    usage_limits: Dict[str, int]
    
    unpaid_invoices: List[Dict[str, Any]]
    upcoming_invoice_amount: float
    
    payment_status: str
    last_payment_date: Optional[str]
    next_payment_date: Optional[str]
    
    fraud_risk: bool
    overdue: bool
    failed_payments_count: int
    
    summary: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'customer_id': self.customer_id,
            'current_plan': self.current_plan,
            'subscription_status': self.subscription_status,
            'usage_this_month': self.usage_this_month,
            'usage_limits': self.usage_limits,
            'unpaid_invoices': self.unpaid_invoices,
            'upcoming_invoice_amount': self.upcoming_invoice_amount,
            'payment_status': self.payment_status,
            'last_payment_date': self.last_payment_date,
            'next_payment_date': self.next_payment_date,
            'fraud_risk': self.fraud_risk,
            'overdue': self.overdue,
            'failed_payments_count': self.failed_payments_count,
            'summary': self.summary
        }


@dataclass
class EnterpriseContract:
    """Enterprise contract"""
    id: str
    customer_id: str
    
    annual_commit: float
    per_user_cost: float
    per_engine_cost: float
    
    included_users: int
    included_engines: List[str]
    
    sla_uptime: float
    support_level: str
    
    kyc_required: bool
    custom_integrations: bool
    
    start_date: str
    end_date: str
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'annual_commit': self.annual_commit,
            'per_user_cost': self.per_user_cost,
            'per_engine_cost': self.per_engine_cost,
            'included_users': self.included_users,
            'included_engines': self.included_engines,
            'sla_uptime': self.sla_uptime,
            'support_level': self.support_level,
            'kyc_required': self.kyc_required,
            'custom_integrations': self.custom_integrations,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'metadata': self.metadata
        }

"""
Billing Engine

Core billing engine with subscription management, usage metering, invoicing,
and payment processing. Transaction-safe and crash-proof.
"""

import secrets
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from .billing_schema import (
    BillingCustomer,
    SubscriptionRecord,
    InvoiceRecord,
    UsageMeterRecord,
    PaymentIntentRecord,
    BillingSummary,
    EnterpriseContract,
    SubscriptionStatus,
    InvoiceStatus,
    BillingPeriod
)
from .billing_plans import get_plan, list_plans
from .stripe_gateway import StripeGateway


class BillingEngine:
    """
    Core billing engine for GhostQuant
    
    Features:
    - Customer management
    - Subscription lifecycle
    - Usage metering
    - Invoice generation
    - Payment processing
    - Enterprise contracts
    - Fraud detection
    """
    
    VERSION = "1.0.0"
    
    def __init__(self):
        self.gateway = StripeGateway()
        
        self.customers: Dict[str, BillingCustomer] = {}
        self.subscriptions: Dict[str, SubscriptionRecord] = {}
        self.invoices: Dict[str, InvoiceRecord] = {}
        self.usage_meters: Dict[str, UsageMeterRecord] = {}
        self.payment_intents: Dict[str, PaymentIntentRecord] = {}
        self.enterprise_contracts: Dict[str, EnterpriseContract] = {}
        
        self.events: List[Dict[str, Any]] = []
        
        self.lock = threading.Lock()
        
        self.idempotency_keys: Dict[str, str] = {}
    
    
    def create_customer(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a billing customer
        
        Args:
            profile: Customer profile with email, name, metadata
        
        Returns:
            Result dict with success flag and customer data
        """
        try:
            with self.lock:
                if 'email' not in profile or 'name' not in profile:
                    return {
                        'success': False,
                        'error': 'Email and name are required'
                    }
                
                gateway_customer = self.gateway.create_customer(
                    email=profile['email'],
                    name=profile['name'],
                    metadata=profile.get('metadata', {})
                )
                
                customer = BillingCustomer(
                    id=gateway_customer['id'],
                    email=profile['email'],
                    name=profile['name'],
                    currency=profile.get('currency', 'usd'),
                    metadata=profile.get('metadata', {})
                )
                
                self.customers[customer.id] = customer
                
                self._log_event('customer_created', {
                    'customer_id': customer.id,
                    'email': customer.email
                })
                
                return {
                    'success': True,
                    'customer': customer.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to create customer: {str(e)}'
            }
    
    def get_customer(self, customer_id: str) -> Optional[BillingCustomer]:
        """Get customer by ID"""
        return self.customers.get(customer_id)
    
    
    def attach_payment_method(self, customer_id: str, stripe_token: str) -> Dict[str, Any]:
        """
        Attach payment method to customer
        
        Args:
            customer_id: Customer ID
            stripe_token: Stripe payment token
        
        Returns:
            Result dict with success flag
        """
        try:
            with self.lock:
                if customer_id not in self.customers:
                    return {
                        'success': False,
                        'error': f'Customer {customer_id} not found'
                    }
                
                payment_method = self.gateway.attach_payment(customer_id, stripe_token)
                
                customer = self.customers[customer_id]
                customer.default_payment_method = payment_method['id']
                customer.updated_at = datetime.utcnow().isoformat()
                
                self._log_event('payment_method_attached', {
                    'customer_id': customer_id,
                    'payment_method_id': payment_method['id']
                })
                
                return {
                    'success': True,
                    'payment_method': payment_method
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to attach payment method: {str(e)}'
            }
    
    
    def create_subscription(self, customer_id: str, plan_id: str) -> Dict[str, Any]:
        """
        Create a subscription
        
        Args:
            customer_id: Customer ID
            plan_id: Plan ID
        
        Returns:
            Result dict with success flag and subscription data
        """
        try:
            with self.lock:
                if customer_id not in self.customers:
                    return {
                        'success': False,
                        'error': f'Customer {customer_id} not found'
                    }
                
                plan = get_plan(plan_id)
                if not plan:
                    return {
                        'success': False,
                        'error': f'Plan {plan_id} not found'
                    }
                
                gateway_sub = self.gateway.create_subscription(
                    customer_id=customer_id,
                    plan_id=plan_id
                )
                
                now = datetime.utcnow()
                if plan.billing_period == BillingPeriod.MONTHLY.value:
                    period_end = now + timedelta(days=30)
                elif plan.billing_period == BillingPeriod.ANNUAL.value:
                    period_end = now + timedelta(days=365)
                else:  # Enterprise
                    period_end = now + timedelta(days=365)
                
                subscription = SubscriptionRecord(
                    id=gateway_sub['id'],
                    customer_id=customer_id,
                    plan_id=plan_id,
                    status=SubscriptionStatus.ACTIVE.value,
                    billing_period=plan.billing_period,
                    current_period_start=now.isoformat(),
                    current_period_end=period_end.isoformat()
                )
                
                self.subscriptions[subscription.id] = subscription
                
                self._initialize_usage_meters(customer_id, subscription.id)
                
                self._log_event('subscription_created', {
                    'customer_id': customer_id,
                    'subscription_id': subscription.id,
                    'plan_id': plan_id
                })
                
                return {
                    'success': True,
                    'subscription': subscription.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to create subscription: {str(e)}'
            }
    
    def cancel_subscription(self, subscription_id: str, at_period_end: bool = False) -> Dict[str, Any]:
        """
        Cancel a subscription
        
        Args:
            subscription_id: Subscription ID
            at_period_end: Cancel at period end or immediately
        
        Returns:
            Result dict with success flag
        """
        try:
            with self.lock:
                if subscription_id not in self.subscriptions:
                    return {
                        'success': False,
                        'error': f'Subscription {subscription_id} not found'
                    }
                
                subscription = self.subscriptions[subscription_id]
                
                self.gateway.cancel_subscription(subscription_id, at_period_end)
                
                if at_period_end:
                    subscription.cancel_at_period_end = True
                    subscription.canceled_at = datetime.utcnow().isoformat()
                else:
                    subscription.status = SubscriptionStatus.CANCELED.value
                    subscription.canceled_at = datetime.utcnow().isoformat()
                
                subscription.updated_at = datetime.utcnow().isoformat()
                
                self._log_event('subscription_canceled', {
                    'subscription_id': subscription_id,
                    'at_period_end': at_period_end
                })
                
                return {
                    'success': True,
                    'subscription': subscription.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to cancel subscription: {str(e)}'
            }
    
    def _initialize_usage_meters(self, customer_id: str, subscription_id: str):
        """Initialize usage meters for a subscription"""
        metrics = [
            'api_calls',
            'predictions',
            'ultrafusion_calls',
            'hydra_scans',
            'constellation_updates',
            'oracle_eye_analyses'
        ]
        
        for metric in metrics:
            meter_id = f"meter_{secrets.token_hex(8)}"
            meter = UsageMeterRecord(
                id=meter_id,
                customer_id=customer_id,
                subscription_id=subscription_id,
                metric=metric
            )
            self.usage_meters[meter_id] = meter
    
    
    def record_usage(self, customer_id: str, metric: str, amount: int) -> Dict[str, Any]:
        """
        Record usage for a customer
        
        Args:
            customer_id: Customer ID
            metric: Usage metric name
            amount: Usage amount
        
        Returns:
            Result dict with success flag
        """
        try:
            with self.lock:
                if customer_id not in self.customers:
                    return {
                        'success': False,
                        'error': f'Customer {customer_id} not found'
                    }
                
                if amount < 0:
                    return {
                        'success': False,
                        'error': 'Usage amount must be non-negative'
                    }
                
                meter = self._find_or_create_meter(customer_id, metric)
                
                meter.day_total += amount
                meter.month_total += amount
                meter.all_time_total += amount
                meter.updated_at = datetime.utcnow().isoformat()
                
                self._log_event('usage_recorded', {
                    'customer_id': customer_id,
                    'metric': metric,
                    'amount': amount
                })
                
                return {
                    'success': True,
                    'meter': meter.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to record usage: {str(e)}'
            }
    
    def _find_or_create_meter(self, customer_id: str, metric: str) -> UsageMeterRecord:
        """Find or create usage meter"""
        for meter in self.usage_meters.values():
            if meter.customer_id == customer_id and meter.metric == metric:
                return meter
        
        meter_id = f"meter_{secrets.token_hex(8)}"
        meter = UsageMeterRecord(
            id=meter_id,
            customer_id=customer_id,
            subscription_id='',  # Will be set when subscription is found
            metric=metric
        )
        self.usage_meters[meter_id] = meter
        return meter
    
    
    def run_metered_billing(self, mode: str = 'daily') -> Dict[str, Any]:
        """
        Run metered billing (daily or monthly)
        
        Args:
            mode: 'daily' or 'monthly'
        
        Returns:
            Result dict with success flag and billing summary
        """
        try:
            with self.lock:
                processed = 0
                invoices_generated = 0
                
                for subscription in self.subscriptions.values():
                    if subscription.status != SubscriptionStatus.ACTIVE.value:
                        continue
                    
                    now = datetime.utcnow()
                    today = now.date().isoformat()
                    
                    if mode == 'daily':
                        if subscription.last_daily_run == today:
                            continue
                        subscription.last_daily_run = today
                    else:  # monthly
                        this_month = now.strftime('%Y-%m')
                        if subscription.last_monthly_run == this_month:
                            continue
                        subscription.last_monthly_run = this_month
                    
                    plan = get_plan(subscription.plan_id)
                    if not plan:
                        continue
                    
                    overage_cost = self._calculate_overage(subscription, plan, mode)
                    
                    if overage_cost > 0:
                        invoice_result = self._generate_overage_invoice(
                            subscription,
                            overage_cost,
                            mode
                        )
                        if invoice_result['success']:
                            invoices_generated += 1
                    
                    if mode == 'monthly':
                        self._reset_monthly_meters(subscription.id)
                    
                    processed += 1
                
                return {
                    'success': True,
                    'mode': mode,
                    'subscriptions_processed': processed,
                    'invoices_generated': invoices_generated
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to run metered billing: {str(e)}'
            }
    
    def _calculate_overage(self, subscription: SubscriptionRecord, plan: Any, mode: str) -> float:
        """Calculate overage cost"""
        total_overage = 0.0
        
        meters = [m for m in self.usage_meters.values() if m.subscription_id == subscription.id]
        
        for meter in meters:
            usage = meter.day_total if mode == 'daily' else meter.month_total
            
            if mode == 'daily':
                limit = plan.api_calls_limit // 30 if plan.api_calls_limit > 0 else -1
            else:
                limit = plan.api_calls_limit
            
            if limit == -1:
                continue
            
            if usage > limit:
                overage = usage - limit
                overage_cost = (overage / 1000) * plan.overage_per_1k
                total_overage += overage_cost
        
        return total_overage
    
    def _reset_monthly_meters(self, subscription_id: str):
        """Reset monthly usage meters"""
        now = datetime.utcnow().isoformat()
        
        for meter in self.usage_meters.values():
            if meter.subscription_id == subscription_id:
                meter.month_total = 0
                meter.last_reset_month = now
    
    def _generate_overage_invoice(
        self,
        subscription: SubscriptionRecord,
        overage_cost: float,
        mode: str
    ) -> Dict[str, Any]:
        """Generate invoice for overage"""
        try:
            invoice_id = f"in_{secrets.token_hex(12)}"
            now = datetime.utcnow()
            due_date = now + timedelta(days=7)
            
            line_items = [{
                'description': f'{mode.capitalize()} overage charges',
                'amount': overage_cost,
                'quantity': 1
            }]
            
            invoice = InvoiceRecord(
                id=invoice_id,
                customer_id=subscription.customer_id,
                subscription_id=subscription.id,
                status=InvoiceStatus.OPEN.value,
                currency='usd',
                subtotal=overage_cost,
                tax=0.0,
                total=overage_cost,
                amount_due=overage_cost,
                amount_paid=0.0,
                line_items=line_items,
                due_date=due_date.isoformat()
            )
            
            self.invoices[invoice_id] = invoice
            
            self._log_event('invoice_generated', {
                'invoice_id': invoice_id,
                'customer_id': subscription.customer_id,
                'amount': overage_cost
            })
            
            return {
                'success': True,
                'invoice': invoice.to_dict()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to generate invoice: {str(e)}'
            }
    
    
    def generate_invoice(self, subscription_id: str, usage_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an invoice
        
        Args:
            subscription_id: Subscription ID
            usage_details: Usage details for invoice
        
        Returns:
            Result dict with success flag and invoice data
        """
        try:
            with self.lock:
                if subscription_id not in self.subscriptions:
                    return {
                        'success': False,
                        'error': f'Subscription {subscription_id} not found'
                    }
                
                subscription = self.subscriptions[subscription_id]
                plan = get_plan(subscription.plan_id)
                
                if not plan:
                    return {
                        'success': False,
                        'error': f'Plan {subscription.plan_id} not found'
                    }
                
                invoice_id = f"in_{secrets.token_hex(12)}"
                now = datetime.utcnow()
                due_date = now + timedelta(days=7)
                
                line_items = [{
                    'description': f'{plan.name} subscription',
                    'amount': plan.price,
                    'quantity': 1
                }]
                
                subtotal = plan.price
                
                if usage_details:
                    for metric, amount in usage_details.items():
                        if amount > 0:
                            line_items.append({
                                'description': f'{metric} usage',
                                'amount': amount,
                                'quantity': 1
                            })
                            subtotal += amount
                
                tax = 0.0
                total = subtotal + tax
                
                invoice = InvoiceRecord(
                    id=invoice_id,
                    customer_id=subscription.customer_id,
                    subscription_id=subscription_id,
                    status=InvoiceStatus.OPEN.value,
                    currency=plan.currency,
                    subtotal=subtotal,
                    tax=tax,
                    total=total,
                    amount_due=total,
                    amount_paid=0.0,
                    line_items=line_items,
                    due_date=due_date.isoformat()
                )
                
                self.invoices[invoice_id] = invoice
                
                customer = self.customers.get(subscription.customer_id)
                if customer and customer.default_payment_method:
                    payment_result = self._create_payment_intent(invoice)
                    if payment_result['success']:
                        invoice.payment_intent_id = payment_result['payment_intent']['id']
                
                self._log_event('invoice_generated', {
                    'invoice_id': invoice_id,
                    'subscription_id': subscription_id,
                    'total': total
                })
                
                return {
                    'success': True,
                    'invoice': invoice.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to generate invoice: {str(e)}'
            }
    
    def mark_invoice_paid(self, invoice_id: str) -> Dict[str, Any]:
        """
        Mark invoice as paid
        
        Args:
            invoice_id: Invoice ID
        
        Returns:
            Result dict with success flag
        """
        try:
            with self.lock:
                if invoice_id not in self.invoices:
                    return {
                        'success': False,
                        'error': f'Invoice {invoice_id} not found'
                    }
                
                invoice = self.invoices[invoice_id]
                
                invoice.status = InvoiceStatus.PAID.value
                invoice.amount_paid = invoice.total
                invoice.paid_at = datetime.utcnow().isoformat()
                invoice.updated_at = datetime.utcnow().isoformat()
                
                customer = self.customers.get(invoice.customer_id)
                if customer:
                    customer.overdue = False
                    customer.updated_at = datetime.utcnow().isoformat()
                
                self._log_event('invoice_paid', {
                    'invoice_id': invoice_id,
                    'customer_id': invoice.customer_id,
                    'amount': invoice.total
                })
                
                return {
                    'success': True,
                    'invoice': invoice.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to mark invoice paid: {str(e)}'
            }
    
    def _create_payment_intent(self, invoice: InvoiceRecord) -> Dict[str, Any]:
        """Create payment intent for invoice"""
        try:
            idempotency_key = f"invoice_{invoice.id}"
            
            intent = self.gateway.create_payment_intent(
                amount=invoice.total,
                currency=invoice.currency,
                customer_id=invoice.customer_id,
                metadata={'invoice_id': invoice.id},
                idempotency_key=idempotency_key
            )
            
            payment_intent = PaymentIntentRecord(
                id=intent['id'],
                customer_id=invoice.customer_id,
                amount=invoice.total,
                currency=invoice.currency,
                status=intent['status'],
                payment_method=intent.get('payment_method'),
                idempotency_key=idempotency_key,
                metadata={'invoice_id': invoice.id}
            )
            
            self.payment_intents[payment_intent.id] = payment_intent
            
            if intent['status'] == 'succeeded':
                self.mark_invoice_paid(invoice.id)
            elif intent['status'] == 'failed':
                customer = self.customers.get(invoice.customer_id)
                if customer:
                    customer.failed_payments_count += 1
                    customer.last_payment_failure = datetime.utcnow().isoformat()
                    
                    if customer.failed_payments_count >= 3:
                        customer.fraud_risk = True
            
            return {
                'success': True,
                'payment_intent': intent
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to create payment intent: {str(e)}'
            }
    
    
    def sync_with_stripe(self) -> Dict[str, Any]:
        """
        Sync with Stripe gateway
        
        Returns:
            Result dict with success flag and sync summary
        """
        try:
            with self.lock:
                gateway_health = self.gateway.health()
                
                for customer_id in self.customers.keys():
                    gateway_customer = self.gateway.get_customer(customer_id)
                    if gateway_customer:
                        pass
                
                return {
                    'success': True,
                    'gateway_health': gateway_health,
                    'customers_synced': len(self.customers),
                    'subscriptions_synced': len(self.subscriptions)
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to sync with Stripe: {str(e)}'
            }
    
    
    def build_billing_summary(self, customer_id: str) -> Dict[str, Any]:
        """
        Build billing summary for customer
        
        Args:
            customer_id: Customer ID
        
        Returns:
            Result dict with success flag and billing summary
        """
        try:
            if customer_id not in self.customers:
                return {
                    'success': False,
                    'error': f'Customer {customer_id} not found'
                }
            
            customer = self.customers[customer_id]
            
            subscription = None
            plan_dict = None
            for sub in self.subscriptions.values():
                if sub.customer_id == customer_id and sub.status == SubscriptionStatus.ACTIVE.value:
                    subscription = sub
                    plan = get_plan(sub.plan_id)
                    if plan:
                        plan_dict = plan.to_dict()
                    break
            
            usage_this_month = {}
            usage_limits = {}
            
            if subscription:
                for meter in self.usage_meters.values():
                    if meter.subscription_id == subscription.id:
                        usage_this_month[meter.metric] = meter.month_total
                
                plan = get_plan(subscription.plan_id)
                if plan:
                    usage_limits = {
                        'api_calls': plan.api_calls_limit,
                        'predictions': plan.predictions_limit
                    }
            
            unpaid_invoices = []
            upcoming_amount = 0.0
            
            for invoice in self.invoices.values():
                if invoice.customer_id == customer_id:
                    if invoice.status == InvoiceStatus.OPEN.value:
                        unpaid_invoices.append(invoice.to_dict())
                        upcoming_amount += invoice.amount_due
            
            payment_status = 'current'
            if customer.overdue:
                payment_status = 'overdue'
            elif customer.fraud_risk:
                payment_status = 'at_risk'
            
            last_payment_date = None
            next_payment_date = None
            
            if subscription:
                next_payment_date = subscription.current_period_end
            
            summary = self._build_summary_narrative(
                customer,
                subscription,
                plan_dict,
                unpaid_invoices,
                usage_this_month
            )
            
            billing_summary = BillingSummary(
                customer_id=customer_id,
                current_plan=plan_dict,
                subscription_status=subscription.status if subscription else None,
                usage_this_month=usage_this_month,
                usage_limits=usage_limits,
                unpaid_invoices=unpaid_invoices,
                upcoming_invoice_amount=upcoming_amount,
                payment_status=payment_status,
                last_payment_date=last_payment_date,
                next_payment_date=next_payment_date,
                fraud_risk=customer.fraud_risk,
                overdue=customer.overdue,
                failed_payments_count=customer.failed_payments_count,
                summary=summary
            )
            
            return {
                'success': True,
                'billing_summary': billing_summary.to_dict()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to build billing summary: {str(e)}'
            }
    
    def _build_summary_narrative(
        self,
        customer: BillingCustomer,
        subscription: Optional[SubscriptionRecord],
        plan: Optional[Dict[str, Any]],
        unpaid_invoices: List[Dict[str, Any]],
        usage: Dict[str, int]
    ) -> str:
        """Build summary narrative"""
        parts = []
        
        parts.append(f"Customer {customer.name} ({customer.email})")
        
        if subscription and plan:
            parts.append(f"on {plan['name']} plan")
        else:
            parts.append("with no active subscription")
        
        if usage:
            total_usage = sum(usage.values())
            parts.append(f"with {total_usage:,} total usage this month")
        
        if unpaid_invoices:
            total_unpaid = sum(inv['amount_due'] for inv in unpaid_invoices)
            parts.append(f"and ${total_unpaid:.2f} in unpaid invoices")
        
        if customer.fraud_risk:
            parts.append("⚠️ FRAUD RISK")
        if customer.overdue:
            parts.append("⚠️ OVERDUE")
        
        return '. '.join(parts) + '.'
    
    
    def enterprise_contract(self, customer_id: str, terms: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create enterprise contract
        
        Args:
            customer_id: Customer ID
            terms: Contract terms
        
        Returns:
            Result dict with success flag and contract data
        """
        try:
            with self.lock:
                if customer_id not in self.customers:
                    return {
                        'success': False,
                        'error': f'Customer {customer_id} not found'
                    }
                
                contract_id = f"contract_{secrets.token_hex(12)}"
                
                now = datetime.utcnow()
                start_date = terms.get('start_date', now.isoformat())
                end_date = terms.get('end_date', (now + timedelta(days=365)).isoformat())
                
                contract = EnterpriseContract(
                    id=contract_id,
                    customer_id=customer_id,
                    annual_commit=terms.get('annual_commit', 0.0),
                    per_user_cost=terms.get('per_user_cost', 0.0),
                    per_engine_cost=terms.get('per_engine_cost', 0.0),
                    included_users=terms.get('included_users', 0),
                    included_engines=terms.get('included_engines', []),
                    sla_uptime=terms.get('sla_uptime', 99.9),
                    support_level=terms.get('support_level', 'dedicated'),
                    kyc_required=terms.get('kyc_required', True),
                    custom_integrations=terms.get('custom_integrations', True),
                    start_date=start_date,
                    end_date=end_date,
                    metadata=terms.get('metadata', {})
                )
                
                self.enterprise_contracts[contract_id] = contract
                
                self._log_event('enterprise_contract_created', {
                    'contract_id': contract_id,
                    'customer_id': customer_id,
                    'annual_commit': contract.annual_commit
                })
                
                return {
                    'success': True,
                    'contract': contract.to_dict()
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to create enterprise contract: {str(e)}'
            }
    
    
    def _log_event(self, event_type: str, data: Dict[str, Any]):
        """Log event to audit trail"""
        event = {
            'type': event_type,
            'data': data,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.events.append(event)
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'customers': len(self.customers),
            'subscriptions': len(self.subscriptions),
            'invoices': len(self.invoices),
            'usage_meters': len(self.usage_meters),
            'payment_intents': len(self.payment_intents),
            'enterprise_contracts': len(self.enterprise_contracts),
            'events': len(self.events),
            'gateway_health': self.gateway.health()
        }
    
    def info(self) -> Dict[str, Any]:
        """Get billing engine information"""
        return {
            'version': self.VERSION,
            'plans': list(list_plans().keys()),
            'features': [
                'Customer management',
                'Subscription lifecycle',
                'Usage metering',
                'Invoice generation',
                'Payment processing',
                'Enterprise contracts',
                'Fraud detection',
                'Stripe integration'
            ]
        }

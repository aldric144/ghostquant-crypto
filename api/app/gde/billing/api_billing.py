"""
Billing API Router

FastAPI router for billing system endpoints.
100% crash-proof with safe error handling.
"""

from fastapi import APIRouter
from typing import Dict, Any
from .billing_engine import BillingEngine
from .billing_reporter import BillingReporter

router = APIRouter(prefix="/billing", tags=["Billing System"])

billing_engine = BillingEngine()
billing_reporter = BillingReporter(billing_engine)


@router.post("/customer")
async def create_customer(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a billing customer
    
    Request body:
    {
        "email": "user@example.com",
        "name": "John Doe",
        "currency": "usd",
        "metadata": {}
    }
    """
    try:
        result = billing_engine.create_customer(profile)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to create customer: {str(e)}"
        }


@router.post("/payment")
async def attach_payment(payment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Attach payment method to customer
    
    Request body:
    {
        "customer_id": "cus_xxx",
        "stripe_token": "tok_ok"
    }
    """
    try:
        customer_id = payment_data.get('customer_id')
        stripe_token = payment_data.get('stripe_token')
        
        if not customer_id or not stripe_token:
            return {
                'success': False,
                'error': 'customer_id and stripe_token are required'
            }
        
        result = billing_engine.attach_payment_method(customer_id, stripe_token)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to attach payment: {str(e)}"
        }


@router.post("/subscription")
async def create_subscription(subscription_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a subscription
    
    Request body:
    {
        "customer_id": "cus_xxx",
        "plan_id": "pro"
    }
    """
    try:
        customer_id = subscription_data.get('customer_id')
        plan_id = subscription_data.get('plan_id')
        
        if not customer_id or not plan_id:
            return {
                'success': False,
                'error': 'customer_id and plan_id are required'
            }
        
        result = billing_engine.create_subscription(customer_id, plan_id)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to create subscription: {str(e)}"
        }


@router.post("/cancel")
async def cancel_subscription(cancel_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cancel a subscription
    
    Request body:
    {
        "subscription_id": "sub_xxx",
        "at_period_end": false
    }
    """
    try:
        subscription_id = cancel_data.get('subscription_id')
        at_period_end = cancel_data.get('at_period_end', False)
        
        if not subscription_id:
            return {
                'success': False,
                'error': 'subscription_id is required'
            }
        
        result = billing_engine.cancel_subscription(subscription_id, at_period_end)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to cancel subscription: {str(e)}"
        }


@router.post("/usage")
async def record_usage(usage_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Record usage for a customer
    
    Request body:
    {
        "customer_id": "cus_xxx",
        "metric": "api_calls",
        "amount": 1000
    }
    """
    try:
        customer_id = usage_data.get('customer_id')
        metric = usage_data.get('metric')
        amount = usage_data.get('amount')
        
        if not customer_id or not metric or amount is None:
            return {
                'success': False,
                'error': 'customer_id, metric, and amount are required'
            }
        
        result = billing_engine.record_usage(customer_id, metric, amount)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to record usage: {str(e)}"
        }


@router.get("/invoice/{invoice_id}")
async def get_invoice(invoice_id: str) -> Dict[str, Any]:
    """Get invoice by ID"""
    try:
        invoice = billing_engine.invoices.get(invoice_id)
        
        if not invoice:
            return {
                'success': False,
                'error': f'Invoice {invoice_id} not found'
            }
        
        return {
            'success': True,
            'invoice': invoice.to_dict()
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get invoice: {str(e)}"
        }


@router.get("/summary/{customer_id}")
async def get_billing_summary(customer_id: str) -> Dict[str, Any]:
    """Get billing summary for customer"""
    try:
        result = billing_engine.build_billing_summary(customer_id)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get billing summary: {str(e)}"
        }


@router.get("/metrics")
async def get_billing_metrics() -> Dict[str, Any]:
    """Get billing metrics and daily report"""
    try:
        report = billing_reporter.generate_daily_report()
        
        return {
            'success': True,
            'report': report
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get metrics: {str(e)}"
        }


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check for billing system"""
    try:
        engine_health = billing_engine.health()
        reporter_health = billing_reporter.health()
        
        return {
            'success': True,
            'engine': engine_health,
            'reporter': reporter_health
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Health check failed: {str(e)}"
        }


@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """Get billing system information"""
    try:
        engine_info = billing_engine.info()
        reporter_info = billing_reporter.info()
        
        return {
            'success': True,
            'engine': engine_info,
            'reporter': reporter_info
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to get info: {str(e)}"
        }

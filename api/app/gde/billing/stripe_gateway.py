"""
Simulated Stripe Gateway

Pure Python simulation of Stripe payment gateway with no external dependencies.
Simulates customer management, payment processing, subscriptions, and webhooks.
"""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from .billing_schema import PaymentIntentStatus


class StripeGateway:
    """
    Simulated Stripe Gateway
    
    Provides payment processing simulation without external Stripe SDK.
    All operations are deterministic based on token patterns.
    """
    
    VERSION = "1.0.0"
    WEBHOOK_SECRET = "whsec_simulated_secret_key_for_ghostquant"
    
    def __init__(self):
        self.customers: Dict[str, Dict[str, Any]] = {}
        self.payment_methods: Dict[str, Dict[str, Any]] = {}
        self.subscriptions: Dict[str, Dict[str, Any]] = {}
        self.payment_intents: Dict[str, Dict[str, Any]] = {}
        self.charges: Dict[str, Dict[str, Any]] = {}
        self.refunds: Dict[str, Dict[str, Any]] = {}
        self.events: List[Dict[str, Any]] = []
        self.idempotency_keys: Dict[str, str] = {}
    
    
    def create_customer(self, email: str, name: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a Stripe customer
        
        Args:
            email: Customer email
            name: Customer name
            metadata: Optional metadata
        
        Returns:
            Customer object
        """
        customer_id = f"cus_{secrets.token_hex(12)}"
        
        customer = {
            'id': customer_id,
            'object': 'customer',
            'email': email,
            'name': name,
            'default_source': None,
            'created': int(datetime.utcnow().timestamp()),
            'metadata': metadata or {}
        }
        
        self.customers[customer_id] = customer
        
        self._create_event('customer.created', customer)
        
        return customer
    
    def get_customer(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get customer by ID"""
        return self.customers.get(customer_id)
    
    
    def attach_payment(self, customer_id: str, token: str) -> Dict[str, Any]:
        """
        Attach payment method to customer
        
        Args:
            customer_id: Customer ID
            token: Payment token (simulated)
        
        Returns:
            Payment method object
        """
        if customer_id not in self.customers:
            raise ValueError(f"Customer {customer_id} not found")
        
        pm_id = f"pm_{secrets.token_hex(12)}"
        
        card_details = self._parse_token(token)
        
        payment_method = {
            'id': pm_id,
            'object': 'payment_method',
            'type': 'card',
            'card': card_details,
            'customer': customer_id,
            'created': int(datetime.utcnow().timestamp())
        }
        
        self.payment_methods[pm_id] = payment_method
        
        self.customers[customer_id]['default_source'] = pm_id
        
        self._create_event('payment_method.attached', payment_method)
        
        return payment_method
    
    def _parse_token(self, token: str) -> Dict[str, Any]:
        """Parse payment token to determine card details"""
        if token == 'tok_ok':
            return {
                'brand': 'visa',
                'last4': '4242',
                'exp_month': 12,
                'exp_year': 2030,
                'funding': 'credit'
            }
        elif token == 'tok_fail':
            return {
                'brand': 'visa',
                'last4': '0002',
                'exp_month': 12,
                'exp_year': 2030,
                'funding': 'credit'
            }
        elif token == 'tok_insufficient':
            return {
                'brand': 'visa',
                'last4': '9995',
                'exp_month': 12,
                'exp_year': 2030,
                'funding': 'debit'
            }
        elif token == 'tok_risk':
            return {
                'brand': 'visa',
                'last4': '0019',
                'exp_month': 12,
                'exp_year': 2030,
                'funding': 'credit'
            }
        else:
            return {
                'brand': 'visa',
                'last4': '4242',
                'exp_month': 12,
                'exp_year': 2030,
                'funding': 'credit'
            }
    
    
    def create_subscription(
        self,
        customer_id: str,
        plan_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a subscription
        
        Args:
            customer_id: Customer ID
            plan_id: Plan ID
            metadata: Optional metadata
        
        Returns:
            Subscription object
        """
        if customer_id not in self.customers:
            raise ValueError(f"Customer {customer_id} not found")
        
        sub_id = f"sub_{secrets.token_hex(12)}"
        
        now = datetime.utcnow()
        period_end = now + timedelta(days=30)
        
        subscription = {
            'id': sub_id,
            'object': 'subscription',
            'customer': customer_id,
            'plan': plan_id,
            'status': 'active',
            'current_period_start': int(now.timestamp()),
            'current_period_end': int(period_end.timestamp()),
            'cancel_at_period_end': False,
            'canceled_at': None,
            'created': int(now.timestamp()),
            'metadata': metadata or {}
        }
        
        self.subscriptions[sub_id] = subscription
        
        self._create_event('customer.subscription.created', subscription)
        
        return subscription
    
    def cancel_subscription(self, subscription_id: str, at_period_end: bool = False) -> Dict[str, Any]:
        """
        Cancel a subscription
        
        Args:
            subscription_id: Subscription ID
            at_period_end: Cancel at period end or immediately
        
        Returns:
            Updated subscription object
        """
        if subscription_id not in self.subscriptions:
            raise ValueError(f"Subscription {subscription_id} not found")
        
        subscription = self.subscriptions[subscription_id]
        
        if at_period_end:
            subscription['cancel_at_period_end'] = True
            subscription['canceled_at'] = int(datetime.utcnow().timestamp())
        else:
            subscription['status'] = 'canceled'
            subscription['canceled_at'] = int(datetime.utcnow().timestamp())
        
        self._create_event('customer.subscription.deleted', subscription)
        
        return subscription
    
    
    def create_payment_intent(
        self,
        amount: float,
        currency: str,
        customer_id: str,
        metadata: Optional[Dict[str, Any]] = None,
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a payment intent
        
        Args:
            amount: Amount in cents
            currency: Currency code
            customer_id: Customer ID
            metadata: Optional metadata
            idempotency_key: Idempotency key for retry safety
        
        Returns:
            Payment intent object
        """
        if idempotency_key and idempotency_key in self.idempotency_keys:
            intent_id = self.idempotency_keys[idempotency_key]
            return self.payment_intents[intent_id]
        
        if customer_id not in self.customers:
            raise ValueError(f"Customer {customer_id} not found")
        
        intent_id = f"pi_{secrets.token_hex(12)}"
        
        customer = self.customers[customer_id]
        payment_method = customer.get('default_source')
        
        status = PaymentIntentStatus.REQUIRES_CONFIRMATION.value
        if payment_method and payment_method in self.payment_methods:
            pm = self.payment_methods[payment_method]
            last4 = pm['card']['last4']
            
            if last4 == '4242':
                status = PaymentIntentStatus.SUCCEEDED.value
            elif last4 in ['0002', '9995', '0019']:
                status = PaymentIntentStatus.FAILED.value
            else:
                status = PaymentIntentStatus.SUCCEEDED.value
        
        intent = {
            'id': intent_id,
            'object': 'payment_intent',
            'amount': int(amount * 100),  # Convert to cents
            'currency': currency,
            'customer': customer_id,
            'payment_method': payment_method,
            'status': status,
            'created': int(datetime.utcnow().timestamp()),
            'metadata': metadata or {}
        }
        
        self.payment_intents[intent_id] = intent
        
        if idempotency_key:
            self.idempotency_keys[idempotency_key] = intent_id
        
        if status == PaymentIntentStatus.SUCCEEDED.value:
            self._create_charge(intent)
            self._create_event('payment_intent.succeeded', intent)
        else:
            self._create_event('payment_intent.payment_failed', intent)
        
        return intent
    
    def _create_charge(self, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Create a charge from payment intent"""
        charge_id = f"ch_{secrets.token_hex(12)}"
        
        charge = {
            'id': charge_id,
            'object': 'charge',
            'amount': intent['amount'],
            'currency': intent['currency'],
            'customer': intent['customer'],
            'payment_intent': intent['id'],
            'status': 'succeeded',
            'paid': True,
            'refunded': False,
            'created': int(datetime.utcnow().timestamp())
        }
        
        self.charges[charge_id] = charge
        
        self._create_event('charge.succeeded', charge)
        
        return charge
    
    
    def refund(self, charge_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Refund a charge
        
        Args:
            charge_id: Charge ID
            amount: Amount to refund (None for full refund)
        
        Returns:
            Refund object
        """
        if charge_id not in self.charges:
            raise ValueError(f"Charge {charge_id} not found")
        
        charge = self.charges[charge_id]
        
        refund_id = f"re_{secrets.token_hex(12)}"
        refund_amount = amount if amount is not None else charge['amount']
        
        refund = {
            'id': refund_id,
            'object': 'refund',
            'amount': int(refund_amount * 100) if isinstance(refund_amount, float) else refund_amount,
            'charge': charge_id,
            'currency': charge['currency'],
            'status': 'succeeded',
            'created': int(datetime.utcnow().timestamp())
        }
        
        self.refunds[refund_id] = refund
        
        charge['refunded'] = True
        
        self._create_event('charge.refunded', charge)
        
        return refund
    
    
    def list_charges(self, customer_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        List charges
        
        Args:
            customer_id: Filter by customer
            limit: Maximum number of charges
        
        Returns:
            List of charges
        """
        charges = list(self.charges.values())
        
        if customer_id:
            charges = [c for c in charges if c.get('customer') == customer_id]
        
        charges.sort(key=lambda x: x['created'], reverse=True)
        
        return charges[:limit]
    
    
    def validate_webhook_signature(self, payload: str, signature_header: str) -> bool:
        """
        Validate webhook signature
        
        Args:
            payload: Webhook payload
            signature_header: Signature header
        
        Returns:
            True if valid, False otherwise
        """
        try:
            parts = signature_header.split(',')
            timestamp = None
            signatures = []
            
            for part in parts:
                if part.startswith('t='):
                    timestamp = part[2:]
                elif part.startswith('v1='):
                    signatures.append(part[3:])
            
            if not timestamp or not signatures:
                return False
            
            now = int(datetime.utcnow().timestamp())
            if abs(now - int(timestamp)) > 300:
                return False
            
            signed_payload = f"{timestamp}.{payload}"
            expected_sig = hmac.new(
                self.WEBHOOK_SECRET.encode(),
                signed_payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return any(hmac.compare_digest(expected_sig, sig) for sig in signatures)
        
        except Exception:
            return False
    
    def _create_event(self, event_type: str, data: Dict[str, Any]):
        """Create an event"""
        event = {
            'id': f"evt_{secrets.token_hex(12)}",
            'object': 'event',
            'type': event_type,
            'data': {'object': data},
            'created': int(datetime.utcnow().timestamp())
        }
        
        self.events.append(event)
    
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'customers': len(self.customers),
            'subscriptions': len(self.subscriptions),
            'payment_intents': len(self.payment_intents),
            'charges': len(self.charges),
            'events': len(self.events)
        }

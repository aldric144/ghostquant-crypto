"""
Billing Reporter

Generates revenue reports, MRR/ARR calculations, churn analysis,
and fraud pattern detection.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
from .billing_schema import SubscriptionStatus, InvoiceStatus


class BillingReporter:
    """
    Billing reporter for revenue metrics and fraud detection
    
    Features:
    - Daily revenue reports
    - MRR (Monthly Recurring Revenue)
    - ARR (Annual Recurring Revenue)
    - Churn rate calculation
    - Upgrade/downgrade tracking
    - Overdue summaries
    - Fraud pattern detection
    """
    
    VERSION = "1.0.0"
    
    def __init__(self, billing_engine):
        self.engine = billing_engine
    
    
    def calculate_mrr(self) -> float:
        """
        Calculate Monthly Recurring Revenue
        
        Returns:
            MRR amount
        """
        mrr = 0.0
        
        for subscription in self.engine.subscriptions.values():
            if subscription.status != SubscriptionStatus.ACTIVE.value:
                continue
            
            plan = self.engine.gateway.subscriptions.get(subscription.id, {}).get('plan')
            if not plan:
                continue
            
            from .billing_plans import get_plan
            plan_obj = get_plan(subscription.plan_id)
            
            if not plan_obj:
                continue
            
            if plan_obj.billing_period == 'monthly':
                mrr += plan_obj.price
            elif plan_obj.billing_period == 'annual':
                mrr += plan_obj.price / 12
            elif plan_obj.billing_period == 'enterprise':
                mrr += plan_obj.price / 12
        
        return mrr
    
    def calculate_arr(self) -> float:
        """
        Calculate Annual Recurring Revenue
        
        Returns:
            ARR amount
        """
        return self.calculate_mrr() * 12
    
    
    def calculate_churn_rate(self, period_days: int = 30) -> float:
        """
        Calculate churn rate
        
        Args:
            period_days: Period in days
        
        Returns:
            Churn rate as percentage
        """
        now = datetime.utcnow()
        period_start = now - timedelta(days=period_days)
        
        active_start = 0
        churned = 0
        
        for subscription in self.engine.subscriptions.values():
            created_at = datetime.fromisoformat(subscription.created_at)
            
            if created_at < period_start:
                active_start += 1
                
                if subscription.status == SubscriptionStatus.CANCELED.value:
                    if subscription.canceled_at:
                        canceled_at = datetime.fromisoformat(subscription.canceled_at)
                        if canceled_at >= period_start:
                            churned += 1
        
        if active_start == 0:
            return 0.0
        
        return (churned / active_start) * 100
    
    
    def track_plan_changes(self, period_days: int = 30) -> Dict[str, int]:
        """
        Track plan upgrades and downgrades
        
        Args:
            period_days: Period in days
        
        Returns:
            Dict with upgrade/downgrade counts
        """
        now = datetime.utcnow()
        period_start = now - timedelta(days=period_days)
        
        upgrades = 0
        downgrades = 0
        
        for event in self.engine.events:
            event_time = datetime.fromisoformat(event['timestamp'])
            
            if event_time < period_start:
                continue
            
            if event['type'] == 'subscription_upgraded':
                upgrades += 1
            elif event['type'] == 'subscription_downgraded':
                downgrades += 1
        
        return {
            'upgrades': upgrades,
            'downgrades': downgrades,
            'net_change': upgrades - downgrades
        }
    
    
    def get_overdue_summary(self) -> Dict[str, Any]:
        """
        Get overdue invoices summary
        
        Returns:
            Overdue summary dict
        """
        now = datetime.utcnow()
        
        overdue_invoices = []
        total_overdue = 0.0
        customers_affected = set()
        
        for invoice in self.engine.invoices.values():
            if invoice.status != InvoiceStatus.OPEN.value:
                continue
            
            due_date = datetime.fromisoformat(invoice.due_date)
            
            if due_date < now:
                days_overdue = (now - due_date).days
                
                overdue_invoices.append({
                    'invoice_id': invoice.id,
                    'customer_id': invoice.customer_id,
                    'amount': invoice.amount_due,
                    'days_overdue': days_overdue,
                    'due_date': invoice.due_date
                })
                
                total_overdue += invoice.amount_due
                customers_affected.add(invoice.customer_id)
        
        return {
            'total_overdue': total_overdue,
            'invoice_count': len(overdue_invoices),
            'customers_affected': len(customers_affected),
            'invoices': overdue_invoices
        }
    
    
    def detect_fraud_patterns(self) -> Dict[str, Any]:
        """
        Detect fraud patterns
        
        Returns:
            Fraud detection summary
        """
        fraud_customers = []
        
        for customer in self.engine.customers.values():
            if customer.failed_payments_count >= 3:
                if customer.last_payment_failure:
                    last_failure = datetime.fromisoformat(customer.last_payment_failure)
                    days_since = (datetime.utcnow() - last_failure).days
                    
                    if days_since <= 7:
                        fraud_customers.append({
                            'customer_id': customer.id,
                            'email': customer.email,
                            'failed_payments': customer.failed_payments_count,
                            'last_failure': customer.last_payment_failure,
                            'fraud_risk': customer.fraud_risk
                        })
        
        return {
            'fraud_risk_customers': len(fraud_customers),
            'customers': fraud_customers,
            'patterns_detected': [
                '3+ payment failures in 7 days'
            ]
        }
    
    
    def generate_daily_report(self) -> Dict[str, Any]:
        """
        Generate daily revenue report
        
        Returns:
            Daily report dict with metrics and narrative
        """
        mrr = self.calculate_mrr()
        arr = self.calculate_arr()
        churn_rate = self.calculate_churn_rate(30)
        plan_changes = self.track_plan_changes(30)
        overdue = self.get_overdue_summary()
        fraud = self.detect_fraud_patterns()
        
        active_subs = sum(
            1 for sub in self.engine.subscriptions.values()
            if sub.status == SubscriptionStatus.ACTIVE.value
        )
        
        total_customers = len(self.engine.customers)
        
        today = datetime.utcnow().date().isoformat()
        today_revenue = 0.0
        
        for invoice in self.engine.invoices.values():
            if invoice.status == InvoiceStatus.PAID.value and invoice.paid_at:
                paid_date = datetime.fromisoformat(invoice.paid_at).date().isoformat()
                if paid_date == today:
                    today_revenue += invoice.total
        
        narrative = self._build_daily_narrative(
            mrr=mrr,
            arr=arr,
            churn_rate=churn_rate,
            active_subs=active_subs,
            total_customers=total_customers,
            today_revenue=today_revenue,
            plan_changes=plan_changes,
            overdue=overdue,
            fraud=fraud
        )
        
        return {
            'date': datetime.utcnow().isoformat(),
            'metrics': {
                'mrr': mrr,
                'arr': arr,
                'churn_rate': churn_rate,
                'active_subscriptions': active_subs,
                'total_customers': total_customers,
                'today_revenue': today_revenue
            },
            'plan_changes': plan_changes,
            'overdue': overdue,
            'fraud': fraud,
            'summary': narrative
        }
    
    def _build_daily_narrative(
        self,
        mrr: float,
        arr: float,
        churn_rate: float,
        active_subs: int,
        total_customers: int,
        today_revenue: float,
        plan_changes: Dict[str, int],
        overdue: Dict[str, Any],
        fraud: Dict[str, Any]
    ) -> str:
        """Build daily report narrative"""
        parts = []
        
        parts.append(f"GhostQuant Billing Report: MRR ${mrr:,.2f}, ARR ${arr:,.2f}")
        
        parts.append(f"{active_subs} active subscriptions across {total_customers} customers")
        
        if today_revenue > 0:
            parts.append(f"Today's revenue: ${today_revenue:,.2f}")
        
        if churn_rate > 0:
            parts.append(f"30-day churn rate: {churn_rate:.1f}%")
        
        if plan_changes['upgrades'] > 0 or plan_changes['downgrades'] > 0:
            parts.append(
                f"{plan_changes['upgrades']} upgrades, "
                f"{plan_changes['downgrades']} downgrades in last 30 days"
            )
        
        if overdue['invoice_count'] > 0:
            parts.append(
                f"⚠️ {overdue['invoice_count']} overdue invoices "
                f"totaling ${overdue['total_overdue']:,.2f}"
            )
        
        if fraud['fraud_risk_customers'] > 0:
            parts.append(
                f"🚨 {fraud['fraud_risk_customers']} customers flagged for fraud risk"
            )
        
        return '. '.join(parts) + '.'
    
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'engine_health': self.engine.health()
        }
    
    def info(self) -> Dict[str, Any]:
        """Get reporter information"""
        return {
            'version': self.VERSION,
            'features': [
                'Daily revenue reports',
                'MRR/ARR calculation',
                'Churn rate analysis',
                'Upgrade/downgrade tracking',
                'Overdue summaries',
                'Fraud pattern detection'
            ]
        }

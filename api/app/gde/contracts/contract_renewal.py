"""
Channel Partner Contract Renewal Engine
Global Distributor Edition (GDE)

Comprehensive renewal and amendment management for distributor contracts
including auto-renewal processing, term modifications, and renewal negotiations.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .contract_schema import (
    ContractStatus,
    DistributorTier,
    CurrencyCode,
    ContractAmendment,
    RenewalTerms,
    DistributorContract
)


class RenewalEngine:
    """
    GhostQuant Contract Renewal Engine™
    
    Manages contract renewals, amendments, and term modifications
    for global distributor contracts.
    """
    
    VERSION = "3.0.0"
    
    DEFAULT_RENEWAL_NOTICE_DAYS = 90
    DEFAULT_RENEWAL_TERM_MONTHS = 12
    
    RENEWAL_PRICE_ADJUSTMENTS = {
        'standard': 0.03,
        'inflation': 0.05,
        'performance_based': 0.00,
        'loyalty_discount': -0.02
    }
    
    TIER_UPGRADE_CRITERIA = {
        DistributorTier.AUTHORIZED: {
            'next_tier': DistributorTier.PREFERRED,
            'revenue_threshold': 250000,
            'growth_threshold': 0.20,
            'customer_threshold': 15
        },
        DistributorTier.PREFERRED: {
            'next_tier': DistributorTier.PREMIER,
            'revenue_threshold': 500000,
            'growth_threshold': 0.25,
            'customer_threshold': 30
        },
        DistributorTier.PREMIER: {
            'next_tier': DistributorTier.STRATEGIC,
            'revenue_threshold': 1000000,
            'growth_threshold': 0.30,
            'customer_threshold': 50
        },
        DistributorTier.STRATEGIC: {
            'next_tier': DistributorTier.GLOBAL_ELITE,
            'revenue_threshold': 5000000,
            'growth_threshold': 0.35,
            'customer_threshold': 100
        },
        DistributorTier.GLOBAL_ELITE: {
            'next_tier': None,
            'revenue_threshold': None,
            'growth_threshold': None,
            'customer_threshold': None
        }
    }
    
    AMENDMENT_TYPES = [
        'pricing_adjustment',
        'territory_modification',
        'commitment_change',
        'term_extension',
        'tier_upgrade',
        'tier_downgrade',
        'product_addition',
        'product_removal',
        'compliance_update',
        'contact_update',
        'legal_update',
        'general_modification'
    ]
    
    def __init__(self):
        self._renewal_queue: Dict[str, Dict[str, Any]] = {}
        self._amendment_history: Dict[str, List[ContractAmendment]] = {}
        self._renewal_history: Dict[str, List[RenewalTerms]] = {}
    
    def check_renewal_eligibility(
        self,
        contract: DistributorContract
    ) -> Dict[str, Any]:
        """
        Check if contract is eligible for renewal
        
        Args:
            contract: Contract to check
        
        Returns:
            Eligibility assessment
        """
        now = datetime.utcnow()
        expiration = datetime.fromisoformat(contract.terms.expiration_date)
        days_until_expiration = (expiration - now).days
        
        is_eligible = (
            contract.status == ContractStatus.ACTIVE and
            days_until_expiration > 0 and
            days_until_expiration <= 180
        )
        
        blockers = []
        if contract.status != ContractStatus.ACTIVE:
            blockers.append(f"Contract status is {contract.status.value}, must be active")
        if days_until_expiration <= 0:
            blockers.append("Contract has already expired")
        if days_until_expiration > 180:
            blockers.append("Too early for renewal (more than 180 days until expiration)")
        
        urgency = 'none'
        if days_until_expiration <= 30:
            urgency = 'critical'
        elif days_until_expiration <= 60:
            urgency = 'high'
        elif days_until_expiration <= 90:
            urgency = 'medium'
        elif days_until_expiration <= 180:
            urgency = 'low'
        
        return {
            'contract_id': contract.contract_id,
            'is_eligible': is_eligible,
            'days_until_expiration': days_until_expiration,
            'expiration_date': contract.terms.expiration_date,
            'urgency': urgency,
            'blockers': blockers,
            'auto_renewal_enabled': contract.terms.auto_renewal,
            'notice_period_days': contract.terms.notice_period_days,
            'notice_deadline': (expiration - timedelta(days=contract.terms.notice_period_days)).isoformat(),
            'checked_at': now.isoformat()
        }
    
    def calculate_renewal_terms(
        self,
        contract: DistributorContract,
        performance_data: Dict[str, Any] = None,
        requested_changes: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculate proposed renewal terms
        
        Args:
            contract: Contract to renew
            performance_data: Performance metrics for the contract period
            requested_changes: Changes requested by distributor
        
        Returns:
            Proposed renewal terms
        """
        current_terms = contract.terms
        
        price_adjustment = self.RENEWAL_PRICE_ADJUSTMENTS['standard']
        
        if performance_data:
            revenue_achievement = performance_data.get('revenue_achievement', 1.0)
            if revenue_achievement >= 1.2:
                price_adjustment = self.RENEWAL_PRICE_ADJUSTMENTS['loyalty_discount']
            elif revenue_achievement >= 1.0:
                price_adjustment = self.RENEWAL_PRICE_ADJUSTMENTS['performance_based']
            else:
                price_adjustment = self.RENEWAL_PRICE_ADJUSTMENTS['inflation']
        
        tier_recommendation = self._evaluate_tier_change(
            current_terms.distributor_tier,
            performance_data
        )
        
        new_commitment = current_terms.commitments[0].minimum_revenue_commitment if current_terms.commitments else 0
        if performance_data:
            actual_revenue = performance_data.get('actual_revenue', 0)
            if actual_revenue > new_commitment:
                new_commitment = actual_revenue * 1.1
        
        expiration = datetime.fromisoformat(current_terms.expiration_date)
        new_start = expiration + timedelta(days=1)
        new_end = new_start + timedelta(days=current_terms.renewal_term_months * 30)
        
        territory_changes = []
        product_changes = []
        
        if requested_changes:
            if 'additional_territories' in requested_changes:
                territory_changes = requested_changes['additional_territories']
            if 'additional_products' in requested_changes:
                product_changes = requested_changes['additional_products']
        
        return {
            'renewal_id': f"REN-{secrets.token_hex(6).upper()}",
            'contract_id': contract.contract_id,
            'current_expiration': current_terms.expiration_date,
            'proposed_start': new_start.strftime("%Y-%m-%d"),
            'proposed_end': new_end.strftime("%Y-%m-%d"),
            'renewal_term_months': current_terms.renewal_term_months,
            'pricing': {
                'adjustment_type': 'standard' if price_adjustment > 0 else 'loyalty',
                'adjustment_percentage': price_adjustment,
                'current_credit_limit': current_terms.credit_limit,
                'proposed_credit_limit': current_terms.credit_limit * (1 + price_adjustment)
            },
            'tier': {
                'current_tier': current_terms.distributor_tier.value,
                'recommended_tier': tier_recommendation['recommended_tier'],
                'tier_change_reason': tier_recommendation['reason']
            },
            'commitments': {
                'current_commitment': current_terms.commitments[0].minimum_revenue_commitment if current_terms.commitments else 0,
                'proposed_commitment': new_commitment,
                'growth_expectation': 0.10
            },
            'territory_changes': territory_changes,
            'product_changes': product_changes,
            'auto_renewal': current_terms.auto_renewal,
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def _evaluate_tier_change(
        self,
        current_tier: DistributorTier,
        performance_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Evaluate if tier change is warranted"""
        
        if not performance_data:
            return {
                'recommended_tier': current_tier.value,
                'reason': 'No performance data available for tier evaluation'
            }
        
        criteria = self.TIER_UPGRADE_CRITERIA.get(current_tier)
        if not criteria or not criteria['next_tier']:
            return {
                'recommended_tier': current_tier.value,
                'reason': 'Already at highest tier'
            }
        
        actual_revenue = performance_data.get('actual_revenue', 0)
        actual_growth = performance_data.get('growth_rate', 0)
        customer_count = performance_data.get('customer_count', 0)
        
        meets_revenue = actual_revenue >= criteria['revenue_threshold']
        meets_growth = actual_growth >= criteria['growth_threshold']
        meets_customers = customer_count >= criteria['customer_threshold']
        
        if meets_revenue and meets_growth and meets_customers:
            return {
                'recommended_tier': criteria['next_tier'].value,
                'reason': f'Performance exceeds {criteria["next_tier"].value} tier requirements',
                'metrics_met': {
                    'revenue': meets_revenue,
                    'growth': meets_growth,
                    'customers': meets_customers
                }
            }
        
        return {
            'recommended_tier': current_tier.value,
            'reason': 'Performance does not meet upgrade criteria',
            'metrics_met': {
                'revenue': meets_revenue,
                'growth': meets_growth,
                'customers': meets_customers
            },
            'gaps': {
                'revenue_gap': max(0, criteria['revenue_threshold'] - actual_revenue),
                'growth_gap': max(0, criteria['growth_threshold'] - actual_growth),
                'customer_gap': max(0, criteria['customer_threshold'] - customer_count)
            }
        }
    
    def create_renewal(
        self,
        contract: DistributorContract,
        renewal_terms: Dict[str, Any],
        approved_by: Dict[str, str]
    ) -> RenewalTerms:
        """
        Create a contract renewal
        
        Args:
            contract: Contract to renew
            renewal_terms: Approved renewal terms
            approved_by: Approver information
        
        Returns:
            RenewalTerms instance
        """
        renewal = RenewalTerms(
            renewal_id=renewal_terms.get('renewal_id', f"REN-{secrets.token_hex(6).upper()}"),
            contract_id=contract.contract_id,
            original_term_end=contract.terms.expiration_date,
            renewal_term_start=renewal_terms['proposed_start'],
            renewal_term_end=renewal_terms['proposed_end'],
            renewal_type='standard',
            auto_renewal=renewal_terms.get('auto_renewal', True),
            notice_period_days=contract.terms.notice_period_days,
            price_adjustment_percentage=renewal_terms['pricing']['adjustment_percentage'],
            commitment_changes={
                'previous': renewal_terms['commitments']['current_commitment'],
                'new': renewal_terms['commitments']['proposed_commitment']
            },
            territory_changes=renewal_terms.get('territory_changes', []),
            product_changes=renewal_terms.get('product_changes', []),
            new_terms=[],
            renewal_conditions=[
                'Continued compliance with partner agreement',
                'No outstanding payment issues',
                'Maintenance of required certifications'
            ]
        )
        
        if contract.contract_id not in self._renewal_history:
            self._renewal_history[contract.contract_id] = []
        
        self._renewal_history[contract.contract_id].append(renewal)
        
        return renewal
    
    def process_auto_renewal(
        self,
        contract: DistributorContract
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Process automatic renewal for a contract
        
        Args:
            contract: Contract to auto-renew
        
        Returns:
            Tuple of (success, renewal_details or error)
        """
        if not contract.terms.auto_renewal:
            return False, {'error': 'Auto-renewal not enabled for this contract'}
        
        eligibility = self.check_renewal_eligibility(contract)
        if not eligibility['is_eligible']:
            return False, {'error': 'Contract not eligible for renewal', 'blockers': eligibility['blockers']}
        
        renewal_terms = self.calculate_renewal_terms(contract)
        
        system_approver = {
            'name': 'Auto-Renewal System',
            'role': 'system',
            'email': 'system@ghostquant.io'
        }
        
        renewal = self.create_renewal(contract, renewal_terms, system_approver)
        
        return True, {
            'renewal': renewal.to_dict(),
            'processed_at': datetime.utcnow().isoformat(),
            'auto_renewed': True
        }
    
    def create_amendment(
        self,
        contract: DistributorContract,
        amendment_type: str,
        sections_modified: List[str],
        original_terms: Dict[str, Any],
        amended_terms: Dict[str, Any],
        reason: str,
        approved_by: List[Dict[str, str]]
    ) -> ContractAmendment:
        """
        Create a contract amendment
        
        Args:
            contract: Contract to amend
            amendment_type: Type of amendment
            sections_modified: Contract sections being modified
            original_terms: Original term values
            amended_terms: New term values
            reason: Reason for amendment
            approved_by: List of approvers
        
        Returns:
            ContractAmendment instance
        """
        if amendment_type not in self.AMENDMENT_TYPES:
            raise ValueError(f"Invalid amendment type: {amendment_type}")
        
        existing_amendments = self._amendment_history.get(contract.contract_id, [])
        amendment_number = len(existing_amendments) + 1
        
        now = datetime.utcnow()
        
        amendment = ContractAmendment(
            amendment_id=f"AMD-{secrets.token_hex(6).upper()}",
            contract_id=contract.contract_id,
            amendment_number=amendment_number,
            amendment_date=now.strftime("%Y-%m-%d"),
            effective_date=now.strftime("%Y-%m-%d"),
            amendment_type=amendment_type,
            sections_modified=sections_modified,
            original_terms=original_terms,
            amended_terms=amended_terms,
            reason_for_amendment=reason,
            approved_by=approved_by,
            approval_date=now.strftime("%Y-%m-%d"),
            amendment_text=self._generate_amendment_text(
                contract, amendment_number, amendment_type,
                sections_modified, original_terms, amended_terms, reason
            )
        )
        
        if contract.contract_id not in self._amendment_history:
            self._amendment_history[contract.contract_id] = []
        
        self._amendment_history[contract.contract_id].append(amendment)
        
        return amendment
    
    def _generate_amendment_text(
        self,
        contract: DistributorContract,
        amendment_number: int,
        amendment_type: str,
        sections_modified: List[str],
        original_terms: Dict[str, Any],
        amended_terms: Dict[str, Any],
        reason: str
    ) -> str:
        """Generate formal amendment text"""
        
        text = f"""
AMENDMENT NO. {amendment_number}
TO
DISTRIBUTION AGREEMENT {contract.contract_number}

This Amendment No. {amendment_number} ("Amendment") is made and entered into as of 
{datetime.utcnow().strftime("%B %d, %Y")} ("Amendment Effective Date")

BETWEEN:

GhostQuant Technologies, Inc. ("Vendor")

AND:

{contract.distributor.company_name} ("Distributor")

RECITALS

WHEREAS, Vendor and Distributor entered into that certain Distribution Agreement 
dated {contract.terms.effective_date} (the "Agreement"); and

WHEREAS, the parties desire to amend the Agreement as set forth herein;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, 
the parties agree as follows:

1. AMENDMENT TYPE: {amendment_type.replace('_', ' ').title()}

2. REASON FOR AMENDMENT:
   {reason}

3. SECTIONS MODIFIED:
   {', '.join(sections_modified)}

4. CHANGES:

   ORIGINAL TERMS:
"""
        for key, value in original_terms.items():
            text += f"   - {key}: {value}\n"
        
        text += """
   AMENDED TERMS:
"""
        for key, value in amended_terms.items():
            text += f"   - {key}: {value}\n"
        
        text += """
5. EFFECT OF AMENDMENT

   Except as expressly modified by this Amendment, all terms and conditions 
   of the Agreement shall remain in full force and effect.

6. COUNTERPARTS

   This Amendment may be executed in counterparts, each of which shall be 
   deemed an original.

IN WITNESS WHEREOF, the parties have executed this Amendment as of the 
Amendment Effective Date.

GHOSTQUANT TECHNOLOGIES, INC.          {distributor_name}


_________________________________       _________________________________
Signature                               Signature

_________________________________       _________________________________
Name:                                   Name:
Title:                                  Title:
Date:                                   Date:
""".format(distributor_name=contract.distributor.company_name.upper())
        
        return text
    
    def get_amendment_history(
        self,
        contract_id: str
    ) -> List[ContractAmendment]:
        """Get amendment history for a contract"""
        return self._amendment_history.get(contract_id, [])
    
    def get_renewal_history(
        self,
        contract_id: str
    ) -> List[RenewalTerms]:
        """Get renewal history for a contract"""
        return self._renewal_history.get(contract_id, [])
    
    def queue_for_renewal(
        self,
        contract: DistributorContract,
        priority: str = 'normal'
    ) -> Dict[str, Any]:
        """
        Add contract to renewal queue
        
        Args:
            contract: Contract to queue
            priority: Queue priority (low, normal, high, critical)
        
        Returns:
            Queue entry
        """
        eligibility = self.check_renewal_eligibility(contract)
        
        entry = {
            'queue_id': f"RQ-{secrets.token_hex(4).upper()}",
            'contract_id': contract.contract_id,
            'contract_number': contract.contract_number,
            'distributor_name': contract.distributor.company_name,
            'expiration_date': contract.terms.expiration_date,
            'days_until_expiration': eligibility['days_until_expiration'],
            'priority': priority,
            'auto_renewal': contract.terms.auto_renewal,
            'queued_at': datetime.utcnow().isoformat(),
            'status': 'pending',
            'assigned_to': None
        }
        
        self._renewal_queue[contract.contract_id] = entry
        
        return entry
    
    def get_renewal_queue(
        self,
        priority: str = None,
        status: str = None
    ) -> List[Dict[str, Any]]:
        """Get renewal queue with optional filters"""
        
        queue = list(self._renewal_queue.values())
        
        if priority:
            queue = [e for e in queue if e['priority'] == priority]
        
        if status:
            queue = [e for e in queue if e['status'] == status]
        
        queue.sort(key=lambda x: x['days_until_expiration'])
        
        return queue
    
    def get_expiring_contracts(
        self,
        days_ahead: int = 90
    ) -> List[Dict[str, Any]]:
        """Get contracts expiring within specified days"""
        
        expiring = []
        cutoff = datetime.utcnow() + timedelta(days=days_ahead)
        
        for contract_id, entry in self._renewal_queue.items():
            expiration = datetime.fromisoformat(entry['expiration_date'])
            if expiration <= cutoff:
                expiring.append(entry)
        
        return sorted(expiring, key=lambda x: x['days_until_expiration'])
    
    def cancel_renewal(
        self,
        contract_id: str,
        reason: str,
        cancelled_by: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Cancel a pending renewal
        
        Args:
            contract_id: Contract ID
            reason: Cancellation reason
            cancelled_by: Person cancelling
        
        Returns:
            Cancellation record
        """
        if contract_id not in self._renewal_queue:
            raise ValueError(f"Contract {contract_id} not in renewal queue")
        
        entry = self._renewal_queue[contract_id]
        entry['status'] = 'cancelled'
        entry['cancelled_at'] = datetime.utcnow().isoformat()
        entry['cancellation_reason'] = reason
        entry['cancelled_by'] = cancelled_by
        
        return entry
    
    def generate_renewal_report(
        self,
        period_days: int = 90
    ) -> Dict[str, Any]:
        """
        Generate renewal pipeline report
        
        Args:
            period_days: Days to look ahead
        
        Returns:
            Renewal report
        """
        queue = self.get_renewal_queue()
        expiring = self.get_expiring_contracts(period_days)
        
        by_priority = {
            'critical': len([e for e in queue if e['priority'] == 'critical']),
            'high': len([e for e in queue if e['priority'] == 'high']),
            'normal': len([e for e in queue if e['priority'] == 'normal']),
            'low': len([e for e in queue if e['priority'] == 'low'])
        }
        
        by_status = {
            'pending': len([e for e in queue if e['status'] == 'pending']),
            'in_progress': len([e for e in queue if e['status'] == 'in_progress']),
            'completed': len([e for e in queue if e['status'] == 'completed']),
            'cancelled': len([e for e in queue if e['status'] == 'cancelled'])
        }
        
        auto_renewal_count = len([e for e in queue if e['auto_renewal']])
        
        return {
            'report_id': f"RPT-{secrets.token_hex(4).upper()}",
            'generated_at': datetime.utcnow().isoformat(),
            'period_days': period_days,
            'summary': {
                'total_in_queue': len(queue),
                'expiring_in_period': len(expiring),
                'auto_renewal_enabled': auto_renewal_count,
                'manual_renewal_required': len(queue) - auto_renewal_count
            },
            'by_priority': by_priority,
            'by_status': by_status,
            'critical_renewals': [e for e in expiring if e['days_until_expiration'] <= 30],
            'upcoming_renewals': expiring[:10]
        }
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'queue_size': len(self._renewal_queue),
            'total_amendments': sum(len(a) for a in self._amendment_history.values()),
            'total_renewals': sum(len(r) for r in self._renewal_history.values()),
            'amendment_types_supported': len(self.AMENDMENT_TYPES)
        }

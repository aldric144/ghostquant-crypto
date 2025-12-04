"""
Channel Partner Contract Negotiation Engine
Global Distributor Edition (GDE)

Comprehensive negotiation workflow engine for managing contract negotiations,
counter-proposals, approvals, and stakeholder communications.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .contract_schema import (
    ContractStatus,
    DistributorTier,
    NegotiationStatus,
    NegotiationTerm,
    NegotiationSession,
    NegotiationWorkflow,
    DistributorContract
)


class NegotiationEngine:
    """
    GhostQuant Contract Negotiation Engine™
    
    Manages the complete negotiation lifecycle for distributor contracts
    including proposals, counter-proposals, approvals, and tracking.
    """
    
    VERSION = "3.0.0"
    
    DEFAULT_MAX_ROUNDS = 5
    DEFAULT_DEADLINE_DAYS = 30
    
    NEGOTIABLE_TERMS = {
        'pricing': {
            'base_discount': {'min': 0.10, 'max': 0.60, 'step': 0.05},
            'volume_bonus': {'min': 0.00, 'max': 0.15, 'step': 0.02},
            'credit_limit': {'min': 25000, 'max': 5000000, 'step': 25000}
        },
        'commitments': {
            'minimum_revenue': {'min': 50000, 'max': 10000000, 'step': 25000},
            'growth_target': {'min': 0.05, 'max': 0.50, 'step': 0.05}
        },
        'terms': {
            'initial_term_months': {'min': 12, 'max': 60, 'step': 12},
            'notice_period_days': {'min': 30, 'max': 180, 'step': 30},
            'payment_terms_days': {'min': 15, 'max': 90, 'step': 15}
        },
        'territory': {
            'exclusivity': {'type': 'boolean'},
            'additional_countries': {'type': 'list'}
        },
        'support': {
            'support_level': {'options': ['standard', 'priority', 'dedicated', 'executive']},
            'nfr_licenses': {'min': 1, 'max': 100, 'step': 5}
        },
        'mdf': {
            'mdf_percentage': {'min': 0.01, 'max': 0.15, 'step': 0.01},
            'reimbursement_rate': {'min': 0.25, 'max': 0.75, 'step': 0.05}
        }
    }
    
    APPROVAL_THRESHOLDS = {
        'sales_manager': {
            'max_discount': 0.30,
            'max_credit_limit': 250000,
            'max_mdf_percentage': 0.05
        },
        'regional_director': {
            'max_discount': 0.45,
            'max_credit_limit': 1000000,
            'max_mdf_percentage': 0.08
        },
        'vp_sales': {
            'max_discount': 0.55,
            'max_credit_limit': 2500000,
            'max_mdf_percentage': 0.12
        },
        'cro': {
            'max_discount': 0.65,
            'max_credit_limit': 5000000,
            'max_mdf_percentage': 0.15
        },
        'ceo': {
            'max_discount': 1.00,
            'max_credit_limit': float('inf'),
            'max_mdf_percentage': 1.00
        }
    }
    
    def __init__(self):
        self._workflows: Dict[str, NegotiationWorkflow] = {}
        self._session_counter = 0
    
    def create_negotiation_workflow(
        self,
        contract: DistributorContract,
        initial_terms: List[Dict[str, Any]] = None,
        max_rounds: int = None,
        deadline_days: int = None,
        stakeholders: List[Dict[str, str]] = None
    ) -> NegotiationWorkflow:
        """
        Create a new negotiation workflow for a contract
        
        Args:
            contract: Contract to negotiate
            initial_terms: Initial negotiable terms
            max_rounds: Maximum negotiation rounds
            deadline_days: Days until negotiation deadline
            stakeholders: List of stakeholders involved
        
        Returns:
            NegotiationWorkflow instance
        """
        workflow_id = f"NEG-{secrets.token_hex(6).upper()}"
        now = datetime.utcnow()
        
        negotiable_terms = self._create_negotiable_terms(
            contract, initial_terms
        )
        
        default_stakeholders = [
            {"name": "Partner Manager", "role": "ghostquant_lead", "email": "partner@ghostquant.io"},
            {"name": "Legal Counsel", "role": "legal_review", "email": "legal@ghostquant.io"},
            {"name": "Finance", "role": "finance_review", "email": "finance@ghostquant.io"}
        ]
        
        approval_chain = self._determine_approval_chain(contract, negotiable_terms)
        
        deadline = now + timedelta(days=deadline_days or self.DEFAULT_DEADLINE_DAYS)
        
        workflow = NegotiationWorkflow(
            workflow_id=workflow_id,
            contract_id=contract.contract_id,
            status=NegotiationStatus.NOT_STARTED,
            started_at=now.isoformat(),
            last_updated=now.isoformat(),
            current_round=0,
            max_rounds=max_rounds or self.DEFAULT_MAX_ROUNDS,
            negotiable_terms=negotiable_terms,
            sessions=[],
            stakeholders=stakeholders or default_stakeholders,
            approval_chain=approval_chain,
            deadlines={
                "initial_response": (now + timedelta(days=7)).isoformat(),
                "counter_proposal": (now + timedelta(days=14)).isoformat(),
                "final_terms": (now + timedelta(days=21)).isoformat(),
                "execution": deadline.isoformat()
            },
            escalation_path=[
                {"level": 1, "role": "sales_manager", "days_to_escalate": 3},
                {"level": 2, "role": "regional_director", "days_to_escalate": 5},
                {"level": 3, "role": "vp_sales", "days_to_escalate": 7},
                {"level": 4, "role": "cro", "days_to_escalate": 10}
            ],
            notes=[]
        )
        
        self._workflows[workflow_id] = workflow
        return workflow
    
    def _create_negotiable_terms(
        self,
        contract: DistributorContract,
        initial_terms: List[Dict[str, Any]] = None
    ) -> List[NegotiationTerm]:
        """Create list of negotiable terms from contract"""
        
        terms = []
        
        if contract.terms.pricing_tiers:
            base_tier = contract.terms.pricing_tiers[0]
            terms.append(NegotiationTerm(
                term_id=f"TERM-{secrets.token_hex(4).upper()}",
                term_category="pricing",
                term_name="Base Discount",
                original_value=base_tier.discount_percentage,
                proposed_value=base_tier.discount_percentage,
                final_value=None,
                is_negotiable=True,
                minimum_acceptable=self.NEGOTIABLE_TERMS['pricing']['base_discount']['min'],
                maximum_acceptable=self.NEGOTIABLE_TERMS['pricing']['base_discount']['max'],
                justification="Standard tier discount",
                status="pending"
            ))
        
        terms.append(NegotiationTerm(
            term_id=f"TERM-{secrets.token_hex(4).upper()}",
            term_category="pricing",
            term_name="Credit Limit",
            original_value=contract.terms.credit_limit,
            proposed_value=contract.terms.credit_limit,
            final_value=None,
            is_negotiable=True,
            minimum_acceptable=self.NEGOTIABLE_TERMS['pricing']['credit_limit']['min'],
            maximum_acceptable=self.NEGOTIABLE_TERMS['pricing']['credit_limit']['max'],
            justification="Based on distributor tier and credit assessment",
            status="pending"
        ))
        
        if contract.terms.commitments:
            first_year = contract.terms.commitments[0]
            terms.append(NegotiationTerm(
                term_id=f"TERM-{secrets.token_hex(4).upper()}",
                term_category="commitments",
                term_name="Minimum Annual Revenue",
                original_value=first_year.minimum_revenue_commitment,
                proposed_value=first_year.minimum_revenue_commitment,
                final_value=None,
                is_negotiable=True,
                minimum_acceptable=self.NEGOTIABLE_TERMS['commitments']['minimum_revenue']['min'],
                maximum_acceptable=self.NEGOTIABLE_TERMS['commitments']['minimum_revenue']['max'],
                justification="Tier-based minimum commitment",
                status="pending"
            ))
            
            terms.append(NegotiationTerm(
                term_id=f"TERM-{secrets.token_hex(4).upper()}",
                term_category="commitments",
                term_name="Growth Target",
                original_value=first_year.growth_target_percentage / 100,
                proposed_value=first_year.growth_target_percentage / 100,
                final_value=None,
                is_negotiable=True,
                minimum_acceptable=self.NEGOTIABLE_TERMS['commitments']['growth_target']['min'],
                maximum_acceptable=self.NEGOTIABLE_TERMS['commitments']['growth_target']['max'],
                justification="Expected year-over-year growth",
                status="pending"
            ))
        
        terms.append(NegotiationTerm(
            term_id=f"TERM-{secrets.token_hex(4).upper()}",
            term_category="terms",
            term_name="Initial Term (Months)",
            original_value=contract.terms.initial_term_months,
            proposed_value=contract.terms.initial_term_months,
            final_value=None,
            is_negotiable=True,
            minimum_acceptable=self.NEGOTIABLE_TERMS['terms']['initial_term_months']['min'],
            maximum_acceptable=self.NEGOTIABLE_TERMS['terms']['initial_term_months']['max'],
            justification="Standard contract duration",
            status="pending"
        ))
        
        terms.append(NegotiationTerm(
            term_id=f"TERM-{secrets.token_hex(4).upper()}",
            term_category="terms",
            term_name="Notice Period (Days)",
            original_value=contract.terms.notice_period_days,
            proposed_value=contract.terms.notice_period_days,
            final_value=None,
            is_negotiable=True,
            minimum_acceptable=self.NEGOTIABLE_TERMS['terms']['notice_period_days']['min'],
            maximum_acceptable=self.NEGOTIABLE_TERMS['terms']['notice_period_days']['max'],
            justification="Standard notice period",
            status="pending"
        ))
        
        if contract.terms.territories:
            territory = contract.terms.territories[0]
            terms.append(NegotiationTerm(
                term_id=f"TERM-{secrets.token_hex(4).upper()}",
                term_category="territory",
                term_name="Exclusivity",
                original_value=territory.is_exclusive,
                proposed_value=territory.is_exclusive,
                final_value=None,
                is_negotiable=True,
                minimum_acceptable=None,
                maximum_acceptable=None,
                justification="Territory exclusivity status",
                status="pending"
            ))
        
        if contract.terms.mdf:
            mdf = contract.terms.mdf
            terms.append(NegotiationTerm(
                term_id=f"TERM-{secrets.token_hex(4).upper()}",
                term_category="mdf",
                term_name="MDF Allocation",
                original_value=mdf.total_allocation,
                proposed_value=mdf.total_allocation,
                final_value=None,
                is_negotiable=True,
                minimum_acceptable=0,
                maximum_acceptable=mdf.total_allocation * 2,
                justification="Market development fund allocation",
                status="pending"
            ))
        
        if initial_terms:
            for term_data in initial_terms:
                if not any(t.term_name == term_data.get('term_name') for t in terms):
                    terms.append(NegotiationTerm(
                        term_id=f"TERM-{secrets.token_hex(4).upper()}",
                        term_category=term_data.get('category', 'custom'),
                        term_name=term_data.get('term_name', 'Custom Term'),
                        original_value=term_data.get('original_value'),
                        proposed_value=term_data.get('proposed_value'),
                        final_value=None,
                        is_negotiable=term_data.get('is_negotiable', True),
                        minimum_acceptable=term_data.get('minimum'),
                        maximum_acceptable=term_data.get('maximum'),
                        justification=term_data.get('justification', ''),
                        status="pending"
                    ))
        
        return terms
    
    def _determine_approval_chain(
        self,
        contract: DistributorContract,
        terms: List[NegotiationTerm]
    ) -> List[Dict[str, Any]]:
        """Determine required approval chain based on terms"""
        
        approval_chain = []
        
        max_discount = 0
        max_credit = 0
        max_mdf = 0
        
        for term in terms:
            if term.term_name == "Base Discount":
                max_discount = max(max_discount, term.proposed_value or 0)
            elif term.term_name == "Credit Limit":
                max_credit = max(max_credit, term.proposed_value or 0)
            elif term.term_name == "MDF Allocation":
                if contract.terms.mdf:
                    base_revenue = contract.terms.commitments[0].minimum_revenue_commitment if contract.terms.commitments else 100000
                    max_mdf = (term.proposed_value or 0) / base_revenue
        
        for role, thresholds in self.APPROVAL_THRESHOLDS.items():
            needs_approval = False
            reasons = []
            
            if max_discount > thresholds['max_discount']:
                continue
            if max_credit > thresholds['max_credit_limit']:
                continue
            if max_mdf > thresholds['max_mdf_percentage']:
                continue
            
            if max_discount > 0:
                needs_approval = True
                reasons.append(f"Discount: {max_discount*100:.0f}%")
            if max_credit > 0:
                needs_approval = True
                reasons.append(f"Credit: ${max_credit:,.0f}")
            if max_mdf > 0:
                needs_approval = True
                reasons.append(f"MDF: {max_mdf*100:.1f}%")
            
            if needs_approval:
                approval_chain.append({
                    "role": role,
                    "required": True,
                    "reasons": reasons,
                    "status": "pending",
                    "approved_by": None,
                    "approved_at": None
                })
                break
        
        approval_chain.append({
            "role": "legal_review",
            "required": True,
            "reasons": ["Standard legal review"],
            "status": "pending",
            "approved_by": None,
            "approved_at": None
        })
        
        if contract.terms.distributor_tier in [DistributorTier.STRATEGIC, DistributorTier.GLOBAL_ELITE]:
            approval_chain.append({
                "role": "executive_sponsor",
                "required": True,
                "reasons": ["Strategic tier requires executive approval"],
                "status": "pending",
                "approved_by": None,
                "approved_at": None
            })
        
        return approval_chain
    
    def start_negotiation(
        self,
        workflow_id: str
    ) -> NegotiationWorkflow:
        """Start the negotiation process"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        workflow.status = NegotiationStatus.INITIAL_PROPOSAL
        workflow.current_round = 1
        workflow.last_updated = datetime.utcnow().isoformat()
        
        workflow.notes.append({
            "timestamp": workflow.last_updated,
            "author": "system",
            "note": "Negotiation started. Initial proposal sent to distributor."
        })
        
        return workflow
    
    def submit_counter_proposal(
        self,
        workflow_id: str,
        proposed_changes: List[Dict[str, Any]],
        submitter: Dict[str, str],
        justification: str
    ) -> NegotiationWorkflow:
        """
        Submit a counter-proposal
        
        Args:
            workflow_id: Workflow ID
            proposed_changes: List of proposed term changes
            submitter: Submitter information
            justification: Justification for changes
        
        Returns:
            Updated NegotiationWorkflow
        """
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        if workflow.current_round >= workflow.max_rounds:
            raise ValueError(f"Maximum negotiation rounds ({workflow.max_rounds}) reached")
        
        for change in proposed_changes:
            term_id = change.get('term_id')
            new_value = change.get('proposed_value')
            
            for term in workflow.negotiable_terms:
                if term.term_id == term_id:
                    if term.minimum_acceptable is not None and new_value < term.minimum_acceptable:
                        raise ValueError(f"Proposed value for {term.term_name} below minimum")
                    if term.maximum_acceptable is not None and new_value > term.maximum_acceptable:
                        raise ValueError(f"Proposed value for {term.term_name} above maximum")
                    
                    term.counter_proposals.append({
                        "round": workflow.current_round,
                        "proposed_value": new_value,
                        "submitter": submitter,
                        "justification": change.get('justification', justification),
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    term.proposed_value = new_value
                    break
        
        workflow.status = NegotiationStatus.COUNTER_PROPOSAL
        workflow.current_round += 1
        workflow.last_updated = datetime.utcnow().isoformat()
        
        workflow.notes.append({
            "timestamp": workflow.last_updated,
            "author": submitter.get('name', 'Unknown'),
            "note": f"Counter-proposal submitted (Round {workflow.current_round}): {justification}"
        })
        
        workflow.approval_chain = self._determine_approval_chain_from_workflow(workflow)
        
        return workflow
    
    def _determine_approval_chain_from_workflow(
        self,
        workflow: NegotiationWorkflow
    ) -> List[Dict[str, Any]]:
        """Recalculate approval chain based on current proposed values"""
        
        max_discount = 0
        max_credit = 0
        max_mdf = 0
        
        for term in workflow.negotiable_terms:
            if term.term_name == "Base Discount":
                max_discount = max(max_discount, term.proposed_value or 0)
            elif term.term_name == "Credit Limit":
                max_credit = max(max_credit, term.proposed_value or 0)
        
        approval_chain = []
        
        for role, thresholds in self.APPROVAL_THRESHOLDS.items():
            if max_discount <= thresholds['max_discount'] and max_credit <= thresholds['max_credit_limit']:
                approval_chain.append({
                    "role": role,
                    "required": True,
                    "reasons": [f"Discount: {max_discount*100:.0f}%", f"Credit: ${max_credit:,.0f}"],
                    "status": "pending",
                    "approved_by": None,
                    "approved_at": None
                })
                break
        
        approval_chain.append({
            "role": "legal_review",
            "required": True,
            "reasons": ["Standard legal review"],
            "status": "pending",
            "approved_by": None,
            "approved_at": None
        })
        
        return approval_chain
    
    def create_negotiation_session(
        self,
        workflow_id: str,
        session_date: str,
        participants: List[Dict[str, str]],
        agenda_items: List[str]
    ) -> NegotiationSession:
        """
        Create a negotiation session record
        
        Args:
            workflow_id: Workflow ID
            session_date: Date of session
            participants: List of participants
            agenda_items: Session agenda
        
        Returns:
            NegotiationSession instance
        """
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        self._session_counter += 1
        
        session = NegotiationSession(
            session_id=f"SES-{secrets.token_hex(4).upper()}",
            contract_id=workflow.contract_id,
            session_date=session_date,
            participants=participants,
            agenda_items=agenda_items,
            terms_discussed=[],
            decisions_made=[],
            action_items=[],
            next_steps=[],
            session_notes=""
        )
        
        workflow.sessions.append(session)
        workflow.last_updated = datetime.utcnow().isoformat()
        
        return session
    
    def record_session_outcome(
        self,
        workflow_id: str,
        session_id: str,
        terms_discussed: List[str],
        decisions_made: List[Dict[str, Any]],
        action_items: List[Dict[str, Any]],
        next_steps: List[str],
        session_notes: str
    ) -> NegotiationSession:
        """Record the outcome of a negotiation session"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        session = None
        for s in workflow.sessions:
            if s.session_id == session_id:
                session = s
                break
        
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.terms_discussed = terms_discussed
        session.decisions_made = decisions_made
        session.action_items = action_items
        session.next_steps = next_steps
        session.session_notes = session_notes
        
        workflow.last_updated = datetime.utcnow().isoformat()
        
        return session
    
    def submit_for_approval(
        self,
        workflow_id: str,
        submitter: Dict[str, str]
    ) -> NegotiationWorkflow:
        """Submit negotiation for approval"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        all_terms_agreed = all(
            term.status in ['agreed', 'accepted'] or term.proposed_value == term.original_value
            for term in workflow.negotiable_terms
        )
        
        if not all_terms_agreed:
            for term in workflow.negotiable_terms:
                if term.status == 'pending':
                    term.status = 'proposed'
        
        workflow.status = NegotiationStatus.UNDER_REVIEW
        workflow.last_updated = datetime.utcnow().isoformat()
        
        workflow.notes.append({
            "timestamp": workflow.last_updated,
            "author": submitter.get('name', 'Unknown'),
            "note": "Negotiation submitted for approval review."
        })
        
        return workflow
    
    def approve_term(
        self,
        workflow_id: str,
        term_id: str,
        approver: Dict[str, str],
        comments: str = ""
    ) -> NegotiationTerm:
        """Approve a specific negotiation term"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        term = None
        for t in workflow.negotiable_terms:
            if t.term_id == term_id:
                term = t
                break
        
        if not term:
            raise ValueError(f"Term {term_id} not found")
        
        term.final_value = term.proposed_value
        term.status = 'approved'
        term.counter_proposals.append({
            "round": workflow.current_round,
            "action": "approved",
            "approver": approver,
            "comments": comments,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        workflow.last_updated = datetime.utcnow().isoformat()
        
        return term
    
    def reject_term(
        self,
        workflow_id: str,
        term_id: str,
        rejector: Dict[str, str],
        reason: str
    ) -> NegotiationTerm:
        """Reject a specific negotiation term"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        term = None
        for t in workflow.negotiable_terms:
            if t.term_id == term_id:
                term = t
                break
        
        if not term:
            raise ValueError(f"Term {term_id} not found")
        
        term.status = 'rejected'
        term.counter_proposals.append({
            "round": workflow.current_round,
            "action": "rejected",
            "rejector": rejector,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        workflow.last_updated = datetime.utcnow().isoformat()
        
        return term
    
    def process_approval(
        self,
        workflow_id: str,
        approver_role: str,
        approver: Dict[str, str],
        approved: bool,
        comments: str = ""
    ) -> NegotiationWorkflow:
        """Process an approval in the approval chain"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        for approval in workflow.approval_chain:
            if approval['role'] == approver_role and approval['status'] == 'pending':
                approval['status'] = 'approved' if approved else 'rejected'
                approval['approved_by'] = approver
                approval['approved_at'] = datetime.utcnow().isoformat()
                approval['comments'] = comments
                break
        
        all_approved = all(
            a['status'] == 'approved' for a in workflow.approval_chain if a['required']
        )
        any_rejected = any(
            a['status'] == 'rejected' for a in workflow.approval_chain
        )
        
        if any_rejected:
            workflow.status = NegotiationStatus.REJECTED
        elif all_approved:
            workflow.status = NegotiationStatus.ACCEPTED
            for term in workflow.negotiable_terms:
                if term.status != 'rejected':
                    term.final_value = term.proposed_value
                    term.status = 'approved'
        
        workflow.last_updated = datetime.utcnow().isoformat()
        
        workflow.notes.append({
            "timestamp": workflow.last_updated,
            "author": approver.get('name', 'Unknown'),
            "note": f"Approval {'granted' if approved else 'denied'} by {approver_role}: {comments}"
        })
        
        return workflow
    
    def finalize_negotiation(
        self,
        workflow_id: str,
        finalizer: Dict[str, str]
    ) -> NegotiationWorkflow:
        """Finalize the negotiation and prepare for contract execution"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        if workflow.status != NegotiationStatus.ACCEPTED:
            raise ValueError("Cannot finalize negotiation that is not accepted")
        
        workflow.status = NegotiationStatus.FINAL_TERMS
        workflow.last_updated = datetime.utcnow().isoformat()
        
        for term in workflow.negotiable_terms:
            if term.final_value is None:
                term.final_value = term.proposed_value
        
        workflow.notes.append({
            "timestamp": workflow.last_updated,
            "author": finalizer.get('name', 'Unknown'),
            "note": "Negotiation finalized. Contract ready for execution."
        })
        
        return workflow
    
    def withdraw_negotiation(
        self,
        workflow_id: str,
        withdrawer: Dict[str, str],
        reason: str
    ) -> NegotiationWorkflow:
        """Withdraw from negotiation"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        workflow.status = NegotiationStatus.WITHDRAWN
        workflow.last_updated = datetime.utcnow().isoformat()
        
        workflow.notes.append({
            "timestamp": workflow.last_updated,
            "author": withdrawer.get('name', 'Unknown'),
            "note": f"Negotiation withdrawn: {reason}"
        })
        
        return workflow
    
    def get_workflow(self, workflow_id: str) -> Optional[NegotiationWorkflow]:
        """Get workflow by ID"""
        return self._workflows.get(workflow_id)
    
    def get_workflow_summary(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow summary"""
        
        if workflow_id not in self._workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self._workflows[workflow_id]
        
        terms_summary = {
            'total': len(workflow.negotiable_terms),
            'approved': sum(1 for t in workflow.negotiable_terms if t.status == 'approved'),
            'rejected': sum(1 for t in workflow.negotiable_terms if t.status == 'rejected'),
            'pending': sum(1 for t in workflow.negotiable_terms if t.status == 'pending')
        }
        
        approvals_summary = {
            'total': len(workflow.approval_chain),
            'approved': sum(1 for a in workflow.approval_chain if a['status'] == 'approved'),
            'rejected': sum(1 for a in workflow.approval_chain if a['status'] == 'rejected'),
            'pending': sum(1 for a in workflow.approval_chain if a['status'] == 'pending')
        }
        
        return {
            'workflow_id': workflow.workflow_id,
            'contract_id': workflow.contract_id,
            'status': workflow.status.value,
            'current_round': workflow.current_round,
            'max_rounds': workflow.max_rounds,
            'terms_summary': terms_summary,
            'approvals_summary': approvals_summary,
            'sessions_count': len(workflow.sessions),
            'started_at': workflow.started_at,
            'last_updated': workflow.last_updated,
            'deadlines': workflow.deadlines
        }
    
    def list_workflows(
        self,
        status: NegotiationStatus = None,
        contract_id: str = None
    ) -> List[NegotiationWorkflow]:
        """List workflows with optional filters"""
        
        workflows = list(self._workflows.values())
        
        if status:
            workflows = [w for w in workflows if w.status == status]
        
        if contract_id:
            workflows = [w for w in workflows if w.contract_id == contract_id]
        
        return workflows
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'active_workflows': len(self._workflows),
            'total_sessions': self._session_counter,
            'negotiable_term_categories': len(self.NEGOTIABLE_TERMS),
            'approval_levels': len(self.APPROVAL_THRESHOLDS)
        }

"""
Sales Engine
Core sales pipeline management engine.
"""

import uuid
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from .sales_schema import (
    SalesLead,
    SalesInteraction,
    SalesPipelineSummary,
    DemoAccessRequest,
    FollowUpTask,
    LeadSource,
    LeadCategory,
    LeadPriority,
    InteractionType,
)
from .sales_storage import SalesStorage
from .sales_automation import SalesAutomation
from .sales_stages import PIPELINE_STAGES, get_stage_info, get_next_stage


class SalesEngine:
    """
    Core sales pipeline management engine.
    
    Provides complete CRUD operations, AI-driven insights,
    and pipeline analytics.
    """
    
    def __init__(self, storage_dir: str = "/tmp/ghostquant_sales"):
        """
        Initialize sales engine.
        
        Args:
            storage_dir: Directory for data storage
        """
        self.storage = SalesStorage(storage_dir)
        self.automation = SalesAutomation()
    
    def create_lead(
        self,
        name: str,
        organization: str,
        email: str,
        phone: Optional[str],
        title: Optional[str],
        source: LeadSource,
        category: LeadCategory,
        use_case: str,
        requirements: Optional[str] = None,
        estimated_value: Optional[float] = None,
    ) -> SalesLead:
        """
        Create a new sales lead.
        
        Args:
            name: Contact name
            organization: Organization name
            email: Contact email
            phone: Contact phone
            title: Contact title
            source: Lead source
            category: Lead category
            use_case: Use case description
            requirements: Additional requirements
            estimated_value: Estimated deal value
        
        Returns:
            SalesLead: Created lead
        """
        lead_id = f"lead_{uuid.uuid4().hex[:12]}"
        
        lead = SalesLead(
            lead_id=lead_id,
            name=name,
            organization=organization,
            email=email,
            phone=phone,
            title=title,
            source=source,
            category=category,
            use_case=use_case,
            requirements=requirements,
            estimated_value=estimated_value,
            current_stage="new_lead",
        )
        
        lead.lead_score = self.automation.score_lead(lead)
        lead.close_probability = self.automation.calculate_close_probability(lead)
        lead.priority = self.automation.prioritize_lead(lead)
        lead.industry = self.automation.classify_industry(lead)
        
        next_action, next_date = self.automation.generate_next_action(lead)
        lead.next_action = next_action
        lead.next_action_date = next_date
        
        lead = self.storage.create_lead(lead)
        
        tasks = self.automation.generate_follow_up_tasks(lead)
        for task in tasks:
            self.storage.create_task(task)
        
        interaction = SalesInteraction(
            interaction_id=f"int_{uuid.uuid4().hex[:12]}",
            lead_id=lead_id,
            interaction_type=InteractionType.NOTE,
            subject="Lead Created",
            notes=f"New lead created from {source.value} source",
        )
        self.storage.create_interaction(interaction)
        
        return lead
    
    def update_lead_stage(
        self,
        lead_id: str,
        new_stage: str,
        notes: Optional[str] = None,
    ) -> SalesLead:
        """
        Update lead stage in pipeline.
        
        Args:
            lead_id: Lead ID
            new_stage: New stage ID
            notes: Optional notes about stage change
        
        Returns:
            SalesLead: Updated lead
        
        Raises:
            ValueError: If lead not found or invalid stage
        """
        lead = self.storage.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")
        
        if new_stage not in PIPELINE_STAGES:
            raise ValueError(f"Invalid stage: {new_stage}")
        
        stage_change = {
            "from_stage": lead.current_stage,
            "to_stage": new_stage,
            "timestamp": datetime.utcnow().isoformat(),
            "notes": notes,
        }
        lead.stage_history.append(stage_change)
        
        lead.current_stage = new_stage
        
        lead.close_probability = self.automation.calculate_close_probability(lead)
        
        next_action, next_date = self.automation.generate_next_action(lead)
        lead.next_action = next_action
        lead.next_action_date = next_date
        
        lead = self.storage.update_lead(lead)
        
        interaction = SalesInteraction(
            interaction_id=f"int_{uuid.uuid4().hex[:12]}",
            lead_id=lead_id,
            interaction_type=InteractionType.NOTE,
            subject=f"Stage Updated: {PIPELINE_STAGES[new_stage].stage_name}",
            notes=notes or f"Lead moved to {PIPELINE_STAGES[new_stage].stage_name}",
        )
        self.storage.create_interaction(interaction)
        
        tasks = self.automation.generate_follow_up_tasks(lead)
        for task in tasks:
            self.storage.create_task(task)
        
        return lead
    
    def record_interaction(
        self,
        lead_id: str,
        interaction_type: InteractionType,
        subject: str,
        notes: str,
        rep_name: Optional[str] = None,
        outcome: Optional[str] = None,
        next_steps: Optional[str] = None,
    ) -> SalesInteraction:
        """
        Record an interaction with a lead.
        
        Args:
            lead_id: Lead ID
            interaction_type: Type of interaction
            subject: Interaction subject
            notes: Interaction notes
            rep_name: Sales rep name
            outcome: Interaction outcome
            next_steps: Next steps
        
        Returns:
            SalesInteraction: Created interaction
        
        Raises:
            ValueError: If lead not found
        """
        lead = self.storage.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")
        
        interaction = SalesInteraction(
            interaction_id=f"int_{uuid.uuid4().hex[:12]}",
            lead_id=lead_id,
            interaction_type=interaction_type,
            subject=subject,
            notes=notes,
            rep_name=rep_name,
            outcome=outcome,
            next_steps=next_steps,
        )
        
        interaction = self.storage.create_interaction(interaction)
        
        lead.last_interaction_date = datetime.utcnow()
        self.storage.update_lead(lead)
        
        return interaction
    
    def list_leads(
        self,
        category: Optional[LeadCategory] = None,
        priority: Optional[LeadPriority] = None,
        stage: Optional[str] = None,
        assigned_rep: Optional[str] = None,
    ) -> List[SalesLead]:
        """
        List leads with optional filters.
        
        Args:
            category: Filter by category
            priority: Filter by priority
            stage: Filter by stage
            assigned_rep: Filter by assigned rep
        
        Returns:
            List[SalesLead]: Filtered leads
        """
        filters = {}
        if category:
            filters["category"] = category
        if priority:
            filters["priority"] = priority
        if stage:
            filters["current_stage"] = stage
        if assigned_rep:
            filters["assigned_rep"] = assigned_rep
        
        leads = self.storage.list_leads(filters)
        
        leads = self.automation.rank_leads_by_priority(leads)
        
        return leads
    
    def ingest_demo_request(self, request: DemoAccessRequest) -> SalesLead:
        """
        Ingest a demo access request and convert to lead.
        
        Args:
            request: Demo access request
        
        Returns:
            SalesLead: Created lead
        """
        lead = self.create_lead(
            name=request.name,
            organization=request.organization,
            email=request.email,
            phone=request.phone,
            title=None,
            source=LeadSource.DEMO,
            category=LeadCategory.ENTERPRISE,  # Default, will be auto-classified
            use_case=request.use_case,
            requirements=request.questions,
            estimated_value=None,
        )
        
        request.converted_to_lead = True
        request.lead_id = lead.lead_id
        self.storage.create_demo_request(request)
        
        return lead
    
    def assign_internal_rep(self, lead_id: str, rep_name: str) -> SalesLead:
        """
        Assign a sales rep to a lead.
        
        Args:
            lead_id: Lead ID
            rep_name: Sales rep name
        
        Returns:
            SalesLead: Updated lead
        
        Raises:
            ValueError: If lead not found
        """
        lead = self.storage.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")
        
        lead.assigned_rep = rep_name
        lead = self.storage.update_lead(lead)
        
        interaction = SalesInteraction(
            interaction_id=f"int_{uuid.uuid4().hex[:12]}",
            lead_id=lead_id,
            interaction_type=InteractionType.NOTE,
            subject="Sales Rep Assigned",
            notes=f"Lead assigned to {rep_name}",
        )
        self.storage.create_interaction(interaction)
        
        return lead
    
    def generate_pipeline_summary(self) -> SalesPipelineSummary:
        """
        Generate comprehensive pipeline summary.
        
        Returns:
            SalesPipelineSummary: Pipeline summary
        """
        all_leads = self.storage.list_leads()
        
        leads_by_stage = {}
        for stage_id in PIPELINE_STAGES.keys():
            leads_by_stage[stage_id] = len([l for l in all_leads if l.current_stage == stage_id])
        
        leads_by_category = {}
        for category in LeadCategory:
            leads_by_category[category.value] = len([l for l in all_leads if l.category == category])
        
        leads_by_priority = {}
        for priority in LeadPriority:
            leads_by_priority[priority.value] = len([l for l in all_leads if l.priority == priority])
        
        total_value = sum(l.estimated_value or 0 for l in all_leads if l.current_stage != "closed")
        weighted_value = sum((l.estimated_value or 0) * l.close_probability for l in all_leads if l.current_stage != "closed")
        
        active_leads = [l for l in all_leads if l.current_stage != "closed"]
        average_deal = total_value / len(active_leads) if active_leads else 0
        
        conversion_rates = {}
        for stage_id, stage in PIPELINE_STAGES.items():
            stage_leads = [l for l in all_leads if l.current_stage == stage_id]
            if stage_leads:
                avg_prob = sum(l.close_probability for l in stage_leads) / len(stage_leads)
                conversion_rates[stage_id] = avg_prob
        
        closed_leads = [l for l in all_leads if l.current_stage == "closed"]
        if closed_leads:
            cycle_times = [(l.updated_at - l.created_at).days for l in closed_leads]
            avg_cycle_time = sum(cycle_times) / len(cycle_times)
        else:
            avg_cycle_time = 0
        
        top_leads = sorted(all_leads, key=lambda l: l.lead_score, reverse=True)[:5]
        top_leads_data = [
            {
                "lead_id": l.lead_id,
                "name": l.name,
                "organization": l.organization,
                "score": l.lead_score,
                "probability": l.close_probability,
                "value": l.estimated_value,
            }
            for l in top_leads
        ]
        
        recent_wins = [l for l in closed_leads if "won" in l.metadata.get("outcome", "").lower()][-5:]
        recent_wins_data = [
            {
                "lead_id": l.lead_id,
                "name": l.name,
                "organization": l.organization,
                "value": l.estimated_value,
                "closed_date": l.updated_at.isoformat(),
            }
            for l in recent_wins
        ]
        
        at_risk = [
            l for l in active_leads
            if (datetime.utcnow() - (l.last_interaction_date or l.created_at)).days > 14
        ][:5]
        at_risk_data = [
            {
                "lead_id": l.lead_id,
                "name": l.name,
                "organization": l.organization,
                "days_since_contact": (datetime.utcnow() - (l.last_interaction_date or l.created_at)).days,
            }
            for l in at_risk
        ]
        
        return SalesPipelineSummary(
            total_leads=len(all_leads),
            leads_by_stage=leads_by_stage,
            leads_by_category=leads_by_category,
            leads_by_priority=leads_by_priority,
            total_pipeline_value=total_value,
            weighted_pipeline_value=weighted_value,
            average_deal_size=average_deal,
            conversion_rates=conversion_rates,
            average_cycle_time_days=avg_cycle_time,
            top_leads=top_leads_data,
            recent_wins=recent_wins_data,
            at_risk_leads=at_risk_data,
        )
    
    def generate_investor_view(self) -> Dict:
        """
        Generate investor-friendly pipeline view.
        
        Returns:
            Dict: Investor metrics
        """
        summary = self.generate_pipeline_summary()
        all_leads = self.storage.list_leads()
        
        active_leads = [l for l in all_leads if l.current_stage != "closed"]
        qualified_leads = [l for l in active_leads if l.current_stage not in ["new_lead", "qualification"]]
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "pipeline_health": {
                "total_active_leads": len(active_leads),
                "qualified_leads": len(qualified_leads),
                "total_pipeline_value": summary.total_pipeline_value,
                "weighted_pipeline_value": summary.weighted_pipeline_value,
                "average_deal_size": summary.average_deal_size,
            },
            "conversion_metrics": {
                "average_close_probability": sum(l.close_probability for l in active_leads) / len(active_leads) if active_leads else 0,
                "average_cycle_time_days": summary.average_cycle_time_days,
                "conversion_rates_by_stage": summary.conversion_rates,
            },
            "lead_quality": {
                "high_priority_leads": summary.leads_by_priority.get("high", 0) + summary.leads_by_priority.get("critical", 0),
                "government_leads": summary.leads_by_category.get("government", 0),
                "exchange_leads": summary.leads_by_category.get("exchange", 0),
                "enterprise_leads": summary.leads_by_category.get("enterprise", 0),
            },
            "top_opportunities": summary.top_leads,
            "recent_wins": summary.recent_wins,
        }
    
    def generate_lead_history(self, lead_id: str) -> Dict:
        """
        Generate complete history for a lead.
        
        Args:
            lead_id: Lead ID
        
        Returns:
            Dict: Lead history
        
        Raises:
            ValueError: If lead not found
        """
        lead = self.storage.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")
        
        interactions = self.storage.get_interactions(lead_id)
        tasks = self.storage.get_tasks(lead_id)
        insights = self.automation.generate_ai_insights(lead)
        
        return {
            "lead": lead.dict(),
            "interactions": [i.dict() for i in interactions],
            "tasks": [t.dict() for t in tasks],
            "ai_insights": insights,
            "stage_history": lead.stage_history,
        }
    
    def compute_probability(self, lead_id: str) -> float:
        """
        Compute close probability for a lead.
        
        Args:
            lead_id: Lead ID
        
        Returns:
            float: Close probability
        
        Raises:
            ValueError: If lead not found
        """
        lead = self.storage.get_lead(lead_id)
        if not lead:
            raise ValueError(f"Lead not found: {lead_id}")
        
        return self.automation.calculate_close_probability(lead)
    
    def purge_old_leads(self, days: int = 365) -> int:
        """
        Purge leads older than specified days.
        
        Args:
            days: Age threshold in days
        
        Returns:
            int: Number of leads purged
        """
        all_leads = self.storage.list_leads()
        threshold = datetime.utcnow() - timedelta(days=days)
        
        purged = 0
        for lead in all_leads:
            if lead.created_at < threshold and lead.current_stage == "closed":
                self.storage.delete_lead(lead.lead_id)
                purged += 1
        
        return purged
    
    def get_health(self) -> Dict:
        """
        Get sales engine health status.
        
        Returns:
            Dict: Health status
        """
        stats = self.storage.get_stats()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "storage": stats,
            "pipeline_stages": len(PIPELINE_STAGES),
        }

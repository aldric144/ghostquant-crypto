"""
Sales Automation
AI-based lead scoring, categorization, and automation.
"""

import random
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from .sales_schema import SalesLead, LeadPriority, LeadCategory, FollowUpTask


class SalesAutomation:
    """
    Sales automation engine with AI-based scoring and categorization.
    """
    
    def __init__(self):
        """Initialize automation engine."""
        self.industry_keywords = {
            "finance": ["bank", "financial", "trading", "investment", "hedge fund"],
            "government": ["government", "federal", "state", "agency", "law enforcement"],
            "exchange": ["exchange", "trading platform", "crypto exchange", "dex"],
            "compliance": ["compliance", "regulatory", "audit", "kyc", "aml"],
            "research": ["research", "university", "academic", "analyst"],
        }
    
    def score_lead(self, lead: SalesLead) -> float:
        """
        Calculate lead score (0-1) based on multiple factors.
        
        Factors:
        - Category (government/exchange = higher)
        - Organization size indicators
        - Use case complexity
        - Budget indicators
        - Timeline urgency
        - Engagement level
        
        Args:
            lead: Sales lead to score
        
        Returns:
            float: Lead score between 0 and 1
        """
        score = 0.0
        
        category_scores = {
            LeadCategory.GOVERNMENT: 0.30,
            LeadCategory.EXCHANGE: 0.28,
            LeadCategory.ENTERPRISE: 0.25,
            LeadCategory.VENTURE_CAPITAL: 0.22,
            LeadCategory.COMPLIANCE: 0.20,
            LeadCategory.RESEARCH: 0.15,
        }
        score += category_scores.get(lead.category, 0.15)
        
        use_case_lower = lead.use_case.lower()
        complexity_keywords = ["enterprise", "government", "compliance", "real-time", "integration"]
        complexity_score = sum(0.04 for kw in complexity_keywords if kw in use_case_lower)
        score += min(complexity_score, 0.2)
        
        org_lower = lead.organization.lower()
        high_value_indicators = ["government", "federal", "exchange", "bank", "enterprise"]
        org_score = sum(0.05 for ind in high_value_indicators if ind in org_lower)
        score += min(org_score, 0.2)
        
        if lead.budget_range:
            budget_lower = lead.budget_range.lower()
            if "100k" in budget_lower or "million" in budget_lower:
                score += 0.15
            elif "50k" in budget_lower:
                score += 0.10
            elif "10k" in budget_lower:
                score += 0.05
        
        if lead.timeline:
            timeline_lower = lead.timeline.lower()
            if "immediate" in timeline_lower or "urgent" in timeline_lower:
                score += 0.10
            elif "month" in timeline_lower:
                score += 0.07
            elif "quarter" in timeline_lower:
                score += 0.05
        
        if lead.last_interaction_date:
            days_since = (datetime.utcnow() - lead.last_interaction_date).days
            if days_since < 7:
                score += 0.05
            elif days_since < 14:
                score += 0.03
        
        return min(score, 1.0)
    
    def calculate_close_probability(self, lead: SalesLead) -> float:
        """
        Calculate probability of closing the deal (0-1).
        
        Based on:
        - Current stage
        - Lead score
        - Time in pipeline
        - Engagement frequency
        
        Args:
            lead: Sales lead
        
        Returns:
            float: Close probability between 0 and 1
        """
        stage_probabilities = {
            "new_lead": 0.10,
            "qualification": 0.20,
            "needs_analysis": 0.35,
            "technical_review": 0.50,
            "proof_of_concept": 0.65,
            "pricing_negotiation": 0.75,
            "legal_compliance": 0.85,
            "closed": 1.0,
        }
        base_prob = stage_probabilities.get(lead.current_stage, 0.10)
        
        score_adjustment = (lead.lead_score - 0.5) * 0.2
        
        days_in_pipeline = (datetime.utcnow() - lead.created_at).days
        if days_in_pipeline > 90:
            time_adjustment = -0.15
        elif days_in_pipeline > 60:
            time_adjustment = -0.10
        elif days_in_pipeline > 30:
            time_adjustment = -0.05
        else:
            time_adjustment = 0.0
        
        engagement_adjustment = 0.0
        if lead.last_interaction_date:
            days_since = (datetime.utcnow() - lead.last_interaction_date).days
            if days_since < 7:
                engagement_adjustment = 0.10
            elif days_since < 14:
                engagement_adjustment = 0.05
            elif days_since > 30:
                engagement_adjustment = -0.10
        
        probability = base_prob + score_adjustment + time_adjustment + engagement_adjustment
        return max(0.0, min(1.0, probability))
    
    def prioritize_lead(self, lead: SalesLead) -> LeadPriority:
        """
        Automatically prioritize lead based on score and other factors.
        
        Args:
            lead: Sales lead
        
        Returns:
            LeadPriority: Recommended priority level
        """
        score = lead.lead_score
        
        if lead.category in [LeadCategory.GOVERNMENT, LeadCategory.EXCHANGE]:
            score += 0.1
        
        if lead.estimated_value and lead.estimated_value > 100000:
            score += 0.1
        
        if lead.timeline and "immediate" in lead.timeline.lower():
            score += 0.1
        
        if score >= 0.75:
            return LeadPriority.CRITICAL
        elif score >= 0.60:
            return LeadPriority.HIGH
        elif score >= 0.40:
            return LeadPriority.MEDIUM
        else:
            return LeadPriority.LOW
    
    def classify_industry(self, lead: SalesLead) -> str:
        """
        Classify lead industry based on organization and use case.
        
        Args:
            lead: Sales lead
        
        Returns:
            str: Industry classification
        """
        text = f"{lead.organization} {lead.use_case}".lower()
        
        for industry, keywords in self.industry_keywords.items():
            if any(kw in text for kw in keywords):
                return industry
        
        return "other"
    
    def generate_next_action(self, lead: SalesLead) -> Tuple[str, datetime]:
        """
        Generate recommended next action and date.
        
        Args:
            lead: Sales lead
        
        Returns:
            Tuple[str, datetime]: Next action description and due date
        """
        stage_actions = {
            "new_lead": ("Schedule initial qualification call", 2),
            "qualification": ("Conduct needs assessment meeting", 5),
            "needs_analysis": ("Prepare technical demo", 7),
            "technical_review": ("Schedule POC kickoff", 10),
            "proof_of_concept": ("Review POC results and gather feedback", 14),
            "pricing_negotiation": ("Send final pricing proposal", 3),
            "legal_compliance": ("Follow up on contract review", 5),
            "closed": ("Schedule onboarding or conduct post-mortem", 1),
        }
        
        action, days = stage_actions.get(lead.current_stage, ("Follow up with lead", 7))
        due_date = datetime.utcnow() + timedelta(days=days)
        
        return action, due_date
    
    def generate_follow_up_tasks(self, lead: SalesLead) -> List[FollowUpTask]:
        """
        Generate automated follow-up tasks for a lead.
        
        Args:
            lead: Sales lead
        
        Returns:
            List[FollowUpTask]: Generated tasks
        """
        tasks = []
        
        action, due_date = self.generate_next_action(lead)
        
        task = FollowUpTask(
            task_id=f"task_{lead.lead_id}_{datetime.utcnow().timestamp()}",
            lead_id=lead.lead_id,
            due_date=due_date,
            task_type="follow_up",
            description=action,
            priority=lead.priority,
            assigned_to=lead.assigned_rep,
        )
        tasks.append(task)
        
        if lead.priority in [LeadPriority.CRITICAL, LeadPriority.HIGH]:
            reminder_task = FollowUpTask(
                task_id=f"task_{lead.lead_id}_reminder_{datetime.utcnow().timestamp()}",
                lead_id=lead.lead_id,
                due_date=due_date - timedelta(days=1),
                task_type="reminder",
                description=f"Reminder: {action}",
                priority=lead.priority,
                assigned_to=lead.assigned_rep,
            )
            tasks.append(reminder_task)
        
        return tasks
    
    def generate_ai_insights(self, lead: SalesLead) -> Dict[str, str]:
        """
        Generate AI-driven insights about the lead.
        
        Args:
            lead: Sales lead
        
        Returns:
            Dict[str, str]: AI insights
        """
        insights = {}
        
        if lead.lead_score >= 0.7:
            insights["opportunity"] = "High-value opportunity with strong fit for GhostQuant capabilities."
        elif lead.lead_score >= 0.5:
            insights["opportunity"] = "Solid opportunity with good potential for conversion."
        else:
            insights["opportunity"] = "Moderate opportunity requiring careful qualification."
        
        days_in_pipeline = (datetime.utcnow() - lead.created_at).days
        if days_in_pipeline > 60:
            insights["risk"] = "Deal velocity is slow. Consider accelerating timeline or re-qualifying."
        elif lead.last_interaction_date:
            days_since = (datetime.utcnow() - lead.last_interaction_date).days
            if days_since > 14:
                insights["risk"] = "Low engagement. Schedule follow-up immediately to maintain momentum."
        else:
            insights["risk"] = "No significant risks identified. Maintain regular cadence."
        
        if lead.category == LeadCategory.GOVERNMENT:
            insights["strategy"] = "Focus on compliance, security, and government-specific use cases. Emphasize CJIS/FedRAMP certifications."
        elif lead.category == LeadCategory.EXCHANGE:
            insights["strategy"] = "Highlight real-time threat detection and market manipulation prevention capabilities."
        else:
            insights["strategy"] = "Emphasize ROI, ease of integration, and comprehensive threat intelligence coverage."
        
        return insights
    
    def rank_leads_by_priority(self, leads: List[SalesLead]) -> List[SalesLead]:
        """
        Rank leads by priority score.
        
        Args:
            leads: List of leads to rank
        
        Returns:
            List[SalesLead]: Ranked leads (highest priority first)
        """
        def priority_score(lead: SalesLead) -> float:
            score = lead.lead_score
            
            priority_multipliers = {
                LeadPriority.CRITICAL: 1.5,
                LeadPriority.HIGH: 1.2,
                LeadPriority.MEDIUM: 1.0,
                LeadPriority.LOW: 0.8,
            }
            score *= priority_multipliers.get(lead.priority, 1.0)
            
            score += lead.close_probability * 0.3
            
            if lead.last_interaction_date:
                days_since = (datetime.utcnow() - lead.last_interaction_date).days
                if days_since < 7:
                    score += 0.2
            
            return score
        
        return sorted(leads, key=priority_score, reverse=True)

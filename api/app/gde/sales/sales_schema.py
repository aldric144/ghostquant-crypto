"""
Sales Schema Definitions
Data structures for enterprise sales pipeline.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class LeadSource(str, Enum):
    """Lead source types."""
    DEMO = "demo"
    WEBSITE = "website"
    REFERRAL = "referral"
    CONFERENCE = "conference"
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    PARTNER = "partner"


class LeadCategory(str, Enum):
    """Lead category types."""
    GOVERNMENT = "government"
    EXCHANGE = "exchange"
    ENTERPRISE = "enterprise"
    VENTURE_CAPITAL = "venture_capital"
    COMPLIANCE = "compliance"
    RESEARCH = "research"


class LeadPriority(str, Enum):
    """Lead priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class InteractionType(str, Enum):
    """Interaction types."""
    EMAIL = "email"
    CALL = "call"
    MEETING = "meeting"
    DEMO = "demo"
    PROPOSAL = "proposal"
    CONTRACT = "contract"
    NOTE = "note"


class SalesStage(BaseModel):
    """Sales pipeline stage."""
    stage_id: str
    stage_name: str
    stage_order: int
    description: str
    typical_duration_days: int
    success_rate: float
    required_actions: List[str]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SalesLead(BaseModel):
    """Sales lead in the pipeline."""
    lead_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    name: str
    organization: str
    email: EmailStr
    phone: Optional[str] = None
    title: Optional[str] = None
    
    source: LeadSource
    category: LeadCategory
    priority: LeadPriority = LeadPriority.MEDIUM
    
    current_stage: str = "new_lead"
    stage_history: List[Dict[str, Any]] = Field(default_factory=list)
    
    lead_score: float = 0.0  # 0-1
    close_probability: float = 0.0  # 0-1
    estimated_value: Optional[float] = None
    
    use_case: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    
    requirements: Optional[str] = None
    pain_points: Optional[str] = None
    decision_makers: List[str] = Field(default_factory=list)
    competitors: List[str] = Field(default_factory=list)
    
    assigned_rep: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    last_interaction_date: Optional[datetime] = None
    
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SalesInteraction(BaseModel):
    """Sales interaction record."""
    interaction_id: str
    lead_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    interaction_type: InteractionType
    subject: str
    notes: str
    
    rep_name: Optional[str] = None
    outcome: Optional[str] = None
    next_steps: Optional[str] = None
    
    attachments: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class FollowUpTask(BaseModel):
    """Follow-up task for a lead."""
    task_id: str
    lead_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: datetime
    
    task_type: str
    description: str
    priority: LeadPriority
    
    assigned_to: Optional[str] = None
    completed: bool = False
    completed_at: Optional[datetime] = None
    
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SalesPipelineSummary(BaseModel):
    """Summary of sales pipeline."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    total_leads: int
    leads_by_stage: Dict[str, int]
    leads_by_category: Dict[str, int]
    leads_by_priority: Dict[str, int]
    
    total_pipeline_value: float
    weighted_pipeline_value: float
    average_deal_size: float
    
    conversion_rates: Dict[str, float]
    average_cycle_time_days: float
    
    top_leads: List[Dict[str, Any]]
    recent_wins: List[Dict[str, Any]]
    at_risk_leads: List[Dict[str, Any]]
    
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DemoAccessRequest(BaseModel):
    """Demo access request from /demo page."""
    request_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    name: str
    organization: str
    email: EmailStr
    phone: Optional[str] = None
    use_case: str
    questions: Optional[str] = None
    
    converted_to_lead: bool = False
    lead_id: Optional[str] = None
    
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LeadCreateRequest(BaseModel):
    """Request to create a new lead."""
    name: str
    organization: str
    email: EmailStr
    phone: Optional[str] = None
    title: Optional[str] = None
    source: LeadSource
    category: LeadCategory
    use_case: str
    requirements: Optional[str] = None
    estimated_value: Optional[float] = None


class LeadUpdateRequest(BaseModel):
    """Request to update a lead."""
    priority: Optional[LeadPriority] = None
    assigned_rep: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    requirements: Optional[str] = None
    pain_points: Optional[str] = None
    estimated_value: Optional[float] = None
    tags: Optional[List[str]] = None


class StageUpdateRequest(BaseModel):
    """Request to update lead stage."""
    new_stage: str
    notes: Optional[str] = None


class InteractionCreateRequest(BaseModel):
    """Request to create an interaction."""
    interaction_type: InteractionType
    subject: str
    notes: str
    rep_name: Optional[str] = None
    outcome: Optional[str] = None
    next_steps: Optional[str] = None

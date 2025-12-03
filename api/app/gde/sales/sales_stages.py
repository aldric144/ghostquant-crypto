"""
Sales Pipeline Stages
8-stage enterprise sales pipeline definition.
"""

from typing import Dict, List
from .sales_schema import SalesStage


PIPELINE_STAGES = {
    "new_lead": SalesStage(
        stage_id="new_lead",
        stage_name="New Lead",
        stage_order=1,
        description="Initial lead capture and basic information gathering",
        typical_duration_days=3,
        success_rate=0.80,
        required_actions=[
            "Verify contact information",
            "Send welcome email",
            "Schedule initial call",
            "Assign sales rep"
        ]
    ),
    "qualification": SalesStage(
        stage_id="qualification",
        stage_name="Qualification",
        stage_order=2,
        description="Qualify lead based on budget, authority, need, and timeline (BANT)",
        typical_duration_days=7,
        success_rate=0.65,
        required_actions=[
            "Conduct qualification call",
            "Assess budget and authority",
            "Identify decision makers",
            "Determine timeline",
            "Score lead priority"
        ]
    ),
    "needs_analysis": SalesStage(
        stage_id="needs_analysis",
        stage_name="Needs Analysis",
        stage_order=3,
        description="Deep dive into customer requirements and pain points",
        typical_duration_days=10,
        success_rate=0.55,
        required_actions=[
            "Conduct needs assessment meeting",
            "Document use cases",
            "Identify pain points",
            "Map to GhostQuant capabilities",
            "Create solution outline"
        ]
    ),
    "technical_review": SalesStage(
        stage_id="technical_review",
        stage_name="Technical Review",
        stage_order=4,
        description="Technical evaluation and architecture discussion",
        typical_duration_days=14,
        success_rate=0.45,
        required_actions=[
            "Schedule technical demo",
            "Review architecture requirements",
            "Discuss integration points",
            "Address security concerns",
            "Provide technical documentation"
        ]
    ),
    "proof_of_concept": SalesStage(
        stage_id="proof_of_concept",
        stage_name="Proof of Concept",
        stage_order=5,
        description="POC deployment and validation",
        typical_duration_days=21,
        success_rate=0.40,
        required_actions=[
            "Deploy POC environment",
            "Configure for customer use case",
            "Conduct training sessions",
            "Gather feedback",
            "Measure success metrics"
        ]
    ),
    "pricing_negotiation": SalesStage(
        stage_id="pricing_negotiation",
        stage_name="Pricing & Negotiation",
        stage_order=6,
        description="Pricing discussion and contract negotiation",
        typical_duration_days=14,
        success_rate=0.35,
        required_actions=[
            "Present pricing proposal",
            "Negotiate terms",
            "Address objections",
            "Finalize scope",
            "Prepare contract"
        ]
    ),
    "legal_compliance": SalesStage(
        stage_id="legal_compliance",
        stage_name="Legal & Compliance",
        stage_order=7,
        description="Legal review and compliance verification",
        typical_duration_days=10,
        success_rate=0.30,
        required_actions=[
            "Legal review of contract",
            "Compliance verification",
            "Security audit",
            "Data governance review",
            "Sign NDA/MSA"
        ]
    ),
    "closed": SalesStage(
        stage_id="closed",
        stage_name="Closed",
        stage_order=8,
        description="Deal closed (won or lost)",
        typical_duration_days=0,
        success_rate=1.0,
        required_actions=[
            "Mark as won/lost",
            "Document outcome",
            "Schedule onboarding (if won)",
            "Conduct post-mortem (if lost)",
            "Update CRM"
        ]
    )
}


def get_stage_info(stage_id: str) -> SalesStage:
    """
    Get information about a specific stage.
    
    Args:
        stage_id: Stage identifier
    
    Returns:
        SalesStage: Stage information
    
    Raises:
        ValueError: If stage_id is invalid
    """
    if stage_id not in PIPELINE_STAGES:
        raise ValueError(f"Invalid stage_id: {stage_id}")
    return PIPELINE_STAGES[stage_id]


def get_next_stage(current_stage: str) -> str:
    """
    Get the next stage in the pipeline.
    
    Args:
        current_stage: Current stage ID
    
    Returns:
        str: Next stage ID, or 'closed' if already at final stage
    """
    if current_stage not in PIPELINE_STAGES:
        return "new_lead"
    
    current_order = PIPELINE_STAGES[current_stage].stage_order
    
    for stage_id, stage in PIPELINE_STAGES.items():
        if stage.stage_order == current_order + 1:
            return stage_id
    
    return "closed"


def get_previous_stage(current_stage: str) -> str:
    """
    Get the previous stage in the pipeline.
    
    Args:
        current_stage: Current stage ID
    
    Returns:
        str: Previous stage ID, or current stage if at first stage
    """
    if current_stage not in PIPELINE_STAGES:
        return "new_lead"
    
    current_order = PIPELINE_STAGES[current_stage].stage_order
    
    if current_order == 1:
        return current_stage
    
    for stage_id, stage in PIPELINE_STAGES.items():
        if stage.stage_order == current_order - 1:
            return stage_id
    
    return current_stage


def get_stage_progress_percentage(current_stage: str) -> float:
    """
    Get progress percentage through pipeline.
    
    Args:
        current_stage: Current stage ID
    
    Returns:
        float: Progress percentage (0-100)
    """
    if current_stage not in PIPELINE_STAGES:
        return 0.0
    
    current_order = PIPELINE_STAGES[current_stage].stage_order
    total_stages = len(PIPELINE_STAGES)
    
    return (current_order / total_stages) * 100


def get_all_stages_ordered() -> List[SalesStage]:
    """
    Get all stages in order.
    
    Returns:
        List[SalesStage]: Ordered list of all stages
    """
    return sorted(PIPELINE_STAGES.values(), key=lambda s: s.stage_order)


def get_stage_names() -> Dict[str, str]:
    """
    Get mapping of stage IDs to names.
    
    Returns:
        Dict[str, str]: Stage ID to name mapping
    """
    return {stage_id: stage.stage_name for stage_id, stage in PIPELINE_STAGES.items()}

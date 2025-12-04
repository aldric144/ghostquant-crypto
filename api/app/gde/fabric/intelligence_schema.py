from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel


class IntelligenceSchema(BaseModel):
    """
    Standardized intelligence output for GhostQuant 4.0.
    All AI-driven insights flow through this schema.

    Covers:
    - entity intelligence
    - event intelligence
    - manipulation detection
    - behavioral timelines
    - cross-chain correlations
    - confidence scores
    """

    timestamp: datetime = datetime.utcnow()

    event: Optional[Dict[str, Any]] = None
    entity: Optional[Dict[str, Any]] = None

    manipulation: Optional[Dict[str, Any]] = None
    timeline: Optional[Dict[str, Any]] = None
    correlation: Optional[Dict[str, Any]] = None

    confidence_score: Optional[float] = None

    metadata: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True

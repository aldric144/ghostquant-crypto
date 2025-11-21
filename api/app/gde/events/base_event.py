from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class MarketEvent(BaseModel):
    """
    Unified Event Model (UEM)
    """
    event_id: str
    event_type: str
    entity_id: Optional[str] = None
    chain: Optional[str] = None
    value: Optional[float] = None
    token: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.utcnow()

    class Config:
        arbitrary_types_allowed = True

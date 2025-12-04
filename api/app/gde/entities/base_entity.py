from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class FinancialEntity(BaseModel):
    """
    Unified Financial Entity Model (UFEM)
    """
    entity_id: str
    entity_type: str
    name: Optional[str] = None
    address: Optional[str] = None
    chain: Optional[str] = None
    tags: Optional[list[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.utcnow()
    updated_at: Optional[datetime] = None

    class Config:
        arbitrary_types_allowed = True

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class GDESchema(BaseModel):
    schema_version: str = "1.0"
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.utcnow()

    class Config:
        arbitrary_types_allowed = True

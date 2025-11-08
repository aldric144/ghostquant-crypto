from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Asset(BaseModel):
    asset_id: int
    symbol: str
    chain: Optional[str] = None
    address: Optional[str] = None
    sector: Optional[str] = None
    risk_tags: Optional[List[str]] = None

class Signal(BaseModel):
    asset_id: int
    ts: datetime
    trend_score: Optional[float] = None
    pretrend_prob: Optional[float] = None
    action: Optional[str] = None
    confidence: Optional[float] = None
    rationale: Optional[Dict[str, Any]] = None

class Factor(BaseModel):
    asset_id: int
    ts: datetime
    mom_1h: Optional[float] = None
    mom_24h: Optional[float] = None
    accel_1h: Optional[float] = None
    vol_regime: Optional[float] = None
    depth_delta: Optional[float] = None
    volume_z: Optional[float] = None
    funding_flip: Optional[bool] = None
    oi_shift: Optional[float] = None
    tvl_accel: Optional[float] = None
    flow_score: Optional[float] = None

class HealthResponse(BaseModel):
    status: str

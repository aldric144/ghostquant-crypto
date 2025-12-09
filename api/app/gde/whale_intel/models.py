"""
Whale Intelligence Database Models

Data models for whale addresses and movements.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class WhaleAddress(BaseModel):
    """Model representing a whale wallet address."""
    address: str = Field(..., description="Wallet address")
    first_seen: datetime = Field(default_factory=datetime.utcnow, description="First time this whale was observed")
    last_seen: datetime = Field(default_factory=datetime.utcnow, description="Last time this whale was observed")
    total_volume_usd: float = Field(default=0.0, description="Total USD volume moved by this whale")
    num_movements: int = Field(default=0, description="Number of movements recorded")
    tags: List[str] = Field(default_factory=list, description="Tags associated with this whale")
    risk_score: float = Field(default=0.0, description="Risk score (0-100)")
    influence_score: float = Field(default=0.0, description="Influence score (0-100)")

    class Config:
        json_schema_extra = {
            "example": {
                "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                "first_seen": "2024-01-01T00:00:00Z",
                "last_seen": "2024-12-01T00:00:00Z",
                "total_volume_usd": 50000000.0,
                "num_movements": 150,
                "tags": ["exchange", "high-volume"],
                "risk_score": 25.5,
                "influence_score": 85.0
            }
        }


class WhaleMovement(BaseModel):
    """Model representing a whale movement/transaction."""
    from_address: str = Field(..., description="Source wallet address")
    to_address: str = Field(..., description="Destination wallet address")
    symbol: str = Field(..., description="Token symbol (e.g., BTC, ETH)")
    usd_value: float = Field(..., description="USD value of the movement")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time of the movement")

    class Config:
        json_schema_extra = {
            "example": {
                "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                "to_address": "0x1234567890abcdef1234567890abcdef12345678",
                "symbol": "ETH",
                "usd_value": 1500000.0,
                "timestamp": "2024-12-01T12:00:00Z"
            }
        }


class WhaleProfile(BaseModel):
    """Extended whale profile with additional analytics."""
    whale: WhaleAddress
    recent_movements: List[WhaleMovement] = Field(default_factory=list)
    counterparties: List[str] = Field(default_factory=list, description="Addresses this whale has interacted with")
    behavior_summary: str = Field(default="", description="AI-generated behavior analysis")


class TagRequest(BaseModel):
    """Request model for tagging a whale."""
    address: str = Field(..., description="Whale address to tag")
    tag: str = Field(..., description="Tag to add")

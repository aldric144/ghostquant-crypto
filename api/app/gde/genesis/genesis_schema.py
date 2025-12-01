"""
Genesis Archive™ - Schema Definitions
Pure Python dataclasses for permanent intelligence ledger
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid


@dataclass
class GenesisRecord:
    """
    Permanent archival event in Genesis ledger
    """
    id: str = ""
    timestamp: int = 0  # unix timestamp
    source: str = ""  # prediction, fusion, hydra, constellation, radar, dna, oracle, actor, cluster, sentinel, etc.
    entity: Optional[str] = None
    token: Optional[str] = None
    chain: Optional[str] = None
    risk_score: float = 0.0
    confidence: float = 0.0
    classification: str = ""  # low / moderate / high / critical / etc.
    integrity_hash: str = ""  # sha256 hex of record contents
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.id:
            self.id = uuid.uuid4().hex
        if not self.timestamp:
            self.timestamp = int(datetime.utcnow().timestamp())
        if not isinstance(self.metadata, dict):
            self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "source": self.source,
            "entity": self.entity,
            "token": self.token,
            "chain": self.chain,
            "risk_score": self.risk_score,
            "confidence": self.confidence,
            "classification": self.classification,
            "integrity_hash": self.integrity_hash,
            "metadata": self.metadata
        }


@dataclass
class GenesisBlock:
    """
    Batch-block in the Genesis archive (blockchain-style)
    """
    block_id: str = ""
    block_timestamp: int = 0
    records: List[GenesisRecord] = field(default_factory=list)
    previous_hash: Optional[str] = None
    block_hash: str = ""
    record_count: int = 0
    cumulative_records: int = 0
    
    def __post_init__(self):
        """Ensure fields are properly initialized"""
        if not self.block_id:
            self.block_id = uuid.uuid4().hex
        if not self.block_timestamp:
            self.block_timestamp = int(datetime.utcnow().timestamp())
        if not isinstance(self.records, list):
            self.records = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "block_id": self.block_id,
            "block_timestamp": self.block_timestamp,
            "records": [r.to_dict() for r in self.records],
            "previous_hash": self.previous_hash,
            "block_hash": self.block_hash,
            "record_count": self.record_count,
            "cumulative_records": self.cumulative_records
        }


@dataclass
class GenesisLedgerSummary:
    """
    Summary of Genesis ledger state
    """
    total_blocks: int = 0
    total_records: int = 0
    first_block_timestamp: Optional[int] = None
    last_block_timestamp: Optional[int] = None
    latest_block_hash: Optional[str] = None
    integrity_ok: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "total_blocks": self.total_blocks,
            "total_records": self.total_records,
            "first_block_timestamp": self.first_block_timestamp,
            "last_block_timestamp": self.last_block_timestamp,
            "latest_block_hash": self.latest_block_hash,
            "integrity_ok": self.integrity_ok
        }

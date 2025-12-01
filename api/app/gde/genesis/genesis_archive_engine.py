"""
Genesis Archive™ - Permanent Intelligence Ledger
Blockchain-style archival with SHA256 integrity verification
Pure Python, zero external dependencies
"""

import logging
import hashlib
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from .genesis_schema import (
    GenesisRecord,
    GenesisBlock,
    GenesisLedgerSummary
)

logger = logging.getLogger(__name__)


class GenesisArchiveEngine:
    """
    Genesis Archive™ - Permanent Intelligence Ledger
    
    Blockchain-style archival system with:
    - SHA256 integrity hashing
    - Block chaining with previous_hash
    - Regulator-ready audit trail
    - Ledger verification
    - Batch-block creation (250 records per block default)
    
    Pure Python, 100% crash-proof, deterministic
    """
    
    def __init__(self, block_size: int = 250):
        """
        Initialize Genesis Archive Engine
        
        Args:
            block_size: Number of records per block (default 250)
        """
        self.block_size = block_size
        self.blocks: List[GenesisBlock] = []
        self.buffer: List[GenesisRecord] = []
        self.total_records = 0
        logger.info(f"[Genesis] Archive initialized with block_size={block_size}")
    
    def compute_record_hash(self, record_dict: Dict[str, Any]) -> str:
        """
        Compute deterministic SHA256 hash of record
        
        Args:
            record_dict: Dictionary with record fields
        
        Returns:
            SHA256 hex string
        """
        try:
            json_str = json.dumps(record_dict, sort_keys=True)
            hash_obj = hashlib.sha256(json_str.encode())
            return hash_obj.hexdigest()
        except Exception as e:
            logger.error(f"[Genesis] Error computing record hash: {e}")
            return ""
    
    def ingest_record(self, record_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingest a new record into the archive
        
        Args:
            record_dict: Dictionary with record fields
        
        Returns:
            Dictionary with success status and stats
        """
        try:
            logger.info("[Genesis] Ingesting record")
            
            record = GenesisRecord(
                id=record_dict.get('id', ''),
                timestamp=record_dict.get('timestamp', int(datetime.utcnow().timestamp())),
                source=record_dict.get('source', ''),
                entity=record_dict.get('entity'),
                token=record_dict.get('token'),
                chain=record_dict.get('chain'),
                risk_score=float(record_dict.get('risk_score', 0.0)),
                confidence=float(record_dict.get('confidence', 0.0)),
                classification=record_dict.get('classification', ''),
                metadata=record_dict.get('metadata', {})
            )
            
            record_for_hash = {
                'id': record.id,
                'timestamp': record.timestamp,
                'source': record.source,
                'entity': record.entity,
                'token': record.token,
                'chain': record.chain,
                'risk_score': record.risk_score,
                'confidence': record.confidence,
                'classification': record.classification,
                'metadata': record.metadata
            }
            record.integrity_hash = self.compute_record_hash(record_for_hash)
            
            self.buffer.append(record)
            self.total_records += 1
            
            if len(self.buffer) >= self.block_size:
                self._create_block()
            
            logger.info(f"[Genesis] Record ingested: {record.id}, buffer={len(self.buffer)}, blocks={len(self.blocks)}")
            
            return {
                "success": True,
                "record_id": record.id,
                "record_count": self.total_records,
                "block_count": len(self.blocks),
                "buffer_size": len(self.buffer),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Genesis] Error ingesting record: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _create_block(self) -> None:
        """
        Create a new GenesisBlock from buffer
        
        Internal method called when buffer reaches block_size
        """
        try:
            if not self.buffer:
                return
            
            logger.info(f"[Genesis] Creating block with {len(self.buffer)} records")
            
            previous_hash = None
            if self.blocks:
                previous_hash = self.blocks[-1].block_hash
            
            block = GenesisBlock(
                block_id=uuid.uuid4().hex,
                block_timestamp=int(datetime.utcnow().timestamp()),
                records=self.buffer.copy(),
                previous_hash=previous_hash,
                record_count=len(self.buffer),
                cumulative_records=self.total_records
            )
            
            block_for_hash = {
                'block_id': block.block_id,
                'block_timestamp': block.block_timestamp,
                'records': [r.to_dict() for r in block.records],
                'previous_hash': block.previous_hash,
                'record_count': block.record_count,
                'cumulative_records': block.cumulative_records
            }
            json_str = json.dumps(block_for_hash, sort_keys=True)
            hash_obj = hashlib.sha256(json_str.encode())
            block.block_hash = hash_obj.hexdigest()
            
            self.blocks.append(block)
            
            self.buffer = []
            
            logger.info(f"[Genesis] Block created: {block.block_id}, hash={block.block_hash[:16]}...")
            
        except Exception as e:
            logger.error(f"[Genesis] Error creating block: {e}")
    
    def verify_ledger(self) -> Dict[str, Any]:
        """
        Verify integrity of entire ledger
        
        Checks:
        - Each block's hash is correct
        - Each block's previous_hash matches actual previous block
        - Each record's integrity_hash is valid
        
        Returns:
            Dictionary with verification results
        """
        try:
            logger.info("[Genesis] Verifying ledger integrity")
            
            errors = []
            
            for i, block in enumerate(self.blocks):
                block_for_hash = {
                    'block_id': block.block_id,
                    'block_timestamp': block.block_timestamp,
                    'records': [r.to_dict() for r in block.records],
                    'previous_hash': block.previous_hash,
                    'record_count': block.record_count,
                    'cumulative_records': block.cumulative_records
                }
                json_str = json.dumps(block_for_hash, sort_keys=True)
                hash_obj = hashlib.sha256(json_str.encode())
                computed_hash = hash_obj.hexdigest()
                
                if computed_hash != block.block_hash:
                    errors.append(f"Block {i} hash mismatch: expected {block.block_hash[:16]}..., got {computed_hash[:16]}...")
                
                if i > 0:
                    expected_previous = self.blocks[i-1].block_hash
                    if block.previous_hash != expected_previous:
                        errors.append(f"Block {i} previous_hash mismatch: expected {expected_previous[:16]}..., got {block.previous_hash[:16] if block.previous_hash else 'None'}...")
                
                for j, record in enumerate(block.records):
                    record_for_hash = {
                        'id': record.id,
                        'timestamp': record.timestamp,
                        'source': record.source,
                        'entity': record.entity,
                        'token': record.token,
                        'chain': record.chain,
                        'risk_score': record.risk_score,
                        'confidence': record.confidence,
                        'classification': record.classification,
                        'metadata': record.metadata
                    }
                    computed_record_hash = self.compute_record_hash(record_for_hash)
                    
                    if computed_record_hash != record.integrity_hash:
                        errors.append(f"Block {i} record {j} hash mismatch")
            
            integrity_ok = len(errors) == 0
            
            logger.info(f"[Genesis] Ledger verification complete: integrity_ok={integrity_ok}, errors={len(errors)}")
            
            return {
                "success": True,
                "integrity_ok": integrity_ok,
                "blocks_verified": len(self.blocks),
                "records_verified": sum(b.record_count for b in self.blocks),
                "errors": errors,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Genesis] Error verifying ledger: {e}")
            return {
                "success": False,
                "integrity_ok": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_block(self, index: int) -> Dict[str, Any]:
        """
        Get a specific block by index
        
        Args:
            index: Block index (0-based)
        
        Returns:
            Dictionary with block data or error
        """
        try:
            if index < 0 or index >= len(self.blocks):
                return {
                    "success": False,
                    "error": f"Block index {index} out of range (0-{len(self.blocks)-1})",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            block = self.blocks[index]
            
            return {
                "success": True,
                "block": block.to_dict(),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Genesis] Error getting block: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_blocks(self) -> Dict[str, Any]:
        """
        Get all blocks
        
        Returns:
            Dictionary with all blocks or error
        """
        try:
            return {
                "success": True,
                "blocks": [b.to_dict() for b in self.blocks],
                "block_count": len(self.blocks),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Genesis] Error getting blocks: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_summary(self) -> GenesisLedgerSummary:
        """
        Get ledger summary
        
        Returns:
            GenesisLedgerSummary object
        """
        try:
            logger.info("[Genesis] Computing ledger summary")
            
            first_block_timestamp = None
            last_block_timestamp = None
            latest_block_hash = None
            
            if self.blocks:
                first_block_timestamp = self.blocks[0].block_timestamp
                last_block_timestamp = self.blocks[-1].block_timestamp
                latest_block_hash = self.blocks[-1].block_hash
            
            verification = self.verify_ledger()
            integrity_ok = verification.get('integrity_ok', True)
            
            summary = GenesisLedgerSummary(
                total_blocks=len(self.blocks),
                total_records=self.total_records,
                first_block_timestamp=first_block_timestamp,
                last_block_timestamp=last_block_timestamp,
                latest_block_hash=latest_block_hash,
                integrity_ok=integrity_ok
            )
            
            logger.info(f"[Genesis] Summary: {summary.total_blocks} blocks, {summary.total_records} records")
            return summary
            
        except Exception as e:
            logger.error(f"[Genesis] Error computing summary: {e}")
            return GenesisLedgerSummary()
    
    def health(self) -> Dict[str, Any]:
        """
        Get engine health status
        
        Returns:
            Dictionary with health information
        """
        try:
            return {
                "success": True,
                "blocks": len(self.blocks),
                "records": self.total_records,
                "buffer_size": len(self.buffer),
                "block_size": self.block_size,
                "status": "operational",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[Genesis] Error getting health: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": "error",
                "timestamp": datetime.utcnow().isoformat()
            }

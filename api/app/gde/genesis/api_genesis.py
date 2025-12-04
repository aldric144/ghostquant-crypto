"""
Genesis Archive™ - FastAPI Router
7 endpoints for permanent intelligence ledger
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

from .genesis_archive_engine import GenesisArchiveEngine
from .genesis_schema import (
    GenesisRecord,
    GenesisBlock,
    GenesisLedgerSummary
)

logger = logging.getLogger(__name__)

engine = GenesisArchiveEngine(block_size=250)

router = APIRouter(prefix="/genesis", tags=["Genesis"])


class IngestRequest(BaseModel):
    """Request model for ingesting a record"""
    source: str
    entity: Optional[str] = None
    token: Optional[str] = None
    chain: Optional[str] = None
    risk_score: float
    confidence: float
    classification: str
    metadata: Dict[str, Any] = {}


class IngestResponse(BaseModel):
    """Response model for ingest"""
    success: bool
    record_id: Optional[str] = None
    record_count: Optional[int] = None
    block_count: Optional[int] = None
    buffer_size: Optional[int] = None
    error: Optional[str] = None
    timestamp: str


class BlockResponse(BaseModel):
    """Response model for block retrieval"""
    success: bool
    block: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class BlocksResponse(BaseModel):
    """Response model for all blocks"""
    success: bool
    blocks: Optional[List[Dict[str, Any]]] = None
    block_count: Optional[int] = None
    error: Optional[str] = None
    timestamp: str


class SummaryResponse(BaseModel):
    """Response model for ledger summary"""
    success: bool
    summary: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


class VerifyResponse(BaseModel):
    """Response model for ledger verification"""
    success: bool
    integrity_ok: Optional[bool] = None
    blocks_verified: Optional[int] = None
    records_verified: Optional[int] = None
    errors: Optional[List[str]] = None
    error: Optional[str] = None
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    success: bool
    blocks: Optional[int] = None
    records: Optional[int] = None
    buffer_size: Optional[int] = None
    block_size: Optional[int] = None
    status: str
    error: Optional[str] = None
    timestamp: str


@router.post("/ingest")
async def ingest_record(request: IngestRequest) -> IngestResponse:
    """
    Ingest a new record into the archive
    
    POST /genesis/ingest
    
    Input:
    - source: Intelligence source (prediction, fusion, hydra, etc.)
    - entity: Entity address (optional)
    - token: Token address (optional)
    - chain: Chain name (optional)
    - risk_score: Risk score (0-1)
    - confidence: Confidence score (0-1)
    - classification: Classification label (low/moderate/high/critical)
    - metadata: Additional metadata
    
    Returns:
    - success: bool
    - record_id: UUID of ingested record
    - record_count: Total records in archive
    - block_count: Total blocks in ledger
    - buffer_size: Current buffer size
    - timestamp: Ingestion timestamp
    """
    try:
        logger.info("[GenesisAPI] Ingesting record")
        
        record_dict = {
            'source': request.source,
            'entity': request.entity,
            'token': request.token,
            'chain': request.chain,
            'risk_score': request.risk_score,
            'confidence': request.confidence,
            'classification': request.classification,
            'metadata': request.metadata
        }
        
        result = engine.ingest_record(record_dict)
        
        return IngestResponse(
            success=result.get('success', False),
            record_id=result.get('record_id'),
            record_count=result.get('record_count'),
            block_count=result.get('block_count'),
            buffer_size=result.get('buffer_size'),
            error=result.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error ingesting record: {e}")
        return IngestResponse(
            success=False,
            record_id=None,
            record_count=None,
            block_count=None,
            buffer_size=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/block/{index}")
async def get_block(index: int) -> BlockResponse:
    """
    Get a specific block by index
    
    GET /genesis/block/{index}
    
    Returns:
    - success: bool
    - block: GenesisBlock data
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info(f"[GenesisAPI] Getting block {index}")
        
        result = engine.get_block(index)
        
        return BlockResponse(
            success=result.get('success', False),
            block=result.get('block'),
            error=result.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error getting block: {e}")
        return BlockResponse(
            success=False,
            block=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/blocks")
async def get_blocks() -> BlocksResponse:
    """
    Get all blocks
    
    GET /genesis/blocks
    
    Returns:
    - success: bool
    - blocks: List of GenesisBlock data
    - block_count: Total blocks
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info("[GenesisAPI] Getting all blocks")
        
        result = engine.get_blocks()
        
        return BlocksResponse(
            success=result.get('success', False),
            blocks=result.get('blocks'),
            block_count=result.get('block_count'),
            error=result.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error getting blocks: {e}")
        return BlocksResponse(
            success=False,
            blocks=None,
            block_count=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/summary")
async def get_summary() -> SummaryResponse:
    """
    Get ledger summary
    
    GET /genesis/summary
    
    Returns:
    - success: bool
    - summary: GenesisLedgerSummary with statistics
    - timestamp: Retrieval timestamp
    """
    try:
        logger.info("[GenesisAPI] Getting ledger summary")
        
        summary = engine.get_summary()
        
        return SummaryResponse(
            success=True,
            summary=summary.to_dict(),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error getting summary: {e}")
        return SummaryResponse(
            success=False,
            summary=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/verify")
async def verify_ledger() -> VerifyResponse:
    """
    Verify ledger integrity
    
    GET /genesis/verify
    
    Checks:
    - Each block's hash is correct
    - Each block's previous_hash matches actual previous block
    - Each record's integrity_hash is valid
    
    Returns:
    - success: bool
    - integrity_ok: bool (True if all checks pass)
    - blocks_verified: Number of blocks verified
    - records_verified: Number of records verified
    - errors: List of error messages (empty if integrity_ok)
    - timestamp: Verification timestamp
    """
    try:
        logger.info("[GenesisAPI] Verifying ledger")
        
        result = engine.verify_ledger()
        
        return VerifyResponse(
            success=result.get('success', False),
            integrity_ok=result.get('integrity_ok'),
            blocks_verified=result.get('blocks_verified'),
            records_verified=result.get('records_verified'),
            errors=result.get('errors'),
            error=result.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error verifying ledger: {e}")
        return VerifyResponse(
            success=False,
            integrity_ok=False,
            blocks_verified=None,
            records_verified=None,
            errors=None,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    GET /genesis/health
    
    Returns:
    - success: bool
    - blocks: Total blocks in ledger
    - records: Total records in archive
    - buffer_size: Current buffer size
    - block_size: Records per block
    - status: Engine status
    - timestamp: Health check timestamp
    """
    try:
        health = engine.health()
        
        return HealthResponse(
            success=health.get('success', True),
            blocks=health.get('blocks'),
            records=health.get('records'),
            buffer_size=health.get('buffer_size'),
            block_size=health.get('block_size'),
            status=health.get('status', 'operational'),
            error=health.get('error'),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error in health check: {e}")
        return HealthResponse(
            success=False,
            blocks=None,
            records=None,
            buffer_size=None,
            block_size=None,
            status="error",
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/")
async def get_api_info() -> Dict[str, Any]:
    """
    Get API information
    
    GET /genesis/
    
    Returns:
    - API description
    - Available endpoints
    - Features
    - Blockchain specifications
    """
    try:
        return {
            "engine": "Genesis Archive™",
            "description": "Permanent intelligence ledger with blockchain-style integrity verification",
            "version": "1.0.0",
            "block_size": 250,
            "endpoints": [
                {
                    "path": "/genesis/ingest",
                    "method": "POST",
                    "description": "Ingest a new record into the archive"
                },
                {
                    "path": "/genesis/block/{index}",
                    "method": "GET",
                    "description": "Get a specific block by index"
                },
                {
                    "path": "/genesis/blocks",
                    "method": "GET",
                    "description": "Get all blocks"
                },
                {
                    "path": "/genesis/summary",
                    "method": "GET",
                    "description": "Get ledger summary"
                },
                {
                    "path": "/genesis/verify",
                    "method": "GET",
                    "description": "Verify ledger integrity"
                },
                {
                    "path": "/genesis/health",
                    "method": "GET",
                    "description": "Health check endpoint"
                },
                {
                    "path": "/genesis/",
                    "method": "GET",
                    "description": "API information"
                }
            ],
            "blockchain_features": {
                "hashing_algorithm": "SHA256",
                "block_chaining": "Each block references previous block hash",
                "record_integrity": "Each record has SHA256 integrity hash",
                "verification": "Full ledger verification available",
                "immutability": "Blockchain-style append-only ledger",
                "audit_trail": "Regulator-ready audit trail"
            },
            "features": {
                "pure_python": "Zero external dependencies",
                "crash_proof": "100% error handling",
                "deterministic": "Deterministic SHA256 hashing",
                "batch_blocks": "250 records per block",
                "integrity_verification": "Full ledger verification",
                "audit_ready": "Regulator-ready audit trail",
                "blockchain_style": "Block chaining with previous_hash"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"[GenesisAPI] Error getting API info: {e}")
        return {
            "engine": "Genesis Archive™",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

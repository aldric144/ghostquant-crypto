"""
WIDB Router - Whale Intelligence Database API Endpoints

Provides REST API endpoints for WIDB operations:
- GET /widb/wallet/{address} - Retrieve wallet profile
- GET /widb/wallet/{address}/associations - Get wallet associations
- GET /widb/cluster/history - Get cluster history
- POST /widb/wallet/annotate - Add analyst notes
- GET /widb/stats - Get WIDB statistics
- POST /widb/ingest/hydra - Manual Hydra ingestion endpoint

This is a NEW isolated module - does NOT modify any existing code.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from .widb_models import (
    WalletProfile,
    WalletAnnotation,
    WalletProfileResponse,
    AssociationListResponse,
    ClusterHistoryListResponse,
    EntityType,
    RiskLevel,
)
from .widb_service import get_widb_service
from .intel_ingest import publish_hydra_detection, initialize_intel_pipeline

# Initialize the intel pipeline on module load
try:
    initialize_intel_pipeline()
except Exception as e:
    import logging
    logging.getLogger(__name__).warning(f"Failed to initialize intel pipeline: {e}")

# Create router
widb_router = APIRouter(prefix="/widb", tags=["widb"])


# Request/Response Models

class AnnotateRequest(BaseModel):
    """Request body for wallet annotation"""
    address: str = Field(..., description="Wallet address to annotate")
    notes: str = Field(..., description="Analyst notes")
    tags: Optional[List[str]] = Field(default=None, description="Tags to add")
    entity_type: Optional[str] = Field(default=None, description="Entity classification")
    risk_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Risk score")


class HydraIngestRequest(BaseModel):
    """Request body for manual Hydra ingestion"""
    heads: List[str] = Field(..., min_length=2, description="List of head addresses")
    cluster_id: Optional[str] = Field(default=None, description="Optional cluster ID")
    risk_level: Optional[str] = Field(default="medium", description="Risk level")
    risk_score: Optional[float] = Field(default=0.5, ge=0.0, le=1.0, description="Risk score")


class IngestResponse(BaseModel):
    """Response for ingestion endpoints"""
    success: bool
    message: str
    profiles_created: int = 0
    associations_created: int = 0
    cluster_recorded: bool = False
    cluster_id: Optional[str] = None
    timestamp: str


class StatsResponse(BaseModel):
    """Response for stats endpoint"""
    total_wallets: int
    total_associations: int
    total_clusters: int
    wallets_by_type: dict
    clusters_by_risk: dict
    timestamp: str


class HealthResponse(BaseModel):
    """Response for health check"""
    status: str
    module: str
    version: str
    timestamp: str


# Endpoints

@widb_router.get("/health", response_model=HealthResponse)
async def widb_health():
    """Health check for WIDB module"""
    return HealthResponse(
        status="healthy",
        module="widb",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat()
    )


@widb_router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """
    Get WIDB statistics.
    
    Returns counts of wallets, associations, and clusters,
    along with breakdowns by entity type and risk level.
    """
    service = get_widb_service()
    stats = service.get_stats()
    
    return StatsResponse(
        total_wallets=stats.get("total_wallets", 0),
        total_associations=stats.get("total_associations", 0),
        total_clusters=stats.get("total_clusters", 0),
        wallets_by_type=stats.get("wallets_by_type", {}),
        clusters_by_risk=stats.get("clusters_by_risk", {}),
        timestamp=datetime.utcnow().isoformat()
    )


@widb_router.get("/wallet/{address}", response_model=WalletProfileResponse)
async def get_wallet_profile(address: str):
    """
    Retrieve a wallet profile by address.
    
    Returns the wallet profile along with association and cluster counts.
    Returns 404 if the wallet is not found in WIDB.
    """
    service = get_widb_service()
    result = service.get_wallet_profile(address)
    
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Wallet profile not found: {address}"
        )
    
    return result


@widb_router.get("/wallet/{address}/associations", response_model=AssociationListResponse)
async def get_wallet_associations(address: str):
    """
    Get all associations for a wallet address.
    
    Returns a list of known associations (linked wallets)
    with confidence scores and relationship types.
    """
    service = get_widb_service()
    return service.get_associations(address)


@widb_router.get("/wallet/{address}/clusters", response_model=ClusterHistoryListResponse)
async def get_wallet_clusters(address: str):
    """
    Get all clusters that include a specific wallet address.
    
    Returns historical cluster participation records.
    """
    service = get_widb_service()
    clusters = service.get_clusters_for_address(address)
    
    return ClusterHistoryListResponse(
        clusters=clusters,
        total=len(clusters)
    )


@widb_router.get("/cluster/history", response_model=ClusterHistoryListResponse)
async def get_cluster_history(
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum records to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination")
):
    """
    Get cluster history with pagination.
    
    Returns a list of cluster detection events sorted by timestamp (newest first).
    """
    service = get_widb_service()
    return service.get_cluster_history(limit=limit, offset=offset)


@widb_router.get("/wallets", response_model=List[WalletProfile])
async def list_wallets(
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum records to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination")
):
    """
    List all wallet profiles with pagination.
    
    Returns profiles sorted by last_seen (newest first).
    """
    service = get_widb_service()
    return service.list_wallet_profiles(limit=limit, offset=offset)


@widb_router.post("/wallet/annotate", response_model=WalletProfile)
async def annotate_wallet(request: AnnotateRequest):
    """
    Add analyst annotations to a wallet profile.
    
    Creates the profile if it doesn't exist.
    Updates notes, tags, entity type, and risk score.
    """
    service = get_widb_service()
    
    # Map entity type string to enum if provided
    entity_type = None
    if request.entity_type:
        entity_type_map = {
            "whale": EntityType.WHALE,
            "exchange": EntityType.EXCHANGE,
            "mixer": EntityType.MIXER,
            "exploit": EntityType.EXPLOIT,
            "normal": EntityType.NORMAL,
        }
        entity_type = entity_type_map.get(request.entity_type.lower())
    
    annotation = WalletAnnotation(
        address=request.address,
        notes=request.notes,
        tags=request.tags,
        entity_type=entity_type,
        risk_score=request.risk_score
    )
    
    result = service.annotate_wallet(annotation)
    
    if not result:
        raise HTTPException(
            status_code=500,
            detail="Failed to annotate wallet"
        )
    
    return result


@widb_router.post("/ingest/hydra", response_model=IngestResponse)
async def ingest_hydra_detection(request: HydraIngestRequest):
    """
    Manually ingest a Hydra detection result into WIDB.
    
    This endpoint allows direct ingestion of Hydra detection data.
    It creates wallet profiles, associations, and cluster records.
    
    Requires at least 2 head addresses.
    """
    if len(request.heads) < 2:
        return IngestResponse(
            success=False,
            message="Need at least 2 heads for ingestion",
            timestamp=datetime.utcnow().isoformat()
        )
    
    service = get_widb_service()
    
    result = service.ingest_hydra_detection(
        heads=request.heads,
        cluster_id=request.cluster_id,
        risk_level=request.risk_level or "medium",
        risk_score=request.risk_score or 0.5,
        source="manual"
    )
    
    # Also publish to event bus for any other listeners
    publish_hydra_detection(
        heads=request.heads,
        cluster_id=result.get("cluster_id"),
        risk_level=request.risk_level or "medium",
        risk_score=request.risk_score or 0.5
    )
    
    return IngestResponse(
        success=result.get("success", False),
        message="Hydra detection ingested successfully" if result.get("success") else "Ingestion failed",
        profiles_created=result.get("profiles_created", 0),
        associations_created=result.get("associations_created", 0),
        cluster_recorded=result.get("cluster_recorded", False),
        cluster_id=result.get("cluster_id"),
        timestamp=datetime.utcnow().isoformat()
    )


@widb_router.post("/ingest/demo", response_model=IngestResponse)
async def ingest_demo_data():
    """
    Ingest demo data into WIDB.
    
    Creates synthetic wallet profiles and cluster records
    for demonstration purposes.
    """
    # Demo addresses
    demo_heads = [
        "0xfe9e8709d3215310075d67e3ed32a380ccf451c8",
        "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
        "0x8894e0a0c962cb723c1976a4421c95949be2d4e3",
    ]
    
    service = get_widb_service()
    
    result = service.ingest_hydra_detection(
        heads=demo_heads,
        cluster_id="demo-cluster-001",
        risk_level="high",
        risk_score=0.85,
        source="demo"
    )
    
    return IngestResponse(
        success=result.get("success", False),
        message="Demo data ingested successfully" if result.get("success") else "Demo ingestion failed",
        profiles_created=result.get("profiles_created", 0),
        associations_created=result.get("associations_created", 0),
        cluster_recorded=result.get("cluster_recorded", False),
        cluster_id=result.get("cluster_id"),
        timestamp=datetime.utcnow().isoformat()
    )


@widb_router.post("/ingest/bootstrap", response_model=IngestResponse)
async def ingest_bootstrap_data():
    """
    Ingest bootstrap data into WIDB.
    
    Creates wallet profiles for well-known contract addresses
    (USDT, USDC, WBTC, WETH, MATIC) for demonstration.
    """
    # Bootstrap addresses (well-known contracts)
    bootstrap_heads = [
        "0xdac17f958d2ee523a2206206994597c13d831ec7",  # USDT
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",  # USDC
    ]
    
    service = get_widb_service()
    
    result = service.ingest_hydra_detection(
        heads=bootstrap_heads,
        cluster_id="bootstrap-cluster-001",
        risk_level="low",
        risk_score=0.2,
        source="bootstrap"
    )
    
    return IngestResponse(
        success=result.get("success", False),
        message="Bootstrap data ingested successfully" if result.get("success") else "Bootstrap ingestion failed",
        profiles_created=result.get("profiles_created", 0),
        associations_created=result.get("associations_created", 0),
        cluster_recorded=result.get("cluster_recorded", False),
        cluster_id=result.get("cluster_id"),
        timestamp=datetime.utcnow().isoformat()
    )

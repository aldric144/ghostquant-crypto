"""
Radar API - FastAPI endpoints for Global Manipulation Radar Heatmap.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from datetime import datetime

from ..intel.global_radar_engine import GlobalRadarEngine


router = APIRouter()

radar_engine = GlobalRadarEngine()



class RadarEventRequest(BaseModel):
    """Request model for radar event ingestion."""
    chain: Optional[str] = Field(None, description="Chain name")
    entity: Optional[str] = Field(None, description="Entity address")
    address: Optional[str] = Field(None, description="Entity address (alias)")
    token: Optional[str] = Field(None, description="Token symbol")
    symbol: Optional[str] = Field(None, description="Token symbol (alias)")
    network: Optional[str] = Field(None, description="Network type")
    manipulation_risk: Optional[float] = Field(None, description="Manipulation risk score (0-1)")
    volatility: Optional[float] = Field(None, description="Volatility score (0-1)")
    ring_probability: Optional[float] = Field(None, description="Ring probability (0-1)")
    chain_pressure: Optional[float] = Field(None, description="Chain pressure score (0-1)")
    anomaly_score: Optional[float] = Field(None, description="Anomaly score (0-1)")
    cluster_id: Optional[Any] = Field(None, description="Cluster ID")
    timestamp: Optional[str] = Field(None, description="Event timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "chain": "ethereum",
                "entity": "0xABC123...",
                "token": "ETH",
                "manipulation_risk": 0.75,
                "volatility": 0.68,
                "ring_probability": 0.42,
                "chain_pressure": 0.55,
                "anomaly_score": 0.38,
                "cluster_id": 1
            }
        }



@router.get("/heatmap", tags=["GlobalRadar"])
async def get_heatmap(
    timeframe: str = Query("1h", description="Time window (e.g., 1h, 6h, 24h)")
):
    """
    Get global manipulation risk heatmap.
    
    Returns normalized 0-1 risk scores for:
    - Chains (e.g., {"ETH": 0.83, "SOL": 0.56})
    - Entities (e.g., {"0xabc...": 0.77})
    - Tokens (e.g., {"USDT": 0.12, "PEPE": 0.91})
    - Networks (e.g., {"EVM": 0.66, "Layer2": 0.42})
    - Clusters (coordinated entity groups)
    
    **Query Parameters:**
    - timeframe: Time window for analysis (default: "1h")
      - Examples: "1h", "6h", "24h", "7d"
    
    **Returns:**
    - chains: Dict mapping chain name to risk score
    - entities: Dict mapping entity address to risk score
    - tokens: Dict mapping token symbol to risk score
    - networks: Dict mapping network type to risk score
    - clusters: List of detected clusters with scores
    - event_count: Number of events in timeframe
    - timestamp: Current timestamp
    """
    try:
        print(f"[RadarAPI] Received heatmap request: timeframe={timeframe}")
        
        result = radar_engine.compute_heatmap(timeframe=timeframe)
        
        if not result.get('success', False):
            error_msg = result.get('error', 'Heatmap computation failed')
            print(f"[RadarAPI] Heatmap failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        print(f"[RadarAPI] Heatmap computed successfully")
        return result
        
    except Exception as e:
        print(f"[RadarAPI] Error in heatmap endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/summary", tags=["GlobalRadar"])
async def get_summary():
    """
    Get global intelligence summary.
    
    Returns comprehensive snapshot including:
    - Global risk score and level
    - Top 10 high-risk entities
    - Chain trends (risk by chain)
    - Network volatility (risk by network)
    - Cluster activity (top coordinated clusters)
    - Manipulation spike count
    - Total events ingested
    - Last update timestamp
    
    **Returns:**
    - global_risk_score: Overall risk score (0-1)
    - global_risk_level: Risk classification (critical/high/moderate/low/minimal)
    - top_entities: Top 10 entities by risk score
    - chain_trends: Risk scores by chain
    - network_volatility: Risk scores by network
    - cluster_activity: Top 10 clusters by risk
    - manipulation_spikes: Count of entities with score >= 0.80
    - total_events: Total events ingested
    - last_update: Last update timestamp
    """
    try:
        print("[RadarAPI] Received summary request")
        
        result = radar_engine.get_global_summary()
        
        if not result.get('success', False):
            error_msg = result.get('error', 'Summary computation failed')
            print(f"[RadarAPI] Summary failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        print("[RadarAPI] Summary computed successfully")
        return result
        
    except Exception as e:
        print(f"[RadarAPI] Error in summary endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.post("/ingest", tags=["GlobalRadar"])
async def ingest_event(request: RadarEventRequest = Body(...)):
    """
    Ingest new event into radar system.
    
    Updates radar state with new event data including:
    - Chain risk scores
    - Entity manipulation risk
    - Token volatility indicators
    - Cluster involvement
    - Chain pressure predictions
    - Behavioral anomalies
    - Ring probabilities
    
    **Request Body:**
    - chain: Chain name (optional)
    - entity/address: Entity address (optional)
    - token/symbol: Token symbol (optional)
    - network: Network type (optional, inferred from chain if not provided)
    - manipulation_risk: Manipulation risk score 0-1 (optional)
    - volatility: Volatility score 0-1 (optional)
    - ring_probability: Ring probability 0-1 (optional)
    - chain_pressure: Chain pressure score 0-1 (optional)
    - anomaly_score: Anomaly score 0-1 (optional)
    - cluster_id: Cluster identifier (optional)
    - timestamp: Event timestamp (optional, defaults to now)
    - metadata: Additional metadata (optional)
    
    **Returns:**
    - event_risk: Computed risk score for this event
    - chain_score: Updated chain risk score
    - entity_score: Updated entity risk score
    - token_score: Updated token risk score
    - network_score: Updated network risk score
    - total_events: Total events ingested
    """
    try:
        print("[RadarAPI] Received ingest request")
        
        event = request.model_dump(exclude_none=True)
        
        result = radar_engine.ingest_event(event)
        
        if not result.get('success', False):
            error_msg = result.get('error', 'Event ingestion failed')
            print(f"[RadarAPI] Ingest failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        print("[RadarAPI] Event ingested successfully")
        return result
        
    except Exception as e:
        print(f"[RadarAPI] Error in ingest endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/spikes", tags=["GlobalRadar"])
async def get_spikes(
    timeframe: str = Query("1h", description="Time window for spike detection")
):
    """
    Get manipulation and volatility spikes.
    
    Detects:
    - Manipulation spikes (sudden risk increases)
    - Volatility spikes (sudden volatility increases)
    - Chain pressure bursts (sudden chain congestion)
    - Synchronized cluster formation (new coordinated groups)
    
    **Query Parameters:**
    - timeframe: Time window for analysis (default: "1h")
    
    **Returns:**
    - manipulation_spikes: Entities with manipulation risk >= 0.80
    - volatility_spikes: Tokens with volatility >= 0.80
    - chain_pressure_bursts: Chains with pressure >= 0.80
    - synchronized_clusters: New clusters formed in timeframe
    - spike_count: Total number of spikes detected
    """
    try:
        print(f"[RadarAPI] Received spikes request: timeframe={timeframe}")
        
        heatmap = radar_engine.compute_heatmap(timeframe=timeframe)
        
        if not heatmap.get('success', False):
            return {
                'success': False,
                'error': 'Failed to compute heatmap for spike detection',
                'timestamp': datetime.utcnow().isoformat()
            }
        
        manipulation_spikes = [
            {'entity': entity, 'score': score}
            for entity, score in heatmap.get('entities', {}).items()
            if score >= 0.80
        ]
        
        volatility_spikes = [
            {'token': token, 'score': score}
            for token, score in heatmap.get('tokens', {}).items()
            if score >= 0.80
        ]
        
        chain_pressure_bursts = [
            {'chain': chain, 'score': score}
            for chain, score in heatmap.get('chains', {}).items()
            if score >= 0.80
        ]
        
        synchronized_clusters = [
            cluster for cluster in heatmap.get('clusters', [])
            if cluster.get('score', 0) >= 0.70
        ]
        
        result = {
            'success': True,
            'timeframe': timeframe,
            'manipulation_spikes': manipulation_spikes,
            'volatility_spikes': volatility_spikes,
            'chain_pressure_bursts': chain_pressure_bursts,
            'synchronized_clusters': synchronized_clusters,
            'spike_count': (
                len(manipulation_spikes) +
                len(volatility_spikes) +
                len(chain_pressure_bursts) +
                len(synchronized_clusters)
            ),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"[RadarAPI] Spikes detected: {result['spike_count']}")
        return result
        
    except Exception as e:
        print(f"[RadarAPI] Error in spikes endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/top", tags=["GlobalRadar"])
async def get_top(
    limit: int = Query(20, description="Number of top items to return", ge=1, le=100)
):
    """
    Get top high-risk entities, tokens, and chains.
    
    **Query Parameters:**
    - limit: Number of top items to return (default: 20, max: 100)
    
    **Returns:**
    - top_entities: Top entities by risk score
    - top_tokens: Top tokens by risk score
    - top_chains: Top chains by risk score
    - top_networks: Top networks by risk score
    - limit: Requested limit
    """
    try:
        print(f"[RadarAPI] Received top request: limit={limit}")
        
        sorted_entities = sorted(
            radar_engine.entity_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        top_entities = [
            {
                'address': addr,
                'score': score,
                'risk_level': radar_engine.compute_risk_level(score)
            }
            for addr, score in sorted_entities
        ]
        
        sorted_tokens = sorted(
            radar_engine.token_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        top_tokens = [
            {
                'symbol': symbol,
                'score': score,
                'risk_level': radar_engine.compute_risk_level(score)
            }
            for symbol, score in sorted_tokens
        ]
        
        sorted_chains = sorted(
            radar_engine.chain_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        top_chains = [
            {
                'chain': chain,
                'score': score,
                'risk_level': radar_engine.compute_risk_level(score)
            }
            for chain, score in sorted_chains
        ]
        
        sorted_networks = sorted(
            radar_engine.network_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        top_networks = [
            {
                'network': network,
                'score': score,
                'risk_level': radar_engine.compute_risk_level(score)
            }
            for network, score in sorted_networks
        ]
        
        result = {
            'success': True,
            'limit': limit,
            'top_entities': top_entities,
            'top_tokens': top_tokens,
            'top_chains': top_chains,
            'top_networks': top_networks,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"[RadarAPI] Top items retrieved")
        return result
        
    except Exception as e:
        print(f"[RadarAPI] Error in top endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/clusters", tags=["GlobalRadar"])
async def get_clusters():
    """
    Get global coordinated clusters.
    
    Returns all detected clusters with:
    - Cluster ID
    - Member entities
    - Cluster size
    - Risk score
    - Risk level
    
    **Returns:**
    - clusters: List of all detected clusters
    - cluster_count: Total number of clusters
    - high_risk_clusters: Count of clusters with risk >= 0.70
    """
    try:
        print("[RadarAPI] Received clusters request")
        
        clusters = radar_engine.clusters
        
        high_risk_count = sum(1 for c in clusters if c.get('score', 0) >= 0.70)
        
        result = {
            'success': True,
            'clusters': clusters,
            'cluster_count': len(clusters),
            'high_risk_clusters': high_risk_count,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"[RadarAPI] Clusters retrieved: {len(clusters)} total")
        return result
        
    except Exception as e:
        print(f"[RadarAPI] Error in clusters endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/health", tags=["GlobalRadar"])
async def health_check():
    """
    Health check endpoint for Radar API.
    
    **Returns:**
    - status: API status
    - total_events: Total events ingested
    - entity_count: Number of tracked entities
    - chain_count: Number of tracked chains
    - token_count: Number of tracked tokens
    - cluster_count: Number of detected clusters
    - last_update: Last update timestamp
    """
    try:
        return {
            'success': True,
            'status': 'healthy',
            'total_events': radar_engine.total_events_ingested,
            'entity_count': len(radar_engine.entity_scores),
            'chain_count': len(radar_engine.chain_scores),
            'token_count': len(radar_engine.token_scores),
            'cluster_count': len(radar_engine.clusters),
            'last_update': radar_engine.last_update.isoformat(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[RadarAPI] Error in health check: {e}")
        return {
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/", tags=["GlobalRadar"])
async def radar_api_info():
    """
    Get Radar API information.
    
    **Returns:**
    - API overview and available endpoints
    """
    return {
        'success': True,
        'name': 'Global Manipulation Radar Heatmap (GMRH)',
        'version': '1.0.0',
        'description': 'Real-time manipulation risk visualization across chains, entities, tokens, and networks',
        'endpoints': {
            'GET /radar/heatmap': 'Get global risk heatmap',
            'GET /radar/summary': 'Get global intelligence summary',
            'POST /radar/ingest': 'Ingest new event',
            'GET /radar/spikes': 'Get manipulation and volatility spikes',
            'GET /radar/top': 'Get top high-risk entities, tokens, chains',
            'GET /radar/clusters': 'Get global coordinated clusters',
            'GET /radar/health': 'Health check',
            'GET /radar/': 'API information'
        },
        'features': [
            'Real-time risk heatmap visualization',
            'Chain risk tracking',
            'Entity manipulation detection',
            'Token volatility monitoring',
            'Network pressure analysis',
            'Cluster coordination detection',
            'Spike detection and alerts',
            'Multi-domain intelligence fusion'
        ],
        'timestamp': datetime.utcnow().isoformat()
    }

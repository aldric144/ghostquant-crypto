"""
Correlation API - FastAPI endpoints for cross-entity behavioral correlation analysis.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from datetime import datetime

from ..behavior.correlation.cross_entity_correlation_engine import CrossEntityCorrelationEngine
from ..behavior.correlation.correlation_graph_builder import CorrelationGraphBuilder
from ..behavior.correlation.correlation_stats import CorrelationStats


router = APIRouter()

correlation_engine = CrossEntityCorrelationEngine(time_window_hours=24)
graph_builder = CorrelationGraphBuilder()
stats_calculator = CorrelationStats()



class PairCorrelationRequest(BaseModel):
    """Request model for pair correlation analysis."""
    addressA: str = Field(..., description="First entity address", min_length=1)
    addressB: str = Field(..., description="Second entity address", min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "addressA": "0xABC123...",
                "addressB": "0xDEF456..."
            }
        }


class GroupCorrelationRequest(BaseModel):
    """Request model for group correlation analysis."""
    addresses: List[str] = Field(
        ...,
        description="List of entity addresses",
        min_length=2
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "addresses": [
                    "0xABC123...",
                    "0xDEF456...",
                    "0xGHI789..."
                ]
            }
        }



@router.post("/pair", tags=["Correlation"])
async def analyze_pair_correlation(request: PairCorrelationRequest = Body(...)):
    """
    Analyze correlation between two entities.
    
    Computes correlation score based on:
    - Timing similarity (temporal overlap)
    - Transaction size similarity
    - Directional similarity
    - Chain hop alignment
    - Token overlap
    - Burst pattern matching
    
    **Returns:**
    - correlation_score: Overall correlation (0.0-1.0)
    - components: Individual correlation components
    - coordinated_flag: True if correlation >= 0.65
    - alignment_metrics: Detailed alignment analysis
    - shared_dna_traits: Behavioral DNA similarities
    - flags: Risk and behavior flags
    - summary: Human-readable interpretation
    - statistics: Statistical analysis
    """
    try:
        print(f"[CorrelationAPI] Received pair correlation request: {request.addressA[:10]}... vs {request.addressB[:10]}...")
        
        if not request.addressA or not request.addressB:
            raise HTTPException(
                status_code=400,
                detail="Both addressA and addressB are required"
            )
        
        if request.addressA.lower() == request.addressB.lower():
            raise HTTPException(
                status_code=400,
                detail="Cannot correlate an address with itself"
            )
        
        correlation_result = correlation_engine.compute_pair_correlation(
            request.addressA,
            request.addressB
        )
        
        if not correlation_result.get('success', False):
            error_msg = correlation_result.get('error', 'Correlation analysis failed')
            print(f"[CorrelationAPI] Pair correlation failed: {error_msg}")
            raise HTTPException(
                status_code=404,
                detail=error_msg
            )
        
        stats_result = stats_calculator.compute_pair_stats(correlation_result)
        
        response = {
            'success': True,
            'addressA': correlation_result['addressA'],
            'addressB': correlation_result['addressB'],
            'correlation_score': correlation_result['correlation_score'],
            'components': correlation_result['components'],
            'alignment_metrics': {
                'timing_alignment': correlation_result['components']['timing_similarity'],
                'size_alignment': correlation_result['components']['size_similarity'],
                'directional_alignment': correlation_result['components']['directional_similarity'],
                'chain_alignment': correlation_result['components']['chain_alignment'],
                'token_alignment': correlation_result['components']['token_overlap'],
                'burst_alignment': correlation_result['components']['burst_pattern_match']
            },
            'shared_dna_traits': {
                'timing_pattern_match': correlation_result['components']['timing_similarity'] >= 0.65,
                'size_pattern_match': correlation_result['components']['size_similarity'] >= 0.65,
                'chain_pattern_match': correlation_result['components']['chain_alignment'] >= 0.65,
                'token_pattern_match': correlation_result['components']['token_overlap'] >= 0.65,
                'burst_pattern_match': correlation_result['components']['burst_pattern_match'] >= 0.65
            },
            'flags': {
                'coordinated_flag': correlation_result['coordinated_flag'],
                'high_correlation_flag': correlation_result['correlation_score'] >= 0.70,
                'synchronized_timing_flag': correlation_result['components']['timing_similarity'] >= 0.70,
                'synchronized_burst_flag': correlation_result['components']['burst_pattern_match'] >= 0.70
            },
            'summary': stats_result.get('interpretation', 'Correlation analysis complete'),
            'statistics': stats_result,
            'events_analyzed': correlation_result['events_analyzed'],
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"[CorrelationAPI] Pair correlation successful: {response['correlation_score']:.3f}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CorrelationAPI] Error in pair correlation endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.post("/group", tags=["Correlation"])
async def analyze_group_correlation(request: GroupCorrelationRequest = Body(...)):
    """
    Analyze correlation for a group of entities.
    
    Computes pairwise correlations for all entity combinations and aggregates results.
    
    **Returns:**
    - group_correlation_score: Average correlation across all pairs
    - coordinated_actor_probability: Probability of coordinated behavior (0.0-1.0)
    - strongest_pair_score: Highest pairwise correlation
    - weakest_pair_score: Lowest pairwise correlation
    - cluster_risk_classification: Risk level (CRITICAL/HIGH/MEDIUM/LOW/MINIMAL)
    - pair_details: Individual pair correlations
    - statistics: Statistical analysis
    - summary: Human-readable interpretation
    """
    try:
        print(f"[CorrelationAPI] Received group correlation request for {len(request.addresses)} entities")
        
        if len(request.addresses) < 2:
            raise HTTPException(
                status_code=400,
                detail="Need at least 2 addresses for group correlation"
            )
        
        if len(request.addresses) > 50:
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 addresses per group correlation request"
            )
        
        unique_addresses = list(set(addr.lower() for addr in request.addresses))
        if len(unique_addresses) < len(request.addresses):
            print(f"[CorrelationAPI] Warning: Duplicate addresses removed")
        
        group_result = correlation_engine.compute_group_correlation(unique_addresses)
        
        if not group_result.get('success', False):
            error_msg = group_result.get('error', 'Group correlation analysis failed')
            print(f"[CorrelationAPI] Group correlation failed: {error_msg}")
            raise HTTPException(
                status_code=404,
                detail=error_msg
            )
        
        stats_result = stats_calculator.compute_group_stats(group_result)
        
        response = {
            'success': True,
            'group_size': group_result['group_size'],
            'addresses': group_result['addresses'],
            'group_correlation_score': group_result['avg_correlation'],
            'coordinated_actor_probability': stats_result.get('coordinated_actor_probability', 0.0),
            'strongest_pair_score': group_result['max_correlation'],
            'weakest_pair_score': group_result['min_correlation'],
            'cluster_risk_classification': stats_result.get('cluster_risk_classification', 'UNKNOWN'),
            'risk_level': group_result['risk_level'],
            'coordinated_actor_flag': group_result['coordinated_actor_flag'],
            'cohesion_score': stats_result.get('cohesion_score', 0.0),
            'synchronized_behavior_rating': stats_result.get('synchronized_behavior_rating', 'UNKNOWN'),
            'pair_count': group_result['pair_count'],
            'pair_details': group_result['pair_details'],
            'summary': group_result['summary'],
            'statistics': stats_result,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"[CorrelationAPI] Group correlation successful: {response['group_correlation_score']:.3f}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CorrelationAPI] Error in group correlation endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/clusters", tags=["Correlation"])
async def get_synchronized_clusters():
    """
    Get all detected synchronized clusters.
    
    Scans all known entities and detects clusters of 3+ entities with correlation >= 0.55.
    
    **Returns:**
    - cluster_count: Number of detected clusters
    - clusters: List of cluster details
    - cluster_sizes: Distribution of cluster sizes
    - cluster_risk: Risk level distribution
    - representatives: Representative entities from each cluster
    - dna_archetype_distribution: Distribution of behavioral archetypes
    - statistics: Statistical analysis
    - total_entities_scanned: Number of entities analyzed
    """
    try:
        print("[CorrelationAPI] Fetching synchronized clusters")
        
        clusters_result = correlation_engine.find_synchronized_clusters()
        
        if not clusters_result.get('success', False):
            error_msg = clusters_result.get('error', 'Cluster detection failed')
            print(f"[CorrelationAPI] Cluster detection failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        clusters = clusters_result.get('clusters', [])
        
        stats_result = stats_calculator.compute_cluster_stats(clusters)
        
        cluster_sizes = {}
        for cluster in clusters:
            size = cluster.get('size', 0)
            cluster_sizes[size] = cluster_sizes.get(size, 0) + 1
        
        cluster_risk = {}
        for cluster in clusters:
            risk = cluster.get('risk_level', 'UNKNOWN')
            cluster_risk[risk] = cluster_risk.get(risk, 0) + 1
        
        representatives = []
        for cluster in clusters:
            members = cluster.get('members', [])
            if members:
                representatives.append({
                    'cluster_id': cluster.get('cluster_id', 'unknown'),
                    'representative': members[0],
                    'cluster_size': len(members),
                    'risk_level': cluster.get('risk_level', 'UNKNOWN')
                })
        
        response = {
            'success': True,
            'cluster_count': clusters_result['cluster_count'],
            'clusters': clusters,
            'cluster_sizes': cluster_sizes,
            'cluster_risk': cluster_risk,
            'representatives': representatives,
            'dna_archetype_distribution': {},  # Would require DNA analysis integration
            'statistics': stats_result,
            'total_entities_scanned': clusters_result['total_entities_scanned'],
            'timestamp': clusters_result['timestamp']
        }
        
        print(f"[CorrelationAPI] Clusters retrieved: {response['cluster_count']} clusters")
        return response
        
    except Exception as e:
        print(f"[CorrelationAPI] Error in clusters endpoint: {e}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/health", tags=["Correlation"])
async def health_check():
    """
    Health check endpoint for Correlation API.
    
    **Returns:**
    - status: API status
    - entity_count: Number of tracked entities
    - total_events: Total events in buffer
    - time_window_hours: Current time window
    """
    try:
        state = correlation_engine.export_state()
        
        return {
            'success': True,
            'status': 'healthy',
            'entity_count': state.get('entity_count', 0),
            'total_events': state.get('total_events', 0),
            'time_window_hours': state.get('time_window_hours', 24),
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[CorrelationAPI] Error in health check: {e}")
        return {
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }


@router.get("/", tags=["Correlation"])
async def correlation_api_info():
    """
    Get Correlation API information.
    
    **Returns:**
    - API overview and available endpoints
    """
    return {
        'success': True,
        'name': 'Cross-Entity Behavioral Correlation API',
        'version': '1.0.0',
        'description': 'Detects coordinated actors, swarms, and synchronized multi-entity behavior',
        'endpoints': {
            'POST /correlation/pair': 'Analyze correlation between two entities',
            'POST /correlation/group': 'Analyze correlation for a group of entities',
            'GET /correlation/clusters': 'Get all detected synchronized clusters',
            'GET /correlation/health': 'Health check',
            'GET /correlation/': 'API information'
        },
        'features': [
            'Timing similarity analysis',
            'Transaction size correlation',
            'Directional pattern matching',
            'Chain hop alignment',
            'Token overlap detection',
            'Burst pattern synchronization',
            'Coordinated actor detection',
            'Swarm behavior identification',
            'Risk classification',
            'Cluster analysis'
        ],
        'timestamp': datetime.utcnow().isoformat()
    }

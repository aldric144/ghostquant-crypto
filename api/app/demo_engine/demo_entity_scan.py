"""
Demo Entity Scan Module
Thin wrapper around existing DemoEngine for entity analysis demos.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.gde.demo.demo_engine import DemoEngine
from app.gde.demo.demo_schema import DemoEntity, DemoDNA, DemoActorProfile, DemoFusion


class EntityScanDemoResponse(BaseModel):
    """Enhanced entity scan response for demo mode."""
    entity: DemoEntity
    behavioral_dna: DemoDNA
    actor_profile: DemoActorProfile
    fusion_analysis: DemoFusion
    scan_summary: Dict[str, Any]
    risk_factors: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    demo_mode: bool = True


_demo_engine = DemoEngine(seed=42)


def get_demo_entity_scan(address: Optional[str] = None) -> EntityScanDemoResponse:
    """
    Generate a comprehensive demo entity scan response.
    
    Combines entity profile, behavioral DNA, actor profile, and fusion analysis
    for a complete entity intelligence picture.
    
    Args:
        address: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        EntityScanDemoResponse: Complete entity scan demo data
    """
    entity = _demo_engine.generate_synthetic_entity()
    dna = _demo_engine.run_demo_dna(address)
    actor = _demo_engine.run_demo_actor_profile(address)
    fusion = _demo_engine.run_demo_fusion(address)
    
    risk_factors = []
    
    if entity.risk_score > 70:
        risk_factors.append({
            "factor": "High Risk Score",
            "severity": "critical",
            "description": f"Entity risk score of {entity.risk_score} exceeds threshold",
            "score": entity.risk_score
        })
    
    if "mixer" in entity.flags or "sanctioned" in entity.flags:
        risk_factors.append({
            "factor": "Flagged Entity",
            "severity": "high",
            "description": f"Entity flagged for: {', '.join(entity.flags)}",
            "flags": entity.flags
        })
    
    if actor.threat_level > 60:
        risk_factors.append({
            "factor": "Elevated Threat Level",
            "severity": "high",
            "description": f"Actor threat level: {actor.threat_level}",
            "score": actor.threat_level
        })
    
    if len(dna.anomaly_detection) > 2:
        risk_factors.append({
            "factor": "Multiple Anomalies",
            "severity": "medium",
            "description": f"Detected {len(dna.anomaly_detection)} behavioral anomalies",
            "count": len(dna.anomaly_detection)
        })
    
    if entity.connections > 200:
        risk_factors.append({
            "factor": "High Connectivity",
            "severity": "medium",
            "description": f"Entity has {entity.connections} known connections",
            "count": entity.connections
        })
    
    scan_summary = {
        "entity_type": entity.entity_type,
        "overall_risk": fusion.unified_risk_score,
        "confidence": fusion.confidence,
        "classification": dna.classification,
        "threat_category": actor.risk_category,
        "recommendation": fusion.recommendation,
        "transaction_volume": entity.total_volume,
        "transaction_count": entity.transaction_count,
        "first_seen": entity.first_seen.isoformat(),
        "last_seen": entity.last_seen.isoformat(),
        "cluster_id": entity.cluster_id,
        "risk_factor_count": len(risk_factors),
        "behavioral_traits": actor.behavioral_traits,
        "known_associations_count": len(actor.known_associations)
    }
    
    return EntityScanDemoResponse(
        entity=entity,
        behavioral_dna=dna,
        actor_profile=actor,
        fusion_analysis=fusion,
        scan_summary=scan_summary,
        risk_factors=risk_factors
    )

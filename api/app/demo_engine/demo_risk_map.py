"""
Demo Risk Map Module
Thin wrapper around existing DemoEngine for global risk visualization demos.
"""

from typing import List
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.gde.demo.demo_engine import DemoEngine
from app.gde.demo.demo_schema import DemoConstellation, DemoHydra, DemoSentinel, DemoChain


class RiskMapDemoResponse(BaseModel):
    """Enhanced risk map response for demo mode."""
    constellation: DemoConstellation
    hydra_detection: DemoHydra
    sentinel_status: DemoSentinel
    chain_metrics: List[DemoChain]
    global_summary: Dict[str, Any]
    threat_overview: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    demo_mode: bool = True


_demo_engine = DemoEngine(seed=42)


def get_demo_risk_map() -> RiskMapDemoResponse:
    """
    Generate a comprehensive demo risk map response.
    
    Combines constellation map, Hydra detection, sentinel status, and chain metrics
    for a complete global threat visualization.
    
    Returns:
        RiskMapDemoResponse: Complete risk map demo data
    """
    constellation = _demo_engine.run_demo_constellation()
    hydra = _demo_engine.run_demo_hydra()
    sentinel = _demo_engine.run_demo_sentinel()
    
    chain_metrics = [_demo_engine.generate_synthetic_chain() for _ in range(6)]
    
    total_threats = sum(chain.active_threats for chain in chain_metrics)
    avg_threat_level = sum(chain.threat_level for chain in chain_metrics) / len(chain_metrics)
    
    global_summary = {
        "global_risk_level": constellation.global_risk_level,
        "total_monitored_entities": constellation.total_entities,
        "active_threat_clusters": len(constellation.threat_clusters),
        "supernovas_detected": constellation.supernovas,
        "wormholes_active": constellation.wormholes,
        "nebulas_forming": constellation.nebulas,
        "system_health": sentinel.system_health,
        "system_uptime": sentinel.uptime,
        "total_active_alerts": sentinel.active_alerts,
        "critical_alerts": sentinel.critical_alerts,
        "high_alerts": sentinel.high_alerts,
        "chains_monitored": len(chain_metrics),
        "total_chain_threats": total_threats,
        "average_chain_threat_level": round(avg_threat_level, 1)
    }
    
    threat_overview = {
        "latest_hydra_detection": {
            "attack_type": hydra.attack_type,
            "severity": hydra.severity,
            "confidence": hydra.confidence,
            "entities_involved": hydra.entities_involved,
            "coordination_score": hydra.coordination_score,
            "recommendation": hydra.recommendation
        },
        "regional_threats": {
            region: {
                "threat_level": data["threat_level"],
                "entities_at_risk": data["entities"],
                "status": "critical" if data["threat_level"] > 70 else "elevated" if data["threat_level"] > 40 else "normal"
            }
            for region, data in constellation.regions.items()
        },
        "top_threat_clusters": [
            {
                "name": cluster["name"],
                "type": cluster["type"],
                "risk": cluster["risk"],
                "entities": cluster["entities"]
            }
            for cluster in sorted(constellation.threat_clusters, key=lambda x: x["risk"], reverse=True)[:5]
        ],
        "chain_status": [
            {
                "chain": chain.chain_name,
                "threat_level": chain.threat_level,
                "active_threats": chain.active_threats,
                "network_health": chain.network_health,
                "congestion": chain.congestion_level
            }
            for chain in chain_metrics
        ]
    }
    
    return RiskMapDemoResponse(
        constellation=constellation,
        hydra_detection=hydra,
        sentinel_status=sentinel,
        chain_metrics=chain_metrics,
        global_summary=global_summary,
        threat_overview=threat_overview
    )

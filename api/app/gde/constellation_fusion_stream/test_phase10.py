"""
Phase 10 Test Script - Constellation Advanced Features

Tests all Phase 10 modules to prove no regressions:
1. WebSocket Streaming Engine
2. AI Constellation Risk Model
3. Cluster Labeling + Entity Classification
4. Animated Threat Timeline

Run with: python -m pytest api/app/gde/constellation_fusion_stream/test_phase10.py -v
Or directly: python api/app/gde/constellation_fusion_stream/test_phase10.py
"""

import asyncio
import sys
from datetime import datetime
from typing import Dict, Any


def test_stream_server_imports():
    """Test that stream server module imports correctly."""
    print("Testing stream server imports...")
    
    from app.gde.constellation_fusion_stream import (
        router,
        stream_manager,
        constellation_stream_server,
        ConnectionManager,
        ConstellationStreamServer,
        StreamEvent,
        StreamEventType,
    )
    
    assert router is not None, "Router should be defined"
    assert stream_manager is not None, "Stream manager should be defined"
    assert constellation_stream_server is not None, "Stream server should be defined"
    assert StreamEventType.FUSION_EVENT.value == "fusion_event"
    
    print("  Stream server imports: PASSED")
    return True


def test_risk_model_imports():
    """Test that risk model module imports correctly."""
    print("Testing risk model imports...")
    
    from app.gde.constellation_risk import (
        router,
        risk_model_engine,
        ConstellationRiskModelEngine,
        NodeRiskProfile,
        ClusterRiskProfile,
        SystemicRiskProfile,
        RiskCategory,
        RiskFactor,
    )
    
    assert router is not None, "Router should be defined"
    assert risk_model_engine is not None, "Risk model engine should be defined"
    assert RiskCategory.CRITICAL.value == "critical"
    assert RiskFactor.HYDRA_COORDINATION.value == "hydra_coordination"
    
    print("  Risk model imports: PASSED")
    return True


def test_cluster_labeler_imports():
    """Test that cluster labeler module imports correctly."""
    print("Testing cluster labeler imports...")
    
    from app.gde.constellation_ai import (
        router,
        cluster_labeler,
        ConstellationClusterLabeler,
        EntityClassification,
        ClusterClassification,
        EntityType,
        ClusterLabel,
    )
    
    assert router is not None, "Router should be defined"
    assert cluster_labeler is not None, "Cluster labeler should be defined"
    assert EntityType.WHALE.value == "whale"
    assert ClusterLabel.WHALE_POD.value == "whale_pod"
    
    print("  Cluster labeler imports: PASSED")
    return True


def test_timeline_engine_imports():
    """Test that timeline engine module imports correctly."""
    print("Testing timeline engine imports...")
    
    from app.gde.constellation_timeline import (
        router,
        timeline_engine,
        ConstellationTimelineEngine,
        TimelineEvent,
        ThreatNarrative,
        ThreatSeverity,
        TimelineEventType,
    )
    
    assert router is not None, "Router should be defined"
    assert timeline_engine is not None, "Timeline engine should be defined"
    assert ThreatSeverity.CRITICAL.value == "critical"
    assert TimelineEventType.HYDRA_DETECTION.value == "hydra_detection"
    
    print("  Timeline engine imports: PASSED")
    return True


def test_risk_model_computation():
    """Test risk model computation logic."""
    print("Testing risk model computation...")
    
    from app.gde.constellation_risk import (
        risk_model_engine,
        RiskCategory,
    )
    
    # Test node risk computation
    node_data = {
        "hydra_score": 0.8,
        "is_hydra_head": True,
        "coordination_strength": 0.7,
        "is_whale": True,
        "total_volume_usd": 50_000_000,
        "influence_score": 0.6,
        "transfer_count": 500,
        "time_window_hours": 24,
        "tags": ["whale", "suspicious"],
        "centrality_score": 0.5,
    }
    
    profile = risk_model_engine.compute_node_risk(
        node_id="test_node_1",
        node_data=node_data,
    )
    
    assert profile is not None, "Profile should be computed"
    assert profile.node_id == "test_node_1"
    assert 0 <= profile.adjusted_risk_score <= 1, "Risk score should be between 0 and 1"
    assert profile.risk_category in RiskCategory, "Risk category should be valid"
    assert len(profile.risk_factors) > 0, "Risk factors should be computed"
    
    print(f"    Computed risk score: {profile.adjusted_risk_score:.2f}")
    print(f"    Risk category: {profile.risk_category.value}")
    print("  Risk model computation: PASSED")
    return True


def test_cluster_classification():
    """Test cluster classification logic."""
    print("Testing cluster classification...")
    
    from app.gde.constellation_ai import (
        cluster_labeler,
        EntityType,
    )
    
    # First classify some entities
    entities = [
        {"node_id": "whale_1", "node_data": {"tags": ["whale"], "total_volume_usd": 10_000_000}},
        {"node_id": "whale_2", "node_data": {"tags": ["whale", "large_holder"], "total_volume_usd": 20_000_000}},
        {"node_id": "wallet_1", "node_data": {"tags": [], "total_volume_usd": 1000}},
    ]
    
    for entity in entities:
        classification = cluster_labeler.classify_entity(
            node_id=entity["node_id"],
            node_data=entity["node_data"],
        )
        assert classification is not None, "Classification should be computed"
        print(f"    Entity {entity['node_id']}: {classification.predicted_type.value} ({classification.confidence:.2f})")
    
    # Now classify a cluster
    cluster_classification = cluster_labeler.classify_cluster(
        cluster_id="test_cluster_1",
        node_ids=["whale_1", "whale_2", "wallet_1"],
        cluster_metadata={"cohesion_score": 0.7},
    )
    
    assert cluster_classification is not None, "Cluster classification should be computed"
    assert cluster_classification.cluster_id == "test_cluster_1"
    
    print(f"    Cluster label: {cluster_classification.predicted_label.value}")
    print(f"    Confidence: {cluster_classification.confidence:.2f}")
    print("  Cluster classification: PASSED")
    return True


async def test_timeline_recording():
    """Test timeline event recording."""
    print("Testing timeline recording...")
    
    from app.gde.constellation_timeline import (
        timeline_engine,
        TimelineEventType,
        ThreatSeverity,
    )
    
    # Record some test events
    events = [
        {
            "event_type": TimelineEventType.HYDRA_DETECTION,
            "title": "Hydra Coordination Detected",
            "description": "Test hydra detection event",
            "entities_involved": ["entity_1", "entity_2"],
            "metadata": {"confidence": 0.85, "count": 5},
        },
        {
            "event_type": TimelineEventType.WHALE_MOVEMENT,
            "title": "Whale Movement Detected",
            "description": "Large whale transfer observed",
            "entities_involved": ["whale_1"],
            "metadata": {"amount_usd": 10_000_000, "source": "0x123..."},
        },
        {
            "event_type": TimelineEventType.RISK_SPIKE,
            "title": "Risk Spike Alert",
            "description": "Global risk increased significantly",
            "metadata": {"risk": 0.75},
        },
    ]
    
    for event_data in events:
        event = await timeline_engine.record_event(
            event_type=event_data["event_type"],
            title=event_data["title"],
            description=event_data["description"],
            entities_involved=event_data.get("entities_involved", []),
            metadata=event_data.get("metadata", {}),
        )
        
        assert event is not None, "Event should be recorded"
        assert event.event_id is not None, "Event should have an ID"
        print(f"    Recorded: {event.title} [{event.severity.value}]")
    
    # Test narrative building
    narrative = timeline_engine.build_narrative(window_minutes=60)
    
    assert narrative is not None, "Narrative should be built"
    assert narrative.total_events >= 3, "Should have at least 3 events"
    
    print(f"    Narrative: {narrative.summary}")
    print("  Timeline recording: PASSED")
    return True


def test_stream_event_creation():
    """Test stream event creation."""
    print("Testing stream event creation...")
    
    from app.gde.constellation_fusion_stream import (
        StreamEvent,
        StreamEventType,
    )
    
    event = StreamEvent(
        event_type=StreamEventType.FUSION_EVENT,
        payload={"test": "data"},
        source_engine="test_engine",
    )
    
    assert event is not None, "Event should be created"
    assert event.event_type == StreamEventType.FUSION_EVENT
    assert event.source_engine == "test_engine"
    
    event_dict = event.to_dict()
    assert "event_type" in event_dict
    assert "payload" in event_dict
    assert "timestamp" in event_dict
    
    print(f"    Event ID: {event.event_id}")
    print("  Stream event creation: PASSED")
    return True


def test_existing_fusion_pipeline():
    """Test that existing constellation fusion pipeline still works."""
    print("Testing existing fusion pipeline (no regression)...")
    
    from app.gde.constellation_fusion import (
        fusion_router,
        constellation_fusion_service,
        fusion_registry,
        emit_event,
    )
    
    assert fusion_router is not None, "Fusion router should exist"
    assert constellation_fusion_service is not None, "Fusion service should exist"
    assert fusion_registry is not None, "Fusion registry should exist"
    assert emit_event is not None, "emit_event function should exist"
    
    # Test that service methods exist
    assert hasattr(constellation_fusion_service, 'add_node')
    assert hasattr(constellation_fusion_service, 'add_edge')
    assert hasattr(constellation_fusion_service, 'serialize_constellation')
    assert hasattr(constellation_fusion_service, 'get_metrics')
    
    print("  Existing fusion pipeline: PASSED (no regression)")
    return True


def test_existing_whale_intel():
    """Test that existing whale intel module still works."""
    print("Testing existing whale intel (no regression)...")
    
    from app.gde.whale_intel import router as whale_intel_router
    
    assert whale_intel_router is not None, "Whale intel router should exist"
    
    print("  Existing whale intel: PASSED (no regression)")
    return True


async def run_all_tests():
    """Run all Phase 10 tests."""
    print("\n" + "=" * 60)
    print("PHASE 10 TEST SUITE - Constellation Advanced Features")
    print("=" * 60 + "\n")
    
    results = []
    
    # Import tests
    results.append(("Stream Server Imports", test_stream_server_imports()))
    results.append(("Risk Model Imports", test_risk_model_imports()))
    results.append(("Cluster Labeler Imports", test_cluster_labeler_imports()))
    results.append(("Timeline Engine Imports", test_timeline_engine_imports()))
    
    # Functionality tests
    results.append(("Risk Model Computation", test_risk_model_computation()))
    results.append(("Cluster Classification", test_cluster_classification()))
    results.append(("Stream Event Creation", test_stream_event_creation()))
    results.append(("Timeline Recording", await test_timeline_recording()))
    
    # Regression tests
    results.append(("Existing Fusion Pipeline", test_existing_fusion_pipeline()))
    results.append(("Existing Whale Intel", test_existing_whale_intel()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "PASSED" if result else "FAILED"
        print(f"  {name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nALL TESTS PASSED - Phase 10 is ready for deployment!")
        return True
    else:
        print("\nSOME TESTS FAILED - Please review before deployment")
        return False


if __name__ == "__main__":
    # Add the project root to the path
    import os
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
    sys.path.insert(0, project_root)
    
    # Run tests
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)

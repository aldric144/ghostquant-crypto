#!/usr/bin/env python3
"""
Demo Fusion Events Test Harness

This script fires example events into the Constellation Fusion Pipeline
to test that all integrations work correctly.

Usage:
    python -m app.gde.constellation_fusion.demo_fusion_events
    
Or run directly:
    python demo_fusion_events.py
"""

import sys
import os

# Add parent directory to path for imports when running directly
if __name__ == "__main__":
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from datetime import datetime
from typing import Dict, Any, List
import json

from app.gde.constellation_fusion.fusion_registry import emit_event, fusion_registry
from app.gde.constellation_fusion.fusion_service import constellation_fusion_service


def demo_hydra_detection():
    """Simulate a Hydra detection event."""
    print("\n=== HYDRA DETECTION EVENT ===")
    
    payload = {
        "origin": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "participants": [
            "0x1234567890abcdef1234567890abcdef12345678",
            "0xabcdef1234567890abcdef1234567890abcdef12",
            "0x9876543210fedcba9876543210fedcba98765432",
        ],
        "confidence": 0.92,
        "threat_level": "high",
        "coordination_score": 0.87,
        "cluster_id": "hydra_cluster_001",
        "hydra_heads": [
            "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            "0x1234567890abcdef1234567890abcdef12345678",
        ],
        "manipulation_score": 0.78,
        "volatility_score": 0.65,
    }
    
    success = emit_event(
        event_type="hydra_detection",
        payload=payload,
        source_engine="hydra",
        priority=8,
    )
    
    print(f"Event emitted: {success}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    return success


def demo_whale_movement():
    """Simulate a Whale Intelligence movement event."""
    print("\n=== WHALE MOVEMENT EVENT ===")
    
    payload = {
        "whale_address": "0xWhale123456789abcdef123456789abcdef1234",
        "movement_type": "large_transfer",
        "amount_usd": 15000000.00,
        "from_address": "0xWhale123456789abcdef123456789abcdef1234",
        "to_address": "0xExchange987654321fedcba987654321fedcba98",
        "token": "ETH",
        "risk_score": 0.45,
        "influence_score": 0.92,
        "tags": ["whale", "institutional", "smart_money"],
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    success = emit_event(
        event_type="whale_movement",
        payload=payload,
        source_engine="whale_intel",
        priority=7,
    )
    
    print(f"Event emitted: {success}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    return success


def demo_ecoscan_transfer():
    """Simulate an EcoScan transfer event."""
    print("\n=== ECOSCAN TRANSFER EVENT ===")
    
    payload = {
        "from_address": "0xSender111222333444555666777888999aaabbbcc",
        "to_address": "0xReceiver999888777666555444333222111dddeeef",
        "amount": 500.0,
        "token": "USDC",
        "amount_usd": 500.0,
        "tx_hash": "0xtxhash123456789abcdef123456789abcdef123456789abcdef123456789abc",
        "block_number": 18500000,
        "gas_used": 21000,
        "risk_flags": ["high_frequency", "new_address"],
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    success = emit_event(
        event_type="ecoscan_transfer",
        payload=payload,
        source_engine="ecoscan",
        priority=5,
    )
    
    print(f"Event emitted: {success}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    return success


def demo_entity_lookup():
    """Simulate an Entity Explorer lookup event."""
    print("\n=== ENTITY LOOKUP EVENT ===")
    
    payload = {
        "entity_address": "0xEntity555666777888999aaabbbcccdddeeefff00",
        "lookup_type": "investigation",
        "user_id": "analyst_001",
        "entity_type": "wallet",
        "known_labels": ["exchange_hot_wallet", "binance"],
        "first_seen": "2023-01-15T10:30:00Z",
        "last_activity": datetime.utcnow().isoformat(),
        "total_transactions": 15420,
        "notes": "User flagged for investigation",
    }
    
    success = emit_event(
        event_type="entity_lookup",
        payload=payload,
        source_engine="entity_explorer",
        priority=3,
    )
    
    print(f"Event emitted: {success}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    return success


def demo_multiple_events():
    """Fire multiple events to simulate real-world activity."""
    print("\n=== MULTIPLE EVENTS SIMULATION ===")
    
    events = [
        {
            "type": "hydra_detection",
            "payload": {
                "origin": "0xMulti111222333444555666777888999aaabbbcc",
                "participants": ["0xP1", "0xP2", "0xP3"],
                "confidence": 0.75,
                "threat_level": "elevated",
            },
            "source": "hydra",
        },
        {
            "type": "whale_movement",
            "payload": {
                "whale_address": "0xBigWhale999888777666555444333222111000",
                "movement_type": "accumulation",
                "amount_usd": 50000000.00,
                "token": "BTC",
            },
            "source": "whale_intel",
        },
        {
            "type": "ecoscan_transfer",
            "payload": {
                "from_address": "0xFrom123",
                "to_address": "0xTo456",
                "amount": 10000.0,
                "token": "ETH",
            },
            "source": "ecoscan",
        },
    ]
    
    results = []
    for event in events:
        success = emit_event(
            event_type=event["type"],
            payload=event["payload"],
            source_engine=event["source"],
        )
        results.append({"type": event["type"], "success": success})
        print(f"  {event['type']}: {success}")
    
    return results


def print_constellation_state():
    """Print the current state of the constellation."""
    print("\n=== CONSTELLATION STATE ===")
    
    # Get serialized constellation
    result = constellation_fusion_service.serialize_constellation()
    
    map_data = result.get("map", {})
    nodes = map_data.get("nodes", [])
    edges = map_data.get("edges", [])
    clusters = map_data.get("clusters", [])
    
    print(f"Total Nodes: {len(nodes)}")
    print(f"Total Edges: {len(edges)}")
    print(f"Total Clusters: {len(clusters)}")
    print(f"Global Risk Score: {map_data.get('global_risk_score', 0):.2%}")
    
    if nodes:
        print("\nNodes:")
        for node in nodes[:10]:  # Show first 10
            print(f"  - {node.get('id', 'unknown')[:20]}... | Category: {node.get('category', 'unknown')} | Risk: {node.get('risk_score', 0):.2%}")
    
    if edges:
        print("\nEdges:")
        for edge in edges[:10]:  # Show first 10
            print(f"  - {edge.get('source_id', 'unknown')[:10]}... -> {edge.get('target_id', 'unknown')[:10]}... | Type: {edge.get('relation_type', 'unknown')}")
    
    if clusters:
        print("\nClusters:")
        for cluster in clusters:
            print(f"  - {cluster.get('cluster_id', 'unknown')} | Risk: {cluster.get('risk_level', 'unknown')} | Nodes: {len(cluster.get('node_ids', []))}")


def print_metrics():
    """Print constellation metrics."""
    print("\n=== CONSTELLATION METRICS ===")
    
    result = constellation_fusion_service.get_metrics()
    summary = result.get("summary", {})
    
    print(f"Total Nodes: {summary.get('total_nodes', 0)}")
    print(f"Total Edges: {summary.get('total_edges', 0)}")
    print(f"Total Clusters: {summary.get('total_clusters', 0)}")
    print(f"Hydra Heads Detected: {summary.get('hydra_heads_detected', 0)}")
    print(f"Whale Nodes: {summary.get('whale_nodes', 0)}")
    print(f"Global Risk Score: {summary.get('global_risk_score', 0):.2%}")
    print(f"Dominant Risk: {summary.get('dominant_risk', 'unknown')}")
    
    high_risk = summary.get("high_risk_entities", [])
    if high_risk:
        print(f"\nHigh Risk Entities ({len(high_risk)}):")
        for entity in high_risk[:5]:
            print(f"  - {entity}")


def print_registry_stats():
    """Print fusion registry statistics."""
    print("\n=== REGISTRY STATISTICS ===")
    
    stats = fusion_registry.get_stats()
    
    print(f"Registered Engines: {stats.get('registered_engines', 0)}")
    print(f"Active Engines: {stats.get('active_engines', 0)}")
    print(f"Total Events Processed: {stats.get('total_events_processed', 0)}")
    print(f"Events by Type: {json.dumps(stats.get('events_by_type', {}), indent=2)}")
    
    engines = fusion_registry.get_registered_engines()
    if engines:
        print("\nRegistered Engines:")
        for engine in engines:
            print(f"  - {engine.get('engine_name', 'unknown')} | Active: {engine.get('active', False)} | Events: {engine.get('event_types', [])}")


def run_full_demo():
    """Run the complete demo test harness."""
    print("=" * 60)
    print("CONSTELLATION FUSION PIPELINE - DEMO TEST HARNESS")
    print("=" * 60)
    print(f"Started at: {datetime.utcnow().isoformat()}")
    
    # Print initial state
    print_registry_stats()
    print_constellation_state()
    print_metrics()
    
    # Fire demo events
    print("\n" + "=" * 60)
    print("FIRING DEMO EVENTS")
    print("=" * 60)
    
    demo_hydra_detection()
    demo_whale_movement()
    demo_ecoscan_transfer()
    demo_entity_lookup()
    demo_multiple_events()
    
    # Print final state
    print("\n" + "=" * 60)
    print("FINAL STATE AFTER EVENTS")
    print("=" * 60)
    
    print_constellation_state()
    print_metrics()
    print_registry_stats()
    
    print("\n" + "=" * 60)
    print("DEMO COMPLETE")
    print("=" * 60)
    print(f"Finished at: {datetime.utcnow().isoformat()}")


if __name__ == "__main__":
    run_full_demo()

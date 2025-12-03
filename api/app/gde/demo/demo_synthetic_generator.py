"""
Demo Synthetic Data Generator
Generates realistic but fake intelligence data for demo purposes.
"""

import random
import string
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .demo_schema import (
    DemoEvent,
    DemoEntity,
    DemoToken,
    DemoChain,
    DemoPrediction,
    DemoFusion,
    DemoSentinel,
    DemoConstellation,
    DemoHydra,
    DemoUltraFusion,
    DemoDNA,
    DemoActorProfile,
    DemoCortexPattern,
)


class DemoSyntheticGenerator:
    """Generates synthetic intelligence data for demo purposes."""
    
    def __init__(self, seed: int = 42):
        """Initialize with random seed for reproducibility."""
        random.seed(seed)
        self.chains = ["Ethereum", "BSC", "Polygon", "Avalanche", "Arbitrum", "Optimism"]
        self.event_types = ["transfer", "swap", "mint", "burn", "stake", "unstake"]
        self.severities = ["critical", "high", "medium", "low"]
        self.entity_types = ["wallet", "contract", "exchange", "mixer", "bridge"]
        self.attack_types = [
            "Coordinated Relay Attack",
            "Multi-Hop Proxy Chain",
            "Distributed Wash Trading",
            "Synchronized Pump Pattern",
            "Cross-Chain Manipulation",
            "Layered Obfuscation"
        ]
        self.actor_types = ["whale", "bot", "exchange", "mixer", "scammer", "legitimate"]
        
    def _generate_address(self) -> str:
        """Generate a fake Ethereum-style address."""
        return "0x" + ''.join(random.choices(string.hexdigits.lower(), k=40))
    
    def _generate_id(self, prefix: str = "") -> str:
        """Generate a unique ID."""
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
        return f"{prefix}{suffix}" if prefix else suffix
    
    def _random_timestamp(self, days_ago: int = 30) -> datetime:
        """Generate a random timestamp within the last N days."""
        now = datetime.utcnow()
        delta = timedelta(days=random.randint(0, days_ago))
        return now - delta
    
    def generate_event(self) -> DemoEvent:
        """Generate a synthetic event."""
        return DemoEvent(
            event_id=self._generate_id("evt_"),
            timestamp=datetime.utcnow(),
            event_type=random.choice(self.event_types),
            severity=random.choice(self.severities),
            source_address=self._generate_address(),
            target_address=self._generate_address() if random.random() > 0.3 else None,
            amount=round(random.uniform(0.1, 10000), 2),
            token=random.choice(["ETH", "USDT", "USDC", "DAI", "WBTC", "LINK"]),
            chain=random.choice(self.chains),
            risk_score=random.randint(0, 100),
            description=f"Suspicious {random.choice(self.event_types)} detected",
            metadata={"demo": True}
        )
    
    def generate_entity(self) -> DemoEntity:
        """Generate a synthetic entity."""
        first_seen = self._random_timestamp(90)
        return DemoEntity(
            address=self._generate_address(),
            entity_type=random.choice(self.entity_types),
            risk_score=random.randint(0, 100),
            confidence=round(random.uniform(0.5, 1.0), 2),
            first_seen=first_seen,
            last_seen=datetime.utcnow(),
            transaction_count=random.randint(10, 10000),
            total_volume=round(random.uniform(1000, 1000000), 2),
            flags=random.sample(["high_risk", "suspicious", "mixer", "sanctioned", "bot"], k=random.randint(0, 3)),
            connections=random.randint(5, 500),
            cluster_id=self._generate_id("cluster_") if random.random() > 0.5 else None,
            metadata={"demo": True}
        )
    
    def generate_token(self) -> DemoToken:
        """Generate a synthetic token."""
        symbols = ["GHOST", "DEMO", "TEST", "FAKE", "SYNTH", "MOCK"]
        return DemoToken(
            token_address=self._generate_address(),
            symbol=random.choice(symbols),
            name=f"{random.choice(symbols)} Token",
            chain=random.choice(self.chains),
            risk_score=random.randint(0, 100),
            manipulation_probability=round(random.uniform(0, 1), 2),
            holder_count=random.randint(100, 100000),
            liquidity=round(random.uniform(10000, 10000000), 2),
            volume_24h=round(random.uniform(1000, 1000000), 2),
            price_change_24h=round(random.uniform(-50, 50), 2),
            flags=random.sample(["high_volatility", "low_liquidity", "suspicious", "pump"], k=random.randint(0, 2)),
            metadata={"demo": True}
        )
    
    def generate_chain(self) -> DemoChain:
        """Generate synthetic chain metrics."""
        return DemoChain(
            chain_name=random.choice(self.chains),
            threat_level=random.randint(0, 100),
            active_threats=random.randint(5, 50),
            monitored_entities=random.randint(1000, 100000),
            suspicious_transactions=random.randint(10, 1000),
            network_health=round(random.uniform(0.7, 1.0), 2),
            congestion_level=random.choice(["low", "medium", "high"]),
            metadata={"demo": True}
        )
    
    def generate_prediction(self) -> DemoPrediction:
        """Generate a synthetic prediction."""
        return DemoPrediction(
            prediction_id=self._generate_id("pred_"),
            timestamp=datetime.utcnow(),
            entity=self._generate_address(),
            prediction_type=random.choice(["risk_increase", "manipulation", "exit_scam", "rug_pull"]),
            risk_level=random.choice(self.severities),
            confidence=round(random.uniform(0.6, 0.99), 2),
            timeframe=random.choice(["24h", "7d", "30d"]),
            indicators=[
                {"name": "volume_spike", "value": random.randint(50, 100)},
                {"name": "behavioral_anomaly", "value": random.randint(60, 95)}
            ],
            recommendation=random.choice(["INVESTIGATE", "MONITOR", "ALERT", "BLOCK"]),
            metadata={"demo": True}
        )
    
    def generate_fusion(self) -> DemoFusion:
        """Generate synthetic UltraFusion analysis."""
        return DemoFusion(
            fusion_id=self._generate_id("fusion_"),
            timestamp=datetime.utcnow(),
            entity=self._generate_address(),
            meta_signals={
                "behavioral_anomaly": round(random.uniform(0, 100), 1),
                "network_threat": round(random.uniform(0, 100), 1),
                "predictive_risk": round(random.uniform(0, 100), 1),
                "manipulation_prob": round(random.uniform(0, 100), 1),
                "entity_confidence": round(random.uniform(0, 100), 1),
                "systemic_pressure": round(random.uniform(0, 100), 1)
            },
            engine_contributions={
                "hydra": {"threat": "high", "confidence": 0.92},
                "constellation": {"cluster": "supernova", "risk": 0.78},
                "profiler": {"risk_score": 89, "category": "suspicious"}
            },
            unified_risk_score=random.randint(0, 100),
            confidence=round(random.uniform(0.7, 0.99), 2),
            recommendation=random.choice(["INVESTIGATE", "MONITOR", "ALERT"]),
            metadata={"demo": True}
        )
    
    def generate_sentinel(self) -> DemoSentinel:
        """Generate synthetic Sentinel status."""
        engines = ["UltraFusion", "Hydra", "Constellation", "Profiler", "Oracle", "DNA", "Radar", "Pressure"]
        return DemoSentinel(
            timestamp=datetime.utcnow(),
            engine_status={
                engine: {
                    "status": "active",
                    "uptime": round(random.uniform(99.5, 100), 1),
                    "alerts": random.randint(0, 10)
                }
                for engine in engines
            },
            active_alerts=random.randint(50, 200),
            critical_alerts=random.randint(5, 20),
            high_alerts=random.randint(10, 40),
            medium_alerts=random.randint(20, 80),
            low_alerts=random.randint(30, 100),
            system_health=round(random.uniform(0.95, 1.0), 3),
            uptime=round(random.uniform(99.8, 100), 2),
            metadata={"demo": True}
        )
    
    def generate_constellation(self) -> DemoConstellation:
        """Generate synthetic Constellation map data."""
        return DemoConstellation(
            timestamp=datetime.utcnow(),
            total_entities=random.randint(1000, 10000),
            threat_clusters=[
                {
                    "name": f"Cluster-{i}",
                    "type": random.choice(["supernova", "wormhole", "nebula"]),
                    "entities": random.randint(10, 100),
                    "risk": random.randint(50, 100)
                }
                for i in range(random.randint(5, 15))
            ],
            supernovas=random.randint(5, 20),
            wormholes=random.randint(3, 15),
            nebulas=random.randint(10, 30),
            global_risk_level=random.randint(50, 90),
            regions={
                region: {
                    "threat_level": random.randint(30, 90),
                    "entities": random.randint(100, 2000)
                }
                for region in ["North America", "Europe", "Asia-Pacific", "Global"]
            },
            metadata={"demo": True}
        )
    
    def generate_hydra(self) -> DemoHydra:
        """Generate synthetic Hydra detection."""
        relay_length = random.randint(3, 7)
        return DemoHydra(
            detection_id=self._generate_id("hydra_"),
            timestamp=datetime.utcnow(),
            attack_type=random.choice(self.attack_types),
            severity=random.choice(["critical", "high"]),
            confidence=round(random.uniform(0.8, 0.99), 2),
            relay_chain=[self._generate_address() for _ in range(relay_length)],
            coordination_score=round(random.uniform(0.7, 1.0), 2),
            entities_involved=relay_length,
            attack_signature=f"SIG-{self._generate_id()}",
            recommendation="INVESTIGATE",
            metadata={"demo": True}
        )
    
    def generate_ultrafusion(self) -> DemoUltraFusion:
        """Generate synthetic UltraFusion meta-analysis."""
        return DemoUltraFusion(
            analysis_id=self._generate_id("ultra_"),
            timestamp=datetime.utcnow(),
            entity=self._generate_address(),
            behavioral_anomaly_score=random.randint(0, 100),
            network_threat_level=random.randint(0, 100),
            predictive_risk_index=random.randint(0, 100),
            manipulation_probability=random.randint(0, 100),
            entity_confidence_score=random.randint(0, 100),
            systemic_pressure_gauge=random.randint(0, 100),
            overall_assessment=random.choice(["HIGH_RISK", "MEDIUM_RISK", "LOW_RISK", "MONITOR"]),
            metadata={"demo": True}
        )
    
    def generate_dna(self) -> DemoDNA:
        """Generate synthetic Behavioral DNA."""
        return DemoDNA(
            dna_id=self._generate_id("dna_"),
            timestamp=datetime.utcnow(),
            entity=self._generate_address(),
            behavioral_signature=f"DNA-{self._generate_id()}",
            pattern_consistency=round(random.uniform(0.5, 1.0), 2),
            anomaly_detection=[
                {
                    "type": random.choice(["volume_spike", "timing_anomaly", "pattern_break"]),
                    "severity": random.choice(self.severities),
                    "timestamp": self._random_timestamp(7).isoformat()
                }
                for _ in range(random.randint(1, 5))
            ],
            risk_evolution=[
                {"day": i, "risk": round(random.uniform(30, 90), 1)}
                for i in range(30)
            ],
            classification=random.choice(["bot", "whale", "mixer", "normal", "suspicious"]),
            metadata={"demo": True}
        )
    
    def generate_actor_profile(self) -> DemoActorProfile:
        """Generate synthetic Actor Profile."""
        return DemoActorProfile(
            profile_id=self._generate_id("actor_"),
            timestamp=datetime.utcnow(),
            entity=self._generate_address(),
            actor_type=random.choice(self.actor_types),
            risk_category=random.choice(["high", "medium", "low"]),
            threat_level=random.randint(0, 100),
            behavioral_traits=random.sample([
                "high_frequency_trading",
                "wash_trading",
                "pump_and_dump",
                "layering",
                "spoofing",
                "front_running"
            ], k=random.randint(1, 3)),
            known_associations=[self._generate_address() for _ in range(random.randint(2, 8))],
            activity_timeline=[
                {
                    "timestamp": self._random_timestamp(30).isoformat(),
                    "event": random.choice(self.event_types),
                    "risk": random.randint(0, 100)
                }
                for _ in range(random.randint(5, 15))
            ],
            recommendation=random.choice(["INVESTIGATE", "MONITOR", "BLOCK"]),
            metadata={"demo": True}
        )
    
    def generate_cortex_pattern(self) -> DemoCortexPattern:
        """Generate synthetic Cortex memory pattern."""
        first_detected = self._random_timestamp(30)
        return DemoCortexPattern(
            pattern_id=self._generate_id("pattern_"),
            timestamp=datetime.utcnow(),
            pattern_name=random.choice([
                "Recurring Wash Trading",
                "Coordinated Pump Cycles",
                "Cross-Chain Relay Pattern",
                "Manipulation Signature A7"
            ]),
            frequency=random.choice(["hourly", "daily", "weekly"]),
            confidence=round(random.uniform(0.7, 0.99), 2),
            first_detected=first_detected,
            last_detected=datetime.utcnow(),
            occurrences=random.randint(10, 100),
            entities_involved=[self._generate_address() for _ in range(random.randint(3, 10))],
            pattern_description="Detected recurring behavioral pattern indicating coordinated activity",
            metadata={"demo": True}
        )

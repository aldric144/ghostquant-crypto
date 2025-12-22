"""
GQ-Core Synthetic Data Generator

Generates deterministic synthetic data seeded by time bucket.
This ensures consistent data across all pages and prevents drift
between components (e.g., Ring Detector and GhostMind).
"""

import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any


class SyntheticDataGenerator:
    """
    Deterministic synthetic data generator for GQ-Core.
    Uses time-based seeding to ensure consistency across requests.
    """
    
    SYMBOLS = ["BTC", "ETH", "SOL", "AVAX", "MATIC", "ARB", "OP", "LINK", "UNI", "AAVE"]
    CHAINS = ["ethereum", "solana", "polygon", "arbitrum", "optimism", "avalanche", "bsc"]
    EXCHANGES = ["binance", "coinbase", "kraken", "ftx", "okx", "bybit", "kucoin"]
    PATTERN_TYPES = ["wash_trading", "spoofing", "layering", "pump_dump", "front_running", "sandwich"]
    ENTITY_TYPES = ["whale", "market_maker", "dex_aggregator", "cex_hot_wallet", "smart_money", "retail"]
    
    def __init__(self, time_bucket_minutes: int = 5):
        """
        Initialize the synthetic data generator.
        
        Args:
            time_bucket_minutes: Time bucket size for seeding (default 5 minutes)
        """
        self.time_bucket_minutes = time_bucket_minutes
    
    def _get_seed(self, category: str = "") -> int:
        """Get a deterministic seed based on current time bucket and category."""
        now = datetime.utcnow()
        bucket = now.replace(
            minute=(now.minute // self.time_bucket_minutes) * self.time_bucket_minutes,
            second=0,
            microsecond=0
        )
        seed_str = f"{bucket.isoformat()}-{category}"
        return int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    
    def _seeded_random(self, category: str = "") -> random.Random:
        """Get a seeded random generator for deterministic output."""
        rng = random.Random()
        rng.seed(self._get_seed(category))
        return rng
    
    def generate_risk(self) -> Dict[str, Any]:
        """Generate synthetic risk data."""
        rng = self._seeded_random("risk")
        
        overall_score = rng.uniform(0.3, 0.9)
        threat_level = "critical" if overall_score > 0.8 else "high" if overall_score > 0.6 else "medium" if overall_score > 0.4 else "low"
        
        distribution = {
            "manipulation": rng.randint(5, 30),
            "whale": rng.randint(3, 20),
            "darkpool": rng.randint(2, 15),
            "stablecoin": rng.randint(1, 10)
        }
        
        top_risks = []
        for i in range(5):
            top_risks.append({
                "id": f"risk-{i+1}",
                "symbol": rng.choice(self.SYMBOLS),
                "type": rng.choice(self.PATTERN_TYPES),
                "score": rng.uniform(0.5, 1.0),
                "chain": rng.choice(self.CHAINS),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 60))).isoformat()
            })
        
        return {
            "overall_score": round(overall_score, 3),
            "threat_level": threat_level,
            "distribution": distribution,
            "top_risks": top_risks,
            "trend": rng.choice(["increasing", "stable", "decreasing"])
        }
    
    def generate_whales(self) -> Dict[str, Any]:
        """Generate synthetic whale data."""
        rng = self._seeded_random("whales")
        
        top_whales = []
        for i in range(10):
            top_whales.append({
                "id": f"whale-{i+1}",
                "address": f"0x{rng.getrandbits(160):040x}",
                "label": rng.choice(["Smart Money", "Market Maker", "CEX Hot Wallet", "DeFi Whale", "Unknown"]),
                "balance_usd": rng.uniform(1e6, 1e9),
                "pnl_24h": rng.uniform(-0.1, 0.2),
                "activity_score": rng.uniform(0.3, 1.0),
                "chains": rng.sample(self.CHAINS, rng.randint(1, 3))
            })
        
        recent_movements = []
        for i in range(5):
            recent_movements.append({
                "id": f"movement-{i+1}",
                "whale_id": f"whale-{rng.randint(1, 10)}",
                "type": rng.choice(["transfer", "swap", "deposit", "withdraw"]),
                "amount_usd": rng.uniform(1e5, 1e8),
                "token": rng.choice(self.SYMBOLS),
                "chain": rng.choice(self.CHAINS),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 30))).isoformat()
            })
        
        return {
            "total_whales": rng.randint(100, 500),
            "active_24h": rng.randint(20, 100),
            "total_volume": rng.uniform(1e9, 1e11),
            "top_whales": top_whales,
            "recent_movements": recent_movements
        }
    
    def generate_trends(self) -> Dict[str, Any]:
        """Generate synthetic trend data including weekly heatmap."""
        rng = self._seeded_random("trends")
        
        hourly_activity = []
        for i in range(24):
            hourly_activity.append({
                "hour": f"{i}:00",
                "value": rng.randint(10, 100),
                "type": rng.choice(["manipulation", "whale", "darkpool", "stablecoin"])
            })
        
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        heatmap = []
        for day in days:
            for hour in range(24):
                base_value = 30 if 8 <= hour <= 20 else 10
                heatmap.append({
                    "day": day,
                    "hour": hour,
                    "value": rng.randint(max(0, base_value - 10), base_value + 40)
                })
        
        events = []
        for i in range(10):
            events.append({
                "id": f"event-{i+1}",
                "type": rng.choice(["manipulation", "whale", "darkpool", "stablecoin"]),
                "description": f"Synthetic event {i+1}",
                "severity": rng.choice(["high", "medium", "low"]),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 120))).isoformat()
            })
        
        return {
            "hourly_activity": hourly_activity,
            "heatmap": heatmap,
            "events": events,
            "categories": ["manipulation", "whale", "darkpool", "stablecoin"]
        }
    
    def generate_map(self) -> Dict[str, Any]:
        """Generate synthetic map data."""
        rng = self._seeded_random("map")
        
        hot_zones = []
        for i in range(5):
            hot_zones.append({
                "id": f"zone-{i+1}",
                "chain": rng.choice(self.CHAINS),
                "intensity": rng.uniform(0.3, 1.0),
                "event_count": rng.randint(5, 50),
                "coordinates": {"lat": rng.uniform(-90, 90), "lng": rng.uniform(-180, 180)}
            })
        
        connections = []
        for i in range(10):
            connections.append({
                "id": f"connection-{i+1}",
                "source": rng.choice(self.CHAINS),
                "target": rng.choice(self.CHAINS),
                "volume": rng.uniform(1e5, 1e8),
                "type": rng.choice(["bridge", "swap", "transfer"])
            })
        
        return {
            "hot_zones": hot_zones,
            "connections": connections,
            "total_events": rng.randint(100, 1000)
        }
    
    def generate_anomalies(self) -> Dict[str, Any]:
        """Generate synthetic anomaly data."""
        rng = self._seeded_random("anomalies")
        
        outliers = []
        for i in range(8):
            outliers.append({
                "id": f"outlier-{i+1}",
                "symbol": rng.choice(self.SYMBOLS),
                "type": rng.choice(self.PATTERN_TYPES),
                "deviation": rng.uniform(2.0, 10.0),
                "severity": rng.choice(["critical", "high", "medium"]),
                "chain": rng.choice(self.CHAINS),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 60))).isoformat()
            })
        
        patterns = []
        for i in range(5):
            patterns.append({
                "id": f"pattern-{i+1}",
                "name": rng.choice(["Unusual Volume Spike", "Price Manipulation", "Coordinated Trading", "Flash Crash", "Liquidity Drain"]),
                "confidence": rng.uniform(0.6, 1.0),
                "affected_symbols": rng.sample(self.SYMBOLS, rng.randint(1, 3))
            })
        
        return {
            "total_anomalies": rng.randint(10, 50),
            "critical_count": rng.randint(1, 10),
            "outliers": outliers,
            "patterns": patterns
        }
    
    def generate_entities(self) -> Dict[str, Any]:
        """Generate synthetic entity data."""
        rng = self._seeded_random("entities")
        
        entities = []
        for i in range(15):
            entities.append({
                "id": f"entity-{i+1}",
                "address": f"0x{rng.getrandbits(160):040x}",
                "type": rng.choice(self.ENTITY_TYPES),
                "label": f"Entity {i+1}",
                "risk_score": rng.uniform(0.1, 1.0),
                "activity_count": rng.randint(10, 1000),
                "chains": rng.sample(self.CHAINS, rng.randint(1, 4)),
                "last_active": (datetime.utcnow() - timedelta(hours=rng.randint(1, 48))).isoformat()
            })
        
        categories = {
            "whale": rng.randint(10, 50),
            "market_maker": rng.randint(5, 20),
            "dex_aggregator": rng.randint(3, 15),
            "cex_hot_wallet": rng.randint(5, 25),
            "smart_money": rng.randint(8, 40),
            "retail": rng.randint(50, 200)
        }
        
        return {
            "total_entities": sum(categories.values()),
            "entities": entities,
            "categories": categories
        }
    
    def generate_narratives(self) -> Dict[str, Any]:
        """Generate synthetic narrative data."""
        rng = self._seeded_random("narratives")
        
        narratives = [
            "Market showing increased manipulation activity in DeFi sector",
            "Whale accumulation detected across major L2 chains",
            "Unusual stablecoin flows between centralized exchanges",
            "Smart money rotating from ETH to SOL ecosystem",
            "Darkpool activity suggests institutional positioning"
        ]
        
        top_threats = []
        for i in range(3):
            top_threats.append({
                "id": f"threat-{i+1}",
                "title": rng.choice(["Wash Trading Alert", "Spoofing Detected", "Pump & Dump Warning", "Front-Running Activity"]),
                "severity": rng.choice(["critical", "high"]),
                "affected_symbols": rng.sample(self.SYMBOLS, rng.randint(1, 3)),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(5, 60))).isoformat()
            })
        
        topics = []
        for topic in ["DeFi Security", "Whale Movements", "Market Manipulation", "Cross-Chain Activity"]:
            topics.append({
                "name": topic,
                "mentions": rng.randint(10, 100),
                "sentiment": rng.choice(["positive", "neutral", "negative"])
            })
        
        return {
            "summary": rng.choice(narratives),
            "top_threats": top_threats,
            "topics": topics,
            "sentiment": rng.choice(["bullish", "bearish", "neutral"])
        }
    
    def generate_rings(self) -> Dict[str, Any]:
        """Generate synthetic ring detection data."""
        rng = self._seeded_random("rings")
        
        rings = []
        ring_count = rng.randint(3, 12)
        
        for i in range(ring_count):
            node_count = rng.randint(3, 15)
            severity = rng.choice(["high", "medium", "low"])
            
            nodes = []
            for j in range(node_count):
                nodes.append({
                    "id": f"node-{i}-{j}",
                    "address": f"0x{rng.getrandbits(160):040x}",
                    "type": rng.choice(["whale", "manipulation", "darkpool", "smartmoney"]),
                    "activity_count": rng.randint(1, 50)
                })
            
            rings.append({
                "id": f"ring-{i+1}",
                "name": f"Ring {chr(65 + i)}",
                "nodes": nodes,
                "severity": severity,
                "score": rng.uniform(0.3, 1.0),
                "activity_count": sum(n["activity_count"] for n in nodes),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(5, 120))).isoformat(),
                "chains": rng.sample(self.CHAINS, rng.randint(1, 3)),
                "tokens": rng.sample(self.SYMBOLS, rng.randint(1, 4)),
                "pattern_type": rng.choice(self.PATTERN_TYPES),
                "confidence": rng.uniform(0.5, 1.0),
                "volume": rng.uniform(1e5, 1e8)
            })
        
        severity_distribution = {
            "high": sum(1 for r in rings if r["severity"] == "high"),
            "medium": sum(1 for r in rings if r["severity"] == "medium"),
            "low": sum(1 for r in rings if r["severity"] == "low")
        }
        
        return {
            "total_rings": ring_count,
            "active_rings": rng.randint(1, ring_count),
            "rings": rings,
            "severity_distribution": severity_distribution
        }
    
    def generate_system_status(self, is_real_mode: bool = False) -> Dict[str, Any]:
        """Generate synthetic system status data."""
        rng = self._seeded_random("system")
        
        return {
            "websocket": {
                "status": "connected" if is_real_mode else "fallback",
                "clients": rng.randint(1, 10),
                "latency_ms": rng.randint(10, 100)
            },
            "worker": {
                "status": "running" if is_real_mode else "fallback",
                "pid": rng.randint(1000, 9999),
                "events_processed": rng.randint(100, 10000),
                "errors": rng.randint(0, 5)
            },
            "redis": {
                "status": "connected" if is_real_mode else "fallback",
                "latency_ms": rng.randint(5, 50),
                "total_events": rng.randint(1000, 100000)
            },
            "engines": {
                "manipulation": "active",
                "whale": "active",
                "darkpool": "active",
                "stablecoin": "active",
                "ring_detector": "active",
                "constellation": "active"
            },
            "uptime_seconds": rng.randint(3600, 86400),
            "mode": "real-time" if is_real_mode else "fallback"
        }
    
    def generate_ecosystems(self) -> List[Dict[str, Any]]:
        """Generate synthetic ecosystem data for all chains."""
        rng = self._seeded_random("ecosystems")
        
        # Base data for each chain (realistic values)
        chain_base_data = {
            "ethereum": {"tvl": 45e9, "emi_base": 85, "stage": "mature_or_declining"},
            "solana": {"tvl": 8.5e9, "emi_base": 78, "stage": "rapid_growth"},
            "arbitrum": {"tvl": 3.2e9, "emi_base": 72, "stage": "explosive_growth"},
            "base": {"tvl": 2.1e9, "emi_base": 68, "stage": "explosive_growth"},
            "optimism": {"tvl": 1.8e9, "emi_base": 65, "stage": "steady_growth"},
            "polygon": {"tvl": 1.5e9, "emi_base": 62, "stage": "steady_growth"},
            "avalanche": {"tvl": 1.2e9, "emi_base": 58, "stage": "steady_growth"},
            "bsc": {"tvl": 5.5e9, "emi_base": 55, "stage": "mature_or_declining"},
            "sui": {"tvl": 0.8e9, "emi_base": 52, "stage": "emerging"},
            "aptos": {"tvl": 0.65e9, "emi_base": 48, "stage": "emerging"},
            "fantom": {"tvl": 0.3e9, "emi_base": 42, "stage": "mature_or_declining"},
            "celo": {"tvl": 0.2e9, "emi_base": 38, "stage": "emerging"},
            "gnosis": {"tvl": 0.4e9, "emi_base": 45, "stage": "steady_growth"},
            "zksync": {"tvl": 0.5e9, "emi_base": 55, "stage": "emerging"},
            "linea": {"tvl": 0.35e9, "emi_base": 50, "stage": "emerging"},
        }
        
        ecosystems = []
        
        for chain, base in chain_base_data.items():
            # Add some randomness
            emi_score = base["emi_base"] + rng.uniform(-5, 5)
            tvl = base["tvl"] * rng.uniform(0.95, 1.05)
            delta_24h = rng.uniform(-5, 10)
            whale_activity_score = rng.uniform(30, 90)
            bridge_flow_score = rng.uniform(20, 80)
            stability_score = rng.uniform(40, 85)
            
            # Determine risk level
            if emi_score >= 70:
                risk_level = "low"
            elif emi_score >= 50:
                risk_level = "medium"
            elif emi_score >= 35:
                risk_level = "high"
            else:
                risk_level = "critical"
            
            ecosystems.append({
                "chain": chain,
                "emi_score": round(emi_score, 1),
                "ecosystem_stage": base["stage"],
                "tvl": tvl,
                "delta_24h": round(delta_24h, 2),
                "whale_activity_score": round(whale_activity_score, 1),
                "bridge_flow_score": round(bridge_flow_score, 1),
                "risk_level": risk_level,
                "growth_phase": base["stage"],
                "stability_score": round(stability_score, 1),
                "synthetic": True
            })
        
        # Sort by EMI score
        ecosystems.sort(key=lambda x: x["emi_score"], reverse=True)
        
        return ecosystems
    
    def generate_ecosystem(self, chain: str) -> Dict[str, Any]:
        """Generate synthetic data for a single ecosystem with analysis."""
        rng = self._seeded_random(f"ecosystem-{chain}")
        
        ecosystems = self.generate_ecosystems()
        
        # Find the ecosystem or create a default
        ecosystem = None
        for eco in ecosystems:
            if eco["chain"].lower() == chain.lower():
                ecosystem = eco
                break
        
        if not ecosystem:
            # Generate default ecosystem for unknown chain
            ecosystem = {
                "chain": chain,
                "emi_score": round(rng.uniform(30, 70), 1),
                "ecosystem_stage": rng.choice(["explosive_growth", "rapid_growth", "steady_growth", "emerging", "mature_or_declining"]),
                "tvl": rng.uniform(0.1e9, 1e9),
                "delta_24h": round(rng.uniform(-5, 10), 2),
                "whale_activity_score": round(rng.uniform(30, 70), 1),
                "bridge_flow_score": round(rng.uniform(20, 60), 1),
                "risk_level": rng.choice(["low", "medium", "high", "critical"]),
                "growth_phase": rng.choice(["explosive_growth", "rapid_growth", "steady_growth", "emerging", "mature_or_declining"]),
                "stability_score": round(rng.uniform(40, 70), 1),
                "synthetic": True
            }
        
        emi_score = ecosystem.get("emi_score", 50)
        
        # Generate analysis data
        analysis = {
            "emi_score": emi_score,
            "emi_raw": emi_score + rng.uniform(-2, 2),
            "deltas": {
                "tvl_24h_pct": ecosystem.get("delta_24h", 0) + rng.uniform(-2, 2),
                "wallets_24h_pct": rng.uniform(-5, 15),
                "volume_24h_pct": rng.uniform(-10, 20),
                "bridge_net_24h_usd": rng.uniform(-50e6, 100e6)
            },
            "contributions": [
                {
                    "metric": "TVL Growth",
                    "value": rng.uniform(0.5, 2.0),
                    "weight": 0.30,
                    "contribution": rng.uniform(10, 30),
                    "note": "Total value locked momentum"
                },
                {
                    "metric": "Wallet Activity",
                    "value": rng.uniform(0.8, 1.5),
                    "weight": 0.25,
                    "contribution": rng.uniform(8, 25),
                    "note": "Active wallet growth"
                },
                {
                    "metric": "Volume",
                    "value": rng.uniform(0.6, 1.8),
                    "weight": 0.25,
                    "contribution": rng.uniform(8, 25),
                    "note": "Transaction volume trend"
                },
                {
                    "metric": "Bridge Flows",
                    "value": rng.uniform(0.4, 1.2),
                    "weight": 0.20,
                    "contribution": rng.uniform(5, 20),
                    "note": "Cross-chain capital flow"
                }
            ],
            "top_drivers": [
                {"metric": "TVL Growth", "contribution_pct": rng.uniform(25, 40)},
                {"metric": "Wallet Activity", "contribution_pct": rng.uniform(20, 35)},
                {"metric": "Volume", "contribution_pct": rng.uniform(15, 30)},
                {"metric": "Bridge Flows", "contribution_pct": rng.uniform(10, 25)}
            ],
            "rationale": self._generate_ecosystem_rationale(ecosystem),
            "stage": ecosystem.get("ecosystem_stage", "emerging")
        }
        
        # Sort top_drivers by contribution
        analysis["top_drivers"].sort(key=lambda x: x["contribution_pct"], reverse=True)
        
        return {
            "ecosystem": ecosystem,
            "analysis": analysis
        }
    
    def _generate_ecosystem_rationale(self, ecosystem: Dict[str, Any]) -> str:
        """Generate a rationale string for the ecosystem."""
        chain = ecosystem.get("chain", "Unknown").capitalize()
        stage = ecosystem.get("ecosystem_stage", "emerging").replace("_", " ")
        emi = ecosystem.get("emi_score", 50)
        whale_score = ecosystem.get("whale_activity_score", 50)
        bridge_score = ecosystem.get("bridge_flow_score", 50)
        
        if emi >= 70:
            momentum = "strong momentum"
        elif emi >= 50:
            momentum = "moderate momentum"
        else:
            momentum = "developing momentum"
        
        whale_activity = "high whale activity" if whale_score >= 60 else "moderate whale activity" if whale_score >= 40 else "low whale activity"
        bridge_activity = "significant bridge flows" if bridge_score >= 60 else "moderate bridge flows" if bridge_score >= 40 else "limited bridge flows"
        
        return f"{chain} is in {stage} phase with {momentum}. The ecosystem shows {whale_activity} and {bridge_activity}, indicating {'strong' if emi >= 60 else 'growing'} institutional interest."

    def generate_overview(self) -> Dict[str, Any]:
        """Generate synthetic overview data combining all modules."""
        return {
            "risk": self.generate_risk(),
            "whales": self.generate_whales(),
            "rings": self.generate_rings(),
            "anomalies": self.generate_anomalies(),
            "system": self.generate_system_status()
        }

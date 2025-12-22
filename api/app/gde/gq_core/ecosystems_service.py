"""
GQ-Core Ecosystems Service

Provides ecosystem intelligence data with real-first + synthetic fallback.
Integrates with Whale Intelligence, Bridge Monitor, and Risk engines.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

from app.gde.gq_core.service import GQCoreService, get_gq_core_service
from app.gde.fabric.redis_bus import RedisBus

logger = logging.getLogger(__name__)

# Ecosystem chain configurations
ECOSYSTEM_CHAINS = [
    "ethereum", "solana", "arbitrum", "base", "optimism", 
    "polygon", "avalanche", "bsc", "sui", "aptos",
    "fantom", "celo", "gnosis", "zksync", "linea"
]

GROWTH_PHASES = ["explosive_growth", "rapid_growth", "steady_growth", "emerging", "mature_or_declining"]
RISK_LEVELS = ["low", "medium", "high", "critical"]


class EcosystemsService:
    """
    Ecosystem Intelligence Service with GQ-Core integration.
    
    Provides real-first + synthetic fallback for ecosystem data,
    ensuring tiles never show "Failed to load" states.
    """
    
    def __init__(self):
        self.gq_core = get_gq_core_service()
        self.redis_bus = RedisBus()
        self._cache: Dict[str, tuple] = {}
        self._cache_ttl = 60  # 60 seconds cache for ecosystem data
    
    async def get_ecosystems(self) -> Dict[str, Any]:
        """
        Get all ecosystem data with real-first + synthetic fallback.
        
        Returns:
            Dict with source, timestamp, and ecosystems data
        """
        return await self.gq_core.get_with_fallback(
            kind="ecosystems",
            real_fn=self._fetch_real_ecosystems,
            synthetic_fn=self._generate_synthetic_ecosystems
        )
    
    async def get_ecosystem(self, chain: str) -> Dict[str, Any]:
        """
        Get single ecosystem data with analysis.
        
        Args:
            chain: The blockchain chain name (e.g., "ethereum", "solana")
        
        Returns:
            Dict with source, timestamp, and ecosystem detail data
        """
        chain_lower = chain.lower()
        return await self.gq_core.get_with_fallback(
            kind=f"ecosystem:{chain_lower}",
            real_fn=lambda: self._fetch_real_ecosystem(chain_lower),
            synthetic_fn=lambda: self._generate_synthetic_ecosystem(chain_lower)
        )
    
    async def _fetch_real_ecosystems(self) -> Optional[List[Dict[str, Any]]]:
        """Fetch real ecosystem data from Redis/backend sources."""
        try:
            # Try to get ecosystem data from Redis channels
            ecosystem_events = await self._get_redis_data("intel.ecosystems", count=50)
            whale_events = await self._get_redis_data("intel.whales", count=50)
            bridge_events = await self._get_redis_data("intel.bridges", count=50)
            
            if not ecosystem_events and not whale_events and not bridge_events:
                return None
            
            # Aggregate real data into ecosystem format
            ecosystems = []
            chain_data: Dict[str, Dict] = {}
            
            # Process ecosystem events
            for event in ecosystem_events:
                chain = event.get("chain", "").lower()
                if chain and chain in ECOSYSTEM_CHAINS:
                    if chain not in chain_data:
                        chain_data[chain] = self._init_chain_data(chain)
                    chain_data[chain]["tvl"] += event.get("tvl", 0)
                    chain_data[chain]["volume_24h"] += event.get("volume", 0)
            
            # Process whale events for whale_activity_score
            for event in whale_events:
                chain = event.get("chain", "").lower()
                if chain and chain in chain_data:
                    chain_data[chain]["whale_count"] += 1
                    chain_data[chain]["whale_volume"] += event.get("value", 0)
            
            # Process bridge events for bridge_flow_score
            for event in bridge_events:
                source_chain = event.get("source_chain", "").lower()
                target_chain = event.get("target_chain", "").lower()
                volume = event.get("volume", 0)
                
                if source_chain in chain_data:
                    chain_data[source_chain]["bridge_outflow"] += volume
                if target_chain in chain_data:
                    chain_data[target_chain]["bridge_inflow"] += volume
            
            # Convert to ecosystem objects
            for chain, data in chain_data.items():
                ecosystems.append(self._build_ecosystem_from_data(chain, data))
            
            # Sort by EMI score
            ecosystems.sort(key=lambda x: x["emi_score"], reverse=True)
            
            return ecosystems if ecosystems else None
            
        except Exception as e:
            logger.error(f"Error fetching real ecosystem data: {e}")
            return None
    
    async def _fetch_real_ecosystem(self, chain: str) -> Optional[Dict[str, Any]]:
        """Fetch real data for a single ecosystem."""
        try:
            ecosystems = await self._fetch_real_ecosystems()
            if ecosystems:
                for eco in ecosystems:
                    if eco.get("chain", "").lower() == chain.lower():
                        return self._add_analysis_to_ecosystem(eco)
            return None
        except Exception as e:
            logger.error(f"Error fetching real ecosystem data for {chain}: {e}")
            return None
    
    async def _get_redis_data(self, channel: str, count: int = 10) -> list:
        """Get latest data from a Redis channel."""
        if not self.redis_bus.enabled:
            return []
        
        try:
            messages = await self.redis_bus.get_latest(channel, count=count)
            import json
            parsed = []
            for msg in messages:
                if isinstance(msg, str):
                    try:
                        parsed.append(json.loads(msg))
                    except json.JSONDecodeError:
                        pass
            return parsed
        except Exception:
            return []
    
    def _init_chain_data(self, chain: str) -> Dict[str, Any]:
        """Initialize chain data structure."""
        return {
            "chain": chain,
            "tvl": 0,
            "volume_24h": 0,
            "whale_count": 0,
            "whale_volume": 0,
            "bridge_inflow": 0,
            "bridge_outflow": 0,
        }
    
    def _build_ecosystem_from_data(self, chain: str, data: Dict) -> Dict[str, Any]:
        """Build ecosystem object from aggregated data."""
        # Calculate scores
        whale_activity_score = min(100, (data["whale_count"] * 5) + (data["whale_volume"] / 1e8))
        bridge_flow_score = min(100, ((data["bridge_inflow"] + data["bridge_outflow"]) / 1e9) * 50)
        
        # Calculate EMI score (weighted composite)
        tvl_score = min(100, (data["tvl"] / 1e10) * 100)
        volume_score = min(100, (data["volume_24h"] / 1e9) * 100)
        
        emi_score = (
            tvl_score * 0.30 +
            volume_score * 0.25 +
            whale_activity_score * 0.25 +
            bridge_flow_score * 0.20
        )
        
        # Determine growth phase based on metrics
        if emi_score >= 75:
            growth_phase = "explosive_growth"
        elif emi_score >= 60:
            growth_phase = "rapid_growth"
        elif emi_score >= 45:
            growth_phase = "steady_growth"
        elif emi_score >= 30:
            growth_phase = "emerging"
        else:
            growth_phase = "mature_or_declining"
        
        # Calculate risk level
        risk_score = 100 - emi_score + (100 - whale_activity_score) * 0.3
        if risk_score >= 70:
            risk_level = "critical"
        elif risk_score >= 50:
            risk_level = "high"
        elif risk_score >= 30:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Calculate stability score
        stability_score = min(100, max(0, 50 + (tvl_score - volume_score) * 0.5))
        
        return {
            "chain": chain,
            "emi_score": round(emi_score, 1),
            "ecosystem_stage": growth_phase,
            "tvl": data["tvl"],
            "delta_24h": round((data["volume_24h"] / max(data["tvl"], 1)) * 100, 2),
            "whale_activity_score": round(whale_activity_score, 1),
            "bridge_flow_score": round(bridge_flow_score, 1),
            "risk_level": risk_level,
            "growth_phase": growth_phase,
            "stability_score": round(stability_score, 1),
            "synthetic": False
        }
    
    def _generate_synthetic_ecosystems(self) -> List[Dict[str, Any]]:
        """Generate synthetic ecosystem data."""
        import random
        import hashlib
        
        # Use time-based seeding for consistency
        now = datetime.utcnow()
        bucket = now.replace(minute=(now.minute // 5) * 5, second=0, microsecond=0)
        seed_str = f"{bucket.isoformat()}-ecosystems"
        seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)
        
        ecosystems = []
        
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
        
        for chain in ECOSYSTEM_CHAINS:
            base = chain_base_data.get(chain, {"tvl": 0.1e9, "emi_base": 40, "stage": "emerging"})
            
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
    
    def _generate_synthetic_ecosystem(self, chain: str) -> Dict[str, Any]:
        """Generate synthetic data for a single ecosystem with analysis."""
        ecosystems = self._generate_synthetic_ecosystems()
        
        # Find the ecosystem or create a default
        ecosystem = None
        for eco in ecosystems:
            if eco["chain"].lower() == chain.lower():
                ecosystem = eco
                break
        
        if not ecosystem:
            # Generate default ecosystem for unknown chain
            import random
            import hashlib
            
            now = datetime.utcnow()
            bucket = now.replace(minute=(now.minute // 5) * 5, second=0, microsecond=0)
            seed_str = f"{bucket.isoformat()}-ecosystem-{chain}"
            seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
            rng = random.Random(seed)
            
            ecosystem = {
                "chain": chain,
                "emi_score": round(rng.uniform(30, 70), 1),
                "ecosystem_stage": rng.choice(GROWTH_PHASES),
                "tvl": rng.uniform(0.1e9, 1e9),
                "delta_24h": round(rng.uniform(-5, 10), 2),
                "whale_activity_score": round(rng.uniform(30, 70), 1),
                "bridge_flow_score": round(rng.uniform(20, 60), 1),
                "risk_level": rng.choice(RISK_LEVELS),
                "growth_phase": rng.choice(GROWTH_PHASES),
                "stability_score": round(rng.uniform(40, 70), 1),
                "synthetic": True
            }
        
        return self._add_analysis_to_ecosystem(ecosystem)
    
    def _add_analysis_to_ecosystem(self, ecosystem: Dict[str, Any]) -> Dict[str, Any]:
        """Add detailed analysis to an ecosystem object."""
        import random
        import hashlib
        
        chain = ecosystem.get("chain", "unknown")
        now = datetime.utcnow()
        bucket = now.replace(minute=(now.minute // 5) * 5, second=0, microsecond=0)
        seed_str = f"{bucket.isoformat()}-analysis-{chain}"
        seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)
        
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
            "rationale": self._generate_rationale(ecosystem),
            "stage": ecosystem.get("ecosystem_stage", "emerging")
        }
        
        # Sort top_drivers by contribution
        analysis["top_drivers"].sort(key=lambda x: x["contribution_pct"], reverse=True)
        
        return {
            "ecosystem": ecosystem,
            "analysis": analysis
        }
    
    def _generate_rationale(self, ecosystem: Dict[str, Any]) -> str:
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


# Singleton instance
_ecosystems_service: Optional[EcosystemsService] = None


def get_ecosystems_service() -> EcosystemsService:
    """Get or create the EcosystemsService singleton."""
    global _ecosystems_service
    if _ecosystems_service is None:
        _ecosystems_service = EcosystemsService()
    return _ecosystems_service

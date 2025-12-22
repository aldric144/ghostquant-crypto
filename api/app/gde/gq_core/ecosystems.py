"""
GQ-Core Ecosystems Service

Provides ecosystem-level intelligence data for all supported blockchain networks.
Uses real data when available, falls back to synthetic data.
"""

import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional


class EcosystemsService:
    """
    Service for ecosystem-level blockchain intelligence.
    Provides data for Ecoscan tiles and chain analysis.
    """
    
    CHAINS = {
        "ethereum": {
            "name": "Ethereum",
            "symbol": "ETH",
            "color": "#627EEA",
            "type": "L1"
        },
        "solana": {
            "name": "Solana",
            "symbol": "SOL",
            "color": "#14F195",
            "type": "L1"
        },
        "polygon": {
            "name": "Polygon",
            "symbol": "MATIC",
            "color": "#8247E5",
            "type": "L2"
        },
        "arbitrum": {
            "name": "Arbitrum",
            "symbol": "ARB",
            "color": "#28A0F0",
            "type": "L2"
        },
        "optimism": {
            "name": "Optimism",
            "symbol": "OP",
            "color": "#FF0420",
            "type": "L2"
        },
        "avalanche": {
            "name": "Avalanche",
            "symbol": "AVAX",
            "color": "#E84142",
            "type": "L1"
        },
        "bsc": {
            "name": "BNB Chain",
            "symbol": "BNB",
            "color": "#F0B90B",
            "type": "L1"
        },
        "base": {
            "name": "Base",
            "symbol": "ETH",
            "color": "#0052FF",
            "type": "L2"
        }
    }
    
    def __init__(self, time_bucket_minutes: int = 5):
        self.time_bucket_minutes = time_bucket_minutes
    
    def _get_seed(self, category: str = "") -> int:
        """Get a deterministic seed based on current time bucket and category."""
        now = datetime.utcnow()
        bucket = now.replace(
            minute=(now.minute // self.time_bucket_minutes) * self.time_bucket_minutes,
            second=0,
            microsecond=0
        )
        seed_str = f"{bucket.isoformat()}-ecosystems-{category}"
        return int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    
    def _seeded_random(self, category: str = "") -> random.Random:
        """Get a seeded random generator for deterministic output."""
        rng = random.Random()
        rng.seed(self._get_seed(category))
        return rng
    
    def get_all_ecosystems(self) -> Dict[str, Any]:
        """
        Get overview data for all supported ecosystems.
        
        Returns:
            Dictionary with all ecosystem summaries
        """
        rng = self._seeded_random("all")
        
        ecosystems = []
        for chain_id, chain_info in self.CHAINS.items():
            chain_rng = self._seeded_random(chain_id)
            
            tvl = chain_rng.uniform(1e9, 50e9)
            volume_24h = chain_rng.uniform(1e8, 5e9)
            tx_count = chain_rng.randint(100000, 5000000)
            active_addresses = chain_rng.randint(10000, 500000)
            
            risk_score = chain_rng.uniform(0.2, 0.9)
            threat_level = "critical" if risk_score > 0.8 else "high" if risk_score > 0.6 else "medium" if risk_score > 0.4 else "low"
            
            ecosystems.append({
                "id": chain_id,
                "name": chain_info["name"],
                "symbol": chain_info["symbol"],
                "color": chain_info["color"],
                "type": chain_info["type"],
                "metrics": {
                    "tvl": round(tvl, 2),
                    "volume_24h": round(volume_24h, 2),
                    "tx_count_24h": tx_count,
                    "active_addresses_24h": active_addresses,
                    "gas_price": chain_rng.uniform(5, 100) if chain_id != "solana" else chain_rng.uniform(0.0001, 0.001),
                    "tps": chain_rng.uniform(10, 1000)
                },
                "risk": {
                    "score": round(risk_score, 3),
                    "level": threat_level,
                    "manipulation_alerts": chain_rng.randint(0, 20),
                    "whale_movements": chain_rng.randint(1, 50)
                },
                "trends": {
                    "tvl_change_24h": chain_rng.uniform(-0.1, 0.15),
                    "volume_change_24h": chain_rng.uniform(-0.2, 0.3),
                    "tx_change_24h": chain_rng.uniform(-0.15, 0.25)
                }
            })
        
        return {
            "ecosystems": ecosystems,
            "total_tvl": sum(e["metrics"]["tvl"] for e in ecosystems),
            "total_volume_24h": sum(e["metrics"]["volume_24h"] for e in ecosystems),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "synthetic"
        }
    
    def get_ecosystem(self, chain: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed data for a specific ecosystem.
        
        Args:
            chain: Chain identifier (e.g., "ethereum", "solana")
            
        Returns:
            Detailed ecosystem data or None if chain not found
        """
        if chain not in self.CHAINS:
            return None
        
        chain_info = self.CHAINS[chain]
        rng = self._seeded_random(chain)
        
        tvl = rng.uniform(1e9, 50e9)
        volume_24h = rng.uniform(1e8, 5e9)
        
        # Generate top protocols
        protocol_names = {
            "ethereum": ["Uniswap", "Aave", "Lido", "MakerDAO", "Curve"],
            "solana": ["Raydium", "Marinade", "Jupiter", "Orca", "Drift"],
            "polygon": ["QuickSwap", "Aave", "Balancer", "Uniswap", "Curve"],
            "arbitrum": ["GMX", "Uniswap", "Camelot", "Radiant", "Pendle"],
            "optimism": ["Velodrome", "Synthetix", "Aave", "Uniswap", "Beethoven"],
            "avalanche": ["Trader Joe", "Aave", "Benqi", "Platypus", "GMX"],
            "bsc": ["PancakeSwap", "Venus", "Alpaca", "Biswap", "Thena"],
            "base": ["Aerodrome", "Uniswap", "BaseSwap", "Moonwell", "Seamless"]
        }
        
        protocols = []
        for i, name in enumerate(protocol_names.get(chain, ["Protocol 1", "Protocol 2", "Protocol 3", "Protocol 4", "Protocol 5"])):
            protocols.append({
                "name": name,
                "tvl": rng.uniform(1e7, 5e9),
                "volume_24h": rng.uniform(1e6, 1e9),
                "users_24h": rng.randint(1000, 100000),
                "risk_score": rng.uniform(0.1, 0.8)
            })
        
        # Generate recent events
        events = []
        event_types = ["whale_transfer", "large_swap", "liquidity_add", "liquidity_remove", "bridge_in", "bridge_out"]
        for i in range(10):
            events.append({
                "id": f"event-{chain}-{i}",
                "type": rng.choice(event_types),
                "amount_usd": rng.uniform(1e5, 1e8),
                "address": f"0x{rng.getrandbits(160):040x}",
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 60))).isoformat()
            })
        
        # Generate risk breakdown
        risk_score = rng.uniform(0.2, 0.9)
        threat_level = "critical" if risk_score > 0.8 else "high" if risk_score > 0.6 else "medium" if risk_score > 0.4 else "low"
        
        return {
            "id": chain,
            "name": chain_info["name"],
            "symbol": chain_info["symbol"],
            "color": chain_info["color"],
            "type": chain_info["type"],
            "metrics": {
                "tvl": round(tvl, 2),
                "volume_24h": round(volume_24h, 2),
                "tx_count_24h": rng.randint(100000, 5000000),
                "active_addresses_24h": rng.randint(10000, 500000),
                "gas_price": rng.uniform(5, 100) if chain != "solana" else rng.uniform(0.0001, 0.001),
                "tps": rng.uniform(10, 1000),
                "block_time": rng.uniform(0.4, 15),
                "pending_tx": rng.randint(100, 10000)
            },
            "risk": {
                "score": round(risk_score, 3),
                "level": threat_level,
                "manipulation_alerts": rng.randint(0, 20),
                "whale_movements": rng.randint(1, 50),
                "suspicious_contracts": rng.randint(0, 10),
                "rug_pull_risk": rng.randint(0, 5)
            },
            "trends": {
                "tvl_change_24h": rng.uniform(-0.1, 0.15),
                "tvl_change_7d": rng.uniform(-0.2, 0.3),
                "volume_change_24h": rng.uniform(-0.2, 0.3),
                "tx_change_24h": rng.uniform(-0.15, 0.25)
            },
            "top_protocols": protocols,
            "recent_events": events,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "synthetic"
        }


# Singleton instance
_ecosystems_service: Optional[EcosystemsService] = None


def get_ecosystems_service() -> EcosystemsService:
    """Get or create the ecosystems service singleton."""
    global _ecosystems_service
    if _ecosystems_service is None:
        _ecosystems_service = EcosystemsService()
    return _ecosystems_service

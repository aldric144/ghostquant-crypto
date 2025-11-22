"""
SyntheticDataGenerator - Generate realistic synthetic ML training data.
Pure Python implementation for testing and training GhostPredictor models.
"""

from typing import Dict, List, Any
import random
from datetime import datetime, timedelta


class SyntheticDataGenerator:
    """Generate realistic synthetic data for ML training and testing."""

    def __init__(self, seed: int = 42):
        """Initialize generator with deterministic seed."""
        self.seed = seed
        random.seed(seed)
        self.event_id_counter = 1000
        self.entity_id_counter = 5000

    def generate_synthetic_event(self) -> Dict[str, Any]:
        """Generate realistic synthetic event data."""
        try:
            event_types = ["whale", "manipulation", "normal", "darkpool", "ai", "flash", "arbitrage"]
            chains = ["ethereum", "bitcoin", "solana", "bnb", "polygon", "avalanche"]
            tokens = ["ETH", "BTC", "SOL", "USDT", "USDC", "BNB", "MATIC", "AVAX"]
            
            event_type = random.choice(event_types)
            
            if event_type == "whale":
                value = random.uniform(1_000_000, 50_000_000)
            elif event_type == "manipulation":
                value = random.uniform(500_000, 10_000_000)
            elif event_type == "darkpool":
                value = random.uniform(2_000_000, 100_000_000)
            else:
                value = random.uniform(1_000, 5_000_000)
            
            days_ago = random.uniform(0, 30)
            timestamp = datetime.utcnow() - timedelta(days=days_ago)
            
            event = {
                "id": f"evt_{self.event_id_counter}",
                "timestamp": timestamp.isoformat(),
                "value": value,
                "chain": random.choice(chains),
                "token": random.choice(tokens),
                "entity": f"entity_{random.randint(1000, 9999)}",
                "type": event_type,
                "volume": value * random.uniform(0.8, 1.2),
                "price_impact": random.uniform(0.001, 0.05) if event_type in ["whale", "manipulation"] else random.uniform(0, 0.002),
                "gas_used": random.randint(21000, 500000),
                "block_number": random.randint(18000000, 19000000),
                "confidence": random.uniform(0.6, 0.99),
                "metadata": {
                    "source": random.choice(["mempool", "confirmed", "pending"]),
                    "priority": random.choice(["high", "medium", "low"]),
                    "flags": random.sample(["suspicious", "verified", "whale", "new"], k=random.randint(0, 2))
                }
            }
            
            self.event_id_counter += 1
            return event
        
        except Exception:
            return {"id": "evt_error", "timestamp": datetime.utcnow().isoformat(), "value": 0}

    def generate_synthetic_entity(self) -> Dict[str, Any]:
        """Generate realistic synthetic entity metadata."""
        try:
            entity_types = ["whale", "institution", "manipulator", "smart_money", "retail", "bot", "mev"]
            
            entity_type = random.choice(entity_types)
            
            if entity_type == "whale":
                tx_count = random.randint(500, 5000)
                velocity = random.uniform(10, 100)
                token_diversity = random.randint(20, 100)
            elif entity_type == "institution":
                tx_count = random.randint(1000, 10000)
                velocity = random.uniform(50, 200)
                token_diversity = random.randint(10, 50)
            elif entity_type == "manipulator":
                tx_count = random.randint(200, 2000)
                velocity = random.uniform(20, 150)
                token_diversity = random.randint(5, 30)
            else:
                tx_count = random.randint(10, 500)
                velocity = random.uniform(1, 50)
                token_diversity = random.randint(1, 20)
            
            entity = {
                "id": f"entity_{self.entity_id_counter}",
                "address": f"0x{random.randint(10**39, 10**40-1):040x}",
                "type": entity_type,
                "tx_count": tx_count,
                "activity_velocity": velocity,
                "chain_footprint": random.sample(["ethereum", "bitcoin", "solana", "bnb", "polygon"], k=random.randint(1, 4)),
                "token_diversity": token_diversity,
                "total_volume": random.uniform(100_000, 500_000_000),
                "avg_tx_size": random.uniform(1_000, 10_000_000),
                "first_seen": (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
                "last_seen": (datetime.utcnow() - timedelta(days=random.uniform(0, 7))).isoformat(),
                "ring_membership_probability": random.uniform(0, 0.9) if entity_type == "manipulator" else random.uniform(0, 0.2),
                "risk_score": random.uniform(0.7, 0.99) if entity_type in ["manipulator", "mev"] else random.uniform(0, 0.5),
                "labels": random.sample(["verified", "suspicious", "whale", "bot", "new"], k=random.randint(0, 3))
            }
            
            self.entity_id_counter += 1
            return entity
        
        except Exception:
            return {"id": "entity_error", "address": "0x0", "type": "unknown"}

    def generate_synthetic_chain(self) -> Dict[str, Any]:
        """Generate realistic chain-level data."""
        try:
            chains = ["ethereum", "bitcoin", "solana", "bnb", "polygon", "avalanche"]
            chain_name = random.choice(chains)
            
            if chain_name == "ethereum":
                tps = random.uniform(12, 20)
                gas_price = random.uniform(20, 200)
                load = random.uniform(0.6, 0.95)
            elif chain_name == "solana":
                tps = random.uniform(2000, 5000)
                gas_price = random.uniform(0.00001, 0.0001)
                load = random.uniform(0.3, 0.8)
            elif chain_name == "bitcoin":
                tps = random.uniform(3, 7)
                gas_price = random.uniform(10, 100)
                load = random.uniform(0.5, 0.9)
            else:
                tps = random.uniform(50, 500)
                gas_price = random.uniform(1, 50)
                load = random.uniform(0.4, 0.85)
            
            chain = {
                "name": chain_name,
                "tps": tps,
                "gas_price": gas_price,
                "gas_limit": random.randint(10_000_000, 30_000_000),
                "load": load,
                "volatility": random.uniform(0.01, 0.15),
                "stablecoin_flows": random.uniform(10_000_000, 1_000_000_000),
                "mev_risk": random.uniform(0.1, 0.8),
                "congestion": load > 0.8,
                "block_time": random.uniform(2, 15),
                "active_addresses": random.randint(100_000, 10_000_000),
                "total_value_locked": random.uniform(1_000_000_000, 100_000_000_000),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return chain
        
        except Exception:
            return {"name": "unknown", "tps": 0, "gas_price": 0}

    def generate_synthetic_token(self) -> Dict[str, Any]:
        """Generate realistic token metadata."""
        try:
            token_types = ["stablecoin", "memecoin", "bluechip", "defi", "nft", "utility"]
            token_type = random.choice(token_types)
            
            symbols = {
                "stablecoin": ["USDT", "USDC", "DAI", "BUSD"],
                "memecoin": ["DOGE", "SHIB", "PEPE", "FLOKI"],
                "bluechip": ["ETH", "BTC", "BNB", "SOL"],
                "defi": ["UNI", "AAVE", "COMP", "SUSHI"],
                "nft": ["APE", "BLUR", "LOOKS"],
                "utility": ["LINK", "GRT", "FIL"]
            }
            
            symbol = random.choice(symbols.get(token_type, ["TOKEN"]))
            
            if token_type == "stablecoin":
                price = random.uniform(0.98, 1.02)
                volatility = random.uniform(0.001, 0.01)
                liquidity = random.uniform(100_000_000, 10_000_000_000)
            elif token_type == "memecoin":
                price = random.uniform(0.000001, 0.01)
                volatility = random.uniform(0.1, 0.5)
                liquidity = random.uniform(100_000, 50_000_000)
            elif token_type == "bluechip":
                price = random.uniform(100, 5000)
                volatility = random.uniform(0.02, 0.1)
                liquidity = random.uniform(1_000_000_000, 50_000_000_000)
            else:
                price = random.uniform(0.1, 100)
                volatility = random.uniform(0.03, 0.2)
                liquidity = random.uniform(1_000_000, 500_000_000)
            
            token = {
                "symbol": symbol,
                "type": token_type,
                "price": price,
                "price_24h_change": random.uniform(-0.2, 0.2),
                "price_7d_change": random.uniform(-0.4, 0.4),
                "volatility": volatility,
                "supply": random.uniform(1_000_000, 1_000_000_000_000),
                "circulating_supply": random.uniform(500_000, 500_000_000_000),
                "liquidity": liquidity,
                "holders": random.randint(1000, 10_000_000),
                "market_cap": price * random.uniform(1_000_000, 100_000_000_000),
                "volume_24h": random.uniform(100_000, 10_000_000_000),
                "risk_score": random.uniform(0.7, 0.95) if token_type == "memecoin" else random.uniform(0.1, 0.5),
                "is_verified": token_type in ["stablecoin", "bluechip"],
                "contract_age_days": random.randint(1, 2000),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return token
        
        except Exception:
            return {"symbol": "UNKNOWN", "type": "unknown", "price": 0}

    def generate_label(
        self, 
        event: Dict[str, Any], 
        entity: Dict[str, Any], 
        chain: Dict[str, Any], 
        token: Dict[str, Any]
    ) -> int:
        """Generate synthetic binary label based on combined features."""
        try:
            risk_score = 0.0
            
            event_type = event.get("type", "normal")
            if event_type in ["manipulation", "darkpool", "whale"]:
                risk_score += 0.3
            
            event_value = event.get("value", 0)
            if event_value > 10_000_000:
                risk_score += 0.2
            
            entity_type = entity.get("type", "retail")
            if entity_type in ["manipulator", "mev"]:
                risk_score += 0.3
            
            entity_risk = entity.get("risk_score", 0)
            risk_score += entity_risk * 0.2
            
            chain_load = chain.get("load", 0)
            if chain_load > 0.85:
                risk_score += 0.1
            
            mev_risk = chain.get("mev_risk", 0)
            risk_score += mev_risk * 0.1
            
            token_volatility = token.get("volatility", 0)
            if token_volatility > 0.2:
                risk_score += 0.15
            
            token_risk = token.get("risk_score", 0)
            risk_score += token_risk * 0.15
            
            risk_score += random.uniform(-0.1, 0.1)
            
            risk_score = max(0, min(1, risk_score))
            
            return 1 if risk_score >= 0.6 else 0
        
        except Exception:
            return 0

    def generate_row(self) -> Dict[str, Any]:
        """Generate one complete ML datapoint."""
        try:
            event = self.generate_synthetic_event()
            entity = self.generate_synthetic_entity()
            chain = self.generate_synthetic_chain()
            token = self.generate_synthetic_token()
            label = self.generate_label(event, entity, chain, token)
            
            return {
                "event": event,
                "entity": entity,
                "chain": chain,
                "token": token,
                "label": label
            }
        
        except Exception:
            return {
                "event": {},
                "entity": {},
                "chain": {},
                "token": {},
                "label": 0
            }

    def generate_dataset(self, n: int) -> List[Dict[str, Any]]:
        """Generate n rows of synthetic data."""
        try:
            dataset = []
            for i in range(n):
                row = self.generate_row()
                dataset.append(row)
            return dataset
        
        except Exception:
            return []

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
        """Generate synthetic narrative data for Genesis Archive.
        
        Returns narratives array with schema matching frontend expectations:
        {id, title, summary, category, severity, timestamp, tags, impact_score}
        """
        rng = self._seeded_random("narratives")
        
        # Categories for historical events
        categories = ["exploit", "manipulation", "regulation", "market", "protocol", "hack"]
        
        # Generate narrative events matching frontend schema
        narrative_templates = [
            ("Flash Loan Attack on DeFi Protocol", "A sophisticated flash loan attack drained $2.3M from a lending protocol through price oracle manipulation.", "exploit"),
            ("Whale Accumulation Pattern Detected", "Multiple whale wallets coordinated accumulation of ETH across L2 chains, signaling potential market movement.", "market"),
            ("Coordinated Wash Trading Ring Exposed", "Analysis revealed a network of 47 wallets engaged in systematic wash trading to inflate token volumes.", "manipulation"),
            ("Smart Contract Vulnerability Patched", "Critical reentrancy vulnerability discovered and patched in popular DEX aggregator before exploitation.", "protocol"),
            ("Regulatory Enforcement Action", "SEC issued cease and desist order against unregistered token offering, affecting market sentiment.", "regulation"),
            ("Cross-Chain Bridge Exploit", "Attacker exploited signature verification flaw in bridge contract, extracting $15M in wrapped assets.", "hack"),
            ("Market Manipulation via Social Media", "Coordinated pump-and-dump scheme identified through unusual social media activity patterns.", "manipulation"),
            ("Protocol Governance Attack Thwarted", "Attempted hostile governance takeover blocked by community vote after whale intervention.", "protocol"),
            ("Stablecoin Depeg Event Analysis", "Algorithmic stablecoin experienced 12% depeg due to cascading liquidations in DeFi protocols.", "market"),
            ("MEV Bot Network Disruption", "Major MEV bot operator ceased operations after losing $4M to sandwich attack counter-strategies.", "exploit"),
        ]
        
        narratives = []
        for i in range(min(10, len(narrative_templates))):
            title, summary, category = narrative_templates[i]
            severity = rng.choice(["critical", "high", "medium", "low"])
            
            # Generate relevant tags based on category
            tag_pool = {
                "exploit": ["flash-loan", "oracle", "reentrancy", "defi"],
                "manipulation": ["wash-trading", "pump-dump", "coordinated", "volume"],
                "regulation": ["sec", "enforcement", "compliance", "legal"],
                "market": ["whale", "accumulation", "sentiment", "volatility"],
                "protocol": ["governance", "vulnerability", "upgrade", "security"],
                "hack": ["bridge", "exploit", "theft", "recovery"]
            }
            tags = rng.sample(tag_pool.get(category, ["crypto", "blockchain"]), min(3, len(tag_pool.get(category, []))))
            
            narratives.append({
                "id": f"narrative-{i+1}",
                "title": title,
                "summary": summary,
                "category": category,
                "severity": severity,
                "timestamp": (datetime.utcnow() - timedelta(hours=rng.randint(1, 720))).isoformat(),
                "tags": tags,
                "impact_score": round(rng.uniform(0.3, 1.0), 2)
            })
        
        return {
            "narratives": narratives,
            "total_narratives": len(narratives),
            "categories": list(set(n["category"] for n in narratives))
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
    
    def generate_overview(self) -> Dict[str, Any]:
        """Generate synthetic overview data combining all modules."""
        return {
            "risk": self.generate_risk(),
            "whales": self.generate_whales(),
            "rings": self.generate_rings(),
            "anomalies": self.generate_anomalies(),
            "system": self.generate_system_status()
        }
    
    def generate_liquidity_pools(self, chain: str = "ethereum", timeframe: str = "24h") -> Dict[str, Any]:
        """Generate synthetic liquidity pool data."""
        rng = self._seeded_random(f"liquidity-{chain}-{timeframe}")
        
        pools = []
        for i in range(15):
            token_a = rng.choice(self.SYMBOLS)
            token_b = rng.choice([s for s in self.SYMBOLS if s != token_a])
            pools.append({
                "id": f"pool-{i+1}",
                "name": f"{token_a}/{token_b}",
                "token_a": token_a,
                "token_b": token_b,
                "tvl": rng.uniform(1e6, 1e9),
                "volume_24h": rng.uniform(1e5, 1e8),
                "apy": rng.uniform(0.01, 0.5),
                "fee_tier": rng.choice([0.0005, 0.003, 0.01]),
                "chain": chain,
                "protocol": rng.choice(["uniswap", "sushiswap", "curve", "balancer"]),
                "liquidity_change_24h": rng.uniform(-0.1, 0.15)
            })
        
        return {
            "chain": chain,
            "timeframe": timeframe,
            "total_tvl": sum(p["tvl"] for p in pools),
            "total_volume": sum(p["volume_24h"] for p in pools),
            "pools": pools,
            "top_gainers": sorted(pools, key=lambda x: x["liquidity_change_24h"], reverse=True)[:5],
            "top_losers": sorted(pools, key=lambda x: x["liquidity_change_24h"])[:5]
        }
    
    def generate_smart_money_tracker(self) -> Dict[str, Any]:
        """Generate synthetic smart money tracking data."""
        rng = self._seeded_random("smart-money")
        
        wallets = []
        for i in range(20):
            wallets.append({
                "id": f"sm-{i+1}",
                "address": f"0x{rng.getrandbits(160):040x}",
                "label": rng.choice(["Alameda", "Jump Trading", "Wintermute", "DWF Labs", "GSR", "Cumberland", "Unknown Smart Money"]),
                "pnl_7d": rng.uniform(-0.2, 0.5),
                "pnl_30d": rng.uniform(-0.3, 1.0),
                "win_rate": rng.uniform(0.4, 0.9),
                "avg_trade_size": rng.uniform(1e5, 1e7),
                "active_positions": rng.randint(1, 20),
                "last_trade": (datetime.utcnow() - timedelta(hours=rng.randint(1, 48))).isoformat()
            })
        
        recent_trades = []
        for i in range(10):
            recent_trades.append({
                "id": f"trade-{i+1}",
                "wallet": wallets[rng.randint(0, len(wallets)-1)]["address"],
                "action": rng.choice(["buy", "sell"]),
                "token": rng.choice(self.SYMBOLS),
                "amount_usd": rng.uniform(1e5, 1e7),
                "price_impact": rng.uniform(0.001, 0.05),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 120))).isoformat()
            })
        
        return {
            "total_wallets": len(wallets),
            "total_aum": sum(w["avg_trade_size"] * w["active_positions"] for w in wallets),
            "wallets": wallets,
            "recent_trades": recent_trades,
            "sentiment": rng.choice(["bullish", "bearish", "neutral"]),
            "top_holdings": rng.sample(self.SYMBOLS, 5)
        }
    
    def generate_volatility_monitor(self, regime: str = "all", timeframe: str = "24h") -> Dict[str, Any]:
        """Generate synthetic volatility monitoring data."""
        rng = self._seeded_random(f"volatility-{regime}-{timeframe}")
        
        assets = []
        for symbol in self.SYMBOLS:
            assets.append({
                "symbol": symbol,
                "current_vol": rng.uniform(0.2, 1.5),
                "historical_vol": rng.uniform(0.3, 1.0),
                "vol_change": rng.uniform(-0.3, 0.5),
                "regime": rng.choice(["low", "medium", "high", "extreme"]),
                "iv_rank": rng.uniform(0, 100),
                "hv_rank": rng.uniform(0, 100)
            })
        
        return {
            "regime": regime,
            "timeframe": timeframe,
            "market_vol_index": rng.uniform(20, 80),
            "vol_trend": rng.choice(["increasing", "decreasing", "stable"]),
            "assets": assets,
            "high_vol_alerts": [a for a in assets if a["regime"] == "extreme"][:5],
            "regime_distribution": {
                "low": sum(1 for a in assets if a["regime"] == "low"),
                "medium": sum(1 for a in assets if a["regime"] == "medium"),
                "high": sum(1 for a in assets if a["regime"] == "high"),
                "extreme": sum(1 for a in assets if a["regime"] == "extreme")
            }
        }
    
    def generate_sentiment_market(self) -> Dict[str, Any]:
        """Generate synthetic market sentiment data."""
        rng = self._seeded_random("sentiment")
        
        assets = []
        for symbol in self.SYMBOLS:
            assets.append({
                "symbol": symbol,
                "sentiment_score": rng.uniform(-1, 1),
                "social_volume": rng.randint(100, 10000),
                "news_sentiment": rng.uniform(-1, 1),
                "twitter_mentions": rng.randint(50, 5000),
                "reddit_mentions": rng.randint(10, 1000),
                "fear_greed_index": rng.randint(0, 100)
            })
        
        return {
            "overall_sentiment": rng.choice(["bullish", "bearish", "neutral", "extreme_fear", "extreme_greed"]),
            "fear_greed_index": rng.randint(0, 100),
            "social_volume_24h": sum(a["social_volume"] for a in assets),
            "assets": assets,
            "trending_topics": ["DeFi", "Layer2", "AI Tokens", "Memecoins", "RWA"][:rng.randint(3, 5)],
            "sentiment_change_24h": rng.uniform(-0.2, 0.2)
        }
    
    def generate_correlation_matrix(self) -> Dict[str, Any]:
        """Generate synthetic correlation matrix data."""
        rng = self._seeded_random("correlation")
        
        matrix = []
        for i, symbol_a in enumerate(self.SYMBOLS):
            row = []
            for j, symbol_b in enumerate(self.SYMBOLS):
                if i == j:
                    row.append(1.0)
                elif i < j:
                    row.append(round(rng.uniform(-0.5, 1.0), 3))
                else:
                    row.append(matrix[j][i])  # Symmetric
            matrix.append(row)
        
        pairs = []
        for i, symbol_a in enumerate(self.SYMBOLS):
            for j, symbol_b in enumerate(self.SYMBOLS):
                if i < j:
                    pairs.append({
                        "pair": f"{symbol_a}/{symbol_b}",
                        "correlation": matrix[i][j],
                        "strength": "strong" if abs(matrix[i][j]) > 0.7 else "moderate" if abs(matrix[i][j]) > 0.4 else "weak"
                    })
        
        return {
            "symbols": self.SYMBOLS,
            "matrix": matrix,
            "pairs": sorted(pairs, key=lambda x: abs(x["correlation"]), reverse=True)[:20],
            "avg_correlation": sum(sum(row) for row in matrix) / (len(self.SYMBOLS) ** 2),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_exposure_analysis(self, chain: str = "ethereum") -> Dict[str, Any]:
        """Generate synthetic exposure analysis data."""
        rng = self._seeded_random(f"exposure-{chain}")
        
        protocols = []
        for i in range(10):
            protocols.append({
                "id": f"protocol-{i+1}",
                "name": rng.choice(["Aave", "Compound", "MakerDAO", "Lido", "Curve", "Uniswap", "Balancer", "Yearn"]),
                "tvl": rng.uniform(1e8, 1e10),
                "exposure_pct": rng.uniform(0.01, 0.3),
                "risk_score": rng.uniform(0.1, 0.9),
                "chain": chain
            })
        
        return {
            "chain": chain,
            "total_exposure": sum(p["tvl"] * p["exposure_pct"] for p in protocols),
            "protocols": protocols,
            "risk_breakdown": {
                "low": sum(1 for p in protocols if p["risk_score"] < 0.3),
                "medium": sum(1 for p in protocols if 0.3 <= p["risk_score"] < 0.7),
                "high": sum(1 for p in protocols if p["risk_score"] >= 0.7)
            },
            "concentration_risk": rng.uniform(0.2, 0.8)
        }
    
    def generate_orderbook_depth(self, symbol: str = "BTC", exchange: str = "binance", levels: int = 20) -> Dict[str, Any]:
        """Generate synthetic order book depth data."""
        rng = self._seeded_random(f"orderbook-{symbol}-{exchange}")
        
        mid_price = rng.uniform(30000, 100000) if symbol == "BTC" else rng.uniform(100, 5000)
        
        bids = []
        asks = []
        for i in range(levels):
            bid_price = mid_price * (1 - 0.001 * (i + 1))
            ask_price = mid_price * (1 + 0.001 * (i + 1))
            bids.append({
                "price": round(bid_price, 2),
                "quantity": rng.uniform(0.1, 10),
                "total": round(bid_price * rng.uniform(0.1, 10), 2)
            })
            asks.append({
                "price": round(ask_price, 2),
                "quantity": rng.uniform(0.1, 10),
                "total": round(ask_price * rng.uniform(0.1, 10), 2)
            })
        
        return {
            "symbol": symbol,
            "exchange": exchange,
            "mid_price": round(mid_price, 2),
            "spread": round((asks[0]["price"] - bids[0]["price"]) / mid_price * 100, 4),
            "bids": bids,
            "asks": asks,
            "bid_depth": sum(b["total"] for b in bids),
            "ask_depth": sum(a["total"] for a in asks),
            "imbalance": (sum(b["total"] for b in bids) - sum(a["total"] for a in asks)) / (sum(b["total"] for b in bids) + sum(a["total"] for a in asks)),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_derivatives_watch(self, derivative_type: str = "futures", exchange: str = "binance") -> Dict[str, Any]:
        """Generate synthetic derivatives data."""
        rng = self._seeded_random(f"derivatives-{derivative_type}-{exchange}")
        
        contracts = []
        for symbol in self.SYMBOLS[:8]:
            contracts.append({
                "symbol": f"{symbol}-PERP" if derivative_type == "futures" else f"{symbol}-OPT",
                "underlying": symbol,
                "type": derivative_type,
                "exchange": exchange,
                "open_interest": rng.uniform(1e7, 1e9),
                "volume_24h": rng.uniform(1e6, 1e8),
                "funding_rate": rng.uniform(-0.001, 0.001) if derivative_type == "futures" else None,
                "mark_price": rng.uniform(100, 100000),
                "index_price": rng.uniform(100, 100000),
                "long_short_ratio": rng.uniform(0.5, 2.0),
                "liquidations_24h": rng.uniform(1e5, 1e7)
            })
        
        return {
            "type": derivative_type,
            "exchange": exchange,
            "total_open_interest": sum(c["open_interest"] for c in contracts),
            "total_volume": sum(c["volume_24h"] for c in contracts),
            "contracts": contracts,
            "funding_summary": {
                "avg_funding": sum(c["funding_rate"] or 0 for c in contracts) / len(contracts),
                "positive_count": sum(1 for c in contracts if (c["funding_rate"] or 0) > 0),
                "negative_count": sum(1 for c in contracts if (c["funding_rate"] or 0) < 0)
            } if derivative_type == "futures" else None,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_manipulation_detect(self) -> Dict[str, Any]:
        """Generate synthetic manipulation detection data."""
        rng = self._seeded_random("manipulation")
        
        detections = []
        for i in range(rng.randint(3, 10)):
            detections.append({
                "id": f"detection-{i+1}",
                "type": rng.choice(self.PATTERN_TYPES),
                "symbol": rng.choice(self.SYMBOLS),
                "chain": rng.choice(self.CHAINS),
                "confidence": rng.uniform(0.6, 1.0),
                "severity": rng.choice(["critical", "high", "medium"]),
                "volume_involved": rng.uniform(1e5, 1e7),
                "addresses_involved": rng.randint(2, 20),
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(1, 60))).isoformat(),
                "status": rng.choice(["active", "resolved", "monitoring"])
            })
        
        return {
            "total_detections": len(detections),
            "active_count": sum(1 for d in detections if d["status"] == "active"),
            "detections": detections,
            "pattern_distribution": {pt: sum(1 for d in detections if d["type"] == pt) for pt in self.PATTERN_TYPES},
            "risk_level": "high" if len(detections) > 5 else "medium" if len(detections) > 2 else "low"
        }
    
    def generate_threats_timeline(self) -> Dict[str, Any]:
        """Generate synthetic threat timeline data."""
        rng = self._seeded_random("threats-timeline")
        
        events = []
        for i in range(20):
            events.append({
                "id": f"threat-{i+1}",
                "type": rng.choice(["manipulation", "exploit", "rug_pull", "flash_loan", "oracle_attack"]),
                "severity": rng.choice(["critical", "high", "medium", "low"]),
                "title": rng.choice([
                    "Suspicious trading pattern detected",
                    "Large fund movement from exchange",
                    "Smart contract vulnerability exploited",
                    "Unusual whale activity",
                    "Cross-chain bridge anomaly"
                ]),
                "affected_assets": rng.sample(self.SYMBOLS, rng.randint(1, 3)),
                "chain": rng.choice(self.CHAINS),
                "timestamp": (datetime.utcnow() - timedelta(hours=rng.randint(1, 72))).isoformat(),
                "status": rng.choice(["active", "resolved", "investigating"])
            })
        
        return {
            "total_events": len(events),
            "events": sorted(events, key=lambda x: x["timestamp"], reverse=True),
            "severity_breakdown": {
                "critical": sum(1 for e in events if e["severity"] == "critical"),
                "high": sum(1 for e in events if e["severity"] == "high"),
                "medium": sum(1 for e in events if e["severity"] == "medium"),
                "low": sum(1 for e in events if e["severity"] == "low")
            },
            "active_threats": sum(1 for e in events if e["status"] == "active")
        }
    
    def generate_signals_confidence(self) -> Dict[str, Any]:
        """Generate synthetic signal confidence data."""
        rng = self._seeded_random("signals")
        
        signals = []
        for i in range(15):
            signals.append({
                "id": f"signal-{i+1}",
                "type": rng.choice(["buy", "sell", "hold", "accumulate", "distribute"]),
                "symbol": rng.choice(self.SYMBOLS),
                "confidence": rng.uniform(0.5, 1.0),
                "strength": rng.choice(["strong", "moderate", "weak"]),
                "timeframe": rng.choice(["1h", "4h", "1d", "1w"]),
                "source": rng.choice(["technical", "on-chain", "sentiment", "whale_tracking"]),
                "timestamp": (datetime.utcnow() - timedelta(hours=rng.randint(1, 24))).isoformat()
            })
        
        return {
            "total_signals": len(signals),
            "signals": signals,
            "avg_confidence": sum(s["confidence"] for s in signals) / len(signals),
            "signal_distribution": {
                "buy": sum(1 for s in signals if s["type"] == "buy"),
                "sell": sum(1 for s in signals if s["type"] == "sell"),
                "hold": sum(1 for s in signals if s["type"] == "hold")
            },
            "top_confidence": sorted(signals, key=lambda x: x["confidence"], reverse=True)[:5]
        }
    
    def generate_events_fusion(self) -> Dict[str, Any]:
        """Generate synthetic event fusion data."""
        rng = self._seeded_random("events-fusion")
        
        events = []
        for i in range(12):
            events.append({
                "id": f"fused-{i+1}",
                "title": rng.choice([
                    "Multi-chain whale movement detected",
                    "Correlated exchange outflows",
                    "DeFi protocol risk escalation",
                    "Market maker repositioning",
                    "Stablecoin flow anomaly"
                ]),
                "sources": rng.sample(["on-chain", "exchange", "social", "news", "whale_tracker"], rng.randint(2, 4)),
                "confidence": rng.uniform(0.6, 1.0),
                "impact": rng.choice(["high", "medium", "low"]),
                "affected_assets": rng.sample(self.SYMBOLS, rng.randint(1, 4)),
                "chains": rng.sample(self.CHAINS, rng.randint(1, 3)),
                "timestamp": (datetime.utcnow() - timedelta(hours=rng.randint(1, 48))).isoformat()
            })
        
        return {
            "total_events": len(events),
            "events": events,
            "fusion_score": rng.uniform(0.5, 1.0),
            "source_coverage": {
                "on-chain": sum(1 for e in events if "on-chain" in e["sources"]),
                "exchange": sum(1 for e in events if "exchange" in e["sources"]),
                "social": sum(1 for e in events if "social" in e["sources"])
            }
        }
    
    def generate_network_anomalies(self) -> Dict[str, Any]:
        """Generate synthetic network anomaly data."""
        rng = self._seeded_random("network-anomalies")
        
        anomalies = []
        for i in range(8):
            anomalies.append({
                "id": f"network-{i+1}",
                "type": rng.choice(["congestion", "fee_spike", "block_delay", "reorg", "mempool_flood"]),
                "chain": rng.choice(self.CHAINS),
                "severity": rng.choice(["critical", "high", "medium", "low"]),
                "description": f"Network anomaly detected on {rng.choice(self.CHAINS)}",
                "metrics": {
                    "gas_price": rng.uniform(10, 500),
                    "block_time": rng.uniform(1, 30),
                    "pending_txs": rng.randint(1000, 100000)
                },
                "timestamp": (datetime.utcnow() - timedelta(minutes=rng.randint(5, 120))).isoformat()
            })
        
        return {
            "total_anomalies": len(anomalies),
            "anomalies": anomalies,
            "chain_health": {chain: rng.choice(["healthy", "degraded", "critical"]) for chain in self.CHAINS},
            "overall_status": rng.choice(["normal", "elevated", "critical"])
        }
    
    def generate_patterns_recognition(self) -> Dict[str, Any]:
        """Generate synthetic pattern recognition data."""
        rng = self._seeded_random("patterns")
        
        patterns = []
        for i in range(10):
            patterns.append({
                "id": f"pattern-{i+1}",
                "name": rng.choice([
                    "Head and Shoulders", "Double Top", "Bull Flag", "Ascending Triangle",
                    "Cup and Handle", "Falling Wedge", "Rising Wedge", "Triple Bottom"
                ]),
                "symbol": rng.choice(self.SYMBOLS),
                "timeframe": rng.choice(["1h", "4h", "1d"]),
                "confidence": rng.uniform(0.6, 1.0),
                "direction": rng.choice(["bullish", "bearish"]),
                "target_price": rng.uniform(100, 100000),
                "stop_loss": rng.uniform(100, 100000),
                "timestamp": (datetime.utcnow() - timedelta(hours=rng.randint(1, 24))).isoformat()
            })
        
        return {
            "total_patterns": len(patterns),
            "patterns": patterns,
            "bullish_count": sum(1 for p in patterns if p["direction"] == "bullish"),
            "bearish_count": sum(1 for p in patterns if p["direction"] == "bearish"),
            "high_confidence": [p for p in patterns if p["confidence"] > 0.8]
        }
    
    def generate_risk_time_series(self) -> Dict[str, Any]:
        """Generate synthetic time-series risk data."""
        rng = self._seeded_random("risk-time-series")
        
        data_points = []
        for i in range(48):
            data_points.append({
                "timestamp": (datetime.utcnow() - timedelta(hours=48-i)).isoformat(),
                "risk_score": rng.uniform(0.2, 0.9),
                "volatility": rng.uniform(0.1, 0.8),
                "correlation": rng.uniform(-0.5, 1.0),
                "liquidity_risk": rng.uniform(0.1, 0.7)
            })
        
        return {
            "timeframe": "48h",
            "data_points": data_points,
            "current_risk": data_points[-1]["risk_score"],
            "risk_trend": "increasing" if data_points[-1]["risk_score"] > data_points[0]["risk_score"] else "decreasing",
            "peak_risk": max(d["risk_score"] for d in data_points),
            "avg_risk": sum(d["risk_score"] for d in data_points) / len(data_points)
        }
    
    def generate_risk_predictive(self) -> Dict[str, Any]:
        """Generate synthetic predictive risk data."""
        rng = self._seeded_random("risk-predictive")
        
        predictions = []
        for i in range(24):
            predictions.append({
                "hour": i + 1,
                "timestamp": (datetime.utcnow() + timedelta(hours=i+1)).isoformat(),
                "predicted_risk": rng.uniform(0.2, 0.9),
                "confidence": rng.uniform(0.5, 0.95),
                "factors": rng.sample(["volatility", "whale_activity", "market_sentiment", "liquidity"], rng.randint(1, 3))
            })
        
        return {
            "forecast_horizon": "24h",
            "predictions": predictions,
            "current_risk": rng.uniform(0.3, 0.7),
            "predicted_peak": max(p["predicted_risk"] for p in predictions),
            "risk_alerts": [p for p in predictions if p["predicted_risk"] > 0.7],
            "model_confidence": rng.uniform(0.7, 0.95)
        }
    
    def generate_ai_forecast(self) -> Dict[str, Any]:
        """Generate synthetic AI forecast data."""
        rng = self._seeded_random("ai-forecast")
        
        forecasts = []
        for symbol in self.SYMBOLS:
            forecasts.append({
                "symbol": symbol,
                "current_price": rng.uniform(100, 100000),
                "predicted_price_24h": rng.uniform(100, 100000),
                "predicted_price_7d": rng.uniform(100, 100000),
                "confidence": rng.uniform(0.5, 0.95),
                "direction": rng.choice(["bullish", "bearish", "neutral"]),
                "volatility_forecast": rng.uniform(0.1, 0.5),
                "key_levels": {
                    "support": rng.uniform(100, 50000),
                    "resistance": rng.uniform(50000, 100000)
                }
            })
        
        return {
            "model_version": "v2.1",
            "forecasts": forecasts,
            "market_outlook": rng.choice(["bullish", "bearish", "neutral"]),
            "confidence_avg": sum(f["confidence"] for f in forecasts) / len(forecasts),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def generate_alerts_rules(self) -> Dict[str, Any]:
        """Generate synthetic alert rules data."""
        rng = self._seeded_random("alerts-rules")
        
        rules = []
        for i in range(8):
            rules.append({
                "id": f"rule-{i+1}",
                "name": rng.choice([
                    "Whale Movement Alert", "Price Spike Detection", "Volume Anomaly",
                    "Manipulation Warning", "Liquidity Drop", "Correlation Break"
                ]),
                "condition": rng.choice(["price_change > 5%", "volume > 2x avg", "whale_tx > $1M"]),
                "status": rng.choice(["active", "paused"]),
                "triggers_24h": rng.randint(0, 20),
                "last_triggered": (datetime.utcnow() - timedelta(hours=rng.randint(1, 48))).isoformat() if rng.random() > 0.3 else None,
                "severity": rng.choice(["critical", "high", "medium", "low"])
            })
        
        return {
            "total_rules": len(rules),
            "active_rules": sum(1 for r in rules if r["status"] == "active"),
            "rules": rules,
            "total_triggers_24h": sum(r["triggers_24h"] for r in rules)
        }
    
    def generate_governance_decisions(self) -> Dict[str, Any]:
        """Generate synthetic governance decisions data."""
        rng = self._seeded_random("governance")
        
        decisions = []
        for i in range(6):
            decisions.append({
                "id": f"gov-{i+1}",
                "protocol": rng.choice(["Aave", "Compound", "Uniswap", "MakerDAO", "Curve"]),
                "title": rng.choice([
                    "Parameter Update Proposal", "New Asset Listing", "Fee Structure Change",
                    "Risk Parameter Adjustment", "Protocol Upgrade"
                ]),
                "status": rng.choice(["active", "passed", "rejected", "pending"]),
                "votes_for": rng.randint(1000, 100000),
                "votes_against": rng.randint(100, 50000),
                "quorum_reached": rng.random() > 0.3,
                "end_date": (datetime.utcnow() + timedelta(days=rng.randint(1, 7))).isoformat()
            })
        
        return {
            "total_proposals": len(decisions),
            "active_proposals": sum(1 for d in decisions if d["status"] == "active"),
            "decisions": decisions,
            "participation_rate": rng.uniform(0.1, 0.5)
        }
    
    def generate_scenarios_list(self) -> Dict[str, Any]:
        """Generate synthetic scenario simulation data."""
        rng = self._seeded_random("scenarios")
        
        scenarios = []
        for i in range(5):
            scenarios.append({
                "id": f"scenario-{i+1}",
                "name": rng.choice([
                    "Market Crash Simulation", "Bull Run Scenario", "Black Swan Event",
                    "Liquidity Crisis", "Regulatory Crackdown"
                ]),
                "probability": rng.uniform(0.05, 0.3),
                "impact": rng.choice(["severe", "moderate", "mild"]),
                "affected_assets": rng.sample(self.SYMBOLS, rng.randint(3, 7)),
                "expected_drawdown": rng.uniform(0.1, 0.5),
                "recovery_time_days": rng.randint(7, 90)
            })
        
        return {
            "total_scenarios": len(scenarios),
            "scenarios": scenarios,
            "highest_risk": max(scenarios, key=lambda x: x["probability"]),
            "portfolio_var": rng.uniform(0.05, 0.2)
        }
    
    def generate_strategy_backtests(self) -> Dict[str, Any]:
        """Generate synthetic strategy backtest data."""
        rng = self._seeded_random("backtests")
        
        backtests = []
        for i in range(5):
            backtests.append({
                "id": f"backtest-{i+1}",
                "strategy": rng.choice(["Momentum", "Mean Reversion", "Trend Following", "Arbitrage"]),
                "symbol": rng.choice(self.SYMBOLS),
                "timeframe": rng.choice(["1h", "4h", "1d"]),
                "start_date": (datetime.utcnow() - timedelta(days=rng.randint(30, 365))).isoformat(),
                "end_date": datetime.utcnow().isoformat(),
                "total_return": rng.uniform(-0.2, 0.5),
                "sharpe_ratio": rng.uniform(-0.5, 2.5),
                "max_drawdown": rng.uniform(0.05, 0.3),
                "win_rate": rng.uniform(0.4, 0.7),
                "total_trades": rng.randint(50, 500)
            })
        
        return {
            "total_backtests": len(backtests),
            "backtests": backtests,
            "best_performer": max(backtests, key=lambda x: x["total_return"]),
            "avg_return": sum(b["total_return"] for b in backtests) / len(backtests)
        }
    
    def generate_telemetry_status(self) -> Dict[str, Any]:
        """Generate synthetic system telemetry data."""
        rng = self._seeded_random("telemetry")
        
        return {
            "system_health": rng.choice(["healthy", "degraded", "critical"]),
            "uptime_pct": rng.uniform(99.0, 99.99),
            "api_latency_ms": rng.randint(10, 200),
            "requests_per_minute": rng.randint(100, 10000),
            "error_rate": rng.uniform(0.001, 0.05),
            "active_connections": rng.randint(10, 500),
            "memory_usage_pct": rng.uniform(30, 80),
            "cpu_usage_pct": rng.uniform(10, 70),
            "services": {
                "api": "running",
                "worker": "running",
                "redis": "connected",
                "database": "connected",
                "websocket": "active"
            },
            "last_updated": datetime.utcnow().isoformat()
        }

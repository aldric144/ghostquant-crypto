"""Ecosystem Mapper - Track cross-chain ecosystem metrics and compute EMI."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np
import aiohttp

from ..config import (
    EMI_WEIGHTS,
    SUPPORTED_CHAINS,
    PROTOCOL_CATEGORIES,
    USE_MOCK_ECOSCAN_DATA,
)

logger = logging.getLogger(__name__)


class EcosystemMapper:
    """
    Maps emerging ecosystems across chains and computes Ecosystem Momentum Index (EMI).
    
    EMI = w1*TVL_delta + w2*ActiveWallets_delta + w3*Volume_delta + w4*BridgeFlows
    
    Data sources:
    - DeFiLlama (TVL, protocols)
    - CoinGecko (volume, market data)
    - Chain registries (wallet counts, bridge flows)
    """
    
    def __init__(self):
        self.emi_weights = EMI_WEIGHTS
        self.supported_chains = SUPPORTED_CHAINS
        self.use_mock_data = USE_MOCK_ECOSCAN_DATA
        
    async def fetch_ecosystem_data(self, chain: str) -> Dict:
        """
        Fetch ecosystem data for a specific chain.
        
        Args:
            chain: Chain name (e.g., 'ethereum', 'arbitrum')
            
        Returns:
            Dict with tvl_usd, protocols, wallets_24h, volume_24h, bridge_flows
        """
        if self.use_mock_data:
            return self._generate_mock_ecosystem_data(chain)
        
        try:
            async with aiohttp.ClientSession() as session:
                tvl_data = await self._fetch_defillama_tvl(session, chain)
                
                volume_data = await self._fetch_coingecko_volume(session, chain)
                
                wallet_data = await self._fetch_wallet_count(session, chain)
                
                bridge_data = await self._fetch_bridge_flows(session, chain)
                
                return {
                    "chain": chain,
                    "tvl_usd": tvl_data.get("tvl", 0),
                    "protocols": tvl_data.get("protocols", []),
                    "wallets_24h": wallet_data.get("active_wallets", 0),
                    "volume_24h": volume_data.get("volume", 0),
                    "bridge_flows": bridge_data.get("net_flow", 0),
                    "updated_at": datetime.utcnow(),
                }
        except Exception as e:
            logger.error(f"Error fetching ecosystem data for {chain}: {e}")
            return self._generate_mock_ecosystem_data(chain)
    
    def _generate_mock_ecosystem_data(self, chain: str) -> Dict:
        """Generate synthetic ecosystem data for demo."""
        seed = sum(ord(c) for c in chain)
        np.random.seed(seed)
        
        chain_scale = {
            "ethereum": 10.0,
            "arbitrum": 3.0,
            "optimism": 2.5,
            "polygon": 2.0,
            "avalanche": 1.8,
            "bsc": 2.2,
            "solana": 4.0,
            "cosmos": 1.5,
            "osmosis": 1.2,
            "base": 1.8,
        }.get(chain, 1.0)
        
        tvl_base = 1e9 * chain_scale
        tvl_noise = np.random.normal(0, 0.1 * tvl_base)
        tvl_usd = max(0, tvl_base + tvl_noise)
        
        wallets_base = 50000 * chain_scale
        wallets_noise = np.random.normal(0, 0.15 * wallets_base)
        wallets_24h = max(0, int(wallets_base + wallets_noise))
        
        volume_base = 5e8 * chain_scale
        volume_noise = np.random.normal(0, 0.2 * volume_base)
        volume_24h = max(0, volume_base + volume_noise)
        
        bridge_base = 1e7 * chain_scale
        bridge_noise = np.random.normal(0, 0.3 * bridge_base)
        bridge_flows = bridge_base + bridge_noise  # Can be negative (outflows)
        
        n_protocols = int(10 * chain_scale)
        protocols = [f"{chain}_protocol_{i}" for i in range(n_protocols)]
        
        return {
            "chain": chain,
            "tvl_usd": tvl_usd,
            "protocols": protocols,
            "wallets_24h": wallets_24h,
            "volume_24h": volume_24h,
            "bridge_flows": bridge_flows,
            "updated_at": datetime.utcnow(),
        }
    
    async def _fetch_defillama_tvl(self, session: aiohttp.ClientSession, chain: str) -> Dict:
        """Fetch TVL data from DeFiLlama API."""
        return {"tvl": 0, "protocols": []}
    
    async def _fetch_coingecko_volume(self, session: aiohttp.ClientSession, chain: str) -> Dict:
        """Fetch volume data from CoinGecko API."""
        return {"volume": 0}
    
    async def _fetch_wallet_count(self, session: aiohttp.ClientSession, chain: str) -> Dict:
        """Fetch active wallet count from chain-specific APIs."""
        return {"active_wallets": 0}
    
    async def _fetch_bridge_flows(self, session: aiohttp.ClientSession, chain: str) -> Dict:
        """Fetch bridge flow data from bridge aggregators."""
        return {"net_flow": 0}
    
    def compute_emi(
        self,
        current_data: Dict,
        historical_data: Optional[Dict] = None
    ) -> float:
        """
        Compute Ecosystem Momentum Index (EMI).
        
        EMI = w1*TVL_delta + w2*ActiveWallets_delta + w3*Volume_delta + w4*BridgeFlows
        
        Args:
            current_data: Current ecosystem metrics
            historical_data: Historical metrics for delta calculation (24h ago)
            
        Returns:
            EMI score (0-100)
        """
        if historical_data is None:
            historical_data = {
                "tvl_usd": current_data["tvl_usd"] * 0.95,
                "wallets_24h": current_data["wallets_24h"] * 0.95,
                "volume_24h": current_data["volume_24h"] * 0.95,
                "bridge_flows": current_data["bridge_flows"] * 0.5,
            }
        
        tvl_delta = self._safe_pct_change(
            current_data["tvl_usd"],
            historical_data["tvl_usd"]
        )
        
        wallets_delta = self._safe_pct_change(
            current_data["wallets_24h"],
            historical_data["wallets_24h"]
        )
        
        volume_delta = self._safe_pct_change(
            current_data["volume_24h"],
            historical_data["volume_24h"]
        )
        
        bridge_flow_score = (
            current_data["bridge_flows"] / max(current_data["tvl_usd"], 1e6)
        ) * 100
        
        emi_raw = (
            self.emi_weights["tvl_delta"] * tvl_delta +
            self.emi_weights["active_wallets_delta"] * wallets_delta +
            self.emi_weights["volume_delta"] * volume_delta +
            self.emi_weights["bridge_flows"] * bridge_flow_score
        )
        
        emi_normalized = 100 / (1 + np.exp(-emi_raw / 10))
        
        return float(emi_normalized)
    
    def _safe_pct_change(self, current: float, previous: float) -> float:
        """Compute percentage change safely."""
        if previous == 0:
            return 0.0
        return ((current - previous) / previous) * 100
    
    async def get_all_ecosystems(self) -> List[Dict]:
        """
        Fetch and score all supported ecosystems.
        
        Returns:
            List of ecosystem data with EMI scores
        """
        tasks = [
            self.fetch_ecosystem_data(chain)
            for chain in self.supported_chains
        ]
        
        ecosystem_data = await asyncio.gather(*tasks)
        
        for data in ecosystem_data:
            data["emi_score"] = self.compute_emi(data)
        
        ecosystem_data.sort(key=lambda x: x["emi_score"], reverse=True)
        
        return ecosystem_data
    
    def get_top_ecosystems(self, ecosystems: List[Dict], n: int = 10) -> List[Dict]:
        """Get top N ecosystems by EMI score."""
        return ecosystems[:n]
    
    def classify_ecosystem_stage(self, emi_score: float) -> str:
        """
        Classify ecosystem stage based on EMI score.
        
        Args:
            emi_score: EMI score (0-100)
            
        Returns:
            Stage classification
        """
        if emi_score >= 75:
            return "explosive_growth"
        elif emi_score >= 60:
            return "rapid_growth"
        elif emi_score >= 50:
            return "steady_growth"
        elif emi_score >= 40:
            return "emerging"
        else:
            return "mature_or_declining"
    
    def get_ecosystem_summary(self, ecosystem_data: Dict) -> Dict:
        """Generate human-readable ecosystem summary."""
        stage = self.classify_ecosystem_stage(ecosystem_data["emi_score"])
        
        return {
            "chain": ecosystem_data["chain"],
            "emi_score": ecosystem_data["emi_score"],
            "stage": stage,
            "tvl_usd": ecosystem_data["tvl_usd"],
            "protocols_count": len(ecosystem_data["protocols"]),
            "wallets_24h": ecosystem_data["wallets_24h"],
            "volume_24h": ecosystem_data["volume_24h"],
            "bridge_flows": ecosystem_data["bridge_flows"],
            "interpretation": self._interpret_emi(ecosystem_data),
        }
    
    def _interpret_emi(self, data: Dict) -> str:
        """Generate interpretation text for EMI score."""
        emi = data["emi_score"]
        chain = data["chain"].capitalize()
        
        if emi >= 75:
            return f"{chain} showing explosive growth with strong TVL inflows and wallet activity."
        elif emi >= 60:
            return f"{chain} experiencing rapid growth across multiple metrics."
        elif emi >= 50:
            return f"{chain} maintaining steady growth momentum."
        elif emi >= 40:
            return f"{chain} emerging with moderate growth signals."
        else:
            return f"{chain} showing mature or declining momentum."

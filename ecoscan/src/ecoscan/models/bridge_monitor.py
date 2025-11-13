"""Bridge Monitor - Track cross-chain bridge flows and detect unusual activity."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np
import aiohttp

from ..config import (
    SUPPORTED_CHAINS,
    USE_MOCK_ECOSCAN_DATA,
)

logger = logging.getLogger(__name__)


class BridgeMonitor:
    """
    Monitor cross-chain bridge flows across major bridges.
    
    Supported bridges:
    - Wormhole
    - LayerZero
    - Stargate
    - Across Protocol
    - Hop Protocol
    - Synapse
    - Multichain (Anyswap)
    """
    
    def __init__(self):
        self.supported_chains = SUPPORTED_CHAINS
        self.use_mock_data = USE_MOCK_ECOSCAN_DATA
        self.bridges = [
            "wormhole",
            "layerzero",
            "stargate",
            "across",
            "hop",
            "synapse",
            "multichain",
        ]
        
    async def fetch_bridge_flows(
        self,
        chain: str,
        lookback_hours: int = 24
    ) -> Dict:
        """
        Fetch bridge flow data for a specific chain.
        
        Args:
            chain: Chain name (e.g., 'ethereum', 'arbitrum')
            lookback_hours: Hours to look back
            
        Returns:
            Dict with inflows, outflows, net_flow, and bridge breakdown
        """
        if self.use_mock_data:
            return self._generate_mock_bridge_flows(chain, lookback_hours)
        
        try:
            async with aiohttp.ClientSession() as session:
                flows = {
                    "chain": chain,
                    "inflows": 0,
                    "outflows": 0,
                    "net_flow": 0,
                    "bridge_breakdown": {},
                    "timestamp": datetime.utcnow(),
                }
                
                for bridge in self.bridges:
                    bridge_data = await self._fetch_bridge_specific_flows(
                        session, bridge, chain, lookback_hours
                    )
                    
                    flows["inflows"] += bridge_data.get("inflows", 0)
                    flows["outflows"] += bridge_data.get("outflows", 0)
                    flows["bridge_breakdown"][bridge] = bridge_data
                
                flows["net_flow"] = flows["inflows"] - flows["outflows"]
                
                logger.info(
                    f"Bridge flows for {chain}: "
                    f"in=${flows['inflows']/1e6:.1f}M, "
                    f"out=${flows['outflows']/1e6:.1f}M, "
                    f"net=${flows['net_flow']/1e6:.1f}M"
                )
                
                return flows
        except Exception as e:
            logger.error(f"Error fetching bridge flows for {chain}: {e}")
            return self._generate_mock_bridge_flows(chain, lookback_hours)
    
    async def _fetch_bridge_specific_flows(
        self,
        session: aiohttp.ClientSession,
        bridge: str,
        chain: str,
        lookback_hours: int
    ) -> Dict:
        """
        Fetch flows from a specific bridge.
        
        This would integrate with bridge-specific APIs or indexers.
        For now, returns placeholder data.
        """
        
        return {
            "inflows": 0,
            "outflows": 0,
            "net_flow": 0,
            "tx_count": 0,
        }
    
    def _generate_mock_bridge_flows(
        self,
        chain: str,
        lookback_hours: int
    ) -> Dict:
        """Generate synthetic bridge flow data for demo."""
        seed = sum(ord(c) for c in chain)
        np.random.seed(seed)
        
        chain_scale = {
            "ethereum": 10.0,
            "arbitrum": 4.0,
            "optimism": 3.5,
            "polygon": 3.0,
            "avalanche": 2.5,
            "bsc": 2.8,
            "solana": 3.5,
            "cosmos": 2.0,
            "osmosis": 1.5,
            "base": 3.0,
        }.get(chain, 1.0)
        
        inflow_base = 50_000_000 * chain_scale  # $50M base
        inflow_noise = np.random.normal(0, 0.2 * inflow_base)
        inflows = max(0, inflow_base + inflow_noise)
        
        outflow_base = 45_000_000 * chain_scale  # $45M base (slight net inflow)
        outflow_noise = np.random.normal(0, 0.2 * outflow_base)
        outflows = max(0, outflow_base + outflow_noise)
        
        net_flow = inflows - outflows
        
        bridge_breakdown = {}
        remaining_inflow = inflows
        remaining_outflow = outflows
        
        for i, bridge in enumerate(self.bridges):
            if i == len(self.bridges) - 1:
                bridge_inflow = remaining_inflow
                bridge_outflow = remaining_outflow
            else:
                bridge_inflow = remaining_inflow * np.random.uniform(0.1, 0.4)
                bridge_outflow = remaining_outflow * np.random.uniform(0.1, 0.4)
                remaining_inflow -= bridge_inflow
                remaining_outflow -= bridge_outflow
            
            bridge_breakdown[bridge] = {
                "inflows": bridge_inflow,
                "outflows": bridge_outflow,
                "net_flow": bridge_inflow - bridge_outflow,
                "tx_count": int(np.random.uniform(50, 500)),
            }
        
        return {
            "chain": chain,
            "inflows": inflows,
            "outflows": outflows,
            "net_flow": net_flow,
            "bridge_breakdown": bridge_breakdown,
            "timestamp": datetime.utcnow(),
        }
    
    async def get_all_bridge_flows(
        self,
        lookback_hours: int = 24
    ) -> List[Dict]:
        """
        Fetch bridge flows for all supported chains.
        
        Args:
            lookback_hours: Hours to look back
            
        Returns:
            List of bridge flow data for each chain
        """
        tasks = [
            self.fetch_bridge_flows(chain, lookback_hours)
            for chain in self.supported_chains
        ]
        
        flows = await asyncio.gather(*tasks)
        
        flows.sort(key=lambda x: x["net_flow"], reverse=True)
        
        return flows
    
    def detect_unusual_bridge_activity(
        self,
        current_flows: Dict,
        historical_avg: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Detect unusual bridge activity patterns.
        
        Args:
            current_flows: Current bridge flow data
            historical_avg: Historical average flows (optional)
            
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        if historical_avg is None:
            historical_avg = {
                "inflows": current_flows["inflows"] * 0.8,
                "outflows": current_flows["outflows"] * 0.8,
                "net_flow": current_flows["net_flow"] * 0.8,
            }
        
        inflow_ratio = current_flows["inflows"] / max(historical_avg["inflows"], 1)
        if inflow_ratio > 2.0:
            anomalies.append({
                "type": "large_inflow_spike",
                "chain": current_flows["chain"],
                "severity": "high" if inflow_ratio > 3.0 else "medium",
                "ratio": inflow_ratio,
                "message": f"Unusual inflow spike: {inflow_ratio:.1f}x historical average",
            })
        
        outflow_ratio = current_flows["outflows"] / max(historical_avg["outflows"], 1)
        if outflow_ratio > 2.0:
            anomalies.append({
                "type": "large_outflow_spike",
                "chain": current_flows["chain"],
                "severity": "high" if outflow_ratio > 3.0 else "medium",
                "ratio": outflow_ratio,
                "message": f"Unusual outflow spike: {outflow_ratio:.1f}x historical average",
            })
        
        if (historical_avg["net_flow"] > 0 and current_flows["net_flow"] < -historical_avg["net_flow"] * 0.5):
            anomalies.append({
                "type": "net_flow_reversal",
                "chain": current_flows["chain"],
                "severity": "high",
                "message": "Net flow reversed from positive to strongly negative",
            })
        elif (historical_avg["net_flow"] < 0 and current_flows["net_flow"] > -historical_avg["net_flow"] * 0.5):
            anomalies.append({
                "type": "net_flow_reversal",
                "chain": current_flows["chain"],
                "severity": "medium",
                "message": "Net flow reversed from negative to positive",
            })
        
        if current_flows["bridge_breakdown"]:
            for bridge, data in current_flows["bridge_breakdown"].items():
                bridge_share = abs(data["net_flow"]) / max(abs(current_flows["net_flow"]), 1)
                if bridge_share > 0.7:
                    anomalies.append({
                        "type": "bridge_concentration",
                        "chain": current_flows["chain"],
                        "bridge": bridge,
                        "severity": "medium",
                        "share": bridge_share,
                        "message": f"{bridge} accounts for {bridge_share*100:.0f}% of net flow",
                    })
        
        return anomalies
    
    def get_bridge_flow_summary(
        self,
        all_flows: List[Dict]
    ) -> Dict:
        """
        Generate summary of bridge flows across all chains.
        
        Args:
            all_flows: List of bridge flow data for all chains
            
        Returns:
            Summary dict with totals and top movers
        """
        total_inflows = sum(f["inflows"] for f in all_flows)
        total_outflows = sum(f["outflows"] for f in all_flows)
        total_net_flow = total_inflows - total_outflows
        
        top_inflows = sorted(all_flows, key=lambda x: x["inflows"], reverse=True)[:5]
        
        top_outflows = sorted(all_flows, key=lambda x: x["outflows"], reverse=True)[:5]
        
        top_net_inflows = sorted(all_flows, key=lambda x: x["net_flow"], reverse=True)[:5]
        
        bridge_totals = {}
        for flow in all_flows:
            for bridge, data in flow.get("bridge_breakdown", {}).items():
                if bridge not in bridge_totals:
                    bridge_totals[bridge] = {
                        "inflows": 0,
                        "outflows": 0,
                        "net_flow": 0,
                        "tx_count": 0,
                    }
                bridge_totals[bridge]["inflows"] += data["inflows"]
                bridge_totals[bridge]["outflows"] += data["outflows"]
                bridge_totals[bridge]["net_flow"] += data["net_flow"]
                bridge_totals[bridge]["tx_count"] += data["tx_count"]
        
        return {
            "total_inflows": total_inflows,
            "total_outflows": total_outflows,
            "total_net_flow": total_net_flow,
            "top_inflow_chains": [
                {"chain": f["chain"], "inflows": f["inflows"]}
                for f in top_inflows
            ],
            "top_outflow_chains": [
                {"chain": f["chain"], "outflows": f["outflows"]}
                for f in top_outflows
            ],
            "top_net_inflow_chains": [
                {"chain": f["chain"], "net_flow": f["net_flow"]}
                for f in top_net_inflows
            ],
            "bridge_totals": bridge_totals,
            "timestamp": datetime.utcnow(),
        }
    
    def classify_bridge_sentiment(self, net_flow: float, total_volume: float) -> str:
        """
        Classify bridge sentiment based on net flow.
        
        Args:
            net_flow: Net bridge flow (inflows - outflows)
            total_volume: Total bridge volume (inflows + outflows)
            
        Returns:
            Sentiment classification
        """
        if total_volume == 0:
            return "neutral"
        
        net_flow_ratio = net_flow / total_volume
        
        if net_flow_ratio > 0.2:
            return "strong_inflow"
        elif net_flow_ratio > 0.05:
            return "moderate_inflow"
        elif net_flow_ratio > -0.05:
            return "balanced"
        elif net_flow_ratio > -0.2:
            return "moderate_outflow"
        else:
            return "strong_outflow"

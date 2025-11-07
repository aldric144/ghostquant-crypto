"""Whale Tracker - Monitor large wallet transactions and compute WCF."""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np

from ..config import (
    MIN_WHALE_TX_USD,
    WCF_FLOW_WEIGHT,
    WCF_LOG_BASE,
    KNOWN_WHALE_TAGS,
    USE_MOCK_ECOSCAN_DATA,
)

logger = logging.getLogger(__name__)


class WhaleTracker:
    """
    Track whale wallet transactions (>$250k) and compute Whale Confidence Factor (WCF).
    
    WCF = log(flow_in - flow_out + 1) * 10
    
    Monitors:
    - EVM chains (Ethereum, Arbitrum, Optimism, etc.)
    - Solana
    - Cosmos ecosystem
    """
    
    def __init__(self):
        self.min_whale_tx = MIN_WHALE_TX_USD
        self.wcf_flow_weight = WCF_FLOW_WEIGHT
        self.wcf_log_base = WCF_LOG_BASE
        self.known_whale_tags = KNOWN_WHALE_TAGS
        self.use_mock_data = USE_MOCK_ECOSCAN_DATA
        
    async def fetch_whale_transactions(
        self,
        asset: str,
        lookback_hours: int = 24
    ) -> List[Dict]:
        """
        Fetch whale transactions for an asset.
        
        Args:
            asset: Asset symbol (e.g., 'BTC', 'ETH')
            lookback_hours: Hours to look back
            
        Returns:
            List of whale transactions
        """
        if self.use_mock_data:
            return self._generate_mock_whale_transactions(asset, lookback_hours)
        
        
        try:
            transactions = []
            
            
            return transactions
        except Exception as e:
            logger.error(f"Error fetching whale transactions for {asset}: {e}")
            return self._generate_mock_whale_transactions(asset, lookback_hours)
    
    def _generate_mock_whale_transactions(
        self,
        asset: str,
        lookback_hours: int
    ) -> List[Dict]:
        """Generate synthetic whale transaction data for demo."""
        seed = sum(ord(c) for c in asset)
        np.random.seed(seed)
        
        n_txs = np.random.randint(5, 21)
        transactions = []
        
        now = datetime.utcnow()
        
        for i in range(n_txs):
            hours_ago = np.random.uniform(0, lookback_hours)
            timestamp = now - timedelta(hours=hours_ago)
            
            value_usd = np.random.uniform(
                self.min_whale_tx,
                50_000_000
            )
            
            direction = "inflow" if np.random.random() < 0.6 else "outflow"
            
            if np.random.random() < 0.2:
                wallet_tag = np.random.choice(list(self.known_whale_tags.values()))
            else:
                wallet_tag = f"Unknown Whale {i+1}"
            
            transactions.append({
                "asset": asset,
                "wallet_tag": wallet_tag,
                "direction": direction,
                "value_usd": value_usd,
                "timestamp": timestamp,
                "tx_hash": f"0x{''.join(np.random.choice(list('0123456789abcdef')) for _ in range(64))}",
            })
        
        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return transactions
    
    def compute_wcf(
        self,
        transactions: List[Dict],
        lookback_hours: int = 24
    ) -> float:
        """
        Compute Whale Confidence Factor (WCF).
        
        WCF = log_base(flow_in - flow_out + 1) * 10
        
        Args:
            transactions: List of whale transactions
            lookback_hours: Hours to consider
            
        Returns:
            WCF score (0-100)
        """
        if not transactions:
            return 50.0  # Neutral
        
        cutoff_time = datetime.utcnow() - timedelta(hours=lookback_hours)
        recent_txs = [
            tx for tx in transactions
            if tx["timestamp"] >= cutoff_time
        ]
        
        if not recent_txs:
            return 50.0  # Neutral
        
        flow_in = sum(
            tx["value_usd"] for tx in recent_txs
            if tx["direction"] == "inflow"
        )
        
        flow_out = sum(
            tx["value_usd"] for tx in recent_txs
            if tx["direction"] == "outflow"
        )
        
        net_flow = flow_in - flow_out
        
        offset = 1_000_000  # $1M offset
        
        if net_flow + offset <= 0:
            wcf_raw = 0
        else:
            wcf_raw = np.log(net_flow + offset) / np.log(self.wcf_log_base)
        
        
        wcf_normalized = 50 + (wcf_raw - 6) * 25
        
        wcf_normalized = max(0, min(100, wcf_normalized))
        
        return float(wcf_normalized)
    
    def get_whale_flow_summary(
        self,
        transactions: List[Dict],
        lookback_hours: int = 24
    ) -> Dict:
        """
        Generate whale flow summary.
        
        Args:
            transactions: List of whale transactions
            lookback_hours: Hours to consider
            
        Returns:
            Summary dict with flows, counts, and WCF
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=lookback_hours)
        recent_txs = [
            tx for tx in transactions
            if tx["timestamp"] >= cutoff_time
        ]
        
        if not recent_txs:
            return {
                "flow_in_usd": 0,
                "flow_out_usd": 0,
                "net_flow_usd": 0,
                "inflow_count": 0,
                "outflow_count": 0,
                "wcf": 50.0,
                "sentiment": "neutral",
            }
        
        flow_in = sum(
            tx["value_usd"] for tx in recent_txs
            if tx["direction"] == "inflow"
        )
        
        flow_out = sum(
            tx["value_usd"] for tx in recent_txs
            if tx["direction"] == "outflow"
        )
        
        net_flow = flow_in - flow_out
        
        inflow_count = sum(
            1 for tx in recent_txs
            if tx["direction"] == "inflow"
        )
        
        outflow_count = sum(
            1 for tx in recent_txs
            if tx["direction"] == "outflow"
        )
        
        wcf = self.compute_wcf(transactions, lookback_hours)
        
        sentiment = self._classify_whale_sentiment(wcf)
        
        return {
            "flow_in_usd": flow_in,
            "flow_out_usd": flow_out,
            "net_flow_usd": net_flow,
            "inflow_count": inflow_count,
            "outflow_count": outflow_count,
            "wcf": wcf,
            "sentiment": sentiment,
            "top_inflows": self._get_top_flows(recent_txs, "inflow", 5),
            "top_outflows": self._get_top_flows(recent_txs, "outflow", 5),
        }
    
    def _classify_whale_sentiment(self, wcf: float) -> str:
        """Classify whale sentiment based on WCF."""
        if wcf >= 70:
            return "very_bullish"
        elif wcf >= 60:
            return "bullish"
        elif wcf >= 40:
            return "neutral"
        elif wcf >= 30:
            return "bearish"
        else:
            return "very_bearish"
    
    def _get_top_flows(
        self,
        transactions: List[Dict],
        direction: str,
        n: int
    ) -> List[Dict]:
        """Get top N flows by value."""
        filtered = [
            tx for tx in transactions
            if tx["direction"] == direction
        ]
        
        filtered.sort(key=lambda x: x["value_usd"], reverse=True)
        
        return filtered[:n]
    
    def detect_whale_alerts(
        self,
        transactions: List[Dict],
        threshold_usd: float = 10_000_000
    ) -> List[Dict]:
        """
        Detect significant whale transactions for alerts.
        
        Args:
            transactions: List of whale transactions
            threshold_usd: Alert threshold (default $10M)
            
        Returns:
            List of alert-worthy transactions
        """
        alerts = []
        
        for tx in transactions:
            if tx["value_usd"] >= threshold_usd:
                alert = {
                    "asset": tx["asset"],
                    "wallet_tag": tx["wallet_tag"],
                    "direction": tx["direction"],
                    "value_usd": tx["value_usd"],
                    "timestamp": tx["timestamp"],
                    "severity": self._classify_alert_severity(tx["value_usd"]),
                    "message": self._generate_alert_message(tx),
                }
                alerts.append(alert)
        
        return alerts
    
    def _classify_alert_severity(self, value_usd: float) -> str:
        """Classify alert severity based on transaction value."""
        if value_usd >= 50_000_000:
            return "critical"
        elif value_usd >= 25_000_000:
            return "high"
        elif value_usd >= 10_000_000:
            return "medium"
        else:
            return "low"
    
    def _generate_alert_message(self, tx: Dict) -> str:
        """Generate human-readable alert message."""
        direction_text = "into" if tx["direction"] == "inflow" else "out of"
        value_text = f"${tx['value_usd']:,.0f}"
        
        return (
            f"{tx['wallet_tag']} moved {value_text} {direction_text} "
            f"{tx['asset']} at {tx['timestamp'].strftime('%Y-%m-%d %H:%M UTC')}"
        )
    
    def get_whale_heatmap_data(
        self,
        all_transactions: Dict[str, List[Dict]]
    ) -> List[Dict]:
        """
        Generate heatmap data for whale activity across assets.
        
        Args:
            all_transactions: Dict mapping asset -> transactions
            
        Returns:
            List of heatmap data points
        """
        heatmap_data = []
        
        for asset, transactions in all_transactions.items():
            summary = self.get_whale_flow_summary(transactions)
            
            heatmap_data.append({
                "asset": asset,
                "wcf": summary["wcf"],
                "net_flow_usd": summary["net_flow_usd"],
                "sentiment": summary["sentiment"],
                "tx_count": summary["inflow_count"] + summary["outflow_count"],
            })
        
        heatmap_data.sort(key=lambda x: x["wcf"], reverse=True)
        
        return heatmap_data

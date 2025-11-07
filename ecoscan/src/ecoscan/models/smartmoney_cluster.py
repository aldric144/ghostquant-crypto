"""Smart Money Cluster - Cluster wallet behavior patterns."""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler

from ..config import (
    CLUSTER_N_CLUSTERS,
    CLUSTER_LOOKBACK_DAYS,
    CLUSTER_MIN_TX_COUNT,
    USE_MOCK_ECOSCAN_DATA,
)

logger = logging.getLogger(__name__)


class SmartMoneyCluster:
    """
    Cluster wallet behavior into patterns: Accumulation, Distribution, Dormant Activation.
    
    Uses K-Means or DBSCAN clustering with time-weighted features:
    - Transaction frequency
    - Average transaction size
    - Net flow direction
    - Time since last activity
    - Wallet age
    """
    
    def __init__(self):
        self.n_clusters = CLUSTER_N_CLUSTERS
        self.lookback_days = CLUSTER_LOOKBACK_DAYS
        self.min_tx_count = CLUSTER_MIN_TX_COUNT
        self.use_mock_data = USE_MOCK_ECOSCAN_DATA
        
        self.cluster_labels = {
            0: "accumulation",
            1: "distribution",
            2: "dormant_activation",
        }
        
    def extract_wallet_features(
        self,
        wallet_transactions: List[Dict]
    ) -> Optional[np.ndarray]:
        """
        Extract features from wallet transaction history.
        
        Args:
            wallet_transactions: List of transactions for a wallet
            
        Returns:
            Feature vector or None if insufficient data
        """
        if len(wallet_transactions) < self.min_tx_count:
            return None
        
        txs = sorted(wallet_transactions, key=lambda x: x["timestamp"])
        
        time_span = (txs[-1]["timestamp"] - txs[0]["timestamp"]).days + 1
        tx_frequency = len(txs) / max(time_span, 1)
        
        avg_tx_size = np.mean([tx["value_usd"] for tx in txs])
        log_avg_size = np.log10(max(avg_tx_size, 1))
        
        inflows = sum(tx["value_usd"] for tx in txs if tx["direction"] == "inflow")
        outflows = sum(tx["value_usd"] for tx in txs if tx["direction"] == "outflow")
        total_flow = inflows + outflows
        net_flow_ratio = (inflows - outflows) / max(total_flow, 1)
        
        days_since_last = (datetime.utcnow() - txs[-1]["timestamp"]).days
        
        wallet_age = (txs[-1]["timestamp"] - txs[0]["timestamp"]).days + 1
        
        tx_sizes = [tx["value_usd"] for tx in txs]
        tx_size_std = np.std(tx_sizes) / max(np.mean(tx_sizes), 1)
        
        recent_cutoff = datetime.utcnow() - timedelta(days=7)
        recent_txs = [tx for tx in txs if tx["timestamp"] >= recent_cutoff]
        recent_activity_ratio = len(recent_txs) / len(txs)
        
        inflow_count = sum(1 for tx in txs if tx["direction"] == "inflow")
        outflow_count = sum(1 for tx in txs if tx["direction"] == "outflow")
        io_ratio = inflow_count / max(outflow_count, 1)
        
        features = np.array([
            tx_frequency,
            log_avg_size,
            net_flow_ratio,
            days_since_last,
            wallet_age,
            tx_size_std,
            recent_activity_ratio,
            io_ratio,
        ])
        
        return features
    
    def cluster_wallets(
        self,
        wallet_data: Dict[str, List[Dict]],
        method: str = "kmeans"
    ) -> Dict[str, str]:
        """
        Cluster wallets by behavior pattern.
        
        Args:
            wallet_data: Dict mapping wallet_address -> transactions
            method: Clustering method ('kmeans' or 'dbscan')
            
        Returns:
            Dict mapping wallet_address -> cluster_label
        """
        wallet_addresses = []
        feature_matrix = []
        
        for wallet_addr, transactions in wallet_data.items():
            features = self.extract_wallet_features(transactions)
            if features is not None:
                wallet_addresses.append(wallet_addr)
                feature_matrix.append(features)
        
        if len(feature_matrix) < self.n_clusters:
            logger.warning(f"Insufficient wallets for clustering: {len(feature_matrix)}")
            return {}
        
        feature_matrix = np.array(feature_matrix)
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(feature_matrix)
        
        if method == "kmeans":
            clusterer = KMeans(
                n_clusters=self.n_clusters,
                random_state=42,
                n_init=10
            )
        elif method == "dbscan":
            clusterer = DBSCAN(
                eps=0.5,
                min_samples=3
            )
        else:
            raise ValueError(f"Unknown clustering method: {method}")
        
        cluster_ids = clusterer.fit_predict(features_scaled)
        
        wallet_clusters = {}
        for wallet_addr, cluster_id in zip(wallet_addresses, cluster_ids):
            if cluster_id == -1:  # DBSCAN noise
                cluster_label = "unclustered"
            else:
                cluster_label = self.cluster_labels.get(cluster_id, f"cluster_{cluster_id}")
            
            wallet_clusters[wallet_addr] = cluster_label
        
        return wallet_clusters
    
    def get_cluster_statistics(
        self,
        wallet_data: Dict[str, List[Dict]],
        wallet_clusters: Dict[str, str]
    ) -> Dict[str, Dict]:
        """
        Compute statistics for each cluster.
        
        Args:
            wallet_data: Dict mapping wallet_address -> transactions
            wallet_clusters: Dict mapping wallet_address -> cluster_label
            
        Returns:
            Dict mapping cluster_label -> statistics
        """
        cluster_stats = {}
        
        clusters = {}
        for wallet_addr, cluster_label in wallet_clusters.items():
            if cluster_label not in clusters:
                clusters[cluster_label] = []
            clusters[cluster_label].append(wallet_addr)
        
        for cluster_label, wallet_addrs in clusters.items():
            total_flow_in = 0
            total_flow_out = 0
            total_txs = 0
            
            for wallet_addr in wallet_addrs:
                transactions = wallet_data.get(wallet_addr, [])
                
                for tx in transactions:
                    total_txs += 1
                    if tx["direction"] == "inflow":
                        total_flow_in += tx["value_usd"]
                    else:
                        total_flow_out += tx["value_usd"]
            
            net_flow = total_flow_in - total_flow_out
            
            cluster_stats[cluster_label] = {
                "wallet_count": len(wallet_addrs),
                "total_flow_in": total_flow_in,
                "total_flow_out": total_flow_out,
                "net_flow": net_flow,
                "total_transactions": total_txs,
                "avg_flow_per_wallet": net_flow / len(wallet_addrs),
                "interpretation": self._interpret_cluster(cluster_label, net_flow),
            }
        
        return cluster_stats
    
    def _interpret_cluster(self, cluster_label: str, net_flow: float) -> str:
        """Generate interpretation for cluster."""
        if cluster_label == "accumulation":
            return "Smart money accumulating positions - bullish signal"
        elif cluster_label == "distribution":
            return "Smart money distributing positions - bearish signal"
        elif cluster_label == "dormant_activation":
            return "Previously dormant wallets activating - potential trend change"
        else:
            return f"Cluster {cluster_label} with net flow ${net_flow:,.0f}"
    
    def generate_mock_wallet_data(
        self,
        n_wallets: int = 50,
        asset: str = "ETH"
    ) -> Dict[str, List[Dict]]:
        """Generate synthetic wallet transaction data for demo."""
        np.random.seed(42)
        
        wallet_data = {}
        
        for i in range(n_wallets):
            wallet_addr = f"0x{''.join(np.random.choice(list('0123456789abcdef')) for _ in range(40))}"
            
            n_txs = np.random.randint(5, 51)
            transactions = []
            
            pattern = np.random.choice(["accumulation", "distribution", "dormant"])
            
            for j in range(n_txs):
                days_ago = np.random.uniform(0, self.lookback_days)
                timestamp = datetime.utcnow() - timedelta(days=days_ago)
                
                if pattern == "accumulation":
                    direction = "inflow" if np.random.random() < 0.7 else "outflow"
                    value_usd = np.random.lognormal(13, 1)  # ~$250k-$5M
                elif pattern == "distribution":
                    direction = "outflow" if np.random.random() < 0.7 else "inflow"
                    value_usd = np.random.lognormal(13, 1)
                else:  # dormant
                    if j < n_txs // 2:
                        days_ago = np.random.uniform(20, self.lookback_days)
                        timestamp = datetime.utcnow() - timedelta(days=days_ago)
                    else:
                        days_ago = np.random.uniform(0, 5)
                        timestamp = datetime.utcnow() - timedelta(days=days_ago)
                    
                    direction = "inflow" if np.random.random() < 0.5 else "outflow"
                    value_usd = np.random.lognormal(12, 1.5)
                
                transactions.append({
                    "asset": asset,
                    "wallet_address": wallet_addr,
                    "direction": direction,
                    "value_usd": value_usd,
                    "timestamp": timestamp,
                })
            
            wallet_data[wallet_addr] = transactions
        
        return wallet_data
    
    def get_cluster_summary(
        self,
        wallet_clusters: Dict[str, str],
        cluster_stats: Dict[str, Dict]
    ) -> Dict:
        """Generate summary of clustering results."""
        total_wallets = len(wallet_clusters)
        
        cluster_counts = {}
        for cluster_label in wallet_clusters.values():
            cluster_counts[cluster_label] = cluster_counts.get(cluster_label, 0) + 1
        
        cluster_percentages = {
            label: (count / total_wallets) * 100
            for label, count in cluster_counts.items()
        }
        
        dominant_cluster = max(cluster_counts.items(), key=lambda x: x[1])[0]
        
        return {
            "total_wallets": total_wallets,
            "cluster_counts": cluster_counts,
            "cluster_percentages": cluster_percentages,
            "dominant_pattern": dominant_cluster,
            "cluster_stats": cluster_stats,
            "interpretation": self._interpret_dominant_pattern(
                dominant_cluster,
                cluster_percentages.get(dominant_cluster, 0)
            ),
        }
    
    def _interpret_dominant_pattern(
        self,
        dominant_cluster: str,
        percentage: float
    ) -> str:
        """Interpret dominant cluster pattern."""
        if dominant_cluster == "accumulation":
            if percentage >= 50:
                return "Strong accumulation signal - majority of smart money buying"
            else:
                return "Moderate accumulation signal - some smart money buying"
        elif dominant_cluster == "distribution":
            if percentage >= 50:
                return "Strong distribution signal - majority of smart money selling"
            else:
                return "Moderate distribution signal - some smart money selling"
        elif dominant_cluster == "dormant_activation":
            return "Dormant wallets activating - potential trend change ahead"
        else:
            return f"Mixed signals - no clear dominant pattern"

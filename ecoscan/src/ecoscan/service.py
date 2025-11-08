"""Ecoscan Service - Main orchestrator for ecosystem mapping and whale intelligence."""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional
import psycopg
from psycopg.rows import dict_row

from .config import (
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    ECOSCAN_UPDATE_INTERVAL,
)
from .models import (
    EcosystemMapper,
    WhaleTracker,
    SmartMoneyCluster,
    EcoscoreAggregator,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EcoscanService:
    """
    Main service orchestrator for Ecoscan.
    
    Coordinates:
    - Ecosystem mapping and EMI computation
    - Whale transaction tracking and WCF computation
    - Smart money clustering
    - Ecoscore aggregation
    """
    
    def __init__(self):
        self.ecosystem_mapper = EcosystemMapper()
        self.whale_tracker = WhaleTracker()
        self.smartmoney_cluster = SmartMoneyCluster()
        self.ecoscore_aggregator = EcoscoreAggregator()
        
        self.db_conn = None
        self.update_interval = ECOSCAN_UPDATE_INTERVAL
        
    async def connect_db(self):
        """Connect to PostgreSQL database."""
        try:
            self.db_conn = await psycopg.AsyncConnection.connect(
                f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}",
                row_factory=dict_row
            )
            logger.info("Connected to database")
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    async def close_db(self):
        """Close database connection."""
        if self.db_conn:
            await self.db_conn.close()
            logger.info("Database connection closed")
    
    async def get_assets(self) -> List[Dict]:
        """Get all assets from database."""
        async with self.db_conn.cursor() as cur:
            await cur.execute("SELECT * FROM assets ORDER BY symbol")
            return await cur.fetchall()
    
    async def update_ecosystem_data(self):
        """Update ecosystem data for all chains."""
        try:
            logger.info("Updating ecosystem data...")
            
            ecosystems = await self.ecosystem_mapper.get_all_ecosystems()
            
            async with self.db_conn.cursor() as cur:
                for ecosystem in ecosystems:
                    await cur.execute(
                        """
                        INSERT INTO ecosystems (
                            chain, protocols, tvl_usd, wallets_24h, 
                            volume_24h, bridge_flows, emi_score, updated_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            ecosystem["chain"],
                            ecosystem["protocols"],
                            ecosystem["tvl_usd"],
                            ecosystem["wallets_24h"],
                            ecosystem["volume_24h"],
                            ecosystem["bridge_flows"],
                            ecosystem["emi_score"],
                            ecosystem["updated_at"],
                        )
                    )
                
                await self.db_conn.commit()
            
            logger.info(f"Updated {len(ecosystems)} ecosystems")
            return ecosystems
            
        except Exception as e:
            logger.error(f"Error updating ecosystem data: {e}")
            return []
    
    async def update_whale_flows(self):
        """Update whale flow data for all assets."""
        try:
            logger.info("Updating whale flows...")
            
            assets = await self.get_assets()
            
            all_whale_data = {}
            
            for asset in assets:
                symbol = asset["symbol"]
                
                transactions = await self.whale_tracker.fetch_whale_transactions(symbol)
                
                if transactions:
                    all_whale_data[symbol] = transactions
                    
                    async with self.db_conn.cursor() as cur:
                        for tx in transactions:
                            await cur.execute(
                                """
                                INSERT INTO whale_flows (
                                    asset, wallet_tag, direction, value_usd, timestamp
                                ) VALUES (%s, %s, %s, %s, %s)
                                """,
                                (
                                    tx["asset"],
                                    tx["wallet_tag"],
                                    tx["direction"],
                                    tx["value_usd"],
                                    tx["timestamp"],
                                )
                            )
                        
                        await self.db_conn.commit()
            
            logger.info(f"Updated whale flows for {len(all_whale_data)} assets")
            return all_whale_data
            
        except Exception as e:
            logger.error(f"Error updating whale flows: {e}")
            return {}
    
    async def compute_ecoscores(self):
        """Compute Ecoscores for all assets."""
        try:
            logger.info("Computing Ecoscores...")
            
            assets = await self.get_assets()
            
            asset_scores = {}
            
            for asset in assets:
                symbol = asset["symbol"]
                
                emi = 50.0  # Default neutral
                
                transactions = await self.whale_tracker.fetch_whale_transactions(symbol)
                wcf = self.whale_tracker.compute_wcf(transactions)
                
                pretrend = await self._get_pretrend_from_alphabrain(symbol)
                
                asset_scores[symbol] = {
                    "emi": emi,
                    "wcf": wcf,
                    "pretrend": pretrend,
                }
            
            opportunities = self.ecoscore_aggregator.rank_opportunities(asset_scores)
            
            async with self.db_conn.cursor() as cur:
                for opp in opportunities:
                    await cur.execute(
                        """
                        INSERT INTO ecoscore_rankings (
                            asset, emi, wcf, ecoscore, signal_time
                        ) VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            opp["asset"],
                            opp["emi"],
                            opp["wcf"],
                            opp["ecoscore"],
                            datetime.utcnow(),
                        )
                    )
                
                await self.db_conn.commit()
            
            logger.info(f"Computed Ecoscores for {len(opportunities)} assets")
            return opportunities
            
        except Exception as e:
            logger.error(f"Error computing Ecoscores: {e}")
            return []
    
    async def _get_pretrend_from_alphabrain(self, symbol: str) -> Optional[float]:
        """Get Pre-Trend probability from AlphaBrain service."""
        return None
    
    async def get_summary(self) -> Dict:
        """Get comprehensive Ecoscan summary."""
        try:
            ecosystems = await self.ecosystem_mapper.get_all_ecosystems()
            top_ecosystems = self.ecosystem_mapper.get_top_ecosystems(ecosystems, n=10)
            
            assets = await self.get_assets()
            whale_data = {}
            for asset in assets[:10]:  # Top 10 assets
                symbol = asset["symbol"]
                transactions = await self.whale_tracker.fetch_whale_transactions(symbol)
                whale_data[symbol] = transactions
            
            whale_heatmap = self.whale_tracker.get_whale_heatmap_data(whale_data)
            
            opportunities = await self.compute_ecoscores()
            top_opportunities = self.ecoscore_aggregator.get_top_opportunities(opportunities, n=10)
            
            wallet_data = self.smartmoney_cluster.generate_mock_wallet_data(n_wallets=50)
            wallet_clusters = self.smartmoney_cluster.cluster_wallets(wallet_data)
            cluster_stats = self.smartmoney_cluster.get_cluster_statistics(wallet_data, wallet_clusters)
            cluster_summary = self.smartmoney_cluster.get_cluster_summary(wallet_clusters, cluster_stats)
            
            return {
                "service": "Ecoscan",
                "version": "0.1.0",
                "timestamp": datetime.utcnow().isoformat(),
                "ecosystems": {
                    "top_10": [
                        self.ecosystem_mapper.get_ecosystem_summary(eco)
                        for eco in top_ecosystems
                    ],
                    "total_tracked": len(ecosystems),
                },
                "whale_activity": {
                    "heatmap": whale_heatmap[:10],
                    "total_assets_tracked": len(whale_heatmap),
                },
                "opportunities": {
                    "top_10": top_opportunities,
                    "summary": self.ecoscore_aggregator.generate_ecoscore_summary(opportunities),
                },
                "smart_money": cluster_summary,
            }
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return {
                "service": "Ecoscan",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            }
    
    async def get_whale_alerts(self, lookback_hours: int = 24) -> List[Dict]:
        """Get whale transaction alerts."""
        try:
            assets = await self.get_assets()
            all_alerts = []
            
            for asset in assets:
                symbol = asset["symbol"]
                transactions = await self.whale_tracker.fetch_whale_transactions(
                    symbol,
                    lookback_hours=lookback_hours
                )
                
                alerts = self.whale_tracker.detect_whale_alerts(transactions)
                all_alerts.extend(alerts)
            
            all_alerts.sort(key=lambda x: x["value_usd"], reverse=True)
            
            return all_alerts
            
        except Exception as e:
            logger.error(f"Error getting whale alerts: {e}")
            return []
    
    async def run_periodic_update(self):
        """Run periodic updates of all data."""
        logger.info("Starting periodic update loop...")
        
        while True:
            try:
                await self.update_ecosystem_data()
                
                await self.update_whale_flows()
                
                await self.compute_ecoscores()
                
                logger.info(f"Update complete. Sleeping for {self.update_interval}s...")
                await asyncio.sleep(self.update_interval)
                
            except Exception as e:
                logger.error(f"Error in periodic update: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying


service = EcoscanService()

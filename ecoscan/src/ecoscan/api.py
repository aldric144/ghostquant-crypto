"""Ecoscan API - FastAPI endpoints for ecosystem mapping and whale intelligence."""

import logging
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .service import service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GhostQuant Ecoscan API",
    description="Ecosystem Mapper + Whale Intelligence",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

_cache = {}


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    try:
        await service.connect_db()
        logger.info("Ecoscan API started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    try:
        await service.close_db()
        logger.info("Ecoscan API shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "ecoscan",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/ecoscan/summary")
async def get_summary():
    """
    Get comprehensive Ecoscan summary.
    
    Returns:
        - Top 10 ecosystems by EMI
        - Whale activity heatmap
        - Top 10 Ecoscore opportunities
        - Smart money cluster analysis
    
    Cached for 60s for performance.
    """
    try:
        cache_key = "ecoscan:summary"
        if cache_key in _cache:
            cached_data, cached_time = _cache[cache_key]
            if (datetime.utcnow() - cached_time).total_seconds() < 60:
                return cached_data
        
        summary = await service.get_summary()
        _cache[cache_key] = (summary, datetime.utcnow())
        return summary
    except Exception as e:
        logger.error(f"Error getting summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/ecosystems")
async def get_ecosystems(
    limit: int = Query(10, ge=1, le=50, description="Number of ecosystems to return")
):
    """
    Get top ecosystems ranked by EMI.
    
    Args:
        limit: Number of ecosystems to return (1-50)
        
    Returns:
        List of ecosystems with EMI scores
    """
    try:
        ecosystems = await service.ecosystem_mapper.get_all_ecosystems()
        top_ecosystems = service.ecosystem_mapper.get_top_ecosystems(ecosystems, n=limit)
        
        return {
            "ecosystems": [
                service.ecosystem_mapper.get_ecosystem_summary(eco)
                for eco in top_ecosystems
            ],
            "total_tracked": len(ecosystems),
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting ecosystems: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/whales")
async def get_whale_activity(
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """
    Get whale activity heatmap and summary.
    
    Args:
        lookback_hours: Hours to look back (1-168)
        
    Returns:
        Whale activity heatmap with WCF scores
    """
    try:
        assets = await service.get_assets()
        whale_data = {}
        
        for asset in assets[:20]:  # Top 20 assets
            symbol = asset["symbol"]
            transactions = await service.whale_tracker.fetch_whale_transactions(
                symbol,
                lookback_hours=lookback_hours
            )
            whale_data[symbol] = transactions
        
        heatmap = service.whale_tracker.get_whale_heatmap_data(whale_data)
        
        detailed_summaries = []
        for symbol, transactions in list(whale_data.items())[:10]:
            summary = service.whale_tracker.get_whale_flow_summary(
                transactions,
                lookback_hours=lookback_hours
            )
            summary["asset"] = symbol
            detailed_summaries.append(summary)
        
        return {
            "heatmap": heatmap,
            "detailed_summaries": detailed_summaries,
            "lookback_hours": lookback_hours,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting whale activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/ecoscore")
async def get_ecoscore_rankings(
    limit: int = Query(10, ge=1, le=50, description="Number of opportunities to return"),
    min_ecoscore: float = Query(0, ge=0, le=100, description="Minimum Ecoscore threshold")
):
    """
    Get Ecoscore rankings for all assets.
    
    Args:
        limit: Number of opportunities to return (1-50)
        min_ecoscore: Minimum Ecoscore threshold (0-100)
        
    Returns:
        Ranked list of opportunities with Ecoscores
    """
    try:
        opportunities = await service.compute_ecoscores()
        
        top_opportunities = service.ecoscore_aggregator.get_top_opportunities(
            opportunities,
            n=limit,
            min_ecoscore=min_ecoscore
        )
        
        summary = service.ecoscore_aggregator.generate_ecoscore_summary(opportunities)
        
        return {
            "opportunities": top_opportunities,
            "summary": summary,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting Ecoscore rankings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/alerts")
async def get_whale_alerts(
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    min_value_usd: float = Query(10_000_000, ge=0, description="Minimum transaction value")
):
    """
    Get whale transaction alerts.
    
    Args:
        lookback_hours: Hours to look back (1-168)
        min_value_usd: Minimum transaction value for alerts
        
    Returns:
        List of significant whale transactions
    """
    try:
        all_alerts = await service.get_whale_alerts(lookback_hours=lookback_hours)
        
        filtered_alerts = [
            alert for alert in all_alerts
            if alert["value_usd"] >= min_value_usd
        ]
        
        return {
            "alerts": filtered_alerts,
            "total_alerts": len(filtered_alerts),
            "lookback_hours": lookback_hours,
            "min_value_usd": min_value_usd,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting whale alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/smartmoney")
async def get_smartmoney_clusters():
    """
    Get smart money cluster analysis.
    
    Returns:
        Wallet clustering results with behavior patterns
    """
    try:
        wallet_data = service.smartmoney_cluster.generate_mock_wallet_data(n_wallets=50)
        
        wallet_clusters = service.smartmoney_cluster.cluster_wallets(wallet_data)
        
        cluster_stats = service.smartmoney_cluster.get_cluster_statistics(
            wallet_data,
            wallet_clusters
        )
        
        cluster_summary = service.smartmoney_cluster.get_cluster_summary(
            wallet_clusters,
            cluster_stats
        )
        
        return {
            "cluster_summary": cluster_summary,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting smart money clusters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/ecosystem/{chain}")
async def get_ecosystem_detail(chain: str):
    """
    Get detailed ecosystem data for a specific chain.
    
    Args:
        chain: Chain name (e.g., 'ethereum', 'arbitrum')
        
    Returns:
        Detailed ecosystem metrics and EMI breakdown
    """
    try:
        ecosystem_data = await service.ecosystem_mapper.fetch_ecosystem_data(chain)
        
        if not ecosystem_data:
            raise HTTPException(status_code=404, detail=f"Chain '{chain}' not found")
        
        emi_score = service.ecosystem_mapper.compute_emi(ecosystem_data)
        ecosystem_data["emi_score"] = emi_score
        
        summary = service.ecosystem_mapper.get_ecosystem_summary(ecosystem_data)
        
        return {
            "ecosystem": summary,
            "raw_data": ecosystem_data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ecosystem detail for {chain}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/ecosystem/{chain}/analysis")
async def get_ecosystem_analysis(chain: str):
    """
    Get detailed EMI analysis with breakdown for a specific chain.
    
    Args:
        chain: Chain name (e.g., 'ethereum', 'arbitrum')
        
    Returns:
        EMI breakdown with contributions, drivers, and rationale
    """
    try:
        ecosystem_data = await service.ecosystem_mapper.fetch_ecosystem_data(chain)
        
        if not ecosystem_data:
            raise HTTPException(status_code=404, detail=f"Chain '{chain}' not found")
        
        analysis = service.ecosystem_mapper.compute_emi_breakdown(ecosystem_data)
        
        return {
            "chain": chain,
            "analysis": analysis,
            "metrics": {
                "tvl_usd": ecosystem_data["tvl_usd"],
                "wallets_24h": ecosystem_data["wallets_24h"],
                "volume_24h": ecosystem_data["volume_24h"],
                "bridge_flows": ecosystem_data["bridge_flows"],
                "protocols_count": len(ecosystem_data["protocols"])
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ecosystem analysis for {chain}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/whale/{asset}")
async def get_whale_detail(
    asset: str,
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """
    Get detailed whale activity for a specific asset.
    
    Args:
        asset: Asset symbol (e.g., 'BTC', 'ETH')
        lookback_hours: Hours to look back (1-168)
        
    Returns:
        Detailed whale transaction history and WCF breakdown
    """
    try:
        transactions = await service.whale_tracker.fetch_whale_transactions(
            asset,
            lookback_hours=lookback_hours
        )
        
        if not transactions:
            return {
                "asset": asset,
                "transactions": [],
                "summary": {
                    "flow_in_usd": 0,
                    "flow_out_usd": 0,
                    "net_flow_usd": 0,
                    "wcf": 50.0,
                    "sentiment": "neutral",
                },
                "timestamp": datetime.utcnow().isoformat(),
            }
        
        summary = service.whale_tracker.get_whale_flow_summary(
            transactions,
            lookback_hours=lookback_hours
        )
        
        return {
            "asset": asset,
            "transactions": transactions[:50],
            "summary": summary,
            "lookback_hours": lookback_hours,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting whale detail for {asset}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/bridges")
async def get_bridge_flows(
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """
    Get cross-chain bridge flow data.
    
    Args:
        lookback_hours: Hours to look back (1-168)
        
    Returns:
        Bridge flow summary with inflows/outflows by chain
    """
    try:
        bridge_flows = await service.bridge_monitor.get_all_bridge_flows(
            lookback_hours=lookback_hours
        )
        
        bridge_summary = service.bridge_monitor.get_bridge_flow_summary(bridge_flows)
        
        anomalies = []
        for flow in bridge_flows[:10]:
            flow_anomalies = service.bridge_monitor.detect_unusual_bridge_activity(flow)
            anomalies.extend(flow_anomalies)
        
        return {
            "flows": bridge_flows,
            "summary": bridge_summary,
            "anomalies": anomalies,
            "lookback_hours": lookback_hours,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting bridge flows: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/bridge-leaderboard")
async def get_bridge_leaderboard(
    period: str = Query("24h", regex="^(1h|24h|7d)$", description="Time period"),
    limit: int = Query(20, ge=1, le=50, description="Number of results")
):
    """
    Bridge Flow Leaderboard - Phase 1 Quick Win.
    
    Shows which bridges and chains are moving the most value.
    
    Args:
        period: Time period (1h, 24h, 7d)
        limit: Number of results (1-50)
        
    Returns:
        Leaderboard of bridges and chains by flow volume
    """
    try:
        period_hours = {
            "1h": 1,
            "24h": 24,
            "7d": 168,
        }[period]
        
        bridge_flows = await service.bridge_monitor.get_all_bridge_flows(
            lookback_hours=period_hours
        )
        
        bridge_summary = service.bridge_monitor.get_bridge_flow_summary(bridge_flows)
        
        bridge_leaderboard = []
        for bridge_name, bridge_data in bridge_summary["bridge_totals"].items():
            total_volume = bridge_data["inflows"] + bridge_data["outflows"]
            bridge_leaderboard.append({
                "bridge": bridge_name,
                "total_volume_usd": total_volume,
                "inflows_usd": bridge_data["inflows"],
                "outflows_usd": bridge_data["outflows"],
                "net_flow_usd": bridge_data["net_flow"],
                "tx_count": bridge_data["tx_count"],
                "sentiment": service.bridge_monitor.classify_bridge_sentiment(
                    bridge_data["net_flow"],
                    total_volume
                ),
            })
        
        bridge_leaderboard.sort(key=lambda x: x["total_volume_usd"], reverse=True)
        bridge_leaderboard = bridge_leaderboard[:limit]
        
        chain_leaderboard = []
        for flow in bridge_flows:
            total_volume = flow["inflows"] + flow["outflows"]
            chain_leaderboard.append({
                "chain": flow["chain"],
                "total_volume_usd": total_volume,
                "inflows_usd": flow["inflows"],
                "outflows_usd": flow["outflows"],
                "net_flow_usd": flow["net_flow"],
                "sentiment": service.bridge_monitor.classify_bridge_sentiment(
                    flow["net_flow"],
                    total_volume
                ),
            })
        
        chain_leaderboard.sort(key=lambda x: x["total_volume_usd"], reverse=True)
        chain_leaderboard = chain_leaderboard[:limit]
        
        return {
            "period": period,
            "period_hours": period_hours,
            "bridge_leaderboard": bridge_leaderboard,
            "chain_leaderboard": chain_leaderboard,
            "total_volume_usd": bridge_summary["total_inflows"] + bridge_summary["total_outflows"],
            "total_net_flow_usd": bridge_summary["total_net_flow"],
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting bridge leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ecoscan/bridges/{chain}")
async def get_bridge_flows_by_chain(
    chain: str,
    lookback_hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """
    Get bridge flow data for a specific chain.
    
    Args:
        chain: Chain name (e.g., 'ethereum', 'arbitrum')
        lookback_hours: Hours to look back (1-168)
        
    Returns:
        Detailed bridge flow data for the chain
    """
    try:
        flow_data = await service.bridge_monitor.fetch_bridge_flows(
            chain,
            lookback_hours=lookback_hours
        )
        
        if not flow_data:
            raise HTTPException(status_code=404, detail=f"Chain '{chain}' not found")
        
        sentiment = service.bridge_monitor.classify_bridge_sentiment(
            flow_data["net_flow"],
            flow_data["inflows"] + flow_data["outflows"]
        )
        
        anomalies = service.bridge_monitor.detect_unusual_bridge_activity(flow_data)
        
        return {
            "chain": chain,
            "flows": flow_data,
            "sentiment": sentiment,
            "anomalies": anomalies,
            "lookback_hours": lookback_hours,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bridge flows for {chain}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)

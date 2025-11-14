"""
Whale fusion service - integrates Ecoscan whale intelligence into momentum scoring.
"""
import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import aiohttp

logger = logging.getLogger(__name__)


class WhaleFusion:
    """
    Integrate whale intelligence from Ecoscan into momentum scoring.
    Computes whale_confidence (0-1) based on large transfers, recency, and size.
    """
    
    def __init__(self):
        self.ecoscan_api = os.getenv("NEXT_PUBLIC_ECOSCAN_API", "http://localhost:8082")
        self.whale_min_usd = float(os.getenv("WHALE_MIN_USD", 100000))
        self.use_mock = os.getenv("USE_MOCK_ECOSCAN_DATA", "true").lower() == "true"
    
    async def get_whale_confidence(self, symbol: str) -> float:
        """
        Get whale confidence score (0-1) for a symbol.
        Based on recent large transfers and their size relative to historical average.
        """
        try:
            if self.use_mock:
                return (hash(symbol) % 100) / 100.0
            
            url = f"{self.ecoscan_api}/whales"
            params = {"symbol": symbol.upper(), "hours": 24}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=5) as response:
                    if response.status != 200:
                        logger.warning(f"Ecoscan API returned {response.status} for {symbol}")
                        return 0.0
                    
                    data = await response.json()
                    transfers = data.get("transfers", [])
                    
                    if not transfers:
                        return 0.0
                    
                    
                    total_usd = sum(t.get("amount_usd", 0) for t in transfers)
                    count = len(transfers)
                    
                    count_score = min(1.0, count / 5)  # 5+ transfers = max
                    size_score = min(1.0, total_usd / (self.whale_min_usd * 10))  # 10x min = max
                    
                    now = datetime.utcnow()
                    recency_scores = []
                    for t in transfers:
                        ts = datetime.fromisoformat(t.get("timestamp", "").replace("Z", "+00:00"))
                        hours_ago = (now - ts).total_seconds() / 3600
                        recency = max(0, 1 - (hours_ago / 24))  # Linear decay over 24h
                        recency_scores.append(recency)
                    
                    avg_recency = sum(recency_scores) / len(recency_scores) if recency_scores else 0
                    
                    confidence = (count_score * 0.3) + (size_score * 0.4) + (avg_recency * 0.3)
                    
                    return min(1.0, confidence)
        
        except Exception as e:
            logger.error(f"Error getting whale confidence for {symbol}: {e}")
            return 0.0
    
    async def get_whale_details(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed whale activity for a symbol.
        Returns transfer details, wallet clusters, and flow patterns.
        """
        try:
            if self.use_mock:
                confidence = await self.get_whale_confidence(symbol)
                if confidence < 0.3:
                    return None
                
                return {
                    "total_transfers": int(confidence * 10),
                    "total_usd": confidence * 1000000,
                    "unique_wallets": int(confidence * 5),
                    "top_transfers": [
                        {
                            "from": "0x1234...5678",
                            "to": "0xabcd...ef00",
                            "amount_usd": confidence * 500000,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    ],
                    "flow_pattern": "accumulation" if confidence > 0.6 else "distribution"
                }
            
            url = f"{self.ecoscan_api}/whales"
            params = {"symbol": symbol.upper(), "hours": 24, "details": "true"}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=5) as response:
                    if response.status != 200:
                        return None
                    
                    data = await response.json()
                    transfers = data.get("transfers", [])
                    
                    if not transfers:
                        return None
                    
                    inflows = sum(1 for t in transfers if t.get("direction") == "in")
                    outflows = sum(1 for t in transfers if t.get("direction") == "out")
                    
                    if inflows > outflows * 1.5:
                        flow_pattern = "accumulation"
                    elif outflows > inflows * 1.5:
                        flow_pattern = "distribution"
                    else:
                        flow_pattern = "neutral"
                    
                    return {
                        "total_transfers": len(transfers),
                        "total_usd": sum(t.get("amount_usd", 0) for t in transfers),
                        "unique_wallets": len(set(t.get("from_address") for t in transfers)),
                        "top_transfers": transfers[:5],
                        "flow_pattern": flow_pattern,
                        "inflows": inflows,
                        "outflows": outflows
                    }
        
        except Exception as e:
            logger.error(f"Error getting whale details for {symbol}: {e}")
            return None

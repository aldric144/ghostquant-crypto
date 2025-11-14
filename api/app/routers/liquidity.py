"""
Liquidity API endpoints for order book depth, spreads, and slippage estimates.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta

from ..db import get_db
from ..services.redis_cache import RedisCache
from ..services.slippage_estimator import get_slippage_estimator
from ..utils.feature_flags import is_feature_enabled
from ..utils.cache_helper import get_cached, set_cached

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/liquidity", tags=["liquidity"])

redis_cache = RedisCache()


@router.get("/asset/{symbol}")
async def get_asset_liquidity(
    symbol: str,
    include_dex: bool = Query(True, description="Include DEX liquidity metrics")
) -> Dict[str, Any]:
    """
    Get comprehensive liquidity metrics for an asset.
    
    Returns:
    - Order book depth (bid/ask spreads)
    - Slippage estimates for various trade sizes
    - DEX pool liquidity (if applicable)
    - Historical liquidity trends
    
    Cached for 60s to reduce load.
    """
    try:
        cache_key = f"liquidity:asset:{symbol}:{include_dex}"
        cached_data = await redis_cache.get(cache_key)
        
        if cached_data:
            logger.info(f"Returning cached liquidity for {symbol}")
            return cached_data
        
        async with get_db() as cur:
            await cur.execute(
                "SELECT asset_id FROM assets WHERE UPPER(symbol) = UPPER(%s)",
                (symbol,)
            )
            asset_row = await cur.fetchone()
            
            if not asset_row:
                raise HTTPException(status_code=404, detail=f"Asset {symbol} not found")
            
            asset_id = asset_row['asset_id']
            
            await cur.execute(
                """
                SELECT 
                    bid_px, ask_px, bid_sz, ask_sz, spread_bps, ts
                FROM books
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
                """,
                (asset_id,)
            )
            book_row = await cur.fetchone()
            
            await cur.execute(
                """
                SELECT 
                    bid_px, ask_px, spread_bps, ts
                FROM books
                WHERE asset_id = %s AND ts > NOW() - INTERVAL '1 hour'
                ORDER BY ts DESC
                LIMIT 60
                """,
                (asset_id,)
            )
            book_history = await cur.fetchall()
            
            await cur.execute(
                """
                SELECT 
                    funding_8h, oi, basis_bps, liq_1h, ts
                FROM derivatives
                WHERE asset_id = %s
                ORDER BY ts DESC
                LIMIT 1
                """,
                (asset_id,)
            )
            derivatives_row = await cur.fetchone()
            
            dex_liquidity = None
            if include_dex:
                await cur.execute(
                    """
                    SELECT 
                        dp.pool_id, dp.chain, dp.address, dp.token0, dp.token1, dp.fee_bps,
                        dm.tvl_usd, dm.vol_24h, dm.depth_1pct, dm.ts
                    FROM dex_pools dp
                    LEFT JOIN LATERAL (
                        SELECT tvl_usd, vol_24h, depth_1pct, ts
                        FROM dex_metrics
                        WHERE pool_id = dp.pool_id
                        ORDER BY ts DESC
                        LIMIT 1
                    ) dm ON true
                    WHERE UPPER(dp.token0) = UPPER(%s) OR UPPER(dp.token1) = UPPER(%s)
                    """,
                    (symbol, symbol)
                )
                dex_pools = await cur.fetchall()
                
                if dex_pools:
                    dex_liquidity = []
                    for pool in dex_pools:
                        dex_liquidity.append({
                            "pool_id": pool['pool_id'],
                            "chain": pool['chain'],
                            "address": pool['address'],
                            "pair": f"{pool['token0']}/{pool['token1']}",
                            "fee_bps": pool['fee_bps'],
                            "tvl_usd": float(pool['tvl_usd']) if pool['tvl_usd'] else None,
                            "volume_24h": float(pool['vol_24h']) if pool['vol_24h'] else None,
                            "depth_1pct": float(pool['depth_1pct']) if pool['depth_1pct'] else None,
                            "last_updated": pool['ts'].isoformat() if pool['ts'] else None
                        })
        
        result = {
            "symbol": symbol.upper(),
            "timestamp": datetime.utcnow().isoformat(),
            "cex_liquidity": None,
            "dex_liquidity": dex_liquidity,
            "derivatives": None,
            "liquidity_score": None,
            "slippage_estimates": None
        }
        
        if book_row:
            bid_px = float(book_row['bid_px']) if book_row['bid_px'] else None
            ask_px = float(book_row['ask_px']) if book_row['ask_px'] else None
            bid_sz = float(book_row['bid_sz']) if book_row['bid_sz'] else None
            ask_sz = float(book_row['ask_sz']) if book_row['ask_sz'] else None
            spread_bps = float(book_row['spread_bps']) if book_row['spread_bps'] else None
            
            mid_price = (bid_px + ask_px) / 2 if bid_px and ask_px else None
            
            avg_spread = None
            if book_history:
                spreads = [float(row['spread_bps']) for row in book_history if row['spread_bps']]
                avg_spread = sum(spreads) / len(spreads) if spreads else None
            
            result["cex_liquidity"] = {
                "bid_price": bid_px,
                "ask_price": ask_px,
                "mid_price": mid_price,
                "bid_size": bid_sz,
                "ask_size": ask_sz,
                "spread_bps": spread_bps,
                "spread_pct": spread_bps / 100 if spread_bps else None,
                "avg_spread_1h_bps": avg_spread,
                "last_updated": book_row['ts'].isoformat()
            }
            
            if mid_price and bid_sz and ask_sz:
                result["slippage_estimates"] = {
                    "buy": {
                        "1000_usd": estimate_slippage(1000, ask_px, ask_sz, mid_price, "buy"),
                        "5000_usd": estimate_slippage(5000, ask_px, ask_sz, mid_price, "buy"),
                        "10000_usd": estimate_slippage(10000, ask_px, ask_sz, mid_price, "buy"),
                        "50000_usd": estimate_slippage(50000, ask_px, ask_sz, mid_price, "buy"),
                    },
                    "sell": {
                        "1000_usd": estimate_slippage(1000, bid_px, bid_sz, mid_price, "sell"),
                        "5000_usd": estimate_slippage(5000, bid_px, bid_sz, mid_price, "sell"),
                        "10000_usd": estimate_slippage(10000, bid_px, bid_sz, mid_price, "sell"),
                        "50000_usd": estimate_slippage(50000, bid_px, bid_sz, mid_price, "sell"),
                    }
                }
        
        if derivatives_row:
            result["derivatives"] = {
                "funding_rate_8h": float(derivatives_row['funding_8h']) if derivatives_row['funding_8h'] else None,
                "open_interest": float(derivatives_row['oi']) if derivatives_row['oi'] else None,
                "basis_bps": float(derivatives_row['basis_bps']) if derivatives_row['basis_bps'] else None,
                "liquidations_1h": float(derivatives_row['liq_1h']) if derivatives_row['liq_1h'] else None,
                "last_updated": derivatives_row['ts'].isoformat()
            }
        
        liquidity_score = calculate_liquidity_score(
            spread_bps=spread_bps,
            bid_sz=bid_sz,
            ask_sz=ask_sz,
            dex_tvl=sum([p['tvl_usd'] for p in (dex_liquidity or []) if p['tvl_usd']]) if dex_liquidity else None
        )
        result["liquidity_score"] = liquidity_score
        
        await redis_cache.set(cache_key, result, ttl=60)
        
        logger.info(f"Returning liquidity data for {symbol}")
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting liquidity for {symbol}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch liquidity data: {str(e)}")


def estimate_slippage(
    trade_size_usd: float,
    price: float,
    size: float,
    mid_price: float,
    side: str
) -> Dict[str, float]:
    """
    Estimate slippage for a given trade size.
    
    Simple model: assumes linear price impact based on order book depth.
    Real implementation would use full order book depth.
    """
    if not price or not size or not mid_price:
        return {"slippage_bps": None, "effective_price": None}
    
    trade_size_base = trade_size_usd / price
    
    if size > 0:
        impact_ratio = min(trade_size_base / size, 1.0)
        spread_bps = abs((price - mid_price) / mid_price) * 10000
        slippage_bps = impact_ratio * spread_bps * 2  # 2x multiplier for price impact
    else:
        slippage_bps = 100  # High slippage if no liquidity
    
    if side == "buy":
        effective_price = price * (1 + slippage_bps / 10000)
    else:
        effective_price = price * (1 - slippage_bps / 10000)
    
    return {
        "slippage_bps": round(slippage_bps, 2),
        "effective_price": round(effective_price, 6)
    }


def calculate_liquidity_score(
    spread_bps: Optional[float],
    bid_sz: Optional[float],
    ask_sz: Optional[float],
    dex_tvl: Optional[float]
) -> Optional[float]:
    """
    Calculate overall liquidity score (0-100).
    
    Factors:
    - Spread (lower is better)
    - Order book depth (higher is better)
    - DEX TVL (higher is better)
    """
    if not spread_bps:
        return None
    
    score = 100.0
    
    spread_penalty = min((spread_bps / 100) * 40, 40)
    score -= spread_penalty
    
    if bid_sz and ask_sz:
        total_depth = bid_sz + ask_sz
        depth_bonus = min((total_depth / 1000000) * 30, 30)
        score += depth_bonus - 30  # Normalize
    else:
        score -= 30
    
    if dex_tvl:
        tvl_bonus = min((dex_tvl / 10000000) * 30, 30)
        score += tvl_bonus - 30  # Normalize
    else:
        score -= 30
    
    return max(0, min(100, score))


@router.get("/summary")
async def get_liquidity_summary(
    symbols: str = Query(..., description="Comma-separated list of symbols")
) -> List[Dict[str, Any]]:
    """
    Get liquidity summary for multiple assets.
    
    Returns condensed liquidity metrics for quick comparison.
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        results = []
        for symbol in symbol_list:
            try:
                data = await get_asset_liquidity(symbol, include_dex=False)
                
                summary = {
                    "symbol": symbol,
                    "liquidity_score": data.get("liquidity_score"),
                    "spread_bps": data.get("cex_liquidity", {}).get("spread_bps") if data.get("cex_liquidity") else None,
                    "slippage_5k_buy_bps": data.get("slippage_estimates", {}).get("buy", {}).get("5000_usd", {}).get("slippage_bps") if data.get("slippage_estimates") else None,
                }
                results.append(summary)
            except Exception as e:
                logger.warning(f"Failed to get liquidity for {symbol}: {e}")
                results.append({
                    "symbol": symbol,
                    "liquidity_score": None,
                    "spread_bps": None,
                    "slippage_5k_buy_bps": None,
                    "error": str(e)
                })
        
        return results
    
    except Exception as e:
        logger.error(f"Error getting liquidity summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch liquidity summary: {str(e)}")


@router.get("/market")
async def get_market_liquidity(
    symbol: str = Query(..., description="Trading symbol (e.g., BTC, ETH)"),
    size_usd: Optional[float] = Query(None, description="Trade size in USD (default: 10000)")
) -> Dict[str, Any]:
    """
    Get market liquidity with slippage estimation and best pair suggestion.
    
    Phase 2 feature: Provides orderbook depth, slippage estimates for various sizes,
    and suggests the best exchange/pair for minimal slippage.
    
    Args:
        symbol: Trading symbol
        size_usd: Trade size in USD (optional, defaults to 10000)
        
    Returns:
        Dictionary with depth, slippage estimates, and best pair suggestion
    """
    if not is_feature_enabled('liq_estimator'):
        raise HTTPException(status_code=501, detail="Liquidity estimator feature is not enabled")
    
    # Check cache
    cache_key = f"market:liquidity:{symbol}:{size_usd or 10000}"
    cached = get_cached(cache_key)
    if cached:
        logger.info(f"Returning cached market liquidity for {symbol}")
        return cached
    
    try:
        estimator = get_slippage_estimator()
        result = estimator.estimate_liquidity(symbol, size_usd)
        
        # Cache for 30 seconds
        set_cached(cache_key, result, ttl=30)
        
        logger.info(f"Fetched market liquidity for {symbol} (size=${size_usd or 10000})")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching market liquidity for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market liquidity: {str(e)}")

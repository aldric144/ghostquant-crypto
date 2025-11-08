from typing import Dict, Any

def calculate_slippage_bps(
    size: float,
    avg_daily_volume: float,
    spread_bps: float = 5.0,
    market_impact_factor: float = 0.1
) -> float:
    if avg_daily_volume == 0:
        return spread_bps
    
    size_ratio = size / avg_daily_volume
    
    market_impact = market_impact_factor * (size_ratio ** 0.5) * 10000
    
    total_slippage = spread_bps + market_impact
    
    return min(total_slippage, 100.0)

def apply_slippage(
    price: float,
    size: float,
    side: str,
    avg_daily_volume: float,
    spread_bps: float = 5.0
) -> Dict[str, Any]:
    slippage_bps = calculate_slippage_bps(size, avg_daily_volume, spread_bps)
    
    slippage_multiplier = slippage_bps / 10000
    
    if side.lower() == 'buy':
        executed_price = price * (1 + slippage_multiplier)
    else:
        executed_price = price * (1 - slippage_multiplier)
    
    return {
        'executed_price': executed_price,
        'slippage_bps': slippage_bps,
        'slippage_cost': abs(executed_price - price) * size
    }

def calculate_fees(size: float, price: float, fee_rate: float = 0.001) -> float:
    return size * price * fee_rate

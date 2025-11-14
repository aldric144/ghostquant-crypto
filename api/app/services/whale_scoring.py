"""
Whale event scoring module with refined formulas.

Implements:
- Min-Max normalization over 7-day window
- Exponential decay: e^(-t/τ) where τ=12 hours
- Address recurrence weighting: 1.5x for >10 events in 7 days
- Impact score calculation
"""
import math
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from collections import Counter

logger = logging.getLogger(__name__)


def compute_min_max_bounds(events: List[Dict[str, Any]], window_days: int = 7) -> Tuple[float, float]:
    """
    Compute min and max USD amounts over the time window.
    
    Args:
        events: List of whale events with amount_usd and timestamp
        window_days: Time window in days (default: 7)
        
    Returns:
        Tuple of (min_amount, max_amount)
    """
    if not events:
        return 0.0, 0.0
    
    now = datetime.utcnow()
    cutoff = now - timedelta(days=window_days)
    
    amounts = []
    for event in events:
        event_time = event.get('timestamp')
        if isinstance(event_time, str):
            event_time = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
        
        if event_time >= cutoff:
            amounts.append(event.get('amount_usd', 0))
    
    if not amounts:
        return 0.0, 0.0
    
    return min(amounts), max(amounts)


def normalize_amount(amount: float, min_amount: float, max_amount: float) -> float:
    """
    Min-Max normalization of amount.
    
    Args:
        amount: Amount to normalize
        min_amount: Minimum amount in dataset
        max_amount: Maximum amount in dataset
        
    Returns:
        Normalized value between 0 and 1
    """
    if max_amount == min_amount:
        return 1.0
    
    if max_amount == 0:
        return 0.0
    
    normalized = (amount - min_amount) / (max_amount - min_amount)
    return max(0.0, min(1.0, normalized))


def recency_decay(hours_ago: float, tau: float = 12.0) -> float:
    """
    Exponential decay function: e^(-t/τ)
    
    Args:
        hours_ago: Time since event in hours
        tau: Decay constant in hours (default: 12)
        
    Returns:
        Decay factor between 0 and 1
    """
    if hours_ago < 0:
        hours_ago = 0
    
    return math.exp(-hours_ago / tau)


def compute_address_recurrence_weight(
    address: str,
    events: List[Dict[str, Any]],
    window_days: int = 7,
    threshold: int = 10
) -> float:
    """
    Compute recurrence weight for an address.
    
    Returns 1.5 if address has >10 events in the last 7 days, else 1.0.
    
    Args:
        address: Address to check
        events: List of all events
        window_days: Time window in days (default: 7)
        threshold: Event count threshold (default: 10)
        
    Returns:
        Weight factor (1.0 or 1.5)
    """
    now = datetime.utcnow()
    cutoff = now - timedelta(days=window_days)
    
    count = 0
    for event in events:
        event_time = event.get('timestamp')
        if isinstance(event_time, str):
            event_time = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
        
        if event_time >= cutoff:
            if event.get('from_address') == address or event.get('to_address') == address:
                count += 1
    
    return 1.5 if count > threshold else 1.0


def compute_impact_score(
    event: Dict[str, Any],
    all_events: List[Dict[str, Any]],
    now: datetime = None
) -> float:
    """
    Compute impact score for a whale event.
    
    Formula: normalized(usd_volume) * recency_decay * address_recurrence_weight
    
    Args:
        event: The event to score
        all_events: All events for normalization and recurrence calculation
        now: Current time (default: utcnow)
        
    Returns:
        Impact score (0-100 scale)
    """
    if now is None:
        now = datetime.utcnow()
    
    amount_usd = event.get('amount_usd', 0)
    event_time = event.get('timestamp')
    if isinstance(event_time, str):
        event_time = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
    
    min_amount, max_amount = compute_min_max_bounds(all_events, window_days=7)
    
    normalized = normalize_amount(amount_usd, min_amount, max_amount)
    
    hours_ago = (now - event_time).total_seconds() / 3600
    decay = recency_decay(hours_ago, tau=12.0)
    
    from_addr = event.get('from_address', '')
    to_addr = event.get('to_address', '')
    
    from_weight = compute_address_recurrence_weight(from_addr, all_events)
    to_weight = compute_address_recurrence_weight(to_addr, all_events)
    
    recurrence_weight = max(from_weight, to_weight)
    
    impact = normalized * decay * recurrence_weight * 100
    
    return round(impact, 2)


def generate_why_explanation(event: Dict[str, Any], address_labels: Dict[str, str] = None) -> str:
    """
    Generate "Why This Matters" explanation for a whale event.
    
    Uses rule-based logic to explain the significance of the transaction.
    
    Args:
        event: Whale event with type, from, to, amount
        address_labels: Optional mapping of addresses to labels (CEX, cold_wallet, etc.)
        
    Returns:
        Explanation string
    """
    if address_labels is None:
        address_labels = {}
    
    event_type = event.get('type', 'transfer').lower()
    from_addr = event.get('from_address', '')
    to_addr = event.get('to_address', '')
    amount_usd = event.get('amount_usd', 0)
    symbol = event.get('symbol', '')
    
    from_label = address_labels.get(from_addr, 'unknown')
    to_label = address_labels.get(to_addr, 'unknown')
    
    if from_label == 'cold_wallet' and to_label == 'cex':
        return f"Large transfer from cold storage to CEX suggests potential selling pressure for {symbol}."
    
    if from_label == 'cex' and to_label == 'cold_wallet':
        return f"Large outflow from CEX to cold wallet suggests long-term holding intent for {symbol}."
    
    if from_label == 'cex' and to_label == 'cex':
        return f"Inter-exchange transfer may indicate arbitrage opportunity or liquidity rebalancing for {symbol}."
    
    if to_label == 'cex' and amount_usd > 1000000:
        return f"Large inflow into CEX (${amount_usd:,.0f}) suggests potential selling pressure."
    
    if from_label == 'cex' and amount_usd > 1000000:
        return f"Large outflow from CEX (${amount_usd:,.0f}) suggests accumulation or withdrawal to custody."
    
    if 'stablecoin' in symbol.lower() and to_label == 'cex':
        return f"Stablecoin inflow to CEX may precede alt rotation or buying pressure."
    
    if 'stablecoin' in symbol.lower() and from_label == 'cex':
        return f"Stablecoin outflow from CEX may indicate profit-taking or risk-off sentiment."
    
    if amount_usd > 5000000:
        return f"Significant ${amount_usd:,.0f} {symbol} movement detected. Monitor for market impact."
    
    return f"Large {symbol} transaction worth ${amount_usd:,.0f}."


DEFAULT_ADDRESS_LABELS = {
    '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be': 'cex',  # Binance
    '0xd551234ae421e3bcba99a0da6d736074f22192ff': 'cex',  # Binance 2
    '0x28c6c06298d514db089934071355e5743bf21d60': 'cex',  # Binance 14
    '0x21a31ee1afc51d94c2efccaa2092ad1028285549': 'cex',  # Binance 15
    '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': 'cex',  # Binance 16
    
    '0xabcd1234567890abcdef1234567890abcdef1234': 'cold_wallet',
    '0xef123456789abcdef0123456789abcdef012345': 'cold_wallet',
}


def get_address_label(address: str) -> str:
    """
    Get label for an address.
    
    Args:
        address: Ethereum address
        
    Returns:
        Label string (cex, cold_wallet, contract, unknown)
    """
    return DEFAULT_ADDRESS_LABELS.get(address.lower(), 'unknown')

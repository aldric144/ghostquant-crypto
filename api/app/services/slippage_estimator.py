"""
Slippage estimation and best pair suggestion service.
"""
import json
import logging
import os
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class SlippageEstimator:
    """Estimate slippage and suggest best trading pairs."""
    
    def __init__(self):
        """Initialize slippage estimator."""
        self.use_mock = os.getenv('LIQ_MOCK', 'true').lower() == 'true'
        self.mock_data = self._load_mock_data() if self.use_mock else {}
    
    def _load_mock_data(self) -> Dict[str, Any]:
        """Load mock liquidity data."""
        try:
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample_refined.json'
            if not mock_file.exists():
                mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample.json'
            with open(mock_file, 'r') as f:
                data = json.load(f)
                return data.get('liquidity_data', {})
        except Exception as e:
            logger.error(f"Failed to load mock liquidity data: {e}")
            return {}
    
    def estimate_liquidity(self, symbol: str, size_usd: Optional[float] = None) -> Dict[str, Any]:
        """
        Estimate liquidity and slippage for a symbol.
        
        Args:
            symbol: Trading symbol (e.g., BTC, ETH)
            size_usd: Trade size in USD (optional, defaults to 10000)
            
        Returns:
            Dictionary with depth, slippage estimates, and best pair
        """
        if size_usd is None:
            size_usd = 10000.0
        
        if self.use_mock:
            return self._estimate_from_mock(symbol, size_usd)
        else:
            return self._estimate_from_exchanges(symbol, size_usd)
    
    def _estimate_from_mock(self, symbol: str, size_usd: float) -> Dict[str, Any]:
        """Estimate from mock data with best pair selection."""
        symbol_upper = symbol.upper()
        
        if symbol_upper not in self.mock_data:
            return {
                'symbol': symbol_upper,
                'depth_at_0_5': 1000000,
                'depth_at_1_0': 2500000,
                'est_slippage_pct': self._calculate_slippage(size_usd, 1000000),
                'best_pair': {
                    'exchange': 'Coinbase',
                    'pair': f'{symbol_upper}/USD'
                },
                'size_usd': size_usd,
                'data_source': 'mock'
            }
        
        data = self.mock_data[symbol_upper]
        
        if 'pairs' in data:
            best_pair, slippage = self._select_best_pair(data['pairs'], size_usd)
        else:
            if size_usd <= 10000:
                slippage = data.get('est_slippage_for_10k', 0.1)
            elif size_usd <= 100000:
                slippage = data.get('est_slippage_for_100k', 0.5)
            else:
                base_slippage = data.get('est_slippage_for_100k', 0.5)
                slippage = base_slippage * (size_usd / 100000) ** 0.7
            
            best_pair = data.get('best_pair', {'exchange': 'Unknown', 'pair': f'{symbol_upper}/USD'})
        
        return {
            'symbol': symbol_upper,
            'depth_at_0_5': data.get('depth_at_0_5', 0),
            'depth_at_1_0': data.get('depth_at_1_0', 0),
            'est_slippage_pct': round(slippage, 2),
            'best_pair': best_pair,
            'size_usd': size_usd,
            'data_source': 'mock'
        }
    
    def _select_best_pair(self, pairs: List[Dict[str, Any]], size_usd: float) -> Tuple[Dict[str, Any], float]:
        """
        Select best pair based on lowest slippage for the given trade size.
        
        For $10k trades, uses slippage_10k directly.
        For other sizes, interpolates between available slippage points.
        
        Args:
            pairs: List of pair data with slippage at different sizes
            size_usd: Trade size in USD
            
        Returns:
            Tuple of (best_pair_dict, estimated_slippage)
        """
        best_pair = None
        best_slippage = float('inf')
        
        for pair in pairs:
            if size_usd <= 1000:
                slippage = pair.get('slippage_1k', 0.1)
            elif size_usd <= 10000:
                slippage_1k = pair.get('slippage_1k', 0.05)
                slippage_10k = pair.get('slippage_10k', 0.1)
                ratio = (size_usd - 1000) / 9000
                slippage = slippage_1k + (slippage_10k - slippage_1k) * ratio
            elif size_usd <= 100000:
                slippage_10k = pair.get('slippage_10k', 0.1)
                slippage_100k = pair.get('slippage_100k', 0.5)
                ratio = (size_usd - 10000) / 90000
                slippage = slippage_10k + (slippage_100k - slippage_10k) * ratio
            else:
                slippage_100k = pair.get('slippage_100k', 0.5)
                slippage = slippage_100k * (size_usd / 100000) ** 0.7
            
            if slippage < best_slippage:
                best_slippage = slippage
                best_pair = {
                    'exchange': pair['exchange'],
                    'pair': pair['pair']
                }
        
        if best_pair is None:
            best_pair = {'exchange': 'Unknown', 'pair': 'Unknown'}
            best_slippage = 1.0
        
        return best_pair, best_slippage
    
    def _estimate_from_exchanges(self, symbol: str, size_usd: float) -> Dict[str, Any]:
        """Estimate from live exchange data."""
        logger.warning("Live exchange data not implemented, using mock")
        return self._estimate_from_mock(symbol, size_usd)
    
    def _calculate_slippage(self, size_usd: float, depth: float) -> float:
        """
        Calculate estimated slippage percentage.
        
        Simple model: slippage increases with trade size relative to depth.
        
        Args:
            size_usd: Trade size in USD
            depth: Market depth in USD
            
        Returns:
            Estimated slippage percentage
        """
        if depth == 0:
            return 5.0  # High slippage for no liquidity
        
        ratio = size_usd / depth
        
        if ratio < 0.01:
            return 0.05  # Very low slippage
        elif ratio < 0.05:
            return 0.1 + (ratio - 0.01) * 10
        elif ratio < 0.1:
            return 0.5 + (ratio - 0.05) * 5
        else:
            return 1.0 + (ratio - 0.1) * 3
    
    def get_best_pairs(self, symbol: str, top_n: int = 3) -> List[Dict[str, Any]]:
        """
        Get best trading pairs for a symbol across exchanges.
        
        Args:
            symbol: Trading symbol
            top_n: Number of top pairs to return
            
        Returns:
            List of best pairs with exchange, pair, and estimated slippage
        """
        if self.use_mock:
            liquidity = self._estimate_from_mock(symbol, 10000)
            return [liquidity['best_pair']]
        else:
            logger.warning("Multi-exchange comparison not implemented, using mock")
            liquidity = self._estimate_from_mock(symbol, 10000)
            return [liquidity['best_pair']]


def get_slippage_estimator() -> SlippageEstimator:
    """Get slippage estimator instance."""
    return SlippageEstimator()

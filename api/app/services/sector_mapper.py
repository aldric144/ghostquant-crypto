"""
Sector mapping and momentum aggregation service.
"""
import json
import logging
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class SectorMapper:
    """Map coins to sectors and aggregate momentum."""
    
    SECTORS = ["L1", "L2", "DeFi", "Oracles", "Stablecoins", "CeFi", "NFT", "Tokens"]
    
    def __init__(self):
        """Initialize sector mapper."""
        self.mapping_source = os.getenv('SECTOR_MAPPING_SOURCE', 'local').lower()
        self.sector_map = self._load_sector_map()
    
    def _load_sector_map(self) -> Dict[str, str]:
        """Load sector mapping from configured source."""
        if self.mapping_source == 'local':
            return self._load_local_mapping()
        elif self.mapping_source == 'coingecko':
            logger.warning("CoinGecko mapping not implemented, using local")
            return self._load_local_mapping()
        else:
            logger.warning(f"Unknown mapping source: {self.mapping_source}, using local")
            return self._load_local_mapping()
    
    def _load_local_mapping(self) -> Dict[str, str]:
        """Load local sector mapping from mock data."""
        try:
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample.json'
            with open(mock_file, 'r') as f:
                data = json.load(f)
                return data.get('sector_map', {})
        except Exception as e:
            logger.error(f"Failed to load sector mapping: {e}")
            return {}
    
    def get_sector(self, symbol: str) -> Optional[str]:
        """
        Get sector for a symbol.
        
        Args:
            symbol: Coin symbol or CoinGecko ID
            
        Returns:
            Sector name or None if not found
        """
        symbol_lower = symbol.lower()
        return self.sector_map.get(symbol_lower)
    
    def get_all_sectors(self) -> List[str]:
        """Get list of all available sectors."""
        return self.SECTORS
    
    def get_coins_by_sector(self, sector: str) -> List[str]:
        """
        Get all coins in a sector.
        
        Args:
            sector: Sector name
            
        Returns:
            List of coin symbols/IDs in the sector
        """
        return [
            symbol for symbol, s in self.sector_map.items()
            if s == sector
        ]
    
    async def aggregate_sector_momentum(
        self,
        screener_data: List[Dict[str, Any]],
        period: str = "24h"
    ) -> List[Dict[str, Any]]:
        """
        Aggregate momentum by sector.
        
        Args:
            screener_data: List of coins with momentum scores
            period: Time period (not used in current implementation)
            
        Returns:
            List of sector momentum aggregates
        """
        sector_scores: Dict[str, List[float]] = {sector: [] for sector in self.SECTORS}
        
        for coin in screener_data:
            symbol = coin.get('symbol', '').lower()
            score = coin.get('momentum_score') or coin.get('score', 0)
            
            sector = self.get_sector(symbol)
            if sector and sector in sector_scores:
                sector_scores[sector].append(float(score))
        
        results = []
        color_map = {
            "L1": "#10b981",      # green
            "L2": "#8b5cf6",      # purple
            "DeFi": "#3b82f6",    # blue
            "Oracles": "#f59e0b", # amber
            "Stablecoins": "#6b7280", # gray
            "CeFi": "#ec4899",    # pink
            "NFT": "#f97316",     # orange
            "Tokens": "#14b8a6"   # teal
        }
        
        for sector in self.SECTORS:
            scores = sector_scores[sector]
            if scores:
                avg_momentum = sum(scores) / len(scores)
                results.append({
                    'sector': sector,
                    'momentum_avg': round(avg_momentum, 1),
                    'n_assets': len(scores),
                    'color': color_map.get(sector, '#6b7280')
                })
            else:
                results.append({
                    'sector': sector,
                    'momentum_avg': 0.0,
                    'n_assets': 0,
                    'color': color_map.get(sector, '#6b7280')
                })
        
        results.sort(key=lambda x: x['momentum_avg'], reverse=True)
        
        return results
    
    def get_mock_sector_momentum(self) -> List[Dict[str, Any]]:
        """Get mock sector momentum data."""
        try:
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample.json'
            with open(mock_file, 'r') as f:
                data = json.load(f)
                return data.get('sector_momentum', [])
        except Exception as e:
            logger.error(f"Failed to load mock sector momentum: {e}")
            return []


def get_sector_mapper() -> SectorMapper:
    """Get sector mapper instance."""
    return SectorMapper()

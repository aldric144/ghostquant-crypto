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
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample_refined.json'
            if not mock_file.exists():
                mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample.json'
            with open(mock_file, 'r') as f:
                data = json.load(f)
                if 'sector_data' in data and 'coins' in data['sector_data']:
                    return {coin['symbol']: coin['sector'] for coin in data['sector_data']['coins']}
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
        Aggregate momentum by sector using VWAPC (Volume-Weighted Average Price Change).
        
        VWAPC = sum(volume_i * price_change_i) / sum(volume_i)
        
        Args:
            screener_data: List of coins with momentum scores, volume, and price change
            period: Time period (24h, 7d, 30d)
            
        Returns:
            List of sector momentum aggregates with 5-tier color scale
        """
        sector_data: Dict[str, Dict[str, Any]] = {
            sector: {'total_volume': 0.0, 'weighted_change': 0.0, 'coins': []}
            for sector in self.SECTORS
        }
        
        coin_data = self._load_coin_data()
        
        for coin in screener_data:
            symbol = coin.get('symbol', '').lower()
            sector = self.get_sector(symbol)
            
            if sector and sector in sector_data:
                coin_info = coin_data.get(symbol, {})
                volume = coin_info.get('volume_24h_usd', 0)
                price_change = coin_info.get('price_change_24h_pct', 0)
                
                if volume > 0:
                    sector_data[sector]['total_volume'] += volume
                    sector_data[sector]['weighted_change'] += volume * price_change
                    sector_data[sector]['coins'].append(symbol)
        
        results = []
        
        for sector in self.SECTORS:
            data = sector_data[sector]
            total_volume = data['total_volume']
            
            if total_volume > 0:
                vwapc = data['weighted_change'] / total_volume
            else:
                vwapc = 0.0
            
            color = self._get_color_for_vwapc(vwapc)
            
            results.append({
                'sector': sector,
                'vwapc': round(vwapc, 2),
                'momentum_avg': round(vwapc, 1),
                'n_assets': len(data['coins']),
                'color': color
            })
        
        results.sort(key=lambda x: x['vwapc'], reverse=True)
        
        return results
    
    def _load_coin_data(self) -> Dict[str, Dict[str, Any]]:
        """Load coin volume and price change data."""
        try:
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample_refined.json'
            if not mock_file.exists():
                return {}
            with open(mock_file, 'r') as f:
                data = json.load(f)
                if 'sector_data' in data and 'coins' in data['sector_data']:
                    return {
                        coin['symbol']: {
                            'volume_24h_usd': coin.get('volume_24h_usd', 0),
                            'price_change_24h_pct': coin.get('price_change_24h_pct', 0)
                        }
                        for coin in data['sector_data']['coins']
                    }
                return {}
        except Exception as e:
            logger.error(f"Failed to load coin data: {e}")
            return {}
    
    def _get_color_for_vwapc(self, vwapc: float) -> str:
        """
        Get color for VWAPC value using 5-tier scale.
        
        Tiers:
        - Deep Red: < -5.0%
        - Light Red: -5.0% to -1.0%
        - Grey/Neutral: -1.0% to +1.0%
        - Light Green: +1.0% to +5.0%
        - Deep Green: > +5.0%
        
        Args:
            vwapc: Volume-Weighted Average Price Change percentage
            
        Returns:
            Hex color code
        """
        if vwapc < -5.0:
            return "#dc2626"
        elif vwapc < -1.0:
            return "#f87171"
        elif vwapc < 1.0:
            return "#6b7280"
        elif vwapc < 5.0:
            return "#4ade80"
        else:
            return "#10b981"
    
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

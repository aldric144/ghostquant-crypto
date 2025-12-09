"""
Whale Intelligence Database Services

Business logic for whale data management and analysis.
"""

from datetime import datetime
from typing import Dict, List, Optional
import math

from .models import WhaleAddress, WhaleMovement, WhaleProfile


class WhaleIntelService:
    """Service class for whale intelligence operations."""
    
    def __init__(self):
        # In-memory storage (can be replaced with database later)
        self._whales: Dict[str, WhaleAddress] = {}
        self._movements: List[WhaleMovement] = []
        self._counterparties: Dict[str, set] = {}  # address -> set of counterparty addresses
    
    def add_or_update_whale(self, address: str, movement_data: Optional[dict] = None) -> WhaleAddress:
        """Add a new whale or update existing whale data."""
        address = address.lower()
        now = datetime.utcnow()
        
        if address in self._whales:
            whale = self._whales[address]
            whale.last_seen = now
            if movement_data:
                whale.total_volume_usd += movement_data.get("usd_value", 0)
                whale.num_movements += 1
        else:
            whale = WhaleAddress(
                address=address,
                first_seen=now,
                last_seen=now,
                total_volume_usd=movement_data.get("usd_value", 0) if movement_data else 0,
                num_movements=1 if movement_data else 0
            )
            self._whales[address] = whale
            self._counterparties[address] = set()
        
        # Recompute influence score
        whale.influence_score = self.compute_influence_score(address)
        
        return whale
    
    def record_movement(self, movement: WhaleMovement) -> WhaleMovement:
        """Record a whale movement."""
        self._movements.append(movement)
        
        # Track counterparties
        from_addr = movement.from_address.lower()
        to_addr = movement.to_address.lower()
        
        if from_addr in self._counterparties:
            self._counterparties[from_addr].add(to_addr)
        if to_addr in self._counterparties:
            self._counterparties[to_addr].add(from_addr)
        
        # Update both whales
        self.add_or_update_whale(from_addr, {"usd_value": movement.usd_value})
        self.add_or_update_whale(to_addr, {"usd_value": movement.usd_value})
        
        return movement
    
    def compute_influence_score(self, address: str) -> float:
        """Compute influence score for a whale based on volume and connections."""
        address = address.lower()
        
        if address not in self._whales:
            return 0.0
        
        whale = self._whales[address]
        
        # Factors for influence score:
        # 1. Total volume (log scale)
        # 2. Number of movements
        # 3. Number of counterparties
        
        volume_score = min(math.log10(whale.total_volume_usd + 1) * 10, 40)
        movement_score = min(whale.num_movements * 0.5, 30)
        counterparty_count = len(self._counterparties.get(address, set()))
        counterparty_score = min(counterparty_count * 2, 30)
        
        return round(volume_score + movement_score + counterparty_score, 2)
    
    def get_whale_profile(self, address: str) -> Optional[WhaleProfile]:
        """Get detailed whale profile."""
        address = address.lower()
        
        if address not in self._whales:
            return None
        
        whale = self._whales[address]
        recent_movements = self.get_recent_movements(address, limit=20)
        counterparties = list(self._counterparties.get(address, set()))[:50]
        
        # Generate behavior summary
        behavior_summary = self._generate_behavior_summary(whale, recent_movements)
        
        return WhaleProfile(
            whale=whale,
            recent_movements=recent_movements,
            counterparties=counterparties,
            behavior_summary=behavior_summary
        )
    
    def _generate_behavior_summary(self, whale: WhaleAddress, movements: List[WhaleMovement]) -> str:
        """Generate a behavior analysis summary."""
        if not movements:
            return "Insufficient data for behavior analysis."
        
        avg_value = whale.total_volume_usd / max(whale.num_movements, 1)
        
        if whale.influence_score > 70:
            influence_desc = "highly influential"
        elif whale.influence_score > 40:
            influence_desc = "moderately influential"
        else:
            influence_desc = "low influence"
        
        if avg_value > 1000000:
            size_desc = "large-scale"
        elif avg_value > 100000:
            size_desc = "medium-scale"
        else:
            size_desc = "small-scale"
        
        return (
            f"This whale is {influence_desc} with {size_desc} transaction patterns. "
            f"Total volume: ${whale.total_volume_usd:,.2f} across {whale.num_movements} movements. "
            f"Risk score: {whale.risk_score:.1f}/100."
        )
    
    def get_top_whales(self, limit: int = 50) -> List[WhaleAddress]:
        """Get top whales by influence score."""
        sorted_whales = sorted(
            self._whales.values(),
            key=lambda w: w.influence_score,
            reverse=True
        )
        return sorted_whales[:limit]
    
    def search_whales(self, query: str) -> List[WhaleAddress]:
        """Search whales by address or tag."""
        query = query.lower()
        results = []
        
        for whale in self._whales.values():
            if query in whale.address.lower():
                results.append(whale)
            elif any(query in tag.lower() for tag in whale.tags):
                results.append(whale)
        
        return results[:100]  # Limit results
    
    def get_recent_movements(self, address: str, limit: int = 50) -> List[WhaleMovement]:
        """Get recent movements for a whale."""
        address = address.lower()
        
        whale_movements = [
            m for m in self._movements
            if m.from_address.lower() == address or m.to_address.lower() == address
        ]
        
        # Sort by timestamp descending
        whale_movements.sort(key=lambda m: m.timestamp, reverse=True)
        
        return whale_movements[:limit]
    
    def get_all_recent_movements(self, limit: int = 100) -> List[WhaleMovement]:
        """Get all recent movements across all whales."""
        sorted_movements = sorted(
            self._movements,
            key=lambda m: m.timestamp,
            reverse=True
        )
        return sorted_movements[:limit]
    
    def add_tag(self, address: str, tag: str) -> Optional[WhaleAddress]:
        """Add a tag to a whale."""
        address = address.lower()
        
        if address not in self._whales:
            return None
        
        whale = self._whales[address]
        if tag not in whale.tags:
            whale.tags.append(tag)
        
        return whale


# Global service instance
whale_intel_service = WhaleIntelService()

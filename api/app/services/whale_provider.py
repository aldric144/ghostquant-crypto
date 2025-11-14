"""
Whale event provider with adapter pattern for multiple data sources.
"""
import json
import logging
import os
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class WhaleEvent:
    """Whale transaction event."""
    
    def __init__(
        self,
        tx_hash: str,
        chain: str,
        symbol: str,
        amount_usd: float,
        from_address: str,
        to_address: str,
        timestamp: str,
        event_type: str,
        explorer_url: str
    ):
        self.tx_hash = tx_hash
        self.chain = chain
        self.symbol = symbol
        self.amount_usd = amount_usd
        self.from_address = from_address
        self.to_address = to_address
        self.timestamp = timestamp
        self.event_type = event_type
        self.explorer_url = explorer_url
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'tx_hash': self.tx_hash,
            'chain': self.chain,
            'symbol': self.symbol,
            'amount_usd': self.amount_usd,
            'from': self.from_address,
            'to': self.to_address,
            'time': self.timestamp,
            'type': self.event_type,
            'explorer_url': self.explorer_url
        }


class WhaleLeaderboardEntry:
    """Whale leaderboard entry with impact scoring."""
    
    def __init__(
        self,
        address: str,
        impact_score: float,
        usd_volume: float,
        events: int,
        last_seen: str
    ):
        self.address = address
        self.impact_score = impact_score
        self.usd_volume = usd_volume
        self.events = events
        self.last_seen = last_seen
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'address': self.address,
            'impact_score': self.impact_score,
            'usd_volume': self.usd_volume,
            'events': self.events,
            'last_seen': self.last_seen
        }


class WhaleProvider(ABC):
    """Abstract whale event provider."""
    
    @abstractmethod
    def get_recent_events(self, limit: int = 50, chain_filter: Optional[List[str]] = None) -> List[WhaleEvent]:
        """Get recent whale events."""
        pass
    
    @abstractmethod
    def get_leaderboard(self, since_hours: int = 24) -> List[WhaleLeaderboardEntry]:
        """Get whale leaderboard."""
        pass


class MockWhaleProvider(WhaleProvider):
    """Mock whale provider for testing."""
    
    def __init__(self):
        """Initialize mock provider."""
        self.mock_data = self._load_mock_data()
    
    def _load_mock_data(self) -> Dict[str, Any]:
        """Load mock data from file."""
        try:
            mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample_refined.json'
            if not mock_file.exists():
                mock_file = Path(__file__).parent.parent.parent.parent / 'mock_data' / 'phase2_sample.json'
            with open(mock_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load mock data: {e}")
            return {'whale_events': [], 'whale_leaderboard': []}
    
    def get_recent_events(self, limit: int = 50, chain_filter: Optional[List[str]] = None) -> List[WhaleEvent]:
        """Get recent whale events from mock data."""
        events = []
        for event_data in self.mock_data.get('whale_events', []):
            if chain_filter and event_data['chain'].lower() not in [c.lower() for c in chain_filter]:
                continue
            
            events.append(WhaleEvent(
                tx_hash=event_data['tx_hash'],
                chain=event_data['chain'],
                symbol=event_data['symbol'],
                amount_usd=event_data['amount_usd'],
                from_address=event_data.get('from_address', event_data.get('from', '')),
                to_address=event_data.get('to_address', event_data.get('to', '')),
                timestamp=event_data.get('timestamp', event_data.get('time', '')),
                event_type=event_data['type'],
                explorer_url=event_data['explorer_url']
            ))
            
            if len(events) >= limit:
                break
        
        return events
    
    def get_leaderboard(self, since_hours: int = 24) -> List[WhaleLeaderboardEntry]:
        """Get whale leaderboard from mock data."""
        entries = []
        for entry_data in self.mock_data.get('whale_leaderboard', []):
            entries.append(WhaleLeaderboardEntry(
                address=entry_data['address'],
                impact_score=entry_data['impact_score'],
                usd_volume=entry_data['usd_volume'],
                events=entry_data['events'],
                last_seen=entry_data['last_seen']
            ))
        return entries


class EtherscanWhaleProvider(WhaleProvider):
    """Etherscan-based whale provider."""
    
    def __init__(self, api_key: str):
        """Initialize Etherscan provider."""
        self.api_key = api_key
        self.base_url = "https://api.etherscan.io/api"
        self.min_whale_amount = float(os.getenv('WHALE_MIN_USD', '100000'))
    
    def get_recent_events(self, limit: int = 50, chain_filter: Optional[List[str]] = None) -> List[WhaleEvent]:
        """Get recent whale events from Etherscan."""
        logger.warning("Etherscan provider not fully implemented, using mock data")
        return MockWhaleProvider().get_recent_events(limit, chain_filter)
    
    def get_leaderboard(self, since_hours: int = 24) -> List[WhaleLeaderboardEntry]:
        """Get whale leaderboard from Etherscan."""
        logger.warning("Etherscan provider not fully implemented, using mock data")
        return MockWhaleProvider().get_leaderboard(since_hours)


class AlchemyWhaleProvider(WhaleProvider):
    """Alchemy-based whale provider."""
    
    def __init__(self, api_key: str):
        """Initialize Alchemy provider."""
        self.api_key = api_key
        self.min_whale_amount = float(os.getenv('WHALE_MIN_USD', '100000'))
    
    def get_recent_events(self, limit: int = 50, chain_filter: Optional[List[str]] = None) -> List[WhaleEvent]:
        """Get recent whale events from Alchemy."""
        logger.warning("Alchemy provider not fully implemented, using mock data")
        return MockWhaleProvider().get_recent_events(limit, chain_filter)
    
    def get_leaderboard(self, since_hours: int = 24) -> List[WhaleLeaderboardEntry]:
        """Get whale leaderboard from Alchemy."""
        logger.warning("Alchemy provider not fully implemented, using mock data")
        return MockWhaleProvider().get_leaderboard(since_hours)


def get_whale_provider() -> WhaleProvider:
    """
    Get whale provider based on configuration.
    
    Returns:
        WhaleProvider instance
    """
    use_mock = os.getenv('WHALER_MOCK', 'true').lower() == 'true'
    
    if use_mock:
        logger.info("Using mock whale provider")
        return MockWhaleProvider()
    
    provider_type = os.getenv('WHALE_PROVIDER', 'alchemy').lower()
    api_key = os.getenv('WHALE_PROVIDER_KEY', '')
    
    if not api_key:
        logger.warning("No whale provider API key configured, falling back to mock")
        return MockWhaleProvider()
    
    if provider_type == 'etherscan':
        logger.info("Using Etherscan whale provider")
        return EtherscanWhaleProvider(api_key)
    elif provider_type == 'alchemy':
        logger.info("Using Alchemy whale provider")
        return AlchemyWhaleProvider(api_key)
    else:
        logger.warning(f"Unknown provider type: {provider_type}, falling back to mock")
        return MockWhaleProvider()

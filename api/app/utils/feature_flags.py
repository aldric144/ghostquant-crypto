"""
Feature flags system for Phase 2 features.
"""
import os
from typing import Dict


class FeatureFlags:
    """Simple environment-based feature flag system."""
    
    _flags: Dict[str, bool] = {}
    
    @classmethod
    def _load_flags(cls) -> None:
        """Load feature flags from environment variables."""
        if not cls._flags:
            cls._flags = {
                'signals': os.getenv('FEATURE_SIGNALS', 'false').lower() == 'true',
                'whales': os.getenv('FEATURE_WHALES', 'false').lower() == 'true',
                'liq_estimator': os.getenv('FEATURE_LIQ_ESTIMATOR', 'false').lower() == 'true',
                'heatmap': os.getenv('FEATURE_HEATMAP', 'false').lower() == 'true',
                'notes': os.getenv('FEATURE_NOTES', 'false').lower() == 'true',
            }
    
    @classmethod
    def is_enabled(cls, feature_name: str) -> bool:
        """
        Check if a feature is enabled.
        
        Args:
            feature_name: Name of the feature (signals, whales, liq_estimator, heatmap, notes)
            
        Returns:
            True if feature is enabled, False otherwise
        """
        cls._load_flags()
        return cls._flags.get(feature_name, False)
    
    @classmethod
    def get_all(cls) -> Dict[str, bool]:
        """Get all feature flags."""
        cls._load_flags()
        return cls._flags.copy()


def is_feature_enabled(feature_name: str) -> bool:
    """
    Convenience function to check if a feature is enabled.
    
    Args:
        feature_name: Name of the feature
        
    Returns:
        True if feature is enabled, False otherwise
    """
    return FeatureFlags.is_enabled(feature_name)

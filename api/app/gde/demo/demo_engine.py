"""
Demo Engine
Core logic for generating synthetic intelligence data.
Safe, read-only, no backend mutations.
"""

from typing import Dict, Any, List
from .demo_synthetic_generator import DemoSyntheticGenerator
from .demo_schema import (
    DemoEvent,
    DemoEntity,
    DemoToken,
    DemoChain,
    DemoPrediction,
    DemoFusion,
    DemoSentinel,
    DemoConstellation,
    DemoHydra,
    DemoUltraFusion,
    DemoDNA,
    DemoActorProfile,
    DemoCortexPattern,
)


class DemoEngine:
    """
    Demo Engine for GhostQuant Live Demo Terminal.
    
    Generates synthetic intelligence data that looks identical to real
    intelligence but is completely safe and fake.
    
    RULES:
    - Never calls real engines
    - Never writes to Genesis
    - Never writes to Cortex
    - Never modifies any real data
    - Never triggers real alerts
    - Always uses synthetic data
    - Always fast (<80ms)
    """
    
    def __init__(self, seed: int = 42):
        """Initialize demo engine with synthetic data generator."""
        self.generator = DemoSyntheticGenerator(seed=seed)
        self._cache: Dict[str, Any] = {}
    
    def generate_synthetic_event(self) -> DemoEvent:
        """
        Generate a synthetic event.
        
        Returns:
            DemoEvent: Fake event that looks real
        """
        return self.generator.generate_event()
    
    def generate_synthetic_entity(self) -> DemoEntity:
        """
        Generate a synthetic entity.
        
        Returns:
            DemoEntity: Fake entity that looks real
        """
        return self.generator.generate_entity()
    
    def generate_synthetic_token(self) -> DemoToken:
        """
        Generate a synthetic token.
        
        Returns:
            DemoToken: Fake token that looks real
        """
        return self.generator.generate_token()
    
    def generate_synthetic_chain(self) -> DemoChain:
        """
        Generate synthetic chain metrics.
        
        Returns:
            DemoChain: Fake chain metrics that look real
        """
        return self.generator.generate_chain()
    
    def run_demo_prediction(self, entity: str = None) -> DemoPrediction:
        """
        Run demo prediction analysis.
        
        Simulates the Prediction Engine with synthetic data.
        
        Args:
            entity: Optional entity address (ignored, uses synthetic)
        
        Returns:
            DemoPrediction: Fake prediction that looks real
        """
        return self.generator.generate_prediction()
    
    def run_demo_fusion(self, entity: str = None) -> DemoFusion:
        """
        Run demo UltraFusion analysis.
        
        Simulates the UltraFusion Engine with synthetic data.
        
        Args:
            entity: Optional entity address (ignored, uses synthetic)
        
        Returns:
            DemoFusion: Fake fusion analysis that looks real
        """
        return self.generator.generate_fusion()
    
    def run_demo_sentinel(self) -> DemoSentinel:
        """
        Run demo Sentinel status check.
        
        Simulates the Sentinel Command Console with synthetic data.
        
        Returns:
            DemoSentinel: Fake sentinel status that looks real
        """
        return self.generator.generate_sentinel()
    
    def run_demo_constellation(self) -> DemoConstellation:
        """
        Run demo Constellation map generation.
        
        Simulates the Constellation Map with synthetic data.
        
        Returns:
            DemoConstellation: Fake constellation data that looks real
        """
        return self.generator.generate_constellation()
    
    def run_demo_hydra(self) -> DemoHydra:
        """
        Run demo Hydra detection.
        
        Simulates the Hydra Engine with synthetic data.
        
        Returns:
            DemoHydra: Fake hydra detection that looks real
        """
        return self.generator.generate_hydra()
    
    def run_demo_ultrafusion(self, entity: str = None) -> DemoUltraFusion:
        """
        Run demo UltraFusion meta-analysis.
        
        Simulates the UltraFusion Meta-Engine with synthetic data.
        
        Args:
            entity: Optional entity address (ignored, uses synthetic)
        
        Returns:
            DemoUltraFusion: Fake ultrafusion analysis that looks real
        """
        return self.generator.generate_ultrafusion()
    
    def run_demo_dna(self, entity: str = None) -> DemoDNA:
        """
        Run demo Behavioral DNA analysis.
        
        Simulates the Behavioral DNA Engine with synthetic data.
        
        Args:
            entity: Optional entity address (ignored, uses synthetic)
        
        Returns:
            DemoDNA: Fake DNA analysis that looks real
        """
        return self.generator.generate_dna()
    
    def run_demo_actor_profile(self, entity: str = None) -> DemoActorProfile:
        """
        Run demo Actor Profile generation.
        
        Simulates the Actor Profiler with synthetic data.
        
        Args:
            entity: Optional entity address (ignored, uses synthetic)
        
        Returns:
            DemoActorProfile: Fake actor profile that looks real
        """
        return self.generator.generate_actor_profile()
    
    def run_demo_cortex_pattern(self) -> DemoCortexPattern:
        """
        Run demo Cortex pattern detection.
        
        Simulates the Cortex Memory Engine with synthetic data.
        
        Returns:
            DemoCortexPattern: Fake cortex pattern that looks real
        """
        return self.generator.generate_cortex_pattern()
    
    def get_demo_feed(self, count: int = 10) -> List[DemoEvent]:
        """
        Get a feed of synthetic events for the live intelligence feed.
        
        Args:
            count: Number of events to generate
        
        Returns:
            List[DemoEvent]: List of fake events
        """
        return [self.generator.generate_event() for _ in range(count)]
    
    def get_health_status(self) -> Dict[str, Any]:
        """
        Get demo engine health status.
        
        Returns:
            Dict: Health status information
        """
        return {
            "status": "healthy",
            "mode": "demo",
            "synthetic_data": True,
            "real_engines": False,
            "mutations_enabled": False,
            "safe_mode": True
        }
    
    def get_demo_info(self) -> Dict[str, Any]:
        """
        Get information about the demo terminal.
        
        Returns:
            Dict: Demo terminal information
        """
        return {
            "name": "GhostQuant Live Demo Terminal",
            "version": "1.0.0",
            "mode": "demo",
            "description": "Public-facing demo with synthetic intelligence data",
            "features": [
                "Synthetic intelligence generation",
                "Read-only operations",
                "No backend mutations",
                "Safe for public access",
                "Visually identical to real terminal"
            ],
            "limitations": [
                "Synthetic data only",
                "No real threat detection",
                "No Genesis writes",
                "No Cortex writes",
                "No real alerts"
            ],
            "contact": "enterprise@ghostquant.io"
        }

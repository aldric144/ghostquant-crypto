"""
GQ-Core: Unified GhostQuant Hybrid Intelligence Engine

This module provides a unified interface for all GhostQuant intelligence data,
with automatic fallback from real-time data to synthetic data when real data
is unavailable.

Features:
- Real-time data from Redis channels when available
- Deterministic synthetic data generation (seeded by time)
- Unified response format with source and timestamp
- Zero blank states - always returns populated data
"""

from app.gde.gq_core.service import GQCoreService
from app.gde.gq_core.synthetic import SyntheticDataGenerator
from app.gde.gq_core.schemas import GQCoreResponse

__all__ = ["GQCoreService", "SyntheticDataGenerator", "GQCoreResponse"]

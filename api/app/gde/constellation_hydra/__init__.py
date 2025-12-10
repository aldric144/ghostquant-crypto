"""
Constellation Hydra - Phase 10 Isolated Fix

Backend compatibility shim for Hydra input handling.
Normalizes both old and new schemas for the Hydra pipeline.

This is a NEW isolated module - does NOT modify any existing code.
"""

from .hydra_input_adapter import (
    HydraInputAdapter,
    normalize_hydra_input,
    generate_events_from_heads,
    hydra_adapter_router,
)

__all__ = [
    "HydraInputAdapter",
    "normalize_hydra_input",
    "generate_events_from_heads",
    "hydra_adapter_router",
]

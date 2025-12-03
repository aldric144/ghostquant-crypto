"""
GhostQuant Investor Data Room Generator™

Automated investor-grade due diligence data room system.
"""

from .dataroom_engine import DataRoomEngine
from .dataroom_schema import (
    DataRoomSection,
    DataRoomFile,
    DataRoomFolder,
    DataRoomPackage,
    DataRoomSummary
)

__all__ = [
    'DataRoomEngine',
    'DataRoomSection',
    'DataRoomFile',
    'DataRoomFolder',
    'DataRoomPackage',
    'DataRoomSummary'
]

"""
GhostQuant Enterprise API Licensing Framework™

Commercial licensing engine for selling GhostQuant as an enterprise-grade API product.

Enables banks, exchanges, governments, hedge funds, and fintech apps to license
GhostQuant's intelligence engines through tiered, enforceable, trackable API keys.

Features:
- Tiered licensing (Developer, Business, Enterprise, Government/Unlimited)
- Per-engine permissions (Fusion, Hydra, Radar, Profiler, Constellation, etc.)
- Rate limiting and concurrency controls
- Usage tracking and analytics
- API key generation and validation
- IP whitelisting
- Expiration and revocation
- HMAC signature support
"""

from .license_schema import (
    LicenseKey,
    LicensePermissions,
    LicenseUsage,
    LicenseRecord,
    LicenseValidationResult
)
from .license_engine import LicenseEngine

__all__ = [
    'LicenseKey',
    'LicensePermissions',
    'LicenseUsage',
    'LicenseRecord',
    'LicenseValidationResult',
    'LicenseEngine'
]

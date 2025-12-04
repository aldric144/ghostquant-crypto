"""
License Schema Definitions

Dataclasses for license keys, permissions, usage tracking, and validation.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class LicenseTier(str, Enum):
    """License tier levels"""
    DEVELOPER = "developer"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"
    GOVERNMENT = "government"


class LicenseStatus(str, Enum):
    """License status"""
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    SUSPENDED = "suspended"


@dataclass
class LicensePermissions:
    """License permissions and limits"""
    tier: str
    allowed_engines: List[str]
    rate_limit_per_month: int
    rate_limit_per_day: int
    rate_limit_per_hour: int
    concurrency_limit: int
    ip_whitelist: List[str] = field(default_factory=list)
    allow_analytics: bool = True
    allow_export: bool = True
    allow_webhooks: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'tier': self.tier,
            'allowed_engines': self.allowed_engines,
            'rate_limit_per_month': self.rate_limit_per_month,
            'rate_limit_per_day': self.rate_limit_per_day,
            'rate_limit_per_hour': self.rate_limit_per_hour,
            'concurrency_limit': self.concurrency_limit,
            'ip_whitelist': self.ip_whitelist,
            'allow_analytics': self.allow_analytics,
            'allow_export': self.allow_export,
            'allow_webhooks': self.allow_webhooks
        }


@dataclass
class LicenseKey:
    """API license key"""
    api_key: str
    customer_name: str
    customer_email: str
    tier: str
    status: str
    created_at: str
    expires_at: Optional[str] = None
    revoked_at: Optional[str] = None
    last_used_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'api_key': self.api_key,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'tier': self.tier,
            'status': self.status,
            'created_at': self.created_at,
            'expires_at': self.expires_at,
            'revoked_at': self.revoked_at,
            'last_used_at': self.last_used_at
        }


@dataclass
class LicenseUsage:
    """License usage tracking"""
    api_key: str
    total_requests: int = 0
    requests_today: int = 0
    requests_this_hour: int = 0
    requests_this_month: int = 0
    last_reset_daily: Optional[str] = None
    last_reset_hourly: Optional[str] = None
    last_reset_monthly: Optional[str] = None
    engine_usage: Dict[str, int] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'api_key': self.api_key,
            'total_requests': self.total_requests,
            'requests_today': self.requests_today,
            'requests_this_hour': self.requests_this_hour,
            'requests_this_month': self.requests_this_month,
            'last_reset_daily': self.last_reset_daily,
            'last_reset_hourly': self.last_reset_hourly,
            'last_reset_monthly': self.last_reset_monthly,
            'engine_usage': self.engine_usage
        }


@dataclass
class LicenseRecord:
    """Complete license record"""
    key: LicenseKey
    permissions: LicensePermissions
    usage: LicenseUsage
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'key': self.key.to_dict(),
            'permissions': self.permissions.to_dict(),
            'usage': self.usage.to_dict()
        }


@dataclass
class LicenseValidationResult:
    """License validation result"""
    valid: bool
    api_key: Optional[str] = None
    reason: Optional[str] = None
    tier: Optional[str] = None
    allowed_engines: List[str] = field(default_factory=list)
    remaining_requests_today: Optional[int] = None
    remaining_requests_hour: Optional[int] = None
    remaining_requests_month: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'valid': self.valid,
            'api_key': self.api_key,
            'reason': self.reason,
            'tier': self.tier,
            'allowed_engines': self.allowed_engines,
            'remaining_requests_today': self.remaining_requests_today,
            'remaining_requests_hour': self.remaining_requests_hour,
            'remaining_requests_month': self.remaining_requests_month
        }

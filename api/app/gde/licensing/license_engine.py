"""
License Engine

Complete enterprise API licensing system with tier-based permissions,
usage tracking, rate limiting, and policy enforcement.

Pure Python implementation with zero external dependencies.
"""

import secrets
import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .license_schema import (
    LicenseKey,
    LicensePermissions,
    LicenseUsage,
    LicenseRecord,
    LicenseValidationResult,
    LicenseTier,
    LicenseStatus
)


class LicenseEngine:
    """
    Enterprise API Licensing Framework™
    
    Manages commercial licensing for GhostQuant intelligence engines with:
    - Tiered licensing (Developer, Business, Enterprise, Government)
    - Per-engine permissions
    - Rate limiting and usage tracking
    - IP whitelisting
    - Expiration and revocation
    """
    
    VERSION = "1.0.0"
    
    TIER_DEFINITIONS = {
        LicenseTier.DEVELOPER: {
            'name': 'Developer',
            'rate_limit_per_month': 5000,
            'rate_limit_per_day': 200,
            'rate_limit_per_hour': 50,
            'concurrency_limit': 2,
            'allowed_engines': [
                'fusion',
                'radar',
                'profiler'
            ],
            'allow_analytics': True,
            'allow_export': False,
            'allow_webhooks': False,
            'price_per_month': 99
        },
        LicenseTier.BUSINESS: {
            'name': 'Business',
            'rate_limit_per_month': 50000,
            'rate_limit_per_day': 2000,
            'rate_limit_per_hour': 500,
            'concurrency_limit': 10,
            'allowed_engines': [
                'fusion',
                'hydra',
                'radar',
                'profiler',
                'constellation',
                'oracle_eye'
            ],
            'allow_analytics': True,
            'allow_export': True,
            'allow_webhooks': True,
            'price_per_month': 499
        },
        LicenseTier.ENTERPRISE: {
            'name': 'Enterprise',
            'rate_limit_per_month': 500000,
            'rate_limit_per_day': 20000,
            'rate_limit_per_hour': 5000,
            'concurrency_limit': 50,
            'allowed_engines': [
                'fusion',
                'hydra',
                'radar',
                'profiler',
                'constellation',
                'sentinel',
                'cortex',
                'genesis',
                'oracle_eye',
                'ultrafusion'
            ],
            'allow_analytics': True,
            'allow_export': True,
            'allow_webhooks': True,
            'price_per_month': 2499
        },
        LicenseTier.GOVERNMENT: {
            'name': 'Government / Unlimited',
            'rate_limit_per_month': -1,  # Unlimited
            'rate_limit_per_day': -1,
            'rate_limit_per_hour': -1,
            'concurrency_limit': 100,
            'allowed_engines': [
                'fusion',
                'hydra',
                'radar',
                'profiler',
                'constellation',
                'sentinel',
                'cortex',
                'genesis',
                'oracle_eye',
                'ultrafusion',
                'operation_hydra',
                'threat_actor',
                'valkyrie',
                'phantom'
            ],
            'allow_analytics': True,
            'allow_export': True,
            'allow_webhooks': True,
            'price_per_month': 'Custom'
        }
    }
    
    ALL_ENGINES = [
        'fusion',
        'hydra',
        'radar',
        'profiler',
        'constellation',
        'sentinel',
        'cortex',
        'genesis',
        'oracle_eye',
        'ultrafusion',
        'operation_hydra',
        'threat_actor',
        'valkyrie',
        'phantom'
    ]
    
    def __init__(self):
        self._licenses: Dict[str, LicenseRecord] = {}
        self._usage_log: List[Dict[str, Any]] = []
    
    
    def create_license(
        self,
        customer_name: str,
        customer_email: str,
        tier: str,
        custom_permissions: Optional[Dict[str, Any]] = None,
        expires_in_days: Optional[int] = None,
        ip_whitelist: Optional[List[str]] = None
    ) -> LicenseRecord:
        """
        Create a new API license
        
        Args:
            customer_name: Customer organization name
            customer_email: Customer contact email
            tier: License tier (developer, business, enterprise, government)
            custom_permissions: Optional custom permissions override
            expires_in_days: Optional expiration in days (None = no expiration)
            ip_whitelist: Optional list of allowed IP addresses
        
        Returns:
            LicenseRecord with key, permissions, and usage tracking
        """
        if tier not in [t.value for t in LicenseTier]:
            raise ValueError(f"Invalid tier: {tier}. Must be one of: {[t.value for t in LicenseTier]}")
        
        api_key = self.generate_api_key()
        
        tier_def = self.TIER_DEFINITIONS[tier]
        
        if custom_permissions:
            permissions = LicensePermissions(
                tier=tier,
                allowed_engines=custom_permissions.get('allowed_engines', tier_def['allowed_engines']),
                rate_limit_per_month=custom_permissions.get('rate_limit_per_month', tier_def['rate_limit_per_month']),
                rate_limit_per_day=custom_permissions.get('rate_limit_per_day', tier_def['rate_limit_per_day']),
                rate_limit_per_hour=custom_permissions.get('rate_limit_per_hour', tier_def['rate_limit_per_hour']),
                concurrency_limit=custom_permissions.get('concurrency_limit', tier_def['concurrency_limit']),
                ip_whitelist=ip_whitelist or [],
                allow_analytics=custom_permissions.get('allow_analytics', tier_def['allow_analytics']),
                allow_export=custom_permissions.get('allow_export', tier_def['allow_export']),
                allow_webhooks=custom_permissions.get('allow_webhooks', tier_def['allow_webhooks'])
            )
        else:
            permissions = LicensePermissions(
                tier=tier,
                allowed_engines=tier_def['allowed_engines'].copy(),
                rate_limit_per_month=tier_def['rate_limit_per_month'],
                rate_limit_per_day=tier_def['rate_limit_per_day'],
                rate_limit_per_hour=tier_def['rate_limit_per_hour'],
                concurrency_limit=tier_def['concurrency_limit'],
                ip_whitelist=ip_whitelist or [],
                allow_analytics=tier_def['allow_analytics'],
                allow_export=tier_def['allow_export'],
                allow_webhooks=tier_def['allow_webhooks']
            )
        
        now = datetime.utcnow()
        expires_at = None
        if expires_in_days:
            expires_at = (now + timedelta(days=expires_in_days)).isoformat()
        
        key = LicenseKey(
            api_key=api_key,
            customer_name=customer_name,
            customer_email=customer_email,
            tier=tier,
            status=LicenseStatus.ACTIVE.value,
            created_at=now.isoformat(),
            expires_at=expires_at
        )
        
        usage = LicenseUsage(
            api_key=api_key,
            last_reset_daily=now.isoformat(),
            last_reset_hourly=now.isoformat(),
            last_reset_monthly=now.isoformat()
        )
        
        record = LicenseRecord(
            key=key,
            permissions=permissions,
            usage=usage
        )
        
        self._licenses[api_key] = record
        
        return record
    
    def generate_api_key(self) -> str:
        """Generate a secure 64-character API key"""
        random_bytes = secrets.token_bytes(32)
        
        hash_obj = hashlib.sha256(random_bytes)
        hash_obj.update(datetime.utcnow().isoformat().encode())
        
        return hash_obj.hexdigest()
    
    
    def validate_request(
        self,
        api_key: str,
        module_name: str,
        client_ip: Optional[str] = None
    ) -> LicenseValidationResult:
        """
        Validate an API request
        
        Args:
            api_key: API key to validate
            module_name: Intelligence engine being accessed
            client_ip: Optional client IP address for whitelist checking
        
        Returns:
            LicenseValidationResult with validation status and details
        """
        if api_key not in self._licenses:
            return LicenseValidationResult(
                valid=False,
                reason="Invalid API key"
            )
        
        record = self._licenses[api_key]
        
        if record.key.status != LicenseStatus.ACTIVE.value:
            return LicenseValidationResult(
                valid=False,
                api_key=api_key,
                reason=f"License is {record.key.status}"
            )
        
        if record.key.expires_at:
            expires_at = datetime.fromisoformat(record.key.expires_at)
            if datetime.utcnow() > expires_at:
                record.key.status = LicenseStatus.EXPIRED.value
                return LicenseValidationResult(
                    valid=False,
                    api_key=api_key,
                    reason="License has expired"
                )
        
        if record.permissions.ip_whitelist and client_ip:
            if client_ip not in record.permissions.ip_whitelist:
                return LicenseValidationResult(
                    valid=False,
                    api_key=api_key,
                    reason=f"IP address {client_ip} not in whitelist"
                )
        
        if module_name not in record.permissions.allowed_engines:
            return LicenseValidationResult(
                valid=False,
                api_key=api_key,
                tier=record.key.tier,
                allowed_engines=record.permissions.allowed_engines,
                reason=f"Module '{module_name}' not allowed for {record.key.tier} tier"
            )
        
        self._reset_usage_counters(record)
        
        rate_limit_check = self._check_rate_limits(record)
        if not rate_limit_check[0]:
            return LicenseValidationResult(
                valid=False,
                api_key=api_key,
                tier=record.key.tier,
                allowed_engines=record.permissions.allowed_engines,
                reason=rate_limit_check[1]
            )
        
        remaining_hour = self._calculate_remaining(
            record.usage.requests_this_hour,
            record.permissions.rate_limit_per_hour
        )
        remaining_day = self._calculate_remaining(
            record.usage.requests_today,
            record.permissions.rate_limit_per_day
        )
        remaining_month = self._calculate_remaining(
            record.usage.requests_this_month,
            record.permissions.rate_limit_per_month
        )
        
        return LicenseValidationResult(
            valid=True,
            api_key=api_key,
            tier=record.key.tier,
            allowed_engines=record.permissions.allowed_engines,
            remaining_requests_hour=remaining_hour,
            remaining_requests_today=remaining_day,
            remaining_requests_month=remaining_month
        )
    
    def _reset_usage_counters(self, record: LicenseRecord) -> None:
        """Reset usage counters if time periods have elapsed"""
        now = datetime.utcnow()
        
        if record.usage.last_reset_hourly:
            last_reset = datetime.fromisoformat(record.usage.last_reset_hourly)
            if (now - last_reset).total_seconds() >= 3600:  # 1 hour
                record.usage.requests_this_hour = 0
                record.usage.last_reset_hourly = now.isoformat()
        
        if record.usage.last_reset_daily:
            last_reset = datetime.fromisoformat(record.usage.last_reset_daily)
            if (now - last_reset).days >= 1:
                record.usage.requests_today = 0
                record.usage.last_reset_daily = now.isoformat()
        
        if record.usage.last_reset_monthly:
            last_reset = datetime.fromisoformat(record.usage.last_reset_monthly)
            if (now - last_reset).days >= 30:
                record.usage.requests_this_month = 0
                record.usage.last_reset_monthly = now.isoformat()
    
    def _check_rate_limits(self, record: LicenseRecord) -> Tuple[bool, Optional[str]]:
        """Check if rate limits are exceeded"""
        if record.key.tier == LicenseTier.GOVERNMENT.value:
            return (True, None)
        
        if record.permissions.rate_limit_per_hour > 0:
            if record.usage.requests_this_hour >= record.permissions.rate_limit_per_hour:
                return (False, f"Hourly rate limit exceeded ({record.permissions.rate_limit_per_hour} requests/hour)")
        
        if record.permissions.rate_limit_per_day > 0:
            if record.usage.requests_today >= record.permissions.rate_limit_per_day:
                return (False, f"Daily rate limit exceeded ({record.permissions.rate_limit_per_day} requests/day)")
        
        if record.permissions.rate_limit_per_month > 0:
            if record.usage.requests_this_month >= record.permissions.rate_limit_per_month:
                return (False, f"Monthly rate limit exceeded ({record.permissions.rate_limit_per_month} requests/month)")
        
        return (True, None)
    
    def _calculate_remaining(self, used: int, limit: int) -> Optional[int]:
        """Calculate remaining requests"""
        if limit < 0:  # Unlimited
            return None
        return max(0, limit - used)
    
    
    def record_usage(
        self,
        api_key: str,
        module_name: str,
        client_ip: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Record API usage
        
        Args:
            api_key: API key
            module_name: Intelligence engine accessed
            client_ip: Optional client IP
            metadata: Optional request metadata
        
        Returns:
            True if usage recorded successfully
        """
        if api_key not in self._licenses:
            return False
        
        record = self._licenses[api_key]
        now = datetime.utcnow()
        
        record.usage.total_requests += 1
        record.usage.requests_this_hour += 1
        record.usage.requests_today += 1
        record.usage.requests_this_month += 1
        
        if module_name not in record.usage.engine_usage:
            record.usage.engine_usage[module_name] = 0
        record.usage.engine_usage[module_name] += 1
        
        record.key.last_used_at = now.isoformat()
        
        self._usage_log.append({
            'timestamp': now.isoformat(),
            'api_key': api_key,
            'module': module_name,
            'client_ip': client_ip,
            'metadata': metadata or {}
        })
        
        return True
    
    def get_usage(self, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Get usage statistics for a license
        
        Args:
            api_key: API key
        
        Returns:
            Usage statistics dictionary or None if license not found
        """
        if api_key not in self._licenses:
            return None
        
        record = self._licenses[api_key]
        
        usage_pct_hour = self._calculate_usage_percentage(
            record.usage.requests_this_hour,
            record.permissions.rate_limit_per_hour
        )
        usage_pct_day = self._calculate_usage_percentage(
            record.usage.requests_today,
            record.permissions.rate_limit_per_day
        )
        usage_pct_month = self._calculate_usage_percentage(
            record.usage.requests_this_month,
            record.permissions.rate_limit_per_month
        )
        
        return {
            'api_key': api_key,
            'tier': record.key.tier,
            'status': record.key.status,
            'total_requests': record.usage.total_requests,
            'requests_this_hour': record.usage.requests_this_hour,
            'requests_today': record.usage.requests_today,
            'requests_this_month': record.usage.requests_this_month,
            'usage_percentage_hour': usage_pct_hour,
            'usage_percentage_day': usage_pct_day,
            'usage_percentage_month': usage_pct_month,
            'remaining_hour': self._calculate_remaining(
                record.usage.requests_this_hour,
                record.permissions.rate_limit_per_hour
            ),
            'remaining_day': self._calculate_remaining(
                record.usage.requests_today,
                record.permissions.rate_limit_per_day
            ),
            'remaining_month': self._calculate_remaining(
                record.usage.requests_this_month,
                record.permissions.rate_limit_per_month
            ),
            'engine_usage': record.usage.engine_usage,
            'last_used_at': record.key.last_used_at
        }
    
    def _calculate_usage_percentage(self, used: int, limit: int) -> Optional[float]:
        """Calculate usage percentage"""
        if limit < 0:  # Unlimited
            return None
        if limit == 0:
            return 100.0
        return round((used / limit) * 100, 2)
    
    def get_usage_history(
        self,
        api_key: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get usage history
        
        Args:
            api_key: Optional API key filter
            limit: Maximum number of records to return
        
        Returns:
            List of usage log entries
        """
        if api_key:
            filtered = [log for log in self._usage_log if log['api_key'] == api_key]
        else:
            filtered = self._usage_log
        
        return filtered[-limit:]
    
    
    def revoke(self, api_key: str, reason: Optional[str] = None) -> bool:
        """
        Revoke a license
        
        Args:
            api_key: API key to revoke
            reason: Optional revocation reason
        
        Returns:
            True if revoked successfully
        """
        if api_key not in self._licenses:
            return False
        
        record = self._licenses[api_key]
        record.key.status = LicenseStatus.REVOKED.value
        record.key.revoked_at = datetime.utcnow().isoformat()
        
        return True
    
    def suspend(self, api_key: str) -> bool:
        """
        Suspend a license (can be reactivated)
        
        Args:
            api_key: API key to suspend
        
        Returns:
            True if suspended successfully
        """
        if api_key not in self._licenses:
            return False
        
        record = self._licenses[api_key]
        record.key.status = LicenseStatus.SUSPENDED.value
        
        return True
    
    def reactivate(self, api_key: str) -> bool:
        """
        Reactivate a suspended license
        
        Args:
            api_key: API key to reactivate
        
        Returns:
            True if reactivated successfully
        """
        if api_key not in self._licenses:
            return False
        
        record = self._licenses[api_key]
        
        if record.key.status != LicenseStatus.SUSPENDED.value:
            return False
        
        if record.key.expires_at:
            expires_at = datetime.fromisoformat(record.key.expires_at)
            if datetime.utcnow() > expires_at:
                record.key.status = LicenseStatus.EXPIRED.value
                return False
        
        record.key.status = LicenseStatus.ACTIVE.value
        
        return True
    
    def update_permissions(
        self,
        api_key: str,
        new_permissions: Dict[str, Any]
    ) -> bool:
        """
        Update license permissions
        
        Args:
            api_key: API key
            new_permissions: New permissions dictionary
        
        Returns:
            True if updated successfully
        """
        if api_key not in self._licenses:
            return False
        
        record = self._licenses[api_key]
        
        if 'allowed_engines' in new_permissions:
            record.permissions.allowed_engines = new_permissions['allowed_engines']
        if 'rate_limit_per_month' in new_permissions:
            record.permissions.rate_limit_per_month = new_permissions['rate_limit_per_month']
        if 'rate_limit_per_day' in new_permissions:
            record.permissions.rate_limit_per_day = new_permissions['rate_limit_per_day']
        if 'rate_limit_per_hour' in new_permissions:
            record.permissions.rate_limit_per_hour = new_permissions['rate_limit_per_hour']
        if 'concurrency_limit' in new_permissions:
            record.permissions.concurrency_limit = new_permissions['concurrency_limit']
        if 'ip_whitelist' in new_permissions:
            record.permissions.ip_whitelist = new_permissions['ip_whitelist']
        if 'allow_analytics' in new_permissions:
            record.permissions.allow_analytics = new_permissions['allow_analytics']
        if 'allow_export' in new_permissions:
            record.permissions.allow_export = new_permissions['allow_export']
        if 'allow_webhooks' in new_permissions:
            record.permissions.allow_webhooks = new_permissions['allow_webhooks']
        
        return True
    
    def extend_expiration(
        self,
        api_key: str,
        additional_days: int
    ) -> bool:
        """
        Extend license expiration
        
        Args:
            api_key: API key
            additional_days: Number of days to add
        
        Returns:
            True if extended successfully
        """
        if api_key not in self._licenses:
            return False
        
        record = self._licenses[api_key]
        
        if record.key.expires_at:
            expires_at = datetime.fromisoformat(record.key.expires_at)
        else:
            expires_at = datetime.utcnow()
        
        new_expires_at = expires_at + timedelta(days=additional_days)
        record.key.expires_at = new_expires_at.isoformat()
        
        if record.key.status == LicenseStatus.EXPIRED.value:
            record.key.status = LicenseStatus.ACTIVE.value
        
        return True
    
    def list_licenses(
        self,
        status_filter: Optional[str] = None,
        tier_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List all licenses
        
        Args:
            status_filter: Optional status filter
            tier_filter: Optional tier filter
        
        Returns:
            List of license summaries
        """
        licenses = []
        
        for api_key, record in self._licenses.items():
            if status_filter and record.key.status != status_filter:
                continue
            if tier_filter and record.key.tier != tier_filter:
                continue
            
            licenses.append({
                'api_key': api_key,
                'customer_name': record.key.customer_name,
                'customer_email': record.key.customer_email,
                'tier': record.key.tier,
                'status': record.key.status,
                'created_at': record.key.created_at,
                'expires_at': record.key.expires_at,
                'last_used_at': record.key.last_used_at,
                'total_requests': record.usage.total_requests,
                'allowed_engines': record.permissions.allowed_engines
            })
        
        return licenses
    
    def get_license(self, api_key: str) -> Optional[LicenseRecord]:
        """
        Get complete license record
        
        Args:
            api_key: API key
        
        Returns:
            LicenseRecord or None if not found
        """
        return self._licenses.get(api_key)
    
    
    def export_license(self, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Export license to JSON
        
        Args:
            api_key: API key
        
        Returns:
            License data dictionary or None if not found
        """
        if api_key not in self._licenses:
            return None
        
        record = self._licenses[api_key]
        return record.to_dict()
    
    def import_license(self, license_data: Dict[str, Any]) -> bool:
        """
        Import license from JSON
        
        Args:
            license_data: License data dictionary
        
        Returns:
            True if imported successfully
        """
        try:
            key = LicenseKey(**license_data['key'])
            permissions = LicensePermissions(**license_data['permissions'])
            usage = LicenseUsage(**license_data['usage'])
            
            record = LicenseRecord(
                key=key,
                permissions=permissions,
                usage=usage
            )
            
            self._licenses[key.api_key] = record
            
            return True
        except Exception as e:
            return False
    
    def export_all_licenses(self) -> Dict[str, Any]:
        """
        Export all licenses to JSON
        
        Returns:
            Dictionary with all licenses
        """
        return {
            'version': self.VERSION,
            'exported_at': datetime.utcnow().isoformat(),
            'total_licenses': len(self._licenses),
            'licenses': {
                api_key: record.to_dict()
                for api_key, record in self._licenses.items()
            }
        }
    
    def import_all_licenses(self, data: Dict[str, Any]) -> Tuple[int, int]:
        """
        Import all licenses from JSON
        
        Args:
            data: Dictionary with all licenses
        
        Returns:
            Tuple of (successful_imports, failed_imports)
        """
        successful = 0
        failed = 0
        
        for api_key, license_data in data.get('licenses', {}).items():
            if self.import_license(license_data):
                successful += 1
            else:
                failed += 1
        
        return (successful, failed)
    
    
    def get_analytics(self) -> Dict[str, Any]:
        """
        Get platform-wide analytics
        
        Returns:
            Analytics dictionary
        """
        total_licenses = len(self._licenses)
        active_licenses = sum(1 for r in self._licenses.values() if r.key.status == LicenseStatus.ACTIVE.value)
        expired_licenses = sum(1 for r in self._licenses.values() if r.key.status == LicenseStatus.EXPIRED.value)
        revoked_licenses = sum(1 for r in self._licenses.values() if r.key.status == LicenseStatus.REVOKED.value)
        
        tier_distribution = {}
        for tier in LicenseTier:
            tier_distribution[tier.value] = sum(
                1 for r in self._licenses.values() if r.key.tier == tier.value
            )
        
        total_requests = sum(r.usage.total_requests for r in self._licenses.values())
        
        engine_usage = {}
        for record in self._licenses.values():
            for engine, count in record.usage.engine_usage.items():
                if engine not in engine_usage:
                    engine_usage[engine] = 0
                engine_usage[engine] += count
        
        return {
            'total_licenses': total_licenses,
            'active_licenses': active_licenses,
            'expired_licenses': expired_licenses,
            'revoked_licenses': revoked_licenses,
            'tier_distribution': tier_distribution,
            'total_requests': total_requests,
            'engine_usage': engine_usage,
            'usage_log_entries': len(self._usage_log)
        }
    
    def get_tier_info(self, tier: str) -> Optional[Dict[str, Any]]:
        """
        Get tier information
        
        Args:
            tier: Tier name
        
        Returns:
            Tier information dictionary or None if invalid tier
        """
        if tier not in [t.value for t in LicenseTier]:
            return None
        
        return self.TIER_DEFINITIONS[tier]
    
    def get_all_tiers(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all tier definitions
        
        Returns:
            Dictionary of all tiers
        """
        return {
            tier.value: self.TIER_DEFINITIONS[tier]
            for tier in LicenseTier
        }
    
    
    def health(self) -> Dict[str, Any]:
        """
        Health check for license engine
        
        Returns:
            Health status dictionary
        """
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'total_licenses': len(self._licenses),
            'active_licenses': sum(1 for r in self._licenses.values() if r.key.status == LicenseStatus.ACTIVE.value),
            'available_tiers': [t.value for t in LicenseTier],
            'available_engines': self.ALL_ENGINES,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def info(self) -> Dict[str, Any]:
        """
        Get license engine information
        
        Returns:
            Information dictionary
        """
        return {
            'name': 'Enterprise API Licensing Framework™',
            'version': self.VERSION,
            'description': 'Commercial licensing engine for GhostQuant intelligence APIs',
            'features': [
                'Tiered licensing (Developer, Business, Enterprise, Government)',
                'Per-engine permissions',
                'Rate limiting and usage tracking',
                'IP whitelisting',
                'Expiration and revocation',
                'Usage analytics',
                'Import/export capabilities'
            ],
            'available_tiers': [t.value for t in LicenseTier],
            'available_engines': self.ALL_ENGINES,
            'tier_definitions': self.get_all_tiers()
        }

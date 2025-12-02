"""
GhostQuant™ — Secure Key Management & Secrets Governance
Module: secret_manager.py
Purpose: SecretManager class for secure secret storage and access

SECURITY NOTICE:
- NEVER stores raw secret values anywhere
- Only SHA-256 hashes are persisted
- All access is logged for audit compliance
- Crash-proof implementation with comprehensive error handling
- Compliant with NIST 800-53 SC-12, SC-13, AC-3, AU-2
"""

import os
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

from .secret_schema import (
    SecretRecord,
    SecretMetadata,
    SecretAccessLog,
    SecretAction,
    SecretClassification,
    SecretEnvironment
)


class SecretManager:
    """
    Secure secret manager for GhostQuant™.
    
    Features:
    - Load secrets from environment variables
    - Store only SHA-256 hashes (never raw values)
    - Comprehensive audit logging
    - Rotation tracking
    - Crash-proof error handling
    - Pure Python implementation (no external dependencies)
    
    Security Principles:
    1. Never store raw secret values
    2. Log all access attempts
    3. Fail securely (return None instead of crashing)
    4. Validate all inputs
    5. Use constant-time comparisons where possible
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize SecretManager.
        
        Args:
            storage_path: Path to store secret metadata (default: ./secrets_metadata.json)
        """
        self.storage_path = storage_path or "/tmp/ghostquant_secrets_metadata.json"
        self.secrets: Dict[str, SecretRecord] = {}
        self.access_logs: List[SecretAccessLog] = []
        self.in_memory_secrets: Dict[str, str] = {}  # Temporary storage for current session
        
        self._load_metadata()
    
    def _load_metadata(self) -> None:
        """Load secrets metadata from storage (crash-proof)"""
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                    
                    for secret_data in data.get('secrets', []):
                        try:
                            secret = SecretRecord(
                                name=secret_data['name'],
                                value_hash=secret_data['value_hash'],
                                created_at=datetime.fromisoformat(secret_data['created_at']),
                                last_rotated=datetime.fromisoformat(secret_data['last_rotated']),
                                rotations_count=secret_data.get('rotations_count', 0),
                                environment=SecretEnvironment(secret_data.get('environment', 'PRODUCTION')),
                                classification=SecretClassification(secret_data.get('classification', 'MODERATE')),
                                owner=secret_data.get('owner', 'security-team'),
                                purpose=secret_data.get('purpose', ''),
                                rotation_frequency_days=secret_data.get('rotation_frequency_days', 90),
                                is_active=secret_data.get('is_active', True)
                            )
                            self.secrets[secret.name] = secret
                        except Exception as e:
                            print(f"Warning: Failed to load secret record: {e}")
                            continue
                    
                    for log_data in data.get('access_logs', []):
                        try:
                            log = SecretAccessLog(
                                timestamp=datetime.fromisoformat(log_data['timestamp']),
                                name=log_data['name'],
                                actor=log_data['actor'],
                                action=SecretAction(log_data['action']),
                                ip=log_data['ip'],
                                success=log_data.get('success', True),
                                reason=log_data.get('reason', ''),
                                metadata=log_data.get('metadata', {})
                            )
                            self.access_logs.append(log)
                        except Exception as e:
                            print(f"Warning: Failed to load access log: {e}")
                            continue
        except Exception as e:
            print(f"Warning: Failed to load secrets metadata: {e}")
            self.secrets = {}
            self.access_logs = []
    
    def _save_metadata(self) -> bool:
        """Save secrets metadata to storage (crash-proof)"""
        try:
            data = {
                'secrets': [secret.to_dict() for secret in self.secrets.values()],
                'access_logs': [log.to_dict() for log in self.access_logs[-1000:]]  # Keep last 1000 logs
            }
            
            temp_path = self.storage_path + '.tmp'
            with open(temp_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            os.replace(temp_path, self.storage_path)
            return True
        except Exception as e:
            print(f"Error: Failed to save secrets metadata: {e}")
            return False
    
    def compute_hash(self, value: str) -> str:
        """
        Compute SHA-256 hash of a secret value.
        
        Args:
            value: Secret value to hash
            
        Returns:
            Hexadecimal SHA-256 hash
        """
        if not value:
            return ""
        
        try:
            return hashlib.sha256(value.encode('utf-8')).hexdigest()
        except Exception as e:
            print(f"Error: Failed to compute hash: {e}")
            return ""
    
    def record_access(
        self,
        name: str,
        actor: str,
        action: SecretAction,
        ip: str = "127.0.0.1",
        success: bool = True,
        reason: str = ""
    ) -> None:
        """
        Record secret access for audit logging.
        
        Args:
            name: Name of the secret accessed
            actor: User/service that accessed the secret
            action: Type of action performed
            ip: IP address of the accessor
            success: Whether the access was successful
            reason: Reason for access
        """
        try:
            log = SecretAccessLog(
                timestamp=datetime.utcnow(),
                name=name,
                actor=actor,
                action=action,
                ip=ip,
                success=success,
                reason=reason
            )
            self.access_logs.append(log)
            
            if len(self.access_logs) % 10 == 0:
                self._save_metadata()
        except Exception as e:
            print(f"Error: Failed to record access: {e}")
    
    def load_secrets_from_env(self) -> int:
        """
        Load secrets from environment variables.
        
        Scans environment for variables matching patterns:
        - GHOSTQUANT_*
        - PROD_*
        - STAGING_*
        - DEV_*
        - *_API_KEY
        - *_SECRET
        - *_PASSWORD
        - *_TOKEN
        
        Returns:
            Number of secrets loaded
        """
        count = 0
        patterns = [
            'GHOSTQUANT_',
            'PROD_',
            'STAGING_',
            'DEV_',
            '_API_KEY',
            '_SECRET',
            '_PASSWORD',
            '_TOKEN'
        ]
        
        try:
            for key, value in os.environ.items():
                if any(pattern in key for pattern in patterns):
                    self.in_memory_secrets[key] = value
                    
                    if key not in self.secrets:
                        secret = SecretRecord(
                            name=key,
                            value_hash=self.compute_hash(value),
                            created_at=datetime.utcnow(),
                            last_rotated=datetime.utcnow(),
                            rotations_count=0,
                            environment=self._detect_environment(key),
                            classification=self._detect_classification(key),
                            owner="system",
                            purpose=f"Environment variable: {key}"
                        )
                        self.secrets[key] = secret
                        count += 1
                    
                    self.record_access(
                        name=key,
                        actor="system",
                        action=SecretAction.READ,
                        reason="load_from_env"
                    )
            
            self._save_metadata()
            
        except Exception as e:
            print(f"Error: Failed to load secrets from environment: {e}")
        
        return count
    
    def _detect_environment(self, name: str) -> SecretEnvironment:
        """Detect environment from secret name"""
        name_upper = name.upper()
        if 'PROD' in name_upper or 'PRODUCTION' in name_upper:
            return SecretEnvironment.PRODUCTION
        elif 'STAGING' in name_upper or 'STAGE' in name_upper:
            return SecretEnvironment.STAGING
        elif 'DEV' in name_upper or 'DEVELOPMENT' in name_upper:
            return SecretEnvironment.DEVELOPMENT
        else:
            return SecretEnvironment.PRODUCTION  # Default to production for safety
    
    def _detect_classification(self, name: str) -> SecretClassification:
        """Detect classification from secret name"""
        name_upper = name.upper()
        
        if any(x in name_upper for x in ['DATABASE', 'DB_', 'MASTER', 'ROOT', 'ADMIN']):
            return SecretClassification.CRITICAL
        
        if any(x in name_upper for x in ['API_KEY', 'PASSWORD', 'TOKEN', 'SECRET']):
            return SecretClassification.HIGH
        
        if 'PROD' in name_upper:
            return SecretClassification.MODERATE
        
        return SecretClassification.LOW
    
    def get_secret(self, name: str, actor: str = "system", ip: str = "127.0.0.1") -> Optional[str]:
        """
        Get secret value (from in-memory storage only).
        
        SECURITY: This only returns secrets loaded in current session.
        Raw values are NEVER persisted to disk.
        
        Args:
            name: Name of the secret
            actor: User/service requesting the secret
            ip: IP address of the requester
            
        Returns:
            Secret value if found, None otherwise
        """
        try:
            success = name in self.in_memory_secrets
            self.record_access(
                name=name,
                actor=actor,
                action=SecretAction.READ,
                ip=ip,
                success=success,
                reason="get_secret"
            )
            
            if success:
                return self.in_memory_secrets[name]
            else:
                return None
        except Exception as e:
            print(f"Error: Failed to get secret: {e}")
            return None
    
    def set_secret(
        self,
        name: str,
        value: str,
        actor: str = "system",
        ip: str = "127.0.0.1",
        metadata: Optional[SecretMetadata] = None
    ) -> bool:
        """
        Set a secret value.
        
        Args:
            name: Name of the secret
            value: Secret value (stored in memory only, hash persisted)
            actor: User/service setting the secret
            ip: IP address of the setter
            metadata: Optional metadata for the secret
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not name or not value:
                return False
            
            self.in_memory_secrets[name] = value
            
            value_hash = self.compute_hash(value)
            
            if name in self.secrets:
                self.secrets[name].value_hash = value_hash
                self.secrets[name].last_rotated = datetime.utcnow()
                self.secrets[name].rotations_count += 1
            else:
                secret = SecretRecord(
                    name=name,
                    value_hash=value_hash,
                    created_at=datetime.utcnow(),
                    last_rotated=datetime.utcnow(),
                    rotations_count=0,
                    environment=metadata.environment if metadata else self._detect_environment(name),
                    classification=metadata.classification if metadata else self._detect_classification(name),
                    owner=metadata.owner if metadata else "system",
                    purpose=metadata.purpose if metadata else f"Secret: {name}"
                )
                self.secrets[name] = secret
            
            self.record_access(
                name=name,
                actor=actor,
                action=SecretAction.CREATE if name not in self.secrets else SecretAction.UPDATE,
                ip=ip,
                success=True,
                reason="set_secret"
            )
            
            self._save_metadata()
            
            return True
        except Exception as e:
            print(f"Error: Failed to set secret: {e}")
            return False
    
    def rotate_secret(self, name: str, new_value: str, actor: str = "system", ip: str = "127.0.0.1") -> bool:
        """
        Rotate a secret to a new value.
        
        Args:
            name: Name of the secret to rotate
            new_value: New secret value
            actor: User/service rotating the secret
            ip: IP address of the rotator
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if name not in self.secrets:
                return False
            
            old_hash = self.secrets[name].value_hash
            
            self.in_memory_secrets[name] = new_value
            self.secrets[name].value_hash = self.compute_hash(new_value)
            self.secrets[name].last_rotated = datetime.utcnow()
            self.secrets[name].rotations_count += 1
            
            self.record_access(
                name=name,
                actor=actor,
                action=SecretAction.ROTATE,
                ip=ip,
                success=True,
                reason="rotate_secret",
                metadata={'old_hash': old_hash, 'new_hash': self.secrets[name].value_hash}
            )
            
            self._save_metadata()
            
            return True
        except Exception as e:
            print(f"Error: Failed to rotate secret: {e}")
            return False
    
    def delete_secret(self, name: str, actor: str = "system", ip: str = "127.0.0.1") -> bool:
        """
        Delete a secret.
        
        Args:
            name: Name of the secret to delete
            actor: User/service deleting the secret
            ip: IP address of the deleter
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if name not in self.secrets:
                return False
            
            self.secrets[name].is_active = False
            
            if name in self.in_memory_secrets:
                del self.in_memory_secrets[name]
            
            self.record_access(
                name=name,
                actor=actor,
                action=SecretAction.DELETE,
                ip=ip,
                success=True,
                reason="delete_secret"
            )
            
            self._save_metadata()
            
            return True
        except Exception as e:
            print(f"Error: Failed to delete secret: {e}")
            return False
    
    def list_secrets(self, actor: str = "system", ip: str = "127.0.0.1", include_inactive: bool = False) -> List[Dict[str, Any]]:
        """
        List all secrets (metadata only, no values).
        
        Args:
            actor: User/service listing secrets
            ip: IP address of the lister
            include_inactive: Whether to include inactive secrets
            
        Returns:
            List of secret metadata dictionaries
        """
        try:
            self.record_access(
                name="*",
                actor=actor,
                action=SecretAction.LIST,
                ip=ip,
                success=True,
                reason="list_secrets"
            )
            
            secrets_list = []
            for secret in self.secrets.values():
                if include_inactive or secret.is_active:
                    secrets_list.append(secret.to_dict())
            
            return secrets_list
        except Exception as e:
            print(f"Error: Failed to list secrets: {e}")
            return []
    
    def export_metadata(self, actor: str = "system", ip: str = "127.0.0.1") -> Dict[str, Any]:
        """
        Export all secrets metadata for backup/audit.
        
        Args:
            actor: User/service exporting metadata
            ip: IP address of the exporter
            
        Returns:
            Dictionary containing all metadata
        """
        try:
            self.record_access(
                name="*",
                actor=actor,
                action=SecretAction.EXPORT,
                ip=ip,
                success=True,
                reason="export_metadata"
            )
            
            return {
                'secrets': [secret.to_dict() for secret in self.secrets.values()],
                'access_logs': [log.to_dict() for log in self.access_logs[-100:]],  # Last 100 logs
                'exported_at': datetime.utcnow().isoformat(),
                'exported_by': actor
            }
        except Exception as e:
            print(f"Error: Failed to export metadata: {e}")
            return {}
    
    def get_access_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get recent access logs.
        
        Args:
            limit: Maximum number of logs to return
            
        Returns:
            List of access log dictionaries
        """
        try:
            return [log.to_dict() for log in self.access_logs[-limit:]]
        except Exception as e:
            print(f"Error: Failed to get access logs: {e}")
            return []
    
    def get_secret_metadata(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a specific secret.
        
        Args:
            name: Name of the secret
            
        Returns:
            Secret metadata dictionary if found, None otherwise
        """
        try:
            if name in self.secrets:
                return self.secrets[name].to_dict()
            else:
                return None
        except Exception as e:
            print(f"Error: Failed to get secret metadata: {e}")
            return None
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on secret manager.
        
        Returns:
            Health status dictionary
        """
        try:
            total_secrets = len(self.secrets)
            active_secrets = sum(1 for s in self.secrets.values() if s.is_active)
            stale_secrets = sum(1 for s in self.secrets.values() if s.is_active and s.is_stale())
            critical_secrets = sum(1 for s in self.secrets.values() if s.is_active and s.classification == SecretClassification.CRITICAL)
            
            if stale_secrets > 0:
                health_status = "WARNING"
            elif total_secrets == 0:
                health_status = "UNKNOWN"
            else:
                health_status = "HEALTHY"
            
            return {
                'status': health_status,
                'total_secrets': total_secrets,
                'active_secrets': active_secrets,
                'inactive_secrets': total_secrets - active_secrets,
                'stale_secrets': stale_secrets,
                'critical_secrets': critical_secrets,
                'total_access_logs': len(self.access_logs),
                'storage_path': self.storage_path,
                'last_check': datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error: Failed to perform health check: {e}")
            return {
                'status': 'ERROR',
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }


_secret_manager_instance: Optional[SecretManager] = None


def get_secret_manager() -> SecretManager:
    """Get global SecretManager instance (singleton pattern)"""
    global _secret_manager_instance
    if _secret_manager_instance is None:
        _secret_manager_instance = SecretManager()
    return _secret_manager_instance

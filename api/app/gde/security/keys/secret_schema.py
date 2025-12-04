"""
GhostQuant™ — Secure Key Management & Secrets Governance
Module: secret_schema.py
Purpose: Define dataclasses for SecretRecord, SecretMetadata, SecretAccessLog

SECURITY NOTICE:
- NO raw secret values are ever stored
- Only SHA-256 hashes are persisted
- All access is logged for audit compliance
- Compliant with NIST 800-53 SC-12, SC-13, AC-3
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum


class SecretClassification(str, Enum):
    """Secret classification levels per NIST 800-53"""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SecretEnvironment(str, Enum):
    """Environment where secret is used"""
    DEVELOPMENT = "DEVELOPMENT"
    STAGING = "STAGING"
    PRODUCTION = "PRODUCTION"
    ALL = "ALL"


class SecretAction(str, Enum):
    """Actions performed on secrets for audit logging"""
    READ = "READ"
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    ROTATE = "ROTATE"
    DELETE = "DELETE"
    LIST = "LIST"
    EXPORT = "EXPORT"


@dataclass
class SecretRecord:
    """
    Core secret record — stores metadata and hash ONLY.
    
    SECURITY: Raw secret values are NEVER stored in this record.
    Only SHA-256 hash is persisted for integrity verification.
    
    Attributes:
        name: Unique identifier for the secret (e.g., "POSTGRES_PASSWORD")
        value_hash: SHA-256 hash of the secret value (for integrity checking)
        created_at: Timestamp when secret was first created
        last_rotated: Timestamp of most recent rotation
        rotations_count: Number of times secret has been rotated
        environment: Environment where secret is used
        classification: Security classification level
        owner: Team/person responsible for this secret
        purpose: Human-readable description of secret's purpose
        rotation_frequency_days: Required rotation frequency (0 = no rotation required)
        is_active: Whether secret is currently active
    """
    name: str
    value_hash: str
    created_at: datetime
    last_rotated: datetime
    rotations_count: int = 0
    environment: SecretEnvironment = SecretEnvironment.PRODUCTION
    classification: SecretClassification = SecretClassification.MODERATE
    owner: str = "security-team"
    purpose: str = ""
    rotation_frequency_days: int = 90
    is_active: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "name": self.name,
            "value_hash": self.value_hash,
            "created_at": self.created_at.isoformat(),
            "last_rotated": self.last_rotated.isoformat(),
            "rotations_count": self.rotations_count,
            "environment": self.environment.value,
            "classification": self.classification.value,
            "owner": self.owner,
            "purpose": self.purpose,
            "rotation_frequency_days": self.rotation_frequency_days,
            "is_active": self.is_active
        }
    
    def is_stale(self, threshold_days: int = 90) -> bool:
        """Check if secret needs rotation based on age"""
        if self.rotation_frequency_days == 0:
            return False  # No rotation required
        
        days_since_rotation = (datetime.utcnow() - self.last_rotated).days
        return days_since_rotation >= threshold_days
    
    def days_until_rotation(self) -> int:
        """Calculate days until next required rotation"""
        if self.rotation_frequency_days == 0:
            return -1  # No rotation required
        
        days_since_rotation = (datetime.utcnow() - self.last_rotated).days
        return max(0, self.rotation_frequency_days - days_since_rotation)


@dataclass
class SecretMetadata:
    """
    Metadata about a secret for governance and compliance.
    
    This is separate from SecretRecord to allow policy management
    without exposing secret hashes or rotation history.
    
    Attributes:
        owner: Team/person responsible for this secret
        purpose: Human-readable description of secret's purpose
        environment: Environment where secret is used
        classification: Security classification level
        allowed_roles: List of roles permitted to access this secret
        encryption_required: Whether secret must be encrypted at rest
        rotation_frequency_days: Required rotation frequency (0 = no rotation)
        compliance_tags: Tags for compliance tracking (e.g., ["PCI-DSS", "SOC2"])
        created_by: User who created this secret
        approved_by: User who approved this secret for use
    """
    owner: str
    purpose: str
    environment: SecretEnvironment
    classification: SecretClassification
    allowed_roles: List[str] = field(default_factory=list)
    encryption_required: bool = True
    rotation_frequency_days: int = 90
    compliance_tags: List[str] = field(default_factory=list)
    created_by: str = "system"
    approved_by: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "owner": self.owner,
            "purpose": self.purpose,
            "environment": self.environment.value,
            "classification": self.classification.value,
            "allowed_roles": self.allowed_roles,
            "encryption_required": self.encryption_required,
            "rotation_frequency_days": self.rotation_frequency_days,
            "compliance_tags": self.compliance_tags,
            "created_by": self.created_by,
            "approved_by": self.approved_by
        }
    
    def is_compliant(self) -> bool:
        """Check if metadata meets minimum compliance requirements"""
        if not self.owner or self.owner == "":
            return False
        if not self.purpose or self.purpose == "":
            return False
        if self.classification == SecretClassification.CRITICAL and not self.approved_by:
            return False
        if self.classification in [SecretClassification.HIGH, SecretClassification.CRITICAL]:
            if not self.encryption_required:
                return False
        return True


@dataclass
class SecretAccessLog:
    """
    Audit log entry for secret access.
    
    Every access to a secret (read, create, update, rotate, delete)
    is logged for compliance and security monitoring.
    
    Compliant with:
    - NIST 800-53 AU-2, AU-3, AU-12
    - SOC 2 CC6.1, CC7.2
    - FedRAMP AU-2, AU-3
    
    Attributes:
        timestamp: When the access occurred (UTC)
        name: Name of the secret accessed
        actor: User/service that accessed the secret
        action: Type of action performed (READ, CREATE, UPDATE, etc.)
        ip: IP address of the accessor
        success: Whether the access was successful
        reason: Reason for access (optional)
        metadata: Additional context (optional)
    """
    timestamp: datetime
    name: str
    actor: str
    action: SecretAction
    ip: str
    success: bool = True
    reason: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "timestamp": self.timestamp.isoformat(),
            "name": self.name,
            "actor": self.actor,
            "action": self.action.value,
            "ip": self.ip,
            "success": self.success,
            "reason": self.reason,
            "metadata": self.metadata
        }
    
    def is_suspicious(self) -> bool:
        """Detect potentially suspicious access patterns"""
        if not self.success:
            return True
        
        if "CRITICAL" in self.name.upper() and self.action == SecretAction.DELETE:
            return True
        
        if self.ip.startswith("0.0.0.0") or self.ip == "127.0.0.1":
            return False  # Localhost is OK
        
        return False


@dataclass
class SecretRotationEvent:
    """
    Record of a secret rotation event.
    
    Tracks when secrets are rotated, who rotated them,
    and whether the rotation was successful.
    
    Attributes:
        secret_name: Name of the secret that was rotated
        timestamp: When the rotation occurred
        rotated_by: User/service that performed the rotation
        old_hash: SHA-256 hash of the old value (for audit trail)
        new_hash: SHA-256 hash of the new value
        success: Whether rotation was successful
        reason: Reason for rotation (scheduled, emergency, etc.)
    """
    secret_name: str
    timestamp: datetime
    rotated_by: str
    old_hash: str
    new_hash: str
    success: bool = True
    reason: str = "scheduled"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "secret_name": self.secret_name,
            "timestamp": self.timestamp.isoformat(),
            "rotated_by": self.rotated_by,
            "old_hash": self.old_hash,
            "new_hash": self.new_hash,
            "success": self.success,
            "reason": self.reason
        }


@dataclass
class GovernancePolicy:
    """
    Governance policy for a secret or group of secrets.
    
    Defines who can access, how often rotation is required,
    and what compliance requirements apply.
    
    Attributes:
        policy_id: Unique identifier for this policy
        secret_pattern: Regex pattern matching secret names (e.g., "PROD_.*")
        classification: Required classification level
        allowed_roles: Roles permitted to access matching secrets
        rotation_frequency_days: Required rotation frequency
        encryption_required: Whether encryption at rest is required
        approval_required: Whether access requires approval
        compliance_frameworks: Applicable compliance frameworks
        created_at: When policy was created
        updated_at: When policy was last updated
        is_active: Whether policy is currently enforced
    """
    policy_id: str
    secret_pattern: str
    classification: SecretClassification
    allowed_roles: List[str]
    rotation_frequency_days: int
    encryption_required: bool = True
    approval_required: bool = False
    compliance_frameworks: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "policy_id": self.policy_id,
            "secret_pattern": self.secret_pattern,
            "classification": self.classification.value,
            "allowed_roles": self.allowed_roles,
            "rotation_frequency_days": self.rotation_frequency_days,
            "encryption_required": self.encryption_required,
            "approval_required": self.approval_required,
            "compliance_frameworks": self.compliance_frameworks,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_active": self.is_active
        }
    
    def matches_secret(self, secret_name: str) -> bool:
        """Check if this policy applies to a given secret name"""
        import re
        try:
            return bool(re.match(self.secret_pattern, secret_name))
        except Exception:
            return False


DEFAULT_POLICIES = [
    GovernancePolicy(
        policy_id="POLICY-001",
        secret_pattern="PROD_.*",
        classification=SecretClassification.HIGH,
        allowed_roles=["admin", "devops", "security"],
        rotation_frequency_days=30,
        encryption_required=True,
        approval_required=True,
        compliance_frameworks=["SOC2", "FedRAMP", "NIST-800-53"]
    ),
    GovernancePolicy(
        policy_id="POLICY-002",
        secret_pattern="STAGING_.*",
        classification=SecretClassification.MODERATE,
        allowed_roles=["admin", "devops", "developer"],
        rotation_frequency_days=60,
        encryption_required=True,
        approval_required=False,
        compliance_frameworks=["SOC2"]
    ),
    GovernancePolicy(
        policy_id="POLICY-003",
        secret_pattern="DEV_.*",
        classification=SecretClassification.LOW,
        allowed_roles=["admin", "devops", "developer"],
        rotation_frequency_days=90,
        encryption_required=False,
        approval_required=False,
        compliance_frameworks=[]
    ),
    GovernancePolicy(
        policy_id="POLICY-004",
        secret_pattern=".*_API_KEY",
        classification=SecretClassification.HIGH,
        allowed_roles=["admin", "devops"],
        rotation_frequency_days=30,
        encryption_required=True,
        approval_required=True,
        compliance_frameworks=["SOC2", "PCI-DSS"]
    ),
    GovernancePolicy(
        policy_id="POLICY-005",
        secret_pattern=".*_DATABASE_.*",
        classification=SecretClassification.CRITICAL,
        allowed_roles=["admin", "dba"],
        rotation_frequency_days=30,
        encryption_required=True,
        approval_required=True,
        compliance_frameworks=["SOC2", "FedRAMP", "NIST-800-53", "PCI-DSS"]
    )
]

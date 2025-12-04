
**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Restricted - Internal Use Only

---


This policy establishes requirements for the generation, storage, distribution, rotation, and destruction of encryption keys used to protect GhostQuant™ data.

---



**Purpose:** Encrypt data at rest

**Usage:**
- Database encryption
- File encryption
- Backup encryption

**Algorithm:** AES-256

**Storage:** Encrypted by Key Encryption Keys (KEKs)

---


**Purpose:** Encrypt Data Encryption Keys

**Usage:** Key wrapping

**Algorithm:** AES-256

**Storage:** Hardware Security Module (HSM) or AWS KMS

---


**Purpose:** Authenticate API requests

**Usage:**
- External API access
- Service-to-service authentication

**Algorithm:** Random 256-bit tokens

**Storage:** Secure vault (HashiCorp Vault or AWS Secrets Manager)

---


**Purpose:** Digital signatures and integrity verification

**Usage:**
- Genesis Archive™ block signing
- JWT token signing
- Code signing

**Algorithm:** RSA-4096 or ECDSA P-384

**Storage:** HSM or secure vault

---


**Purpose:** Encrypt data in transit

**Usage:**
- HTTPS endpoints
- Database connections
- Internal service communication

**Algorithm:** RSA-2048 or ECDSA P-256

**Storage:** Certificate store

---



**Randomness:** Cryptographically secure random number generator (CSRNG)

**Entropy:** Minimum 256 bits

**Generation Location:**
- HSM (preferred)
- AWS KMS
- Secure key generation service

**Prohibited:** User-generated keys, weak random number generators

---


**Minimum Key Lengths:**
- Symmetric: AES-256
- Asymmetric: RSA-4096, ECDSA P-384
- Hash: SHA-256

**Approved Algorithms:**
- AES-256-GCM
- RSA-4096
- ECDSA P-384
- SHA-256, SHA-384, SHA-512

**Prohibited Algorithms:**
- DES, 3DES
- MD5, SHA-1
- RSA < 2048 bits

---



**Usage:** Class 4 data encryption keys, signing keys

**Requirements:**
- FIPS 140-2 Level 3 or higher
- Tamper-evident
- Physical security
- Dual control access

**HSM Providers:**
- AWS CloudHSM
- Thales Luna HSM
- Gemalto SafeNet

---


**Usage:** Class 3 data encryption keys

**Requirements:**
- AWS KMS or equivalent
- Encryption at rest
- Access logging
- Key rotation support

---


**Usage:** API keys, service credentials

**Requirements:**
- HashiCorp Vault or AWS Secrets Manager
- Encryption at rest
- Access controls
- Audit logging
- Secret rotation

---


**Never Store Keys In:**
- Source code
- Configuration files (unencrypted)
- Environment variables (production)
- Databases (unencrypted)
- Email
- Shared drives
- Personal devices

---



**Secure Methods:**
- HSM-to-HSM transfer
- KMS API (encrypted)
- Secure vault API
- Out-of-band transfer (for initial setup)

**Prohibited Methods:**
- Email
- Unencrypted file transfer
- Verbal communication
- Physical media (unless encrypted)

---


**Process:**
1. Generate key in HSM/KMS
2. Encrypt key for transport (if necessary)
3. Transfer via secure channel
4. Verify key integrity
5. Log provisioning event (Genesis Archive™)

---



**Class 4 Data Keys:** 30 days

**Class 3 Data Keys:** 90 days

**API Keys:** 90 days

**TLS Certificates:** 90 days

**Signing Keys:** 365 days

**Emergency Rotation:** Immediately upon compromise

---


**Steps:**
1. Generate new key
2. Re-encrypt data with new key (or dual-key period)
3. Update key references
4. Retire old key (retain for decryption period)
5. Delete old key after retention period
6. Log rotation event (Genesis Archive™)

**Dual-Key Period:** 90 days (old key retained for decryption)

---


**Automated Where Possible:**
- AWS KMS keys
- TLS certificates (Let's Encrypt, AWS ACM)
- API keys (with application support)

**Manual Rotation:**
- HSM keys (with documented procedure)
- Signing keys
- Root keys

---



**Key Administrator:**
- Generate keys
- Rotate keys
- Manage key lifecycle
- Audit key usage

**Key User:**
- Use keys for encryption/decryption
- No key management permissions

**Key Auditor:**
- View key metadata
- Access audit logs
- No key material access

---


**Required For:**
- HSM access
- Root key generation
- Key export
- Key destruction

**Implementation:**
- Two authorized individuals required
- Split knowledge
- Dual authentication

---


**Logged Events:**
- Key generation
- Key access
- Key rotation
- Key deletion
- Failed access attempts

**Log Retention:** 5 years (Genesis Archive™)

---



**Purpose:** Business continuity in case of key loss

**Implementation:**
- Encrypted key backup
- Split among multiple custodians
- Secure physical storage
- Documented recovery procedure

**Access:** Requires executive approval and dual control

---


**Triggers:**
- Key loss
- HSM failure
- Disaster recovery
- Personnel unavailability

**Process:**
1. Declare emergency
2. Obtain executive approval
3. Assemble key custodians
4. Recover key from escrow
5. Restore key to HSM/KMS
6. Verify key integrity
7. Log recovery event (Genesis Archive™)

---



**When to Destroy:**
- End of key lifecycle
- Key compromise
- Algorithm deprecation
- Regulatory requirement

**Retention Before Destruction:**
- Data encryption keys: 90 days after rotation (for decryption)
- API keys: Immediate (after rotation)
- Signing keys: 365 days (for signature verification)

---


**HSM Keys:** Cryptographic erasure (zeroization)

**KMS Keys:** Scheduled deletion (AWS KMS)

**File-Based Keys:** Secure deletion (3-pass overwrite)

**Physical Media:** Degaussing or physical destruction

---


**Verification:**
- Confirm key no longer accessible
- Test decryption failure
- Document destruction
- Certificate of destruction

**Logging:** All destructions logged in Genesis Archive™

---



**1. Pre-Operational:**
- Key generation
- Key provisioning
- Initial distribution

**2. Operational:**
- Active use
- Access logging
- Periodic review

**3. Post-Operational:**
- Key retirement
- Retention period
- Key destruction

---


**Metadata Tracked:**
- Key ID
- Key type
- Generation date
- Rotation date
- Expiration date
- Status (active, retired, destroyed)
- Owner
- Usage count

**Storage:** Key management database, Genesis Archive™

---



**Purpose:** Cryptographic integrity for audit trail

**Algorithm:** SHA-256

**Key Type:** No key (hash function)

**Rotation:** N/A (hash function)

---


**Purpose:** Encrypt API communications

**Algorithm:** TLS 1.3 (AES-256-GCM)

**Key Type:** TLS certificates

**Rotation:** 90 days

---


**Purpose:** Encrypt data at rest in databases

**Algorithm:** AES-256

**Key Type:** Data Encryption Keys (DEKs)

**Rotation:** 90 days (Class 3), 30 days (Class 4)

**Storage:** AWS KMS

---


**Purpose:** Digital signatures for Genesis Archive™ blocks

**Algorithm:** ECDSA P-384

**Key Type:** Signing keys

**Rotation:** 365 days

**Storage:** HSM

---



**Frequency:** Quarterly

**Scope:**
- Key inventory
- Key rotation compliance
- Access logs
- Key storage security
- Destruction verification

**Auditor:** Internal Audit or external auditor

---


**Tracked Metrics:**
- Number of keys by type
- Key age
- Rotation compliance rate
- Access frequency
- Failed access attempts

**Reporting:** Quarterly to Security Committee

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial encryption key management policy |

**Review Schedule:** Annually or upon security incidents  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

# Sensitive Data Handling

**Document ID**: GQ-PRIV-011  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes **strict rules for sensitive data handling**, including **prohibited data types**, **rules for high-risk content**, **image metadata sanitization**, **forced minimization on upload**, **secure deletion**, **special encryption requirements**, and **CJIS guidance**.

This document ensures compliance with:

- **GDPR Article 9** — Processing of Special Categories of Personal Data
- **NIST SP 800-53 PT-7** — Specific Categories of PII
- **NIST SP 800-53 MP-6** — Media Sanitization
- **SOC 2 CC6.1** — Logical Access Controls
- **CJIS Security Policy 5.10** — Sensitive Data
- **FedRAMP PT-7** — Specific Categories of PII

---

## 2. Prohibited Data Types

**GhostQuant PROHIBITS collection of the following sensitive personal data**:

### 2.1 Social Security Numbers (SSN)

**Status**: **PROHIBITED**

**Rationale**:
- High risk of identity theft
- Not necessary for GhostQuant service delivery
- CJIS Security Policy 5.10 requires special protections

**Enforcement**:
- ✅ Users warned not to upload images containing SSNs
- ✅ Oracle Eye™ flags images containing 9-digit numbers (potential SSNs)
- ✅ Flagged images reviewed by security team
- ✅ Images containing SSNs deleted immediately (secure deletion, 3-pass overwrite)
- ✅ User notified of policy violation

**Exception**: None (SSNs never collected)

---

### 2.2 Medical Data

**Status**: **PROHIBITED**

**Rationale**:
- Protected Health Information (PHI) under HIPAA
- Not necessary for GhostQuant service delivery
- High privacy risk

**Enforcement**:
- ✅ Users warned not to upload medical records, prescriptions, health insurance cards
- ✅ Oracle Eye™ flags images containing medical terminology
- ✅ Flagged images reviewed by security team
- ✅ Images containing medical data deleted immediately (secure deletion, 3-pass overwrite)
- ✅ User notified of policy violation

**Exception**: None (medical data never collected)

---

### 2.3 Biometrics

**Status**: **PROHIBITED**

**Rationale**:
- Biometric data is irreversible (cannot be changed like password)
- GDPR Article 9 classifies biometrics as "special category" (requires explicit consent)
- Not necessary for GhostQuant service delivery

**Prohibited Biometric Data**:
- ❌ Fingerprints
- ❌ Facial recognition data
- ❌ Iris scans
- ❌ Voice prints
- ❌ DNA data

**Enforcement**:
- ✅ Facial recognition disabled in Oracle Eye™
- ✅ No biometric authentication (only FIDO2/WebAuthn hardware tokens, TOTP)
- ✅ Users warned not to upload images containing biometric data

**Exception**: None (biometric data never collected)

---

### 2.4 Political Opinions

**Status**: **PROHIBITED**

**Rationale**:
- GDPR Article 9 classifies political opinions as "special category" (requires explicit consent)
- Not necessary for GhostQuant service delivery
- High privacy risk

**Enforcement**:
- ✅ GhostQuant does not collect political opinions
- ✅ Threat actor profiles based on publicly available information only (no political profiling)

**Exception**: None (political opinions never collected)

---

### 2.5 Religious Beliefs

**Status**: **PROHIBITED**

**Rationale**:
- GDPR Article 9 classifies religious beliefs as "special category" (requires explicit consent)
- Not necessary for GhostQuant service delivery
- High privacy risk

**Enforcement**:
- ✅ GhostQuant does not collect religious beliefs
- ✅ Threat actor profiles based on publicly available information only (no religious profiling)

**Exception**: None (religious beliefs never collected)

---

### 2.6 Trade Union Membership

**Status**: **PROHIBITED**

**Rationale**:
- GDPR Article 9 classifies trade union membership as "special category" (requires explicit consent)
- Not necessary for GhostQuant service delivery

**Enforcement**:
- ✅ GhostQuant does not collect trade union membership data

**Exception**: None (trade union membership never collected)

---

### 2.7 Sexual Orientation

**Status**: **PROHIBITED**

**Rationale**:
- GDPR Article 9 classifies sexual orientation as "special category" (requires explicit consent)
- Not necessary for GhostQuant service delivery
- High privacy risk

**Enforcement**:
- ✅ GhostQuant does not collect sexual orientation data

**Exception**: None (sexual orientation never collected)

---

## 3. Rules for High-Risk Content

**GhostQuant allows collection of certain high-risk content with strict controls**:

### 3.1 Government-Issued IDs

**Status**: **HIGH-RISK** (allowed only for identity verification, then immediately deleted)

**Allowed Use Cases**:
- Identity verification for data subject rights requests (Right to Access, Right to Erasure)
- Identity verification for account recovery

**Prohibited Use Cases**:
- ❌ Storing government-issued IDs (driver's license, passport, national ID)
- ❌ Using government-issued IDs for authentication (use MFA instead)

**Enforcement**:
- ✅ Users can upload government-issued ID for identity verification (manual verification only)
- ✅ ID reviewed by security team (verify ID matches account information)
- ✅ ID deleted immediately after verification (secure deletion, 3-pass overwrite)
- ✅ Deletion logged in Genesis Archive™

**Retention**: **0 seconds** (deleted immediately after verification)

---

### 3.2 Wallet Screenshots

**Status**: **HIGH-RISK** (allowed with pseudonymization)

**Allowed Use Cases**:
- Threat analysis (detect manipulation rings, identify high-risk wallets)
- Visual intelligence (extract wallet addresses, transaction details)

**Prohibited Use Cases**:
- ❌ Storing raw wallet addresses (must be pseudonymized)
- ❌ Linking wallet addresses to real identities (without user consent)

**Enforcement**:
- ✅ EXIF metadata stripped from wallet screenshots (GPS, camera model, timestamps)
- ✅ Wallet addresses extracted and pseudonymized (SHA-256 hashing)
- ✅ Raw wallet addresses not stored (only pseudonymized hashes)
- ✅ Screenshots deleted after 90 days (unless flagged for Genesis preservation)

**Retention**: **90 days** (then automatically deleted)

---

### 3.3 Transaction Screenshots

**Status**: **HIGH-RISK** (allowed with pseudonymization)

**Allowed Use Cases**:
- Threat analysis (detect suspicious transactions, identify high-risk patterns)
- Visual intelligence (extract transaction details)

**Prohibited Use Cases**:
- ❌ Storing raw transaction hashes (must be pseudonymized)
- ❌ Linking transactions to real identities (without user consent)

**Enforcement**:
- ✅ EXIF metadata stripped from transaction screenshots
- ✅ Transaction hashes extracted and pseudonymized (SHA-256 hashing)
- ✅ Raw transaction hashes not stored (only pseudonymized hashes)
- ✅ Screenshots deleted after 90 days (unless flagged for Genesis preservation)

**Retention**: **90 days** (then automatically deleted)

---

### 3.4 Email Addresses

**Status**: **MEDIUM-RISK** (allowed for authentication)

**Allowed Use Cases**:
- User authentication (login)
- Password reset
- Security notifications (breach alerts, suspicious activity)
- Service announcements (system maintenance, new features)

**Prohibited Use Cases**:
- ❌ Marketing emails (without explicit consent)
- ❌ Sharing email addresses with third parties (without consent)
- ❌ Selling email addresses

**Enforcement**:
- ✅ Email addresses encrypted at-rest (AES-256)
- ✅ Email addresses used only for authentication and security notifications (not marketing)
- ✅ Email addresses deleted after account deletion + 7 years (regulatory compliance)

**Retention**: **Duration of account + 7 years**

---

### 3.5 IP Addresses

**Status**: **MEDIUM-RISK** (allowed for security monitoring)

**Allowed Use Cases**:
- Security monitoring (detect login from unusual location)
- Anomaly detection (detect VPN/proxy usage)
- Audit logging (who accessed what, when)

**Prohibited Use Cases**:
- ❌ Long-term IP address storage (hashed after 30 days)
- ❌ Precise geolocation tracking (only country/city level)
- ❌ Sharing IP addresses with third parties (without consent)

**Enforcement**:
- ✅ IP addresses stored for 30 days (raw)
- ✅ IP addresses hashed after 30 days (SHA-256)
- ✅ Hashed IP addresses deleted after 1 year
- ✅ Only country/city level geolocation (no precise GPS)

**Retention**: **30 days (raw), 1 year (hashed)**

---

## 4. Image Metadata Sanitization

**All uploaded images undergo automatic metadata sanitization**:

### 4.1 EXIF Metadata Stripping

**EXIF (Exchangeable Image File Format) metadata contains**:
- GPS coordinates (latitude, longitude)
- Camera make and model
- Image capture timestamp
- Camera settings (aperture, shutter speed, ISO)
- Software used to edit image

**Privacy Risk**:
- GPS coordinates reveal user's precise location
- Camera model enables device fingerprinting
- Timestamps enable timeline reconstruction

**GhostQuant Enforcement**:
- ✅ **All EXIF metadata stripped on upload** (automatic, no user action required)
- ✅ **Stripping performed server-side** (before storage)
- ✅ **Original image not stored** (only sanitized image)

**Implementation**:
```python
from PIL import Image
import io

def strip_exif_metadata(image_bytes: bytes) -> bytes:
    """
    Strip all EXIF metadata from image.
    
    Args:
        image_bytes: Original image bytes
    
    Returns:
        Sanitized image bytes (no EXIF metadata)
    """
    # Load image
    image = Image.open(io.BytesIO(image_bytes))
    
    # Create new image without EXIF metadata
    sanitized_image = Image.new(image.mode, image.size)
    sanitized_image.putdata(list(image.getdata()))
    
    # Save sanitized image
    output = io.BytesIO()
    sanitized_image.save(output, format=image.format)
    
    return output.getvalue()

# Usage
original_image = request.files['image'].read()
sanitized_image = strip_exif_metadata(original_image)
# Store sanitized_image (original_image discarded)
```

### 4.2 Metadata Sanitization Verification

**After EXIF stripping, GhostQuant verifies**:
- ✅ No GPS coordinates in image
- ✅ No camera make/model in image
- ✅ No timestamps in image
- ✅ No software metadata in image

**Verification logged in Genesis Archive™**:
- Image ID
- Upload timestamp
- EXIF stripping status (success/failure)
- Metadata found (if any)

---

## 5. Forced Minimization on Upload

**GhostQuant enforces data minimization at upload time**:

### 5.1 Upload Warnings

**Before uploading image, user sees warning**:

```
┌─────────────────────────────────────────────────────────────┐
│                   Image Upload Warning                       │
└─────────────────────────────────────────────────────────────┘

⚠️ PRIVACY NOTICE

Before uploading, please ensure your image does NOT contain:
- ❌ Social Security Numbers (SSN)
- ❌ Government-issued IDs (driver's license, passport)
- ❌ Credit card numbers
- ❌ Medical records or prescriptions
- ❌ Personal identifiable information (PII)

GhostQuant will automatically:
- ✅ Strip EXIF metadata (GPS, camera model, timestamps)
- ✅ Disable facial recognition (no biometric analysis)
- ✅ Delete image after 90 days (unless flagged for preservation)

By uploading, you confirm that your image does not contain prohibited data.

[Cancel] [I Understand, Upload Image]
```

### 5.2 Automated Detection

**GhostQuant uses Oracle Eye™ to detect prohibited data**:

**Detection Rules**:
- ✅ **9-digit numbers**: Potential SSN (flagged for review)
- ✅ **16-digit numbers**: Potential credit card (flagged for review)
- ✅ **Medical terminology**: Potential medical record (flagged for review)
- ✅ **"Driver License", "Passport"**: Potential government ID (flagged for review)

**Flagged Image Workflow**:
1. Image flagged by Oracle Eye™
2. Security team notified (email alert)
3. Security team reviews image (manual review)
4. If prohibited data confirmed:
   - Image deleted immediately (secure deletion, 3-pass overwrite)
   - User notified of policy violation
   - Incident logged in Genesis Archive™
5. If false positive:
   - Image retained (normal 90-day retention)
   - False positive logged (improve detection algorithm)

### 5.3 Upload Size Limits

**GhostQuant enforces upload size limits**:
- **Maximum image size**: 10 MB
- **Maximum image dimensions**: 4096 × 4096 pixels

**Rationale**:
- Prevent abuse (uploading large files to exhaust storage)
- Reduce processing time (EXIF stripping, text extraction)

---

## 6. Secure Deletion

**GhostQuant uses secure deletion for sensitive data**:

### 6.1 Deletion Methods

**GhostQuant uses 3 deletion methods**:

1. **Soft Delete**: Data marked as deleted but retained for recovery period (30 days)
2. **Hard Delete**: Data permanently deleted from database (no recovery)
3. **Secure Deletion**: 3-pass overwrite for sensitive data (DoD 5220.22-M standard)

### 6.2 Secure Deletion Standard (DoD 5220.22-M)

**DoD 5220.22-M requires 3-pass overwrite**:

**Pass 1**: Overwrite with random data
```
Original Data: "MySecretData123!"
Pass 1: "x7f9a2e4c6b8d0f1"
```

**Pass 2**: Overwrite with complement of Pass 1
```
Pass 1: "x7f9a2e4c6b8d0f1"
Pass 2: "08065d1b3947f20e"
```

**Pass 3**: Overwrite with random data
```
Pass 2: "08065d1b3947f20e"
Pass 3: "m3k5n7p9r1t3v5x7"
```

**After 3 passes, data is unrecoverable** (even with forensic tools).

### 6.3 Secure Deletion Use Cases

**GhostQuant uses secure deletion for**:

- ✅ **Uploaded images** (after 90 days or if prohibited data detected)
- ✅ **Government-issued IDs** (immediately after identity verification)
- ✅ **Flagged images** (if prohibited data confirmed)
- ✅ **User account deletion** (password hash, MFA tokens)

**Implementation**:
```python
import os
import secrets

def secure_delete_file(file_path: str) -> None:
    """
    Securely delete file using DoD 5220.22-M standard (3-pass overwrite).
    
    Args:
        file_path: Path to file to delete
    """
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Pass 1: Overwrite with random data
    with open(file_path, 'wb') as f:
        f.write(secrets.token_bytes(file_size))
    
    # Pass 2: Overwrite with complement of Pass 1
    with open(file_path, 'rb+') as f:
        data = f.read()
        complement = bytes([~b & 0xFF for b in data])
        f.seek(0)
        f.write(complement)
    
    # Pass 3: Overwrite with random data
    with open(file_path, 'wb') as f:
        f.write(secrets.token_bytes(file_size))
    
    # Delete file
    os.remove(file_path)
    
    # Log deletion in Genesis Archive™
    genesis_archive.log_event({
        "event_type": "secure_deletion",
        "file_path": file_path,
        "file_size": file_size,
        "timestamp": datetime.utcnow()
    })

# Usage
secure_delete_file("/uploads/image-12345.png")
```

---

## 7. Special Encryption Requirements

**Sensitive data requires special encryption**:

### 7.1 Encryption Standards

**GhostQuant uses the following encryption standards**:

| Data Type | Encryption Standard | Key Management | Key Rotation |
|-----------|---------------------|----------------|--------------|
| **Password Hashes** | bcrypt (cost factor 12) | N/A (one-way hash) | N/A |
| **API Keys** | bcrypt (cost factor 12) | N/A (one-way hash) | N/A |
| **MFA Tokens** | AES-256 | AWS KMS | Annual |
| **Uploaded Images** | AES-256 | AWS KMS | Annual |
| **Database** | AES-256 (Transparent Data Encryption) | AWS KMS | Annual |
| **Backups** | AES-256 | AWS KMS | Annual |
| **Genesis Archive™** | AES-256 | AWS KMS | Annual |

### 7.2 Password Hashing (bcrypt)

**GhostQuant uses bcrypt for password hashing**:

**bcrypt Properties**:
- ✅ **One-way hashing**: Cannot be reversed
- ✅ **Salt**: Random salt added to each password (prevents rainbow table attacks)
- ✅ **Cost factor**: Configurable work factor (GhostQuant uses 12)
- ✅ **Slow**: Intentionally slow to prevent brute force attacks

**Implementation**:
```python
import bcrypt

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.
    
    Args:
        password: Plaintext password
    
    Returns:
        Bcrypt hash
    """
    salt = bcrypt.gensalt(rounds=12)
    password_hash = bcrypt.hashpw(password.encode(), salt)
    return password_hash.decode()

def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify password against bcrypt hash.
    
    Args:
        password: Plaintext password
        password_hash: Bcrypt hash
    
    Returns:
        True if password matches hash, False otherwise
    """
    return bcrypt.checkpw(password.encode(), password_hash.encode())

# Usage
password = "MySecurePassword123!"
password_hash = hash_password(password)
# Store password_hash in database (password NOT stored)

# Verify password at login
is_valid = verify_password(password, password_hash)
```

### 7.3 Key Management (AWS KMS)

**GhostQuant uses AWS Key Management Service (KMS) for encryption key management**:

**AWS KMS Properties**:
- ✅ **Hardware Security Modules (HSMs)**: Keys stored in FIPS 140-2 Level 2 validated HSMs
- ✅ **Key Rotation**: Automatic annual key rotation
- ✅ **Access Control**: IAM policies control who can use keys
- ✅ **Audit Logging**: All key usage logged in CloudTrail

**Key Hierarchy**:
```
AWS KMS Master Key (per data center)
   ↓
Data Encryption Keys (per database/S3 bucket)
   ↓
Encrypted Data
```

---

## 8. CJIS Guidance

**Criminal Justice Information Services (CJIS) Security Policy provides guidance for sensitive data handling**:

### 8.1 CJIS Security Policy 5.10 — Sensitive Data

**CJIS Requirement**:
> "Agencies shall protect sensitive data from unauthorized access, use, disclosure, disruption, modification, or destruction."

**GhostQuant Compliance**:
- ✅ Encryption (AES-256 at-rest, TLS 1.3 in-transit)
- ✅ Access Control (RBAC, MFA)
- ✅ Audit Logging (Genesis Archive™)
- ✅ Secure Deletion (DoD 5220.22-M)

### 8.2 CJIS Security Policy 5.10.1 — Sensitive Data Identification

**CJIS Requirement**:
> "Agencies shall identify sensitive data within their systems."

**GhostQuant Compliance**:
- ✅ Personal Data Registry (see `personal_data_registry.md`)
- ✅ Data Flow Mapping (see `data_flow_mapping.md`)
- ✅ Privacy Risk Assessment (see `privacy_risk_assessment.md`)

### 8.3 CJIS Security Policy 5.10.2 — Sensitive Data Protection

**CJIS Requirement**:
> "Agencies shall implement appropriate security controls to protect sensitive data."

**GhostQuant Compliance**:
- ✅ Encryption (AES-256 at-rest, TLS 1.3 in-transit)
- ✅ Pseudonymization (wallet addresses, entity identifiers, IP addresses)
- ✅ Data Minimization (only necessary data collected)
- ✅ Secure Deletion (DoD 5220.22-M)

### 8.4 CJIS Security Policy 5.10.3 — Sensitive Data Disposal

**CJIS Requirement**:
> "Agencies shall securely dispose of sensitive data when no longer needed."

**GhostQuant Compliance**:
- ✅ Automated deletion (see `data_retention_schedule.md`)
- ✅ Secure deletion (DoD 5220.22-M, 3-pass overwrite)
- ✅ Deletion logging (Genesis Archive™)

---

## 9. Sensitive Data Handling Summary

### 9.1 Prohibited Data (Never Collected)

| Data Type | Status | Rationale |
|-----------|--------|-----------|
| Social Security Numbers (SSN) | ❌ PROHIBITED | High risk of identity theft |
| Medical Data | ❌ PROHIBITED | Protected Health Information (PHI) under HIPAA |
| Biometrics | ❌ PROHIBITED | Irreversible, GDPR Article 9 special category |
| Political Opinions | ❌ PROHIBITED | GDPR Article 9 special category |
| Religious Beliefs | ❌ PROHIBITED | GDPR Article 9 special category |
| Trade Union Membership | ❌ PROHIBITED | GDPR Article 9 special category |
| Sexual Orientation | ❌ PROHIBITED | GDPR Article 9 special category |

### 9.2 High-Risk Data (Allowed with Controls)

| Data Type | Status | Controls | Retention |
|-----------|--------|----------|-----------|
| Government-Issued IDs | ⚠️ HIGH-RISK | Identity verification only, immediate deletion | 0 seconds |
| Wallet Screenshots | ⚠️ HIGH-RISK | EXIF stripping, pseudonymization | 90 days |
| Transaction Screenshots | ⚠️ HIGH-RISK | EXIF stripping, pseudonymization | 90 days |
| Email Addresses | ⚠️ MEDIUM-RISK | Encryption, authentication only | Account + 7 years |
| IP Addresses | ⚠️ MEDIUM-RISK | Hashing after 30 days | 30 days (raw), 1 year (hashed) |

### 9.3 Sensitive Data Protections

| Protection | Implementation |
|------------|----------------|
| **EXIF Stripping** | Automatic on upload (GPS, camera model, timestamps removed) |
| **Pseudonymization** | SHA-256 hashing (wallet addresses, entity identifiers, IP addresses) |
| **Encryption** | AES-256 at-rest, TLS 1.3 in-transit |
| **Secure Deletion** | DoD 5220.22-M (3-pass overwrite) |
| **Access Control** | RBAC, MFA, least privilege |
| **Audit Logging** | Genesis Archive™ (tamper-evident, immutable) |

---

## 10. Compliance Mapping

### 10.1 GDPR Article 9 — Processing of Special Categories of Personal Data

**GDPR Requirement**:
> "Processing of personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or trade union membership, and the processing of genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health or data concerning a natural person's sex life or sexual orientation shall be prohibited."

**GhostQuant Compliance**:
- ✅ Special categories of personal data PROHIBITED (SSN, medical data, biometrics, political opinions, religious beliefs, trade union membership, sexual orientation)
- ✅ No processing of special categories (no collection, no storage, no sharing)

### 10.2 NIST SP 800-53 PT-7 — Specific Categories of PII

**NIST Requirement**:
> "The organization applies [Assignment: organization-defined processing conditions] for specific categories of personally identifiable information (PII)."

**GhostQuant Compliance**:
- ✅ Prohibited data types identified (SSN, medical data, biometrics, etc.)
- ✅ High-risk data types identified (government IDs, wallet screenshots, etc.)
- ✅ Processing conditions defined (EXIF stripping, pseudonymization, secure deletion)

### 10.3 NIST SP 800-53 MP-6 — Media Sanitization

**NIST Requirement**:
> "The organization sanitizes [Assignment: organization-defined information system media] prior to disposal, release out of organizational control, or release for reuse."

**GhostQuant Compliance**:
- ✅ Secure deletion (DoD 5220.22-M, 3-pass overwrite)
- ✅ Media sanitization for uploaded images, government IDs, flagged images
- ✅ Deletion logging (Genesis Archive™)

### 10.4 CJIS Security Policy 5.10 — Sensitive Data

**CJIS Requirement**:
> "Agencies shall protect sensitive data from unauthorized access, use, disclosure, disruption, modification, or destruction."

**GhostQuant Compliance**:
- ✅ Encryption (AES-256 at-rest, TLS 1.3 in-transit)
- ✅ Access Control (RBAC, MFA)
- ✅ Audit Logging (Genesis Archive™)
- ✅ Secure Deletion (DoD 5220.22-M)

---

## 11. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques
- **`cross_border_data_transfer_policy.md`** — International transfer requirements
- **`privacy_by_design_engineering.md`** — Privacy-by-Design principles in all engines

---

## 12. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Sensitive Data Handling |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, General Counsel

---

**END OF DOCUMENT**

# Personal Data Registry

**Document ID**: GQ-PRIV-006  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This **Personal Data Registry** documents every category of personal data that **GhostQuant™** may handle, including processing purpose, legal basis, minimization applied, retention duration, access roles, and Genesis Archive™ preservation requirements.

This registry ensures compliance with:

- **GDPR Article 30** — Records of Processing Activities
- **NIST SP 800-53 PT-6** — System of Records Notice (SORN)
- **NIST SP 800-53 PT-7** — Specific Categories of PII
- **SOC 2 CC6.1** — Logical Access Controls
- **CCPA § 1798.110** — Right to Know
- **FedRAMP PT-6** — System of Records Notice

---

## 2. Personal Data Categories

GhostQuant processes **8 primary categories** of personal data:

1. **Identity Data** — User account information
2. **Access Logs** — Authentication and session management
3. **Engine Interaction Logs** — Intelligence engine usage
4. **Uploaded Documents/Images** — Visual data for threat analysis
5. **Threat Actor Inquiry Metadata** — Entity and wallet analysis
6. **Email/API Credentials** — Authentication tokens
7. **IP / Device Fingerprint** — Security monitoring data
8. **Genesis Archive™ Records** — Tamper-evident audit trails

---

## 3. Personal Data Registry

### 3.1 Identity Data

#### 3.1.1 Full Name

**Data Element**: Full name (first name, last name)

**Processing Purpose**:
- User account identification
- Access control (role assignment)
- Audit logging (who performed what action)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Consent** (GDPR Article 6(1)(a)) — User consents at registration

**Minimization Applied**:
- Only first and last name collected (no middle name, suffix, etc.)
- No verification of real name (users can use pseudonyms)

**Retention Duration**: Duration of account + 7 years (regulatory compliance)

**Who Can Access**:
- **User** (own name only)
- **Admin** (all user names)
- **SuperAdmin** (all user names)

**Genesis Preservation**: Yes (account creation/deletion events)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Rectification (GDPR Article 16)
- ✅ Right to Erasure (GDPR Article 17) — after account deletion + 7 years
- ✅ Right to Data Portability (GDPR Article 20)

---

#### 3.1.2 Email Address

**Data Element**: Email address

**Processing Purpose**:
- User authentication (login)
- Password reset
- Security notifications (breach alerts, suspicious activity)
- Service announcements (system maintenance, new features)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Consent** (GDPR Article 6(1)(a)) — User consents at registration

**Minimization Applied**:
- Only email address collected (no phone number, home address, etc.)
- Email address used only for authentication and security notifications (not marketing)

**Retention Duration**: Duration of account + 7 years (regulatory compliance)

**Who Can Access**:
- **User** (own email only)
- **Admin** (all user emails)
- **SuperAdmin** (all user emails)

**Genesis Preservation**: Yes (account creation/deletion events)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Rectification (GDPR Article 16)
- ✅ Right to Erasure (GDPR Article 17) — after account deletion + 7 years
- ✅ Right to Data Portability (GDPR Article 20)

---

#### 3.1.3 Username

**Data Element**: Username (unique identifier)

**Processing Purpose**:
- User account identification
- Display name in GhostQuant interface
- Audit logging (who performed what action)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery

**Minimization Applied**:
- Username can be pseudonymous (not required to be real name)
- Username used only for identification (not shared with third parties)

**Retention Duration**: Duration of account + 7 years (regulatory compliance)

**Who Can Access**:
- **All Users** (usernames visible in shared reports, collaboration features)
- **Admin** (all usernames)
- **SuperAdmin** (all usernames)

**Genesis Preservation**: Yes (account creation/deletion events)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Rectification (GDPR Article 16)
- ✅ Right to Erasure (GDPR Article 17) — after account deletion + 7 years
- ✅ Right to Data Portability (GDPR Article 20)

---

#### 3.1.4 Password Hash

**Data Element**: Password hash (bcrypt)

**Processing Purpose**:
- User authentication (login)
- Security (prevent unauthorized access)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security

**Minimization Applied**:
- Password never stored in plaintext (only bcrypt hash)
- Password hash cannot be reversed (one-way hashing)

**Retention Duration**: Duration of account (deleted immediately on account deletion)

**Who Can Access**:
- **System** (authentication service only)
- **No human access** (password hashes never displayed)

**Genesis Preservation**: No (password hashes not logged)

**Data Subject Rights**:
- ❌ Right to Access (password hashes not provided to users)
- ✅ Right to Erasure (GDPR Article 17) — deleted on account deletion

---

#### 3.1.5 MFA Tokens

**Data Element**: MFA tokens (FIDO2/WebAuthn, TOTP)

**Processing Purpose**:
- Multi-factor authentication (login)
- Security (prevent unauthorized access)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security

**Minimization Applied**:
- MFA tokens stored securely (encrypted at-rest)
- TOTP secrets never displayed after initial setup
- FIDO2 hardware tokens preferred (no server-side secret storage)

**Retention Duration**: Duration of account (deleted immediately on account deletion)

**Who Can Access**:
- **User** (can view registered MFA devices)
- **System** (authentication service only)

**Genesis Preservation**: No (MFA tokens not logged)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15) — list of registered MFA devices
- ✅ Right to Erasure (GDPR Article 17) — deleted on account deletion

---

#### 3.1.6 Role Assignment

**Data Element**: Role (Viewer, Analyst, Senior Analyst, Admin, SuperAdmin, System, API)

**Processing Purpose**:
- Access control (determine what user can access)
- Audit logging (who performed what action)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery

**Minimization Applied**:
- Only role name stored (no additional metadata)
- Role changes logged in Genesis Archive™

**Retention Duration**: Duration of account + 7 years (regulatory compliance)

**Who Can Access**:
- **User** (own role only)
- **Admin** (all user roles)
- **SuperAdmin** (all user roles)

**Genesis Preservation**: Yes (role changes logged)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Rectification (GDPR Article 16) — request role change
- ✅ Right to Erasure (GDPR Article 17) — after account deletion + 7 years

---

### 3.2 Access Logs

#### 3.2.1 Login Events

**Data Element**: Login timestamp, IP address, device fingerprint, MFA method, success/failure

**Processing Purpose**:
- Security monitoring (detect unauthorized access attempts)
- Audit logging (who accessed what, when)
- Anomaly detection (detect login from unusual location)

**Legal Basis**:
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security
- **Legal Obligation** (GDPR Article 6(1)(c)) — Audit logging (CJIS, NIST 800-53)

**Minimization Applied**:
- IP addresses hashed after 30 days (SHA-256)
- Device fingerprints deleted after 1 year
- Failed login attempts deleted after 24 hours (except brute force patterns)

**Retention Duration**: 1 year (then deleted, except Genesis-preserved events)

**Who Can Access**:
- **User** (own login history only)
- **Admin** (all login events)
- **SuperAdmin** (all login events)

**Genesis Preservation**: Yes (privileged user logins, brute force attempts)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — after 1 year (except Genesis-preserved)

---

#### 3.2.2 Session Logs

**Data Element**: Session ID, IP address, device fingerprint, login timestamp, logout timestamp, session duration, pages visited, actions performed

**Processing Purpose**:
- Security monitoring (detect session hijacking)
- Audit logging (who accessed what, when)
- Anomaly detection (detect unusual session behavior)

**Legal Basis**:
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security
- **Legal Obligation** (GDPR Article 6(1)(c)) — Audit logging (CJIS, NIST 800-53)

**Minimization Applied**:
- IP addresses hashed after 30 days (SHA-256)
- Device fingerprints deleted after 1 year
- Only security-relevant actions logged (not all page views)

**Retention Duration**: 1 year (then deleted, except Genesis-preserved events)

**Who Can Access**:
- **Admin** (all session logs)
- **SuperAdmin** (all session logs)

**Genesis Preservation**: Yes (privileged sessions, security incidents)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — after 1 year (except Genesis-preserved)

---

#### 3.2.3 API Key Usage

**Data Element**: API key ID, request timestamp, endpoint, IP address, response status

**Processing Purpose**:
- Security monitoring (detect API key misuse)
- Rate limiting (prevent abuse)
- Audit logging (who accessed what, when)

**Legal Basis**:
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security
- **Legal Obligation** (GDPR Article 6(1)(c)) — Audit logging (CJIS, NIST 800-53)

**Minimization Applied**:
- IP addresses hashed after 30 days (SHA-256)
- Only API endpoint logged (not request/response body)

**Retention Duration**: 1 year (then deleted, except Genesis-preserved events)

**Who Can Access**:
- **User** (own API key usage only)
- **Admin** (all API key usage)
- **SuperAdmin** (all API key usage)

**Genesis Preservation**: Yes (API key misuse, rate limit violations)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — after 1 year (except Genesis-preserved)

---

### 3.3 Engine Interaction Logs

#### 3.3.1 Prediction Requests (GhostPredictor™)

**Data Element**: User ID, token symbol, timeframe, confidence threshold, timestamp

**Processing Purpose**:
- Service delivery (generate predictions)
- Usage analytics (understand user behavior)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery

**Minimization Applied**:
- Prediction requests processed in temporary memory buffers (< 60 seconds)
- No persistent storage (unless user explicitly saves prediction)
- No IP address or device fingerprint collected

**Retention Duration**: Not stored (unless user saves prediction → 30 days)

**Who Can Access**:
- **User** (own predictions only)
- **Admin** (all predictions)
- **SuperAdmin** (all predictions)

**Genesis Preservation**: No (unless prediction flagged as critical threat intelligence)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15) — if prediction saved
- ✅ Right to Erasure (GDPR Article 17) — delete saved predictions

---

#### 3.3.2 Hydra Cluster Detection Requests

**Data Element**: User ID, wallet addresses (pseudonymized), transaction metadata, cluster detection results, timestamp

**Processing Purpose**:
- Threat analysis (detect manipulation rings)
- AML/KYC compliance (identify high-risk wallets)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Legal Obligation** (GDPR Article 6(1)(c)) — AML/KYC compliance (31 CFR 1022.210)

**Minimization Applied**:
- **Pseudonymization**: Wallet addresses hashed to SHA-256
- **Aggregation**: Transaction metadata aggregated (no individual transaction details)
- No IP address or device fingerprint collected

**Retention Duration**: 3 years (AML/KYC compliance)

**Who Can Access**:
- **Analyst** (all cluster detection results)
- **Senior Analyst** (all cluster detection results)
- **Admin** (all cluster detection results)
- **SuperAdmin** (all cluster detection results)

**Genesis Preservation**: Yes (high-risk clusters)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ❌ Right to Erasure (GDPR Article 17) — legal obligation exception (AML/KYC)

---

#### 3.3.3 Constellation Entity Mapping Requests

**Data Element**: User ID, entity identifiers (pseudonymized), relationship metadata, timestamp

**Processing Purpose**:
- Threat analysis (map entity relationships)
- Threat intelligence (identify coordinated actors)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Threat intelligence

**Minimization Applied**:
- **Pseudonymization**: Entity identifiers hashed to SHA-256
- **Public Data Only**: Only publicly available information collected
- No IP address or device fingerprint collected

**Retention Duration**: 5 years (threat intelligence lifecycle)

**Who Can Access**:
- **Analyst** (all entity maps)
- **Senior Analyst** (all entity maps)
- **Admin** (all entity maps)
- **SuperAdmin** (all entity maps)

**Genesis Preservation**: Yes (critical entity relationships)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — after 5 years (except Genesis-preserved)

---

### 3.4 Uploaded Documents/Images

#### 3.4.1 Uploaded Images

**Data Element**: Image file (encrypted), image analysis results, user ID, upload timestamp

**Processing Purpose**:
- Visual intelligence (extract text, recognize charts)
- Threat analysis (analyze wallet screenshots, transaction images)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery
- **Consent** (GDPR Article 6(1)(a)) — User consents at upload

**Minimization Applied**:
- **EXIF Stripping**: All EXIF metadata removed on upload (GPS, camera model, timestamps)
- **Facial Recognition Disabled**: No facial recognition or biometric analysis
- **User Warnings**: Users warned not to upload images containing personal identifiers (IDs, passports)

**Retention Duration**: 90 days (then automatically deleted, unless flagged for Genesis preservation)

**Who Can Access**:
- **User** (own uploaded images only, unless shared with team)
- **Admin** (all uploaded images)
- **SuperAdmin** (all uploaded images)

**Genesis Preservation**: No (unless image flagged for forensic preservation)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — delete uploaded images

---

### 3.5 Threat Actor Inquiry Metadata

#### 3.5.1 Threat Actor Profiles

**Data Element**: Entity identifiers (pseudonymized), entity attributes (public data only), behavioral patterns, risk scores

**Processing Purpose**:
- Threat intelligence (identify high-risk actors)
- Threat analysis (understand actor behavior)

**Legal Basis**:
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Threat intelligence

**Minimization Applied**:
- **Public Data Only**: Only publicly available information collected (no private data scraping)
- **Pseudonymization**: Entity identifiers hashed to SHA-256
- **Manual Review**: Profiles reviewed by security team before publication

**Retention Duration**: 5 years (threat intelligence lifecycle)

**Who Can Access**:
- **Senior Analyst** (all threat actor profiles)
- **Admin** (all threat actor profiles)
- **SuperAdmin** (all threat actor profiles)

**Genesis Preservation**: Yes (high-risk actors)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Rectification (GDPR Article 16) — correct inaccurate profiles
- ✅ Right to Erasure (GDPR Article 17) — after 5 years (except Genesis-preserved)

---

### 3.6 Email/API Credentials

#### 3.6.1 API Keys

**Data Element**: API key (hashed), API key name, user ID, creation timestamp, last used timestamp

**Processing Purpose**:
- Programmatic access (API authentication)
- Security monitoring (detect API key misuse)

**Legal Basis**:
- **Contract** (GDPR Article 6(1)(b)) — Necessary for service delivery

**Minimization Applied**:
- API keys hashed before storage (bcrypt)
- Only last 4 characters visible to user
- No IP address or device fingerprint collected

**Retention Duration**: Until revoked by user or admin

**Who Can Access**:
- **User** (own API keys only)
- **Admin** (all API keys)
- **SuperAdmin** (all API keys)

**Genesis Preservation**: Yes (API key creation/revocation)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — revoke API keys

---

### 3.7 IP / Device Fingerprint

#### 3.7.1 IP Addresses

**Data Element**: IP address (raw for 30 days, hashed for 1 year)

**Processing Purpose**:
- Security monitoring (detect login from unusual location)
- Anomaly detection (detect VPN/proxy usage)
- Audit logging (who accessed what, when)

**Legal Basis**:
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security
- **Legal Obligation** (GDPR Article 6(1)(c)) — Audit logging (CJIS, NIST 800-53)

**Minimization Applied**:
- IP addresses hashed after 30 days (SHA-256)
- Hashed IP addresses deleted after 1 year
- Only country/city level geolocation (no precise GPS)

**Retention Duration**: 30 days (raw), 1 year (hashed)

**Who Can Access**:
- **Admin** (all IP addresses)
- **SuperAdmin** (all IP addresses)

**Genesis Preservation**: No (unless associated with security incident)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — after 1 year

---

#### 3.7.2 Device Fingerprints

**Data Element**: Browser, OS, screen resolution, device type

**Processing Purpose**:
- Security monitoring (detect login from new device)
- Anomaly detection (detect device changes)

**Legal Basis**:
- **Legitimate Interest** (GDPR Article 6(1)(f)) — Security

**Minimization Applied**:
- Only browser, OS, device type collected (no unique device ID)
- Device fingerprints deleted after 1 year

**Retention Duration**: 1 year

**Who Can Access**:
- **Admin** (all device fingerprints)
- **SuperAdmin** (all device fingerprints)

**Genesis Preservation**: No (unless associated with security incident)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ✅ Right to Erasure (GDPR Article 17) — after 1 year

---

### 3.8 Genesis Archive™ Records

#### 3.8.1 Genesis Archive™ Blocks

**Data Element**: Block ID, event type, event data (minimal personal data), user ID (pseudonymized), timestamp, cryptographic hash

**Processing Purpose**:
- Audit logging (tamper-evident audit trail)
- Regulatory compliance (preserve critical events)
- Forensic evidence (investigate security incidents)

**Legal Basis**:
- **Legal Obligation** (GDPR Article 6(1)(c)) — Audit logging (CJIS, NIST 800-53, SOC 2)

**Minimization Applied**:
- **Minimal Logging**: Only critical events logged in Genesis Archive™
- **Pseudonymization**: User IDs pseudonymized where possible
- No unnecessary personal data logged

**Retention Duration**: **Permanent** (regulatory compliance, forensic evidence)

**Who Can Access**:
- **SuperAdmin** (read-only)

**Genesis Preservation**: Yes (self-preserving)

**Data Subject Rights**:
- ✅ Right to Access (GDPR Article 15)
- ❌ Right to Erasure (GDPR Article 17) — legal obligation exception

---

## 4. Data Processing Summary

### 4.1 Processing Activities

| Processing Activity | Personal Data Categories | Legal Basis | Retention |
|---------------------|-------------------------|-------------|-----------|
| User Registration | Full name, email, username, password hash | Contract + Consent | Account + 7 years |
| User Authentication | Email, password hash, MFA tokens, IP address, device fingerprint | Contract + Legitimate Interest | Account duration |
| Session Management | Session ID, IP address, device fingerprint, login/logout timestamps | Legitimate Interest | 1 year |
| Intelligence Engine Requests | User ID, engine parameters, timestamps | Contract | Not stored (or 30 days if saved) |
| Threat Analysis | Wallet addresses (pseudonymized), entity identifiers (pseudonymized), threat actor profiles | Contract + Legitimate Interest | 3-5 years |
| Visual Intelligence | Uploaded images (EXIF stripped), image analysis results | Contract + Consent | 90 days |
| Security Monitoring | IP addresses, device fingerprints, security alerts | Legitimate Interest + Legal Obligation | 1 year |
| Audit Logging | User ID, action type, timestamp, IP address | Legal Obligation | 7 years |
| Genesis Archive™ | Critical events, user ID (pseudonymized), timestamps | Legal Obligation | Permanent |

### 4.2 Data Sharing

**GhostQuant does NOT share personal data with third parties**, except:

1. **Subprocessors** (cloud providers, API services) — Data Processing Agreements (DPAs) required
2. **Law Enforcement** (valid legal process required) — Warrant, subpoena, court order
3. **Regulatory Authorities** (compliance inquiries) — SEC, CFTC, FinCEN, etc.

**All data sharing logged in Genesis Archive™**.

---

## 5. Compliance Mapping

### 5.1 GDPR Article 30 — Records of Processing Activities

**GDPR Requirement**:
> "Each controller and, where applicable, the controller's representative, shall maintain a record of processing activities under its responsibility."

**GhostQuant Compliance**:
- ✅ Personal data registry maintained
- ✅ Processing purposes documented
- ✅ Legal basis documented
- ✅ Retention durations documented
- ✅ Data sharing documented

### 5.2 NIST SP 800-53 PT-6 — System of Records Notice (SORN)

**NIST Requirement**:
> "The organization issues a System of Records Notice (SORN) for the collection of personally identifiable information (PII)."

**GhostQuant Compliance**:
- ✅ Personal data registry serves as SORN
- ✅ All personal data categories documented
- ✅ Processing purposes documented
- ✅ Retention durations documented

### 5.3 CCPA § 1798.110 — Right to Know

**CCPA Requirement**:
> "A consumer shall have the right to request that a business that collects personal information about the consumer disclose to the consumer the categories of personal information it has collected."

**GhostQuant Compliance**:
- ✅ Personal data registry documents all categories
- ✅ Users can request disclosure via `data_subject_rights_process.md`

---

## 6. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques

---

## 7. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Personal Data Registry |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, General Counsel

---

**END OF DOCUMENT**

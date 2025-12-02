# Data Retention Schedule

**Document ID**: GQ-PRIV-004  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This **Data Retention Schedule** establishes retention durations, deletion methods, Genesis Archive™ preservation requirements, regulatory justifications, and minimization requirements for all personal data processed by **GhostQuant™**.

This schedule ensures compliance with:

- **GDPR Article 5(1)(e)** — Storage Limitation
- **NIST SP 800-53 DM-2** — Data Retention and Disposal
- **SOC 2 CC7.2** — System Monitoring
- **CCPA § 1798.105** — Right to Delete
- **FedRAMP DM-2** — Data Retention and Disposal
- **CJIS Security Policy 5.4.1.1** — Audit Log Retention

---

## 2. Retention Principles

### 2.1 Retention Duration Determination

**GhostQuant determines retention duration based on**:

1. **Regulatory Requirements**: Minimum retention periods mandated by law (e.g., AML/KYC 3 years, audit logs 7 years)
2. **Business Need**: Operational requirements for threat intelligence and service delivery
3. **Data Minimization**: Shortest retention period that satisfies regulatory and business needs
4. **User Rights**: Right to erasure (GDPR Article 17) applies to non-Genesis data

### 2.2 Deletion Methods

**GhostQuant uses the following deletion methods**:

- **Soft Delete**: Data marked as deleted but retained for recovery period (30 days)
- **Hard Delete**: Data permanently deleted from database (no recovery)
- **Secure Deletion**: 3-pass overwrite for sensitive data (DoD 5220.22-M standard)
- **Cryptographic Erasure**: Encryption keys destroyed (data becomes unrecoverable)

### 2.3 Genesis Archive™ Preservation

**Genesis Archive™ is append-only and immutable**:

- Data preserved in Genesis Archive™ **cannot be deleted** (regulatory compliance, forensic evidence)
- Right to erasure (GDPR Article 17) does **not apply** to Genesis Archive™ (legal obligation exception)
- Users informed at account creation that certain actions are permanently logged

---

## 3. Retention Matrix

### 3.1 Authentication & Access Control Data

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **User Account** | Duration of account + 7 years | Hard delete | Yes (account creation/deletion) | NIST 800-53 AC-2, SOC 2 CC6.1 | Only email, username, password hash collected |
| **Password Hash** | Duration of account | Cryptographic erasure | No | NIST 800-53 IA-5 | bcrypt hashing, never stored in plaintext |
| **MFA Tokens** | Duration of account | Hard delete | No | NIST 800-53 IA-2 | FIDO2/WebAuthn, TOTP |
| **Login Events** | 1 year | Hard delete | Yes (privileged user logins) | CJIS 5.4.1.1, NIST 800-53 AU-11 | IP hashed after 30 days |
| **Failed Login Attempts** | 24 hours | Hard delete | Yes (if brute force detected) | NIST 800-53 AC-7 | Cleared after 24 hours |
| **Session Tokens** | Session duration (max 24 hours) | Hard delete | No | NIST 800-53 SC-23 | Deleted immediately on logout |
| **Session Logs** | 1 year | Hard delete | Yes (privileged sessions) | NIST 800-53 AU-2, SOC 2 CC7.2 | IP hashed after 30 days |
| **Device Fingerprints** | 1 year | Hard delete | No | NIST 800-53 IA-3 | Deleted after 1 year |
| **API Keys** | Until revoked | Cryptographic erasure | Yes (creation/revocation) | NIST 800-53 IA-5 | bcrypt hashing, only last 4 chars visible |
| **Privilege Elevation Events** | 7 years | Hard delete | Yes (all events) | NIST 800-53 AC-6, SOC 2 CC6.2 | IP hashed after 30 days |
| **Role Changes** | 7 years | Hard delete | Yes (all events) | NIST 800-53 AC-2, SOC 2 CC6.1 | Only role change logged |
| **Access Control Violations** | 7 years | Hard delete | Yes (all events) | NIST 800-53 AC-3, CJIS 5.4.1.1 | Full event details preserved |

---

### 3.2 Intelligence Engine Data

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **Prediction Inputs (GhostPredictor™)** | Not stored (< 60 seconds) | Automatic memory clearing | No | Data minimization (GDPR Article 5) | Temporary buffer only |
| **Prediction Results (saved)** | 30 days | Hard delete | No | Business need (threat analysis) | Only if user explicitly saves |
| **UltraFusion Inputs** | Not stored (< 60 seconds) | Automatic memory clearing | No | Data minimization (GDPR Article 5) | Temporary buffer only |
| **UltraFusion Results (saved)** | 30 days | Hard delete | No | Business need (threat analysis) | Only if user explicitly saves |
| **Hydra Cluster Detection** | 3 years | Hard delete | Yes (high-risk clusters) | AML/KYC compliance (31 CFR 1022.210) | Wallet addresses pseudonymized |
| **Constellation Entity Maps** | 5 years | Hard delete | Yes (critical relationships) | Threat intelligence lifecycle | Entity IDs pseudonymized |
| **Cortex Memory Patterns** | 5 years | Hard delete | Yes (critical patterns) | Threat intelligence lifecycle | Behavioral sequences pseudonymized |
| **Oracle Eye Image Uploads** | 90 days | Secure deletion (3-pass) | No (unless flagged) | Business need (visual intelligence) | EXIF metadata stripped |
| **Oracle Eye Analysis Results** | 90 days | Hard delete | No (unless flagged) | Business need (visual intelligence) | Text extraction only |
| **Sentinel Security Alerts** | 1 year | Hard delete | Yes (critical alerts) | CJIS 5.4.1.1, NIST 800-53 AU-11 | IP hashed after 30 days |
| **Global Radar Heatmap Data** | 30 days | Hard delete | No | Business need (threat visualization) | Aggregated data only |
| **Actor Profiler Data** | 5 years | Hard delete | Yes (high-risk actors) | Threat intelligence lifecycle | Public data only |

---

### 3.3 Audit & Compliance Data

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **Genesis Archive™ Blocks** | **Permanent** | **Cannot be deleted** | Yes (self-preserving) | Regulatory compliance, forensic evidence | Minimal personal data logged |
| **Audit Logs (General)** | 7 years | Hard delete | Yes (critical events) | NIST 800-53 AU-11, SOC 2 CC7.2 | Only security-relevant events |
| **Audit Logs (Privileged)** | 7 years | Hard delete | Yes (all events) | NIST 800-53 AU-2, CJIS 5.4.1.1 | Full event details preserved |
| **Compliance Reports** | 7 years | Hard delete | Yes (all reports) | SOC 2 CC7.3, FedRAMP compliance | Report metadata only |
| **Data Subject Requests** | 7 years | Hard delete | Yes (all requests) | GDPR Article 30, CCPA § 1798.185 | Request type, date, resolution |
| **Consent Records** | 7 years | Hard delete | Yes (all consents) | GDPR Article 7, CCPA § 1798.120 | Consent type, date, method |
| **Privacy Impact Assessments** | 7 years | Hard delete | Yes (all PIAs) | GDPR Article 35, NIST 800-53 AR-2 | PIA metadata only |
| **Incident Response Records** | 7 years | Hard delete | Yes (all incidents) | GDPR Article 33, NIST 800-53 IR-4 | Full incident details preserved |
| **Breach Notifications** | 7 years | Hard delete | Yes (all notifications) | GDPR Article 33, CCPA § 1798.82 | Notification metadata only |

---

### 3.4 User-Generated Content

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **Uploaded Images** | 90 days | Secure deletion (3-pass) | No (unless flagged) | Business need (visual intelligence) | EXIF metadata stripped |
| **Saved Predictions** | 30 days | Hard delete | No | Business need (threat analysis) | Only if user explicitly saves |
| **Saved Fusion Results** | 30 days | Hard delete | No | Business need (threat analysis) | Only if user explicitly saves |
| **Analyst Notes** | Duration of account | Hard delete | No | Business need (collaboration) | Only if user creates notes |
| **Shared Reports** | Duration of account | Hard delete | No | Business need (collaboration) | Only if user shares reports |
| **GhostMind™ Conversations** | Session duration | Hard delete | No | Data minimization (GDPR Article 5) | Deleted when session ends |

---

### 3.5 Blockchain & Transaction Data

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **Wallet Addresses (pseudonymized)** | 3 years | Hard delete | Yes (high-risk wallets) | AML/KYC compliance (31 CFR 1022.210) | SHA-256 pseudonymization |
| **Transaction Hashes (pseudonymized)** | 3 years | Hard delete | Yes (high-risk transactions) | AML/KYC compliance (31 CFR 1022.210) | SHA-256 pseudonymization |
| **Transaction Metadata** | 3 years | Hard delete | Yes (high-risk transactions) | AML/KYC compliance (31 CFR 1022.210) | Aggregated data only |
| **Cluster Detection Results** | 3 years | Hard delete | Yes (high-risk clusters) | AML/KYC compliance (31 CFR 1022.210) | Cluster metadata only |
| **Entity Relationships** | 5 years | Hard delete | Yes (critical relationships) | Threat intelligence lifecycle | Public data only |

---

### 3.6 Communication & Metadata

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **Email Addresses** | Duration of account + 7 years | Hard delete | Yes (account creation/deletion) | NIST 800-53 AC-2, SOC 2 CC6.1 | Required for authentication |
| **IP Addresses (raw)** | 30 days | Hard delete | No | Business need (security monitoring) | Hashed after 30 days |
| **IP Addresses (hashed)** | 1 year | Hard delete | No | Business need (security monitoring) | SHA-256 hashing |
| **User Agent Strings** | 1 year | Hard delete | No | Business need (security monitoring) | Browser, OS, device type only |
| **Geolocation (IP-based)** | 30 days | Hard delete | No | Business need (security monitoring) | Country/city level only |
| **Error Logs** | 90 days | Hard delete | No | Business need (debugging) | No personal data logged |
| **Performance Metrics** | 90 days | Hard delete | No | Business need (optimization) | Aggregated data only |

---

### 3.7 Training & Machine Learning Data

| Data Type | Retention Duration | Deletion Method | Genesis Preservation | Regulatory Justification | Minimization |
|-----------|-------------------|-----------------|---------------------|-------------------------|--------------|
| **Training Datasets** | 5 years | Hard delete | No | Business need (model training) | Anonymized/pseudonymized |
| **Model Artifacts** | 5 years | Hard delete | No | Business need (model versioning) | No personal data in models |
| **Model Performance Metrics** | 5 years | Hard delete | No | Business need (model evaluation) | Aggregated data only |
| **Feature Engineering Logs** | 90 days | Hard delete | No | Business need (debugging) | No personal data logged |

---

## 4. Automated Deletion Schedule

**GhostQuant implements automated deletion using cron jobs**:

### 4.1 Daily Deletion Jobs

**Runs at 02:00 UTC daily**:

```sql
-- Delete expired session tokens
DELETE FROM session_tokens WHERE expires_at < NOW();

-- Delete failed login attempts older than 24 hours
DELETE FROM auth_logs WHERE event_type = 'failed_login' AND timestamp < NOW() - INTERVAL '24 hours';

-- Delete temporary engine buffers (should already be cleared, this is backup)
DELETE FROM temp_buffers WHERE created_at < NOW() - INTERVAL '1 hour';
```

### 4.2 Weekly Deletion Jobs

**Runs at 03:00 UTC every Sunday**:

```sql
-- Delete uploaded images older than 90 days (unless flagged for Genesis preservation)
DELETE FROM uploaded_images WHERE uploaded_at < NOW() - INTERVAL '90 days' AND genesis_preserved = FALSE;

-- Delete saved predictions older than 30 days
DELETE FROM predictions WHERE saved_at < NOW() - INTERVAL '30 days';

-- Delete saved fusion results older than 30 days
DELETE FROM fusion_results WHERE saved_at < NOW() - INTERVAL '30 days';

-- Delete error logs older than 90 days
DELETE FROM error_logs WHERE timestamp < NOW() - INTERVAL '90 days';
```

### 4.3 Monthly Deletion Jobs

**Runs at 04:00 UTC on the 1st of each month**:

```sql
-- Hash IP addresses older than 30 days
UPDATE auth_logs SET ip_address = SHA256(ip_address) WHERE timestamp < NOW() - INTERVAL '30 days' AND ip_address NOT LIKE 'sha256:%';

UPDATE session_logs SET ip_address = SHA256(ip_address) WHERE timestamp < NOW() - INTERVAL '30 days' AND ip_address NOT LIKE 'sha256:%';

UPDATE sentinel_alerts SET ip_address = SHA256(ip_address) WHERE timestamp < NOW() - INTERVAL '30 days' AND ip_address NOT LIKE 'sha256:%';

-- Delete device fingerprints older than 1 year
DELETE FROM device_fingerprints WHERE last_seen < NOW() - INTERVAL '1 year';

-- Delete hashed IP addresses older than 1 year
UPDATE auth_logs SET ip_address = NULL WHERE timestamp < NOW() - INTERVAL '1 year';
UPDATE session_logs SET ip_address = NULL WHERE timestamp < NOW() - INTERVAL '1 year';
UPDATE sentinel_alerts SET ip_address = NULL WHERE timestamp < NOW() - INTERVAL '1 year';
```

### 4.4 Annual Deletion Jobs

**Runs at 05:00 UTC on January 1st**:

```sql
-- Delete session logs older than 1 year (except Genesis-preserved)
DELETE FROM session_logs WHERE timestamp < NOW() - INTERVAL '1 year' AND genesis_preserved = FALSE;

-- Delete security alerts older than 1 year (except Genesis-preserved)
DELETE FROM sentinel_alerts WHERE timestamp < NOW() - INTERVAL '1 year' AND genesis_preserved = FALSE;

-- Delete Hydra cluster detection results older than 3 years (except Genesis-preserved)
DELETE FROM hydra_clusters WHERE detected_at < NOW() - INTERVAL '3 years' AND genesis_preserved = FALSE;

-- Delete Constellation entity maps older than 5 years (except Genesis-preserved)
DELETE FROM constellation_entities WHERE created_at < NOW() - INTERVAL '5 years' AND genesis_preserved = FALSE;

-- Delete Cortex memory patterns older than 5 years (except Genesis-preserved)
DELETE FROM cortex_patterns WHERE created_at < NOW() - INTERVAL '5 years' AND genesis_preserved = FALSE;

-- Delete audit logs older than 7 years (except Genesis-preserved)
DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '7 years' AND genesis_preserved = FALSE;

-- Delete user accounts inactive for 7 years (soft delete first, then hard delete after 30 days)
UPDATE users SET deleted_at = NOW() WHERE last_login < NOW() - INTERVAL '7 years' AND deleted_at IS NULL;
DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '30 days';
```

---

## 5. User-Initiated Deletion

**Users can request deletion of their personal data** (GDPR Article 17, CCPA § 1798.105):

### 5.1 Right to Erasure (GDPR Article 17)

**Users can request deletion of**:
- User account (email, username, password hash)
- Session logs (except Genesis-preserved)
- Uploaded images (except Genesis-preserved)
- Saved predictions and fusion results
- Analyst notes and shared reports

**Users CANNOT request deletion of**:
- Genesis Archive™ records (legal obligation exception)
- Audit logs required for regulatory compliance (legal obligation exception)
- Data required for AML/KYC compliance (legal obligation exception)

**Deletion Process**:
1. User submits deletion request via Settings Panel (`/terminal/settings`)
2. Identity verification required (MFA challenge)
3. User warned that Genesis Archive™ records cannot be deleted
4. User confirms deletion request
5. Data soft-deleted (30-day recovery period)
6. After 30 days, data hard-deleted (permanent)
7. Deletion confirmation sent to user email
8. Deletion request logged in Genesis Archive™

### 5.2 Account Deletion

**When user deletes account**:

**Immediate Actions**:
- User account marked as deleted (soft delete)
- All active sessions terminated
- All API keys revoked
- User cannot log in

**After 30 Days** (recovery period):
- User account hard-deleted
- Email address, username, password hash permanently deleted
- Session logs deleted (except Genesis-preserved)
- Uploaded images deleted (except Genesis-preserved)
- Saved predictions and fusion results deleted
- Analyst notes and shared reports deleted

**Retained Data** (cannot be deleted):
- Genesis Archive™ records (permanent)
- Audit logs required for regulatory compliance (7 years)
- Hydra cluster detection results (3 years, AML/KYC compliance)
- Constellation entity maps (5 years, threat intelligence lifecycle)
- Cortex memory patterns (5 years, threat intelligence lifecycle)

---

## 6. Genesis Archive™ Preservation Criteria

**Data is preserved in Genesis Archive™ if it meets any of the following criteria**:

### 6.1 Critical Security Events

- Privilege elevation (all events)
- Role changes (all events)
- Access control violations (all events)
- Brute force login attempts (detected patterns)
- Unauthorized access attempts (all events)
- Data breach incidents (all events)
- Security policy violations (all events)

### 6.2 High-Risk Threat Intelligence

- Hydra cluster detection results (risk score ≥ 0.70)
- Constellation entity relationships (critical entities)
- Cortex memory patterns (anomaly score ≥ 0.80)
- Actor profiler results (high-risk actors)
- Sentinel security alerts (severity = CRITICAL or HIGH)

### 6.3 Regulatory Compliance

- User account creation/deletion (all events)
- API key creation/revocation (all events)
- Data subject requests (all requests)
- Consent records (all consents)
- Privacy Impact Assessments (all PIAs)
- Incident response records (all incidents)
- Breach notifications (all notifications)
- Compliance reports (all reports)

### 6.4 Forensic Evidence

- Uploaded images flagged for forensic preservation
- Prediction/fusion results flagged for forensic preservation
- Session logs associated with security incidents
- Audit logs associated with investigations

---

## 7. Retention Exceptions

**GhostQuant may retain data beyond the standard retention period in the following cases**:

### 7.1 Legal Hold

**If data is subject to legal hold** (litigation, investigation, regulatory inquiry):
- Data retention period extended until legal hold is lifted
- Data cannot be deleted (even if user requests deletion)
- Legal hold logged in Genesis Archive™
- User notified of legal hold (if legally permissible)

### 7.2 Active Investigation

**If data is part of active security investigation**:
- Data retention period extended until investigation concludes
- Data cannot be deleted
- Investigation logged in Genesis Archive™

### 7.3 Regulatory Inquiry

**If data is subject to regulatory inquiry** (SEC, CFTC, FinCEN, etc.):
- Data retention period extended until inquiry concludes
- Data cannot be deleted
- Inquiry logged in Genesis Archive™

---

## 8. Data Disposal Procedures

### 8.1 Soft Delete

**Process**:
1. Data marked as deleted in database (`deleted_at` timestamp set)
2. Data no longer visible to users
3. Data retained for 30-day recovery period
4. After 30 days, data hard-deleted

**Use Cases**:
- User account deletion
- User-initiated data deletion
- Uploaded image deletion

### 8.2 Hard Delete

**Process**:
1. Data permanently deleted from database (`DELETE` SQL statement)
2. Data cannot be recovered
3. Deletion logged in Genesis Archive™

**Use Cases**:
- Expired session tokens
- Failed login attempts (after 24 hours)
- Saved predictions (after 30 days)
- Audit logs (after 7 years, except Genesis-preserved)

### 8.3 Secure Deletion (3-Pass Overwrite)

**Process**:
1. Data overwritten with random data (Pass 1)
2. Data overwritten with complement of random data (Pass 2)
3. Data overwritten with random data (Pass 3)
4. Data deleted from filesystem
5. Deletion logged in Genesis Archive™

**Use Cases**:
- Uploaded images containing sensitive data
- Forensic evidence after retention period expires

**Standard**: DoD 5220.22-M (3-pass overwrite)

### 8.4 Cryptographic Erasure

**Process**:
1. Encryption keys destroyed
2. Encrypted data becomes unrecoverable
3. Encrypted data can remain on disk (no need for physical deletion)
4. Key destruction logged in Genesis Archive™

**Use Cases**:
- Password hashes (when user deletes account)
- API keys (when user revokes key)
- Encrypted backups (when retention period expires)

---

## 9. Compliance Mapping

### 9.1 GDPR Article 5(1)(e) — Storage Limitation

**GDPR Requirement**:
> "Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed."

**GhostQuant Compliance**:
- ✅ Retention durations defined for all data types
- ✅ Automated deletion jobs implemented
- ✅ User-initiated deletion supported (except Genesis Archive™)
- ✅ Data minimization applied to all data types

### 9.2 NIST SP 800-53 DM-2 — Data Retention and Disposal

**NIST Requirement**:
> "The organization retains each collection of personally identifiable information (PII) for [Assignment: organization-defined time period] to fulfill the purpose(s) identified in the notice or as required by law."

**GhostQuant Compliance**:
- ✅ Retention durations defined based on regulatory requirements and business need
- ✅ Disposal methods defined (soft delete, hard delete, secure deletion, cryptographic erasure)
- ✅ Genesis Archive™ preservation criteria defined

### 9.3 SOC 2 CC7.2 — System Monitoring

**SOC 2 Requirement**:
> "The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity's ability to meet its objectives; anomalies are analyzed to determine whether they represent security events."

**GhostQuant Compliance**:
- ✅ Security alerts retained for 1 year
- ✅ Audit logs retained for 7 years
- ✅ Genesis Archive™ preserves critical security events permanently

### 9.4 CCPA § 1798.105 — Right to Delete

**CCPA Requirement**:
> "A consumer shall have the right to request that a business delete any personal information about the consumer which the business has collected from the consumer."

**GhostQuant Compliance**:
- ✅ User-initiated deletion supported
- ✅ 30-day recovery period
- ✅ Exceptions documented (Genesis Archive™, legal obligations)

### 9.5 FedRAMP DM-2 — Data Retention and Disposal

**FedRAMP Requirement**:
> "The organization retains each collection of personally identifiable information (PII) for [FedRAMP Assignment: time periods defined in the applicable SORN and National Archives and Records Administration (NARA) General Records Schedules] to fulfill the purpose(s) identified in the notice or as required by law."

**GhostQuant Compliance**:
- ✅ Retention durations align with NARA General Records Schedules
- ✅ Audit logs retained for 7 years (NARA GRS 3.2)
- ✅ Genesis Archive™ preserves critical records permanently

---

## 10. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Data Retention Schedule |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, General Counsel

---

**END OF DOCUMENT**

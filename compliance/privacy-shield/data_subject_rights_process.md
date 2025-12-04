# Data Subject Rights Process

**Document ID**: GQ-PRIV-007  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes exact procedures for handling **data subject rights requests** under **GDPR**, **CCPA/CPRA**, and other privacy regulations. GhostQuant™ supports the following data subject rights:

- **Right to Access** (GDPR Article 15, CCPA § 1798.100)
- **Right to Rectification** (GDPR Article 16)
- **Right to Erasure** ("Right to be Forgotten") (GDPR Article 17, CCPA § 1798.105)
- **Right to Restriction of Processing** (GDPR Article 18)
- **Right to Object** (GDPR Article 21)
- **Right to Data Portability** (GDPR Article 20, CCPA § 1798.100)

This process ensures compliance with:

- **GDPR Articles 12-22** — Data Subject Rights
- **CCPA §§ 1798.100-1798.145** — Consumer Rights
- **NIST SP 800-53 IP-2** — Individual Access
- **NIST SP 800-53 IP-3** — Redress
- **SOC 2 CC6.1** — Logical Access Controls
- **FedRAMP IP-2** — Individual Access

---

## 2. Data Subject Rights Overview

### 2.1 Right to Access (GDPR Article 15, CCPA § 1798.100)

**What it means**: Users can request a copy of all personal data GhostQuant holds about them.

**GhostQuant Response**:
- Provide copy of all personal data in machine-readable format (JSON)
- Include:
  - User account information (name, email, username, role)
  - Login history (last 1 year)
  - Session logs (last 1 year)
  - Uploaded images (last 90 days)
  - Saved predictions and fusion results (last 30 days)
  - API keys (hashed, last 4 characters visible)
  - Genesis Archive™ records (user-specific events)

**Response Timeline**: 30 days (GDPR Article 12)

---

### 2.2 Right to Rectification (GDPR Article 16)

**What it means**: Users can request correction of inaccurate personal data.

**GhostQuant Response**:
- Allow users to update:
  - Full name
  - Email address
  - Username
  - Password
  - MFA tokens
- Verify identity before making changes (MFA challenge)
- Log all changes in Genesis Archive™

**Response Timeline**: Immediate (self-service via Settings Panel)

---

### 2.3 Right to Erasure (GDPR Article 17, CCPA § 1798.105)

**What it means**: Users can request deletion of their personal data ("Right to be Forgotten").

**GhostQuant Response**:
- Delete:
  - User account (email, username, password hash)
  - Session logs (except Genesis-preserved)
  - Uploaded images (except Genesis-preserved)
  - Saved predictions and fusion results
  - Analyst notes and shared reports
- **Cannot delete** (legal obligation exception):
  - Genesis Archive™ records (permanent)
  - Audit logs required for regulatory compliance (7 years)
  - Data required for AML/KYC compliance (3 years)

**Response Timeline**: 30 days (soft delete), then permanent deletion after 30-day recovery period

---

### 2.4 Right to Restriction of Processing (GDPR Article 18)

**What it means**: Users can request limitation of processing of their personal data.

**GhostQuant Response**:
- Mark user account as "restricted" (processing limited to storage only)
- User cannot:
  - Submit intelligence engine requests
  - Upload images
  - Create API keys
- User can still:
  - Log in
  - View existing data
  - Request deletion

**Response Timeline**: Immediate (self-service via Settings Panel)

---

### 2.5 Right to Object (GDPR Article 21)

**What it means**: Users can object to certain processing activities (e.g., marketing, profiling).

**GhostQuant Response**:
- Users can opt out of:
  - Non-essential analytics
  - Marketing communications (GhostQuant does not send marketing emails by default)
  - Behavioral profiling outside threat analysis
- Users **cannot** opt out of:
  - Authentication and session management (necessary for service delivery)
  - Security monitoring (legitimate interest)
  - Audit logging (legal obligation)

**Response Timeline**: Immediate (self-service via Settings Panel)

---

### 2.6 Right to Data Portability (GDPR Article 20, CCPA § 1798.100)

**What it means**: Users can request their personal data in machine-readable format for transfer to another service.

**GhostQuant Response**:
- Provide personal data in JSON format:
  - User account information
  - Login history
  - Session logs
  - Uploaded images (as base64-encoded strings)
  - Saved predictions and fusion results
  - API keys (hashed)
- Data can be downloaded via Settings Panel or emailed to user

**Response Timeline**: 30 days (GDPR Article 12)

---

## 3. Data Subject Rights Request Process

### 3.1 Request Submission

**Users can submit data subject rights requests via**:

1. **Settings Panel** (`/terminal/settings`) — Self-service for most requests
2. **Email** (privacy@ghostquant.com) — For complex requests or account deletion
3. **Support Ticket** (support@ghostquant.com) — For general inquiries

**Required Information**:
- Full name
- Email address (associated with GhostQuant account)
- Type of request (Access, Rectification, Erasure, Restriction, Objection, Portability)
- Reason for request (optional)

---

### 3.2 Identity Verification

**Before fulfilling any data subject rights request, GhostQuant must verify the user's identity**:

**Verification Methods**:
1. **MFA Challenge** (if user can log in):
   - User logs in to GhostQuant
   - User completes MFA challenge (FIDO2/WebAuthn or TOTP)
   - Identity verified
2. **Email Verification** (if user cannot log in):
   - User submits request via email (privacy@ghostquant.com)
   - GhostQuant sends verification link to registered email address
   - User clicks verification link
   - Identity verified
3. **Manual Verification** (if email verification fails):
   - User provides government-issued ID (driver's license, passport)
   - GhostQuant verifies ID matches account information
   - Identity verified
   - ID immediately deleted after verification (secure deletion, 3-pass overwrite)

**Identity Verification Logged in Genesis Archive™**:
- User ID
- Verification method
- Verification timestamp
- Request type

---

### 3.3 Request Processing

#### 3.3.1 Right to Access Request

**Step 1**: Verify user identity (MFA challenge or email verification)

**Step 2**: Generate personal data export (JSON format):

```json
{
  "request_id": "ACCESS-2025-12-01-12345",
  "request_date": "2025-12-01T12:00:00Z",
  "user_account": {
    "user_id": "uuid-12345",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "role": "Analyst",
    "account_created": "2024-01-01T00:00:00Z",
    "last_login": "2025-12-01T11:00:00Z"
  },
  "login_history": [
    {
      "timestamp": "2025-12-01T11:00:00Z",
      "ip_address": "hashed-ip-12345",
      "device_fingerprint": "Chrome/Windows",
      "mfa_method": "FIDO2",
      "success": true
    }
  ],
  "session_logs": [
    {
      "session_id": "session-12345",
      "login_timestamp": "2025-12-01T11:00:00Z",
      "logout_timestamp": "2025-12-01T12:00:00Z",
      "duration_seconds": 3600,
      "pages_visited": ["/terminal/predict", "/terminal/radar"]
    }
  ],
  "uploaded_images": [
    {
      "image_id": "image-12345",
      "upload_timestamp": "2025-11-01T10:00:00Z",
      "file_name": "wallet_screenshot.png",
      "file_size_bytes": 102400,
      "analysis_results": {"text_extracted": "Wallet Balance: 1.5 BTC"}
    }
  ],
  "saved_predictions": [
    {
      "prediction_id": "pred-12345",
      "timestamp": "2025-11-15T14:00:00Z",
      "token": "BTC",
      "timeframe": "24h",
      "confidence": 0.85,
      "result": "BULLISH"
    }
  ],
  "api_keys": [
    {
      "api_key_id": "key-12345",
      "api_key_name": "Production API Key",
      "api_key_last_4": "abcd",
      "created": "2024-06-01T00:00:00Z",
      "last_used": "2025-12-01T10:00:00Z"
    }
  ],
  "genesis_archive_records": [
    {
      "block_id": "block-12345",
      "event_type": "account_created",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Step 3**: Encrypt personal data export (AES-256)

**Step 4**: Send download link to user email (link expires in 7 days)

**Step 5**: Log access request in Genesis Archive™

**Step 6**: Confirm completion to user (email notification)

**Timeline**: 30 days (GDPR Article 12)

---

#### 3.3.2 Right to Rectification Request

**Step 1**: Verify user identity (MFA challenge)

**Step 2**: User updates personal data via Settings Panel:
- Full name
- Email address
- Username
- Password
- MFA tokens

**Step 3**: Validate changes (e.g., email address format, username uniqueness)

**Step 4**: Apply changes to database

**Step 5**: Log rectification in Genesis Archive™:
- User ID
- Field changed
- Old value (hashed if sensitive)
- New value (hashed if sensitive)
- Timestamp

**Step 6**: Confirm completion to user (email notification)

**Timeline**: Immediate (self-service)

---

#### 3.3.3 Right to Erasure Request

**Step 1**: Verify user identity (MFA challenge or email verification)

**Step 2**: Display warning to user:

```
WARNING: Account Deletion

You are about to delete your GhostQuant account. This action will:

✅ DELETE:
- User account (email, username, password)
- Session logs (except Genesis-preserved)
- Uploaded images (except Genesis-preserved)
- Saved predictions and fusion results
- Analyst notes and shared reports

❌ CANNOT DELETE (legal obligation exception):
- Genesis Archive™ records (permanent)
- Audit logs required for regulatory compliance (7 years)
- Data required for AML/KYC compliance (3 years)

Your account will be soft-deleted (30-day recovery period), then permanently deleted.

Do you want to proceed?
[Cancel] [Confirm Deletion]
```

**Step 3**: User confirms deletion

**Step 4**: Soft delete user account:
- Mark account as deleted (`deleted_at` timestamp set)
- User cannot log in
- All active sessions terminated
- All API keys revoked

**Step 5**: Send confirmation email:

```
Subject: GhostQuant Account Deletion Confirmation

Your GhostQuant account has been deleted.

Recovery Period: 30 days
If you change your mind, you can recover your account by logging in within 30 days.

After 30 days, your account will be permanently deleted and cannot be recovered.

If you did not request this deletion, please contact us immediately at privacy@ghostquant.com.
```

**Step 6**: After 30 days, hard delete user account:
- User account permanently deleted
- Email address, username, password hash permanently deleted
- Session logs deleted (except Genesis-preserved)
- Uploaded images deleted (except Genesis-preserved)
- Saved predictions and fusion results deleted
- Analyst notes and shared reports deleted

**Step 7**: Log erasure in Genesis Archive™:
- User ID (pseudonymized)
- Deletion timestamp
- Deletion method (soft delete → hard delete)

**Step 8**: Send final confirmation email:

```
Subject: GhostQuant Account Permanently Deleted

Your GhostQuant account has been permanently deleted.

Your personal data has been removed from our systems, except for data that we are legally required to retain (Genesis Archive™ records, audit logs, AML/KYC data).

If you have any questions, please contact us at privacy@ghostquant.com.
```

**Timeline**: 30 days (soft delete), then permanent deletion after 30-day recovery period

---

#### 3.3.4 Right to Restriction of Processing Request

**Step 1**: Verify user identity (MFA challenge)

**Step 2**: User requests restriction via Settings Panel

**Step 3**: Mark user account as "restricted":
- `processing_restricted` flag set to `true`
- User can log in and view existing data
- User cannot submit new intelligence engine requests
- User cannot upload images
- User cannot create API keys

**Step 4**: Log restriction in Genesis Archive™:
- User ID
- Restriction timestamp
- Reason for restriction (optional)

**Step 5**: Confirm completion to user (email notification)

**Step 6**: User can lift restriction at any time via Settings Panel

**Timeline**: Immediate (self-service)

---

#### 3.3.5 Right to Object Request

**Step 1**: Verify user identity (MFA challenge)

**Step 2**: User opts out of non-essential processing via Settings Panel:
- ☐ Non-essential analytics
- ☐ Marketing communications (GhostQuant does not send marketing emails by default)
- ☐ Behavioral profiling outside threat analysis

**Step 3**: Apply opt-out preferences to database

**Step 4**: Log objection in Genesis Archive™:
- User ID
- Objection timestamp
- Processing activities opted out

**Step 5**: Confirm completion to user (email notification)

**Timeline**: Immediate (self-service)

---

#### 3.3.6 Right to Data Portability Request

**Step 1**: Verify user identity (MFA challenge or email verification)

**Step 2**: Generate personal data export (JSON format) — same as Right to Access

**Step 3**: Encrypt personal data export (AES-256)

**Step 4**: Send download link to user email (link expires in 7 days)

**Step 5**: Log portability request in Genesis Archive™

**Step 6**: Confirm completion to user (email notification)

**Timeline**: 30 days (GDPR Article 12)

---

## 4. Request Tracking

**All data subject rights requests are tracked in Genesis Archive™**:

### 4.1 Request Metadata

```json
{
  "request_id": "DSR-2025-12-01-12345",
  "request_type": "access",
  "user_id": "uuid-12345",
  "user_email": "john.doe@example.com",
  "request_date": "2025-12-01T12:00:00Z",
  "verification_method": "MFA",
  "verification_timestamp": "2025-12-01T12:05:00Z",
  "processing_started": "2025-12-01T12:10:00Z",
  "processing_completed": "2025-12-01T12:30:00Z",
  "response_sent": "2025-12-01T12:35:00Z",
  "status": "completed",
  "notes": "Personal data export generated and sent to user email"
}
```

### 4.2 Request Status

- **Pending**: Request received, awaiting identity verification
- **Verified**: Identity verified, awaiting processing
- **Processing**: Request being processed
- **Completed**: Request fulfilled, response sent to user
- **Rejected**: Request rejected (e.g., identity verification failed, legal obligation exception)

---

## 5. 30-Day Timeline Requirement

**GDPR Article 12 requires response within 30 days**:

### 5.1 Timeline Tracking

**Day 0**: Request received  
**Day 1-3**: Identity verification  
**Day 4-25**: Request processing  
**Day 26-28**: Response preparation (data export, encryption, email)  
**Day 29-30**: Response sent to user

### 5.2 Timeline Extension

**If request is complex, GhostQuant may extend timeline by 60 days** (GDPR Article 12(3)):

**Extension Criteria**:
- Request involves large volume of data (> 10,000 records)
- Request requires manual review (e.g., Genesis Archive™ sampling)
- Multiple requests from same user (batch processing)

**Extension Notification**:
- User notified within 30 days of original request
- Explanation of delay provided
- New deadline provided (up to 60 days extension)

---

## 6. Recordkeeping Using Genesis Archive™

**All data subject rights requests are permanently logged in Genesis Archive™**:

### 6.1 Genesis Archive™ Records

**For each data subject rights request, Genesis Archive™ records**:
- Request ID
- Request type (Access, Rectification, Erasure, Restriction, Objection, Portability)
- User ID (pseudonymized)
- Request date
- Verification method
- Verification timestamp
- Processing started timestamp
- Processing completed timestamp
- Response sent timestamp
- Status (Pending, Verified, Processing, Completed, Rejected)
- Notes (reason for rejection, extension, etc.)

**Genesis Archive™ records are**:
- **Immutable**: Cannot be modified or deleted
- **Tamper-evident**: Cryptographic hashing (SHA-256) ensures integrity
- **Permanent**: Retained forever (regulatory compliance, forensic evidence)

### 6.2 Compliance Reporting

**Genesis Archive™ enables compliance reporting**:
- Number of data subject rights requests per month/year
- Average response time
- Request types (Access, Rectification, Erasure, etc.)
- Rejection rate and reasons
- Extension rate and reasons

**Example Report**:

```
Data Subject Rights Requests — 2025

Total Requests: 150
- Access: 80 (53%)
- Rectification: 30 (20%)
- Erasure: 25 (17%)
- Restriction: 5 (3%)
- Objection: 5 (3%)
- Portability: 5 (3%)

Average Response Time: 12 days
Rejection Rate: 2% (3 requests)
Extension Rate: 5% (8 requests)
```

---

## 7. Step-by-Step Workflows

### 7.1 Workflow: Right to Access Request

```
┌─────────────────────────────────────────────────────────────┐
│                  Right to Access Workflow                    │
└─────────────────────────────────────────────────────────────┘

1. User submits access request via Settings Panel or email
   ↓
2. GhostQuant verifies user identity (MFA challenge or email verification)
   ↓
3. GhostQuant generates personal data export (JSON format)
   ↓
4. GhostQuant encrypts personal data export (AES-256)
   ↓
5. GhostQuant sends download link to user email (link expires in 7 days)
   ↓
6. GhostQuant logs access request in Genesis Archive™
   ↓
7. GhostQuant confirms completion to user (email notification)
   ↓
8. User downloads personal data export
   ↓
9. Request completed (within 30 days)
```

---

### 7.2 Workflow: Right to Erasure Request

```
┌─────────────────────────────────────────────────────────────┐
│                  Right to Erasure Workflow                   │
└─────────────────────────────────────────────────────────────┘

1. User submits erasure request via Settings Panel or email
   ↓
2. GhostQuant verifies user identity (MFA challenge or email verification)
   ↓
3. GhostQuant displays warning (what will be deleted, what cannot be deleted)
   ↓
4. User confirms deletion
   ↓
5. GhostQuant soft-deletes user account (30-day recovery period)
   ↓
6. GhostQuant sends confirmation email (recovery instructions)
   ↓
7. GhostQuant logs erasure request in Genesis Archive™
   ↓
8. After 30 days, GhostQuant hard-deletes user account (permanent)
   ↓
9. GhostQuant sends final confirmation email
   ↓
10. Request completed (within 30 days + 30-day recovery period)
```

---

### 7.3 Workflow: Right to Rectification Request

```
┌─────────────────────────────────────────────────────────────┐
│                Right to Rectification Workflow               │
└─────────────────────────────────────────────────────────────┘

1. User logs in to GhostQuant
   ↓
2. User navigates to Settings Panel
   ↓
3. User updates personal data (name, email, username, password, MFA)
   ↓
4. GhostQuant validates changes (email format, username uniqueness)
   ↓
5. GhostQuant applies changes to database
   ↓
6. GhostQuant logs rectification in Genesis Archive™
   ↓
7. GhostQuant confirms completion to user (email notification)
   ↓
8. Request completed (immediate)
```

---

## 8. Compliance Mapping

### 8.1 GDPR Articles 12-22 — Data Subject Rights

| GDPR Article | Requirement | GhostQuant Implementation |
|--------------|-------------|--------------------------|
| Article 12 | Transparent information, communication and modalities | 30-day response timeline, clear communication |
| Article 15 | Right of access | Personal data export (JSON format) |
| Article 16 | Right to rectification | Self-service via Settings Panel |
| Article 17 | Right to erasure | Account deletion (soft delete → hard delete) |
| Article 18 | Right to restriction of processing | Processing restriction flag |
| Article 19 | Notification obligation | Email notifications for all requests |
| Article 20 | Right to data portability | Personal data export (JSON format) |
| Article 21 | Right to object | Opt-out controls via Settings Panel |
| Article 22 | Automated individual decision-making | No automated decision-making without human review |

### 8.2 CCPA §§ 1798.100-1798.145 — Consumer Rights

| CCPA Section | Requirement | GhostQuant Implementation |
|--------------|-------------|--------------------------|
| § 1798.100 | Right to know | Personal data export (JSON format) |
| § 1798.105 | Right to delete | Account deletion (soft delete → hard delete) |
| § 1798.110 | Right to access | Personal data export (JSON format) |
| § 1798.115 | Right to disclosure | Personal data registry |
| § 1798.120 | Right to opt-out | Opt-out controls via Settings Panel |
| § 1798.125 | Right to non-discrimination | No discrimination for exercising privacy rights |

### 8.3 NIST SP 800-53 IP-2 — Individual Access

**NIST Requirement**:
> "The organization provides individuals with the ability to have access to their personally identifiable information (PII) maintained in its system(s) of records."

**GhostQuant Compliance**:
- ✅ Personal data export (JSON format)
- ✅ 30-day response timeline
- ✅ Identity verification required

### 8.4 NIST SP 800-53 IP-3 — Redress

**NIST Requirement**:
> "The organization provides a process for individuals to have inaccurate personally identifiable information (PII) maintained by the organization corrected or amended, as appropriate."

**GhostQuant Compliance**:
- ✅ Self-service rectification via Settings Panel
- ✅ Privacy complaint channel (privacy@ghostquant.com)
- ✅ Independent dispute resolution (EU DPAs, FTC, California AG)

---

## 9. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Data Subject Rights Process |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, General Counsel

---

**END OF DOCUMENT**

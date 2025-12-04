# CJIS Data Handling

## Executive Summary

This document describes GhostQuant's data handling procedures for Criminal Justice Information (CJI), including data classification, data flow diagrams, encryption handling, retention and deletion policies, multi-tenant isolation, API security, log handling and redaction, and privacy-by-design principles.

---

## Data Classification

GhostQuant implements a 4-tier data classification system aligned with CJIS requirements:

### Tier 1: Public Data

**Definition**: Data that is publicly available and does not require protection.

**Examples**:
- Market prices (public blockchain data)
- Token metadata (public)
- Chain statistics (public)
- Public transaction hashes
- Public wallet addresses

**CJIS Classification**: Unclassified

**Handling Requirements**:
- No encryption required
- No access control required
- No audit logging required
- Public API access allowed

**Storage**:
- Non-CJIS VPC
- Standard database tables
- No encryption at rest

---

### Tier 2: Internal Data

**Definition**: Data that is internal to GhostQuant and not publicly available, but does not contain sensitive intelligence.

**Examples**:
- System configurations
- Non-sensitive logs
- Performance metrics
- Internal documentation
- User preferences (non-security)

**CJIS Classification**: Unclassified

**Handling Requirements**:
- Encryption recommended but not required
- Internal access only
- Basic audit logging
- No public API access

**Storage**:
- Non-CJIS VPC
- Standard database tables
- Optional encryption at rest

---

### Tier 3: Sensitive Intelligence

**Definition**: Intelligence data that is sensitive but not linked to criminal investigations.

**Examples**:
- Entity risk scores
- Behavioral patterns
- Manipulation alerts
- Threat classifications
- Cluster memberships
- Prediction scores
- Fusion intelligence

**CJIS Classification**: Sensitive But Unclassified (SBU)

**Handling Requirements**:
- Encryption required at rest and in transit
- Access control required (RBAC)
- Comprehensive audit logging
- Authenticated API access only

**Storage**:
- Non-CJIS VPC (can be moved to CJIS VPC)
- Encrypted database tables (AES-256)
- Encrypted backups

---

### Tier 4: Criminal Justice Information (CJI)

**Definition**: Intelligence data linked to criminal investigations or law enforcement queries.

**Examples**:
- Entity identifiers linked to investigations
- Investigative intelligence reports
- Law enforcement queries
- Case-related threat intelligence
- Forensic timelines for criminal cases
- Actor profiles for suspects
- Intelligence shared with criminal justice agencies

**CJIS Classification**: Criminal Justice Information (CJI)

**Handling Requirements**:
- Full CJIS compliance required
- Encryption required at rest and in transit (FIPS 140-2)
- Multi-factor authentication required
- Comprehensive audit logging to Genesis Archive™
- U.S.-based servers only
- Background checks for personnel with access

**Storage**:
- CJIS VPC only
- Encrypted database tables (AES-256, FIPS 140-2)
- Encrypted backups with separate keys
- Permanent audit trail in Genesis Archive™

---

## Data Flow Diagram

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Data Sources                           │
│  (Blockchain Networks, Exchanges, Intelligence Feeds)    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ (Raw Data)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                Data Ingestion Layer                      │
│  (Connectors: Ethereum, Bitcoin, Solana, Binance, etc.) │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ (Normalized Data)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Data Classification Engine                  │
│  (Automatic Tagging: Tier 1, 2, 3, or 4)                │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        │ (Tier 1-3)                    │ (Tier 4)
        ▼                               ▼
┌───────────────────┐         ┌─────────────────────┐
│   Non-CJIS Zone   │         │     CJIS Zone       │
│   (General Intel) │         │   (CJI Data)        │
└─────────┬─────────┘         └──────────┬──────────┘
          │                              │
          │                              │
          ▼                              ▼
┌───────────────────┐         ┌─────────────────────┐
│  Intelligence     │         │  Intelligence       │
│  Engines          │         │  Engines            │
│  (8 Engines)      │         │  (8 Engines)        │
└─────────┬─────────┘         └──────────┬──────────┘
          │                              │
          │                              │
          ▼                              ▼
┌───────────────────┐         ┌─────────────────────┐
│  API Endpoints    │         │  API Endpoints      │
│  (TLS 1.3)        │         │  (TLS 1.3 + MFA)    │
└─────────┬─────────┘         └──────────┬──────────┘
          │                              │
          │                              │
          ▼                              ▼
┌───────────────────┐         ┌─────────────────────┐
│  Frontend         │         │  Frontend           │
│  (React.js)       │         │  (React.js + MFA)   │
└───────────────────┘         └─────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Genesis Archive™   │
              │  (Audit Logging)    │
              └─────────────────────┘
```

### Detailed Data Flow for CJI

```
┌─────────────────────────────────────────────────────────┐
│              CJI Data Flow (Tier 4)                      │
└─────────────────────────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  Law Enforcement│
                │  Query          │
                │  (MFA Required) │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Authentication│
                │  (MFA + Device │
                │   Trust)       │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Authorization │
                │  (RBAC Check)  │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Data Access   │
                │  (CJIS VPC)    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Intelligence  │
                │  Processing    │
                │  (8 Engines)   │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Result        │
                │  Generation    │
                │  (Encrypted)   │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Audit Logging │
                │  (Genesis      │
                │   Archive™)    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Response      │
                │  (TLS 1.3)     │
                └────────────────┘
```

---

## Encryption Handling

### Encryption at Rest

**Algorithm**: AES-256-GCM (Galois/Counter Mode)

**Key Management**:
- Keys stored in AWS KMS (FIPS 140-2 Level 3 validated)
- Automatic key rotation every 90 days
- Separate keys for each data tier
- Master keys never stored on application servers

**Encrypted Data by Tier**:

| Tier | Data Type | Encryption | Key Rotation |
|------|-----------|------------|--------------|
| Tier 1 | Public Data | None | N/A |
| Tier 2 | Internal Data | Optional | N/A |
| Tier 3 | Sensitive Intel | AES-256-GCM | 90 days |
| Tier 4 | CJI | AES-256-GCM (FIPS) | 90 days |

**Encryption Process**:

1. **Data Ingestion**: Data classified and tagged with tier
2. **Key Selection**: Appropriate encryption key selected based on tier
3. **Encryption**: Data encrypted with AES-256-GCM
4. **Storage**: Encrypted data stored in database
5. **Audit Logging**: Encryption event logged to Genesis Archive™

**Decryption Process**:

1. **Data Request**: User requests data via API
2. **Authentication**: User authenticated with MFA (for Tier 4)
3. **Authorization**: User permissions checked (RBAC)
4. **Key Retrieval**: Encryption key retrieved from AWS KMS
5. **Decryption**: Data decrypted with AES-256-GCM
6. **Audit Logging**: Decryption event logged to Genesis Archive™

### Encryption in Transit

**Protocol**: TLS 1.3 (minimum TLS 1.2)

**Cipher Suites** (CJIS-approved):
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_GCM_SHA256

**Certificate Management**:
- 2048-bit RSA certificates (minimum)
- Certificates issued by trusted CA
- Automatic renewal 30 days before expiration
- Certificate pinning for API clients

**Protected Channels**:
- All API endpoints (HTTPS only)
- WebSocket connections (WSS only)
- Database connections (SSL/TLS)
- Redis connections (TLS)
- Internal service mesh (mTLS)

---

## Retention and Deletion Policies

### Retention Policies by Data Tier

| Tier | Data Type | Retention Period | Rationale |
|------|-----------|------------------|-----------|
| Tier 1 | Public Data | 90 days | Public data can be re-ingested |
| Tier 2 | Internal Data | 1 year | Internal reference |
| Tier 3 | Sensitive Intel | 3 years | Regulatory compliance |
| Tier 4 | CJI | Indefinite | CJIS compliance + legal hold |

### Retention Implementation

**Tier 1 (Public Data)**:
- Automatic deletion after 90 days
- Soft delete (marked as deleted, not physically removed)
- Physical deletion after 180 days
- No audit logging required

**Tier 2 (Internal Data)**:
- Automatic deletion after 1 year
- Soft delete (marked as deleted, not physically removed)
- Physical deletion after 2 years
- Basic audit logging

**Tier 3 (Sensitive Intelligence)**:
- Automatic archival after 1 year (moved to cold storage)
- Retention for 3 years
- Deletion requires approval
- Comprehensive audit logging to Genesis Archive™

**Tier 4 (CJI)**:
- **No automatic deletion**
- Indefinite retention in Genesis Archive™
- Deletion only upon legal order or investigation closure
- Deletion requires multi-party approval (legal + security)
- Comprehensive audit logging to Genesis Archive™

### Deletion Procedures

**Soft Delete**:
1. Data marked as deleted (deleted_at timestamp)
2. Data no longer accessible via API
3. Data retained in database for retention period
4. Deletion logged to Genesis Archive™

**Hard Delete**:
1. Cryptographic erasure (encryption key destroyed)
2. Physical deletion from database
3. Deletion from all backups
4. Certificate of deletion generated
5. Deletion logged to Genesis Archive™

**Legal Hold**:
- Data under legal hold cannot be deleted
- Legal hold flag set in database
- Legal hold logged to Genesis Archive™
- Legal hold reviewed quarterly

---

## Multi-Tenant Isolation

GhostQuant supports multiple tenants (law enforcement agencies, financial institutions, etc.) with strict data isolation.

### Tenant Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GhostQuant Platform                    │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│   Tenant A     │           │    Tenant B      │
│   (FBI)        │           │    (SEC)         │
└───────┬────────┘           └─────────┬────────┘
        │                               │
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│   Data A       │           │    Data B        │
│   (Isolated)   │           │    (Isolated)    │
└────────────────┘           └──────────────────┘
```

### Isolation Mechanisms

**1. Database Isolation**:
- Separate database schemas per tenant
- Row-level security (RLS) enforced
- Tenant ID in all records
- Cross-tenant queries blocked

**2. Encryption Isolation**:
- Separate encryption keys per tenant
- Keys stored in separate AWS KMS key rings
- Key access restricted by tenant

**3. Network Isolation**:
- Separate VPCs per tenant (for Tier 4 data)
- Network ACLs prevent cross-tenant traffic
- Separate API endpoints per tenant

**4. Access Control Isolation**:
- Users assigned to single tenant only
- Cross-tenant access prohibited
- Tenant ID in all authentication tokens

**5. Audit Isolation**:
- Separate Genesis Archive™ blocks per tenant
- Tenant-specific audit reports
- Cross-tenant audit access prohibited

### Tenant Onboarding

1. **Tenant Registration**: Tenant registered with unique tenant ID
2. **Database Schema Creation**: Separate schema created for tenant
3. **Encryption Key Generation**: Separate encryption keys generated
4. **VPC Creation**: Separate VPC created (for Tier 4 tenants)
5. **User Provisioning**: Users assigned to tenant
6. **Audit Logging**: Onboarding logged to Genesis Archive™

---

## API Security

### API Authentication

**Authentication Methods**:
- API keys (for non-CJIS access)
- OAuth 2.0 (for non-CJIS access)
- MFA + API keys (for CJIS access)
- Client certificates (for CJIS access)

**Authentication Flow**:

```
┌─────────────────────────────────────────────────────────┐
│              API Authentication Flow                     │
└─────────────────────────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  API Request   │
                │  (with API key)│
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  API Key       │
                │  Validation    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  MFA Challenge │
                │  (for CJIS)    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Rate Limiting │
                │  Check         │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Authorization │
                │  (RBAC)        │
                └───────┬────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│  Access Denied │           │  Access Granted  │
│  (Log to       │           │  (Log to Genesis)│
│   Genesis)     │           │                  │
└────────────────┘           └──────────────────┘
```

### API Authorization

**Authorization Model**: Role-Based Access Control (RBAC)

**Roles**:
- Admin: Full API access
- Analyst: Read/write intelligence data
- Investigator: Read intelligence data
- Auditor: Read audit logs only
- Read-Only: Read public data only

**Permission Matrix**:

| Endpoint | Admin | Analyst | Investigator | Auditor | Read-Only |
|----------|-------|---------|--------------|---------|-----------|
| GET /intelligence | ✓ | ✓ | ✓ | ✗ | ✓ |
| POST /intelligence | ✓ | ✓ | ✗ | ✗ | ✗ |
| GET /cji | ✓ | ✓ | ✓ | ✗ | ✗ |
| POST /cji | ✓ | ✓ | ✗ | ✗ | ✗ |
| GET /audit | ✓ | ✗ | ✗ | ✓ | ✗ |
| POST /admin | ✓ | ✗ | ✗ | ✗ | ✗ |

### API Rate Limiting

**Rate Limits by Role**:

| Role | Requests/Minute | Requests/Hour | Requests/Day |
|------|-----------------|---------------|--------------|
| Admin | 1000 | 10000 | 100000 |
| Analyst | 500 | 5000 | 50000 |
| Investigator | 200 | 2000 | 20000 |
| Auditor | 100 | 1000 | 10000 |
| Read-Only | 50 | 500 | 5000 |

**Rate Limiting Implementation**:
- Token bucket algorithm
- Per-user rate limiting
- Per-IP rate limiting
- Rate limit headers in API responses
- Rate limit exceeded logged to Genesis Archive™

### API Input Validation

**Validation Rules**:
- All inputs validated against schema
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- CSRF prevention (CSRF tokens)
- File upload validation (size, type, content)

**Validation Failures**:
- Validation errors logged to Genesis Archive™
- 400 Bad Request response returned
- Repeated validation failures trigger rate limiting

---

## Log Handling and Redaction

### Log Categories

**1. System Logs**:
- Server startup/shutdown
- Service failures
- Configuration changes
- Patch installations

**2. Intelligence Logs**:
- Intelligence engine queries
- Risk score calculations
- Threat detections
- Report generations

**3. Authentication Logs**:
- Login attempts (success/failure)
- Logout events
- MFA challenges
- Password changes

**4. Authorization Logs**:
- Permission checks
- Role assignments
- Access denials
- Privilege escalations

**5. Data Access Logs**:
- CJI data reads
- CJI data writes
- CJI data deletions
- Data exports

### Log Redaction

**Redaction Rules**:

**Personally Identifiable Information (PII)**:
- Social Security Numbers: Redacted to XXX-XX-1234
- Credit Card Numbers: Redacted to XXXX-XXXX-XXXX-1234
- Email Addresses: Redacted to u***@example.com
- Phone Numbers: Redacted to XXX-XXX-1234

**IP Addresses**:
- Internal IPs: Redacted to 10.0.X.X
- External IPs: Redacted to XXX.XXX.XXX.X (last octet preserved)

**Entity IDs**:
- Wallet Addresses: Redacted to 0x1234...5678 (first 4 + last 4 characters)
- Transaction Hashes: Redacted to 0xabcd...ef01 (first 4 + last 4 characters)

**Metadata**:
- User Agents: Browser name preserved, version redacted
- Geolocation: Country preserved, city/state redacted

**Financial Patterns**:
- Transaction Amounts: Redacted to ranges ($0-$100, $100-$1000, etc.)
- Account Balances: Redacted to ranges

### Log Redaction Implementation

**Redaction Process**:

1. **Log Generation**: Raw log generated by application
2. **Classification**: Log classified by sensitivity
3. **Redaction**: PII/sensitive data redacted based on rules
4. **Encryption**: Redacted log encrypted (AES-256)
5. **Storage**: Encrypted log stored in Genesis Archive™
6. **Audit**: Redaction event logged to Genesis Archive™

**Redaction Exceptions**:
- Logs for active investigations (no redaction)
- Logs under legal hold (no redaction)
- Logs for security incidents (no redaction)
- Redaction exceptions require approval
- Exceptions logged to Genesis Archive™

---

## Handling of Specific Data Types

### IP Addresses

**Collection**:
- IP addresses collected for all API requests
- IP addresses used for geolocation verification
- IP addresses used for threat detection

**Storage**:
- IP addresses encrypted at rest (AES-256)
- IP addresses stored in separate table
- IP addresses linked to user sessions

**Retention**:
- IP addresses retained for 90 days (non-CJIS)
- IP addresses retained indefinitely (CJIS)

**Redaction**:
- IP addresses redacted in logs (last octet preserved)
- Full IP addresses available to security team only

### Addresses (Wallet Addresses)

**Collection**:
- Wallet addresses collected from blockchain data
- Wallet addresses used for entity profiling
- Wallet addresses used for threat detection

**Storage**:
- Wallet addresses encrypted at rest (AES-256)
- Wallet addresses stored in entity table
- Wallet addresses linked to risk scores

**Retention**:
- Wallet addresses retained for 3 years (non-CJIS)
- Wallet addresses retained indefinitely (CJIS)

**Redaction**:
- Wallet addresses redacted in logs (first 4 + last 4 characters)
- Full wallet addresses available to analysts only

### Entity IDs

**Collection**:
- Entity IDs generated for all tracked entities
- Entity IDs used for cross-referencing
- Entity IDs used for behavioral analysis

**Storage**:
- Entity IDs encrypted at rest (AES-256)
- Entity IDs stored in entity table
- Entity IDs linked to intelligence data

**Retention**:
- Entity IDs retained for 3 years (non-CJIS)
- Entity IDs retained indefinitely (CJIS)

**Redaction**:
- Entity IDs redacted in logs (partial redaction)
- Full entity IDs available to analysts only

### Metadata

**Collection**:
- Metadata collected for all intelligence events
- Metadata includes: timestamp, source, classification, confidence
- Metadata used for intelligence fusion

**Storage**:
- Metadata encrypted at rest (AES-256)
- Metadata stored in intelligence table
- Metadata linked to intelligence records

**Retention**:
- Metadata retained for 3 years (non-CJIS)
- Metadata retained indefinitely (CJIS)

**Redaction**:
- Metadata redacted in logs (sensitive fields only)
- Full metadata available to analysts only

### Financial Patterns

**Collection**:
- Financial patterns detected by intelligence engines
- Patterns include: transaction volumes, frequencies, amounts
- Patterns used for manipulation detection

**Storage**:
- Financial patterns encrypted at rest (AES-256)
- Financial patterns stored in intelligence table
- Financial patterns linked to entity profiles

**Retention**:
- Financial patterns retained for 3 years (non-CJIS)
- Financial patterns retained indefinitely (CJIS)

**Redaction**:
- Financial patterns redacted in logs (amounts redacted to ranges)
- Full financial patterns available to analysts only

---

## Privacy-by-Design Principles

GhostQuant implements privacy-by-design principles throughout the platform:

### 1. Data Minimization

**Principle**: Collect only the minimum data necessary for intelligence operations.

**Implementation**:
- Only essential blockchain data collected
- PII not collected unless required for investigation
- Unnecessary metadata discarded
- Data collection reviewed quarterly

### 2. Purpose Limitation

**Principle**: Data used only for specified intelligence purposes.

**Implementation**:
- Data tagged with purpose (threat detection, investigation, etc.)
- Cross-purpose data use prohibited
- Purpose changes require approval
- Purpose logged to Genesis Archive™

### 3. Storage Limitation

**Principle**: Data retained only as long as necessary.

**Implementation**:
- Retention policies by data tier
- Automatic deletion after retention period
- Legal hold for active investigations
- Retention reviewed annually

### 4. Accuracy

**Principle**: Data must be accurate and up-to-date.

**Implementation**:
- Data validation at ingestion
- Data quality checks (automated)
- Data corrections logged to Genesis Archive™
- Data accuracy reviewed quarterly

### 5. Integrity and Confidentiality

**Principle**: Data must be protected from unauthorized access and modification.

**Implementation**:
- Encryption at rest and in transit
- Access control (RBAC)
- Audit logging (Genesis Archive™)
- Integrity verification (SHA256)

### 6. Accountability

**Principle**: Data processing must be auditable and accountable.

**Implementation**:
- Comprehensive audit logging (Genesis Archive™)
- Immutable audit trail
- Regular compliance audits
- Accountability reviews quarterly

### 7. Transparency

**Principle**: Data processing must be transparent to users.

**Implementation**:
- Privacy policy published
- Data handling procedures documented
- User notifications for data access
- Transparency reports published annually

---

## Data Breach Response

### Breach Detection

**Detection Mechanisms**:
- Sentinel Console real-time monitoring
- Automated anomaly detection
- Intrusion detection systems (IDS)
- User-reported incidents

### Breach Notification

**Notification Timeline**:
- Internal notification: Immediate
- FBI CJIS Division notification: Within 24 hours
- Affected users notification: Within 72 hours
- Public disclosure: As required by law

**Notification Content**:
- Nature of breach
- Data types affected
- Number of records affected
- Remediation actions taken
- Contact information for questions

### Breach Remediation

**Remediation Steps**:
1. Containment: Isolate affected systems
2. Eradication: Remove threat from systems
3. Recovery: Restore systems from backups
4. Post-incident analysis: Identify root cause
5. Preventive measures: Implement controls to prevent recurrence

---

## Conclusion

GhostQuant implements comprehensive data handling procedures that meet CJIS Security Policy requirements for Criminal Justice Information. The platform's 4-tier classification system, encryption at rest and in transit, retention and deletion policies, multi-tenant isolation, API security, log handling and redaction, and privacy-by-design principles ensure that CJI is protected throughout its lifecycle.

The Genesis Archive™ immutable audit trail provides permanent documentation of all data handling activities, ensuring accountability and compliance with FBI mandates for intelligence systems handling Criminal Justice Information.

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Next Review**: March 2026  
**Owner**: GhostQuant Security Team  
**Classification**: Internal Use Only

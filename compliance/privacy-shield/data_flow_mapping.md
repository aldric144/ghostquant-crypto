# Data Flow Mapping

**Document ID**: GQ-PRIV-003  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document maps **all data flows** within **GhostQuant™**, documenting the origin, destination, storage location, retention duration, minimization actions, encryption level, access roles, and Genesis Archive™ preservation requirements for each data flow.

This mapping ensures compliance with:

- **GDPR Article 30** — Records of Processing Activities
- **NIST SP 800-53 PT-6** — System of Records Notice (SORN)
- **NIST SP 800-53 PT-7** — Specific Categories of PII
- **SOC 2 CC7.2** — System Monitoring
- **CCPA § 1798.110** — Right to Know
- **FedRAMP TR-1** — Transparency and Privacy Notice

---

## 2. Data Flow Categories

GhostQuant processes data across **8 primary data flow categories**:

1. **User-Submitted Intelligence** — Data submitted by analysts for threat analysis
2. **Uploaded Images** — Visual data processed by Oracle Eye™
3. **API Key Requests** — Authentication credentials for programmatic access
4. **Engine Outputs** — Results from intelligence engines (Fusion, Hydra, Constellation, etc.)
5. **Sentinel System Health** — Security monitoring and alerting data
6. **Genesis Ledger Blocks** — Tamper-evident audit trail records
7. **Authentication Events** — Login, logout, MFA challenges, session management
8. **Access Control Events** — Privilege elevation, role changes, permission grants

---

## 3. Data Flow Mapping

### 3.1 User-Submitted Intelligence

#### Flow 1: Prediction Request (GhostPredictor™)

**Origin**: Analyst Console → Prediction Console (`/terminal/predict`)  
**Destination**: GhostPredictor™ Backend (`/api/predict/`)  
**Storage Location**: Temporary memory buffer (< 60 seconds), then deleted  
**Retention Duration**: Not stored (unless user explicitly saves prediction)  
**Minimization Actions**:
- Only prediction parameters collected (token, timeframe, confidence threshold)
- No IP address, device fingerprint, or session history collected
- Prediction results stored for 30 days if saved, then deleted

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: Not applicable (not stored)

**Access Roles**: Analyst, Senior Analyst, Admin, SuperAdmin  
**Genesis Preservation**: No (unless prediction flagged as critical threat intelligence)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| Token symbol | String | Required for prediction | Not stored |
| Timeframe | String | Required for prediction | Not stored |
| Confidence threshold | Float | Required for prediction | Not stored |
| User ID | UUID | Required for access control | Not stored |
| Timestamp | DateTime | Required for audit | Not stored |

---

#### Flow 2: UltraFusion Request (UltraFusion™)

**Origin**: Analyst Console → Prediction Console (`/terminal/predict`)  
**Destination**: UltraFusion™ Backend (`/api/ultrafusion/`)  
**Storage Location**: Temporary memory buffer (< 60 seconds), then deleted  
**Retention Duration**: Not stored (unless user explicitly saves fusion result)  
**Minimization Actions**:
- Only fusion parameters collected (models to fuse, weights, confidence thresholds)
- No IP address, device fingerprint, or session history collected
- Fusion results stored for 30 days if saved, then deleted

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: Not applicable (not stored)

**Access Roles**: Analyst, Senior Analyst, Admin, SuperAdmin  
**Genesis Preservation**: No (unless fusion flagged as critical threat intelligence)

---

#### Flow 3: Hydra Cluster Detection Request (Hydra™)

**Origin**: Analyst Console → Global Radar (`/terminal/radar`)  
**Destination**: Hydra™ Backend (`/api/hydra/`)  
**Storage Location**: PostgreSQL database (`hydra_clusters` table)  
**Retention Duration**: 3 years (AML/KYC compliance)  
**Minimization Actions**:
- **Pseudonymization**: Wallet addresses hashed to SHA-256 before storage
- **Aggregation**: Transaction metadata aggregated (no individual transaction details)
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Analyst, Senior Analyst, Admin, SuperAdmin  
**Genesis Preservation**: Yes (high-risk clusters preserved in Genesis Archive™)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| Wallet address (pseudonymized) | SHA-256 hash | Pseudonymized | 3 years |
| Transaction metadata | JSON | Aggregated | 3 years |
| Cluster ID | UUID | Required | 3 years |
| Risk score | Float | Required | 3 years |
| User ID | UUID | Required for access control | 3 years |
| Timestamp | DateTime | Required for audit | 3 years |

---

#### Flow 4: Constellation Entity Mapping Request (Constellation™)

**Origin**: Analyst Console → Constellation Map (`/terminal/constellation`)  
**Destination**: Constellation™ Backend (`/api/constellation/`)  
**Storage Location**: PostgreSQL database (`constellation_entities` table)  
**Retention Duration**: 5 years (threat intelligence lifecycle)  
**Minimization Actions**:
- **Pseudonymization**: Entity identifiers hashed to SHA-256
- **Public Data Only**: Only publicly available information collected
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Analyst, Senior Analyst, Admin, SuperAdmin  
**Genesis Preservation**: Yes (critical entity relationships preserved in Genesis Archive™)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| Entity ID (pseudonymized) | SHA-256 hash | Pseudonymized | 5 years |
| Entity attributes | JSON | Public data only | 5 years |
| Relationship metadata | JSON | Required | 5 years |
| User ID | UUID | Required for access control | 5 years |
| Timestamp | DateTime | Required for audit | 5 years |

---

#### Flow 5: Cortex Memory Pattern Request (Cortex™)

**Origin**: Analyst Console → AI Timeline (`/terminal/timeline`)  
**Destination**: Cortex™ Backend (`/api/cortex/`)  
**Storage Location**: PostgreSQL database (`cortex_patterns` table)  
**Retention Duration**: 5 years (threat intelligence lifecycle)  
**Minimization Actions**:
- **Pseudonymization**: Behavioral sequences pseudonymized
- **Aggregation**: Individual events aggregated into patterns
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Analyst, Senior Analyst, Admin, SuperAdmin  
**Genesis Preservation**: Yes (critical memory patterns preserved in Genesis Archive™)

---

### 3.2 Uploaded Images

#### Flow 6: Image Upload (Oracle Eye™)

**Origin**: Analyst Console → Entity Explorer / Token Explorer  
**Destination**: Oracle Eye™ Backend (`/api/oracle/`)  
**Storage Location**: S3-compatible object storage (encrypted)  
**Retention Duration**: 90 days (then automatically deleted)  
**Minimization Actions**:
- **Metadata Stripping**: All EXIF data removed on upload (GPS, camera model, timestamps)
- **Facial Recognition Disabled**: No facial recognition or biometric analysis
- **User Warnings**: Users warned not to upload images containing personal identifiers (IDs, passports)
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (object storage encryption)

**Access Roles**: User who uploaded image (unless shared with team)  
**Genesis Preservation**: No (unless image flagged for forensic preservation)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| Image file | Binary | EXIF stripped | 90 days |
| Image analysis results | JSON | Required | 90 days |
| User ID | UUID | Required for access control | 90 days |
| Upload timestamp | DateTime | Required for audit | 90 days |

---

### 3.3 API Key Requests

#### Flow 7: API Key Generation

**Origin**: Analyst Console → Settings Panel (`/terminal/settings`)  
**Destination**: Authentication Backend (`/api/auth/`)  
**Storage Location**: PostgreSQL database (`api_keys` table)  
**Retention Duration**: Until revoked by user or admin  
**Minimization Actions**:
- API key hashed before storage (bcrypt)
- Only last 4 characters visible to user
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption) + bcrypt hashing

**Access Roles**: User who created API key, Admin, SuperAdmin  
**Genesis Preservation**: Yes (API key creation/revocation logged in Genesis Archive™)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| API key (hashed) | bcrypt hash | Hashed | Until revoked |
| API key name | String | Required | Until revoked |
| User ID | UUID | Required for access control | Until revoked |
| Creation timestamp | DateTime | Required for audit | Until revoked |
| Last used timestamp | DateTime | Required for audit | Until revoked |

---

### 3.4 Engine Outputs

#### Flow 8: Prediction Results (GhostPredictor™)

**Origin**: GhostPredictor™ Backend (`/api/predict/`)  
**Destination**: Analyst Console → Prediction Console (`/terminal/predict`)  
**Storage Location**: PostgreSQL database (`predictions` table) — if user saves  
**Retention Duration**: 30 days (if saved)  
**Minimization Actions**:
- Only prediction results stored (no input parameters)
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: User who created prediction, Admin, SuperAdmin  
**Genesis Preservation**: No (unless prediction flagged as critical threat intelligence)

---

#### Flow 9: Fusion Results (UltraFusion™)

**Origin**: UltraFusion™ Backend (`/api/ultrafusion/`)  
**Destination**: Analyst Console → Prediction Console (`/terminal/predict`)  
**Storage Location**: PostgreSQL database (`fusion_results` table) — if user saves  
**Retention Duration**: 30 days (if saved)  
**Minimization Actions**:
- Only fusion results stored (no input parameters)
- No IP address or device fingerprint collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: User who created fusion, Admin, SuperAdmin  
**Genesis Preservation**: No (unless fusion flagged as critical threat intelligence)

---

#### Flow 10: Cluster Detection Results (Hydra™)

**Origin**: Hydra™ Backend (`/api/hydra/`)  
**Destination**: Analyst Console → Global Radar (`/terminal/radar`)  
**Storage Location**: PostgreSQL database (`hydra_clusters` table)  
**Retention Duration**: 3 years (AML/KYC compliance)  
**Minimization Actions**:
- **Pseudonymization**: Wallet addresses hashed to SHA-256
- **Aggregation**: Transaction metadata aggregated

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Analyst, Senior Analyst, Admin, SuperAdmin  
**Genesis Preservation**: Yes (high-risk clusters preserved in Genesis Archive™)

---

### 3.5 Sentinel System Health

#### Flow 11: Security Alerts (Sentinel Command Console™)

**Origin**: Sentinel Backend (`/api/sentinel/`)  
**Destination**: Analyst Console → Sentinel Dashboard (`/terminal/sentinel`)  
**Storage Location**: PostgreSQL database (`sentinel_alerts` table)  
**Retention Duration**: 1 year  
**Minimization Actions**:
- Only security-relevant events logged
- **IP Hashing**: IP addresses hashed after 30 days
- No full session history collected

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Admin, SuperAdmin  
**Genesis Preservation**: Yes (critical security alerts preserved in Genesis Archive™)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| Alert ID | UUID | Required | 1 year |
| Alert type | String | Required | 1 year |
| Severity | String | Required | 1 year |
| IP address (hashed after 30 days) | SHA-256 hash | Hashed | 1 year |
| User ID | UUID | Required for access control | 1 year |
| Timestamp | DateTime | Required for audit | 1 year |

---

### 3.6 Genesis Ledger Blocks

#### Flow 12: Genesis Archive™ Preservation

**Origin**: All GhostQuant systems  
**Destination**: Genesis Archive™ Backend (`/api/genesis/`)  
**Storage Location**: PostgreSQL database (`genesis_blocks` table) — append-only  
**Retention Duration**: **Permanent** (regulatory compliance, forensic evidence)  
**Minimization Actions**:
- **Minimal Logging**: Only critical events logged in Genesis Archive™
- **Pseudonymization**: User IDs pseudonymized where possible
- No unnecessary personal data logged

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: SuperAdmin (read-only)  
**Genesis Preservation**: Yes (Genesis Archive™ is self-preserving)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| Block ID | UUID | Required | Permanent |
| Event type | String | Required | Permanent |
| Event data | JSON | Minimal | Permanent |
| User ID (pseudonymized) | SHA-256 hash | Pseudonymized | Permanent |
| Timestamp | DateTime | Required | Permanent |
| Cryptographic hash | SHA-256 | Required for integrity | Permanent |

---

### 3.7 Authentication Events

#### Flow 13: User Login

**Origin**: Frontend Login Page (`/login`)  
**Destination**: Authentication Backend (`/api/auth/login`)  
**Storage Location**: PostgreSQL database (`auth_logs` table)  
**Retention Duration**: 1 year  
**Minimization Actions**:
- **IP Hashing**: IP addresses hashed after 30 days
- **Device Fingerprint**: Deleted after 1 year
- No password stored (only bcrypt hash)

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Admin, SuperAdmin  
**Genesis Preservation**: Yes (privileged user logins preserved in Genesis Archive™)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| User ID | UUID | Required | 1 year |
| IP address (hashed after 30 days) | SHA-256 hash | Hashed | 1 year |
| Device fingerprint | String | Deleted after 1 year | 1 year |
| Login timestamp | DateTime | Required | 1 year |
| MFA method | String | Required | 1 year |
| Success/failure | Boolean | Required | 1 year |

---

#### Flow 14: MFA Challenge

**Origin**: Frontend Login Page (`/login`)  
**Destination**: Authentication Backend (`/api/auth/mfa`)  
**Storage Location**: PostgreSQL database (`mfa_logs` table)  
**Retention Duration**: 1 year  
**Minimization Actions**:
- MFA token not stored (only verification result)
- **IP Hashing**: IP addresses hashed after 30 days

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Admin, SuperAdmin  
**Genesis Preservation**: Yes (MFA failures preserved in Genesis Archive™)

---

#### Flow 15: Session Management

**Origin**: Authentication Backend (`/api/auth/`)  
**Destination**: Frontend (session cookie)  
**Storage Location**: Redis (in-memory cache)  
**Retention Duration**: Session duration (max 24 hours)  
**Minimization Actions**:
- Session token deleted immediately on logout
- Expired session tokens deleted automatically

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: Redis encryption (AES-256)

**Access Roles**: User who owns session  
**Genesis Preservation**: No (unless session associated with security incident)

---

### 3.8 Access Control Events

#### Flow 16: Privilege Elevation

**Origin**: Analyst Console → Settings Panel (`/terminal/settings`)  
**Destination**: Access Control Backend (`/api/access/`)  
**Storage Location**: PostgreSQL database (`access_logs` table)  
**Retention Duration**: 7 years (regulatory compliance)  
**Minimization Actions**:
- Only privilege elevation events logged (not all access events)
- **IP Hashing**: IP addresses hashed after 30 days

**Encryption Level**:
- **In-Transit**: TLS 1.3 (HTTPS)
- **At-Rest**: AES-256 (database encryption)

**Access Roles**: Admin, SuperAdmin  
**Genesis Preservation**: Yes (all privilege elevation events preserved in Genesis Archive™)

**Data Elements**:
| Element | Type | Minimization | Retention |
|---------|------|--------------|-----------|
| User ID | UUID | Required | 7 years |
| Old role | String | Required | 7 years |
| New role | String | Required | 7 years |
| Approver ID | UUID | Required | 7 years |
| IP address (hashed after 30 days) | SHA-256 hash | Hashed | 7 years |
| Timestamp | DateTime | Required | 7 years |

---

## 4. System-Wide Data Flow Map Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GhostQuant Data Flow Map                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Analyst Console │ (Frontend)
│  - Prediction    │
│  - Radar         │
│  - Constellation │
│  - Timeline      │
│  - Sentinel      │
│  - Settings      │
└────────┬─────────┘
         │ TLS 1.3 (HTTPS)
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      API Gateway (FastAPI)                            │
│  - Authentication (JWT + MFA)                                         │
│  - Rate Limiting                                                      │
│  - Request Validation                                                 │
└────────┬─────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────────────────────────────────────────┐
         │                                                              │
         ▼                                                              ▼
┌─────────────────────┐                                    ┌──────────────────────┐
│  Intelligence       │                                    │  Security &          │
│  Engines            │                                    │  Compliance          │
│                     │                                    │                      │
│  - GhostPredictor™  │                                    │  - Sentinel™         │
│  - UltraFusion™     │                                    │  - Genesis Archive™  │
│  - Hydra™           │                                    │  - Access Control    │
│  - Constellation™   │                                    │  - Audit Logging     │
│  - Cortex™          │                                    │                      │
│  - Oracle Eye™      │                                    │                      │
└────────┬────────────┘                                    └──────────┬───────────┘
         │                                                            │
         │ AES-256 Encryption                                         │ AES-256 Encryption
         │                                                            │
         ▼                                                            ▼
┌─────────────────────┐                                    ┌──────────────────────┐
│  Data Storage       │                                    │  Audit Storage       │
│                     │                                    │                      │
│  - PostgreSQL       │                                    │  - Genesis Blocks    │
│    (Encrypted)      │                                    │    (Append-Only)     │
│  - Redis Cache      │                                    │  - Sentinel Alerts   │
│  - S3 Object Store  │                                    │  - Access Logs       │
│    (Images)         │                                    │                      │
└─────────────────────┘                                    └──────────────────────┘

Data Flow Legend:
─────────────────────
→  Data flows from left to right
│  Vertical connections
▼  Data flows downward
TLS 1.3: Encryption in-transit
AES-256: Encryption at-rest
```

---

## 5. Data Flow Summary Table

| Flow ID | Data Type | Origin | Destination | Storage | Retention | Encryption | Genesis |
|---------|-----------|--------|-------------|---------|-----------|------------|---------|
| 1 | Prediction Request | Console | GhostPredictor™ | Temp buffer | Not stored | TLS 1.3 | No |
| 2 | UltraFusion Request | Console | UltraFusion™ | Temp buffer | Not stored | TLS 1.3 | No |
| 3 | Hydra Request | Console | Hydra™ | PostgreSQL | 3 years | TLS 1.3 + AES-256 | Yes |
| 4 | Constellation Request | Console | Constellation™ | PostgreSQL | 5 years | TLS 1.3 + AES-256 | Yes |
| 5 | Cortex Request | Console | Cortex™ | PostgreSQL | 5 years | TLS 1.3 + AES-256 | Yes |
| 6 | Image Upload | Console | Oracle Eye™ | S3 | 90 days | TLS 1.3 + AES-256 | No |
| 7 | API Key Generation | Console | Auth Backend | PostgreSQL | Until revoked | TLS 1.3 + AES-256 + bcrypt | Yes |
| 8 | Prediction Results | GhostPredictor™ | Console | PostgreSQL | 30 days | TLS 1.3 + AES-256 | No |
| 9 | Fusion Results | UltraFusion™ | Console | PostgreSQL | 30 days | TLS 1.3 + AES-256 | No |
| 10 | Cluster Results | Hydra™ | Console | PostgreSQL | 3 years | TLS 1.3 + AES-256 | Yes |
| 11 | Security Alerts | Sentinel™ | Console | PostgreSQL | 1 year | TLS 1.3 + AES-256 | Yes |
| 12 | Genesis Blocks | All Systems | Genesis™ | PostgreSQL | Permanent | TLS 1.3 + AES-256 | Yes |
| 13 | User Login | Frontend | Auth Backend | PostgreSQL | 1 year | TLS 1.3 + AES-256 | Yes |
| 14 | MFA Challenge | Frontend | Auth Backend | PostgreSQL | 1 year | TLS 1.3 + AES-256 | Yes |
| 15 | Session Management | Auth Backend | Frontend | Redis | 24 hours | TLS 1.3 + AES-256 | No |
| 16 | Privilege Elevation | Console | Access Control | PostgreSQL | 7 years | TLS 1.3 + AES-256 | Yes |

---

## 6. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques

---

## 7. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Data Flow Mapping |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, Chief Technology Officer

---

**END OF DOCUMENT**

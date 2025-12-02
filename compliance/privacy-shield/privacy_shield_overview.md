# Privacy Shield Overview

**Document ID**: GQ-PRIV-001  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes the **Privacy Shield Framework** for **GhostQuant™**, a financial-intelligence ecosystem that processes sensitive data including user identities, blockchain wallet addresses, threat intelligence metadata, visual data inputs, session logs, and tamper-evident Genesis Archive™ records.

The Privacy Shield Framework ensures that all personal data processing activities comply with:

- **EU General Data Protection Regulation (GDPR)**
- **U.S. Privacy Shield Principles** (historical framework, principles still applicable)
- **California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)**
- **NIST SP 800-53 Privacy Controls** (PT, AR, IP families)
- **SOC 2 Trust Services Criteria** (CC1, CC7, CC8)
- **FedRAMP Privacy Controls**

GhostQuant operates under a **privacy-first, data-minimization-centric architecture** where personal data is collected only when absolutely necessary, processed transparently, and protected through Zero-Trust Architecture (ZTA) and end-to-end encryption.

---

## 2. Privacy Shield Principles

The Privacy Shield Framework is built on **seven core principles** that govern all personal data processing activities within GhostQuant:

### 2.1 Notice

**Principle**: Individuals must be informed about the collection, use, and disclosure of their personal data.

**GhostQuant Implementation**:
- **Privacy Notice** displayed at account creation and login
- **Data Processing Transparency** — users informed of:
  - What data is collected (identity, IP address, device fingerprint, session logs, uploaded images)
  - Why data is collected (authentication, threat analysis, audit logging, Genesis Archive preservation)
  - How long data is retained (see `data_retention_schedule.md`)
  - Who has access (see `access_control_policy.md` in identity-zero-trust framework)
- **Engine-Specific Notices** — users informed when submitting data to:
  - **UltraFusion™** (prediction requests)
  - **Hydra™** (cluster detection)
  - **Constellation™** (entity mapping)
  - **Cortex™** (memory pattern analysis)
  - **Oracle Eye™** (visual intelligence)
  - **Genesis Archive™** (permanent ledger preservation)

### 2.2 Choice

**Principle**: Individuals must have the ability to opt out of certain data processing activities.

**GhostQuant Implementation**:
- **Opt-Out Controls**:
  - Users can disable non-essential analytics
  - Users can request deletion of non-Genesis data (Genesis Archive is immutable for regulatory compliance)
  - Users can limit data sharing with third-party subprocessors
- **Consent Management**:
  - Explicit consent required for:
    - Uploading images containing personal identifiers
    - Cross-border data transfers (EU → U.S.)
    - Sharing threat intelligence with law enforcement (optional)
  - Consent recorded in Genesis Archive for nonrepudiation

### 2.3 Accountability for Onward Transfer

**Principle**: Organizations must ensure that third parties receiving personal data provide the same level of protection.

**GhostQuant Implementation**:
- **Subprocessor Controls**:
  - All subprocessors (cloud providers, API services) must sign **Data Processing Agreements (DPAs)**
  - Subprocessors must comply with GDPR, SOC 2, and NIST 800-53 privacy controls
  - Annual subprocessor audits required
- **Data Transfer Agreements**:
  - **Standard Contractual Clauses (SCCs)** for EU → U.S. transfers
  - **Encryption-in-transit** (TLS 1.3) for all data transfers
  - **Zero-Trust verification** for all cross-border data flows
- **Genesis Ledger Tracking**:
  - All onward transfers logged in Genesis Archive with:
    - Timestamp
    - Destination
    - Data category
    - Legal basis
    - Subprocessor identity

### 2.4 Security

**Principle**: Personal data must be protected against loss, misuse, unauthorized access, disclosure, alteration, and destruction.

**GhostQuant Implementation**:
- **Encryption**:
  - **At-rest**: AES-256 encryption for all stored personal data
  - **In-transit**: TLS 1.3 for all network communications
  - **End-to-end**: Encrypted session tokens, API keys, and privilege credentials
- **Zero-Trust Architecture (ZTA)**:
  - "Never trust, always verify" — continuous identity verification
  - Multi-Factor Authentication (MFA) mandatory for all users
  - FIDO2/WebAuthn required for admins and privileged accounts
  - Session-level identity binding with device fingerprinting
- **Access Controls**:
  - Role-Based Access Control (RBAC) with 7 roles (Viewer, Analyst, Senior Analyst, Admin, SuperAdmin, System, API)
  - Least-privilege principle enforced across all engines
  - Privileged Access Management (PAM) with Four-Eyes Rule for destructive actions
- **Audit Logging**:
  - All access to personal data logged in **Sentinel Command Console™**
  - Tamper-evident logging in **Genesis Archive™**
  - Real-time anomaly detection for unauthorized access attempts
- **Incident Response**:
  - 72-hour breach notification (GDPR Article 33)
  - Automated kill switches for compromised sessions
  - Forensic evidence preservation in Genesis Archive

### 2.5 Data Integrity and Purpose Limitation

**Principle**: Personal data must be accurate, complete, and current, and used only for the purposes for which it was collected.

**GhostQuant Implementation**:
- **Data Accuracy**:
  - Users can update their profile information at any time
  - Automated data validation at ingestion
  - Annual data accuracy reviews
- **Purpose Limitation**:
  - Personal data collected for **specific, explicit, and legitimate purposes**:
    - **Authentication**: User identity, MFA tokens, session logs
    - **Threat Analysis**: Wallet addresses, transaction metadata, uploaded images
    - **Audit Compliance**: Access logs, privilege elevation events, Genesis Archive records
  - **Prohibited Uses**:
    - No behavioral profiling outside threat analysis
    - No sale of personal data to third parties
    - No use of personal data for marketing without explicit consent
- **Data Minimization**:
  - Only collect data that is **absolutely necessary** for the stated purpose
  - Real-time deletion of unnecessary data (see `data_minimization_policy.md`)
  - Pseudonymization of blockchain identifiers (wallet addresses → hashed IDs)

### 2.6 Access

**Principle**: Individuals must have access to their personal data and be able to correct, amend, or delete it.

**GhostQuant Implementation**:
- **Data Subject Rights** (see `data_subject_rights_process.md`):
  - **Right to Access**: Users can request a copy of all personal data held by GhostQuant
  - **Right to Rectification**: Users can correct inaccurate data
  - **Right to Erasure** ("Right to be Forgotten"): Users can request deletion of non-Genesis data
  - **Right to Restriction**: Users can limit processing of their data
  - **Right to Data Portability**: Users can export their data in machine-readable format (JSON)
  - **Right to Object**: Users can object to certain processing activities
- **Response Timeline**:
  - All data subject requests responded to within **30 days** (GDPR Article 12)
  - Identity verification required before fulfilling requests
  - All requests logged in Genesis Archive for compliance tracking

### 2.7 Recourse, Enforcement, and Liability

**Principle**: Individuals must have effective mechanisms to enforce privacy rights and hold organizations accountable.

**GhostQuant Implementation**:
- **Privacy Complaints**:
  - Dedicated privacy complaint channel: privacy@ghostquant.com
  - All complaints logged in Genesis Archive
  - Response within 15 business days
- **Independent Dispute Resolution**:
  - Users can escalate complaints to:
    - **EU Data Protection Authorities (DPAs)**
    - **U.S. Federal Trade Commission (FTC)**
    - **California Attorney General** (CCPA enforcement)
- **Annual Privacy Audits**:
  - Independent third-party privacy audits (SOC 2 Type II)
  - NIST 800-53 privacy control assessments
  - GDPR compliance reviews
- **Liability**:
  - GhostQuant assumes full liability for privacy violations
  - Cyber insurance coverage for data breach incidents
  - Breach notification within 72 hours (GDPR Article 33)

---

## 3. Regulatory Alignment

### 3.1 EU General Data Protection Regulation (GDPR)

**Applicability**: GhostQuant processes personal data of EU residents.

**Key GDPR Requirements**:
- **Lawful Basis for Processing** (Article 6):
  - **Consent**: For non-essential processing (analytics, marketing)
  - **Contract**: For authentication and service delivery
  - **Legal Obligation**: For audit logging and regulatory compliance
  - **Legitimate Interest**: For fraud detection and threat analysis
- **Data Subject Rights** (Articles 15-22):
  - Right to Access, Rectification, Erasure, Restriction, Portability, Objection
  - Implemented via `data_subject_rights_process.md`
- **Data Protection by Design and by Default** (Article 25):
  - Privacy-by-Design principles embedded in all GhostQuant engines (see `privacy_by_design_engineering.md`)
  - Default settings minimize data collection
- **Data Breach Notification** (Article 33):
  - 72-hour notification to supervisory authority
  - Automated breach detection via Sentinel Command Console™
- **Data Protection Impact Assessment (DPIA)** (Article 35):
  - Required for high-risk processing (see `privacy_risk_assessment.md`)
- **Data Protection Officer (DPO)** (Article 37):
  - Designated DPO: dpo@ghostquant.com

**GDPR Compliance Mapping**:
| GDPR Article | Requirement | GhostQuant Control |
|--------------|-------------|-------------------|
| Article 5 | Data Minimization | `data_minimization_policy.md` |
| Article 6 | Lawful Basis | Consent + Contract + Legitimate Interest |
| Article 15-22 | Data Subject Rights | `data_subject_rights_process.md` |
| Article 25 | Privacy by Design | `privacy_by_design_engineering.md` |
| Article 30 | Records of Processing | `personal_data_registry.md` |
| Article 32 | Security of Processing | Zero-Trust Architecture + Encryption |
| Article 33 | Breach Notification | Sentinel + Genesis Archive |
| Article 35 | DPIA | `privacy_risk_assessment.md` |

### 3.2 U.S. Privacy Shield Principles

**Status**: Privacy Shield framework invalidated by EU Court of Justice (Schrems II, 2020), but **principles remain applicable** for U.S.-EU data transfers.

**GhostQuant Implementation**:
- **Standard Contractual Clauses (SCCs)** for EU → U.S. transfers (see `cross_border_data_transfer_policy.md`)
- **Supplementary Measures**:
  - End-to-end encryption for all cross-border transfers
  - Zero-Trust verification for all data flows
  - Data localization options (EU data stored in EU data centers)
- **U.S. Government Access**:
  - GhostQuant does not provide backdoor access to U.S. government agencies
  - All law enforcement requests require valid legal process (warrant, subpoena)
  - Transparency reports published annually

### 3.3 California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)

**Applicability**: GhostQuant processes personal information of California residents.

**Key CCPA/CPRA Requirements**:
- **Right to Know** (CCPA § 1798.100):
  - Users can request disclosure of personal information collected, used, and shared
  - Implemented via `data_subject_rights_process.md`
- **Right to Delete** (CCPA § 1798.105):
  - Users can request deletion of personal information (except Genesis Archive records required for regulatory compliance)
- **Right to Opt-Out** (CCPA § 1798.120):
  - Users can opt out of sale of personal information
  - **GhostQuant does not sell personal information**
- **Right to Non-Discrimination** (CCPA § 1798.125):
  - Users cannot be discriminated against for exercising privacy rights
- **Sensitive Personal Information** (CPRA § 1798.121):
  - Limited use of sensitive personal information (SSN, financial account numbers, biometrics)
  - See `sensitive_data_handling.md` for prohibited data types

**CCPA/CPRA Compliance Mapping**:
| CCPA/CPRA Section | Requirement | GhostQuant Control |
|-------------------|-------------|-------------------|
| § 1798.100 | Right to Know | `data_subject_rights_process.md` |
| § 1798.105 | Right to Delete | `data_subject_rights_process.md` |
| § 1798.110 | Right to Access | `personal_data_registry.md` |
| § 1798.115 | Right to Disclosure | `data_flow_mapping.md` |
| § 1798.120 | Right to Opt-Out | No sale of personal information |
| § 1798.121 | Sensitive PI Limits | `sensitive_data_handling.md` |

### 3.4 NIST SP 800-53 Privacy Controls

**Applicability**: Federal systems and contractors processing personal information.

**Key NIST 800-53 Privacy Control Families**:

#### PT — Personally Identifiable Information (PII) Processing and Transparency
- **PT-1**: Policy and Procedures → `privacy_shield_overview.md`
- **PT-2**: Authority to Process PII → Consent + Contract + Legal Obligation
- **PT-3**: PII Processing Purposes → `data_minimization_policy.md`
- **PT-4**: Consent → `data_subject_rights_process.md`
- **PT-5**: Privacy Notice → Displayed at login and data collection points
- **PT-6**: System of Records Notice (SORN) → `personal_data_registry.md`
- **PT-7**: Specific Categories of PII → `personal_data_registry.md`
- **PT-8**: Computer Matching Requirements → Not applicable (no automated matching with external systems)

#### AR — Accountability, Audit, and Risk Management
- **AR-1**: Governance and Privacy Program → Chief Privacy Officer designated
- **AR-2**: Privacy Impact and Risk Assessment → `privacy_risk_assessment.md`
- **AR-3**: Privacy Requirements for Contractors → Data Processing Agreements (DPAs)
- **AR-4**: Privacy Monitoring and Auditing → Sentinel Command Console™ + Genesis Archive™
- **AR-5**: Privacy Awareness and Training → Annual privacy training for all users
- **AR-6**: Privacy Reporting → `privacy_compliance_report_template.md`
- **AR-7**: Privacy-Enhanced System Design → `privacy_by_design_engineering.md`
- **AR-8**: Accounting of Disclosures → Genesis Archive™ logs all data disclosures

#### IP — Individual Participation and Redress
- **IP-1**: Consent → Explicit consent for non-essential processing
- **IP-2**: Individual Access → `data_subject_rights_process.md`
- **IP-3**: Redress → Privacy complaint channel + independent dispute resolution
- **IP-4**: Complaint Management → All complaints logged in Genesis Archive

**NIST 800-53 Privacy Control Mapping**:
| Control Family | Control | GhostQuant Implementation |
|----------------|---------|--------------------------|
| PT | PT-1, PT-2, PT-3, PT-5, PT-6, PT-7 | Privacy Shield Framework |
| AR | AR-1, AR-2, AR-4, AR-6, AR-7, AR-8 | Privacy Risk Assessment + Genesis Archive |
| IP | IP-1, IP-2, IP-3, IP-4 | Data Subject Rights Process |

### 3.5 SOC 2 Trust Services Criteria

**Applicability**: GhostQuant undergoes annual SOC 2 Type II audits.

**Key SOC 2 Privacy Criteria**:

#### CC1 — Control Environment
- **CC1.1**: Demonstrates commitment to integrity and ethical values
  - Privacy-first culture embedded in GhostQuant engineering
  - Annual privacy training for all employees
  - Privacy Officer reports directly to CEO

#### CC7 — System Operations
- **CC7.2**: Monitors system components
  - Sentinel Command Console™ monitors all access to personal data
  - Real-time anomaly detection for unauthorized access
- **CC7.3**: Evaluates security events
  - Automated alerting for privacy violations
  - Genesis Archive™ preserves all security events

#### CC8 — Change Management
- **CC8.1**: Manages changes to system components
  - Privacy Impact Assessment (PIA) required for all system changes
  - Privacy Officer approval required for changes affecting personal data processing

**SOC 2 Compliance Mapping**:
| SOC 2 Criterion | Requirement | GhostQuant Control |
|-----------------|-------------|-------------------|
| CC1.1 | Integrity and Ethics | Privacy-first culture + annual training |
| CC7.2 | System Monitoring | Sentinel Command Console™ |
| CC7.3 | Security Event Evaluation | Genesis Archive™ + automated alerting |
| CC8.1 | Change Management | Privacy Impact Assessment (PIA) |

### 3.6 FedRAMP Privacy Controls

**Applicability**: Federal agencies using GhostQuant must comply with FedRAMP privacy requirements.

**Key FedRAMP Privacy Controls**:
- **AP-1**: Authority to Collect → Consent + Contract + Legal Obligation
- **AP-2**: Purpose Specification → `data_minimization_policy.md`
- **DI-1**: Data Quality → Annual data accuracy reviews
- **DI-2**: Data Integrity and Data Integrity Board → Genesis Archive™ ensures tamper-evident integrity
- **DM-1**: Minimization of PII → `data_minimization_policy.md`
- **DM-2**: Data Retention and Disposal → `data_retention_schedule.md`
- **IP-1**: Consent → Explicit consent for non-essential processing
- **IP-2**: Individual Access → `data_subject_rights_process.md`
- **IP-3**: Redress → Privacy complaint channel
- **TR-1**: Privacy Notice → Displayed at login and data collection points
- **UL-1**: Internal Use → Personal data used only for stated purposes
- **UL-2**: Information Sharing with Third Parties → Data Processing Agreements (DPAs)

**FedRAMP Privacy Control Mapping**:
| FedRAMP Control | Requirement | GhostQuant Control |
|-----------------|-------------|-------------------|
| AP-1, AP-2 | Authority and Purpose | Consent + Purpose Limitation |
| DI-1, DI-2 | Data Quality and Integrity | Genesis Archive™ |
| DM-1, DM-2 | Minimization and Retention | Data Minimization Policy + Retention Schedule |
| IP-1, IP-2, IP-3 | Individual Participation | Data Subject Rights Process |
| TR-1 | Transparency | Privacy Notice |
| UL-1, UL-2 | Use Limitation | Purpose Limitation + DPAs |

---

## 4. GhostQuant Data Protection

GhostQuant processes the following categories of personal data, each protected through specific technical and organizational measures:

### 4.1 User Identity Data

**Data Elements**:
- Full name
- Email address
- Username
- Password hash (bcrypt, never stored in plaintext)
- MFA tokens (FIDO2/WebAuthn, TOTP)
- Role assignment (Viewer, Analyst, Admin, etc.)

**Protection Measures**:
- **Encryption**: AES-256 at-rest, TLS 1.3 in-transit
- **Access Control**: Only SuperAdmin and System roles can view user identity data
- **Audit Logging**: All access logged in Genesis Archive™
- **Retention**: Retained for duration of account + 7 years (regulatory compliance)
- **Minimization**: Only collect name and email (no phone, address, SSN)

### 4.2 Wallet Addresses

**Data Elements**:
- Blockchain wallet addresses (Bitcoin, Ethereum, etc.)
- Transaction hashes
- Wallet metadata (balance, transaction count, first/last seen)

**Protection Measures**:
- **Pseudonymization**: Wallet addresses hashed to pseudonymous IDs (SHA-256)
- **Minimization**: Only collect wallet addresses submitted by users for threat analysis
- **Access Control**: Analyst role and above can view wallet data
- **Retention**: Retained for 3 years (AML/KYC compliance)
- **Genesis Preservation**: High-risk wallet addresses preserved in Genesis Archive™

### 4.3 Threat Intelligence Metadata

**Data Elements**:
- Threat actor profiles
- Entity relationships (Constellation™ map)
- Behavioral timelines (Cortex™ memory)
- Cluster detection results (Hydra™)
- Risk scores and anomaly flags

**Protection Measures**:
- **Anonymization**: Threat actor profiles do not contain real names unless publicly disclosed
- **Access Control**: Senior Analyst role and above can view threat intelligence
- **Retention**: Retained for 5 years (threat intelligence lifecycle)
- **Genesis Preservation**: Critical threat intelligence preserved in Genesis Archive™

### 4.4 Visual Data Inputs

**Data Elements**:
- Uploaded images (screenshots, charts, documents)
- Image metadata (EXIF data, GPS coordinates, timestamps)
- Oracle Eye™ analysis results

**Protection Measures**:
- **Metadata Sanitization**: All EXIF data stripped on upload (see `sensitive_data_handling.md`)
- **Encryption**: AES-256 at-rest, TLS 1.3 in-transit
- **Access Control**: Only user who uploaded image can view it (unless shared with team)
- **Retention**: Retained for 90 days, then automatically deleted (unless flagged for Genesis preservation)
- **Minimization**: Users warned not to upload images containing personal identifiers (IDs, passports, etc.)

### 4.5 Session Logs

**Data Elements**:
- Session ID
- IP address
- Device fingerprint (browser, OS, screen resolution)
- Login timestamp
- Logout timestamp
- Session duration
- Pages visited
- Actions performed (engine requests, API calls)

**Protection Measures**:
- **IP Hashing**: IP addresses hashed after 30 days (see `data_anonymization_pseudonymization.md`)
- **Access Control**: Only Admin and SuperAdmin roles can view session logs
- **Retention**: Retained for 1 year (audit compliance)
- **Genesis Preservation**: Privileged session logs preserved in Genesis Archive™

### 4.6 Genesis Archive™ Records

**Data Elements**:
- Tamper-evident ledger blocks
- Critical events (privilege elevation, data deletion, breach attempts)
- Audit trails (who accessed what, when, why)
- Compliance evidence (consent records, data subject requests)

**Protection Measures**:
- **Immutability**: Genesis Archive™ is append-only, cannot be modified or deleted
- **Encryption**: AES-256 at-rest, TLS 1.3 in-transit
- **Access Control**: Only SuperAdmin role can view Genesis Archive™ (read-only)
- **Retention**: **Permanent** (regulatory compliance, forensic evidence)
- **Integrity**: Cryptographic hashing (SHA-256) ensures tamper-evidence

**Genesis Archive Privacy Considerations**:
- Genesis Archive™ contains **minimal personal data** (only what is required for regulatory compliance)
- Personal data in Genesis Archive™ **cannot be deleted** (right to erasure does not apply to legal obligations)
- Users informed at account creation that certain actions are permanently logged in Genesis Archive™

---

## 5. Privacy Shield Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GhostQuant Privacy Shield                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
        │  Data Subject  │  │   Privacy   │  │   Regulatory    │
        │     Rights     │  │  by Design  │  │   Compliance    │
        │   (GDPR/CCPA)  │  │  (Article   │  │  (NIST/SOC 2)   │
        │                │  │     25)     │  │                 │
        └───────┬────────┘  └──────┬──────┘  └────────┬────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │  Data Minimization    │
                        │  (Collect only what   │
                        │   is necessary)       │
                        └───────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
        │  Encryption    │  │ Zero-Trust  │  │  Audit Logging  │
        │  (AES-256 +    │  │ Architecture│  │   (Sentinel +   │
        │   TLS 1.3)     │  │   (MFA +    │  │    Genesis)     │
        │                │  │   RBAC)     │  │                 │
        └───────┬────────┘  └──────┬──────┘  └────────┬────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   Personal Data       │
                        │   (User Identity,     │
                        │   Wallet Addresses,   │
                        │   Session Logs, etc.) │
                        └───────────────────────┘
```

---

## 6. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques
- **`cross_border_data_transfer_policy.md`** — International data transfer requirements
- **`privacy_by_design_engineering.md`** — Privacy-by-Design principles in all engines
- **`sensitive_data_handling.md`** — Prohibited data rules and secure handling
- **`privacy_compliance_report_template.md`** — Privacy compliance report template

**Related Compliance Frameworks**:
- **Identity & Access Control**: `/compliance/identity-zero-trust/`
- **Audit Logging**: `/compliance/audit-logging/`
- **Incident Response**: `/compliance/incident-response/`
- **Data Governance**: `/compliance/data-governance/`

---

## 7. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Privacy Shield Overview |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, General Counsel

---

**END OF DOCUMENT**

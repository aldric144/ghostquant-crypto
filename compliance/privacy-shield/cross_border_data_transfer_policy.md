# Cross-Border Data Transfer Policy

**Document ID**: GQ-PRIV-009  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This **Cross-Border Data Transfer Policy** establishes requirements for international data transfers, including **EU/UK → U.S. transfers**, **Standard Contractual Clauses (SCCs)**, **adequacy frameworks**, **data localization rules**, and **encryption/Zero-Trust Architecture (ZTA) requirements**.

This policy ensures compliance with:

- **GDPR Chapter V** — Transfers of Personal Data to Third Countries
- **UK GDPR** — International Data Transfers
- **EU-U.S. Data Privacy Framework** (successor to Privacy Shield)
- **Standard Contractual Clauses (SCCs)** — 2021 EU Commission Decision
- **NIST SP 800-53 AC-4** — Information Flow Enforcement
- **SOC 2 CC6.6** — Logical Access Controls for Data Transfers
- **FedRAMP AC-4** — Information Flow Enforcement

---

## 2. Cross-Border Data Transfer Overview

### 2.1 GhostQuant Data Transfer Scenarios

**GhostQuant may transfer personal data across borders in the following scenarios**:

1. **EU/UK → U.S. Transfers**: European users accessing GhostQuant hosted in U.S. data centers
2. **U.S. → EU/UK Transfers**: U.S. users accessing GhostQuant with EU/UK subprocessors
3. **Subprocessor Transfers**: Data transferred to third-party subprocessors (cloud providers, API services)
4. **Law Enforcement Transfers**: Data transferred to law enforcement agencies (valid legal process required)
5. **Regulatory Transfers**: Data transferred to regulatory authorities (SEC, CFTC, FinCEN, etc.)

### 2.2 Legal Mechanisms for Cross-Border Transfers

**GhostQuant uses the following legal mechanisms for cross-border data transfers**:

1. **Adequacy Decisions** (GDPR Article 45): Transfers to countries with adequate data protection (e.g., EU → UK, EU → Switzerland)
2. **Standard Contractual Clauses (SCCs)** (GDPR Article 46): Transfers to countries without adequacy decisions (e.g., EU → U.S.)
3. **Binding Corporate Rules (BCRs)** (GDPR Article 47): Not applicable (GhostQuant is single entity)
4. **Consent** (GDPR Article 49): User consent for specific transfers (rare)
5. **Necessary for Contract** (GDPR Article 49): Transfers necessary for service delivery

---

## 3. EU/UK → U.S. Transfers

### 3.1 Legal Basis

**GhostQuant uses the following legal mechanisms for EU/UK → U.S. transfers**:

#### 3.1.1 EU-U.S. Data Privacy Framework (DPF)

**Status**: **Active** (successor to Privacy Shield, effective July 2023)

**GhostQuant Certification**:
- ✅ GhostQuant is **self-certified** under EU-U.S. Data Privacy Framework
- ✅ Annual recertification required
- ✅ Compliance with 7 Privacy Shield principles (Notice, Choice, Accountability, Security, Data Integrity, Access, Recourse)

**Benefits**:
- Adequacy decision for EU → U.S. transfers
- No need for Standard Contractual Clauses (SCCs)
- Simplified compliance

**Limitations**:
- Only applies to U.S. companies certified under DPF
- Subject to annual recertification
- May be invalidated by future court rulings (like Schrems II)

#### 3.1.2 Standard Contractual Clauses (SCCs)

**Status**: **Active** (2021 EU Commission Decision)

**GhostQuant Implementation**:
- ✅ SCCs signed with all EU/UK customers
- ✅ SCCs signed with all subprocessors
- ✅ Transfer Impact Assessment (TIA) conducted for all transfers
- ✅ Supplementary measures implemented (encryption, ZTA, data minimization)

**Benefits**:
- Legally binding contract between data exporter (EU/UK) and data importer (U.S.)
- Approved by EU Commission
- Provides legal basis for transfers even if DPF invalidated

**Limitations**:
- Requires Transfer Impact Assessment (TIA)
- Requires supplementary measures (encryption, ZTA)
- Subject to Schrems II requirements (U.S. government access)

#### 3.1.3 Necessary for Contract (GDPR Article 49)

**Status**: **Active** (fallback mechanism)

**GhostQuant Implementation**:
- ✅ Transfers necessary for service delivery (user requests intelligence analysis)
- ✅ User informed at registration that data may be transferred to U.S.
- ✅ User consents to transfers at registration

**Benefits**:
- No need for SCCs or DPF certification
- Applies to transfers necessary for contract performance

**Limitations**:
- Only applies to transfers necessary for service delivery
- Cannot be used for routine transfers
- User must be informed and consent

---

### 3.2 Transfer Impact Assessment (TIA)

**GDPR requires Transfer Impact Assessment (TIA) for all cross-border transfers** (Schrems II ruling):

#### 3.2.1 TIA Process

**Step 1**: Identify data transfer scenario (EU/UK → U.S.)

**Step 2**: Assess legal framework in destination country (U.S.):
- U.S. FISA Section 702 (foreign intelligence surveillance)
- U.S. Executive Order 12333 (intelligence activities)
- U.S. CLOUD Act (law enforcement access to data)

**Step 3**: Assess risk of government access:
- **Low Risk**: GhostQuant is not telecommunications provider or internet service provider (not subject to FISA 702)
- **Medium Risk**: U.S. government may request data via CLOUD Act (requires valid legal process)
- **High Risk**: U.S. government may access data without legal process (unlikely for GhostQuant)

**Step 4**: Implement supplementary measures:
- ✅ **Encryption**: AES-256 at-rest, TLS 1.3 in-transit
- ✅ **Zero-Trust Architecture (ZTA)**: Continuous verification, least privilege
- ✅ **Data Minimization**: Collect only necessary data
- ✅ **Pseudonymization**: Wallet addresses, entity identifiers, IP addresses
- ✅ **Data Localization**: EU/UK data stored in EU/UK data centers (where feasible)
- ✅ **Transparency**: Users informed of transfers at registration

**Step 5**: Document TIA findings:
- Risk assessment
- Supplementary measures
- Residual risk
- Approval by Chief Privacy Officer

**Step 6**: Review TIA annually (or when legal framework changes)

#### 3.2.2 TIA Findings

**Risk Assessment**:
- **Low Risk**: GhostQuant is not subject to FISA 702 (not telecommunications provider)
- **Medium Risk**: U.S. government may request data via CLOUD Act (requires valid legal process)
- **Residual Risk**: Acceptable (supplementary measures implemented)

**Supplementary Measures**:
- ✅ Encryption (AES-256 at-rest, TLS 1.3 in-transit)
- ✅ Zero-Trust Architecture (continuous verification, least privilege)
- ✅ Data Minimization (collect only necessary data)
- ✅ Pseudonymization (wallet addresses, entity identifiers, IP addresses)
- ✅ Transparency (users informed of transfers at registration)

**Conclusion**: **EU/UK → U.S. transfers are compliant with GDPR** (SCCs + supplementary measures)

---

### 3.3 Data Localization

**GhostQuant implements data localization where feasible**:

#### 3.3.1 EU/UK Data Centers

**GhostQuant stores EU/UK user data in EU/UK data centers** (where feasible):

- **Primary Data Center**: AWS eu-west-1 (Ireland)
- **Secondary Data Center**: AWS eu-west-2 (London)
- **Backup Data Center**: AWS us-east-1 (Virginia) — encrypted backups only

**Benefits**:
- EU/UK data remains in EU/UK (reduced transfer risk)
- Faster performance for EU/UK users (lower latency)
- Compliance with data localization requirements

**Limitations**:
- Higher cost (EU/UK data centers more expensive than U.S.)
- Limited availability (not all services available in EU/UK)

#### 3.3.2 U.S. Data Centers

**GhostQuant stores U.S. user data in U.S. data centers**:

- **Primary Data Center**: AWS us-east-1 (Virginia)
- **Secondary Data Center**: AWS us-west-2 (Oregon)
- **Backup Data Center**: AWS eu-west-1 (Ireland) — encrypted backups only

---

## 4. Standard Contractual Clauses (SCCs)

### 4.1 SCC Overview

**Standard Contractual Clauses (SCCs)** are pre-approved contract terms for cross-border data transfers:

- **Approved by**: EU Commission (2021 Decision)
- **Parties**: Data Exporter (EU/UK) and Data Importer (U.S.)
- **Purpose**: Provide legal basis for transfers to countries without adequacy decisions
- **Requirements**: Transfer Impact Assessment (TIA), supplementary measures

### 4.2 SCC Modules

**EU Commission provides 4 SCC modules**:

1. **Module 1**: Controller → Controller
2. **Module 2**: Controller → Processor
3. **Module 3**: Processor → Processor
4. **Module 4**: Processor → Controller

**GhostQuant uses**:
- **Module 2** (Controller → Processor): GhostQuant (controller) → Subprocessors (processors)
- **Module 1** (Controller → Controller): GhostQuant (controller) → Law Enforcement (controller)

### 4.3 SCC Implementation

**GhostQuant signs SCCs with**:

1. **EU/UK Customers**: Module 2 (GhostQuant as processor, customer as controller)
2. **Subprocessors**: Module 2 (GhostQuant as controller, subprocessor as processor)
3. **Law Enforcement**: Module 1 (GhostQuant as controller, law enforcement as controller)

**SCC Terms**:
- Data exporter and data importer details
- Description of data transfer (data categories, purposes, retention)
- Technical and organizational measures (encryption, ZTA, data minimization)
- Subprocessor list (cloud providers, API services)
- Data subject rights (access, rectification, erasure)
- Liability and indemnification
- Governing law and jurisdiction

---

## 5. Adequacy Frameworks

### 5.1 Adequacy Decisions

**EU Commission has issued adequacy decisions for the following countries/regions**:

- **Andorra** (2010)
- **Argentina** (2003)
- **Canada** (commercial organizations) (2001)
- **Faroe Islands** (2010)
- **Guernsey** (2003)
- **Israel** (2011)
- **Isle of Man** (2004)
- **Japan** (2019)
- **Jersey** (2008)
- **New Zealand** (2013)
- **South Korea** (2021)
- **Switzerland** (2000)
- **United Kingdom** (2021)
- **Uruguay** (2012)
- **United States** (EU-U.S. Data Privacy Framework) (2023)

**GhostQuant can transfer data to these countries without SCCs** (adequacy decision provides legal basis).

### 5.2 UK Adequacy Regulations

**UK has issued adequacy regulations for the following countries/regions**:

- **All EU countries** (2021)
- **All countries with EU adequacy decisions** (2021)

**GhostQuant can transfer data from UK to these countries without SCCs**.

---

## 6. No Transfer of Unnecessary Personal Identifiers

**GhostQuant implements data minimization for cross-border transfers**:

### 6.1 Minimization Rules

**Before transferring data across borders, GhostQuant**:

1. **Removes unnecessary personal identifiers** (e.g., full name, email address if not needed)
2. **Pseudonymizes identifiers** (e.g., wallet addresses, entity identifiers, IP addresses)
3. **Aggregates data** (e.g., "80% of users use FIDO2 MFA" instead of individual user data)
4. **Encrypts data** (AES-256 at-rest, TLS 1.3 in-transit)

### 6.2 Transfer Minimization Examples

**Example 1: Threat Intelligence Sharing with Law Enforcement**

**Before Minimization**:
```
User: John Doe (john.doe@example.com)
Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
IP Address: 192.168.1.100
Timestamp: 2025-12-01 14:32:15 UTC
```

**After Minimization**:
```
User: [REDACTED]
Wallet Address: Wallet A (pseudonymized)
IP Address: [REDACTED]
Timestamp: 2025-12-01 (date only)
```

**Example 2: Subprocessor Transfer (Cloud Provider)**

**Before Minimization**:
```
User: John Doe (john.doe@example.com)
Session Duration: 45 minutes
Pages Visited: ["/terminal/predict", "/terminal/radar"]
```

**After Minimization**:
```
User: uuid-12345 (pseudonymized)
Session Duration: 45 minutes
Pages Visited: [aggregated across all users]
```

---

## 7. Encryption and ZTA Requirements

**All cross-border data transfers must be encrypted**:

### 7.1 Encryption Requirements

**In-Transit Encryption**:
- ✅ **TLS 1.3** (minimum)
- ✅ **Perfect Forward Secrecy (PFS)** enabled
- ✅ **Strong cipher suites** (AES-256-GCM, ChaCha20-Poly1305)

**At-Rest Encryption**:
- ✅ **AES-256** (minimum)
- ✅ **Key management** (AWS KMS, separate key per data center)
- ✅ **Key rotation** (annual)

### 7.2 Zero-Trust Architecture (ZTA) Requirements

**All cross-border data transfers must comply with ZTA principles**:

- ✅ **Never trust, always verify**: Continuous identity verification
- ✅ **Least privilege**: Users can only access data they need
- ✅ **Assume breach**: Encrypt data even within trusted networks
- ✅ **Verify explicitly**: Multi-factor authentication (MFA) required
- ✅ **Use least privileged access**: Role-Based Access Control (RBAC)

---

## 8. Genesis Ledger Integrity Rules

**Genesis Archive™ records are subject to special cross-border transfer rules**:

### 8.1 Genesis Archive™ Transfer Rules

**Genesis Archive™ records**:
- ✅ **Encrypted at-rest** (AES-256)
- ✅ **Encrypted in-transit** (TLS 1.3)
- ✅ **Immutable** (cannot be modified or deleted)
- ✅ **Tamper-evident** (cryptographic hashing ensures integrity)
- ✅ **Replicated across data centers** (U.S., EU, UK)

**Cross-Border Transfer**:
- ✅ Genesis Archive™ records replicated to all data centers (U.S., EU, UK)
- ✅ Replication encrypted (TLS 1.3)
- ✅ Replication integrity verified (cryptographic hashing)
- ✅ Replication logged (Genesis Archive™ self-monitoring)

**Legal Basis**:
- **Legal Obligation** (GDPR Article 6(1)(c)): Genesis Archive™ required for regulatory compliance (CJIS, NIST 800-53, SOC 2)
- **Legitimate Interest** (GDPR Article 6(1)(f)): Genesis Archive™ required for security monitoring and forensic evidence

---

## 9. Subprocessor Controls

**GhostQuant uses subprocessors for cloud hosting, API services, and other infrastructure**:

### 9.1 Subprocessor List

| Subprocessor | Service | Location | Data Transferred | Legal Basis |
|--------------|---------|----------|------------------|-------------|
| **Amazon Web Services (AWS)** | Cloud hosting | U.S., EU, UK | All user data | SCCs (Module 2) |
| **Upstash** | Redis (message bus) | U.S. | Intelligence alerts, session data | SCCs (Module 2) |
| **Vercel** | Frontend hosting | U.S. | No personal data (static assets only) | N/A |
| **GitHub** | Code repository | U.S. | No personal data (code only) | N/A |

### 9.2 Subprocessor Requirements

**All subprocessors must**:

1. **Sign Data Processing Agreement (DPA)**: Legally binding contract
2. **Sign Standard Contractual Clauses (SCCs)**: EU Commission approved terms
3. **Implement encryption**: AES-256 at-rest, TLS 1.3 in-transit
4. **Implement access controls**: Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA)
5. **Conduct security audits**: SOC 2 Type II, ISO 27001, or equivalent
6. **Notify GhostQuant of breaches**: Within 24 hours
7. **Allow GhostQuant audits**: Annual audit rights

### 9.3 Subprocessor Approval Process

**Before engaging new subprocessor**:

1. **Due Diligence**: Review subprocessor security practices, certifications, data protection policies
2. **Risk Assessment**: Assess risk of data transfer to subprocessor
3. **DPA Negotiation**: Negotiate Data Processing Agreement (DPA) and Standard Contractual Clauses (SCCs)
4. **Transfer Impact Assessment (TIA)**: Conduct TIA for cross-border transfers
5. **Approval**: Chief Privacy Officer approves subprocessor
6. **Customer Notification**: Notify customers of new subprocessor (30 days advance notice)
7. **Documentation**: Document subprocessor in subprocessor register

---

## 10. International Routing Diagrams

### 10.1 EU/UK User → U.S. Data Center

```
┌─────────────────────────────────────────────────────────────┐
│           EU/UK User → U.S. Data Center Transfer             │
└─────────────────────────────────────────────────────────────┘

EU/UK User (London)
   ↓ (TLS 1.3 encrypted)
   ↓
AWS CloudFront CDN (eu-west-2, London)
   ↓ (TLS 1.3 encrypted)
   ↓
AWS API Gateway (us-east-1, Virginia)
   ↓ (TLS 1.3 encrypted)
   ↓
GhostQuant Backend (us-east-1, Virginia)
   ↓ (AES-256 encrypted at-rest)
   ↓
AWS RDS PostgreSQL (us-east-1, Virginia)

Legal Basis:
- EU-U.S. Data Privacy Framework (DPF)
- Standard Contractual Clauses (SCCs)
- Transfer Impact Assessment (TIA) conducted
- Supplementary measures: Encryption, ZTA, Data Minimization
```

---

### 10.2 U.S. User → EU Data Center (Backup)

```
┌─────────────────────────────────────────────────────────────┐
│           U.S. User → EU Data Center Transfer                │
└─────────────────────────────────────────────────────────────┘

U.S. User (New York)
   ↓ (TLS 1.3 encrypted)
   ↓
AWS CloudFront CDN (us-east-1, Virginia)
   ↓ (TLS 1.3 encrypted)
   ↓
AWS API Gateway (us-east-1, Virginia)
   ↓ (TLS 1.3 encrypted)
   ↓
GhostQuant Backend (us-east-1, Virginia)
   ↓ (AES-256 encrypted at-rest)
   ↓
AWS RDS PostgreSQL (us-east-1, Virginia)
   ↓ (TLS 1.3 encrypted backup replication)
   ↓
AWS RDS PostgreSQL (eu-west-1, Ireland) — Backup Only

Legal Basis:
- No GDPR restrictions (U.S. → EU transfer)
- Encryption required (AES-256 at-rest, TLS 1.3 in-transit)
```

---

### 10.3 Genesis Archive™ Replication (U.S. ↔ EU ↔ UK)

```
┌─────────────────────────────────────────────────────────────┐
│         Genesis Archive™ Replication (Multi-Region)          │
└─────────────────────────────────────────────────────────────┘

Genesis Archive™ (us-east-1, Virginia)
   ↓ (TLS 1.3 encrypted replication)
   ↓
Genesis Archive™ (eu-west-1, Ireland)
   ↓ (TLS 1.3 encrypted replication)
   ↓
Genesis Archive™ (eu-west-2, London)

Legal Basis:
- Legal Obligation (GDPR Article 6(1)(c)): Required for regulatory compliance
- Legitimate Interest (GDPR Article 6(1)(f)): Required for security monitoring
- Standard Contractual Clauses (SCCs): Signed with AWS
- Encryption: AES-256 at-rest, TLS 1.3 in-transit
- Immutability: Genesis Archive™ is append-only (cannot be modified or deleted)
```

---

## 11. Compliance Mapping

### 11.1 GDPR Chapter V — Transfers of Personal Data to Third Countries

| GDPR Article | Requirement | GhostQuant Implementation |
|--------------|-------------|--------------------------|
| Article 44 | General principle for transfers | Transfers only with legal basis (DPF, SCCs, consent) |
| Article 45 | Transfers on the basis of an adequacy decision | EU-U.S. Data Privacy Framework (DPF) |
| Article 46 | Transfers subject to appropriate safeguards | Standard Contractual Clauses (SCCs) |
| Article 47 | Binding corporate rules | Not applicable (single entity) |
| Article 48 | Transfers not authorised by Union law | No transfers without legal basis |
| Article 49 | Derogations for specific situations | Necessary for contract, consent |

### 11.2 NIST SP 800-53 AC-4 — Information Flow Enforcement

**NIST Requirement**:
> "The information system enforces approved authorizations for controlling the flow of information within the system and between interconnected systems based on [Assignment: organization-defined information flow control policies]."

**GhostQuant Compliance**:
- ✅ Encryption (TLS 1.3 in-transit, AES-256 at-rest)
- ✅ Zero-Trust Architecture (continuous verification, least privilege)
- ✅ Data minimization (remove unnecessary personal identifiers)
- ✅ Subprocessor controls (DPAs, SCCs, audits)

### 11.3 SOC 2 CC6.6 — Logical Access Controls for Data Transfers

**SOC 2 Requirement**:
> "The entity restricts the transmission of data to authorized internal and external users and processes, and protects it during transmission."

**GhostQuant Compliance**:
- ✅ Encryption (TLS 1.3 in-transit)
- ✅ Access controls (RBAC, MFA)
- ✅ Subprocessor controls (DPAs, SCCs)

---

## 12. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`data_anonymization_pseudonymization.md`** — Anonymization and pseudonymization techniques
- **`privacy_by_design_engineering.md`** — Privacy-by-Design principles in all engines

---

## 13. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Cross-Border Data Transfer Policy |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, General Counsel

---

**END OF DOCUMENT**

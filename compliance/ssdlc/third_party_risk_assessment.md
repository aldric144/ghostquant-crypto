# Third-Party Risk Assessment

**Document ID**: GQ-SSDLC-009  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes **third-party risk assessment** requirements for **GhostQuant™**, including **vendor vetting**, **API provider risk scoring**, **geographic risks**, **data-handling assessments**, **encryption & logging requirements for subprocessors**, **continuous monitoring**, **termination procedures**, and **Third-Party Risk Questionnaire template**.

This document ensures compliance with:

- **NIST SP 800-53 SA-9** — External Information System Services
- **NIST SP 800-53 SA-12** — Supply Chain Protection
- **SOC 2 CC9.1** — Vendor Management
- **GDPR Article 28** — Processor Requirements
- **ISO 27001 A.15** — Supplier Relationships

---

## 2. Third-Party Risk Assessment Process

```
┌─────────────────────────────────────────────────────────────────┐
│            Third-Party Risk Assessment Process                   │
└─────────────────────────────────────────────────────────────────┘

Step 1: VENDOR IDENTIFICATION
   ↓
   • Identify need for third-party service
   • Define requirements (functionality, security, compliance)
   • Identify potential vendors
   ↓

Step 2: VENDOR VETTING
   ↓
   • Request vendor documentation (SOC 2, ISO 27001, etc.)
   • Review vendor security practices
   • Review vendor privacy practices
   • Review vendor compliance certifications
   ↓

Step 3: RISK ASSESSMENT
   ↓
   • Assess vendor risk (see risk scoring matrix)
   • Assess data-handling risks
   • Assess geographic risks
   • Assess encryption & logging practices
   ↓

Step 4: VENDOR SELECTION
   ↓
   • Select vendor (CPO approval required for high-risk vendors)
   • Negotiate contract (legal review required)
   • Execute Data Processing Agreement (DPA) if handling personal data
   ↓

Step 5: ONBOARDING
   ↓
   • Configure vendor integration
   • Test vendor integration (staging environment)
   • Deploy vendor integration (production)
   ↓

Step 6: CONTINUOUS MONITORING
   ↓
   • Monitor vendor performance (uptime, response time)
   • Monitor vendor security (security advisories, data breaches)
   • Review vendor compliance (annual SOC 2 report)
   ↓

Step 7: ANNUAL REVIEW
   ↓
   • Review vendor risk assessment (annually)
   • Review vendor contract (annually)
   • Renew or terminate vendor relationship
   ↓

Step 8: TERMINATION (IF NEEDED)
   ↓
   • Terminate vendor contract
   • Delete all data from vendor systems
   • Document termination in Genesis Archive™
```

---

## 3. Vendor Vetting

### 3.1 Vendor Documentation Requirements

**Vendors MUST provide the following documentation**:

- ☐ **SOC 2 Type II Report** (or equivalent: ISO 27001, FedRAMP)
- ☐ **Privacy Policy** (GDPR compliance, data handling practices)
- ☐ **Security Whitepaper** (encryption, access controls, logging)
- ☐ **Compliance Certifications** (GDPR, CCPA, HIPAA, PCI DSS)
- ☐ **Data Processing Agreement (DPA)** (if handling personal data)
- ☐ **Subprocessor List** (if using subprocessors)
- ☐ **Incident Response Plan** (data breach notification procedures)
- ☐ **Business Continuity Plan** (disaster recovery, backup procedures)

### 3.2 Vendor Security Assessment

**Vendors MUST meet the following security requirements**:

#### 3.2.1 Encryption

- ✅ Data encrypted at-rest (AES-256 or equivalent)
- ✅ Data encrypted in-transit (TLS 1.3 or equivalent)
- ✅ Encryption keys managed securely (AWS KMS, Azure Key Vault, or equivalent)

#### 3.2.2 Access Controls

- ✅ Multi-factor authentication (MFA) required for all users
- ✅ Role-based access control (RBAC) implemented
- ✅ Least privilege access enforced
- ✅ Access logs maintained (tamper-evident audit trail)

#### 3.2.3 Logging and Monitoring

- ✅ All access logged (user ID, timestamp, action, result)
- ✅ All security events logged (authentication failures, authorization failures, errors)
- ✅ Logs retained for at least 1 year
- ✅ Logs encrypted (AES-256)

#### 3.2.4 Vulnerability Management

- ✅ Vulnerability scanning conducted regularly (weekly or monthly)
- ✅ Critical/high vulnerabilities remediated within SLA (24 hours / 3 days)
- ✅ Penetration testing conducted annually
- ✅ Security advisories published (for customer-facing vulnerabilities)

#### 3.2.5 Incident Response

- ✅ Incident response plan documented
- ✅ Data breach notification within 72 hours (GDPR requirement)
- ✅ Incident response contact provided (24/7 availability)

### 3.3 Vendor Privacy Assessment

**Vendors MUST meet the following privacy requirements**:

#### 3.3.1 GDPR Compliance

- ✅ GDPR-compliant (if processing EU personal data)
- ✅ Data Processing Agreement (DPA) executed
- ✅ Subprocessor list provided (if using subprocessors)
- ✅ Data subject rights supported (access, rectification, erasure, portability)

#### 3.3.2 Data Minimization

- ✅ Only necessary data collected (data minimization principle)
- ✅ Data retention limits enforced (delete data after retention period)
- ✅ Data anonymization/pseudonymization used (where possible)

#### 3.3.3 Cross-Border Data Transfers

- ✅ Cross-border data transfers compliant (Standard Contractual Clauses, Adequacy Decision)
- ✅ Data localization requirements met (if applicable)

---

## 4. API Provider Risk Scoring

### 4.1 Risk Scoring Matrix

**API providers are scored based on the following criteria**:

| Criterion | Weight | Score (1-5) | Weighted Score |
|-----------|--------|-------------|----------------|
| **Data Sensitivity** | 30% | 1 (Low) - 5 (High) | Weight × Score |
| **Data Volume** | 20% | 1 (Low) - 5 (High) | Weight × Score |
| **Vendor Security Posture** | 25% | 1 (Poor) - 5 (Excellent) | Weight × Score |
| **Vendor Compliance** | 15% | 1 (None) - 5 (Full) | Weight × Score |
| **Geographic Risk** | 10% | 1 (Low) - 5 (High) | Weight × Score |
| **Total** | 100% | | Sum of Weighted Scores |

**Risk Levels**:
- **Low Risk (1.0 - 2.0)**: Minimal oversight required
- **Medium Risk (2.1 - 3.5)**: Regular monitoring required
- **High Risk (3.6 - 5.0)**: Enhanced due diligence required, CPO approval required

### 4.2 Risk Scoring Example: AWS S3

**Vendor**: Amazon Web Services (AWS S3)

| Criterion | Weight | Score | Justification | Weighted Score |
|-----------|--------|-------|---------------|----------------|
| **Data Sensitivity** | 30% | 3 (Medium) | Stores images (Oracle Eye™), may contain sensitive content | 0.9 |
| **Data Volume** | 20% | 4 (High) | Stores thousands of images | 0.8 |
| **Vendor Security Posture** | 25% | 5 (Excellent) | SOC 2, ISO 27001, FedRAMP certified | 1.25 |
| **Vendor Compliance** | 15% | 5 (Full) | GDPR, CCPA, HIPAA compliant | 0.75 |
| **Geographic Risk** | 10% | 2 (Low) | US-based, data stored in US regions | 0.2 |
| **Total** | 100% | | | **3.9 (High Risk)** |

**Risk Level**: High Risk (3.9)  
**Mitigation**: Enhanced due diligence, annual SOC 2 review, encryption at-rest (AES-256), access controls (IAM), logging (CloudTrail)

---

## 5. Geographic Risks

### 5.1 Geographic Risk Assessment

**Geographic risks are assessed based on**:

- **Data Localization Laws**: Does country require data to be stored locally?
- **Government Surveillance**: Does country have broad surveillance powers?
- **Data Protection Laws**: Does country have strong data protection laws (GDPR-equivalent)?
- **Political Stability**: Is country politically stable?
- **Legal System**: Does country have strong rule of law?

### 5.2 Geographic Risk Levels

| Region | Risk Level | Justification | Mitigation |
|--------|------------|---------------|------------|
| **European Union** | Low | GDPR, strong data protection laws | None required |
| **United States** | Low | Strong legal system, CCPA (California) | None required |
| **United Kingdom** | Low | UK GDPR, strong data protection laws | None required |
| **Canada** | Low | PIPEDA, strong data protection laws | None required |
| **Australia** | Low | Privacy Act, strong data protection laws | None required |
| **China** | High | Data localization laws, government surveillance | Avoid storing personal data in China |
| **Russia** | High | Data localization laws, government surveillance | Avoid storing personal data in Russia |

### 5.3 Cross-Border Data Transfer Requirements

**Cross-border data transfers MUST comply with**:

- ✅ **GDPR Article 44-50**: Transfers to third countries (Standard Contractual Clauses, Adequacy Decision)
- ✅ **CCPA**: Transfers to third parties (service provider agreement)
- ✅ **UK GDPR**: Transfers to third countries (International Data Transfer Agreement)

**Approved Transfer Mechanisms**:
- Standard Contractual Clauses (SCCs) — EU Commission approved
- Adequacy Decision — EU Commission approved countries (UK, Canada, Japan, etc.)
- Binding Corporate Rules (BCRs) — For intra-group transfers

---

## 6. Data-Handling Assessments

### 6.1 Data Classification

**Data is classified based on sensitivity**:

| Classification | Description | Examples | Encryption Required |
|----------------|-------------|----------|---------------------|
| **Public** | Data intended for public disclosure | Marketing materials, public documentation | No |
| **Internal** | Data for internal use only | Internal documentation, meeting notes | Yes (TLS 1.3 in-transit) |
| **Confidential** | Sensitive business data | Financial data, strategic plans | Yes (AES-256 at-rest, TLS 1.3 in-transit) |
| **Restricted** | Highly sensitive data | Personal data, passwords, API keys | Yes (AES-256 at-rest, TLS 1.3 in-transit, access controls) |

### 6.2 Data-Handling Requirements by Classification

| Classification | Vendor Requirements |
|----------------|---------------------|
| **Public** | No special requirements |
| **Internal** | TLS 1.3 in-transit, access controls |
| **Confidential** | AES-256 at-rest, TLS 1.3 in-transit, access controls, logging |
| **Restricted** | AES-256 at-rest, TLS 1.3 in-transit, MFA, RBAC, logging, DPA required |

### 6.3 Data Processing Activities

**Vendors MUST document data processing activities**:

- ☐ **Purpose of Processing**: Why is data being processed?
- ☐ **Legal Basis**: What is the legal basis for processing (consent, contract, legitimate interest)?
- ☐ **Data Categories**: What types of data are being processed (personal data, financial data, etc.)?
- ☐ **Data Subjects**: Who are the data subjects (customers, employees, etc.)?
- ☐ **Data Recipients**: Who will receive the data (subprocessors, third parties)?
- ☐ **Data Retention**: How long will data be retained?
- ☐ **Data Deletion**: How will data be deleted after retention period?

---

## 7. Encryption & Logging Requirements for Subprocessors

### 7.1 Subprocessor Definition

**Subprocessor** is a third-party service provider used by a vendor to process data on behalf of GhostQuant.

**Example**: AWS uses third-party data centers to store data (subprocessors).

### 7.2 Subprocessor Requirements

**Vendors MUST**:

- ✅ Provide list of subprocessors (updated quarterly)
- ✅ Obtain GhostQuant approval before adding new subprocessors
- ✅ Ensure subprocessors meet same security/privacy requirements as vendor
- ✅ Execute Data Processing Agreement (DPA) with subprocessors
- ✅ Monitor subprocessor compliance (annual review)

### 7.3 Encryption Requirements for Subprocessors

**Subprocessors MUST**:

- ✅ Encrypt data at-rest (AES-256 or equivalent)
- ✅ Encrypt data in-transit (TLS 1.3 or equivalent)
- ✅ Manage encryption keys securely (AWS KMS, Azure Key Vault, or equivalent)

### 7.4 Logging Requirements for Subprocessors

**Subprocessors MUST**:

- ✅ Log all access (user ID, timestamp, action, result)
- ✅ Log all security events (authentication failures, authorization failures, errors)
- ✅ Retain logs for at least 1 year
- ✅ Encrypt logs (AES-256)
- ✅ Provide logs to GhostQuant (upon request)

---

## 8. Continuous Monitoring

### 8.1 Monitoring Activities

**GhostQuant continuously monitors vendors**:

#### 8.1.1 Performance Monitoring

- ✅ Uptime monitoring (99.9% SLA required)
- ✅ Response time monitoring (< 200ms for API calls)
- ✅ Error rate monitoring (< 0.1% error rate)

#### 8.1.2 Security Monitoring

- ✅ Security advisory monitoring (vendor security bulletins)
- ✅ Data breach monitoring (vendor data breach notifications)
- ✅ Vulnerability monitoring (CVE database, security news)

#### 8.1.3 Compliance Monitoring

- ✅ SOC 2 report review (annual)
- ✅ ISO 27001 certificate review (annual)
- ✅ DPA review (annual)
- ✅ Subprocessor list review (quarterly)

### 8.2 Monitoring Tools

**GhostQuant uses the following monitoring tools**:

- **Sentinel™**: Real-time security monitoring, alerts for vendor security events
- **Genesis Archive™**: Audit trail for all vendor interactions
- **Uptime Robot**: Uptime monitoring for vendor APIs
- **PagerDuty**: Incident alerting for vendor outages

### 8.3 Monitoring Metrics

**GhostQuant tracks the following vendor metrics**:

| Metric | Target | Frequency |
|--------|--------|-----------|
| **Uptime** | 99.9% | Real-time |
| **Response Time** | < 200ms | Real-time |
| **Error Rate** | < 0.1% | Real-time |
| **Security Incidents** | 0 | Monthly |
| **Data Breaches** | 0 | Annually |
| **SOC 2 Compliance** | Pass | Annually |

---

## 9. Termination Procedures

### 9.1 Termination Triggers

**Vendor relationship is terminated if**:

- ✅ Vendor fails to meet SLA (3 consecutive months)
- ✅ Vendor suffers data breach (customer data compromised)
- ✅ Vendor loses compliance certification (SOC 2, ISO 27001)
- ✅ Vendor increases prices beyond acceptable limits
- ✅ GhostQuant no longer needs vendor service

### 9.2 Termination Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vendor Termination Process                    │
└─────────────────────────────────────────────────────────────────┘

Step 1: TERMINATION DECISION
   ↓
   • CPO decides to terminate vendor relationship
   • Termination reason documented
   • Termination timeline defined (30-90 days notice)
   ↓

Step 2: TERMINATION NOTICE
   ↓
   • Send termination notice to vendor (per contract terms)
   • Request data export (all GhostQuant data)
   • Request data deletion confirmation
   ↓

Step 3: DATA EXPORT
   ↓
   • Vendor exports all GhostQuant data
   • GhostQuant verifies data export (completeness, integrity)
   • GhostQuant imports data to new vendor (if applicable)
   ↓

Step 4: DATA DELETION
   ↓
   • Vendor deletes all GhostQuant data
   • Vendor provides data deletion certificate
   • GhostQuant verifies data deletion (audit if needed)
   ↓

Step 5: ACCESS REVOCATION
   ↓
   • Revoke vendor API keys
   • Revoke vendor access to GhostQuant systems
   • Remove vendor from firewall whitelist
   ↓

Step 6: DOCUMENTATION
   ↓
   • Document termination in Genesis Archive™
   • Update vendor inventory
   • Update data flow diagrams
   ↓

Step 7: POST-TERMINATION REVIEW
   ↓
   • Review termination process (lessons learned)
   • Update vendor termination procedures (if needed)
```

### 9.3 Data Deletion Verification

**GhostQuant verifies data deletion by**:

- ✅ Requesting data deletion certificate from vendor
- ✅ Conducting audit (if high-risk vendor)
- ✅ Testing API access (verify data no longer accessible)
- ✅ Reviewing vendor logs (verify data deletion logged)

---

## 10. Third-Party Risk Questionnaire Template

**Use this questionnaire to assess third-party vendors**:

### 10.1 Vendor Information

- **Vendor Name**: _______________
- **Vendor Contact**: _______________
- **Vendor Website**: _______________
- **Service Description**: _______________
- **Data Processed**: _______________

### 10.2 Security Questions

1. **Do you have SOC 2 Type II certification?** ☐ Yes ☐ No
   - If yes, provide report (dated within last 12 months)

2. **Do you have ISO 27001 certification?** ☐ Yes ☐ No
   - If yes, provide certificate

3. **Do you encrypt data at-rest?** ☐ Yes ☐ No
   - If yes, what encryption standard? (AES-256, etc.)

4. **Do you encrypt data in-transit?** ☐ Yes ☐ No
   - If yes, what encryption standard? (TLS 1.3, etc.)

5. **Do you require MFA for all users?** ☐ Yes ☐ No

6. **Do you implement RBAC?** ☐ Yes ☐ No

7. **Do you log all access?** ☐ Yes ☐ No
   - If yes, how long are logs retained? _______________

8. **Do you conduct vulnerability scanning?** ☐ Yes ☐ No
   - If yes, how often? _______________

9. **Do you conduct penetration testing?** ☐ Yes ☐ No
   - If yes, how often? _______________

10. **Have you had any data breaches in the last 3 years?** ☐ Yes ☐ No
    - If yes, provide details: _______________

### 10.3 Privacy Questions

11. **Are you GDPR-compliant?** ☐ Yes ☐ No
    - If yes, provide DPA

12. **Do you use subprocessors?** ☐ Yes ☐ No
    - If yes, provide subprocessor list

13. **Where is data stored geographically?** _______________

14. **Do you support data subject rights (access, rectification, erasure, portability)?** ☐ Yes ☐ No

15. **What is your data retention policy?** _______________

16. **How do you delete data after retention period?** _______________

### 10.4 Compliance Questions

17. **Do you have any other compliance certifications?** ☐ Yes ☐ No
    - If yes, list certifications: _______________

18. **Do you have an incident response plan?** ☐ Yes ☐ No
    - If yes, provide plan

19. **Do you have a business continuity plan?** ☐ Yes ☐ No
    - If yes, provide plan

20. **What is your data breach notification timeline?** _______________

### 10.5 Risk Assessment

**Based on responses, assess vendor risk**:

- **Risk Score**: _____ (1.0 - 5.0)
- **Risk Level**: ☐ Low ☐ Medium ☐ High
- **Approval Required**: ☐ CPO ☐ CISO ☐ CTO
- **Mitigation Measures**: _______________

---

## 11. Compliance Mapping

### 11.1 NIST SP 800-53 SA-9 Compliance

**NIST SP 800-53 SA-9** — External Information System Services

| Control | Requirement | GhostQuant Implementation |
|---------|-------------|--------------------------|
| **SA-9** | External Information System Services | Third-party risk assessment process (this document) |
| **SA-9(1)** | Risk Assessments/Organizational Approvals | Risk scoring matrix, CPO approval for high-risk vendors |
| **SA-9(2)** | Identification of Functions/Ports/Protocols/Services | Data-handling assessments, API documentation |

### 11.2 NIST SP 800-53 SA-12 Compliance

**NIST SP 800-53 SA-12** — Supply Chain Protection

| Control | Requirement | GhostQuant Implementation |
|---------|-------------|--------------------------|
| **SA-12** | Supply Chain Protection | Vendor vetting, continuous monitoring, termination procedures |

### 11.3 SOC 2 CC9.1 Compliance

**SOC 2 CC9.1** — Vendor Management

| Criterion | Requirement | GhostQuant Implementation |
|-----------|-------------|--------------------------|
| **CC9.1** | Vendor Management | Third-party risk assessment, vendor monitoring, vendor termination |

### 11.4 GDPR Article 28 Compliance

**GDPR Article 28** — Processor Requirements

| Requirement | GhostQuant Implementation |
|-------------|--------------------------|
| **Article 28(1)**: Processor only processes data on documented instructions | Data Processing Agreement (DPA) executed with all vendors |
| **Article 28(2)**: Processor ensures confidentiality | Vendor security assessment (encryption, access controls) |
| **Article 28(3)**: Processor implements appropriate technical and organizational measures | Vendor security assessment (SOC 2, ISO 27001) |
| **Article 28(4)**: Processor only engages subprocessors with prior authorization | Subprocessor approval process |

---

## 12. Cross-References

This document is part of the **GhostQuant SSDLC Compliance Framework**. Related documents:

- **`ssdlc_overview.md`** — SSDLC overview and 7 stages
- **`ssdlc_policy.md`** — Core SSDLC policy
- **`data_flow_mapping.md`** — Data flow mapping (third-party data flows)
- **`cross_border_data_transfer_policy.md`** — Cross-border data transfer policy
- **`data_minimization_policy.md`** — Data minimization policy

---

## 13. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Third-Party Risk Assessment |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, Chief Technology Officer

---

**END OF DOCUMENT**

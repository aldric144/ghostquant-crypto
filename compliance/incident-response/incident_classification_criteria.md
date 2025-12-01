# Incident Classification Criteria
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document defines comprehensive criteria for classifying security incidents based on impact, scope, and severity. Proper classification ensures appropriate response, resource allocation, and regulatory compliance.

---

## Classification Dimensions

### 1. Data Impact

**Confidentiality Impact**:
- **None**: No data exposure or unauthorized access
- **Low**: Limited exposure of non-sensitive data
- **Moderate**: Exposure of internal operational data
- **High**: Exposure of sensitive customer or financial data
- **Critical**: Exposure of regulated data (PII, financial records, intelligence data)

**Integrity Impact**:
- **None**: No data modification or corruption
- **Low**: Minor data inconsistencies with no operational impact
- **Moderate**: Data corruption affecting non-critical operations
- **High**: Data corruption affecting critical intelligence or operations
- **Critical**: Tampering with Genesis Archive™ or audit trail

**Availability Impact**:
- **None**: No service disruption
- **Low**: Minor performance degradation (<10% users affected)
- **Moderate**: Significant performance degradation (10-50% users affected)
- **High**: Major service disruption (>50% users affected)
- **Critical**: Complete system outage or data loss

**Data Impact Severity Mapping**:
- Confidentiality Critical OR Integrity Critical = SEV 5
- Confidentiality High OR Integrity High OR Availability Critical = SEV 4
- Confidentiality Moderate OR Integrity Moderate OR Availability High = SEV 3
- Confidentiality Low OR Integrity Low OR Availability Moderate = SEV 2
- All None OR minimal impact = SEV 1

---

### 2. Operational Impact

**Business Operations**:
- **None**: No impact on business operations
- **Low**: Minor operational inefficiency, workarounds available
- **Moderate**: Significant operational disruption, manual processes required
- **High**: Major operational disruption, critical functions impaired
- **Critical**: Complete operational failure, business continuity at risk

**Intelligence Accuracy**:
- **None**: No impact on intelligence accuracy
- **Low**: Minor intelligence inaccuracy (<5% deviation)
- **Moderate**: Moderate intelligence inaccuracy (5-15% deviation)
- **High**: Significant intelligence inaccuracy (15-30% deviation)
- **Critical**: Severe intelligence corruption (>30% deviation)

**Financial Impact**:
- **None**: No financial impact
- **Low**: <$10,000 potential loss
- **Moderate**: $10,000-$100,000 potential loss
- **High**: $100,000-$1,000,000 potential loss
- **Critical**: >$1,000,000 potential loss or regulatory fines

**Operational Impact Severity Mapping**:
- Business Critical OR Intelligence Critical OR Financial Critical = SEV 5
- Business High OR Intelligence High OR Financial High = SEV 4
- Business Moderate OR Intelligence Moderate OR Financial Moderate = SEV 3
- Business Low OR Intelligence Low OR Financial Low = SEV 2
- All None = SEV 1

---

### 3. Intelligence Distortion Impact

**UltraFusion™ Contradiction Impact**:
- **Contradiction score < 0.10**: SEV 1 (Minimal conflict)
- **Contradiction score 0.10-0.19**: SEV 2 (Low conflict)
- **Contradiction score 0.20-0.24**: SEV 2 (Moderate conflict)
- **Contradiction score 0.25-0.49**: SEV 3 (High conflict)
- **Contradiction score ≥ 0.50**: SEV 4 (Critical conflict)

**Operation Hydra™ Coordination Impact**:
- **1-2 heads**: SEV 1-2 (Minimal coordination)
- **3-4 heads**: SEV 3 (Moderate coordination)
- **5-9 heads**: SEV 4 (High coordination)
- **10+ heads**: SEV 5 (Critical coordination)

**Global Radar Heatmap™ Velocity Impact**:
- **Velocity < 0.50**: SEV 1 (Normal velocity)
- **Velocity 0.50-0.64**: SEV 2 (Moderate velocity)
- **Velocity 0.65-0.74**: SEV 3 (High velocity)
- **Velocity ≥ 0.75**: SEV 5 (Critical cross-chain spike)

**Global Constellation Map™ Concentration Impact**:
- **Concentration < 0.40**: SEV 1 (Normal distribution)
- **Concentration 0.40-0.59**: SEV 2 (Moderate concentration)
- **Concentration 0.60-0.79**: SEV 3 (High concentration)
- **Concentration ≥ 0.80**: SEV 5 (Critical supernova)

**Intelligence Distortion Severity Mapping**:
- Any engine ≥ SEV 5 threshold = SEV 5
- Any engine ≥ SEV 4 threshold = SEV 4
- Any engine ≥ SEV 3 threshold = SEV 3
- Any engine ≥ SEV 2 threshold = SEV 2
- All engines normal = SEV 1

---

### 4. Genesis Archive™ Integrity Impact

**Hash Chain Integrity**:
- **No issues**: SEV 1 (Normal operations)
- **Single block warning**: SEV 3 (Potential corruption)
- **Multiple block warnings**: SEV 4 (Significant corruption)
- **Hash chain break**: SEV 5 (Critical integrity breach)
- **Tampering detected**: SEV 5 (Critical security incident)

**Audit Trail Completeness**:
- **Complete**: SEV 1 (Normal operations)
- **Minor gaps (<1% records)**: SEV 2 (Low impact)
- **Moderate gaps (1-5% records)**: SEV 3 (Moderate impact)
- **Significant gaps (5-20% records)**: SEV 4 (High impact)
- **Major gaps (>20% records)**: SEV 5 (Critical impact)

**Cryptographic Verification**:
- **All verified**: SEV 1 (Normal operations)
- **Single verification failure**: SEV 3 (Investigation required)
- **Multiple verification failures**: SEV 4 (Significant concern)
- **Systematic verification failures**: SEV 5 (Critical breach)

**Genesis Integrity Severity Mapping**:
- Hash chain break OR Tampering OR Systematic failures = SEV 5
- Multiple block warnings OR Significant gaps OR Multiple failures = SEV 4
- Single block warning OR Moderate gaps OR Single failure = SEV 3
- Minor gaps = SEV 2
- All normal = SEV 1

---

### 5. Image-Based Risk (Oracle Eye™)

**Document Manipulation Detection**:
- **Confidence < 0.50**: SEV 1 (Low suspicion, monitoring)
- **Confidence 0.50-0.69**: SEV 2 (Moderate suspicion, review)
- **Confidence 0.70-0.84**: SEV 3 (High suspicion, investigation)
- **Confidence ≥ 0.85**: SEV 4 (Confirmed manipulation, fraud)
- **Biometric spoof detected**: SEV 5 (Critical fraud, identity theft)

**Document Type Impact**:
- **Marketing materials**: Lower severity (reduce by 1 level)
- **Internal documents**: Standard severity (no adjustment)
- **KYC documents**: Higher severity (increase by 1 level)
- **Financial documents**: Higher severity (increase by 1 level)
- **Identity documents**: Critical severity (SEV 4 minimum)

**Fraud Impact Assessment**:
- **No financial impact**: Standard severity
- **Potential financial loss <$10K**: Standard severity
- **Potential financial loss $10K-$100K**: Increase by 1 level
- **Potential financial loss >$100K**: Increase by 2 levels
- **Regulatory violation**: SEV 5 (critical)

**Oracle Eye Severity Mapping**:
- Biometric spoof OR Regulatory violation = SEV 5
- Confirmed manipulation + High financial impact = SEV 5
- Confirmed manipulation + KYC/Financial docs = SEV 4
- High suspicion + Identity docs = SEV 4
- High suspicion + Standard docs = SEV 3
- Moderate suspicion = SEV 2
- Low suspicion = SEV 1

---

### 6. Behavioral Evidence Impact (Cortex Memory™ & Actor Profiler™)

**Cortex Memory™ Behavioral Deviation**:
- **1-2σ deviation**: SEV 1 (Normal variance)
- **2-3σ deviation**: SEV 2 (Moderate anomaly)
- **≥3σ deviation**: SEV 3 (Significant anomaly)
- **Pattern break**: SEV 4 (Critical behavioral change)
- **Coordinated pattern break**: SEV 5 (Systematic attack)

**Actor Profiler™ Risk Score**:
- **Risk score < 0.50**: SEV 1 (Low risk)
- **Risk score 0.50-0.69**: SEV 2 (Moderate risk)
- **Risk score 0.70-0.84**: SEV 3 (High risk)
- **Risk score ≥ 0.85**: SEV 4 (Critical risk)
- **Sanctioned entity**: SEV 5 (Regulatory violation)

**Behavioral Evidence Severity Mapping**:
- Sanctioned entity OR Coordinated pattern break = SEV 5
- Pattern break OR Critical risk = SEV 4
- Significant anomaly OR High risk = SEV 3
- Moderate anomaly OR Moderate risk = SEV 2
- Normal variance OR Low risk = SEV 1

---

### 7. Multi-Source Risk Fusion Thresholds

**Cross-Engine Correlation**:

When multiple engines detect related anomalies, severity escalates:

**2 engines at SEV 3+**: Escalate to SEV 4
**3+ engines at SEV 3+**: Escalate to SEV 5
**Any engine at SEV 5**: Maintain SEV 5

**Example Scenarios**:

**Scenario 1: Coordinated Manipulation**
- Hydra: 5 heads detected (SEV 4)
- Radar: Velocity 0.72 (SEV 3)
- Constellation: Concentration 0.65 (SEV 3)
- **Classification**: 3 engines at SEV 3+ = **SEV 5**

**Scenario 2: Fraud Attempt**
- Oracle Eye: Confidence 0.88 (SEV 4)
- Actor Profiler: Risk 0.82 (SEV 3)
- **Classification**: 2 engines at SEV 3+ = **SEV 4**

**Scenario 3: Intelligence Conflict**
- UltraFusion: Contradiction 0.30 (SEV 3)
- Cortex: 3.5σ deviation (SEV 3)
- **Classification**: 2 engines at SEV 3+ = **SEV 4**

---

## Severity Level Definitions

### SEV 1: Minimal Impact
- **Response SLA**: 1 week
- **Notification**: Log only, no immediate notification
- **Response Team**: Sentinel Operator
- **Documentation**: Standard logging in Genesis Archive™

### SEV 2: Low Impact
- **Response SLA**: 72 hours
- **Notification**: Email to Threat Intelligence Lead
- **Response Team**: Sentinel Operator + Threat Intelligence Lead
- **Documentation**: Incident report in Genesis Archive™

### SEV 3: Moderate Impact
- **Response SLA**: 24 hours
- **Notification**: Email + Slack to Incident Commander and Threat Intelligence Lead
- **Response Team**: Incident Commander + Threat Intelligence Lead + Forensic Analyst
- **Documentation**: Comprehensive incident report with evidence preservation

### SEV 4: High Impact
- **Response SLA**: 4 hours
- **Notification**: Email + SMS + Slack to Incident Commander, CISO, Threat Intelligence Lead
- **Response Team**: Full incident response team + Executive notification
- **Documentation**: Detailed forensic report with complete chain of custody

### SEV 5: Critical Impact
- **Response SLA**: 1 hour
- **Notification**: Immediate notification to CEO, Board, CISO, Incident Commander
- **Response Team**: Full incident response team + Executive team + Legal counsel
- **Documentation**: Complete forensic investigation with regulatory reporting

---

## Required Documentation by Severity

### SEV 1-2: Standard Documentation
- Detection timestamp and source
- Initial indicators
- Classification rationale
- Genesis Archive™ entry with SHA-256 hash

### SEV 3: Enhanced Documentation
- All standard documentation
- Detailed impact assessment
- Affected systems and data inventory
- Initial containment actions
- Forensic evidence collection

### SEV 4-5: Comprehensive Documentation
- All enhanced documentation
- Complete forensic analysis
- Chain of custody forms for all evidence
- Regulatory notification assessment
- Executive briefing materials
- Post-incident review report
- Lessons learned documentation

---

## Classification Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                  INCIDENT CLASSIFICATION                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Assess Data      │
                    │ Impact           │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Assess           │
                    │ Operational      │
                    │ Impact           │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Assess           │
                    │ Intelligence     │
                    │ Distortion       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Assess Genesis   │
                    │ Integrity        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check Multi-     │
                    │ Engine           │
                    │ Correlation      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Assign Final     │
                    │ Severity         │
                    │ (SEV 1-5)        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Document in      │
                    │ Genesis Archive™ │
                    └──────────────────┘
```

---

## Regulatory Notification Requirements

### GDPR (72-Hour Clock)
- **Trigger**: Personal data breach affecting EU residents
- **Severity**: SEV 3+ with PII exposure
- **Timeline**: 72 hours from detection
- **Authority**: EU Data Protection Authority

### CCPA
- **Trigger**: Personal information breach affecting California residents
- **Severity**: SEV 3+ with PII exposure
- **Timeline**: Without unreasonable delay
- **Authority**: California Attorney General

### FinCEN SAR
- **Trigger**: Suspicious activity or transactions
- **Severity**: SEV 3+ with financial crime indicators
- **Timeline**: 30 days from detection
- **Authority**: Financial Crimes Enforcement Network

### SEC Cyber Incident Disclosure
- **Trigger**: Material cybersecurity incident
- **Severity**: SEV 4-5 with material impact
- **Timeline**: 4 business days
- **Authority**: Securities and Exchange Commission

---

## Classification Examples

### Example 1: Hydra Cluster Detection
- **Detection**: Hydra detects 7 coordinated heads
- **Data Impact**: None (no data exposure)
- **Operational Impact**: Moderate (intelligence accuracy affected)
- **Intelligence Distortion**: High (7 heads = SEV 4)
- **Genesis Integrity**: Normal
- **Multi-Engine**: Hydra only
- **Final Classification**: **SEV 4**
- **Rationale**: High coordination detected, immediate investigation required

### Example 2: Oracle Eye Fraud
- **Detection**: Oracle Eye confidence 0.92 on KYC document
- **Data Impact**: High (fraudulent identity)
- **Operational Impact**: High (fraud attempt)
- **Intelligence Distortion**: N/A
- **Genesis Integrity**: Normal
- **Multi-Engine**: Oracle Eye only
- **Final Classification**: **SEV 4**
- **Rationale**: Confirmed fraud on critical KYC document

### Example 3: Genesis Integrity Breach
- **Detection**: Hash chain verification failure
- **Data Impact**: Critical (audit trail integrity)
- **Operational Impact**: Critical (compliance at risk)
- **Intelligence Distortion**: N/A
- **Genesis Integrity**: Critical (hash chain break)
- **Multi-Engine**: Genesis only
- **Final Classification**: **SEV 5**
- **Rationale**: Critical audit trail integrity breach, immediate executive notification

### Example 4: Multi-Engine Manipulation
- **Detection**: Hydra 4 heads + Radar velocity 0.68 + Constellation 0.62
- **Data Impact**: Moderate (market data affected)
- **Operational Impact**: High (intelligence accuracy)
- **Intelligence Distortion**: Multiple engines at SEV 3
- **Genesis Integrity**: Normal
- **Multi-Engine**: 3 engines at SEV 3+ = escalate to SEV 5
- **Final Classification**: **SEV 5**
- **Rationale**: Coordinated manipulation across multiple engines

---

## Cross-References

- **Severity Matrix**: See incident_severity_matrix.md for detailed severity definitions
- **Response Playbooks**: See incident_response_playbooks.md for response procedures
- **Identification Procedures**: See incident_identification_procedures.md for detection procedures
- **72-Hour Clock**: See incident_response_policy.md for regulatory notification timeline

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial incident classification criteria |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

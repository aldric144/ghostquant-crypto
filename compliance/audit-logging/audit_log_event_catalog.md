# Audit Log Event Catalog
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This catalog defines all auditable event types in GhostQuant™, including event descriptions, risk impact, required fields, severity classification, and Genesis preservation requirements.

---

## Event Categories

1. Authentication Events
2. Authorization Events
3. Prediction Events
4. Manipulation Detection Events
5. Hydra Head Events
6. Constellation Events
7. Radar Events
8. Actor Profiler Events
9. Model Training / Model Drift Events
10. Genesis Ledger Events
11. System Administration Events
12. Data Access Events
13. Policy Exceptions

---

## Category 1: Authentication Events

### Event 1.1: User Login Success

**Description**: User successfully authenticated to GhostQuant™ system

**Risk Impact**: Low - Normal user access

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- IP Address
- Session ID
- Authentication Method (password, MFA, SSO)
- Geographic Location

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: No (unless flagged)

---

### Event 1.2: User Login Failure

**Description**: User authentication attempt failed

**Risk Impact**: Moderate - Potential unauthorized access attempt

**Required Fields**:
- Timestamp (UTC)
- Username (attempted)
- IP Address
- Failure Reason
- Attempt Count
- Geographic Location

**Severity Classification**: SEV 2 (Low) - Single failure, SEV 3 (Moderate) - Multiple failures

**Genesis Preservation**: Yes (if ≥ 3 failures in 15 minutes)

---

### Event 1.3: User Logout

**Description**: User logged out of GhostQuant™ system

**Risk Impact**: Minimal - Normal user activity

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Session ID
- Session Duration

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: No

---

### Event 1.4: Multi-Factor Authentication (MFA) Success

**Description**: User successfully completed MFA challenge

**Risk Impact**: Low - Enhanced security verification

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- MFA Method (SMS, TOTP, hardware token)
- IP Address

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: No

---

### Event 1.5: Multi-Factor Authentication (MFA) Failure

**Description**: User failed MFA challenge

**Risk Impact**: Moderate - Potential account compromise

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- MFA Method
- Failure Reason
- IP Address

**Severity Classification**: SEV 2 (Low) - Single failure, SEV 3 (Moderate) - Multiple failures

**Genesis Preservation**: Yes (if ≥ 3 failures)

---

### Event 1.6: Password Change

**Description**: User changed password

**Risk Impact**: Low - Normal security maintenance

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Initiated By (self or admin)
- IP Address

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

### Event 1.7: Account Lockout

**Description**: User account locked due to failed authentication attempts

**Risk Impact**: Moderate - Potential brute force attack

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Lockout Reason
- Failed Attempt Count
- IP Addresses (all attempts)

**Severity Classification**: SEV 3 (Moderate)

**Genesis Preservation**: Yes

---

## Category 2: Authorization Events

### Event 2.1: Access Granted

**Description**: User granted access to resource

**Risk Impact**: Low - Normal authorized access

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Resource Type
- Resource ID
- Permission Level
- IP Address

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: No (unless sensitive resource)

---

### Event 2.2: Access Denied

**Description**: User denied access to resource

**Risk Impact**: Moderate - Potential unauthorized access attempt

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Resource Type
- Resource ID
- Denial Reason
- IP Address

**Severity Classification**: SEV 2 (Low) - Single denial, SEV 3 (Moderate) - Multiple denials

**Genesis Preservation**: Yes (if ≥ 5 denials in 1 hour)

---

### Event 2.3: Permission Change

**Description**: User permissions modified

**Risk Impact**: Moderate - Access control change

**Required Fields**:
- Timestamp (UTC)
- Target User ID
- Modified By User ID
- Previous Permissions
- New Permissions
- Change Reason

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

### Event 2.4: Role Assignment

**Description**: User assigned to role

**Risk Impact**: Moderate - Access control change

**Required Fields**:
- Timestamp (UTC)
- Target User ID
- Assigned Role
- Assigned By User ID
- Assignment Reason

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

### Event 2.5: Privilege Escalation

**Description**: User elevated privileges temporarily

**Risk Impact**: High - Elevated access

**Required Fields**:
- Timestamp (UTC)
- User ID
- Previous Role
- Elevated Role
- Escalation Reason
- Escalation Duration
- Approved By

**Severity Classification**: SEV 3 (Moderate)

**Genesis Preservation**: Yes

---

## Category 3: Prediction Events

### Event 3.1: Prediction Request

**Description**: User requested prediction from GhostPredictor™

**Risk Impact**: Low - Normal intelligence operation

**Required Fields**:
- Timestamp (UTC)
- User ID
- Prediction Type (entity, token, chain, event)
- Target Entity/Token/Chain
- Model Used
- Confidence Score

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: No (unless high-risk prediction)

---

### Event 3.2: High-Risk Prediction

**Description**: GhostPredictor™ generated high-risk prediction

**Risk Impact**: High - Potential fraud or manipulation

**Required Fields**:
- Timestamp (UTC)
- Prediction Type
- Target Entity/Token/Chain
- Risk Score (≥ 0.70)
- Model Used
- Confidence Score
- Contributing Factors

**Severity Classification**: SEV 3 (Moderate) - Risk 0.70-0.84, SEV 4 (High) - Risk ≥ 0.85

**Genesis Preservation**: Yes

---

### Event 3.3: Model Prediction Error

**Description**: GhostPredictor™ encountered prediction error

**Risk Impact**: Moderate - Model reliability issue

**Required Fields**:
- Timestamp (UTC)
- Model Name
- Error Type
- Error Message
- Input Parameters
- Stack Trace

**Severity Classification**: SEV 2 (Low) - Single error, SEV 3 (Moderate) - Repeated errors

**Genesis Preservation**: Yes (if repeated)

---

## Category 4: Manipulation Detection Events

### Event 4.1: Wash Trading Detected

**Description**: System detected wash trading pattern

**Risk Impact**: Critical - Market manipulation

**Required Fields**:
- Timestamp (UTC)
- Detection Engine (Radar, Hydra)
- Entity IDs Involved
- Transaction Count
- Volume
- Confidence Score
- Pattern Description

**Severity Classification**: SEV 4 (High) - Confidence ≥ 0.70, SEV 5 (Critical) - Confidence ≥ 0.85

**Genesis Preservation**: Yes

---

### Event 4.2: Volume Spike Detected

**Description**: Abnormal volume spike detected

**Risk Impact**: High - Potential manipulation

**Required Fields**:
- Timestamp (UTC)
- Detection Engine (Radar)
- Chain/Token
- Volume Increase (%)
- Baseline Volume
- Spike Volume
- Velocity Score

**Severity Classification**: SEV 3 (Moderate) - Velocity 0.65-0.74, SEV 5 (Critical) - Velocity ≥ 0.75

**Genesis Preservation**: Yes

---

### Event 4.3: Price Manipulation Detected

**Description**: Price manipulation pattern detected

**Risk Impact**: Critical - Market manipulation

**Required Fields**:
- Timestamp (UTC)
- Detection Engine
- Chain/Token
- Price Change (%)
- Manipulation Type
- Confidence Score
- Entity IDs Involved

**Severity Classification**: SEV 4 (High) - Confidence ≥ 0.70, SEV 5 (Critical) - Confidence ≥ 0.85

**Genesis Preservation**: Yes

---

## Category 5: Hydra Head Events

### Event 5.1: Hydra Cluster Detected

**Description**: Operation Hydra™ detected coordinated actor cluster

**Risk Impact**: High to Critical - Coordinated manipulation

**Required Fields**:
- Timestamp (UTC)
- Cluster ID
- Head Count
- Entity IDs
- Coordination Score
- Behavioral Patterns
- Synchronization Level

**Severity Classification**: SEV 3 (Moderate) - 3-4 heads, SEV 4 (High) - 5-9 heads, SEV 5 (Critical) - ≥ 10 heads

**Genesis Preservation**: Yes

---

### Event 5.2: Hydra Head Added

**Description**: New head added to existing Hydra cluster

**Risk Impact**: High - Cluster expansion

**Required Fields**:
- Timestamp (UTC)
- Cluster ID
- New Head Entity ID
- New Head Count
- Coordination Score
- Addition Reason

**Severity Classification**: SEV 3 (Moderate) - Head count 3-4, SEV 4 (High) - Head count ≥ 5

**Genesis Preservation**: Yes

---

### Event 5.3: Hydra Cluster Dissolved

**Description**: Hydra cluster dissolved or inactive

**Risk Impact**: Low - Cluster ended

**Required Fields**:
- Timestamp (UTC)
- Cluster ID
- Final Head Count
- Dissolution Reason
- Duration Active
- Total Transactions

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

## Category 6: Constellation Events

### Event 6.1: Geographic Concentration Detected

**Description**: Global Constellation Map™ detected geographic concentration

**Risk Impact**: Moderate to Critical - Geographic anomaly

**Required Fields**:
- Timestamp (UTC)
- Region/Country
- Concentration Score
- Entity Count
- Transaction Volume
- Anomaly Type

**Severity Classification**: SEV 2 (Low) - Score 0.40-0.59, SEV 3 (Moderate) - Score 0.60-0.79, SEV 5 (Critical) - Score ≥ 0.80

**Genesis Preservation**: Yes (if score ≥ 0.60)

---

### Event 6.2: Supernova Event

**Description**: Critical geographic concentration (supernova)

**Risk Impact**: Critical - Extreme geographic anomaly

**Required Fields**:
- Timestamp (UTC)
- Region/Country
- Concentration Score (≥ 0.80)
- Entity Count
- Transaction Volume
- Risk Factors

**Severity Classification**: SEV 5 (Critical)

**Genesis Preservation**: Yes

---

### Event 6.3: Geographic Anomaly Resolved

**Description**: Geographic concentration returned to normal

**Risk Impact**: Low - Anomaly resolved

**Required Fields**:
- Timestamp (UTC)
- Region/Country
- Previous Concentration Score
- Current Concentration Score
- Resolution Reason

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

## Category 7: Radar Events

### Event 7.1: Cross-Chain Velocity Spike

**Description**: Global Radar Heatmap™ detected cross-chain velocity spike

**Risk Impact**: High to Critical - Cross-chain manipulation

**Required Fields**:
- Timestamp (UTC)
- Source Chain
- Destination Chain
- Velocity Score
- Transaction Count
- Volume
- Entity IDs

**Severity Classification**: SEV 3 (Moderate) - Velocity 0.65-0.74, SEV 5 (Critical) - Velocity ≥ 0.75

**Genesis Preservation**: Yes

---

### Event 7.2: Heatmap Anomaly

**Description**: Abnormal heatmap pattern detected

**Risk Impact**: Moderate - Potential manipulation

**Required Fields**:
- Timestamp (UTC)
- Anomaly Type
- Affected Chains
- Anomaly Score
- Pattern Description

**Severity Classification**: SEV 2 (Low) - Score 0.50-0.64, SEV 3 (Moderate) - Score ≥ 0.65

**Genesis Preservation**: Yes (if score ≥ 0.65)

---

## Category 8: Actor Profiler Events

### Event 8.1: High-Risk Entity Identified

**Description**: Actor Profiler™ identified high-risk entity

**Risk Impact**: High - High-risk actor

**Required Fields**:
- Timestamp (UTC)
- Entity ID
- Risk Score
- Risk Classification (Predator, Insider, Sanctioned)
- Risk Factors
- Behavioral Patterns

**Severity Classification**: SEV 3 (Moderate) - Risk 0.70-0.84, SEV 4 (High) - Risk ≥ 0.85

**Genesis Preservation**: Yes

---

### Event 8.2: Sanctioned Entity Detected

**Description**: Entity matched sanctions list (OFAC, UN, EU)

**Risk Impact**: Critical - Sanctions violation

**Required Fields**:
- Timestamp (UTC)
- Entity ID
- Sanctions List
- Match Type (exact, fuzzy)
- Match Confidence
- Entity Details

**Severity Classification**: SEV 5 (Critical)

**Genesis Preservation**: Yes

---

### Event 8.3: Entity Risk Score Change

**Description**: Entity risk score changed significantly

**Risk Impact**: Moderate - Risk profile change

**Required Fields**:
- Timestamp (UTC)
- Entity ID
- Previous Risk Score
- New Risk Score
- Change Reason
- Contributing Factors

**Severity Classification**: SEV 2 (Low) - Minor change, SEV 3 (Moderate) - Major change

**Genesis Preservation**: Yes (if major change)

---

## Category 9: Model Training / Model Drift Events

### Event 9.1: Model Training Started

**Description**: GhostPredictor™ model training initiated

**Risk Impact**: Low - Normal model maintenance

**Required Fields**:
- Timestamp (UTC)
- Model Name
- Model Type
- Training Dataset Size
- Training Parameters
- Initiated By

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

### Event 9.2: Model Training Completed

**Description**: Model training completed successfully

**Risk Impact**: Low - Normal model maintenance

**Required Fields**:
- Timestamp (UTC)
- Model Name
- Training Duration
- Final Accuracy
- Validation Metrics
- Model Version

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

### Event 9.3: Model Drift Detected

**Description**: Model performance degradation detected

**Risk Impact**: Moderate to High - Model reliability issue

**Required Fields**:
- Timestamp (UTC)
- Model Name
- Drift Metric
- Drift Threshold
- Current Performance
- Baseline Performance

**Severity Classification**: SEV 2 (Low) - Minor drift, SEV 3 (Moderate) - Moderate drift, SEV 4 (High) - Severe drift

**Genesis Preservation**: Yes

---

### Event 9.4: Champion Model Selected

**Description**: New champion model selected for production

**Risk Impact**: Moderate - Model change

**Required Fields**:
- Timestamp (UTC)
- Previous Champion Model
- New Champion Model
- Selection Criteria
- Performance Comparison
- Approved By

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

### Event 9.5: Model Training Failed

**Description**: Model training encountered error

**Risk Impact**: Moderate - Training failure

**Required Fields**:
- Timestamp (UTC)
- Model Name
- Error Type
- Error Message
- Training Parameters
- Stack Trace

**Severity Classification**: SEV 2 (Low) - Single failure, SEV 3 (Moderate) - Repeated failures

**Genesis Preservation**: Yes (if repeated)

---

## Category 10: Genesis Ledger Events

### Event 10.1: Genesis Block Created

**Description**: New Genesis Archive™ block created

**Risk Impact**: Low - Normal ledger operation

**Required Fields**:
- Timestamp (UTC)
- Block Number
- Block Hash
- Previous Block Hash
- Log Count
- Block Size

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes (self-referential)

---

### Event 10.2: Genesis Integrity Verification Success

**Description**: Genesis hash chain integrity verified

**Risk Impact**: Low - Normal integrity check

**Required Fields**:
- Timestamp (UTC)
- Verification Type (scheduled, manual)
- Block Range Verified
- Verification Result (PASS)
- Verified By

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

### Event 10.3: Genesis Integrity Violation

**Description**: Genesis hash chain integrity violation detected

**Risk Impact**: Critical - Audit trail compromise

**Required Fields**:
- Timestamp (UTC)
- Violation Type
- Affected Block(s)
- Expected Hash
- Actual Hash
- Detection Method

**Severity Classification**: SEV 5 (Critical)

**Genesis Preservation**: Yes (in separate secure location)

---

### Event 10.4: Genesis Block Access

**Description**: User accessed Genesis Archive™ block

**Risk Impact**: Low - Normal audit access

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Block Number(s) Accessed
- Access Purpose
- Access Duration

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: Yes

---

### Event 10.5: Genesis Export

**Description**: Genesis Archive™ data exported

**Risk Impact**: Moderate - Data export

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Export Type (regulatory, audit, investigation)
- Block Range
- Export Destination
- Approved By

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

## Category 11: System Administration Events

### Event 11.1: Configuration Change

**Description**: System configuration modified

**Risk Impact**: Moderate to High - System behavior change

**Required Fields**:
- Timestamp (UTC)
- Admin User ID
- Component Modified
- Previous Configuration
- New Configuration
- Change Reason
- Approved By

**Severity Classification**: SEV 2 (Low) - Minor change, SEV 3 (Moderate) - Major change

**Genesis Preservation**: Yes

---

### Event 11.2: Service Start/Stop

**Description**: System service started or stopped

**Risk Impact**: Moderate - Service availability

**Required Fields**:
- Timestamp (UTC)
- Service Name
- Action (start, stop, restart)
- Initiated By
- Reason

**Severity Classification**: SEV 2 (Low) - Planned, SEV 3 (Moderate) - Unplanned

**Genesis Preservation**: Yes

---

### Event 11.3: User Account Created

**Description**: New user account created

**Risk Impact**: Moderate - Access control

**Required Fields**:
- Timestamp (UTC)
- New User ID
- New Username
- Created By Admin ID
- Initial Role
- Account Type

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

### Event 11.4: User Account Deleted

**Description**: User account deleted

**Risk Impact**: Moderate - Access control

**Required Fields**:
- Timestamp (UTC)
- Deleted User ID
- Deleted Username
- Deleted By Admin ID
- Deletion Reason
- Data Retention Status

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

### Event 11.5: System Backup

**Description**: System backup completed

**Risk Impact**: Low - Normal maintenance

**Required Fields**:
- Timestamp (UTC)
- Backup Type (full, incremental)
- Backup Size
- Backup Location
- Backup Status (success, failure)

**Severity Classification**: SEV 1 (Minimal)

**Genesis Preservation**: No

---

### Event 11.6: System Restore

**Description**: System restored from backup

**Risk Impact**: High - System state change

**Required Fields**:
- Timestamp (UTC)
- Restore Source
- Restore Point
- Restored By Admin ID
- Restore Reason
- Affected Components

**Severity Classification**: SEV 4 (High)

**Genesis Preservation**: Yes

---

## Category 12: Data Access Events

### Event 12.1: Sensitive Data Access

**Description**: User accessed sensitive data

**Risk Impact**: Moderate - Data confidentiality

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Data Type
- Data ID
- Access Method
- IP Address

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes (if high-sensitivity)

---

### Event 12.2: Data Export

**Description**: User exported data from system

**Risk Impact**: Moderate to High - Data exfiltration risk

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Data Type
- Record Count
- Export Format
- Export Destination

**Severity Classification**: SEV 2 (Low) - Small export, SEV 3 (Moderate) - Large export

**Genesis Preservation**: Yes (if large export)

---

### Event 12.3: Data Modification

**Description**: User modified data

**Risk Impact**: Moderate - Data integrity

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Data Type
- Data ID
- Previous Value
- New Value
- Modification Reason

**Severity Classification**: SEV 2 (Low)

**Genesis Preservation**: Yes

---

### Event 12.4: Data Deletion

**Description**: User deleted data

**Risk Impact**: High - Data loss

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Data Type
- Data ID
- Deletion Reason
- Approved By
- Recovery Available

**Severity Classification**: SEV 3 (Moderate)

**Genesis Preservation**: Yes

---

### Event 12.5: Bulk Data Access

**Description**: User accessed large volume of data

**Risk Impact**: High - Potential data exfiltration

**Required Fields**:
- Timestamp (UTC)
- User ID
- Username
- Data Type
- Record Count
- Access Method
- IP Address

**Severity Classification**: SEV 3 (Moderate) - 1000-10000 records, SEV 4 (High) - > 10000 records

**Genesis Preservation**: Yes

---

## Category 13: Policy Exceptions

### Event 13.1: Policy Override

**Description**: Security policy overridden

**Risk Impact**: High - Policy violation

**Required Fields**:
- Timestamp (UTC)
- User ID
- Policy Name
- Override Reason
- Approved By
- Override Duration

**Severity Classification**: SEV 3 (Moderate)

**Genesis Preservation**: Yes

---

### Event 13.2: Emergency Access

**Description**: Emergency access granted (break-glass)

**Risk Impact**: High - Elevated access

**Required Fields**:
- Timestamp (UTC)
- User ID
- Emergency Type
- Access Level Granted
- Approved By
- Emergency Justification

**Severity Classification**: SEV 4 (High)

**Genesis Preservation**: Yes

---

### Event 13.3: Compliance Exception

**Description**: Compliance requirement exception granted

**Risk Impact**: High - Compliance risk

**Required Fields**:
- Timestamp (UTC)
- Exception Type
- Compliance Requirement
- Exception Reason
- Approved By
- Exception Duration
- Compensating Controls

**Severity Classification**: SEV 3 (Moderate)

**Genesis Preservation**: Yes

---

## Event Summary Statistics

**Total Event Types**: 53 events across 13 categories

**By Category**:
- Authentication Events: 7 events
- Authorization Events: 5 events
- Prediction Events: 3 events
- Manipulation Detection Events: 3 events
- Hydra Head Events: 3 events
- Constellation Events: 3 events
- Radar Events: 2 events
- Actor Profiler Events: 3 events
- Model Training / Model Drift Events: 5 events
- Genesis Ledger Events: 5 events
- System Administration Events: 6 events
- Data Access Events: 5 events
- Policy Exceptions: 3 events

**By Severity**:
- SEV 1 (Minimal): 12 events
- SEV 2 (Low): 15 events
- SEV 3 (Moderate): 14 events
- SEV 4 (High): 7 events
- SEV 5 (Critical): 5 events

**Genesis Preservation**:
- Always Preserved: 35 events
- Conditionally Preserved: 10 events
- Not Preserved: 8 events

---

## Cross-References

- **Audit Logging Overview**: See audit_logging_overview.md
- **Audit Log Policy**: See audit_log_policy.md
- **Retention Policy**: See audit_log_retention_policy.md
- **Alerting Rules**: See audit_log_alerting_rules.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial audit log event catalog with 53 event types |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

# Zero-Trust Enforcement Rules
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document defines comprehensive Zero-Trust Architecture (ZTA) enforcement rules for GhostQuant™, implementing "never trust, always verify" principles across 10 rule categories with specific enforcement actions.

---

## Zero-Trust Principles

**Core Principle**: "Never trust, always verify"

**Key Tenets**:
1. Verify explicitly (always authenticate and authorize)
2. Use least-privilege access (minimum permissions required)
3. Assume breach (design for compromise)
4. Inspect and log everything (comprehensive monitoring)
5. Continuous verification (not just at login)

---

## Rule Categories

Zero-Trust enforcement rules are organized into 10 categories:

1. Identity Verification Rules
2. Device Security Rules
3. Location Enforcement Rules
4. Risk-Adaptive Authorization Rules
5. Toxic Combination Prevention Rules
6. Time-Based Access Rules
7. Session Context Rules
8. Micro-Segment Boundary Rules
9. Automated Kill Switch Rules
10. Genesis-Backed Nonrepudiation Rules

---

## Category 1: Identity Verification Rules

### Rule 1.1: Mandatory Authentication

**Rule**: All access requests must be authenticated

**Enforcement**:
- No anonymous access allowed
- No guest accounts allowed
- All users must have unique identity
- All service accounts must have unique identity

**Action on Violation**: DENY access

**Logging**: Log all unauthenticated access attempts

**Genesis Preservation**: Yes (7 years)

---

### Rule 1.2: Mandatory Multi-Factor Authentication

**Rule**: All human users must use MFA

**Enforcement**:
- Password alone insufficient
- MFA required for all roles (Viewer, Analyst, Senior Analyst, Admin, SuperAdmin)
- FIDO2 mandatory for Admin/SuperAdmin
- No MFA bypass allowed

**Action on Violation**: DENY access

**Logging**: Log all MFA failures

**Genesis Preservation**: Yes (1 year)

---

### Rule 1.3: Identity Proofing Required

**Rule**: All new users must complete identity proofing before access granted

**Enforcement**:
- Government-issued ID verification
- Background check (CJIS requirement)
- Employment verification
- Manager approval

**Action on Violation**: DENY account creation

**Logging**: Log all identity proofing attempts

**Genesis Preservation**: Yes (7 years)

---

### Rule 1.4: Continuous Identity Verification

**Rule**: Identity must be continuously verified throughout session

**Enforcement**:
- Session token validated on every request
- Device fingerprint verified on every request
- Risk score recalculated on every request
- Step-up authentication required for sensitive actions

**Action on Violation**: TERMINATE session

**Logging**: Log all identity verification failures

**Genesis Preservation**: Yes (1 year)

---

## Category 2: Device Security Rules

### Rule 2.1: Device Fingerprint Required

**Rule**: All access requests must include device fingerprint

**Enforcement**:
- Device fingerprint generated on login
- Device fingerprint verified on every request
- Device fingerprint mismatch triggers alert

**Action on Violation**: REQUIRE step-up authentication

**Logging**: Log all device fingerprint mismatches

**Genesis Preservation**: Yes (1 year)

---

### Rule 2.2: Device Registration Required

**Rule**: Devices must be registered before trusted

**Enforcement**:
- First login from new device requires registration
- User must confirm device registration
- Unregistered devices considered untrusted (risk +0.2)

**Action on Violation**: REQUIRE email verification + step-up authentication

**Logging**: Log all new device registrations

**Genesis Preservation**: Yes (1 year)

---

### Rule 2.3: Device Trust Expiration

**Rule**: Device trust expires after 90 days of inactivity

**Enforcement**:
- Devices not used within 90 days marked untrusted
- Next login from expired device requires re-registration
- User notified of device trust expiration

**Action on Violation**: REQUIRE device re-registration

**Logging**: Log all device trust expirations

**Genesis Preservation**: Yes (1 year)

---

### Rule 2.4: Compromised Device Block

**Rule**: Access from compromised devices denied

**Enforcement**:
- Devices associated with security incidents blocked
- Devices flagged by security team blocked
- User must use different device

**Action on Violation**: DENY access

**Logging**: Log all compromised device access attempts

**Genesis Preservation**: Yes (7 years)

---

## Category 3: Location Enforcement Rules

### Rule 3.1: Geographic Location Verification

**Rule**: User geographic location must be verified

**Enforcement**:
- IP address geolocation performed on every request
- Location change (different country) triggers alert
- Impossible travel detected (e.g., USA to China in 1 hour)

**Action on Violation**: REQUIRE step-up authentication

**Logging**: Log all location changes

**Genesis Preservation**: Yes (1 year)

---

### Rule 3.2: High-Risk Country Block

**Rule**: Access from high-risk countries denied (unless whitelisted)

**Enforcement**:
- High-risk countries: North Korea, Iran, Syria, Cuba, Russia (sanctioned regions)
- Access denied unless user pre-approved for travel
- VPN usage from high-risk countries flagged

**Action on Violation**: DENY access + alert security team

**Logging**: Log all high-risk country access attempts

**Genesis Preservation**: Yes (7 years)

---

### Rule 3.3: VPN Detection

**Rule**: VPN usage detected and flagged

**Enforcement**:
- VPN IP addresses detected
- VPN usage increases risk score (+0.2)
- Corporate VPN whitelisted (risk +0.0)

**Action on Violation**: INCREASE risk score

**Logging**: Log all VPN usage

**Genesis Preservation**: Yes (1 year)

---

## Category 4: Risk-Adaptive Authorization Rules

### Rule 4.1: Risk Score Calculation

**Rule**: Risk score calculated on every request

**Enforcement**:
- Risk score = base risk + device risk + location risk + behavioral risk + intelligence risk
- Risk score range: 0.0 (no risk) to 1.0 (maximum risk)
- Risk score determines access decision

**Risk Factors**:
- Device fingerprint mismatch: +0.3
- New device: +0.2
- Location change (different country): +0.3
- VPN usage: +0.2
- Velocity anomaly: +0.3
- Concurrent sessions: +0.2
- Failed authentication attempts: +0.1 per attempt
- Hydra cluster association: +0.5
- Constellation supernova alert: +0.4

**Action on Risk Score**:
- Risk < 0.30: ALLOW access
- Risk 0.30-0.49: REQUIRE step-up authentication
- Risk 0.50-0.69: RESTRICT access (read-only)
- Risk 0.70-0.89: TERMINATE session
- Risk ≥ 0.90: TERMINATE session + LOCK account

**Logging**: Log all risk score calculations

**Genesis Preservation**: Yes (1 year)

---

### Rule 4.2: Behavioral Anomaly Detection

**Rule**: Behavioral anomalies trigger risk increase

**Enforcement**:
- Velocity anomaly: Actions faster than humanly possible (+0.3 risk)
- Access pattern anomaly: Unusual resource access (+0.2 risk)
- Time anomaly: Access at unusual time (+0.1 risk)
- Volume anomaly: Excessive data export (+0.3 risk)

**Action on Violation**: INCREASE risk score + REQUIRE step-up authentication

**Logging**: Log all behavioral anomalies

**Genesis Preservation**: Yes (1 year)

---

### Rule 4.3: Intelligence-Driven Risk

**Rule**: Intelligence engine outputs influence risk score

**Enforcement**:
- Hydra cluster association: User entity part of manipulation cluster (+0.5 risk)
- Constellation supernova: User entity part of geographic concentration (+0.4 risk)
- Actor Profiler high-risk: User entity flagged as high-risk actor (+0.3 risk)
- Cortex pattern match: User behavior matches known attack pattern (+0.4 risk)

**Action on Violation**: INCREASE risk score + ALERT security team

**Logging**: Log all intelligence-driven risk increases

**Genesis Preservation**: Yes (7 years)

---

## Category 5: Toxic Combination Prevention Rules

### Rule 5.1: Analyst + Admin Prohibited

**Rule**: User cannot have both Analyst and Admin roles

**Enforcement**:
- System prevents assignment of both roles
- If both roles detected, deny role assignment
- Alert security team

**Action on Violation**: DENY role assignment

**Logging**: Log all toxic combination attempts

**Genesis Preservation**: Yes (7 years)

---

### Rule 5.2: Senior Analyst + SuperAdmin Prohibited

**Rule**: User cannot have both Senior Analyst and SuperAdmin roles

**Enforcement**:
- System prevents assignment of both roles
- If both roles detected, deny role assignment
- Alert security team

**Action on Violation**: DENY role assignment

**Logging**: Log all toxic combination attempts

**Genesis Preservation**: Yes (7 years)

---

### Rule 5.3: Auditor + System Administrator Prohibited

**Rule**: User cannot have both Auditor and System Administrator roles

**Enforcement**:
- System prevents assignment of both roles
- If both roles detected, deny role assignment
- Alert security team

**Action on Violation**: DENY role assignment

**Logging**: Log all toxic combination attempts

**Genesis Preservation**: Yes (7 years)

---

## Category 6: Time-Based Access Rules

### Rule 6.1: Session Idle Timeout

**Rule**: Sessions automatically locked after 15 minutes of inactivity

**Enforcement**:
- System tracks last activity timestamp
- If idle time ≥ 15 minutes, lock session
- User must re-authenticate to unlock

**Action on Violation**: LOCK session

**Logging**: Log all session locks

**Genesis Preservation**: Yes (1 year)

---

### Rule 6.2: Session Absolute Timeout

**Rule**: Sessions automatically terminated after 8 hours

**Enforcement**:
- System tracks session creation timestamp
- If session duration ≥ 8 hours, terminate session
- User must re-authenticate to start new session

**Action on Violation**: TERMINATE session

**Logging**: Log all session terminations

**Genesis Preservation**: Yes (1 year)

---

### Rule 6.3: Privileged Session Timeout

**Rule**: Privileged sessions (Admin/SuperAdmin) automatically terminated after 1 hour

**Enforcement**:
- System tracks privileged session creation timestamp
- If privileged session duration ≥ 1 hour, terminate session
- User must re-authenticate to start new privileged session

**Action on Violation**: TERMINATE session

**Logging**: Log all privileged session terminations

**Genesis Preservation**: Yes (7 years)

---

### Rule 6.4: Time-Limited Privilege Elevation

**Rule**: Privilege elevations automatically revoked after expiration

**Enforcement**:
- Privilege elevation granted for specific duration (1-8 hours)
- System tracks elevation expiration timestamp
- If current time ≥ expiration, revoke elevation
- User must request new elevation if still needed

**Action on Violation**: REVOKE elevation

**Logging**: Log all privilege revocations

**Genesis Preservation**: Yes (7 years)

---

## Category 7: Session Context Rules

### Rule 7.1: Session Context Binding

**Rule**: Sessions bound to specific context (IP, device, location)

**Enforcement**:
- Session token includes context hash
- Context verified on every request
- Context change triggers alert

**Action on Violation**: REQUIRE step-up authentication

**Logging**: Log all context changes

**Genesis Preservation**: Yes (1 year)

---

### Rule 7.2: Concurrent Session Limit

**Rule**: Users limited to 3 concurrent sessions

**Enforcement**:
- System tracks active sessions per user
- If session count > 3, deny new session
- User must terminate existing session

**Action on Violation**: DENY new session

**Logging**: Log all concurrent session violations

**Genesis Preservation**: Yes (1 year)

---

### Rule 7.3: Concurrent Session Location Check

**Rule**: Concurrent sessions from different countries flagged

**Enforcement**:
- System tracks session locations
- If sessions from different countries, increase risk (+0.3)
- Alert security team

**Action on Violation**: INCREASE risk score + ALERT security team

**Logging**: Log all concurrent session location violations

**Genesis Preservation**: Yes (7 years)

---

## Category 8: Micro-Segment Boundary Rules

### Rule 8.1: Frontend → API Gateway Only

**Rule**: Frontend can only communicate with API Gateway

**Enforcement**:
- Frontend cannot directly access backend engines
- Frontend cannot directly access databases
- All requests routed through API Gateway

**Action on Violation**: DENY connection

**Logging**: Log all boundary violations

**Genesis Preservation**: Yes (7 years)

---

### Rule 8.2: API Gateway → Backend Engines (Authorized)

**Rule**: API Gateway can only access authorized backend engines

**Enforcement**:
- API Gateway maintains whitelist of backend engines
- Connections to non-whitelisted engines denied
- All connections use mTLS

**Action on Violation**: DENY connection

**Logging**: Log all boundary violations

**Genesis Preservation**: Yes (7 years)

---

### Rule 8.3: Backend Engines → Genesis Archive™ (Write Only)

**Rule**: Backend engines can only write to Genesis Archive™ (no read)

**Enforcement**:
- Backend engines have append-only access
- Read access denied
- Modify/delete access denied

**Action on Violation**: DENY access

**Logging**: Log all boundary violations

**Genesis Preservation**: Yes (7 years)

---

### Rule 8.4: Human Users → Genesis Archive™ (Read Only with Approval)

**Rule**: Human users can only read Genesis Archive™ (with Four-Eyes approval)

**Enforcement**:
- Human users have read-only access (with approval)
- Write access denied
- Modify/delete access denied

**Action on Violation**: DENY access

**Logging**: Log all boundary violations

**Genesis Preservation**: Yes (7 years)

---

### Rule 8.5: No Cross-Zone Communication

**Rule**: Micro-segments cannot communicate across zones without authorization

**Enforcement**:
- Frontend Zone cannot access Intelligence Engine Zone
- Intelligence Engine Zone cannot access Frontend Zone
- All cross-zone communication routed through API Gateway

**Action on Violation**: DENY connection

**Logging**: Log all boundary violations

**Genesis Preservation**: Yes (7 years)

---

## Category 9: Automated Kill Switch Rules

### Rule 9.1: Risk Threshold Kill Switch

**Rule**: Sessions automatically terminated if risk ≥ 0.70

**Enforcement**:
- System calculates risk score on every request
- If risk ≥ 0.70, immediately terminate session
- User must re-authenticate with step-up authentication

**Action on Violation**: TERMINATE session

**Logging**: Log all kill switch activations

**Genesis Preservation**: Yes (7 years)

---

### Rule 9.2: Failed Authentication Kill Switch

**Rule**: Account locked after 5 failed authentication attempts

**Enforcement**:
- System tracks failed authentication attempts
- If failed attempts ≥ 5, lock account for 1 hour
- User must wait or contact admin to unlock

**Action on Violation**: LOCK account

**Logging**: Log all kill switch activations

**Genesis Preservation**: Yes (7 years)

---

### Rule 9.3: Velocity Anomaly Kill Switch

**Rule**: API key blocked if velocity anomaly detected

**Enforcement**:
- System tracks API request rate
- If request rate > 100 requests/second, block API key
- API key owner must contact admin to unblock

**Action on Violation**: BLOCK API key

**Logging**: Log all kill switch activations

**Genesis Preservation**: Yes (7 years)

---

### Rule 9.4: Constellation Supernova Kill Switch

**Rule**: Session terminated if user entity part of Constellation supernova alert

**Enforcement**:
- Constellation Map™ detects geographic concentration
- If user entity part of supernova, terminate session
- Alert security team
- User must contact security team to restore access

**Action on Violation**: TERMINATE session + ALERT security team

**Logging**: Log all kill switch activations

**Genesis Preservation**: Yes (7 years)

---

### Rule 9.5: Hydra Cluster Kill Switch

**Rule**: Account locked if user entity part of Hydra-detected manipulation cluster

**Enforcement**:
- Operation Hydra™ detects manipulation clusters
- If user entity part of cluster, lock account
- Alert security team
- User must contact security team to restore access

**Action on Violation**: LOCK account + ALERT security team

**Logging**: Log all kill switch activations

**Genesis Preservation**: Yes (7 years)

---

## Category 10: Genesis-Backed Nonrepudiation Rules

### Rule 10.1: All Authentication Events Preserved

**Rule**: All authentication events preserved in Genesis Archive™

**Enforcement**:
- Login success/failure
- Logout
- MFA enrollment/verification
- Password change/reset
- All events written to Genesis Archive™ with cryptographic hash

**Action on Violation**: N/A (automatic preservation)

**Logging**: All authentication events

**Genesis Preservation**: Yes (1 year)

---

### Rule 10.2: All Authorization Events Preserved

**Rule**: All authorization events preserved in Genesis Archive™

**Enforcement**:
- Access granted/denied
- Role assignment/revocation
- Privilege elevation/revocation
- Four-Eyes approval/denial
- All events written to Genesis Archive™ with cryptographic hash

**Action on Violation**: N/A (automatic preservation)

**Logging**: All authorization events

**Genesis Preservation**: Yes (7 years)

---

### Rule 10.3: All Privileged Actions Preserved

**Rule**: All privileged actions preserved in Genesis Archive™

**Enforcement**:
- SuperAdmin actions
- Admin actions
- Senior Analyst actions (exports, Genesis access)
- All actions written to Genesis Archive™ with cryptographic hash
- All actions include actor identity, timestamp, action details

**Action on Violation**: N/A (automatic preservation)

**Logging**: All privileged actions

**Genesis Preservation**: Yes (7 years)

---

### Rule 10.4: Genesis Integrity Verification

**Rule**: Genesis Archive™ integrity verified continuously

**Enforcement**:
- Hash chain verified every hour
- Digital signatures verified every hour
- Block integrity verified every hour
- Any tampering detected triggers critical alert

**Action on Violation**: CRITICAL ALERT + LOCK system + NOTIFY CISO

**Logging**: All integrity verification results

**Genesis Preservation**: Yes (permanent)

---

## Enforcement Architecture

### Policy Decision Point (PDP)

**Purpose**: Centralized policy evaluation engine

**Responsibilities**:
- Receive access requests from PEP
- Verify identity (session token, API key, mTLS certificate)
- Calculate risk score
- Evaluate RBAC policy
- Evaluate Zero-Trust rules
- Return access decision (ALLOW/DENY/STEP_UP_AUTH/RESTRICT)

**Location**: API Gateway

---

### Policy Enforcement Point (PEP)

**Purpose**: Enforce access decisions at resource boundaries

**Responsibilities**:
- Intercept all access requests
- Query PDP for access decision
- Enforce decision (allow, deny, require step-up auth, restrict)
- Log all access attempts
- Forward allowed requests to resources

**Locations**:
- API Gateway (primary PEP)
- Frontend (secondary PEP)
- Backend engines (tertiary PEP)

---

### Continuous Verification Layer

**Purpose**: Continuously verify identity and context throughout session

**Responsibilities**:
- Verify session token on every request
- Verify device fingerprint on every request
- Calculate risk score on every request
- Detect behavioral anomalies
- Trigger step-up authentication when needed

**Location**: API Gateway + Backend engines

---

## Rule Violation Response Matrix

| Violation Type | Severity | Response | Notification |
|----------------|----------|----------|--------------|
| Unauthenticated access | High | DENY access | Security team |
| MFA failure | Medium | DENY access | User |
| Device fingerprint mismatch | Medium | REQUIRE step-up auth | User |
| Location change (different country) | Medium | REQUIRE step-up auth | User + Security team |
| Risk score 0.30-0.49 | Medium | REQUIRE step-up auth | User |
| Risk score 0.50-0.69 | High | RESTRICT access | User + Security team |
| Risk score 0.70-0.89 | Critical | TERMINATE session | User + Security team |
| Risk score ≥ 0.90 | Critical | TERMINATE session + LOCK account | User + Security team + CISO |
| Toxic combination | Critical | DENY role assignment | Security team + CISO |
| Micro-segment boundary violation | Critical | DENY connection | Security team + CISO |
| Hydra cluster association | Critical | LOCK account | User + Security team + CISO |
| Constellation supernova | Critical | TERMINATE session | User + Security team + CISO |
| Genesis integrity violation | Critical | LOCK system | CISO + CTO |

---

## Example Enforcement Scenarios

### Scenario 1: Device Fingerprint Mismatch

**Situation**: User logs in from registered device, but device fingerprint changed

**Rule Triggered**: Rule 2.1 (Device Fingerprint Required)

**Risk Calculation**:
- Base risk: 0.0
- Device fingerprint mismatch: +0.3
- Total risk: 0.3

**PDP Decision**: REQUIRE step-up authentication

**PEP Action**:
1. Display step-up authentication challenge
2. User re-enters password
3. User re-verifies MFA
4. If successful, grant access
5. Log event to Genesis Archive™

---

### Scenario 2: Location Change (USA → China)

**Situation**: User logs in from China, previous login from USA

**Rule Triggered**: Rule 3.1 (Geographic Location Verification)

**Risk Calculation**:
- Base risk: 0.0
- Location change (different country): +0.3
- Total risk: 0.3

**PDP Decision**: REQUIRE step-up authentication

**PEP Action**:
1. Display step-up authentication challenge
2. Send email verification code to registered email
3. User enters verification code
4. User re-verifies MFA
5. If successful, grant access
6. Alert security team
7. Log event to Genesis Archive™

---

### Scenario 3: Hydra Cluster Association

**Situation**: User entity detected as part of Hydra manipulation cluster

**Rule Triggered**: Rule 9.5 (Hydra Cluster Kill Switch)

**Risk Calculation**:
- Base risk: 0.0
- Hydra cluster association: +0.5
- Total risk: 0.5 (but kill switch overrides)

**PDP Decision**: LOCK account

**PEP Action**:
1. Immediately terminate all active sessions
2. Lock account
3. Display message: "Account locked due to security concern. Contact security team."
4. Alert security team
5. Alert CISO
6. Log event to Genesis Archive™
7. Initiate security investigation

---

### Scenario 4: Failed Authentication (5 attempts)

**Situation**: User enters wrong password 5 times

**Rule Triggered**: Rule 9.2 (Failed Authentication Kill Switch)

**Risk Calculation**: N/A (kill switch threshold reached)

**PDP Decision**: LOCK account

**PEP Action**:
1. Lock account for 1 hour
2. Display message: "Account locked due to too many failed attempts. Try again in 1 hour or contact admin."
3. Send notification to user email
4. Log event to Genesis Archive™

---

## Compliance Mapping

### NIST SP 800-207 (Zero Trust Architecture)

| Tenet | GhostQuant™ Implementation |
|-------|----------------------------|
| Never trust, always verify | All access requests authenticated and authorized |
| Assume breach | Continuous verification, micro-segmentation, Genesis preservation |
| Verify explicitly | Identity, device, location, risk verified on every request |
| Least privilege | RBAC enforces minimum permissions |
| Inspect and log everything | All events logged to Genesis Archive™ |

---

### NIST 800-53 AC-3 (Access Enforcement)

**Control**: The information system enforces approved authorizations for logical access.

**GhostQuant™ Implementation**: PDP/PEP architecture enforces Zero-Trust rules on every request.

---

### CJIS 5.4 (Auditing and Accountability)

**Control**: Information systems must log security-relevant events.

**GhostQuant™ Implementation**: All authentication, authorization, and privileged actions logged to Genesis Archive™.

---

### SOC 2 CC6.6 (Logical Access - Monitoring)

**Criterion**: The entity implements logical access security measures to protect against threats from sources outside its system boundaries.

**GhostQuant™ Implementation**: Zero-Trust rules protect against external threats (location-based, device-based, risk-based).

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Zero-Trust Architecture**: See zero_trust_architecture.md
- **Privileged Access Management**: See privileged_access_management.md
- **Authentication Events**: See authentication_event_catalog.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial Zero-Trust enforcement rules |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

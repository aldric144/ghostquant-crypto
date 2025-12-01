# Privileged Access Management (PAM)
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document defines comprehensive Privileged Access Management (PAM) controls for GhostQuant™, implementing federal-grade security controls for SuperAdmin access, break-glass accounts, privileged session recording, Four-Eyes approval, and tamper-evident logging per NIST 800-53 AC-6, AC-17, AU-12, SOC 2 CC7, and FedRAMP AC-6 requirements.

---

## Privileged Access Overview

Privileged access refers to elevated permissions that allow users to perform sensitive administrative actions, modify system configurations, access sensitive data, or override security controls.

**Privileged Roles in GhostQuant™**:
- **Admin**: System administration, user management, configuration management
- **SuperAdmin**: Highest-level administration with unrestricted access (subject to Four-Eyes approval)

**Privileged Actions**:
- Modify intelligence engine algorithms
- Access Genesis Archive™ (write operations)
- Delete user accounts
- Modify security controls
- Deploy production updates
- Access raw audit logs
- Override security policies
- Emergency system access

---

## SuperAdmin Restrictions

SuperAdmin is the highest-privilege role in GhostQuant™ with near-unrestricted access. Due to the extreme sensitivity of SuperAdmin privileges, strict controls are enforced.

### SuperAdmin Access Restrictions

**1. Limited Number of SuperAdmins**:
- Maximum 5 SuperAdmin accounts
- Each SuperAdmin must be individually approved by CISO
- SuperAdmin accounts reviewed monthly

**2. Named Accounts Only**:
- No shared SuperAdmin accounts
- Each SuperAdmin account tied to specific individual
- No generic "admin" or "root" accounts

**3. Time-Limited Access**:
- SuperAdmin privileges granted for specific time period
- Default: 90 days
- Maximum: 1 year
- Requires monthly recertification

**4. MFA Required**:
- FIDO2/WebAuthn mandatory (no TOTP)
- Hardware security key required (Yubikey)
- Biometric authentication recommended

**5. Privileged Session Recording**:
- All SuperAdmin sessions recorded
- Screen recording + keystroke logging
- Recordings preserved in Genesis Archive™
- Recordings reviewed quarterly

**6. Four-Eyes Approval for Destructive Actions**:
- Destructive actions require approval from another SuperAdmin
- Approver cannot be same person as requester
- Approval expires after 1 hour
- All approvals logged

**7. No Remote Access (Default)**:
- SuperAdmin access only from secure admin workstations
- Remote access requires VPN + additional approval
- Remote access logged and monitored

**8. Restricted Access to Sensitive Engines**:
- Access to Sentinel Command Console™ requires justification
- Access to UltraFusion™ requires approval
- Access to Hydra™ requires approval
- Access to Genesis Archive™ (write) requires Four-Eyes approval

---

### SuperAdmin Prohibited Actions

**Absolutely Prohibited** (no exceptions):
- Disable audit logging
- Delete Genesis Archive™ blocks
- Modify own audit logs
- Grant SuperAdmin to self
- Bypass Four-Eyes approval
- Disable security controls without approval

**Prohibited Without Four-Eyes Approval**:
- Delete user accounts
- Modify intelligence engine algorithms
- Deploy production updates
- Modify security policies
- Access break-glass accounts
- Override access controls

---

## Access to Sentinel / UltraFusion / Hydra

### Sentinel Command Console™ Access

**Purpose**: Sentinel is the central command and control console for GhostQuant™, providing system health monitoring, alert management, and incident response.

**Privileged Access Requirements**:
- **Roles Allowed**: Admin, SuperAdmin
- **Authentication**: Username + Password + FIDO2
- **Authorization**: RBAC + Risk-Adaptive Authorization
- **Justification Required**: Yes (for non-routine access)
- **Approval Required**: Yes (for SuperAdmin)
- **Session Recording**: Yes
- **Audit Logging**: All actions logged to Genesis Archive™

**Restricted Actions**:
- Modify alert rules (requires approval)
- Disable monitoring (requires Four-Eyes approval)
- Modify incident response workflows (requires approval)
- Access raw system logs (requires justification)

---

### UltraFusion™ Access

**Purpose**: UltraFusion™ is the meta-intelligence fusion engine that combines signals from multiple intelligence engines to produce high-confidence assessments.

**Privileged Access Requirements**:
- **Roles Allowed**: Senior Analyst (read-only), Admin (configuration), SuperAdmin (full access)
- **Authentication**: Username + Password + FIDO2
- **Authorization**: RBAC + Four-Eyes Approval (for modifications)
- **Justification Required**: Yes (for all access)
- **Approval Required**: Yes (for modifications)
- **Session Recording**: Yes (for modifications)
- **Audit Logging**: All actions logged to Genesis Archive™

**Restricted Actions**:
- Modify fusion algorithms (requires Four-Eyes approval)
- Modify confidence thresholds (requires approval)
- Disable fusion sources (requires approval)
- Access raw fusion data (requires justification)

---

### Operation Hydra™ Access

**Purpose**: Hydra™ is the manipulation ring detection engine that identifies coordinated cryptocurrency manipulation schemes.

**Privileged Access Requirements**:
- **Roles Allowed**: Senior Analyst (read-only), Admin (configuration), SuperAdmin (full access)
- **Authentication**: Username + Password + FIDO2
- **Authorization**: RBAC + Four-Eyes Approval (for modifications)
- **Justification Required**: Yes (for all access)
- **Approval Required**: Yes (for modifications)
- **Session Recording**: Yes (for modifications)
- **Audit Logging**: All actions logged to Genesis Archive™

**Restricted Actions**:
- Modify detection algorithms (requires Four-Eyes approval)
- Modify cluster thresholds (requires approval)
- Disable detection rules (requires approval)
- Access raw cluster data (requires justification)

---

## Role Splitting for Genesis Archive™

Genesis Archive™ is the immutable audit ledger that preserves all critical events, intelligence outputs, and compliance evidence. Due to its extreme sensitivity, access is strictly controlled with role splitting.

### Genesis Archive™ Access Roles

**Role 1: Genesis Writer** (System Accounts Only)
- **Purpose**: Write audit logs to Genesis Archive™
- **Accounts**: Intelligence engines (Sentinel, UltraFusion, Hydra, Constellation, Radar, Actor Profiler, Oracle Eye, Cortex, GhostPredictor)
- **Permissions**: Append-only write access
- **Authentication**: Service account + API key + mTLS
- **Restrictions**: Cannot read Genesis Archive™, cannot modify existing blocks

**Role 2: Genesis Reader** (Senior Analyst, Admin, SuperAdmin)
- **Purpose**: Read audit logs from Genesis Archive™
- **Accounts**: Senior Analyst, Admin, SuperAdmin
- **Permissions**: Read-only access
- **Authentication**: Username + Password + FIDO2
- **Restrictions**: Cannot write to Genesis Archive™, cannot modify blocks
- **Justification Required**: Yes
- **Approval Required**: Yes (Four-Eyes)

**Role 3: Genesis Administrator** (SuperAdmin Only)
- **Purpose**: Administer Genesis Archive™ (backup, restore, integrity verification)
- **Accounts**: SuperAdmin (maximum 2 accounts)
- **Permissions**: Administrative access (no write/modify)
- **Authentication**: Username + Password + FIDO2
- **Restrictions**: Cannot write to Genesis Archive™, cannot modify blocks, cannot delete blocks
- **Approval Required**: Yes (Four-Eyes)
- **Session Recording**: Yes

---

### Genesis Archive™ Access Workflow

**Step 1: Access Request**

**Requester**: Senior Analyst, Admin, or SuperAdmin

**Required Information**:
- Reason for access (investigation, audit, compliance)
- Specific blocks or time range to access
- Expected duration of access
- Justification for access

**Submission Method**: ITSM ticket

---

**Step 2: Four-Eyes Approval**

**Approver**: Another Senior Analyst, Admin, or SuperAdmin (different person)

**Approval Criteria**:
- Valid business reason
- Appropriate scope (not excessive)
- Requester authorized for access
- No conflict of interest

**Approval Method**: ITSM ticket approval

---

**Step 3: Access Grant**

**Granter**: Identity Administrator

**Grant Actions**:
1. Verify approval
2. Grant time-limited Genesis Reader role
3. Notify requester
4. Log access grant

**Access Duration**: 1 hour (default), 8 hours (maximum)

---

**Step 4: Access Usage**

**User Actions**:
1. User accesses Genesis Archive™
2. User queries specific blocks or time range
3. User exports data (if approved)
4. All actions logged

---

**Step 5: Access Revocation**

**Revocation Actions**:
1. Access automatically revoked after expiration
2. User notified of revocation
3. Log access revocation

---

## Approval Workflow for Privilege Elevation

Privilege elevation allows users to temporarily gain higher privileges to perform specific actions. All privilege elevations require approval.

### Privilege Elevation Scenarios

**Scenario 1: Analyst → Senior Analyst**
- **Reason**: Temporary need to access raw event data or approve exports
- **Approval Required**: Manager or Senior Analyst
- **Duration**: 1 hour (default), 4 hours (maximum)

**Scenario 2: Senior Analyst → Admin**
- **Reason**: Temporary need to manage user accounts or system configuration
- **Approval Required**: Admin or SuperAdmin
- **Duration**: 1 hour (default), 4 hours (maximum)

**Scenario 3: Admin → SuperAdmin**
- **Reason**: Emergency system access or critical maintenance
- **Approval Required**: SuperAdmin (different person) + CISO
- **Duration**: 1 hour (default), 2 hours (maximum)

---

### Privilege Elevation Workflow

**Step 1: Elevation Request**

**Requester**: User requiring elevated privileges

**Required Information**:
- Current role
- Requested role
- Reason for elevation
- Specific actions to perform
- Expected duration
- Justification

**Submission Method**: ITSM ticket or emergency hotline (for emergencies)

---

**Step 2: Manager/Approver Review**

**Approver**: Manager, Admin, or SuperAdmin (depending on elevation)

**Review Criteria**:
- Valid business reason
- Appropriate elevation (not excessive)
- Requester authorized for elevation
- No alternative solution
- Duration appropriate

**Approval Method**: ITSM ticket approval or verbal approval (for emergencies, followed by written approval)

---

**Step 3: Step-Up Authentication**

**Authentication Actions**:
1. User re-enters password
2. User re-verifies MFA (FIDO2)
3. User verifies device fingerprint
4. System calculates risk score
5. If risk score acceptable, proceed to elevation

---

**Step 4: Privilege Grant**

**Granter**: Identity Administrator or automated system

**Grant Actions**:
1. Verify approval
2. Grant time-limited elevated role
3. Generate privilege token
4. Notify user
5. Log privilege elevation

**Privilege Token**:
- Unique token for elevated session
- Expires after specified duration
- Cannot be reused
- Tied to specific actions

---

**Step 5: Privileged Actions**

**User Actions**:
1. User performs privileged actions using privilege token
2. All actions logged with elevated privilege indicator
3. All actions recorded (if session recording enabled)
4. Risk score continuously monitored

---

**Step 6: Privilege Revocation**

**Revocation Actions**:
1. Privileges automatically revoked after expiration
2. User notified of revocation
3. Privilege token invalidated
4. Log privilege revocation

---

## Break-Glass Accounts

Break-glass accounts are emergency access accounts used only in critical situations when normal access is unavailable or insufficient.

### Break-Glass Account Purpose

**Use Cases**:
- Primary authentication system failure
- Identity Provider (IdP) outage
- Emergency system recovery
- Critical security incident requiring immediate access
- Natural disaster or catastrophic failure

**Not for Use**:
- Routine administration
- Convenience access
- Bypassing normal approval workflows
- Testing or development

---

### Break-Glass Account Configuration

**Number of Accounts**: 2 (primary and backup)

**Account Names**:
- `breakglass-primary`
- `breakglass-backup`

**Account Type**: Local accounts (not dependent on IdP)

**Credentials**:
- Complex password (minimum 20 characters)
- Stored in sealed envelope in physical safe
- Stored in encrypted secret store (offline backup)
- No MFA (to avoid dependency on MFA system)

**Privileges**: SuperAdmin (full access)

**Access Restrictions**:
- Physical access to sealed envelope requires two authorized personnel
- Envelope opening triggers alarm and notification
- Account usage triggers immediate alert to CISO and security team
- Account automatically disabled after 24 hours
- All actions logged and preserved

---

### Break-Glass Account Usage Workflow

**Step 1: Emergency Declaration**

**Declarer**: CISO, CTO, or Incident Commander

**Declaration Criteria**:
- Critical system failure
- Normal access unavailable
- Immediate action required
- No alternative solution

**Declaration Method**: Verbal declaration + written documentation (within 1 hour)

---

**Step 2: Physical Access to Credentials**

**Access Requirements**:
- Two authorized personnel (CISO, CTO, or designated deputies)
- Physical access to safe
- Break seal on envelope
- Retrieve credentials
- Document envelope opening (date, time, personnel, reason)

**Automated Actions**:
- Alarm triggered
- Notification sent to CISO, CTO, security team
- Video recording of safe access
- Log envelope opening event

---

**Step 3: Break-Glass Account Login**

**Login Actions**:
1. User enters break-glass username
2. User enters break-glass password
3. System validates credentials
4. System sends immediate alert to CISO and security team
5. System grants access
6. System starts session recording
7. System logs break-glass login

---

**Step 4: Emergency Actions**

**User Actions**:
1. User performs emergency actions
2. All actions logged with break-glass indicator
3. All actions recorded (screen + keystroke)
4. User documents actions taken

---

**Step 5: Post-Emergency Review**

**Review Actions** (within 24 hours):
1. CISO reviews break-glass usage
2. Review actions taken
3. Verify actions appropriate
4. Document review findings
5. Determine if policy violation occurred

---

**Step 6: Account Disable and Credential Rotation**

**Disable Actions** (within 24 hours):
1. Automatically disable break-glass account
2. Generate new credentials
3. Store new credentials in sealed envelope
4. Place envelope in safe
5. Log credential rotation

---

## Privileged Session Recording

All privileged sessions (Admin, SuperAdmin, break-glass) are comprehensively recorded for audit, compliance, and forensic investigation.

### Recording Scope

**What is Recorded**:
- Screen recording (full screen capture)
- Keystroke logging (all keyboard input)
- Mouse movements and clicks
- Commands executed
- Files accessed
- Configuration changes
- Network connections
- Session metadata (user, timestamp, IP address, device)

**What is NOT Recorded**:
- Passwords entered (masked)
- MFA tokens (masked)
- Personal data unrelated to session

---

### Recording Configuration

**Recording Start**: Automatically when privileged session begins

**Recording End**: Automatically when privileged session ends

**Recording Format**: MP4 video + JSON metadata

**Recording Storage**: Encrypted storage + Genesis Archive™ (metadata)

**Recording Retention**: 1 year (default), 7 years (high-severity actions)

**Recording Access**: CISO, Security Team, Auditors (with approval)

---

### Recording Workflow

**Step 1: Session Start**

**Automated Actions**:
1. Detect privileged session start
2. Initialize screen recording
3. Initialize keystroke logging
4. Log session start event
5. Display recording indicator to user

---

**Step 2: Session Recording**

**Automated Actions**:
1. Continuously record screen
2. Continuously log keystrokes
3. Log all actions performed
4. Monitor session for suspicious activity
5. Calculate risk score

---

**Step 3: Session End**

**Automated Actions**:
1. Detect privileged session end
2. Stop screen recording
3. Stop keystroke logging
4. Finalize recording file
5. Calculate recording hash
6. Encrypt recording
7. Store recording in secure storage
8. Log recording metadata to Genesis Archive™
9. Log session end event

---

**Step 4: Recording Review** (Quarterly)

**Reviewer**: Security Team or Internal Audit

**Review Actions**:
1. Sample privileged sessions (10% minimum)
2. Review recordings for policy violations
3. Review recordings for suspicious activity
4. Document review findings
5. Escalate issues if found

---

## GhostQuant™ Four-Eyes Rule

The Four-Eyes Rule requires that destructive or high-risk actions be approved by a second authorized person before execution, preventing insider threats and errors.

### Four-Eyes Rule Scope

**Actions Requiring Four-Eyes Approval**:
1. Delete user account
2. Delete investigation
3. Modify intelligence engine algorithm
4. Delete Genesis Archive™ export
5. Disable security control
6. Override security policy
7. Deploy production update
8. Modify audit log retention policy
9. Access break-glass account
10. Grant SuperAdmin privileges
11. Modify Genesis Archive™ configuration
12. Disable monitoring or alerting
13. Modify encryption keys
14. Access raw audit logs (bulk export)
15. Modify compliance policies

---

### Four-Eyes Approval Workflow

**Step 1: Action Request**

**Requester**: User requiring Four-Eyes approval

**Required Information**:
- Action to perform
- Reason for action
- Expected impact
- Rollback plan (if applicable)
- Justification

**Submission Method**: ITSM ticket or approval system

---

**Step 2: Approver Selection**

**Automated Actions**:
1. System identifies eligible approvers
2. Eligible approvers must have same or higher role
3. Eligible approvers cannot be same person as requester
4. System notifies eligible approvers

---

**Step 3: Approver Review**

**Approver**: Eligible approver (different person, same or higher role)

**Review Criteria**:
- Valid business reason
- Appropriate action (not excessive)
- Requester authorized for action
- Expected impact acceptable
- Rollback plan adequate (if applicable)
- No conflict of interest

**Approval Method**: ITSM ticket approval or approval system

---

**Step 4: Approval Grant**

**Automated Actions**:
1. Verify approver eligible
2. Verify approver different person
3. Generate time-limited approval token
4. Notify requester
5. Log approval grant

**Approval Token**:
- Unique token for approved action
- Expires after 1 hour
- Cannot be reused
- Tied to specific action

---

**Step 5: Action Execution**

**Requester Actions**:
1. Requester performs action using approval token
2. System validates approval token
3. System executes action
4. System logs action with approver identity
5. System notifies requester and approver of completion

---

**Step 6: Post-Action Review** (for high-risk actions)

**Reviewer**: CISO or Security Manager

**Review Actions** (within 24 hours):
1. Review action taken
2. Verify action appropriate
3. Verify approval appropriate
4. Document review findings
5. Escalate if issues found

---

## Tamper-Evident Logging

All privileged actions are logged with tamper-evident controls to ensure audit log integrity and prevent unauthorized modification.

### Tamper-Evident Controls

**Control 1: Cryptographic Hashing**
- Each log entry hashed with SHA-256
- Hash includes previous log entry hash (blockchain-style)
- Hash chain prevents insertion or deletion of log entries

**Control 2: Digital Signatures**
- Each log entry digitally signed by logging system
- Signature verifies log entry authenticity
- Signature prevents log entry modification

**Control 3: Genesis Archive™ Preservation**
- All privileged action logs preserved in Genesis Archive™
- Genesis Archive™ provides immutable audit trail
- Genesis Archive™ blocks linked with hash chain
- Genesis Archive™ integrity verified continuously

**Control 4: Log Forwarding**
- Logs forwarded to external SIEM in real-time
- External SIEM provides independent audit trail
- Log forwarding prevents local log tampering

**Control 5: Periodic Integrity Verification**
- Automated integrity verification every hour
- Verify hash chain integrity
- Verify digital signatures
- Verify Genesis Archive™ integrity
- Alert on integrity violation

---

### Tamper Detection

**Detection Methods**:
1. Hash chain verification (detect insertion/deletion)
2. Digital signature verification (detect modification)
3. Genesis Archive™ comparison (detect local tampering)
4. SIEM comparison (detect log forwarding failure)
5. Timestamp verification (detect time manipulation)

**Detection Frequency**:
- Real-time: Log forwarding failure
- Hourly: Hash chain and signature verification
- Daily: Genesis Archive™ comparison
- Weekly: SIEM comparison

**Response Actions**:
1. Generate critical alert
2. Notify CISO and security team
3. Lock affected accounts
4. Initiate incident response
5. Preserve evidence
6. Investigate tampering attempt

---

## Compliance Mapping

### NIST 800-53 AC-6 (Least Privilege)

| Control | Requirement | GhostQuant™ Implementation |
|---------|-------------|----------------------------|
| AC-6 | Employ least privilege | All roles follow least-privilege principle |
| AC-6(1) | Authorize access to security functions | SuperAdmin access restricted and approved |
| AC-6(2) | Non-privileged access for non-security functions | Users assigned minimum role required |
| AC-6(5) | Privileged accounts | SuperAdmin accounts limited, monitored, recorded |
| AC-6(9) | Log use of privileged functions | All privileged actions logged to Genesis Archive™ |
| AC-6(10) | Prohibit non-privileged users from executing privileged functions | RBAC enforces role-based restrictions |

---

### NIST 800-53 AC-17 (Remote Access)

| Control | Requirement | GhostQuant™ Implementation |
|---------|-------------|----------------------------|
| AC-17 | Remote access policy | SuperAdmin remote access restricted, requires VPN + approval |
| AC-17(1) | Automated monitoring / control | Remote access monitored by Sentinel Console™ |
| AC-17(2) | Protection of confidentiality / integrity | Remote access encrypted with TLS 1.3 + mTLS |
| AC-17(3) | Managed access control points | Remote access only via VPN gateway |
| AC-17(4) | Privileged commands / access | Privileged remote access requires additional approval |

---

### NIST 800-53 AU-12 (Audit Generation)

| Control | Requirement | GhostQuant™ Implementation |
|---------|-------------|----------------------------|
| AU-12 | Audit record generation | All privileged actions generate audit records |
| AU-12(1) | System-wide / time-correlated audit trail | Genesis Archive™ provides system-wide audit trail |
| AU-12(2) | Standardized formats | Audit logs use standardized JSON format |
| AU-12(3) | Changes by authorized individuals | Audit log changes restricted to authorized accounts |

---

### SOC 2 CC7 (System Operations)

| Criterion | Requirement | GhostQuant™ Implementation |
|-----------|-------------|----------------------------|
| CC7.2 | Monitor system components | Sentinel Console™ monitors privileged access |
| CC7.3 | Evaluate security events | Privileged actions evaluated for policy violations |
| CC7.4 | Respond to security incidents | Break-glass accounts for emergency response |
| CC7.5 | Identify and respond to changes | Privileged actions logged and reviewed |

---

### FedRAMP AC-6 (Least Privilege)

| Control | Baseline | GhostQuant™ Implementation |
|---------|----------|----------------------------|
| AC-6 | Moderate | Least privilege enforced for all roles |
| AC-6(1) | Moderate | SuperAdmin access restricted and monitored |
| AC-6(2) | Moderate | Non-privileged users cannot execute privileged functions |
| AC-6(5) | Moderate | Privileged accounts limited to 5 SuperAdmins |
| AC-6(9) | Moderate | All privileged functions logged to Genesis Archive™ |

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Zero-Trust Architecture**: See zero_trust_architecture.md
- **Identity Lifecycle**: See identity_lifecycle_procedures.md
- **Authentication Events**: See authentication_event_catalog.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial privileged access management policy |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

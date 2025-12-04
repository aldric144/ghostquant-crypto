# Authentication Event Catalog
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document catalogs all Identity and Access Management (IAM) and authentication events in GhostQuant™, documenting event names, descriptions, required fields, severity levels, and Genesis Archive™ preservation requirements for each event type.

---

## Event Categories

Events are organized into 11 categories:

1. Login Events
2. Failed Login Events
3. MFA Challenges
4. Step-Up Authentication
5. Privilege Elevation
6. Session Management
7. Identity Changes
8. Account Lockouts
9. API Key Misuse
10. Policy Violations
11. SSO Integration Events

---

## Category 1: Login Events

### Event 1: LOGIN_SUCCESS

**Description**: User successfully authenticated with valid credentials and MFA

**Required Fields**:
- Event ID (UUID)
- Event Type: LOGIN_SUCCESS
- Timestamp (UTC)
- User ID
- Username
- Role
- IP Address
- Device Fingerprint
- Geographic Location (city, country)
- Authentication Method (password + MFA type)
- Session ID
- Risk Score

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 2: LOGIN_SUCCESS_NEW_DEVICE

**Description**: User successfully authenticated from new/unrecognized device

**Required Fields**:
- All LOGIN_SUCCESS fields
- Previous Device Fingerprint
- New Device Fingerprint
- Device Registration Status (registered/unregistered)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 3: LOGIN_SUCCESS_NEW_LOCATION

**Description**: User successfully authenticated from new/unusual geographic location

**Required Fields**:
- All LOGIN_SUCCESS fields
- Previous Location (city, country)
- New Location (city, country)
- Distance (km)
- Time Since Last Login (hours)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 4: LOGOUT_SUCCESS

**Description**: User successfully logged out

**Required Fields**:
- Event ID
- Event Type: LOGOUT_SUCCESS
- Timestamp
- User ID
- Username
- Session ID
- Session Duration (seconds)
- IP Address

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

## Category 2: Failed Login Events

### Event 5: LOGIN_FAILURE_INVALID_CREDENTIALS

**Description**: User authentication failed due to invalid username or password

**Required Fields**:
- Event ID
- Event Type: LOGIN_FAILURE_INVALID_CREDENTIALS
- Timestamp
- Username (attempted)
- IP Address
- Device Fingerprint
- Geographic Location
- Failure Reason: Invalid credentials
- Failed Attempt Count (for this session)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 6: LOGIN_FAILURE_MFA_FAILED

**Description**: User authentication failed due to invalid MFA token

**Required Fields**:
- Event ID
- Event Type: LOGIN_FAILURE_MFA_FAILED
- Timestamp
- User ID
- Username
- IP Address
- Device Fingerprint
- MFA Type (FIDO2/TOTP/WebAuthn)
- Failure Reason: Invalid MFA token
- Failed Attempt Count

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 7: LOGIN_FAILURE_ACCOUNT_LOCKED

**Description**: User authentication failed due to account locked

**Required Fields**:
- Event ID
- Event Type: LOGIN_FAILURE_ACCOUNT_LOCKED
- Timestamp
- User ID
- Username
- IP Address
- Lock Reason (too many failed attempts, security incident, administrative action)
- Lock Timestamp
- Lock Duration (hours)

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

### Event 8: LOGIN_FAILURE_ACCOUNT_DISABLED

**Description**: User authentication failed due to account disabled

**Required Fields**:
- Event ID
- Event Type: LOGIN_FAILURE_ACCOUNT_DISABLED
- Timestamp
- User ID
- Username
- IP Address
- Disable Reason (termination, deactivation, policy violation)
- Disable Timestamp

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

### Event 9: LOGIN_FAILURE_RISK_TOO_HIGH

**Description**: User authentication denied due to risk score exceeding threshold

**Required Fields**:
- Event ID
- Event Type: LOGIN_FAILURE_RISK_TOO_HIGH
- Timestamp
- User ID
- Username
- IP Address
- Device Fingerprint
- Geographic Location
- Risk Score
- Risk Factors (list)
- Risk Threshold

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

## Category 3: MFA Challenges

### Event 10: MFA_ENROLLMENT_SUCCESS

**Description**: User successfully enrolled MFA device

**Required Fields**:
- Event ID
- Event Type: MFA_ENROLLMENT_SUCCESS
- Timestamp
- User ID
- Username
- MFA Type (FIDO2/TOTP/WebAuthn)
- Device Name (user-provided)
- Device ID (system-generated)

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 11: MFA_ENROLLMENT_FAILURE

**Description**: User failed to enroll MFA device

**Required Fields**:
- Event ID
- Event Type: MFA_ENROLLMENT_FAILURE
- Timestamp
- User ID
- Username
- MFA Type
- Failure Reason

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 12: MFA_VERIFICATION_SUCCESS

**Description**: User successfully verified MFA token

**Required Fields**:
- Event ID
- Event Type: MFA_VERIFICATION_SUCCESS
- Timestamp
- User ID
- Username
- MFA Type
- Device ID
- IP Address

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 13: MFA_VERIFICATION_FAILURE

**Description**: User failed to verify MFA token

**Required Fields**:
- Event ID
- Event Type: MFA_VERIFICATION_FAILURE
- Timestamp
- User ID
- Username
- MFA Type
- Device ID
- IP Address
- Failure Reason
- Failed Attempt Count

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 14: MFA_DEVICE_DISABLED

**Description**: MFA device disabled (lost, stolen, or compromised)

**Required Fields**:
- Event ID
- Event Type: MFA_DEVICE_DISABLED
- Timestamp
- User ID
- Username
- MFA Type
- Device ID
- Disable Reason (lost, stolen, compromised, user request)
- Disabled By (user, admin, system)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 15: MFA_BACKUP_CODE_USED

**Description**: User authenticated using backup code

**Required Fields**:
- Event ID
- Event Type: MFA_BACKUP_CODE_USED
- Timestamp
- User ID
- Username
- Backup Code ID
- IP Address
- Device Fingerprint
- Remaining Backup Codes

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

## Category 4: Step-Up Authentication

### Event 16: STEP_UP_AUTH_REQUIRED

**Description**: Step-up authentication required due to sensitive action or risk increase

**Required Fields**:
- Event ID
- Event Type: STEP_UP_AUTH_REQUIRED
- Timestamp
- User ID
- Username
- Session ID
- Trigger Reason (sensitive action, risk increase)
- Requested Action
- Risk Score

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 17: STEP_UP_AUTH_SUCCESS

**Description**: User successfully completed step-up authentication

**Required Fields**:
- Event ID
- Event Type: STEP_UP_AUTH_SUCCESS
- Timestamp
- User ID
- Username
- Session ID
- Authentication Method (password + MFA)
- Requested Action
- Authorization Token (time-limited)

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 18: STEP_UP_AUTH_FAILURE

**Description**: User failed step-up authentication

**Required Fields**:
- Event ID
- Event Type: STEP_UP_AUTH_FAILURE
- Timestamp
- User ID
- Username
- Session ID
- Failure Reason
- Requested Action
- Failed Attempt Count

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

## Category 5: Privilege Elevation

### Event 19: PRIVILEGE_ELEVATION_REQUESTED

**Description**: User requested privilege elevation

**Required Fields**:
- Event ID
- Event Type: PRIVILEGE_ELEVATION_REQUESTED
- Timestamp
- User ID
- Username
- Current Role
- Requested Role
- Justification
- Expected Duration (hours)
- Requested Actions

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 20: PRIVILEGE_ELEVATION_APPROVED

**Description**: Privilege elevation request approved

**Required Fields**:
- Event ID
- Event Type: PRIVILEGE_ELEVATION_APPROVED
- Timestamp
- User ID (requester)
- Username (requester)
- Approver ID
- Approver Username
- Current Role
- Elevated Role
- Approval Reason
- Elevation Duration (hours)
- Privilege Token

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

### Event 21: PRIVILEGE_ELEVATION_DENIED

**Description**: Privilege elevation request denied

**Required Fields**:
- Event ID
- Event Type: PRIVILEGE_ELEVATION_DENIED
- Timestamp
- User ID (requester)
- Username (requester)
- Approver ID
- Approver Username
- Current Role
- Requested Role
- Denial Reason

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 22: PRIVILEGE_ELEVATION_REVOKED

**Description**: Elevated privileges revoked (expired or manually revoked)

**Required Fields**:
- Event ID
- Event Type: PRIVILEGE_ELEVATION_REVOKED
- Timestamp
- User ID
- Username
- Elevated Role
- Current Role (after revocation)
- Revocation Reason (expired, manual revocation, policy violation)
- Revoked By (system, admin)

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

## Category 6: Session Management

### Event 23: SESSION_CREATED

**Description**: New user session created

**Required Fields**:
- Event ID
- Event Type: SESSION_CREATED
- Timestamp
- User ID
- Username
- Session ID
- IP Address
- Device Fingerprint
- Geographic Location
- Session Expiration Time

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 24: SESSION_TERMINATED_TIMEOUT

**Description**: Session terminated due to timeout (idle or absolute)

**Required Fields**:
- Event ID
- Event Type: SESSION_TERMINATED_TIMEOUT
- Timestamp
- User ID
- Username
- Session ID
- Session Duration (seconds)
- Termination Reason (idle timeout, absolute timeout)

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 25: SESSION_TERMINATED_RISK

**Description**: Session terminated due to risk score exceeding threshold

**Required Fields**:
- Event ID
- Event Type: SESSION_TERMINATED_RISK
- Timestamp
- User ID
- Username
- Session ID
- Risk Score
- Risk Factors (list)
- Risk Threshold

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

### Event 26: SESSION_TERMINATED_ADMIN

**Description**: Session terminated by administrator

**Required Fields**:
- Event ID
- Event Type: SESSION_TERMINATED_ADMIN
- Timestamp
- User ID (session owner)
- Username (session owner)
- Session ID
- Admin ID
- Admin Username
- Termination Reason

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

### Event 27: CONCURRENT_SESSION_DETECTED

**Description**: User logged in from multiple locations simultaneously

**Required Fields**:
- Event ID
- Event Type: CONCURRENT_SESSION_DETECTED
- Timestamp
- User ID
- Username
- Session 1 ID
- Session 1 IP Address
- Session 1 Location
- Session 2 ID
- Session 2 IP Address
- Session 2 Location
- Action Taken (terminate oldest, require re-authentication)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

## Category 7: Identity Changes

### Event 28: PASSWORD_CHANGED

**Description**: User password changed

**Required Fields**:
- Event ID
- Event Type: PASSWORD_CHANGED
- Timestamp
- User ID
- Username
- Changed By (user, admin, system)
- Change Reason (user request, admin reset, policy requirement)
- IP Address

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 29: PASSWORD_RESET_REQUESTED

**Description**: User requested password reset

**Required Fields**:
- Event ID
- Event Type: PASSWORD_RESET_REQUESTED
- Timestamp
- User ID
- Username
- IP Address
- Reset Token Generated

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 30: PASSWORD_RESET_COMPLETED

**Description**: User completed password reset

**Required Fields**:
- Event ID
- Event Type: PASSWORD_RESET_COMPLETED
- Timestamp
- User ID
- Username
- IP Address
- Reset Token Used

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 31: ROLE_ASSIGNED

**Description**: Role assigned to user

**Required Fields**:
- Event ID
- Event Type: ROLE_ASSIGNED
- Timestamp
- User ID
- Username
- Role Assigned
- Assigned By (admin ID, username)
- Assignment Reason

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

### Event 32: ROLE_REVOKED

**Description**: Role revoked from user

**Required Fields**:
- Event ID
- Event Type: ROLE_REVOKED
- Timestamp
- User ID
- Username
- Role Revoked
- Revoked By (admin ID, username)
- Revocation Reason

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

## Category 8: Account Lockouts

### Event 33: ACCOUNT_LOCKED_FAILED_ATTEMPTS

**Description**: Account locked due to too many failed login attempts

**Required Fields**:
- Event ID
- Event Type: ACCOUNT_LOCKED_FAILED_ATTEMPTS
- Timestamp
- User ID
- Username
- Failed Attempt Count
- Lock Duration (hours)
- IP Address (last attempt)

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

### Event 34: ACCOUNT_LOCKED_SECURITY_INCIDENT

**Description**: Account locked due to security incident

**Required Fields**:
- Event ID
- Event Type: ACCOUNT_LOCKED_SECURITY_INCIDENT
- Timestamp
- User ID
- Username
- Incident ID
- Incident Type (compromise, insider threat, policy violation)
- Locked By (admin ID, username)
- Lock Reason

**Severity Level**: CRITICAL

**Genesis Preservation**: Yes (7 years)

---

### Event 35: ACCOUNT_UNLOCKED

**Description**: Account unlocked

**Required Fields**:
- Event ID
- Event Type: ACCOUNT_UNLOCKED
- Timestamp
- User ID
- Username
- Unlocked By (admin ID, username, system)
- Unlock Reason
- Lock Duration (hours)

**Severity Level**: INFO

**Genesis Preservation**: Yes (7 years)

---

### Event 36: ACCOUNT_DISABLED

**Description**: Account disabled (deactivation, termination)

**Required Fields**:
- Event ID
- Event Type: ACCOUNT_DISABLED
- Timestamp
- User ID
- Username
- Disabled By (admin ID, username)
- Disable Reason (termination, deactivation, policy violation)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

### Event 37: ACCOUNT_DELETED

**Description**: Account permanently deleted

**Required Fields**:
- Event ID
- Event Type: ACCOUNT_DELETED
- Timestamp
- User ID
- Username
- Deleted By (admin ID, username)
- Deletion Reason
- Four-Eyes Approver ID
- Four-Eyes Approver Username

**Severity Level**: CRITICAL

**Genesis Preservation**: Yes (7 years)

---

## Category 9: API Key Misuse

### Event 38: API_KEY_CREATED

**Description**: New API key created

**Required Fields**:
- Event ID
- Event Type: API_KEY_CREATED
- Timestamp
- API Key ID
- API Key Name
- Created By (user ID, username)
- Scopes (permissions)
- IP Whitelist
- Expiration Date

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 39: API_KEY_REVOKED

**Description**: API key revoked

**Required Fields**:
- Event ID
- Event Type: API_KEY_REVOKED
- Timestamp
- API Key ID
- API Key Name
- Revoked By (user ID, username, admin ID)
- Revocation Reason

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 40: API_KEY_RATE_LIMIT_EXCEEDED

**Description**: API key exceeded rate limit

**Required Fields**:
- Event ID
- Event Type: API_KEY_RATE_LIMIT_EXCEEDED
- Timestamp
- API Key ID
- API Key Name
- IP Address
- Request Count (in time window)
- Rate Limit
- Time Window (seconds)

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 41: API_KEY_SCOPE_VIOLATION

**Description**: API key attempted action outside allowed scopes

**Required Fields**:
- Event ID
- Event Type: API_KEY_SCOPE_VIOLATION
- Timestamp
- API Key ID
- API Key Name
- IP Address
- Requested Action
- Allowed Scopes
- Violation Type

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

### Event 42: API_KEY_IP_WHITELIST_VIOLATION

**Description**: API key used from IP address not in whitelist

**Required Fields**:
- Event ID
- Event Type: API_KEY_IP_WHITELIST_VIOLATION
- Timestamp
- API Key ID
- API Key Name
- IP Address (actual)
- IP Whitelist (allowed)
- Geographic Location

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

## Category 10: Policy Violations

### Event 43: FOUR_EYES_APPROVAL_REQUIRED

**Description**: Action requires Four-Eyes approval

**Required Fields**:
- Event ID
- Event Type: FOUR_EYES_APPROVAL_REQUIRED
- Timestamp
- User ID (requester)
- Username (requester)
- Requested Action
- Justification
- Approval Request ID

**Severity Level**: INFO

**Genesis Preservation**: Yes (7 years)

---

### Event 44: FOUR_EYES_APPROVAL_GRANTED

**Description**: Four-Eyes approval granted

**Required Fields**:
- Event ID
- Event Type: FOUR_EYES_APPROVAL_GRANTED
- Timestamp
- User ID (requester)
- Username (requester)
- Approver ID
- Approver Username
- Requested Action
- Approval Token
- Token Expiration

**Severity Level**: WARNING

**Genesis Preservation**: Yes (7 years)

---

### Event 45: FOUR_EYES_APPROVAL_DENIED

**Description**: Four-Eyes approval denied

**Required Fields**:
- Event ID
- Event Type: FOUR_EYES_APPROVAL_DENIED
- Timestamp
- User ID (requester)
- Username (requester)
- Approver ID
- Approver Username
- Requested Action
- Denial Reason

**Severity Level**: INFO

**Genesis Preservation**: Yes (7 years)

---

### Event 46: TOXIC_COMBINATION_DETECTED

**Description**: Toxic role combination detected

**Required Fields**:
- Event ID
- Event Type: TOXIC_COMBINATION_DETECTED
- Timestamp
- User ID
- Username
- Role 1
- Role 2
- Detected By (system, admin)
- Action Taken (prevent assignment, alert admin)

**Severity Level**: ERROR

**Genesis Preservation**: Yes (7 years)

---

### Event 47: BREAK_GLASS_ACCOUNT_ACCESSED

**Description**: Break-glass emergency account accessed

**Required Fields**:
- Event ID
- Event Type: BREAK_GLASS_ACCOUNT_ACCESSED
- Timestamp
- Break-Glass Account ID
- Accessed By (personnel names)
- Access Reason (emergency type)
- Envelope Opened (yes/no)
- CISO Notified (yes/no)

**Severity Level**: CRITICAL

**Genesis Preservation**: Yes (7 years)

---

## Category 11: SSO Integration Events

### Event 48: SSO_LOGIN_SUCCESS

**Description**: User successfully authenticated via SSO

**Required Fields**:
- Event ID
- Event Type: SSO_LOGIN_SUCCESS
- Timestamp
- User ID
- Username
- SSO Provider (Google, Microsoft, Okta)
- SSO Token
- IP Address
- Device Fingerprint

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

### Event 49: SSO_LOGIN_FAILURE

**Description**: User failed to authenticate via SSO

**Required Fields**:
- Event ID
- Event Type: SSO_LOGIN_FAILURE
- Timestamp
- Username (attempted)
- SSO Provider
- Failure Reason
- IP Address

**Severity Level**: WARNING

**Genesis Preservation**: Yes (1 year)

---

### Event 50: SSO_TOKEN_EXPIRED

**Description**: SSO token expired, re-authentication required

**Required Fields**:
- Event ID
- Event Type: SSO_TOKEN_EXPIRED
- Timestamp
- User ID
- Username
- SSO Provider
- Token Expiration Time
- Session ID

**Severity Level**: INFO

**Genesis Preservation**: Yes (1 year)

---

## Event Severity Levels

| Severity | Description | Response |
|----------|-------------|----------|
| INFO | Informational event, normal operations | Log only |
| WARNING | Potential security concern, requires monitoring | Log + alert security team (if pattern detected) |
| ERROR | Security violation, requires investigation | Log + alert security team + investigate |
| CRITICAL | Severe security incident, requires immediate action | Log + alert CISO + lock account + investigate |

---

## Genesis Archive™ Preservation Summary

| Event Category | Preservation | Retention |
|----------------|--------------|-----------|
| Login Events | Yes | 1 year |
| Failed Login Events | Yes | 1-7 years (severity-dependent) |
| MFA Challenges | Yes | 1 year |
| Step-Up Authentication | Yes | 1 year |
| Privilege Elevation | Yes | 7 years |
| Session Management | Yes | 1-7 years (severity-dependent) |
| Identity Changes | Yes | 1-7 years (severity-dependent) |
| Account Lockouts | Yes | 7 years |
| API Key Misuse | Yes | 1-7 years (severity-dependent) |
| Policy Violations | Yes | 7 years |
| SSO Integration Events | Yes | 1 year |

---

## Event Log Format

All events logged in standardized JSON format:

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "LOGIN_SUCCESS",
  "timestamp": "2025-12-01T23:30:00.000Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "analyst@ghostquant.com",
  "role": "Analyst",
  "ip_address": "192.168.1.100",
  "device_fingerprint": "abc123def456",
  "geographic_location": {
    "city": "San Francisco",
    "country": "USA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "authentication_method": "password + FIDO2",
  "session_id": "789e0123-e45b-67c8-d901-234567890abc",
  "risk_score": 0.15,
  "genesis_block": 12345,
  "genesis_hash": "0x1234567890abcdef..."
}
```

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Privileged Access Management**: See privileged_access_management.md
- **Multi-Factor Authentication**: See multi_factor_authentication_standard.md
- **IAM System Mapping**: See iam_system_mapping.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial authentication event catalog |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

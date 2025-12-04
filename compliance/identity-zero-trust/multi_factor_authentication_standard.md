# Multi-Factor Authentication Standard
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document defines comprehensive Multi-Factor Authentication (MFA) requirements and standards for GhostQuant™, implementing federal-grade authentication controls per NIST 800-63B, CJIS 5.6, SOC 2 CC6.1, and FedRAMP IA-2 requirements.

---

## MFA Overview

Multi-Factor Authentication (MFA) requires users to provide two or more independent authentication factors to verify their identity:

1. **Something You Know**: Password, PIN, security question
2. **Something You Have**: Hardware token, smartphone, smart card
3. **Something You Are**: Biometric (fingerprint, face, iris)

**GhostQuant™ MFA Policy**: All users must use MFA. Admins and SuperAdmins must use FIDO2/WebAuthn hardware tokens.

---

## Mandatory MFA for All Users

### MFA Requirement

**All Users Must Use MFA**:
- Viewer: MFA required (TOTP or FIDO2)
- Analyst: MFA required (TOTP or FIDO2)
- Senior Analyst: MFA required (FIDO2 recommended)
- Admin: MFA required (FIDO2 mandatory)
- SuperAdmin: MFA required (FIDO2 mandatory)
- API: API Key + Secret (no MFA)
- System: Service Account + mTLS (no MFA)

**No Exceptions**: MFA cannot be disabled for any user account (except API and System accounts)

---

### MFA Enrollment

**Enrollment Timing**: MFA must be enrolled during initial login (Day 0)

**Enrollment Workflow**:
1. User completes initial login with username + temporary password
2. System forces password change
3. User creates new strong password
4. System requires MFA enrollment
5. User selects MFA method (TOTP, FIDO2, WebAuthn)
6. User enrolls MFA device
7. System verifies MFA enrollment
8. System generates backup codes (10 codes)
9. User saves backup codes securely
10. System logs MFA enrollment event
11. User completes initial login

**Enrollment Verification**:
- User must successfully authenticate with MFA before access granted
- System verifies MFA device works correctly
- System logs successful MFA verification

---

### MFA Re-Enrollment

**Re-Enrollment Triggers**:
- MFA device lost or stolen
- MFA device compromised
- MFA device replaced
- Semi-annual MFA re-binding (security requirement)

**Re-Enrollment Workflow**:
1. User requests MFA re-enrollment
2. User verifies identity (password + backup code or manager approval)
3. System disables old MFA device
4. User enrolls new MFA device
5. System verifies new MFA enrollment
6. System generates new backup codes
7. User saves new backup codes securely
8. System logs MFA re-enrollment event

---

## Mandatory FIDO2/WebAuthn for Admins

### FIDO2/WebAuthn Requirement

**Admin and SuperAdmin Must Use FIDO2/WebAuthn**:
- FIDO2 hardware security keys (Yubikey, Titan, etc.)
- WebAuthn platform authenticators (Windows Hello, Touch ID, Face ID)
- No TOTP allowed for Admin/SuperAdmin

**Rationale**:
- FIDO2/WebAuthn resistant to phishing attacks
- FIDO2/WebAuthn resistant to man-in-the-middle attacks
- FIDO2/WebAuthn provides cryptographic proof of authentication
- FIDO2/WebAuthn meets NIST AAL3 requirements

---

### FIDO2 Enrollment Workflow

**Step 1: Hardware Token Acquisition**

**Procurement**:
- Company provides FIDO2 hardware tokens to all Admins/SuperAdmins
- Recommended: Yubikey 5 NFC or Yubikey 5C NFC
- Backup token also provided (stored securely)

**Token Registration**:
- Token serial number recorded
- Token assigned to user
- Token delivery logged

---

**Step 2: FIDO2 Enrollment**

**Enrollment Actions**:
1. User completes initial login with username + password
2. System requires FIDO2 enrollment
3. User inserts FIDO2 hardware token
4. User follows browser prompts to register token
5. User touches token to confirm registration
6. System verifies FIDO2 registration
7. System binds token to user account
8. System logs FIDO2 enrollment event

**Enrollment Verification**:
- User must successfully authenticate with FIDO2 before access granted
- System verifies FIDO2 token works correctly
- System logs successful FIDO2 verification

---

**Step 3: Backup Token Enrollment**

**Backup Token Purpose**: Backup token used if primary token lost, stolen, or malfunctioning

**Backup Enrollment Actions**:
1. User enrolls backup FIDO2 token
2. User stores backup token in secure location (home safe, bank safe deposit box)
3. System logs backup token enrollment

---

### WebAuthn Enrollment Workflow

**WebAuthn Platform Authenticators**:
- Windows Hello (Windows 10/11)
- Touch ID (macOS, iOS)
- Face ID (iOS, iPadOS)
- Android Biometric Authentication

**Enrollment Actions**:
1. User completes initial login with username + password
2. System requires WebAuthn enrollment
3. User follows browser prompts to register platform authenticator
4. User provides biometric (fingerprint, face)
5. System verifies WebAuthn registration
6. System binds authenticator to user account
7. System logs WebAuthn enrollment event

---

## Device Binding Rules

### Device Binding Purpose

Device binding ties user accounts to specific trusted devices, preventing unauthorized access from unknown devices.

---

### Device Fingerprinting

**Device Fingerprint Components**:
- Browser User-Agent
- Screen resolution
- Timezone
- Language
- Installed fonts
- Canvas fingerprint
- WebGL fingerprint
- Audio fingerprint
- Hardware concurrency
- Device memory
- Platform
- Plugins

**Fingerprint Generation**:
- System collects device attributes
- System generates SHA-256 hash of attributes
- Hash serves as device fingerprint
- Fingerprint stored with user account

---

### Device Registration

**Registration Workflow**:
1. User completes initial login with username + password + MFA
2. System generates device fingerprint
3. System prompts user to register device
4. User confirms device registration
5. System binds device fingerprint to user account
6. System logs device registration event

**Registered Device Attributes**:
- Device Fingerprint (SHA-256 hash)
- Device Name (user-provided)
- Device Type (desktop, laptop, mobile, tablet)
- Operating System
- Browser
- Registration Date
- Last Used Date
- Trust Level (trusted, untrusted)

---

### Device Verification

**Verification Workflow**:
1. User attempts login
2. System generates device fingerprint
3. System compares fingerprint to registered devices
4. If match found: Device trusted, proceed to authentication
5. If no match: Device untrusted, require additional verification

**Additional Verification for Untrusted Devices**:
- Step-up authentication (re-verify MFA)
- Email verification (send verification code to registered email)
- Manager approval (for high-risk accounts)
- Risk score increase (device risk = 0.3)

---

### Device Trust Levels

**Trusted Device**:
- Device registered and verified
- Device used within last 90 days
- No suspicious activity detected
- Risk score < 0.30

**Untrusted Device**:
- Device not registered
- Device not used within last 90 days
- Suspicious activity detected
- Risk score ≥ 0.30

**Compromised Device**:
- Device associated with fraud or security incident
- Device flagged by security team
- Access denied from compromised devices

---

## Session Expiration

### Session Timeout Rules

**Idle Timeout**: 15 minutes of inactivity
- User session locked after 15 minutes of inactivity
- User must re-authenticate to unlock session
- Session data preserved during lock

**Absolute Timeout**: 8 hours
- User session terminated after 8 hours (regardless of activity)
- User must re-authenticate to start new session
- Session data cleared on termination

**Privileged Session Timeout**: 1 hour
- Admin/SuperAdmin sessions terminated after 1 hour
- User must re-authenticate to start new privileged session
- All privileged actions logged

---

### Session Expiration Workflow

**Step 1: Session Activity Monitoring**

**Monitoring Actions**:
- System tracks last activity timestamp
- System calculates idle time (current time - last activity)
- System checks idle time every 60 seconds

---

**Step 2: Idle Timeout Warning**

**Warning Actions** (at 13 minutes idle):
- System displays warning notification
- User has 2 minutes to resume activity
- If user resumes activity: Reset idle timer
- If user does not resume activity: Lock session

---

**Step 3: Session Lock** (at 15 minutes idle)

**Lock Actions**:
1. System locks session
2. System displays lock screen
3. System preserves session data
4. System logs session lock event

**Unlock Actions**:
1. User enters password
2. User verifies MFA (if required by policy)
3. System verifies credentials
4. System unlocks session
5. System logs session unlock event

---

**Step 4: Absolute Timeout** (at 8 hours)

**Termination Actions**:
1. System terminates session
2. System invalidates session token
3. System clears session data
4. System logs session termination event
5. User redirected to login page

---

## Step-Up Authentication

### Step-Up Authentication Purpose

Step-up authentication requires users to re-authenticate when performing sensitive actions or when risk score increases, providing additional security for high-risk operations.

---

### Step-Up Authentication Triggers

**Sensitive Actions**:
- Export intelligence data
- Access Genesis Archive™
- Modify system configuration
- Delete user account
- Deploy production update
- Access break-glass account
- Override security policy

**Risk Score Increase**:
- Risk score ≥ 0.30 (moderate risk)
- Device fingerprint mismatch
- Location change (different country)
- Velocity anomaly detected
- Suspicious activity detected

**Time-Based**:
- 4 hours since last authentication
- 1 hour since privilege elevation

---

### Step-Up Authentication Workflow

**Step 1: Step-Up Authentication Challenge**

**Challenge Actions**:
1. User attempts sensitive action or risk score increases
2. System detects step-up authentication required
3. System displays step-up authentication challenge
4. System logs step-up authentication challenge event

---

**Step 2: User Re-Authentication**

**Re-Authentication Actions**:
1. User re-enters password
2. User re-verifies MFA (FIDO2/TOTP/WebAuthn)
3. System verifies credentials
4. System verifies MFA
5. System logs step-up authentication success

---

**Step 3: Action Authorization**

**Authorization Actions**:
1. System grants time-limited authorization token (1 hour)
2. User performs sensitive action using authorization token
3. System logs action with step-up authentication indicator
4. Authorization token expires after 1 hour

---

## High-Risk Triggers Force Re-Authentication

### High-Risk Triggers

**Trigger 1: Risk Score ≥ 0.70**
- Risk score elevated to high level
- Immediate session termination
- User must re-authenticate to start new session

**Trigger 2: Device Fingerprint Mismatch**
- Device fingerprint changed significantly
- Possible device compromise or spoofing
- Require step-up authentication

**Trigger 3: Location Change (Different Country)**
- User IP address changed to different country
- Possible account compromise or VPN usage
- Require step-up authentication + email verification

**Trigger 4: Concurrent Sessions Detected**
- User logged in from multiple locations simultaneously
- Possible account sharing or compromise
- Terminate oldest session, require re-authentication for new session

**Trigger 5: Velocity Anomaly**
- User performing actions faster than humanly possible
- Possible automation or bot activity
- Require step-up authentication + CAPTCHA

**Trigger 6: Suspicious Activity Detected**
- Unusual access patterns
- Access to resources outside normal scope
- Failed authentication attempts
- Require step-up authentication

**Trigger 7: Hydra Cluster Association**
- User entity associated with Hydra-detected manipulation cluster
- Possible coordinated fraud activity
- Terminate session, lock account, alert security team

**Trigger 8: Constellation Supernova Alert**
- User entity part of Constellation-detected geographic concentration
- Possible coordinated activity
- Require step-up authentication + manager approval

---

### Re-Authentication Workflow

**Step 1: High-Risk Trigger Detection**

**Detection Actions**:
1. System detects high-risk trigger
2. System calculates risk score
3. If risk score ≥ 0.70: Terminate session immediately
4. If risk score 0.30-0.69: Require step-up authentication
5. System logs high-risk trigger event

---

**Step 2: Session Termination** (if risk ≥ 0.70)

**Termination Actions**:
1. System terminates session immediately
2. System invalidates session token
3. System clears session data
4. System displays termination message
5. System logs session termination event
6. User redirected to login page

---

**Step 3: Re-Authentication**

**Re-Authentication Actions**:
1. User enters username + password
2. User verifies MFA (FIDO2/TOTP/WebAuthn)
3. System verifies credentials
4. System verifies MFA
5. System generates new device fingerprint
6. System compares to registered devices
7. If device untrusted: Require email verification
8. System calculates new risk score
9. If risk score acceptable: Grant access
10. System logs re-authentication event

---

## Allowed MFA Mechanisms

### FIDO2 (Fast Identity Online 2)

**Description**: Hardware-based authentication using cryptographic keys stored on physical security token

**Supported Tokens**:
- Yubikey 5 Series (NFC, USB-A, USB-C)
- Yubikey Security Key Series
- Google Titan Security Key
- Feitian ePass FIDO2
- Thetis FIDO2 Security Key

**Advantages**:
- Phishing-resistant
- Man-in-the-middle resistant
- No shared secrets
- Cryptographic proof of authentication
- Meets NIST AAL3 requirements

**Required For**:
- Admin (mandatory)
- SuperAdmin (mandatory)
- Senior Analyst (recommended)

**Enrollment**: See FIDO2 Enrollment Workflow above

---

### TOTP (Time-Based One-Time Password) - RFC 6238

**Description**: Software-based authentication using time-synchronized one-time passwords

**Supported Apps**:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator

**Advantages**:
- No additional hardware required
- Works offline
- Widely supported

**Disadvantages**:
- Vulnerable to phishing (user can be tricked into entering code on fake site)
- Vulnerable to man-in-the-middle attacks
- Shared secret stored on device

**Allowed For**:
- Viewer (allowed)
- Analyst (allowed)
- Senior Analyst (allowed, but FIDO2 recommended)

**Not Allowed For**:
- Admin (FIDO2 required)
- SuperAdmin (FIDO2 required)

**Enrollment Workflow**:
1. User completes initial login with username + password
2. System requires TOTP enrollment
3. System generates TOTP secret
4. System displays QR code
5. User scans QR code with authenticator app
6. User enters TOTP code from app
7. System verifies TOTP code
8. System binds TOTP secret to user account
9. System generates backup codes
10. System logs TOTP enrollment event

---

### WebAuthn (Web Authentication)

**Description**: Browser-based authentication using platform authenticators (biometrics)

**Supported Platform Authenticators**:
- Windows Hello (fingerprint, face, PIN)
- Touch ID (macOS, iOS)
- Face ID (iOS, iPadOS)
- Android Biometric Authentication

**Advantages**:
- Phishing-resistant
- No additional hardware required
- Convenient (biometric)
- Meets NIST AAL2 requirements

**Disadvantages**:
- Requires compatible device
- Requires browser support
- Biometric data stored on device (privacy concern for some users)

**Allowed For**:
- Viewer (allowed)
- Analyst (allowed)
- Senior Analyst (allowed)
- Admin (allowed, but FIDO2 hardware token recommended)
- SuperAdmin (allowed, but FIDO2 hardware token recommended)

**Enrollment Workflow**:
1. User completes initial login with username + password
2. System requires WebAuthn enrollment
3. System checks browser support
4. User follows browser prompts to register platform authenticator
5. User provides biometric (fingerprint, face) or PIN
6. System verifies WebAuthn registration
7. System binds authenticator to user account
8. System logs WebAuthn enrollment event

---

### Hardware Tokens (Yubikey)

**Description**: Physical hardware tokens that generate one-time passwords or cryptographic signatures

**Supported Tokens**:
- Yubikey 5 Series (FIDO2 + OTP)
- Yubikey Security Key Series (FIDO2 only)

**Advantages**:
- Phishing-resistant (FIDO2 mode)
- Durable and reliable
- Supports multiple protocols (FIDO2, OTP, PIV, OpenPGP)
- No battery required

**Disadvantages**:
- Additional hardware cost
- Can be lost or stolen
- Requires USB port or NFC

**Required For**:
- Admin (mandatory)
- SuperAdmin (mandatory)

**Recommended For**:
- Senior Analyst

**Enrollment**: See FIDO2 Enrollment Workflow above

---

## MFA Backup and Recovery

### Backup Codes

**Purpose**: Backup codes allow users to authenticate if primary MFA device is unavailable

**Backup Code Generation**:
- 10 single-use backup codes generated during MFA enrollment
- Each code is 8 alphanumeric characters
- Codes cryptographically random
- Codes hashed and stored securely

**Backup Code Storage**:
- User must save backup codes in secure location
- Recommended: Password manager, encrypted file, physical safe
- Not recommended: Plain text file, email, cloud storage

**Backup Code Usage**:
1. User attempts login
2. User enters username + password
3. System requires MFA
4. User selects "Use backup code"
5. User enters backup code
6. System verifies backup code
7. System marks backup code as used
8. System grants access
9. System logs backup code usage
10. System reminds user to re-enroll MFA device

**Backup Code Regeneration**:
- User can regenerate backup codes at any time
- Old backup codes invalidated when new codes generated
- User must save new backup codes securely

---

### MFA Device Lost or Stolen

**Recovery Workflow**:

**Step 1: User Reports Lost/Stolen Device**

**Reporting Methods**:
- Self-service portal (if user can still authenticate with backup code)
- Help desk (if user cannot authenticate)
- Manager (if user cannot authenticate)

**Reporting Information**:
- User identity
- Device lost/stolen
- Date/time of loss
- Circumstances of loss

---

**Step 2: Identity Verification**

**Verification Methods**:
- Backup code (if available)
- Manager approval
- Security questions
- In-person verification (for high-security accounts)

**Verification Actions**:
1. Help desk verifies user identity
2. Help desk confirms device lost/stolen
3. Help desk approves MFA reset
4. Help desk logs MFA reset request

---

**Step 3: MFA Device Disable**

**Disable Actions**:
1. Help desk disables lost/stolen MFA device
2. System invalidates device binding
3. System logs MFA device disable event
4. System notifies user and manager

---

**Step 4: MFA Re-Enrollment**

**Re-Enrollment Actions**:
1. User enrolls new MFA device
2. System verifies new MFA enrollment
3. System generates new backup codes
4. User saves new backup codes securely
5. System logs MFA re-enrollment event

---

### MFA Device Compromised

**Compromise Indicators**:
- Unauthorized access detected
- MFA device used from unexpected location
- Multiple failed MFA attempts
- Security incident involving user account

**Response Workflow**:

**Step 1: Compromise Detection**

**Detection Actions**:
1. Security team detects compromise indicators
2. Security team investigates incident
3. Security team confirms compromise
4. Security team logs compromise event

---

**Step 2: Immediate Account Lockout**

**Lockout Actions**:
1. Security team locks user account
2. System invalidates all sessions
3. System disables all MFA devices
4. System logs account lockout event
5. System notifies user and manager

---

**Step 3: Incident Investigation**

**Investigation Actions**:
1. Security team reviews user activity logs
2. Security team reviews Genesis Archive™
3. Security team interviews user
4. Security team determines root cause
5. Security team documents findings

---

**Step 4: Account Recovery**

**Recovery Actions**:
1. User verifies identity (in-person or video call)
2. User enrolls new MFA device
3. User creates new password
4. Security team unlocks account
5. Security team monitors account for suspicious activity
6. System logs account recovery event

---

## Compliance Mapping

### NIST 800-63B (Digital Identity Guidelines)

| Authenticator Assurance Level | Requirement | GhostQuant™ Implementation |
|-------------------------------|-------------|----------------------------|
| AAL1 | Single-factor authentication | Not used (all users require MFA) |
| AAL2 | Multi-factor authentication | Viewer, Analyst, Senior Analyst (TOTP or FIDO2) |
| AAL3 | Hardware-based multi-factor authentication | Admin, SuperAdmin (FIDO2 mandatory) |

---

### CJIS 5.6 (Identification and Authentication)

| Control | Requirement | GhostQuant™ Implementation |
|---------|-------------|----------------------------|
| 5.6.2.1 | Multi-factor authentication for remote access | All users require MFA |
| 5.6.2.2 | Cryptographically based authentication | FIDO2 uses cryptographic keys |
| 5.6.2.3 | Biometric authentication | WebAuthn supports biometric authentication |

---

### SOC 2 CC6.1 (Logical Access)

| Criterion | Requirement | GhostQuant™ Implementation |
|-----------|-------------|----------------------------|
| CC6.1 | Logical access security measures | MFA required for all users |
| CC6.2 | New user registration and authorization | MFA enrollment during onboarding |
| CC6.3 | User access modifications | MFA re-enrollment when access changes |

---

### FedRAMP IA-2 (Identification and Authentication)

| Control | Baseline | GhostQuant™ Implementation |
|---------|----------|----------------------------|
| IA-2 | Moderate | All users require MFA |
| IA-2(1) | Moderate | Multi-factor authentication for network access |
| IA-2(2) | Moderate | Multi-factor authentication for privileged accounts (FIDO2) |
| IA-2(11) | Moderate | Remote access requires MFA |

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Identity Lifecycle**: See identity_lifecycle_procedures.md
- **Privileged Access Management**: See privileged_access_management.md
- **Authentication Events**: See authentication_event_catalog.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial MFA standard |

**Review Schedule:** Annually  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

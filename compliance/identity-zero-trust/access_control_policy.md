# Access Control Policy
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Policy Purpose

This Access Control Policy establishes comprehensive, federal-grade access control requirements for GhostQuant™, a cryptocurrency intelligence platform processing sensitive financial intelligence, predictive analytics, and regulatory compliance data.

**Policy Objectives**:

1. **Protect Sensitive Intelligence**: Ensure only authorized personnel can access, modify, or export cryptocurrency intelligence, fraud detection patterns, manipulation detection algorithms, and predictive risk assessments.

2. **Enforce Least Privilege**: Grant users the minimum access required to perform their job functions, for the minimum time required, with continuous validation.

3. **Maintain Regulatory Compliance**: Comply with NIST 800-53 AC family, CJIS identity requirements, SOC 2 CC6/CC7, FedRAMP AC controls, and other regulatory frameworks.

4. **Enable Audit and Accountability**: Maintain comprehensive audit trails linking every access decision and action to a verified identity for forensic investigations, regulatory examinations, and legal proceedings.

5. **Prevent Insider Threats**: Implement separation of duties, Four-Eyes approval, and continuous monitoring to detect and prevent insider threats.

---

## Roles Defined

GhostQuant™ implements a role-based access control (RBAC) model with seven distinct roles, each with specific permissions and restrictions.

### Role 1: Viewer

**Purpose**: Read-only access to non-sensitive intelligence dashboards and reports.

**Typical Users**: Business stakeholders, executives, external auditors (limited scope)

**Permissions**:
- View public dashboards
- View aggregated intelligence reports
- View system status
- View public documentation

**Restrictions**:
- Cannot access raw intelligence data
- Cannot access sensitive investigations
- Cannot export data
- Cannot modify any settings
- Cannot access audit logs
- Cannot access Genesis Archive™

**Access Duration**: Indefinite (subject to annual recertification)

**MFA Required**: Yes

**FIDO2/WebAuthn Required**: No

---

### Role 2: Analyst

**Purpose**: Operational intelligence analysis, investigation, and reporting.

**Typical Users**: Intelligence analysts, fraud investigators, compliance analysts

**Permissions**:
- All Viewer permissions
- View intelligence engine outputs (Sentinel, UltraFusion, Hydra, Constellation, Radar, Actor Profiler, Oracle Eye, Cortex)
- View GhostPredictor™ risk predictions
- View entity profiles and risk scores
- View transaction analysis
- View manipulation detection results
- Create and manage investigations
- Generate intelligence reports
- View audit logs (own actions only)
- Request data exports (requires approval)

**Restrictions**:
- Cannot access raw event data
- Cannot modify intelligence engine configurations
- Cannot access Genesis Archive™ directly
- Cannot manage user accounts
- Cannot modify system settings
- Cannot approve privilege elevation
- Cannot access privileged audit logs

**Access Duration**: Indefinite (subject to quarterly recertification)

**MFA Required**: Yes

**FIDO2/WebAuthn Required**: No (recommended)

---

### Role 3: Senior Analyst

**Purpose**: Advanced intelligence analysis, investigation oversight, and export approval.

**Typical Users**: Senior intelligence analysts, investigation managers, compliance officers

**Permissions**:
- All Analyst permissions
- View raw event data (with justification)
- Access Genesis Archive™ (read-only)
- Approve data export requests
- Oversee investigations
- Access privileged audit logs (investigation-related)
- Generate compliance reports
- Request privilege elevation (requires approval)

**Restrictions**:
- Cannot modify intelligence engine configurations
- Cannot manage user accounts
- Cannot modify system settings
- Cannot deploy updates
- Cannot approve own privilege elevation

**Access Duration**: Indefinite (subject to quarterly recertification)

**MFA Required**: Yes

**FIDO2/WebAuthn Required**: Yes

---

### Role 4: Admin

**Purpose**: System administration, configuration management, and user account management.

**Typical Users**: System administrators, DevOps engineers, security engineers

**Permissions**:
- All Senior Analyst permissions
- Manage user accounts (create, modify, disable)
- Manage role assignments (except SuperAdmin)
- Modify system configurations
- Access system logs
- Manage API keys
- Manage secrets
- Deploy updates (non-production)
- Access all audit logs
- Manage monitoring and alerting

**Restrictions**:
- Cannot modify intelligence engine algorithms
- Cannot access Genesis Archive™ (write operations)
- Cannot approve own privilege elevation
- Cannot deploy production updates without approval
- Cannot delete audit logs
- Cannot disable security controls

**Access Duration**: Indefinite (subject to quarterly recertification)

**MFA Required**: Yes

**FIDO2/WebAuthn Required**: Yes

**Privileged Session Recording**: Yes

---

### Role 5: SuperAdmin

**Purpose**: Highest-level system administration with unrestricted access (subject to Four-Eyes approval for destructive actions).

**Typical Users**: CISO, CTO, designated emergency responders

**Permissions**:
- All Admin permissions
- Modify intelligence engine algorithms
- Access Genesis Archive™ (all operations)
- Deploy production updates
- Modify security controls
- Delete user accounts (with approval)
- Access break-glass accounts
- Override security policies (with approval and audit)
- Emergency system access

**Restrictions**:
- Cannot perform destructive actions without Four-Eyes approval
- Cannot disable audit logging
- Cannot delete Genesis Archive™ blocks
- Cannot modify own audit logs
- All actions recorded and preserved in Genesis Archive™

**Access Duration**: Time-limited (requires monthly recertification)

**MFA Required**: Yes

**FIDO2/WebAuthn Required**: Yes (mandatory)

**Privileged Session Recording**: Yes (mandatory)

**Four-Eyes Approval Required**: Yes (for destructive actions)

---

### Role 6: System

**Purpose**: Machine identity for autonomous intelligence engines and backend services.

**Typical Users**: Sentinel, UltraFusion, Hydra, Constellation, Radar, Actor Profiler, Oracle Eye, Cortex, GhostPredictor, Genesis

**Permissions**:
- Service-specific permissions
- Inter-engine communication
- Access to assigned resources
- Write to Genesis Archive™
- Generate intelligence outputs
- Trigger alerts

**Restrictions**:
- Cannot access resources outside assigned scope
- Cannot modify own permissions
- Cannot access user data
- Cannot perform administrative actions
- All actions logged and auditable

**Access Duration**: Indefinite (tied to service lifecycle)

**Authentication**: Service Account + API Key + mTLS

**Authorization**: Service-to-Service Authorization

---

### Role 7: API

**Purpose**: External system integration via API.

**Typical Users**: External applications, third-party integrations, partner systems

**Permissions**:
- API key-specific permissions
- Access to allowed endpoints
- Rate-limited requests
- IP-restricted access

**Restrictions**:
- Cannot access administrative functions
- Cannot modify system settings
- Cannot access audit logs
- Cannot access Genesis Archive™
- Subject to rate limits and quotas

**Access Duration**: Time-limited (requires annual renewal)

**Authentication**: API Key + Secret

**Authorization**: API Key Scopes + IP Whitelisting

---

## Least-Privilege Principles

GhostQuant™ enforces strict least-privilege principles to minimize risk of unauthorized access, data exfiltration, and insider threats.

### Principle 1: Minimum Access Required

**Definition**: Users are granted only the minimum access required to perform their assigned job functions.

**Implementation**:
- Default deny: All access denied unless explicitly granted
- Role-based access: Users assigned to roles matching job functions
- Resource-based access: Permissions scoped to specific resources
- Time-based access: Permissions granted for minimum time required

**Example**: An Analyst investigating a specific fraud case is granted access only to intelligence data related to that case, for the duration of the investigation.

---

### Principle 2: Separation of Duties

**Definition**: Critical functions are divided among multiple users to prevent fraud and errors.

**Implementation**:
- No single user can complete high-risk transactions alone
- Four-Eyes approval required for destructive actions
- Approval workflows enforce separation
- Toxic combinations prevented by policy

**Example**: A SuperAdmin cannot delete a user account without approval from another SuperAdmin. The approver cannot be the same person as the requester.

---

### Principle 3: Need-to-Know

**Definition**: Users are granted access only to information they need to know to perform their job functions.

**Implementation**:
- Case-based access control for investigations
- Data classification and labeling
- Access requests require justification
- Access automatically revoked when no longer needed

**Example**: An Analyst investigating Entity A cannot access intelligence data for Entity B unless justified and approved.

---

### Principle 4: Time-Limited Access

**Definition**: Access is granted for the minimum time required and automatically revoked when no longer needed.

**Implementation**:
- Session expiration (8 hours default)
- Privilege elevation expiration (1 hour default)
- Investigation access expiration (case closure)
- Periodic access recertification (quarterly)

**Example**: A Senior Analyst granted temporary SuperAdmin privileges for emergency maintenance has those privileges automatically revoked after 1 hour.

---

### Principle 5: Continuous Validation

**Definition**: Access is continuously validated throughout the session lifecycle based on identity, device, location, behavior, and risk.

**Implementation**:
- Risk-adaptive authorization
- Continuous session verification
- Behavioral anomaly detection
- Automatic session termination on risk threshold

**Example**: An Analyst's session is automatically terminated if their risk score exceeds 0.70 due to suspicious activity patterns.

---

## Access Evaluation Logic

GhostQuant™ uses a multi-factor access evaluation logic to make access decisions based on identity, device, location, behavior, risk, and policy.

### Evaluation Factors

**1. Identity Verification**:
- User authenticated with valid credentials
- MFA verified
- User account active and not locked
- User role assigned and valid

**2. Device Security**:
- Device fingerprint matches registered device
- Device not compromised
- Device meets security requirements
- Device not associated with fraud

**3. Location Verification**:
- IP address in allowed range
- Geographic location consistent with user profile
- Not accessing from high-risk country
- Not using Tor/VPN (unless authorized)

**4. Behavioral Analysis**:
- Activity patterns consistent with baseline
- No velocity anomalies
- No suspicious actions
- No toxic combinations

**5. Risk Assessment**:
- User risk score below threshold
- Device risk score below threshold
- Session risk score below threshold
- Resource risk score below threshold

**6. Policy Evaluation**:
- User role has permission for requested action
- Resource access policy allows access
- Time-based policy allows access
- No policy violations

---

### Access Decision Algorithm

```
function evaluateAccess(user, device, location, action, resource):
    # Step 1: Verify Identity
    if not verifyIdentity(user):
        return DENY("Identity verification failed")
    
    # Step 2: Check Device Security
    if not verifyDevice(device):
        return DENY("Device verification failed")
    
    # Step 3: Verify Location
    if not verifyLocation(location):
        return DENY("Location verification failed")
    
    # Step 4: Calculate Risk Score
    risk_score = calculateRiskScore(user, device, location, action, resource)
    
    if risk_score >= 0.90:
        return DENY("Risk score too high")
    elif risk_score >= 0.70:
        return TERMINATE_SESSION("Risk score elevated")
    elif risk_score >= 0.50:
        return RESTRICT_ACCESS("Risk score moderate")
    elif risk_score >= 0.30:
        return STEP_UP_AUTH("Risk score requires additional verification")
    
    # Step 5: Evaluate Policy
    if not evaluatePolicy(user.role, action, resource):
        return DENY("Policy violation")
    
    # Step 6: Check Separation of Duties
    if requiresFourEyes(action) and not hasApproval(user, action):
        return DENY("Four-Eyes approval required")
    
    # Step 7: Grant Access
    logAccessGrant(user, device, location, action, resource, risk_score)
    return ALLOW("Access granted")
```

---

## Enforcement Mechanisms

GhostQuant™ implements multiple enforcement mechanisms to ensure access control policies are consistently applied across all systems and resources.

### Mechanism 1: Policy Decision Point (PDP)

**Purpose**: Centralized policy evaluation engine that makes access decisions.

**Implementation**:
- Evaluates all access requests
- Applies access evaluation logic
- Returns access decision (ALLOW, DENY, STEP_UP_AUTH, RESTRICT_ACCESS, TERMINATE_SESSION)
- Logs all decisions

**Location**: Backend API Gateway

---

### Mechanism 2: Policy Enforcement Point (PEP)

**Purpose**: Enforces access decisions at resource boundaries.

**Implementation**:
- Intercepts all access requests
- Queries PDP for access decision
- Enforces decision (grant/deny access)
- Logs enforcement action

**Locations**:
- API Gateway (all API requests)
- Frontend Application (UI access)
- Intelligence Engines (engine-to-engine communication)
- Genesis Archive™ (ledger access)
- Database Layer (data access)

---

### Mechanism 3: Micro-Segmentation

**Purpose**: Divides network and resources into small isolated zones with strict access controls between zones.

**Implementation**:
- Network segmentation by resource type
- Service-to-service authentication
- Mutual TLS (mTLS) for inter-service communication
- Zero-trust network access

**Segments**:
- Frontend Zone (web application)
- API Gateway Zone (API endpoints)
- Intelligence Engine Zone (Sentinel, UltraFusion, Hydra, Constellation, Radar, Actor Profiler, Oracle Eye, Cortex, GhostPredictor)
- Genesis Archive™ Zone (immutable ledger)
- Database Zone (data storage)
- Admin Zone (administrative functions)

---

### Mechanism 4: Session Management

**Purpose**: Manages user sessions with continuous validation and automatic termination.

**Implementation**:
- Session creation on successful authentication
- Session binding to identity, device, and location
- Continuous session verification
- Automatic session expiration (8 hours)
- Risk-adaptive session termination

---

### Mechanism 5: Audit Logging

**Purpose**: Comprehensive logging of all access decisions and actions for audit and forensic investigation.

**Implementation**:
- Log all access requests
- Log all access decisions
- Log all actions performed
- Preserve logs in Genesis Archive™
- Immutable audit trail

---

## Separation of Duties Requirements

GhostQuant™ enforces strict separation of duties to prevent fraud, errors, and insider threats.

### Requirement 1: Four-Eyes Approval for Destructive Actions

**Destructive Actions Requiring Four-Eyes Approval**:
- Delete user account
- Delete investigation
- Modify intelligence engine algorithm
- Delete Genesis Archive™ export
- Disable security control
- Override security policy
- Deploy production update
- Modify audit log retention policy

**Approval Workflow**:
1. User requests destructive action
2. System generates approval request
3. Approver (different user, same or higher role) reviews request
4. Approver approves or denies request
5. If approved, system grants time-limited privilege token
6. User performs action using privilege token
7. System logs action with approver identity

**Restrictions**:
- Approver cannot be same user as requester
- Approver must have same or higher role
- Approval expires after 1 hour
- Approval cannot be reused

---

### Requirement 2: Toxic Combination Prevention

**Toxic Combinations** (prohibited role assignments for same user):
- Analyst + Admin (cannot analyze and administer)
- Senior Analyst + SuperAdmin (cannot approve and execute)
- Auditor + System Administrator (cannot audit and administer)

**Enforcement**:
- System prevents toxic role assignments
- Alerts generated if toxic combination detected
- Quarterly review of role assignments

---

### Requirement 3: Privilege Elevation Approval

**Privilege Elevation Scenarios**:
- Analyst requests Senior Analyst privileges
- Admin requests SuperAdmin privileges
- Temporary access to restricted resources

**Approval Workflow**:
1. User requests privilege elevation
2. User provides justification
3. Manager or designated approver reviews request
4. If approved, system grants time-limited elevated privileges
5. System logs elevation with approver identity
6. Privileges automatically revoked after expiration

**Restrictions**:
- Elevation expires after 1 hour (default)
- Elevation requires re-authentication
- All actions under elevated privileges logged

---

## Privilege Elevation Rules

### Rule 1: Justification Required

All privilege elevation requests must include detailed justification explaining:
- Why elevation is needed
- What actions will be performed
- How long elevation is needed
- What resources will be accessed

---

### Rule 2: Time-Limited Elevation

All privilege elevations are time-limited and automatically revoked after expiration:
- Default: 1 hour
- Maximum: 8 hours
- Extensions require new approval

---

### Rule 3: Re-Authentication Required

Privilege elevation requires step-up authentication:
- Re-enter password
- Re-verify MFA
- Verify device fingerprint

---

### Rule 4: Continuous Monitoring

All actions performed under elevated privileges are continuously monitored:
- Real-time alerting on suspicious actions
- Automatic termination on risk threshold
- Comprehensive audit logging

---

## API Key Security

### API Key Requirements

**1. Unique API Keys**: Each integration has unique API key

**2. Scoped Permissions**: API keys have specific scopes limiting access

**3. Rate Limiting**: API keys subject to rate limits

**4. IP Whitelisting**: API keys restricted to specific IP ranges

**5. Expiration**: API keys expire after 1 year (maximum)

**6. Rotation**: API keys rotated quarterly (recommended)

**7. Secure Storage**: API keys stored encrypted in secret store

**8. Audit Logging**: All API key usage logged

---

### API Key Lifecycle

**1. Creation**:
- Request submitted with justification
- Approver reviews and approves
- System generates API key + secret
- API key delivered securely to requester
- API key usage logged

**2. Usage**:
- API key included in request header
- System validates API key
- System checks scopes, rate limits, IP whitelist
- System logs request
- System enforces access decision

**3. Rotation**:
- New API key generated
- Old API key marked for deprecation
- Grace period for migration (30 days)
- Old API key revoked after grace period

**4. Revocation**:
- API key immediately revoked
- All requests with revoked key denied
- Revocation logged

---

## Secret Store Requirements

GhostQuant™ uses a secure secret store for managing sensitive credentials, API keys, certificates, and encryption keys.

### Requirements

**1. Encryption at Rest**: All secrets encrypted with AES-256

**2. Encryption in Transit**: All secret access via TLS 1.3

**3. Access Control**: Secrets accessible only to authorized services

**4. Audit Logging**: All secret access logged

**5. Rotation**: Secrets rotated quarterly (minimum)

**6. Versioning**: Secret versions maintained for rollback

**7. Expiration**: Secrets expire after 1 year (maximum)

---

### Secret Types

**1. Database Credentials**: Username + password for database access

**2. API Keys**: External API keys and secrets

**3. Certificates**: TLS certificates and private keys

**4. Encryption Keys**: Data encryption keys

**5. Service Account Credentials**: Machine identity credentials

---

## Machine Identity Rules

Autonomous intelligence engines act as machine identities with specific access controls.

### Rule 1: Service Account per Engine

Each intelligence engine has dedicated service account:
- Sentinel Command Console™
- UltraFusion™
- Operation Hydra™
- Global Constellation Map™
- Global Radar Heatmap™
- Actor Profiler™
- Oracle Eye™
- Cortex Memory™
- GhostPredictor™
- Genesis Archive™

---

### Rule 2: API Key Authentication

Each service account authenticates with API key + secret:
- Unique API key per service
- API key rotated quarterly
- API key stored in secret store

---

### Rule 3: Mutual TLS (mTLS)

Inter-engine communication secured with mTLS:
- Each engine has TLS certificate
- Certificate-based authentication
- Encrypted communication

---

### Rule 4: Scoped Permissions

Each engine has minimum permissions required:
- Read/write specific resources
- Communicate with specific engines
- Write to Genesis Archive™

---

### Rule 5: Audit Logging

All engine actions logged:
- Engine identity
- Action performed
- Resources accessed
- Timestamp
- Result

---

## Compliance Mapping

### NIST 800-53 AC Family

| Control | Description | GhostQuant™ Implementation |
|---------|-------------|----------------------------|
| AC-1 | Access Control Policy and Procedures | This document |
| AC-2 | Account Management | Identity lifecycle procedures, role management |
| AC-3 | Access Enforcement | PDP/PEP, RBAC, policy evaluation |
| AC-4 | Information Flow Enforcement | Micro-segmentation, network policies |
| AC-5 | Separation of Duties | Four-Eyes approval, toxic combination prevention |
| AC-6 | Least Privilege | Least-privilege principles, time-limited access |
| AC-7 | Unsuccessful Logon Attempts | Account lockout after 5 failed attempts |
| AC-11 | Session Lock | Automatic session lock after 15 minutes inactivity |
| AC-12 | Session Termination | Automatic session termination after 8 hours |
| AC-17 | Remote Access | VPN required, MFA required, device verification |

---

### SOC 2 CC6 / CC7

| Criterion | Description | GhostQuant™ Implementation |
|-----------|-------------|----------------------------|
| CC6.1 | Logical and physical access controls restrict access | RBAC, PDP/PEP, micro-segmentation |
| CC6.2 | Prior to issuing credentials, entity registers and authorizes new users | Identity lifecycle procedures, approval workflows |
| CC6.3 | Entity authorizes, modifies, or removes access based on roles | Role management, quarterly recertification |
| CC6.6 | Entity implements logical access security measures | Firewall, IDS/IPS, WAF, DDoS protection |
| CC6.7 | Entity restricts transmission, movement, and removal of information | Data loss prevention, export approval |
| CC7.2 | Entity monitors system components for anomalies | Sentinel Console™, continuous monitoring |
| CC7.3 | Entity evaluates security events | Alert evaluation, incident response |

---

### FedRAMP AC Controls

| Control | Baseline | GhostQuant™ Implementation |
|---------|----------|----------------------------|
| AC-2 | Moderate | Account management, role assignment, quarterly recertification |
| AC-3 | Moderate | Access enforcement, RBAC, policy evaluation |
| AC-6 | Moderate | Least privilege, privilege elevation approval |
| AC-7 | Moderate | Account lockout after 5 failed attempts |
| AC-17 | Moderate | Remote access via VPN, MFA required |
| IA-2 | Moderate | Multi-factor authentication mandatory |
| IA-5 | Moderate | Password policy, MFA binding, API key rotation |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial access control policy |

**Review Schedule:** Annually  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

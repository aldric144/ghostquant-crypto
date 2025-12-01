# Zero-Trust Architecture
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document defines GhostQuant™'s comprehensive Zero-Trust Architecture (ZTA), implementing NIST SP 800-207 principles with "never trust, always verify" security controls across all intelligence engines, data resources, and user access points.

---

## 8 Core ZTA Components

### Component 1: Identity Provider (IdP)

**Purpose**: Centralized identity authentication and token issuance.

**Functions**:
- User authentication (username + password + MFA)
- Service account authentication (API key + certificate)
- Token generation (JWT, OAuth 2.0)
- Session binding (identity + device + location)
- MFA verification (FIDO2, TOTP, WebAuthn)
- SSO integration (optional)

**Implementation**:
- **Technology**: Custom IdP with FIDO2/WebAuthn support
- **Location**: Backend authentication service
- **High Availability**: Active-active cluster with 99.99% uptime
- **Audit Logging**: All authentication events logged to Genesis Archive™

**Authentication Flow**:
```
1. User submits credentials (username + password)
2. IdP verifies credentials against user database
3. IdP challenges MFA (FIDO2/TOTP/WebAuthn)
4. User provides MFA token
5. IdP verifies MFA token
6. IdP generates session token (JWT)
7. IdP binds session to identity + device + location
8. IdP returns session token to user
9. IdP logs authentication event
```

---

### Component 2: Policy Decision Point (PDP)

**Purpose**: Centralized policy evaluation engine that makes access decisions based on identity, device, location, behavior, risk, and policy.

**Functions**:
- Verify identity (session token validation)
- Verify device (fingerprint matching)
- Verify location (IP address, geolocation)
- Calculate risk score (behavioral analysis)
- Evaluate policy (RBAC, ABAC, RAA)
- Make access decision (ALLOW, DENY, STEP_UP_AUTH, RESTRICT_ACCESS, TERMINATE_SESSION)
- Log decision

**Implementation**:
- **Technology**: Custom policy engine with real-time evaluation
- **Location**: Backend API gateway
- **Performance**: <50ms decision latency
- **Scalability**: 10,000+ decisions/second
- **Audit Logging**: All decisions logged to Genesis Archive™

**Decision Algorithm**:
```python
def make_access_decision(request):
    # Step 1: Verify Identity
    identity = verify_identity(request.token)
    if not identity:
        return DENY("Invalid token")
    
    # Step 2: Verify Device
    device = verify_device(request.device_fingerprint, identity)
    if not device:
        return DENY("Device mismatch")
    
    # Step 3: Verify Location
    location = verify_location(request.ip_address, identity)
    if not location:
        return DENY("Location violation")
    
    # Step 4: Calculate Risk Score
    risk_score = calculate_risk(identity, device, location, request.action, request.resource)
    
    if risk_score >= 0.90:
        return DENY("Risk too high")
    elif risk_score >= 0.70:
        return TERMINATE_SESSION("Risk elevated")
    elif risk_score >= 0.50:
        return RESTRICT_ACCESS("Risk moderate")
    elif risk_score >= 0.30:
        return STEP_UP_AUTH("Additional verification required")
    
    # Step 5: Evaluate Policy
    policy_result = evaluate_policy(identity.role, request.action, request.resource)
    if not policy_result.allowed:
        return DENY("Policy violation")
    
    # Step 6: Check Four-Eyes Approval
    if policy_result.requires_approval and not has_approval(identity, request.action):
        return DENY("Four-Eyes approval required")
    
    # Step 7: Grant Access
    return ALLOW("Access granted", risk_score)
```

---

### Component 3: Policy Enforcement Point (PEP)

**Purpose**: Enforces access decisions at resource boundaries, intercepting all requests and querying PDP for authorization.

**Functions**:
- Intercept all access requests
- Extract request context (identity, device, location, action, resource)
- Query PDP for access decision
- Enforce decision (grant/deny access)
- Log enforcement action
- Monitor session continuously

**Implementation**:
- **Technology**: API Gateway middleware + resource-level interceptors
- **Locations**:
  - API Gateway (all API requests)
  - Frontend Application (UI access)
  - Intelligence Engines (engine-to-engine communication)
  - Genesis Archive™ (ledger access)
  - Database Layer (data access)
- **Performance**: <10ms enforcement overhead
- **Audit Logging**: All enforcement actions logged

**Enforcement Flow**:
```
1. User/Service makes request to resource
2. PEP intercepts request
3. PEP extracts request context
4. PEP queries PDP for access decision
5. PDP evaluates and returns decision
6. PEP enforces decision:
   - ALLOW: Forward request to resource
   - DENY: Return 403 Forbidden
   - STEP_UP_AUTH: Return 401 Unauthorized with MFA challenge
   - RESTRICT_ACCESS: Return 403 Forbidden with restricted scope
   - TERMINATE_SESSION: Invalidate session, return 401 Unauthorized
7. PEP logs enforcement action
```

---

### Component 4: Session Context Engine

**Purpose**: Maintains comprehensive session context for continuous verification and risk assessment.

**Functions**:
- Track session state (active, expired, terminated)
- Track session attributes (identity, device, location, start time, last activity)
- Track session actions (resources accessed, actions performed)
- Calculate session risk score
- Detect session anomalies (concurrent sessions, location changes, velocity anomalies)
- Trigger session termination on risk threshold

**Implementation**:
- **Technology**: Redis-based session store with real-time updates
- **Location**: Backend session service
- **Session Attributes**:
  - Session ID
  - User Identity (User ID, Username, Role)
  - Authentication Method
  - Device Fingerprint
  - IP Address
  - Geographic Location
  - Session Start Time
  - Session Expiration Time
  - Last Activity Time
  - Risk Score
  - Actions Performed (list)
  - Resources Accessed (list)
- **Audit Logging**: Session lifecycle events logged

---

### Component 5: Risk Adaptive Authorization (RAA)

**Purpose**: Dynamically adjusts access decisions based on real-time risk assessment, allowing low-risk access while restricting high-risk access.

**Functions**:
- Calculate risk score (0.00-1.00) based on multiple factors
- Adjust access decision based on risk score
- Trigger step-up authentication for moderate risk
- Restrict access for elevated risk
- Terminate session for high risk
- Log risk assessments

**Risk Factors**:
1. **Identity Risk** (0.00-1.00):
   - User role (Viewer: 0.1, Analyst: 0.2, Admin: 0.4, SuperAdmin: 0.6)
   - Account age (new account: +0.1)
   - Failed login history (+0.1 per failure in last 24h)
   - Privilege elevation (+0.2)

2. **Device Risk** (0.00-1.00):
   - Device fingerprint mismatch (+0.3)
   - New device (+0.2)
   - Suspicious device attributes (+0.2)
   - Device associated with fraud (+0.5)

3. **Location Risk** (0.00-1.00):
   - High-risk country (+0.3)
   - Tor/VPN usage (+0.2)
   - IP address change (+0.2)
   - Known malicious IP (+0.5)

4. **Behavioral Risk** (0.00-1.00):
   - Velocity anomaly (+0.3)
   - Access pattern anomaly (+0.2)
   - Time-of-day anomaly (+0.1)
   - Concurrent sessions (+0.2)

5. **Resource Risk** (0.00-1.00):
   - Sensitive resource (Genesis Archive™: 0.5, Audit Logs: 0.4, Intelligence Data: 0.3)
   - Destructive action (+0.3)
   - Export action (+0.2)

**Risk Calculation**:
```python
def calculate_risk_score(identity, device, location, action, resource):
    identity_risk = calculate_identity_risk(identity)
    device_risk = calculate_device_risk(device, identity)
    location_risk = calculate_location_risk(location, identity)
    behavioral_risk = calculate_behavioral_risk(identity, action)
    resource_risk = calculate_resource_risk(resource, action)
    
    # Weighted average
    risk_score = (
        identity_risk * 0.20 +
        device_risk * 0.25 +
        location_risk * 0.20 +
        behavioral_risk * 0.20 +
        resource_risk * 0.15
    )
    
    return min(risk_score, 1.00)
```

**Risk-Adaptive Actions**:
- **Risk 0.00-0.29**: Allow access (normal operations)
- **Risk 0.30-0.49**: Require step-up authentication (re-verify MFA)
- **Risk 0.50-0.69**: Restrict access (deny sensitive actions, allow read-only)
- **Risk 0.70-0.89**: Terminate session (require re-authentication)
- **Risk 0.90-1.00**: Terminate session + lock account + alert security team

---

### Component 6: Continuous Verification Layer

**Purpose**: Continuously verifies identity, device, location, and behavior throughout the session lifecycle, not just at initial authentication.

**Functions**:
- Verify every request (not just initial authentication)
- Re-validate session token
- Re-verify device fingerprint
- Re-verify IP address and location
- Re-calculate risk score
- Detect anomalies (concurrent sessions, location changes, velocity spikes)
- Trigger re-authentication or session termination

**Verification Frequency**:
- **Every Request**: Session token validation, device fingerprint check, IP address check
- **Every 5 Minutes**: Risk score recalculation, behavioral analysis
- **Every 15 Minutes**: Session activity check (auto-lock if inactive)
- **Every Hour**: Full session re-verification

**Anomaly Detection**:
1. **Concurrent Sessions**: User logged in from multiple locations simultaneously
2. **Location Change**: User IP address changes to different country
3. **Velocity Anomaly**: User performs actions faster than humanly possible
4. **Access Pattern Anomaly**: User accesses resources outside normal pattern
5. **Time-of-Day Anomaly**: User accesses system outside normal hours

**Response Actions**:
- **Minor Anomaly**: Log event, increase risk score
- **Moderate Anomaly**: Require step-up authentication
- **Major Anomaly**: Terminate session, require re-authentication
- **Critical Anomaly**: Terminate session, lock account, alert security team

---

### Component 7: Micro-segmented Resource Zones

**Purpose**: Divides network and resources into small isolated zones with strict access controls between zones, preventing lateral movement.

**Zones**:

**Zone 1: Frontend Zone**
- **Resources**: Web application, user interface
- **Access**: Authenticated users only
- **Network**: Public internet → Load Balancer → Frontend servers
- **Security**: WAF, DDoS protection, TLS 1.3

**Zone 2: API Gateway Zone**
- **Resources**: API endpoints, PEP, PDP
- **Access**: Authenticated users + services
- **Network**: Frontend Zone → API Gateway
- **Security**: mTLS, rate limiting, request validation

**Zone 3: Intelligence Engine Zone**
- **Resources**: Sentinel, UltraFusion, Hydra, Constellation, Radar, Actor Profiler, Oracle Eye, Cortex, GhostPredictor
- **Access**: API Gateway + inter-engine communication
- **Network**: API Gateway Zone → Intelligence Engines
- **Security**: mTLS, service-to-service authentication, micro-segmentation

**Zone 4: Genesis Archive™ Zone**
- **Resources**: Immutable audit ledger
- **Access**: Intelligence engines (write), authorized users (read)
- **Network**: Intelligence Engine Zone → Genesis Archive™
- **Security**: mTLS, append-only access, integrity verification

**Zone 5: Database Zone**
- **Resources**: PostgreSQL, Redis, TimescaleDB
- **Access**: Intelligence engines + API Gateway
- **Network**: Intelligence Engine Zone → Databases
- **Security**: mTLS, encrypted connections, least-privilege access

**Zone 6: Admin Zone**
- **Resources**: System administration, configuration management
- **Access**: Admins + SuperAdmins only
- **Network**: VPN → Admin Zone
- **Security**: VPN, MFA, privileged session recording

**Inter-Zone Communication**:
- All inter-zone communication requires authentication
- All inter-zone communication encrypted with mTLS
- All inter-zone communication logged
- No direct communication between non-adjacent zones

---

### Component 8: Telemetry + Monitoring + Genesis Integrity Feeds

**Purpose**: Comprehensive monitoring and telemetry feeding into PDP for risk assessment and access decisions.

**Telemetry Sources**:

**1. Sentinel Command Console™**:
- System health metrics
- Engine status
- Alert generation
- Incident detection

**2. UltraFusion™**:
- Meta-signal contradictions
- Intelligence accuracy metrics
- Source reliability scores

**3. Operation Hydra™**:
- Cluster detection events
- Coordination scores
- Entity relationships

**4. Global Constellation Map™**:
- Geographic concentration events
- Supernova alerts
- Regional anomalies

**5. Global Radar Heatmap™**:
- Cross-chain velocity spikes
- Transaction volume anomalies
- Heatmap patterns

**6. Actor Profiler™**:
- High-risk entity identifications
- Risk score changes
- Behavioral patterns

**7. Oracle Eye™**:
- Image manipulation detection
- Forensic artifact analysis
- Confidence scores

**8. Cortex Memory™**:
- Pattern recognition
- Historical context
- Deviation detection

**9. GhostPredictor™**:
- Risk predictions
- Model performance
- Drift detection

**10. Genesis Archive™**:
- Integrity verification results
- Block creation events
- Hash chain validation

**Monitoring Metrics**:
- Authentication success/failure rates
- Access decision distribution (ALLOW/DENY/STEP_UP_AUTH)
- Risk score distribution
- Session termination reasons
- Anomaly detection events
- Policy violation events

**Integration with PDP**:
- Real-time telemetry feeds into PDP
- PDP uses telemetry for risk assessment
- Anomalies trigger increased risk scores
- Critical events trigger automatic session termination

---

## ZTA Enforcement Across GhostQuant™ Systems

### Sentinel Command Console™

**Access Control**:
- **Roles Allowed**: Analyst, Senior Analyst, Admin, SuperAdmin
- **Authentication**: Username + Password + MFA (FIDO2 required for Admin/SuperAdmin)
- **Authorization**: RBAC + Risk-Adaptive Authorization
- **Session Management**: 8-hour expiration, continuous verification

**ZTA Enforcement**:
1. User authenticates with IdP
2. IdP issues session token
3. User accesses Sentinel Console™
4. PEP intercepts request
5. PEP queries PDP for access decision
6. PDP verifies identity, device, location, calculates risk
7. PDP evaluates policy (role = Analyst/Senior Analyst/Admin/SuperAdmin)
8. PDP returns ALLOW decision (if risk < 0.30)
9. PEP grants access to Sentinel Console™
10. Continuous verification every request

**Micro-Segmentation**:
- Sentinel in Intelligence Engine Zone
- Access only from API Gateway Zone
- mTLS required for all connections

---

### Prediction/UltraFusion Engines

**Access Control**:
- **Roles Allowed**: Analyst, Senior Analyst, Admin, SuperAdmin, System (GhostPredictor)
- **Authentication**: Username + Password + MFA (human), API Key + mTLS (machine)
- **Authorization**: RBAC + Service-to-Service Authorization
- **Session Management**: 8-hour expiration (human), indefinite (machine with token refresh)

**ZTA Enforcement**:
1. User/Service requests prediction
2. PEP intercepts request
3. PEP queries PDP for access decision
4. PDP verifies identity (human or machine)
5. PDP verifies device/service account
6. PDP calculates risk score
7. PDP evaluates policy (role = Analyst+ or System)
8. PDP returns ALLOW decision
9. PEP forwards request to GhostPredictor™
10. GhostPredictor™ generates prediction
11. UltraFusion™ fuses prediction with other intelligence
12. Result returned to user/service
13. Action logged to Genesis Archive™

**Micro-Segmentation**:
- GhostPredictor™ and UltraFusion™ in Intelligence Engine Zone
- Access only from API Gateway Zone or other engines
- mTLS required for all connections

---

### Constellation / Hydra / Cortex

**Access Control**:
- **Roles Allowed**: Analyst, Senior Analyst, Admin, SuperAdmin, System (engines)
- **Authentication**: Username + Password + MFA (human), API Key + mTLS (machine)
- **Authorization**: RBAC + Service-to-Service Authorization
- **Session Management**: 8-hour expiration (human), indefinite (machine)

**ZTA Enforcement**:
1. User/Service requests intelligence analysis
2. PEP intercepts request
3. PEP queries PDP for access decision
4. PDP verifies identity, device, location, risk
5. PDP evaluates policy
6. PDP returns ALLOW decision
7. PEP forwards request to Constellation/Hydra/Cortex
8. Engine performs analysis
9. Result returned to user/service
10. Action logged to Genesis Archive™

**Micro-Segmentation**:
- Constellation, Hydra, Cortex in Intelligence Engine Zone
- Access only from API Gateway Zone or other engines
- mTLS required for all connections

---

### Genesis Archive™

**Access Control**:
- **Write Access**: System (all engines)
- **Read Access**: Senior Analyst, Admin, SuperAdmin, System
- **Authentication**: API Key + mTLS (write), Username + Password + FIDO2 (read)
- **Authorization**: Service-to-Service Authorization (write), RBAC + Four-Eyes Approval (read)

**ZTA Enforcement**:
1. Engine writes log to Genesis Archive™
2. PEP intercepts write request
3. PEP queries PDP for access decision
4. PDP verifies service account
5. PDP verifies mTLS certificate
6. PDP evaluates policy (service = allowed engine)
7. PDP returns ALLOW decision
8. PEP forwards write to Genesis Archive™
9. Genesis Archive™ appends log to block
10. Genesis Archive™ calculates hash
11. Genesis Archive™ links to previous block
12. Write logged (meta-log)

**Read Access**:
1. User requests Genesis Archive™ export
2. PEP intercepts request
3. PEP queries PDP for access decision
4. PDP verifies identity (Senior Analyst+)
5. PDP verifies FIDO2 authentication
6. PDP calculates risk score
7. PDP evaluates policy (requires Four-Eyes approval)
8. If no approval, PDP returns DENY
9. User requests approval from another Senior Analyst+
10. Approver reviews and approves
11. User retries request with approval token
12. PDP verifies approval token
13. PDP returns ALLOW decision
14. PEP forwards request to Genesis Archive™
15. Genesis Archive™ generates export
16. Export delivered to user
17. Action logged to Genesis Archive™

**Micro-Segmentation**:
- Genesis Archive™ in dedicated Genesis Zone
- Write access only from Intelligence Engine Zone
- Read access only from API Gateway Zone (authenticated users)
- mTLS required for all connections

---

### API Gateway

**Access Control**:
- **Roles Allowed**: All roles + API keys
- **Authentication**: Username + Password + MFA (human), API Key + Secret (machine)
- **Authorization**: RBAC + API Key Scopes
- **Rate Limiting**: 1000 requests/minute per user, 100 requests/minute per API key

**ZTA Enforcement**:
1. User/Service makes API request
2. API Gateway extracts authentication credentials
3. API Gateway validates credentials with IdP
4. IdP returns identity + session token
5. API Gateway (PEP) queries PDP for access decision
6. PDP verifies identity, device, location, risk
7. PDP evaluates policy (role + API key scopes)
8. PDP returns ALLOW decision
9. API Gateway forwards request to backend service
10. Backend service processes request
11. Response returned to user/service
12. Action logged to Genesis Archive™

**Micro-Segmentation**:
- API Gateway in dedicated API Gateway Zone
- Frontend access from public internet (via load balancer)
- Backend access to Intelligence Engine Zone
- mTLS required for backend connections

---

### Analyst Console

**Access Control**:
- **Roles Allowed**: Analyst, Senior Analyst
- **Authentication**: Username + Password + MFA
- **Authorization**: RBAC + Case-Based Access Control
- **Session Management**: 8-hour expiration, continuous verification

**ZTA Enforcement**:
1. Analyst authenticates with IdP
2. IdP issues session token
3. Analyst accesses Analyst Console
4. PEP intercepts request
5. PEP queries PDP for access decision
6. PDP verifies identity (role = Analyst/Senior Analyst)
7. PDP verifies device, location, risk
8. PDP evaluates policy
9. PDP returns ALLOW decision
10. PEP grants access to Analyst Console
11. Analyst requests case data
12. PEP intercepts case data request
13. PEP queries PDP for case-specific access
14. PDP verifies analyst assigned to case
15. PDP returns ALLOW decision
16. PEP forwards request to backend
17. Case data returned to analyst
18. Action logged to Genesis Archive™

**Micro-Segmentation**:
- Analyst Console in Frontend Zone
- Access to API Gateway Zone for data requests
- No direct access to Intelligence Engine Zone

---

## Architecture Diagrams

### Diagram 1: ZTA Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  GHOSTQUANT™ ZERO-TRUST REQUEST FLOW                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐
│   USER   │
└────┬─────┘
     │
     │ 1. Authentication Request (username + password + MFA)
     ▼
┌─────────────────┐
│ IDENTITY        │
│ PROVIDER (IdP)  │
│                 │
│ • Verify Creds  │
│ • Verify MFA    │
│ • Generate JWT  │
│ • Bind Session  │
└────┬────────────┘
     │
     │ 2. Session Token (JWT)
     ▼
┌──────────┐
│   USER   │
└────┬─────┘
     │
     │ 3. Resource Request (token + action + resource)
     ▼
┌──────────────────────┐
│ POLICY ENFORCEMENT   │
│ POINT (PEP)          │
│                      │
│ • Intercept Request  │
│ • Extract Context    │
│ • Query PDP          │
└────┬─────────────────┘
     │
     │ 4. Access Decision Request (identity + device + location + action + resource)
     ▼
┌──────────────────────┐
│ POLICY DECISION      │
│ POINT (PDP)          │
│                      │
│ • Verify Identity    │
│ • Verify Device      │
│ • Verify Location    │
│ • Calculate Risk     │
│ • Evaluate Policy    │
│ • Make Decision      │
└────┬─────────────────┘
     │
     │ 5. Access Decision (ALLOW/DENY/STEP_UP_AUTH/RESTRICT/TERMINATE)
     ▼
┌──────────────────────┐
│ POLICY ENFORCEMENT   │
│ POINT (PEP)          │
│                      │
│ • Enforce Decision   │
│ • Log Action         │
└────┬─────────────────┘
     │
     ├─────────────┬─────────────┬─────────────┬─────────────┐
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ ALLOW   │  │  DENY   │  │ STEP-UP │  │RESTRICT │  │TERMINATE│
│         │  │         │  │  AUTH   │  │ ACCESS  │  │ SESSION │
│Grant    │  │Return   │  │Challenge│  │Limited  │  │Invalidate│
│Access   │  │403      │  │MFA      │  │Scope    │  │Session  │
└────┬────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘
     │
     │ 6. Forward Request to Resource
     ▼
┌──────────────────────┐
│     RESOURCE         │
│                      │
│ • Sentinel Console™  │
│ • UltraFusion™       │
│ • Hydra™             │
│ • Constellation™     │
│ • Radar™             │
│ • Actor Profiler™    │
│ • Oracle Eye™        │
│ • Cortex™            │
│ • GhostPredictor™    │
│ • Genesis Archive™   │
└────┬─────────────────┘
     │
     │ 7. Resource Response
     ▼
┌──────────┐
│   USER   │
└──────────┘
```

---

### Diagram 2: Micro-Segmentation Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│              GHOSTQUANT™ MICRO-SEGMENTATION ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  PUBLIC INTERNET│
                              └────────┬────────┘
                                       │
                                       │ HTTPS/TLS 1.3
                                       ▼
                              ┌─────────────────┐
                              │  LOAD BALANCER  │
                              │  + WAF + DDoS   │
                              └────────┬────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │                     FRONTEND ZONE                            │
        │  ┌──────────────────────────────────────────────────────┐   │
        │  │  Web Application (React)                             │   │
        │  │  • User Interface                                    │   │
        │  │  • Analyst Console                                   │   │
        │  │  • Intelligence Terminal                             │   │
        │  └──────────────────────────────────────────────────────┘   │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ mTLS
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                     API GATEWAY ZONE                          │
        │  ┌────────────────────────────────────────────────────────┐  │
        │  │  API Gateway (FastAPI)                                 │  │
        │  │  • PEP (Policy Enforcement Point)                      │  │
        │  │  • PDP (Policy Decision Point)                         │  │
        │  │  • Rate Limiting                                       │  │
        │  │  • Request Validation                                  │  │
        │  └────────────────────────────────────────────────────────┘  │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ mTLS
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                 INTELLIGENCE ENGINE ZONE                      │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
        │  │  Sentinel™  │  │UltraFusion™ │  │   Hydra™    │          │
        │  └─────────────┘  └─────────────┘  └─────────────┘          │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
        │  │Constellation│  │   Radar™    │  │Actor Profile│          │
        │  └─────────────┘  └─────────────┘  └─────────────┘          │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
        │  │ Oracle Eye™ │  │  Cortex™    │  │GhostPredict™│          │
        │  └─────────────┘  └─────────────┘  └─────────────┘          │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ mTLS
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                   GENESIS ARCHIVE™ ZONE                       │
        │  ┌────────────────────────────────────────────────────────┐  │
        │  │  Genesis Archive™ (Immutable Audit Ledger)             │  │
        │  │  • Append-Only Access                                  │  │
        │  │  • SHA-256 Hash Chain                                  │  │
        │  │  • Block Verification                                  │  │
        │  └────────────────────────────────────────────────────────┘  │
        └──────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────────────────────────┐
        │                       DATABASE ZONE                           │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
        │  │ PostgreSQL  │  │    Redis    │  │ TimescaleDB │          │
        │  └─────────────┘  └─────────────┘  └─────────────┘          │
        └──────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────────────────────────┐
        │                        ADMIN ZONE                             │
        │  ┌────────────────────────────────────────────────────────┐  │
        │  │  System Administration                                 │  │
        │  │  • User Management                                     │  │
        │  │  • Configuration Management                            │  │
        │  │  • Deployment                                          │  │
        │  │  • Monitoring                                          │  │
        │  └────────────────────────────────────────────────────────┘  │
        └──────────────────────────────────────────────────────────────┘
                                       ▲
                                       │ VPN + MFA
                                       │
                              ┌─────────────────┐
                              │  ADMIN USERS    │
                              └─────────────────┘

LEGEND:
━━━━  Network Boundary
────  mTLS Connection
```

---

### Diagram 3: Identity Decision Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│              GHOSTQUANT™ IDENTITY DECISION PIPELINE                      │
└─────────────────────────────────────────────────────────────────────────┘

REQUEST CONTEXT
┌──────────────────────────────────────────────────────────────────────┐
│ • Identity: user@example.com (Analyst)                               │
│ • Device: fingerprint_abc123                                         │
│ • Location: IP 192.168.1.100 (San Francisco, CA, USA)               │
│ • Action: view_intelligence                                          │
│ • Resource: Hydra Cluster HYD-2025-001                               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ STEP 1: VERIFY  │
                    │    IDENTITY     │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌─────────────┐         ┌─────────────┐
         │ Valid Token?│         │ Account     │
         │     YES     │         │ Active?     │
         │             │         │     YES     │
         └─────────────┘         └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ STEP 2: VERIFY  │
                    │     DEVICE      │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌─────────────┐         ┌─────────────┐
         │ Fingerprint │         │ Device Not  │
         │   Match?    │         │ Compromised?│
         │     YES     │         │     YES     │
         └─────────────┘         └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ STEP 3: VERIFY  │
                    │    LOCATION     │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌─────────────┐         ┌─────────────┐
         │ IP Allowed? │         │ Not Tor/VPN?│
         │     YES     │         │     YES     │
         └─────────────┘         └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ STEP 4: CALC    │
                    │   RISK SCORE    │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┬────────────┬────────────┐
                │                         │            │            │
                ▼                         ▼            ▼            ▼
         ┌─────────────┐         ┌─────────────┐ ┌─────────┐ ┌─────────┐
         │ Identity    │         │ Device Risk │ │Location │ │Behavior │
         │ Risk: 0.20  │         │    0.10     │ │Risk 0.15│ │Risk 0.10│
         └─────────────┘         └─────────────┘ └─────────┘ └─────────┘
                             │
                             │ Total Risk Score: 0.18
                             ▼
                    ┌─────────────────┐
                    │ STEP 5: RISK    │
                    │   EVALUATION    │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┬────────────┬────────────┐
                │                         │            │            │
                ▼                         ▼            ▼            ▼
         ┌─────────────┐         ┌─────────────┐ ┌─────────┐ ┌─────────┐
         │ Risk < 0.30 │         │ Risk 0.30-  │ │Risk 0.50│ │Risk 0.70│
         │   ALLOW     │         │    0.49     │ │  -0.69  │ │  -1.00  │
         │             │         │  STEP-UP    │ │ RESTRICT│ │TERMINATE│
         └─────┬───────┘         └─────────────┘ └─────────┘ └─────────┘
               │
               ▼
      ┌─────────────────┐
      │ STEP 6: POLICY  │
      │   EVALUATION    │
      └────────┬────────┘
               │
  ┌────────────┴────────────┬────────────┐
  │                         │            │
  ▼                         ▼            ▼
┌─────────────┐      ┌─────────────┐ ┌─────────┐
│ Role Has    │      │ Resource    │ │ Time    │
│ Permission? │      │ Accessible? │ │ Allowed?│
│     YES     │      │     YES     │ │   YES   │
└─────────────┘      └─────────────┘ └─────────┘
               │
               ▼
      ┌─────────────────┐
      │ STEP 7: FOUR-   │
      │   EYES CHECK    │
      └────────┬────────┘
               │
               │ (Not required for view action)
               ▼
      ┌─────────────────┐
      │ DECISION:       │
      │     ALLOW       │
      │                 │
      │ Risk Score: 0.18│
      │ Access Granted  │
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ LOG TO GENESIS  │
      │   ARCHIVE™      │
      └─────────────────┘
```

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Identity Lifecycle**: See identity_lifecycle_procedures.md
- **Privileged Access Management**: See privileged_access_management.md
- **Zero-Trust Enforcement Rules**: See zero_trust_enforcement_rules.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial zero-trust architecture |

**Review Schedule:** Annually  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

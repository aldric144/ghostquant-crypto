# IAM System Mapping
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document maps ALL identity and access management (IAM) components across GhostQuant™, documenting identity type, authentication method, authorization method, risk rules, privilege scope, logging requirements, and Genesis Archive™ preservation for each system.

---

## System Inventory

GhostQuant™ consists of 16 primary systems, each with specific identity and access management requirements:

1. Frontend Authentication
2. API Gateway
3. Backend Engines (Intelligence Processing)
4. UltraFusion™ Request Pipeline
5. Sentinel Command Console™
6. Genesis Archive™
7. Constellation Workstation™
8. Hydra Detection Engine™
9. Cortex Memory Engine™
10. Oracle Eye™
11. Audit Logging Pipeline
12. Training Subsystem
13. Deployment Stack
14. GhostPredictor™
15. Global Radar Heatmap™
16. Actor Profiler™

---

## System 1: Frontend Authentication

### System Overview

**Purpose**: Web application providing user interface for GhostQuant™ intelligence platform

**Technology**: React, Next.js, TypeScript

**Network Zone**: Frontend Zone (public-facing)

**Users**: All human users (Viewer, Analyst, Senior Analyst, Admin, SuperAdmin)

---

### Identity Type

**Human Identity**: Individual users accessing web application

**Identity Attributes**:
- User ID (UUID)
- Username (email address)
- Full Name
- Role (Viewer, Analyst, Senior Analyst, Admin, SuperAdmin)
- Department
- Manager
- Employment Status

---

### Authentication Method

**Primary Authentication**: Username + Password + MFA

**Authentication Flow**:
1. User enters username (email) and password
2. Frontend sends credentials to API Gateway
3. API Gateway validates credentials with Identity Provider
4. Identity Provider challenges MFA
5. User provides MFA token (FIDO2/TOTP/WebAuthn)
6. Identity Provider verifies MFA token
7. Identity Provider generates session token (JWT)
8. API Gateway returns session token to frontend
9. Frontend stores session token in secure cookie
10. Frontend includes session token in all subsequent requests

**Session Management**:
- Session token stored in HttpOnly, Secure, SameSite cookie
- Session expiration: 8 hours
- Idle timeout: 15 minutes
- Session token refresh: Every 1 hour

---

### Authorization Method

**Authorization Model**: Role-Based Access Control (RBAC) + Risk-Adaptive Authorization (RAA)

**Authorization Flow**:
1. User requests resource (e.g., view intelligence report)
2. Frontend includes session token in request
3. API Gateway extracts session token
4. API Gateway queries Policy Decision Point (PDP)
5. PDP verifies session token
6. PDP extracts user identity and role
7. PDP calculates risk score
8. PDP evaluates RBAC policy (role has permission?)
9. PDP returns access decision (ALLOW/DENY/STEP_UP_AUTH)
10. API Gateway enforces decision

---

### Risk Rules

**Risk Factors**:
- Device fingerprint mismatch: +0.3 risk
- New device: +0.2 risk
- Location change (different country): +0.3 risk
- Velocity anomaly: +0.3 risk
- Concurrent sessions: +0.2 risk

**Risk Thresholds**:
- Risk < 0.30: Allow access
- Risk 0.30-0.49: Require step-up authentication
- Risk 0.50-0.69: Restrict access (read-only)
- Risk 0.70-0.89: Terminate session
- Risk ≥ 0.90: Terminate session + lock account

---

### Privilege Scope

**Viewer**:
- View public dashboards
- View intelligence reports
- View system status

**Analyst**:
- All Viewer privileges
- View intelligence engine outputs
- Create investigations
- Generate reports

**Senior Analyst**:
- All Analyst privileges
- Approve data exports
- Access raw event data
- Access Genesis Archive™ (with approval)

**Admin**:
- All Senior Analyst privileges
- Manage user accounts
- Modify system settings
- Deploy non-production updates

**SuperAdmin**:
- All Admin privileges
- Modify intelligence engine algorithms (with Four-Eyes approval)
- Deploy production updates (with Four-Eyes approval)
- Access break-glass accounts (with CISO approval)

---

### Logging Requirements

**Authentication Events**:
- Login success/failure
- Logout
- MFA enrollment/verification
- Password change/reset
- Session creation/termination

**Authorization Events**:
- Access granted/denied
- Step-up authentication required
- Session terminated (risk threshold)
- Resource accessed

**Log Attributes**:
- Event ID
- Event Type
- Timestamp (UTC)
- User Identity
- IP Address
- Device Fingerprint
- Geographic Location
- Risk Score
- Result (success/failure)

**Log Destination**: Genesis Archive™ (all authentication/authorization events)

---

### Genesis Preservation Requirement

**Preservation Level**: High

**Events Preserved**:
- All authentication events
- All authorization events
- All access decisions
- All risk score calculations
- All session lifecycle events

**Retention**: 1 year (default), 7 years (high-severity events)

---

## System 2: API Gateway

### System Overview

**Purpose**: Central API gateway for all backend requests, enforcing authentication, authorization, rate limiting, and request validation

**Technology**: FastAPI, Python, Uvicorn

**Network Zone**: API Gateway Zone

**Users**: All users (human + service accounts + API keys)

---

### Identity Type

**Mixed Identity**: Human users, service accounts, API keys

**Human Identity**: See System 1 (Frontend Authentication)

**Service Account Identity**:
- Service ID (UUID)
- Service Name (e.g., sentinel-service, ultrafusion-service)
- Service Type (intelligence engine, background worker)
- API Key + Secret

**API Key Identity**:
- API Key ID (UUID)
- API Key (32-character alphanumeric)
- API Secret (64-character alphanumeric)
- Scopes (permissions)
- IP Whitelist

---

### Authentication Method

**Human Authentication**: Session token (JWT) from Identity Provider

**Service Account Authentication**: API Key + Secret + mTLS

**API Key Authentication**: API Key + Secret

**Authentication Flow (Service Account)**:
1. Service includes API key in Authorization header
2. Service includes API secret in X-API-Secret header
3. Service establishes mTLS connection
4. API Gateway validates API key and secret
5. API Gateway verifies mTLS certificate
6. API Gateway grants access

---

### Authorization Method

**Authorization Model**: RBAC (human) + Service-to-Service Authorization (service accounts) + API Key Scopes (API keys)

**Authorization Flow**:
1. Request arrives at API Gateway
2. API Gateway extracts identity (session token, API key, or service account)
3. API Gateway queries PDP for access decision
4. PDP verifies identity
5. PDP evaluates policy (RBAC, service authorization, or API key scopes)
6. PDP calculates risk score
7. PDP returns access decision
8. API Gateway enforces decision

---

### Risk Rules

**Human Users**: See System 1 (Frontend Authentication)

**Service Accounts**:
- Invalid mTLS certificate: Deny access
- API key expired: Deny access
- Rate limit exceeded: Deny access
- IP address not whitelisted: Deny access

**API Keys**:
- API key expired: Deny access
- Rate limit exceeded: Deny access
- IP address not whitelisted: Deny access
- Scope violation: Deny access

---

### Privilege Scope

**Human Users**: See System 1 (Frontend Authentication)

**Service Accounts**: Service-specific permissions (e.g., Sentinel can write to Genesis Archive™, UltraFusion can read intelligence data)

**API Keys**: Scope-specific permissions (e.g., read:intelligence, write:predictions)

---

### Logging Requirements

**Authentication Events**:
- API key validation success/failure
- Service account authentication success/failure
- mTLS certificate validation success/failure

**Authorization Events**:
- Access granted/denied
- Rate limit exceeded
- Scope violation
- IP whitelist violation

**Log Destination**: Genesis Archive™ (all events)

---

### Genesis Preservation Requirement

**Preservation Level**: High

**Events Preserved**: All authentication, authorization, and rate limiting events

**Retention**: 1 year

---

## System 3: Backend Engines (Intelligence Processing)

### System Overview

**Purpose**: Core intelligence processing engines (Sentinel, UltraFusion, Hydra, Constellation, Radar, Actor Profiler, Oracle Eye, Cortex, GhostPredictor)

**Technology**: Python, FastAPI, asyncio

**Network Zone**: Intelligence Engine Zone

**Users**: Service accounts only (no human access)

---

### Identity Type

**Service Account Identity**: Each engine has dedicated service account

**Service Accounts**:
- sentinel-service
- ultrafusion-service
- hydra-service
- constellation-service
- radar-service
- actor-profiler-service
- oracle-eye-service
- cortex-service
- ghostpredictor-service

---

### Authentication Method

**Service-to-Service Authentication**: API Key + mTLS

**Authentication Flow**:
1. Engine A requests data from Engine B
2. Engine A includes API key in Authorization header
3. Engine A establishes mTLS connection with Engine B
4. Engine B validates API key
5. Engine B verifies mTLS certificate
6. Engine B grants access

---

### Authorization Method

**Authorization Model**: Service-to-Service Authorization

**Authorization Rules**:
- Sentinel can access all engines (monitoring)
- UltraFusion can access all engines (fusion)
- Hydra can access blockchain data and entity data
- Constellation can access entity data and geographic data
- Radar can access transaction data and chain data
- Actor Profiler can access entity data and behavioral data
- Oracle Eye can access image data and forensic data
- Cortex can access historical data and pattern data
- GhostPredictor can access all intelligence data

---

### Risk Rules

**Service Account Risk Factors**:
- Invalid mTLS certificate: Deny access
- API key expired: Deny access
- Unexpected service-to-service communication: +0.5 risk
- Rate limit exceeded: +0.3 risk

---

### Privilege Scope

**Service-Specific Permissions**: Each engine has minimum permissions required for its function

**Example (Sentinel)**:
- Read system health metrics
- Read engine status
- Write alerts to Genesis Archive™
- Trigger incident response workflows

---

### Logging Requirements

**Service Events**:
- Service-to-service authentication
- Service-to-service requests
- Engine processing events
- Intelligence outputs generated

**Log Destination**: Genesis Archive™ (all events)

---

### Genesis Preservation Requirement

**Preservation Level**: High

**Events Preserved**: All intelligence outputs, processing events, and service-to-service communications

**Retention**: 1 year (intelligence outputs), 7 years (compliance-related outputs)

---

## System 4: UltraFusion™ Request Pipeline

### System Overview

**Purpose**: Meta-intelligence fusion engine combining signals from multiple engines

**Technology**: Python, FastAPI, Redis

**Network Zone**: Intelligence Engine Zone

**Users**: Analysts, Senior Analysts, Admins, SuperAdmins, service accounts

---

### Identity Type

**Mixed Identity**: Human users + service accounts

---

### Authentication Method

**Human Authentication**: Session token (JWT)

**Service Authentication**: API Key + mTLS

---

### Authorization Method

**Authorization Model**: RBAC (human) + Service-to-Service Authorization (service accounts)

**Authorization Rules**:
- Analysts can request fusion analysis
- Senior Analysts can request fusion analysis + access raw fusion data
- Admins can modify fusion configuration
- SuperAdmins can modify fusion algorithms (with Four-Eyes approval)
- Service accounts can trigger fusion analysis

---

### Risk Rules

**Human Users**: Standard risk rules (see System 1)

**Service Accounts**: Standard service risk rules (see System 3)

---

### Privilege Scope

**Analysts**: Request fusion analysis, view fusion results

**Senior Analysts**: All Analyst privileges + access raw fusion data

**Admins**: All Senior Analyst privileges + modify fusion configuration

**SuperAdmins**: All Admin privileges + modify fusion algorithms (with Four-Eyes approval)

---

### Logging Requirements

**Fusion Events**:
- Fusion request received
- Fusion analysis started
- Fusion sources queried
- Fusion result generated
- Fusion result delivered

**Log Destination**: Genesis Archive™

---

### Genesis Preservation Requirement

**Preservation Level**: High

**Events Preserved**: All fusion requests, fusion results, and source contradictions

**Retention**: 1 year

---

## System 5: Sentinel Command Console™

### System Overview

**Purpose**: Central command and control console for system monitoring, alerting, and incident response

**Technology**: Python, FastAPI, Redis, WebSocket

**Network Zone**: Intelligence Engine Zone

**Users**: Admins, SuperAdmins

---

### Identity Type

**Human Identity**: Admins, SuperAdmins

---

### Authentication Method

**Authentication**: Username + Password + FIDO2 (mandatory)

---

### Authorization Method

**Authorization Model**: RBAC + Privileged Session Recording

**Authorization Rules**:
- Admins can view system health, manage alerts
- SuperAdmins can modify alert rules, disable monitoring (with Four-Eyes approval)

---

### Risk Rules

**Privileged Access Risk**:
- All Sentinel access considered high-risk (privilege scope = 0.4)
- Device fingerprint mismatch: +0.3 risk
- Location change: +0.3 risk

---

### Privilege Scope

**Admins**: View system health, view alerts, acknowledge alerts, create incidents

**SuperAdmins**: All Admin privileges + modify alert rules, disable monitoring (with Four-Eyes approval)

---

### Logging Requirements

**Sentinel Events**:
- Sentinel access
- Alert generated
- Alert acknowledged
- Incident created
- Alert rule modified
- Monitoring disabled/enabled

**Log Destination**: Genesis Archive™

---

### Genesis Preservation Requirement

**Preservation Level**: Critical

**Events Preserved**: All Sentinel access, all alerts, all incidents, all configuration changes

**Retention**: 7 years

---

## System 6: Genesis Archive™

### System Overview

**Purpose**: Immutable audit ledger preserving all critical events

**Technology**: Python, custom blockchain-style ledger

**Network Zone**: Genesis Archive™ Zone

**Users**: Service accounts (write), Senior Analysts/Admins/SuperAdmins (read)

---

### Identity Type

**Mixed Identity**: Service accounts (write) + human users (read)

---

### Authentication Method

**Write Access**: Service account + API Key + mTLS

**Read Access**: Username + Password + FIDO2 + Four-Eyes Approval

---

### Authorization Method

**Authorization Model**: Service-to-Service Authorization (write) + RBAC + Four-Eyes Approval (read)

**Authorization Rules**:
- All intelligence engines can write to Genesis Archive™
- Senior Analysts can read Genesis Archive™ (with Four-Eyes approval)
- Admins can read Genesis Archive™ (with Four-Eyes approval)
- SuperAdmins can administer Genesis Archive™ (with Four-Eyes approval)

---

### Risk Rules

**Write Access**: Service accounts only (no risk calculation)

**Read Access**: High-risk operation (privilege scope = 0.5), requires Four-Eyes approval

---

### Privilege Scope

**Service Accounts (Write)**: Append-only write access

**Senior Analysts (Read)**: Read-only access to specific blocks (with approval)

**Admins (Read)**: Read-only access to all blocks (with approval)

**SuperAdmins (Admin)**: Administrative access (backup, restore, integrity verification) - no write/modify/delete

---

### Logging Requirements

**Genesis Events**:
- Block created
- Block written
- Block read
- Integrity verification performed
- Export generated

**Log Destination**: Genesis Archive™ (meta-log)

---

### Genesis Preservation Requirement

**Preservation Level**: Critical

**Events Preserved**: All Genesis Archive™ operations

**Retention**: Permanent

---

## Systems 7-16: Additional System Mappings

### System 7: Constellation Workstation™

**Identity Type**: Human (Analysts, Senior Analysts)  
**Authentication**: Session token (JWT)  
**Authorization**: RBAC  
**Risk Rules**: Standard risk rules  
**Privilege Scope**: Analysts can view map, Senior Analysts can export  
**Logging**: All map access, all exports  
**Genesis Preservation**: High (1 year)

---

### System 8: Hydra Detection Engine™

**Identity Type**: Service account + Human (Senior Analysts, Admins)  
**Authentication**: API Key + mTLS (service), Session token (human)  
**Authorization**: Service-to-Service + RBAC  
**Risk Rules**: Standard rules  
**Privilege Scope**: Service can detect clusters, Admins can modify detection rules  
**Logging**: All detection events, all configuration changes  
**Genesis Preservation**: High (1 year)

---

### System 9: Cortex Memory Engine™

**Identity Type**: Service account + Human (Analysts, Senior Analysts)  
**Authentication**: API Key + mTLS (service), Session token (human)  
**Authorization**: Service-to-Service + RBAC  
**Risk Rules**: Standard rules  
**Privilege Scope**: Service can store/retrieve patterns, Analysts can query patterns  
**Logging**: All pattern storage/retrieval, all queries  
**Genesis Preservation**: High (1 year)

---

### System 10: Oracle Eye™

**Identity Type**: Service account + Human (Analysts, Senior Analysts)  
**Authentication**: API Key + mTLS (service), Session token (human)  
**Authorization**: Service-to-Service + RBAC  
**Risk Rules**: Standard rules  
**Privilege Scope**: Service can analyze images, Analysts can request analysis  
**Logging**: All image analysis requests, all results  
**Genesis Preservation**: High (1 year)

---

### System 11: Audit Logging Pipeline

**Identity Type**: Service account only  
**Authentication**: API Key + mTLS  
**Authorization**: Service-to-Service  
**Risk Rules**: Invalid mTLS = Deny  
**Privilege Scope**: Write audit logs to Genesis Archive™  
**Logging**: All log ingestion events  
**Genesis Preservation**: Critical (permanent)

---

### System 12: Training Subsystem

**Identity Type**: Service account + Human (Admins, SuperAdmins)  
**Authentication**: API Key + mTLS (service), Session token + FIDO2 (human)  
**Authorization**: Service-to-Service + RBAC + Four-Eyes Approval  
**Risk Rules**: High-risk operation (privilege scope = 0.5)  
**Privilege Scope**: Service can train models, Admins can trigger training (with approval)  
**Logging**: All training jobs, all model deployments  
**Genesis Preservation**: High (1 year)

---

### System 13: Deployment Stack

**Identity Type**: Human (Admins, SuperAdmins)  
**Authentication**: Session token + FIDO2  
**Authorization**: RBAC + Four-Eyes Approval  
**Risk Rules**: Critical operation (privilege scope = 0.6)  
**Privilege Scope**: Admins can deploy non-production, SuperAdmins can deploy production (with Four-Eyes approval)  
**Logging**: All deployments, all rollbacks  
**Genesis Preservation**: Critical (7 years)

---

### System 14: GhostPredictor™

**Identity Type**: Service account + Human (Analysts, Senior Analysts)  
**Authentication**: API Key + mTLS (service), Session token (human)  
**Authorization**: Service-to-Service + RBAC  
**Risk Rules**: Standard rules  
**Privilege Scope**: Service can generate predictions, Analysts can request predictions  
**Logging**: All prediction requests, all prediction results  
**Genesis Preservation**: High (1 year)

---

### System 15: Global Radar Heatmap™

**Identity Type**: Service account + Human (Analysts, Senior Analysts)  
**Authentication**: API Key + mTLS (service), Session token (human)  
**Authorization**: Service-to-Service + RBAC  
**Risk Rules**: Standard rules  
**Privilege Scope**: Service can generate heatmap, Analysts can view heatmap  
**Logging**: All heatmap generation, all heatmap access  
**Genesis Preservation**: High (1 year)

---

### System 16: Actor Profiler™

**Identity Type**: Service account + Human (Analysts, Senior Analysts)  
**Authentication**: API Key + mTLS (service), Session token (human)  
**Authorization**: Service-to-Service + RBAC  
**Risk Rules**: Standard rules  
**Privilege Scope**: Service can profile actors, Analysts can view profiles  
**Logging**: All profiling requests, all profile access  
**Genesis Preservation**: High (1 year)

---

## IAM System Summary Matrix

| System | Identity Type | Authentication | Authorization | Risk Level | Genesis Preservation |
|--------|---------------|----------------|---------------|------------|---------------------|
| Frontend Authentication | Human | Username + Password + MFA | RBAC + RAA | Medium | High (1 year) |
| API Gateway | Mixed | Session token / API Key / mTLS | RBAC / Service / Scopes | Medium | High (1 year) |
| Backend Engines | Service | API Key + mTLS | Service-to-Service | Low | High (1 year) |
| UltraFusion™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Sentinel Console™ | Human | Username + Password + FIDO2 | RBAC + Privileged Recording | High | Critical (7 years) |
| Genesis Archive™ | Mixed | API Key + mTLS / FIDO2 + Four-Eyes | Service / RBAC + Four-Eyes | Critical | Critical (permanent) |
| Constellation™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Hydra™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Cortex™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Oracle Eye™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Audit Logging | Service | API Key + mTLS | Service-to-Service | Critical | Critical (permanent) |
| Training Subsystem | Mixed | Session token + FIDO2 / API Key | RBAC + Four-Eyes / Service | High | High (1 year) |
| Deployment Stack | Human | Session token + FIDO2 | RBAC + Four-Eyes | Critical | Critical (7 years) |
| GhostPredictor™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Global Radar™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |
| Actor Profiler™ | Mixed | Session token / API Key + mTLS | RBAC / Service | Medium | High (1 year) |

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Zero-Trust Architecture**: See zero_trust_architecture.md
- **RBAC Matrix**: See rbac_matrix.md
- **Authentication Events**: See authentication_event_catalog.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial IAM system mapping |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

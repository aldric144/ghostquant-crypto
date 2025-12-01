# FedRAMP System Boundary Diagram

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document defines the FedRAMP authorization boundary for GhostQuant™, including all components, trust boundaries, and external connections.

**Authorization Boundary:** All components hosted in AWS GovCloud (US-West) region within dedicated VPC

**Out of Scope:** Federal agency infrastructure, user workstations, external data sources

---


```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         FEDRAMP AUTHORIZATION BOUNDARY                                   │
│                         AWS GovCloud (US-West) Region                                    │
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              PUBLIC SUBNET (DMZ)                                    │ │
│  │                                                                                     │ │
│  │  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐  │ │
│  │  │   AWS WAF        │────────▶│  Application     │────────▶│   API Gateway    │  │ │
│  │  │   (Firewall)     │         │  Load Balancer   │         │   (Rate Limit)   │  │ │
│  │  └──────────────────┘         └──────────────────┘         └──────────────────┘  │ │
│  │           │                             │                             │            │ │
│  └───────────┼─────────────────────────────┼─────────────────────────────┼───────────┘ │
│              │                             │                             │              │
│              ▼                             ▼                             ▼              │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           PRIVATE SUBNET (APPLICATION)                              │ │
│  │                                                                                     │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    FRONTEND APPLICATION TIER                                  │ │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │ │ │
│  │  │  │  Next.js   │  │  React     │  │  Terminal  │  │  Dashboard │            │ │ │
│  │  │  │  Server    │  │  Frontend  │  │  Interface │  │  UI        │            │ │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                             │ │
│  │                                      ▼                                             │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    BACKEND APPLICATION TIER                                   │ │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │ │ │
│  │  │  │  FastAPI   │  │  Auth      │  │  API       │  │  Business  │            │ │ │
│  │  │  │  Server    │  │  Service   │  │  Endpoints │  │  Logic     │            │ │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                             │ │
│  │                                      ▼                                             │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    INTELLIGENCE ENGINE TIER                                   │ │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │ │ │
│  │  │  │  Sentinel  │  │ UltraFusion│  │  Oracle    │  │  Operation │            │ │ │
│  │  │  │  Console™  │  │  AI™       │  │  Eye™      │  │  Hydra™    │            │ │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │ │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │ │ │
│  │  │  │Constellation│  │   Radar    │  │  Genesis   │  │  Cortex    │            │ │ │
│  │  │  │   Map™     │  │  Heatmap   │  │  Archive™  │  │  Memory™   │            │ │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                             │ │
│  └──────────────────────────────────────┼─────────────────────────────────────────────┘ │
│                                         │                                               │
│                                         ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           PRIVATE SUBNET (DATA)                                     │ │
│  │                                                                                     │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │ │
│  │  │ PostgreSQL │  │   Redis    │  │    S3      │  │  DynamoDB  │                 │ │
│  │  │ (Encrypted)│  │  (Cache)   │  │ (Encrypted)│  │ (Encrypted)│                 │ │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘                 │ │
│  │                                                                                     │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                        MONITORING & LOGGING TIER                                    │ │
│  │                                                                                     │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │ │
│  │  │ CloudWatch │  │ CloudTrail │  │   Config   │  │ GuardDuty  │                 │ │
│  │  │ (Metrics)  │  │  (Audit)   │  │  (Config)  │  │  (Threat)  │                 │ │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘                 │ │
│  │                                                                                     │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         │ (Encrypted Connections)
                                         │
┌────────────────────────────────────────┼─────────────────────────────────────────────┐
│                    EXTERNAL CONNECTIONS (OUT OF SCOPE)                                 │
│                                        │                                               │
│  ┌─────────────────┐    ┌─────────────▼────────────┐    ┌─────────────────┐         │
│  │  Federal Agency │    │  External Data Sources   │    │  Threat Intel   │         │
│  │  Users (HTTPS)  │    │  (Blockchain APIs, etc)   │    │  Feeds (HTTPS)  │         │
│  └─────────────────┘    └──────────────────────────┘    └─────────────────┘         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---



**Location:** Between external users/systems and AWS WAF  
**Controls:**
- AWS WAF with OWASP Top 10 rules
- AWS Shield DDoS protection
- TLS 1.3 encryption for all connections
- IP allowlist/blocklist capabilities
- Rate limiting per endpoint

**Threats Mitigated:**
- DDoS attacks
- SQL injection
- Cross-site scripting (XSS)
- Unauthorized access attempts
- Malicious traffic


**Location:** Between public subnet (DMZ) and private subnet (application)  
**Controls:**
- Security groups with least privilege rules
- Network ACLs for subnet-level filtering
- Application Load Balancer with health checks
- API Gateway with authentication and rate limiting
- VPC Flow Logs for traffic analysis

**Threats Mitigated:**
- Unauthorized internal access
- Lateral movement
- Network-based attacks
- Service disruption


**Location:** Between application tier and data tier  
**Controls:**
- Database security groups (port-level restrictions)
- Database authentication and authorization
- Encryption in transit (TLS 1.2+)
- Encryption at rest (AES-256)
- Database audit logging

**Threats Mitigated:**
- Unauthorized data access
- Data exfiltration
- SQL injection
- Privilege escalation


**Location:** Between administrators and system components  
**Controls:**
- VPN required for administrative access
- Multi-factor authentication (MFA) mandatory
- Privileged access management (PAM)
- Session recording and monitoring
- Just-in-time (JIT) access provisioning

**Threats Mitigated:**
- Unauthorized administrative access
- Credential theft
- Insider threats
- Privilege abuse

---



**Location:** API Gateway  
**Mechanism:** JWT token validation with RS256 algorithm  
**Controls:**
- Multi-factor authentication (MFA) required
- Password complexity requirements (12+ characters)
- Account lockout after 5 failed attempts
- Session timeout after 30 minutes of inactivity


**Location:** FastAPI Backend  
**Mechanism:** Role-Based Access Control (RBAC)  
**Roles:**
- System Administrator: Full system access
- Security Analyst: Intelligence analysis capabilities
- Compliance Officer: Audit and compliance access
- Read-Only User: View-only access
- API User: Programmatic access


**Location:** Data Tier  
**Mechanism:** Database credentials with IAM authentication  
**Controls:**
- Separate credentials per service
- Credential rotation every 90 days
- Least privilege database permissions
- Connection pooling with authentication


**Location:** VPN Gateway  
**Mechanism:** VPN + MFA + IAM roles  
**Controls:**
- VPN certificate authentication
- MFA token validation
- AWS IAM role assumption
- Session monitoring and logging

---



```
Federal Agency User
    │
    │ (1) HTTPS Request (TLS 1.3)
    ▼
AWS WAF (Firewall)
    │
    │ (2) Filtered Traffic
    ▼
Application Load Balancer
    │
    │ (3) Load Balanced Request
    ▼
API Gateway
    │
    │ (4) Authenticated Request (JWT)
    ▼
FastAPI Backend
    │
    │ (5) Authorized Request (RBAC)
    ▼
Intelligence Engines
    │
    │ (6) Processed Intelligence
    ▼
Database (Encrypted)
```


```
Database (Encrypted)
    │
    │ (1) Encrypted Data Retrieval
    ▼
Intelligence Engines
    │
    │ (2) Intelligence Processing
    ▼
FastAPI Backend
    │
    │ (3) Response Formatting
    ▼
API Gateway
    │
    │ (4) Response Validation
    ▼
Application Load Balancer
    │
    │ (5) Load Balanced Response
    ▼
AWS WAF (Firewall)
    │
    │ (6) HTTPS Response (TLS 1.3)
    ▼
Federal Agency User
```

---



**Protocol:** HTTPS (TLS 1.3)  
**Authentication:** JWT tokens with MFA  
**Authorization:** RBAC with 5 roles  
**Encryption:** End-to-end encryption  
**Monitoring:** Genesis Archive™ audit logging


**Protocol:** HTTPS (TLS 1.3)  
**Examples:** Blockchain APIs, exchange APIs, OSINT sources  
**Authentication:** API keys (encrypted in AWS Secrets Manager)  
**Data Classification:** Public data only  
**Monitoring:** API call logging and rate limiting


**Protocol:** HTTPS (TLS 1.3)  
**Examples:** Commercial threat intelligence providers  
**Authentication:** API keys or OAuth 2.0  
**Data Classification:** Public threat intelligence  
**Monitoring:** Feed ingestion logging


**Services:** CloudWatch, CloudTrail, Config, GuardDuty, KMS  
**Protocol:** AWS API (HTTPS with AWS Signature V4)  
**Authentication:** IAM roles and policies  
**Authorization:** Least privilege IAM permissions  
**Monitoring:** CloudTrail API logging

---



**Purpose:** Internet-facing components  
**Components:** AWS WAF, Application Load Balancer, API Gateway  
**Security Groups:** Allow HTTPS (443) from internet, deny all other inbound  
**Network ACLs:** Stateless filtering for additional protection


**Purpose:** Application and intelligence engine tier  
**Components:** Frontend, Backend, 8 Intelligence Engines  
**Security Groups:** Allow traffic from DMZ only, deny direct internet access  
**Network ACLs:** Restrict traffic to application ports only


**Purpose:** Data storage and databases  
**Components:** PostgreSQL, Redis, S3, DynamoDB  
**Security Groups:** Allow traffic from application tier only  
**Network ACLs:** Restrict traffic to database ports only


**Purpose:** Administrative access and monitoring  
**Components:** VPN Gateway, Bastion Host (if required)  
**Security Groups:** Allow VPN traffic only, MFA required  
**Network ACLs:** Restrict to management traffic only

---



**External Connections:** TLS 1.3 (AES-256-GCM)  
**Internal Connections:** TLS 1.2+ (AES-256-GCM)  
**Database Connections:** TLS 1.2+ with certificate validation  
**API Connections:** HTTPS with certificate pinning


**Databases:** AES-256 encryption with AWS KMS  
**File Storage:** S3 server-side encryption (SSE-KMS)  
**Backups:** Encrypted with separate KMS keys  
**Logs:** CloudWatch Logs encryption with KMS

---



**Scope:** All application components within authorization boundary  
**Destination:** Genesis Archive™ (immutable logging)  
**Retention:** 7 years  
**Encryption:** AES-256 at rest, TLS 1.3 in transit


**Scope:** All AWS infrastructure within authorization boundary  
**Destination:** CloudWatch Logs, CloudTrail  
**Retention:** 1 year (CloudWatch), 7 years (CloudTrail)  
**Encryption:** KMS encryption


**Scope:** All security events (authentication, authorization, violations)  
**Destination:** Genesis Archive™, AWS Security Hub  
**Retention:** 7 years  
**Encryption:** AES-256 at rest, TLS 1.3 in transit

---


**Change Control Process:**
1. Proposed boundary changes must be submitted via change request
2. Security impact analysis required for all boundary changes
3. FedRAMP PMO notification required for significant changes
4. Agency ATO sponsor approval required
5. Update SSP and boundary diagrams within 30 days

**Significant Changes:**
- Addition or removal of system components
- Changes to external connections
- Modifications to trust boundaries
- New data types or classifications
- Changes to authentication/authorization mechanisms

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | ISSO | Initial boundary diagram |

**Review Schedule:** Quarterly or upon significant system changes  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

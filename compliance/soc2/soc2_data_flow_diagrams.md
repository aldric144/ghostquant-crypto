# SOC 2 Data Flow Diagrams

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only  
**Owner:** Chief Technology Officer (CTO)

---


This document provides ASCII data flow diagrams illustrating how data flows through GhostQuant™ systems, including user interactions, API processing, intelligence engine operations, data storage, and access controls.

---


```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER / CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Web Browser  │  │ Mobile App   │  │ API Client   │  │ Third-Party │ │
│  │ (React/Next) │  │ (Future)     │  │ (REST/WS)    │  │ Integration │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼──────────────────┼──────────────────┼──────────────────┼───────┘
          │                  │                  │                  │
          │ HTTPS (TLS 1.3)  │                  │                  │
          └──────────────────┴──────────────────┴──────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY / ACCESS LAYER                             │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  AWS Application Load Balancer (ALB)                               │ │
│  │  - SSL/TLS Termination                                             │ │
│  │  - AWS WAF (OWASP Top 10 Rules)                                    │ │
│  │  - DDoS Protection (AWS Shield)                                    │ │
│  │  - Rate Limiting (per endpoint category)                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Authentication & Authorization                                    │ │
│  │  - JWT Token Validation (RS256)                                    │ │
│  │  - MFA Verification                                                │ │
│  │  - RBAC (5 roles: Admin, Analyst, Investigator, Auditor, ReadOnly)│ │
│  │  - Genesis Archive™ Logging (all auth events)                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                     │                                    │
│                                     ▼                                    │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  8 Intelligence Engines                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │ │
│  │  │ Prediction   │  │ Fusion       │  │ Actor        │            │ │
│  │  │ (Oracle Eye) │  │ (UltraFusion)│  │ Profiler     │            │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │ │
│  │  │ Hydra        │  │ Constellation│  │ Radar        │            │ │
│  │  │ (Manip Ring) │  │ (Global Map) │  │ (Heatmap)    │            │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │ │
│  │  ┌──────────────┐  ┌──────────────┐                              │ │
│  │  │ Genesis      │  │ Cortex       │                              │ │
│  │  │ (Archive)    │  │ (Memory)     │                              │ │
│  │  └──────────────┘  └──────────────┘                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA STORAGE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Genesis      │  │ AWS S3      │ │
│  │ (RDS Multi-AZ│  │ (ElastiCache)│  │ Archive™     │  │ (Backups)   │ │
│  │ AES-256)     │  │ (TLS 1.2)    │  │ (Immutable)  │  │ (AES-256)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---


```
┌──────────┐                                                    ┌──────────┐
│  User    │                                                    │ Genesis  │
│ Browser  │                                                    │ Archive™ │
└────┬─────┘                                                    └────┬─────┘
     │                                                                │
     │ 1. POST /auth/login                                           │
     │    {email, password}                                          │
     ├──────────────────────────────────────────────────────────────►│
     │                                                                │
     │ 2. Validate credentials                                       │
     │    - Hash password (bcrypt)                                   │
     │    - Compare with stored hash                                 │
     │                                                                │
     │ 3. Require MFA                                                │
     │◄───────────────────────────────────────────────────────────────│
     │    {mfa_required: true, session_id}                           │
     │                                                                │
     │ 4. POST /auth/mfa                                             │
     │    {session_id, mfa_code}                                     │
     ├──────────────────────────────────────────────────────────────►│
     │                                                                │
     │ 5. Validate MFA code                                          │
     │    - Time-based OTP (TOTP)                                    │
     │    - 30-second window                                         │
     │                                                                │
     │ 6. Generate JWT token                                         │
     │    - RS256 signing                                            │
     │    - 8-hour expiration                                        │
     │    - User ID, role, permissions                               │
     │                                                                │
     │ 7. Log authentication event                                   │
     │    ─────────────────────────────────────────────────────────► │
     │    {event: "auth_success", user_id, ip, timestamp}            │
     │                                                                │
     │ 8. Return JWT token                                           │
     │◄───────────────────────────────────────────────────────────────│
     │    {token, expires_at, user}                                  │
     │                                                                │
     │ 9. Store token (HTTP-only cookie)                             │
     │                                                                │
     │ 10. Subsequent requests include token                         │
     │     Authorization: Bearer <JWT>                               │
     ├──────────────────────────────────────────────────────────────►│
     │                                                                │
     │ 11. Validate token on each request                            │
     │     - Verify signature (RS256)                                │
     │     - Check expiration                                        │
     │     - Validate permissions                                    │
     │                                                                │
     │ 12. Log API request                                           │
     │     ─────────────────────────────────────────────────────────►│
     │     {event: "api_request", user_id, endpoint, method}         │
     │                                                                │
```

---


```
┌──────────────────────────────────────────────────────────────────────────┐
│                        EVENT INGESTION                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Blockchain │  │ Exchange   │  │ Dark Web   │  │ OSINT      │        │
│  │ Networks   │  │ APIs       │  │ Monitoring │  │ Feeds      │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
└────────┼─────────────────┼─────────────────┼─────────────────┼───────────┘
         │                 │                 │                 │
         └─────────────────┴─────────────────┴─────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EVENT ROUTER & VALIDATION                           │
│  - Schema validation (Pydantic)                                          │
│  - Data normalization                                                    │
│  - Deduplication                                                         │
│  - Enrichment with metadata                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENTITY LINKER                                       │
│  - Extract entities (addresses, transactions, actors)                    │
│  - Link to existing entities in database                                 │
│  - Create new entities if not found                                      │
│  - Update entity metadata                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PARALLEL PROCESSING (8 Engines)                     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Prediction Engine (Oracle Eye™)                              │   │
│  │    - Extract 450+ features                                      │   │
│  │    - Run 4 ensemble models                                      │   │
│  │    - Generate risk scores (0.0-1.0)                             │   │
│  │    - <500ms inference latency                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 2. UltraFusion AI Supervisor™                                   │   │
│  │    - Multi-domain feature extraction                            │   │
│  │    - Weighted fusion algorithm                                  │   │
│  │    - Anomaly scoring (0.0-1.0)                                  │   │
│  │    - Alert if >0.70 threshold                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 3. Operation Hydra™                                             │   │
│  │    - Detect manipulation rings                                  │   │
│  │    - 15+ manipulation indicators                                │   │
│  │    - Alert if ≥3 simultaneous indicators                        │   │
│  │    - 98% detection accuracy                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 4. Actor Profiler Engine                                        │   │
│  │    - Behavioral analysis                                        │   │
│  │    - TTP extraction                                             │   │
│  │    - Actor clustering                                           │   │
│  │    - Attribution scoring                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 5. Constellation Map™                                           │   │
│  │    - Geographic correlation                                     │   │
│  │    - Threat clustering                                          │   │
│  │    - Global threat visualization                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 6. Radar Heatmap Engine                                         │   │
│  │    - Real-time event monitoring                                 │   │
│  │    - Spike detection                                            │   │
│  │    - Temporal analysis                                          │   │
│  │    - Alert on supernova events (>10x baseline)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 7. Cortex Memory Engine™                                        │   │
│  │    - Store entity history                                       │   │
│  │    - Build behavioral timelines                                 │   │
│  │    - Relationship graph construction                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 8. Genesis Archive™                                             │   │
│  │    - Immutable audit logging                                    │   │
│  │    - Cryptographic chaining (SHA-256)                           │   │
│  │    - <100ms append latency                                      │   │
│  │    - 100% integrity verification                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      RESULTS AGGREGATION                                 │
│  - Combine results from all engines                                      │
│  - Resolve conflicts and contradictions                                  │
│  - Generate unified intelligence report                                  │
│  - Calculate confidence scores                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STORAGE & NOTIFICATION                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Real-Time    │                 │
│  │ (Persistent) │  │ (Fast Access)│  │ Notifications│                 │
│  │              │  │              │  │ (WebSocket)  │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA CREATION                                     │
│  - Event ingestion from external sources                                 │
│  - User-generated data (investigations, reports)                         │
│  - System-generated data (logs, metrics, alerts)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ACTIVE STORAGE (0-3 years)                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL (Operational Database)                                │  │
│  │ - Events, entities, predictions, investigations                  │  │
│  │ - Fast query performance (<50ms)                                 │  │
│  │ - Multi-AZ replication for high availability                     │  │
│  │ - AES-256 encryption at rest                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Redis Cache (Hot Data)                                           │  │
│  │ - Frequently accessed data                                       │  │
│  │ - Session data, API responses                                    │  │
│  │ - <10ms access latency                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Genesis Archive™ (Immutable Audit Log)                           │  │
│  │ - All security-relevant events                                   │  │
│  │ - Cryptographic chaining (SHA-256)                               │  │
│  │ - Append-only, no modification or deletion                       │  │
│  │ - Continuous replication to secondary region                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ (After 3 years)
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARCHIVE STORAGE (3-7 years)                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ AWS S3 (Standard Storage)                                        │  │
│  │ - Archived operational data                                      │  │
│  │ - Compressed and encrypted (AES-256)                             │  │
│  │ - Cross-region replication for DR                                │  │
│  │ - Lifecycle policy: Transition to Glacier after 90 days          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ AWS S3 Glacier (Cold Storage)                                    │  │
│  │ - Long-term archival (>90 days in S3)                            │  │
│  │ - Lower cost storage                                             │  │
│  │ - Retrieval time: 1-5 minutes (Expedited), 3-5 hours (Standard) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Genesis Archive™ (Permanent Retention)                           │  │
│  │ - 7-year retention for compliance                                │  │
│  │ - Immutable audit trail                                          │  │
│  │ - Multi-region replication                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ (After 7 years, except legal hold)
┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURE DISPOSAL                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Cryptographic Erasure                                            │  │
│  │ - Delete encryption keys (AWS KMS)                               │  │
│  │ - Data becomes unrecoverable                                     │  │
│  │ - Logged to Genesis Archive™                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Secure Deletion                                                  │  │
│  │ - Delete database records                                        │  │
│  │ - Delete S3 objects                                              │  │
│  │ - Verify deletion completion                                     │  │
│  │ - Logged to Genesis Archive™                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Legal Hold Exception                                             │  │
│  │ - Data under legal hold retained indefinitely                    │  │
│  │ - Separate storage with access controls                          │  │
│  │ - Released only upon legal authorization                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INTERNET (Untrusted)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARY 1: Network Perimeter               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ AWS WAF + Shield (DDoS Protection)                                 │ │
│  │ - OWASP Top 10 rules                                               │ │
│  │ - Rate limiting                                                    │ │
│  │ - IP allowlist/blocklist                                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC SUBNET (DMZ)                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Application Load Balancer (ALB)                                    │ │
│  │ - SSL/TLS termination (TLS 1.3)                                    │ │
│  │ - Health checks                                                    │ │
│  │ - Traffic distribution                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARY 2: Authentication                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Authentication Service                                             │ │
│  │ - JWT validation (RS256)                                           │ │
│  │ - MFA verification                                                 │ │
│  │ - Session management                                               │ │
│  │ - Genesis Archive™ logging                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARY 3: Authorization                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ RBAC Authorization                                                 │ │
│  │ - Role validation (Admin, Analyst, Investigator, Auditor, ReadOnly│ │
│  │ - Permission checks                                                │ │
│  │ - Resource-level access control                                   │ │
│  │ - Genesis Archive™ logging                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRIVATE APP SUBNET                                │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ FastAPI Application Servers                                        │ │
│  │ - 8 Intelligence Engines                                           │ │
│  │ - Business logic processing                                        │ │
│  │ - Input validation (Pydantic)                                      │ │
│  │ - Output encoding                                                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARY 4: Data Access                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Data Access Layer                                                  │ │
│  │ - SQL injection prevention (parameterized queries)                 │ │
│  │ - Data classification enforcement                                  │ │
│  │ - Encryption key management (AWS KMS)                              │ │
│  │ - Genesis Archive™ logging                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRIVATE DATA SUBNET                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Genesis      │                 │
│  │ (AES-256)    │  │ (TLS 1.2)    │  │ Archive™     │                 │
│  │ Multi-AZ     │  │ Cluster      │  │ (Immutable)  │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | CTO | Initial release |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

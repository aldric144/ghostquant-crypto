# CJIS System Architecture

## Executive Summary

This document describes GhostQuant's system architecture from a CJIS compliance perspective, including secure boundaries, identity and access management, audit flows, and encryption layers. It provides a comprehensive view of how the platform's intelligence engines, supporting systems, and security controls work together to protect Criminal Justice Information (CJI).

---

## GhostQuant System Architecture Overview

GhostQuant is a distributed intelligence platform composed of 8 core intelligence engines, 3 supporting systems, and comprehensive security infrastructure. The architecture follows zero-trust principles with defense-in-depth security controls.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GhostQuant Platform                              │
│                     (CJIS-Compliant Intelligence System)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼──────────┐       ┌───────────▼──────────┐
         │  Intelligence Layer  │       │   Security Layer     │
         │  (8 Core Engines)    │       │  (Zero-Trust Model)  │
         └──────────┬──────────┘       └───────────┬──────────┘
                    │                               │
         ┌──────────▼──────────┐       ┌───────────▼──────────┐
         │  Supporting Systems  │       │   Audit & Logging    │
         │  (Sentinel/Cortex/   │       │  (Genesis Archive™)  │
         │   Genesis)           │       │                      │
         └──────────┬──────────┘       └───────────┬──────────┘
                    │                               │
         ┌──────────▼──────────────────────────────▼──────────┐
         │              Data Layer (PostgreSQL + Redis)        │
         │           (AES-256 Encryption at Rest)              │
         └─────────────────────────────────────────────────────┘
```

---

## Intelligence Layer Architecture

The Intelligence Layer consists of 8 core engines that process blockchain data and generate threat intelligence:

### 1. Prediction Engine

**Purpose**: ML-based risk prediction and threat forecasting

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              Prediction Engine                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Feature   │  │   Model     │  │  Inference  │    │
│  │  Extraction │→ │  Selection  │→ │   Engine    │    │
│  │  (450+ ML   │  │  (Champion  │  │  (Real-time │    │
│  │  features)  │  │   Model)    │  │  scoring)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Risk Scores    │                    │
│                  │  (0.0 - 1.0)    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Risk scores for entities under investigation are CJI
- Predictions logged to Genesis Archive™
- Access restricted to authorized analysts

### 2. UltraFusion Supervisor

**Purpose**: Multi-domain intelligence fusion across all sources

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│            UltraFusion Supervisor                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Prediction│  │  Hydra   │  │Constella-│  │ Radar  │ │
│  │  Engine  │→ │ Detection│→ │  tion    │→ │ Engine │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│       │             │              │             │      │
│       └─────────────┴──────────────┴─────────────┘      │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Fusion Score   │                    │
│                  │  (Weighted Avg) │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Fused intelligence may combine CJI and non-CJI sources
- Classification level = highest input classification
- Fusion decisions logged to Genesis Archive™

### 3. Hydra Detection

**Purpose**: Multi-head manipulation network identification

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              Hydra Detection Engine                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pattern   │  │   Cluster   │  │    Head     │    │
│  │  Detection  │→ │  Analysis   │→ │ Identification│   │
│  │  (Temporal) │  │  (Graph)    │  │  (Network)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Hydra Heads    │                    │
│                  │  (Manipulation  │                    │
│                  │   Networks)     │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Manipulation networks may involve entities under investigation
- Head identifications are CJI if linked to criminal cases
- Network graphs logged to Genesis Archive™

### 4. Constellation Map

**Purpose**: 3D visual intelligence and cluster analysis

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│           Constellation Map Engine                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Entity    │  │  Clustering │  │     3D      │    │
│  │  Profiling  │→ │  (K-means)  │→ │Visualization│    │
│  │             │  │             │  │   (Globe)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Threat Clusters│                    │
│                  │  (Geographic +  │                    │
│                  │   Behavioral)   │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Cluster memberships may reveal criminal associations
- Geographic data may identify investigation targets
- Cluster data logged to Genesis Archive™

### 5. Global Radar

**Purpose**: Real-time manipulation event detection

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              Global Radar Engine                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Event     │  │   Anomaly   │  │    Alert    │    │
│  │  Ingestion  │→ │  Detection  │→ │  Generation │    │
│  │  (Real-time)│  │  (Thresholds│  │  (Priority) │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Manipulation   │                    │
│                  │     Events      │                    │
│                  │  (Timestamped)  │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Real-time events may trigger investigation alerts
- Event data is CJI if linked to active cases
- All events logged to Genesis Archive™

### 6. Actor Profiler

**Purpose**: Threat actor behavioral analysis and profiling

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              Actor Profiler Engine                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Behavioral │  │   Pattern   │  │   Profile   │    │
│  │   Analysis  │→ │  Matching   │→ │  Generation │    │
│  │  (Timeline) │  │  (Signature)│  │  (Dossier)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Actor Profiles │                    │
│                  │  (Threat Intel) │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Actor profiles are CJI if subjects of investigation
- Behavioral signatures may identify suspects
- Profiles logged to Genesis Archive™

### 7. Oracle Eye

**Purpose**: Visual pattern recognition and anomaly detection

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              Oracle Eye Engine                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Visual    │  │   Pattern   │  │   Anomaly   │    │
│  │  Analysis   │→ │ Recognition │→ │  Detection  │    │
│  │  (Charts)   │  │  (ML-based) │  │  (Outliers) │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Visual Patterns│                    │
│                  │  (Anomalies)    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Visual patterns may reveal criminal activity
- Anomaly detections are CJI if investigation-related
- Pattern data logged to Genesis Archive™

### 8. Behavioral DNA

**Purpose**: Entity behavior profiling and temporal analysis

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│            Behavioral DNA Engine                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Temporal   │  │  Behavioral │  │     DNA     │    │
│  │  Analysis   │→ │  Signature  │→ │  Generation │    │
│  │  (History)  │  │  (Unique)   │  │  (Profile)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Behavioral DNA │                    │
│                  │  (Unique ID)    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Behavioral DNA may uniquely identify suspects
- DNA profiles are CJI if investigation-related
- DNA data logged to Genesis Archive™

---

## Supporting Systems Architecture

### 1. Sentinel Command Console™

**Purpose**: Real-time monitoring of all intelligence engines

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│          Sentinel Command Console™                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Engine    │  │   Global    │  │    Alert    │    │
│  │  Heartbeat  │  │ Intelligence│  │  Detection  │    │
│  │  (Health)   │  │  Collection │  │  (Triggers) │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Dashboard      │                    │
│                  │  (Real-time)    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Dashboard displays CJI intelligence in real-time
- Access restricted to authorized personnel
- Dashboard snapshots logged to Genesis Archive™

### 2. Cortex Memory Engine™

**Purpose**: 30-day historical memory with pattern detection

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│           Cortex Memory Engine™                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Memory    │  │   Pattern   │  │   Recall    │    │
│  │  Ingestion  │→ │  Detection  │→ │   Engine    │    │
│  │  (30 days)  │  │  (Temporal) │  │  (Query)    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Memory Records │                    │
│                  │  (30-day window)│                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- Memory records may contain CJI
- 30-day retention aligns with investigation timelines
- All memory operations logged to Genesis Archive™

### 3. Genesis Archive™

**Purpose**: Permanent intelligence ledger with blockchain-style integrity

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│            Genesis Archive™                             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Record    │  │    Block    │  │   Ledger    │    │
│  │  Ingestion  │→ │  Creation   │→ │Verification │    │
│  │  (Real-time)│  │  (250 recs) │  │  (SHA256)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Immutable      │                    │
│                  │  Audit Trail    │                    │
│                  │  (Permanent)    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**CJIS Considerations**:
- **PRIMARY AUDIT SYSTEM** for CJIS compliance
- Immutable ledger meets CJIS audit requirements
- Permanent retention exceeds 1-year minimum
- SHA256 integrity verification prevents tampering

---

## Secure Boundaries

GhostQuant implements multiple security boundaries to protect CJI:

### Network Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                             │
└───────────────────────┬─────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  AWS Shield    │ (DDoS Protection)
                │  (Layer 3/4)   │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │      WAF       │ (Web Application Firewall)
                │  (Layer 7)     │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  API Gateway   │ (Rate Limiting, Auth)
                └───────┬────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│  Non-CJIS VPC  │           │    CJIS VPC      │
│  (Public Data) │           │  (CJI Data)      │
└────────────────┘           └──────────────────┘
```

**Boundary Enforcement**:
1. **Firewall Rules**: Only authorized IPs can access CJIS VPC
2. **Security Groups**: Micro-segmentation within VPC
3. **Network ACLs**: Stateless filtering at subnet level
4. **VPC Peering**: Encrypted connections between VPCs

### Data Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                   Data Classification                    │
├─────────────────────────────────────────────────────────┤
│  Tier 1: Public Data        (No restrictions)           │
│  Tier 2: Internal Data      (Internal access only)      │
│  Tier 3: Sensitive Intel    (Encrypted, access control) │
│  Tier 4: CJI                (Full CJIS compliance)      │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│  Non-CJIS Zone │           │    CJIS Zone     │
│  (Tier 1-3)    │           │    (Tier 4)      │
│                │           │                  │
│  - Public data │           │  - CJI data      │
│  - General     │           │  - Investigation │
│    intelligence│           │    intelligence  │
│  - No MFA req. │           │  - MFA required  │
└────────────────┘           └──────────────────┘
```

**Boundary Crossing**:
- Data tagged with classification level at ingestion
- Automatic re-classification when crossing boundaries
- Audit logging of all boundary crossings
- Encryption key rotation on boundary crossing

### Application Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │   Backend    │  │   Database   │  │
│  │  (React.js)  │  │  (FastAPI)   │  │ (PostgreSQL) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Authentication │                    │
│                  │  (MFA, RBAC)    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**Boundary Protection**:
- Frontend: Content Security Policy (CSP), CORS
- Backend: Input validation, output encoding, rate limiting
- Database: Parameterized queries, least privilege access

---

## Identity and Access Management (IAM)

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│              Authentication Flow                         │
└─────────────────────────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  User Login    │
                │  (Username +   │
                │   Password)    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  MFA Challenge │
                │  (SMS/App/     │
                │   Hardware)    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Device Trust  │
                │  (Registration,│
                │   Health Check)│
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Geolocation   │
                │  Verification  │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Session Token │
                │  (JWT, 15 min) │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Access Granted│
                └────────────────┘
```

### Authorization Flow

```
┌─────────────────────────────────────────────────────────┐
│              Authorization Flow                          │
└─────────────────────────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  API Request   │
                │  (with JWT)    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Token         │
                │  Validation    │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Role Check    │
                │  (RBAC)        │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Permission    │
                │  Check         │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Data Class.   │
                │  Check (CJI?)  │
                └───────┬────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│  Access Denied │           │  Access Granted  │
│  (Log to       │           │  (Log to Genesis)│
│   Genesis)     │           │                  │
└────────────────┘           └──────────────────┘
```

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────┐
│                    RBAC Matrix                           │
├─────────────────────────────────────────────────────────┤
│  Role          │ Non-CJIS │ CJIS │ Admin │ Audit       │
├────────────────┼──────────┼──────┼───────┼─────────────┤
│  Admin         │    ✓     │  ✓   │   ✓   │     ✓       │
│  Analyst       │    ✓     │  ✓   │   ✗   │     ✗       │
│  Investigator  │    ✓     │  ✓   │   ✗   │     ✗       │
│  Auditor       │    ✓     │  ✓   │   ✗   │     ✓       │
│  Read-Only     │    ✓     │  ✗   │   ✗   │     ✗       │
└─────────────────────────────────────────────────────────┘
```

---

## Audit Flow

### Audit Logging Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Audit Flow                             │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│  Application   │           │    System        │
│  Events        │           │    Events        │
│  (API calls,   │           │  (Server logs,   │
│   user actions)│           │   config changes)│
└───────┬────────┘           └─────────┬────────┘
        │                               │
        └───────────────┬───────────────┘
                        │
                ┌───────▼────────┐
                │  Event         │
                │  Normalization │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Classification│
                │  Tagging       │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Genesis       │
                │  Archive™      │
                │  Ingestion     │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Block         │
                │  Creation      │
                │  (250 records) │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Integrity     │
                │  Verification  │
                │  (SHA256)      │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Permanent     │
                │  Storage       │
                └────────────────┘
```

### Audit Event Types

1. **Authentication Events**:
   - Login attempts (success/failure)
   - Logout events
   - MFA challenges
   - Password changes
   - Session expirations

2. **Authorization Events**:
   - Permission checks
   - Role assignments
   - Access denials
   - Privilege escalations

3. **Data Access Events**:
   - CJI data reads
   - CJI data writes
   - CJI data deletions
   - Data exports
   - Report generations

4. **Administrative Events**:
   - User creation/deletion
   - Configuration changes
   - System updates
   - Backup operations
   - Key rotations

5. **Intelligence Events**:
   - Engine queries
   - Risk score calculations
   - Threat detections
   - Alert generations
   - Report creations

---

## Encryption Layers

GhostQuant implements multiple layers of encryption:

### Layer 1: Transport Encryption (TLS 1.3)

```
┌─────────────────────────────────────────────────────────┐
│              Transport Layer (TLS 1.3)                   │
├─────────────────────────────────────────────────────────┤
│  Client ←→ API Gateway ←→ Backend ←→ Database           │
│    │           │            │           │                │
│    └───────────┴────────────┴───────────┘                │
│                    │                                     │
│           All encrypted with TLS 1.3                     │
│           (AES-256-GCM cipher suite)                     │
└─────────────────────────────────────────────────────────┘
```

### Layer 2: Application Encryption (AES-256)

```
┌─────────────────────────────────────────────────────────┐
│           Application Layer (AES-256-GCM)                │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Sensitive  │  │     CJI      │  │   Genesis    │  │
│  │     Data     │  │    Data      │  │   Archive    │  │
│  │  (Tier 3)    │  │  (Tier 4)    │  │   Blocks     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  Encrypted with AES-256-GCM             │
│                  (Separate keys per tier)               │
└─────────────────────────────────────────────────────────┘
```

### Layer 3: Database Encryption (TDE)

```
┌─────────────────────────────────────────────────────────┐
│         Database Layer (Transparent Data Encryption)     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │  Tables    │  │   Indexes  │  │   Logs     │ │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │   │
│  │        └────────────────┴────────────────┘        │   │
│  │                       │                           │   │
│  │          Encrypted at rest (AES-256)              │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Layer 4: Storage Encryption (SSE-KMS)

```
┌─────────────────────────────────────────────────────────┐
│           Storage Layer (AWS S3 SSE-KMS)                 │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Backups    │  │     Logs     │  │   Archives   │  │
│  │  (S3 Bucket) │  │  (S3 Bucket) │  │  (S3 Bucket) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  Encrypted with SSE-KMS                 │
│                  (AWS KMS managed keys)                 │
└─────────────────────────────────────────────────────────┘
```

### Encryption Key Management

```
┌─────────────────────────────────────────────────────────┐
│              AWS KMS (FIPS 140-2 Level 3)                │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Master     │  │     Data     │  │   Backup     │  │
│  │    Keys      │  │     Keys     │  │    Keys      │  │
│  │  (CMK)       │  │  (DEK)       │  │  (Separate)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                  Automatic rotation (90 days)           │
│                  Audit logging to CloudTrail            │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### Intelligence Data Flow

```
┌─────────────────────────────────────────────────────────┐
│              Intelligence Data Flow                      │
└─────────────────────────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  Data Sources  │
                │  (Blockchain)  │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Ingestion     │
                │  (Connectors)  │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Classification│
                │  (Tier 1-4)    │
                └───────┬────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐           ┌─────────▼────────┐
│  Intelligence  │           │   Genesis        │
│  Engines       │           │   Archive™       │
│  (Processing)  │           │   (Logging)      │
└───────┬────────┘           └──────────────────┘
        │
┌───────▼────────┐
│  API Endpoints │
│  (TLS 1.3)     │
└───────┬────────┘
        │
┌───────▼────────┐
│  Frontend      │
│  (React.js)    │
└────────────────┘
```

---

## Conclusion

GhostQuant's system architecture is designed from the ground up to meet CJIS Security Policy requirements. The platform implements multiple layers of security controls, from network segmentation to application-level encryption, ensuring that Criminal Justice Information is protected at every stage of processing.

The architecture's zero-trust model, combined with comprehensive audit logging via Genesis Archive™, provides the foundation for a CJIS-compliant intelligence platform that can support law enforcement investigations while maintaining the highest standards of data security and integrity.

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Next Review**: March 2026  
**Owner**: GhostQuant Security Team  
**Classification**: Internal Use Only

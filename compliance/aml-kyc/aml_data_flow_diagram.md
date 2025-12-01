# AML Data Flow Diagram

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document provides comprehensive data flow diagrams showing how customer information, transaction data, and intelligence flow through GhostQuant™'s AML/KYC compliance systems.

---


```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER ONBOARDING                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    KYC INFORMATION COLLECTION                    │
│  • Identity Documents                                            │
│  • Biometric Data                                                │
│  • Address Verification                                          │
│  • Beneficial Ownership                                          │
│  • Source of Funds/Wealth                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ORACLE EYE™ VERIFICATION                      │
│  • Document Fraud Detection                                      │
│  • Deepfake Detection                                            │
│  • Metadata Analysis                                             │
│  • Fraud Score: 0-100                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SANCTIONS & PEP SCREENING                     │
│  Actor Profiler™:                                                │
│  • OFAC SDN List                                                 │
│  • UN Sanctions List                                             │
│  • EU Sanctions List                                             │
│  • PEP Databases                                                 │
│  • Adverse Media                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RISK SCORING & CLASSIFICATION                 │
│  UltraFusion AI™:                                                │
│  • Identity Risk                                                 │
│  • Geographic Risk                                               │
│  • PEP/Sanctions Risk                                            │
│  • Document Risk                                                 │
│  • Total Risk Score: 0.00-1.00                                   │
│  • Risk Class: Minimal/Low/Moderate/High/Critical                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPROVAL WORKFLOW                             │
│  • Low Risk: Auto-approve                                        │
│  • Medium Risk: Analyst approval                                 │
│  • High Risk: AML Officer approval                               │
│  • Critical Risk: Executive approval or decline                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNT ACTIVATION                            │
│  • Customer profile created                                      │
│  • Risk score assigned                                           │
│  • Monitoring rules activated                                    │
│  • Genesis Archive™ logging                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ONGOING MONITORING                            │
│  • Transaction monitoring                                        │
│  • Behavioral analysis                                           │
│  • Network analysis                                              │
│  • Periodic reviews                                              │
└─────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACTION INGESTION                         │
│  • Blockchain transactions                                       │
│  • Exchange transactions                                         │
│  • Wallet transactions                                           │
│  • Cross-chain transfers                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME SCREENING                           │
│  Actor Profiler™:                                                │
│  • Sanctions screening (counterparties)                          │
│  • PEP screening (counterparties)                                │
│  • Blocked entity check                                          │
│  • High-risk jurisdiction check                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACTION MONITORING RULES                  │
│  UltraFusion AI™:                                                │
│  • 50 monitoring rules                                           │
│  • Pattern detection                                             │
│  • Anomaly detection                                             │
│  • Velocity analysis (Radar Heatmap™)                            │
│  • Alert generation                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BEHAVIORAL ANALYSIS                           │
│  Actor Profiler™:                                                │
│  • Actor classification                                          │
│  • Behavioral patterns                                           │
│  • Insider indicators                                            │
│  • Ghost indicators                                              │
│  • Predator indicators                                           │
│  • Syndicate indicators                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NETWORK ANALYSIS                              │
│  Operation Hydra™:                                               │
│  • Cluster detection                                             │
│  • Multi-head control                                            │
│  • Coordination patterns                                         │
│  • Network risk propagation                                      │
│  • Hub-and-spoke detection                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GEOGRAPHIC ANALYSIS                           │
│  Constellation Map™:                                             │
│  • Cross-border flows                                            │
│  • High-risk corridors                                           │
│  • Jurisdiction risk assessment                                  │
│  • Sanctions evasion patterns                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    HISTORICAL PATTERN ANALYSIS                   │
│  Cortex Memory™:                                                 │
│  • Long-term behavioral trends                                   │
│  • Recidivism detection                                          │
│  • Dormancy analysis                                             │
│  • Risk evolution tracking                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ALERT GENERATION & PRIORITIZATION             │
│  UltraFusion AI™:                                                │
│  • Alert severity: Critical/High/Medium/Low                      │
│  • Alert prioritization                                          │
│  • Alert routing                                                 │
│  • Duplicate suppression                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ALERT INVESTIGATION                           │
│  • Analyst assignment                                            │
│  • Multi-engine review                                           │
│  • Evidence collection                                           │
│  • Investigation documentation                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SAR DECISION & FILING                         │
│  • AML Officer review                                            │
│  • SAR filing decision                                           │
│  • FinCEN submission                                             │
│  • Genesis Archive™ logging                                      │
└─────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT UPLOAD                               │
│  • Identity documents (passport, driver's license, etc.)         │
│  • Proof of address                                              │
│  • Biometric selfie                                              │
│  • Corporate documents (if applicable)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE QUALITY CHECK                           │
│  Oracle Eye™:                                                    │
│  • Resolution check                                              │
│  • Clarity assessment                                            │
│  • Completeness verification                                     │
│  • Reject if quality insufficient                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT FRAUD DETECTION                      │
│  Oracle Eye™:                                                    │
│  • Template matching                                             │
│  • Forgery detection                                             │
│  • Alteration detection                                          │
│  • Metadata analysis                                             │
│  • Fraud score: 0-100                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BIOMETRIC VERIFICATION                        │
│  Oracle Eye™:                                                    │
│  • Liveness detection                                            │
│  • Facial recognition                                            │
│  • Deepfake detection                                            │
│  • Selfie-to-ID comparison                                       │
│  • Similarity score: 0-100                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION DECISION                         │
│  • Score ≥85: Auto-approve                                       │
│  • Score 70-84: Manual review                                    │
│  • Score <70: Reject                                             │
│  • Deepfake detected: Reject                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EVIDENCE PRESERVATION                         │
│  Genesis Archive™:                                               │
│  • Document images stored (encrypted)                            │
│  • Verification results logged                                   │
│  • Fraud detection analysis saved                                │
│  • Immutable audit trail                                         │
└─────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY IDENTIFICATION                         │
│  • Customer entities                                             │
│  • Transaction counterparties                                    │
│  • Wallet addresses                                              │
│  • Corporate entities                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RELATIONSHIP MAPPING                          │
│  Hydra™:                                                         │
│  • Transaction relationships                                     │
│  • Ownership relationships                                       │
│  • Control relationships                                         │
│  • Timing correlations                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CLUSTER DETECTION                             │
│  Hydra™:                                                         │
│  • Graph analysis                                                │
│  • Community detection                                           │
│  • Cluster identification                                        │
│  • Central node identification                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-HEAD DETECTION                          │
│  Hydra™:                                                         │
│  • Common control indicators                                     │
│  • Behavioral correlation                                        │
│  • Timing synchronization                                        │
│  • Multi-head score calculation                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATION ANALYSIS                         │
│  Hydra™:                                                         │
│  • Transaction timing correlation                                │
│  • Amount pattern matching                                       │
│  • Destination correlation                                       │
│  • Coordination score calculation                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NETWORK RISK ASSESSMENT                       │
│  Hydra™:                                                         │
│  • Cluster risk score                                            │
│  • Network complexity score                                      │
│  • Risk propagation analysis                                     │
│  • Alert generation (high-risk networks)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NETWORK VISUALIZATION                         │
│  • Network diagram generation                                    │
│  • Cluster visualization                                         │
│  • Fund flow mapping                                             │
│  • Evidence for investigations                                   │
└─────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION FROM 8 ENGINES                │
│  • Oracle Eye™ (document verification)                           │
│  • Actor Profiler™ (behavioral classification)                   │
│  • Hydra™ (network analysis)                                     │
│  • Constellation Map™ (geographic analysis)                      │
│  • Radar Heatmap™ (velocity analysis)                            │
│  • Cortex Memory™ (historical patterns)                          │
│  • Genesis Archive™ (audit trail)                                │
│  • Prediction Engine™ (risk forecasting)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE NORMALIZATION                    │
│  UltraFusion AI™:                                                │
│  • Data format standardization                                   │
│  • Score normalization (0-1 scale)                               │
│  • Timestamp synchronization                                     │
│  • Entity resolution                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-SOURCE CORRELATION                      │
│  UltraFusion AI™:                                                │
│  • Cross-engine pattern matching                                 │
│  • Anomaly correlation                                           │
│  • Risk factor aggregation                                       │
│  • Confidence scoring                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    COMPREHENSIVE RISK SCORING                    │
│  UltraFusion AI™:                                                │
│  • Weighted risk calculation                                     │
│  • Identity Risk (15%)                                           │
│  • Behavioral Risk (20%)                                         │
│  • Transactional Risk (25%)                                      │
│  • Cluster Risk (15%)                                            │
│  • Geographic Risk (10%)                                         │
│  • PEP/Sanctions Risk (10%)                                      │
│  • Document Risk (5%)                                            │
│  • Total Risk Score: 0.00-1.00                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ALERT GENERATION & PRIORITIZATION             │
│  UltraFusion AI™:                                                │
│  • Alert severity determination                                  │
│  • Alert prioritization                                          │
│  • Alert routing to analysts                                     │
│  • Alert deduplication                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INVESTIGATION SUPPORT                         │
│  • Comprehensive evidence package                                │
│  • Multi-engine findings summary                                 │
│  • Recommended actions                                           │
│  • GhostWriter AI™ narrative assistance                          │
└─────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT GENERATION                              │
│  • KYC activities                                                │
│  • Transaction monitoring                                        │
│  • Alert investigations                                          │
│  • SAR filings                                                   │
│  • System changes                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT LOGGING                                 │
│  Genesis Archive™:                                               │
│  • Event timestamp                                               │
│  • Event type                                                    │
│  • User/system identifier                                        │
│  • Event details                                                 │
│  • Related entities                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CRYPTOGRAPHIC HASHING                         │
│  Genesis Archive™:                                               │
│  • SHA-256 hash generation                                       │
│  • Block creation                                                │
│  • Chain linking (previous block hash)                           │
│  • Tamper detection                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    IMMUTABLE STORAGE                             │
│  Genesis Archive™:                                               │
│  • Encrypted storage (AES-256)                                   │
│  • Distributed storage                                           │
│  • Backup and replication                                        │
│  • Access controls                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRITY VERIFICATION                        │
│  Genesis Archive™:                                               │
│  • Daily integrity checks                                        │
│  • Chain validation                                              │
│  • Tamper detection                                              │
│  • Alert on anomalies                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIT TRAIL ACCESS                            │
│  • Investigation evidence retrieval                              │
│  • Regulatory examination support                                │
│  • SAR supporting documentation                                  │
│  • Compliance reporting                                          │
└─────────────────────────────────────────────────────────────────┘
```

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    ACTIVE DATA (0-5 YEARS)                       │
│  • Customer records                                              │
│  • Transaction records                                           │
│  • Investigation files                                           │
│  • SAR documentation                                             │
│  • Stored in Genesis Archive™                                    │
│  • Full access for compliance staff                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHIVAL (5-7 YEARS)                          │
│  • Moved to cold storage                                         │
│  • Compressed and encrypted                                      │
│  • Reduced access (AML Officer approval)                         │
│  • Maintained for regulatory requirements                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SECURE DELETION (>7 YEARS)                    │
│  • Regulatory retention period expired                           │
│  • Secure deletion procedures                                    │
│  • Deletion logging                                              │
│  • Certificate of destruction                                    │
└─────────────────────────────────────────────────────────────────┘
```

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial data flow diagrams |

**Review Schedule:** Annually or upon system changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

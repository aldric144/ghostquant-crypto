# AML System Integrations

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document describes the technical architecture and system integrations that support GhostQuant™'s AML/KYC compliance program. It provides a comprehensive view of how external services, internal engines, and databases work together to deliver institutional-grade AML compliance.

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
│  • KYC Verification Providers                                    │
│  • Sanctions/PEP Screening Providers                             │
│  • Blockchain Data Providers                                     │
│  • Exchange APIs                                                 │
│  • Document Verification Services                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & ORCHESTRATION                   │
│  • Rate limiting                                                 │
│  • Authentication                                                │
│  • Request routing                                               │
│  • Response caching                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GHOSTQUANT™ INTELLIGENCE ENGINES              │
│  • UltraFusion AI Supervisor™                                    │
│  • Actor Profiler Engine™                                        │
│  • Operation Hydra™                                              │
│  • Global Constellation Map™                                     │
│  • Oracle Eye™                                                   │
│  • Genesis Archive™                                              │
│  • Cortex Memory™                                                │
│  • Radar Heatmap Engine™                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
│  • PostgreSQL (customer/transaction data)                        │
│  • Redis (real-time caching)                                     │
│  • S3 (document storage)                                         │
│  • Genesis Archive™ (immutable audit log)                        │
└─────────────────────────────────────────────────────────────────┘
```

---



**Purpose:** Identity verification and document authentication

**Integration Type:** REST API

**Endpoints Used:**
- `/initiate` - Start verification session
- `/callback` - Receive verification results
- `/retrieval` - Retrieve verification details

**Data Flow:**
1. Customer initiates KYC process
2. GhostQuant™ creates Jumio verification session
3. Customer completes verification on Jumio platform
4. Jumio sends callback with results
5. Oracle Eye™ validates results
6. Results stored in Genesis Archive™

**Authentication:** API Token + Secret

**Rate Limits:** 100 requests/minute

**SLA:** 99.9% uptime

**Failover:** Secondary provider (Onfido) activated if Jumio unavailable

---


**Purpose:** Backup identity verification

**Integration Type:** REST API

**Endpoints Used:**
- `/applicants` - Create applicant
- `/checks` - Initiate verification check
- `/webhooks` - Receive results

**Data Flow:** Similar to Jumio

**Authentication:** API Token

**Rate Limits:** 50 requests/minute

**Activation:** Automatic failover if Jumio unavailable >5 minutes

---


**Purpose:** Liveness detection and facial biometrics

**Integration Type:** SDK + REST API

**Features:**
- Liveness detection
- Face matching
- Deepfake detection
- Replay attack prevention

**Data Flow:**
1. Customer captures selfie via iProov SDK
2. iProov validates liveness
3. iProov returns biometric template
4. Oracle Eye™ performs face matching
5. Results logged to Genesis Archive™

**Authentication:** API Key + OAuth 2.0

**Rate Limits:** 200 requests/minute

---



**Purpose:** Sanctions, PEP, and adverse media screening

**Integration Type:** REST API

**Endpoints Used:**
- `/cases` - Create screening case
- `/results` - Retrieve screening results
- `/resolution` - Update match resolution

**Screening Lists:**
- OFAC SDN List
- UN Sanctions List
- EU Sanctions List
- UK Sanctions List
- PEP databases (200+ countries)
- Adverse media

**Data Flow:**
1. Actor Profiler™ sends screening request
2. World-Check performs screening
3. Matches returned with confidence scores
4. Actor Profiler™ performs fuzzy matching
5. Results logged to Genesis Archive™

**Authentication:** API Key + OAuth 2.0

**Rate Limits:** 500 requests/minute

**Update Frequency:** Real-time (list updates within 15 minutes)

**SLA:** 99.95% uptime

---


**Purpose:** Backup sanctions and PEP screening

**Integration Type:** REST API

**Activation:** Automatic failover if World-Check unavailable >10 minutes

**Authentication:** API Token

**Rate Limits:** 300 requests/minute

---


**Purpose:** Direct OFAC list verification

**Integration Type:** File download + parsing

**Lists:**
- SDN List (XML)
- Consolidated Screening List (CSV)
- Sectoral Sanctions Identifications (SSI)

**Update Frequency:** Daily download at 00:00 UTC

**Processing:**
1. Download OFAC lists
2. Parse and normalize data
3. Load into Actor Profiler™ database
4. Trigger re-screening of all customers

**Backup:** Manual download if automated process fails

---



**Purpose:** Blockchain transaction analysis and risk scoring

**Integration Type:** REST API

**Endpoints Used:**
- `/addresses/risk` - Address risk assessment
- `/transactions/trace` - Transaction tracing
- `/clusters` - Cluster identification

**Features:**
- Address risk scoring
- Transaction tracing
- Cluster analysis
- Sanctions screening
- Darknet market exposure
- Mixer/tumbler detection

**Data Flow:**
1. Transaction ingested by GhostQuant™
2. Address sent to Chainalysis for risk assessment
3. Risk score and exposure details returned
4. UltraFusion AI™ incorporates into overall risk score
5. Results logged to Genesis Archive™

**Authentication:** API Key

**Rate Limits:** 1000 requests/minute

**Supported Chains:** Bitcoin, Ethereum, Litecoin, Bitcoin Cash, Tether

---


**Purpose:** Cryptocurrency risk intelligence

**Integration Type:** REST API

**Features:**
- Wallet screening
- Transaction monitoring
- Typology detection
- Risk scoring

**Supported Chains:** 15+ blockchains including DeFi protocols

**Authentication:** API Token

**Rate Limits:** 500 requests/minute

---


**Purpose:** Raw blockchain data access

**Providers:**
- Infura (Ethereum)
- Alchemy (Ethereum, Polygon)
- QuickNode (Multi-chain)
- Blockchair (Bitcoin, Ethereum)

**Integration Type:** JSON-RPC / REST API

**Use Cases:**
- Transaction retrieval
- Address balance queries
- Smart contract interaction
- Block data access

**Authentication:** API Keys

**Rate Limits:** Varies by provider (10-100 requests/second)

---



**Integrated Exchanges:**
- Coinbase Pro
- Binance
- Kraken
- Gemini
- Bitstamp

**Integration Type:** REST API + WebSocket

**Data Retrieved:**
- Market data (prices, volumes)
- Order book data
- Trade history
- Deposit/withdrawal data (for customers who connect)

**Authentication:** API Key + Secret (customer-provided for their own data)

**Use Cases:**
- Price data for transaction valuation
- Market manipulation detection
- Wash trading detection
- Cross-exchange correlation

---



**Purpose:** Primary document fraud detection

**Capabilities:**
- Template matching
- Forgery detection
- Metadata analysis
- Deepfake detection

**Integration:** Native GhostQuant™ engine

---


**Purpose:** Enhanced document verification

**Integration Type:** REST API

**Features:**
- Document classification
- Data extraction (OCR)
- Authenticity verification
- Barcode/MRZ validation

**Data Flow:**
1. Document uploaded to GhostQuant™
2. Oracle Eye™ performs initial analysis
3. If additional verification needed, sent to Acuant
4. Acuant returns verification results
5. Results combined with Oracle Eye™ analysis
6. Final decision made

**Authentication:** API Key

**Rate Limits:** 100 requests/minute

---



**Purpose:** Primary relational database

**Schema:**
- Customers
- Transactions
- Alerts
- Investigations
- Cases
- Users
- Configurations

**Hosting:** AWS RDS PostgreSQL 14

**Backup:** Daily automated backups, 30-day retention

**Encryption:** AES-256 encryption at rest, TLS 1.3 in transit

**Access Control:** Role-based access, least privilege principle

---


**Purpose:** Real-time data caching and pub/sub

**Use Cases:**
- Session management
- Real-time alert distribution
- Screening result caching
- Rate limiting
- WebSocket message distribution

**Hosting:** AWS ElastiCache Redis 7

**Persistence:** RDB snapshots + AOF

**Encryption:** TLS 1.3 in transit

---


**Purpose:** Document and evidence storage

**Buckets:**
- `ghostquant-kyc-documents` - Identity documents
- `ghostquant-evidence` - Investigation evidence
- `ghostquant-sar-files` - SAR documentation
- `ghostquant-backups` - Database backups

**Encryption:** AES-256 server-side encryption

**Access Control:** IAM policies, bucket policies, presigned URLs

**Versioning:** Enabled for all buckets

**Lifecycle:** 
- Active data: Standard storage
- 1-5 years: Standard-IA
- 5+ years: Glacier

---


**Purpose:** Immutable audit log

**Technology:** Custom blockchain-inspired ledger

**Features:**
- Cryptographic hashing (SHA-256)
- Block chaining
- Tamper detection
- Distributed storage

**Storage:** PostgreSQL + S3 (dual storage)

**Retention:** Permanent (minimum 5 years regulatory requirement)

---



**Purpose:** System monitoring and alerting

**Monitored Metrics:**
- API response times
- Error rates
- Database performance
- Cache hit rates
- Queue depths
- Engine processing times

**Alerts:**
- High error rates
- Slow response times
- System failures
- Security events

**Integration Type:** Agent + API

---


**Purpose:** Incident management and on-call rotation

**Integration:** Webhook from Datadog

**Escalation:**
1. Alert triggered in Datadog
2. PagerDuty notifies on-call engineer
3. If no response in 15 minutes, escalate to manager
4. If no response in 30 minutes, escalate to CTO

---


**Purpose:** Error tracking and debugging

**Integration:** SDK in application code

**Features:**
- Error capture
- Stack traces
- User context
- Release tracking

---



**Purpose:** SAR filing

**Integration Type:** Manual web portal (no API available)

**Process:**
1. SAR prepared in GhostQuant™
2. Exported to FinCEN format
3. Manually uploaded to BSA E-Filing System
4. BSA ID recorded in GhostQuant™

**Authentication:** FinCEN credentials

**Frequency:** As needed (within 30 days of detection)

---


**Purpose:** Blocking and rejection reports

**Integration Type:** Email + manual portal

**Process:**
1. Blocking/rejection occurs in GhostQuant™
2. Report generated
3. Emailed to OFAC within 10 days
4. Confirmation recorded in Genesis Archive™

---



**Integration Points:**
- Receives data from all 7 other engines
- Normalizes and correlates intelligence
- Generates comprehensive risk scores
- Triggers alerts

**APIs:**
- `/fusion/analyze` - Comprehensive analysis
- `/fusion/risk-score` - Risk score calculation
- `/fusion/alerts` - Alert generation

---


**Integration Points:**
- Integrates with World-Check for sanctions/PEP screening
- Receives behavioral data from transaction monitoring
- Provides actor classification to UltraFusion AI™

**APIs:**
- `/actor/classify` - Actor classification
- `/actor/screen` - Sanctions/PEP screening
- `/actor/profile` - Complete actor profile

---


**Integration Points:**
- Receives transaction data from ingestion layer
- Provides network analysis to UltraFusion AI™
- Identifies clusters and coordination patterns

**APIs:**
- `/hydra/analyze` - Network analysis
- `/hydra/clusters` - Cluster detection
- `/hydra/coordination` - Coordination detection

---


**Integration Points:**
- Receives transaction data with geographic information
- Provides geographic risk assessment to UltraFusion AI™
- Identifies high-risk corridors

**APIs:**
- `/constellation/analyze` - Geographic analysis
- `/constellation/corridors` - High-risk corridor detection
- `/constellation/risk` - Jurisdiction risk assessment

---


**Integration Points:**
- Integrates with Jumio/Onfido for document verification
- Integrates with iProov for biometric verification
- Provides document fraud scores to UltraFusion AI™

**APIs:**
- `/oracle/verify` - Document verification
- `/oracle/biometric` - Biometric verification
- `/oracle/fraud-score` - Fraud score calculation

---


**Integration Points:**
- Receives events from all engines and systems
- Provides audit trail for investigations
- Supports regulatory examinations

**APIs:**
- `/genesis/log` - Event logging
- `/genesis/retrieve` - Audit trail retrieval
- `/genesis/verify` - Integrity verification

---


**Integration Points:**
- Receives historical data from all engines
- Provides long-term pattern analysis to UltraFusion AI™
- Detects behavioral changes and recidivism

**APIs:**
- `/cortex/analyze` - Historical analysis
- `/cortex/patterns` - Pattern detection
- `/cortex/changes` - Behavioral change detection

---


**Integration Points:**
- Receives transaction velocity data
- Provides velocity analysis to UltraFusion AI™
- Detects rapid transaction bursts

**APIs:**
- `/radar/analyze` - Velocity analysis
- `/radar/heatmap` - Heatmap generation
- `/radar/spikes` - Spike detection

---



**Internal APIs:**
- JWT tokens
- API keys
- OAuth 2.0

**External APIs:**
- API keys
- OAuth 2.0
- mTLS (mutual TLS)

**User Authentication:**
- SSO (Single Sign-On)
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)

---


**Data in Transit:**
- TLS 1.3 for all API communications
- Certificate pinning for critical integrations

**Data at Rest:**
- AES-256 encryption for all databases
- AES-256 encryption for all file storage
- Encrypted backups

**Key Management:**
- AWS KMS for encryption keys
- Key rotation every 90 days
- Separate keys per environment

---



**Primary Provider Failure:**
- Automatic failover to secondary provider
- Health checks every 60 seconds
- Failover within 5 minutes

**Database Failure:**
- Multi-AZ deployment with automatic failover
- Read replicas for load distribution
- Recovery Time Objective (RTO): 15 minutes
- Recovery Point Objective (RPO): 5 minutes

**Complete System Failure:**
- Disaster recovery site in separate AWS region
- Daily data replication
- RTO: 4 hours
- RPO: 1 hour

---


**Database Backups:**
- Automated daily backups
- 30-day retention
- Point-in-time recovery

**Document Backups:**
- Real-time replication to S3
- Cross-region replication
- Versioning enabled

**Genesis Archive™ Backups:**
- Distributed storage across 3 locations
- Immutable backups
- Permanent retention

---



**API Response Times:**
- KYC verification: <5 seconds
- Sanctions screening: <2 seconds
- Transaction monitoring: <1 second
- Risk score calculation: <3 seconds

**Throughput:**
- 10,000 transactions/second
- 1,000 KYC verifications/hour
- 100,000 sanctions screenings/hour

---


**Horizontal Scaling:**
- Auto-scaling groups for application servers
- Read replicas for database
- Distributed caching

**Vertical Scaling:**
- Database instance upgrades as needed
- Cache cluster expansion

**Load Balancing:**
- Application Load Balancer (ALB)
- Geographic load balancing
- Health checks and automatic failover

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial system integrations |

**Review Schedule:** Annually or upon system changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

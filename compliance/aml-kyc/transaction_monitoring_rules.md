# Transaction Monitoring Rules

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document defines the comprehensive set of transaction monitoring rules implemented by GhostQuant™ to detect suspicious activities indicative of money laundering, terrorist financing, fraud, and other financial crimes. These rules are implemented across multiple intelligence engines and generate alerts for investigation.

**Total Rules:** 50 active monitoring rules

---



---



**Trigger Condition:** Entity moves funds across 3+ different blockchains within 24 hours

**Description:** Detects rapid movement of funds across multiple blockchain networks, which may indicate layering or obfuscation attempts.

**Engine Used:** UltraFusion AI™, Constellation Map™

**Severity Level:** High

**Evidence Required:**
- Transaction logs showing cross-chain movements
- Timing analysis
- Amount analysis
- Destination analysis

**Threshold:** 3+ chains in 24 hours, total value >$10,000

---


**Trigger Condition:** Multiple transactions just below reporting thresholds ($10,000 or equivalent)

**Description:** Detects structuring (smurfing) where large amounts are broken into smaller transactions to avoid reporting requirements.

**Engine Used:** Hydra™, UltraFusion AI™

**Severity Level:** Critical

**Evidence Required:**
- Transaction amounts and timing
- Cluster analysis showing coordination
- Historical pattern comparison
- Beneficiary analysis

**Threshold:** 3+ transactions of $9,000-$9,999 within 7 days, or 5+ transactions of $8,000-$9,999 within 30 days

---


**Trigger Condition:** Funds pass through 5+ intermediate addresses within 48 hours

**Description:** Detects complex layering schemes where funds are moved through multiple intermediaries to obscure the trail.

**Engine Used:** Hydra™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Complete transaction chain
- Timing analysis
- Intermediate address analysis
- Final destination identification

**Threshold:** 5+ hops in 48 hours, total value >$25,000

---


**Trigger Condition:** Account dormant for 180+ days suddenly becomes highly active

**Description:** Detects dormant accounts that are reactivated with high-value or high-frequency transactions, which may indicate account takeover or money laundering.

**Engine Used:** Cortex Memory™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Historical activity analysis
- Dormancy period documentation
- Reactivation transaction analysis
- Behavioral comparison (before vs. after)

**Threshold:** 180+ days dormant, then 10+ transactions or >$50,000 in first 7 days

---


**Trigger Condition:** 5+ entities execute similar transactions within narrow time window

**Description:** Detects coordinated activities across multiple entities that may indicate syndicate-level money laundering.

**Engine Used:** Hydra™, Actor Profiler™

**Severity Level:** Critical

**Evidence Required:**
- Cluster analysis showing relationships
- Transaction timing correlation
- Pattern similarity analysis
- Coordination indicators

**Threshold:** 5+ entities, transactions within 1-hour window, similar amounts (±10%)

---


**Trigger Condition:** Large cryptocurrency amounts converted to fiat or legitimate assets

**Description:** Detects integration phase of money laundering where illicit funds are integrated into the legitimate economy.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Conversion transaction details
- Source of funds analysis
- Destination analysis (fiat accounts, asset purchases)
- Historical pattern analysis

**Threshold:** Single conversion >$100,000 or cumulative >$250,000 in 30 days

---


**Trigger Condition:** Significant deviation from established behavioral profile

**Description:** Detects when an entity's behavior significantly changes from their historical pattern, which may indicate account compromise or change in illicit activity.

**Engine Used:** Actor Profiler™, Cortex Memory™

**Severity Level:** Medium

**Evidence Required:**
- Historical behavioral profile
- Current behavioral analysis
- Deviation metrics
- Potential explanatory factors

**Threshold:** Behavioral deviation score >0.70 (on 0-1 scale)

---


**Trigger Condition:** Conversion to or from privacy coins (Monero, Zcash, Dash)

**Description:** Detects usage of privacy coins that obscure transaction details, which may indicate obfuscation attempts.

**Engine Used:** UltraFusion AI™, Actor Profiler™

**Severity Level:** High

**Evidence Required:**
- Privacy coin transaction details
- Conversion amounts and timing
- Source and destination analysis
- Historical privacy coin usage

**Threshold:** Any privacy coin transaction >$10,000 or cumulative >$25,000 in 30 days

---


**Trigger Condition:** Funds sent to or received from known mixing services

**Description:** Detects usage of cryptocurrency mixing or tumbling services designed to obscure transaction trails.

**Engine Used:** UltraFusion AI™, Actor Profiler™

**Severity Level:** Critical

**Evidence Required:**
- Mixer service identification
- Transaction amounts and timing
- Pre-mix and post-mix analysis
- Historical mixer usage

**Threshold:** Any mixer transaction >$5,000 or cumulative >$15,000 in 30 days

---


**Trigger Condition:** Large portfolio liquidated within 24 hours

**Description:** Detects rapid liquidation of cryptocurrency holdings, which may indicate insider trading, fraud proceeds, or emergency fund movement.

**Engine Used:** UltraFusion AI™, Actor Profiler™

**Severity Level:** High

**Evidence Required:**
- Portfolio composition before liquidation
- Liquidation transaction details
- Market conditions analysis
- Potential triggering events

**Threshold:** >50% of portfolio liquidated in 24 hours, portfolio value >$100,000

---



**Trigger Condition:** Single transaction exceeds $100,000

**Description:** Detects high-value transactions that require enhanced scrutiny.

**Engine Used:** UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Transaction details
- Source of funds
- Purpose of transaction
- Beneficiary information

**Threshold:** Single transaction >$100,000

---


**Trigger Condition:** Cumulative transactions exceed $250,000 in 24 hours

**Description:** Detects high cumulative transaction volumes in short time period.

**Engine Used:** UltraFusion AI™, Radar Heatmap™

**Severity Level:** High

**Evidence Required:**
- All transactions in period
- Timing analysis
- Source and destination analysis
- Business justification

**Threshold:** Cumulative >$250,000 in 24 hours

---


**Trigger Condition:** Cumulative transactions exceed $500,000 in 7 days

**Description:** Detects sustained high-volume activity over one week.

**Engine Used:** UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- All transactions in period
- Pattern analysis
- Business justification
- Historical comparison

**Threshold:** Cumulative >$500,000 in 7 days

---


**Trigger Condition:** Transaction frequency increases 5x compared to 30-day average

**Description:** Detects sudden bursts in transaction frequency.

**Engine Used:** Radar Heatmap™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Historical transaction frequency
- Current frequency analysis
- Transaction details
- Potential explanatory factors

**Threshold:** 5x increase in frequency, sustained for 6+ hours

---


**Trigger Condition:** Multiple transactions in exact round numbers

**Description:** Detects transactions in suspiciously round numbers, which may indicate structuring or artificial transactions.

**Engine Used:** UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Transaction amounts
- Frequency of round numbers
- Historical pattern comparison
- Business justification

**Threshold:** 5+ transactions in exact round numbers (e.g., $10,000, $25,000) within 30 days

---


**Trigger Condition:** Multiple transactions just below $10,000 threshold

**Description:** Detects transactions designed to avoid CTR reporting requirements.

**Engine Used:** UltraFusion AI™

**Severity Level:** Critical

**Evidence Required:**
- Transaction amounts and timing
- Pattern analysis
- Historical comparison
- Structuring indicators

**Threshold:** 3+ transactions of $9,500-$9,999 within 7 days

---


**Trigger Condition:** Funds pass through 3+ intermediate addresses

**Description:** Detects transactions routed through multiple intermediaries.

**Engine Used:** Hydra™, UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Complete transaction path
- Intermediate address analysis
- Timing analysis
- Final destination

**Threshold:** 3+ hops, total value >$10,000

---


**Trigger Condition:** Funds return to original address after multiple hops

**Description:** Detects circular transaction patterns that may indicate wash trading or obfuscation.

**Engine Used:** Hydra™

**Severity Level:** High

**Evidence Required:**
- Complete transaction cycle
- Timing analysis
- Amount analysis (fees deducted)
- Purpose analysis

**Threshold:** Funds return to origin within 7 days, 3+ hops

---


**Trigger Condition:** Cross-border transaction exceeds $50,000

**Description:** Detects high-value cross-border transactions requiring enhanced scrutiny.

**Engine Used:** Constellation Map™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Transaction details
- Jurisdiction analysis
- Purpose of transfer
- Regulatory compliance (Travel Rule)

**Threshold:** Cross-border transaction >$50,000

---


**Trigger Condition:** Transaction involves high-risk jurisdiction pair

**Description:** Detects transactions between high-risk jurisdiction pairs.

**Engine Used:** Constellation Map™

**Severity Level:** High

**Evidence Required:**
- Jurisdiction risk assessment
- Transaction details
- Purpose of transfer
- Enhanced due diligence

**Threshold:** Transaction between two FATF grey/black list jurisdictions, any amount >$5,000

---


**Trigger Condition:** Large transaction followed by reversal within 24 hours

**Description:** Detects transactions that are quickly reversed, which may indicate testing, errors, or fraud.

**Engine Used:** UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Original transaction details
- Reversal transaction details
- Timing analysis
- Explanation for reversal

**Threshold:** Transaction >$25,000 reversed within 24 hours

---


**Trigger Condition:** Transactions occur during unusual hours (2am-5am local time)

**Description:** Detects transactions during unusual hours that may indicate automated bots or attempts to avoid detection.

**Engine Used:** UltraFusion AI™, Cortex Memory™

**Severity Level:** Low

**Evidence Required:**
- Transaction timing
- Historical timing patterns
- Geographic location
- Explanation for timing

**Threshold:** 5+ transactions during 2am-5am local time within 7 days, total value >$50,000

---


**Trigger Condition:** High-volume usage of P2P platforms

**Description:** Detects heavy usage of peer-to-peer platforms that may facilitate unregulated transactions.

**Engine Used:** UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- P2P platform identification
- Transaction volumes
- Counterparty analysis
- Purpose of transactions

**Threshold:** >$100,000 through P2P platforms in 30 days

---


**Trigger Condition:** Transactions through nested service providers

**Description:** Detects usage of nested service providers that may obscure beneficial ownership.

**Engine Used:** Hydra™, Actor Profiler™

**Severity Level:** High

**Evidence Required:**
- Service provider chain
- Beneficial ownership analysis
- Transaction details
- Regulatory compliance

**Threshold:** 2+ layers of service providers, transaction >$25,000

---


**Trigger Condition:** Transaction involves unusual or high-risk asset types

**Description:** Detects transactions involving NFTs, stablecoins, or other assets that may facilitate money laundering.

**Engine Used:** UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Asset type identification
- Transaction details
- Valuation analysis
- Purpose of transaction

**Threshold:** NFT transaction >$50,000 or stablecoin transaction >$250,000 in 24 hours

---



**Trigger Condition:** Oracle Eye™ fraud score <70

**Description:** Detects forged or manipulated identity documents.

**Engine Used:** Oracle Eye™

**Severity Level:** Critical

**Evidence Required:**
- Document images
- Fraud detection analysis
- Metadata analysis
- Verification attempts

**Threshold:** Fraud score <70 (on 0-100 scale)

---


**Trigger Condition:** Oracle Eye™ deepfake confidence >70%

**Description:** Detects synthetic or manipulated biometric data.

**Engine Used:** Oracle Eye™

**Severity Level:** Critical

**Evidence Required:**
- Biometric data
- Deepfake analysis
- Liveness detection results
- Verification attempts

**Threshold:** Deepfake confidence >70%

---


**Trigger Condition:** Inconsistent identity information across sources

**Description:** Detects inconsistencies in identity information that may indicate fraud.

**Engine Used:** Oracle Eye™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- All identity documents
- Inconsistency analysis
- Verification attempts
- Explanation requests

**Threshold:** 2+ significant inconsistencies (name, DOB, address)

---


**Trigger Condition:** Document metadata indicates manipulation

**Description:** Detects metadata anomalies that suggest document manipulation.

**Engine Used:** Oracle Eye™

**Severity Level:** High

**Evidence Required:**
- Document metadata
- Anomaly analysis
- Creation/modification dates
- Software used

**Threshold:** 3+ metadata anomalies

---


**Trigger Condition:** Multiple indicators of synthetic identity

**Description:** Detects synthetic identities created from real and fake information.

**Engine Used:** Oracle Eye™, Hydra™, Actor Profiler™

**Severity Level:** Critical

**Evidence Required:**
- Identity verification results
- Credit bureau results
- Public records search
- Network analysis

**Threshold:** 3+ synthetic identity indicators

---


**Trigger Condition:** Behavioral patterns inconsistent with identity

**Description:** Detects potential identity theft through behavioral analysis.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Behavioral analysis
- Historical patterns
- Identity verification
- Victim notification attempts

**Threshold:** Behavioral deviation score >0.80, identity verification concerns

---


**Trigger Condition:** Single entity controls multiple identities

**Description:** Detects entities using multiple identities to evade detection.

**Engine Used:** Hydra™, Oracle Eye™

**Severity Level:** Critical

**Evidence Required:**
- Identity documents for all identities
- Network analysis showing common control
- Behavioral correlation
- Device fingerprinting

**Threshold:** 2+ identities controlled by same entity

---


**Trigger Condition:** Document matches known stolen document database

**Description:** Detects usage of stolen identity documents.

**Engine Used:** Oracle Eye™

**Severity Level:** Critical

**Evidence Required:**
- Document images
- Stolen document database match
- Verification attempts
- Law enforcement notification

**Threshold:** Confirmed match to stolen document database

---



**Trigger Condition:** Whale-classified entity engages in market manipulation

**Description:** Detects large holders engaging in market manipulation activities.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- Actor classification
- Transaction analysis
- Market impact analysis
- Manipulation indicators

**Threshold:** Whale classification + manipulation indicators (pump/dump, spoofing)

---


**Trigger Condition:** Insider-classified entity trades ahead of announcements

**Description:** Detects insider trading based on timing and privileged information.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** Critical

**Evidence Required:**
- Actor classification
- Transaction timing
- Announcement timing
- Profit analysis

**Threshold:** Insider classification + trades within 48 hours before major announcement

---


**Trigger Condition:** Ghost-classified entity engages in high-value transactions

**Description:** Detects entities attempting to obscure identity while moving large amounts.

**Engine Used:** Actor Profiler™

**Severity Level:** Critical

**Evidence Required:**
- Actor classification
- Obfuscation techniques used
- Transaction details
- Identity verification attempts

**Threshold:** Ghost classification + transaction >$50,000

---


**Trigger Condition:** Predator-classified entity engages in fraud patterns

**Description:** Detects entities engaged in fraud, scams, or market manipulation.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** Critical

**Evidence Required:**
- Actor classification
- Fraud pattern analysis
- Victim identification
- Law enforcement referral

**Threshold:** Predator classification + fraud indicators

---


**Trigger Condition:** Syndicate-classified entities coordinate activities

**Description:** Detects organized crime or professional money laundering organizations.

**Engine Used:** Actor Profiler™, Hydra™

**Severity Level:** Critical

**Evidence Required:**
- Actor classification
- Network analysis
- Coordination indicators
- Law enforcement referral

**Threshold:** Syndicate classification + coordinated transactions >$100,000

---


**Trigger Condition:** Entity classification changes to higher-risk category

**Description:** Detects when an entity's risk profile escalates significantly.

**Engine Used:** Actor Profiler™, Cortex Memory™

**Severity Level:** Medium

**Evidence Required:**
- Previous classification
- Current classification
- Factors driving change
- Enhanced monitoring

**Threshold:** Classification change from Retail/Whale to Insider/Ghost/Predator/Syndicate

---


**Trigger Condition:** PEP-classified entity engages in high-value transaction

**Description:** Detects high-value transactions by politically exposed persons.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** High

**Evidence Required:**
- PEP classification
- Transaction details
- Source of funds
- Enhanced due diligence

**Threshold:** PEP classification + transaction >$50,000

---


**Trigger Condition:** Entity has network connections to sanctioned entities

**Description:** Detects indirect sanctions exposure through network analysis.

**Engine Used:** Actor Profiler™, Hydra™

**Severity Level:** High

**Evidence Required:**
- Network analysis
- Sanctions screening results
- Relationship documentation
- Enhanced due diligence

**Threshold:** 2+ degrees of separation from sanctioned entity, transaction >$10,000

---


**Trigger Condition:** Entity appears in adverse media related to financial crime

**Description:** Detects entities with negative media coverage.

**Engine Used:** Actor Profiler™, UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Media articles
- Relevance analysis
- Entity response
- Enhanced monitoring

**Threshold:** Adverse media hit related to money laundering, fraud, terrorism, or corruption

---


**Trigger Condition:** Entity with prior SAR filing engages in suspicious activity

**Description:** Detects repeat offenders with history of suspicious activities.

**Engine Used:** Cortex Memory™, Actor Profiler™

**Severity Level:** High

**Evidence Required:**
- Historical SAR filings
- Current suspicious activity
- Pattern comparison
- Enhanced investigation

**Threshold:** Prior SAR filing + new suspicious activity indicators

---



**Trigger Condition:** Entity is central node in high-risk cluster

**Description:** Detects entities controlling multiple addresses in coordinated manner.

**Engine Used:** Hydra™

**Severity Level:** Critical

**Evidence Required:**
- Cluster analysis
- Network diagram
- Coordination indicators
- Transaction flow analysis

**Threshold:** Central node in cluster of 5+ addresses, cluster risk score >0.70

---


**Trigger Condition:** Entity acts as hub for multiple spokes

**Description:** Detects hub-and-spoke money laundering structures.

**Engine Used:** Hydra™

**Severity Level:** High

**Evidence Required:**
- Network topology
- Transaction flows
- Spoke analysis
- Purpose analysis

**Threshold:** Hub with 10+ spokes, total flow >$500,000 in 30 days

---


**Trigger Condition:** Funds flow in circular pattern through network

**Description:** Detects circular fund flows that may indicate wash trading or obfuscation.

**Engine Used:** Hydra™

**Severity Level:** High

**Evidence Required:**
- Complete flow diagram
- Timing analysis
- Amount analysis
- Purpose analysis

**Threshold:** Circular flow through 4+ entities, total value >$100,000

---


**Trigger Condition:** High-risk entity connects to previously low-risk entities

**Description:** Detects risk propagation through networks.

**Engine Used:** Hydra™, UltraFusion AI™

**Severity Level:** Medium

**Evidence Required:**
- Network analysis
- Risk score changes
- Connection analysis
- Transaction details

**Threshold:** High-risk entity (score >0.70) connects to 3+ low-risk entities (score <0.30)

---


**Trigger Condition:** Multiple layers of service providers detected

**Description:** Detects nested service provider structures that obscure beneficial ownership.

**Engine Used:** Hydra™, Actor Profiler™

**Severity Level:** High

**Evidence Required:**
- Service provider chain
- Beneficial ownership analysis
- Regulatory compliance
- Purpose analysis

**Threshold:** 3+ layers of service providers

---


**Trigger Condition:** Multiple clusters coordinate activities

**Description:** Detects coordination between separate clusters that may indicate large-scale money laundering.

**Engine Used:** Hydra™, UltraFusion AI™

**Severity Level:** Critical

**Evidence Required:**
- Multiple cluster analysis
- Coordination indicators
- Transaction timing
- Total flow analysis

**Threshold:** 2+ clusters coordinate, total flow >$1,000,000 in 30 days

---


**Trigger Condition:** Sudden increase in network complexity

**Description:** Detects sudden increases in network complexity that may indicate escalating money laundering.

**Engine Used:** Hydra™, Cortex Memory™

**Severity Level:** High

**Evidence Required:**
- Historical network analysis
- Current network analysis
- Complexity metrics
- Triggering transactions

**Threshold:** Network complexity increases 3x compared to 30-day average

---



**Automated Alert Generation:**
- All rule violations generate automated alerts
- Alerts routed to investigation queue
- Severity-based prioritization
- Duplicate alert suppression (24-hour window)

**Alert Information:**
- Rule ID and description
- Triggering entity/transaction
- Severity level
- Evidence summary
- Recommended actions

---


**Priority Levels:**
1. **Critical:** Sanctions matches, syndicate activity, confirmed fraud
2. **High:** Structuring, layering, insider trading, PEP high-value
3. **Medium:** Behavioral changes, unusual patterns, moderate risk
4. **Low:** Minor anomalies, informational alerts

**SLA by Priority:**
- Critical: Review within 4 hours
- High: Review within 24 hours
- Medium: Review within 72 hours
- Low: Review within 7 days

---


**Investigation Workflow:**
1. Alert triage and assignment
2. Evidence collection from Genesis Archive™
3. Multi-engine analysis (Fusion, Actor, Hydra, Constellation, Oracle)
4. Additional information requests (if needed)
5. Investigation conclusion
6. SAR filing decision
7. Case closure and documentation

**Investigation Documentation:**
- All steps logged to Genesis Archive™
- Evidence preserved
- Decision rationale documented
- Supervisory review for high-risk cases

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial transaction monitoring rules |

**Review Schedule:** Quarterly or upon regulatory changes  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

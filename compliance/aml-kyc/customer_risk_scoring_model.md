# Customer Risk Scoring Model

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document defines the official AML risk scoring model for GhostQuant™ customers and entities. The model provides a quantitative assessment of money laundering and terrorist financing risk based on multiple risk factors derived from GhostQuant™ intelligence engines.

**Regulatory Basis:** FATF Recommendation 1 (Risk-Based Approach), BSA Risk Assessment Requirements

---



**Definition:** Risk associated with customer identity verification and authenticity

**Risk Factors:**
- Quality and authenticity of identification documents
- Verification method used (documentary vs. non-documentary)
- Consistency of information across sources
- Oracle Eye™ document fraud detection score
- Biometric verification confidence
- Identity theft indicators
- Synthetic identity indicators

**Scoring:**
- **0.00-0.20 (Minimal):** High-quality government-issued ID, biometric verification passed, no fraud indicators
- **0.20-0.40 (Low):** Standard documentation, minor inconsistencies resolved
- **0.40-0.60 (Moderate):** Limited documentation, some verification challenges
- **0.60-0.80 (High):** Poor quality documentation, verification concerns, minor fraud indicators
- **0.80-1.00 (Critical):** Suspected forged documents, deepfake detected, identity theft indicators

**GhostQuant™ Engine Integration:**
- Oracle Eye™ provides document fraud score (0-100)
- Identity Risk = 1 - (Oracle Eye Score / 100)

---


**Definition:** Risk based on customer behavioral patterns and activities

**Risk Factors:**
- Actor Profiler™ classification (Whale, Insider, Ghost, Predator, Syndicate, Retail)
- Behavioral anomalies and deviations from profile
- Insider trading indicators
- Market manipulation indicators
- Obfuscation attempts (privacy coins, mixers)
- Coordination with other high-risk entities

**Scoring by Actor Profile:**
- **Retail (0.10):** Standard retail investor behavior
- **Whale (0.30):** Large-scale legitimate investor
- **Insider (0.70):** Privileged information or access indicators
- **Ghost (0.80):** Identity obfuscation attempts
- **Predator (0.85):** Market manipulation or fraud indicators
- **Syndicate (0.95):** Coordinated illicit activity

**Behavioral Anomaly Adjustments:**
- +0.10 for significant behavioral changes
- +0.15 for privacy coin usage
- +0.20 for mixer/tumbler usage
- +0.10 for unusual timing patterns

---


**Definition:** Risk based on transaction patterns, volumes, and characteristics

**Risk Factors:**
- Transaction volume and frequency
- High-value transactions
- Structuring patterns
- Layering indicators
- Rapid fund movements
- Unusual transaction timing
- Velocity anomalies
- Integration phase indicators

**Scoring:**
- **0.00-0.20 (Minimal):** Predictable patterns, consistent with customer profile
- **0.20-0.40 (Low):** Occasional large transactions, explained by business
- **0.40-0.60 (Moderate):** Irregular patterns, some unexplained transactions
- **0.60-0.80 (High):** Structuring indicators, rapid movements, layering patterns
- **0.80-1.00 (Critical):** Clear money laundering patterns, multiple red flags

**GhostQuant™ Engine Integration:**
- UltraFusion AI™ analyzes transaction patterns
- Radar Heatmap™ detects velocity anomalies
- Transactional Risk = UltraFusion Transaction Risk Score

---


**Definition:** Risk based on network connections and relationships

**Risk Factors:**
- Hydra™ cluster membership
- Number of related entities
- Cluster risk score
- Coordination indicators
- Network centrality
- Connections to known bad actors
- Multi-head control patterns

**Scoring:**
- **0.00-0.20 (Minimal):** No significant cluster membership, isolated entity
- **0.20-0.40 (Low):** Small cluster, low-risk connections
- **0.40-0.60 (Moderate):** Medium cluster, some high-risk connections
- **0.60-0.80 (High):** Large cluster, multiple high-risk connections, coordination indicators
- **0.80-1.00 (Critical):** Central node in high-risk network, syndicate membership

**GhostQuant™ Engine Integration:**
- Hydra™ provides cluster risk score
- Cluster Risk = Hydra Cluster Risk Score

---


**Definition:** Risk based on geographic locations and jurisdictions

**Risk Factors:**
- Customer jurisdiction
- Transaction jurisdictions
- FATF high-risk jurisdictions
- Sanctions jurisdictions
- Corruption perception index
- Regulatory oversight quality
- Cross-border flow patterns

**Scoring by Jurisdiction:**
- **0.00-0.20 (Minimal):** Strong AML regimes (US, UK, EU, Singapore, Japan)
- **0.20-0.40 (Low):** Adequate AML regimes, good regulatory oversight
- **0.40-0.60 (Moderate):** Developing AML regimes, moderate oversight
- **0.60-0.80 (High):** FATF grey list, weak AML regimes
- **0.80-1.00 (Critical):** FATF black list, sanctioned jurisdictions, no AML oversight

**GhostQuant™ Engine Integration:**
- Constellation Map™ provides geographic risk assessment
- Geopolitical Risk = Constellation Geographic Risk Score

---


**Definition:** Risk based on Politically Exposed Person status and connections

**Risk Factors:**
- PEP status (domestic, foreign, international organization)
- PEP level (head of state, senior official, family member, associate)
- Source of wealth transparency
- Corruption allegations
- Network connections to other PEPs

**Scoring:**
- **0.00 (None):** No PEP status or connections
- **0.30 (Low):** Former domestic PEP (>12 months), family member of low-risk PEP
- **0.50 (Moderate):** Current domestic PEP, former foreign PEP (>12 months)
- **0.70 (High):** Current foreign PEP, senior government official
- **0.90 (Critical):** Head of state, sanctioned PEP, corruption allegations

**GhostQuant™ Engine Integration:**
- Actor Profiler™ identifies PEP status
- Hydra™ identifies PEP network connections
- PEP Risk = Actor Profiler PEP Risk Score

---


**Definition:** Risk based on sanctions screening and proximity to sanctioned entities

**Risk Factors:**
- Direct sanctions list match
- Indirect sanctions exposure (network connections)
- Sanctioned jurisdiction involvement
- Sanctions evasion indicators
- Blocked transaction history

**Scoring:**
- **0.00 (None):** No sanctions exposure
- **0.30 (Low):** Distant network connection to sanctioned entity
- **0.50 (Moderate):** Transactions with sanctioned jurisdictions
- **0.70 (High):** Close network connection to sanctioned entity, sanctions evasion indicators
- **1.00 (Critical):** Direct sanctions list match, confirmed sanctions violation

**GhostQuant™ Engine Integration:**
- Actor Profiler™ performs sanctions screening
- Hydra™ identifies indirect sanctions exposure
- Sanctions Risk = Actor Profiler Sanctions Risk Score

---


**Definition:** Risk based on document fraud detection and verification quality

**Risk Factors:**
- Oracle Eye™ fraud detection score
- Document quality and completeness
- Metadata anomalies
- Template matching results
- Deepfake detection results

**Scoring:**
- **0.00-0.20 (Minimal):** High-quality authentic documents, no fraud indicators
- **0.20-0.40 (Low):** Standard documents, minor quality issues
- **0.40-0.60 (Moderate):** Poor quality documents, some anomalies
- **0.60-0.80 (High):** Multiple anomalies, suspected manipulation
- **0.80-1.00 (Critical):** Confirmed forgery, deepfake detected

**GhostQuant™ Engine Integration:**
- Oracle Eye™ provides document fraud score
- Document Risk = 1 - (Oracle Eye Document Score / 100)

---


**Definition:** Risk based on Hydra™ network analysis and multi-head detection

**Risk Factors:**
- Multi-head control indicators
- Network complexity
- Coordination patterns
- Hub-and-spoke structures
- Circular fund flows
- Nested service providers

**Scoring:**
- **0.00-0.20 (Minimal):** Simple structure, no multi-head indicators
- **0.20-0.40 (Low):** Standard business relationships
- **0.40-0.60 (Moderate):** Some complexity, minor coordination
- **0.60-0.80 (High):** Complex network, multi-head indicators, coordination patterns
- **0.80-1.00 (Critical):** Hydra structure confirmed, professional money laundering organization

**GhostQuant™ Engine Integration:**
- Hydra™ provides network risk score
- Network Risk = Hydra Network Risk Score

---



```
Total AML Risk Score = 
  (0.15 × Identity Risk) +
  (0.20 × Behavioral Risk) +
  (0.25 × Transactional Risk) +
  (0.15 × Cluster/Correlation Risk) +
  (0.10 × Geopolitical Risk) +
  (0.05 × PEP Exposure) +
  (0.05 × Sanctions Exposure) +
  (0.05 × Document Authenticity Risk) +
  (0.10 × Hydra Network Risk)
```

**Result Range:** 0.00 to 1.00

---


**Example Customer:**
- Identity Risk: 0.15 (good documentation, minor inconsistencies)
- Behavioral Risk: 0.70 (Insider classification)
- Transactional Risk: 0.55 (irregular patterns)
- Cluster Risk: 0.40 (medium cluster)
- Geopolitical Risk: 0.25 (moderate jurisdiction)
- PEP Exposure: 0.00 (no PEP status)
- Sanctions Exposure: 0.00 (no sanctions exposure)
- Document Risk: 0.10 (high-quality documents)
- Network Risk: 0.45 (some complexity)

**Calculation:**
```
Total Risk = 
  (0.15 × 0.15) + 
  (0.20 × 0.70) + 
  (0.25 × 0.55) + 
  (0.15 × 0.40) + 
  (0.10 × 0.25) + 
  (0.05 × 0.00) + 
  (0.05 × 0.00) + 
  (0.05 × 0.10) + 
  (0.10 × 0.45)

Total Risk = 0.0225 + 0.14 + 0.1375 + 0.06 + 0.025 + 0 + 0 + 0.005 + 0.045
Total Risk = 0.435 (Moderate Risk)
```

---



**Characteristics:**
- Established customers with long history
- Transparent identity and operations
- Low-risk jurisdictions
- Predictable transaction patterns
- No adverse indicators
- Standard retail or institutional profiles

**Treatment:**
- Standard KYC procedures
- Annual reviews
- Standard transaction monitoring
- No enhanced due diligence required

**Monitoring Frequency:** Annual

---


**Characteristics:**
- New customers with limited history
- Moderate transaction complexity
- Some high-risk jurisdiction exposure (minor)
- Minor behavioral anomalies
- Self-employed or small business

**Treatment:**
- Standard KYC procedures
- Semi-annual reviews
- Standard transaction monitoring
- Enhanced monitoring for specific risk factors

**Monitoring Frequency:** Semi-annual

---


**Characteristics:**
- Complex ownership structures
- Irregular transaction patterns
- High-risk jurisdiction involvement
- Some adverse media (not financial crime)
- Medium cluster membership
- Cash-intensive businesses

**Treatment:**
- Enhanced KYC procedures
- Quarterly reviews
- Enhanced transaction monitoring
- Source of funds verification
- Ongoing adverse media screening

**Monitoring Frequency:** Quarterly

---


**Characteristics:**
- PEP status or close PEP connections
- Insider or Ghost actor classification
- Structuring or layering patterns
- Large cluster membership
- FATF grey list jurisdictions
- Adverse media related to financial irregularities
- Complex network structures

**Treatment:**
- Enhanced due diligence required
- Senior management approval
- Monthly reviews
- Real-time transaction monitoring
- Enhanced source of wealth verification
- Site visits (for high-value relationships)
- Continuous adverse media monitoring

**Monitoring Frequency:** Monthly

---


**Characteristics:**
- Sanctions list matches or near-matches
- Predator or Syndicate classification
- Clear money laundering patterns
- Sanctioned jurisdiction involvement
- Confirmed document fraud
- Hydra network central nodes
- Serious adverse media (financial crime, terrorism, corruption)
- Refusal to provide documentation

**Treatment:**
- Comprehensive enhanced due diligence
- Executive management approval required
- Weekly or real-time reviews
- Real-time transaction monitoring with manual review
- Potential relationship decline
- Immediate escalation to AML Officer
- Law enforcement notification (if appropriate)
- SAR filing (if appropriate)

**Monitoring Frequency:** Weekly or Real-time

---



**Update Frequency:**
- Real-time updates for transactional risk
- Daily updates for behavioral risk
- Weekly updates for cluster risk
- Monthly updates for geopolitical risk
- Immediate updates for sanctions/PEP changes
- Quarterly updates for identity/document risk

**Trigger Events for Immediate Re-scoring:**
- Sanctions list match
- PEP status change
- Significant transaction pattern change
- Adverse media hit
- Document fraud detection
- Cluster membership change
- Actor profile classification change

---


**Historical Tracking:**
- All risk score changes logged to Genesis Archive™
- Historical risk scores retained for 7 years
- Risk score trends analyzed by Cortex Memory™
- Escalation patterns identified
- De-escalation patterns validated

**Risk Evolution Analysis:**
- Identification of customers with increasing risk
- Detection of risk mitigation effectiveness
- Validation of risk model accuracy
- Identification of false positives/negatives

---



```
Customer Activity
        ↓
Data Ingestion (GDE)
        ↓
┌───────────────────────────────────────────────┐
│         Intelligence Engine Processing         │
├───────────────────────────────────────────────┤
│  Oracle Eye™ → Identity & Document Risk       │
│  Actor Profiler™ → Behavioral & PEP Risk      │
│  Hydra™ → Cluster & Network Risk              │
│  UltraFusion AI™ → Transactional Risk         │
│  Constellation Map™ → Geopolitical Risk       │
│  Cortex Memory™ → Historical Patterns         │
└───────────────────────────────────────────────┘
        ↓
Risk Score Calculation
        ↓
Risk Classification
        ↓
Treatment Assignment
        ↓
Genesis Archive™ Logging
```

---


**Oracle Eye™:**
- Document fraud detection score (0-100)
- Deepfake detection confidence
- Metadata anomaly detection
- Populates: Identity Risk, Document Risk

**Actor Profiler™:**
- Behavioral classification (Whale, Insider, Ghost, Predator, Syndicate, Retail)
- PEP identification and scoring
- Sanctions screening results
- Populates: Behavioral Risk, PEP Risk, Sanctions Risk

**Operation Hydra™:**
- Cluster detection and analysis
- Multi-head control identification
- Network complexity scoring
- Coordination pattern detection
- Populates: Cluster Risk, Network Risk

**UltraFusion AI™:**
- Transaction pattern analysis
- Anomaly detection
- Structuring and layering detection
- Velocity analysis
- Populates: Transactional Risk

**Global Constellation Map™:**
- Geographic risk assessment
- Cross-border flow analysis
- Jurisdiction risk scoring
- Regulatory arbitrage detection
- Populates: Geopolitical Risk

**Cortex Memory™:**
- Historical pattern analysis
- Risk evolution tracking
- Recidivism detection
- Long-term behavioral trends
- Supports: All risk categories with historical context

**Genesis Archive™:**
- Immutable risk score logging
- Historical risk score retention
- Audit trail for risk decisions
- Evidence preservation

---



**Minimal Risk:**
- Standard CIP/CDD
- Annual reviews
- Standard transaction monitoring
- 5-year record retention

**Low Risk:**
- Standard CIP/CDD
- Semi-annual reviews
- Standard transaction monitoring
- Enhanced monitoring for specific factors
- 5-year record retention

**Moderate Risk:**
- Enhanced CDD
- Quarterly reviews
- Enhanced transaction monitoring
- Source of funds verification
- Adverse media monitoring
- 5-year record retention

**High Risk:**
- Enhanced due diligence
- Senior management approval
- Monthly reviews
- Real-time transaction monitoring
- Source of wealth verification
- Site visits (high-value)
- Continuous adverse media monitoring
- 7-year record retention

**Critical Risk:**
- Comprehensive EDD
- Executive approval
- Weekly/real-time reviews
- Real-time monitoring with manual review
- Potential relationship decline
- AML Officer escalation
- Law enforcement notification (if appropriate)
- SAR filing (if appropriate)
- 7-year record retention

---


**Testing Frequency:**
- Quarterly testing of risk scoring model
- Annual validation of risk factor weights
- Continuous monitoring of false positive rates
- Annual independent audit of risk model

**Performance Metrics:**
- Risk score accuracy (vs. actual SAR filings)
- False positive rate (<10% target)
- False negative rate (<1% target)
- Risk score stability (minimal volatility for stable customers)
- Risk escalation lead time (early detection of emerging risks)

---



**Annual Validation Requirements:**
- Statistical validation of risk factor correlations
- Backtesting against historical SAR filings
- Sensitivity analysis of risk factor weights
- Comparison to industry benchmarks
- Independent review by qualified third party

**Validation Documentation:**
- Model validation report
- Statistical analysis results
- Backtesting results
- Sensitivity analysis
- Recommendations for improvements

---


**Change Management:**
- All model changes require AML Officer approval
- Significant changes require Board approval
- Changes documented with justification
- Impact analysis required
- Backtesting of proposed changes
- Parallel running of old and new models
- Gradual rollout with monitoring

**Change Documentation:**
- Change request and justification
- Impact analysis
- Backtesting results
- Approval records
- Implementation plan
- Post-implementation review

---



**Transparency Requirements:**
- Clear documentation of all risk factors
- Explanation of risk factor weights
- Ability to explain individual risk scores
- Documentation of engine contributions
- Audit trail of risk score changes

**Regulatory Expectations:**
- SR 11-7 (Federal Reserve model risk management)
- OCC 2011-12 (Model risk management)
- GDPR Article 22 (Right to explanation)
- FATF Recommendation 1 (Risk-based approach)

---


**Bias Monitoring:**
- Analysis of risk scores by demographic factors
- Detection of disparate impact
- Validation of risk factor objectivity
- Regular bias audits

**Mitigation Strategies:**
- Use of objective, verifiable risk factors
- Avoidance of subjective or discriminatory factors
- Regular bias testing and remediation
- Independent oversight

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial risk scoring model |

**Review Schedule:** Annually or upon significant model changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

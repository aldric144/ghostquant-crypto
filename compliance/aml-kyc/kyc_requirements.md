# KYC Requirements

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document establishes Know Your Customer (KYC) requirements for GhostQuant™ in accordance with the Bank Secrecy Act (BSA), FinCEN regulations, FATF Recommendations, and applicable international standards. These requirements apply to all customers, partners, and entities whose data is processed by GhostQuant™ intelligence engines.

---



**Regulatory Basis:** 31 CFR 1020.220 (BSA), FATF Recommendation 10

**Objective:** Verify the identity of all customers before establishing a business relationship.

**Required Information:**

**For Individuals:**
- Full legal name
- Date of birth
- Residential address (not P.O. Box)
- Government-issued identification number (SSN, passport, driver's license, national ID)
- Nationality and country of residence
- Occupation and employer
- Source of funds
- Purpose of relationship

**For Legal Entities:**
- Legal name and any DBAs (Doing Business As)
- Legal form and jurisdiction of incorporation
- Business address (principal place of business)
- Tax identification number (EIN, VAT number)
- Registration number
- Business purpose and industry
- Ownership structure
- Authorized signatories

**For Government Entities:**
- Official name and jurisdiction
- Government agency or department
- Authorized representative information
- Purpose of relationship
- Legal authority for engagement

---


**Verification Methods:**

**Documentary Verification:**
- Government-issued photo ID (passport, driver's license, national ID card)
- Utility bills or bank statements (for address verification)
- Corporate registration documents
- Articles of incorporation
- Business licenses

**Non-Documentary Verification:**
- Credit bureau checks
- Public records searches
- Third-party database verification
- Biometric verification
- Video verification (live video call)

**Verification Standards:**
- Documents must be current (issued within last 3 months for address verification)
- Photos must be clear and legible
- Documents must not be expired
- Information must be consistent across documents
- Verification must be completed before account activation

**Oracle Eye™ Integration:**
- Automated document fraud detection
- Deepfake detection for biometric verification
- Metadata analysis for document authenticity
- Template matching against known fraudulent documents
- Real-time verification scoring

---


**Required Documents:**

**Individual Customers:**
1. **Primary ID:** Government-issued photo ID (passport, driver's license, national ID)
2. **Proof of Address:** Utility bill, bank statement, or government correspondence (dated within 3 months)
3. **Selfie:** Live photo for biometric comparison
4. **Source of Funds:** Employment letter, tax returns, bank statements, or business ownership documentation

**Corporate Customers:**
1. **Certificate of Incorporation:** Certified copy from jurisdiction of incorporation
2. **Articles of Association/Bylaws:** Current version
3. **Business License:** Current business license or registration
4. **Proof of Business Address:** Utility bill or lease agreement
5. **Beneficial Ownership:** Identification of all beneficial owners (≥25% ownership)
6. **Authorized Signatories:** List of authorized representatives with ID verification
7. **Financial Statements:** Recent audited financial statements (if available)
8. **Source of Funds:** Business bank statements, contracts, or revenue documentation

**High-Risk Customers (Enhanced Due Diligence):**
- Additional documentation as required by risk assessment
- Enhanced verification of source of funds
- Enhanced verification of source of wealth
- Third-party references
- Site visits (for high-value relationships)

**Document Retention:**
- All KYC documents retained for 5 years after relationship termination
- Documents stored in encrypted format
- Access restricted to authorized compliance personnel
- Audit trail maintained for all document access

---


**Liveness Detection:**
- Real-time video verification
- Challenge-response protocols (blink, turn head, smile)
- Depth detection to prevent photo spoofing
- Motion analysis to detect video replay attacks

**Facial Recognition:**
- Comparison of selfie to government-issued ID photo
- Minimum similarity threshold: 85%
- Manual review for scores between 75-85%
- Automatic rejection for scores below 75%

**Oracle Eye™ Deepfake Detection:**
- Analysis of facial micro-expressions
- Detection of synthetic image artifacts
- Metadata analysis for manipulation indicators
- Neural network-based deepfake detection
- Confidence score ≥90% required for automated approval

**Biometric Data Protection:**
- Encrypted storage of biometric templates
- Deletion of raw biometric data after template extraction
- Access restricted to authorized systems
- Compliance with GDPR, BIPA, and other biometric privacy laws

---


**Acceptable Proof of Address:**
- Utility bills (electricity, gas, water, internet)
- Bank or credit card statements
- Government correspondence (tax notices, social security)
- Lease or mortgage agreements
- Employer letters (on company letterhead)

**Verification Requirements:**
- Document dated within last 3 months
- Must show full name and residential address
- Must be from reputable source
- Cannot be P.O. Box (unless verified business address)

**Enhanced Address Verification:**
- Geolocation verification (for digital onboarding)
- Postal code validation
- Address standardization and formatting
- Cross-reference with public records
- Third-party address verification services

**High-Risk Jurisdictions:**
- Enhanced verification for addresses in FATF high-risk jurisdictions
- Additional documentation required
- Enhanced ongoing monitoring
- Escalation to AML Officer for approval

---


**Screening Lists:**
- OFAC Specially Designated Nationals (SDN) List
- OFAC Consolidated Sanctions List
- UN Security Council Sanctions List
- EU Consolidated Sanctions List
- UK HM Treasury Sanctions List
- Country-specific sanctions lists

**Screening Frequency:**
- Initial screening at onboarding
- Real-time screening for all transactions
- Daily batch screening of entire customer base
- Immediate screening upon sanctions list updates

**Screening Methodology:**
- Fuzzy matching algorithms (Levenshtein distance)
- Phonetic matching (Soundex, Metaphone)
- Alias and AKA matching
- Date of birth matching
- Address and nationality matching
- Minimum match threshold: 85%

**Match Resolution:**
- Automated clearing for low-confidence matches (<70%)
- Manual review for medium-confidence matches (70-90%)
- Escalation to AML Officer for high-confidence matches (>90%)
- Documentation of all match decisions
- Blocked transactions for confirmed matches

**Actor Profiler™ Integration:**
- Cross-reference with known bad actor profiles
- Network analysis for indirect sanctions exposure
- Behavioral analysis for sanctions evasion patterns
- Risk scoring based on sanctions proximity

---


**PEP Definition:**

**Domestic PEPs:**
- Senior government officials
- Senior political party officials
- Senior executives of state-owned enterprises
- Senior judicial or military officials
- Immediate family members and close associates

**Foreign PEPs:**
- Heads of state or government
- Senior politicians
- Senior government, judicial, or military officials
- Senior executives of state-owned corporations
- Immediate family members and close associates

**International Organization PEPs:**
- Senior management of international organizations (UN, IMF, World Bank, etc.)
- Board members and equivalent positions

**PEP Screening Sources:**
- Commercial PEP databases (World-Check, Dow Jones, LexisNexis)
- Government PEP lists
- Media and public records
- Adverse media screening

**PEP Risk Classification:**
- **High Risk:** Current foreign PEPs, sanctioned PEPs
- **Medium Risk:** Former foreign PEPs (within 12 months), current domestic PEPs
- **Low Risk:** Former domestic PEPs (>12 months), family members of low-risk PEPs

**Enhanced Due Diligence for PEPs:**
- Senior management approval required
- Enhanced source of wealth verification
- Enhanced source of funds verification
- Ongoing monitoring (monthly reviews)
- Adverse media monitoring
- Enhanced transaction monitoring

**Hydra™ Integration:**
- Network analysis for PEP connections
- Identification of PEP family members and associates
- Detection of hidden PEP relationships
- Risk propagation through PEP networks

---


**Monitoring Frequency:**

**Low Risk:** Annual review
**Medium Risk:** Semi-annual review
**High Risk:** Quarterly review
**Critical Risk:** Monthly review

**Monitoring Activities:**
- Transaction pattern analysis
- Behavioral change detection
- Adverse media screening
- Sanctions list re-screening
- PEP status verification
- Source of funds verification
- Address and contact information updates

**Trigger Events for Enhanced Monitoring:**
- Significant increase in transaction volume
- Change in transaction patterns
- Adverse media hits
- Sanctions list matches
- PEP status changes
- High-risk jurisdiction involvement
- Unusual network connections

**UltraFusion AI™ Integration:**
- Continuous risk scoring
- Anomaly detection
- Behavioral pattern analysis
- Predictive risk modeling
- Automated alert generation

**Cortex Memory™ Integration:**
- Historical pattern analysis
- Long-term behavioral trends
- Recidivism detection
- Dormancy analysis

---


**EDD Triggers:**
- High-risk customers (PEPs, high-net-worth individuals)
- High-risk jurisdictions (FATF blacklist/greylist)
- High-risk business types (MSBs, casinos, precious metals dealers)
- Unusual or suspicious activity
- Adverse media or negative news
- Complex ownership structures
- Cash-intensive businesses

**EDD Requirements:**
- Senior management approval
- Enhanced source of wealth verification
- Enhanced source of funds verification
- Purpose of relationship documentation
- Expected transaction patterns
- Third-party references
- Site visits (for high-value relationships)
- Enhanced ongoing monitoring
- More frequent reviews

**Source of Wealth Verification:**
- Employment history and income
- Business ownership and profits
- Inheritance or gifts
- Investments and capital gains
- Real estate holdings
- Supporting documentation required

**Source of Funds Verification:**
- Bank statements
- Tax returns
- Employment contracts
- Business financial statements
- Investment account statements
- Real estate transaction records

---



**Low Risk (Score: 0.00 - 0.20):**
- Established customers with long history
- Transparent ownership and operations
- Low-risk jurisdictions
- Predictable transaction patterns
- No adverse media or sanctions concerns
- Regular employment or business income

**Medium Risk (Score: 0.20 - 0.40):**
- New customers with limited history
- Moderate transaction complexity
- Some high-risk jurisdiction exposure
- Minor adverse media (not related to financial crime)
- Self-employed or small business owners

**High Risk (Score: 0.40 - 0.60):**
- Complex ownership structures
- High-risk jurisdiction involvement
- Cash-intensive businesses
- PEPs or PEP associates
- Adverse media related to financial irregularities
- Unusual transaction patterns

**Critical Risk (Score: 0.60 - 1.00):**
- Sanctions list matches or near-matches
- Serious adverse media (financial crime, terrorism, corruption)
- Refusal to provide documentation
- Inconsistent or suspicious information
- Known association with criminal entities
- Structuring or layering patterns

---


**Risk Score Calculation:**

```
Total KYC Risk Score = 
  (0.20 × Identity Risk) +
  (0.15 × Geographic Risk) +
  (0.15 × Business Risk) +
  (0.15 × Ownership Risk) +
  (0.10 × PEP/Sanctions Risk) +
  (0.10 × Adverse Media Risk) +
  (0.10 × Document Quality Risk) +
  (0.05 × Relationship Risk)
```

**Risk Factors:**

**Identity Risk:**
- Quality of identification documents
- Verification method used
- Consistency of information
- Oracle Eye™ fraud detection score

**Geographic Risk:**
- Customer jurisdiction risk
- Transaction jurisdiction risk
- FATF risk ratings
- Corruption perception index
- Sanctions exposure

**Business Risk:**
- Industry risk rating
- Business model complexity
- Cash intensity
- Regulatory oversight

**Ownership Risk:**
- Ownership transparency
- Beneficial ownership complexity
- Shell company indicators
- Nominee director usage

**PEP/Sanctions Risk:**
- PEP status and level
- Sanctions proximity
- Government connections
- Political exposure

**Adverse Media Risk:**
- Financial crime allegations
- Corruption allegations
- Terrorism or extremism links
- Fraud or embezzlement

**Document Quality Risk:**
- Document authenticity
- Completeness of documentation
- Timeliness of documentation
- Oracle Eye™ verification score

**Relationship Risk:**
- Length of relationship
- Transaction history
- Compliance history
- Responsiveness to requests

---


**Low Risk:**
- Automated approval
- Standard monitoring
- Annual review

**Medium Risk:**
- Compliance analyst review
- Enhanced monitoring
- Semi-annual review

**High Risk:**
- AML Officer approval
- Enhanced due diligence
- Quarterly review
- Enhanced transaction monitoring

**Critical Risk:**
- Senior management approval
- Comprehensive enhanced due diligence
- Monthly review
- Real-time transaction monitoring
- Potential relationship decline

---


**Retention Periods:**
- Customer identification records: 5 years after relationship termination
- Transaction records: 5 years after transaction date
- SAR supporting documentation: 5 years after SAR filing
- Correspondence: 5 years after date
- Risk assessments: 5 years after superseded
- Training records: 5 years after completion

**Storage Requirements:**
- Encrypted storage (AES-256)
- Access controls and audit logging
- Backup and disaster recovery
- Compliance with data localization requirements
- Genesis Archive™ immutable storage for critical records

---



**Capabilities:**
- Automated document verification
- Forgery detection
- Deepfake detection
- Metadata analysis
- Template matching

**Integration:**
- Real-time document verification during onboarding
- Automated fraud scoring
- Alert generation for suspicious documents
- Evidence preservation in Genesis Archive™

**Workflow:**
1. Customer uploads identity documents
2. Oracle Eye™ analyzes documents for fraud indicators
3. Fraud score calculated (0-100)
4. Scores <70: Automatic rejection
5. Scores 70-85: Manual review
6. Scores >85: Automatic approval
7. All results logged to Genesis Archive™

---


**Capabilities:**
- Detection of multiple identities controlled by single entity
- Identification of identity theft rings
- Detection of synthetic identity fraud
- Network analysis of related identities

**Integration:**
- Cross-reference new customers against existing clusters
- Identify suspicious identity patterns
- Detect coordinated identity fraud
- Alert generation for cluster anomalies

**Workflow:**
1. New customer identity information collected
2. Hydra™ analyzes for cluster membership
3. Identifies related identities and accounts
4. Calculates cluster risk score
5. Alerts generated for high-risk clusters
6. Investigation triggered for suspicious patterns

---


**Capabilities:**
- Behavioral classification of customers
- Insider threat detection
- Ghost address identification
- Syndicate network detection
- Risk-based customer profiling

**Integration:**
- Continuous behavioral monitoring
- Risk profile updates based on activity
- Alert generation for profile changes
- Enhanced due diligence triggers

**Workflow:**
1. Customer activity monitored continuously
2. Actor Profiler™ classifies behavioral patterns
3. Risk profile updated in real-time
4. Alerts generated for high-risk classifications
5. Enhanced monitoring triggered for Insider/Ghost/Syndicate profiles
6. Investigation and potential SAR filing

---


**Capabilities:**
- Multi-source intelligence fusion
- Holistic risk scoring
- Anomaly detection
- Predictive risk modeling

**Integration:**
- Aggregates data from all intelligence engines
- Provides unified customer risk score
- Identifies emerging risks
- Prioritizes high-risk customers for review

**Workflow:**
1. UltraFusion AI™ collects data from all engines
2. Calculates comprehensive risk score
3. Identifies anomalies and deviations
4. Generates prioritized alert queue
5. Triggers enhanced due diligence as needed
6. Updates risk profile continuously

---


**Capabilities:**
- Tamper-proof audit trail
- Cryptographic chaining
- Evidence preservation
- Regulatory reporting support

**Integration:**
- All KYC activities logged immutably
- Document storage with integrity verification
- Audit trail for regulatory examinations
- Evidence for investigations and SARs

**Workflow:**
1. All KYC activities logged to Genesis Archive™
2. Cryptographic hash generated for each record
3. Records chained for tamper detection
4. Daily integrity verification
5. Evidence retrieval for investigations
6. Regulatory reporting and examination support

---


**Capabilities:**
- Historical pattern analysis
- Long-term behavioral trends
- Recidivism detection
- Dormancy analysis

**Integration:**
- Tracks customer behavior over time
- Identifies long-term risk trends
- Detects dormant account reactivation
- Supports ongoing monitoring

**Workflow:**
1. Customer activity tracked over time
2. Cortex Memory™ identifies long-term patterns
3. Detects significant behavioral changes
4. Alerts generated for anomalous trends
5. Enhanced monitoring triggered as needed
6. Historical context provided for investigations

---



```
Customer Application
        ↓
Identity Information Collection
        ↓
Document Upload
        ↓
Oracle Eye™ Document Verification
        ↓
Biometric Verification
        ↓
Address Verification
        ↓
Sanctions Screening
        ↓
PEP Screening
        ↓
Risk Scoring (UltraFusion AI™)
        ↓
Risk-Based Approval
        ↓
Account Activation
        ↓
Genesis Archive™ Logging
```

---


```
Continuous Transaction Monitoring
        ↓
Behavioral Analysis (Actor Profiler™)
        ↓
Cluster Analysis (Hydra™)
        ↓
Risk Score Updates (UltraFusion AI™)
        ↓
Periodic Reviews (Risk-Based)
        ↓
Enhanced Due Diligence (If Triggered)
        ↓
Investigation (If Required)
        ↓
SAR Filing (If Appropriate)
        ↓
Genesis Archive™ Logging
```

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial KYC requirements |

**Review Schedule:** Annually or upon regulatory changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

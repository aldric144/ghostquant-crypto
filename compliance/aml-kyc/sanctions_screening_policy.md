# Sanctions Screening Policy

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This policy establishes sanctions screening procedures for GhostQuant™ to ensure compliance with U.S. Office of Foreign Assets Control (OFAC) regulations, United Nations Security Council sanctions, European Union sanctions, and other applicable sanctions programs.

**Regulatory Basis:** 31 CFR Chapter V (OFAC), UN Security Council Resolutions, EU Council Regulations

---



**Primary Lists:**
- **SDN List (Specially Designated Nationals):** Individuals and entities whose assets are blocked and with whom U.S. persons are prohibited from dealing
- **Consolidated Sanctions List:** Comprehensive list of all OFAC sanctions programs
- **Sectoral Sanctions Identifications (SSI) List:** Entities subject to sectoral sanctions
- **Foreign Sanctions Evaders (FSE) List:** Individuals and entities that have violated U.S. sanctions
- **Non-SDN Lists:** Various program-specific lists

**Country-Based Programs:**
- Cuba
- Iran
- North Korea
- Syria
- Crimea region of Ukraine
- Donetsk and Luhansk regions of Ukraine
- Russia (sectoral sanctions)
- Venezuela (targeted sanctions)

**Thematic Programs:**
- Counter-terrorism
- Counter-narcotics
- Cyber-related sanctions
- Human rights abuses
- Corruption
- Weapons proliferation

---


**Active Programs:**
- Al-Qaida and ISIL (Da'esh)
- Taliban
- North Korea (DPRK)
- Iran
- Libya
- Somalia/Eritrea
- South Sudan
- Sudan (Darfur)
- Yemen
- Central African Republic
- Democratic Republic of the Congo
- Iraq
- Lebanon
- Mali

---


**Major Programs:**
- Russia (comprehensive sanctions)
- Belarus
- Iran
- North Korea
- Syria
- Venezuela
- Myanmar
- Zimbabwe
- Various counter-terrorism listings

---


**UK HM Treasury Sanctions:**
- Largely aligned with UN and former EU sanctions
- Additional UK-specific designations

**Other Relevant Sanctions:**
- Canada (Special Economic Measures Act)
- Australia (Autonomous Sanctions)
- Japan (Foreign Exchange and Foreign Trade Act)

---



**Initial Screening:**
- All customers screened at onboarding
- All entities screened before first transaction
- All counterparties screened before transaction
- All beneficial owners screened

**Ongoing Screening:**
- Daily batch screening of entire customer base
- Real-time screening for all transactions
- Immediate screening upon sanctions list updates
- Re-screening after customer information updates

**List Update Frequency:**
- OFAC lists: Real-time monitoring, updates within 1 hour
- UN lists: Daily monitoring, updates within 4 hours
- EU lists: Daily monitoring, updates within 4 hours
- Other lists: Weekly monitoring, updates within 24 hours

---


**Entities to Screen:**
- Individual customers
- Corporate customers
- Beneficial owners (≥25% ownership)
- Authorized signatories
- Transaction counterparties
- Intermediate addresses in transaction chains
- Service providers
- Vendors and partners

**Information to Screen:**
- Full legal name
- All known aliases and AKAs
- Date of birth (individuals)
- Place of birth (individuals)
- Nationality
- Passport numbers
- National ID numbers
- Tax ID numbers (EIN, VAT)
- Addresses (all known)
- Vessel names and IMO numbers (if applicable)
- Aircraft tail numbers (if applicable)

---



**Fuzzy Matching:**
- Levenshtein distance algorithm
- Minimum similarity threshold: 85%
- Adjustable sensitivity based on name length
- Handles typos and misspellings

**Phonetic Matching:**
- Soundex algorithm
- Metaphone algorithm
- Handles pronunciation variations
- Useful for transliterated names

**Alias Matching:**
- All known aliases and AKAs checked
- Maiden names
- Former names
- Nicknames
- Business names and DBAs

**Date of Birth Matching:**
- Exact match (if available)
- Partial match (year only, if full DOB unavailable)
- Age range matching (±2 years)

**Address Matching:**
- Country matching (mandatory)
- City matching (if available)
- Full address matching (if available)
- Geographic proximity matching

**Nationality Matching:**
- Primary nationality
- Dual/multiple nationalities
- Former nationalities

---


**Scoring Factors:**
- Name similarity (0-100 points)
- Date of birth match (0-20 points)
- Address match (0-20 points)
- Nationality match (0-10 points)
- ID number match (0-50 points, if available)

**Total Match Score:** 0-200 points

**Match Confidence Levels:**
- **High Confidence (>180 points):** Likely true match
- **Medium Confidence (140-180 points):** Possible match, requires review
- **Low Confidence (100-140 points):** Weak match, likely false positive
- **No Match (<100 points):** Not a match

---


**Strategies:**
- Use of additional identifiers (DOB, address, nationality)
- Whitelist for confirmed false positives
- Enhanced matching algorithms
- Manual review of medium-confidence matches
- Documentation of false positive determinations

**Whitelist Management:**
- Documented justification required
- Annual review of whitelist entries
- Removal if circumstances change
- Audit trail of whitelist decisions

---



**Criteria for Automated Clearing:**
- Match score <100 points
- No additional risk factors
- Confirmed false positive (on whitelist)

**Process:**
- Automated clearing within seconds
- Transaction proceeds without delay
- Clearing logged to Genesis Archive™

---


**Criteria for Manual Review:**
- Match score 100-180 points
- Medium confidence matches
- Conflicting information
- Unusual circumstances

**Review Process:**
1. Analyst reviews match details
2. Compares all available information
3. Researches additional sources
4. Makes determination (true match or false positive)
5. Documents decision rationale
6. Escalates to AML Officer if uncertain

**Review SLA:**
- High-priority transactions: 1 hour
- Standard transactions: 4 hours
- Low-priority transactions: 24 hours

---


**Criteria for Escalation:**
- Match score >180 points
- High confidence matches
- Conflicting information requiring senior judgment
- Novel or complex situations
- Potential sanctions violations

**AML Officer Actions:**
- Reviews all evidence
- Conducts additional research
- Makes final determination
- Approves blocking (if required)
- Notifies OFAC (if required)
- Documents decision

---



**When to Block:**
- Confirmed match to SDN List
- Confirmed match to blocked persons list
- 50% or greater ownership by blocked person
- Acting on behalf of blocked person
- Transactions involving blocked jurisdictions

**Blocking Actions:**
- Immediate transaction interdiction
- Account freeze
- Asset blocking
- Notification to customer (if permitted)
- OFAC reporting (within 10 days)

---


**When to Reject:**
- High-confidence match, unable to confirm or deny
- Insufficient information to clear match
- Customer refuses to provide clarifying information
- Risk-based decision to decline relationship

**Rejection Actions:**
- Transaction declined
- Relationship declined (if onboarding)
- Notification to customer
- Documentation of decision
- No OFAC reporting required (unless confirmed match)

---


**Reporting Requirements:**
- Blocked transactions reported within 10 days
- Annual report of blocked property
- Voluntary self-disclosure of violations

**Reporting Method:**
- OFAC online reporting system
- Email: ofac.report@treasury.gov
- Fax: 202-622-1657

**Required Information:**
- Entity name and identifying information
- Sanctions program
- Transaction details
- Blocking date
- Asset value
- Supporting documentation

---



**Capabilities:**
- Real-time sanctions screening
- Fuzzy and phonetic matching
- Alias and AKA matching
- Historical sanctions screening
- Sanctions proximity analysis

**Workflow:**
1. Entity information sent to Actor Profiler™
2. Screening against all sanctions lists
3. Match scoring and confidence calculation
4. Alert generation for matches
5. Results logged to Genesis Archive™

---


**Capabilities:**
- Network analysis for indirect sanctions exposure
- Identification of entities controlled by sanctioned persons
- Detection of sanctions evasion networks
- 50% rule analysis (ownership by sanctioned persons)

**Workflow:**
1. Network analysis identifies relationships
2. Sanctions exposure propagated through network
3. Indirect sanctions exposure calculated
4. Alerts generated for high-risk connections
5. Enhanced due diligence triggered

---


**Capabilities:**
- Historical sanctions screening results
- Tracking of sanctions status changes
- Identification of entities previously sanctioned
- Pattern analysis for sanctions evasion

**Workflow:**
1. Historical sanctions data retrieved
2. Changes in sanctions status identified
3. Patterns analyzed for evasion indicators
4. Alerts generated for concerning patterns
5. Enhanced monitoring triggered

---


**Capabilities:**
- Immutable logging of all screening results
- Audit trail for regulatory examinations
- Evidence preservation for investigations
- Historical screening data retention

**Workflow:**
1. All screening results logged immutably
2. Match decisions documented
3. Evidence preserved
4. Audit trail maintained
5. Regulatory reporting supported

---



**Common Techniques:**
- Use of aliases and false identities
- Shell companies and nominees
- Complex ownership structures
- Transshipment through third countries
- Use of intermediaries
- Cryptocurrency obfuscation
- Trade-based money laundering

**Detection Methods:**
- Network analysis (Hydra™)
- Behavioral analysis (Actor Profiler™)
- Geographic analysis (Constellation Map™)
- Pattern recognition (UltraFusion AI™)

---


**Identity Red Flags:**
- Refusal to provide identification
- Inconsistent identity information
- Use of aliases
- Frequent name changes
- Shell company structures

**Transaction Red Flags:**
- Transactions involving sanctioned jurisdictions
- Use of intermediaries in third countries
- Complex transaction structures
- Unusual routing of transactions
- Trade transactions with inflated values

**Network Red Flags:**
- Connections to sanctioned entities
- Use of cutouts and intermediaries
- Complex ownership structures
- Nested service providers

---



**All Personnel:**
- Annual sanctions compliance training
- Understanding of sanctions programs
- Screening procedures
- Escalation procedures

**Compliance Personnel:**
- Comprehensive sanctions training
- OFAC regulations and guidance
- Screening technology training
- Investigation techniques

**Senior Management:**
- Sanctions compliance overview
- Regulatory expectations
- Enforcement actions and penalties
- Risk management

---


**Topics:**
- Overview of sanctions programs
- OFAC, UN, EU sanctions
- Screening requirements and procedures
- Match resolution
- Blocking and rejection
- OFAC reporting
- Sanctions evasion techniques
- Red flags and indicators
- Case studies

---



**Screening Metrics:**
- Total screenings performed
- Match rate (by confidence level)
- False positive rate
- True positive rate
- Average resolution time
- Escalation rate

**Blocking Metrics:**
- Number of blocked transactions
- Value of blocked assets
- OFAC reports filed
- Blocking accuracy

**Quality Metrics:**
- Screening accuracy
- Match resolution accuracy
- Documentation quality
- Timeliness of actions

---


**QA Activities:**
- Monthly sample review of screening results
- Quarterly review of match resolutions
- Annual review of blocked transactions
- Independent testing of screening system

**QA Metrics:**
- Screening accuracy rate (>99% target)
- Match resolution accuracy (>95% target)
- False positive rate (<5% target)
- False negative rate (<0.1% target)

---



**Required Documentation:**
- Sanctions screening policy
- Screening procedures
- List of sanctions programs screened
- Screening system documentation
- Match resolution procedures
- Blocking procedures
- OFAC reporting procedures
- Training materials and records

---


**Screening Evidence:**
- Screening logs from Genesis Archive™
- Match resolution documentation
- Whitelist documentation
- Escalation records
- Blocking records
- OFAC reports

**Testing Evidence:**
- Quality assurance reports
- Independent testing results
- System validation results
- Performance metrics

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial sanctions screening policy |

**Review Schedule:** Annually or upon regulatory changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

# PEP Screening Policy

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This policy establishes Politically Exposed Person (PEP) screening procedures for GhostQuant™ in accordance with FATF Recommendation 12 and applicable regulatory requirements. PEPs present heightened money laundering and corruption risks due to their positions of influence and access to public funds.

**Regulatory Basis:** FATF Recommendation 12, FinCEN Guidance, EU AMLD4/5/6

---



**Definition:** Individuals who are or have been entrusted with prominent public functions in a foreign country.

**Categories:**
- Heads of state or government
- Senior politicians (ministers, deputy ministers)
- Senior government officials (permanent secretaries, directors)
- Senior judicial officials (supreme court judges, constitutional court judges)
- Senior military officials (generals, admirals)
- Senior executives of state-owned enterprises
- Senior political party officials

**Risk Level:** High (current), Medium (former, >12 months)

---


**Definition:** Individuals who are or have been entrusted with prominent public functions in the United States.

**Categories:**
- Senior elected officials (governors, senators, representatives)
- Senior appointed officials (cabinet secretaries, agency heads)
- Senior judicial officials (federal judges, state supreme court judges)
- Senior military officials (generals, admirals)
- Senior executives of government-sponsored enterprises
- Senior political party officials

**Risk Level:** Medium (current), Low (former, >12 months)

---


**Definition:** Individuals who are or have been entrusted with prominent functions in an international organization.

**Organizations:**
- United Nations and specialized agencies
- International Monetary Fund (IMF)
- World Bank Group
- Regional development banks (ADB, AfDB, EBRD, IDB)
- European Union institutions
- NATO
- OECD
- Other intergovernmental organizations

**Positions:**
- Directors, deputy directors, board members
- Senior management (equivalent to assistant secretary-general or higher)

**Risk Level:** Medium (current), Low (former, >12 months)

---


**Definition:** Immediate family members of PEPs.

**Included Relationships:**
- Spouse or domestic partner
- Children and their spouses
- Parents
- Siblings and their spouses

**Risk Level:** Same as associated PEP, reduced by one level

---


**Definition:** Individuals known to have close business or personal relationships with PEPs.

**Indicators:**
- Joint beneficial ownership of legal entities or arrangements
- Close business relationships (partnerships, joint ventures)
- Sole beneficial ownership of entities known to be for the benefit of the PEP
- Close personal relationships (known to be in close social contact)

**Risk Level:** Same as associated PEP, reduced by one level

---



**Critical Risk (Score: 0.90-1.00):**
- Current foreign head of state or government
- Current foreign defense or intelligence minister
- Sanctioned PEPs
- PEPs from high-risk jurisdictions (FATF blacklist)
- PEPs with corruption allegations

**High Risk (Score: 0.70-0.89):**
- Current foreign PEPs (other senior positions)
- Former foreign heads of state (<12 months)
- Current domestic PEPs (senior positions)
- PEPs from medium-risk jurisdictions (FATF greylist)
- PEPs with adverse media (financial irregularities)

**Medium Risk (Score: 0.40-0.69):**
- Former foreign PEPs (>12 months)
- Current domestic PEPs (mid-level positions)
- Current international organization PEPs
- PEP family members (high-risk PEPs)
- PEP close associates (high-risk PEPs)

**Low Risk (Score: 0.20-0.39):**
- Former domestic PEPs (>12 months)
- Former international organization PEPs (>12 months)
- PEP family members (medium-risk PEPs)
- PEP close associates (medium-risk PEPs)

---


**Position-Based Factors:**
- Level of position (head of state > minister > director)
- Access to public funds
- Influence over government decisions
- Control over law enforcement or military
- Regulatory authority

**Jurisdiction-Based Factors:**
- Corruption perception index
- FATF risk rating
- Sanctions status
- Rule of law indicators
- Press freedom index

**Individual-Based Factors:**
- Adverse media coverage
- Corruption allegations
- Asset declarations (transparency)
- Known associates
- Business interests

**Temporal Factors:**
- Current vs. former position
- Time since leaving position
- Continued influence or connections

---



**Initial Screening:**
- All customers at onboarding
- All beneficial owners
- All authorized signatories
- All transaction counterparties (high-value)

**Ongoing Screening:**
- Monthly screening of all customers
- Real-time screening for high-risk customers
- Immediate screening upon PEP database updates
- Re-screening after customer information updates

**Database Update Frequency:**
- Commercial PEP databases: Daily updates
- Government PEP lists: Weekly monitoring
- Adverse media: Daily monitoring

---


**Commercial Databases:**
- World-Check (Refinitiv)
- Dow Jones Risk & Compliance
- LexisNexis Bridger Insight
- Accuity
- ComplyAdvantage

**Government Sources:**
- U.S. State Department
- Foreign government websites
- International organization websites
- Parliamentary and congressional records

**Media Sources:**
- International news agencies
- Local news sources
- Investigative journalism
- Leaked documents (Panama Papers, Pandora Papers, etc.)

---


**Name Matching:**
- Fuzzy matching (Levenshtein distance)
- Phonetic matching (Soundex, Metaphone)
- Transliteration variations
- Alias and AKA matching
- Maiden names and former names

**Position Matching:**
- Current position verification
- Former position identification
- Position level assessment
- Jurisdiction identification

**Relationship Matching:**
- Family member identification
- Close associate identification
- Business relationship mapping
- Network analysis (Hydra™)

---



**Mandatory EDD for:**
- All foreign PEPs (current and former <12 months)
- High-risk domestic PEPs
- PEPs from high-risk jurisdictions
- PEPs with adverse media
- PEP family members and close associates (high-risk)

**EDD Components:**
- Senior management approval
- Enhanced source of wealth verification
- Enhanced source of funds verification
- Purpose of relationship documentation
- Expected transaction patterns
- Ongoing enhanced monitoring
- More frequent reviews

---


**Required Documentation:**
- Employment history and salary information
- Business ownership documentation
- Investment portfolio statements
- Real estate holdings
- Inheritance or gift documentation
- Asset declarations (if publicly available)
- Tax returns (if available)

**Verification Methods:**
- Public records searches
- Asset declaration reviews
- Media research
- Third-party references
- Independent wealth verification services

**Red Flags:**
- Wealth inconsistent with known income
- Unexplained wealth accumulation
- Assets in family members' names
- Complex ownership structures
- Offshore holdings in secrecy jurisdictions

---


**Required Documentation:**
- Bank statements (6-12 months)
- Employment contracts and pay stubs
- Business financial statements
- Investment account statements
- Sale of assets documentation
- Loan documentation

**Verification Methods:**
- Bank reference letters
- Employer verification
- Accountant verification
- Independent financial analysis

**Red Flags:**
- Funds from unknown sources
- Cash-intensive sources
- Funds from high-risk jurisdictions
- Funds from shell companies
- Inconsistent explanations

---


**Monitoring Frequency:**
- Critical Risk PEPs: Weekly reviews
- High Risk PEPs: Monthly reviews
- Medium Risk PEPs: Quarterly reviews
- Low Risk PEPs: Semi-annual reviews

**Monitoring Activities:**
- Transaction pattern analysis
- Adverse media monitoring
- PEP status verification
- Source of funds re-verification
- Network analysis (new connections)
- Sanctions screening
- Behavioral analysis (Actor Profiler™)

**Trigger Events for Enhanced Monitoring:**
- Significant transaction pattern changes
- New adverse media
- Change in PEP status
- New high-risk connections
- Unexplained wealth increase
- Involvement in high-risk jurisdictions

---



**Capabilities:**
- Automated PEP identification
- PEP risk scoring
- Behavioral classification
- Adverse media monitoring
- Historical PEP tracking

**Workflow:**
1. Customer information sent to Actor Profiler™
2. PEP screening against multiple databases
3. Risk score calculation
4. Alert generation for PEP matches
5. Enhanced due diligence triggered
6. Results logged to Genesis Archive™

---


**Capabilities:**
- PEP family member identification
- PEP close associate identification
- Network analysis for hidden PEP connections
- Risk propagation through PEP networks
- Multi-head control detection (PEP-controlled entities)

**Workflow:**
1. Network analysis identifies relationships
2. PEP connections mapped
3. Family members and close associates identified
4. Risk propagated through network
5. Alerts generated for PEP connections
6. Enhanced due diligence triggered

---


**Capabilities:**
- Geographic analysis of PEP transactions
- Cross-border flow analysis
- High-risk jurisdiction identification
- Corruption corridor detection

**Workflow:**
1. PEP transaction flows analyzed geographically
2. High-risk jurisdictions identified
3. Unusual cross-border patterns detected
4. Alerts generated for concerning patterns
5. Enhanced investigation triggered

---


**Capabilities:**
- Historical PEP status tracking
- Long-term behavioral pattern analysis
- PEP status change detection
- Recidivism detection

**Workflow:**
1. Historical PEP data retrieved
2. Status changes tracked over time
3. Behavioral patterns analyzed
4. Alerts generated for concerning trends
5. Enhanced monitoring triggered

---


**Capabilities:**
- Immutable logging of PEP screening results
- EDD documentation storage
- Audit trail for regulatory examinations
- Evidence preservation

**Workflow:**
1. All PEP screening results logged
2. EDD documentation stored
3. Approval records maintained
4. Audit trail preserved
5. Regulatory reporting supported

---



**Critical Risk PEPs:**
- Chief Executive Officer approval required
- AML Officer recommendation
- Board notification

**High Risk PEPs:**
- Chief Compliance Officer approval required
- AML Officer recommendation
- Senior management notification

**Medium Risk PEPs:**
- AML Officer approval required
- Compliance Manager recommendation

**Low Risk PEPs:**
- Compliance Manager approval required
- AML Analyst recommendation

---


**Required Documentation:**
- PEP screening results
- Risk assessment
- Source of wealth verification
- Source of funds verification
- Purpose of relationship
- Expected transaction patterns
- Enhanced monitoring plan
- Approval signatures
- Board notification (if applicable)

---


**Decline Criteria:**
- Unable to verify source of wealth
- Unable to verify source of funds
- Serious corruption allegations
- Sanctioned PEP
- Unacceptable risk level
- Refusal to provide information

**Decline Process:**
1. AML Officer recommendation
2. Senior management approval
3. Customer notification
4. Documentation of decision
5. Relationship termination (if existing)

---



**Topics:**
- Corruption allegations
- Bribery
- Embezzlement
- Money laundering
- Fraud
- Organized crime
- Human rights abuses
- Sanctions violations

**Sources:**
- International news agencies
- Local news sources
- Investigative journalism
- NGO reports
- Government reports
- Leaked documents

---


**Critical Risk PEPs:** Daily monitoring
**High Risk PEPs:** Weekly monitoring
**Medium Risk PEPs:** Monthly monitoring
**Low Risk PEPs:** Quarterly monitoring

---


**Response Process:**
1. Adverse media alert generated
2. Relevance assessment
3. Severity assessment
4. Enhanced investigation
5. Risk score update
6. Enhanced monitoring
7. Potential relationship termination
8. SAR filing (if appropriate)

---



**All Personnel:**
- Annual PEP awareness training
- Understanding of PEP risks
- Identification of PEPs
- Escalation procedures

**Compliance Personnel:**
- Comprehensive PEP training
- EDD procedures
- Source of wealth verification
- Adverse media analysis
- Investigation techniques

**Senior Management:**
- PEP risk overview
- Approval responsibilities
- Regulatory expectations
- Reputational risk

---


**Topics:**
- PEP definitions and categories
- PEP risk factors
- Screening procedures
- EDD requirements
- Source of wealth/funds verification
- Adverse media monitoring
- Red flags and indicators
- Case studies
- Regulatory expectations

---



**Screening Metrics:**
- Total PEP screenings performed
- PEP match rate
- False positive rate
- True positive rate
- Average resolution time

**EDD Metrics:**
- Number of PEPs identified
- EDD completion rate
- EDD quality scores
- Approval timeframes
- Relationship decline rate

**Monitoring Metrics:**
- Adverse media hits
- PEP status changes
- Transaction monitoring alerts
- Enhanced investigation rate

---


**QA Activities:**
- Monthly sample review of PEP screenings
- Quarterly review of EDD files
- Annual review of PEP relationships
- Independent testing

**QA Metrics:**
- PEP identification accuracy (>95% target)
- EDD completeness (>98% target)
- Adverse media monitoring effectiveness
- Approval documentation quality

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial PEP screening policy |

**Review Schedule:** Annually or upon regulatory changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

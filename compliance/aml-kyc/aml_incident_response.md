# AML Incident Response

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document establishes incident response procedures for AML/KYC compliance-related incidents. Rapid, effective incident response minimizes regulatory risk, operational impact, and reputational damage.

**Regulatory Basis:** Sound risk management practices expected by regulators

---



**Qualifying Incidents:**
- Sanctions screening system failure
- PEP screening system failure
- Transaction monitoring system failure
- False negative (missed suspicious activity)
- Sanctions screening false negative
- PEP screening false negative
- Identity verification system compromise
- Document fraud detection failure
- SAR filing failure or delay
- Data breach (customer PII)
- System compromise
- Insider threat
- Fraud campaign
- Regulatory inquiry
- Enforcement action

---


**Excluded:**
- Routine system maintenance
- Planned downtime
- Individual false positives
- Minor system glitches (resolved quickly)
- User errors (non-systemic)

---



**Definition:** Immediate threat to compliance, customer safety, or business continuity

**Examples:**
- Sanctions screening system complete failure
- Multiple sanctions false negatives identified
- Identity verification system compromise
- Large-scale data breach
- Insider fraud
- Regulatory enforcement action
- Terrorist financing identified

**Response Time:** Immediate (within 15 minutes)

**Escalation:** AML Officer, CEO, Board (immediate)

**Notification:** Regulators (as required)

---


**Definition:** Significant compliance risk or operational impact

**Examples:**
- PEP screening system failure
- Transaction monitoring system partial failure
- Single sanctions false negative
- Identity verification system degradation
- Fraud campaign detected
- SAR filing delay
- Regulatory inquiry

**Response Time:** Within 1 hour

**Escalation:** AML Officer, senior management

**Notification:** Regulators (if required)

---


**Definition:** Moderate compliance risk or operational impact

**Examples:**
- Transaction monitoring rule failure
- Screening system performance degradation
- Document verification system issues
- Alert processing delays
- Investigation quality issues
- Training compliance issues

**Response Time:** Within 4 hours

**Escalation:** Deputy AML Officer

**Notification:** Internal only

---


**Definition:** Minor compliance risk or operational impact

**Examples:**
- Individual rule performance issues
- Minor system glitches
- Documentation issues
- Process deviations

**Response Time:** Within 24 hours

**Escalation:** Compliance Manager

**Notification:** Internal only

---



**Role:** AML Officer (or Deputy if unavailable)

**Responsibilities:**
- Overall incident management
- Decision-making authority
- Stakeholder communication
- Regulatory notification
- Resource allocation

---


**Role:** Technology Manager

**Responsibilities:**
- Technical investigation
- System restoration
- Root cause analysis
- Technical remediation

---


**Role:** Deputy AML Officer

**Responsibilities:**
- Compliance impact assessment
- Regulatory analysis
- Remediation planning
- Documentation

---


**Role:** Chief Compliance Officer

**Responsibilities:**
- Internal communications
- External communications
- Regulatory communications
- Customer communications (if required)

---


**Role:** General Counsel

**Responsibilities:**
- Legal analysis
- Regulatory advice
- Privilege protection
- Litigation management

---



**Detection Methods:**
- Automated monitoring alerts
- User reports
- System health checks
- Audit findings
- Regulatory notifications
- Customer complaints
- Media reports

**Reporting:**
- Report to AML Officer immediately
- Use incident hotline or email
- Provide initial details
- Do not delay reporting

**Initial Assessment:**
- Severity classification
- Immediate containment needs
- Resource requirements
- Escalation needs

---


**Immediate Actions:**
- Stop the incident from spreading
- Protect customer data
- Preserve evidence
- Implement workarounds
- Notify stakeholders

**Containment Strategies:**

**System Failure:**
- Activate backup systems
- Implement manual processes
- Isolate affected systems
- Prevent data loss

**False Negative:**
- Identify affected customers/transactions
- Conduct immediate review
- Implement enhanced monitoring
- File SARs if appropriate

**Data Breach:**
- Isolate compromised systems
- Revoke compromised credentials
- Preserve forensic evidence
- Assess data exposure

**Insider Threat:**
- Suspend user access
- Preserve evidence
- Isolate affected systems
- Notify law enforcement (if criminal)

---


**Investigation Activities:**
- Root cause analysis
- Scope determination
- Impact assessment
- Evidence collection
- Timeline reconstruction
- Witness interviews (if applicable)

**Investigation Tools:**
- System logs (Genesis Archive™)
- Database queries
- Network analysis (Hydra™)
- Forensic analysis
- External experts (if needed)

**Investigation Documentation:**
- Investigation plan
- Evidence collected
- Findings
- Timeline
- Root cause
- Contributing factors

---


**Remediation Actions:**
- Fix root cause
- Implement corrective actions
- Implement preventive controls
- Update policies/procedures
- Conduct training
- Enhance monitoring

**Remediation Plan:**
- Specific actions
- Responsible parties
- Deadlines
- Success criteria
- Verification methods

**Remediation Approval:** AML Officer

---


**Recovery Activities:**
- Restore normal operations
- Verify system functionality
- Resume automated processes
- Clear backlogs
- Monitor for recurrence

**Recovery Verification:**
- System testing
- Process validation
- Performance monitoring
- Stakeholder confirmation

---


**Review Activities:**
- Incident timeline review
- Response effectiveness assessment
- Lessons learned
- Process improvements
- Documentation review

**Review Participants:**
- Incident response team
- Affected stakeholders
- Senior management
- External experts (if applicable)

**Review Documentation:**
- Post-incident report
- Lessons learned
- Recommendations
- Action items

**Review Timeline:** Within 30 days of incident closure

---



**Immediate Actions:**
1. Activate backup screening system
2. Implement manual screening process
3. Halt high-risk transactions
4. Notify AML Officer immediately
5. Assess scope (duration, transactions affected)

**Investigation:**
- Identify root cause
- Determine missed screenings
- Assess false negative risk
- Review affected transactions

**Remediation:**
- Fix system issue
- Conduct look-back screening
- File SARs if suspicious activity identified
- Notify OFAC if blocking required
- Document incident

**Regulatory Notification:** OFAC (if blocking/rejection occurred)

**Timeline:** Immediate containment, 24-hour investigation, 10-day OFAC notification

---


**Immediate Actions:**
1. Activate backup screening system
2. Implement manual PEP screening
3. Halt high-risk customer onboarding
4. Notify AML Officer
5. Assess scope

**Investigation:**
- Identify root cause
- Determine missed PEP screenings
- Assess risk

**Remediation:**
- Fix system issue
- Conduct look-back PEP screening
- Conduct EDD for identified PEPs
- Enhance monitoring for PEPs
- Document incident

**Regulatory Notification:** Not required (unless enforcement action)

**Timeline:** 4-hour containment, 48-hour investigation

---


**Immediate Actions:**
1. Assess scope (rules affected, duration)
2. Implement manual monitoring (high-risk)
3. Notify AML Officer
4. Preserve system logs
5. Activate backup monitoring

**Investigation:**
- Identify root cause
- Determine missed alerts
- Assess false negative risk
- Estimate missed suspicious activity

**Remediation:**
- Fix system issue
- Conduct look-back analysis
- Investigate high-risk transactions
- File SARs if appropriate
- Document incident

**Regulatory Notification:** Not required (unless enforcement action)

**Timeline:** 1-hour containment, 7-day look-back, 30-day SAR filing

---


**Immediate Actions:**
1. Isolate compromised system
2. Halt customer onboarding
3. Revoke compromised credentials
4. Notify AML Officer and CISO
5. Preserve forensic evidence
6. Assess data exposure

**Investigation:**
- Forensic analysis
- Determine scope of compromise
- Identify affected customers
- Assess fraud risk
- Identify perpetrator

**Remediation:**
- Restore system security
- Re-verify affected customers
- Implement enhanced security
- Notify affected customers
- Offer identity protection services
- File SARs if fraud identified
- Notify law enforcement

**Regulatory Notification:**
- State data breach notification laws (varies by state)
- Federal regulators (if required)
- Law enforcement

**Timeline:** Immediate containment, 72-hour investigation, state-specific notification timelines

---


**Immediate Actions:**
1. Identify fraud pattern
2. Identify affected accounts
3. Freeze affected accounts
4. Notify AML Officer
5. Preserve evidence
6. Assess financial impact

**Investigation:**
- Fraud typology analysis
- Network analysis (Hydra™)
- Identify perpetrators
- Trace funds
- Assess scope

**Remediation:**
- Block perpetrators
- Recover funds (if possible)
- Enhance fraud detection
- File SARs
- Notify law enforcement
- Notify affected customers

**Regulatory Notification:**
- SAR filing (30 days)
- Law enforcement notification

**Timeline:** Immediate containment, 7-day investigation, 30-day SAR filing

---


**Immediate Actions:**
1. Notify AML Officer and General Counsel
2. Preserve all relevant documents
3. Implement litigation hold
4. Assemble response team
5. Acknowledge receipt to regulator

**Investigation:**
- Understand inquiry scope
- Gather requested information
- Conduct internal investigation
- Identify issues
- Assess remediation needs

**Response:**
- Prepare comprehensive response
- Legal review
- AML Officer approval
- Submit to regulator
- Implement remediation

**Regulatory Notification:** Response per regulator's timeline

**Timeline:** Per regulator's request (typically 30 days)

---



**Immediate Notification (Critical/High):**
- AML Officer
- CEO
- General Counsel
- CTO
- Board (Critical only)

**Regular Updates:**
- Incident response team
- Affected business units
- Senior management
- Board (Critical incidents)

**Communication Methods:**
- Email (non-confidential)
- Secure messaging (confidential)
- Phone (urgent)
- In-person meetings (sensitive)

---


**Regulatory Communications:**
- Prepared by AML Officer and General Counsel
- Approved by CEO
- Factual and complete
- Timely per requirements

**Customer Communications:**
- Prepared by Communications Lead
- Approved by General Counsel
- Clear and transparent
- Timely per requirements

**Media Communications:**
- Prepared by Communications Lead
- Approved by CEO
- Coordinated with legal
- "No comment" if investigation ongoing

---


**Coordination:**
- General Counsel leads
- AML Officer supports
- Preserve evidence
- Provide requested information
- Maintain confidentiality

---



**For Each Incident:**
- Incident report
- Detection details
- Severity classification
- Response actions
- Investigation findings
- Root cause analysis
- Remediation plan
- Recovery verification
- Post-incident review
- Lessons learned
- Genesis Archive™ log entries

**Evidence Location:** Incident management system + Genesis Archive™

**Retention:** 5 years (longer if litigation)

---


**Incident Summary:**
- Incident ID
- Date/time detected
- Severity level
- Incident type
- Brief description

**Detection:**
- How detected
- Who detected
- Initial assessment

**Response:**
- Containment actions
- Investigation summary
- Remediation actions
- Recovery actions

**Impact:**
- Customers affected
- Transactions affected
- Financial impact
- Regulatory impact
- Reputational impact

**Root Cause:**
- Primary cause
- Contributing factors
- Preventability assessment

**Lessons Learned:**
- What went well
- What could be improved
- Recommendations

**Approvals:**
- Incident Commander
- AML Officer
- General Counsel (if legal issues)

---



**Volume Metrics:**
- Total incidents per month
- Incidents by severity
- Incidents by type
- Repeat incidents

**Response Metrics:**
- Average detection time
- Average response time
- Average resolution time
- SLA compliance rate

**Impact Metrics:**
- Customers affected
- Transactions affected
- Financial impact
- Regulatory impact

---


**Monthly Report:**
- Incident summary
- Trends analysis
- Response effectiveness
- Recommendations

**Quarterly Report:**
- Comprehensive metrics
- Root cause analysis
- Process improvements
- Training needs

**Annual Report:**
- Year-over-year trends
- Program effectiveness
- Strategic recommendations

**Audience:** AML Officer, senior management, Board

---



**All Personnel:**
- Annual incident reporting training
- Incident hotline awareness
- Escalation procedures

**Incident Response Team:**
- Comprehensive incident response training
- Role-specific training
- Tabletop exercises (quarterly)
- Full-scale exercises (annually)

---


**Purpose:** Test incident response procedures in simulated scenarios

**Frequency:** Quarterly

**Scenarios:**
- Sanctions screening failure
- Data breach
- Fraud campaign
- Regulatory inquiry

**Participants:** Incident response team

**Documentation:** Exercise report, lessons learned, improvements

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial incident response procedures |

**Review Schedule:** Annually or upon major incident  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

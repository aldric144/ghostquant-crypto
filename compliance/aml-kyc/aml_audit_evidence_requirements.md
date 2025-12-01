# AML Audit Evidence Requirements

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document specifies the evidence requirements for demonstrating AML/KYC compliance during regulatory examinations, internal audits, and independent testing. Proper evidence collection and preservation are critical for regulatory compliance and legal defensibility.

**Regulatory Basis:** 31 CFR 1020.210 - AML program requirements

---



---



**AML Program Documentation:**
- AML Program document (current version)
- Board approval of AML Program
- Annual AML Program review
- Risk assessment documentation
- Policy updates and change logs

**Policies and Procedures:**
- KYC/CDD procedures
- Transaction monitoring procedures
- Sanctions screening procedures
- PEP screening procedures
- Investigation procedures
- SAR filing procedures
- Training procedures
- Independent testing procedures

**Evidence Location:** Genesis Archive™ + Document management system

**Retention:** Permanent (minimum 5 years after superseded)

---


**Required Evidence:**
- Board meeting minutes (AML discussions)
- Board approval of AML Program
- Board approval of AML Officer appointment
- Quarterly compliance reports to Board
- Annual AML Program assessment
- Management committee meeting minutes
- Budget approvals for AML resources

**Evidence Location:** Genesis Archive™

**Retention:** Permanent

---



**Required Evidence for Each Customer:**
- Customer application/onboarding form
- Identity documents (passport, driver's license, etc.)
- Proof of address documents
- Biometric verification results (iProov)
- Document verification results (Jumio/Onfido)
- Oracle Eye™ fraud detection analysis
- Sanctions screening results
- PEP screening results
- Risk assessment and risk score
- Approval documentation
- Genesis Archive™ log entries

**Evidence Location:**
- Documents: S3 bucket (encrypted)
- Verification results: PostgreSQL database
- Audit trail: Genesis Archive™

**Retention:** 5 years after account closure

---


**Required Evidence:**
- Beneficial ownership certification
- Ownership structure diagrams
- Corporate documents (articles of incorporation, etc.)
- Beneficial owner identity verification
- Beneficial owner screening results
- Hydra™ ownership analysis

**Evidence Location:** S3 + Genesis Archive™

**Retention:** 5 years after account closure

---


**Required Evidence for High-Risk Customers:**
- All CIP evidence (above)
- Source of wealth documentation
- Source of funds documentation
- Enhanced screening results
- Adverse media research
- Senior management approval
- Enhanced monitoring plan
- Periodic review documentation

**Evidence Location:** S3 + Genesis Archive™

**Retention:** 5 years after account closure

---



**Required Evidence:**
- Transaction monitoring rule documentation (50 rules)
- Rule logic and parameters
- Rule testing results
- Rule effectiveness analysis
- Rule tuning documentation
- Rule approval and change management

**Evidence Location:** Genesis Archive™ + Configuration management

**Retention:** 5 years after rule retired

---


**Required Evidence for Each Alert:**
- Alert details (rule, date, amount, entities)
- Transaction data
- UltraFusion AI™ risk analysis
- Actor Profiler™ behavioral analysis
- Hydra™ network analysis
- Constellation Map™ geographic analysis
- Oracle Eye™ document analysis (if applicable)
- Cortex Memory™ historical analysis
- Radar Heatmap™ velocity analysis
- Investigation notes
- Disposition decision and rationale
- Approvals
- Genesis Archive™ log entries

**Evidence Location:** Case management system + Genesis Archive™

**Retention:** 5 years after case closure

---


**Required Evidence:**
- Monthly alert volume reports
- Alert disposition statistics
- False positive rates
- True positive rates
- Average investigation time
- SAR filing rates
- Trend analysis

**Evidence Location:** Compliance reporting system

**Retention:** 5 years

---



**Required Evidence for Each Screening:**
- Screening request details
- Screening results (matches and non-matches)
- Match confidence scores
- False positive analysis
- Match resolution documentation
- Escalation (if applicable)
- Approval documentation
- Genesis Archive™ log entries

**Evidence Location:** PostgreSQL database + Genesis Archive™

**Retention:** 5 years

---


**Required Evidence:**
- List update notifications
- List version tracking
- Re-screening results after updates
- New matches identified
- Actions taken on new matches

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---


**Required Evidence:**
- Blocking/rejection decision
- OFAC reporting (if applicable)
- Customer notification (if permitted)
- Funds handling documentation
- Legal review (if applicable)
- Genesis Archive™ log entries

**Evidence Location:** Case management system + Genesis Archive™

**Retention:** 5 years

---



**Required Evidence for Each Investigation:**
- Case opening documentation
- Alert(s) that triggered investigation
- Investigation plan
- Evidence collected:
  - Transaction logs
  - Network diagrams (Hydra™)
  - Geographic analysis (Constellation Map™)
  - Behavioral analysis (Actor Profiler™)
  - Risk scores (UltraFusion AI™)
  - Document analysis (Oracle Eye™)
  - Historical patterns (Cortex Memory™)
  - External research
  - Customer communications
- Investigation narrative
- Findings and conclusions
- Disposition decision
- Approvals
- Follow-up actions
- Genesis Archive™ log entries

**Evidence Location:** Case management system + S3 + Genesis Archive™

**Retention:** 5 years after case closure

---


**Additional Evidence for Complex Cases:**
- Forensic analysis (blockchain tracing)
- Expert opinions
- Law enforcement coordination
- Legal review
- Senior management briefings
- External consultant reports (if applicable)

**Evidence Location:** Case management system + S3 + Genesis Archive™

**Retention:** 5 years after case closure (longer if litigation)

---



**Required Evidence for Each SAR:**
- Complete SAR narrative
- Supporting documentation:
  - Investigation file
  - Transaction logs
  - Network diagrams
  - Risk analysis
  - All engine findings
- SAR review and approval chain
- FinCEN filing confirmation (BSA ID)
- Filing date
- Continuing activity tracking
- Genesis Archive™ log entries

**Evidence Location:** Secure SAR repository + Genesis Archive™

**Retention:** 5 years after filing (longer if litigation)

---


**Required Evidence:**
- SAR access logs
- Confidentiality training records
- Confidentiality agreements
- Access control configurations
- Annual access reviews

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---


**Required Evidence:**
- Investigation file
- Analysis and rationale for no-SAR decision
- AML Officer approval
- Documentation of alternative actions taken
- Genesis Archive™ log entries

**Evidence Location:** Case management system + Genesis Archive™

**Retention:** 5 years

---



**Required Evidence:**
- Training program document
- Training curriculum
- Training materials
- Instructor qualifications
- Training schedule
- Program effectiveness assessments

**Evidence Location:** Learning management system

**Retention:** 5 years

---


**Required Evidence for Each Employee:**
- Hire date
- Initial training completion date and certificate
- Annual training completion dates and certificates
- Module completion records
- Assessment scores
- Specialized training records
- Total training hours

**Evidence Location:** Learning management system + HR system

**Retention:** 5 years after employment termination

---


**Required Evidence:**
- Training completion rates
- Assessment score analysis
- Performance metrics (before/after training)
- Feedback surveys
- Program improvements implemented

**Evidence Location:** Compliance reporting system

**Retention:** 5 years

---



**Required Evidence:**
- Annual testing plan
- Scope of testing
- Testing methodology
- Sample selection methodology
- Testing schedule
- Board approval of testing plan

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---


**Required Evidence:**
- Testing workpapers
- Sample selections
- Testing procedures performed
- Findings and observations
- Severity ratings
- Root cause analysis
- Management responses
- Remediation plans
- Follow-up testing results

**Evidence Location:** Audit management system + Genesis Archive™

**Retention:** 5 years

---


**Required Evidence:**
- Annual testing report
- Executive summary
- Detailed findings
- Management action plans
- Board presentation
- Follow-up status reports

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---



**Required Evidence:**
- System architecture documentation
- Configuration settings
- User access controls
- Role definitions
- Integration documentation
- API documentation
- Change management records

**Evidence Location:** Configuration management system + Genesis Archive™

**Retention:** 5 years after system retired

---


**Required Evidence:**
- User acceptance testing (UAT) results
- System integration testing results
- Performance testing results
- Security testing results
- Penetration testing results

**Evidence Location:** Testing repository + Genesis Archive™

**Retention:** 5 years

---


**Required Evidence for Each Change:**
- Change request
- Business justification
- Impact analysis
- Testing results
- Approval documentation
- Implementation date
- Rollback plan
- Post-implementation review

**Evidence Location:** Change management system + Genesis Archive™

**Retention:** 5 years

---


**Required Evidence:**
- System uptime reports
- Performance metrics
- Error logs
- Security logs
- Incident reports
- Resolution documentation

**Evidence Location:** Monitoring system (Datadog) + Genesis Archive™

**Retention:** 1 year (active), 5 years (Genesis Archive™)

---



**Required Evidence:**
- AML Officer appointment letter
- Board approval
- Resume/qualifications
- Certifications (CAMS, etc.)
- Authority documentation
- Performance reviews

**Evidence Location:** HR system + Genesis Archive™

**Retention:** 5 years after separation

---


**Required Evidence:**
- Organizational charts
- Role descriptions
- RACI matrices
- Reporting relationships
- Succession plans

**Evidence Location:** HR system + Genesis Archive™

**Retention:** 5 years after superseded

---


**Required Evidence:**
- AML budget
- Staffing levels
- Technology investments
- Budget approvals
- Resource adequacy assessments

**Evidence Location:** Finance system + Genesis Archive™

**Retention:** 7 years (financial records)

---



**Required Evidence:**
- Examination notification
- Document request lists
- Responses to requests
- Examination presentations
- Examination findings
- Management responses
- Remediation plans
- Follow-up documentation

**Evidence Location:** Genesis Archive™

**Retention:** Permanent

---


**Required Evidence:**
- All correspondence with regulators
- Regulatory guidance received
- Interpretive letters
- No-action letters
- Enforcement actions (if any)

**Evidence Location:** Genesis Archive™

**Retention:** Permanent

---



**Requirements:**
- Clear and concise
- Factual and objective
- Well-organized
- Properly dated
- Properly attributed
- Suitable for legal proceedings

---


**Requirements:**
- Immutable storage (Genesis Archive™)
- Encryption at rest and in transit
- Access controls
- Backup and disaster recovery
- Chain of custody
- Integrity verification

---


**Requirements:**
- Searchable and indexed
- Rapid retrieval capability
- Export capabilities
- Audit trail of access
- Redaction capabilities (for confidential information)

---



- [ ] AML Program document (current)
- [ ] Board approval documentation
- [ ] Organizational chart
- [ ] AML Officer qualifications
- [ ] Risk assessment (current)
- [ ] Independent testing report (most recent)
- [ ] Training program documentation
- [ ] Training completion records
- [ ] Policy and procedure manuals
- [ ] Transaction monitoring rule documentation
- [ ] Alert statistics (past 12 months)
- [ ] SAR filing statistics (past 12 months)
- [ ] Sample investigation files
- [ ] Sample SAR files
- [ ] System documentation
- [ ] Vendor contracts
- [ ] Audit reports

---


- [ ] Designated examination coordinator
- [ ] Secure examination workspace
- [ ] Document production tracking
- [ ] Daily examination team briefings
- [ ] Issue tracking and resolution
- [ ] Exit meeting preparation
- [ ] Management response preparation

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial audit evidence requirements |

**Review Schedule:** Annually or upon regulatory changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

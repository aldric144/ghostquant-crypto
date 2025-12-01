# AML Change Management

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document establishes change management procedures for AML/KYC compliance controls, including transaction monitoring rules, screening configurations, risk models, and system changes. Proper change management ensures compliance effectiveness, regulatory compliance, and audit trail integrity.

**Regulatory Basis:** Sound change management practices are expected by regulators

---



**AML Rule Changes:**
- Transaction monitoring rule creation
- Transaction monitoring rule modification
- Transaction monitoring rule retirement
- Rule parameter adjustments
- Threshold changes

**Screening Configuration Changes:**
- Sanctions screening list updates
- PEP screening list updates
- Screening algorithm changes
- Match threshold adjustments
- False positive tuning

**Risk Model Changes:**
- Risk scoring model updates
- Risk factor weight adjustments
- Risk classification changes
- Customer risk rating changes

**System Changes:**
- Intelligence engine updates
- Database schema changes
- API changes
- Integration changes
- Security updates

**Policy and Procedure Changes:**
- AML policy updates
- Procedure modifications
- Process improvements
- Workflow changes

---


**Excluded from This Process:**
- Routine system maintenance
- Security patches (emergency)
- Data corrections
- User access changes (covered by access management)

---



**Responsibilities:**
- Identify need for change
- Submit change request
- Provide business justification
- Participate in testing
- Validate results

**Authority:** Submit change requests

---


**Responsibilities:**
- Review and approve all AML-related changes
- Assess compliance impact
- Ensure regulatory compliance
- Approve implementation
- Monitor change effectiveness

**Authority:** Approve/reject all AML changes

---


**Members:**
- AML Officer (Chair)
- Deputy AML Officer
- Compliance Manager
- Technology Lead
- Risk Manager

**Responsibilities:**
- Review complex changes
- Assess risk and impact
- Approve high-risk changes
- Resolve conflicts
- Monitor change metrics

**Meeting Frequency:** Weekly

---


**Responsibilities:**
- Implement approved changes
- Conduct technical testing
- Document changes
- Provide rollback capability
- Monitor post-implementation

**Authority:** Implement approved changes

---



**Required Information:**
- Change description
- Business justification
- Compliance rationale
- Expected impact
- Affected systems/rules
- Implementation plan
- Testing plan
- Rollback plan
- Risk assessment
- Resource requirements
- Proposed timeline

**Submission Method:** Change management system

**Documentation:** Change request form

---


**Classification Criteria:**

**Critical Changes:**
- New transaction monitoring rules
- Major risk model changes
- Screening algorithm changes
- System architecture changes
- Regulatory-driven changes

**High Changes:**
- Rule parameter modifications
- Risk factor weight changes
- Integration changes
- Workflow changes

**Medium Changes:**
- Rule threshold adjustments
- Minor process improvements
- Configuration updates

**Low Changes:**
- Documentation updates
- Minor bug fixes
- Cosmetic changes

---


**Critical Changes:**
- AML Officer approval required
- Change Review Committee review
- Senior management notification
- Board notification (if material)

**High Changes:**
- AML Officer approval required
- Deputy AML Officer review

**Medium Changes:**
- Deputy AML Officer approval required

**Low Changes:**
- Compliance Manager approval required

---



**Review Criteria:**
- Business justification
- Compliance necessity
- Regulatory impact
- Risk assessment
- Resource availability
- Implementation feasibility
- Testing adequacy
- Rollback capability

**Review Timeline:**
- Critical: 5 business days
- High: 3 business days
- Medium: 2 business days
- Low: 1 business day

---


**Assessment Areas:**

**Compliance Impact:**
- Regulatory requirements affected
- Compliance effectiveness
- Audit trail impact
- Documentation requirements

**Operational Impact:**
- Alert volume changes
- Investigation workload
- False positive rate
- System performance
- User experience

**Technical Impact:**
- System dependencies
- Integration points
- Data requirements
- Performance impact
- Security considerations

**Risk Impact:**
- Risk detection capability
- False negative risk
- Regulatory risk
- Operational risk
- Reputational risk

---


**Possible Outcomes:**
- Approved (proceed to testing)
- Approved with conditions
- Deferred (more information needed)
- Rejected (with rationale)

**Documentation:**
- Approval decision
- Approval date
- Approver name
- Conditions (if any)
- Rationale (if rejected)

---



**Unit Testing:**
- Rule logic validation
- Parameter validation
- Error handling
- Edge cases

**Integration Testing:**
- Engine integration
- Database integration
- API integration
- Workflow integration

**User Acceptance Testing (UAT):**
- Business process validation
- User interface testing
- Performance testing
- Compliance validation

**Regression Testing:**
- Existing functionality validation
- No unintended impacts
- System stability

---


**Development Environment:**
- Initial development and unit testing
- Developer access only

**Test Environment:**
- Integration and UAT testing
- Mirrors production configuration
- Test data only

**Staging Environment:**
- Final pre-production testing
- Production-like data (anonymized)
- Limited access

**Production Environment:**
- Live system
- Real customer data
- Controlled changes only

---


**Required Documentation:**
- Test plan
- Test cases
- Test data
- Test results
- Defects identified
- Defect resolution
- Sign-off

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---



**Implementation Plan Components:**
- Implementation steps
- Implementation timeline
- Resource assignments
- Dependencies
- Communication plan
- Rollback plan
- Success criteria

**Approval:** AML Officer approval required

---


**Preferred Windows:**
- Non-business hours (evenings, weekends)
- Low-volume periods
- Planned maintenance windows

**Blackout Periods:**
- Month-end/quarter-end
- Regulatory reporting periods
- High-volume periods
- Holiday periods

---


**Pre-Implementation:**
- Backup current configuration
- Verify rollback plan
- Notify stakeholders
- Prepare monitoring

**Implementation:**
- Execute implementation steps
- Document each step
- Verify each step
- Monitor for issues

**Post-Implementation:**
- Verify success criteria
- Monitor system performance
- Monitor alert generation
- Document completion

---


**Required Documentation:**
- Implementation date/time
- Implementer name
- Steps executed
- Issues encountered
- Resolution actions
- Verification results
- Sign-off

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---



**Review Activities:**
- System stability check
- Alert generation review
- Error log review
- Performance metrics
- User feedback

**Issues:** Immediate escalation to AML Officer

---


**Review Activities:**
- Alert volume analysis
- False positive rate
- Investigation workload
- System performance
- User satisfaction

**Adjustments:** Minor tuning if needed

---


**Review Activities:**
- Effectiveness assessment
- Compliance impact
- Operational impact
- Lessons learned
- Recommendations

**Documentation:** Post-implementation review report

**Approval:** AML Officer

---



**Immediate Rollback:**
- System failure
- Data corruption
- Security breach
- Critical defect
- Regulatory non-compliance

**Planned Rollback:**
- Ineffective change
- Unacceptable operational impact
- Failed post-implementation review

---


**Rollback Steps:**
1. Notify AML Officer
2. Obtain rollback approval
3. Execute rollback plan
4. Verify system restoration
5. Monitor system stability
6. Document rollback
7. Conduct root cause analysis

**Rollback Authority:** AML Officer

---


**Required Documentation:**
- Rollback trigger
- Rollback decision
- Rollback date/time
- Rollback steps
- Verification results
- Root cause analysis
- Corrective actions

**Evidence Location:** Genesis Archive™

**Retention:** 5 years

---



**Process:**
1. Identify need (risk assessment, typology, regulatory requirement)
2. Draft rule logic and parameters
3. Document rule rationale
4. Submit change request
5. AML Officer review and approval
6. Develop rule in test environment
7. Test rule (unit, integration, UAT)
8. Document testing results
9. AML Officer approval for production
10. Implement in production
11. Monitor effectiveness
12. Document in rule library

**Timeline:** 4-8 weeks

---


**Triggers:**
- Ineffective detection
- High false positive rate
- Regulatory changes
- Typology evolution
- System changes

**Process:**
1. Identify need for modification
2. Analyze current performance
3. Propose modifications
4. Submit change request
5. Follow standard change process
6. Compare before/after metrics

**Timeline:** 2-4 weeks

---


**Purpose:** Optimize rule performance (reduce false positives, improve detection)

**Process:**
1. Analyze rule performance metrics
2. Identify tuning opportunities
3. Propose parameter adjustments
4. Test in staging environment
5. Analyze impact
6. Implement if beneficial
7. Monitor results

**Frequency:** Quarterly review of all rules

---


**Triggers:**
- Typology no longer relevant
- Superseded by new rule
- Consistently ineffective
- Regulatory change

**Process:**
1. Identify rule for retirement
2. Document rationale
3. Assess impact of retirement
4. Submit change request
5. AML Officer approval
6. Deactivate rule
7. Archive rule documentation
8. Monitor for gaps

**Documentation:** Retain rule documentation for 5 years

---



**Triggers:**
- Annual model validation
- Regulatory changes
- Risk environment changes
- Model performance issues

**Process:**
1. Conduct model validation
2. Identify necessary changes
3. Document proposed changes
4. Model testing and validation
5. Change Review Committee approval
6. Board notification (if material)
7. Implementation
8. Back-testing
9. Documentation update

**Timeline:** 8-12 weeks

**Frequency:** Annual validation, changes as needed

---


**Process:**
1. Analyze risk factor performance
2. Propose weight adjustments
3. Model impact analysis
4. Submit change request
5. AML Officer approval
6. Testing and validation
7. Implementation
8. Monitor impact

**Timeline:** 4-6 weeks

---



**Process:**
1. Receive list update notification
2. Download updated list
3. Validate list integrity
4. Load into test environment
5. Test screening functionality
6. Schedule production update
7. Implement in production
8. Trigger re-screening
9. Review new matches
10. Document update

**Frequency:** Daily (automated)

**Manual Review:** Weekly

---


**Process:**
1. Identify need for algorithm change
2. Document proposed change
3. Submit change request
4. Change Review Committee review
5. Algorithm development
6. Testing (accuracy, performance)
7. AML Officer approval
8. Implementation
9. Monitor match rates
10. Adjust if needed

**Timeline:** 6-10 weeks

---



**Qualifying Situations:**
- Critical security vulnerability
- Regulatory mandate (immediate)
- System failure affecting compliance
- Data integrity issue

**Non-Qualifying:**
- Convenience
- Business pressure
- Missed deadlines

---


**Process:**
1. Identify emergency situation
2. Notify AML Officer immediately
3. Document emergency justification
4. Obtain verbal approval from AML Officer
5. Implement change
6. Document implementation
7. Conduct post-implementation review within 24 hours
8. Obtain formal written approval within 48 hours
9. Complete standard documentation

**Approval:** AML Officer (verbal, then written)

---



**Volume Metrics:**
- Total changes per month
- Changes by classification
- Changes by type
- Emergency changes

**Quality Metrics:**
- Change success rate
- Rollback rate
- Defect rate
- Rework rate

**Timeliness Metrics:**
- Average approval time
- Average implementation time
- SLA compliance rate

**Effectiveness Metrics:**
- Rule effectiveness (before/after)
- False positive rate (before/after)
- Detection rate (before/after)

---


**Monthly Report:**
- Change volume and trends
- Change success rate
- Issues and resolutions
- Metrics analysis

**Quarterly Report:**
- Comprehensive metrics
- Effectiveness analysis
- Process improvements
- Recommendations

**Audience:** AML Officer, Change Review Committee

---



**For Each Change:**
- Change request
- Impact assessment
- Approval documentation
- Testing documentation
- Implementation documentation
- Post-implementation review
- Genesis Archive™ log entries

**Evidence Location:** Change management system + Genesis Archive™

**Retention:** 5 years

---


**Contents:**
- All change requests (approved and rejected)
- Change history by system/rule
- Lessons learned
- Best practices
- Templates

**Maintenance:** Compliance Manager

**Access:** Compliance staff, auditors, regulators

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | AML Officer | Initial change management procedures |

**Review Schedule:** Annually or upon process changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

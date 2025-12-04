# FedRAMP Roles and Responsibilities

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document defines the roles and responsibilities for FedRAMP authorization and ongoing compliance for GhostQuant™. Each role is mapped to specific FedRAMP control families and operational responsibilities.

---


```
┌─────────────────────────────────────────────────────────────────┐
│                    GHOSTQUANT™ SECURITY ORGANIZATION             │
└─────────────────────────────────────────────────────────────────┘

                        Chief Information Security Officer (CISO)
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
        System Owner            Information System         Security Control
                              Security Officer (ISSO)       Assessor (SCA)
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
        Cloud Infrastructure    DevSecOps Lead         Incident Response
            Manager                                      Commander
                                        │
                                        │
                                Compliance Manager
```

---



**Primary Responsibilities:**
- Overall security program ownership
- Risk acceptance authority
- Security policy approval
- Budget allocation for security initiatives
- Executive reporting and stakeholder communication
- FedRAMP authorization oversight

**FedRAMP Control Families:**
- PL (Planning) - Security planning and architecture approval
- RA (Risk Assessment) - Risk acceptance and mitigation approval
- PM (Program Management) - Overall security program management

**Key Activities:**
- Approve System Security Plan (SSP)
- Accept residual risks
- Approve security policies and procedures
- Review and approve POA&M items
- Authorize system for operation (internal)
- Quarterly security posture reviews
- Annual FedRAMP assessment oversight

**Qualifications:**
- CISSP, CISM, or equivalent certification
- 10+ years information security experience
- 5+ years in leadership role
- FedRAMP experience preferred

**Time Commitment:** 10-15 hours/month

---


**Primary Responsibilities:**
- Business ownership of GhostQuant™ system
- Functional requirements definition
- Budget ownership for system operations
- Business risk acceptance
- Stakeholder management with federal agencies

**FedRAMP Control Families:**
- PL (Planning) - System planning and requirements
- SA (System and Services Acquisition) - System acquisition decisions
- PM (Program Management) - System program management

**Key Activities:**
- Define system mission and business requirements
- Approve system changes from business perspective
- Allocate resources for system operations
- Coordinate with federal agency stakeholders
- Approve system enhancements and new features
- Participate in contingency planning
- Support FedRAMP authorization activities

**Qualifications:**
- Business or technical leadership experience
- Understanding of federal agency requirements
- Budget management experience
- Stakeholder management skills

**Time Commitment:** 5-10 hours/month

---


**Primary Responsibilities:**
- Day-to-day security operations
- Security control implementation oversight
- SSP maintenance and updates
- POA&M management
- Continuous monitoring coordination
- Security documentation maintenance
- Liaison with FedRAMP PMO and 3PAO

**FedRAMP Control Families:**
- AC (Access Control) - Access control implementation
- AU (Audit and Accountability) - Audit logging oversight
- CM (Configuration Management) - Configuration management
- IA (Identification and Authentication) - Authentication oversight
- IR (Incident Response) - Incident response coordination
- MA (Maintenance) - Maintenance coordination
- MP (Media Protection) - Media protection oversight
- PL (Planning) - SSP maintenance
- PS (Personnel Security) - Personnel security coordination
- SC (System and Communications Protection) - System protection
- SI (System and Information Integrity) - System integrity

**Key Activities:**
- Maintain System Security Plan (SSP)
- Manage Plan of Action and Milestones (POA&M)
- Coordinate continuous monitoring activities
- Conduct monthly vulnerability scans
- Perform quarterly control testing
- Update security documentation
- Coordinate with 3PAO for assessments
- Submit monthly continuous monitoring deliverables
- Respond to FedRAMP PMO inquiries
- Conduct security control reviews

**Qualifications:**
- CISSP, CAP, or equivalent certification
- 5+ years information security experience
- FedRAMP experience required
- Strong documentation skills
- Understanding of NIST 800-53 controls

**Time Commitment:** 30-40 hours/week (full-time)

---


**Primary Responsibilities:**
- Independent security control assessment
- Control testing and validation
- Security Assessment Report (SAR) development
- Vulnerability assessment
- Penetration testing coordination
- Assessment evidence collection

**FedRAMP Control Families:**
- All 15 control families (assessment role)

**Key Activities:**
- Conduct annual security control assessments
- Perform control testing per FedRAMP requirements
- Document assessment findings in SAR
- Coordinate penetration testing
- Validate POA&M remediation
- Support continuous monitoring assessments
- Provide independent assessment perspective

**Qualifications:**
- Must be from FedRAMP-approved 3PAO
- CISSP, CAP, or equivalent certification
- FedRAMP assessment experience required
- Understanding of FedRAMP assessment methodology

**Time Commitment:** 2-4 weeks annually (3PAO engagement)

---


**Primary Responsibilities:**
- AWS GovCloud infrastructure management
- Infrastructure as Code (IaC) development
- Network architecture and security
- Disaster recovery and business continuity
- Infrastructure monitoring and alerting
- Capacity planning and scaling

**FedRAMP Control Families:**
- CP (Contingency Planning) - DR and backup implementation
- CM (Configuration Management) - Infrastructure configuration
- SC (System and Communications Protection) - Network security
- PE (Physical and Environmental Protection) - Coordination with AWS

**Key Activities:**
- Manage AWS GovCloud infrastructure
- Implement and maintain Terraform IaC
- Configure network security (VPC, security groups, NACLs)
- Implement disaster recovery procedures
- Conduct DR testing (annual)
- Monitor infrastructure health and performance
- Manage infrastructure changes
- Coordinate with AWS for support issues
- Implement infrastructure security controls

**Qualifications:**
- AWS Solutions Architect certification
- 5+ years AWS experience
- Infrastructure as Code experience (Terraform)
- AWS GovCloud experience preferred
- Understanding of federal security requirements

**Time Commitment:** 30-40 hours/week (full-time)

---


**Primary Responsibilities:**
- Secure software development lifecycle (SDLC)
- CI/CD pipeline security
- Application security testing
- Vulnerability remediation
- Security automation
- Code review and static analysis

**FedRAMP Control Families:**
- SA (System and Services Acquisition) - Secure SDLC
- SI (System and Information Integrity) - Vulnerability management
- CM (Configuration Management) - Change management
- RA (Risk Assessment) - Vulnerability assessment

**Key Activities:**
- Implement secure SDLC practices
- Conduct code reviews for security
- Perform static and dynamic application security testing
- Manage vulnerability remediation
- Implement security automation
- Maintain CI/CD pipeline security
- Coordinate penetration testing
- Implement security patches
- Conduct security training for developers

**Qualifications:**
- CSSLP, CEH, or equivalent certification
- 5+ years software development experience
- 3+ years DevSecOps experience
- Application security expertise
- CI/CD pipeline experience

**Time Commitment:** 30-40 hours/week (full-time)

---


**Primary Responsibilities:**
- Incident response leadership
- Security incident investigation
- Incident communication and reporting
- Post-incident review and lessons learned
- Incident response plan maintenance
- IR team training and exercises

**FedRAMP Control Families:**
- IR (Incident Response) - All incident response controls
- AU (Audit and Accountability) - Audit log analysis for incidents

**Key Activities:**
- Lead security incident response
- Coordinate incident investigation
- Communicate with stakeholders during incidents
- Report incidents to federal agencies (as required)
- Conduct post-incident reviews
- Maintain Incident Response Plan
- Conduct IR training and tabletop exercises
- Coordinate with law enforcement (if required)
- Document lessons learned
- Implement corrective actions

**Qualifications:**
- GCIH, GCFA, or equivalent certification
- 5+ years incident response experience
- Federal incident reporting experience preferred
- Strong communication skills
- Crisis management experience

**Time Commitment:** 10-15 hours/month (on-call 24/7)

---


**Primary Responsibilities:**
- FedRAMP compliance oversight
- Compliance documentation management
- Regulatory liaison
- Compliance training coordination
- Audit coordination
- Policy development and maintenance

**FedRAMP Control Families:**
- PL (Planning) - Compliance planning
- PS (Personnel Security) - Training coordination
- All families - Compliance documentation

**Key Activities:**
- Maintain compliance documentation
- Coordinate FedRAMP assessments
- Manage compliance calendar
- Coordinate compliance training
- Track regulatory changes
- Update policies and procedures
- Coordinate with auditors
- Manage compliance artifacts
- Support POA&M management
- Conduct compliance gap assessments

**Qualifications:**
- CISA, CRISC, or equivalent certification
- 5+ years compliance experience
- FedRAMP experience required
- Strong documentation skills
- Understanding of federal regulations

**Time Commitment:** 20-30 hours/week

---


**Legend:**
- R = Responsible (does the work)
- A = Accountable (final authority)
- C = Consulted (provides input)
- I = Informed (kept updated)

| Control Family | CISO | System Owner | ISSO | SCA | Cloud Infra | DevSecOps | IR Commander | Compliance |
|----------------|------|--------------|------|-----|-------------|-----------|--------------|------------|
| AC - Access Control | A | C | R | C | C | C | I | I |
| AU - Audit & Accountability | A | I | R | C | C | C | C | I |
| CM - Configuration Mgmt | A | C | R | C | R | R | I | I |
| CP - Contingency Planning | A | C | R | C | R | C | C | I |
| IA - Identification & Auth | A | C | R | C | C | R | I | I |
| IR - Incident Response | A | C | R | C | C | C | R | I |
| MA - Maintenance | A | C | R | C | R | C | I | I |
| MP - Media Protection | A | C | R | C | R | I | I | I |
| PE - Physical Protection | A | I | R | C | C | I | I | I |
| PL - Planning | A | C | R | C | C | C | I | R |
| PS - Personnel Security | A | C | R | C | I | I | I | R |
| RA - Risk Assessment | A | C | R | R | C | C | C | C |
| SA - System Acquisition | A | R | C | C | C | R | I | C |
| SC - System Protection | A | C | R | C | R | R | C | I |
| SI - System Integrity | A | C | R | C | C | R | C | I |

---



**Required Training:**
- Security Awareness Training (annual)
- FedRAMP Overview Training (annual)
- Privacy Training (annual)
- Incident Response Basics (annual)

**Duration:** 4-6 hours annually

---


**ISSO:**
- FedRAMP ISSO Training (initial + annual refresher)
- NIST 800-53 Controls Training
- Continuous Monitoring Training
- POA&M Management Training

**Cloud Infrastructure Manager:**
- AWS Security Best Practices (annual)
- AWS GovCloud Training (initial)
- Disaster Recovery Training (annual)

**DevSecOps Lead:**
- Secure Coding Training (annual)
- OWASP Top 10 Training (annual)
- Application Security Testing (annual)

**Incident Response Commander:**
- Advanced Incident Response Training (annual)
- Federal Incident Reporting Training (initial)
- Forensics Training (biennial)

---


**Primary Roles with Backup:**

| Primary Role | Backup Role | Cross-Training Required |
|--------------|-------------|-------------------------|
| ISSO | Compliance Manager | Yes - 40 hours |
| Cloud Infrastructure Manager | DevSecOps Lead | Yes - 80 hours |
| DevSecOps Lead | Cloud Infrastructure Manager | Yes - 80 hours |
| Incident Response Commander | ISSO | Yes - 40 hours |
| Compliance Manager | ISSO | Yes - 40 hours |

**Succession Plan Review:** Annually or upon role changes

---



**ISSO → CISO:**
- Security incidents summary
- Critical vulnerabilities
- POA&M status updates

---


**ISSO → FedRAMP PMO:**
- Continuous monitoring deliverables
- Vulnerability scan results
- POA&M updates
- Significant changes

**ISSO → CISO:**
- Security metrics dashboard
- Compliance status report
- Risk summary

---


**CISO → ATO Sponsor:**
- Quarterly security posture review
- Risk assessment updates
- Compliance status
- Significant changes

**All Roles:**
- Quarterly team meeting
- Control testing results review
- Lessons learned discussion

---


**ISSO → FedRAMP PMO:**
- Annual assessment results
- Updated SSP
- Updated POA&M
- Significant changes summary

**CISO → Executive Leadership:**
- Annual security program review
- FedRAMP authorization status
- Budget requirements
- Strategic initiatives

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | ISSO | Initial roles and responsibilities |

**Review Schedule:** Annually or upon organizational changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

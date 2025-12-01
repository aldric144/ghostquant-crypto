# SOC 2 Roles and Responsibilities

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only  
**Owner:** Chief Information Security Officer (CISO)

---


This document defines roles and responsibilities for SOC 2 compliance within GhostQuant™. Each role is mapped to specific Trust Service Criteria (TSC) requirements using a RACI matrix (Responsible, Accountable, Consulted, Informed).

---


**Primary Responsibility:** Day-to-day system operations, maintenance, and availability

**Key Responsibilities:**
- System monitoring and performance optimization
- Incident response coordination
- Change management execution
- System documentation and configuration management
- User access provisioning and deprovisioning
- Backup and recovery operations

**SOC 2 TSC Mapping:** Security (CC6.2, CC6.7), Availability (CC7.1, CC7.2), Processing Integrity (CC8.3)

---

**Primary Responsibility:** Security program leadership and compliance oversight

**Key Responsibilities:**
- Security strategy and policy development
- Risk management and assessment
- Security incident response leadership
- Compliance program oversight
- Security awareness training program
- Third-party security assessments

**SOC 2 TSC Mapping:** Security (CC6.1-CC6.8), Confidentiality (CC7.5-CC7.7), Privacy (CC9.1-CC9.8)

---

**Primary Responsibility:** Secure software development lifecycle and infrastructure automation

**Key Responsibilities:**
- CI/CD pipeline security
- Infrastructure as Code (IaC) development
- Security testing automation
- Vulnerability management
- Container and cloud security
- Secure coding practices

**SOC 2 TSC Mapping:** Security (CC6.2, CC6.8), Processing Integrity (CC8.4)

---

**Primary Responsibility:** Security incident response coordination and execution

**Key Responsibilities:**
- Incident detection and triage
- Incident response team coordination
- Forensic analysis and evidence preservation
- Post-incident analysis and lessons learned
- Incident communication and reporting
- Incident response procedure updates

**SOC 2 TSC Mapping:** Security (CC6.4), Availability (CC7.2)

---

**Primary Responsibility:** Compliance program management and regulatory adherence

**Key Responsibilities:**
- SOC 2 audit coordination
- Control testing and evidence collection
- Compliance training program
- Regulatory requirement tracking
- Audit findings remediation
- Compliance reporting

**SOC 2 TSC Mapping:** All TSC (oversight and coordination)

---

**Primary Responsibility:** ML model development, training, monitoring, and accuracy

**Key Responsibilities:**
- ML model development and training
- Model performance monitoring
- Data quality and feature engineering
- Model accuracy validation
- Bias detection and mitigation
- Model documentation and versioning

**SOC 2 TSC Mapping:** Processing Integrity (CC8.1, CC8.2)

---

**Primary Responsibility:** AWS infrastructure management, optimization, and disaster recovery

**Key Responsibilities:**
- Cloud infrastructure provisioning
- Network architecture and security
- Disaster recovery planning and testing
- Capacity planning and optimization
- Cost management and optimization
- Infrastructure monitoring and alerting

**SOC 2 TSC Mapping:** Security (CC6.6), Availability (CC7.1, CC7.2, CC7.3, CC7.4), Confidentiality (CC7.7)

---

**Primary Responsibility:** Privacy compliance and data subject rights

**Key Responsibilities:**
- Privacy policy development and maintenance
- Data protection impact assessments (DPIAs)
- Data subject rights management
- Privacy breach notification
- Privacy training program
- Privacy compliance monitoring

**SOC 2 TSC Mapping:** Privacy (CC9.1-CC9.8), Confidentiality (CC7.5, CC7.6)

---

**Primary Responsibility:** Data quality, classification, and lifecycle management

**Key Responsibilities:**
- Data classification framework
- Data quality monitoring
- Data retention and disposal
- Data masking and anonymization
- Data access controls
- Data documentation and metadata

**SOC 2 TSC Mapping:** Confidentiality (CC7.5, CC7.6), Processing Integrity (CC8.1), Privacy (CC9.3, CC9.4, CC9.7)

---


- **R (Responsible):** Performs the work
- **A (Accountable):** Ultimate accountability, approves work
- **C (Consulted):** Provides input and expertise
- **I (Informed):** Kept informed of progress

---


| Control | System Owner | CISO | DevSecOps | IR Commander | Compliance | AI Officer | Cloud Mgr | DPO | Data Steward |
|---------|--------------|------|-----------|--------------|------------|------------|-----------|-----|--------------|
| CC6.1 - Logical & Physical Access | R | A | C | I | I | - | R | C | C |
| CC6.2 - System Operations | A | C | R | I | I | - | R | - | - |
| CC6.3 - Risk Mitigation | R | A | C | C | C | - | C | C | C |
| CC6.4 - Threat Detection | R | A | C | A | I | C | C | - | - |
| CC6.5 - Security Awareness | R | A | C | C | A | - | C | C | C |
| CC6.6 - Security Measures | R | A | R | C | I | - | A | C | C |
| CC6.7 - System Monitoring | A | C | R | C | I | C | R | - | - |
| CC6.8 - Change Management | R | C | A | I | C | - | C | - | - |

---


| Control | System Owner | CISO | DevSecOps | IR Commander | Compliance | AI Officer | Cloud Mgr | DPO | Data Steward |
|---------|--------------|------|-----------|--------------|------------|------------|-----------|-----|--------------|
| CC7.1 - System Availability | R | C | C | I | I | - | A | - | - |
| CC7.2 - System Recovery | R | C | C | A | I | - | A | - | - |
| CC7.3 - Capacity Planning | R | C | C | - | I | - | A | - | - |
| CC7.4 - Environmental Protections | C | C | C | - | I | - | A | - | - |

---


| Control | System Owner | CISO | DevSecOps | IR Commander | Compliance | AI Officer | Cloud Mgr | DPO | Data Steward |
|---------|--------------|------|-----------|--------------|------------|------------|-----------|-----|--------------|
| CC7.5 - Confidential Info Protection | R | A | C | C | I | - | R | C | A |
| CC7.6 - Confidential Info Disposal | R | C | C | - | I | - | C | C | A |
| CC7.7 - Confidential Info Transmission | R | A | R | C | I | - | A | C | C |

---


| Control | System Owner | CISO | DevSecOps | IR Commander | Compliance | AI Officer | Cloud Mgr | DPO | Data Steward |
|---------|--------------|------|-----------|--------------|------------|------------|-----------|-----|--------------|
| CC8.1 - Processing Integrity Controls | R | C | C | - | I | A | C | - | R |
| CC8.2 - Processing Completeness | R | C | C | - | I | A | C | - | R |
| CC8.3 - Processing Authorization | A | C | C | - | I | C | C | - | R |
| CC8.4 - Error Handling | R | C | A | C | I | C | C | - | - |

---


| Control | System Owner | CISO | DevSecOps | IR Commander | Compliance | AI Officer | Cloud Mgr | DPO | Data Steward |
|---------|--------------|------|-----------|--------------|------------|------------|-----------|-----|--------------|
| CC9.1 - Privacy Notice | R | C | - | - | C | - | - | A | C |
| CC9.2 - Choice & Consent | R | C | - | - | C | - | - | A | C |
| CC9.3 - Collection | R | C | - | - | C | - | - | A | A |
| CC9.4 - Use, Retention, Disposal | R | C | - | - | C | - | - | A | A |
| CC9.5 - Access | R | C | - | - | C | - | - | A | C |
| CC9.6 - Disclosure & Notification | R | A | - | C | C | - | - | A | C |
| CC9.7 - Quality | R | C | - | - | C | - | - | C | A |
| CC9.8 - Monitoring & Enforcement | R | A | - | C | A | - | - | A | C |

---


1. **Detection:** System Owner, DevSecOps Lead, or automated monitoring
2. **Triage:** Incident Response Commander
3. **Escalation:** CISO (HIGH/CRITICAL), CTO (CRITICAL)
4. **Communication:** Compliance Officer (regulatory), DPO (privacy breach)

1. **Detection:** System Owner, Cloud Infrastructure Manager, or monitoring
2. **Response:** System Owner (primary), Cloud Infrastructure Manager (infrastructure)
3. **Escalation:** CTO (>1 hour outage), CISO (security-related)
4. **Communication:** Compliance Officer (SLA breach)

1. **Detection:** Compliance Officer, auditors, or automated controls
2. **Assessment:** Compliance Officer, CISO
3. **Remediation:** Responsible role per RACI matrix
4. **Escalation:** CTO, CEO (material findings)

1. **Detection:** DPO, System Owner, or user reports
2. **Assessment:** DPO, CISO
3. **Response:** DPO (primary), Incident Response Commander (security-related)
4. **Notification:** DPO (data subjects, regulators), Compliance Officer (documentation)

---



| Role | Annual Training Hours | Required Certifications | Recommended Certifications |
|------|----------------------|------------------------|---------------------------|
| System Owner | 24 | - | ITIL, AWS Solutions Architect |
| CISO | 40 | CISSP or CISM | CCSP, CRISC |
| DevSecOps Lead | 32 | - | AWS Security Specialty, CSSLP |
| IR Commander | 24 | - | GCIH, GCFA, CEH |
| Compliance Officer | 24 | - | CISA, CRISC, ISO 27001 Lead Auditor |
| AI Integrity Officer | 24 | - | AWS ML Specialty, TensorFlow Cert |
| Cloud Infrastructure Manager | 24 | AWS Solutions Architect | AWS Advanced Networking |
| DPO | 24 | CIPP/US or CIPM | CIPT, FIP |
| Data Steward | 16 | - | CDMP, DGSP |

- **Security Awareness:** Annual, required within 30 days of hire
- **SOC 2 Training:** Annual for all personnel with system access
- **Privacy Training:** Annual for all personnel handling personal data
- **Phishing Simulation:** Quarterly exercises

---



**System Owner:**
- System uptime: ≥99.9%
- Mean Time To Repair (MTTR): <1 hour
- Change success rate: ≥95%

**CISO:**
- Security incidents: Trend downward
- Audit findings: <5 material findings per year
- Security training completion: 100%

**DevSecOps Lead:**
- Vulnerability remediation time: <7 days (critical), <30 days (high)
- CI/CD pipeline security scan coverage: 100%
- Infrastructure as Code coverage: ≥90%

**Incident Response Commander:**
- Incident response time: <15 minutes (CRITICAL), <1 hour (HIGH)
- Post-incident reports: 100% within 7 days
- Incident response drill frequency: Quarterly

**Compliance Officer:**
- Audit readiness: 100%
- Control testing completion: 100% quarterly
- Compliance training completion: 100%

**AI Integrity Officer:**
- Model accuracy: ≥95% (Prediction Engine)
- Model retraining frequency: Monthly
- Data quality score: ≥90%

**Cloud Infrastructure Manager:**
- Infrastructure availability: ≥99.9%
- DR test success rate: 100%
- Cost optimization: 10% annual reduction

**DPO:**
- Privacy request response time: <30 days
- Privacy breach notification: <72 hours (GDPR)
- Privacy training completion: 100%

**Data Steward:**
- Data quality score: ≥90%
- Data classification coverage: 100%
- Data retention compliance: 100%

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | CISO | Initial release |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026  
**Approval:** Chief Information Security Officer

---

**END OF DOCUMENT**

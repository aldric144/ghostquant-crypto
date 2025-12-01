# FedRAMP Audit Evidence Requirements

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This document defines the audit evidence requirements for GhostQuant™ FedRAMP authorization, organized by control family. It specifies what evidence must be collected, maintained, and provided to assessors to demonstrate compliance with FedRAMP Low-Impact Baseline controls.

---


1. **Comprehensive:** Evidence must cover all aspects of control implementation
2. **Current:** Evidence must reflect current system state (within 30 days)
3. **Authentic:** Evidence must be verifiable and tamper-proof
4. **Organized:** Evidence must be well-organized and easily accessible
5. **Retained:** Evidence must be retained per FedRAMP requirements (minimum 3 years)

---



**AC-1: Access Control Policy and Procedures**
- Access Control Policy document (signed and dated)
- Access control procedures documentation
- Policy review and approval records
- Training materials and attendance records
- Annual policy review documentation

**AC-2: Account Management**
- Account provisioning procedures
- Account deprovisioning procedures
- Quarterly access review reports (last 4 quarters)
- Account creation/modification/deletion logs from Genesis Archive™
- Inactive account reports (>90 days)
- Privileged account inventory

**AC-3: Access Enforcement**
- RBAC configuration documentation
- Role definitions and permissions matrix
- Authorization logs from Genesis Archive™
- Access denial logs (failed authorization attempts)
- Code snippets showing authorization enforcement
- API authorization testing results

**AC-7: Unsuccessful Logon Attempts**
- Account lockout configuration (screenshots)
- Failed authentication logs from Genesis Archive™
- Account lockout logs
- Lockout policy documentation
- Testing evidence (failed login attempts)

**AC-8: System Use Notification**
- System use notification banner (screenshot)
- Banner text documentation
- Legal approval for banner language
- User acknowledgment records
- Login page screenshots

**AC-14: Permitted Actions Without Authentication**
- Unauthenticated access documentation
- Public endpoint inventory
- Access control configuration for public endpoints
- Testing evidence (unauthenticated access attempts)

**AC-17: Remote Access**
- Remote access policy
- VPN configuration documentation
- MFA configuration for remote access
- Remote access logs from Genesis Archive™
- VPN connection logs
- Remote access approval records

**AC-18: Wireless Access**
- Wireless access policy
- MDM (Mobile Device Management) configuration
- Wireless network inventory (if applicable)
- MDM enrollment records
- Wireless security configuration

**AC-19: Access Control for Mobile Devices**
- Mobile device policy
- MDM configuration (encryption, remote wipe)
- Mobile device inventory
- MDM enrollment records
- Mobile device security testing results

**AC-20: Use of External Information Systems**
- External system policy
- Approved external system list
- External system security assessments
- Interconnection security agreements (ISAs)
- External system monitoring logs

**AC-22: Publicly Accessible Content**
- Content management policy
- Content approval workflow documentation
- Content change logs
- Designated content administrator list
- Content review records

---


**AU-1: Audit and Accountability Policy**
- Audit and accountability policy (signed and dated)
- Genesis Archive™ configuration documentation
- Audit retention policy (7-year retention)
- Policy review and approval records

**AU-2: Audit Events**
- Comprehensive audit event list
- Event logging configuration
- Genesis Archive™ event catalog
- Sample audit logs showing all event types

**AU-3: Content of Audit Records**
- Audit record format documentation
- Sample audit logs showing required fields
- Timestamp format documentation (UTC milliseconds)
- User identity format documentation

**AU-4: Audit Storage Capacity**
- Storage capacity monitoring configuration
- Storage auto-scaling configuration
- Capacity threshold alerts (80%)
- Storage capacity reports (last 6 months)

**AU-5: Response to Audit Processing Failures**
- Audit failure alerting configuration
- Redundant logging configuration
- Audit failure response procedures
- Audit failure incident logs (if any)

**AU-6: Audit Review, Analysis, and Reporting**
- Audit review procedures
- UltraFusion AI™ analysis configuration
- Daily audit review records (last 30 days)
- Weekly audit reports (last 12 weeks)
- Anomaly detection alerts

**AU-8: Time Stamps**
- NTP configuration documentation
- Time synchronization logs
- Genesis Archive™ timestamp integrity verification
- Time source documentation

**AU-9: Protection of Audit Information**
- Genesis Archive™ cryptographic chaining documentation
- Audit log encryption configuration
- Audit log access controls
- Audit log integrity verification results

**AU-11: Audit Record Retention**
- 7-year retention policy documentation
- Genesis Archive™ retention configuration
- Audit log retention reports
- Archived audit log inventory

**AU-12: Audit Generation**
- Audit generation configuration (all components)
- Real-time log transmission configuration
- Audit generation performance metrics
- Sample logs from all system components

---


**CM-1: Configuration Management Policy**
- Configuration management policy (signed and dated)
- Change control procedures
- Configuration baseline documentation
- Policy review and approval records

**CM-2: Baseline Configuration**
- Terraform Infrastructure as Code (IaC) templates
- Configuration baseline documentation (all components)
- Version control repository (Git)
- Baseline review and approval records

**CM-4: Security Impact Analysis**
- Security impact analysis procedures
- Sample security impact analyses (last 10 changes)
- Risk assessment documentation for changes
- Automated testing results for changes

**CM-5: Access Restrictions for Change**
- Change access control configuration
- RBAC for change management
- Separation of duties documentation
- Change approval workflow documentation
- Change approval records (last 6 months)

**CM-6: Configuration Settings**
- Security configuration guides (all components)
- AWS Config compliance reports
- Configuration drift detection reports
- Automated compliance checking results

**CM-7: Least Functionality**
- Service inventory (enabled services)
- Disabled services documentation
- Unnecessary ports/protocols documentation
- Least functionality review records (quarterly)

**CM-8: Information System Component Inventory**
- Complete asset inventory (hardware, software, data)
- Automated asset discovery configuration
- Quarterly inventory verification records
- CMDB (Configuration Management Database) exports

**CM-10: Software Usage Restrictions**
- Software license management policy
- License inventory
- Open source compliance reports
- Software usage audit records

**CM-11: User-Installed Software**
- Software installation policy
- Approved software list
- Software installation restrictions configuration
- Software installation monitoring logs

---


**CP-1: Contingency Planning Policy**
- Contingency planning policy (signed and dated)
- Business Impact Analysis (BIA)
- RTO (1 hour) and RPO (4 hours) documentation
- Policy review and approval records

**CP-2: Contingency Plan**
- Information System Contingency Plan (ISCP)
- Disaster recovery procedures
- Multi-region replication configuration
- Automated failover configuration

**CP-3: Contingency Training**
- Contingency training materials
- Training attendance records (annual)
- Role-specific training documentation
- Tabletop exercise records

**CP-4: Contingency Plan Testing**
- Annual contingency plan test report
- Quarterly tabletop exercise records
- Semi-annual technical test results
- Test plan documentation

**CP-6: Alternate Storage Site**
- Multi-region replication configuration (US-East/US-West)
- Backup procedures documentation
- Replication monitoring logs
- Backup integrity verification results

**CP-7: Alternate Processing Site**
- Multi-AZ deployment configuration
- Automated failover configuration
- Load balancing configuration
- Failover testing results

**CP-8: Telecommunications Services**
- Network architecture documentation
- Multiple ISP configuration
- Diverse network paths documentation
- Network failover configuration

**CP-9: Information System Backup**
- Automated backup configuration
- Daily backup logs (last 90 days)
- Real-time replication configuration
- Backup integrity verification results

**CP-10: Information System Recovery**
- Recovery procedures documentation
- Terraform IaC for automated recovery
- Recovery testing results (annual)
- Recovery verification procedures

---


**IA-1: IA Policy and Procedures**
- Identification and authentication policy (signed and dated)
- MFA requirements documentation
- Password policy documentation
- Policy review and approval records

**IA-2: Identification and Authentication**
- User account configuration documentation
- MFA implementation documentation
- SAML/OIDC integration configuration
- Authentication logs from Genesis Archive™

**IA-4: Identifier Management**
- Identifier assignment procedures
- Unique identifier enforcement documentation
- Identifier lifecycle management procedures
- Identifier reuse prevention configuration

**IA-5: Authenticator Management**
- Password policy configuration (12+ characters)
- Password expiration configuration (90 days for privileged)
- MFA token management procedures
- Authenticator management logs

**IA-6: Authenticator Feedback**
- Password masking configuration (screenshots)
- Error message standards documentation
- Limited feedback configuration
- UI security testing results

**IA-7: Cryptographic Module Authentication**
- FIPS 140-2 certificates
- HSM configuration documentation
- Cryptographic module inventory
- Key authorization procedures

**IA-8: IA (Non-Organizational Users)**
- Federated identity configuration
- API key authentication documentation
- Guest access procedures
- External user authentication logs

---


**IR-1: Incident Response Policy**
- Incident response policy (signed and dated)
- Incident classification levels
- IR team roles and responsibilities
- Policy review and approval records

**IR-2: Incident Response Training**
- IR training materials
- Annual training attendance records
- Specialized IR team training records
- Tabletop exercise records

**IR-4: Incident Handling**
- Incident response procedures
- 24/7 capability documentation
- Sentinel Console™ detection configuration
- Incident tracking system documentation
- Incident records (last 12 months)

**IR-5: Incident Monitoring**
- Incident tracking system configuration
- Real-time incident dashboard (screenshots)
- Incident trend analysis reports
- Incident monitoring logs

**IR-6: Incident Reporting**
- Incident reporting procedures
- Reporting channels documentation
- Anonymous reporting capability
- Escalation procedures
- Incident reports (last 12 months)

**IR-7: Incident Response Assistance**
- IR team documentation
- External support contracts
- 24/7 availability procedures
- IR team contact information

**IR-8: Incident Response Plan**
- Incident Response Plan document
- Incident classification procedures
- Communication plan
- Evidence collection procedures

---


**MA-1: System Maintenance Policy**
- System maintenance policy (signed and dated)
- Scheduled maintenance procedures
- Emergency maintenance procedures
- Policy review and approval records

**MA-2: Controlled Maintenance**
- Maintenance schedule documentation
- Maintenance change control records
- Maintenance documentation (last 12 months)
- Maintenance testing results

**MA-4: Nonlocal Maintenance**
- Remote maintenance procedures
- Remote maintenance approval records
- MFA configuration for remote maintenance
- Remote maintenance session logs

**MA-5: Maintenance Personnel**
- Maintenance personnel screening records
- Authorization procedures
- Escort requirements documentation
- Maintenance personnel monitoring logs

**MA-6: Timely Maintenance**
- Vendor SLA documentation
- Spare parts inventory (if applicable)
- Response time requirements
- Maintenance response time metrics

---


**MP-1: Media Protection Policy**
- Media protection policy (signed and dated)
- Media handling procedures
- Media sanitization procedures
- Media disposal procedures

**MP-2: Media Access**
- Media access controls configuration
- Media authorization procedures
- Physical security for media
- Media checkout logs

**MP-6: Media Sanitization**
- NIST SP 800-88 compliance documentation
- Cryptographic erasure procedures
- Physical destruction procedures
- Certificates of destruction

**MP-7: Media Use**
- Portable media policy
- Approved device list
- Encryption requirements for portable media
- DLP (Data Loss Prevention) configuration

---


**All PE Controls (PE-1, PE-2, PE-3, PE-6, PE-8, PE-12, PE-13, PE-14, PE-15, PE-16)**
- AWS GovCloud FedRAMP authorization documentation
- AWS compliance documentation (SOC 2, ISO 27001)
- Customer Responsibility Matrix
- AWS physical security documentation
- Inheritance documentation

---


**PL-1: Security Planning Policy**
- Security planning policy (signed and dated)
- SSP development procedures
- Policy review and approval records

**PL-2: System Security Plan**
- This comprehensive System Security Plan (SSP)
- SSP review and approval records
- SSP update history

**PL-4: Rules of Behavior**
- Rules of Behavior document
- User acknowledgment records
- Training materials including Rules of Behavior
- Annual acknowledgment records

**PL-8: Information Security Architecture**
- Zero Trust architecture documentation
- Defense-in-depth documentation
- Security architecture diagrams
- Architecture review and approval records

---


**PS-1: Personnel Security Policy**
- Personnel security policy (signed and dated)
- Screening procedures
- Training requirements
- Policy review and approval records

**PS-2: Position Risk Designation**
- Position risk assessment methodology
- Position risk designations (all positions)
- Risk-based screening requirements
- Position risk review records

**PS-3: Personnel Screening**
- Background check procedures
- Background check records (anonymized)
- Employment verification procedures
- Reference check documentation

**PS-4: Personnel Termination**
- Termination procedures
- Automated account deactivation configuration
- Access revocation logs
- Exit interview documentation

**PS-5: Personnel Transfer**
- Transfer procedures
- Access review for transfers
- Role-based access adjustment records
- Recertification documentation

**PS-6: Access Agreements**
- Access agreement templates
- Non-disclosure agreements (NDAs)
- User acknowledgment records
- Signature records

**PS-7: Third-Party Personnel Security**
- Third-party security requirements
- Contractor screening procedures
- Third-party agreements
- Contractor monitoring logs

**PS-8: Personnel Sanctions**
- Sanctions policy
- Progressive discipline procedures
- Appeals process documentation
- Violation records (anonymized)

---


**RA-1: Risk Assessment Policy**
- Risk assessment policy (signed and dated)
- Risk assessment methodology (NIST SP 800-30)
- Policy review and approval records

**RA-3: Risk Assessment**
- Annual risk assessment reports (last 2 years)
- Threat and vulnerability analysis
- Risk mitigation plans
- Risk register

**RA-5: Vulnerability Scanning**
- Vulnerability scanning procedures
- Weekly scan results (last 12 weeks)
- Monthly web app testing results (last 12 months)
- Quarterly assessment results (last 4 quarters)
- Vulnerability remediation records

---


**SA-1: Acquisition Policy**
- Acquisition policy (signed and dated)
- Security requirements for acquisitions
- Policy review and approval records

**SA-2: Allocation of Resources**
- Security resource planning documentation
- Budget allocations for security
- Resource allocation records

**SA-3: System Development Life Cycle**
- Secure SDLC procedures
- Security integration in SDLC
- Code review procedures
- Security testing results

**SA-4: Acquisition Process**
- Contract security requirements
- Vendor security assessments
- Procurement records with security requirements

**SA-5: Information System Documentation**
- System documentation inventory
- Version control records
- Documentation review and approval records

**SA-9: External Information System Services**
- External provider security requirements
- Provider security assessments
- Service level agreements (SLAs)
- Provider monitoring logs

**SA-10: Developer Configuration Management**
- Developer CM procedures
- Version control configuration (Git)
- Configuration baseline documentation
- Version control logs

**SA-11: Developer Security Testing**
- Security testing procedures
- SAST (Static Application Security Testing) results
- DAST (Dynamic Application Security Testing) results
- Security testing reports

---


**SC-1: System Protection Policy**
- System protection policy (signed and dated)
- Encryption procedures
- Network security procedures
- Policy review and approval records

**SC-2: Application Partitioning**
- Architecture documentation showing separation
- RBAC configuration
- Network segmentation documentation
- Access control testing results

**SC-4: Information in Shared Resources**
- Multi-tenant isolation documentation
- Resource sanitization procedures
- Isolation testing results
- Memory/storage isolation configuration

**SC-5: Denial of Service Protection**
- AWS Shield configuration
- Rate limiting configuration
- Auto-scaling configuration
- DDoS protection monitoring logs

**SC-7: Boundary Protection**
- AWS WAF configuration
- Firewall rules documentation
- Security group configuration
- IDS/IPS configuration
- Traffic monitoring logs

**SC-8: Transmission Confidentiality**
- TLS 1.3 configuration (external)
- TLS 1.2+ configuration (internal)
- Certificate management procedures
- TLS configuration testing results

**SC-12: Cryptographic Key Management**
- AWS KMS configuration
- Key generation procedures
- Key rotation configuration (365 days)
- Key access controls
- Key lifecycle documentation

**SC-13: Cryptographic Protection**
- AES-256 encryption configuration (at rest)
- TLS 1.3 encryption configuration (in transit)
- FIPS 140-2 certificates
- Encryption testing results

**SC-15: Collaborative Computing Devices**
- Device usage policies
- Remote activation prevention configuration
- Device monitoring procedures
- Device configuration records

**SC-20: Secure Name/Address Resolution (Authoritative)**
- DNSSEC configuration
- DNS monitoring configuration
- DNS integrity verification logs

**SC-21: Secure Name/Address Resolution (Recursive)**
- Secure DNS resolver configuration
- Response validation configuration
- DNS cache protection configuration

**SC-22: Architecture for Name/Address Resolution**
- DNS architecture documentation
- Redundant DNS configuration
- Internal/external DNS separation
- DNS failover configuration

**SC-39: Process Isolation**
- Container-based isolation configuration
- OS process separation documentation
- Process isolation monitoring logs

---


**SI-1: System Integrity Policy**
- System integrity policy (signed and dated)
- Integrity verification procedures
- Integrity monitoring procedures
- Policy review and approval records

**SI-2: Flaw Remediation**
- Vulnerability scanning configuration
- Patch management procedures
- Patch testing procedures
- Vulnerability remediation records (last 12 months)

**SI-3: Malicious Code Protection**
- Anti-malware deployment documentation
- Real-time scanning configuration
- Signature update configuration
- Malware detection logs

**SI-4: Information System Monitoring**
- Sentinel Console™ configuration
- UltraFusion AI™ configuration
- SIEM configuration
- IDS/IPS configuration
- 24/7 monitoring procedures
- Monitoring logs (last 90 days)

**SI-5: Security Alerts and Advisories**
- Security alert subscriptions
- Threat intelligence feeds
- Response procedures for alerts
- Alert response records

**SI-7: Software/Firmware Integrity**
- File integrity monitoring (FIM) configuration
- Digital signature verification procedures
- Checksum verification procedures
- Integrity verification logs

**SI-8: Spam Protection**
- Email spam filtering configuration
- Anti-spam software documentation
- User training on spam/phishing
- Spam detection logs

**SI-10: Information Input Validation**
- Input validation procedures
- Pydantic schema documentation
- SQL injection prevention configuration
- XSS prevention configuration
- Input validation testing results

**SI-11: Error Handling**
- Secure error message procedures
- Error message standards
- Information disclosure prevention configuration
- Error logging configuration

**SI-12: Information Handling and Retention**
- Information handling policy
- Data classification procedures
- Retention policy (7 years for audit logs)
- Disposal procedures
- Retention enforcement records

---



```
/evidence/
├── policies/
│   ├── access_control_policy.pdf
│   ├── audit_accountability_policy.pdf
│   ├── configuration_management_policy.pdf
│   └── ...
├── procedures/
│   ├── account_management_procedures.pdf
│   ├── change_control_procedures.pdf
│   ├── incident_response_procedures.pdf
│   └── ...
├── configurations/
│   ├── aws_config_exports/
│   ├── terraform_templates/
│   ├── security_group_rules/
│   └── ...
├── logs/
│   ├── genesis_archive_samples/
│   ├── authentication_logs/
│   ├── authorization_logs/
│   └── ...
├── reports/
│   ├── vulnerability_scans/
│   ├── penetration_tests/
│   ├── control_testing/
│   └── ...
├── training/
│   ├── training_materials/
│   ├── attendance_records/
│   └── ...
└── assessments/
    ├── risk_assessments/
    ├── security_assessments/
    └── ...
```

---


**Retention Periods:**
- Policies and procedures: 7 years after superseded
- Audit logs: 7 years minimum (Genesis Archive™)
- Vulnerability scans: 3 years
- Penetration tests: 3 years
- Control testing results: 3 years
- Training records: 3 years after termination
- Incident records: 7 years
- Risk assessments: 3 years

**Storage Locations:**
- Primary: SharePoint document library (encrypted)
- Secondary: AWS S3 (encrypted with versioning)
- Audit logs: Genesis Archive™ (immutable)

---


**Access Levels:**
- **ISSO:** Full access to all evidence
- **CISO:** Full access to all evidence
- **Compliance Manager:** Full access to all evidence
- **3PAO Assessors:** Read-only access during assessment
- **Auditors:** Read-only access during audits
- **Other Personnel:** Role-based access as needed

**Access Logging:**
- All evidence access logged to Genesis Archive™
- Quarterly access reviews
- Unauthorized access alerts

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | ISSO | Initial audit evidence requirements |

**Review Schedule:** Annually or upon control changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

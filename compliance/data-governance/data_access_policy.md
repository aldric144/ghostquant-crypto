# Data Access Policy

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---


This policy establishes access control requirements for all GhostQuant™ data and systems, ensuring that access is granted based on business need, least privilege, and appropriate authorization.

---



**Definition:** Access permissions assigned based on user roles

**Implementation:**
- Users assigned to one or more roles
- Roles have predefined permissions
- Permissions grant access to specific data and functions
- Role assignments reviewed quarterly

**GhostQuant™ Roles:** See Section 4

---


**Definition:** Access decisions based on attributes (user, resource, environment)

**Attributes:**
- User attributes: Role, department, clearance level
- Resource attributes: Classification, sensitivity, owner
- Environmental attributes: Time, location, device

**Use Cases:**
- Time-based access restrictions
- Location-based access (office vs. remote)
- Device-based access (managed vs. unmanaged)

---


**Definition:** Users granted minimum access necessary for job functions

**Implementation:**
- Default deny (no access unless explicitly granted)
- Just-in-time access provisioning
- Temporary elevated access for specific tasks
- Regular access reviews and revocation

---



**Required For:**
- All user accounts
- All administrative access
- All remote access
- All access to Class 3 and Class 4 data

**MFA Methods:**
- Hardware tokens (YubiKey)
- Authenticator apps (Google Authenticator, Authy)
- Biometric authentication (for highest sensitivity)
- SMS (backup only, not primary)

---


**Complexity:**
- Minimum 14 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- No personal information

**Rotation:**
- Every 90 days for standard users
- Every 60 days for privileged users
- Immediate change if compromised

**Storage:**
- Password manager required
- No password reuse
- No sharing of passwords

---



**Responsibilities:**
- Overall system accountability
- Strategic direction
- Budget and resources
- Regulatory compliance

**Access:**
- Full administrative access
- All data (Class 1-4)
- All systems and engines
- Genesis Archive™ (read-only)

**Approval:** CEO

---


**Responsibilities:**
- Security architecture
- Security controls implementation
- Vulnerability management
- Incident response

**Access:**
- Security systems (firewalls, IDS/IPS, SIEM)
- System logs
- Security configurations
- Genesis Archive™ (read-only)

**Approval:** CISO

---


**Responsibilities:**
- Regulatory compliance
- Policy enforcement
- Audit coordination
- Training oversight

**Access:**
- Compliance data (Class 3-4)
- Audit logs
- Investigation files
- SAR repository
- Genesis Archive™ (read-only)

**Approval:** Chief Compliance Officer

---


**Responsibilities:**
- Intelligence analysis
- Risk assessment
- Report generation
- Dashboard monitoring

**Access:**
- Intelligence data (Class 3)
- Sentinel Console™
- UltraFusion AI™ outputs
- All 8 engine outputs (read-only)
- Genesis Archive™ (read-only for own actions)

**Approval:** Manager

---


**Responsibilities:**
- AML investigations
- Case management
- Evidence collection
- SAR preparation

**Access:**
- Investigation data (Class 3-4)
- Case management system
- All 8 engine outputs
- Customer KYC data
- Transaction data
- Genesis Archive™ (read-only)

**Approval:** AML Officer

---


**Responsibilities:**
- System administration
- User management
- Backup and recovery
- Performance monitoring

**Access:**
- System administration functions
- User accounts
- Database administration
- Backup systems
- Genesis Archive™ (read-only)

**Approval:** CTO

---


**Responsibilities:**
- Application development
- Bug fixes
- Feature implementation
- Code deployment

**Access:**
- Development environments
- Test data only (no production data)
- Code repositories
- CI/CD systems
- Genesis Archive™ (no access)

**Approval:** Engineering Manager

---


**Responsibilities:**
- Internal audits
- Compliance testing
- Control effectiveness assessment
- Audit reporting

**Access:**
- All systems (read-only)
- All data (Class 1-4, read-only)
- Audit logs
- Genesis Archive™ (read-only)
- Temporary elevated access for testing

**Approval:** Chief Audit Executive

---



**Methods:**
- API keys (rotated every 90 days)
- OAuth 2.0 tokens
- Mutual TLS (mTLS)

**Authorization:**
- Scope-based permissions
- Rate limiting
- IP whitelisting

---


**Application Accounts:**
- Dedicated service accounts
- Minimum required permissions
- Connection pooling
- Encrypted connections (TLS 1.3)

**No Direct Access:**
- Applications do not use personal accounts
- No shared credentials

---



**Process:**
1. User submits access request form
2. Manager reviews and approves
3. Data Owner reviews and approves
4. Security reviews
5. Access provisioned
6. User notified
7. Logged in Genesis Archive™

**SLA:** 2 business days

---


**Process:**
1. User submits request with justification
2. Manager approves
3. Data Owner approves
4. Security Officer approves
5. Time-limited access granted
6. Access automatically revoked after period
7. Logged in Genesis Archive™

**SLA:** 4 hours for urgent, 1 business day for standard

---



**Triggers:**
- Termination
- Resignation
- Security incident
- Policy violation
- Suspicious activity

**Process:**
1. HR or Security notifies IT
2. All access revoked within 1 hour
3. Devices collected
4. Passwords reset
5. Logged in Genesis Archive™

---


**Frequency:** Quarterly

**Process:**
1. Generate access reports
2. Managers review team access
3. Identify unnecessary access
4. Revoke excess access
5. Document review
6. Log in Genesis Archive™

---



**Prohibited Combinations:**
- Developer + Administrator (production)
- Investigator + Subject of investigation
- Auditor + Auditee
- Security + Compliance (certain functions)

---


**Required For:**
- SAR filing
- Encryption key access (emergency)
- Production database changes
- Security configuration changes
- User access to Class 4 data

---



**All Access Events:**
- User login/logout
- Data access (read, write, delete)
- Permission changes
- Configuration changes
- Failed access attempts
- Privilege escalation

**Log Contents:**
- Timestamp (UTC)
- User ID
- Action
- Resource accessed
- Source IP
- Result (success/failure)
- SHA-256 hash

---


**Retention Period:** 5 years minimum

**Storage:** Genesis Archive™ (immutable)

**Access:** Auditors, Security, Compliance (read-only)

---



**Mandatory For:**
- All remote access
- All access from unmanaged devices
- All access to Class 3-4 data

**VPN Configuration:**
- Strong encryption (AES-256)
- MFA required
- Split tunneling disabled
- Kill switch enabled

---


**Managed Devices:**
- Company-issued devices
- Endpoint protection installed
- Full disk encryption
- Automatic updates
- Remote wipe capability

**Unmanaged Devices:**
- Limited access only
- Virtual desktop infrastructure (VDI)
- No data download
- Session recording

---


| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial data access policy |

**Review Schedule:** Annually or upon security changes  
**Next Review Date:** December 2026

---

**END OF DOCUMENT**

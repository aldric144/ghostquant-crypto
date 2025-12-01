# RBAC Matrix
## GhostQuant™ Cryptocurrency Intelligence Platform

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Confidential - Internal Use Only

---

## Purpose

This document defines the comprehensive Role-Based Access Control (RBAC) matrix for GhostQuant™, mapping 45+ actions across 7 roles with explicit permissions (✔️ Allowed, ❌ Not Allowed, 🔒 Allowed with Approval).

---

## Role Definitions

**7 Roles**:
1. **Viewer**: Read-only access to dashboards and reports
2. **Analyst**: Intelligence analysis and investigation
3. **Senior Analyst**: Advanced analysis and export approval
4. **Admin**: System administration and user management
5. **SuperAdmin**: Highest-level administration (with Four-Eyes approval for destructive actions)
6. **System**: Machine identity for intelligence engines
7. **API**: External system integration

---

## RBAC Matrix

| # | Action | Viewer | Analyst | Senior Analyst | Admin | SuperAdmin | System | API |
|---|--------|--------|---------|----------------|-------|------------|--------|-----|
| **INTELLIGENCE VIEWING** |
| 1 | View public dashboards | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ✔️ |
| 2 | View intelligence reports | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ✔️ |
| 3 | View system status | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ✔️ |
| 4 | View Sentinel Console™ output | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 5 | View UltraFusion™ output | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 6 | View Hydra™ detection results | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 7 | View Constellation Map™ | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 8 | View Radar Heatmap™ | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 9 | View Actor Profiler™ output | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 10 | View Oracle Eye™ analysis | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 11 | View Cortex Memory™ patterns | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 12 | View GhostPredictor™ predictions | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| **INTELLIGENCE OPERATIONS** |
| 13 | Trigger prediction request | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 🔒 |
| 14 | Trigger UltraFusion™ analysis | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 🔒 |
| 15 | Trigger Hydra™ detection | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 🔒 |
| 16 | Export Constellation Map™ | ❌ | 🔒 | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 17 | Run Cortex™ pattern scan | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 🔒 |
| 18 | Generate intelligence report | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| 19 | Export intelligence data | ❌ | 🔒 | ✔️ | ✔️ | ✔️ | ❌ | 🔒 |
| **INVESTIGATION MANAGEMENT** |
| 20 | Create investigation | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| 21 | Modify investigation | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| 22 | Close investigation | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| 23 | Delete investigation | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ |
| 24 | Assign investigation | ❌ | ❌ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| **AUDIT & LOGGING** |
| 25 | View audit logs (own actions) | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| 26 | View audit logs (all actions) | ❌ | ❌ | 🔒 | ✔️ | ✔️ | ❌ | ❌ |
| 27 | Export audit logs | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ |
| 28 | View Genesis Archive™ (read) | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ |
| 29 | Write to Genesis Archive™ | ❌ | ❌ | ❌ | ❌ | ❌ | ✔️ | ❌ |
| 30 | Export Genesis Archive™ block | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ |
| **USER & ACCESS MANAGEMENT** |
| 31 | View user accounts | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 32 | Create user account | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 33 | Modify user account | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 34 | Disable user account | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 35 | Delete user account | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ |
| 36 | Assign role (Viewer/Analyst/Senior Analyst) | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 37 | Assign role (Admin) | ❌ | ❌ | ❌ | 🔒 | ✔️ | ❌ | ❌ |
| 38 | Assign role (SuperAdmin) | ❌ | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ |
| 39 | Reset user password | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 40 | Reset user MFA | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 41 | Unlock user account | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| **API & SECRET MANAGEMENT** |
| 42 | View API keys (own) | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ✔️ |
| 43 | View API keys (all) | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 44 | Create API key | ❌ | 🔒 | 🔒 | ✔️ | ✔️ | ❌ | ❌ |
| 45 | Revoke API key | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 46 | Manage secrets | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| **SYSTEM CONFIGURATION** |
| 47 | View system settings | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 48 | Modify system settings | ❌ | ❌ | ❌ | 🔒 | ✔️ | ❌ | ❌ |
| 49 | Modify intelligence engine config | ❌ | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ |
| 50 | Modify security controls | ❌ | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ |
| 51 | Override security policy | ❌ | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ |
| **DEPLOYMENT & UPDATES** |
| 52 | Deploy updates (non-production) | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 53 | Deploy updates (production) | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ |
| 54 | Rollback deployment | ❌ | ❌ | ❌ | 🔒 | ✔️ | ❌ | ❌ |
| **RAW DATA ACCESS** |
| 55 | Access raw event data | ❌ | 🔒 | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |
| 56 | Access raw blockchain data | ❌ | 🔒 | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |
| 57 | Access raw intelligence feeds | ❌ | ❌ | 🔒 | ✔️ | ✔️ | ✔️ | ❌ |
| **APPROVAL & PRIVILEGE** |
| 58 | Approve identity requests | ❌ | ❌ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| 59 | Approve data export requests | ❌ | ❌ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |
| 60 | Approve privilege elevation | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| 61 | Approve Four-Eyes actions | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |
| **TRAINING & MODEL MANAGEMENT** |
| 62 | Access training pipeline | ❌ | ❌ | ❌ | ✔️ | ✔️ | ✔️ | ❌ |
| 63 | Trigger model training | ❌ | ❌ | ❌ | 🔒 | ✔️ | ✔️ | ❌ |
| 64 | Deploy trained model | ❌ | ❌ | ❌ | 🔒 | 🔒 | ✔️ | ❌ |
| 65 | View model performance | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 🔒 |
| **EMERGENCY & BREAK-GLASS** |
| 66 | Access break-glass account | ❌ | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ |
| 67 | Emergency system access | ❌ | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ |
| 68 | Freeze user account | ❌ | ❌ | ❌ | ✔️ | ✔️ | ❌ | ❌ |

---

## Legend

| Symbol | Meaning | Description |
|--------|---------|-------------|
| ✔️ | **Allowed** | User can perform action without additional approval |
| ❌ | **Not Allowed** | User cannot perform action under any circumstances |
| 🔒 | **Allowed with Approval** | User can perform action only after receiving approval from authorized approver |

---

## Approval Requirements

### Actions Requiring Manager Approval

**Applicable Roles**: Analyst, Senior Analyst

**Actions**:
- Export intelligence data (Analyst only)
- Access raw event data (Analyst only)
- Create API key (Analyst, Senior Analyst)

**Approval Workflow**:
1. User submits request with justification
2. Manager reviews request
3. Manager approves or denies
4. If approved, user granted time-limited permission (1-8 hours)
5. Action logged with approver identity

---

### Actions Requiring Four-Eyes Approval

**Applicable Roles**: Admin, SuperAdmin

**Actions**:
- Delete user account
- Delete investigation
- Assign Admin role
- Assign SuperAdmin role
- Modify intelligence engine configuration
- Modify security controls
- Override security policy
- Deploy production updates
- Trigger model training
- Deploy trained model
- Access break-glass account
- Emergency system access

**Approval Workflow**:
1. User submits request with justification
2. Another user with same or higher role reviews request
3. Approver (different person) approves or denies
4. If approved, user granted time-limited permission (1 hour)
5. Action logged with approver identity

---

### Actions Requiring CISO Approval

**Applicable Roles**: SuperAdmin

**Actions**:
- Modify security controls
- Override security policy
- Access break-glass account
- Emergency system access

**Approval Workflow**:
1. SuperAdmin submits request with justification
2. CISO reviews request
3. CISO approves or denies
4. If approved, SuperAdmin granted time-limited permission (1 hour)
5. Action logged with CISO identity

---

## Role-Specific Restrictions

### Viewer Restrictions

**Allowed**:
- View public dashboards
- View intelligence reports
- View system status

**Not Allowed**:
- Access intelligence engine outputs
- Create investigations
- Export data
- Access audit logs
- Manage users
- Modify system settings

**Use Cases**:
- Business stakeholders
- Executives
- External auditors (limited scope)

---

### Analyst Restrictions

**Allowed**:
- All Viewer permissions
- View intelligence engine outputs
- Create and manage investigations
- Generate intelligence reports
- Request data exports (with approval)
- Access raw event data (with approval)

**Not Allowed**:
- Approve data exports
- Access Genesis Archive™
- Manage user accounts
- Modify system settings
- Deploy updates

**Use Cases**:
- Intelligence analysts
- Fraud investigators
- Compliance analysts

---

### Senior Analyst Restrictions

**Allowed**:
- All Analyst permissions
- Approve data export requests
- Access raw event data (without approval)
- Access Genesis Archive™ (with Four-Eyes approval)
- Approve identity requests
- Assign investigations

**Not Allowed**:
- Manage user accounts
- Modify system settings
- Deploy updates
- Modify intelligence engine configurations

**Use Cases**:
- Senior intelligence analysts
- Investigation managers
- Compliance officers

---

### Admin Restrictions

**Allowed**:
- All Senior Analyst permissions
- Manage user accounts (create, modify, disable)
- Assign roles (Viewer, Analyst, Senior Analyst)
- Manage API keys
- Manage secrets
- Modify system settings (with approval)
- Deploy non-production updates
- Approve privilege elevation

**Not Allowed**:
- Assign SuperAdmin role (requires Four-Eyes approval)
- Modify intelligence engine algorithms (requires Four-Eyes approval)
- Deploy production updates (requires Four-Eyes approval)
- Access break-glass accounts

**Use Cases**:
- System administrators
- DevOps engineers
- Security engineers

---

### SuperAdmin Restrictions

**Allowed**:
- All Admin permissions
- Assign Admin role
- Assign SuperAdmin role (with Four-Eyes approval)
- Modify intelligence engine algorithms (with Four-Eyes approval)
- Modify security controls (with Four-Eyes approval)
- Deploy production updates (with Four-Eyes approval)
- Access break-glass accounts (with CISO approval)
- Emergency system access (with CISO approval)

**Not Allowed**:
- Disable audit logging
- Delete Genesis Archive™ blocks
- Modify own audit logs
- Bypass Four-Eyes approval

**Use Cases**:
- CISO
- CTO
- Designated emergency responders

---

### System Restrictions

**Allowed**:
- Write to Genesis Archive™
- Trigger intelligence operations
- Access training pipeline
- Deploy trained models
- Access raw data feeds

**Not Allowed**:
- Access user data
- Manage user accounts
- Modify system settings
- Perform administrative actions

**Use Cases**:
- Sentinel Command Console™
- UltraFusion™
- Operation Hydra™
- Global Constellation Map™
- Global Radar Heatmap™
- Actor Profiler™
- Oracle Eye™
- Cortex Memory™
- GhostPredictor™
- Genesis Archive™

---

### API Restrictions

**Allowed**:
- View public dashboards
- View intelligence reports
- View intelligence engine outputs (with API key scopes)
- Trigger intelligence operations (with API key scopes)
- View own API keys

**Not Allowed**:
- Access administrative functions
- Manage user accounts
- Modify system settings
- Access audit logs
- Access Genesis Archive™

**Use Cases**:
- External applications
- Third-party integrations
- Partner systems

---

## Toxic Combinations

**Toxic combinations** are role assignments that create conflicts of interest or excessive privilege concentration. The following combinations are prohibited:

### Prohibited Combinations

**Combination 1: Analyst + Admin**
- **Risk**: User can analyze intelligence and administer system, creating conflict of interest
- **Enforcement**: System prevents assignment of both roles to same user

**Combination 2: Senior Analyst + SuperAdmin**
- **Risk**: User can approve and execute sensitive actions, bypassing Four-Eyes control
- **Enforcement**: System prevents assignment of both roles to same user

**Combination 3: Auditor + System Administrator**
- **Risk**: User can audit and administer system, compromising audit independence
- **Enforcement**: System prevents assignment of both roles to same user

---

## Role Assignment Approval Matrix

| Requester Role | Can Assign Viewer | Can Assign Analyst | Can Assign Senior Analyst | Can Assign Admin | Can Assign SuperAdmin |
|----------------|-------------------|--------------------|-----------------------------|------------------|-----------------------|
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ |
| Analyst | ❌ | ❌ | ❌ | ❌ | ❌ |
| Senior Analyst | ❌ | ❌ | ❌ | ❌ | ❌ |
| Admin | ✔️ | ✔️ | ✔️ | 🔒 | ❌ |
| SuperAdmin | ✔️ | ✔️ | ✔️ | ✔️ | 🔒 |

---

## Compliance Mapping

### NIST 800-53 AC-3 (Access Enforcement)

**Control**: The information system enforces approved authorizations for logical access to information and system resources in accordance with applicable access control policies.

**GhostQuant™ Implementation**: RBAC matrix enforces role-based access control with explicit permissions for each action and role.

---

### NIST 800-53 AC-5 (Separation of Duties)

**Control**: The organization separates duties of individuals to reduce the risk of malevolent activity without collusion.

**GhostQuant™ Implementation**: Four-Eyes approval required for destructive actions, toxic combinations prevented, role assignment restrictions enforced.

---

### NIST 800-53 AC-6 (Least Privilege)

**Control**: The organization employs the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) which are necessary to accomplish assigned tasks in accordance with organizational missions and business functions.

**GhostQuant™ Implementation**: Each role granted minimum permissions required for job function, privilege elevation requires approval, time-limited access.

---

### SOC 2 CC6.3 (Logical Access)

**Criterion**: The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles, responsibilities, or the system design and changes.

**GhostQuant™ Implementation**: RBAC matrix defines role-based access, role assignment requires approval, quarterly recertification.

---

### FedRAMP AC-3 (Access Enforcement)

**Control**: The information system enforces approved authorizations for logical access to information and system resources.

**Baseline**: Moderate

**GhostQuant™ Implementation**: RBAC matrix enforced by Policy Decision Point (PDP) and Policy Enforcement Point (PEP), all access decisions logged.

---

## Cross-References

- **Identity Overview**: See identity_overview.md
- **Access Control Policy**: See access_control_policy.md
- **Zero-Trust Architecture**: See zero_trust_architecture.md
- **Privileged Access Management**: See privileged_access_management.md
- **IAM System Mapping**: See iam_system_mapping.md

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Chief Information Security Officer | Initial RBAC matrix |

**Review Schedule:** Quarterly  
**Next Review Date:** March 2026

---

**END OF DOCUMENT**

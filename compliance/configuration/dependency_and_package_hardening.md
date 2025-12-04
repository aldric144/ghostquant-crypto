# Dependency and Package Hardening

**Document ID**: GQ-CONFIG-005  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Information Security Officer  
**Review Cycle**: Quarterly

---

## 1. Purpose

This document establishes **Dependency and Package Hardening** requirements for **GhostQuant™**, defining **mandatory security requirements** for **Python** and **TypeScript** dependencies, including **SBOM creation**, **dependency version pinning**, **hash-checking**, **banned packages**, **vulnerability scanning**, **transitive dependency audits**, **approval workflows**, **update governance**, **risk scoring**, and **replacement processes**.

This document ensures compliance with:

- **NIST SP 800-53 SA-10** — Developer Configuration Management
- **NIST SP 800-53 RA-5** — Vulnerability Scanning
- **SOC 2 CC7.1** — Detection of Security Events
- **OpenSSF Best Practices** — Supply Chain Security
- **OWASP Top 10 2021 A06** — Vulnerable and Outdated Components

---

## 2. SBOM Creation

### 2.1 Software Bill of Materials (SBOM) Requirement

**ALL GhostQuant systems MUST maintain a Software Bill of Materials (SBOM)**.

**Requirement**: SBOM generated for every build, stored in Genesis Archive™

**SBOM Format**: CycloneDX or SPDX

### 2.2 SBOM Generation (Python)

**Python SBOM generation using CycloneDX**:

```bash
# Install cyclonedx-bom
pip install cyclonedx-bom

# Generate SBOM from requirements.txt
cyclonedx-py -r -i requirements.txt -o sbom.json

# Generate SBOM from Poetry
cyclonedx-py -r -i pyproject.toml -o sbom.json
```

**Example SBOM (CycloneDX JSON)**:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "metadata": {
    "timestamp": "2025-12-01T00:00:00Z",
    "component": {
      "type": "application",
      "name": "ghostquant",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "fastapi",
      "version": "0.104.1",
      "purl": "pkg:pypi/fastapi@0.104.1",
      "hashes": [
        {
          "alg": "SHA-256",
          "content": "abc123..."
        }
      ]
    }
  ]
}
```

### 2.3 SBOM Generation (TypeScript)

**TypeScript SBOM generation using CycloneDX**:

```bash
# Install @cyclonedx/cyclonedx-npm
npm install -g @cyclonedx/cyclonedx-npm

# Generate SBOM from package.json
cyclonedx-npm --output-file sbom.json
```

### 2.4 SBOM Storage

**SBOMs MUST be stored in Genesis Archive™**:

```python
# Python (Genesis Archive™ SBOM storage)
from genesis_archive import GenesisArchive
import json

genesis = GenesisArchive()

# Store SBOM
with open('sbom.json', 'r') as f:
    sbom = json.load(f)

genesis.store_sbom({
    "sbom": sbom,
    "build_id": "build-2025-12-01-001",
    "environment": "production",
    "timestamp": datetime.utcnow().isoformat()
})
```

### 2.5 SBOM Verification

**SBOMs MUST be verified for completeness**:

```bash
# Verify SBOM contains all dependencies
cyclonedx-cli validate --input-file sbom.json

# Verify SBOM hashes match installed packages
pip-audit --sbom sbom.json
```

---

## 3. Dependency Version Pinning

### 3.1 Version Pinning Requirement

**ALL dependencies MUST be pinned to specific versions**.

**Requirement**: No version ranges, no wildcards, exact versions only

### 3.2 Python Version Pinning

**Python dependencies pinned in requirements.txt**:

```txt
# requirements.txt (CORRECT - exact versions)
fastapi==0.104.1
pydantic==2.5.0
sqlalchemy==2.0.23
redis==5.0.1

# NOT ALLOWED: Version ranges
# fastapi>=0.104.0  # PROHIBITED
# pydantic~=2.5.0   # PROHIBITED
# sqlalchemy==2.*   # PROHIBITED
```

**Python dependencies pinned in Poetry**:

```toml
# pyproject.toml (CORRECT - exact versions)
[tool.poetry.dependencies]
python = "3.11.6"
fastapi = "0.104.1"
pydantic = "2.5.0"
sqlalchemy = "2.0.23"
redis = "5.0.1"
```

### 3.3 TypeScript Version Pinning

**TypeScript dependencies pinned in package.json**:

```json
{
  "dependencies": {
    "next": "14.0.3",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "typescript": "5.3.2",
    "@types/react": "18.2.42"
  }
}
```

**Lock file requirement**:

```bash
# Generate lock file (package-lock.json)
npm install

# Commit lock file to Git
git add package-lock.json
git commit -m "Add package-lock.json"
```

### 3.4 Version Pinning Verification

**Version pinning verified in CI/CD**:

```yaml
# GitHub Actions (version pinning verification)
name: Verify Version Pinning
on: [push]

jobs:
  verify-pinning:
    runs-on: ubuntu-latest
    steps:
      - name: Check Python version pinning
        run: |
          # Verify no version ranges in requirements.txt
          if grep -E '>=|~=|\*' requirements.txt; then
            echo "Version ranges found in requirements.txt"
            exit 1
          fi
      
      - name: Check TypeScript version pinning
        run: |
          # Verify package-lock.json exists
          if [ ! -f package-lock.json ]; then
            echo "package-lock.json not found"
            exit 1
          fi
```

---

## 4. Mandatory Hash-Checking

### 4.1 Hash-Checking Requirement

**ALL dependencies MUST be hash-checked during installation**.

**Requirement**: SHA-256 hashes verified for all packages

### 4.2 Python Hash-Checking

**Python hash-checking using pip**:

```txt
# requirements.txt with hashes
fastapi==0.104.1 \
    --hash=sha256:abc123... \
    --hash=sha256:def456...
pydantic==2.5.0 \
    --hash=sha256:ghi789... \
    --hash=sha256:jkl012...
```

**Generate hashes**:

```bash
# Generate hashes for requirements.txt
pip-compile --generate-hashes requirements.in -o requirements.txt
```

**Install with hash verification**:

```bash
# Install dependencies with hash verification
pip install --require-hashes -r requirements.txt
```

### 4.3 TypeScript Hash-Checking

**TypeScript hash-checking using npm**:

```bash
# Install dependencies with integrity checking
npm ci --integrity

# Verify package integrity
npm audit signatures
```

**package-lock.json contains hashes**:

```json
{
  "packages": {
    "node_modules/next": {
      "version": "14.0.3",
      "resolved": "https://registry.npmjs.org/next/-/next-14.0.3.tgz",
      "integrity": "sha512-abc123...",
      "dependencies": {...}
    }
  }
}
```

### 4.4 Hash-Checking Verification

**Hash-checking verified in CI/CD**:

```yaml
# GitHub Actions (hash-checking verification)
name: Verify Hash-Checking
on: [push]

jobs:
  verify-hashes:
    runs-on: ubuntu-latest
    steps:
      - name: Verify Python hashes
        run: |
          # Install with hash verification
          pip install --require-hashes -r requirements.txt
      
      - name: Verify TypeScript hashes
        run: |
          # Install with integrity checking
          npm ci --integrity
```

---

## 5. Banned Packages List

### 5.1 Banned Packages Requirement

**Banned packages MUST NOT be used in GhostQuant**.

**Requirement**: Automated scanning for banned packages in CI/CD

### 5.2 Python Banned Packages

**Python banned packages**:

| Package | Reason | Alternative |
|---------|--------|-------------|
| **pickle** | Arbitrary code execution vulnerability | Use `json` or `msgpack` |
| **eval()** | Arbitrary code execution vulnerability | Use `ast.literal_eval()` |
| **exec()** | Arbitrary code execution vulnerability | Refactor code to avoid dynamic execution |
| **os.system()** | Command injection vulnerability | Use `subprocess.run()` with shell=False |
| **yaml.load()** | Arbitrary code execution vulnerability | Use `yaml.safe_load()` |
| **requests** (without timeout) | Denial of service vulnerability | Use `requests` with timeout parameter |
| **md5** | Weak hash algorithm | Use `hashlib.sha256()` |
| **sha1** | Weak hash algorithm | Use `hashlib.sha256()` |

### 5.3 TypeScript Banned Packages

**TypeScript banned packages**:

| Package | Reason | Alternative |
|---------|--------|-------------|
| **eval()** | Arbitrary code execution vulnerability | Refactor code to avoid dynamic execution |
| **Function()** | Arbitrary code execution vulnerability | Refactor code to avoid dynamic execution |
| **dangerouslySetInnerHTML** | XSS vulnerability | Use React components with proper escaping |
| **innerHTML** | XSS vulnerability | Use `textContent` or React components |
| **document.write()** | XSS vulnerability | Use React components |

### 5.4 Banned Packages Scanning

**Banned packages scanning in CI/CD**:

```yaml
# GitHub Actions (banned packages scanning)
name: Scan Banned Packages
on: [push]

jobs:
  scan-banned:
    runs-on: ubuntu-latest
    steps:
      - name: Scan Python banned packages
        run: |
          # Check for pickle usage
          if grep -r "import pickle" .; then
            echo "Banned package 'pickle' found"
            exit 1
          fi
          
          # Check for eval() usage
          if grep -r "eval(" .; then
            echo "Banned function 'eval()' found"
            exit 1
          fi
      
      - name: Scan TypeScript banned packages
        run: |
          # Check for dangerouslySetInnerHTML usage
          if grep -r "dangerouslySetInnerHTML" .; then
            echo "Banned property 'dangerouslySetInnerHTML' found"
            exit 1
          fi
```

---

## 6. Vulnerability CVE Scanning

### 6.1 CVE Scanning Requirement

**ALL dependencies MUST be scanned for CVEs**.

**Requirement**: Automated CVE scanning in CI/CD, daily scans in production

### 6.2 Python CVE Scanning

**Python CVE scanning using pip-audit**:

```bash
# Install pip-audit
pip install pip-audit

# Scan for vulnerabilities
pip-audit

# Scan with SBOM
pip-audit --sbom sbom.json
```

**Example output**:

```
Found 2 known vulnerabilities in 1 package
Name      Version ID             Fix Versions
--------- ------- -------------- ------------
requests  2.25.0  PYSEC-2023-123 2.31.0
requests  2.25.0  PYSEC-2023-456 2.31.0
```

### 6.3 TypeScript CVE Scanning

**TypeScript CVE scanning using npm audit**:

```bash
# Scan for vulnerabilities
npm audit

# Scan with JSON output
npm audit --json

# Scan with production dependencies only
npm audit --production
```

**Example output**:

```
found 3 vulnerabilities (1 moderate, 2 high)
  run `npm audit fix` to fix them, or `npm audit` for details
```

### 6.4 CVE Scanning in CI/CD

**CVE scanning in CI/CD**:

```yaml
# GitHub Actions (CVE scanning)
name: CVE Scanning
on: [push]

jobs:
  scan-cve:
    runs-on: ubuntu-latest
    steps:
      - name: Scan Python CVEs
        run: |
          pip install pip-audit
          pip-audit --strict  # Fail on any vulnerability
      
      - name: Scan TypeScript CVEs
        run: |
          npm audit --audit-level=moderate  # Fail on moderate+ vulnerabilities
```

### 6.5 CVE Scanning Frequency

**CVE scanning frequency**:

| Environment | Frequency | Tool |
|-------------|-----------|------|
| **Production** | Daily (automated) | pip-audit, npm audit |
| **Staging** | Daily (automated) | pip-audit, npm audit |
| **Development** | On every commit (CI/CD) | pip-audit, npm audit |

---

## 7. Transitive Dependency Audit

### 7.1 Transitive Dependency Requirement

**ALL transitive dependencies MUST be audited**.

**Requirement**: Transitive dependencies included in SBOM, scanned for vulnerabilities

### 7.2 Python Transitive Dependencies

**Python transitive dependencies in requirements.txt**:

```bash
# Generate requirements.txt with transitive dependencies
pip freeze > requirements.txt

# Visualize dependency tree
pip install pipdeptree
pipdeptree
```

**Example dependency tree**:

```
fastapi==0.104.1
  - pydantic [required: >=2.0.0, installed: 2.5.0]
    - typing-extensions [required: >=4.6.1, installed: 4.8.0]
  - starlette [required: >=0.27.0, installed: 0.27.0]
    - anyio [required: >=3.4.0, installed: 4.0.0]
```

### 7.3 TypeScript Transitive Dependencies

**TypeScript transitive dependencies in package-lock.json**:

```bash
# List all dependencies (including transitive)
npm list

# List all dependencies in JSON format
npm list --json
```

### 7.4 Transitive Dependency Scanning

**Transitive dependencies scanned for vulnerabilities**:

```bash
# Python: Scan all dependencies (including transitive)
pip-audit

# TypeScript: Scan all dependencies (including transitive)
npm audit
```

---

## 8. Dependency Approval Workflow

### 8.1 Approval Workflow Requirement

**ALL new dependencies MUST be approved before use**.

**Requirement**: Approval workflow enforced via pull request review

### 8.2 Approval Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dependency Approval Process                   │
└─────────────────────────────────────────────────────────────────┘

Step 1: DEPENDENCY REQUEST
   ↓
   • Developer requests new dependency (pull request)
   • Justification provided (why is this dependency needed?)
   • Alternatives evaluated (are there existing dependencies that can be used?)
   ↓

Step 2: SECURITY REVIEW
   ↓
   • Security team reviews dependency
   • CVE scan performed (pip-audit, npm audit)
   • License review (ensure compatible license)
   • Maintainer review (is the package actively maintained?)
   ↓

Step 3: RISK ASSESSMENT
   ↓
   • Risk score calculated (see Section 9)
   • Critical/High risk dependencies require CISO approval
   • Medium risk dependencies require Security Architect approval
   • Low risk dependencies require Development Team Lead approval
   ↓

Step 4: APPROVAL
   ↓
   • Dependency approved or rejected
   • Approval documented (Genesis Archive™)
   • Dependency added to approved list
   ↓

Step 5: MONITORING
   ↓
   • Dependency added to SBOM
   • Continuous CVE scanning (daily)
   • Quarterly dependency review
```

### 8.3 Approval Authority Matrix

**Dependency approval authority based on risk score**:

| Risk Score | Approval Authority | Approval Timeline |
|------------|-------------------|-------------------|
| **Critical (9-10)** | CISO + CTO (both required) | 48 hours |
| **High (7-8)** | CISO or Security Architect | 24 hours |
| **Medium (4-6)** | Security Architect | 12 hours |
| **Low (1-3)** | Development Team Lead | 4 hours |

### 8.4 Approval Documentation

**Dependency approval documented in Genesis Archive™**:

```json
{
  "event_type": "dependency_approval",
  "dependency": {
    "name": "fastapi",
    "version": "0.104.1",
    "language": "python"
  },
  "risk_score": 3,
  "risk_level": "low",
  "justification": "FastAPI is required for REST API implementation",
  "alternatives_evaluated": ["Flask", "Django"],
  "security_review": {
    "cve_scan": "passed",
    "license": "MIT",
    "maintainer": "active"
  },
  "approver": "dev-team-lead@ghostquant.com",
  "approval_timestamp": "2025-12-01T00:00:00Z"
}
```

---

## 9. Risk Scoring Criteria

### 9.1 Risk Score Calculation

**Dependency risk score calculated based on multiple factors**:

| Factor | Weight | Score Range |
|--------|--------|-------------|
| **CVE Count** | 40% | 0-10 (0 CVEs = 0, 10+ CVEs = 10) |
| **CVE Severity** | 30% | 0-10 (No Critical = 0, Critical CVEs = 10) |
| **Maintainer Activity** | 15% | 0-10 (Active = 0, Abandoned = 10) |
| **License Compatibility** | 10% | 0-10 (Compatible = 0, Incompatible = 10) |
| **Transitive Dependencies** | 5% | 0-10 (0 deps = 0, 100+ deps = 10) |

**Risk Score Formula**:

```
Risk Score = (CVE Count × 0.4) + (CVE Severity × 0.3) + (Maintainer Activity × 0.15) + (License Compatibility × 0.1) + (Transitive Dependencies × 0.05)
```

### 9.2 Risk Levels

**Risk levels based on risk score**:

| Risk Level | Risk Score | Action Required |
|------------|------------|-----------------|
| **Critical** | 9-10 | CISO + CTO approval required, consider alternatives |
| **High** | 7-8 | CISO or Security Architect approval required |
| **Medium** | 4-6 | Security Architect approval required |
| **Low** | 1-3 | Development Team Lead approval required |

### 9.3 Risk Score Examples

**Example 1: Low-risk dependency (fastapi)**:

| Factor | Score | Calculation |
|--------|-------|-------------|
| CVE Count | 0 | 0 CVEs |
| CVE Severity | 0 | No Critical CVEs |
| Maintainer Activity | 0 | Active (last commit 1 week ago) |
| License Compatibility | 0 | MIT license (compatible) |
| Transitive Dependencies | 2 | 20 transitive dependencies |
| **Total Risk Score** | **0.1** | **(0×0.4) + (0×0.3) + (0×0.15) + (0×0.1) + (2×0.05) = 0.1** |
| **Risk Level** | **Low** | Development Team Lead approval required |

**Example 2: High-risk dependency (hypothetical)**:

| Factor | Score | Calculation |
|--------|-------|-------------|
| CVE Count | 8 | 8 CVEs |
| CVE Severity | 10 | 2 Critical CVEs |
| Maintainer Activity | 5 | Last commit 6 months ago |
| License Compatibility | 0 | MIT license (compatible) |
| Transitive Dependencies | 8 | 80 transitive dependencies |
| **Total Risk Score** | **7.15** | **(8×0.4) + (10×0.3) + (5×0.15) + (0×0.1) + (8×0.05) = 7.15** |
| **Risk Level** | **High** | CISO or Security Architect approval required |

---

## 10. Update Governance

### 10.1 Update Policy

**Dependency updates follow this policy**:

| Update Type | Frequency | Approval Required | Testing Required |
|-------------|-----------|-------------------|------------------|
| **Security patches** | Immediate (within 24 hours) | Security Architect | Smoke tests |
| **Minor updates** | Monthly | Development Team Lead | Full regression tests |
| **Major updates** | Quarterly | CTO or CISO | Full regression tests + QA approval |

### 10.2 Security Patch Updates

**Security patches applied immediately**:

```bash
# Python: Update dependency with security patch
pip install --upgrade fastapi==0.104.2  # Security patch

# TypeScript: Update dependency with security patch
npm install next@14.0.4  # Security patch
```

**Security patch approval**:
- ✅ Security Architect approval required
- ✅ Smoke tests required (verify application still works)
- ✅ Deploy to staging first, then production

### 10.3 Minor Updates

**Minor updates applied monthly**:

```bash
# Python: Update dependency (minor version)
pip install --upgrade fastapi==0.105.0  # Minor update (0.104.1 → 0.105.0)

# TypeScript: Update dependency (minor version)
npm install next@14.1.0  # Minor update (14.0.3 → 14.1.0)
```

**Minor update approval**:
- ✅ Development Team Lead approval required
- ✅ Full regression tests required
- ✅ QA team review recommended

### 10.4 Major Updates

**Major updates applied quarterly**:

```bash
# Python: Update dependency (major version)
pip install --upgrade fastapi==1.0.0  # Major update (0.104.1 → 1.0.0)

# TypeScript: Update dependency (major version)
npm install next@15.0.0  # Major update (14.0.3 → 15.0.0)
```

**Major update approval**:
- ✅ CTO or CISO approval required
- ✅ Full regression tests required
- ✅ QA team approval required
- ✅ Breaking changes documented

---

## 11. Replacement Process for Unsafe Packages

### 11.1 Unsafe Package Identification

**Unsafe packages identified through**:

1. **CVE scanning** (pip-audit, npm audit)
2. **Security advisories** (GitHub Security Advisories, NVD)
3. **Maintainer abandonment** (no commits in 12+ months)
4. **License incompatibility** (GPL, AGPL)

### 11.2 Replacement Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unsafe Package Replacement Process            │
└─────────────────────────────────────────────────────────────────┘

Step 1: IDENTIFICATION
   ↓
   • Unsafe package identified (CVE scan, security advisory)
   • Risk assessment performed
   • Replacement timeline determined (Critical: 24h, High: 3d, Medium: 7d, Low: 30d)
   ↓

Step 2: ALTERNATIVE EVALUATION
   ↓
   • Alternative packages evaluated
   • Security review performed (CVE scan, license review)
   • Feature comparison (does alternative meet requirements?)
   ↓

Step 3: REPLACEMENT IMPLEMENTATION
   ↓
   • Alternative package installed
   • Code refactored (if necessary)
   • Tests updated (if necessary)
   ↓

Step 4: TESTING
   ↓
   • Unit tests passed
   • Integration tests passed
   • Regression tests passed
   • QA team approval
   ↓

Step 5: DEPLOYMENT
   ↓
   • Deploy to staging
   • Smoke tests passed
   • Deploy to production
   • Monitor for 24 hours
   ↓

Step 6: DOCUMENTATION
   ↓
   • Replacement documented (Genesis Archive™)
   • SBOM updated
   • Approved packages list updated
```

### 11.3 Replacement Timeline

**Replacement timeline based on risk level**:

| Risk Level | Replacement Timeline | Approval Required |
|------------|---------------------|-------------------|
| **Critical** | 24 hours | CISO + CTO |
| **High** | 3 days | CISO or Security Architect |
| **Medium** | 7 days | Security Architect |
| **Low** | 30 days | Development Team Lead |

### 11.4 Replacement Documentation

**Replacement documented in Genesis Archive™**:

```json
{
  "event_type": "dependency_replacement",
  "unsafe_package": {
    "name": "requests",
    "version": "2.25.0",
    "reason": "CVE-2023-123 (Critical)"
  },
  "replacement_package": {
    "name": "httpx",
    "version": "0.25.0"
  },
  "risk_level": "critical",
  "replacement_timeline": "24 hours",
  "approver": "ciso@ghostquant.com",
  "approval_timestamp": "2025-12-01T00:00:00Z",
  "deployment_timestamp": "2025-12-01T12:00:00Z"
}
```

---

## 12. Compliance Mapping

### 12.1 NIST SP 800-53 Compliance

| Control | Requirement | GhostQuant Implementation |
|---------|-------------|--------------------------|
| **SA-10** | Developer Configuration Management | SBOM creation, version pinning, hash-checking |
| **RA-5** | Vulnerability Scanning | CVE scanning (pip-audit, npm audit) |

### 12.2 SOC 2 Compliance

| Criterion | Requirement | GhostQuant Implementation |
|-----------|-------------|--------------------------|
| **CC7.1** | Detection of Security Events | CVE scanning, vulnerability monitoring |

### 12.3 OpenSSF Best Practices Compliance

**GhostQuant follows OpenSSF Supply Chain Security best practices**:

- ✅ SBOM generation (CycloneDX)
- ✅ Dependency version pinning
- ✅ Hash-checking (SHA-256)
- ✅ Vulnerability scanning (pip-audit, npm audit)
- ✅ Transitive dependency audits
- ✅ Dependency approval workflow

### 12.4 OWASP Top 10 2021 A06 Compliance

**GhostQuant addresses OWASP Top 10 2021 A06 (Vulnerable and Outdated Components)**:

- ✅ Automated CVE scanning
- ✅ Regular dependency updates
- ✅ Banned packages list
- ✅ Transitive dependency audits

---

## 13. Cross-References

This document is part of the **GhostQuant Configuration Management & Hardening Standards Framework**. Related documents:

- **`config_management_overview.md`** — Configuration management overview
- **`baseline_configuration_policy.md`** — Baseline configuration policy
- **`system_hardening_standards.md`** — System hardening standards
- **`secure_environment_configuration.md`** — Secure environment configuration
- **`configuration_monitoring_and_drift_management.md`** — Configuration monitoring and drift management
- **`config_compliance_report_template.md`** — Configuration compliance report template

---

## 14. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Information Security Officer | Initial Dependency and Package Hardening |

**Next Review Date**: 2026-03-01 (Quarterly)  
**Approval**: Chief Information Security Officer, Chief Technology Officer

---

**END OF DOCUMENT**

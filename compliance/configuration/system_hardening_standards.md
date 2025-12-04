# System Hardening Standards

**Document ID**: GQ-CONFIG-003  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Information Security Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes **System Hardening Standards** for **GhostQuant™**, defining **mandatory hardening requirements** for **OS**, **API & Backend**, **Containers**, **Database**, **Network**, and **DevOps** systems.

This document ensures compliance with:

- **NIST SP 800-53 CM-6** — Configuration Settings
- **NIST SP 800-53 CM-7** — Least Functionality
- **NIST SP 800-53 SC-7** — Boundary Protection
- **SOC 2 CC6.6** — Logical Access Security Measures
- **CIS Benchmarks** — Center for Internet Security Benchmarks
- **OWASP Top 10** — Application Security Risks

---

## 2. OS Hardening (Linux)

### 2.1 Disable Root Login

**Root login MUST be disabled on all systems**.

**Requirement**: No direct root SSH access permitted

**Implementation**:

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
```

**Verification**:

```bash
# Verify root login disabled
grep "^PermitRootLogin" /etc/ssh/sshd_config
# Expected output: PermitRootLogin no
```

**Rationale**: Root login is a common attack vector. Disabling root login forces attackers to compromise a user account first, then escalate privileges (defense in depth).

---

### 2.2 Enforce Key-Based Authentication

**Password authentication MUST be disabled on all systems**.

**Requirement**: SSH key-based authentication only

**Implementation**:

```bash
# /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
```

**Verification**:

```bash
# Verify password authentication disabled
grep "^PasswordAuthentication" /etc/ssh/sshd_config
# Expected output: PasswordAuthentication no
```

**Rationale**: Password authentication is vulnerable to brute-force attacks. Key-based authentication is significantly more secure.

---

### 2.3 Firewall Baseline (Deny-All, Allow Minimal)

**Firewall MUST be enabled with deny-all default policy**.

**Requirement**: UFW (Uncomplicated Firewall) enabled, default deny

**Implementation**:

```bash
# Enable UFW
ufw enable

# Set default policy to deny
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (port 22)
ufw allow 22/tcp

# Allow HTTPS (port 443)
ufw allow 443/tcp

# Verify firewall status
ufw status verbose
```

**Verification**:

```bash
# Verify UFW enabled
ufw status
# Expected output: Status: active
```

**Rationale**: Deny-all default policy minimizes attack surface. Only necessary ports are opened.

---

### 2.4 Logging Requirements

**All authentication attempts, sudo commands, and system events MUST be logged**.

**Requirement**: rsyslog configured, logs sent to Genesis Archive™

**Implementation**:

```bash
# /etc/rsyslog.conf
# Log all auth attempts
auth,authpriv.*  /var/log/auth.log

# Log all sudo commands
*.info;mail.none;authpriv.none;cron.none  /var/log/messages

# Forward logs to Genesis Archive™
*.* @@genesis-archive.ghostquant.com:514
```

**Verification**:

```bash
# Verify logging enabled
tail -f /var/log/auth.log
```

**Rationale**: Comprehensive logging enables forensic analysis and incident response.

---

### 2.5 Kernel Parameter Lockdown

**Kernel parameters MUST be hardened to prevent attacks**.

**Requirement**: Kernel parameters configured for security

**Implementation**:

```bash
# /etc/sysctl.conf

# Disable IP forwarding (unless router)
net.ipv4.ip_forward = 0

# Enable SYN cookies (prevent SYN flood attacks)
net.ipv4.tcp_syncookies = 1

# Disable ICMP redirects (prevent MITM attacks)
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable source routing (prevent IP spoofing)
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Enable reverse path filtering (prevent IP spoofing)
net.ipv4.conf.all.rp_filter = 1

# Disable ICMP echo requests (prevent ping floods)
net.ipv4.icmp_echo_ignore_all = 1

# Apply changes
sysctl -p
```

**Verification**:

```bash
# Verify kernel parameters
sysctl net.ipv4.ip_forward
# Expected output: net.ipv4.ip_forward = 0
```

**Rationale**: Kernel parameter hardening prevents network-based attacks (SYN floods, IP spoofing, MITM attacks).

---

### 2.6 File System Protections

**File system MUST be configured for security**.

**Requirement**: Secure mount options, file permissions

**Implementation**:

```bash
# /etc/fstab

# Mount /tmp with noexec, nosuid, nodev
tmpfs  /tmp  tmpfs  defaults,noexec,nosuid,nodev  0 0

# Mount /var/tmp with noexec, nosuid, nodev
tmpfs  /var/tmp  tmpfs  defaults,noexec,nosuid,nodev  0 0

# Remount filesystems
mount -o remount /tmp
mount -o remount /var/tmp
```

**Verification**:

```bash
# Verify mount options
mount | grep /tmp
# Expected output: tmpfs on /tmp type tmpfs (rw,noexec,nosuid,nodev)
```

**Rationale**: Secure mount options prevent execution of malicious code from temporary directories.

---

### 2.7 MUST NOT: OS Hardening

**The following OS configurations are PROHIBITED**:

- ❌ **Root login enabled**: No direct root SSH access
- ❌ **Password authentication enabled**: Key-based authentication only
- ❌ **Firewall disabled**: UFW must be enabled
- ❌ **Logging disabled**: All events must be logged
- ❌ **Unnecessary services enabled**: Only required services enabled
- ❌ **Weak SSH ciphers**: Only strong ciphers permitted (AES-256, ChaCha20)
- ❌ **Telnet enabled**: Telnet is insecure, SSH only
- ❌ **FTP enabled**: FTP is insecure, SFTP only

---

## 3. API & Backend Hardening

### 3.1 Strict Error Handling

**All exceptions MUST be caught and handled gracefully**.

**Requirement**: No unhandled exceptions, generic error messages

**Implementation**:

```python
# Python (FastAPI)
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/predictions")
async def get_predictions():
    try:
        # Business logic
        predictions = generate_predictions()
        return {"predictions": predictions}
    except Exception as e:
        # Log error (with stack trace)
        logger.error(f"Error generating predictions: {e}", exc_info=True)
        
        # Return generic error message (no stack trace)
        raise HTTPException(status_code=500, detail="Internal server error")
```

**Rationale**: Generic error messages prevent information disclosure. Stack traces reveal system internals to attackers.

---

### 3.2 No Debug Modes in Production

**Debug mode MUST be disabled in production**.

**Requirement**: `DEBUG=False` in production

**Implementation**:

```python
# Python (FastAPI)
import os

DEBUG = os.getenv("DEBUG", "False").lower() == "true"

app = FastAPI(
    debug=DEBUG,              # False in production
    docs_url=None if not DEBUG else "/docs",  # Disable Swagger UI in production
    redoc_url=None if not DEBUG else "/redoc"  # Disable ReDoc in production
)
```

**Verification**:

```bash
# Verify DEBUG=False in production
echo $DEBUG
# Expected output: False
```

**Rationale**: Debug mode exposes sensitive information (stack traces, environment variables, database queries).

---

### 3.3 Sanitized Logs

**Sensitive data MUST be sanitized from logs**.

**Requirement**: No passwords, API keys, JWT tokens, personal data in logs

**Implementation**:

```python
# Python logging with sanitization
import re

def sanitize_log(message):
    """Sanitize sensitive data from log messages"""
    # Remove passwords
    message = re.sub(r'password["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'password=***', message, flags=re.IGNORECASE)
    
    # Remove API keys
    message = re.sub(r'api[_-]?key["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'api_key=***', message, flags=re.IGNORECASE)
    
    # Remove JWT tokens
    message = re.sub(r'Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+', 'Bearer ***', message)
    
    return message

# Use sanitized logging
logger.info(sanitize_log(f"User login: {user_data}"))
```

**Rationale**: Sensitive data in logs can be exposed if logs are compromised.

---

### 3.4 Least-Privilege Service Accounts

**Service accounts MUST have minimal permissions**.

**Requirement**: Service accounts with least privilege, no root access

**Implementation**:

```bash
# Create service account (non-root)
useradd -r -s /bin/false ghostquant-api

# Set file ownership
chown -R ghostquant-api:ghostquant-api /app

# Run service as non-root user
sudo -u ghostquant-api python main.py
```

**Verification**:

```bash
# Verify service running as non-root
ps aux | grep python
# Expected output: ghostquant-api ... python main.py
```

**Rationale**: Least-privilege service accounts limit damage if service is compromised.

---

### 3.5 Rate Limiting Requirements

**Rate limiting MUST be enforced on all API endpoints**.

**Requirement**: 100 requests/minute per user

**Implementation**:

```python
# Python (FastAPI) with slowapi
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/predictions")
@limiter.limit("100/minute")
async def get_predictions():
    return {"predictions": [...]}
```

**Rationale**: Rate limiting prevents abuse (DDoS attacks, brute-force attacks).

---

### 3.6 API Version Isolation

**API versions MUST be isolated (no shared state)**.

**Requirement**: Versioned APIs (/v1/, /v2/), no breaking changes

**Implementation**:

```python
# Python (FastAPI) with versioned APIs
from fastapi import FastAPI

app = FastAPI()

# v1 API
@app.get("/v1/predictions")
async def get_predictions_v1():
    return {"predictions": [...]}

# v2 API (isolated from v1)
@app.get("/v2/predictions")
async def get_predictions_v2():
    return {"predictions": [...], "confidence": [...]}
```

**Rationale**: API version isolation prevents breaking changes from affecting existing clients.

---

### 3.7 MUST NOT: API & Backend Hardening

**The following API & backend configurations are PROHIBITED**:

- ❌ **Debug mode enabled in production**: `DEBUG=False` required
- ❌ **Stack traces in error messages**: Generic error messages only
- ❌ **Sensitive data in logs**: Sanitize passwords, API keys, JWT tokens
- ❌ **Root service accounts**: Service accounts must be non-root
- ❌ **No rate limiting**: Rate limiting required on all endpoints
- ❌ **CORS wildcard**: Whitelist origins only (no `*`)
- ❌ **Unversioned APIs**: APIs must be versioned (/v1/, /v2/)

---

## 4. Container Hardening

### 4.1 Minimal Base Images

**Containers MUST use minimal base images**.

**Requirement**: Official minimal images only (python:3.11-slim, node:20-alpine)

**Implementation**:

```dockerfile
# Use minimal base image
FROM python:3.11-slim

# NOT ALLOWED: Full images (python:3.11, ubuntu:22.04)
```

**Rationale**: Minimal base images reduce attack surface (fewer packages, fewer vulnerabilities).

---

### 4.2 No Root Containers

**Containers MUST run as non-root user**.

**Requirement**: Non-root user created, container runs as non-root

**Implementation**:

```dockerfile
# Create non-root user
RUN useradd -m -u 1000 ghostquant

# Switch to non-root user
USER ghostquant

# Run application
CMD ["python", "main.py"]
```

**Verification**:

```bash
# Verify container running as non-root
docker exec <container_id> whoami
# Expected output: ghostquant
```

**Rationale**: Root containers allow attackers to escape to host system if container is compromised.

---

### 4.3 Read-Only Filesystem

**Containers MUST use read-only filesystem (where possible)**.

**Requirement**: Read-only filesystem, writable volumes for necessary directories

**Implementation**:

```bash
# Run container with read-only filesystem
docker run --read-only -v /tmp:/tmp ghostquant:latest
```

**Rationale**: Read-only filesystem prevents attackers from modifying container files.

---

### 4.4 Locked Permissions

**Container files MUST have minimal permissions**.

**Requirement**: Files owned by non-root user, minimal permissions

**Implementation**:

```dockerfile
# Set file ownership
COPY --chown=ghostquant:ghostquant . /app

# Set file permissions (read-only)
RUN chmod -R 755 /app
```

**Rationale**: Minimal permissions prevent unauthorized file modifications.

---

### 4.5 Mandatory Environment Variable Whitelisting

**Environment variables MUST be whitelisted**.

**Requirement**: Only necessary environment variables permitted

**Implementation**:

```dockerfile
# Whitelist environment variables
ENV DATABASE_URL=""
ENV REDIS_URL=""
ENV JWT_SECRET=""

# NOT ALLOWED: Wildcard environment variables
```

**Rationale**: Whitelisting environment variables prevents injection of malicious variables.

---

### 4.6 Dependency Hash-Pinning

**Dependencies MUST be hash-pinned**.

**Requirement**: Dependencies pinned to specific versions with hashes

**Implementation**:

```dockerfile
# requirements.txt with hashes
fastapi==0.104.1 --hash=sha256:abc123...
pydantic==2.5.0 --hash=sha256:def456...

# Install dependencies with hash verification
RUN pip install --require-hashes -r requirements.txt
```

**Rationale**: Hash-pinning prevents dependency substitution attacks.

---

### 4.7 MUST NOT: Container Hardening

**The following container configurations are PROHIBITED**:

- ❌ **Full base images**: Minimal images only (python:3.11-slim, node:20-alpine)
- ❌ **Root containers**: Containers must run as non-root
- ❌ **Writable filesystem**: Read-only filesystem (where possible)
- ❌ **Excessive permissions**: Minimal permissions only
- ❌ **Secrets in images**: No secrets in Dockerfile or image layers
- ❌ **Unpinned dependencies**: Dependencies must be hash-pinned
- ❌ **Privileged containers**: No `--privileged` flag

---

## 5. Database Hardening

### 5.1 Encrypted Connections

**Database connections MUST be encrypted**.

**Requirement**: TLS 1.3 required for all connections

**Implementation**:

```sql
-- PostgreSQL configuration
ALTER SYSTEM SET ssl = 'on';
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.3';
SELECT pg_reload_conf();
```

**Verification**:

```sql
-- Verify SSL enabled
SHOW ssl;
-- Expected output: on
```

**Rationale**: Encrypted connections prevent eavesdropping and MITM attacks.

---

### 5.2 No Public Access

**Databases MUST NOT be publicly accessible**.

**Requirement**: Database accessible only from private network

**Implementation**:

```hcl
# Terraform (AWS RDS)
resource "aws_db_instance" "ghostquant" {
  publicly_accessible = false  # No public access
  vpc_security_group_ids = [aws_security_group.database.id]
}
```

**Verification**:

```bash
# Verify database not publicly accessible
nmap -p 5432 <database_public_ip>
# Expected output: filtered (not open)
```

**Rationale**: Public database access is a major security risk.

---

### 5.3 Role-Based Access

**Database access MUST use role-based access control (RBAC)**.

**Requirement**: Separate roles for read-only, read-write, admin

**Implementation**:

```sql
-- PostgreSQL RBAC
-- Create read-only role
CREATE ROLE ghostquant_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ghostquant_readonly;

-- Create read-write role
CREATE ROLE ghostquant_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ghostquant_readwrite;

-- Create admin role
CREATE ROLE ghostquant_admin WITH SUPERUSER;
```

**Rationale**: RBAC implements least privilege (users have only necessary permissions).

---

### 5.4 Parameterized Queries Only

**All database queries MUST use parameterized queries**.

**Requirement**: No string concatenation in SQL queries

**Implementation**:

```python
# Python (SQLAlchemy) - CORRECT
from sqlalchemy import text

# Parameterized query (safe)
query = text("SELECT * FROM users WHERE email = :email")
result = db.execute(query, {"email": user_email})

# String concatenation (PROHIBITED)
# query = f"SELECT * FROM users WHERE email = '{user_email}'"  # SQL INJECTION!
```

**Rationale**: Parameterized queries prevent SQL injection attacks.

---

### 5.5 Backup Integrity Verification

**Database backups MUST be verified for integrity**.

**Requirement**: Backup checksums verified, test restores performed quarterly

**Implementation**:

```bash
# Create backup with checksum
pg_dump ghostquant | tee backup.sql | sha256sum > backup.sql.sha256

# Verify backup integrity
sha256sum -c backup.sql.sha256
```

**Rationale**: Backup integrity verification ensures backups are not corrupted.

---

### 5.6 MUST NOT: Database Hardening

**The following database configurations are PROHIBITED**:

- ❌ **Unencrypted connections**: TLS 1.3 required
- ❌ **Public access**: Database must be private
- ❌ **No RBAC**: Role-based access control required
- ❌ **String concatenation in queries**: Parameterized queries only
- ❌ **No backup verification**: Backup integrity must be verified
- ❌ **Weak passwords**: Strong passwords required (16+ characters, complexity)
- ❌ **Default credentials**: Default credentials must be changed

---

## 6. Network Hardening

### 6.1 Segmented Internal Networks

**Internal networks MUST be segmented**.

**Requirement**: Separate networks for production, staging, development

**Implementation**:

```hcl
# Terraform (AWS VPC)
resource "aws_vpc" "production" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "ghostquant-production" }
}

resource "aws_vpc" "staging" {
  cidr_block = "10.1.0.0/16"
  tags = { Name = "ghostquant-staging" }
}

resource "aws_vpc" "development" {
  cidr_block = "10.2.0.0/16"
  tags = { Name = "ghostquant-development" }
}
```

**Rationale**: Network segmentation limits lateral movement if one network is compromised.

---

### 6.2 Zero-Trust Boundaries

**Zero-trust boundaries MUST be enforced**.

**Requirement**: All network traffic authenticated and authorized

**Implementation**:

```yaml
# Zero-trust network policy (Kubernetes)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  # Deny all traffic by default
```

**Rationale**: Zero-trust architecture assumes no implicit trust (all traffic must be verified).

---

### 6.3 No Flat Networks

**Flat networks are PROHIBITED**.

**Requirement**: Network segmentation enforced, no flat networks

**Implementation**:

```hcl
# Terraform (AWS Security Groups)
# Separate security groups for each tier
resource "aws_security_group" "web" {
  name = "ghostquant-web"
  # Allow HTTPS from internet
}

resource "aws_security_group" "api" {
  name = "ghostquant-api"
  # Allow traffic from web tier only
}

resource "aws_security_group" "database" {
  name = "ghostquant-database"
  # Allow traffic from API tier only
}
```

**Rationale**: Flat networks allow attackers to move laterally without restrictions.

---

### 6.4 TLS Requirements

**TLS 1.3 MUST be enforced for all connections**.

**Requirement**: TLS 1.3 only, no TLS 1.0, 1.1, 1.2

**Implementation**:

```nginx
# Nginx configuration
ssl_protocols TLSv1.3;
ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
ssl_prefer_server_ciphers on;
```

**Rationale**: TLS 1.3 is the most secure TLS version (older versions have known vulnerabilities).

---

### 6.5 MUST NOT: Network Hardening

**The following network configurations are PROHIBITED**:

- ❌ **Flat networks**: Network segmentation required
- ❌ **No zero-trust**: Zero-trust boundaries required
- ❌ **TLS 1.0, 1.1, 1.2**: TLS 1.3 only
- ❌ **Weak ciphers**: Strong ciphers only (AES-256, ChaCha20)
- ❌ **No firewall**: Firewall required (deny-all, allow minimal)
- ❌ **Public database access**: Databases must be private
- ❌ **No VPN for internal access**: VPN required for internal access

---

## 7. DevOps Hardening

### 7.1 CI Pipeline Isolation

**CI/CD pipelines MUST be isolated**.

**Requirement**: Separate pipelines for production, staging, development

**Implementation**:

```yaml
# GitHub Actions (separate workflows)
# .github/workflows/production.yaml
name: Production Deployment
on:
  push:
    branches: [main]

# .github/workflows/staging.yaml
name: Staging Deployment
on:
  push:
    branches: [staging]
```

**Rationale**: Pipeline isolation prevents cross-contamination between environments.

---

### 7.2 Secrets Vault Usage

**Secrets MUST be stored in secrets vault**.

**Requirement**: AWS Secrets Manager, no secrets in code or environment variables

**Implementation**:

```python
# Python (AWS Secrets Manager)
import boto3

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return response['SecretString']

# Retrieve secret
database_password = get_secret('ghostquant/database/password')
```

**Rationale**: Secrets vault provides centralized secrets management with access controls and audit logging.

---

### 7.3 Artifact Signing

**All artifacts MUST be signed**.

**Requirement**: GPG signing for all release artifacts

**Implementation**:

```bash
# Sign artifact with GPG
gpg --detach-sign --armor ghostquant-v1.0.0.tar.gz

# Verify signature
gpg --verify ghostquant-v1.0.0.tar.gz.asc ghostquant-v1.0.0.tar.gz
```

**Rationale**: Artifact signing ensures integrity and authenticity of releases.

---

### 7.4 Zero Unapproved Scripts

**Unapproved scripts are PROHIBITED in CI/CD pipelines**.

**Requirement**: All scripts reviewed and approved

**Implementation**:

```yaml
# GitHub Actions (approved scripts only)
- name: Run approved script
  run: |
    # Script must be in approved-scripts/ directory
    bash approved-scripts/deploy.sh
```

**Rationale**: Unapproved scripts can introduce security vulnerabilities or malicious code.

---

### 7.5 MUST NOT: DevOps Hardening

**The following DevOps configurations are PROHIBITED**:

- ❌ **Shared pipelines**: Separate pipelines for each environment
- ❌ **Secrets in code**: Secrets must be in secrets vault
- ❌ **Unsigned artifacts**: All artifacts must be signed
- ❌ **Unapproved scripts**: All scripts must be reviewed and approved
- ❌ **No pipeline isolation**: Pipelines must be isolated
- ❌ **Secrets in environment variables**: Secrets must be in secrets vault
- ❌ **No artifact verification**: Artifacts must be verified before deployment

---

## 8. Compliance Mapping

### 8.1 NIST SP 800-53 Compliance

| Control | Requirement | GhostQuant Implementation |
|---------|-------------|--------------------------|
| **CM-6** | Configuration Settings | System hardening standards (this document) |
| **CM-7** | Least Functionality | Minimal services enabled, unnecessary services disabled |
| **SC-7** | Boundary Protection | Network segmentation, zero-trust boundaries |

### 8.2 SOC 2 Compliance

| Criterion | Requirement | GhostQuant Implementation |
|-----------|-------------|--------------------------|
| **CC6.6** | Logical Access Security Measures | System hardening standards (this document) |

### 8.3 CIS Benchmarks Compliance

**GhostQuant follows CIS Benchmarks for**:

- ✅ Ubuntu 22.04 LTS
- ✅ Docker
- ✅ PostgreSQL
- ✅ Nginx

---

## 9. Cross-References

This document is part of the **GhostQuant Configuration Management & Hardening Standards Framework**. Related documents:

- **`config_management_overview.md`** — Configuration management overview
- **`baseline_configuration_policy.md`** — Baseline configuration policy
- **`secure_environment_configuration.md`** — Secure environment configuration
- **`dependency_and_package_hardening.md`** — Dependency and package hardening
- **`configuration_monitoring_and_drift_management.md`** — Configuration monitoring and drift management
- **`config_compliance_report_template.md`** — Configuration compliance report template

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Information Security Officer | Initial System Hardening Standards |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Information Security Officer, Chief Technology Officer

---

**END OF DOCUMENT**

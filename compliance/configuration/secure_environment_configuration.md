# Secure Environment Configuration

**Document ID**: GQ-CONFIG-004  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Technology Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes **Secure Environment Configuration** requirements for **GhostQuant™**, defining **mandatory security requirements** for **Production**, **Staging**, and **Development** environments, including the **One Environment Rule**.

This document ensures compliance with:

- **NIST SP 800-53 CM-2** — Baseline Configuration
- **NIST SP 800-53 CM-6** — Configuration Settings
- **SOC 2 CC6.6** — Logical Access Security Measures
- **SOC 2 CC7.2** — System Operations Monitoring
- **FedRAMP CM-2, CM-6** — Configuration Management

---

## 2. Environment Definitions

**GhostQuant operates three environments**:

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| **Production** | Live system serving customers | Real customer data | Restricted (authorized personnel only) |
| **Staging** | Pre-production testing | Redacted/synthetic data | Restricted (QA team, DevOps team) |
| **Development** | Development and testing | Synthetic data only | Limited (development team) |

---

## 3. Production Environment

### 3.1 Immutable Deployments

**Production deployments MUST be immutable**.

**Requirement**: No manual changes permitted, all changes via CI/CD

**Implementation**:

```yaml
# GitHub Actions (production deployment)
name: Production Deployment
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy immutable artifacts
          terraform apply -auto-approve
          
      - name: Verify deployment
        run: |
          # Verify no manual changes
          terraform plan -detailed-exitcode
```

**Verification**:

```bash
# Verify no configuration drift
terraform plan -detailed-exitcode
# Expected exit code: 0 (no changes)
```

**Rationale**: Immutable deployments prevent unauthorized manual changes and ensure consistency.

---

### 3.2 Logging Retention

**Production logs MUST be retained for 7 years**.

**Requirement**: All logs sent to Genesis Archive™, 7-year retention

**Implementation**:

```python
# Python (Genesis Archive™ integration)
from genesis_archive import GenesisArchive

genesis = GenesisArchive(
    retention_policy="7_years",
    encryption="AES-256",
    tamper_evident=True
)

# Log event
genesis.log_event({
    "event_type": "api_request",
    "user_id": "user@example.com",
    "endpoint": "/v1/predictions",
    "timestamp": datetime.utcnow().isoformat()
})
```

**Verification**:

```bash
# Verify logs in Genesis Archive™
genesis-cli query --start-date 2018-01-01 --end-date 2025-12-01
# Expected: Logs from 7 years ago present
```

**Rationale**: 7-year log retention meets regulatory requirements (SEC, FINRA, CFTC).

---

### 3.3 Multi-Zone Availability

**Production MUST be deployed across multiple availability zones**.

**Requirement**: Minimum 3 availability zones, automatic failover

**Implementation**:

```hcl
# Terraform (AWS multi-AZ deployment)
resource "aws_db_instance" "ghostquant" {
  multi_az = true  # Enable multi-AZ
  availability_zone = "us-east-1a"
}

resource "aws_lb" "ghostquant" {
  subnets = [
    aws_subnet.az1.id,
    aws_subnet.az2.id,
    aws_subnet.az3.id
  ]
}
```

**Verification**:

```bash
# Verify multi-AZ deployment
aws rds describe-db-instances --db-instance-identifier ghostquant
# Expected: MultiAZ: true
```

**Rationale**: Multi-zone availability ensures high availability and disaster recovery.

---

### 3.4 Secrets Rotation

**Production secrets MUST be rotated quarterly**.

**Requirement**: Automated secrets rotation every 90 days

**Implementation**:

```python
# Python (AWS Secrets Manager rotation)
import boto3

def rotate_secret(secret_name):
    client = boto3.client('secretsmanager')
    
    # Rotate secret
    response = client.rotate_secret(
        SecretId=secret_name,
        RotationLambdaARN='arn:aws:lambda:us-east-1:123456789012:function:rotate-secret',
        RotationRules={
            'AutomaticallyAfterDays': 90  # Rotate every 90 days
        }
    )
    
    return response

# Schedule rotation
rotate_secret('ghostquant/database/password')
```

**Verification**:

```bash
# Verify secrets rotation schedule
aws secretsmanager describe-secret --secret-id ghostquant/database/password
# Expected: RotationEnabled: true, RotationRules.AutomaticallyAfterDays: 90
```

**Rationale**: Regular secrets rotation limits exposure if secrets are compromised.

---

### 3.5 Attack Surface Restrictions

**Production attack surface MUST be minimized**.

**Requirement**: Only necessary services exposed, all others blocked

**Implementation**:

```hcl
# Terraform (AWS Security Group)
resource "aws_security_group" "production" {
  name = "ghostquant-production"
  
  # Allow HTTPS only
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Deny all other inbound traffic (implicit)
  
  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

**Verification**:

```bash
# Verify attack surface
nmap -p- <production_ip>
# Expected: Only port 443 open
```

**Rationale**: Minimal attack surface reduces vulnerability to attacks.

---

### 3.6 Health Checks & Readiness Probes

**Production MUST implement health checks and readiness probes**.

**Requirement**: Health checks every 30 seconds, automatic restart on failure

**Implementation**:

```python
# Python (FastAPI health check)
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check database connection
    if not check_database_connection():
        return {"status": "unhealthy", "reason": "database_connection_failed"}
    
    # Check Redis connection
    if not check_redis_connection():
        return {"status": "unhealthy", "reason": "redis_connection_failed"}
    
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_probe():
    """Readiness probe endpoint"""
    # Check if application is ready to serve traffic
    if not is_application_ready():
        return {"status": "not_ready"}
    
    return {"status": "ready"}
```

**Kubernetes Configuration**:

```yaml
# Kubernetes (health checks and readiness probes)
apiVersion: v1
kind: Pod
metadata:
  name: ghostquant-api
spec:
  containers:
  - name: api
    image: ghostquant:latest
    livenessProbe:
      httpGet:
        path: /health
        port: 8000
      initialDelaySeconds: 30
      periodSeconds: 30
    readinessProbe:
      httpGet:
        path: /ready
        port: 8000
      initialDelaySeconds: 10
      periodSeconds: 10
```

**Rationale**: Health checks and readiness probes ensure automatic recovery from failures.

---

### 3.7 Production Environment Summary

**Production Environment Requirements**:

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| **Immutable Deployments** | CI/CD only, no manual changes | `terraform plan -detailed-exitcode` |
| **Logging Retention** | 7 years (Genesis Archive™) | Genesis Archive™ query |
| **Multi-Zone Availability** | 3+ availability zones | AWS RDS multi-AZ status |
| **Secrets Rotation** | Quarterly (90 days) | AWS Secrets Manager rotation schedule |
| **Attack Surface Restrictions** | HTTPS only (port 443) | nmap scan |
| **Health Checks** | Every 30 seconds | Kubernetes liveness probe |
| **Readiness Probes** | Every 10 seconds | Kubernetes readiness probe |

---

## 4. Staging Environment

### 4.1 Must Mirror Production Security

**Staging MUST mirror production security configurations**.

**Requirement**: Same security controls as production

**Implementation**:

```hcl
# Terraform (staging environment)
module "staging" {
  source = "./modules/environment"
  
  # Same security controls as production
  enable_encryption = true
  enable_multi_az = true
  enable_logging = true
  enable_monitoring = true
  
  # Different resource sizes (smaller than production)
  instance_type = "t3.medium"  # vs. t3.xlarge in production
}
```

**Verification**:

```bash
# Verify staging security controls match production
terraform show | grep -E "(encryption|multi_az|logging|monitoring)"
```

**Rationale**: Staging must mirror production security to catch security issues before production deployment.

---

### 4.2 Redacted Data Only

**Staging MUST use redacted or synthetic data only**.

**Requirement**: No real customer data in staging

**Implementation**:

```python
# Python (data redaction)
import hashlib

def redact_personal_data(data):
    """Redact personal data for staging environment"""
    redacted = data.copy()
    
    # Redact email addresses
    if 'email' in redacted:
        redacted['email'] = hashlib.sha256(redacted['email'].encode()).hexdigest()[:16] + "@example.com"
    
    # Redact wallet addresses
    if 'wallet_address' in redacted:
        redacted['wallet_address'] = "0x" + hashlib.sha256(redacted['wallet_address'].encode()).hexdigest()[:40]
    
    # Redact names
    if 'name' in redacted:
        redacted['name'] = "User " + hashlib.sha256(redacted['name'].encode()).hexdigest()[:8]
    
    return redacted

# Use redacted data in staging
staging_data = redact_personal_data(production_data)
```

**Verification**:

```bash
# Verify no real customer data in staging
psql -h staging-db -c "SELECT email FROM users LIMIT 10;"
# Expected: All emails end with @example.com
```

**Rationale**: Redacted data protects customer privacy and meets GDPR requirements.

---

### 4.3 Mandatory Access Controls

**Staging MUST enforce access controls**.

**Requirement**: Role-based access control (RBAC), MFA required

**Implementation**:

```hcl
# Terraform (staging access controls)
resource "aws_iam_role" "staging_access" {
  name = "ghostquant-staging-access"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = [
          "arn:aws:iam::123456789012:user/qa-team",
          "arn:aws:iam::123456789012:user/devops-team"
        ]
      }
      Action = "sts:AssumeRole"
      Condition = {
        Bool = {
          "aws:MultiFactorAuthPresent" = "true"  # MFA required
        }
      }
    }]
  })
}
```

**Verification**:

```bash
# Verify MFA required for staging access
aws iam get-role --role-name ghostquant-staging-access
# Expected: Condition.Bool.aws:MultiFactorAuthPresent: true
```

**Rationale**: Access controls prevent unauthorized access to staging environment.

---

### 4.4 Staging Environment Summary

**Staging Environment Requirements**:

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| **Mirror Production Security** | Same security controls | Terraform configuration comparison |
| **Redacted Data Only** | Data redaction scripts | Database query (no real emails) |
| **Mandatory Access Controls** | RBAC + MFA | IAM role policy |
| **Logging** | Same as production (Genesis Archive™) | Genesis Archive™ query |
| **Monitoring** | Same as production (Sentinel™) | Sentinel™ dashboard |

---

## 5. Development Environment

### 5.1 No Production Credentials

**Development MUST NOT use production credentials**.

**Requirement**: Separate credentials for development, no production access

**Implementation**:

```bash
# Development environment variables
export DATABASE_URL="postgresql://dev:dev@localhost:5432/ghostquant_dev"
export REDIS_URL="redis://localhost:6379/0"
export JWT_SECRET="dev-jwt-secret-not-for-production"

# NOT ALLOWED: Production credentials
# export DATABASE_URL="postgresql://prod:prod@prod-db:5432/ghostquant"  # PROHIBITED
```

**Verification**:

```bash
# Verify development credentials
echo $DATABASE_URL
# Expected: Contains "dev" or "localhost", not production hostname
```

**Rationale**: Separate credentials prevent accidental production access from development.

---

### 5.2 No Real User Data

**Development MUST NOT use real user data**.

**Requirement**: Synthetic data only, no customer data

**Implementation**:

```python
# Python (synthetic data generation)
from faker import Faker

fake = Faker()

def generate_synthetic_user():
    """Generate synthetic user data for development"""
    return {
        "email": fake.email(),
        "name": fake.name(),
        "wallet_address": "0x" + fake.hexify(text="^" * 40),
        "created_at": fake.date_time_this_year()
    }

# Populate development database with synthetic data
for _ in range(1000):
    user = generate_synthetic_user()
    db.insert_user(user)
```

**Verification**:

```bash
# Verify synthetic data in development
psql -h localhost -c "SELECT email FROM users LIMIT 10;"
# Expected: Fake emails (e.g., john.doe@example.com)
```

**Rationale**: Synthetic data protects customer privacy and meets GDPR requirements.

---

### 5.3 Limited Access

**Development access MUST be limited**.

**Requirement**: Development team only, no external access

**Implementation**:

```hcl
# Terraform (development access controls)
resource "aws_security_group" "development" {
  name = "ghostquant-development"
  
  # Allow access from office IP only
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]  # Office IP range
  }
  
  # Deny all other inbound traffic (implicit)
}
```

**Verification**:

```bash
# Verify development access restricted
aws ec2 describe-security-groups --group-names ghostquant-development
# Expected: cidr_blocks contains office IP range only
```

**Rationale**: Limited access prevents unauthorized access to development environment.

---

### 5.4 Development Environment Summary

**Development Environment Requirements**:

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| **No Production Credentials** | Separate dev credentials | Environment variable check |
| **No Real User Data** | Synthetic data generation | Database query (fake emails) |
| **Limited Access** | Office IP whitelist | Security group configuration |
| **Logging** | Local logging (not Genesis Archive™) | Log file location |
| **Monitoring** | Optional (not Sentinel™) | N/A |

---

## 6. One Environment Rule

### 6.1 Rule Statement

**NO ENVIRONMENT MAY OVERRIDE OR WEAKEN ITS LOWER-ENVIRONMENT'S HARDENING REQUIREMENTS**.

**Environment Hierarchy**:

```
Production (Highest Security)
    ↓
Staging (Must match or exceed Production security)
    ↓
Development (Must match or exceed Staging security)
```

### 6.2 Rule Enforcement

**The One Environment Rule is enforced as follows**:

| Security Control | Production | Staging | Development |
|------------------|------------|---------|-------------|
| **Encryption at-rest** | AES-256 | AES-256 | AES-256 |
| **Encryption in-transit** | TLS 1.3 | TLS 1.3 | TLS 1.3 |
| **Authentication** | MFA required | MFA required | MFA required |
| **Authorization** | RBAC | RBAC | RBAC |
| **Logging** | Genesis Archive™ (7 years) | Genesis Archive™ (7 years) | Local logs (30 days) |
| **Monitoring** | Sentinel™ (24/7) | Sentinel™ (24/7) | Optional |
| **Firewall** | Enabled (deny-all) | Enabled (deny-all) | Enabled (deny-all) |
| **Secrets Management** | AWS Secrets Manager | AWS Secrets Manager | AWS Secrets Manager |

**Rule Violations**:

❌ **PROHIBITED**: Staging with weaker encryption than Production  
❌ **PROHIBITED**: Development with no firewall (Production has firewall)  
❌ **PROHIBITED**: Staging with no MFA (Production requires MFA)  

✅ **PERMITTED**: Development with local logging (Production uses Genesis Archive™) — logging destination may differ, but logging must be enabled  
✅ **PERMITTED**: Development with smaller instance sizes (security controls remain the same)  

### 6.3 Rule Rationale

**The One Environment Rule ensures**:

1. **Security issues are caught early**: If staging mirrors production security, security issues are caught in staging before production deployment
2. **Consistent security posture**: All environments maintain minimum security baseline
3. **No security regression**: Lower environments cannot introduce security weaknesses
4. **Compliance**: Meets regulatory requirements for secure development lifecycle

### 6.4 Rule Verification

**The One Environment Rule is verified as follows**:

```bash
# Verify encryption in all environments
for env in production staging development; do
  echo "Checking $env..."
  terraform show -json | jq ".values.root_module.resources[] | select(.address == \"aws_db_instance.$env\") | .values.storage_encrypted"
done
# Expected: All environments return "true"
```

**Automated Verification** (CI/CD):

```yaml
# GitHub Actions (One Environment Rule verification)
name: Verify One Environment Rule
on:
  push:
    branches: [main, staging, development]

jobs:
  verify-rule:
    runs-on: ubuntu-latest
    steps:
      - name: Verify encryption in all environments
        run: |
          # Check production
          PROD_ENCRYPTION=$(terraform show -json | jq '.values.root_module.resources[] | select(.address == "aws_db_instance.production") | .values.storage_encrypted')
          
          # Check staging
          STAGING_ENCRYPTION=$(terraform show -json | jq '.values.root_module.resources[] | select(.address == "aws_db_instance.staging") | .values.storage_encrypted')
          
          # Check development
          DEV_ENCRYPTION=$(terraform show -json | jq '.values.root_module.resources[] | select(.address == "aws_db_instance.development") | .values.storage_encrypted')
          
          # Verify all environments have encryption enabled
          if [ "$PROD_ENCRYPTION" != "true" ] || [ "$STAGING_ENCRYPTION" != "true" ] || [ "$DEV_ENCRYPTION" != "true" ]; then
            echo "One Environment Rule violated: Encryption not enabled in all environments"
            exit 1
          fi
```

---

## 7. Environment Comparison Matrix

| Security Control | Production | Staging | Development | Notes |
|------------------|------------|---------|-------------|-------|
| **Data** | Real customer data | Redacted/synthetic data | Synthetic data only | Production only has real data |
| **Encryption at-rest** | AES-256 | AES-256 | AES-256 | Same across all environments |
| **Encryption in-transit** | TLS 1.3 | TLS 1.3 | TLS 1.3 | Same across all environments |
| **Authentication** | MFA required | MFA required | MFA required | Same across all environments |
| **Authorization** | RBAC | RBAC | RBAC | Same across all environments |
| **Logging** | Genesis Archive™ (7 years) | Genesis Archive™ (7 years) | Local logs (30 days) | Production/Staging use Genesis Archive™ |
| **Monitoring** | Sentinel™ (24/7) | Sentinel™ (24/7) | Optional | Production/Staging use Sentinel™ |
| **Firewall** | Enabled (deny-all) | Enabled (deny-all) | Enabled (deny-all) | Same across all environments |
| **Secrets Management** | AWS Secrets Manager | AWS Secrets Manager | AWS Secrets Manager | Same across all environments |
| **Multi-AZ** | Yes (3+ zones) | Yes (2+ zones) | No (single zone) | Production has highest availability |
| **Instance Size** | t3.xlarge | t3.medium | t3.small | Production has largest instances |
| **Access** | Restricted (authorized personnel) | Restricted (QA, DevOps) | Limited (development team) | Production has most restricted access |
| **Immutable Deployments** | Yes | Yes | No | Production/Staging are immutable |
| **Health Checks** | Every 30s | Every 30s | Optional | Production/Staging have health checks |
| **Readiness Probes** | Every 10s | Every 10s | Optional | Production/Staging have readiness probes |

---

## 8. Environment Promotion Process

**Code promotion follows this process**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Promotion Process                 │
└─────────────────────────────────────────────────────────────────┘

Step 1: DEVELOPMENT
   ↓
   • Code developed and tested locally
   • Unit tests passed
   • Code review completed
   • Merge to development branch
   ↓

Step 2: STAGING
   ↓
   • Deploy to staging environment
   • Integration tests passed
   • Regression tests passed
   • QA team approval
   • Merge to staging branch
   ↓

Step 3: PRODUCTION
   ↓
   • Deploy to production environment
   • Smoke tests passed
   • CTO/CISO approval
   • Merge to main branch
   • Monitor for 24 hours
```

**Promotion Requirements**:

| Promotion | Requirements | Approval |
|-----------|--------------|----------|
| **Development → Staging** | Unit tests passed, code review completed | Development Team Lead |
| **Staging → Production** | Integration tests passed, QA approval | CTO or CISO |

---

## 9. Compliance Mapping

### 9.1 NIST SP 800-53 Compliance

| Control | Requirement | GhostQuant Implementation |
|---------|-------------|--------------------------|
| **CM-2** | Baseline Configuration | Environment-specific baselines (this document) |
| **CM-6** | Configuration Settings | Secure environment configuration (this document) |

### 9.2 SOC 2 Compliance

| Criterion | Requirement | GhostQuant Implementation |
|-----------|-------------|--------------------------|
| **CC6.6** | Logical Access Security Measures | Environment access controls |
| **CC7.2** | System Operations Monitoring | Production/Staging monitoring (Sentinel™) |

### 9.3 FedRAMP Compliance

| Control | Requirement | GhostQuant Implementation |
|---------|-------------|--------------------------|
| **CM-2** | Baseline Configuration | Environment-specific baselines |
| **CM-6** | Configuration Settings | Secure environment configuration |

---

## 10. Cross-References

This document is part of the **GhostQuant Configuration Management & Hardening Standards Framework**. Related documents:

- **`config_management_overview.md`** — Configuration management overview
- **`baseline_configuration_policy.md`** — Baseline configuration policy
- **`system_hardening_standards.md`** — System hardening standards
- **`dependency_and_package_hardening.md`** — Dependency and package hardening
- **`configuration_monitoring_and_drift_management.md`** — Configuration monitoring and drift management
- **`config_compliance_report_template.md`** — Configuration compliance report template

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Technology Officer | Initial Secure Environment Configuration |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Technology Officer, Chief Information Security Officer

---

**END OF DOCUMENT**

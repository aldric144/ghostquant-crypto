# Data Anonymization & Pseudonymization

**Document ID**: GQ-PRIV-008  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document defines **when data must be anonymized**, **when pseudonymization applies**, and the **techniques used** for anonymizing and pseudonymizing personal data within **GhostQuant™**.

This document ensures compliance with:

- **GDPR Article 4(5)** — Pseudonymisation Definition
- **GDPR Recital 26** — Anonymisation
- **NIST SP 800-53 PT-4** — Consent for Disclosure of PII
- **NIST SP 800-53 PL-8** — Information Security Architecture
- **SOC 2 CC6.1** — Logical Access Controls
- **FedRAMP PT-4** — Consent for Disclosure

---

## 2. Definitions

### 2.1 Anonymization

**Definition** (GDPR Recital 26):
> "The principles of data protection should therefore not apply to anonymous information, namely information which does not relate to an identified or identifiable natural person or to personal data rendered anonymous in such a manner that the data subject is not or no longer identifiable."

**Key Characteristics**:
- **Irreversible**: Cannot be reversed to identify individuals
- **No longer personal data**: GDPR does not apply to anonymized data
- **High privacy protection**: Strongest form of data protection

**GhostQuant Use Cases**:
- Aggregated analytics (e.g., "80% of users use FIDO2 MFA")
- Public threat intelligence reports (no personal identifiers)
- Research datasets (no linkage to individuals)

---

### 2.2 Pseudonymization

**Definition** (GDPR Article 4(5)):
> "The processing of personal data in such a manner that the personal data can no longer be attributed to a specific data subject without the use of additional information, provided that such additional information is kept separately and is subject to technical and organisational measures to ensure that the personal data are not attributed to an identified or identifiable natural person."

**Key Characteristics**:
- **Reversible** (with additional information): Can be reversed to identify individuals if needed
- **Still personal data**: GDPR still applies to pseudonymized data
- **Reduced privacy risk**: Lower risk than storing identifiable data

**GhostQuant Use Cases**:
- Blockchain wallet addresses (hashed to SHA-256)
- Entity identifiers (hashed to SHA-256)
- User IDs in Genesis Archive™ (hashed where possible)
- IP addresses (hashed after 30 days)

---

## 3. When Data Must Be Anonymized

**GhostQuant anonymizes data when**:

### 3.1 Public Reporting

**Use Case**: Threat intelligence reports published to public or shared with law enforcement

**Anonymization Required**:
- Remove all personal identifiers (names, email addresses, usernames)
- Remove all blockchain wallet addresses (or replace with generic labels like "Wallet A", "Wallet B")
- Remove all IP addresses
- Remove all timestamps (or round to nearest hour/day)
- Aggregate data (e.g., "5 wallets involved" instead of listing individual wallets)

**Example**:

**Before Anonymization**:
```
Threat Actor: John Doe (john.doe@example.com)
Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
IP Address: 192.168.1.100
Timestamp: 2025-12-01 14:32:15 UTC
```

**After Anonymization**:
```
Threat Actor: Actor A
Wallet Address: Wallet A
IP Address: [REDACTED]
Timestamp: 2025-12-01 (date only)
```

---

### 3.2 Research and Analytics

**Use Case**: Internal research, machine learning training datasets, performance analytics

**Anonymization Required**:
- Remove all personal identifiers (names, email addresses, usernames)
- Replace user IDs with random IDs (no linkage to real users)
- Aggregate data (e.g., "Average session duration: 45 minutes")
- Add noise to data (differential privacy)

**Example**:

**Before Anonymization**:
```
User ID: uuid-12345
Session Duration: 45 minutes
Pages Visited: ["/terminal/predict", "/terminal/radar", "/terminal/constellation"]
```

**After Anonymization**:
```
User ID: random-67890 (no linkage to real user)
Session Duration: 45 minutes (±5 minutes noise)
Pages Visited: [aggregated across all users]
```

---

### 3.3 Data Sharing with Third Parties

**Use Case**: Sharing data with subprocessors, partners, or regulators

**Anonymization Required** (if possible):
- Remove all personal identifiers (names, email addresses, usernames)
- Replace blockchain wallet addresses with pseudonymous IDs
- Remove IP addresses
- Aggregate data where possible

**Exception**: If third party requires identifiable data (e.g., law enforcement investigation), use **pseudonymization** instead of anonymization, and require Data Processing Agreement (DPA).

---

## 4. When Pseudonymization Applies

**GhostQuant pseudonymizes data when**:

### 4.1 Blockchain Wallet Addresses

**Use Case**: Storing blockchain wallet addresses for threat analysis (Hydra™, Constellation™)

**Pseudonymization Technique**: **SHA-256 Hashing**

**Process**:
1. User submits wallet address: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
2. GhostQuant hashes wallet address: `SHA-256(wallet_address)` → `a3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0`
3. GhostQuant stores hashed wallet address in database
4. Original wallet address **not stored** (only hash)

**Benefits**:
- Original wallet address not stored in plaintext
- Hashed wallet address cannot be reverse-engineered
- Same wallet address always produces same hash (consistent entity tracking)
- Reduced privacy risk (wallet address not directly identifiable)

**Reversibility**:
- **Not reversible** without original wallet address
- GhostQuant does not store mapping between original and hashed wallet addresses
- If user submits same wallet address again, GhostQuant can match it to existing hash

---

### 4.2 Transaction Hashes

**Use Case**: Storing transaction hashes for threat analysis (Hydra™)

**Pseudonymization Technique**: **SHA-256 Hashing**

**Process**:
1. User submits transaction hash: `0x3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0`
2. GhostQuant hashes transaction hash: `SHA-256(tx_hash)` → `b4g6f9e0d2c3b5g7f8e9d0c1b2g3f4e5d6c7b8g9f0e1d2c3b4g5f6e7d8c9b0g1`
3. GhostQuant stores hashed transaction hash in database
4. Original transaction hash **not stored** (only hash)

---

### 4.3 Entity Identifiers

**Use Case**: Storing entity identifiers for threat intelligence (Constellation™, Actor Profiler)

**Pseudonymization Technique**: **SHA-256 Hashing**

**Process**:
1. User submits entity identifier (e.g., email address, social media handle): `user@example.com`
2. GhostQuant hashes entity identifier: `SHA-256(entity_id)` → `c5h7g0f1e3d4c6h8g9f0e1d2c3h4g5f6e7d8c9h0g1f2e3d4c5h6g7f8e9d0c1h2`
3. GhostQuant stores hashed entity identifier in database
4. Original entity identifier **not stored** (only hash)

---

### 4.4 IP Addresses

**Use Case**: Storing IP addresses for security monitoring (Sentinel Command Console™)

**Pseudonymization Technique**: **SHA-256 Hashing** (after 30 days)

**Process**:
1. User logs in from IP address: `192.168.1.100`
2. GhostQuant stores raw IP address for 30 days (security monitoring)
3. After 30 days, GhostQuant hashes IP address: `SHA-256(ip_address)` → `d6i8h1g2f4e5d7i9h0g1f2e3d4i5h6g7f8e9d0i1h2g3f4e5d6i7h8g9f0e1i2h3`
4. GhostQuant replaces raw IP address with hashed IP address in database
5. After 1 year, GhostQuant deletes hashed IP address

**Benefits**:
- Raw IP address available for 30 days (security monitoring, anomaly detection)
- After 30 days, IP address pseudonymized (reduced privacy risk)
- After 1 year, IP address deleted (data minimization)

---

### 4.5 User IDs in Genesis Archive™

**Use Case**: Storing user IDs in Genesis Archive™ for audit logging

**Pseudonymization Technique**: **SHA-256 Hashing** (where possible)

**Process**:
1. User performs action (e.g., privilege elevation)
2. GhostQuant logs event in Genesis Archive™
3. If event does not require user identification (e.g., system health check), user ID is pseudonymized: `SHA-256(user_id)` → `e7j9i2h3g5f6e8j0i1h2g3f4e5j6i7h8g9f0e1j2i3h4g5f6e7j8i9h0g1f2j3i4`
4. If event requires user identification (e.g., data subject rights request), user ID is stored in plaintext (legal obligation)

**Benefits**:
- User IDs pseudonymized where possible (reduced privacy risk)
- User IDs stored in plaintext only when required (legal obligation)

---

## 5. Anonymization and Pseudonymization Techniques

### 5.1 Tokenization

**Definition**: Replace sensitive data with non-sensitive tokens (random IDs)

**Use Case**: User IDs in research datasets

**Process**:
1. Original user ID: `uuid-12345`
2. Generate random token: `token-67890`
3. Store mapping: `uuid-12345` → `token-67890` (in separate, secure database)
4. Replace user ID with token in research dataset

**Benefits**:
- Original user ID not exposed in research dataset
- Reversible (with mapping table)
- Reduced privacy risk

**GhostQuant Implementation**:
- Used for internal research and analytics
- Mapping table stored in separate database (access restricted to SuperAdmin)

---

### 5.2 Hashing

**Definition**: Apply one-way cryptographic hash function to data (SHA-256)

**Use Case**: Blockchain wallet addresses, transaction hashes, entity identifiers, IP addresses

**Process**:
1. Original data: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
2. Apply SHA-256 hash: `SHA-256(data)` → `a3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0`
3. Store hashed data in database
4. Original data **not stored** (only hash)

**Benefits**:
- One-way (cannot be reversed)
- Same input always produces same hash (consistent entity tracking)
- Reduced privacy risk

**GhostQuant Implementation**:
- Used for blockchain wallet addresses, transaction hashes, entity identifiers, IP addresses
- SHA-256 algorithm (256-bit hash, cryptographically secure)

---

### 5.3 Masking

**Definition**: Replace part of sensitive data with asterisks or other characters

**Use Case**: API keys (display only last 4 characters)

**Process**:
1. Original API key: `abcdefghijklmnopqrstuvwxyz123456`
2. Mask all but last 4 characters: `********************************3456`
3. Display masked API key to user

**Benefits**:
- User can identify API key (last 4 characters)
- Full API key not exposed
- Reduced risk of API key theft

**GhostQuant Implementation**:
- Used for API keys (display only last 4 characters)
- Full API key stored as bcrypt hash (never displayed)

---

### 5.4 Redaction

**Definition**: Remove sensitive data entirely (replace with `[REDACTED]`)

**Use Case**: Public threat intelligence reports, law enforcement sharing

**Process**:
1. Original data: `Threat Actor: John Doe (john.doe@example.com)`
2. Redact personal identifiers: `Threat Actor: [REDACTED] ([REDACTED])`
3. Publish redacted report

**Benefits**:
- Personal identifiers completely removed
- No privacy risk
- Suitable for public reporting

**GhostQuant Implementation**:
- Used for public threat intelligence reports
- Manual review required before publication

---

### 5.5 Noise Injection

**Definition**: Add random noise to data to prevent re-identification

**Use Case**: Aggregated analytics, research datasets

**Process**:
1. Original data: `Session Duration: 45 minutes`
2. Add random noise: `Session Duration: 45 minutes ± 5 minutes` → `Session Duration: 47 minutes`
3. Use noisy data in analytics

**Benefits**:
- Prevents re-identification (noise makes it harder to link data to individuals)
- Preserves statistical properties (aggregate statistics remain accurate)
- Suitable for research and analytics

**GhostQuant Implementation**:
- Used for internal research and analytics
- Noise level: ±10% (e.g., session duration ±5 minutes)

---

### 5.6 Differential Privacy (High-Level)

**Definition**: Add calibrated noise to query results to prevent re-identification

**Use Case**: Public analytics dashboards, research datasets

**Process**:
1. User queries: "How many users logged in today?"
2. True answer: 1,234 users
3. Add differential privacy noise: 1,234 ± 10 → 1,244 users
4. Return noisy answer: 1,244 users

**Benefits**:
- Prevents re-identification (noise makes it impossible to determine if specific individual is in dataset)
- Preserves statistical properties (aggregate statistics remain accurate)
- Mathematically proven privacy guarantee

**GhostQuant Implementation**:
- **Not currently implemented** (future enhancement)
- Would be used for public analytics dashboards

---

## 6. Pseudonymization Examples

### 6.1 Example: Blockchain Wallet Address

**Original Wallet Address**:
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Pseudonymized Identifier** (SHA-256 hash):
```
a3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0
```

**Storage**:
```sql
INSERT INTO hydra_clusters (wallet_address_hash, cluster_id, risk_score)
VALUES ('a3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0', 'cluster-12345', 0.85);
```

**Benefits**:
- Original wallet address not stored in database
- Hashed wallet address cannot be reverse-engineered
- Same wallet address always produces same hash (consistent entity tracking)

---

### 6.2 Example: Transaction Hash

**Original Transaction Hash**:
```
0x3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0
```

**Pseudonymized Identifier** (SHA-256 hash):
```
b4g6f9e0d2c3b5g7f8e9d0c1b2g3f4e5d6c7b8g9f0e1d2c3b4g5f6e7d8c9b0g1
```

**Storage**:
```sql
INSERT INTO hydra_transactions (tx_hash, wallet_address_hash, amount, timestamp)
VALUES ('b4g6f9e0d2c3b5g7f8e9d0c1b2g3f4e5d6c7b8g9f0e1d2c3b4g5f6e7d8c9b0g1', 'a3f5e8d9c1b2a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0', 1.5, '2025-12-01 14:32:15');
```

---

### 6.3 Example: Entity Identifier

**Original Entity Identifier** (email address):
```
user@example.com
```

**Pseudonymized Identifier** (SHA-256 hash):
```
c5h7g0f1e3d4c6h8g9f0e1d2c3h4g5f6e7d8c9h0g1f2e3d4c5h6g7f8e9d0c1h2
```

**Storage**:
```sql
INSERT INTO constellation_entities (entity_id_hash, entity_type, risk_score)
VALUES ('c5h7g0f1e3d4c6h8g9f0e1d2c3h4g5f6e7d8c9h0g1f2e3d4c5h6g7f8e9d0c1h2', 'email', 0.65);
```

---

### 6.4 Example: IP Address

**Original IP Address**:
```
192.168.1.100
```

**Pseudonymized Identifier** (SHA-256 hash, after 30 days):
```
d6i8h1g2f4e5d7i9h0g1f2e3d4i5h6g7f8e9d0i1h2g3f4e5d6i7h8g9f0e1i2h3
```

**Storage**:
```sql
-- Day 0-30: Raw IP address
INSERT INTO auth_logs (user_id, ip_address, timestamp)
VALUES ('uuid-12345', '192.168.1.100', '2025-12-01 14:32:15');

-- Day 31+: Hashed IP address
UPDATE auth_logs
SET ip_address = 'd6i8h1g2f4e5d7i9h0g1f2e3d4i5h6g7f8e9d0i1h2g3f4e5d6i7h8g9f0e1i2h3'
WHERE timestamp < NOW() - INTERVAL '30 days';
```

---

### 6.5 Example: API Key

**Original API Key**:
```
abcdefghijklmnopqrstuvwxyz123456
```

**Pseudonymized Identifier** (bcrypt hash):
```
$2b$12$KIXxBz.Hf8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0
```

**Display to User** (masked):
```
********************************3456
```

**Storage**:
```sql
INSERT INTO api_keys (user_id, api_key_hash, api_key_last_4, created_at)
VALUES ('uuid-12345', '$2b$12$KIXxBz.Hf8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', '3456', '2025-12-01 14:32:15');
```

---

## 7. Anonymization Examples

### 7.1 Example: Public Threat Intelligence Report

**Before Anonymization**:
```
Threat Intelligence Report — Manipulation Ring Detection

Threat Actor: John Doe (john.doe@example.com)
Wallet Addresses:
- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (Balance: 10.5 BTC)
- 0x8a3f6e9d1c2b4a5f7e8d9c0b1a2f3e4d5c6b7a8f (Balance: 5.2 BTC)

IP Address: 192.168.1.100
Location: New York, USA
Timestamp: 2025-12-01 14:32:15 UTC

Behavioral Pattern:
- Logged in 15 times in past 24 hours
- Submitted 50 prediction requests
- Uploaded 10 wallet screenshots
```

**After Anonymization**:
```
Threat Intelligence Report — Manipulation Ring Detection

Threat Actor: Actor A
Wallet Addresses:
- Wallet A (Balance: [REDACTED])
- Wallet B (Balance: [REDACTED])

IP Address: [REDACTED]
Location: United States (country only)
Timestamp: 2025-12-01 (date only)

Behavioral Pattern:
- Logged in 10-20 times in past 24 hours (range)
- Submitted 40-60 prediction requests (range)
- Uploaded 5-15 wallet screenshots (range)
```

---

### 7.2 Example: Aggregated Analytics

**Before Anonymization** (individual user data):
```
User ID: uuid-12345, Session Duration: 45 minutes
User ID: uuid-67890, Session Duration: 30 minutes
User ID: uuid-11111, Session Duration: 60 minutes
```

**After Anonymization** (aggregated data):
```
Average Session Duration: 45 minutes
Median Session Duration: 45 minutes
Total Users: 3
```

---

### 7.3 Example: Research Dataset

**Before Anonymization**:
```
User ID: uuid-12345
Email: john.doe@example.com
Login Timestamp: 2025-12-01 14:32:15
Session Duration: 45 minutes
Pages Visited: ["/terminal/predict", "/terminal/radar", "/terminal/constellation"]
```

**After Anonymization**:
```
User ID: random-67890 (no linkage to real user)
Email: [REMOVED]
Login Timestamp: 2025-12-01 14:00:00 (rounded to nearest hour)
Session Duration: 47 minutes (±5 minutes noise)
Pages Visited: [aggregated across all users]
```

---

## 8. NIST 800-53 References

### 8.1 NIST SP 800-53 PT-4 — Consent for Disclosure of PII

**NIST Requirement**:
> "The organization obtains consent, where feasible and appropriate, from individuals prior to any disclosure of personally identifiable information (PII)."

**GhostQuant Compliance**:
- ✅ Pseudonymization reduces need for consent (data no longer directly identifiable)
- ✅ Anonymization eliminates need for consent (data no longer personal data)

### 8.2 NIST SP 800-53 PL-8 — Information Security Architecture

**NIST Requirement**:
> "The organization designs its information security architecture using a defense-in-depth approach that allocates [Assignment: organization-defined security safeguards] to [Assignment: organization-defined locations and architectural layers]."

**GhostQuant Compliance**:
- ✅ Pseudonymization as defense-in-depth layer (reduces privacy risk even if database breached)
- ✅ Anonymization for public reporting (eliminates privacy risk)

---

## 9. Compliance Mapping

### 9.1 GDPR Article 4(5) — Pseudonymisation

**GDPR Definition**:
> "Pseudonymisation means the processing of personal data in such a manner that the personal data can no longer be attributed to a specific data subject without the use of additional information."

**GhostQuant Compliance**:
- ✅ Blockchain wallet addresses pseudonymized (SHA-256 hashing)
- ✅ Entity identifiers pseudonymized (SHA-256 hashing)
- ✅ IP addresses pseudonymized after 30 days (SHA-256 hashing)
- ✅ User IDs in Genesis Archive™ pseudonymized where possible

### 9.2 GDPR Recital 26 — Anonymisation

**GDPR Recital**:
> "The principles of data protection should therefore not apply to anonymous information, namely information which does not relate to an identified or identifiable natural person."

**GhostQuant Compliance**:
- ✅ Public threat intelligence reports anonymized (all personal identifiers removed)
- ✅ Research datasets anonymized (no linkage to individuals)
- ✅ Aggregated analytics anonymized (no individual-level data)

---

## 10. Cross-References

This document is part of the **GhostQuant Privacy Shield & Data Minimization Framework**. Related documents:

- **`privacy_shield_overview.md`** — Privacy Shield principles and regulatory alignment
- **`data_minimization_policy.md`** — Strict data minimization policy
- **`data_flow_mapping.md`** — System-wide data flow map
- **`data_retention_schedule.md`** — Retention matrix for all data types
- **`privacy_risk_assessment.md`** — Privacy risk assessment
- **`personal_data_registry.md`** — Registry of all personal data categories
- **`data_subject_rights_process.md`** — GDPR data subject rights procedures
- **`sensitive_data_handling.md`** — Prohibited data rules and secure handling

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Privacy Officer | Initial Data Anonymization & Pseudonymization |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Privacy Officer, Chief Information Security Officer, Chief Technology Officer

---

**END OF DOCUMENT**

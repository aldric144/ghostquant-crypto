# Secure Coding Standards

**Document ID**: GQ-SSDLC-005  
**Version**: 1.0  
**Effective Date**: 2025-12-01  
**Classification**: Internal — Compliance Framework  
**Owner**: Chief Technology Officer  
**Review Cycle**: Annual

---

## 1. Purpose

This document establishes **secure coding standards** for **GhostQuant™**, including standards for **Python backend**, **TypeScript/React frontend**, **universal rules**, and a **"Do NOT Allow" list** of prohibited practices.

All developers MUST follow these standards. Code that violates these standards will be rejected during code review.

This document ensures compliance with:

- **NIST SP 800-53 SA-15** — Development Process, Standards, and Tools
- **SOC 2 CC5.1** — Control Activities
- **OWASP Top 10** — Web Application Security Risks
- **CWE Top 25** — Most Dangerous Software Weaknesses

---

## 2. Python Backend Secure Coding Standards

### 2.1 Input Validation

**ALL user input MUST be validated**:

```python
# ✅ CORRECT: Validate input
from pydantic import BaseModel, validator

class PredictionRequest(BaseModel):
    token_symbol: str
    timeframe: str
    
    @validator('token_symbol')
    def validate_token_symbol(cls, v):
        allowed_symbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC']
        if v not in allowed_symbols:
            raise ValueError(f'Invalid token symbol: {v}')
        return v
    
    @validator('timeframe')
    def validate_timeframe(cls, v):
        allowed_timeframes = ['1h', '4h', '1d', '1w']
        if v not in allowed_timeframes:
            raise ValueError(f'Invalid timeframe: {v}')
        return v

# ❌ INCORRECT: No input validation
def predict(token_symbol: str, timeframe: str):
    # Directly use user input without validation
    result = engine.predict(token_symbol, timeframe)
    return result
```

**Input Validation Rules**:
- ✅ Use Pydantic models for all API request validation
- ✅ Whitelist allowed values (do NOT blacklist)
- ✅ Validate data types (str, int, float, bool)
- ✅ Validate string length (min/max)
- ✅ Validate numeric ranges (min/max)
- ✅ Reject invalid input with clear error message

---

### 2.2 No Throwing Uncaught Exceptions

**ALL exceptions MUST be caught and handled**:

```python
# ✅ CORRECT: Catch and handle exceptions
from fastapi import HTTPException

@app.post("/api/predict")
async def predict(request: PredictionRequest):
    try:
        result = engine.predict(request.token_symbol, request.timeframe)
        return {"prediction": result}
    except ValueError as e:
        # Log error with full details
        logger.error(f"Prediction failed: {e}", exc_info=True)
        # Return generic error to user
        raise HTTPException(status_code=400, detail="Invalid prediction request")
    except Exception as e:
        # Log error with full details
        logger.error(f"Unexpected error: {e}", exc_info=True)
        # Return generic error to user
        raise HTTPException(status_code=500, detail="Internal server error")

# ❌ INCORRECT: Uncaught exceptions
@app.post("/api/predict")
async def predict(request: PredictionRequest):
    # No try/except block
    result = engine.predict(request.token_symbol, request.timeframe)
    return {"prediction": result}
```

**Exception Handling Rules**:
- ✅ Catch all exceptions (use try/except)
- ✅ Log full error details (stack trace, input parameters)
- ✅ Return generic error message to user (do NOT reveal sensitive information)
- ✅ Use appropriate HTTP status codes (400, 401, 403, 404, 500)

---

### 2.3 Hashing Rules (SHA-256 for Integrity)

**Use SHA-256 for data integrity, bcrypt for passwords**:

```python
# ✅ CORRECT: SHA-256 for wallet address pseudonymization
import hashlib

def pseudonymize_wallet_address(wallet_address: str) -> str:
    """Pseudonymize wallet address using SHA-256"""
    return hashlib.sha256(wallet_address.encode()).hexdigest()

# ✅ CORRECT: bcrypt for password hashing
import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt (cost factor 12)"""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())

# ❌ INCORRECT: MD5 for hashing (broken, collision attacks)
import hashlib
hashed = hashlib.md5(password.encode()).hexdigest()

# ❌ INCORRECT: Plain text password storage
password = "my_password"  # NEVER store plain text passwords
```

**Hashing Rules**:
- ✅ Use SHA-256 for data integrity (wallet addresses, transaction hashes, file checksums)
- ✅ Use bcrypt for password hashing (cost factor 12)
- ✅ Use bcrypt for API key hashing (cost factor 12)
- ❌ Do NOT use MD5 (broken, collision attacks)
- ❌ Do NOT use SHA-1 (broken, collision attacks)
- ❌ Do NOT store plain text passwords

---

### 2.4 Secure Random Usage

**Use cryptographically secure random number generation**:

```python
# ✅ CORRECT: Use secrets module for cryptographic randomness
import secrets

# Generate random API key
api_key = secrets.token_urlsafe(32)

# Generate random session token
session_token = secrets.token_hex(32)

# Generate random MFA secret
mfa_secret = secrets.token_urlsafe(16)

# ❌ INCORRECT: Use random module (NOT cryptographically secure)
import random
api_key = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=32))
```

**Secure Random Rules**:
- ✅ Use `secrets` module for cryptographic randomness
- ✅ Use `secrets.token_urlsafe()` for URL-safe tokens
- ✅ Use `secrets.token_hex()` for hexadecimal tokens
- ❌ Do NOT use `random` module for security-sensitive operations

---

### 2.5 Logging & Sanitization

**Log security events, sanitize sensitive data**:

```python
# ✅ CORRECT: Log security events, sanitize sensitive data
import logging

logger = logging.getLogger(__name__)

@app.post("/api/predict")
async def predict(request: PredictionRequest, user: User = Depends(get_current_user)):
    try:
        result = engine.predict(request.token_symbol, request.timeframe)
        
        # Log prediction request (sanitize sensitive data)
        logger.info(
            f"Prediction request: user_id={user.id}, "
            f"token_symbol={request.token_symbol}, "
            f"timeframe={request.timeframe}, "
            f"result={result}"
        )
        
        # Log to Genesis Archive™ (tamper-evident audit trail)
        genesis.log_event(
            event_type="prediction_request",
            user_id=user.id,
            data={
                "token_symbol": request.token_symbol,
                "timeframe": request.timeframe,
                "result": result
            }
        )
        
        return {"prediction": result}
    except Exception as e:
        # Log error with full details
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# ❌ INCORRECT: Log sensitive data (passwords, API keys)
logger.info(f"User login: username={username}, password={password}")  # NEVER log passwords
logger.info(f"API key: {api_key}")  # NEVER log API keys
```

**Logging Rules**:
- ✅ Log all security events (authentication, authorization, errors)
- ✅ Log to Genesis Archive™ (tamper-evident audit trail)
- ✅ Sanitize sensitive data (mask passwords, API keys, session tokens)
- ✅ Include context (user ID, timestamp, action, result)
- ❌ Do NOT log passwords
- ❌ Do NOT log API keys (mask with `***` or show only last 4 characters)
- ❌ Do NOT log session tokens

---

### 2.6 Prohibition of Inline Secrets

**Secrets MUST NOT be hardcoded in code**:

```python
# ✅ CORRECT: Load secrets from environment variables
import os

DATABASE_PASSWORD = os.getenv("GHOSTQUANT_DATABASE_PASSWORD")
JWT_SECRET = os.getenv("GHOSTQUANT_JWT_SECRET")
AWS_ACCESS_KEY_ID = os.getenv("GHOSTQUANT_AWS_ACCESS_KEY_ID")

# ✅ CORRECT: Load secrets from AWS Secrets Manager
import boto3

def get_secret(secret_name: str) -> str:
    """Load secret from AWS Secrets Manager"""
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return response['SecretString']

DATABASE_PASSWORD = get_secret("ghostquant/database/password")

# ❌ INCORRECT: Hardcoded secrets
DATABASE_PASSWORD = "my_password"  # NEVER hardcode passwords
JWT_SECRET = "my_secret_key"  # NEVER hardcode secrets
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"  # NEVER hardcode AWS keys
```

**Secret Management Rules**:
- ✅ Load secrets from environment variables
- ✅ Load secrets from AWS Secrets Manager or AWS Systems Manager Parameter Store
- ✅ Rotate secrets quarterly (passwords, API keys, JWT secret)
- ❌ Do NOT hardcode secrets in code
- ❌ Do NOT commit secrets to Git

---

### 2.7 Strict Error Messages

**Error messages MUST NOT reveal sensitive information**:

```python
# ✅ CORRECT: Generic error messages
@app.post("/api/auth/login")
async def login(username: str, password: str):
    user = get_user_by_username(username)
    if not user or not verify_password(password, user.password_hash):
        # Generic error message (do NOT reveal if username or password is wrong)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate session token
    session_token = create_session_token(user.id)
    return {"session_token": session_token}

# ❌ INCORRECT: Specific error messages (reveal information)
@app.post("/api/auth/login")
async def login(username: str, password: str):
    user = get_user_by_username(username)
    if not user:
        # Reveals that username does not exist
        raise HTTPException(status_code=401, detail="Username not found")
    
    if not verify_password(password, user.password_hash):
        # Reveals that password is wrong
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    session_token = create_session_token(user.id)
    return {"session_token": session_token}
```

**Error Message Rules**:
- ✅ Return generic error messages to user ("Invalid credentials", "Internal server error")
- ✅ Log full error details for debugging (stack trace, input parameters)
- ❌ Do NOT reveal sensitive information (usernames, file paths, database schema)
- ❌ Do NOT reveal system information (software versions, server names)

---

### 2.8 Protection Against Injection-Type Issues

**Use parameterized queries, avoid string concatenation**:

```python
# ✅ CORRECT: Parameterized queries (prevent SQL injection)
from sqlalchemy import text

def get_user_by_username(username: str):
    query = text("SELECT * FROM users WHERE username = :username")
    result = db.execute(query, {"username": username})
    return result.fetchone()

# ✅ CORRECT: ORM (SQLAlchemy prevents SQL injection)
from sqlalchemy.orm import Session

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# ❌ INCORRECT: String concatenation (SQL injection vulnerability)
def get_user_by_username(username: str):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    result = db.execute(query)
    return result.fetchone()

# ❌ INCORRECT: String formatting (SQL injection vulnerability)
def get_user_by_username(username: str):
    query = "SELECT * FROM users WHERE username = '%s'" % username
    result = db.execute(query)
    return result.fetchone()
```

**Injection Prevention Rules**:
- ✅ Use parameterized queries (SQLAlchemy, psycopg2)
- ✅ Use ORM (SQLAlchemy prevents SQL injection)
- ✅ Validate all user input (whitelist allowed values)
- ❌ Do NOT use string concatenation for SQL queries
- ❌ Do NOT use string formatting for SQL queries
- ❌ Do NOT use `eval()` or `exec()` with user input

---

## 3. TypeScript/React Frontend Secure Coding Standards

### 3.1 No Directly Handling Secrets

**Secrets MUST NOT be stored in frontend code**:

```typescript
// ✅ CORRECT: No secrets in frontend
// API calls use session token (stored in httpOnly cookie)
const response = await fetch('/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include httpOnly cookie
  body: JSON.stringify({ token_symbol: 'BTC', timeframe: '1h' }),
});

// ❌ INCORRECT: API key in frontend (exposed to users)
const API_KEY = 'my_api_key'; // NEVER store API keys in frontend
const response = await fetch('/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY, // Exposed to users
  },
  body: JSON.stringify({ token_symbol: 'BTC', timeframe: '1h' }),
});
```

**Secret Management Rules**:
- ✅ Use session tokens (stored in httpOnly cookies)
- ✅ Use backend API for authentication (frontend never sees passwords)
- ❌ Do NOT store API keys in frontend
- ❌ Do NOT store passwords in frontend
- ❌ Do NOT store secrets in localStorage or sessionStorage

---

### 3.2 Input Sanitization

**Sanitize all user input before processing**:

```typescript
// ✅ CORRECT: Sanitize input
import DOMPurify from 'dompurify';

function SearchBox() {
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    // Sanitize input before sending to backend
    const sanitizedQuery = DOMPurify.sanitize(query);
    fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: sanitizedQuery }),
    });
  };
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
    />
  );
}

// ❌ INCORRECT: No input sanitization
function SearchBox() {
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    // No sanitization (XSS vulnerability)
    fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: query }),
    });
  };
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
    />
  );
}
```

**Input Sanitization Rules**:
- ✅ Sanitize all user input (use DOMPurify)
- ✅ Validate input on frontend (client-side validation)
- ✅ Validate input on backend (server-side validation, defense in depth)
- ❌ Do NOT trust user input

---

### 3.3 Escape User Content

**Escape all user-generated content before rendering**:

```typescript
// ✅ CORRECT: React automatically escapes content
function UserProfile({ username }: { username: string }) {
  // React automatically escapes {username}
  return <div>Welcome, {username}!</div>;
}

// ✅ CORRECT: Use dangerouslySetInnerHTML with sanitized content
import DOMPurify from 'dompurify';

function RichTextDisplay({ html }: { html: string }) {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

// ❌ INCORRECT: Use dangerouslySetInnerHTML without sanitization
function RichTextDisplay({ html }: { html: string }) {
  // XSS vulnerability (user can inject JavaScript)
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

**Output Encoding Rules**:
- ✅ Use React's automatic escaping (default behavior)
- ✅ Sanitize HTML before using `dangerouslySetInnerHTML` (use DOMPurify)
- ✅ Use Content Security Policy (CSP) to prevent XSS
- ❌ Do NOT use `dangerouslySetInnerHTML` without sanitization

---

### 3.4 Secure Fetch Pattern

**Use secure fetch pattern with error handling**:

```typescript
// ✅ CORRECT: Secure fetch pattern
async function fetchPrediction(tokenSymbol: string, timeframe: string) {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include httpOnly cookie
      body: JSON.stringify({ token_symbol: tokenSymbol, timeframe: timeframe }),
    });
    
    if (!response.ok) {
      // Handle HTTP errors
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      } else if (response.status === 403) {
        throw new Error('Forbidden. You do not have permission.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else {
        throw new Error('Prediction failed. Please try again.');
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Log error (do NOT expose to user)
    console.error('Prediction error:', error);
    // Show generic error to user
    throw new Error('Prediction failed. Please try again.');
  }
}

// ❌ INCORRECT: No error handling
async function fetchPrediction(tokenSymbol: string, timeframe: string) {
  const response = await fetch('/api/predict', {
    method: 'POST',
    body: JSON.stringify({ token_symbol: tokenSymbol, timeframe: timeframe }),
  });
  const data = await response.json();
  return data;
}
```

**Secure Fetch Rules**:
- ✅ Use `credentials: 'include'` to include httpOnly cookies
- ✅ Handle HTTP errors (401, 403, 429, 500)
- ✅ Catch exceptions (network errors, JSON parsing errors)
- ✅ Show generic error messages to user
- ❌ Do NOT expose error details to user

---

### 3.5 Side-Effect Isolation

**Isolate side effects in useEffect hooks**:

```typescript
// ✅ CORRECT: Isolate side effects in useEffect
function PredictionConsole() {
  const [prediction, setPrediction] = useState<string | null>(null);
  
  useEffect(() => {
    // Side effect: Fetch prediction on component mount
    async function fetchPrediction() {
      try {
        const data = await fetch('/api/predict', {
          method: 'POST',
          body: JSON.stringify({ token_symbol: 'BTC', timeframe: '1h' }),
        });
        const result = await data.json();
        setPrediction(result.prediction);
      } catch (error) {
        console.error('Prediction error:', error);
      }
    }
    
    fetchPrediction();
  }, []); // Empty dependency array (run once on mount)
  
  return <div>Prediction: {prediction}</div>;
}

// ❌ INCORRECT: Side effects in render function
function PredictionConsole() {
  const [prediction, setPrediction] = useState<string | null>(null);
  
  // Side effect in render function (causes infinite loop)
  fetch('/api/predict', {
    method: 'POST',
    body: JSON.stringify({ token_symbol: 'BTC', timeframe: '1h' }),
  }).then((data) => data.json()).then((result) => setPrediction(result.prediction));
  
  return <div>Prediction: {prediction}</div>;
}
```

**Side-Effect Rules**:
- ✅ Isolate side effects in `useEffect` hooks
- ✅ Specify dependency array (prevent infinite loops)
- ✅ Clean up side effects (return cleanup function)
- ❌ Do NOT perform side effects in render function

---

## 4. Universal Rules

### 4.1 Use of Safe Libraries

**Use well-maintained, secure libraries**:

```python
# ✅ CORRECT: Use well-maintained libraries
import bcrypt  # Password hashing
import pydantic  # Input validation
import sqlalchemy  # ORM (prevents SQL injection)
import cryptography  # Encryption

# ❌ INCORRECT: Use deprecated or unmaintained libraries
import md5  # Deprecated (use hashlib.sha256 instead)
import pickle  # Insecure deserialization (use JSON instead)
```

**Library Selection Rules**:
- ✅ Use well-maintained libraries (active development, security updates)
- ✅ Use official libraries (PyPI, npm)
- ✅ Scan dependencies for vulnerabilities (Dependabot, Snyk)
- ❌ Do NOT use deprecated libraries
- ❌ Do NOT use unmaintained libraries

---

### 4.2 Dependency Reviews

**Review all dependencies before adding**:

```bash
# ✅ CORRECT: Review dependency before adding
# 1. Check package on PyPI/npm (verify official package)
# 2. Check GitHub repository (verify active development)
# 3. Check security advisories (verify no known vulnerabilities)
# 4. Check license (verify compatible with GhostQuant license)
# 5. Add dependency to requirements.txt or package.json

# ❌ INCORRECT: Add dependency without review
pip install random_package  # Do NOT install without review
```

**Dependency Review Rules**:
- ✅ Review package on PyPI/npm (verify official package)
- ✅ Review GitHub repository (verify active development)
- ✅ Review security advisories (verify no known vulnerabilities)
- ✅ Review license (verify compatible with GhostQuant license)
- ❌ Do NOT add dependencies without review

---

### 4.3 Memory Safety (No Unbounded Structures)

**Avoid unbounded data structures (prevent memory exhaustion)**:

```python
# ✅ CORRECT: Bounded data structures
from collections import deque

# Use deque with maxlen (automatically removes oldest items)
recent_predictions = deque(maxlen=1000)

# ✅ CORRECT: Limit list size
predictions = []
for item in data:
    if len(predictions) >= 1000:
        break
    predictions.append(item)

# ❌ INCORRECT: Unbounded list (memory exhaustion)
predictions = []
for item in data:
    predictions.append(item)  # No limit (could exhaust memory)
```

**Memory Safety Rules**:
- ✅ Use bounded data structures (deque with maxlen)
- ✅ Limit list/dict size (prevent memory exhaustion)
- ✅ Use generators for large datasets (lazy evaluation)
- ❌ Do NOT use unbounded data structures

---

### 4.4 Logging Standards

**Follow logging standards**:

```python
# ✅ CORRECT: Structured logging
import logging

logger = logging.getLogger(__name__)

logger.info(
    "Prediction request",
    extra={
        "user_id": user.id,
        "token_symbol": request.token_symbol,
        "timeframe": request.timeframe,
        "result": result,
    }
)

# ❌ INCORRECT: Unstructured logging
logger.info(f"User {user.id} requested prediction for {request.token_symbol}")
```

**Logging Standards**:
- ✅ Use structured logging (JSON format)
- ✅ Include context (user ID, timestamp, action, result)
- ✅ Use appropriate log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- ✅ Log to Genesis Archive™ (tamper-evident audit trail)
- ❌ Do NOT log sensitive data (passwords, API keys, session tokens)

---

### 4.5 Code Review Requirements

**All code MUST be reviewed before merging**:

```bash
# ✅ CORRECT: Code review workflow
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Implement feature
# ... write code ...

# 3. Commit changes
git add .
git commit -m "Implement my feature"

# 4. Push to GitHub
git push origin feature/my-feature

# 5. Create pull request
# ... create PR on GitHub ...

# 6. Request code review
# ... request review from team member ...

# 7. Address feedback
# ... make changes based on feedback ...

# 8. Merge after approval
# ... merge PR after approval ...

# ❌ INCORRECT: Merge without review
git checkout main
git merge feature/my-feature  # Do NOT merge without review
git push origin main
```

**Code Review Rules**:
- ✅ All code MUST be reviewed by at least one other developer
- ✅ High-risk code MUST be reviewed by senior developer or security architect
- ✅ No self-approval (cannot approve own PR)
- ✅ Address all feedback before merging
- ❌ Do NOT merge without review

---

### 4.6 Branch Protection

**Enforce branch protection on main branch**:

```yaml
# GitHub branch protection settings
branch_protection:
  branch: main
  required_reviews: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  required_status_checks:
    - SAST (Bandit, ESLint)
    - Unit tests
    - Dependency scan
  enforce_admins: true
  restrictions:
    users: []
    teams: []
```

**Branch Protection Rules**:
- ✅ Require at least 1 code review before merging
- ✅ Dismiss stale reviews (when new commits pushed)
- ✅ Require code owner reviews (for high-risk files)
- ✅ Require status checks (SAST, unit tests, dependency scan)
- ✅ Enforce for admins (no exceptions)
- ❌ Do NOT allow direct commits to main branch

---

## 5. "Do NOT Allow" List

**The following practices are PROHIBITED**:

### 5.1 Prohibited Practices

❌ **Hardcoded Secrets**
- Do NOT hardcode passwords, API keys, JWT secrets
- Use environment variables or AWS Secrets Manager

❌ **SQL Injection**
- Do NOT use string concatenation for SQL queries
- Use parameterized queries or ORM

❌ **XSS (Cross-Site Scripting)**
- Do NOT use `dangerouslySetInnerHTML` without sanitization
- Use React's automatic escaping or DOMPurify

❌ **Insecure Hashing**
- Do NOT use MD5 or SHA-1 for passwords
- Use bcrypt (cost factor 12)

❌ **Plain Text Passwords**
- Do NOT store plain text passwords
- Use bcrypt hashing

❌ **Logging Sensitive Data**
- Do NOT log passwords, API keys, session tokens
- Mask sensitive data in logs

❌ **Uncaught Exceptions**
- Do NOT allow uncaught exceptions
- Use try/except blocks

❌ **Revealing Error Messages**
- Do NOT reveal sensitive information in error messages
- Use generic error messages

❌ **Insecure Random**
- Do NOT use `random` module for security-sensitive operations
- Use `secrets` module

❌ **Direct Commits to Main**
- Do NOT commit directly to main branch
- Use pull requests with code review

❌ **Self-Approval**
- Do NOT approve own pull requests
- Request review from team member

❌ **Unbounded Data Structures**
- Do NOT use unbounded lists/dicts
- Use bounded data structures (deque with maxlen)

❌ **Deprecated Libraries**
- Do NOT use deprecated or unmaintained libraries
- Use well-maintained libraries

❌ **Eval/Exec with User Input**
- Do NOT use `eval()` or `exec()` with user input
- Validate and sanitize all input

❌ **Secrets in Frontend**
- Do NOT store API keys or passwords in frontend
- Use session tokens (httpOnly cookies)

---

## 6. Cross-References

This document is part of the **GhostQuant SSDLC Compliance Framework**. Related documents:

- **`ssdlc_overview.md`** — SSDLC overview and 7 stages
- **`ssdlc_policy.md`** — Core SSDLC policy
- **`secure_requirements_engineering.md`** — Security requirements engineering
- **`secure_architecture_design.md`** — Secure architecture design
- **`vulnerability_management_process.md`** — Vulnerability management
- **`penetration_testing_and_code_review.md`** — Penetration testing and code review

---

## 7. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-01 | Chief Technology Officer | Initial Secure Coding Standards |

**Next Review Date**: 2026-12-01  
**Approval**: Chief Technology Officer, Chief Information Security Officer, Security Architect

---

**END OF DOCUMENT**

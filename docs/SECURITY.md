# Security Documentation

## Overview

This document outlines the security architecture, best practices, and incident response procedures for the HumanGlue platform. Our security implementation follows industry standards and implements defense-in-depth principles.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Authorization & Access Control](#authorization--access-control)
3. [Data Protection](#data-protection)
4. [Security Features](#security-features)
5. [Security Best Practices](#security-best-practices)
6. [Incident Response](#incident-response)
7. [Compliance](#compliance)
8. [Security Checklist](#security-checklist)

---

## Authentication System

### Overview

We use Supabase Auth for authentication, providing secure, battle-tested authentication with the following features:

- Email/password authentication
- Email verification
- Password reset flows
- Session management with JWT tokens
- Secure cookie-based sessions

### Authentication Flow

1. **Sign Up**
   - User provides email, password, and profile information
   - Password is validated against security requirements
   - Email verification sent
   - User profile created in database
   - Instructor profile created if applicable

2. **Sign In**
   - Credentials validated
   - Rate limiting applied (5 attempts per 15 minutes)
   - Account lockout after 5 failed attempts (15-minute lockout)
   - Successful login creates session
   - Audit log entry created

3. **Password Reset**
   - User requests reset via email
   - Rate limited (3 requests per hour)
   - Secure token sent via email
   - Token expires after 1 hour
   - User sets new password via secure page

### Password Requirements

Passwords must meet the following criteria:

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)
- Not a common password
- No sequential characters (123, abc)
- No repeated characters (aaa, 111)
- Cannot contain email username

### Session Management

- Sessions stored in httpOnly cookies
- Automatic session refresh
- Session expiration after inactivity
- Secure cookie attributes:
  - `httpOnly: true` (prevent JavaScript access)
  - `secure: true` (HTTPS only in production)
  - `sameSite: 'strict'` (CSRF protection)

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

The platform implements role-based access control with the following roles:

#### 1. Admin
- Full platform access
- User management
- Organization management
- System configuration
- View all audit logs

#### 2. Org Admin
- Organization-wide access
- Manage organization users
- View organization data
- Cannot access other organizations

#### 3. Team Lead
- Team-level access
- Manage team members
- View team data

#### 4. Instructor
- Create and manage courses
- View enrolled students
- Grade assessments
- Cannot access other instructors' data

#### 5. Client/Student
- Enroll in courses
- Submit assessments
- View own progress
- Cannot access other students' data

### Route Protection

Next.js middleware enforces authentication and authorization:

```
/admin/*          → requires admin role
/instructor/*     → requires instructor role
/client/*         → requires client role
/dashboard        → requires authentication
/                 → public
```

### Row-Level Security (RLS)

Database access is controlled via Supabase RLS policies:

- Users can only see their own data
- Instructors can only see their students
- Organization members can only see org data
- Admins can see everything

---

## Data Protection

### Encryption

#### Data at Rest
- All data encrypted in Supabase PostgreSQL database
- AES-256 encryption
- Encrypted backups

#### Data in Transit
- HTTPS/TLS 1.3 for all connections
- Secure WebSocket connections
- HSTS headers enforced

### Sensitive Data Handling

- Passwords hashed with bcrypt
- API keys stored in environment variables
- PII encrypted in database
- No sensitive data in logs
- Secure session tokens

### Data Privacy

- GDPR compliance
- Data minimization
- Right to erasure
- Data portability
- Privacy by design

---

## Security Features

### 1. Rate Limiting

Protects against brute force attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Signup | 3 attempts | 1 hour |
| Password Reset | 3 attempts | 1 hour |
| Password Update | 5 attempts | 1 hour |

### 2. Account Lockout

- Lock after 5 failed login attempts
- 15-minute lockout duration
- Email notification on lockout
- Admin can manually unlock
- Automatic unlock after timeout

### 3. CSRF Protection

- Double-submit cookie pattern
- CSRF tokens on all mutations
- Token validation on POST/PUT/DELETE
- Automatic token refresh

### 4. Security Headers

HTTP security headers applied to all responses:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: [configured policy]
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 5. Audit Logging

All authentication events are logged:

- Login success/failure
- Password changes
- Account lockouts
- Email verification
- Suspicious activity
- Rate limit violations

Audit logs include:
- User ID
- Event type
- IP address
- User agent
- Timestamp
- Additional metadata

### 6. Input Validation

- Zod schema validation on all inputs
- SQL injection protection (parameterized queries)
- XSS protection (sanitized outputs)
- File upload validation
- Email validation

---

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env.local` for sensitive values
   - Keep `.env.example` with placeholders
   - Run `npm run scan-secrets` before committing

2. **Use environment variables**
   ```typescript
   // Good
   const apiKey = process.env.API_KEY

   // Bad
   const apiKey = 'sk_live_abc123...'
   ```

3. **Validate all inputs**
   ```typescript
   const validation = validateData(schema, input)
   if (!validation.success) {
     return error(validation.errors)
   }
   ```

4. **Use auth middleware**
   ```typescript
   export const GET = withAuth(async (req) => {
     // Handler code
   })
   ```

5. **Apply rate limiting**
   ```typescript
   const { allowed, response } = await rateLimit(req, 'login')
   if (!allowed) return response
   ```

6. **Log security events**
   ```typescript
   await logAuthEvent({
     userId,
     eventType: 'login_success',
     metadata: { email }
   }, request)
   ```

### For Users

1. **Use strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Avoid common passwords
   - Use a password manager

2. **Enable two-factor authentication** (when available)
   - TOTP-based 2FA
   - Backup codes
   - Secure authenticator app

3. **Protect your account**
   - Never share passwords
   - Log out from shared devices
   - Be wary of phishing emails
   - Report suspicious activity

4. **Keep sessions secure**
   - Don't share session tokens
   - Log out when finished
   - Use trusted networks

---

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor audit logs
   - Alert on suspicious patterns
   - User reports
   - Automated detection

2. **Containment**
   - Lock affected accounts
   - Revoke compromised tokens
   - Block malicious IPs
   - Isolate affected systems

3. **Investigation**
   - Review audit logs
   - Identify attack vector
   - Assess impact
   - Document findings

4. **Remediation**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Notify affected users
   - Update security measures

5. **Recovery**
   - Restore normal operations
   - Monitor for recurrence
   - Update documentation
   - Conduct post-mortem

### Reporting Security Issues

**Do NOT open public GitHub issues for security vulnerabilities.**

Instead:
1. Email: security@humanglue.io
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We commit to:
- Acknowledge within 24 hours
- Provide status updates every 48 hours
- Credit researchers (if desired)
- Fix critical issues within 7 days

---

## Compliance

### GDPR Compliance

We implement GDPR requirements:

- ✅ Lawful basis for processing
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Storage limitation
- ✅ Right to access
- ✅ Right to erasure
- ✅ Right to portability
- ✅ Right to rectification
- ✅ Privacy by design
- ✅ Data breach notification

### CCPA Compliance

California Consumer Privacy Act compliance:

- ✅ Right to know
- ✅ Right to delete
- ✅ Right to opt-out
- ✅ Non-discrimination
- ✅ Privacy notice

### SOC 2 Readiness

Preparing for SOC 2 Type II:

- ✅ Security controls
- ✅ Availability monitoring
- ✅ Processing integrity
- ✅ Confidentiality measures
- ✅ Privacy safeguards

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] `.env` files not committed
- [ ] Secret scanning passed
- [ ] Dependency audit clean
- [ ] RLS policies tested
- [ ] HTTPS configured
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Audit logging enabled
- [ ] Error handling doesn't leak info
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints

### Post-Deployment

- [ ] Monitor audit logs daily
- [ ] Review failed login attempts
- [ ] Check for suspicious activity
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Run security scans weekly
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Verify SSL certificate validity
- [ ] Check security headers

### Monthly Security Tasks

- [ ] Dependency security audit
- [ ] Review and rotate API keys
- [ ] Audit user access permissions
- [ ] Review failed login attempts
- [ ] Check for suspicious patterns
- [ ] Update security documentation
- [ ] Test incident response plan
- [ ] Review audit logs for anomalies

### Quarterly Security Tasks

- [ ] Penetration testing
- [ ] Security training for team
- [ ] Review and update security policies
- [ ] Rotate database credentials
- [ ] Review third-party integrations
- [ ] Compliance audit
- [ ] Disaster recovery test

---

## Security Tools

### Automated Scans

```bash
# Dependency audit
npm audit

# Secret scanning
npm run scan-secrets

# RLS policy testing
npm run test-rls

# TypeScript type checking
npm run type-check
```

### Manual Testing

1. **Authentication Testing**
   - Test login with invalid credentials
   - Test account lockout
   - Test password reset flow
   - Test session expiration

2. **Authorization Testing**
   - Test role-based access
   - Test RLS policies
   - Test API endpoint protection

3. **Input Validation**
   - Test XSS prevention
   - Test SQL injection prevention
   - Test file upload restrictions

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated:** 2025-10-04
**Version:** 1.0
**Maintained by:** Security Team

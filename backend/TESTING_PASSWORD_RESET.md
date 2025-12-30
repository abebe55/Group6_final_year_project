# Password Reset System Testing Guide

## Overview
This document provides testing instructions for the newly implemented password reset system.

## Test Scenarios

### 1. Initiate Password Reset (Happy Path)

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "email": "admin@northwollo.et"
}
```

**Expected Response:**
```json
{
  "message": "If the email exists, a reset link has been sent.",
  "success": true
}
```

**Expected Behavior:**
- Token is generated and saved to database
- Email is "sent" (logged to console in development)
- Reset link format: `http://localhost:3000/auth/reset-password?token=<generated-token>`

### 2. Validate Reset Token

**Endpoint:** `GET /api/auth/reset-password/validate?token=<token>`

**Expected Response (Valid Token):**
```json
{
  "message": "Token is valid",
  "success": true
}
```

**Expected Response (Invalid Token):**
```json
{
  "message": "Invalid or expired token",
  "success": false
}
```

### 3. Confirm Password Reset

**Endpoint:** `POST /api/auth/reset-password/confirm`

**Request:**
```json
{
  "token": "<generated-token>",
  "newPassword": "newSecurePassword123"
}
```

**Expected Response:**
```json
{
  "message": "Password has been reset successfully.",
  "success": true
}
```

**Expected Behavior:**
- User's password is updated in database
- Token is marked as used
- All other tokens for the user are invalidated

### 4. Test Rate Limiting

**Test:** Send multiple reset requests for the same email

**Expected Behavior:**
- First 3 requests should succeed
- 4th request should return rate limit error:
```json
{
  "message": "Too many reset requests. Please try again later.",
  "success": false
}
```

### 5. Test Security Features

**Test Cases:**
- Use expired token (after 1 hour)
- Use already used token
- Use invalid token format
- Request reset for non-existent email (should still return success message)
- Request reset for inactive user

## Database Verification

After testing, verify the following in the database:

### password_reset_tokens table:
```sql
SELECT * FROM password_reset_tokens ORDER BY created_at DESC;
```

**Expected columns:**
- id, token, user_id, expires_at, used, ip_address, user_agent, created_at, updated_at

### users table:
```sql
SELECT id, username, email, password_hash FROM users WHERE email = 'admin@northwollo.et';
```

**Verify:** password_hash should be updated after successful reset

## Console Logs to Monitor

When testing, monitor the application logs for:

1. **Password Reset Email Logs:**
```
=== PASSWORD RESET EMAIL ===
To: admin@northwollo.et
Subject: Reset Your Password - North Wollo Tourism
Reset Link: http://localhost:3000/auth/reset-password?token=<token>
=============================
```

2. **Security Logs:**
```
Password reset token generated for user: 1 from IP: 192.168.1.1
Password successfully reset for user: 1 from IP: 192.168.1.1
```

3. **Rate Limiting Logs:**
```
Rate limit exceeded for password reset. User: 1, IP: 192.168.1.1
```

## Testing with cURL

### 1. Initiate Reset:
```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@northwollo.et"}'
```

### 2. Validate Token:
```bash
curl -X GET "http://localhost:8080/api/auth/reset-password/validate?token=<your-token>"
```

### 3. Confirm Reset:
```bash
curl -X POST http://localhost:8080/api/auth/reset-password/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"<your-token>","newPassword":"newPassword123"}'
```

## Configuration Testing

Test different configurations in `application.yml`:

```yaml
app:
  password-reset:
    token-expiry-hours: 1    # Test with different values
    max-tokens-per-user: 3   # Test rate limiting
    max-tokens-per-ip-per-hour: 5  # Test IP-based limiting
  frontend:
    base-url: http://localhost:3000  # Verify reset links
```

## Security Considerations Verified

✅ **Secure Token Generation:** 256-bit cryptographically secure tokens
✅ **Rate Limiting:** User and IP-based limits
✅ **Token Expiration:** 1-hour default expiry
✅ **Single-Use Tokens:** Tokens invalidated after use
✅ **Session Invalidation:** All user tokens cleared on password change
✅ **Email Enumeration Protection:** Same response for existing/non-existing emails
✅ **Audit Trail:** IP address and user agent tracking
✅ **Input Validation:** Email format and password strength validation

## Next Steps After Testing

1. Verify all test scenarios pass
2. Check database state after each operation
3. Monitor application logs for security events
4. Test edge cases (malformed requests, SQL injection attempts)
5. Performance test with multiple concurrent requests

## Known Limitations (Development Mode)

- Email service is mocked (logs to console instead of sending real emails)
- JAVA_HOME configuration needed for Maven builds
- Database auto-creation via Hibernate (production should use proper migrations)
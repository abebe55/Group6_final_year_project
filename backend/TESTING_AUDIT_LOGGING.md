# Testing Comprehensive Audit Logging System

## Overview
This document provides comprehensive testing instructions for the audit logging system implementation.

## Prerequisites
- Application running with PostgreSQL database
- Admin user account for testing admin endpoints
- Postman or similar API testing tool

## Test Categories

### 1. Basic Audit Log Creation

#### Test 1.1: Manual Audit Log Creation
```bash
# Test the audit service directly (if you have a test endpoint)
curl -X POST "http://localhost:8080/api/test/audit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "TEST_ACTION",
    "resourceType": "TEST_RESOURCE",
    "description": "Testing audit log creation"
  }'
```

#### Test 1.2: Automatic Audit Logging via Controller Actions
```bash
# Create a hotel (should automatically generate audit log)
curl -X POST "http://localhost:8080/api/hotels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Hotel for Audit",
    "description": "Testing audit logging",
    "location": "Test Location",
    "pricePerNight": 100.0
  }'

# Update a hotel (should automatically generate audit log)
curl -X PUT "http://localhost:8080/api/hotels/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Test Hotel",
    "description": "Updated for audit testing",
    "location": "Updated Location",
    "pricePerNight": 150.0
  }'

# Delete a hotel (should automatically generate audit log)
curl -X DELETE "http://localhost:8080/api/hotels/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Authentication Event Logging

#### Test 2.1: Login Events
```bash
# Successful login (should generate audit log)
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "correctpassword"
  }'

# Failed login (should generate audit log)
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "wrongpassword"
  }'
```

#### Test 2.2: Registration Events
```bash
# User registration (should generate audit log)
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "audituser",
    "email": "audit@test.com",
    "password": "TestPassword123",
    "firstName": "Audit",
    "lastName": "User"
  }'
```

### 3. Admin Audit Management Endpoints

#### Test 3.1: Get All Audit Logs
```bash
curl -X GET "http://localhost:8080/api/admin/audit?page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 3.2: Search Audit Logs
```bash
# Search by action
curl -X GET "http://localhost:8080/api/admin/audit/search?action=CREATE&page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Search by user
curl -X GET "http://localhost:8080/api/admin/audit/search?username=testuser&page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Search by time range
curl -X GET "http://localhost:8080/api/admin/audit/search?startTime=2025-01-01T00:00:00&endTime=2025-12-31T23:59:59&page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Complex search
curl -X GET "http://localhost:8080/api/admin/audit/search?action=LOGIN&category=AUTHENTICATION&severity=INFO&page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 3.3: Get Audit Logs by User
```bash
curl -X GET "http://localhost:8080/api/admin/audit/user/1?page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

curl -X GET "http://localhost:8080/api/admin/audit/username/testuser?page=0&size=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 3.4: Get Security Events
```bash
# Recent security logs (last 24 hours)
curl -X GET "http://localhost:8080/api/admin/audit/security?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# High severity logs
curl -X GET "http://localhost:8080/api/admin/audit/high-severity?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 3.5: Get Statistics
```bash
curl -X GET "http://localhost:8080/api/admin/audit/statistics?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 3.6: Find Suspicious Activity
```bash
curl -X GET "http://localhost:8080/api/admin/audit/suspicious-activity?hours=24&userThreshold=3&actionThreshold=50" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 4. Integrity Management

#### Test 4.1: Check Integrity
```bash
curl -X GET "http://localhost:8080/api/admin/audit/integrity/check" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 4.2: Repair Integrity
```bash
curl -X POST "http://localhost:8080/api/admin/audit/integrity/repair" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 5. Activity Tracking

#### Test 5.1: User Activity Count
```bash
curl -X GET "http://localhost:8080/api/admin/audit/activity/user/1?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 5.2: IP Activity Count
```bash
curl -X GET "http://localhost:8080/api/admin/audit/activity/ip/127.0.0.1?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 6. Data Export and Cleanup

#### Test 6.1: Export Audit Logs
```bash
curl -X GET "http://localhost:8080/api/admin/audit/export?days=30&batchSize=100" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test 6.2: Cleanup Old Logs
```bash
# WARNING: This will delete old audit logs
curl -X DELETE "http://localhost:8080/api/admin/audit/cleanup?daysToKeep=90" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Expected Results

### 1. Database Verification
After running tests, check the database:

```sql
-- Check audit log entries
SELECT * FROM audit_log_entries ORDER BY timestamp DESC LIMIT 10;

-- Check different categories
SELECT category, COUNT(*) FROM audit_log_entries GROUP BY category;

-- Check different actions
SELECT action, COUNT(*) FROM audit_log_entries GROUP BY action;

-- Check integrity (all should have checksums)
SELECT COUNT(*) as total_logs, 
       COUNT(checksum) as logs_with_checksum,
       COUNT(*) - COUNT(checksum) as logs_without_checksum
FROM audit_log_entries;
```

### 2. Log File Verification
Check application logs for audit-related messages:

```bash
# Check for audit logging messages
grep -i "audit" logs/application.log

# Check for integrity check messages
grep -i "integrity" logs/application.log

# Check for cleanup messages
grep -i "cleanup" logs/application.log
```

## Test Scenarios

### Scenario 1: Complete User Journey
1. Register a new user
2. Login with the user
3. Create a hotel
4. Update the hotel
5. Delete the hotel
6. Logout
7. Check audit logs for all these actions

### Scenario 2: Security Event Testing
1. Attempt multiple failed logins
2. Trigger account lockout
3. Reset password
4. Verify email
5. Check security audit logs

### Scenario 3: Admin Management Testing
1. Login as admin
2. View all audit logs
3. Search for specific events
4. Generate statistics
5. Check integrity
6. Export logs

### Scenario 4: Automated Maintenance Testing
1. Wait for scheduled tasks to run (or trigger manually)
2. Check cleanup logs
3. Verify integrity repair
4. Review monthly reports

## Troubleshooting

### Common Issues

#### 1. No Audit Logs Generated
- Check if audit logging is enabled in configuration
- Verify aspect is working (check for AspectJ dependencies)
- Check database connectivity
- Review application logs for errors

#### 2. Missing Checksums
- Run integrity repair endpoint
- Check if checksum generation is enabled
- Verify MD5 algorithm availability

#### 3. Performance Issues
- Check database indexes
- Review query performance
- Consider pagination for large datasets
- Monitor memory usage during bulk operations

#### 4. Access Denied Errors
- Verify JWT token is valid
- Check user has ADMIN role
- Ensure endpoints are properly secured

### Debug Commands

```bash
# Check application configuration
curl -X GET "http://localhost:8080/actuator/configprops" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Check health status
curl -X GET "http://localhost:8080/actuator/health"

# Check metrics (if enabled)
curl -X GET "http://localhost:8080/actuator/metrics" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Performance Testing

### Load Testing
```bash
# Generate multiple audit logs quickly
for i in {1..100}; do
  curl -X POST "http://localhost:8080/api/hotels" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -d "{\"name\":\"Hotel $i\",\"description\":\"Load test hotel\",\"location\":\"Test\",\"pricePerNight\":100.0}" &
done
wait

# Check if all logs were created
curl -X GET "http://localhost:8080/api/admin/audit/statistics?hours=1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Validation Checklist

- [ ] Audit logs are created for all CRUD operations
- [ ] Authentication events are logged correctly
- [ ] Security events are captured
- [ ] Checksums are generated for all entries
- [ ] Admin endpoints return correct data
- [ ] Search and filtering work properly
- [ ] Statistics are calculated correctly
- [ ] Integrity checks pass
- [ ] Cleanup operations work
- [ ] Performance is acceptable under load
- [ ] Error handling works properly
- [ ] Scheduled tasks execute correctly

## Success Criteria

The audit logging system is working correctly if:
1. All user actions generate appropriate audit logs
2. Security events are captured and categorized
3. Admin can view, search, and manage audit logs
4. Integrity protection is working (checksums present)
5. Automated maintenance tasks execute successfully
6. Performance remains acceptable under normal load
7. No errors in application logs related to audit logging

## Next Steps

After successful testing:
1. Configure production settings (retention, cleanup schedules)
2. Set up monitoring and alerting
3. Train administrators on audit log management
4. Document operational procedures
5. Plan for long-term storage and archival
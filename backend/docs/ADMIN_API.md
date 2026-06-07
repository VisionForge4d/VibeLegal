# Admin Dashboard API Documentation

Complete API reference for the VibeLegal Admin Dashboard.

## Table of Contents

- [Authentication](#authentication)
- [Middleware](#middleware)
- [Endpoints](#endpoints)
  - [Metrics & Monitoring](#metrics--monitoring)
  - [User Management](#user-management)
  - [Audit Logging](#audit-logging)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

All admin endpoints require:
1. Valid JWT token in `Authorization` header
2. User account with `is_admin = true` in database

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Responses

- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Valid token but user is not admin

## Middleware

### authenticateAdmin

Located at: `backend/middleware/authenticateAdmin.js`

**Purpose**: Protect admin routes by verifying JWT token and admin privileges

**Logic**:
1. Extends `authenticateToken` middleware
2. Verifies JWT and sets `req.user`
3. Queries database for user's `is_admin` flag
4. Returns 403 if `is_admin === false`
5. Continues to route handler if `is_admin === true`

## Endpoints

### Metrics & Monitoring

#### GET /api/admin/metrics/overview

Get system-wide metrics for dashboard overview.

**Authentication**: Required (admin only)

**Response**:
```json
{
  "success": true,
  "metrics": {
    "totalUsers": 1250,
    "newUsersThisMonth": 103,
    "totalContracts": 15420,
    "contractsThisMonth": 1234,
    "activeSubscriptions": 150,
    "subscriptionBreakdown": {
      "basic": 1100,
      "pro": 130,
      "enterprise": 20
    }
  }
}
```

**Caching**: Results cached for 60 seconds

---

#### GET /api/admin/metrics/recent-activity

Get recent platform activity feed.

**Authentication**: Required (admin only)

**Query Parameters**:
- `limit` (optional): Number of items per category (default: 10)

**Response**:
```json
{
  "success": true,
  "recentContracts": [
    {
      "id": "uuid",
      "title": "Employment Agreement - Acme Corp",
      "user_email": "user@example.com",
      "contract_type": "employment",
      "created_at": "2025-10-05T10:00:00Z"
    }
  ],
  "recentSignups": [
    {
      "id": "uuid",
      "email": "newuser@example.com",
      "subscription_tier": "basic",
      "created_at": "2025-10-08T15:30:00Z"
    }
  ],
  "recentPayments": [
    {
      "id": "uuid",
      "user_email": "user@example.com",
      "amount": 29.00,
      "status": "succeeded",
      "payment_date": "2025-10-01T00:00:00Z"
    }
  ]
}
```

---

### User Management

#### GET /api/admin/users

List all users with search, filter, and pagination.

**Authentication**: Required (admin only)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50, max: 100)
- `search` (optional): Search by email or name (case-insensitive)
- `tier` (optional): Filter by subscription tier (basic/pro/enterprise)
- `sort` (optional): Sort field with direction
  - `created_at` - Oldest first
  - `-created_at` - Newest first (default)
  - `email` - A-Z
  - `-email` - Z-A

**Response**:
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "subscription_tier": "pro",
      "contracts_count": 15,
      "contracts_used_this_month": 3,
      "created_at": "2025-09-01T12:00:00Z",
      "last_login": "2025-10-08T15:30:00Z",
      "stripe_customer_id": "cus_xxx",
      "subscription_status": "active"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 25,
    "total_users": 1250,
    "per_page": 50
  }
}
```

**Implementation Notes**:
- Uses OFFSET/LIMIT for pagination
- ILIKE for case-insensitive search
- Joins with user_subscriptions for status

---

#### GET /api/admin/users/:userId

Get detailed information for specific user.

**Authentication**: Required (admin only)

**Parameters**:
- `userId` (path): User UUID

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_tier": "pro",
    "is_admin": false,
    "contracts_used_this_month": 3,
    "created_at": "2025-09-01T12:00:00Z",
    "updated_at": "2025-10-08T15:30:00Z",
    "stripe_customer_id": "cus_xxx"
  },
  "subscription": {
    "status": "active",
    "plan_type": "pro",
    "billing_cycle": "monthly",
    "current_period_start": "2025-10-01T00:00:00Z",
    "current_period_end": "2025-11-01T00:00:00Z",
    "stripe_subscription_id": "sub_xxx"
  },
  "contracts": [
    {
      "id": "uuid",
      "title": "Employment Agreement - Acme Corp",
      "contract_type": "employment",
      "created_at": "2025-10-05T10:00:00Z",
      "updated_at": "2025-10-05T10:15:00Z"
    }
  ],
  "payment_history": [
    {
      "id": "uuid",
      "amount": 29.00,
      "status": "succeeded",
      "billing_cycle": "monthly",
      "payment_date": "2025-10-01T00:00:00Z"
    }
  ],
  "recent_admin_actions": [
    {
      "action_type": "subscription_change",
      "description": "Upgraded from basic to pro",
      "admin_email": "admin@vibelegal.com",
      "created_at": "2025-09-15T14:30:00Z"
    }
  ]
}
```

**Error Codes**:
- `404` - User not found
- `500` - Database query error

---

#### POST /api/admin/users/:userId/subscription

Manually change user's subscription tier.

**Authentication**: Required (admin only)

**Parameters**:
- `userId` (path): User UUID

**Request Body**:
```json
{
  "tier": "pro",
  "reason": "Customer service gesture - billing issue resolution",
  "stripe_sync": false
}
```

**Fields**:
- `tier` (required): New tier (basic/pro/enterprise)
- `reason` (optional): Internal note explaining change
- `stripe_sync` (optional): Whether to sync with Stripe (default: false)

**Response**:
```json
{
  "success": true,
  "message": "User subscription updated to pro",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "subscription_tier": "pro"
  }
}
```

**Implementation Notes**:
- Updates `users.subscription_tier` in transaction
- Creates `admin_actions` audit log entry with metadata
- If `stripe_sync=true`, updates Stripe subscription via API
- Resets `contracts_used_this_month` if upgrading from basic with exceeded limits

**Error Codes**:
- `400` - Invalid tier or missing required fields
- `404` - User not found
- `500` - Database update error or Stripe API error

---

#### POST /api/admin/users/:userId/impersonate

Generate temporary JWT token to view platform as user.

**Authentication**: Required (admin only)

**Parameters**:
- `userId` (path): User UUID

**Response**:
```json
{
  "success": true,
  "impersonation_token": "eyJhbGci...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Implementation Notes**:
- Generates JWT with special claims: `{ userId, impersonated_by: adminUserId, exp: 1hour }`
- Creates `admin_actions` audit log entry with action_type='impersonation'
- Token expiration: 1 hour (vs normal 24 hours)
- Frontend detects `impersonated_by` claim and shows exit banner

**Error Codes**:
- `400` - Cannot impersonate another admin user
- `404` - User not found
- `500` - Token generation error

---

### Audit Logging

#### GET /api/admin/audit-log

View audit log of admin actions.

**Authentication**: Required (admin only)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50)
- `admin_id` (optional): Filter by admin user ID
- `action_type` (optional): Filter by action type
- `target_user_id` (optional): Filter by target user ID

**Response**:
```json
{
  "success": true,
  "actions": [
    {
      "id": "uuid",
      "action_type": "subscription_change",
      "description": "Changed subscription from basic to pro",
      "admin_email": "admin@vibelegal.com",
      "target_user_email": "user@example.com",
      "metadata": {
        "old_tier": "basic",
        "new_tier": "pro",
        "reason": "Customer service gesture"
      },
      "ip_address": "192.168.1.1",
      "created_at": "2025-10-09T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_actions": 234,
    "per_page": 50
  }
}
```

**Implementation Notes**:
- Joins with users table twice (for admin_email and target_user_email)
- Ordered by created_at DESC (most recent first)
- Includes metadata JSON for action details

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Not authorized as admin
- `NOT_FOUND` - Resource not found
- `INVALID_INPUT` - Invalid request parameters
- `SERVER_ERROR` - Internal server error

## Rate Limiting

Admin routes have higher rate limits than public routes:

- **Public routes**: 100 requests/15 minutes
- **Admin routes**: 500 requests/15 minutes

## Database Schema

### admin_actions Table

```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Action Types**:
- `subscription_change` - Manual subscription tier update
- `user_impersonation` - Generated impersonation token
- `password_reset` - Admin-triggered password reset
- `account_deletion` - User account deletion

## Testing

### Integration Tests

Run comprehensive admin workflow tests:

```bash
cd backend
node tests/admin-integration-test.js
```

Tests include:
- Admin authentication
- Metrics access
- User listing with search/filter
- User detail retrieval
- Subscription management
- User impersonation
- Audit logging
- Error handling

### Manual Testing

1. **Setup Admin User**:
```sql
UPDATE users SET is_admin = true WHERE email = 'test2@vibelegal.com';
```

2. **Access Dashboard**:
- Navigate to http://localhost:5173/admin
- Login with admin credentials
- Verify metrics display
- Test user search and filters
- View user details
- Test subscription editing
- Generate impersonation token

## Security Considerations

1. **Admin Access Control**:
   - Never expose admin flags in public APIs
   - Always verify admin status on backend
   - Log all admin actions for audit trail

2. **Impersonation Safety**:
   - Short token expiration (1 hour)
   - Cannot impersonate other admins
   - All impersonations logged
   - Clear UI indication when impersonating

3. **Data Protection**:
   - No sensitive data in logs
   - Rate limiting on admin endpoints
   - IP tracking for admin actions
   - Confirmation required for destructive actions

## Future Enhancements

- [ ] Email notifications for admin actions
- [ ] Real-time dashboard updates via WebSocket
- [ ] Advanced analytics and reporting
- [ ] Bulk user operations
- [ ] Admin role permissions (read-only, full-access)
- [ ] Export user/contract data to CSV
- [ ] Scheduled reports

---

**Last Updated**: October 9, 2025
**API Version**: 1.0
**Status**: Production Ready

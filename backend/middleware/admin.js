// Admin Authentication & Authorization Middleware
// Validates JWT token and checks admin privileges

const jwt = require('jsonwebtoken');
const { pool } = require('../src/db/pool');

/**
 * Middleware to authenticate admin users
 * Verifies JWT token and checks is_admin flag in database
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authenticateAdmin(req, res, next) {
  // Step 1: Extract and verify JWT token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required.'
    });
  }

  try {
    // Step 2: Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    // Step 3: Check if user has admin privileges in database
    const result = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = $1',
      [decoded.userId] // This is correct. The original code was safe. My initial analysis was incorrect.
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'User not found.'
      });
    }

    const user = result.rows[0];

    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    // Step 4: Attach user info to request and proceed
    req.user = {
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token expired.'
      });
    } else {
      console.error('Admin auth error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during authentication.'
      });
    }
  }
}

/**
 * Log admin action to audit trail
 * Records all admin operations for compliance and security
 *
 * @param {Object} options - Action details
 * @param {string} options.adminUserId - UUID of admin performing action
 * @param {string} options.actionType - Type of action (e.g., 'subscription_change', 'user_impersonation')
 * @param {string} [options.targetUserId] - UUID of user affected by action (optional)
 * @param {string} [options.description] - Human-readable description of action
 * @param {Object} [options.metadata] - Additional action-specific data (stored as JSONB)
 * @param {string} [options.ipAddress] - IP address of admin
 * @param {string} [options.userAgent] - Browser/client user agent
 * @returns {Promise<string>} - Returns the UUID of the created action log entry
 */
async function logAdminAction({
  adminUserId,
  actionType,
  targetUserId = null,
  description = null,
  metadata = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    const result = await pool.query(`
      INSERT INTO admin_actions (
        admin_user_id,
        action_type,
        target_user_id,
        description,
        metadata,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      adminUserId,
      actionType,
      targetUserId,
      description,
      metadata ? JSON.stringify(metadata) : null,
      ipAddress,
      userAgent
    ]);

    return result.rows[0].id;
  } catch (error) {
    console.error('Error logging admin action:', error);
    throw error;
  }
}

/**
 * Helper function to extract IP address from request
 * Handles proxy headers (X-Forwarded-For) and direct connections
 *
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.connection?.socket?.remoteAddress ||
         'unknown';
}

/**
 * Middleware wrapper that logs admin actions automatically
 * Use this to wrap admin route handlers for automatic audit logging
 *
 * @param {string} actionType - Type of action being performed
 * @param {Function} handler - Async route handler function
 * @returns {Function} - Wrapped middleware function
 *
 * @example
 * app.patch('/api/admin/users/:id/subscription',
 *   authenticateAdmin,
 *   withAuditLog('subscription_change', async (req, res) => {
 *     // Your route logic here
 *     // req.auditLogId will contain the log ID
 *   })
 * );
 */
function withAuditLog(actionType, handler) {
  return async (req, res, next) => {
    try {
      // Log the action before executing
      const logId = await logAdminAction({
        adminUserId: req.user.userId,
        actionType: actionType,
        targetUserId: req.params.userId || req.params.id || null,
        description: `${req.method} ${req.originalUrl}`,
        metadata: {
          method: req.method,
          path: req.originalUrl,
          params: req.params,
          query: req.query,
          body: req.body
        },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent']
      });

      // Attach log ID to request for reference
      req.auditLogId = logId;

      // Execute the handler
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authenticateAdmin,
  logAdminAction,
  getClientIp,
  withAuditLog
};

const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('./db/pool');
const { authenticateAdmin, logAdminAction, getClientIp } = require('../middleware/admin');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Admin Service
 * Handles admin operations: user management, impersonation, system monitoring
 * All routes require admin authentication
 */

/**
 * GET /api/admin/users
 * List all users with pagination, search, and filters
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 100)
 * - search: Search by email (case-insensitive)
 * - tier: Filter by subscription tier (basic, pro, enterprise)
 * - sort: Sort field (created_at, email, contracts_used)
 * - order: Sort order (asc, desc)
 */
router.get('/users', authenticateAdmin, asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const tier = req.query.tier || '';
  const sort = req.query.sort || 'created_at';
  const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

  // Build WHERE clause
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`email ILIKE $${params.length}`);
  }

  if (tier) {
    params.push(tier);
    conditions.push(`subscription_tier = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort field to prevent SQL injection
  const validSortFields = ['created_at', 'email', 'contracts_used_this_month', 'subscription_tier'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get users with pagination
  params.push(limit);
  params.push(offset);
  const usersResult = await pool.query(
    `SELECT
      id,
      email,
      subscription_tier,
      contracts_used_this_month,
      is_admin,
      created_at
    FROM users
    ${whereClause}
    ORDER BY ${sortField} ${order}
    LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    success: true,
    users: usersResult.rows,
    total: total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(total / limit)
  });
}));

/**
 * GET /api/admin/users/:userId
 * Get detailed information about a specific user
 * Includes user profile, contracts, subscription details, and payment history
 */
router.get('/users/:userId', authenticateAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get user details with subscription info
  const userResult = await pool.query(`
    SELECT
      u.id,
      u.email,
      u.subscription_tier,
      u.contracts_used_this_month,
      u.is_admin,
      u.created_at,
      us.status,
      us.billing_cycle,
      us.next_billing_date,
      us.stripe_customer_id,
      us.stripe_subscription_id
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE u.id = $1
  `, [userId]);

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const user = userResult.rows[0];

  // Get user's contracts
  const contractsResult = await pool.query(`
    SELECT
      id,
      contract_type,
      title,
      created_at
    FROM contracts
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 20
  `, [userId]);

  // Get payment history if table exists (future implementation)
  let paymentsResult = { rows: [] };
  try {
    paymentsResult = await pool.query(`
      SELECT
        id,
        amount,
        currency,
        status,
        stripe_payment_intent_id,
        created_at
      FROM payment_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);
  } catch (error) {
    // Payment history table doesn't exist yet - skip for now
    console.log('Payment history table not yet implemented');
  }

  // Get recent admin actions on this user
  const actionsResult = await pool.query(`
    SELECT
      aa.id,
      aa.action_type,
      aa.description,
      aa.created_at,
      au.email as admin_email
    FROM admin_actions aa
    JOIN users au ON aa.admin_user_id = au.id
    WHERE aa.target_user_id = $1
    ORDER BY aa.created_at DESC
    LIMIT 10
  `, [userId]);

  res.json({
    success: true,
    user: user,
    contracts: contractsResult.rows,
    payments: paymentsResult.rows,
    recentActions: actionsResult.rows
  });
}));

/**
 * PATCH /api/admin/users/:userId/subscription
 * Update a user's subscription tier
 * Logs the action to audit trail
 *
 * Body:
 * - tier: New subscription tier (basic, pro, enterprise)
 * - reason: Optional reason for the change
 */
router.patch('/users/:userId/subscription', authenticateAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { tier, reason } = req.body;

  // Validate tier
  const validTiers = ['basic', 'pro', 'enterprise'];
  if (!tier || !validTiers.includes(tier)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription tier. Must be: basic, pro, or enterprise'
    });
  }

  // Get current tier
  const currentResult = await pool.query(
    'SELECT subscription_tier FROM users WHERE id = $1',
    [userId]
  );

  if (currentResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const oldTier = currentResult.rows[0].subscription_tier;

  // Update subscription tier
  await pool.query(
    'UPDATE users SET subscription_tier = $1 WHERE id = $2',
    [tier, userId]
  );

  // Log admin action
  await logAdminAction({
    adminUserId: req.user.userId,
    actionType: 'subscription_change',
    targetUserId: userId,
    description: `Changed subscription from ${oldTier} to ${tier}`,
    metadata: {
      oldTier: oldTier,
      newTier: tier,
      reason: reason || 'No reason provided'
    },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Subscription updated from ${oldTier} to ${tier}`,
    oldTier: oldTier,
    newTier: tier
  });
}));

/**
 * POST /api/admin/users/:userId/impersonate
 * Generate a temporary JWT token for user impersonation
 * Token expires in 1 hour and includes impersonatedBy claim
 * Logs the impersonation to audit trail
 */
router.post('/users/:userId/impersonate', authenticateAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Verify user exists
  const userResult = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const user = userResult.rows[0];

  const impersonationTtlSeconds = 60 * 60; // 1 hour

  // Generate impersonation token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      impersonatedBy: req.user.userId,
      impersonatedByEmail: req.user.email,
      isImpersonation: true
    },
    process.env.JWT_SECRET,
    { expiresIn: impersonationTtlSeconds }
  );

  // Log admin action
  await logAdminAction({
    adminUserId: req.user.userId,
    actionType: 'user_impersonation',
    targetUserId: userId,
    description: `Admin impersonating user ${user.email}`,
    metadata: {
      targetEmail: user.email,
      expiresIn: '1 hour'
    },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    impersonation_token: token,
    token, // Backward compatibility for older clients
    user: {
      id: user.id,
      email: user.email
    },
    expires_in: impersonationTtlSeconds,
    expiresIn: '1 hour',
    warning: 'This token is for debugging purposes only. All actions will be tracked.'
  });
}));

/**
 * GET /api/admin/metrics/overview
 * Get system-wide metrics overview
 * Returns user counts, contract counts, subscription breakdown, and revenue metrics
 */
router.get('/metrics/overview', authenticateAdmin, asyncHandler(async (req, res) => {
  // Get total users
  const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  // Get new users this month
  const newUsersResult = await pool.query(`
    SELECT COUNT(*) FROM users
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  `);
  const newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

  // Get new users last month (for growth calculation)
  const newUsersLastMonthResult = await pool.query(`
    SELECT COUNT(*) FROM users
    WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      AND created_at < date_trunc('month', CURRENT_DATE)
  `);
  const newUsersLastMonth = parseInt(newUsersLastMonthResult.rows[0].count);

  // Get total contracts
  const totalContractsResult = await pool.query('SELECT COUNT(*) FROM contracts');
  const totalContracts = parseInt(totalContractsResult.rows[0].count);

  // Get contracts this month
  const contractsThisMonthResult = await pool.query(`
    SELECT COUNT(*) FROM contracts
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  `);
  const contractsThisMonth = parseInt(contractsThisMonthResult.rows[0].count);

  // Get contracts last month (for growth calculation)
  const contractsLastMonthResult = await pool.query(`
    SELECT COUNT(*) FROM contracts
    WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      AND created_at < date_trunc('month', CURRENT_DATE)
  `);
  const contractsLastMonth = parseInt(contractsLastMonthResult.rows[0].count);

  // Get subscription breakdown
  const subscriptionBreakdownResult = await pool.query(`
    SELECT subscription_tier, COUNT(*) as count
    FROM users
    GROUP BY subscription_tier
    ORDER BY subscription_tier
  `);

  const subscriptionBreakdown = {};
  subscriptionBreakdownResult.rows.forEach(row => {
    subscriptionBreakdown[row.subscription_tier] = parseInt(row.count);
  });

  // Get active subscriptions (users with contracts this month)
  const activeSubscriptionsResult = await pool.query(`
    SELECT COUNT(DISTINCT user_id) FROM contracts
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  `);
  const activeSubscriptions = parseInt(activeSubscriptionsResult.rows[0].count);

  // Calculate MRR (Monthly Recurring Revenue)
  const tierPricing = {
    basic: 0,
    pro: 29,
    enterprise: 99
  };

  let mrr = 0;
  let revenueByTier = {};

  Object.keys(subscriptionBreakdown).forEach(tier => {
    const tierRevenue = (subscriptionBreakdown[tier] || 0) * (tierPricing[tier] || 0);
    revenueByTier[tier] = tierRevenue;
    mrr += tierRevenue;
  });

  // Get failed payments count (if payment_history table exists)
  let failedPayments = 0;
  try {
    const failedPaymentsResult = await pool.query(`
      SELECT COUNT(*) FROM payment_history
      WHERE status = 'failed'
        AND created_at >= date_trunc('month', CURRENT_DATE)
    `);
    failedPayments = parseInt(failedPaymentsResult.rows[0].count);
  } catch (error) {
    // Payment history table doesn't exist yet - default to 0
    console.log('Payment history table not yet implemented - failed payments defaulted to 0');
  }

  // Calculate growth rates
  const userGrowthRate = newUsersLastMonth > 0
    ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
    : newUsersThisMonth > 0 ? 100 : 0;

  const contractGrowthRate = contractsLastMonth > 0
    ? ((contractsThisMonth - contractsLastMonth) / contractsLastMonth * 100).toFixed(1)
    : contractsThisMonth > 0 ? 100 : 0;

  res.json({
    success: true,
    metrics: {
      // User metrics
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      userGrowthRate: parseFloat(userGrowthRate),

      // Contract metrics
      totalContracts,
      contractsThisMonth,
      contractsLastMonth,
      contractGrowthRate: parseFloat(contractGrowthRate),
      activeSubscriptions,

      // Subscription breakdown
      subscriptionBreakdown,

      // Revenue metrics
      mrr,
      revenueByTier,
      failedPayments,

      // Pricing reference (for frontend display)
      tierPricing
    }
  });
}));

/**
 * GET /api/admin/metrics/recent-activity
 * Get recent system activity
 * Returns recent contracts, signups
 *
 * Query parameters:
 * - limit: Number of items to return (default: 10, max: 50)
 */
router.get('/metrics/recent-activity', authenticateAdmin, asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  // Get recent contracts
  const recentContractsResult = await pool.query(`
    SELECT
      c.id,
      c.title,
      c.contract_type,
      c.created_at,
      u.email as user_email
    FROM contracts c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
    LIMIT $1
  `, [limit]);

  // Get recent signups
  const recentSignupsResult = await pool.query(`
    SELECT
      id,
      email,
      subscription_tier,
      created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit]);

  res.json({
    success: true,
    recentContracts: recentContractsResult.rows,
    recentSignups: recentSignupsResult.rows
  });
}));

/**
 * GET /api/admin/audit-log
 * Get admin action audit log with pagination and filtering
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 100)
 * - actionType: Filter by action type
 * - adminUserId: Filter by admin user ID
 * - targetUserId: Filter by target user ID
 */
router.get('/audit-log', authenticateAdmin, asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  const actionType = req.query.actionType || '';
  const adminUserId = req.query.adminUserId || '';
  const targetUserId = req.query.targetUserId || '';

  // Build WHERE clause
  const conditions = [];
  const params = [];

  if (actionType) {
    params.push(actionType);
    conditions.push(`aa.action_type = $${params.length}`);
  }

  if (adminUserId) {
    params.push(adminUserId);
    conditions.push(`aa.admin_user_id = $${params.length}`);
  }

  if (targetUserId) {
    params.push(targetUserId);
    conditions.push(`aa.target_user_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM admin_actions aa ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get actions with admin and target user emails
  params.push(limit);
  params.push(offset);
  const actionsResult = await pool.query(`
    SELECT
      aa.id,
      aa.action_type,
      aa.description,
      aa.metadata,
      aa.ip_address,
      aa.created_at,
      au.email as admin_email,
      tu.email as target_email
    FROM admin_actions aa
    JOIN users au ON aa.admin_user_id = au.id
    LEFT JOIN users tu ON aa.target_user_id = tu.id
    ${whereClause}
    ORDER BY aa.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  res.json({
    success: true,
    actions: actionsResult.rows,
    total: total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(total / limit)
  });
}));

module.exports = router;

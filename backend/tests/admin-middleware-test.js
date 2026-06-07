// Admin Middleware Test
// Tests for admin authentication and audit logging

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Create a test pool with explicit SSL disabled for local development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Import middleware functions after they're created
let authenticateAdmin, logAdminAction;

async function testAuthenticateAdminMiddleware() {
  console.log('Testing authenticateAdmin middleware...');

  try {
    // Load the middleware
    const adminMiddleware = require('../middleware/admin');
    authenticateAdmin = adminMiddleware.authenticateAdmin;

    if (typeof authenticateAdmin !== 'function') {
      console.log('❌ authenticateAdmin is not a function');
      return false;
    }

    console.log('✅ authenticateAdmin middleware exported correctly');

    // Test 1: No token provided
    const mockReqNoToken = {
      headers: {}
    };
    const mockRes1 = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    let nextCalled1 = false;
    const mockNext1 = () => { nextCalled1 = true; };

    await authenticateAdmin(mockReqNoToken, mockRes1, mockNext1);

    if (mockRes1.statusCode !== 401) {
      console.log(`❌ Expected 401 for missing token, got ${mockRes1.statusCode}`);
      return false;
    }
    if (nextCalled1) {
      console.log('❌ next() should not be called for missing token');
      return false;
    }
    console.log('✅ Correctly rejects request with no token');

    // Test 2: Invalid token
    const mockReqInvalidToken = {
      headers: {
        'authorization': 'Bearer invalid_token_here'
      }
    };
    const mockRes2 = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    let nextCalled2 = false;
    const mockNext2 = () => { nextCalled2 = true; };

    await authenticateAdmin(mockReqInvalidToken, mockRes2, mockNext2);

    if (mockRes2.statusCode !== 403) {
      console.log(`❌ Expected 403 for invalid token, got ${mockRes2.statusCode}`);
      return false;
    }
    if (nextCalled2) {
      console.log('❌ next() should not be called for invalid token');
      return false;
    }
    console.log('✅ Correctly rejects request with invalid token');

    // Test 3: Valid token but non-admin user
    // Get a non-admin user from database
    const nonAdminResult = await pool.query(`
      SELECT id, email FROM users WHERE is_admin = false LIMIT 1
    `);

    if (nonAdminResult.rows.length === 0) {
      console.log('⚠️  Warning: No non-admin users found, creating test user');
      await pool.query(`
        INSERT INTO users (email, password_hash, subscription_tier, is_admin)
        VALUES ('test_nonadmin@vibelegal.com', '$2a$10$dummyhash', 'basic', false)
      `);
      const newUserResult = await pool.query(`
        SELECT id, email FROM users WHERE email = 'test_nonadmin@vibelegal.com'
      `);
      const nonAdminUser = newUserResult.rows[0];
      var nonAdminToken = jwt.sign(
        { userId: nonAdminUser.id, email: nonAdminUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    } else {
      const nonAdminUser = nonAdminResult.rows[0];
      var nonAdminToken = jwt.sign(
        { userId: nonAdminUser.id, email: nonAdminUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }

    const mockReqNonAdmin = {
      headers: {
        'authorization': `Bearer ${nonAdminToken}`
      }
    };
    const mockRes3 = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    let nextCalled3 = false;
    const mockNext3 = () => { nextCalled3 = true; };

    await authenticateAdmin(mockReqNonAdmin, mockRes3, mockNext3);

    if (mockRes3.statusCode !== 403) {
      console.log(`❌ Expected 403 for non-admin user, got ${mockRes3.statusCode}`);
      return false;
    }
    if (nextCalled3) {
      console.log('❌ next() should not be called for non-admin user');
      return false;
    }
    console.log('✅ Correctly rejects non-admin user');

    // Test 4: Valid token with admin user
    const adminResult = await pool.query(`
      SELECT id, email FROM users WHERE email = 'test2@vibelegal.com'
    `);
    const adminUser = adminResult.rows[0];
    const adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const mockReqAdmin = {
      headers: {
        'authorization': `Bearer ${adminToken}`
      }
    };
    const mockRes4 = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    let nextCalled4 = false;
    const mockNext4 = () => { nextCalled4 = true; };

    await authenticateAdmin(mockReqAdmin, mockRes4, mockNext4);

    if (!nextCalled4) {
      console.log('❌ next() should be called for admin user');
      return false;
    }
    if (mockRes4.statusCode && mockRes4.statusCode !== 200) {
      console.log(`❌ Should not set error status for admin user, got ${mockRes4.statusCode}`);
      return false;
    }
    if (!mockReqAdmin.user) {
      console.log('❌ req.user should be set for admin user');
      return false;
    }
    console.log('✅ Correctly allows admin user access');

    return true;
  } catch (error) {
    console.error('❌ Error testing authenticateAdmin middleware:', error.message);
    return false;
  }
}

async function testLogAdminAction() {
  console.log('\nTesting logAdminAction helper function...');

  try {
    // Load the helper function
    const adminMiddleware = require('../middleware/admin');
    logAdminAction = adminMiddleware.logAdminAction;

    if (typeof logAdminAction !== 'function') {
      console.log('❌ logAdminAction is not a function');
      return false;
    }

    console.log('✅ logAdminAction function exported correctly');

    // Get admin user for testing
    const adminResult = await pool.query(`
      SELECT id FROM users WHERE email = 'test2@vibelegal.com'
    `);
    const adminUserId = adminResult.rows[0].id;

    // Test logging an action
    const actionId = await logAdminAction({
      adminUserId: adminUserId,
      actionType: 'test_middleware_action',
      targetUserId: adminUserId,
      description: 'Test action for middleware validation',
      metadata: { test: true, timestamp: Date.now() },
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Middleware Test Script'
    });

    if (!actionId) {
      console.log('❌ logAdminAction should return an action ID');
      return false;
    }

    console.log(`✅ Admin action logged with ID: ${actionId}`);

    // Verify the action was logged
    const verifyResult = await pool.query(`
      SELECT * FROM admin_actions WHERE id = $1
    `, [actionId]);

    if (verifyResult.rows.length === 0) {
      console.log('❌ Logged action not found in database');
      return false;
    }

    const action = verifyResult.rows[0];

    if (action.action_type !== 'test_middleware_action') {
      console.log(`❌ Wrong action_type: ${action.action_type}`);
      return false;
    }

    if (!action.metadata || action.metadata.test !== true) {
      console.log('❌ Metadata not properly stored');
      return false;
    }

    console.log('✅ Admin action verified in database');

    // Test logging without optional fields
    const actionId2 = await logAdminAction({
      adminUserId: adminUserId,
      actionType: 'test_minimal_action',
      description: 'Minimal action test'
    });

    if (!actionId2) {
      console.log('❌ logAdminAction should work with minimal fields');
      return false;
    }

    console.log('✅ Admin action logging works with minimal fields');

    // Clean up test actions
    await pool.query(`
      DELETE FROM admin_actions WHERE id IN ($1, $2)
    `, [actionId, actionId2]);

    console.log('✅ Test admin actions cleaned up');

    return true;
  } catch (error) {
    console.error('❌ Error testing logAdminAction:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('=== Admin Middleware Tests ===\n');

  let allPassed = true;

  try {
    // Test 1: authenticateAdmin middleware
    const test1 = await testAuthenticateAdminMiddleware();
    allPassed = allPassed && test1;

    // Test 2: logAdminAction helper
    const test2 = await testLogAdminAction();
    allPassed = allPassed && test2;

    if (allPassed) {
      console.log('\n✅ All admin middleware tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Please check the middleware implementation.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAllTests();

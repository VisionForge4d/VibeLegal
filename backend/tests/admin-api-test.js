// Admin API Endpoints Test
// Tests for admin user management endpoints

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const BASE_URL = 'http://localhost:5000';

// Create a test pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

let adminToken = null;
let testUserId = null;

async function setup() {
  // Get admin user token
  const adminResult = await pool.query(`
    SELECT id, email FROM users WHERE email = 'test2@vibelegal.com'
  `);
  const adminUser = adminResult.rows[0];
  adminToken = jwt.sign(
    { userId: adminUser.id, email: adminUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Get a test user ID for detail/update tests
  const userResult = await pool.query(`
    SELECT id FROM users WHERE email != 'test2@vibelegal.com' LIMIT 1
  `);
  if (userResult.rows.length > 0) {
    testUserId = userResult.rows[0].id;
  }
}

async function testListUsers() {
  console.log('Testing GET /api/admin/users (list users)...');

  try {
    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/users`);
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication
    const res2 = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data2 = await res2.json();

    if (res2.status !== 200) {
      console.log(`❌ Expected 200 for admin user, got ${res2.status}`);
      console.log('Response:', data2);
      return false;
    }

    if (!data2.success) {
      console.log('❌ Response should have success: true');
      return false;
    }

    if (!Array.isArray(data2.users)) {
      console.log('❌ Response should have users array');
      return false;
    }

    if (typeof data2.total !== 'number') {
      console.log('❌ Response should have total count');
      return false;
    }

    console.log(`✅ Successfully listed ${data2.users.length} users (total: ${data2.total})`);

    // Test 3: With pagination
    const res3 = await fetch(`${BASE_URL}/api/admin/users?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data3 = await res3.json();

    if (!data3.success || data3.users.length > 5) {
      console.log('❌ Pagination not working correctly');
      return false;
    }

    console.log('✅ Pagination works correctly');

    // Test 4: With search filter
    const res4 = await fetch(`${BASE_URL}/api/admin/users?search=test`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data4 = await res4.json();

    if (!data4.success) {
      console.log('❌ Search filter failed');
      return false;
    }

    console.log(`✅ Search filter works (found ${data4.users.length} users)`);

    // Test 5: With tier filter
    const res5 = await fetch(`${BASE_URL}/api/admin/users?tier=pro`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data5 = await res5.json();

    if (!data5.success) {
      console.log('❌ Tier filter failed');
      return false;
    }

    console.log(`✅ Tier filter works (found ${data5.users.length} pro users)`);

    return true;
  } catch (error) {
    console.error('❌ Error testing list users:', error.message);
    return false;
  }
}

async function testGetUserDetail() {
  console.log('\nTesting GET /api/admin/users/:userId (user detail)...');

  if (!testUserId) {
    console.log('⚠️  Skipping user detail test (no test user available)');
    return true;
  }

  try {
    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/users/${testUserId}`);
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication
    const res2 = await fetch(`${BASE_URL}/api/admin/users/${testUserId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data2 = await res2.json();

    if (res2.status !== 200) {
      console.log(`❌ Expected 200 for admin user, got ${res2.status}`);
      console.log('Response:', data2);
      return false;
    }

    if (!data2.success) {
      console.log('❌ Response should have success: true');
      return false;
    }

    if (!data2.user) {
      console.log('❌ Response should have user object');
      return false;
    }

    // Check for required fields
    const requiredFields = ['id', 'email', 'subscription_tier', 'created_at'];
    for (const field of requiredFields) {
      if (!data2.user[field]) {
        console.log(`❌ User object missing field: ${field}`);
        return false;
      }
    }

    console.log('✅ Successfully retrieved user detail');

    // Check for contracts array
    if (!Array.isArray(data2.contracts)) {
      console.log('❌ Response should have contracts array');
      return false;
    }

    console.log(`✅ User has ${data2.contracts.length} contracts`);

    // Test 3: Non-existent user
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const res3 = await fetch(`${BASE_URL}/api/admin/users/${fakeUserId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data3 = await res3.json();

    if (res3.status !== 404) {
      console.log(`❌ Expected 404 for non-existent user, got ${res3.status}`);
      return false;
    }

    console.log('✅ Correctly returns 404 for non-existent user');

    return true;
  } catch (error) {
    console.error('❌ Error testing user detail:', error.message);
    return false;
  }
}

async function testUpdateSubscription() {
  console.log('\nTesting PATCH /api/admin/users/:userId/subscription...');

  if (!testUserId) {
    console.log('⚠️  Skipping subscription update test (no test user available)');
    return true;
  }

  try {
    // Get current subscription
    const getCurrentRes = await pool.query(
      'SELECT subscription_tier FROM users WHERE id = $1',
      [testUserId]
    );
    const currentTier = getCurrentRes.rows[0].subscription_tier;

    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: 'pro' })
    });
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication - change tier
    const newTier = currentTier === 'basic' ? 'pro' : 'basic';
    const res2 = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/subscription`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tier: newTier,
        reason: 'Admin test update'
      })
    });
    const data2 = await res2.json();

    if (res2.status !== 200) {
      console.log(`❌ Expected 200 for subscription update, got ${res2.status}`);
      console.log('Response:', data2);
      return false;
    }

    if (!data2.success) {
      console.log('❌ Response should have success: true');
      return false;
    }

    console.log(`✅ Successfully updated subscription from ${currentTier} to ${newTier}`);

    // Verify the change in database
    const verifyRes = await pool.query(
      'SELECT subscription_tier FROM users WHERE id = $1',
      [testUserId]
    );
    if (verifyRes.rows[0].subscription_tier !== newTier) {
      console.log('❌ Subscription tier not updated in database');
      return false;
    }

    console.log('✅ Subscription tier verified in database');

    // Verify audit log was created
    const auditRes = await pool.query(`
      SELECT * FROM admin_actions
      WHERE action_type = 'subscription_change'
        AND target_user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [testUserId]);

    if (auditRes.rows.length === 0) {
      console.log('❌ Audit log entry not created');
      return false;
    }

    console.log('✅ Audit log entry created');

    // Restore original tier
    await pool.query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      [currentTier, testUserId]
    );

    console.log('✅ Restored original subscription tier');

    return true;
  } catch (error) {
    console.error('❌ Error testing subscription update:', error.message);
    return false;
  }
}

async function testUserImpersonation() {
  console.log('\nTesting POST /api/admin/users/:userId/impersonate...');

  if (!testUserId) {
    console.log('⚠️  Skipping impersonation test (no test user available)');
    return true;
  }

  try {
    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/impersonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication
    const res2 = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/impersonate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data2 = await res2.json();

    if (res2.status !== 200) {
      console.log(`❌ Expected 200 for impersonation, got ${res2.status}`);
      console.log('Response:', data2);
      return false;
    }

    if (!data2.success) {
      console.log('❌ Response should have success: true');
      return false;
    }

    if (!data2.token) {
      console.log('❌ Response should have impersonation token');
      return false;
    }

    console.log('✅ Successfully generated impersonation token');

    // Verify the token is valid
    const decoded = jwt.verify(data2.token, process.env.JWT_SECRET);
    if (decoded.userId !== testUserId) {
      console.log('❌ Impersonation token has wrong userId');
      return false;
    }

    if (!decoded.impersonatedBy) {
      console.log('❌ Token should have impersonatedBy claim');
      return false;
    }

    console.log('✅ Impersonation token has correct claims');

    // Verify audit log was created
    const auditRes = await pool.query(`
      SELECT * FROM admin_actions
      WHERE action_type = 'user_impersonation'
        AND target_user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [testUserId]);

    if (auditRes.rows.length === 0) {
      console.log('❌ Audit log entry not created for impersonation');
      return false;
    }

    console.log('✅ Impersonation audit log entry created');

    return true;
  } catch (error) {
    console.error('❌ Error testing user impersonation:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('=== Admin API Endpoints Tests ===\n');
  console.log('⚠️  Note: Server must be running at ' + BASE_URL + '\n');

  let allPassed = true;

  try {
    await setup();
    console.log('✅ Test setup complete\n');

    // Test 1: List users
    const test1 = await testListUsers();
    allPassed = allPassed && test1;

    // Test 2: Get user detail
    const test2 = await testGetUserDetail();
    allPassed = allPassed && test2;

    // Test 3: Update subscription
    const test3 = await testUpdateSubscription();
    allPassed = allPassed && test3;

    // Test 4: User impersonation
    const test4 = await testUserImpersonation();
    allPassed = allPassed && test4;

    if (allPassed) {
      console.log('\n✅ All admin API tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Please check the API implementation.');
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

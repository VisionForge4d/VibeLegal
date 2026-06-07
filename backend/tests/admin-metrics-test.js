// Admin Metrics & Monitoring Test
// Tests for system metrics and audit log endpoints

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
}

async function testMetricsOverview() {
  console.log('Testing GET /api/admin/metrics/overview...');

  try {
    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/metrics/overview`);
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication
    const res2 = await fetch(`${BASE_URL}/api/admin/metrics/overview`, {
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

    // Verify metrics structure
    const requiredMetrics = ['totalUsers', 'newUsersThisMonth', 'totalContracts', 'contractsThisMonth'];
    for (const metric of requiredMetrics) {
      if (typeof data2.metrics[metric] !== 'number') {
        console.log(`❌ Missing or invalid metric: ${metric}`);
        return false;
      }
    }

    console.log('✅ Metrics overview structure is correct');
    console.log(`   Total Users: ${data2.metrics.totalUsers}`);
    console.log(`   New Users This Month: ${data2.metrics.newUsersThisMonth}`);
    console.log(`   Total Contracts: ${data2.metrics.totalContracts}`);
    console.log(`   Contracts This Month: ${data2.metrics.contractsThisMonth}`);

    // Verify subscription breakdown
    if (!data2.metrics.subscriptionBreakdown) {
      console.log('❌ Missing subscription breakdown');
      return false;
    }

    console.log('✅ Subscription breakdown included');

    return true;
  } catch (error) {
    console.error('❌ Error testing metrics overview:', error.message);
    return false;
  }
}

async function testRecentActivity() {
  console.log('\nTesting GET /api/admin/metrics/recent-activity...');

  try {
    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/metrics/recent-activity`);
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication
    const res2 = await fetch(`${BASE_URL}/api/admin/metrics/recent-activity`, {
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

    // Verify activity structure
    if (!Array.isArray(data2.recentContracts)) {
      console.log('❌ recentContracts should be an array');
      return false;
    }

    if (!Array.isArray(data2.recentSignups)) {
      console.log('❌ recentSignups should be an array');
      return false;
    }

    console.log('✅ Recent activity structure is correct');
    console.log(`   Recent Contracts: ${data2.recentContracts.length}`);
    console.log(`   Recent Signups: ${data2.recentSignups.length}`);

    // Test 3: With limit parameter
    const res3 = await fetch(`${BASE_URL}/api/admin/metrics/recent-activity?limit=5`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data3 = await res3.json();

    if (data3.recentContracts.length > 5 || data3.recentSignups.length > 5) {
      console.log('❌ Limit parameter not working correctly');
      return false;
    }

    console.log('✅ Limit parameter works correctly');

    return true;
  } catch (error) {
    console.error('❌ Error testing recent activity:', error.message);
    return false;
  }
}

async function testAuditLog() {
  console.log('\nTesting GET /api/admin/audit-log...');

  try {
    // Test 1: Without authentication
    const res1 = await fetch(`${BASE_URL}/api/admin/audit-log`);
    if (res1.status !== 401) {
      console.log(`❌ Expected 401 without auth, got ${res1.status}`);
      return false;
    }
    console.log('✅ Correctly rejects unauthenticated request');

    // Test 2: With admin authentication
    const res2 = await fetch(`${BASE_URL}/api/admin/audit-log`, {
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

    if (!Array.isArray(data2.actions)) {
      console.log('❌ actions should be an array');
      return false;
    }

    if (typeof data2.total !== 'number') {
      console.log('❌ total should be a number');
      return false;
    }

    console.log(`✅ Audit log retrieved (${data2.actions.length} actions, total: ${data2.total})`);

    // Verify action structure
    if (data2.actions.length > 0) {
      const action = data2.actions[0];
      const requiredFields = ['id', 'action_type', 'admin_email', 'created_at'];
      for (const field of requiredFields) {
        if (!action[field]) {
          console.log(`❌ Action missing field: ${field}`);
          return false;
        }
      }
      console.log('✅ Action structure is correct');
    }

    // Test 3: With pagination
    const res3 = await fetch(`${BASE_URL}/api/admin/audit-log?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data3 = await res3.json();

    if (!data3.success || data3.actions.length > 5) {
      console.log('❌ Pagination not working correctly');
      return false;
    }

    console.log('✅ Pagination works correctly');

    // Test 4: With action type filter
    const res4 = await fetch(`${BASE_URL}/api/admin/audit-log?actionType=subscription_change`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data4 = await res4.json();

    if (!data4.success) {
      console.log('❌ Action type filter failed');
      return false;
    }

    console.log(`✅ Action type filter works (found ${data4.actions.length} subscription_change actions)`);

    return true;
  } catch (error) {
    console.error('❌ Error testing audit log:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('=== Admin Metrics & Monitoring Tests ===\n');
  console.log('⚠️  Note: Server must be running at ' + BASE_URL + '\n');

  let allPassed = true;

  try {
    await setup();
    console.log('✅ Test setup complete\n');

    // Test 1: Metrics overview
    const test1 = await testMetricsOverview();
    allPassed = allPassed && test1;

    // Test 2: Recent activity
    const test2 = await testRecentActivity();
    allPassed = allPassed && test2;

    // Test 3: Audit log
    const test3 = await testAuditLog();
    allPassed = allPassed && test3;

    if (allPassed) {
      console.log('\n✅ All admin metrics tests passed!');
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

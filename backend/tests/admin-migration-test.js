// Admin Database Migration Test
// Tests for users.is_admin column and admin_actions table

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

// Create a test pool with explicit SSL disabled for local development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function testUsersIsAdminColumn() {
  console.log('Testing users.is_admin column...');

  try {
    // Check if is_admin column exists
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('❌ is_admin column does not exist');
      return false;
    }

    const column = columnCheck.rows[0];

    // Verify column type
    if (column.data_type !== 'boolean') {
      console.log(`❌ is_admin has wrong type: ${column.data_type}, expected: boolean`);
      return false;
    }

    // Verify NOT NULL constraint
    if (column.is_nullable !== 'NO') {
      console.log('❌ is_admin should be NOT NULL');
      return false;
    }

    // Verify default value is false
    if (!column.column_default || !column.column_default.includes('false')) {
      console.log(`❌ is_admin has wrong default: ${column.column_default}, expected: false`);
      return false;
    }

    console.log('✅ users.is_admin column exists with correct schema');

    // Check if index exists
    const indexCheck = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'users' AND indexname = 'idx_users_is_admin'
    `);

    if (indexCheck.rows.length === 0) {
      console.log('⚠️  Warning: idx_users_is_admin index does not exist');
    } else {
      console.log('✅ idx_users_is_admin index exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Error testing users.is_admin column:', error.message);
    return false;
  }
}

async function testAdminActionsTable() {
  console.log('\nTesting admin_actions table...');

  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'admin_actions'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('❌ admin_actions table does not exist');
      return false;
    }

    console.log('✅ admin_actions table exists');

    // Check required columns
    const requiredColumns = {
      'id': 'uuid',
      'admin_user_id': 'uuid',
      'action_type': 'character varying',
      'target_user_id': 'uuid',
      'description': 'text',
      'metadata': 'jsonb',
      'ip_address': 'inet',
      'user_agent': 'text',
      'created_at': 'timestamp with time zone'
    };

    for (const [colName, expectedType] of Object.entries(requiredColumns)) {
      const colCheck = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'admin_actions' AND column_name = $1
      `, [colName]);

      if (colCheck.rows.length === 0) {
        console.log(`❌ Column ${colName} does not exist`);
        return false;
      }

      const column = colCheck.rows[0];

      if (!column.data_type.includes(expectedType.split(' ')[0])) {
        console.log(`❌ Column ${colName} has wrong type: ${column.data_type}, expected: ${expectedType}`);
        return false;
      }

      // Check NOT NULL constraints
      if (['id', 'admin_user_id', 'action_type'].includes(colName) && column.is_nullable !== 'NO') {
        console.log(`❌ Column ${colName} should be NOT NULL`);
        return false;
      }
    }

    console.log('✅ All required columns exist with correct types');

    // Check foreign key constraints
    const fkCheck = await pool.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'admin_actions' AND tc.constraint_type = 'FOREIGN KEY'
    `);

    if (fkCheck.rows.length < 2) {
      console.log(`⚠️  Warning: Expected 2 foreign keys, found ${fkCheck.rows.length}`);
    } else {
      console.log('✅ Foreign key constraints exist');
    }

    // Check indexes
    const requiredIndexes = [
      'idx_admin_actions_admin_user',
      'idx_admin_actions_target_user',
      'idx_admin_actions_created_at',
      'idx_admin_actions_action_type'
    ];

    for (const indexName of requiredIndexes) {
      const indexCheck = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'admin_actions' AND indexname = $1
      `, [indexName]);

      if (indexCheck.rows.length === 0) {
        console.log(`⚠️  Warning: Index ${indexName} does not exist`);
      }
    }

    console.log('✅ admin_actions table schema verified');

    return true;
  } catch (error) {
    console.error('❌ Error testing admin_actions table:', error.message);
    return false;
  }
}

async function testTestUserAdminFlag() {
  console.log('\nTesting test user admin flag...');

  try {
    const result = await pool.query(`
      SELECT id, email, is_admin
      FROM users
      WHERE email = 'test2@vibelegal.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ Test user test2@vibelegal.com does not exist');
      return false;
    }

    const user = result.rows[0];

    if (user.is_admin !== true) {
      console.log(`❌ Test user is_admin is ${user.is_admin}, expected: true`);
      return false;
    }

    console.log('✅ Test user has is_admin = true');
    return true;
  } catch (error) {
    console.error('❌ Error testing test user admin flag:', error.message);
    return false;
  }
}

async function testAdminActionLogging() {
  console.log('\nTesting admin action logging...');

  try {
    // Get test admin user
    const adminResult = await pool.query(`
      SELECT id FROM users WHERE email = 'test2@vibelegal.com'
    `);

    if (adminResult.rows.length === 0) {
      console.log('❌ Test admin user not found');
      return false;
    }

    const adminUserId = adminResult.rows[0].id;

    // Insert a test admin action
    const insertResult = await pool.query(`
      INSERT INTO admin_actions (
        admin_user_id,
        action_type,
        target_user_id,
        description,
        metadata,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `, [
      adminUserId,
      'test_action',
      adminUserId,
      'Test admin action for migration verification',
      JSON.stringify({ test: true }),
      '127.0.0.1',
      'Admin Migration Test Script'
    ]);

    if (insertResult.rows.length === 0) {
      console.log('❌ Failed to insert test admin action');
      return false;
    }

    const actionId = insertResult.rows[0].id;
    console.log(`✅ Test admin action created with id: ${actionId}`);

    // Verify the action can be queried
    const queryResult = await pool.query(`
      SELECT * FROM admin_actions WHERE id = $1
    `, [actionId]);

    if (queryResult.rows.length === 0) {
      console.log('❌ Failed to query test admin action');
      return false;
    }

    const action = queryResult.rows[0];

    // Verify JSON metadata
    if (typeof action.metadata !== 'object' || action.metadata.test !== true) {
      console.log('❌ Metadata JSON not properly stored/retrieved');
      return false;
    }

    console.log('✅ Admin action logging works correctly');

    // Clean up test action
    await pool.query('DELETE FROM admin_actions WHERE id = $1', [actionId]);
    console.log('✅ Test admin action cleaned up');

    return true;
  } catch (error) {
    console.error('❌ Error testing admin action logging:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('=== Admin Database Migration Tests ===\n');

  let allPassed = true;

  try {
    // Test 1: users.is_admin column
    const test1 = await testUsersIsAdminColumn();
    allPassed = allPassed && test1;

    // Test 2: admin_actions table
    const test2 = await testAdminActionsTable();
    allPassed = allPassed && test2;

    // Test 3: Test user admin flag
    const test3 = await testTestUserAdminFlag();
    allPassed = allPassed && test3;

    // Test 4: Admin action logging
    const test4 = await testAdminActionLogging();
    allPassed = allPassed && test4;

    if (allPassed) {
      console.log('\n✅ All admin migration tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Please check the migration.');
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

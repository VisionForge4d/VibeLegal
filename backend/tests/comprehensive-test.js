/**
 * Comprehensive API Test Suite for VibeLegal
 * Tests all endpoints systematically
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

// Test credentials (from environment variables or README.md)
const TEST_EMAIL = process.env.TEST_EMAIL || 'test2@vibelegal.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD;

if (!TEST_PASSWORD) {
  console.error('❌ TEST_PASSWORD environment variable required');
  console.error('💡 Set via: export TEST_PASSWORD="<password-from-README>"');
  console.error('📖 See README.md for test user credentials');
  process.exit(1);
}

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, useAuth = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsedBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Helper to record test result
function recordTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    const res = await makeRequest('GET', '/api/health');
    recordTest('GET /api/health', res.status === 200 && res.data.status === 'ok',
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('GET /api/health', false, err.message);
  }
}

async function testAuthEndpoints() {
  console.log('\n🔍 Testing Authentication Endpoints...');

  // Test login with valid credentials
  try {
    const res = await makeRequest('POST', '/api/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    recordTest('POST /api/login (valid)', res.status === 200 && res.data.token,
      res.status !== 200 ? `Status: ${res.status}, Error: ${res.data.error}` : '');
    if (res.data.token) {
      authToken = res.data.token;
    }
  } catch (err) {
    recordTest('POST /api/login (valid)', false, err.message);
  }

  // Test login with invalid credentials
  try {
    const res = await makeRequest('POST', '/api/login', {
      email: TEST_EMAIL,
      password: 'wrongpassword'
    });
    recordTest('POST /api/login (invalid)', res.status === 401,
      res.status === 401 ? '' : `Expected 401, got ${res.status}`);
  } catch (err) {
    recordTest('POST /api/login (invalid)', false, err.message);
  }

  // Test register endpoint (without actually creating a user)
  try {
    const res = await makeRequest('POST', '/api/register', {
      email: 'existing@test.com',
      password: 'Test123!@#'
    });
    // Should fail because we don't want to create test users, or succeed if user exists
    recordTest('POST /api/register (endpoint accessible)', res.status === 400 || res.status === 200 || res.status === 409,
      `Status: ${res.status}`);
  } catch (err) {
    recordTest('POST /api/register (endpoint accessible)', false, err.message);
  }
}

async function testContractEndpoints() {
  console.log('\n🔍 Testing Contract Endpoints...');

  if (!authToken) {
    console.log('⚠️  Skipping contract tests - no auth token');
    return;
  }

  // Test list user contracts
  try {
    const res = await makeRequest('GET', '/api/user-contracts', null, true);
    recordTest('GET /api/user-contracts', res.status === 200 && Array.isArray(res.data.contracts),
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('GET /api/user-contracts', false, err.message);
  }

  // Test save contract
  try {
    const res = await makeRequest('POST', '/api/save-contract', {
      title: 'Test Contract',
      content: 'Test content',
      contractType: 'employment_agreement'
    }, true);
    recordTest('POST /api/save-contract', res.status === 200 || res.status === 201,
      res.status < 200 || res.status >= 300 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('POST /api/save-contract', false, err.message);
  }
}

async function testSubscriptionEndpoints() {
  console.log('\n🔍 Testing Subscription Endpoints...');

  if (!authToken) {
    console.log('⚠️  Skipping subscription tests - no auth token');
    return;
  }

  // Test get subscription status
  try {
    const res = await makeRequest('GET', '/api/user/subscription', null, true);
    recordTest('GET /api/user/subscription', res.status === 200,
      res.status !== 200 ? `Status: ${res.status}, Error: ${JSON.stringify(res.data)}` : '');
  } catch (err) {
    recordTest('GET /api/user/subscription', false, err.message);
  }

  // Test check feature access
  try {
    const res = await makeRequest('GET', '/api/user/access/conversational_ai', null, true);
    recordTest('GET /api/user/access/:feature', res.status === 200,
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('GET /api/user/access/:feature', false, err.message);
  }
}

async function testAIChatEndpoints() {
  console.log('\n🔍 Testing AI/Chat Endpoints...');

  if (!authToken) {
    console.log('⚠️  Skipping AI/chat tests - no auth token');
    return;
  }

  // Test get recent chat sessions
  try {
    const res = await makeRequest('GET', '/api/ai/chat/recent', null, true);
    recordTest('GET /api/ai/chat/recent', res.status === 200 && res.data.success,
      res.status !== 200 ? `Status: ${res.status}, Error: ${JSON.stringify(res.data)}` : '');
  } catch (err) {
    recordTest('GET /api/ai/chat/recent', false, err.message);
  }

  // Test start new chat session
  try {
    const res = await makeRequest('POST', '/api/ai/chat/start', {
      contractType: 'employment_agreement'
    }, true);
    recordTest('POST /api/ai/chat/start', res.status === 200 && res.data.success,
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('POST /api/ai/chat/start', false, err.message);
  }
}

async function testClauseLibraryEndpoints() {
  console.log('\n🔍 Testing Clause Library & Feature Endpoints...');

  if (!authToken) {
    console.log('⚠️  Skipping clause library tests - no auth token');
    return;
  }

  // Test get clause library
  try {
    const res = await makeRequest('GET', '/api/clause-library', null, true);
    recordTest('GET /api/clause-library', res.status === 200 && res.data.clauses,
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('GET /api/clause-library', false, err.message);
  }

  // Test get features list
  try {
    const res = await makeRequest('GET', '/api/features', null, true);
    recordTest('GET /api/features', res.status === 200,
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('GET /api/features', false, err.message);
  }
}

async function testMetricsEndpoint() {
  console.log('\n🔍 Testing Metrics Endpoint...');

  try {
    const res = await makeRequest('GET', '/api/metrics');
    recordTest('GET /api/metrics', res.status === 200,
      res.status !== 200 ? `Status: ${res.status}` : '');
  } catch (err) {
    recordTest('GET /api/metrics', false, err.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Test Suite\n');
  console.log('='.repeat(60));

  await testHealthEndpoint();
  await testAuthEndpoints();
  await testContractEndpoints();
  await testSubscriptionEndpoints();
  await testAIChatEndpoints();
  await testClauseLibraryEndpoints();
  await testMetricsEndpoint();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total: ${testResults.tests.length}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.details}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});

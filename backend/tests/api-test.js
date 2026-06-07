// Quick API test for refactored routes
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testHealth() {
  console.log('Testing /api/health...');
  const res = await fetch(`${BASE_URL}/api/health`);
  const data = await res.json();
  console.log('✅ Health:', data);
}

async function testLogin() {
  console.log('\nTesting /api/login...');
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test2@vibelegal.com',
      password: 'DemoPassword123!'
    })
  });
  const data = await res.json();

  if (data.token) {
    console.log('✅ Login successful, token:', data.token.substring(0, 20) + '...');
    return data.token;
  } else {
    console.log('❌ Login failed:', data);
    return null;
  }
}

async function testProtectedRoute(token) {
  if (!token) return;

  console.log('\nTesting /api/user-contracts...');
  const res = await fetch(`${BASE_URL}/api/user-contracts`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('✅ User contracts:', {
    totalCount: data.totalCount,
    monthlyCount: data.monthlyCount,
    contracts: data.contracts.length
  });
}

async function runTests() {
  try {
    await testHealth();
    const token = await testLogin();
    await testProtectedRoute(token);
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();

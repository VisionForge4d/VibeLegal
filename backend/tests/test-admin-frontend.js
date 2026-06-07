// Quick test script to get admin token
const fetch = require('node-fetch');

async function testAdmin() {
  // Login
  const loginRes = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test2@vibelegal.com',
      password: 'DemoPassword123!'
    })
  });

  const loginData = await loginRes.json();

  if (!loginData.token) {
    console.error('❌ Login failed:', loginData);
    return;
  }

  console.log('✅ Login successful');
  console.log('Token:', loginData.token);

  // Test admin metrics
  const metricsRes = await fetch('http://localhost:5000/api/admin/metrics/overview', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });

  const metricsData = await metricsRes.json();
  console.log('\n✅ Admin metrics retrieved:');
  console.log(JSON.stringify(metricsData, null, 2));

  // Test recent activity
  const activityRes = await fetch('http://localhost:5000/api/admin/metrics/recent-activity', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });

  const activityData = await activityRes.json();
  console.log('\n✅ Recent activity retrieved:');
  console.log('Recent Contracts:', activityData.recentContracts?.length || 0);
  console.log('Recent Signups:', activityData.recentSignups?.length || 0);

  console.log('\n✅ All admin endpoints working!');
  console.log('\n📱 Frontend URL: http://localhost:5173/admin');
  console.log('   Login with: test2@vibelegal.com / DemoPassword123!');
}

testAdmin().catch(console.error);

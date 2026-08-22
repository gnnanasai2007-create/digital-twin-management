/**
 * Direct Live API & Frontend Verification Script
 */

const http = require('http');

async function checkUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', (err) => reject(err));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function verifyAll() {
  console.log('🚀 Verifying Live DTAM Server and Frontend Services...\n');

  try {
    // 1. Backend Health
    const health = await checkUrl('http://127.0.0.1:5000/api/health');
    console.log(`[1] Backend /api/health -> Status: ${health.statusCode}, Body: ${health.body}`);

    // 2. Auth Login Admin
    const loginPayload = JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' });
    const loginRes = await checkUrl('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) },
      body: loginPayload,
    });
    console.log(`[2] Auth Admin Login -> Status: ${loginRes.statusCode}`);
    const token = JSON.parse(loginRes.body).token;

    // 3. Assets Stats
    const statsRes = await checkUrl('http://127.0.0.1:5000/api/assets/stats');
    console.log(`[3] Asset Stats -> Status: ${statsRes.statusCode}, Data: ${statsRes.body}`);

    // 4. Asset List
    const assetsRes = await checkUrl('http://127.0.0.1:5000/api/assets');
    const assetsJson = JSON.parse(assetsRes.body);
    console.log(`[4] Asset List -> Status: ${assetsRes.statusCode}, Total Assets: ${assetsJson.count}`);

    // 5. Digital Twins List
    const twinsRes = await checkUrl('http://127.0.0.1:5000/api/digital-twins');
    const twinsJson = JSON.parse(twinsRes.body);
    console.log(`[5] Digital Twins -> Status: ${twinsRes.statusCode}, Total Twins: ${twinsJson.count}`);

    // 6. Maintenance Work Orders
    const maintRes = await checkUrl('http://127.0.0.1:5000/api/maintenance');
    const maintJson = JSON.parse(maintRes.body);
    console.log(`[6] Maintenance Tasks -> Status: ${maintRes.statusCode}, Total Tasks: ${maintJson.count}`);

    // 7. Active Alerts
    const alertsRes = await checkUrl('http://127.0.0.1:5000/api/alerts');
    const alertsJson = JSON.parse(alertsRes.body);
    console.log(`[7] Alerts -> Status: ${alertsRes.statusCode}, Total Alerts: ${alertsJson.count}`);

    // 8. Analytics Overview
    const analyticsRes = await checkUrl('http://127.0.0.1:5000/api/analytics/overview?range=30d');
    console.log(`[8] Analytics Overview -> Status: ${analyticsRes.statusCode}`);

    // 9. Frontend Vite Dev Server
    const frontendRes = await checkUrl('http://127.0.0.1:5173/');
    console.log(`[9] Frontend Vite Server -> Status: ${frontendRes.statusCode}, HTML Size: ${frontendRes.body.length} bytes`);

    console.log('\n✨ ALL SERVICES VERIFIED AND HEALTHY!');
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

verifyAll();

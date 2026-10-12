#!/usr/bin/env node
const BASE_URL = process.env.API_URL || 'http://localhost:5001';

const categories = ['plumbing', 'electrical', 'internet', 'furniture', 'cleanliness', 'other'];
const severities = ['low', 'medium', 'high', 'critical'];
const locations = ['Room 101', 'Room 102', 'Room 205', 'Common Washroom 1', 'Dining Hall', '3rd Floor Hallway'];

const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalLatencyMs: 0,
  latencies: [],
  errors: []
};

async function timedFetch(url, options = {}) {
  const start = performance.now();
  stats.totalRequests += 1;
  try {
    const res = await fetch(url, options);
    const duration = performance.now() - start;
    stats.totalLatencyMs += duration;
    stats.latencies.push(duration);

    if (res.ok) {
      stats.successfulRequests += 1;
      const data = await res.json().catch(() => ({}));
      return { ok: true, status: res.status, data, duration };
    } else {
      stats.failedRequests += 1;
      const errText = await res.text();
      stats.errors.push(`HTTP ${res.status} on ${options.method || 'GET'} ${url}: ${errText.slice(0, 100)}`);
      return { ok: false, status: res.status, duration };
    }
  } catch (err) {
    const duration = performance.now() - start;
    stats.totalLatencyMs += duration;
    stats.failedRequests += 1;
    stats.errors.push(`Network Error on ${url}: ${err.message}`);
    return { ok: false, error: err.message, duration };
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLoadTest() {
  console.log('==================================================');
  console.log('     FixMyHostel Load Test Simulation');
  console.log(`     Target: ${BASE_URL}`);
  console.log('==================================================');

  // 1. Register a staff member for complaint handling
  const staffEmail = `staff_${Date.now()}@fixmyhostel.com`;
  console.log(`Registering staff account: ${staffEmail}`);
  const staffReg = await timedFetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Simulated Staff Tech',
      email: staffEmail,
      password: 'password123',
      role: 'staff',
      room_number: 'Maintenance Office'
    })
  });

  const staffToken = staffReg.data?.token;
  if (!staffToken) {
    console.error('Failed to obtain staff token. Aborting.');
    return;
  }

  // 2. Simulate 10 students concurrently
  console.log('\nSimulating 10 students registering & filing complaints...');
  const studentTasks = Array.from({ length: 10 }, async (_, i) => {
    const email = `student_${Date.now()}_${i}@test.com`;
    const regRes = await timedFetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Student Tester ${i + 1}`,
        email,
        password: 'password123',
        room_number: `A-${100 + i}`
      })
    });

    const studentToken = regRes.data?.token;
    if (!studentToken) return;

    // Each student raises 3 to 5 complaints
    const complaintCount = 3 + Math.floor(Math.random() * 3);
    for (let c = 1; c <= complaintCount; c++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      await timedFetch(`${BASE_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          title: `Automated issue ${c} from Student ${i + 1}`,
          description: `Detailed description for simulated ${category} problem`,
          category,
          severity,
          location
        })
      });

      await sleep(50); // slight stagger
    }
  });

  await Promise.all(studentTasks);

  // 3. Staff member fetches queue and works through complaints
  console.log('\nSimulating staff processing queue...');
  const queueRes = await timedFetch(`${BASE_URL}/api/staff/queue`, {
    headers: { Authorization: `Bearer ${staffToken}` }
  });

  if (queueRes.ok && Array.isArray(queueRes.data)) {
    console.log(`Staff fetched queue: ${queueRes.data.length} complaints pending.`);
    const complaintsToProcess = queueRes.data.slice(0, 15); // process top 15

    for (const item of complaintsToProcess) {
      // Accept
      await timedFetch(`${BASE_URL}/api/staff/${item.id}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      await sleep(25);

      // Start
      await timedFetch(`${BASE_URL}/api/staff/${item.id}/start`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      await sleep(25);

      // Resolve
      await timedFetch(`${BASE_URL}/api/staff/${item.id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify({
          resolution_notes: `Resolved during load testing cycle for item #${item.id}`
        })
      });
    }
  }

  // 4. Print Summary
  const avgLatency = stats.totalRequests > 0 
    ? (stats.totalLatencyMs / stats.totalRequests).toFixed(2) 
    : 0;
  const successRate = stats.totalRequests > 0 
    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) 
    : 0;

  console.log('\n==================================================');
  console.log('              LOAD TEST SUMMARY');
  console.log('==================================================');
  console.log(`Total Requests:      ${stats.totalRequests}`);
  console.log(`Successful:          ${stats.successfulRequests}`);
  console.log(`Failed:              ${stats.failedRequests}`);
  console.log(`Success Rate:        ${successRate}%`);
  console.log(`Average Latency:     ${avgLatency} ms`);
  if (stats.errors.length > 0) {
    console.log(`Errors encountered (${stats.errors.length}):`);
    stats.errors.slice(0, 5).forEach(e => console.log(` - ${e}`));
    if (stats.errors.length > 5) {
      console.log(` ... and ${stats.errors.length - 5} more`);
    }
  }
  console.log('==================================================');
}

runLoadTest().catch(console.error);

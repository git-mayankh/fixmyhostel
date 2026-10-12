const { app, request, resetStore } = require('./setup');
const packageJson = require('../package.json');

describe('Ops API Tests (4 tests)', () => {
  beforeEach(() => {
    resetStore();
  });

  // 1. GET /health returns UP and version
  test('GET /health returns UP and version', async () => {
    const res = await request(app).get('/api/ops/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('version', packageJson.version);
  });

  // 2. GET /metrics returns prometheus format
  test('GET /metrics returns prometheus format', async () => {
    const res = await request(app).get('/api/ops/metrics');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain('http_requests_total');
  });

  // 3. unknown route returns 404 JSON
  test('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/api/ops/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });

  // 4. health check includes uptime
  test('health check includes uptime', async () => {
    const res = await request(app).get('/api/ops/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

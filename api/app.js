const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const client = require('prom-client');

const createAuthRoutes = require('./routes/auth');
const createComplaintsRoutes = require('./routes/complaints');
const createStaffRoutes = require('./routes/staff');
const createAdminRoutes = require('./routes/admin');
const createOpsRoutes = require('./routes/ops');

function createApp(store) {
  const app = express();

  // Prometheus Metrics Registry
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register]
  });

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register]
  });

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Prometheus Metrics Middleware
  app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const durationSeconds = diff[0] + diff[1] / 1e9;
      const route = req.baseUrl || req.path || 'unknown';
      const status = res.statusCode ? res.statusCode.toString() : '500';

      httpRequestCounter.inc({ method: req.method, route, status });
      httpRequestDuration.observe({ method: req.method, route, status }, durationSeconds);
    });
    next();
  });

  // Serve uploaded files
  const uploadDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Mount API routes
  app.use('/api/auth', createAuthRoutes(store));
  app.use('/api/complaints', createComplaintsRoutes(store));
  app.use('/api/staff', createStaffRoutes(store));
  app.use('/api/admin', createAdminRoutes(store));
  app.use('/api/ops', createOpsRoutes(store, register));

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Centralized Error handler
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const status = err.status || err.statusCode || 500;
    if (process.env.NODE_ENV !== 'test') {
      console.error('API Error:', err);
    }
    res.status(status).json({
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}

module.exports = {
  createApp
};

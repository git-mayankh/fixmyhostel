const express = require('express');
const client = require('prom-client');
const packageJson = require('../package.json');

function createOpsRoutes(store, register) {
  const router = express.Router();
  const promRegistry = register || client.register;

  // GET /health
  router.get('/health', async (req, res) => {
    try {
      const isHealthy = await store.checkHealth();
      if (!isHealthy) {
        return res.status(503).json({
          status: 'DOWN',
          version: packageJson.version,
          uptime: process.uptime(),
          error: 'Database connection failed'
        });
      }

      return res.status(200).json({
        status: 'UP',
        version: packageJson.version,
        uptime: process.uptime()
      });
    } catch (err) {
      return res.status(503).json({
        status: 'DOWN',
        version: packageJson.version,
        uptime: process.uptime(),
        error: err.message
      });
    }
  });

  // GET /metrics
  router.get('/metrics', async (req, res, next) => {
    try {
      res.set('Content-Type', promRegistry.contentType);
      const metrics = await promRegistry.metrics();
      res.end(metrics);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createOpsRoutes;

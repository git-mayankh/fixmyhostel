require('dotenv').config();
const { createApp } = require('./app');
const { SqlStore } = require('./models/store');
const { initDbSchema } = require('./models/db');

const store = new SqlStore();
const app = createApp(store);

const PORT = parseInt(process.env.PORT, 10) || 5000;
let server = null;

if (require.main === module) {
  // Initialize database schema if possible, then start listening
  initDbSchema()
    .then(() => {
      console.log('Database tables verified/initialized.');
    })
    .catch((err) => {
      console.warn('Database initialization warning (will retry on incoming requests):', err.message);
    })
    .finally(() => {
      server = app.listen(PORT, () => {
        console.log(`FixMyHostel API server listening on port ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
      });
      app.server = server;
    });
}

module.exports = app;

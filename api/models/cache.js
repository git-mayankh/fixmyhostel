const Redis = require('ioredis');

let client = null;
let isConnected = false;

function initRedis() {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT, 10) || 6379;

  try {
    client = new Redis({
      host,
      port,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      }
    });

    client.on('connect', () => {
      isConnected = true;
      console.log('Connected to Redis');
    });

    client.on('error', (err) => {
      isConnected = false;
      console.warn('Redis warning/error (continuing without cache):', err.message);
    });

    client.on('close', () => {
      isConnected = false;
    });

    // Try initial connection
    client.connect().catch((err) => {
      isConnected = false;
      console.warn('Initial Redis connection failed (cache disabled):', err.message);
    });
  } catch (err) {
    console.warn('Failed to initialize Redis client:', err.message);
    client = null;
    isConnected = false;
  }

  return client;
}

initRedis();

async function getCache(key) {
  if (!client || !isConnected) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Redis getCache error for key ${key}:`, err.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 300) {
  if (!client || !isConnected) return;
  try {
    const stringVal = JSON.stringify(value);
    if (ttlSeconds) {
      await client.set(key, stringVal, 'EX', ttlSeconds);
    } else {
      await client.set(key, stringVal);
    }
  } catch (err) {
    console.warn(`Redis setCache error for key ${key}:`, err.message);
  }
}

async function deleteCache(key) {
  if (!client || !isConnected) return;
  try {
    await client.del(key);
  } catch (err) {
    console.warn(`Redis deleteCache error for key ${key}:`, err.message);
  }
}

async function deleteCachePattern(pattern) {
  if (!client || !isConnected) return;
  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    console.warn(`Redis deleteCachePattern error for pattern ${pattern}:`, err.message);
  }
}

module.exports = {
  client,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern
};

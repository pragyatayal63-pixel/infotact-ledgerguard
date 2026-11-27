const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is missing in environment variables');
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

module.exports = redis;

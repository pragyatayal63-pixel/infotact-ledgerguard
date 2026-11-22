const crypto = require('crypto');
const redis = require('../config/redis');

// Atomic Lua script: only deletes the lock if the token matches the owner
const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

/**
 * Acquire a distributed lock for a specific resource (e.g., tenantId:accountId)
 * @param {string} resourceKey - Unique key for the resource being locked
 * @param {number} ttlMs - Lock auto-expiry time in milliseconds (default 10s)
 * @param {number} retryCount - Number of retry attempts if locked
 * @param {number} retryDelayMs - Delay between retries in milliseconds
 * @returns {Promise<string|null>} Lock token if acquired, or null if busy
 */
async function acquireLock(resourceKey, ttlMs = 10000, retryCount = 5, retryDelayMs = 100) {
  const lockKey = `lock:${resourceKey}`;
  const token = crypto.randomUUID();

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    const result = await redis.set(lockKey, token, 'PX', ttlMs, 'NX');
    if (result === 'OK') {
      return token;
    }
    if (attempt < retryCount) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return null;
}

/**
 * Release a distributed lock safely using its owner token
 * @param {string} resourceKey - Same resource key used to acquire the lock
 * @param {string} token - Owner token returned by acquireLock
 * @returns {Promise<boolean>} True if released, false if expired or owned by another process
 */
async function releaseLock(resourceKey, token) {
  const lockKey = `lock:${resourceKey}`;
  const released = await redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, token);
  return released === 1;
}

/**
 * Helper wrapper to run a critical section inside a distributed lock
 */
async function withLock(resourceKey, fn, options = {}) {
  const { ttlMs = 10000, retryCount = 5, retryDelayMs = 100 } = options;
  const token = await acquireLock(resourceKey, ttlMs, retryCount, retryDelayMs);

  if (!token) {
    const err = new Error(`Resource is currently locked: ${resourceKey}`);
    err.statusCode = 409;
    throw err;
  }

  try {
    return await fn();
  } finally {
    await releaseLock(resourceKey, token);
  }
}

module.exports = {
  acquireLock,
  releaseLock,
  withLock,
};

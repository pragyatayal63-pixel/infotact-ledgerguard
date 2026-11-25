const crypto = require('crypto');

let redis;
try {
  redis = require('../config/redis');
} catch {
  redis = null;
}

// Local in-memory fallback when Redis is not running on dev machine
const localLocks = new Map();

async function setLocalLock(key, token, ttlMs) {
  const existing = localLocks.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return null;
  }
  localLocks.set(key, { token, expiresAt: Date.now() + ttlMs });
  return 'OK';
}

async function evalLocalRelease(key, token) {
  const existing = localLocks.get(key);
  if (existing && existing.expiresAt > Date.now() && existing.token === token) {
    localLocks.delete(key);
    return 1;
  }
  return 0;
}

const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

async function acquireLock(resourceKey, ttlMs = 10000, retryCount = 5, retryDelayMs = 100) {
  const lockKey = `lock:${resourceKey}`;
  const token = crypto.randomUUID();

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const result = redis
        ? await redis.set(lockKey, token, 'PX', ttlMs, 'NX')
        : await setLocalLock(lockKey, token, ttlMs);

      if (result === 'OK') {
        return token;
      }
    } catch {
      const fallbackResult = await setLocalLock(lockKey, token, ttlMs);
      if (fallbackResult === 'OK') {
        return token;
      }
    }

    if (attempt < retryCount) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return null;
}

async function releaseLock(resourceKey, token) {
  const lockKey = `lock:${resourceKey}`;
  try {
    const released = redis
      ? await redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, token)
      : await evalLocalRelease(lockKey, token);
    return released === 1;
  } catch {
    const fallbackReleased = await evalLocalRelease(lockKey, token);
    return fallbackReleased === 1;
  }
}

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
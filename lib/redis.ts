import { Redis } from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

// Instantiate a singleton Redis client to prevent exhaustion in Next.js development mode
export const redis = globalForRedis.redis || new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;

import redis from './redis';

/**
 * Helper to fetch data from cache or execute a fallback DB call
 * @param key The Redis cache key
 * @param fetcher The function to execute if cache miss
 * @param ttlSeconds Time-to-live for the cache in seconds (e.g., 60 for 1 minute)
 */
export async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 60): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) {
            return JSON.parse(cached) as T;
        }
    } catch (error) {
        console.warn(`Redis Cache Error for key ${key}:`, error);
        // Continue to fetcher if Redis fails (graceful degradation)
    }

    const data = await fetcher();

    try {
        if (data) {
            await redis.setex(key, ttlSeconds, JSON.stringify(data));
        }
    } catch (error) {
        console.warn(`Failed to set Redis Cache for key ${key}:`, error);
    }

    return data;
}

/**
 * Invalidates a specific cache key/pattern
 */
export async function invalidateCachePrefix(prefix: string) {
    try {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.warn(`Failed to invalidate cache prefix ${prefix}:`, error);
    }
}

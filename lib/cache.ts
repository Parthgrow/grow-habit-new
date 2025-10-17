import { kv } from '@vercel/kv';

// Cache key format: daily:{userId}:{habitId}:{year}:{date}
// Example: daily:user123:habit456:2025:2025-01-15
const CACHE_PREFIX = 'daily';
const CACHE_TTL = 86400; // 24 hours in seconds

/**
 * Generate cache key for daily yearly data
 */
function getCacheKey(userId: string, habitId: string, year: number): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return `${CACHE_PREFIX}:${userId}:${habitId}:${year}:${today}`;
}

/**
 * Get cached yearly data
 */
export async function getCachedYearlyData(
  userId: string, 
  habitId: string, 
  year: number
): Promise<any | null> {
  try {
    const cacheKey = getCacheKey(userId, habitId, year);
    const cachedData = await kv.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    console.log(`Cache miss for ${cacheKey}`);
    return null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

/**
 * Set cached yearly data with 24-hour TTL
 */
export async function setCachedYearlyData(
  userId: string,
  habitId: string,
  year: number,
  data: any
): Promise<void> {
  try {
    const cacheKey = getCacheKey(userId, habitId, year);
    await kv.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    console.log(`Cached data for ${cacheKey} with TTL ${CACHE_TTL}s`);
  } catch (error) {
    console.error('Error setting cached data:', error);
    // Don't throw error - caching is not critical
  }
}

/**
 * Clear cache for a specific user/habit/year (optional - for manual invalidation)
 */
export async function clearCachedYearlyData(
  userId: string,
  habitId: string,
  year: number
): Promise<void> {
  try {
    const cacheKey = getCacheKey(userId, habitId, year);
    await kv.del(cacheKey);
    console.log(`Cleared cache for ${cacheKey}`);
  } catch (error) {
    console.error('Error clearing cached data:', error);
  }
}

/**
 * Get cache info for debugging
 */
export async function getCacheInfo(userId: string, habitId: string, year: number): Promise<any> {
  try {
    const cacheKey = getCacheKey(userId, habitId, year);
    const ttl = await kv.ttl(cacheKey);
    const exists = await kv.exists(cacheKey);
    
    return {
      key: cacheKey,
      exists: exists === 1,
      ttl: ttl,
      expiresIn: ttl > 0 ? `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m` : 'expired'
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return null;
  }
}

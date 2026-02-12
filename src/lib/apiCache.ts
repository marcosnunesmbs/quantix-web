// Simple in-memory cache for API requests
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  // Set a value in cache with TTL (time to live) in milliseconds
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get a value from cache if it exists and hasn't expired
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if the cache entry has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Delete a specific key from cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }

  // Check if a key exists in cache (and hasn't expired)
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Create a singleton instance
const apiCache = new ApiCache();

export default apiCache;
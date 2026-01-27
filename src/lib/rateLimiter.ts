/**
 * Client-side rate limiting utility
 * Prevents rapid-fire requests to prevent abuse
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if an action is rate limited
   * @param key - Unique identifier for the action (e.g., 'login', 'register')
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No previous attempts or window expired
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Within rate limit
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining time in seconds until rate limit resets
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const now = Date.now();
    if (now >= entry.resetTime) return 0;

    return Math.ceil((entry.resetTime - now) / 1000);
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configs
export const RATE_LIMITS = {
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  CONTACT_FORM: {
    maxRequests: 2,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  AI_CHAT: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

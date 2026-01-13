/**
 * CSRF Protection Utilities
 * Implements CSRF token generation and validation
 */

import { logger } from '@/services/loggingService';

class CSRFProtection {
    private tokenKey = 'csrf_token';
    private token: string | null = null;

    /**
     * Generate a new CSRF token
     */
    generateToken(): string {
        // Generate a random token using crypto API
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        // Store in sessionStorage (not localStorage, expires with session)
        sessionStorage.setItem(this.tokenKey, token);
        this.token = token;

        logger.debug('CSRF token generated');
        return token;
    }

    /**
     * Get the current CSRF token (or generate if none exists)
     */
    getToken(): string {
        if (this.token) return this.token;

        // Try to get from sessionStorage
        const stored = sessionStorage.getItem(this.tokenKey);
        if (stored) {
            this.token = stored;
            return stored;
        }

        // Generate new token
        return this.generateToken();
    }

    /**
     * Validate a CSRF token
     */
    validateToken(token: string): boolean {
        const expected = this.getToken();
        return token === expected;
    }

    /**
     * Get headers object with CSRF token
     */
    getHeaders(): Record<string, string> {
        return {
            'X-CSRF-Token': this.getToken(),
        };
    }

    /**
     * Clear the CSRF token (e.g., on logout)
     */
    clearToken(): void {
        sessionStorage.removeItem(this.tokenKey);
        this.token = null;
        logger.debug('CSRF token cleared');
    }
}

// Export singleton instance
export const csrfProtection = new CSRFProtection();

/**
 * Fetch wrapper with CSRF protection
 */
export async function secureFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Add CSRF token to headers for state-changing requests
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        options.headers = {
            ...options.headers,
            ...csrfProtection.getHeaders(),
        };
    }

    return fetch(url, options);
}

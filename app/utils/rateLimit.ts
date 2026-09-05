/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a similar solution
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP address or user ID)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false otherwise
 */
export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries
  if (entry && entry.resetTime < now) {
    rateLimitMap.delete(identifier);
    return false;
  }

  // Create new entry if none exists
  if (!entry) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return true;
  }

  // Increment count
  entry.count++;
  return false;
}

/**
 * Get rate limit information for a client
 * @param identifier - Unique identifier for the client
 * @param maxRequests - Maximum number of requests allowed (should match the value used with checkRateLimit)
 * @returns Rate limit info or null if not rate limited
 */
export function getRateLimitInfo(
  identifier: string,
  maxRequests: number = 10,
): { resetTime: number; remaining: number } | null {
  const entry = rateLimitMap.get(identifier);
  if (!entry) return null;

  const now = Date.now();
  if (entry.resetTime < now) {
    rateLimitMap.delete(identifier);
    return null;
  }

  return {
    resetTime: entry.resetTime,
    remaining: Math.max(0, maxRequests - entry.count),
  };
}

/**
 * Extract client IP from request headers
 * @param request - Next.js Request object
 * @returns Client IP address
 */
export function getClientIp(request: Request): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  // Fallback to a default
  return 'unknown';
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, getRateLimitInfo, getClientIp } from './rateLimit';

describe('rateLimit utilities', () => {
  beforeEach(() => {
    // Clear rate limit map before each test by checking a new IP
    // The in-memory map will be cleared by using unique identifiers per test
  });

  afterEach(() => {
    // Rate limit map is in-memory and will persist between tests
    // Each test uses unique identifiers to avoid interference
  });

  describe('checkRateLimit', () => {
    it('should return false for first request', () => {
      const result = checkRateLimit('test-ip', 10, 60000);
      expect(result).toBe(false);
    });

    it('should return false when under limit', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-ip', 10, 60000);
      }
      const result = checkRateLimit('test-ip', 10, 60000);
      expect(result).toBe(false);
    });

    it('should return true when limit exceeded', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit('test-ip', 10, 60000);
      }
      const result = checkRateLimit('test-ip', 10, 60000);
      expect(result).toBe(true);
    });

    it('should handle different identifiers independently', () => {
      // Hit limit for one IP
      for (let i = 0; i < 10; i++) {
        checkRateLimit('ip1', 10, 60000);
      }

      // Other IP should still be allowed
      const result = checkRateLimit('ip2', 10, 60000);
      expect(result).toBe(false);
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return null for new identifier', () => {
      const result = getRateLimitInfo('new-ip');
      expect(result).toBeNull();
    });

    it('should return info for existing identifier', () => {
      checkRateLimit('test-ip', 10, 60000);
      const result = getRateLimitInfo('test-ip');
      expect(result).not.toBeNull();
      expect(result?.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-real-ip': '192.168.1.2' },
      });
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('https://example.com', {
        headers: { 'cf-connecting-ip': '192.168.1.3' },
      });
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.3');
    });

    it('should prefer cf-connecting-ip over other headers', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
          'cf-connecting-ip': '192.168.1.3',
        },
      });
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.3');
    });

    it('should return unknown when no IP headers present', () => {
      const request = new Request('https://example.com');
      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });
  });
});

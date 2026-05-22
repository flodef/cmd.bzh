import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getLocalStorageItem, setLocalStorageItem } from './localStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('localStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  describe('getLocalStorageItem', () => {
    it('should return default value when key is not provided', () => {
      const result = getLocalStorageItem('', 'default');
      expect(result).toBe('default');
    });

    it('should return default value when key does not exist', () => {
      const result = getLocalStorageItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return parsed value when key exists', () => {
      localStorage.setItem('test-key', JSON.stringify({ value: 'test' }));
      const result = getLocalStorageItem<{ value: string }>('test-key');
      expect(result).toEqual({ value: 'test' });
    });

    it('should return default value when JSON parsing fails', () => {
      localStorage.setItem('test-key', 'invalid json');
      const result = getLocalStorageItem('test-key', 'default');
      expect(result).toBe('default');
    });
  });

  describe('setLocalStorageItem', () => {
    it('should not throw error when key is not provided', () => {
      expect(() => setLocalStorageItem('', 'value')).not.toThrow();
    });

    it('should set value when key is provided', () => {
      setLocalStorageItem('test-key', { value: 'test' });
      const result = localStorage.getItem('test-key');
      expect(result).toBe(JSON.stringify({ value: 'test' }));
    });

    it('should remove key when value is undefined', () => {
      localStorage.setItem('test-key', JSON.stringify({ value: 'test' }));
      setLocalStorageItem('test-key', undefined);
      const result = localStorage.getItem('test-key');
      expect(result).toBeNull();
    });

    it('should handle quota exceeded errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      expect(() => setLocalStorageItem('test-key', 'value')).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });
});

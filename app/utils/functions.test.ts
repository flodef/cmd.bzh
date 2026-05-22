import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPhoneNumber, getBusinessStatus, formatBusinessHours } from './functions';

describe('getPhoneNumber', () => {
  it('should remove spaces from phone number', () => {
    const result = getPhoneNumber('06 18 49 92 69');
    expect(result).toBe('0618499269');
  });

  it('should remove dashes from phone number', () => {
    const result = getPhoneNumber('06-18-49-92-69');
    expect(result).toBe('0618499269');
  });

  it('should replace (+33)0 with +33', () => {
    const result = getPhoneNumber('(+33)0 6 18 49 92 69');
    expect(result).toBe('+33618499269');
  });

  it('should handle mixed separators', () => {
    const result = getPhoneNumber('06 18-49 92 69');
    expect(result).toBe('0618499269');
  });

  it('should handle already clean phone number', () => {
    const result = getPhoneNumber('0618499269');
    expect(result).toBe('0618499269');
  });
});

describe('getBusinessStatus', () => {
  it('should return a BusinessStatus object', () => {
    const status = getBusinessStatus();
    expect(status).toHaveProperty('isOpen');
    expect(status).toHaveProperty('message');
    expect(typeof status.isOpen).toBe('boolean');
    expect(typeof status.message).toBe('string');
  });

  it('should return message as one of the expected values', () => {
    const status = getBusinessStatus();
    const validMessages = ['Open', 'Closed', 'OpenSoon', 'CloseSoon'];
    expect(validMessages).toContain(status.message);
  });
});

describe('formatBusinessHours', () => {
  it('should return "Everyday" for 7 days', () => {
    const result = formatBusinessHours();
    expect(result).toContain('Everyday');
  });

  it('should format hours correctly', () => {
    const result = formatBusinessHours();
    expect(result).toContain('9:00');
    expect(result).toContain('18:00');
  });
});

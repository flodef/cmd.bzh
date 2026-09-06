import { describe, it, expect } from 'vitest';
import { getAddressComponents } from './constants';

describe('getAddressComponents', () => {
  it('should parse address with standard format', () => {
    const address = "11 rue de l'église, 29550 Saint-Nic, France";
    const result = getAddressComponents(address);

    expect(result.streetAddress).toBe("11 rue de l'église");
    expect(result.postalCode).toBe('29550');
    expect(result.addressLocality).toBe('Saint-Nic');
    expect(result.addressCountry).toBe('FR');
  });

  it('should handle address with different spacing', () => {
    const address = "11 rue de l'église,  29550 Saint-Nic,  France";
    const result = getAddressComponents(address);

    expect(result.streetAddress).toBe("11 rue de l'église");
    expect(result.postalCode).toBe('29550');
    expect(result.addressLocality).toBe('Saint-Nic');
    expect(result.addressCountry).toBe('FR');
  });

  it('should handle address with multi-word city', () => {
    const address = '123 Main Street, 75001 Paris, France';
    const result = getAddressComponents(address);

    expect(result.streetAddress).toBe('123 Main Street');
    expect(result.postalCode).toBe('75001');
    expect(result.addressLocality).toBe('Paris');
    expect(result.addressCountry).toBe('FR');
  });

  it('should uppercase country code', () => {
    const address = "11 rue de l'église, 29550 Saint-Nic, france";
    const result = getAddressComponents(address);

    expect(result.addressCountry).toBe('FR');
  });

  it('should handle missing parts gracefully', () => {
    const address = "11 rue de l'église";
    const result = getAddressComponents(address);

    expect(result.streetAddress).toBe("11 rue de l'église");
    expect(result.postalCode).toBe('');
    expect(result.addressLocality).toBe('');
    expect(result.addressCountry).toBe('');
  });

  it('should handle country with more than 2 characters', () => {
    const address = "11 rue de l'église, 29550 Saint-Nic, United States";
    const result = getAddressComponents(address);

    expect(result.addressCountry).toBe('UN');
  });

  it('should handle empty string', () => {
    const address = '';
    const result = getAddressComponents(address);

    expect(result.streetAddress).toBe('');
    expect(result.postalCode).toBe('');
    expect(result.addressLocality).toBe('');
    expect(result.addressCountry).toBe('');
  });
});

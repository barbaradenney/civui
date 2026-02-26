import { describe, it, expect, beforeEach } from 'vitest';
import { generateId, resetIdCounter } from './id-generator.js';

describe('generateId', () => {
  beforeEach(() => { resetIdCounter(); });

  it('generates sequential IDs with default prefix', () => {
    expect(generateId()).toBe('civ-1');
    expect(generateId()).toBe('civ-2');
    expect(generateId()).toBe('civ-3');
  });

  it('uses custom prefix', () => {
    expect(generateId('hint')).toBe('hint-1');
    expect(generateId('error')).toBe('error-2');
  });

  it('generates unique IDs across calls', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });

  it('resetIdCounter restarts sequence', () => {
    generateId();
    generateId();
    resetIdCounter();
    expect(generateId()).toBe('civ-1');
  });
});

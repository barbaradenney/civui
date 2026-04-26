import { describe, it, expect, beforeEach } from 'vitest';
import { generateId, resetIdCounter } from './id-generator.js';

describe('generateId', () => {
  beforeEach(() => { resetIdCounter(); });

  it('generates sequential IDs with default prefix', () => {
    const id1 = generateId();
    const id2 = generateId();
    const id3 = generateId();
    expect(id1).toMatch(/^civ-\w+-1$/);
    expect(id2).toMatch(/^civ-\w+-2$/);
    expect(id3).toMatch(/^civ-\w+-3$/);
  });

  it('uses custom prefix', () => {
    const id1 = generateId('hint');
    const id2 = generateId('error');
    expect(id1).toMatch(/^hint-\w+-1$/);
    expect(id2).toMatch(/^error-\w+-2$/);
  });

  it('generates unique IDs across calls', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });

  it('resetIdCounter restarts sequence', () => {
    generateId();
    generateId();
    resetIdCounter();
    const id = generateId();
    expect(id).toMatch(/^civ-\w+-1$/);
  });

  it('includes instance suffix for collision prevention', () => {
    const id = generateId();
    // Format: prefix-instanceId-counter
    const parts = id.split('-');
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('civ');
    expect(parts[1].length).toBeGreaterThanOrEqual(2);
    expect(Number(parts[2])).toBe(1);
  });
});

import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate.js';

describe('interpolate', () => {
  it('replaces single placeholder', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple placeholders', () => {
    expect(interpolate('{a} and {b}', { a: 'X', b: 'Y' })).toBe('X and Y');
  });

  it('replaces same placeholder multiple times', () => {
    expect(interpolate('{x} + {x}', { x: '1' })).toBe('1 + 1');
  });

  it('replaces missing keys with empty string', () => {
    expect(interpolate('Hello {name}', {})).toBe('Hello ');
  });

  it('handles numeric values', () => {
    expect(interpolate('{count} items', { count: 5 })).toBe('5 items');
  });

  it('returns template unchanged when no placeholders', () => {
    expect(interpolate('no placeholders', { key: 'val' })).toBe('no placeholders');
  });

  it('returns empty string for empty template', () => {
    expect(interpolate('', { key: 'val' })).toBe('');
  });
});

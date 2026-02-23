import { describe, it, expect } from 'vitest';
import { resolveGroupNavIndex } from './keyboard-handler.js';

describe('resolveGroupNavIndex', () => {
  const length = 5;

  it('ArrowRight advances to next index', () => {
    expect(resolveGroupNavIndex('ArrowRight', 0, length)).toBe(1);
    expect(resolveGroupNavIndex('ArrowRight', 3, length)).toBe(4);
  });

  it('ArrowRight wraps from last to first', () => {
    expect(resolveGroupNavIndex('ArrowRight', 4, length)).toBe(0);
  });

  it('ArrowDown advances to next index', () => {
    expect(resolveGroupNavIndex('ArrowDown', 2, length)).toBe(3);
  });

  it('ArrowDown wraps from last to first', () => {
    expect(resolveGroupNavIndex('ArrowDown', 4, length)).toBe(0);
  });

  it('ArrowLeft goes to previous index', () => {
    expect(resolveGroupNavIndex('ArrowLeft', 3, length)).toBe(2);
    expect(resolveGroupNavIndex('ArrowLeft', 1, length)).toBe(0);
  });

  it('ArrowLeft wraps from first to last', () => {
    expect(resolveGroupNavIndex('ArrowLeft', 0, length)).toBe(4);
  });

  it('ArrowUp goes to previous index', () => {
    expect(resolveGroupNavIndex('ArrowUp', 2, length)).toBe(1);
  });

  it('ArrowUp wraps from first to last', () => {
    expect(resolveGroupNavIndex('ArrowUp', 0, length)).toBe(4);
  });

  it('Home returns 0', () => {
    expect(resolveGroupNavIndex('Home', 3, length)).toBe(0);
  });

  it('End returns last index', () => {
    expect(resolveGroupNavIndex('End', 1, length)).toBe(4);
  });

  it('returns undefined for unrecognized keys', () => {
    expect(resolveGroupNavIndex('Enter', 0, length)).toBeUndefined();
    expect(resolveGroupNavIndex('Tab', 0, length)).toBeUndefined();
    expect(resolveGroupNavIndex('a', 0, length)).toBeUndefined();
  });

  it('handles single-element group', () => {
    expect(resolveGroupNavIndex('ArrowRight', 0, 1)).toBe(0);
    expect(resolveGroupNavIndex('ArrowLeft', 0, 1)).toBe(0);
    expect(resolveGroupNavIndex('Home', 0, 1)).toBe(0);
    expect(resolveGroupNavIndex('End', 0, 1)).toBe(0);
  });
});

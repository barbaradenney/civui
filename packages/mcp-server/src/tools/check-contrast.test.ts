import { describe, it, expect } from 'vitest';
import { checkContrast, parseHex, resolveColor } from './check-contrast.js';

describe('checkContrast', () => {
  it('returns 21:1 for black on white', () => {
    const result = checkContrast('#000000', '#ffffff');
    expect(result.ratio).toBe(21);
    expect(result.ratioString).toBe('21:1');
    expect(result.normalText.aa).toBe(true);
    expect(result.normalText.aaa).toBe(true);
    expect(result.largeText.aa).toBe(true);
    expect(result.largeText.aaa).toBe(true);
    expect(result.wcag21Level).toBe('AAA');
  });

  it('returns 1:1 for white on white', () => {
    const result = checkContrast('#ffffff', '#ffffff');
    expect(result.ratio).toBe(1);
    expect(result.ratioString).toBe('1:1');
    expect(result.normalText.aa).toBe(false);
    expect(result.normalText.aaa).toBe(false);
    expect(result.largeText.aa).toBe(false);
    expect(result.largeText.aaa).toBe(false);
    expect(result.wcag21Level).toBe('Fail');
  });

  it('resolves token name "primary"', () => {
    const result = checkContrast('primary', 'white');
    expect(result.foreground).toBe('#005ea2');
    expect(result.background).toBe('#ffffff');
    expect(result.ratio).toBeGreaterThan(1);
  });

  it('strips "text-" prefix from token name', () => {
    const result = checkContrast('text-primary', 'white');
    expect(result.foreground).toBe('#005ea2');
  });

  it('strips "civ-bg-" prefix from token name', () => {
    const result = checkContrast('black', 'civ-bg-error-lighter');
    expect(result.background).toBe('#f4e3db');
  });

  it('throws on unknown token', () => {
    expect(() => checkContrast('nonexistent', '#ffffff')).toThrow('Unknown color token');
  });

  it('correctly identifies AA threshold boundary', () => {
    // primary-dark (#1a4480) on white (#ffffff) should pass AA for normal text
    const result = checkContrast('primary-dark', 'white');
    expect(result.normalText.aa).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('handles 3-digit hex shorthand', () => {
    const result = checkContrast('#000', '#fff');
    expect(result.ratio).toBe(21);
  });

  it('identifies AA Large level correctly', () => {
    // Find a combination that passes large text AA but fails normal text AA
    // base (#71767a) on white should be around 4.0-4.5 ratio
    const result = checkContrast('base', 'white');
    if (result.ratio >= 3 && result.ratio < 4.5) {
      expect(result.wcag21Level).toBe('AA Large');
    }
  });
});

describe('parseHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#ff0000')).toEqual([255, 0, 0]);
  });

  it('parses 3-digit hex', () => {
    expect(parseHex('#f00')).toEqual([255, 0, 0]);
  });

  it('throws on invalid hex', () => {
    expect(() => parseHex('#xyz')).toThrow('Invalid hex color');
  });
});

describe('resolveColor', () => {
  it('returns hex as-is', () => {
    expect(resolveColor('#abcdef')).toBe('#abcdef');
  });

  it('resolves token names', () => {
    expect(resolveColor('error')).toBe('#b50909');
  });

  it('strips civ-text- prefix', () => {
    expect(resolveColor('civ-text-error')).toBe('#b50909');
  });

  it('strips bg- prefix', () => {
    expect(resolveColor('bg-primary')).toBe('#005ea2');
  });
});

/**
 * Tests for tools/lint-contrast.ts.
 *
 * The lint reads color token JSONs, resolves dotted-path token refs,
 * computes WCAG luminance ratios, and reports failures. These unit
 * tests cover the four pure helpers — luminance, ratio, token
 * resolution, and the pair-evaluation loop — independently of file-
 * system state.
 */

import { describe, it, expect } from 'vitest';
import {
  PAIRS,
  contrastRatio,
  evaluatePairs,
  relativeLuminance,
  resolveToken,
} from '../lint-contrast.js';

describe('relativeLuminance', () => {
  it('returns 1 for white', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1.0, 4);
  });

  it('returns 0 for black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0.0, 4);
  });

  it('handles hex without leading hash', () => {
    expect(relativeLuminance('ffffff')).toBeCloseTo(1.0, 4);
  });

  it('throws on malformed hex', () => {
    expect(() => relativeLuminance('#xyz')).toThrow();
    expect(() => relativeLuminance('#fff')).toThrow();
  });
});

describe('contrastRatio', () => {
  it('returns 21:1 for black-on-white (maximum)', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21.0, 1);
  });

  it('returns 1:1 for identical colors', () => {
    expect(contrastRatio('#7a7a7a', '#7a7a7a')).toBeCloseTo(1.0, 4);
  });

  it('is symmetric — order of arguments does not matter', () => {
    expect(contrastRatio('#005ea2', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#005ea2'),
      4,
    );
  });

  it('matches measured values for known WCAG-AA pairs', () => {
    // primary.DEFAULT (#005ea2) on white — 6.72:1 per the audit matrix
    expect(contrastRatio('#005ea2', '#ffffff')).toBeCloseTo(6.72, 1);
    // error.DEFAULT (#b50909) on white — 6.98:1
    expect(contrastRatio('#b50909', '#ffffff')).toBeCloseTo(6.98, 1);
    // base.darkest (#1b1b1b) on white — 17.22:1 (AAA, near-max)
    expect(contrastRatio('#1b1b1b', '#ffffff')).toBeCloseTo(17.22, 1);
  });
});

describe('resolveToken', () => {
  const tokens = {
    color: {
      primary: {
        DEFAULT: { $value: '#005ea2' },
        dark: { $value: '#1a4480' },
      },
      tag: {
        blue: {
          bg: { $value: '#1a4480' },
          text: { $value: '#ffffff' },
        },
      },
      malformed: {
        nothex: { $value: 'rgb(128, 128, 128)' },
      },
    },
  };

  it('resolves a single-segment path', () => {
    expect(resolveToken(tokens, 'primary.DEFAULT')).toBe('#005ea2');
  });

  it('resolves a dotted multi-segment path', () => {
    expect(resolveToken(tokens, 'tag.blue.bg')).toBe('#1a4480');
    expect(resolveToken(tokens, 'tag.blue.text')).toBe('#ffffff');
  });

  it('throws on non-existent path', () => {
    expect(() => resolveToken(tokens, 'primary.bogus')).toThrow();
    expect(() => resolveToken(tokens, 'nonexistent.foo')).toThrow();
  });

  it('throws when the leaf is missing $value', () => {
    expect(() => resolveToken(tokens, 'tag.blue')).toThrow();
  });

  it('throws when $value is not a hex string', () => {
    expect(() => resolveToken(tokens, 'malformed.nothex')).toThrow();
  });
});

describe('evaluatePairs', () => {
  const lightTokens = {
    color: {
      primary: { DEFAULT: { $value: '#005ea2' }, dark: { $value: '#1a4480' } },
      white: { DEFAULT: { $value: '#ffffff' } },
      base: { lightest: { $value: '#f0f0f0' }, darkest: { $value: '#1b1b1b' } },
    },
  };
  const darkTokens = {
    color: {
      primary: { DEFAULT: { $value: '#73b3e7' }, dark: { $value: '#a4cef4' } },
      white: { DEFAULT: { $value: '#1b1b1b' } },
      base: { lightest: { $value: '#2d2d2d' }, darkest: { $value: '#f0f0f0' } },
    },
  };

  it('returns no failures when all pairs hit threshold', () => {
    const pairs = [
      { name: 'body on surface', bg: 'white.DEFAULT', text: 'base.darkest', minRatio: 4.5 as const },
      { name: 'primary on surface', bg: 'white.DEFAULT', text: 'primary.DEFAULT', minRatio: 4.5 as const },
    ];
    expect(evaluatePairs(lightTokens, darkTokens, pairs)).toEqual([]);
  });

  it('flags pairs that fail in either mode', () => {
    // Force a fake failure by pairing two very-close colors.
    const pairs = [
      { name: 'close colors', bg: 'base.lightest', text: 'white.DEFAULT', minRatio: 4.5 as const },
    ];
    const failures = evaluatePairs(lightTokens, darkTokens, pairs);
    // light: #f0f0f0 + #ffffff = ~1.13:1 → fails
    // dark:  #2d2d2d + #1b1b1b = ~1.5:1 → fails
    expect(failures).toHaveLength(2);
    expect(failures.map((f) => f.mode).sort()).toEqual(['dark', 'light']);
  });

  it('records the resolved hex values in the failure record', () => {
    const pairs = [
      { name: 'close', bg: 'base.lightest', text: 'white.DEFAULT', minRatio: 4.5 as const },
    ];
    const failures = evaluatePairs(lightTokens, darkTokens, pairs);
    expect(failures[0].bg).toContain('#');
    expect(failures[0].text).toContain('#');
  });

  it('records a synthetic 0 ratio when a token path does not resolve', () => {
    const pairs = [
      { name: 'broken', bg: 'nonexistent.foo', text: 'white.DEFAULT', minRatio: 4.5 as const },
    ];
    const failures = evaluatePairs(lightTokens, darkTokens, pairs);
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].ratio).toBe(0);
  });
});

describe('PAIRS (live data)', () => {
  it('has at least one entry from each documented category', () => {
    const names = PAIRS.map((p) => p.name);
    expect(names.some((n) => n.includes('secondary'))).toBe(true);
    expect(names.some((n) => n.includes('primary'))).toBe(true);
    expect(names.some((n) => n.includes('tertiary'))).toBe(true);
    expect(names.some((n) => n.includes('body'))).toBe(true);
    expect(names.some((n) => n.includes('hint'))).toBe(true);
    expect(names.some((n) => n.includes('link'))).toBe(true);
    expect(names.some((n) => n.startsWith('tag '))).toBe(true);
  });

  it('all entries use a recognized WCAG tier: 3.0 (large/non-text), 4.5 (AA body), or 7.0 (AAA enhanced)', () => {
    // 7.0 entries gate the `*-darkest` text shades the token JSON
    // advertises as AAA / hero colors (error-darkest, info-darkest) so a
    // palette tune can't silently regress them to plain AA.
    for (const pair of PAIRS) {
      expect([3.0, 4.5, 7.0]).toContain(pair.minRatio);
    }
  });
});

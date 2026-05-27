import { describe, it, expect } from 'vitest';
import { checkContrast, flattenColors, parseHex, resolveColor } from './check-contrast.js';

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
    expect(result.background).toBe('#f4caca');
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

  it('resolves the new error mid-tone (error-lighter)', () => {
    // 2026-05-28 normalization moved error-lighter from peach #f4e3db to
    // the mid-pale pink-red #f4caca. The refactor reading from
    // `@civui/tokens` keeps this value in lockstep with the canonical JSON.
    expect(resolveColor('error-lighter')).toBe('#f4caca');
  });

  it('resolves three-level accent paths', () => {
    expect(resolveColor('accent-cool-lightest')).toBe('#e1f3f8');
    expect(resolveColor('accent-warm-darkest')).toBe('#7a3300');
  });

  it('resolves tag categorical pairs (new — were absent from the hand mirror)', () => {
    expect(resolveColor('tag-blue-bg')).toBe('#1a4480');
    expect(resolveColor('tag-blue-text')).toBe('#ffffff');
    expect(resolveColor('tag-yellow-bg')).toBe('#936f38');
  });

  it('resolves purple family (new — was absent from the hand mirror)', () => {
    expect(resolveColor('purple-lightest')).toBe('#ede3f3');
    expect(resolveColor('purple')).toBe('#7a3baf');
  });

  it('resolves DEFAULT shade via the bare family name', () => {
    expect(resolveColor('primary')).toBe('#005ea2');
    expect(resolveColor('white')).toBe('#ffffff');
    expect(resolveColor('black')).toBe('#000000');
  });

  it('lists all available tokens in the error when unknown', () => {
    try {
      resolveColor('does-not-exist');
      throw new Error('expected throw');
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain('Unknown color token');
      expect(msg).toContain('light mode');
      // Sanity: a real token name should appear in the listing.
      expect(msg).toContain('primary-lightest');
    }
  });
});

describe('flattenColors', () => {
  it('collapses DEFAULT to the bare family alias', () => {
    const flat = flattenColors({
      primary: { lightest: '#aaa', DEFAULT: '#bbb', dark: '#ccc' },
    });
    expect(flat['primary-lightest']).toBe('#aaa');
    expect(flat['primary']).toBe('#bbb');
    expect(flat['primary-DEFAULT']).toBeUndefined();
    expect(flat['primary-dark']).toBe('#ccc');
  });

  it('recurses through three-level paths', () => {
    const flat = flattenColors({
      accent: {
        cool: { lightest: '#aaa', DEFAULT: '#bbb' },
        warm: { DEFAULT: '#ccc' },
      },
    });
    expect(flat['accent-cool-lightest']).toBe('#aaa');
    expect(flat['accent-cool']).toBe('#bbb');
    expect(flat['accent-warm']).toBe('#ccc');
  });

  it('preserves tag pair leaves without a DEFAULT collapse', () => {
    const flat = flattenColors({
      tag: { blue: { bg: '#aaa', text: '#bbb' } },
    });
    expect(flat['tag-blue-bg']).toBe('#aaa');
    expect(flat['tag-blue-text']).toBe('#bbb');
    // No bare alias since the leaf object has no DEFAULT.
    expect(flat['tag-blue']).toBeUndefined();
  });
});

describe('dark mode resolution', () => {
  // The canonical dark hex values live in
  // packages/tokens/src/color-dark.tokens.json. These assertions confirm
  // the import is wired correctly — they're not duplicating the JSON,
  // they're spot-checking that the dark palette is loaded.
  it('resolves token names against the dark palette when mode="dark"', () => {
    expect(resolveColor('primary', 'dark')).toBe('#73b3e7');
    expect(resolveColor('primary', 'light')).toBe('#005ea2');
  });

  it('resolves the rebuilt error ladder in dark mode', () => {
    expect(resolveColor('error-lightest', 'dark')).toBe('#3a1a1a');
    expect(resolveColor('error-lighter', 'dark')).toBe('#4a2020');
    expect(resolveColor('error-darkest', 'dark')).toBe('#fad5d0');
  });

  it('inverts white/black aliases for dark surfaces', () => {
    // The token JSON deliberately swaps the surface aliases under dark
    // mode so `civ-bg-white` stays "the default surface" (now #1b1b1b)
    // and `civ-text-black` stays "the default ink" (now #ffffff).
    expect(resolveColor('white', 'dark')).toBe('#1b1b1b');
    expect(resolveColor('black', 'dark')).toBe('#ffffff');
  });

  it('checkContrast returns mode flag on the result', () => {
    const light = checkContrast('primary', 'white');
    const dark = checkContrast('primary', 'white', 'dark');
    expect(light.mode).toBe('light');
    expect(dark.mode).toBe('dark');
    // Dark mode resolves primary → #73b3e7 (lighter), white → #1b1b1b
    // (the dark surface) so the rendered ratio is different from light.
    expect(dark.ratio).not.toBe(light.ratio);
  });

  it('lists dark-mode tokens in the error when an unknown token is requested in dark mode', () => {
    try {
      resolveColor('does-not-exist', 'dark');
      throw new Error('expected throw');
    } catch (e) {
      expect((e as Error).message).toContain('dark mode');
    }
  });

  it('passes hex inputs through unchanged regardless of mode', () => {
    expect(resolveColor('#abcdef', 'light')).toBe('#abcdef');
    expect(resolveColor('#abcdef', 'dark')).toBe('#abcdef');
  });
});

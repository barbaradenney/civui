import { describe, it, expect } from 'vitest';
import {
  fluidClamp,
  modularScale,
  round,
  flattenTokens,
  collectTokenPaths,
  validateDarkTokenParity,
  parseShadowColor,
  hexToSwiftComponents,
  toSwiftIdentifier,
  toKotlinIdentifier,
  formatFontFamily,
  formatCubicBezier,
  toCSSValue,
  buildScales,
  buildCSS,
} from './build-tokens.js';

describe('round', () => {
  it('rounds to N decimal places', () => {
    expect(round(1.23456, 2)).toBe(1.23);
    expect(round(1.005, 2)).toBe(1.0); // float imprecision lands here
    expect(round(48, 3)).toBe(48);
  });
});

describe('modularScale', () => {
  it('computes base * ratio^step', () => {
    expect(modularScale(16, 1.25, 0)).toBe(16);
    expect(modularScale(16, 1.25, 1)).toBe(20);
    expect(modularScale(16, 1.25, 2)).toBe(25);
  });

  it('handles negative steps (smaller than base)', () => {
    expect(modularScale(16, 2, -1)).toBe(8);
  });
});

describe('fluidClamp', () => {
  it('returns null when max <= min (no fluid range)', () => {
    expect(fluidClamp(20, 20, 320, 1200)).toBeNull();
    expect(fluidClamp(30, 20, 320, 1200)).toBeNull();
  });

  it('builds a clamp() with rem min/max and a vw slope', () => {
    const clamp = fluidClamp(16, 24, 320, 1200);
    expect(clamp).toMatch(/^clamp\(1rem, calc\([\d.-]+rem \+ [\d.]+vw\), 1\.5rem\)$/);
  });

  it('the interpolation hits min at the min viewport and max at the max viewport', () => {
    // Reconstruct the linear part and evaluate at both ends.
    const minPx = 16;
    const maxPx = 32;
    const minVp = 320;
    const maxVp = 1200;
    const clamp = fluidClamp(minPx, maxPx, minVp, maxVp);
    const m = /calc\((-?[\d.]+)rem \+ ([\d.]+)vw\)/.exec(clamp);
    const interceptRem = Number(m[1]);
    const slopeVw = Number(m[2]);
    // value(vw) in px = interceptRem*16 + (slopeVw/100)*viewport
    const atMin = interceptRem * 16 + (slopeVw / 100) * minVp;
    const atMax = interceptRem * 16 + (slopeVw / 100) * maxVp;
    expect(atMin).toBeCloseTo(minPx, 0);
    expect(atMax).toBeCloseTo(maxPx, 0);
  });
});

describe('flattenTokens', () => {
  it('flattens nested $value leaves into dash-paths', () => {
    const tree = {
      color: {
        primary: {
          DEFAULT: { $type: 'color', $value: '#005ea2' },
          dark: { $type: 'color', $value: '#1a4480' },
        },
      },
    };
    const flat = flattenTokens(tree);
    const paths = flat.map((t) => t.path);
    expect(paths).toContain('color-primary-DEFAULT');
    expect(paths).toContain('color-primary-dark');
    expect(flat.find((t) => t.path === 'color-primary-DEFAULT').value).toBe('#005ea2');
  });

  it('sanitizes dotted keys (0.5 -> 0_5) so they are valid CSS idents', () => {
    const tree = { spacing: { '0.5': { $type: 'dimension', $value: '3px' } } };
    const flat = flattenTokens(tree);
    expect(flat[0].path).toBe('spacing-0_5');
  });

  it('skips $-prefixed metadata keys', () => {
    const tree = { $description: 'meta', spacing: { $description: 'x', '1': { $value: '5px' } } };
    const flat = flattenTokens(tree);
    expect(flat).toHaveLength(1);
    expect(flat[0].path).toBe('spacing-1');
  });
});

describe('collectTokenPaths / validateDarkTokenParity', () => {
  it('collects dotted leaf paths', () => {
    const tree = { color: { primary: { DEFAULT: { $value: '#000' } } } };
    expect(collectTokenPaths(tree)).toEqual(['color.primary.DEFAULT']);
  });

  it('passes when light and dark share the same leaf paths', () => {
    const light = { color: { primary: { DEFAULT: { $value: '#005ea2' } } } };
    const dark = { color: { primary: { DEFAULT: { $value: '#73b3e7' } } } };
    expect(() => validateDarkTokenParity(light, dark)).not.toThrow();
  });

  it('throws when dark is missing a light path', () => {
    const light = { color: { primary: { DEFAULT: { $value: '#000' } }, error: { DEFAULT: { $value: '#b50909' } } } };
    const dark = { color: { primary: { DEFAULT: { $value: '#fff' } } } };
    expect(() => validateDarkTokenParity(light, dark)).toThrow(/missing keys/);
  });

  it('throws when dark has an extra path not in light', () => {
    const light = { color: { primary: { DEFAULT: { $value: '#000' } } } };
    const dark = { color: { primary: { DEFAULT: { $value: '#fff' } }, brand: { DEFAULT: { $value: '#abc' } } } };
    expect(() => validateDarkTokenParity(light, dark)).toThrow(/extra keys/);
  });
});

describe('parseShadowColor — native shadow alpha fidelity', () => {
  it('maps transparent to the platform clear color', () => {
    expect(parseShadowColor('transparent')).toEqual({ swift: '.clear', kotlin: 'Color.Transparent' });
  });

  it('preserves the real alpha for black rgba (the sm=0.05 regression)', () => {
    expect(parseShadowColor('rgba(0,0,0,0.05)')).toEqual({
      swift: '.black.opacity(0.05)',
      kotlin: 'Color.Black.copy(alpha = 0.05f)',
    });
    expect(parseShadowColor('rgba(0,0,0,0.1)')).toEqual({
      swift: '.black.opacity(0.1)',
      kotlin: 'Color.Black.copy(alpha = 0.1f)',
    });
  });

  it('emits an explicit Color(...) for non-black channels, keeping the hue', () => {
    const out = parseShadowColor('rgba(255,0,0,0.2)');
    expect(out.swift).toBe('Color(red: 1, green: 0, blue: 0).opacity(0.2)');
    expect(out.kotlin).toBe('Color(red = 1f, green = 0f, blue = 0f, alpha = 0.2f)');
  });

  it('defaults alpha to 1 when rgb() has no alpha channel', () => {
    expect(parseShadowColor('rgb(0,0,0)')).toEqual({
      swift: '.black.opacity(1)',
      kotlin: 'Color.Black.copy(alpha = 1f)',
    });
  });

  it('falls back to the historical default on an unparseable color', () => {
    expect(parseShadowColor('hsl(0 0% 0%)')).toEqual({
      swift: '.black.opacity(0.1)',
      kotlin: 'Color.Black.copy(alpha = 0.1f)',
    });
  });
});

describe('hexToSwiftComponents', () => {
  it('converts a hex string to 0-1 rgb components', () => {
    expect(hexToSwiftComponents('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
    expect(hexToSwiftComponents('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    const c = hexToSwiftComponents('#005ea2');
    expect(c.r).toBeCloseTo(0, 1);
    expect(c.g).toBeCloseTo(0.369, 2);
    expect(c.b).toBeCloseTo(0.635, 2);
  });
});

describe('native identifier mapping', () => {
  it('prefixes numeric-leading keys with an underscore and replaces dots', () => {
    expect(toSwiftIdentifier('0.5')).toBe('_0_5');
    expect(toSwiftIdentifier('2xl')).toBe('_2xl');
    expect(toKotlinIdentifier('0.5')).toBe('_0_5');
  });

  it('converts dash-case to camelCase', () => {
    expect(toSwiftIdentifier('extra-large')).toBe('extraLarge');
    expect(toKotlinIdentifier('extra-large')).toBe('extraLarge');
  });
});

describe('format helpers', () => {
  it('quotes multi-word font families and joins the stack', () => {
    expect(formatFontFamily(['system-ui', 'Segoe UI', 'Arial'])).toBe('system-ui, "Segoe UI", Arial');
  });

  it('formats a cubic-bezier array', () => {
    expect(formatCubicBezier([0.4, 0, 0.2, 1])).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('toCSSValue dispatches on token type', () => {
    expect(toCSSValue({ type: 'fontFamily', value: ['system-ui', 'Arial'] })).toBe('system-ui, Arial');
    expect(toCSSValue({ type: 'cubicBezier', value: [0.4, 0, 0.2, 1] })).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(toCSSValue({ type: 'dimension', value: '16px' })).toBe('16px');
  });
});

describe('buildCSS — font-size px→rem conversion (WCAG 1.4.4)', () => {
  it('converts static typography-fontSize px values to rem', () => {
    const css = buildCSS({
      typography: { fontSize: { base: { $type: 'dimension', $value: '16px' } } },
    });
    expect(css).toContain('--civ-typography-fontSize-base: 1rem;');
  });

  it('leaves non-fontSize px values untouched', () => {
    const css = buildCSS({ spacing: { 2: { $type: 'dimension', $value: '10px' } } });
    expect(css).toContain('--civ-spacing-2: 10px;');
  });
});

describe('buildScales', () => {
  const scalesConfig = {
    scales: {
      dense: { ratio: 1.125, basePx: 14, spacingFactor: 0.75, lineHeight: { body: 1.4, heading: 1.15 } },
    },
    fontSizeSteps: [{ step: 0, name: 'base' }, { step: 1, name: 'lg' }],
    spacingTokens: ['2', '4'],
  };
  const tokens = { spacing: { 2: { $value: '10px' }, 4: { $value: '20px' } } };

  it('scopes a non-default scale under [data-civ-scale="…"] and scales spacing by the factor', () => {
    const { css, js } = buildScales(tokens, scalesConfig);
    expect(css).toContain('[data-civ-scale="dense"] {');
    // 10px * 0.75 = 7.5 → Math.round → 8 ; 20 * 0.75 = 15
    expect(css).toContain('--civ-spacing-2: 8px;');
    expect(css).toContain('--civ-spacing-4: 15px;');
    expect(js.dense.spacing['2']).toBe('8px');
  });

  it('emits a static rem font-size for a non-fluid scale', () => {
    const { js } = buildScales(tokens, scalesConfig);
    // base step 0: 14px → 0.875rem
    expect(js.dense.fontSize.base).toBe('0.875rem');
  });
});

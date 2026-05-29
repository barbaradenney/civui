/**
 * Tests for tools/lint-dark-recipe-contrast.ts — the dark-mode
 * contrast gate derived from the semantic RECIPE.
 */
import { describe, it, expect } from 'vitest';
import {
  tokenNameToDotted,
  derivePairs,
  evaluateDarkRecipe,
  type DerivedPair,
} from '../lint-dark-recipe-contrast.js';

describe('tokenNameToDotted', () => {
  it('converts a family-shade token name to a dotted path', () => {
    expect(tokenNameToDotted('--civ-color-info-lightest')).toBe('info.lightest');
    expect(tokenNameToDotted('--civ-color-base-darker')).toBe('base.darker');
    expect(tokenNameToDotted('--civ-color-white-DEFAULT')).toBe('white.DEFAULT');
    expect(tokenNameToDotted('--civ-color-error-DEFAULT')).toBe('error.DEFAULT');
  });

  it('only splits the first hyphen (shade names keep theirs)', () => {
    // there are no two-hyphen shades in RECIPE today, but the helper
    // must not over-split if one is added.
    expect(tokenNameToDotted('--civ-color-accent-cool')).toBe('accent.cool');
  });
});

describe('derivePairs', () => {
  it('extracts only the self-contained (bg AND text) pairs from RECIPE', () => {
    const pairs = derivePairs();
    // secondary (5 intents) + primary (5 intents) = 10. dot has no
    // text, tertiary has no bg → both excluded.
    expect(pairs).toHaveLength(10);
    const labels = pairs.map((p) => p.label).sort();
    expect(labels).toContain('secondary.error');
    expect(labels).toContain('primary.success');
    expect(labels.every((l) => l.startsWith('secondary.') || l.startsWith('primary.'))).toBe(true);
  });

  it('resolves token names to dotted paths', () => {
    const errSecondary = derivePairs().find((p) => p.label === 'secondary.error');
    expect(errSecondary).toEqual({
      label: 'secondary.error',
      bg: 'error.lightest',
      text: 'error.dark',
    });
  });
});

describe('evaluateDarkRecipe', () => {
  it('reports a contrast finding when a pair fails AA in dark mode', () => {
    const tokens = {
      color: { foo: { a: { $value: '#000000' }, b: { $value: '#000000' } } },
    };
    // bg===text → 1.0:1. This pair is also absent from PAIRS, so we
    // expect both a contrast and a coverage finding.
    const pairs: DerivedPair[] = [{ label: 'x', bg: 'foo.a', text: 'foo.b' }];
    const findings = evaluateDarkRecipe(tokens, pairs);
    const kinds = findings.map((f) => f.kind).sort();
    expect(kinds).toEqual(['contrast', 'coverage']);
  });

  it('passes a high-contrast pair that IS covered by PAIRS', () => {
    // error secondary: error.lightest bg + error.dark text — a real
    // RECIPE pair present in lint-contrast PAIRS. Use a synthetic dark
    // tree with a high-contrast combination so only coverage is tested.
    const tokens = {
      color: { error: { lightest: { $value: '#ffffff' }, dark: { $value: '#000000' } } },
    };
    const pairs: DerivedPair[] = [
      { label: 'secondary.error', bg: 'error.lightest', text: 'error.dark' },
    ];
    expect(evaluateDarkRecipe(tokens, pairs)).toHaveLength(0);
  });

  it('reports a coverage finding for a high-contrast pair NOT in PAIRS', () => {
    const tokens = {
      color: { foo: { a: { $value: '#ffffff' }, b: { $value: '#000000' } } },
    };
    const pairs: DerivedPair[] = [{ label: 'x', bg: 'foo.a', text: 'foo.b' }];
    const findings = evaluateDarkRecipe(tokens, pairs);
    expect(findings).toHaveLength(1);
    expect(findings[0].kind).toBe('coverage');
  });

  it('surfaces a token-resolution failure as a contrast finding', () => {
    const tokens = { color: {} };
    const pairs: DerivedPair[] = [{ label: 'x', bg: 'nope.a', text: 'nope.b' }];
    const findings = evaluateDarkRecipe(tokens, pairs);
    expect(findings.some((f) => f.kind === 'contrast')).toBe(true);
  });
});

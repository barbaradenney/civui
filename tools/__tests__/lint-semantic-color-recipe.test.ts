/**
 * Tests for tools/lint-semantic-color-recipe.ts.
 *
 * Covers the two pure helpers:
 *   - classifySelector: parses recipe-shaped selectors and rejects others
 *   - extractVar: pulls a single `var(--…)` value from a rule body
 *
 * Plus a sanity-check that the RECIPE table is internally complete for
 * the components that ship today (badge and count).
 */

import { describe, it, expect } from 'vitest';
import {
  classifySelector,
  extractVar,
  RECIPE,
} from '../lint-semantic-color-recipe.js';

describe('classifySelector', () => {
  it('matches badge secondary intents', () => {
    expect(classifySelector('.civ-badge--style-secondary.civ-badge--info')).toEqual({
      component: 'badge',
      emphasis: 'secondary',
      intent: 'info',
    });
    expect(classifySelector('.civ-badge--style-secondary.civ-badge--error')).toEqual({
      component: 'badge',
      emphasis: 'secondary',
      intent: 'error',
    });
  });

  it('matches count primary intents', () => {
    expect(classifySelector('.civ-count--style-primary.civ-count--success')).toEqual({
      component: 'count',
      emphasis: 'primary',
      intent: 'success',
    });
  });

  it('matches badge dot intents', () => {
    expect(classifySelector('.civ-badge--dot.civ-badge--warning')).toEqual({
      component: 'badge',
      emphasis: 'dot',
      intent: 'warning',
    });
  });

  it('matches count tertiary intents', () => {
    expect(classifySelector('.civ-count--style-tertiary.civ-count--neutral')).toEqual({
      component: 'count',
      emphasis: 'tertiary',
      intent: 'neutral',
    });
  });

  it('rejects emphasis variants that are not supported on the component', () => {
    // badge has no tertiary; count has no dot.
    expect(classifySelector('.civ-badge--style-tertiary.civ-badge--info')).toBeNull();
    expect(classifySelector('.civ-count--dot.civ-count--info')).toBeNull();
  });

  it('rejects selectors with mismatched component halves', () => {
    expect(classifySelector('.civ-badge--style-secondary.civ-count--info')).toBeNull();
  });

  it('rejects unrelated selectors', () => {
    expect(classifySelector('.civ-badge')).toBeNull();
    expect(classifySelector('.civ-badge--sm')).toBeNull();
    expect(classifySelector('.civ-badge-anchor')).toBeNull();
    expect(classifySelector('.civ-badge--style-secondary')).toBeNull();
    expect(classifySelector('.civ-tag--blue')).toBeNull();
    expect(classifySelector('.civ-card--red')).toBeNull();
  });

  it('rejects intents not in the canonical five', () => {
    expect(classifySelector('.civ-badge--style-secondary.civ-badge--blue')).toBeNull();
    expect(classifySelector('.civ-count--style-primary.civ-count--critical')).toBeNull();
  });

  it('still matches when a pseudo-class or attribute decorator is appended', () => {
    // A drift rule decorated with `:not(:disabled)` would silently
    // bypass the lint if the regex were anchored with no tail clause.
    // The lint MUST recognize the recipe-shape prefix and check the
    // decorated rule too.
    expect(classifySelector('.civ-badge--style-primary.civ-badge--info:hover')).toEqual({
      component: 'badge',
      emphasis: 'primary',
      intent: 'info',
    });
    expect(
      classifySelector('.civ-badge--style-primary.civ-badge--error:not(:disabled)'),
    ).toEqual({
      component: 'badge',
      emphasis: 'primary',
      intent: 'error',
    });
    expect(
      classifySelector('.civ-count--style-secondary.civ-count--neutral[aria-disabled="true"]'),
    ).toEqual({
      component: 'count',
      emphasis: 'secondary',
      intent: 'neutral',
    });
  });
});

describe('extractVar', () => {
  it('extracts background-color var() values', () => {
    const body = `
      background-color: var(--civ-color-info-lighter);
      color: var(--civ-color-info-dark);
    `;
    expect(extractVar(body, 'background-color')).toBe('--civ-color-info-lighter');
    expect(extractVar(body, 'color')).toBe('--civ-color-info-dark');
  });

  it('returns null when the property is absent', () => {
    expect(extractVar('background-color: red;', 'color')).toBeNull();
  });

  it('does NOT match `color` inside `background-color` (property-name anchor)', () => {
    // Regression guard: a naive `\bcolor\s*:` regex also matches the
    // substring `color:` inside `background-color:` because `\b`
    // fires at the `-` separator (hyphen is a non-word char). The
    // negative-lookbehind anchor `(?<![\w-])` rejects that.
    expect(extractVar('background-color: var(--bg);', 'color')).toBeNull();
    expect(extractVar('  background-color: var(--bg);', 'color')).toBeNull();
    // But a real `color:` declaration on the same body still resolves.
    expect(extractVar('background-color: var(--bg); color: var(--text);', 'color')).toBe('--text');
  });

  it('handles var() with a fallback value', () => {
    // var(--x, #fff) is legal CSS; the lint should extract the first
    // identifier and not bail with `<missing or non-var>`.
    expect(extractVar('background-color: var(--civ-color-info-lighter, #cfe8ff);', 'background-color'))
      .toBe('--civ-color-info-lighter');
    expect(extractVar('color: var(--civ-color-info-dark, currentColor);', 'color'))
      .toBe('--civ-color-info-dark');
  });

  it('returns null when the value is not a single var()', () => {
    // Plain hex / keyword values must not match — the lint relies on a
    // canonical `var(--…)` reference.
    expect(extractVar('background-color: #ff0000;', 'background-color')).toBeNull();
    expect(extractVar('background-color: transparent;', 'background-color')).toBeNull();
    expect(
      extractVar('background-color: var(--x), var(--y);', 'background-color'),
    ).toBeNull();
  });

  it('returns the LAST declaration when the property appears multiple times', () => {
    // CSS cascade within a rule — last wins. The lint should pick that
    // up so dead-code earlier declarations don't shadow the real value.
    const body = `
      background-color: var(--civ-color-error-lightest);
      background-color: var(--civ-color-error-lighter);
    `;
    expect(extractVar(body, 'background-color')).toBe('--civ-color-error-lighter');
  });

  it('handles whitespace variations', () => {
    expect(
      extractVar('background-color:   var(  --civ-color-info-dark  )  ;', 'background-color'),
    ).toBe('--civ-color-info-dark');
  });
});

describe('RECIPE completeness', () => {
  const intents = ['info', 'success', 'warning', 'error', 'neutral'] as const;

  it('declares every intent for secondary, primary, and dot', () => {
    for (const intent of intents) {
      expect(RECIPE.secondary[intent], `secondary.${intent}`).toBeDefined();
      expect(RECIPE.primary[intent], `primary.${intent}`).toBeDefined();
      expect(RECIPE.dot[intent], `dot.${intent}`).toBeDefined();
    }
  });

  it('declares non-neutral tertiary intents (neutral is intentionally absent)', () => {
    expect(RECIPE.tertiary.info).toBeDefined();
    expect(RECIPE.tertiary.success).toBeDefined();
    expect(RECIPE.tertiary.warning).toBeDefined();
    expect(RECIPE.tertiary.error).toBeDefined();
    // Neutral tertiary intentionally inherits `color: inherit` from the
    // host — no CSS rule, no recipe entry.
    expect(RECIPE.tertiary.neutral).toBeUndefined();
  });

  it('error primary uses error-DEFAULT (documented exception, not error-dark)', () => {
    // The single documented exception to the "primary uses *-dark"
    // pattern. If this assertion breaks, either error primary was
    // realigned (drop the exception and update the doc comment) or
    // someone shifted the recipe accidentally — investigate first.
    expect(RECIPE.primary.error?.bg).toBe('--civ-color-error-DEFAULT');
    expect(RECIPE.dot.error?.bg).toBe('--civ-color-error-DEFAULT');
  });
});

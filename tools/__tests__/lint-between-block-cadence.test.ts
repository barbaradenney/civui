/**
 * Tests for tools/lint-between-block-cadence.ts.
 *
 * The lint reads components.css, finds each Tier 2 / Tier 3 rule
 * body, and checks the `civ-mb-N` declarations. Tests cover the
 * three pure helpers — rule-body extraction (must respect the
 * `@layer components` wrapper), margin-bottom extraction (must
 * ignore comments), and the failure-recording loop — against
 * synthetic CSS fixtures so we're not coupled to the real
 * components.css contents.
 */

import { describe, it, expect } from 'vitest';
import {
  TIER_2_COMPONENTS,
  TIER_3_COMPONENTS,
  evaluate,
  findMarginBottomSteps,
  findRuleBody,
} from '../lint-between-block-cadence.js';

describe('findRuleBody', () => {
  it('finds a top-level rule by exact selector', () => {
    const css = `.civ-card { @apply civ-p-4 civ-mb-4; }`;
    const body = findRuleBody(css, '.civ-card');
    expect(body).toContain('civ-mb-4');
  });

  it('returns null when the selector is not present', () => {
    const css = `.civ-card { @apply civ-mb-4; }`;
    expect(findRuleBody(css, '.civ-fieldset')).toBeNull();
  });

  it('does not match a selector substring (prefix match avoided)', () => {
    // `.civ-card` must not match `.civ-card--primary`
    const css = `.civ-card--primary { background: blue; }`;
    expect(findRuleBody(css, '.civ-card')).toBeNull();
  });

  it('recurses into @layer wrapper', () => {
    const css = `@layer components { .civ-card { @apply civ-mb-4; } }`;
    const body = findRuleBody(css, '.civ-card');
    expect(body).toContain('civ-mb-4');
  });

  it('recurses into @media wrapper', () => {
    const css = `@media (min-width: 481px) { .civ-card { @apply civ-mb-4; } }`;
    const body = findRuleBody(css, '.civ-card');
    expect(body).toContain('civ-mb-4');
  });

  it('handles nested @layer + @media wrappers (real components.css shape)', () => {
    const css = `@layer components {
      @media (min-width: 481px) {
        .civ-card { @apply civ-mb-4; }
      }
    }`;
    const body = findRuleBody(css, '.civ-card');
    expect(body).toContain('civ-mb-4');
  });

  it('matches when selector is one of several in a comma list', () => {
    const css = `.civ-fieldset, .civ-card { @apply civ-mb-4; }`;
    expect(findRuleBody(css, '.civ-card')).toContain('civ-mb-4');
    expect(findRuleBody(css, '.civ-fieldset')).toContain('civ-mb-4');
  });

  it('does NOT descend into another rule body (opaque)', () => {
    // A `.civ-card` rule with another rule nested inside should not
    // expose the nested rule's body to a query for `.civ-fieldset`
    // — even though the nested rule is at depth 2 of the file.
    const css = `.civ-card {
      @apply civ-p-4;
      .civ-fieldset { @apply civ-mb-4; }
    }`;
    expect(findRuleBody(css, '.civ-fieldset')).toBeNull();
  });

  it('returns the body when called on the first matching rule (not a later one)', () => {
    const css = `.civ-card { @apply civ-mb-4; }
                 .civ-card { @apply civ-mb-6; }`;
    expect(findRuleBody(css, '.civ-card')).toContain('civ-mb-4');
  });

  it('ignores braces inside comments', () => {
    const css = `/* { not a rule } */ .civ-card { @apply civ-mb-4; }`;
    const body = findRuleBody(css, '.civ-card');
    expect(body).toContain('civ-mb-4');
  });
});

describe('findMarginBottomSteps', () => {
  it('extracts a single civ-mb-N value', () => {
    expect(findMarginBottomSteps('@apply civ-mb-4;')).toEqual(['4']);
  });

  it('extracts multiple civ-mb-N values from one body', () => {
    expect(findMarginBottomSteps('@apply civ-mb-4 civ-p-2 civ-mb-0;')).toEqual([
      '4',
      '0',
    ]);
  });

  it('handles decimal step like civ-mb-0.5', () => {
    expect(findMarginBottomSteps('@apply civ-mb-0.5;')).toEqual(['0.5']);
  });

  it('returns empty array when no civ-mb-N present', () => {
    expect(findMarginBottomSteps('@apply civ-p-4 civ-border;')).toEqual([]);
  });

  it('skips civ-mb-N inside CSS comments', () => {
    expect(findMarginBottomSteps('/* @apply civ-mb-4; */ @apply civ-mb-0;')).toEqual(['0']);
  });
});

describe('evaluate (Tier 2 — must have expected mb)', () => {
  it('passes when a Tier 2 rule declares the expected mb step', () => {
    // Build a fixture CSS containing every Tier 2 selector with mb-4
    // (and mb-3 for the page-header--sm variant).
    const fixture = TIER_2_COMPONENTS
      .map((c) => `${c.selector} { @apply civ-mb-${c.expectedMb}; }`)
      .join('\n');
    // Pad with all Tier 3 selectors as no-mb rules so the Tier 3
    // checks also pass.
    const tier3 = TIER_3_COMPONENTS
      .map((s) => `${s} { @apply civ-p-4; }`)
      .join('\n');
    expect(evaluate(`${fixture}\n${tier3}`)).toEqual([]);
  });

  it('fails when a Tier 2 rule omits margin-bottom entirely', () => {
    const css = TIER_2_COMPONENTS
      .map((c) =>
        c.selector === '.civ-card'
          ? `.civ-card { @apply civ-p-4; }` // missing mb
          : `${c.selector} { @apply civ-mb-${c.expectedMb}; }`,
      )
      .join('\n');
    const tier3 = TIER_3_COMPONENTS
      .map((s) => `${s} { @apply civ-p-4; }`)
      .join('\n');
    const failures = evaluate(`${css}\n${tier3}`);
    expect(failures).toHaveLength(1);
    expect(failures[0].selector).toBe('.civ-card');
    expect(failures[0].tier).toBe(2);
    expect(failures[0].reason).toContain('missing civ-mb-4');
  });

  it('fails when a Tier 2 rule uses the wrong mb step', () => {
    const css = TIER_2_COMPONENTS
      .map((c) =>
        c.selector === '.civ-fieldset'
          ? `.civ-fieldset { @apply civ-mb-6; }` // wrong step
          : `${c.selector} { @apply civ-mb-${c.expectedMb}; }`,
      )
      .join('\n');
    const tier3 = TIER_3_COMPONENTS
      .map((s) => `${s} { @apply civ-p-4; }`)
      .join('\n');
    const failures = evaluate(`${css}\n${tier3}`);
    expect(failures).toHaveLength(1);
    expect(failures[0].selector).toBe('.civ-fieldset');
    expect(failures[0].reason).toContain('expected civ-mb-4 but rule declares civ-mb-6');
  });

  it('fails when a Tier 2 rule is missing from components.css entirely', () => {
    // No rule for .civ-card.
    const css = TIER_2_COMPONENTS
      .filter((c) => c.selector !== '.civ-card')
      .map((c) => `${c.selector} { @apply civ-mb-${c.expectedMb}; }`)
      .join('\n');
    const tier3 = TIER_3_COMPONENTS
      .map((s) => `${s} { @apply civ-p-4; }`)
      .join('\n');
    const failures = evaluate(`${css}\n${tier3}`);
    expect(failures.some((f) => f.selector === '.civ-card' && f.reason.includes('rule not found'))).toBe(true);
  });
});

describe('evaluate (Tier 3 — must NOT have mb)', () => {
  it('passes when a Tier 3 rule has no margin-bottom', () => {
    const css = TIER_2_COMPONENTS
      .map((c) => `${c.selector} { @apply civ-mb-${c.expectedMb}; }`)
      .join('\n');
    const tier3 = TIER_3_COMPONENTS
      .map((s) => `${s} { @apply civ-p-4; }`)
      .join('\n');
    expect(evaluate(`${css}\n${tier3}`)).toEqual([]);
  });

  it('passes when a Tier 3 rule declares only civ-mb-0 (reset is allowed)', () => {
    const css = TIER_2_COMPONENTS
      .map((c) => `${c.selector} { @apply civ-mb-${c.expectedMb}; }`)
      .join('\n');
    // civ-callout gets civ-mb-0 — explicit reset, should pass.
    const tier3 = TIER_3_COMPONENTS
      .map((s) =>
        s === '.civ-callout' ? `.civ-callout { @apply civ-mb-0; }` : `${s} { @apply civ-p-4; }`,
      )
      .join('\n');
    expect(evaluate(`${css}\n${tier3}`)).toEqual([]);
  });

  it('fails when a Tier 3 rule picks up margin-bottom (double-spacing risk)', () => {
    const css = TIER_2_COMPONENTS
      .map((c) => `${c.selector} { @apply civ-mb-${c.expectedMb}; }`)
      .join('\n');
    // civ-metric-tile in a grid layout with mb-4 would double-space.
    const tier3 = TIER_3_COMPONENTS
      .map((s) =>
        s === '.civ-metric-tile' ? `.civ-metric-tile { @apply civ-mb-4; }` : `${s} { @apply civ-p-4; }`,
      )
      .join('\n');
    const failures = evaluate(`${css}\n${tier3}`);
    expect(failures).toHaveLength(1);
    expect(failures[0].selector).toBe('.civ-metric-tile');
    expect(failures[0].tier).toBe(3);
    expect(failures[0].reason).toContain('must not carry margin-bottom');
  });

  it('skips Tier 3 selectors that do not have a rule (bare host selectors are fine)', () => {
    // The Tier 3 catalog includes both `.civ-callout` (class) and
    // `civ-callout` (bare host). Real components.css only declares
    // one of them. Missing rules don't fail.
    const css = TIER_2_COMPONENTS
      .map((c) => `${c.selector} { @apply civ-mb-${c.expectedMb}; }`)
      .join('\n');
    // No tier 3 rules at all
    expect(evaluate(css)).toEqual([]);
  });
});

describe('TIER catalogs (live data)', () => {
  it('Tier 2 catalog has entries with valid mb steps', () => {
    expect(TIER_2_COMPONENTS.length).toBeGreaterThan(0);
    for (const entry of TIER_2_COMPONENTS) {
      expect(entry.selector).toMatch(/^[.a-z][a-z0-9.\-_]*$/);
      expect(Number.isFinite(entry.expectedMb)).toBe(true);
      expect(entry.rationale.length).toBeGreaterThan(0);
    }
  });

  it('Tier 3 catalog has entries with valid selectors', () => {
    expect(TIER_3_COMPONENTS.length).toBeGreaterThan(0);
    for (const selector of TIER_3_COMPONENTS) {
      expect(selector).toMatch(/^[.a-z][a-z0-9.\-_]*$/);
    }
  });

  it('no selector appears in both Tier 2 and Tier 3', () => {
    const tier2Selectors = new Set(TIER_2_COMPONENTS.map((c) => c.selector));
    for (const s of TIER_3_COMPONENTS) {
      expect(tier2Selectors.has(s)).toBe(false);
    }
  });
});

/**
 * Tests for tools/lint-purged-variant-classes.ts.
 *
 * Two kinds of coverage:
 *
 * 1. Unit tests for `variantClassesIn` (the CSS scanner) — verify it
 *    picks up modifier classes from various selector shapes.
 * 2. `runLint` regression test against the real repo — every BEM
 *    variant class should have a literal TS reference today.
 */

import { describe, it, expect } from 'vitest';
import { runLint, variantClassesIn } from '../lint-purged-variant-classes.js';

describe('variantClassesIn (CSS scanner)', () => {
  it('picks up a bare modifier selector', () => {
    expect([...variantClassesIn('.civ-foo--bar { color: red }')]).toEqual(['civ-foo--bar']);
  });

  it('picks up modifiers with multi-segment names', () => {
    expect([...variantClassesIn('.civ-foo--bar-baz { color: red }')]).toEqual(['civ-foo--bar-baz']);
  });

  it('extracts from compound selectors', () => {
    const result = [...variantClassesIn('.civ-foo--style-primary.civ-foo--error { color: red }')].sort();
    expect(result).toEqual(['civ-foo--error', 'civ-foo--style-primary']);
  });

  it('extracts from descendant / child selectors', () => {
    const result = [...variantClassesIn('.parent .civ-foo--bar > .civ-baz--qux { color: red }')].sort();
    expect(result).toEqual(['civ-baz--qux', 'civ-foo--bar']);
  });

  it('ignores classes without a -- modifier', () => {
    expect([...variantClassesIn('.civ-foo { color: red } .civ-bar { color: blue }')]).toEqual([]);
  });

  it('ignores names mentioned only in comments', () => {
    expect([...variantClassesIn('/* civ-foo--bar */ .civ-baz--qux { color: red }')]).toEqual(['civ-baz--qux']);
  });

  it('strips trailing pseudo-classes when extracting the bare class', () => {
    const result = [...variantClassesIn('.civ-foo--bar:hover:not(:disabled) { color: red }')];
    expect(result).toEqual(['civ-foo--bar']);
  });
});

describe('runLint (regression)', () => {
  it('every BEM variant class has a literal TS reference', () => {
    const result = runLint();
    if (result.missing.length > 0) {
      throw new Error(
        `${result.missing.length} of ${result.totalVariantClasses} variant classes ` +
        `lack a literal TS reference (would be purged by Tailwind):\n  ${result.missing.join('\n  ')}`,
      );
    }
    expect(result.missing).toEqual([]);
    expect(result.totalVariantClasses).toBeGreaterThan(50);
  });
});

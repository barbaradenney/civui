/**
 * Tests for tools/lint-hardcoded-spacing.ts.
 *
 * The lint scans components.css for padding/margin/gap/font-size/
 * width/height declarations with hardcoded rem/px values and fails
 * on any selector not in the class allowlist OR not annotated with
 * a `/* not density: <reason> *\/` comment. These unit tests cover
 * the three pure helpers — declaration parsing, class allowlist
 * decision, and annotation detection — independently of file-system
 * state.
 */

import { describe, it, expect } from 'vitest';
import {
  extractClasses,
  isAnnotated,
  isClassAllowed,
  parseHardcodedDecl,
} from '../lint-hardcoded-spacing.js';

describe('parseHardcodedDecl', () => {
  it('detects hardcoded rem/px values on target properties', () => {
    expect(parseHardcodedDecl('  padding: 1rem;')).toEqual({
      property: 'padding',
      value: '1rem',
    });
    expect(parseHardcodedDecl('  margin-top: 8px;')).toEqual({
      property: 'margin-top',
      value: '8px',
    });
    expect(parseHardcodedDecl('  font-size: 1.25rem;')).toEqual({
      property: 'font-size',
      value: '1.25rem',
    });
    expect(parseHardcodedDecl('  width: 12rem;')).toEqual({
      property: 'width',
      value: '12rem',
    });
    expect(parseHardcodedDecl('  min-height: 44px;')).toEqual({
      property: 'min-height',
      value: '44px',
    });
  });

  it('detects multi-value shorthand hits', () => {
    expect(parseHardcodedDecl('  padding: 0.5rem 1rem;')).toEqual({
      property: 'padding',
      value: '0.5rem 1rem',
    });
  });

  it('passes token-based values (anything inside var())', () => {
    expect(parseHardcodedDecl('  padding: var(--civ-spacing-2);')).toBeNull();
    expect(parseHardcodedDecl('  margin: var(--civ-spacing-2) var(--civ-spacing-4);')).toBeNull();
    // var() with a px fallback is still token-driven — the fallback
    // never fires when the token resolves (which it always does).
    expect(parseHardcodedDecl('  gap: var(--civ-spacing-4, 16px);')).toBeNull();
    expect(parseHardcodedDecl('  margin-bottom: var(--civ-spacing-1, 4px);')).toBeNull();
  });

  it('passes em / % / vh / vw / dvh / dvw values (font- and viewport-relative)', () => {
    expect(parseHardcodedDecl('  font-size: 1.25em;')).toBeNull();
    expect(parseHardcodedDecl('  width: 50%;')).toBeNull();
    expect(parseHardcodedDecl('  max-height: 80vh;')).toBeNull();
    expect(parseHardcodedDecl('  max-height: 50dvh;')).toBeNull();
  });

  it('passes calc(...) values that don\'t contain a bare rem/px literal', () => {
    // calc(50% - var(--civ-spacing-2)) — token-driven.
    expect(parseHardcodedDecl('  width: calc(50% - var(--civ-spacing-2));')).toBeNull();
  });

  it('flags calc(...) values that contain a hardcoded rem/px literal', () => {
    // calc(1em + 0.5rem) — the 0.5rem is hardcoded.
    expect(parseHardcodedDecl('  padding-inline-start: calc(1em + 0.5rem);')).not.toBeNull();
  });

  it('passes 0 / 0px / 0rem (no real spatial value)', () => {
    expect(parseHardcodedDecl('  gap: 0;')).toBeNull();
    expect(parseHardcodedDecl('  padding: 0px;')).toBeNull();
    expect(parseHardcodedDecl('  margin: 0rem;')).toBeNull();
  });

  it('ignores non-target properties', () => {
    expect(parseHardcodedDecl('  color: red;')).toBeNull();
    expect(parseHardcodedDecl('  display: flex;')).toBeNull();
    // border-width is intentionally NOT a target property — borders
    // are visual emphasis, not spatial density.
    expect(parseHardcodedDecl('  border-bottom-width: 2px;')).toBeNull();
    // border-inline-start-width contains "width" as a suffix; the
    // word-boundary regex must NOT match it.
    expect(parseHardcodedDecl('  border-inline-start-width: 3px;')).toBeNull();
  });

  it('ignores @apply Tailwind utilities (those map to tokens via config)', () => {
    expect(parseHardcodedDecl('  @apply civ-p-4 civ-mb-3;')).toBeNull();
  });
});

describe('extractClasses', () => {
  it('extracts class names from a flat selector', () => {
    expect(extractClasses('.civ-card')).toEqual(['civ-card']);
    expect(extractClasses('.civ-card.civ-card--flat')).toEqual(['civ-card', 'civ-card--flat']);
  });

  it('extracts classes from compound and descendant selectors', () => {
    expect(extractClasses('.civ-list > .civ-list-item.civ-list-item--active')).toEqual([
      'civ-list',
      'civ-list-item',
      'civ-list-item--active',
    ]);
  });

  it('handles selector lists (commas)', () => {
    expect(extractClasses('.civ-foo, .civ-bar')).toEqual(['civ-foo', 'civ-bar']);
  });

  it('returns empty for selectors with no class tokens', () => {
    expect(extractClasses('dialog.civ-modal')).toEqual(['civ-modal']);
    expect(extractClasses('input[type="text"]')).toEqual([]);
  });
});

describe('isClassAllowed', () => {
  it('passes selectors whose class root is in the allowlist', () => {
    // Tap-target floor — should be allowed.
    expect(isClassAllowed('.civ-action-btn')).toBe(true);
    expect(isClassAllowed('.civ-close-btn')).toBe(true);
  });

  it('passes BEM modifier classes when their root is allowed', () => {
    // `.civ-spinner--sm` should pass via the `civ-spinner` root entry.
    expect(isClassAllowed('.civ-spinner--sm')).toBe(true);
    expect(isClassAllowed('.civ-spinner--lg')).toBe(true);
  });

  it('passes custom-element tag selectors when their tag is in the allowlist', () => {
    // The allowlist doubles as a tag list — `civ-modal` matches both
    // `.civ-modal` and `<civ-modal>` selectors.
    expect(isClassAllowed('dialog.civ-modal')).toBe(true);
    expect(isClassAllowed('civ-callout[emphasis="secondary"]')).toBe(true);
  });

  it('rejects selectors whose classes are not in the allowlist', () => {
    expect(isClassAllowed('.civ-foobar')).toBe(false);
    expect(isClassAllowed('.civ-some-new-thing__inner')).toBe(false);
  });
});

describe('isAnnotated', () => {
  it('exempts a declaration when the previous comment is `not density:`', () => {
    const body = [
      '    /* not density: WCAG 2.5.5 tap target floor */',
      '    min-width: 2.5rem;',
    ];
    expect(isAnnotated(body, 1)).toBe(true);
  });

  it('exempts the second declaration in a stanza below a single comment', () => {
    // The comment applies to the contiguous stanza below it.
    const body = [
      '    /* not density: WCAG 2.5.5 tap target floor */',
      '    min-width: 2.5rem;',
      '    min-height: 2.5rem;',
    ];
    expect(isAnnotated(body, 1)).toBe(true);
    expect(isAnnotated(body, 2)).toBe(true);
  });

  it('exempts when the comment is multi-line and the marker appears anywhere inside', () => {
    const body = [
      '    /* not density: WCAG 2.5.5 tap target floor — 40px / 40px',
      '       is the minimum recommended touch target. */',
      '    min-width: 2.5rem;',
    ];
    expect(isAnnotated(body, 2)).toBe(true);
  });

  it('does NOT exempt when the prior comment is some other kind', () => {
    const body = [
      '    /* Visible track + thumb dimensions */',
      '    width: 3rem;',
    ];
    expect(isAnnotated(body, 1)).toBe(false);
  });

  it('does NOT exempt across a blank-line stanza break', () => {
    const body = [
      '    /* not density: WCAG 2.5.5 tap target floor */',
      '    min-width: 2.5rem;',
      '',
      '    padding: 2rem;',
    ];
    expect(isAnnotated(body, 1)).toBe(true);
    expect(isAnnotated(body, 3)).toBe(false);
  });
});

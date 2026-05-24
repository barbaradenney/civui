/**
 * Tests for tools/lint-border-radius.ts.
 *
 * The lint scans components.css for border-radius applications and
 * fails on any selector not in the allowlist. These unit tests cover
 * the three pure helpers — radius detection, selector tokenization,
 * and the allowlist decision — independently of file-system state.
 */

import { describe, it, expect } from 'vitest';
import {
  appliesRadius,
  extractSimpleTokens,
  isAllowed,
  stripNestedBlocks,
} from '../lint-border-radius.js';

describe('appliesRadius', () => {
  it('detects explicit border-radius declarations', () => {
    expect(appliesRadius('    border-radius: 4px;').yes).toBe(true);
    expect(appliesRadius('    border-radius: var(--civ-border-radius-md);').yes).toBe(true);
    expect(appliesRadius('    border-radius: 9999px;').yes).toBe(true);
    expect(appliesRadius('    border-radius: 50%;').yes).toBe(true);
  });

  it('detects per-corner border-radius declarations', () => {
    expect(appliesRadius('    border-top-left-radius: 4px;').yes).toBe(true);
    expect(appliesRadius('    border-bottom-right-radius: var(--x);').yes).toBe(true);
  });

  it('treats explicit zero / none / unset as NOT applying radius', () => {
    expect(appliesRadius('    border-radius: 0;').yes).toBe(false);
    expect(appliesRadius('    border-radius: 0px;').yes).toBe(false);
    expect(appliesRadius('    border-radius: none;').yes).toBe(false);
    expect(appliesRadius('    border-radius: unset;').yes).toBe(false);
    expect(appliesRadius('    border-radius: inherit;').yes).toBe(false);
  });

  it('treats multi-value zero shorthand as NOT applying radius', () => {
    // Border-radius shorthand: `border-radius: 0 0 0 0` (all four
    // corners explicitly zero) is a legitimate reset and must not
    // trip the lint. Same for two- and three-value forms.
    expect(appliesRadius('    border-radius: 0 0 0 0;').yes).toBe(false);
    expect(appliesRadius('    border-radius: 0 0;').yes).toBe(false);
    expect(appliesRadius('    border-radius: 0px 0px 0px 0px;').yes).toBe(false);
    expect(appliesRadius('    border-radius: 0% 0%;').yes).toBe(false);
  });

  it('flags partial-zero shorthand as APPLYING radius', () => {
    // `border-radius: 0 0 4px 4px` rounds the bottom corners only —
    // that IS a radius application and should still be flagged.
    expect(appliesRadius('    border-radius: 0 0 4px 4px;').yes).toBe(true);
    expect(appliesRadius('    border-radius: 4px 0 4px 0;').yes).toBe(true);
  });

  it('detects civ-rounded utilities in @apply', () => {
    expect(appliesRadius('    @apply civ-rounded civ-bg-surface;').yes).toBe(true);
    expect(appliesRadius('    @apply civ-rounded-full;').yes).toBe(true);
    expect(appliesRadius('    @apply civ-rounded-md;').yes).toBe(true);
    expect(appliesRadius('    @apply civ-rounded-s;').yes).toBe(true);
    expect(appliesRadius('    @apply civ-rounded-e civ-border;').yes).toBe(true);
  });

  it('treats civ-rounded-none / civ-rounded-0 as NOT applying radius', () => {
    expect(appliesRadius('    @apply civ-rounded-none;').yes).toBe(false);
    expect(appliesRadius('    @apply civ-rounded-0;').yes).toBe(false);
  });

  it('returns false on declarations with no radius', () => {
    expect(appliesRadius('    @apply civ-p-4 civ-border;').yes).toBe(false);
    expect(appliesRadius('    color: red;').yes).toBe(false);
    expect(appliesRadius('    background: var(--bg);').yes).toBe(false);
  });
});

describe('extractSimpleTokens', () => {
  it('extracts classes from a simple selector', () => {
    const { classes, tags } = extractSimpleTokens('.civ-btn');
    expect(classes).toEqual(['civ-btn']);
    expect(tags).toEqual([]);
  });

  it('extracts the leading tag of a compound', () => {
    const { tags } = extractSimpleTokens('button.civ-btn');
    expect(tags).toEqual(['button']);
  });

  it('extracts tags from descendant selectors', () => {
    // Regression: an earlier version only extracted the leading
    // compound's tag, missing trailing tag tokens.
    const { classes, tags } = extractSimpleTokens(
      '.civ-button-group--vertical civ-action-button:first-child button',
    );
    expect(classes).toContain('civ-button-group--vertical');
    expect(tags).toContain('civ-action-button');
    expect(tags).toContain('button');
  });

  it('walks child / sibling combinators', () => {
    const { tags } = extractSimpleTokens('.outer > civ-x ~ civ-y + civ-z');
    expect(tags).toEqual(expect.arrayContaining(['civ-x', 'civ-y', 'civ-z']));
  });

  it('splits comma-separated selector lists', () => {
    const { classes } = extractSimpleTokens('.civ-foo, .civ-bar');
    expect(classes).toEqual(expect.arrayContaining(['civ-foo', 'civ-bar']));
  });
});

describe('stripNestedBlocks', () => {
  it('returns the input unchanged when no nesting is present', () => {
    const input = '  color: red;\n  border: 1px solid;\n';
    expect(stripNestedBlocks(input)).toBe(input);
  });

  it('blanks the contents of nested rule blocks while preserving newlines', () => {
    // Native CSS nesting: an inner rule's body must NOT be scanned
    // as part of the outer rule's body, but its line count must be
    // preserved so the outer body's line numbers still align.
    const input = '  color: red;\n  .inner {\n    border-radius: 4px;\n  }\n  font-size: 1rem;\n';
    const stripped = stripNestedBlocks(input);
    expect(stripped).not.toMatch(/border-radius/);
    expect(stripped.split('\n').length).toBe(input.split('\n').length);
  });

  it('handles deeply nested blocks', () => {
    const input = 'a { b { c { border-radius: 9999px; } } }';
    const stripped = stripNestedBlocks(input);
    expect(stripped).not.toMatch(/border-radius/);
  });
});

describe('isAllowed', () => {
  it('allows native interactive tags', () => {
    expect(isAllowed('button')).toBe(true);
    expect(isAllowed('input')).toBe(true);
    expect(isAllowed('textarea.civ-textarea')).toBe(true);
    expect(isAllowed('.civ-some-wrapper select')).toBe(true);
  });

  it('allows known interactive class roots', () => {
    expect(isAllowed('.civ-btn')).toBe(true);
    expect(isAllowed('.civ-link-card')).toBe(true);
    expect(isAllowed('.civ-filter-chip')).toBe(true);
    expect(isAllowed('.civ-input')).toBe(true);
  });

  it('allows pills / badges / tags as their own identities', () => {
    expect(isAllowed('.civ-tag')).toBe(true);
    expect(isAllowed('.civ-badge')).toBe(true);
    expect(isAllowed('.civ-count')).toBe(true);
  });

  it('allows BEM modifiers of allowed roots', () => {
    // `.civ-btn--primary` should pass via the `civ-btn` root.
    expect(isAllowed('.civ-btn--primary')).toBe(true);
    expect(isAllowed('.civ-link-card--blue')).toBe(true);
  });

  it('allows custom-element tags listed in the allowlist', () => {
    // `civ-accordion-item` is a custom element tag; the lint should
    // match it the same way it matches a class of the same name.
    expect(isAllowed('.civ-accordion__inner--secondary > civ-accordion-item')).toBe(true);
  });

  it('forbids static container classes', () => {
    // These are exactly the bugs the lint exists to catch.
    expect(isAllowed('.civ-metric-tile')).toBe(false);
    expect(isAllowed('.civ-file-preview')).toBe(false);
    expect(isAllowed('.civ-form-support-resources')).toBe(false);
    expect(isAllowed('.civ-confirmation-panel__reference')).toBe(false);
  });

  it('forbids ad-hoc new card-shaped classes', () => {
    expect(isAllowed('.civ-some-new-card')).toBe(false);
    expect(isAllowed('.civ-feature-panel')).toBe(false);
  });
});

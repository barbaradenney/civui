/**
 * Tests for tools/lint-wcag-text-spacing.ts.
 *
 * The lint scans components.css for `text-overflow` clipping
 * declarations and fails on any selector not in the class allowlist
 * AND not annotated with a `/* clip ok: <reason> *\/` comment. These
 * unit tests cover the three pure helpers — declaration parsing,
 * class allowlist decision, and annotation detection — independently
 * of file-system state.
 */

import { describe, it, expect } from 'vitest';
import {
  extractClasses,
  isAnnotated,
  isClassAllowed,
  parseTextOverflowDecl,
} from '../lint-wcag-text-spacing.js';

describe('parseTextOverflowDecl', () => {
  it('detects text-overflow declarations', () => {
    expect(parseTextOverflowDecl('  text-overflow: ellipsis;')).toBe('ellipsis');
    expect(parseTextOverflowDecl('  text-overflow: clip;')).toBe('clip');
    expect(parseTextOverflowDecl('  text-overflow: "…";')).toBe('"…"');
  });

  it('handles leading whitespace and missing semicolon', () => {
    expect(parseTextOverflowDecl('text-overflow: ellipsis')).toBe('ellipsis');
    expect(parseTextOverflowDecl('\t\ttext-overflow:ellipsis;')).toBe('ellipsis');
  });

  it('ignores non-text-overflow properties', () => {
    expect(parseTextOverflowDecl('  overflow: hidden;')).toBeNull();
    expect(parseTextOverflowDecl('  white-space: nowrap;')).toBeNull();
    expect(parseTextOverflowDecl('  text-decoration: underline;')).toBeNull();
    expect(parseTextOverflowDecl('  color: red;')).toBeNull();
  });

  it('ignores @apply lines and comments', () => {
    expect(parseTextOverflowDecl('  @apply civ-truncate;')).toBeNull();
    expect(parseTextOverflowDecl('  /* text-overflow: ellipsis */')).toBeNull();
  });
});

describe('extractClasses', () => {
  it('extracts class names from a flat selector', () => {
    expect(extractClasses('.civ-data-field__label')).toEqual(['civ-data-field__label']);
  });

  it('extracts classes from compound and descendant selectors', () => {
    expect(extractClasses('.civ-signature .civ-signature-preview__cursive')).toEqual([
      'civ-signature',
      'civ-signature-preview__cursive',
    ]);
  });

  it('handles selector lists (commas)', () => {
    expect(extractClasses('.civ-foo, .civ-bar')).toEqual(['civ-foo', 'civ-bar']);
  });

  it('handles tag-prefixed compound selectors', () => {
    expect(extractClasses('dialog.civ-modal')).toEqual(['civ-modal']);
  });
});

describe('isClassAllowed', () => {
  it('passes selectors that include an allowlisted class', () => {
    // civ-signature-preview__cursive is on the live allowlist.
    expect(isClassAllowed('.civ-signature-preview__cursive')).toBe(true);
  });

  it('passes BEM modifier classes of an allowlisted root', () => {
    // BEM modifier matches via allowlist root.
    expect(isClassAllowed('.civ-signature-preview__cursive--sm')).toBe(true);
  });

  it('fails selectors with no allowlist match', () => {
    expect(isClassAllowed('.civ-data-field__label')).toBe(false);
    expect(isClassAllowed('.civ-some-new-thing')).toBe(false);
  });
});

describe('isAnnotated', () => {
  it('detects a `clip ok:` marker on the line immediately above', () => {
    const body = [
      '',
      '    /* clip ok: decorative preview, full value lives in the input. */',
      '    text-overflow: clip;',
    ];
    expect(isAnnotated(body, 2)).toBe(true);
  });

  it('detects markers in multi-line comment blocks', () => {
    const body = [
      '    /*',
      '     * clip ok: data exists in the input value; preview is decorative.',
      '     */',
      '    text-overflow: clip;',
    ];
    expect(isAnnotated(body, 3)).toBe(true);
  });

  it('returns false when no annotation precedes the declaration', () => {
    const body = [
      '    color: red;',
      '    text-overflow: ellipsis;',
    ];
    expect(isAnnotated(body, 1)).toBe(false);
  });

  it('returns false when a blank line breaks the stanza', () => {
    const body = [
      '    /* clip ok: applies to a different declaration above */',
      '',
      '    text-overflow: ellipsis;',
    ];
    expect(isAnnotated(body, 2)).toBe(false);
  });

  it('returns false when a different comment breaks the stanza', () => {
    const body = [
      '    /* clip ok: not for this one */',
      '    /* a different unrelated comment */',
      '    text-overflow: ellipsis;',
    ];
    // The unrelated comment breaks the stanza — the `clip ok:` no
    // longer applies. Falls back to allowlist.
    expect(isAnnotated(body, 2)).toBe(false);
  });
});

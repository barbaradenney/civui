/**
 * Tests for tools/lint-host-display.ts.
 *
 * Two kinds of coverage:
 *
 * 1. `extractFinalTag` unit tests — verify the CSS selector parser
 *    counts the right things as declaring a host's display.
 * 2. `runLint` regression test against the real repo — every
 *    @customElement should pass today. If anyone deletes a display
 *    rule for any component, this fails.
 */

import { describe, it, expect } from 'vitest';
import { extractFinalTag, runLint } from '../lint-host-display.js';

describe('extractFinalTag', () => {
  it('returns the tag for a bare host selector', () => {
    expect(extractFinalTag('civ-foo')).toBe('civ-foo');
  });

  it('returns the tag for a host with a class modifier', () => {
    expect(extractFinalTag('civ-foo.modifier')).toBe('civ-foo');
  });

  it('returns the tag for a host with an attribute modifier', () => {
    expect(extractFinalTag('civ-foo[disabled]')).toBe('civ-foo');
  });

  it('returns the tag for a host with a pseudo-class', () => {
    expect(extractFinalTag('civ-foo:focus-within')).toBe('civ-foo');
  });

  it('returns the FINAL tag for a sibling combinator', () => {
    // The sibling combinator's subject is the right-hand tag. The
    // rule applies to civ-bar's box, so it counts as defining bar's
    // display.
    expect(extractFinalTag('civ-foo + civ-bar')).toBe('civ-bar');
  });

  it('returns the subject tag for a descendant combinator', () => {
    expect(extractFinalTag('.parent civ-foo')).toBe('civ-foo');
  });

  it('returns the subject tag for a child combinator', () => {
    expect(extractFinalTag('.parent > civ-foo')).toBe('civ-foo');
  });

  it('returns null when the rightmost compound is not a civ-* tag', () => {
    expect(extractFinalTag('civ-foo > div')).toBeNull();
    expect(extractFinalTag('.civ-foo')).toBeNull();  // class, not host
    expect(extractFinalTag('[data-civ-foo]')).toBeNull();
  });

  it('rejects pseudo-elements that style a generated box, not the host', () => {
    expect(extractFinalTag('civ-foo::before')).toBeNull();
    expect(extractFinalTag('civ-foo::after')).toBeNull();
    expect(extractFinalTag('civ-foo::placeholder')).toBeNull();
    expect(extractFinalTag('civ-foo::marker')).toBeNull();
  });

  it('returns null for empty / non-civ selectors', () => {
    expect(extractFinalTag('')).toBeNull();
    expect(extractFinalTag('button')).toBeNull();
    expect(extractFinalTag('input.foo')).toBeNull();
  });
});

describe('runLint (regression)', () => {
  it('every @customElement has an explicit display rule', () => {
    const result = runLint();
    // Concise failure: if anything is missing, list the tags.
    if (result.missing.length > 0) {
      const names = result.missing.map((m) => m.tag).join(', ');
      throw new Error(
        `${result.missing.length} of ${result.tagsScanned} hosts missing explicit display: ${names}`,
      );
    }
    expect(result.missing).toEqual([]);
    expect(result.tagsScanned).toBeGreaterThan(60);
  });
});

/**
 * Tests for tools/lint-utils/strip-comments.ts.
 *
 * Multiple lints (hardcoded-tokens, readonly-cascade,
 * combobox-no-autocomplete) scan source files line-by-line. Without
 * comment stripping, prose inside block / line comments triggers
 * false positives: a JSDoc example like
 * `<civ-combobox autocomplete="off">` gets flagged as a violation,
 * and a design-decision comment mentioning "z-index: 1 on :focus"
 * gets flagged as a hardcoded value.
 *
 * The stripper replaces comment bodies with spaces and preserves
 * newlines so line numbers stay accurate.
 */
import { describe, it, expect } from 'vitest';
import { stripComments } from '../lint-utils/strip-comments.js';

describe('stripComments', () => {
  it('strips a single-line CSS block comment', () => {
    const src = '.foo { color: red; /* and z-index: 1 on focus */ }';
    const out = stripComments(src, '.css');
    expect(out).not.toMatch(/z-index/);
    expect(out).toContain('color: red;');
  });

  it('strips a multi-line CSS block comment while preserving line count', () => {
    const src = `.foo {
  /* line two
     line three z-index: 99
     line four */
  color: blue;
}`;
    const out = stripComments(src, '.css');
    expect(out.split('\n')).toHaveLength(src.split('\n').length);
    expect(out).not.toMatch(/z-index/);
    expect(out).toContain('color: blue;');
  });

  it('does NOT strip TS-style `//` comments inside CSS (those would clobber url(//…))', () => {
    const src = '.foo { background: url(//cdn.example.com/img.png); }';
    const out = stripComments(src, '.css');
    expect(out).toBe(src);
  });

  it('strips TypeScript // line comments', () => {
    const src = `const x = 1; // and z-index: 99 in a comment
const y = 2;`;
    const out = stripComments(src, '.ts');
    expect(out).not.toMatch(/z-index/);
    expect(out).toContain('const y = 2;');
    expect(out.split('\n')).toHaveLength(2);
  });

  it('strips TypeScript /* */ block comments', () => {
    const src = `/* transition: 5s linear */
const x = 1;`;
    const out = stripComments(src, '.ts');
    expect(out).not.toMatch(/transition/);
    expect(out).toContain('const x = 1;');
  });

  it('does NOT strip code that merely looks comment-like inside strings', () => {
    const src = `const url = "https://example.com/a/b"; const c = 'z-index: 1';`;
    const out = stripComments(src, '.ts');
    expect(out).toContain('https://example.com/a/b');
    expect(out).toContain("'z-index: 1'");
  });

  it('handles escaped quotes inside string literals correctly', () => {
    // The escape sequence \" should not close the string prematurely.
    const src = `const x = "he said \\"// not a comment\\""; const y = 2;`;
    const out = stripComments(src, '.ts');
    expect(out).toContain('"he said \\"// not a comment\\""');
    expect(out).toContain('const y = 2;');
  });

  it('preserves the exact line on which the block comment starts', () => {
    const src = `a
b /* hidden */ c
d`;
    const out = stripComments(src, '.css');
    const lines = out.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('a');
    expect(lines[2]).toBe('d');
    // Line 2 retains the visible code on either side of the comment.
    expect(lines[1].startsWith('b')).toBe(true);
    expect(lines[1].trimEnd().endsWith('c')).toBe(true);
  });

  it('handles template literals (backtick strings) in TS', () => {
    const src = 'const x = `// not a comment, this is a template literal`;';
    const out = stripComments(src, '.ts');
    expect(out).toBe(src);
  });
});

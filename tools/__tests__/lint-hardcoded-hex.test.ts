/**
 * Tests for tools/lint-hardcoded-hex.ts — the bare-hex gate for
 * components.css / civ.css.
 */
import { describe, it, expect } from 'vitest';
import { stripComments, stripVarSpans, scanCss } from '../lint-hardcoded-hex.js';

describe('stripVarSpans', () => {
  it('removes a var() with a hex fallback', () => {
    const out = stripVarSpans('color: var(--civ-color-x, #fff);');
    expect(out).not.toContain('#fff');
  });

  it('removes nested var() fallbacks', () => {
    const out = stripVarSpans('color: var(--a, var(--b, #abc));');
    expect(out).not.toContain('#abc');
  });

  it('preserves a bare hex outside var()', () => {
    expect(stripVarSpans('color: #1b1b1b;')).toContain('#1b1b1b');
  });

  it('preserves line count (newline-safe blanking)', () => {
    const input = 'a {\n  color: var(--x, #fff);\n}';
    expect(stripVarSpans(input).split('\n')).toHaveLength(3);
  });
});

describe('stripComments', () => {
  it('blanks a hex inside a block comment', () => {
    expect(stripComments('/* see #abcdef */ color: red;')).not.toContain('#abcdef');
  });
});

describe('scanCss', () => {
  it('flags a bare hex literal in a rule', () => {
    const css = '.foo {\n  color: #1b1b1b;\n}';
    const findings = scanCss(css, 'f.css');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ hex: '#1b1b1b', line: 2, selector: '.foo' });
  });

  it('ignores hex used as a var() fallback', () => {
    const css = '.foo {\n  color: var(--civ-color-base-darkest, #1b1b1b);\n}';
    expect(scanCss(css, 'f.css')).toHaveLength(0);
  });

  it('ignores hex in an allowlisted selector', () => {
    const allow = [{ cls: 'civ-demo-allowed', reason: 'test' }];
    const css = '.civ-demo-allowed {\n  color: #1b1b1b;\n}';
    expect(scanCss(css, 'f.css', allow)).toHaveLength(0);
  });

  it('honors an allowlisted selector with a pseudo-class suffix', () => {
    const allow = [{ cls: 'civ-demo-allowed', reason: 'test' }];
    const css = '.civ-demo-allowed:hover {\n  color: #222222;\n}';
    expect(scanCss(css, 'f.css', allow)).toHaveLength(0);
  });

  it('flags a hex when its selector is not in the allowlist', () => {
    // Regression: the formerly-allowlisted critical link-card literal
    // moved to the non-inverting `warning-ink` token, so a bare hex
    // there is now a real violation against the (empty) prod allowlist.
    const css = '.civ-link-card--critical {\n  color: #1b1b1b;\n}';
    expect(scanCss(css, 'f.css')).toHaveLength(1);
  });

  it('ignores a hex annotated with /* hex ok */', () => {
    const css = '.foo {\n  /* hex ok: print fallback */\n  color: #000000;\n}';
    expect(scanCss(css, 'f.css')).toHaveLength(0);
  });

  it('ignores hex inside a comment', () => {
    const css = '.foo {\n  /* brand was #ff0000 */\n  color: var(--civ-color-primary-DEFAULT);\n}';
    expect(scanCss(css, 'f.css')).toHaveLength(0);
  });

  it('descends into @media-wrapped rules', () => {
    const css = '@media print {\n  .foo {\n    color: #123456;\n  }\n}';
    const findings = scanCss(css, 'f.css');
    expect(findings).toHaveLength(1);
    expect(findings[0].selector).toBe('.foo');
  });
});

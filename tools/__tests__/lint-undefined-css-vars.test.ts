/**
 * Tests for tools/lint-undefined-css-vars.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  definedCivVarsIn,
  referencedCivVarsIn,
  runLint,
} from '../lint-undefined-css-vars.js';

describe('definedCivVarsIn', () => {
  it('picks up a single declaration', () => {
    expect([...definedCivVarsIn('--civ-color-primary: #005ea2;')])
      .toEqual(['--civ-color-primary']);
  });

  it('picks up declarations with mixed-case suffixes (DEFAULT)', () => {
    const result = [...definedCivVarsIn('--civ-color-primary-DEFAULT: #005ea2;')];
    expect(result).toEqual(['--civ-color-primary-DEFAULT']);
  });

  it('picks up multiple declarations', () => {
    const css = `
      :root {
        --civ-spacing-1: 8px;
        --civ-spacing-2: 16px;
      }
    `;
    const result = [...definedCivVarsIn(css)].sort();
    expect(result).toEqual(['--civ-spacing-1', '--civ-spacing-2']);
  });

  it('ignores `var(--civ-X)` references (not declarations)', () => {
    expect([...definedCivVarsIn('color: var(--civ-color-primary);')])
      .toEqual([]);
  });

  it('ignores non-civ-* declarations', () => {
    expect([...definedCivVarsIn('--my-color: red;')])
      .toEqual([]);
  });
});

describe('referencedCivVarsIn', () => {
  it('picks up a single var() reference', () => {
    expect([...referencedCivVarsIn('color: var(--civ-color-primary);')])
      .toEqual(['--civ-color-primary']);
  });

  it('picks up references with a fallback', () => {
    expect([...referencedCivVarsIn('color: var(--civ-color-primary, blue);')])
      .toEqual(['--civ-color-primary']);
  });

  it('picks up multiple distinct references', () => {
    const css = `
      .foo { background: var(--civ-color-bg); color: var(--civ-color-fg); }
    `;
    const result = [...referencedCivVarsIn(css)].sort();
    expect(result).toEqual(['--civ-color-bg', '--civ-color-fg']);
  });

  it('strips comments so commented-out references don\'t count', () => {
    const css = `/* color: var(--civ-color-removed); */ color: var(--civ-color-real);`;
    expect([...referencedCivVarsIn(css)]).toEqual(['--civ-color-real']);
  });

  it('ignores declarations (not references)', () => {
    expect([...referencedCivVarsIn('--civ-color-primary: #005ea2;')])
      .toEqual([]);
  });
});

describe('runLint (regression)', () => {
  it('every var(--civ-*) reference resolves to a defined token', () => {
    const result = runLint();
    if (result.undefined.length > 0) {
      const names = result.undefined.map((r) => `${r.name} in ${r.file}`).join('\n  ');
      throw new Error(
        `${result.undefined.length} undefined var(--civ-*) references:\n  ${names}`,
      );
    }
    expect(result.undefined).toEqual([]);
    expect(result.tokensDefined).toBeGreaterThan(100);
  });
});

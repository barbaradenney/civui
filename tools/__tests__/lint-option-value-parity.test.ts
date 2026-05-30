/**
 * Tests for tools/lint-option-value-parity.ts — the pure extraction /
 * presence helpers and an end-to-end run against the real registry.
 */

import { describe, it, expect } from 'vitest';
import {
  OPTION_COMPONENTS,
  extractWebOptionValues,
  nativeContainsValue,
  missingFromNative,
  collectFindings,
} from '../lint-option-value-parity.js';

describe('extractWebOptionValues', () => {
  it('extracts value literals (both quote styles), de-duped in order', () => {
    const src = `
      const A = [{ value: 'hispanic-latino', label: 'x' }, { value: "white", label: 'y' }];
      const B = [{ value: 'white', label: 'z' }]; // dup
    `;
    expect(extractWebOptionValues(src)).toEqual(['hispanic-latino', 'white']);
  });

  it('ignores non-string-literal value: (objects, expressions)', () => {
    const src = `dispatch(this, 'civ-input', { value: { ...this._data } });
                 const o = { value: this.value };`;
    expect(extractWebOptionValues(src)).toEqual([]);
  });
});

describe('nativeContainsValue', () => {
  it('matches an exact quoted literal in either quote style', () => {
    expect(nativeContainsValue('("hispanic-latino", "Hispanic or Latino")', 'hispanic-latino')).toBe(true);
    expect(nativeContainsValue(`value = 'white'`, 'white')).toBe(true);
  });

  it('does not match a substring inside a longer quoted token', () => {
    expect(nativeContainsValue('"asian-american"', 'asian')).toBe(false);
  });

  it('returns false when absent', () => {
    expect(nativeContainsValue('("hispanic", "Hispanic")', 'hispanic-latino')).toBe(false);
  });
});

describe('missingFromNative', () => {
  it('flags canonical values absent from the native source (the regression case)', () => {
    // Pre-fix iOS shipped "hispanic" / "not-hispanic" / "ethnicity-prefer-not".
    const drifted = `[("hispanic", "Hispanic or Latino"), ("not-hispanic", "Not"), ("ethnicity-prefer-not", "Prefer not")]`;
    const canonical = ['hispanic-latino', 'not-hispanic-latino', 'prefer-not-to-answer'];
    expect(missingFromNative(drifted, canonical)).toEqual([
      'hispanic-latino', 'not-hispanic-latino', 'prefer-not-to-answer',
    ]);
  });

  it('returns [] when every canonical value is present', () => {
    const ok = `[("hispanic-latino", "x"), ("not-hispanic-latino", "y"), ("prefer-not-to-answer", "z")]`;
    expect(missingFromNative(ok, ['hispanic-latino', 'not-hispanic-latino', 'prefer-not-to-answer'])).toEqual([]);
  });
});

describe('collectFindings (real registry)', () => {
  it('has a non-empty registry', () => {
    expect(OPTION_COMPONENTS.length).toBeGreaterThan(0);
  });

  it('reports no errors and no drift against the current sources', () => {
    const { findings, errors } = collectFindings();
    expect(errors).toEqual([]);
    expect(findings).toEqual([]);
  });
});

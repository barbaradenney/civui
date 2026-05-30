/**
 * Tests for tools/lint-schema-default-values.ts — the pure helpers that
 * classify scalar defaults and extract parameter defaults from Swift /
 * Kotlin parameter lists. The file-walking comparison in
 * `collectFindings` is exercised by running the lint itself in CI; here
 * we lock the parsing + comparison primitives.
 */

import { describe, it, expect } from 'vitest';
import {
  classifySchemaDefault,
  classifyNativeDefault,
  literalsEqual,
  sliceParamList,
  splitTopLevel,
  parseParamDefaults,
} from '../lint-schema-default-values.js';

describe('classifySchemaDefault', () => {
  it('classifies scalars', () => {
    expect(classifySchemaDefault('blur')).toEqual({ kind: 'string', value: 'blur' });
    expect(classifySchemaDefault(0)).toEqual({ kind: 'number', value: 0 });
    expect(classifySchemaDefault(true)).toEqual({ kind: 'boolean', value: true });
  });

  it('returns null for arrays / objects / undefined', () => {
    expect(classifySchemaDefault([])).toBeNull();
    expect(classifySchemaDefault({})).toBeNull();
    expect(classifySchemaDefault(undefined)).toBeNull();
  });
});

describe('classifyNativeDefault', () => {
  it('parses quoted strings, numbers, booleans', () => {
    expect(classifyNativeDefault('"full"')).toEqual({ kind: 'string', value: 'full' });
    expect(classifyNativeDefault('0')).toEqual({ kind: 'number', value: 0 });
    expect(classifyNativeDefault('400')).toEqual({ kind: 'number', value: 400 });
    expect(classifyNativeDefault('true')).toEqual({ kind: 'boolean', value: true });
  });

  it('returns null for non-literal expressions (the skip cases)', () => {
    expect(classifyNativeDefault('nil')).toBeNull();
    expect(classifyNativeDefault('null')).toBeNull();
    expect(classifyNativeDefault('emptyList()')).toBeNull();
    expect(classifyNativeDefault('Modifier')).toBeNull();
    expect(classifyNativeDefault('CivLocale.t("comboboxNoResults")')).toBeNull();
    expect(classifyNativeDefault('')).toBeNull();
  });
});

describe('literalsEqual', () => {
  it('compares same-kind literals', () => {
    expect(literalsEqual({ kind: 'number', value: 0 }, { kind: 'number', value: 0 })).toBe(true);
    expect(literalsEqual({ kind: 'number', value: 0 }, { kind: 'number', value: 1 })).toBe(false);
    expect(literalsEqual({ kind: 'boolean', value: true }, { kind: 'boolean', value: false })).toBe(false);
  });

  it('treats numerically-equal number/string defaults as equal', () => {
    expect(literalsEqual({ kind: 'number', value: 2 }, { kind: 'string', value: '2' })).toBe(true);
    expect(literalsEqual({ kind: 'string', value: 'sm' }, { kind: 'number', value: 2 })).toBe(false);
  });
});

describe('sliceParamList', () => {
  it('extracts a balanced Swift init param list', () => {
    const src = `public init(label: String = "", count: Int = 3) { self.label = label }`;
    expect(sliceParamList(src, /\binit\s*\(/)).toBe('label: String = "", count: Int = 3');
  });

  it('handles nested parens (lambda types) in a Kotlin composable', () => {
    const src = `fun CivX(\n  a: Int = 0,\n  cb: ((String) -> Unit)? = null\n) {}`;
    const list = sliceParamList(src, /fun\s+CivX\s*\(/);
    expect(list).toContain('a: Int = 0');
    expect(list).toContain('cb: ((String) -> Unit)? = null');
  });
});

describe('splitTopLevel', () => {
  it('splits on top-level commas only', () => {
    expect(splitTopLevel('a: Int = 0, cb: ((String) -> Unit)? = null, b: String = "x,y"')).toEqual([
      'a: Int = 0',
      ' cb: ((String) -> Unit)? = null',
      ' b: String = "x,y"',
    ]);
  });
});

describe('parseParamDefaults', () => {
  it('maps param name -> raw default, skipping params without a default', () => {
    const m = parseParamDefaults('label: String, min: Int = 0, cb: (() -> Unit)? = null, tile: Bool = true');
    expect(m.get('min')).toBe('0');
    expect(m.get('tile')).toBe('true');
    expect(m.get('cb')).toBe('null');
    expect(m.has('label')).toBe(false); // no default
  });

  it('does not mistake a lambda arrow for the default assignment', () => {
    const m = parseParamDefaults('onChange: ((String) -> Unit)? = null');
    expect(m.get('onChange')).toBe('null');
  });
});

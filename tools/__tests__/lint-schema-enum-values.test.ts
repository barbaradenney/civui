/**
 * Tests for tools/lint-schema-enum-values.ts.
 *
 * Focus: the pure parsing helpers, and the cross-package alias
 * resolution added so a prop typed with a type imported from another
 * package (e.g. civ-select's `preset: SelectPresetName` from
 * @civui/core) is compared instead of silently skipped — the gap that
 * let the civ-select / radio-group / checkbox-group / relationship /
 * number enum drift through before.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  parseLiteralUnion,
  parseExportedTypeAliases,
  parseImportedTypeNames,
  collectExternalAliasMap,
  collectTsFiles,
  resolveTypeExpression,
} from '../lint-schema-enum-values.js';

const ROOT = join(import.meta.dirname, '..', '..');

describe('parseLiteralUnion', () => {
  it('parses a string-literal union', () => {
    expect(parseLiteralUnion("'a' | 'b' | 'c'")).toEqual(['a', 'b', 'c']);
  });

  it('parses an integer-literal union (stringified)', () => {
    expect(parseLiteralUnion('2 | 3 | 4')).toEqual(['2', '3', '4']);
  });

  it('returns null for a non-literal union member', () => {
    expect(parseLiteralUnion("'a' | SomeType")).toBeNull();
  });

  it('returns null for an empty body', () => {
    expect(parseLiteralUnion('')).toBeNull();
  });
});

describe('parseExportedTypeAliases', () => {
  it('captures only exported type aliases, not bare local types', () => {
    const src = `
      export type Public = 'a' | 'b';
      type Private = 'x' | 'y';
    `;
    const m = parseExportedTypeAliases(src);
    expect(m.get('Public')).toEqual(['a', 'b']);
    expect(m.has('Private')).toBe(false);
  });

  it('records non-literal exported types as null', () => {
    const m = parseExportedTypeAliases('export type Obj = { a: string };');
    expect(m.get('Obj')).toBeNull();
  });
});

describe('parseImportedTypeNames', () => {
  it('collects named + type-only imports and resolves `as` aliases', () => {
    const src = `
      import { Foo, Bar } from '@civui/core';
      import type { Baz, Qux as Local } from './x.js';
    `;
    const names = parseImportedTypeNames(src);
    expect(names.has('Foo')).toBe(true);
    expect(names.has('Bar')).toBe(true);
    expect(names.has('Baz')).toBe(true);
    expect(names.has('Local')).toBe(true); // the local alias, not Qux
    expect(names.has('Qux')).toBe(false);
  });
});

describe('collectExternalAliasMap', () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'enum-alias-'));
    writeFileSync(join(dir, 'a.ts'), `export type Color = 'red' | 'blue';`);
    // Identical definition in another file — should stay resolvable.
    writeFileSync(join(dir, 'b.ts'), `export type Color = 'blue' | 'red';`);
    // Conflicting definition for a different name — should be ambiguous (null).
    writeFileSync(join(dir, 'c.ts'), `export type Size = 'sm' | 'lg';`);
    writeFileSync(join(dir, 'd.ts'), `export type Size = 'tiny' | 'huge';`);
  });

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('keeps a name defined identically across files', () => {
    const map = collectExternalAliasMap(collectTsFiles(dir));
    expect(map.get('Color')).toEqual(['red', 'blue']);
  });

  it('marks conflicting definitions ambiguous (null)', () => {
    const map = collectExternalAliasMap(collectTsFiles(dir));
    expect(map.get('Size')).toBeNull();
  });

  it('resolves the real SelectPresetName union from @civui/core', () => {
    const map = collectExternalAliasMap([
      join(ROOT, 'packages/core/src/data/select-presets.ts'),
    ]);
    const presets = map.get('SelectPresetName');
    expect(presets).not.toBeNull();
    // The four presets that previously drifted out of the schemas.
    expect(presets).toContain('disability-type');
    expect(presets).toContain('citizenship-status');
    expect(presets).toContain('pay-frequency');
    expect(presets).toContain('contact-preference');
  });
});

describe('resolveTypeExpression with a merged (cross-package) alias map', () => {
  it('resolves an imported alias once merged into the alias map', () => {
    const aliases = new Map<string, string[] | null>([
      ['SelectPresetName', ['us-state', 'gender', 'pay-frequency']],
    ]);
    expect(resolveTypeExpression('SelectPresetName', aliases)).toEqual([
      'us-state', 'gender', 'pay-frequency',
    ]);
  });

  it('handles an alias extended with an empty-string literal', () => {
    const aliases = new Map<string, string[] | null>([['Foo', ['a', 'b']]]);
    expect(resolveTypeExpression("Foo | ''", aliases)).toEqual(['a', 'b', '']);
  });

  it('returns null for an unresolvable bare identifier', () => {
    expect(resolveTypeExpression('Mystery', new Map())).toBeNull();
  });
});

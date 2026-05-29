/**
 * Tests for tools/lint-schema-analytics-event.ts.
 */
import { describe, it, expect } from 'vitest';
import {
  sourceFiresAnalytics,
  schemaDeclaresAnalytics,
  findMissingAnalytics,
} from '../lint-schema-analytics-event.js';

describe('sourceFiresAnalytics', () => {
  it('detects a @fires civ-analytics JSDoc tag', () => {
    expect(sourceFiresAnalytics('/** @fires civ-analytics - x */')).toBe(true);
    expect(sourceFiresAnalytics(' * @fires  civ-analytics\n')).toBe(true);
  });
  it('is false when the tag is absent', () => {
    expect(sourceFiresAnalytics('/** @fires civ-change */')).toBe(false);
    expect(sourceFiresAnalytics('this.sendAnalytics("x")')).toBe(false);
  });
  it('does not match a different event with an analytics prefix', () => {
    expect(sourceFiresAnalytics('@fires civ-analytics-foo')).toBe(false);
  });
});

describe('schemaDeclaresAnalytics', () => {
  it('detects the event key in either quote style', () => {
    expect(schemaDeclaresAnalytics(`events: { 'civ-analytics': {} }`)).toBe(true);
    expect(schemaDeclaresAnalytics(`events: { "civ-analytics": {} }`)).toBe(true);
  });
  it('is false when absent', () => {
    expect(schemaDeclaresAnalytics(`events: { 'civ-change': {} }`)).toBe(false);
  });
});

describe('findMissingAnalytics', () => {
  const components = [
    { name: 'civ-a', source: 'a.ts' },
    { name: 'civ-b', source: 'b.ts' },
    { name: 'civ-c', source: 'c.ts' },
    { name: 'civ-d', source: 'd.ts' },
  ];
  const sources: Record<string, string> = {
    'a.ts': '/** @fires civ-analytics */',          // fires, schema missing → finding
    'b.ts': '/** @fires civ-analytics */',          // fires, schema has it → ok
    'c.ts': '/** @fires civ-change */',             // does not fire → ignored
    'd.ts': '/** @fires civ-analytics */',          // fires, no schema → ignored
  };
  const schemas: Record<string, string> = {
    'civ-a': `events: { 'civ-change': {} }`,
    'civ-b': `events: { 'civ-analytics': {} }`,
    'civ-c': `events: {}`,
    // civ-d intentionally absent
  };
  const read = (p: string) => sources[p] ?? null;
  const readSchema = (n: string) => schemas[n] ?? null;

  it('flags only components that fire it but whose schema omits it', () => {
    const found = findMissingAnalytics(components, read, readSchema);
    expect(found.map((f) => f.name)).toEqual(['civ-a']);
    expect(found[0].schemaPath).toContain('civ-a.schema.ts');
  });

  it('returns empty when every firing component declares the event', () => {
    const allOk = [{ name: 'civ-b', source: 'b.ts' }];
    expect(findMissingAnalytics(allOk, read, readSchema)).toEqual([]);
  });
});

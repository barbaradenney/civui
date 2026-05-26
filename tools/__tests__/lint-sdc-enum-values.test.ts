/**
 * Tests for tools/lint-sdc-enum-values.ts.
 *
 * The lint walks Drupal SDC YAMLs looking for `enum: [...]` arrays
 * inside each prop and compares them to the schema's `values:` array.
 * The hard parts are (a) the indentation-aware YAML walker, (b) the
 * literal-array parser that handles single-quoted strings,
 * double-quoted strings, and bare integers, and (c) ignoring `enum:`
 * lines outside the props.properties block (e.g. inside slots:).
 * These unit tests pin those.
 */
import { describe, it, expect } from 'vitest';
import { parseSdcEnums } from '../lint-sdc-enum-values.js';

describe('parseSdcEnums', () => {
  it('extracts a single-prop string enum', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      title: Variant
      type: string
      enum: ['primary', 'secondary']
`;
    const enums = parseSdcEnums(yaml);
    expect(enums.get('variant')).toEqual(['primary', 'secondary']);
    expect(enums.size).toBe(1);
  });

  it('extracts multiple prop enums', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      title: Variant
      type: string
      enum: ['a', 'b']
    intent:
      title: Intent
      type: string
      enum: ['info', 'warning', 'error']
`;
    const enums = parseSdcEnums(yaml);
    expect(enums.get('variant')).toEqual(['a', 'b']);
    expect(enums.get('intent')).toEqual(['info', 'warning', 'error']);
  });

  it('extracts integer enums (no quotes)', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    heading_level:
      title: Heading level
      type: integer
      enum: [2, 3, 4, 5, 6]
`;
    const enums = parseSdcEnums(yaml);
    expect(enums.get('heading_level')).toEqual(['2', '3', '4', '5', '6']);
  });

  it('handles double-quoted strings', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    mode:
      type: string
      enum: ["single", "multi"]
`;
    const enums = parseSdcEnums(yaml);
    expect(enums.get('mode')).toEqual(['single', 'multi']);
  });

  it('skips props that have no enum', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    label:
      title: Label
      type: string
      description: 'Free text'
    variant:
      title: Variant
      type: string
      enum: ['a', 'b']
`;
    const enums = parseSdcEnums(yaml);
    expect(enums.has('label')).toBe(false);
    expect(enums.get('variant')).toEqual(['a', 'b']);
  });

  it('ignores enum: inside slots:', () => {
    // The walker should stop at the props.properties boundary —
    // slot blocks can theoretically have their own enum-like keys
    // and we should not capture them as props.
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      type: string
      enum: ['a', 'b']
slots:
  default:
    title: Default
    enum: ['ignored']
`;
    const enums = parseSdcEnums(yaml);
    expect(enums.get('variant')).toEqual(['a', 'b']);
    expect(enums.has('default')).toBe(false);
  });

  it('returns empty map for YAML with no props block', () => {
    const yaml = `name: Foo
description: 'No props'

libraryOverrides:
  dependencies:
    - civui/civui
`;
    expect(parseSdcEnums(yaml).size).toBe(0);
  });

  it('returns empty map when props has no properties', () => {
    const yaml = `name: Foo
props:
  type: object
`;
    expect(parseSdcEnums(yaml).size).toBe(0);
  });

  it('handles empty enum arrays', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      type: string
      enum: []
`;
    expect(parseSdcEnums(yaml).get('variant')).toEqual([]);
  });

  it('skips malformed enum lines (non-array values)', () => {
    // If someone hand-writes `enum: primary` instead of `enum: [primary]`,
    // we shouldn't capture anything. (The lint will still flag the
    // schema-vs-yaml comparison, but parseSdcEnums itself should not
    // pretend a malformed line is an enum.)
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      type: string
      enum: primary
`;
    expect(parseSdcEnums(yaml).has('variant')).toBe(false);
  });

  it('skips arrays containing non-literal members', () => {
    // `enum: [VARIANT_PRIMARY, VARIANT_SECONDARY]` — bare identifiers
    // aren't valid YAML enum values for our purposes; return null
    // (i.e. drop the entry) rather than misinterpret.
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      type: string
      enum: [PRIMARY, SECONDARY]
`;
    expect(parseSdcEnums(yaml).has('variant')).toBe(false);
  });
});

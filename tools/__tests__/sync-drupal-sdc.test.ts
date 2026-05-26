/**
 * Tests for tools/sync-drupal-sdc.ts pure helpers.
 *
 * Focus: the prop-name resolution logic, since that determines whether
 * an existing SDC prop is recognized as already present (and skipped)
 * or duplicated.
 */

import { describe, it, expect } from 'vitest';
import {
  drupalKeyFor,
  existingDrupalProps,
  renderPropYaml,
  camelToSnake,
  mapPropBlocks,
  reconcileEnums,
} from '../sync-drupal-sdc.js';

describe('drupalKeyFor', () => {
  it('honors the schema\'s explicit attribute override (kebab → snake)', () => {
    const def = { type: 'string', attribute: 'validate' };
    expect(drupalKeyFor('validateType', def)).toBe('validate');
  });

  it('converts multi-word attributes from kebab-case to snake_case', () => {
    const def = { type: 'string', attribute: 'max-count' };
    expect(drupalKeyFor('maxCount', def)).toBe('max_count');
  });

  it('falls back to camel→snake when no attribute override is set', () => {
    expect(drupalKeyFor('hideMiddle', { type: 'boolean' })).toBe('hide_middle');
  });

  it('leaves all-lowercase names unchanged', () => {
    expect(drupalKeyFor('flavor', { type: 'string' })).toBe('flavor');
  });
});

describe('existingDrupalProps', () => {
  it('extracts top-level prop keys', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
    required:
      type: boolean
slots:
  default:
    title: Default
`;
    const names = [...existingDrupalProps(yaml)].sort();
    expect(names).toEqual(['label', 'required']);
  });

  it('does not flag a sibling top-level key as a prop', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
libraryOverrides:
  dependencies:
    - civui/civui
`;
    const names = [...existingDrupalProps(yaml)];
    expect(names).toEqual(['label']);
    expect(names).not.toContain('dependencies');
  });
});

describe('renderPropYaml', () => {
  it('emits the resolved drupal key (honoring attribute override) as the YAML key', () => {
    const yaml = renderPropYaml(
      'validateType',
      { type: 'string', attribute: 'validate', description: 'Validator preset' },
      '    ',
    );
    expect(yaml).toMatch(/^ {4}validate:/);
  });

  it('maps schema number → drupal integer', () => {
    const yaml = renderPropYaml('count', { type: 'number', description: 'A count' }, '    ');
    expect(yaml).toContain('type: integer');
  });

  it('emits an enum line for enum types, with empty values filtered out', () => {
    const yaml = renderPropYaml(
      'tone',
      { type: 'enum', values: ['default', 'crisis', ''], description: 'Tone' },
      '    ',
    );
    expect(yaml).toMatch(/enum: \['default', 'crisis'\]/);
  });

  it('quotes string defaults with single quotes', () => {
    const yaml = renderPropYaml('size', { type: 'string', default: 'md', description: 'Size' }, '    ');
    expect(yaml).toContain("default: 'md'");
  });

  it('emits boolean and number defaults raw (no quotes)', () => {
    const boolYaml = renderPropYaml('disabled', { type: 'boolean', default: true, description: 'D' }, '    ');
    const numYaml = renderPropYaml('count', { type: 'number', default: 5, description: 'C' }, '    ');
    expect(boolYaml).toContain('default: true');
    expect(numYaml).toContain('default: 5');
    // Neither value should be wrapped in quotes (only string defaults are).
    expect(boolYaml).not.toContain("default: 'true'");
    expect(numYaml).not.toContain("default: '5'");
  });

  it('omits the default line for an empty array (invalid YAML otherwise)', () => {
    const yaml = renderPropYaml('slots', { type: 'array', default: [], description: 'S' }, '    ');
    expect(yaml).not.toContain('default:');
  });

  it('emits a non-empty array default as a YAML flow sequence', () => {
    const yaml = renderPropYaml(
      'frequencies',
      { type: 'array', default: ['weekly', 'monthly'], description: 'F' },
      '    ',
    );
    expect(yaml).toContain("default: ['weekly', 'monthly']");
  });
});

describe('camelToSnake (sync-drupal-sdc)', () => {
  it('mirrors the schema-parity copy', () => {
    expect(camelToSnake('weekStartsOn')).toBe('week_starts_on');
    expect(camelToSnake('flavor')).toBe('flavor');
  });
});

describe('mapPropBlocks', () => {
  it('returns { start, end } line ranges for each prop inside the properties block', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      title: Variant
      type: string
    intent:
      title: Intent
      type: string
      enum: ['info', 'warning']
`;
    const blocks = mapPropBlocks(yaml);
    expect(blocks.size).toBe(2);
    expect(blocks.get('variant')).toEqual({ start: 4, end: 6 });
    expect(blocks.get('intent')).toEqual({ start: 7, end: 10 });
  });

  it('closes the last block at the file boundary', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    lonely:
      title: Lonely
      type: string`;
    const blocks = mapPropBlocks(yaml);
    expect(blocks.get('lonely')).toEqual({ start: 4, end: 6 });
  });

  it('stops at the first non-properties top-level key', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      type: string
slots:
  default:
    title: Default
`;
    const blocks = mapPropBlocks(yaml);
    expect(blocks.size).toBe(1);
    expect(blocks.get('variant')).toBeDefined();
    expect(blocks.has('default')).toBe(false);
  });
});

describe('reconcileEnums', () => {
  function schemaProp(values: (string | number)[] | undefined): any {
    return values === undefined
      ? { type: 'enum' }
      : { type: 'enum', values };
  }

  it('adds an enum line when the YAML prop has no enum and the schema declares values', () => {
    const yaml = `props:
  type: object
  properties:
    variant:
      title: Variant
      type: string
      description: 'Visual variant'
`;
    const result = reconcileEnums(yaml, {
      variant: schemaProp(['a', 'b', 'c']),
    });
    expect(result.yaml).toContain("enum: ['a', 'b', 'c']");
    expect(result.changes).toEqual(['variant: added enum']);
    // Inserted after the `type:` line, before `description:`.
    const lines = result.yaml.split('\n');
    expect(lines.findIndex((l) => l.includes('enum:'))).toBeGreaterThan(
      lines.findIndex((l) => l.includes('type:')),
    );
    expect(lines.findIndex((l) => l.includes('enum:'))).toBeLessThan(
      lines.findIndex((l) => l.includes('description:')),
    );
  });

  it('updates an existing enum line when values differ', () => {
    const yaml = `props:
  type: object
  properties:
    intent:
      title: Intent
      type: string
      enum: ['info', 'warning']
      description: 'old'
`;
    const result = reconcileEnums(yaml, {
      intent: schemaProp(['info', 'success', 'warning', 'error']),
    });
    expect(result.yaml).toContain("enum: ['info', 'success', 'warning', 'error']");
    expect(result.yaml).not.toContain("enum: ['info', 'warning']");
    expect(result.changes).toEqual(['intent: updated enum']);
  });

  it('is a no-op when the YAML already matches the schema', () => {
    const yaml = `props:
  type: object
  properties:
    intent:
      title: Intent
      type: string
      enum: ['info', 'warning', 'error']
`;
    const result = reconcileEnums(yaml, {
      intent: schemaProp(['info', 'warning', 'error']),
    });
    expect(result.changes).toEqual([]);
    expect(result.yaml).toBe(yaml);
  });

  it('filters out the empty-string sentinel from schema values', () => {
    const yaml = `props:
  type: object
  properties:
    variant:
      title: Variant
      type: string
      enum: ['', 'chip', 'inline']
`;
    const result = reconcileEnums(yaml, {
      variant: schemaProp(['', 'chip', 'inline']),
    });
    expect(result.yaml).toContain("enum: ['chip', 'inline']");
    expect(result.changes).toEqual(['variant: updated enum']);
  });

  it('renders integer enum values without quotes', () => {
    const yaml = `props:
  type: object
  properties:
    heading_level:
      title: Heading level
      type: integer
`;
    const result = reconcileEnums(yaml, {
      headingLevel: { type: 'enum', values: [2, 3, 4, 5, 6] },
    });
    expect(result.yaml).toContain('enum: [2, 3, 4, 5, 6]');
  });

  it('does NOT remove an existing enum line when the schema drops values', () => {
    // Conservative behavior — over-constraining is acceptable, but
    // accidentally widening the YAML would let bad authoring through.
    const yaml = `props:
  type: object
  properties:
    variant:
      type: string
      enum: ['a', 'b']
`;
    const result = reconcileEnums(yaml, {
      variant: { type: 'enum' }, // no values
    });
    expect(result.yaml).toContain("enum: ['a', 'b']");
    expect(result.changes).toEqual([]);
  });

  it('skips webOnly props', () => {
    const yaml = `props:
  type: object
  properties:
    foo:
      type: string
`;
    const result = reconcileEnums(yaml, {
      foo: { type: 'enum', values: ['a', 'b'], webOnly: true },
    });
    expect(result.changes).toEqual([]);
  });

  it('skips props absent from the YAML (left to the append pass)', () => {
    const yaml = `props:
  type: object
  properties:
    other:
      type: string
`;
    const result = reconcileEnums(yaml, {
      missing: schemaProp(['a', 'b']),
    });
    expect(result.changes).toEqual([]);
  });

  it('handles multiple props in one pass', () => {
    const yaml = `props:
  type: object
  properties:
    a:
      title: A
      type: string
    b:
      title: B
      type: string
      enum: ['x']
    c:
      title: C
      type: string
`;
    const result = reconcileEnums(yaml, {
      a: schemaProp(['1', '2']),
      b: schemaProp(['x', 'y']),
      c: schemaProp(['p']),
    });
    expect(result.changes.sort()).toEqual([
      'a: added enum',
      'b: updated enum',
      'c: added enum',
    ]);
    expect(result.yaml).toContain("enum: ['1', '2']");
    expect(result.yaml).toContain("enum: ['x', 'y']");
    expect(result.yaml).toContain("enum: ['p']");
  });
});

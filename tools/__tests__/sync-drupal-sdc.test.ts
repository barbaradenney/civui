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
    expect(drupalKeyFor('showMiddle', { type: 'boolean' })).toBe('show_middle');
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
});

describe('camelToSnake (sync-drupal-sdc)', () => {
  it('mirrors the schema-parity copy', () => {
    expect(camelToSnake('weekStartsOn')).toBe('week_starts_on');
    expect(camelToSnake('flavor')).toBe('flavor');
  });
});

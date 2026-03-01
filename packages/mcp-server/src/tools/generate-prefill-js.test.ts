import { describe, it, expect } from 'vitest';
import { generatePrefillJs } from './generate-prefill-js.js';
import type { FormSchema } from '../schema/index.js';

describe('generatePrefillJs', () => {
  const schema: FormSchema = {
    sections: [
      {
        fields: [
          { type: 'text', name: 'first-name', label: 'First name' },
          { type: 'email', name: 'email', label: 'Email' },
          { type: 'radio', name: 'status', label: 'Status', options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]},
        ],
      },
    ],
  };

  it('generates JS that sets text field values', () => {
    const result = generatePrefillJs(schema, { 'first-name': 'John', email: 'john@example.com' });
    expect(result.javascript).toContain('"first-name":"John"');
    expect(result.javascript).toContain('"email":"john@example.com"');
    expect(result.fieldCount).toBe(2);
  });

  it('handles radio/checkbox value assignment in generated JS', () => {
    const result = generatePrefillJs(schema, { status: 'active' });
    expect(result.javascript).toContain('civ-radio-group');
    expect(result.javascript).toContain('civ-radio[value=');
    expect(result.javascript).toContain('setAttribute');
  });

  it('includes civSerializeForm function', () => {
    const result = generatePrefillJs(schema, { 'first-name': 'Jane' });
    expect(result.javascript).toContain('window.civSerializeForm');
    expect(result.javascript).toContain('civ-checkbox-group');
    expect(result.javascript).toContain('civ-checkbox[checked]');
  });

  it('returns empty repeatableKeys when no repeatable sections', () => {
    const result = generatePrefillJs(schema, { 'first-name': 'X' });
    expect(result.repeatableKeys).toEqual([]);
  });

  it('returns repeatableKeys for repeatable sections', () => {
    const repeatableSchema: FormSchema = {
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'deps',
          fields: [{ type: 'text', name: 'dep-name', label: 'Name' }],
        },
      ],
    };
    const result = generatePrefillJs(repeatableSchema, { 'deps[0].dep-name': 'Alice' });
    expect(result.repeatableKeys).toEqual(['deps']);
    expect(result.fieldCount).toBe(1);
  });

  it('handles empty values object', () => {
    const result = generatePrefillJs(schema, {});
    expect(result.fieldCount).toBe(0);
    expect(result.javascript).toContain('var values = {}');
  });
});

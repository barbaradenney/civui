import { describe, it, expect } from 'vitest';
import { validateSchema } from './validate-schema.js';
import type { FormSchema } from '../schema/index.js';

const minimal: FormSchema = {
  title: 'Test Form',
  sections: [
    {
      heading: 'Section 1',
      fields: [
        { type: 'text', name: 'first-name', label: 'First name' },
        { type: 'email', name: 'email', label: 'Email' },
      ],
    },
  ],
};

describe('validateSchema', () => {
  it('returns valid for a correct minimal schema', () => {
    const result = validateSchema(minimal);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.fieldCount).toBe(2);
    expect(result.sectionCount).toBe(1);
  });

  it('detects duplicate field names across sections', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'dup', label: 'A' }] },
        { fields: [{ type: 'text', name: 'dup', label: 'B' }] },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('Duplicate field name "dup"');
    expect(result.errors[0].path).toBe('sections[1].fields[0]');
  });

  it('detects duplicate field names in children', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'parent',
              label: 'Parent',
              children: [{ type: 'text', name: 'child', label: 'Child' }],
            },
            { type: 'text', name: 'child', label: 'Another child' },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Duplicate field name "child"'))).toBe(true);
  });

  it('detects select missing options', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'select', name: 'state', label: 'State' }] },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('requires options');
  });

  it('allows select with optionsFrom instead of options', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'country', label: 'Country' },
            {
              type: 'select',
              name: 'state',
              label: 'State',
              optionsFrom: {
                field: 'country',
                map: { US: [{ value: 'CA', label: 'California' }] },
              },
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.errors.filter((e) => e.message.includes('requires options'))).toHaveLength(0);
  });

  it('detects radio, combobox, checkbox-group missing options', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'radio', name: 'choice', label: 'Choice' },
            { type: 'combobox', name: 'search', label: 'Search' },
            { type: 'checkbox-group', name: 'items', label: 'Items' },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.errors).toHaveLength(3);
  });

  it('detects number field with min > max', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'number', name: 'age', label: 'Age', min: '100', max: '5' },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('min (100) > max (5)');
  });

  it('detects visibleWhen referencing unknown field', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'answer',
              label: 'Answer',
              visibleWhen: { field: 'nonexistent', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('unknown field "nonexistent"');
    expect(result.errors[0].path).toContain('visibleWhen');
  });

  it('detects requiredWhen referencing unknown field', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'answer',
              label: 'Answer',
              requiredWhen: { field: 'ghost', operator: 'exists' },
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('unknown field "ghost"');
    expect(result.errors[0].path).toContain('requiredWhen');
  });

  it('detects section visibleWhen referencing unknown field', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [{ type: 'text', name: 'a', label: 'A' }],
          visibleWhen: { field: 'missing', operator: 'eq', value: 'x' },
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe('sections[0].visibleWhen');
  });

  it('detects optionsFrom referencing unknown field', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'select',
              name: 'city',
              label: 'City',
              optionsFrom: {
                field: 'nonexistent',
                map: { a: [{ value: 'b', label: 'B' }] },
              },
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.errors.some((e) => e.path.includes('optionsFrom'))).toBe(true);
  });

  it('detects crossFieldRules condition referencing unknown field', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'a', label: 'A' }] },
      ],
      crossFieldRules: [
        {
          id: 'r1',
          description: 'test',
          when: { field: 'unknown', operator: 'eq', value: 'x' },
          then: { action: 'require', targets: ['a'] },
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe('crossFieldRules[0].when');
  });

  it('detects crossFieldRules targeting unknown field', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'a', label: 'A' }] },
      ],
      crossFieldRules: [
        {
          id: 'r1',
          description: 'test',
          when: { field: 'a', operator: 'eq', value: 'x' },
          then: { action: 'show', targets: ['ghost'] },
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe('crossFieldRules[0].then.targets');
  });

  it('warns when steps count mismatches distinct section step values', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'a', label: 'A' }], step: 0 },
        { fields: [{ type: 'text', name: 'b', label: 'B' }], step: 1 },
      ],
      steps: [
        { title: 'Step 1' },
        { title: 'Step 2' },
        { title: 'Step 3' },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(true); // warnings don't affect validity
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].path).toBe('steps');
  });

  it('detects workflow transition referencing unknown state', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
      actors: [{ id: 'clerk', label: 'Clerk' }],
      workflow: {
        initialState: 'draft',
        states: [{ id: 'draft', label: 'Draft' }],
        transitions: [
          { from: 'draft', to: 'nowhere', actor: 'clerk', label: 'Submit' },
        ],
      },
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('unknown state "nowhere"'))).toBe(true);
  });

  it('detects workflow transition referencing unknown actor', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
      actors: [{ id: 'clerk', label: 'Clerk' }],
      workflow: {
        initialState: 'draft',
        states: [
          { id: 'draft', label: 'Draft' },
          { id: 'submitted', label: 'Submitted' },
        ],
        transitions: [
          { from: 'draft', to: 'submitted', actor: 'ghost', label: 'Submit' },
        ],
      },
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('unknown actor "ghost"'))).toBe(true);
  });

  it('detects formChain dependsOn referencing unknown schemaRef', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
      formChain: {
        forms: [
          { schemaRef: 'form-a', label: 'Form A' },
          { schemaRef: 'form-b', label: 'Form B', dependsOn: ['form-z'] },
        ],
      },
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe('formChain.forms[1].dependsOn');
    expect(result.errors[0].message).toContain('unknown schemaRef "form-z"');
  });

  it('detects dataTable showTotals referencing non-numeric column', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
      dataTable: {
        caption: 'Budget',
        columns: [
          { id: 'desc', label: 'Description', type: 'text' },
          { id: 'amount', label: 'Amount', type: 'number' },
        ],
        showTotals: ['desc'],
      },
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('non-numeric column "desc"');
  });

  it('detects missing options in nested child fields', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'parent',
              label: 'Parent',
              children: [
                { type: 'select', name: 'child-select', label: 'Child select' },
              ],
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toContain('children[0]');
    expect(result.errors[0].message).toContain('requires options');
  });

  it('detects visibleWhen referencing unknown field in children', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'parent',
              label: 'Parent',
              children: [
                {
                  type: 'text',
                  name: 'child',
                  label: 'Child',
                  visibleWhen: { field: 'ghost', operator: 'eq', value: 'x' },
                },
              ],
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toContain('children[0].visibleWhen');
  });

  it('handles compound conditions in visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            {
              type: 'text',
              name: 'b',
              label: 'B',
              visibleWhen: {
                allOf: [
                  { field: 'a', operator: 'eq', value: 'yes' },
                  { field: 'missing', operator: 'exists' },
                ],
              },
            },
          ],
        },
      ],
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('unknown field "missing"');
  });
});

import { describe, it, expect } from 'vitest';
import { inlineSubForms } from './inline-sub-forms.js';
import type { FormSchema } from '../schema/index.js';

function baseSchema(): FormSchema {
  return {
    sections: [
      {
        heading: 'Main',
        fields: [
          { type: 'text', name: 'full-name', label: 'Full name', required: true },
        ],
      },
    ],
  };
}

function schemaWithSubForm(): FormSchema {
  return {
    sections: [
      {
        heading: 'Main',
        fields: [
          { type: 'text', name: 'full-name', label: 'Full name', required: true },
        ],
      },
      {
        ref: 'address',
        namespace: 'home',
        fields: [],
      },
    ],
    subForms: {
      address: {
        description: 'Address information',
        fields: [
          { type: 'text', name: 'street', label: 'Street', required: true },
          { type: 'text', name: 'city', label: 'City', required: true },
          { type: 'zip', name: 'zip', label: 'ZIP code' },
        ],
      },
    },
  };
}

describe('inlineSubForms', () => {
  it('passes through schema with no subForms', () => {
    const result = inlineSubForms(baseSchema());
    expect(result.inlinedCount).toBe(0);
    expect(result.namespacedFields).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.schema.subForms).toBeUndefined();
  });

  it('inlines a single subForm ref', () => {
    const result = inlineSubForms(schemaWithSubForm());
    expect(result.inlinedCount).toBe(1);
    expect(result.schema.subForms).toBeUndefined();
    expect(result.schema.sections).toHaveLength(2);

    // Second section should have prefixed fields
    const inlined = result.schema.sections[1];
    expect(inlined.ref).toBeUndefined();
    expect(inlined.fields).toHaveLength(3);
    expect(inlined.fields[0].name).toBe('home.street');
    expect(inlined.fields[1].name).toBe('home.city');
    expect(inlined.fields[2].name).toBe('home.zip');
  });

  it('tracks namespaced field names', () => {
    const result = inlineSubForms(schemaWithSubForm());
    expect(result.namespacedFields).toContain('home.street');
    expect(result.namespacedFields).toContain('home.city');
    expect(result.namespacedFields).toContain('home.zip');
  });

  it('uses ref as namespace when no namespace specified', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'contact', fields: [] },
      ],
      subForms: {
        contact: {
          fields: [
            { type: 'email', name: 'email', label: 'Email' },
          ],
        },
      },
    };
    const result = inlineSubForms(schema);
    expect(result.schema.sections[0].fields[0].name).toBe('contact.email');
  });

  it('handles multiple refs to same subForm with different namespaces', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'address', namespace: 'home', fields: [] },
        { ref: 'address', namespace: 'work', fields: [] },
      ],
      subForms: {
        address: {
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
          ],
        },
      },
    };
    const result = inlineSubForms(schema);
    expect(result.inlinedCount).toBe(2);
    expect(result.schema.sections[0].fields[0].name).toBe('home.street');
    expect(result.schema.sections[1].fields[0].name).toBe('work.street');
  });

  it('warns on missing subForm ref', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'nonexistent', fields: [] },
      ],
      subForms: {},
    };
    const result = inlineSubForms(schema);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('nonexistent');
    expect(result.inlinedCount).toBe(0);
  });

  it('prefixes visibleWhen conditions on fields', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'details', namespace: 'app', fields: [] },
      ],
      subForms: {
        details: {
          fields: [
            {
              type: 'text',
              name: 'other',
              label: 'Other',
              visibleWhen: { field: 'reason', operator: 'eq', value: 'other' },
            },
          ],
        },
      },
    };
    const result = inlineSubForms(schema);
    const field = result.schema.sections[0].fields[0];
    expect(field.name).toBe('app.other');
    expect(field.visibleWhen).toEqual({
      field: 'app.reason',
      operator: 'eq',
      value: 'other',
    });
  });

  it('prefixes requiredWhen conditions on fields', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'details', namespace: 'app', fields: [] },
      ],
      subForms: {
        details: {
          fields: [
            {
              type: 'text',
              name: 'phone',
              label: 'Phone',
              requiredWhen: { field: 'contact-method', operator: 'eq', value: 'phone' },
            },
          ],
        },
      },
    };
    const result = inlineSubForms(schema);
    const field = result.schema.sections[0].fields[0];
    expect(field.name).toBe('app.phone');
    expect(field.requiredWhen).toEqual({
      field: 'app.contact-method',
      operator: 'eq',
      value: 'phone',
    });
  });

  it('prefixes children fields', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'group', namespace: 'g', fields: [] },
      ],
      subForms: {
        group: {
          fields: [
            {
              type: 'radio',
              name: 'choice',
              label: 'Pick one',
              options: [
                { value: 'a', label: 'A' },
                { value: 'b', label: 'B' },
              ],
              children: [
                { type: 'text', name: 'child-a', label: 'Child A' },
              ],
            },
          ],
        },
      },
    };
    const result = inlineSubForms(schema);
    const field = result.schema.sections[0].fields[0];
    expect(field.name).toBe('g.choice');
    expect(field.children![0].name).toBe('g.child-a');
    expect(result.namespacedFields).toContain('g.child-a');
  });

  it('preserves cross-field rules from parent schema', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { ref: 'sub', namespace: 'ns', fields: [] },
      ],
      subForms: {
        sub: {
          fields: [{ type: 'text', name: 'b', label: 'B' }],
        },
      },
      crossFieldRules: [
        {
          id: 'rule-1',
          description: 'Test rule',
          when: { field: 'a', operator: 'exists' },
          then: { action: 'require', targets: ['ns.b'] },
        },
      ],
    };
    const result = inlineSubForms(schema);
    expect(result.schema.crossFieldRules).toHaveLength(1);
    expect(result.schema.crossFieldRules![0].then.targets).toContain('ns.b');
  });

  it('warns when ref sections exist but no subForms defined', () => {
    const schema: FormSchema = {
      sections: [
        { ref: 'missing', fields: [] },
      ],
    };
    const result = inlineSubForms(schema);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('missing');
  });
});

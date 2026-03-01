import { describe, it, expect } from 'vitest';
import { composeForms } from './compose-forms.js';
import type { FormSchema } from '../schema/index.js';

describe('composeForms', () => {
  const baseSchema: FormSchema = {
    title: 'Main Form',
    sections: [
      {
        heading: 'Personal Info',
        fields: [
          { type: 'text', name: 'first-name', label: 'First name' },
          { type: 'text', name: 'last-name', label: 'Last name' },
        ],
      },
    ],
  };

  it('merges two schemas with namespaces (no collisions)', () => {
    const secondary: FormSchema = {
      sections: [
        {
          heading: 'Address',
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
            { type: 'text', name: 'city', label: 'City' },
          ],
        },
      ],
    };

    const result = composeForms(baseSchema, {
      addr: { schema: secondary, namespace: 'mailing' },
    });

    expect(result.namespaces).toEqual(['mailing']);
    expect(result.schema.sections).toHaveLength(2);
    expect(result.schema.sections[1].fields[0].name).toBe('mailing.street');
    expect(result.schema.sections[1].fields[1].name).toBe('mailing.city');
    expect(result.fieldCount).toBe(4);
  });

  it('resolves ref sections from subForms dictionary', () => {
    const schemaWithRef: FormSchema = {
      sections: [
        {
          heading: 'Mailing address',
          ref: 'address',
          namespace: 'mailing',
          fields: [],
        },
        {
          heading: 'Billing address',
          ref: 'address',
          namespace: 'billing',
          fields: [],
        },
      ],
      subForms: {
        address: {
          description: 'Shared address fields',
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
            { type: 'zip', name: 'zip', label: 'ZIP code' },
          ],
        },
      },
    };

    const result = composeForms(schemaWithRef);

    expect(result.resolvedRefs).toEqual(['address', 'address']);
    expect(result.schema.sections[0].fields[0].name).toBe('mailing.street');
    expect(result.schema.sections[1].fields[0].name).toBe('billing.street');
    expect(result.fieldCount).toBe(4);
  });

  it('detects name collisions when two schemas share a field name after prefixing', () => {
    const schemaWithDup: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
          ],
        },
        {
          fields: [
            { type: 'text', name: 'street', label: 'Street again' },
          ],
        },
      ],
    };

    expect(() => composeForms(schemaWithDup)).toThrow('Name collision after composition: street');
  });

  it('does not throw when namespace avoids collision', () => {
    const secondary: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'first-name', label: 'First name' },
          ],
        },
      ],
    };

    // Namespace prefix makes it "mailing.first-name" so no collision
    expect(() =>
      composeForms(baseSchema, {
        sub: { schema: secondary, namespace: 'mailing' },
      }),
    ).not.toThrow();
  });

  it('prefixes cross-field rule field references', () => {
    const secondary: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'radio', name: 'status', label: 'Status', options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ] },
          ],
        },
      ],
      crossFieldRules: [
        {
          id: 'status-requires-date',
          description: 'Active status requires start date',
          when: { field: 'status', operator: 'eq', value: 'active' },
          then: { action: 'require', targets: ['start-date'] },
        },
      ],
    };

    const result = composeForms(baseSchema, {
      sub: { schema: secondary, namespace: 'employment' },
    });

    expect(result.schema.crossFieldRules).toHaveLength(1);
    expect(result.schema.crossFieldRules![0].when.field).toBe('employment.status');
    expect(result.schema.crossFieldRules![0].then.targets[0]).toBe('employment.start-date');
    expect(result.schema.crossFieldRules![0].id).toBe('employment.status-requires-date');
  });

  it('handles missing/empty subForms gracefully', () => {
    const result = composeForms(baseSchema);
    expect(result.schema.sections).toHaveLength(1);
    expect(result.namespaces).toEqual([]);
    expect(result.resolvedRefs).toEqual([]);
    expect(result.fieldCount).toBe(2);
  });

  it('prefixes visibleWhen and requiredWhen field references during composition', () => {
    const secondary: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'radio', name: 'married', label: 'Married?', options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ] },
            {
              type: 'text',
              name: 'spouse-name',
              label: 'Spouse name',
              visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
              requiredWhen: { field: 'married', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };

    const result = composeForms(baseSchema, {
      spouse: { schema: secondary, namespace: 'household' },
    });

    const spouseField = result.schema.sections[1].fields[1];
    expect(spouseField.name).toBe('household.spouse-name');
    expect(spouseField.visibleWhen!.field).toBe('household.married');
    expect(spouseField.requiredWhen!.field).toBe('household.married');
  });

  it('handles schema with ref to missing subForm', () => {
    const schemaWithBadRef: FormSchema = {
      sections: [
        {
          heading: 'Missing ref',
          ref: 'nonexistent',
          fields: [{ type: 'text', name: 'fallback', label: 'Fallback' }],
        },
      ],
    };

    const result = composeForms(schemaWithBadRef);
    // Section is kept as-is when ref can't be resolved
    expect(result.schema.sections[0].fields[0].name).toBe('fallback');
    expect(result.resolvedRefs).toEqual([]);
  });

  // ---- Compound condition prefixing ----

  it('prefixes field references in compound conditions recursively', () => {
    const ext: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'income',
              label: 'Income',
              visibleWhen: {
                allOf: [
                  { field: 'employed', operator: 'eq', value: 'yes' },
                  {
                    anyOf: [
                      { field: 'filing', operator: 'eq', value: 'joint' },
                      { field: 'filing', operator: 'eq', value: 'single' },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = composeForms(
      { sections: [] },
      { tax: { schema: ext, namespace: 'tax' } },
    );

    const field = result.schema.sections[0].fields[0];
    expect(field.name).toBe('tax.income');
    const vw = field.visibleWhen as any;
    expect(vw.allOf[0].field).toBe('tax.employed');
    expect(vw.allOf[1].anyOf[0].field).toBe('tax.filing');
    expect(vw.allOf[1].anyOf[1].field).toBe('tax.filing');
  });

  // ---- Section visibleWhen prefixing ----

  it('prefixes section visibleWhen when composing with namespace', () => {
    const ext: FormSchema = {
      sections: [
        {
          heading: 'Spouse',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [
            { type: 'text', name: 'spouse-name', label: 'Spouse name' },
          ],
        },
      ],
    };

    const result = composeForms(
      { sections: [] },
      { partner: { schema: ext, namespace: 'partner' } },
    );

    const section = result.schema.sections[0];
    expect(section.visibleWhen).toEqual({
      field: 'partner.married',
      operator: 'eq',
      value: 'yes',
    });
  });
});

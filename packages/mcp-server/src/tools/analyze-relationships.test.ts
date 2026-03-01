import { describe, it, expect } from 'vitest';
import { analyzeRelationships } from './analyze-relationships.js';
import type { FormSchema } from '../schema/index.js';

describe('analyzeRelationships', () => {
  it('extracts entities from sections with headings', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Personal Information',
          fields: [
            { type: 'text', name: 'first-name', label: 'First name' },
            { type: 'text', name: 'last-name', label: 'Last name' },
          ],
        },
        {
          heading: 'Mailing Address',
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
            { type: 'zip', name: 'zip', label: 'ZIP code' },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    expect(result.entities).toHaveLength(2);
    expect(result.entities[0].name).toBe('Personal Information');
    expect(result.entities[1].name).toBe('Mailing Address');
  });

  it('detects one-to-many from repeatable sections', () => {
    const schema: FormSchema = {
      title: 'Benefits Application',
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'dependents',
          fields: [
            { type: 'text', name: 'name', label: 'Dependent name' },
            { type: 'text', name: 'relationship', label: 'Relationship' },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    const oneToMany = result.relationships.filter((r) => r.type === 'one-to-many');
    expect(oneToMany).toHaveLength(1);
    expect(oneToMany[0].from).toBe('Benefits Application');
    expect(oneToMany[0].to).toBe('Dependents');
  });

  it('detects conditional relationships from visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'spouse-name',
              label: 'Spouse name',
              visibleWhen: { field: 'marital-status', operator: 'eq', value: 'married' },
            },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    const conditional = result.relationships.filter((r) => r.type === 'conditional');
    expect(conditional).toHaveLength(1);
    expect(conditional[0].from).toBe('marital-status');
    expect(conditional[0].to).toBe('spouse-name');
  });

  it('infers entity types from field name patterns', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Applicant',
          fields: [
            { type: 'text', name: 'first-name', label: 'First name' },
            { type: 'text', name: 'last-name', label: 'Last name' },
            { type: 'ssn', name: 'ssn', label: 'SSN' },
          ],
        },
        {
          heading: 'Home Address',
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
            { type: 'text', name: 'city', label: 'City' },
            { type: 'zip', name: 'zip', label: 'ZIP' },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    expect(result.entities[0].type).toBe('person');
    expect(result.entities[1].type).toBe('address');
  });

  it('uses explicit entityType when set', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Custom Entity',
          fields: [
            { type: 'text', name: 'foo', label: 'Foo', entityType: 'vehicle' },
            { type: 'text', name: 'bar', label: 'Bar' },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    expect(result.entities[0].type).toBe('vehicle');
  });

  it('produces readable summary text', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'deps',
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
          ],
        },
        {
          heading: 'Info',
          fields: [
            {
              type: 'text',
              name: 'extra',
              label: 'Extra',
              visibleWhen: { field: 'show-extra', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    expect(result.summary).toContain('2 entities identified');
    expect(result.summary).toContain('1 one-to-many relationship');
    expect(result.summary).toContain('1 conditional dependency');
  });

  it('handles schema with no relationships gracefully', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Full name' },
          ],
        },
      ],
    };

    const result = analyzeRelationships(schema);
    expect(result.entities).toHaveLength(1);
    expect(result.relationships).toHaveLength(0);
    expect(result.summary).toContain('No relationships detected');
  });

  it('detects cross-field rule relationships', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'vet-dates',
          description: 'Veterans must provide service dates',
          when: { field: 'is-veteran', operator: 'eq', value: 'yes' },
          then: { action: 'require', targets: ['service-start', 'service-end'] },
        },
      ],
    };

    const result = analyzeRelationships(schema);
    const crossField = result.relationships.filter((r) => r.type === 'cross-field');
    expect(crossField).toHaveLength(2);
    expect(crossField[0].from).toBe('is-veteran');
    expect(crossField[0].to).toBe('service-start');
  });
});

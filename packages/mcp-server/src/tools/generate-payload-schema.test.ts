import { describe, it, expect } from 'vitest';
import { generatePayloadSchema } from './generate-payload-schema.js';
import type { FormSchema } from '../schema/index.js';

describe('generatePayloadSchema', () => {
  it('generates flat properties for a simple form', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'full-name', label: 'Full name', required: true },
          { type: 'email', name: 'email', label: 'Email' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.schema.properties).toHaveProperty('full-name');
    expect(result.schema.properties).toHaveProperty('email');
    expect((result.schema as Record<string, unknown>).required).toContain('full-name');
    expect(result.fieldCount).toBe(2);
  });

  it('generates array shape for repeatable sections', () => {
    const schema: FormSchema = {
      sections: [{
        heading: 'Dependents',
        repeatable: true,
        repeatableKey: 'dependents',
        repeatableMin: 1,
        repeatableMax: 10,
        fields: [
          { type: 'text', name: 'first-name', label: 'First name', required: true },
          { type: 'text', name: 'last-name', label: 'Last name' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.dependents.type).toBe('array');
    expect(props.dependents.minItems).toBe(1);
    expect(props.dependents.maxItems).toBe(10);
    // Example should be an array
    expect(Array.isArray(result.example.dependents)).toBe(true);
  });

  it('generates nested object for namespaced sections', () => {
    const schema: FormSchema = {
      sections: [{
        heading: 'Mailing Address',
        namespace: 'mailing',
        fields: [
          { type: 'text', name: 'street', label: 'Street' },
          { type: 'text', name: 'city', label: 'City' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.mailing.type).toBe('object');
    expect(result.example).toHaveProperty('mailing');
    expect((result.example.mailing as Record<string, unknown>).street).toBeDefined();
  });

  it('marks required fields in JSON Schema', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'name', label: 'Name', required: true },
          { type: 'text', name: 'note', label: 'Note' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect((result.schema as Record<string, unknown>).required).toContain('name');
    expect((result.schema as Record<string, unknown>).required).not.toContain('note');
  });

  it('generates TypeScript output with correct types', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'name', label: 'Name', required: true },
          { type: 'number', name: 'age', label: 'Age' },
          { type: 'checkbox', name: 'agree', label: 'Agree' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.typescript).toContain('name: string');
    expect(result.typescript).toContain('age?: number');
    expect(result.typescript).toContain('agree?: boolean');
    expect(result.typescript).toContain('FormPayload');
  });

  it('generates correct example values per type', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'name', label: 'Name' },
          { type: 'email', name: 'email', label: 'Email' },
          { type: 'ssn', name: 'ssn', label: 'SSN' },
          { type: 'number', name: 'age', label: 'Age' },
          { type: 'date', name: 'start', label: 'Start date' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.example.name).toBe('Example text');
    expect(result.example.email).toBe('user@example.gov');
    expect(result.example.ssn).toBe('123-45-6789');
    expect(result.example.age).toBe(0);
    expect(result.example.start).toBe('2024-01-15');
  });

  it('generates boolean for checkbox and toggle', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'checkbox', name: 'agree', label: 'Agree' },
          { type: 'toggle', name: 'notify', label: 'Notify' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.example.agree).toBe(false);
    expect(result.example.notify).toBe(false);
    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.agree.type).toBe('boolean');
    expect(props.notify.type).toBe('boolean');
  });

  it('generates string for file field', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'file', name: 'doc', label: 'Document' },
        ],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.example.doc).toBe('document.pdf');
    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.doc.type).toBe('string');
  });

  it('uses first option value for select/radio example', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [{
          type: 'select', name: 'state', label: 'State',
          options: [{ value: 'ca', label: 'California' }, { value: 'tx', label: 'Texas' }],
        }],
      }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.example.state).toBe('ca');
  });

  it('fieldCount is accurate', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'a', label: 'A' }] },
        {
          repeatable: true, repeatableKey: 'items',
          fields: [{ type: 'text', name: 'b', label: 'B' }],
        },
        {
          namespace: 'addr',
          fields: [{ type: 'text', name: 'c', label: 'C' }],
        },
      ],
    };
    const result = generatePayloadSchema(schema);
    expect(result.fieldCount).toBe(3);
  });

  it('handles mixed repeatable + namespaced + flat', () => {
    const schema: FormSchema = {
      title: 'Application',
      sections: [
        { fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] },
        {
          heading: 'Address', namespace: 'address',
          fields: [
            { type: 'text', name: 'street', label: 'Street' },
            { type: 'zip', name: 'zip', label: 'ZIP' },
          ],
        },
        {
          heading: 'Employment', repeatable: true, repeatableKey: 'employers',
          fields: [
            { type: 'text', name: 'company', label: 'Company' },
          ],
        },
      ],
    };
    const result = generatePayloadSchema(schema);
    expect(result.schema.properties).toHaveProperty('name');
    expect(result.schema.properties).toHaveProperty('address');
    expect(result.schema.properties).toHaveProperty('employers');
    expect(result.typescript).toContain('FormPayload');
    expect(result.typescript).toContain('Address');
    expect(result.typescript).toContain('EmployersItem');
    expect(result.fieldCount).toBe(4);
  });

  it('includes $schema reference in JSON Schema', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
    };
    const result = generatePayloadSchema(schema);
    expect(result.schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
  });
});

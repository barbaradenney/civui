import { describe, it, expect } from 'vitest';
import { generatePrefillMapping } from './generate-prefill-mapping.js';
import type { FormSchema } from '../schema/index.js';

describe('generatePrefillMapping', () => {
  const formSchema: FormSchema = {
    sections: [{
      fields: [
        { type: 'text', name: 'first-name', label: 'First name' },
        { type: 'text', name: 'last-name', label: 'Last name' },
        { type: 'email', name: 'email', label: 'Email address' },
        { type: 'tel', name: 'phone', label: 'Phone number' },
      ],
    }],
  };

  it('finds exact matches', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        'first-name': { type: 'string', description: 'First name' },
        'last-name': { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    const exact = result.mappings.filter((m) => m.matchType === 'exact');
    expect(exact.length).toBeGreaterThanOrEqual(2);
    expect(exact[0].confidence).toBe(1.0);
  });

  it('finds normalized matches (camelCase ↔ kebab-case)', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    const normalized = result.mappings.filter((m) => m.matchType === 'normalized');
    expect(normalized.length).toBeGreaterThanOrEqual(2);
    expect(normalized[0].confidence).toBe(0.9);
  });

  it('finds label matches', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        'given-name': { type: 'string', description: 'First name' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    const labelMatch = result.mappings.find((m) => m.matchType === 'label');
    expect(labelMatch).toBeDefined();
    expect(labelMatch!.confidence).toBe(0.7);
  });

  it('handles nested API schema objects', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        person: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email address' },
          },
        },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    const emailMapping = result.mappings.find((m) => m.formField === 'email');
    expect(emailMapping).toBeDefined();
    expect(emailMapping!.apiField).toBe('person.email');
  });

  it('identifies unmapped form fields', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    expect(result.unmapped.form.length).toBeGreaterThan(0);
  });

  it('identifies unmapped API fields', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
        'department-code': { type: 'string' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    expect(result.unmapped.api).toContain('department-code');
  });

  it('generates api-to-form direction code', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema, 'api-to-form');
    expect(result.code).toContain('mapApiToForm');
    expect(result.code).toContain('apiData');
  });

  it('generates form-to-api direction code', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema, 'form-to-api');
    expect(result.code).toContain('mapFormToApi');
    expect(result.code).toContain('formValues');
  });

  it('computes overall confidence', () => {
    const apiSchema = {
      type: 'object',
      properties: {
        'first-name': { type: 'string' },
        'last-name': { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('handles type matching', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'email', name: 'contact-email', label: 'Contact email' },
        ],
      }],
    };
    const apiSchema = {
      'contact_email': 'user@example.com',
    };
    const result = generatePrefillMapping(schema, apiSchema);
    // Should match via normalized (contact-email ≈ contact_email → contactemail)
    expect(result.mappings.length).toBeGreaterThanOrEqual(1);
  });

  it('parses JSON Schema input with $schema', () => {
    const apiSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email' },
      },
    };
    const result = generatePrefillMapping(formSchema, apiSchema);
    expect(result.mappings.some((m) => m.formField === 'email')).toBe(true);
  });

  it('parses example JSON input', () => {
    const apiExample = {
      email: 'test@example.gov',
      phone: '202-555-0100',
    };
    const result = generatePrefillMapping(formSchema, apiExample);
    expect(result.mappings.some((m) => m.formField === 'email')).toBe(true);
  });
});

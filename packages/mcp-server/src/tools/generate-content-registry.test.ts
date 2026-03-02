import { describe, it, expect } from 'vitest';
import { generateContentRegistry } from './generate-content-registry.js';
import type { FormSchema } from '../schema/index.js';

describe('generateContentRegistry', () => {
  it('generates basic field content from schema', () => {
    const schema: FormSchema = {
      title: 'Contact Form',
      sections: [
        {
          fields: [
            { type: 'text', name: 'full-name', label: 'Full name' },
            { type: 'email', name: 'email', label: 'Email address' },
          ],
        },
      ],
    };
    const result = generateContentRegistry(schema);
    expect(result.content.fields['full-name'].label).toBe('Full name');
    expect(result.content.fields['email'].label).toBe('Email address');
    expect(result.fieldCount).toBe(2);
  });

  it('includes required error messages when includeErrors is true', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Full name', required: true },
          ],
        },
      ],
    };
    const result = generateContentRegistry(schema, { includeErrors: true });
    expect(result.content.fields['name'].errors).toBeDefined();
    expect(result.content.fields['name'].errors!.required).toBe('Enter your Full name');
    expect(result.features).toContain('errors');
  });

  it('includes hint when field has hint', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'ssn', label: 'Social Security number', hint: 'XXX-XX-XXXX' },
          ],
        },
      ],
    };
    const result = generateContentRegistry(schema);
    expect(result.content.fields['ssn'].hint).toBe('XXX-XX-XXXX');
    expect(result.features).toContain('hints');
  });

  it('includes placeholder when field has placeholder', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'search', label: 'Search', placeholder: 'Type to search...' },
          ],
        },
      ],
    };
    const result = generateContentRegistry(schema);
    expect(result.content.fields['search'].placeholder).toBe('Type to search...');
    expect(result.features).toContain('placeholders');
  });

  it('generates meta section from schema title and description', () => {
    const schema: FormSchema = {
      title: 'Benefits Application',
      description: 'Apply for federal benefits',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const result = generateContentRegistry(schema);
    expect(result.content.meta.title).toBe('Benefits Application');
    expect(result.content.meta.description).toBe('Apply for federal benefits');
    expect(result.content.meta.submitLabel).toBe('Submit');
  });

  it('generates TypeScript output with registerContent call', () => {
    const schema: FormSchema = {
      title: 'Contact Form',
      sections: [
        {
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
      ],
    };
    const result = generateContentRegistry(schema);
    expect(result.typescript).toContain("import { registerContent } from '@civui/content'");
    expect(result.typescript).toContain("import type { FormContent } from '@civui/content'");
    expect(result.typescript).toContain("registerContent('contactForm'");
  });

  it('handles empty sections with empty fields', () => {
    const schema: FormSchema = {
      title: 'Empty Form',
      sections: [{ fields: [] }],
    };
    const result = generateContentRegistry(schema);
    expect(result.fieldCount).toBe(0);
    expect(Object.keys(result.content.fields)).toHaveLength(0);
  });

  it('includes children fields', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'radio',
              name: 'contact-method',
              label: 'Contact method',
              children: [
                { type: 'radio', name: 'email-radio', label: 'Email', value: 'email' },
                { type: 'radio', name: 'phone-radio', label: 'Phone', value: 'phone' },
              ],
            },
          ],
        },
      ],
    };
    const result = generateContentRegistry(schema);
    expect(result.content.fields['contact-method']).toBeDefined();
    expect(result.content.fields['email-radio']).toBeDefined();
    expect(result.content.fields['phone-radio']).toBeDefined();
    expect(result.fieldCount).toBe(3);
  });

  it('adds locale-aware feature when locale option is set', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Nombre' }] }],
    };
    const result = generateContentRegistry(schema, { locale: 'es-US' });
    expect(result.features).toContain('locale-aware');
  });

  it('tracks fieldCount accurately', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            { type: 'text', name: 'b', label: 'B' },
          ],
        },
        {
          fields: [
            { type: 'text', name: 'c', label: 'C' },
          ],
        },
      ],
    };
    const result = generateContentRegistry(schema);
    expect(result.fieldCount).toBe(3);
  });

  it('includes cross-field rule errors when includeErrors is true', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'start-date', label: 'Start date' },
            { type: 'text', name: 'end-date', label: 'End date' },
          ],
        },
      ],
      crossFieldRules: [
        {
          id: 'date-order',
          description: 'End date must be after start date',
          when: { field: 'start-date', operator: 'exists' as const },
          then: {
            action: 'setError' as const,
            targets: ['end-date'],
            message: 'End date must be after start date',
          },
        },
      ],
    };
    const result = generateContentRegistry(schema, { includeErrors: true });
    expect(result.content.fields['end-date'].errors).toBeDefined();
    expect(result.content.fields['end-date'].errors!['rule:date-order']).toBe(
      'End date must be after start date',
    );
  });

  it('uses default title when schema has no title', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generateContentRegistry(schema);
    expect(result.content.meta.title).toBe('Untitled Form');
  });
});

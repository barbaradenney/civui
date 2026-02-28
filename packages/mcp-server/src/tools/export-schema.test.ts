import { describe, it, expect } from 'vitest';
import { exportSchema } from './export-schema.js';
import type { FormSchema } from '../schema/index.js';

const testSchema: FormSchema = {
  title: 'Contact Form',
  sections: [
    {
      heading: 'Personal Info',
      fields: [
        { type: 'text', name: 'full-name', label: 'Full name', required: true },
        { type: 'email', name: 'email', label: 'Email address', required: true },
        { type: 'tel', name: 'phone', label: 'Phone number' },
      ],
    },
    {
      heading: 'Details',
      fields: [
        {
          type: 'select',
          name: 'topic',
          label: 'Topic',
          required: true,
          options: [
            { value: 'general', label: 'General inquiry' },
            { value: 'support', label: 'Technical support' },
          ],
        },
        { type: 'textarea', name: 'message', label: 'Message', maxlength: 1000 },
        { type: 'checkbox', name: 'agree', label: 'I agree to terms', required: true },
      ],
    },
  ],
};

describe('exportSchema', () => {
  describe('json-schema format', () => {
    it('returns valid JSON with draft-07 schema', () => {
      const result = exportSchema(testSchema, 'json-schema');
      expect(result.format).toBe('json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(parsed.type).toBe('object');
    });

    it('includes title', () => {
      const result = exportSchema(testSchema, 'json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.title).toBe('Contact Form');
    });

    it('includes all field names as properties', () => {
      const result = exportSchema(testSchema, 'json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.properties['full-name']).toBeDefined();
      expect(parsed.properties['email']).toBeDefined();
      expect(parsed.properties['topic']).toBeDefined();
    });

    it('includes required fields in required array', () => {
      const result = exportSchema(testSchema, 'json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.required).toContain('full-name');
      expect(parsed.required).toContain('email');
      expect(parsed.required).not.toContain('phone');
    });

    it('maps select options to enum', () => {
      const result = exportSchema(testSchema, 'json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.properties.topic.enum).toEqual(['general', 'support']);
    });

    it('maps checkbox to boolean', () => {
      const result = exportSchema(testSchema, 'json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.properties.agree.type).toBe('boolean');
    });

    it('includes maxLength constraint', () => {
      const result = exportSchema(testSchema, 'json-schema');
      const parsed = JSON.parse(result.output);
      expect(parsed.properties.message.maxLength).toBe(1000);
    });
  });

  describe('typescript format', () => {
    it('returns TypeScript interface', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.format).toBe('typescript');
      expect(result.output).toContain('export interface FormData');
    });

    it('uses camelCase property names', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.output).toContain('fullName');
      expect(result.output).not.toContain('full-name:');
    });

    it('marks optional fields with ?', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.output).toContain('phone?:');
      expect(result.output).toContain('message?:');
    });

    it('marks required fields without ?', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.output).toMatch(/fullName:/);
      expect(result.output).not.toMatch(/fullName\?:/);
    });

    it('maps select options to union type', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.output).toContain("'general' | 'support'");
    });

    it('maps checkbox to boolean', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.output).toContain('agree: boolean');
    });

    it('includes section headings as comments', () => {
      const result = exportSchema(testSchema, 'typescript');
      expect(result.output).toContain('// Personal Info');
      expect(result.output).toContain('// Details');
    });
  });
});

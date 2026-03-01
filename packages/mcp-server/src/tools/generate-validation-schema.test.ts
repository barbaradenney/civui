import { describe, it, expect } from 'vitest';
import { generateValidationSchema } from './generate-validation-schema.js';
import type { FormSchema } from '../schema/index.js';

describe('generateValidationSchema', () => {
  describe('zod format', () => {
    it('generates z.string().min(1) for required text field', () => {
      const schema: FormSchema = {
        sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('z.string()');
      expect(result.code).toContain('.min(1)');
      expect(result.format).toBe('zod');
    });

    it('generates .optional() for optional field', () => {
      const schema: FormSchema = {
        sections: [{ fields: [{ type: 'text', name: 'note', label: 'Note' }] }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('.optional()');
    });

    it('generates .regex() for pattern field', () => {
      const schema: FormSchema = {
        sections: [{ fields: [{ type: 'text', name: 'code', label: 'Code', pattern: '^[A-Z]{3}$' }] }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('.regex(');
      expect(result.code).toContain('[A-Z]{3}');
    });

    it('generates z.coerce.number() with min/max', () => {
      const schema: FormSchema = {
        sections: [{ fields: [{ type: 'number', name: 'age', label: 'Age', min: '0', max: '120' }] }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('z.coerce.number()');
      expect(result.code).toContain('.min(0)');
      expect(result.code).toContain('.max(120)');
    });

    it('generates z.enum() from options', () => {
      const schema: FormSchema = {
        sections: [{
          fields: [{
            type: 'select', name: 'state', label: 'State',
            options: [{ value: 'ca', label: 'CA' }, { value: 'tx', label: 'TX' }],
          }],
        }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain("z.enum(['ca', 'tx'])");
    });

    it('generates z.array(z.enum()) for checkbox-group', () => {
      const schema: FormSchema = {
        sections: [{
          fields: [{
            type: 'checkbox-group', name: 'benefits', label: 'Benefits',
            options: [{ value: 'health', label: 'Health' }, { value: 'dental', label: 'Dental' }],
          }],
        }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('z.array(');
      expect(result.code).toContain("z.enum(['health', 'dental'])");
    });

    it('generates z.boolean() for checkbox/toggle', () => {
      const schema: FormSchema = {
        sections: [{
          fields: [
            { type: 'checkbox', name: 'agree', label: 'Agree' },
            { type: 'toggle', name: 'notify', label: 'Notify' },
          ],
        }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('z.boolean()');
    });

    it('generates z.array for repeatable sections', () => {
      const schema: FormSchema = {
        sections: [{
          repeatable: true,
          repeatableKey: 'dependents',
          repeatableMin: 1,
          repeatableMax: 5,
          fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
        }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('z.array(');
      expect(result.code).toContain('.min(1)');
      expect(result.code).toContain('.max(5)');
    });

    it('generates .superRefine() for crossFieldRules', () => {
      const schema: FormSchema = {
        sections: [{ fields: [
          { type: 'text', name: 'status', label: 'Status' },
          { type: 'text', name: 'spouse', label: 'Spouse' },
        ] }],
        crossFieldRules: [{
          id: 'spouse-req',
          description: 'Spouse required when married',
          when: { field: 'status', operator: 'eq', value: 'married' },
          then: { action: 'require', targets: ['spouse'], message: 'Enter spouse name' },
        }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('superRefine');
      expect(result.code).toContain("data['status'] === 'married'");
      expect(result.rulesGenerated).toBe(1);
    });

    it('generates date string regex for date fields', () => {
      const schema: FormSchema = {
        sections: [{ fields: [{ type: 'date', name: 'start', label: 'Start date' }] }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('.regex(');
      expect(result.code).toContain('Invalid date format');
    });

    it('generates z.any() with refine for file', () => {
      const schema: FormSchema = {
        sections: [{ fields: [{ type: 'file', name: 'doc', label: 'Document', accept: '.pdf' }] }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.code).toContain('z.any()');
      expect(result.code).toContain('.refine(');
    });

    it('fieldCount and rulesGenerated are accurate', () => {
      const schema: FormSchema = {
        sections: [{
          fields: [
            { type: 'text', name: 'a', label: 'A', required: true },
            { type: 'text', name: 'b', label: 'B' },
          ],
        }],
        crossFieldRules: [{
          id: 'r1', description: 'Rule 1',
          when: { field: 'a', operator: 'exists' },
          then: { action: 'require', targets: ['b'] },
        }],
      };
      const result = generateValidationSchema(schema, 'zod');
      expect(result.fieldCount).toBe(2);
      expect(result.rulesGenerated).toBe(1);
    });
  });

  describe('json-schema-validation format', () => {
    it('generates JSON Schema with if/then for cross-field rules', () => {
      const schema: FormSchema = {
        sections: [{ fields: [
          { type: 'text', name: 'status', label: 'Status' },
          { type: 'text', name: 'spouse', label: 'Spouse' },
        ] }],
        crossFieldRules: [{
          id: 'r1', description: 'Spouse required when married',
          when: { field: 'status', operator: 'eq', value: 'married' },
          then: { action: 'require', targets: ['spouse'] },
        }],
      };
      const result = generateValidationSchema(schema, 'json-schema-validation');
      expect(result.format).toBe('json-schema-validation');
      const parsed = JSON.parse(result.code);
      expect(parsed.allOf).toBeDefined();
      expect(parsed.allOf[0]).toHaveProperty('if');
      expect(parsed.allOf[0]).toHaveProperty('then');
      expect(result.rulesGenerated).toBe(1);
    });

    it('generates proper types and required array', () => {
      const schema: FormSchema = {
        sections: [{
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            { type: 'number', name: 'age', label: 'Age', min: '0' },
          ],
        }],
      };
      const result = generateValidationSchema(schema, 'json-schema-validation');
      const parsed = JSON.parse(result.code);
      expect(parsed.properties.name.type).toBe('string');
      expect(parsed.properties.age.type).toBe('number');
      expect(parsed.properties.age.minimum).toBe(0);
      expect(parsed.required).toContain('name');
    });
  });
});

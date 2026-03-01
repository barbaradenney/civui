import { describe, it, expect } from 'vitest';
import { compareSchemas } from './compare-schemas.js';
import type { FormSchema } from '../schema/index.js';

describe('compareSchemas', () => {
  const base: FormSchema = {
    sections: [{
      heading: 'Personal',
      fields: [
        { type: 'text', name: 'name', label: 'Full name', required: true },
        { type: 'email', name: 'email', label: 'Email' },
      ],
    }],
  };

  it('reports no changes for identical schemas', () => {
    const result = compareSchemas(base, base);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.moved).toHaveLength(0);
    expect(result.breakingChanges).toHaveLength(0);
    expect(result.summary).toBe('Schemas are identical.');
  });

  it('detects added field', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [
          ...base.sections[0].fields,
          { type: 'tel', name: 'phone', label: 'Phone' },
        ],
      }],
    };
    const result = compareSchemas(base, after);
    expect(result.added.some((c) => c.name === 'phone')).toBe(true);
  });

  it('detects removed field', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [base.sections[0].fields[0]],
      }],
    };
    const result = compareSchemas(base, after);
    expect(result.removed.some((c) => c.name === 'email')).toBe(true);
  });

  it('detects changed field type', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [
          { type: 'text', name: 'name', label: 'Full name', required: true },
          { type: 'text', name: 'email', label: 'Email' },
        ],
      }],
    };
    const result = compareSchemas(base, after);
    const emailChange = result.changed.find((c) => c.name === 'email');
    expect(emailChange).toBeDefined();
    expect(emailChange!.details.type).toEqual({ before: 'email', after: 'text' });
  });

  it('detects changed required flag', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [
          { type: 'text', name: 'name', label: 'Full name' }, // required removed
          { type: 'email', name: 'email', label: 'Email' },
        ],
      }],
    };
    const result = compareSchemas(base, after);
    const nameChange = result.changed.find((c) => c.name === 'name');
    expect(nameChange).toBeDefined();
    expect(nameChange!.details.required).toBeDefined();
  });

  it('detects changed options', () => {
    const before: FormSchema = {
      sections: [{
        fields: [{
          type: 'select', name: 'state', label: 'State',
          options: [{ value: 'ca', label: 'CA' }, { value: 'tx', label: 'TX' }],
        }],
      }],
    };
    const after: FormSchema = {
      sections: [{
        fields: [{
          type: 'select', name: 'state', label: 'State',
          options: [{ value: 'ca', label: 'CA' }, { value: 'ny', label: 'NY' }],
        }],
      }],
    };
    const result = compareSchemas(before, after);
    expect(result.changed.some((c) => c.name === 'state')).toBe(true);
  });

  it('detects moved field to different section', () => {
    const after: FormSchema = {
      sections: [
        { heading: 'Personal', fields: [{ type: 'text', name: 'name', label: 'Full name', required: true }] },
        { heading: 'Contact', fields: [{ type: 'email', name: 'email', label: 'Email' }] },
      ],
    };
    const result = compareSchemas(base, after);
    expect(result.moved.some((c) => c.name === 'email')).toBe(true);
  });

  it('detects added and removed sections', () => {
    const after: FormSchema = {
      sections: [
        base.sections[0],
        { heading: 'New Section', fields: [{ type: 'text', name: 'extra', label: 'Extra' }] },
      ],
    };
    const result = compareSchemas(base, after);
    expect(result.added.some((c) => c.type === 'section')).toBe(true);
  });

  it('detects changed steps', () => {
    const before: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [{ step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] }],
    };
    const after: FormSchema = {
      steps: [{ title: 'Step 1 Revised' }, { title: 'Step 2' }],
      sections: [{ step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] }],
    };
    const result = compareSchemas(before, after);
    expect(result.changed.some((c) => c.type === 'step')).toBe(true);
  });

  it('detects added and removed rules', () => {
    const before: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
      crossFieldRules: [{ id: 'r1', description: 'Rule 1', when: { field: 'a', operator: 'exists' }, then: { action: 'require', targets: ['b'] } }],
    };
    const after: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
      crossFieldRules: [{ id: 'r2', description: 'Rule 2', when: { field: 'a', operator: 'exists' }, then: { action: 'show', targets: ['c'] } }],
    };
    const result = compareSchemas(before, after);
    expect(result.added.some((c) => c.type === 'rule' && c.name === 'r2')).toBe(true);
    expect(result.removed.some((c) => c.type === 'rule' && c.name === 'r1')).toBe(true);
  });

  it('detects breaking change: removed required field', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [{ type: 'email', name: 'email', label: 'Email' }],
      }],
    };
    const result = compareSchemas(base, after);
    expect(result.breakingChanges.some((b) => b.includes('name') && b.includes('removed'))).toBe(true);
  });

  it('detects breaking change: changed field type', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [
          { type: 'number', name: 'name', label: 'Full name', required: true },
          { type: 'email', name: 'email', label: 'Email' },
        ],
      }],
    };
    const result = compareSchemas(base, after);
    expect(result.breakingChanges.some((b) => b.includes('name') && b.includes('type'))).toBe(true);
  });

  it('summary format includes counts', () => {
    const after: FormSchema = {
      sections: [{
        heading: 'Personal',
        fields: [
          { type: 'text', name: 'name', label: 'Full name', required: true },
          { type: 'email', name: 'email', label: 'Email' },
          { type: 'tel', name: 'phone', label: 'Phone' },
        ],
      }],
    };
    const result = compareSchemas(base, after);
    expect(result.summary).toContain('added');
  });
});

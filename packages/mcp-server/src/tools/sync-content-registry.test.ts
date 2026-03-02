import { describe, it, expect } from 'vitest';
import { syncContentRegistry } from './sync-content-registry.js';
import type { FormSchema } from '../schema/index.js';
import type { FormContent } from './generate-content-registry.js';

describe('syncContentRegistry', () => {
  it('reports in sync when schema and content match', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Full name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Full name' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.inSync).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('detects missing field', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [
        { type: 'text', name: 'name', label: 'Full name' },
        { type: 'email', name: 'email', label: 'Email' },
      ] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Full name' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.inSync).toBe(false);
    expect(result.missingFields).toContain('email');
  });

  it('detects stale field', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Full name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: {
        name: { label: 'Full name' },
        oldField: { label: 'Old field' },
      },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.staleFields).toContain('oldField');
  });

  it('detects label mismatch', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Full name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Name' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.mismatches.some((m) => m.type === 'label-mismatch')).toBe(true);
  });

  it('detects hint mismatch', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', hint: 'Enter full name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Name', hint: 'Enter name' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.mismatches.some((m) => m.type === 'hint-mismatch')).toBe(true);
  });

  it('detects placeholder mismatch', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', placeholder: 'John Doe' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Name', placeholder: 'Jane Doe' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.mismatches.some((m) => m.type === 'placeholder-mismatch')).toBe(true);
  });

  it('detects title mismatch in meta', () => {
    const schema: FormSchema = {
      title: 'Benefits Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Old Title', submitLabel: 'Submit' },
      fields: { name: { label: 'Name' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.inSync).toBe(false);
    expect(result.mismatches.some((m) => m.field === 'meta.title')).toBe(true);
  });

  it('handles multiple issues combined', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [
        { type: 'text', name: 'name', label: 'Full name' },
        { type: 'email', name: 'email', label: 'Email' },
      ] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: {
        name: { label: 'Name' },
        oldField: { label: 'Old field' },
      },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.missingFields.length).toBeGreaterThan(0);
    expect(result.staleFields.length).toBeGreaterThan(0);
    expect(result.mismatches.length).toBeGreaterThan(0);
  });

  it('patch contains correct values for missing fields', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [
        { type: 'text', name: 'name', label: 'Full name' },
        { type: 'email', name: 'email', label: 'Email address', hint: 'Use .gov email' },
      ] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Full name' } },
    };
    const result = syncContentRegistry(schema, content);
    const emailPatch = result.patch.email as Record<string, string>;
    expect(emailPatch.label).toBe('Email address');
    expect(emailPatch.hint).toBe('Use .gov email');
  });

  it('patch contains correct values for mismatched fields', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Full name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { name: { label: 'Name' } },
    };
    const result = syncContentRegistry(schema, content);
    const namePatch = result.patch.name as Record<string, string>;
    expect(namePatch.label).toBe('Full name');
  });

  it('does not include stale fields in patch', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: {
        name: { label: 'Name' },
        oldField: { label: 'Old' },
      },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.staleFields).toContain('oldField');
    expect(result.patch).not.toHaveProperty('oldField');
  });

  it('includes children fields in comparison', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{
        fields: [{
          type: 'checkbox-group',
          name: 'benefits',
          label: 'Benefits',
          children: [
            { type: 'checkbox', name: 'health', label: 'Health', value: 'health' },
          ],
        }],
      }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: { benefits: { label: 'Benefits' } },
    };
    const result = syncContentRegistry(schema, content);
    expect(result.missingFields).toContain('health');
  });

  it('report is markdown string', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: {},
    };
    const result = syncContentRegistry(schema, content);
    expect(result.report).toContain('#');
  });

  it('summary includes counts', () => {
    const schema: FormSchema = {
      title: 'Test Form',
      sections: [{ fields: [
        { type: 'text', name: 'name', label: 'Name' },
        { type: 'email', name: 'email', label: 'Email' },
      ] }],
    };
    const content: FormContent = {
      meta: { title: 'Test Form', submitLabel: 'Submit' },
      fields: {},
    };
    const result = syncContentRegistry(schema, content);
    expect(result.summary).toContain('missing');
  });
});

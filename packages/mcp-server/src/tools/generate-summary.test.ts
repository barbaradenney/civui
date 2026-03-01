import { describe, it, expect } from 'vitest';
import { generateSummary } from './generate-summary.js';
import type { FormSchema } from '../schema/index.js';

describe('generateSummary', () => {
  const schema: FormSchema = {
    title: 'Application Form',
    sections: [
      {
        heading: 'Personal Info',
        fields: [
          { type: 'text', name: 'first-name', label: 'First name' },
          { type: 'text', name: 'last-name', label: 'Last name' },
        ],
      },
      {
        heading: 'Contact',
        fields: [
          { type: 'email', name: 'email', label: 'Email address' },
        ],
      },
    ],
  };

  it('generates dl structure with dt/dd pairs', () => {
    const result = generateSummary(schema, {
      'first-name': 'John',
      'last-name': 'Doe',
      email: 'john@example.com',
    });
    expect(result.html).toContain('<dl>');
    expect(result.html).toContain('<dt>First name</dt>');
    expect(result.html).toContain('<dd>John</dd>');
    expect(result.html).toContain('<dt>Last name</dt>');
    expect(result.html).toContain('<dd>Doe</dd>');
    expect(result.html).toContain('<dt>Email address</dt>');
    expect(result.html).toContain('<dd>john@example.com</dd>');
  });

  it('shows "Not provided" for missing values', () => {
    const result = generateSummary(schema, { 'first-name': 'Jane' });
    expect(result.html).toContain('<dd><em>Not provided</em></dd>');
  });

  it('groups sections with headings', () => {
    const result = generateSummary(schema, {});
    expect(result.html).toContain('<h3>Personal Info</h3>');
    expect(result.html).toContain('<h3>Contact</h3>');
  });

  it('includes title with summary suffix', () => {
    const result = generateSummary(schema, {});
    expect(result.html).toContain('Application Form — Summary');
  });

  it('reports correct fieldCount and sectionCount', () => {
    const result = generateSummary(schema, {});
    expect(result.fieldCount).toBe(3);
    expect(result.sectionCount).toBe(2);
  });

  it('handles repeatable sections with numbered sub-groups', () => {
    const repeatableSchema: FormSchema = {
      sections: [
        {
          heading: 'Dependent',
          repeatable: true,
          repeatableKey: 'deps',
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
            { type: 'text', name: 'age', label: 'Age' },
          ],
        },
      ],
    };
    const result = generateSummary(repeatableSchema, {
      'deps[0].name': 'Alice',
      'deps[0].age': '10',
      'deps[1].name': 'Bob',
      'deps[1].age': '8',
    });
    expect(result.html).toContain('Dependent 1');
    expect(result.html).toContain('Dependent 2');
    expect(result.html).toContain('<dd>Alice</dd>');
    expect(result.html).toContain('<dd>Bob</dd>');
  });

  it('joins array values with commas', () => {
    const result = generateSummary(
      {
        sections: [{
          fields: [{ type: 'checkbox-group', name: 'langs', label: 'Languages' }],
        }],
      },
      { langs: ['English', 'Spanish'] },
    );
    expect(result.html).toContain('English, Spanish');
  });

  it('escapes HTML in values', () => {
    const result = generateSummary(
      {
        sections: [{
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        }],
      },
      { name: '<script>alert("xss")</script>' },
    );
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
  });

  it('adds edit links with step anchors for wizard forms', () => {
    const wizardSchema: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [
        {
          step: 0,
          heading: 'Personal',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
        {
          step: 1,
          heading: 'Contact',
          fields: [{ type: 'email', name: 'email', label: 'Email' }],
        },
      ],
    };
    const result = generateSummary(wizardSchema, { name: 'X', email: 'x@y.com' });
    expect(result.html).toContain('href="#step-0"');
    expect(result.html).toContain('href="#step-1"');
    expect(result.html).toContain('>Edit</a>');
  });
});

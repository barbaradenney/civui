import { describe, it, expect } from 'vitest';
import { generateAmendmentFlow } from './generate-amendment-flow.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  title: 'Benefits Application',
  sections: [{
    heading: 'Personal Info',
    fields: [
      { type: 'text', name: 'first-name', label: 'First name' },
      { type: 'text', name: 'last-name', label: 'Last name' },
      { type: 'email', name: 'email', label: 'Email address' },
    ],
  }],
};

const originalValues: Record<string, string> = {
  'first-name': 'Jane',
  'last-name': 'Doe',
  'email': 'jane@example.com',
};

describe('generateAmendmentFlow', () => {
  it('returns html, javascript, features, changedFields, summary', () => {
    const result = generateAmendmentFlow(schema, originalValues, {
      ...originalValues,
      email: 'jane.doe@example.com',
    });
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('changedFields');
    expect(result).toHaveProperty('summary');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.changedFields)).toBe(true);
    expect(typeof result.summary).toBe('string');
  });

  it('HTML has data-civ-amendment section', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues);
    expect(result.html).toContain('data-civ-amendment');
    expect(result.html).toMatch(/<section data-civ-amendment>/);
  });

  it('HTML has diff table with data-civ-amendment-diff', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues);
    expect(result.html).toContain('<table data-civ-amendment-diff');
  });

  it('changed fields show del/ins markup', () => {
    const amended = { ...originalValues, email: 'new@example.com' };
    const result = generateAmendmentFlow(schema, originalValues, amended);
    expect(result.html).toContain('<del>jane@example.com</del>');
    expect(result.html).toContain('<ins>new@example.com</ins>');
  });

  it('unchanged fields show "no change"', () => {
    const amended = { ...originalValues, email: 'new@example.com' };
    const result = generateAmendmentFlow(schema, originalValues, amended);
    expect(result.html).toContain('Jane (no change)');
    expect(result.html).toContain('Doe (no change)');
  });

  it('changed rows have civ-bg-warning-lightest class', () => {
    const amended = { ...originalValues, 'first-name': 'John' };
    const result = generateAmendmentFlow(schema, originalValues, amended);
    expect(result.html).toContain('civ-bg-warning-lightest');
    // The changed row should have the class
    const lines = result.html.split('\n');
    const warningLine = lines.find((l) => l.includes('civ-bg-warning-lightest'));
    expect(warningLine).toBeDefined();
    expect(warningLine).toContain('<tr');
  });

  it('changedFields tracks only fields that differ', () => {
    const amended = { ...originalValues, 'last-name': 'Smith' };
    const result = generateAmendmentFlow(schema, originalValues, amended);
    expect(result.changedFields).toEqual(['last-name']);
  });

  it('summary reports correct counts', () => {
    const amended = { ...originalValues, email: 'new@example.com' };
    const result = generateAmendmentFlow(schema, originalValues, amended);
    expect(result.summary).toBe('1 of 3 fields changed');
  });

  it('reason textarea shown by default (requiresReason defaults to true)', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues);
    expect(result.html).toContain('civ-textarea');
    expect(result.html).toContain('amendment-reason');
    expect(result.html).toContain('Reason for amendment');
  });

  it('requiresReason: false hides reason textarea', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues, {
      requiresReason: false,
    });
    expect(result.html).not.toContain('civ-textarea');
    expect(result.html).not.toContain('amendment-reason');
  });

  it('requiresApproval: true shows approval notice with role="note"', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues, {
      requiresApproval: true,
    });
    expect(result.html).toContain('role="note"');
    expect(result.html).toContain('requires approval');
    expect(result.html).toContain('data-civ-amendment-approval');
  });

  it('requiresApproval defaults to false (no approval notice)', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues);
    expect(result.html).not.toContain('data-civ-amendment-approval');
    expect(result.html).not.toContain('role="note"');
  });

  it('features always include amendment-flow, diff-view, del-ins-markup', () => {
    const result = generateAmendmentFlow(schema, originalValues, originalValues);
    expect(result.features).toContain('amendment-flow');
    expect(result.features).toContain('diff-view');
    expect(result.features).toContain('del-ins-markup');
  });

  it('features conditionally include requires-reason and requires-approval', () => {
    const withBoth = generateAmendmentFlow(schema, originalValues, originalValues, {
      requiresReason: true,
      requiresApproval: true,
    });
    expect(withBoth.features).toContain('requires-reason');
    expect(withBoth.features).toContain('requires-approval');

    const withNeither = generateAmendmentFlow(schema, originalValues, originalValues, {
      requiresReason: false,
      requiresApproval: false,
    });
    expect(withNeither.features).not.toContain('requires-reason');
    expect(withNeither.features).not.toContain('requires-approval');
  });
});

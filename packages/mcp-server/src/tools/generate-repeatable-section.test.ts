import { describe, it, expect } from 'vitest';
import { generateRepeatableSection } from './generate-repeatable-section.js';
import type { FormSchema } from '../schema/index.js';

function schema(overrides?: { heading?: string }): FormSchema {
  return {
    sections: [
      {
        heading: overrides?.heading ?? 'Household member',
        fields: [
          { type: 'text', name: 'firstName', label: 'First name', required: true },
          { type: 'text', name: 'lastName', label: 'Last name', required: true },
          { type: 'email', name: 'email', label: 'Email' },
        ],
      },
    ],
  };
}

describe('generateRepeatableSection', () => {
  it('throws when sectionIndex is out of range', () => {
    expect(() => generateRepeatableSection(schema(), 5)).toThrow(
      'Invalid section index: 5',
    );
  });

  it('throws for negative sectionIndex', () => {
    expect(() => generateRepeatableSection(schema(), -1)).toThrow(
      'Invalid section index: -1',
    );
  });

  it('returns html, javascript, features, fields, sectionHeading', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('fields');
    expect(result).toHaveProperty('sectionHeading');
    expect(result.sectionHeading).toBe('Household member');
    expect(result.fields).toEqual(['firstName', 'lastName', 'email']);
  });

  it('HTML has data-civ-repeatable container', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.html).toContain('data-civ-repeatable');
  });

  it('HTML has data-civ-repeat-item fieldset', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.html).toContain('<fieldset data-civ-repeat-item');
    expect(result.html).toContain('</fieldset>');
  });

  it('HTML renders fields with [0] index', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.html).toContain('name="firstName[0]"');
    expect(result.html).toContain('name="lastName[0]"');
    expect(result.html).toContain('name="email[0]"');
  });

  it('HTML has add button with custom label', () => {
    const result = generateRepeatableSection(schema(), 0, {
      addLabel: 'Add household member',
    });
    expect(result.html).toContain('data-civ-repeat-add');
    expect(result.html).toContain('Add household member');
  });

  it('HTML has repeat count element', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.html).toContain('data-civ-repeat-count');
  });

  it('HTML has aria-live announcer', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.html).toContain('aria-live="polite"');
    expect(result.html).toContain('data-civ-repeat-announcer');
  });

  it('features include repeatable-section, add-remove, reindex, aria-live', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.features).toContain('repeatable-section');
    expect(result.features).toContain('add-remove');
    expect(result.features).toContain('reindex');
    expect(result.features).toContain('aria-live');
  });

  it('JS dispatches civ-repeat-change event', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.javascript).toContain('civ-repeat-change');
  });

  it('JS handles reindexing on add/remove', () => {
    const result = generateRepeatableSection(schema(), 0);
    expect(result.javascript).toContain('reindex');
  });

  it('respects minRepeats and maxRepeats options', () => {
    const result = generateRepeatableSection(schema(), 0, {
      minRepeats: 2,
      maxRepeats: 5,
    });
    expect(result.html).toContain('data-civ-min="2"');
    expect(result.html).toContain('data-civ-max="5"');
    expect(result.javascript).toContain('var minRepeats = 2');
    expect(result.javascript).toContain('var maxRepeats = 5');
  });

  it('uses section heading from schema', () => {
    const result = generateRepeatableSection(
      schema({ heading: 'Employment history' }),
      0,
    );
    expect(result.sectionHeading).toBe('Employment history');
    expect(result.html).toContain('Employment history');
  });
});

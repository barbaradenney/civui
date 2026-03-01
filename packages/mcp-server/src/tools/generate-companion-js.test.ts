import { describe, it, expect } from 'vitest';
import { generateCompanionJs } from './generate-companion-js.js';
import type { FormSchema } from '../schema/index.js';

describe('generateCompanionJs', () => {
  it('repeatable schema produces JS with clone/remove/re-index functions', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'dependents',
          repeatableMin: 1,
          repeatableMax: 10,
          fields: [
            { type: 'text', name: 'name', label: 'Dependent name' },
            { type: 'text', name: 'relationship', label: 'Relationship' },
          ],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.features).toContain('repeatable');
    expect(result.javascript).toContain('dependents');
    expect(result.javascript).toContain('clone');
    expect(result.javascript).toContain('reindex');
    expect(result.javascript).toContain('data-civ-repeatable-add');
    expect(result.javascript).toContain('data-civ-repeatable-remove');
  });

  it('visibleWhen fields produce show/hide listener logic', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'spouse-name',
              label: 'Spouse name',
              visibleWhen: { field: 'marital-status', operator: 'eq', value: 'married' },
            },
          ],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.features).toContain('conditional-visibility');
    expect(result.javascript).toContain('data-civ-show-when');
    expect(result.javascript).toContain('data-civ-hide-when');
    expect(result.javascript).toContain('civ-change');
    expect(result.javascript).toContain('display');
  });

  it('requiredWhen fields produce conditional required logic', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'service-dates',
              label: 'Service dates',
              requiredWhen: { field: 'is-veteran', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.features).toContain('conditional-required');
    expect(result.javascript).toContain('data-civ-require-when');
    expect(result.javascript).toContain('civ-change');
    expect(result.javascript).toContain('setAttribute');
  });

  it('schema with no special features returns empty JS / empty features', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Full name' },
          ],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.features).toEqual([]);
    expect(result.javascript).toBe('');
  });

  it('generated JS references aria-live for add/remove announcements', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Items',
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'description', label: 'Description' }],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.javascript).toContain('aria-live');
    expect(result.javascript).toContain('announce');
  });

  it('rejects unsafe repeatableKey values', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Bad',
          repeatable: true,
          repeatableKey: '"; alert(1); //',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };

    expect(() => generateCompanionJs(schema)).toThrow(/Invalid repeatableKey/);
  });

  it('generates focus management code on removal', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Items',
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'description', label: 'Description' }],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.javascript).toContain('focusTarget');
    expect(result.javascript).toContain('focus()');
  });

  it('handles multiple repeatable sections', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'dependents',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
        {
          heading: 'Employers',
          repeatable: true,
          repeatableKey: 'employers',
          fields: [{ type: 'text', name: 'company', label: 'Company' }],
        },
      ],
    };

    const result = generateCompanionJs(schema);
    expect(result.javascript).toContain('dependents');
    expect(result.javascript).toContain('employers');
  });

  // ---- Compound conditions in client JS ----

  it('includes JSON.parse handling for compound conditions', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'spouse',
              label: 'Spouse',
              visibleWhen: {
                allOf: [
                  { field: 'married', operator: 'eq', value: 'yes' },
                  { field: 'filing', operator: 'eq', value: 'joint' },
                ],
              },
            },
          ],
        },
      ],
    };
    const result = generateCompanionJs(schema);
    expect(result.features).toContain('conditional-visibility');
    expect(result.javascript).toContain('JSON.parse');
    expect(result.javascript).toContain('allOf');
    expect(result.javascript).toContain('anyOf');
  });

  it('includes compound evaluate logic with allOf/anyOf', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'x',
              label: 'X',
              visibleWhen: { anyOf: [{ field: 'a', operator: 'eq', value: '1' }] },
            },
          ],
        },
      ],
    };
    const result = generateCompanionJs(schema);
    expect(result.javascript).toContain('.every(');
    expect(result.javascript).toContain('.some(');
  });

  // ---- Wizard JS ----

  it('generates wizard JS when schema has steps', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { step: 1, fields: [{ type: 'text', name: 'b', label: 'B' }] },
      ],
    };
    const result = generateCompanionJs(schema);
    expect(result.features).toContain('wizard');
    expect(result.javascript).toContain('data-civ-step');
    expect(result.javascript).toContain('data-civ-progress');
    expect(result.javascript).toContain('showStep');
  });

  it('wizard JS includes step count', () => {
    const schema: FormSchema = {
      steps: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'x', label: 'X' }] },
      ],
    };
    const result = generateCompanionJs(schema);
    expect(result.javascript).toContain('stepCount = 3');
  });

  it('wizard JS handles hash-based navigation', () => {
    const schema: FormSchema = {
      steps: [{ title: 'S1' }, { title: 'S2' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
      ],
    };
    const result = generateCompanionJs(schema);
    expect(result.javascript).toContain('#step-');
    expect(result.javascript).toContain('location.hash');
  });

  // ---- Section visibleWhen detection ----

  it('detects section-level visibleWhen as conditional-visibility feature', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Spouse',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [{ type: 'text', name: 'spouse-name', label: 'Spouse name' }],
        },
      ],
    };
    const result = generateCompanionJs(schema);
    expect(result.features).toContain('conditional-visibility');
  });
});

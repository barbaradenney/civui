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
});

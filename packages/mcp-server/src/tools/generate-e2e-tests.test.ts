import { describe, it, expect } from 'vitest';
import { generateE2eTests } from './generate-e2e-tests.js';
import type { FormSchema } from '../schema/index.js';

const minimal: FormSchema = {
  title: 'Benefits Application',
  sections: [
    {
      heading: 'Personal Info',
      fields: [
        { type: 'text', name: 'first-name', label: 'First name', required: true },
        { type: 'email', name: 'email', label: 'Email', required: true },
      ],
    },
  ],
};

describe('generateE2eTests', () => {
  it('returns filename, code, testCount, and features', () => {
    const result = generateE2eTests(minimal);
    expect(result).toHaveProperty('filename');
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('testCount');
    expect(result).toHaveProperty('features');
  });

  it('generates kebab-case filename with .e2e.test.ts extension', () => {
    const result = generateE2eTests(minimal);
    expect(result.filename).toBe('benefits-application.e2e.test.ts');
  });

  it('always includes validation and submission features', () => {
    const result = generateE2eTests(minimal);
    expect(result.features).toContain('validation');
    expect(result.features).toContain('submission');
    expect(result.testCount).toBeGreaterThanOrEqual(2);
  });

  it('generates valid Playwright import and describe block', () => {
    const result = generateE2eTests(minimal);
    expect(result.code).toContain("import { test, expect } from '@playwright/test'");
    expect(result.code).toContain("test.describe('Benefits Application'");
    expect(result.code).toContain('test.beforeEach');
  });

  it('uses custom baseUrl when provided', () => {
    const result = generateE2eTests(minimal, { baseUrl: 'http://localhost:5000/form' });
    expect(result.code).toContain("await page.goto('http://localhost:5000/form')");
  });

  it('uses custom suiteName when provided', () => {
    const result = generateE2eTests(minimal, { suiteName: 'Custom Suite' });
    expect(result.code).toContain("test.describe('Custom Suite'");
    expect(result.filename).toBe('custom-suite.e2e.test.ts');
  });

  it('generates fill actions for various field types', () => {
    const schema: FormSchema = {
      title: 'Multi-type Form',
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
            { type: 'select', name: 'state', label: 'State', options: [{ value: 'CA', label: 'California' }] },
            { type: 'checkbox', name: 'agree', label: 'I agree' },
            { type: 'textarea', name: 'notes', label: 'Notes' },
          ],
        },
      ],
    };
    const result = generateE2eTests(schema);
    expect(result.code).toContain("input').fill('Test value')");
    expect(result.code).toContain("selectOption('CA')");
    expect(result.code).toContain('.check()');
    expect(result.code).toContain("textarea').fill('Test response')");
  });

  it('generates wizard test when steps are present', () => {
    const schema: FormSchema = {
      title: 'Wizard Form',
      steps: [{ title: 'Step One' }, { title: 'Step Two' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { step: 1, fields: [{ type: 'text', name: 'b', label: 'B' }] },
      ],
    };
    const result = generateE2eTests(schema);
    expect(result.features).toContain('wizard');
    expect(result.code).toContain("'completes wizard steps'");
    expect(result.code).toContain('Step One');
    expect(result.code).toContain('[data-civ-next]');
    expect(result.testCount).toBe(3);
  });

  it('generates conditional field test when visibleWhen is present', () => {
    const schema: FormSchema = {
      title: 'Conditional',
      sections: [
        {
          fields: [
            { type: 'text', name: 'trigger', label: 'Trigger' },
            {
              type: 'text',
              name: 'dependent',
              label: 'Dependent',
              visibleWhen: { field: 'trigger', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };
    const result = generateE2eTests(schema);
    expect(result.features).toContain('conditional');
    expect(result.code).toContain("'shows conditional fields'");
    expect(result.code).toContain('toBeHidden');
    expect(result.code).toContain('toBeVisible');
  });

  it('generates repeatable section test when repeatable is present', () => {
    const schema: FormSchema = {
      title: 'Repeatable',
      sections: [
        {
          heading: 'Employment history',
          repeatable: true,
          fields: [{ type: 'text', name: 'employer', label: 'Employer' }],
        },
      ],
    };
    const result = generateE2eTests(schema);
    expect(result.features).toContain('repeatable');
    expect(result.code).toContain("'adds and removes repeatable items'");
    expect(result.code).toContain('[data-civ-repeatable-add]');
    expect(result.code).toContain('[data-civ-repeatable-remove]');
  });

  it('generates save/resume test when saveResume is present', () => {
    const schema: FormSchema = {
      title: 'Save Resume',
      sections: [
        { fields: [{ type: 'text', name: 'name', label: 'Name' }] },
      ],
      saveResume: { storageKey: 'test-form' },
    };
    const result = generateE2eTests(schema);
    expect(result.features).toContain('save-resume');
    expect(result.code).toContain("'saves and resumes form progress'");
    expect(result.code).toContain('[data-civ-save]');
    expect(result.code).toContain('page.reload');
  });

  it('skips conditional fields in submission fill', () => {
    const schema: FormSchema = {
      title: 'Skip Conditional',
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            {
              type: 'text',
              name: 'hidden',
              label: 'Hidden',
              visibleWhen: { field: 'a', operator: 'eq', value: 'show' },
            },
          ],
        },
      ],
    };
    const result = generateE2eTests(schema);
    // In the submission test, the conditional field should not be filled
    const submissionTest = result.code.split("test('fills and submits")[1]?.split("test('")[0] ?? '';
    expect(submissionTest).not.toContain('data-civ-field="hidden"');
  });

  it('handles radio field with options', () => {
    const schema: FormSchema = {
      title: 'Radio Form',
      sections: [
        {
          fields: [
            {
              type: 'radio',
              name: 'choice',
              label: 'Choice',
              options: [
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
              ],
            },
          ],
        },
      ],
    };
    const result = generateE2eTests(schema);
    expect(result.code).toContain('input[value="a"]');
    expect(result.code).toContain('.click()');
  });

  it('testCount matches number of generated tests', () => {
    const schema: FormSchema = {
      title: 'Full',
      steps: [{ title: 'S1' }, { title: 'S2' }],
      sections: [
        {
          step: 0,
          repeatable: true,
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            {
              type: 'text',
              name: 'b',
              label: 'B',
              visibleWhen: { field: 'a', operator: 'eq', value: 'x' },
            },
          ],
        },
        { step: 1, fields: [{ type: 'text', name: 'c', label: 'C' }] },
      ],
      saveResume: {},
    };
    const result = generateE2eTests(schema);
    expect(result.testCount).toBe(6); // validation + submission + wizard + conditional + repeatable + save-resume
    expect(result.features).toHaveLength(6);
  });
});

import { describe, it, expect } from 'vitest';
import { validateCrossField } from './validate-cross-field.js';
import type { FormSchema } from '../schema/index.js';

describe('validateCrossField', () => {
  it('simple eq condition fires rule', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'married-requires-spouse',
          description: 'Married applicants must provide spouse name',
          when: { field: 'marital-status', operator: 'eq', value: 'married' },
          then: { action: 'require', targets: ['spouse-name'], message: 'Enter spouse name' },
        },
      ],
    };

    const result = validateCrossField(schema, { 'marital-status': 'married' });
    expect(result.firedRules).toHaveLength(1);
    expect(result.firedRules[0].ruleId).toBe('married-requires-spouse');
    expect(result.conditionallyRequired).toContain('spouse-name');
  });

  it('neq condition fires when value does not match', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'not-single-show-dependents',
          description: 'Non-single filers see dependents',
          when: { field: 'filing-status', operator: 'neq', value: 'single' },
          then: { action: 'show', targets: ['dependents-section'] },
        },
      ],
    };

    const result = validateCrossField(schema, { 'filing-status': 'married' });
    expect(result.firedRules).toHaveLength(1);
    expect(result.conditionallyVisible).toContain('dependents-section');
  });

  it('in operator fires when value is in array', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'veteran-branches',
          description: 'Military branch requires service dates',
          when: { field: 'branch', operator: 'in', value: ['army', 'navy', 'marines'] },
          then: { action: 'require', targets: ['service-dates'] },
        },
      ],
    };

    const result = validateCrossField(schema, { branch: 'navy' });
    expect(result.firedRules).toHaveLength(1);
    expect(result.conditionallyRequired).toContain('service-dates');
  });

  it('notIn operator fires when value is not in array', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'non-exempt',
          description: 'Non-exempt statuses require additional info',
          when: { field: 'status', operator: 'notIn', value: ['exempt', 'pending'] },
          then: { action: 'show', targets: ['additional-info'] },
        },
      ],
    };

    const result = validateCrossField(schema, { status: 'active' });
    expect(result.firedRules).toHaveLength(1);
    expect(result.conditionallyVisible).toContain('additional-info');
  });

  it('exists operator fires when field has a value', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'has-email-show-prefs',
          description: 'Email provided shows communication preferences',
          when: { field: 'email', operator: 'exists' },
          then: { action: 'show', targets: ['email-prefs'] },
        },
      ],
    };

    const result = validateCrossField(schema, { email: 'test@example.com' });
    expect(result.firedRules).toHaveLength(1);

    const resultEmpty = validateCrossField(schema, { email: '' });
    expect(resultEmpty.firedRules).toHaveLength(0);
  });

  it('notExists operator fires when field has no value', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'no-ssn-show-itin',
          description: 'No SSN shows ITIN field',
          when: { field: 'ssn', operator: 'notExists' },
          then: { action: 'show', targets: ['itin'] },
        },
      ],
    };

    const result = validateCrossField(schema, {});
    expect(result.firedRules).toHaveLength(1);
    expect(result.conditionallyVisible).toContain('itin');
  });

  it('require action populates conditionallyRequired', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'r1',
          description: 'Test rule',
          when: { field: 'trigger', operator: 'eq', value: 'yes' },
          then: { action: 'require', targets: ['field-a', 'field-b'] },
        },
      ],
    };

    const result = validateCrossField(schema, { trigger: 'yes', 'field-a': 'value', 'field-b': 'value' });
    expect(result.conditionallyRequired).toEqual(['field-a', 'field-b']);
    expect(result.errors).toHaveLength(0);
  });

  it('show/hide actions populate correct arrays', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'show-rule',
          description: 'Show section',
          when: { field: 'a', operator: 'eq', value: '1' },
          then: { action: 'show', targets: ['section-a'] },
        },
        {
          id: 'hide-rule',
          description: 'Hide section',
          when: { field: 'a', operator: 'eq', value: '1' },
          then: { action: 'hide', targets: ['section-b'] },
        },
      ],
    };

    const result = validateCrossField(schema, { a: '1' });
    expect(result.conditionallyVisible).toContain('section-a');
    expect(result.conditionallyHidden).toContain('section-b');
  });

  it('missing value triggers error for requiredWhen', () => {
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

    const result = validateCrossField(schema, { 'is-veteran': 'yes' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('service-dates');
    expect(result.errors[0].message).toContain('Service dates');
  });

  it('rules with no matching values do not fire', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'wont-fire',
          description: 'Should not fire',
          when: { field: 'status', operator: 'eq', value: 'active' },
          then: { action: 'require', targets: ['extra-field'] },
        },
      ],
    };

    const result = validateCrossField(schema, { status: 'inactive' });
    expect(result.firedRules).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('handles repeatable field names with wildcard matching', () => {
    const schema: FormSchema = {
      sections: [{ fields: [] }],
      crossFieldRules: [
        {
          id: 'dep-requires-ssn',
          description: 'Dependent requires SSN',
          when: { field: 'has-dependents', operator: 'eq', value: 'yes' },
          then: { action: 'require', targets: ['dependents[*].ssn'] },
        },
      ],
    };

    const result = validateCrossField(schema, {
      'has-dependents': 'yes',
      'dependents[0].ssn': '123456789',
    });
    expect(result.firedRules).toHaveLength(1);
    expect(result.errors).toHaveLength(0); // value exists via wildcard match
  });

  it('visibleWhen populates conditionallyVisible when condition met', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'spouse-name',
              label: 'Spouse name',
              visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };

    const visible = validateCrossField(schema, { married: 'yes' });
    expect(visible.conditionallyVisible).toContain('spouse-name');

    const hidden = validateCrossField(schema, { married: 'no' });
    expect(hidden.conditionallyHidden).toContain('spouse-name');
  });

  // ---- Compound conditions ----

  it('evaluates allOf compound condition', () => {
    const schema: FormSchema = {
      crossFieldRules: [
        {
          id: 'compound-require',
          description: 'Require spouse income when married and filing jointly',
          when: {
            allOf: [
              { field: 'married', operator: 'eq', value: 'yes' },
              { field: 'filing', operator: 'eq', value: 'joint' },
            ],
          },
          then: { action: 'require', targets: ['spouse-income'] },
        },
      ],
      sections: [{ fields: [] }],
    };

    const bothMet = validateCrossField(schema, { married: 'yes', filing: 'joint' });
    expect(bothMet.firedRules).toHaveLength(1);
    expect(bothMet.conditionallyRequired).toContain('spouse-income');

    const onlyOne = validateCrossField(schema, { married: 'yes', filing: 'single' });
    expect(onlyOne.firedRules).toHaveLength(0);
  });

  it('evaluates anyOf compound condition', () => {
    const schema: FormSchema = {
      crossFieldRules: [
        {
          id: 'any-status',
          description: 'Show tax field for certain statuses',
          when: {
            anyOf: [
              { field: 'status', operator: 'eq', value: 'employed' },
              { field: 'status', operator: 'eq', value: 'self-employed' },
            ],
          },
          then: { action: 'show', targets: ['tax-id'] },
        },
      ],
      sections: [{ fields: [] }],
    };

    const employed = validateCrossField(schema, { status: 'employed' });
    expect(employed.conditionallyVisible).toContain('tax-id');

    const unemployed = validateCrossField(schema, { status: 'retired' });
    expect(unemployed.firedRules).toHaveLength(0);
  });

  it('evaluates nested compound conditions', () => {
    const schema: FormSchema = {
      crossFieldRules: [
        {
          id: 'nested',
          description: 'Nested allOf/anyOf',
          when: {
            allOf: [
              { field: 'citizen', operator: 'eq', value: 'yes' },
              {
                anyOf: [
                  { field: 'age', operator: 'eq', value: '18' },
                  { field: 'age', operator: 'eq', value: '21' },
                ],
              },
            ],
          },
          then: { action: 'show', targets: ['voter-reg'] },
        },
      ],
      sections: [{ fields: [] }],
    };

    const match = validateCrossField(schema, { citizen: 'yes', age: '18' });
    expect(match.conditionallyVisible).toContain('voter-reg');

    const noMatch = validateCrossField(schema, { citizen: 'no', age: '18' });
    expect(noMatch.firedRules).toHaveLength(0);
  });

  it('empty compound condition (no allOf/anyOf) evaluates to false', () => {
    const schema: FormSchema = {
      crossFieldRules: [
        {
          id: 'empty-compound',
          description: 'Empty compound',
          when: {} as any,
          then: { action: 'show', targets: ['x'] },
        },
      ],
      sections: [{ fields: [] }],
    };
    const result = validateCrossField(schema, { x: 'y' });
    expect(result.firedRules).toHaveLength(0);
  });

  // ---- Section visibleWhen ----

  it('section visibleWhen hides all section fields when condition not met', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Spouse info',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [
            { type: 'text', name: 'spouse-name', label: 'Spouse name' },
            { type: 'text', name: 'spouse-ssn', label: 'Spouse SSN' },
          ],
        },
      ],
    };

    const hidden = validateCrossField(schema, { married: 'no' });
    expect(hidden.conditionallyHidden).toContain('spouse-name');
    expect(hidden.conditionallyHidden).toContain('spouse-ssn');

    const visible = validateCrossField(schema, { married: 'yes' });
    expect(visible.conditionallyHidden).not.toContain('spouse-name');
    expect(visible.conditionallyHidden).not.toContain('spouse-ssn');
  });

  it('section visibleWhen skips per-field evaluation for hidden sections', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Spouse info',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [
            {
              type: 'text',
              name: 'spouse-employer',
              label: 'Spouse employer',
              requiredWhen: { field: 'married', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };

    // Section hidden — the requiredWhen on the field should NOT fire
    const hidden = validateCrossField(schema, { married: 'no' });
    expect(hidden.conditionallyRequired).not.toContain('spouse-employer');
    expect(hidden.conditionallyHidden).toContain('spouse-employer');
    expect(hidden.errors).toHaveLength(0);
  });
});

import { describe, it, expect } from 'vitest';
import { generateEligibilityScreener } from './generate-eligibility-screener.js';
import type { FormSchema } from '../schema/index.js';

describe('generateEligibilityScreener', () => {
  const yesNoSchema: FormSchema = {
    sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    eligibility: {
      questions: [
        {
          id: 'citizen',
          text: 'Are you a U.S. citizen?',
          type: 'yes-no',
          disqualifyWhen: 'no',
        },
      ],
      passMessage: 'You appear to be eligible.',
      failMessage: 'You may not be eligible.',
    },
  };

  const selectSchema: FormSchema = {
    sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    eligibility: {
      questions: [
        {
          id: 'state',
          text: 'What state do you live in?',
          type: 'select',
          options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
            { value: 'tx', label: 'Texas' },
          ],
          disqualifyWhen: 'tx',
        },
      ],
    },
  };

  const numberSchema: FormSchema = {
    sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    eligibility: {
      questions: [
        {
          id: 'age',
          text: 'How old are you?',
          type: 'number',
          disqualifyWhen: '< 18',
        },
      ],
    },
  };

  const mixedSchema: FormSchema = {
    sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    eligibility: {
      questions: [
        {
          id: 'citizen',
          text: 'Are you a U.S. citizen?',
          type: 'yes-no',
          disqualifyWhen: 'no',
        },
        {
          id: 'state',
          text: 'What state do you live in?',
          type: 'select',
          options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
          ],
        },
        {
          id: 'age',
          text: 'How old are you?',
          type: 'number',
          disqualifyWhen: '< 18',
          explanation: 'You must be at least 18 years old to apply.',
        },
      ],
    },
  };

  it('throws when schema has no eligibility config', () => {
    const noEligibility: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    expect(() => generateEligibilityScreener(noEligibility)).toThrow(
      'eligibility configuration',
    );
  });

  it('returns html, javascript, features, and questionCount', () => {
    const result = generateEligibilityScreener(yesNoSchema);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('questionCount');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(typeof result.questionCount).toBe('number');
  });

  it('questionCount matches number of questions', () => {
    expect(generateEligibilityScreener(yesNoSchema).questionCount).toBe(1);
    expect(generateEligibilityScreener(selectSchema).questionCount).toBe(1);
    expect(generateEligibilityScreener(mixedSchema).questionCount).toBe(3);
  });

  it('HTML has data-civ-eligibility fieldset', () => {
    const result = generateEligibilityScreener(yesNoSchema);
    expect(result.html).toContain('<fieldset data-civ-eligibility>');
    expect(result.html).toContain('</fieldset>');
    expect(result.html).toContain('<legend>Check your eligibility</legend>');
  });

  it('yes-no question generates civ-radio-group with Yes/No options', () => {
    const result = generateEligibilityScreener(yesNoSchema);
    expect(result.html).toContain('civ-radio-group');
    expect(result.html).toContain('name="citizen"');
    expect(result.html).toContain('legend="Are you a U.S. citizen?"');
    expect(result.html).toContain('<civ-radio value="yes" label="Yes"></civ-radio>');
    expect(result.html).toContain('<civ-radio value="no" label="No"></civ-radio>');
    expect(result.html).toContain('required');
  });

  it('select question generates civ-select with options', () => {
    const result = generateEligibilityScreener(selectSchema);
    expect(result.html).toContain('civ-select');
    expect(result.html).toContain('name="state"');
    expect(result.html).toContain('label="What state do you live in?"');
    expect(result.html).toContain('<option value="ca">California</option>');
    expect(result.html).toContain('<option value="ny">New York</option>');
    expect(result.html).toContain('<option value="tx">Texas</option>');
  });

  it('number question generates civ-text-input with type="number"', () => {
    const result = generateEligibilityScreener(numberSchema);
    expect(result.html).toContain('civ-text-input');
    expect(result.html).toContain('name="age"');
    expect(result.html).toContain('label="How old are you?"');
    expect(result.html).toContain('type="number"');
    expect(result.html).toContain('inputmode="numeric"');
  });

  it('question with explanation gets hint attribute', () => {
    const result = generateEligibilityScreener(mixedSchema);
    expect(result.html).toContain(
      'hint="You must be at least 18 years old to apply."',
    );
    // The yes-no question has no explanation, so its tag should not have hint
    const citizenLine = result.html
      .split('\n')
      .find((line) => line.includes('name="citizen"'));
    expect(citizenLine).toBeDefined();
    expect(citizenLine).not.toContain('hint=');
  });

  it('result area has aria-live="polite" and hidden', () => {
    const result = generateEligibilityScreener(yesNoSchema);
    expect(result.html).toContain('data-civ-eligibility-result');
    expect(result.html).toContain('aria-live="polite"');
    // The result div should be hidden by default
    const resultLine = result.html
      .split('\n')
      .find((line) => line.includes('data-civ-eligibility-result'));
    expect(resultLine).toBeDefined();
    expect(resultLine).toContain('hidden');
  });

  it('check eligibility button is present', () => {
    const result = generateEligibilityScreener(yesNoSchema);
    expect(result.html).toContain('data-civ-eligibility-check');
    expect(result.html).toContain('Check eligibility');
    expect(result.html).toContain('type="button"');
  });

  it('features include eligibility-screener always', () => {
    const result = generateEligibilityScreener(yesNoSchema);
    expect(result.features).toContain('eligibility-screener');

    const selectResult = generateEligibilityScreener(selectSchema);
    expect(selectResult.features).toContain('eligibility-screener');

    const numberResult = generateEligibilityScreener(numberSchema);
    expect(numberResult.features).toContain('eligibility-screener');
  });

  it('features include type-specific features', () => {
    const yesNoResult = generateEligibilityScreener(yesNoSchema);
    expect(yesNoResult.features).toContain('yes-no-questions');
    expect(yesNoResult.features).toContain('disqualify-conditions');
    expect(yesNoResult.features).not.toContain('select-questions');
    expect(yesNoResult.features).not.toContain('number-questions');

    const selectResult = generateEligibilityScreener(selectSchema);
    expect(selectResult.features).toContain('select-questions');
    expect(selectResult.features).toContain('disqualify-conditions');
    expect(selectResult.features).not.toContain('yes-no-questions');
    expect(selectResult.features).not.toContain('number-questions');

    const numberResult = generateEligibilityScreener(numberSchema);
    expect(numberResult.features).toContain('number-questions');
    expect(numberResult.features).toContain('disqualify-conditions');
    expect(numberResult.features).not.toContain('yes-no-questions');
    expect(numberResult.features).not.toContain('select-questions');

    const mixedResult = generateEligibilityScreener(mixedSchema);
    expect(mixedResult.features).toContain('yes-no-questions');
    expect(mixedResult.features).toContain('select-questions');
    expect(mixedResult.features).toContain('number-questions');
    expect(mixedResult.features).toContain('disqualify-conditions');
  });
});

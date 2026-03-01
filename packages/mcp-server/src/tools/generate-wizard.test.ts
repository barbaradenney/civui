import { describe, it, expect } from 'vitest';
import { generateWizard } from './generate-wizard.js';
import type { FormSchema } from '../schema/index.js';

describe('generateWizard', () => {
  const baseSchema: FormSchema = {
    steps: [
      { title: 'Personal Info', description: 'Enter your personal details' },
      { title: 'Contact Info' },
      { title: 'Review' },
    ],
    sections: [
      {
        step: 0,
        heading: 'Personal',
        fields: [
          { type: 'text', name: 'first-name', label: 'First name' },
          { type: 'text', name: 'last-name', label: 'Last name' },
        ],
      },
      {
        step: 1,
        heading: 'Contact',
        fields: [
          { type: 'email', name: 'email', label: 'Email' },
          { type: 'tel', name: 'phone', label: 'Phone' },
        ],
      },
      {
        step: 2,
        fields: [
          { type: 'checkbox', name: 'agree', label: 'I agree to the terms' },
        ],
      },
    ],
  };

  it('generates HTML with step containers', () => {
    const result = generateWizard(baseSchema);
    expect(result.html).toContain('data-civ-step="0"');
    expect(result.html).toContain('data-civ-step="1"');
    expect(result.html).toContain('data-civ-step="2"');
  });

  it('generates HTML with progress indicator', () => {
    const result = generateWizard(baseSchema);
    expect(result.html).toContain('<nav data-civ-progress');
    expect(result.html).toContain('Personal Info');
    expect(result.html).toContain('Contact Info');
    expect(result.html).toContain('Review');
  });

  it('generates HTML with step navigation', () => {
    const result = generateWizard(baseSchema);
    expect(result.html).toContain('data-civ-step-nav');
    expect(result.html).toContain('data-civ-step-prev');
    expect(result.html).toContain('data-civ-step-next');
  });

  it('generates wizard JavaScript', () => {
    const result = generateWizard(baseSchema);
    expect(result.javascript).toContain('showStep');
    expect(result.javascript).toContain('stepCount = 3');
  });

  it('includes wizard in features', () => {
    const result = generateWizard(baseSchema);
    expect(result.features).toContain('wizard');
  });

  it('builds step summary with field counts and names', () => {
    const result = generateWizard(baseSchema);
    expect(result.stepSummary).toHaveLength(3);

    expect(result.stepSummary[0].stepIndex).toBe(0);
    expect(result.stepSummary[0].title).toBe('Personal Info');
    expect(result.stepSummary[0].description).toBe('Enter your personal details');
    expect(result.stepSummary[0].fieldCount).toBe(2);
    expect(result.stepSummary[0].fieldNames).toEqual(['first-name', 'last-name']);

    expect(result.stepSummary[1].stepIndex).toBe(1);
    expect(result.stepSummary[1].fieldCount).toBe(2);

    expect(result.stepSummary[2].stepIndex).toBe(2);
    expect(result.stepSummary[2].fieldCount).toBe(1);
    expect(result.stepSummary[2].fieldNames).toEqual(['agree']);
  });

  it('hides non-first step containers', () => {
    const result = generateWizard(baseSchema);
    expect(result.html).toContain('data-civ-step="0">');
    expect(result.html).toContain('data-civ-step="1" hidden>');
    expect(result.html).toContain('data-civ-step="2" hidden>');
  });

  it('throws when schema has no steps', () => {
    const noSteps: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    expect(() => generateWizard(noSteps)).toThrow('non-empty `steps`');
  });

  it('throws when steps array is empty', () => {
    const emptySteps: FormSchema = {
      steps: [],
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    expect(() => generateWizard(emptySteps)).toThrow('non-empty `steps`');
  });
});

import { describe, it, expect } from 'vitest';
import { generateFormChain } from './generate-form-chain.js';
import type { FormSchema } from '../schema/index.js';

describe('generateFormChain', () => {
  const schema: FormSchema = {
    formChain: {
      forms: [
        { schemaRef: 'personal-info', label: 'Personal Information' },
        {
          schemaRef: 'employment',
          label: 'Employment History',
          dependsOn: ['personal-info'],
          dataMapping: { 'applicant-name': 'employee-name' },
        },
        {
          schemaRef: 'review',
          label: 'Review & Submit',
          dependsOn: ['personal-info', 'employment'],
        },
      ],
    },
    sections: [],
  };

  it('throws when schema has no formChain config', () => {
    const noChain: FormSchema = { sections: [] };
    expect(() => generateFormChain(noChain)).toThrow(
      'Schema must have a formChain configuration',
    );
  });

  it('returns html, javascript, features, steps, dataMap', () => {
    const result = generateFormChain(schema);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('dataMap');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.steps)).toBe(true);
    expect(typeof result.dataMap).toBe('object');
  });

  it('steps has correct count and structure', () => {
    const result = generateFormChain(schema);
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0]).toEqual({
      ref: 'personal-info',
      label: 'Personal Information',
      dependsOn: [],
    });
    expect(result.steps[1]).toEqual({
      ref: 'employment',
      label: 'Employment History',
      dependsOn: ['personal-info'],
    });
    expect(result.steps[2]).toEqual({
      ref: 'review',
      label: 'Review & Submit',
      dependsOn: ['personal-info', 'employment'],
    });
  });

  it('HTML has data-civ-form-chain nav with aria-label', () => {
    const result = generateFormChain(schema);
    expect(result.html).toContain('<nav data-civ-form-chain');
    expect(result.html).toContain('aria-label="Form steps"');
  });

  it('step list renders as ol with li elements', () => {
    const result = generateFormChain(schema);
    expect(result.html).toContain('<ol');
    expect(result.html).toContain('</ol>');
    expect(result.html).toContain('<li data-civ-chain-step="personal-info"');
    expect(result.html).toContain('<li data-civ-chain-step="employment"');
    expect(result.html).toContain('<li data-civ-chain-step="review"');
  });

  it('first step is current (has aria-current="step") by default', () => {
    const result = generateFormChain(schema);
    expect(result.html).toContain('aria-current="step"');
    // The first step should contain the current marker with the label
    expect(result.html).toContain(
      '<span aria-current="step" class="civ-font-bold">Personal Information</span>',
    );
  });

  it('steps with unmet dependencies show locked indicator', () => {
    const result = generateFormChain(schema);
    // 'employment' depends on 'personal-info' which is not completed
    expect(result.html).toContain(
      '<li data-civ-chain-step="employment"><span class="civ-text-base-dark" aria-hidden="true">',
    );
    expect(result.html).toContain('Employment History');
    expect(result.html).toContain('(locked)');
  });

  it('content placeholder exists (data-civ-chain-content)', () => {
    const result = generateFormChain(schema);
    expect(result.html).toContain('data-civ-chain-content');
  });

  it('back button is disabled on first step', () => {
    const result = generateFormChain(schema);
    expect(result.html).toContain('data-civ-chain-prev');
    expect(result.html).toMatch(/data-civ-chain-prev[^>]*disabled/);
  });

  it('last step shows "Submit all" instead of "Next"', () => {
    const result = generateFormChain(schema, { currentStep: 2 });
    expect(result.html).toContain('>Submit all</button>');
    expect(result.html).not.toMatch(/>Next<\/button>/);
  });

  it('dataMap contains only steps with dataMapping', () => {
    const result = generateFormChain(schema);
    expect(Object.keys(result.dataMap)).toEqual(['employment']);
    expect(result.dataMap['employment']).toEqual({
      'applicant-name': 'employee-name',
    });
    expect(result.dataMap).not.toHaveProperty('personal-info');
    expect(result.dataMap).not.toHaveProperty('review');
  });

  it('completedSteps marks steps as completed (checkmark)', () => {
    const result = generateFormChain(schema, {
      currentStep: 1,
      completedSteps: ['personal-info'],
    });
    // personal-info should show checkmark
    expect(result.html).toContain('\u2713');
    expect(result.html).toContain('(completed)');
    // The completed step should have the success class
    expect(result.html).toContain('civ-text-success');
  });

  it('features always include form-chain and step-navigation', () => {
    const simpleSchema: FormSchema = {
      formChain: {
        forms: [{ schemaRef: 'only-form', label: 'Only Form' }],
      },
      sections: [],
    };
    const result = generateFormChain(simpleSchema);
    expect(result.features).toContain('form-chain');
    expect(result.features).toContain('step-navigation');
  });

  it('features include data-carry-over and locked-steps when applicable', () => {
    const result = generateFormChain(schema);
    // schema has dataMapping on employment -> data-carry-over
    expect(result.features).toContain('data-carry-over');
    // schema has dependsOn on employment and review -> locked-steps
    expect(result.features).toContain('locked-steps');

    // A schema without these should not have them
    const simpleSchema: FormSchema = {
      formChain: {
        forms: [
          { schemaRef: 'a', label: 'A' },
          { schemaRef: 'b', label: 'B' },
        ],
      },
      sections: [],
    };
    const simpleResult = generateFormChain(simpleSchema);
    expect(simpleResult.features).not.toContain('data-carry-over');
    expect(simpleResult.features).not.toContain('locked-steps');
  });

  describe('label escaping (XSS)', () => {
    const evilSchema: FormSchema = {
      formChain: {
        forms: [{ schemaRef: 'a', label: '<img src=x onerror=alert(1)>' }],
      },
      sections: [],
    };

    it('escapes a hostile label in the static step list markup', () => {
      const html = generateFormChain(evilSchema).html;
      expect(html).not.toContain('<img src=x onerror=alert(1)>');
      expect(html).toContain('&lt;img');
    });

    it('companion JS never assigns innerHTML (no label injection sink)', () => {
      // updateStepIndicators() re-renders labels on every Back/Next click.
      // step.label is injected raw via JSON.stringify(steps), so building
      // innerHTML from it would execute markup the static path escaped.
      const js = generateFormChain(evilSchema).javascript;
      expect(js).not.toMatch(/innerHTML\s*=/);
    });

    it('companion JS writes the label via textContent / a text node', () => {
      const js = generateFormChain(evilSchema).javascript;
      // The label reaches the DOM only through safe sinks.
      expect(js).toContain('.textContent = step.label');
      expect(js).toContain('createTextNode(" " + step.label + " ")');
      // Decorative icon + status spans are built as elements.
      expect(js).toContain('createElement("span")');
    });

    it('embeds the raw label only inside the JSON steps blob, not in markup', () => {
      const js = generateFormChain(evilSchema).javascript;
      // The one place the raw string legitimately appears is the JSON
      // data blob the JS reads from; it must be JSON-encoded there.
      expect(js).toContain(JSON.stringify([{ ref: 'a', label: '<img src=x onerror=alert(1)>', dependsOn: [] }]));
    });
  });
});

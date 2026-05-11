import { describe, it, expect } from 'vitest';
import { validateForms } from './validate-forms.js';

describe('validateForms', () => {
  it('validates multiple forms and returns results', () => {
    const result = validateForms([
      { id: 'form1', html: '<civ-form><civ-text-input label="Name" name="name"></civ-text-input></civ-form>' },
      { id: 'form2', html: '<civ-form><civ-text-input name="x"></civ-text-input></civ-form>' },
    ]);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].id).toBe('form1');
    expect(result.results[1].id).toBe('form2');
  });

  it('reports valid count in summary', () => {
    const result = validateForms([
      { id: 'ok', html: '<civ-form><civ-text-input label="Name" name="name"></civ-text-input></civ-form>' },
      { id: 'bad', html: '<civ-form><civ-text-input name="x"></civ-text-input></civ-form>' },
    ]);
    expect(result.summary).toBe('1/2 forms valid');
  });

  it('handles all valid forms', () => {
    const result = validateForms([
      { id: 'a', html: '<civ-form><civ-text-input label="A" name="a"></civ-text-input></civ-form>' },
      { id: 'b', html: '<civ-form><civ-text-input label="B" name="b"></civ-text-input></civ-form>' },
    ]);
    expect(result.summary).toBe('2/2 forms valid');
  });

  it('handles all invalid forms', () => {
    const result = validateForms([
      { id: 'a', html: '<civ-form><civ-text-input name="x"></civ-text-input></civ-form>' },
      { id: 'b', html: '<civ-form><civ-text-input name="y"></civ-text-input></civ-form>' },
    ]);
    expect(result.summary).toBe('0/2 forms valid');
  });

  it('handles single form', () => {
    const result = validateForms([
      { id: 'solo', html: '<civ-form><civ-text-input label="Name" name="name"></civ-text-input></civ-form>' },
    ]);
    expect(result.summary).toBe('1/1 form valid');
  });

  it('handles empty array', () => {
    const result = validateForms([]);
    expect(result.results).toHaveLength(0);
    expect(result.summary).toBe('0/0 forms valid');
  });

  it('passes config to each validation', () => {
    const result = validateForms(
      [
        { id: 'test', html: '<civ-form><civ-text-input name="email"></civ-text-input></civ-form>' },
      ],
      { suppressRules: ['missing-label'] },
    );
    expect(result.results[0].errors.filter((e) => e.rule === 'missing-label')).toHaveLength(0);
  });

  it('preserves individual validation results', () => {
    const result = validateForms([
      { id: 'has-errors', html: '<civ-form><civ-text-input name="x"></civ-text-input></civ-form>' },
    ]);
    expect(result.results[0].valid).toBe(false);
    expect(result.results[0].errors.length).toBeGreaterThan(0);
  });
});

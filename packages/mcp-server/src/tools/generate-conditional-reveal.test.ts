import { describe, it, expect } from 'vitest';
import { generateConditionalReveal } from './generate-conditional-reveal.js';
import type { FormField } from '../schema/index.js';

const textField: FormField = { type: 'text', name: 'details', label: 'Details' };
const selectField: FormField = {
  type: 'select',
  name: 'reason',
  label: 'Reason',
  options: [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ],
};

describe('generateConditionalReveal', () => {
  it('throws when trigger is missing fieldName', () => {
    expect(() =>
      generateConditionalReveal({ fieldName: '', value: 'yes' }, [textField]),
    ).toThrow('Trigger field configuration is required');
  });

  it('throws when revealedFields is empty', () => {
    expect(() =>
      generateConditionalReveal({ fieldName: 'q', value: 'yes' }, []),
    ).toThrow('At least one revealed field is required');
  });

  it('returns html, javascript, features, triggerField, revealedFieldNames', () => {
    const result = generateConditionalReveal(
      { fieldName: 'hasDetails', value: 'yes' },
      [textField],
    );
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('triggerField');
    expect(result).toHaveProperty('revealedFieldNames');
    expect(result.triggerField).toBe('hasDetails');
    expect(result.revealedFieldNames).toEqual(['details']);
  });

  it('HTML has data-civ-conditional-trigger and data-civ-conditional', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
    );
    expect(result.html).toContain('data-civ-conditional-trigger');
    expect(result.html).toContain('data-civ-conditional');
  });

  it('reveal container has hidden attribute in show mode (default)', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
    );
    expect(result.html).toContain('data-civ-conditional');
    expect(result.html).toMatch(/id="reveal-q"[^>]*hidden/);
  });

  it('reveal container does not have hidden attribute in hide mode', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
      { mode: 'hide' },
    );
    expect(result.html).not.toMatch(/id="reveal-q"[^>]*hidden/);
  });

  it('aria-expanded and aria-controls are set on trigger', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
    );
    expect(result.html).toContain('aria-expanded=');
    expect(result.html).toContain('aria-controls="reveal-q"');
  });

  it('features reflect show-mode by default', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
    );
    expect(result.features).toContain('conditional-reveal');
    expect(result.features).toContain('aria-expanded');
    expect(result.features).toContain('aria-controls');
    expect(result.features).toContain('show-mode');
  });

  it('features reflect hide-mode when specified', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
      { mode: 'hide' },
    );
    expect(result.features).toContain('hide-mode');
    expect(result.features).not.toContain('show-mode');
  });

  it('JS includes input and change event listeners', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
    );
    expect(result.javascript).toContain('"input"');
    expect(result.javascript).toContain('"change"');
  });

  it('JS dispatches civ-conditional-change event', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [textField],
    );
    expect(result.javascript).toContain('civ-conditional-change');
  });

  it('renders select fields with options', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'yes' },
      [selectField],
    );
    expect(result.html).toContain('civ-select');
    expect(result.html).toContain('Option A');
    expect(result.html).toContain('Option B');
  });

  it('supports neq operator in JS', () => {
    const result = generateConditionalReveal(
      { fieldName: 'q', value: 'no', operator: 'neq' },
      [textField],
    );
    expect(result.javascript).toContain('!==');
  });
});

import { describe, it, expect } from 'vitest';
import { type html, render } from 'lit';
import {
  renderLabel,
  renderLegend,
  renderHint,
  renderError,
  inputClasses,
} from './form-templates.js';

function renderToString(template: unknown): string {
  const container = document.createElement('div');
  render(template as ReturnType<typeof html>, container);
  return container.innerHTML;
}

describe('renderLabel', () => {
  it('returns nothing when label is empty', () => {
    const result = renderLabel({ label: '', inputId: 'x', required: false });
    const output = renderToString(result);
    expect(output).not.toContain('<label');
  });

  it('renders a label with for attribute and civ-label class', () => {
    const result = renderLabel({ label: 'Email', inputId: 'email-1', required: false });
    const output = renderToString(result);
    expect(output).toContain('<label');
    expect(output).toContain('for="email-1"');
    expect(output).toContain('Email');
    expect(output).toContain('civ-label');
    expect(output).not.toContain('(required)');
  });

  it('renders required indicator with civ-required-mark', () => {
    const result = renderLabel({ label: 'Name', inputId: 'name-1', required: true });
    const output = renderToString(result);
    expect(output).toContain('(required)');
    expect(output).toContain('civ-required-mark');
  });

  it('renders optional labelId', () => {
    const result = renderLabel({ label: 'Search', inputId: 'search-1', required: false, labelId: 'lbl-1' });
    const output = renderToString(result);
    expect(output).toContain('id="lbl-1"');
  });

  it('omits id attribute when labelId is not provided', () => {
    const result = renderLabel({ label: 'Test', inputId: 'i1', required: false });
    const container = document.createElement('div');
    render(result as ReturnType<typeof html>, container);
    const label = container.querySelector('label');
    expect(label?.hasAttribute('id')).toBe(false);
  });

  it('omits for attribute when inputId is empty', () => {
    const result = renderLabel({ label: 'Group label', inputId: '', required: false });
    const container = document.createElement('div');
    render(result as ReturnType<typeof html>, container);
    const label = container.querySelector('label');
    expect(label?.hasAttribute('for')).toBe(false);
  });
});

describe('renderLegend', () => {
  it('returns nothing when legend is empty', () => {
    const result = renderLegend({ legend: '', required: false });
    const output = renderToString(result);
    expect(output).not.toContain('<legend');
  });

  it('renders legend with civ-legend class', () => {
    const result = renderLegend({ legend: 'Options', required: false });
    const output = renderToString(result);
    expect(output).toContain('<legend');
    expect(output).toContain('Options');
    expect(output).toContain('civ-legend');
  });

  it('renders required indicator with civ-required-mark', () => {
    const result = renderLegend({ legend: 'Choose one', required: true });
    const output = renderToString(result);
    expect(output).toContain('(required)');
    expect(output).toContain('civ-required-mark');
  });

  it('accepts custom text size class', () => {
    const result = renderLegend({ legend: 'Section', required: false, textSizeClass: 'civ-text-lg' });
    const output = renderToString(result);
    expect(output).toContain('civ-text-lg');
  });

  it('renders optional legendId', () => {
    const result = renderLegend({ legend: 'Group', required: false, legendId: 'leg-1' });
    const output = renderToString(result);
    expect(output).toContain('id="leg-1"');
  });

  it('renders sr-only legend when srOnly is true', () => {
    const result = renderLegend({ legend: 'Controls', required: false, srOnly: true });
    const output = renderToString(result);
    expect(output).toContain('<legend');
    expect(output).toContain('civ-sr-only');
    expect(output).toContain('Controls');
    expect(output).not.toContain('civ-font-bold');
  });

  it('includes required text when srOnly is true', () => {
    const result = renderLegend({ legend: 'Controls', required: true, srOnly: true });
    const output = renderToString(result);
    expect(output).toContain('(required)');
  });
});

describe('renderHint', () => {
  it('returns nothing when text is empty', () => {
    const result = renderHint('h1', '');
    const output = renderToString(result);
    expect(output).not.toContain('<span');
  });

  it('renders hint with civ-hint class and default spacing', () => {
    const result = renderHint('hint-1', 'Enter your email');
    const output = renderToString(result);
    expect(output).toContain('id="hint-1"');
    expect(output).toContain('Enter your email');
    expect(output).toContain('civ-hint');
    expect(output).not.toContain('civ-hint--group');
  });

  it('uses group spacing class when requested', () => {
    const result = renderHint('hint-2', 'Pick one', true);
    const output = renderToString(result);
    expect(output).toContain('civ-hint--group');
  });
});

describe('renderError', () => {
  it('returns nothing when text is empty', () => {
    const result = renderError('e1', '');
    const output = renderToString(result);
    expect(output).not.toContain('<span');
  });

  it('renders error with civ-error-text class and role="alert"', () => {
    const result = renderError('err-1', 'Field is required');
    const output = renderToString(result);
    expect(output).toContain('id="err-1"');
    expect(output).toContain('role="alert"');
    expect(output).toContain('Field is required');
    expect(output).toContain('civ-error-text');
    expect(output).not.toContain('civ-error-text--group');
  });

  it('uses group spacing class when requested', () => {
    const result = renderError('err-2', 'Select an option', true);
    const output = renderToString(result);
    expect(output).toContain('civ-error-text--group');
  });
});

describe('inputClasses', () => {
  it('returns civ-input base class with no arguments', () => {
    const result = inputClasses();
    expect(result).toContain('civ-input');
    expect(result).toContain('focus-visible:civ-focus-ring');
  });

  it('appends extra classes', () => {
    const result = inputClasses({ extra: ['civ-resize-y', 'civ-max-w-full'] });
    expect(result).toContain('civ-input');
    expect(result).toContain('civ-resize-y');
    expect(result).toContain('civ-max-w-full');
  });

  it('overrides rounded class', () => {
    const result = inputClasses({ rounded: 'civ-rounded-s' });
    expect(result).toContain('civ-rounded-s');
  });

  it('overrides width class', () => {
    const result = inputClasses({ width: 'civ-w-40' });
    expect(result).toContain('civ-w-40');
  });
});

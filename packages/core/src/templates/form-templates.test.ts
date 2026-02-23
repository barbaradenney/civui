import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';
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

  it('renders a label with for attribute', () => {
    const result = renderLabel({ label: 'Email', inputId: 'email-1', required: false });
    const output = renderToString(result);
    expect(output).toContain('<label');
    expect(output).toContain('for="email-1"');
    expect(output).toContain('Email');
    expect(output).not.toContain('<abbr');
  });

  it('renders required indicator', () => {
    const result = renderLabel({ label: 'Name', inputId: 'name-1', required: true });
    const output = renderToString(result);
    expect(output).toContain('<abbr');
    expect(output).toContain('title="required"');
    expect(output).toContain('*');
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

  it('renders legend with default text size', () => {
    const result = renderLegend({ legend: 'Options', required: false });
    const output = renderToString(result);
    expect(output).toContain('<legend');
    expect(output).toContain('Options');
    expect(output).toContain('civ-text-base');
  });

  it('renders required indicator', () => {
    const result = renderLegend({ legend: 'Choose one', required: true });
    const output = renderToString(result);
    expect(output).toContain('<abbr');
    expect(output).toContain('*');
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

  it('ignores required indicator when srOnly is true', () => {
    const result = renderLegend({ legend: 'Controls', required: true, srOnly: true });
    const output = renderToString(result);
    expect(output).not.toContain('<abbr');
    expect(output).not.toContain('*');
  });
});

describe('renderHint', () => {
  it('returns nothing when text is empty', () => {
    const result = renderHint('h1', '');
    const output = renderToString(result);
    expect(output).not.toContain('<span');
  });

  it('renders hint with id and default spacing', () => {
    const result = renderHint('hint-1', 'Enter your email');
    const output = renderToString(result);
    expect(output).toContain('id="hint-1"');
    expect(output).toContain('Enter your email');
    expect(output).toContain('civ-mb-1');
    expect(output).not.toContain('civ-mb-2');
  });

  it('uses group spacing when requested', () => {
    const result = renderHint('hint-2', 'Pick one', true);
    const output = renderToString(result);
    expect(output).toContain('civ-mb-2');
  });
});

describe('renderError', () => {
  it('returns nothing when text is empty', () => {
    const result = renderError('e1', '');
    const output = renderToString(result);
    expect(output).not.toContain('<span');
  });

  it('renders error with role="alert" and default spacing', () => {
    const result = renderError('err-1', 'Field is required');
    const output = renderToString(result);
    expect(output).toContain('id="err-1"');
    expect(output).toContain('role="alert"');
    expect(output).toContain('Field is required');
    expect(output).toContain('civ-text-error');
    expect(output).toContain('civ-mb-1');
  });

  it('uses group spacing when requested', () => {
    const result = renderError('err-2', 'Select an option', true);
    const output = renderToString(result);
    expect(output).toContain('civ-mb-2');
  });
});

describe('inputClasses', () => {
  it('returns base classes with no arguments', () => {
    const result = inputClasses();
    expect(result).toContain('civ-block');
    expect(result).toContain('civ-w-full');
    expect(result).toContain('civ-border');
    expect(result).toContain('civ-rounded');
    expect(result).toContain('civ-border-base-light');
    expect(result).toContain('focus-visible:civ-focus-ring');
    expect(result).not.toContain('civ-border-error');
  });

  it('includes error border when error is set', () => {
    const result = inputClasses({ error: 'Bad input' });
    expect(result).toContain('civ-border-error');
    expect(result).toContain('civ-border-l-4');
    expect(result).not.toContain('civ-border-base-light');
  });

  it('includes disabled classes when disabled', () => {
    const result = inputClasses({ disabled: true });
    expect(result).toContain('civ-opacity-50');
    expect(result).toContain('civ-cursor-not-allowed');
    expect(result).toContain('civ-bg-base-lightest');
  });

  it('appends extra classes', () => {
    const result = inputClasses({ extra: ['civ-resize-y', 'civ-max-w-full'] });
    expect(result).toContain('civ-resize-y');
    expect(result).toContain('civ-max-w-full');
  });

  it('overrides rounded class', () => {
    const result = inputClasses({ rounded: 'civ-rounded-l' });
    expect(result).toContain('civ-rounded-l');
    const classes = result.split(' ');
    expect(classes).not.toContain('civ-rounded');
  });

  it('overrides width class', () => {
    const result = inputClasses({ width: 'civ-w-40' });
    expect(result).toContain('civ-w-40');
    expect(result).not.toContain('civ-w-full');
  });
});

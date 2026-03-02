import { describe, it, expect } from 'vitest';
import { generateConfirmationPage } from './generate-confirmation-page.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  title: 'Benefits Application',
  sections: [{
    heading: 'Personal Info',
    fields: [
      { type: 'text', name: 'first-name', label: 'First name' },
      { type: 'text', name: 'last-name', label: 'Last name' },
    ],
  }],
};

describe('generateConfirmationPage', () => {
  it('returns html, javascript, features, and confirmationNumber', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    });
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('confirmationNumber');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(typeof result.confirmationNumber).toBe('string');
  });

  it('confirmation number starts with CIV- and is 12 chars total', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    });
    expect(result.confirmationNumber).toMatch(/^CIV-/);
    expect(result.confirmationNumber).toHaveLength(12);
  });

  it('confirmation number is deterministic (same inputs = same output)', () => {
    const data = { 'first-name': 'Jane', 'last-name': 'Doe' };
    const a = generateConfirmationPage(schema, data);
    const b = generateConfirmationPage(schema, data);
    expect(a.confirmationNumber).toBe(b.confirmationNumber);
  });

  it('HTML contains data-civ-confirmation wrapper', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    });
    expect(result.html).toContain('data-civ-confirmation');
  });

  it('HTML has success banner with role="status"', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    });
    expect(result.html).toContain('role="status"');
    expect(result.html).toContain('Your form has been submitted');
  });

  it('submission summary renders field labels and values via dl/dt/dd', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    });
    expect(result.html).toContain('<dl>');
    expect(result.html).toContain('<dt>First name</dt>');
    expect(result.html).toContain('<dd>Jane</dd>');
    expect(result.html).toContain('<dt>Last name</dt>');
    expect(result.html).toContain('<dd>Doe</dd>');
  });

  it('missing values show "Not provided"', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
    });
    expect(result.html).toContain('<dd>Jane</dd>');
    expect(result.html).toContain('<dd><em>Not provided</em></dd>');
  });

  it('default next steps are shown (3 default items in ol)', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    });
    expect(result.html).toContain('<ol>');
    expect(result.html).toContain('We will review your submission');
    expect(result.html).toContain('You will receive a decision within 10 business days');
    expect(result.html).toContain('Check your email for updates');
    const liMatches = result.html.match(/<li>/g);
    expect(liMatches).toHaveLength(3);
  });

  it('custom next steps override defaults', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    }, {
      nextSteps: ['Step A', 'Step B'],
    });
    expect(result.html).toContain('<li>Step A</li>');
    expect(result.html).toContain('<li>Step B</li>');
    expect(result.html).not.toContain('We will review your submission');
    const liMatches = result.html.match(/<li>/g);
    expect(liMatches).toHaveLength(2);
  });

  it('showNextSteps: false hides next steps section', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    }, {
      showNextSteps: false,
    });
    expect(result.html).not.toContain('<ol>');
    expect(result.html).not.toContain('What happens next');
    expect(result.features).not.toContain('next-steps');
  });

  it('agency name appears when provided', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
    }, {
      agency: 'Department of Veterans Affairs',
    });
    expect(result.html).toContain('Agency: Department of Veterans Affairs');
    expect(result.features).toContain('agency-header');
  });

  it('escapes HTML in submitted values to prevent XSS', () => {
    const result = generateConfirmationPage(schema, {
      'first-name': '<script>alert("xss")</script>',
      'last-name': 'Doe',
    });
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
  });
});

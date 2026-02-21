import { describe, it, expect } from 'vitest';
import { validateFormContent } from './validate-content.js';

describe('validateFormContent', () => {
  it('passes valid form content', () => {
    const data = {
      fields: {
        email: { label: 'Email', errors: { required: 'Required' } },
        password: { label: 'Password' },
      },
    };
    expect(validateFormContent(data, 'login.json')).toEqual([]);
  });

  it('passes content with meta', () => {
    const data = {
      meta: { title: 'Login', submitLabel: 'Sign in' },
      fields: { email: { label: 'Email' } },
    };
    expect(validateFormContent(data, 'login.json')).toEqual([]);
  });

  it('rejects non-object content', () => {
    const issues = validateFormContent('not an object', 'bad.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('Content must be an object.');
  });

  it('rejects null', () => {
    const issues = validateFormContent(null, 'bad.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('error');
  });

  it('rejects missing fields', () => {
    const issues = validateFormContent({ meta: {} }, 'bad.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('"fields" object is required.');
  });

  it('rejects field without label', () => {
    const data = { fields: { email: { hint: 'Enter email' } } };
    const issues = validateFormContent(data, 'test.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('must have a "label" string');
  });

  it('rejects empty label', () => {
    const data = { fields: { email: { label: '  ' } } };
    const issues = validateFormContent(data, 'test.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('empty label');
  });

  it('rejects non-object field', () => {
    const data = { fields: { email: 'not an object' } };
    const issues = validateFormContent(data, 'test.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('must be an object');
  });

  it('rejects non-string error message', () => {
    const data = { fields: { email: { label: 'Email', errors: { required: 123 } } } };
    const issues = validateFormContent(data, 'test.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('must be a string');
  });

  it('rejects array errors', () => {
    const data = { fields: { email: { label: 'Email', errors: ['required'] } } };
    const issues = validateFormContent(data, 'test.json');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('errors must be an object');
  });

  it('collects multiple issues', () => {
    const data = {
      fields: {
        email: { hint: 'No label' },
        password: { label: '' },
      },
    };
    const issues = validateFormContent(data, 'test.json');
    expect(issues).toHaveLength(2);
  });
});

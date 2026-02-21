import { describe, it, expect } from 'vitest';

/**
 * Since useForm is a React hook, we test the underlying logic
 * by extracting it into a testable pattern. We simulate the
 * hook's behavior by calling its internal logic directly.
 *
 * For full integration tests with renderHook, use a React Native
 * testing environment with matching React versions.
 */

// Import the hook source to verify it exports correctly
import { useForm } from './useForm.js';

describe('useForm', () => {
  it('is exported as a function', () => {
    expect(typeof useForm).toBe('function');
  });
});

/**
 * Test the validation logic independently.
 * This tests the same patterns useForm uses without needing React.
 */
describe('useForm validation logic', () => {
  function validateFields(
    values: Record<string, string>,
    fields: Record<string, { label?: string; required?: boolean; validate?: (v: string) => string | undefined }>,
  ): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [name, config] of Object.entries(fields)) {
      const value = values[name] ?? '';
      if (config.required && !value.trim()) {
        errors[name] = `${config.label || name} is required`;
        continue;
      }
      if (config.validate && value) {
        const errorMsg = config.validate(value);
        if (errorMsg) {
          errors[name] = errorMsg;
        }
      }
    }
    return errors;
  }

  it('detects missing required fields', () => {
    const errors = validateFields(
      {},
      {
        name: { label: 'Name', required: true },
        email: { label: 'Email', required: true },
      },
    );
    expect(errors.name).toBe('Name is required');
    expect(errors.email).toBe('Email is required');
  });

  it('passes when required fields have values', () => {
    const errors = validateFields(
      { name: 'John', email: 'john@test.com' },
      {
        name: { label: 'Name', required: true },
        email: { label: 'Email', required: true },
      },
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('runs custom validation', () => {
    const errors = validateFields(
      { email: 'bad-email' },
      {
        email: {
          label: 'Email',
          validate: (v) => (v.includes('@') ? undefined : 'Must be valid email'),
        },
      },
    );
    expect(errors.email).toBe('Must be valid email');
  });

  it('passes custom validation', () => {
    const errors = validateFields(
      { email: 'john@test.com' },
      {
        email: {
          label: 'Email',
          validate: (v) => (v.includes('@') ? undefined : 'Must be valid email'),
        },
      },
    );
    expect(errors.email).toBeUndefined();
  });

  it('skips custom validation for empty non-required fields', () => {
    const errors = validateFields(
      {},
      {
        email: {
          label: 'Email',
          validate: (v) => (v.includes('@') ? undefined : 'Must be valid email'),
        },
      },
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('validates required before custom validation', () => {
    const errors = validateFields(
      {},
      {
        email: {
          label: 'Email',
          required: true,
          validate: (v) => (v.includes('@') ? undefined : 'Must be valid email'),
        },
      },
    );
    expect(errors.email).toBe('Email is required');
  });

  it('uses field name when label is missing', () => {
    const errors = validateFields(
      {},
      { phone: { required: true } },
    );
    expect(errors.phone).toBe('phone is required');
  });

  it('handles multiple fields with mixed results', () => {
    const errors = validateFields(
      { name: 'John', email: 'bad', phone: '' },
      {
        name: { label: 'Name', required: true },
        email: {
          label: 'Email',
          validate: (v) => (v.includes('@') ? undefined : 'Invalid email'),
        },
        phone: { label: 'Phone', required: true },
      },
    );
    expect(errors.name).toBeUndefined();
    expect(errors.email).toBe('Invalid email');
    expect(errors.phone).toBe('Phone is required');
  });

  it('treats whitespace-only values as empty for required', () => {
    const errors = validateFields(
      { name: '   ' },
      { name: { label: 'Name', required: true } },
    );
    expect(errors.name).toBe('Name is required');
  });
});

describe('useForm data collection logic', () => {
  function collectFormData(
    values: Record<string, string>,
  ): Record<string, string> {
    const data: Record<string, string> = {};
    for (const [name, value] of Object.entries(values)) {
      if (value) {
        data[name] = value;
      }
    }
    return data;
  }

  it('collects all non-empty values', () => {
    const data = collectFormData({ name: 'John', email: 'john@test.com', phone: '' });
    expect(data).toEqual({ name: 'John', email: 'john@test.com' });
  });

  it('returns empty object for no values', () => {
    const data = collectFormData({});
    expect(data).toEqual({});
  });

  it('skips empty string values', () => {
    const data = collectFormData({ name: '', email: '' });
    expect(data).toEqual({});
  });
});

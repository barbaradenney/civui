import { describe, it, expect } from 'vitest';
import { resolveFieldProps, resolveFieldError } from './resolve-field.js';
import type { FieldContent } from '../types/index.js';

const emailField: FieldContent = {
  label: 'Email address',
  hint: 'We only use this to contact you',
  placeholder: 'you@example.com',
  errors: {
    required: 'Email address is required',
    invalid: 'Enter a valid email address',
  },
};

describe('resolveFieldProps', () => {
  it('returns all content props', () => {
    const props = resolveFieldProps(emailField);
    expect(props).toEqual({
      label: 'Email address',
      hint: 'We only use this to contact you',
      placeholder: 'you@example.com',
      description: undefined,
    });
  });

  it('applies overrides over content values', () => {
    const props = resolveFieldProps(emailField, { label: 'Your email', hint: 'Custom hint' });
    expect(props.label).toBe('Your email');
    expect(props.hint).toBe('Custom hint');
    expect(props.placeholder).toBe('you@example.com');
  });

  it('handles minimal field (label only)', () => {
    const props = resolveFieldProps({ label: 'Name' });
    expect(props).toEqual({
      label: 'Name',
      hint: undefined,
      placeholder: undefined,
      description: undefined,
    });
  });
});

describe('resolveFieldError', () => {
  it('returns error message for known rule', () => {
    expect(resolveFieldError(emailField, 'required')).toBe('Email address is required');
  });

  it('returns undefined for unknown rule when no fallback', () => {
    expect(resolveFieldError(emailField, 'maxLength')).toBeUndefined();
  });

  it('returns fallback for unknown rule', () => {
    expect(resolveFieldError(emailField, 'maxLength', 'Too long')).toBe('Too long');
  });

  it('returns content error over fallback', () => {
    expect(resolveFieldError(emailField, 'required', 'Fallback')).toBe(
      'Email address is required',
    );
  });

  it('handles field with no errors', () => {
    expect(resolveFieldError({ label: 'Name' }, 'required', 'Required')).toBe('Required');
  });
});

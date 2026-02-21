import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFieldContent } from './use-field-content.js';
import { registerContent, clearRegistry } from '../loader/load-content.js';
import type { FormContent } from '../types/index.js';

const loginContent: FormContent = {
  fields: {
    email: {
      label: 'Email address',
      hint: 'We only use this to contact you',
      placeholder: 'you@example.com',
      errors: {
        required: 'Email address is required',
        invalid: 'Enter a valid email address',
      },
    },
    password: {
      label: 'Password',
    },
  },
};

describe('useFieldContent', () => {
  beforeEach(() => {
    clearRegistry();
    registerContent('forms/login', loginContent);
  });

  it('returns resolved field props', () => {
    const { result } = renderHook(() => useFieldContent('forms/login', 'email'));
    expect(result.current.label).toBe('Email address');
    expect(result.current.hint).toBe('We only use this to contact you');
    expect(result.current.placeholder).toBe('you@example.com');
  });

  it('provides error() helper', () => {
    const { result } = renderHook(() => useFieldContent('forms/login', 'email'));
    expect(result.current.error('required')).toBe('Email address is required');
    expect(result.current.error('maxLength')).toBeUndefined();
    expect(result.current.error('maxLength', 'Too long')).toBe('Too long');
  });

  it('works with minimal field', () => {
    const { result } = renderHook(() => useFieldContent('forms/login', 'password'));
    expect(result.current.label).toBe('Password');
    expect(result.current.hint).toBeUndefined();
    expect(result.current.error('required')).toBeUndefined();
  });

  it('throws for missing field', () => {
    expect(() => renderHook(() => useFieldContent('forms/login', 'nonexistent'))).toThrow(
      'Field "nonexistent" not found in content "forms/login"',
    );
  });

  it('throws for missing content key', () => {
    expect(() => renderHook(() => useFieldContent('forms/missing', 'email'))).toThrow(
      'Content not registered for key "forms/missing"',
    );
  });
});

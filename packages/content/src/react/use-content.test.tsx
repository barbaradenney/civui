import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useContent } from './use-content.js';
import { registerContent, clearRegistry } from '../loader/load-content.js';
import type { FormContent } from '../types/index.js';

const loginContent: FormContent = {
  meta: { title: 'Sign in', submitLabel: 'Sign in' },
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
      errors: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
      },
    },
  },
};

describe('useContent', () => {
  beforeEach(() => {
    clearRegistry();
    registerContent('forms/login', loginContent);
  });

  it('returns the full content object', () => {
    const { result } = renderHook(() => useContent('forms/login'));
    expect(result.current.content).toBe(loginContent);
  });

  it('throws for unregistered key', () => {
    expect(() => renderHook(() => useContent('forms/missing'))).toThrow(
      'Content not registered for key "forms/missing"',
    );
  });

  describe('field()', () => {
    it('returns field content by name', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      expect(result.current.field('email')?.label).toBe('Email address');
    });

    it('returns undefined for missing field', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      expect(result.current.field('nonexistent')).toBeUndefined();
    });
  });

  describe('fieldProps()', () => {
    it('returns resolved props for a field', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      const props = result.current.fieldProps('email');
      expect(props).toEqual({
        label: 'Email address',
        hint: 'We only use this to contact you',
        placeholder: 'you@example.com',
        description: undefined,
      });
    });

    it('applies overrides', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      const props = result.current.fieldProps('email', { label: 'Your email' });
      expect(props.label).toBe('Your email');
      expect(props.hint).toBe('We only use this to contact you');
    });

    it('throws for missing field', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      expect(() => result.current.fieldProps('nonexistent')).toThrow(
        'Field "nonexistent" not found in content "forms/login"',
      );
    });
  });

  describe('fieldError()', () => {
    it('returns error message for known rule', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      expect(result.current.fieldError('email', 'required')).toBe('Email address is required');
    });

    it('returns fallback for missing field', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      expect(result.current.fieldError('nonexistent', 'required', 'Required')).toBe('Required');
    });

    it('returns undefined for unknown rule without fallback', () => {
      const { result } = renderHook(() => useContent('forms/login'));
      expect(result.current.fieldError('email', 'maxLength')).toBeUndefined();
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { registerContent, getContent, getFieldContent, clearRegistry } from './load-content.js';
import type { FormContent } from '../types/index.js';

const loginContent: FormContent = {
  meta: { title: 'Sign in' },
  fields: {
    email: {
      label: 'Email address',
      hint: 'We only use this to contact you',
      errors: { required: 'Email address is required' },
    },
    password: {
      label: 'Password',
    },
  },
};

describe('load-content', () => {
  beforeEach(() => {
    clearRegistry();
  });

  describe('registerContent / getContent', () => {
    it('registers and retrieves content by key', () => {
      registerContent('forms/login', loginContent);
      expect(getContent('forms/login')).toBe(loginContent);
    });

    it('throws when key is not registered', () => {
      expect(() => getContent('forms/missing')).toThrow(
        'Content not registered for key "forms/missing"',
      );
    });

    it('overwrites existing key', () => {
      registerContent('forms/login', loginContent);
      const updated: FormContent = { fields: { name: { label: 'Name' } } };
      registerContent('forms/login', updated);
      expect(getContent('forms/login')).toBe(updated);
    });
  });

  describe('getFieldContent', () => {
    it('returns field content by name', () => {
      registerContent('forms/login', loginContent);
      const field = getFieldContent('forms/login', 'email');
      expect(field?.label).toBe('Email address');
      expect(field?.hint).toBe('We only use this to contact you');
    });

    it('returns undefined for missing field', () => {
      registerContent('forms/login', loginContent);
      expect(getFieldContent('forms/login', 'nonexistent')).toBeUndefined();
    });
  });

  describe('clearRegistry', () => {
    it('removes all registered content', () => {
      registerContent('forms/login', loginContent);
      clearRegistry();
      expect(() => getContent('forms/login')).toThrow();
    });
  });
});

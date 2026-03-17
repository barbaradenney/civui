import { describe, it, expect, afterEach } from 'vitest';
import { t, setLocaleStrings, resetLocaleStrings, getLocaleStrings } from './locale.js';

afterEach(() => {
  resetLocaleStrings();
});

describe('i18n locale', () => {
  it('returns default English strings', () => {
    expect(t('required')).toBe('(required)');
    expect(t('selectEmpty')).toBe('- Select -');
    expect(t('comboboxNoResults')).toBe('No results found');
  });

  it('overrides specific strings', () => {
    setLocaleStrings({ required: '(obligatorio)', selectEmpty: '- Seleccionar -' });
    expect(t('required')).toBe('(obligatorio)');
    expect(t('selectEmpty')).toBe('- Seleccionar -');
    // Non-overridden strings still return English
    expect(t('comboboxNoResults')).toBe('No results found');
  });

  it('resets to defaults', () => {
    setLocaleStrings({ required: '(obligatorio)' });
    expect(t('required')).toBe('(obligatorio)');
    resetLocaleStrings();
    expect(t('required')).toBe('(required)');
  });

  it('getLocaleStrings returns all current strings', () => {
    const strings = getLocaleStrings();
    expect(strings.required).toBe('(required)');
    expect(strings.formErrorSingular).toBe('There is 1 error in this form');
  });

  it('partial override preserves other defaults', () => {
    setLocaleStrings({ required: '必須' });
    const strings = getLocaleStrings();
    expect(strings.required).toBe('必須');
    expect(strings.selectEmpty).toBe('- Select -');
    expect(strings.fileUploadDragText).toBe('Drag files here or');
  });
});

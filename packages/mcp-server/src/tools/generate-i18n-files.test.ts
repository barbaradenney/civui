import { describe, it, expect } from 'vitest';
import { generateI18nFiles } from './generate-i18n-files.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  title: 'Benefits Form',
  description: 'Apply for benefits',
  sections: [{
    fields: [
      { type: 'text', name: 'full-name', label: 'Full name', hint: 'Enter your full legal name', placeholder: 'John Doe' },
      { type: 'email', name: 'email', label: 'Email address' },
    ],
  }],
};

describe('generateI18nFiles', () => {
  it('produces base locale bundle with label strings', () => {
    const result = generateI18nFiles(schema);
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base).toBeDefined();
    expect(base.strings['full-name.label']).toBe('Full name');
    expect(base.strings['email.label']).toBe('Email address');
  });

  it('includes hint strings when present', () => {
    const result = generateI18nFiles(schema);
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['full-name.hint']).toBe('Enter your full legal name');
    expect(base.strings['email.hint']).toBeUndefined();
  });

  it('includes placeholder strings when present', () => {
    const result = generateI18nFiles(schema);
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['full-name.placeholder']).toBe('John Doe');
    expect(base.strings['email.placeholder']).toBeUndefined();
  });

  it('includes option labels when includeOptions is true', () => {
    const withOptions: FormSchema = {
      sections: [{
        fields: [
          { type: 'select', name: 'state', label: 'State', options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
          ]},
        ],
      }],
    };
    const result = generateI18nFiles(withOptions, { includeOptions: true });
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['state.option.ca']).toBe('California');
    expect(base.strings['state.option.ny']).toBe('New York');
  });

  it('excludes option labels when includeOptions is false', () => {
    const withOptions: FormSchema = {
      sections: [{
        fields: [
          { type: 'select', name: 'state', label: 'State', options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
          ]},
        ],
      }],
    };
    const result = generateI18nFiles(withOptions, { includeOptions: false });
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['state.option.ca']).toBeUndefined();
    expect(base.strings['state.option.ny']).toBeUndefined();
  });

  it('includes error messages when includeErrors is true', () => {
    const requiredSchema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'full-name', label: 'Full name', required: true },
        ],
      }],
    };
    const result = generateI18nFiles(requiredSchema, { includeErrors: true });
    const base = result.bundles.find((b) => b.locale === 'en')!;
    const errorKeys = Object.keys(base.strings).filter((k) => k.includes('.error.'));
    expect(errorKeys.length).toBeGreaterThan(0);
    expect(result.features).toContain('errors');
  });

  it('target locale has TODO placeholders', () => {
    const result = generateI18nFiles(schema);
    const es = result.bundles.find((b) => b.locale === 'es')!;
    expect(es).toBeDefined();
    for (const value of Object.values(es.strings)) {
      expect(value).toMatch(/^\[TODO: translate\] /);
    }
  });

  it('supports multiple target locales', () => {
    const result = generateI18nFiles(schema, { targetLocales: ['es', 'fr'] });
    expect(result.targetLocales).toEqual(['es', 'fr']);
    const es = result.bundles.find((b) => b.locale === 'es');
    const fr = result.bundles.find((b) => b.locale === 'fr');
    expect(es).toBeDefined();
    expect(fr).toBeDefined();
    expect(result.bundles).toHaveLength(3); // en + es + fr
  });

  it('uses custom base locale', () => {
    const result = generateI18nFiles(schema, { baseLocale: 'fr' });
    expect(result.baseLocale).toBe('fr');
    const base = result.bundles.find((b) => b.locale === 'fr')!;
    expect(base).toBeDefined();
    expect(base.strings['full-name.label']).toBe('Full name');
  });

  it('uses flat key format by default', () => {
    const result = generateI18nFiles(schema);
    const base = result.bundles.find((b) => b.locale === 'en')!;
    // Flat keys use dot-separated format like "fieldname.label"
    const keys = Object.keys(base.strings);
    for (const key of keys) {
      expect(key).toContain('.');
    }
    expect(base.strings['full-name.label']).toBe('Full name');
    expect(base.strings['meta.title']).toBe('Benefits Form');
  });

  it('supports nested key format', () => {
    const result = generateI18nFiles(schema, { keyFormat: 'nested' });
    expect(result.features).toContain('nested-keys');
    // The bundles still have flat strings internally for count tracking,
    // but the feature flag is set
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['full-name.label']).toBe('Full name');
  });

  it('includes meta strings (title, description, submitLabel)', () => {
    const result = generateI18nFiles(schema);
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['meta.title']).toBe('Benefits Form');
    expect(base.strings['meta.description']).toBe('Apply for benefits');
    expect(base.strings['meta.submitLabel']).toBe('Submit');
  });

  it('includes children fields from checkbox-group', () => {
    const childrenSchema: FormSchema = {
      sections: [{
        fields: [
          { type: 'checkbox-group', name: 'benefits', label: 'Benefits', children: [
            { type: 'checkbox', name: 'health', label: 'Health', value: 'health' },
            { type: 'checkbox', name: 'dental', label: 'Dental', value: 'dental' },
          ]},
        ],
      }],
    };
    const result = generateI18nFiles(childrenSchema, { includeOptions: true });
    const base = result.bundles.find((b) => b.locale === 'en')!;
    expect(base.strings['benefits.option.health']).toBe('Health');
    expect(base.strings['benefits.option.dental']).toBe('Dental');
  });

  it('TypeScript output includes helper function', () => {
    const result = generateI18nFiles(schema);
    expect(result.typescript).toContain('function t(');
    expect(result.typescript).toContain('import en from');
    expect(result.typescript).toContain('import es from');
  });

  it('stringCount matches actual number of extracted strings', () => {
    const result = generateI18nFiles(schema);
    const base = result.bundles.find((b) => b.locale === 'en')!;
    const actualCount = Object.keys(base.strings).length;
    expect(result.stringCount).toBe(actualCount);
    // 2 labels + 1 hint + 1 placeholder + 3 meta (title, description, submitLabel) = 7
    expect(result.stringCount).toBe(7);
  });
});

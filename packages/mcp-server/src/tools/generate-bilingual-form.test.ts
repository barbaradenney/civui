import { describe, it, expect } from 'vitest';
import { generateBilingualForm } from './generate-bilingual-form.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  bilingual: {
    primaryLanguage: 'en',
    secondaryLanguage: 'es',
    primaryLabel: 'English',
    secondaryLabel: 'Español',
  },
  sections: [
    {
      heading: 'Personal Info',
      fields: [
        { type: 'text', name: 'first-name', label: 'First name' },
        { type: 'text', name: 'last-name', label: 'Last name' },
      ],
    },
  ],
};

const translations: Record<string, string> = {
  'Personal Info': 'Información personal',
  'First name': 'Nombre',
};

describe('generateBilingualForm', () => {
  it('throws when schema has no bilingual config', () => {
    expect(() =>
      generateBilingualForm({ sections: [] }, {}),
    ).toThrow('bilingual');
  });

  it('returns html, javascript, features, translatedFields, untranslatedFields', () => {
    const result = generateBilingualForm(schema, translations);
    expect(result.html).toBeDefined();
    expect(typeof result.html).toBe('string');
    expect(result.javascript).toBeDefined();
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.translatedFields)).toBe(true);
    expect(Array.isArray(result.untranslatedFields)).toBe(true);
  });

  it('language switch has role="group" and aria-label', () => {
    const result = generateBilingualForm(schema, translations);
    expect(result.html).toContain('role="group"');
    expect(result.html).toContain('aria-label="Language selection"');
  });

  it('primary button has aria-pressed="true", secondary has "false"', () => {
    const result = generateBilingualForm(schema, translations);
    expect(result.html).toContain(
      'data-civ-lang-btn="en" aria-pressed="true"',
    );
    expect(result.html).toContain(
      'data-civ-lang-btn="es" aria-pressed="false"',
    );
  });

  it('translatedFields contains fields with translations', () => {
    const result = generateBilingualForm(schema, translations);
    expect(result.translatedFields).toContain('first-name');
  });

  it('untranslatedFields contains fields without translations', () => {
    const result = generateBilingualForm(schema, translations);
    expect(result.untranslatedFields).toContain('last-name');
  });

  it('toggle mode: secondary elements have hidden attribute', () => {
    const result = generateBilingualForm(schema, translations, {
      mode: 'toggle',
    });
    expect(result.html).toContain('data-civ-lang="es"');
    // Secondary elements are hidden by default
    expect(result.html).toContain('lang="es" hidden');
  });

  it('toggle mode: elements have data-civ-lang attributes', () => {
    const result = generateBilingualForm(schema, translations, {
      mode: 'toggle',
    });
    expect(result.html).toContain('data-civ-lang="en"');
    expect(result.html).toContain('data-civ-lang="es"');
  });

  it('side-by-side mode: uses grid layout', () => {
    const result = generateBilingualForm(schema, translations, {
      mode: 'side-by-side',
    });
    expect(result.html).toContain('civ-grid-cols-2');
  });

  it('side-by-side mode: both languages visible (no hidden)', () => {
    const result = generateBilingualForm(schema, translations, {
      mode: 'side-by-side',
    });
    // The content area (not the switch buttons) should not have hidden attributes
    const contentArea = result.html.split('data-civ-bilingual-form')[1];
    expect(contentArea).not.toContain(' hidden');
  });

  it('inline mode: translated labels show secondary in parentheses', () => {
    const result = generateBilingualForm(schema, translations, {
      mode: 'inline',
    });
    // Inline mode puts the translation in parentheses
    expect(result.html).toContain('(Nombre)');
  });

  it('RTL support: Arabic secondary language adds dir="rtl"', () => {
    const rtlSchema: FormSchema = {
      ...schema,
      bilingual: {
        primaryLanguage: 'en',
        secondaryLanguage: 'ar',
        primaryLabel: 'English',
        secondaryLabel: 'العربية',
      },
    };
    const result = generateBilingualForm(rtlSchema, translations);
    expect(result.html).toContain('dir="rtl"');
    expect(result.features).toContain('rtl-support');
  });

  it('features always include bilingual, language-toggle, localStorage', () => {
    const result = generateBilingualForm(schema, translations);
    expect(result.features).toContain('bilingual');
    expect(result.features).toContain('language-toggle');
    expect(result.features).toContain('localStorage');
  });
});

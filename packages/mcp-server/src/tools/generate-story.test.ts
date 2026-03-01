import { describe, it, expect } from 'vitest';
import { generateStory } from './generate-story.js';
import type { FormSchema } from '../schema/index.js';

const SAMPLE_HTML = `
<civ-form>
  <civ-text-input label="Full name" name="full-name" required required-message="Enter your name"></civ-text-input>
  <civ-text-input label="Email" name="email" type="email"></civ-text-input>
</civ-form>
`;

const SAMPLE_SCHEMA: FormSchema = {
  title: 'Contact Form',
  sections: [
    {
      heading: 'Personal Info',
      fields: [
        { type: 'text', name: 'full-name', label: 'Full name', required: true },
        { type: 'email', name: 'email', label: 'Email' },
      ],
    },
  ],
};

describe('generateStory', () => {
  it('contains CSF3 structure (meta, Default, WithErrors, Filled)', () => {
    const result = generateStory({ html: SAMPLE_HTML }, 'ContactForm');
    expect(result.code).toContain('const meta = {');
    expect(result.code).toContain('export default meta;');
    expect(result.code).toContain('export const Default = {');
    expect(result.code).toContain('export const WithErrors = {');
    expect(result.code).toContain('export const Filled = {');
  });

  it('contains lit html import', () => {
    const result = generateStory({ html: SAMPLE_HTML });
    expect(result.code).toContain("import { html } from 'lit'");
  });

  it('contains action import from storybook', () => {
    const result = generateStory({ html: SAMPLE_HTML });
    expect(result.code).toContain("import { action } from '@storybook/addon-actions'");
  });

  it('contains autodocs tag', () => {
    const result = generateStory({ html: SAMPLE_HTML });
    expect(result.code).toContain("'autodocs'");
  });

  it('works from HTML input', () => {
    const result = generateStory({ html: SAMPLE_HTML }, 'TestForm');
    expect(result.filename).toBe('TestForm.stories.ts');
    expect(result.code).toContain("title: 'Forms/TestForm'");
  });

  it('works from schema input', () => {
    const result = generateStory({ schema: SAMPLE_SCHEMA });
    expect(result.code).toContain("title: 'Forms/Contact Form'");
  });

  it('derives name from schema title', () => {
    const result = generateStory({ schema: SAMPLE_SCHEMA });
    expect(result.filename).toBe('ContactForm.stories.ts');
  });

  it('uses provided componentName over schema title', () => {
    const result = generateStory({ schema: SAMPLE_SCHEMA }, 'CustomName');
    expect(result.code).toContain("title: 'Forms/CustomName'");
    expect(result.filename).toBe('CustomName.stories.ts');
  });

  it('generates argTypes for fields', () => {
    const result = generateStory({ schema: SAMPLE_SCHEMA });
    expect(result.code).toContain('argTypes');
    expect(result.code).toContain('fullName');
  });

  it('throws when neither html nor schema provided', () => {
    expect(() => generateStory({})).toThrow('Either html or schema must be provided');
  });

  it('generates Filled args with sample values', () => {
    const result = generateStory({ schema: SAMPLE_SCHEMA });
    expect(result.code).toContain('user@example.gov');
  });
});

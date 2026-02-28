import { describe, it, expect } from 'vitest';
import { FORM_TEMPLATES } from './form-templates.js';

describe('FORM_TEMPLATES', () => {
  it('is a non-empty string', () => {
    expect(typeof FORM_TEMPLATES).toBe('string');
    expect(FORM_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('contains 5 template sections', () => {
    expect(FORM_TEMPLATES).toContain('## 1. Contact Form');
    expect(FORM_TEMPLATES).toContain('## 2. Benefits Application');
    expect(FORM_TEMPLATES).toContain('## 3. Change of Address');
    expect(FORM_TEMPLATES).toContain('## 4. Document Submission');
    expect(FORM_TEMPLATES).toContain('## 5. Feedback Form');
  });

  it('contains valid JSON blocks', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g);
    expect(jsonBlocks).not.toBeNull();
    expect(jsonBlocks!.length).toBe(5);
    for (const block of jsonBlocks!) {
      const json = block.replace(/```json\n/, '').replace(/```$/, '');
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });

  it('each template has required FormSchema structure', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g)!;
    for (const block of jsonBlocks) {
      const json = block.replace(/```json\n/, '').replace(/```$/, '');
      const schema = JSON.parse(json);
      expect(schema.title).toBeDefined();
      expect(schema.sections).toBeDefined();
      expect(Array.isArray(schema.sections)).toBe(true);
      expect(schema.sections.length).toBeGreaterThan(0);
    }
  });

  it('templates use plain language labels', () => {
    expect(FORM_TEMPLATES).not.toMatch(/"label":\s*"DOB"/);
    expect(FORM_TEMPLATES).not.toMatch(/"label":\s*"SSN"/);
    expect(FORM_TEMPLATES).toContain('Date of birth');
    expect(FORM_TEMPLATES).toContain('Social Security number');
  });

  it('templates include autocomplete where appropriate', () => {
    expect(FORM_TEMPLATES).toContain('"autocomplete": "email"');
    expect(FORM_TEMPLATES).toContain('"autocomplete": "tel"');
    expect(FORM_TEMPLATES).toContain('"autocomplete": "name"');
    expect(FORM_TEMPLATES).toContain('"autocomplete": "postal-code"');
  });
});

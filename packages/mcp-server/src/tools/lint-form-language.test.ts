import { describe, it, expect } from 'vitest';
import { lintFormLanguage } from './lint-form-language.js';
import type { FormSchema } from '../schema/index.js';

describe('lintFormLanguage', () => {
  it('returns score 100 for clean form', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'name', label: 'Full name' },
          { type: 'email', name: 'email', label: 'Email address' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it('detects jargon in labels', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'addr', label: 'Pursuant to your domicile address' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const jargonIssues = result.issues.filter((i) => i.issue.includes('jargon'));
    expect(jargonIssues.length).toBeGreaterThanOrEqual(1);
    expect(jargonIssues[0].severity).toBe('warning');
  });

  it('detects abbreviations not in exception list', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'dob', label: 'DOB field' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const abbrevIssues = result.issues.filter((i) => i.issue.includes('abbreviation'));
    expect(abbrevIssues.length).toBeGreaterThanOrEqual(1);
    expect(abbrevIssues[0].issue).toContain('DOB');
  });

  it('allows US, ID, OK abbreviations', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'country', label: 'US citizenship status' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const abbrevIssues = result.issues.filter((i) => i.issue.includes('abbreviation'));
    expect(abbrevIssues).toHaveLength(0);
  });

  it('flags long sentences in hints', () => {
    const longHint = Array(30).fill('word').join(' ') + '.';
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'field', label: 'Field', hint: longHint },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const longIssues = result.issues.filter((i) => i.issue.includes('words'));
    expect(longIssues.length).toBeGreaterThanOrEqual(1);
    expect(longIssues[0].severity).toBe('info');
  });

  it('detects passive voice', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'field', label: 'Information that was provided by the applicant' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const passiveIssues = result.issues.filter((i) => i.issue.includes('passive'));
    expect(passiveIssues.length).toBeGreaterThanOrEqual(1);
    expect(passiveIssues[0].severity).toBe('info');
  });

  it('flags non-actionable hints without action verbs', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'field', label: 'Name', hint: 'Your full legal name' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const hintIssues = result.issues.filter((i) => i.issue.includes('action verb'));
    expect(hintIssues.length).toBeGreaterThanOrEqual(1);
  });

  it('does not flag hints with action verbs', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'field', label: 'Name', hint: 'Enter your full legal name' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const hintIssues = result.issues.filter((i) => i.issue.includes('action verb'));
    expect(hintIssues).toHaveLength(0);
  });

  it('handles multiple issues per field', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'field', label: 'DOB pursuant to documentation', hint: 'Your date' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    const fieldIssues = result.issues.filter((i) => i.field === 'field');
    expect(fieldIssues.length).toBeGreaterThanOrEqual(2);
  });

  it('score decreases with issues', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'a', label: 'Pursuant to your domicile' },
          { type: 'text', name: 'b', label: 'Utilize herein the information' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    expect(result.score).toBeLessThan(100);
  });

  it('score floors at 0', () => {
    // Create many issues to drive score below 0
    const fields = Array.from({ length: 20 }, (_, i) => ({
      type: 'text' as const,
      name: `f${i}`,
      label: `Pursuant to the aforementioned notwithstanding DOB`,
      hint: 'Some info was given by the applicant',
    }));
    const schema: FormSchema = { sections: [{ fields }] };
    const result = lintFormLanguage(schema);
    expect(result.score).toBe(0);
  });

  it('populates suggestions for jargon replacements', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'addr', label: 'Utilize this field' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    expect(Object.keys(result.suggestions).length).toBeGreaterThan(0);
  });

  it('summary contains issue count and score', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'field', label: 'Pursuant to your domicile' },
        ],
      }],
    };
    const result = lintFormLanguage(schema);
    expect(result.summary).toContain('issues');
    expect(result.summary).toContain('Score');
  });
});

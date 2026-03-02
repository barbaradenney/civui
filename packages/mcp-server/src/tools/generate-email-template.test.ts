import { describe, it, expect } from 'vitest';
import { generateEmailTemplate } from './generate-email-template.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  title: 'Benefits Application',
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

const decisionSchema: FormSchema = {
  title: 'Benefits Application',
  sections: [
    {
      fields: [
        { type: 'text', name: 'applicant', label: 'Applicant name' },
      ],
    },
  ],
  decisionNotice: {
    agencyName: 'Department of Benefits',
    templates: [
      {
        decision: 'approved',
        subject: 'Application Approved',
        bodyTemplate: 'Dear {{applicant}}, your application has been approved.',
        legalCitations: ['42 U.S.C. § 1234'],
        appealInfo: 'You may appeal within 30 days.',
      },
      {
        decision: 'denied',
        subject: 'Application Denied',
        bodyTemplate: 'Dear {{applicant}}, your application for {{program}} has been denied.',
      },
    ],
  },
};

describe('generateEmailTemplate', () => {
  // --- Confirmation type ---

  it('returns html, subject, plainText, and features for confirmation', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': 'Jane', 'last-name': 'Doe' },
    });
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('subject');
    expect(result).toHaveProperty('plainText');
    expect(result).toHaveProperty('features');
  });

  it('generates full DOCTYPE html document', () => {
    const result = generateEmailTemplate(schema, { type: 'confirmation' });
    expect(result.html).toMatch(/^<!DOCTYPE html>/);
    expect(result.html).toContain('</html>');
  });

  it('uses inline CSS only (no <style> block)', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': 'Jane' },
    });
    expect(result.html).not.toContain('<style');
    expect(result.html).toContain('style="');
  });

  it('uses table layout with 600px max-width', () => {
    const result = generateEmailTemplate(schema, { type: 'confirmation' });
    expect(result.html).toContain('max-width:600px');
    expect(result.html).toContain('role="presentation"');
  });

  it('includes USWDS primary header color', () => {
    const result = generateEmailTemplate(schema, { type: 'confirmation' });
    expect(result.html).toContain('#1a4480');
  });

  it('generates deterministic confirmation number', () => {
    const result1 = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': 'Jane' },
    });
    const result2 = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': 'Jane' },
    });
    expect(result1.html).toContain('CIV-');
    // Same inputs = same confirmation number
    const match1 = result1.html.match(/CIV-[A-F0-9]{8}/);
    const match2 = result2.html.match(/CIV-[A-F0-9]{8}/);
    expect(match1).not.toBeNull();
    expect(match1![0]).toBe(match2![0]);
  });

  it('renders submitted field values in confirmation', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': 'Jane', 'last-name': 'Doe' },
    });
    expect(result.html).toContain('Jane');
    expect(result.html).toContain('Doe');
    expect(result.html).toContain('First name');
  });

  it('generates plain text fallback for confirmation', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': 'Jane' },
    });
    expect(result.plainText).toContain('Benefits Application');
    expect(result.plainText).toContain('CIV-');
    expect(result.plainText).toContain('First name: Jane');
  });

  it('includes reply-to when provided', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      replyTo: 'help@agency.gov',
    });
    expect(result.html).toContain('help@agency.gov');
    expect(result.features).toContain('reply-to');
    expect(result.plainText).toContain('help@agency.gov');
  });

  it('escapes HTML in user-supplied content', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      formData: { 'first-name': '<script>alert("xss")</script>' },
    });
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
  });

  // --- Decision type ---

  it('generates decision email with merge fields', () => {
    const result = generateEmailTemplate(decisionSchema, {
      type: 'decision',
      decision: 'approved',
      formData: { applicant: 'Jane Doe' },
    });
    expect(result.html).toContain('Jane Doe');
    expect(result.features).toContain('decision');
    expect(result.features).toContain('merge-fields');
    expect(result.mergedFields).toContain('applicant');
    expect(result.missingFields).toHaveLength(0);
  });

  it('tracks missing merge fields in decision email', () => {
    const result = generateEmailTemplate(decisionSchema, {
      type: 'decision',
      decision: 'denied',
      formData: { applicant: 'Jane' },
    });
    expect(result.mergedFields).toContain('applicant');
    expect(result.missingFields).toContain('program');
    expect(result.features).toContain('missing-fields');
  });

  it('throws when decision type lacks decision option', () => {
    expect(() =>
      generateEmailTemplate(schema, { type: 'decision' }),
    ).toThrow('Decision type requires options.decision');
  });

  it('throws when schema lacks decisionNotice config', () => {
    expect(() =>
      generateEmailTemplate(schema, { type: 'decision', decision: 'approved' }),
    ).toThrow('Schema must have a decisionNotice configuration');
  });

  it('throws when decision template not found', () => {
    expect(() =>
      generateEmailTemplate(decisionSchema, { type: 'decision', decision: 'unknown' }),
    ).toThrow('No template found for decision "unknown"');
  });

  it('includes legal citations and appeal info in decision email', () => {
    const result = generateEmailTemplate(decisionSchema, {
      type: 'decision',
      decision: 'approved',
      formData: { applicant: 'Jane' },
    });
    expect(result.html).toContain('42 U.S.C.');
    expect(result.html).toContain('appeal within 30 days');
    expect(result.features).toContain('legal-citations');
    expect(result.features).toContain('appeal-info');
    expect(result.plainText).toContain('42 U.S.C.');
    expect(result.plainText).toContain('appeal within 30 days');
  });

  it('uses custom subject when provided', () => {
    const result = generateEmailTemplate(schema, {
      type: 'confirmation',
      subject: 'Custom Subject Line',
    });
    expect(result.subject).toBe('Custom Subject Line');
    expect(result.html).toContain('Custom Subject Line');
  });
});

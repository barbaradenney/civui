import { describe, it, expect } from 'vitest';
import { generateDecisionNotice } from './generate-decision-notice.js';
import type { FormSchema } from '../schema/index.js';

/** Minimal schema with no decisionNotice config. */
function minimalSchema(): FormSchema {
  return {
    sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
  };
}

/** Schema with a full decisionNotice config including merge fields. */
function noticeSchema(overrides?: {
  legalCitations?: string[];
  appealInfo?: string;
  agencyName?: string;
  title?: string;
  bodyTemplate?: string;
}): FormSchema {
  return {
    title: overrides?.title ?? 'Permit Application',
    sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    decisionNotice: {
      agencyName: overrides?.agencyName,
      templates: [
        {
          decision: 'approved',
          subject: 'Application Approved',
          bodyTemplate:
            overrides?.bodyTemplate ??
            'Dear {{applicantName}}, your case {{caseNumber}} has been approved.',
          legalCitations: overrides?.legalCitations,
          appealInfo: overrides?.appealInfo,
        },
        {
          decision: 'denied',
          subject: 'Application Denied',
          bodyTemplate: 'Your application has been denied.',
        },
      ],
    },
  };
}

describe('generateDecisionNotice', () => {
  it('throws when schema has no decisionNotice config', () => {
    const schema = minimalSchema();
    expect(() => generateDecisionNotice(schema, 'approved', {})).toThrow(
      'Schema must have a decisionNotice configuration',
    );
  });

  it('throws when decision template not found', () => {
    const schema = noticeSchema();
    expect(() =>
      generateDecisionNotice(schema, 'suspended', {}),
    ).toThrow('No template found for decision "suspended"');
  });

  it('returns html, javascript, features, mergedFields, missingFields', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: '12345',
    });
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('mergedFields');
    expect(result).toHaveProperty('missingFields');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.mergedFields)).toBe(true);
    expect(Array.isArray(result.missingFields)).toBe(true);
  });

  it('HTML has data-civ-decision-notice article', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: '12345',
    });
    expect(result.html).toContain('<article data-civ-decision-notice');
    expect(result.html).toContain('</article>');
  });

  it('merge fields are replaced with form data values', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: 'C-2026-001',
    });
    expect(result.html).toContain('Jane Doe');
    expect(result.html).toContain('C-2026-001');
    expect(result.html).not.toContain('{{applicantName}}');
    expect(result.html).not.toContain('{{caseNumber}}');
  });

  it('mergedFields tracks successfully replaced fields', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: 'C-2026-001',
    });
    expect(result.mergedFields).toContain('applicantName');
    expect(result.mergedFields).toContain('caseNumber');
    expect(result.mergedFields).toHaveLength(2);
  });

  it('missing merge fields are wrapped in mark element', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      // caseNumber intentionally omitted
    });
    expect(result.html).toContain('<mark data-civ-merge-field="caseNumber"');
    expect(result.html).toContain('{{caseNumber}}</mark>');
  });

  it('missingFields tracks fields without data', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {});
    expect(result.missingFields).toContain('applicantName');
    expect(result.missingFields).toContain('caseNumber');
    expect(result.missingFields).toHaveLength(2);
    expect(result.mergedFields).toHaveLength(0);
  });

  it('agency name appears in header when configured', () => {
    const schema = noticeSchema({
      agencyName: 'Department of Public Works',
    });
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: '12345',
    });
    expect(result.html).toContain('Department of Public Works');
    expect(result.html).toContain('<header');
  });

  it('legal citations render as list', () => {
    const schema = noticeSchema({
      legalCitations: [
        '42 U.S.C. § 1983',
        '5 U.S.C. § 552(a)',
      ],
    });
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: '12345',
    });
    expect(result.html).toContain('<section data-civ-legal-citations');
    expect(result.html).toContain('<ul>');
    expect(result.html).toContain('<li>42 U.S.C. § 1983</li>');
    expect(result.html).toContain('<li>5 U.S.C. § 552(a)</li>');
    expect(result.html).toContain('Legal basis');
  });

  it('appeal info renders in aside with role="note"', () => {
    const schema = noticeSchema({
      appealInfo:
        'You may file an appeal within 30 days by contacting the Board of Appeals.',
    });
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: '12345',
    });
    expect(result.html).toContain('<aside data-civ-appeal-info');
    expect(result.html).toContain('role="note"');
    expect(result.html).toContain('Appeal rights');
    expect(result.html).toContain(
      'You may file an appeal within 30 days by contacting the Board of Appeals.',
    );
  });

  it('print button is present', () => {
    const schema = noticeSchema();
    const result = generateDecisionNotice(schema, 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: '12345',
    });
    expect(result.html).toContain('<button type="button" data-civ-print>');
    expect(result.html).toContain('Print this notice');
    expect(result.javascript).toContain('window.print()');
  });

  it('features include correct conditional features', () => {
    // All features present: legal-citations, appeal-info, missing-fields
    const schemaFull = noticeSchema({
      legalCitations: ['Section 101'],
      appealInfo: 'You may appeal within 60 days.',
    });
    const resultFull = generateDecisionNotice(schemaFull, 'approved', {
      // omit all data so missing-fields fires
    });
    expect(resultFull.features).toContain('decision-notice');
    expect(resultFull.features).toContain('merge-fields');
    expect(resultFull.features).toContain('legal-citations');
    expect(resultFull.features).toContain('appeal-info');
    expect(resultFull.features).toContain('missing-fields');
    expect(resultFull.features).toContain('print');

    // No optional features
    const schemaMinimal = noticeSchema();
    const resultMinimal = generateDecisionNotice(schemaMinimal, 'denied', {});
    expect(resultMinimal.features).toContain('decision-notice');
    expect(resultMinimal.features).toContain('merge-fields');
    expect(resultMinimal.features).toContain('print');
    expect(resultMinimal.features).not.toContain('legal-citations');
    expect(resultMinimal.features).not.toContain('appeal-info');
    // 'denied' template has no merge fields so missing-fields should not appear
    expect(resultMinimal.features).not.toContain('missing-fields');
  });
});

import { describe, it, expect } from 'vitest';
import { generatePdfNotice } from './generate-pdf-notice.js';
import type { FormSchema } from '../schema/index.js';

function noticeSchema(overrides?: { agencyName?: string }): FormSchema {
  return {
    title: 'Permit Application',
    sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    decisionNotice: {
      agencyName: overrides?.agencyName ?? 'Department of Testing',
      templates: [
        {
          decision: 'approved',
          subject: 'Application Approved',
          bodyTemplate: 'Dear {{applicantName}}, your case {{caseNumber}} has been approved.',
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

describe('generatePdfNotice', () => {
  it('throws when schema has no decisionNotice config', () => {
    const schema: FormSchema = { sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }] };
    expect(() => generatePdfNotice(schema, 'approved', {})).toThrow();
  });

  it('returns html, css, features, mergedFields, missingFields', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {
      applicantName: 'Jane',
      caseNumber: '123',
    });
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('css');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('mergedFields');
    expect(result).toHaveProperty('missingFields');
  });

  it('HTML wraps content in data-civ-pdf-notice', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {
      applicantName: 'Jane',
      caseNumber: '123',
    });
    expect(result.html).toContain('data-civ-pdf-notice');
  });

  it('merge fields are replaced in HTML', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {
      applicantName: 'Jane Doe',
      caseNumber: 'C-2026',
    });
    expect(result.html).toContain('Jane Doe');
    expect(result.html).toContain('C-2026');
    expect(result.mergedFields).toContain('applicantName');
  });

  it('missing fields are tracked', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {});
    expect(result.missingFields).toContain('applicantName');
    expect(result.missingFields).toContain('caseNumber');
  });

  it('CSS contains @media print', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {});
    expect(result.css).toContain('@media print');
  });

  it('CSS contains @page with size', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {});
    expect(result.css).toContain('@page');
    expect(result.css).toContain('size: letter');
  });

  it('CSS hides print button', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {});
    expect(result.css).toContain('[data-civ-print]');
    expect(result.css).toContain('display: none');
  });

  it('CSS has page-break-inside: avoid', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {});
    expect(result.css).toContain('page-break-inside: avoid');
  });

  it('features include pdf-notice, print-css, page-breaks', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {});
    expect(result.features).toContain('pdf-notice');
    expect(result.features).toContain('print-css');
    expect(result.features).toContain('page-breaks');
  });

  it('includes running-header when includeHeader is true', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {}, {
      includeHeader: true,
    });
    expect(result.features).toContain('running-header');
    expect(result.html).toContain('data-civ-print-header');
  });

  it('respects a4 page size', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {}, {
      pageSize: 'a4',
    });
    expect(result.css).toContain('size: A4');
  });

  it('respects landscape orientation', () => {
    const result = generatePdfNotice(noticeSchema(), 'approved', {}, {
      orientation: 'landscape',
    });
    expect(result.css).toContain('landscape');
  });
});

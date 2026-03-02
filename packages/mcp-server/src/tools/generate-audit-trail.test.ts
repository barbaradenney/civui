import { describe, it, expect } from 'vitest';
import { generateAuditTrail } from './generate-audit-trail.js';
import type { FormSchema } from '../schema/index.js';
import type { AuditEntry } from './generate-audit-trail.js';

function makeSchema(): FormSchema {
  return {
    title: 'Audit Test',
    sections: [{ heading: 'Info', fields: [{ type: 'text', name: 'a', label: 'A' }] }],
    actors: [
      { id: 'applicant', label: 'Applicant' },
      { id: 'reviewer', label: 'Reviewer' },
    ],
    workflow: {
      initialState: 'draft',
      states: [
        { id: 'draft', label: 'Draft' },
        { id: 'submitted', label: 'Submitted' },
        { id: 'approved', label: 'Approved', terminal: true },
      ],
      transitions: [
        { from: 'draft', to: 'submitted', actor: 'applicant', label: 'Submit' },
        { from: 'submitted', to: 'approved', actor: 'reviewer', label: 'Approve' },
      ],
    },
  };
}

const sampleEntries: AuditEntry[] = [
  { timestamp: '2024-01-18T14:00:00Z', actor: 'reviewer', action: 'approved', stateFrom: 'submitted', stateTo: 'approved' },
  { timestamp: '2024-01-15T10:00:00Z', actor: 'applicant', action: 'submitted', stateFrom: 'draft', stateTo: 'submitted' },
  { timestamp: '2024-01-17T09:00:00Z', actor: 'reviewer', action: 'requested revision', details: 'Missing documents' },
];

describe('generateAuditTrail', () => {
  it('throws without workflow or actors', () => {
    expect(() => generateAuditTrail({ sections: [] }, [])).toThrow();
  });

  it('sorts entries chronologically', () => {
    const result = generateAuditTrail(makeSchema(), sampleEntries);
    const times = result.html.match(/datetime="([^"]+)"/g)!;
    expect(times[0]).toContain('2024-01-15');
    expect(times[1]).toContain('2024-01-17');
    expect(times[2]).toContain('2024-01-18');
  });

  it('renders <time> elements with datetime attribute', () => {
    const result = generateAuditTrail(makeSchema(), sampleEntries);
    expect(result.html).toContain('<time datetime=');
    expect(result.html).toContain('2024-01-15T10:00:00Z');
  });

  it('shows state transitions', () => {
    const result = generateAuditTrail(makeSchema(), sampleEntries);
    expect(result.html).toContain('draft');
    expect(result.html).toContain('→');
    expect(result.html).toContain('submitted');
    expect(result.features).toContain('state-transitions');
  });

  it('renders heading only for empty entries', () => {
    const result = generateAuditTrail(makeSchema(), []);
    expect(result.html).toContain('Case history');
    expect(result.html).toContain('No history recorded');
    expect(result.entryCount).toBe(0);
  });

  it('HTML-escapes details text', () => {
    const entries: AuditEntry[] = [
      { timestamp: '2024-01-15T10:00:00Z', actor: 'reviewer', action: 'noted', details: '<script>alert("xss")</script>' },
    ];
    const result = generateAuditTrail(makeSchema(), entries);
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
  });

  it('resolves actor labels from schema', () => {
    const result = generateAuditTrail(makeSchema(), sampleEntries);
    expect(result.html).toContain('Applicant');
    expect(result.html).toContain('Reviewer');
  });

  it('handles single entry', () => {
    const entries: AuditEntry[] = [
      { timestamp: '2024-01-15T10:00:00Z', actor: 'applicant', action: 'created' },
    ];
    const result = generateAuditTrail(makeSchema(), entries);
    expect(result.entryCount).toBe(1);
    expect(result.html).toContain('created');
  });

  it('features includes audit-trail', () => {
    const result = generateAuditTrail(makeSchema(), sampleEntries);
    expect(result.features).toContain('audit-trail');
  });

  it('uses semantic list markup', () => {
    const result = generateAuditTrail(makeSchema(), sampleEntries);
    expect(result.html).toContain('<ol');
    expect(result.html).toContain('</ol>');
    expect(result.html).toContain('<li');
    expect(result.html).toContain('<section');
  });
});

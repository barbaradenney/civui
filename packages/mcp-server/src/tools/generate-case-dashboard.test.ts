import { describe, it, expect } from 'vitest';
import { generateCaseDashboard } from './generate-case-dashboard.js';
import type { FormSchema } from '../schema/index.js';
import type { AuditEntry } from './generate-audit-trail.js';

function makeSchema(): FormSchema {
  return {
    title: 'Dashboard Test',
    sections: [
      { heading: 'Personal info', fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] },
      { heading: 'Documents', fields: [{ type: 'file', name: 'doc', label: 'Doc', required: true }] },
    ],
    actors: [
      { id: 'applicant', label: 'Applicant' },
      { id: 'reviewer', label: 'Reviewer' },
    ],
    workflow: {
      initialState: 'draft',
      states: [
        { id: 'draft', label: 'Draft', editableBy: ['applicant'] },
        { id: 'submitted', label: 'Submitted', editableBy: [] },
        { id: 'approved', label: 'Approved', terminal: true },
      ],
      transitions: [
        { from: 'draft', to: 'submitted', actor: 'applicant', label: 'Submit' },
        { from: 'submitted', to: 'approved', actor: 'reviewer', label: 'Approve' },
      ],
    },
  };
}

const auditEntries: AuditEntry[] = [
  { timestamp: '2024-01-15T10:00:00Z', actor: 'applicant', action: 'submitted', stateFrom: 'draft', stateTo: 'submitted' },
];

describe('generateCaseDashboard', () => {
  it('throws without workflow', () => {
    expect(() => generateCaseDashboard({ sections: [] })).toThrow('workflow');
  });

  it('includes workflow status section', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.html).toContain('civ-card');
    expect(result.html).toContain('Draft');
  });

  it('includes section progress', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.html).toContain('data-civ-section-progress');
    expect(result.html).toContain('Section progress');
  });

  it('includes audit trail when entries provided', () => {
    const result = generateCaseDashboard(makeSchema(), { auditEntries });
    expect(result.html).toContain('Case history');
    expect(result.html).toContain('data-civ-audit-trail');
  });

  it('omits audit trail without entries', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.html).not.toContain('data-civ-audit-trail');
  });

  it('combined JS is non-empty', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.javascript.length).toBeGreaterThan(0);
    expect(result.javascript).toContain('function');
  });

  it('sidebar aside has aria-label', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.html).toContain('<aside aria-label="Section progress">');
  });

  it('uses responsive layout classes', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.html).toContain('civ-grid');
    expect(result.html).toContain('md:civ-grid-cols');
  });

  it('features merges sub-features', () => {
    const result = generateCaseDashboard(makeSchema());
    expect(result.features).toContain('case-dashboard');
    expect(result.features).toContain('workflow-status');
    expect(result.features).toContain('section-progress');
  });

  it('generates summary text', () => {
    const result = generateCaseDashboard(makeSchema(), { auditEntries });
    expect(result.summary).toContain('Status: Draft');
    expect(result.summary).toContain('Progress:');
    expect(result.summary).toContain('Sections: 2');
    expect(result.summary).toContain('History entries: 1');
  });

  it('works with minimal schema', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
      actors: [{ id: 'user', label: 'User' }],
      workflow: {
        initialState: 'open',
        states: [{ id: 'open', label: 'Open' }],
        transitions: [],
      },
    };
    const result = generateCaseDashboard(schema);
    expect(result.features).toContain('case-dashboard');
    expect(result.summary).toContain('Open');
  });
});

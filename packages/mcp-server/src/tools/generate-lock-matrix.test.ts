import { describe, it, expect } from 'vitest';
import { generateLockMatrix } from './generate-lock-matrix.js';
import type { FormSchema } from '../schema/index.js';

function makeSchema(overrides?: Partial<FormSchema>): FormSchema {
  return {
    title: 'Test Form',
    sections: [
      { heading: 'Personal info', fields: [{ type: 'text', name: 'name', label: 'Name' }], editableBy: ['applicant'] },
      { heading: 'Review notes', fields: [{ type: 'textarea', name: 'notes', label: 'Notes' }], editableBy: ['reviewer'], visibleTo: ['reviewer', 'approver'] },
    ],
    actors: [
      { id: 'applicant', label: 'Applicant' },
      { id: 'reviewer', label: 'Reviewer' },
      { id: 'approver', label: 'Approver' },
    ],
    workflow: {
      initialState: 'draft',
      states: [
        { id: 'draft', label: 'Draft', editableBy: ['applicant'] },
        { id: 'review', label: 'Under Review', editableBy: ['reviewer'] },
        { id: 'approved', label: 'Approved', terminal: true, editableBy: [] },
      ],
      transitions: [
        { from: 'draft', to: 'review', actor: 'applicant', label: 'Submit' },
        { from: 'review', to: 'approved', actor: 'approver', label: 'Approve' },
      ],
    },
    ...overrides,
  };
}

describe('generateLockMatrix', () => {
  it('throws without workflow', () => {
    expect(() => generateLockMatrix({ sections: [] })).toThrow('workflow');
  });

  it('throws without actors', () => {
    expect(() =>
      generateLockMatrix({
        sections: [],
        workflow: { initialState: 'draft', states: [{ id: 'draft', label: 'Draft' }], transitions: [] },
      }),
    ).toThrow('actors');
  });

  it('marks sections editable for correct actor and state', () => {
    const result = generateLockMatrix(makeSchema());
    const entry = result.matrix.find((e) => e.state === 'draft' && e.actor === 'applicant');
    expect(entry).toBeDefined();
    const personal = entry!.sections.find((s) => s.sectionHeading === 'Personal info');
    expect(personal?.access).toBe('editable');
  });

  it('marks sections readonly when visible but not editable', () => {
    const result = generateLockMatrix(makeSchema());
    const entry = result.matrix.find((e) => e.state === 'review' && e.actor === 'approver');
    expect(entry).toBeDefined();
    const notes = entry!.sections.find((s) => s.sectionHeading === 'Review notes');
    expect(notes?.access).toBe('readonly');
  });

  it('marks sections hidden when not in visibleTo', () => {
    const result = generateLockMatrix(makeSchema());
    const entry = result.matrix.find((e) => e.state === 'draft' && e.actor === 'applicant');
    expect(entry).toBeDefined();
    const notes = entry!.sections.find((s) => s.sectionHeading === 'Review notes');
    expect(notes?.access).toBe('hidden');
  });

  it('handles phase-based sections', () => {
    const schema = makeSchema({
      sections: [
        { heading: 'Always visible', fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { heading: 'Review only', fields: [{ type: 'text', name: 'b', label: 'B' }], phase: 'review' },
      ],
    });
    const result = generateLockMatrix(schema);
    const draftEntry = result.matrix.find((e) => e.state === 'draft' && e.actor === 'applicant');
    const reviewPhase = draftEntry!.sections.find((s) => s.sectionHeading === 'Review only');
    expect(reviewPhase?.access).toBe('hidden');

    const reviewEntry = result.matrix.find((e) => e.state === 'review' && e.actor === 'reviewer');
    const reviewPhaseInReview = reviewEntry!.sections.find((s) => s.sectionHeading === 'Review only');
    expect(reviewPhaseInReview?.access).toBe('editable');
  });

  it('defaults sections without editableBy to state level', () => {
    const schema = makeSchema({
      sections: [
        { heading: 'No editableBy', fields: [{ type: 'text', name: 'x', label: 'X' }] },
      ],
    });
    const result = generateLockMatrix(schema);
    const entry = result.matrix.find((e) => e.state === 'draft' && e.actor === 'applicant');
    expect(entry!.sections[0].access).toBe('editable');
  });

  it('sections without visibleTo are visible to all', () => {
    const result = generateLockMatrix(makeSchema());
    const entry = result.matrix.find((e) => e.state === 'draft' && e.actor === 'reviewer');
    const personal = entry!.sections.find((s) => s.sectionHeading === 'Personal info');
    expect(personal?.access).not.toBe('hidden');
  });

  it('generates valid markdown summary', () => {
    const result = generateLockMatrix(makeSchema());
    expect(result.summary).toContain('|');
    expect(result.summary).toContain('State');
    expect(result.summary).toContain('Actor');
  });

  it('handles empty sections', () => {
    const schema = makeSchema({ sections: [] });
    const result = generateLockMatrix(schema);
    expect(result.matrix.length).toBeGreaterThan(0);
    for (const entry of result.matrix) {
      expect(entry.sections).toHaveLength(0);
    }
  });

  it('covers all actors × all states', () => {
    const result = generateLockMatrix(makeSchema());
    // 3 states × 3 actors = 9 entries
    expect(result.matrix).toHaveLength(9);
  });

  it('has non-empty dataAttributes', () => {
    const result = generateLockMatrix(makeSchema());
    expect(result.dataAttributes.length).toBeGreaterThan(0);
    expect(result.dataAttributes).toContain('data-civ-lock');
  });

  it('treats editableBy: [] as nobody-can-edit (readonly for all actors)', () => {
    const result = generateLockMatrix(makeSchema());
    // The 'approved' state has editableBy: [] — nobody should be able to edit
    for (const actor of ['applicant', 'reviewer', 'approver']) {
      const entry = result.matrix.find((e) => e.state === 'approved' && e.actor === actor);
      expect(entry).toBeDefined();
      for (const section of entry!.sections) {
        expect(section.access).not.toBe('editable');
      }
    }
  });

  it('treats visibleTo: [] as nobody-can-see (hidden for all actors)', () => {
    const schema = makeSchema({
      sections: [
        { heading: 'Hidden section', fields: [{ type: 'text', name: 'x', label: 'X' }], visibleTo: [] },
      ],
    });
    const result = generateLockMatrix(schema);
    for (const entry of result.matrix) {
      expect(entry.sections[0].access).toBe('hidden');
    }
  });
});

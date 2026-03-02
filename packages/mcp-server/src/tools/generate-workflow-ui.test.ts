import { describe, it, expect } from 'vitest';
import { generateWorkflowUi } from './generate-workflow-ui.js';
import type { FormSchema } from '../schema/index.js';

function makeWorkflowSchema(overrides?: Partial<FormSchema>): FormSchema {
  return {
    title: 'Test Form',
    sections: [
      { heading: 'Section 1', fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] },
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
        { id: 'denied', label: 'Denied', terminal: true },
      ],
      transitions: [
        { from: 'draft', to: 'submitted', actor: 'applicant', label: 'Submit', requiresAllSectionsComplete: true },
        { from: 'submitted', to: 'approved', actor: 'reviewer', label: 'Approve', confirmationMessage: 'Are you sure you want to approve?' },
        { from: 'submitted', to: 'denied', actor: 'reviewer', label: 'Deny', requiresComment: true },
      ],
    },
    ...overrides,
  };
}

describe('generateWorkflowUi', () => {
  it('throws when no workflow is defined', () => {
    expect(() => generateWorkflowUi({ sections: [] })).toThrow('workflow');
  });

  it('generates a status banner', () => {
    const result = generateWorkflowUi(makeWorkflowSchema());
    expect(result.html).toContain('data-civ-workflow-status');
  });

  it('displays current state label', () => {
    const result = generateWorkflowUi(makeWorkflowSchema());
    expect(result.html).toContain('Draft');
    expect(result.html).toContain('data-civ-workflow-state="draft"');
  });

  it('generates transition buttons for current actor', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'draft', 'applicant');
    expect(result.html).toContain('data-civ-workflow-action="submitted"');
    expect(result.html).toContain('Submit');
  });

  it('hides transitions for the wrong actor', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'draft', 'reviewer');
    expect(result.html).not.toContain('data-civ-workflow-action');
  });

  it('shows no buttons for terminal states', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'approved', 'reviewer');
    expect(result.html).not.toContain('data-civ-workflow-action');
    expect(result.features).toContain('terminal-state');
  });

  it('generates confirmation dialog JS', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'submitted', 'reviewer');
    expect(result.javascript).toContain('confirm');
    expect(result.features).toContain('confirmation-dialog');
  });

  it('generates requiresComment textarea in JS', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'submitted', 'reviewer');
    expect(result.javascript).toContain('prompt');
    expect(result.features).toContain('requires-comment');
  });

  it('generates requiresAllSectionsComplete validation in JS', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'draft', 'applicant');
    expect(result.javascript).toContain('required');
    expect(result.features).toContain('section-complete-validation');
  });

  it('defaults currentState to initialState', () => {
    const result = generateWorkflowUi(makeWorkflowSchema());
    expect(result.html).toContain('data-civ-workflow-state="draft"');
  });

  it('dispatches civ-workflow-transition custom event', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'draft', 'applicant');
    expect(result.javascript).toContain('civ-workflow-transition');
  });

  it('includes ARIA live announcement in JS', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'draft', 'applicant');
    expect(result.javascript).toContain('aria-live');
    expect(result.features).toContain('aria-live');
  });

  it('handles single-state workflow', () => {
    const schema = makeWorkflowSchema({
      workflow: {
        initialState: 'only',
        states: [{ id: 'only', label: 'Only State', terminal: true }],
        transitions: [],
      },
    });
    const result = generateWorkflowUi(schema);
    expect(result.states).toHaveLength(1);
    expect(result.features).toContain('terminal-state');
  });

  it('returns accurate features array', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'draft', 'applicant');
    expect(result.features).toContain('workflow-status');
    expect(result.features).toContain('transition-buttons');
  });

  it('uses destructive styling for deny-to-terminal transitions', () => {
    const result = generateWorkflowUi(makeWorkflowSchema(), 'submitted', 'reviewer');
    // 'Deny' transition has requiresComment + goes to terminal 'denied' state → civ-bg-error
    expect(result.html).toContain('civ-bg-error');
    // 'Approve' has confirmationMessage but no requiresComment → stays civ-bg-primary
    expect(result.html).toContain('civ-bg-primary');
  });

  it('throws for unknown currentState', () => {
    expect(() => generateWorkflowUi(makeWorkflowSchema(), 'nonexistent', 'applicant')).toThrow(
      'not found',
    );
  });

  it('returns states summary with transitions', () => {
    const result = generateWorkflowUi(makeWorkflowSchema());
    expect(result.states).toHaveLength(4);
    const draftState = result.states.find((s) => s.id === 'draft');
    expect(draftState?.isCurrent).toBe(true);
    expect(draftState?.transitions).toHaveLength(1);
  });
});

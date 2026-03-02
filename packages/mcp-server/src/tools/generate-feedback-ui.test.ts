import { describe, it, expect } from 'vitest';
import { generateFeedbackUi } from './generate-feedback-ui.js';
import type { FormSchema } from '../schema/index.js';
import type { FeedbackComment } from './generate-feedback-ui.js';

function makeSchema(overrides?: Partial<FormSchema>): FormSchema {
  return {
    title: 'Feedback Test',
    sections: [
      { heading: 'Personal info', fields: [{ type: 'text', name: 'name', label: 'Name' }, { type: 'email', name: 'email', label: 'Email' }] },
      { heading: 'Documents', fields: [{ type: 'file', name: 'doc', label: 'Document' }] },
    ],
    feedback: {
      granularity: 'section',
      requiresResolution: false,
    },
    ...overrides,
  };
}

const sampleComments: FeedbackComment[] = [
  { target: 'Personal info', author: 'Reviewer', text: 'Please verify name spelling', timestamp: '2024-01-15T10:00:00Z', resolved: false },
  { target: 'Documents', author: 'Reviewer', text: 'Looks good', timestamp: '2024-01-15T11:00:00Z', resolved: true },
];

describe('generateFeedbackUi', () => {
  it('throws without feedback config or workflow allowsFeedback', () => {
    expect(() => generateFeedbackUi({ sections: [] })).toThrow();
  });

  it('generates per-section panels for section-level granularity', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.commentTargets).toHaveLength(2);
    expect(result.commentTargets[0].type).toBe('section');
    expect(result.html).toContain('data-civ-feedback-panel="Personal info"');
    expect(result.html).toContain('data-civ-feedback-panel="Documents"');
  });

  it('generates per-field panels for field-level granularity', () => {
    const schema = makeSchema({ feedback: { granularity: 'field' } });
    const result = generateFeedbackUi(schema);
    expect(result.commentTargets).toHaveLength(3);
    expect(result.commentTargets[0].type).toBe('field');
    expect(result.features).toContain('field-level-feedback');
  });

  it('reviewer mode includes textarea and submit button', () => {
    const result = generateFeedbackUi(makeSchema(), { mode: 'reviewer' });
    expect(result.html).toContain('<textarea');
    expect(result.html).toContain('data-civ-feedback-submit');
    expect(result.features).toContain('reviewer-mode');
  });

  it('applicant mode is read-only', () => {
    const result = generateFeedbackUi(makeSchema(), { mode: 'applicant' });
    expect(result.html).not.toContain('data-civ-feedback-submit');
    expect(result.features).toContain('applicant-mode');
  });

  it('renders existing comments', () => {
    const result = generateFeedbackUi(makeSchema(), { existingComments: sampleComments });
    expect(result.html).toContain('Please verify name spelling');
    expect(result.html).toContain('Looks good');
  });

  it('styles resolved comments differently', () => {
    const result = generateFeedbackUi(makeSchema(), { existingComments: sampleComments });
    expect(result.html).toContain('Resolved');
    expect(result.html).toContain('civ-opacity-60');
  });

  it('shows requiresResolution banner with unresolved count', () => {
    const schema = makeSchema({ feedback: { granularity: 'section', requiresResolution: true } });
    const result = generateFeedbackUi(schema, { existingComments: sampleComments });
    expect(result.html).toContain('1 unresolved comment');
    expect(result.html).toContain('role="alert"');
    expect(result.features).toContain('requires-resolution');
  });

  it('JS emits civ-feedback-submit custom event', () => {
    const result = generateFeedbackUi(makeSchema(), { mode: 'reviewer' });
    expect(result.javascript).toContain('civ-feedback-submit');
  });

  it('panels have ARIA labels', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.html).toContain('aria-label="Feedback for Personal info"');
    expect(result.html).toContain('role="complementary"');
  });

  it('panels are hidden by default and toggled via JS', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.html).toContain('hidden');
    expect(result.javascript).toContain('data-civ-feedback-trigger');
  });

  it('trigger buttons have aria-expanded and aria-controls', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.html).toContain('aria-expanded="false"');
    expect(result.html).toContain('aria-controls="feedback-personal-info"');
  });

  it('JS toggles aria-expanded on trigger buttons', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.javascript).toContain('aria-expanded');
  });

  it('trigger buttons appear before their panels', () => {
    const result = generateFeedbackUi(makeSchema());
    const triggerIndex = result.html.indexOf('data-civ-feedback-trigger="Personal info"');
    const panelIndex = result.html.indexOf('data-civ-feedback-panel="Personal info"');
    expect(triggerIndex).toBeLessThan(panelIndex);
  });

  it('shows "No comments" for empty targets', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.html).toContain('No comments');
  });

  it('features array is accurate', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.features).toContain('feedback');
    expect(result.features).toContain('section-level-feedback');
  });

  it('commentTargets matches sections for section granularity', () => {
    const result = generateFeedbackUi(makeSchema());
    expect(result.commentTargets).toEqual([
      { name: 'Personal info', type: 'section' },
      { name: 'Documents', type: 'section' },
    ]);
  });

  it('works with workflow allowsFeedback instead of feedback config', () => {
    const schema: FormSchema = {
      sections: [{ heading: 'Info', fields: [{ type: 'text', name: 'x', label: 'X' }] }],
      workflow: {
        initialState: 'review',
        states: [{ id: 'review', label: 'Review', allowsFeedback: true }],
        transitions: [],
      },
    };
    const result = generateFeedbackUi(schema);
    expect(result.features).toContain('feedback');
  });
});

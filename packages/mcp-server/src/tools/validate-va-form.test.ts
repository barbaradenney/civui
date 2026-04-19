import { describe, it, expect } from 'vitest';
import { validateVAForm } from './validate-va-form.js';
import { generateVAForm } from './generate-va-form.js';

describe('validateVAForm', () => {
  it('passes for a well-formed VA form', () => {
    const form = generateVAForm('21-526EZ');
    const allHtml = [
      form.pages.intro.html,
      form.taskListHub.html,
      ...form.pages.chapters.map(c => c.html),
      form.pages.review.html,
      form.pages.confirmation.html,
    ].join('\n');

    const result = validateVAForm(allHtml);
    expect(result.valid).toBe(true);
    expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
  });

  it('flags missing task list', () => {
    const result = validateVAForm('<div>No task list here</div>');
    expect(result.violations.some(v => v.rule === 'has-task-list')).toBe(true);
  });

  it('flags missing review page', () => {
    const result = validateVAForm('<div>No summary here</div>');
    expect(result.violations.some(v => v.rule === 'has-review-page')).toBe(true);
  });

  it('flags missing signature', () => {
    const result = validateVAForm('<div>No signature</div>');
    expect(result.violations.some(v => v.rule === 'has-signature')).toBe(true);
  });

  it('flags civ-text-secondary usage', () => {
    const result = validateVAForm('<span class="civ-text-secondary">bad</span>');
    expect(result.violations.some(v => v.rule === 'use-text-muted')).toBe(true);
  });

  it('returns summary string', () => {
    const result = validateVAForm('<div></div>');
    expect(result.summary).toContain('error');
  });

  it('returns valid=false for errors', () => {
    const result = validateVAForm('<div></div>');
    expect(result.valid).toBe(false);
  });
});

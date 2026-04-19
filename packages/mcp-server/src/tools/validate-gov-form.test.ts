import { describe, it, expect } from 'vitest';
import { validateGovForm } from './validate-gov-form.js';
import { generateGovForm } from './generate-gov-form.js';

describe('validateGovForm', () => {
  it('passes for a well-formed VA form', async () => {
    const form = await generateGovForm('21-526EZ');
    const allHtml = [
      form.pages.intro.html,
      form.taskListHub.html,
      ...form.pages.chapters.map(c => c.html),
      form.pages.review.html,
      form.pages.confirmation.html,
    ].join('\n');

    const result = validateGovForm(allHtml);
    expect(result.valid).toBe(true);
    expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0);
  });

  it('flags missing task list', () => {
    const result = validateGovForm('<div>No task list here</div>');
    expect(result.violations.some(v => v.rule === 'has-task-list')).toBe(true);
  });

  it('flags missing review page', () => {
    const result = validateGovForm('<div>No summary here</div>');
    expect(result.violations.some(v => v.rule === 'has-review-page')).toBe(true);
  });

  it('flags missing signature', () => {
    const result = validateGovForm('<div>No signature</div>');
    expect(result.violations.some(v => v.rule === 'has-signature')).toBe(true);
  });

  it('flags civ-text-secondary usage', () => {
    const result = validateGovForm('<span class="civ-text-secondary">bad</span>');
    expect(result.violations.some(v => v.rule === 'use-text-muted')).toBe(true);
  });

  it('returns summary string', () => {
    const result = validateGovForm('<div></div>');
    expect(result.summary).toContain('error');
  });

  it('returns valid=false for errors', () => {
    const result = validateGovForm('<div></div>');
    expect(result.valid).toBe(false);
  });
});

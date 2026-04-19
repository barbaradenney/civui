import { describe, it, expect } from 'vitest';
import { assembleGovForm } from './assemble-gov-form.js';

describe('assembleGovForm', () => {
  it('generates a complete HTML page for 21-526EZ', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('</html>');
  });

  it('includes all page sections', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('data-page="intro"');
    expect(result.html).toContain('data-page="hub"');
    expect(result.html).toContain('data-page="review"');
    expect(result.html).toContain('data-page="confirmation"');
  });

  it('includes chapter pages', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('data-page="personal-info"');
    expect(result.html).toContain('data-page="contact-info"');
    expect(result.html).toContain('data-page="service-history"');
  });

  it('includes CivUI imports', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('civ.css');
    expect(result.html).toContain('script type="module"');
  });

  it('includes router JavaScript', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('showPage');
    expect(result.html).toContain('hashchange');
    expect(result.html).toContain('handleSubmit');
  });

  it('includes task list status tracking', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('updateTaskList');
    expect(result.html).toContain('completedChapters');
  });

  it('includes review population logic', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.html).toContain('populateReview');
  });

  it('only shows intro page initially', () => {
    const result = assembleGovForm('21-526EZ');
    // Intro should NOT have hidden attribute
    expect(result.html).toMatch(/data-page="intro"(?!.*hidden)/);
    // Hub should have hidden
    expect(result.html).toContain('data-page="hub" hidden');
  });

  it('uses custom CDN base when provided', () => {
    const result = assembleGovForm('21-526EZ', { cdnBase: '/assets/civui' });
    expect(result.html).toContain('/assets/civui/core');
  });

  it('uses custom submit action when provided', () => {
    const result = assembleGovForm('21-526EZ', { submitAction: '/api/va/submit' });
    expect(result.html).toContain('/api/va/submit');
  });

  it('returns page count and features', () => {
    const result = assembleGovForm('21-526EZ');
    expect(result.pageCount).toBeGreaterThan(5);
    expect(result.features).toContain('single-page-app');
    expect(result.features).toContain('hash-routing');
  });

  it('works for all registered forms', () => {
    for (const formNum of ['21-526EZ', '10-10EZ', '22-1990', '21P-527EZ']) {
      const result = assembleGovForm(formNum);
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.pageCount).toBeGreaterThan(3);
    }
  });
});

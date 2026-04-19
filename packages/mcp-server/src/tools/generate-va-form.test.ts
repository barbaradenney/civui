import { describe, it, expect } from 'vitest';
import { generateVAForm } from './generate-va-form.js';

describe('generateVAForm', () => {
  it('generates a complete form for 21-526EZ', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.formNumber).toBe('21-526EZ');
    expect(result.title).toBe('Apply for disability compensation');
  });

  it('includes intro page', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.pages.intro.html).toContain('civ-form-intro');
    expect(result.pages.intro.html).toContain('21-526EZ');
  });

  it('includes all chapters', () => {
    const result = generateVAForm('21-526EZ');
    const chapterIds = result.pages.chapters.map(c => c.id);
    expect(chapterIds).toContain('personal-info');
    expect(chapterIds).toContain('contact-info');
    expect(chapterIds).toContain('service-history');
    expect(chapterIds).toContain('disabilities');
    expect(chapterIds).toContain('document-upload');
  });

  it('generates custom chapters in correct order', () => {
    const result = generateVAForm('21-526EZ');
    const chapterIds = result.pages.chapters.map(c => c.id);
    const serviceIdx = chapterIds.indexOf('service-history');
    const disabilityIdx = chapterIds.indexOf('disabilities');
    expect(disabilityIdx).toBeGreaterThan(serviceIdx);
  });

  it('includes review page with summary and signature', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.pages.review.html).toContain('civ-summary');
    expect(result.pages.review.html).toContain('civ-signature');
  });

  it('includes confirmation page with success alert', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.pages.confirmation.html).toContain('variant="success"');
  });

  it('includes task list hub', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.taskListHub.html).toContain('civ-task-list');
    expect(result.taskListHub.html).toContain('civ-task-group');
    expect(result.taskListHub.html).toContain('civ-progress-bar');
  });

  it('chapters use CivUI components', () => {
    const result = generateVAForm('21-526EZ');
    const personalInfo = result.pages.chapters.find(c => c.id === 'personal-info')!;
    expect(personalInfo.html).toContain('civ-name');
    expect(personalInfo.html).toContain('civ-memorable-date');
    expect(personalInfo.html).toContain('civ-text-input');
  });

  it('service history chapter uses repeater', () => {
    const result = generateVAForm('21-526EZ');
    const serviceHistory = result.pages.chapters.find(c => c.id === 'service-history')!;
    expect(serviceHistory.html).toContain('civ-repeater');
    expect(serviceHistory.html).toContain('mode="detail"');
  });

  it('chapters wrap in civ-form with persist', () => {
    const result = generateVAForm('21-526EZ');
    const chapter = result.pages.chapters[0];
    expect(chapter.html).toContain('civ-form');
    expect(chapter.html).toContain('persist=');
  });

  it('includes back-to-hub link', () => {
    const result = generateVAForm('21-526EZ');
    const chapter = result.pages.chapters[0];
    expect(chapter.html).toContain('Back to task list');
  });

  it('returns features array', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.features).toContain('va-form');
    expect(result.features).toContain('task-list-hub');
    expect(result.features).toContain('review-page');
    expect(result.features).toContain('signature');
  });

  it('counts fields and chapters', () => {
    const result = generateVAForm('21-526EZ');
    expect(result.fieldCount).toBeGreaterThan(0);
    expect(result.chapterCount).toBeGreaterThan(0);
  });

  it('throws for unknown form number', () => {
    expect(() => generateVAForm('99-FAKE')).toThrow('Unknown VA form');
  });

  it('generates 10-10EZ healthcare form', () => {
    const result = generateVAForm('10-10EZ');
    expect(result.formNumber).toBe('10-10EZ');
    expect(result.pages.chapters.some(c => c.id === 'insurance-info')).toBe(true);
  });

  it('generates 22-1990 education form', () => {
    const result = generateVAForm('22-1990');
    expect(result.formNumber).toBe('22-1990');
    expect(result.pages.chapters.some(c => c.id === 'education-info')).toBe(true);
    expect(result.pages.chapters.some(c => c.id === 'direct-deposit')).toBe(true);
  });

  it('generates 21P-527EZ pension form', () => {
    const result = generateVAForm('21P-527EZ');
    expect(result.formNumber).toBe('21P-527EZ');
    expect(result.pages.chapters.some(c => c.id === 'financial-info')).toBe(true);
    expect(result.pages.chapters.some(c => c.id === 'marital-info')).toBe(true);
  });
});

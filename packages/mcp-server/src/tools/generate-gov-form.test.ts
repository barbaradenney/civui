import { describe, it, expect } from 'vitest';
import { generateGovForm } from './generate-gov-form.js';

describe('generateGovForm', async () => {
  it('generates a complete form for 21-526EZ', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.formNumber).toBe('21-526EZ');
    expect(result.title).toBe('Apply for disability compensation');
  });

  it('includes intro page', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.pages.intro.html).toContain('civ-form-intro');
    expect(result.pages.intro.html).toContain('21-526EZ');
  });

  it('includes all chapters', async () => {
    const result = await generateGovForm('21-526EZ');
    const chapterIds = result.pages.chapters.map(c => c.id);
    expect(chapterIds).toContain('personal-info');
    expect(chapterIds).toContain('contact-info');
    expect(chapterIds).toContain('service-history');
    expect(chapterIds).toContain('disabilities');
    expect(chapterIds).toContain('document-upload');
  });

  it('generates custom chapters in correct order', async () => {
    const result = await generateGovForm('21-526EZ');
    const chapterIds = result.pages.chapters.map(c => c.id);
    const serviceIdx = chapterIds.indexOf('service-history');
    const disabilityIdx = chapterIds.indexOf('disabilities');
    expect(disabilityIdx).toBeGreaterThan(serviceIdx);
  });

  it('includes review page with summary and signature', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.pages.review.html).toContain('civ-summary');
    expect(result.pages.review.html).toContain('civ-signature');
  });

  it('includes confirmation page with success alert', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.pages.confirmation.html).toContain('intent="success"');
  });

  it('includes task list hub', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.taskListHub.html).toContain('civ-list');
    expect(result.taskListHub.html).toContain('civ-list-item');
    expect(result.taskListHub.html).toContain('civ-progress-percent');
  });

  it('chapters use CivUI components', async () => {
    const result = await generateGovForm('21-526EZ');
    const personalInfo = result.pages.chapters.find(c => c.id === 'personal-info')!;
    expect(personalInfo.html).toContain('civ-name');
    expect(personalInfo.html).toContain('civ-memorable-date');
    expect(personalInfo.html).toContain('civ-text-input');
  });

  it('service history chapter uses repeater', async () => {
    const result = await generateGovForm('21-526EZ');
    const serviceHistory = result.pages.chapters.find(c => c.id === 'service-history')!;
    expect(serviceHistory.html).toContain('civ-repeater');
    // Default repeater (inline mode) — no explicit mode attribute
    expect(serviceHistory.html).not.toContain('mode="detail"');
  });

  it('chapters use civ-form-step', async () => {
    const result = await generateGovForm('21-526EZ');
    const chapter = result.pages.chapters[0];
    expect(chapter.html).toContain('civ-form-step');
  });

  it('includes back-to-hub link', async () => {
    const result = await generateGovForm('21-526EZ');
    const chapter = result.pages.chapters[0];
    expect(chapter.html).toContain('Back to task list');
  });

  it('returns features array', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.features).toContain('gov-form');
    expect(result.features).toContain('task-list-hub');
    expect(result.features).toContain('review-page');
    expect(result.features).toContain('signature');
  });

  it('counts fields and chapters', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.fieldCount).toBeGreaterThan(0);
    expect(result.chapterCount).toBeGreaterThan(0);
  });

  it('throws for unknown form number', async () => {
    await expect(generateGovForm('99-FAKE')).rejects.toThrow('Unknown form');
  });

  it('generates 10-10EZ healthcare form', async () => {
    const result = await generateGovForm('10-10EZ');
    expect(result.formNumber).toBe('10-10EZ');
    expect(result.pages.chapters.some(c => c.id === 'insurance-info')).toBe(true);
  });

  it('generates 22-1990 education form', async () => {
    const result = await generateGovForm('22-1990');
    expect(result.formNumber).toBe('22-1990');
    expect(result.pages.chapters.some(c => c.id === 'education-info')).toBe(true);
    expect(result.pages.chapters.some(c => c.id === 'direct-deposit')).toBe(true);
  });

  it('generates 21P-527EZ pension form', async () => {
    const result = await generateGovForm('21P-527EZ');
    expect(result.formNumber).toBe('21P-527EZ');
    expect(result.pages.chapters.some(c => c.id === 'financial-info')).toBe(true);
    expect(result.pages.chapters.some(c => c.id === 'marital-info')).toBe(true);
  });

  it('generates 21-22 complex form with workflow', async () => {
    const result = await generateGovForm('21-22');
    expect(result.formNumber).toBe('21-22');
    expect(result.complex).toBeDefined();
    expect(result.complex!.workflowUi).toBeDefined();
    expect(result.complex!.workflowUi!.html).toContain('workflow');
    expect(result.complex!.actors).toBeDefined();
    expect(result.complex!.actors!.length).toBe(3);
    expect(result.features).toContain('workflow');
    expect(result.features).toContain('delegation');
  });

  it('simple forms have no complex property', async () => {
    const result = await generateGovForm('21-526EZ');
    expect(result.complex).toBeUndefined();
  });
});

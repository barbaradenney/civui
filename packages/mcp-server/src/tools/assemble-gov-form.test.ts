import { describe, it, expect } from 'vitest';
import { assembleGovForm } from './assemble-gov-form.js';

describe('assembleGovForm', async () => {
  it('generates a complete HTML page for 21-526EZ', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('</html>');
  });

  it('includes all page sections', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('data-page="intro"');
    expect(result.html).toContain('data-page="hub"');
    expect(result.html).toContain('data-page="review"');
    expect(result.html).toContain('data-page="confirmation"');
  });

  it('includes chapter pages', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('data-page="personal-info"');
    expect(result.html).toContain('data-page="contact-info"');
    expect(result.html).toContain('data-page="service-history"');
  });

  it('includes CivUI imports', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('civ.css');
    expect(result.html).toContain('script type="module"');
  });

  it('includes router JavaScript', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('showPage');
    expect(result.html).toContain('hashchange');
    expect(result.html).toContain('handleSubmit');
  });

  it('includes task list status tracking', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('updateTaskList');
    expect(result.html).toContain('completedChapters');
  });

  it('includes review population logic', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.html).toContain('populateReview');
  });

  it('only shows intro page initially', async () => {
    const result = await assembleGovForm('21-526EZ');
    // Intro should NOT have hidden attribute
    expect(result.html).toMatch(/data-page="intro"(?!.*hidden)/);
    // Hub should have hidden
    expect(result.html).toContain('data-page="hub" hidden');
  });

  it('uses custom CDN base when provided', async () => {
    const result = await assembleGovForm('21-526EZ', { cdnBase: '/assets/civui' });
    expect(result.html).toContain('/assets/civui/core');
  });

  it('uses custom submit action when provided', async () => {
    const result = await assembleGovForm('21-526EZ', { submitAction: '/api/va/submit' });
    expect(result.html).toContain('/api/va/submit');
  });

  it('returns page count and features', async () => {
    const result = await assembleGovForm('21-526EZ');
    expect(result.pageCount).toBeGreaterThan(5);
    expect(result.features).toContain('single-page-app');
    expect(result.features).toContain('hash-routing');
  });

  it('works for all registered forms', async () => {
    for (const formNum of ['21-526EZ', '10-10EZ', '22-1990', '21P-527EZ']) {
      const result = await assembleGovForm(formNum);
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.pageCount).toBeGreaterThan(3);
    }
  });
});

describe('assembleGovForm (react format)', async () => {
  it('returns files array for react format', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    expect(result.files).toBeDefined();
    expect(result.files!.length).toBeGreaterThan(3);
  });

  it('includes main app component', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    const app = result.files!.find(f => f.path.includes('App.tsx'));
    expect(app).toBeDefined();
    expect(app!.content).toContain('useState');
    expect(app!.content).toContain('export default');
  });

  it('includes intro page component', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    const intro = result.files!.find(f => f.path.includes('IntroPage'));
    expect(intro).toBeDefined();
  });

  it('includes chapter components', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    const chapters = result.files!.filter(f => f.path.includes('chapters/'));
    expect(chapters.length).toBeGreaterThan(3);
  });

  it('includes review and confirmation pages', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    expect(result.files!.some(f => f.path.includes('ReviewPage'))).toBe(true);
    expect(result.files!.some(f => f.path.includes('ConfirmationPage'))).toBe(true);
  });

  it('app component imports CivUI packages', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    const app = result.files!.find(f => f.path.includes('App.tsx'))!;
    expect(app.content).toContain("@civui/core");
    expect(app.content).toContain("@civui/inputs");
  });

  it('app component has navigation state', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    const app = result.files!.find(f => f.path.includes('App.tsx'))!;
    expect(app.content).toContain('currentPage');
    expect(app.content).toContain('navigate');
    expect(app.content).toContain('completeChapter');
  });

  it('returns react features', async () => {
    const result = await assembleGovForm('21-526EZ', { format: 'react' });
    expect(result.features).toContain('react');
    expect(result.features).toContain('typescript');
  });

  it('works for all registered forms in react format', async () => {
    for (const formNum of ['21-526EZ', '10-10EZ', '22-1990', '21P-527EZ']) {
      const result = await assembleGovForm(formNum, { format: 'react' });
      expect(result.files!.length).toBeGreaterThan(3);
    }
  });
});

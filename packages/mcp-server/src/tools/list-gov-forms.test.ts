import { describe, it, expect } from 'vitest';
import { listGovForms } from './list-gov-forms.js';

describe('listGovForms', () => {
  it('returns all registered forms', () => {
    const result = listGovForms();
    expect(result.totalCount).toBe(5);
    expect(result.forms.length).toBe(5);
  });

  it('includes form numbers', () => {
    const result = listGovForms();
    const numbers = result.forms.map(f => f.formNumber);
    expect(numbers).toContain('21-526EZ');
    expect(numbers).toContain('10-10EZ');
    expect(numbers).toContain('22-1990');
    expect(numbers).toContain('21P-527EZ');
  });

  it('includes titles and descriptions', () => {
    const result = listGovForms();
    const disability = result.forms.find(f => f.formNumber === '21-526EZ')!;
    expect(disability.title).toContain('disability');
    expect(disability.description.length).toBeGreaterThan(0);
  });

  it('includes chapter counts', () => {
    const result = listGovForms();
    result.forms.forEach(f => {
      expect(f.chapterCount).toBeGreaterThan(0);
    });
  });

  it('includes respondent burden', () => {
    const result = listGovForms();
    result.forms.forEach(f => {
      expect(f.respondentBurden).toContain('minutes');
    });
  });
});

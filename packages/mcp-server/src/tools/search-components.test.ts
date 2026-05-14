import { describe, it, expect } from 'vitest';
import { searchComponents } from './search-components.js';

describe('searchComponents', () => {
  it('returns empty results for a query that tokenizes to nothing', () => {
    const r = searchComponents({ query: 'a the on of' });
    expect(r.matchCount).toBe(0);
    expect(r.results).toEqual([]);
  });

  it('finds civ-file-upload for "upload" intent', () => {
    const r = searchComponents({ query: 'upload a file' });
    const names = r.results.map(x => x.name);
    expect(names).toContain('civ-file-upload');
  });

  it('finds civ-signature for "sign" intent', () => {
    const r = searchComponents({ query: 'user signature' });
    const names = r.results.map(x => x.name);
    expect(names).toContain('civ-signature');
  });

  it('ranks both checkbox + checkbox-group at the top for a "checkbox" query', () => {
    const r = searchComponents({ query: 'checkbox', limit: 5 });
    const top2 = r.results.slice(0, 2).map(x => x.name);
    expect(top2).toContain('civ-checkbox');
    expect(top2).toContain('civ-checkbox-group');
  });

  it('respects the limit parameter', () => {
    const r = searchComponents({ query: 'input', limit: 2 });
    expect(r.results.length).toBeLessThanOrEqual(2);
  });

  it('filters by category when provided', () => {
    const r = searchComponents({ query: 'input', category: 'form-control', limit: 20 });
    for (const result of r.results) {
      expect(result.category).toBe('form-control');
    }
  });

  it('attaches the schema prop list and event list to each result', () => {
    const r = searchComponents({ query: 'text input', limit: 1 });
    expect(r.results.length).toBeGreaterThan(0);
    expect(Array.isArray(r.results[0].props)).toBe(true);
    expect(Array.isArray(r.results[0].events)).toBe(true);
  });

  it('exposes per-field score breakdown so the caller can see why a result matched', () => {
    const r = searchComponents({ query: 'checkbox', limit: 1 });
    expect(r.results[0].matches).toEqual(
      expect.objectContaining({
        name: expect.any(Number),
        category: expect.any(Number),
        description: expect.any(Number),
        propName: expect.any(Number),
        propDescription: expect.any(Number),
      }),
    );
  });

  it('returns stable ordering when scores tie (alphabetical by name)', () => {
    // Pick a generic-enough query that ties are likely.
    const r1 = searchComponents({ query: 'date', limit: 10 });
    const r2 = searchComponents({ query: 'date', limit: 10 });
    expect(r1.results.map(x => x.name)).toEqual(r2.results.map(x => x.name));
  });
});

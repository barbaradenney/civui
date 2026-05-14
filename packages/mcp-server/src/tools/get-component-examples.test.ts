import { describe, it, expect } from 'vitest';
import { getComponentExamples, listComponentsWithExamples } from './get-component-examples.js';

describe('getComponentExamples', () => {
  it('returns extracted examples for a known component', () => {
    const r = getComponentExamples({ name: 'civ-button' });
    expect(r.totalAvailable).toBeGreaterThan(0);
    expect(r.examples.length).toBeGreaterThan(0);
    for (const ex of r.examples) {
      expect(typeof ex.story).toBe('string');
      expect(ex.html).toContain('civ-button');
      expect(ex.source).toMatch(/\.stories\.ts$/);
    }
  });

  it('respects the limit parameter', () => {
    const r = getComponentExamples({ name: 'civ-button', limit: 2 });
    expect(r.examples.length).toBeLessThanOrEqual(2);
  });

  it('flags truncation when the full set exceeds the limit', () => {
    // civ-button has many stories — easy to truncate.
    const r = getComponentExamples({ name: 'civ-button', limit: 1 });
    expect(r.totalAvailable).toBeGreaterThan(1);
    expect(r.truncated).toBe(true);
  });

  it('does NOT mark truncated when the limit covers everything', () => {
    const r = getComponentExamples({ name: 'civ-button', limit: 999 });
    expect(r.truncated).toBe(false);
  });

  it('returns empty list + suggestions for an unknown name (typo recovery)', () => {
    const r = getComponentExamples({ name: 'civ-input' });  // probable typo for civ-text-input
    expect(r.totalAvailable).toBe(0);
    expect(r.examples).toEqual([]);
    expect(r.suggestions).toBeDefined();
    expect(r.suggestions!.length).toBeGreaterThan(0);
    expect(r.suggestions!.some(s => s.includes('input'))).toBe(true);
  });

  it('omits suggestions field when no plausible match exists', () => {
    const r = getComponentExamples({ name: 'civ-totally-fictional-thing' });
    expect(r.totalAvailable).toBe(0);
    expect(r.suggestions).toBeUndefined();
  });
});

describe('listComponentsWithExamples', () => {
  it('returns the catalog of components that have examples', () => {
    const r = listComponentsWithExamples();
    expect(r.totalComponents).toBeGreaterThan(20);
    expect(r.totalExamples).toBeGreaterThan(r.totalComponents); // at least one example per component
    expect(r.components[0].name).toMatch(/^civ-/);
    expect(r.components[0].count).toBeGreaterThan(0);
  });

  it('sorts components alphabetically for stable agent reads', () => {
    const r = listComponentsWithExamples();
    const names = r.components.map(c => c.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it('agrees with the per-component count from getComponentExamples', () => {
    const list = listComponentsWithExamples();
    const sample = list.components[0];
    const fetched = getComponentExamples({ name: sample.name, limit: 999 });
    expect(fetched.totalAvailable).toBe(sample.count);
  });
});

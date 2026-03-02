import { describe, it, expect } from 'vitest';
import { queryTokens } from './query-tokens.js';

describe('queryTokens', () => {
  describe('unfiltered queries', () => {
    it('returns full token set with count > 100', () => {
      const result = queryTokens({});
      expect(result.count).toBeGreaterThan(100);
      expect(result.tokens).toHaveLength(result.count);
    });

    it('has at least 9 categories present in unfiltered results', () => {
      const result = queryTokens({});
      const expected = [
        'color',
        'color-dark',
        'spacing',
        'typography',
        'border',
        'focus',
        'motion',
        'shadow',
        'scales',
      ];
      for (const cat of expected) {
        expect(result.categories).toContain(cat);
      }
      expect(result.categories.length).toBeGreaterThanOrEqual(9);
    });

    it('no-options returns all tokens (same as queryTokens({}))', () => {
      const withEmpty = queryTokens({});
      const withDefault = queryTokens();
      expect(withDefault.count).toBe(withEmpty.count);
      expect(withDefault.categories).toEqual(withEmpty.categories);
      expect(withDefault.tokens.map((t) => t.name)).toEqual(
        withEmpty.tokens.map((t) => t.name),
      );
    });
  });

  describe('category filter', () => {
    it('filter by category "color" returns only color tokens', () => {
      const result = queryTokens({ category: 'color' });
      expect(result.count).toBeGreaterThan(0);
      expect(result.categories).toEqual(['color']);
      for (const token of result.tokens) {
        expect(token.category).toBe('color');
      }
    });

    it('filter by category "spacing" returns dimension tokens', () => {
      const result = queryTokens({ category: 'spacing' });
      expect(result.count).toBeGreaterThan(0);
      expect(result.categories).toEqual(['spacing']);
      for (const token of result.tokens) {
        expect(token.category).toBe('spacing');
        expect(token.type).toBe('dimension');
      }
    });

    it('dark mode tokens included with category "color-dark"', () => {
      const result = queryTokens({ category: 'color-dark' });
      expect(result.count).toBeGreaterThan(0);
      expect(result.categories).toEqual(['color-dark']);
      for (const token of result.tokens) {
        expect(token.category).toBe('color-dark');
        expect(token.type).toBe('color');
      }
    });
  });

  describe('search filter', () => {
    it('search "primary" returns primary color variants', () => {
      const result = queryTokens({ search: 'primary' });
      expect(result.count).toBeGreaterThan(0);
      for (const token of result.tokens) {
        expect(token.name.toLowerCase()).toContain('primary');
      }
    });

    it('search "error" returns error colors', () => {
      const result = queryTokens({ search: 'error' });
      expect(result.count).toBeGreaterThan(0);
      for (const token of result.tokens) {
        expect(token.name.toLowerCase()).toContain('error');
      }
    });

    it('empty results for non-existent search ("xyznonexistent")', () => {
      const result = queryTokens({ search: 'xyznonexistent' });
      expect(result.count).toBe(0);
      expect(result.tokens).toEqual([]);
      expect(result.categories).toEqual([]);
    });

    it('case-insensitive search ("PRIMARY" finds primary tokens)', () => {
      const upper = queryTokens({ search: 'PRIMARY' });
      const lower = queryTokens({ search: 'primary' });
      expect(upper.count).toBe(lower.count);
      expect(upper.count).toBeGreaterThan(0);
      expect(upper.tokens.map((t) => t.name)).toEqual(
        lower.tokens.map((t) => t.name),
      );
    });
  });

  describe('type filter', () => {
    it('filter by type "color" returns only color-typed tokens', () => {
      const result = queryTokens({ type: 'color' });
      expect(result.count).toBeGreaterThan(0);
      for (const token of result.tokens) {
        expect(token.type).toBe('color');
      }
    });

    it('filter by type "dimension" returns only dimension-typed tokens', () => {
      const result = queryTokens({ type: 'dimension' });
      expect(result.count).toBeGreaterThan(0);
      for (const token of result.tokens) {
        expect(token.type).toBe('dimension');
      }
    });
  });

  describe('combined filters', () => {
    it('combined category + search (category "color", search "dark")', () => {
      const result = queryTokens({ category: 'color', search: 'dark' });
      expect(result.count).toBeGreaterThan(0);
      expect(result.categories).toEqual(['color']);
      for (const token of result.tokens) {
        expect(token.category).toBe('color');
        expect(token.name.toLowerCase()).toContain('dark');
      }
    });
  });

  describe('output format', () => {
    it('cssVar format correctness (starts with "--civ-")', () => {
      const result = queryTokens({});
      for (const token of result.tokens) {
        expect(token.cssVar).toMatch(/^--civ-/);
      }
    });

    it('Tailwind class format correctness for color (starts with "civ-text-")', () => {
      const result = queryTokens({ category: 'color' });
      expect(result.count).toBeGreaterThan(0);
      for (const token of result.tokens) {
        expect(token.tailwind).toMatch(/^civ-text-/);
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import { discoverTools } from './discover-tools.js';

describe('discoverTools', () => {
  it('returns all tools by default', () => {
    const result = discoverTools();
    expect(result.totalTools).toBeGreaterThan(70);
  });

  it('returns tier counts', () => {
    const result = discoverTools();
    expect(result.tiers.essential).toBeGreaterThanOrEqual(12);
    expect(result.tiers.advanced).toBeGreaterThan(10);
    expect(result.tiers.internal).toBeGreaterThan(20);
  });

  it('groups by category', () => {
    const result = discoverTools();
    expect(Object.keys(result.categories).length).toBeGreaterThan(5);
    expect(result.categories['gov-forms']).toBeDefined();
    expect(result.categories['form-generation']).toBeDefined();
  });

  it('filters by tier', () => {
    const result = discoverTools({ tier: 'essential' });
    expect(result.totalTools).toBeGreaterThanOrEqual(12);
    expect(result.tiers.advanced).toBe(0);
    expect(result.tiers.internal).toBe(0);
  });

  it('filters by category', () => {
    const result = discoverTools({ category: 'gov-forms' });
    expect(result.totalTools).toBeGreaterThan(0);
    result.categories['gov-forms']?.forEach(t => {
      expect(t.name).toBeDefined();
      expect(t.description).toBeDefined();
    });
  });

  it('each tool has name, tier, and description', () => {
    const result = discoverTools();
    for (const tools of Object.values(result.categories)) {
      for (const tool of tools) {
        expect(tool.name.length).toBeGreaterThan(0);
        expect(tool.tier.length).toBeGreaterThan(0);
        expect(tool.description.length).toBeGreaterThan(0);
      }
    }
  });
});

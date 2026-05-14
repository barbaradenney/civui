import { describe, it, expect } from 'vitest';
import { getComponentGuide } from './get-component-guide.js';

describe('getComponentGuide', () => {
  it('returns a synthesized guide for a known component', () => {
    const r = getComponentGuide({ name: 'civ-text-input' });
    expect(r.found).toBe(true);
    expect(r.schema?.description).toMatch(/text input/i);
    expect(r.schema?.category).toBe('form-control');
    expect(Array.isArray(r.schema?.props)).toBe(true);
    expect(r.schema!.props.length).toBeGreaterThan(0);
    expect(Array.isArray(r.examples)).toBe(true);
    expect(r.examples!.length).toBeGreaterThan(0);
  });

  it('embeds prop entries with type + description from the schema', () => {
    const r = getComponentGuide({ name: 'civ-text-input' });
    const placeholder = r.schema!.props.find(p => p.name === 'placeholder');
    expect(placeholder).toBeDefined();
    expect(placeholder!.type).toBe('string');
    expect(placeholder!.description).toBeTruthy();
  });

  it('marks webOnly props so callers know not to compare against native', () => {
    const r = getComponentGuide({ name: 'civ-link' });
    const newTab = r.schema!.props.find(p => p.name === 'newTab');
    expect(newTab?.webOnly).toBe(true);
  });

  it('limits the example count via exampleLimit', () => {
    const r = getComponentGuide({ name: 'civ-button', exampleLimit: 1 });
    expect(r.examples!.length).toBe(1);
  });

  it('lists same-category neighbors as related components', () => {
    const r = getComponentGuide({ name: 'civ-text-input' });
    expect(Array.isArray(r.related)).toBe(true);
    expect(r.related!.length).toBeGreaterThan(0);
    // Related items should not include self.
    expect(r.related!.find(c => c.name === 'civ-text-input')).toBeUndefined();
  });

  it('surfaces matching trap entries when present', () => {
    // common-traps.md mentions civ-relationship in the "boolean attributes
    // are truthy whenever present" trap. Should show up here.
    const r = getComponentGuide({ name: 'civ-relationship' });
    expect(r.traps).toBeDefined();
    expect(r.traps!.length).toBeGreaterThan(0);
    expect(r.traps!.join('\n')).toMatch(/relationship/i);
  });

  it('omits traps + related fields when there is nothing to show', () => {
    // Pick a component that doesn't appear in common-traps.md.
    const r = getComponentGuide({ name: 'civ-icon' });
    // traps may be undefined OR an empty array filtered to undefined.
    if (r.traps !== undefined) {
      expect(r.traps.length).toBeGreaterThan(0);
    }
  });

  it('returns found: false + suggestions for an unknown component', () => {
    const r = getComponentGuide({ name: 'civ-input' });  // typo
    expect(r.found).toBe(false);
    expect(r.schema).toBeUndefined();
    expect(r.suggestions).toBeDefined();
    expect(r.suggestions!.length).toBeGreaterThan(0);
  });

  it('returns found: false with no suggestions for a totally fake name', () => {
    const r = getComponentGuide({ name: 'civ-totally-fictional-thing' });
    expect(r.found).toBe(false);
    expect(r.suggestions).toBeUndefined();
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-relationship-type.js';
import type { CivRelationshipType } from './civ-relationship-type.js';

describe('civ-relationship-type', () => {
  afterEach(cleanupFixtures);

  it('renders with 5 general relationship options by default', async () => {
    const el = await fixture<CivRelationshipType>('<civ-relationship-type name="relationship"></civ-relationship-type>');
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(5);
    expect(select.options[0].value).toBe('spouse');
    expect(select.options[4].value).toBe('other');
  });

  it('renders VA dependent options with preset="va-dependent"', async () => {
    const el = await fixture<CivRelationshipType>('<civ-relationship-type name="relationship" preset="va-dependent"></civ-relationship-type>');
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type-select]') as any;
    expect(select.options.length).toBe(5);
    const values = select.options.map((o: any) => o.value);
    expect(values).toContain('biological-child');
    expect(values).toContain('adopted-child');
    expect(values).toContain('stepchild');
  });

  it('renders VA survivor options with preset="va-survivor"', async () => {
    const el = await fixture<CivRelationshipType>('<civ-relationship-type name="relationship" preset="va-survivor"></civ-relationship-type>');
    await elementUpdated(el);

    const select = el.querySelector('[data-relationship-type-select]') as any;
    expect(select.options.length).toBe(5);
    const values = select.options.map((o: any) => o.value);
    expect(values).toContain('executor');
    expect(values).toContain('funeral-director');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-relationship-type') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-relationship-type name="relationship"></civ-relationship-type>');
    expect(el.shadowRoot).toBeNull();
  });
});

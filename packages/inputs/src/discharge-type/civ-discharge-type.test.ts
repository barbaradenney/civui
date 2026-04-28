import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-discharge-type.js';
import type { CivDischargeType } from './civ-discharge-type.js';

describe('civ-discharge-type', () => {
  afterEach(cleanupFixtures);

  it('renders with 6 discharge type options', async () => {
    const el = await fixture<CivDischargeType>('<civ-discharge-type name="discharge"></civ-discharge-type>');
    await elementUpdated(el);

    const select = el.querySelector('[data-discharge-type-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(6);
    expect(select.options[0].value).toBe('honorable');
    expect(select.options[5].value).toBe('uncharacterized');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-discharge-type') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-discharge-type name="discharge"></civ-discharge-type>');
    expect(el.shadowRoot).toBeNull();
  });
});

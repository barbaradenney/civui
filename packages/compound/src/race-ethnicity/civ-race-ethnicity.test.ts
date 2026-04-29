import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-race-ethnicity.js';
import type { CivRaceEthnicity } from './civ-race-ethnicity.js';

describe('civ-race-ethnicity', () => {
  afterEach(cleanupFixtures);

  it('renders ethnicity radio group and race checkbox group', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demographics" name="demo"></civ-race-ethnicity>');
    await elementUpdated(el);

    const radios = el.querySelectorAll('civ-radio');
    expect(radios.length).toBe(3);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    expect(checkboxes.length).toBe(6);
  });

  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-race-ethnicity legend="Race and ethnicity" name="demo"></civ-race-ethnicity>');

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Race and ethnicity');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-race-ethnicity') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
    expect(el.shadowRoot).toBeNull();
  });
});

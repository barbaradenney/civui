import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-ethnicity.js';
import type { CivEthnicity } from './civ-ethnicity.js';

describe('civ-ethnicity', () => {
  afterEach(cleanupFixtures);

  it('renders with 3 OMB ethnicity options', async () => {
    const el = await fixture<CivEthnicity>('<civ-ethnicity name="ethnicity"></civ-ethnicity>');
    await elementUpdated(el);

    const select = el.querySelector('[data-ethnicity-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(3);
    expect(select.options[0].value).toBe('hispanic-latino');
    expect(select.options[2].value).toBe('prefer-not-to-answer');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-ethnicity') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-ethnicity name="ethnicity"></civ-ethnicity>');
    expect(el.shadowRoot).toBeNull();
  });
});

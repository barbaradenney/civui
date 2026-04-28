import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-gender.js';
import type { CivGender } from './civ-gender.js';

describe('civ-gender', () => {
  afterEach(cleanupFixtures);

  it('renders with 5 gender options by default', async () => {
    const el = await fixture<CivGender>('<civ-gender name="gender"></civ-gender>');
    await elementUpdated(el);

    const select = el.querySelector('[data-gender-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(5);
    expect(select.options[0].value).toBe('male');
    expect(select.options[4].value).toBe('other');
  });

  it('renders binary options when format is binary', async () => {
    const el = await fixture<CivGender>('<civ-gender name="gender" format="binary"></civ-gender>');
    await elementUpdated(el);

    const select = el.querySelector('[data-gender-select]') as any;
    expect(select.options.length).toBe(2);
    expect(select.options[0].value).toBe('male');
    expect(select.options[1].value).toBe('female');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-gender') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-gender name="gender"></civ-gender>');
    expect(el.shadowRoot).toBeNull();
  });
});

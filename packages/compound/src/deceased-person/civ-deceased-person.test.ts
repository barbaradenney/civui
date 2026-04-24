import { describe, it, expect, afterEach } from 'vitest';
import '@civui/inputs';
import '@civui/controls';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '../name/civ-name.js';
import './civ-deceased-person.js';
import type { CivDeceasedPerson } from './civ-deceased-person.js';

afterEach(cleanupFixtures);

describe('civ-deceased-person', () => {
  it('renders a fieldset with a plain-language default legend', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person></civ-deceased-person>',
    );
    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('About the person who died');
  });

  it('composes civ-name + two memorable dates + relationship select', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person name="deceased"></civ-deceased-person>',
    );
    expect(el.querySelector('civ-name')).not.toBeNull();
    expect(el.querySelectorAll('civ-memorable-date').length).toBe(2);
    expect(el.querySelector('[data-deceased-relationship]')).not.toBeNull();
  });

  it('hides the relationship field when hide-relationship is set', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person hide-relationship></civ-deceased-person>',
    );
    expect(el.querySelector('[data-deceased-relationship]')).toBeNull();
  });

  it('emits civ-input with a structured value when the name changes', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person name="deceased"></civ-deceased-person>',
    );
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const name = el.querySelector('civ-name') as any;
    name.dispatchEvent(new CustomEvent('civ-input', {
      bubbles: true,
      detail: { value: { first: 'Jane', middle: '', last: 'Doe', suffix: '' } },
    }));

    expect(detail).not.toBeNull();
    expect(detail.value.first).toBe('Jane');
    expect(detail.value.last).toBe('Doe');
  });

  it('emits civ-change with date of death when that field changes', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person name="deceased"></civ-deceased-person>',
    );
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const dates = el.querySelectorAll('civ-memorable-date');
    const dod = dates[1] as any;
    dod.dispatchEvent(new CustomEvent('civ-change', {
      bubbles: true,
      detail: { value: '2024-03-15' },
    }));

    expect(detail).not.toBeNull();
    expect(detail.value.dateOfDeath).toBe('2024-03-15');
  });

  it('serialises the combined value to its `value` property', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person name="deceased"></civ-deceased-person>',
    ) as CivDeceasedPerson;
    el.personValue = {
      first: 'Jane', middle: '', last: 'Doe', suffix: '',
      dateOfBirth: '1950-01-01', dateOfDeath: '2024-03-15', relationship: 'spouse',
    };
    await elementUpdated(el);
    const parsed = JSON.parse(el.value);
    expect(parsed.first).toBe('Jane');
    expect(parsed.dateOfDeath).toBe('2024-03-15');
    expect(parsed.relationship).toBe('spouse');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-deceased-person') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-deceased-person></civ-deceased-person>');
    expect(el.shadowRoot).toBeNull();
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture<CivDeceasedPerson>(
      '<civ-deceased-person></civ-deceased-person>',
    ) as CivDeceasedPerson;
    el.personValue = {
      first: 'Jane', middle: '', last: 'Doe', suffix: '',
      dateOfBirth: '1950-01-01', dateOfDeath: '2024-03-15', relationship: 'spouse',
    };
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.personValue.first).toBe('');
    expect(el.personValue.dateOfDeath).toBe('');
    expect(el.value).toBe('');
  });
});

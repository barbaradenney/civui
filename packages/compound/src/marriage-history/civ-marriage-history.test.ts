import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import '@civui/controls';
import './civ-marriage-history.js';

afterEach(cleanupFixtures);

describe('civ-marriage-history', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-marriage-history legend="First marriage" name="m1"></civ-marriage-history>');
    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('First marriage');
  });

  it('renders spouse name fields', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>');
    expect(el.querySelector('civ-name')).not.toBeNull();
  });

  it('renders marriage date', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>');
    const dates = el.querySelectorAll('civ-memorable-date');
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  it('renders marriage status radio group', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>');
    const radioGroup = el.querySelector('civ-radio-group');
    expect(radioGroup).not.toBeNull();
  });

  it('hides end date when status is current', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'current' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).not.toContain('Date marriage ended');
  });

  it('shows end date when status is divorced', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'divorced' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date marriage ended');
  });

  it('shows end date when status is widowed', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'widowed' };
    await elementUpdated(el);

    const dates = el.querySelectorAll('civ-memorable-date');
    const legends = Array.from(dates).map((d: any) => d.getAttribute('legend'));
    expect(legends).toContain('Date marriage ended');
  });

  it('clears end date when switching to current', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>') as any;
    el.marriageValue = { ...el.marriageValue, status: 'divorced', endDate: '2020-01-01' };
    await elementUpdated(el);

    const radioGroup = el.querySelector('civ-radio-group') as any;
    radioGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'current' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.marriageValue.endDate).toBe('');
  });

  it('serializes value as JSON', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>') as any;
    el.marriageValue = { ...el.marriageValue, spouseFirst: 'Jane', marriageDate: '2015-06-20', status: 'current' };
    await elementUpdated(el);

    const parsed = JSON.parse(el.value);
    expect(parsed.spouseFirst).toBe('Jane');
    expect(parsed.status).toBe('current');
  });

  it('fires civ-change on status change', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const radioGroup = el.querySelector('civ-radio-group') as any;
    radioGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'divorced' }, bubbles: true }));

    expect(handler).toHaveBeenCalled();
  });

  it('resets all data on formResetCallback', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>') as any;
    el.marriageValue = { ...el.marriageValue, spouseFirst: 'Jane', status: 'divorced', endDate: '2020-01-01' };
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.marriageValue.spouseFirst).toBe('');
    expect(el.marriageValue.status).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-marriage-history name="m"></civ-marriage-history>');
    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-marriage-history') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

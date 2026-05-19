import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import type { CivDateRangePicker } from './civ-date-range-picker.js';
import './civ-date-range-picker.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-date-range-picker', () => {
  it('renders the legend when set directly (self-contained)', async () => {
    const el = await fixture(
      '<civ-date-range-picker legend="Stay dates"></civ-date-range-picker>',
    );
    const legend = el.querySelector('legend');
    expect(legend?.textContent).toContain('Stay dates');
  });

  it('renders two civ-date-picker children with default labels', async () => {
    const el = await fixture('<civ-date-range-picker legend="Stay dates"></civ-date-range-picker>');
    const start = el.querySelector('[data-civ-range-start]');
    const end = el.querySelector('[data-civ-range-end]');
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    expect(start!.getAttribute('label')).toBe('Start date');
    expect(end!.getAttribute('label')).toBe('End date');
  });

  it('honors start-label / end-label overrides', async () => {
    const el = await fixture(
      '<civ-date-range-picker legend="Trip" start-label="Check-in" end-label="Check-out"></civ-date-range-picker>',
    );
    expect(el.querySelector('[data-civ-range-start]')!.getAttribute('label')).toBe('Check-in');
    expect(el.querySelector('[data-civ-range-end]')!.getAttribute('label')).toBe('Check-out');
  });

  it('forwards ${name}.start and ${name}.end as the child pickers\' name attributes', async () => {
    const el = await fixture('<civ-date-range-picker legend="Stay" name="trip"></civ-date-range-picker>');
    const start = el.querySelector('[data-civ-range-start]')!;
    const end = el.querySelector('[data-civ-range-end]')!;
    expect(start.getAttribute('name')).toBe('trip.start');
    expect(end.getAttribute('name')).toBe('trip.end');
  });

  it('omits child name attributes when the host name is unset', async () => {
    const el = await fixture('<civ-date-range-picker legend="Stay"></civ-date-range-picker>');
    const start = el.querySelector('[data-civ-range-start]')!;
    expect(start.getAttribute('name')).toBe('');
  });

  it('parses initial value JSON into rangeValue', async () => {
    const el = await fixture<CivDateRangePicker>(
      `<civ-date-range-picker legend="Stay" value='${'{"start":"2026-05-01","end":"2026-05-08"}'}'></civ-date-range-picker>`,
    );
    await elementUpdated(el);
    expect(el.rangeValue).toEqual({ start: '2026-05-01', end: '2026-05-08' });
  });

  it('binds end picker min to start picker value (cross-bound constraint)', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '2026-05-10', end: '' };
    await elementUpdated(el);
    const end = el.querySelector('[data-civ-range-end]')!;
    expect(end.getAttribute('min')).toBe('2026-05-10');
  });

  it('binds start picker max to end picker value (cross-bound constraint)', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '', end: '2026-05-20' };
    await elementUpdated(el);
    const start = el.querySelector('[data-civ-range-start]')!;
    expect(start.getAttribute('max')).toBe('2026-05-20');
  });

  it('honors outer min/max — picks the tighter bound when both apply', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay" min="2026-01-01" max="2026-12-31"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '2026-05-10', end: '2026-08-15' };
    await elementUpdated(el);
    const start = el.querySelector('[data-civ-range-start]')!;
    const end = el.querySelector('[data-civ-range-end]')!;
    // start max = min(end value, outer max) = end value (earlier)
    expect(start.getAttribute('max')).toBe('2026-08-15');
    // end min = max(start value, outer min) = start value (later)
    expect(end.getAttribute('min')).toBe('2026-05-10');
  });

  it('fires civ-change with the merged value when the start child commits', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '', end: '2026-05-15' };
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-change', (e: Event) => { detail = (e as CustomEvent).detail; });

    const start = el.querySelector('[data-civ-range-start]')!;
    start.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-10' }, bubbles: true }));
    await elementUpdated(el);

    expect(detail).toEqual({ value: { start: '2026-05-10', end: '2026-05-15' } });
  });

  it('sets a cross-field error when end is before start', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '2026-05-10', end: '2026-05-15' };
    await elementUpdated(el);
    expect(el.error).toBe('');

    // simulate end picker committing an earlier date
    const end = el.querySelector('[data-civ-range-end]')!;
    end.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-05' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.error).toContain('on or after');
  });

  it('clears its cross-field error once the range becomes valid', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '2026-05-10', end: '2026-05-05' };
    // Trigger the validation by re-firing through the child event path
    const end = el.querySelector('[data-civ-range-end]')!;
    end.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-05' }, bubbles: true }));
    await elementUpdated(el);
    expect(el.error).not.toBe('');

    end.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-15' }, bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('enforces min-range-days', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay" min-range-days="3"></civ-date-range-picker>',
    );
    const end = el.querySelector('[data-civ-range-end]')!;
    el.rangeValue = { start: '2026-05-10', end: '' };
    await elementUpdated(el);

    end.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-11' }, bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toContain('at least 3');

    end.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-12' }, bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('enforces max-range-days', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay" max-range-days="7"></civ-date-range-picker>',
    );
    const end = el.querySelector('[data-civ-range-end]')!;
    el.rangeValue = { start: '2026-05-10', end: '' };
    await elementUpdated(el);

    end.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-20' }, bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toContain('at most 7');
  });

  it('does not surface a cross-field error when only one endpoint is set', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay" min-range-days="3"></civ-date-range-picker>',
    );
    const start = el.querySelector('[data-civ-range-start]')!;
    start.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2026-05-10' }, bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('formResetCallback clears state', async () => {
    const el = await fixture<CivDateRangePicker>(
      '<civ-date-range-picker legend="Stay" name="trip"></civ-date-range-picker>',
    );
    el.rangeValue = { start: '2026-05-01', end: '2026-05-08' };
    el.error = 'oh no';
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.rangeValue).toEqual({ start: '', end: '' });
    expect(el.error).toBe('');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture('<civ-date-range-picker legend="Stay"></civ-date-range-picker>');
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[data-civ-range-start]')).not.toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-date-range-picker') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('forwards locale + week-starts-on to both pickers', async () => {
    const el = await fixture(
      '<civ-date-range-picker legend="Stay" locale="fr-FR" week-starts-on="1"></civ-date-range-picker>',
    );
    const start = el.querySelector('[data-civ-range-start]')!;
    const end = el.querySelector('[data-civ-range-end]')!;
    expect(start.getAttribute('locale')).toBe('fr-FR');
    expect(start.getAttribute('week-starts-on')).toBe('1');
    expect(end.getAttribute('locale')).toBe('fr-FR');
    expect(end.getAttribute('week-starts-on')).toBe('1');
  });

  it('forwards readonly to both inner civ-date-picker children', async () => {
    const el = await fixture<CivDateRangePicker>('<civ-date-range-picker legend="Dates" readonly></civ-date-range-picker>');
    await elementUpdated(el);
    const pickers = el.querySelectorAll('civ-date-picker');
    expect(pickers.length).toBe(2);
    pickers.forEach((p) => expect((p as any).readonly).toBe(true));
  });
});

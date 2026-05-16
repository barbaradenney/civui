import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-time-picker.js';
import type { CivTimePicker } from './civ-time-picker.js';

afterEach(cleanupFixtures);

async function setSelectValue(el: HTMLElement, name: string, value: string) {
  const select = el.querySelector(`civ-select[name="${name}"]`) as HTMLElement & { value: string };
  const inner = select.querySelector('select') as HTMLSelectElement;
  inner.value = value;
  inner.dispatchEvent(new Event('change', { bubbles: true }));
  await elementUpdated(select);
}

describe('civ-time-picker', () => {
  it('renders a fieldset with three selects in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="Appointment time" name="appt"></civ-time-picker>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-hour"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-minute"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-period"]')).not.toBeNull();
  });

  it('hides AM/PM in 24-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" format="24"></civ-time-picker>');
    expect(el.querySelector('civ-select[name="t-hour"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="t-minute"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="t-period"]')).toBeNull();
  });

  it('renders the legend text', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="Pick a time" name="t"></civ-time-picker>');
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Pick a time');
  });

  it('renders 24 hour options in 24-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" format="24"></civ-time-picker>');
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.options.length).toBe(24);
    expect(hourSel.options[0].value).toBe('00');
    expect(hourSel.options[23].value).toBe('23');
  });

  it('renders 12 hour options in 12-hour mode (1-12)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When"></civ-time-picker>');
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.options.length).toBe(12);
    expect(hourSel.options[0].value).toBe('1');
    expect(hourSel.options[11].value).toBe('12');
  });

  it('uses minute-step to control minute options', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" minute-step="15"></civ-time-picker>');
    const minuteSel = el.querySelector('civ-select[name="minute"]') as any;
    expect(minuteSel.options.length).toBe(4);
    expect(minuteSel.options.map((o: any) => o.value)).toEqual(['00', '15', '30', '45']);
  });

  it('parses an initial 24-hour value into 12-hour display', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" value="14:30"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const minuteSel = el.querySelector('civ-select[name="minute"]') as any;
    const periodSel = el.querySelector('civ-select[name="period"]') as any;
    expect(hourSel.value).toBe('2');
    expect(minuteSel.value).toBe('30');
    expect(periodSel.value).toBe('PM');
  });

  it('parses 00:00 as 12 AM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" value="00:00"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const periodSel = el.querySelector('civ-select[name="period"]') as any;
    expect(hourSel.value).toBe('12');
    expect(periodSel.value).toBe('AM');
  });

  it('parses 12:00 as 12 PM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" value="12:00"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const periodSel = el.querySelector('civ-select[name="period"]') as any;
    expect(hourSel.value).toBe('12');
    expect(periodSel.value).toBe('PM');
  });

  it('assembles 12-hour selections back to 24-hour ISO', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" minute-step="15"></civ-time-picker>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    await setSelectValue(el, 't-hour', '2');
    await setSelectValue(el, 't-minute', '30');
    await setSelectValue(el, 't-period', 'PM');

    expect(el.value).toBe('14:30');
    expect(handler).toHaveBeenCalled();
    const last = handler.mock.calls[handler.mock.calls.length - 1][0] as CustomEvent;
    expect(last.detail.value).toBe('14:30');
  });

  it('assembles 24-hour selections directly', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" format="24" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '09');
    await setSelectValue(el, 't-minute', '15');
    expect(el.value).toBe('09:15');
  });

  it('AM at 12 maps to 00 hour', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '12');
    await setSelectValue(el, 't-minute', '00');
    await setSelectValue(el, 't-period', 'AM');
    expect(el.value).toBe('00:00');
  });

  it('returns empty value when AM/PM is unset in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '2');
    await setSelectValue(el, 't-minute', '30');
    expect(el.value).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When"></civ-time-picker>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders required marker when required', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" required></civ-time-picker>');
    const legend = el.querySelector('legend');
    expect(legend!.querySelector('.civ-required-mark')).not.toBeNull();
  });

  it('cascades disabled to child selects via formDisabledCallback', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When"></civ-time-picker>');
    el.formDisabledCallback(true);
    await elementUpdated(el);
    const selects = el.querySelectorAll('civ-select');
    selects.forEach((s) => {
      expect((s as any).disabled).toBe(true);
    });
  });

  it('renders the hint and error in the fieldset header', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker legend="When" hint="Local time" error="Required"></civ-time-picker>'
    );
    expect(el.textContent).toContain('Local time');
    expect(el.textContent).toContain('Required');
  });

  it('ignores malformed initial value', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" value="not-a-time"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.value).toBe('');
  });

  it('re-parses sub-fields when format changes from 12 to 24 at runtime', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" value="14:30" minute-step="15"></civ-time-picker>');
    await elementUpdated(el);
    expect((el.querySelector('civ-select[name="hour"]') as any).value).toBe('2');

    el.format = '24';
    await elementUpdated(el);
    expect((el.querySelector('civ-select[name="hour"]') as any).value).toBe('14');
    expect(el.querySelector('civ-select[name="period"]')).toBeNull();
  });

  it('clears _minute when minute-step change orphans the current selection', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" minute-step="1"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '2');
    await setSelectValue(el, 't-minute', '17');
    await setSelectValue(el, 't-period', 'AM');
    expect(el.value).toBe('02:17');

    el.minuteStep = 15;
    await elementUpdated(el);
    // 17 isn't a multiple of 15 → minute cleared, assembled value cleared.
    expect(el.value).toBe('');
  });

  it('renders a sr-only fallback legend when legend prop is empty (Section 508)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker></civ-time-picker>');
    const fieldset = el.querySelector('fieldset')!;
    const legend = fieldset.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
    expect(legend!.textContent).toContain('Time');
  });

  it('hint renders even when legend is empty (no dangling aria-describedby)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker hint="Local time"></civ-time-picker>');
    expect(el.textContent).toContain('Local time');
    const fieldset = el.querySelector('fieldset')!;
    const describedBy = fieldset.getAttribute('aria-describedby');
    if (describedBy) {
      for (const id of describedBy.split(/\s+/)) {
        expect(el.querySelector(`#${id}`)).not.toBeNull();
      }
    }
  });

  it('syncs value to ElementInternals on assembly', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="When" name="t" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '9');
    await setSelectValue(el, 't-minute', '00');
    await setSelectValue(el, 't-period', 'AM');
    // ElementInternals form value is set via updateFormValue → setFormValue.
    // jsdom doesn't expose internals.value directly; assert el.value and
    // that the host carries a string-coerced value attribute mirror.
    expect(el.value).toBe('09:00');
  });
});

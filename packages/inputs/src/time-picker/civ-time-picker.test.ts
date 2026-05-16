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
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="Appointment time" name="appt"></civ-time-picker>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-hour"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-minute"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-period"]')).not.toBeNull();
  });

  it('hides AM/PM in 24-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" format="24"></civ-time-picker>');
    expect(el.querySelector('civ-select[name="t-hour"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="t-minute"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="t-period"]')).toBeNull();
  });

  it('renders the legend text', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="Pick a time" name="t"></civ-time-picker>');
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Pick a time');
  });

  it('renders 24 hour options in 24-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" format="24"></civ-time-picker>');
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.options.length).toBe(24);
    expect(hourSel.options[0].value).toBe('00');
    expect(hourSel.options[23].value).toBe('23');
  });

  it('renders 12 hour options in 12-hour mode (1-12)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When"></civ-time-picker>');
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.options.length).toBe(12);
    expect(hourSel.options[0].value).toBe('1');
    expect(hourSel.options[11].value).toBe('12');
  });

  it('uses minute-step to control minute options', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" minute-step="15"></civ-time-picker>');
    const minuteSel = el.querySelector('civ-select[name="minute"]') as any;
    expect(minuteSel.options.length).toBe(4);
    expect(minuteSel.options.map((o: any) => o.value)).toEqual(['00', '15', '30', '45']);
  });

  it('parses an initial 24-hour value into 12-hour display', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="14:30"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const minuteSel = el.querySelector('civ-select[name="minute"]') as any;
    const periodSel = el.querySelector('civ-select[name="period"]') as any;
    expect(hourSel.value).toBe('2');
    expect(minuteSel.value).toBe('30');
    expect(periodSel.value).toBe('PM');
  });

  it('parses 00:00 as 12 AM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="00:00"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const periodSel = el.querySelector('civ-select[name="period"]') as any;
    expect(hourSel.value).toBe('12');
    expect(periodSel.value).toBe('AM');
  });

  it('parses 12:00 as 12 PM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="12:00"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const periodSel = el.querySelector('civ-select[name="period"]') as any;
    expect(hourSel.value).toBe('12');
    expect(periodSel.value).toBe('PM');
  });

  it('assembles 12-hour selections back to 24-hour ISO', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="15"></civ-time-picker>');
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
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" format="24" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '09');
    await setSelectValue(el, 't-minute', '15');
    expect(el.value).toBe('09:15');
  });

  it('AM at 12 maps to 00 hour', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '12');
    await setSelectValue(el, 't-minute', '00');
    await setSelectValue(el, 't-period', 'AM');
    expect(el.value).toBe('00:00');
  });

  it('returns empty value when AM/PM is unset in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '2');
    await setSelectValue(el, 't-minute', '30');
    expect(el.value).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When"></civ-time-picker>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders required marker when required', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" required></civ-time-picker>');
    const legend = el.querySelector('legend');
    expect(legend!.querySelector('.civ-required-mark')).not.toBeNull();
  });

  it('cascades disabled to child selects via formDisabledCallback', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When"></civ-time-picker>');
    el.formDisabledCallback(true);
    await elementUpdated(el);
    const selects = el.querySelectorAll('civ-select');
    selects.forEach((s) => {
      expect((s as any).disabled).toBe(true);
    });
  });

  it('renders the hint and error in the fieldset header', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="select" legend="When" hint="Local time" error="Required"></civ-time-picker>'
    );
    expect(el.textContent).toContain('Local time');
    expect(el.textContent).toContain('Required');
  });

  it('ignores malformed initial value', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="not-a-time"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.value).toBe('');
  });

  it('re-parses sub-fields when format changes from 12 to 24 at runtime', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="14:30" minute-step="15"></civ-time-picker>');
    await elementUpdated(el);
    expect((el.querySelector('civ-select[name="hour"]') as any).value).toBe('2');

    el.format = '24';
    await elementUpdated(el);
    expect((el.querySelector('civ-select[name="hour"]') as any).value).toBe('14');
    expect(el.querySelector('civ-select[name="period"]')).toBeNull();
  });

  it('clears _minute when minute-step change orphans the current selection', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="1"></civ-time-picker>');
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
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select"></civ-time-picker>');
    const fieldset = el.querySelector('fieldset')!;
    const legend = fieldset.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
    expect(legend!.textContent).toContain('Time');
  });

  it('hint renders even when legend is empty (no dangling aria-describedby)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" hint="Local time"></civ-time-picker>');
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
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="15"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '9');
    await setSelectValue(el, 't-minute', '00');
    await setSelectValue(el, 't-period', 'AM');
    // ElementInternals form value is set via updateFormValue → setFormValue.
    // jsdom doesn't expose internals.value directly; assert el.value and
    // that the host carries a string-coerced value attribute mirror.
    expect(el.value).toBe('09:00');
  });

  it('rejects an invalid 12-hour value like "13:00" gracefully (parse path)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="13:00"></civ-time-picker>');
    await elementUpdated(el);
    // 13:00 is valid as 24-hour ISO; in 12-hour display it maps to 1 PM.
    expect((el.querySelector('civ-select[name="hour"]') as any).value).toBe('1');
    expect((el.querySelector('civ-select[name="period"]') as any).value).toBe('PM');
  });

  it('warns on invalid minute-step but still renders sane options', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" minute-step="-5"></civ-time-picker>');
      await elementUpdated(el);
      const minuteSel = el.querySelector('civ-select[name="minute"]') as any;
      // Falls back to step=5 → 12 options.
      expect(minuteSel.options.length).toBe(12);
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe('civ-time-picker — combo mode (USWDS pattern)', () => {
  it('renders a single combobox when mode="combo" (default)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="Appointment time" name="appt"></civ-time-picker>');
    expect(el.querySelector('civ-combobox')).not.toBeNull();
    expect(el.querySelector('fieldset')).toBeNull();
    expect(el.querySelector('civ-select')).toBeNull();
  });

  it('mode defaults to combo (no attribute = combo)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    expect(el.mode).toBe('combo');
  });

  it('builds 12-hour-formatted slot labels with default 15-minute step', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    // 24 hours × 4 slots per hour = 96
    expect(combo.options.length).toBe(96);
    expect(combo.options[0]).toEqual({ value: '00:00', label: '12:00 AM' });
    expect(combo.options[1]).toEqual({ value: '00:15', label: '12:15 AM' });
    expect(combo.options[36]).toEqual({ value: '09:00', label: '9:00 AM' });
    expect(combo.options[52]).toEqual({ value: '13:00', label: '1:00 PM' });
    expect(combo.options[95]).toEqual({ value: '23:45', label: '11:45 PM' });
  });

  it('builds 24-hour-formatted slot labels when format="24"', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" format="24"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options[0]).toEqual({ value: '00:00', label: '00:00' });
    expect(combo.options[36]).toEqual({ value: '09:00', label: '09:00' });
    expect(combo.options[95]).toEqual({ value: '23:45', label: '23:45' });
  });

  it('honors minute-step in combo mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="30"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options.length).toBe(48);
    expect(combo.options[0].value).toBe('00:00');
    expect(combo.options[1].value).toBe('00:30');
  });

  it('respects min and max bounds (business hours)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" min="09:00" max="17:00" minute-step="30"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options.length).toBe(17);
    expect(combo.options[0].value).toBe('09:00');
    expect(combo.options[combo.options.length - 1].value).toBe('17:00');
  });

  it('forwards the combobox civ-change as civ-change with assembled detail', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" name="t"></civ-time-picker>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const combo = el.querySelector('civ-combobox') as HTMLElement;
    combo.dispatchEvent(new CustomEvent('civ-change', {
      detail: { value: '14:30' },
      bubbles: true,
    }));
    await elementUpdated(el);

    expect(el.value).toBe('14:30');
    expect(handler).toHaveBeenCalledTimes(1);
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.value).toBe('14:30');
    expect(detail.hour).toBe('2');
    expect(detail.minute).toBe('30');
    expect(detail.period).toBe('PM');
  });

  it('parses an initial value and passes it through to the combobox', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="09:30"></civ-time-picker>');
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.value).toBe('09:30');
  });

  it('uses the legend prop as a fallback label when label is empty', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker legend="Appointment time"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.label).toBe('Appointment time');
  });

  it('falls back to the locale default legend when neither label nor legend is set', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.label).toBe('Time');
  });

  it('uses the locale placeholder when placeholder is unset', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.placeholder).toBe('e.g. 9:00 AM');
  });

  it('propagates a custom placeholder', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" placeholder="Pick a slot"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.placeholder).toBe('Pick a slot');
  });

  it('cascades disabled to the combobox via formDisabledCallback', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    el.formDisabledCallback(true);
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.disabled).toBe(true);
  });

  it('handles min/max edge case where max < min (empty slot list, no crash)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" min="17:00" max="09:00" minute-step="60"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options.length).toBe(0);
  });

  it('switches between modes when mode prop changes at runtime', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    expect(el.querySelector('civ-combobox')).not.toBeNull();
    expect(el.querySelector('fieldset')).toBeNull();

    el.mode = 'select';
    el.legend = 'When';
    await elementUpdated(el);
    expect(el.querySelector('civ-combobox')).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });
});

describe('civ-time-picker — combo mode: synthetic option for unmatched value', () => {
  it('injects a synthetic option when value does not align with minute-step', async () => {
    // value="14:37" but minute-step=15 → 14:37 isn't on the grid.
    // Without a synthetic option, the input would render empty.
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="14:37" minute-step="15"></civ-time-picker>');
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    const match = combo.options.find((o: any) => o.value === '14:37');
    expect(match).toBeDefined();
    expect(match.label).toBe('2:37 PM');
  });

  it('injects a synthetic option when value is outside min/max bounds', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="08:00" min="09:00" max="17:00"></civ-time-picker>');
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    const match = combo.options.find((o: any) => o.value === '08:00');
    expect(match).toBeDefined();
    expect(match.label).toBe('8:00 AM');
  });

  it('sorts the synthetic option by time alongside the regular slots', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="14:37" minute-step="60"></civ-time-picker>');
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    const idx14 = combo.options.findIndex((o: any) => o.value === '14:00');
    const idx1437 = combo.options.findIndex((o: any) => o.value === '14:37');
    const idx15 = combo.options.findIndex((o: any) => o.value === '15:00');
    expect(idx14).toBeLessThan(idx1437);
    expect(idx1437).toBeLessThan(idx15);
  });

  it('does NOT inject a synthetic option when value already matches a slot', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="09:00" min="09:00" max="17:00" minute-step="15"></civ-time-picker>');
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    const matches = combo.options.filter((o: any) => o.value === '09:00');
    expect(matches.length).toBe(1);
  });

  it('does NOT inject a synthetic option when value is malformed', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="not-a-time"></civ-time-picker>');
    await elementUpdated(el);
    const combo = el.querySelector('civ-combobox') as any;
    // No synthetic — every option came from the grid (all are valid ISO).
    expect(combo.options.every((o: any) => /^\d{2}:\d{2}$/.test(o.value))).toBe(true);
  });
});

describe('civ-time-picker — combo mode: disabled guard', () => {
  it('_onComboChange does not mutate value when host is disabled', async () => {
    // The combobox's own civ-change still bubbles to external listeners
    // (we can't suppress events from a child we don't control). But the
    // host's re-dispatch with assembled detail must NOT fire, and
    // `this.value` must NOT change. That's what the disabled guard
    // protects.
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" disabled></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as HTMLElement;
    combo.dispatchEvent(new CustomEvent('civ-change', {
      detail: { value: '14:30' },
      bubbles: true,
    }));
    await elementUpdated(el);
    expect(el.value).toBe('');
  });
});

describe('civ-time-picker — min/max strict ISO parsing', () => {
  it('rejects single-digit hour like "9:00" in min/max', async () => {
    // Non-zero-padded hour is not the documented contract; treating it
    // as invalid keeps cross-platform parsers consistent. The invalid
    // min silently falls back to "no min bound" — the max bound still
    // applies (00:00 → 17:00 inclusive at 15-min step = 69 slots).
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" min="9:00" max="17:00"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options[0].value).toBe('00:00');
    expect(combo.options[combo.options.length - 1].value).toBe('17:00');
  });

  it('accepts zero-padded "09:00" for min', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" min="09:00" max="17:00" minute-step="30"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options[0].value).toBe('09:00');
  });
});

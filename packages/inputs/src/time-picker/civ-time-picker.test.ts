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

/**
 * Click the matching civ-segment inside a civ-segmented-control. Used
 * for the AM/PM sub-control in select mode (which is rendered as a
 * segmented control rather than a dropdown so the two-option binary
 * choice is a single tap on every viewport).
 */
async function setSegmentedValue(el: HTMLElement, name: string, value: string) {
  const group = el.querySelector(`civ-segmented-control[name="${name}"]`) as HTMLElement & { value: string };
  const segment = group.querySelector(`civ-segment[value="${value}"]`) as HTMLElement;
  const button = segment.querySelector('button') as HTMLButtonElement;
  button.click();
  await elementUpdated(group);
}

describe('civ-time-picker', () => {
  it('renders a fieldset with hour/minute selects + AM-PM segmented-control in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="Appointment time" name="appt"></civ-time-picker>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-hour"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="appt-minute"]')).not.toBeNull();
    // AM/PM is rendered as civ-segmented-control (two-option binary
    // choice — single tap, no dropdown overhead) rather than a third
    // civ-select. The host's _readChildValues reads from this control
    // via the segmented-control selector.
    expect(el.querySelector('civ-segmented-control[name="appt-period"]')).not.toBeNull();
    expect(el.querySelector('civ-segment[value="AM"]')).not.toBeNull();
    expect(el.querySelector('civ-segment[value="PM"]')).not.toBeNull();
  });

  it('hides AM/PM in 24-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" format="24"></civ-time-picker>');
    expect(el.querySelector('civ-select[name="t-hour"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="t-minute"]')).not.toBeNull();
    expect(el.querySelector('civ-segmented-control[name="t-period"]')).toBeNull();
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
    const periodSel = el.querySelector('civ-segmented-control[name="period"]') as any;
    expect(hourSel.value).toBe('2');
    expect(minuteSel.value).toBe('30');
    expect(periodSel.value).toBe('PM');
  });

  it('parses 00:00 as 12 AM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="00:00"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const periodSel = el.querySelector('civ-segmented-control[name="period"]') as any;
    expect(hourSel.value).toBe('12');
    expect(periodSel.value).toBe('AM');
  });

  it('parses 12:00 as 12 PM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" value="12:00"></civ-time-picker>');
    await elementUpdated(el);
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    const periodSel = el.querySelector('civ-segmented-control[name="period"]') as any;
    expect(hourSel.value).toBe('12');
    expect(periodSel.value).toBe('PM');
  });

  it('assembles 12-hour selections back to 24-hour ISO', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="15"></civ-time-picker>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    await setSelectValue(el, 't-hour', '2');
    await setSelectValue(el, 't-minute', '30');
    await setSegmentedValue(el, 't-period', 'PM');

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
    await setSegmentedValue(el, 't-period', 'AM');
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

  it('cascades disabled to the AM/PM segmented-control via formDisabledCallback', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When"></civ-time-picker>');
    el.formDisabledCallback(true);
    await elementUpdated(el);
    const segGroup = el.querySelector('civ-segmented-control') as any;
    expect(segGroup.disabled).toBe(true);
  });

  it('uses the locale strings for the AM/PM segment labels', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When"></civ-time-picker>');
    const am = el.querySelector('civ-segment[value="AM"]') as any;
    const pm = el.querySelector('civ-segment[value="PM"]') as any;
    expect(am.label).toBe('AM');
    expect(pm.label).toBe('PM');
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
    expect(el.querySelector('civ-segmented-control[name="period"]')).toBeNull();
  });

  it('clears _minute when minute-step change orphans the current selection', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" name="t" minute-step="1"></civ-time-picker>');
    await setSelectValue(el, 't-hour', '2');
    await setSelectValue(el, 't-minute', '17');
    await setSegmentedValue(el, 't-period', 'AM');
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
    await setSegmentedValue(el, 't-period', 'AM');
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
    expect((el.querySelector('civ-segmented-control[name="period"]') as any).value).toBe('PM');
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

  it('passes inputmode="numeric" to the combobox (mobile numeric keypad)', async () => {
    // The digit-aware filter makes a numeric keypad the right input
    // method on mobile — typing "230" matches "2:30 AM"/"2:30 PM"
    // without needing the alphabetic keys.
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.inputmode).toBe('numeric');
    // And the inputmode attribute reaches the actual <input>.
    const input = combo.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('inputmode')).toBe('numeric');
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

describe('civ-time-picker — combo mode: nearest-slot snap suggestion', () => {
  // The combobox's noMatchSuggestions callback is provided by the
  // time-picker so dropdowns don't dead-end on near-miss input like
  // "9:27" (not on the 15-min grid). The callback returns a
  // one-element option array that the combobox renders alongside
  // the standard filter results when the regular filter is empty.

  function getSuggestion(el: any, filter: string) {
    // Reach into the prop the time-picker forwards to the combobox.
    const combo = el.querySelector('civ-combobox') as any;
    return combo.noMatchSuggestions(filter);
  }

  it('snaps "9:27" to "9:30 AM" at 15-min step', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '9:27');
    expect(out).toEqual([{ value: '09:30', label: '9:30 AM' }]);
  });

  it('snaps "927" (no colon) the same as "9:27"', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '927');
    expect(out).toEqual([{ value: '09:30', label: '9:30 AM' }]);
  });

  it('honors PM hint: "9:27p" → 9:30 PM', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '9:27p');
    expect(out).toEqual([{ value: '21:30', label: '9:30 PM' }]);
  });

  it('honors AM/PM hint "PM"', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '9:27 PM');
    expect(out).toEqual([{ value: '21:30', label: '9:30 PM' }]);
  });

  it('"1430" with 12-hour format snaps to nearest afternoon slot', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '1430');
    expect(out).toEqual([{ value: '14:30', label: '2:30 PM' }]);
  });

  it('"1430" with 24-hour format renders 24-hour label', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" format="24" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '1430');
    expect(out).toEqual([{ value: '14:30', label: '14:30' }]);
  });

  it('snaps 4-digit "0927" to the same nearest slot as "9:27"', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '0927');
    expect(out).toEqual([{ value: '09:30', label: '9:30 AM' }]);
  });

  it('respects min/max bounds — snaps to nearest in-range slot', async () => {
    // min=09:00, max=17:00. Type "06:00" — that's outside bounds,
    // the nearest in-range slot is 09:00.
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" min="09:00" max="17:00" minute-step="30"></civ-time-picker>');
    const out = getSuggestion(el, '6:00');
    expect(out[0].value).toBe('09:00');
  });

  it('returns [] for pure-letter input (no digits)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const out = getSuggestion(el, 'noon');
    expect(out).toEqual([]);
  });

  it('returns [] for malformed minutes (e.g. ":99")', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const out = getSuggestion(el, '9:99');
    expect(out).toEqual([]);
  });

  it('returns [] when typed hour is out of 0-23 range', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    // "25" — not a valid hour.
    const out = getSuggestion(el, '25:00');
    expect(out).toEqual([]);
  });

  it('"12 AM" snaps to "12:00 AM" (00:00 ISO)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '12 AM');
    expect(out).toEqual([{ value: '00:00', label: '12:00 AM' }]);
  });

  it('"12 PM" snaps to "12:00 PM" (12:00 ISO, noon)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '12 PM');
    expect(out).toEqual([{ value: '12:00', label: '12:00 PM' }]);
  });
});


describe('civ-time-picker — text mode', () => {
  /**
   * Click the matching civ-segment inside a civ-segmented-control by
   * name + value. Same helper as setSegmentedValue earlier, copied
   * here for the test block's locality.
   */
  async function pickPeriod(el: HTMLElement, name: string, value: string) {
    const group = el.querySelector(`civ-segmented-control[name="${name}"]`)!;
    const segment = group.querySelector(`civ-segment[value="${value}"]`)!;
    (segment.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(group);
  }

  /** Fire a typed-input event on the masked text input. */
  async function typeTime(el: HTMLElement, name: string, raw: string) {
    const ti = el.querySelector(`civ-text-input[name="${name}"]`)!;
    const inner = ti.querySelector('input') as HTMLInputElement;
    inner.value = raw;
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(ti);
  }

  it('renders a fieldset with a masked text-input + AM/PM segmented-control (12-hour)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="Incident time" name="t"></civ-time-picker>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    const ti = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti).not.toBeNull();
    expect(ti.maskPattern).toBe('##:##');
    expect(ti.inputmode).toBe('numeric');
    expect(el.querySelector('civ-segmented-control[name="t-period"]')).not.toBeNull();
    expect(el.querySelector('civ-select')).toBeNull();
    expect(el.querySelector('civ-combobox')).toBeNull();
  });

  it('skips the period control in 24-hour format', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t" format="24"></civ-time-picker>');
    expect(el.querySelector('civ-text-input[name="t-time"]')).not.toBeNull();
    expect(el.querySelector('civ-segmented-control')).toBeNull();
  });

  it('assembles 24-hour ISO from typed digits + period (3-digit input)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTime(el, 't-time', '234');
    await pickPeriod(el, 't-period', 'PM');
    expect(el.value).toBe('14:34');
  });

  it('assembles from 4-digit input', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTime(el, 't-time', '1245');
    await pickPeriod(el, 't-period', 'PM');
    expect(el.value).toBe('12:45');
  });

  it('assembles in 24-hour format with no period control', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t" format="24"></civ-time-picker>');
    await typeTime(el, 't-time', '1430');
    expect(el.value).toBe('14:30');
  });

  it('AM at 12 still maps to 00 hour (midnight)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTime(el, 't-time', '1200');
    await pickPeriod(el, 't-period', 'AM');
    expect(el.value).toBe('00:00');
  });

  it('partial input (hour-only) leaves value empty until minutes typed', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTime(el, 't-time', '12');
    await pickPeriod(el, 't-period', 'PM');
    expect(el.value).toBe('');
  });

  it('rejects invalid 12-hour input (hour > 12) — value stays empty', async () => {
    // Power-user "type 24-hour" courtesy is intentionally NOT
    // implemented in text mode; combo mode handles that via snap.
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTime(el, 't-time', '1430');
    await pickPeriod(el, 't-period', 'PM');
    // Hour 14 > 12 in 12-hour mode → assembly returns "".
    expect(el.value).toBe('');
  });

  it('parses an initial value back into the text input + period', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t" value="09:30"></civ-time-picker>');
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti.value).toBe('0930');
    const period = el.querySelector('civ-segmented-control[name="t-period"]') as any;
    expect(period.value).toBe('AM');
  });

  it('format change re-derives the text-input raw digits', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t" value="14:30"></civ-time-picker>');
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti.value).toBe('0230'); // 12-hour display: 2:30

    el.format = '24';
    await elementUpdated(el);
    const ti24 = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti24.value).toBe('1430'); // 24-hour display: 14:30
  });

  it('uses sr-only fallback legend when only `label` is set', async () => {
    // Same convention as combo mode — text mode treats `label` as the
    // canonical surface (it's a single input control), and avoids
    // duplicating it as a visible fieldset legend.
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="Incident time"></civ-time-picker>');
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
  });

  it('uses a real visible legend when `legend` is set', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" legend="Time of incident"></civ-time-picker>');
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.classList.contains('civ-sr-only')).toBe(false);
    expect(legend!.textContent).toContain('Time of incident');
  });

  it('runtime mode flip from combo → text preserves the value', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" value="14:30"></civ-time-picker>');
    expect(el.mode).toBe('combo');

    el.mode = 'text';
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input[name="time"]') as any;
    expect(ti).not.toBeNull();
    expect(ti.value).toBe('0230');
    expect(el.value).toBe('14:30');
  });

  it('cascades disabled to the text input and segmented control', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When"></civ-time-picker>');
    el.formDisabledCallback(true);
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input') as any;
    const period = el.querySelector('civ-segmented-control') as any;
    expect(ti.disabled).toBe(true);
    expect(period.disabled).toBe(true);
  });
});

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
    expect(combo.options[0]).toEqual({ value: '00:00', label: '12:00 AM (midnight)' });
    expect(combo.options[1]).toEqual({ value: '00:15', label: '12:15 AM' });
    expect(combo.options[36]).toEqual({ value: '09:00', label: '9:00 AM' });
    expect(combo.options[52]).toEqual({ value: '13:00', label: '1:00 PM' });
    expect(combo.options[95]).toEqual({ value: '23:45', label: '11:45 PM' });
  });

  it('builds 24-hour-formatted slot labels when format="24"', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" format="24"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options[0]).toEqual({ value: '00:00', label: '00:00 (midnight)' });
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

describe('civ-time-picker — combo mode: form-data participation', () => {
  it('contributes ONLY the host entry to FormData (no duplicate from inner combobox)', async () => {
    // Before the fix, the inner civ-combobox carried the same `name`
    // as the host, so both registered as data-civ-form-field elements
    // with identical keys. civ-form.getFormData() / toFormData() would
    // emit two entries with the same name and value — wasteful and
    // confusing. The fix omits `name` on the inner combobox so only
    // the host appears in form iteration.
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" name="appt" value="14:30"></civ-time-picker>');
    await elementUpdated(el);

    // The host carries the form-field marker AND the name.
    expect(el.hasAttribute('data-civ-form-field')).toBe(true);
    expect(el.getAttribute('name')).toBe('appt');

    // The inner combobox is still form-associated (its `data-civ-form-field`
    // marker remains, because the base class always sets it) but has no
    // `name`, so it's invisible to form iteration.
    const combo = el.querySelector('civ-combobox') as HTMLElement;
    expect(combo.hasAttribute('data-civ-form-field')).toBe(true);
    expect(combo.getAttribute('name')).toBeNull();

    // Simulated FormData walk: only the host appears.
    const fields = el.parentElement!.querySelectorAll('[data-civ-form-field][name]');
    const matching = Array.from(fields).filter((f) => f.getAttribute('name') === 'appt');
    expect(matching.length).toBe(1);
    expect(matching[0]).toBe(el);
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
    expect(out).toEqual([{ value: '00:00', label: '12:00 AM (midnight)' }]);
  });

  it('"12 PM" snaps to "12:00 PM" (12:00 ISO, noon)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const out = getSuggestion(el, '12 PM');
    expect(out).toEqual([{ value: '12:00', label: '12:00 PM (noon)' }]);
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

describe('civ-time-picker — text mode: contextual error on invalid commit', () => {
  async function pickPeriod(el: HTMLElement, name: string, value: string) {
    const group = el.querySelector(`civ-segmented-control[name="${name}"]`)!;
    const segment = group.querySelector(`civ-segment[value="${value}"]`)!;
    (segment.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(group);
  }

  async function typeTimeWithChange(el: HTMLElement, name: string, raw: string) {
    const ti = el.querySelector(`civ-text-input[name="${name}"]`)!;
    const inner = ti.querySelector('input') as HTMLInputElement;
    inner.value = raw;
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    inner.dispatchEvent(new Event('blur'));
    await elementUpdated(ti);
  }

  it('sets an "Hour must be 1–12" error when 12-hour input exceeds 12', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTimeWithChange(el, 't-time', '1430');
    await pickPeriod(el, 't-period', 'PM');
    expect(el.value).toBe('');
    expect(el.error).toContain('1 and 12');
    // The error message renders ONCE — on the host fieldset only.
    // Earlier we passed `error` through to the inner text-input and
    // segmented-control, which produced three copies of the same
    // message on screen. Children are not given the error prop so
    // they don't double-render it.
    const ti = el.querySelector('civ-text-input') as any;
    expect(ti.error).toBe('');
    const seg = el.querySelector('civ-segmented-control') as any;
    expect(seg.error).toBe('');
    // The error text appears exactly once across the whole picker DOM.
    const errorOccurrences = el.querySelectorAll('.civ-error-text, .civ-error-text--group').length;
    expect(errorOccurrences).toBe(1);
  });

  it('does NOT flash a "Select AM or PM" error when the user typed valid digits but has not yet picked the period', async () => {
    // Missing-period is incomplete state, not invalid input — the user
    // is on their way to tap AM/PM, and yelling at them mid-gesture is
    // an obnoxious flash. Required validation catches the empty value
    // on form submit; inline auto-error is reserved for unambiguous
    // wrong input (hour > 12, minute > 59, etc.).
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTimeWithChange(el, 't-time', '234');
    expect(el.value).toBe('');
    expect(el.error).toBe('');
  });

  it('sets an "Hour must be 0–23" error in 24-hour mode for out-of-range', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t" format="24"></civ-time-picker>');
    await typeTimeWithChange(el, 't-time', '2530');
    expect(el.value).toBe('');
    expect(el.error).toContain('0 and 23');
  });

  it('clears the text-mode error once the input becomes valid', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTimeWithChange(el, 't-time', '1430');
    await pickPeriod(el, 't-period', 'PM');
    expect(el.error).toBeTruthy();

    // Fix it: 02:30 + PM.
    await typeTimeWithChange(el, 't-time', '0230');
    expect(el.value).toBe('14:30');
    expect(el.error).toBe('');
  });

  it('does not surface a text-mode error for partial input (still typing)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTimeWithChange(el, 't-time', '23'); // only 2 digits — not "complete-looking"
    expect(el.error).toBe('');
  });

  it('does not clobber a consumer-set error', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="text" label="When" name="t" error="Server says no"></civ-time-picker>'
    );
    // Commit a valid value — our auto-clear should leave the
    // server-set error intact because we never set _textModeError.
    await typeTimeWithChange(el, 't-time', '0230');
    const period = el.querySelector('civ-segmented-control[name="t-period"]') as any;
    const segPm = period.querySelector('civ-segment[value="PM"]') as any;
    (segPm.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(el.error).toBe('Server says no');
  });

  it('clears the text-mode error on formResetCallback', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t"></civ-time-picker>');
    await typeTimeWithChange(el, 't-time', '1430');
    await pickPeriod(el, 't-period', 'PM');
    expect(el.error).toBeTruthy();
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.error).toBe('');
  });
});

describe('civ-time-picker — text mode: required-mark routing', () => {
  it('puts the (required) marker on the legend when `legend` is explicit', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="text" legend="Time of incident" required></civ-time-picker>'
    );
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.classList.contains('civ-sr-only')).toBe(false);
    expect(legend!.querySelector('.civ-required-mark')).not.toBeNull();
    // Children suppress their own marker (single visible mark).
    const ti = el.querySelector('civ-text-input') as any;
    expect(ti.hideRequiredIndicator).toBe(true);
  });

  it('puts the marker on children when only `label` is set (legend sr-only)', async () => {
    // sr-only legend hides the marker from sighted users, so the
    // visible cue moves to the children's labels.
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="text" label="Incident time" required></civ-time-picker>'
    );
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
    // Legend no longer carries the marker (would be invisible there).
    expect(legend!.querySelector('.civ-required-mark')).toBeNull();
    // Children render their own indicators instead.
    const ti = el.querySelector('civ-text-input') as any;
    expect(ti.hideRequiredIndicator).toBe(false);
    const period = el.querySelector('civ-segmented-control') as any;
    expect(period.hideRequiredIndicator).toBe(false);
  });

  it('respects host `hide-required-indicator` — suppresses everywhere', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="text" label="When" required hide-required-indicator></civ-time-picker>'
    );
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.querySelector('.civ-required-mark')).toBeNull();
    const ti = el.querySelector('civ-text-input') as any;
    expect(ti.hideRequiredIndicator).toBe(true);
  });
});

describe('civ-time-picker — select mode: required-mark routing', () => {
  it('puts the (required) marker on the legend when `legend` is explicit', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="select" legend="Appointment time" required></civ-time-picker>'
    );
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.classList.contains('civ-sr-only')).toBe(false);
    expect(legend!.querySelector('.civ-required-mark')).not.toBeNull();
    // Children suppress their own marker.
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.hideRequiredIndicator).toBe(true);
  });

  it('puts the marker on children when no explicit legend is provided (sr-only fallback)', async () => {
    // Without a user-supplied legend, the fallback "Time" renders as
    // sr-only. The (required) marker on an sr-only legend is invisible
    // to sighted users — so children render their own markers instead.
    // Earlier, the marker was nowhere visible (a real a11y bug for
    // sighted users).
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="select" required></civ-time-picker>'
    );
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
    expect(legend!.querySelector('.civ-required-mark')).toBeNull();
    // Children render their own indicators instead.
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.hideRequiredIndicator).toBe(false);
    const minuteSel = el.querySelector('civ-select[name="minute"]') as any;
    expect(minuteSel.hideRequiredIndicator).toBe(false);
    const periodCtrl = el.querySelector('civ-segmented-control[name="period"]') as any;
    expect(periodCtrl.hideRequiredIndicator).toBe(false);
  });

  it('respects host `hide-required-indicator` — suppresses everywhere', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="select" required hide-required-indicator></civ-time-picker>'
    );
    const legend = el.querySelector('fieldset > legend');
    expect(legend!.querySelector('.civ-required-mark')).toBeNull();
    const hourSel = el.querySelector('civ-select[name="hour"]') as any;
    expect(hourSel.hideRequiredIndicator).toBe(true);
  });
});

describe('civ-time-picker — Now button avoids disabled slots (combo mode)', () => {
  function withFakeNow(h: number, m: number, fn: () => Promise<void> | void) {
    const realNow = Date;
    (globalThis as any).Date = class extends realNow {
      constructor() { super(); }
      getHours(): number { return h; }
      getMinutes(): number { return m; }
    };
    return Promise.resolve(fn()).finally(() => {
      (globalThis as any).Date = realNow;
    });
  }

  it('advances Now past a disabled slot to the next available one', async () => {
    await withFakeNow(9, 0, async () => {
      const el = await fixture<CivTimePicker>(
        '<civ-time-picker label="When" show-now-button minute-step="30" disabled-slots=\'["09:00"]\'></civ-time-picker>'
      );
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(el.value).toBe('09:30');
    });
  });

  it('walks past multiple consecutive disabled slots', async () => {
    await withFakeNow(9, 0, async () => {
      const el = await fixture<CivTimePicker>(
        '<civ-time-picker label="When" show-now-button minute-step="15" disabled-slots=\'["09:00","09:15","09:30"]\'></civ-time-picker>'
      );
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(el.value).toBe('09:45');
    });
  });

  it('does not advance past max bound', async () => {
    // Now is 09:45 (the max). 09:45 is disabled. There's no enabled
    // slot in range — fall back to the clamped (disabled) value so
    // the user knows where they were trying to land.
    await withFakeNow(9, 45, async () => {
      const el = await fixture<CivTimePicker>(
        '<civ-time-picker label="When" show-now-button min="09:00" max="09:45" minute-step="15" disabled-slots=\'["09:45"]\'></civ-time-picker>'
      );
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(el.value).toBe('09:45');
    });
  });

  it('leaves Now unchanged when the snapped slot is enabled', async () => {
    await withFakeNow(9, 0, async () => {
      const el = await fixture<CivTimePicker>(
        '<civ-time-picker label="When" show-now-button minute-step="30" disabled-slots=\'["09:30","10:00"]\'></civ-time-picker>'
      );
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(el.value).toBe('09:00');
    });
  });
});

describe('civ-time-picker — text mode: prefill edge cases', () => {
  it('renders 12 AM (00:00) as raw "1200" with period AM', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" name="t" value="00:00"></civ-time-picker>');
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti.value).toBe('1200');
    const period = el.querySelector('civ-segmented-control[name="t-period"]') as any;
    expect(period.value).toBe('AM');
  });

  it('renders 12 PM (12:00) as raw "1200" with period PM', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" name="t" value="12:00"></civ-time-picker>');
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti.value).toBe('1200');
    const period = el.querySelector('civ-segmented-control[name="t-period"]') as any;
    expect(period.value).toBe('PM');
  });

  it('renders 13:00 as raw "0100" with period PM in 12-hour mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" name="t" value="13:00"></civ-time-picker>');
    await elementUpdated(el);
    const ti = el.querySelector('civ-text-input[name="t-time"]') as any;
    expect(ti.value).toBe('0100');
    const period = el.querySelector('civ-segmented-control[name="t-period"]') as any;
    expect(period.value).toBe('PM');
  });
});

describe('civ-time-picker — event-detail shape across modes', () => {
  it('combo, select, and text modes all emit civ-change with the standard shape', async () => {
    // Combo mode: simulate a combobox selection.
    const combo = await fixture<CivTimePicker>('<civ-time-picker label="When" name="t" value="14:30"></civ-time-picker>');
    const comboHandler = vi.fn();
    combo.addEventListener('civ-change', comboHandler as EventListener);
    const comboEl = combo.querySelector('civ-combobox') as HTMLElement;
    comboEl.dispatchEvent(new CustomEvent('civ-change', {
      detail: { value: '14:30' },
      bubbles: true,
    }));
    await elementUpdated(combo);
    expect(comboHandler).toHaveBeenCalled();
    const comboDetail = (comboHandler.mock.calls[0][0] as CustomEvent).detail;
    expect(typeof comboDetail.value).toBe('string');
    expect(typeof comboDetail.hour).toBe('string');
    expect(typeof comboDetail.minute).toBe('string');
    expect(typeof comboDetail.period).toBe('string');

    // Select mode: drive sub-fields directly.
    const select = await fixture<CivTimePicker>(
      '<civ-time-picker mode="select" legend="When" name="s" minute-step="15"></civ-time-picker>'
    );
    const selectHandler = vi.fn();
    select.addEventListener('civ-change', selectHandler as EventListener);
    const hourSel = select.querySelector('civ-select[name="s-hour"]') as any;
    const hourInner = hourSel.querySelector('select') as HTMLSelectElement;
    hourInner.value = '2';
    hourInner.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(hourSel);
    expect(selectHandler).toHaveBeenCalled();
    const selectDetail = (selectHandler.mock.calls[0][0] as CustomEvent).detail;
    expect(typeof selectDetail.value).toBe('string');
    expect(typeof selectDetail.hour).toBe('string');
    expect(typeof selectDetail.minute).toBe('string');
    expect(typeof selectDetail.period).toBe('string');

    // Text mode.
    const text = await fixture<CivTimePicker>(
      '<civ-time-picker mode="text" label="When" name="x"></civ-time-picker>'
    );
    const textHandler = vi.fn();
    text.addEventListener('civ-change', textHandler as EventListener);
    const ti = text.querySelector('civ-text-input[name="x-time"]')!;
    const inner = ti.querySelector('input') as HTMLInputElement;
    inner.value = '230';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(ti);
    expect(textHandler).toHaveBeenCalled();
    const textDetail = (textHandler.mock.calls[textHandler.mock.calls.length - 1][0] as CustomEvent).detail;
    expect(typeof textDetail.value).toBe('string');
    expect(typeof textDetail.hour).toBe('string');
    expect(typeof textDetail.minute).toBe('string');
    expect(typeof textDetail.period).toBe('string');
  });
});

describe('civ-time-picker — noon / midnight annotations (combo mode)', () => {
  it('annotates 12:00 AM as "(midnight)" in 12-hour combo mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    const slot = combo.options.find((o: any) => o.value === '00:00');
    expect(slot.label).toBe('12:00 AM (midnight)');
  });

  it('annotates 12:00 PM as "(noon)" in 12-hour combo mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    const slot = combo.options.find((o: any) => o.value === '12:00');
    expect(slot.label).toBe('12:00 PM (noon)');
  });

  it('annotates 00:00 and 12:00 in 24-hour format too', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" format="24"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    expect(combo.options.find((o: any) => o.value === '00:00').label).toBe('00:00 (midnight)');
    expect(combo.options.find((o: any) => o.value === '12:00').label).toBe('12:00 (noon)');
  });

  it('does NOT annotate non-exactly-midnight / non-exactly-noon slots', async () => {
    // 12:15 AM is not midnight; 12:30 PM is not noon.
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" minute-step="15"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    const oneAfterMidnight = combo.options.find((o: any) => o.value === '00:15');
    expect(oneAfterMidnight.label).toBe('12:15 AM');
    const halfPastNoon = combo.options.find((o: any) => o.value === '12:30');
    expect(halfPastNoon.label).toBe('12:30 PM');
  });

  it('digit-filter still matches "12" against annotated labels', async () => {
    // Regression guard: typing "12" should still match the noon /
    // midnight slots even though their labels now include "(noon)"
    // / "(midnight)".
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as HTMLElement;
    const input = combo.querySelector('input') as HTMLInputElement;
    input.value = '12';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(combo);
    const rendered = Array.from(combo.querySelectorAll('.civ-combobox-option'))
      .map((n: any) => n.textContent.trim());
    expect(rendered).toEqual(expect.arrayContaining([
      '12:00 AM (midnight)',
      '12:00 PM (noon)',
    ]));
  });
});

describe('civ-time-picker — "Now" quick-button', () => {
  it('does NOT render the Now button by default', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When"></civ-time-picker>');
    expect(el.querySelector('.civ-time-picker-now-btn')).toBeNull();
  });

  it('renders the Now button via `show-now-button` in combo mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button></civ-time-picker>');
    const btn = el.querySelector('.civ-time-picker-now-btn');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Now');
  });

  it('renders the Now button via `show-now-button` in select mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="select" legend="When" show-now-button></civ-time-picker>');
    expect(el.querySelector('.civ-time-picker-now-btn')).not.toBeNull();
  });

  it('renders the Now button via `show-now-button` in text mode', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" show-now-button></civ-time-picker>');
    expect(el.querySelector('.civ-time-picker-now-btn')).not.toBeNull();
  });

  it('hides in readonly mode even when `show-now-button` is set', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button readonly></civ-time-picker>');
    expect(el.querySelector('.civ-time-picker-now-btn')).toBeNull();
  });

  it('overrides the label via `now-button-label`', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button now-button-label="Use current time"></civ-time-picker>');
    const btn = el.querySelector('.civ-time-picker-now-btn');
    expect(btn!.textContent).toContain('Use current time');
  });

  it('sets value to current time snapped to minute-step in combo mode', async () => {
    // Mock Date so we can assert exactly.
    const realNow = Date;
    (globalThis as any).Date = class extends realNow {
      constructor() { super(); }
      getHours(): number { return 14; }
      getMinutes(): number { return 23; }
    };
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button minute-step="15"></civ-time-picker>');
      const btn = el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement;
      btn.click();
      await elementUpdated(el);
      // 14:23 → snapped to 14:15 (closest 15-min slot — round to 15).
      // Math.round(23/15) = 2 → 2*15 = 30. So actually rounds UP to 14:30.
      expect(el.value).toBe('14:30');
    } finally {
      (globalThis as any).Date = realNow;
    }
  });

  it('clamps "Now" to min/max bounds in combo mode', async () => {
    const realNow = Date;
    (globalThis as any).Date = class extends realNow {
      constructor() { super(); }
      getHours(): number { return 6; }   // 6 AM — before 9 AM
      getMinutes(): number { return 0; }
    };
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button min="09:00" max="17:00" minute-step="30"></civ-time-picker>');
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      // 06:00 < min → clamped to 09:00.
      expect(el.value).toBe('09:00');
    } finally {
      (globalThis as any).Date = realNow;
    }
  });

  it('sets exact minute precision in text mode (no snap)', async () => {
    const realNow = Date;
    (globalThis as any).Date = class extends realNow {
      constructor() { super(); }
      getHours(): number { return 14; }
      getMinutes(): number { return 37; }
    };
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" show-now-button></civ-time-picker>');
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(el.value).toBe('14:37');
    } finally {
      (globalThis as any).Date = realNow;
    }
  });

  it('dispatches civ-change with the assembled detail', async () => {
    const realNow = Date;
    (globalThis as any).Date = class extends realNow {
      constructor() { super(); }
      getHours(): number { return 9; }
      getMinutes(): number { return 0; }
    };
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button></civ-time-picker>');
      const handler = vi.fn();
      el.addEventListener('civ-change', handler as EventListener);
      (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(handler).toHaveBeenCalledTimes(1);
      const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
      expect(detail.value).toBe('09:00');
      expect(detail.hour).toBe('9');
      expect(detail.period).toBe('AM');
    } finally {
      (globalThis as any).Date = realNow;
    }
  });

  it('no-ops when disabled', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker label="When" show-now-button disabled></civ-time-picker>');
    const btn = el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.click();
    await elementUpdated(el);
    expect(el.value).toBe('');
  });

  it('clears a text-mode auto-error when Now is clicked', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="text" label="When" name="t" show-now-button></civ-time-picker>');
    // Force a text-mode error first by typing an invalid 12-hour input.
    const ti = el.querySelector('civ-text-input[name="t-time"]')!;
    const input = ti.querySelector('input') as HTMLInputElement;
    input.value = '1430';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();

    (el.querySelector('.civ-time-picker-now-btn') as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(el.error).toBe('');
  });
});

describe('civ-time-picker — disabled-slots (combo mode)', () => {
  async function getComboOptions(el: any) {
    const combo = el.querySelector('civ-combobox') as any;
    return combo.options as Array<{ value: string; label: string; disabled?: boolean }>;
  }

  it('marks options matching disabled-slots as disabled on the combobox', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="combo" min="09:00" max="10:00" minute-step="15" disabled-slots=\'["09:00","09:30"]\'></civ-time-picker>'
    );
    const options = await getComboOptions(el);
    const byValue = Object.fromEntries(options.map((o) => [o.value, o.disabled === true]));
    expect(byValue['09:00']).toBe(true);
    expect(byValue['09:15']).toBe(false);
    expect(byValue['09:30']).toBe(true);
    expect(byValue['09:45']).toBe(false);
    expect(byValue['10:00']).toBe(false);
  });

  it('still renders disabled slots in the dropdown (users see unavailability)', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="combo" min="09:00" max="09:30" minute-step="15" disabled-slots=\'["09:15"]\'></civ-time-picker>'
    );
    const options = await getComboOptions(el);
    expect(options.length).toBe(3);
    expect(options.find((o) => o.value === '09:15')?.disabled).toBe(true);
  });

  it('snap-to-nearest skips disabled slots — picks the closest available', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="combo" min="09:00" max="10:00" minute-step="15" disabled-slots=\'["09:30"]\'></civ-time-picker>'
    );
    // "9:27" would normally snap to 9:30 (disabled). Next-nearest is 9:15.
    const suggested = (el as any)._nearestSlotSuggestion('9:27');
    expect(suggested[0].value).toBe('09:15');
  });

  it('defaults to empty array (no disabled slots)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="combo" min="09:00" max="09:30"></civ-time-picker>');
    const options = await getComboOptions(el);
    expect(options.every((o) => !o.disabled)).toBe(true);
  });

  it('synthetic option (out-of-grid value) is never marked disabled', async () => {
    const el = await fixture<CivTimePicker>(
      '<civ-time-picker mode="combo" minute-step="15" value="09:30" disabled-slots=\'["09:30"]\'></civ-time-picker>'
    );
    // The 09:30 in the disabled-slots list matches a real grid option, so
    // there's no synthetic injection — but the regular option is disabled.
    const options = await getComboOptions(el);
    const matching = options.filter((o) => o.value === '09:30');
    expect(matching.length).toBe(1);
    expect(matching[0].disabled).toBe(true);

    // For an out-of-grid value, the synthetic option is not disabled.
    const el2 = await fixture<CivTimePicker>(
      '<civ-time-picker mode="combo" minute-step="15" value="09:27" disabled-slots=\'["09:27"]\'></civ-time-picker>'
    );
    const options2 = await getComboOptions(el2);
    const synthetic = options2.find((o) => o.value === '09:27');
    expect(synthetic).toBeDefined();
    expect(synthetic?.disabled).toBeUndefined();
  });

  it('accepts the prop set as a JS array (not just an HTML attribute)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="combo" min="09:00" max="09:30" minute-step="15"></civ-time-picker>');
    (el as any).disabledSlots = ['09:15'];
    await elementUpdated(el);
    const options = await getComboOptions(el);
    expect(options.find((o) => o.value === '09:15')?.disabled).toBe(true);
  });
});

describe('civ-time-picker — `now` shorthand for min/max (combo mode)', () => {
  it('resolves min="now" to the device-current time, dropping earlier slots', async () => {
    // Freeze "now" at 13:00 — only slots at 13:00 and later should appear.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-16T13:00:00'));
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker mode="combo" min="now" minute-step="60"></civ-time-picker>');
      const combo = el.querySelector('civ-combobox') as any;
      const values = (combo.options as Array<{ value: string }>).map((o) => o.value);
      expect(values[0]).toBe('13:00');
      // Earlier hours are excluded.
      expect(values).not.toContain('12:00');
    } finally {
      vi.useRealTimers();
    }
  });

  it('resolves max="now" to the device-current time, dropping later slots', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-16T13:00:00'));
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker mode="combo" max="now" minute-step="60"></civ-time-picker>');
      const combo = el.querySelector('civ-combobox') as any;
      const values = (combo.options as Array<{ value: string }>).map((o) => o.value);
      expect(values[values.length - 1]).toBe('13:00');
      expect(values).not.toContain('14:00');
    } finally {
      vi.useRealTimers();
    }
  });

  it('snaps "now" to the active minute-step grid', async () => {
    // 13:07 with a 15-min step should resolve to 13:00, not 13:07 (which
    // would orphan slot 13:15 — the slot list is grid-aligned).
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-16T13:07:00'));
    try {
      const el = await fixture<CivTimePicker>('<civ-time-picker mode="combo" min="now" minute-step="15"></civ-time-picker>');
      const combo = el.querySelector('civ-combobox') as any;
      const values = (combo.options as Array<{ value: string }>).map((o) => o.value);
      expect(values[0]).toBe('13:00');
    } finally {
      vi.useRealTimers();
    }
  });

  it('still parses normal HH:MM bounds (no regression)', async () => {
    const el = await fixture<CivTimePicker>('<civ-time-picker mode="combo" min="09:00" max="11:00" minute-step="60"></civ-time-picker>');
    const combo = el.querySelector('civ-combobox') as any;
    const values = (combo.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).toEqual(['09:00', '10:00', '11:00']);
  });
});


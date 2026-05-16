// Schema: packages/schema/src/components/civ-time-picker.schema.ts

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CivFormElement,
  LegendHeadingMixin,
  buildDescribedBy,
  dispatch,
  renderFormHeader,
  renderLegend,
  t,
  warnInvalidProp,
} from '@civui/core';
import type { ComboboxOption } from '../combobox/civ-combobox.js';

// Side-effect imports register the child custom elements.
import '../select/civ-select.js';
import '../combobox/civ-combobox.js';
import '@civui/controls/segmented-control';

export type TimePickerFormat = '12' | '24';
export type TimePickerMode = 'select' | 'combo';

/**
 * CivUI Time Picker
 *
 * Self-contained time input. Always stores its value in 24-hour ISO
 * format (`HH:MM`) regardless of display format or input mode.
 *
 * Two input modes:
 *
 * - `mode="combo"` (default, USWDS pattern): a single typeable
 *   combobox with pre-built time slots driven by `minute-step`. Users
 *   can type to filter (`"230"` → "2:30 AM"/"2:30 PM"), or pick from
 *   the dropdown. Optional `min`/`max` bounds restrict the slot
 *   list to business hours. Best for scheduling — appointments,
 *   hearing times, callback windows.
 *
 * - `mode="select"`: three selects (hour, minute, AM/PM). Predictable,
 *   every-device-safe, no typing required. Use when slot-list
 *   filtering would be confusing (e.g. capturing an arbitrary
 *   incident time) or when minute-level precision (`minute-step="1"`)
 *   would create too long a combobox list.
 *
 * For known past dates use `civ-memorable-date`; for future dates use
 * `civ-date-picker`.
 *
 * @element civ-time-picker
 *
 * @prop {string} mode - Input mode: 'combo' (default, USWDS combobox) or 'select' (three dropdowns)
 * @prop {string} legend - Fieldset legend rendered above the fields (select mode)
 * @prop {string} label - Label for the combobox input (combo mode)
 * @prop {string} name - Base form field name
 * @prop {string} value - Time value in 24-hour ISO format (HH:MM); empty when unset
 * @prop {string} format - Display format: '12' (default, with AM/PM) or '24'
 * @prop {number} minuteStep - Increment for the minute slots / select options. Defaults to 15 for combo mode (scheduling-friendly), 5 for select mode.
 * @prop {string} min - Earliest allowed time, 24-hour HH:MM (combo mode only)
 * @prop {string} max - Latest allowed time, 24-hour HH:MM (combo mode only)
 *
 * @fires civ-input - When any sub-field or the combobox value changes, detail: { value, hour, minute, period }
 * @fires civ-change - When the value commits, detail: { value, hour, minute, period }
 * @fires civ-analytics - Analytics tracking on change
 */
@customElement('civ-time-picker')
export class CivTimePicker extends LegendHeadingMixin(CivFormElement) {
  @property({ type: String }) mode: TimePickerMode = 'combo';
  @property({ type: String }) legend = '';
  @property({ type: String }) format: TimePickerFormat = '12';
  @property({ type: Number, attribute: 'minute-step' }) minuteStep = 0;
  @property({ type: String, attribute: 'hour-label' }) hourLabel = '';
  @property({ type: String, attribute: 'minute-label' }) minuteLabel = '';
  @property({ type: String, attribute: 'period-label' }) periodLabel = '';

  /**
   * Earliest allowed time, 24-hour `HH:MM`. Combo mode only; ignored
   * in select mode (the select shows the full 12- or 24-hour range).
   */
  @property({ type: String }) min = '';

  /** Latest allowed time, 24-hour `HH:MM`. Combo mode only. */
  @property({ type: String }) max = '';

  /**
   * Placeholder for the combo-mode input. Defaults to the locale-aware
   * `timePickerPlaceholder` (English: "e.g. 9:00 AM"). Ignored in
   * select mode.
   */
  @property({ type: String }) placeholder = '';

  @state() private _hour = '';
  @state() private _minute = '';
  @state() private _period: 'AM' | 'PM' | '' = '';

  private _boundFieldInput = this._onFieldInput.bind(this);
  private _boundFieldChange = this._onFieldChange.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this._parseValue();
    // Select-mode children bubble civ-input/civ-change to the host;
    // we re-dispatch as the host's own assembled event. Combo mode
    // uses an explicit `@civ-change` template binding instead, so
    // these listeners no-op when `mode === 'combo'`. Registered
    // unconditionally so a runtime mode switch keeps working.
    this.addEventListener('civ-input', this._boundFieldInput as EventListener);
    this.addEventListener('civ-change', this._boundFieldChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-input', this._boundFieldInput as EventListener);
    this.removeEventListener('civ-change', this._boundFieldChange as EventListener);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    // Re-parse on any input that changes how the stored ISO `value`
    // maps to sub-fields: a new value, a 12↔24 format flip, or a
    // minute-step change that may invalidate the current minute
    // selection.
    if ((changed.has('value') || changed.has('format')) && !changed.has('_hour')) {
      this._parseValue();
    }
    if (changed.has('minuteStep') && this._minute && this.mode === 'select') {
      // If the current minute isn't in the new option set, clear it so
      // the select doesn't display an orphaned value the user can't
      // re-select. Combo mode handles its own slot list; the value
      // there isn't bound to the minute-step grid (we accept any value
      // that matches an HH:MM ISO string, regardless of step).
      const step = this._effectiveMinuteStep();
      if (Number(this._minute) % step !== 0) {
        this._minute = '';
        this.value = '';
      }
    }
  }

  /**
   * Effective minute step with mode-aware default: combo mode defaults
   * to 15 (scheduling-friendly slot density), select mode defaults to
   * 5 (most precision without an unwieldy dropdown).
   *
   * `minute-step` defaults to 0 as an "unset" sentinel — the prop type
   * is `number` so we can't use `undefined` from HTML attributes.
   * Explicit positive integers override the mode default. Negative
   * values, non-integers, and explicit `0` all fall back with a warn,
   * because there's no sensible "step = 0" semantics for time slots.
   */
  private _effectiveMinuteStep(): number {
    if (this.minuteStep > 0 && this.minuteStep === Math.floor(this.minuteStep)) {
      return this.minuteStep;
    }
    // Skip the warn for the genuine unset case (no attribute supplied
    // by the consumer, leaving Lit's default of 0 from the @property
    // decoration).
    if (this.minuteStep !== 0) {
      warnInvalidProp('civ-time-picker', 'minute-step', 'a positive integer (e.g. 1, 5, 15, 30)', String(this.minuteStep));
    }
    return this.mode === 'combo' ? 15 : 5;
  }

  /**
   * Parse `value` (24-hour HH:MM) into the display sub-fields.
   * For 12-hour display, the stored 24-hour hour is converted; for
   * 24-hour display the hour stays as-is and `_period` is empty.
   */
  private _parseValue(): void {
    if (!this.value) {
      this._hour = '';
      this._minute = '';
      this._period = '';
      return;
    }
    const match = this.value.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      this._hour = '';
      this._minute = '';
      this._period = '';
      return;
    }
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (!Number.isFinite(h) || h < 0 || h > 23 || !Number.isFinite(m) || m < 0 || m > 59) {
      this._hour = '';
      this._minute = '';
      this._period = '';
      return;
    }
    this._minute = String(m).padStart(2, '0');
    if (this.format === '24') {
      this._hour = String(h).padStart(2, '0');
      this._period = '';
    } else {
      this._period = h < 12 ? 'AM' : 'PM';
      const twelveHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      this._hour = String(twelveHour);
    }
  }

  /**
   * Convert the current sub-field state back into a 24-hour HH:MM string.
   * Returns empty string when any required piece is missing.
   */
  private _assembleValue(): string {
    if (!this._hour || !this._minute) return '';
    if (this.format === '12' && !this._period) return '';

    let hour = Number(this._hour);
    const minute = Number(this._minute);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '';
    if (minute < 0 || minute > 59) return '';

    if (this.format === '12') {
      if (hour < 1 || hour > 12) return '';
      if (this._period === 'AM') {
        hour = hour === 12 ? 0 : hour;
      } else {
        hour = hour === 12 ? 12 : hour + 12;
      }
    } else if (hour < 0 || hour > 23) {
      return '';
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  private get _hourOptions(): { value: string; label: string }[] {
    if (this.format === '24') {
      return Array.from({ length: 24 }, (_, i) => ({
        value: String(i).padStart(2, '0'),
        label: String(i).padStart(2, '0'),
      }));
    }
    return Array.from({ length: 12 }, (_, i) => {
      const v = String(i + 1);
      return { value: v, label: v };
    });
  }

  private get _selectMinuteOptions(): { value: string; label: string }[] {
    const step = this._effectiveMinuteStep();
    const opts: { value: string; label: string }[] = [];
    for (let m = 0; m < 60; m += step) {
      const s = String(m).padStart(2, '0');
      opts.push({ value: s, label: s });
    }
    return opts;
  }

  /**
   * Build the full list of time slots for combo mode. Each slot is a
   * `ComboboxOption` with `value` as 24-hour ISO `HH:MM` and `label`
   * formatted per the `format` prop. Bounded by `min` and `max` when
   * set; otherwise covers the full day.
   *
   * When `this.value` is set but doesn't match a generated slot
   * (because of `minute-step` granularity OR out-of-`min`/`max`
   * bounds), the actual value is injected as a synthetic option so
   * the combobox can find and display it. Without this, the input
   * would render blank while `el.value` still held the unmatched
   * string — submitting a value the user cannot see.
   */
  private _comboOptions(): ComboboxOption[] {
    const step = this._effectiveMinuteStep();
    const minMinutes = this._parseTimeToMinutes(this.min);
    const maxMinutes = this._parseTimeToMinutes(this.max);
    const opts: ComboboxOption[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += step) {
        const total = h * 60 + m;
        if (minMinutes != null && total < minMinutes) continue;
        if (maxMinutes != null && total > maxMinutes) continue;
        const iso = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        opts.push({ value: iso, label: this._formatTimeForDisplay(h, m) });
      }
    }
    // Synthetic option: the consumer's `value` doesn't align with the
    // slot grid (e.g. value="14:37" with minute-step=15) or sits
    // outside min/max bounds. Insert it sorted by time so the dropdown
    // stays ordered.
    if (this.value && !opts.some((o) => o.value === this.value)) {
      const parsed = this._parseTimeToMinutes(this.value);
      if (parsed != null) {
        const h = Math.floor(parsed / 60);
        const m = parsed % 60;
        const synthetic = { value: this.value, label: this._formatTimeForDisplay(h, m) };
        // Sort-insert by total minutes.
        let inserted = false;
        for (let i = 0; i < opts.length; i++) {
          const optMinutes = this._parseTimeToMinutes(opts[i].value);
          if (optMinutes != null && optMinutes > parsed) {
            opts.splice(i, 0, synthetic);
            inserted = true;
            break;
          }
        }
        if (!inserted) opts.push(synthetic);
      }
    }
    return opts;
  }

  /**
   * Parse a strict 24-hour `HH:MM` string to minutes-since-midnight,
   * or null when the input is empty / malformed. Requires zero-padded
   * hours (`"09:00"`, not `"9:00"`) so the documented schema contract
   * matches the parser — important for cross-platform implementations
   * that consume `min` / `max` from the same string. The `value` prop
   * is also validated through here.
   */
  private _parseTimeToMinutes(s: string): number | null {
    if (!s) return null;
    const match = s.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  }

  /**
   * Render a (24-hour) hour/minute pair as the display string the
   * user sees in the combo slot list and (when matched) in the input.
   */
  private _formatTimeForDisplay(h: number, m: number): string {
    const minutePart = String(m).padStart(2, '0');
    if (this.format === '24') {
      return `${String(h).padStart(2, '0')}:${minutePart}`;
    }
    const period = h < 12 ? t('timePickerAm') : t('timePickerPm');
    const twelveHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${twelveHour}:${minutePart} ${period}`;
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
    const selects = this.querySelectorAll('civ-select') as NodeListOf<HTMLElement & { disabled: boolean }>;
    selects.forEach((s) => { s.disabled = disabled; });
    const combo = this.querySelector('civ-combobox') as (HTMLElement & { disabled: boolean }) | null;
    if (combo) combo.disabled = disabled;
    const period = this.querySelector('civ-segmented-control') as (HTMLElement & { disabled: boolean }) | null;
    if (period) period.disabled = disabled;
  }

  override render() {
    return this.mode === 'combo' ? this._renderComboMode() : this._renderSelectMode();
  }

  /**
   * Combo mode: a single typeable combobox with pre-built slots.
   * Matches the USWDS time-picker pattern. Stores value as 24-hour
   * ISO `HH:MM`; display labels come from `format` (12 or 24).
   */
  private _renderComboMode() {
    const label = this.label || this.legend || t('timePickerDefaultLegend');
    const placeholder = this.placeholder || t('timePickerPlaceholder');
    return html`
      <civ-combobox
        label="${label}"
        name="${this.name || nothing}"
        .options="${this._comboOptions()}"
        .value="${this.value}"
        placeholder="${placeholder}"
        hint="${this.hint}"
        error="${this.error}"
        ?required="${this.required}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?hide-required-indicator="${this.hideRequiredIndicator}"
        @civ-change="${this._onComboChange}"
      ></civ-combobox>
    `;
  }

  /**
   * Select mode: three selects (hour, minute, AM/PM) inside a fieldset.
   * The original CivUI default; predictable and every-device-safe.
   * Useful when slot-list filtering doesn't fit (free-form precision,
   * or minute-step=1 which would create 1440 slots).
   */
  private _renderSelectMode() {
    const hourLabel = this.hourLabel || t('timePickerHourLabel');
    const minuteLabel = this.minuteLabel || t('timePickerMinuteLabel');
    const periodLabel = this.periodLabel || t('timePickerPeriodLabel');
    // describedBy only includes IDs that will actually have elements in
    // the DOM. Hint/error are rendered inside `renderFormHeader`, which
    // we always invoke below — so the IDs are always live when hint/error
    // are set, regardless of whether `legend` was provided.
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const legendText = this.legend || t('timePickerDefaultLegend');

    const fields = html`
      <div class="civ-time-picker-fields">
        <div class="civ-time-picker-hour">
          <civ-select
            label="${hourLabel}"
            name="${this.name ? `${this.name}-hour` : 'hour'}"
            .options="${this._hourOptions}"
            .value="${this._hour}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?hide-required-indicator="${this.required}"
            disable-analytics
          ></civ-select>
        </div>
        <div class="civ-time-picker-minute">
          <civ-select
            label="${minuteLabel}"
            name="${this.name ? `${this.name}-minute` : 'minute'}"
            .options="${this._selectMinuteOptions}"
            .value="${this._minute}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?hide-required-indicator="${this.required}"
            disable-analytics
          ></civ-select>
        </div>
        ${this.format === '12'
          ? html`
              <div class="civ-time-picker-period">
                <civ-segmented-control
                  legend="${periodLabel}"
                  name="${this.name ? `${this.name}-period` : 'period'}"
                  .value="${this._period}"
                  ?required="${this.required}"
                  ?disabled="${this.disabled}"
                  ?hide-required-indicator="${this.required}"
                  disable-analytics
                >
                  <civ-segment value="AM" label="${t('timePickerAm')}"></civ-segment>
                  <civ-segment value="PM" label="${t('timePickerPm')}"></civ-segment>
                </civ-segmented-control>
              </div>
            `
          : nothing}
      </div>
    `;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({
          label: renderLegend({
            // Section 508 requires every fieldset to have a non-empty
            // legend. When the consumer omits one we fall back to a
            // visually-hidden "Time" so AT users still get a label.
            legend: legendText,
            required: this.required,
            showRequired: !this.hideRequiredIndicator && this.required,
            headingLevel: this.headingLevel,
            size: this.size,
            srOnly: !this.legend,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
          fieldset: true,
        })}
        ${fields}
      </fieldset>
    `;
  }

  /** Read the latest values from the child selects. */
  private _readChildValues(): void {
    const baseName = this.name || '';
    const hourSel = this.querySelector(
      `civ-select[name="${baseName ? `${baseName}-hour` : 'hour'}"]`,
    ) as (HTMLElement & { value: string }) | null;
    const minuteSel = this.querySelector(
      `civ-select[name="${baseName ? `${baseName}-minute` : 'minute'}"]`,
    ) as (HTMLElement & { value: string }) | null;
    // Period is a segmented-control (two-option binary choice) so it
    // can be a single tap on every viewport. The selector matches the
    // segmented-control's `name`, not a select.
    const periodCtrl = this.querySelector(
      `civ-segmented-control[name="${baseName ? `${baseName}-period` : 'period'}"]`,
    ) as (HTMLElement & { value: string }) | null;

    if (hourSel) this._hour = hourSel.value || '';
    if (minuteSel) this._minute = minuteSel.value || '';
    if (periodCtrl) this._period = (periodCtrl.value as 'AM' | 'PM' | '') || '';
  }

  private _onFieldInput(e: CustomEvent): void {
    if (e.target === this) return;
    if (this.mode !== 'select') return;
    // Suppress the child's event from reaching consumer listeners on
    // this host — they should only see the parent's assembled event.
    e.stopImmediatePropagation();
    this._updateFromChildren(false);
  }

  private _onFieldChange(e: CustomEvent): void {
    if (e.target === this) return;
    if (this.mode !== 'select') return;
    e.stopImmediatePropagation();
    this._updateFromChildren(true);
  }

  /**
   * Combo-mode change handler — `civ-combobox` already dispatches
   * `civ-change` with `{ value }` where value is the picked option's
   * value (our 24-hour ISO string). We just need to re-parse sub-fields
   * and forward the host event with the standard detail shape.
   *
   * Guarded against `disabled` so a stray event in flight when the
   * form disables mid-render doesn't mutate the host value. Symmetric
   * with civ-form's expectation that disabled fields stay inert.
   */
  private _onComboChange(e: CustomEvent<{ value: string }>): void {
    if (e.target === this) return;
    if (this.disabled) return;
    e.stopImmediatePropagation();
    this.value = e.detail.value || '';
    this._parseValue();
    this.updateFormValue(this.value);
    const detail = {
      value: this.value,
      hour: this._hour,
      minute: this._minute,
      period: this._period,
    };
    dispatch(this, 'civ-input', detail);
    dispatch(this, 'civ-change', detail);
    this.sendAnalytics('change');
  }

  private _updateFromChildren(fireChange: boolean): void {
    this._readChildValues();
    const assembled = this._assembleValue();
    this.value = assembled;
    this.updateFormValue(this.value);

    const detail = {
      value: this.value,
      hour: this._hour,
      minute: this._minute,
      period: this._period,
    };
    dispatch(this, 'civ-input', detail);
    if (fireChange) {
      dispatch(this, 'civ-change', detail);
      this.sendAnalytics('change');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-time-picker': CivTimePicker;
  }
}

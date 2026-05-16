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
import '../text-input/civ-text-input.js';
import '@civui/controls/segmented-control';

export type TimePickerFormat = '12' | '24';
export type TimePickerMode = 'select' | 'combo' | 'text';

/**
 * CivUI Time Picker
 *
 * Self-contained time input. Always stores its value in 24-hour ISO
 * format (`HH:MM`) regardless of display format or input mode.
 *
 * Three input modes:
 *
 * - `mode="combo"` (default, USWDS pattern): a single typeable
 *   combobox with pre-built time slots driven by `minute-step`. Users
 *   can type to filter (`"230"` → "2:30 AM"/"2:30 PM"), or pick from
 *   the dropdown. Optional `min`/`max` bounds restrict the slot
 *   list to business hours. Best for scheduling — appointments,
 *   hearing times, callback windows.
 *
 * - `mode="select"`: hour + minute selects plus an AM/PM segmented
 *   control. Predictable, every-device-safe, no typing required. Use
 *   when picking from a discrete list is easier than typing — e.g.
 *   when the consumer wants to constrain to specific 5/15/30-minute
 *   buckets without slot-list filtering.
 *
 * - `mode="text"`: free-form text input (`HH:MM` with auto-formatting
 *   mask) plus the same AM/PM segmented control. Best for arbitrary
 *   precision — incident reports, medical event times, "exactly when
 *   did this happen" prompts where the user knows the time and would
 *   be slowed by a slot grid. `minute-step` is ignored in this mode.
 *
 * For known past dates use `civ-memorable-date`; for future dates use
 * `civ-date-picker`.
 *
 * @element civ-time-picker
 *
 * @prop {string} mode - Input mode: 'combo' (default, USWDS combobox), 'select' (dropdowns), or 'text' (free-form text + AM/PM)
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

  /**
   * Hide the "Now" quick-button. Defaults to false — the button is
   * shown by default, mirroring civ-date-picker's "Today" affordance.
   * Hide on forms where "now" doesn't make semantic sense (recording
   * past events without time-of-day relevance).
   */
  @property({ type: Boolean, attribute: 'hide-now-button' }) hideNowButton = false;

  /**
   * Override the "Now" button label. Defaults to the locale-aware
   * `timePickerNowButton` string ("Now" in English).
   */
  @property({ type: String, attribute: 'now-button-label' }) nowButtonLabel = '';

  @state() private _hour = '';
  @state() private _minute = '';
  @state() private _period: 'AM' | 'PM' | '' = '';

  /**
   * True when `this.error` was set by the text-mode assembly check
   * (e.g. "Hour must be 1–12"). Lets us clear our own error when the
   * input becomes valid without clobbering errors the consumer set
   * for other reasons (server-side validation, custom rules).
   */
  private _textModeError = false;

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

  override formResetCallback(): void {
    super.formResetCallback();
    // Clear our text-mode validation error (if we set one) so the
    // reset field doesn't keep "Hour must be 1–12" stuck on the
    // legend until the next user interaction. Re-parse rebuilds
    // _hour / _minute / _period from the (now-reset) value.
    if (this._textModeError) {
      this.error = '';
      this._textModeError = false;
    }
    this._parseValue();
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
   *
   * Exactly-midnight (00:00) and exactly-noon (12:00) get a "(midnight)"
   * / "(noon)" annotation — the conventional disambiguation for 12 AM
   * vs 12 PM that confuses every user the first time they encounter it.
   * The annotation appears in 24-hour format too: "00:00 (midnight)",
   * "12:00 (noon)". Only exact zero-minute slots qualify (12:15 AM is
   * not midnight).
   */
  private _formatTimeForDisplay(h: number, m: number): string {
    const minutePart = String(m).padStart(2, '0');
    const annotation = m === 0 && (h === 0 || h === 12)
      ? ` (${h === 0 ? t('timePickerMidnight') : t('timePickerNoon')})`
      : '';
    if (this.format === '24') {
      return `${String(h).padStart(2, '0')}:${minutePart}${annotation}`;
    }
    const period = h < 12 ? t('timePickerAm') : t('timePickerPm');
    const twelveHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${twelveHour}:${minutePart} ${period}${annotation}`;
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
    if (this.mode === 'combo') return this._renderComboMode();
    if (this.mode === 'text') return this._renderTextMode();
    return this._renderSelectMode();
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
        .noMatchSuggestions="${(filter: string) => this._nearestSlotSuggestion(filter)}"
        placeholder="${placeholder}"
        hint="${this.hint}"
        error="${this.error}"
        inputmode="numeric"
        ?required="${this.required}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?hide-required-indicator="${this.hideRequiredIndicator}"
        @civ-change="${this._onComboChange}"
      ></civ-combobox>
      ${this._renderNowButton()}
    `;
  }

  /**
   * "Now" quick-button. Mirrors civ-date-picker's "Today" affordance.
   * Sets `value` to the device's current local time:
   *  - combo mode: snaps to the nearest slot honoring `min`/`max`/
   *    `minute-step` (so a 15-min combo gets the closest 15-min slot).
   *  - text mode: sets the exact current time, minute-precision.
   *  - select mode: snaps minute to `minute-step` grid like combo.
   *
   * Suppressed via `hide-now-button`. Disabled with the host.
   */
  private _renderNowButton() {
    if (this.hideNowButton || this.readonly) return nothing;
    const label = this.nowButtonLabel || t('timePickerNowButton');
    return html`
      <div class="civ-time-picker-footer">
        <button
          type="button"
          class="civ-time-picker-now-btn"
          ?disabled="${this.disabled}"
          @click="${this._onNowClick}"
        >${label}</button>
      </div>
    `;
  }

  /**
   * Compute the current local time, format it for the active mode,
   * write it through the normal assembly path so all the event /
   * form-value plumbing fires.
   */
  private _onNowClick(): void {
    if (this.disabled || this.readonly) return;
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();

    // Snap to minute-step for combo + select modes — typing-free
    // modes should commit a slot that's actually in the grid.
    // Text mode skips snapping; the user expects exact minute
    // precision when they pick a text input.
    if (this.mode !== 'text') {
      const step = this._effectiveMinuteStep();
      m = Math.round(m / step) * step;
      if (m === 60) { h = (h + 1) % 24; m = 0; }
    }

    // Honor combo min/max if set. Clamp to the bounded range so
    // "Now" outside business hours snaps to the nearest in-range
    // edge rather than producing an out-of-range value.
    if (this.mode === 'combo') {
      const minMin = this._parseTimeToMinutes(this.min);
      const maxMin = this._parseTimeToMinutes(this.max);
      let total = h * 60 + m;
      if (minMin != null && total < minMin) total = minMin;
      if (maxMin != null && total > maxMin) total = maxMin;
      h = Math.floor(total / 60);
      m = total % 60;
    }

    const iso = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    this.value = iso;
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
    // Clear any text-mode auto-error the user might have triggered
    // before clicking Now.
    if (this._textModeError) {
      this.error = '';
      this._textModeError = false;
    }
  }

  /**
   * Snap a typed filter to the nearest slot when civ-combobox's
   * filter found no exact match. Wired into the combobox via
   * `noMatchSuggestions`. Returns a single-option array — the
   * suggestion appears in the dropdown like any other slot, the
   * user picks it normally (no auto-commit, no surprise).
   *
   * Returns `[]` when the typed filter can't be parsed as a partial
   * time (pure letters, gibberish, empty after digit-stripping) —
   * civ-combobox then shows its standard "No results found" message.
   */
  private _nearestSlotSuggestion(filter: string): ComboboxOption[] {
    const minutes = this._parseFilterToMinutes(filter);
    if (minutes == null) return [];
    const opts = this._comboOptions();
    if (opts.length === 0) return [];

    let nearest = opts[0];
    let nearestDelta = Infinity;
    for (const opt of opts) {
      const m = this._parseTimeToMinutes(opt.value);
      if (m == null) continue;
      const delta = Math.abs(m - minutes);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearest = opt;
      }
    }
    return [nearest];
  }

  /**
   * Parse a free-form filter string to minutes-since-midnight.
   * Handles the natural shapes users type:
   *   - "9" / "9:00"         → 9 * 60 = 540
   *   - "927" / "9:27"       → 9 * 60 + 27 = 567
   *   - "1430"               → 14 * 60 + 30 = 870 (24-hour input)
   *   - "9p" / "9 PM"        → 21 * 60 = 1260
   *   - "9:27 PM"            → 21 * 60 + 27 = 1287
   *
   * In `format="12"`, hour values > 12 are treated as 24-hour input
   * so "1430" still snaps to a sensible afternoon slot. AM/PM hints
   * (any "a"/"p" letter in the filter) override.
   *
   * Returns `null` when the filter has no parseable digits or the
   * parsed time is out of range (e.g. minute > 59).
   */
  private _parseFilterToMinutes(filter: string): number | null {
    const lower = filter.trim().toLowerCase();
    if (!lower) return null;

    // Loose AM/PM detection — any "a" or "p" letter in the filter
    // counts as the hint. Good enough for typical user input
    // ("9a", "9 am", "9:27 pm") without parsing word boundaries.
    const hasAm = /a/.test(lower);
    const hasPm = /p/.test(lower);

    const cleaned = lower.replace(/[^\d:]/g, '');
    if (!cleaned) return null;

    let h: number;
    let m: number;
    if (cleaned.includes(':')) {
      const [hStr, mStr] = cleaned.split(':');
      h = Number(hStr);
      m = Number(mStr) || 0;
    } else if (cleaned.length <= 2) {
      h = Number(cleaned);
      m = 0;
    } else if (cleaned.length === 3) {
      h = Number(cleaned[0]);
      m = Number(cleaned.slice(1));
    } else {
      h = Number(cleaned.slice(0, 2));
      m = Number(cleaned.slice(2, 4));
    }

    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    if (m < 0 || m > 59) return null;

    if (this.format === '12') {
      if (h === 12 && hasAm) h = 0;
      else if (h < 12 && hasPm) h += 12;
      // hour > 12 with no period hint: treat as 24-hour input,
      // leave as-is so "1430" → 14:30.
    }

    if (h < 0 || h > 23) return null;
    return h * 60 + m;
  }


  /**
   * Select mode: three selects (hour, minute, AM/PM) inside a fieldset.
   * The original CivUI default; predictable and every-device-safe.
   * Useful when slot-list filtering doesn't fit (free-form precision,
   * or minute-step=1 which would create 1440 slots).
   */

  /**
   * Text mode: free-form text input with `##:##` mask (digits only,
   * auto-formats on blur with a colon) plus the same AM/PM segmented
   * control as select mode. For arbitrary precision — incident
   * reports, exact event times. Skips the period control in
   * 24-hour format.
   *
   * The mask stores raw digits in the text input's value ("234",
   * "1234"); _readChildValues splits last-2 as minutes, rest as
   * hour. 12-hour mode still requires the period segment to assemble
   * a value; consumers who want "type any hour 0-23" should use
   * format="24".
   */
  private _renderTextMode() {
    const label = this.label || this.legend || t('timePickerDefaultLegend');
    const periodLabel = this.periodLabel || t('timePickerPeriodLabel');
    const placeholder = this.placeholder || (this.format === '24' ? '14:30' : '2:34');
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    // Pack _hour + _minute back into the raw digit form the
    // text-input mask expects (no colon, no separators). civ-text-input
    // applies the mask to display "HH:MM" on blur.
    const rawDigits = this._hour && this._minute
      ? `${this._hour.padStart(2, '0')}${this._minute.padStart(2, '0')}`
      : this._hour || '';

    // Required-mark routing. When `legend` is explicitly set, the
    // visible legend carries the (required) marker and children
    // suppress theirs (single visible marker). When only `label` was
    // set, the legend is sr-only — putting the marker there hides it
    // from sighted users, so the children render the marker on their
    // own labels instead. Matches the multi-field-compound pattern.
    const legendIsVisible = !!this.legend;
    const markerOnLegend = legendIsVisible && !this.hideRequiredIndicator && this.required;
    const hideMarkerOnChildren = legendIsVisible || this.hideRequiredIndicator;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({
          label: renderLegend({
            legend: label,
            required: this.required,
            showRequired: markerOnLegend,
            headingLevel: this.headingLevel,
            size: this.size,
            srOnly: !legendIsVisible,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
          fieldset: true,
        })}
        <div class="civ-time-picker-fields">
          <div class="civ-time-picker-time-input">
            <civ-text-input
              label="${t('timePickerTimeLabel')}"
              name="${this.name ? `${this.name}-time` : 'time'}"
              type="text"
              inputmode="numeric"
              mask-pattern="##:##"
              placeholder="${placeholder}"
              .value="${rawDigits}"
              error="${this.error}"
              hide-char-count
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              ?hide-required-indicator="${hideMarkerOnChildren}"
              disable-analytics
            ></civ-text-input>
          </div>
          ${this.format === '12'
            ? html`
                <div class="civ-time-picker-period">
                  <civ-segmented-control
                    legend="${periodLabel}"
                    name="${this.name ? `${this.name}-period` : 'period'}"
                    .value="${this._period}"
                    error="${this.error}"
                    ?required="${this.required}"
                    ?disabled="${this.disabled}"
                    ?hide-required-indicator="${hideMarkerOnChildren}"
                    disable-analytics
                  >
                    <civ-segment value="AM" label="${t('timePickerAm')}"></civ-segment>
                    <civ-segment value="PM" label="${t('timePickerPm')}"></civ-segment>
                  </civ-segmented-control>
                </div>
              `
            : nothing}
        </div>
        ${this._renderNowButton()}
      </fieldset>
    `;
  }

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
        ${this._renderNowButton()}
      </fieldset>
    `;
  }

  /** Read the latest values from the child selects. */
  private _readChildValues(): void {
    const baseName = this.name || '';
    const periodCtrl = this.querySelector(
      `civ-segmented-control[name="${baseName ? `${baseName}-period` : 'period'}"]`,
    ) as (HTMLElement & { value: string }) | null;
    if (periodCtrl) this._period = (periodCtrl.value as 'AM' | 'PM' | '') || '';

    if (this.mode === 'text') {
      // Text mode: read the masked input's raw digits and split into
      // hour / minute. 3-digit input is H+MM ("234" → 2:34);
      // 4-digit is HH+MM ("1234" → 12:34). Shorter inputs leave
      // _hour/_minute partial so _assembleValue returns "".
      const textInput = this.querySelector(
        `civ-text-input[name="${baseName ? `${baseName}-time` : 'time'}"]`,
      ) as (HTMLElement & { value: string }) | null;
      const raw = textInput?.value ?? '';
      if (!raw) {
        this._hour = '';
        this._minute = '';
        return;
      }
      let h: string, m: string;
      if (raw.length <= 2) {
        // Just hour digits typed so far — wait for minutes.
        h = raw;
        m = '';
      } else if (raw.length === 3) {
        h = raw[0];
        m = raw.slice(1);
      } else {
        h = raw.slice(0, 2);
        m = raw.slice(2, 4);
      }
      this._hour = h;
      this._minute = m;
      return;
    }

    // Select mode: read the hour / minute selects.
    const hourSel = this.querySelector(
      `civ-select[name="${baseName ? `${baseName}-hour` : 'hour'}"]`,
    ) as (HTMLElement & { value: string }) | null;
    const minuteSel = this.querySelector(
      `civ-select[name="${baseName ? `${baseName}-minute` : 'minute'}"]`,
    ) as (HTMLElement & { value: string }) | null;
    if (hourSel) this._hour = hourSel.value || '';
    if (minuteSel) this._minute = minuteSel.value || '';
  }

  private _onFieldInput(e: CustomEvent): void {
    if (e.target === this) return;
    // Combo mode uses its own template-bound `@civ-change` and never
    // benefits from re-assembly here. Select + text modes both rely
    // on this path — children (selects / text-input / segmented
    // control) fire civ-input → host reads them via _readChildValues
    // → assembles a 24-hour ISO value.
    if (this.mode === 'combo') return;
    // Suppress the child's event from reaching consumer listeners on
    // this host — they should only see the parent's assembled event.
    e.stopImmediatePropagation();
    this._updateFromChildren(false);
  }

  private _onFieldChange(e: CustomEvent): void {
    if (e.target === this) return;
    if (this.mode === 'combo') return;
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

    // Text mode: on commit, set/clear a contextual error when the
    // user has provided enough digits to look complete but the
    // assembly failed (hour > 12 in 12-hour, minute > 59, etc.).
    // Without this, the user sees a fully-formatted "14:30" with no
    // feedback that it's invalid — they submit and get nothing.
    //
    // Only manage `error` when WE set it (tracked by `_textModeError`)
    // so consumer-provided errors don't get clobbered.
    if (this.mode === 'text' && fireChange) {
      const msg = this._textModeErrorMessage();
      if (msg) {
        // Only auto-set when there's no existing error, OR when the
        // existing error came from us (i.e. update our own). Consumer-
        // set errors (server-side validation, custom rules) stay
        // intact.
        if (!this.error || this._textModeError) {
          this.error = msg;
          this._textModeError = true;
        }
      } else if (this._textModeError) {
        this.error = '';
        this._textModeError = false;
      }
    }

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

  /**
   * Diagnose a complete-looking-but-empty text-mode commit. Returns a
   * localized error message when:
   *   - the user typed at least 3 digits (HMM or HHMM — enough for a
   *     "looks complete" reading), AND
   *   - `_assembleValue()` returned "" (the input didn't actually
   *     produce a valid 24-hour time)
   * Returns `''` when there's no error to surface (still typing,
   * assembly succeeded, etc.).
   */
  private _textModeErrorMessage(): string {
    // Only surface text-mode validation diagnostics.
    if (this.mode !== 'text') return '';
    // Read the raw digits the user typed by re-deriving from _hour /
    // _minute. Empty / partial input shouldn't trigger an error.
    const digitCount = (this._hour?.length || 0) + (this._minute?.length || 0);
    if (digitCount < 3) return '';
    // Assembled OK → no error.
    if (this.value) return '';

    const h = Number(this._hour);
    const m = Number(this._minute);
    if (!Number.isFinite(m) || m > 59) {
      return t('timePickerInvalidMinute');
    }
    if (this.format === '12') {
      if (Number.isFinite(h) && (h < 1 || h > 12)) {
        return t('timePickerInvalidHour12');
      }
      if (!this._period) {
        return t('timePickerMissingPeriod');
      }
    } else if (!Number.isFinite(h) || h < 0 || h > 23) {
      return t('timePickerInvalidHour24');
    }
    // Catch-all (shouldn't reach here in practice).
    return t('timePickerInvalidTime');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-time-picker': CivTimePicker;
  }
}

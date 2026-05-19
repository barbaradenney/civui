// Schema: packages/schema/src/components/civ-time-picker.schema.ts

import { html, noChange, nothing } from 'lit';
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
import {
  formatTimeForDisplay,
  nearestSlot,
  parseFilterToMinutes,
  parseTimeToMinutes,
  type TimePickerFormat,
} from './time-utils.js';

// Side-effect imports register the child custom elements.
import '../select/civ-select.js';
import '../combobox/civ-combobox.js';
import '../text-input/civ-text-input.js';
import '@civui/controls/segmented-control';

export type { TimePickerFormat } from './time-utils.js';
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
   * Earliest allowed time, 24-hour `HH:MM`, or the literal string
   * `"now"` to resolve at render time to the device's current local
   * time (zero-padded). Combo mode only. Ignored in select mode (the
   * select shows the full 12- or 24-hour range).
   */
  @property({ type: String }) min = '';

  /**
   * Latest allowed time, 24-hour `HH:MM`, or the literal string
   * `"now"` (see `min`). Combo mode only.
   */
  @property({ type: String }) max = '';

  /**
   * Placeholder for the combo-mode input. Defaults to the locale-aware
   * `timePickerPlaceholder` (English: "e.g. 9:00 AM"). Ignored in
   * select mode.
   */
  @property({ type: String }) placeholder = '';

  /**
   * Show the "Now" quick-button. Defaults to false — opt in only on
   * forms where "current time" is a meaningful default (callback
   * scheduling, incident reports where now-ish times are common,
   * forward-looking appointment selection with `min="now"`). Most
   * scheduling forms don't need it; the slot picker is fast enough.
   */
  @property({ type: Boolean, attribute: 'show-now-button' }) showNowButton = false;

  /**
   * Override the "Now" button label. Defaults to the locale-aware
   * `timePickerNowButton` string ("Now" in English).
   */
  @property({ type: String, attribute: 'now-button-label' }) nowButtonLabel = '';


  /**
   * Combo-mode only: list of 24-hour `HH:MM` strings to render as
   * disabled (greyed, non-selectable) options in the dropdown. Useful
   * for appointment scheduling where some slots are already booked.
   *
   * Disabled slots still appear in the listbox (so users see them and
   * know to pick a neighbor), but click / keyboard activation is a
   * no-op and arrow navigation skips them. The "snap-to-nearest"
   * suggestion also avoids disabled slots — a typed "9:30" snaps past
   * a booked 9:30 to the closest available time.
   *
   * Slots are matched against the same 24-hour ISO values that the
   * combo dropdown emits. Out-of-grid entries (values not produced by
   * the current `minute-step`) are accepted; they simply have no
   * effect because no option exists to disable. The default is an
   * empty array (no slots disabled).
   *
   * @example
   * ```html
   * <civ-time-picker disabled-slots='["09:00","09:30","13:00"]'></civ-time-picker>
   * ```
   */
  @property({ type: Array, attribute: 'disabled-slots' }) disabledSlots: string[] = [];

  @state() private _hour = '';
  @state() private _minute = '';
  @state() private _period: 'AM' | 'PM' | '' = '';

  /**
   * True between a text-input keystroke (civ-input) and its commit
   * (civ-change on blur). While true, the host suppresses its own
   * push of the formatted display back into the text input — so the
   * user can keep typing without the DOM input.value being
   * overwritten with a normalized version of their partial input.
   * On blur, we resume pushing the formatted display so the field
   * shows the canonical "H:MM" / "HH:MM" form.
   */
  @state() private _textInputUserTyping = false;

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
    // Release any text-input typing-suppression — the reset wipes
    // the field, so the next render should freely push the cleared
    // display back to the DOM input.
    this._textInputUserTyping = false;
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
   * Slots whose ISO value appears in `disabledSlots` are marked
   * `disabled: true` so the combobox renders them as non-selectable.
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
    const minMinutes = this._resolveBoundMinutes(this.min);
    const maxMinutes = this._resolveBoundMinutes(this.max);
    const disabled = new Set(this.disabledSlots ?? []);
    const opts: ComboboxOption[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += step) {
        const total = h * 60 + m;
        if (minMinutes != null && total < minMinutes) continue;
        if (maxMinutes != null && total > maxMinutes) continue;
        const iso = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const opt: ComboboxOption = { value: iso, label: this._displayLabel(h, m) };
        if (disabled.has(iso)) opt.disabled = true;
        opts.push(opt);
      }
    }
    // Synthetic option: the consumer's `value` doesn't align with the
    // slot grid (e.g. value="14:37" with minute-step=15) or sits
    // outside min/max bounds. Insert it sorted by time so the dropdown
    // stays ordered. Synthetic options are never disabled — they
    // represent the current value, which has to remain visible /
    // selectable so the combobox can re-pick its own value.
    if (this.value && !opts.some((o) => o.value === this.value)) {
      const parsed = parseTimeToMinutes(this.value);
      if (parsed != null) {
        const h = Math.floor(parsed / 60);
        const m = parsed % 60;
        const synthetic: ComboboxOption = { value: this.value, label: this._displayLabel(h, m) };
        // Sort-insert by total minutes.
        let inserted = false;
        for (let i = 0; i < opts.length; i++) {
          const optMinutes = parseTimeToMinutes(opts[i].value);
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
   * Thin wrapper that injects the locale strings into the pure
   * `formatTimeForDisplay` helper. Lives on the component so callers
   * inside `render()` don't need to repeat the i18n lookup.
   */
  private _displayLabel(h: number, m: number): string {
    return formatTimeForDisplay(h, m, {
      format: this.format,
      amLabel: t('timePickerAm'),
      pmLabel: t('timePickerPm'),
      midnightLabel: t('timePickerMidnight'),
      noonLabel: t('timePickerNoon'),
    });
  }

  /**
   * Resolve a bound prop (`min` / `max`) to minutes-since-midnight.
   * Honors the literal `"now"` shorthand by snapping the device's
   * current local time to the active `minute-step` grid so the
   * resulting bound aligns with the dropdown slots — otherwise a
   * `min="now"` at 9:27 with a 15-min step would still surface the
   * (out-of-grid) 9:27 boundary and orphan the 9:30 slot. Other
   * unknown strings parse via the strict ISO parser, returning null.
   */
  private _resolveBoundMinutes(bound: string): number | null {
    if (bound === 'now') {
      const now = new Date();
      const step = this._effectiveMinuteStep();
      const snapped = Math.round(now.getMinutes() / step) * step;
      const h = (now.getHours() + (snapped === 60 ? 1 : 0)) % 24;
      const m = snapped === 60 ? 0 : snapped;
      return h * 60 + m;
    }
    return parseTimeToMinutes(bound);
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
    // Deliberately NO `name` on the inner combobox. The host
    // civ-time-picker IS the form-participant for this control; if
    // the combobox carries the same name, both elements appear as
    // `data-civ-form-field` entries with the same key, and
    // civ-form.getFormData() / toFormData() iterate both — producing
    // a duplicate entry in the submitted FormData (text and select
    // modes don't have this because their children carry suffixed
    // names like `${name}-hour`). Skipping the name on the combobox
    // makes the inner element invisible to form iteration while
    // still preserving its internal ElementInternals + value state.
    return html`
      <civ-combobox
        label="${label}"
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
   * Opt-in via `show-now-button`. Disabled with the host.
   */
  private _renderNowButton() {
    if (!this.showNowButton || this.readonly) return nothing;
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
    // edge rather than producing an out-of-range value. Then walk
    // past any disabled slots — if "now" lands on a booked
    // appointment, advance to the next available slot rather than
    // committing a value the user can't re-select.
    if (this.mode === 'combo') {
      const minMin = this._resolveBoundMinutes(this.min);
      const maxMin = this._resolveBoundMinutes(this.max);
      let total = h * 60 + m;
      if (minMin != null && total < minMin) total = minMin;
      if (maxMin != null && total > maxMin) total = maxMin;
      h = Math.floor(total / 60);
      m = total % 60;

      const disabled = new Set(this.disabledSlots ?? []);
      if (disabled.size > 0) {
        const step = this._effectiveMinuteStep();
        // Walk forward by step looking for the next enabled slot
        // inside the allowed range. If everything from "now" to
        // max (or end-of-day) is disabled, fall back to the clamped
        // (disabled) value — `value` still shows it, the user just
        // has to manually pick a neighbor.
        const dayEnd = 24 * 60 - step;
        const upperBound = maxMin != null ? Math.min(maxMin, dayEnd) : dayEnd;
        const isoFor = (mins: number) =>
          `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
        let candidate = total;
        while (candidate <= upperBound && disabled.has(isoFor(candidate))) {
          candidate += step;
        }
        if (candidate <= upperBound && !disabled.has(isoFor(candidate))) {
          h = Math.floor(candidate / 60);
          m = candidate % 60;
        }
      }
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
   * Disabled slots are skipped (via `nearestSlot`), so a snap past a
   * booked time lands on the closest available neighbor instead.
   *
   * Returns `[]` when the typed filter can't be parsed as a partial
   * time (pure letters, gibberish, empty after digit-stripping) —
   * civ-combobox then shows its standard "No results found" message.
   */
  private _nearestSlotSuggestion(filter: string): ComboboxOption[] {
    const minutes = parseFilterToMinutes(filter, this.format);
    if (minutes == null) return [];
    const opts = this._comboOptions();
    const nearest = nearestSlot(opts, minutes);
    return nearest ? [nearest] : [];
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
    // The displayed value uses a real colon separator with NO leading
    // zero on the hour ("2:36", "12:34"). We previously fed raw 4-digit
    // strings ("0236") through a `##:##` mask, but that mask formats
    // positionally — so 3-digit input either:
    //   - gets left-padded ("0236" → "02:36", leading zero the user
    //     never typed), OR
    //   - feeds the mask unpadded ("236" → "23:6", positionally wrong
    //     for time semantics: minute should be the LAST two digits).
    // Neither produces the natural "2:36" the user expects. Dropping
    // the mask and computing the display string ourselves resolves
    // both problems.
    //
    // Minute is shown as-is (no padStart) so a partial "2:3" stays
    // "2:3" while the user types — padding to "2:03" would change
    // the user's intended minute mid-keystroke. Server-provided
    // values already arrive zero-padded through `_parseValue`.
    const displayValue = this._hour && this._minute
      ? `${this._hour}:${this._minute}`
      : this._hour || '';

    // Skip the .value binding while the user is actively typing.
    // Without this, every keystroke fires civ-input → host re-renders
    // → Lit's template binding overwrites the DOM input.value with our
    // computed display string. For "236", that turns "236" into "2:36"
    // immediately and bounces the cursor — disruptive mid-type. On
    // blur (civ-change), we clear the flag so the formatted display
    // flows back into the field.
    const valueBinding = this._textInputUserTyping ? noChange : displayValue;

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
              maxlength="5"
              placeholder="${placeholder}"
              .value="${valueBinding}"
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

    // Required-mark routing (mirrors text mode). When `legend` is
    // explicitly set, the visible legend carries the marker and
    // children suppress theirs (single visible marker). When only
    // the fallback "Time" legend is rendered (sr-only), the marker
    // on the legend is invisible to sighted users — so children
    // render the marker on their own labels instead. Without this,
    // a required time-picker with no user-supplied legend renders
    // no visible "(required)" indicator anywhere — an accessibility
    // bug for sighted users who rely on the marker.
    const legendIsVisible = !!this.legend;
    const markerOnLegend = legendIsVisible && !this.hideRequiredIndicator && this.required;
    const hideMarkerOnChildren = legendIsVisible || this.hideRequiredIndicator;

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
            ?hide-required-indicator="${hideMarkerOnChildren}"
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
            ?hide-required-indicator="${hideMarkerOnChildren}"
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
      // Text mode: parse the user's typed value. Two shapes accepted:
      //  - colon-separated ("2:36", "12:34", "12:") — use the colon
      //    as the explicit hour/minute boundary so "12:3" stays as
      //    h=12, m=3 (partial), not h=1, m=23.
      //  - digit-only ("236", "1234") — infer the split by length:
      //    3 digits = H + MM, 4 digits = HH + MM. Matches the typing
      //    convention where the LAST two digits are always minutes.
      // Shorter inputs leave _minute empty so _assembleValue returns
      // "" (partial input is incomplete, not invalid).
      const textInput = this.querySelector(
        `civ-text-input[name="${baseName ? `${baseName}-time` : 'time'}"]`,
      ) as (HTMLElement & { value: string }) | null;
      const rawInput = textInput?.value ?? '';
      if (!rawInput) {
        this._hour = '';
        this._minute = '';
        return;
      }
      let h: string, m: string;
      if (rawInput.includes(':')) {
        const parts = rawInput.split(':');
        h = (parts[0] || '').replace(/\D/g, '');
        m = (parts[1] || '').replace(/\D/g, '');
      } else {
        const cleaned = rawInput.replace(/\D/g, '');
        if (cleaned.length <= 2) {
          h = cleaned;
          m = '';
        } else if (cleaned.length === 3) {
          h = cleaned[0];
          m = cleaned.slice(1);
        } else {
          h = cleaned.slice(0, 2);
          m = cleaned.slice(2, 4);
        }
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
    // Mark text-mode typing so the host stops echoing a re-formatted
    // display string back into the DOM input mid-keystroke. The flag
    // is cleared on civ-change (blur), letting the canonical "H:MM"
    // display flow back in.
    const target = e.target as HTMLElement;
    if (this.mode === 'text' && target?.tagName === 'CIV-TEXT-INPUT') {
      this._textInputUserTyping = true;
    }
    // Suppress the child's event from reaching consumer listeners on
    // this host — they should only see the parent's assembled event.
    e.stopImmediatePropagation();
    this._updateFromChildren(false);
  }

  private _onFieldChange(e: CustomEvent): void {
    if (e.target === this) return;
    if (this.mode === 'combo') return;
    // Text input committed (blur). Release the typing-suppression flag
    // so the next render writes the formatted display back into the
    // DOM input.
    const target = e.target as HTMLElement;
    if (this.mode === 'text' && target?.tagName === 'CIV-TEXT-INPUT') {
      this._textInputUserTyping = false;
    }
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
   * Diagnose an unambiguously-wrong text-mode commit. Returns a
   * localized error message when:
   *   - the user typed at least 3 digits (HMM or HHMM — "looks
   *     complete"), AND
   *   - `_assembleValue()` returned "" because of a real range error
   *     (hour > 12 in 12-hour, hour > 23 in 24-hour, minute > 59)
   *
   * Intentionally does NOT surface a "Missing period" error for the
   * common case where the user typed valid digits but hasn't picked
   * AM/PM yet. The text input's civ-change fires the moment focus
   * leaves the field — including when the user is on their way to
   * click the AM/PM segmented control. Yelling "Select AM or PM" in
   * that fraction-of-a-second between text-input blur and the
   * AM/PM click would flash an error during the exact gesture the
   * user is performing. Missing period is instead caught by required
   * validation on form submit.
   *
   * Returns `''` when there's no error to surface (still typing,
   * assembly succeeded, missing period, etc.).
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
      // Missing-period state is incomplete, not invalid. Don't flash
      // an error while the user is mid-gesture to pick AM/PM.
      return '';
    }
    if (!Number.isFinite(h) || h < 0 || h > 23) {
      return t('timePickerInvalidHour24');
    }
    return '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-time-picker': CivTimePicker;
  }
}

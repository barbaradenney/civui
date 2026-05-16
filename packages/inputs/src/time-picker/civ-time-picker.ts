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
} from '@civui/core';

// Side-effect imports register the child custom elements.
import '../select/civ-select.js';

export type TimePickerFormat = '12' | '24';

/**
 * CivUI Time Picker
 *
 * Self-contained time input rendered as three selects: hour, minute,
 * and AM/PM (12-hour mode only). The component always stores its
 * value in 24-hour ISO format (`HH:MM`) — the format prop controls
 * the display, not the storage.
 *
 * Use this for appointment scheduling, hearing times, and any other
 * "time of day" prompt. For known dates use `civ-memorable-date`, for
 * future dates use `civ-date-picker`.
 *
 * @element civ-time-picker
 *
 * @prop {string} legend - Fieldset legend rendered above the fields
 * @prop {string} name - Base form field name (sub-fields named {name}-hour, {name}-minute, {name}-period)
 * @prop {string} value - Time value in 24-hour ISO format (HH:MM); empty when unset
 * @prop {string} format - Display format: '12' (default, with AM/PM) or '24'
 * @prop {number} minuteStep - Increment for the minute select. Defaults to 5; use 1 for fine-grained selection or 15/30 for coarser steps.
 *
 * @fires civ-input - When any sub-field changes, detail: { value, hour, minute, period }
 * @fires civ-change - When any sub-field commits, detail: { value, hour, minute, period }
 * @fires civ-analytics - Analytics tracking on change
 */
@customElement('civ-time-picker')
export class CivTimePicker extends LegendHeadingMixin(CivFormElement) {
  @property({ type: String }) legend = '';
  @property({ type: String }) format: TimePickerFormat = '12';
  @property({ type: Number, attribute: 'minute-step' }) minuteStep = 5;
  @property({ type: String, attribute: 'hour-label' }) hourLabel = '';
  @property({ type: String, attribute: 'minute-label' }) minuteLabel = '';
  @property({ type: String, attribute: 'period-label' }) periodLabel = '';

  @state() private _hour = '';
  @state() private _minute = '';
  @state() private _period: 'AM' | 'PM' | '' = '';

  private _boundFieldInput = this._onFieldInput.bind(this);
  private _boundFieldChange = this._onFieldChange.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this._parseValue();
    this.addEventListener('civ-input', this._boundFieldInput as EventListener);
    this.addEventListener('civ-change', this._boundFieldChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-input', this._boundFieldInput as EventListener);
    this.removeEventListener('civ-change', this._boundFieldChange as EventListener);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('value') && !changed.has('_hour')) {
      this._parseValue();
    }
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

  private get _minuteOptions(): { value: string; label: string }[] {
    const step = this.minuteStep > 0 ? Math.floor(this.minuteStep) : 5;
    const opts: { value: string; label: string }[] = [];
    for (let m = 0; m < 60; m += step) {
      const s = String(m).padStart(2, '0');
      opts.push({ value: s, label: s });
    }
    return opts;
  }

  private get _periodOptions(): { value: string; label: string }[] {
    return [
      { value: 'AM', label: t('timePickerAm') },
      { value: 'PM', label: t('timePickerPm') },
    ];
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
    const selects = this.querySelectorAll('civ-select') as NodeListOf<HTMLElement & { disabled: boolean }>;
    selects.forEach((s) => { s.disabled = disabled; });
  }

  override render() {
    const hourLabel = this.hourLabel || t('timePickerHourLabel');
    const minuteLabel = this.minuteLabel || t('timePickerMinuteLabel');
    const periodLabel = this.periodLabel || t('timePickerPeriodLabel');
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

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
            .options="${this._minuteOptions}"
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
                <civ-select
                  label="${periodLabel}"
                  name="${this.name ? `${this.name}-period` : 'period'}"
                  .options="${this._periodOptions}"
                  .value="${this._period}"
                  ?required="${this.required}"
                  ?disabled="${this.disabled}"
                  ?hide-required-indicator="${this.required}"
                  disable-analytics
                ></civ-select>
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
        ${this.legend
          ? renderFormHeader({
              label: renderLegend({
                legend: this.legend,
                required: this.required,
                showRequired: !this.hideRequiredIndicator && this.required,
                headingLevel: this.headingLevel,
                size: this.size,
              }),
              hintId: this._hintId,
              hint: this.hint,
              errorId: this._errorId,
              error: this.error,
              fieldset: true,
            })
          : nothing}
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
    const periodSel = this.querySelector(
      `civ-select[name="${baseName ? `${baseName}-period` : 'period'}"]`,
    ) as (HTMLElement & { value: string }) | null;

    if (hourSel) this._hour = hourSel.value || '';
    if (minuteSel) this._minute = minuteSel.value || '';
    if (periodSel) this._period = (periodSel.value as 'AM' | 'PM' | '') || '';
  }

  private _onFieldInput(e: CustomEvent): void {
    if (e.target === this) return;
    // Suppress the child's event from reaching consumer listeners on
    // this host — they should only see the parent's assembled event.
    e.stopImmediatePropagation();
    this._updateFromChildren(false);
  }

  private _onFieldChange(e: CustomEvent): void {
    if (e.target === this) return;
    e.stopImmediatePropagation();
    this._updateFromChildren(true);
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

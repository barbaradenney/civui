import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, interpolate, t } from '@civui/core';
import '../date-picker/civ-date-picker.js';

export interface DateRangeValue {
  start: string;
  end: string;
}

const EMPTY_RANGE: DateRangeValue = { start: '', end: '' };

/** ISO yyyy-mm-dd → midnight UTC Date. Returns null on bad input. */
function parseISO(iso: string): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return isNaN(d.getTime()) ? null : d;
}

/** Inclusive day-count between two ISO dates (start..end). 0 if either is missing. */
function daysBetween(startIso: string, endIso: string): number {
  const a = parseISO(startIso);
  const b = parseISO(endIso);
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/**
 * CivUI Date Range Picker
 *
 * Composed from two `civ-date-picker` instances. Cross-binds their `min`/`max`
 * so the end picker can never go before the start (and vice versa), surfaces a
 * single `civ-change` event with `{ start, end }`, and writes two FormData
 * fields on form submit: `${name}.start` and `${name}.end`.
 *
 * @element civ-date-range-picker
 *
 * @prop {string} legend - Fieldset legend
 * @prop {string} name - Base form-data key. Submits as `${name}.start` and `${name}.end`
 * @prop {string} value - JSON `{ start, end }` for declarative initialization
 * @prop {string} min - Outer lower bound (ISO yyyy-mm-dd)
 * @prop {string} max - Outer upper bound (ISO yyyy-mm-dd)
 * @prop {number} minRangeDays - Inclusive minimum duration in days
 * @prop {number} maxRangeDays - Inclusive maximum duration in days
 * @prop {string} startLabel - Override label on the start picker
 * @prop {string} endLabel - Override label on the end picker
 * @prop {string} startHint - Hint text under the start picker
 * @prop {string} endHint - Hint text under the end picker
 * @prop {string} startError - Field-level error for the start picker
 * @prop {string} endError - Field-level error for the end picker
 * @prop {string} locale - Forwarded to both pickers
 * @prop {number} weekStartsOn - Forwarded to both pickers
 *
 * @fires civ-input - On every value change, detail: { value: { start, end } }
 * @fires civ-change - On committed value change, detail: { value: { start, end } }
 *
 * @example
 * ```html
 * <civ-date-range-picker
 *   legend="Stay dates"
 *   name="trip"
 *   min="2026-01-01"
 *   max="2026-12-31"
 *   min-range-days="2"
 *   max-range-days="30"
 *   required
 * ></civ-date-range-picker>
 * ```
 */
@customElement('civ-date-range-picker')
export class CivDateRangePicker extends CivFormElement {
  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /** Outer lower bound (ISO yyyy-mm-dd). */
  @property({ type: String }) min = '';

  /** Outer upper bound (ISO yyyy-mm-dd). */
  @property({ type: String }) max = '';

  /** Inclusive minimum range duration in days. 0 disables the check. */
  @property({ type: Number, attribute: 'min-range-days' }) minRangeDays = 0;

  /** Inclusive maximum range duration in days. 0 disables the check. */
  @property({ type: Number, attribute: 'max-range-days' }) maxRangeDays = 0;

  /** Override label on the start picker. */
  @property({ type: String, attribute: 'start-label' }) startLabel = '';

  /** Override label on the end picker. */
  @property({ type: String, attribute: 'end-label' }) endLabel = '';

  /** Hint text under the start picker. */
  @property({ type: String, attribute: 'start-hint' }) startHint = '';

  /** Hint text under the end picker. */
  @property({ type: String, attribute: 'end-hint' }) endHint = '';

  /** Field-level error for the start picker. */
  @property({ type: String, attribute: 'start-error' }) startError = '';

  /** Field-level error for the end picker. */
  @property({ type: String, attribute: 'end-error' }) endError = '';

  /** Forwarded to both pickers. */
  @property({ type: String }) locale = 'en-US';

  /** Forwarded to both pickers. */
  @property({ type: Number, attribute: 'week-starts-on' }) weekStartsOn = 0;

  @state() private _range: DateRangeValue = { ...EMPTY_RANGE };
  /** Tracks whether the cross-field error was set by us so we can clear it cleanly. */
  private _ownsRangeError = false;

  /** Read the current range as a structured object. */
  get rangeValue(): DateRangeValue {
    return { ...this._range };
  }

  /** Set the range from a structured object. */
  set rangeValue(val: DateRangeValue) {
    this._range = { start: val.start || '', end: val.end || '' };
    this.value = JSON.stringify(this._range);
    this.requestUpdate();
  }

  override firstUpdated(): void {
    super.firstUpdated();
    if (this.value) {
      try {
        const parsed = JSON.parse(this.value);
        this._range = { start: parsed.start || '', end: parsed.end || '' };
      } catch { /* leave empty */ }
    }
  }

  /** End picker's effective `min` is the later of `start value` and `min`. */
  private get _effectiveEndMin(): string {
    const start = this._range.start;
    if (start && this.min) return start > this.min ? start : this.min;
    return start || this.min;
  }

  /** Start picker's effective `max` is the earlier of `end value` and `max`. */
  private get _effectiveStartMax(): string {
    const end = this._range.end;
    if (end && this.max) return end < this.max ? end : this.max;
    return end || this.max;
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const startLabel = this.startLabel || t('dateRangeStartLabel');
    const endLabel = this.endLabel || t('dateRangeEndLabel');

    return html`
      <fieldset class="civ-fieldset" aria-describedby="${describedBy || nothing}">
        ${renderLegend({ legend: this.legend, required: this.required && !this.hideRequiredIndicator })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}

        <div class="civ-flex civ-flex-col civ-gap-4 sm:civ-flex-row sm:civ-items-start">
          <civ-date-picker
            data-civ-range-start
            label="${startLabel}"
            name="${this.name ? `${this.name}.start` : ''}"
            value="${this._range.start}"
            min="${this.min || nothing}"
            max="${this._effectiveStartMax || nothing}"
            hint="${this.startHint}"
            error="${this.startError}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            locale="${this.locale}"
            week-starts-on="${this.weekStartsOn}"
            @civ-input="${this._onStartInput}"
            @civ-change="${this._onStartChange}"
          ></civ-date-picker>
          <civ-date-picker
            data-civ-range-end
            label="${endLabel}"
            name="${this.name ? `${this.name}.end` : ''}"
            value="${this._range.end}"
            min="${this._effectiveEndMin || nothing}"
            max="${this.max || nothing}"
            hint="${this.endHint}"
            error="${this.endError}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            locale="${this.locale}"
            week-starts-on="${this.weekStartsOn}"
            @civ-input="${this._onEndInput}"
            @civ-change="${this._onEndChange}"
          ></civ-date-picker>
        </div>
      </fieldset>
    `;
  }

  private _onStartInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._range = { ...this._range, start: e.detail.value };
    this._afterChange('input');
  }

  private _onStartChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._range = { ...this._range, start: e.detail.value };
    this._afterChange('change');
  }

  private _onEndInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._range = { ...this._range, end: e.detail.value };
    this._afterChange('input');
  }

  private _onEndChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._range = { ...this._range, end: e.detail.value };
    this._afterChange('change');
  }

  /**
   * After either child changes: refresh JSON value, sync the form,
   * run cross-field validation, and re-emit a unified event.
   */
  private _afterChange(kind: 'input' | 'change'): void {
    this.value = JSON.stringify(this._range);
    this._validateRange();
    this._syncFormValue();
    const detail = { value: { ...this._range } };
    dispatch(this, kind === 'input' ? 'civ-input' : 'civ-change', detail);
  }

  /**
   * Cross-field range checks. Sets/clears the host-level `error` so the form
   * error summary picks it up. Per-picker bounds (min/max) are enforced by
   * each civ-date-picker independently — we don't duplicate that here.
   */
  private _validateRange(): void {
    const { start, end } = this._range;
    let msg = '';
    if (start && end) {
      if (end < start) {
        msg = t('dateRangeEndBeforeStartError');
      } else if (this.minRangeDays > 0) {
        const days = daysBetween(start, end);
        if (days < this.minRangeDays) {
          msg = interpolate(t('dateRangeMinRangeError'), { count: this.minRangeDays });
        }
      }
      if (!msg && this.maxRangeDays > 0) {
        const days = daysBetween(start, end);
        if (days > this.maxRangeDays) {
          msg = interpolate(t('dateRangeMaxRangeError'), { count: this.maxRangeDays });
        }
      }
    }

    if (msg) {
      this.error = msg;
      this._ownsRangeError = true;
    } else if (this._ownsRangeError) {
      this.error = '';
      this._ownsRangeError = false;
    }
  }

  protected override _syncFormValue(): void {
    if (!this.name) {
      this.updateFormValue(null);
      return;
    }
    const fd = new FormData();
    fd.append(`${this.name}.start`, this._range.start);
    fd.append(`${this.name}.end`, this._range.end);
    this.updateFormValue(fd);
  }

  /** A range is complete when both endpoints are filled. */
  private _isComplete(): boolean {
    return !!(this._range.start && this._range.end);
  }

  protected override _updateValidity(): void {
    if (this.required && !this._isComplete()) {
      const label = this.legend || this.label || t('fieldFallbackLabel');
      const anchor = this.querySelector('input') as HTMLElement | null;
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label }),
        anchor ?? undefined,
      );
      return;
    }
    if (this.error) {
      const anchor = this.querySelector('input') as HTMLElement | null;
      this._setValidity({ customError: true }, this.error, anchor ?? undefined);
      return;
    }
    this._setValidity({});
  }

  override formResetCallback(): void {
    this._range = { ...EMPTY_RANGE };
    this.value = '';
    this.error = '';
    this.startError = '';
    this.endError = '';
    this._ownsRangeError = false;
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-date-range-picker': CivDateRangePicker;
  }
}

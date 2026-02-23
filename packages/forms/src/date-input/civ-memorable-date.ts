import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, getMonthNames, interpolate, parseISODate, renderLegend, renderHint, renderError } from '@civui/core';

// Import child components
import '../select/civ-select.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Memorable Date
 *
 * Three-field date input (month select + day + year text inputs)
 * wrapped in a fieldset. Composes civ-select and civ-text-input.
 * Outputs value in YYYY-MM-DD format.
 *
 * @element civ-memorable-date
 *
 * @prop {string} legend - Fieldset legend text
 * @prop {string} name - Base form field name (fields named {name}-month, {name}-day, {name}-year)
 * @prop {string} value - Date value in YYYY-MM-DD format
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {boolean} required - Whether the date is required
 * @prop {boolean} disabled - Whether the fields are disabled
 *
 * @fires civ-input - When any date field changes, detail: { value, month, day, year }
 * @fires civ-change - When any date field changes, detail: { value, month, day, year }
 */
@customElement('civ-memorable-date')
export class CivMemorableDate extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: String, attribute: 'month-label' }) monthLabel = 'Month';
  @property({ type: String, attribute: 'day-label' }) dayLabel = 'Day';
  @property({ type: String, attribute: 'year-label' }) yearLabel = 'Year';
  @property({ type: String, attribute: 'month-empty-label' }) monthEmptyLabel = '- Month -';
  @property({ type: String, attribute: 'day-placeholder' }) dayPlaceholder = 'DD';
  @property({ type: String, attribute: 'year-placeholder' }) yearPlaceholder = 'YYYY';
  @property({ type: String, attribute: 'date-set-message' }) dateSetMessage = 'Date set to {date}';
  @property({ type: String, attribute: 'invalid-date-message' }) invalidDateMessage = 'Enter a valid date';
  @property({ type: String }) locale = 'en-US';

  @state() private _month = '';
  @state() private _day = '';
  @state() private _year = '';

  private _legendId = this.generateId('legend');
  private _boundFieldChange = this._onFieldChange.bind(this);
  private _cachedLocale = '';
  private _cachedMonthOptions: { value: string; label: string }[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._parseValue();
    this.addEventListener('civ-input', this._boundFieldChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-input', this._boundFieldChange as EventListener);
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate(changed);
    if (changed.has('legend')) {
      this.label = this.legend;
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('value') && !changed.has('_month')) {
      this._parseValue();
    }
  }

  private _parseValue(): void {
    if (!this.value) return;
    const parts = this.value.split('-');
    if (parts.length === 3) {
      this._year = parts[0];
      this._month = parts[1];
      this._day = parts[2];
    }
  }

  private _assembleValue(): string {
    if (this._year && this._month && this._day) {
      const assembled = `${this._year.padStart(4, '0')}-${this._month.padStart(2, '0')}-${this._day.padStart(2, '0')}`;
      // Validate the assembled date is a real date (e.g., not Feb 30)
      if (!parseISODate(assembled)) {
        return '';
      }
      return assembled;
    }
    return '';
  }

  private get _monthOptions(): { value: string; label: string }[] {
    if (this._cachedLocale !== this.locale) {
      this._cachedLocale = this.locale;
      const names = getMonthNames(this.locale);
      this._cachedMonthOptions = names.map((label, i) => ({
        value: String(i + 1).padStart(2, '0'),
        label,
      }));
    }
    return this._cachedMonthOptions;
  }

  override formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this._syncChildDisabled();
  }

  private _syncChildDisabled(): void {
    if (!this.disabled) return;
    const select = this.querySelector('civ-select') as HTMLElement & { disabled: boolean } | null;
    if (select) select.disabled = true;
    (this.querySelectorAll('civ-text-input') as NodeListOf<HTMLElement & { disabled: boolean }>).forEach((input) => {
      input.disabled = true;
    });
  }

  override render() {
    return html`
      <fieldset
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
      >
        ${renderLegend({ legend: this.legend, required: this.required, legendId: this._legendId })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
        <div class="civ-flex civ-gap-4 civ-items-end" data-civ-memorable-date>
          <div class="civ-w-40">
            <civ-select
              label="${this.monthLabel}"
              name="${this.name ? `${this.name}-month` : 'month'}"
              .options="${this._monthOptions}"
              .value="${this._month}"
              empty-label="${this.monthEmptyLabel}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              disable-analytics
            ></civ-select>
          </div>
          <div class="civ-w-20">
            <civ-text-input
              label="${this.dayLabel}"
              name="${this.name ? `${this.name}-day` : 'day'}"
              type="text"
              inputmode="numeric"
              .value="${this._day}"
              placeholder="${this.dayPlaceholder}"
              pattern="[0-9]*"
              maxlength="2"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              disable-analytics
            ></civ-text-input>
          </div>
          <div class="civ-w-24">
            <civ-text-input
              label="${this.yearLabel}"
              name="${this.name ? `${this.name}-year` : 'year'}"
              type="text"
              inputmode="numeric"
              .value="${this._year}"
              placeholder="${this.yearPlaceholder}"
              pattern="[0-9]*"
              maxlength="4"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              disable-analytics
            ></civ-text-input>
          </div>
        </div>
      </fieldset>
    `;
  }

  private _onFieldChange(e: Event): void {
    // Only handle events from child components, not re-dispatched ones
    if (e.target === this) return;
    e.stopPropagation();

    // Read values from child components
    const monthSelect = this.querySelector('civ-select') as any;
    const inputs = this.querySelectorAll('civ-text-input');
    const dayInput = inputs[0] as any;
    const yearInput = inputs[1] as any;

    if (monthSelect) this._month = monthSelect.value || '';
    if (dayInput) this._day = dayInput.value || '';
    if (yearInput) this._year = yearInput.value || '';

    const assembled = this._assembleValue();

    // If all fields are filled but the date is invalid, show error
    if (this._year && this._month && this._day && !assembled) {
      this.error = this.invalidDateMessage;
      this.value = '';
      this.updateFormValue('');
      const detail = { value: '', month: this._month, day: this._day, year: this._year };
      dispatch(this, 'civ-input', detail);
      dispatch(this, 'civ-change', detail);
      return;
    }

    this.value = assembled;
    this.updateFormValue(this.value);
    if (this.value) this.error = '';

    const detail = {
      value: this.value,
      month: this._month,
      day: this._day,
      year: this._year,
    };
    dispatch(this, 'civ-input', detail);
    dispatch(this, 'civ-change', detail);
    this.sendAnalytics('change');
    if (this.value) {
      this.announce(interpolate(this.dateSetMessage, { date: `${this._month}/${this._day}/${this._year}` }));
    }
  }

  override formResetCallback(): void {
    this._month = '';
    this._day = '';
    this._year = '';
    this.value = '';
    this.error = '';
    this.updateFormValue('');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-memorable-date': CivMemorableDate;
  }
}

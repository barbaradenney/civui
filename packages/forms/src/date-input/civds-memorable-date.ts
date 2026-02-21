import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivdsFormElement, getMonthNames, interpolate } from '@civds/core';

// Import child components
import '../select/civds-select.js';
import '../text-input/civds-text-input.js';

/**
 * CivDS Memorable Date
 *
 * Three-field date input (month select + day + year text inputs)
 * wrapped in a fieldset. Composes civds-select and civds-text-input.
 * Outputs value in YYYY-MM-DD format.
 *
 * @element civds-memorable-date
 *
 * @prop {string} legend - Fieldset legend text
 * @prop {string} name - Base form field name (fields named {name}-month, {name}-day, {name}-year)
 * @prop {string} value - Date value in YYYY-MM-DD format
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {boolean} required - Whether the date is required
 * @prop {boolean} disabled - Whether the fields are disabled
 *
 * @fires civds-change - When any date field changes, with assembled YYYY-MM-DD value
 */
@customElement('civds-memorable-date')
export class CivdsMemorableDate extends CivdsFormElement {
  @property({ type: String }) legend = '';
  @property({ type: String, attribute: 'month-label' }) monthLabel = 'Month';
  @property({ type: String, attribute: 'day-label' }) dayLabel = 'Day';
  @property({ type: String, attribute: 'year-label' }) yearLabel = 'Year';
  @property({ type: String, attribute: 'month-empty-label' }) monthEmptyLabel = '- Month -';
  @property({ type: String, attribute: 'day-placeholder' }) dayPlaceholder = 'DD';
  @property({ type: String, attribute: 'year-placeholder' }) yearPlaceholder = 'YYYY';
  @property({ type: String, attribute: 'date-set-message' }) dateSetMessage = 'Date set to {date}';
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
    this.addEventListener('civds-change', this._boundFieldChange as EventListener);
    this.addEventListener('civds-input', this._boundFieldChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civds-change', this._boundFieldChange as EventListener);
    this.removeEventListener('civds-input', this._boundFieldChange as EventListener);
  }

  override updated(changed: Map<string, unknown>): void {
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
      return `${this._year.padStart(4, '0')}-${this._month.padStart(2, '0')}-${this._day.padStart(2, '0')}`;
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

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset
        class="civds-border-0 civds-p-0 civds-m-0 civds-mb-4"
        aria-describedby="${describedBy || nothing}"
      >
        ${this.legend
          ? html`
              <legend
                class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base"
                id="${this._legendId}"
              >
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-2 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="civds-flex civds-gap-4 civds-items-end" data-civds-memorable-date>
          <div class="civds-w-40">
            <civds-select
              label="${this.monthLabel}"
              name="${this.name ? `${this.name}-month` : 'month'}"
              .options="${this._monthOptions}"
              .value="${this._month}"
              empty-label="${this.monthEmptyLabel}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              disable-analytics
            ></civds-select>
          </div>
          <div class="civds-w-20">
            <civds-text-input
              label="${this.dayLabel}"
              name="${this.name ? `${this.name}-day` : 'day'}"
              type="number"
              .value="${this._day}"
              placeholder="${this.dayPlaceholder}"
              maxlength="2"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              disable-analytics
            ></civds-text-input>
          </div>
          <div class="civds-w-24">
            <civds-text-input
              label="${this.yearLabel}"
              name="${this.name ? `${this.name}-year` : 'year'}"
              type="number"
              .value="${this._year}"
              placeholder="${this.yearPlaceholder}"
              maxlength="4"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              disable-analytics
            ></civds-text-input>
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
    const monthSelect = this.querySelector('civds-select') as any;
    const inputs = this.querySelectorAll('civds-text-input');
    const dayInput = inputs[0] as any;
    const yearInput = inputs[1] as any;

    if (monthSelect) this._month = monthSelect.value || '';
    if (dayInput) this._day = dayInput.value || '';
    if (yearInput) this._year = yearInput.value || '';

    this.value = this._assembleValue();
    this.updateFormValue(this.value);

    this.dispatchEvent(
      new CustomEvent('civds-change', {
        detail: {
          value: this.value,
          month: this._month,
          day: this._day,
          year: this._year,
        },
        bubbles: true,
        composed: true,
      }),
    );
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
    this.dispatchEvent(new CustomEvent('civds-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-memorable-date': CivdsMemorableDate;
  }
}

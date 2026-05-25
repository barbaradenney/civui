// Schema: packages/schema/src/components/civ-income.schema.ts

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CivCompoundElement,
  LegendHeadingMixin,
  buildDescribedBy,
  renderFormHeader,
  renderLegend,
  t,
} from '@civui/core';

// Side-effect imports register child custom elements.
import '@civui/inputs/currency';
import '@civui/inputs/select';

export type IncomeFrequency =
  | ''
  | 'weekly'
  | 'biweekly'
  | 'semimonthly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'one-time';

export interface IncomeValue {
  amount: string;
  frequency: IncomeFrequency;
}

const EMPTY_INCOME: IncomeValue = { amount: '', frequency: '' };

/**
 * CivUI Income
 *
 * Compound field for dollar amount + pay frequency. Pairs `civ-currency`
 * (dollar input with mask + validation) with `civ-select` (frequency)
 * inside a single `<fieldset>`. Use for any means-tested benefit
 * application (income reporting, household income, expense estimates,
 * support payments).
 *
 * Value shape: `{ amount: string, frequency: IncomeFrequency }`. The
 * compound serializes its state to JSON in `value`; sub-fields are also
 * exposed as `${name}.amount` and `${name}.frequency` form values.
 *
 * @element civ-income
 *
 * @prop {string} legend - Fieldset legend rendered above the sub-fields
 * @prop {string} name - Base form field name; sub-fields named `${name}.amount` and `${name}.frequency`
 * @prop {string} amountLabel - Override the default amount label
 * @prop {string} frequencyLabel - Override the default frequency label
 * @prop {string[]} frequencies - Restrict the available frequency options. Defaults to all seven.
 *
 * @fires civ-input - On every sub-field change, detail: { value: IncomeValue }
 * @fires civ-change - On committed sub-field change, detail: { value: IncomeValue }
 */
@customElement('civ-income')
export class CivIncome extends LegendHeadingMixin(CivCompoundElement) {
  protected override _empty: IncomeValue = { ...EMPTY_INCOME };

  @property({ type: String }) legend = '';
  @property({ type: String, attribute: 'amount-label' }) amountLabel = '';
  @property({ type: String, attribute: 'frequency-label' }) frequencyLabel = '';
  @property({ type: String, attribute: 'amount-error' }) amountError = '';
  @property({ type: String, attribute: 'frequency-error' }) frequencyError = '';

  /**
   * Restrict the available frequency options. Order is preserved. Pass
   * a JSON array literal in HTML, or set as a property in JS:
   *
   *   `<civ-income frequencies='["weekly","monthly"]'>`
   */
  // Seven built-in frequencies; consumers can restrict the list with
  // `frequencies='["weekly","monthly"]'` (HTML JSON attribute) or by
  // setting the property in JS.
  @property({ type: Array }) frequencies: IncomeFrequency[] = [
    'weekly',
    'biweekly',
    'semimonthly',
    'monthly',
    'quarterly',
    'annually',
    'one-time',
  ];

  @state() protected override _data: IncomeValue = { ...EMPTY_INCOME };

  get incomeValue(): IncomeValue {
    return { ...this._data };
  }

  set incomeValue(val: IncomeValue) {
    this._data = { ...val };
    this.value = JSON.stringify(this._data);
  }

  private _frequencyOptions(): { value: string; label: string }[] {
    return this.frequencies.map((f) => ({
      value: f,
      label: t(`incomeFrequency_${f}` as Parameters<typeof t>[0]),
    }));
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const amountLabel = this.amountLabel || t('incomeAmountLabel');
    const frequencyLabel = this.frequencyLabel || t('incomeFrequencyLabel');

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({
          label: renderLegend({
            legend: this.legend || this.label,
            required: this.required,
            showRequired: false,
            headingLevel: this.headingLevel,
            size: this.size,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
          fieldset: true,
        })}

        <div class="civ-income__fields">
          <div class="civ-income__amount">
            <civ-currency
              label="${amountLabel}"
              name="${this.name ? `${this.name}.amount` : 'amount'}"
              .value="${this._data.amount}"
              error="${this.amountError}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onSubInput('amount', e)}"
              @civ-change="${(e: CustomEvent) => this._onSubChange('amount', e)}"
            ></civ-currency>
          </div>
          <div class="civ-income__frequency">
            <civ-select
              label="${frequencyLabel}"
              name="${this.name ? `${this.name}.frequency` : 'frequency'}"
              .options="${this._frequencyOptions()}"
              .value="${this._data.frequency}"
              empty-label="${t('incomeFrequencyEmptyLabel')}"
              error="${this.frequencyError}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onSubInput('frequency', e)}"
              @civ-change="${(e: CustomEvent) => this._onSubChange('frequency', e)}"
            ></civ-select>
          </div>
        </div>
      </fieldset>
    `;
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_INCOME };
    this._resetCompound(['amountError', 'frequencyError']);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-income': CivIncome;
  }
}

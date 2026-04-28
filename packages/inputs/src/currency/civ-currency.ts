import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Currency
 *
 * Pre-configured text input for dollar amount entry with currency
 * masking (commas, 2 decimal places) and validation.
 *
 * @element civ-currency
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-currency')
export class CivCurrency extends PresetInputWrapper {
  override render() {
    const label = this.label || t('currencyLabel');
    const hint = this.hint || t('maskCurrencyHint');

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        mask="currency"
        validate="currency"
        inputmode="decimal"
        prefix="$"
        ?required="${this.required}"
        required-message="${this.requiredMessage || ''}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-text-input>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-currency': CivCurrency;
  }
}

// Preset wrapper — contract: packages/schema/src/components/civ-text-input.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Currency
 *
 * Pre-configured text input for dollar amount entry with currency
 * masking (commas, 2 decimal places) and validation. Government
 * forms with whole-dollar fields (W-4 line 4c, VA benefits) opt in
 * via `decimals="0"`; `min` / `max` enforce bounds inline so the
 * server doesn't reject submission for a value the form could have
 * caught at blur.
 *
 * @element civ-currency
 *
 * @prop {number} decimals - Decimal places to keep. `0` for whole dollars, `2` (default) for cents.
 * @prop {number} min - Minimum allowed amount. Defaults to undefined (no floor).
 * @prop {number} max - Maximum allowed amount. Defaults to undefined (no ceiling).
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-currency')
export class CivCurrency extends PresetInputWrapper {
  /**
   * Decimal places. `2` (default) for standard cents formatting
   * ("1,234.56"). `0` for whole-dollar mode ("1,234"): the input
   * rejects the decimal key, blur normalizes to integers, and the
   * display omits the `.00` suffix.
   */
  @property({ type: Number, attribute: 'decimals' }) decimals = 2;

  /** Minimum allowed dollar amount. Undefined = no floor. */
  @property({ type: Number, attribute: 'min' }) min?: number;

  /** Maximum allowed dollar amount. Undefined = no ceiling. */
  @property({ type: Number, attribute: 'max' }) max?: number;

  /**
   * Accept negative amounts. Defaults to false (currency validator
   * rejects values below zero). Set to true for refund / adjustment /
   * expense-report fields where a debit makes sense.
   */
  @property({ type: Boolean, attribute: 'allow-negative' }) allowNegative = false;

  override render() {
    const label = this.label || t('currencyLabel');
    const hint = this.hint || t('maskCurrencyHint');

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        width="${this.width}"
        placeholder="${this.placeholder || nothing}"
        hint="${hint}"
        error="${this.error}"
        mask="currency"
        validate="currency"
        inputmode="${this.decimals === 0 ? 'numeric' : 'decimal'}"
        prefix="$"
        decimals="${this.decimals}"
        min="${this.min ?? nothing}"
        max="${this.max ?? nothing}"
        ?allow-negative="${this.allowNegative}"
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

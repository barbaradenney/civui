import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Phone Number
 *
 * Pre-configured text input for phone number entry. Supports US
 * domestic (10-digit with mask) and international (E.164) formats.
 *
 * @element civ-phone
 *
 * @prop {boolean} international - Use E.164 international format instead of US domestic
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-phone')
export class CivPhone extends PresetInputWrapper {
  /** Use international phone format (E.164) instead of US domestic. */
  @property({ type: Boolean }) international = false;

  override render() {
    const label = this.label || t('phoneLabel');
    const mask = this.international ? '' : 'phone-us';
    const validate = this.international ? 'phoneIntl' : 'phone';
    const hint = this.hint || (this.international ? t('maskPhoneIntlHint') : t('maskPhoneUsHint'));

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        type="tel"
        mask="${mask || nothing}"
        validate="${validate}"
        autocomplete="tel"
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
    'civ-phone': CivPhone;
  }
}

import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Routing Number
 *
 * Pre-configured text input for bank routing number entry with
 * 9-digit mask, mod-10 checksum validation, and numeric keyboard.
 *
 * @element civ-routing-number
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-routing-number')
export class CivRoutingNumber extends PresetInputWrapper {
  override render() {
    const label = this.label || t('routingNumberLabel');
    const hint = this.hint || t('routingNumberHint');

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        validate="routing"
        inputmode="numeric"
        autocomplete="off"
        maxlength="9"
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
    'civ-routing-number': CivRoutingNumber;
  }
}

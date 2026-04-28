import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Employer Identification Number
 *
 * Pre-configured text input for EIN entry with masking, validation,
 * and PII protection.
 *
 * @element civ-ein
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-ein')
export class CivEin extends PresetInputWrapper {
  override render() {
    const label = this.label || t('einLabel');
    const hint = this.hint || t('maskEinHint');

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        mask="ein"
        validate="ein"
        inputmode="numeric"
        autocomplete="off"
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
    'civ-ein': CivEin;
  }
}

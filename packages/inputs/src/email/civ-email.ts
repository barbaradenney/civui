// Preset wrapper — contract: packages/schema/src/components/civ-text-input.schema.ts

import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Email Address
 *
 * Pre-configured text input for email entry with built-in validation
 * and autocomplete support.
 *
 * @element civ-email
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-email')
export class CivEmail extends PresetInputWrapper {
  override render() {
    const label = this.label || t('emailLabel');
    const hint = this.hint || t('emailHint');

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        width="${this.width}"
        placeholder="${this.placeholder || nothing}"
        hint="${hint}"
        error="${this.error}"
        type="email"
        validate="email"
        autocomplete="email"
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
    'civ-email': CivEmail;
  }
}

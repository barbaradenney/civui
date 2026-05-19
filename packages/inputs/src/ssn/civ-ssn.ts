// Preset wrapper — contract: packages/schema/src/components/civ-text-input.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../text-input/civ-text-input.js';

/**
 * CivUI Social Security Number
 *
 * Pre-configured text input for SSN entry. Handles masking, validation,
 * PII protection, and plain-language labeling automatically.
 *
 * @element civ-ssn
 *
 * @prop {string} mode - 'full' (default) for 9-digit SSN, 'last4' for last 4 digits only
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-ssn')
export class CivSsn extends PresetInputWrapper {
  /** Whether to collect the full SSN or just the last 4 digits. */
  @property({ type: String }) mode: 'full' | 'last4' = 'full';

  override render() {
    const label = this.label || (this.mode === 'last4' ? t('ssnLast4Label') : t('ssnLabel'));
    const mask = this.mode === 'last4' ? '' : 'ssn';
    const validate = this.mode === 'last4' ? '' : 'ssn';
    const hint = this.hint || (this.mode === 'last4' ? t('ssnLast4Hint') : t('maskSsnHint'));
    const maxlength = this.mode === 'last4' ? 4 : undefined;

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        width="${this.width}"
        placeholder="${this.placeholder || nothing}"
        hint="${hint}"
        error="${this.error}"
        mask="${mask || nothing}"
        validate="${validate || nothing}"
        inputmode="numeric"
        autocomplete="off"
        maxlength="${maxlength ?? nothing}"
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
    'civ-ssn': CivSsn;
  }
}

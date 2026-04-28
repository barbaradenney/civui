import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const DISCHARGE_TYPES = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General (under honorable conditions)' },
  { value: 'other-than-honorable', label: 'Other than honorable' },
  { value: 'bad-conduct', label: 'Bad conduct' },
  { value: 'dishonorable', label: 'Dishonorable' },
  { value: 'uncharacterized', label: 'Uncharacterized' },
];

/**
 * CivUI Discharge Type
 *
 * Pre-populated select for US military discharge types.
 *
 * @element civ-discharge-type
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Type of discharge" required>
 *   <civ-discharge-type name="discharge" required></civ-discharge-type>
 * </civ-form-field>
 * ```
 */
@customElement('civ-discharge-type')
export class CivDischargeType extends PresetInputWrapper {
  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
  }

  override render() {
    const label = this.label || t('dischargeTypeLabel');

    return html`
      <civ-select
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        error="${this.error}"
        hint="${this.hint}"
        ?required="${this.required}"
        required-message="${this.requiredMessage || ''}"
        ?disabled="${this.disabled}"
        data-discharge-type-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-discharge-type-select]') as any;
    if (!select) return;
    select.options = [...DISCHARGE_TYPES];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-discharge-type': CivDischargeType;
  }
}

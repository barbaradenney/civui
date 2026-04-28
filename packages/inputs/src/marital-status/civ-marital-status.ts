import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const MARITAL_STATUSES = [
  { value: 'never-married', label: 'Never married' },
  { value: 'married', label: 'Married' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

/**
 * CivUI Marital Status
 *
 * Pre-populated select for marital status, using standard
 * categories found on federal government forms.
 *
 * @element civ-marital-status
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Marital status" required>
 *   <civ-marital-status name="maritalStatus" required></civ-marital-status>
 * </civ-form-field>
 * ```
 */
@customElement('civ-marital-status')
export class CivMaritalStatus extends PresetInputWrapper {
  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
  }

  override render() {
    const label = this.label || t('maritalStatusLabel');

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
        data-marital-status-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-marital-status-select]') as any;
    if (!select) return;
    select.options = [...MARITAL_STATUSES];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-marital-status': CivMaritalStatus;
  }
}

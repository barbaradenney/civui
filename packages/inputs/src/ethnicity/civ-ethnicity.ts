import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const ETHNICITIES = [
  { value: 'hispanic-latino', label: 'Hispanic or Latino' },
  { value: 'not-hispanic-latino', label: 'Not Hispanic or Latino' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
];

/**
 * CivUI Ethnicity
 *
 * Pre-populated select for ethnicity using OMB (Office of Management
 * and Budget) categories required on federal forms.
 *
 * @element civ-ethnicity
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Ethnicity" required>
 *   <civ-ethnicity name="ethnicity" required></civ-ethnicity>
 * </civ-form-field>
 * ```
 */
@customElement('civ-ethnicity')
export class CivEthnicity extends PresetInputWrapper {
  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
  }

  override render() {
    const label = this.label || t('ethnicityLabel');

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
        data-ethnicity-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-ethnicity-select]') as any;
    if (!select) return;
    select.options = [...ETHNICITIES];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-ethnicity': CivEthnicity;
  }
}

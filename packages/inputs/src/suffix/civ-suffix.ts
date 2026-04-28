import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const SUFFIXES = [
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
  { value: 'V', label: 'V' },
];

/**
 * CivUI Suffix
 *
 * Pre-populated select for name suffixes (Jr., Sr., II, III, IV, V).
 *
 * @element civ-suffix
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Suffix">
 *   <civ-suffix name="suffix"></civ-suffix>
 * </civ-form-field>
 * ```
 */
@customElement('civ-suffix')
export class CivSuffix extends PresetInputWrapper {
  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
  }

  override render() {
    const label = this.label || t('suffixLabel');

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
        data-suffix-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-suffix-select]') as any;
    if (!select) return;
    select.options = [...SUFFIXES];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-suffix': CivSuffix;
  }
}

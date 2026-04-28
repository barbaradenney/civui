import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
  { value: 'other', label: 'Other' },
];

const BINARY_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

/**
 * CivUI Gender
 *
 * Pre-populated select for gender using categories common across
 * government forms. Supports a `format` prop to switch between
 * standard (all options) and binary (Male/Female only) modes.
 *
 * @element civ-gender
 *
 * @prop {'standard' | 'binary'} format - Option set to display (default: 'standard')
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Gender" required>
 *   <civ-gender name="gender" required></civ-gender>
 * </civ-form-field>
 * ```
 */
@customElement('civ-gender')
export class CivGender extends PresetInputWrapper {
  /** Option set to display: 'standard' (all options) or 'binary' (Male/Female only). */
  @property({ type: String }) format: 'standard' | 'binary' = 'standard';

  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('format')) {
      this._syncOptions();
    }
  }

  override render() {
    const label = this.label || t('genderLabel');

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
        data-gender-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-gender-select]') as any;
    if (!select) return;
    select.options = this.format === 'binary' ? [...BINARY_GENDERS] : [...GENDERS];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-gender': CivGender;
  }
}

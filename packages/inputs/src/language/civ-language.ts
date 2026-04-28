import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../select/civ-select.js';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Chinese' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ht', label: 'Haitian Creole' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'other', label: 'Other' },
];

/**
 * CivUI Language
 *
 * Pre-populated select for preferred language, using common
 * languages for US government services ordered by frequency
 * of use in government contexts.
 *
 * @element civ-language
 *
 * @fires civ-input - On value change, detail: { value: string }
 * @fires civ-change - On committed change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-form-field label="Preferred language" required>
 *   <civ-language name="language" required></civ-language>
 * </civ-form-field>
 * ```
 */
@customElement('civ-language')
export class CivLanguage extends PresetInputWrapper {
  override firstUpdated(): void {
    super.firstUpdated();
    this._syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
  }

  override render() {
    const label = this.label || t('languageLabel');

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
        data-language-select
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-select>
    `;
  }

  private _syncOptions(): void {
    const select = this.querySelector('[data-language-select]') as any;
    if (!select) return;
    select.options = [...LANGUAGES];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-language': CivLanguage;
  }
}

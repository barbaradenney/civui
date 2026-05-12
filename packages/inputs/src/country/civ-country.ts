import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatch, t } from '@civui/core';
import { PresetInputWrapper } from '../preset-input/preset-input-wrapper.js';
import '../combobox/civ-combobox.js';
import { COUNTRIES } from './countries.js';

/**
 * CivUI Country
 *
 * Pre-configured combobox for country selection with the full ISO 3166-1
 * country list. Supports filtering by typing, pinning United States to
 * the top, and include/exclude lists for specific use cases.
 *
 * Value is the ISO 3166-1 alpha-2 code (e.g., "US", "GB").
 *
 * @element civ-country
 *
 * @prop {boolean} us-first - Pin "United States" to the top of the list (default true)
 * @prop {string} include - Comma-separated ISO codes to include (filters to only these)
 * @prop {string} exclude - Comma-separated ISO codes to exclude
 *
 * @fires civ-input - On filter text change, detail: { value: string }
 * @fires civ-change - On selection, detail: { value: string, label: string }
 *
 * @example
 * ```html
 * <civ-country name="country" required></civ-country>
 * <civ-country name="country" us-first exclude="KP,IR,SY"></civ-country>
 * ```
 */
@customElement('civ-country')
export class CivCountry extends PresetInputWrapper {
  /** Pin United States to the top of the list. */
  @property({ type: Boolean, attribute: 'us-first' }) usFirst = true;

  /** Comma-separated ISO codes to include (show only these countries). */
  @property({ type: String }) include = '';

  /** Comma-separated ISO codes to exclude. */
  @property({ type: String }) exclude = '';

  private get _options() {
    let list = [...COUNTRIES];

    if (this.include) {
      const codes = new Set(this.include.split(',').map(c => c.trim().toUpperCase()));
      list = list.filter(c => codes.has(c.value));
    }

    if (this.exclude) {
      const codes = new Set(this.exclude.split(',').map(c => c.trim().toUpperCase()));
      list = list.filter(c => !codes.has(c.value));
    }

    if (this.usFirst) {
      const usIndex = list.findIndex(c => c.value === 'US');
      if (usIndex > 0) {
        const [us] = list.splice(usIndex, 1);
        list.unshift(us);
      }
    }

    return list;
  }

  override render() {
    const label = this.label || t('countryLabel');

    return html`
      <civ-combobox
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${this.hint}"
        error="${this.error}"
        .options="${this._options}"
        autocomplete="country-name"
        ?required="${this.required}"
        required-message="${this.requiredMessage || ''}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-combobox>
    `;
  }

  /**
   * Override only `_onChange` to preserve combobox's `{ value, label }`
   * detail shape. `_onInput` and `formResetCallback` come from
   * `PresetInputWrapper` unchanged.
   */
  protected override _onChange(e: CustomEvent<{ value: string; label?: string }>): void {
    e.stopPropagation();
    this.value = e.detail.value;
    dispatch(this, 'civ-change', { value: this.value, label: e.detail.label ?? '' });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-country': CivCountry;
  }
}

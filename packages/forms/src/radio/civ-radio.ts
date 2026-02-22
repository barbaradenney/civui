import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

/**
 * CivUI Radio
 *
 * Single radio button with optional tile variant and description.
 * Must be used within a civ-radio-group for mutual exclusivity.
 *
 * @element civ-radio
 *
 * @prop {string} label - Radio label text
 * @prop {string} value - Form submission value when selected
 * @prop {boolean} checked - Whether this radio is selected
 * @prop {string} description - Description text below the label
 * @prop {boolean} tile - Tile variant (bordered card style)
 * @prop {boolean} disabled - Whether the radio is disabled
 *
 * @fires civ-change - When selection changes (bubbles to radio-group), detail: { value }
 * @fires civ-input - When selection changes (input event), detail: { value }
 */
@customElement('civ-radio')
export class CivRadio extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) description = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) name = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Number, attribute: false }) managedTabIndex?: number;

  private _inputId = this.generateId('input');
  private _descriptionId = this.generateId('desc');

  private get _ariaDescribedBy(): string {
    return this.description ? this._descriptionId : '';
  }

  override render() {
    const wrapperClasses = this.tile
      ? [
          'civ-relative',
          'civ-border',
          'civ-rounded',
          'civ-p-4',
          this.checked ? 'civ-border-primary civ-bg-primary-lightest' : 'civ-border-base-light',
          this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : 'civ-cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    const inputClasses = [
      'civ-w-5',
      'civ-h-5',
      'civ-mr-2',
      'civ-align-middle',
      'civ-accent-primary',
      'focus-visible:civ-focus-ring',
      this.disabled ? 'civ-cursor-not-allowed' : 'civ-cursor-pointer',
    ].join(' ');

    const labelClasses = [
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      this.disabled ? 'civ-cursor-not-allowed' : 'civ-cursor-pointer',
    ].join(' ');

    return html`
      <div class="civ-mb-2 ${wrapperClasses}" data-civ-tile="${this.tile || nothing}">
        <div class="civ-flex civ-items-start">
          <input
            class="${inputClasses}"
            id="${this._inputId}"
            type="radio"
            name="${this.name}"
            .value="${this.value}"
            .checked="${this.checked}"
            ?disabled="${this.disabled}"
            tabindex="${this.managedTabIndex ?? nothing}"
            aria-checked="${this.checked ? 'true' : 'false'}"
            aria-required="${this.required}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            @change="${this._onRadioChange}"
          />
          <div>
            <label class="${labelClasses}" for="${this._inputId}">${this.label}</label>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-block civ-text-sm civ-text-base civ-mt-0.5">${this.description}</span>`
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private _onRadioChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      this.checked = true;
      dispatch(this, 'civ-input', { value: this.value });
      dispatch(this, 'civ-change', { value: this.value });
      this.sendAnalytics('change');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-radio': CivRadio;
  }
}

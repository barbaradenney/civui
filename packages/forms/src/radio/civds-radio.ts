import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsBaseElement } from '@civds/core';

/**
 * CivDS Radio
 *
 * Single radio button with optional tile variant and description.
 * Must be used within a civds-radio-group for mutual exclusivity.
 *
 * @element civds-radio
 *
 * @prop {string} label - Radio label text
 * @prop {string} value - Form submission value when selected
 * @prop {boolean} checked - Whether this radio is selected
 * @prop {string} description - Description text below the label
 * @prop {boolean} tile - Tile variant (bordered card style)
 * @prop {boolean} disabled - Whether the radio is disabled
 *
 * @fires civds-change - When selection changes (bubbles to radio-group)
 */
@customElement('civds-radio')
export class CivdsRadio extends CivdsBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) description = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) name = '';
  @property({ type: String }) error = '';

  private _inputId = this.generateId('input');
  private _descriptionId = this.generateId('desc');

  private get _ariaDescribedBy(): string {
    return this.description ? this._descriptionId : '';
  }

  override render() {
    const wrapperClasses = this.tile
      ? [
          'civds-relative',
          'civds-border',
          'civds-rounded',
          'civds-p-4',
          this.checked ? 'civds-border-primary civds-bg-primary-lightest' : 'civds-border-base-light',
          this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed' : 'civds-cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    const inputClasses = [
      'civds-w-5',
      'civds-h-5',
      'civds-mr-2',
      'civds-align-middle',
      'civds-accent-primary',
      'focus-visible:civds-focus-ring',
      this.disabled ? 'civds-cursor-not-allowed' : 'civds-cursor-pointer',
    ].join(' ');

    const labelClasses = [
      'civds-text-base',
      'civds-font-sans',
      'civds-text-base-darkest',
      this.disabled ? 'civds-cursor-not-allowed' : 'civds-cursor-pointer',
    ].join(' ');

    return html`
      <div class="civds-mb-2 ${wrapperClasses}" data-civds-tile="${this.tile || nothing}">
        <div class="civds-flex civds-items-start">
          <input
            class="${inputClasses}"
            id="${this._inputId}"
            type="radio"
            name="${this.name}"
            .value="${this.value}"
            .checked="${this.checked}"
            ?disabled="${this.disabled}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            @change="${this._onRadioChange}"
          />
          <div>
            <label class="${labelClasses}" for="${this._inputId}">${this.label}</label>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civds-block civds-text-sm civds-text-base civds-mt-0.5">${this.description}</span>`
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
      this.dispatchEvent(
        new CustomEvent('civds-change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
      this.sendAnalytics('change');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-radio': CivdsRadio;
  }
}

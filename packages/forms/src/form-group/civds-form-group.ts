import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsBaseElement } from '@civds/core';

/**
 * CivDS Form Group
 *
 * Wraps a form control with label, hint, and error message.
 * Use this when composing custom form layouts or wrapping
 * non-CivDS inputs with consistent styling.
 *
 * @element civds-form-group
 *
 * @prop {string} label - Label text
 * @prop {string} hint - Hint text below the label
 * @prop {string} error - Error message
 * @prop {string} inputId - ID of the associated input (for label `for` attribute)
 * @prop {boolean} required - Shows required indicator
 *
 * @slot - The form control to wrap
 */
@customElement('civds-form-group')
export class CivdsFormGroup extends CivdsBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'input-id' }) inputId = '';
  @property({ type: Boolean, reflect: true }) required = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override render() {
    return html`
      <div class="civds-mb-4">
        ${this.label
          ? html`
              <label
                class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base"
                for="${this.inputId || nothing}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-form-group': CivdsFormGroup;
  }
}

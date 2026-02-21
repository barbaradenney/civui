import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsBaseElement } from '@civds/core';

/**
 * CivDS Fieldset
 *
 * Structural wrapper using native `<fieldset>` and `<legend>`.
 * Groups related form controls with optional hint and error.
 *
 * @element civds-fieldset
 *
 * @prop {string} legend - Legend text for the fieldset
 * @prop {string} hint - Hint text below the legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} required - Shows required indicator on legend
 *
 * @slot - The form controls to group
 */
@customElement('civds-fieldset')
export class CivdsFieldset extends CivdsBaseElement {
  @property({ type: String }) legend = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset
        class="civds-border-0 civds-p-0 civds-m-0 civds-mb-4"
        aria-describedby="${describedBy || nothing}"
      >
        ${this.legend
          ? html`
              <legend class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-lg">
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-2 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-2 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <slot></slot>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-fieldset': CivdsFieldset;
  }
}

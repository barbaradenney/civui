import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Fieldset
 *
 * Structural wrapper using native `<fieldset>` and `<legend>`.
 * Groups related form controls with optional hint and error.
 *
 * @element civ-fieldset
 *
 * @prop {string} legend - Legend text for the fieldset
 * @prop {string} hint - Hint text below the legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} required - Shows required indicator on legend
 *
 * @slot - The form controls to group
 */
@customElement('civ-fieldset')
export class CivFieldset extends CivBaseElement {
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
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        aria-describedby="${describedBy || nothing}"
      >
        ${this.legend
          ? html`
              <legend class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-lg">
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <slot></slot>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-fieldset': CivFieldset;
  }
}

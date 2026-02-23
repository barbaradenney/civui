import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, renderLegend, renderHint, renderError } from '@civui/core';

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
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('error') && this.error) {
      this.announce(this.error, 'assertive');
    }
  }

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
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
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

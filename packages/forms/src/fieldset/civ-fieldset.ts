// Schema: packages/schema/src/components/civ-fieldset.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, renderLegend, renderHint, renderError } from '@civui/core';

/**
 * CivUI Fieldset
 *
 * Native fieldset wrapper with legend, hint, and error support.
 * Uses native <fieldset> for automatic disabled cascade to child form elements.
 *
 * In Light DOM, <slot> does not project children. This component
 * moves child elements into the rendered <fieldset> in updated()
 * so that native disabled cascade works correctly.
 *
 * @element civ-fieldset
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
  private _userChildren: Node[] = [];

  override connectedCallback(): void {
    this._userChildren = Array.from(this.childNodes);
    super.connectedCallback();
  }

  override firstUpdated(): void {
    const container = this.querySelector('[data-civ-fieldset-content]');
    if (container) {
      for (const child of this._userChildren) {
        container.appendChild(child);
      }
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
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-required="${this.required || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
        <div data-civ-fieldset-content></div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-fieldset': CivFieldset;
  }
}

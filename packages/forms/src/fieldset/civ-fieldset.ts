import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, renderLegend, renderHint, renderError } from '@civui/core';

/**
 * CivUI Fieldset
 *
 * Structural wrapper using native `<fieldset>` and `<legend>`.
 * Groups related form controls with optional hint and error.
 *
 * In Light DOM, `<slot>` does not project children. This component
 * moves child elements into the rendered `<fieldset>` in firstUpdated()
 * so that native disabled cascade works correctly.
 *
 * @element civ-fieldset
 *
 * @prop {string} legend - Legend text for the fieldset
 * @prop {string} hint - Hint text below the legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} required - Shows required indicator on legend
 * @prop {boolean} disabled - Disables all child form controls
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
  private _childrenMoved = false;

  override connectedCallback(): void {
    super.connectedCallback();
    // Reset so children are re-moved into the fieldset if the element is reconnected
    this._childrenMoved = false;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    // Error announcement handled by renderError()'s role="alert" — no manual announce needed.
    if (!this._childrenMoved) {
      this._moveChildrenIntoFieldset();
    }
  }

  private _moveChildrenIntoFieldset(): void {
    const fieldset = this.querySelector('fieldset');
    if (!fieldset) return;

    const contentContainer = fieldset.querySelector('[data-civ-fieldset-content]');
    if (!contentContainer) return;

    // Move all direct children of the host (that are not the fieldset itself)
    // into the content container inside the fieldset
    const children = Array.from(this.childNodes).filter(
      (node) => node !== fieldset && !(node instanceof Comment),
    );
    for (const child of children) {
      contentContainer.appendChild(child);
    }
    this._childrenMoved = true;
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

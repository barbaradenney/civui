import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

const FORM_INPUT_SELECTOR = 'input, select, textarea';

/**
 * CivUI Form Group
 *
 * Wraps a form control with label, hint, and error message.
 * Use this when composing custom form layouts or wrapping
 * non-CivUI inputs with consistent styling.
 *
 * @element civ-form-group
 *
 * @prop {string} label - Label text
 * @prop {string} hint - Hint text below the label
 * @prop {string} error - Error message
 * @prop {string} inputId - ID of the associated input (for label `for` attribute)
 * @prop {boolean} required - Shows required indicator
 *
 * @slot - The form control to wrap
 */
@customElement('civ-form-group')
export class CivFormGroup extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'input-id' }) inputId = '';
  @property({ type: Boolean, reflect: true }) required = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override updated(changed: Map<string, unknown>): void {
    this._wireAriaDescribedBy();
    if (changed.has('error') && this.error) {
      this.announce(this.error, 'assertive');
    }
  }

  private _wireAriaDescribedBy(): void {
    const ids = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    const input = this.querySelector(FORM_INPUT_SELECTOR) as HTMLElement | null;
    if (!input) return;

    if (ids) {
      input.setAttribute('aria-describedby', ids);
    } else {
      input.removeAttribute('aria-describedby');
    }
  }

  override render() {
    return html`
      <div class="civ-mb-4">
        ${this.label
          ? html`
              <label
                class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base"
                for="${this.inputId || nothing}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-group': CivFormGroup;
  }
}

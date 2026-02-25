import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, renderLabel, renderHint, renderError } from '@civui/core';

const FORM_INPUT_SELECTOR = 'input, select, textarea';

/**
 * CivUI Form Group
 *
 * Wraps a form control with label, hint, and error message.
 * Use this when composing custom form layouts or wrapping
 * non-CivUI inputs with consistent styling.
 *
 * ARIA attributes (aria-describedby, aria-invalid, aria-required) are
 * automatically wired to the **first** `input`, `select`, or `textarea`
 * found in the slot. For groups with multiple inputs (e.g., address
 * fields), use `<civ-fieldset>` instead.
 *
 * @element civ-form-group
 *
 * @prop {string} label - Label text
 * @prop {string} hint - Hint text below the label
 * @prop {string} error - Error message
 * @prop {string} inputId - ID of the associated input (for label `for` attribute)
 * @prop {boolean} required - Shows required indicator
 *
 * @slot - A single form control to wrap
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
    super.updated(changed);
    if (changed.has('hint') || changed.has('error') || changed.has('required')) {
      this._wireAriaDescribedBy();
    }
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

    if (this.error) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }

    if (this.required) {
      input.setAttribute('aria-required', 'true');
    } else {
      input.removeAttribute('aria-required');
    }
  }

  override render() {
    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this.inputId, required: this.required })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-group': CivFormGroup;
  }
}

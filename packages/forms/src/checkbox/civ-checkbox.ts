// Schema: packages/schema/src/components/civ-checkbox.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBooleanFormElement, dispatch, renderHint, renderError } from '@civui/core';

/**
 * CivUI Checkbox
 *
 * Accessible checkbox with inline label, optional description, and tile variant.
 * Uses ElementInternals for native form participation.
 *
 * @element civ-checkbox
 */
@customElement('civ-checkbox')
export class CivCheckbox extends CivBooleanFormElement {
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) tile = false;

  override render() {
    return html`
      <div class="civ-mb-2 ${this.tile ? 'civ-check-tile' : ''}" data-civ-tile="${this.tile ? '' : nothing}">
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <label class="civ-flex civ-items-start civ-cursor-pointer civ-w-full" for="${this._inputId}">
          <input
            class="civ-check-input focus-visible:civ-focus-ring"
            id="${this._inputId}"
            type="checkbox"
            name="${this.name}"
            .value="${this.value}"
            .checked="${this.checked}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            aria-required="${this.required || nothing}"
            aria-checked="${this.indeterminate ? 'mixed' : nothing}"
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            @change="${this._onCheckboxChange}"
          />
          <div class="civ-flex-1">
            <span class="civ-check-label">
              ${this.label}
              ${this.required
                ? html`<abbr class="civ-required-mark" title="required">*</abbr>`
                : nothing}
            </span>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
              : nothing}
          </div>
        </label>
      </div>
    `;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('indeterminate')) {
      const input = this.querySelector('input') as HTMLInputElement | null;
      if (input) input.indeterminate = this.indeterminate;
    }
  }

  private _onCheckboxChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;
    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });
    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });
    this.sendAnalytics('change', { checked: this.checked });
  }

  override formResetCallback(): void {
    super.formResetCallback();
    this.indeterminate = false;
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox': CivCheckbox;
  }
}

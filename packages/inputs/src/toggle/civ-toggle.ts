// Schema: packages/schema/src/components/civ-toggle.schema.ts

import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBooleanFormElement, dispatch, renderHint, renderError, t } from '@civui/core';

/**
 * CivUI Toggle
 *
 * Accessible toggle switch with inline label and optional description.
 * Uses button with role="switch" for screen reader compatibility.
 *
 * @element civ-toggle
 */
@customElement('civ-toggle')
export class CivToggle extends CivBooleanFormElement {
  protected override get _anchorSelector(): string { return 'button'; }

  override render() {
    return html`
      <div class="civ-mb-4">
        <div class="civ-flex civ-items-center civ-gap-3">
          <button
            type="button"
            role="switch"
            id="${this._inputId}"
            aria-checked="${this.checked ? 'true' : 'false'}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-disabled="${this.readonly || nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            ?disabled="${this.disabled}"
            @click="${this._onToggle}"
            class="civ-toggle-track"
          >
            <span class="civ-toggle-thumb ${this.checked ? 'civ-toggle-thumb--checked' : ''}">
              ${this.checked
                ? html`<civ-icon name="check" class="civ-toggle-check" aria-hidden="true"></civ-icon>`
                : nothing}
            </span>
          </button>
          <div>
            <label class="civ-check-label" for="${this._inputId}">
              ${this.label}
              ${this.required
                ? html`<span class="civ-required-mark">${t('required')}</span>`
                : nothing}
            </label>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
              : nothing}
            ${renderHint(this._hintId, this.hint)}
            ${renderError(this._errorId, this.error)}
          </div>
        </div>
      </div>
    `;
  }

  private _onToggle(): void {
    if (this.disabled || this.readonly) return;
    this.checked = !this.checked;
    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });
    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });
    this.sendAnalytics('change', { checked: this.checked });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-toggle': CivToggle;
  }
}

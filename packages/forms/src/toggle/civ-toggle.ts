// Schema: packages/schema/src/components/civ-toggle.schema.ts

import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBooleanFormElement, dispatch, renderHint, renderError } from '@civui/core';

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
    const thumbStyle = `inset-inline-start: ${this.checked ? '18px' : '2px'};`;

    return html`
      <div class="civ-mb-2">
        <div class="civ-flex civ-items-center civ-gap-3">
          <div>
            <label class="civ-check-label" for="${this._inputId}">
              ${this.label}
              ${this.required
                ? html`<abbr class="civ-required-mark" title="required">*</abbr>`
                : nothing}
            </label>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
              : nothing}
          </div>
          <button
            type="button"
            role="switch"
            id="${this._inputId}"
            aria-checked="${this.checked ? 'true' : 'false'}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            ?disabled="${this.disabled}"
            @click="${this._onToggle}"
            class="civ-toggle-track focus-visible:civ-focus-ring"
          >
            <span class="civ-toggle-thumb" style="${thumbStyle}"></span>
          </button>
        </div>
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
      </div>
    `;
  }

  private _onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    dispatch(this, 'civ-input', { checked: this.checked, value: this.value });
    dispatch(this, 'civ-change', { checked: this.checked, value: this.value });
    this.sendAnalytics('change', { checked: this.checked });
  }

  override formResetCallback(): void {
    super.formResetCallback();
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-toggle': CivToggle;
  }
}

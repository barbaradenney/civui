// Schema: packages/schema/src/components/civ-toggle.schema.ts

import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBooleanFormElement, devWarn, dispatch, renderHint, renderError, t } from '@civui/core';

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

  private _warnedMissingLabel = false;

  override render() {
    const ariaLabel = this.getAttribute('aria-label');
    if (!this.label && !ariaLabel && !this._warnedMissingLabel) {
      devWarn(
        'civ-toggle',
        'civ-toggle requires either `label` or `aria-label` so screen-reader users hear what the toggle is for. Without one, the control is unlabeled to AT.',
      );
      this._warnedMissingLabel = true;
    }
    const rowClass = this.error
      ? 'civ-flex civ-items-center civ-gap-3 civ-toggle-row--error'
      : 'civ-flex civ-items-center civ-gap-3';
    return html`
      <div class="civ-mb-4">
        ${renderError(this._errorId, this.error)}
        <div class="${rowClass}">
          <button
            type="button"
            role="switch"
            id="${this._inputId}"
            aria-checked="${this.checked ? 'true' : 'false'}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-readonly="${this.readonly || nothing}"
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
          <label class="civ-toggle-label-block" for="${this._inputId}">
            <span class="civ-check-label">
              ${this.label}
              ${this.required
                ? html`<span class="civ-required-mark">${t('required')}</span>`
                : nothing}
            </span>
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
              : nothing}
            ${renderHint(this._hintId, this.hint)}
          </label>
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

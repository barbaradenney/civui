// Schema: packages/schema/src/components/civ-checkbox.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBooleanFormElement, dispatch, forwardTileClick, renderHint, renderError, t } from '@civui/core';

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
  @property({ type: Boolean, reflect: true }) tile = true;

  override render() {
    return html`
      ${renderError(this._errorId, this.error)}
      <div class="${this.tile ? 'civ-check-tile' : 'civ-mb-2'}" data-civ-tile="${this.tile ? '' : nothing}" @click="${this.tile ? this._onTileClick : nothing}">
        <label class="civ-check-row civ-cursor-pointer civ-w-full" for="${this._inputId}">
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
            aria-invalid="${this.error ? 'true' : nothing}"
            aria-describedby="${this._ariaDescribedBy || nothing}"
            @change="${this._onCheckboxChange}"
          />
          <span class="civ-check-label">
            ${this.label}
            ${this.required
              ? html`<span class="civ-required-mark">${t('required')}</span>`
              : nothing}
            ${this.description
              ? html`<span id="${this._descriptionId}" class="civ-check-description">${this.description}</span>`
              : nothing}
            ${renderHint(this._hintId, this.hint)}
          </span>
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

  private _onTileClick = (e: Event) => forwardTileClick(this, e);

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
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-checkbox': CivCheckbox;
  }
}
